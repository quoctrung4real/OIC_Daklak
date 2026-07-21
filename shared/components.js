const commonComponents = {
    header: `
    <!-- ===== HEADER ===== -->
    <header class="header" id="header">
        <div class="header-banner">
            <!-- Blue gradient banner background -->
            <div class="header-banner-bg"></div>
            <div class="container">
                <div class="header-content">
                    <a href="${window.BASE_URL || ''}user/trang-chu/trang-chu.html" class="logo" style="text-decoration: none; gap: 16px;">
                        <div class="logo-icon">
                            <svg viewBox="0 0 60 60" width="60" height="60">
                                <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(255,255,255,0.6)"
                                    stroke-width="2" />
                                <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.4)"
                                    stroke-width="1" />
                                <text x="30" y="28" text-anchor="middle" fill="white" font-size="8" font-weight="700"
                                    font-family="Inter">DakLakIOC</text>
                                <text x="30" y="38" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="5"
                                    font-family="Inter">SMART CITY</text>
                            </svg>
                        </div>
                        <div class="logo-text">
                            <h1 class="logo-title" style="font-size: 20px; font-weight: 700; text-transform: uppercase; margin: 0; color: white;">TRUNG TÂM GIÁM SÁT, ĐIỀU HÀNH ĐÔ THỊ THÔNG MINH</h1>
                            <p class="logo-subtitle" style="font-size: 16px; font-weight: 600; opacity: 0.9; margin: 5px 0 0 0; color: white;">TỈNH ĐẮK LẮK</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
        <div class="nav-wrapper">
            <div class="container">
                <nav class="main-nav">
                    <a href="#" class="nav-small-logo">
                        <svg viewBox="0 0 60 60" width="50" height="50">
                            <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(255,255,255,0.6)"
                                stroke-width="2" />
                            <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.4)"
                                stroke-width="1" />
                            <text x="30" y="28" text-anchor="middle" fill="white" font-size="8" font-weight="700"
                                font-family="Inter">DakLakIOC</text>
                            <text x="30" y="38" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="5"
                                font-family="Inter">SMART CITY</text>
                        </svg>
                    </a>
                    <ul class="nav-list">
                        <li class="nav-item" data-nav="trang-chu">
                            <a href="${window.BASE_URL || ''}user/trang-chu/trang-chu.html">Trang chủ</a>
                        </li>
                        <li class="nav-item has-dropdown" data-nav="gioi-thieu">
                            <a href="#">Giới thiệu <i class="fa-solid fa-angle-down"></i></a>
                            <ul class="dropdown">
                                <li><a href="${window.BASE_URL || ''}user/gioi-thieu/chuc-nang-nhiem-vu.html">Chức năng, nhiệm vụ</a></li>
                                <li><a href="${window.BASE_URL || ''}user/gioi-thieu/dau-moi-ho-tro.html">Đầu mối hỗ trợ trực tuyến qua điện thoại</a></li>
                                <li><a href="${window.BASE_URL || ''}user/gioi-thieu/lich-su-hinh-thanh.html">Lịch sử hình thành</a></li>
                                <li><a href="${window.BASE_URL || ''}user/gioi-thieu/san-pham-tieu-bieu.html">Sản phẩm tiêu biểu</a></li>
                                <li><a href="${window.BASE_URL || ''}user/gioi-thieu/so-do-to-chuc.html">Sơ đồ tổ chức</a></li>
                            </ul>
                        </li>
                        <li class="nav-item" data-nav="co-cau-to-chuc">
                            <a href="${window.BASE_URL || ''}user/gioi-thieu/co-cau-to-chuc.html">Cơ cấu tổ chức</a>
                        </li>
                        <li class="nav-item has-dropdown" data-nav="tin-tuc">
                            <a href="${window.BASE_URL || ''}user/tin-tuc/danh-sach-tin-tuc.html">Tin tức <i class="fa-solid fa-angle-down"></i></a>
                            <ul class="dropdown">
                                <li><a href="${window.BASE_URL || ''}user/tin-tuc/cap-nhat-bao-lu.html">Cập nhật bão lũ</a></li>
                                <li><a href="${window.BASE_URL || ''}user/tin-tuc/cds-doi-moi-sang-tao.html">CĐS - Đổi mới sáng tạo</a></li>
                                <li><a href="${window.BASE_URL || ''}user/chuyen-muc-khac/chi-dao-dieu-hanh.html">Chỉ đạo điều hành</a></li>
                                <li><a href="${window.BASE_URL || ''}user/chuyen-muc-khac/cong-tac-xay-dung-dang.html">Công tác xây dựng Đảng</a></li>
                                <li><a href="${window.BASE_URL || ''}user/tin-tuc/giai-phap-an-toan-mang.html">Giải pháp An toàn mạng</a></li>
                                <li><a href="${window.BASE_URL || ''}user/tin-tuc/giai-phap-an-toan-thong-tin.html">Giải pháp An toàn thông tin</a></li>
                                <li><a href="${window.BASE_URL || ''}user/tin-tuc/thong-bao.html">Thông báo</a></li>
                                <li><a href="${window.BASE_URL || ''}user/chuyen-muc-khac/tieu-chuan-chat-luong.html">Tiêu chuẩn - Chất lượng</a></li>
                                <li><a href="${window.BASE_URL || ''}user/tin-tuc/tin-hoat-dong.html">Tin hoạt động</a></li>
                                <li><a href="${window.BASE_URL || ''}user/chuyen-muc-khac/trao-doi-kinh-nghiem.html">Trao đổi kinh nghiệm</a></li>
                                <li><a href="${window.BASE_URL || ''}user/chuyen-muc-khac/tuong-tac-cong-dan.html">Tương tác công dân</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown" data-nav="van-ban">
                            <a href="#">Văn bản <i class="fa-solid fa-angle-down"></i></a>
                            <ul class="dropdown">
                                <li class="dropdown-submenu">
                                    <a href="${window.BASE_URL || ''}user/van-ban/van-ban.html">Văn bản Trung tâm IOC <i class="fa-solid fa-angle-right"
                                            style="float: right; margin-top: 4px;"></i></a>
                                    <ul class="dropdown">
                                        <li><a href="${window.BASE_URL || ''}user/van-ban/van-ban.html?type=cong-van">Công văn</a></li>
                                        <li><a href="${window.BASE_URL || ''}user/van-ban/van-ban.html?type=bao-cao">Báo cáo</a></li>
                                        <li><a href="${window.BASE_URL || ''}user/van-ban/van-ban.html?type=ke-hoach">Kế hoạch</a></li>
                                        <li><a href="${window.BASE_URL || ''}user/van-ban/van-ban.html?type=quyet-dinh">Quyết định</a></li>
                                        <li><a href="${window.BASE_URL || ''}user/van-ban/van-ban.html?type=huong-dan">Hướng dẫn</a></li>
                                        <li><a href="${window.BASE_URL || ''}user/van-ban/van-ban.html?type=chuong-trinh">Chương trình</a></li>
                                        <li><a href="${window.BASE_URL || ''}user/van-ban/van-ban.html?type=tap-huan">Tập huấn</a></li>
                                    </ul>
                                </li>
                                <li id="menu-bo-khcn"><a href="#">Bộ Khoa học và Công nghệ</a></li>
                                <li id="menu-ubnd"><a href="#">UBND tỉnh Đắk Lắk</a></li>
                                <li id="menu-csdl-vbqppl"><a href="#">CSDL VBQPPL tỉnh Đắk Lắk</a></li>
                                <li id="menu-khcn-tw"><a href="#">Khoa học và Công nghệ Trung ương</a></li>
                                <li id="menu-khcn-dp"><a href="#">Khoa học và Công nghệ địa phương</a></li>
                                <li id="menu-vb-luat"><a href="#">Văn bản luật</a></li>
                            </ul>
                        </li>
                        <li class="nav-item has-dropdown" data-nav="y-kien-du-thao">
                            <a href="${window.BASE_URL || ''}user/y-kien-du-thao/danh-sach.html">Ý kiến dự thảo <i class="fa-solid fa-angle-down"></i></a>
                            <ul class="dropdown">
                                <li><a href="${window.BASE_URL || ''}user/y-kien-du-thao/danh-sach.html">Lấy ý kiến người dân</a></li>
                                <li><a href="${window.BASE_URL || ''}user/y-kien-du-thao/so-khcn.html">Văn bản dự thảo Sở KHCN</a></li>
                                <li class="dropdown-submenu">
                                    <a href="${window.BASE_URL || ''}user/y-kien-du-thao/tt-ioc.html">Văn bản dự thảo Trung tâm IOC <i class="fa-solid fa-angle-right"
                                            style="float: right; margin-top: 4px;"></i></a>
                                    <ul class="dropdown">
                                        <li><a href="${window.BASE_URL || ''}user/y-kien-du-thao/tt-ioc.html?category=Báo cáo">Báo cáo</a></li>
                                        <li><a href="${window.BASE_URL || ''}user/y-kien-du-thao/tt-ioc.html?category=Công văn">Công văn</a></li>
                                        <li><a href="${window.BASE_URL || ''}user/y-kien-du-thao/tt-ioc.html?category=Hướng dẫn">Hướng dẫn</a></li>
                                        <li><a href="${window.BASE_URL || ''}user/y-kien-du-thao/tt-ioc.html?category=Quyết định">Quyết định</a></li>
                                        <li><a href="${window.BASE_URL || ''}user/y-kien-du-thao/tt-ioc.html?category=Tập huấn">Tập huấn</a></li>
                                    </ul>
                                </li>
                                <li><a href="${window.BASE_URL || ''}user/y-kien-du-thao/ubnd-daklak.html">Văn bản dự thảo UBND tỉnh Đắk Lắk</a></li>
                            </ul>
                        </li>
                        <li class="nav-item" data-nav="lich-cong-tac" id="menu-lich-cong-tac">
                            <a href="#">Lịch công tác</a>
                        </li>
                        <li class="nav-item has-dropdown" data-nav="hoi-dap">
                            <a href="#">Hỏi đáp <i class="fa-solid fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i></a>
                            <ul class="dropdown">
                                <li><a href="${window.BASE_URL || ''}user/hoi-dap/cau-hoi-thuong-gap.html">Các câu hỏi thường gặp</a></li>
                                <li><a href="${window.BASE_URL || ''}user/hoi-dap/gui-cau-hoi.html">Liên hệ - Gửi câu hỏi</a></li>
                            </ul>
                        </li>
                    </ul>
                    
                    <div style="position: relative; margin-left: auto; display: flex; align-items: center;">
                        <button class="search-btn" id="searchBtn" style="margin-left: 0;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m21 21-4.34-4.34" />
                                <circle cx="11" cy="11" r="8" />
                            </svg>
                        </button>
                        <div class="search-form" id="searchForm">
                            <form>
                                <input type="text" placeholder="Nhập tìm kiếm..." required
                                    oninvalid="this.setCustomValidity('Vui lòng nhập từ khóa tìm kiếm')"
                                    oninput="this.setCustomValidity('')">
                                <button type="submit">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.34-4.34" />
                                    </svg>
                                </button>
                                <button type="button" class="close-search" id="closeSearch">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                    <div class="lang-switcher" id="langSwitcher" style="margin-left: 15px; position: relative;">
                        <button id="langBtn" title="Chuyển đổi ngôn ngữ" style="background: transparent; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; color: white; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.2s;">
                            <i class="fa-solid fa-globe" style="font-size: 16px;"></i>
                            <span id="currentLangText">VI</span>
                            <i class="fa-solid fa-caret-down" style="font-size: 10px; opacity: 0.7;"></i>
                        </button>
                        <div id="langDropdown" style="display: none; position: absolute; top: calc(100% + 8px); right: 0; background: white; border-radius: 10px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); overflow: hidden; min-width: 170px; z-index: 9999; border: 1px solid #e2e8f0;">
                            <div style="padding: 10px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Ngôn ngữ / Language</div>
                            <a href="#" class="lang-option" data-lang="vi" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; text-decoration: none; color: #1e293b; font-size: 14px; transition: background 0.15s; border-bottom: 1px solid #f1f5f9;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">🇻🇳 Tiếng Việt</a>
                            <a href="#" class="lang-option" data-lang="en" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; text-decoration: none; color: #1e293b; font-size: 14px; transition: background 0.15s; border-bottom: 1px solid #f1f5f9;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">🇬🇧 English</a>
                            <a href="#" class="lang-option" data-lang="zh-CN" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; text-decoration: none; color: #1e293b; font-size: 14px; transition: background 0.15s; border-bottom: 1px solid #f1f5f9;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">🇨🇳 中文</a>
                            <a href="#" class="lang-option" data-lang="ja" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; text-decoration: none; color: #1e293b; font-size: 14px; transition: background 0.15s; border-bottom: 1px solid #f1f5f9;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">🇯🇵 日本語</a>
                            <a href="#" class="lang-option" data-lang="ko" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; text-decoration: none; color: #1e293b; font-size: 14px; transition: background 0.15s; border-bottom: 1px solid #f1f5f9;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">🇰🇷 한국어</a>
                            <a href="#" class="lang-option" data-lang="fr" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; text-decoration: none; color: #1e293b; font-size: 14px; transition: background 0.15s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">🇫🇷 Français</a>
                        </div>
                    </div>
                    <div id="google_translate_element" style="display: none;"></div>
                    <div class="user-dropdown-container" id="userDropdownContainer" style="margin-left: 20px; margin-right: 0;">
                        <button class="user-btn" id="userBtn" title="Tài khoản" style="display: flex; align-items: center;">
                            <i class="fa-solid fa-user"></i> <span id="userBtnText" style="font-family: 'Inter', sans-serif; font-size: 14px; margin-left: 8px; font-weight: 500;">Đăng nhập</span>
                        </button>
                        <ul class="user-dropdown-menu" id="userDropdownMenu">
                            <li class="user-info-item">Xin chào, <b id="displayUsername">Guest</b></li>
                            <li><hr></li>
                            <li><a href="${window.BASE_URL || ''}profile/ho-so.html"><i class="fa-solid fa-address-card"></i> Hồ sơ cá nhân</a></li>
                            <li id="adminLinkItem" style="display: none;"><a href="${window.BASE_URL || ''}admin/quan-tri.html" target="_blank"><i class="fa-solid fa-user-shield"></i> Chuyển tới trang Admin</a></li>
                            <li><a href="#" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a></li>
                        </ul>
                    </div>
                </nav>
            </div>
        </div>
        <!-- Mobile menu button -->
        <button class="mobile-menu-btn" id="mobileMenuBtn">
            <i class="fa-solid fa-bars"></i>
        </button>
    </header>`,

    renderFooter: (config = {}) => {
        const formatLink = (link) => {
            if (!link || link === '#') return '#';
            link = link.trim();
            if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
                return 'https://' + link;
            }
            return link;
        };

        const ncscImg = config.ncscImageUrl ? `<img src="${config.ncscImageUrl}" alt="NCSC" style="max-height: 50px; border-radius: 6px;">` : `<svg viewBox="0 0 140 50" width="140" height="50">
                                <rect width="140" height="50" rx="6" fill="white" />
                                <text x="70" y="20" text-anchor="middle" fill="#1a5276" font-size="10" font-weight="700"
                                    font-family="Inter">NCSC</text>
                                <text x="70" y="32" text-anchor="middle" fill="#555" font-size="7"
                                    font-family="Inter">Website đạt chứng nhận</text>
                                <text x="70" y="43" text-anchor="middle" fill="#c0392b" font-size="8" font-weight="700"
                                    font-family="Inter">TÍN NHIỆM MẠNG</text>
                            </svg>`;
        const qrImg = config.qrCodeUrl ? `<img src="${config.qrCodeUrl}" alt="QR Code" style="width: 80px; height: 80px; border-radius: 4px;">` : `<svg viewBox="0 0 80 80" width="80" height="80">
                                    <rect width="80" height="80" rx="4" fill="white" />
                                    <rect x="8" y="8" width="20" height="20" rx="2" fill="#333" />
                                    <rect x="52" y="8" width="20" height="20" rx="2" fill="#333" />
                                    <rect x="8" y="52" width="20" height="20" rx="2" fill="#333" />
                                    <rect x="12" y="12" width="12" height="12" rx="1" fill="white" />
                                    <rect x="56" y="12" width="12" height="12" rx="1" fill="white" />
                                    <rect x="12" y="56" width="12" height="12" rx="1" fill="white" />
                                    <rect x="15" y="15" width="6" height="6" fill="#333" />
                                    <rect x="59" y="15" width="6" height="6" fill="#333" />
                                    <rect x="15" y="59" width="6" height="6" fill="#333" />
                                    <rect x="32" y="8" width="4" height="4" fill="#333" />
                                    <rect x="40" y="8" width="4" height="4" fill="#333" />
                                    <rect x="32" y="16" width="4" height="4" fill="#333" />
                                    <rect x="44" y="16" width="4" height="4" fill="#333" />
                                    <rect x="36" y="32" width="8" height="8" fill="#333" />
                                    <rect x="52" y="36" width="4" height="4" fill="#333" />
                                    <rect x="60" y="40" width="4" height="4" fill="#333" />
                                    <rect x="32" y="52" width="4" height="4" fill="#333" />
                                    <rect x="40" y="56" width="4" height="4" fill="#333" />
                                    <rect x="52" y="52" width="8" height="8" fill="#333" />
                                    <rect x="64" y="56" width="4" height="4" fill="#333" />
                                </svg>`;

        return `
    <!-- ===== FOOTER ===== -->
    <footer class="footer">
        <div class="container">
            <div class="footer-main">
                <div class="footer-column">
                    <div class="footer-brand">
                        <div class="footer-logo">
                            <svg viewBox="0 0 60 60" width="60" height="60">
                                <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" />
                                <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
                                <text x="30" y="28" text-anchor="middle" fill="white" font-size="8" font-weight="700" font-family="Inter">DakLakIOC</text>
                                <text x="30" y="38" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="5" font-family="Inter">SMART CITY</text>
                            </svg>
                        </div>
                        <div class="footer-brand-text">
                            <strong>${config.brandName || 'DAKLAK IOC'}</strong>
                            <span>${config.brandDesc || 'Trung tâm Giám sát, điều hành đô thị thông minh tỉnh Đăk Lăk'}</span>
                        </div>
                    </div>
                    <div class="footer-info">
                        <h4>THÔNG TIN TRUNG TÂM</h4>
                        <p><i class="fa-solid fa-location-dot"></i> ${config.address || 'Địa chỉ: 28B Y Bih Aleo, Phường Buôn Ma Thuột, tỉnh Đắk Lắk'}</p>
                        <p><i class="fa-solid fa-phone"></i> Điện thoại: <a href="tel:${config.phone || '02621022'}">${config.phone || '02621022'}</a> - Fax: ${config.fax || '02621022'}</p>
                        <p><i class="fa-solid fa-envelope"></i> Email: <a href="mailto:${config.email || 'banbientapioc.tttt@daklak.gov.vn'}">${config.email || 'banbientapioc.tttt@daklak.gov.vn'}</a></p>
                    </div>
                </div>
                <div class="footer-column">
                    <div class="footer-social">
                        <h4>THEO DÕI CHÚNG TÔI TẠI</h4>
                        <div class="social-links">
                            <a href="${formatLink(config.facebookLink)}" target="_blank" class="social-icon facebook" aria-label="Facebook">
                                <i class="fa-brands fa-facebook-f"></i>
                            </a>
                            <a href="${formatLink(config.zaloLink)}" target="_blank" class="social-icon zalo" aria-label="Zalo">
                                <span style="font-weight:700;font-size:10px;">Zalo</span>
                            </a>
                            <a href="${formatLink(config.youtubeLink)}" target="_blank" class="social-icon youtube" aria-label="YouTube">
                                <i class="fa-brands fa-youtube"></i>
                            </a>
                            <a href="${formatLink(config.tiktokLink)}" target="_blank" class="social-icon tiktok" aria-label="TikTok">
                                <i class="fa-brands fa-tiktok"></i>
                            </a>
                        </div>
                    </div>
                    <div class="footer-cert" style="margin-top: 15px;">
                        <div class="cert-badge">
                            <a href="${formatLink(config.ncscLink)}" target="_blank" style="text-decoration:none;">
                                ${ncscImg}
                            </a>
                        </div>
                    </div>
                </div>
                <div class="footer-column">
                    <div class="footer-app">
                        <h4>TẢI ỨNG DỤNG ĐĂK LĂK SỐ</h4>
                        <div class="app-download">
                            <div class="qr-code">
                                ${qrImg}
                            </div>
                            <div class="store-links">
                                <a href="${formatLink(config.appStoreLink)}" target="_blank" class="store-btn">
                                    <svg viewBox="0 0 135 40" width="135" height="40">
                                        <rect width="135" height="40" rx="6" fill="#000" />
                                        <text x="67" y="15" text-anchor="middle" fill="#999" font-size="7" font-family="Inter">Download on the</text>
                                        <text x="67" y="28" text-anchor="middle" fill="white" font-size="13" font-weight="600" font-family="Inter">App Store</text>
                                    </svg>
                                </a>
                                <a href="${formatLink(config.googlePlayLink)}" target="_blank" class="store-btn">
                                    <svg viewBox="0 0 135 40" width="135" height="40">
                                        <rect width="135" height="40" rx="6" fill="#000" />
                                        <text x="67" y="15" text-anchor="middle" fill="#999" font-size="7" font-family="Inter">GET IT ON</text>
                                        <text x="67" y="28" text-anchor="middle" fill="white" font-size="13" font-weight="600" font-family="Inter">Google Play</text>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>${config.copyrightText || '© 2026 Trung tâm Giám sát, Điều hành đô thị thông minh tỉnh Đắk Lắk – All Rights Reserved'}</p>
                <p>${config.disclaimerText || 'Ghi rõ nguồn "Trang Thông tin điện tử Trung tâm IOC" hoặc iocdaklak.vn khi phát hành lại thông tin từ các nguồn này.'}</p>
            </div>
        </div>
    </footer>`;
    },

    comments: `
            <!-- ===== COMMENTS SECTION ===== -->
            <div class="comments-section" id="commentsSection">
                <div class="comments-header">
                    <h3>Bình luận</h3>
                    <div class="comments-sort">
                        <select id="commentsSort">
                            <option value="likes">Tiêu biểu (nhiều like nhất)</option>
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                        </select>
                    </div>
                </div>
                
                <div class="comments-input-area" id="commentsInputArea" style="display:none;">
                    <textarea id="commentInput" placeholder="Nhập bình luận của bạn..." rows="3"></textarea>
                    <div style="text-align: right; margin-top: 10px;">
                        <button id="postCommentBtn" class="post-comment-btn">Gửi bình luận</button>
                    </div>
                </div>
                <div class="comments-login-prompt" id="commentsLoginPrompt">
                    Vui lòng <a href="#" id="promptLoginBtn">đăng nhập</a> hoặc <a href="#" id="promptRegisterBtn">đăng ký</a> để có thể bình luận.
                </div>
                
                <div class="comments-list" id="commentsList">
                    <!-- Comments render here -->
                </div>
            </div>`,

    scrollTop: `
    <!-- ===== SCROLL TO TOP ===== -->
    <button class="scroll-top" id="scrollTopBtn" aria-label="Scroll to top">
        <i class="fa-solid fa-arrow-up"></i>
    </button>`
};

