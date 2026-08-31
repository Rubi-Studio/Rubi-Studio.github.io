import { etapasViaje, RANDOM_DATA } from './utils.js';

function getStorageNamespace() {
    return document.body?.dataset?.game === 'dragon' ? 'dragon' : 'hero';
}

const SAVE_INDEX_KEY = () => `${getStorageNamespace()}_save_index`;
const SAVE_KEY_PREFIX = () => `${getStorageNamespace()}_save_`;

function formatTimestamp(value) {
    const date = new Date(value);
    return date.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function downloadFile(filename, contents, mimeType) {
    const blob = new Blob([contents], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function getSavedGames() {
    const raw = localStorage.getItem(SAVE_INDEX_KEY());
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function persistSavedGames(list) {
    localStorage.setItem(SAVE_INDEX_KEY(), JSON.stringify(list));
}

function createSaveId() {
    return `save-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function checkApiKey() {
    const config = document.getElementById('apiConfig');
    if (localStorage.getItem('hero_api_key') && config) config.style.display = 'none';
    restoreModelSelection();
}

export function showApiConfig() {
    const d = document.getElementById('apiConfig');
    if (!d) return;
    d.style.display = d.style.display === 'none' ? 'flex' : 'none';
    document.getElementById('apiKey').value = localStorage.getItem('hero_api_key') || '';
    restoreModelSelection();
}

export function saveApiKey() {
    const k = document.getElementById('apiKey').value.trim();
    if (!k) return;
    localStorage.setItem('hero_api_key', k);
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        localStorage.setItem('hero_model', modelSelect.value);
    }
    const config = document.getElementById('apiConfig');
    if (config) config.style.display = 'none';
}

export function restoreModelSelection() {
    const modelSelect = document.getElementById('modelSelect');
    if (!modelSelect) return;
    const savedModel = localStorage.getItem('hero_model');
    if (savedModel && Array.from(modelSelect.options).some(option => option.value === savedModel)) {
        modelSelect.value = savedModel;
    }
    if (!modelSelect.dataset.modelListenerAttached) {
        modelSelect.addEventListener('change', () => {
            localStorage.setItem('hero_model', modelSelect.value);
        });
        modelSelect.dataset.modelListenerAttached = 'true';
    }
}

export function randomizeSetup() {
    const setup = document.getElementById('setupScreen');
    const data = setup ? RANDOM_DATA : null;
    if (!data) return;

    const setupName = document.getElementById('setupName');
    const setupOrigin = document.getElementById('setupOrigin');
    const setupFlaw = document.getElementById('setupFlaw');
    const setupCompetence = document.getElementById('setupCompetence');
    const setupCharacteristic = document.getElementById('setupCharacteristic');
    const setupSetting = document.getElementById('setupSetting');

    const names = Array.isArray(data.names) && data.names.length ? data.names : ['Azhul'];
    const origins = Array.isArray(data.origins) && data.origins.length ? data.origins : ['Hogar en la Montaña Crematoria'];
    const flaws = Array.isArray(data.flaws) && data.flaws.length ? data.flaws : ['Corrupción'];
    const settings = Array.isArray(data.settings) && data.settings.length ? data.settings : ['Torres encantadas, niebla y hechizos protectores.'];
    const competenceOptions = ['Conocimiento antiguo', 'Traductor', 'Afinidad mágica', 'Visión de las estrellas', 'Dominio de los relictos'];
    const characteristicOptions = ['Filántropo', 'Amable', 'Atento', 'Sereno', 'Generoso'];

    if (setupName) setupName.value = names[Math.floor(Math.random() * names.length)];
    if (setupOrigin) setupOrigin.value = origins[Math.floor(Math.random() * origins.length)];
    if (setupFlaw) setupFlaw.value = flaws[Math.floor(Math.random() * flaws.length)];
    if (setupCompetence) setupCompetence.value = competenceOptions[Math.floor(Math.random() * competenceOptions.length)];
    if (setupCharacteristic) setupCharacteristic.value = characteristicOptions[Math.floor(Math.random() * characteristicOptions.length)];
    if (setupSetting) setupSetting.value = settings[Math.floor(Math.random() * settings.length)];
}

export function showMenu() {
    const menu = document.getElementById('menuScreen');
    const setup = document.getElementById('setupScreen');
    const game = document.getElementById('gameScreen');
    if (menu) menu.classList.remove('hidden');
    if (setup) {
        setup.classList.add('hidden');
        setup.style.display = '';
    }
    if (game) {
        game.classList.add('hidden');
        game.style.display = '';
    }
    renderSaveList();
}

export function showSetupScreen() {
    const menu = document.getElementById('menuScreen');
    const setup = document.getElementById('setupScreen');
    const game = document.getElementById('gameScreen');
    if (menu) menu.classList.add('hidden');
    if (setup) {
        setup.classList.remove('hidden');
        setup.style.display = '';
    }
    if (game) {
        game.classList.add('hidden');
        game.style.display = '';
    }
}

export function showGameScreen() {
    const menu = document.getElementById('menuScreen');
    const setup = document.getElementById('setupScreen');
    const game = document.getElementById('gameScreen');
    if (menu) menu.classList.add('hidden');
    if (setup) {
        setup.classList.add('hidden');
        setup.style.display = '';
    }
    if (game) {
        game.classList.remove('hidden');
        game.style.display = '';
    }
}

export function saveGameState(gameState, title) {
    if (!gameState || !gameState.name) return null;
    const list = getSavedGames();
    let saveId = gameState.saveId || null;
    if (saveId) {
        const existing = loadSavedGame(saveId);
        if (!existing) saveId = null;
    }
    if (!saveId) saveId = createSaveId();
    const meta = {
        id: saveId,
        title: title || gameState.saveTitle || `Diario de ${gameState.name}`,
        updated: new Date().toISOString()
    };
    const record = { meta, gameState: { ...gameState, saveId } };
    localStorage.setItem(`${SAVE_KEY_PREFIX()}${saveId}`, JSON.stringify(record));
    persistSavedGames([meta, ...list.filter(item => item.id !== saveId)]);
    renderSaveList();
    return saveId;
}

export function deleteSavedGame(saveId) {
    const list = getSavedGames().filter(item => item.id !== saveId);
    localStorage.removeItem(`${SAVE_KEY_PREFIX()}${saveId}`);
    persistSavedGames(list);
    renderSaveList();
}

export function loadSavedGame(saveId) {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX()}${saveId}`);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function downloadSaveById(saveId, gameState = null) {
    const save = saveId ? loadSavedGame(saveId) : null;
    const current = save ? save : { meta: { title: gameState?.name ? `Diario de ${gameState.name}` : 'diario-guardado', updated: new Date().toISOString() }, gameState };
    if (!current || !current.gameState) {
        showPopup('No hay partida disponible para descargar.', 'warning', 'Descarga');
        return;
    }
    const fileName = `${current.meta.title.replace(/[^a-z0-9ñáéíóúü\- ]+/gi, '').replace(/\s+/g, '-')}-partida.json`;
    downloadFile(fileName, JSON.stringify(current, null, 2), 'application/json');
}

function buildDiaryText(state) {
    const entries = Array.isArray(state.diaryEntries) ? state.diaryEntries : [];
    return entries.map(entry => entry.text).filter(Boolean).join('\n\n');
}

export function downloadDiaryById(saveId, gameState = null) {
    const save = saveId ? loadSavedGame(saveId) : null;
    const current = save ? save.gameState : gameState;
    if (!current) {
        showPopup('No hay diario disponible para descargar.', 'warning', 'Descarga');
        return;
    }
    const fileName = `${(current.name || 'diario').replace(/[^a-z0-9ñáéíóúü\- ]+/gi, '').replace(/\s+/g, '-')}-diario.txt`;
    downloadFile(fileName, buildDiaryText(current), 'text/plain');
}

export function renderSaveList() {
    const saves = getSavedGames();
    const container = document.getElementById('saveList');
    if (!container) return;
    if (saves.length === 0) {
        container.innerHTML = `<div class="save-empty">No hay partidas guardadas todavía.</div>`;
        return;
    }
    container.innerHTML = saves.map(save => {
        return `<div class="save-item">
            <div>
                <strong>${save.title}</strong>
                <div class="save-meta">Guardado: ${formatTimestamp(save.updated)}</div>
            </div>
            <div class="save-actions">
                <button class="secondary-button" onclick="loadSave('${save.id}')">Cargar</button>
                <button class="secondary-button" onclick="downloadSave('${save.id}')">Descargar partida</button>
                <button class="secondary-button" onclick="downloadDiary('${save.id}')">Descargar diario</button>
                <button class="secondary-button" onclick="deleteSave('${save.id}')">Borrar</button>
            </div>
        </div>`;
    }).join('');
}

export function toggleRAG(gameState) {
    const rag = document.getElementById('ragPanel');
    if (!rag) return;
    rag.style.display = 'block';
    if (gameState) {
        renderCodex(gameState);
    }
}


export function toggleDebug() {
    const dbg = document.getElementById('debugPanel');
    if (!dbg) return;
    const computed = window.getComputedStyle(dbg);
    const isHidden = dbg.style.display === 'none' || computed.display === 'none';
    dbg.style.display = isHidden ? 'block' : 'none';
}

export function nextStage(gameState) {
    if (!gameState) return;
    if (gameState.stageIndex < etapasViaje.length - 1) gameState.stageIndex++;
    gameState.currentDifficulty = Math.floor(Math.random() * 10) + 1;
    renderCodex(gameState);
}

export function showInfoTutorial() {
    const message = `
        <strong class="help-highlight">Tutorial de ayuda</strong><br><br>
        <strong>1.</strong> Los iconos <strong>ⓘ</strong> abren explicaciones rápidas de cada bloque.<br>
        <strong>2.</strong> La <strong>Dificultad</strong> indica el número mínimo que debes superar con tus rasgos, estados y decisiones.<br>
        <strong>3.</strong> La <strong>Semilla</strong> es una inspiración, pero el sistema no busca una palabra exacta: valora si tu texto usa la idea o la noción correcta.<br>
        <strong>4.</strong> El <strong>Oráculo</strong> te resuelve una duda cuando no sabes por dónde continuar.<br>
        <strong>5.</strong> La <strong>Memoria</strong> guarda el lore y el resumen para que la IA mantenga coherencia.
    `;
    showPopup(message, 'info', 'Tutorial de ayuda');
}

export function showHelp(topic) {
    const helpTexts = {
        'tags': "Rasgos inherentes de tu personaje. Su nivel (1-5) suma a la tirada si los usas en la narración; bajan al usarlos y suben si los ignoras.",
        'estados': "Modificadores temporales (+1 o -1). Surgen tras cada turno y desaparecen cuando la IA te ha incluido en tu historia.",
        'semilla': "La semilla es una inspiración, no un bloqueo literal. El análisis se centra en la noción o la idea que usas en el texto, no en que aparezca una palabra exacta.",
        'semilla_juego': "Tu inspiración para este turno. Usa la idea que te sugiere, pero la IA evalúa si tu entrada encaja con la noción, no si repites una palabra exacta.",
        'etapa': "Las fases del Viaje del Héroe avanzan automáticamente según la duración elegida. Marcan el tono de la historia.",
        'dificultad': "Número a igualar o superar. Escribe tu entrada integrando Tags, Estados e Inventario para que la suma alcance este valor.",
        'habilidades': "Ataques especiales del dragón (Llamarada, Encantar, Volar) con recarga. La utilidad de cada habilidad vale 1-3 puntos según cómo la uses: 1 = marginal, 2 = moderado, 3 = impactante y narrativamente poderoso. La IA evalúa cada uso.",
        'inventario': "Objetos que encuentras en la aventura. Pueden sumar +1 a la dificultad y algunos se consumen o pierden con el uso.",
        'rag': "La memoria del sistema guarda lore y resumen para mantener coherencia. Puedes editarla para orientar la IA, pero no hace falta hacerlo para jugar.",
        'duracion': "Determina cuándo avanza la historia: Microrelato (saltos rápidos), Cuento (cada acción), Novela (cada 2 acciones).",
        'oraculo': "No afecta a la trama ni al sistema, pero cuando tengas que decidir y no estés seguro, el oráculo te ayudará. Responderá: No, No pero..., Si pero..., o Si."
    };

    if (!topic) {
        showInfoTutorial();
        return;
    }

    const label = topic === 'semilla' ? 'Semilla' : topic === 'dificultad' ? 'Dificultad' : topic === 'oraculo' ? 'Oráculo' : 'Ayuda';
    const content = helpTexts[topic] || 'Ayuda no disponible.';
    showPopup(`<strong class="help-highlight">${label}</strong><br><br>${content}`, 'info', 'Ayuda');
    playUiSound('info');
}

export function showPopup(message, type = 'info', title = 'Aviso') {
    const overlay = document.getElementById('popupOverlay');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    if (!overlay || !popupTitle || !popupMessage) return;
    popupTitle.innerText = title;
    popupMessage.innerHTML = typeof message === 'string' ? message.replace(/\n/g, '<br>') : message;
    overlay.className = `popup-overlay popup-${type}`;
    overlay.style.display = 'flex';
}

export function closePopup() {
    const overlay = document.getElementById('popupOverlay');
    if (overlay) overlay.style.display = 'none';
}

function createToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

const SOUND_PROFILES = {
    hover: { type: 'triangle', frequency: 520, duration: 0.06, volume: 0.025, sweep: 70 },
    button: { type: 'square', frequency: 660, duration: 0.08, volume: 0.035, sweep: 110 },
    start: { type: 'sawtooth', frequency: 820, duration: 0.12, volume: 0.05, sweep: 200 },
    submit: { type: 'sawtooth', frequency: 420, duration: 0.14, volume: 0.045, sweep: 160 },
    processed: { type: 'triangle', frequency: 780, duration: 0.18, volume: 0.04, sweep: 220 },
    warning: { type: 'sawtooth', frequency: 260, duration: 0.2, volume: 0.05, sweep: 140 },
    info: { type: 'triangle', frequency: 610, duration: 0.09, volume: 0.03, sweep: 90 }
};

export function playUiSound(kind = 'button') {
    const profile = SOUND_PROFILES[kind] || SOUND_PROFILES.button;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;

    if (!playUiSound.context) {
        playUiSound.context = new AudioCtor();
    }

    const ctx = playUiSound.context;
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = profile.type;
    oscillator.frequency.setValueAtTime(profile.frequency, now);
    oscillator.frequency.linearRampToValueAtTime(profile.frequency + profile.sweep, now + profile.duration);
    gainNode.gain.setValueAtTime(profile.volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + profile.duration);
}

export function registerUiSoundBindings() {
    const buttons = document.querySelectorAll('button, .icon-button, .secondary-button, .btn-start, .btn-send, .mini-button');
    buttons.forEach((button) => {
        if (button.dataset.soundBound === 'true') return;
        button.dataset.soundBound = 'true';
        if (button.id === 'debugToggleButton') return;
        button.addEventListener('pointerover', () => playUiSound('hover'), { passive: true });
        button.addEventListener('click', () => {
            playUiSound(button.classList.contains('btn-start') ? 'start' : 'button');
        });
    });

    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => playUiSound('submit'));
    }

    const helpIcons = document.querySelectorAll('.help-icon');
    helpIcons.forEach((icon) => {
        icon.addEventListener('click', () => playUiSound('info'));
    });

    const playerText = document.getElementById('playerText');
    if (playerText) {
        playerText.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                playUiSound('submit');
            }
        });
    }
}

