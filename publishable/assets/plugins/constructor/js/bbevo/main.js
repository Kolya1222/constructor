import { initDragAndDrop } from './dragAndDrop.js';
import { initPropertiesPanel, updatePropertiesPanel } from './propertiesPanel.js';
import { updateHtmlOutput } from './htmlOutput.js';
import { initContextMenu, showContextMenu, hideContextMenu } from './contextMenu.js';
import {
    copyHtmlToClipboard,
    exportHtml,
    clearWorkspace,
    removeSelectedElement,
    duplicateSelectedElement
} from './actions.js';
import { createElement } from './elementCreation.js';

// Функции для загрузки сохраненных данных
function loadSavedElements() {
    const savedData = window.formBuilderData?.savedData;
    if (!savedData) {
        return;
    }
    
    const workspace = document.getElementById('workspace');
    workspace.innerHTML = '';
    if (savedData.html && savedData.html.trim() !== '') {
        loadFromHtmlWithHierarchy(savedData.html, workspace);
    }
    else {
        return;
    }
    // Обновляем HTML preview
    const htmlOutput = document.getElementById('html-output');
    if (htmlOutput && savedData.html) {
        htmlOutput.innerHTML = savedData.html;
    }
}

//Загрузка из HTML с сохранением иерархии
function loadFromHtmlWithHierarchy(htmlContent, workspace) {
    const decodedHtml = decodeHtmlEntities(htmlContent);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = decodedHtml;
    convertHtmlToConstructorElements(tempDiv, workspace);
}

// Функция для декодирования HTML entities
function decodeHtmlEntities(html) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
}

// Рекурсивная функция преобразования HTML в конструкторские элементы
function convertHtmlToConstructorElements(sourceElement, targetContainer) {
    const children = Array.from(sourceElement.children);
    
    children.forEach(child => {
        const constructorElement = convertHtmlElementToConstructor(child);
        if (constructorElement) {
            targetContainer.appendChild(constructorElement);
        }
    });
}

// Функция преобразования одного HTML элемента в конструкторский
function convertHtmlElementToConstructor(htmlElement) {
    // Определяем тип элемента по классам и структуре
    const elementType = detectElementType(htmlElement);
    if (!elementType) {
        return null;
    }
    // Создаем соответствующий конструкторский элемент
    const constructorElement = createElement(elementType, getConfigForElement(htmlElement, elementType));
    if (!constructorElement) {
        console.error('Failed to create constructor element for type:', elementType);
        return null;
    }
    // Копируем контент и атрибуты
    copyContentAndAttributes(htmlElement, constructorElement, elementType);
    // Обрабатываем вложенные элементы (для row/column с drop-zone)
    processNestedElements(htmlElement, constructorElement, elementType);
    return constructorElement;
}

// Функция определения типа элемента по HTML
function detectElementType(htmlElement) {
    const classList = htmlElement.classList;
    const tagName = htmlElement.tagName.toLowerCase();
    // Проверяем на TV элемент
    if (htmlElement.hasAttribute('data-tv-id') || htmlElement.hasAttribute('data-tv-name')) {
        return 'tv';
    }
    // Проверяем на ссылку
    if (tagName === 'a' || htmlElement.querySelector('a')) {
        return 'link';
    }
    if (classList.contains('d-flex') && classList.contains('flex-row') && classList.contains('drop-zone')) {
        return 'row';
    }
    if (classList.contains('d-flex') && classList.contains('flex-column') && classList.contains('drop-zone')) {
        return 'column';
    }
    const dropZone = htmlElement.querySelector('.drop-zone');
    if (dropZone) {
        if (dropZone.classList.contains('d-flex') && dropZone.classList.contains('flex-row')) {
            return 'row';
        }
        if (dropZone.classList.contains('d-flex') && dropZone.classList.contains('flex-column')) {
            return 'column';
        }
    }
    if (tagName === 'div' && classList.contains('element-content') && 
        !htmlElement.querySelector('button') && !htmlElement.querySelector('img')) {
        return 'text';
    }
    if (htmlElement.querySelector('button') || tagName === 'button') {
        return 'button';
    }
    if (htmlElement.querySelector('img') || tagName === 'img') {
        return 'image';
    }
    return 'text';
}

