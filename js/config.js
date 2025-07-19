// js/config.js
const CONFIG = {
    COUNTDOWN_DURATION: 10,
    MATRIX_COLUMN_WIDTH: 14, // Proper width to match CSS column dimensions
    MATRIX_MESSAGE_CHANCE: 0.15,
    MATRIX_UPDATE_INTERVAL: 500, // Faster column generation for density
    COPY_FEEDBACK_DURATION: 2000,
    LOCALSTORAGE_FAVORITES_KEY: 'vibeMeFavorites',
    LOCALSTORAGE_EFFECTS_KEY: 'vibeMeEffectsEnabled',
    LOCALSTORAGE_CUSTOM_QUOTES_KEY: 'vibeMeCustomQuotes',
    MAX_CUSTOM_QUOTES: 50,
    ANIMATION_TIMEOUT: 1000,
    RESIZE_DEBOUNCE: 250,
    
    // Enhanced Mouse Glow Configuration
    MOUSE_GLOW: {
        BASE_SIZE: 100,
        HOVER_SIZE: 125,
        BLUR_RADIUS: 20,
        HOVER_BLUR_RADIUS: 25,
        OPACITY: 0.9,
        HOVER_OPACITY: 0.65,
        SMOOTHING_FACTOR: 0.15,
        SPEED_THRESHOLD: 5,
        CONTRAST_THRESHOLD: 0.5,
        PROFILE_CHANGE_INTERVAL: 8000,
        TRAIL_LENGTH: 3,
        PRECISION_MODE: true
    }
};

// Validate localStorage availability
const STORAGE_AVAILABLE = (() => {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.warn('localStorage not available, using fallback');
        return false;
    }
})();

export { CONFIG, STORAGE_AVAILABLE };