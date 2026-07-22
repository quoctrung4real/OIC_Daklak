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
        const response = await fetch(`${API_BASE}/cau-hinh?t=${new Date().getTime()}`);
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
        
        
        // Render External Links
        if (config.externalLinks && Array.isArray(config.externalLinks)) {
            renderExternalLinks(config.externalLinks);
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
        renderInfoUtility(config);
        renderMultimedia(config);
    } catch (e) {
        console.warn('Backend C# is not running. Using default local styles.');
    }
}

async function loadDynamicNews() {
    try {
        const renderFeaturedNews = async () => {
            try {
                const configRes = await fetch(`${API_BASE}/cau-hinh?t=${new Date().getTime()}`);
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
        const response = await fetch(`${API_BASE}/trang-chu?t=${new Date().getTime()}`);
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
                    const res = await fetch(`${API_BASE}/${cat}?t=${new Date().getTime()}`);
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
            const response = await fetch(`${API_BASE}/${categoryId}?t=${new Date().getTime()}`);
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
                
                let attachmentHtml = '';
                if (post.attachmentUrl) {
                    const attName = post.attachmentName || 'Tài liệu đính kèm';
                    let attUrl = post.attachmentUrl;
                    if (!post.attachmentUrl.match(/^(http|data:)/)) {
                        attUrl = `${API_BASE}/download?file=${encodeURIComponent(post.attachmentUrl)}&name=${encodeURIComponent(attName)}`;
                    }
                    attachmentHtml = `
                        <div style="margin-top: 10px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
                                <i class="fa-solid fa-file-lines" style="color: #0284c7; font-size: 18px;"></i>
                                <span style="font-size: 14px; font-weight: 500; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${attName}</span>
                            </div>
                            <a href="${attUrl}" download target="_blank" onclick="event.stopPropagation();" style="padding: 5px 10px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 600; white-space: nowrap;">
                                <i class="fa-solid fa-download"></i> Tải về
                            </a>
                        </div>
                    `;
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
                        ${attachmentHtml}
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
        const res = await fetch(`${API_BASE}/cau-hinh?t=${new Date().getTime()}`);
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
async function loadHomeAnnouncements() {
    const listEl = document.getElementById('home-thong-bao-list');
    if (!listEl) return;
    
    try {
        const res = await fetch(`${API_BASE}/thong-bao?t=${new Date().getTime()}`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        
        listEl.innerHTML = '';
        if (!data.posts || data.posts.length === 0) {
            listEl.innerHTML = '<li style="text-align: center; color: #666; font-style: italic; border: none;">Chưa có thông báo nào.</li>';
            return;
        }
        
        // Sắp xếp giảm dần theo thời gian, lấy tối đa 5 bài
        data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const topPosts = data.posts.slice(0, 5);
        
        topPosts.forEach(post => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = post.linkUrl ? post.linkUrl : `../tin-tuc/chi-tiet-tin-tuc.html?category=thong-bao&id=${post.id}`;
            if (post.linkUrl) a.target = '_blank';
            
            // Cắt tiêu đề nếu quá dài
            let titleText = post.title;
            if (titleText.length > 80) titleText = titleText.substring(0, 80) + '...';
            
            // Nếu có đính kèm, thêm icon ghim
            if (post.attachmentUrl) {
                a.innerHTML = `<i class="fa-solid fa-paperclip" style="color: #0a59ab; margin-right: 5px;"></i>${titleText}`;
            } else {
                a.innerText = titleText;
            }
            
            li.appendChild(a);
            listEl.appendChild(li);
        });
        
    } catch (e) {
        console.error("Lỗi tải thông báo:", e);
        listEl.innerHTML = '<li style="text-align: center; color: red; font-style: italic; border: none;">Lỗi tải dữ liệu.</li>';
    }
}

let homeDocumentTypes = [];

async function loadHomeDocuments() {
    const tabsContainer = document.getElementById('home-document-tabs');
    const contentContainer = document.getElementById('home-documents-content');
    if (!tabsContainer || !contentContainer) return;

    try {
        const res = await fetch(`${API_BASE}/loai-van-ban?t=${new Date().getTime()}`);
        if (!res.ok) throw new Error("Failed to fetch document types");
        const types = await res.json();
        
        homeDocumentTypes = await Promise.all(types.map(async (type) => {
            try {
                const docRes = await fetch(`${API_BASE}/van-ban?type=${type.code}&take=5&t=${new Date().getTime()}`);
                type.documents = docRes.ok ? await docRes.json() : [];
            } catch (e) {
                type.documents = [];
            }
            return type;
        }));
        
        if (!homeDocumentTypes || homeDocumentTypes.length === 0) {
            tabsContainer.innerHTML = '<div style="color: #666; font-style: italic; padding: 10px;">Chưa có dữ liệu văn bản.</div>';
            contentContainer.innerHTML = '';
            return;
        }

        // Render Tabs
        tabsContainer.innerHTML = homeDocumentTypes.map((type, index) => `
            <button class="doc-tab ${index === 0 ? 'active' : ''}" data-tab="${index}" onclick="switchHomeDocTab(${index})">${type.name}</button>
        `).join('');

        // Render Content
        contentContainer.innerHTML = homeDocumentTypes.map((type, index) => `
            <div class="documents-table ${index === 0 ? '' : 'hidden'}" id="homeDocTab${index}">
                <div class="table-header">
                    <div class="table-col-id">SỐ KÝ HIỆU/NGÀY BAN HÀNH</div>
                    <div class="table-col-content">NỘI DUNG TRÍCH YẾU</div>
                </div>
                ${(type.documents || []).length > 0 ? (type.documents || []).slice(0, 5).map(doc => `
                    <div class="table-row">
                        <div class="table-col-id">
                            <p class="doc-number">${doc.documentNumber || ''}</p>
                            <p class="doc-date">${doc.publishedAt ? new Date(doc.publishedAt).toLocaleDateString('vi-VN') : ''}</p>
                        </div>
                        <div class="table-col-content">
                            <p>${doc.title}</p>
                            ${doc.fileUrl ? `<a href="${API_BASE}/download?file=${encodeURIComponent(doc.fileUrl)}&name=${encodeURIComponent(doc.originalFileName || 'tai-lieu')}" class="download-link"><i class="fa-solid fa-arrow-down"></i> Tải tài liệu</a>` : ''}
                        </div>
                    </div>
                `).join('') : '<div class="table-row"><div class="table-col-content"><p style="color: #666; font-style: italic;">Chưa có văn bản nào trong mục này.</p></div></div>'}
            </div>
        `).join('');

    } catch (e) {
        console.error("Lỗi tải văn bản:", e);
        tabsContainer.innerHTML = '<div style="color: red; font-style: italic; padding: 10px;">Lỗi tải dữ liệu.</div>';
    }
}

window.switchHomeDocTab = function(index) {
    const tabs = document.querySelectorAll('#home-document-tabs .doc-tab');
    const contents = document.querySelectorAll('#home-documents-content .documents-table');
    
    tabs.forEach((tab, i) => {
        if (i === index) tab.classList.add('active');
        else tab.classList.remove('active');
    });
    
    contents.forEach((content, i) => {
        if (i === index) content.classList.remove('hidden');
        else content.classList.add('hidden');
    });
};

document.addEventListener('DOMContentLoaded', () => {
    loadDynamicPartnerLinks();
    loadHomeAnnouncements();
    loadHomeDocuments();
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
            let defaultClass = index === 2 ? 'iu-card-gradient' : 'iu-card-blue';
            let bgStyle = '';
            
            if (group.bgColor || group.bgImage) {
                // If custom background is set, don't use default class to avoid gradient overrides
                defaultClass = '';
                if (group.bgColor) {
                    bgStyle += `background-color: ${group.bgColor}; `;
                }
                if (group.bgImage) {
                    bgStyle += `background-image: url('${group.bgImage}'); background-size: cover; background-position: center; `;
                }
            }
            
            const cardClass = ('iu-card ' + defaultClass).trim();

            let linksHtml = '';
            if (group.links && group.links.length > 0) {
                linksHtml = group.links.map(link => `
                    <a href="${link.url}" target="_blank" class="iu-grid-item">
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


let currentMultimediaTab = 'video';
let multimediaData = {
    videos: [],
    images: [],
    infographics: []
};

async function renderMultimedia(config) {
    const section = document.querySelector('.multimedia-section');
    if (section && config.multimediaBgColor) {
        section.style.background = config.multimediaBgColor;
    }

    try {
        const res = await fetch(`${API_BASE}/tin-tuc-da-phuong-tien?t=${new Date().getTime()}`);
        const data = await res.json();
        const posts = data.posts || [];
        
        const videoPosts = posts.filter(n => !n.multimediaType || n.multimediaType === 'video');
        const imagePosts = posts.filter(n => n.multimediaType === 'image');
        const infoPosts = posts.filter(n => n.multimediaType === 'infographic');

        function getItemsForTab(postsArray, priorityId, secondaryIds = [], tabName = 'video') {
            let priorityItem = null;
            let secondaryItems = [];
            let remainingItems = [];

            postsArray.forEach(p => {
                if (p.id == priorityId) {
                    priorityItem = p;
                } else if (secondaryIds.includes(p.id) || secondaryIds.includes(p.id.toString())) {
                    secondaryItems.push(p);
                } else {
                    remainingItems.push(p);
                }
            });
            
            secondaryItems.sort((a, b) => {
                const indexA = secondaryIds.findIndex(id => id == a.id);
                const indexB = secondaryIds.findIndex(id => id == b.id);
                return indexA - indexB;
            });

            let finalPosts = [];
            if (priorityItem) finalPosts.push(priorityItem);
            finalPosts = finalPosts.concat(secondaryItems, remainingItems);
            
            return finalPosts.slice(0, 6).map(post => {
                let itemUrl = (window.BASE_URL || '../../') + `user/tin-tuc/chi-tiet-video.html?id=${post.id}`;
                if (tabName !== 'video') {
                    itemUrl = (window.BASE_URL || '../../') + `user/tin-tuc/chi-tiet-tin-tuc.html?category=tin-tuc-da-phuong-tien&id=${post.id}`;
                }
                
                return {
                    title: post.title,
                    url: itemUrl,
                    thumbnail: post.imageUrl || '',
                    videoUrl: post.videoUrl || post.linkUrl || '',
                    createdAt: post.createdAt || ''
                };
            });
        }

        multimediaData.videos = getItemsForTab(videoPosts, config.multimediaPriorityVideoId, config.multimediaSecondaryVideoIds, 'video');
        multimediaData.images = getItemsForTab(imagePosts, config.multimediaPriorityImageId, config.multimediaSecondaryImageIds, 'image');
        multimediaData.infographics = getItemsForTab(infoPosts, config.multimediaPriorityInfographicId, config.multimediaSecondaryInfographicIds, 'infographic');

    } catch (e) {
        console.error('Error fetching multimedia news:', e);
        multimediaData.videos = [];
        multimediaData.images = [];
        multimediaData.infographics = [];
    }

    renderMultimediaTabs();
    renderMultimediaContent();
}

function renderMultimediaTabs() {
    const container = document.getElementById('multimedia-tabs-container');
    if (!container) return;

    const tabsHtml = `
        <a href="#" class="media-type ${currentMultimediaTab === 'video' ? 'active' : ''}" onclick="switchMultimediaTab(event, 'video')">
            <span class="media-icon video-icon">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="4" fill="#DA251D" />
                    <path d="M21 15.88V16.12L13.23 21C12.78 21.27 12.55 21.27 12.35 21.15L12.14 21.03C12.05 20.98 11.97 20.9 11.92 20.81C11.87 20.72 11.84 20.61 11.83 20.51V11.49C11.83 11.38 11.86 11.28 11.92 11.18C11.97 11.09 12.05 11.01 12.14 10.95L12.35 10.83C12.55 10.72 12.78 10.72 13.37 11.06L20.69 15.34C20.79 15.4 20.86 15.48 20.92 15.57C20.97 15.67 21 15.77 21 15.88Z" fill="white" />
                </svg>
            </span>
            <span>Video</span>
        </a>
        <a href="#" class="media-type ${currentMultimediaTab === 'image' ? 'active' : ''}" onclick="switchMultimediaTab(event, 'image')">
            <span class="media-icon photo-icon">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="4" fill="#0FA246" />
                    <rect x="9" y="10" width="14" height="12" rx="2" stroke="white" stroke-width="1.5" />
                    <circle cx="13" cy="14" r="1.5" fill="white" />
                    <path d="M9 19 L14 15 L17 18 L20 16 L23 19" stroke="white" stroke-width="1.5" fill="none" />
                </svg>
            </span>
            <span>Hình ảnh</span>
        </a>
        <a href="#" class="media-type ${currentMultimediaTab === 'infographic' ? 'active' : ''}" onclick="switchMultimediaTab(event, 'infographic')">
            <span class="media-icon info-icon">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="4" fill="#EAAA08" />
                    <rect x="10" y="8" width="5" height="16" rx="2" fill="white" opacity="0.8" />
                    <rect x="17" y="12" width="5" height="12" rx="2" fill="white" opacity="0.6" />
                    <rect x="24" y="16" width="5" height="8" rx="2" fill="white" opacity="0.4" />
                </svg>
            </span>
            <span>Infographic</span>
        </a>
    `;
    container.innerHTML = tabsHtml;
}

function switchMultimediaTab(event, tabId) {
    if (event) {
        event.preventDefault();
    }
    currentMultimediaTab = tabId;
    renderMultimediaTabs();
    renderMultimediaContent();
}

function renderMultimediaContent() {
    const container = document.getElementById('multimedia-content-container');
    if (!container) return;

    // Update 'Xem thêm' button link
    const showMoreBtn = document.getElementById('multimedia-show-more-btn');
    if (showMoreBtn) {
        showMoreBtn.href = `../tin-tuc/danh-sach-da-phuong-tien.html?type=${currentMultimediaTab}`;
    }

    let items = [];
    if (currentMultimediaTab === 'video') items = multimediaData.videos;
    if (currentMultimediaTab === 'image') items = multimediaData.images;
    if (currentMultimediaTab === 'infographic') items = multimediaData.infographics;

    if (items.length === 0) {
        container.innerHTML = '<p style="color: white; padding: 20px;">Đang cập nhật nội dung...</p>';
        return;
    }

    const mainItem = items[0];
    const subItems = items.slice(1);

    function getYoutubeThumbnailUrl(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
        }
        return null;
    }

    let html = `
        <div style="display: flex; gap: 24px; width: 100%;">
            <a href="${mainItem.url}" target="_blank" style="text-decoration: none; display: block; flex: 1; position: relative; border-radius: 8px; overflow: hidden; background: #000; aspect-ratio: 16/9;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                    ${(mainItem.thumbnail || getYoutubeThumbnailUrl(mainItem.videoUrl || mainItem.url)) ? 
                        `<img src="${mainItem.thumbnail || getYoutubeThumbnailUrl(mainItem.videoUrl || mainItem.url)}" alt="${mainItem.title}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1a5276, #2980b9); display: flex; align-items: center; justify-content: center; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; text-transform: uppercase;">${currentMultimediaTab}</div>`
                    }
                </div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 40px 20px 20px 20px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); display: flex; flex-direction: column; justify-content: flex-end; z-index: 10;">
                    <p style="color: white; font-size: 20px; font-weight: bold; margin: 0 0 8px 0; line-height: 1.4;">${mainItem.title}</p>
                    ${mainItem.createdAt ? `<p style="color: #cbd5e1; font-size: 14px; margin: 0;">${mainItem.createdAt}</p>` : ''}
                </div>
                ${currentMultimediaTab === 'video' ? `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 15;">
                    <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 64px !important; height: 64px !important; pointer-events: auto; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                        <rect width="32" height="32" rx="4" fill="#DA251D" />
                        <path d="M21 15.88V16.12L13.23 21C12.78 21.27 12.55 21.27 12.35 21.15L12.14 21.03C12.05 20.98 11.97 20.9 11.92 20.81C11.87 20.72 11.84 20.61 11.83 20.51V11.49C11.83 11.38 11.86 11.28 11.92 11.18C11.97 11.09 12.05 11.01 12.14 10.95L12.35 10.83C12.55 10.72 12.78 10.72 13.37 11.06L20.69 15.34C20.79 15.4 20.86 15.48 20.92 15.57C20.97 15.67 21 15.77 21 15.88Z" fill="white" />
                    </svg>
                </div>` : ''}
            </a>
            
            <div class="multimedia-sub-list" style="width: 420px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px;">
                ${subItems.slice(0, 5).map(item => `
                    <a href="${item.url}" target="_blank" class="multimedia-sub-item" style="text-decoration: none; display: flex; gap: 15px; align-items: stretch; background: rgba(0,0,0,0.1); border-radius: 8px; padding: 10px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.1)'">
                        <div style="width: 140px; height: 85px; flex-shrink: 0; border-radius: 6px; overflow: hidden; position: relative; background: #000;">
                            ${(item.thumbnail || getYoutubeThumbnailUrl(item.videoUrl || item.url)) ? 
                                `<img src="${item.thumbnail || getYoutubeThumbnailUrl(item.videoUrl || item.url)}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
                                `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1a5276, #2980b9); display: flex; align-items: center; justify-content: center; color: white; padding: 10px; text-align: center; font-size: 10px; font-weight: bold; text-transform: uppercase;">${currentMultimediaTab}</div>`
                            }
                            ${currentMultimediaTab === 'video' ? `
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                                <div style="background: rgba(0,0,0,0.5); border-radius: 50%; padding: 4px; display: flex; align-items: center; justify-content: center;">
                                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 24px !important; height: 24px !important;">
                                        <path d="M21 15.88V16.12L13.23 21C12.78 21.27 12.55 21.27 12.35 21.15L12.14 21.03C12.05 20.98 11.97 20.9 11.92 20.81C11.87 20.72 11.84 20.61 11.83 20.51V11.49C11.83 11.38 11.86 11.28 11.92 11.18C11.97 11.09 12.05 11.01 12.14 10.95L12.35 10.83C12.55 10.72 12.78 10.72 13.37 11.06L20.69 15.34C20.79 15.4 20.86 15.48 20.92 15.57C20.97 15.67 21 15.77 21 15.88Z" fill="white" />
                                    </svg>
                                </div>
                            </div>` : ''}
                        </div>
                        <div style="display: flex; flex-direction: column; justify-content: center; flex: 1; padding: 2px 0;">
                            <p style="color: white; font-size: 15px; font-weight: 500; margin: 0 0 8px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; transition: color 0.2s;" onmouseover="this.style.color='#facc15'" onmouseout="this.style.color='white'">${item.title}</p>
                            ${item.createdAt ? `<p style="margin: 0; font-size: 13px; color: #cbd5e1;">${item.createdAt}</p>` : ''}
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function renderExternalLinks(links) {
    const grid = document.getElementById('external-links-grid');
    if (!grid) return;
    
    if (!links || links.length === 0) {
        grid.innerHTML = '';
        return;
    }

    grid.innerHTML = links.map(item => `
        <a href="${item.url || '#'}" target="_blank" class="external-link-card" style="text-decoration: none; ${item.bgUrl ? `background-image: url('${item.bgUrl}'); background-size: cover; background-position: center; position: relative; z-index: 1; overflow: hidden;` : ''}">
            ${item.bgUrl ? `<div style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(255,255,255,0.85); z-index: -1;"></div>` : ''}
            <div class="ext-icon" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: ${(item.color || '#0a59ab')}15; border-radius: 50%;">
                ${item.logoUrl 
                    ? `<img src="${item.logoUrl}" style="max-width: 32px; max-height: 32px; object-fit: contain;">` 
                    : `<svg viewBox="0 0 48 48" width="48" height="48" fill="none">
                        <circle cx="24" cy="24" r="18" fill="${item.color || '#0a59ab'}" opacity="0.15" />
                        <text x="24" y="28" text-anchor="middle" fill="${item.color || '#0a59ab'}" font-size="${item.logoText && item.logoText.length > 3 ? '8' : '10'}" font-weight="700" font-family="Inter">${item.logoText ? item.logoText : (item.name ? item.name.substring(0,3).toUpperCase() : 'LNK')}</text>
                       </svg>`
                }
            </div>
            <span style="display: block; margin-top: 10px; font-weight: 500; color: #1e293b; text-align: center;">${item.name || ''}</span>
        </a>
    `).join('');
}
