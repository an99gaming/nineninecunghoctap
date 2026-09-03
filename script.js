import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
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
const ADMIN_EMAIL = "hipomcvn@gmail.com";

// ==========================================
// QUẢN LÝ ĐIỂM SỐ & BẢNG XẾP HẠNG
// ==========================================
let initialLeaderboard = [
    { name: "Đào Minh Châu", points: 140, isUser: false, avatar: "M", avatarBg: "#e2f2e6", avatarColor: "#00a651" },
    { name: "Nguyễn An", points: 70, isUser: true, avatar: "🌸", isEmoji: true },
    { name: "Tuan Phuong", points: 50, isUser: false, avatar: "T", avatarBg: "#e0f2fe", avatarColor: "#0284c7" },
    { name: "Trang tẹt", points: 50, isUser: false, avatar: "T", avatarBg: "#e0f2fe", avatarColor: "#0284c7" },
    { name: "Duy Kiên", points: 40, isUser: false, avatar: "D", avatarBg: "#fef3c7", avatarColor: "#d97706" },
    { name: "Đỗ Văn Bình", points: 20, isUser: false, avatar: "🏔️", isEmoji: true },
    { name: "Trần cao Phú", points: 10, isUser: false, avatar: "C", avatarBg: "#e0f2fe", avatarColor: "#0284c7" },
    { name: "My Ngoc", points: 10, isUser: false, avatar: "M", avatarBg: "#e2f2e6", avatarColor: "#00a651" }
];

let userPoints = parseInt(localStorage.getItem('user_points') || "70");

function renderLeaderboard() {
    const userIndex = initialLeaderboard.findIndex(item => item.isUser);
    if (userIndex !== -1) {
        initialLeaderboard[userIndex].points = userPoints;
    }

    initialLeaderboard.sort((a, b) => b.points - a.points);

    const currentUserRank = initialLeaderboard.findIndex(item => item.isUser) + 1;
    const rankText = document.getElementById('my-rank-text');
    if (rankText) {
        rankText.innerText = `Hạng ${currentUserRank}/${initialLeaderboard.length}`;
    }

    const listContainer = document.getElementById('leaderboard-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    initialLeaderboard.forEach((item, index) => {
        const rankNum = index + 1;
        const row = document.createElement('div');
        row.className = `rank-item ${item.isUser ? 'highlight-user' : ''}`;

        let rankBadgeClass = 'rank-badge default';
        if (rankNum === 1) rankBadgeClass = 'rank-badge rank-1';
        if (rankNum === 2) rankBadgeClass = 'rank-badge rank-2';
        if (rankNum === 3) rankBadgeClass = 'rank-badge rank-3';

        let avatarHTML = item.isEmoji 
            ? `<div class="avatar-box emoji-avatar">${item.avatar}</div>`
            : `<div class="avatar-box" style="background:${item.avatarBg}; color:${item.avatarColor}">${item.avatar}</div>`;

        row.innerHTML = `
            <div class="user-info">
                <span class="${rankBadgeClass}">${rankNum}</span>
                ${avatarHTML}
                <span class="user-name">${item.name}</span>
                ${item.isUser ? '<span class="you-badge">Bạn</span>' : ''}
            </div>
            <div class="points">${item.points} điểm</div>
        `;

        listContainer.appendChild(row);
    });
}

function addPointsForWatching() {
    userPoints += 10;
    localStorage.setItem('user_points', userPoints);
    renderLeaderboard();
}

// ==========================================
// TIẾN ĐỘ KHÓA HỌC
// ==========================================
const totalLessons = 90;
let completedLessons = new Set(JSON.parse(localStorage.getItem('completed_lessons') || "[]"));

function updateProgressUI() {
    const completedCount = completedLessons.size || 7;
    const remainingCount = totalLessons - completedCount;
    const percentage = Math.round((completedCount / totalLessons) * 100);

    const circleText = document.querySelector('.circle-progress span');
    if (circleText) circleText.innerText = `${percentage}%`;

    const progressText = document.querySelector('.progress-info p');
    if (progressText) {
        progressText.innerHTML = `Đã học <strong>${completedCount}/${totalLessons}</strong> bài · còn ${remainingCount} bài`;
    }
}

function markLessonAsCompleted(lessonTitle) {
    if (!completedLessons.has(lessonTitle)) {
        completedLessons.add(lessonTitle);
        localStorage.setItem('completed_lessons', JSON.stringify(Array.from(completedLessons)));
        updateProgressUI();
        addPointsForWatching();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateProgressUI();
    renderLeaderboard();
});

// ==========================================
// YOUTUBE IFRAME API
// ==========================================
let player;
window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('main-player', {
        events: { 'onStateChange': onPlayerStateChange }
    });
};

if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onPlayerStateChange(event) {
    if (event.data === 0) { // Video kết thúc
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

    document.querySelectorAll('.lesson-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');
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
        }
    }
};

window.prevLesson = function() {
    const lessons = Array.from(document.querySelectorAll('.lesson-item'));
    const currentIndex = lessons.findIndex(item => item.classList.contains('active'));
    if (currentIndex > 0) lessons[currentIndex - 1].click();
};

// ==========================================
// MODAL & AUTH
// ==========================================
window.openModal = function(tab) {
    const modal = document.getElementById('authModal');
    if (modal) { modal.style.display = 'flex'; window.switchTab(tab); }
};

window.closeModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
};

window.closeModalOnOverlay = function(e) {
    if (e.target.id === 'authModal') window.closeModal();
};

window.switchTab = function(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (tab === 'login') {
        loginForm?.classList.remove('hidden');
        registerForm?.classList.add('hidden');
    } else {
        loginForm?.classList.add('hidden');
        registerForm?.classList.remove('hidden');
    }
};

window.logout = function() {
    signOut(auth).then(() => alert("Đã đăng xuất."));
};

onAuthStateChanged(auth, (user) => {
    const userDisplay = document.getElementById('user-display');
    const authBtns = document.getElementById('auth-btns');
    const logoutBtn = document.getElementById('logout-btn');

    if (user) {
        if (authBtns) authBtns.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (userDisplay) userDisplay.innerText = `Chào: ${user.displayName || user.email}`;
    } else {
        if (authBtns) authBtns.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userDisplay) userDisplay.innerText = '';
    }
});
