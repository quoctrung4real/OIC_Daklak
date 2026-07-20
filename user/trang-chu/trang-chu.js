// ===== CUỘN LÊN ĐẦU TRANG =====
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (!scrollTopBtn) return;
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}, { passive: true });

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== LOGO HEADER CỐ ĐỊNH =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (header) {
        if (window.scrollY >= 85) {
            document.body.classList.add('is-sticky');
        } else {
            document.body.classList.remove('is-sticky');
        }
    }
}, { passive: true });

// ===== BẬT/TẮT TÌM KIẾM =====
const searchBtn = document.getElementById('searchBtn');
const searchForm = document.getElementById('searchForm');
const closeSearch = document.getElementById('closeSearch');

if (searchBtn && searchForm) {
    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchForm.classList.add('active');
        const input = searchForm.querySelector('input');
        if (input) setTimeout(() => input.focus(), 50);
    });

    // Đóng khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (searchForm.classList.contains('active')) {
            if (!searchForm.contains(e.target) && !searchBtn.contains(e.target)) {
                searchForm.classList.remove('active');
            }
        }
    });
}

if (closeSearch && searchForm) {
    closeSearch.addEventListener('click', () => {
        searchForm.classList.remove('active');
    });
}

// ===== MENU ĐIỆN THOẠI =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        document.body.classList.toggle('open-menu');
    });
}

// ===== CHUYỂN TAB TÀI LIỆU =====
const docTabs = document.querySelectorAll('.doc-tab');

docTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabIndex = tab.dataset.tab;

        // Xóa trạng thái active của tất cả các tab
        docTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Hiển thị/ẩn nội dung tab
        document.querySelectorAll('.documents-table').forEach(table => {
            table.classList.add('hidden');
        });

        const targetTable = document.getElementById(`docTab${tabIndex}`);
        if (targetTable) {
            targetTable.classList.remove('hidden');
        }
    });
});

// ===== OBSERVER ĐỂ CHẠY ANIMATION KHI CUỘN =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Theo dõi các phần tử có hiệu ứng animation
document.querySelectorAll('.solution-card, .partner-card, .news-card, .sidebar-banner').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

// Xử lý đóng mở Accordion (Sidebar)
const accordionHeaders = document.querySelectorAll('.accordion-header');
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        item.classList.toggle('active');
    });
});

// ===== TÍCH HỢP API (C# BACKEND) =====
const API_BASE = 'http://localhost:5100/api';

