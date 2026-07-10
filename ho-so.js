const API_BASE = 'http://localhost:5000/api';
let isAvatarChanged = false;
let currentAvatarUrl = null;

document.addEventListener('DOMContentLoaded', () => {
    const profileContent = document.getElementById('profileContent');
    const loginPrompt = document.getElementById('loginPrompt');
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        // User not logged in
        profileContent.style.display = 'none';
        loginPrompt.style.display = 'block';
    } else {
        // User logged in
        profileContent.style.display = 'flex';
        loginPrompt.style.display = 'none';
        loadUserProfile(currentUser);
    }

    // Avatar upload preview
    document.getElementById('avatarUpload').addEventListener('change', handleAvatarSelection);
    
    // Remove avatar
    document.getElementById('removeAvatarBtn').addEventListener('click', handleAvatarRemoval);
    
    // Form submission
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
});

async function loadUserProfile(username) {
    try {
        const res = await fetch(`${API_BASE}/nguoi-dung/${username}`);
        const data = await res.json();
        
        if (data.success && data.user) {
            const user = data.user;
            
            // Populate basic info
            document.getElementById('username').value = user.username || username;
            document.getElementById('sidebarUsername').textContent = user.fullName || user.username || username;
            document.getElementById('fullName').value = user.fullName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('dob').value = user.dateOfBirth || '';
            
            // Populate avatar
            if (user.avatarUrl) {
                // If it's a relative path starting with /, prefix with API host
                if (user.avatarUrl.startsWith('/')) {
                    document.getElementById('avatarPreview').src = `http://localhost:5000${user.avatarUrl}`;
                } else {
                    document.getElementById('avatarPreview').src = user.avatarUrl;
                }
                currentAvatarUrl = user.avatarUrl;
            } else {
                document.getElementById('avatarPreview').src = `https://ui-avatars.com/api/?name=${user.username || username}&background=random&size=150`;
                currentAvatarUrl = null;
            }
        } else {
            alert(data.message || 'Không thể tải thông tin hồ sơ.');
        }
    } catch (err) {
        console.error('Error loading profile:', err);
        alert('Lỗi kết nối máy chủ.');
    }
}

function handleAvatarSelection(e) {
    const file = e.target.files[0];
    if (file) {
        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh hợp lệ.');
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('avatarPreview').src = e.target.result;
            isAvatarChanged = true;
        }
        reader.readAsDataURL(file);
    }
}

function handleAvatarRemoval() {
    if (confirm('Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại?')) {
        const username = document.getElementById('username').value;
        document.getElementById('avatarPreview').src = `https://ui-avatars.com/api/?name=${username}&background=random&size=150`;
        document.getElementById('avatarUpload').value = ''; // clear input
        isAvatarChanged = true;
        currentAvatarUrl = null; // Mark for removal
    }
}

async function uploadAvatar() {
    const fileInput = document.getElementById('avatarUpload');
    const file = fileInput.files[0];
    
    if (!file) return currentAvatarUrl; // If no new file but changed, might be removal
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (data.success) {
            return data.url;
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (err) {
        console.error('Upload error:', err);
        throw err;
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const username = localStorage.getItem('currentUser');
    if (!username) return;
    
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('fullName').value;
    const dob = document.getElementById('dob').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const saveBtn = document.getElementById('saveProfileBtn');
    
    // Validate password
    if (newPassword && newPassword !== confirmPassword) {
        alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
        return;
    }
    
    // Disable button to prevent double submit
    const originalBtnText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
    saveBtn.disabled = true;
    
    try {
        let avatarUrlToSave = currentAvatarUrl;
        
        // Upload new avatar if changed and not just removed
        const fileInput = document.getElementById('avatarUpload');
        if (isAvatarChanged && fileInput.files.length > 0) {
            avatarUrlToSave = await uploadAvatar();
        } else if (isAvatarChanged && currentAvatarUrl === null) {
            avatarUrlToSave = null; // explicitly set to null
        }
        
        // Prepare update payload
        const payload = {
            fullName: fullName || null,
            email: email || null,
            dateOfBirth: dob || null,
            avatarUrl: avatarUrlToSave
        };
        
        if (newPassword) {
            payload.password = newPassword;
        }
        
        // Call API
        const res = await fetch(`${API_BASE}/nguoi-dung/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert('Cập nhật hồ sơ thành công!');
            
            // Clear password fields
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            // Reset flags
            isAvatarChanged = false;
            if (data.user) {
                currentAvatarUrl = data.user.avatarUrl;
            }
        } else {
            alert(data.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
        }
        
    } catch (err) {
        console.error('Update profile error:', err);
        alert('Lỗi kết nối máy chủ.');
    } finally {
        saveBtn.innerHTML = originalBtnText;
        saveBtn.disabled = false;
    }
}
