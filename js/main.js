// js/main.js - VibeMe Enhanced JavaScript (No Modules)

// ===== Global Audio Safety Net (constructor + oscillator patch) =====
(function() {
    // Creates a minimal AudioContext at startup to avoid iOS/Chrome auto-play restrictions
    // and provides a global oscillator beep for accessibility (used by quote transitions)
    // This must run before any other app code to ensure audio context is unlocked on first user gesture.
    window.VibeMeAudioSafetyNet = {
        context: null,
        oscillator: null,
        unlock: function() {
            if (this.context) return;
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                // Patch: create a silent oscillator to keep context alive
                const osc = ctx.createOscillator();
                osc.frequency.value = 440;
                osc.type = 'sine';
                const gain = ctx.createGain();
                gain.gain.value = 0;
                osc.connect(gain).connect(ctx.destination);
                osc.start(0);
                this.context = ctx;
                this.oscillator = osc;
            } catch (e) {
                // Fail silently
            }
        },
        beep: function(frequency = 880, duration = 0.08, volume = 0.22) {
            // Play a short beep (used for quote transitions)
            if (!this.context) this.unlock();
            if (!this.context) return;
            const ctx = this.context;
            const osc = ctx.createOscillator();
            osc.frequency.value = frequency;
            osc.type = 'sine';
            const gain = ctx.createGain();
            gain.gain.value = volume;
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
            osc.onended = function() {
                osc.disconnect();
                gain.disconnect();
            };
        }
    };
    // Unlock audio context on first user interaction (touch/click/keydown)
    const unlockHandler = () => {
        window.VibeMeAudioSafetyNet.unlock();
        window.removeEventListener('touchstart', unlockHandler, true);
        window.removeEventListener('mousedown', unlockHandler, true);
        window.removeEventListener('keydown', unlockHandler, true);
    };
    window.addEventListener('touchstart', unlockHandler, true);
    window.addEventListener('mousedown', unlockHandler, true);
    window.addEventListener('keydown', unlockHandler, true);
})();

// ===== Global Audio Guard (constructor + resume + oscillator + <audio>.play) =====
(function () {
  try {
    if (window.__VM_AUDIO_GUARD_PATCHED) return;
    window.__VM_AUDIO_GUARD_PATCHED = true;

    // 1) Track ALL AudioContexts created anywhere
    const NativeAC = window.AudioContext || window.webkitAudioContext;
    if (NativeAC) {
      const PatchedAC = function (...args) {
        const ctx = new NativeAC(...args);
        (window.__allAudioContexts ||= []).push(ctx);
        return ctx;
      };
      PatchedAC.prototype = NativeAC.prototype;
      if (window.AudioContext) window.AudioContext = PatchedAC;
      if (window.webkitAudioContext) window.webkitAudioContext = PatchedAC;
    }

    // Helper: is beep enabled right now?
    const isBeepEnabled = () => {
      try { return !(window.VibeMe && VibeMe.state && VibeMe.state.beepEnabled === false); }
      catch (_) { return true; }
    };

    // 2) Prevent resume() from waking audio when beeps are OFF
    const ACProto = (NativeAC && NativeAC.prototype) || (window.AudioContext && window.AudioContext.prototype);
    if (ACProto && typeof ACProto.resume === 'function' && !ACProto.__vm_resume_patched) {
      const _resume = ACProto.resume;
      ACProto.resume = function (...args) {
        if (!isBeepEnabled()) {
          try { if (typeof this.suspend === 'function') this.suspend(); } catch (_) {}
          return Promise.resolve();
        }
        return _resume.apply(this, args);
      };
      ACProto.__vm_resume_patched = true;
    }

    // 3) Swallow OscillatorNode.start() when beeps are OFF
    if (window.OscillatorNode && window.OscillatorNode.prototype && typeof window.OscillatorNode.prototype.start === 'function' && !window.OscillatorNode.prototype.__vm_start_patched) {
      const _start = window.OscillatorNode.prototype.start;
      window.OscillatorNode.prototype.start = function (...args) {
        if (!isBeepEnabled()) {
          try { if (typeof this.stop === 'function') this.stop(0); } catch (_) {}
          return; // no-op
        }
        return _start.apply(this, args);
      };
      window.OscillatorNode.prototype.__vm_start_patched = true;
    }

    // 4) Optional: respect setting for short <audio> UI beeps (doesn't touch TTS)
    // Only block if the element explicitly opts-in via data-respect-beep="true"
    const AProto = window.HTMLAudioElement && window.HTMLAudioElement.prototype;
    if (AProto && typeof AProto.play === 'function' && !AProto.__vm_play_patched) {
      const _play = AProto.play;
      AProto.play = function (...args) {
        try {
          const respect = this.hasAttribute && this.hasAttribute('data-respect-beep');
          if (respect && !isBeepEnabled()) {
            try { this.pause(); this.currentTime = 0; } catch (_) {}
            return Promise.resolve();
          }
        } catch (_) { /* ignore */ }
        return _play.apply(this, args);
      };
      AProto.__vm_play_patched = true;
    }
  } catch (_) { /* no-op */ }
})();

