/**
 * Vercel Serverless Function para OpenAI
 * Variables de entorno requeridas: OPENAI_API_KEY
 * 
 * Esta función actúa como proxy seguro entre el frontend y OpenAI,
 * protegiendo la API Key del lado del servidor.
 */

export default async function handler(req, res) {
    // Configurar CORS para permitir peticiones desde otros orígenes (ej. GitHub Pages)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Responder a preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    // Solo permitir POST para el procesamiento real
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    // Validar API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('⚠️ OPENAI_API_KEY no configurada en variables de entorno');
        return res.status(500).json({ error: 'API Key no configurada en servidor' });
    }

    const { systemPrompt, payload, model = 'gpt-4o-mini' } = req.body;

    // Validar parámetros
    if (!systemPrompt || !payload) {
        return res.status(400).json({ error: 'Faltan parámetros: systemPrompt y payload requeridos' });
    }

    try {
        // Preparar datos para OpenAI
        const bodyData = {
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(payload) }
            ],
            response_format: { type: 'json_object' },
            temperature: 1
        };

        console.log(`🚀 Llamada a OpenAI (modelo: ${model})`);

        // Llamar a OpenAI (seguro en el servidor)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`❌ Error OpenAI (${response.status}):`, errorBody.substring(0, 200));
            return res.status(response.status).json({ 
                error: `Error OpenAI (${response.status})`,
                details: errorBody.substring(0, 200)
            });
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content || '';

        if (!rawText) {
            console.error('❌ Respuesta vacía de OpenAI:', data);
            return res.status(500).json({ error: 'OpenAI devolvió respuesta vacía' });
        }

        // Parsear JSON de la respuesta
        let parsedData;
        try {
            parsedData = JSON.parse(rawText);
        } catch (err) {
            // Intentar extraer JSON si está mezclado con texto
            const firstBrace = rawText.indexOf('{');
            const lastBrace = rawText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                const sub = rawText.substring(firstBrace, lastBrace + 1);
                parsedData = JSON.parse(sub);
            } else {
                console.error('❌ No se encontró JSON válido:', rawText.substring(0, 200));
                throw new Error('Respuesta no contiene JSON válido');
            }
        }

        console.log('✅ Respuesta OpenAI exitosa');
        return res.status(200).json(parsedData);

    } catch (error) {
        console.error('❌ Error en función OpenAI:', error.message);
        return res.status(500).json({ 
            error: 'Error procesando solicitud',
            details: error.message 
        });
    }
}
