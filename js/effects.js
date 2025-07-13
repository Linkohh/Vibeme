const patterns = [
    "polka-dots", "zigzag", "waves", "crosses", "bubbles",
    "squares", "triangles", "lines"
];

const binaryMessages = [
    "01001100 01101111 01110110 01100101", "01001000 01101111 01110000 01100101", "01001010 01101111 01111001",
    "01001011 01101001 01101110 01100100 01101110 01100101 01110011 01110011", "01000011 01101111 01110101 01110010 01100001 01100111 01100101",
    "01010000 01100101 01100001 01100011 01100101", "01001000 01100001 01110000 01110000 01101001 01101110 01100101 01110011 01110011",
    "01000110 01110010 01101001 01100101 01101110 01100100 01110011 01101000 01101001 01110000", "01000010 01100101 01101100 01101001 01100101 01110110 01100101",
    "01000100 01110010 01100101 01100001 01101101", "01001001 01101110 01110011 01110000 01101001 01110010 01100101", "01000011 01110010 01100101 01100001 01110100 01100101",
    "01001000 01100101 01100001 01101100", "01000111 01110010 01101111 01110111", "01001100 01101001 01100111 01101000 01110100",
    "01010100 01110010 01110101 01110011 01110100", "01000110 01100001 01101001 01110100 01101000", "01010000 01100001 01110011 01110011 01101001 01101111 01101110",
    "01010111 01101001 01110011 01100100 01101111 01101101", "01000010 01100101 01100001 01110101 01110100 01111001"
];

function createMatrixEffect() {
    if (!matrixBg || !visualEffectsEnabled) return;
    const columnCount = Math.floor(window.innerWidth / CONFIG.MATRIX_COLUMN_WIDTH);
    const neededColumns = columnCount - activeColumns.length;
    if (neededColumns > 0) {
        for (let i = 0; i < neededColumns; i++) createMatrixColumn();
    } else if (neededColumns < 0) {
        const columnsToRemove = Math.abs(neededColumns);
        for (let i = 0; i < columnsToRemove && activeColumns.length > 0; i++) {
            const column = activeColumns.pop();
            if (column) {
                column.classList.remove('visible');
                setTimeout(() => { if (column.parentNode === matrixBg) matrixBg.removeChild(column); }, 500);
            }
        }
    }
}

function createMatrixColumn() {
    if (!matrixBg || !visualEffectsEnabled) return;
    const column = document.createElement('div');
    column.className = 'binary-column';
    column.style.left = `${Math.random() * 100}%`;
    const duration = 5 + Math.random() * 10;
    column.style.animationDuration = `${duration}s`;
    column.style.animationDelay = `${Math.random() * 5}s`;
    if (Math.random() > 0.7) column.classList.add('fast');
    else if (Math.random() < 0.3) column.classList.add('slow');
    let binaryContent = '';
    if (Math.random() < CONFIG.MATRIX_MESSAGE_CHANCE && binaryMessages.length > 0) {
        const message = binaryMessages[Math.floor(Math.random() * binaryMessages.length)];
        message.split(' ').forEach(part => { binaryContent += Math.random() > 0.8 ? `<span class="highlight">${part}</span> ` : `${part} `; });
    } else {
        const length = 10 + Math.floor(Math.random() * 40);
        for (let j = 0; j < length; j++) {
            const char = Math.random() > 0.5 ? '1' : '0';
            binaryContent += Math.random() > 0.95 ? `<span class="highlight">${char}</span>` : char;
            if (j > 0 && (j + 1) % 8 === 0 && Math.random() > 0.5) binaryContent += ' ';
        }
    }
    column.innerHTML = binaryContent.trim();
    matrixBg.appendChild(column);
    activeColumns.push(column);
    requestAnimationFrame(() => { setTimeout(() => { column.classList.add('visible'); }, 10); });
    column.addEventListener('animationend', () => {
        if (column.parentNode === matrixBg) matrixBg.removeChild(column);
        activeColumns = activeColumns.filter(c => c !== column);
    });
}

