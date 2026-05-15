let styleClipboard = null;

function cleanClasses(className) {
    return className
        .replace(/\bconstructor-element\b/g, '')
        .replace(/\bselected\b/g, '')
        .replace(/\bdragging\b/g, '')
        .replace(/\bdrag-over\b/g, '')
        .replace(/\bdrag-over-top\b/g, '')
        .replace(/\bdrag-over-bottom\b/g, '')
        .replace(/\bdrag-over-left\b/g, '')
        .replace(/\bdrag-over-right\b/g, '')
        .replace(/\bediting\b/g, '')
        .replace(/\bediting-text\b/g, '')
        .trim()
        .replace(/\s+/g, ' ');
}

function getEditableTarget(el) {
    const type = el.dataset.type;
    const contentDiv = el.querySelector('.element-content');
    if (!contentDiv) return null;

    switch (type) {
        case 'content':
            return contentDiv.querySelector('.content-holder') || contentDiv.firstElementChild;
        case 'link':
            return contentDiv.querySelector('a');
        case 'button':
            return contentDiv.querySelector('button');
        case 'tv':
            return contentDiv.firstElementChild;
        case 'row':
        case 'column':
            return contentDiv.querySelector('.drop-zone');
        default:
            return null;
    }
}

export function copyStyles(element) {
    if (!element) return;

    const target = getEditableTarget(element);
    if (!target) return;

    styleClipboard = {
        style: target.style.cssText,
        classes: cleanClasses(target.className)
    };
}

export function applyStyles(element) {
    if (!element || !styleClipboard) return;

    const target = getEditableTarget(element);
    if (!target) return;

    target.style.cssText = styleClipboard.style;
    target.className = cleanClasses(target.className) + ' ' + styleClipboard.classes;

    if (typeof invalidateElementCache !== 'undefined') {
        invalidateElementCache(element);
    }
    if (window.constructorApp) {
        window.constructorApp.updateHtmlOutput();
        if (window.constructorApp.updatePropertiesPanel) {
            window.constructorApp.updatePropertiesPanel();
        }
    }
}