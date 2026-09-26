// حالة اللعبة وبيانات المستخدم
let currentUser = null;
let boardState = [1, 2, 3, 4, 5, 6, 7, 8, null];
let moves = 0;
let seconds = 0;
let timerInterval = null;
let isGameActive = false;

// عناصر الـ DOM - الشاشات
const authScreen = document.getElementById('auth-screen');
const gameScreen = document.getElementById('game-screen');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const playerNameDisplay = document.getElementById('player-name-display');
const logoutBtn = document.getElementById('logout-btn');

// عناصر الـ DOM - لوحة اللعب والتحكم
const boardElement = document.getElementById('board');
const movesElement = document.getElementById('moves-count');
const timerElement = document.getElementById('timer');
const shuffleBtn = document.getElementById('shuffle-btn');

// عناصر شاشة البداية (Overlay)
const startOverlay = document.getElementById('start-overlay');
const startGameBtn = document.getElementById('start-game-btn');

// عناصر الـ DOM - النوافذ المنبثقة
const targetModal = document.getElementById('target-modal');
const targetPreviewBtn = document.getElementById('target-preview-btn');
const closeTargetBtn = document.getElementById('close-target-btn');

const winModal = document.getElementById('win-modal');
const playAgainBtn = document.getElementById('play-again-btn');
const winPlayerName = document.getElementById('win-player-name');
const finalMoves = document.getElementById('final-moves');
const finalTime = document.getElementById('final-time');

// 1. نظام تسجيل الدخول
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username && password) {
    currentUser = username;
    playerNameDisplay.textContent = currentUser;
    winPlayerName.textContent = currentUser;

    authScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    loginForm.reset();
    startNewGame(true); // تفعيل شاشة البداية أول الدخول
  }
});

// 2. تسجيل الخروج
logoutBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  isGameActive = false;
  currentUser = null;
  gameScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
});

// 3. زر "ابدأ التحدي" اللي بقلب اللوحة
startGameBtn.addEventListener('click', () => {
  startOverlay.classList.add('hidden-overlay');
  isGameActive = true;
  startTimer();
});

// 4. فحص إمكانية الحل رياضياً (Solvability)
function isSolvable(arr) {
  let inversions = 0;
  const filtered = arr.filter(n => n !== null);
  for (let i = 0; i < filtered.length - 1; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[i] > filtered[j]) {
        inversions++;
      }
    }
  }
  return inversions % 2 === 0;
}

// 5. خلط اللوحة وبدء الجولة
function startNewGame(showStartOverlay = true) {
  resetTimer();
  moves = 0;
  movesElement.textContent = moves;

  do {
    for (let i = boardState.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [boardState[i], boardState[j]] = [boardState[j], boardState[i]];
    }
  } while (!isSolvable(boardState) || isWinning(boardState));

  renderBoard();

  if (showStartOverlay) {
    isGameActive = false;
    startOverlay.classList.remove('hidden-overlay');
  } else {
    isGameActive = true;
    startTimer();
  }
}

// 6. رسم المربعات بالشبكة
function renderBoard() {
  // تنظيف المربعات القديمة بس (بدون مسح الـ Overlay)
  const tilesToRemove = boardElement.querySelectorAll('.tile');
  tilesToRemove.forEach(t => t.remove());

  boardState.forEach((value, index) => {
    const tile = document.createElement('div');
    tile.classList.add('tile');

    if (value === null) {
      tile.classList.add('empty');
    } else {
      tile.textContent = value;
      if (value === index + 1) {
        tile.classList.add('in-position');
      }
      tile.addEventListener('click', () => handleTileClick(index));
    }
    boardElement.appendChild(tile);
  });
}

// 7. التعامل مع تحريك المربعات
function handleTileClick(index) {
  if (!isGameActive) return;

  const emptyIndex = boardState.indexOf(null);
  const row = Math.floor(index / 3);
  const col = index % 3;
  const emptyRow = Math.floor(emptyIndex / 3);
  const emptyCol = emptyIndex % 3;

  const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;

  if (isAdjacent) {
    boardState[emptyIndex] = boardState[index];
    boardState[index] = null;

    moves++;
    movesElement.textContent = moves;
    
    renderBoard();

    if (isWinning(boardState)) {
      handleWin();
    }
  }
}

// 8. التحقق من الترتيب الصحيح
function isWinning(state) {
  for (let i = 0; i < 8; i++) {
    if (state[i] !== i + 1) return false;
  }
  return state[8] === null;
}

// 9. הפوز وعرض الوقت
function handleWin() {
  clearInterval(timerInterval);
  isGameActive = false;
  
  finalMoves.textContent = moves;
  finalTime.textContent = formatTime(seconds);
  
  winModal.classList.add('show');
}

// 10. المؤقت التصاعدي
function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  timerElement.textContent = "00:00";
  timerInterval = setInterval(() => {
    seconds++;
    timerElement.textContent = formatTime(seconds);
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  timerElement.textContent = "00:00";
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// أزرار المودال والإغلاق
targetPreviewBtn.addEventListener('click', () => {
  targetModal.classList.add('show');
});

closeTargetBtn.addEventListener('click', () => {
  targetModal.classList.remove('show');
});

window.addEventListener('click', (e) => {
  if (e.target === targetModal) {
    targetModal.classList.remove('show');
  }
});

// خلط اللعبة من جديد بيرجع يعرض شاشة البداية
shuffleBtn.addEventListener('click', () => {
  startNewGame(true); 
});

// اللعب مرة تانية بيرجع يعرض شاشة البداية
playAgainBtn.addEventListener('click', () => {
  winModal.classList.remove('show');
  startNewGame(true);
});