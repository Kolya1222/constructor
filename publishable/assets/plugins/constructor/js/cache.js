export const valuesCache = new WeakMap();

export function invalidateElementCache(element) {
    if (!element) return;

    valuesCache.delete(element);

    const dropZone = element.querySelector('.drop-zone');
    if (dropZone) {
        dropZone.querySelectorAll('.constructor-element').forEach(child => {
            valuesCache.delete(child);
        });
    }
}

export function clearAllCache() {
    if (window.__valuesCache) {
        window.__valuesCache = new WeakMap();
    }
}

window.__valuesCache = valuesCache;