// ===== GLOBAL CONFIGURATION =====
const VibeMe = {
    // Application state
    state: {
        currentQuoteIndex: 0,
        countdown: 10,
        isPaused: false,
        timerInterval: null,
        effectsEnabled: true,
        isDarkMode: JSON.parse(localStorage.getItem('vibeme-dark-mode') || 'false'),
        favorites: JSON.parse(localStorage.getItem('vibeme-favorites') || '[]'),
        customQuotes: JSON.parse(localStorage.getItem('vibeme-custom-quotes') || '[]'),
        quoteRatings: JSON.parse(localStorage.getItem('vibeme-ratings') || '{}'),
        stats: JSON.parse(localStorage.getItem('vibeme-stats') || '{"quotesGenerated": 0, "quotesShared": 0, "dayStreak": 0, "lastVisit": null}')
        ,
        beepEnabled: JSON.parse(localStorage.getItem('vibeme-beep-enabled') || 'true')
    },

    // Audio context for enhanced sound effects
    audioContext: null,
    audioNodes: {},

    // Advanced Matrix Effect Configuration - Enhanced with Dual Rendering
    matrixConfig: {
        columnWidth: 16,
        updateInterval: 500,
        colors: ['#CC00FF', '#A104C1', '#4400F6', '#0050FF', '#03A0C5', '#00E5FF'],
        densityMultiplier: 1.5,
        isLightBackground: false,
        backgroundLuminance: 0.2,
        // New dual rendering system properties
        renderMode: 'dom', // 'dom', 'canvas', 'hybrid'
        bidirectional: true, // Enable up/down movement
        trailLength: 20, // Maximum trail length for enhanced effects
        trailFadeRate: 0.05, // Opacity fade rate for trails
        characters: ['0', '1', '|', '/', '\\', '-', '+', '*', '#', '@', '&', '%', '$', '〃', '¦', '｜'], // Enhanced character set
        canvasConfig: {
            fontSize: 28,
            columnSpacing: 10,
            glowIntensity: 10,
            shadowBlur: 5,
            globalOpacity: 1.0,
            // Performance optimization settings
            maxFPS: 60,
            adaptivePerformance: true,
            enableObjectPooling: true,
            memoryManagement: true
        }
    },

    // Matrix Effect State Management - Enhanced for Dual Rendering
    matrixState: {
        interval: null,
        activeColumns: [],
        resizeHandler: null,
        // Canvas-specific state
        canvas: null,
        canvasContext: null,
        canvasAnimationId: null,
        canvasDrops: [],
        // Bidirectional movement state
        columnDirections: new Map(), // Store direction for each column
        trailData: new Map(), // Store trail information for enhanced effects
        // Performance optimization state
        lastFrameTime: 0,
        frameCount: 0,
        avgFrameTime: 16.67, // Target 60fps
        performanceMode: 'auto', // 'auto', 'high', 'balanced', 'low'
        dropPool: [], // Object pool for reusing drop objects
        memoryCleanupInterval: null,
        canvasRecoveryAttempted: false // Flag to prevent infinite recovery loops
    },

    // Theme system
    themes: {
        colorPalettes: {
            love: [
                {color1: "#ff758c", color2: "#ff7eb3", color3: "#ff8e9e"},
                {color1: "#ff6b6b", color2: "#ff8e8e", color3: "#ffb3b3"},
                {color1: "#f78fb3", color2: "#f8a5c2", color3: "#f9b7d1"}
            ],
            perseverance: [
                {color1: "#1e3c72", color2: "#2a5298", color3: "#1e4d8c"},
                {color1: "#0a192f", color2: "#172a45", color3: "#303f60"},
                {color1: "#00416A", color2: "#005792", color3: "#0066B2"}
            ],
            originality: [
                {color1: "#8e44ad", color2: "#9b59b6", color3: "#d2b4de"},
                {color1: "#e74c3c", color2: "#f39c12", color3: "#3498db"},
                {color1: "#1abc9c", color2: "#2ecc71", color3: "#3498db"},
                {color1: "#9b59b6", color2: "#e74c3c", color3: "#f1c40f"}
            ],
            change: [
                {color1: "#4CAF50", color2: "#8BC34A", color3: "#CDDC39"},
                {color1: "#2196F3", color2: "#64B5F6", color3: "#90CAF9"}
            ],
            inner_strength: [
                {color1: "#795548", color2: "#8D6E63", color3: "#A1887F"},
                {color1: "#424242", color2: "#616161", color3: "#757575"}
            ],
            default: [
                {color1: "#6366f1", color2: "#8b5cf6", color3: "#a855f7"}
            ],
            
            // --- New palettes from reference images ---
            // Retro Neon (exact hexes where given)
            retro_neon: [
                { color1: "#DF3C5F", color2: "#224193", color3: "#6F9BD1" },
                { color1: "#6F9BD1", color2: "#224193", color3: "#DF3C5F" },
                { color1: "#224193", color2: "#6F9BD1", color3: "#DF3C5F" }
            ],

            // Desert Dusk (with deep accent)
            desert_dusk: [
                { color1: "#E17888", color2: "#AE3B8B", color3: "#1C5789", accent: "#341514" },
                { color1: "#AE3B8B", color2: "#1C5789", color3: "#E17888", accent: "#341514" }
            ],

            // Lavender Glow
            lavender_glow: [
                { color1: "#6B57B7", color2: "#7C62C6", color3: "#E3D6FF" },
                { color1: "#7C62C6", color2: "#B9A8F2", color3: "#EDE4FF" }
            ],

            // Midnight Arcade (navy, azure, wine)
            midnight_arcade: [
                { color1: "#0F1A52", color2: "#4CA3E0", color3: "#6A0F3A" },
                { color1: "#0B1650", color2: "#2F8CD4", color3: "#8C1B4D" }
            ],

            // Punchy Reds (vivid → coral)
            punchy_reds: [
                { color1: "#EA1D44", color2: "#FF5A6E", color3: "#FF858E" },
                { color1: "#F0213A", color2: "#FF6B77", color3: "#FFA3A9" }
            ],

            // --- New QuoteFusion Ultra/LO Theme Palettes ---
            
            // Belief (trust, faith, confidence)
            belief: [
                { color1: "#1E40AF", color2: "#3B82F6", color3: "#93C5FD" },
                { color1: "#4C1D95", color2: "#7C3AED", color3: "#C4B5FD" },
                { color1: "#0F172A", color2: "#475569", color3: "#94A3B8" }
            ],

            // Perspective (clarity, insight, vision)
            perspective: [
                { color1: "#065F46", color2: "#059669", color3: "#6EE7B7" },
                { color1: "#1E3A8A", color2: "#3B82F6", color3: "#93C5FD" },
                { color1: "#0C4A6E", color2: "#0284C7", color3: "#7DD3FC" }
            ],

            // Action (energy, movement, dynamism)
            action: [
                { color1: "#DC2626", color2: "#F97316", color3: "#FCD34D" },
                { color1: "#EA580C", color2: "#F59E0B", color3: "#FDE047" },
                { color1: "#B91C1C", color2: "#EF4444", color3: "#FCA5A5" }
            ],

            // Growth (development, progress, nature)
            growth: [
                { color1: "#166534", color2: "#16A34A", color3: "#86EFAC" },
                { color1: "#365314", color2: "#65A30D", color3: "#BEF264" },
                { color1: "#0F766E", color2: "#14B8A6", color3: "#5EEAD4" }
            ],

            // Wisdom (depth, knowledge, maturity)
            wisdom: [
                { color1: "#581C87", color2: "#7C2D12", color3: "#D97706" },
                { color1: "#312E81", color2: "#6366F1", color3: "#A5B4FC" },
                { color1: "#1E1B4B", color2: "#4338CA", color3: "#818CF8" }
            ],

            // Discipline (structure, focus, determination)
            discipline: [
                { color1: "#374151", color2: "#6B7280", color3: "#D1D5DB" },
                { color1: "#1F2937", color2: "#4B5563", color3: "#9CA3AF" },
                { color1: "#0F172A", color2: "#334155", color3: "#64748B" }
            ],

            // Success (achievement, victory, accomplishment)
            success: [
                { color1: "#B45309", color2: "#D97706", color3: "#FCD34D" },
                { color1: "#166534", color2: "#059669", color3: "#34D399" },
                { color1: "#1E40AF", color2: "#2563EB", color3: "#60A5FA" }
            ],

            // --- Grouped Theme Palettes for Gemini/LO Categories ---

            // Mindset Group (mindset, clarity, focus, priorities, planning)
            mindset_group: [
                { color1: "#7C3AED", color2: "#A855F7", color3: "#C4B5FD" },
                { color1: "#0891B2", color2: "#06B6D4", color3: "#67E8F9" },
                { color1: "#059669", color2: "#10B981", color3: "#6EE7B7" }
            ],

            // Courage Group (fear, courage, comfort_zone, vulnerability)
            courage_group: [
                { color1: "#DC2626", color2: "#F87171", color3: "#FCA5A5" },
                { color1: "#C2410C", color2: "#EA580C", color3: "#FB923C" },
                { color1: "#7C2D12", color2: "#A16207", color3: "#D97706" }
            ],

            // Productivity Group (procrastination, perfectionism, productivity, habit)
            productivity_group: [
                { color1: "#0F766E", color2: "#14B8A6", color3: "#5EEAD4" },
                { color1: "#365314", color2: "#65A30D", color3: "#BEF264" },
                { color1: "#1E40AF", color2: "#3B82F6", color3: "#93C5FD" }
            ],

            // Relationships Group (relationships, communication, boundaries, forgiveness)
            relationships_group: [
                { color1: "#BE185D", color2: "#EC4899", color3: "#F9A8D4" },
                { color1: "#7E22CE", color2: "#A855F7", color3: "#C4B5FD" },
                { color1: "#0284C7", color2: "#0EA5E9", color3: "#7DD3FC" }
            ],

            // Identity Group (self_awareness, identity, authenticity, confidence, self_worth, self_love)
            identity_group: [
                { color1: "#92400E", color2: "#D97706", color3: "#FCD34D" },
                { color1: "#581C87", color2: "#7C3AED", color3: "#A78BFA" },
                { color1: "#0F766E", color2: "#14B8A6", color3: "#99F6E4" }
            ],

            // Creativity Group (creativity, originality, curiosity)
            creativity_group: [
                { color1: "#BE123C", color2: "#F43F5E", color3: "#FDA4AF" },
                { color1: "#C2410C", color2: "#EA580C", color3: "#FDBA74" },
                { color1: "#7C2D12", color2: "#DC2626", color3: "#F87171" }
            ],

            // Resilience Group (failure, resilience, progress)
            resilience_group: [
                { color1: "#374151", color2: "#6B7280", color3: "#D1D5DB" },
                { color1: "#1F2937", color2: "#4B5563", color3: "#9CA3AF" },
                { color1: "#0F172A", color2: "#334155", color3: "#64748B" }
            ],

            // Time Group (regret, future, time, past, choices)
            time_group: [
                { color1: "#5B21B6", color2: "#7C3AED", color3: "#C4B5FD" },
                { color1: "#1E1B4B", color2: "#4338CA", color3: "#818CF8" },
                { color1: "#312E81", color2: "#6366F1", color3: "#A5B4FC" }
            ],

            // Character Group (truth, character, kindness, purpose)
            character_group: [
                { color1: "#166534", color2: "#16A34A", color3: "#86EFAC" },
                { color1: "#15803D", color2: "#22C55E", color3: "#BBF7D0" },
                { color1: "#14532D", color2: "#166534", color3: "#22C55E" }
            ],

            // Learning Group (learning, experience, wisdom)
            learning_group: [
                { color1: "#B45309", color2: "#D97706", color3: "#FCD34D" },
                { color1: "#92400E", color2: "#F59E0B", color3: "#FDE047" },
                { color1: "#78350F", color2: "#B45309", color3: "#D97706" }
            ],

            // Balance Group (balance, self_care, simplicity, gratitude)
            balance_group: [
                { color1: "#065F46", color2: "#047857", color3: "#6EE7B7" },
                { color1: "#064E3B", color2: "#059669", color3: "#34D399" },
                { color1: "#022C22", color2: "#064E3B", color3: "#047857" }
            ],

            // Comparison Group (comparison, mindfulness)
            comparison_group: [
                { color1: "#7E22CE", color2: "#A855F7", color3: "#DDD6FE" },
                { color1: "#6B21A8", color2: "#9333EA", color3: "#C4B5FD" },
                { color1: "#581C87", color2: "#7C3AED", color3: "#A78BFA" }
            ]
        }
    },

    // ===== QUOTE LOADING (external quotes.json) =====
    // Tiny built-in fallback so UI still works if everything else fails.
    fallbackQuotes: [
        { text: "You're not behind—you're just loading.", author: "Lincoln Ogden", category: "perseverance" },
        { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", category: "originality" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "famous_quotes" }
    ],

    // Normalize input that may be either an array, { quotes: [...] }, or { categories: { ... } }
    normalizeQuotes: function(raw) {
        // Helper to sanitize any array of quote-like objects
        function sanitize(arr, defaultCategory) {
            return (arr || [])
                .map(q => ({
                    text: String(q.text ?? q.quote ?? '').trim(),
                    author: String(q.author ?? 'Unknown').trim(),
                    category: String(q.category ?? defaultCategory ?? 'default').trim()
                }))
                .filter(q => q.text.length > 0);
        }

        // Case 1: plain array
        if (Array.isArray(raw)) return sanitize(raw);

        // Case 2: { quotes: [...] }
        if (raw && Array.isArray(raw.quotes)) return sanitize(raw.quotes);

        // Case 3: { categories: { love: [...], perseverance: [...] } }
        if (raw && raw.categories && typeof raw.categories === 'object') {
            const combined = [];
            for (const [cat, list] of Object.entries(raw.categories)) {
                if (Array.isArray(list)) combined.push(...sanitize(list, cat));
            }
            return combined;
        }

        // Unknown shape → empty
        return [];
    },

    mergeCustomQuotes: function(base) {
        const user = Array.isArray(this.state.customQuotes) ? this.state.customQuotes : [];
        return [...base, ...user];
    },

    dedupeQuotes: function(arr) {
        const seen = new Set();
        return arr.filter(q => {
            const key = `${q.text.toLowerCase()}|${(q.author || '').toLowerCase()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    },

    onQuotesReady: function(source) {
        try {
            document.dispatchEvent(new CustomEvent('vibeme:quotes:ready', {
                detail: { source, count: this.quotes.length }
            }));
        } catch (e) { /* ignore */ }
        if (this.bus && this.bus.emit) {
            try { this.bus.emit('quotes:ready', { source, count: this.quotes.length }); } catch (_) {}
        }
    },

    loadQuotes: async function() {
        const CACHE_KEY = 'vibeme:quotes:cache:v2';

        // A) Try inline JSON first (only on file://; also warm cache)
        if (location.protocol === 'file:') {
            try {
                const node = document.getElementById('quotes-inline');
                if (node && node.textContent && node.textContent.trim().length > 0) {
                    const json = JSON.parse(node.textContent);
                    const normalized = this.normalizeQuotes(json);
                    if (Array.isArray(normalized) && normalized.length > 0) {
                        // Warm cache so future loads (including http://) have data
                        try { localStorage.setItem(CACHE_KEY, JSON.stringify(normalized)); } catch (_) {}
                        this.quotes = this.dedupeQuotes(this.mergeCustomQuotes(normalized));
                        if (this.state && typeof this.state.currentQuoteIndex === 'number') {
                            this.state.currentQuoteIndex = Math.max(0, Math.min(this.state.currentQuoteIndex, this.quotes.length - 1));
                        }
                        this.onQuotesReady('inline');
                        return;
                    }
                }
            } catch (_) { /* ignore and continue */ }
        }

        // B) Try network (multiple likely paths)
        const candidates = ['quotes.json', 'data/quotes.json', './quotes.json', './data/quotes.json'];
        for (const url of candidates) {
            try {
                const resp = await fetch(url, { cache: 'no-cache' });
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                const json = await resp.json();
                const normalized = this.normalizeQuotes(json);
                if (!Array.isArray(normalized) || normalized.length === 0) {
                    throw new Error('Empty quotes after normalization');
                }
                try { localStorage.setItem(CACHE_KEY, JSON.stringify(normalized)); } catch (_) {}
                this.quotes = this.dedupeQuotes(this.mergeCustomQuotes(normalized));
                if (this.state && typeof this.state.currentQuoteIndex === 'number') {
                    this.state.currentQuoteIndex = Math.max(0, Math.min(this.state.currentQuoteIndex, this.quotes.length - 1));
                }
                this.onQuotesReady('network');
                return;
            } catch (e) {
                // try next candidate
            }
        }

        // C) Try local cache
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
            if (Array.isArray(cached) && cached.length) {
                this.quotes = this.dedupeQuotes(this.mergeCustomQuotes(cached));
                if (this.state && typeof this.state.currentQuoteIndex === 'number') {
                    this.state.currentQuoteIndex = Math.max(0, Math.min(this.state.currentQuoteIndex, this.quotes.length - 1));
                }
                this.onQuotesReady('cache');
                return;
            }
        } catch (_) { /* ignore */ }

        // D) Embedded quotes (Phase 1 safety net)
        if (Array.isArray(this.quotes) && this.quotes.length) {
            this.quotes = this.dedupeQuotes(this.mergeCustomQuotes(this.quotes));
            if (this.state && typeof this.state.currentQuoteIndex === 'number') {
                this.state.currentQuoteIndex = Math.max(0, Math.min(this.state.currentQuoteIndex, this.quotes.length - 1));
            }
            this.onQuotesReady('embedded');
            return;
        }

        // E) Tiny fallback seed
        this.quotes = this.dedupeQuotes(this.mergeCustomQuotes(this.fallbackQuotes || []));
        if (this.state && typeof this.state.currentQuoteIndex === 'number') {
            this.state.currentQuoteIndex = Math.max(0, Math.min(this.state.currentQuoteIndex, this.quotes.length - 1));
        }
        this.onQuotesReady('fallback');
    },

    // Quote database
    quotes: [],

    // Binary messages for matrix effect
    binaryMessages: [
        "01001100 01101111 01110110 01100101", // Love
        "01001000 01101111 01110000 01100101", // Hope
        "01001010 01101111 01111001",           // Joy
        "01001011 01101001 01101110 01100100 01101110 01100101 01110011 01110011", // Kindness
        "01000011 01101111 01110101 01110010 01100001 01100111 01100101", // Courage
        "01010000 01100101 01100001 01100011 01100101", // Peace
        "01001000 01100001 01110000 01110000 01101001 01101110 01100101 01110011 01110011", // Happiness
        "01000110 01110010 01101001 01100101 01101110 01100100 01110011 01101000 01101001 01110000", // Friendship
        "01000010 01100101 01101100 01101001 01100101 01110110 01100101", // Believe
        "01000100 01110010 01100101 01100001 01101101", // Dream
        "01001001 01101110 01110011 01110000 01101001 01110010 01100101", // Inspire
        "01000011 01110010 01100101 01100001 01110100 01100101", // Create
        "01001000 01100101 01100001 01101100", // Heal
        "01000111 01110010 01101111 01110111", // Grow
        "01001100 01101001 01100111 01101000 01110100", // Light
        "01010100 01110010 01110101 01110011 01110100", // Trust
        "01000110 01100001 01101001 01110100 01101000", // Faith
        "01010000 01100001 01110011 01110011 01101001 01101111 01101110", // Passion
        "01010111 01101001 01110011 01100100 01101111 01101101", // Wisdom
        "01000010 01100101 01100001 01110101 01110100 01111001"  // Beauty
    ],

    // Initialize the application
    init: async function() {
        // One-time migration: clear old cache key (v1) and mark done
        try {
            const MIG_FLAG = 'vibeme:migration:quotes_cache_v2';
            if (!localStorage.getItem(MIG_FLAG)) {
                localStorage.removeItem('vibeme:quotes:cache:v1');
                localStorage.setItem(MIG_FLAG, '1');
            }
        } catch (_) {}

        // Load quotes first (network → cache → embedded → fallback)
        await this.loadQuotes();

        // Existing initialization (kept intact)
        this.initializeAudio && this.initializeAudio();
        this.setupEventListeners && this.setupEventListeners();
        this.loadUserPreferences && this.loadUserPreferences();
        this.initializeEffects && this.initializeEffects();
        this.initializeThemes && this.initializeThemes();
        this.initializeDarkMode && this.initializeDarkMode();
        this.initializeQuoteValidation && this.initializeQuoteValidation();

        if (typeof this.getCurrentQuote === 'function') {
            const q = this.getCurrentQuote();
            this.updateSocialLinks && this.updateSocialLinks(q);
            this.updateFavoriteButton && this.updateFavoriteButton(q);
        }

        this.startTimer && this.startTimer();
        this.updateStats && this.updateStats();

        console.log('✅ VibeMe Enhanced loaded successfully!');
    },

    // ===== CORE FUNCTIONALITY =====
    getCurrentQuote: function() {
        const allQuotes = [...this.quotes, ...this.state.customQuotes];
        return allQuotes[this.state.currentQuoteIndex] || this.quotes[0];
    },

    getRandomQuote: function() {
        const allQuotes = [...this.quotes, ...this.state.customQuotes];
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * allQuotes.length);
        } while (newIndex === this.state.currentQuoteIndex && allQuotes.length > 1);
        
        this.state.currentQuoteIndex = newIndex;
        return allQuotes[newIndex];
    },

    updateQuote: function() {
        const quote = this.getRandomQuote();
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        
        // Add button press effect to generate button
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.classList.add('button-press');
            setTimeout(() => generateBtn.classList.remove('button-press'), 150);
        }

        // Play sound effect
        this.playSound('generate');
        
        if (quoteText) {
            quoteText.classList.add('exit-active');
            setTimeout(() => {
                quoteText.textContent = quote.text;
                quoteText.classList.remove('exit-active');
                quoteText.classList.add('enter-active');
                setTimeout(() => {
                    quoteText.classList.remove('enter-active');
                }, 800);
            }, 400);
        }
        
        if (quoteAuthor) {
            quoteAuthor.classList.add('author-exit');
            setTimeout(() => {
                quoteAuthor.textContent = `— ${quote.author}`;
                quoteAuthor.classList.remove('author-exit');
                quoteAuthor.classList.add('author-enter');
                setTimeout(() => {
                    quoteAuthor.classList.remove('author-enter');
                }, 600);
            }, 300);
        }

        this.updateSocialLinks(quote);
        this.triggerHapticFeedback('light');
        
        // Apply new theme with each quote
        this.applyRandomTheme();
        
        // Auto-mode palette switching (check if theme preset is on auto mode)
        const currentPreset = localStorage.getItem('vibeme-theme-preset');
        if (currentPreset === 'auto') {
            const category = quote.category || 'default';
            const mapped = CATEGORY_TO_PRESET[category] || 'retro_neon';
            const palette = pickPaletteFromPreset(mapped) || pickPaletteFromPreset('retro_neon');
            if (palette) {
                // Apply palette after a brief delay to allow theme transition
                setTimeout(() => applyPalette(palette), 200);
            }
        }
        
        // Update rating display for new quote
        this.updateRatingDisplay();
        
        // Update stats
        this.state.stats.quotesGenerated++;
        this.saveStats();
        
        // Emit quote generated event for TTS and other features
        if (typeof VibeMe.bus !== 'undefined') {
            VibeMe.bus.emit('quote:generated', { quote: quote.text, author: quote.author, category: quote.category });
        }

        // Initialize TTS on first interaction and emit both event names for compat
        if (typeof VibeMe.tts !== 'undefined') {
            VibeMe.tts.init();
        }
        
        // Emit after DOM content is actually set (wait for animations to complete)
        setTimeout(() => {
            const __payload = {
                quote: (VibeMe.kit.$('#quote-text')?.textContent || '').trim(),
                author: (VibeMe.kit.$('#quote-author')?.textContent || '').trim()
            };
            if (typeof VibeMe.bus !== 'undefined') {
                VibeMe.bus.emit('vibeme:quote:changed', __payload); // P1 compatibility
                VibeMe.bus.emit('quote:changed', __payload);         // cleaner new name
            }
        }, 450); // After both text contents are set (400ms + buffer)
    },

    // ===== TIMER FUNCTIONALITY =====
    startTimer: function() {
        if (this.state.timerInterval) clearInterval(this.state.timerInterval);
        
        this.state.countdown = 10;
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) countdownEl.textContent = this.state.countdown;
        
        if (!this.state.isPaused) {
            this.state.timerInterval = setInterval(() => {
                this.state.countdown--;
                if (countdownEl) countdownEl.textContent = this.state.countdown;
                
                if (this.state.countdown <= 0) {
                    this.updateQuote();
                    this.startTimer();
                }
            }, 1000);
        }
    },

    toggleTimer: function() {
        this.state.isPaused = !this.state.isPaused;
        const btn = document.getElementById('timer-toggle-btn');
        const icon = btn ? btn.querySelector('i') : null;
        
        if (this.state.isPaused) {
            clearInterval(this.state.timerInterval);
            if (icon) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        } else {
            this.startTimer();
            if (icon) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            }
        }

        this.playSound('click');
        this.triggerHapticFeedback('light');
    },

    // ===== COPY FUNCTIONALITY =====
    copyQuote: async function() {
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        
        if (quoteText && quoteAuthor) {
            const text = `${quoteText.textContent} ${quoteAuthor.textContent}`;
            
            try {
                await navigator.clipboard.writeText(text);
                this.showFeedback("Copied to clipboard!", 'success');
                this.playSound('success');
                this.triggerHapticFeedback('medium');
            } catch (err) {
                this.showFeedback("Copy failed", 'error');
                this.playSound('error');
            }
        }
    },

    // ===== FAVORITES FUNCTIONALITY =====
    toggleFavorite: function() {
        const quote = this.getCurrentQuote();
        const favoriteBtn = document.getElementById('favorite-quote-btn');
        const icon = favoriteBtn ? favoriteBtn.querySelector('i') : null;
        
        const existingIndex = this.state.favorites.findIndex(fav => 
            fav.text === quote.text && fav.author === quote.author
        );
        
        if (existingIndex >= 0) {
            // Remove from favorites
            this.state.favorites.splice(existingIndex, 1);
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            if (favoriteBtn) {
                favoriteBtn.setAttribute('aria-pressed', 'false');
            }
            this.showFeedback("Removed from favorites", 'info');
            this.playSound('click');
        } else {
            // Add to favorites
            this.state.favorites.push(quote);
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.classList.add('pulse-favorite');
                setTimeout(() => icon.classList.remove('pulse-favorite'), 600);
            }
            if (favoriteBtn) {
                favoriteBtn.setAttribute('aria-pressed', 'true');
            }
            this.showFeedback("Added to favorites! ❤️", 'success');
            this.playSound('favorite');
            this.triggerHapticFeedback('medium');
            this.createHeartParticles();
        }
        
        this.saveFavorites();
    },

    // ===== SOCIAL SHARING =====
    updateSocialLinks: function(quote) {
        const text = `"${quote.text}" — ${quote.author}`;
        const url = window.location.href;
        
        const links = {
            'twitter-share': `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            'facebook-share': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
            'linkedin-share': `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=Inspirational%20Quote&summary=${encodeURIComponent(text)}`,
            'whatsapp-share': `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            'pinterest-share': `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`
        };
        
        Object.entries(links).forEach(([id, href]) => {
            const element = document.getElementById(id);
            if (element) element.href = href;
        });
    },

    // ===== SETTINGS & PREFERENCES =====

    toggleEffects: function() {
        const checkbox = document.getElementById('effects-toggle-checkbox');
        if (checkbox) {
            this.state.effectsEnabled = checkbox.checked;
            document.body.classList.toggle('effects-disabled', !this.state.effectsEnabled);
            localStorage.setItem('vibeme-effects', this.state.effectsEnabled);
            
            // Handle effects cleanup/restart for both renderers
            if (!this.state.effectsEnabled) {
                this.stopMouseGlow();
                this.stopMatrixEffect();
                this.stopCanvasMatrix();
            } else {
                this.setupMouseGlow();
                
                // Restart matrix effects based on render mode
                if (this.matrixConfig.renderMode === 'dom' || this.matrixConfig.renderMode === 'hybrid') {
                    this.setupMatrixEffect();
                }
                if (this.matrixConfig.renderMode === 'canvas' || this.matrixConfig.renderMode === 'hybrid') {
                    this.initializeCanvasMatrix();
                }
            }
            
            this.playSound('click');
        }
    },

    stopMouseGlow: function() {
        if (this.mouseGlowState) {
            // Clean up animation frames
            if (this.mouseGlowState.animationId) {
                cancelAnimationFrame(this.mouseGlowState.animationId);
                this.mouseGlowState.animationId = null;
            }
            
            if (this.mouseGlowState.colorAnimationId) {
                cancelAnimationFrame(this.mouseGlowState.colorAnimationId);
                this.mouseGlowState.colorAnimationId = null;
            }
            
            if (this.mouseGlowState.profileChangeInterval) {
                clearInterval(this.mouseGlowState.profileChangeInterval);
                this.mouseGlowState.profileChangeInterval = null;
            }
            
            // Hide the element
            const element = document.getElementById('mouse-glow');
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translate3d(0, 0, 0)';
            }
        }
    },

    clearFavorites: function() {
        if (confirm('Are you sure you want to clear all favorites?')) {
            this.state.favorites = [];
            this.saveFavorites();
            this.showFeedback("Favorites cleared", 'info');
            this.playSound('click');
        }
    },

    // ===== CUSTOM QUOTES =====
    toggleAddQuoteForm: function() {
        const form = document.getElementById('add-quote-form');
        if (form) {
            form.classList.toggle('hidden');
            this.playSound('click');
        }
    },

    submitQuote: function() {
        const textInput = document.getElementById('new-quote-text');
        const authorInput = document.getElementById('new-quote-author');
        
        if (textInput && textInput.value.trim()) {
            const newQuote = {
                text: textInput.value.trim(),
                author: authorInput ? authorInput.value.trim() || 'Anonymous' : 'Anonymous'
            };
            
            this.state.customQuotes.push(newQuote);
            this.saveCustomQuotes();
            
            textInput.value = '';
            if (authorInput) authorInput.value = '';
            
            this.toggleAddQuoteForm();
            this.showFeedback("Quote added successfully!", 'success');
            this.playSound('success');
        }
    },

    // ===== AUDIO SYSTEM =====
    initializeAudio: function() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Audio context not supported');
        }
    },

    playSound: function(type) {
        if (!this.audioContext || !this.state.effectsEnabled) return;

        const frequencies = {
            click: 800,
            generate: 600,
            success: 523.25, // C5
            favorite: 659.25, // E5
            error: 200
        };

        const frequency = frequencies[type] || frequencies.click;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type === 'error' ? 'sawtooth' : 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (error) {
            // Silent failure for audio
        }
    },

    // ===== HAPTIC FEEDBACK =====
    triggerHapticFeedback: function(intensity = 'light') {
        if ('vibrate' in navigator && this.state.effectsEnabled) {
            const patterns = {
                light: [10],
                medium: [20],
                strong: [30]
            };
            navigator.vibrate(patterns[intensity] || patterns.light);
        }
    },

    // ===== VISUAL EFFECTS =====
    initializeEffects: function() {
        this.setupMouseGlow();
        
        // Initialize matrix effects based on render mode
        if (this.matrixConfig.renderMode === 'dom' || this.matrixConfig.renderMode === 'hybrid') {
            this.setupMatrixEffect();
        }
        if (this.matrixConfig.renderMode === 'canvas' || this.matrixConfig.renderMode === 'hybrid') {
            this.initializeCanvasMatrix();
        }
    },

    // ===== THEME SYSTEM =====
    initializeThemes: function() {
        this.applyRandomTheme();
    },

    // Enhanced theme generation with user preferences
    getRandomTheme: function() {
        // Check if user has color preferences stored
        const colorPrefs = JSON.parse(localStorage.getItem('vibeme-color-preferences') || '{}');
        
        const options = {
            harmonyType: colorPrefs.harmonyType || 'auto',
            vibrancy: colorPrefs.vibrancy || 0.7,
            warmth: colorPrefs.warmth || 0.5,
            accessibility: colorPrefs.accessibility !== false, // default to true
            baseHue: colorPrefs.baseHue || null
        };
        
        return this.generateIntelligentTheme(options);
    },

    applyRandomTheme: function() {
        const theme = this.getRandomTheme();
        this.applyTheme(theme);
        
        // Store the current theme for matrix adaptation
        this.currentTheme = theme;
        
        // Update matrix colors to complement the new theme
        this.updateMatrixColors(theme);
        
        // Debug logging with theme info
        console.log('🎨 Applied new theme:', {
            harmony: theme.harmonyType,
            colors: [theme.color1, theme.color2, theme.color3],
            vibrancy: theme.vibrancy,
            baseHue: theme.baseHue
        });
    },

    applyTheme: function(theme) {
        const root = document.documentElement;
        root.style.setProperty('--color1', theme.color1);
        root.style.setProperty('--color2', theme.color2);
        root.style.setProperty('--color3', theme.color3);
        
        // Calculate optimal text colors using WCAG standards
        const backgroundColor = theme.color1; // Primary background color
        
        // Get optimal text colors that meet accessibility standards
        const textMain = this.generateAccessibleTextColor(backgroundColor, 'main');
        const textSecondary = this.generateAccessibleTextColor(theme.color2, 'secondary');
        const socialBg = this.generateAccessibleSocialBg(theme);
        
        root.style.setProperty('--text-color-main', textMain);
        root.style.setProperty('--text-color-secondary', textSecondary);
        root.style.setProperty('--social-icon-bg', socialBg);
        
        // Debug contrast ratios
        const mainContrast = this.getContrastRatio(textMain, backgroundColor);
        console.log('🔍 Contrast ratios:', {
            main: mainContrast.toFixed(2),
            wcagAA: mainContrast >= 4.5 ? '✅' : '❌',
            wcagAAA: mainContrast >= 7.0 ? '✅' : '❌'
        });
    },

    // Generate accessible text color for different text types
    generateAccessibleTextColor: function(backgroundColor, textType = 'main') {
        const minContrast = textType === 'main' ? 4.5 : 3.0; // WCAG AA standards
        
        // Try optimal colors first
        const optimal = this.getOptimalTextColor(backgroundColor);
        if (this.getContrastRatio(optimal, backgroundColor) >= minContrast) {
            return optimal;
        }
        
        // If optimal doesn't work, generate a contrasting color
        let contrastColor = this.generateContrastingColor(backgroundColor, minContrast);
        
        // Final fallback: pure black or white
        if (this.getContrastRatio(contrastColor, backgroundColor) < minContrast) {
            const luminance = this.getRelativeLuminance(backgroundColor);
            contrastColor = luminance > 0.5 ? '#000000' : '#ffffff';
        }
        
        return contrastColor;
    },

    // Generate accessible social icon background
    generateAccessibleSocialBg: function(theme) {
        // Try a slightly darker version of color1 first
        let socialBg = this.adjustBrightness(theme.color1, -20);
        
        // Ensure it contrasts well with white icons
        if (this.getContrastRatio('#ffffff', socialBg) < 3.0) {
            socialBg = this.adjustBrightness(theme.color1, -40);
        }
        
        // Final fallback
        if (this.getContrastRatio('#ffffff', socialBg) < 3.0) {
            const luminance = this.getRelativeLuminance(theme.color1);
            socialBg = luminance > 0.5 ? '#333333' : '#cccccc';
        }
        
        return socialBg;
    },

    // ===== ADAPTIVE MATRIX COLORS =====
    
    // Enhanced matrix color system with intelligent blend modes
    updateMatrixColors: function(theme) {
        // Calculate background luminance for blend mode decision
        const avgLuminance = this.calculateAverageBackgroundLuminance(theme);
        const isLightBackground = avgLuminance > 0.4; // Slightly lower threshold for better contrast
        
        // Apply intelligent blend mode
        this.applyMatrixBlendMode(isLightBackground, avgLuminance);
        
        // Generate enhanced complementary colors with contrast validation
        const baseHue = theme.baseHue || 0;
        const matrixBaseHue = (baseHue + 180) % 360; // True complementary color
        
        // Create optimized matrix color palette
        const matrixColors = this.generateOptimizedMatrixPalette(matrixBaseHue, isLightBackground, avgLuminance);
        
        // Update the matrix configuration
        this.matrixConfig.colors = matrixColors;
        this.matrixConfig.isLightBackground = isLightBackground;
        this.matrixConfig.backgroundLuminance = avgLuminance;
        
        // Refresh existing columns with new colors and blend modes
        if (this.matrixState.activeColumns.length > 0) {
            this.refreshMatrixColors();
        }
        
        // Also update Canvas renderer if it's active
        if ((this.matrixConfig.renderMode === 'canvas' || this.matrixConfig.renderMode === 'hybrid') && 
            this.matrixState.canvasDrops.length > 0) {
            this.refreshCanvasColors();
        }
        
        console.log('🔮 Enhanced matrix system updated:', {
            backgroundType: isLightBackground ? 'light' : 'dark',
            luminance: avgLuminance.toFixed(3),
            blendMode: this.getActiveBlendMode(),
            baseHue: matrixBaseHue,
            colors: matrixColors,
            renderMode: this.matrixConfig.renderMode
        });
    },

    // Calculate average luminance across all background colors
    calculateAverageBackgroundLuminance: function(theme) {
        const colors = [theme.color1, theme.color2, theme.color3];
        const luminances = colors.map(color => this.getRelativeLuminance(color));
        
        // Weighted average (give more weight to primary color)
        const weights = [0.5, 0.3, 0.2];
        const weightedSum = luminances.reduce((sum, lum, index) => sum + (lum * weights[index]), 0);
        
        return weightedSum;
    },

    // Apply intelligent blend mode based on background analysis
    applyMatrixBlendMode: function(isLightBackground, luminance) {
        const body = document.body;
        
        // Remove existing matrix mode classes
        body.classList.remove('matrix-mode-dark-bg', 'matrix-mode-light-bg', 'matrix-mode-high-contrast');
        
        // Get user preference for matrix mode
        const matrixPrefs = JSON.parse(localStorage.getItem('vibeme-matrix-preferences') || '{}');
        const forceHighContrast = matrixPrefs.highContrast || false;
        const blendModeOverride = matrixPrefs.blendModeOverride || 'auto';
        
        if (forceHighContrast || blendModeOverride === 'high-contrast') {
            body.classList.add('matrix-mode-high-contrast');
        } else if (blendModeOverride !== 'auto') {
            // Manual override
            body.classList.add(`matrix-mode-${blendModeOverride}`);
        } else {
            // Intelligent automatic selection
            if (isLightBackground) {
                body.classList.add('matrix-mode-light-bg');
            } else {
                body.classList.add('matrix-mode-dark-bg');
            }
        }
    },

    // Get the currently active blend mode for debugging
    getActiveBlendMode: function() {
        const body = document.body;
        if (body.classList.contains('matrix-mode-high-contrast')) return 'high-contrast';
        if (body.classList.contains('matrix-mode-light-bg')) return 'light-bg (multiply)';
        if (body.classList.contains('matrix-mode-dark-bg')) return 'dark-bg (screen)';
        return 'none';
    },

    // Generate optimized matrix color palette with contrast validation
    generateOptimizedMatrixPalette: function(baseHue, isLightBackground, backgroundLuminance) {
        const colors = [];
        
        for (let i = 0; i < 6; i++) {
            const hueVariation = (baseHue + (i * 25)) % 360; // Slightly wider spread for more variety
            
            let saturation, lightness;
            
            if (isLightBackground) {
                // For light backgrounds: use darker, more saturated colors
                saturation = Math.max(70, 85 + (i * 2)); // High saturation
                lightness = Math.max(15, 25 + (i * 8));  // Dark colors
            } else {
                // For dark backgrounds: use brighter, vibrant colors
                saturation = Math.max(60, 75 + (i * 3)); // High saturation
                lightness = Math.max(50, 65 + (i * 5));  // Bright colors
            }
            
            // Clamp values to valid ranges
            saturation = Math.min(95, saturation);
            lightness = Math.min(85, lightness);
            
            const color = this.hslToHex(hueVariation, saturation, lightness);
            
            // Validate contrast and adjust if necessary
            const validatedColor = this.validateMatrixColorContrast(color, backgroundLuminance, isLightBackground);
            
            colors.push(validatedColor);
        }
        
        return colors;
    },

    // Validate and adjust matrix color contrast
    validateMatrixColorContrast: function(color, backgroundLuminance, isLightBackground) {
        const colorLuminance = this.getRelativeLuminance(color);
        const contrastRatio = backgroundLuminance > colorLuminance 
            ? (backgroundLuminance + 0.05) / (colorLuminance + 0.05)
            : (colorLuminance + 0.05) / (backgroundLuminance + 0.05);
        
        const minContrast = 3.0; // Minimum contrast for matrix visibility
        
        if (contrastRatio < minContrast) {
            const hsl = this.hexToHsl(color);
            if (!hsl) return color;
            
            // Adjust lightness to improve contrast
            if (isLightBackground) {
                // Make darker for light backgrounds
                hsl.l = Math.max(5, hsl.l - 20);
            } else {
                // Make brighter for dark backgrounds
                hsl.l = Math.min(95, hsl.l + 20);
            }
            
            return this.hslToHex(hsl.h, hsl.s, hsl.l);
        }
        
        return color;
    },

    // Refresh existing matrix columns with new colors
    refreshMatrixColors: function() {
        const columns = document.querySelectorAll('.binary-column');
        columns.forEach((column, index) => {
            const colorIndex = index % this.matrixConfig.colors.length;
            const color = this.matrixConfig.colors[colorIndex];
            
            // Update the column's text color
            column.style.color = color;
            column.style.textShadow = `0 0 5px ${color}`;
        });
    },

    // Enhanced matrix creation with bidirectional movement and advanced trail effects
    createMatrixColumn: function() {
        if (!this.state.effectsEnabled) return;
        
        const column = document.createElement('div');
        column.className = 'binary-column';
        
        // Use current matrix colors with rotation
        const colorIndex = this.matrixState.activeColumns.length % this.matrixConfig.colors.length;
        const color = this.matrixConfig.colors[colorIndex];
        
        // Bidirectional movement: randomly choose direction if enabled
        const direction = this.matrixConfig.bidirectional ? 
            (Math.random() < 0.5 ? 1 : -1) : 1; // 1 = down, -1 = up
        
        // Store direction for this column
        const columnId = `column_${Date.now()}_${Math.random()}`;
        column.dataset.columnId = columnId;
        this.matrixState.columnDirections.set(columnId, direction);
        
        // Generate matrix characters with enhanced character set
        const chars = this.matrixConfig.characters;
        const streamLength = Math.floor(Math.random() * this.matrixConfig.trailLength) + 10;
        let columnContent = '';
        
        for (let i = 0; i < streamLength; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            let charClass = '';
            
            if (i === 0) {
                // Leading character - gets special highlight
                charClass = 'matrix-head';
            } else if (i <= 5) {
                // Trailing characters with enhanced fade effect
                charClass = `matrix-trail-${Math.min(i, 5)}`;
            }
            
            columnContent += `<span class="${charClass}">${char}</span>`;
        }
        
        // Apply adaptive styling with bidirectional animation support
        const startPosition = direction === 1 ? '-100vh' : '100vh'; // Start above or below screen
        const animationName = direction === 1 ? 'matrix-fall' : 'matrix-rise';
        
        column.style.cssText = `
            position: fixed;
            top: ${startPosition};
            width: ${this.matrixConfig.columnWidth}px;
            font-family: 'Courier New', 'Roboto Mono', monospace;
            font-size: ${this.getMatrixFontSize()}px;
            font-weight: bold;
            line-height: 1.1;
            pointer-events: none;
            z-index: -1;
            color: ${color};
            animation: ${animationName} ${this.getMatrixFallDuration()}s linear forwards;
            will-change: transform, opacity;
            --direction: ${direction};
        `;
        
        column.innerHTML = columnContent;
        
        // Position randomly with better distribution
        const maxLeft = window.innerWidth - this.matrixConfig.columnWidth;
        const leftPosition = Math.random() * maxLeft;
        column.style.left = `${leftPosition}px`;
        
        // Add slight random delay for more organic feel
        const delay = Math.random() * 1000;
        setTimeout(() => {
            if (this.state.effectsEnabled) {
                document.body.appendChild(column);
                this.matrixState.activeColumns.push(column);
            }
        }, delay);
        
        // Remove after animation with cleanup
        const fallDuration = this.getMatrixFallDuration();
        setTimeout(() => {
            this.removeMatrixColumn(column);
        }, (fallDuration * 1000) + delay);
    },

    // Get responsive font size for matrix
    getMatrixFontSize: function() {
        if (window.innerWidth <= 640) return 11; // Mobile
        if (window.innerWidth <= 1024) return 12; // Tablet  
        return 14; // Desktop
    },

    // Get matrix fall duration based on user preferences
    getMatrixFallDuration: function() {
        const matrixPrefs = JSON.parse(localStorage.getItem('vibeme-matrix-preferences') || '{}');
        const speedMultiplier = matrixPrefs.animationSpeed || 1.0;
        return Math.max(4, Math.min(12, 8 / speedMultiplier)); // 4-12 second range
    },

    // Safe matrix column removal
    removeMatrixColumn: function(column) {
        try {
            if (column && column.parentNode) {
                column.parentNode.removeChild(column);
            }
            const index = this.matrixState.activeColumns.indexOf(column);
            if (index > -1) {
                this.matrixState.activeColumns.splice(index, 1);
            }
        } catch (error) {
            console.warn('Matrix column removal error:', error);
        }
    },

    darkenColor: function(color, percent) {
        // Remove # if present
        color = color.replace('#', '');
        
        // Parse RGB values
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        
        // Darken by percentage
        const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
        const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
        const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));
        
        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    },

    // ===== ADVANCED COLOR SCIENCE UTILITIES =====
    
    // Convert HEX to RGB
    hexToRgb: function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    // Convert RGB to HEX
    rgbToHex: function(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // Convert RGB to HSL
    rgbToHsl: function(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    },

    // Convert HSL to RGB
    hslToRgb: function(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },

    // Convert HEX to HSL
    hexToHsl: function(hex) {
        const rgb = this.hexToRgb(hex);
        return rgb ? this.rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
    },

    // Convert HSL to HEX
    hslToHex: function(h, s, l) {
        const rgb = this.hslToRgb(h, s, l);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    },

    // Calculate relative luminance (WCAG 2.1 standard)
    getRelativeLuminance: function(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return 0;
        
        // Convert to sRGB
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;
        
        // Apply gamma correction
        const gamma = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        
        const rLinear = gamma(rsRGB);
        const gLinear = gamma(gsRGB);
        const bLinear = gamma(bsRGB);
        
        // Calculate luminance using WCAG formula
        return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    },

    // Calculate contrast ratio between two colors (WCAG 2.1 standard)
    getContrastRatio: function(color1, color2) {
        const lum1 = this.getRelativeLuminance(color1);
        const lum2 = this.getRelativeLuminance(color2);
        
        const lightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        return (lightest + 0.05) / (darkest + 0.05);
    },

    // Check if color combination meets WCAG accessibility standards
    meetsWCAGStandards: function(foreground, background, level = 'AA') {
        const contrast = this.getContrastRatio(foreground, background);
        
        switch (level) {
            case 'AA': return contrast >= 4.5;
            case 'AAA': return contrast >= 7.0;
            case 'AA-large': return contrast >= 3.0; // For large text (18pt+ or 14pt+ bold)
            default: return contrast >= 4.5;
        }
    },

    // Get optimal text color (black or white) for a background
    getOptimalTextColor: function(backgroundColor) {
        const contrastWithWhite = this.getContrastRatio('#ffffff', backgroundColor);
        const contrastWithBlack = this.getContrastRatio('#000000', backgroundColor);
        
        return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000';
    },

    // Adjust color brightness while maintaining hue
    adjustBrightness: function(hex, amount) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return hex;
        
        // Adjust lightness, keeping within bounds
        hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
        
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    },

    // Adjust color saturation
    adjustSaturation: function(hex, amount) {
        const hsl = this.hexToHsl(hex);
        if (!hsl) return hex;
        
        // Adjust saturation, keeping within bounds
        hsl.s = Math.max(0, Math.min(100, hsl.s + amount));
        
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    },

    // Generate a color that contrasts well with the given color
    generateContrastingColor: function(baseColor, minContrast = 4.5) {
        const baseLuminance = this.getRelativeLuminance(baseColor);
        
        // Try white first, then black
        if (this.getContrastRatio('#ffffff', baseColor) >= minContrast) {
            return '#ffffff';
        }
        if (this.getContrastRatio('#000000', baseColor) >= minContrast) {
            return '#000000';
        }
        
        // If neither works, adjust the base color
        const hsl = this.hexToHsl(baseColor);
        if (!hsl) return '#ffffff';
        
        // Make it much lighter or darker
        if (baseLuminance > 0.5) {
            hsl.l = Math.max(0, hsl.l - 50); // Make much darker
        } else {
            hsl.l = Math.min(100, hsl.l + 50); // Make much lighter
        }
        
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    },

    // ===== COLOR HARMONY GENERATORS =====
    
    // Generate analogous color scheme (colors next to each other on color wheel)
    generateAnalogousColors: function(baseHue, saturation = 70, lightness = 60, spread = 30) {
        const colors = [];
        for (let i = -1; i <= 1; i++) {
            const hue = (baseHue + (i * spread) + 360) % 360;
            colors.push(this.hslToHex(hue, saturation, lightness));
        }
        return colors;
    },

    // Generate triadic color scheme (three colors evenly spaced on color wheel)
    generateTriadicColors: function(baseHue, saturation = 70, lightness = 60) {
        const colors = [];
        for (let i = 0; i < 3; i++) {
            const hue = (baseHue + (i * 120)) % 360;
            colors.push(this.hslToHex(hue, saturation, lightness));
        }
        return colors;
    },

    // Generate complementary color scheme (opposite colors on color wheel)
    generateComplementaryColors: function(baseHue, saturation = 70, lightness = 60) {
        const baseColor = this.hslToHex(baseHue, saturation, lightness);
        const complementaryHue = (baseHue + 180) % 360;
        const complementaryColor = this.hslToHex(complementaryHue, saturation, lightness);
        
        // Add a third color that's a variation of the base
        const accentColor = this.hslToHex(baseHue, saturation * 0.8, lightness * 1.2);
        
        return [baseColor, complementaryColor, accentColor];
    },

    // Generate split-complementary color scheme
    generateSplitComplementaryColors: function(baseHue, saturation = 70, lightness = 60) {
        const baseColor = this.hslToHex(baseHue, saturation, lightness);
        const comp1Hue = (baseHue + 150) % 360;
        const comp2Hue = (baseHue + 210) % 360;
        
        return [
            baseColor,
            this.hslToHex(comp1Hue, saturation, lightness),
            this.hslToHex(comp2Hue, saturation, lightness)
        ];
    },

    // Generate tetradic (rectangle) color scheme
    generateTetradicColors: function(baseHue, saturation = 70, lightness = 60) {
        const colors = [];
        const offsets = [0, 60, 180, 240];
        
        for (const offset of offsets) {
            const hue = (baseHue + offset) % 360;
            colors.push(this.hslToHex(hue, saturation, lightness));
        }
        
        return colors.slice(0, 3); // Return only first 3 for consistency
    },

    // Generate monochromatic color scheme (same hue, different saturation/lightness)
    generateMonochromaticColors: function(baseHue, baseSaturation = 70, baseLightness = 60) {
        return [
            this.hslToHex(baseHue, baseSaturation, baseLightness),
            this.hslToHex(baseHue, baseSaturation * 0.7, baseLightness * 1.3),
            this.hslToHex(baseHue, baseSaturation * 1.2, baseLightness * 0.8)
        ];
    },

    // Generate a vibrant color palette with constraints
    generateVibriantPalette: function(baseHue, vibrancy = 0.8, warmth = 0.5) {
        // Adjust saturation and lightness based on vibrancy
        const saturation = Math.max(40, Math.min(95, 50 + (vibrancy * 45)));
        const lightness = Math.max(30, Math.min(80, 45 + (vibrancy * 25)));
        
        // Adjust hue slightly based on warmth preference
        const hueShift = (warmth - 0.5) * 60; // Shift towards warm/cool
        const adjustedHue = (baseHue + hueShift + 360) % 360;
        
        // Generate harmonious colors based on golden ratio
        const goldenAngle = 137.5; // Golden angle in degrees
        const colors = [];
        
        for (let i = 0; i < 3; i++) {
            const hue = (adjustedHue + (i * goldenAngle)) % 360;
            const sat = saturation + (Math.sin(i * Math.PI / 3) * 15); // Vary saturation
            const light = lightness + (Math.cos(i * Math.PI / 3) * 15); // Vary lightness
            
            colors.push(this.hslToHex(
                hue,
                Math.max(20, Math.min(95, sat)),
                Math.max(25, Math.min(85, light))
            ));
        }
        
        return colors;
    },

    // Intelligent theme generator that chooses the best harmony type
    generateIntelligentTheme: function(options = {}) {
        const {
            harmonyType = 'auto',
            vibrancy = 0.7,
            warmth = 0.5,
            accessibility = true,
            baseHue = null
        } = options;
        
        // Generate or use provided base hue
        const hue = baseHue !== null ? baseHue : Math.floor(Math.random() * 360);
        
        // Calculate optimal saturation and lightness
        const saturation = Math.max(30, Math.min(90, 40 + (vibrancy * 50)));
        const lightness = Math.max(35, Math.min(75, 45 + (vibrancy * 20)));
        
        let colors;
        
        // Choose harmony type intelligently or use specified type
        if (harmonyType === 'auto') {
            const harmonies = ['analogous', 'triadic', 'complementary', 'vibrant'];
            const chosenHarmony = harmonies[Math.floor(Math.random() * harmonies.length)];
            
            switch (chosenHarmony) {
                case 'analogous': colors = this.generateAnalogousColors(hue, saturation, lightness); break;
                case 'triadic': colors = this.generateTriadicColors(hue, saturation, lightness); break;
                case 'complementary': colors = this.generateComplementaryColors(hue, saturation, lightness); break;
                case 'vibrant': colors = this.generateVibriantPalette(hue, vibrancy, warmth); break;
                default: colors = this.generateAnalogousColors(hue, saturation, lightness);
            }
        } else {
            switch (harmonyType) {
                case 'analogous': colors = this.generateAnalogousColors(hue, saturation, lightness); break;
                case 'triadic': colors = this.generateTriadicColors(hue, saturation, lightness); break;
                case 'complementary': colors = this.generateComplementaryColors(hue, saturation, lightness); break;
                case 'split-complementary': colors = this.generateSplitComplementaryColors(hue, saturation, lightness); break;
                case 'tetradic': colors = this.generateTetradicColors(hue, saturation, lightness); break;
                case 'monochromatic': colors = this.generateMonochromaticColors(hue, saturation, lightness); break;
                case 'vibrant': colors = this.generateVibriantPalette(hue, vibrancy, warmth); break;
                default: colors = this.generateAnalogousColors(hue, saturation, lightness);
            }
        }
        
        // Apply accessibility constraints if requested
        if (accessibility) {
            colors = this.ensureAccessibilityCompliance(colors);
        }
        
        return {
            color1: colors[0],
            color2: colors[1],
            color3: colors[2],
            harmonyType: harmonyType === 'auto' ? 'intelligent' : harmonyType,
            baseHue: hue,
            vibrancy,
            warmth
        };
    },

    // Ensure color palette meets accessibility standards
    ensureAccessibilityCompliance: function(colors) {
        const improvedColors = [...colors];
        
        // Check each color against white and black text
        for (let i = 0; i < improvedColors.length; i++) {
            const color = improvedColors[i];
            const contrastWhite = this.getContrastRatio('#ffffff', color);
            const contrastBlack = this.getContrastRatio('#000000', color);
            
            // If neither meets minimum standards, adjust the color
            if (contrastWhite < 3.0 && contrastBlack < 3.0) {
                const hsl = this.hexToHsl(color);
                if (hsl) {
                    // Adjust lightness to improve contrast
                    if (hsl.l > 50) {
                        hsl.l = Math.max(25, hsl.l - 30); // Make darker
                    } else {
                        hsl.l = Math.min(75, hsl.l + 30); // Make lighter
                    }
                    improvedColors[i] = this.hslToHex(hsl.h, hsl.s, hsl.l);
                }
            }
        }
        
        return improvedColors;
    },

    setupMouseGlow: function() {
        const mouseGlow = document.getElementById('mouse-glow');
        if (!mouseGlow) return;

        // Simple state for color animation
        this.mouseGlowState = {
            hue: 200
        };

        // Track mouse movement with direct positioning
        document.addEventListener('mousemove', (e) => {
            if (!this.state.effectsEnabled) return;
            
            // Use requestAnimationFrame for smooth animations
            requestAnimationFrame(() => {
                // Update position directly using left/top instead of transform
                mouseGlow.style.left = `${e.clientX}px`;
                mouseGlow.style.top = `${e.clientY}px`;
                mouseGlow.style.opacity = '0.8';
            });
        });

        // Handle hover effects on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .social-bubble, .quote-container-inner, .quote-container-outer, [role="button"], .action-button, .generate-btn');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (this.state.effectsEnabled) {
                    mouseGlow.classList.add('hover-effect');
                }
            });
            
            el.addEventListener('mouseleave', () => {
                mouseGlow.classList.remove('hover-effect');
            });
        });

        // Hide glow when mouse leaves the page
        document.body.addEventListener('mouseleave', () => {
            mouseGlow.style.opacity = '0';
        });

        // Start color animation
        this.animateMouseGlowColor(mouseGlow);
    },

    animateMouseGlowColor: function(element) {
        const animate = () => {
            if (!this.state.effectsEnabled || !element) {
                requestAnimationFrame(animate);
                return;
            }
            
            // Increment hue for color cycling
            this.mouseGlowState.hue = (this.mouseGlowState.hue + 0.5) % 360;
            
            // Update CSS variable for color
            element.style.setProperty('--glow-hue', this.mouseGlowState.hue.toFixed(2));
            
            // Continue animation
            requestAnimationFrame(animate);
        };
        
        animate();
    },

    // Enhanced hue extraction with better color detection
    extractHueFromColor: function(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return 0;
        
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        
        if (diff === 0) return 0;
        
        let hue = 0;
        if (max === r) {
            hue = ((g - b) / diff) % 6;
        } else if (max === g) {
            hue = (b - r) / diff + 2;
        } else {
            hue = (r - g) / diff + 4;
        }
        
        hue = Math.round(hue * 60);
        return hue < 0 ? hue + 360 : hue;
    },

    getLuminance: function(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },

    // Matrix Color Interpolation Helpers
    interpolateColor: function(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        if (!c1 || !c2) return '#00ff00'; // Fallback
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    },

    convertToRgba: function(color, alpha = 1) {
        if (!color) return 'rgba(255, 255, 255, 0.5)';
        if (color.startsWith('rgb')) return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return 'rgba(255, 255, 255, 0.5)';
    },

    // Debounce utility for performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    setupMatrixEffect: function() {
        // Clean up any existing matrix effect
        this.stopMatrixEffect();
        
        this.matrixBg = document.getElementById('matrix-bg');
        if (!this.matrixBg || !this.state.effectsEnabled) return;

        console.log('🌌 Starting Advanced Matrix Effect...');
        
        // Initialize columns based on screen width
        this.createMatrixColumns();
        
        // Start the update interval
        this.startMatrixUpdates();
        
        // Add resize listener with debouncing
        this.matrixState.resizeHandler = this.debounce(() => this.handleMatrixResize(), 250);
        window.addEventListener('resize', this.matrixState.resizeHandler, { passive: true });
    },

    stopMatrixEffect: function() {
        // Clear interval
        if (this.matrixState.interval) {
            clearInterval(this.matrixState.interval);
            this.matrixState.interval = null;
        }
        
        // Remove resize listener
        if (this.matrixState.resizeHandler) {
            window.removeEventListener('resize', this.matrixState.resizeHandler);
            this.matrixState.resizeHandler = null;
        }
        
        // Clean up all active columns
        this.matrixState.activeColumns.forEach(column => {
            if (column && column.parentNode) {
                column.parentNode.removeChild(column);
            }
        });
        this.matrixState.activeColumns = [];
    },

    createMatrixColumns: function() {
        if (!this.matrixBg || !this.state.effectsEnabled) return;
        
        // Calculate target column count using dynamic density multiplier
        const baseColumnCount = Math.floor(window.innerWidth / this.matrixConfig.columnWidth);
        const densityMultiplier = this.matrixConfig.densityMultiplier || 1.5;
        const targetColumns = Math.floor(baseColumnCount * densityMultiplier);
        const neededColumns = targetColumns - this.matrixState.activeColumns.length;

        if (neededColumns > 0) {
            for (let i = 0; i < neededColumns; i++) {
                this.createSingleMatrixColumn();
            }
        } else if (neededColumns < 0) {
            // Remove excess columns
            for (let i = 0; i < Math.abs(neededColumns); i++) {
                this.removeSingleMatrixColumn();
            }
        }
    },

    createSingleMatrixColumn: function() {
        if (!this.matrixBg || !this.state.effectsEnabled) return;
        
        const column = document.createElement('div');
        column.className = 'binary-column';
        
        // Initialize with recycled content
        this.recycleMatrixColumn(column);
        
        this.matrixBg.appendChild(column);
        this.matrixState.activeColumns.push(column);
        
        // Fade in the column
        requestAnimationFrame(() => setTimeout(() => column.classList.add('visible'), 10));
        
        // Time-based recycling - no event listeners needed
    },

    recycleMatrixColumn: function(column) {
        if (!this.state.effectsEnabled) return;
        
        // Set new horizontal position
        column.style.left = `${Math.random() * 100}%`;
        
        // Generate new matrix content
        column.innerHTML = this.generateMatrixContent();
        
        // Apply position-based gradient color
        this.applyMatrixThemeColors(column);
        
        // Set new animation duration and delay
        const duration = 12 + Math.random() * 8; // 12-20 seconds
        const delay = Math.random() * 4; // 0-4 seconds
        
        // Store animation timing for heartbeat monitoring
        column.dataset.startTime = Date.now() + (delay * 1000);
        column.dataset.duration = duration * 1000;
        
        // Reset and restart animation
        column.style.animation = 'none';
        requestAnimationFrame(() => {
            column.style.animation = `fall ${duration}s linear ${delay}s`;
        });
    },

    checkMatrixColumns: function() {
        if (!this.state.effectsEnabled) return;
        const now = Date.now();
        this.matrixState.activeColumns.forEach(column => {
            const startTime = parseFloat(column.dataset.startTime || 0);
            const duration = parseFloat(column.dataset.duration || 0);
            // If the animation's time is up, recycle it forcefully
            if (startTime && duration && now > startTime + duration) {
                this.recycleMatrixColumn(column);
            }
        });
    },

    generateMatrixContent: function() {
        const chars = this.matrixConfig.characters;
        const maxLength = this.matrixConfig.trailLength;
        const fadeRate = this.matrixConfig.trailFadeRate;
        
        // Variable length trails for more organic appearance
        const length = Math.floor(Math.random() * maxLength) + Math.floor(maxLength * 0.3);
        let content = '';
        
        for (let i = 0; i < length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            
            // Enhanced opacity calculation with exponential decay
            let opacity;
            if (i === 0) {
                // Leading character - maximum brightness
                opacity = 1.0;
            } else if (i <= 3) {
                // High-intensity trail (near head)
                opacity = Math.max(0.7, 1 - (i * 0.15));
            } else {
                // Gradual exponential fade for trailing characters
                const fadePosition = (i - 3) / (length - 3);
                opacity = Math.max(0.1, Math.exp(-fadePosition * 3) * 0.7);
            }
            
            // Apply enhanced opacity with trail fade rate
            const finalOpacity = Math.max(fadeRate, opacity);
            
            // Add enhanced character classes for better styling
            let charClass = 'matrix-char';
            if (i === 0) {
                charClass += ' matrix-head';
            } else if (i <= 5) {
                charClass += ` matrix-trail-${Math.min(i, 5)}`;
            }
            
            content += `<span class="${charClass}" style="opacity: ${finalOpacity.toFixed(3)}">${char}</span>`;
        }
        
        return content;
    },

    applyMatrixThemeColors: function(column) {
        if (!this.matrixConfig.colors || this.matrixConfig.colors.length === 0) return;

        // Use on-screen x to sample gradient (style.left may be '', px, or %)
        const rect = column.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, rect.left / Math.max(1, window.innerWidth)));

        const maxIdx = this.matrixConfig.colors.length - 1;
        const pos = x * maxIdx;
        const base = Math.floor(pos);
        const t = pos - base;

        const c1 = this.matrixConfig.colors[base];
        const c2 = this.matrixConfig.colors[Math.min(base + 1, maxIdx)];
        const mixed = this.interpolateColor(c1, c2, t);

        column.style.color = mixed;
        column.style.textShadow = `0 0 5px ${this.convertToRgba(mixed, 0.7)}`;
    },

    // ===== EVENT LISTENERS =====
    setupEventListeners: function() {
        document.getElementById('generate-btn').addEventListener('click', () => this.updateQuote());
        document.getElementById('timer-toggle-btn').addEventListener('click', () => this.toggleTimer());
        document.getElementById('copy-quote-btn').addEventListener('click', () => this.copyQuote());
        document.getElementById('favorite-quote-btn').addEventListener('click', () => this.toggleFavorite());
        document.getElementById('effects-toggle-checkbox').addEventListener('change', () => this.toggleEffects());
        document.getElementById('clear-favorites-btn').addEventListener('click', () => this.clearFavorites());
        document.getElementById('toggle-add-quote-form').addEventListener('click', () => this.toggleAddQuoteForm());
        document.getElementById('submit-quote-btn').addEventListener('click', () => this.submitQuote());
        
        // Matrix render mode selector
        const renderModeSelector = document.getElementById('matrix-render-mode');
        if (renderModeSelector) {
            renderModeSelector.addEventListener('change', (e) => {
                this.updateMatrixRenderMode(e.target.value);
            });
            
            // Initialize canvas performance settings visibility
            this.toggleCanvasPerformanceSettings(
                renderModeSelector.value === 'canvas' || renderModeSelector.value === 'hybrid'
            );
        }
    },

    // ===== DARK MODE =====
    initializeDarkMode: function() {
        if (this.state.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    },


    // ===== QUOTE VALIDATION =====
    initializeQuoteValidation: function() {
        // This is a placeholder for a more robust validation system.
        // In a real-world application, this would involve more sophisticated checks.
        const textInput = document.getElementById('new-quote-text');
        const submitBtn = document.getElementById('submit-quote-btn');
        if (textInput && submitBtn) {
            textInput.addEventListener('input', () => {
                if (textInput.value.trim().length > 10) {
                    submitBtn.disabled = false;
                } else {
                    submitBtn.disabled = true;
                }
            });
        }
    },

    // ===== STATS =====
    updateStats: function() {
        const now = new Date();
        const lastVisit = this.state.stats.lastVisit ? new Date(this.state.stats.lastVisit) : null;

        if (lastVisit) {
          const diffDays = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) this.state.stats.dayStreak++;
          else if (diffDays > 1) this.state.stats.dayStreak = 1;
        } else {
          this.state.stats.dayStreak = 1;
        }

        this.state.stats.lastVisit = now.toISOString();
        this.saveStats();
      },

    saveStats: function() {
        localStorage.setItem('vibeme-stats', JSON.stringify(this.state.stats));
    },

    // ===== FEEDBACK =====
    showFeedback: function(message, type = 'info') {
        const feedbackEl = document.getElementById('copy-feedback');
        if (feedbackEl) {
          feedbackEl.textContent = message;
          const cls = type === 'success' ? 'text-green-400' : (type === 'error' ? 'text-red-400' : 'dynamic-text-secondary');
          feedbackEl.className = `text-center text-sm mt-3 h-4 ${cls}`;
          setTimeout(() => { feedbackEl.textContent = ''; }, 2000);
        }
      },

    // ===== PARTICLES =====
    createHeartParticles: function() {
        // This is a placeholder for creating heart particles.
    },

    // ===== RATING =====
    rateQuote: function(direction) {
        const quote = this.getCurrentQuote();
        const quoteId = `${quote.text}-${quote.author}`;

        if (!this.state.quoteRatings[quoteId]) {
          this.state.quoteRatings[quoteId] = { up: 0, down: 0 };
        }
        if (direction === 'up') this.state.quoteRatings[quoteId].up++;
        else this.state.quoteRatings[quoteId].down++;

        this.saveRatings();
        this.updateRatingDisplay();
        this.playSound('click');
      },

    updateRatingDisplay: function() {
        const quote = this.getCurrentQuote();
        const quoteId = `${quote.text}-${quote.author}`;
        const rating = this.state.quoteRatings[quoteId] || { up: 0, down: 0 };
        // (display hook optional)
      },

    // ===== USER PREFERENCES =====
    loadUserPreferences: function() {
        const effectsEnabled = localStorage.getItem('vibeme-effects');
        if (effectsEnabled !== null) {
            this.state.effectsEnabled = JSON.parse(effectsEnabled);
        } else {
            this.state.effectsEnabled = true; // Default to enabled
        }
        
        const checkbox = document.getElementById('effects-toggle-checkbox');
        if (checkbox) {
            checkbox.checked = this.state.effectsEnabled;
        }
        document.body.classList.toggle('effects-disabled', !this.state.effectsEnabled);
    },

    saveFavorites: function() {
        localStorage.setItem('vibeme-favorites', JSON.stringify(this.state.favorites));
        // Emit event for favorites panel to update
        document.dispatchEvent(new CustomEvent('vibeme:favorites:changed'));
    },
    updateFavoriteButton: function(quote) {
        const favoriteBtn = document.getElementById('favorite-quote-btn');
        const icon = favoriteBtn ? favoriteBtn.querySelector('i') : null;
        
        if (!icon) return;
        
        const isFavorite = this.state.favorites.findIndex(fav => 
            fav.text === quote.text && fav.author === quote.author
        ) >= 0;
        
        if (isFavorite) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            favoriteBtn.setAttribute('aria-pressed', 'true');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            favoriteBtn.setAttribute('aria-pressed', 'false');
        }
    },

    saveCustomQuotes: function() {
        localStorage.setItem('vibeme-custom-quotes', JSON.stringify(this.state.customQuotes));
    },

    // ===== MATRIX RESIZE =====
    handleMatrixResize: function() {
        this.createMatrixColumns();
    },

    // ===== MATRIX UPDATES =====
    startMatrixUpdates: function() {
        if (this.matrixState.interval) clearInterval(this.matrixState.interval);
        this.matrixState.interval = setInterval(() => {
            this.checkMatrixColumns();
        }, this.matrixConfig.updateInterval);
    },

    // ===== CANVAS MATRIX =====
    initializeCanvasMatrix: function() {
        if (!this.state.effectsEnabled) return;

        console.log('🎨 Initializing Canvas Matrix Rain...');

        try {
            // Get canvas element and context
            this.matrixState.canvas = document.getElementById('matrix-canvas');
            if (!this.matrixState.canvas) {
                console.warn('⚠️ Canvas element not found');
                return;
            }

            this.matrixState.canvasContext = this.matrixState.canvas.getContext('2d');
            if (!this.matrixState.canvasContext) {
                console.warn('⚠️ Canvas context not available');
                return;
            }

            // [region:matrix-canvas-init]
            const ctx = this.matrixState.canvasContext;
            ctx.imageSmoothingEnabled = true;        // anti-alias text
            ctx.globalCompositeOperation = 'lighter';// lightens instead of stacking opaque pixels
            // [end:matrix-canvas-init]

            // Show canvas
            this.matrixState.canvas.style.display = 'block';

            // Set up canvas size
            this.resizeCanvasMatrix();

            // Initialize drop system
            this.initializeCanvasDrops();

            // Start animation loop
            this.startCanvasAnimation();

            // Add resize listener
            if (!this.matrixState.canvasResizeHandler) {
                this.matrixState.canvasResizeHandler = this.debounce(() => {
                    this.resizeCanvasMatrix();
                    this.initializeCanvasDrops();
                }, 250);
                window.addEventListener('resize', this.matrixState.canvasResizeHandler, { passive: true });
            }

            console.log('✅ Canvas Matrix Rain initialized successfully');

        } catch (error) {
            console.error('❌ Canvas Matrix initialization failed:', error);
            // Fallback to DOM mode if canvas fails
            this.matrixConfig.renderMode = 'dom';
        }
    },

    resizeCanvas: function() {
        if (!this.matrixState.canvas) return;
        const c = this.matrixState.canvas;
        const dpr = window.devicePixelRatio || 1;

        // CSS size
        c.style.width = '100vw';
        c.style.height = '100vh';

        // Backing store size
        c.width  = Math.floor(window.innerWidth  * dpr);
        c.height = Math.floor(window.innerHeight * dpr);

        if (this.matrixState.canvasContext) {
          this.matrixState.canvasContext.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      },

    initializeCanvasDrops: function() {
        if (!this.matrixState.canvas) return;

        const config = this.matrixConfig.canvasConfig;
        const columns = config.columns || Math.floor(this.matrixState.canvas.width / config.columnSpacing);
        
        // Clear existing drops
        this.matrixState.canvasDrops = [];

        // Initialize drops for each column
        for (let i = 0; i < columns; i++) {
            const drop = this.createCanvasDrop(i);
            this.matrixState.canvasDrops.push(drop);
        }

        console.log(`💧 Initialized ${columns} canvas drops`);
    },

    createCanvasDrop: function(columnIndex) {
        const config = this.matrixConfig.canvasConfig;
        const characters = this.matrixConfig.characters || ['0', '1'];
        
        return {
            x: columnIndex * config.columnSpacing,
            y: Math.random() * this.matrixState.canvas.height / config.fontSize,
            direction: Math.random() < 0.5 ? 1 : -1, // 1 for down, -1 for up
            trail: [],
            length: Math.floor(Math.random() * (this.matrixConfig.trailLength || 20)) + 5,
            speed: 0.8 + Math.random() * 0.4, // Slight speed variation
            opacity: 0.8 + Math.random() * 0.2,
            characters: characters,
            lastCharChange: 0,
            charChangeInterval: 100 + Math.random() * 200 // Character change timing
        };
    },

    startCanvasAnimation: function() {
        this.matrixState.lastFrameTime = 0;

        const animate = (timestamp) => {
          if (!this.state.effectsEnabled) {
            this.matrixState.canvasAnimationId = requestAnimationFrame(animate);
            return;
          }

          const maxFPS = this.matrixConfig.canvasConfig.maxFPS || 60;
          const minFrame = 1000 / maxFPS;
          const delta = timestamp - (this.matrixState.lastFrameTime || 0);

          if (delta >= minFrame) {
            this.matrixState.lastFrameTime = timestamp;
            this.drawCanvasMatrix();
          }

          this.matrixState.canvasAnimationId = requestAnimationFrame(animate);
        };

        this.matrixState.canvasAnimationId = requestAnimationFrame(animate);
      },

    handleCanvasContextLoss: function() {
        if (this.matrixState.canvasRecoveryAttempted) {
            console.error('❌ Canvas recovery failed, switching to DOM mode');
            this.matrixConfig.renderMode = 'dom';
            this.stopCanvasMatrix();
            this.setupMatrixEffect();
            return;
        }

        this.matrixState.canvasRecoveryAttempted = true;
        
        setTimeout(() => {
            try {
                this.matrixState.canvasContext = this.matrixState.canvas.getContext('2d');
                if (this.matrixState.canvasContext) {
                    console.log('✅ Canvas context recovered');
                    this.matrixState.canvasRecoveryAttempted = false;
                }
            } catch (error) {
                console.error('❌ Canvas recovery failed:', error);
                this.matrixConfig.renderMode = 'dom';
                this.stopCanvasMatrix();
                this.setupMatrixEffect();
            }
        }, 1000);
    },

    handleCanvasError: function(error) {
        console.error('❌ Canvas error occurred:', error);
        
        // Stop canvas animation to prevent error loops
        if (this.matrixState.canvasAnimationId) {
            cancelAnimationFrame(this.matrixState.canvasAnimationId);
            this.matrixState.canvasAnimationId = null;
        }

        // Fallback to DOM mode if canvas is causing issues
        if (error.message.includes('context') || error.message.includes('canvas')) {
            console.log('🔄 Falling back to DOM matrix mode due to canvas error');
            this.matrixConfig.renderMode = 'dom';
            this.stopCanvasMatrix();
            this.setupMatrixEffect();
        }
    },

    // [region:matrix-canvas-head-glow]
    drawHeadGlow: function(x, y, baseColor = 'rgba(255,255,255,0.95)') {
        const ctx = this.matrixState.canvasContext;
        const r = 10; // small halo radius; adjust to taste
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0.0, 'rgba(255,255,255,0.95)');
        g.addColorStop(0.4, baseColor);
        g.addColorStop(1.0, 'rgba(255,255,255,0.0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    },
    // [end:matrix-canvas-head-glow]

    drawCanvasMatrix: function() {
        if (!this.matrixState.canvasContext) return;

        const ctx = this.matrixState.canvasContext;
        const canvas = this.matrixState.canvas;
        const cfg = this.matrixConfig.canvasConfig;

        // trailing fade layer
        ctx.fillStyle = `rgba(0,0,0,${1 - (cfg.globalOpacity ?? 0.9)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // font
        const family = cfg.fontFamily || "Roboto Mono, monospace";
        ctx.font = `${cfg.fontSize}px ${family}`;

        const stepX = cfg.columnSpacing;
        for (let i = 0; i < this.matrixState.canvasDrops.length; i++) {
          const text = this.matrixConfig.characters[
            Math.floor(Math.random() * this.matrixConfig.characters.length)
          ];

          const color = this.matrixConfig.colors[i % this.matrixConfig.colors.length];
          const x = i * stepX;
          const y = this.matrixState.canvasDrops[i] * cfg.fontSize;

          // Check if this is a head character (leading position in column)
          const isHeadCharacter = this.matrixState.canvasDrops[i] === 1 || 
                                 (this.matrixState.canvasDrops[i] < 3 && Math.random() > 0.7);

          if (isHeadCharacter) {
            // Draw head glow using radial gradient instead of shadowBlur
            this.drawHeadGlow(x, y, color);
          }
          
          // Draw the character (no shadowBlur to avoid square artifacts)
          ctx.fillStyle = color;
          ctx.shadowBlur = 0; // Remove shadowBlur to prevent square artifacts
          ctx.fillText(text, x, y);

          if (y > canvas.height && Math.random() > 0.975) {
            this.matrixState.canvasDrops[i] = 0;
          }
          this.matrixState.canvasDrops[i]++;
        }
      },

    performCanvasMemoryCleanup: function() {
        console.log('🧹 Performing canvas memory cleanup...');
        
        try {
            // Force garbage collection of trail arrays that are too large
            this.matrixState.canvasDrops.forEach(drop => {
                if (drop.trail.length > drop.length * 1.5) {
                    drop.trail = drop.trail.slice(0, drop.length);
                }
            });

            // Reset performance tracking occasionally
            if (this.matrixState.frameCount > 216000) { // Reset after 1 hour at 60fps
                this.matrixState.frameCount = 0;
                this.matrixState.lastFrameTime = 0;
            }

        } catch (error) {
            console.error('❌ Memory cleanup error:', error);
        }
    },

    // Adaptive performance adjustment based on frame rate
    adjustCanvasPerformance: function() {
        const config = this.matrixConfig.canvasConfig;
        
        if (!config.adaptivePerformance) return;

        const avgFrameTime = this.matrixState.avgFrameTime;
        const targetFrameTime = 1000 / (config.maxFPS || 60);

        if (avgFrameTime > targetFrameTime * 1.5) {
            // Performance is poor, reduce quality
            if (config.glowIntensity > 2) {
                config.glowIntensity = Math.max(2, config.glowIntensity - 1);
                console.log(`📉 Reduced glow intensity to ${config.glowIntensity} for performance`);
            }
        } else if (avgFrameTime < targetFrameTime * 0.8) {
            // Performance is good, can increase quality
            if (config.glowIntensity < 10) {
                config.glowIntensity = Math.min(10, config.glowIntensity + 1);
                console.log(`📈 Increased glow intensity to ${config.glowIntensity}`);
            }
        }
    },

    updateCanvasDrop: function(drop, currentTime) {
        const config = this.matrixConfig.canvasConfig;
        const canvas = this.matrixState.canvas;

        // Add new character to trail head
        if (currentTime - drop.lastCharChange > drop.charChangeInterval) {
            const newChar = drop.characters[Math.floor(Math.random() * drop.characters.length)];
            drop.trail.unshift(newChar);
            drop.lastCharChange = currentTime;
        }

        // Limit trail length
        if (drop.trail.length > drop.length) {
            drop.trail.pop();
        }

        // Move drop
        drop.y += drop.direction * drop.speed;

        // Reset drop when off screen
        if (drop.direction === 1 && drop.y * config.fontSize > canvas.height + drop.length * config.fontSize) {
            // Moving down, reset from top
            drop.y = -drop.length;
            drop.direction = Math.random() < 0.5 ? 1 : -1;
            drop.trail = [];
        } else if (drop.direction === -1 && drop.y * config.fontSize < -drop.length * config.fontSize) {
            // Moving up, reset from bottom
            drop.y = canvas.height / config.fontSize + drop.length;
            drop.direction = Math.random() < 0.5 ? 1 : -1;
            drop.trail = [];
        }
    },

    drawCanvasDrop: function(ctx, drop, dropIndex) {
        const config = this.matrixConfig.canvasConfig;
        const colors = this.matrixConfig.colors;
        
        // Calculate base color for this column using 6-color gradient
        const ratio = dropIndex / (this.matrixState.canvasDrops.length - 1);
        const baseColor = this.interpolateCanvasColors(colors, ratio);

        // Draw each character in the trail
        drop.trail.forEach((char, charIndex) => {
            let charY;
            
            if (drop.direction === 1) {
                charY = (drop.y - charIndex) * config.fontSize;
            } else {
                charY = (drop.y + charIndex) * config.fontSize;
            }

            // Calculate opacity for fading effect
            const trailOpacity = Math.max(0, 1 - (charIndex / drop.trail.length));
            const finalOpacity = trailOpacity * drop.opacity;

            // Apply color with opacity
            const r = parseInt(baseColor.r * finalOpacity);
            const g = parseInt(baseColor.g * finalOpacity);
            const b = parseInt(baseColor.b * finalOpacity);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            // Add glow effect - use gradient for head, shadowBlur for trail
            if (config.glowIntensity > 0) {
                if (charIndex === 0) {
                    // Head character - use radial gradient instead of shadowBlur
                    this.drawHeadGlow(drop.x + config.columnSpacing / 2, charY, `rgba(${r}, ${g}, ${b}, ${finalOpacity})`);
                } else {
                    // Trail characters - keep tiny shadowBlur for subtle glow
                    ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
                    ctx.shadowBlur = Math.min(3, config.glowIntensity * finalOpacity * 0.5); // Reduced shadowBlur for trail
                }
            }

            // Draw character
            ctx.fillText(char, drop.x + config.columnSpacing / 2, charY);
        });

        // Reset shadow for next draw
        ctx.shadowBlur = 0;
    },

    interpolateCanvasColors: function(colors, ratio) {
        if (!colors || colors.length === 0) {
            return { r: 0, g: 255, b: 0 }; // Default green
        }

        const segmentSize = 1 / (colors.length - 1);
        const segmentIndex = Math.floor(ratio / segmentSize);
        const segmentRatio = (ratio % segmentSize) / segmentSize;

        const color1 = this.hexToRgb(colors[segmentIndex] || colors[0]);
        const color2 = this.hexToRgb(colors[segmentIndex + 1] || colors[colors.length - 1]);

        return {
            r: Math.round(color1.r + (color2.r - color1.r) * segmentRatio),
            g: Math.round(color1.g + (color2.g - color1.g) * segmentRatio),
            b: Math.round(color1.b + (color2.b - color1.b) * segmentRatio)
        };
    },

    // Duplicate hexToRgb function (duplicate of the one in color utilities)
    hexToRgb: function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    stopCanvasMatrix: function() {
        console.log('🛑 Stopping Canvas Matrix Rain...');

        try {
            // Stop animation loop
            if (this.matrixState.canvasAnimationId) {
                cancelAnimationFrame(this.matrixState.canvasAnimationId);
                this.matrixState.canvasAnimationId = null;
            }

            // Hide canvas
            if (this.matrixState.canvas) {
                this.matrixState.canvas.style.display = 'none';
            }

            // Clear drops array
            this.matrixState.canvasDrops = [];

            // Remove resize listener
            if (this.matrixState.canvasResizeHandler) {
                window.removeEventListener('resize', this.matrixState.canvasResizeHandler);
                this.matrixState.canvasResizeHandler = null;
            }

            // Clear performance tracking
            this.matrixState.lastFrameTime = 0;
            this.matrixState.frameCount = 0;

            // Clear canvas if available
            if (this.matrixState.canvasContext && this.matrixState.canvas) {
                this.matrixState.canvasContext.clearRect(0, 0, this.matrixState.canvas.width, this.matrixState.canvas.height);
            }

            console.log('✅ Canvas Matrix Rain stopped successfully');

        } catch (error) {
            console.error('❌ Error stopping Canvas Matrix:', error);
        }
    },

    refreshCanvasColors: function() {
        if (!this.matrixState.canvas || !this.matrixState.canvasDrops.length) return;

        console.log('🎨 Refreshing Canvas Matrix colors...');

        try {
            // Colors are automatically applied in the drawing loop via this.matrixConfig.colors
            // This function exists for any future color-specific optimizations or caching
            
            // Optionally, we could pre-calculate color gradients for performance
            const colors = this.matrixConfig.colors;
            if (colors && colors.length > 0) {
                // The color interpolation happens in real-time during drawing
                // This ensures the canvas always uses the latest theme colors
                console.log(`✅ Canvas colors refreshed using palette: [${colors.join(', ')}]`);
            }

        } catch (error) {
            console.error('❌ Error refreshing Canvas Matrix colors:', error);
        }
    },

    // ===== RENDERING MODE SWITCHING =====
    switchMatrixRenderMode: function(newMode) {
        if (!['dom', 'canvas', 'hybrid'].includes(newMode)) {
            console.warn(`⚠️ Invalid render mode: ${newMode}`);
            return;
        }

        const oldMode = this.matrixConfig.renderMode;
        if (oldMode === newMode) return;

        console.log(`🔄 Switching matrix render mode: ${oldMode} → ${newMode}`);

        try {
            // Stop all current matrix effects
            this.stopAllMatrixEffects();

            // Update configuration
            this.matrixConfig.renderMode = newMode;

            // Start effects for new mode (if effects are enabled)
            if (this.state.effectsEnabled) {
                this.startMatrixEffectsForCurrentMode();
            }

            console.log(`✅ Matrix render mode switched to: ${newMode}`);

        } catch (error) {
            console.error('❌ Error switching matrix render mode:', error);
            // Fallback to DOM mode on error
            this.matrixConfig.renderMode = 'dom';
            this.startMatrixEffectsForCurrentMode();
        }
    },

    stopAllMatrixEffects: function() {
        // Stop DOM matrix effect
        this.stopMatrixEffect();
        
        // Stop Canvas matrix effect
        this.stopCanvasMatrix();
    },

    startMatrixEffectsForCurrentMode: function() {
        const mode = this.matrixConfig.renderMode;
        
        // Start DOM matrix (for 'dom' and 'hybrid' modes)
        if (mode === 'dom' || mode === 'hybrid') {
            this.setupMatrixEffect();
        }
        
        // Start Canvas matrix (for 'canvas' and 'hybrid' modes)
        if (mode === 'canvas' || mode === 'hybrid') {
            this.initializeCanvasMatrix();
        }
    },

    // Helper function to update matrix render mode from settings panel
    updateMatrixRenderMode: function(mode) {
        this.switchMatrixRenderMode(mode);
        
        // Update UI to reflect the change
        const selector = document.getElementById('matrix-render-mode');
        if (selector && selector.value !== mode) {
            selector.value = mode;
        }

        // Show/hide canvas performance settings based on mode
        this.toggleCanvasPerformanceSettings(mode === 'canvas' || mode === 'hybrid');
    },

    toggleCanvasPerformanceSettings: function(show) {
        const settings = document.getElementById('canvas-performance-settings');
        if (settings) {
            if (show) {
                settings.classList.remove('hidden');
            } else {
                settings.classList.add('hidden');
            }
        }
    }
};

// ---- VibeMe core extensions (non-destructive) ----
window.VibeMe = window.VibeMe || VibeMe || {}; // use existing const if present
VibeMe.kit = VibeMe.kit || {
  $: (s) => document.querySelector(s),
  $$: (s) => Array.from(document.querySelectorAll(s)),
  bind(el, type, handler, options) { if (el) el.addEventListener(type, handler, options); },
  delegate(root, event, selector, handler) {
    if (!root) return;
    this.bind(root, event, (e) => { const m = e.target?.closest(selector); if (m && root.contains(m)) handler(e, m); });
  }
};

VibeMe.bus = VibeMe.bus || (() => {
  const bus = new EventTarget();
  return {
    emit(eventName, detail) { try { bus.dispatchEvent(new CustomEvent(eventName, { detail })); } catch(e) { console.warn('[VibeBus]', e); } },
    on(eventName, handler) { bus.addEventListener(eventName, handler); }
  };
})();

VibeMe.features = { ...(VibeMe.features || {}), tts: true, effects: true, matrix: true };
// Add voiceURI to persisted TTS settings
VibeMe.settings = VibeMe.settings || {};
VibeMe.settings.tts = {
  ...(VibeMe.settings.tts || {}),
  enabled: (VibeMe.settings.tts?.enabled ?? true),
  rate: (VibeMe.settings.tts?.rate ?? 1.0),
  voiceURI: (VibeMe.settings.tts?.voiceURI ?? null)
};

VibeMe.tts = VibeMe.tts || {
  hasInteracted: false,
  init() {
    if (this.hasInteracted) return;
    this.hasInteracted = true;
    if ('speechSynthesis' in window && speechSynthesis.getVoices().length === 0) {
      // Warm voices on some browsers
      speechSynthesis.getVoices();
    }
  },
  speak(text, opts = {}) {
    try {
      if (!VibeMe.features.tts || !('speechSynthesis' in window) || !text) return;

      const u = new SpeechSynthesisUtterance(text);
      const rate   = opts.rate   ?? VibeMe.settings.tts.rate;
      const pitch  = opts.pitch  ?? 1;
      const volume = opts.volume ?? 1;
      const lang   = opts.lang   ?? (document.documentElement.lang || 'en-US');
      u.rate = rate; u.pitch = pitch; u.volume = volume; u.lang = lang;

      // Voice
      const chosenVoice = opts.voice
        || VibeMe.tts.voices.find(v => v.voiceURI === VibeMe.settings.tts.voiceURI)
        || null;
      if (chosenVoice) u.voice = chosenVoice;

      // Button state (enable Stop while speaking)
      const stopBtn = document.querySelector('#tts-stop-btn');
      if (stopBtn) {
        stopBtn.disabled = false;
        stopBtn.setAttribute('aria-disabled', 'false');
      }
      u.onend = u.onerror = () => {
        const b = document.querySelector('#tts-stop-btn');
        if (b) { b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
      };

      // Cancel anything in flight and speak
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch (err) {
      console.warn('[VibeTTS] speak error', err);
    }
  },
  stop(force = true) {
    try {
      if (!('speechSynthesis' in window)) return;
      // WebKit/Safari can ignore a single cancel unless you pause first
      speechSynthesis.pause();
      speechSynthesis.cancel();

      // If anything is still queued, force a second cancel on the next tick
      if (force) {
        setTimeout(() => {
          try { speechSynthesis.cancel(); } catch {}
        }, 0);
      }

      // Optional: update UI state
      const stopBtn = document.querySelector('#tts-stop-btn');
      if (stopBtn) {
        stopBtn.disabled = true;
        stopBtn.setAttribute('aria-disabled', 'true');
      }
    } catch (e) {
      console.warn('[VibeTTS] stop error', e);
    }
  }
};

// Keep Stop button state in sync if user triggers other speech (Safari/iOS improvement)
if ('speechSynthesis' in window) {
  document.addEventListener('visibilitychange', () => {
    const stopBtn = VibeMe.kit.$('#tts-stop-btn');
    if (!stopBtn) return;
    stopBtn.disabled = !window.speechSynthesis.speaking;
  });
}

// ===== Unified Settings Manager =====
const settingsManager = {
  load() {
    // Unified object
    try {
      const saved = JSON.parse(localStorage.getItem('vibeme-settings') || 'null');
      if (saved?.tts) VibeMe.settings.tts = { ...VibeMe.settings.tts, ...saved.tts };
    } catch(e) { console.warn('[settings] parse', e); }

    // Non-destructive legacy read (optional expansion later)
    try {
      const legacy = {
        darkMode: JSON.parse(localStorage.getItem('vibeme-dark-mode') || 'null'),
        effects : localStorage.getItem('vibeme-effects'),
        theme   : localStorage.getItem('vibeme-theme-preset'),
        matrix  : localStorage.getItem('vibeme-matrix-preset'),
        category: localStorage.getItem('vibeme-category-filter')
      };
      // If you later unify these, fold into VibeMe.settings here.
    } catch(_) {}

    this.applyToUI();
  },
  save() {
    try {
      localStorage.setItem('vibeme-settings', JSON.stringify(VibeMe.settings));
      // (Optional) Dual-write legacy keys for a deprecation period if needed
    } catch(e) { console.warn('[settings] save', e); }
  },
  applyToUI() {
    const { enabled, rate } = VibeMe.settings.tts;
    const enableEl = VibeMe.kit.$('#tts-enable-checkbox');
    const rateEl   = VibeMe.kit.$('#tts-rate');
    const rateLbl  = VibeMe.kit.$('#tts-rate-value');
    if (enableEl) enableEl.checked = !!enabled;
    if (rateEl)   rateEl.value = rate;
    if (rateLbl)  rateLbl.textContent = `${parseFloat(rate).toFixed(1)}x`;
  }
};

// ===== TTS Voice Management =====
VibeMe.tts.voices = [];

VibeMe.tts.getVoicesSafe = function() {
  try { return window.speechSynthesis?.getVoices?.() || []; } catch { return []; }
};

VibeMe.tts.refreshVoices = function() {
  VibeMe.tts.voices = VibeMe.tts.getVoicesSafe();
  const sel = VibeMe.kit.$('#tts-voice');
  if (!sel) return;

  // Rebuild options
  sel.innerHTML = '';
  if (!VibeMe.tts.voices.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'System default';
    sel.appendChild(opt);
    return;
  }

  VibeMe.tts.voices.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.voiceURI;
    opt.textContent = `${v.name} — ${v.lang}${v.default ? ' (default)' : ''}`;
    sel.appendChild(opt);
  });

  // Reselect stored voice if available
  const stored = VibeMe.settings.tts.voiceURI;
  if (stored && [...sel.options].some(o => o.value === stored)) {
    sel.value = stored;
  } else {
    // Keep default selected; optionally store it for next time
    const def = VibeMe.tts.voices.find(v => v.default) || VibeMe.tts.voices[0];
    if (def) sel.value = def.voiceURI;
  }
};

VibeMe.kit.bind(document, 'DOMContentLoaded', () => {
  if (!('speechSynthesis' in window)) return;
  VibeMe.tts.refreshVoices();

  // Some browsers populate asynchronously
  try {
    window.speechSynthesis.onvoiceschanged = () => VibeMe.tts.refreshVoices();
  } catch {}
});

// Settings listeners
VibeMe.kit.bind(VibeMe.kit.$('#tts-voice'), 'change', (e) => {
  const oldValue = VibeMe.settings.tts.voiceURI;
  VibeMe.settings.tts.voiceURI = e.target.value || null;
  settingsManager.save();
  VibeMe.bus.emit('settings:changed', { key: 'tts.voiceURI', value: VibeMe.settings.tts.voiceURI, oldValue });
});

// Preview button
VibeMe.kit.bind(VibeMe.kit.$('#tts-preview-btn'), 'click', () => {
  if (!('speechSynthesis' in window)) return;
  VibeMe.tts.init();
  const sel = VibeMe.kit.$('#tts-voice');
  const selectedUri = sel?.value || null;
  const v = VibeMe.tts.voices.find(x => x.voiceURI === selectedUri);
  const sample = 'This is a preview of the selected voice.';
  VibeMe.tts.speak(sample, { voice: v });
});

// Wire controls
document.addEventListener('DOMContentLoaded', () => {
  settingsManager.load();

  VibeMe.kit.bind(VibeMe.kit.$('#tts-enable-checkbox'), 'change', (e) => {
    const oldValue = VibeMe.settings.tts.enabled;
    VibeMe.settings.tts.enabled = !!e.target.checked;
    settingsManager.save();
    VibeMe.bus.emit('settings:changed', { key: 'tts.enabled', value: VibeMe.settings.tts.enabled, oldValue });
    if (!e.target.checked) VibeMe.tts.stop();
  });

  VibeMe.kit.bind(VibeMe.kit.$('#tts-rate'), 'input', (e) => {
    const oldValue = VibeMe.settings.tts.rate;
    const v = parseFloat(e.target.value || '1') || 1;
    VibeMe.settings.tts.rate = v;
    (VibeMe.kit.$('#tts-rate-value')||{}).textContent = `${v.toFixed(1)}x`;
    settingsManager.save();
    VibeMe.bus.emit('settings:changed', { key: 'tts.rate', value: v, oldValue });
  });

  // Initialize TTS on first interaction
  const initTTS = () => {
    VibeMe.tts.init();
    document.removeEventListener('click', initTTS);
    document.removeEventListener('keydown', initTTS);
  };
  document.addEventListener('click', initTTS, { once: true });
  document.addEventListener('keydown', initTTS, { once: true });

  // Delegated so it works even if the button is re-rendered
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#tts-stop-btn');
    if (!btn) return;

    VibeMe.tts.init();         // ensure the speech engine is unlocked
    VibeMe.tts.stop(true);     // force a clean stop
    btn.classList.add('button-press'); 
    setTimeout(() => btn.classList.remove('button-press'), 150);
  });
});

// ===== A11y: Focus utils =====
const VBM_FOCUSABLE = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(container, onClose) {
  const focusables = Array.from(container.querySelectorAll(VBM_FOCUSABLE));
  if (!focusables.length) return () => {};
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  function onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); onClose?.(); return; }
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  container.addEventListener('keydown', onKeydown);
  // Return cleanup
  return () => container.removeEventListener('keydown', onKeydown);
}

function togglePanel({panelId, toggleId}) {
  const panel = document.getElementById(panelId);
  const toggle = document.getElementById(toggleId);
  const isOpen = panel.getAttribute('aria-hidden') === 'false';

  if (isOpen) {
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  } else {
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    panel.focus();
  }
}

// ===== Theme Utilities (palette application + sync) =====
function __vibeme_hexLuma(hex){
  const c = hex.replace('#','');
  const r = parseInt(c.slice(0,2),16)/255;
  const g = parseInt(c.slice(2,4),16)/255;
  const b = parseInt(c.slice(4,6),16)/255;
  const lin = v => v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
}

function applyPalette({ color1, color2, color3, accent }){
  const root = document.documentElement;
  root.style.setProperty('--color1', color1);
  root.style.setProperty('--color2', color2);
  root.style.setProperty('--color3', color3);
  if (accent) root.style.setProperty('--social-icon-bg', accent);

  const avg = (__vibeme_hexLuma(color1) + __vibeme_hexLuma(color2) + __vibeme_hexLuma(color3)) / 3;
  const isLight = avg > 0.5;

  // Contrast & glass
  root.style.setProperty('--text-color-main', isLight ? '#1F2937' : '#F9FAFB');
  root.style.setProperty('--text-color-secondary', isLight ? '#374151' : '#E5E7EB');
  root.style.setProperty('--container-bg-color', isLight ? 'rgba(255,255,255,0.85)' : 'rgba(16,16,24,0.55)');
  root.style.setProperty('--inner-box-color', isLight ? 'rgba(255,255,255,0.75)' : 'rgba(16,16,24,0.45)');

  // Matrix sync
  if (VibeMe && VibeMe.matrixConfig) {
    VibeMe.matrixConfig.isLightBackground = isLight;
    VibeMe.matrixConfig.backgroundLuminance = avg;
    VibeMe.matrixConfig.colors = [color1, color2, color3, '#A104C1', '#00E5FF'];
  }

  // Mouse glow (if present)
  const glow = document.getElementById('mouse-glow');
  if (glow) glow.style.setProperty('--glow-color', color1);
}

function pickPaletteFromPreset(name){
  const bank = VibeMe?.themes?.colorPalettes?.[name];
  if (!bank || !bank.length) return null;
  return bank[Math.floor(Math.random()*bank.length)];
}

const CATEGORY_TO_PRESET = {
  love: 'retro_neon',
  perseverance: 'midnight_arcade',
  originality: 'lavender_glow',
  change: 'desert_dusk',
  inner_strength: 'punchy_reds',
  famous_quotes: 'retro_neon',
  wisdom: 'desert_dusk',
  default: 'retro_neon'
};


// Wait for the DOM to be fully loaded before initializing the application
document.addEventListener('DOMContentLoaded', () => {
    VibeMe.init();
    
    // ===== Theme preset init (initialize after VibeMe.init) =====
    const presetSelect = document.getElementById('theme-preset');
    if (presetSelect) {
        const saved = localStorage.getItem('vibeme-theme-preset') || 'auto';
        presetSelect.value = saved;

        function activatePreset(name){
            localStorage.setItem('vibeme-theme-preset', name);
            if (name === 'auto') {
                const idx = VibeMe?.state?.currentQuoteIndex || 0;
                const cat = VibeMe?.quotes?.[idx]?.category || 'default';
                const mapped = CATEGORY_TO_PRESET[cat] || 'retro_neon';
                const p = pickPaletteFromPreset(mapped) || pickPaletteFromPreset('retro_neon');
                if (p) applyPalette(p);
            } else {
                const p = pickPaletteFromPreset(name);
                if (p) applyPalette(p);
            }
        }

        presetSelect.addEventListener('change', e => activatePreset(e.target.value));
        activatePreset(saved);
    }

    // ===== Logo Fallback =====
    // Ensure vb-logo class is applied to VibeMe heading (fallback for HTML structure changes)
    const logo = document.querySelector('h1, .heading-font, [class*="text-"]');
    if (logo && logo.textContent && logo.textContent.includes('VibeMe') && !logo.classList.contains('vb-logo')) {
        logo.classList.add('vb-logo');
        console.log('🎨 VibeMe logo fallback applied - vb-logo class added to heading');
    }
});

// Keep title centered above the box and auto-space it
document.addEventListener('DOMContentLoaded', () => {
  // Ensure a title bar exists
  const bar = document.getElementById('app-title-bar') || (() => {
    const d = document.createElement('div');
    d.id = 'app-title-bar';
    d.className = 'app-title-bar';
    document.body.prepend(d);
    return d;
  })();

  // Find/move/create the VibeMe heading
  let h1 = Array.from(document.querySelectorAll('h1')).find(el => /vibeme/i.test(el.textContent||''));
  const quoteInner = document.querySelector('.quote-container-inner, .quote-container');
  if (h1 && quoteInner && quoteInner.contains(h1)) bar.appendChild(h1);
  if (!h1){
    h1 = document.createElement('h1');
    h1.className = 'vb-logo heading-font';
    h1.setAttribute('data-title','VibeMe');
    h1.textContent = 'VibeMe';
    bar.appendChild(h1);
  }
  h1.classList.add('vb-logo');

  // Default spacing + auto tweaks by viewport height
  function autoSpace(){
    const h = window.innerHeight;
    bar.classList.remove('title-tight','title-roomy','title-comfy');
    if (h < 700)      bar.classList.add('title-tight');
    else if (h > 980) bar.classList.add('title-roomy');
    else              bar.classList.add('title-comfy'); // comfy default
  }
  autoSpace();
  window.addEventListener('resize', autoSpace);
});

// Dedupe & relocate any VibeMe headings so there is exactly ONE, centered above the card
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('app-title-bar') || (() => {
    const d = document.createElement('div');
    d.id = 'app-title-bar';
    d.className = 'app-title-bar';
    document.body.prepend(d);
    return d;
  })();

  const quoteInner = document.querySelector('.quote-container-inner, .quote-container');

  // Collect all headings that read "VibeMe" (case-insensitive)
  const all = Array.from(document.querySelectorAll('h1, .vb-logo'))
    .filter(el => /vibeme/i.test((el.textContent || '').trim()));

  // Move any that are inside the quote container up into the title bar
  all.forEach(el => {
    if (quoteInner && quoteInner.contains(el)) {
      bar.appendChild(el);
    }
  });

  // If none exist, create one
  let topLogo = all.find(el => bar.contains(el));
  if (!topLogo) {
    topLogo = document.createElement('h1');
    topLogo.className = 'vb-logo heading-font';
    topLogo.setAttribute('data-title','VibeMe');
    topLogo.textContent = 'VibeMe';
    bar.appendChild(topLogo);
  } else {
    // Normalize classes/attrs
    topLogo.classList.add('vb-logo','heading-font');
    topLogo.setAttribute('data-title','VibeMe');
    topLogo.textContent = 'VibeMe';
  }

  // Remove duplicates in the title bar (keep the first)
  const barLogos = Array.from(bar.querySelectorAll('.vb-logo'));
  barLogos.slice(1).forEach(n => n.remove());
});