function updateMatrixColumns() {
    if (!matrixBg || !visualEffectsEnabled) {
        activeColumns.forEach(col => { if (col.parentNode) col.parentNode.removeChild(col); });
        activeColumns = []; return;
    }
    const targetColumnCount = Math.floor(window.innerWidth / CONFIG.MATRIX_COLUMN_WIDTH);
    if (activeColumns.length < targetColumnCount) {
        const columnsToAdd = Math.min(5, targetColumnCount - activeColumns.length);
        for (let i = 0; i < columnsToAdd; i++) createMatrixColumn();
    }
}

function animateMouseGlowColor() {
    if (!visualEffectsEnabled || !mouseGlowElement) {
        if (glowAnimationId) { cancelAnimationFrame(glowAnimationId); glowAnimationId = null; }
        return;
    }
    const profile = glowColorProfiles[currentGlowProfileIndex];
    glowHue = (glowHue + profile.speed) % 360;
    mouseGlowElement.style.setProperty('--glow-hue', glowHue.toFixed(2));
    glowAnimationId = requestAnimationFrame(animateMouseGlowColor);
}

function changeGlowProfile() {
    if (!visualEffectsEnabled || !mouseGlowElement) return;
    currentGlowProfileIndex = (currentGlowProfileIndex + 1) % glowColorProfiles.length;
    const newProfile = glowColorProfiles[currentGlowProfileIndex];
    mouseGlowElement.style.setProperty('--glow-saturation', newProfile.saturation + '%');
    mouseGlowElement.style.setProperty('--glow-lightness', newProfile.lightness + '%');
}

function setupMouseGlow() {
    if (!mouseGlowElement) return;
    document.addEventListener('mousemove', (e) => {
        if (!visualEffectsEnabled || !mouseGlowElement) return;
        window.requestAnimationFrame(() => {
            mouseGlowElement.style.left = `${e.clientX}px`;
            mouseGlowElement.style.top = `${e.clientY}px`;
            mouseGlowElement.style.opacity = '0.9';
        });
    });
    document.addEventListener('mouseover', () => { if (visualEffectsEnabled && mouseGlowElement) mouseGlowElement.style.opacity = '0.9'; });
    document.addEventListener('mouseout', () => { if (mouseGlowElement) mouseGlowElement.style.opacity = '0'; });
    const interactiveElements = document.querySelectorAll('a, button, .social-bubble, .quote-container-inner, .quote-container-outer');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => { if (visualEffectsEnabled && mouseGlowElement) mouseGlowElement.classList.add('hover-effect'); });
        el.addEventListener('mouseleave', () => { if (mouseGlowElement) mouseGlowElement.classList.remove('hover-effect'); });
    });
}

function toggleVisualEffects(enable) {
    visualEffectsEnabled = enable;
    document.body.classList.toggle('effects-disabled', !enable);
    if (enable) {
        if (mouseGlowElement) {
            const initialProfile = glowColorProfiles[currentGlowProfileIndex];
            mouseGlowElement.style.setProperty('--glow-saturation', initialProfile.saturation + '%');
            mouseGlowElement.style.setProperty('--glow-lightness', initialProfile.lightness + '%');
        }
        if (!glowAnimationId && mouseGlowElement) animateMouseGlowColor();
        if (!glowProfileChangeInterval && mouseGlowElement) glowProfileChangeInterval = setInterval(changeGlowProfile, 7000);
        if (matrixBg) { createMatrixEffect(); if (!matrixInterval) matrixInterval = setInterval(updateMatrixColumns, CONFIG.MATRIX_UPDATE_INTERVAL); }
    } else {
        if (mouseGlowElement) mouseGlowElement.style.opacity = '0';
        if (glowAnimationId) { cancelAnimationFrame(glowAnimationId); glowAnimationId = null; }
        if (glowProfileChangeInterval) { clearInterval(glowProfileChangeInterval); glowProfileChangeInterval = null; }
        if (matrixBg) { clearInterval(matrixInterval); matrixInterval = null; updateMatrixColumns(); }
    }
}
