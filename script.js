import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Thông số kết nối lấy trực tiếp từ Firebase Console của bạn
const firebaseConfig = {
  apiKey: "AIzaSyCt8Qzt5CgSl1N7KFObiB2f_Yl_VTKCh-w",
  authDomain: "web-nine-nien-hoc-tap.firebaseapp.com",
  projectId: "web-nine-nien-hoc-tap",
  storageBucket: "web-nine-nien-hoc-tap.firebasestorage.app",
  messagingSenderId: "104108107608",
  appId: "1:104108107608:web:66d116cf32861a8440672d",
  measurementId: "G-NVY7S1F6X6"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ĐIỀU CHỈNH EMAIL ADMIN CỦA BẠN TẠI ĐÂY
const ADMIN_EMAIL = "hipomcvn@gmail.com";

// Chuyển video playlist
window.changeVideo = function(videoId, title, desc) {
    document.getElementById('main-player').src = "https://www.youtube.com/embed/" + videoId;
    document.getElementById('video-title').innerText = title;
    document.getElementById('video-desc').innerText = desc;
};

// Modal Controls
window.openModal = function(tab) {
    document.getElementById('authModal').style.display = 'flex';
    window.switchTab(tab);
};

window.closeModal = function() {
    document.getElementById('authModal').style.display = 'none';
};

window.closeModalOnOverlay = function(event) {
    if (event.target.id === 'authModal') {
        window.closeModal();
    }
};

window.switchTab = function(tab) {
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
};

// Xử lý Đăng ký / Đăng nhập Email & Password
window.handleAuth = async function(event, type) {
    event.preventDefault();
    
    if (type === 'register') {
        const email = document.getElementById('register-email').value;
        const pass = document.getElementById('register-pass').value;
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
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
            alert("Sai email hoặc mật khẩu!");
        }
    }
};

// Đăng nhập bằng Google
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

// Lắng nghe trạng thái người dùng (Tự động nhận diện Admin / User)
onAuthStateChanged(auth, (user) => {
    const userDisplay = document.getElementById('user-display');
    const authBtns = document.getElementById('auth-btns');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBadge = document.getElementById('admin-badge');

    if (user) {
        authBtns.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        
        // Kiểm tra nếu là Email Admin
        if (user.email === ADMIN_EMAIL) {
            userDisplay.innerText = `Admin: ${user.email}`;
            adminBadge.style.display = 'inline-block';
        } else {
            userDisplay.innerText = `Chào: ${user.email}`;
            adminBadge.style.display = 'none';
        }
    } else {
        authBtns.style.display = 'flex';
        logoutBtn.style.display = 'none';
        userDisplay.innerText = '';
        adminBadge.style.display = 'none';
    }
});
