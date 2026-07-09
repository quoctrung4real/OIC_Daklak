const API_BASE = 'http://localhost:5000/api';

// Hiển thị thông báo
function showAlert(message, isSuccess = true) {
    const alertBox = document.getElementById('alert-box');
    alertBox.textContent = message;
    alertBox.className = `alert ${isSuccess ? 'success' : 'error'}`;
    setTimeout(() => {
        alertBox.className = 'alert';
    }, 3000);
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
        }
    });
});

// Load cấu hình hiện tại
async function loadConfig() {
    try {
        const response = await fetch(`${API_BASE}/config`);
        const config = await response.json();
        if(config) {
            if(config.bannerUrl) document.getElementById('bannerUrl').value = config.bannerUrl;
            if(config.bodyBgColor) document.getElementById('bodyBgColor').value = config.bodyBgColor;
            if(config.newsSectionBgColor) document.getElementById('newsSectionBgColor').value = config.newsSectionBgColor;
            if(config.infoUtilityBgColor) document.getElementById('infoUtilityBgColor').value = config.infoUtilityBgColor;
        }
    } catch (e) {
        console.error("Lỗi lấy cấu hình:", e);
    }
}

// Lưu cấu hình
document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = {
        bannerUrl: document.getElementById('bannerUrl').value,
        bodyBgColor: document.getElementById('bodyBgColor').value,
        newsSectionBgColor: document.getElementById('newsSectionBgColor').value,
        infoUtilityBgColor: document.getElementById('infoUtilityBgColor').value
    };

    try {
        const response = await fetch(`${API_BASE}/config`, {
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

// Init
document.addEventListener('DOMContentLoaded', () => {
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
    async function loadUsers() {
        try {
            const res = await fetch('http://localhost:5000/api/nguoi-dung');
            const users = await res.json();
            const tbody = document.getElementById('usersTableBody');
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
                
                // Demo logic for Roles and Status based on username
                let role = '<span style="background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Người dùng</span>';
                if (u.Username.toLowerCase().includes('admin')) {
                    role = '<span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Quản trị viên</span>';
                }
                
                let status = '<span style="display: flex; align-items: center; gap: 5px; color: #10b981; font-weight: 500;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>Hoạt động</span>';
                
                tr.innerHTML = `
                    <td style="padding: 15px 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                                ${u.Username.charAt(0).toUpperCase()}
                            </div>
                            <span style="font-weight: 600; color: #0f172a;">${u.Username}</span>
                        </div>
                    </td>
                    <td style="padding: 15px 12px; font-family: monospace; color: #64748b;">${u.Password.replace(/./g, '*')}</td>
                    <td style="padding: 15px 12px;">${role}</td>
                    <td style="padding: 15px 12px;">${status}</td>
                    <td style="padding: 15px 12px; color: #64748b;">${u.RegisterDate}</td>
                    <td style="padding: 15px 12px; text-align: center;">
                        <button title="Sửa" style="background: none; border: none; color: #3b82f6; cursor: pointer; margin-right: 8px; font-size: 15px;" onclick="alert('Chức năng sửa thông tin chưa khả dụng')"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button title="Khóa/Xóa" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 15px;" onclick="alert('Chức năng khóa tài khoản chưa khả dụng')"><i class="fa-solid fa-ban"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('Lỗi khi tải danh sách người dùng:', err);
        }
    };
    ['about', 'support', 'history', 'products', 'orgchart', 'struct', 'baolu'].forEach(key => {
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
    loadBaoLu();
});

// Load dữ liệu trang giới thiệu
async function loadAbout() {
    try {
        const response = await fetch(`${API_BASE}/chuc-nang-nhiem-vu`);
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
        const response = await fetch(`${API_BASE}/chuc-nang-nhiem-vu`, {
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
        const response = await fetch(`${API_BASE}/dau-moi-ho-tro`);
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
        const response = await fetch(`${API_BASE}/dau-moi-ho-tro`, {
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
        const response = await fetch(`${API_BASE}/lich-su-hinh-thanh`);
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
        const response = await fetch(`${API_BASE}/lich-su-hinh-thanh`, {
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
        const response = await fetch(`${API_BASE}/san-pham-tieu-bieu`);
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
        const response = await fetch(`${API_BASE}/san-pham-tieu-bieu`, {
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
        const response = await fetch(`${API_BASE}/so-do-to-chuc`);
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
        const response = await fetch(`${API_BASE}/so-do-to-chuc`, {
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
        const response = await fetch(`${API_BASE}/co-cau-to-chuc`);
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
        const response = await fetch(`${API_BASE}/co-cau-to-chuc`, {
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

// Load dữ liệu trang cập nhật bão lũ
async function loadBaoLu() {
    try {
        const response = await fetch(`${API_BASE}/cap-nhat-bao-lu`);
        if(response.ok) {
            const baoluData = await response.json();
            if(baoluData) {
                if(baoluData.title) document.getElementById('baoluTitle').value = baoluData.title;
                if(baoluData.content) window.editors['baolu'].clipboard.dangerouslyPasteHTML(baoluData.content);
            }
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu trang cập nhật bão lũ:", e);
    }
}

// Lưu dữ liệu trang cập nhật bão lũ
document.getElementById('baolu-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const baoluDataPayload = {
        title: document.getElementById('baoluTitle').value,
        content: window.editors['baolu'].root.innerHTML
    };

    try {
        const response = await fetch(`${API_BASE}/cap-nhat-bao-lu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(baoluDataPayload)
        });
        const result = await response.json();
        if(result.success) showAlert(result.message);
        else showAlert('Lỗi lưu trang cập nhật bão lũ', false);
    } catch (error) {
        showAlert('Lỗi kết nối tới Server', false);
    }
});
