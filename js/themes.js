// js/themes.js

const colorPalettes = {
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
    famous_quotes: [
        {color1: "#546E7A", color2: "#78909C", color3: "#90A4AE"},
        {color1: "#757575", color2: "#BDBDBD", color3: "#E0E0E0"}
    ],
    wisdom: [
        {color1: "#37474F", color2: "#455A64", color3: "#546E7A"},
        {color1: "#4E342E", color2: "#5D4037", color3: "#6D4C41"}
    ],
    // Default fallbacks
    default: [
        {color1: "#aaaaaa", color2: "#bbbbbb", color3: "#cccccc"}
    ],
    favorites_empty: [
        {color1: "#9E9E9E", color2: "#BDBDBD", color3: "#E0E0E0"}
    ],
    empty: [
        {color1: "#78909C", color2: "#90A4AE", color3: "#B0BEC5"}
    ]
};

const fontThemes = {
    default: { 
        quote: "'Playfair Display', serif", 
        heading: "'Poppins', sans-serif", 
        author: "'Poppins', sans-serif" 
    },
    love: { 
        quote: "'Dancing Script', cursive", 
        heading: "'Poppins', sans-serif", 
        author: "'Poppins', sans-serif" 
    },
    perseverance: { 
        quote: "'Oswald', sans-serif", 
        heading: "'Montserrat', sans-serif", 
        author: "'Montserrat', sans-serif" 
    },
    originality: { 
        quote: "'Roboto Mono', monospace", 
        heading: "'Poppins', sans-serif", 
        author: "'Roboto Mono', monospace" 
    },
    change: { 
        quote: "'Montserrat', sans-serif", 
        heading: "'Poppins', sans-serif", 
        author: "'Lato', sans-serif" 
    },
    inner_strength: { 
        quote: "'Merriweather', serif", 
        heading: "'Roboto Slab', serif", 
        author: "'Source Sans Pro', sans-serif" 
    },
    famous_quotes: { 
        quote: "'Playfair Display', serif", 
        heading: "'Merriweather', serif", 
        author: "'Roboto Slab', serif" 
    },
    wisdom: { 
        quote: "'Merriweather', serif", 
        heading: "'Playfair Display', serif", 
        author: "'Roboto Slab', serif" 
    },
    favorites_empty: { 
        quote: "'Poppins', sans-serif", 
        heading: "'Poppins', sans-serif", 
        author: "'Poppins', sans-serif" 
    },
    empty: { 
        quote: "'Poppins', sans-serif", 
        heading: "'Poppins', sans-serif", 
        author: "'Poppins', sans-serif" 
    }
};

// Utility functions for color manipulation
function normalizeHex(color) {
    if (typeof color !== 'string') return '#cccccc';
    if (color.startsWith('#')) return color;
    if (color.startsWith('rgb(')) {
        const rgb = color.match(/\d+/g);
        if (rgb && rgb.length === 3) {
            return `#${((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1)}`;
        }
    }
    return '#cccccc';
}

function lightenColorToRgba(color, percent, alpha = 1.0) {
    try {
        let hex = normalizeHex(color);
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        
        r = Math.min(255, r + Math.round(percent / 100 * (255 - r)));
        g = Math.min(255, g + Math.round(percent / 100 * (255 - g)));
        b = Math.min(255, b + Math.round(percent / 100 * (255 - b)));
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) { 
        console.error('Error lightening color:', e);
        return `rgba(255, 255, 255, ${alpha})`; 
    }
}

function darkenColor(color, percent) {
    try {
        let hex = normalizeHex(color);
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        
        r = Math.max(0, r - Math.round(percent / 100 * r));
        g = Math.max(0, g - Math.round(percent / 100 * g));
        b = Math.max(0, b - Math.round(percent / 100 * b));
        
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } catch (e) { 
        console.error('Error darkening color:', e);
        return '#333333'; 
    }
}

function getThemeColors(category) {
    try {
        const safeCategory = category && colorPalettes[category] ? category : 'default';
        const palettes = colorPalettes[safeCategory];
        
        if (!palettes || palettes.length === 0) {
            console.warn(`No palettes found for category: ${category}, using default`);
            return colorPalettes.default[0];
        }
        
        return palettes[Math.floor(Math.random() * palettes.length)];
    } catch (error) {
        console.error('Error getting theme colors:', error);
        return colorPalettes.default[0];
    }
}

function getThemeFonts(category) {
    try {
        const safeCategory = category && fontThemes[category] ? category : 'default';
        return fontThemes[safeCategory] || fontThemes.default;
    } catch (error) {
        console.error('Error getting theme fonts:', error);
        return fontThemes.default;
    }
}

function applyThemeStyles(category, rootStyle) {
    try {
        if (!rootStyle) {
            console.error('Root style element not provided');
            return false;
        }

        const fonts = getThemeFonts(category);
        const currentThemeColors = getThemeColors(category);
        
        // Calculate derived colors
        const baseBgColor = currentThemeColors.color3 || '#cccccc';
        const containerBgColor = lightenColorToRgba(baseBgColor, 85, 1.0);
        const innerBoxColor = lightenColorToRgba(baseBgColor, 90, 0.15);
        const baseTextColor = currentThemeColors.color1 || '#aaaaaa';
        const textColorMain = darkenColor(baseTextColor, 60);
        const textColorSecondary = darkenColor(baseTextColor, 40);
        const socialIconBg = darkenColor(baseTextColor, 20);
        
        // Apply CSS custom properties
        rootStyle.setProperty('--color1', currentThemeColors.color1);
        rootStyle.setProperty('--color2', currentThemeColors.color2);
        rootStyle.setProperty('--color3', currentThemeColors.color3);
        rootStyle.setProperty('--container-bg-color', containerBgColor);
        rootStyle.setProperty('--inner-box-color', innerBoxColor);
        rootStyle.setProperty('--text-color-main', textColorMain);
        rootStyle.setProperty('--text-color-secondary', textColorSecondary);
        rootStyle.setProperty('--social-icon-bg', socialIconBg);
        rootStyle.setProperty('--font-quote', fonts.quote);
        rootStyle.setProperty('--font-heading', fonts.heading);
        rootStyle.setProperty('--font-author', fonts.author);
        
        return currentThemeColors;
    } catch (error) {
        console.error('Error applying theme styles:', error);
        return false;
    }
}

export { 
    colorPalettes, 
    fontThemes, 
    normalizeHex, 
    lightenColorToRgba, 
    darkenColor, 
    getThemeColors, 
    getThemeFonts, 
    applyThemeStyles 
};