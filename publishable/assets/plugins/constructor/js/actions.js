import { updatePropertiesPanel } from './propertiesPanel.js';
import { destroyElementControls } from './elementControls.js';
import { invalidateElementCache } from './cache.js';

export function removeSelectedElement() {
    const selectedElement = window.constructorApp.getSelectedElement();
    if (selectedElement && selectedElement.parentNode) {
        invalidateElementCache(selectedElement);
        destroyElementControls(selectedElement);
        selectedElement.parentNode.removeChild(selectedElement);
        window.constructorApp.setSelectedElement(null);
        updatePropertiesPanel();
        window.constructorApp.updateHtmlOutput();
    }
}

export function duplicateSelectedElement() {
    const selectedElement = window.constructorApp.getSelectedElement();
    if (selectedElement) {
        const clone = selectedElement.cloneNode(true);
        invalidateElementCache(clone);
        selectedElement.parentNode.insertBefore(clone, selectedElement.nextSibling);
        window.constructorApp.setSelectedElement(clone);
        window.constructorApp.updateHtmlOutput();
    }
}

export function copyHtmlToClipboard() {
    const htmlOutput = document.getElementById('html-output');
    const html = htmlOutput.textContent;
    const copyHtmlBtn = document.getElementById('copy-html');
    
    navigator.clipboard.writeText(html).then(() => {
        const originalText = copyHtmlBtn.innerHTML;
        copyHtmlBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано';
        
        setTimeout(() => {
            copyHtmlBtn.innerHTML = originalText;
        }, 2000);
    });
}