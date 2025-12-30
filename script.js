// --- UBAH SoundManager (script.js bagian atas) ---
const SoundManager = {
  ctx: null,
  enabled: true,
  bgmAudio: null,

  init: function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.bgmAudio = document.getElementById("bgm-audio");
    if (this.bgmAudio) {
      this.bgmAudio.volume = bgmVolume; // Gunakan variabel global
    }
  },

  setBGMVol: function (val) {
    bgmVolume = val;
    if (this.bgmAudio) this.bgmAudio.volume = val;
  },

  startBGM: function () {
    if (this.bgmAudio && bgmVolume > 0) {
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    }
  },

  playTone: function (freq, type, duration, vol = 0.1) {
    if (!this.ctx || sfxVolume <= 0) return; // Cek SFX volume
    if (this.ctx.state === "suspended") this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Kalikan volume suara dengan volume setting global (sfxVolume)
    const finalVol = vol * sfxVolume;

    gain.gain.setValueAtTime(finalVol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  // ... (fungsi playClick, playMatch, dll biarkan sama, playTone di atas sudah handle volume)
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
  saveBestTime: function (seconds) {
    // Simpan jika belum ada (0) atau jika waktu baru lebih cepat (lebih kecil)
    const current = parseInt(
      localStorage.getItem("tileExplorerBestTime") || "0"
    );
    if (current === 0 || seconds < current) {
      localStorage.setItem("tileExplorerBestTime", seconds);
    }
  },
  getBestTime: function () {
    return parseInt(localStorage.getItem("tileExplorerBestTime") || "0");
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
    // Kode lama hanya menyimpan jika lvl > current.
    // Kita biarkan ini untuk progress normal.
    if (lvl > current) localStorage.setItem("tileExplorerMaxLevel", lvl);
  },

  // --- TAMBAHAN BARU: FUNGSI KHUSUS RESET ---
  resetMaxLevel: function () {
    // Paksa tulis ulang jadi 1 tanpa pengecekan
    localStorage.setItem("tileExplorerMaxLevel", 1);
  },
  getMaxLevel: function () {
    return parseInt(localStorage.getItem("tileExplorerMaxLevel") || "1");
  },
  setGameCompleted: function () {
    localStorage.setItem("tileExplorerCompleted", "true");
  },
  isGameCompleted: function () {
    return localStorage.getItem("tileExplorerCompleted") === "true";
  },
};

const TILE_SIZE = 75; // Perkecil dari 88 ke 75 agar base-nya lebih ramah layar HP
const TRAY_TILE_SIZE = 65;
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
  compass: {
    color: "text-blue-600",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  },
  map: {
    color: "text-amber-700",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  },
  gem: {
    color: "text-red-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/></svg>',
  },
  chest: {
    color: "text-yellow-600",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M12 6V4a2 2 0 0 1 2-2h-4a2 2 0 0 1 2 2v2"/><path d="M12 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/></svg>',
  },
  skull: {
    color: "text-slate-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.667.667 1.333 1 2 1s1.333-.333 2-1"/><path d="M12 2C6.477 2 2 6.477 2 12c0 2.8 1.4 5.2 3.8 6.8.6.4 1.2 1.2 1.2 2.2v1h10v-1c0-1 .6-1.8 1.2-2.2 2.4-1.6 3.8-4 3.8-6.8 0-5.523-4.477-10-10-10Z"/></svg>',
  },
  key: {
    color: "text-yellow-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>',
  },
  sword: {
    color: "text-slate-400",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>',
  },
  potion: {
    color: "text-pink-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z"/><path d="M12 2v5"/><path d="m7 7 2-2"/><path d="m17 7-2-2"/></svg>',
  },
  crown: {
    color: "text-amber-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>',
  },
  anchor: {
    color: "text-indigo-600",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>',
  },
  fire: {
    color: "text-orange-500",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  },
  leaf: {
    color: "text-green-600",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  },
};
const ICON_KEYS = Object.keys(ICONS);

let tiles = [];
let tray = [];
let score = 0;
let levelStartScore = 0; // VARIABEL BARU: Untuk menyimpan skor checkpoint
let level = 1;
let isProcessingMatch = false;
let gameState = "menu";
// --- TAMBAHAN BARU: MODE DEVELOPER ---
let userIP = "";
let isDeveloper = false;
// Ganti IP di bawah ini dengan IP yang nanti muncul di layar Anda
const DEVELOPER_IPS = [
  // "182.8.227.167"
];
// --- UBAH & TAMBAH VARIABEL GLOBAL (script.js) ---
let hintsRemaining = 3; // Jatah bantuan per level
const MAX_HINTS = 3;
let sfxVolume = 0.8;
let bgmVolume = 0.4;
let lastBgmVol = 50; // Menyimpan volume terakhir sebelum mute
let lastSfxVol = 80;
let isBgmMuted = false;
let isSfxMuted = false;
let gameTimeSeconds = 0;
let timerInterval = null;
const HINT_COST = 500; // Biaya penggunaan bantuan

const boardEl = document.getElementById("board-container");
const trayEl = document.getElementById("tray-content");
const trayCountEl = document.getElementById("tray-count");
const overlayEl = document.getElementById("overlay");
const overlayContentEl = document.getElementById("overlay-content");
const trayScalerEl = document.getElementById("tray-scaler");
const startScreenEl = document.getElementById("start-screen");
const highScoreEl = document.getElementById("high-score-display");
const btnContinue = document.getElementById("btn-continue");
const settingsModal = document.getElementById("settings-modal");
const infoModal = document.getElementById("info-modal");
const levelSelectModal = document.getElementById("level-select-modal");
const levelGrid = document.getElementById("level-grid");
const trayContainerWrapper = document.getElementById("tray-container-wrapper"); // Ambil elemen wrapper

