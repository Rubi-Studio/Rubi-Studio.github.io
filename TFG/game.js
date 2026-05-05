// --- 1. DATOS DEL SISTEMA ---
const RANDOM_DATA = {
    names: ["Kael, paladín", "Lyra, ladrona", "Grog, bardo", "Elowen, druida", "Valerius, erudito", "Mara, mercenaria", "Finn, explorador"],
    origins: ["Huérfano de guerra", "Noble caído", "Superviviente de plaga", "Desertor del ejército", "Hijo de pescadores", "Aprendiz de mago"],
    motivations: ["Redención", "Venganza", "Curiosidad", "Supervivencia", "Justicia", "Poder", "Honor"],
    flaws: ["Miedo a la oscuridad", "Codicia", "Arrogancia", "Cicatriz del pasado", "Impulsividad", "Desconfianza"],
    settings: ["Fantasía oscura en un reino nevado.", "Una ciudad flotante en decadencia.", "Un bosque donde los árboles susurran.", "Las ruinas de gigantes.", "Un desierto de cristal."]
};

const chispasArray = ["Agua","Fuego","Tierra","Aire","Hielo","Tormenta","Luz","Sombra","Eco","Silencio","Vacío","Ruido","Tiempo","Recuerdo","Olvido","Destino","Cambio","Eternidad","Deseo","Miedo","Amor","Culpa","Ira","Esperanza","Antiguo","Futuro","Ruina","Origen","Secreto","Fragmento","Sueño","Reflejo","Máscara","Umbral","Intrincado","Caída"];
const etapasViaje = [
    "1. Mundo Ordinario", "2. Llamada a la aventura", "3. Rechazo de la llamada", "4. Encuentro con el mentor", "5. Cruce del primer umbral", "6. Pruebas, aliados y enemigos", "7. Acercamiento a la caverna más profunda", "8. La odisea", "9. La recompensa", "10. El camino de regreso", "11. Resurrección", "12. Retorno con el elixir"
];
const negStatus = ["Herido", "Agotado", "Asustado", "Maldito", "Confundido"];

let gameState = {
    name: "",
    setting: "",
    seedLevel: "",
    stageIndex: 0,
    tags: [],
    status: [],
    currentDifficulty: 0
};

let conversationHistory = [];

// --- 2. UI HELPERS ---
function checkApiKey() {
    if (localStorage.getItem('hero_api_key')) document.getElementById('apiConfig').style.display = 'none';
}

function showApiConfig() {
    const configDiv = document.getElementById('apiConfig');
    configDiv.style.display = 'flex';
    document.getElementById('apiKey').value = localStorage.getItem('hero_api_key') || '';
}

function saveApiKey() {
    const key = document.getElementById('apiKey').value.trim();
    if (key) {
        localStorage.setItem('hero_api_key', key);
        document.getElementById('apiConfig').style.display = 'none';
        alert("¡Clave guardada correctamente! Ya puedes comenzar tu aventura.");
    } else {
        alert("Por favor, introduce una clave válida antes de guardar.");
    }
}

function randomizeSetup() {
    const data = RANDOM_DATA;
    document.getElementById('setupName').value = data.names[Math.floor(Math.random() * data.names.length)];
    document.getElementById('setupOrigin').value = data.origins[Math.floor(Math.random() * data.origins.length)];
    document.getElementById('setupMot').value = data.motivations[Math.floor(Math.random() * data.motivations.length)];
    document.getElementById('setupFlaw').value = data.flaws[Math.floor(Math.random() * data.flaws.length)];
    document.getElementById('setupSetting').value = data.settings[Math.floor(Math.random() * data.settings.length)];
    const seedSelect = document.getElementById('setupSeedLevel');
    seedSelect.selectedIndex = Math.floor(Math.random() * seedSelect.options.length);
}

function renderTags() {
    const tagsBox = document.getElementById('tagsDisplay');
    tagsBox.innerHTML = '';
    gameState.tags.forEach(t => {
        tagsBox.innerHTML += `<div class="tag-box">${t.name} <div class="tag-level">${t.level}</div></div>`;
    });

    const statusBox = document.getElementById('statusDisplay');
    statusBox.innerHTML = '';
    if (gameState.status.length === 0) {
        statusBox.innerHTML = `<span style="color:#999; font-size:0.9em;">Ninguno</span>`;
    } else {
        gameState.status.forEach(s => {
            statusBox.innerHTML += `<div class="status-box">${s.name} (${s.effect})</div>`;
        });
    }
    document.getElementById('currentStageDisplay').innerText = `Etapa: ${etapasViaje[gameState.stageIndex]}`;
    document.getElementById('diffValue').innerText = gameState.currentDifficulty;
}

function appendToDiary(text) {
    const diary = document.getElementById('diaryDisplay');
    diary.innerHTML += `\n\n${text}`;
    diary.scrollTop = diary.scrollHeight;
    document.getElementById('playerText').value = "";
}

function showHelp(type) {
    const helps = {
        tags: "Los Tags son tus habilidades y rasgos. Cuando escribes algo que los involucra, sumas su nivel a tu tirada.",
        states: "Los Estados son condiciones temporales (+1/-1 a tus tiradas)."
    };
    alert(helps[type] || "Ayuda no disponible.");
}

