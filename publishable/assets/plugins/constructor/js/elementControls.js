import { initRichTextEditor, destroyRichTextEditor } from './richTextEditor.js';
import { invalidateElementCache } from './cache.js';

export function initElementControls() {
    document.querySelectorAll('.constructor-element').forEach(addElementControls);
}

export function addElementControls(element) {
    if (element.querySelector('.quick-format')) return;
    
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
        
        // Обработчик для жирного текста
        formatBar.querySelector('[data-format="bold"]').addEventListener('click', (e) => {
            e.stopPropagation();
            const contentDiv = element.querySelector('.element-content');
            const contentHolder = contentDiv?.querySelector('.content-holder') || contentDiv?.firstElementChild;
            invalidateElementCache(element);
            if (contentHolder) {
                if (contentHolder.style.fontWeight === 'bold') {
                    contentHolder.style.fontWeight = 'normal';
                } else {
                    contentHolder.style.fontWeight = 'bold';
                }
                window.constructorApp.updateHtmlOutput();
            }
        });
        
        // Обработчик для курсива
        formatBar.querySelector('[data-format="italic"]').addEventListener('click', (e) => {
            e.stopPropagation();
            const contentDiv = element.querySelector('.element-content');
            const contentHolder = contentDiv?.querySelector('.content-holder') || contentDiv?.firstElementChild;
            invalidateElementCache(element);
            if (contentHolder) {
                if (contentHolder.style.fontStyle === 'italic') {
                    contentHolder.style.fontStyle = 'normal';
                } else {
                    contentHolder.style.fontStyle = 'italic';
                }
                window.constructorApp.updateHtmlOutput();
            }
        });
        
        element.appendChild(formatBar);
    }
}

export function destroyElementControls(element) {
    const formatBar = element.querySelector('.quick-format');
    if (formatBar) {
        formatBar.remove();
    }
    destroyRichTextEditor(element);
}