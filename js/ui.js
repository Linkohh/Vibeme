function animateQuoteChange(newQuote) { // Removed isCustomVibe parameter
    if (isAnimating || !quoteTextEl || !quoteAuthorEl) return;
    isAnimating = true;

    quoteTextEl.classList.add('exit-active');
    quoteAuthorEl.classList.add('author-exit');

    setTimeout(() => {
        currentQuote = newQuote;
        quoteTextEl.textContent = currentQuote.text;
        quoteAuthorEl.textContent = currentQuote.author ? `— ${currentQuote.author}` : `— Anonymous`; // Simplified author
        applyThemeStyles(currentQuote.category || 'values');
        quoteTextEl.dataset.text = currentQuote.text;

        setTimeout(() => {
            quoteTextEl.classList.remove('exit-active');
            quoteAuthorEl.classList.remove('author-exit');
            quoteTextEl.classList.add('enter-active');
            quoteAuthorEl.classList.add('author-enter');
            if (visualEffectsEnabled) quoteTextEl.classList.add('glitch-effect');
        }, 50);

        setTimeout(() => {
            quoteTextEl.classList.remove('enter-active', 'glitch-effect');
            quoteAuthorEl.classList.remove('author-enter');
            isAnimating = false;
            updateSocialLinks();
            updateFavoriteButtonUI();
        }, 800);
    }, 600);
}

function generatePattern() {
    if (!quotePatternEl) return;
    const patternType = patterns[Math.floor(Math.random() * patterns.length)];
    let patternCSS = '';
    const patternColor = getRandomColor();
    switch(patternType) {
        case 'polka-dots': patternCSS = `radial-gradient(${patternColor} 2px, transparent 2px)`; break;
        case 'zigzag': patternCSS = `linear-gradient(135deg, ${patternColor} 25%, transparent 25%) -10px 0, linear-gradient(225deg, ${patternColor} 25%, transparent 25%) -10px 0, linear-gradient(315deg, ${patternColor} 25%, transparent 25%), linear-gradient(45deg, ${patternColor} 25%, transparent 25%)`; break;
        case 'waves': patternCSS = `radial-gradient(circle at 100% 50%, transparent 20%, ${patternColor} 21%, ${patternColor} 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, ${patternColor} 21%, ${patternColor} 34%, transparent 35%, transparent) 0 -20px`; break;
        case 'crosses': patternCSS = `linear-gradient(${patternColor} 1px, transparent 1px), linear-gradient(90deg, ${patternColor} 1px, transparent 1px)`; break;
        case 'bubbles': patternCSS = `radial-gradient(circle at center, ${patternColor} 0%, transparent 20%)`; break;
        case 'squares': patternCSS = `linear-gradient(45deg, ${patternColor} 25%, transparent 25%, transparent 75%, ${patternColor} 75%, ${patternColor}), linear-gradient(45deg, ${patternColor} 25%, transparent 25%, transparent 75%, ${patternColor} 75%, ${patternColor}) 10px 10px`; break;
        case 'triangles': patternCSS = `linear-gradient(45deg, ${patternColor} 50%, transparent 50%)`; break;
        case 'lines': patternCSS = `repeating-linear-gradient(45deg, ${patternColor}, ${patternColor} 1px, transparent 1px, transparent 6px)`; break;
        default: patternCSS = `radial-gradient(${patternColor} 2px, transparent 2px)`;
    }
    quotePatternEl.style.backgroundImage = patternCSS;
    quotePatternEl.style.backgroundSize = '20px 20px';
}

function getRandomColor() { const hue = Math.floor(Math.random() * 360); return `hsla(${hue}, 80%, 60%, 0.3)`; }

function updateSocialLinks() {
    if (!currentQuote || !socialLinks.twitter || currentQuote.category === 'favorites_empty' || currentQuote.category === 'category_empty' || currentQuote.category === 'empty') return;
    const textToShare = `"${currentQuote.text}" ${currentQuote.author ? `— ${currentQuote.author}` : '— Anonymous'}`; // Simplified
    const encodedText = encodeURIComponent(textToShare);
    const pageUrl = window.location.href;
    const encodedUrl = encodeURIComponent(pageUrl);
    socialLinks.twitter.href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    socialLinks.facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    socialLinks.linkedin.href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=Inspirational%20Quote&summary=${encodedText}`;
    socialLinks.whatsapp.href = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
    socialLinks.pinterest.href = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`;
}

function updateFavoriteButtonUI() {
    if (!favoriteQuoteBtn) return;
    const icon = favoriteQuoteBtn.querySelector('i');
    if (isQuoteFavorite(currentQuote) && currentQuote.category !== 'favorites_empty' && currentQuote.category !== 'category_empty' && currentQuote.category !== 'empty') {
        icon.classList.remove('far'); icon.classList.add('fas', 'text-pink-500'); favoriteQuoteBtn.title = "Remove from Favorites";
    } else {
        icon.classList.remove('fas', 'text-pink-500'); icon.classList.add('far'); favoriteQuoteBtn.title = "Add to Favorites";
    }
}
