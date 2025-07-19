// js/init.js
import { CONFIG, STORAGE_AVAILABLE } from './config.js';
import { initializeState, AppState, Timer } from './state.js';
import { Elements, QuoteGenerator, TimerUI } from './ui.js';
import { EventListeners } from './listeners.js';
import { EffectsController } from './effects.js';
import { DeviceInfo, PerformanceMonitor } from './utils.js';

// Application initialization
const AppInitializer = {
    async init() {
        try {
            PerformanceMonitor.start('appInit');
            
            console.log('🚀 Initializing VibeMe...');
            
            // Check browser compatibility
            if (!this.checkCompatibility()) {
                this.showCompatibilityError();
                return false;
            }
            
            // Initialize core systems
            await this.initializeCore();
            
            // Initialize UI
            await this.initializeUI();
            
            // Initialize effects
            this.initializeEffects();
            
            // Set up event listeners
            this.initializeEventListeners();
            
            // Load initial quote
            await this.loadInitialQuote();
            
            // Start timer if not paused
            this.initializeTimer();
            
            // Final setup
            this.finalizeInitialization();
            
            const initTime = PerformanceMonitor.end('appInit');
            console.log(`✅ VibeMe initialized successfully in ${initTime.toFixed(2)}ms`);
            
            // Dispatch initialization complete event
            window.dispatchEvent(new CustomEvent('vibeAppInitialized', {
                detail: { initTime, timestamp: Date.now() }
            }));
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize VibeMe:', error);
            this.showInitializationError(error);
            return false;
        }
    },
    
    checkCompatibility() {
        const requirements = {
            es6: this.checkES6Support(),
            localStorage: STORAGE_AVAILABLE,
            fetch: typeof fetch !== 'undefined',
            promises: typeof Promise !== 'undefined',
            eventListeners: typeof document.addEventListener !== 'undefined',
            cssCustomProperties: this.checkCSSCustomProperties(),
            requestAnimationFrame: typeof requestAnimationFrame !== 'undefined'
        };
        
        const failed = Object.entries(requirements)
            .filter(([key, supported]) => !supported)
            .map(([key]) => key);
        
        if (failed.length > 0) {
            console.error('Browser compatibility check failed:', failed);
            return false;
        }
        
        console.log('✅ Browser compatibility check passed');
        return true;
    },
    
    checkES6Support() {
        try {
            // Test for basic ES6 features
            new Function('(a = 0) => a')();
            return true;
        } catch (error) {
            return false;
        }
    },
    
    checkCSSCustomProperties() {
        try {
            return window.CSS && CSS.supports('color', 'var(--fake-var)');
        } catch (error) {
            return false;
        }
    },
    
    async initializeCore() {
        console.log('📊 Initializing core state...');
        
        // Initialize application state from localStorage
        initializeState();
        
        // Log device info for debugging
        console.log('Device Info:', {
            mobile: DeviceInfo.isMobile,
            touch: DeviceInfo.isTouch,
            animations: DeviceInfo.supportsAnimations,
            backdropFilter: DeviceInfo.supportsBackdropFilter,
            reducedMotion: DeviceInfo.prefersReducedMotion
        });
        
        // Adjust settings based on device capabilities
        console.log('🔍 Device capability checks:');
        console.log('  - prefersReducedMotion:', DeviceInfo.prefersReducedMotion);
        console.log('  - supportsAnimations:', DeviceInfo.supportsAnimations);
        console.log('  - Current visualEffectsEnabled:', AppState.visualEffectsEnabled);
        
        // TEMPORARILY DISABLED FOR DEBUGGING - Force effects enabled
        // if (DeviceInfo.prefersReducedMotion) {
        //     AppState.visualEffectsEnabled = false;
        //     console.log('🔇 Visual effects disabled due to reduced motion preference');
        // }
        
        // if (!DeviceInfo.supportsAnimations) {
        //     AppState.visualEffectsEnabled = false;
        //     console.log('📱 Visual effects disabled due to limited animation support');
        // }
        
        // FORCE ENABLE EFFECTS FOR DEBUGGING
        AppState.visualEffectsEnabled = true;
        console.log('🚨 DEBUGGING MODE: Visual effects FORCE ENABLED');
    },
    
    async initializeUI() {
        console.log('🎨 Initializing UI elements...');
        
        // Initialize DOM element references
        Elements.init();
        
        // Set initial UI state
        TimerUI.update();
        
        // Apply any stored preferences
        if (Elements.effectsToggle) {
            Elements.effectsToggle.checked = AppState.visualEffectsEnabled;
        }
        
        console.log('✅ UI elements initialized');
    },
    
    initializeEffects() {
        console.log('✨ Initializing visual effects...');
        
        if (AppState.visualEffectsEnabled && !DeviceInfo.prefersReducedMotion) {
            EffectsController.init();
            console.log('✅ Visual effects initialized');
        } else {
            console.log('⏭️ Visual effects skipped');
        }
    },
    
    initializeEventListeners() {
        console.log('🎧 Setting up event listeners...');
        EventListeners.init();
        console.log('✅ Event listeners initialized');
    },
    
    async loadInitialQuote() {
        console.log('📝 Loading initial quote...');
        
        try {
            // Generate the first quote
            const success = await QuoteGenerator.generate();
            
            if (!success) {
                console.warn('Failed to generate initial quote, using fallback');
                this.setFallbackQuote();
            } else {
                console.log('✅ Initial quote loaded');
            }
        } catch (error) {
            console.error('Error loading initial quote:', error);
            this.setFallbackQuote();
        }
    },
    
    setFallbackQuote() {
        if (Elements.quoteText) {
            Elements.quoteText.textContent = "Welcome to VibeMe! Click 'New Vibe' to get started.";
        }
        if (Elements.quoteAuthor) {
            Elements.quoteAuthor.textContent = "— VibeMe";
        }
    },
    
    initializeTimer() {
        console.log('⏰ Initializing timer...');
        
        if (!AppState.isTimerPaused) {
            Timer.start();
            console.log('✅ Timer started');
        } else {
            Timer.reset();
            console.log('⏸️ Timer paused');
        }
    },
    
    finalizeInitialization() {
        // Mark app as loaded
        document.body.classList.add('app-loaded');
        
        // Remove loading indicators if any
        const loadingElements = document.querySelectorAll('.loading, .spinner');
        loadingElements.forEach(el => el.remove());
        
        // Focus management
        if (Elements.generateBtn) {
            Elements.generateBtn.focus();
        }
        
        // Show any welcome messages or tours for first-time users
        this.checkFirstTimeUser();
        
        console.log('🎉 Application ready for user interaction');
    },
    
    checkFirstTimeUser() {
        try {
            const isFirstTime = !localStorage.getItem('vibeMe_hasVisited');
            
            if (isFirstTime && STORAGE_AVAILABLE) {
                localStorage.setItem('vibeMe_hasVisited', 'true');
                console.log('👋 Welcome first-time user!');
                
                // Could show a welcome message or tutorial
                // For now, just log it
            }
        } catch (error) {
            console.warn('Could not check first-time user status:', error);
        }
    },
    
    showCompatibilityError() {
        console.warn('🚫 Browser compatibility error - creating error overlay');
        
        // Create error overlay without destroying existing content
        const errorOverlay = document.createElement('div');
        errorOverlay.id = 'compatibility-error-overlay';
        errorOverlay.innerHTML = `
            <div style="
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: #1a1a1a; color: white; padding: 2rem;
                display: flex; align-items: center; justify-content: center;
                font-family: system-ui, -apple-system, sans-serif;
                z-index: 10000;
            ">
                <div style="text-align: center; max-width: 500px;">
                    <h1 style="margin-bottom: 1rem; color: #ff6b6b;">
                        Browser Not Supported
                    </h1>
                    <p style="margin-bottom: 1.5rem; line-height: 1.5;">
                        VibeMe requires a modern browser with ES6 support, localStorage, 
                        and CSS custom properties. Please update your browser or try a 
                        different one.
                    </p>
                    <p style="font-size: 0.9rem; opacity: 0.7;">
                        Recommended: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
                    </p>
                </div>
            </div>
        `;
        
        // Safely append error overlay without destroying existing DOM
        document.body.appendChild(errorOverlay);
    },
    
    showInitializationError(error) {
        console.error('💥 Initialization error - creating error overlay:', error);
        
        // Create error overlay without destroying existing content
        const errorOverlay = document.createElement('div');
        errorOverlay.id = 'initialization-error-overlay';
        errorOverlay.innerHTML = `
            <div style="
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: #1a1a1a; color: white; padding: 2rem;
                display: flex; align-items: center; justify-content: center;
                font-family: system-ui, -apple-system, sans-serif;
                z-index: 10000;
            ">
                <div style="text-align: center; max-width: 500px;">
                    <h1 style="margin-bottom: 1rem; color: #ff6b6b;">
                        Initialization Error
                    </h1>
                    <p style="margin-bottom: 1.5rem; line-height: 1.5;">
                        VibeMe failed to initialize properly. This might be due to 
                        network issues or browser limitations.
                    </p>
                    <button onclick="location.reload()" style="
                        background: #4CAF50; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 4px;
                        cursor: pointer; font-size: 1rem;
                    ">
                        Reload Page
                    </button>
                    <details style="margin-top: 1rem; text-align: left;">
                        <summary style="cursor: pointer; margin-bottom: 0.5rem;">
                            Technical Details
                        </summary>
                        <pre style="
                            background: #2a2a2a; padding: 1rem; border-radius: 4px;
                            font-size: 0.8rem; overflow: auto; white-space: pre-wrap;
                        ">${error.message}\n\n${error.stack}</pre>
                    </details>
                </div>
            </div>
        `;
        
        // Safely append error overlay without destroying existing DOM
        document.body.appendChild(errorOverlay);
    }
};

