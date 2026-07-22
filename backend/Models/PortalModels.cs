using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Backend.Models;

public sealed class NewsCategoryInfo
{
    public required string Slug { get; init; }
    public required string Title { get; init; }
}

public sealed class ContentPageDto
{
    public string? Title { get; set; }
    public string? Content { get; set; }
}

public sealed class CategoryPageDto
{
    public string? Title { get; set; }
    public List<NewsPostDto> Posts { get; set; } = [];
}

public sealed class NewsPostDto
{
    public string? Id { get; set; }
    public string? Title { get; set; }
    public string? ImageUrl { get; set; }
    public string? Source { get; set; }
    public string? Author { get; set; }
    public string? Content { get; set; }
    public string? LinkUrl { get; set; }
    public string? LinkText { get; set; }
    public string? VideoUrl { get; set; }
    public string? MultimediaType { get; set; }
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }
    public bool IsFeatured { get; set; }
    public string? CreatedAt { get; set; }
    public int Views { get; set; } = 0;
}

public sealed class UserDto
{
    public string? Id { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string Role { get; set; } = "User";
    public string? RegisterDate { get; set; }
    public string? Email { get; set; }
    public string? DateOfBirth { get; set; }
    public string? AvatarUrl { get; set; }
    public string? FullName { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class AuthResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public UserDto? User { get; set; }
    public string? AccessToken { get; set; }
    public string TokenType { get; set; } = "Bearer";
    public string? ExpiresAt { get; set; }
}

public sealed class CommentDto
{
    public string? Id { get; set; }
    public string? PageId { get; set; }
    public string? Username { get; set; }
    public string? Content { get; set; }
    public int Likes { get; set; }
    public int Dislikes { get; set; }
    public string? AvatarUrl { get; set; }
    public string? CreatedAt { get; set; }
}

public sealed class AnnouncementDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? Url { get; set; }
    public string? PublishedAt { get; set; }
}

public sealed class DocumentTypeDto
{
    public int Id { get; set; }
    public string? Code { get; set; }
    public string? Name { get; set; }
    public int DisplayOrder { get; set; }
}

public sealed class DocumentDto
{
    public int Id { get; set; }
    public string? TypeCode { get; set; }
    public string? TypeName { get; set; }
    public string? DocumentNumber { get; set; }
    public string? PublishedAt { get; set; }
    public string? EffectiveDate { get; set; }
    public string? Domain { get; set; }
    public string? Title { get; set; }
    public string? FileUrl { get; set; }
    public string? OriginalFileName { get; set; }
    public string? IssuingAuthority { get; set; }
    public string? Signer { get; set; }
}

public sealed class SearchResultDto
{
    public string? Type { get; set; }
    public string? Title { get; set; }
    public string? Summary { get; set; }
    public string? Url { get; set; }
    public string? PublishedAt { get; set; }
}

public sealed class HomePageDto
{
    public JsonObject Config { get; set; } = [];
    public List<NewsPostDto> FeaturedNews { get; set; } = [];
    public List<AnnouncementDto> Announcements { get; set; } = [];
    public List<DocumentTypeDto> DocumentTypes { get; set; } = [];
    public List<DocumentDto> Documents { get; set; } = [];
}

public sealed class UploadOptions
{
    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024;
    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
}

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "IOC_Daklak";
    public string Audience { get; set; } = "IOC_Daklak_Frontend";
    public string SigningKey { get; set; } = "IOC_Daklak_dev_signing_key_change_before_production_2026";
    public int ExpiresMinutes { get; set; } = 120;
}

public sealed class TextToSpeechOptions
{
    public string Provider { get; set; } = "Espeak";
    public string? ExecutablePath { get; set; }
    public string ExecutableName { get; set; } = "espeak-ng";
    public string Voice { get; set; } = "vi";
    public int Speed { get; set; } = 150;
    public int Pitch { get; set; } = 50;
    public int MaxTextLength { get; set; } = 6000;
    public int TimeoutSeconds { get; set; } = 45;
    public string? AzureKey { get; set; }
    public string? AzureRegion { get; set; }
    public string AzureVoice { get; set; } = "vi-VN-HoaiMyNeural";
    public string AzureOutputFormat { get; set; } = "audio-24khz-48kbitrate-mono-mp3";
}

