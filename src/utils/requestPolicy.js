// A plain typed question doesn't need a full-screen upload or vision inference.
function requiresScreenContext(text) {
    return /\b(screen|screenshot|on my display)\b|\b(solve|read|explain|analyze|check|look at)\s+(this|that|the)\s+(question|problem|code|snippet|function)\b/i.test(
        text
    );
}

function captureDimensions(width, height, quality) {
    const maximum = quality === 'high' ? 2560 : quality === 'low' ? 1280 : 1920;
    const scale = Math.min(1, maximum / Math.max(width, height));
    return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

module.exports = { requiresScreenContext, captureDimensions };
