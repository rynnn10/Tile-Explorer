const SoundManager = {
  ctx: null,
  enabled: true,
  bgmAudio: null,

  init: function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // AMBIL DARI HTML SEKARANG
    this.bgmAudio = document.getElementById("bgm-audio");
    if (this.bgmAudio) {
      this.bgmAudio.volume = 0.4;
    }
  },

  startBGM: function () {
    if (this.enabled && this.bgmAudio) {
      // Promise safe play
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Autoplay dicegah browser, menunggu interaksi user.");
        });
      }
    }
  },

  stopBGM: function () {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0; // Reset ke awal
    }
  },

  playTone: function (freq, type, duration, vol = 0.1) {
    if (!this.enabled || !this.ctx) return;
    // Resume context jika ter-suspend (wajib untuk mobile)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration
    );
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playClick: function () {
    this.playTone(800, "sine", 0.1);
  },
  playMatch: function () {
    this.playTone(1200, "sine", 0.1);
    setTimeout(() => this.playTone(1800, "sine", 0.2), 100);
  },
  playWin: function () {
    [523, 659, 783, 1046].forEach((f, i) =>
      setTimeout(() => this.playTone(f, "triangle", 0.3, 0.2), i * 150)
    );
  },
  playLose: function () {
    [300, 250, 200].forEach((f, i) =>
      setTimeout(() => this.playTone(f, "sawtooth", 0.4, 0.2), i * 300)
    );
  },

  toggle: function () {
    this.enabled = !this.enabled;
    if (this.enabled) this.startBGM();
    else this.stopBGM();
    return this.enabled;
  },
};

const StorageManager = {
  save: function (data) {
    localStorage.setItem("tileExplorerSave", JSON.stringify(data));
  },
  load: function () {
    const data = localStorage.getItem("tileExplorerSave");
    return data ? JSON.parse(data) : null;
  },
  clear: function () {
    localStorage.removeItem("tileExplorerSave");
  },
  saveHighScore: function (score) {
    const current = parseInt(
      localStorage.getItem("tileExplorerHighScore") || "0"
    );
    if (score > current) localStorage.setItem("tileExplorerHighScore", score);
  },
  getHighScore: function () {
    return parseInt(localStorage.getItem("tileExplorerHighScore") || "0");
  },
  saveTheme: function (theme) {
    localStorage.setItem("tileExplorerTheme", theme);
  },
  getTheme: function () {
    return localStorage.getItem("tileExplorerTheme");
  },
  saveMaxLevel: function (lvl) {
    const current = parseInt(
      localStorage.getItem("tileExplorerMaxLevel") || "1"
    );
    if (lvl > current) localStorage.setItem("tileExplorerMaxLevel", lvl);
  },
  getMaxLevel: function () {
    return parseInt(localStorage.getItem("tileExplorerMaxLevel") || "1");
  },
};

const TILE_SIZE = 50;
const TRAY_TILE_SIZE = 42;
const TRAY_CAPACITY = 7;
const TRAY_GAP = 8;
// Lebar dasar tray sebelum di-scale
const BASE_TRAY_WIDTH =
  TRAY_TILE_SIZE * TRAY_CAPACITY + TRAY_GAP * (TRAY_CAPACITY - 1) + 48;