async function loadConfig() {
    try {
        const response = await fetch(`${API_BASE}/cau-hinh`);
        if (!response.ok) return;
        const config = await response.json();

        if (config.bannerUrl) {
            const banner = document.querySelector('.header-banner-bg');
            if (banner) {
                banner.style.backgroundImage = `url('${config.bannerUrl}')`;
                banner.style.backgroundSize = 'cover';
                banner.style.backgroundPosition = 'center';
            }
        }
        
        
        // Inject dynamic links from config
        const menu_ubnd = document.getElementById('menu-ubnd');
        if (menu_ubnd) {
            const a = menu_ubnd.querySelector('a');
            if (a) {
                a.href = config['Url_UBND'] || 'https://daklak.gov.vn';
                a.target = '_blank';
            }
        }
        const menu_csdl_vbqppl = document.getElementById('menu-csdl-vbqppl');
        if (menu_csdl_vbqppl) {
            const a = menu_csdl_vbqppl.querySelector('a');
            if (a) {
                a.href = config['Url_CSDL'] || 'https://qppl.daklak.gov.vn';
                a.target = '_blank';
            }
        }
        const menu_khcn_tw = document.getElementById('menu-khcn-tw');
        if (menu_khcn_tw) {
            const a = menu_khcn_tw.querySelector('a');
            if (a) {
                a.href = config['Url_KHCN_TW'] || 'https://www.most.gov.vn';
                a.target = '_blank';
            }
        }
        const menu_khcn_dp = document.getElementById('menu-khcn-dp');
        if (menu_khcn_dp) {
            const a = menu_khcn_dp.querySelector('a');
            if (a) {
                a.href = config['Url_KHCN_DP'] || 'https://khcn.daklak.gov.vn';
                a.target = '_blank';
            }
        }
        const menu_vb_luat = document.getElementById('menu-vb-luat');
        if (menu_vb_luat) {
            const a = menu_vb_luat.querySelector('a');
            if (a) {
                a.href = config['Url_VBLuat'] || 'https://vbpl.vn';
                a.target = '_blank';
            }
        }
        const menu_bo_khcn = document.getElementById('menu-bo-khcn');
        if (menu_bo_khcn) {
            const a = menu_bo_khcn.querySelector('a');
            if (a) {
                a.href = config['Url_KHCN_TW'] || 'https://www.most.gov.vn';
                a.target = '_blank';
            }
        }

        if (config.logoUrl) {
            const logoEl = document.querySelector('.header-content .logo .logo-icon');
            if (logoEl) {
                logoEl.innerHTML = `<img src="${config.logoUrl}" style="max-height: 60px; object-fit: contain;">`;
            }
        }
        
        if (config.headerTextMain) {
            const titleEl = document.querySelector('.header-content .logo-title');
            if (titleEl) {
                titleEl.innerText = config.headerTextMain;
                if (config.headerFontMain) titleEl.style.fontFamily = config.headerFontMain;
            }
        }
        
        if (config.headerTextSub) {
            const subtitleEl = document.querySelector('.header-content .logo-subtitle');
            if (subtitleEl) {
                subtitleEl.innerText = config.headerTextSub;
                if (config.headerFontSub) subtitleEl.style.fontFamily = config.headerFontSub;
            }
        }
        
        if (config.headerTextColor) {
            const titleEl = document.querySelector('.header-content .logo-title');
            const subtitleEl = document.querySelector('.header-content .logo-subtitle');
            if (titleEl) titleEl.style.color = config.headerTextColor;
            if (subtitleEl) subtitleEl.style.color = config.headerTextColor;
        }

        if (config.menuBarBgColor) {
            const navWrapper = document.querySelector('.nav-wrapper');
            if (navWrapper) navWrapper.style.backgroundColor = config.menuBarBgColor;
        }
        
        if (config.welcomeBgColor) {
            const welcomeBanner = document.querySelector('.welcome-banner');
            if (welcomeBanner) {
                welcomeBanner.style.background = config.welcomeBgColor; // Overrides linear-gradient too
            }
        }
        if (config.welcomeTextColor) {
            const welcomeBanner = document.querySelector('.welcome-banner');
            if (welcomeBanner) welcomeBanner.style.color = config.welcomeTextColor;
        }
        if (config.welcomeText) {
            const track = document.querySelector('.welcome-track');
            if (track) {
                const parts = config.welcomeText.split('★').map(p => p.trim());
                let html = '';
                // Duplicate text to create continuous ticker effect
                for (let i = 0; i < 4; i++) {
                    parts.forEach((p, index) => {
                        html += `<span>${p}</span>`;
                        if (index < parts.length - 1) {
                            html += `<span class="star">★</span>`;
                        }
                    });
                    
                    if (i < 3) {
                        if (parts.length > 1) {
                            html += `<span class="star">★</span>`;
                        } else {
                            html += `<span style="display: inline-block; width: 50px;"></span>`;
                        }
                    }
                }
                track.innerHTML = html;
            }
        }

        if (config.newsSectionBgColor) {
            const newsSection = document.getElementById('news-section');
            if (newsSection) newsSection.style.backgroundColor = config.newsSectionBgColor;
        }
        if (config.infoUtilityBgColor) {
            const infoSection = document.getElementById('info-utility-section');
            if (infoSection) infoSection.style.backgroundColor = config.infoUtilityBgColor;
        }
        
        if (config.heroBgColor) {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) heroSection.style.backgroundColor = config.heroBgColor;
        }

        if (config.heroTitle) {
            const heroTitleEl = document.querySelector('.hero-title');
            if (heroTitleEl) heroTitleEl.innerText = config.heroTitle;
        }

        if (config.heroTitleFont) {
            const heroTitleEl = document.querySelector('.hero-title');
            if (heroTitleEl) heroTitleEl.style.fontFamily = config.heroTitleFont;
        }

        if (config.heroTitleColor) {
            const heroTitleEl = document.querySelector('.hero-title');
            if (heroTitleEl) heroTitleEl.style.color = config.heroTitleColor;
        }

        if (config.heroSubtitle) {
            const heroSubtitleEl = document.querySelector('.hero-description');
            if (heroSubtitleEl) heroSubtitleEl.innerText = config.heroSubtitle;
        }

        if (config.heroSubtitleFont) {
            const heroSubtitleEl = document.querySelector('.hero-description');
            if (heroSubtitleEl) heroSubtitleEl.style.fontFamily = config.heroSubtitleFont;
        }

        if (config.heroSubtitleColor) {
            const heroSubtitleEl = document.querySelector('.hero-description');
            if (heroSubtitleEl) heroSubtitleEl.style.color = config.heroSubtitleColor;
        }

        if (config.heroButtonUrl) {
            const heroButtonEl = document.querySelector('.btn-readmore');
            if (heroButtonEl) heroButtonEl.href = config.heroButtonUrl;
        }

        if (config.heroButtonText) {
            const heroButtonSpan = document.querySelector('.btn-readmore span');
            if (heroButtonSpan) heroButtonSpan.innerText = config.heroButtonText;
        }

        if (config.heroButtonFont) {
            const heroButtonEl = document.querySelector('.btn-readmore');
            if (heroButtonEl) heroButtonEl.style.fontFamily = config.heroButtonFont;
        }

        if (config.heroButtonBgColor) {
            const heroButtonEl = document.querySelector('.btn-readmore');
            if (heroButtonEl) heroButtonEl.style.backgroundColor = config.heroButtonBgColor;
        }
        
        if (config.heroImageUrl) {
            const heroImageContainer = document.querySelector('.hero-image');
            if (heroImageContainer) {
                heroImageContainer.innerHTML = `<img src="${config.heroImageUrl}" style="max-width: 100%; height: auto; border-radius: var(--radius-lg); box-shadow: 0 10px 30px rgba(0,0,0,0.1);">`;
            }
        }
        
        // Ticker logic
        if (config.tickerLabelText) {
            const tickerLabel = document.querySelector('.ticker-label');
            if(tickerLabel) tickerLabel.innerHTML = `<i class="fa-solid fa-bullhorn"></i> ${config.tickerLabelText}`;
        }
        
        if (config.tickerLabelColor) {
            const tickerLabel = document.querySelector('.ticker-label');
            if(tickerLabel) {
                tickerLabel.style.backgroundColor = config.tickerLabelColor;
                let dynamicStyle = document.getElementById('dynamic-ticker-style');
                if(!dynamicStyle) {
                    dynamicStyle = document.createElement('style');
                    dynamicStyle.id = 'dynamic-ticker-style';
                    document.head.appendChild(dynamicStyle);
                }
                dynamicStyle.innerHTML = `.ticker-label::after { border-left-color: ${config.tickerLabelColor} !important; }`;
            }
        }

        if (config.tickerItems && Array.isArray(config.tickerItems)) {
            const track = document.querySelector('.ticker-track');
            if(track) {
                let html = '';
                config.tickerItems.forEach(item => {
                    html += `<a href="${item.link}">${item.title}</a><span class="ticker-separator">|</span>`;
                });
                // Duplicate for seamless scrolling
                html += html;
                track.innerHTML = html;
            }
        }

        // Tech Solutions logic
        if (config.techSolutionsItems && Array.isArray(config.techSolutionsItems)) {
            const cards = document.querySelectorAll('.solution-card');
            const font = config.techSolutionsFont;
            const color = config.techSolutionsColor;

            config.techSolutionsItems.forEach((item, index) => {
                if(cards[index]) {
                    const card = cards[index];
                    const h3 = card.querySelector('h3');
                    const p = card.querySelector('p');
                    const a = card.querySelector('a.solution-link');
                    const imgContainer = card.querySelector('.solution-image');
                    
                    if (h3) {
                        h3.innerText = item.title;
                        if (font) h3.style.fontFamily = font;
                        if (color) h3.style.color = color;
                    }
                    if (p) {
                        p.innerText = item.desc;
                        if (font) p.style.fontFamily = font;
                    }
                    if (a) {
                        a.href = item.link;
                        if (color) {
                            a.style.color = color;
                            const svgPath = a.querySelector('svg path');
                            if (svgPath) svgPath.setAttribute('stroke', color);
                        }
                    }
                    if (imgContainer && item.image) {
                        imgContainer.innerHTML = `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
                    }
                }
            });
        }
        
        // Sidebar Banners (Quản lý sidebar tin tức)
        if (config.sidebarBanners && Array.isArray(config.sidebarBanners)) {
            const sidebarContainer = document.getElementById('dynamic-news-sidebar');
            if (sidebarContainer) {
                sidebarContainer.innerHTML = '';
                config.sidebarBanners.forEach(banner => {
                    let bannerHtml = '';
                    const styleType = banner.style || 'original';
                    
                    if (styleType === 'image_right') {
                        bannerHtml = `
                        <a href="${banner.url}" class="sidebar-banner style-image-right" style="display: flex; align-items: center; height: 100px; border-radius: 8px; margin-bottom: 15px; text-decoration: none; color: white; overflow: hidden; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background-color: ${banner.color}; transition: transform 0.2s;">
                            <div style="display: flex; align-items: center; gap: 15px; padding: 0 20px; z-index: 2; width: 30%; box-sizing: border-box;">
                                ${banner.icon ? `<i class="${banner.icon}" style="font-size: 32px; flex-shrink: 0;"></i>` : ''}
                                <span style="font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; line-height: 1.4; word-wrap: break-word;">${banner.title}</span>
                            </div>
                            ${banner.bgImage ? `<div style="position: absolute; right: 0; top: 0; bottom: 0; width: 70%; background-image: url('${banner.bgImage}'); background-size: cover; background-position: center right; z-index: 1; mask-image: linear-gradient(to right, transparent 0%, black 40%); -webkit-mask-image: linear-gradient(to right, transparent 0%, black 40%);"></div>` : ''}
                        </a>
                        `;
                    } else {
                        // Original style
                        bannerHtml = `
                        <a href="${banner.url}" class="sidebar-banner style-original" style="display: flex; align-items: center; justify-content: center; height: 100px; border-radius: 8px; margin-bottom: 15px; text-decoration: none; color: white; overflow: hidden; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background-color: ${banner.color}; transition: transform 0.2s;">
                            ${banner.bgImage ? `<div style="position: absolute; inset: 0; background-image: url('${banner.bgImage}'); background-size: cover; background-position: center; opacity: ${banner.bgOpacity !== undefined ? banner.bgOpacity : 0.2}; z-index: 1;"></div>` : ''}
                            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; z-index: 2; width: 100%; padding: 0 15px;">
                                ${banner.icon ? `<i class="${banner.icon}" style="font-size: 28px;"></i>` : ''}
                                <span style="font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; text-align: center;">${banner.title}</span>
                            </div>
                        </a>
                        `;
                    }
                    sidebarContainer.innerHTML += bannerHtml;
                });
            }
        } else {
            // Fallback for older configs
            const sidebarContainer = document.getElementById('dynamic-news-sidebar');
            if (sidebarContainer) {
                sidebarContainer.innerHTML = `
                    <a href="#" class="sidebar-banner" style="display: block; text-decoration: none;">
                        <svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg">
                            <rect width="280" height="100" rx="8" fill="#0a59ab" />
                            <text x="140" y="55" text-anchor="middle" fill="white" font-size="16" font-weight="600" font-family="Inter">Dịch vụ công trực tuyến</text>
                        </svg>
                    </a>
                    <a href="#" class="sidebar-banner" style="display: block; text-decoration: none;">
                        <svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg">
                            <rect width="280" height="100" rx="8" fill="#e74c3c" />
                            <text x="140" y="55" text-anchor="middle" fill="white" font-size="16" font-weight="600" font-family="Inter">Gửi phản hồi</text>
                        </svg>
                    </a>
                    <a href="#" class="sidebar-banner" style="display: block; text-decoration: none;">
                        <svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg">
                            <rect width="280" height="100" rx="8" fill="#27ae60" />
                            <text x="140" y="55" text-anchor="middle" fill="white" font-size="16" font-weight="600" font-family="Inter">Hỏi cơ quan nhà nước</text>
                        </svg>
                    </a>
                    <a href="#" class="sidebar-banner" style="display: block; text-decoration: none;">
                        <svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg">
                            <rect width="280" height="100" rx="8" fill="#f39c12" />
                            <text x="140" y="55" text-anchor="middle" fill="white" font-size="16" font-weight="600" font-family="Inter">Tương tác báo chí</text>
                        </svg>
                    </a>
                    <a href="#" class="sidebar-banner" style="display: block; text-decoration: none;">
                        <svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg">
                            <rect width="280" height="100" rx="8" fill="#2c3e50" />
                            <text x="140" y="55" text-anchor="middle" fill="white" font-size="16" font-weight="600" font-family="Inter">Tìm hiểu về chuyển đổi số</text>
                        </svg>
                    </a>
                `;
            }
        }
        
        // Agency Links (Liên kết cơ quan) logic
        if (config.agencyLinksGroups && Array.isArray(config.agencyLinksGroups)) {
            const container = document.getElementById('agency-links-container');
            if (container) {
                container.innerHTML = '';
                const bgColor = config.agencyLinksColor || '#0a59ab';
                config.agencyLinksGroups.forEach(group => {
                    let linksHtml = '';
                    group.links.forEach(link => {
                        linksHtml += `<li><a href="${link.url}" target="_blank"><i class="fa-solid fa-angle-right" style="font-size: 0.8em; margin-right: 6px;"></i> ${link.text}</a></li>`;
                    });
                    
                    container.innerHTML += `
                        <div class="accordion-item">
                            <button class="accordion-header" style="background-color: ${bgColor};">
                                <span>${group.title}</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </button>
                            <div class="accordion-content">
                                <ul>
                                    ${linksHtml}
                                </ul>
                            </div>
                        </div>
                    `;
                });
                
                // Attach event listeners for the newly added accordion headers
                const newHeaders = container.querySelectorAll('.accordion-header');
                newHeaders.forEach(header => {
                    header.addEventListener('click', () => {
                        const item = header.parentElement;
                        item.classList.toggle('active');
                    });
                });
            }
        }
    } catch (e) {
        console.warn('Backend C# is not running. Using default local styles.');
    }
}

async function loadDynamicNews() {
    try {
        const renderFeaturedNews = async () => {
            try {
                const configRes = await fetch(`${API_BASE}/cau-hinh`);
                const config = await configRes.json();
                const featuredIds = config.featuredNewsIds || [];
                
                let featuredPosts = [];
                if (featuredIds.length > 0) {
                    const categories = ['cap-nhat-bao-lu', 'cds-doi-moi-sang-tao', 'chi-dao-dieu-hanh', 'cong-tac-xay-dung-dang', 'giai-phap-an-toan-mang', 'giai-phap-an-toan-thong-tin', 'thong-bao', 'tieu-chuan-chat-luong', 'tin-hoat-dong', 'trao-doi-kinh-nghiem', 'tuong-tac-cong-dan'];
                    let allPosts = [];
                    for (const cat of categories) {
                        const res = await fetch(`${API_BASE}/${cat}`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data && data.posts) {
                                data.posts.forEach(p => p.categoryId = cat);
                                allPosts = allPosts.concat(data.posts);
                            }
                        }
                    }
                    
                    featuredIds.forEach(id => {
                        const post = allPosts.find(p => p.id === id);
                        if (post) featuredPosts.push(post);
                    });
                }
                
                if (featuredPosts.length === 0) {
                    const fallbackRes = await fetch(`${API_BASE}/chi-dao-dieu-hanh`);
                    if (fallbackRes.ok) {
                        const data = await fallbackRes.json();
                        if (data && data.posts) {
                            data.posts.forEach(p => p.categoryId = 'chi-dao-dieu-hanh');
                            data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                            featuredPosts = data.posts.slice(0, 4);
                        }
                    }
                }
                
                const featuredContainer = document.getElementById('dynamic-featured-main');
                const ul = document.getElementById('dynamic-featured-list');
                
                if (featuredPosts.length > 0) {
                    const featured = featuredPosts[0];
                    if (featuredContainer && featured) {
                        let imageHtml = featured.imageUrl 
                            ? `<img src="${featured.imageUrl.match(/^(http|data:)/) ? featured.imageUrl : 'http://localhost:5100' + featured.imageUrl}" alt="${featured.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`
                            : `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="240" fill="#e8f0f8" /><text x="200" y="120" text-anchor="middle" fill="#6b7280">Ảnh minh họa</text></svg>`;
                            
                        featuredContainer.innerHTML = `
                            <div class="news-card featured">
                                <div class="news-card-image">${imageHtml}</div>
                                <div class="news-card-body">
                                    <span class="news-date">
                                        <span><i class="fa-regular fa-calendar"></i> ${featured.createdAt}</span>
                                        <span class="trending-badge"><i class="fa-solid fa-eye"></i> ${featured.views || 0} lượt xem</span>
                                    </span>
                                    <h3><a href="${featured.linkUrl || `../../user/tin-tuc/chi-tiet-tin-tuc.html?category=${featured.categoryId || 'chi-dao-dieu-hanh'}&id=${featured.id}`}">${featured.title}</a></h3>
                                </div>
                            </div>
                        `;
                    }
                    
                    if (ul && featuredPosts.length > 1) {
                        const displayList = featuredPosts.slice(1, 4);
                        let html = '';
                        displayList.forEach(item => {
                            html += `
                                <li>
                                    <a href="${item.linkUrl || `../../user/tin-tuc/chi-tiet-tin-tuc.html?category=${item.categoryId || 'chi-dao-dieu-hanh'}&id=${item.id}`}">
                                        <span class="news-list-date">${item.createdAt || ''} <span style="margin-left:8px; color: #64748b; font-size: 0.85em;"><i class="fa-solid fa-eye"></i> ${item.views || 0}</span></span>
                                        <span>${item.title || ''}</span>
                                    </a>
                                </li>
                            `;
                        });
                        ul.innerHTML = html;
                    }
                }
            } catch (e) {
                console.error("Lỗi lấy tin nổi bật:", e);
            }
        };

        const fetchAndRender = async (categoryId, listId, featuredId) => {
            const response = await fetch(`${API_BASE}/${categoryId}`);
            if (!response.ok) return;
            const data = await response.json();
            const ul = document.getElementById(listId);
            const featuredContainer = document.getElementById(featuredId);
            
            if (ul) ul.innerHTML = '';
            if (featuredContainer) featuredContainer.innerHTML = '';
            
            if (data && data.posts && data.posts.length > 0) {
                data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                const featured = data.posts[0];
                if (featuredContainer && featured) {
                    let imageHtml = featured.imageUrl 
                        ? `<img src="${featured.imageUrl.match(/^(http|data:)/) ? featured.imageUrl : 'http://localhost:5100' + featured.imageUrl}" alt="${featured.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`
                        : `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="240" fill="#e8f0f8" /><text x="200" y="120" text-anchor="middle" fill="#6b7280">Ảnh minh họa</text></svg>`;
                        
                    featuredContainer.innerHTML = `
                        <div class="news-card featured">
                            <div class="news-card-image">${imageHtml}</div>
                            <div class="news-card-body">
                                <span class="news-date">
                                    <span><i class="fa-regular fa-calendar"></i> ${featured.createdAt}</span>
                                    <span class="trending-badge"><i class="fa-solid fa-arrow-trend-up"></i> Mới nhất</span>
                                </span>
                                <h3><a href="${featured.linkUrl || `../../user/tin-tuc/chi-tiet-tin-tuc.html?category=${categoryId}&id=${featured.id}`}">${featured.title}</a></h3>
                            </div>
                        </div>
                    `;
                }
                
                if (ul) {
                    const displayList = data.posts.slice(1, 4);
                    let html = '';
                    displayList.forEach(item => {
                        html += `
                            <li>
                                <a href="${item.linkUrl || `../../user/tin-tuc/chi-tiet-tin-tuc.html?category=${item.categoryId || 'chi-dao-dieu-hanh'}&id=${item.id}`}">
                                    <span class="news-list-date">${item.createdAt || ''}</span>
                                    <span>${item.title || ''}</span>
                                </a>
                            </li>
                        `;
                    });
                    ul.innerHTML = html;
                }
            }
        };

        await Promise.all([
            renderFeaturedNews(),
            fetchAndRender('tuong-tac-cong-dan', 'dynamic-tuongtac-list', 'dynamic-tuongtac-featured'),
            fetchAndRender('cds-doi-moi-sang-tao', 'dynamic-cds-list', 'dynamic-cds-featured'),
            fetchAndRender('cap-nhat-bao-lu', 'dynamic-baolu-list', 'dynamic-baolu-featured')
        ]);

    } catch (e) {
        console.warn('Backend C# is not running. Using default static news.');
    }
}

