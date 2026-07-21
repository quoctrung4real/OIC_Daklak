using System.Text.Json.Nodes;
using Backend.Models;

namespace Backend.Services;

public interface IPortalDataStore
{
    Task<JsonObject> GetConfigAsync(CancellationToken cancellationToken);
    Task SaveConfigAsync(JsonObject config, CancellationToken cancellationToken);

    Task<ContentPageDto> GetContentPageAsync(string slug, CancellationToken cancellationToken);
    Task SaveContentPageAsync(string slug, ContentPageDto page, CancellationToken cancellationToken);

    Task<CategoryPageDto> GetNewsCategoryAsync(NewsCategoryInfo category, CancellationToken cancellationToken);
    Task SaveNewsCategoryAsync(NewsCategoryInfo category, CategoryPageDto page, CancellationToken cancellationToken);
    Task<List<NewsPostDto>> GetMainNewsAsync(CancellationToken cancellationToken);
    Task AddMainNewsAsync(NewsPostDto post, CancellationToken cancellationToken);

    Task<List<UserDto>> GetUsersAsync(CancellationToken cancellationToken);
    Task<UserDto?> GetUserAsync(string username, CancellationToken cancellationToken);
    Task<UserDto?> LoginAsync(string username, string password, CancellationToken cancellationToken);
    Task<(bool Success, string Message, UserDto? User)> RegisterAsync(UserDto user, CancellationToken cancellationToken);
    Task<(bool Success, string Message, UserDto? User)> UpdateUserAsync(string username, UserDto user, CancellationToken cancellationToken);
    Task<(bool Success, string Message)> AdminSaveUserAsync(string? username, UserDto user, CancellationToken cancellationToken);
    Task<(bool Success, string Message)> AdminDeleteUserAsync(string username, CancellationToken cancellationToken);

    Task<List<CommentDto>> GetCommentsAsync(string pageId, CancellationToken cancellationToken);
    Task<CommentDto> AddCommentAsync(CommentDto comment, CancellationToken cancellationToken);
    Task<int?> VoteCommentAsync(string id, bool isLike, CancellationToken cancellationToken);
    Task<(bool Success, string Message)> DeleteCommentAsync(string id, string username, CancellationToken cancellationToken);

    Task<List<AnnouncementDto>> GetAnnouncementsAsync(int take, CancellationToken cancellationToken);
    Task<List<DocumentTypeDto>> GetDocumentTypesAsync(CancellationToken cancellationToken);
    Task<List<DocumentDto>> GetDocumentsAsync(string? typeCode, int take, CancellationToken cancellationToken);
    Task<DocumentDto> AddDocumentAsync(DocumentDto payload, CancellationToken cancellationToken = default);
    Task<DocumentDto> UpdateDocumentAsync(int id, DocumentDto payload, CancellationToken cancellationToken = default);
    Task DeleteDocumentAsync(int id, CancellationToken cancellationToken = default);
    Task<DocumentDto?> GetDocumentByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<SearchResultDto>> SearchAsync(string keyword, int take, CancellationToken cancellationToken);
    Task<HomePageDto> GetHomePageAsync(CancellationToken cancellationToken);
    
    // Ý kiến dự thảo
    Task<List<DraftOpinionDto>> GetDraftOpinionsAsync(CancellationToken cancellationToken);
    Task<DraftOpinionDto?> GetDraftOpinionByIdAsync(int id, CancellationToken cancellationToken);
    Task<DraftOpinionDto> AddDraftOpinionAsync(DraftOpinionDto payload, CancellationToken cancellationToken);
    Task<DraftOpinionDto> UpdateDraftOpinionAsync(int id, DraftOpinionDto payload, CancellationToken cancellationToken);
    Task DeleteDraftOpinionAsync(int id, CancellationToken cancellationToken);
    
    // Góp ý
    Task<List<OpinionFeedbackDto>> GetFeedbacksAsync(int? draftOpinionId, CancellationToken cancellationToken);
    Task<OpinionFeedbackDto> AddFeedbackAsync(OpinionFeedbackDto payload, CancellationToken cancellationToken);
    Task DeleteFeedbackAsync(int id, CancellationToken cancellationToken);
}
