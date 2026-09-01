import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Thông số kết nối Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCt8Qzt5CgSl1N7KFOBiB2f_Yl_VTKCH-w",
  authDomain: "web-nine-nien-hoc-tap.firebaseapp.com",
  projectId: "web-nine-nien-hoc-tap",
  storageBucket: "web-nine-nien-hoc-tap.firebasestorage.app",
  messagingSenderId: "104108107608",
  appId: "1:104108107608:web:66d116cf32861a8440672d",
  measurementId: "G-NVY7S1F6X6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const ADMIN_EMAIL = "hipomcvn@gmail.com";

// Thay đổi Video bài học
window.changeVideo = function(videoId, title, desc) {
    document.getElementById('main-player').src = "https://www.youtube.com/embed/" + videoId;
    document.getElementById('video-title').innerText = title;
    document.getElementById('video-desc').innerText = desc;
};

// Quản lý Modal Popup
window.openModal = function(tab) {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        window.switchTab(tab);
    }
};

window.closeModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
};

window.closeModalOnOverlay = function(event) {
    if (event.target.id === 'authModal' || event.target.classList.contains('modal-overlay')) {
        window.closeModal();
    }
};

// Chuyển đổi Tab Đăng nhập / Đăng ký
window.switchTab = function(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('tab-login-btn');
    const registerBtn = document.getElementById('tab-register-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');

    if (tab === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (loginBtn) loginBtn.classList.add('active');
        if (registerBtn) registerBtn.classList.remove('active');
        if (modalTitle) modalTitle.innerText = 'Đăng nhập';
        if (modalSubtitle) modalSubtitle.innerText = 'Chào mừng bạn quay lại! Tiếp tục lộ trình luyện thi của mình.';
    } else {
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.add('active');
        if (loginBtn) loginBtn.classList.remove('active');
        if (modalTitle) modalTitle.innerText = 'Đăng ký';
        if (modalSubtitle) modalSubtitle.innerText = 'Tạo tài khoản để bắt đầu luyện thi và tham gia xếp hạng.';
    }
};

// Tính năng Ẩn / Hiện Mật Khẩu
window.togglePasswordVisibility = function(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            iconElement.innerText = '🙈';
        } else {
            input.type = 'password';
            iconElement.innerText = '👁️';
        }
    }
};

// Xử lý Đăng Nhập & Đăng Ký với Firebase
window.handleAuth = async function(event, type) {
    event.preventDefault();
    
    if (type === 'register') {
        const fullname = document.getElementById('register-fullname').value;
        const email = document.getElementById('register-email').value;
        const pass = document.getElementById('register-pass').value;
        const confirmPass = document.getElementById('register-confirm-pass') ? document.getElementById('register-confirm-pass').value : pass;

        if (pass !== confirmPass) {
            alert("Mật khẩu nhập lại không khớp!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            // Cập nhật Họ và tên vào hồ sơ tài khoản Firebase
            if (fullname) {
                await updateProfile(userCredential.user, { displayName: fullname });
            }
            alert("Tạo tài khoản thành công!");
            window.closeModal();
        } catch (error) {
            alert("Lỗi đăng ký: " + error.message);
        }
    } else if (type === 'login') {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            alert("Đăng nhập thành công!");
            window.closeModal();
        } catch (error) {
            alert("Lỗi đăng nhập: " + error.message);
        }
    }
};

// Đăng nhập Google
window.loginWithGoogle = async function() {
    try {
        await signInWithPopup(auth, googleProvider);
        alert("Đăng nhập Google thành công!");
        window.closeModal();
    } catch (error) {
        alert("Lỗi đăng nhập Google: " + error.message);
    }
};

// Đăng xuất
window.logout = function() {
    signOut(auth).then(() => {
        alert("Đã đăng xuất.");
    });
};

// Theo dõi trạng thái Đăng nhập
onAuthStateChanged(auth, (user) => {
    const userDisplay = document.getElementById('user-display');
    const authBtns = document.getElementById('auth-btns');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBadge = document.getElementById('admin-badge');

    if (user) {
        const displayName = user.displayName || user.email;
        if (authBtns) authBtns.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        if (user.email === ADMIN_EMAIL) {
            if (userDisplay) userDisplay.innerText = `Admin: ${displayName}`;
            if (adminBadge) adminBadge.style.display = 'inline-block';
        } else {
            if (userDisplay) userDisplay.innerText = `Chào: ${displayName}`;
            if (adminBadge) adminBadge.style.display = 'none';
        }
    } else {
        if (authBtns) authBtns.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userDisplay) userDisplay.innerText = '';
        if (adminBadge) adminBadge.style.display = 'none';
    }
});