document.addEventListener('DOMContentLoaded', () => {
  const outer = document.querySelector('.quote-container-outer') || document.querySelector('.quote-container');
  // 3a) Ensure bar exists
  let bar = document.getElementById('app-title-bar');
  if (!bar){
    bar = document.createElement('div');
    bar.id = 'app-title-bar';
    bar.className = 'app-title-bar';
    // place before the card if possible, else at top of body
    if (outer && outer.parentElement) outer.parentElement.insertBefore(bar, outer);
    else document.body.prepend(bar);
    const h1 = document.createElement('h1');
    h1.className = 'vb-logo heading-font';
    h1.setAttribute('data-title','VibeMe');
    h1.textContent = 'VibeMe';
    bar.appendChild(h1);
  }

  // 3b) If bar ended up inside the card, move it OUT to be a sibling before the card
  if (outer && bar && outer.contains(bar) && outer.parentElement){
    outer.parentElement.insertBefore(bar, outer);
  }

  // 3c) Move any in-card VibeMe heading into the bar; then dedupe
  const inner = document.querySelector('.quote-container-inner') || outer;
  if (inner){
    inner.querySelectorAll('h1, .vb-logo').forEach(el => {
      if (/vibeme/i.test((el.textContent || '').trim())){
        try { bar.appendChild(el); } catch(_) {}
      }
    });
  }
  const logos = Array.from(bar.querySelectorAll('.vb-logo, h1.vb-logo'));
  logos.slice(1).forEach(n => n.remove()); // keep only one

  // 3d) Width sync: match bar width to the card so aura wraps only the card
  function syncBarWidth(){
    const card = outer;
    if (!card || !bar) return;
    const w = card.getBoundingClientRect().width;
    if (w > 0){
      bar.style.maxWidth = 'none';
      bar.style.width = w + 'px';
      bar.style.marginLeft = 'auto';
      bar.style.marginRight = 'auto';
    }
  }
  syncBarWidth();
  window.addEventListener('resize', syncBarWidth);
  window.addEventListener('orientationchange', syncBarWidth);

  // 3e) Spacing: prefer comfy
  bar.classList.remove('title-tight','title-roomy');
  bar.classList.add('title-comfy');
});

