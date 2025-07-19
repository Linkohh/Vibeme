// js/effects.js - Enhanced Visual Effects for VibeMe
import { CONFIG } from './config.js';
import { AppState } from './state.js';
// Removed unused import - binaryMessages no longer needed
import { audioSystem, hapticFeedback } from './audio.js';
import { debounce, throttle, getRandomElement, DeviceInfo } from './utils.js';

// Color utility functions for smart contrast detection
const ColorUtils = {
    // Convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    // Calculate luminance of a color
    getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },

    // Calculate contrast ratio between two colors
    getContrastRatio(color1, color2) {
        const lum1 = this.getLuminance(color1.r, color1.g, color1.b);
        const lum2 = this.getLuminance(color2.r, color2.g, color2.b);
        return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    },

    // Generate complementary color for better visibility
    getComplementaryColor(hue, saturation, lightness) {
        const complementaryHue = (hue + 180) % 360;
        const adjustedSaturation = Math.max(saturation, 70);
        const adjustedLightness = lightness > 50 ? lightness - 20 : lightness + 20;
        return { hue: complementaryHue, saturation: adjustedSaturation, lightness: adjustedLightness };
    },

    // Calculate optimal glow color based on background
    getOptimalGlowColor(backgroundHue, backgroundSaturation, backgroundLightness) {
        const bgColor = this.hslToRgb(backgroundHue, backgroundSaturation, backgroundLightness);
        const bgLuminance = this.getLuminance(bgColor.r, bgColor.g, bgColor.b);
        
        // If background is dark, use brighter glow
        if (bgLuminance < 0.3) {
            return { hue: backgroundHue, saturation: 90, lightness: 70 };
        }
        // If background is light, use darker/more saturated glow
        else if (bgLuminance > 0.7) {
            return { hue: backgroundHue, saturation: 100, lightness: 40 };
        }
        // Medium background, use complementary color
        else {
            return this.getComplementaryColor(backgroundHue, backgroundSaturation, backgroundLightness);
        }
    },

    // Convert HSL to RGB
    hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
        };
        return { r: f(0), g: f(8), b: f(4) };
    }
};

// Enhanced micro-interaction effects
export const MicroAnimations = {
    // Typewriter effect for quote text
    typewriterEffect(element, text, speed = 50) {
        return new Promise((resolve) => {
            element.textContent = '';
            element.classList.add('typewriter-active');
            
            let i = 0;
            const timer = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(timer);
                    element.classList.remove('typewriter-active');
                    resolve();
                }
            }, speed);
        });
    },

    // Button press feedback
    buttonPressEffect(button) {
        button.classList.add('button-press');
        
        // Add audio and haptic feedback
        audioSystem.playClick();
        hapticFeedback.light();
        
        setTimeout(() => {
            button.classList.remove('button-press');
        }, 150);
    },

    // Favorite heart animation with particles
    favoriteAnimation(button) {
        button.classList.add('pulse-favorite');
        
        // Add audio and haptic feedback
        audioSystem.playFavorite();
        hapticFeedback.medium();
        
        // Create heart particles
        this.createHeartParticles(button);
        
        setTimeout(() => {
            button.classList.remove('pulse-favorite');
        }, 600);
    },

    // Create floating heart particles
    createHeartParticles(element) {
        const rect = element.getBoundingClientRect();
        const particles = 5;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.innerHTML = '❤️';
            particle.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width/2}px;
                top: ${rect.top + rect.height/2}px;
                font-size: 12px;
                pointer-events: none;
                z-index: 9999;
                animation: heartFloat 2s ease-out forwards;
                animation-delay: ${i * 0.1}s;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }
    },

    // Copy success animation with checkmark
    copySuccessAnimation(button) {
        const icon = button.querySelector('i');
        const originalClass = icon.className;
        
        // Add success audio
        audioSystem.playSuccess();
        
        icon.className = 'fas fa-check';
        button.style.color = '#10b981';
        
        setTimeout(() => {
            icon.className = originalClass;
            button.style.color = '';
        }, 1500);
    },

    // Floating animation for elements
    addFloatingEffect(element) {
        element.classList.add('floating');
    },

    removeFloatingEffect(element) {
        element.classList.remove('floating');
    }
};

