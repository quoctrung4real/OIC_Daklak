using System.Text.Json;
using System.Text.Json.Nodes;
using Backend.Models;

namespace Backend.Services;

public sealed class JsonToSqlMigrationService
{
    private readonly IWebHostEnvironment _environment;
    private readonly IPortalDataStore _store;
    private readonly IReadOnlyList<NewsCategoryInfo> _newsCategories;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public JsonToSqlMigrationService(
        IWebHostEnvironment environment,
        IPortalDataStore store,
        IReadOnlyList<NewsCategoryInfo> newsCategories)
    {
        _environment = environment;
        _store = store;
        _newsCategories = newsCategories;
    }

    public async Task<MigrationReport> MigrateAsync(CancellationToken cancellationToken)
    {
        var report = new MigrationReport();
        var dataDir = Path.Combine(_environment.ContentRootPath, "data");

        await MigrateConfigAsync(dataDir, report, cancellationToken);
        await MigrateContentPagesAsync(dataDir, report, cancellationToken);
        await MigrateNewsCategoriesAsync(dataDir, report, cancellationToken);
        await MigrateMainNewsAsync(dataDir, report, cancellationToken);
        await MigrateUsersAsync(dataDir, report, cancellationToken);
        await MigrateCommentsAsync(dataDir, report, cancellationToken);
        await MigrateDocumentsAsync(dataDir, report, cancellationToken);
        await MigrateDraftOpinionsAsync(dataDir, report, cancellationToken);
        await MigrateFeedbacksAsync(dataDir, report, cancellationToken);
        await MigrateQnaAsync(dataDir, report, cancellationToken);

        return report;
    }

    private async Task MigrateConfigAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var node = await ReadJsonAsync<JsonObject>(dataDir, "cau-hinh.json", report, cancellationToken);
        if (node is null)
        {
            return;
        }