document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('app-title-bar');
  if (!bar) return;

  // Ensure single H1 exists (your earlier dedupe script already does this)
  const h1 = bar.querySelector('h1.vb-logo') || bar.querySelector('.vb-logo');

  // Create anchor bar if missing
  let underline = bar.querySelector('.logo-underline');
  if (!underline){
    underline = document.createElement('div');
    underline.className = 'logo-underline';
    if (h1 && h1.nextSibling) h1.parentNode.insertBefore(underline, h1.nextSibling);
    else bar.appendChild(underline);
  }

  function sizeUnderline(){
    if (!underline || !h1) return;
    const w = h1.getBoundingClientRect().width;
    const target = Math.max(160, Math.min(560, Math.round(w * 0.55)));
    underline.style.width = target + 'px';
  }

  sizeUnderline();
  window.addEventListener('resize', sizeUnderline, { passive:true });
  window.addEventListener('orientationchange', sizeUnderline);
  // In case fonts/layout shift post-load
  window.addEventListener('load', sizeUnderline);
});

/* ========== Matrix Presets ========== */
/* Colors still come from CSS vars --color1/2/3 (just like your matrix demo). */
window.VibeMe = window.VibeMe || {};
VibeMe.matrixPresets = {
    neon_rain: {
        speed: 1.0,           // base row step/frame
        density: 12,          // px gap between columns (smaller = denser)
        fontSize: 26,
        trail: [8, 22],       // min..max
        direction: 'down',    // 'down' | 'up' | 'mixed'
        glyphs: '01|/\\\\-+*#@&%', // classic set
        headGlow: 1.0,
        fade: 0.08,           // canvas fade overlay
        wave: {amp: 0, freq: 0, speed: 0}
    },
    dual_drift: {
        speed: 0.85,
        density: 14,
        fontSize: 24,
        trail: [12, 28],
        direction: 'mixed',
        glyphs: '01$%#&+=',
        headGlow: 1.2,
        fade: 0.07,
        wave: {amp: 0, freq: 0, speed: 0}
    },
    aurora_waves: {
        speed: 0.75,
        density: 16,
        fontSize: 24,
        trail: [14, 30],
        direction: 'down',
        glyphs: '01·•○●◇◆',
        headGlow: 1.4,
        fade: 0.06,
        wave: {amp: 10, freq: 0.015, speed: 0.8} // subtle horizontal sine wobble
    },
    glyph_storm: {
        speed: 1.15,
        density: 12,
        fontSize: 26,
        trail: [6, 16],
        direction: 'down',
        glyphs: '#@$%&*{}[]=+<>',
        headGlow: 1.6,        // brighter heads
        fade: 0.09,
        wave: {amp: 0, freq: 0, speed: 0},
        bursts: true          // occasional random long trails
    },
    lowkey_minimal: {
        speed: 0.6,
        density: 18,
        fontSize: 22,
        trail: [6, 12],
        direction: 'down',
        glyphs: '01',
        headGlow: 0.6,
        fade: 0.05,
        wave: {amp: 0, freq: 0, speed: 0}
    }
};