// --- UBAH BAGIAN WINDOW LOAD (script.js) ---
window.addEventListener("load", () => {
  // Update tampilan awal
  highScoreEl.innerText = StorageManager.getHighScore();

  // Panggil fungsi cek save (yang sekarang juga mengupdate Best Time)
  checkSaveGame();

  fetchUserIP();

  const savedTheme = StorageManager.getTheme();
  // Validasi tema (kode tema tetap sama...)
  const validThemes = [
    "theme-ocean",
    "theme-sakura",
    "theme-cyberpunk",
    "theme-galaxy",
    "theme-forest",
    "theme-candy",
    "theme-royal",
    "theme-retro",
    "theme-matrix",
    "theme-sunset",
  ];

  if (savedTheme && validThemes.includes(savedTheme)) {
    changeTheme(savedTheme, false);
  } else {
    changeTheme("theme-ocean", false);
  }

  // --- PERBAIKAN ERROR LEVEL EL ---
  // Kita harus mendefinisikan levelEl di sini sebelum menggunakannya
  const levelEl = document.getElementById("level-display");

  if (levelEl) {
    levelEl.style.cursor = "pointer";
    levelEl.classList.add(
      "hover:scale-105",
      "active:scale-95",
      "transition-transform"
    );

    levelEl.addEventListener("click", () => {
      SoundManager.playClick();
      showLevelSelect();
    });
  }

  // Init Audio (tetap sama...)
  const initAudio = () => {
    SoundManager.init();
    document.body.removeEventListener("click", initAudio);
    document.body.removeEventListener("touchstart", initAudio);
  };
  document.body.addEventListener("click", initAudio);
  document.body.addEventListener("touchstart", initAudio);

  handleResize();
});

// --- UBAH FUNGSI changeTheme (script.js) ---
function changeTheme(themeName, playSound = true) {
  const body = document.getElementById("game-body");

  // Daftar tema dark mode
  const darkThemes = [
    "theme-cyberpunk",
    "theme-galaxy",
    "theme-royal",
    "theme-retro",
    "theme-matrix",
  ];

  // Daftar semua tema untuk dihapus sebelum nambah yang baru
  const allThemes = [
    "theme-ocean",
    "theme-sakura",
    "theme-cyberpunk",
    "theme-galaxy",
    "theme-forest",
    "theme-candy",
    "theme-royal",
    "theme-retro",
    "theme-matrix",
    "theme-sunset",
  ];

  // Hapus tema lama
  body.classList.remove(...allThemes);

  // Tambah tema baru
  body.classList.add(themeName);

  // Cek Dark Mode
  if (darkThemes.includes(themeName)) {
    body.classList.add("text-slate-100");
    body.classList.remove("text-slate-800");
  } else {
    body.classList.add("text-slate-800");
    body.classList.remove("text-slate-100");
  }

  StorageManager.saveTheme(themeName);

  if (playSound) SoundManager.playClick();

  // --- TAMBAHAN BARU: TUTUP MODAL OTOMATIS ---
  // Menutup popup pengaturan atau info setelah memilih
  closeSettingsModal();
  closeInfoModal();
}

function checkSaveGame() {
  const save = StorageManager.load();
  const scoreLabel = document.querySelector("#start-screen .text-xs.font-bold");
  const bestTime = StorageManager.getBestTime();
  const bestTimeEl = document.getElementById("best-time-display");
  if (bestTimeEl) {
    bestTimeEl.innerText = bestTime > 0 ? formatTime(bestTime) : "--:--";
  }
  if (save && save.gameState === "playing") {
    btnContinue.classList.remove("hidden");

    // PERBAIKAN: Tampilkan skor dari save game terakhir, bukan high score
    highScoreEl.innerText = save.score;

    // Ubah label agar pemain paham ini skor mereka saat ini
    if (scoreLabel) scoreLabel.innerText = "SKOR SAAT INI";
  } else {
    btnContinue.classList.add("hidden");

    // Jika tidak ada save, kembalikan ke High Score
    highScoreEl.innerText = StorageManager.getHighScore();
    if (scoreLabel) scoreLabel.innerText = "SKOR TERTINGGI";
  }
}

// --- UBAH FUNGSI RESET GAME (script.js) ---

const newGameModal = document.getElementById("new-game-modal");

// 1. Tampilkan Popup Konfirmasi
function confirmNewGame() {
  SoundManager.playClick();
  newGameModal.classList.remove("hidden");
  setTimeout(() => newGameModal.classList.remove("opacity-0"), 10);
}

// 2. Tutup Popup
function closeNewGameModal() {
  SoundManager.playClick();
  newGameModal.classList.add("opacity-0");
  setTimeout(() => newGameModal.classList.add("hidden"), 300);
}

// --- UBAH FUNGSI executeNewGame DI SCRIPT.JS ---
function executeNewGame() {
  closeNewGameModal();

  level = 1;
  score = 0;
  levelStartScore = 0;

  // GUNAKAN FUNGSI BARU INI
  StorageManager.resetMaxLevel();

  // Hapus status tamat
  localStorage.removeItem("tileExplorerCompleted");

  // Render ulang kotak level agar gemboknya muncul lagi
  renderLevelGrid();

  startScreenEl.style.transform = "translateY(-100%)";
  gameState = "playing";

  updateUI();
  generateLevel(level);
  saveGameProgress();
}

