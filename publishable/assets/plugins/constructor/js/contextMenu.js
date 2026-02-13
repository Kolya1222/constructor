import { 
    removeSelectedElement, 
    duplicateSelectedElement 
} from './actions.js';

export function initContextMenu(contextMenu) {
    // Обработка действий контекстного меню
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const selectedElement = window.constructorApp.getSelectedElement();
            
            switch (action) {
                case 'copy':
                    window.constructorApp.setCopiedElement(selectedElement.cloneNode(true));
                    break;
                case 'cut':
                    window.constructorApp.setCopiedElement(selectedElement.cloneNode(true));
                    removeSelectedElement();
                    break;
                case 'paste':
                    const copiedElement = window.constructorApp.getCopiedElement();
                    if (copiedElement) {
                        const clone = copiedElement.cloneNode(true);
                        window.constructorApp.workspace.appendChild(clone);
                        window.constructorApp.setSelectedElement(clone);
                    }
                    break;
                case 'duplicate':
                    duplicateSelectedElement();
                    break;
                case 'delete':
                    removeSelectedElement();
                    break;
                case 'move-up':
                    if (selectedElement && selectedElement.previousElementSibling) {
                        selectedElement.parentNode.insertBefore(selectedElement, selectedElement.previousElementSibling);
                    }
                    break;
                case 'move-down':
                    if (selectedElement && selectedElement.nextElementSibling) {
                        selectedElement.parentNode.insertBefore(selectedElement.nextElementSibling, selectedElement);
                    }
                    break;
            }
            
            window.constructorApp.updateHtmlOutput();
            hideContextMenu(contextMenu);
        });
    });
}

export function showContextMenu(e, contextMenu) {
    e.preventDefault();
    const targetElement = e.target.closest('.constructor-element');
    if (targetElement) {
        window.constructorApp.setSelectedElement(targetElement);
    }

    let mouseX = e.clientX;
    let mouseY = e.clientY;

    const menuWidth = contextMenu.offsetWidth || 200;
    const menuHeight = contextMenu.offsetHeight || 200;
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

    contextMenu.style.display = 'block';
    contextMenu.style.left = mouseX + 'px';
    contextMenu.style.top = mouseY + 'px';
}

export function hideContextMenu(contextMenu) {
    contextMenu.style.display = 'none';
}