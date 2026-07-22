using System.Text.Json;
using System.Text.Json.Nodes;
using Backend.Models;

namespace Backend.Services;

public sealed class JsonPortalDataStore : IPortalDataStore
{
    private readonly string _dataDir;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public JsonPortalDataStore(IWebHostEnvironment environment)
    {
        _dataDir = Path.Combine(environment.ContentRootPath, "data");
        Directory.CreateDirectory(_dataDir);
    }

    public async Task<JsonObject> GetConfigAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("cau-hinh.json", "{}", cancellationToken);
        return JsonNode.Parse(json)?.AsObject() ?? [];
    }

    public async Task SaveConfigAsync(JsonObject config, CancellationToken cancellationToken)
    {
        await WriteFileAsync("cau-hinh.json", config.ToJsonString(_jsonOptions), cancellationToken);
    }

    public async Task<ContentPageDto> GetContentPageAsync(string slug, CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync($"{slug}.json", "{\"title\":\"\",\"content\":\"\"}", cancellationToken);
        return JsonSerializer.Deserialize<ContentPageDto>(json, _jsonOptions) ?? new ContentPageDto();
    }

    public async Task SaveContentPageAsync(string slug, ContentPageDto page, CancellationToken cancellationToken)
    {
        await WriteFileAsync($"{slug}.json", JsonSerializer.Serialize(page, _jsonOptions), cancellationToken);
    }

    public async Task<CategoryPageDto> GetNewsCategoryAsync(NewsCategoryInfo category, CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync($"{category.Slug}.json", JsonSerializer.Serialize(new CategoryPageDto { Title = category.Title }, _jsonOptions), cancellationToken);
        return JsonSerializer.Deserialize<CategoryPageDto>(json, _jsonOptions) ?? new CategoryPageDto { Title = category.Title };
    }

    public async Task SaveNewsCategoryAsync(NewsCategoryInfo category, CategoryPageDto page, CancellationToken cancellationToken)
    {
        page.Title ??= category.Title;
        await WriteFileAsync($"{category.Slug}.json", JsonSerializer.Serialize(page, _jsonOptions), cancellationToken);
    }

    public async Task<List<NewsPostDto>> GetMainNewsAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("tin-tuc.json", "[]", cancellationToken);
        return JsonSerializer.Deserialize<List<NewsPostDto>>(json, _jsonOptions) ?? [];
    }

    public async Task AddMainNewsAsync(NewsPostDto post, CancellationToken cancellationToken)
    {
        var posts = await GetMainNewsAsync(cancellationToken);
        post.Id ??= DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
        post.CreatedAt ??= DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        posts.Insert(0, post);
        await WriteFileAsync("tin-tuc.json", JsonSerializer.Serialize(posts, _jsonOptions), cancellationToken);
    }

    public async Task<List<UserDto>> GetUsersAsync(CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        return users.Select(ToSafeUser).ToList();
    }

    public async Task<UserDto?> GetUserAsync(string username, CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        var user = users.FirstOrDefault(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
        return user is null ? null : ToSafeUser(user);
    }

    public async Task<UserDto?> LoginAsync(string username, string password, CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        var user = users.FirstOrDefault(u =>
            string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase) &&
            PasswordService.VerifyPassword(password, u.Password ?? string.Empty));

        return user is null || !user.IsActive ? null : ToSafeUser(user);
    }

    public async Task<(bool Success, string Message, UserDto? User)> RegisterAsync(UserDto user, CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        if (users.Any(u => string.Equals(u.Username, user.Username, StringComparison.OrdinalIgnoreCase)))
        {
            return (false, "Tên đăng nhập đã tồn tại.", null);
        }

        user.Id = Guid.NewGuid().ToString();
        user.RegisterDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        user.Password = PasswordService.HashPassword(user.Password ?? string.Empty);
        user.Role = AuthTokenService.NormalizeRole(user.Role);
        user.IsActive = true;
        users.Add(user);
        await WriteUsersAsync(users, cancellationToken);
        return (true, "Đăng ký thành công.", ToSafeUser(user));
    }

    public async Task<(bool Success, string Message, UserDto? User)> UpdateUserAsync(string username, UserDto user, CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        var index = users.FindIndex(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
        if (index < 0)
        {
            return (false, "Không tìm thấy người dùng.", null);
        }

        var current = users[index];
        if (!string.IsNullOrWhiteSpace(user.Password)) current.Password = PasswordService.HashPassword(user.Password);
        if (user.Email is not null) current.Email = user.Email;
        if (user.DateOfBirth is not null) current.DateOfBirth = user.DateOfBirth;
        if (user.AvatarUrl is not null) current.AvatarUrl = user.AvatarUrl;
        if (user.FullName is not null) current.FullName = user.FullName;

        users[index] = current;
        await WriteUsersAsync(users, cancellationToken);
        return (true, "Cập nhật thành công.", ToSafeUser(current));
    }

    public async Task<(bool Success, string Message)> AdminSaveUserAsync(string? username, UserDto user, CancellationToken cancellationToken)
    {
        var users = await ReadUsersAsync(cancellationToken);
        var index = string.IsNullOrWhiteSpace(username)
            ? -1
            : users.FindIndex(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));

        if (index < 0)
        {
            if (users.Any(u => string.Equals(u.Username, user.Username, StringComparison.OrdinalIgnoreCase)))
            {
                return (false, "Tên đăng nhập đã tồn tại.");
            }

            user.Id = Guid.NewGuid().ToString();
            user.RegisterDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            user.Password = PasswordService.HashPassword(string.IsNullOrWhiteSpace(user.Password) ? "123456" : user.Password);
            user.Role = AuthTokenService.NormalizeRole(user.Role);
            users.Add(user);
            await WriteUsersAsync(users, cancellationToken);
            return (true, "Thêm tài khoản thành công.");
        }

        var current = users[index];
        if (string.Equals(current.Username, "admin", StringComparison.OrdinalIgnoreCase) &&
            (!user.IsActive || AuthTokenService.NormalizeRole(user.Role) != "Admin"))
        {
            return (false, "Không thể hạ quyền hoặc khóa tài khoản admin gốc.");
        }

        if (!string.IsNullOrWhiteSpace(user.Password)) current.Password = PasswordService.HashPassword(user.Password);
        if (user.FullName is not null) current.FullName = user.FullName;
        if (user.Email is not null) current.Email = user.Email;
        current.Role = AuthTokenService.NormalizeRole(user.Role);
        current.IsActive = user.IsActive;
        users[index] = current;
        await WriteUsersAsync(users, cancellationToken);
        return (true, "Cập nhật tài khoản thành công.");
    }

    public async Task<(bool Success, string Message)> AdminDeleteUserAsync(string username, CancellationToken cancellationToken)
    {
        if (string.Equals(username, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return (false, "Không thể xóa tài khoản admin gốc.");
        }

        var users = await ReadUsersAsync(cancellationToken);
        var removed = users.RemoveAll(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
        if (removed == 0)
        {
            return (false, "Không tìm thấy người dùng.");
        }

        await WriteUsersAsync(users, cancellationToken);
        return (true, "Đã xóa tài khoản.");
    }

    public async Task<List<CommentDto>> GetCommentsAsync(string pageId, CancellationToken cancellationToken)
    {
        var comments = await ReadCommentsAsync(cancellationToken);
        return comments.Where(c => string.Equals(c.PageId, pageId, StringComparison.OrdinalIgnoreCase)).ToList();
    }

    public async Task<CommentDto> AddCommentAsync(CommentDto comment, CancellationToken cancellationToken)
    {
        var comments = await ReadCommentsAsync(cancellationToken);
        var users = await ReadUsersAsync(cancellationToken);
        var user = users.FirstOrDefault(u => string.Equals(u.Username, comment.Username, StringComparison.OrdinalIgnoreCase));

        comment.Id = Guid.NewGuid().ToString();
        comment.CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        comment.Likes = 0;
        comment.Dislikes = 0;
        comment.AvatarUrl = user?.AvatarUrl ?? string.Empty;
        comments.Add(comment);

        await WriteFileAsync("danh-sach-binh-luan.json", JsonSerializer.Serialize(comments, _jsonOptions), cancellationToken);
        return comment;
    }

    public async Task<int?> VoteCommentAsync(string id, bool isLike, CancellationToken cancellationToken)
    {
        var comments = await ReadCommentsAsync(cancellationToken);
        var comment = comments.FirstOrDefault(c => string.Equals(c.Id, id, StringComparison.OrdinalIgnoreCase));
        if (comment is null)
        {
            return null;
        }

        if (isLike) comment.Likes++;
        else comment.Dislikes++;

        await WriteFileAsync("danh-sach-binh-luan.json", JsonSerializer.Serialize(comments, _jsonOptions), cancellationToken);
        return isLike ? comment.Likes : comment.Dislikes;
    }

    public async Task<(bool Success, string Message)> DeleteCommentAsync(string id, string username, CancellationToken cancellationToken)
    {
        var comments = await ReadCommentsAsync(cancellationToken);
        var comment = comments.FirstOrDefault(c => string.Equals(c.Id, id, StringComparison.OrdinalIgnoreCase));
        if (comment is null)
        {
            return (false, "Không tìm thấy bình luận.");
        }

        if (!string.Equals(comment.Username, username, StringComparison.OrdinalIgnoreCase))
        {
            return (false, "Bạn không có quyền xoá bình luận này.");
        }

        comments.Remove(comment);
        await WriteFileAsync("danh-sach-binh-luan.json", JsonSerializer.Serialize(comments, _jsonOptions), cancellationToken);
        return (true, "Đã xoá bình luận.");
    }

    public Task<List<AnnouncementDto>> GetAnnouncementsAsync(int take, CancellationToken cancellationToken)
    {
        return Task.FromResult(new List<AnnouncementDto>());
    }

    public Task<List<DocumentTypeDto>> GetDocumentTypesAsync(CancellationToken cancellationToken)
    {
        var types = new List<DocumentTypeDto>
        {
            new DocumentTypeDto { Id = 1, Code = "cong-van", Name = "Công văn", DisplayOrder = 1 },
            new DocumentTypeDto { Id = 2, Code = "bao-cao", Name = "Báo cáo", DisplayOrder = 2 },
            new DocumentTypeDto { Id = 3, Code = "ke-hoach", Name = "Kế hoạch", DisplayOrder = 3 },
            new DocumentTypeDto { Id = 4, Code = "quyet-dinh", Name = "Quyết định", DisplayOrder = 4 },
            new DocumentTypeDto { Id = 5, Code = "huong-dan", Name = "Hướng dẫn", DisplayOrder = 5 },
            new DocumentTypeDto { Id = 6, Code = "chuong-trinh", Name = "Chương trình", DisplayOrder = 6 },
            new DocumentTypeDto { Id = 7, Code = "tap-huan", Name = "Tập huấn", DisplayOrder = 7 }
        };
        return Task.FromResult(types);
    }

    private async Task<List<DocumentDto>> ReadDocumentsAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("van-ban.json", "[]", cancellationToken);
        if (string.IsNullOrWhiteSpace(json)) return [];
        try { return JsonSerializer.Deserialize<List<DocumentDto>>(json, _jsonOptions) ?? []; }
        catch { return []; }
    }

    private async Task WriteDocumentsAsync(List<DocumentDto> docs, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(docs, _jsonOptions);
        await WriteFileAsync("van-ban.json", json, cancellationToken);
    }

    public async Task<List<DocumentDto>> GetDocumentsAsync(string? typeCode, int take, CancellationToken cancellationToken)
    {
        var docs = await ReadDocumentsAsync(cancellationToken);
        if (!string.IsNullOrWhiteSpace(typeCode))
        {
            docs = docs.Where(d => string.Equals(d.TypeCode, typeCode, StringComparison.OrdinalIgnoreCase)).ToList();
        }
        return docs.OrderByDescending(d => d.Id).Take(take).ToList();
    }

    public async Task<DocumentDto> AddDocumentAsync(DocumentDto document, CancellationToken cancellationToken = default)
    {
        var docs = await ReadDocumentsAsync(cancellationToken);
        document.Id = docs.Count > 0 ? docs.Max(d => d.Id) + 1 : 1;
        docs.Add(document);
        await WriteDocumentsAsync(docs, cancellationToken);
        return document;
    }

    public async Task<DocumentDto> UpdateDocumentAsync(int id, DocumentDto document, CancellationToken cancellationToken = default)
    {
        var docs = await ReadDocumentsAsync(cancellationToken);
        var existing = docs.FirstOrDefault(d => d.Id == id);
        if (existing == null) throw new Exception("Không tìm thấy văn bản.");
        
        existing.TypeCode = document.TypeCode;
        existing.TypeName = document.TypeName;
        existing.DocumentNumber = document.DocumentNumber;
        existing.PublishedAt = document.PublishedAt;
        existing.Title = document.Title;
        existing.FileUrl = document.FileUrl;
        existing.IssuingAuthority = document.IssuingAuthority;

        await WriteDocumentsAsync(docs, cancellationToken);
        return existing;
    }

    public async Task DeleteDocumentAsync(int id, CancellationToken cancellationToken = default)
    {
        var docs = await ReadDocumentsAsync(cancellationToken);
        docs.RemoveAll(d => d.Id == id);
        await WriteDocumentsAsync(docs, cancellationToken);
    }

    public async Task<DocumentDto?> GetDocumentByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var docs = await ReadDocumentsAsync(cancellationToken);
        return docs.FirstOrDefault(d => d.Id == id);
    }

    public async Task<List<SearchResultDto>> SearchAsync(string keyword, int take, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            return [];
        }

        var normalizedKeyword = keyword.Trim().ToLowerInvariant();
        var results = new List<SearchResultDto>();

        string StripHtml(string? input)
        {
            if (string.IsNullOrEmpty(input)) return "";
            return System.Text.RegularExpressions.Regex.Replace(input, "<.*?>", string.Empty);
        }

        // 1. Search Main News (tin-tuc-da-phuong-tien)
        var mainNews = await GetMainNewsAsync(cancellationToken);
        foreach (var news in mainNews)
        {
            if ((news.Title?.ToLowerInvariant().Contains(normalizedKeyword) == true) || 
                (news.Content?.ToLowerInvariant().Contains(normalizedKeyword) == true))
            {
                var cleanContent = StripHtml(news.Content);
                var summary = cleanContent.Length > 200 ? cleanContent.Substring(0, 200) + "..." : cleanContent;
                results.Add(new SearchResultDto
                {
                    Type = "Tin tức đa phương tiện",
                    Title = news.Title ?? "",
                    Summary = summary,
                    Url = $"user/tin-tuc/chi-tiet-tin-tuc.html?id={news.Id}",
                    PublishedAt = news.CreatedAt
                });
            }
        }

        // 2. Search Documents (van-ban)
        var documents = await GetDocumentsAsync(null, 1000, cancellationToken);
        foreach (var doc in documents)
        {
            if ((doc.Title?.ToLowerInvariant().Contains(normalizedKeyword) == true) || 
                (doc.DocumentNumber?.ToLowerInvariant().Contains(normalizedKeyword) == true) ||
                (doc.IssuingAuthority?.ToLowerInvariant().Contains(normalizedKeyword) == true))
            {
                results.Add(new SearchResultDto
                {
                    Type = "Văn bản",
                    Title = doc.Title ?? "",
                    Summary = $"Số hiệu: {doc.DocumentNumber} - Cơ quan ban hành: {doc.IssuingAuthority}",
                    Url = $"user/van-ban/chi-tiet-van-ban.html?id={doc.Id}",
                    PublishedAt = doc.PublishedAt
                });
            }
        }

        // 3. Search Draft Opinions (y-kien-du-thao)
        var drafts = await GetDraftOpinionsAsync(cancellationToken);
        foreach (var draft in drafts)
        {
            if ((draft.Title?.ToLowerInvariant().Contains(normalizedKeyword) == true))
            {
                results.Add(new SearchResultDto
                {
                    Type = "Lấy ý kiến",
                    Title = draft.Title ?? "",
                    Summary = $"Số hiệu: {draft.DocumentNumber}",
                    Url = $"user/y-kien-du-thao/chi-tiet.html?id={draft.Id}",
                    PublishedAt = draft.CreatedAt
                });
            }
        }

        // 4. Other News Categories
        string[] newsCategories = { "thong-bao", "tin-hoat-dong", "chi-dao-dieu-hanh" };
        var categoryTitles = new Dictionary<string, string> {
            { "thong-bao", "Thông báo" },
            { "tin-hoat-dong", "Tin hoạt động" },
            { "chi-dao-dieu-hanh", "Chỉ đạo điều hành" }
        };

        foreach (var cat in newsCategories)
        {
            var page = await GetNewsCategoryAsync(new NewsCategoryInfo { Slug = cat, Title = categoryTitles[cat] }, cancellationToken);
            if (page?.Posts != null)
            {
                foreach (var post in page.Posts)
                {
                    if ((post.Title?.ToLowerInvariant().Contains(normalizedKeyword) == true) || 
                        (post.Content?.ToLowerInvariant().Contains(normalizedKeyword) == true))
                    {
                        var cleanContent = StripHtml(post.Content);
                        var summary = cleanContent.Length > 200 ? cleanContent.Substring(0, 200) + "..." : cleanContent;
                        results.Add(new SearchResultDto
                        {
                            Type = page.Title ?? "Tin tức",
                            Title = post.Title ?? "",
                            Summary = summary,
                            Url = $"user/tin-tuc/chi-tiet-tin-tuc.html?id={post.Id}",
                            PublishedAt = post.CreatedAt
                        });
                    }
                }
            }
        }

        return results
            .OrderByDescending(r => r.PublishedAt)
            .Take(take)
            .ToList();
    }

    public async Task<HomePageDto> GetHomePageAsync(CancellationToken cancellationToken)
    {
        return new HomePageDto
        {
            Config = await GetConfigAsync(cancellationToken),
            FeaturedNews = (await GetMainNewsAsync(cancellationToken)).Take(5).ToList(),
            Announcements = await GetAnnouncementsAsync(5, cancellationToken),
            DocumentTypes = await GetDocumentTypesAsync(cancellationToken),
            Documents = (await GetDocumentsAsync(null, 10, cancellationToken)).ToList()
        };
    }

    // --- Draft Opinions ---
    private async Task<List<DraftOpinionDto>> ReadDraftOpinionsAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("y-kien-du-thao.json", "[]", cancellationToken);
        return JsonSerializer.Deserialize<List<DraftOpinionDto>>(json, _jsonOptions) ?? [];
    }
    
    private async Task WriteDraftOpinionsAsync(List<DraftOpinionDto> drafts, CancellationToken cancellationToken)
    {
        await WriteFileAsync("y-kien-du-thao.json", JsonSerializer.Serialize(drafts, _jsonOptions), cancellationToken);
    }

    public async Task<List<DraftOpinionDto>> GetDraftOpinionsAsync(CancellationToken cancellationToken)
    {
        return await ReadDraftOpinionsAsync(cancellationToken);
    }

    public async Task<DraftOpinionDto?> GetDraftOpinionByIdAsync(int id, CancellationToken cancellationToken)
    {
        var drafts = await ReadDraftOpinionsAsync(cancellationToken);
        return drafts.FirstOrDefault(d => d.Id == id);
    }

    public async Task<DraftOpinionDto> AddDraftOpinionAsync(DraftOpinionDto payload, CancellationToken cancellationToken)
    {
        var drafts = await ReadDraftOpinionsAsync(cancellationToken);
        payload.Id = drafts.Count > 0 ? drafts.Max(d => d.Id) + 1 : 1;
        if (string.IsNullOrWhiteSpace(payload.CreatedAt))
        {
            payload.CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        }
        drafts.Insert(0, payload);
        await WriteDraftOpinionsAsync(drafts, cancellationToken);
        return payload;
    }

    public async Task<DraftOpinionDto> UpdateDraftOpinionAsync(int id, DraftOpinionDto payload, CancellationToken cancellationToken)
    {
        var drafts = await ReadDraftOpinionsAsync(cancellationToken);
        var existing = drafts.FirstOrDefault(d => d.Id == id);
        if (existing != null)
        {
            existing.DocumentNumber = payload.DocumentNumber;
            existing.Title = payload.Title;
            existing.EndDate = payload.EndDate;
            existing.Category = payload.Category;
            if (!string.IsNullOrEmpty(payload.FileUrl))
            {
                existing.FileUrl = payload.FileUrl;
                existing.OriginalFileName = payload.OriginalFileName;
            }
            await WriteDraftOpinionsAsync(drafts, cancellationToken);
        }
        return existing ?? payload;
    }

    public async Task DeleteDraftOpinionAsync(int id, CancellationToken cancellationToken)
    {
        var drafts = await ReadDraftOpinionsAsync(cancellationToken);
        var count = drafts.RemoveAll(d => d.Id == id);
        if (count > 0)
        {
            await WriteDraftOpinionsAsync(drafts, cancellationToken);
        }
    }

    // --- Feedbacks ---
    private async Task<List<OpinionFeedbackDto>> ReadFeedbacksAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("gop-y.json", "[]", cancellationToken);
        return JsonSerializer.Deserialize<List<OpinionFeedbackDto>>(json, _jsonOptions) ?? [];
    }

    private async Task WriteFeedbacksAsync(List<OpinionFeedbackDto> feedbacks, CancellationToken cancellationToken)
    {
        await WriteFileAsync("gop-y.json", JsonSerializer.Serialize(feedbacks, _jsonOptions), cancellationToken);
    }

    public async Task<List<OpinionFeedbackDto>> GetFeedbacksAsync(int? draftOpinionId, CancellationToken cancellationToken)
    {
        var feedbacks = await ReadFeedbacksAsync(cancellationToken);
        if (draftOpinionId.HasValue)
        {
            feedbacks = feedbacks.Where(f => f.DraftOpinionId == draftOpinionId.Value).ToList();
        }
        return feedbacks.OrderByDescending(f => f.CreatedAt).ToList();
    }

    public async Task<OpinionFeedbackDto> AddFeedbackAsync(OpinionFeedbackDto payload, CancellationToken cancellationToken)
    {
        var feedbacks = await ReadFeedbacksAsync(cancellationToken);
        payload.Id = feedbacks.Count > 0 ? feedbacks.Max(f => f.Id) + 1 : 1;
        payload.CreatedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        feedbacks.Add(payload);
        await WriteFeedbacksAsync(feedbacks, cancellationToken);
        return payload;
    }

    public async Task DeleteFeedbackAsync(int id, CancellationToken cancellationToken)
    {
        var feedbacks = await ReadFeedbacksAsync(cancellationToken);
        if (feedbacks.RemoveAll(f => f.Id == id) > 0)
        {
            await WriteFeedbacksAsync(feedbacks, cancellationToken);
        }
    }

    private async Task<List<UserDto>> ReadUsersAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("nguoi-dung.json", "[]", cancellationToken);
        return JsonSerializer.Deserialize<List<UserDto>>(json, _jsonOptions) ?? [];
    }

    private Task WriteUsersAsync(List<UserDto> users, CancellationToken cancellationToken)
    {
        return WriteFileAsync("nguoi-dung.json", JsonSerializer.Serialize(users, _jsonOptions), cancellationToken);
    }

    private async Task<List<CommentDto>> ReadCommentsAsync(CancellationToken cancellationToken)
    {
        var json = await ReadFileAsync("danh-sach-binh-luan.json", "[]", cancellationToken);
        return JsonSerializer.Deserialize<List<CommentDto>>(json, _jsonOptions) ?? [];
    }

    private async Task<string> ReadFileAsync(string fileName, string defaultJson, CancellationToken cancellationToken)
    {
        var path = Path.Combine(_dataDir, fileName);
        if (!File.Exists(path))
        {
            await File.WriteAllTextAsync(path, defaultJson, cancellationToken);
        }

        return await File.ReadAllTextAsync(path, cancellationToken);
    }

    private Task WriteFileAsync(string fileName, string json, CancellationToken cancellationToken)
    {
        var path = Path.Combine(_dataDir, fileName);
        return File.WriteAllTextAsync(path, json, cancellationToken);
    }

    private static UserDto ToSafeUser(UserDto user)
    {
        // Không trả mật khẩu ra frontend, kể cả khi dữ liệu cũ vẫn còn lưu trong JSON.
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            RegisterDate = user.RegisterDate,
            Role = AuthTokenService.NormalizeRole(user.Role),
            Email = user.Email,
            DateOfBirth = user.DateOfBirth,
            AvatarUrl = user.AvatarUrl,
            FullName = user.FullName,
            IsActive = user.IsActive
        };
    }
}