// Khởi tạo khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    loadDynamicNews();
    loadHomePageGovData();
    setupSearchForm();
    loadAboutContent();
    loadSupportContent();
    loadHistoryContent();
    loadProductsContent();
    loadOrgChartContent();
    loadStructContent();
    loadCategoryNews();
});

async function loadHomePageGovData() {
    try {
        const response = await fetch(`${API_BASE}/trang-chu`);
        if (!response.ok) return;

        const homeData = await response.json();
        renderAnnouncements(homeData.announcements || []);
        renderDocumentArea(homeData.documentTypes || [], homeData.documents || []);
    } catch (e) {
        console.warn('Không tải được dữ liệu trang chủ từ backend.', e);
    }
}

function renderAnnouncements(announcements) {
    const list = document.querySelector('.announcement-list');
    if (!list || announcements.length === 0) return;

    list.innerHTML = announcements.map(item => {
        const url = item.url || '#';
        return `
            <li>
                <a href="${escapeAttribute(url)}" title="${escapeAttribute(item.title || '')}">
                    ${escapeHtml(item.title || '')}
                </a>
            </li>
        `;
    }).join('');
}

function renderDocumentArea(types, documents) {
    const tabs = document.querySelector('.document-tabs');
    const firstTable = document.getElementById('docTab0');
    if (!tabs || !firstTable || types.length === 0) return;

    tabs.innerHTML = types.map((type, index) => `
        <button class="doc-tab ${index === 0 ? 'active' : ''}" data-tab="${index}" data-type="${escapeAttribute(type.code || '')}">
            ${escapeHtml(type.name || '')}
        </button>
    `).join('');

    const oldTables = document.querySelectorAll('.documents-table');
    oldTables.forEach((table, index) => {
        if (index > 0) table.remove();
    });

    firstTable.id = 'docTab0';
    firstTable.classList.remove('hidden');
    renderDocumentTable(firstTable, documents.filter(doc => doc.typeCode === types[0].code));

    types.slice(1).forEach((type, index) => {
        const table = firstTable.cloneNode(false);
        table.id = `docTab${index + 1}`;
        table.classList.add('hidden');
        renderDocumentTable(table, documents.filter(doc => doc.typeCode === type.code));
        firstTable.parentElement.appendChild(table);
    });

    document.querySelectorAll('.doc-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.doc-tab').forEach(item => item.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.documents-table').forEach(table => table.classList.add('hidden'));
            const targetTable = document.getElementById(`docTab${tab.dataset.tab}`);
            if (targetTable) targetTable.classList.remove('hidden');
        });
    });
}

