// js/gamification.js - Gamification Features for VibeMe

import { AppState } from './state.js';
// showFeedback will be called via global UI object
import { audioSystem, hapticFeedback } from './audio.js';
// Simple date formatter
const formatDate = (date) => new Date(date).toLocaleDateString();

/**
 * Gamification system with streaks, achievements, and user engagement
 */
export class GamificationSystem {
    constructor() {
        this.achievements = [
            { id: 'first_quote', name: 'First Inspiration', description: 'Generated your first quote', icon: '🌟', unlocked: false },
            { id: 'daily_reader', name: 'Daily Reader', description: 'Read quotes for 3 consecutive days', icon: '📖', unlocked: false },
            { id: 'quote_collector', name: 'Quote Collector', description: 'Favorited 10 quotes', icon: '❤️', unlocked: false },
            { id: 'week_warrior', name: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '🏆', unlocked: false },
            { id: 'inspiration_seeker', name: 'Inspiration Seeker', description: 'Generated 50 quotes', icon: '🔥', unlocked: false },
            { id: 'wisdom_keeper', name: 'Wisdom Keeper', description: 'Favorited 25 quotes', icon: '📚', unlocked: false },
            { id: 'motivation_master', name: 'Motivation Master', description: 'Maintained a 30-day streak', icon: '👑', unlocked: false }
        ];

        this.stats = {
            quotesGenerated: 0,
            favoriteCount: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastVisit: null,
            totalVisits: 0,
            achievements: []
        };

        this.loadStats();
    }

