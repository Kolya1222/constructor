import { updatePropertiesPanel } from './propertiesPanel.js';

export function removeSelectedElement() {
    const selectedElement = window.constructorApp.getSelectedElement();
    if (selectedElement && selectedElement.parentNode) {
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
        // Показать уведомление
        const originalText = copyHtmlBtn.innerHTML;
        copyHtmlBtn.innerHTML = '<i class="bi bi-check"></i> Скопировано';
        
        setTimeout(() => {
            copyHtmlBtn.innerHTML = originalText;
        }, 2000);
    });
}

export function exportHtml() {
    const htmlOutput = document.getElementById('html-output');
    const html = htmlOutput.textContent;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layout.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function clearWorkspace() {
    const workspace = window.constructorApp.workspace;
    if (confirm('Вы уверены, что хотите очистить рабочую область?')) {
        workspace.innerHTML = '';
        window.constructorApp.setSelectedElement(null);
        updatePropertiesPanel();
        window.constructorApp.updateHtmlOutput();
    }
}