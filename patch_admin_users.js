const fs = require('fs');
const file = 'quan-tri.js';
let code = fs.readFileSync(file, 'utf8');

// 1. Replace loadUsers function
const oldLoadUsers = `async function loadUsers() {
    try {
        const res = await fetch(\`\${API_BASE}/nguoi-dung\`);
        const users = await res.json();
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
            if ((u.username || '').toLowerCase().includes('admin')) {
                role = '<span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Quản trị viên</span>';
            }
            
            let status = '<span style="display: flex; align-items: center; gap: 5px; color: #10b981; font-weight: 500;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>Hoạt động</span>';
            
            tr.innerHTML = \`
                <td style="padding: 15px 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                            \${(u.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <span style="font-weight: 600; color: #0f172a;">\${u.username || 'Không xác định'}</span>
                    </div>
                </td>
                <td style="padding: 15px 12px; font-family: monospace; color: #64748b;">****</td>
                <td style="padding: 15px 12px;">\${role}</td>
                <td style="padding: 15px 12px;">\${status}</td>
                <td style="padding: 15px 12px; color: #64748b;">\${u.registerDate || ''}</td>
                <td style="padding: 15px 12px; text-align: center;">
                    <button title="Sửa" style="background: none; border: none; color: #3b82f6; cursor: pointer; margin-right: 8px; font-size: 15px;" onclick="alert('Chức năng sửa thông tin chưa khả dụng')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button title="Khóa/Xóa" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 15px;" onclick="alert('Chức năng khóa tài khoản chưa khả dụng')"><i class="fa-solid fa-ban"></i></button>
                </td>
            \`;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Lỗi khi tải danh sách người dùng:', err);
    }
}`;

const newLoadUsers = `let allUsers = [];

async function loadUsers() {
    try {
        const res = await fetch(\`\${API_BASE}/nguoi-dung\`);
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
        if ((u.username || '').toLowerCase() === 'admin') {
            role = '<span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Quản trị viên</span>';
        }
        
        let status = '';
        if (u.isActive || u.isActive === undefined) {
            status = '<span style="display: flex; align-items: center; gap: 5px; color: #10b981; font-weight: 500;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>Hoạt động</span>';
        } else {
            status = '<span style="display: flex; align-items: center; gap: 5px; color: #ef4444; font-weight: 500;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></span>Đã khóa</span>';
        }
        
        const displayName = u.fullName || u.username || 'Không xác định';
        
        tr.innerHTML = \`
            <td style="padding: 15px 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        \${displayName.charAt(0).toUpperCase()}
                    </div>
                    <span style="font-weight: 600; color: #0f172a;">\${displayName}</span>
                </div>
            </td>
            <td style="padding: 15px 12px; font-family: monospace; color: #64748b;">\${u.username}</td>
            <td style="padding: 15px 12px;">\${role}</td>
            <td style="padding: 15px 12px;">\${status}</td>
            <td style="padding: 15px 12px; color: #64748b;">\${u.registerDate || ''}</td>
            <td style="padding: 15px 12px; text-align: center;">
                <button title="Sửa" style="background: none; border: none; color: #3b82f6; cursor: pointer; margin-right: 8px; font-size: 15px;" onclick="editUser('\${u.username}')"><i class="fa-solid fa-pen-to-square"></i></button>
                <button title="Khóa/Xóa" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 15px;" onclick="deleteUser('\${u.username}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        \`;
        tbody.appendChild(tr);
    });
}

// Search users
document.getElementById('searchAccountInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allUsers.filter(u => 
        (u.username || '').toLowerCase().includes(term) || 
        (u.fullName || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term)
    );
    renderUsers(filtered);
});
`;

code = code.replace(oldLoadUsers, newLoadUsers);


// 2. Add Modal and API functions
const modalLogic = `
// --- User Management Logic ---
let isEditingUser = false;
let editingUsername = '';

function openUserModal() {
    isEditingUser = false;
    document.getElementById('userModalTitle').textContent = 'Thêm Tài Khoản Mới';
    document.getElementById('userForm').reset();
    document.getElementById('userFormUsername').disabled = false;
    document.getElementById('pwdRequired').style.display = 'inline';
    document.getElementById('pwdHint').style.display = 'none';
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
    
    document.getElementById('userFormActive').value = user.isActive === false ? 'false' : 'true';
    
    document.getElementById('userModal').style.display = 'flex';
}

async function deleteUser(username) {
    if (username.toLowerCase() === 'admin') {
        showAlert('Không thể xóa tài khoản admin gốc', false);
        return;
    }
    
    if (confirm(\`Bạn có chắc chắn muốn xóa tài khoản "\${username}" không?\`)) {
        try {
            const res = await fetch(\`\${API_BASE}/admin/nguoi-dung/\${username}\`, {
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
    }
}

document.getElementById('userForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('userFormUsername').value;
    const fullName = document.getElementById('userFormFullName').value;
    const email = document.getElementById('userFormEmail').value;
    const password = document.getElementById('userFormPassword').value;
    const isActive = document.getElementById('userFormActive').value === 'true';
    
    if (!isEditingUser && !password) {
        alert('Vui lòng nhập mật khẩu cho tài khoản mới.');
        return;
    }
    
    const payload = {
        username,
        fullName: fullName || null,
        email: email || null,
        isActive
    };
    if (password) {
        payload.password = password;
    }
    
    try {
        const url = isEditingUser 
            ? \`\${API_BASE}/admin/nguoi-dung/\${username}\` 
            : \`\${API_BASE}/admin/nguoi-dung\`;
            
        const res = await fetch(url, {
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
`;

code += "\n" + modalLogic;

fs.writeFileSync(file, code, 'utf8');
console.log('quan-tri.js patched successfully');
