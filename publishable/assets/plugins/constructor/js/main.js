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
import { destroyRichTextEditor } from './richTextEditor.js';
import { initLibrary } from './library.js';
import {
    valuesCache,
    clearAllCache,
    invalidateElementCache
} from './cache.js';

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

function loadFromStructuredData(elements, workspace) {
    if (typeof clearAllCache === 'function') {
        clearAllCache();
    }
    workspace.innerHTML = '';

    const elementsMap = new Map();
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
        elementsMap.set(String(el.index), normalized);
    });

    for (let [_, children] of childrenMap.entries()) {
        children.sort((a, b) => {
            const aIdx = parseInt(a.index, 10);
            const bIdx = parseInt(b.index, 10);
            if (isNaN(aIdx) || isNaN(bIdx)) return 0;
            return aIdx - bIdx;
        });
    }

    function buildDom(parentIndex = null, parentContainer = workspace) {
        const children = childrenMap.get(parentIndex) || [];
        for (const elementData of children) {
            const values = elementData.values || {};
            let domElement = null;
            try {
                domElement = createElement(elementData.type, values);
            } catch (err) {
                console.error('Ошибка создания элемента', elementData, err);
                continue;
            }
            if (!domElement) continue;
            if (elementData.id) domElement.dataset.id = elementData.id;
            if (values.styles) {
                domElement.style.cssText = sanitizeStyle(values.styles);
            }
            if (elementData.index) domElement.dataset.index = String(elementData.index);
            if (values.classes) domElement.className = values.classes;

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
            } else {
                if (childrenMap.has(elementData.index) && childrenMap.get(elementData.index).length > 0) {
                    console.warn(`Элемент ${elementData.index} не имеет drop-zone, но есть дети. Дети потеряны.`);
                }
            }
        }
    }

    buildDom(null, workspace);
}

function sanitizeStyle(cssText) {
    return cssText
        .replace(/expression\s*\(/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/-moz-binding/gi, '')
        .replace(/behavior\s*:/gi, '')
        .replace(/@import/gi, '')
        .replace(/url\s*\(\s*["']?\s*javascript\s*:/gi, 'url(');
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
    if (e.target.closest('.quick-format, textarea, input, button, [contenteditable="true"]')) return;

    e.stopPropagation();
    const contentDiv = this;
    const element = contentDiv.closest('.constructor-element');
    if (element) invalidateElementCache(element);
    const innerElement = contentDiv.firstElementChild;
    if (!innerElement) return;
    const currentText = innerElement.textContent;
    const currentTag = innerElement.tagName.toLowerCase();
    const savedStyles = innerElement.style.cssText;
    const savedClasses = innerElement.className;
    contentDiv.innerHTML = '';
    const textarea = document.createElement('textarea');
    textarea.className = 'form-control';
    textarea.textContent = currentText;
    contentDiv.appendChild(textarea);
    textarea.focus();
    textarea.addEventListener('blur', function onBlur() {
        const newElement = document.createElement(currentTag);
        newElement.textContent = this.value;
        if (savedStyles) newElement.style.cssText = savedStyles;
        if (savedClasses) newElement.className = savedClasses;
        contentDiv.innerHTML = '';
        contentDiv.appendChild(newElement);
        if (element) invalidateElementCache(element);
        window.constructorApp.updateHtmlOutput();
        this.removeEventListener('blur', onBlur);
    });
    textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.blur();
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
        const elements = container.querySelectorAll(':scope > .constructor-element');
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
            const contentEl = element.querySelector(':scope > .element-content');
            let dropZone = null;
            if (contentEl) {
                dropZone = contentEl.querySelector(':scope > .drop-zone');
            } else {
                dropZone = element.querySelector(':scope > .drop-zone');
            }
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
    values.classes = element.className;
    values.attributes = {};
    Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('data-') && attr.name !== 'data-type') {
            values.attributes[attr.name] = attr.value;
        }
    });
    switch (type) {
        case 'content':
            const contentDiv = element.querySelector('.element-content');
            if (contentDiv) {
                const contentHolder = contentDiv.querySelector('.content-holder') || contentDiv.firstElementChild;
                if (contentHolder) {
                    values.content = contentHolder.innerHTML || '';
                    values.innerStyles = contentHolder.style.cssText;
                    values.innerClasses = contentHolder.className;
                }
            }
            break;

        case 'link':
            const link = element.querySelector('a');
            if (link) {
                values.href = link.href;
                values.target = link.target;
                values.rel = link.rel;
                values.innerStyles = link.style.cssText;
                values.innerClasses = link.className;
                values.content = link.textContent || '';
            }
            break;

        case 'button':
            const button = element.querySelector('button');
            if (button) {
                values.content = button.textContent || '';
                values.innerStyles = button.style.cssText;
                values.innerClasses = button.className;
                values.buttonType = button.type;
                values.disabled = button.disabled;
            }
            break;

        case 'tv':
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
                        values.targetClasses = tvElement.className;
                    } else {
                        values.content = tvElement.textContent || '';
                        values.targetStyles = tvElement.style.cssText;
                        values.targetClasses = tvElement.className;
                    }
                }
            }
            break;

        case 'column':
        case 'row':
            const dropZone = element.querySelector('.drop-zone');
            if (dropZone) {
                values.dropZoneClasses = dropZone.className;
                values.dropZoneStyles = dropZone.style.cssText;
            }
            break;
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
        loadFromStructuredData: loadFromStructuredData,
        reinitializeEvents: reinitializeEvents,
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
});