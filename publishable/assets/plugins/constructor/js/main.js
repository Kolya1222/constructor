import { initDragAndDrop } from './dragAndDrop.js';
import { updatePropertiesPanel } from './propertiesPanel.js';
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
    clearAllCache
} from './cache.js';

function loadSavedElements() {
    const savedData = window.formBuilderData?.savedData;
    if (!savedData || !savedData.elements) return;
    
    const workspace = document.getElementById('workspace');
    loadFromStructuredData(savedData.elements, workspace);
    
    const htmlOutput = document.getElementById('html-output');
    if (htmlOutput && savedData.html) htmlOutput.innerHTML = savedData.html;
    
    setTimeout(() => reinitializeEvents(), 100);
}

function loadFromStructuredData(elements, workspace) {
    if (typeof clearAllCache === 'function') {
        clearAllCache();
    } else {
        window.__valuesCache = new WeakMap();
    }
    
    workspace.innerHTML = '';
    
    const elementsMap = new Map();
    const childrenMap = new Map();
    elements.forEach(el => {
        const parentIdx = el.parentIndex !== null && el.parentIndex !== undefined 
            ? String(el.parentIndex) 
            : null;
        
        if (!childrenMap.has(parentIdx)) {
            childrenMap.set(parentIdx, []);
        }
        
        const elementWithStringIndices = {
            ...el,
            index: String(el.index),
            parentIndex: parentIdx
        };
        
        childrenMap.get(parentIdx).push(elementWithStringIndices);
        elementsMap.set(String(el.index), elementWithStringIndices);
    });

    function createElementHierarchy(parentIndex = null, parentContainer = workspace) {
        const parentKey = parentIndex !== null ? String(parentIndex) : null;
        const childElements = childrenMap.get(parentKey) || [];
        
        childElements.sort((a, b) => parseInt(a.index) - parseInt(b.index));
        
        childElements.forEach(elementData => {
            try {
                const values = elementData.values || {};
                const element = createElement(elementData.type, values);
                
                if (element) {
                    if (elementData.id) element.dataset.id = elementData.id;
                    if (values.styles) element.style.cssText = values.styles;
                    if (elementData.index) element.dataset.index = String(elementData.index);
                    
                    parentContainer.appendChild(element);

                    const dropZone = element.querySelector('.drop-zone');

                    if (dropZone) {
                        createElementHierarchy(elementData.index, dropZone);
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки элемента:', elementData, error);
            }
        });
    }

    createElementHierarchy(null, workspace);
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
    e.stopPropagation();
    const contentDiv = this;
    const innerElement = contentDiv.firstElementChild;
    
    if (!innerElement) return;
    
    const currentText = innerElement.textContent;
    const currentTag = innerElement.tagName.toLowerCase();

    const savedStyles = innerElement.style.cssText;
    const savedClasses = innerElement.className;
    
    contentDiv.innerHTML = `<textarea class="form-control">${currentText}</textarea>`;
    const textarea = contentDiv.querySelector('textarea');
    textarea.focus();
    
    textarea.addEventListener('blur', function onBlur() {
        const newElement = document.createElement(currentTag);
        newElement.textContent = this.value;
        
        // Восстанавливаем стили и классы
        if (savedStyles) newElement.style.cssText = savedStyles;
        if (savedClasses) newElement.className = savedClasses;
        
        contentDiv.innerHTML = '';
        contentDiv.appendChild(newElement);
        window.constructorApp.updateHtmlOutput();
        this.removeEventListener('blur', onBlur);
    });
    
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.blur();
        }
    });
}

function prepareFormBuilderData() {
    const workspace = document.getElementById('workspace');
    const docForm = document.querySelector('form[action*="index.php"]');
    if (!docForm) return;
    document.querySelectorAll('.constructor-element[data-type="content"]').forEach(element => {
        destroyRichTextEditor(element);
    });
        
    docForm.querySelectorAll('[name^="formbuilder"]').forEach(field => field.remove());
    
    const elementsData = collectElementsWithHierarchy(workspace);
    
    elementsData.forEach((elementData, index) => {
        for (const [key, value] of Object.entries(elementData)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = `formbuilder[workspace][${index}][${key}]`;
            input.value = key === 'values' ? JSON.stringify(value) : value;
            docForm.appendChild(input);
        }
    });
    
    const htmlOutput = document.getElementById('html-output');
    let cleanHtml = '';
    
    if (htmlOutput) {
        const clone = htmlOutput.cloneNode(true);
        clone.querySelectorAll('[data-builder]').forEach(el => el.remove());
        cleanHtml = clone.innerHTML
            .replace(/&amp;lt;/g, '<')
            .replace(/&amp;gt;/g, '>')
            .replace(/&amp;amp;/g, '&')
            .replace(/&amp;quot;/g, '"');
    }
    
    const htmlInput = document.createElement('input');
    htmlInput.type = 'hidden';
    htmlInput.name = 'formbuilder_html';
    htmlInput.value = cleanHtml;
    docForm.appendChild(htmlInput);
    
    const cssInput = document.createElement('input');
    cssInput.type = 'hidden';
    cssInput.name = 'formbuilder_css';
    cssInput.value = '';
    docForm.appendChild(cssInput);
    
    if (elementsData.length === 0) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'formbuilder[workspace]';
        input.value = '0';
        docForm.appendChild(input);
    }
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
            
            // Собираем данные элемента
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

            const dropZone = element.querySelector(':scope > .element-content > .drop-zone');
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

document.addEventListener('DOMContentLoaded', function() {
    const workspace = document.getElementById('workspace');
    const htmlOutput = document.getElementById('html-output');
    const removeElementBtn = document.getElementById('remove-element');
    const duplicateElementBtn = document.getElementById('duplicate-element');
    const copyHtmlBtn = document.getElementById('copy-html');
    const contextMenu = document.getElementById('context-menu');
    const propertiesForm = document.getElementById('properties-form');
    
    if (propertiesForm) propertiesForm.addEventListener('submit', (e) => e.preventDefault());
    
    let selectedElement = null;
    let copiedElement = null;
    
    const setSelectedElement = (element) => {
        if (selectedElement) selectedElement.classList.remove('selected');
        selectedElement = element;
        if (selectedElement) selectedElement.classList.add('selected');
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
    
    const duplicateSelected = () => {
        if (selectedElement) {
            const clone = selectedElement.cloneNode(true);
            selectedElement.parentNode.insertBefore(clone, selectedElement.nextSibling);
            setSelectedElement(clone);
            updateHtmlOutput();
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
        duplicateSelectedElement: duplicateSelected,
        loadSavedElements,
        loadFromStructuredData: loadFromStructuredData
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
    
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.constructor-element, .workspace')) {
            e.preventDefault();
            showContextMenu(e, contextMenu);
        }
    });
    
    document.addEventListener('click', () => hideContextMenu(contextMenu));
    
    const docForm = document.querySelector('form[action*="index.php"]');
    if (docForm) docForm.addEventListener('submit', () => prepareFormBuilderData());
});