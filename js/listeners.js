// js/listeners.js
import { Elements, SafeUI, SettingsPanel, AddQuoteForm } from './ui.js';
import { AppState, Favorites, Settings } from './state.js';
import { EffectsController, MicroAnimations } from './effects.js';
import { gamification } from './gamification.js';
import { safeAddEventListener, debounce } from './utils.js';

// Event listener setup
const EventListeners = {
    init() {
        try {
            this.setupMainButtons();
            this.setupSettingsPanel();
            this.setupAddQuoteForm();
            this.setupGlobalListeners();
            this.setupCustomEvents();
            console.log('Event listeners initialized successfully');
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    },
    
    setupMainButtons() {
        // Generate button with micro-animations
        if (Elements.generateBtn) {
            safeAddEventListener(Elements.generateBtn, 'click', () => {
                MicroAnimations.buttonPressEffect(Elements.generateBtn);
                SafeUI.generateQuote();
                gamification.trackQuoteGenerated();
            });
        }
        
        // Copy button with success animation
        if (Elements.copyQuoteBtn) {
            safeAddEventListener(Elements.copyQuoteBtn, 'click', () => {
                MicroAnimations.buttonPressEffect(Elements.copyQuoteBtn);
                SafeUI.copyQuote();
                MicroAnimations.copySuccessAnimation(Elements.copyQuoteBtn);
            });
        }
        
        // Favorite button with heart animation
        if (Elements.favoriteQuoteBtn) {
            safeAddEventListener(Elements.favoriteQuoteBtn, 'click', () => {
                MicroAnimations.buttonPressEffect(Elements.favoriteQuoteBtn);
                MicroAnimations.favoriteAnimation(Elements.favoriteQuoteBtn);
                SafeUI.toggleFavorite();
                gamification.trackFavoriteAdded();
            });
        }
        
        // Timer toggle button
        if (Elements.timerToggleBtn) {
            safeAddEventListener(Elements.timerToggleBtn, 'click', () => {
                SafeUI.toggleTimer();
            });
        }
    },
    
    setupSettingsPanel() {
        // Settings toggle
        if (Elements.settingsToggle) {
            safeAddEventListener(Elements.settingsToggle, 'click', (e) => {
                e.stopPropagation();
                SettingsPanel.toggle();
            });
        }
        
        // Effects toggle
        if (Elements.effectsToggle) {
            // Set initial state
            Elements.effectsToggle.checked = AppState.visualEffectsEnabled;
            
            safeAddEventListener(Elements.effectsToggle, 'change', (e) => {
                const enabled = e.target.checked;
                EffectsController.toggle(enabled);
                Settings.saveEffects(enabled);
            });
        }
        
        // Clear favorites button
        if (Elements.clearFavoritesBtn) {
            safeAddEventListener(Elements.clearFavoritesBtn, 'click', () => {
                if (confirm("Are you sure you want to clear all your favorites? This cannot be undone.")) {
                    Favorites.clear();
                    
                    // Update UI
                    if (Elements.favoriteQuoteBtn) {
                        const icon = Elements.favoriteQuoteBtn.querySelector('i');
                        if (icon) {
                            icon.classList.remove('fas', 'text-pink-500');
                            icon.classList.add('far');
                        }
                    }
                    
                    // Show feedback
                    if (Elements.copyFeedback) {
                        Elements.copyFeedback.textContent = "Favorites cleared.";
                        setTimeout(() => {
                            if (Elements.copyFeedback) {
                                Elements.copyFeedback.textContent = "";
                            }
                        }, 2000);
                    }
                    
                    // If viewing favorites, switch to all quotes
                    if (AppState.activeCategory === 'favorites') {
                        AppState.activeCategory = 'all';
                        SafeUI.generateQuote();
                    }
                }
            });
        }
        
        // Click outside to close settings
        safeAddEventListener(document, 'click', (e) => {
            if (Elements.settingsPanel && 
                !Elements.settingsPanel.classList.contains('hidden') &&
                !Elements.settingsPanel.contains(e.target) && 
                e.target !== Elements.settingsToggle && 
                !Elements.settingsToggle?.contains(e.target)) {
                SettingsPanel.hide();
            }
        });
    },
    
    setupAddQuoteForm() {
        // Toggle add quote form
        if (Elements.toggleAddQuoteForm) {
            safeAddEventListener(Elements.toggleAddQuoteForm, 'click', () => {
                AddQuoteForm.toggle();
            });
        }
        
        // Submit quote
        if (Elements.submitQuoteBtn) {
            safeAddEventListener(Elements.submitQuoteBtn, 'click', () => {
                const success = AddQuoteForm.submit();
                if (success) {
                    // Optionally generate the new quote immediately
                    // SafeUI.generateQuote();
                }
            });
        }
        
        // Enter key in text area
        if (Elements.newQuoteText) {
            safeAddEventListener(Elements.newQuoteText, 'keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    AddQuoteForm.submit();
                }
            });
        }
        
        // Enter key in author field
        if (Elements.newQuoteAuthor) {
            safeAddEventListener(Elements.newQuoteAuthor, 'keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    AddQuoteForm.submit();
                }
            });
        }
    },
    
    setupGlobalListeners() {
        // Keyboard shortcuts
        safeAddEventListener(document, 'keydown', (e) => {
            // Prevent shortcuts when typing in form fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case ' ':
                case 'enter':
                    e.preventDefault();
                    SafeUI.generateQuote();
                    break;
                case 'c':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        SafeUI.copyQuote();
                    }
                    break;
                case 'f':
                    e.preventDefault();
                    SafeUI.toggleFavorite();
                    break;
                case 't':
                    e.preventDefault();
                    SafeUI.toggleTimer();
                    break;
                case 'escape':
                    SettingsPanel.hide();
                    break;
            }
        });
        
        // Window resize handler (debounced)
        const debouncedResize = debounce(() => {
            if (AppState.visualEffectsEnabled) {
                // Effects will handle their own resize logic
                window.dispatchEvent(new CustomEvent('effectsResize'));
            }
        }, 250);
        
        safeAddEventListener(window, 'resize', debouncedResize, { passive: true });
        
        // Page visibility change
        safeAddEventListener(document, 'visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, pause effects for performance
                if (AppState.visualEffectsEnabled) {
                    window.dispatchEvent(new CustomEvent('effectsPause'));
                }
            } else {
                // Page is visible, resume effects
                if (AppState.visualEffectsEnabled) {
                    window.dispatchEvent(new CustomEvent('effectsResume'));
                }
            }
        });
        
        // Prevent context menu on certain elements (optional)
        const noContextElements = [
            Elements.generateBtn,
            Elements.copyQuoteBtn,
            Elements.favoriteQuoteBtn
        ].filter(Boolean);
        
        noContextElements.forEach(element => {
            safeAddEventListener(element, 'contextmenu', (e) => {
                e.preventDefault();
            });
        });
        
        // Focus management for accessibility
        safeAddEventListener(document, 'keydown', (e) => {
            if (e.key === 'Tab') {
                // Ensure visible focus indicators
                document.body.classList.add('using-keyboard');
            }
        });
        
        safeAddEventListener(document, 'mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });
        
        // Handle browser back/forward
        safeAddEventListener(window, 'popstate', (e) => {
            // Handle any state changes if needed
            // For now, just ensure the app stays functional
            console.log('Navigation detected');
        });
        
        // Handle online/offline status
        safeAddEventListener(window, 'online', () => {
            console.log('App is online');
            // Could show a notification or update UI
        });
        
        safeAddEventListener(window, 'offline', () => {
            console.log('App is offline');
            // Could show offline indicator
        });
    },
    
    setupCustomEvents() {
        // Timer expired event
        safeAddEventListener(window, 'timerExpired', () => {
            SafeUI.generateQuote();
        });
        
        // Effects resize event
        safeAddEventListener(window, 'effectsResize', () => {
            // Effects controllers will handle this
        });
        
        // Effects pause/resume events
        safeAddEventListener(window, 'effectsPause', () => {
            // Could pause animations for performance
        });
        
        safeAddEventListener(window, 'effectsResume', () => {
            // Could resume animations
        });
        
        // Custom quote added event
        safeAddEventListener(window, 'quoteAdded', (e) => {
            console.log('New quote added:', e.detail);
        });
        
        // Favorite toggled event
        safeAddEventListener(window, 'favoriteToggled', (e) => {
            console.log('Favorite toggled:', e.detail);
        });
    },
    
    // Utility method to remove all listeners (for cleanup)
    cleanup() {
        try {
            // Note: In a real application, you'd want to keep track of 
            // listeners to properly remove them. For this implementation,
            // we rely on page unload to clean up.
            console.log('Event listeners cleanup initiated');
        } catch (error) {
            console.error('Error during event listeners cleanup:', error);
        }
    }
};

// Export the event listeners module
export { EventListeners };