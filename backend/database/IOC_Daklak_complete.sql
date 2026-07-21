-- =====================================================================================
--
--  ██╗ ██████╗  ██████╗    ██████╗  █████╗ ██╗  ██╗    ██╗      █████╗ ██╗  ██╗
--  ██║██╔═══██╗██╔════╝    ██╔══██╗██╔══██╗██║ ██╔╝    ██║     ██╔══██╗██║ ██╔╝
--  ██║██║   ██║██║         ██║  ██║███████║█████╔╝     ██║     ███████║█████╔╝
--  ██║██║   ██║██║         ██║  ██║██╔══██║██╔═██╗     ██║     ██╔══██║██╔═██╗
--  ██║╚██████╔╝╚██████╗    ██████╔╝██║  ██║██║  ██╗    ███████╗██║  ██║██║  ██╗
--  ╚═╝ ╚═════╝  ╚═════╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
--
-- =====================================================================================
-- IOC DAK LAK - ENTERPRISE DATABASE SCHEMA
-- =====================================================================================
-- Tên dự án        : Cổng thông tin Trung tâm Giám sát, Điều hành Đô thị Thông minh
--                     tỉnh Đắk Lắk (IOC Dak Lak)
-- Target Platform  : Microsoft SQL Server 2019+ / SQL Server Express / LocalDB
-- Database Name    : IOC_Daklak
-- Version          : 2.0.0
-- Author           : IOC Dak Lak Development Team
-- Last Updated     : 2026-07-12
-- =====================================================================================
--
-- MỤC LỤC (TABLE OF CONTENTS):
--   PHASE 0  : Khởi tạo Database (CREATE DATABASE, Collation, Recovery Model)
--   PHASE 1  : Tạo Schemas (Auth, Portal, Cms, Gov, Emergency, SmartCity)
--   PHASE 2  : Bảng lõi – Auth.Users, Portal.SystemConfigs, Portal.ContentPages,
--              Portal.LinkCategories, Portal.ExternalLinks
--   PHASE 3  : Quản lý Nội dung (CMS) – ArticleCategories, Articles, Multimedia, Comments
--   PHASE 4  : Văn bản Chính phủ – Announcements, DocumentTypes, Documents
--   PHASE 5  : Quản lý Khẩn cấp – Emergency.DisasterPosts
--   PHASE 6  : Đô thị Thông minh – CitizenFeedbacks, TrafficCameras, IocIndicators
--   PHASE 7  : Dữ liệu mẫu (Seed Data) cho tất cả 16 bảng
--   PHASE 8  : Tạo tài khoản ứng dụng Web (Application Login & Permissions)
--   PHASE 9  : Báo cáo xác nhận kết quả
--
-- DESIGN PRINCIPLES (NGUYÊN TẮC THIẾT KẾ):
--   1. Phân vùng Schema theo lĩnh vực   : Auth, Portal, Cms, Gov, Emergency, SmartCity
--   2. Quy tắc đặt tên ràng buộc        : PK_, FK_, UQ_, CK_, DF_, IX_
--   3. Kiểu dữ liệu thời gian           : DATETIME2(7) thay vì DATETIME
--   4. Kiểu dữ liệu văn bản             : NVARCHAR cho tiếng Việt, VARCHAR cho mã/code
--   5. Nhật ký kiểm toán (Audit Trail)   : CreatedAt, CreatedBy, UpdatedAt, UpdatedBy
--   6. Xóa mềm (Soft Delete)            : IsDeleted + DeletedAt trên mọi bảng nghiệp vụ
--   7. Chỉ mục chiến lược (Indexes)      : Filtered non-clustered trên WHERE/JOIN/ORDER BY
--   8. Chuẩn hóa dữ liệu                : 3NF; ON DELETE NO ACTION cho mọi FK
--
-- THỐNG KÊ (SUMMARY):
--   Tổng số Schema  : 6
--   Tổng số Bảng    : 16
--   Tổng số Index   : 20+
--   Collation       : Vietnamese_CI_AS (hỗ trợ tiếng Việt có dấu trong sắp xếp)
--
-- =====================================================================================


-- =====================================================================================
-- PHASE 0: KHỞI TẠO DATABASE
-- =====================================================================================
USE [master];
GO

-- 0.1 Tạo Database nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'IOC_Daklak')
BEGIN
    CREATE DATABASE [IOC_Daklak]
        COLLATE Vietnamese_CI_AS    -- Collation tiếng Việt: sắp xếp đúng dấu (á, ă, â...)
    ;
    PRINT N'[✓] Database IOC_Daklak đã được tạo thành công.';
END
ELSE
BEGIN
    PRINT N'[i] Database IOC_Daklak đã tồn tại – bỏ qua CREATE.';
END
GO

-- 0.2 Cấu hình Database-level settings
ALTER DATABASE [IOC_Daklak] SET RECOVERY FULL;              -- Recovery Model FULL cho backup log
ALTER DATABASE [IOC_Daklak] SET AUTO_CLOSE OFF;              -- Không tự đóng kết nối
ALTER DATABASE [IOC_Daklak] SET AUTO_SHRINK OFF;             -- Không tự thu nhỏ file (gây fragmentation)
ALTER DATABASE [IOC_Daklak] SET READ_COMMITTED_SNAPSHOT ON;  -- Tránh deadlock khi đọc/ghi đồng thời
GO

PRINT N'[✓] Cấu hình Database-level settings hoàn tất.';
GO

-- 0.3 Chuyển sang database IOC_Daklak
USE [IOC_Daklak];
GO

-- =====================================================================================
-- PHASE 0.5: CLEAN SLATE - Xóa bảng cũ nếu tồn tại (theo thứ tự phụ thuộc FK)
-- =====================================================================================
-- SmartCity schema
IF OBJECT_ID('SmartCity.IocIndicators',    'U') IS NOT NULL DROP TABLE SmartCity.IocIndicators;
IF OBJECT_ID('SmartCity.TrafficCameras',    'U') IS NOT NULL DROP TABLE SmartCity.TrafficCameras;
IF OBJECT_ID('SmartCity.CitizenFeedbacks',  'U') IS NOT NULL DROP TABLE SmartCity.CitizenFeedbacks;

-- Emergency schema
IF OBJECT_ID('Emergency.DisasterPosts',    'U') IS NOT NULL DROP TABLE Emergency.DisasterPosts;

-- Gov schema
IF OBJECT_ID('Gov.OpinionFeedbacks',       'U') IS NOT NULL DROP TABLE Gov.OpinionFeedbacks;
IF OBJECT_ID('Gov.DraftOpinions',          'U') IS NOT NULL DROP TABLE Gov.DraftOpinions;
IF OBJECT_ID('Gov.Documents',              'U') IS NOT NULL DROP TABLE Gov.Documents;
IF OBJECT_ID('Gov.DocumentTypes',          'U') IS NOT NULL DROP TABLE Gov.DocumentTypes;
IF OBJECT_ID('Gov.Announcements',          'U') IS NOT NULL DROP TABLE Gov.Announcements;