// Функция получения конфига для элемента
function getConfigForElement(htmlElement, elementType) {
    const config = {};
    switch (elementType) {
        case 'tv':
            config.tvId = htmlElement.getAttribute('data-tv-id');
            config.tvName = htmlElement.getAttribute('data-tv-name');
            config.tvType = htmlElement.getAttribute('data-tv-type');
            config.tvLabel = htmlElement.getAttribute('data-tv-name') || 'TV';
            break;
        case 'text':
            // Для текстовых элементов берем содержимое
            const content = htmlElement.textContent || htmlElement.innerHTML || '';
            config.content = content.trim();
            
            // Определяем тег элемента
            const tagName = htmlElement.tagName.toLowerCase();
            // Если это div с классом element-content, ищем вложенный элемент
            if (tagName === 'div' && htmlElement.classList.contains('element-content')) {
                const innerElement = htmlElement.querySelector('*');
                if (innerElement) {
                    config.textTag = innerElement.tagName.toLowerCase();
                } else {
                    config.textTag = 'div'; // по умолчанию
                }
            } else {
                // Если сам элемент является текстовым (p, h1, etc.)
                config.textTag = tagName;
            }
            break;
        case 'link':
            const linkElement = htmlElement.tagName === 'A' ? htmlElement : htmlElement.querySelector('a');
            if (linkElement) {
                config.text = linkElement.textContent || '';
                config.href = linkElement.href || '';
                config.target = linkElement.target || '';
                config.title = linkElement.title || '';
                config.rel = linkElement.rel || '';
            }
            break;
    }
    return config;
}

