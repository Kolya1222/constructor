import {
    removeSelectedElement,
    duplicateSelectedElement
} from './actions.js';
import { invalidateElementCache } from './cache.js';
import { createElement } from './elementCreation.js';
import { initDraggableElement } from './dragAndDrop.js';
import { copyStyles, applyStyles } from './styleClipboard.js';

export function initContextMenu(contextMenu) {
    contextMenu.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.context-menu-item');
        if (!menuItem) return;

        const action = menuItem.getAttribute('data-action');
        const selectedElement = window.constructorApp.getSelectedElement();

        switch (action) {
            case 'copy':
                if (selectedElement) {
                    const values = collectElementValues(selectedElement);
                    window.constructorApp.setCopiedElement(createElement(selectedElement.dataset.type, values));
                }
                break;

            case 'cut':
                if (selectedElement) {
                    const values = collectElementValues(selectedElement);
                    window.constructorApp.setCopiedElement(createElement(selectedElement.dataset.type, values));
                    removeSelectedElement();
                }
                break;

            case 'paste': {
                const copiedElement = window.constructorApp.getCopiedElement();
                if (!copiedElement) return;

                const values = collectElementValues(copiedElement);
                const clone = createElement(copiedElement.dataset.type, values);

                let targetContainer = null;
                let insertPosition = null;

                if (selectedElement && (selectedElement.dataset.type === 'row' || selectedElement.dataset.type === 'column')) {
                    const dropZone = selectedElement.querySelector('.drop-zone');
                    if (dropZone) {
                        targetContainer = dropZone;
                        insertPosition = null;
                    } else {
                        targetContainer = selectedElement.parentNode;
                        insertPosition = selectedElement.nextSibling;
                    }
                } else if (selectedElement && selectedElement.parentNode) {
                    targetContainer = selectedElement.parentNode;
                    insertPosition = selectedElement.nextSibling;
                } else {
                    targetContainer = window.constructorApp.workspace;
                    insertPosition = null;
                }

                if (targetContainer) {
                    if (insertPosition) {
                        targetContainer.insertBefore(clone, insertPosition);
                    } else {
                        targetContainer.appendChild(clone);
                    }
                    initDraggableElement(clone);
                    invalidateElementCache(clone);
                    window.constructorApp.setSelectedElement(clone);
                    window.constructorApp.reinitializeEvents();
                }
                break;
            }

            case 'duplicate':
                duplicateSelectedElement();
                break;
            case 'copy-styles':
                if (selectedElement) {
                    import('./styleClipboard.js').then(module => {
                        module.copyStyles(selectedElement);
                    });
                }
                break;

            case 'paste-styles':
                if (selectedElement) {
                    import('./styleClipboard.js').then(module => {
                        module.applyStyles(selectedElement);
                    });
                }
                break;
            case 'delete':
                removeSelectedElement();
                break;

            case 'move-up':
                if (selectedElement && selectedElement.previousElementSibling) {
                    let prev = selectedElement.previousElementSibling;
                    while (prev && !prev.classList.contains('constructor-element')) {
                        prev = prev.previousElementSibling;
                    }
                    if (prev) {
                        invalidateElementCache(selectedElement);
                        selectedElement.parentNode.insertBefore(selectedElement, prev);
                        window.constructorApp.updateHtmlOutput();
                    }
                }
                break;

            case 'move-down':
                if (selectedElement && selectedElement.nextElementSibling) {
                    let next = selectedElement.nextElementSibling;
                    while (next && !next.classList.contains('constructor-element')) {
                        next = next.nextElementSibling;
                    }
                    if (next) {
                        invalidateElementCache(selectedElement);
                        selectedElement.parentNode.insertBefore(next, selectedElement);
                        window.constructorApp.updateHtmlOutput();
                    }
                }
                break;
        }

        hideContextMenu(contextMenu);
    });
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

export function showContextMenu(e, contextMenu) {
    e.preventDefault();
    const targetElement = e.target.closest('.constructor-element');
    if (targetElement) {
        window.constructorApp.setSelectedElement(targetElement);
    }

    contextMenu.style.display = 'block';
    contextMenu.style.visibility = 'hidden';
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    contextMenu.style.visibility = '';

    let mouseX = e.clientX;
    let mouseY = e.clientY;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (mouseX + menuWidth > windowWidth - 10) {
        mouseX = windowWidth - menuWidth - 10;
    }
    if (mouseY + menuHeight > windowHeight - 10) {
        mouseY = windowHeight - menuHeight - 10;
    }
    mouseX = Math.max(10, mouseX);
    mouseY = Math.max(10, mouseY);

    contextMenu.style.left = mouseX + 'px';
    contextMenu.style.top = mouseY + 'px';
    contextMenu.style.display = 'block';
}

export function hideContextMenu(contextMenu) {
    contextMenu.style.display = 'none';
}