/* Category → preset mapping for Auto mode (tune as you like) */
const MATRIX_CATEGORY_MAP = {
    love: 'aurora_waves',
    perseverance: 'dual_drift',
    originality: 'glyph_storm',
    change: 'neon_rain',
    inner_strength: 'glyph_storm',
    famous_quotes: 'neon_rain',
    wisdom: 'lowkey_minimal',
    default: 'neon_rain'
};

/* Helper: apply preset to existing engine or to a shim if present */
VibeMe.applyMatrixPreset = function(name){
    const preset = VibeMe.matrixPresets[name] || VibeMe.matrixPresets.neon_rain;
    localStorage.setItem('vibeme-matrix-preset', name);

    // 1) If your app exposes a config object, update it directly.
    if (VibeMe.matrixConfig){
        // Map preset properties to existing matrixConfig structure
        VibeMe.matrixConfig.updateInterval = 500 / preset.speed; // Convert speed to interval
        VibeMe.matrixConfig.columnWidth = preset.density;
        VibeMe.matrixConfig.canvasConfig.fontSize = preset.fontSize;
        VibeMe.matrixConfig.trailLength = preset.trail[1]; // Use max trail length
        VibeMe.matrixConfig.bidirectional = preset.direction === 'mixed';
        
        // Convert glyphs string to character array
        if (preset.glyphs.includes('|')) {
            VibeMe.matrixConfig.characters = preset.glyphs.split('');
        } else {
            VibeMe.matrixConfig.characters = preset.glyphs.split('');
        }
        
        // Update canvas config for head glow and fade
        VibeMe.matrixConfig.canvasConfig.glowIntensity = preset.headGlow * 10;
        VibeMe.matrixConfig.trailFadeRate = preset.fade;
        
        // Let the engine know to reinit if it listens
        if (typeof VibeMe.reinitMatrix === 'function') VibeMe.reinitMatrix();
        if (typeof VibeMe.updateMatrixConfig === 'function') VibeMe.updateMatrixConfig(VibeMe.matrixConfig);
        
        // Restart matrix effects with new config
        if (typeof VibeMe.startMatrixEffectsForCurrentMode === 'function') {
            VibeMe.startMatrixEffectsForCurrentMode();
        }
    }

    // 2) If a separate engine exists on window (adapter-friendly), notify it.
    if (window.MatrixRainEngine && typeof window.MatrixRainEngine.applyConfig === 'function'){
        window.MatrixRainEngine.applyConfig(preset);
    }

    // 3) Broadcast (safe no-op if nobody listens)
    document.dispatchEvent(new CustomEvent('vibeme:matrix:applyPreset', { detail: { name, preset } }));
};

