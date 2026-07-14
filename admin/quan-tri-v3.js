const API_BASE = 'http://localhost:5100/api';

function getAuthHeaders(extraHeaders = {}) {
    const token = localStorage.getItem('accessToken');
    const tokenType = localStorage.getItem('tokenType') || 'Bearer';
    return token
        ? { ...extraHeaders, Authorization: `${tokenType} ${token}` }
        : extraHeaders;
}

async function apiFetch(url, options = {}) {
    const headers = getAuthHeaders(options.headers || {});
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        showAlert('Phiên đăng nhập không có quyền quản trị hoặc đã hết hạn. Vui lòng đăng nhập lại bằng tài khoản admin.', false);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenType');
        setTimeout(() => {
            window.location.href = '../user/trang-chu/trang-chu.html';
        }, 1500);
        throw new Error('Unauthorized');
    }

    return response;
}

// Hiển thị thông báo
function showAlert(message, isSuccess = true) {
    const alertBox = document.getElementById('alert-box');
    alertBox.textContent = message;
    alertBox.className = `alert ${isSuccess ? 'success' : 'error'}`;
    setTimeout(() => {
        alertBox.className = 'alert';
    }, 3000);
}

// Custom confirm modal
function showConfirm(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    
    document.getElementById('confirmModalMessage').textContent = message;
    
    const btnCancel = document.getElementById('btnConfirmCancel');
    const btnOk = document.getElementById('btnConfirmOk');
    
    // Clean up previous event listeners
    const newBtnCancel = btnCancel.cloneNode(true);
    const newBtnOk = btnOk.cloneNode(true);
    btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
    btnOk.parentNode.replaceChild(newBtnOk, btnOk);
    
    newBtnCancel.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    newBtnOk.addEventListener('click', () => {
        modal.style.display = 'none';
        if (onConfirm) onConfirm();
    });
    
    modal.style.display = 'flex';
}

async function ensureAdminSession() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        showAlert('Vui lòng đăng nhập bằng tài khoản admin trước khi quản trị hệ thống.', false);
        setTimeout(() => {
            window.location.href = '../user/trang-chu/trang-chu.html';
        }, 1500);
        return false;
    }

    try {
        const response = await apiFetch(`${API_BASE}/auth/me`);
        if (!response.ok) return false;

        const profile = await response.json();
        if (profile.role !== 'Admin') {
            showAlert('Tài khoản hiện tại không có quyền quản trị.', false);
            setTimeout(() => {
                window.location.href = '../user/trang-chu/trang-chu.html';
            }, 1500);
            return false;
        }

        return true;
    } catch (err) {
        return false;
    }
}

// Xử lý đóng mở menu Giới thiệu
function toggleMenu(element) {
    const submenu = element.nextElementSibling;
    submenu.classList.toggle('open');
    const icon = element.querySelector('.drop-icon');
    icon.classList.toggle('rotate');
}

// Chuyển Tab
document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const targetId = e.currentTarget.dataset.target;
        document.getElementById(targetId).classList.add('active');
        if (targetId === 'accounts-tab') {
            loadUsers();
        } else if (e.currentTarget.classList.contains('news-category-link')) {
            const categoryId = e.currentTarget.dataset.category;
            const categoryName = e.currentTarget.textContent.trim();
            document.getElementById('newsTabTitle').textContent = `Quản lý ${categoryName}`;
            loadNews(categoryId);
        }
    });
});

// Load danh sách người dùng
let allUsers = [];