-- Cms schema
IF OBJECT_ID('Cms.Comments',              'U') IS NOT NULL DROP TABLE Cms.Comments;
IF OBJECT_ID('Cms.Articles',              'U') IS NOT NULL DROP TABLE Cms.Articles;
IF OBJECT_ID('Cms.ArticleCategories',     'U') IS NOT NULL DROP TABLE Cms.ArticleCategories;
IF OBJECT_ID('Cms.Multimedia',            'U') IS NOT NULL DROP TABLE Cms.Multimedia;

-- Portal schema
IF OBJECT_ID('Portal.ExternalLinks',      'U') IS NOT NULL DROP TABLE Portal.ExternalLinks;
IF OBJECT_ID('Portal.LinkCategories',     'U') IS NOT NULL DROP TABLE Portal.LinkCategories;
IF OBJECT_ID('Portal.ContentPages',       'U') IS NOT NULL DROP TABLE Portal.ContentPages;
IF OBJECT_ID('Portal.SystemConfigs',      'U') IS NOT NULL DROP TABLE Portal.SystemConfigs;

-- Auth schema
IF OBJECT_ID('Auth.Users',               'U') IS NOT NULL DROP TABLE Auth.Users;
GO

PRINT N'[✓] Xóa bảng cũ (nếu có) hoàn tất.';
GO

-- =====================================================================================
-- PHASE 1: TẠO SCHEMAS – Phân vùng dữ liệu theo lĩnh vực
-- =====================================================================================
-- Auth       : Xác thực, quản lý tài khoản người dùng
-- Portal     : Cấu hình giao diện, trang nội dung tĩnh, liên kết ngoài
-- Cms        : Quản lý nội dung tin tức, đa phương tiện, bình luận
-- Gov        : Văn bản pháp luật, thông báo chính thức của cơ quan nhà nước
-- Emergency  : Bản tin khẩn cấp (bão lũ, thiên tai, cảnh báo)
-- SmartCity  : Phản ánh hiện trường, camera giám sát, chỉ số IOC Dashboard
-- =====================================================================================
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Auth')       EXEC('CREATE SCHEMA Auth');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Portal')     EXEC('CREATE SCHEMA Portal');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Cms')        EXEC('CREATE SCHEMA Cms');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Gov')        EXEC('CREATE SCHEMA Gov');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Emergency')  EXEC('CREATE SCHEMA Emergency');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'SmartCity')  EXEC('CREATE SCHEMA SmartCity');
GO

PRINT N'[✓] Tạo 6 Schemas hoàn tất: Auth, Portal, Cms, Gov, Emergency, SmartCity.';
GO

-- =====================================================================================
-- PHASE 2: CORE TABLES
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- Auth.Users – Tài khoản người dùng & quản trị viên
-- -------------------------------------------------------------------------------------
CREATE TABLE Auth.Users (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    Username        VARCHAR(50)                     NOT NULL,
    PasswordHash    VARCHAR(128)                    NOT NULL,
    Role            VARCHAR(20)                     NOT NULL    CONSTRAINT DF_Users_Role        DEFAULT ('User'),
    FullName        NVARCHAR(150)                   NULL,
    Email           VARCHAR(100)                    NULL,
    DateOfBirth     DATE                            NULL,
    AvatarUrl       VARCHAR(500)                    NULL,
    IsActive        BIT                             NOT NULL    CONSTRAINT DF_Users_IsActive    DEFAULT (1),
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_Users_IsDeleted   DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_Users_CreatedAt   DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_Users             PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_Users_Username    UNIQUE (Username),
    CONSTRAINT CK_Users_Role        CHECK (Role IN ('Admin', 'User'))
);
GO

CREATE NONCLUSTERED INDEX IX_Users_Username     ON Auth.Users (Username)         WHERE IsDeleted = 0;
CREATE NONCLUSTERED INDEX IX_Users_Email        ON Auth.Users (Email)            WHERE Email IS NOT NULL AND IsDeleted = 0;
CREATE NONCLUSTERED INDEX IX_Users_IsActive     ON Auth.Users (IsActive)         WHERE IsDeleted = 0;
CREATE NONCLUSTERED INDEX IX_Users_Role         ON Auth.Users (Role)             WHERE IsDeleted = 0;
GO

