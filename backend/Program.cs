using System.Text.Json.Nodes;
using Backend.Models;
using Backend.OpenApi;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var pascalCaseJson = new JsonSerializerOptions { PropertyNamingPolicy = null };
var projectRoot = Directory.GetParent(builder.Environment.ContentRootPath)?.FullName
    ?? builder.Environment.ContentRootPath;
var frontendRoot = projectRoot;

LoadDotEnv(Path.Combine(builder.Environment.ContentRootPath, ".env"));
builder.Configuration.AddEnvironmentVariables();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Services.Configure<UploadOptions>(builder.Configuration.GetSection("Upload"));
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<TextToSpeechOptions>(builder.Configuration.GetSection("TextToSpeech"));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "IOC Đắk Lắk API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT nhận được từ API đăng nhập."
    });
    options.OperationFilter<AuthorizeOperationFilter>();
    options.TagActionsBy(description => [GetSwaggerTag(description.RelativePath)]);
    options.OrderActionsBy(description => description.RelativePath);
});

var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
var jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = jwtKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // Cho phép frontend tĩnh gọi API trong giai đoạn phát triển.
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddSingleton(GetNewsCategories());
builder.Services.AddSingleton<IPortalDataStore>(serviceProvider =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var provider = configuration["DataProvider"];

    // Cho phép chuyển nguồn dữ liệu bằng appsettings.json: "Json" để chạy nhanh, "SqlServer" để dùng database thật.
    if (string.Equals(provider, "SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        return new SqlServerPortalDataStore(configuration);
    }

    var environment = serviceProvider.GetRequiredService<IWebHostEnvironment>();
    return new JsonPortalDataStore(environment);
});
builder.Services.AddSingleton<JsonToSqlMigrationService>();
builder.Services.AddSingleton<AuthTokenService>();
builder.Services.AddHttpClient<AzureTextToSpeechService>();
builder.Services.AddTransient<EspeakTextToSpeechService>();
builder.Services.AddTransient<ITextToSpeechService>(serviceProvider =>
{
    var options = serviceProvider.GetRequiredService<IOptions<TextToSpeechOptions>>().Value;
    if (string.Equals(options.Provider, "Azure", StringComparison.OrdinalIgnoreCase) &&
        !string.IsNullOrWhiteSpace(options.AzureKey) &&
        !string.IsNullOrWhiteSpace(options.AzureRegion))
    {
        return serviceProvider.GetRequiredService<AzureTextToSpeechService>();
    }

    return serviceProvider.GetRequiredService<EspeakTextToSpeechService>();
});

var app = builder.Build();

if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("Swagger:Enabled"))
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "IOC Đắk Lắk API v1");
        options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
        options.DefaultModelsExpandDepth(-1);
        options.DisplayRequestDuration();
        options.EnableFilter();
    });
}

try
{
    var configuration = app.Services.GetRequiredService<IConfiguration>();
    if (string.Equals(configuration["DataProvider"], "SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrEmpty(connectionString))
        {
            using var connection = new Microsoft.Data.SqlClient.SqlConnection(connectionString);
            connection.Open();
            using var command = new Microsoft.Data.SqlClient.SqlCommand(@"
                IF NOT EXISTS (
                    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = 'Gov' AND TABLE_NAME = 'Documents' AND COLUMN_NAME = 'OriginalFileName'
                )
                BEGIN
                    ALTER TABLE Gov.Documents ADD OriginalFileName NVARCHAR(255) NULL;
                END;
                IF COL_LENGTH('Cms.Articles', 'ImageUrl') IS NOT NULL
                    ALTER TABLE Cms.Articles ALTER COLUMN ImageUrl NVARCHAR(MAX) NULL;
                IF COL_LENGTH('Cms.Articles', 'LinkUrl') IS NULL
                    ALTER TABLE Cms.Articles ADD LinkUrl NVARCHAR(1000) NULL;
                IF COL_LENGTH('Cms.Articles', 'LinkText') IS NULL
                    ALTER TABLE Cms.Articles ADD LinkText NVARCHAR(255) NULL;
                IF COL_LENGTH('Cms.Articles', 'VideoUrl') IS NULL
                    ALTER TABLE Cms.Articles ADD VideoUrl NVARCHAR(1000) NULL;
                IF COL_LENGTH('Cms.Articles', 'MultimediaType') IS NULL
                    ALTER TABLE Cms.Articles ADD MultimediaType VARCHAR(20) NULL;
                IF COL_LENGTH('Cms.Articles', 'AttachmentUrl') IS NULL
                    ALTER TABLE Cms.Articles ADD AttachmentUrl NVARCHAR(1000) NULL;
                IF COL_LENGTH('Cms.Articles', 'AttachmentName') IS NULL
                    ALTER TABLE Cms.Articles ADD AttachmentName NVARCHAR(255) NULL;
            ", connection);
            command.ExecuteNonQuery();
        }
    }
}
catch (Exception ex)
{
    app.Logger.LogWarning("Auto-migration failed: {Message}", ex.Message);
}

app.UseCors();
app.UseStaticFiles();
UseFrontendStaticFiles(app, frontendRoot);
app.UseAuthentication();
app.UseAuthorization();

MapFrontendRoutes(app, frontendRoot);

app.MapGet("/api", (IConfiguration configuration) =>
{
    return Results.Json(new
    {
        success = true,
        service = "IOC Daklak Backend API",
        environment = app.Environment.EnvironmentName,
        dataProvider = configuration["DataProvider"] ?? "Json",
        health = "/api/health",
        apiBase = "/api"
    });
});

app.MapGet("/api/health", (IConfiguration configuration) =>
{
    return Results.Json(new
    {
        success = true,
        status = "Healthy",
        service = "IOC Daklak Backend API",
        dataProvider = configuration["DataProvider"] ?? "Json",
        checkedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
    });
});

app.MapGet("/api/auth/me", (ClaimsPrincipal user) =>
{
    return Results.Json(new
    {
        success = true,
        username = user.Identity?.Name,
        userId = user.FindFirstValue(ClaimTypes.NameIdentifier),
        role = user.FindFirstValue(ClaimTypes.Role)
    });
}).RequireAuthorization();

app.MapGet("/api/trang-chu", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetHomePageAsync(cancellationToken));
});