// Inject components synchronously since the script is placed at the end of body
(function() {
    // 1. Inject Header at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', commonComponents.header);
    
    // 2. Inject Footer & Scroll Top at the end of body
    document.body.insertAdjacentHTML('beforeend', '<div id="footer-placeholder"></div>');
    document.getElementById('footer-placeholder').outerHTML = commonComponents.renderFooter({}); // default first
    document.body.insertAdjacentHTML('beforeend', commonComponents.scrollTop);
    
    // 3. Inject Comments Section if placeholder exists
    const commentsPlaceholder = document.getElementById('common-comments');
    if (commentsPlaceholder) {
        commentsPlaceholder.outerHTML = commonComponents.comments;
    }

    // 4. Handle active menu state
    const pageId = document.body.dataset.pageId;
    if (pageId) {
        // Mảng các page-id thuộc mục "Tin tức"
        const newsPages = [
            'cap-nhat-bao-lu', 'cds-doi-moi-sang-tao', 'chi-dao-dieu-hanh', 
            'cong-tac-xay-dung-dang', 'giai-phap-an-toan-mang', 'giai-phap-an-toan-thong-tin',
            'thong-bao', 'tieu-chuan-chat-luong', 'tin-hoat-dong', 'trao-doi-kinh-nghiem', 'tuong-tac-cong-dan'
        ];
        
        // Mảng các page-id thuộc mục "Giới thiệu"
        const introPages = [
            'chuc-nang-nhiem-vu', 'dau-moi-ho-tro', 'lich-su-hinh-thanh', 'san-pham-tieu-bieu', 'so-do-to-chuc'
        ];

        let activeNav = '';
        if (pageId === 'trang-chu') {
            activeNav = 'trang-chu';
        } else if (pageId === 'co-cau-to-chuc') {
            activeNav = 'co-cau-to-chuc';
        } else if (newsPages.includes(pageId)) {
            activeNav = 'tin-tuc';
        } else if (introPages.includes(pageId)) {
            activeNav = 'gioi-thieu';
        }
        
        if (activeNav) {
            const activeMenuItem = document.querySelector(`.nav-item[data-nav="${activeNav}"]`);
            if (activeMenuItem) {
                // Xóa class active ở các item khác
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                // Thêm active
                activeMenuItem.classList.add('active');
            }
        }
    }
    
    // 4.5. Khởi tạo chức năng tìm kiếm chung
    const searchBtn = document.getElementById('searchBtn');
    const searchForm = document.getElementById('searchForm');
    const closeSearch = document.getElementById('closeSearch');
    const navList = document.querySelector('.nav-list');
    
    if (searchBtn && searchForm) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchForm.classList.add('active');
            if (navList) navList.classList.add('search-active');
            const input = searchForm.querySelector('input');
            if (input) setTimeout(() => input.focus(), 50);
        });
    
        // Đóng khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (searchForm.classList.contains('active')) {
                if (!searchForm.contains(e.target) && !searchBtn.contains(e.target)) {
                    searchForm.classList.remove('active');
                    if (navList) navList.classList.remove('search-active');
                }
            }
        });
    }
    
    if (closeSearch && searchForm) {
        closeSearch.addEventListener('click', () => {
            searchForm.classList.remove('active');
            if (navList) navList.classList.remove('search-active');
        });
    }

    // 4.7. Google Translate Widget
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');
    
    if (langBtn && langDropdown) {
        // Toggle dropdown
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.style.display = langDropdown.style.display === 'none' ? 'block' : 'none';
        });
        
        // Đóng khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
                langDropdown.style.display = 'none';
            }
        });
        
        // Hover effect cho nút
        langBtn.addEventListener('mouseover', () => { langBtn.style.borderColor = 'rgba(255,255,255,0.6)'; langBtn.style.background = 'rgba(255,255,255,0.1)'; });
        langBtn.addEventListener('mouseout', () => { langBtn.style.borderColor = 'rgba(255,255,255,0.3)'; langBtn.style.background = 'transparent'; });
        
        const langLabels = { 'vi': 'VI', 'en': 'EN', 'zh-CN': '中', 'ja': 'JA', 'ko': 'KO', 'fr': 'FR' };
        
        // Khôi phục trạng thái nút từ cookie nếu có
        const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
        if (match) {
            const currentLang = match[1].split('/').pop();
            const currentLangText = document.getElementById('currentLangText');
            if (currentLangText && langLabels[currentLang]) {
                currentLangText.textContent = langLabels[currentLang];
            }
        }
        
        // Xử lý chọn ngôn ngữ
        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = opt.getAttribute('data-lang');
                langDropdown.style.display = 'none';
                
                const currentLangText = document.getElementById('currentLangText');
                if (currentLangText) currentLangText.textContent = langLabels[lang] || lang.toUpperCase();
                
                // Đặt cookie
                const expires = "expires=Thu, 01 Jan 2030 00:00:00 UTC";
                const expirePast = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
                
                if (lang === 'vi') {
                    // Xóa cookie ngôn ngữ để khôi phục mặc định
                    document.cookie = `googtrans=; ${expirePast}; path=/;`;
                    document.cookie = `googtrans=; ${expirePast}; domain=${location.hostname}; path=/;`;
                    document.cookie = `googtrans=; ${expirePast}; domain=.${location.hostname}; path=/;`;
                } else {
                    // Đặt cookie cho Google Translate
                    const val = `/vi/${lang}`;
                    document.cookie = `googtrans=${val}; ${expires}; path=/;`;
                    document.cookie = `googtrans=${val}; ${expires}; domain=${location.hostname}; path=/;`;
                    document.cookie = `googtrans=${val}; ${expires}; domain=.${location.hostname}; path=/;`;
                }
                
                // Tải lại trang để Google Translate script tự động dịch theo Cookie mới
                location.reload();
            });
        });
    }
    
    // Inject Google Translate script
    if (!document.getElementById('google-translate-script')) {
        window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({
                pageLanguage: 'vi',
                includedLanguages: 'vi,en,zh-CN,ja,ko,fr',
                autoDisplay: false,
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
        };
        const gtScript = document.createElement('script');
        gtScript.id = 'google-translate-script';
        gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(gtScript);
    }

    // 4.6. Chức năng cuộn trang (Sticky Header & Scroll Top)
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        // Scroll Top Button
        if (scrollTopBtn) {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
        
        // Sticky Header
        if (header) {
            if (window.scrollY >= 85) {
                document.body.classList.add('is-sticky');
            } else {
                document.body.classList.remove('is-sticky');
            }
        }
    }, { passive: true });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 5. Load dynamic config (e.g. Bo KHCN link)
    setTimeout(async () => {
        try {
            
            const res = await fetch('http://localhost:5100/api/cau-hinh');
            if (res.ok) {
                const config = await res.json();
                
                // FOOTER UPDATE
                if (config && config.footerConfig) {
                    const existingFooter = document.querySelector('.footer');
                    if (existingFooter) {
                        existingFooter.outerHTML = commonComponents.renderFooter(config.footerConfig);
                    }
                }

                if (config && config.boKhcnLink) {
                    const boKhcnEl = document.querySelector('#menu-bo-khcn a');
                    if (boKhcnEl) {
                        let link = config.boKhcnLink.trim();
                        if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
                            link = 'https://' + link;
                        }
                        boKhcnEl.href = link;
                        boKhcnEl.target = '_blank';
                    }
                }
                if (config && config.ubndLink) {
                    const ubndEl = document.querySelector('#menu-ubnd a');
                    if (ubndEl) {
                        let link = config.ubndLink.trim();
                        if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
                            link = 'https://' + link;
                        }
                        ubndEl.href = link;
                        ubndEl.target = '_blank';
                    }
                }
                
                const processLink = (configKey, menuId) => {
                    if (config && config[configKey]) {
                        const el = document.querySelector(`#${menuId} a`);
                        if (el) {
                            let link = config[configKey].trim();
                            if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
                                link = 'https://' + link;
                            }
                            el.href = link;
                            el.target = '_blank';
                        }
                    }
                };
                
                processLink('csdlVbqpplLink', 'menu-csdl-vbqppl');
                processLink('khcnTwLink', 'menu-khcn-tw');
                processLink('khcnDpLink', 'menu-khcn-dp');
                processLink('vbLuatLink', 'menu-vb-luat');
                processLink('lichCongTacLink', 'menu-lich-cong-tac');
            }
        } catch (e) {
            console.error('Error loading dynamic config:', e);
        }
    }, 100);
})();

