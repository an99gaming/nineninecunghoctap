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

// ==========================================
// QUẢN LÝ TIẾN ĐỘ KHÓA HỌC
// ==========================================
const totalLessons = 90;
let completedLessons = new Set(JSON.parse(localStorage.getItem('completed_lessons') || "[]"));

function updateProgressUI() {
    const completedCount = completedLessons.size;
    const remainingCount = totalLessons - completedCount;
    const percentage = Math.round((completedCount / totalLessons) * 100);

    const circleText = document.querySelector('.circle-progress span');
    if (circleText) circleText.innerText = `${percentage}%`;

    const progressText = document.querySelector('.progress-info p');
    if (progressText) {
        progressText.innerHTML = `Đã học <strong>${completedCount}/${totalLessons}</strong> bài · còn ${remainingCount} bài`;
    }
}

function markLessonAsCompleted(lessonId) {
    if (!completedLessons.has(lessonId)) {
        completedLessons.add(lessonId);
        localStorage.setItem('completed_lessons', JSON.stringify(Array.from(completedLessons)));
        updateProgressUI();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateProgressUI();
});

// ==========================================
// YOUTUBE IFRAME API (Tăng tiến độ khi xem HẾT video)
// ==========================================
let player;
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('main-player', {
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
};

if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onPlayerStateChange(event) {
    if (event.data === 0) { // State 0 = Video đã phát xong
        const activeLesson = document.querySelector('.lesson-item.active');
        if (activeLesson) {
            const statusIcon = activeLesson.querySelector('.status-icon');
            if (statusIcon) {
                statusIcon.className = 'status-icon completed';
                statusIcon.innerText = '✓';
            }
            const lessonTitle = activeLesson.querySelector('.lesson-text p')?.innerText || 'lesson';
            markLessonAsCompleted(lessonTitle);
        }
    }
}

// ==========================================
// CHUYỂN BÀI HỌC
// ==========================================
window.changeVideo = function(videoId, title, chapterName, docLink, element) {
    const playerElem = document.getElementById('main-player');
    if (playerElem && videoId) {
        playerElem.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1`;
    }

    const titleElem = document.getElementById('video-title');
    if (titleElem && title) titleElem.innerText = title;

    const chapterElem = document.getElementById('chapter-tag');
    if (chapterElem && chapterName) chapterElem.innerText = chapterName;

    const docTitle = document.getElementById('doc-title');
    const docBtn = document.getElementById('doc-link');
    if (docTitle && docBtn) {
        if (docLink) {
            docTitle.innerText = `${title} - File đề.pdf`;
            docBtn.href = docLink;
            docBtn.style.display = 'inline-flex';
        } else {
            docTitle.innerText = 'Chưa có tài liệu đính kèm cho bài học này.';
            docBtn.style.display = 'none';
        }
    }

    document.querySelectorAll('.lesson-item').forEach(item => item.classList.remove('active'));

    let targetElement = element || (window.event && window.event.currentTarget);
    if (targetElement) {
        targetElement.classList.add('active');
    }
};

window.nextLesson = function() {
    const lessons = Array.from(document.querySelectorAll('.lesson-item'));
    const currentIndex = lessons.findIndex(item => item.classList.contains('active'));
    
    if (currentIndex !== -1) {
        const currentLesson = lessons[currentIndex];
        const currentTitle = currentLesson.querySelector('.lesson-text p')?.innerText || `lesson_${currentIndex}`;
        
        const statusIcon = currentLesson.querySelector('.status-icon');
        if (statusIcon) {
            statusIcon.className = 'status-icon completed';
            statusIcon.innerText = '✓';
        }
        markLessonAsCompleted(currentTitle);

        if (currentIndex < lessons.length - 1) {
            lessons[currentIndex + 1].click();
            const parentAccordion = lessons[currentIndex + 1].closest('.chapter-accordion');
            if (parentAccordion) parentAccordion.open = true;
        } else {
            alert("Bạn đã ở bài học cuối cùng!");
        }
    }
};

window.prevLesson = function() {
    const lessons = Array.from(document.querySelectorAll('.lesson-item'));
    const currentIndex = lessons.findIndex(item => item.classList.contains('active'));
    
    if (currentIndex > 0) {
        lessons[currentIndex - 1].click();
        const parentAccordion = lessons[currentIndex - 1].closest('.chapter-accordion');
        if (parentAccordion) parentAccordion.open = true;
    } else {
        alert("Bạn đang ở bài học đầu tiên!");
    }
};

// ==========================================
// MODAL & FIREBASE AUTHENTICATION
// ==========================================
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

window.switchTab = function(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('tab-login-btn');
    const registerBtn = document.getElementById('tab-register-btn');

    if (tab === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (loginBtn) loginBtn.classList.add('active');
        if (registerBtn) registerBtn.classList.remove('active');
    } else {
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.add('active');
        if (loginBtn) loginBtn.classList.remove('active');
    }
};

window.handleAuth = async function(event, type) {
    event.preventDefault();
    if (type === 'register') {
        const fullname = document.getElementById('register-fullname').value;
        const email = document.getElementById('register-email').value;
        const pass = document.getElementById('register-pass').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            if (fullname) await updateProfile(userCredential.user, { displayName: fullname });
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

window.logout = function() {
    signOut(auth).then(() => alert("Đã đăng xuất."));
};

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
