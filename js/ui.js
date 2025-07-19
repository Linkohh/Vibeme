// js/ui.js
import { CONFIG } from './config.js';
import { AppState, Favorites, Timer, Animation } from './state.js';
import { quotes, getRandomQuoteFromCategory, validateQuote } from './quotes.js';
import { applyThemeStyles } from './themes.js';
import { EffectsController, MatrixEffect } from './effects.js';
import { 
    safeQuerySelector, 
    copyToClipboard, 
    formatTextForSharing, 
    safeEncodeURIComponent,
    createErrorBoundary 
} from './utils.js';

// DOM element cache
const Elements = {
    quoteText: null,
    quoteAuthor: null,
    generateBtn: null,
    countdown: null,
    timerToggleBtn: null,
    copyQuoteBtn: null,
    favoriteQuoteBtn: null,
    copyFeedback: null,
    settingsToggle: null,
    settingsPanel: null,
    effectsToggle: null,
    clearFavoritesBtn: null,
    toggleAddQuoteForm: null,
    addQuoteForm: null,
    newQuoteText: null,
    newQuoteAuthor: null,
    submitQuoteBtn: null,
    socialLinks: {},
    
    init() {
        try {
            this.quoteText = safeQuerySelector('#quote-text');
            this.quoteAuthor = safeQuerySelector('#quote-author');
            this.generateBtn = safeQuerySelector('#generate-btn');
            this.countdown = safeQuerySelector('#countdown');
            this.timerToggleBtn = safeQuerySelector('#timer-toggle-btn');
            this.copyQuoteBtn = safeQuerySelector('#copy-quote-btn');
            this.favoriteQuoteBtn = safeQuerySelector('#favorite-quote-btn');
            this.copyFeedback = safeQuerySelector('#copy-feedback');
            this.settingsToggle = safeQuerySelector('#settings-toggle');
            this.settingsPanel = safeQuerySelector('#settings-panel');
            this.effectsToggle = safeQuerySelector('#effects-toggle-checkbox');
            this.clearFavoritesBtn = safeQuerySelector('#clear-favorites-btn');
            this.toggleAddQuoteForm = safeQuerySelector('#toggle-add-quote-form');
            this.addQuoteForm = safeQuerySelector('#add-quote-form');
            this.newQuoteText = safeQuerySelector('#new-quote-text');
            this.newQuoteAuthor = safeQuerySelector('#new-quote-author');
            this.submitQuoteBtn = safeQuerySelector('#submit-quote-btn');
            
            // Social links
            this.socialLinks = {
                twitter: safeQuerySelector('#twitter-share'),
                facebook: safeQuerySelector('#facebook-share'),
                linkedin: safeQuerySelector('#linkedin-share'),
                whatsapp: safeQuerySelector('#whatsapp-share'),
                pinterest: safeQuerySelector('#pinterest-share')
            };
            
            this.validateCriticalElements();
            console.log('UI elements initialized successfully');
        } catch (error) {
            console.error('Error initializing UI elements:', error);
            throw new Error('Critical UI elements missing');
        }
    },
    
    validateCriticalElements() {
        const critical = [
            'quoteText', 'quoteAuthor', 'generateBtn', 'countdown',
            'copyQuoteBtn', 'favoriteQuoteBtn', 'timerToggleBtn'
        ];
        
        const missing = critical.filter(key => !this[key]);
        
        if (missing.length > 0) {
            throw new Error(`Critical UI elements missing: ${missing.join(', ')}`);
        }
    }
};