app.MapGet("/api/thong-bao-chung", async (int? take, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetAnnouncementsAsync(take ?? 5, cancellationToken));
});

app.MapGet("/api/loai-van-ban", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetDocumentTypesAsync(cancellationToken));
});

app.MapGet("/api/van-ban/{id:int}", async (int id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var document = await store.GetDocumentByIdAsync(id, cancellationToken);
    if (document == null)
        return Results.NotFound(new { success = false, message = "Document not found" });
    return Results.Json(new { success = true, document });
});

app.MapGet("/api/van-ban", async (string? type, int? take, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetDocumentsAsync(type, take ?? 20, cancellationToken));
});

app.MapPost("/api/van-ban", async (DocumentDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var result = await store.AddDocumentAsync(payload, cancellationToken);
    return Results.Json(new { success = true, document = result });
}).RequireAuthorization("AdminOnly");

app.MapPut("/api/van-ban/{id:int}", async (int id, DocumentDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var result = await store.UpdateDocumentAsync(id, payload, cancellationToken);
    return Results.Json(new { success = true, document = result });
}).RequireAuthorization("AdminOnly");

app.MapDelete("/api/van-ban/{id:int}", async (int id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    await store.DeleteDocumentAsync(id, cancellationToken);
    return Results.Json(new { success = true });
}).RequireAuthorization("AdminOnly");

// --- Draft Opinions API ---
app.MapGet("/api/y-kien-du-thao", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(new { success = true, draftOpinions = await store.GetDraftOpinionsAsync(cancellationToken) });
});

app.MapGet("/api/y-kien-du-thao/{id:int}", async (int id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var draft = await store.GetDraftOpinionByIdAsync(id, cancellationToken);
    if (draft == null)
        return Results.NotFound(new { success = false, message = "Không tìm thấy dự thảo" });
    return Results.Json(new { success = true, draftOpinion = draft });
});

app.MapPost("/api/y-kien-du-thao", async (DraftOpinionDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var result = await store.AddDraftOpinionAsync(payload, cancellationToken);
    return Results.Json(new { success = true, draftOpinion = result });
}).RequireAuthorization("AdminOnly");

app.MapPut("/api/y-kien-du-thao/{id:int}", async (int id, DraftOpinionDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var result = await store.UpdateDraftOpinionAsync(id, payload, cancellationToken);
    return Results.Json(new { success = true, draftOpinion = result });
}).RequireAuthorization("AdminOnly");

app.MapDelete("/api/y-kien-du-thao/{id:int}", async (int id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    await store.DeleteDraftOpinionAsync(id, cancellationToken);
    return Results.Json(new { success = true });
}).RequireAuthorization("AdminOnly");

// --- Feedbacks API ---
app.MapGet("/api/y-kien-du-thao/{id:int}/gop-y", async (int id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(new { success = true, feedbacks = await store.GetFeedbacksAsync(id, cancellationToken) });
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/gop-y", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(new { success = true, feedbacks = await store.GetFeedbacksAsync(null, cancellationToken) });
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/y-kien-du-thao/{id:int}/gop-y", async (int id, OpinionFeedbackDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    payload.DraftOpinionId = id;
    var result = await store.AddFeedbackAsync(payload, cancellationToken);
    return Results.Json(new { success = true, feedback = result });
});