    /**
     * Load stats from localStorage
     */
    loadStats() {
        const saved = localStorage.getItem('vibeme_stats');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.stats = { ...this.stats, ...parsed };
                
                // Update achievements unlock status
                this.achievements.forEach(achievement => {
                    achievement.unlocked = this.stats.achievements.includes(achievement.id);
                });
            } catch (error) {
                console.warn('Failed to load stats:', error);
            }
        }
    }

    /**
     * Save stats to localStorage
     */
    saveStats() {
        try {
            localStorage.setItem('vibeme_stats', JSON.stringify(this.stats));
        } catch (error) {
            console.warn('Failed to save stats:', error);
        }
    }

    /**
     * Track daily visit and update streak
     */
    trackDailyVisit() {
        const today = new Date().toDateString();
        const lastVisit = this.stats.lastVisit;

        this.stats.totalVisits++;

        if (lastVisit) {
            const lastVisitDate = new Date(lastVisit);
            const todayDate = new Date(today);
            const daysDiff = Math.floor((todayDate - lastVisitDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
                // Consecutive day
                this.stats.currentStreak++;
                this.showStreakMessage();
            } else if (daysDiff > 1) {
                // Streak broken
                this.stats.currentStreak = 1;
            }
            // Same day visit doesn't change streak
        } else {
            // First visit ever
            this.stats.currentStreak = 1;
        }

        this.stats.lastVisit = today;
        this.stats.longestStreak = Math.max(this.stats.longestStreak, this.stats.currentStreak);

        this.checkAchievements();
        this.saveStats();
        this.updateUI();
    }

    /**
     * Track quote generation
     */
    trackQuoteGenerated() {
        this.stats.quotesGenerated++;
        
        // Check for first quote achievement
        if (this.stats.quotesGenerated === 1) {
            this.unlockAchievement('first_quote');
        }
        
        // Check for milestone achievements
        if (this.stats.quotesGenerated === 50) {
            this.unlockAchievement('inspiration_seeker');
        }

        this.saveStats();
        this.updateUI();
    }

    /**
     * Track favorite addition
     */
    trackFavoriteAdded() {
        this.stats.favoriteCount++;
        
        if (this.stats.favoriteCount === 10) {
            this.unlockAchievement('quote_collector');
        }
        
        if (this.stats.favoriteCount === 25) {
            this.unlockAchievement('wisdom_keeper');
        }

        this.saveStats();
        this.updateUI();
    }

    /**
     * Check and unlock achievements
     */
    checkAchievements() {
        // Daily reader - 3 consecutive days
        if (this.stats.currentStreak >= 3 && !this.isAchievementUnlocked('daily_reader')) {
            this.unlockAchievement('daily_reader');
        }

        // Week warrior - 7 consecutive days
        if (this.stats.currentStreak >= 7 && !this.isAchievementUnlocked('week_warrior')) {
            this.unlockAchievement('week_warrior');
        }

        // Motivation master - 30 consecutive days
        if (this.stats.currentStreak >= 30 && !this.isAchievementUnlocked('motivation_master')) {
            this.unlockAchievement('motivation_master');
        }
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(achievementId) {
        if (this.stats.achievements.includes(achievementId)) {
            return; // Already unlocked
        }

        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement) {
            achievement.unlocked = true;
            this.stats.achievements.push(achievementId);
            this.showAchievementUnlocked(achievement);
            this.saveStats();
        }
    }

    /**
     * Check if achievement is unlocked
     */
    isAchievementUnlocked(achievementId) {
        return this.stats.achievements.includes(achievementId);
    }

    /**
     * Show streak message
     */
    showStreakMessage() {
        const messages = [
            `🔥 ${this.stats.currentStreak} day streak! Keep it up!`,
            `🌟 Amazing! ${this.stats.currentStreak} days of inspiration!`,
            `💪 You're on fire! ${this.stats.currentStreak} consecutive days!`,
            `✨ Incredible streak: ${this.stats.currentStreak} days strong!`
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        // Use browser notification or console log
        console.log('🔥 Streak:', message);
        if (window.VibeUI && window.VibeUI.showFeedback) {
            window.VibeUI.showFeedback(message);
        }
    }

    /**
     * Show achievement unlocked notification
     */
    showAchievementUnlocked(achievement) {
        // Play achievement sound and haptic feedback
        audioSystem.playAchievement();
        hapticFeedback.strong();
        
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">Achievement Unlocked!</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Add styles if not already added
        this.addAchievementStyles();

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }

    /**
     * Add achievement notification styles
     */
    addAchievementStyles() {
        if (document.getElementById('achievement-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'achievement-styles';
        styles.textContent = `
            .achievement-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px;
                padding: 16px;
                max-width: 300px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                transform: translateX(100%);
                transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                z-index: 10000;
            }

            .achievement-notification.show {
                transform: translateX(0);
            }

            .achievement-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .achievement-icon {
                font-size: 2rem;
                flex-shrink: 0;
            }

            .achievement-title {
                font-weight: bold;
                font-size: 0.9rem;
                margin-bottom: 4px;
            }

            .achievement-name {
                font-weight: 600;
                font-size: 1rem;
                margin-bottom: 2px;
            }

            .achievement-description {
                font-size: 0.8rem;
                opacity: 0.9;
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Update UI elements with stats
     */
    updateUI() {
        // Update streak display if element exists
        const streakElement = document.getElementById('streak-display');
        if (streakElement) {
            streakElement.textContent = `${this.stats.currentStreak} day streak`;
        }

        // Update stats in settings panel
        this.updateStatsPanel();
    }

    /**
     * Update stats panel in settings
     */
    updateStatsPanel() {
        const settingsPanel = document.getElementById('settings-panel');
        if (!settingsPanel) return;

        let statsSection = document.getElementById('stats-section');
        if (!statsSection) {
            statsSection = document.createElement('div');
            statsSection.id = 'stats-section';
            statsSection.className = 'mt-4 pt-4 border-t border-gray-600';
            
            const title = document.createElement('h3');
            title.textContent = 'Your Progress';
            title.className = 'text-sm font-semibold mb-2';
            statsSection.appendChild(title);

            settingsPanel.appendChild(statsSection);
        }

        statsSection.innerHTML = `
            <h3 class="text-sm font-semibold mb-2">Your Progress</h3>
            <div class="text-xs space-y-1">
                <div>🔥 Current Streak: ${this.stats.currentStreak} days</div>
                <div>🏆 Longest Streak: ${this.stats.longestStreak} days</div>
                <div>💭 Quotes Generated: ${this.stats.quotesGenerated}</div>
                <div>❤️ Favorites: ${this.stats.favoriteCount}</div>
                <div>🏅 Achievements: ${this.stats.achievements.length}/${this.achievements.length}</div>
            </div>
        `;
    }

    /**
     * Get user level based on stats
     */
    getUserLevel() {
        const totalPoints = this.stats.quotesGenerated + (this.stats.favoriteCount * 2) + (this.stats.currentStreak * 5);
        
        if (totalPoints < 10) return { level: 1, title: 'Novice' };
        if (totalPoints < 25) return { level: 2, title: 'Seeker' };
        if (totalPoints < 50) return { level: 3, title: 'Inspired' };
        if (totalPoints < 100) return { level: 4, title: 'Motivator' };
        if (totalPoints < 200) return { level: 5, title: 'Sage' };
        return { level: 6, title: 'Master' };
    }
}

// Export singleton instance
export const gamification = new GamificationSystem();