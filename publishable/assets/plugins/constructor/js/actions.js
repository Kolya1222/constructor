import { updatePropertiesPanel } from './propertiesPanel.js';
import { invalidateElementCache } from './cache.js';
import { createElement } from './elementCreation.js';
import { initDraggableElement } from './dragAndDrop.js';

export function removeSelectedElement() {
    const selectedElement = window.constructorApp.getSelectedElement();
    if (selectedElement && selectedElement.parentNode) {
        invalidateElementCache(selectedElement);
        selectedElement.parentNode.removeChild(selectedElement);
        window.constructorApp.setSelectedElement(null);
        updatePropertiesPanel();
        window.constructorApp.updateHtmlOutput();
    }
}

export function duplicateSelectedElement() {
    const selectedElement = window.constructorApp.getSelectedElement();
    if (!selectedElement) return;
    if (!selectedElement.parentNode) return;

    const values = collectElementValues(selectedElement);
    const type = selectedElement.dataset.type;

    const newElement = createElement(type, values);

    if (selectedElement.dataset.id) newElement.dataset.id = selectedElement.dataset.id;
    if (selectedElement.dataset.index) newElement.dataset.index = '';

    selectedElement.parentNode.insertBefore(newElement, selectedElement.nextSibling);

    initDraggableElement(newElement);
    invalidateElementCache(newElement);

    window.constructorApp.setSelectedElement(newElement);
    window.constructorApp.updateHtmlOutput();
    window.constructorApp.reinitializeEvents();
}

function collectElementValues(element) {
    const values = {
        styles: element.style.cssText,
        classes: element.className.replace(/constructor-element|selected|dragging|drag-over|drag-over-top|drag-over-bottom|drag-over-left|drag-over-right/g, '').trim(),
        attributes: {}
    };

    Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('data-') && 
            !['data-type', 'data-index', 'data-config', 'data-id'].includes(attr.name) &&
            !attr.name.startsWith('data-constructor-') &&
            !attr.name.startsWith('data-tv-')) {
            values.attributes[attr.name] = attr.value;
        }
    });

    if (element.dataset.tvId) values.tvId = element.dataset.tvId;
    if (element.dataset.tvName) values.tvName = element.dataset.tvName;
    if (element.dataset.tvType) values.tvType = element.dataset.tvType;

    const type = element.dataset.type;
    const contentDiv = element.querySelector('.element-content');
    if (contentDiv) {
        if (type === 'content') {
            const contentHolder = contentDiv.querySelector('.content-holder') || contentDiv.firstElementChild;
            if (contentHolder) {
                values.content = contentHolder.innerHTML || '';
                values.innerStyles = contentHolder.style.cssText;
                values.innerClasses = contentHolder.className.replace('content-holder', '').trim();
            }
        } else if (type === 'link') {
            const link = contentDiv.querySelector('a');
            if (link) {
                values.href = link.getAttribute('href') || '#';
                values.target = link.getAttribute('target') || '';
                values.rel = link.getAttribute('rel') || '';
                values.content = link.textContent || '';
                values.innerStyles = link.style.cssText;
                values.innerClasses = link.className;
            }
        } else if (type === 'button') {
            const button = contentDiv.querySelector('button');
            if (button) {
                values.content = button.textContent || '';
                values.innerStyles = button.style.cssText;
                values.innerClasses = button.className;
                values.buttonType = button.type;
                values.disabled = button.disabled ? true : false;
            }
        } else if (type === 'row' || type === 'column') {
            const dropZone = contentDiv.querySelector('.drop-zone');
            if (dropZone) {
                values.dropZoneClasses = dropZone.className.replace('drop-zone', '').trim();
                values.dropZoneStyles = dropZone.style.cssText;
            }
        }
    }

    return values;
}

export function copyHtmlToClipboard() {
    const htmlOutput = document.getElementById('html-output');
    if (!htmlOutput) return;
    const html = htmlOutput.textContent;
    const copyHtmlBtn = document.getElementById('copy-html');
    if (!copyHtmlBtn) return;
    
    navigator.clipboard.writeText(html).then(() => {
        const originalText = copyHtmlBtn.innerHTML;
        copyHtmlBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано';
        setTimeout(() => {
            copyHtmlBtn.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Ошибка копирования:', err);
    });
}