app.MapDelete("/api/gop-y/{id:int}", async (int id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    await store.DeleteFeedbackAsync(id, cancellationToken);
    return Results.Json(new { success = true });
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/tim-kiem", async (string? q, int? take, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(q))
    {
        return Results.BadRequest(new { success = false, message = "Vui lòng nhập từ khóa tìm kiếm." });
    }

    return Results.Json(new
    {
        success = true,
        keyword = q.Trim(),
        results = await store.SearchAsync(q, take ?? 20, cancellationToken)
    });
});

var contentPages = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
{
    ["chuc-nang-nhiem-vu"] = "Trang chức năng, nhiệm vụ",
    ["dau-moi-ho-tro"] = "Trang đầu mối hỗ trợ",
    ["lich-su-hinh-thanh"] = "Trang lịch sử hình thành",
    ["san-pham-tieu-bieu"] = "Trang sản phẩm tiêu biểu",
    ["so-do-to-chuc"] = "Trang sơ đồ tổ chức",
    ["co-cau-to-chuc"] = "Trang cơ cấu tổ chức"
};

app.MapGet("/api/cau-hinh", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetConfigAsync(cancellationToken));
});

app.MapPost("/api/cau-hinh", async (JsonObject config, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    await store.SaveConfigAsync(config, cancellationToken);
    return Results.Json(new { success = true, message = "Cấu hình đã được lưu." });
}).RequireAuthorization("AdminOnly");

foreach (var page in contentPages)
{
    var slug = page.Key;
    var label = page.Value;

    app.MapGet($"/api/{slug}", async (IPortalDataStore store, CancellationToken cancellationToken) =>
    {
        return Results.Json(await store.GetContentPageAsync(slug, cancellationToken));
    });

    app.MapPost($"/api/{slug}", async (ContentPageDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
    {
        await store.SaveContentPageAsync(slug, payload, cancellationToken);
        return Results.Json(new { success = true, message = $"{label} đã được lưu." });
    }).RequireAuthorization("AdminOnly");
}

var newsCategories = app.Services.GetRequiredService<IReadOnlyList<NewsCategoryInfo>>();
foreach (var category in newsCategories)
{
    app.MapGet($"/api/{category.Slug}", async (IPortalDataStore store, CancellationToken cancellationToken) =>
    {
        return Results.Json(await store.GetNewsCategoryAsync(category, cancellationToken));
    });

    app.MapPost($"/api/{category.Slug}", async (CategoryPageDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
    {
        await store.SaveNewsCategoryAsync(category, payload, cancellationToken);
        return Results.Json(new { success = true, message = $"Trang {category.Title} đã được lưu." });
    }).RequireAuthorization("AdminOnly");
}

app.MapGet("/api/tin-tuc", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetMainNewsAsync(cancellationToken));
});

// Giữ alias tiếng Anh vì một số file frontend cũ đang gọi /api/news.
app.MapGet("/api/news", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetMainNewsAsync(cancellationToken));
});

app.MapPost("/api/tin-tuc", async (NewsPostDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    await store.AddMainNewsAsync(payload, cancellationToken);
    return Results.Json(new { success = true, message = "Đăng tin thành công." });
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/admin/migrate-json", async (
    JsonToSqlMigrationService migrationService,
    IConfiguration configuration,
    CancellationToken cancellationToken) =>
{
    if (!string.Equals(configuration["DataProvider"], "SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        return (IResult)Results.BadRequest(new
        {
            success = false,
            message = "Chỉ chạy migrate JSON khi DataProvider đang là SqlServer."
        });
    }

    var report = await migrationService.MigrateAsync(cancellationToken);
    return (IResult)Results.Json(new { success = true, message = "Migrate JSON sang SQL Server hoàn tất.", report });
}).RequireAuthorization("AdminOnly");

app.MapPost("/api/upload", async (
    HttpContext context,
    IWebHostEnvironment environment,
    IOptions<UploadOptions> uploadOptions,
    CancellationToken cancellationToken) =>
{
    if (!context.Request.HasFormContentType || !context.Request.Form.Files.Any())
    {
        return Results.BadRequest(new { success = false, message = "Không tìm thấy file." });
    }

    var file = context.Request.Form.Files[0];
    var options = uploadOptions.Value;
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

    if (!options.AllowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { success = false, message = "Định dạng file không được hỗ trợ." });
    }

    if (file.Length <= 0 || file.Length > options.MaxFileSizeBytes)
    {
        return Results.BadRequest(new { success = false, message = "Dung lượng file không hợp lệ." });
    }

    var webRootPath = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
    var uploadsDir = Path.Combine(webRootPath, "uploads");
    Directory.CreateDirectory(uploadsDir);

    // Sinh tên file mới để tránh ghi đè và tránh tin vào tên file người dùng gửi lên.
    var fileName = $"{Guid.NewGuid():N}{extension}";
    var filePath = Path.Combine(uploadsDir, fileName);

    await using var stream = new FileStream(filePath, FileMode.CreateNew);
    await file.CopyToAsync(stream, cancellationToken);

    var uploadedUrl = $"/uploads/{fileName}";
    return Results.Json(new { success = true, url = uploadedUrl, fileUrl = uploadedUrl });
}).RequireAuthorization();