async function loadUsers() {
    try {
        const res = await apiFetch(`${API_BASE}/nguoi-dung`);
        allUsers = await res.json();
        renderUsers(allUsers);
    } catch (err) {
        console.error('Lỗi khi tải danh sách người dùng:', err);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; text-align: center; color: #888;">Chưa có người dùng nào.</td></tr>';
        return;
    }
    
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #f1f5f9';
        tr.style.transition = 'background 0.2s';
        tr.onmouseover = () => tr.style.background = '#f8fafc';
        tr.onmouseout = () => tr.style.background = 'transparent';
        
        let role = '<span style="background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Người dùng</span>';
        if (u.role === 'Admin') {
            role = '<span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Quản trị viên</span>';
        }
        
        let status = '';
        if (u.isActive || u.isActive === undefined) {
            status = '<span style="display: flex; align-items: center; gap: 5px; color: #10b981; font-weight: 500;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>Hoạt động</span>';
        } else {
            status = '<span style="display: flex; align-items: center; gap: 5px; color: #ef4444; font-weight: 500;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></span>Đã khóa</span>';
        }
        
        const displayName = u.fullName || u.username || 'Không xác định';
        
        tr.innerHTML = `
            <td style="padding: 15px 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${displayName.charAt(0).toUpperCase()}
                    </div>
                    <span style="font-weight: 600; color: #0f172a;">${displayName}</span>
                </div>
            </td>
            <td style="padding: 15px 12px; font-family: monospace; color: #64748b;">${u.username}</td>
            <td style="padding: 15px 12px;">${role}</td>
            <td style="padding: 15px 12px;">${status}</td>
            <td style="padding: 15px 12px; color: #64748b;">${u.registerDate || ''}</td>
            <td style="padding: 15px 12px; text-align: center;">
                <button title="Sửa" style="background: none; border: none; color: #3b82f6; cursor: pointer; margin-right: 8px; font-size: 15px;" onclick="editUser('${u.username}')"><i class="fa-solid fa-pen-to-square"></i></button>
                <button title="Khóa/Xóa" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 15px;" onclick="deleteUser('${u.username}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Tìm kiếm người dùng
document.getElementById('searchAccountInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allUsers.filter(u => 
        (u.username || '').toLowerCase().includes(term) || 
        (u.fullName || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term)
    );
    renderUsers(filtered);
});


// Load cấu hình hiện tại
async function loadConfig() {
    try {
        const response = await apiFetch(`${API_BASE}/cau-hinh`);
        const config = await response.json();
        if(config) {
            const fields = [
                'headerTextMain', 'headerTextSub', 'headerTextColor', 'headerFontMain', 'headerFontSub',
                'logoUrl', 'faviconUrl', 'bannerUrl', 'menuBarBgColor',
                'welcomeText', 'welcomeBgColor', 'welcomeTextColor',
                'tickerLabelText', 'tickerLabelColor',
                'heroImageUrl', 'heroTitle', 'heroTitleFont', 'heroTitleColor',
                'heroSubtitle', 'heroSubtitleFont', 'heroSubtitleColor', 'heroBgColor', 'heroButtonUrl',
                'heroButtonText', 'heroButtonFont', 'heroButtonBgColor',
                'primaryColor', 'primaryDarkColor', 'accentOrangeColor', 'accentRedColor',
                'bodyBgColor', 'newsSectionBgColor', 'infoUtilityBgColor', 'bgImageUrl', 'footerBgColor',
                'techSolutionsFont', 'techSolutionsColor'
            ];
            
            fields.forEach(field => {
                const el = document.getElementById(field);
                if(el && config[field] !== undefined) {
                    el.value = config[field];
                }
            });

            // Specific previews
            if(config.heroImageUrl) {
                const preview = document.getElementById('heroImagePreview');
                const placeholder = document.getElementById('heroImagePlaceholder');
                if(preview && placeholder) {
                    preview.src = config.heroImageUrl;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                }
            }

            if (typeof updateWelcomeBannerPreview === 'function') updateWelcomeBannerPreview();
            if (typeof updateHeaderPreview === 'function') updateHeaderPreview();
            if (typeof updateMenuBarPreview === 'function') updateMenuBarPreview();
            if (typeof updateHeroPreview === 'function') updateHeroPreview();

            if (config.tickerItems) {
                tickerItems = config.tickerItems;
                renderTickerItems();
            }

            if (config.techSolutionsItems) {
                techSolutionsItems = config.techSolutionsItems;
                renderTechSolutionsItems();
            }
            if (typeof renderTickerItems === 'function') renderTickerItems();
            if (typeof updateTickerPreview === 'function') updateTickerPreview();
        }
    } catch (e) {
        console.error("Lỗi lấy cấu hình:", e);
    }
}

// Lưu cấu hình
document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = {};
    const fields = [
        'headerTextMain', 'headerTextSub', 'headerTextColor', 'headerFontMain', 'headerFontSub',
        'logoUrl', 'faviconUrl', 'bannerUrl', 'menuBarBgColor',
        'welcomeText', 'welcomeBgColor', 'welcomeTextColor',
        'tickerLabelText', 'tickerLabelColor',
        'heroImageUrl', 'heroTitle', 'heroTitleFont', 'heroTitleColor',
        'heroSubtitle', 'heroSubtitleFont', 'heroSubtitleColor', 'heroBgColor', 'heroButtonUrl',
        'heroButtonText', 'heroButtonFont', 'heroButtonBgColor',
        'primaryColor', 'primaryDarkColor', 'accentOrangeColor', 'accentRedColor',
        'bodyBgColor', 'newsSectionBgColor', 'infoUtilityBgColor', 'bgImageUrl', 'footerBgColor',
        'techSolutionsFont', 'techSolutionsColor'
    ];
    
    fields.forEach(field => {
        const el = document.getElementById(field);
        if(el) {
            config[field] = el.value;
        }
    });
    
    config.tickerItems = tickerItems;
    config.techSolutionsItems = techSolutionsItems;

    try {
        const response = await apiFetch(`${API_BASE}/cau-hinh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu cấu hình', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    ensureAdminSession();
    window.editors = {};
    const quillOptions = {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ]
        }
    };
    ['about', 'support', 'history', 'products', 'orgchart', 'struct'].forEach(key => {
        const editor = new Quill('#' + key + 'Content', quillOptions);
        
        // Loại bỏ nền xám (background) và màu chữ khi paste từ web khác vào
        editor.clipboard.addMatcher(Node.ELEMENT_NODE, function(node, delta) {
            delta.ops.forEach(function(op) {
                if (op.attributes) {
                    delete op.attributes.background;
                    delete op.attributes.color;
                }
            });
            return delta;
        });
        
        window.editors[key] = editor;
    });

    loadConfig();
    loadAbout();
    loadSupport();
    loadHistory();
    loadProducts();
    loadOrgChart();
    loadStruct();
});