// --- 3. LÓGICA DE JUEGO ---
async function startGame() {
    const key = localStorage.getItem('hero_api_key');
    if(!key || key.trim() === "") { alert("Guarda la API Key primero."); return; }
    
    gameState.name = document.getElementById('setupName').value;
    gameState.setting = document.getElementById('setupSetting').value;
    gameState.seedLevel = document.getElementById('setupSeedLevel').value;
    gameState.currentDifficulty = Math.floor(Math.random() * 6) + 3;

    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
    
    setupAIEngine();
    try {
        document.getElementById('loading').style.display = 'block';
        await generateInitialSeed();
    } catch (error) {
        console.error("Error al iniciar:", error);
        alert("Hubo un problema al conectar con el Destino. Revisa la consola.");
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function setupAIEngine() {
    const systemPrompt = `ROL: Eres el motor narrativo de "El Diario del Héroe". 
Analiza el texto del jugador y genera una respuesta EXCLUSIVAMENTE en JSON.

REGLAS:
1. Solo detecta tags si el jugador los usa explícitamente.
2. Integra las 'chispas_obligatorias' de forma orgánica.
3. No repitas situaciones anteriores.
4. Sé breve y evocador.

JSON: { "tagsDetectados": [], "tagsIniciales": [], "semilla": "" }`;
    conversationHistory = [{ role: "system", content: systemPrompt }];
}

async function turnAI() {
    const textInput = document.getElementById('playerText').value.trim();
    if (!textInput) return;

    document.getElementById('loading').style.display = 'block';
    document.getElementById('sendBtn').disabled = true;

    const chispasTurno = [
        chispasArray[Math.floor(Math.random() * chispasArray.length)], 
        chispasArray[Math.floor(Math.random() * chispasArray.length)]
    ];
    
    const historialNarrativo = document.getElementById('diaryDisplay').innerText.split('\n\n').slice(-3);
    
    const payload = {
        texto_jugador: textInput,
        historial_reciente: historialNarrativo,
        estado_sistema: { ...gameState, chispas_obligatorias: chispasTurno }
    };

    try {
        const response = await callWithRetry(payload);
        appendToDiary(textInput);
        processTurnResult(response);
    } catch (error) {
        console.error(error);
        alert("El Destino está bloqueado. Tu entrada se ha mantenido en el recuadro para reintentar.");
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('sendBtn').disabled = false;
    }
}

async function callWithRetry(payload, maxAttempts = 3) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await callOpenAI(payload);
        } catch (err) {
            console.warn(`Intento ${i + 1} fallido. Reintentando...`);
            if (i === maxAttempts - 1) throw err;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

async function callOpenAI(payload) {
    const apiKey = localStorage.getItem('hero_api_key');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [conversationHistory[0], { role: "user", content: JSON.stringify(payload) }],
            response_format: { type: "json_object" },
            temperature: 0.7
        })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const data = await response.json();
    try {
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        throw new Error("Respuesta de IA no válida.");
    }
}

function processTurnResult(aiResponse) {
    if (!aiResponse) return;
    let totalScore = 0;
    let tagsUsed = [];

    const detected = Array.isArray(aiResponse.tagsDetectados) ? aiResponse.tagsDetectados : [];

    detected.forEach(name => {
        const tag = gameState.tags.find(t => t.name === name);
        if (tag) { totalScore += Number(tag.level); tagsUsed.push(name); }
    });

    gameState.status.forEach(s => totalScore += Number(s.effect));

    const isSuccess = totalScore >= gameState.currentDifficulty;
    updateGameStats(isSuccess, tagsUsed);

    renderTags();
    document.getElementById('aiResponsePanel').style.display = 'block';
    document.getElementById('evalText').innerText = `🎲 ${isSuccess ? 'Éxito' : 'Fallo'}: Dif ${gameState.currentDifficulty} vs Total ${totalScore}`;
    document.getElementById('seedText').innerText = aiResponse.semilla;
    
    gameState.currentDifficulty = Math.floor(Math.random() * 10) + 1;
}

function updateGameStats(isSuccess, tagsUsed) {
    if (isSuccess) {
        gameState.tags.forEach(t => { if (tagsUsed.includes(t.name)) t.level = Math.max(1, t.level - 1); });
        const negIndex = gameState.status.findIndex(s => s.effect < 0);
        if (negIndex !== -1) gameState.status.splice(negIndex, 1);
    } else {
        gameState.tags.forEach(t => { if (!tagsUsed.includes(t.name)) t.level = Math.min(5, t.level + 1); });
        if (gameState.status.filter(s => s.effect < 0).length < 3) {
            const randomNeg = negStatus[Math.floor(Math.random() * negStatus.length)];
            if (!gameState.status.some(s => s.name === randomNeg)) gameState.status.push({ name: randomNeg, effect: -1 });
        }
    }
}

async function generateInitialSeed() {
    const payload = {
        config_inicial: {
            origen: document.getElementById('setupOrigin').value,
            motivacion: document.getElementById('setupMot').value,
            defecto: document.getElementById('setupFlaw').value
        },
        estado_sistema: gameState
    };

    try {
        const aiResponse = await callWithRetry(payload);
        if (aiResponse.tagsIniciales) gameState.tags = aiResponse.tagsIniciales;
        renderTags();
        document.getElementById('aiResponsePanel').style.display = 'block';
        document.getElementById('evalText').innerText = `¡Comienza tu aventura, ${gameState.name}!`;
        document.getElementById('seedText').innerText = aiResponse.semilla;
    } catch (e) {
        document.getElementById('seedText').innerText = "Error inicial. Revisa la consola.";
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function nextStage() {
    if (gameState.stageIndex < etapasViaje.length - 1) gameState.stageIndex++;
    gameState.currentDifficulty = Math.floor(Math.random() * 10) + 1;
    renderTags();
}

document.addEventListener('DOMContentLoaded', () => { checkApiKey(); randomizeSetup(); });