        await _store.SaveConfigAsync(node, cancellationToken);
        report.CompletedSteps.Add($"Đã migrate cấu hình giao diện: {node.Count} khóa.");
    }

    private async Task MigrateContentPagesAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var slugs = new[]
        {
            "chuc-nang-nhiem-vu",
            "dau-moi-ho-tro",
            "lich-su-hinh-thanh",
            "san-pham-tieu-bieu",
            "so-do-to-chuc",
            "co-cau-to-chuc"
        };

        var count = 0;
        foreach (var slug in slugs)
        {
            var page = await ReadJsonAsync<ContentPageDto>(dataDir, $"{slug}.json", report, cancellationToken);
            if (page is null)
            {
                continue;
            }

            await _store.SaveContentPageAsync(slug, page, cancellationToken);
            count++;
        }

        report.CompletedSteps.Add($"Đã migrate trang nội dung: {count}/{slugs.Length} trang.");
    }

    private async Task MigrateNewsCategoriesAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var count = 0;
        var postCount = 0;

        foreach (var category in _newsCategories)
        {
            var page = await ReadJsonAsync<CategoryPageDto>(dataDir, $"{category.Slug}.json", report, cancellationToken);
            if (page is null)
            {
                continue;
            }

            page.Title ??= category.Title;
            await _store.SaveNewsCategoryAsync(category, page, cancellationToken);
            count++;
            postCount += page.Posts.Count;
        }

        report.CompletedSteps.Add($"Đã migrate chuyên mục tin: {count}/{_newsCategories.Count} chuyên mục, {postCount} bài viết.");
    }

    private async Task MigrateMainNewsAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var posts = await ReadJsonAsync<List<NewsPostDto>>(dataDir, "tin-tuc.json", report, cancellationToken);
        if (posts is null)
        {
            return;
        }

        foreach (var post in posts)
        {
            await _store.AddMainNewsAsync(post, cancellationToken);
        }

        report.CompletedSteps.Add($"Đã migrate tin nổi bật riêng: {posts.Count} bài viết.");
    }

    private async Task MigrateUsersAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var users = await ReadJsonAsync<List<UserDto>>(dataDir, "nguoi-dung.json", report, cancellationToken);
        if (users is null)
        {
            return;
        }

        var successCount = 0;
        foreach (var user in users.Where(u => !string.IsNullOrWhiteSpace(u.Username)))
        {
            var existingUser = await _store.GetUserAsync(user.Username!, cancellationToken);
            var result = await _store.AdminSaveUserAsync(existingUser is null ? null : user.Username, user, cancellationToken);
            if (result.Success)
            {
                successCount++;
            }
            else
            {
                report.Warnings.Add($"Không migrate được user {user.Username}: {result.Message}");
            }
        }

        report.CompletedSteps.Add($"Đã migrate người dùng: {successCount}/{users.Count} tài khoản.");
    }

    private async Task MigrateCommentsAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var comments = await ReadJsonAsync<List<CommentDto>>(dataDir, "danh-sach-binh-luan.json", report, cancellationToken);
        if (comments is null)
        {
            return;
        }

        var successCount = 0;
        foreach (var comment in comments.Where(c =>
            !string.IsNullOrWhiteSpace(c.PageId) &&
            !string.IsNullOrWhiteSpace(c.Username) &&
            !string.IsNullOrWhiteSpace(c.Content)))
        {
            try
            {
                await _store.AddCommentAsync(comment, cancellationToken);
                successCount++;
            }
            catch (Exception ex)
            {
                report.Warnings.Add($"Không migrate được bình luận của {comment.Username} trên {comment.PageId}: {ex.Message}");
            }
        }

        report.CompletedSteps.Add($"Đã migrate bình luận: {successCount}/{comments.Count} bình luận.");
    }

    private async Task MigrateDocumentsAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var items = await ReadJsonAsync<List<DocumentDto>>(dataDir, "van-ban.json", report, cancellationToken);
        if (items is null) return;
        var currentItems = await _store.GetDocumentsAsync(null, int.MaxValue, cancellationToken);
        foreach (var item in items)
        {
            var existing = currentItems.FirstOrDefault(value =>
                (!string.IsNullOrWhiteSpace(item.DocumentNumber) && value.DocumentNumber == item.DocumentNumber) ||
                (value.Title == item.Title && value.PublishedAt == item.PublishedAt));
            if (existing is null) await _store.AddDocumentAsync(item, cancellationToken);
            else await _store.UpdateDocumentAsync(existing.Id, item, cancellationToken);
        }
        report.CompletedSteps.Add($"Đã migrate văn bản: {items.Count} văn bản.");
    }

    private async Task MigrateDraftOpinionsAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var items = await ReadJsonAsync<List<DraftOpinionDto>>(dataDir, "y-kien-du-thao.json", report, cancellationToken);
        if (items is null) return;
        var existing = await _store.GetDraftOpinionsAsync(cancellationToken);
        foreach (var item in items)
        {
            if (item.Id > 0 && existing.Any(value => value.Id == item.Id)) await _store.UpdateDraftOpinionAsync(item.Id, item, cancellationToken);
            else await _store.AddDraftOpinionAsync(item, cancellationToken);
        }
        report.CompletedSteps.Add($"Đã migrate dự thảo: {items.Count} bản ghi.");
    }

    private async Task MigrateFeedbacksAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var items = await ReadJsonAsync<List<OpinionFeedbackDto>>(dataDir, "gop-y.json", report, cancellationToken);
        if (items is null) return;
        var existing = await _store.GetFeedbacksAsync(null, cancellationToken);
        var newItems = items.Where(item => !existing.Any(value => value.Id == item.Id)).ToList();
        foreach (var item in newItems) await _store.AddFeedbackAsync(item, cancellationToken);
        report.CompletedSteps.Add($"Đã migrate góp ý dự thảo: {newItems.Count}/{items.Count} bản ghi mới.");
    }

    private async Task MigrateQnaAsync(string dataDir, MigrationReport report, CancellationToken cancellationToken)
    {
        var faqs = await ReadJsonAsync<List<FaqDto>>(dataDir, "faq.json", report, cancellationToken);
        if (faqs is not null)
        {
            foreach (var item in faqs) await _store.SaveFaqAsync(item.Id > 0 ? item.Id : null, item, cancellationToken);
            report.CompletedSteps.Add($"Đã migrate FAQ: {faqs.Count} câu hỏi.");
        }
        var questions = await ReadJsonAsync<List<UserQuestionDto>>(dataDir, "cau-hoi-nguoi-dan.json", report, cancellationToken);
        if (questions is not null)
        {
            var existing = await _store.GetUserQuestionsAsync(false, cancellationToken);
            var newItems = questions.Where(item => !existing.Any(value => value.Id == item.Id)).ToList();
            foreach (var item in newItems) await _store.AddUserQuestionAsync(item, cancellationToken);
            report.CompletedSteps.Add($"Đã migrate câu hỏi người dân: {newItems.Count}/{questions.Count} câu hỏi mới.");
        }
    }

    private async Task<T?> ReadJsonAsync<T>(string dataDir, string fileName, MigrationReport report, CancellationToken cancellationToken)
    {
        var path = Path.Combine(dataDir, fileName);
        if (!File.Exists(path))
        {
            report.Warnings.Add($"Không tìm thấy file {fileName}, bỏ qua.");
            return default;
        }

        try
        {
            await using var stream = File.OpenRead(path);
            return await JsonSerializer.DeserializeAsync<T>(stream, _jsonOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            report.Warnings.Add($"Không đọc được file {fileName}: {ex.Message}");
            return default;
        }
    }
}
