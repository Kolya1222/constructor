import { createElement } from './elementCreation.js';
import { updatePropertiesPanel } from './propertiesPanel.js';
import { invalidateElementCache } from './cache.js';

let dragSource = null;

export function initDragAndDrop(workspace) {
    // Перетаскивание элементов с панели
    document.querySelectorAll('.element-icon').forEach(icon => {
        icon.addEventListener('dragstart', function(e) {
            const elementData = {
                type: this.getAttribute('data-type')
            };
            
            if (elementData.type === 'tv') {
                elementData.tvName = this.getAttribute('data-tv-name');
                elementData.tvType = this.getAttribute('data-tv-type');
                elementData.tvId = this.getAttribute('data-tv-id');
                elementData.tvLabel = this.querySelector('.element-label')?.textContent || 'TV поле';
            }
            
            e.dataTransfer.setData('application/json', JSON.stringify(elementData));
            e.dataTransfer.effectAllowed = 'copy';
            this.classList.add('dragging');
        });
        
        icon.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });

    document.querySelectorAll('.constructor-element').forEach(initDraggableElement);

    workspace.addEventListener('dragover', function(e) {
        e.preventDefault();
        
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('active');
        });
        document.querySelectorAll('.constructor-element').forEach(el => {
            el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
        });
        
        const isDirectlyOverDropZone = e.target.classList.contains('drop-zone');
        
        if (isDirectlyOverDropZone) {
            e.target.classList.add('active');
            const dropEffect = e.dataTransfer.types.includes('application/json') ? 'copy' : 'move';
            e.dataTransfer.dropEffect = dropEffect;
            return;
        }
        
        if (e.dataTransfer.types.includes('text/plain') && 
            e.dataTransfer.getData('text/plain') === 'move' && 
            dragSource) {
            
            const targetElement = e.target.closest('.constructor-element');
            
            if (targetElement && targetElement !== dragSource) {
                invalidateElementCache(dragSource);
                const rect = targetElement.getBoundingClientRect();
                const mouseY = e.clientY;
                const topThreshold = rect.top + 30;
                const bottomThreshold = rect.bottom - 30;
                
                if (mouseY < topThreshold) {
                    targetElement.classList.add('drag-over-top');
                    targetElement.classList.remove('drag-over-bottom');
                    targetElement.classList.add('drag-over');
                } else if (mouseY > bottomThreshold) {
                    targetElement.classList.add('drag-over-bottom');
                    targetElement.classList.remove('drag-over-top');
                    targetElement.classList.add('drag-over');
                }
            }
        }
    });
    
    workspace.addEventListener('dragleave', function(e) {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            document.querySelectorAll('.drop-zone').forEach(zone => {
                zone.classList.remove('active');
            });
            document.querySelectorAll('.constructor-element').forEach(el => {
                el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
            });
        }
    });
    
    workspace.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('active');
        });
        document.querySelectorAll('.constructor-element').forEach(el => {
            el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
        });
        
        const isDirectlyOverDropZone = e.target.classList.contains('drop-zone');
        
        if (isDirectlyOverDropZone) {
            invalidateElementCache(dragSource);
            handleDropToDropZone(e, e.target, dragSource);
            dragSource = null;
            return;
        }
        
        if (e.dataTransfer.types.includes('text/plain') && 
            e.dataTransfer.getData('text/plain') === 'move' && 
            dragSource) {
            
            const targetElement = e.target.closest('.constructor-element');
            
            if (targetElement && targetElement !== dragSource) {
                const rect = targetElement.getBoundingClientRect();
                const mouseY = e.clientY;
                const topThreshold = rect.top + 30;
                const bottomThreshold = rect.bottom - 30;
                
                if (mouseY < topThreshold) {
                    targetElement.parentNode.insertBefore(dragSource, targetElement);
                    selectElement(dragSource);
                    window.constructorApp.updateHtmlOutput();
                    dragSource = null;
                    return;
                } else if (mouseY > bottomThreshold) {
                    targetElement.parentNode.insertBefore(dragSource, targetElement.nextSibling);
                    selectElement(dragSource);
                    window.constructorApp.updateHtmlOutput();
                    dragSource = null;
                    return;
                }
            }
            
            workspace.appendChild(dragSource);
            selectElement(dragSource);
            window.constructorApp.updateHtmlOutput();
            dragSource = null;
            return;
        }
        
        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
            try {
                const elementData = JSON.parse(jsonData);
                if (elementData && elementData.type) {
                    const newElement = createElement(elementData.type, elementData);
                    workspace.appendChild(newElement);
                    selectElement(newElement);
                    window.constructorApp.updateHtmlOutput();
                }
            } catch (error) {
                console.error('Ошибка парсинга данных Drag and Drop:', error);
            }
        }
    }, true);
    
    // Обработка выделения
    workspace.addEventListener('mousedown', function(e) {
        const targetElement = e.target.closest('.constructor-element');
        
        if (targetElement && e.button === 0) {
            selectElement(targetElement);
        } else if (!targetElement && e.button === 0) {
            document.querySelectorAll('.constructor-element').forEach(el => {
                el.classList.remove('selected', 'dragging');
            });
            window.constructorApp.setSelectedElement(null);
            updatePropertiesPanel();
        }
    });
}

function handleDropToDropZone(e, dropZone, dragSource) {
    if (dragSource) {
        invalidateElementCache(dragSource);
        if (dragSource === dropZone.closest('.constructor-element')) {
            return;
        }
        
        dropZone.appendChild(dragSource);
        selectElement(dragSource);
        window.constructorApp.updateHtmlOutput();
        return;
    }
    
    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
        try {
            const elementData = JSON.parse(jsonData);
            if (elementData && elementData.type) {
                const newElement = createElement(elementData.type, elementData);
                dropZone.appendChild(newElement);
                selectElement(newElement);
                window.constructorApp.updateHtmlOutput();
            }
        } catch (error) {
            console.error('Ошибка парсинга данных Drag and Drop:', error);
        }
    }
}

function selectElement(element) {
    document.querySelectorAll('.constructor-element').forEach(el => {
        el.classList.remove('selected');
    });
    
    element.classList.add('selected');
    window.constructorApp.setSelectedElement(element);
    updatePropertiesPanel();
}

export function initDraggableElement(element) {
    if (element.classList.contains('constructor-element')) {
        element.setAttribute('draggable', 'true');
        
        element.removeEventListener('dragstart', dragStartHandler);
        element.removeEventListener('dragend', dragEndHandler);
        
        element.addEventListener('dragstart', dragStartHandler);
        element.addEventListener('dragend', dragEndHandler);
    }
}

function dragStartHandler(e) {
    dragSource = this;
    
    e.dataTransfer.setData('text/plain', 'move');
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
    
    setTimeout(() => {
        this.style.opacity = '0.4';
    }, 0);
    
    e.stopPropagation();
}

function dragEndHandler(e) {
    this.style.opacity = '';
    this.classList.remove('dragging');
    dragSource = null;
    
    document.querySelectorAll('.constructor-element').forEach(el => {
        el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    });
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('active');
    });
    
    e.stopPropagation();
}