USE IOC_Daklak;
GO

SET NOCOUNT ON;
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
    (N'DT-01/IOC', N'Du thao Quy che tiep nhan va xu ly y kien gop y tren Cong thong tin IOC', N'/documents/dt_01_ioc.pdf', N'du-thao-quy-che-gop-y.pdf', CAST('2026-08-15' AS DATETIME2)),
    (N'DT-02/IOC', N'Du thao Ke hoach trien khai dich vu do thi thong minh nam 2026', N'/documents/dt_02_ioc.pdf', N'du-thao-ke-hoach-do-thi-thong-minh-2026.pdf', CAST('2026-08-30' AS DATETIME2)),
    (N'DT-03/SKHCN', N'Du thao Huong dan khai thac nen tang du lieu dung chung tinh Dak Lak', N'/documents/dt_03_skhcn.pdf', N'du-thao-huong-dan-du-lieu-dung-chung.pdf', CAST('2026-09-10' AS DATETIME2))
) AS source (DocumentNumber, Title, FileUrl, OriginalFileName, EndDate)
ON target.DocumentNumber = source.DocumentNumber
WHEN MATCHED THEN
    UPDATE SET
        Title = source.Title,
        FileUrl = source.FileUrl,
        OriginalFileName = source.OriginalFileName,
        EndDate = source.EndDate,
        IsDeleted = 0
WHEN NOT MATCHED THEN
    INSERT (DocumentNumber, Title, FileUrl, OriginalFileName, CreatedAt, EndDate, IsDeleted)
    VALUES (source.DocumentNumber, source.Title, source.FileUrl, source.OriginalFileName, SYSUTCDATETIME(), source.EndDate, 0);
GO

PRINT N'Imported IOC Daklak test draft opinion data.';
GO
