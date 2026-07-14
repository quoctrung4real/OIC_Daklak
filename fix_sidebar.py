import re

with open('admin/quan-tri.html', 'r', encoding='utf-8') as f:
    content = f.read()

# CSS injection
css_to_add = """
        .sidebar { width: 260px; background-color: var(--primary); color: var(--white); padding: 20px; transition: width 0.3s ease; overflow-x: hidden; position: relative; z-index: 100; flex-shrink: 0; }
        .sidebar.collapsed { width: 70px; padding: 20px 10px; }
        .sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; white-space: nowrap; }
        .sidebar h2 { margin-bottom: 0; font-size: 18px; display: flex; align-items: center; gap: 8px; }
        .sidebar-toggle { background: transparent; border: none; color: white; cursor: pointer; font-size: 20px; padding: 5px; transition: transform 0.3s; }
        .sidebar.collapsed .sidebar-header { justify-content: center; }
        .sidebar.collapsed h2 { display: none; }
        .sidebar ul { list-style: none; white-space: nowrap; }
        .sidebar li { margin-bottom: 5px; }
        .sidebar a { color: var(--white); text-decoration: none; display: flex; align-items: center; padding: 12px; border-radius: 5px; transition: background 0.2s; }
        .menu-parent { padding: 12px; cursor: pointer; border-radius: 5px; transition: background 0.2s; display: flex; align-items: center; justify-content: space-between; user-select: none; }
        .sidebar a:hover, .sidebar a.active, .menu-parent:hover { background-color: rgba(255,255,255,0.2); }
        .sidebar a i.icon-main, .menu-parent .icon-main { width: 24px; text-align: center; margin-right: 12px; font-size: 1.1rem; }
        .sidebar.collapsed a, .sidebar.collapsed .menu-parent { justify-content: center; padding: 12px 0; }
        .sidebar.collapsed a i.icon-main, .sidebar.collapsed .menu-parent .icon-main { margin-right: 0; font-size: 1.3rem; }
        .sidebar-text { opacity: 1; transition: opacity 0.2s; }
        .sidebar.collapsed .sidebar-text { display: none; }
        .sidebar.collapsed .drop-icon { display: none; }
        .sidebar.collapsed .sub-menu { display: none !important; }
"""

# Replace old css:
content = re.sub(r'\.sidebar \{ width: 250px;.*?\n', '', content)
content = re.sub(r'\.sidebar h2 \{ margin-bottom: 30px;.*?\n', '', content)
content = re.sub(r'\.sidebar ul \{ list-style: none; \}\n', '', content)
content = re.sub(r'\.sidebar li \{ margin-bottom: 10px; \}\n', '', content)
content = re.sub(r'\.sidebar a \{ color: var\(--white\); text-decoration: none; display: block; padding: 10px; border-radius: 5px; transition: background 0.2s; \}\n', '', content)
content = re.sub(r'\.sidebar a:hover, \.sidebar a\.active \{ background-color: rgba\(255,255,255,0\.2\); \}\n', '', content)
content = re.sub(r'\.menu-parent \{ padding: 10px; cursor: pointer; border-radius: 5px; transition: background 0\.2s; display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; user-select: none; \}\n', '', content)
content = re.sub(r'\.menu-parent:hover \{ background-color: rgba\(255,255,255,0\.2\); \}\n', '', content)

content = content.replace('        .sub-menu { list-style: none; padding-left: 20px; display: none; }', css_to_add + '        .sub-menu { list-style: none; padding-left: 20px; display: none; }')