app.MapGet("/api/download", (string file, string? name, IWebHostEnvironment environment) =>
{
    if (string.IsNullOrWhiteSpace(file))
    {
        return Results.BadRequest(new { success = false, message = "Thiếu tên file." });
    }

    var safeFileName = Path.GetFileName(file);
    if (string.IsNullOrWhiteSpace(safeFileName))
    {
        return Results.BadRequest(new { success = false, message = "Tên file không hợp lệ." });
    }

    var webRootPath = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
    var allowedDirectories = new[]
    {
        Path.Combine(webRootPath, "uploads"),
        Path.Combine(webRootPath, "documents")
    };

    foreach (var directory in allowedDirectories)
    {
        var rootPath = Path.GetFullPath(directory);
        var filePath = Path.GetFullPath(Path.Combine(rootPath, safeFileName));
        if (!filePath.StartsWith(rootPath, StringComparison.OrdinalIgnoreCase) || !System.IO.File.Exists(filePath))
        {
            continue;
        }

        var downloadName = string.IsNullOrWhiteSpace(name) ? safeFileName : Path.GetFileName(name);
        return Results.File(filePath, "application/octet-stream", downloadName);
    }

    var fallbackName = string.IsNullOrWhiteSpace(name) ? safeFileName : Path.GetFileName(name);
    var fallbackPdf = CreatePlaceholderPdf(safeFileName);
    return Results.File(fallbackPdf, "application/pdf", fallbackName);
});