export function showToast(message, type = 'info', duration = 2200) {
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(14px)';
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

export function notify(message, type = 'info') {
    showToast(message, type);
}

export function renderCodex(gameState) {
    if (!gameState) return;
    const tagsBox = document.getElementById('tagsDisplay');
    if (tagsBox) {
        tagsBox.innerHTML = '';
        gameState.tags.forEach(t => {
            tagsBox.innerHTML += `<div class="tag-box">${t.name} (LVL ${t.level})</div>`;
        });
    }

    const statusBox = document.getElementById('statusDisplay');
    if (statusBox) {
        statusBox.innerHTML = '';
        if (gameState.status.length === 0) {
            statusBox.innerHTML = `<span class="placeholder-text">Ninguno</span>`;
        }
        gameState.status.forEach(s => {
            const className = s.effect > 0 ? 'status-positive' : 'status-negative';
            statusBox.innerHTML += `<div class="status-box ${className}">${s.name} (${s.effect > 0 ? '+'+s.effect : s.effect})</div>`;
        });
    }

    const invBox = document.getElementById('abilitiesDisplay');
    if (invBox) {
        invBox.innerHTML = '';
        if (!Array.isArray(gameState.abilities) || gameState.abilities.length === 0) {
            invBox.innerHTML = `<span class="placeholder-text">Sin habilidades</span>`;
        } else {
            gameState.abilities.forEach((a, idx) => {
                const readyText = a.readyIn && a.readyIn > 0 ? `⧖ ${a.readyIn}` : '✓ Lista';
                invBox.innerHTML += `<div class="inv-item ability-item" title="Índice ${idx}">${a.name} ${readyText}</div>`;
            });
        }
    }

    const charBox = document.getElementById('charactersInMemory') || document.getElementById('charactersDisplay');
    if (charBox) {
        charBox.innerHTML = '';
        const characterNames = Object.keys(gameState.characters || {});
        if (characterNames.length === 0) {
            charBox.innerHTML = `<span class="placeholder-text">Sin personajes registrados</span>`;
        } else {
            characterNames.forEach(name => {
                const c = gameState.characters[name];
                charBox.innerHTML += `<div class="character-card">${name} — <strong>${c.role}</strong> (${c.trait || 'sin rasgo'})</div>`;
            });
        }
    }

    const placeBox = document.getElementById('placesInMemory');
    if (placeBox) {
        placeBox.innerHTML = '';
        if (gameState.places.length === 0) {
            placeBox.innerHTML = `<span class="placeholder-text">Sin lugares registrados</span>`;
        } else {
            gameState.places.forEach(place => {
                placeBox.innerHTML += `<div class="place-card">${place}</div>`;
            });
        }
    }

    const lore = document.getElementById('worldLore');
    if (lore) lore.innerText = gameState.lore;
    const plotSummary = document.getElementById('plotSummary');
    if (plotSummary) plotSummary.innerText = gameState.summary;
    const currentStage = document.getElementById('currentStageDisplay');
    if (currentStage) currentStage.innerText = `Etapa: ${etapasViaje[gameState.stageIndex]}`;
    const diffValue = document.getElementById('diffValue');
    if (diffValue) diffValue.innerText = gameState.currentDifficulty;
}

export function updateDebugPanel(debugHistory) {
    const dbgContainer = document.getElementById('debugPanel');
    if (!dbgContainer) return;
    if (!Array.isArray(debugHistory) || debugHistory.length === 0) {
        dbgContainer.innerHTML = `<strong>DEBUG</strong><p class="placeholder-text">No hay llamadas a la IA aún. Activa el modo debug y realiza una acción para ver la traza.</p>`;
        return;
    }
    dbgContainer.innerHTML = `<strong>HISTORIAL DE LLAMADAS A LA IA (Total: ${debugHistory.length})</strong><br><br>`;
    debugHistory.forEach((entry) => {
        dbgContainer.innerHTML += `<div class="debug-card">
            <div class="debug-card-header">
                <strong>${entry.label}</strong> <span class="debug-time">${entry.time}</span>
            </div>
            <details class="debug-details">
                <summary>Ver solicitud / respuesta</summary>
                <div class="debug-details-body">
                    <div class="debug-request">
                        <strong>Prompt / Solicitud</strong>
                        <pre>${JSON.stringify(entry.request, null, 2)}</pre>
                    </div>
                    <div class="debug-response">
                        <strong>Respuesta IA</strong>
                        <pre>${JSON.stringify(entry.response, null, 2)}</pre>
                    </div>
                </div>
            </details>
        </div>`;
    });
}