function renderDocumentTable(table, documents) {
    const rows = documents.length === 0
        ? '<div class="table-row"><div class="table-col-content"><p>Chưa có văn bản trong nhóm này.</p></div></div>'
        : documents.map(doc => `
            <div class="table-row">
                <div class="table-col-id">
                    <p class="doc-number">${escapeHtml(doc.documentNumber || '')}</p>
                    <p class="doc-date">${formatDateVi(doc.publishedAt)}</p>
                </div>
                <div class="table-col-content">
                    <p>${escapeHtml(doc.title || '')}</p>
                    <a href="${escapeAttribute(resolveBackendUrl(doc.fileUrl || '#'))}" class="download-link" target="_blank">
                        <i class="fa-solid fa-arrow-down"></i> Tải tài liệu
                    </a>
                </div>
            </div>
        `).join('');

    table.innerHTML = `
        <div class="table-header">
            <div class="table-col-id">SỐ KÝ HIỆU/NGÀY BAN HÀNH</div>
            <div class="table-col-content">NỘI DUNG TRÍCH YẾU</div>
        </div>
        ${rows}
    `;
}

function setupSearchForm() {
    const form = searchForm?.querySelector('form');
    const input = form?.querySelector('input');
    if (!form || !input) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const keyword = input.value.trim();
        if (!keyword) return;

        const panel = ensureSearchResultPanel();
        panel.innerHTML = '<div style="padding: 12px 14px; color: #64748b;">Đang tìm kiếm...</div>';

        try {
            const response = await fetch(`${API_BASE}/tim-kiem?q=${encodeURIComponent(keyword)}&take=8`);
            const payload = await response.json();
            const results = payload.results || [];

            panel.innerHTML = results.length === 0
                ? '<div style="padding: 12px 14px; color: #64748b;">Không tìm thấy kết quả phù hợp.</div>'
                : results.map(item => `
                    <a href="${escapeAttribute(resolveFrontendUrl(item.url || '#'))}" style="display: block; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; text-decoration: none;">
                        <strong style="display: block; font-size: 14px; margin-bottom: 4px;">${escapeHtml(item.title || '')}</strong>
                        <span style="display: block; font-size: 12px; color: #64748b;">${escapeHtml(item.type || '')}</span>
                    </a>
                `).join('');
        } catch (e) {
            panel.innerHTML = '<div style="padding: 12px 14px; color: #dc2626;">Không kết nối được backend tìm kiếm.</div>';
        }
    });
}