/* Auto wiring (selector + category changes) */
document.addEventListener('DOMContentLoaded', () => {
    // Create selector if it's not already in the DOM
    let sel = document.getElementById('matrix-preset');
    if (!sel){
        // Try to mount under #color-controls; else append to settings panel root
        const bucket = document.getElementById('color-controls') || document.getElementById('settings-panel') || document.body;
        const wrap = document.createElement('div');
        wrap.id = 'matrix-preset-wrapper';
        wrap.className = 'space-y-2 mt-3';
        wrap.innerHTML = `
            <label for="matrix-preset" class="text-xs text-gray-300">Matrix Preset</label>
            <select id="matrix-preset" class="w-full text-black p-1 rounded text-xs">
                <option value="auto">🎯 Auto (by quote category)</option>
                <option value="neon_rain">🌈 Neon Rain</option>
                <option value="dual_drift">⇵ Dual Drift</option>
                <option value="aurora_waves">🌊 Aurora Waves</option>
                <option value="glyph_storm">⚡ Glyph Storm</option>
                <option value="lowkey_minimal">🌫️ Low-Key Minimal</option>
            </select>
            <p class="text-[10px] text-gray-400">Colors follow theme; presets tweak density, speed, trails & glyphs.</p>
        `;
        bucket.appendChild(wrap);
        sel = wrap.querySelector('#matrix-preset');
    }

    // Restore saved choice
    const saved = localStorage.getItem('vibeme-matrix-preset') || 'auto';
    sel.value = saved;

    function activate(name){
        if (name === 'auto'){
            const currentQuote = VibeMe.getCurrentQuote ? VibeMe.getCurrentQuote() : null;
            const cat = currentQuote?.category || 'default';
            const mapped = MATRIX_CATEGORY_MAP[cat] || 'neon_rain';
            VibeMe.applyMatrixPreset(mapped);
        } else {
            VibeMe.applyMatrixPreset(name);
        }
    }

    sel.addEventListener('change', e => { 
        localStorage.setItem('vibeme-matrix-preset', e.target.value); 
        activate(e.target.value); 
    });

    // When quotes advance, refresh if in auto mode
    document.addEventListener('vibeme:quote:changed', () => {
        if ((localStorage.getItem('vibeme-matrix-preset') || 'auto') === 'auto') activate('auto');
    });

    // Hook into the existing updateQuote function to trigger quote change events
    const originalUpdateQuote = VibeMe.updateQuote;
    if (originalUpdateQuote) {
        VibeMe.updateQuote = function() {
            const result = originalUpdateQuote.apply(this, arguments);
            // Dispatch custom event after quote update
            document.dispatchEvent(new CustomEvent('vibeme:quote:changed'));
            return result;
        };
    }

    // First activation
    setTimeout(() => activate(saved), 1000); // Delay to ensure matrix system is initialized
});

