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
        duplicateSelectedElement: duplicateSelected
    };
    
    // Инициализация модулей
    initDragAndDrop(workspace);
    initPropertiesPanel();
    updateHtmlOutput(workspace, htmlOutput);
    initContextMenu(contextMenu);
    
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
});