app.MapPost("/api/text-to-speech", async (
    TextToSpeechRequestDto payload,
    ITextToSpeechService textToSpeechService,
    CancellationToken cancellationToken) =>
{
    var result = await textToSpeechService.SynthesizeAsync(payload, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(result)
        : Results.BadRequest(result);
});

app.MapGet("/api/text-to-speech/content-page/{slug}", async (
    string slug,
    IPortalDataStore store,
    ITextToSpeechService textToSpeechService,
    CancellationToken cancellationToken) =>
{
    if (!contentPages.ContainsKey(slug))
    {
        return Results.NotFound(TextToSpeechResponseDto.Fail("Khong tim thay trang noi dung."));
    }

    var page = await store.GetContentPageAsync(slug, cancellationToken);
    var result = await textToSpeechService.SynthesizeAsync(new TextToSpeechRequestDto
    {
        Text = $"{page.Title}. {page.Content}"
    }, cancellationToken);

    return result.Success
        ? (IResult)Results.Json(result)
        : Results.BadRequest(result);
});

app.MapGet("/api/text-to-speech/news-category/{slug}", async (
    string slug,
    IPortalDataStore store,
    ITextToSpeechService textToSpeechService,
    CancellationToken cancellationToken) =>
{
    var category = newsCategories.FirstOrDefault(item => string.Equals(item.Slug, slug, StringComparison.OrdinalIgnoreCase));
    if (category is null)
    {
        return Results.NotFound(TextToSpeechResponseDto.Fail("Khong tim thay chuyen muc tin tuc."));
    }

    var page = await store.GetNewsCategoryAsync(category, cancellationToken);
    var posts = page.Posts
        .OrderByDescending(post => DateTime.TryParse(post.CreatedAt, out var date) ? date : DateTime.MinValue)
        .Select(post => $"{post.Title}. {post.Content}");

    var result = await textToSpeechService.SynthesizeAsync(new TextToSpeechRequestDto
    {
        Text = $"{page.Title}. {string.Join(" ", posts)}"
    }, cancellationToken);

    return result.Success
        ? (IResult)Results.Json(result)
        : Results.BadRequest(result);
});

app.MapGet("/api/faq", async (IPortalDataStore store, CancellationToken cancellationToken) =>
    Results.Json(await store.GetFaqsAsync(cancellationToken)));

app.MapPost("/api/faq", async (FaqRequestDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
    Results.Json(await store.SaveFaqAsync(null, new FaqDto { Question = payload.Question, Answer = payload.Answer, Order = payload.Order }, cancellationToken)))
    .RequireAuthorization("AdminOnly");

app.MapPut("/api/faq/{id:int}", async (int id, FaqRequestDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
    Results.Json(await store.SaveFaqAsync(id, new FaqDto { Id = id, Question = payload.Question, Answer = payload.Answer, Order = payload.Order }, cancellationToken)))
    .RequireAuthorization("AdminOnly");

app.MapDelete("/api/faq/{id:int}", async (int id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    await store.DeleteFaqAsync(id, cancellationToken);
    return Results.Json(new { success = true });
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/cau-hoi-nguoi-dan", async (bool? publicOnly, IPortalDataStore store, CancellationToken cancellationToken) =>
    Results.Json(await store.GetUserQuestionsAsync(publicOnly ?? true, cancellationToken)));

app.MapPost("/api/cau-hoi-nguoi-dan", async (UserQuestionRequestDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
    Results.Json(await store.AddUserQuestionAsync(new UserQuestionDto
    {
        Topic = payload.Topic, Title = payload.Title, SenderName = payload.SenderName,
        SenderEmail = payload.SenderEmail, SenderPhone = payload.SenderPhone,
        Address = payload.Address, Content = payload.Content
    }, cancellationToken)));

app.MapGet("/api/admin/cau-hoi-nguoi-dan", async (IPortalDataStore store, CancellationToken cancellationToken) =>
    Results.Json(await store.GetUserQuestionsAsync(false, cancellationToken)))
    .RequireAuthorization("AdminOnly");

app.MapPut("/api/admin/cau-hoi-nguoi-dan/{id:int}", async (int id, UserQuestionReplyRequestDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
    Results.Json(await store.UpdateUserQuestionAsync(id, new UserQuestionDto
    {
        Id = id, Answer = payload.Answer, IsPublic = payload.IsPublic, Status = "answered"
    }, cancellationToken)))
    .RequireAuthorization("AdminOnly");

app.MapDelete("/api/admin/cau-hoi-nguoi-dan/{id:int}", async (int id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    await store.DeleteUserQuestionAsync(id, cancellationToken);
    return Results.Json(new { success = true });
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/nguoi-dung", async (IPortalDataStore store, CancellationToken cancellationToken) =>
{
    return Results.Json(await store.GetUsersAsync(cancellationToken));
}).RequireAuthorization("AdminOnly");

app.MapGet("/api/nguoi-dung/{username}", async (string username, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var user = await store.GetUserAsync(username, cancellationToken);
    return user is null
        ? (IResult)Results.NotFound(new { success = false, message = "Không tìm thấy người dùng." })
        : Results.Json(new { success = true, user });
});

app.MapPut("/api/nguoi-dung/{username}", async (string username, UserDto payload, IPortalDataStore store, ClaimsPrincipal user, CancellationToken cancellationToken) =>
{
    var currentUsername = user.Identity?.Name;
    var isAdmin = user.IsInRole("Admin");
    if (!isAdmin && !string.Equals(currentUsername, username, StringComparison.OrdinalIgnoreCase))
    {
        return Results.Forbid();
    }

    var result = await store.UpdateUserAsync(username, payload, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(new { success = true, message = result.Message, user = result.User })
        : Results.NotFound(new { success = false, message = result.Message });
}).RequireAuthorization();

app.MapPost("/api/register", async (RegisterRequestDto payload, IPortalDataStore store, AuthTokenService tokenService, CancellationToken cancellationToken) =>
{
    var result = await store.RegisterAsync(new UserDto
    {
        Username = payload.Username, Password = payload.Password, FullName = payload.FullName,
        Email = payload.Email, DateOfBirth = payload.DateOfBirth, AvatarUrl = payload.AvatarUrl,
        Role = "User", IsActive = true
    }, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(tokenService.CreateAuthResponse(result.User!, result.Message))
        : Results.BadRequest(new { success = false, message = result.Message });
});

app.MapPost("/api/login", async (LoginRequestDto payload, IPortalDataStore store, AuthTokenService tokenService, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(payload.Username) || string.IsNullOrWhiteSpace(payload.Password))
    {
        return Results.BadRequest(new { success = false, message = "Vui lòng nhập tên đăng nhập và mật khẩu." });
    }

    var user = await store.LoginAsync(payload.Username, payload.Password, cancellationToken);
    return user is null
        ? (IResult)Results.Json(new { success = false, message = "Sai tên đăng nhập hoặc mật khẩu." }, statusCode: StatusCodes.Status401Unauthorized)
        : Results.Json(tokenService.CreateAuthResponse(user, "Đăng nhập thành công."));
});

app.MapGet("/api/binh-luan", async (string pageId, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    // API bình luận cũ trả PascalCase, frontend hiện tại đang đọc trực tiếp các field này.
    return Results.Json(await store.GetCommentsAsync(pageId, cancellationToken), pascalCaseJson);
});

app.MapPost("/api/binh-luan", async (CommentRequestDto payload, IPortalDataStore store, ClaimsPrincipal principal, CancellationToken cancellationToken) =>
{
    var comment = await store.AddCommentAsync(new CommentDto
    {
        PageId = payload.PageId,
        Content = payload.Content,
        Username = principal.Identity?.Name ?? string.Empty
    }, cancellationToken);
    return Results.Json(new { success = true, message = "Đã gửi bình luận.", comment });
}).RequireAuthorization();

app.MapPost("/api/binh-luan/{id}/like", async (string id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var likes = await store.VoteCommentAsync(id, isLike: true, cancellationToken);
    return likes is null
        ? (IResult)Results.NotFound(new { success = false, message = "Không tìm thấy bình luận." })
        : Results.Json(new { success = true, likes });
}).RequireAuthorization();

app.MapPost("/api/binh-luan/{id}/dislike", async (string id, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var dislikes = await store.VoteCommentAsync(id, isLike: false, cancellationToken);
    return dislikes is null
        ? (IResult)Results.NotFound(new { success = false, message = "Không tìm thấy bình luận." })
        : Results.Json(new { success = true, dislikes });
}).RequireAuthorization();

app.MapDelete("/api/binh-luan/{id}", async (string id, IPortalDataStore store, ClaimsPrincipal principal, CancellationToken cancellationToken) =>
{
    var username = principal.Identity?.Name ?? string.Empty;
    var deleted = await store.DeleteCommentAsync(id, username, principal.IsInRole("Admin"), cancellationToken);
    return deleted
        ? Results.Json(new { success = true, message = "Đã xóa bình luận." })
        : Results.Json(new { success = false, message = "Không tìm thấy bình luận hoặc bạn không có quyền xóa." }, statusCode: StatusCodes.Status404NotFound);
}).RequireAuthorization();

app.MapPost("/api/admin/nguoi-dung", async (UserDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var result = await store.AdminSaveUserAsync(null, payload, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(new { success = true, message = result.Message })
        : Results.BadRequest(new { success = false, message = result.Message });
}).RequireAuthorization("AdminOnly");

app.MapPut("/api/admin/nguoi-dung/{username}", async (string username, UserDto payload, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var result = await store.AdminSaveUserAsync(username, payload, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(new { success = true, message = result.Message })
        : Results.NotFound(new { success = false, message = result.Message });
}).RequireAuthorization("AdminOnly");

app.MapDelete("/api/admin/nguoi-dung/{username}", async (string username, IPortalDataStore store, CancellationToken cancellationToken) =>
{
    var result = await store.AdminDeleteUserAsync(username, cancellationToken);
    return result.Success
        ? (IResult)Results.Json(new { success = true, message = result.Message })
        : Results.Json(new { success = false, message = result.Message }, statusCode: username.Equals("admin", StringComparison.OrdinalIgnoreCase) ? StatusCodes.Status403Forbidden : StatusCodes.Status404NotFound);
}).RequireAuthorization("AdminOnly");

using (var scope = app.Services.CreateScope())
{
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var cStr = config.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrEmpty(cStr))
    {
        try {
            using var conn = new Microsoft.Data.SqlClient.SqlConnection(cStr);
            conn.Open();
            var cols = new[] { "EffectiveDate", "Domain", "Signer" };
            foreach (var col in cols) {
                try {
                    using var cmd = new Microsoft.Data.SqlClient.SqlCommand($"ALTER TABLE Gov.Documents ADD {col} NVARCHAR(150) NULL;", conn);
                    cmd.ExecuteNonQuery();
                } catch { } // Ignore if exists
            }
        } catch { } // Ignore if connection fails at this point
    }
}

app.Run();

static void UseFrontendStaticFiles(WebApplication app, string frontendRoot)
{
    var publicFolders = new[] { "admin", "auth", "profile", "shared", "user" };

    foreach (var folder in publicFolders)
    {
        var folderPath = Path.Combine(frontendRoot, folder);
        if (!Directory.Exists(folderPath))
        {
            continue;
        }

        // Chỉ public các thư mục frontend cần thiết, tránh vô tình lộ cấu hình backend/database.
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(folderPath),
            RequestPath = $"/{folder}"
        });
    }
}

static void MapFrontendRoutes(WebApplication app, string frontendRoot)
{
    var routes = GetFrontendRoutes();

    foreach (var route in routes)
    {
        var localRoute = route;
        app.MapGet(localRoute.Url, () => ServeFrontendPage(frontendRoot, localRoute.FilePath));
    }

    app.MapGet("/api/site-map", () => Results.Json(routes.Select(route => new
    {
        route.Url,
        route.FilePath,
        route.Area,
        route.Title
    })));
}

static IResult ServeFrontendPage(string frontendRoot, string relativePath)
{
    var fullPath = Path.GetFullPath(Path.Combine(frontendRoot, relativePath));
    var rootPath = Path.GetFullPath(frontendRoot);

    if (!fullPath.StartsWith(rootPath, StringComparison.OrdinalIgnoreCase) || !System.IO.File.Exists(fullPath))
    {
        return Results.NotFound(new { success = false, message = "Không tìm thấy trang frontend." });
    }

    return Results.File(fullPath, "text/html; charset=utf-8");
}

static IReadOnlyList<FrontendRouteInfo> GetFrontendRoutes()
{
    return
    [
        new("/", "user/trang-chu/trang-chu.html", "user", "Trang chủ"),
        new("/trang-chu", "user/trang-chu/trang-chu.html", "user", "Trang chủ"),

        new("/admin", "admin/quan-tri.html", "admin", "Quản trị"),
        new("/admin/quan-tri", "admin/quan-tri.html", "admin", "Quản trị"),
        new("/quan-tri", "admin/quan-tri.html", "admin", "Quản trị"),

        new("/auth", "auth/xac-thuc.html", "auth", "Xác thực"),
        new("/dang-nhap", "auth/xac-thuc.html", "auth", "Đăng nhập"),
        new("/dang-ky", "auth/xac-thuc.html", "auth", "Đăng ký"),

        new("/profile", "profile/ho-so.html", "profile", "Hồ sơ cá nhân"),
        new("/ho-so", "profile/ho-so.html", "profile", "Hồ sơ cá nhân"),

        new("/gioi-thieu/chuc-nang-nhiem-vu", "user/gioi-thieu/chuc-nang-nhiem-vu.html", "user", "Chức năng, nhiệm vụ"),
        new("/gioi-thieu/dau-moi-ho-tro", "user/gioi-thieu/dau-moi-ho-tro.html", "user", "Đầu mối hỗ trợ"),
        new("/gioi-thieu/lich-su-hinh-thanh", "user/gioi-thieu/lich-su-hinh-thanh.html", "user", "Lịch sử hình thành"),
        new("/gioi-thieu/san-pham-tieu-bieu", "user/gioi-thieu/san-pham-tieu-bieu.html", "user", "Sản phẩm tiêu biểu"),
        new("/gioi-thieu/so-do-to-chuc", "user/gioi-thieu/so-do-to-chuc.html", "user", "Sơ đồ tổ chức"),
        new("/gioi-thieu/co-cau-to-chuc", "user/gioi-thieu/co-cau-to-chuc.html", "user", "Cơ cấu tổ chức"),
        new("/co-cau-to-chuc", "user/gioi-thieu/co-cau-to-chuc.html", "user", "Cơ cấu tổ chức"),

        new("/tin-tuc/cap-nhat-bao-lu", "user/tin-tuc/cap-nhat-bao-lu.html", "user", "Cập nhật bão lũ"),
        new("/tin-tuc/cds-doi-moi-sang-tao", "user/tin-tuc/cds-doi-moi-sang-tao.html", "user", "CĐS - Đổi mới sáng tạo"),
        new("/tin-tuc/thong-bao", "user/tin-tuc/thong-bao.html", "user", "Thông báo"),
        new("/tin-tuc/tin-hoat-dong", "user/tin-tuc/tin-hoat-dong.html", "user", "Tin hoạt động"),

        new("/chuyen-muc-khac/chi-dao-dieu-hanh", "user/chuyen-muc-khac/chi-dao-dieu-hanh.html", "user", "Chỉ đạo điều hành"),
        new("/chuyen-muc-khac/cong-tac-xay-dung-dang", "user/chuyen-muc-khac/cong-tac-xay-dung-dang.html", "user", "Công tác xây dựng Đảng"),
        new("/chuyen-muc-khac/tieu-chuan-chat-luong", "user/chuyen-muc-khac/tieu-chuan-chat-luong.html", "user", "Tiêu chuẩn - Chất lượng"),
        new("/chuyen-muc-khac/trao-doi-kinh-nghiem", "user/chuyen-muc-khac/trao-doi-kinh-nghiem.html", "user", "Trao đổi kinh nghiệm"),
        new("/chuyen-muc-khac/tuong-tac-cong-dan", "user/chuyen-muc-khac/tuong-tac-cong-dan.html", "user", "Tương tác công dân"),

        new("/giai-phap/giai-phap-an-toan-mang", "user/tin-tuc/giai-phap-an-toan-mang.html", "user", "Giải pháp An toàn mạng"),
        new("/giai-phap/giai-phap-an-toan-thong-tin", "user/tin-tuc/giai-phap-an-toan-thong-tin.html", "user", "Giải pháp An toàn thông tin")
    ];
}

static IReadOnlyList<NewsCategoryInfo> GetNewsCategories()
{
    return
    [
        new() { Slug = "cap-nhat-bao-lu", Title = "Cập nhật bão lũ" },
        new() { Slug = "cds-doi-moi-sang-tao", Title = "CĐS - Đổi mới sáng tạo" },
        new() { Slug = "chi-dao-dieu-hanh", Title = "Chỉ đạo điều hành" },
        new() { Slug = "cong-tac-xay-dung-dang", Title = "Công tác xây dựng Đảng" },
        new() { Slug = "giai-phap-an-toan-mang", Title = "Giải pháp An toàn mạng" },
        new() { Slug = "giai-phap-an-toan-thong-tin", Title = "Giải pháp An toàn thông tin" },
        new() { Slug = "thong-bao", Title = "Thông báo" },
        new() { Slug = "tieu-chuan-chat-luong", Title = "Tiêu chuẩn - Chất lượng" },
        new() { Slug = "tin-hoat-dong", Title = "Tin hoạt động" },
        new() { Slug = "trao-doi-kinh-nghiem", Title = "Trao đổi kinh nghiệm" },
        new() { Slug = "tuong-tac-cong-dan", Title = "Tương tác công dân" },
        new() { Slug = "tin-tuc-da-phuong-tien", Title = "Tin tức đa phương tiện" }
    ];
}

static string GetSwaggerTag(string? relativePath)
{
    var path = (relativePath ?? string.Empty).Split('?', 2)[0].Trim('/').ToLowerInvariant();
    if (path.StartsWith("api/admin/nguoi-dung") || path.StartsWith("api/nguoi-dung") || path is "api/login" or "api/register") return "01. Xác thực & người dùng";
    if (path.StartsWith("api/tin-tuc")) return "02. Tin tức";
    if (path.StartsWith("api/van-ban") || path.StartsWith("api/loai-van-ban")) return "03. Văn bản";
    if (path.StartsWith("api/y-kien-du-thao") || path.StartsWith("api/gop-y")) return "04. Ý kiến dự thảo";
    if (path.StartsWith("api/faq") || path.Contains("cau-hoi-nguoi-dan")) return "05. Hỏi đáp";
    if (path.StartsWith("api/binh-luan")) return "06. Bình luận";
    if (path.StartsWith("api/upload")) return "07. Tệp tin";
    if (path.Contains("text-to-speech")) return "08. Đọc nội dung";
    if (path.StartsWith("api/trang-chu") || path.StartsWith("api/thong-bao-chung")) return "09. Trang chủ";
    if (path.StartsWith("api/tim-kiem")) return "10. Tìm kiếm";
    if (path.StartsWith("api/admin") || path.StartsWith("api/config")) return "11. Quản trị";
    if (path.StartsWith("api/")) return "12. Khác";
    return "Frontend";
}

static void LoadDotEnv(string filePath)
{
    if (!System.IO.File.Exists(filePath))
    {
        return;
    }

    foreach (var rawLine in System.IO.File.ReadAllLines(filePath))
    {
        var line = rawLine.Trim();
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#'))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim().Trim('"');
        if (!string.IsNullOrWhiteSpace(key))
        {
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

static byte[] CreatePlaceholderPdf(string fileName)
{
    var lines = new[]
    {
        "IOC Dak Lak",
        "Tai lieu mau",
        $"File goc chua duoc upload: {SanitizePdfText(fileName)}",
        "Vui long upload file that vao backend/wwwroot/documents hoac backend/wwwroot/uploads."
    };

    var content = new StringBuilder();
    content.AppendLine("BT");
    content.AppendLine("/F1 14 Tf");
    content.AppendLine("72 760 Td");
    foreach (var line in lines)
    {
        content.AppendLine($"({EscapePdfText(line)}) Tj");
        content.AppendLine("0 -24 Td");
    }
    content.AppendLine("ET");

    var objects = new[]
    {
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        $"<< /Length {Encoding.ASCII.GetByteCount(content.ToString())} >>\nstream\n{content}endstream"
    };

    using var stream = new MemoryStream();
    WriteAscii(stream, "%PDF-1.4\n");
    var offsets = new List<long> { 0 };

    for (var i = 0; i < objects.Length; i++)
    {
        offsets.Add(stream.Position);
        WriteAscii(stream, $"{i + 1} 0 obj\n{objects[i]}\nendobj\n");
    }

    var xrefOffset = stream.Position;
    WriteAscii(stream, $"xref\n0 {objects.Length + 1}\n");
    WriteAscii(stream, "0000000000 65535 f \n");
    foreach (var offset in offsets.Skip(1))
    {
        WriteAscii(stream, $"{offset:0000000000} 00000 n \n");
    }
    WriteAscii(stream, $"trailer\n<< /Size {objects.Length + 1} /Root 1 0 R >>\nstartxref\n{xrefOffset}\n%%EOF\n");

    return stream.ToArray();
}

static string SanitizePdfText(string value)
{
    return string.Concat(value.Where(ch => ch >= 32 && ch <= 126));
}

static string EscapePdfText(string value)
{
    return value.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
}

static void WriteAscii(Stream stream, string value)
{
    var bytes = Encoding.ASCII.GetBytes(value);
    stream.Write(bytes, 0, bytes.Length);
}

public sealed record FrontendRouteInfo(string Url, string FilePath, string Area, string Title);