-- -------------------------------------------------------------------------------------
-- Portal.SystemConfigs – Cấu hình giao diện hệ thống (Key-Value Pattern)
-- -------------------------------------------------------------------------------------
CREATE TABLE Portal.SystemConfigs (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    ConfigKey       VARCHAR(100)                    NOT NULL,
    ConfigValue     NVARCHAR(1000)                  NULL,
    Description     NVARCHAR(255)                   NULL,
    UpdatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_SystemConfigs_UpdatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedBy       INT                             NULL,

    CONSTRAINT PK_SystemConfigs             PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_SystemConfigs_ConfigKey   UNIQUE (ConfigKey),
    CONSTRAINT FK_SystemConfigs_UpdatedBy   FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

-- -------------------------------------------------------------------------------------
-- Portal.ContentPages – Trang nội dung tĩnh/động (Giới thiệu, Lịch sử, Sơ đồ...)
-- -------------------------------------------------------------------------------------
CREATE TABLE Portal.ContentPages (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    Slug            VARCHAR(100)                    NOT NULL,   -- 'chuc-nang-nhiem-vu', 'lich-su-hinh-thanh'
    Title           NVARCHAR(250)                   NOT NULL,
    Content         NVARCHAR(MAX)                   NULL,       -- HTML content from Quill editor
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_ContentPages_IsDeleted DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_ContentPages_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_ContentPages              PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_ContentPages_Slug         UNIQUE (Slug),
    CONSTRAINT FK_ContentPages_CreatedBy    FOREIGN KEY (CreatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_ContentPages_UpdatedBy    FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_ContentPages_Slug ON Portal.ContentPages (Slug) WHERE IsDeleted = 0;
GO

-- -------------------------------------------------------------------------------------
-- Portal.LinkCategories – Danh mục nhóm liên kết (Bộ/Ngành, Sở/Ban, Nền tảng)
-- -------------------------------------------------------------------------------------
CREATE TABLE Portal.LinkCategories (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    Name            NVARCHAR(150)                   NOT NULL,
    Code            VARCHAR(50)                     NOT NULL,
    DisplayOrder    INT                             NOT NULL    CONSTRAINT DF_LinkCategories_Order     DEFAULT (0),
    IsActive        BIT                             NOT NULL    CONSTRAINT DF_LinkCategories_IsActive  DEFAULT (1),
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_LinkCategories_IsDeleted DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_LinkCategories_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_LinkCategories            PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_LinkCategories_Code       UNIQUE (Code),
    CONSTRAINT FK_LinkCategories_CreatedBy  FOREIGN KEY (CreatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_LinkCategories_UpdatedBy  FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

-- -------------------------------------------------------------------------------------
-- Portal.ExternalLinks – Liên kết ngoài (Cổng TTĐT, KHCN, Công an, Bộ ngành...)
-- -------------------------------------------------------------------------------------
CREATE TABLE Portal.ExternalLinks (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    CategoryId      INT                             NOT NULL,
    Title           NVARCHAR(250)                   NOT NULL,
    Description     NVARCHAR(500)                   NULL,
    Url             VARCHAR(500)                    NOT NULL,
    ImageUrl        VARCHAR(500)                    NULL,
    DisplayOrder    INT                             NOT NULL    CONSTRAINT DF_ExternalLinks_Order     DEFAULT (0),
    IsActive        BIT                             NOT NULL    CONSTRAINT DF_ExternalLinks_IsActive  DEFAULT (1),
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_ExternalLinks_IsDeleted DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_ExternalLinks_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_ExternalLinks             PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_ExternalLinks_CategoryId  FOREIGN KEY (CategoryId) REFERENCES Portal.LinkCategories(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_ExternalLinks_CreatedBy   FOREIGN KEY (CreatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_ExternalLinks_UpdatedBy   FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_ExternalLinks_CategoryId ON Portal.ExternalLinks (CategoryId) WHERE IsDeleted = 0;
GO

-- =====================================================================================
-- PHASE 3: CONTENT MANAGEMENT (CMS)
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- Cms.ArticleCategories – Danh mục tin tức (Tin nổi bật, Tương tác công dân, CĐS...)
-- -------------------------------------------------------------------------------------
CREATE TABLE Cms.ArticleCategories (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    Name            NVARCHAR(150)                   NOT NULL,
    Code            VARCHAR(50)                     NOT NULL,
    DisplayOrder    INT                             NOT NULL    CONSTRAINT DF_ArticleCategories_Order     DEFAULT (0),
    IsActive        BIT                             NOT NULL    CONSTRAINT DF_ArticleCategories_IsActive  DEFAULT (1),
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_ArticleCategories_IsDeleted DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_ArticleCategories_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_ArticleCategories             PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_ArticleCategories_Code        UNIQUE (Code),
    CONSTRAINT FK_ArticleCategories_CreatedBy   FOREIGN KEY (CreatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_ArticleCategories_UpdatedBy   FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

-- -------------------------------------------------------------------------------------
-- Cms.Articles – Bài viết / Tin tức
-- -------------------------------------------------------------------------------------
CREATE TABLE Cms.Articles (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    CategoryId      INT                             NOT NULL,
    Title           NVARCHAR(500)                   NOT NULL,
    Slug            VARCHAR(500)                    NULL,
    Summary         NVARCHAR(1000)                  NULL,
    Content         NVARCHAR(MAX)                   NOT NULL,
    ImageUrl        NVARCHAR(MAX)                   NULL,
    Source          NVARCHAR(250)                   NULL,
    Author          NVARCHAR(150)                   NULL,
    PublishedAt     DATETIME2(7)                    NULL,
    IsFeatured      BIT                             NOT NULL    CONSTRAINT DF_Articles_IsFeatured DEFAULT (0),
    ViewCount       INT                             NOT NULL    CONSTRAINT DF_Articles_ViewCount  DEFAULT (0),
    IsActive        BIT                             NOT NULL    CONSTRAINT DF_Articles_IsActive   DEFAULT (1),
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_Articles_IsDeleted  DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_Articles_CreatedAt  DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_Articles                  PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT CK_Articles_ViewCount        CHECK (ViewCount >= 0),
    CONSTRAINT FK_Articles_CategoryId       FOREIGN KEY (CategoryId) REFERENCES Cms.ArticleCategories(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Articles_CreatedBy        FOREIGN KEY (CreatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Articles_UpdatedBy        FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_Articles_CategoryId    ON Cms.Articles (CategoryId)    WHERE IsDeleted = 0;
CREATE NONCLUSTERED INDEX IX_Articles_PublishedAt   ON Cms.Articles (PublishedAt DESC) WHERE IsDeleted = 0 AND IsActive = 1;
CREATE NONCLUSTERED INDEX IX_Articles_IsFeatured    ON Cms.Articles (IsFeatured)    WHERE IsDeleted = 0 AND IsFeatured = 1;
GO

-- -------------------------------------------------------------------------------------
-- Cms.Multimedia – Đa phương tiện (Video, Hình ảnh, Infographic)
-- -------------------------------------------------------------------------------------
CREATE TABLE Cms.Multimedia (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    MediaType       VARCHAR(20)                     NOT NULL,   -- 'video', 'photo', 'infographic'
    Title           NVARCHAR(250)                   NOT NULL,
    MediaUrl        VARCHAR(500)                    NOT NULL,
    ThumbnailUrl    VARCHAR(500)                    NULL,
    IsFeatured      BIT                             NOT NULL    CONSTRAINT DF_Multimedia_IsFeatured DEFAULT (0),
    IsActive        BIT                             NOT NULL    CONSTRAINT DF_Multimedia_IsActive   DEFAULT (1),
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_Multimedia_IsDeleted  DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_Multimedia_CreatedAt  DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_Multimedia                PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT CK_Multimedia_MediaType      CHECK (MediaType IN ('video', 'photo', 'infographic')),
    CONSTRAINT FK_Multimedia_CreatedBy      FOREIGN KEY (CreatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Multimedia_UpdatedBy      FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_Multimedia_MediaType ON Cms.Multimedia (MediaType) WHERE IsDeleted = 0;
GO

-- -------------------------------------------------------------------------------------
-- Cms.Comments – Bình luận của người dùng trên các trang / bài viết
-- -------------------------------------------------------------------------------------
CREATE TABLE Cms.Comments (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    PageId          VARCHAR(100)                    NOT NULL,   -- Slug of page or ArticleId reference
    UserId          INT                             NOT NULL,
    Content         NVARCHAR(2000)                  NOT NULL,
    Likes           INT                             NOT NULL    CONSTRAINT DF_Comments_Likes      DEFAULT (0),
    Dislikes        INT                             NOT NULL    CONSTRAINT DF_Comments_Dislikes   DEFAULT (0),
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_Comments_IsDeleted  DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_Comments_CreatedAt  DEFAULT (SYSUTCDATETIME()),
    UpdatedAt       DATETIME2(7)                    NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_Comments                  PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT CK_Comments_Likes            CHECK (Likes >= 0),
    CONSTRAINT CK_Comments_Dislikes         CHECK (Dislikes >= 0),
    CONSTRAINT FK_Comments_UserId           FOREIGN KEY (UserId) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_Comments_PageId    ON Cms.Comments (PageId)             WHERE IsDeleted = 0;
CREATE NONCLUSTERED INDEX IX_Comments_UserId    ON Cms.Comments (UserId)             WHERE IsDeleted = 0;
CREATE NONCLUSTERED INDEX IX_Comments_CreatedAt ON Cms.Comments (CreatedAt DESC)     WHERE IsDeleted = 0;
GO

-- =====================================================================================
-- PHASE 4: GOVERNMENT & OFFICIAL DOCUMENTS
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- Gov.Announcements – Thông báo chung từ Trung tâm
-- -------------------------------------------------------------------------------------
CREATE TABLE Gov.Announcements (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    Title           NVARCHAR(500)                   NOT NULL,
    Content         NVARCHAR(MAX)                   NULL,
    Url             VARCHAR(500)                    NULL,
    PublishedAt     DATETIME2(7)                    NOT NULL    CONSTRAINT DF_Announcements_PublishedAt DEFAULT (SYSUTCDATETIME()),
    IsActive        BIT                             NOT NULL    CONSTRAINT DF_Announcements_IsActive    DEFAULT (1),
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_Announcements_IsDeleted   DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_Announcements_CreatedAt   DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_Announcements             PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Announcements_CreatedBy   FOREIGN KEY (CreatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Announcements_UpdatedBy   FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_Announcements_PublishedAt ON Gov.Announcements (PublishedAt DESC) WHERE IsDeleted = 0 AND IsActive = 1;
GO

-- -------------------------------------------------------------------------------------
-- Gov.DocumentTypes – Loại văn bản (Công văn, Báo cáo, Quyết định, Kế hoạch...)
-- -------------------------------------------------------------------------------------
CREATE TABLE Gov.DocumentTypes (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    Name            NVARCHAR(100)                   NOT NULL,
    Code            VARCHAR(50)                     NOT NULL,
    DisplayOrder    INT                             NOT NULL    CONSTRAINT DF_DocumentTypes_Order    DEFAULT (0),
    IsActive        BIT                             NOT NULL    CONSTRAINT DF_DocumentTypes_IsActive DEFAULT (1),

    CONSTRAINT PK_DocumentTypes             PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_DocumentTypes_Code        UNIQUE (Code)
);
GO

-- -------------------------------------------------------------------------------------
-- Gov.Documents – Văn bản quy phạm pháp luật, chỉ thị, kế hoạch
-- -------------------------------------------------------------------------------------
CREATE TABLE Gov.Documents (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    DocumentTypeId  INT                             NOT NULL,
    DocumentNumber  VARCHAR(50)                     NULL,       -- Số ký hiệu, vd: '29/CT-UBND'
    PublishedAt     DATETIME2(7)                    NULL,       -- Ngày ban hành
    Title           NVARCHAR(500)                   NOT NULL,   -- Nội dung trích yếu
    FileUrl         NVARCHAR(1000)                  NULL,       -- Đường dẫn file đính kèm
    OriginalFileName NVARCHAR(255)                  NULL,
    IssuingAuthority NVARCHAR(200)                  NULL,       -- Cơ quan ban hành
    EffectiveDate   NVARCHAR(50)                    NULL,
    Domain          NVARCHAR(150)                   NULL,
    Signer          NVARCHAR(150)                   NULL,
    IsActive        BIT                             NOT NULL    CONSTRAINT DF_Documents_IsActive   DEFAULT (1),
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_Documents_IsDeleted  DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_Documents_CreatedAt  DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_Documents                 PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Documents_DocumentTypeId  FOREIGN KEY (DocumentTypeId) REFERENCES Gov.DocumentTypes(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Documents_CreatedBy       FOREIGN KEY (CreatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Documents_UpdatedBy       FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_Documents_DocumentTypeId  ON Gov.Documents (DocumentTypeId)    WHERE IsDeleted = 0;
CREATE NONCLUSTERED INDEX IX_Documents_PublishedAt     ON Gov.Documents (PublishedAt DESC)  WHERE IsDeleted = 0 AND IsActive = 1;
CREATE NONCLUSTERED INDEX IX_Documents_DocumentNumber  ON Gov.Documents (DocumentNumber)    WHERE IsDeleted = 0;
GO

-- =====================================================================================
-- PHASE 5: EMERGENCY MANAGEMENT
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- Emergency.DisasterPosts – Bản tin cập nhật bão lũ / thiên tai
-- -------------------------------------------------------------------------------------
CREATE TABLE Emergency.DisasterPosts (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    Title           NVARCHAR(250)                   NOT NULL,
    ImageUrl        VARCHAR(500)                    NULL,
    Source          NVARCHAR(250)                   NULL,
    Content         NVARCHAR(MAX)                   NULL,
    LinkUrl         VARCHAR(500)                    NULL,
    LinkText        NVARCHAR(150)                   NULL,
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_DisasterPosts_IsDeleted DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_DisasterPosts_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_DisasterPosts             PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_DisasterPosts_CreatedBy   FOREIGN KEY (CreatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_DisasterPosts_UpdatedBy   FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_DisasterPosts_CreatedAt ON Emergency.DisasterPosts (CreatedAt DESC) WHERE IsDeleted = 0;
GO

-- =====================================================================================
-- PHASE 6: SMART CITY MODULES (Tham khảo dttm.hue.gov.vn)
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- SmartCity.CitizenFeedbacks – Phản ánh hiện trường (PAHT)
-- -------------------------------------------------------------------------------------
CREATE TABLE SmartCity.CitizenFeedbacks (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    Title           NVARCHAR(250)                   NOT NULL,
    Content         NVARCHAR(MAX)                   NOT NULL,
    Address         NVARCHAR(500)                   NULL,
    Latitude        DECIMAL(9,6)                    NULL,
    Longitude       DECIMAL(9,6)                    NULL,
    ImageUrl        VARCHAR(500)                    NULL,
    SenderName      NVARCHAR(100)                   NULL,
    SenderPhone     VARCHAR(20)                     NULL,
    SenderEmail     VARCHAR(100)                    NULL,
    UserId          INT                             NULL,       -- NULL if anonymous
    Status          TINYINT                         NOT NULL    CONSTRAINT DF_CitizenFeedbacks_Status    DEFAULT (0),  -- 0=Pending, 1=Processing, 2=Completed, 3=Rejected
    FeedbackReply   NVARCHAR(MAX)                   NULL,
    RepliedAt       DATETIME2(7)                    NULL,
    RepliedBy       INT                             NULL,
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_CitizenFeedbacks_IsDeleted DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_CitizenFeedbacks_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_CitizenFeedbacks              PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT CK_CitizenFeedbacks_Status       CHECK (Status IN (0, 1, 2, 3)),
    CONSTRAINT CK_CitizenFeedbacks_Latitude     CHECK (Latitude IS NULL OR (Latitude >= -90 AND Latitude <= 90)),
    CONSTRAINT CK_CitizenFeedbacks_Longitude    CHECK (Longitude IS NULL OR (Longitude >= -180 AND Longitude <= 180)),
    CONSTRAINT FK_CitizenFeedbacks_UserId       FOREIGN KEY (UserId) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_CitizenFeedbacks_RepliedBy    FOREIGN KEY (RepliedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_CitizenFeedbacks_Status    ON SmartCity.CitizenFeedbacks (Status)        WHERE IsDeleted = 0;
CREATE NONCLUSTERED INDEX IX_CitizenFeedbacks_UserId    ON SmartCity.CitizenFeedbacks (UserId)        WHERE IsDeleted = 0 AND UserId IS NOT NULL;
CREATE NONCLUSTERED INDEX IX_CitizenFeedbacks_CreatedAt ON SmartCity.CitizenFeedbacks (CreatedAt DESC) WHERE IsDeleted = 0;
GO

-- -------------------------------------------------------------------------------------
-- SmartCity.TrafficCameras – Camera giám sát giao thông & an ninh đô thị
-- -------------------------------------------------------------------------------------
CREATE TABLE SmartCity.TrafficCameras (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    Name            NVARCHAR(250)                   NOT NULL,
    Location        NVARCHAR(500)                   NULL,
    Latitude        DECIMAL(9,6)                    NULL,
    Longitude       DECIMAL(9,6)                    NULL,
    StreamUrl       VARCHAR(500)                    NOT NULL,
    IsActive        BIT                             NOT NULL    CONSTRAINT DF_TrafficCameras_IsActive  DEFAULT (1),
    IsDeleted       BIT                             NOT NULL    CONSTRAINT DF_TrafficCameras_IsDeleted DEFAULT (0),
    CreatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_TrafficCameras_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CreatedBy       INT                             NULL,
    UpdatedAt       DATETIME2(7)                    NULL,
    UpdatedBy       INT                             NULL,
    DeletedAt       DATETIME2(7)                    NULL,

    CONSTRAINT PK_TrafficCameras                PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT CK_TrafficCameras_Latitude        CHECK (Latitude IS NULL OR (Latitude >= -90 AND Latitude <= 90)),
    CONSTRAINT CK_TrafficCameras_Longitude       CHECK (Longitude IS NULL OR (Longitude >= -180 AND Longitude <= 180)),
    CONSTRAINT FK_TrafficCameras_CreatedBy       FOREIGN KEY (CreatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_TrafficCameras_UpdatedBy       FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_TrafficCameras_IsActive ON SmartCity.TrafficCameras (IsActive) WHERE IsDeleted = 0;
GO

-- -------------------------------------------------------------------------------------
-- SmartCity.IocIndicators – Chỉ số giám sát điều hành IOC Dashboard
-- -------------------------------------------------------------------------------------
CREATE TABLE SmartCity.IocIndicators (
    Id              INT             IDENTITY(1,1)   NOT NULL,
    IndicatorName   NVARCHAR(250)                   NOT NULL,
    IndicatorCode   VARCHAR(100)                    NOT NULL,
    Value           DECIMAL(18,4)                   NOT NULL,
    Unit            NVARCHAR(50)                    NOT NULL,
    TargetValue     DECIMAL(18,4)                   NULL,
    Domain          VARCHAR(50)                     NOT NULL,   -- 'PublicAdmin', 'Health', 'Education', 'Environment', 'Economy'
    Year            SMALLINT                        NOT NULL,
    Month           TINYINT                         NULL,
    UpdatedAt       DATETIME2(7)                    NOT NULL    CONSTRAINT DF_IocIndicators_UpdatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedBy       INT                             NULL,

    CONSTRAINT PK_IocIndicators                 PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_IocIndicators_Code_Period     UNIQUE (IndicatorCode, Year, Month),
    CONSTRAINT CK_IocIndicators_Domain          CHECK (Domain IN ('PublicAdmin', 'Health', 'Education', 'Environment', 'Economy', 'Security', 'Transport')),
    CONSTRAINT CK_IocIndicators_Year            CHECK (Year >= 2020 AND Year <= 2100),
    CONSTRAINT CK_IocIndicators_Month           CHECK (Month IS NULL OR (Month >= 1 AND Month <= 12)),
    CONSTRAINT FK_IocIndicators_UpdatedBy       FOREIGN KEY (UpdatedBy) REFERENCES Auth.Users(Id) ON DELETE NO ACTION
);
GO

CREATE NONCLUSTERED INDEX IX_IocIndicators_Domain  ON SmartCity.IocIndicators (Domain, Year);
CREATE NONCLUSTERED INDEX IX_IocIndicators_Year    ON SmartCity.IocIndicators (Year DESC, Month DESC);
GO



-- =====================================================================================
-- PHASE 7: SEED DATA
-- =====================================================================================

-- Auth.Users (password hashes – in production use BCrypt/PBKDF2)
SET IDENTITY_INSERT Auth.Users ON;
INSERT INTO Auth.Users (Id, Username, PasswordHash, FullName, IsActive, IsDeleted, CreatedAt)
VALUES
    (1, 'admin',    'admin123',  N'Quản trị viên Hệ thống',     1, 0, '2026-07-09 17:27:51'),
    (2, 'admin1',   'admin123',  N'Điều hành viên 1',           1, 0, '2026-07-10 08:08:28'),
    (3, 'admin2',   'admin123',  N'Điều hành viên 2',           1, 0, '2026-07-10 08:09:10'),
    (4, 'testuser', '123',       N'Người dùng Thử nghiệm',     1, 0, '2026-07-10 08:54:32');
SET IDENTITY_INSERT Auth.Users OFF;
GO

UPDATE Auth.Users
SET Role = 'Admin'
WHERE Username LIKE 'admin%';
GO

-- Portal.SystemConfigs
INSERT INTO Portal.SystemConfigs (ConfigKey, ConfigValue, Description) VALUES
    ('BannerUrl',           'https://iocdaklak.vn/documents/d/guest/banner-tinh-dak-lak-2023', N'URL hình ảnh banner trang chủ'),
    ('BodyBgColor',         '#1322bc',  N'Màu nền toàn trang body'),
    ('NewsSectionBgColor',  '#ffffff',  N'Màu nền khu vực tin tức sự kiện'),
    ('InfoUtilityBgColor',  '#ffffff',  N'Màu nền khu vực thông tin tiện ích');
GO

-- Portal.ContentPages
INSERT INTO Portal.ContentPages (Slug, Title, Content, IsDeleted, CreatedAt, CreatedBy) VALUES
    ('chuc-nang-nhiem-vu',  N'Chức năng, nhiệm vụ',                N'<p><strong><u>Vị trí và chức năng</u></strong></p><p>1. Trung tâm Giám sát, điều hành đô thị thông minh tỉnh Đắk Lắk là đơn vị sự nghiệp công lập thuộc Sở Khoa học và Công nghệ...</p>', 0, SYSUTCDATETIME(), 1),
    ('lich-su-hinh-thanh',  N'Lịch sử hình thành',                 N'<p>Trung tâm được thành lập nhằm hỗ trợ phát triển dịch vụ đô thị thông minh cho tỉnh Đắk Lắk.</p>', 0, SYSUTCDATETIME(), 1),
    ('dau-moi-ho-tro',      N'Đầu mối hỗ trợ trực tuyến',         N'<p>Hotline: 0262.385.1234 | Email: support@daklak.gov.vn</p>', 0, SYSUTCDATETIME(), 1),
    ('san-pham-tieu-bieu',  N'Sản phẩm tiêu biểu',                N'<p>Các cổng dịch vụ công trực tuyến, giải pháp hạ tầng LAN/WAN và đào tạo CNTT.</p>', 0, SYSUTCDATETIME(), 1),
    ('so-do-to-chuc',       N'Sơ đồ tổ chức',                      N'<p>Giám đốc, các Phó Giám đốc, Phòng Hành chính - Tổng hợp, Phòng Vận hành - Giám sát.</p>', 0, SYSUTCDATETIME(), 1),
    ('co-cau-to-chuc',      N'Cơ cấu tổ chức',                     N'<p>Cơ cấu đảm bảo phối hợp chặt chẽ giữa các đơn vị chuyên môn, vận hành 24/7.</p>', 0, SYSUTCDATETIME(), 1),
    ('cap-nhat-bao-lu',     N'Cập nhật bão lũ',                    N'<p>Trang tin cập nhật tình hình bão lũ trên địa bàn tỉnh Đắk Lắk.</p>', 0, SYSUTCDATETIME(), 1);
GO

-- Portal.LinkCategories
INSERT INTO Portal.LinkCategories (Name, Code, DisplayOrder, IsActive, IsDeleted, CreatedAt, CreatedBy) VALUES
    (N'Các nền tảng liên kết chính',    'main-platforms',   1, 1, 0, SYSUTCDATETIME(), 1),
    (N'Bộ / Ngành Trung ương',          'bo-nganh',         2, 1, 0, SYSUTCDATETIME(), 1),
    (N'Sở / Ban ngành',                 'so-ban-nganh',     3, 1, 0, SYSUTCDATETIME(), 1);
GO

-- Portal.ExternalLinks
INSERT INTO Portal.ExternalLinks (CategoryId, Title, Description, Url, DisplayOrder, IsActive, IsDeleted, CreatedAt, CreatedBy) VALUES
    (1, N'Bộ công an',             N'Trang thông tin điện tử công an tỉnh Đăk Lăk',                            'http://congan.daklak.gov.vn/',         1, 1, 0, SYSUTCDATETIME(), 1),
    (1, N'Bình dân học vụ số',     N'Nền tảng phổ cập kiến thức chuyển đổi số cho người dân',                   'https://chuyendoiso.daklak.gov.vn/',   2, 1, 0, SYSUTCDATETIME(), 1),
    (1, N'Thông tin đấu thầu',     N'Hệ thống mạng đấu thầu quốc gia',                                        'https://muasamcong.mpi.gov.vn/',       3, 1, 0, SYSUTCDATETIME(), 1),
    (1, N'Công báo điện tử',       N'Tra cứu văn bản quy phạm pháp luật',                                      'http://congbao.daklak.gov.vn/',        4, 1, 0, SYSUTCDATETIME(), 1),
    (2, N'Bộ Khoa học và Công nghệ',   NULL, 'https://www.most.gov.vn/',       1, 1, 0, SYSUTCDATETIME(), 1),
    (2, N'Bộ Giáo dục và Đào tạo',     NULL, 'https://moet.gov.vn/',           2, 1, 0, SYSUTCDATETIME(), 1),
    (2, N'Bộ Tài chính',               NULL, 'https://mof.gov.vn/',            3, 1, 0, SYSUTCDATETIME(), 1),
    (2, N'Bộ Y tế',                    NULL, 'https://moh.gov.vn/',            4, 1, 0, SYSUTCDATETIME(), 1),
    (3, N'Sở Khoa học và Công nghệ',   NULL, 'http://sokhcn.daklak.gov.vn/',   1, 1, 0, SYSUTCDATETIME(), 1),
    (3, N'Sở Thông tin và Truyền thông', NULL, 'http://stttt.daklak.gov.vn/',  2, 1, 0, SYSUTCDATETIME(), 1);
GO

-- Cms.ArticleCategories
INSERT INTO Cms.ArticleCategories (Name, Code, DisplayOrder, IsActive, IsDeleted, CreatedAt, CreatedBy) VALUES
    (N'Tin nổi bật',                'tin-noi-bat',              1, 1, 0, SYSUTCDATETIME(), 1),
    (N'Tương tác công dân',         'tuong-tac-cong-dan',       2, 1, 0, SYSUTCDATETIME(), 1),
    (N'CĐS - Đổi mới sáng tạo',   'cds-doi-moi-sang-tao',     3, 1, 0, SYSUTCDATETIME(), 1),
    (N'Truyền thông & cảnh báo',    'truyen-thong-canh-bao',    4, 1, 0, SYSUTCDATETIME(), 1);
GO

-- Cms.Articles
INSERT INTO Cms.Articles (CategoryId, Title, Summary, Content, Source, PublishedAt, IsFeatured, ViewCount, IsActive, IsDeleted, CreatedAt, CreatedBy) VALUES
    (1, N'Thúc đẩy ứng dụng dịch vụ Đô thị thông minh Đắk Lắk Số',
        N'Triển khai mở rộng các dịch vụ tiện ích trên ứng dụng di động.',
        N'<p>Ứng dụng Đắk Lắk Số tiếp tục được nâng cấp nhằm đưa đến trải nghiệm tốt nhất cho người dân...</p>',
        N'Sở TT&TT', '2026-07-11 08:30:00', 1, 0, 1, 0, SYSUTCDATETIME(), 1),
    (2, N'Hệ thống tiếp nhận phản ánh hiện trường phát huy hiệu quả lớn',
        N'Hơn 90% phản ánh của người dân được xử lý đúng thời hạn.',
        N'<p>IOC ghi nhận tỷ lệ hài lòng cao từ người dân khi gửi phản ánh về trật tự đô thị...</p>',
        N'IOC Đắk Lắk', '2026-07-10 14:15:00', 0, 0, 1, 0, SYSUTCDATETIME(), 1),
    (3, N'Phổ cập kiến thức CĐS qua chương trình Bình dân học vụ số',
        N'Đắk Lắk đặt mục tiêu nâng cao kỹ năng số cho 100.000 người dân nông thôn.',
        N'<p>Chương trình nhận được sự ủng hộ từ các xã đoàn thanh niên và tổ công nghệ số cộng đồng...</p>',
        N'Sở TT&TT', '2026-07-09 09:00:00', 0, 0, 1, 0, SYSUTCDATETIME(), 1);
GO

-- Gov.DocumentTypes
INSERT INTO Gov.DocumentTypes (Name, Code, DisplayOrder) VALUES
    (N'Công văn',       'cong-van',         1),
    (N'Báo cáo',        'bao-cao',          2),
    (N'Kế hoạch',       'ke-hoach',         3),
    (N'Quyết định',     'quyet-dinh',       4),
    (N'Hướng dẫn',      'huong-dan',        5),
    (N'Chương trình',   'chuong-trinh',     6),
    (N'Tập huấn',       'tap-huan',         7);
GO

-- Gov.Documents
INSERT INTO Gov.Documents (DocumentTypeId, DocumentNumber, PublishedAt, Title, FileUrl, IssuingAuthority, IsActive, IsDeleted, CreatedAt, CreatedBy) VALUES
    (1, '29/CT-UBND',       '2021-12-27', N'CHỈ THỊ Về đẩy mạnh cải cách hành chính gắn với chính quyền số trên địa bàn tỉnh',                    '/documents/29_ct_ubnd.pdf',     N'UBND Tỉnh',   1, 0, SYSUTCDATETIME(), 1),
    (1, '14-NQ/TU',         '2021-12-08', N'Nghị quyết Hội nghị lần thứ 6 BCH Đảng bộ tỉnh Khóa XVI về phát triển KT-XH năm 2022',                '/documents/14_nq_tu.pdf',       N'Tỉnh Ủy',     1, 0, SYSUTCDATETIME(), 1),
    (3, '3128/QĐ-UBND',    '2021-11-30', N'Kế hoạch triển khai Chương trình chuyển đổi số tỉnh Đắk Lắk 2021-2025, định hướng 2030',               '/documents/3128_qd_ubnd.pdf',   N'UBND Tỉnh',   1, 0, SYSUTCDATETIME(), 1),
    (2, '62/2021/QĐ-UBND', '2021-10-04', N'Quy định Quản lý, vận hành và tích hợp ứng dụng Đăk Lăk Số',                                          '/documents/62_qd_ubnd.pdf',     N'UBND Tỉnh',   1, 0, SYSUTCDATETIME(), 1);
GO

-- Gov.Announcements
INSERT INTO Gov.Announcements (Title, Url, IsActive, IsDeleted, CreatedAt, CreatedBy) VALUES
    (N'Kế hoạch triển khai Kết luận 18-KL/TW, Kế hoạch 57-KH/TU của Tỉnh ủy Đắk Lắk', '#', 1, 0, SYSUTCDATETIME(), 1),
    (N'Mời quý tổ chức, doanh nghiệp quan tâm báo giá Dịch vụ Đánh giá ATTT',          '#', 1, 0, SYSUTCDATETIME(), 1),
    (N'Công bố công khai dự toán NSNN của Trung tâm IOC năm 2026',                       '#', 1, 0, SYSUTCDATETIME(), 1);
GO

-- Cms.Multimedia
INSERT INTO Cms.Multimedia (MediaType, Title, MediaUrl, ThumbnailUrl, IsFeatured, IsActive, IsDeleted, CreatedAt, CreatedBy) VALUES
    ('video', N'Bản tin video an toàn thông tin số 165', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/images/video-thumb-165.jpg', 1, 1, 0, SYSUTCDATETIME(), 1);
GO

-- Emergency.DisasterPosts
INSERT INTO Emergency.DisasterPosts (Title, ImageUrl, Source, Content, LinkUrl, LinkText, IsDeleted, CreatedAt, CreatedBy) VALUES
    (N'Cảnh báo lũ quét trên sông Krông Ana', '/uploads/bao-lu.jpg', N'Đài KTTV Đắk Lắk',
     N'<p>Mực nước sông Krông Ana đang đạt mức báo động 2. Đề nghị người dân ven sông chuẩn bị phương án di dời...</p>',
     'https://kttvdaklak.gov.vn', N'Xem dự báo thời tiết', 0, '2026-07-11 20:00:00', 1);
GO

-- Cms.Comments
INSERT INTO Cms.Comments (PageId, UserId, Content, Likes, Dislikes, IsDeleted, CreatedAt) VALUES
    ('chuc-nang-nhiem-vu', 4, N'Đơn vị có nhiều dịch vụ thiết thực, mong phát triển thêm nhiều giải pháp hữu ích cho tỉnh nhà.', 5, 0, 0, '2026-07-10 10:20:00');
GO

-- SmartCity.IocIndicators
INSERT INTO SmartCity.IocIndicators (IndicatorName, IndicatorCode, Value, Unit, TargetValue, Domain, Year, Month) VALUES
    (N'Tỷ lệ hồ sơ hành chính công giải quyết đúng hạn',          'admin-ontime-rate',            98.4000,    '%',            98.0000,    'PublicAdmin',  2026, NULL),
    (N'Số lượt phản ánh hiện trường đã xử lý dứt điểm',            'citizen-feedback-resolved',     4200.0000,  N'phản ánh',    4000.0000,  'PublicAdmin',  2026, NULL),
    (N'Chỉ số chất lượng không khí AQI trung bình tại BMT',        'air-quality-aqi',              45.0000,    'AQI',          50.0000,    'Environment',  2026, NULL),
    (N'Số camera giám sát giao thông đang kết nối',                 'connected-traffic-cameras',    120.0000,   N'camera',      150.0000,   'Transport',    2026, NULL),
    (N'Tỷ lệ bệnh viện cấp huyện kết nối khám chữa bệnh từ xa',  'telehealth-hospital-rate',     85.0000,    '%',            90.0000,    'Health',       2026, NULL);
GO

-- SmartCity.TrafficCameras
INSERT INTO SmartCity.TrafficCameras (Name, Location, Latitude, Longitude, StreamUrl, IsActive, IsDeleted, CreatedAt, CreatedBy) VALUES
    (N'Camera Ngã sáu Buôn Ma Thuột',                      N'Trung tâm Tp. Buôn Ma Thuột',            12.668500, 108.038400, 'rtsp://cam01.iocdaklak.local/live',    1, 0, SYSUTCDATETIME(), 1),
    (N'Camera Ngã tư Lê Duẩn - Nguyễn Tất Thành',          N'Phường Tân An, Tp. Buôn Ma Thuột',       12.678200, 108.051100, 'rtsp://cam02.iocdaklak.local/live',    1, 0, SYSUTCDATETIME(), 1),
    (N'Camera Trạm giám sát giao thông Quốc lộ 14',        N'Xã Hòa Phú, Tp. Buôn Ma Thuột',         12.593400, 107.981200, 'rtsp://cam03.iocdaklak.local/live',    1, 0, SYSUTCDATETIME(), 1);
GO

-- SmartCity.CitizenFeedbacks (sample)
INSERT INTO SmartCity.CitizenFeedbacks (Title, Content, Address, Latitude, Longitude, SenderName, SenderPhone, UserId, Status, IsDeleted, CreatedAt) VALUES
    (N'Ổ gà lớn trên đường Nguyễn Tất Thành',
     N'Trên đường Nguyễn Tất Thành đoạn gần ngã tư Lê Duẩn có ổ gà rất lớn, gây nguy hiểm cho người đi xe máy vào ban đêm.',
     N'Đường Nguyễn Tất Thành, gần ngã tư Lê Duẩn, Tp. Buôn Ma Thuột',
     12.678200, 108.051100, N'Nguyễn Văn A', '0905123456', 4, 0, 0, '2026-07-10 15:30:00');
GO


-- =====================================================================================
-- PHASE 8: TẠO TÀI KHOẢN ỨNG DỤNG WEB (Application Login & Permissions)
-- =====================================================================================
-- Tạo SQL Login riêng cho ứng dụng Web API (.NET) với quyền tối thiểu (Least Privilege).
-- Web app chỉ được phép SELECT, INSERT, UPDATE trên các schema cần thiết.
-- KHÔNG được quyền DELETE (vì ta dùng Soft Delete), KHÔNG được quyền DDL.
-- =====================================================================================
-- Lưu ý: Đổi mật khẩu 'IOC_WebApp_P@ss2026!' trước khi đưa lên Production.
-- =====================================================================================

-- 8.1 Dọn dẹp User cũ trong database nếu tồn tại
IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'ioc_webapp_user')
BEGIN
    DROP USER [ioc_webapp_user];
    PRINT N'[✓] Đã xóa Database User [ioc_webapp_user] cũ.';
END
GO

-- 8.2 Dọn dẹp Login cũ trên Server nếu tồn tại
IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'ioc_webapp_login')
BEGIN
    DROP LOGIN [ioc_webapp_login];
    PRINT N'[✓] Đã xóa Server Login [ioc_webapp_login] cũ.';
END
GO

-- 8.3 Tạo Server Login mới
CREATE LOGIN [ioc_webapp_login]
    WITH PASSWORD = 'IOC_WebApp_P@ss2026!',
         DEFAULT_DATABASE = [IOC_Daklak],
         CHECK_POLICY = ON,
         CHECK_EXPIRATION = OFF;
PRINT N'[✓] SQL Login [ioc_webapp_login] đã được tạo.';
GO

-- 8.4 Tạo Database User mới liên kết với Login
CREATE USER [ioc_webapp_user] FOR LOGIN [ioc_webapp_login];
PRINT N'[✓] Database User [ioc_webapp_user] đã được tạo.';
GO

-- 8.5 Phân quyền theo Schema (Principle of Least Privilege)
-- Web app chỉ cần: SELECT, INSERT, UPDATE (KHÔNG CÓ DELETE)
GRANT SELECT, INSERT, UPDATE ON SCHEMA::Auth       TO [ioc_webapp_user];
GRANT SELECT, INSERT, UPDATE ON SCHEMA::Portal     TO [ioc_webapp_user];
GRANT SELECT, INSERT, UPDATE ON SCHEMA::Cms        TO [ioc_webapp_user];
GRANT SELECT, INSERT, UPDATE ON SCHEMA::Gov        TO [ioc_webapp_user];
GRANT SELECT, INSERT, UPDATE ON SCHEMA::Emergency  TO [ioc_webapp_user];
GRANT SELECT, INSERT, UPDATE ON SCHEMA::SmartCity   TO [ioc_webapp_user];
GO

PRINT N'[✓] Phân quyền Schema cho [ioc_webapp_user] hoàn tất (SELECT, INSERT, UPDATE only).';
GO


-- =====================================================================================
-- PHASE 9: BÁO CÁO XÁC NHẬN KẾT QUẢ (Verification Report)
-- =====================================================================================
PRINT N'';
PRINT N'╔════════════════════════════════════════════════════════════════════╗';
PRINT N'║          IOC DAK LAK - DATABASE INITIALIZATION REPORT            ║';
PRINT N'╠════════════════════════════════════════════════════════════════════╣';
PRINT N'║  Database    : IOC_Daklak                                        ║';
PRINT N'║  Collation   : Vietnamese_CI_AS                                  ║';
PRINT N'║  Recovery    : FULL                                              ║';
PRINT N'║  Version     : 2.0.0                                            ║';
PRINT N'╠════════════════════════════════════════════════════════════════════╣';
PRINT N'║  SCHEMAS  (6)  : Auth, Portal, Cms, Gov, Emergency, SmartCity    ║';
PRINT N'╠════════════════════════════════════════════════════════════════════╣';
PRINT N'║  TABLES  (16):                                                   ║';
PRINT N'║    Auth       : Users                                            ║';
PRINT N'║    Portal     : SystemConfigs, ContentPages, LinkCategories,     ║';
PRINT N'║                 ExternalLinks                                    ║';
PRINT N'║    Cms        : ArticleCategories, Articles, Multimedia,         ║';
PRINT N'║                 Comments                                         ║';
PRINT N'║    Gov        : Announcements, DocumentTypes, Documents          ║';
PRINT N'║    Emergency  : DisasterPosts                                    ║';
PRINT N'║    SmartCity  : CitizenFeedbacks, TrafficCameras, IocIndicators  ║';
PRINT N'╠════════════════════════════════════════════════════════════════════╣';
PRINT N'║  SECURITY:                                                       ║';
PRINT N'║    Login : ioc_webapp_login                                      ║';
PRINT N'║    User  : ioc_webapp_user (SELECT, INSERT, UPDATE only)         ║';
PRINT N'╠════════════════════════════════════════════════════════════════════╣';
PRINT N'║  SEED DATA   : ✓ Inserted for all 16 tables                     ║';
PRINT N'║  STATUS      : ✓ INITIALIZATION COMPLETED SUCCESSFULLY          ║';
PRINT N'╚════════════════════════════════════════════════════════════════════╝';
GO

-- =====================================================================================
-- Xác nhận số lượng đối tượng bằng truy vấn thực tế
-- =====================================================================================
SELECT 'VERIFICATION' AS [Report],
       (SELECT COUNT(*) FROM sys.schemas WHERE name IN ('Auth','Portal','Cms','Gov','Emergency','SmartCity')) AS [Schemas],
       (SELECT COUNT(*) FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
        WHERE s.name IN ('Auth','Portal','Cms','Gov','Emergency','SmartCity')) AS [Tables],
       (SELECT COUNT(*) FROM sys.indexes i JOIN sys.tables t ON i.object_id = t.object_id
        JOIN sys.schemas s ON t.schema_id = s.schema_id
        WHERE s.name IN ('Auth','Portal','Cms','Gov','Emergency','SmartCity')
        AND i.type = 2) AS [NonClustered_Indexes],
       (SELECT COUNT(*) FROM sys.foreign_keys fk JOIN sys.tables t ON fk.parent_object_id = t.object_id
        JOIN sys.schemas s ON t.schema_id = s.schema_id
        WHERE s.name IN ('Auth','Portal','Cms','Gov','Emergency','SmartCity')) AS [Foreign_Keys],
       (SELECT COUNT(*) FROM sys.check_constraints cc JOIN sys.tables t ON cc.parent_object_id = t.object_id
        JOIN sys.schemas s ON t.schema_id = s.schema_id
        WHERE s.name IN ('Auth','Portal','Cms','Gov','Emergency','SmartCity')) AS [Check_Constraints];
GO

-- =====================================================================================
-- PHASE 10: BACKEND INTEGRATION PATCH
-- =====================================================================================

USE [IOC_Daklak];
GO

-- Backend integration patch:
-- 1. Expand Portal.SystemConfigs.ConfigValue because the frontend can store long JSON values.
-- 2. Add Cms.Articles.LegacyId to keep the article ids generated by the current admin frontend.

IF COL_LENGTH('Portal.SystemConfigs', 'ConfigValue') IS NOT NULL
BEGIN
    ALTER TABLE Portal.SystemConfigs ALTER COLUMN ConfigValue NVARCHAR(MAX) NULL;
END
GO

-- Hỏi đáp: FAQ và câu hỏi do người dân gửi
IF OBJECT_ID('Portal.Faqs', 'U') IS NULL
BEGIN
    CREATE TABLE Portal.Faqs (
        Id INT NOT NULL PRIMARY KEY,
        Question NVARCHAR(1000) NOT NULL,
        Answer NVARCHAR(MAX) NOT NULL,
        DisplayOrder INT NOT NULL DEFAULT 0,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

IF OBJECT_ID('Portal.UserQuestions', 'U') IS NULL
BEGIN
    CREATE TABLE Portal.UserQuestions (
        Id INT NOT NULL PRIMARY KEY,
        Topic NVARCHAR(255) NULL,
        Title NVARCHAR(500) NULL,
        SenderName NVARCHAR(255) NULL,
        SenderEmail NVARCHAR(255) NULL,
        SenderPhone NVARCHAR(50) NULL,
        Address NVARCHAR(500) NULL,
        Content NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        Status VARCHAR(20) NOT NULL DEFAULT 'pending',
        Answer NVARCHAR(MAX) NULL,
        IsPublic BIT NOT NULL DEFAULT 0,
        IsDeleted BIT NOT NULL DEFAULT 0,
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT CK_UserQuestions_Status CHECK (Status IN ('pending', 'answered'))
    );
END
GO

IF COL_LENGTH('Cms.Articles', 'LegacyId') IS NULL
BEGIN
    ALTER TABLE Cms.Articles ADD LegacyId VARCHAR(100) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Articles_LegacyId'
      AND object_id = OBJECT_ID('Cms.Articles')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Articles_LegacyId
        ON Cms.Articles (LegacyId)
        WHERE LegacyId IS NOT NULL AND IsDeleted = 0;
END
GO

-- Bảng Ý kiến dự thảo
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Gov')
BEGIN
    EXEC('CREATE SCHEMA Gov');
END
GO

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
        IsDeleted BIT NOT NULL DEFAULT 0
    );
END
GO

-- Bảng Góp ý
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
GO

