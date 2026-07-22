USE IOC_Daklak;
GO

SET NOCOUNT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
GO

DECLARE @AdminId INT = ISNULL((SELECT TOP (1) Id FROM Auth.Users WHERE Username = 'admin' AND IsDeleted = 0), 1);
GO

MERGE Gov.DocumentTypes AS target
USING (VALUES
    (N'Công văn',       'cong-van',       1),
    (N'Báo cáo',        'bao-cao',        2),
    (N'Kế hoạch',       'ke-hoach',       3),
    (N'Quyết định',     'quyet-dinh',     4),
    (N'Hướng dẫn',      'huong-dan',      5),
    (N'Chương trình',   'chuong-trinh',   6),
    (N'Tập huấn',       'tap-huan',       7),
    (N'Tài liệu test',  'tai-lieu-test',  8)
) AS source (Name, Code, DisplayOrder)
ON target.Code = source.Code
WHEN MATCHED THEN
    UPDATE SET Name = source.Name, DisplayOrder = source.DisplayOrder, IsActive = 1
WHEN NOT MATCHED THEN
    INSERT (Name, Code, DisplayOrder, IsActive)
    VALUES (source.Name, source.Code, source.DisplayOrder, 1);
GO

DECLARE @AdminId INT = ISNULL((SELECT TOP (1) Id FROM Auth.Users WHERE Username = 'admin' AND IsDeleted = 0), 1);

MERGE Gov.Documents AS target
USING (
    SELECT t.Id AS DocumentTypeId, v.DocumentNumber, v.PublishedAt, v.Title, v.FileUrl, v.IssuingAuthority
    FROM (VALUES
        ('cong-van',      '29/CT-UBND',       CAST('2021-12-27' AS DATETIME2), N'CHỈ THỊ Về đẩy mạnh cải cách hành chính gắn với chính quyền số trên địa bàn tỉnh', N'/documents/29_ct_ubnd.pdf', N'UBND Tỉnh'),
        ('cong-van',      '14-NQ/TU',         CAST('2021-12-08' AS DATETIME2), N'Nghị quyết Hội nghị lần thứ 6 BCH Đảng bộ tỉnh Khóa XVI về phát triển KT-XH năm 2022', N'/documents/14_nq_tu.pdf', N'Tỉnh Ủy'),
        ('ke-hoach',      '3128/QĐ-UBND',     CAST('2021-11-30' AS DATETIME2), N'Kế hoạch triển khai Chương trình chuyển đổi số tỉnh Đắk Lắk 2021-2025, định hướng 2030', N'/documents/3128_qd_ubnd.pdf', N'UBND Tỉnh'),
        ('bao-cao',       '62/2021/QĐ-UBND',  CAST('2021-10-04' AS DATETIME2), N'Quy định Quản lý, vận hành và tích hợp ứng dụng Đắk Lắk Số', N'/documents/62_qd_ubnd.pdf', N'UBND Tỉnh'),
        ('quyet-dinh',    '01/QD-IOC',        CAST('2026-07-10' AS DATETIME2), N'Quyết định ban hành quy chế vận hành Trung tâm IOC Đắk Lắk', N'/documents/01_qd_ioc.pdf', N'Trung tâm IOC Đắk Lắk'),
        ('huong-dan',     '02/HD-IOC',        CAST('2026-07-09' AS DATETIME2), N'Hướng dẫn khai thác và sử dụng hệ thống thông tin Trung tâm IOC', N'/documents/02_hd_ioc.pdf', N'Trung tâm IOC Đắk Lắk'),
        ('chuong-trinh',  '03/CT-IOC',        CAST('2026-07-08' AS DATETIME2), N'Chương trình phối hợp triển khai dịch vụ đô thị thông minh năm 2026', N'/documents/03_ct_ioc.pdf', N'Trung tâm IOC Đắk Lắk'),
        ('tap-huan',      '04/TH-IOC',        CAST('2026-07-07' AS DATETIME2), N'Tài liệu tập huấn sử dụng cổng thông tin và hệ thống điều hành IOC', N'/documents/04_th_ioc.pdf', N'Trung tâm IOC Đắk Lắk'),
        ('tai-lieu-test', 'TEST-001/IOC',     CAST('2026-07-14' AS DATETIME2), N'[TEST] Tài liệu kiểm thử văn bản', N'/documents/test-001-ioc.pdf', N'Trung tâm IOC Đắk Lắk')
    ) AS v(TypeCode, DocumentNumber, PublishedAt, Title, FileUrl, IssuingAuthority)
    INNER JOIN Gov.DocumentTypes t ON t.Code = v.TypeCode
) AS source
ON target.DocumentNumber = source.DocumentNumber
WHEN MATCHED THEN
    UPDATE SET
        DocumentTypeId = source.DocumentTypeId,
        PublishedAt = source.PublishedAt,
        Title = source.Title,
        FileUrl = source.FileUrl,
        IssuingAuthority = source.IssuingAuthority,
        IsActive = 1,
        IsDeleted = 0,
        UpdatedAt = SYSUTCDATETIME(),
        DeletedAt = NULL