// Add CSS for heart particles
const heartParticleStyles = document.createElement('style');
heartParticleStyles.textContent = `
    @keyframes heartFloat {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(heartParticleStyles);

// Glow color profiles for mouse effect
const glowColorProfiles = [
    { name: "Vibrant", saturation: 100, lightness: 60, speed: 0.5 },
    { name: "Pastel", saturation: 70, lightness: 75, speed: 0.3 },
    { name: "Deep", saturation: 90, lightness: 50, speed: 0.6 },
    { name: "Bright", saturation: 100, lightness: 70, speed: 0.4 },
    { name: "Aurora", saturation: 85, lightness: 65, speed: 0.8 },
    { name: "Mystic", saturation: 75, lightness: 55, speed: 0.25 }
];

// Pattern generation for quote backgrounds
const patterns = [
    "polka-dots", "zigzag", "waves", "crosses", "bubbles",
    "squares", "triangles", "lines"
];

// Enhanced Mouse glow effect with precision tracking
const MouseGlow = {
    // Enhanced state tracking
    state: {
        lastX: 0,
        lastY: 0,
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        velocity: { x: 0, y: 0 },
        isMoving: false,
        lastMoveTime: 0,
        animationId: null,
        smoothingFactor: CONFIG.MOUSE_GLOW.SMOOTHING_FACTOR,
        currentThemeColors: null
    },

    init() {
        if (!AppState.visualEffectsEnabled || DeviceInfo.prefersReducedMotion) return;
        
        AppState.mouseGlow.element = document.getElementById('mouse-glow');
        if (!AppState.mouseGlow.element) {
            console.warn('🔍 Mouse glow element not found - recreating it');
            
            // Recreate missing mouse glow element
            const mouseGlow = document.createElement('div');
            mouseGlow.id = 'mouse-glow';
            mouseGlow.className = 'mouse-glow';
            mouseGlow.setAttribute('aria-hidden', 'true');
            
            // Insert at the beginning of body (behind other content)
            document.body.insertBefore(mouseGlow, document.body.firstChild);
            AppState.mouseGlow.element = mouseGlow;
            console.log('✅ Mouse glow element recreated');
        }
        
        this.setupPrecisionTracking();
        this.setupEventListeners();
        this.startColorAnimation();
        this.startProfileChange();
        this.startRenderLoop();
    },

    // High-precision mouse tracking system
    setupPrecisionTracking() {
        const element = AppState.mouseGlow.element;
        if (!element) return;

        // Use high-performance mouse tracking
        const updateMousePosition = (e) => {
            if (!AppState.visualEffectsEnabled) return;
            
            const now = performance.now();
            const deltaTime = now - this.state.lastMoveTime;
            
            // Calculate velocity for speed-based effects
            if (deltaTime > 0) {
                this.state.velocity.x = (e.clientX - this.state.lastX) / deltaTime;
                this.state.velocity.y = (e.clientY - this.state.lastY) / deltaTime;
            }
            
            // Update target position (no smoothing for precision)
            if (CONFIG.MOUSE_GLOW.PRECISION_MODE) {
                this.state.targetX = e.clientX;
                this.state.targetY = e.clientY;
            } else {
                // Apply smoothing for gentler movement
                this.state.targetX = this.state.currentX + (e.clientX - this.state.currentX) * 0.1;
                this.state.targetY = this.state.currentY + (e.clientY - this.state.currentY) * 0.1;
            }
            
            this.state.lastX = e.clientX;
            this.state.lastY = e.clientY;
            this.state.lastMoveTime = now;
            this.state.isMoving = true;
            
            // Update opacity based on movement
            element.style.opacity = CONFIG.MOUSE_GLOW.OPACITY;
        };

        // Use passive event listeners for better performance
        document.addEventListener('mousemove', updateMousePosition, { passive: true });
        
        // Handle mouse enter/leave for opacity
        document.addEventListener('mouseenter', () => {
            if (AppState.visualEffectsEnabled && element) {
                element.style.opacity = CONFIG.MOUSE_GLOW.OPACITY;
            }
        }, { passive: true });
        
        document.addEventListener('mouseleave', () => {
            if (element) {
                element.style.opacity = '0';
                this.state.isMoving = false;
            }
        }, { passive: true });
    },

    // Smooth rendering loop for ultra-responsive tracking
    startRenderLoop() {
        let lastFrameTime = 0;
        
        const render = (currentTime) => {
            if (!AppState.visualEffectsEnabled || !AppState.mouseGlow.element) {
                this.state.animationId = requestAnimationFrame(render);
                return;
            }
            
            // Throttle to avoid excessive rendering
            const deltaTime = currentTime - lastFrameTime;
            if (deltaTime < 16) { // ~60fps limit
                this.state.animationId = requestAnimationFrame(render);
                return;
            }
            lastFrameTime = currentTime;
            
            // Smooth interpolation for fluid movement
            const smoothing = this.state.smoothingFactor;
            this.state.currentX += (this.state.targetX - this.state.currentX) * smoothing;
            this.state.currentY += (this.state.targetY - this.state.currentY) * smoothing;
            
            // Use transform3d for hardware acceleration and sub-pixel precision
            const element = AppState.mouseGlow.element;
            const size = this.calculateDynamicSize();
            
            // Batch DOM updates for better performance
            const updates = {
                transform: `translate3d(${this.state.currentX - size/2}px, ${this.state.currentY - size/2}px, 0)`,
                width: `${size}px`,
                height: `${size}px`
            };
            
            // Update blur based on speed
            const speed = Math.sqrt(this.state.velocity.x ** 2 + this.state.velocity.y ** 2);
            const blur = CONFIG.MOUSE_GLOW.BLUR_RADIUS + (speed * 0.5);
            updates.filter = `blur(${Math.min(blur, 40)}px)`;
            
            // Apply all updates at once
            Object.assign(element.style, updates);
            
            this.state.animationId = requestAnimationFrame(render);
        };
        
        this.state.animationId = requestAnimationFrame(render);
    },

    // Calculate dynamic size based on speed and interaction
    calculateDynamicSize() {
        const speed = Math.sqrt(this.state.velocity.x ** 2 + this.state.velocity.y ** 2);
        const baseSize = CONFIG.MOUSE_GLOW.BASE_SIZE;
        const speedMultiplier = Math.min(speed * 0.1, 20);
        
        // Check if hovering over interactive elements
        const isHovering = AppState.mouseGlow.element?.classList.contains('hover-effect');
        const hoverSize = isHovering ? CONFIG.MOUSE_GLOW.HOVER_SIZE : baseSize;
        
        return hoverSize + speedMultiplier;
    },
    
    setupEventListeners() {
        // Enhanced event listeners now handled in setupPrecisionTracking
        this.setupHoverEffects();
        this.setupThemeIntegration();
        this.setupGlowControls();
    },

    // Setup user customization controls
    setupGlowControls() {
        const intensitySlider = document.getElementById('glow-intensity');
        const sizeSlider = document.getElementById('glow-size');
        const trackingCheckbox = document.getElementById('glow-tracking');
        const intensityValue = document.getElementById('glow-intensity-value');
        const sizeValue = document.getElementById('glow-size-value');
        
        // Load saved preferences
        this.loadGlowPreferences();
        
        // Intensity control
        if (intensitySlider && intensityValue) {
            intensitySlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                intensityValue.textContent = value + '%';
                this.updateGlowIntensity(value / 100);
                this.saveGlowPreferences();
            });
        }
        
        // Size control
        if (sizeSlider && sizeValue) {
            sizeSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                sizeValue.textContent = value + 'px';
                this.updateGlowSize(value);
                this.saveGlowPreferences();
            });
        }
        
        // Precision tracking toggle
        if (trackingCheckbox) {
            trackingCheckbox.addEventListener('change', (e) => {
                this.updateTrackingMode(e.target.checked);
                this.saveGlowPreferences();
            });
        }
    },

    // Update glow intensity
    updateGlowIntensity(intensity) {
        const element = AppState.mouseGlow.element;
        if (!element) return;
        
        const baseOpacity = 0.9; // Original base opacity
        const newOpacity = baseOpacity * intensity;
        
        CONFIG.MOUSE_GLOW.OPACITY = newOpacity;
        CONFIG.MOUSE_GLOW.HOVER_OPACITY = newOpacity * 0.72; // Maintain ratio
        
        element.style.setProperty('--glow-intensity', intensity);
        if (element.style.opacity !== '0') {
            element.style.opacity = newOpacity;
        }
    },

    // Update glow size
    updateGlowSize(size) {
        const element = AppState.mouseGlow.element;
        if (!element) return;
        
        CONFIG.MOUSE_GLOW.BASE_SIZE = size;
        CONFIG.MOUSE_GLOW.HOVER_SIZE = size * 1.25; // Maintain ratio
        
        // Update current size if not hovering
        if (!element.classList.contains('hover-effect')) {
            element.style.width = size + 'px';
            element.style.height = size + 'px';
        }
    },

    // Update tracking mode
    updateTrackingMode(precisionMode) {
        CONFIG.MOUSE_GLOW.PRECISION_MODE = precisionMode;
        this.state.smoothingFactor = precisionMode ? 0.95 : CONFIG.MOUSE_GLOW.SMOOTHING_FACTOR;
        
        // Provide feedback
        const feedback = document.getElementById('copy-feedback');
        if (feedback) {
            feedback.textContent = precisionMode ? 'Precision tracking enabled' : 'Smooth tracking enabled';
            feedback.className = 'text-center text-sm text-green-400 mt-3 h-4';
            setTimeout(() => {
                feedback.textContent = '';
                feedback.className = 'text-center text-sm dynamic-text-secondary mt-3 h-4';
            }, 2000);
        }
    },

    // Save glow preferences to localStorage
    saveGlowPreferences() {
        const preferences = {
            intensity: CONFIG.MOUSE_GLOW.OPACITY,
            size: CONFIG.MOUSE_GLOW.BASE_SIZE,
            precisionMode: CONFIG.MOUSE_GLOW.PRECISION_MODE
        };
        
        localStorage.setItem('vibeme-glow-preferences', JSON.stringify(preferences));
    },

    // Load glow preferences from localStorage
    loadGlowPreferences() {
        const saved = localStorage.getItem('vibeme-glow-preferences');
        if (!saved) return;
        
        try {
            const preferences = JSON.parse(saved);
            
            // Apply saved settings
            if (preferences.intensity !== undefined) {
                CONFIG.MOUSE_GLOW.OPACITY = preferences.intensity;
                CONFIG.MOUSE_GLOW.HOVER_OPACITY = preferences.intensity * 0.72;
                
                const slider = document.getElementById('glow-intensity');
                const value = document.getElementById('glow-intensity-value');
                if (slider && value) {
                    const percent = Math.round(preferences.intensity * 100);
                    slider.value = percent;
                    value.textContent = percent + '%';
                }
            }
            
            if (preferences.size !== undefined) {
                CONFIG.MOUSE_GLOW.BASE_SIZE = preferences.size;
                CONFIG.MOUSE_GLOW.HOVER_SIZE = preferences.size * 1.25;
                
                const slider = document.getElementById('glow-size');
                const value = document.getElementById('glow-size-value');
                if (slider && value) {
                    slider.value = preferences.size;
                    value.textContent = preferences.size + 'px';
                }
            }
            
            if (preferences.precisionMode !== undefined) {
                CONFIG.MOUSE_GLOW.PRECISION_MODE = preferences.precisionMode;
                this.state.smoothingFactor = preferences.precisionMode ? 0.95 : CONFIG.MOUSE_GLOW.SMOOTHING_FACTOR;
                
                const checkbox = document.getElementById('glow-tracking');
                if (checkbox) {
                    checkbox.checked = preferences.precisionMode;
                }
            }
        } catch (error) {
            console.warn('Error loading glow preferences:', error);
        }
    },

    // Integrate with theme system for color adaptation
    setupThemeIntegration() {
        const element = AppState.mouseGlow.element;
        if (!element) return;
        
        // Listen for theme changes
        const observer = new MutationObserver(() => {
            this.updateGlowColors();
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        // Initial color update
        this.updateGlowColors();
    },

    // Smart color adaptation based on current theme
    updateGlowColors() {
        const element = AppState.mouseGlow.element;
        if (!element) return;
        
        const rootStyles = getComputedStyle(document.documentElement);
        const color1 = rootStyles.getPropertyValue('--color1').trim();
        const color2 = rootStyles.getPropertyValue('--color2').trim();
        
        if (color1 && color2) {
            // Extract HSL values from current theme
            const bgColor = ColorUtils.hexToRgb(color1);
            if (bgColor) {
                const bgLuminance = ColorUtils.getLuminance(bgColor.r, bgColor.g, bgColor.b);
                
                // Remove existing contrast classes
                element.classList.remove('high-contrast', 'low-contrast');
                
                // Adjust glow properties based on background luminance
                let glowHue = AppState.mouseGlow.hue || 0;
                let glowSaturation = 100;
                let glowLightness = 60;
                
                // Smart contrast adjustment with CSS class application
                if (bgLuminance < 0.2) {
                    // Very dark background - use bright glow
                    glowLightness = 75;
                    glowSaturation = 85;
                } else if (bgLuminance < CONFIG.MOUSE_GLOW.CONTRAST_THRESHOLD) {
                    // Dark background - use brighter glow
                    glowLightness = 70;
                    glowSaturation = 90;
                } else if (bgLuminance > 0.8) {
                    // Very light background - use high contrast mode
                    glowLightness = 35;
                    glowSaturation = 100;
                    element.classList.add('high-contrast');
                } else if (bgLuminance > 0.6) {
                    // Light background - use darker, more saturated glow
                    glowLightness = 45;
                    glowSaturation = 100;
                } else {
                    // Medium background - check for color similarity
                    const currentHue = AppState.mouseGlow.hue || 0;
                    const bgHue = this.extractHueFromColor(color1);
                    
                    // If glow and background have similar hues, use complementary color
                    if (Math.abs(currentHue - bgHue) < 30) {
                        element.classList.add('low-contrast');
                        glowLightness = bgLuminance > 0.5 ? 30 : 80;
                        glowSaturation = 100;
                    }
                }
                
                // Apply calculated values
                element.style.setProperty('--glow-saturation', glowSaturation + '%');
                element.style.setProperty('--glow-lightness', glowLightness + '%');
                element.style.setProperty('--glow-contrast', bgLuminance > 0.7 ? '1.5' : '1');
                
                this.state.currentThemeColors = { color1, color2, bgLuminance };
            }
        }
    },
    
    // Helper function to extract hue from hex color
    extractHueFromColor(hexColor) {
        const rgb = ColorUtils.hexToRgb(hexColor);
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
            hue = (g - b) / diff;
        } else if (max === g) {
            hue = 2 + (b - r) / diff;
        } else {
            hue = 4 + (r - g) / diff;
        }
        
        hue = (hue * 60 + 360) % 360;
        return hue;
    },
    
    setupHoverEffects() {
        const element = AppState.mouseGlow.element;
        if (!element) return;
        
        const interactiveSelectors = [
            'a', 'button', '.social-bubble', 
            '.quote-container-inner', '.quote-container-outer',
            '[role="button"]', '.action-button', '.generate-btn'
        ];
        
        interactiveSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    if (!AppState.visualEffectsEnabled) return;
                    element.classList.add('hover-effect');
                    element.style.opacity = CONFIG.MOUSE_GLOW.HOVER_OPACITY;
                    
                    // Add enhanced glow for interactive elements
                    const enhancedBlur = CONFIG.MOUSE_GLOW.HOVER_BLUR_RADIUS;
                    element.style.filter = `blur(${enhancedBlur}px)`;
                }, { passive: true });
                
                el.addEventListener('mouseleave', () => {
                    element.classList.remove('hover-effect');
                    element.style.opacity = CONFIG.MOUSE_GLOW.OPACITY;
                    element.style.filter = `blur(${CONFIG.MOUSE_GLOW.BLUR_RADIUS}px)`;
                }, { passive: true });
            });
        });
    },
    
    // Enhanced color animation with theme integration
    startColorAnimation() {
        if (!AppState.visualEffectsEnabled || !AppState.mouseGlow.element) return;
        
        const animate = () => {
            if (!AppState.visualEffectsEnabled || !AppState.mouseGlow.element) {
                if (AppState.mouseGlow.animationId) {
                    cancelAnimationFrame(AppState.mouseGlow.animationId);
                    AppState.mouseGlow.animationId = null;
                }
                return;
            }
            
            const profile = glowColorProfiles[AppState.mouseGlow.profileIndex];
            AppState.mouseGlow.hue = (AppState.mouseGlow.hue + profile.speed) % 360;
            
            // Apply smart color adaptation
            const element = AppState.mouseGlow.element;
            if (this.state.currentThemeColors) {
                const optimalColor = ColorUtils.getOptimalGlowColor(
                    AppState.mouseGlow.hue,
                    profile.saturation,
                    profile.lightness
                );
                
                element.style.setProperty('--glow-hue', optimalColor.hue.toFixed(2));
                element.style.setProperty('--glow-saturation', optimalColor.saturation + '%');
                element.style.setProperty('--glow-lightness', optimalColor.lightness + '%');
            } else {
                element.style.setProperty('--glow-hue', AppState.mouseGlow.hue.toFixed(2));
            }
            
            AppState.mouseGlow.animationId = requestAnimationFrame(animate);
        };
        
        AppState.mouseGlow.animationId = requestAnimationFrame(animate);
    },
    
    // Enhanced profile change with smoother transitions
    startProfileChange() {
        if (!AppState.visualEffectsEnabled || !AppState.mouseGlow.element) return;
        
        const changeProfile = () => {
            if (!AppState.mouseGlow.element) return;
            
            AppState.mouseGlow.profileIndex = (AppState.mouseGlow.profileIndex + 1) % glowColorProfiles.length;
            const profile = glowColorProfiles[AppState.mouseGlow.profileIndex];
            
            // Smooth transition to new profile
            const element = AppState.mouseGlow.element;
            element.style.transition = 'all 0.8s ease-in-out';
            element.style.setProperty('--glow-saturation', profile.saturation + '%');
            element.style.setProperty('--glow-lightness', profile.lightness + '%');
            
            // Remove transition after change
            setTimeout(() => {
                element.style.transition = '';
            }, 800);
        };
        
        AppState.mouseGlow.profileChangeInterval = setInterval(changeProfile, CONFIG.MOUSE_GLOW.PROFILE_CHANGE_INTERVAL);
    },
    
    // Enhanced stop function
    stop() {
        if (this.state.animationId) {
            cancelAnimationFrame(this.state.animationId);
            this.state.animationId = null;
        }
        
        if (AppState.mouseGlow.animationId) {
            cancelAnimationFrame(AppState.mouseGlow.animationId);
            AppState.mouseGlow.animationId = null;
        }
        
        if (AppState.mouseGlow.profileChangeInterval) {
            clearInterval(AppState.mouseGlow.profileChangeInterval);
            AppState.mouseGlow.profileChangeInterval = null;
        }
        
        if (AppState.mouseGlow.element) {
            AppState.mouseGlow.element.style.opacity = '0';
            AppState.mouseGlow.element.style.transform = 'translate3d(-50%, -50%, 0)';
        }
        
        // Reset state
        this.state.isMoving = false;
        this.state.currentX = 0;
        this.state.currentY = 0;
        this.state.targetX = 0;
        this.state.targetY = 0;
    }
};

// Matrix effect
const MatrixEffect = {
    init() {
        console.log('🌌 MatrixEffect.init() called');
        console.log('📊 Visual effects enabled:', AppState.visualEffectsEnabled);
        console.log('🎭 Reduced motion preference:', DeviceInfo.prefersReducedMotion);
        
        if (!AppState.visualEffectsEnabled || DeviceInfo.prefersReducedMotion) {
            console.log('⏭️ Matrix init skipped - effects disabled or reduced motion');
            return;
        }
        
        let matrixBg = document.getElementById('matrix-bg');
        console.log('🎯 Matrix background element:', matrixBg);
        
        if (!matrixBg) {
            console.warn('❌ Matrix background element not found - recreating it');
            
            // Recreate missing matrix background element
            matrixBg = document.createElement('div');
            matrixBg.id = 'matrix-bg';
            matrixBg.className = 'matrix-bg';
            matrixBg.setAttribute('aria-hidden', 'true');
            
            // Insert at the beginning of body (behind other content)
            document.body.insertBefore(matrixBg, document.body.firstChild);
            console.log('✅ Matrix background element recreated');
        }
        
        // Check if element is visible in CSS
        const computedStyle = window.getComputedStyle(matrixBg);
        console.log('👁️ Matrix element display:', computedStyle.display);
        console.log('🔍 Matrix element visibility:', computedStyle.visibility);
        console.log('🌫️ Matrix element opacity:', computedStyle.opacity);
        
        console.log('✅ Matrix background element found and checking state');
        
        // Ensure matrix state is initialized
        if (!AppState.matrix.activeColumns) {
            AppState.matrix.activeColumns = [];
        }
        
        this.matrixBg = matrixBg;
        console.log('📏 Creating columns...');
        this.createColumns();
        console.log('🔄 Starting updates...');
        this.startUpdates();
        console.log('🎨 Setting up theme observer...');
        this.setupThemeObserver();
        
        console.log('🎉 Matrix effect initialized successfully');
        console.log('📊 Active columns count:', AppState.matrix.activeColumns.length);
        
        // Handle window resize
        const debouncedResize = debounce(() => {
            if (AppState.visualEffectsEnabled) this.handleResize();
        }, CONFIG.RESIZE_DEBOUNCE);
        
        window.addEventListener('resize', debouncedResize, { passive: true });
    },
    
    // Set up observer to watch for theme changes
    setupThemeObserver() {
        if (this.themeObserver) return; // Already set up
        
        this.themeObserver = new MutationObserver((mutations) => {
            let themeChanged = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target === document.documentElement) {
                        themeChanged = true;
                    }
                }
            });
            
            if (themeChanged) {
                // Debounce theme updates to avoid excessive calls
                clearTimeout(this.themeUpdateTimeout);
                this.themeUpdateTimeout = setTimeout(() => {
                    this.updateThemeColors();
                }, 100);
            }
        });
        
        // Observe changes to the document element's style attribute
        this.themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });
    },
    
    createColumns() {
        if (!this.matrixBg || !AppState.visualEffectsEnabled) {
            console.log('⏭️ createColumns skipped - no matrixBg or effects disabled');
            return;
        }
        
        console.log('📏 Creating matrix columns...');
        console.log('🖥️ Window width:', window.innerWidth);
        console.log('📐 Matrix column width:', CONFIG.MATRIX_COLUMN_WIDTH);
        
        const baseColumnCount = Math.floor(window.innerWidth / CONFIG.MATRIX_COLUMN_WIDTH);
        // Create 50% more columns for dense coverage
        const columnCount = Math.floor(baseColumnCount * 1.5);
        const neededColumns = columnCount - AppState.matrix.activeColumns.length;
        
        console.log('🧮 Base column count:', baseColumnCount);
        console.log('🎯 Target column count:', columnCount);
        console.log('📊 Current active columns:', AppState.matrix.activeColumns.length);
        console.log('➕ Columns needed:', neededColumns);
        
        if (neededColumns > 0) {
            console.log(`✨ Creating ${neededColumns} new columns`);
            for (let i = 0; i < neededColumns; i++) {
                this.createSingleColumn();
            }
        } else if (neededColumns < 0) {
            const columnsToRemove = Math.abs(neededColumns);
            console.log(`🗑️ Removing ${columnsToRemove} excess columns`);
            for (let i = 0; i < columnsToRemove && AppState.matrix.activeColumns.length > 0; i++) {
                this.removeSingleColumn();
            }
        }
        
        console.log('✅ Column creation complete. Total columns:', AppState.matrix.activeColumns.length);
    },
    
    createSingleColumn() {
        if (!this.matrixBg || !AppState.visualEffectsEnabled) {
            console.log('⏭️ createSingleColumn skipped - matrixBg:', !!this.matrixBg, 'effectsEnabled:', AppState.visualEffectsEnabled);
            return;
        }
        
        console.log('🔨 Creating single matrix column...');
        
        const column = document.createElement('div');
        column.className = 'binary-column';
        column.style.left = `${Math.random() * 100}%`;
        
        console.log('📍 Column positioned at:', column.style.left);
        
        // Finite animation timing for recycling system
        const duration = 12 + Math.random() * 6; // 12-18 seconds range for visible motion
        const delay = Math.random() * 2; // 0-2 seconds delay for immediate appearance
        
        // Use finite animation (no infinite) for proper recycling
        column.style.animation = `fall ${duration}s linear ${delay}s`;
        console.log('🎬 Animation set:', column.style.animation);
        
        // Vary animation speed (less frequently to reduce static columns)
        if (Math.random() > 0.8) {
            column.classList.add('fast');
            console.log('⚡ Fast column created');
        } else if (Math.random() < 0.2) {
            column.classList.add('slow');
            console.log('🐌 Slow column created');
        }
        
        // Apply theme-based colors
        this.applyThemeColors(column);
        
        // Initial setup using recycling function
        this.recycleColumn(column);
        
        console.log('🏗️ Appending column to matrix background...');
        this.matrixBg.appendChild(column);
        AppState.matrix.activeColumns.push(column);
        
        console.log('✅ Column added. Total columns:', AppState.matrix.activeColumns.length);
        console.log('📊 Column content preview:', column.innerHTML.substring(0, 50) + '...');
        
        // Add to DOM and trigger animation (simplified - no conflicting transitions)
        requestAnimationFrame(() => {
            setTimeout(() => {
                column.classList.add('visible');
                console.log('👁️ Column made visible');
            }, 10);
        });
        
        // Recycle column instead of removing when animation ends
        column.addEventListener('animationend', () => {
            console.log('🔄 Column animation ended - recycling');
            this.recycleColumn(column);
        });
    },
    
    // Recycle column by resetting position and content (prevents memory leaks)
    recycleColumn(column) {
        if (!column || !AppState.visualEffectsEnabled) {
            console.log('⏭️ recycleColumn skipped - column:', !!column, 'effectsEnabled:', AppState.visualEffectsEnabled);
            return;
        }
        
        console.log('♻️ Recycling column...');
        
        // Reset position to random location
        const newPosition = `${Math.random() * 100}%`;
        column.style.left = newPosition;
        console.log('📍 Column repositioned to:', newPosition);
        
        // Generate new content
        const newContent = this.generateMatrixContent();
        column.innerHTML = newContent;
        console.log('📝 New content generated, length:', newContent.length);
        
        // Apply new theme colors
        this.applyThemeColors(column);
        
        // Reset animation with new timing
        const duration = 12 + Math.random() * 6; // 12-18 seconds
        const delay = Math.random() * 2; // 0-2 seconds delay
        
        console.log('🎬 New animation timing - duration:', duration, 'delay:', delay);
        
        // Temporarily remove animation, then restart
        column.style.animation = 'none';
        requestAnimationFrame(() => {
            column.style.animation = `fall ${duration}s linear ${delay}s`;
            console.log('✅ Column recycled and reanimated');
        });
    },
    
    generateMatrixContent() {
        console.log('📝 Generating matrix content...');
        
        // Define character sets for matrix effect
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        
        // Generate very long continuous streams like in reference image
        const length = 120 + Math.floor(Math.random() * 80); // 120-200 characters per stream
        console.log('📏 Content length will be:', length, 'characters');
        
        let content = '';
        
        for (let i = 0; i < length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            
            // Calculate opacity for trailing effect (brightest at top, fading down)
            const opacity = Math.max(0.3, 1 - (i / length));
            
            // Create individual character spans for precise control
            const span = `<span class="matrix-char" style="opacity: ${opacity.toFixed(2)}" data-index="${i}">${char}</span>`;
            content += span;
        }
        
        console.log('✅ Matrix content generated:', content.length, 'chars total');
        console.log('🔤 Sample characters:', content.substring(0, 100) + '...');
        
        return content;
    },
    
    // Apply theme-synchronized colors to matrix columns
    applyThemeColors(column) {
        // Force use of custom 6-color gradient - User's specified colors
        const color1 = '#CC00FF'; // Vibrant Magenta
        const color2 = '#A104C1'; // Rich Purple
        const color3 = '#4400F6'; // Deep Indigo
        const color4 = '#0050FF'; // Bright Blue
        const color5 = '#03A0C5'; // Dark Teal
        const color6 = '#00E5FF'; // Electric Cyan
        
        // Get column position (0-100% as string, convert to 0-1)
        const leftPercent = parseFloat(column.style.left);
        const position = leftPercent / 100; // Convert percentage to 0-1
        
        // Create smooth 6-color horizontal gradient effect
        const colors = [color1, color2, color3, color4, color5, color6];
        let primaryColor;
        
        // Calculate which segment of the gradient we're in (0-5)
        const segmentIndex = Math.floor(position * (colors.length - 1));
        const nextSegmentIndex = Math.min(segmentIndex + 1, colors.length - 1);
        const localPosition = (position * (colors.length - 1)) - segmentIndex;
        
        // Interpolate between the two colors in the current segment
        primaryColor = this.interpolateColor(colors[segmentIndex], colors[nextSegmentIndex], localPosition);
        
        // Color application verified - debug logging removed for performance
        
        // Apply the color to the column with !important to override CSS
        column.style.setProperty('color', primaryColor, 'important');
        
        // Add enhanced glow effect using the same color
        const glowColor = this.convertToRgba(primaryColor, 0.9);
        const secondaryGlow = this.convertToRgba(primaryColor, 0.6);
        const tertiaryGlow = this.convertToRgba(primaryColor, 0.3);
        column.style.setProperty('text-shadow', `0 0 2px ${glowColor}, 0 0 4px ${glowColor}, 0 0 6px ${secondaryGlow}, 0 0 8px ${tertiaryGlow}`, 'important');
        
        // Set CSS variables for individual character coloring
        column.style.setProperty('--primary-color', primaryColor);
        column.style.setProperty('--glow-color', glowColor);
    },
    
    // Interpolate between two hex colors
    interpolateColor(color1, color2, factor) {
        if (!color1 || !color2) return '#00ff00'; // Fallback green
        
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        if (!c1 || !c2) return '#00ff00';
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    },
    
    // Convert hex to RGB
    hexToRgb(hex) {
        if (!hex) return null;
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    // Convert any color format to rgba
    convertToRgba(color, alpha = 1) {
        if (!color) return 'rgba(255, 255, 255, 0.5)';
        
        // If already rgba, just modify alpha
        if (color.startsWith('rgba')) {
            return color.replace(/[\d\.]+\)$/g, alpha + ')');
        }
        
        // If rgb, convert to rgba
        if (color.startsWith('rgb')) {
            return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        }
        
        // If hex, convert to rgba
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        
        return 'rgba(255, 255, 255, 0.5)';
    },
    
    // Update all existing columns when theme changes
    updateThemeColors() {
        if (!AppState.visualEffectsEnabled) return;
        
        AppState.matrix.activeColumns.forEach(column => {
            this.applyThemeColors(column);
        });
    },
    
    removeSingleColumn() {
        if (AppState.matrix.activeColumns.length === 0) return;
        
        const column = AppState.matrix.activeColumns.pop();
        if (column && column.parentNode === this.matrixBg) {
            column.classList.remove('visible');
            setTimeout(() => {
                if (column.parentNode === this.matrixBg) {
                    this.matrixBg.removeChild(column);
                }
            }, 500);
        }
    },
    
    removeColumn(column) {
        if (column.parentNode === this.matrixBg) {
            this.matrixBg.removeChild(column);
        }
        AppState.matrix.activeColumns = AppState.matrix.activeColumns.filter(c => c !== column);
    },
    
    
    startUpdates() {
        if (!AppState.visualEffectsEnabled) return;
        
        AppState.matrix.interval = setInterval(() => {
            if (AppState.visualEffectsEnabled) this.updateColumns();
        }, CONFIG.MATRIX_UPDATE_INTERVAL);
    },
    
    updateColumns() {
        if (!this.matrixBg || !AppState.visualEffectsEnabled) return;
        
        const targetColumnCount = Math.floor(window.innerWidth / CONFIG.MATRIX_COLUMN_WIDTH);
        // Increase target by 50% for denser coverage
        const densityTarget = Math.floor(targetColumnCount * 1.5);
        
        if (AppState.matrix.activeColumns.length < densityTarget) {
            const columnsToAdd = Math.min(8, densityTarget - AppState.matrix.activeColumns.length);
            for (let i = 0; i < columnsToAdd; i++) {
                this.createSingleColumn();
            }
        }
    },
    
    handleResize() {
        this.createColumns();
    },
    
    stop() {
        if (AppState.matrix.interval) {
            clearInterval(AppState.matrix.interval);
            AppState.matrix.interval = null;
        }
        
        // Clean up theme observer
        if (this.themeObserver) {
            this.themeObserver.disconnect();
            this.themeObserver = null;
        }
        
        // Clear any pending theme updates
        if (this.themeUpdateTimeout) {
            clearTimeout(this.themeUpdateTimeout);
            this.themeUpdateTimeout = null;
        }
        
        // Remove all columns
        AppState.matrix.activeColumns.forEach(column => {
            if (column.parentNode) column.parentNode.removeChild(column);
        });
        AppState.matrix.activeColumns = [];
    }
};

// Pattern generator for quote backgrounds
const PatternGenerator = {
    generate() {
        try {
            const quotePatternEl = document.getElementById('quote-pattern');
            if (!quotePatternEl) return;
            
            const patternType = getRandomElement(patterns);
            if (!patternType) return;
            
            const patternColor = this.getRandomColor();
            const patternCSS = this.generatePatternCSS(patternType, patternColor);
            
            quotePatternEl.style.backgroundImage = patternCSS;
            quotePatternEl.style.backgroundSize = '20px 20px';
        } catch (error) {
            console.error('Error generating pattern:', error);
        }
    },
    
    generatePatternCSS(patternType, color) {
        switch(patternType) {
            case 'polka-dots':
                return `radial-gradient(${color} 2px, transparent 2px)`;
            
            case 'zigzag':
                return `linear-gradient(135deg, ${color} 25%, transparent 25%) -10px 0, 
                        linear-gradient(225deg, ${color} 25%, transparent 25%) -10px 0, 
                        linear-gradient(315deg, ${color} 25%, transparent 25%), 
                        linear-gradient(45deg, ${color} 25%, transparent 25%)`;
            
            case 'waves':
                return `radial-gradient(circle at 100% 50%, transparent 20%, ${color} 21%, ${color} 34%, transparent 35%, transparent), 
                        radial-gradient(circle at 0% 50%, transparent 20%, ${color} 21%, ${color} 34%, transparent 35%, transparent) 0 -20px`;
            
            case 'crosses':
                return `linear-gradient(${color} 1px, transparent 1px), 
                        linear-gradient(90deg, ${color} 1px, transparent 1px)`;
            
            case 'bubbles':
                return `radial-gradient(circle at center, ${color} 0%, transparent 20%)`;
            
            case 'squares':
                return `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color}), 
                        linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color}) 10px 10px`;
            
            case 'triangles':
                return `linear-gradient(45deg, ${color} 50%, transparent 50%)`;
            
            case 'lines':
                return `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 6px)`;
            
            default:
                return `radial-gradient(${color} 2px, transparent 2px)`;
        }
    },
    
    getRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsla(${hue}, 80%, 60%, 0.3)`;
    }
};

