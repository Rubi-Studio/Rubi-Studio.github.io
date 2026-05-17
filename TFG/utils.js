export const RANDOM_DATA = {
    names: ["Kael, paladín", "Lyra, ladrona", "Grog, bardo", "Elowen, druida", "Valerius, erudito"],
    origins: ["Huérfano de guerra", "Noble caído", "Superviviente", "Desertor", "Aprendiz"],
    motivations: ["Redención", "Venganza", "Curiosidad", "Supervivencia", "Justicia"],
    flaws: ["Miedo a la oscuridad", "Codicia", "Arrogancia", "Cicatriz del pasado", "Impulsividad"],
    settings: ["Fantasía oscura en un reino nevado.", "Una ciudad flotante en decadencia.", "Ruinas del viejo mundo."]
};

export const chispasArray = ["Agua","Fuego","Tierra","Aire","Hielo","Tormenta","Luz","Sombra","Eco","Silencio","Vacío","Ruido","Tiempo","Recuerdo","Olvido","Destino","Cambio","Eternidad","Deseo","Miedo","Amor","Culpa","Ira","Esperanza","Antiguo","Futuro","Ruina","Origen","Secreto","Fragmento","Sueño","Reflejo","Máscara","Umbral","Intrincado","Caída"];

export const CHARACTER_TRAITS = {
    roles: ["Mentor", "Aliado", "Rival", "Guardián", "Traidor", "Sabio", "Guerrero", "Sanador", "Mercader", "Investigador"],
    arcs: ["Encuentro del Mentor", "Prueba Aliado", "Conflicto Rival", "Guardián del Umbral", "Revelación"],
    traits: ["Cicatrizado", "Misterioso", "Generoso", "Ambicioso", "Temerario", "Cauteloso", "Carismático", "Calculador"]
};

export const ITEM_CATEGORIES = {
    weapons: ["Espada desgastada", "Puñal oculto", "Arco tensado", "Bastón antiguo"],
    consumables: ["Pociones de curación", "Veneno destilado", "Comida preservada"],
    artifacts: ["Amuleto de protección", "Llave misteriosa", "Pergamino antiguo", "Espejo encantado"],
    usable: ["Antorcha", "Cuerda resistente", "Ganzúa", "Mapa fragmentado"]
};

export const etapasViaje = [
    "1. Mundo Ordinario", "2. Llamada a la aventura", "3. Rechazo de la llamada", "4. Encuentro con el mentor", "5. Cruce del primer umbral", "6. Pruebas, aliados y enemigos", "7. Acercamiento a la caverna más profunda", "8. La odisea", "9. La recompensa", "10. El camino de regreso", "11. Resurrección", "12. Retorno con el elixir"
];

export function getSeedInstruction(level) {
    if (level.includes("Inspirativas")) {
        return "REGLA ESTRICTA: La semilla DEBEN SER EXACTAMENTE 5 PALABRAS SUELTAS separadas por comas. PROHIBIDO ESCRIBIR FRASES COMPLETAS. NO INCLUYAS LAS CHISPAS DE FORMA LITERAL.";
    } else if (level.includes("Moderadas")) {
        return "REGLA ESTRICTA: La semilla DEBE SER UNA ÚNICA FRASE CORTA Y AMBIGUA.";
    } else {
        return "REGLA ESTRICTA: La semilla debe ser un párrafo narrativo directo que plantee la siguiente escena o un obstáculo inminente.";
    }
}

export function pickChispas(count = 2) {
    const result = [];
    const used = new Set();
    while (result.length < count) {
        const candidate = chispasArray[Math.floor(Math.random() * chispasArray.length)];
        if (!used.has(candidate)) {
            used.add(candidate);
            result.push(candidate);
        }
    }
    return result;
}

export function pickRandomItem() {
    const allItems = [...ITEM_CATEGORIES.weapons, ...ITEM_CATEGORIES.consumables, ...ITEM_CATEGORIES.artifacts, ...ITEM_CATEGORIES.usable];
    return allItems[Math.floor(Math.random() * allItems.length)];
}

export function generateRandomCharacter() {
    const role = CHARACTER_TRAITS.roles[Math.floor(Math.random() * CHARACTER_TRAITS.roles.length)];
    const trait = CHARACTER_TRAITS.traits[Math.floor(Math.random() * CHARACTER_TRAITS.traits.length)];
    return { role, trait, arc: null, firstMention: new Date().toLocaleTimeString() };
}

export function condenseSummary(currentSummary, maxLength = 300) {
    if (currentSummary.length <= maxLength) return currentSummary;
    const sentences = currentSummary.split('. ');
    let condensed = '';
    for (let s of sentences) {
        if ((condensed + s + '. ').length <= maxLength) {
            condensed += s + '. ';
        } else break;
    }
    return condensed.trim() || currentSummary.substring(0, maxLength);
}

export function normalizeTagName(name) {
    if (!name || typeof name !== 'string') return '';
    let cleaned = name.trim().replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\b(Mundo Ordinario|Llamada a la aventura|Rechazo de la llamada|Encuentro con el mentor|Cruce del primer umbral|Pruebas, aliados y enemigos|Acercamiento a la caverna más profunda|La odisea|La recompensa|El camino de regreso|Resurrección|Retorno con el elixir)\b/gi, '');
    cleaned = cleaned.replace(/\b(El|La|Los|Las)\b\s*/gi, '');
    cleaned = cleaned.replace(/[:,]/g, ' ').trim();
    const words = cleaned.split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length > 3) {
        cleaned = words.slice(0, 3).join(' ');
    }
    return cleaned;
}

export function normalizeTagObjects(tags) {
    if (!Array.isArray(tags)) return [];
    return tags.map(tag => {
        if (!tag || typeof tag !== 'object') return null;
        const name = normalizeTagName(String(tag.name || ''));
        let level = Number(tag.level);
        if (Number.isNaN(level) || level < 1) level = 1;
        if (level > 5) level = 5;
        if (!name) return null;
        return { name, level };
    }).filter(Boolean);
}

export function normalizeInitialTagObjects(tags) {
    const normalized = normalizeTagObjects(tags);
    const finalTags = normalized.slice(0, 3).map(tag => ({ name: tag.name, level: 3 }));
    if (finalTags.length < 3) {
        const fallback = [
            { name: 'Determinación', level: 3 },
            { name: 'Sombra', level: 3 },
            { name: 'Sacrificio', level: 3 }
        ];
        for (let i = finalTags.length; i < 3; i += 1) {
            finalTags.push(fallback[i]);
        }
    }
    return finalTags;
}
