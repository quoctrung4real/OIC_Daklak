# Dữ liệu và kịch bản kiểm thử IOC Đắk Lắk API

Tài liệu được tạo từ dữ liệu SQL Server hiện có ngày 21/07/2026. Không lưu mật khẩu, access token, connection string hoặc thông tin cá nhân nhạy cảm trong file này.

## Điểm truy cập

- API: `http://localhost:5100`
- Swagger UI: `http://localhost:5100/swagger`
- OpenAPI JSON: `http://localhost:5100/swagger/v1/swagger.json`

API có ký hiệu ổ khóa cần JWT. Phần lớn API quản trị yêu cầu role `Admin`; API hồ sơ, upload và gửi bình luận chỉ yêu cầu đăng nhập. Gọi `POST /api/login`, sao chép trường `accessToken`, nhấn **Authorize** trên Swagger và chỉ dán token (không thêm chữ `Bearer`).

```json
{
  "username": "admin",
  "password": "<NHẬP_MẬT_KHẨU_ADMIN>"
}
```

## Dữ liệu đang có trong database

### Loại văn bản

| ID | Code | Tên |
|---:|---|---|
| 1 | `cong-van` | Công văn |
| 2 | `bao-cao` | Báo cáo |
| 3 | `ke-hoach` | Kế hoạch |
| 4 | `quyet-dinh` | Quyết định |
| 5 | `huong-dan` | Hướng dẫn |
| 6 | `chuong-trinh` | Chương trình |
| 7 | `tap-huan` | Tập huấn |
| 8 | `tai-lieu-test` | Tài liệu test |

Văn bản phù hợp để kiểm tra API chi tiết:

| ID | Số văn bản | Loại | Tiêu đề |
|---:|---|---|---|
| 5 | `TEST-001/IOC` | `tai-lieu-test` | [TEST] Tài liệu kiểm thử văn bản |
| 6 | `01/QD-IOC` | `quyet-dinh` | Quyết định ban hành quy chế vận hành Trung tâm IOC Đắk Lắk |
| 7 | `02/HD-IOC` | `huong-dan` | Hướng dẫn khai thác và sử dụng hệ thống thông tin Trung tâm IOC |
| 8 | `03/CT-IOC` | `chuong-trinh` | Chương trình phối hợp triển khai dịch vụ đô thị thông minh năm 2026 |

Các request đọc:

```http
GET /api/loai-van-ban
GET /api/van-ban?type=quyet-dinh&take=10
GET /api/van-ban/6
```

Payload tạo văn bản mới (Admin):

```json
{
  "typeCode": "quyet-dinh",
  "documentNumber": "TEST-SWAGGER-001",
  "publishedAt": "2026-07-21",
  "title": "Văn bản kiểm thử tạo từ Swagger",
  "fileUrl": "/documents/test-swagger-001.pdf",
  "originalFileName": "test-swagger-001.pdf",
  "issuingAuthority": "Trung tâm IOC Đắk Lắk"
}
```

### Dự thảo và góp ý

| ID | Số dự thảo | Hạn góp ý | Tiêu đề |
|---:|---|---|---|
| 1 | `DT-01/IOC` | 15/08/2026 | Dự thảo Quy chế tiếp nhận và xử lý ý kiến góp ý trên Cổng thông tin IOC |
| 2 | `DT-02/IOC` | 30/08/2026 | Dự thảo Kế hoạch triển khai dịch vụ đô thị thông minh năm 2026 |
| 3 | `DT-03/SKHCN` | 10/09/2026 | Dự thảo Hướng dẫn khai thác nền tảng dữ liệu dùng chung tỉnh Đắk Lắk |

Database hiện có góp ý ID `1` thuộc dự thảo ID `3`; thông tin cá nhân của người gửi không được chép vào tài liệu này.

```http
GET /api/y-kien-du-thao
GET /api/y-kien-du-thao/3
GET /api/y-kien-du-thao/3/gop-y  (Admin)
```

Payload gửi góp ý công khai, không cần đăng nhập:

```json
{
  "fullName": "Người dùng kiểm thử",
  "email": "api.tester@example.com",
  "phoneNumber": "0900000000",
  "content": "Nội dung góp ý được gửi từ Swagger để kiểm thử API."
}
```

### FAQ và hỏi đáp

| ID | Thứ tự | Câu hỏi |
|---:|---:|---|
| 1 | 1 | Làm thế nào để đăng ký tài khoản? |
| 2 | 2 | Cổng thông tin này cung cấp những gì? |

```http
GET /api/faq
GET /api/cau-hoi-nguoi-dan
```

Payload tạo FAQ (Admin):