// Helper function to ensure visual effect elements exist
function ensureEffectElements() {
    console.log('🔧 Ensuring visual effect elements exist...');
    
    // Ensure matrix background element exists
    if (!document.getElementById('matrix-bg')) {
        console.log('🌌 Creating missing matrix-bg element');
        const matrixBg = document.createElement('div');
        matrixBg.id = 'matrix-bg';
        matrixBg.className = 'matrix-bg';
        matrixBg.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(matrixBg, document.body.firstChild);
    }
    
    // Ensure mouse glow element exists  
    if (!document.getElementById('mouse-glow')) {
        console.log('🔍 Creating missing mouse-glow element');
        const mouseGlow = document.createElement('div');
        mouseGlow.id = 'mouse-glow';
        mouseGlow.className = 'mouse-glow';
        mouseGlow.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(mouseGlow, document.body.firstChild);
    }
    
    console.log('✅ Visual effect elements verified/created');
}

// Main effects controller
const EffectsController = {
    init() {
        try {
            console.log('🎭 EffectsController.init() called');
            console.log('📊 AppState.visualEffectsEnabled:', AppState.visualEffectsEnabled);
            console.log('🎭 DeviceInfo.prefersReducedMotion:', DeviceInfo.prefersReducedMotion);
            console.log('🎨 Body classes at init:', document.body.className);
            
            // Always ensure elements exist, even if effects are disabled
            ensureEffectElements();
            
            if (AppState.visualEffectsEnabled && !DeviceInfo.prefersReducedMotion) {
                console.log('✅ Initializing visual effects...');
                MouseGlow.init();
                MatrixEffect.init();
            } else {
                console.log('⏭️ Visual effects initialization skipped');
            }
            console.log('🎉 Effects controller initialization complete');
        } catch (error) {
            console.error('❌ Error initializing effects:', error);
        }
    },
    
    toggle(enabled) {
        console.log('🎛️ EffectsController.toggle called with enabled:', enabled);
        console.log('📊 Current AppState.visualEffectsEnabled:', AppState.visualEffectsEnabled);
        
        // Always ensure elements exist before toggling
        ensureEffectElements();
        
        AppState.visualEffectsEnabled = enabled;
        document.body.classList.toggle('effects-disabled', !enabled);
        
        console.log('🎨 Body classes after toggle:', document.body.className);
        console.log('🔍 Effects disabled class present:', document.body.classList.contains('effects-disabled'));
        
        if (enabled && !DeviceInfo.prefersReducedMotion) {
            console.log('✅ Starting effects - MouseGlow and MatrixEffect');
            MouseGlow.init();
            MatrixEffect.init();
        } else {
            console.log('⏹️ Stopping effects');
            MouseGlow.stop();
            MatrixEffect.stop();
        }
    },
    
    generatePattern() {
        PatternGenerator.generate();
    }
};

export { EffectsController, MouseGlow, MatrixEffect, PatternGenerator, MicroAnimations };