function copyContentAndAttributes(sourceElement, targetElement, elementType) {
    const contentDiv = targetElement.querySelector('.element-content');
    
    if (!contentDiv) {
        console.warn('No content div found in target element:', elementType);
        return;
    }

    switch (elementType) {
        case 'row':
        case 'column':
            const dropZone = contentDiv.querySelector('.drop-zone');
            if (dropZone) {
                if (sourceElement.style.cssText) {
                    dropZone.style.cssText = sourceElement.style.cssText;
                }
                const layoutClasses = ['d-flex', 'flex-row', 'flex-column', 'drop-zone', 'gap-2', 'p-2'];
                const userClasses = Array.from(sourceElement.classList).filter(className => 
                    !layoutClasses.includes(className)
                );
                if (userClasses.length > 0) {
                    dropZone.classList.add(...userClasses);
                }
            }
            break;
            
        case 'text':
            // Для текстовых элементов создаем элемент с правильным тегом
            const textConfig = getConfigForElement(sourceElement, 'text'); // переименовано
            const textTag = textConfig.textTag || 'div';
            
            // Создаем элемент с нужным тегом
            const textElement = document.createElement(textTag);
            
            // Копируем содержимое
            textElement.textContent = sourceElement.textContent || sourceElement.innerHTML || '';
            
            // Копируем стили
            if (sourceElement.style.cssText) {
                textElement.style.cssText = sourceElement.style.cssText;
            }
            
            // Копируем классы (кроме element-content)
            const textSourceClasses = Array.from(sourceElement.classList).filter(className => // переименовано
                className !== 'element-content'
            );
            if (textSourceClasses.length > 0) {
                textElement.classList.add(...textSourceClasses);
            }
            
            // Копируем атрибуты
            Array.from(sourceElement.attributes).forEach(attr => {
                if (!['data-builder', 'draggable', 'class'].includes(attr.name)) {
                    textElement.setAttribute(attr.name, attr.value);
                }
            });
            
            // Очищаем contentDiv и добавляем созданный элемент
            contentDiv.innerHTML = '';
            contentDiv.appendChild(textElement);
            break;
            
        case 'link':
            // Для ссылок создаем элемент <a>
            const linkConfig = getConfigForElement(sourceElement, 'link'); // переименовано
            const linkElement = document.createElement('a');
            
            // Устанавливаем свойства
            linkElement.textContent = linkConfig.text || 'Текст ссылки';
            linkElement.href = linkConfig.href || '#';
            if (linkConfig.target) linkElement.target = linkConfig.target;
            if (linkConfig.title) linkElement.title = linkConfig.title;
            if (linkConfig.rel) linkElement.rel = linkConfig.rel;
            
            // Копируем стили
            if (sourceElement.style.cssText) {
                linkElement.style.cssText = sourceElement.style.cssText;
            }
            
            // Копируем классы
            const linkSourceClasses = Array.from(sourceElement.classList); // переименовано
            if (linkSourceClasses.length > 0) {
                linkElement.classList.add(...linkSourceClasses);
            }
            
            // Очищаем contentDiv и добавляем созданную ссылку
            contentDiv.innerHTML = '';
            contentDiv.appendChild(linkElement);
            break;
            
        case 'tv':
            Array.from(sourceElement.attributes).forEach(attr => {
                if (!['data-builder', 'draggable'].includes(attr.name)) {
                    contentDiv.setAttribute(attr.name, attr.value);
                }
            });
            if (sourceElement.hasAttribute('data-tv-id')) {
                targetElement.setAttribute('data-tv-id', sourceElement.getAttribute('data-tv-id'));
            }
            if (sourceElement.hasAttribute('data-tv-name')) {
                targetElement.setAttribute('data-tv-name', sourceElement.getAttribute('data-tv-name'));
            }
            if (sourceElement.hasAttribute('data-tv-type')) {
                targetElement.setAttribute('data-tv-type', sourceElement.getAttribute('data-tv-type'));
            }
            break;
            
        default:
            Array.from(sourceElement.attributes).forEach(attr => {
                if (!['data-builder', 'draggable'].includes(attr.name)) {
                    contentDiv.setAttribute(attr.name, attr.value);
                }
            });
            break;
    }
    
    // Обрабатываем контент для специфичных типов
    switch (elementType) {
        case 'tv':
            contentDiv.innerHTML = sourceElement.innerHTML || '{{$documentObject[\'' + (sourceElement.getAttribute('data-tv-name') || '') + '\']}}';
            break;
            
        case 'row':
        case 'column':
            break;
            
        default:
            if (elementType !== 'row' && elementType !== 'column' && elementType !== 'text' && elementType !== 'link') {
                contentDiv.innerHTML = sourceElement.innerHTML;
            }
            break;
    }
}

// Функция обработки вложенных элементов
function processNestedElements(sourceElement, targetElement, elementType) {
    if (elementType === 'row' || elementType === 'column') {
        let sourceDropZone = sourceElement;
        if (!sourceElement.classList.contains('drop-zone')) {
            sourceDropZone = sourceElement.querySelector('.drop-zone');
        }
        const targetDropZone = targetElement.querySelector('.drop-zone');
        if (sourceDropZone && targetDropZone) {
            // Рекурсивно обрабатываем детей в drop-zone
            const nestedChildren = Array.from(sourceDropZone.children);
            nestedChildren.forEach(nestedChild => {
                const nestedConstructorElement = convertHtmlElementToConstructor(nestedChild);
                if (nestedConstructorElement) {
                    targetDropZone.appendChild(nestedConstructorElement);
                }
            });
        } else {
            console.warn('Drop-zone not found for:', elementType, 'source:', sourceDropZone, 'target:', targetDropZone);
        }
    }
}

