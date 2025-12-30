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

const TILE_SIZE = 88; // Diturunkan dari 90 ke 75 agar tidak meluber ke luar layar
const TRAY_TILE_SIZE = 70; // Disesuaikan proporsinya
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
const DEVELOPER_IPS = ["182.8.227.167"];
// --- UBAH & TAMBAH VARIABEL GLOBAL (script.js) ---
let hintsRemaining = 3; // Jatah bantuan per level
const MAX_HINTS = 3;
let sfxVolume = 0.8;
let bgmVolume = 0.4;

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
  fetchUserIP(); // <--- TAMBAHKAN BARIS INI
  const savedTheme = StorageManager.getTheme();
  if (savedTheme) changeTheme(savedTheme, false);
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

  // Jika tema tersimpan valid, pakai itu. Jika tidak (atau data lama), pakai Ocean.
  if (savedTheme && validThemes.includes(savedTheme)) {
    changeTheme(savedTheme, false);
  } else {
    // Default fallback jika data lama korup/versi lama
    changeTheme("theme-ocean", false);
  }
  if (levelEl) {
    levelEl.style.cursor = "pointer";
    // Efek visual saat hover (opsional, via class)
    levelEl.classList.add(
      "hover:scale-105",
      "active:scale-95",
      "transition-transform"
    );

    levelEl.addEventListener("click", () => {
      SoundManager.playClick();
      // Buka modal pilih level jika gameState sedang main atau menu
      showLevelSelect();
    });
  }

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

function confirmNewGame() {
  StorageManager.clear();
  startGame();
}

