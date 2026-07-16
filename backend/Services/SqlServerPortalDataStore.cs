using System.Data;
using System.Globalization;
using System.Text.Json.Nodes;
using Backend.Models;
using Microsoft.Data.SqlClient;

namespace Backend.Services;

public sealed class SqlServerPortalDataStore : IPortalDataStore
{
    private readonly string _connectionString;

    public SqlServerPortalDataStore(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Thiếu ConnectionStrings:DefaultConnection.");
    }

    public async Task<JsonObject> GetConfigAsync(CancellationToken cancellationToken)
    {
        var config = new JsonObject();
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("SELECT ConfigKey, ConfigValue FROM Portal.SystemConfigs", connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            var key = reader.GetString(0);
            var rawValue = reader.IsDBNull(1) ? "null" : reader.GetString(1);
            config[key] = ParseConfigValue(rawValue);
        }

        return config;
    }

    public async Task SaveConfigAsync(JsonObject config, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        foreach (var item in config)
        {
            var rawValue = item.Value?.ToJsonString() ?? "null";
            await using var command = new SqlCommand("""
                MERGE Portal.SystemConfigs AS target
                USING (SELECT @ConfigKey AS ConfigKey, @ConfigValue AS ConfigValue) AS source
                ON target.ConfigKey = source.ConfigKey
                WHEN MATCHED THEN
                    UPDATE SET ConfigValue = source.ConfigValue, UpdatedAt = SYSUTCDATETIME()
                WHEN NOT MATCHED THEN
                    INSERT (ConfigKey, ConfigValue, UpdatedAt)
                    VALUES (source.ConfigKey, source.ConfigValue, SYSUTCDATETIME());
                """, connection);

            command.Parameters.AddWithValue("@ConfigKey", item.Key);
            command.Parameters.AddWithValue("@ConfigValue", rawValue);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
    }

    public async Task<ContentPageDto> GetContentPageAsync(string slug, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("""
            SELECT TOP (1) Title, Content
            FROM Portal.ContentPages
            WHERE Slug = @Slug AND IsDeleted = 0
            """, connection);
        command.Parameters.AddWithValue("@Slug", slug);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return new ContentPageDto();
        }

        return new ContentPageDto
        {
            Title = reader.IsDBNull(0) ? string.Empty : reader.GetString(0),
            Content = reader.IsDBNull(1) ? string.Empty : reader.GetString(1)
        };
    }

    public async Task SaveContentPageAsync(string slug, ContentPageDto page, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("""
            MERGE Portal.ContentPages AS target
            USING (SELECT @Slug AS Slug, @Title AS Title, @Content AS Content) AS source
            ON target.Slug = source.Slug
            WHEN MATCHED THEN
                UPDATE SET Title = source.Title, Content = source.Content, UpdatedAt = SYSUTCDATETIME(), IsDeleted = 0, DeletedAt = NULL
            WHEN NOT MATCHED THEN
                INSERT (Slug, Title, Content, CreatedAt)
                VALUES (source.Slug, source.Title, source.Content, SYSUTCDATETIME());
            """, connection);

        command.Parameters.AddWithValue("@Slug", slug);
        command.Parameters.AddWithValue("@Title", EmptyIfNull(page.Title));
        command.Parameters.AddWithValue("@Content", EmptyIfNull(page.Content));
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task<CategoryPageDto> GetNewsCategoryAsync(NewsCategoryInfo category, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        var categoryId = await EnsureCategoryAsync(connection, category, cancellationToken);
        var page = new CategoryPageDto { Title = category.Title };

        await using var command = new SqlCommand("""
            SELECT Id, Title, ImageUrl, Source, Content, CreatedAt, LegacyId
            FROM Cms.Articles
            WHERE CategoryId = @CategoryId AND IsDeleted = 0
            ORDER BY COALESCE(PublishedAt, CreatedAt) DESC
            """, connection);
        command.Parameters.AddWithValue("@CategoryId", categoryId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            page.Posts.Add(new NewsPostDto
            {
                Id = reader.IsDBNull(6) ? reader.GetInt32(0).ToString(CultureInfo.InvariantCulture) : reader.GetString(6),
                Title = reader.GetString(1),
                ImageUrl = reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
                Source = reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
                Content = reader.GetString(4),
                CreatedAt = FormatDateTime(reader.GetDateTime(5))
            });
        }

        return page;
    }

    public async Task SaveNewsCategoryAsync(NewsCategoryInfo category, CategoryPageDto page, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        var categoryId = await EnsureCategoryAsync(connection, category, cancellationToken);

        // Frontend gửi cả danh sách bài viết của chuyên mục, nên ta soft-delete bản cũ rồi insert lại bản mới.
        await using (var deleteCommand = new SqlCommand("""
            UPDATE Cms.Articles
            SET IsDeleted = 1, DeletedAt = SYSUTCDATETIME()
            WHERE CategoryId = @CategoryId AND IsDeleted = 0
            """, connection))
        {
            deleteCommand.Parameters.AddWithValue("@CategoryId", categoryId);
            await deleteCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        foreach (var post in page.Posts)
        {
            await InsertArticleAsync(connection, categoryId, post, isFeatured: false, cancellationToken);
        }
    }

    public async Task<List<NewsPostDto>> GetMainNewsAsync(CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("""
            SELECT TOP (50) Id, Title, ImageUrl, Source, Content, CreatedAt, LegacyId
            FROM Cms.Articles
            WHERE IsFeatured = 1 AND IsDeleted = 0 AND IsActive = 1
            ORDER BY COALESCE(PublishedAt, CreatedAt) DESC
            """, connection);

        var posts = new List<NewsPostDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            posts.Add(new NewsPostDto
            {
                Id = reader.IsDBNull(6) ? reader.GetInt32(0).ToString(CultureInfo.InvariantCulture) : reader.GetString(6),
                Title = reader.GetString(1),
                ImageUrl = reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
                Source = reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
                Content = reader.GetString(4),
                CreatedAt = FormatDateTime(reader.GetDateTime(5))
            });
        }

        return posts;
    }

    public async Task AddMainNewsAsync(NewsPostDto post, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        var categoryId = await EnsureCategoryAsync(connection, new NewsCategoryInfo { Slug = "tin-noi-bat", Title = "Tin nổi bật" }, cancellationToken);

        if (!string.IsNullOrWhiteSpace(post.Id) && await HasColumnAsync(connection, "Cms", "Articles", "LegacyId", cancellationToken))
        {
            await using var existsCommand = new SqlCommand("""
                SELECT COUNT(1)
                FROM Cms.Articles
                WHERE LegacyId = @LegacyId AND IsDeleted = 0
                """, connection);
            existsCommand.Parameters.AddWithValue("@LegacyId", post.Id);
            var existingCount = Convert.ToInt32(await existsCommand.ExecuteScalarAsync(cancellationToken), CultureInfo.InvariantCulture);
            if (existingCount > 0)
            {
                return;
            }
        }

        await InsertArticleAsync(connection, categoryId, post, isFeatured: true, cancellationToken);
    }

    public async Task<List<UserDto>> GetUsersAsync(CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        var roleColumn = await HasUserRoleColumnAsync(connection, cancellationToken) ? ", Role" : string.Empty;
        await using var command = new SqlCommand($"""
            SELECT Id, Username, FullName, Email, DateOfBirth, AvatarUrl, CreatedAt, IsActive{roleColumn}
            FROM Auth.Users
            WHERE IsDeleted = 0
            ORDER BY CreatedAt DESC
            """, connection);

        var users = new List<UserDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            users.Add(ReadSafeUser(reader));
        }

        return users;
    }

