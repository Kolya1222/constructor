import { initRichTextEditor, destroyRichTextEditor } from './richTextEditor.js';
import { invalidateElementCache } from './cache.js';

export function addElementControls(element) {
    if (!element || element.querySelector('.quick-format')) return;
    
    if (element.dataset.type === 'content') {
        const formatBar = document.createElement('div');
        formatBar.className = 'quick-format';
        formatBar.innerHTML = `
            <button class="format-btn edit-rich" title="Открыть редактор">
                <i class="fas fa-edit"></i>
            </button>
            <button class="format-btn" data-format="bold" title="Жирный">
                <i class="fas fa-bold"></i>
            </button>
            <button class="format-btn" data-format="italic" title="Курсив">
                <i class="fas fa-italic"></i>
            </button>
        `;

        formatBar.querySelector('.edit-rich').addEventListener('click', (e) => {
            e.stopPropagation();
            initRichTextEditor(element);
        });

        formatBar.querySelector('[data-format="bold"]').addEventListener('click', (e) => {
            e.stopPropagation();
            const contentDiv = element.querySelector('.element-content');
            const contentHolder = contentDiv?.querySelector('.content-holder') || contentDiv?.firstElementChild;
            if (contentHolder) {
                const isBold = contentHolder.style.fontWeight === 'bold';
                contentHolder.style.fontWeight = isBold ? 'normal' : 'bold';
                invalidateElementCache(element);
                window.constructorApp.updateHtmlOutput();
            }
        });

        formatBar.querySelector('[data-format="italic"]').addEventListener('click', (e) => {
            e.stopPropagation();
            const contentDiv = element.querySelector('.element-content');
            const contentHolder = contentDiv?.querySelector('.content-holder') || contentDiv?.firstElementChild;
            if (contentHolder) {
                const isItalic = contentHolder.style.fontStyle === 'italic';
                contentHolder.style.fontStyle = isItalic ? 'normal' : 'italic';
                invalidateElementCache(element);
                window.constructorApp.updateHtmlOutput();
            }
        });
        
        element.appendChild(formatBar);
    }
}

export function destroyElementControls(element) {
    const formatBar = element.querySelector('.quick-format');
    if (formatBar) formatBar.remove();
    destroyRichTextEditor(element);
}

export function initAllElementsControls() {
    document.querySelectorAll('.constructor-element').forEach(addElementControls);
}