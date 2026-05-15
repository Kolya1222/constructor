import { initDragAndDrop, initDraggableElement } from './dragAndDrop.js';
import { updatePropertiesPanel, initPropertiesPanel } from './propertiesPanel.js';
import { updateHtmlOutput } from './htmlOutput.js';
import {
    initContextMenu,
    showContextMenu,
    hideContextMenu
} from './contextMenu.js';
import {
    copyHtmlToClipboard,
    removeSelectedElement,
    duplicateSelectedElement
} from './actions.js';
import { createElement } from './elementCreation.js';
import { initRichTextEditor, destroyRichTextEditor } from './richTextEditor.js';
import { initLibrary } from './library.js';
import {
    valuesCache,
    clearAllCache,
    invalidateElementCache
} from './cache.js';

function sanitizeStyle(cssText) {
    return cssText
        .replace(/expression\s*\(/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/-moz-binding/gi, '')
        .replace(/behavior\s*:/gi, '')
        .replace(/@import/gi, '')
        .replace(/url\s*\(\s*["']?\s*javascript\s*:/gi, 'url(');
}

function escapeHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function cleanClasses(className) {
    const systemClasses = [
        'constructor-element', 'selected', 'dragging',
        'drag-over', 'drag-over-top', 'drag-over-bottom',
        'drag-over-left', 'drag-over-right', 'editing', 'editing-text',
        'content-holder', 'drop-zone', 'active'
    ];
    return className
        .split(/\s+/)
        .filter(cls => cls && !systemClasses.includes(cls))
        .join(' ');
}

/**
 * Общая функция построения DOM из массива элементов с иерархией.
 * @param {Array} elements – плоский массив элементов с полями index, parentIndex, type, values.
 * @param {HTMLElement} container – корневой контейнер, куда добавлять элементы.
 * @param {boolean} clearContainer – нужно ли очистить контейнер перед вставкой.
 */
function buildFromStructuredData(elements, container, clearContainer = false) {
    if (clearContainer) {
        container.innerHTML = '';
        if (typeof clearAllCache === 'function') {
            clearAllCache();
        }
    }

    const childrenMap = new Map();

    elements.forEach(el => {
        let parentIdx = el.parentIndex;
        if (parentIdx === null || parentIdx === undefined || parentIdx === '' || parentIdx === 'null') {
            parentIdx = null;
        } else {
            parentIdx = String(parentIdx);
        }

        const values = el.values || {};
        if (!values.attributes || typeof values.attributes !== 'object' || Array.isArray(values.attributes)) {
            values.attributes = {};
        }

        const normalized = {
            ...el,
            index: String(el.index),
            parentIndex: parentIdx,
            values: values
        };

        if (!childrenMap.has(parentIdx)) childrenMap.set(parentIdx, []);
        childrenMap.get(parentIdx).push(normalized);
    });

    for (const children of childrenMap.values()) {
        children.sort((a, b) => {
            const aIdx = parseInt(a.index, 10);
            const bIdx = parseInt(b.index, 10);
            if (isNaN(aIdx) || isNaN(bIdx)) return 0;
            return aIdx - bIdx;
        });
    }

    function buildDom(parentIndex = null, parentContainer = container) {
        const children = childrenMap.get(parentIndex) || [];
        for (const elementData of children) {
            const values = elementData.values || {};
            let domElement;
            try {
                domElement = createElement(elementData.type, values);
            } catch (err) {
                console.error('Ошибка создания элемента', elementData, err);
                continue;
            }
            if (!domElement) continue;

            if (elementData.id) domElement.dataset.id = elementData.id;
            if (elementData.index) domElement.dataset.index = String(elementData.index);

            parentContainer.appendChild(domElement);

            let dropZone = null;
            const contentEl = domElement.querySelector('.element-content');
            if (contentEl) {
                dropZone = contentEl.querySelector('.drop-zone');
            } else {
                dropZone = domElement.querySelector('.drop-zone');
            }
            if (dropZone) {
                buildDom(elementData.index, dropZone);
            } else if (childrenMap.has(elementData.index) && childrenMap.get(elementData.index).length > 0) {
                console.warn(`Элемент ${elementData.index} не имеет drop-zone, но есть дети. Дети потеряны.`);
            }
        }
    }

    buildDom(null, container);
}

function loadFromStructuredData(elements, workspace) {
    buildFromStructuredData(elements, workspace, true);
}

function appendStructuredData(elements, container) {
    buildFromStructuredData(elements, container, false);
}


function loadSavedElements() {
    const savedData = window.formBuilderData?.savedData;
    if (!savedData || !Array.isArray(savedData.elements)) {
        console.warn('Нет сохранённых данных или неверный формат');
        return;
    }
    const workspace = document.getElementById('workspace');
    if (!workspace) return;

    loadFromStructuredData(savedData.elements, workspace);

    const htmlOutput = document.getElementById('html-output');
    if (htmlOutput && savedData.html) {
        htmlOutput.textContent = savedData.html;
    }
    requestAnimationFrame(() => reinitializeEvents());
}

function reinitializeEvents() {
    const workspace = document.getElementById('workspace');
    updateHtmlOutput(workspace, document.getElementById('html-output'));
    workspace.querySelectorAll('[data-type="content"]').forEach(element => {
        const contentDiv = element.querySelector('.element-content');
        if (!contentDiv) return;
        contentDiv.removeEventListener('dblclick', handleTextDblClick);
        contentDiv.addEventListener('dblclick', handleTextDblClick);
    });
}

function handleTextDblClick(e) {
    if (e.target.closest('textarea, input, button, [contenteditable="true"]')) return;

    e.stopPropagation();
    const contentDiv = this;
    const element = contentDiv.closest('.constructor-element');
    if (!element) return;

    if (typeof tinymce !== 'undefined') {
        initRichTextEditor(element);
        return;
    }

    if (element.classList.contains('editing-text')) return;
    element.classList.add('editing-text');

    invalidateElementCache(element);

    const innerElement = contentDiv.firstElementChild;
    if (!innerElement) return;

    const currentText = innerElement.textContent;
    const currentTag = innerElement.tagName.toLowerCase();
    const savedStyles = innerElement.style.cssText;
    const savedClasses = innerElement.className;

    const originalHTML = contentDiv.innerHTML;

    contentDiv.innerHTML = `
        <textarea class="form-control inline-textarea">${escapeHTML(currentText)}</textarea>
        <div class="d-flex gap-2 mt-2">
            <button class="btn btn-sm btn-primary save-text">Сохранить</button>
            <button class="btn btn-sm btn-outline-secondary cancel-text">Отмена</button>
        </div>
    `;
    const textarea = contentDiv.querySelector('textarea');
    textarea.focus();

    const saveBtn = contentDiv.querySelector('.save-text');
    const cancelBtn = contentDiv.querySelector('.cancel-text');

    function save() {
        const newText = textarea.value;
        const newElement = document.createElement(currentTag);
        newElement.textContent = newText;
        if (savedStyles) newElement.style.cssText = savedStyles;
        if (savedClasses) newElement.className = savedClasses;
        contentDiv.innerHTML = '';
        contentDiv.appendChild(newElement);
        element.classList.remove('editing-text');
        invalidateElementCache(element);
        window.constructorApp.updateHtmlOutput();
    }

    function cancel() {
        contentDiv.innerHTML = originalHTML;
        element.classList.remove('editing-text');
    }

    saveBtn.addEventListener('click', save);
    cancelBtn.addEventListener('click', cancel);

    textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            save();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
        }
    });
}

function prepareFormBuilderData() {
    const workspace = document.getElementById('workspace');
    const docForm = document.querySelector('form[action*="index.php"]');
    if (!docForm) {
        console.warn('Форма не найдена, данные не будут отправлены');
        return;
    }

    document.querySelectorAll('.constructor-element[data-type="content"]').forEach(element => {
        destroyRichTextEditor(element);
    });

    document.querySelectorAll('.constructor-element').forEach(el => {
        el.classList.remove('dragging', 'drag-over', 'drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right');
        el.style.opacity = '';
        el.style.transition = '';
    });

    const containerId = 'formbuilder-data-container';
    let oldContainer = docForm.querySelector(`#${containerId}`);
    if (oldContainer) oldContainer.remove();

    const container = document.createElement('div');
    container.id = containerId;
    container.style.display = 'none';
    docForm.appendChild(container);

    const elementsData = collectElementsWithHierarchy(workspace);

    elementsData.forEach((elementData, idx) => {
        for (const [key, value] of Object.entries(elementData)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = `formbuilder[workspace][${idx}][${key}]`;
            input.value = (key === 'values') ? JSON.stringify(value) : String(value);
            container.appendChild(input);
        }
    });

    if (elementsData.length === 0) {
        const emptyInput = document.createElement('input');
        emptyInput.type = 'hidden';
        emptyInput.name = 'formbuilder[workspace]';
        emptyInput.value = '0';
        container.appendChild(emptyInput);
    }

    const htmlOutputElem = document.getElementById('html-output');
    let cleanHtml = '';
    if (htmlOutputElem && window.constructorApp && typeof window.constructorApp.updateHtmlOutput === 'function') {
        window.constructorApp.updateHtmlOutput();
        cleanHtml = htmlOutputElem.textContent;
    }
    const htmlInput = document.createElement('input');
    htmlInput.type = 'hidden';
    htmlInput.name = 'formbuilder_html';
    htmlInput.value = cleanHtml;
    container.appendChild(htmlInput);
    const cssInput = document.createElement('input');
    cssInput.type = 'hidden';
    cssInput.name = 'formbuilder_css';
    cssInput.value = '';
    container.appendChild(cssInput);
}

function collectElementsWithHierarchy(workspace) {
    const elementsData = [];
    const queue = [{ container: workspace, parentIdx: null }];
    let globalIndex = 0;
    while (queue.length > 0) {
        const { container, parentIdx } = queue.shift();
        const elements = Array.from(container.children).filter(el =>
            el.classList.contains('constructor-element')
        );
        elements.forEach(element => {
            const currentIndex = globalIndex++;
            const elementData = {
                id: element.dataset.id || '',
                type: element.dataset.type,
                config: element.dataset.config || element.dataset.type,
                values: getElementValues(element),
                visible: element.style.display !== 'none' ? 1 : 0,
                index: currentIndex,
                parentIndex: parentIdx
            };
            elementsData.push(elementData);

            const dropZone = element.querySelector(':scope > .drop-zone') ||
                             element.querySelector('.drop-zone');
            if (dropZone) {
                queue.push({ container: dropZone, parentIdx: currentIndex });
            }
        });
    }
    return elementsData;
}

function getElementValues(element) {
    if (valuesCache.has(element)) {
        return valuesCache.get(element);
    }
    const values = {};
    const type = element.dataset.type;
    values.styles = element.style.cssText;
    values.classes = cleanClasses(element.className);
    values.attributes = {};
    Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('data-') && attr.name !== 'data-type') {
            values.attributes[attr.name] = attr.value;
        }
    });

    switch (type) {
        case 'content': {
            const contentDiv = element.querySelector('.element-content');
            if (contentDiv) {
                const contentHolder = contentDiv.querySelector('.content-holder') || contentDiv.firstElementChild;
                if (contentHolder) {
                    values.content = contentHolder.innerHTML || '';
                    values.innerStyles = contentHolder.style.cssText;
                    values.innerClasses = cleanClasses(contentHolder.className);
                }
            }
            break;
        }
        case 'link': {
            const link = element.querySelector('a');
            if (link) {
                values.href = link.href;
                values.target = link.target;
                values.rel = link.rel;
                values.innerStyles = link.style.cssText;
                values.innerClasses = cleanClasses(link.className);
                values.content = link.textContent || '';
            }
            break;
        }
        case 'button': {
            const button = element.querySelector('button');
            if (button) {
                values.content = button.textContent || '';
                values.innerStyles = button.style.cssText;
                values.innerClasses = cleanClasses(button.className);
                values.buttonType = button.type;
                values.disabled = button.disabled;
            }
            break;
        }
        case 'tv': {
            if (element.dataset.tvId) values.tvId = element.dataset.tvId;
            if (element.dataset.tvName) values.tvName = element.dataset.tvName;
            if (element.dataset.tvType) values.tvType = element.dataset.tvType;

            const tvContentDiv = element.querySelector('.element-content');
            if (tvContentDiv) {
                const tvElement = tvContentDiv.firstElementChild;
                if (tvElement) {
                    if (tvElement.tagName === 'IMG') {
                        let srcAttr = tvElement.getAttribute('src') || '';
                        const baseUrl = window.formBuilderData?.baseUrl;
                        if (baseUrl && srcAttr.startsWith(baseUrl)) {
                            srcAttr = srcAttr.substring(baseUrl.length);
                        }
                        values.content = srcAttr;
                        values.alt = tvElement.getAttribute('alt') || '';
                        values.targetStyles = tvElement.style.cssText;
                        values.targetClasses = cleanClasses(tvElement.className);
                    } else {
                        values.content = tvElement.textContent || '';
                        values.targetStyles = tvElement.style.cssText;
                        values.targetClasses = cleanClasses(tvElement.className);
                    }
                }
            }
            break;
        }
        case 'column':
        case 'row': {
            const dropZone = element.querySelector('.drop-zone');
            if (dropZone) {
                values.dropZoneClasses = cleanClasses(dropZone.className);
                values.dropZoneStyles = dropZone.style.cssText;
            }
            break;
        }
    }
    valuesCache.set(element, values);
    return values;
}