function ensureSearchResultPanel() {
    let panel = document.getElementById('searchResultPanel');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'searchResultPanel';
    panel.style.cssText = 'position:absolute;top:52px;right:0;width:min(420px,90vw);max-height:420px;overflow:auto;background:#fff;border:1px solid #dbe3ef;border-radius:8px;box-shadow:0 18px 45px rgba(15,23,42,.18);z-index:9999;';
    searchForm.appendChild(panel);
    return panel;
}

function resolveBackendUrl(url) {
    if (!url || url === '#') return '#';
    return url.match(/^(http|data:)/) ? url : `http://localhost:5100${url}`;
}

function resolveFrontendUrl(url) {
    if (!url || url === '#') return '#';
    if (url.match(/^(http|data:)/)) return url;
    return url.startsWith('/') ? `${window.location.origin}${url}` : url;
}

function formatDateVi(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('vi-VN');
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

async function loadSupportContent() {
    const titleEl = document.getElementById('dynamic-support-title');
    const contentEl = document.getElementById('dynamic-support-content');
    
    // Chỉ tải nếu đang ở trang Hỗ trợ
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/dau-moi-ho-tro`);
        if (!response.ok) return;
        const support = await response.json();
        
        if (titleEl && support.title) titleEl.innerText = support.title;
        if (contentEl && support.content) contentEl.innerHTML = support.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static support content.');
        if (titleEl) titleEl.innerText = "Đầu mối hỗ trợ trực tuyến qua điện thoại";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadHistoryContent() {
    const titleEl = document.getElementById('dynamic-history-title');
    const contentEl = document.getElementById('dynamic-history-content');
    
    // Chỉ tải nếu đang ở trang Lịch sử
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/lich-su-hinh-thanh`);
        if (!response.ok) return;
        const history = await response.json();
        
        if (titleEl && history.title) titleEl.innerText = history.title;
        if (contentEl && history.content) contentEl.innerHTML = history.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static history content.');
        if (titleEl) titleEl.innerText = "Lịch sử hình thành";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadAboutContent() {
    const titleEl = document.getElementById('dynamic-about-title');
    const contentEl = document.getElementById('dynamic-about-content');
    
    // Chỉ tải nếu đang ở trang Giới thiệu
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/chuc-nang-nhiem-vu`);
        if (!response.ok) return;
        const about = await response.json();
        
        if (titleEl && about.title) titleEl.innerText = about.title;
        if (contentEl && about.content) contentEl.innerHTML = about.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static about content.');
        if (titleEl) titleEl.innerText = "Chức năng, nhiệm vụ";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadProductsContent() {
    const titleEl = document.getElementById('dynamic-products-title');
    const contentEl = document.getElementById('dynamic-products-content');
    
    // Chỉ tải nếu đang ở trang Sản phẩm
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/san-pham-tieu-bieu`);
        if (!response.ok) return;
        const products = await response.json();
        
        if (titleEl && products.title) titleEl.innerText = products.title;
        if (contentEl && products.content) contentEl.innerHTML = products.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static products content.');
        if (titleEl) titleEl.innerText = "Sản phẩm tiêu biểu";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadOrgChartContent() {
    const titleEl = document.getElementById('dynamic-orgchart-title');
    const contentEl = document.getElementById('dynamic-orgchart-content');
    
    // Chỉ tải nếu đang ở trang Sơ đồ tổ chức
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/so-do-to-chuc`);
        if (!response.ok) return;
        const orgchart = await response.json();
        
        if (titleEl && orgchart.title) titleEl.innerText = orgchart.title;
        if (contentEl && orgchart.content) contentEl.innerHTML = orgchart.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static org chart content.');
        if (titleEl) titleEl.innerText = "Sơ đồ tổ chức";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadStructContent() {
    const titleEl = document.getElementById('dynamic-struct-title');
    const contentEl = document.getElementById('dynamic-struct-content');
    
    // Chỉ tải nếu đang ở trang Cơ cấu tổ chức
    if (!titleEl && !contentEl) return;

    try {
        const response = await fetch(`${API_BASE}/co-cau-to-chuc`);
        if (!response.ok) return;
        const structData = await response.json();
        
        if (titleEl && structData.title) titleEl.innerText = structData.title;
        if (contentEl && structData.content) contentEl.innerHTML = structData.content;
    } catch (e) {
        console.warn('Backend C# is not running. Using default static struct content.');
        if (titleEl) titleEl.innerText = "Cơ cấu tổ chức";
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

async function loadCategoryNews() {
    // Lấy ID danh mục từ thuộc tính data-page-id của thẻ body
    const categoryId = document.body.getAttribute('data-page-id');
    if (!categoryId) return; // Nếu không có thì không phải trang tin tức

    // Lấy phần tử hiển thị (hỗ trợ cả id chung và id cũ của bão lũ để tương thích ngược)
    const titleEl = document.getElementById('dynamic-news-title') || document.getElementById('dynamic-baolu-title');
    const contentEl = document.getElementById('dynamic-news-content') || document.getElementById('dynamic-baolu-content');
    
    if (!titleEl && !contentEl) return;

    try {
        let data = { title: '', posts: [] };
        
        if (categoryId === 'tat-ca-tin-tuc') {
            data.title = 'Tất cả tin tức';
            const categories = ['cap-nhat-bao-lu', 'cds-doi-moi-sang-tao', 'chi-dao-dieu-hanh', 'cong-tac-xay-dung-dang', 'giai-phap-an-toan-mang', 'giai-phap-an-toan-thong-tin', 'thong-bao', 'tieu-chuan-chat-luong', 'tin-hoat-dong', 'trao-doi-kinh-nghiem', 'tuong-tac-cong-dan'];
            let allPosts = [];
            for (const cat of categories) {
                try {
                    const res = await fetch(`${API_BASE}/${cat}`);
                    if (res.ok) {
                        const catData = await res.json();
                        if (catData && catData.posts) {
                            catData.posts.forEach(p => p.categoryId = cat);
                            allPosts = allPosts.concat(catData.posts);
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to fetch ${cat}:`, e);
                }
            }
            data.posts = allPosts;
        } else {
            const response = await fetch(`${API_BASE}/${categoryId}`);
            if (!response.ok) return;
            data = await response.json();
            if (data && data.posts) {
                data.posts.forEach(p => p.categoryId = categoryId);
            }
        }
        
        if (titleEl && data.title) titleEl.innerText = data.title;
        if (contentEl) {
            contentEl.innerHTML = '';
            if (!data.posts || data.posts.length === 0) {
                contentEl.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Chưa có bản tin nào.</p>';
                return;
            }
            
            data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            // Helper để lấy text tóm tắt từ HTML
            const getExcerpt = (html) => {
                const temp = document.createElement('div');
                temp.innerHTML = html || '';
                const text = temp.textContent || temp.innerText || '';
                return text.length > 150 ? text.substring(0, 150) + '...' : text;
            };

            const renderCard = (post) => {
                const card = document.createElement('a');
                card.className = 'baolu-card';
                card.style.textDecoration = 'none';
                card.style.color = 'inherit';
                
                let imageHtml = '';
                if (post.imageUrl && post.imageUrl.trim() !== '') {
                    const imgUrl = post.imageUrl.match(/^(http|data:)/) ? post.imageUrl : `http://localhost:5100${post.imageUrl}`;
                    imageHtml = `<div class="baolu-img"><img src="${imgUrl}" alt="${post.title}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'no-image-placeholder\\'>Không có hình ảnh</div>';"></div>`;
                } else {
                    imageHtml = `<div class="baolu-img"><div class="no-image-placeholder">Không có hình ảnh</div></div>`;
                }
                
                // Ưu tiên linkUrl nếu có, nếu không thì dùng trang chi tiết nội bộ
                const detailLink = post.linkUrl ? post.linkUrl : `../../user/tin-tuc/chi-tiet-tin-tuc.html?category=${post.categoryId || categoryId}&id=${post.id}`;
                card.href = detailLink;
                if (post.linkUrl) {
                    card.target = '_blank';
                }
                
                card.innerHTML = `
                    ${imageHtml}
                    <div class="baolu-info">
                        <h3 class="baolu-card-title">${post.title}</h3>
                        <div class="baolu-meta">
                            <span><i class="fa-solid fa-clock"></i> ${post.createdAt}</span>
                            ${post.author ? `<span><i class="fa-solid fa-user"></i> ${post.author}</span>` : ''}
                            ${post.source ? `<span><i class="fa-solid fa-newspaper"></i> ${post.source}</span>` : ''}
                        </div>
                        <div class="baolu-card-content">
                            ${getExcerpt(post.content)}
                        </div>
                    </div>
                `;
                return card;
            };

            const featuredPosts = data.posts.filter(p => p.isFeatured).slice(0, 2);
            const regularPosts = data.posts.filter(p => !featuredPosts.includes(p));

            if (featuredPosts.length > 0) {
                const featuredGrid = document.createElement('div');
                featuredGrid.className = 'news-featured-grid';
                featuredPosts.forEach(post => {
                    featuredGrid.appendChild(renderCard(post));
                });
                contentEl.appendChild(featuredGrid);
            }

            if (regularPosts.length > 0) {
                const itemsPerPage = 10;
                let currentPage = 1;
                const totalPages = Math.ceil(regularPosts.length / itemsPerPage);

                const listContainer = document.createElement('div');
                const regularGrid = document.createElement('div');
                regularGrid.className = 'baolu-grid'; 
                listContainer.appendChild(regularGrid);
                
                const paginationContainer = document.createElement('div');
                paginationContainer.className = 'pagination';
                listContainer.appendChild(paginationContainer);

                contentEl.appendChild(listContainer);

                const renderPage = (page) => {
                    regularGrid.innerHTML = '';
                    const start = (page - 1) * itemsPerPage;
                    const end = start + itemsPerPage;
                    const pageItems = regularPosts.slice(start, end);
                    
                    pageItems.forEach(post => {
                        regularGrid.appendChild(renderCard(post));
                    });
                };

                const renderPagination = (page) => {
                    if (totalPages <= 1) {
                        paginationContainer.innerHTML = '';
                        return;
                    }
                    
                    let html = '';
                    const maxButtons = 5;
                    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
                    let endPage = startPage + maxButtons - 1;

                    if (endPage > totalPages) {
                        endPage = totalPages;
                        startPage = Math.max(1, endPage - maxButtons + 1);
                    }

                    if (startPage > 1) {
                        html += `<button class="page-btn" data-page="1">1</button>`;
                        if (startPage > 2) html += `<span class="page-ellipsis">...</span>`;
                    }

                    for (let i = startPage; i <= endPage; i++) {
                        html += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
                    }

                    if (endPage < totalPages) {
                        if (endPage < totalPages - 1) html += `<span class="page-ellipsis">...</span>`;
                        html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
                    }

                    paginationContainer.innerHTML = html;
                    
                    paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const newPage = parseInt(btn.getAttribute('data-page'));
                            if (newPage !== currentPage) {
                                currentPage = newPage;
                                renderPage(currentPage);
                                renderPagination(currentPage);
                                const y = listContainer.getBoundingClientRect().top + window.scrollY - 100;
                                window.scrollTo({top: y, behavior: 'smooth'});
                            }
                        });
                    });
                };

                renderPage(currentPage);
                renderPagination(currentPage);
            }
        }
    } catch (e) {
        console.warn(`Backend C# is not running. Failed to load ${categoryId}.`, e);
        if (contentEl) contentEl.innerHTML = "<p>Lỗi kết nối tới Server. Vui lòng bật Backend.</p>";
    }
}