function continueGame() {
  const save = StorageManager.load();
  if (save) {
    level = save.level;
    score = save.score;
    levelStartScore =
      save.levelStartScore !== undefined ? save.levelStartScore : save.score;
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
    const isLocked = i > maxLevel && !isDeveloper;
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

function restartLevel() {
  SoundManager.playClick();
  hideOverlay();
  score = levelStartScore;
  updateUI(); // Update tampilan skor
  generateLevel(level);
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
  const hintBtn = document.getElementById("btn-hint");
  if (hintBtn) hintBtn.classList.remove("opacity-50", "cursor-not-allowed");

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

// --- UBAH GENERATOR LAYOUT AGAR TIDAK MENUMPUK (FLAT) ---

// 1. Pyramid (Dibuat lebih datar)
function generatePyramidLayout(pool) {
  let idx = 0;
  // Ubah z menjadi 0 semua, atau maksimal 1 layer tumpuk
  const layers = [
    { r: 5, c: 4, z: 0 },
    { r: 4, c: 3, z: 0 }, // Z jadi 0 (sebelumnya 1)
    { r: 3, c: 2, z: 1 }, // Cuma bagian puncak yang menumpuk sedikit
    { r: 2, c: 2, z: 1 },
  ];
  // ... (sisa kode generatePyramidLayout sama)
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

// 2. Circle (Dibuat Flat z=0)
function generateCircleLayout(pool) {
  let idx = 0;
  const rings = [
    { r: 0, c: 1, z: 1 }, // Tengah agak naik dikit
    { r: 1.3, c: 6, z: 0 }, // Sisanya di dasar (z=0)
    { r: 2.4, c: 12, z: 0 },
    { r: 3.5, c: 18, z: 0 },
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

// 3. Spiral (Dibuat Flat)
function generateSpiralLayout(pool) {
  let idx = 0,
    angle = 0,
    radius = 0;
  const MAX_SPIRAL_RADIUS = TILE_SIZE * 3.4;

  while (idx < pool.length) {
    if (radius > MAX_SPIRAL_RADIUS) {
      radius = 0.2 * TILE_SIZE;
      angle += 1.5;
    }

    // Z SELALU 0 (Tidak menumpuk)
    let z = 0;

    addTile(
      pool[idx++],
      radius * Math.cos(angle),
      radius * Math.sin(angle),
      z,
      3
    );
    angle += 0.75;
    radius += 4;
  }
  addRemainingTiles(pool, idx);
}

// 4. Butterfly & Grid (Pastikan Z rendah)
function generateButterflyLayout(pool) {
  let idx = 0;
  // Koordinat manual, set Z ke 0 atau 1 max
  const coords = [
    { x: 0, y: 0, z: 1 },
    { x: 1.2, y: 1.2, z: 0 },
    { x: 1.2, y: -1.2, z: 0 },
    { x: -1.2, y: 1.2, z: 0 },
    { x: -1.2, y: -1.2, z: 0 },
    { x: 2.4, y: 2.4, z: 0 },
    { x: 2.4, y: -2.4, z: 0 },
    { x: -2.4, y: 2.4, z: 0 },
    { x: -2.4, y: -2.4, z: 0 },
    { x: 0, y: 1.5, z: 0 },
    { x: 0, y: -1.5, z: 0 },
  ];
  coords.forEach((p) => {
    if (idx < pool.length)
      addTile(pool[idx++], p.x * TILE_SIZE, p.y * TILE_SIZE, p.z, 4);
  });
  addRemainingTiles(pool, idx);
}
function generateCircleLayout(pool) {
  let idx = 0;
  const rings = [
    { r: 0, c: 1, z: 3 },
    { r: 1.3, c: 6, z: 2 },
    { r: 2.4, c: 12, z: 1 }, // Dirapatkan
    { r: 3.5, c: 18, z: 0 }, // MAX RADIUS di sini (3.5)
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
// --- UBAH generateCircleLayout (Baris ~540) ---
function generateCircleLayout(pool) {
  let idx = 0;
  // Radius maksimal yang diizinkan (Pembatas Tak Terlihat)
  // 3.6 x 75px = 270px radius (Total lebar 540px)
  const rings = [
    { r: 0, c: 1, z: 3 },
    { r: 1.3, c: 6, z: 2 },
    { r: 2.4, c: 12, z: 1 }, // Dirapatkan
    { r: 3.5, c: 18, z: 0 }, // MAX RADIUS di sini (3.5)
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

// --- UBAH generateSpiralLayout (Baris ~570) ---
function generateSpiralLayout(pool) {
  let idx = 0,
    angle = 0,
    radius = 0;

  // PEMBATAS KETAT: Turunkan sedikit dari 3.8 ke 3.4 agar aman di Potret
  const MAX_SPIRAL_RADIUS = TILE_SIZE * 3.4;

  while (idx < pool.length) {
    // Jika radius mentok, reset ke tengah (layer 0)
    if (radius > MAX_SPIRAL_RADIUS) {
      radius = 0.2 * TILE_SIZE; // Reset ke pusat
      angle += 1.5;
    }

    let z = Math.floor(4 - radius / (TILE_SIZE * 1.1));
    if (z < 0) z = 0;

    addTile(
      pool[idx++],
      radius * Math.cos(angle),
      radius * Math.sin(angle),
      z,
      3
    );

    angle += 0.75; // Sudut lebih besar agar spiral lebih rapat
    radius += 4; // Increment radius standar
  }

  // Sisa ubin akan ditangani oleh addRemainingTiles yang baru (di tengah)
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

// --- UBAH FUNGSI addRemainingTiles (Ganti Seluruh Fungsi) ---
function addRemainingTiles(pool, startIndex) {
  let poolIndex = startIndex;

  // Jika tidak ada sisa, berhenti
  if (poolIndex >= pool.length) return;

  // PERUBAHAN DONAT:
  // 1. Kita TIDAK menaruh ubin di tengah (0,0).
  // 2. Kita mulai dari Layer 3.
  //    Ini berarti Layer 1 dan 2 akan kosong, menciptakan "Lubang" di tengah.
  let layer = 3;

  while (poolIndex < pool.length) {
    // Rumus Radial/Hexagonal
    const itemsInLayer = layer * 6;
    const stepAngle = (Math.PI * 2) / itemsInLayer;

    // Jarak radius.
    // Layer 3 * 0.85 * 75px = Radius awal sekitar 190px dari tengah.
    // Cukup luas untuk membuat lubang yang lega.
    const currentRadius = layer * (TILE_SIZE * 0.85);

    for (let i = 0; i < itemsInLayer; i++) {
      if (poolIndex >= pool.length) break;

      // Hitung posisi melingkar
      const angle = i * stepAngle;
      const x = currentRadius * Math.cos(angle);
      const y = currentRadius * Math.sin(angle);

      // Taruh di Z=0 (Paling Bawah)
      addTile(pool[poolIndex++], x, y, 0, 0);
    }

    // Lanjut ke lingkaran luar berikutnya
    layer++;
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

// --- TAMBAHKAN FUNGSI BARU DI SCRIPT.JS ---

// 1. Fungsi Update Volume dari Slider
function updateVolume(type, val) {
  const decimalVal = val / 100;
  if (type === "bgm") {
    SoundManager.setBGMVol(decimalVal);
    document.getElementById("bgm-val").innerText = val + "%";
  } else {
    sfxVolume = decimalVal;
    document.getElementById("sfx-val").innerText = val + "%";
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

// 3. Fungsi Bantuan (Hint)
function useHint() {
  if (gameState !== "playing" || hintsRemaining <= 0 || isProcessingMatch)
    return;

  // Logika Hint: Cari ubin di tray, lalu cari pasangannya di board
  // Atau jika tray kosong, ambil sepasang dari board secara otomatis

  let targetId = null;

  // Prioritas 1: Cari pasangan untuk ubin yang SUDAH ADA di tray
  if (tray.length > 0) {
    targetId = tray[0].id; // Ambil ubin pertama di tray sebagai target
  }
  // Prioritas 2: Jika tray kosong, ambil random dari board
  else if (tiles.length > 0) {
    const randomTile = tiles.find((t) => !t.isBlocked); // Cari yang tidak terblokir dulu
    if (randomTile) targetId = randomTile.id;
    else targetId = tiles[0].id; // Terpaksa ambil yang terblokir (Magic!)
  }

  if (!targetId) return;

  // Kurangi jatah hint
  hintsRemaining--;
  document.getElementById("hint-count").innerText = hintsRemaining;
  if (hintsRemaining === 0) {
    document
      .getElementById("btn-hint")
      .classList.add("opacity-50", "cursor-not-allowed");
  }

  // Efek Suara Magic
  SoundManager.playTone(1500, "sine", 0.5);

  // Cari 2 atau 3 ubin yang cocok di board/tray untuk diselesaikan
  const tilesToRemove = tiles.filter((t) => t.id === targetId).slice(0, 3);

  // Masukkan ke tray secara otomatis (Bypassing click logic)
  tilesToRemove.forEach((t) => {
    // Hapus dari tiles array
    const idx = tiles.indexOf(t);
    if (idx > -1) tiles.splice(idx, 1);
    // Masukkan ke tray (abaikan kapasitas, ini magic)
    tray.push(t);
  });

  updateInteractability();
  renderBoard();
  renderTray();

  // Trigger cek match
  checkMatch();
}

// --- UBAH FUNGSI handleResize (Baris Paling Bawah) ---
function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;

  if (isLandscape) {
    trayContainerWrapper.style.top = "85px";
  } else {
    trayContainerWrapper.style.top = "90px";
  }

  // --- 1. Skala Tray ---
  const maxAllowedTrayWidth = width - 20;
  let newTrayScale = 1;

  if (BASE_TRAY_WIDTH > maxAllowedTrayWidth) {
    newTrayScale = maxAllowedTrayWidth / BASE_TRAY_WIDTH;
  }
  if (isLandscape) newTrayScale *= 0.75;

  trayScalerEl.style.transform = `scale(${newTrayScale})`;
  trayScalerEl.style.transformOrigin = "top center";

  // --- 2. Hitung Area Papan (Board) ---
  const trayRealHeight = (isLandscape ? 60 : 80) * newTrayScale;
  const boardStartY =
    parseInt(trayContainerWrapper.style.top) +
    trayRealHeight +
    (isLandscape ? 5 : 20);

  let availableHeight = height - boardStartY - (isLandscape ? 5 : 80);
  if (availableHeight < 100) availableHeight = 100;

  // --- 3. PEMBATAS TAK TERLIHAT (SAFE BOX) ---
  // NAIKKAN KE 880.
  // Logika: Ubin dibesarkan (82px), maka kotak pembatas juga harus dibesarkan (880px)
  // agar kamera melakukan "zoom out" secukupnya sehingga ubin besar tadi tetap masuk layar.
  const SAFE_BOX_SIZE = 880;

  const scaleX = (width - 20) / SAFE_BOX_SIZE;
  const scaleY = availableHeight / SAFE_BOX_SIZE;

  let newBoardScale = Math.min(scaleX, scaleY);

  // Batasan Logis
  newBoardScale = Math.min(newBoardScale, 1.0);
  newBoardScale = Math.max(newBoardScale, 0.35);

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

function checkDeveloperMode(element) {
  if (DEVELOPER_IPS.includes(userIP)) {
    isDeveloper = true;
    // Beri tanda visual bahwa mode developer aktif
    element.innerHTML +=
      " <span class='text-green-400 font-bold'>(DEV MODE)</span>";
    element.style.color = "#fff";
  }
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
