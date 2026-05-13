let valuesCache = new WeakMap();

export { valuesCache };

export function invalidateElementCache(element) {
    if (!element) return;
    valuesCache.delete(element);
    element.querySelectorAll('.constructor-element').forEach(child => {
        valuesCache.delete(child);
    });
}

export function clearAllCache() {
    valuesCache = new WeakMap();
}