// ==========================================
// PARTNER LINKS DYNAMIC RENDERING
// ==========================================
async function loadDynamicPartnerLinks() {
    const container = document.getElementById('dynamic-partner-links');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/cau-hinh`);
        if (res.ok) {
            const config = await res.json();
            const links = config.partnerLinks || [
                { title: 'Chuyển đổi số', url: '#', color1: '#2e8b57', color2: '#3cb371', icon: 'fa-solid fa-rocket' },
                { title: 'Đổi mới sáng tạo', url: '#', color1: '#c0392b', color2: '#e74c3c', icon: 'fa-solid fa-lightbulb' },
                { title: 'Sự kiện', url: '#', color1: '#8e44ad', color2: '#9b59b6', icon: 'fa-solid fa-calendar-days' },
                { title: 'Khoa học Công nghệ', url: '#', color1: '#1a5276', color2: '#2980b9', icon: 'fa-solid fa-microchip' }
            ];

            container.innerHTML = '';
            links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.className = 'partner-card';
                a.style.background = `linear-gradient(135deg, ${link.color1}, ${link.color2})`;
                a.style.position = 'relative';
                a.style.overflow = 'hidden';
                
                // If it's a FontAwesome class, render i tag, else assume it might be SVG code
                let iconHtml = '';
                if (link.icon && link.icon.includes('<svg')) {
                    iconHtml = link.icon;
                } else {
                    iconHtml = `<i class="${link.icon || 'fa-solid fa-link'}" style="font-size: 32px; color: white;"></i>`;
                }

                let bgHtml = '';
                if (link.bgImage) {
                    bgHtml = `<div style="position: absolute; inset: 0; background-image: url(${link.bgImage}); background-size: cover; background-position: center; opacity: ${link.bgOpacity !== undefined ? link.bgOpacity : 0.2}; z-index: 1;"></div>`;
                }

                a.innerHTML = `
                    ${bgHtml}
                    <div class="partner-icon" style="position: relative; z-index: 2; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">
                        ${iconHtml}
                    </div>
                    <span style="position: relative; z-index: 2; text-shadow: 0 2px 4px rgba(0,0,0,0.6);">${link.title}</span>
                    <i class="fa-solid fa-arrow-right" style="position: relative; z-index: 2; text-shadow: 0 2px 4px rgba(0,0,0,0.6);"></i>
                `;
                container.appendChild(a);
            });
        }
    } catch (e) {
        console.error("Lỗi khi tải Liên kết đối tác:", e);
        // Fallback or leave empty
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadDynamicPartnerLinks();
});

function renderInfoUtility(config) {
    const iuWrapper = document.querySelector('.info-utility-wrapper');
    if (!iuWrapper) return;
    
    // Check if we have dynamic config
    if (config.infoUtilityConfig && config.infoUtilityConfig.length > 0) {
        iuWrapper.innerHTML = ''; // Clear static HTML
        
        config.infoUtilityConfig.forEach((group, index) => {
            // Default classes matching the static layout
            // index 0 -> iu-card-blue
            // index 1 -> iu-card-blue
            // index 2 -> iu-card-gradient
            const defaultClass = index === 2 ? 'iu-card-gradient' : 'iu-card-blue';
            const cardClass = 'iu-card ' + defaultClass;
            
            // Build inline styles for custom background
            let bgStyle = '';
            // Only apply custom color if it's explicitly chosen and not #ffffff (or if they want white, maybe let them, but white breaks white text)
            // Let's just apply it. In admin we will fix the default to #164e9a
            if (group.bgColor) {
                bgStyle += `background-color: ${group.bgColor}; `;
            }
            if (group.bgImage) {
                bgStyle += `background-image: url('${group.bgImage}'); background-size: cover; background-position: center;`;
            }

            let linksHtml = '';
            if (group.links && group.links.length > 0) {
                linksHtml = group.links.map(link => `
                    <a href="${link.url}" class="iu-grid-item">
                        <div class="iu-icon" style="color: ${link.iconColor || '#333'};"><i class="${link.icon || 'fa-solid fa-star'}"></i></div>
                        <span>${link.title}</span>
                    </a>
                `).join('');
            }

            const cardHtml = `
                <div class="${cardClass}" style="${bgStyle}">
                    <div class="iu-header">
                        <h2 class="iu-title">${group.title}</h2>
                    </div>
                    <div class="iu-inner-grid">
                        ${linksHtml}
                    </div>
                </div>
            `;
            iuWrapper.innerHTML += cardHtml;
        });
    }
}