WHEN NOT MATCHED THEN
    INSERT (DocumentTypeId, DocumentNumber, PublishedAt, Title, FileUrl, IssuingAuthority, IsActive, IsDeleted, CreatedAt, CreatedBy)
    VALUES (source.DocumentTypeId, source.DocumentNumber, source.PublishedAt, source.Title, source.FileUrl, source.IssuingAuthority, 1, 0, SYSUTCDATETIME(), @AdminId);
GO

PRINT N'Imported IOC Daklak test document data.';
GO

MERGE Gov.DraftOpinions AS target
USING (VALUES
    (N'DT-01/IOC', N'Dự thảo Quy chế tiếp nhận và xử lý ý kiến góp ý trên Cổng thông tin IOC', N'/documents/dt_01_ioc.pdf', N'du-thao-quy-che-gop-y.pdf', CAST('2026-08-15' AS DATETIME2), N'Trung tâm IOC'),
    (N'DT-02/IOC', N'Dự thảo Kế hoạch triển khai dịch vụ đô thị thông minh năm 2026', N'/documents/dt_02_ioc.pdf', N'du-thao-ke-hoach-do-thi-thong-minh-2026.pdf', CAST('2026-08-30' AS DATETIME2), N'UBND tỉnh Đắk Lắk'),
    (N'DT-03/SKHCN', N'Dự thảo Hướng dẫn khai thác nền tảng dữ liệu dùng chung tỉnh Đắk Lắk', N'/documents/dt_03_skhcn.pdf', N'du-thao-huong-dan-du-lieu-dung-chung.pdf', CAST('2026-09-10' AS DATETIME2), N'Sở KHCN'),
    (N'DT-04/IOC', N'Báo cáo kết quả vận hành Trung tâm IOC và các dịch vụ đô thị thông minh', N'/documents/dt_04_ioc.pdf', N'bao-cao-van-hanh-ioc-2026.pdf', CAST('2026-09-20' AS DATETIME2), N'Báo cáo')
) AS source (DocumentNumber, Title, FileUrl, OriginalFileName, EndDate, Category)
ON target.DocumentNumber = source.DocumentNumber
WHEN MATCHED THEN
    UPDATE SET
        Title = source.Title,
        FileUrl = source.FileUrl,
        OriginalFileName = source.OriginalFileName,
        EndDate = source.EndDate,
        Category = source.Category,
        IsDeleted = 0
WHEN NOT MATCHED THEN
    INSERT (DocumentNumber, Title, FileUrl, OriginalFileName, CreatedAt, EndDate, Category, IsDeleted)
    VALUES (source.DocumentNumber, source.Title, source.FileUrl, source.OriginalFileName, SYSUTCDATETIME(), source.EndDate, source.Category, 0);
GO

PRINT N'Imported IOC Daklak test draft opinion data.';
GO

MERGE Portal.UserQuestions AS target
USING (VALUES
    (1001, N'Dịch vụ công', N'Cách theo dõi hồ sơ trực tuyến?', N'Nguyễn Văn Minh', N'minh.test@example.com', N'0901000001', N'Buôn Ma Thuột', N'Tôi muốn biết cách kiểm tra tiến độ xử lý hồ sơ trực tuyến.', CAST('2026-07-15T08:30:00' AS DATETIME2), 'answered', N'Bạn đăng nhập Cổng dịch vụ công, chọn mục Hồ sơ của tôi và nhập mã hồ sơ để theo dõi.', 1),
    (1002, N'Giao thông', N'Phản ánh tình trạng đèn tín hiệu', N'Trần Thị Lan', N'lan.test@example.com', N'0901000002', N'Đường Lê Duẩn, Buôn Ma Thuột', N'Đèn tín hiệu tại nút giao hoạt động không ổn định vào giờ cao điểm.', CAST('2026-07-16T09:15:00' AS DATETIME2), 'pending', NULL, 0),
    (1003, N'Đô thị thông minh', N'Cách gửi phản ánh hiện trường?', N'Hoàng Quốc Anh', N'anh.test@example.com', N'0901000003', N'Đắk Lắk', N'Người dân có thể gửi ảnh và vị trí phản ánh hiện trường bằng cách nào?', CAST('2026-07-17T14:20:00' AS DATETIME2), 'answered', N'Bạn sử dụng chức năng Tương tác công dân, nhập nội dung, địa chỉ và đính kèm hình ảnh nếu có.', 1)
) AS source (Id, Topic, Title, SenderName, SenderEmail, SenderPhone, Address, Content, CreatedAt, Status, Answer, IsPublic)
ON target.Id = source.Id
WHEN MATCHED THEN UPDATE SET
    Topic = source.Topic, Title = source.Title, SenderName = source.SenderName,
    SenderEmail = source.SenderEmail, SenderPhone = source.SenderPhone,
    Address = source.Address, Content = source.Content, CreatedAt = source.CreatedAt,
    Status = source.Status, Answer = source.Answer, IsPublic = source.IsPublic,
    IsDeleted = 0, UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT
    (Id, Topic, Title, SenderName, SenderEmail, SenderPhone, Address, Content, CreatedAt, Status, Answer, IsPublic, IsDeleted)