document.addEventListener('DOMContentLoaded', function () {
    const workspace = document.getElementById('workspace');
    const htmlOutput = document.getElementById('html-output');
    const removeElementBtn = document.getElementById('remove-element');
    const duplicateElementBtn = document.getElementById('duplicate-element');
    const copyHtmlBtn = document.getElementById('copy-html');
    const contextMenu = document.getElementById('context-menu');
    const propertiesForm = document.getElementById('properties-form');

    if (propertiesForm) {
        propertiesForm.addEventListener('submit', (e) => e.preventDefault());
        initPropertiesPanel();
    }

    let selectedElement = null;
    let copiedElement = null;

    const setSelectedElement = (element) => {
        if (selectedElement) selectedElement.classList.remove('selected');
        selectedElement = element;
        if (selectedElement) {
            selectedElement.classList.add('selected');
            invalidateElementCache(selectedElement);
        }
        updatePropertiesPanel();
    };

    const removeSelected = () => {
        if (selectedElement?.parentNode) {
            selectedElement.parentNode.removeChild(selectedElement);
            selectedElement = null;
            window.constructorApp.updateHtmlOutput();
            updatePropertiesPanel();
        }
    };

    window.constructorApp = {
        workspace,
        selectedElement,
        copiedElement,
        updatePropertiesPanel,
        setSelectedElement,
        getSelectedElement: () => selectedElement,
        setCopiedElement: (element) => { copiedElement = element; },
        getCopiedElement: () => copiedElement,
        updateHtmlOutput: () => updateHtmlOutput(workspace, htmlOutput),
        removeSelectedElement: removeSelected,
        duplicateSelectedElement: duplicateSelectedElement,
        loadSavedElements,
        loadFromStructuredData,
        appendStructuredData: (elements, container) => appendStructuredData(elements, container),
        reinitializeEvents,
        lockPropertiesPanel: function (locked) {
            const panel = document.getElementById('properties-form');
            if (panel) {
                panel.style.pointerEvents = locked ? 'none' : '';
                panel.style.opacity = locked ? '0.5' : '';
            }
        }
    };

    loadSavedElements();
    initDragAndDrop(workspace);
    updateHtmlOutput(workspace, htmlOutput);
    initContextMenu(contextMenu);
    reinitializeEvents();
    initLibrary();

    if (copyHtmlBtn) copyHtmlBtn.addEventListener('click', copyHtmlToClipboard);
    if (removeElementBtn) removeElementBtn.addEventListener('click', removeSelectedElement);
    if (duplicateElementBtn) duplicateElementBtn.addEventListener('click', duplicateSelectedElement);

    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest('.constructor-element, .workspace')) {
            e.preventDefault();
            showContextMenu(e, contextMenu);
        }
    });
    document.addEventListener('click', () => hideContextMenu(contextMenu));

    const docForm = document.querySelector('form[action*="index.php"]');
    if (docForm) docForm.addEventListener('submit', () => prepareFormBuilderData());

    const clearWorkspaceBtn = document.getElementById('clear-workspace');
    if (clearWorkspaceBtn) {
        clearWorkspaceBtn.addEventListener('click', () => {
            if (confirm('Удалить все элементы из рабочей области?')) {
                workspace.innerHTML = '';
                clearAllCache();
                window.constructorApp.updateHtmlOutput();
                updatePropertiesPanel();
                window.constructorApp.setSelectedElement(null);
            }
        });
    }
});