// --- UBAH continueGame DI SCRIPT.JS ---
function continueGame() {
  const save = StorageManager.load();
  if (save) {
    level = save.level;
    score = save.score;
    levelStartScore =
      save.levelStartScore !== undefined ? save.levelStartScore : save.score;
    tiles = save.tiles;
    tray = save.tray;

    // --- TAMBAHAN BARU: Muat Bantuan & Waktu ---

    // 1. Muat Sisa Bantuan (Default 3 jika data lama tidak ada)
    hintsRemaining =
      save.hintsRemaining !== undefined ? save.hintsRemaining : 3;

    // 2. Muat Waktu Berjalan (Default 0)
    gameTimeSeconds =
      save.gameTimeSeconds !== undefined ? save.gameTimeSeconds : 0;

    // 3. Update Tampilan Badge Bantuan
    const hintBadge = document.getElementById("hint-count");
    if (hintBadge) hintBadge.innerText = hintsRemaining;

    // 4. Update Tampilan Timer
    updateTimerUI();

    // ---------------------------------------------

    startScreenEl.style.transform = "translateY(-100%)";
    gameState = "playing";

    updateUI();
    renderBoard();
    renderTray();
    handleResize();

    // 5. Jalankan Waktu Kembali
    startTimer();

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

// --- UBAH FUNGSI showLevelSelect (script.js) ---
function showLevelSelect() {
  SoundManager.playClick();

  // --- TAMBAHKAN BARIS INI ---
  // Ini memaksa kotak level digambar ulang sesuai data terbaru (Terkunci/Terbuka)
  renderLevelGrid();
  // ---------------------------

  levelSelectModal.classList.remove("hidden");
  setTimeout(() => levelSelectModal.classList.remove("opacity-0"), 10);
}

function closeLevelSelect() {
  SoundManager.playClick();
  levelSelectModal.classList.add("opacity-0");
  setTimeout(() => levelSelectModal.classList.add("hidden"), 300);
}

// --- UBAH renderLevelGrid DI SCRIPT.JS ---
function renderLevelGrid() {
  levelGrid.innerHTML = "";
  const maxLevel = StorageManager.getMaxLevel();
  const isGameFinished = StorageManager.isGameCompleted();
  const save = StorageManager.load(); // Load data save untuk pengecekan

  for (let i = 1; i <= 20; i++) {
    const btn = document.createElement("button");
    const isLocked = i > maxLevel && !isDeveloper;
    const isCurrent = i === maxLevel;
    const isPast = i < maxLevel;

    // Styling Dasar
    btn.className =
      "relative w-full aspect-square rounded-2xl font-black text-lg shadow-md transition-all flex flex-col items-center justify-center gap-1 border-b-4 active:border-b-0 active:translate-y-1";

    if (isDeveloper) {
      // DEVELOPER
      btn.classList.add("bg-purple-500", "border-purple-700", "text-white");
      btn.innerHTML = `<span class="text-2xl">${i}</span><span class="text-[8px] opacity-70">DEV</span>`;
      btn.onclick = () => loadLevelFromSelect(i);
    } else if (isCurrent) {
      // LEVEL SAAT INI (Modifikasi Logika Lanjut)

      // Cek apakah ada save data untuk level ini
      if (save && save.level === i && save.gameState === "playing") {
        // JIKA ADA SAVE: TOMBOL JADI HIJAU & LANJUTKAN
        btn.classList.add(
          "bg-green-500", // Ganti warna jadi hijau agar beda
          "border-green-700",
          "text-white",
          "animate-pulse"
        );
        btn.innerHTML = `<span class="text-2xl drop-shadow-md">${i}</span><span class="text-[8px] font-bold bg-white/20 px-1 rounded">LANJUT</span>`;

        // Aksi tombol: Tutup modal lalu Lanjutkan Game
        btn.onclick = () => {
          SoundManager.playClick();
          closeLevelSelect();
          continueGame();
        };
      } else {
        // JIKA TIDAK ADA SAVE: TOMBOL BIRU & MAIN BARU
        btn.classList.add(
          "bg-blue-500",
          "border-blue-700",
          "text-white",
          "animate-pulse"
        );
        btn.innerHTML = `<span class="text-2xl drop-shadow-md">${i}</span><span class="text-[8px] font-bold bg-white/20 px-1 rounded">MAIN</span>`;
        btn.onclick = () => loadLevelFromSelect(i);
      }
    } else if (isPast) {
      // LEVEL MASA LALU
      btn.classList.add("bg-green-500", "border-green-700", "text-white");

      if (!isGameFinished) {
        btn.innerHTML = `<span class="text-xl opacity-80">${i}</span><span class="text-[10px]">✅</span>`;
        btn.onclick = () => showRestrictionModal();
      } else {
        btn.innerHTML = `<span class="text-2xl">${i}</span><span class="text-[8px]">ULANG</span>`;
        btn.onclick = () => loadLevelFromSelect(i);
      }
    } else {
      // TERKUNCI
      btn.classList.add("bg-slate-200", "border-slate-300", "text-slate-400");
      btn.innerHTML = `<span class="text-xl">🔒</span>`;
      btn.disabled = true;
    }

    levelGrid.appendChild(btn);
  }
}

// --- UBAH FUNGSI loadLevelFromSelect (script.js) ---
function loadLevelFromSelect(selectedLevel) {
  SoundManager.playClick();

  // CEK APAKAH PEMAIN SEDANG PUNYA PROGRES SKOR?
  // Jika skor > 0 dan sedang main/pause, tampilkan peringatan reset
  if (
    score > 0 &&
    gameState !== "menu" &&
    gameState !== "won" &&
    gameState !== "lost"
  ) {
    showLevelConfirmModal(selectedLevel);
  } else {
    // Jika skor 0 atau baru mulai, langsung pindah tanpa tanya
    // Reuse fungsi executeLevelJump agar kode tidak duplikat
    // Kita panggil closeLevelSelect dulu manual karena executeLevelJump memanggilnya juga
    closeLevelSelect();

    startScreenEl.style.transform = "translateY(-100%)";
    level = selectedLevel;
    score = 0;
    levelStartScore = 0;
    gameState = "playing";
    updateUI();
    generateLevel(level);
    saveGameProgress();
  }
}

function nextLevel() {
  SoundManager.playClick();
  level++;
  levelStartScore = score;
  StorageManager.saveMaxLevel(level);
  generateLevel(level);
  updateUI();
  hideOverlay();
  saveGameProgress();
}

// --- UPDATE restartLevel DI SCRIPT.JS ---
function restartLevel() {
  SoundManager.playClick();

  // Tutup semua kemungkinan modal yang terbuka
  hideOverlay(); // Tutup layar kalah
  closeSettingsModal(); // Tutup layar pengaturan

  // RESET SKOR ke kondisi awal level
  score = levelStartScore;

  updateUI();

  // Generate Level ulang
  // (Fungsi generateLevel otomatis mereset Waktu jadi 0 dan Bantuan jadi 3)
  generateLevel(level);

  // Tampilkan notifikasi kecil (opsional/log console)
  console.log(`Level ${level} di-restart. Skor kembali ke ${score}`);
}

// --- UBAH FUNGSI goToMainMenu (Baris ~420) ---
function goToMainMenu() {
  SoundManager.playClick();
  closeSettingsModal();

  // PERBAIKAN 1: Simpan progress DULUAN sebelum mengubah status game.
  // Di kode lama, status diubah jadi 'menu' dulu, sehingga saveGameProgress()
  // tidak berfungsi (karena ia butuh status 'playing' untuk mau menyimpan).
  saveGameProgress();

  gameState = "menu";

  // Update tampilan tombol 'Lanjutkan' dan 'Skor Saat Ini'
  checkSaveGame();

  // PERBAIKAN 2: HAPUS baris di bawah ini yang ada di kode lama.
  // Baris ini yang menyebabkan skor saat ini tertimpa kembali jadi skor tertinggi.
  // highScoreEl.innerText = StorageManager.getHighScore(); <--- SUDAH DIHAPUS

  startScreenEl.style.transform = "translateY(0%)";
}

function saveGameProgress() {
  if (gameState === "playing")
    StorageManager.save({
      level,
      score,
      levelStartScore,
      tiles,
      tray,
      gameState,
      hintsRemaining,
      gameTimeSeconds,
    });
}

function generateLevel(currentLevel) {
  gameState = "playing";
  tiles = [];
  tray = [];
  isProcessingMatch = false;

  // RESET HINT SETIAP LEVEL
  hintsRemaining = 3;
  const hintBadge = document.getElementById("hint-count");
  if (hintBadge) hintBadge.innerText = hintsRemaining;

  // RESET TIMER LEVEL
  gameTimeSeconds = 0;
  updateTimerUI();
  startTimer(); // Mulai waktu

  renderTray();
  let numTriples;
  if (currentLevel >= 55) {
    // KHUSUS LEVEL 55 KE ATAS:
    // Kita kunci jumlah ubin di angka 100 set (total 300 ubin).
    // Ini sedikit dikurangi dari rumus asli agar muat di layar dan tidak lag.
    // Jumlah ini tidak akan bertambah lagi meskipun level naik ke 60, 70, dst.
    numTriples = 100;
  } else {
    // LEVEL 1 - 54:
    // Jumlah ubin bertambah secara normal (+2 set per level)
    numTriples = 6 + currentLevel * 2;
  }
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

  let layoutType;

  if (currentLevel >= 50) {
    // KHUSUS LEVEL 50+: Hapus tata letak Lingkaran (Case 1)
    // Kita hanya pakai: 0 (Pyramid), 2 (Grid), 3 (Spiral), 4 (Butterfly)
    const allowedLayouts = [0, 2, 4];
    const index = (currentLevel - 1) % allowedLayouts.length;
    layoutType = allowedLayouts[index];
  } else {
    // LEVEL DI BAWAH 50: Pakai semua 5 tata letak termasuk Lingkaran
    layoutType = (currentLevel - 1) % 5;
  }

  switch (layoutType) {
    case 0:
      generatePyramidLayout(tilePool);
      break;
    case 1:
      generateCircleLayout(tilePool); // Tidak akan dipanggil di level 50+
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
  setTimeout(() => {
    handleResize();
  }, 50);
  // Pastikan layout diperbarui setelah render
  requestAnimationFrame(handleResize);
}

// --- UPDATE GENERATOR LAYOUT (VERSI RAPAT/COMPACT) ---

// 1. SPIRAL GALAXY (Lebih Rapat)
function generateSpiralLayout(pool) {
  let idx = 0;
  // Pusat
  if (idx < pool.length) addTile(pool[idx++], 0, 0, 0, 0);

  let layer = 1;
  while (idx < pool.length) {
    // PENGATURAN JARAK: Dikurangi drastis
    // Dulu 1.02, sekarang 0.95 (sedikit overlap biar hemat tempat)
    let currentRadius = layer * (TILE_SIZE * 0.92);

    let circumference = 2 * Math.PI * currentRadius;
    let countInLayer = Math.floor(circumference / (TILE_SIZE * 0.95)); // Rapatkan ubin bersebelahan

    let stepAngle = (Math.PI * 2) / countInLayer;
    let angleOffset = layer * 0.5;

    for (let i = 0; i < countInLayer; i++) {
      if (idx >= pool.length) break;
      let angle = i * stepAngle + angleOffset;
      addTile(
        pool[idx++],
        currentRadius * Math.cos(angle),
        currentRadius * Math.sin(angle),
        0,
        0
      );
    }
    layer++;
  }
}

// --- UPDATE generateCircleLayout (SANGAT RAPAT/ULTRA COMPACT) ---
function generateCircleLayout(pool) {
  let idx = 0;
  // Pusat
  if (idx < pool.length) addTile(pool[idx++], 0, 0, 0, 0);

  // KONFIGURASI BARU: Jari-jari (r) dikurangi drastis
  // Sebelumnya r naik +1.1 per ring. Sekarang hanya +0.85 (Sangat Rapat)
  const rings = [
    { r: 1.0, c: 6 }, // Ring 1 (Sangat dekat pusat)
    { r: 1.85, c: 12 }, // Ring 2 (Mulai menumpuk)
    { r: 2.7, c: 19 }, // Ring 3
    { r: 3.55, c: 26 }, // Ring 4
    { r: 4.4, c: 32 }, // Ring 5
    { r: 5.25, c: 40 }, // Ring 6 (Untuk level sangat tinggi)
  ];

  rings.forEach((ring) => {
    const step = (Math.PI * 2) / ring.c;
    for (let i = 0; i < ring.c; i++) {
      if (idx >= pool.length) break;

      // Radius dikali TILE_SIZE
      const finalR = ring.r * TILE_SIZE;

      addTile(
        pool[idx++],
        finalR * Math.cos(i * step),
        finalR * Math.sin(i * step),
        0,
        0
      );
    }
  });

  // Jika masih ada sisa, lempar ke fungsi sisa yang juga sudah dipadatkan
  addRemainingTiles(pool, idx);
}

// --- GANTI addRemainingTiles DI SCRIPT.JS ---
function addRemainingTiles(pool, startIndex) {
  // JIKA LEVEL 50+, GUNAKAN POLA KOTAK (BOX) AGAR TIDAK MELEBAR KELUAR LAYAR
  if (level >= 50) {
    addRemainingTilesBox(pool, startIndex);
    return;
  }

  // --- LOGIKA LAMA (LINGKARAN) UNTUK LEVEL < 50 ---
  let idx = startIndex;
  let layer = 5.5;

  while (idx < pool.length) {
    let currentRadius = layer * (TILE_SIZE * 0.85);
    let circumference = 2 * Math.PI * currentRadius;
    let countInLayer = Math.floor(circumference / (TILE_SIZE * 0.85));
    let stepAngle = (Math.PI * 2) / countInLayer;

    for (let i = 0; i < countInLayer; i++) {
      if (idx >= pool.length) break;
      let angle = i * stepAngle;
      addTile(
        pool[idx++],
        currentRadius * Math.cos(angle),
        currentRadius * Math.sin(angle),
        0,
        0
      );
    }
    layer++;
  }
}

// --- TAMBAHKAN FUNGSI BARU INI DI BAWAHNYA ---
function addRemainingTilesBox(pool, startIndex) {
  let idx = startIndex;

  // Mulai dari layer 3 (agar tidak menumpuk dengan grid dasar 5x5)
  // Layer merepresentasikan "cincin kotak" ke-berapa dari pusat
  let layer = 3;

  while (idx < pool.length) {
    // Tentukan batas koordinat untuk layer kotak ini
    let start = -layer * (TILE_SIZE * 0.95); // Sedikit dirapatkan (0.95)
    let end = layer * (TILE_SIZE * 0.95);
    let step = TILE_SIZE * 0.95;

    // 1. Sisi Atas (Kiri ke Kanan)
    for (let x = start; x < end; x += step) {
      if (idx >= pool.length) return;
      addTile(pool[idx++], x, start, 0, 0);
    }

    // 2. Sisi Kanan (Atas ke Bawah)
    for (let y = start; y < end; y += step) {
      if (idx >= pool.length) return;
      addTile(pool[idx++], end, y, 0, 0);
    }

    // 3. Sisi Bawah (Kanan ke Kiri)
    for (let x = end; x > start; x -= step) {
      if (idx >= pool.length) return;
      addTile(pool[idx++], x, end, 0, 0);
    }

    // 4. Sisi Kiri (Bawah ke Atas)
    for (let y = end; y > start; y -= step) {
      if (idx >= pool.length) return;
      addTile(pool[idx++], start, y, 0, 0);
    }

    layer++; // Pindah ke kotak yang lebih luar
  }
}

// 2. PYRAMID / GRID (Padat)
function generatePyramidLayout(pool) {
  let idx = 0;
  const size = Math.ceil(Math.sqrt(pool.length));
  // Offset agar benar-benar tengah
  const startOffset = -((size * TILE_SIZE) / 2) + TILE_SIZE / 2;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (idx >= pool.length) break;
      addTile(
        pool[idx++],
        startOffset + c * TILE_SIZE,
        startOffset + r * TILE_SIZE,
        0,
        0
      );
    }
  }
  addRemainingTiles(pool, idx);
}

// 3. BUTTERFLY (Dirapatkan Koordinatnya)
function generateButterflyLayout(pool) {
  let idx = 0;
  // Koordinat diperkecil pengalinya agar lebih rapat
  const scale = 1.1; // Jarak antar ubin
  const coords = [
    { x: 0, y: 0 },
    { x: 1.0, y: 1.0 },
    { x: 1.0, y: -1.0 },
    { x: -1.0, y: 1.0 },
    { x: -1.0, y: -1.0 },
    { x: 2.0, y: 2.0 },
    { x: 2.0, y: -2.0 },
    { x: -2.0, y: 2.0 },
    { x: -2.0, y: -2.0 },
    { x: 0, y: 1.8 },
    { x: 0, y: -1.8 },
    { x: 2.8, y: 0 },
    { x: -2.8, y: 0 },
    { x: 1.4, y: 0 },
    { x: -1.4, y: 0 },
  ];
  coords.forEach((p) => {
    if (idx < pool.length)
      addTile(
        pool[idx++],
        p.x * TILE_SIZE * scale,
        p.y * TILE_SIZE * scale,
        0,
        0
      );
  });
  addRemainingTiles(pool, idx);
}

// 4. GRID (Flat)
function generateGridLayout(pool) {
  let idx = 0;
  // Buat grid 5x5 standar, tanpa tumpukan (Z selalu 0)
  const size = 5;
  const offset = -((size * TILE_SIZE) / 2) + TILE_SIZE / 2;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (idx < pool.length) {
        addTile(
          pool[idx++],
          c * TILE_SIZE + offset,
          r * TILE_SIZE + offset,
          0,
          0
        );
      }
    }
  }
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
    stopTimer(); // Stop waktu saat kalah
    SoundManager.playLose();
    setTimeout(showLose, 500);
  }
}
// --- UBAH checkWinCondition DI SCRIPT.JS ---
function checkWinCondition() {
  if (tiles.length === 0 && tray.length === 0 && gameState === "playing") {
    gameState = "won";
    stopTimer();
    SoundManager.playWin();

    StorageManager.saveMaxLevel(level + 1);

    if (level >= 20) {
      StorageManager.setGameCompleted();
    }

    // --- LOGIKA SKOR BARU ---
    // Hitung skor dasar yang didapat dari level ini (Total skor sekarang - skor awal level)
    // Tapi karena match score sudah ditambahkan real-time, kita hanya hitung bonus waktu sekarang.

    const timeLimit = 300; // 5 menit
    let timeBonus = 0;

    // Hitung bonus
    if (gameTimeSeconds < timeLimit) {
      timeBonus = (timeLimit - gameTimeSeconds) * 5;
    }

    // Tambahkan bonus ke skor total
    score += timeBonus;

    StorageManager.saveHighScore(score);
    StorageManager.saveBestTime(gameTimeSeconds);

    // Tampilkan Popup dengan Rincian
    setTimeout(() => {
      showWin(timeBonus);
    }, 500);
  }
}

