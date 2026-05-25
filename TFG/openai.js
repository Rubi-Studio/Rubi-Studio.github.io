import { updateDebugPanel } from './ui.js';

const debugHistory = [];

export async function executeOpenAI(systemPrompt, payload, label = 'INTERACCIÓN', meta = {}) {
    // Nota: La API Key ahora se maneja en el servidor (/api/openai)
    // No se expone en el frontend
    
    const model = document.getElementById('modelSelect')?.value || 'gpt-4o-mini';

    console.log('📤 Enviando solicitud al backend (/api/openai) con modelo:', model);
    
    let response;
    try {
        response = await fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemPrompt, payload, model })
        });
    } catch (fetchError) {
        throw new Error(`Error de conexión de red: ${fetchError.message}`);
    }

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Respuesta de error del backend:', response.status, errorBody);
        throw new Error(`Error del backend (${response.status}): ${errorBody.substring(0, 100)}`);
    }

    let parsedData;
    try {
        parsedData = await response.json();
    } catch (jsonError) {
        throw new Error(`Error al parsear respuesta JSON: ${jsonError.message}`);
    }

    // Registrar en debug (sin exponer la API Key)
    const debugEntry = {
        label,
        time: new Date().toLocaleTimeString(),
        request: { systemPrompt, payload, model },
        response: parsedData,
        meta
    };
    debugHistory.unshift(debugEntry);
    updateDebugPanel(debugHistory);
    console.log('✓ Respuesta IA exitosa:', label, parsedData);
    return parsedData;
}