VALUES
    (source.Id, source.Topic, source.Title, source.SenderName, source.SenderEmail, source.SenderPhone, source.Address, source.Content, source.CreatedAt, source.Status, source.Answer, source.IsPublic, 0);
GO

PRINT N'Imported IOC Daklak test user-question data.';
GO

DECLARE @NewsAdminId INT = ISNULL((SELECT TOP (1) Id FROM Auth.Users WHERE Username = 'admin' AND IsDeleted = 0), 1);

MERGE Cms.Articles AS target
USING (
    SELECT c.Id AS CategoryId, source.*
    FROM (VALUES
        ('cap-nhat-bao-lu', N'Cập nhật công tác phòng, chống thiên tai trên địa bàn tỉnh', N'Thông tin tổng hợp phục vụ kiểm thử chuyên mục cập nhật bão lũ.', N'<p>Các đơn vị duy trì trực ban, theo dõi diễn biến thời tiết và chủ động phương án ứng phó.</p>', N'Trung tâm IOC', CAST('2026-07-20T08:00:00' AS DATETIME2), CAST(0 AS BIT), CAST(125 AS INT), NULL, NULL),
        ('cds-doi-moi-sang-tao', N'Đẩy mạnh chuyển đổi số trong hoạt động cơ quan nhà nước', N'Tin mẫu về chuyển đổi số và đổi mới sáng tạo.', N'<p>Tỉnh tiếp tục triển khai nền tảng số dùng chung và nâng cao chất lượng dịch vụ công trực tuyến.</p>', N'Trung tâm IOC', CAST('2026-07-19T09:00:00' AS DATETIME2), CAST(1 AS BIT), CAST(98 AS INT), NULL, NULL),
        ('chi-dao-dieu-hanh', N'Chỉ đạo tăng cường xử lý hồ sơ trực tuyến', N'Nội dung chỉ đạo điều hành phục vụ kiểm thử.', N'<p>Các cơ quan chuyên môn rà soát tiến độ, bảo đảm hồ sơ được xử lý đúng hạn.</p>', N'UBND tỉnh Đắk Lắk', CAST('2026-07-18T10:00:00' AS DATETIME2), CAST(0 AS BIT), CAST(76 AS INT), NULL, NULL),
        ('cong-tac-xay-dung-dang', N'Nâng cao chất lượng công tác xây dựng Đảng trong tình hình mới', N'Tin mẫu thuộc chuyên mục công tác xây dựng Đảng.', N'<p>Tiếp tục đổi mới phương thức lãnh đạo và nâng cao hiệu quả hoạt động của tổ chức cơ sở Đảng.</p>', N'Tỉnh ủy Đắk Lắk', CAST('2026-07-17T08:30:00' AS DATETIME2), CAST(0 AS BIT), CAST(64 AS INT), NULL, NULL),
        ('giai-phap-an-toan-mang', N'Giải pháp giám sát và cảnh báo an toàn mạng tập trung', N'Giới thiệu giải pháp an toàn mạng phục vụ Trung tâm IOC.', N'<p>Hệ thống hỗ trợ phát hiện sớm nguy cơ, cảnh báo sự cố và phối hợp xử lý tập trung.</p>', N'Trung tâm IOC', CAST('2026-07-16T14:00:00' AS DATETIME2), CAST(0 AS BIT), CAST(53 AS INT), NULL, NULL),
        ('giai-phap-an-toan-thong-tin', N'Tăng cường bảo vệ dữ liệu và an toàn thông tin', N'Khuyến nghị bảo vệ tài khoản và dữ liệu trong cơ quan nhà nước.', N'<p>Người dùng cần sử dụng mật khẩu mạnh, xác thực nhiều lớp và tuân thủ quy trình sao lưu dữ liệu.</p>', N'Sở KHCN', CAST('2026-07-15T13:00:00' AS DATETIME2), CAST(0 AS BIT), CAST(87 AS INT), NULL, NULL),
        ('thong-bao', N'Thông báo lịch bảo trì hệ thống dịch vụ công', N'Hệ thống tạm dừng trong khung giờ bảo trì định kỳ.', N'<p>Thời gian bảo trì từ 22 giờ đến 23 giờ 30. Các dịch vụ sẽ hoạt động bình thường sau thời gian trên.</p>', N'Trung tâm IOC', CAST('2026-07-14T16:00:00' AS DATETIME2), CAST(1 AS BIT), CAST(112 AS INT), NULL, NULL),
        ('tieu-chuan-chat-luong', N'Áp dụng tiêu chuẩn chất lượng trong cung cấp dịch vụ số', N'Tin mẫu về tiêu chuẩn và quản lý chất lượng.', N'<p>Việc chuẩn hóa quy trình góp phần nâng cao tính ổn định và trải nghiệm của người sử dụng.</p>', N'Sở KHCN', CAST('2026-07-13T09:30:00' AS DATETIME2), CAST(0 AS BIT), CAST(45 AS INT), NULL, NULL),
        ('tin-hoat-dong', N'Trung tâm IOC tổ chức diễn tập vận hành hệ thống', N'Tin hoạt động phục vụ kiểm thử giao diện danh sách và chi tiết.', N'<p>Buổi diễn tập kiểm tra quy trình tiếp nhận, phân tích và điều phối xử lý thông tin.</p>', N'Trung tâm IOC', CAST('2026-07-12T15:30:00' AS DATETIME2), CAST(1 AS BIT), CAST(134 AS INT), NULL, NULL),
        ('trao-doi-kinh-nghiem', N'Chia sẻ kinh nghiệm triển khai trung tâm điều hành thông minh', N'Kinh nghiệm tổ chức dữ liệu và vận hành hệ thống IOC.', N'<p>Các đơn vị trao đổi mô hình quản trị dữ liệu, giám sát chỉ số và phối hợp liên ngành.</p>', N'Trung tâm IOC', CAST('2026-07-11T10:30:00' AS DATETIME2), CAST(0 AS BIT), CAST(69 AS INT), NULL, NULL),
        ('tuong-tac-cong-dan', N'Hướng dẫn gửi phản ánh và theo dõi kết quả xử lý', N'Hướng dẫn người dân sử dụng kênh tương tác trực tuyến.', N'<p>Người dân nhập nội dung, địa chỉ và thông tin liên hệ để cơ quan chức năng tiếp nhận xử lý.</p>', N'Trung tâm IOC', CAST('2026-07-10T11:00:00' AS DATETIME2), CAST(0 AS BIT), CAST(156 AS INT), NULL, NULL),
        ('tin-tuc-da-phuong-tien', N'Video giới thiệu Trung tâm Giám sát, điều hành đô thị thông minh', N'Nội dung video mẫu để kiểm thử trang tin đa phương tiện.', N'<p>Video giới thiệu chức năng tổng hợp, giám sát và điều phối dữ liệu của Trung tâm IOC.</p>', N'Trung tâm IOC', CAST('2026-07-09T08:00:00' AS DATETIME2), CAST(1 AS BIT), CAST(203 AS INT), 'video', N'https://www.youtube.com/embed/dQw4w9WgXcQ')
    ) AS source(Code, Title, Summary, Content, Author, PublishedAt, IsFeatured, ViewCount, MultimediaType, VideoUrl)
    INNER JOIN Cms.ArticleCategories c ON c.Code = source.Code AND c.IsDeleted = 0
) AS source
ON target.CategoryId = source.CategoryId AND target.Title = source.Title
WHEN MATCHED THEN UPDATE SET
    Summary = source.Summary, Content = source.Content, Author = source.Author,
    PublishedAt = source.PublishedAt, IsFeatured = source.IsFeatured,
    ViewCount = source.ViewCount, MultimediaType = source.MultimediaType,
    VideoUrl = source.VideoUrl, IsActive = 1, IsDeleted = 0,
    UpdatedAt = SYSUTCDATETIME(), DeletedAt = NULL
WHEN NOT MATCHED THEN INSERT
    (CategoryId, Title, Summary, Content, Author, PublishedAt, IsFeatured, ViewCount,
     MultimediaType, VideoUrl, IsActive, IsDeleted, CreatedAt, CreatedBy)
VALUES
    (source.CategoryId, source.Title, source.Summary, source.Content, source.Author,
     source.PublishedAt, source.IsFeatured, source.ViewCount, source.MultimediaType,
     source.VideoUrl, 1, 0, SYSUTCDATETIME(), @NewsAdminId);
GO

PRINT N'Imported IOC Daklak test news data for all menu categories.';
GO