// --- UBAH showWin DI SCRIPT.JS ---
function showWin(bonus = 0) {
  overlayEl.classList.remove("pointer-events-none", "opacity-0");
  overlayEl.querySelector("div").classList.remove("scale-90");

  // Format waktu
  const timeStr = formatTime(gameTimeSeconds);

  // Hitung Skor Dasar (Total saat ini dikurangi bonus yang baru ditambahkan)
  const baseScore = score - bonus;

  // HTML Popup Baru dengan Rincian Penjumlahan
  overlayContentEl.innerHTML = `
    <div class="relative pt-2">
      <div class="w-20 h-20 bg-yellow-100 border-4 border-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg animate-bounce">
        <span class="text-4xl">🏆</span>
      </div>
      
      <h2 class="text-2xl font-black text-slate-800 mb-1 tracking-tight">LEVEL ${level} SELESAI!</h2>
      <p class="text-xs text-slate-500 mb-5 font-bold tracking-widest uppercase">Luar Biasa!</p>

      <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-inner mb-5 text-sm w-full max-w-[280px] mx-auto relative overflow-hidden">
        <div class="absolute -right-4 -top-4 text-slate-100 text-6xl opacity-50 rotate-12 select-none">#</div>
        
        <div class="relative z-10 space-y-2">
            <div class="flex justify-between items-center text-slate-500 text-xs font-medium">
            <span>⏱️ Waktu:</span>
            <span class="font-mono">${timeStr}</span>
            </div>

            <div class="w-full h-px bg-slate-200"></div>

            <div class="flex justify-between items-center text-slate-600">
            <span>Skor Permainan</span>
            <span class="font-bold text-slate-700">${baseScore}</span>
            </div>
            
            <div class="flex justify-between items-center text-green-600">
            <span>Bonus Waktu</span>
            <span class="font-bold">+${bonus}</span>
            </div>
            
            <div class="w-full border-t-2 border-dashed border-slate-300 my-1"></div>

            <div class="flex justify-between items-center text-slate-800 pt-1">
            <span class="font-black text-sm uppercase">Total Poin</span>
            <span class="font-black text-2xl text-orange-500 drop-shadow-sm">${score}</span>
            </div>
        </div>
      </div>

      <button onclick="nextLevel()" class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 group">
        <span>Lanjut Level ${level + 1}</span>
        <div class="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </div>
      </button>
    </div>
  `;
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

// --- GANTI FUNGSI updateUI DENGAN INI (script.js) ---
function updateUI() {
  // Ambil elemen secara langsung saat fungsi dipanggil agar akurat
  const uiScore = document.getElementById("score-display");
  const uiLevel = document.getElementById("level-display");

  if (uiScore) uiScore.innerText = score;
  if (uiLevel) uiLevel.innerText = `Level ${level}`;
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

function showLose() {
  overlayEl.classList.remove("pointer-events-none", "opacity-0");
  overlayEl.querySelector("div").classList.remove("scale-90");
  overlayContentEl.innerHTML = `<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">👻</div><h2 class="text-xl font-bold text-slate-800 mb-1">Baki Penuh!</h2><button onclick="restartLevel()" class="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95">Coba Lagi</button>`;
}
function hideOverlay() {
  overlayEl.classList.add("pointer-events-none", "opacity-0");
  overlayEl.querySelector("div").classList.add("scale-90");
}

// --- UPDATE FITUR SUARA (script.js) ---

function updateVolume(type, val) {
  const intVal = parseInt(val);
  const decimalVal = intVal / 100;

  if (type === "bgm") {
    // Logic Slider BGM
    SoundManager.setBGMVol(decimalVal);
    document.getElementById("bgm-val").innerText = intVal + "%";

    // Auto update icon state
    if (intVal > 0) {
      isBgmMuted = false;
      document.getElementById("icon-bgm-on").classList.remove("hidden");
      document.getElementById("icon-bgm-off").classList.add("hidden");
      lastBgmVol = intVal; // Simpan preferensi terakhir
    } else {
      isBgmMuted = true;
      document.getElementById("icon-bgm-on").classList.add("hidden");
      document.getElementById("icon-bgm-off").classList.remove("hidden");
    }
  } else {
    // Logic Slider SFX
    sfxVolume = decimalVal;
    document.getElementById("sfx-val").innerText = intVal + "%";

    // Auto update icon state
    if (intVal > 0) {
      isSfxMuted = false;
      document.getElementById("icon-sfx-on").classList.remove("hidden");
      document.getElementById("icon-sfx-off").classList.add("hidden");
      lastSfxVol = intVal;
    } else {
      isSfxMuted = true;
      document.getElementById("icon-sfx-on").classList.add("hidden");
      document.getElementById("icon-sfx-off").classList.remove("hidden");
    }
  }
}

function toggleMute(type) {
  SoundManager.playClick();

  if (type === "bgm") {
    const slider = document.getElementById("slider-bgm");
    if (isBgmMuted) {
      // UNMUTE: Restore ke nilai terakhir (atau 50 jika 0)
      const restoreVal = lastBgmVol > 0 ? lastBgmVol : 50;
      slider.value = restoreVal;
      updateVolume("bgm", restoreVal);
    } else {
      // MUTE: Set ke 0
      lastBgmVol = parseInt(slider.value); // Simpan nilai sebelum dimatikan
      slider.value = 0;
      updateVolume("bgm", 0);
    }
  } else {
    const slider = document.getElementById("slider-sfx");
    if (isSfxMuted) {
      // UNMUTE
      const restoreVal = lastSfxVol > 0 ? lastSfxVol : 80;
      slider.value = restoreVal;
      updateVolume("sfx", restoreVal);
    } else {
      // MUTE
      lastSfxVol = parseInt(slider.value);
      slider.value = 0;
      updateVolume("sfx", 0);
    }
  }
}

// 2. Fungsi Keluar Aplikasi
function exitApp() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    window.close(); // Untuk web/PWA tertentu
    // Jika tidak bisa close, arahkan ke Google (sebagai tanda keluar)
    window.location.href = "https://www.google.com";
  }
}
// --- TAMBAHAN FUNGSI FEEDBACK WA ---
function sendFeedback() {
  SoundManager.playClick();

  // Nomor Tujuan (Format Internasional tanpa +)
  const phoneNumber = "6282275894842";

  // Data Perangkat untuk Debugging
  const deviceAgent = navigator.userAgent;
  const currentLevel = level;
  const currentScore = score;

  // Pesan Template
  const message = `Halo Admin Tile Explorer,

Saya ingin melaporkan bug/masalah pada game.
Mohon dicek.

--- Info Game ---
Level: ${currentLevel}
Skor: ${currentScore}
Perangkat: ${deviceAgent}

[Tulis detail masalah di sini dan LAMPIRKAN SCREENSHOT/GAMBAR masalahnya]
`;

  // Encode URL agar karakter spasi dan enter terbaca
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  // Buka WhatsApp di tab baru
  window.open(url, "_blank");
}

