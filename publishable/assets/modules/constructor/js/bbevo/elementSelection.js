import { updatePropertiesPanel } from './propertiesPanel.js';

export function selectElement(element) {
    // Снять выделение со всех элементов
    document.querySelectorAll('.constructor-element').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Выделить выбранный элемент
    element.classList.add('selected');
    window.constructorApp.setSelectedElement(element);
    
    // Обновить панель свойств
    updatePropertiesPanel();
}