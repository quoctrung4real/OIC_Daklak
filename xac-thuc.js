document.addEventListener('DOMContentLoaded', async () => {
    // Inject auth CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'xac-thuc.css';
    document.head.appendChild(link);

    // Inject auth HTML
    try {
        const res = await fetch('xac-thuc.html');
        if (res.ok) {
            const html = await res.text();
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            document.body.appendChild(wrapper);
        }
    } catch(e) { console.error("Error loading auth UI:", e); }


    const userBtn = document.getElementById('userBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const authModal = document.getElementById('authModal');
    const authClose = document.getElementById('authClose');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const displayUsername = document.getElementById('displayUsername');
    const logoutBtn = document.getElementById('logoutBtn');
    const userBtnText = document.getElementById('userBtnText');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    
    // Check if user is logged in
    let currentUser = localStorage.getItem('currentUser');
    
    function updateAuthUI() {
        if (currentUser) {
            userBtnText.textContent = currentUser;
        } else {
            userBtnText.textContent = 'Đăng nhập';
        }
    }
    updateAuthUI();
    
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentUser) {
            // Toggle dropdown
            userDropdownMenu.classList.toggle('show');
            displayUsername.textContent = currentUser;
        } else {
            // Show modal
            authModal.classList.add('show');
        }
    });

    // Close dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (!userBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
            userDropdownMenu.classList.remove('show');
        }
    });

    // Modal Close
    authClose.addEventListener('click', () => {
        authModal.classList.remove('show');
    });

    // Tabs switching
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        errorEl.textContent = '';

        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('currentUser', data.user.username);
                currentUser = data.user.username;
                updateAuthUI();
                authModal.classList.remove('show');
                loginForm.reset();
                // trigger an event so other scripts know user logged in
                window.dispatchEvent(new Event('userLoginStateChanged'));
            } else {
                errorEl.textContent = data.message;
            }
        } catch (err) {
            console.error(err);
            errorEl.textContent = 'Lỗi kết nối máy chủ.';
        }
    });

    // Handle Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const errorEl = document.getElementById('registerError');
        errorEl.textContent = '';

        try {
            const res = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('currentUser', data.user.username);
                currentUser = data.user.username;
                updateAuthUI();
                authModal.classList.remove('show');
                registerForm.reset();
                window.dispatchEvent(new Event('userLoginStateChanged'));
            } else {
                errorEl.textContent = data.message;
            }
        } catch (err) {
            console.error(err);
            errorEl.textContent = 'Lỗi kết nối máy chủ.';
        }
    });

    // Handle Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        currentUser = null;
        updateAuthUI();
        userDropdownMenu.classList.remove('show');
        window.dispatchEvent(new Event('userLoginStateChanged'));
    });

    // Handle Forgot Password
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Tính năng khôi phục mật khẩu đang được bảo trì. Vui lòng liên hệ quản trị viên.');
        });
    }
});
