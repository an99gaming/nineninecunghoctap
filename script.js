import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    updateDoc, 
    increment, 
    collection, 
    onSnapshot, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

let currentUser = null;

// ==========================================
// 1. LẮNG NGHE & RENDER BẢNG XẾP HẠNG THỰC TẾ
// ==========================================
function listenToLeaderboard() {
    const q = query(collection(db, "users"), orderBy("points", "desc"));

    onSnapshot(q, (snapshot) => {
        const usersList = [];
        snapshot.forEach((doc) => {
            usersList.push({ id: doc.id, ...doc.data() });
        });
        renderLeaderboardUI(usersList);
    });
}

function renderLeaderboardUI(usersList) {
    const listContainer = document.getElementById('leaderboard-list');
    const rankText = document.getElementById('my-rank-text');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    let userRank = 0;
    const totalUsers = usersList.length;

    usersList.forEach((item, index) => {
        const rankNum = index + 1;
        const isMe = currentUser && item.id === currentUser.uid;

        if (isMe) userRank = rankNum;

        const row = document.createElement('div');
        row.className = `rank-item ${isMe ? 'highlight-user' : ''}`;

        let rankBadgeClass = 'rank-badge default';
        if (rankNum === 1) rankBadgeClass = 'rank-badge rank-1';
        if (rankNum === 2) rankBadgeClass = 'rank-badge rank-2';
        if (rankNum === 3) rankBadgeClass = 'rank-badge rank-3';

        const firstLetter = (item.name || "U").charAt(0).toUpperCase();

        row.innerHTML = `
            <div class="user-info">
                <span class="${rankBadgeClass}">${rankNum}</span>
                <div class="avatar-box" style="background: #e2f2e6; color: #00a651">${firstLetter}</div>
                <span class="user-name">${item.name || "Học viên"}</span>
                ${isMe ? '<span class="you-badge">Bạn</span>' : ''}
            </div>
            <div class="points">${item.points || 0} điểm</div>
        `;

        listContainer.appendChild(row);
    });

    if (rankText) {
        rankText.innerText = userRank > 0 
            ? `Vị trí của bạn: Hạng ${userRank}/${totalUsers} · Cố lên nhé!` 
            : `Đăng nhập để xem vị trí của bạn trên bảng xếp hạng!`;
    }
}

// ==========================================
// 2. TĂNG ĐIỂM KHI XEM XONG VIDEO (+10 ĐIỂM)
// ==========================================
async function addPointsForWatching() {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    try {
        await updateDoc(userRef, { points: increment(10) });
    } catch (e) {
        console.error("Lỗi cộng điểm:", e);
    }
}

// ==========================================
// 3. TIẾN ĐỘ KHÓA HỌC
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

document.addEventListener('DOMContentLoaded', updateProgressUI);

// ==========================================
// 4. YOUTUBE IFRAME API
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
    if (event.data === 0) { // Khi video phát xong
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
// 5. ĐỔI BÀI & BẤM NEXT
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
// 6. XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ (FIREBASE)
// ==========================================
window.handleAuth = async function(e, type) {
    e.preventDefault();
    if (type === 'register') {
        const name = document.getElementById('register-fullname').value;
        const email = document.getElementById('register-email').value;
        const pass = document.getElementById('register-pass').value;

        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(res.user, { displayName: name });
            
            // Lưu thành viên mới vào Firestore với 10 điểm ban đầu
            await setDoc(doc(db, "users", res.user.uid), {
                name: name,
                email: email,
                points: 10
            });

            alert("Đăng ký tài khoản thành công!");
            closeModal();
        } catch (err) {
            alert("Lỗi đăng ký: " + err.message);
        }
    } else {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            alert("Đăng nhập thành công!");
            closeModal();
        } catch (err) {
            alert("Lỗi đăng nhập: " + err.message);
        }
    }
};

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

// Theo dõi trạng thái tài khoản
onAuthStateChanged(auth, (user) => {
    currentUser = user;
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

    // Kích hoạt lắng nghe Bảng xếp hạng Realtime từ database
    listenToLeaderboard();
});