# New sidebar HTML
sidebar_html = """    <div class="sidebar" id="adminSidebar">
        <div class="sidebar-header">
            <h2><i class="fa-solid fa-gear"></i> <span class="sidebar-text">ADMIN PANEL</span></h2>
            <button class="sidebar-toggle" onclick="toggleSidebar()"><i class="fa-solid fa-bars"></i></button>
        </div>
        <ul>
            <li><a href="#" class="tab-link active" data-target="config-tab"><i class="fa-solid fa-palette icon-main"></i> <span class="sidebar-text">Cấu Hình Giao Diện</span></a></li>
            <li>
                <div class="menu-parent" onclick="toggleMenu(this)">
                    <div style="display: flex; align-items: center;"><i class="fa-solid fa-circle-info icon-main"></i> <span class="sidebar-text">Giới Thiệu</span></div>
                    <i class="fa-solid fa-chevron-down drop-icon"></i>
                </div>
                <ul class="sub-menu">
                    <li><a href="#" class="tab-link" data-target="about-tab"><i class="fa-solid fa-file-lines icon-main"></i> <span class="sidebar-text">Chức Năng Nhiệm Vụ</span></a></li>
                    <li><a href="#" class="tab-link" data-target="support-tab"><i class="fa-solid fa-headset icon-main"></i> <span class="sidebar-text">Đầu Mối Hỗ Trợ</span></a></li>
                    <li><a href="#" class="tab-link" data-target="history-tab"><i class="fa-solid fa-clock-rotate-left icon-main"></i> <span class="sidebar-text">Lịch Sử Hình Thành</span></a></li>
                    <li><a href="#" class="tab-link" data-target="products-tab"><i class="fa-solid fa-star icon-main"></i> <span class="sidebar-text">Sản Phẩm Tiêu Biểu</span></a></li>
                    <li><a href="#" class="tab-link" data-target="orgchart-tab"><i class="fa-solid fa-sitemap icon-main"></i> <span class="sidebar-text">Sơ Đồ Tổ Chức</span></a></li>
                </ul>
            </li>
            <li><a href="#" class="tab-link" data-target="struct-tab"><i class="fa-solid fa-sitemap icon-main"></i> <span class="sidebar-text">Cơ Cấu Tổ Chức</span></a></li>
            <li>
                <div class="menu-parent" onclick="toggleMenu(this)">
                    <div style="display: flex; align-items: center;"><i class="fa-solid fa-newspaper icon-main"></i> <span class="sidebar-text">Tin Tức</span></div>
                    <i class="fa-solid fa-chevron-down drop-icon"></i>
                </div>
                <ul class="sub-menu">
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="cap-nhat-bao-lu"><i class="fa-solid fa-cloud-showers-heavy icon-main"></i> <span class="sidebar-text">Cập Nhật Bão Lũ</span></a></li>
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="cds-doi-moi-sang-tao"><i class="fa-solid fa-lightbulb icon-main"></i> <span class="sidebar-text">CĐS - Đổi mới sáng tạo</span></a></li>
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="chi-dao-dieu-hanh"><i class="fa-solid fa-gavel icon-main"></i> <span class="sidebar-text">Chỉ đạo điều hành</span></a></li>
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="cong-tac-xay-dung-dang"><i class="fa-solid fa-flag icon-main"></i> <span class="sidebar-text">Xây dựng Đảng</span></a></li>
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="giai-phap-an-toan-mang"><i class="fa-solid fa-shield-halved icon-main"></i> <span class="sidebar-text">Giải pháp AT mạng</span></a></li>
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="giai-phap-an-toan-thong-tin"><i class="fa-solid fa-lock icon-main"></i> <span class="sidebar-text">Giải pháp ATTT</span></a></li>
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="thong-bao"><i class="fa-solid fa-bell icon-main"></i> <span class="sidebar-text">Thông báo</span></a></li>
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="tieu-chuan-chat-luong"><i class="fa-solid fa-award icon-main"></i> <span class="sidebar-text">Tiêu chuẩn chất lượng</span></a></li>
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="tin-hoat-dong"><i class="fa-solid fa-briefcase icon-main"></i> <span class="sidebar-text">Tin hoạt động</span></a></li>
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="trao-doi-kinh-nghiem"><i class="fa-solid fa-comments icon-main"></i> <span class="sidebar-text">Trao đổi kinh nghiệm</span></a></li>
                    <li><a href="#" class="tab-link news-category-link" data-target="dynamic-news-tab" data-category="tuong-tac-cong-dan"><i class="fa-solid fa-users-rays icon-main"></i> <span class="sidebar-text">Tương tác công dân</span></a></li>
                </ul>
            </li>
            <li><a href="#" class="tab-link" data-target="accounts-tab"><i class="fa-solid fa-users icon-main"></i> <span class="sidebar-text">Quản lý Tài Khoản</span></a></li>
            <li><a href="../user/trang-chu/trang-chu.html" target="_blank" style="margin-top: 50px; background: rgba(0,0,0,0.2);"><i class="fa-solid fa-eye icon-main"></i> <span class="sidebar-text">Xem Trang User</span></a></li>
        </ul>
    </div>"""

content = re.sub(r'    <div class="sidebar">.*?    </div>', sidebar_html, content, flags=re.DOTALL)

with open('admin/quan-tri.html', 'w', encoding='utf-8') as f:
    f.write(content)