window.currentFontSize = 17;
window.changeFontSize = function(step) {
    window.currentFontSize += step;
    
    // Giới hạn cỡ chữ
    if (window.currentFontSize < 12) window.currentFontSize = 12;
    if (window.currentFontSize > 30) window.currentFontSize = 30;

    // Cập nhật phần trăm hiển thị
    const zoomText = document.getElementById('zoom-percentage');
    if (zoomText) {
        const percentage = Math.round((window.currentFontSize / 17) * 100);
        zoomText.innerText = percentage + '%';
    }

    const contentDiv = document.getElementById('detail-content') || document.querySelector('.article-detail-content') || document.querySelector('.doc-detail-content');
    if (contentDiv) {
        contentDiv.style.fontSize = window.currentFontSize + 'px';
        contentDiv.style.lineHeight = '1.8';
        const allTextElements = contentDiv.querySelectorAll('p, div, span, li');
        allTextElements.forEach(el => {
            el.style.fontSize = window.currentFontSize + 'px';
            el.style.lineHeight = '1.8';
        });
    }

    const docTables = document.querySelectorAll('.doc-detail-meta-table td, .doc-detail-meta-table th');
    if (docTables.length > 0) {
        docTables.forEach(el => {
            el.style.fontSize = Math.max(12, window.currentFontSize - 2) + 'px';
        });
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.getAttribute('data-page-id');
    const isDetailPage = ['chi-tiet-tin-tuc', 'chi-tiet-video', 'chi-tiet-van-ban', 'chi-tiet-y-kien'].includes(pageId);
    
    if (isDetailPage) {
        const zoomWidget = document.createElement('div');
        zoomWidget.id = 'zoom-widget';
        zoomWidget.style.position = 'fixed';
        zoomWidget.style.left = 'max(20px, calc(50% - 550px))';
        zoomWidget.style.top = '50%';
        zoomWidget.style.transform = 'translateY(-50%)';
        zoomWidget.style.display = 'flex';
        zoomWidget.style.flexDirection = 'column';
        zoomWidget.style.background = '#fff';
        zoomWidget.style.border = '1px solid #cbd5e1';
        zoomWidget.style.borderRadius = '30px';
        zoomWidget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        zoomWidget.style.overflow = 'hidden';
        zoomWidget.style.zIndex = '9999';
        zoomWidget.style.transition = 'opacity 0.3s ease';
        
        let initialPercentage = 100;
        if (window.currentFontSize) {
            initialPercentage = Math.round((window.currentFontSize / 17) * 100);
        }

        zoomWidget.innerHTML = `
            <button onclick="changeFontSize(1)" style="background: transparent; color: #0f172a; border: none; padding: 12px 15px; cursor: pointer; font-size: 18px; transition: background 0.2s; border-bottom: 1px solid #cbd5e1;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Tăng cỡ chữ">
                <i class="fa-solid fa-plus" style="color: #64748b;"></i>
            </button>
            <div id="zoom-percentage" style="padding: 10px 0; text-align: center; font-size: 13px; font-weight: bold; color: #475569; border-bottom: 1px solid #cbd5e1; user-select: none;">${initialPercentage}%</div>
            <button onclick="changeFontSize(-1)" style="background: transparent; color: #0f172a; border: none; padding: 12px 15px; cursor: pointer; font-size: 18px; transition: background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'" title="Giảm cỡ chữ">
                <i class="fa-solid fa-minus" style="color: #64748b;"></i>
            </button>
        `;
        document.body.appendChild(zoomWidget);

        window.addEventListener('scroll', () => {
            const contentDiv = document.getElementById('detail-content') || document.querySelector('.article-detail-content') || document.querySelector('.doc-detail-content');
            if (contentDiv && zoomWidget) {
                const contentRect = contentDiv.getBoundingClientRect();
                // When the bottom of the article goes above the middle of the screen (where widget is), hide the widget
                if (contentRect.bottom < (window.innerHeight / 2)) {
                    zoomWidget.style.opacity = '0';
                    zoomWidget.style.pointerEvents = 'none';
                } else {
                    zoomWidget.style.opacity = '1';
                    zoomWidget.style.pointerEvents = 'auto';
                }
            }
        });
    }
});