    public async Task<UserDto?> GetUserAsync(string username, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = await BuildUserCommandAsync(connection, username, includePassword: false, requireActive: false, cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadSafeUser(reader) : null;
    }

    public async Task<UserDto?> LoginAsync(string username, string password, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = await BuildUserCommandAsync(connection, username, includePassword: true, requireActive: true, cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var passwordHash = reader.GetString(reader.GetOrdinal("PasswordHash"));
        return PasswordService.VerifyPassword(password, passwordHash) ? ReadSafeUser(reader) : null;
    }

    public async Task<(bool Success, string Message, UserDto? User)> RegisterAsync(UserDto user, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        if (await UserExistsAsync(connection, user.Username, cancellationToken))
        {
            return (false, "Tên đăng nhập đã tồn tại.", null);
        }

        await InsertUserAsync(connection, user, string.IsNullOrWhiteSpace(user.Password) ? "123456" : user.Password, cancellationToken);
        var saved = await GetUserAsync(user.Username!, cancellationToken);
        return (true, "Đăng ký thành công.", saved);
    }

    public async Task<(bool Success, string Message, UserDto? User)> UpdateUserAsync(string username, UserDto user, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        if (!await UserExistsAsync(connection, username, cancellationToken))
        {
            return (false, "Không tìm thấy người dùng.", null);
        }

        await using var command = new SqlCommand("""
            UPDATE Auth.Users
            SET FullName = @FullName,
                Email = @Email,
                DateOfBirth = @DateOfBirth,
                AvatarUrl = @AvatarUrl,
                PasswordHash = COALESCE(@PasswordHash, PasswordHash),
                UpdatedAt = SYSUTCDATETIME()
            WHERE Username = @Username AND IsDeleted = 0
            """, connection);

        command.Parameters.AddWithValue("@Username", username);
        command.Parameters.AddWithValue("@FullName", DbValue(user.FullName));
        command.Parameters.AddWithValue("@Email", DbValue(user.Email));
        command.Parameters.AddWithValue("@DateOfBirth", DateValue(user.DateOfBirth));
        command.Parameters.AddWithValue("@AvatarUrl", DbValue(user.AvatarUrl));
        command.Parameters.AddWithValue("@PasswordHash", string.IsNullOrWhiteSpace(user.Password) ? DBNull.Value : PasswordService.HashPassword(user.Password));
        await command.ExecuteNonQueryAsync(cancellationToken);

        return (true, "Cập nhật thành công.", await GetUserAsync(username, cancellationToken));
    }

    public async Task<(bool Success, string Message)> AdminSaveUserAsync(string? username, UserDto user, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(username))
        {
            if (await UserExistsAsync(connection, user.Username, cancellationToken))
            {
                return (false, "Tên đăng nhập đã tồn tại.");
            }

            await InsertUserAsync(connection, user, string.IsNullOrWhiteSpace(user.Password) ? "123456" : user.Password, cancellationToken);
            return (true, "Thêm tài khoản thành công.");
        }

        if (!await UserExistsAsync(connection, username, cancellationToken))
        {
            return (false, "Không tìm thấy người dùng.");
        }

        if (string.Equals(username, "admin", StringComparison.OrdinalIgnoreCase) &&
            (!user.IsActive || AuthTokenService.NormalizeRole(user.Role) != "Admin"))
        {
            return (false, "Không thể hạ quyền hoặc khóa tài khoản admin gốc.");
        }

        var hasRole = await HasUserRoleColumnAsync(connection, cancellationToken);
        var setRole = hasRole ? ", Role = @Role" : string.Empty;
        await using var command = new SqlCommand($"""
            UPDATE Auth.Users
            SET FullName = @FullName,
                Email = @Email,
                IsActive = @IsActive,
                PasswordHash = COALESCE(@PasswordHash, PasswordHash),
                UpdatedAt = SYSUTCDATETIME()
                {setRole}
            WHERE Username = @Username AND IsDeleted = 0
            """, connection);

        command.Parameters.AddWithValue("@Username", username);
        command.Parameters.AddWithValue("@FullName", DbValue(user.FullName));
        command.Parameters.AddWithValue("@Email", DbValue(user.Email));
        command.Parameters.AddWithValue("@IsActive", user.IsActive);
        command.Parameters.AddWithValue("@PasswordHash", string.IsNullOrWhiteSpace(user.Password) ? DBNull.Value : PasswordService.HashPassword(user.Password));
        if (hasRole)
        {
            command.Parameters.AddWithValue("@Role", AuthTokenService.NormalizeRole(user.Role));
        }
        await command.ExecuteNonQueryAsync(cancellationToken);
        return (true, "Cập nhật tài khoản thành công.");
    }

    public async Task<(bool Success, string Message)> AdminDeleteUserAsync(string username, CancellationToken cancellationToken)
    {
        if (string.Equals(username, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return (false, "Không thể xóa tài khoản admin gốc.");
        }

        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("""
            UPDATE Auth.Users
            SET IsDeleted = 1, DeletedAt = SYSUTCDATETIME()
            WHERE Username = @Username AND IsDeleted = 0
            """, connection);
        command.Parameters.AddWithValue("@Username", username);
        var affected = await command.ExecuteNonQueryAsync(cancellationToken);
        return affected == 0 ? (false, "Không tìm thấy người dùng.") : (true, "Đã xóa tài khoản.");
    }

    public async Task<List<CommentDto>> GetCommentsAsync(string pageId, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("""
            SELECT c.Id, c.PageId, u.Username, c.Content, c.Likes, c.Dislikes, u.AvatarUrl, c.CreatedAt
            FROM Cms.Comments c
            INNER JOIN Auth.Users u ON u.Id = c.UserId
            WHERE c.PageId = @PageId AND c.IsDeleted = 0
            ORDER BY c.CreatedAt DESC
            """, connection);
        command.Parameters.AddWithValue("@PageId", pageId);

        var comments = new List<CommentDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            comments.Add(new CommentDto
            {
                Id = reader.GetInt32(0).ToString(CultureInfo.InvariantCulture),
                PageId = reader.GetString(1),
                Username = reader.GetString(2),
                Content = reader.GetString(3),
                Likes = reader.GetInt32(4),
                Dislikes = reader.GetInt32(5),
                AvatarUrl = reader.IsDBNull(6) ? string.Empty : reader.GetString(6),
                CreatedAt = FormatDateTime(reader.GetDateTime(7))
            });
        }

        return comments;
    }

    public async Task<CommentDto> AddCommentAsync(CommentDto comment, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        var userId = await GetUserIdAsync(connection, comment.Username, cancellationToken)
            ?? throw new InvalidOperationException("Không tìm thấy người dùng để ghi bình luận.");

        await using var command = new SqlCommand("""
            INSERT INTO Cms.Comments (PageId, UserId, Content, Likes, Dislikes, CreatedAt)
            OUTPUT INSERTED.Id
            VALUES (@PageId, @UserId, @Content, 0, 0, SYSUTCDATETIME())
            """, connection);
        command.Parameters.AddWithValue("@PageId", EmptyIfNull(comment.PageId));
        command.Parameters.AddWithValue("@UserId", userId);
        command.Parameters.AddWithValue("@Content", EmptyIfNull(comment.Content));
        var id = (int)await command.ExecuteScalarAsync(cancellationToken);

        var saved = (await GetCommentsAsync(comment.PageId ?? string.Empty, cancellationToken))
            .First(c => c.Id == id.ToString(CultureInfo.InvariantCulture));
        return saved;
    }

    public async Task<int?> VoteCommentAsync(string id, bool isLike, CancellationToken cancellationToken)
    {
        if (!int.TryParse(id, out var commentId))
        {
            return null;
        }

        await using var connection = await OpenConnectionAsync(cancellationToken);
        var column = isLike ? "Likes" : "Dislikes";
        await using var command = new SqlCommand($"""
            UPDATE Cms.Comments
            SET {column} = {column} + 1, UpdatedAt = SYSUTCDATETIME()
            OUTPUT INSERTED.{column}
            WHERE Id = @Id AND IsDeleted = 0
            """, connection);
        command.Parameters.AddWithValue("@Id", commentId);
        var value = await command.ExecuteScalarAsync(cancellationToken);
        return value is null ? null : Convert.ToInt32(value, CultureInfo.InvariantCulture);
    }

    public async Task<List<AnnouncementDto>> GetAnnouncementsAsync(int take, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("""
            SELECT TOP (@Take) Id, Title, Content, Url, PublishedAt
            FROM Gov.Announcements
            WHERE IsActive = 1 AND IsDeleted = 0
            ORDER BY PublishedAt DESC, CreatedAt DESC
            """, connection);
        command.Parameters.Add("@Take", SqlDbType.Int).Value = Math.Clamp(take, 1, 50);

        var announcements = new List<AnnouncementDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            announcements.Add(new AnnouncementDto
            {
                Id = reader.GetInt32(0),
                Title = reader.GetString(1),
                Content = reader.IsDBNull(2) ? null : reader.GetString(2),
                Url = reader.IsDBNull(3) ? "#" : reader.GetString(3),
                PublishedAt = FormatDateTime(reader.GetDateTime(4))
            });
        }

        return announcements;
    }

