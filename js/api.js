// js/api.js - API integration for VibeMe Enhanced

// showFeedback will be available globally
import { CONFIG } from './config.js';

/**
 * API service for fetching quotes from external sources
 */
export class QuoteAPI {
    constructor() {
        this.baseURL = 'https://api.quotable.io';
        this.fallbackQuotes = [
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
            { text: "Stay hungry, stay foolish.", author: "Steve Jobs" }
        ];
    }

    /**
     * Fetch a random quote from the API
     * @returns {Promise<Object>} Quote object with text and author
     */
    async fetchRandomQuote() {
        try {
            const response = await fetch(`${this.baseURL}/random`, {
                timeout: CONFIG.API_TIMEOUT || 5000
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                text: data.content,
                author: data.author,
                tags: data.tags || []
            };
        } catch (error) {
            console.warn('API fetch failed, using fallback:', error.message);
            return this.getFallbackQuote();
        }
    }

    /**
     * Fetch quotes by category
     * @param {string} category - Quote category
     * @returns {Promise<Array>} Array of quote objects
     */
    async fetchQuotesByCategory(category) {
        try {
            const response = await fetch(`${this.baseURL}/quotes?tags=${category}&limit=10`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            return data.results.map(quote => ({
                text: quote.content,
                author: quote.author,
                tags: quote.tags || []
            }));
        } catch (error) {
            console.warn('Category fetch failed:', error.message);
            return [this.getFallbackQuote()];
        }
    }

    /**
     * Get a random fallback quote
     * @returns {Object} Fallback quote object
     */
    getFallbackQuote() {
        const randomIndex = Math.floor(Math.random() * this.fallbackQuotes.length);
        return {
            ...this.fallbackQuotes[randomIndex],
            tags: ['motivation']
        };
    }

    /**
     * Validate quote object
     * @param {Object} quote - Quote to validate
     * @returns {boolean} Whether quote is valid
     */
    validateQuote(quote) {
        return quote && 
               typeof quote.text === 'string' && 
               quote.text.length > 0 &&
               typeof quote.author === 'string' && 
               quote.author.length > 0;
    }
}

// Singleton instance
export const quoteAPI = new QuoteAPI();