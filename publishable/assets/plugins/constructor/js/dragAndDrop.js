import { createElement } from './elementCreation.js';
import { updatePropertiesPanel } from './propertiesPanel.js';
import { invalidateElementCache } from './cache.js';

let dragSource = null;
let lastHighlightedDropZone = null;
let lastHighlightedElement = null;
let lastHighlightedType = null;

export function initDragAndDrop(workspace) {
    document.querySelectorAll('.element-icon').forEach(icon => {
        icon.addEventListener('dragstart', function (e) {
            dragSource = null;
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
        icon.addEventListener('dragend', function () {
            this.classList.remove('dragging');
        });
    });

    document.querySelectorAll('.constructor-element').forEach(initDraggableElement);

    workspace.addEventListener('dragover', function (e) {
        e.preventDefault();
        clearHighlights();

        const dropZone = e.target.closest('.drop-zone');

        if (dragSource && e.dataTransfer.types.includes('text/plain')) {
            if (dropZone) {
                const sourceDropZone = dragSource.parentNode.closest('.drop-zone');
                if (dropZone === sourceDropZone) {
                    highlightClosestElement(e, dropZone);
                } else {
                    highlightClosestElementInDropZone(e, dropZone);
                }
                e.dataTransfer.dropEffect = 'move';
                return;
            }

            const targetElement = e.target.closest('.constructor-element');
            if (targetElement && targetElement !== dragSource) {
                invalidateElementCache(dragSource);
                highlightPositionRelativeToFlex(targetElement, e, targetElement.parentNode);
            }
            e.dataTransfer.dropEffect = 'move';
            return;
        }

        if (dropZone) {
            const targetElement = getClosestConstructorElementInContainer(e, dropZone);
            if (targetElement) {
                highlightPositionRelativeToFlex(targetElement, e, dropZone);
                dropZone.classList.remove('active');
                lastHighlightedDropZone = null;
            } else {
                dropZone.classList.add('active');
                lastHighlightedDropZone = dropZone;
            }
            e.dataTransfer.dropEffect = 'copy';
        } else {
            const targetElement = e.target.closest('.constructor-element');
            if (targetElement) {
                highlightPositionRelativeToFlex(targetElement, e, workspace);
            }
            e.dataTransfer.dropEffect = 'copy';
        }
    });

    workspace.addEventListener('dragleave', function (e) {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            clearHighlights();
        }
    });

    workspace.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearHighlights();

        const dropZone = e.target.closest('.drop-zone');

        if (dragSource && e.dataTransfer.types.includes('text/plain')) {
            if (dropZone) {
                const sourceDropZone = dragSource.parentNode.closest('.drop-zone');
                const targetElement = getClosestConstructorElementInContainer(e, dropZone);
                if (targetElement && targetElement !== dragSource) {
                    insertRelativeToElementFlex(dragSource, targetElement, e, dropZone);
                } else {
                    dropZone.appendChild(dragSource);
                }
                finalizeMove(dragSource);
                dragSource = null;
                return;
            }

            const targetElement = e.target.closest('.constructor-element');
            if (targetElement && targetElement !== dragSource) {
                insertRelativeToElementFlex(dragSource, targetElement, e, targetElement.parentNode);
                finalizeMove(dragSource);
                dragSource = null;
                return;
            }

            workspace.appendChild(dragSource);
            finalizeMove(dragSource);
            dragSource = null;
            return;
        }

        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
            try {
                const elementData = JSON.parse(jsonData);
                if (elementData && elementData.type) {
                    const newElement = createElement(elementData.type, elementData);
                    if (dropZone) {
                        const targetElement = getClosestConstructorElementInContainer(e, dropZone);
                        if (targetElement) {
                            insertRelativeToElementFlex(newElement, targetElement, e, dropZone);
                        } else {
                            dropZone.appendChild(newElement);
                        }
                    } else {
                        const targetElement = e.target.closest('.constructor-element');
                        if (targetElement) {
                            insertRelativeToElementFlex(newElement, targetElement, e, workspace);
                        } else {
                            workspace.appendChild(newElement);
                        }
                    }
                    initDraggableElement(newElement);
                    selectElement(newElement);
                    window.constructorApp.reinitializeEvents();
                }
            } catch (error) {
                console.error('Ошибка парсинга данных Drag and Drop:', error);
            }
        }
        dragSource = null;
    }, true);

    workspace.addEventListener('mousedown', function (e) {
        if (e.target.closest('textarea, input, button, [contenteditable="true"], .quick-format')) return;
        const targetElement = e.target.closest('.constructor-element');
        if (targetElement && e.button === 0) {
            selectElement(targetElement);
        } else if (!targetElement && e.button === 0) {
            document.querySelectorAll('.constructor-element').forEach(el => el.classList.remove('selected', 'dragging'));
            window.constructorApp.setSelectedElement(null);
            updatePropertiesPanel();
        }
    });
}

function clearHighlights() {
    if (lastHighlightedDropZone) {
        lastHighlightedDropZone.classList.remove('active');
        lastHighlightedDropZone = null;
    }
    if (lastHighlightedElement) {
        lastHighlightedElement.classList.remove(
            'drag-over',
            'drag-over-top',
            'drag-over-bottom',
            'drag-over-left',
            'drag-over-right'
        );
        lastHighlightedElement = null;
        lastHighlightedType = null;
    }
}

function getFlexDirection(container) {
    const style = window.getComputedStyle(container);
    const display = style.display;
    if (display !== 'flex' && display !== 'inline-flex') return 'vertical';
    const direction = style.flexDirection;
    if (direction === 'row' || direction === 'row-reverse') return 'horizontal';
    return 'vertical';
}

