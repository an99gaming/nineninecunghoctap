import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    updateDoc, 
    increment, 
    collection, 
    onSnapshot, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// CẤU HÌNH FIREBASE
// ==========================================
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
let currentLessonIndex = 0;

// ==========================================
// 1. LẮNG NGHE & RENDER BẢNG XẾP HẠNG THỰC TẾ
// ==========================================
function listenToLeaderboard() {
    const q = query(collection(db, "users"), orderBy("points", "desc"));

    onSnapshot(q, (snapshot) => {
        const usersList = [];
        snapshot.forEach((docSnap) => {
            usersList.push({ id: docSnap.id, ...docSnap.data() });
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
            <div class="points">⚡ ${item.points || 0} p</div>
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
// 3. TIẾN ĐỘ KHÓA HỌC & LOCAL STORAGE
// ==========================================
const totalLessons = 90;
let completedLessons = new Set(JSON.parse(localStorage.getItem('completed_lessons') || "[]"));

function updateProgressUI() {
    const completedCount = completedLessons.size || 7;
    const remainingCount = Math.max(0, totalLessons - completedCount);
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

// ==========================================
// 4. YOUTUBE IFRAME API & EVENT HANDLING
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
    if (event.data === 0) { // Khi video phát xong (Ended)
        const activeLesson = document.querySelector('.lesson-item.active');
        if (activeLesson) {
            const statusIcon = activeLesson.querySelector('.status-icon');
            if (statusIcon) {
                statusIcon.className = 'status-icon completed';
                statusIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            }
            const lessonTitle = activeLesson.querySelector('.lesson-title')?.innerText || 'lesson';
            markLessonAsCompleted(lessonTitle);
            
            // Tự động chuyển bài kế tiếp
            window.nextLesson();
        }
    }
}

// ==========================================
// 5. ĐỔI BÀI & ĐIỀU HƯỚNG BÀI HỌC
// ==========================================
window.changeVideo = function(videoId, title, chapterName, docLink, element, index) {
    const playerElem = document.getElementById('main-player');
    if (playerElem && videoId && !videoId.startsWith('ID_YOUTUBE')) {
        playerElem.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1`;
    }

    const titleElem = document.getElementById('video-title');
    if (titleElem && title) titleElem.innerText = title;

    const chapterElem = document.getElementById('chapter-tag');
    if (chapterElem && chapterName) chapterElem.innerText = chapterName;

    if (docLink) {
        const docTitle = document.getElementById('doc-title');
        const docDownload = document.getElementById('doc-link');
        if (docTitle) docTitle.innerText = `${title} - File đề.pdf`;
        if (docDownload) docDownload.href = docLink;
    }

    document.querySelectorAll('.lesson-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');

    if (typeof index === 'number') {
        currentLessonIndex = index;
    }
};

window.nextLesson = function() {
    const lessons = Array.from(document.querySelectorAll('.lesson-item'));
    const currentIndex = lessons.findIndex(item => item.classList.contains('active'));
    
    if (currentIndex !== -1) {
        const currentLesson = lessons[currentIndex];
        const currentTitle = currentLesson.querySelector('.lesson-title')?.innerText || `lesson_${currentIndex}`;
        
        const statusIcon = currentLesson.querySelector('.status-icon');
        if (statusIcon) {
            statusIcon.className = 'status-icon completed';
            statusIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
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
// 6. XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ (EMAIL & PASSWORD)
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
                points: 10,
                role: "student"
            });

            alert("Đăng ký tài khoản thành công!");
            window.closeModal();
        } catch (err) {
            console.error("Lỗi đăng ký:", err.code);
            switch (err.code) {
                case 'auth/email-already-in-use':
                    alert("Email này đã được đăng ký trước đó. Hệ thống đã chuyển sang tab Đăng nhập cho bạn!");
                    window.switchTab('login');
                    document.getElementById('login-email').value = email;
                    break;
                case 'auth/weak-password':
                    alert("Mật khẩu quá yếu! Vui lòng nhập tối thiểu 6 ký tự.");
                    break;
                case 'auth/invalid-email':
                    alert("Định dạng Email không hợp lệ!");
                    break;
                default:
                    alert("Lỗi đăng ký: " + err.message);
            }
        }
    } else {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            alert("Đăng nhập thành công!");
            window.closeModal();
        } catch (err) {
            console.error("Lỗi đăng nhập:", err.code);
            switch (err.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    alert("Sai tài khoản hoặc mật khẩu! Vui lòng kiểm tra lại.");
                    break;
                default:
                    alert("Lỗi đăng nhập: " + err.message);
            }
        }
    }
};

// ==========================================
// 7. ĐĂNG NHẬP BẰNG GOOGLE (AN TOÀN BẢO TỒN ĐIỂM)
// ==========================================
window.loginWithGoogle = async function() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // Nếu là người dùng mới mới khởi tạo 10 điểm, nếu cũ thì giữ nguyên
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                name: user.displayName || "Học viên Google",
                email: user.email,
                points: 10,
                role: "student"
            });
        }

        alert("Đăng nhập bằng Google thành công!");
        window.closeModal();
    } catch (error) {
        console.error("Lỗi Google Auth:", error);
        alert("Đăng nhập bằng Google thất bại: " + error.message);
    }
};

// ==========================================
// 8. ĐIỀU KHIỂN MODAL & TAB
// ==========================================
window.openModal = function(tab) {
    const modal = document.getElementById('authModal');
    if (modal) { 
        modal.style.display = 'flex'; 
        window.switchTab(tab); 
    }
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
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');

    if (tab === 'login') {
        loginForm?.classList.remove('hidden');
        registerForm?.classList.add('hidden');
        tabLoginBtn?.classList.add('active');
        tabRegisterBtn?.classList.remove('active');
    } else {
        loginForm?.classList.add('hidden');
        registerForm?.classList.remove('hidden');
        tabRegisterBtn?.classList.add('active');
        tabLoginBtn?.classList.remove('active');
    }
};

window.logout = function() {
    signOut(auth).then(() => alert("Đã đăng xuất."));
};

// ==========================================
// 9. THEO DÕI TRẠNG THÁI TÀI KHOẢN & KHỞI TẠO
// ==========================================
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    const userDisplay = document.getElementById('user-display');
    const authBtns = document.getElementById('auth-btns');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBadge = document.getElementById('admin-badge');

    if (user) {
        if (authBtns) authBtns.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        const displayName = userData?.name || user.displayName || user.email;

        if (userDisplay) userDisplay.innerText = `Chào: ${displayName}`;
        
        if (userData?.role === 'admin' && adminBadge) {
            adminBadge.style.display = 'inline-block';
        } else if (adminBadge) {
            adminBadge.style.display = 'none';
        }
    } else {
        if (authBtns) authBtns.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userDisplay) userDisplay.innerText = '';
        if (adminBadge) adminBadge.style.display = 'none';
    }

    // Lắng nghe Bảng xếp hạng Realtime
    listenToLeaderboard();
});

// Khởi chạy cập nhật tiến độ lần đầu
document.addEventListener('DOMContentLoaded', updateProgressUI);
