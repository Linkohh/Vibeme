// js/utils.js

// Debounce function for performance optimization
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function for performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Safe DOM query with error handling
function safeQuerySelector(selector, context = document) {
    try {
        return context.querySelector(selector);
    } catch (error) {
        console.error(`Error querying selector "${selector}":`, error);
        return null;
    }
}

function safeQuerySelectorAll(selector, context = document) {
    try {
        return context.querySelectorAll(selector);
    } catch (error) {
        console.error(`Error querying selector "${selector}":`, error);
        return [];
    }
}

// Safe event listener addition with error handling
function safeAddEventListener(element, event, handler, options = {}) {
    try {
        if (!element || typeof element.addEventListener !== 'function') {
            console.warn('Invalid element provided to addEventListener');
            return false;
        }
        element.addEventListener(event, handler, options);
        return true;
    } catch (error) {
        console.error(`Error adding event listener for "${event}":`, error);
        return false;
    }
}

// Check if an element is visible
function isElementVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Generate a simple hash for strings (for comparison purposes)
function simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
}

// Format text for sharing
function formatTextForSharing(text, author = '') {
    const cleanText = text.trim();
    const cleanAuthor = author ? author.trim() : '';
    
    if (cleanAuthor) {
        return `"${cleanText}" — ${cleanAuthor}`;
    }
    return `"${cleanText}" — Anonymous`;
}

// URL encoding helper
function safeEncodeURIComponent(str) {
    try {
        return encodeURIComponent(str);
    } catch (error) {
        console.error('Error encoding URI component:', error);
        return str.replace(/[^\w\s-]/gi, ''); // Fallback: remove special chars
    }
}

// Clipboard functionality with fallback
async function copyToClipboard(text) {
    try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            console.warn('Clipboard not available - not in browser environment');
            return false;
        }
        
        // Modern clipboard API
        if (navigator && navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return successful;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
}

// Random number generators
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// Array utilities
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getRandomElement(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

// Color utilities
function getRandomHSLColor(saturation = 80, lightness = 60) {
    const hue = Math.floor(Math.random() * 360);
    return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Performance monitoring
const PerformanceMonitor = {
    startTime: null,
    
    start(label = 'operation') {
        this.startTime = performance.now();
        console.time(label);
    },
    
    end(label = 'operation') {
        if (this.startTime) {
            const duration = performance.now() - this.startTime;
            console.timeEnd(label);
            this.startTime = null;
            return duration;
        }
        return 0;
    },
    
    mark(name) {
        try {
            performance.mark(name);
        } catch (error) {
            console.warn('Performance marking not supported:', error);
        }
    }
};

// Animation utilities
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// Device detection
const DeviceInfo = {
    get isMobile() {
        return typeof navigator !== 'undefined' && 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    get isTouch() {
        return typeof window !== 'undefined' && 
               ('ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0));
    },
    
    get supportsBackdropFilter() {
        return typeof CSS !== 'undefined' && CSS.supports && CSS.supports('backdrop-filter', 'blur(10px)');
    },
    
    get prefersReducedMotion() {
        return typeof window !== 'undefined' && 
               window.matchMedia && 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    
    // Check for specific features
    get supportsWebGL() {
        try {
            if (typeof document === 'undefined') return false;
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    },
    
    get supportsAnimations() {
        try {
            if (typeof document === 'undefined') return false;
            const element = document.createElement('div');
            return typeof element.style.animationName !== 'undefined';
        } catch (e) {
            return false;
        }
    }
};

// Error boundary helper
function createErrorBoundary(operation, fallback = null) {
    return async (...args) => {
        try {
            return await operation(...args);
        } catch (error) {
            console.error('Error in operation:', error);
            return fallback;
        }
    };
}

// Validation helpers
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Export all utilities
export {
    debounce,
    throttle,
    safeQuerySelector,
    safeQuerySelectorAll,
    safeAddEventListener,
    isElementVisible,
    simpleHash,
    formatTextForSharing,
    safeEncodeURIComponent,
    copyToClipboard,
    randomInt,
    randomFloat,
    shuffleArray,
    getRandomElement,
    getRandomHSLColor,
    hexToRgb,
    PerformanceMonitor,
    easeInOutCubic,
    easeOutElastic,
    DeviceInfo,
    createErrorBoundary,
    isValidUrl,
    sanitizeHtml
};