(function(){
  document.addEventListener('DOMContentLoaded', () => {
    // 3a) Locate the settings panel and the "Matrix Visibility" block.
    const panel = document.getElementById('settings-panel') || document.body;

    // Try several ways to find the visibility control container
    const findVisibilityGroup = () => {
      // by id
      let g = panel.querySelector('#matrix-visibility, #matrix-visibility-group');
      if (g) return g.closest('.space-y-2, .mt-3, .mb-3, div');
      // by label text
      const lbl = Array.from(panel.querySelectorAll('label, p, span')).find(el =>
        /matrix\s*visibility/i.test(el.textContent||'')
      );
      return lbl ? (lbl.closest('.space-y-2, .mt-3, .mb-3, div') || lbl.parentElement) : null;
    };

    const visGroup = findVisibilityGroup() || panel;

    // 3b) Ensure the preset control exists.
    let preset = document.getElementById('matrix-preset');
    if (!preset){
      const wrap = document.createElement('div');
      wrap.id = 'matrix-preset-wrapper';
      wrap.className = 'space-y-2 mt-3';
      wrap.innerHTML = `
        <label for="matrix-preset" class="text-xs text-gray-300">Matrix Preset</label>
        <select id="matrix-preset" class="w-full text-black p-1 rounded text-xs">
          <option value="auto">🎯 Auto (by quote category)</option>
          <option value="neon_rain">🌧️ Rain Matrix (Neon)</option>
          <option value="dual_drift">⇵ Dual Drift</option>
          <option value="aurora_waves">🌊 Aurora Waves</option>
          <option value="glyph_storm">⚡ Glyph Storm</option>
          <option value="lowkey_minimal">🌫️ Low-Key Minimal</option>
        </select>
        <p class="text-[10px] text-gray-400">Colors follow theme; presets tweak density, speed, trails & glyphs.</p>
      `;
      // place directly after the visibility group
      visGroup.insertAdjacentElement('afterend', wrap);
      preset = wrap.querySelector('#matrix-preset');
    } else {
      // 3c) If it exists, move it right under visibility group.
      const wrap = document.getElementById('matrix-preset-wrapper') || preset.parentElement;
      if (wrap && visGroup && wrap.previousElementSibling !== visGroup) {
        visGroup.insertAdjacentElement('afterend', wrap);
      }
      // 3d) Rename the option so it matches your mental model ("rain matrix")
      const opt = preset.querySelector('option[value="neon_rain"]');
      if (opt) opt.textContent = '🌧️ Rain Matrix (Neon)';
    }

    // 3e) Keep persistence and activation (if your earlier code exists, this is a no-op)
    const saved = localStorage.getItem('vibeme-matrix-preset') || 'auto';
    if (preset) preset.value = saved;
    if (typeof VibeMe?.applyMatrixPreset === 'function') {
      // Activate once to sync visuals (without changing the user's saved choice)
      VibeMe.applyMatrixPreset(saved === 'auto' ? 'neon_rain' : saved);
    }
  });
})();


// ---- Category filter (append-only) ----
document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('category-filter');
  if (!sel) return;

  const saved = localStorage.getItem('vibeme-category-filter') || 'all';
  sel.value = saved;

  function setFilter(val){
    localStorage.setItem('vibeme-category-filter', val);
    VibeMe.state = VibeMe.state || {};
    VibeMe.state.categoryFilter = val;
    document.dispatchEvent(new CustomEvent('toast',{detail:{message:`Category: ${val}`, type:'info'}}));
  }

  sel.addEventListener('change', e => setFilter(e.target.value));
  setFilter(saved);

  // Non-destructive: wrap getRandomQuote once
  if (!VibeMe._getRandomQuote && typeof VibeMe.getRandomQuote === 'function') {
    VibeMe._getRandomQuote = VibeMe.getRandomQuote.bind(VibeMe);
    VibeMe.getRandomQuote = function(){
      const base = VibeMe._getRandomQuote;
      const filter = (VibeMe.state?.categoryFilter || 'all');
      if (filter === 'all') return base();
      const pool = (VibeMe.quotes || []).filter(q => q.category === filter);
      return (pool.length ? pool[Math.floor(Math.random()*pool.length)] : base());
    };
  }
});