function getDistanceToCenter(element, e, flexDir) {
    const rect = element.getBoundingClientRect();
    if (flexDir === 'horizontal') {
        const centerX = rect.left + rect.width / 2;
        return Math.abs(e.clientX - centerX);
    } else {
        const centerY = rect.top + rect.height / 2;
        return Math.abs(e.clientY - centerY);
    }
}

function getClosestConstructorElementInContainer(e, container) {
    const children = Array.from(container.children).filter(el =>
        el.classList.contains('constructor-element')
    );
    if (children.length === 0) return null;

    const flexDir = getFlexDirection(container);
    let closest = null;
    let minDist = Infinity;

    children.forEach(child => {
        const dist = getDistanceToCenter(child, e, flexDir);
        if (dist < minDist) {
            minDist = dist;
            closest = child;
        }
    });
    return closest;
}

function highlightPositionRelativeToFlex(targetElement, e, container) {
    const flexDir = getFlexDirection(container);
    const rect = targetElement.getBoundingClientRect();
    const threshold = 30;

    targetElement.classList.remove(
        'drag-over-top', 'drag-over-bottom',
        'drag-over-left', 'drag-over-right',
        'drag-over'
    );

    if (flexDir === 'horizontal') {
        const leftThreshold = rect.left + threshold;
        const rightThreshold = rect.right - threshold;
        if (e.clientX < leftThreshold) {
            targetElement.classList.add('drag-over-left', 'drag-over');
            lastHighlightedElement = targetElement;
            lastHighlightedType = 'left';
        } else if (e.clientX > rightThreshold) {
            targetElement.classList.add('drag-over-right', 'drag-over');
            lastHighlightedElement = targetElement;
            lastHighlightedType = 'right';
        } else {
            lastHighlightedElement = null;
            lastHighlightedType = null;
        }
    } else {
        const topThreshold = rect.top + threshold;
        const bottomThreshold = rect.bottom - threshold;
        if (e.clientY < topThreshold) {
            targetElement.classList.add('drag-over-top', 'drag-over');
            lastHighlightedElement = targetElement;
            lastHighlightedType = 'top';
        } else if (e.clientY > bottomThreshold) {
            targetElement.classList.add('drag-over-bottom', 'drag-over');
            lastHighlightedElement = targetElement;
            lastHighlightedType = 'bottom';
        } else {
            lastHighlightedElement = null;
            lastHighlightedType = null;
        }
    }
}

function highlightClosestElementInDropZone(e, dropZone) {
    const targetElement = getClosestConstructorElementInContainer(e, dropZone);
    if (targetElement && targetElement !== dragSource) {
        highlightPositionRelativeToFlex(targetElement, e, dropZone);
        dropZone.classList.remove('active');
    } else {
        dropZone.classList.add('active');
        lastHighlightedDropZone = dropZone;
    }
}

function highlightClosestElement(e, container) {
    const targetElement = getClosestConstructorElementInContainer(e, container);
    if (targetElement && targetElement !== dragSource) {
        highlightPositionRelativeToFlex(targetElement, e, container);
    }
}

function insertRelativeToElementFlex(dragSource, targetElement, e, container) {
    const flexDir = getFlexDirection(container);
    const rect = targetElement.getBoundingClientRect();
    const threshold = 30;

    if (flexDir === 'horizontal') {
        const leftThreshold = rect.left + threshold;
        const rightThreshold = rect.right - threshold;
        if (e.clientX < leftThreshold) {
            targetElement.parentNode.insertBefore(dragSource, targetElement);
        } else if (e.clientX > rightThreshold) {
            targetElement.parentNode.insertBefore(dragSource, targetElement.nextSibling);
        } else {
            targetElement.parentNode.insertBefore(dragSource, targetElement.nextSibling);
        }
    } else {
        const topThreshold = rect.top + threshold;
        const bottomThreshold = rect.bottom - threshold;
        if (e.clientY < topThreshold) {
            targetElement.parentNode.insertBefore(dragSource, targetElement);
        } else if (e.clientY > bottomThreshold) {
            targetElement.parentNode.insertBefore(dragSource, targetElement.nextSibling);
        } else {
            targetElement.parentNode.insertBefore(dragSource, targetElement.nextSibling);
        }
    }
}

function finalizeMove(element) {
    invalidateElementCache(element);
    initDraggableElement(element);
    selectElement(element);
    window.constructorApp.updateHtmlOutput();
    window.constructorApp.reinitializeEvents();
}

function selectElement(element) {
    document.querySelectorAll('.constructor-element').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    window.constructorApp.setSelectedElement(element);
    updatePropertiesPanel();
}

export function initDraggableElement(element) {
    if (!element || !element.classList.contains('constructor-element')) return;
    element.setAttribute('draggable', 'true');
    element.removeEventListener('dragstart', dragStartHandler);
    element.removeEventListener('dragend', dragEndHandler);
    element.addEventListener('dragstart', dragStartHandler);
    element.addEventListener('dragend', dragEndHandler);
}

function dragStartHandler(e) {
    dragSource = this;
    e.dataTransfer.setData('text/plain', 'move');
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
    setTimeout(() => { this.style.opacity = '0.4'; }, 0);
    e.stopPropagation();
}

function dragEndHandler(e) {
    this.style.opacity = '';
    this.classList.remove('dragging');
    dragSource = null;
    clearHighlights();
    e.stopPropagation();
}