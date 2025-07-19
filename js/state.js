// js/state.js
import { CONFIG, STORAGE_AVAILABLE } from './config.js';
import { validateQuote } from './quotes.js';

// Application state
const AppState = {
    currentQuote: null,
    currentThemeColors: null,
    countdown: CONFIG.COUNTDOWN_DURATION,
    timerInterval: null,
    isTimerPaused: false,
    isAnimating: false,
    activeCategory: 'all',
    favoriteQuotes: [],
    customQuotes: [],
    visualEffectsEnabled: true,
    copyTimeout: null,
    
    // Mouse glow effect state
    mouseGlow: {
        element: null,
        hue: 0,
        animationId: null,
        profileIndex: 0,
        profileChangeInterval: null
    },
    
    // Matrix effect state
    matrix: {
        interval: null,
        activeColumns: []
    }
};

// Storage helpers with error handling
const Storage = {
    get(key, defaultValue = null) {
        if (!STORAGE_AVAILABLE) return defaultValue;
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        if (!STORAGE_AVAILABLE) return false;
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error);
            return false;
        }
    },
    
    remove(key) {
        if (!STORAGE_AVAILABLE) return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
            return false;
        }
    }
};

// Favorites management
const Favorites = {
    load() {
        const stored = Storage.get(CONFIG.LOCALSTORAGE_FAVORITES_KEY, []);
        // Validate stored favorites
        AppState.favoriteQuotes = Array.isArray(stored) 
            ? stored.filter(quote => validateQuote(quote))
            : [];
    },
    
    save() {
        return Storage.set(CONFIG.LOCALSTORAGE_FAVORITES_KEY, AppState.favoriteQuotes);
    },
    
    add(quote) {
        if (!validateQuote(quote)) {
            console.error('Invalid quote provided to favorites');
            return false;
        }
        
        // Check if already exists
        if (this.exists(quote)) return false;
        
        AppState.favoriteQuotes.push(quote);
        return this.save();
    },
    
    remove(quote) {
        if (!validateQuote(quote)) return false;
        
        const index = AppState.favoriteQuotes.findIndex(fav => 
            fav.text === quote.text && fav.author === quote.author
        );
        
        if (index > -1) {
            AppState.favoriteQuotes.splice(index, 1);
            return this.save();
        }
        return false;
    },
    
    exists(quote) {
        if (!validateQuote(quote)) return false;
        return AppState.favoriteQuotes.some(fav => 
            fav.text === quote.text && fav.author === quote.author
        );
    },
    
    clear() {
        AppState.favoriteQuotes = [];
        return this.save();
    },
    
    getAll() {
        return [...AppState.favoriteQuotes];
    }
};

// Custom quotes management
const CustomQuotes = {
    load() {
        const stored = Storage.get(CONFIG.LOCALSTORAGE_CUSTOM_QUOTES_KEY, []);
        AppState.customQuotes = Array.isArray(stored) 
            ? stored.filter(quote => validateQuote(quote))
            : [];
    },
    
    save() {
        return Storage.set(CONFIG.LOCALSTORAGE_CUSTOM_QUOTES_KEY, AppState.customQuotes);
    },
    
    add(quote) {
        if (!validateQuote(quote)) {
            console.error('Invalid quote provided to custom quotes');
            return false;
        }
        
        // Check limit
        if (AppState.customQuotes.length >= CONFIG.MAX_CUSTOM_QUOTES) {
            console.warn('Maximum custom quotes limit reached');
            return false;
        }
        
        // Add timestamp and ID
        const customQuote = {
            ...quote,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            custom: true
        };
        
        AppState.customQuotes.push(customQuote);
        return this.save();
    },
    
    remove(id) {
        const index = AppState.customQuotes.findIndex(quote => quote.id === id);
        if (index > -1) {
            AppState.customQuotes.splice(index, 1);
            return this.save();
        }
        return false;
    },
    
    getAll() {
        return [...AppState.customQuotes];
    }
};

// Settings management
const Settings = {
    load() {
        // Load visual effects preference
        const effectsEnabled = Storage.get(CONFIG.LOCALSTORAGE_EFFECTS_KEY, true);
        AppState.visualEffectsEnabled = Boolean(effectsEnabled);
    },
    
    saveEffects(enabled) {
        AppState.visualEffectsEnabled = Boolean(enabled);
        return Storage.set(CONFIG.LOCALSTORAGE_EFFECTS_KEY, AppState.visualEffectsEnabled);
    }
};

// Timer management
const Timer = {
    start() {
        this.stop(); // Clear any existing timer
        AppState.countdown = CONFIG.COUNTDOWN_DURATION;
        
        if (AppState.isTimerPaused) return;
        
        AppState.timerInterval = setInterval(() => {
            AppState.countdown--;
            
            // Update countdown display
            const countdownEl = document.getElementById('countdown');
            if (countdownEl) countdownEl.textContent = AppState.countdown;
            
            // Trigger quote generation when countdown reaches 0
            if (AppState.countdown <= 0) {
                // This will be handled by the main app
                window.dispatchEvent(new CustomEvent('timerExpired'));
            }
        }, 1000);
    },
    
    stop() {
        if (AppState.timerInterval) {
            clearInterval(AppState.timerInterval);
            AppState.timerInterval = null;
        }
    },
    
    pause() {
        AppState.isTimerPaused = true;
        this.stop();
    },
    
    resume() {
        AppState.isTimerPaused = false;
        this.start();
    },
    
    toggle() {
        if (AppState.isTimerPaused) {
            this.resume();
        } else {
            this.pause();
        }
        return AppState.isTimerPaused;
    },
    
    reset() {
        AppState.countdown = CONFIG.COUNTDOWN_DURATION;
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) countdownEl.textContent = AppState.countdown;
    }
};

// Animation state management
const Animation = {
    setAnimating(isAnimating) {
        AppState.isAnimating = Boolean(isAnimating);
    },
    
    isAnimating() {
        return AppState.isAnimating;
    }
};

// Initialize state from storage
function initializeState() {
    try {
        Favorites.load();
        CustomQuotes.load();
        Settings.load();
        console.log('State initialized successfully');
    } catch (error) {
        console.error('Error initializing state:', error);
    }
}

export { 
    AppState, 
    Storage, 
    Favorites, 
    CustomQuotes, 
    Settings, 
    Timer, 
    Animation, 
    initializeState 
};