const ICONS = {
  heart: {
    color: "text-red-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  },
  star: {
    color: "text-yellow-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  },
  zap: {
    color: "text-purple-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  },
  moon: {
    color: "text-blue-400",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  },
  sun: {
    color: "text-orange-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
  },
  cloud: {
    color: "text-sky-300",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19"/><path d="M19.5 19c2.485 0 4.5-2.015 4.5-4.5s-2.015-4.5-4.5-4.5c-.53 0-1.037.09-1.516.255C17.388 6.69 14.936 4 12 4c-3.328 0-6.096 2.53-6.446 5.8C5.253 9.28 4.653 9 4 9c-2.76 0-5 2.24-5 5s2.24 5 5 5h13.5z"/></svg>',
  },
  music: {
    color: "text-pink-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  },
  anchor: {
    color: "text-indigo-600",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>',
  },
  coffee: {
    color: "text-amber-700",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
  },
  leaf: {
    color: "text-green-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  },
  umbrella: {
    color: "text-teal-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12a10.06 10.06 0 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/></svg>',
  },
  diamond: {
    color: "text-cyan-400",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/></svg>',
  },
  fire: {
    color: "text-red-600",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  },
  ghost: {
    color: "text-gray-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 22v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M9 22v-2"/><path d="M15 22v-2"/><path d="M19 13V6a7 7 0 0 0-14 0v7a3 3 0 0 0 3 3v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2a3 3 0 0 0 3-3Z"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/></svg>',
  },
  camera: {
    color: "text-slate-700",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  },
};
const ICON_KEYS = Object.keys(ICONS);

let tiles = [];
let tray = [];
let score = 0;
let level = 1;
let isProcessingMatch = false;
let gameState = "menu";

const boardEl = document.getElementById("board-container");
const trayEl = document.getElementById("tray-content");
const trayCountEl = document.getElementById("tray-count");
const overlayEl = document.getElementById("overlay");
const overlayContentEl = document.getElementById("overlay-content");
const scoreEl = document.getElementById("score-display");
const levelEl = document.getElementById("level-display");
const trayScalerEl = document.getElementById("tray-scaler");
const startScreenEl = document.getElementById("start-screen");
const highScoreEl = document.getElementById("high-score-display");
const btnContinue = document.getElementById("btn-continue");
const settingsModal = document.getElementById("settings-modal");
const infoModal = document.getElementById("info-modal");
const levelSelectModal = document.getElementById("level-select-modal");
const levelGrid = document.getElementById("level-grid");
const trayContainerWrapper = document.getElementById("tray-container-wrapper"); // Ambil elemen wrapper

window.addEventListener("load", () => {
  highScoreEl.innerText = StorageManager.getHighScore();
  checkSaveGame();

  const savedTheme = StorageManager.getTheme();
  if (savedTheme) changeTheme(savedTheme, false);

  // Inisialisasi audio saat user berinteraksi pertama kali
  const initAudio = () => {
    SoundManager.init();
    document.body.removeEventListener("click", initAudio);
    document.body.removeEventListener("touchstart", initAudio);
  };
  document.body.addEventListener("click", initAudio);
  document.body.addEventListener("touchstart", initAudio);

  // Panggil resize
  handleResize();
});

function changeTheme(themeName, playSound = true) {
  const body = document.getElementById("game-body");
  body.className = `h-screen w-screen fixed text-slate-800 transition-colors duration-500 overflow-hidden ${themeName}`;
  if (themeName === "theme-night") body.classList.add("text-slate-100");
  else body.classList.remove("text-slate-100");

  StorageManager.saveTheme(themeName);
  if (playSound) SoundManager.playClick();
}

function checkSaveGame() {
  const save = StorageManager.load();
  if (save && save.gameState === "playing")
    btnContinue.classList.remove("hidden");
  else btnContinue.classList.add("hidden");
}

function confirmNewGame() {
  StorageManager.clear();
  startGame();
}

function continueGame() {
  const save = StorageManager.load();
  if (save) {
    level = save.level;
    score = save.score;
    tiles = save.tiles;
    tray = save.tray;
    startScreenEl.style.transform = "translateY(-100%)";
    gameState = "playing";
    updateUI();
    renderBoard();
    renderTray();
    handleResize();
    SoundManager.playClick();
  }
}

function startGame() {
  // Paksa play audio di sini (karena ini dipanggil dari klik tombol)
  if (SoundManager.bgmAudio) {
    // Resume context jika suspend (kebijakan browser)
    if (SoundManager.ctx && SoundManager.ctx.state === "suspended") {
      SoundManager.ctx.resume();
    }

    // Play sound dengan promise catch untuk debug
    const playPromise = SoundManager.bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log(
          "Audio play failed (biasanya perlu interaksi user):",
          error
        );
      });
    }
  }

  SoundManager.playClick();
  startScreenEl.style.transform = "translateY(-100%)";
  score = 0;
  level = 1;
  updateUI();
  generateLevel(level);
}

function showLevelSelect() {
  SoundManager.playClick();
  levelSelectModal.classList.remove("hidden");
  setTimeout(() => levelSelectModal.classList.remove("opacity-0"), 10);
  renderLevelGrid();
}

function closeLevelSelect() {
  SoundManager.playClick();
  levelSelectModal.classList.add("opacity-0");
  setTimeout(() => levelSelectModal.classList.add("hidden"), 300);
}

function renderLevelGrid() {
  levelGrid.innerHTML = "";
  const maxLevel = StorageManager.getMaxLevel();

  for (let i = 1; i <= 20; i++) {
    const btn = document.createElement("button");
    const isLocked = i > maxLevel;
    const isCurrent = i === level;

    let className =
      "aspect-square rounded-xl font-bold text-lg flex flex-col items-center justify-center shadow-sm transition-all ";

    if (isLocked) {
      className += "bg-slate-300 text-slate-500 cursor-not-allowed";
      btn.innerHTML = `<span class="text-2xl">🔒</span>`;
    } else if (isCurrent) {
      className +=
        "bg-blue-600 text-white border-4 border-blue-300 shadow-lg scale-105 ring-2 ring-blue-400 ring-offset-2";
      btn.innerHTML = `<span>${i}</span><span class="text-[10px] uppercase font-bold mt-1">Main</span>`;
      btn.onclick = () => loadLevelFromSelect(i);
    } else {
      className +=
        "bg-blue-100 text-blue-600 border-2 border-blue-300 hover:bg-blue-200 hover:scale-105 active:scale-95";
      btn.innerHTML = `<span>${i}</span>`;
      btn.onclick = () => loadLevelFromSelect(i);
    }

    btn.className = className;
    levelGrid.appendChild(btn);
  }
}

function loadLevelFromSelect(selectedLevel) {
  SoundManager.playClick();
  closeLevelSelect();
  startScreenEl.style.transform = "translateY(-100%)";
  level = selectedLevel;
  score = 0;
  gameState = "playing";
  updateUI();
  generateLevel(level);
  saveGameProgress();
}

function nextLevel() {
  SoundManager.playClick();
  level++;
  StorageManager.saveMaxLevel(level);
  generateLevel(level);
  updateUI();
  hideOverlay();
  saveGameProgress();
}

function restartLevel() {
  SoundManager.playClick();
  hideOverlay();
  generateLevel(level);
}

function goToMainMenu() {
  SoundManager.playClick();
  closeSettingsModal();
  gameState = "menu";
  saveGameProgress();
  checkSaveGame();
  highScoreEl.innerText = StorageManager.getHighScore();
  startScreenEl.style.transform = "translateY(0%)";
}

function saveGameProgress() {
  if (gameState === "playing")
    StorageManager.save({ level, score, tiles, tray, gameState });
}

function generateLevel(currentLevel) {
  gameState = "playing";
  tiles = [];
  tray = [];
  isProcessingMatch = false;
  renderTray();
  const numTriples = 6 + currentLevel * 2;
  let availableKeys = [...ICON_KEYS].sort(() => 0.5 - Math.random());
  while (availableKeys.length < numTriples)
    availableKeys = [...availableKeys, ...ICON_KEYS];

  let tilePool = [];
  for (let i = 0; i < numTriples; i++) {
    const key = availableKeys[i % availableKeys.length];
    for (let j = 0; j < 3; j++) {
      tilePool.push({
        id: key,
        uid: Math.random().toString(36).substr(2, 9),
        ...ICONS[key],
      });
    }
  }
  tilePool.sort(() => 0.5 - Math.random());

  const layoutType = (currentLevel - 1) % 5;
  switch (layoutType) {
    case 0:
      generatePyramidLayout(tilePool);
      break;
    case 1:
      generateCircleLayout(tilePool);
      break;
    case 2:
      generateGridLayout(tilePool);
      break;
    case 3:
      generateSpiralLayout(tilePool);
      break;
    case 4:
      generateButterflyLayout(tilePool);
      break;
  }

  updateInteractability();
  renderBoard();
  saveGameProgress();

  // Pastikan layout diperbarui setelah render
  requestAnimationFrame(handleResize);
}

// --- GENERATOR LAYOUT FUNCTIONS (Sama seperti sebelumnya) ---
function generatePyramidLayout(pool) {
  let idx = 0;
  const layers = [
    { r: 5, c: 4, z: 0 },
    { r: 4, c: 3, z: 1 },
    { r: 3, c: 2, z: 2 },
    { r: 2, c: 2, z: 3 },
  ];
  const getOffset = (r, c) => ({
    x: -(c * TILE_SIZE) / 2 + TILE_SIZE / 2,
    y: -(r * TILE_SIZE) / 2 + TILE_SIZE / 2,
  });
  layers.forEach((l) => {
    const off = getOffset(l.r, l.c);
    for (let r = 0; r < l.r; r++) {
      for (let c = 0; c < l.c; c++) {
        if (idx < pool.length)
          addTile(
            pool[idx++],
            c * TILE_SIZE + off.x,
            r * TILE_SIZE + off.y,
            l.z,
            0
          );
      }
    }
  });
  addRemainingTiles(pool, idx);
}
function generateCircleLayout(pool) {
  let idx = 0;
  const rings = [
    { r: 0, c: 1, z: 3 },
    { r: 1.3, c: 6, z: 2 },
    { r: 2.6, c: 12, z: 1 },
    { r: 3.9, c: 18, z: 0 },
  ];
  rings.forEach((ring) => {
    const step = (Math.PI * 2) / ring.c;
    for (let i = 0; i < ring.c; i++) {
      if (idx >= pool.length) break;
      addTile(
        pool[idx++],
        ring.r * TILE_SIZE * Math.cos(i * step),
        ring.r * TILE_SIZE * Math.sin(i * step),
        ring.z,
        1
      );
    }
  });
  addRemainingTiles(pool, idx);
}
function generateGridLayout(pool) {
  let idx = 0;
  const grids = [
    { s: 6, z: 0 },
    { s: 4, z: 1 },
    { s: 2, z: 2 },
  ];
  grids.forEach((g) => {
    const offset = -((g.s * TILE_SIZE) / 2) + TILE_SIZE / 2;
    for (let r = 0; r < g.s; r++) {
      for (let c = 0; c < g.s; c++) {
        if (idx < pool.length) {
          if (g.z === 0 && r > 1 && r < 4 && c > 1 && c < 4) continue;
          addTile(
            pool[idx++],
            c * TILE_SIZE + offset,
            r * TILE_SIZE + offset,
            g.z,
            2
          );
        }
      }
    }
  });
  addRemainingTiles(pool, idx);
}
function generateSpiralLayout(pool) {
  let idx = 0,
    angle = 0,
    radius = 0;
  while (idx < pool.length && radius < TILE_SIZE * 5) {
    let z = Math.floor(4 - radius / (TILE_SIZE * 1.5));
    if (z < 0) z = 0;
    addTile(
      pool[idx++],
      radius * Math.cos(angle),
      radius * Math.sin(angle),
      z,
      3
    );
    angle += 0.6;
    radius += 4;
  }
  addRemainingTiles(pool, idx);
}
function generateButterflyLayout(pool) {
  let idx = 0;
  const coords = [
    { x: 0, y: 0, z: 3 },
    { x: 1.2, y: 1.2, z: 2 },
    { x: 1.2, y: -1.2, z: 2 },
    { x: -1.2, y: 1.2, z: 2 },
    { x: -1.2, y: -1.2, z: 2 },
    { x: 2.4, y: 2.4, z: 1 },
    { x: 2.4, y: -2.4, z: 1 },
    { x: -2.4, y: 2.4, z: 1 },
    { x: -2.4, y: -2.4, z: 1 },
    { x: 0, y: 1.5, z: 1 },
    { x: 0, y: -1.5, z: 1 },
  ];
  coords.forEach((p) => {
    if (idx < pool.length)
      addTile(pool[idx++], p.x * TILE_SIZE, p.y * TILE_SIZE, p.z, 4);
  });
  addRemainingTiles(pool, idx);
}

function addTile(tileData, x, y, z, layer) {
  tiles.push({
    ...tileData,
    x: x,
    y: y,
    z: z,
    layer: layer,
    isInteractable: true,
    isBlocked: false,
  });
}
function addRemainingTiles(pool, startIndex) {
  let poolIndex = startIndex;
  let row = 0,
    col = 0;
  const startY = TILE_SIZE * 3.5;
  const colsPerRow = 6;
  const startX = -((colsPerRow * TILE_SIZE) / 2) + TILE_SIZE / 2;
  while (poolIndex < pool.length) {
    const x = startX + col * TILE_SIZE;
    const y = startY + row * TILE_SIZE;
    addTile(pool[poolIndex++], x, y, 0, 0);
    col++;
    if (col >= colsPerRow) {
      col = 0;
      row++;
    }
  }
}

function updateInteractability() {
  tiles = tiles.map((tileA) => {
    const isBlocked = tiles.some((tileB) => {
      if (tileB.z <= tileA.z) return false;
      const overlapMargin = TILE_SIZE * 0.85;
      return (
        Math.abs(tileA.x - tileB.x) < overlapMargin &&
        Math.abs(tileA.y - tileB.y) < overlapMargin
      );
    });
    return { ...tileA, isBlocked };
  });
}

function handleTileClick(uid) {
  if (isProcessingMatch || gameState !== "playing") return;
  if (tray.length >= TRAY_CAPACITY) return;

  const tileIndex = tiles.findIndex((t) => t.uid === uid);
  if (tileIndex === -1) return;
  const tile = tiles[tileIndex];
  if (tile.isBlocked) return;

  SoundManager.playClick();
  tiles.splice(tileIndex, 1);
  tray.push(tile);

  updateInteractability();
  renderBoard();
  renderTray();
  saveGameProgress();
  checkMatch();
}

function checkMatch() {
  const counts = {};
  tray.forEach((t) => (counts[t.id] = (counts[t.id] || 0) + 1));
  const matchId = Object.keys(counts).find((key) => counts[key] >= 3);

  if (matchId) {
    isProcessingMatch = true;
    setTimeout(() => {
      SoundManager.playMatch();
      let removed = 0;
      tray = tray.filter((t) => {
        if (t.id === matchId && removed < 3) {
          removed++;
          return false;
        }
        return true;
      });
      score += 100;
      StorageManager.saveHighScore(score);
      updateUI();
      renderTray();
      saveGameProgress();
      isProcessingMatch = false;
      checkWinCondition();
    }, 300);
  } else {
    checkLoseCondition();
  }
  checkWinCondition();
}

function checkLoseCondition() {
  if (tray.length >= TRAY_CAPACITY) {
    gameState = "lost";
    StorageManager.clear();
    SoundManager.playLose();
    setTimeout(showLose, 500);
  }
}
function checkWinCondition() {
  if (tiles.length === 0 && tray.length === 0 && gameState === "playing") {
    gameState = "won";
    SoundManager.playWin();
    StorageManager.saveMaxLevel(level + 1);
    setTimeout(showWin, 500);
  }
}

function renderBoard() {
  boardEl.innerHTML = "";
  const sortedTiles = [...tiles].sort(
    (a, b) => a.z - b.z || a.layer - b.layer || a.y - b.y
  );
  sortedTiles.forEach((tile) => {
    const btn = document.createElement("button");
    btn.className = `absolute flex items-center justify-center rounded-xl border-b-[4px] tile-transition shadow-lg ${
      tile.isBlocked
        ? "bg-slate-300 border-slate-400 tile-blocked z-0 brightness-75 cursor-not-allowed"
        : "bg-white border-slate-200 tile-active hover:brightness-105 active:border-b-2 active:translate-y-0.5 cursor-pointer"
    }`;
    btn.style.width = `${TILE_SIZE}px`;
    btn.style.height = `${TILE_SIZE * 1.1}px`;
    btn.style.transform = `translate(${tile.x - TILE_SIZE / 2}px, ${
      tile.y - TILE_SIZE / 2
    }px)`;
    btn.style.zIndex = tile.z * 10 + tile.layer;
    btn.onclick = () => handleTileClick(tile.uid);
    btn.innerHTML = `<div class="${
      tile.isBlocked ? "text-slate-500 opacity-40" : tile.color
    } transition-colors duration-300">${tile.svg}</div>${
      !tile.isBlocked
        ? '<div class="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>'
        : ""
    }`;
    boardEl.appendChild(btn);
  });
}

function renderTray() {
  trayCountEl.innerText = tray.length;
  trayEl.innerHTML = "";
  tray.forEach((tile) => {
    const div = document.createElement("div");
    div.className =
      "bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center shadow-inner animate-pop border border-slate-200";
    div.style.width = `${TRAY_TILE_SIZE}px`;
    div.style.height = `${TRAY_TILE_SIZE}px`;
    div.innerHTML = `<div class="${tile.color} scale-90">${tile.svg}</div>`;
    trayEl.appendChild(div);
  });
  const emptySlots = TRAY_CAPACITY - tray.length;
  for (let i = 0; i < emptySlots; i++) {
    const div = document.createElement("div");
    div.className =
      "rounded-lg bg-slate-700/30 border border-slate-600/20 flex-shrink-0";
    div.style.width = `${TRAY_TILE_SIZE}px`;
    div.style.height = `${TRAY_TILE_SIZE}px`;
    trayEl.appendChild(div);
  }
}

function updateUI() {
  scoreEl.innerText = score;
  levelEl.innerText = `Level ${level}`;
}
function showSettingsModal() {
  SoundManager.playClick();
  settingsModal.classList.remove("hidden");
  setTimeout(() => settingsModal.classList.remove("opacity-0"), 10);
}
function closeSettingsModal() {
  settingsModal.classList.add("opacity-0");
  setTimeout(() => settingsModal.classList.add("hidden"), 300);
}
function showInfoModal() {
  SoundManager.playClick();
  if (!settingsModal.classList.contains("hidden")) closeSettingsModal();
  infoModal.classList.remove("hidden");
  setTimeout(() => infoModal.classList.remove("opacity-0"), 10);
}
function closeInfoModal() {
  SoundManager.playClick();
  infoModal.classList.add("opacity-0");
  setTimeout(() => infoModal.classList.add("hidden"), 300);
}
function toggleSound() {
  const enabled = SoundManager.toggle();
  document.getElementById("btn-sound").innerHTML = enabled
    ? "Suara: ON"
    : "Suara: OFF";
  SoundManager.playClick();
}
function showWin() {
  overlayEl.classList.remove("pointer-events-none", "opacity-0");
  overlayEl.querySelector("div").classList.remove("scale-90");
  overlayContentEl.innerHTML = `<div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">🏆</div><h2 class="text-xl font-black text-slate-800 mb-1">Level Selesai!</h2><button onclick="nextLevel()" class="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95">Lanjut Level ${
    level + 1
  }</button>`;
}
function showLose() {
  overlayEl.classList.remove("pointer-events-none", "opacity-0");
  overlayEl.querySelector("div").classList.remove("scale-90");
  overlayContentEl.innerHTML = `<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">👻</div><h2 class="text-xl font-bold text-slate-800 mb-1">Baki Penuh!</h2><button onclick="restartLevel()" class="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95">Coba Lagi</button>`;
}
function hideOverlay() {
  overlayEl.classList.add("pointer-events-none", "opacity-0");
  overlayEl.querySelector("div").classList.add("scale-90");
}

/**
 * LOGIKA POSISI BARU (RESPONSIVE FIX)
 */
function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;

  if (isLandscape) {
    // FIX: Ubah dari 65px menjadi 85px agar tray TURUN ke bawah header
    trayContainerWrapper.style.top = "85px";
  } else {
    trayContainerWrapper.style.top = "90px";
  }

  // Hitung Scale Tray agar muat di layar
  const maxAllowedTrayWidth = width - 40; // Beri margin lebih (20 -> 40)
  let newTrayScale = 1;

  if (BASE_TRAY_WIDTH > maxAllowedTrayWidth) {
    newTrayScale = maxAllowedTrayWidth / BASE_TRAY_WIDTH;
  }

  // Perkecil sedikit lagi di landscape agar tidak terlalu penuh
  if (isLandscape) newTrayScale *= 0.7;

  trayScalerEl.style.transform = `scale(${newTrayScale})`;

  // PENTING: Pastikan origin tetap top-center untuk perbaikan posisi tengah
  trayScalerEl.style.transformOrigin = "top center";

  // Hitung ulang posisi board
  const trayRealHeight = (isLandscape ? 60 : 80) * newTrayScale;
  const boardStartY =
    parseInt(trayContainerWrapper.style.top) +
    trayRealHeight +
    (isLandscape ? 10 : 20);

  let availableHeight = height - boardStartY - (isLandscape ? 10 : 40);
  if (availableHeight < 100) availableHeight = 100;

  const baseBoardSize = 500;
  const scaleX = (width - 20) / baseBoardSize;
  const scaleY = availableHeight / baseBoardSize;

  let newBoardScale = Math.min(scaleX, scaleY);
  newBoardScale = Math.min(newBoardScale, isLandscape ? 0.85 : 1.0);
  newBoardScale = Math.max(newBoardScale, 0.4);

  boardEl.style.marginTop = `${boardStartY}px`;
  boardEl.style.transform = `scale(${newBoardScale})`;
}

window.addEventListener("resize", handleResize);

// UNLOCK AUDIO PADA SENTUHAN PERTAMA
document.body.addEventListener(
  "click",
  function () {
    if (SoundManager.ctx && SoundManager.ctx.state === "suspended") {
      SoundManager.ctx.resume();
    }
    SoundManager.startBGM();
  },
  { once: true }
); // Hanya jalan sekali
