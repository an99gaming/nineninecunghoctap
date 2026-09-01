// Hàm chuyển đổi bài học video
function changeVideo(videoId, title, desc) {
    document.getElementById('main-player').src = "https://www.youtube.com/embed/" + videoId;
    document.getElementById('video-title').innerText = title;
    document.getElementById('video-desc').innerText = desc;
}

// Hàm mở cửa sổ Đăng nhập / Đăng ký
function openModal(tab) {
    document.getElementById('authModal').style.display = 'flex';
    switchTab(tab);
}

// Hàm đóng cửa sổ
function closeModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Đóng khi nhấp ra ngoài cửa sổ
function closeModalOnOverlay(event) {
    if (event.target.id === 'authModal') {
        closeModal();
    }
}

// Chuyển tab giữa Đăng nhập và Đăng ký
function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('tab-login-btn');
    const registerBtn = document.getElementById('tab-register-btn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
    }
}

// Giả lập thông báo khi bấm gửi Form
function handleAuth(event, type) {
    event.preventDefault();
    alert(type + " thành công! Chúc bạn học tốt.");
    closeModal();
}
