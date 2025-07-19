// js/main.js - VibeMe Enhanced JavaScript (No Modules)

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
        dailyQuote: JSON.parse(localStorage.getItem('vibeme-daily-quote') || 'null'),
        stats: JSON.parse(localStorage.getItem('vibeme-stats') || '{"quotesGenerated": 0, "quotesShared": 0, "dayStreak": 0, "lastVisit": null}')
    },

    // Audio context for enhanced sound effects
    audioContext: null,
    audioNodes: {},

    // Advanced Matrix Effect Configuration
    matrixConfig: {
        columnWidth: 16,
        updateInterval: 500,
        colors: ['#CC00FF', '#A104C1', '#4400F6', '#0050FF', '#03A0C5', '#00E5FF']
    },

    // Matrix Effect State Management
    matrixState: {
        interval: null,
        activeColumns: [],
        resizeHandler: null
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
            ]
        }
    },

    // Quote database
    quotes: [
        {text: "The only way to do great work is to love what you do.", author: "Steve Jobs"},
        {text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs"},
        {text: "Life is what happens when you're busy making other plans.", author: "John Lennon"},
        {text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt"},
        {text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle"},
        {text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney"},
        {text: "Don't let yesterday take up too much of today.", author: "Will Rogers"},
        {text: "You learn more from failure than from success.", author: "Unknown"},
        {text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill"},
        {text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt"},
        {text: "The only impossible journey is the one you never begin.", author: "Tony Robbins"}
    ],

    // Initialize the application
    init: function() {
        this.initializeAudio();
        this.setupEventListeners();
        this.loadUserPreferences();
        this.initializeEffects();
        this.initializeThemes();
        this.initializeDarkMode();
        this.initializeDailyQuote();
        this.initializeQuoteValidation();
        this.updateSocialLinks(this.getCurrentQuote());
        this.startTimer();
        this.updateStats();
        
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
        
        // Update rating display for new quote
        this.updateRatingDisplay();
        
        // Update stats
        this.state.stats.quotesGenerated++;
        this.saveStats();
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
    toggleSettings: function() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            this.playSound('click');
        }
    },

    toggleEffects: function() {
        const checkbox = document.getElementById('effects-toggle-checkbox');
        if (checkbox) {
            this.state.effectsEnabled = checkbox.checked;
            document.body.classList.toggle('effects-disabled', !this.state.effectsEnabled);
            localStorage.setItem('vibeme-effects', this.state.effectsEnabled);
            
            // Handle mouse glow cleanup/restart
            if (!this.state.effectsEnabled) {
                this.stopMouseGlow();
                this.stopMatrixEffect();
            } else {
                this.setupMouseGlow();
                this.setupMatrixEffect();
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
        this.setupMatrixEffect();
    },

    // ===== THEME SYSTEM =====
    initializeThemes: function() {
        this.applyRandomTheme();
    },

    getRandomTheme: function() {
        const categories = Object.keys(this.themes.colorPalettes);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const palettes = this.themes.colorPalettes[randomCategory];
        return palettes[Math.floor(Math.random() * palettes.length)];
    },

    applyRandomTheme: function() {
        const theme = this.getRandomTheme();
        this.applyTheme(theme);
    },

    applyTheme: function(theme) {
        const root = document.documentElement;
        root.style.setProperty('--color1', theme.color1);
        root.style.setProperty('--color2', theme.color2);
        root.style.setProperty('--color3', theme.color3);
        
        // Calculate text colors based on theme
        const textMain = this.darkenColor(theme.color1, 40);
        const textSecondary = this.darkenColor(theme.color2, 20);
        const socialBg = this.darkenColor(theme.color1, 10);
        
        root.style.setProperty('--text-color-main', textMain);
        root.style.setProperty('--text-color-secondary', textSecondary);
        root.style.setProperty('--social-icon-bg', socialBg);
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


    // Color utility functions
    hexToRgb: function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
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

    // User customization controls





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
        
        // Calculate target column count
        const baseColumnCount = Math.floor(window.innerWidth / this.matrixConfig.columnWidth);
        const targetColumns = Math.floor(baseColumnCount * 1.5); // 1.5x coverage for density
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
        
        // Add recycle listener
        column.addEventListener('animationend', () => this.recycleMatrixColumn(column));
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
        
        // Reset and restart animation
        column.style.animation = 'none';
        requestAnimationFrame(() => {
            column.style.animation = `fall ${duration}s linear ${delay}s`;
        });
    },

    generateMatrixContent: function() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const length = 100 + Math.floor(Math.random() * 50); // 100-150 characters
        let content = '';
        
        for (let i = 0; i < length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const opacity = Math.max(0.3, 1 - (i / length)); // Trailing effect
            content += `<span class="matrix-char" style="opacity: ${opacity.toFixed(2)}">${char}</span>`;
        }
        
        return content;
    },

    applyMatrixThemeColors: function(column) {
        const colors = this.matrixConfig.colors;
        const position = parseFloat(column.style.left) / 100; // 0.0 to 1.0
        
        // Determine color blend
        const segmentIndex = Math.floor(position * (colors.length - 1));
        const nextSegmentIndex = Math.min(segmentIndex + 1, colors.length - 1);
        const localPosition = (position * (colors.length - 1)) - segmentIndex;
        
        // Interpolate between colors
        const primaryColor = this.interpolateColor(colors[segmentIndex], colors[nextSegmentIndex], localPosition);
        
        // Apply color and glow
        column.style.setProperty('color', primaryColor, 'important');
        const glowColor = this.convertToRgba(primaryColor, 0.9);
        column.style.setProperty('text-shadow', `0 0 2px ${glowColor}, 0 0 4px ${glowColor}`, 'important');
    },

    removeSingleMatrixColumn: function() {
        if (this.matrixState.activeColumns.length === 0) return;
        const column = this.matrixState.activeColumns.pop();
        if (column && column.parentNode) {
            column.parentNode.removeChild(column);
        }
    },

    startMatrixUpdates: function() {
        if (!this.state.effectsEnabled) return;
        
        this.matrixState.interval = setInterval(() => {
            if (this.state.effectsEnabled) {
                this.updateMatrixColumns();
            }
        }, this.matrixConfig.updateInterval);
    },

    updateMatrixColumns: function() {
        if (!this.matrixBg || !this.state.effectsEnabled) return;
        
        const targetColumnCount = Math.floor(window.innerWidth / this.matrixConfig.columnWidth);
        const densityTarget = Math.floor(targetColumnCount * 1.5);
        
        if (this.matrixState.activeColumns.length < densityTarget) {
            const columnsToAdd = Math.min(5, densityTarget - this.matrixState.activeColumns.length);
            for (let i = 0; i < columnsToAdd; i++) {
                this.createSingleMatrixColumn();
            }
        }
    },

    handleMatrixResize: function() {
        this.createMatrixColumns();
    },

    createHeartParticles: function() {
        const container = document.querySelector('.quote-container-inner');
        if (!container) return;

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.innerHTML = '❤️';
                heart.style.cssText = `
                    position: absolute;
                    font-size: 1.5rem;
                    pointer-events: none;
                    z-index: 1000;
                    left: ${Math.random() * 100}%;
                    top: 50%;
                    animation: floatUp 2s ease-out forwards;
                `;

                container.appendChild(heart);
                
                setTimeout(() => heart.remove(), 2000);
            }, i * 100);
        }
    },

    // ===== FEEDBACK SYSTEM =====
    showFeedback: function(message, type = 'info') {
        const feedback = document.getElementById('copy-feedback');
        if (feedback) {
            feedback.textContent = message;
            feedback.className = `text-center text-sm mt-3 h-4 ${type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'dynamic-text-secondary'}`;
            setTimeout(() => {
                feedback.textContent = "";
                feedback.className = "text-center text-sm dynamic-text-secondary mt-3 h-4";
            }, 3000);
        }
    },

    // ===== DARK MODE =====
    initializeDarkMode: function() {
        this.applyDarkMode();
    },

    toggleDarkMode: function() {
        this.state.isDarkMode = !this.state.isDarkMode;
        this.applyDarkMode();
        localStorage.setItem('vibeme-dark-mode', JSON.stringify(this.state.isDarkMode));
        this.playSound('click');
    },

    applyDarkMode: function() {
        const body = document.body;
        const darkModeBtn = document.getElementById('dark-mode-toggle');
        const icon = darkModeBtn ? darkModeBtn.querySelector('i') : null;
        
        if (this.state.isDarkMode) {
            body.classList.add('dark-mode');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        } else {
            body.classList.remove('dark-mode');
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    },

    // ===== DAILY QUOTE =====
    initializeDailyQuote: function() {
        const today = new Date().toDateString();
        
        if (!this.state.dailyQuote || this.state.dailyQuote.date !== today) {
            this.generateDailyQuote();
        } else {
            this.displayDailyQuote();
        }
    },

    generateDailyQuote: function() {
        const inspirationalQuotes = [
            "Today is a new beginning.",
            "Every moment is a fresh start.",
            "Believe in yourself and magic happens.",
            "Your potential is limitless.",
            "Today's accomplishments were yesterday's impossibilities.",
            "Success starts with self-belief.",
            "Make today amazing.",
            "Your journey matters.",
            "Embrace the possibilities.",
            "Today is your canvas."
        ];
        
        const today = new Date().toDateString();
        const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
        
        this.state.dailyQuote = {
            text: randomQuote,
            date: today
        };
        
        localStorage.setItem('vibeme-daily-quote', JSON.stringify(this.state.dailyQuote));
        this.displayDailyQuote();
    },

    displayDailyQuote: function() {
        const dailyQuoteEl = document.getElementById('daily-quote-text');
        if (dailyQuoteEl && this.state.dailyQuote) {
            dailyQuoteEl.textContent = `"${this.state.dailyQuote.text}"`;
        }
    },

    // ===== QUOTE RATING SYSTEM =====
    rateQuote: function(rating) {
        const quote = this.getCurrentQuote();
        const quoteKey = `${quote.text}_${quote.author}`;
        
        this.state.quoteRatings[quoteKey] = rating;
        localStorage.setItem('vibeme-ratings', JSON.stringify(this.state.quoteRatings));
        
        const rateUpBtn = document.getElementById('rate-up-btn');
        const rateDownBtn = document.getElementById('rate-down-btn');
        
        // Update button states
        if (rateUpBtn && rateDownBtn) {
            const upIcon = rateUpBtn.querySelector('i');
            const downIcon = rateDownBtn.querySelector('i');
            
            // Reset both buttons
            upIcon.classList.remove('fas');
            upIcon.classList.add('far');
            downIcon.classList.remove('fas');
            downIcon.classList.add('far');
            
            // Highlight the selected rating
            if (rating === 'up') {
                upIcon.classList.remove('far');
                upIcon.classList.add('fas');
                this.showFeedback("Thanks for rating! 👍", 'success');
                this.playSound('success');
            } else {
                downIcon.classList.remove('far');
                downIcon.classList.add('fas');
                this.showFeedback("Feedback noted 👎", 'info');
                this.playSound('click');
            }
        }
        
        this.triggerHapticFeedback('light');
    },

    updateRatingDisplay: function() {
        const quote = this.getCurrentQuote();
        const quoteKey = `${quote.text}_${quote.author}`;
        const rating = this.state.quoteRatings[quoteKey];
        
        const rateUpBtn = document.getElementById('rate-up-btn');
        const rateDownBtn = document.getElementById('rate-down-btn');
        
        if (rateUpBtn && rateDownBtn) {
            const upIcon = rateUpBtn.querySelector('i');
            const downIcon = rateDownBtn.querySelector('i');
            
            // Reset icons
            upIcon.classList.remove('fas');
            upIcon.classList.add('far');
            downIcon.classList.remove('fas');
            downIcon.classList.add('far');
            
            // Show current rating
            if (rating === 'up') {
                upIcon.classList.remove('far');
                upIcon.classList.add('fas');
            } else if (rating === 'down') {
                downIcon.classList.remove('far');
                downIcon.classList.add('fas');
            }
        }
    },

    // ===== SECURE QUOTE VALIDATION =====
    initializeQuoteValidation: function() {
        const textInput = document.getElementById('new-quote-text');
        const authorInput = document.getElementById('new-quote-author');
        const charCounter = document.getElementById('char-counter');
        
        if (textInput && charCounter) {
            textInput.addEventListener('input', () => {
                const length = textInput.value.length;
                charCounter.textContent = `${length}/300`;
                this.validateQuoteInput();
            });
        }
        
        if (authorInput) {
            authorInput.addEventListener('input', () => {
                this.validateQuoteInput();
            });
        }
    },

    validateQuoteInput: function() {
        const textInput = document.getElementById('new-quote-text');
        const authorInput = document.getElementById('new-quote-author');
        const submitBtn = document.getElementById('submit-quote-btn');
        const validationDiv = document.getElementById('quote-validation');
        
        if (!textInput || !submitBtn || !validationDiv) return;
        
        const text = textInput.value.trim();
        const author = authorInput ? authorInput.value.trim() : '';
        
        // Validation rules
        const issues = [];
        
        // Length check
        if (text.length < 10) {
            issues.push('Quote must be at least 10 characters');
        }
        
        // Content filtering
        const inappropriateWords = ['hate', 'stupid', 'idiot', 'kill', 'die', 'death', 'violence'];
        const hasInappropriate = inappropriateWords.some(word => 
            text.toLowerCase().includes(word.toLowerCase())
        );
        
        if (hasInappropriate) {
            issues.push('Contains inappropriate content');
        }
        
        // Positive sentiment check
        const negativeWords = ['never', 'impossible', 'can\'t', 'won\'t', 'failure', 'quit'];
        const negativeCount = negativeWords.filter(word => 
            text.toLowerCase().includes(word.toLowerCase())
        ).length;
        
        if (negativeCount > 2) {
            issues.push('Quote should be more positive and inspiring');
        }
        
        // Author validation
        if (author && author.length > 0) {
            if (author.length < 2) {
                issues.push('Author name too short');
            }
            if (!/^[a-zA-Z\s\-'.]+$/.test(author)) {
                issues.push('Author name contains invalid characters');
            }
        }
        
        // Update UI
        if (issues.length === 0) {
            submitBtn.disabled = false;
            validationDiv.classList.add('hidden');
        } else {
            submitBtn.disabled = true;
            validationDiv.className = 'text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-500/30';
            validationDiv.innerHTML = `<i class="fas fa-exclamation-triangle mr-1"></i>${issues.join(', ')}`;
        }
    },

    // ===== DATA PERSISTENCE =====
    loadUserPreferences: function() {
        // Load effects preference
        const effectsPref = localStorage.getItem('vibeme-effects');
        if (effectsPref !== null) {
            this.state.effectsEnabled = effectsPref === 'true';
            const checkbox = document.getElementById('effects-toggle-checkbox');
            if (checkbox) {
                checkbox.checked = this.state.effectsEnabled;
                document.body.classList.toggle('effects-disabled', !this.state.effectsEnabled);
            }
        }
    },

    saveFavorites: function() {
        localStorage.setItem('vibeme-favorites', JSON.stringify(this.state.favorites));
    },

    saveCustomQuotes: function() {
        localStorage.setItem('vibeme-custom-quotes', JSON.stringify(this.state.customQuotes));
    },

    saveStats: function() {
        localStorage.setItem('vibeme-stats', JSON.stringify(this.state.stats));
    },

    updateStats: function() {
        const today = new Date().toDateString();
        if (this.state.stats.lastVisit !== today) {
            if (this.state.stats.lastVisit === new Date(Date.now() - 86400000).toDateString()) {
                this.state.stats.dayStreak++;
            } else {
                this.state.stats.dayStreak = 1;
            }
            this.state.stats.lastVisit = today;
            this.saveStats();
        }
    },

    // ===== EVENT LISTENERS =====
    setupEventListeners: function() {
        // Generate button
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.updateQuote());
        }

        // Copy button
        const copyBtn = document.getElementById('copy-quote-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyQuote());
        }

        // Favorite button
        const favoriteBtn = document.getElementById('favorite-quote-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        }

        // Timer toggle
        const timerBtn = document.getElementById('timer-toggle-btn');
        if (timerBtn) {
            timerBtn.addEventListener('click', () => this.toggleTimer());
        }

        // Settings toggle
        const settingsToggle = document.getElementById('settings-toggle');
        if (settingsToggle) {
            settingsToggle.addEventListener('click', () => this.toggleSettings());
        }

        // Effects toggle
        const effectsToggle = document.getElementById('effects-toggle-checkbox');
        if (effectsToggle) {
            effectsToggle.addEventListener('change', () => this.toggleEffects());
        }

        // Clear favorites
        const clearFavoritesBtn = document.getElementById('clear-favorites-btn');
        if (clearFavoritesBtn) {
            clearFavoritesBtn.addEventListener('click', () => this.clearFavorites());
        }

        // Add quote form toggle
        const addQuoteToggle = document.getElementById('toggle-add-quote-form');
        if (addQuoteToggle) {
            addQuoteToggle.addEventListener('click', () => this.toggleAddQuoteForm());
        }

        // Submit quote
        const submitBtn = document.getElementById('submit-quote-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitQuote());
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }

        // Rating buttons
        const rateUpBtn = document.getElementById('rate-up-btn');
        const rateDownBtn = document.getElementById('rate-down-btn');
        if (rateUpBtn) {
            rateUpBtn.addEventListener('click', () => this.rateQuote('up'));
        }
        if (rateDownBtn) {
            rateDownBtn.addEventListener('click', () => this.rateQuote('down'));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key.toLowerCase()) {
                case ' ':
                case 'enter':
                    e.preventDefault();
                    this.updateQuote();
                    break;
                case 'c':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.copyQuote();
                    }
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFavorite();
                    break;
                case 't':
                    e.preventDefault();
                    this.toggleTimer();
                    break;
                case 'escape':
                    const panel = document.getElementById('settings-panel');
                    if (panel && !panel.classList.contains('hidden')) {
                        panel.classList.add('hidden');
                    }
                    break;
            }
        });

        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('settings-panel');
            const toggle = document.getElementById('settings-toggle');
            
            if (panel && !panel.classList.contains('hidden') && 
                !panel.contains(e.target) && !toggle.contains(e.target)) {
                panel.classList.add('hidden');
            }
        });

        // Social sharing event tracking
        const socialLinks = document.querySelectorAll('[id$="-share"]');
        socialLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.state.stats.quotesShared++;
                this.saveStats();
                this.playSound('click');
            });
        });
    }
};

// ===== UTILITY ANIMATIONS =====
// Add floating heart animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
@keyframes floatUp {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateY(-100px) scale(0.5);
    }
}
`;
document.head.appendChild(style);

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    VibeMe.init();
});