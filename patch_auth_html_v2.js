const fs = require('fs');

const files = [
    'trang-chu.html', 'chuc-nang-nhiem-vu.html', 'dau-moi-ho-tro.html',
    'lich-su-hinh-thanh.html', 'san-pham-tieu-bieu.html', 'so-do-to-chuc.html',
    'co-cau-to-chuc.html', 'cap-nhat-bao-lu.html'
];

const oldUserContainerRegex = /<div class="user-dropdown-container">[\s\S]*?<\/div>\s*<button class="search-btn" id="searchBtn">/;
const newSearchAndUserHtml = `<button class="search-btn" id="searchBtn">`;


files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    // 1. Remove old user-dropdown-container
    const oldContainerStart = html.indexOf('<div class="user-dropdown-container">');
    if (oldContainerStart !== -1) {
        const afterSearchBtnStart = html.indexOf('<button class="search-btn"', oldContainerStart);
        if (afterSearchBtnStart !== -1) {
            // Delete the old container
            html = html.slice(0, oldContainerStart) + html.slice(afterSearchBtnStart);
        }
    }

    // 2. Insert new user-dropdown-container AFTER searchForm
    // Search form ends with </div>
    const searchFormStart = html.indexOf('<div class="search-form" id="searchForm">');
    if (searchFormStart !== -1) {
        const formEndRegex = /<\/div>/g;
        formEndRegex.lastIndex = searchFormStart;
        const searchFormEndMatch = formEndRegex.exec(html); // this matches the first </div> after <div class="search-form"
        if (searchFormEndMatch) {
            const searchFormEnd = html.indexOf('</div>', html.indexOf('</form>', searchFormStart));
            if (searchFormEnd !== -1) {
                const insertPos = searchFormEnd + 6;
                const newUserHtml = `
                    <div class="user-dropdown-container" id="userDropdownContainer" style="margin-left: 20px; margin-right: 0;">
                        <button class="user-btn" id="userBtn" title="Tài khoản" style="display: flex; align-items: center;">
                            <i class="fa-solid fa-user"></i> <span id="userBtnText" style="font-family: 'Inter', sans-serif; font-size: 14px; margin-left: 8px; font-weight: 500;">Đăng nhập</span>
                        </button>
                        <ul class="user-dropdown-menu" id="userDropdownMenu">
                            <li class="user-info-item">Xin chào, <b id="displayUsername">Guest</b></li>
                            <li><hr></li>
                            <li><a href="#" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a></li>
                        </ul>
                    </div>`;
                if (!html.includes('<span id="userBtnText"')) {
                    html = html.slice(0, insertPos) + newUserHtml + html.slice(insertPos);
                }
            }
        }
    }

    // 3. Update login form to add Remember Me and Forgot Password
    const loginFormGroupEnd = html.indexOf('placeholder="Nhập mật khẩu...">\n            </div>');
    if (loginFormGroupEnd !== -1 && !html.includes('Quên mật khẩu?')) {
        const replacePos = loginFormGroupEnd + 55;
        const insertHtml = `
            <div class="form-options" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-size: 14px;">
                <label style="display: flex; align-items: center; gap: 5px; font-weight: normal; margin-bottom: 0; cursor: pointer;">
                    <input type="checkbox" id="rememberMe"> Ghi nhớ tài khoản
                </label>
                <a href="#" id="forgotPasswordLink" style="color: var(--primary); text-decoration: none;">Quên mật khẩu?</a>
            </div>`;
        html = html.slice(0, replacePos) + insertHtml + html.slice(replacePos);
    }

    fs.writeFileSync(file, html);
});

console.log("Patched HTMLs");
