const fs = require('fs');
const file = 'backend/Program.cs';
let code = fs.readFileSync(file, 'utf8');

// 1. Update User class
const oldUserClass = `public class User {
    public string Id { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string RegisterDate { get; set; }
    public string Email { get; set; }
    public string DateOfBirth { get; set; }
    public string AvatarUrl { get; set; }
}`;
const newUserClass = `public class User {
    public string Id { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string RegisterDate { get; set; }
    public string Email { get; set; }
    public string DateOfBirth { get; set; }
    public string AvatarUrl { get; set; }
    public string FullName { get; set; }
    public bool IsActive { get; set; } = true;
}`;
code = code.replace(oldUserClass, newUserClass);

// 2. Fix /api/nguoi-dung to use WriteAsJsonAsync
const oldGetUsers = `app.MapGet("/api/nguoi-dung", async (HttpContext context) =>
{
    var usersJson = await File.ReadAllTextAsync(usersPath);
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(usersJson);
});`;
const newGetUsers = `app.MapGet("/api/nguoi-dung", async (HttpContext context) =>
{
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    // Exclude passwords for safety before returning
    var safeList = usersList.Select(u => new { u.Id, u.Username, u.FullName, u.Email, u.DateOfBirth, u.AvatarUrl, u.RegisterDate, u.IsActive }).ToList();
    await context.Response.WriteAsJsonAsync(safeList);
});`;
code = code.replace(oldGetUsers, newGetUsers);

// 3. Update GET /api/nguoi-dung/{username} to include FullName and IsActive
const oldGetProfileObj = `user.AvatarUrl \n        } \n    });`;
const newGetProfileObj = `user.AvatarUrl, \n            user.FullName,\n            user.IsActive\n        } \n    });`;
code = code.replace(oldGetProfileObj, newGetProfileObj);

// 4. Update PUT /api/nguoi-dung/{username} to handle FullName
const oldPutFields = `if (updateReq.AvatarUrl != null) user.AvatarUrl = updateReq.AvatarUrl;`;
const newPutFields = `if (updateReq.AvatarUrl != null) user.AvatarUrl = updateReq.AvatarUrl;
    if (updateReq.FullName != null) user.FullName = updateReq.FullName;`;
code = code.replace(oldPutFields, newPutFields);

const oldPutReturn = `user.AvatarUrl } });`;
const newPutReturn = `user.AvatarUrl, user.FullName } });`;
code = code.replace(oldPutReturn, newPutReturn);

// 5. Update POST /api/login to return FullName
const oldLoginReturn = `user.Username } });`;
const newLoginReturn = `user.Username, user.FullName } });`;
code = code.replace(oldLoginReturn, newLoginReturn);
// Also check IsActive on login
const loginCheckIndex = code.indexOf(`if (user == null) {`);
if (loginCheckIndex !== -1) {
    const injectActiveCheck = `
    if (user != null && !user.IsActive) {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Tài khoản của bạn đã bị khóa." });
        return;
    }
    `;
    code = code.slice(0, loginCheckIndex) + injectActiveCheck + code.slice(loginCheckIndex);
}

// 6. Add Admin APIs before app.Run()
const adminApis = `
// --- ADMIN API ---
app.MapPost("/api/admin/nguoi-dung", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var newUser = JsonSerializer.Deserialize<User>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    
    if (usersList.Any(u => string.Equals(u.Username, newUser.Username, StringComparison.OrdinalIgnoreCase))) {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Tên đăng nhập đã tồn tại." });
        return;
    }
    
    newUser.Id = Guid.NewGuid().ToString();
    newUser.RegisterDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    if (string.IsNullOrEmpty(newUser.Password)) newUser.Password = "123456"; // default password
    usersList.Add(newUser);
    
    var jsonOptions = new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    await File.WriteAllTextAsync(usersPath, JsonSerializer.Serialize(usersList, jsonOptions));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Thêm tài khoản thành công." });
});

app.MapPut("/api/admin/nguoi-dung/{username}", async (HttpContext context, string username) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();
    var updateReq = JsonSerializer.Deserialize<User>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    
    var userIndex = usersList.FindIndex(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
    if (userIndex == -1) {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không tìm thấy người dùng." });
        return;
    }
    
    var user = usersList[userIndex];
    if (!string.IsNullOrEmpty(updateReq.Password)) user.Password = updateReq.Password;
    if (updateReq.FullName != null) user.FullName = updateReq.FullName;
    if (updateReq.Email != null) user.Email = updateReq.Email;
    user.IsActive = updateReq.IsActive; // Always update IsActive based on admin request
    
    usersList[userIndex] = user;
    
    var jsonOptions = new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    await File.WriteAllTextAsync(usersPath, JsonSerializer.Serialize(usersList, jsonOptions));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Cập nhật tài khoản thành công." });
});

app.MapDelete("/api/admin/nguoi-dung/{username}", async (HttpContext context, string username) =>
{
    var usersJson = await File.ReadAllTextAsync(usersPath);
    var usersList = JsonSerializer.Deserialize<List<User>>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
    
    var userIndex = usersList.FindIndex(u => string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase));
    if (userIndex == -1) {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không tìm thấy người dùng." });
        return;
    }
    
    // Prevent deleting admin
    if (username.ToLower() == "admin") {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Không thể xóa tài khoản admin gốc." });
        return;
    }
    
    usersList.RemoveAt(userIndex);
    
    var jsonOptions = new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    await File.WriteAllTextAsync(usersPath, JsonSerializer.Serialize(usersList, jsonOptions));
    await context.Response.WriteAsJsonAsync(new { success = true, message = "Đã xóa tài khoản." });
});

`;

code = code.replace('app.Run();', adminApis + 'app.Run();');

// Also update all File.WriteAllTextAsync(usersPath, JsonSerializer.Serialize(usersList, new JsonSerializerOptions { WriteIndented = true }))
// to include PropertyNamingPolicy = JsonNamingPolicy.CamelCase
code = code.replace(/new JsonSerializerOptions \{ WriteIndented = true \}/g, 'new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase }');


fs.writeFileSync(file, code, 'utf8');
console.log('Backend patched successfully.');