// --- 7. LOGIKA HINT BARU (Dengan Konfirmasi & Biaya) ---

const hintConfirmModal = document.getElementById("hint-confirm-modal");

function checkHintAvailability() {
  // Cek apakah game sedang jalan
  if (gameState !== "playing" || isProcessingMatch) return;

  // Cek kuota
  if (hintsRemaining <= 0) {
    // --- UBAH DISINI: Ganti alert dengan fungsi modal baru ---
    showNoHintModal();
    return;
  }

  // Tampilkan Modal Konfirmasi
  SoundManager.playClick();
  hintConfirmModal.classList.remove("hidden");
  setTimeout(() => hintConfirmModal.classList.remove("opacity-0"), 10);
}

function closeHintModal() {
  SoundManager.playClick();
  hintConfirmModal.classList.add("opacity-0");
  setTimeout(() => hintConfirmModal.classList.add("hidden"), 300);
}

// --- UBAH FUNGSI confirmUseHint (script.js) ---

// Definisi Modal Poin Kurang
const noScoreModal = document.getElementById("no-score-modal");

function showNoScoreModal() {
  SoundManager.playTone(300, "sawtooth", 0.3); // Suara error/denied
  noScoreModal.classList.remove("hidden");
  setTimeout(() => noScoreModal.classList.remove("opacity-0"), 10);
}