// Quote display and animation
const QuoteDisplay = {
    async show(quote) {
        try {
            if (!quote || Animation.isAnimating()) return false;
            
            Animation.setAnimating(true);
            
            // Start exit animation
            if (Elements.quoteText) Elements.quoteText.classList.add('exit-active');
            if (Elements.quoteAuthor) Elements.quoteAuthor.classList.add('author-exit');
            
            // Wait for exit animation
            await this.delay(600);
            
            // Update content and apply theme
            this.updateContent(quote);
            const themeColors = applyThemeStyles(quote.category || 'default', document.documentElement.style);
            
            if (themeColors) {
                AppState.currentThemeColors = themeColors;
                this.updateGenerateButton(themeColors);
                
                // Update matrix colors to match new theme
                if (MatrixEffect && typeof MatrixEffect.updateThemeColors === 'function') {
                    MatrixEffect.updateThemeColors();
                }
            }
            
            // Small delay before enter animation
            await this.delay(50);
            
            // Start enter animation
            this.startEnterAnimation(quote);
            
            // Complete animation
            await this.delay(800);
            this.completeAnimation();
            
            // Update UI elements
            SocialShare.updateLinks();
            FavoriteButton.update();
            EffectsController.generatePattern();
            
            AppState.currentQuote = quote;
            Animation.setAnimating(false);
            
            return true;
        } catch (error) {
            console.error('Error showing quote:', error);
            Animation.setAnimating(false);
            return false;
        }
    },
    
    updateContent(quote) {
        if (Elements.quoteText) {
            Elements.quoteText.textContent = quote.text;
            Elements.quoteText.dataset.text = quote.text;
        }
        
        if (Elements.quoteAuthor) {
            const authorText = quote.author ? `— ${quote.author}` : '— Anonymous';
            Elements.quoteAuthor.textContent = authorText;
        }
    },
    
    updateGenerateButton(themeColors) {
        if (Elements.generateBtn && themeColors) {
            Elements.generateBtn.style.background = 
                `linear-gradient(135deg, ${themeColors.color1} 0%, ${themeColors.color2} 100%)`;
        }
    },
    
    startEnterAnimation(quote) {
        if (Elements.quoteText) {
            Elements.quoteText.classList.remove('exit-active');
            Elements.quoteText.classList.add('enter-active');
            
            if (AppState.visualEffectsEnabled) {
                Elements.quoteText.classList.add('glitch-effect');
            }
        }
        
        if (Elements.quoteAuthor) {
            Elements.quoteAuthor.classList.remove('author-exit');
            Elements.quoteAuthor.classList.add('author-enter');
        }
    },
    
    completeAnimation() {
        if (Elements.quoteText) {
            Elements.quoteText.classList.remove('enter-active', 'glitch-effect');
        }
        
        if (Elements.quoteAuthor) {
            Elements.quoteAuthor.classList.remove('author-enter');
        }
    },
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Timer UI
const TimerUI = {
    update() {
        if (Elements.countdown) {
            Elements.countdown.textContent = AppState.countdown;
        }
    },
    
    updateToggleButton(isPaused) {
        if (!Elements.timerToggleBtn) return;
        
        const icon = Elements.timerToggleBtn.querySelector('i');
        if (!icon) return;
        
        if (isPaused) {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            Elements.timerToggleBtn.title = "Resume Timer";
        } else {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            Elements.timerToggleBtn.title = "Pause Timer";
        }
    }
};

// Copy functionality
const CopyButton = {
    async copy() {
        try {
            if (!AppState.currentQuote || this.isSpecialCategory(AppState.currentQuote.category)) {
                return false;
            }
            
            const textToCopy = formatTextForSharing(
                AppState.currentQuote.text, 
                AppState.currentQuote.author
            );
            
            const success = await copyToClipboard(textToCopy);
            this.showFeedback(success ? "Copied to clipboard!" : "Copy failed.");
            
            return success;
        } catch (error) {
            console.error('Error copying quote:', error);
            this.showFeedback("Copy failed.");
            return false;
        }
    },
    
    showFeedback(message) {
        if (!Elements.copyFeedback) return;
        
        Elements.copyFeedback.textContent = message;
        
        if (AppState.copyTimeout) {
            clearTimeout(AppState.copyTimeout);
        }
        
        AppState.copyTimeout = setTimeout(() => {
            if (Elements.copyFeedback) {
                Elements.copyFeedback.textContent = "";
            }
        }, CONFIG.COPY_FEEDBACK_DURATION);
    },
    
    isSpecialCategory(category) {
        return ['favorites_empty', 'category_empty', 'empty'].includes(category);
    }
};

// Favorite button
const FavoriteButton = {
    toggle() {
        try {
            if (!AppState.currentQuote || CopyButton.isSpecialCategory(AppState.currentQuote.category)) {
                return false;
            }
            
            const isCurrentlyFavorite = Favorites.exists(AppState.currentQuote);
            
            if (isCurrentlyFavorite) {
                Favorites.remove(AppState.currentQuote);
            } else {
                Favorites.add(AppState.currentQuote);
            }
            
            this.update();
            
            // If we're viewing favorites and just removed the last one, generate new quote
            if (AppState.activeCategory === 'favorites' && Favorites.getAll().length === 0) {
                AppState.activeCategory = 'all';
                QuoteGenerator.generate();
            }
            
            return true;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return false;
        }
    },
    
    update() {
        if (!Elements.favoriteQuoteBtn) return;
        
        const icon = Elements.favoriteQuoteBtn.querySelector('i');
        if (!icon) return;
        
        const isFavorite = AppState.currentQuote && 
                          !CopyButton.isSpecialCategory(AppState.currentQuote.category) &&
                          Favorites.exists(AppState.currentQuote);
        
        if (isFavorite) {
            icon.classList.remove('far');
            icon.classList.add('fas', 'text-pink-500');
            Elements.favoriteQuoteBtn.title = "Remove from Favorites";
        } else {
            icon.classList.remove('fas', 'text-pink-500');
            icon.classList.add('far');
            Elements.favoriteQuoteBtn.title = "Add to Favorites";
        }
    }
};

// Social sharing
const SocialShare = {
    updateLinks() {
        try {
            if (!AppState.currentQuote || CopyButton.isSpecialCategory(AppState.currentQuote.category)) {
                return;
            }
            
            const textToShare = formatTextForSharing(
                AppState.currentQuote.text, 
                AppState.currentQuote.author
            );
            const encodedText = safeEncodeURIComponent(textToShare);
            const pageUrl = window.location.href;
            const encodedUrl = safeEncodeURIComponent(pageUrl);
            
            if (Elements.socialLinks.twitter) {
                Elements.socialLinks.twitter.href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
            }
            
            if (Elements.socialLinks.facebook) {
                Elements.socialLinks.facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
            }
            
            if (Elements.socialLinks.linkedin) {
                Elements.socialLinks.linkedin.href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=Inspirational%20Quote&summary=${encodedText}`;
            }
            
            if (Elements.socialLinks.whatsapp) {
                Elements.socialLinks.whatsapp.href = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
            }
            
            if (Elements.socialLinks.pinterest) {
                Elements.socialLinks.pinterest.href = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`;
            }
        } catch (error) {
            console.error('Error updating social links:', error);
        }
    }
};

// Settings panel
const SettingsPanel = {
    toggle() {
        if (Elements.settingsPanel) {
            Elements.settingsPanel.classList.toggle('hidden');
        }
    },
    
    hide() {
        if (Elements.settingsPanel) {
            Elements.settingsPanel.classList.add('hidden');
        }
    }
};

// Add quote form
const AddQuoteForm = {
    toggle() {
        if (Elements.addQuoteForm) {
            Elements.addQuoteForm.classList.toggle('hidden');
        }
    },
    
    submit() {
        try {
            if (!Elements.newQuoteText || !Elements.newQuoteAuthor) return false;
            
            const text = Elements.newQuoteText.value.trim();
            const author = Elements.newQuoteAuthor.value.trim();
            
            if (!text) {
                CopyButton.showFeedback("Quote text is required");
                return false;
            }
            
            if (text.length > 500) {
                CopyButton.showFeedback("Quote too long (max 500 characters)");
                return false;
            }
            
            const newQuote = {
                text: text,
                author: author || '',
                category: 'custom',
                custom: true,
                timestamp: new Date().toISOString()
            };
            
            if (!validateQuote(newQuote)) {
                CopyButton.showFeedback("Invalid quote format");
                return false;
            }
            
            // Add to quotes array (for immediate use)
            quotes.push(newQuote);
            
            // Clear form
            Elements.newQuoteText.value = '';
            Elements.newQuoteAuthor.value = '';
            this.toggle(); // Hide form
            
            CopyButton.showFeedback("Quote added successfully!");
            return true;
        } catch (error) {
            console.error('Error submitting quote:', error);
            CopyButton.showFeedback("Error adding quote");
            return false;
        }
    }
};

// Main quote generator
const QuoteGenerator = {
    async generate() {
        try {
            if (Animation.isAnimating()) return false;
            
            const newQuote = this.selectQuote();
            if (!newQuote) {
                console.error('No quote available');
                return false;
            }
            
            const success = await QuoteDisplay.show(newQuote);
            
            if (success && !AppState.isTimerPaused) {
                Timer.start();
            } else {
                Timer.reset();
            }
            
            return success;
        } catch (error) {
            console.error('Error generating quote:', error);
            return false;
        }
    },
    
    selectQuote() {
        try {
            let eligibleQuotes = [];
            
            if (AppState.activeCategory === 'favorites') {
                eligibleQuotes = Favorites.getAll();
                if (eligibleQuotes.length === 0) {
                    return {
                        text: "No favorites yet. Click the heart to add some!",
                        author: "VibeMe",
                        category: "favorites_empty"
                    };
                }
            } else {
                eligibleQuotes = [...quotes];
            }
            
            if (eligibleQuotes.length === 0) {
                return {
                    text: "No vibes to share right now. Check back later!",
                    author: "VibeMe",
                    category: "empty"
                };
            }
            
            // Avoid repeating the same quote
            if (eligibleQuotes.length === 1) {
                return eligibleQuotes[0];
            }
            
            let newQuote;
            let attempts = 0;
            const maxAttempts = Math.min(eligibleQuotes.length * 2, 20);
            
            do {
                const randomIndex = Math.floor(Math.random() * eligibleQuotes.length);
                newQuote = eligibleQuotes[randomIndex];
                attempts++;
            } while (newQuote === AppState.currentQuote && attempts < maxAttempts);
            
            return newQuote;
        } catch (error) {
            console.error('Error selecting quote:', error);
            return {
                text: "Error loading quote. Please try again.",
                author: "VibeMe",
                category: "empty"
            };
        }
    }
};

// Create error-wrapped versions of critical functions
const SafeUI = {
    generateQuote: createErrorBoundary(QuoteGenerator.generate.bind(QuoteGenerator), false),
    copyQuote: createErrorBoundary(CopyButton.copy.bind(CopyButton), false),
    toggleFavorite: createErrorBoundary(FavoriteButton.toggle.bind(FavoriteButton), false),
    toggleTimer: createErrorBoundary(() => {
        const wasPaused = Timer.toggle();
        TimerUI.updateToggleButton(wasPaused);
        return wasPaused;
    }, false)
};

export { 
    Elements, 
    QuoteDisplay, 
    TimerUI, 
    CopyButton, 
    FavoriteButton, 
    SocialShare, 
    SettingsPanel, 
    AddQuoteForm,
    QuoteGenerator,
    SafeUI 
};