// ---- Toast helper + hook into existing feedback (append-only) ----
(function(){
  'use strict';
  
  function showToast(message, type='info', ms=1600){
    const root = document.getElementById('toast-root');
    if (!root) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="flex items-center justify-between space-x-3">
        <div class="flex items-center space-x-2">
          <i class="text-sm ${type === 'success' ? 'fas fa-check-circle' : 
                               type === 'error' ? 'fas fa-exclamation-circle' : 
                               'fas fa-info-circle'}"></i>
          <span class="text-sm">${message}</span>
        </div>
        <button class="text-white/60 hover:text-white/80 text-xs" onclick="this.parentNode.parentNode.remove()">✕</button>
      </div>
    `;
    
    root.appendChild(toast);
    
    // Auto-dismiss
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, ms);
  }
  
  // Global event listener for 'show-toast' custom events
  if (typeof window !== 'undefined') {
    window.addEventListener('show-toast', function(e) {
      const { message, type, duration } = e.detail || {};
      if (message) showToast(message, type, duration);
    });
  }
  
  // Non-destructive wrapper around VibeMe.showFeedback if it exists
  if (typeof VibeMe !== 'undefined' && VibeMe.showFeedback && !VibeMe._showFeedback) {
    VibeMe._showFeedback = VibeMe.showFeedback.bind(VibeMe);
    VibeMe.showFeedback = function(message, type='info') {
      // Call original
      if (VibeMe._showFeedback) VibeMe._showFeedback(message, type);
      
      // Also show toast
      const toastType = type === 'positive' ? 'success' : 
                       type === 'negative' ? 'error' : 'info';
      showToast(message, toastType);
    };
  }
  
  // Make showToast globally accessible
  if (typeof window !== 'undefined') {
    window.showToast = showToast;
  }
})();

// ---- Performance hooks: Tab visibility + Reduced motion (append-only) ----
(function(){
  'use strict';
  
  // Tab visibility API for performance optimization
  let isTabVisible = true;
  
  function handleVisibilityChange() {
    isTabVisible = !document.hidden;
    
    // Pause/resume animations based on visibility
    if (VibeMe && VibeMe.matrixState) {
      if (isTabVisible) {
        // Resume matrix if it was running
        if (VibeMe.state && VibeMe.state.effectsEnabled && VibeMe.matrixState.isActive) {
          VibeMe.startMatrixAnimation();
        }
      } else {
        // Pause matrix when tab hidden
        VibeMe.stopMatrixAnimation();
      }
    }
    
    // Pause/resume other intensive operations
    if (!isTabVisible && VibeMe && VibeMe.mouseGlow) {
      VibeMe.mouseGlow.isPaused = true;
    } else if (isTabVisible && VibeMe && VibeMe.mouseGlow) {
      VibeMe.mouseGlow.isPaused = false;
    }
  }
  
  // Check for reduced motion preference
  function respectsReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  // Initialize performance optimizations
  function initPerformanceHooks() {
    // Tab visibility listener
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Reduced motion media query listener
    if (window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      function handleMotionChange(e) {
        if (VibeMe && VibeMe.state) {
          // Respect reduced motion by disabling effects
          if (e.matches && VibeMe.state.effectsEnabled) {
            VibeMe.state.reducedMotionOverride = true;
            VibeMe.toggleEffects(false); // Disable effects
            
            // Show toast notification
            if (window.showToast) {
              showToast('Effects disabled due to reduced motion preference', 'info', 3000);
            }
          }
        }
      }
      
      motionQuery.addListener(handleMotionChange);
      // Check initial state
      handleMotionChange(motionQuery);
    }
    
    // Performance monitoring
    if (typeof performance !== 'undefined' && performance.mark) {
      // Mark important performance points
      const originalGetRandomQuote = VibeMe && VibeMe.getRandomQuote;
      if (originalGetRandomQuote && !VibeMe._perfGetRandomQuote) {
        VibeMe._perfGetRandomQuote = originalGetRandomQuote.bind(VibeMe);
        VibeMe.getRandomQuote = function() {
          performance.mark('quote-generation-start');
          const result = VibeMe._perfGetRandomQuote();
          performance.mark('quote-generation-end');
          performance.measure('quote-generation', 'quote-generation-start', 'quote-generation-end');
          return result;
        };
      }
    }
  }
  
  // Make visibility state accessible
  if (typeof window !== 'undefined') {
    window.isTabVisible = () => isTabVisible;
    window.respectsReducedMotion = respectsReducedMotion;
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceHooks);
  } else {
    initPerformanceHooks();
  }
})();

// === Flip Clock under title — V2 (namespaced, classic geometry) =================
(function(){
  'use strict';

  function FcPiece(label, value){
    var el = document.createElement('span');
    el.className = 'fc-piece';
    el.innerHTML =
      '<b class="fc-card">' +
        '<b class="fc-top"></b>' +
        '<b class="fc-bottom" data-value=""></b>' +
        '<b class="fc-back"><b class="fc-bottom" data-value=""></b></b>' +
      '</b>' +
      '<span class="fc-slot">' + label + '</span>';
    this.el = el;

    var top = el.querySelector('.fc-top'),
        bottom = el.querySelector('.fc-bottom'),
        back = el.querySelector('.fc-back'),
        backBottom = el.querySelector('.fc-back .fc-bottom');

    this.update = function(val){
      val = ('0' + val).slice(-2);
      if (val !== this.currentValue) {
        if (this.currentValue >= 0) {
          back.setAttribute('data-value', this.currentValue);
          bottom.setAttribute('data-value', this.currentValue);
        }
        this.currentValue = val;
        top.textContent = this.currentValue;
        backBottom.setAttribute('data-value', this.currentValue);
        bottom.setAttribute('data-value', this.currentValue);

        this.el.classList.remove('fc-flip'); void this.el.offsetWidth;
        this.el.classList.add('fc-flip');
      }
    };
    this.update(value);
  }

  function getLocal12h(){
    var t = new Date();
    var h24 = t.getHours();
    var h12 = (h24 % 12) || 12; // 1..12
    return {
      'Total': t,
      'Hours': h12,
      'Minutes': t.getMinutes(),
      'Seconds': t.getSeconds()
    };
  }

  function FcClock(updateFn){
    var state = updateFn();
    var map = {};
    var wrap = document.createElement('div');
    wrap.className = 'fc-clock';

    Object.keys(state).forEach(function(k){
      if (k === 'Total') return;
      map[k] = new FcPiece(k, state[k]);
      wrap.appendChild(map[k].el);
    });

    function tick(){
      var t = updateFn();
      Object.keys(map).forEach(function(k){ map[k].update(t[k]); });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return wrap;
  }

  function mountFcClock(){
    var bar = document.getElementById('app-title-bar');
    if (!bar) return;

    var mount = document.getElementById('flip-clock-mount');
    if (!mount){
      mount = document.createElement('div');
      mount.id = 'flip-clock-mount';
      mount.className = 'flip-clock-mount';
      mount.setAttribute('role','timer');
      mount.setAttribute('aria-label','Current time');
      var h1 = bar.querySelector('.vb-logo') || bar.firstElementChild;
      if (h1 && h1.parentNode) h1.parentNode.insertBefore(mount, h1.nextSibling);
      else bar.appendChild(mount);
    }
    mount.dataset.skin = 'classic';
    if (mount.style && mount.style.width) mount.style.removeProperty('width');

    if (!mount.dataset.mounted){
      var clock = new FcClock(getLocal12h);
      mount.appendChild(clock);
      mount.dataset.mounted = 'true';
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mountFcClock, {once:true});
  } else {
    mountFcClock();
  }
})();

/* Flip clock: ensure mount has classic skin and never a fixed width */
(function(){
  'use strict';
  
  function ensureClassicSkin(){
    var mount = document.getElementById('flip-clock-mount');
    if (!mount) return;
    if (!mount.dataset.skin) mount.dataset.skin = 'classic';
    // Remove any accidental inline width constraint
    if (mount.style && mount.style.width) mount.style.removeProperty('width');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureClassicSkin, {once:true});
  } else { ensureClassicSkin(); }
})();

// ===== FAVORITES (BEGIN) =====
(function(){
  if (window.__favoritesInit) return; // double-load guard
  window.__favoritesInit = true;

  function $(id){ return document.getElementById(id); }

  // Read from app state or localStorage; also merge a few legacy keys defensively.
  function readRaw(){
    const merge = [];
    const push = (val) => { if (Array.isArray(val)) merge.push(...val); };
    push(window.VibeMe?.state?.favorites);
    try { push(JSON.parse(localStorage.getItem('vibeme-favorites') || '[]')); } catch {}
    try { push(JSON.parse(localStorage.getItem('favorites') || '[]')); } catch {}
    try { push(JSON.parse(localStorage.getItem('vibemeFavorites') || '[]')); } catch {}
    return merge;
  }

  function saveRaw(raw){
    try { localStorage.setItem('vibeme-favorites', JSON.stringify(raw)); } catch {}
    if (window.VibeMe?.state) window.VibeMe.state.favorites = raw;
    refreshCount();
  }

  // Normalize items to {text, author}
  function normalize(raw){
    const items = (raw || []).map((it) => {
      if (typeof it === 'string') return { text: it, author: null };
      if (it && typeof it === 'object') {
        const text = it.text ?? it.quote ?? it.q ?? '';
        const author = it.author ?? it.a ?? null;
        return { text, author };
      }
      return { text: String(it ?? ''), author: null };
    }).filter(x => x.text);
    // de-dupe by text+author
    const seen = new Set();
    return items.filter(x => {
      const k = (x.text + '|' + (x.author ?? '')).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  // Build a stable identity key for favorites
  function favKey(q){
    // q is expected normalized: {text, author}
    return ((q?.text ?? '') + '|' + (q?.author ?? '')).toLowerCase();
  }

  function escapeHTML(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function refreshCount(forceN){
    const el = $('favorites-count');
    if (!el) return;
    if (typeof forceN === 'number') { el.textContent = forceN; return; }
    el.textContent = normalize(readRaw()).length;
  }

  function renderList(){
    const listEl  = $('favorites-list');
    const emptyEl = $('favorites-empty');
    if (!listEl) return;

    const items = normalize(readRaw());
    listEl.innerHTML = '';
    if (!items.length){
      if (emptyEl) emptyEl.style.display = '';
      refreshCount(0);
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    items.forEach((q, idx) => {
      const row = document.createElement('div');
      row.className = 'fav-item';
      row.innerHTML = `
        <div class="fav-text-wrap">
          <div class="fav-quote">"${escapeHTML(q.text)}"</div>
          ${q.author ? `<div class="fav-author">— ${escapeHTML(q.author)}</div>` : ''}
        </div>
        <div class="fav-actions">
          <button class="fav-copy" title="Copy"><i class="fas fa-copy"></i></button>
          <button class="fav-remove" title="Remove"><i class="fas fa-trash"></i></button>
        </div>`;
      row.dataset.index = String(idx);
      listEl.appendChild(row);
    });

    // Delegated actions
    listEl.onclick = async (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;

      const row = ev.target.closest('.fav-item');
      if (!row) return;

      const idx = Number(row.dataset.index);

      // Re-read items as the source of truth the user sees
      const itemsNow = normalize(readRaw());
      const target = itemsNow[idx];
      if (!target) return;

      if (btn.classList.contains('fav-copy')) {
        // COPY: best-effort clipboard with graceful failure
        const toCopy = target.text || '';
        try { await navigator.clipboard?.writeText(toCopy); } catch {}
        return;
      }

      if (btn.classList.contains('fav-remove')) {
        // REMOVE: compute key from normalized target
        const keyToRemove = favKey(target);

        // Work against the *raw* array but compare via normalized identity
        const raw = readRaw();

        // Find first raw item whose normalized identity matches the target key
        let removeAt = -1;
        for (let i = 0; i < raw.length; i++) {
          const r = raw[i];
          // Inline normalize-lite for speed; must match normalize() logic
          const norm = (typeof r === 'string')
            ? { text: r, author: null }
            : (r && typeof r === 'object')
              ? { text: (r.text ?? r.quote ?? r.q ?? ''), author: (r.author ?? r.a ?? null) }
              : { text: String(r ?? ''), author: null };

          if (!norm.text) continue;
          if (favKey(norm) === keyToRemove) { removeAt = i; break; }
        }

        if (removeAt >= 0) {
          raw.splice(removeAt, 1);
          saveRaw(raw);
          renderList(); // re-render the list and count
        }
        return;
      }
    };

    refreshCount(items.length);
  }

  // Patch localStorage.setItem so same-tab updates trigger UI refresh for our key
  (function patchSetItem(){
    const _set = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(k, v){
      const r = _set(k, v);
      if (k === 'vibeme-favorites') {
        refreshCount();
        if ($('favorites-panel')?.dataset.state === 'open') renderList();
      }
      return r;
    };
  })();

  function init(){
    const toggleBtn = $('favorites-toggle');
    const panel     = $('favorites-panel');
    const btnClose  = $('favorites-close');
    if (!toggleBtn || !panel || !btnClose) { requestAnimationFrame(init); return; }

    const STATES = { CLOSED:'closed', OPEN:'open' };
    let state = (localStorage.getItem('favorites:state') === 'open') ? 'open' : 'closed';

    function apply(next){
      state = next;
      panel.dataset.state = state;
      localStorage.setItem('favorites:state', state);
      if (state === STATES.OPEN){
        toggleBtn.setAttribute('aria-label','Close favorites');
        toggleBtn.setAttribute('title','Close favorites');
        toggleBtn.setAttribute('aria-expanded','true');
        panel.setAttribute('aria-modal','true');
        renderList();
      } else {
        toggleBtn.setAttribute('aria-label','Open favorites');
        toggleBtn.setAttribute('title','Open favorites');
        toggleBtn.setAttribute('aria-expanded','false');
        panel.setAttribute('aria-modal','false');
      }
    }

    apply(state);

    // Toggle open/close
    toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); apply(state === 'open' ? 'closed' : 'open'); });
    btnClose.addEventListener('click', (e) => { e.stopPropagation(); apply('closed'); });

    // Contain clicks; outside/esc close when open
    panel.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', (e) => {
      const outside = !panel.contains(e.target) && e.target !== toggleBtn;
      if (outside && state === 'open') apply('closed');
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state === 'open') apply('closed'); });

    // Cross-tab sync
    window.addEventListener('storage', (ev) => { if (ev.key === 'vibeme-favorites') { refreshCount(); if (state === 'open') renderList(); } });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
// ===== FAVORITES (END) =====



// === P0 wiring: aria sync, effects toggle, theme-color meta, dialog modal handling ===
(function(){
  const $ = (sel)=>document.querySelector(sel);

  function setAria(el, map){
    if (!el) return;
    for (const [k,v] of Object.entries(map)) el.setAttribute(k,String(v));
  }

  function updateThemeColorMeta() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const styles = getComputedStyle(document.documentElement);
    let c = styles.getPropertyValue('--color1').trim();
    if (!c) {
      c = (document.documentElement.dataset.theme === 'dark') ? '#1f2937' : '#ffffff';
    }
    meta.setAttribute('content', c);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Settings panel toggle
    const toggle = $('#settings-toggle');
    const panel = $('#settings-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', () => {
        const isHidden = panel.classList.toggle('hidden');
        setAria(toggle, { 'aria-expanded': String(!isHidden) });
        setAria(panel, { 'aria-hidden': String(isHidden) });
        if (!isHidden) {
          panel.focus?.();
        }
      });
    }

    // Effects master switch
    const effectsCb = $('#effects-toggle-checkbox');
    if (effectsCb) {
      const apply = (on) => {
        document.body.classList.toggle('effects-disabled', !on);
        try { localStorage.setItem('vibeme-effects', JSON.stringify(!!on)); } catch {}
      };
      // init from storage if present
      try {
        const saved = JSON.parse(localStorage.getItem('vibeme-effects') || 'true');
        effectsCb.checked = !!saved;
        apply(!!saved);
      } catch { apply(effectsCb.checked); }
      effectsCb.addEventListener('change', () => apply(effectsCb.checked));
    }

    // Dark mode toggle hookup (if not already wired)
    const darkBtn = $('#dark-mode-toggle');
    if (darkBtn) {
      darkBtn.addEventListener('click', () => {
        const root = document.documentElement;
        const isDark = (root.dataset.theme === 'dark');
        root.dataset.theme = isDark ? 'light' : 'dark';
        try { localStorage.setItem('vibeme-dark-mode', JSON.stringify(!isDark)); } catch {}
        updateThemeColorMeta();
      }, { capture: true });
    }

    // Theme/preset + apply colors -> update theme-color
    const presetSel = $('#theme-preset');
    const applyBtn = $('#apply-colors-btn');
    presetSel?.addEventListener('change', updateThemeColorMeta, { capture: true });
    applyBtn?.addEventListener('click', () => setTimeout(updateThemeColorMeta, 0));

    // Show with '?' key
    document.addEventListener('keydown', (e) => {
      if (e.key === '?') openKeyboardHelp();
    });

    // Close button inside the modal already calls close; ensure Escape works via trapFocus

    // Sync pressed state on the Favorite ♥ button
    const favBtn = document.getElementById('favorite-quote-btn');
    if (favBtn) {
      favBtn.setAttribute('aria-pressed', 'false');
      favBtn.addEventListener('click', () => {
        const newState = favBtn.getAttribute('aria-pressed') !== 'true';
        favBtn.setAttribute('aria-pressed', String(newState));
      });
    }

    // Global Escape closes settings panel
    document.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape' && !$('#settings-panel')?.classList.contains('hidden')) {
        $('#settings-toggle')?.click();
      }
    });

    // TTS settings now managed by unified settingsManager (see above)

    // Initial meta theme-color sync
    updateThemeColorMeta();
  });
})();

// Read-aloud subscriber (guarded to run once)
(function ensureTTSWiredOnce(){
  if (VibeMe.__ttsWired) return;
  VibeMe.__ttsWired = true;

  const speakHandler = (e) => {
    if (!VibeMe.settings.tts.enabled) return;
    const q = e.detail?.quote || '';
    const a = e.detail?.author ? ` — ${e.detail.author}` : '';
    VibeMe.tts.speak(`${q}${a}`);
  };

  VibeMe.bus.on('quote:changed', speakHandler);
  VibeMe.bus.on('vibeme:quote:changed', speakHandler); // back-compat
})();
// ===== VibeMe: Date display (non-invasive) =====
(function(){
  function renderDate(){
    const el = document.getElementById('date-time');
    if(!el) return;

    const now = new Date();
    const narrow = matchMedia('(max-width: 520px)').matches;

    // Desktop: "Thursday, August 28, 2025"; Mobile: "Thu, Aug 28, 2025"
    const format = narrow
      ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
      : { weekday: 'long',  month: 'long',  day: 'numeric', year: 'numeric' };

    el.textContent = now.toLocaleDateString(undefined, format);
    el.setAttribute('datetime', now.toISOString().slice(0,10));
  }

  function scheduleMidnightTick(){
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const ms = Math.max(1000, next - now);
    setTimeout(function(){
      renderDate();
      scheduleMidnightTick();
    }, ms);
  }

  window.addEventListener('DOMContentLoaded', renderDate);
  window.addEventListener('resize', renderDate);
  scheduleMidnightTick();
})();

// ===== Settings: Beep enable/disable wiring (checkbox + gear re-apply) =====
(function () {
  function applyBeepAudioState() {
    try {
      const contexts = (window.__allAudioContexts && Array.isArray(window.__allAudioContexts))
        ? window.__allAudioContexts.slice()
        : [];
      if (window.VibeMe && VibeMe.audioContext && !contexts.includes(VibeMe.audioContext)) {
        contexts.push(VibeMe.audioContext);
      }

      const off = !!(window.VibeMe && VibeMe.state && VibeMe.state.beepEnabled === false);
      if (off) {
        for (const ctx of contexts) {
          if (ctx && typeof ctx.suspend === 'function') { try { ctx.suspend(); } catch (_) {} }
        }
      } else {
        for (const ctx of contexts) {
          if (ctx && typeof ctx.resume === 'function') { try { ctx.resume(); } catch (_) {} }
        }
      }
    } catch (_) {}
  }
  window.__vmApplyBeepAudioState = applyBeepAudioState;

  document.addEventListener('DOMContentLoaded', function () {
    try {
      const toggle = document.getElementById('beep-enable-checkbox');
      if (toggle) {
        // Reflect persisted state in UI (default true if not set)
        toggle.checked = !(window.VibeMe && VibeMe.state && VibeMe.state.beepEnabled === false);
        // Enforce state on load
        applyBeepAudioState();
        // Persist on change
        toggle.addEventListener('change', function () {
          const on = !!toggle.checked;
          try { VibeMe.state.beepEnabled = on; } catch (_) {}
          try { localStorage.setItem('vibeme-beep-enabled', JSON.stringify(on)); } catch (_) {}
          applyBeepAudioState();
        });
      }

      // Ensure Settings gear cannot re-enable audio when beeps are OFF
      const gear = document.getElementById('settings-toggle');
      if (gear) {
        gear.addEventListener('click', function () {
          applyBeepAudioState();
        });
      }
    } catch (_) {}
  });

  // Wrap known beep helpers so call sites don't need code changes
  document.addEventListener('DOMContentLoaded', function () {
    try {
      const guard = (fn) => typeof fn === 'function'
        ? function (...args) {
            if (window.VibeMe && VibeMe.state && VibeMe.state.beepEnabled === false) return;
            return fn.apply(this, args);
          }
        : fn;
      if (window.VibeMe) {
        VibeMe.playBeep = guard(VibeMe.playBeep);
        VibeMe.playCountdownBeep = guard(VibeMe.playCountdownBeep);
        VibeMe.beep = guard(VibeMe.beep);
      }
    } catch (_) {}
  });
})();