function closeNoScoreModal() {
  SoundManager.playClick();
  noScoreModal.classList.add("opacity-0");
  setTimeout(() => noScoreModal.classList.add("hidden"), 300);
}

function confirmUseHint() {
  closeHintModal(); // Tutup modal konfirmasi hint ("Apakah yakin?")

  // Cek apakah skor cukup
  if (score < HINT_COST) {
    // GANTI ALERT LAMA DENGAN POPUP BARU
    showNoScoreModal();
    return;
  }

  // POTONG SKOR & JALANKAN (Sama seperti kode lama)
  score -= HINT_COST;
  updateUI();
  executeHintLogic();
}

// --- LOGIKA MODAL BANTUAN HABIS (BARU) ---
const noHintModal = document.getElementById("no-hint-modal");

function showNoHintModal() {
  SoundManager.playTone(200, "sawtooth", 0.3); // Suara "Tetot" pelan
  noHintModal.classList.remove("hidden");
  setTimeout(() => noHintModal.classList.remove("opacity-0"), 10);
}

function closeNoHintModal() {
  SoundManager.playClick();
  noHintModal.classList.add("opacity-0");
  setTimeout(() => noHintModal.classList.add("hidden"), 300);
}

function executeHintLogic() {
  // Ini logika useHint yang lama, dipindahkan kesini

  let targetId = null;
  // Prioritas 1: Cari pasangan untuk ubin yang SUDAH ADA di tray
  if (tray.length > 0) {
    targetId = tray[0].id;
  }
  // Prioritas 2: Jika tray kosong, ambil random dari board
  else if (tiles.length > 0) {
    const randomTile = tiles.find((t) => !t.isBlocked);
    if (randomTile) targetId = randomTile.id;
    else targetId = tiles[0].id;
  }

  if (!targetId) return;

  // Kurangi jatah hint
  hintsRemaining--;
  document.getElementById("hint-count").innerText = hintsRemaining;

  // Efek Suara Magic
  SoundManager.playTone(1500, "sine", 0.5);

  // Cari 2 atau 3 ubin yang cocok di board/tray untuk diselesaikan
  const tilesToRemove = tiles.filter((t) => t.id === targetId).slice(0, 3);

  tilesToRemove.forEach((t) => {
    const idx = tiles.indexOf(t);
    if (idx > -1) tiles.splice(idx, 1);
    tray.push(t);
  });

  updateInteractability();
  renderBoard();
  renderTray();
  checkMatch();
}