// Функция для переинициализации событий после загрузки
function reinitializeEvents() {
    const workspace = document.getElementById('workspace');
    
    // Обновляем HTML output
    updateHtmlOutput(workspace, document.getElementById('html-output'));
    
    // Re-init обработчики для текстовых элементов
    workspace.querySelectorAll('[data-type="text"]').forEach(element => {
        const contentDiv = element.querySelector('.element-content');
        if (contentDiv) {
            // Удаляем старые обработчики и добавляем новые
            const newContentDiv = contentDiv.cloneNode(true);
            contentDiv.parentNode.replaceChild(newContentDiv, contentDiv);
            
            // Добавляем обработчик двойного клика с поддержкой разных тегов
            newContentDiv.addEventListener('dblclick', function() {
                const innerElement = this.querySelector('*') || this;
                const currentText = innerElement.textContent;
                const currentTag = innerElement.tagName.toLowerCase();
                
                this.innerHTML = `<textarea class="form-control">${currentText}</textarea>`;
                const textarea = this.querySelector('textarea');
                textarea.focus();
                
                textarea.addEventListener('blur', function() {
                    // Восстанавливаем элемент с правильным тегом
                    const newElement = document.createElement(currentTag);
                    newElement.textContent = this.value;
                    
                    // Сохраняем стили и классы
                    if (innerElement.style.cssText) {
                        newElement.style.cssText = innerElement.style.cssText;
                    }
                    if (innerElement.className) {
                        newElement.className = innerElement.className;
                    }
                    
                    newContentDiv.innerHTML = '';
                    newContentDiv.appendChild(newElement);
                    window.constructorApp.updateHtmlOutput();
                });
                
                textarea.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        this.blur();
                    }
                });
            });
        }
    });
}

function prepareFormBuilderData() {
    const workspace = document.getElementById('workspace');
    const docForm = document.querySelector('form[action*="index.php"]');
    
    if (!docForm) return;
    
    // Удаляем предыдущие поля FormBuilder
    const existingFields = docForm.querySelectorAll('[name^="formbuilder"]');
    existingFields.forEach(field => field.remove());
    
    // Собираем данные с учетом вложенности
    const elementsData = collectElementsWithHierarchy(workspace);
    
    // Создаем скрытые поля
    elementsData.forEach((elementData, index) => {
        for (const [key, value] of Object.entries(elementData)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = `formbuilder[workspace][${index}][${key}]`;
            input.value = value;
            docForm.appendChild(input);
        }
    });
    
    // Генерируем чистый HTML
    const htmlOutput = document.getElementById('html-output');
    let cleanHtml = '';
    
    if (htmlOutput) {
        const clone = htmlOutput.cloneNode(true);
        clone.querySelectorAll('[data-builder]').forEach(el => el.remove());
        cleanHtml = clone.innerHTML;
        
        cleanHtml = cleanHtml
            .replace(/&amp;lt;/g, '<')
            .replace(/&amp;gt;/g, '>')
            .replace(/&amp;amp;/g, '&')
            .replace(/&amp;quot;/g, '"');
    }
    
    // Добавляем HTML данные в форму
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

//Cбора данных с учетом вложенности
function collectElementsWithHierarchy(container, parentIndex = null) {
    const elementsData = [];
    const children = Array.from(container.children);
    children.forEach((element, index) => {
        if (element.classList.contains('constructor-element') || element.hasAttribute('data-type')) {
            const elementData = {
                id: element.dataset.id || '',
                type: element.dataset.type,
                config: element.dataset.config || element.dataset.type,
                values: JSON.stringify(getElementValues(element)),
                visible: element.style.display !== 'none' ? 1 : 0,
                index: index,
                parentIndex: parentIndex
            };
            elementsData.push(elementData);
            // Рекурсивно собираем вложенные элементы
            const dropZones = element.querySelectorAll('.drop-zone');
            dropZones.forEach((dropZone, zoneIndex) => {
                const nestedElements = collectElementsWithHierarchy(dropZone, index);
                elementsData.push(...nestedElements);
            });
        }
    });
    return elementsData;
}

function getElementValues(element) {
    const values = {};
    const type = element.dataset.type;
    const innerElement = element.querySelector('.element-content > *') || element.querySelector('.element-content');
    const targetElement = innerElement || element;
    
    switch (type) {
        case 'text':
            const contentDiv = element.querySelector('.element-content');
            if (contentDiv) {
                // Сохраняем текст
                values.content = contentDiv.textContent || '';
                
                // Сохраняем тег элемента
                const textElement = contentDiv.querySelector('*');
                if (textElement) {
                    values.textTag = textElement.tagName.toLowerCase();
                } else {
                    // Если нет вложенного элемента, значит это div
                    values.textTag = 'div';
                }
            }
            break;

        case 'link':
            const link = element.querySelector('a');
            if (link) {
                values.text = link.textContent || '';
                values.href = link.href || '';
                values.target = link.target || '';
                values.title = link.title || '';
                values.rel = link.rel || '';
                values.linkStyles = link.style.cssText || '';
            }
            break;
            
        case 'button':
            const button = element.querySelector('button');
            if (button) {
                values.text = button.textContent || '';
                values.buttonStyles = button.style.cssText || '';
            }
            break;
            
        case 'image':
            const img = element.querySelector('img');
            if (img) {
                values.src = img.src || '';
                values.alt = img.alt || '';
                values.imgStyles = img.style.cssText || '';
            }
            break;
            
        case 'tv':
            if (element.dataset.tvId) values.tvId = element.dataset.tvId;
            if (element.dataset.tvName) values.tvName = element.dataset.tvName;
            if (element.dataset.tvType) values.tvType = element.dataset.tvType;
            const tvContent = element.querySelector('.element-content');
            if (tvContent) {
                values.content = tvContent.innerHTML || '';
            }
            break;
    }
    
    values.styles = element.style.cssText;
    values.classes = element.className;
    values.targetStyles = targetElement.style.cssText;
    values.attributes = {};
    
    Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('data-') && attr.name !== 'data-type') {
            values.attributes[attr.name] = attr.value;
        }
    });
    
    return values;
}