    public async Task<List<DocumentTypeDto>> GetDocumentTypesAsync(CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("""
            SELECT Id, Code, Name, DisplayOrder
            FROM Gov.DocumentTypes
            WHERE IsActive = 1
            ORDER BY DisplayOrder, Id
            """, connection);

        var types = new List<DocumentTypeDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            types.Add(new DocumentTypeDto
            {
                Id = reader.GetInt32(0),
                Code = reader.GetString(1),
                Name = reader.GetString(2),
                DisplayOrder = reader.GetInt32(3)
            });
        }
        return types;
    }

    public async Task<DocumentDto> AddDocumentAsync(DocumentDto document, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        
        // Lookup DocumentTypeId by TypeCode
        int typeId = 1;
        if (!string.IsNullOrWhiteSpace(document.TypeCode))
        {
            await using var cmdType = new SqlCommand("SELECT Id, Name FROM Gov.DocumentTypes WHERE Code = @Code", connection);
            cmdType.Parameters.Add("@Code", SqlDbType.VarChar, 50).Value = document.TypeCode;
            await using var reader = await cmdType.ExecuteReaderAsync(cancellationToken);
            if (await reader.ReadAsync(cancellationToken))
            {
                typeId = reader.GetInt32(0);
                document.TypeName = reader.GetString(1);
            }
            await reader.CloseAsync();
        }

        DateTime? publishedAt = null;
        if (DateTime.TryParseExact(document.PublishedAt, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d))
        {
            publishedAt = d;
        }
        else if (DateTime.TryParseExact(document.PublishedAt, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out d))
        {
            publishedAt = d;
        }

        await using var command = new SqlCommand("""
            INSERT INTO Gov.Documents (DocumentTypeId, DocumentNumber, PublishedAt, Title, FileUrl, OriginalFileName, IssuingAuthority, EffectiveDate, Domain, Signer, IsActive, IsDeleted, CreatedAt)
            OUTPUT INSERTED.Id
            VALUES (@DocumentTypeId, @DocumentNumber, @PublishedAt, @Title, @FileUrl, @OriginalFileName, @IssuingAuthority, @EffectiveDate, @Domain, @Signer, 1, 0, GETDATE());
            """, connection);

        command.Parameters.Add("@DocumentTypeId", SqlDbType.Int).Value = typeId;
        command.Parameters.Add("@DocumentNumber", SqlDbType.NVarChar, 50).Value = (object?)document.DocumentNumber ?? DBNull.Value;
        command.Parameters.Add("@PublishedAt", SqlDbType.Date).Value = (object?)publishedAt ?? DBNull.Value;
        command.Parameters.Add("@Title", SqlDbType.NVarChar, 500).Value = document.Title ?? "";
        command.Parameters.Add("@FileUrl", SqlDbType.NVarChar, 1000).Value = (object?)document.FileUrl ?? DBNull.Value;
        command.Parameters.Add("@OriginalFileName", SqlDbType.NVarChar, 255).Value = (object?)document.OriginalFileName ?? DBNull.Value;
        command.Parameters.Add("@IssuingAuthority", SqlDbType.NVarChar, 255).Value = (object?)document.IssuingAuthority ?? DBNull.Value;
        command.Parameters.Add("@EffectiveDate", SqlDbType.NVarChar, 50).Value = (object?)document.EffectiveDate ?? DBNull.Value;
        command.Parameters.Add("@Domain", SqlDbType.NVarChar, 150).Value = (object?)document.Domain ?? DBNull.Value;
        command.Parameters.Add("@Signer", SqlDbType.NVarChar, 150).Value = (object?)document.Signer ?? DBNull.Value;

        var newId = (int)(await command.ExecuteScalarAsync(cancellationToken))!;
        document.Id = newId;

        return document;
    }

    public async Task<DocumentDto> UpdateDocumentAsync(int id, DocumentDto document, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        
        int? typeId = null;
        if (!string.IsNullOrWhiteSpace(document.TypeCode))
        {
            await using var cmdType = new SqlCommand("SELECT Id, Name FROM Gov.DocumentTypes WHERE Code = @Code", connection);
            cmdType.Parameters.Add("@Code", SqlDbType.VarChar, 50).Value = document.TypeCode;
            await using var reader = await cmdType.ExecuteReaderAsync(cancellationToken);
            if (await reader.ReadAsync(cancellationToken))
            {
                typeId = reader.GetInt32(0);
                document.TypeName = reader.GetString(1);
            }
            await reader.CloseAsync();
        }

        DateTime? publishedAt = null;
        if (DateTime.TryParseExact(document.PublishedAt, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d))
        {
            publishedAt = d;
        }
        else if (DateTime.TryParseExact(document.PublishedAt, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out d))
        {
            publishedAt = d;
        }

        await using var command = new SqlCommand("""
            UPDATE Gov.Documents
            SET DocumentTypeId = ISNULL(@DocumentTypeId, DocumentTypeId),
                DocumentNumber = @DocumentNumber,
                PublishedAt = @PublishedAt,
                Title = @Title,
                FileUrl = @FileUrl,
                OriginalFileName = @OriginalFileName,
                IssuingAuthority = @IssuingAuthority,
                EffectiveDate = @EffectiveDate,
                Domain = @Domain,
                Signer = @Signer,
                UpdatedAt = GETDATE()
            WHERE Id = @Id AND IsDeleted = 0
            """, connection);

        command.Parameters.Add("@Id", SqlDbType.Int).Value = id;
        command.Parameters.Add("@DocumentTypeId", SqlDbType.Int).Value = (object?)typeId ?? DBNull.Value;
        command.Parameters.Add("@DocumentNumber", SqlDbType.NVarChar, 50).Value = (object?)document.DocumentNumber ?? DBNull.Value;
        command.Parameters.Add("@PublishedAt", SqlDbType.Date).Value = (object?)publishedAt ?? DBNull.Value;
        command.Parameters.Add("@Title", SqlDbType.NVarChar, 500).Value = document.Title ?? "";
        command.Parameters.Add("@FileUrl", SqlDbType.NVarChar, 1000).Value = (object?)document.FileUrl ?? DBNull.Value;
        command.Parameters.Add("@OriginalFileName", SqlDbType.NVarChar, 255).Value = (object?)document.OriginalFileName ?? DBNull.Value;
        command.Parameters.Add("@IssuingAuthority", SqlDbType.NVarChar, 255).Value = (object?)document.IssuingAuthority ?? DBNull.Value;
        command.Parameters.Add("@EffectiveDate", SqlDbType.NVarChar, 50).Value = (object?)document.EffectiveDate ?? DBNull.Value;
        command.Parameters.Add("@Domain", SqlDbType.NVarChar, 150).Value = (object?)document.Domain ?? DBNull.Value;
        command.Parameters.Add("@Signer", SqlDbType.NVarChar, 150).Value = (object?)document.Signer ?? DBNull.Value;

        await command.ExecuteNonQueryAsync(cancellationToken);
        document.Id = id;
        return document;
    }

    public async Task DeleteDocumentAsync(int id, CancellationToken cancellationToken = default)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("UPDATE Gov.Documents SET IsDeleted = 1, UpdatedAt = GETDATE() WHERE Id = @Id", connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = id;
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task<DocumentDto?> GetDocumentByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("""
            SELECT 
                d.Id,
                t.Code,
                t.Name,
                d.DocumentNumber,
                d.PublishedAt,
                d.Title,
                d.FileUrl,
                d.OriginalFileName,
                d.IssuingAuthority,
                d.EffectiveDate,
                d.Domain,
                d.Signer
            FROM Gov.Documents d
            INNER JOIN Gov.DocumentTypes t ON t.Id = d.DocumentTypeId
            WHERE d.Id = @Id AND d.IsActive = 1 AND d.IsDeleted = 0
            """, connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = id;

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (await reader.ReadAsync(cancellationToken))
        {
            return ReadDocument(reader);
        }
        return null;
    }

    public async Task<List<DocumentDto>> GetDocumentsAsync(string? typeCode, int take, CancellationToken cancellationToken)
    {
        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("""
            SELECT TOP (@Take)
                d.Id,
                t.Code,
                t.Name,
                d.DocumentNumber,
                d.PublishedAt,
                d.Title,
                d.FileUrl,
                d.OriginalFileName,
                d.IssuingAuthority,
                d.EffectiveDate,
                d.Domain,
                d.Signer
            FROM Gov.Documents d
            INNER JOIN Gov.DocumentTypes t ON t.Id = d.DocumentTypeId
            WHERE d.IsActive = 1
              AND d.IsDeleted = 0
              AND (@TypeCode IS NULL OR t.Code = @TypeCode)
            ORDER BY d.PublishedAt DESC, d.CreatedAt DESC
            """, connection);
        command.Parameters.Add("@Take", SqlDbType.Int).Value = Math.Clamp(take, 1, 100);
        command.Parameters.Add("@TypeCode", SqlDbType.VarChar, 50).Value = string.IsNullOrWhiteSpace(typeCode) ? DBNull.Value : typeCode.Trim();

        var documents = new List<DocumentDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            documents.Add(ReadDocument(reader));
        }

        return documents;
    }

    public async Task<List<SearchResultDto>> SearchAsync(string keyword, int take, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            return [];
        }

        await using var connection = await OpenConnectionAsync(cancellationToken);
        await using var command = new SqlCommand("""
            SELECT TOP (@Take) [Type], Title, Summary, Url, PublishedAt
            FROM (
                SELECT
                    N'Bài viết' AS [Type],
                    a.Title,
                    COALESCE(NULLIF(a.Summary, N''), LEFT(REPLACE(REPLACE(a.Content, '<', ' <'), '>', '> '), 220)) AS Summary,
                    CONCAT('/user/tin-tuc/', c.Code, '.html') AS Url,
                    COALESCE(a.PublishedAt, a.CreatedAt) AS PublishedAt
                FROM Cms.Articles a
                INNER JOIN Cms.ArticleCategories c ON c.Id = a.CategoryId
                WHERE a.IsActive = 1
                  AND a.IsDeleted = 0
                  AND (a.Title LIKE @Keyword OR a.Summary LIKE @Keyword OR a.Content LIKE @Keyword)

                UNION ALL

                SELECT
                    N'Trang nội dung' AS [Type],
                    p.Title,
                    LEFT(REPLACE(REPLACE(p.Content, '<', ' <'), '>', '> '), 220) AS Summary,
                    CONCAT('/user/gioi-thieu/', p.Slug, '.html') AS Url,
                    COALESCE(p.UpdatedAt, p.CreatedAt) AS PublishedAt
                FROM Portal.ContentPages p
                WHERE p.IsDeleted = 0
                  AND (p.Title LIKE @Keyword OR p.Content LIKE @Keyword)

                UNION ALL

                SELECT
                    N'Thông báo' AS [Type],
                    n.Title,
                    LEFT(COALESCE(n.Content, N''), 220) AS Summary,
                    COALESCE(NULLIF(n.Url, ''), '#') AS Url,
                    n.PublishedAt
                FROM Gov.Announcements n
                WHERE n.IsActive = 1
                  AND n.IsDeleted = 0
                  AND (n.Title LIKE @Keyword OR n.Content LIKE @Keyword)

                UNION ALL

                SELECT
                    N'Văn bản' AS [Type],
                    d.Title,
                    CONCAT(d.DocumentNumber, N' - ', COALESCE(d.IssuingAuthority, N'')) AS Summary,
                    d.FileUrl AS Url,
                    d.PublishedAt
                FROM Gov.Documents d
                WHERE d.IsActive = 1
                  AND d.IsDeleted = 0
                  AND (d.Title LIKE @Keyword OR d.DocumentNumber LIKE @Keyword OR d.IssuingAuthority LIKE @Keyword)
            ) results
            ORDER BY PublishedAt DESC
            """, connection);

        command.Parameters.Add("@Take", SqlDbType.Int).Value = Math.Clamp(take, 1, 50);
        command.Parameters.Add("@Keyword", SqlDbType.NVarChar, 550).Value = $"%{keyword.Trim()}%";

        var results = new List<SearchResultDto>();
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            results.Add(new SearchResultDto
            {
                Type = reader.GetString(0),
                Title = reader.GetString(1),
                Summary = reader.IsDBNull(2) ? null : reader.GetString(2),
                Url = reader.IsDBNull(3) ? "#" : reader.GetString(3),
                PublishedAt = reader.IsDBNull(4) ? null : FormatDateTime(reader.GetDateTime(4))
            });
        }

        return results;
    }

    public async Task<HomePageDto> GetHomePageAsync(CancellationToken cancellationToken)
    {
        return new HomePageDto
        {
            Config = await GetConfigAsync(cancellationToken),
            FeaturedNews = await GetMainNewsAsync(cancellationToken),
            Announcements = await GetAnnouncementsAsync(5, cancellationToken),
            DocumentTypes = await GetDocumentTypesAsync(cancellationToken),
            Documents = await GetDocumentsAsync(null, 20, cancellationToken)
        };
    }

    private async Task<SqlConnection> OpenConnectionAsync(CancellationToken cancellationToken)
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        return connection;
    }

    private async Task<int> EnsureCategoryAsync(SqlConnection connection, NewsCategoryInfo category, CancellationToken cancellationToken)
    {
        await using var command = new SqlCommand("""
            MERGE Cms.ArticleCategories AS target
            USING (SELECT @Code AS Code, @Name AS Name) AS source
            ON target.Code = source.Code
            WHEN MATCHED THEN
                UPDATE SET Name = source.Name, IsActive = 1, IsDeleted = 0, DeletedAt = NULL, UpdatedAt = SYSUTCDATETIME()
            WHEN NOT MATCHED THEN
                INSERT (Name, Code, CreatedAt)
                VALUES (source.Name, source.Code, SYSUTCDATETIME());

            SELECT Id FROM Cms.ArticleCategories WHERE Code = @Code AND IsDeleted = 0;
            """, connection);
        command.Parameters.AddWithValue("@Code", category.Slug);
        command.Parameters.AddWithValue("@Name", category.Title);
        return Convert.ToInt32(await command.ExecuteScalarAsync(cancellationToken), CultureInfo.InvariantCulture);
    }

    private static async Task InsertArticleAsync(SqlConnection connection, int categoryId, NewsPostDto post, bool isFeatured, CancellationToken cancellationToken)
    {
        var hasLegacyId = await HasColumnAsync(connection, "Cms", "Articles", "LegacyId", cancellationToken);
        var sql = hasLegacyId
            ? """
              INSERT INTO Cms.Articles (CategoryId, Title, Summary, Content, ImageUrl, Source, PublishedAt, IsFeatured, CreatedAt, LegacyId)
              VALUES (@CategoryId, @Title, @Summary, @Content, @ImageUrl, @Source, @PublishedAt, @IsFeatured, @CreatedAt, @LegacyId)
              """
            : """
              INSERT INTO Cms.Articles (CategoryId, Title, Summary, Content, ImageUrl, Source, PublishedAt, IsFeatured, CreatedAt)
              VALUES (@CategoryId, @Title, @Summary, @Content, @ImageUrl, @Source, @PublishedAt, @IsFeatured, @CreatedAt)
              """;

        await using var command = new SqlCommand(sql, connection);
        var createdAt = DateTimeValue(post.CreatedAt);
        command.Parameters.AddWithValue("@CategoryId", categoryId);
        command.Parameters.AddWithValue("@Title", EmptyIfNull(post.Title));
        command.Parameters.AddWithValue("@Summary", DBNull.Value);
        command.Parameters.AddWithValue("@Content", EmptyIfNull(post.Content));
        command.Parameters.AddWithValue("@ImageUrl", DbValue(post.ImageUrl));
        command.Parameters.AddWithValue("@Source", DbValue(post.Source));
        command.Parameters.AddWithValue("@PublishedAt", createdAt);
        command.Parameters.AddWithValue("@CreatedAt", createdAt);
        command.Parameters.AddWithValue("@IsFeatured", isFeatured);
        if (hasLegacyId)
        {
            command.Parameters.AddWithValue("@LegacyId", DbValue(post.Id));
        }
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task<bool> HasColumnAsync(SqlConnection connection, string schemaName, string tableName, string columnName, CancellationToken cancellationToken)
    {
        await using var command = new SqlCommand("""
            SELECT COUNT(1)
            FROM sys.columns c
            INNER JOIN sys.tables t ON t.object_id = c.object_id
            INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
            WHERE s.name = @SchemaName
              AND t.name = @TableName
              AND c.name = @ColumnName
            """, connection);
        command.Parameters.AddWithValue("@SchemaName", schemaName);
        command.Parameters.AddWithValue("@TableName", tableName);
        command.Parameters.AddWithValue("@ColumnName", columnName);
        return Convert.ToInt32(await command.ExecuteScalarAsync(cancellationToken), CultureInfo.InvariantCulture) > 0;
    }

    private static Task<bool> HasUserRoleColumnAsync(SqlConnection connection, CancellationToken cancellationToken)
    {
        return HasColumnAsync(connection, "Auth", "Users", "Role", cancellationToken);
    }

    private static async Task<SqlCommand> BuildUserCommandAsync(SqlConnection connection, string username, bool includePassword, bool requireActive, CancellationToken cancellationToken)
    {
        var roleColumn = await HasUserRoleColumnAsync(connection, cancellationToken) ? ", Role" : string.Empty;
        var passwordColumn = includePassword ? ", PasswordHash" : string.Empty;
        var activeFilter = requireActive ? " AND IsActive = 1" : string.Empty;
        var command = new SqlCommand($"""
            SELECT Id, Username, FullName, Email, DateOfBirth, AvatarUrl, CreatedAt, IsActive{roleColumn}{passwordColumn}
            FROM Auth.Users
            WHERE Username = @Username AND IsDeleted = 0{activeFilter}
            """, connection);
        command.Parameters.AddWithValue("@Username", username);
        return command;
    }

    private static UserDto ReadSafeUser(SqlDataReader reader)
    {
        return new UserDto
        {
            Id = reader.GetInt32(0).ToString(CultureInfo.InvariantCulture),
            Username = reader.GetString(1),
            FullName = reader.IsDBNull(2) ? null : reader.GetString(2),
            Email = reader.IsDBNull(3) ? null : reader.GetString(3),
            DateOfBirth = reader.IsDBNull(4) ? null : reader.GetDateTime(4).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            AvatarUrl = reader.IsDBNull(5) ? null : reader.GetString(5),
            RegisterDate = FormatDateTime(reader.GetDateTime(6)),
            IsActive = reader.GetBoolean(7),
            Role = HasReaderColumn(reader, "Role") && !reader.IsDBNull(reader.GetOrdinal("Role"))
                ? AuthTokenService.NormalizeRole(reader.GetString(reader.GetOrdinal("Role")))
                : "User"
        };
    }

    private static bool HasReaderColumn(IDataRecord reader, string columnName)
    {
        for (var i = 0; i < reader.FieldCount; i++)
        {
            if (string.Equals(reader.GetName(i), columnName, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    private static DocumentDto ReadDocument(SqlDataReader reader)
    {
        return new DocumentDto
        {
            Id = reader.GetInt32(0),
            TypeCode = reader.IsDBNull(1) ? null : reader.GetString(1),
            TypeName = reader.IsDBNull(2) ? null : reader.GetString(2),
            DocumentNumber = reader.IsDBNull(3) ? null : reader.GetString(3),
            PublishedAt = reader.IsDBNull(4) ? null : reader.GetDateTime(4).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            Title = reader.IsDBNull(5) ? null : reader.GetString(5),
            FileUrl = reader.IsDBNull(6) ? null : reader.GetString(6),
            OriginalFileName = reader.IsDBNull(7) ? null : reader.GetString(7),
            IssuingAuthority = reader.IsDBNull(8) ? null : reader.GetString(8),
            EffectiveDate = HasReaderColumn(reader, "EffectiveDate") && !reader.IsDBNull(reader.GetOrdinal("EffectiveDate")) ? reader.GetString(reader.GetOrdinal("EffectiveDate")) : null,
            Domain = HasReaderColumn(reader, "Domain") && !reader.IsDBNull(reader.GetOrdinal("Domain")) ? reader.GetString(reader.GetOrdinal("Domain")) : null,
            Signer = HasReaderColumn(reader, "Signer") && !reader.IsDBNull(reader.GetOrdinal("Signer")) ? reader.GetString(reader.GetOrdinal("Signer")) : null
        };
    }

    private async Task<bool> UserExistsAsync(SqlConnection connection, string? username, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return false;
        }

        return await GetUserIdAsync(connection, username, cancellationToken) is not null;
    }

    private static async Task<int?> GetUserIdAsync(SqlConnection connection, string? username, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return null;
        }

        await using var command = new SqlCommand("SELECT TOP (1) Id FROM Auth.Users WHERE Username = @Username AND IsDeleted = 0", connection);
        command.Parameters.AddWithValue("@Username", username);
        var value = await command.ExecuteScalarAsync(cancellationToken);
        return value is null ? null : Convert.ToInt32(value, CultureInfo.InvariantCulture);
    }

    private static async Task InsertUserAsync(SqlConnection connection, UserDto user, string password, CancellationToken cancellationToken)
    {
        var hasRole = await HasUserRoleColumnAsync(connection, cancellationToken);
        var roleColumn = hasRole ? ", Role" : string.Empty;
        var roleValue = hasRole ? ", @Role" : string.Empty;
        await using var command = new SqlCommand($"""
            INSERT INTO Auth.Users (Username, PasswordHash, FullName, Email, DateOfBirth, AvatarUrl, IsActive, CreatedAt{roleColumn})
            VALUES (@Username, @PasswordHash, @FullName, @Email, @DateOfBirth, @AvatarUrl, @IsActive, SYSUTCDATETIME(){roleValue})
            """, connection);
        command.Parameters.AddWithValue("@Username", EmptyIfNull(user.Username));
        command.Parameters.AddWithValue("@PasswordHash", PasswordService.HashPassword(password));
        command.Parameters.AddWithValue("@FullName", DbValue(user.FullName));
        command.Parameters.AddWithValue("@Email", DbValue(user.Email));
        command.Parameters.AddWithValue("@DateOfBirth", DateValue(user.DateOfBirth));
        command.Parameters.AddWithValue("@AvatarUrl", DbValue(user.AvatarUrl));
        command.Parameters.AddWithValue("@IsActive", user.IsActive);
        if (hasRole)
        {
            command.Parameters.AddWithValue("@Role", AuthTokenService.NormalizeRole(user.Role));
        }
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    // --- Draft Opinions ---
    public async Task<List<DraftOpinionDto>> GetDraftOpinionsAsync(CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        await EnsureDraftTablesAsync(connection, cancellationToken);
        var list = new List<DraftOpinionDto>();
        await using var command = new SqlCommand("SELECT Id, DocumentNumber, Title, FileUrl, OriginalFileName, CreatedAt, EndDate, Category FROM Gov.DraftOpinions WHERE IsDeleted = 0 ORDER BY Id DESC", connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            list.Add(new DraftOpinionDto
            {
                Id = reader.GetInt32(0),
                DocumentNumber = reader.IsDBNull(1) ? null : reader.GetString(1),
                Title = reader.IsDBNull(2) ? null : reader.GetString(2),
                FileUrl = reader.IsDBNull(3) ? null : reader.GetString(3),
                OriginalFileName = reader.IsDBNull(4) ? null : reader.GetString(4),
                CreatedAt = FormatDateTime(reader.GetDateTime(5)),
                EndDate = reader.IsDBNull(6) ? null : FormatDateTime(reader.GetDateTime(6)),
                Category = reader.IsDBNull(7) ? "Trung tâm IOC" : reader.GetString(7)
            });
        }
        return list;
    }

    public async Task<DraftOpinionDto?> GetDraftOpinionByIdAsync(int id, CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        await EnsureDraftTablesAsync(connection, cancellationToken);
        await using var command = new SqlCommand("SELECT Id, DocumentNumber, Title, FileUrl, OriginalFileName, CreatedAt, EndDate, Category FROM Gov.DraftOpinions WHERE Id = @Id AND IsDeleted = 0", connection);
        command.Parameters.AddWithValue("@Id", id);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (await reader.ReadAsync(cancellationToken))
        {
            return new DraftOpinionDto
            {
                Id = reader.GetInt32(0),
                DocumentNumber = reader.IsDBNull(1) ? null : reader.GetString(1),
                Title = reader.IsDBNull(2) ? null : reader.GetString(2),
                FileUrl = reader.IsDBNull(3) ? null : reader.GetString(3),
                OriginalFileName = reader.IsDBNull(4) ? null : reader.GetString(4),
                CreatedAt = FormatDateTime(reader.GetDateTime(5)),
                EndDate = reader.IsDBNull(6) ? null : FormatDateTime(reader.GetDateTime(6)),
                Category = reader.IsDBNull(7) ? "Trung tâm IOC" : reader.GetString(7)
            };
        }
        return null;
    }

    public async Task<DraftOpinionDto> AddDraftOpinionAsync(DraftOpinionDto payload, CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        await EnsureDraftTablesAsync(connection, cancellationToken);
        await using var command = new SqlCommand(@"
            INSERT INTO Gov.DraftOpinions (DocumentNumber, Title, FileUrl, OriginalFileName, CreatedAt, EndDate, Category, IsDeleted)
            OUTPUT INSERTED.Id, INSERTED.CreatedAt
            VALUES (@DocumentNumber, @Title, @FileUrl, @OriginalFileName, ISNULL(@CreatedAt, SYSUTCDATETIME()), @EndDate, @Category, 0)", connection);
        command.Parameters.AddWithValue("@DocumentNumber", DbValue(payload.DocumentNumber));
        command.Parameters.AddWithValue("@Title", DbValue(payload.Title));
        command.Parameters.AddWithValue("@FileUrl", DbValue(payload.FileUrl));
        command.Parameters.AddWithValue("@OriginalFileName", DbValue(payload.OriginalFileName));
        command.Parameters.AddWithValue("@CreatedAt", DateTimeValue(payload.CreatedAt));
        command.Parameters.AddWithValue("@EndDate", DateValue(payload.EndDate));
        command.Parameters.AddWithValue("@Category", DbValue(payload.Category));
        
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (await reader.ReadAsync(cancellationToken))
        {
            payload.Id = reader.GetInt32(0);
            payload.CreatedAt = FormatDateTime(reader.GetDateTime(1));
        }
        return payload;
    }

    public async Task<DraftOpinionDto> UpdateDraftOpinionAsync(int id, DraftOpinionDto payload, CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        await EnsureDraftTablesAsync(connection, cancellationToken);
        
        var updateFile = !string.IsNullOrEmpty(payload.FileUrl);
        var fileUpdateSql = updateFile ? ", FileUrl = @FileUrl, OriginalFileName = @OriginalFileName" : "";
        
        await using var command = new SqlCommand($@"
            UPDATE Gov.DraftOpinions 
            SET DocumentNumber = @DocumentNumber, Title = @Title, EndDate = @EndDate, Category = @Category {fileUpdateSql}
            WHERE Id = @Id", connection);
        command.Parameters.AddWithValue("@Id", id);
        command.Parameters.AddWithValue("@DocumentNumber", DbValue(payload.DocumentNumber));
        command.Parameters.AddWithValue("@Title", DbValue(payload.Title));
        command.Parameters.AddWithValue("@EndDate", DateValue(payload.EndDate));
        command.Parameters.AddWithValue("@Category", DbValue(payload.Category));
        if (updateFile)
        {
            command.Parameters.AddWithValue("@FileUrl", DbValue(payload.FileUrl));
            command.Parameters.AddWithValue("@OriginalFileName", DbValue(payload.OriginalFileName));
        }
        await command.ExecuteNonQueryAsync(cancellationToken);
        return payload;
    }

    public async Task DeleteDraftOpinionAsync(int id, CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        await EnsureDraftTablesAsync(connection, cancellationToken);
        await using var command = new SqlCommand("UPDATE Gov.DraftOpinions SET IsDeleted = 1 WHERE Id = @Id", connection);
        command.Parameters.AddWithValue("@Id", id);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    // --- Feedbacks ---
    public async Task<List<OpinionFeedbackDto>> GetFeedbacksAsync(int? draftOpinionId, CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        await EnsureDraftTablesAsync(connection, cancellationToken);
        var list = new List<OpinionFeedbackDto>();
        var filterSql = draftOpinionId.HasValue ? "AND DraftOpinionId = @DraftOpinionId" : "";
        await using var command = new SqlCommand($"SELECT Id, DraftOpinionId, FullName, Email, PhoneNumber, Content, CreatedAt FROM Gov.OpinionFeedbacks WHERE IsDeleted = 0 {filterSql} ORDER BY Id DESC", connection);
        if (draftOpinionId.HasValue) command.Parameters.AddWithValue("@DraftOpinionId", draftOpinionId.Value);
        
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            list.Add(new OpinionFeedbackDto
            {
                Id = reader.GetInt32(0),
                DraftOpinionId = reader.GetInt32(1),
                FullName = reader.IsDBNull(2) ? null : reader.GetString(2),
                Email = reader.IsDBNull(3) ? null : reader.GetString(3),
                PhoneNumber = reader.IsDBNull(4) ? null : reader.GetString(4),
                Content = reader.IsDBNull(5) ? null : reader.GetString(5),
                CreatedAt = FormatDateTime(reader.GetDateTime(6))
            });
        }
        return list;
    }

    public async Task<OpinionFeedbackDto> AddFeedbackAsync(OpinionFeedbackDto payload, CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        await EnsureDraftTablesAsync(connection, cancellationToken);
        await using var command = new SqlCommand(@"
            INSERT INTO Gov.OpinionFeedbacks (DraftOpinionId, FullName, Email, PhoneNumber, Content, CreatedAt, IsDeleted)
            OUTPUT INSERTED.Id, INSERTED.CreatedAt
            VALUES (@DraftOpinionId, @FullName, @Email, @PhoneNumber, @Content, SYSUTCDATETIME(), 0)", connection);
        command.Parameters.AddWithValue("@DraftOpinionId", payload.DraftOpinionId);
        command.Parameters.AddWithValue("@FullName", DbValue(payload.FullName));
        command.Parameters.AddWithValue("@Email", DbValue(payload.Email));
        command.Parameters.AddWithValue("@PhoneNumber", DbValue(payload.PhoneNumber));
        command.Parameters.AddWithValue("@Content", DbValue(payload.Content));
        
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (await reader.ReadAsync(cancellationToken))
        {
            payload.Id = reader.GetInt32(0);
            payload.CreatedAt = FormatDateTime(reader.GetDateTime(1));
        }
        return payload;
    }

    public async Task DeleteFeedbackAsync(int id, CancellationToken cancellationToken)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        await EnsureDraftTablesAsync(connection, cancellationToken);
        await using var command = new SqlCommand("UPDATE Gov.OpinionFeedbacks SET IsDeleted = 1 WHERE Id = @Id", connection);
        command.Parameters.AddWithValue("@Id", id);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task EnsureDraftTablesAsync(SqlConnection connection, CancellationToken cancellationToken)
    {
        await using var command = new SqlCommand(@"
            IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Gov')
            BEGIN
                EXEC('CREATE SCHEMA Gov');
            END

            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'Gov' AND TABLE_NAME = 'DraftOpinions')
            BEGIN
                CREATE TABLE Gov.DraftOpinions (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    DocumentNumber NVARCHAR(255) NULL,
                    Title NVARCHAR(MAX) NULL,
                    FileUrl NVARCHAR(1000) NULL,
                    OriginalFileName NVARCHAR(255) NULL,
                    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    EndDate DATETIME2 NULL,
                    Category NVARCHAR(255) NULL,
                    IsDeleted BIT NOT NULL DEFAULT 0
                );
            END

            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'Gov' AND TABLE_NAME = 'OpinionFeedbacks')
            BEGIN
                CREATE TABLE Gov.OpinionFeedbacks (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    DraftOpinionId INT NOT NULL,
                    FullName NVARCHAR(255) NULL,
                    Email NVARCHAR(255) NULL,
                    PhoneNumber NVARCHAR(50) NULL,
                    Content NVARCHAR(MAX) NULL,
                    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    IsDeleted BIT NOT NULL DEFAULT 0,
                    CONSTRAINT FK_OpinionFeedbacks_DraftOpinions FOREIGN KEY (DraftOpinionId) REFERENCES Gov.DraftOpinions(Id)
                );
            END
        ", connection);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static JsonNode? ParseConfigValue(string rawValue)
    {
        try
        {
            return JsonNode.Parse(rawValue);
        }
        catch
        {
            // Nếu dữ liệu cũ trong DB là chuỗi thường, vẫn trả về dạng JSON string hợp lệ.
            return JsonValue.Create(rawValue);
        }
    }

    private static string FormatDateTime(DateTime value)
    {
        return value.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
    }

    private static object DbValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value;
    }

    private static object DateValue(string? value)
    {
        return DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)
            ? date.Date
            : DBNull.Value;
    }

    private static object DateTimeValue(string? value)
    {
        return DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)
            ? date
            : DateTime.Now;
    }

    private static string EmptyIfNull(string? value)
    {
        return value ?? string.Empty;
    }
}
