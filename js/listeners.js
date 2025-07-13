function setupCopyButton() {
    if (!copyQuoteBtn) return;
    copyQuoteBtn.addEventListener('click', () => {
        if (!currentQuote || currentQuote.category === 'favorites_empty' || currentQuote.category === 'category_empty' || currentQuote.category === 'empty') return;
        const textToCopy = `"${currentQuote.text}" ${currentQuote.author ? `— ${currentQuote.author}` : '— Anonymous'}`; // Simplified
        navigator.clipboard.writeText(textToCopy).then(() => {
            if(copyFeedbackEl) copyFeedbackEl.textContent = "Copied to clipboard!";
            if(copyTimeout) clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => { if(copyFeedbackEl) copyFeedbackEl.textContent = ""; }, CONFIG.COPY_FEEDBACK_DURATION);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            if(copyFeedbackEl) copyFeedbackEl.textContent = "Copy failed.";
            if(copyTimeout) clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => { if(copyFeedbackEl) copyFeedbackEl.textContent = ""; }, CONFIG.COPY_FEEDBACK_DURATION);
        });
    });
}

function setupTimerControls() {
    if (!timerToggleBtn) return;
    timerToggleBtn.addEventListener('click', () => {
        isTimerPaused = !isTimerPaused;
        const icon = timerToggleBtn.querySelector('i');
        if (isTimerPaused) { clearInterval(timerInterval); icon.classList.remove('fa-pause'); icon.classList.add('fa-play'); timerToggleBtn.title = "Resume Timer"; }
        else { resetTimer(); icon.classList.remove('fa-play'); icon.classList.add('fa-pause'); timerToggleBtn.title = "Pause Timer"; }
    });
}

function setupEffectsToggle() {
    if (!effectsToggleCheckboxEl || !settingsToggleEl || !settingsPanelEl) return;
    settingsToggleEl.addEventListener('click', (e) => { e.stopPropagation(); settingsPanelEl.classList.toggle('hidden'); });
    document.addEventListener('click', (e) => {
        if (!settingsPanelEl.classList.contains('hidden') && !settingsPanelEl.contains(e.target) && e.target !== settingsToggleEl && !settingsToggleEl.contains(e.target)) {
            settingsPanelEl.classList.add('hidden');
        }
    });
    const storedEffectsPreference = localStorage.getItem('vibeMeEffectsEnabled');
    let initialEffectsEnabled = storedEffectsPreference !== null ? JSON.parse(storedEffectsPreference) : true;
    effectsToggleCheckboxEl.checked = initialEffectsEnabled;
    toggleVisualEffects(initialEffectsEnabled);
    effectsToggleCheckboxEl.addEventListener('change', (e) => {
        toggleVisualEffects(e.target.checked);
        localStorage.setItem('vibeMeEffectsEnabled', e.target.checked);
    });
}

function setupFavoriteButton() { if (!favoriteQuoteBtn) return; favoriteQuoteBtn.addEventListener('click', toggleFavoriteQuote); }

function setupClearFavoritesButton() {
    if(!clearFavoritesBtnEl) return;
    clearFavoritesBtnEl.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all your favorites? This cannot be undone.")) {
            favoriteQuotes = []; saveFavorites(); updateFavoriteButtonUI();
            if (activeCategory === 'Favorites') { activeCategory = 'All'; generateQuote(); }
            if(copyFeedbackEl) copyFeedbackEl.textContent = "Favorites cleared.";
            if(copyTimeout) clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => { if(copyFeedbackEl) copyFeedbackEl.textContent = ""; }, CONFIG.COPY_FEEDBACK_DURATION);
        }
    });
}

function setupAddQuoteForm() {
    if(!addQuoteToggleBtnEl || !addQuoteFormEl || !newQuoteTextEl || !submitQuoteBtnEl) return;
    addQuoteToggleBtnEl.addEventListener('click', (e) => { e.stopPropagation(); addQuoteFormEl.classList.toggle('hidden'); });
    submitQuoteBtnEl.addEventListener('click', (e) => {
        e.preventDefault();
        const text = newQuoteTextEl.value.trim();
        const author = newQuoteAuthorEl.value.trim();
        if(!text) { if(copyFeedbackEl){copyFeedbackEl.textContent = 'Enter a quote.'; if(copyTimeout) clearTimeout(copyTimeout); copyTimeout=setTimeout(()=>{if(copyFeedbackEl) copyFeedbackEl.textContent='';}, CONFIG.COPY_FEEDBACK_DURATION);} return; }
        const newQuote = { text, author, category: 'user' };
        quotes.push(newQuote);
        userQuotes.push(newQuote);
        saveUserQuotes();
        newQuoteTextEl.value = '';
        newQuoteAuthorEl.value = '';
        addQuoteFormEl.classList.add('hidden');
        if(copyFeedbackEl){copyFeedbackEl.textContent = 'Quote added!'; if(copyTimeout) clearTimeout(copyTimeout); copyTimeout = setTimeout(() => { if(copyFeedbackEl) copyFeedbackEl.textContent = ''; }, CONFIG.COPY_FEEDBACK_DURATION); }
    });
}

function generateQuote() {
    if (isAnimating) return;
    const newQuote = selectNextQuote();
    if (!newQuote) { quoteTextEl.textContent = "Error loading quote."; quoteAuthorEl.textContent = ""; return; }
    animateQuoteChange(newQuote);
    generatePattern();
    if (!isTimerPaused) resetTimer();
    else if (countdownEl) countdownEl.textContent = CONFIG.COUNTDOWN_DURATION;
}
