export function validatePlayerInput(text) {
    const lower = text.toLowerCase();
    const explicitPatterns = [
        /\b(ignore|forget|olvida)\b/i,
        /\b(responde como|respond as|nuevo rol|new role)\b/i,
        /\b(deja de ignorar|stop ignoring)\b/i,
        /\b(a partir de ahora|from now on)\b/i,
        /\b(system|sistema|admin|administrador)\b/i
    ];
    const commandPatterns = [/^[\$#>!]/, /\[SYSTEM\]/i, /\{SYSTEM\}/i, /```/, /console\.log/i, /eval\(/i];
    for (let pattern of explicitPatterns) {
        if (pattern.test(text)) {
            return { isValid: false, reason: 'injection' };
        }
    }
    for (let pattern of commandPatterns) {
        if (pattern.test(text)) {
            return { isValid: false, reason: 'command_pattern' };
        }
    }
    return { isValid: true, reason: null };
}

export function detectGameBreaking(text) {
    const lower = text.toLowerCase();
    const breakingPatterns = [
        /\b(exit game|salir del juego|break game|activar modo|active mode)\b/i,
        /\b(cheat|truco|exploit|bypass)\b/i,
        /console\.log/i,
        /eval\(/i,
        /\b(function\(|function\s+)\b/i
    ];
    for (let pattern of breakingPatterns) {
        if (pattern.test(text)) {
            return true;
        }
    }
    return false;
}

export function validateAIAdherence(aiResponse, seedLevel, currentSeed) {
    if (!aiResponse || !currentSeed) return { isAdherent: true, severity: null };
    const responseText = (aiResponse.nueva_semilla || '').toLowerCase();
    if (seedLevel.includes('Inspirativas')) {
        return { isAdherent: responseText.length > 0, severity: 'low' };
    }
    if (seedLevel.includes('Moderadas')) {
        const hasMinimalStructure = responseText.split(' ').length > 3;
        return { isAdherent: hasMinimalStructure, severity: 'medium' };
    }
    if (seedLevel.includes('Escénicas')) {
        const violatesScene = /ignore|forget|ahora|a partir|from now|new|nuevo rol/i.test(responseText);
        return { isAdherent: !violatesScene, severity: 'high' };
    }

    return { isAdherent: true, severity: null };
}