// --- UPDATE handleResize (LEBIH AMAN DARI TEPI LAYAR) ---
function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;

  // 1. Atur Posisi Tray
  if (isLandscape) {
    trayContainerWrapper.style.top = "60px";
  } else {
    trayContainerWrapper.style.top = "90px";
  }

  // 2. Skala Tray
  const maxAllowedTrayWidth = width - 20;
  let newTrayScale = 1;
  if (BASE_TRAY_WIDTH > maxAllowedTrayWidth) {
    newTrayScale = maxAllowedTrayWidth / BASE_TRAY_WIDTH;
  }
  if (isLandscape) newTrayScale *= 0.85;
  trayScalerEl.style.transform = `scale(${newTrayScale})`;

  // 3. Hitung Ruang Tersedia
  const trayRealHeight = (isLandscape ? 60 : 80) * newTrayScale;
  const topUsedSpace =
    parseInt(trayContainerWrapper.style.top) + trayRealHeight + 30;
  const bottomMargin = 80; // Margin bawah diperbesar agar tidak kena footer

  // --- PERUBAHAN PENTING DI SINI ---
  // Kita kurangi lebar tersedia sebanyak 60px (30px kiri, 30px kanan).
  // Ini memaksa game untuk mengecilkan ubin (zoom out) LEBIH AWAL.
  const availableWidth = width - 60;
  const availableHeight = height - topUsedSpace - bottomMargin;

  // 4. Hitung Ukuran Konten
  if (tiles.length === 0) return;

  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  tiles.forEach((t) => {
    if (t.x < minX) minX = t.x;
    if (t.x > maxX) maxX = t.x;
    if (t.y < minY) minY = t.y;
    if (t.y > maxY) maxY = t.y;
  });

  // Padding Bounding Box
  const contentWidth = maxX - minX + TILE_SIZE * 1.5;
  const contentHeight = maxY - minY + TILE_SIZE * 1.5;

  // 5. Hitung Skala
  const scaleX = availableWidth / contentWidth;
  const scaleY = availableHeight / contentHeight;

  let finalScale = Math.min(scaleX, scaleY);

  // 6. Batasan Skala
  finalScale = Math.min(finalScale, 1.0);

  // Batas bawah ekstrem (0.25) agar ubin tidak hilang,
  // tapi normalnya auto-scale akan menangani ini dengan baik.
  if (finalScale < 0.25) finalScale = 0.25;

  // Terapkan
  boardEl.style.marginTop = `${topUsedSpace}px`;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  boardEl.style.transform = `scale(${finalScale}) translate(${-centerX}px, ${-centerY}px)`;
  boardEl.style.transformOrigin = "center top";
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