public sealed class TextToSpeechRequestDto
{
    public string? Text { get; set; }
    public string? Voice { get; set; }
    public int? Speed { get; set; }
    public int? Pitch { get; set; }
}

public sealed class TextToSpeechResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? AudioUrl { get; set; }
    public string? Voice { get; set; }
    public int TextLength { get; set; }
    public bool Cached { get; set; }

    public static TextToSpeechResponseDto Ok(string audioUrl, string voice, int textLength, bool cached)
    {
        return new TextToSpeechResponseDto
        {
            Success = true,
            Message = cached ? "Da co audio trong cache." : "Tao audio thanh cong.",
            AudioUrl = audioUrl,
            Voice = voice,
            TextLength = textLength,
            Cached = cached
        };
    }

    public static TextToSpeechResponseDto Fail(string message)
    {
        return new TextToSpeechResponseDto
        {
            Success = false,
            Message = message
        };
    }
}

public sealed class DraftOpinionDto
{
    public int Id { get; set; }
    public string? DocumentNumber { get; set; }
    public string? Title { get; set; }
    public string? FileUrl { get; set; }
    public string? OriginalFileName { get; set; }
    public string? CreatedAt { get; set; }
    public string? EndDate { get; set; }
    public string? Category { get; set; } = "Trung tâm IOC";
}

public sealed class OpinionFeedbackDto
{
    public int Id { get; set; }
    public int DraftOpinionId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Content { get; set; }
    public string? CreatedAt { get; set; }
}

public sealed class LoginRequestDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}

public sealed class RegisterRequestDto
{
    public required string Username { get; set; }
    public required string Password { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? DateOfBirth { get; set; }
    public string? AvatarUrl { get; set; }
}

public sealed class FaqRequestDto
{
    public required string Question { get; set; }
    public required string Answer { get; set; }
    public int Order { get; set; }
}

public sealed class UserQuestionRequestDto
{
    public string? Topic { get; set; }
    public string? Title { get; set; }
    public required string SenderName { get; set; }
    public required string SenderEmail { get; set; }
    public string? SenderPhone { get; set; }
    public string? Address { get; set; }
    public required string Content { get; set; }
}

public sealed class UserQuestionReplyRequestDto
{
    public required string Answer { get; set; }
    public bool IsPublic { get; set; }
}

public sealed class OpinionFeedbackRequestDto
{
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public required string Content { get; set; }
}

public sealed class CommentRequestDto
{
    public required string PageId { get; set; }
    public required string Content { get; set; }
}

public sealed class UpdateProfileRequestDto
{
    public string? Password { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? DateOfBirth { get; set; }
    public string? AvatarUrl { get; set; }
}

public sealed class AdminUserRequestDto
{
    public required string Username { get; set; }
    public string? Password { get; set; }
    public string Role { get; set; } = "User";
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? DateOfBirth { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class DocumentRequestDto
{
    public required string TypeCode { get; set; }
    public string? DocumentNumber { get; set; }
    public string? PublishedAt { get; set; }
    public required string Title { get; set; }
    public string? FileUrl { get; set; }
    public string? OriginalFileName { get; set; }
    public string? IssuingAuthority { get; set; }
}

public sealed class DraftOpinionRequestDto
{
    public string? DocumentNumber { get; set; }
    public required string Title { get; set; }
    public string? FileUrl { get; set; }
    public string? OriginalFileName { get; set; }
    public string? EndDate { get; set; }
    public string? Category { get; set; }
}

public sealed class FaqDto
{
    public int Id { get; set; }
    public string? Question { get; set; }
    public string? Answer { get; set; }
    public int Order { get; set; }
}

public sealed class UserQuestionDto
{
    public int Id { get; set; }
    public string? Topic { get; set; }
    public string? Title { get; set; }
    public string? SenderName { get; set; }
    public string? SenderEmail { get; set; }
    public string? SenderPhone { get; set; }
    public string? Address { get; set; }
    public string? Content { get; set; }
    public string? CreatedAt { get; set; }
    public string Status { get; set; } = "pending";
    public string? Answer { get; set; }
    public bool IsPublic { get; set; }
}
