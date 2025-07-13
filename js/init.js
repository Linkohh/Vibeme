async function loadData() {
    try {
        const quotesResponse = await fetch('data/quotes.json');
        const themesResponse = await fetch('data/themes.json');

        const quotesData = await quotesResponse.json();
        const themesData = await themesResponse.json();

        // Assuming the quotes array in quotes.js is named 'quotes'
        // and colorPalettes/fontThemes in themes.js are named as such.
        // If they are not global, this approach needs adjustment.
        Array.prototype.push.apply(quotes, quotesData);
        Object.assign(colorPalettes, themesData.colorPalettes);
        Object.assign(fontThemes, themesData.fontThemes);

    } catch (error) {
        console.error("Failed to load data:", error);
    }
}

function selectNextQuote() {
    let eligibleQuotes;
    if (activeCategory === 'All') {
        eligibleQuotes = quotes;
    } else {
        eligibleQuotes = quotes.filter(q => q.category === activeCategory);
    }

    if (eligibleQuotes.length === 0) {
        return { text: "No quotes found in this category.", author: "VibeMe", category: "category_empty" };
    }

    let randomIndex = Math.floor(Math.random() * eligibleQuotes.length);
    return eligibleQuotes[randomIndex];
}
function init() {
    // Assign DOM elements
    quoteTextEl = document.getElementById('quote-text');
    quoteAuthorEl = document.getElementById('quote-author');
    generateBtn = document.getElementById('generate-btn');
    countdownEl = document.getElementById('countdown');
    timerToggleBtn = document.getElementById('timer-toggle-btn');
    quotePatternEl = document.getElementById('quote-pattern');
    rootStyle = document.documentElement.style;
    mouseGlowElement = document.getElementById('mouse-glow');
    matrixBg = document.getElementById('matrix-bg');
    copyQuoteBtn = document.getElementById('copy-quote-btn');
    favoriteQuoteBtn = document.getElementById('favorite-quote-btn');
    copyFeedbackEl = document.getElementById('copy-feedback');
    settingsToggleEl = document.getElementById('settings-toggle');
    settingsPanelEl = document.getElementById('settings-panel');
    effectsToggleCheckboxEl = document.getElementById('effects-toggle-checkbox');
    clearFavoritesBtnEl = document.getElementById('clear-favorites-btn');
    addQuoteToggleBtnEl = document.getElementById('toggle-add-quote-form');
    addQuoteFormEl = document.getElementById('add-quote-form');
    newQuoteTextEl = document.getElementById('new-quote-text');
    newQuoteAuthorEl = document.getElementById('new-quote-author');
    submitQuoteBtnEl = document.getElementById('submit-quote-btn');
    const categoryFilterEl = document.getElementById('category-filter');

    // Add DOM references for Gemini features here if those features are used

    socialLinks = {
        twitter: document.getElementById('twitter-share'),
        facebook: document.getElementById('facebook-share'),
        linkedin: document.getElementById('linkedin-share'),
        whatsapp: document.getElementById('whatsapp-share'),
        pinterest: document.getElementById('pinterest-share')
    };

   let coreElementsMissing = !quoteTextEl || !quoteAuthorEl || !generateBtn || !countdownEl ||
                           !copyQuoteBtn || !favoriteQuoteBtn || !timerToggleBtn ||
                           !settingsToggleEl || !settingsPanelEl || !effectsToggleCheckboxEl || !clearFavoritesBtnEl ||
                           !addQuoteToggleBtnEl || !addQuoteFormEl || !newQuoteTextEl || !submitQuoteBtnEl;


    if (!mouseGlowElement) console.warn("Mouse glow element not found.");
    if (!matrixBg) console.warn("Matrix background element not found.");

    if (coreElementsMissing) {
        console.error("Init failed – one or more essential elements missing.");
        if(document.body) document.body.innerHTML = "<h1>Error: Could not initialize page. Essential elements missing.</h1>";
        return;
    }

    loadData().then(() => {
        loadFavorites();
        loadUserQuotes();
        activeCategory = 'All';
        currentQuote = selectNextQuote();

        if (!currentQuote || currentQuote.category === 'empty' || currentQuote.category === 'category_empty' || currentQuote.category === 'favorites_empty') {
            quoteTextEl.textContent = currentQuote ? currentQuote.text : "Failed to load quotes.";
            quoteAuthorEl.textContent = currentQuote ? (currentQuote.author || (currentQuote.category === "favorites_empty" || currentQuote.category === "category_empty" ? "" : "Anonymous")) : "";
            if (currentQuote) applyThemeStyles(currentQuote.category || 'values');
            if(countdownEl && countdownEl.parentElement) countdownEl.parentElement.style.display = 'none';
        } else {
            applyThemeStyles(currentQuote.category);
            quoteTextEl.textContent = currentQuote.text;
            quoteAuthorEl.textContent = currentQuote.author ? `— ${currentQuote.author}` : '— Anonymous';
            quoteTextEl.dataset.text = currentQuote.text;
            if (!isTimerPaused) resetTimer();
        }

        generatePattern();
        updateSocialLinks();
        updateFavoriteButtonUI();
        setupMouseGlow();
        setupEffectsToggle();
        setupCopyButton();
        setupTimerControls();
        setupFavoriteButton();
        setupClearFavoritesButton();
        setupAddQuoteForm();
        setupCategoryFilter();
    });

    if (!currentQuote || currentQuote.category === 'empty' || currentQuote.category === 'category_empty' || currentQuote.category === 'favorites_empty') {
        quoteTextEl.textContent = currentQuote ? currentQuote.text : "Failed to load quotes.";
        quoteAuthorEl.textContent = currentQuote ? (currentQuote.author || (currentQuote.category === "favorites_empty" || currentQuote.category === "category_empty" ? "" : "Anonymous")) : "";
        if (currentQuote) applyThemeStyles(currentQuote.category || 'values');
        if(countdownEl && countdownEl.parentElement) countdownEl.parentElement.style.display = 'none';
    } else {
        applyThemeStyles(currentQuote.category);
        quoteTextEl.textContent = currentQuote.text;
        quoteAuthorEl.textContent = currentQuote.author ? `— ${currentQuote.author}` : '— Anonymous';
        quoteTextEl.dataset.text = currentQuote.text;
        if (!isTimerPaused) resetTimer();
    }

    generatePattern();
    updateSocialLinks();
    updateFavoriteButtonUI();
    setupMouseGlow();
    setupEffectsToggle();
    setupCopyButton();
    setupTimerControls();
    setupFavoriteButton();
    setupClearFavoritesButton();
    setupAddQuoteForm();
    setupCategoryFilter();

    // Add event listeners for Gemini features here when implemented

    generateBtn.addEventListener('click', () => {
        // No need to hide explanation container as it's removed
        generateQuote();
    });

    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => { if(visualEffectsEnabled && matrixBg) createMatrixEffect(); }, 250);
    });
}