function fetchUserIP() {
  // Menggunakan layanan gratis untuk cek IP
  fetch("https://api.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => {
      userIP = data.ip;
      const ipDisplay = document.getElementById("ip-display");
      if (ipDisplay) {
        ipDisplay.innerText = userIP;
        checkDeveloperMode(ipDisplay);
      }
    })
    .catch((err) => {
      const ipDisplay = document.getElementById("ip-display");
      if (ipDisplay) ipDisplay.innerText = "Offline / Gagal";
    });
}

// --- UPDATE checkDeveloperMode DI SCRIPT.JS ---
function checkDeveloperMode(element) {
  if (DEVELOPER_IPS.includes(userIP)) {
    isDeveloper = true;

    // Tanda Visual di Menu Utama
    element.innerHTML +=
      " <span class='text-green-400 font-bold'>(DEV MODE)</span>";
    element.style.color = "#fff";

    // --- BARU: TAMPILKAN TOMBOL NAVIGASI DEV ---
    const devControls = document.getElementById("dev-controls");
    if (devControls) {
      devControls.classList.remove("hidden");
    }
  }
}

// --- TAMBAHAN FUNGSI NAVIGASI DEVELOPER ---

function devNextLevel() {
  if (!isDeveloper) return;
  SoundManager.playClick();

  level++;
  // Simpan max level agar tidak terkunci
  StorageManager.saveMaxLevel(level);

  // Reset skor level ini agar bersih
  levelStartScore = score;

  // Generate
  generateLevel(level);
  updateUI();

  // Efek visual kecil
  const btn = document.querySelector("#dev-controls button:last-child");
  btn.classList.add("bg-green-600");
  setTimeout(() => btn.classList.remove("bg-green-600"), 200);

  console.log(`[DEV] Skipped to Level ${level}`);
}

function devPrevLevel() {
  if (!isDeveloper || level <= 1) return;
  SoundManager.playClick();

  level--;
  levelStartScore = score; // Pertahankan skor berjalan

  generateLevel(level);
  updateUI();

  const btn = document.querySelector("#dev-controls button:first-child");
  btn.classList.add("bg-green-600");
  setTimeout(() => btn.classList.remove("bg-green-600"), 200);

  console.log(`[DEV] Back to Level ${level}`);
}

// --- TAMBAHAN LOGIKA MODAL BARU (script.js) ---

// 1. Logika Modal Keluar
const exitModal = document.getElementById("exit-modal");

function exitApp() {
  SoundManager.playClick();
  exitModal.classList.remove("hidden");
  setTimeout(() => exitModal.classList.remove("opacity-0"), 10);
}

function closeExitModal() {
  SoundManager.playClick();
  exitModal.classList.add("opacity-0");
  setTimeout(() => exitModal.classList.add("hidden"), 300);
}

function confirmExitApp() {
  window.close();
  // Fallback jika window.close diblokir browser
  window.location.href = "https://google.com";
}

// 2. Logika Modal Konfirmasi Level
const levelConfirmModal = document.getElementById("level-confirm-modal");
let pendingLevelToJump = null; // Menyimpan level yang ingin dituju sementara

function showLevelConfirmModal(targetLevel) {
  pendingLevelToJump = targetLevel;
  levelConfirmModal.classList.remove("hidden");
  setTimeout(() => levelConfirmModal.classList.remove("opacity-0"), 10);

  // Set aksi tombol konfirmasi
  document.getElementById("btn-confirm-jump").onclick = function () {
    executeLevelJump(pendingLevelToJump);
  };
}

function closeLevelConfirmModal() {
  SoundManager.playClick();
  levelConfirmModal.classList.add("opacity-0");
  setTimeout(() => levelConfirmModal.classList.add("hidden"), 300);
  pendingLevelToJump = null;
}

function executeLevelJump(selectedLevel) {
  SoundManager.playClick();
  closeLevelConfirmModal();
  closeLevelSelect();

  // Reset logika permainan
  startScreenEl.style.transform = "translateY(-100%)";
  level = selectedLevel;

  // LOGIKA RESET SKOR (Ini yang membuat game adil)
  score = 0;
  levelStartScore = 0;

  gameState = "playing";
  updateUI();
  generateLevel(level);
  saveGameProgress();
}

// --- 3. FUNGSI TIMER & FORMAT WAKTU (Tambahkan di bagian fungsi-fungsi) ---
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function startTimer() {
  stopTimer(); // Reset dulu
  timerInterval = setInterval(() => {
    if (gameState === "playing" && !isProcessingMatch) {
      gameTimeSeconds++;
      updateTimerUI();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerUI() {
  const timerEl = document.getElementById("timer-display");
  if (timerEl) timerEl.innerText = formatTime(gameTimeSeconds);
}

// --- TAMBAHAN FUNGSI POPUP RESTRICTION ---
const restrictionModal = document.getElementById("level-restriction-modal");

function showRestrictionModal() {
  SoundManager.playClick(); // Bunyi klik (opsional bunyi error jika ada)
  restrictionModal.classList.remove("hidden");
  setTimeout(() => restrictionModal.classList.remove("opacity-0"), 10);
}

function closeRestrictionModal() {
  SoundManager.playClick();
  restrictionModal.classList.add("opacity-0");
  setTimeout(() => restrictionModal.classList.add("hidden"), 300);
}
