import { updateDebugPanel } from './ui.js';

const debugHistory = [];

export async function executeOpenAI(systemPrompt, payload, label = 'INTERACCIÓN', meta = {}) {
    const apiKey = localStorage.getItem('hero_api_key');
    if (!apiKey) {
        throw new Error('API Key no guardada en localStorage. Ve a configuración.');
    }

    const model = document.getElementById('modelSelect')?.value || 'gpt-4o-mini';
    const bodyData = {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(payload) }
        ],
        response_format: { type: 'json_object' },
        temperature: 1
    };

    console.log('Enviando solicitud a OpenAI con modelo:', model);
    let response;
    try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify(bodyData)
        });
    } catch (fetchError) {
        throw new Error(`Error de conexión de red: ${fetchError.message}`);
    }

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Respuesta de error API:', response.status, errorBody);
        throw new Error(`Error API (${response.status}): ${errorBody.substring(0, 100)}`);
    }

    let data;
    try {
        data = await response.json();
    } catch (jsonError) {
        throw new Error(`Error al parsear respuesta JSON: ${jsonError.message}`);
    }

    const rawText = data.choices?.[0]?.message?.content || '';
    if (!rawText) {
        console.error('Respuesta vacía de la API:', data);
        throw new Error('La API devolvió una respuesta vacía. ¿API Key válida?');
    }

    let parsedData;
    try {
        parsedData = JSON.parse(rawText);
    } catch (err) {
        try {
            const firstBrace = rawText.indexOf('{');
            const lastBrace = rawText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                const sub = rawText.substring(firstBrace, lastBrace + 1);
                parsedData = JSON.parse(sub);
            } else {
                console.error('No se encontró JSON válido en respuesta:', rawText);
                throw new Error('Respuesta de IA no contiene JSON válido');
            }
        } catch (err2) {
            console.error('Error al extraer JSON:', err2, 'Texto original:', rawText);
            throw err2;
        }
    }

    const debugEntry = {
        label,
        time: new Date().toLocaleTimeString(),
        request: bodyData,
        response: parsedData,
        meta
    };
    debugHistory.unshift(debugEntry);
    updateDebugPanel(debugHistory);
    console.log('✓ Respuesta IA exitosa:', label, parsedData);
    return parsedData;
}
