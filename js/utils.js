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
    } catch (e) { return `rgba(255, 255, 255, ${alpha})`; }
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
    } catch (e) { return '#333333'; }
}