document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const workspace = document.getElementById('workspace');
    const htmlOutput = document.getElementById('html-output');
    const removeElementBtn = document.getElementById('remove-element');
    const duplicateElementBtn = document.getElementById('duplicate-element');
    const copyHtmlBtn = document.getElementById('copy-html');
    const exportHtmlBtn = document.getElementById('export-html');
    const clearWorkspaceBtn = document.getElementById('clear-workspace');
    const contextMenu = document.getElementById('context-menu');
    
    let selectedElement = null;
    let copiedElement = null;
    
    // Методы для работы с элементами
    const setSelectedElement = (element) => {
        if (selectedElement) {
            selectedElement.classList.remove('selected');
        }
        selectedElement = element;
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        updatePropertiesPanel();
    };
    
    const removeSelected = () => {
        if (selectedElement && selectedElement.parentNode) {
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
    
    // Экспортируем нужные переменные и методы
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
        // Добавляем функцию загрузки для ручного вызова если нужно
        loadSavedElements: loadSavedElements
    };
    
    // ШАГ 1: Загружаем сохраненные данные ПЕРВЫМ делом
    loadSavedElements();
    
    // ШАГ 2: Инициализация модулей ПОСЛЕ загрузки данных
    initDragAndDrop(workspace);
    initPropertiesPanel();
    updateHtmlOutput(workspace, htmlOutput);
    initContextMenu(contextMenu);
    
    // ШАГ 3: Переинициализация событий для загруженных элементов
    reinitializeEvents();
    
    // События кнопок
    if (copyHtmlBtn) copyHtmlBtn.addEventListener('click', copyHtmlToClipboard);
    if (exportHtmlBtn) exportHtmlBtn.addEventListener('click', exportHtml);
    if (clearWorkspaceBtn) clearWorkspaceBtn.addEventListener('click', clearWorkspace);
    if (removeElementBtn) removeElementBtn.addEventListener('click', removeSelectedElement);
    if (duplicateElementBtn) duplicateElementBtn.addEventListener('click', duplicateSelectedElement);
    
    // Контекстное меню
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.constructor-element')) {
            e.preventDefault();
            showContextMenu(e, contextMenu);
        }
        if (e.target.closest('.workspace')) {
            e.preventDefault();
            showContextMenu(e, contextMenu);
        }
    });
    
    document.addEventListener('click', () => hideContextMenu(contextMenu));
    // Перехватываем отправку формы документа Evolution
    const docForm = document.querySelector('form[action*="index.php"]');
    
    if (docForm) {
        docForm.addEventListener('submit', function(e) {
            prepareFormBuilderData();
        });
    }
});