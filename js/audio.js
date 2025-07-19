// js/audio.js - Audio Effects and Sound System for VibeMe

/**
 * Audio system for VibeMe with Web Audio API and audio feedback
 */
export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3;
        this.soundCache = new Map();
        
        this.initializeAudioContext();
    }

    /**
     * Initialize Web Audio API context
     */
    async initializeAudioContext() {
        try {
            // Check if running in browser environment
            if (typeof window === 'undefined') {
                console.log('Audio disabled - not in browser environment');
                return;
            }
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume context on user interaction (required by browsers)
            if (typeof document !== 'undefined') {
                const resumeAudio = () => {
                    if (this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                    document.removeEventListener('click', resumeAudio);
                    document.removeEventListener('touchstart', resumeAudio);
                };
                
                document.addEventListener('click', resumeAudio);
                document.addEventListener('touchstart', resumeAudio);
            }
            
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }

    /**
     * Create and play a tone
     */
    playTone(frequency, duration = 200, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            // Smooth fade in/out to prevent clicks
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn('Failed to play tone:', error);
        }
    }

    /**
     * Play success sound (ascending notes)
     */
    playSuccess() {
        if (!this.enabled) return;
        
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 150, 'sine');
            }, index * 100);
        });
    }

    /**
     * Play button click sound
     */
    playClick() {
        if (!this.enabled) return;
        this.playTone(800, 50, 'square');
    }

    /**
     * Play favorite/like sound
     */
    playFavorite() {
        if (!this.enabled) return;
        
        // Warm, pleasant chord
        const frequencies = [440, 554.37, 659.25]; // A4, C#5, E5
        frequencies.forEach(freq => {
            this.playTone(freq, 300, 'sine');
        });
    }

    /**
     * Play achievement unlock sound
     */
    playAchievement() {
        if (!this.enabled) return;
        
        // Triumphant sequence
        const sequence = [
            { freq: 523.25, time: 0, duration: 200 },    // C5
            { freq: 659.25, time: 100, duration: 200 },  // E5
            { freq: 783.99, time: 200, duration: 200 },  // G5
            { freq: 1046.5, time: 300, duration: 400 }   // C6
        ];
        
        sequence.forEach(({ freq, time, duration }) => {
            setTimeout(() => {
                this.playTone(freq, duration, 'triangle');
            }, time);
        });
    }

    /**
     * Play notification sound
     */
    playNotification() {
        if (!this.enabled) return;
        
        this.playTone(880, 100, 'sine');
        setTimeout(() => {
            this.playTone(660, 100, 'sine');
        }, 120);
    }

    /**
     * Play ambient background tone (very subtle)
     */
    playAmbient() {
        if (!this.enabled) return;
        
        // Very quiet, low frequency ambient tone
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime); // A2
        oscillator.type = 'sine';
        
        // Very low volume for ambient effect
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 8);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 8);
    }

    /**
     * Set volume level
     */
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
    }

    /**
     * Enable/disable audio
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Get current settings
     */
    getSettings() {
        return {
            enabled: this.enabled,
            volume: this.volume,
            supported: !!this.audioContext
        };
    }
}

/**
 * Haptic feedback system for mobile devices
 */
export class HapticFeedback {
    constructor() {
        this.enabled = true;
        this.supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
    }

    /**
     * Light vibration for button presses
     */
    light() {
        if (this.enabled && this.supported) {
            navigator.vibrate(50);
        }
    }

    /**
     * Medium vibration for favorites
     */
    medium() {
        if (this.enabled && this.supported) {
            navigator.vibrate(100);
        }
    }

    /**
     * Strong vibration for achievements
     */
    strong() {
        if (this.enabled && this.supported) {
            navigator.vibrate([200, 100, 200]);
        }
    }

    /**
     * Success pattern
     */
    success() {
        if (this.enabled && this.supported) {
            navigator.vibrate([50, 50, 50, 50, 100]);
        }
    }

    /**
     * Enable/disable haptic feedback
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Check if haptic feedback is supported
     */
    isSupported() {
        return this.supported;
    }
}

// Export singleton instances
export const audioSystem = new AudioSystem();
export const hapticFeedback = new HapticFeedback();