// Load dữ liệu trang giới thiệu
async function loadAbout() {
    try {
        const response = await apiFetch(`${API_BASE}/chuc-nang-nhiem-vu`);
        if(response.ok) {
            const about = await response.json();
            if(about) {
                if(about.title) document.getElementById('aboutTitle').value = about.title;
                if(about.content) window.editors['about'].clipboard.dangerouslyPasteHTML(about.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang giới thiệu:", e);
    }
}

// Lưu dữ liệu trang giới thiệu
document.getElementById('about-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const aboutData = {
        title: document.getElementById('aboutTitle').value,
        content: window.editors['about'].root.innerHTML
    };

    try {
        const response = await apiFetch(`${API_BASE}/chuc-nang-nhiem-vu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aboutData)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang giới thiệu', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Load dữ liệu trang hỗ trợ
async function loadSupport() {
    try {
        const response = await apiFetch(`${API_BASE}/dau-moi-ho-tro`);
        if(response.ok) {
            const support = await response.json();
            if(support) {
                if(support.title) document.getElementById('supportTitle').value = support.title;
                if(support.content) window.editors['support'].clipboard.dangerouslyPasteHTML(support.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang hỗ trợ:", e);
    }
}

// Lưu dữ liệu trang hỗ trợ
document.getElementById('support-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const supportData = {
        title: document.getElementById('supportTitle').value,
        content: window.editors['support'].root.innerHTML
    };

    try {
        const response = await apiFetch(`${API_BASE}/dau-moi-ho-tro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supportData)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang hỗ trợ', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Load dữ liệu trang lịch sử
async function loadHistory() {
    try {
        const response = await apiFetch(`${API_BASE}/lich-su-hinh-thanh`);
        if(response.ok) {
            const history = await response.json();
            if(history) {
                if(history.title) document.getElementById('historyTitle').value = history.title;
                if(history.content) window.editors['history'].clipboard.dangerouslyPasteHTML(history.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang lịch sử:", e);
    }
}

// Lưu dữ liệu trang lịch sử
document.getElementById('history-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const historyData = {
        title: document.getElementById('historyTitle').value,
        content: window.editors['history'].root.innerHTML
    };

    try {
        const response = await apiFetch(`${API_BASE}/lich-su-hinh-thanh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(historyData)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang lịch sử', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Load dữ liệu trang sản phẩm
async function loadProducts() {
    try {
        const response = await apiFetch(`${API_BASE}/san-pham-tieu-bieu`);
        if(response.ok) {
            const products = await response.json();
            if(products) {
                if(products.title) document.getElementById('productsTitle').value = products.title;
                if(products.content) window.editors['products'].clipboard.dangerouslyPasteHTML(products.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang sản phẩm:", e);
    }
}

// Lưu dữ liệu trang sản phẩm
document.getElementById('products-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const productsData = {
        title: document.getElementById('productsTitle').value,
        content: window.editors['products'].root.innerHTML
    };

    try {
        const response = await apiFetch(`${API_BASE}/san-pham-tieu-bieu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productsData)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang sản phẩm', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Load dữ liệu trang sơ đồ tổ chức
async function loadOrgChart() {
    try {
        const response = await apiFetch(`${API_BASE}/so-do-to-chuc`);
        if(response.ok) {
            const orgchart = await response.json();
            if(orgchart) {
                if(orgchart.title) document.getElementById('orgchartTitle').value = orgchart.title;
                if(orgchart.content) window.editors['orgchart'].clipboard.dangerouslyPasteHTML(orgchart.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang sơ đồ tổ chức:", e);
    }
}

// Lưu dữ liệu trang sơ đồ tổ chức
document.getElementById('orgchart-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const orgchartData = {
        title: document.getElementById('orgchartTitle').value,
        content: window.editors['orgchart'].root.innerHTML
    };

    try {
        const response = await apiFetch(`${API_BASE}/so-do-to-chuc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orgchartData)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang sơ đồ tổ chức', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});

// Load dữ liệu trang cơ cấu tổ chức
async function loadStruct() {
    try {
        const response = await apiFetch(`${API_BASE}/co-cau-to-chuc`);
        if(response.ok) {
            const structData = await response.json();
            if(structData) {
                if(structData.title) document.getElementById('structTitle').value = structData.title;
                if(structData.content) window.editors['struct'].clipboard.dangerouslyPasteHTML(structData.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang cơ cấu tổ chức:", e);
    }
}

// Lưu dữ liệu trang cơ cấu tổ chức
document.getElementById('struct-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const structDataPayload = {
        title: document.getElementById('structTitle').value,
        content: window.editors['struct'].root.innerHTML
    };

    try {
        const response = await apiFetch(`${API_BASE}/co-cau-to-chuc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(structDataPayload)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang cơ cấu tổ chức', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});


// --- Quản lý Danh mục Tin tức động ---
let newsDataGlobal = { title: "", posts: [] };
let newsEditor = null;
let isEditingNews = false;
let currentNewsCategory = '';

document.addEventListener('DOMContentLoaded', () => {
    newsEditor = new Quill('#newsFormContent', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
});

async function loadNews(categoryId) {
    currentNewsCategory = categoryId;
    try {
        const response = await apiFetch(`${API_BASE}/${categoryId}`);
        if(response.ok) {
            newsDataGlobal = await response.json();
            if (!newsDataGlobal.posts) newsDataGlobal.posts = [];
            renderNewsTable();
        }
    } catch (e) {
        console.error(`Lỗi lấy dữ liệu tin tức ${categoryId}:`, e);
    }
}

function renderNewsTable() {
    const tbody = document.getElementById('newsTableBody');
    tbody.innerHTML = '';
    
    newsDataGlobal.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    newsDataGlobal.posts.forEach(post => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #e2e8f0";
        tr.innerHTML = `
            <td style="padding: 12px;">
                ${post.imageUrl ? 
                    `<img src="${post.imageUrl}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.outerHTML='<div style=\\'width: 80px; height: 50px; background: #f1f5f9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; text-align: center; border: 1px dashed #cbd5e1;\\'>Không có<br>hình ảnh</div>'">` 
                    : 
                    `<div style="width: 80px; height: 50px; background: #f1f5f9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; text-align: center; border: 1px dashed #cbd5e1;">Không có<br>hình ảnh</div>`
                }
            </td>
            <td style="padding: 12px; font-weight: 500;">${post.title}</td>
            <td style="padding: 12px;">${post.source || '-'}</td>
            <td style="padding: 12px; color: #64748b;">${post.createdAt}</td>
            <td style="padding: 12px; text-align: center;">
                <button type="button" onclick="editNews('${post.id}')" style="background: none; border: none; color: #3b82f6; cursor: pointer; margin-right: 10px;" title="Sửa"><i class="fa-solid fa-pen"></i></button>
                <button type="button" onclick="deleteNews('${post.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer;" title="Xóa"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openNewsModal() {
    if (!currentNewsCategory) {
        showAlert('Vui lòng chọn một danh mục bên trái trước', false);
        return;
    }
    isEditingNews = false;
    document.getElementById('newsModalTitle').textContent = 'Đăng tin bài mới';
    document.getElementById('newsPostForm').reset();
    document.getElementById('newsFormId').value = '';
    newsEditor.root.innerHTML = '';
    
    updateFeaturedCountPreview();
    
    updateNewsImagePreview();
    document.getElementById('newsModal').style.display = 'flex';
}

function closeNewsModal() {
    document.getElementById('newsModal').style.display = 'none';
}

function editNews(id) {
    const post = newsDataGlobal.posts.find(p => p.id === id);
    if (!post) return;
    
    isEditingNews = true;
    document.getElementById('newsModalTitle').textContent = 'Sửa tin bài';
    document.getElementById('newsFormId').value = post.id;
    document.getElementById('newsFormTitle').value = post.title;
    document.getElementById('newsFormImageUrl').value = post.imageUrl || '';
    document.getElementById('newsFormSource').value = post.source || '';
    document.getElementById('newsFormAuthor').value = post.author || '';
    document.getElementById('newsFormLinkUrl').value = post.linkUrl || '';
    document.getElementById('newsFormLinkText').value = post.linkText || '';
    document.getElementById('newsFormIsFeatured').checked = post.isFeatured || false;
    newsEditor.root.innerHTML = post.content || '';
    
    updateFeaturedCountPreview();
    
    updateNewsImagePreview();
    document.getElementById('newsModal').style.display = 'flex';
}

async function deleteNews(id) {
    showConfirm('Bạn có chắc chắn muốn xóa tin này?', async () => {
        newsDataGlobal.posts = newsDataGlobal.posts.filter(p => p.id !== id);
        await saveNewsToServer('Đã xóa tin bài.');
    });
}

document.getElementById('newsPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let imageUrl = document.getElementById('newsFormImageUrl').value;
    const fileInput = document.getElementById('newsFormImageUpload');
    
    // Nếu có file upload, ưu tiên dùng file upload
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        try {
            const upRes = await apiFetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
            const upData = await upRes.json();
            if (upData.url) {
                imageUrl = upData.url;
            } else {
                showAlert('Lỗi tải ảnh lên', false);
                return;
            }
        } catch (err) {
            showAlert('Lỗi tải ảnh lên', false);
            return;
        }
    }
    
    const postData = {
        title: document.getElementById('newsFormTitle').value,
        imageUrl: imageUrl,
        source: document.getElementById('newsFormSource').value,
        author: document.getElementById('newsFormAuthor').value,
        content: newsEditor.root.innerHTML,
        linkUrl: document.getElementById('newsFormLinkUrl').value,
        linkText: document.getElementById('newsFormLinkText').value,
        isFeatured: document.getElementById('newsFormIsFeatured').checked
    };
    
    if (isEditingNews) {
        const id = document.getElementById('newsFormId').value;
        const index = newsDataGlobal.posts.findIndex(p => p.id === id);
        if (index > -1) {
            postData.id = id;
            postData.createdAt = newsDataGlobal.posts[index].createdAt;
            newsDataGlobal.posts[index] = postData;
        }
    } else {
        postData.id = Date.now().toString();
        const d = new Date();
        postData.createdAt = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') + ':' + String(d.getSeconds()).padStart(2,'0');
        newsDataGlobal.posts.push(postData);
    }
    
    await saveNewsToServer(isEditingNews ? 'Cập nhật thành công!' : 'Đã đăng tin mới!');
    closeNewsModal();
});

async function saveNewsToServer(successMessage) {
    if (!currentNewsCategory) return;
    try {
        const response = await apiFetch(`${API_BASE}/${currentNewsCategory}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newsDataGlobal)
        });
        const result = await response.json();
        if(result.success) {
            showAlert(successMessage);
            renderNewsTable();
        } else {
            showAlert('Lỗi lưu danh mục tin tức', false);
        }
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
}



// --- Xử lý Quản lý người dùng ---
let isEditingUser = false;
let editingUsername = '';

function openUserModal() {
    isEditingUser = false;
    document.getElementById('userModalTitle').textContent = 'Thêm Tài Khoản Mới';
    document.getElementById('userForm').reset();
    document.getElementById('userFormUsername').disabled = false;
    document.getElementById('pwdRequired').style.display = 'inline';
    document.getElementById('pwdHint').style.display = 'none';
    document.getElementById('userFormRole').value = 'User';
    document.getElementById('userFormActive').value = 'true';
    document.getElementById('userModal').style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function editUser(username) {
    const user = allUsers.find(u => u.username === username);
    if (!user) return;
    
    isEditingUser = true;
    editingUsername = username;
    
    document.getElementById('userModalTitle').textContent = 'Sửa Tài Khoản';
    document.getElementById('userFormUsername').value = user.username;
    document.getElementById('userFormUsername').disabled = true;
    
    document.getElementById('userFormFullName').value = user.fullName || '';
    document.getElementById('userFormEmail').value = user.email || '';
    document.getElementById('userFormPassword').value = '';
    
    document.getElementById('pwdRequired').style.display = 'none';
    document.getElementById('pwdHint').style.display = 'block';
    
    document.getElementById('userFormRole').value = user.role === 'Admin' ? 'Admin' : 'User';
    document.getElementById('userFormActive').value = user.isActive === false ? 'false' : 'true';
    
    document.getElementById('userModal').style.display = 'flex';
}

async function deleteUser(username) {
    if (username.toLowerCase() === 'admin') {
        showAlert('Không thể xóa tài khoản admin gốc', false);
        return;
    }
    
    showConfirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" không?`, async () => {
        try {
            const res = await apiFetch(`${API_BASE}/admin/nguoi-dung/${username}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showAlert('Đã xóa tài khoản');
                loadUsers();
            } else {
                showAlert(data.message || 'Lỗi khi xóa', false);
            }
        } catch (err) {
            console.error(err);
            showAlert('Lỗi kết nối máy chủ', false);
        }
    });
}

document.getElementById('userForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('userFormUsername').value;
    const fullName = document.getElementById('userFormFullName').value;
    const email = document.getElementById('userFormEmail').value;
    const password = document.getElementById('userFormPassword').value;
    const role = document.getElementById('userFormRole').value;
    const isActive = document.getElementById('userFormActive').value === 'true';
    
    if (!isEditingUser && !password) {
        alert('Vui lòng nhập mật khẩu cho tài khoản mới.');
        return;
    }
    
    const payload = {
        username,
        fullName: fullName || null,
        email: email || null,
        role,
        isActive
    };
    if (password) {
        payload.password = password;
    }
    
    try {
        const url = isEditingUser 
            ? `${API_BASE}/admin/nguoi-dung/${username}` 
            : `${API_BASE}/admin/nguoi-dung`;
            
        const res = await apiFetch(url, {
            method: isEditingUser ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (data.success) {
            showAlert(data.message);
            closeUserModal();
            loadUsers();
        } else {
            showAlert(data.message || 'Lỗi', false);
        }
    } catch (err) {
        console.error(err);
        showAlert('Lỗi kết nối máy chủ', false);
    }
});

// Update Header Preview
function updateHeaderPreview() {
    const mainText = document.getElementById('headerTextMainPreview');
    const subText = document.getElementById('headerTextSubPreview');
    const bgPreview = document.getElementById('headerBannerBgPreview');
    
    if (mainText) {
        mainText.textContent = document.getElementById('headerTextMain')?.value || '';
        mainText.style.fontFamily = document.getElementById('headerFontMain')?.value || "'Inter', sans-serif";
        mainText.style.color = document.getElementById('headerTextColor')?.value || '#ffffff';
    }
    if (subText) {
        subText.textContent = document.getElementById('headerTextSub')?.value || '';
        subText.style.fontFamily = document.getElementById('headerFontSub')?.value || "'Inter', sans-serif";
        subText.style.color = document.getElementById('headerTextColor')?.value || '#ffffff';
    }
}
document.getElementById('headerTextMain')?.addEventListener('input', updateHeaderPreview);
document.getElementById('headerTextSub')?.addEventListener('input', updateHeaderPreview);
document.getElementById('headerTextColor')?.addEventListener('input', updateHeaderPreview);
document.getElementById('headerFontMain')?.addEventListener('change', updateHeaderPreview);
document.getElementById('headerFontSub')?.addEventListener('change', updateHeaderPreview);
setTimeout(updateHeaderPreview, 1000);

// Menu Bar Preview Update
function updateMenuBarPreview() {
    const preview = document.getElementById('menuBarPreview');
    const bgColor = document.getElementById('menuBarBgColor')?.value;
    if (preview && bgColor) {
        preview.style.backgroundColor = bgColor;
    }
}
document.getElementById('menuBarBgColor')?.addEventListener('input', updateMenuBarPreview);
setTimeout(updateMenuBarPreview, 1000);

// Welcome Banner Preview Update
function updateWelcomeBannerPreview() {
    const preview = document.getElementById('welcomeBannerPreview');
    const track = document.getElementById('welcomeTrackPreview');
    
    const text = document.getElementById('welcomeText')?.value;
    const bgColor = document.getElementById('welcomeBgColor')?.value;
    const textColor = document.getElementById('welcomeTextColor')?.value;
    
    if(preview && bgColor) preview.style.backgroundColor = bgColor;
    if(track) {
        if (text !== undefined) track.innerHTML = text.replace(/★/g, '<i class="fa-solid fa-star" style="margin: 0 15px; font-size: 0.8em; color: #f1592b;"></i>');
        if (textColor) track.style.color = textColor;
    }
}
document.getElementById('welcomeText')?.addEventListener('input', updateWelcomeBannerPreview);
document.getElementById('welcomeBgColor')?.addEventListener('input', updateWelcomeBannerPreview);
document.getElementById('welcomeTextColor')?.addEventListener('input', updateWelcomeBannerPreview);
setTimeout(updateWelcomeBannerPreview, 1000);

// Hero Section Preview Update
function updateHeroPreview() {
    const container = document.getElementById('heroPreviewContainer');
    const titleEl = document.getElementById('heroTitlePreview');
    const subtitleEl = document.getElementById('heroSubtitlePreview');
    const imageEl = document.getElementById('heroImagePreview');
    const placeholderEl = document.getElementById('heroImagePlaceholder');

    const bgColor = document.getElementById('heroBgColor')?.value;
    const title = document.getElementById('heroTitle')?.value;
    const titleFont = document.getElementById('heroTitleFont')?.value;
    const titleColor = document.getElementById('heroTitleColor')?.value;
    const subtitle = document.getElementById('heroSubtitle')?.value;
    const subtitleFont = document.getElementById('heroSubtitleFont')?.value;
    const subtitleColor = document.getElementById('heroSubtitleColor')?.value;
    const buttonText = document.getElementById('heroButtonText')?.value;
    const buttonFont = document.getElementById('heroButtonFont')?.value;
    const buttonBgColor = document.getElementById('heroButtonBgColor')?.value;
    const imageUrl = document.getElementById('heroImageUrl')?.value;
    const buttonTextEl = document.getElementById('heroButtonTextPreview');

    if(container && bgColor) container.style.backgroundColor = bgColor;
    if(titleEl) {
        titleEl.textContent = title;
        if (titleFont) titleEl.style.fontFamily = titleFont;
        if (titleColor) titleEl.style.color = titleColor;
    }
    if(subtitleEl) {
        subtitleEl.textContent = subtitle;
        if (subtitleFont) subtitleEl.style.fontFamily = subtitleFont;
        if (subtitleColor) subtitleEl.style.color = subtitleColor;
    }
    if (buttonTextEl) {
        buttonTextEl.textContent = buttonText;
        const btn = buttonTextEl.parentElement;
        if (buttonFont) {
            btn.style.fontFamily = buttonFont;
        }
        if (buttonBgColor) {
            btn.style.backgroundColor = buttonBgColor;
        }
    }
    if (imageEl && placeholderEl) {
        if (imageUrl) {
            imageEl.src = imageUrl;
            imageEl.style.display = 'block';
            placeholderEl.style.display = 'none';
        } else {
            imageEl.style.display = 'none';
            placeholderEl.style.display = 'flex';
        }
    }
}
document.getElementById('heroBgColor')?.addEventListener('input', updateHeroPreview);
document.getElementById('heroTitle')?.addEventListener('input', updateHeroPreview);
document.getElementById('heroTitleFont')?.addEventListener('change', updateHeroPreview);
document.getElementById('heroTitleColor')?.addEventListener('input', updateHeroPreview);
document.getElementById('heroSubtitle')?.addEventListener('input', updateHeroPreview);
document.getElementById('heroSubtitleFont')?.addEventListener('change', updateHeroPreview);
document.getElementById('heroSubtitleColor')?.addEventListener('input', updateHeroPreview);
document.getElementById('heroButtonText')?.addEventListener('input', updateHeroPreview);
document.getElementById('heroButtonFont')?.addEventListener('change', updateHeroPreview);
document.getElementById('heroButtonBgColor')?.addEventListener('input', updateHeroPreview);
setTimeout(updateHeroPreview, 1000);

// Add missing applyCrop handling for hero
const originalApplyCrop = window.applyCrop;
window.applyCrop = function() {
    if(currentCropType === 'hero') {
        const canvas = cropper.getCroppedCanvas();
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        document.getElementById('heroImageUrl').value = base64;
        
        const preview = document.getElementById('heroImagePreview');
        const placeholder = document.getElementById('heroImagePlaceholder');
        if (preview && placeholder) {
            preview.src = base64;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        }
        
        closeCropper();
    } else if (originalApplyCrop) {
        originalApplyCrop();
    }
};

// ========================================
// TIN NỔI BẬT (FEATURED NEWS TICKER)
// ========================================
let tickerItems = [
    { title: "Đắk Lắk sẵn sàng cho Hội nghị Công bố Quy hoạch và Xúc tiến đầu tư năm 2026", link: "#" },
    { title: "Tập huấn Hướng dẫn sử dụng Phần mềm Phản ánh Hiện trường", link: "#" },
    { title: "Chuyển đổi số, Đổi mới sáng tạo, An toàn thông tin, Dữ liệu mở", link: "#" }
];

function renderTickerItems() {
    const container = document.getElementById('tickerItemsContainer');
    if(!container) return;
    
    container.innerHTML = '';
    tickerItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.style.display = 'grid';
        itemDiv.style.gridTemplateColumns = '2fr 1fr auto';
        itemDiv.style.gap = '10px';
        itemDiv.style.alignItems = 'end';
        itemDiv.innerHTML = `
            <div>
                <label style="font-size: 13px;">Tiêu đề tin</label>
                <input type="text" class="form-control" value="${item.title}" oninput="updateTickerItem(${index}, 'title', this.value)">
            </div>
            <div>
                <label style="font-size: 13px;">Link</label>
                <input type="text" class="form-control" value="${item.link}" oninput="updateTickerItem(${index}, 'link', this.value)">
            </div>
            <button type="button" class="btn btn-danger" onclick="removeTickerItem(${index})" style="padding: 6px 12px; margin-bottom: 2px;">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(itemDiv);
    });
    updateTickerPreview();
}

function updateTickerItem(index, key, value) {
    tickerItems[index][key] = value;
    updateTickerPreview();
}

function addTickerItem() {
    tickerItems.push({ title: "Tin tức mới", link: "#" });
    renderTickerItems();
}

function removeTickerItem(index) {
    tickerItems.splice(index, 1);
    renderTickerItems();
}

function updateTickerPreview() {
    const labelText = document.getElementById('tickerLabelText')?.value || 'TIN NỔI BẬT';
    const labelColor = document.getElementById('tickerLabelColor')?.value || '#1322BC';
    
    const labelEl = document.getElementById('tickerLabelPreview');
    const labelArrowEl = document.getElementById('tickerLabelArrowPreview');
    const labelTextEl = document.getElementById('tickerLabelTextPreview');
    if(labelEl) labelEl.style.backgroundColor = labelColor;
    if(labelArrowEl) labelArrowEl.style.borderLeftColor = labelColor;
    if(labelTextEl) labelTextEl.textContent = labelText;
    
    const trackEl = document.getElementById('tickerTrackPreview');
    if(trackEl) {
        trackEl.innerHTML = '';
        let html = '';
        tickerItems.forEach(item => {
            html += `<a href="${item.link}" style="color: #0f172a; text-decoration: none; padding: 0 15px;">${item.title}</a> <span style="color: #cbd5e1; margin: 0 5px;">|</span> `;
        });
        trackEl.innerHTML = html + html; // duplicate for seamless animation
    }
}

document.getElementById('tickerLabelText')?.addEventListener('input', updateTickerPreview);
document.getElementById('tickerLabelColor')?.addEventListener('input', updateTickerPreview);
setTimeout(renderTickerItems, 500);

// --- Tech Solutions Config ---
let techSolutionsItems = [
    {
        title: 'Bộ công an',
        desc: 'Trang thông tin điện tử công an tỉnh Đăk Lăk',
        link: '#',
        image: ''
    },
    {
        title: 'Bình dân học vụ số',
        desc: 'Nền tảng phổ cập kiến thức chuyển đổi số cơ bản cho người dân',
        link: '#',
        image: ''
    },
    {
        title: 'Thông tin đấu thầu',
        desc: 'Hệ thống mạng đấu thầu quốc gia, thông tin đấu giá minh bạch',
        link: '#',
        image: ''
    },
    {
        title: 'Công báo điện tử',
        desc: 'Hệ thống công báo điện tử, tra cứu các văn bản quy phạm pháp luật',
        link: '#',
        image: ''
    }
];

function renderTechSolutionsItems() {
    const container = document.getElementById('techSolutionsItemsContainer');
    if(!container) return;
    
    container.innerHTML = '';
    techSolutionsItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.style.background = 'white';
        itemDiv.style.padding = '15px';
        itemDiv.style.borderRadius = '6px';
        itemDiv.style.border = '1px solid #e2e8f0';
        
        itemDiv.innerHTML = `
            <h6 style="margin-top: 0; margin-bottom: 15px; color: #475569; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;"><i class="fa-solid fa-cube"></i> Box ${index + 1}</h6>
            <div class="form-group">
                <label>Tiêu đề</label>
                <input type="text" value="${item.title}" oninput="updateTechSolutionItem(${index}, 'title', this.value)">
            </div>
            <div class="form-group">
                <label>Mô tả</label>
                <textarea rows="2" oninput="updateTechSolutionItem(${index}, 'desc', this.value)">${item.desc}</textarea>
            </div>
            <div class="form-group">
                <label>Link nút "Xem thêm"</label>
                <input type="text" value="${item.link}" oninput="updateTechSolutionItem(${index}, 'link', this.value)">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Upload Hình Ảnh Banner (Thay thế hình SVG mặc định)</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="file" accept="image/*" style="flex: 1;" onchange="uploadTechSolutionImage(${index}, this)">
                    ${item.image ? `<button type="button" onclick="removeTechSolutionImage(${index})" style="background: #ef4444; padding: 6px 15px; font-size: 13px; border-radius: 4px; border: none; color: white; cursor: pointer;"><i class="fa-solid fa-trash"></i> Xóa ảnh</button>` : ''}
                </div>
            </div>
        `;
        container.appendChild(itemDiv);
    });
    updateTechSolutionsPreview();
}

function updateTechSolutionItem(index, key, value) {
    techSolutionsItems[index][key] = value;
    updateTechSolutionsPreview();
}

function uploadTechSolutionImage(index, input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            techSolutionsItems[index].image = e.target.result;
            renderTechSolutionsItems();
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removeTechSolutionImage(index) {
    techSolutionsItems[index].image = '';
    renderTechSolutionsItems();
}

function updateTechSolutionsPreview() {
    const container = document.getElementById('techSolutionsPreviewContainer');
    if(!container) return;
    
    const font = document.getElementById('techSolutionsFont')?.value || "'Inter', sans-serif";
    const color = document.getElementById('techSolutionsColor')?.value || "#0a59ab";
    
    container.style.fontFamily = font;
    
    container.innerHTML = '';
    techSolutionsItems.forEach((item, index) => {
        let imageHtml = '';
        if (item.image) {
            imageHtml = `<img src="${item.image}" style="width: 100%; height: auto; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/180x120?text=Error'">`;
        } else {
            // Default SVGs
            const svgs = [
                `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;"><rect x="60" y="20" width="80" height="100" rx="8" fill="#d4e5f7" /><rect x="70" y="30" width="60" height="40" rx="4" fill="#a8c4db" /><circle cx="100" cy="100" r="8" fill="#8fb3ce" /><rect x="20" y="60" width="30" height="40" rx="4" fill="#e8f0f8" transform="rotate(-10 20 60)" /><rect x="150" y="50" width="30" height="45" rx="4" fill="#e8f0f8" transform="rotate(10 150 50)" /></svg>`,
                `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;"><rect x="40" y="60" width="120" height="80" rx="6" fill="#d4e5f7" /><rect x="55" y="20" width="30" height="50" rx="4" fill="#e8f0f8" /><rect x="95" y="10" width="50" height="60" rx="4" fill="#a8c4db" /><line x1="105" y1="35" x2="135" y2="35" stroke="#8fb3ce" stroke-width="2" /><line x1="105" y1="45" x2="125" y2="45" stroke="#8fb3ce" stroke-width="2" /><circle cx="70" cy="110" r="8" fill="#8fb3ce" /><circle cx="130" cy="100" r="6" fill="#a8c4db" /></svg>`,
                `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;"><rect x="50" y="30" width="100" height="70" rx="6" fill="#d4e5f7" /><rect x="65" y="100" width="70" height="8" rx="3" fill="#a8c4db" /><circle cx="100" cy="65" r="20" fill="none" stroke="#8fb3ce" stroke-width="3" /><path d="M92 65 L98 71 L110 59" stroke="#0a59ab" stroke-width="3" fill="none" stroke-linecap="round" /></svg>`,
                `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;"><rect x="30" y="30" width="140" height="100" rx="6" fill="#d4e5f7" /><path d="M50 100 L80 70 L110 90 L140 50" stroke="#0a59ab" stroke-width="2" fill="none" /><circle cx="80" cy="70" r="4" fill="#f1592b" /><circle cx="110" cy="90" r="4" fill="#f1592b" /></svg>`
            ];
            imageHtml = svgs[index];
        }

        const fontH3 = font === "'Inter', sans-serif" ? "'Playfair Display', serif" : font; // Apply user font or fallback to Playfair

        container.innerHTML += `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; align-items: center; position: relative; padding: 32px; gap: 20px; transition: all 0.3s ease;">
                <div style="position: absolute; top: 10px; left: 10px; background: rgba(10, 89, 171, 0.8); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; z-index: 10; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${index + 1}</div>
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 12px 0; color: ${color}; font-family: ${fontH3}; font-size: 1.4rem; font-weight: 700;">${item.title}</h3>
                    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 0.9rem; line-height: 1.6;">${item.desc}</p>
                    <a href="${item.link}" style="color: ${color}; text-decoration: none; font-size: 0.9rem; font-weight: 500; display: inline-flex; align-items: center; gap: 8px;"><span>Xem thêm</span> <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M11.3333 5.33325L14 7.99992M14 7.99992L11.3333 10.6666M14 7.99992H2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg></a>
                </div>
                <div style="width: 180px; flex-shrink: 0;">
                    ${imageHtml}
                </div>
            </div>
        `;
    });
}

document.getElementById('techSolutionsFont')?.addEventListener('change', updateTechSolutionsPreview);
document.getElementById('techSolutionsColor')?.addEventListener('input', updateTechSolutionsPreview);
setTimeout(renderTechSolutionsItems, 500);

function toggleConfigSection(headerEl) {
    const contentEl = headerEl.nextElementSibling;
    const iconEl = headerEl.querySelector('.fa-chevron-up');
    const textEl = headerEl.querySelector('.toggle-text');
    
    if (contentEl.style.display === 'none') {
        contentEl.style.display = 'block';
        iconEl.style.transform = 'rotate(0deg)';
        if (textEl) textEl.textContent = 'Thu nhỏ';
    } else {
        contentEl.style.display = 'none';
        iconEl.style.transform = 'rotate(180deg)';
        if (textEl) textEl.textContent = 'Mở rộng';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    sidebar.classList.toggle('collapsed');
}

// Thêm sự kiện cập nhật preview ảnh tin tức
document.getElementById('newsFormImageUrl')?.addEventListener('input', updateNewsImagePreview);
document.getElementById('newsFormIsFeatured')?.addEventListener('change', updateFeaturedCountPreview);

function updateFeaturedCountPreview() {
    let featuredCount = newsDataGlobal.posts.filter(p => p.isFeatured).length;
    
    const formId = document.getElementById('newsFormId').value;
    const isCurrentlyFeatured = document.getElementById('newsFormIsFeatured').checked;
    
    if (formId) {
        const post = newsDataGlobal.posts.find(p => p.id === formId);
        if (post && post.isFeatured) {
            featuredCount--; 
        }
    }
    
    if (isCurrentlyFeatured && featuredCount >= 2) {
        document.getElementById('newsFormIsFeatured').checked = false;
        const errorSpan = document.getElementById('newsFormFeaturedError');
        if (errorSpan) {
            errorSpan.style.opacity = '1';
            setTimeout(() => {
                errorSpan.style.opacity = '0';
            }, 4000);
        }
    } else if (isCurrentlyFeatured) {
        featuredCount++;
    }
    
    const label = document.getElementById('newsFormIsFeaturedLabel');
    if (label) {
        label.textContent = `Tin tức nổi bật (tính năng đã chọn ${featuredCount}/2 tin)`;
    }
}

function updateNewsImagePreview() {
    const url = document.getElementById('newsFormImageUrl').value;
    const previewContainer = document.getElementById('newsFormImagePreviewContainer');
    const previewImg = document.getElementById('newsFormImagePreview');
    const emptyText = document.getElementById('newsFormImageEmpty');
    const deleteBtn = document.getElementById('newsFormDeleteImageBtn');
    
    if (!previewContainer) return;
    
    if (url) {
        previewImg.src = (url.startsWith('http') || url.startsWith('data:')) ? url : `http://localhost:5100${url}`;
        previewContainer.style.display = 'block';
        if (emptyText) emptyText.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'flex';
    } else {
        previewContainer.style.display = 'none';
        if (emptyText) emptyText.style.display = 'block';
        if (deleteBtn) deleteBtn.style.display = 'none';
    }
}

function clearNewsImage() {
    document.getElementById('newsFormImageUrl').value = '';
    document.getElementById('newsFormImageUpload').value = '';
    updateNewsImagePreview();
}

// === CROPPER LOGIC ===
let cropper = null;
let currentCropTarget = null;
let currentCropInput = null;

function openCropper(input, target) {
    if (input.files && input.files[0]) {
        currentCropTarget = target;
        currentCropInput = input;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('cropperImage').src = e.target.result;
            document.getElementById('cropperModal').style.display = 'flex';
            
            if (cropper) {
                cropper.destroy();
            }
            
            const image = document.getElementById('cropperImage');
            
            let aspectRatio = NaN;
            const shapeSelector = document.getElementById('cropShapeSelector');
            if (shapeSelector) shapeSelector.style.display = 'none';
            
            if (target === 'news') {
                aspectRatio = 16 / 9;
            } else if (target === 'logo' || target === 'favicon') {
                aspectRatio = 1;
                if (shapeSelector) shapeSelector.style.display = 'block';
            } else if (target === 'banner') {
                aspectRatio = 21 / 9;
            } else if (target === 'hero') {
                aspectRatio = 16 / 9;
            }
            
            cropper = new Cropper(image, {
                aspectRatio: aspectRatio,
                viewMode: 1,
                autoCropArea: 1,
            });
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function closeCropperModal() {
    document.getElementById('cropperModal').style.display = 'none';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    if (currentCropInput) {
        currentCropInput.value = '';
    }
}

function updateCropShape() {
    const shapeInput = document.querySelector('input[name="cropShape"]:checked');
    if (!shapeInput) return;
    
    if (shapeInput.value === 'circle') {
        document.querySelector('.cropper-view-box').style.borderRadius = '50%';
        document.querySelector('.cropper-face').style.borderRadius = '50%';
    } else {
        document.querySelector('.cropper-view-box').style.borderRadius = '0';
        document.querySelector('.cropper-face').style.borderRadius = '0';
    }
}

function saveCrop() {
    if (!cropper) return;
    
    let canvasWidth = 800;
    
    // Thu nhỏ mini hình ảnh để tối ưu dung lượng
    if (currentCropTarget === 'news') {
        canvasWidth = 800;
    } else if (currentCropTarget === 'logo' || currentCropTarget === 'favicon') {
        canvasWidth = 200;
    } else if (currentCropTarget === 'banner') {
        canvasWidth = 1200;
    } else if (currentCropTarget === 'hero') {
        canvasWidth = 1200;
    }

    const canvas = cropper.getCroppedCanvas({
        width: canvasWidth,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    
    if (currentCropTarget === 'news') {
        document.getElementById('newsFormImageUrl').value = base64Image;
        updateNewsImagePreview();
    }
    
    closeCropperModal();
}

// ================= VĂN BẢN (DOCUMENTS) LOGIC =================
let allDocuments = [];

async function loadDocuments() {
    try {
        const response = await apiFetch(API_BASE + '/van-ban');
        if (response.ok) {
            allDocuments = await response.json();
            renderDocumentTable();
        } else {
            showAlert('Lỗi khi tải danh sách văn bản', 'error');
        }
    } catch (e) {
        console.error(e);
        showAlert('Không thể kết nối đến máy chủ', 'error');
    }
}

function renderDocumentTable(docsToRender = allDocuments) {
    const tbody = document.getElementById('document-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (docsToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Chưa có văn bản nào</td></tr>';
        return;
    }
    
    docsToRender.forEach((doc, idx) => {
        let serverFile = doc.fileUrl ? doc.fileUrl.split('/').pop() : '';
        let displayName = doc.originalFileName || serverFile;
        const fileLink = doc.fileUrl 
            ? `<a href="http://localhost:5100/api/download?file=${encodeURIComponent(serverFile)}&name=${encodeURIComponent(displayName)}" target="_blank" style="color: #0a59ab;"><i class="fa-solid fa-download"></i> Tải về</a>` 
            : `<span style="color: #999;">Không có</span>`;
            
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${idx + 1}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${doc.documentNumber || ''}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${doc.publishedAt || ''}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${doc.title || ''}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${fileLink}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                <button type="button" onclick="openDocumentModal(${doc.id})" style="background: none; border: none; color: #0a59ab; cursor: pointer; margin-right: 10px;" title="Sửa"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" onclick="deleteDocument(${doc.id})" style="background: none; border: none; color: #dc2626; cursor: pointer;" title="Xóa"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openDocumentModal(id = null) {
    document.getElementById('documentModal').style.display = 'flex';
    document.getElementById('documentForm').reset();
    document.getElementById('currentDocFile').innerText = '';
    document.getElementById('documentId').value = '';
    
    if (id) {
        document.getElementById('documentModalTitle').innerText = 'Sửa văn bản';
        const doc = allDocuments.find(d => d.id === id);
        if (doc) {
            document.getElementById('documentId').value = doc.id;
            document.getElementById('docNumber').value = doc.documentNumber || '';
            document.getElementById('docPublishedAt').value = doc.publishedAt ? doc.publishedAt.split('T')[0] : '';
            document.getElementById('docTitle').value = doc.title || '';
            document.getElementById('docIssuingAuthority').value = doc.issuingAuthority || '';
            if (doc.fileUrl) {
                let serverFile = doc.fileUrl.split('/').pop();
                let displayName = doc.originalFileName || serverFile;
                document.getElementById('currentDocFile').innerHTML = `File hiện tại: <a href="http://localhost:5100/api/download?file=${encodeURIComponent(serverFile)}&name=${encodeURIComponent(displayName)}" target="_blank">${displayName}</a>`;
            }
        }
    } else {
        document.getElementById('documentModalTitle').innerText = 'Thêm văn bản mới';
    }
}

function closeDocumentModal() {
    document.getElementById('documentModal').style.display = 'none';
}

async function saveDocument(e) {
    e.preventDefault();
    const id = document.getElementById('documentId').value;
    const docData = {
        documentNumber: document.getElementById('docNumber').value,
        publishedAt: document.getElementById('docPublishedAt').value,
        title: document.getElementById('docTitle').value,
        issuingAuthority: document.getElementById('docIssuingAuthority').value,
    };
    
    const fileInput = document.getElementById('docFile');
    const file = fileInput.files[0];
    
    try {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await apiFetch(API_BASE + '/upload', {
                method: 'POST',
                body: formData
            });
            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                docData.fileUrl = uploadData.url;
                docData.originalFileName = uploadData.originalFileName;
            } else {
                throw new Error('Upload file thất bại');
            }
        } else if (id) {
            const existingDoc = allDocuments.find(d => d.id == id);
            if (existingDoc && existingDoc.fileUrl) {
                docData.fileUrl = existingDoc.fileUrl;
                docData.originalFileName = existingDoc.originalFileName;
            }
        }
        
        const method = id ? 'PUT' : 'POST';
        const url = id ? API_BASE + '/van-ban/' + id : API_BASE + '/van-ban';
        
        const res = await apiFetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(docData)
        });
        
        if (res.ok) {
            showAlert('Lưu văn bản thành công', 'success');
            closeDocumentModal();
            loadDocuments();
        } else {
            throw new Error('Lỗi khi lưu văn bản');
        }
    } catch (error) {
        console.error(error);
        showAlert(error.message || 'Lỗi khi lưu văn bản', 'error');
    }
}

async function deleteDocument(id) {
    showConfirm('Bạn có chắc chắn muốn xóa văn bản này?', async () => {
        try {
            const res = await apiFetch(API_BASE + '/van-ban/' + id, { method: 'DELETE' });
            if (res.ok) {
                showAlert('Xóa văn bản thành công', 'success');
                loadDocuments();
            } else {
                showAlert('Lỗi khi xóa văn bản', 'error');
            }
        } catch (e) {
            console.error(e);
            showAlert('Không thể kết nối đến máy chủ', 'error');
        }
    });
}

// Search documents
const docSearchInput = document.getElementById('document-search-input');
if (docSearchInput) {
    docSearchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const filtered = allDocuments.filter(d => 
            (d.documentNumber && d.documentNumber.toLowerCase().includes(query)) ||
            (d.title && d.title.toLowerCase().includes(query))
        );
        renderDocumentTable(filtered);
    });
}

// Call loadDocuments if on the document tab (or add to init functions)
document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('data-target') === 'documents-tab') {
            loadDocuments();
        }
    });
});


