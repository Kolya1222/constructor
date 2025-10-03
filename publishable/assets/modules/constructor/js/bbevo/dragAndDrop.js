import { selectElement } from './elementSelection.js';
import { createElement } from './elementCreation.js';
import { updatePropertiesPanel } from './propertiesPanel.js';

export function initDragAndDrop(workspace) {
    // Перетаскивание элементов с панели
    document.querySelectorAll('.element-icon').forEach(icon => {
        icon.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.getAttribute('data-type'));
        });
    });
    
    // Обработка зоны сброса
    workspace.addEventListener('dragover', function(e) {
        e.preventDefault();
        const dropZone = findDropZone(e);
        
        // Подсветка зоны сброса
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('active');
        });
        
        if (dropZone) {
            dropZone.classList.add('active');
        }
    });
    
    workspace.addEventListener('dragleave', function() {
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('active');
        });
    });
    
    workspace.addEventListener('drop', function(e) {
        e.preventDefault();
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('active');
        });
        
        // Сначала проверяем, не перемещаем ли мы существующий элемент
        if (e.dataTransfer.types.includes('text/plain') && e.dataTransfer.getData('text/plain') === 'move') {
            const draggingElement = document.querySelector('.constructor-element.dragging');
            
            if (draggingElement) {
                const dropZone = findDropZone(e);
                
                if (dropZone) {
                    // Если есть dropZone - помещаем элемент в него
                    dropZone.appendChild(draggingElement);
                } else {
                    // Если нет dropZone - помещаем элемент в рабочую область
                    workspace.appendChild(draggingElement);
                }
                
                window.constructorApp.updateHtmlOutput();
            }
            return;
        }
        
        // Только если это не перемещение, создаем новый элемент
        const elementType = e.dataTransfer.getData('text/plain');
        const dropZone = findDropZone(e);
        
        if (elementType) {
            const newElement = createElement(elementType);
            
            if (dropZone) {
                dropZone.appendChild(newElement);
            } else {
                workspace.appendChild(newElement);
            }
            
            selectElement(newElement);
            window.constructorApp.updateHtmlOutput();
        }
    });
    
    // Перетаскивание внутри рабочей области
    workspace.addEventListener('mousedown', function(e) {
        const targetElement = e.target.closest('.constructor-element');
        
        if (targetElement && e.button === 0) {
            selectElement(targetElement);
            
            // Начало перетаскивания
            const handle = targetElement.querySelector('.element-handle');
            if (handle && handle.contains(e.target)) {
                targetElement.setAttribute('draggable', 'true');
                targetElement.classList.add('dragging');
                
                targetElement.addEventListener('dragstart', function(ev) {
                    ev.dataTransfer.setData('text/plain', 'move');
                    ev.dataTransfer.effectAllowed = 'move';
                });
                
                targetElement.addEventListener('dragend', function() {
                    this.removeAttribute('draggable');
                    this.classList.remove('dragging');
                });
            }
        } else if (!targetElement && e.button === 0) {
            // Клик вне элемента - снимаем выделение
            document.querySelectorAll('.constructor-element').forEach(el => {
                el.classList.remove('selected', 'dragging');
            });
            window.constructorApp.setSelectedElement(null);
            updatePropertiesPanel();
        }
    });
    
    // Обработка перетаскивания внутри рабочей области
    workspace.addEventListener('dragover', function(e) {
        if (e.dataTransfer.types.includes('text/plain') && e.dataTransfer.getData('text/plain') === 'move') {
            e.preventDefault();
            const dropZone = findDropZone(e);
            
            document.querySelectorAll('.drop-zone').forEach(zone => {
                zone.classList.remove('active');
            });
            
            if (dropZone) {
                dropZone.classList.add('active');
            }
        }
    });
}

function findDropZone(e) {
    let target = e.target;
    const workspace = window.constructorApp.workspace;
    
    while (target && target !== workspace) {
        if (target.classList.contains('drop-zone')) {
            return target;
        }
        target = target.parentNode;
    }
    
    return null;
}