// Health check system
const HealthCheck = {
    checks: {
        domElements: () => {
            const critical = ['quote-text', 'quote-author', 'generate-btn'];
            return critical.every(id => document.getElementById(id) !== null);
        },
        
        localStorage: () => STORAGE_AVAILABLE,
        
        eventListeners: () => {
            return Elements.generateBtn && 
                   typeof Elements.generateBtn.addEventListener === 'function';
        },
        
        visualEffects: () => {
            return !AppState.visualEffectsEnabled || 
                   (document.getElementById('mouse-glow') !== null);
        },
        
        timer: () => {
            return AppState.timerInterval !== null || AppState.isTimerPaused;
        }
    },
    
    async run() {
        const results = {};
        let allPassed = true;
        
        for (const [name, check] of Object.entries(this.checks)) {
            try {
                results[name] = await check();
                if (!results[name]) allPassed = false;
            } catch (error) {
                results[name] = false;
                allPassed = false;
                console.error(`Health check failed for ${name}:`, error);
            }
        }
        
        console.log('🏥 Health Check Results:', results);
        
        if (!allPassed) {
            console.warn('⚠️ Some health checks failed');
        }
        
        return { passed: allPassed, results };
    }
};

// Performance monitoring
const PerformanceTracker = {
    metrics: {
        initTime: 0,
        firstQuoteTime: 0,
        averageQuoteLoadTime: 0,
        quoteLoadTimes: []
    },
    
    recordQuoteLoadTime(time) {
        this.metrics.quoteLoadTimes.push(time);
        this.metrics.averageQuoteLoadTime = 
            this.metrics.quoteLoadTimes.reduce((a, b) => a + b, 0) / 
            this.metrics.quoteLoadTimes.length;
    },
    
    getReport() {
        return {
            ...this.metrics,
            memoryUsage: this.getMemoryUsage(),
            timestamp: Date.now()
        };
    },
    
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
};

export { AppInitializer, HealthCheck, PerformanceTracker };

// Initialize the application when DOM is ready
function initApp() {
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                AppInitializer.init();
            });
        } else {
            // DOM is already loaded
            AppInitializer.init();
        }
    } else {
        console.warn('Not in browser environment - app initialization skipped');
    }
}

// Start initialization
initApp();