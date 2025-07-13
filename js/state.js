let currentQuote = null;
let currentThemeColors = null;
let countdown = CONFIG.COUNTDOWN_DURATION;
let timerInterval = null;
let isTimerPaused = false;
let mouseGlowElement = null;
let isAnimating = false;
let matrixInterval = null;
let activeColumns = [];
let visualEffectsEnabled = true;
let activeCategory = 'All';
let favoriteQuotes = [];
let userQuotes = [];
let copyTimeout = null;
let glowHue = 0;
let glowAnimationId = null;
const glowColorProfiles = [
    { name: "Vibrant", saturation: 100, lightness: 60, speed: 0.5 }, { name: "Pastel", saturation: 70, lightness: 75, speed: 0.3 },
    { name: "Deep", saturation: 90, lightness: 50, speed: 0.6 }, { name: "Bright", saturation: 100, lightness: 70, speed: 0.4 },
    { name: "Aurora", saturation: 85, lightness: 65, speed: 0.8 }, { name: "Mystic", saturation: 75, lightness: 55, speed: 0.25 }
];
let currentGlowProfileIndex = 0;
let glowProfileChangeInterval = null;

// --- DOM Elements ---
let quoteTextEl, quoteAuthorEl, generateBtn, countdownEl, timerToggleBtn,
    quotePatternEl, rootStyle, socialLinks = {}, matrixBg,
    copyQuoteBtn, favoriteQuoteBtn, copyFeedbackEl,
    settingsToggleEl, settingsPanelEl, effectsToggleCheckboxEl, clearFavoritesBtnEl,
    addQuoteToggleBtnEl, addQuoteFormEl, newQuoteTextEl, newQuoteAuthorEl, submitQuoteBtnEl;