```json
{
  "question": "Làm thế nào để kiểm tra API?",
  "answer": "Truy cập trang Swagger và chọn chức năng Try it out.",
  "order": 99
}
```

Payload người dân gửi câu hỏi:

```json
{
  "topic": "Gửi câu hỏi",
  "title": "Kiểm thử chức năng hỏi đáp",
  "senderName": "Người dùng kiểm thử",
  "senderEmail": "api.tester@example.com",
  "senderPhone": "0900000000",
  "address": "Đắk Lắk",
  "content": "Đây là nội dung dùng để kiểm thử API gửi câu hỏi."
}
```

Sau khi gửi, dùng `GET /api/admin/cau-hoi-nguoi-dan` để lấy ID mới. Payload trả lời (Admin):

```json
{
  "answer": "Câu hỏi đã được tiếp nhận và trả lời trong quá trình kiểm thử.",
  "status": "answered",
  "isPublic": true
}
```

### Tin tức và trang nội dung

Tin nổi bật hiện có ID `1`: **Thúc đẩy ứng dụng dịch vụ Đô thị thông minh Đắk Lắk Số**.

```http
GET /api/tin-tuc
GET /api/thong-bao
GET /api/tin-hoat-dong
GET /api/chuc-nang-nhiem-vu
GET /api/co-cau-to-chuc
```

Payload thêm tin nổi bật (Admin):

```json
{
  "id": "swagger-test-news-001",
  "title": "Tin kiểm thử API Swagger",
  "imageUrl": "",
  "source": "Trung tâm IOC Đắk Lắk",
  "content": "<p>Nội dung tin dùng cho kiểm thử API.</p>",
  "createdAt": "2026-07-21T10:00:00+07:00"
}
```

Payload cập nhật trang nội dung, ví dụ `POST /api/chuc-nang-nhiem-vu` (Admin). API này thay thế toàn bộ nội dung trang, chỉ chạy khi chủ đích cập nhật:

```json
{
  "title": "Chức năng, nhiệm vụ",
  "content": "<p>Nội dung kiểm thử cập nhật từ Swagger.</p>"
}
```

### Cấu hình giao diện

Database hiện có 48 khóa cấu hình. Với `DataProvider=SqlServer`, nên chỉ gửi khóa cần thay đổi vì backend upsert từng khóa.

```json
{
  "primaryColor": "#1322bc",
  "menuBarBgColor": "#497fbf",
  "headerTextMain": "TRUNG TÂM GIÁM SÁT, ĐIỀU HÀNH ĐÔ THỊ THÔNG MINH",
  "headerTextSub": "TỈNH ĐẮK LẮK"
}
```

### Người dùng

Các tài khoản phù hợp để đối chiếu dữ liệu, không bao gồm mật khẩu:

| Username | Role | Trạng thái |
|---|---|---|
| `tester_admin` | Admin | Hoạt động |
| `tester_user` | User | Hoạt động |
| `locked_user` | User | Đã khóa |

Payload đăng ký tài khoản thử; đổi `username` sau mỗi lần chạy:

```json
{
  "username": "swagger_test_user_001",
  "password": "Test@123456",
  "fullName": "Tài khoản kiểm thử Swagger",
  "email": "swagger.test@example.com"
}
```

### Bình luận, tìm kiếm và giọng nói

```http
GET /api/binh-luan?pageId=trang-chu
GET /api/tim-kiem?q=đô%20thị&take=10
```

Payload bình luận (cần đăng nhập; backend tự lấy username từ JWT):

```json
{
  "pageId": "trang-chu",
  "content": "Bình luận kiểm thử gửi từ Swagger."
}
```

Payload chuyển văn bản thành giọng nói:

```json
{
  "text": "Xin chào, đây là nội dung kiểm thử API chuyển văn bản thành giọng nói.",
  "voice": "vi-VN-HoaiMyNeural",
  "speed": 150,
  "pitch": 50
}
```

## Thứ tự chạy kiểm thử đề xuất

1. `GET /api/health` và `GET /api/trang-chu`.
2. `POST /api/login`, sau đó Authorize bằng JWT.
3. Kiểm tra các API GET theo từng nhóm Swagger.
4. Tạo một FAQ hoặc câu hỏi người dân bằng payload mẫu.
5. Lấy lại danh sách để xác nhận dữ liệu đã lưu.
6. Dùng API DELETE tương ứng để dọn FAQ, văn bản, dự thảo, góp ý, câu hỏi hoặc tài khoản kiểm thử. API tin nổi bật và bình luận hiện chưa có chức năng xóa qua API.

Không chạy `POST /api/admin/migrate-json` nếu không chủ đích đồng bộ lại dữ liệu từ thư mục `backend/data` vào database.
