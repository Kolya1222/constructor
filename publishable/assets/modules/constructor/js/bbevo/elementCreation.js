export function createElement(type) {
    const element = document.createElement('div');
    element.className = 'constructor-element';
    element.setAttribute('data-type', type);
    
    let content = '';
    let handleIcon = 'bi-square';
    
    switch (type) {
        case 'div':
            content = 'Контейнер DIV';
            handleIcon = 'bi-square';
            break;
        case 'text':
            content = 'Текстовый блок. Нажмите дважды, чтобы изменить текст.';
            handleIcon = 'bi-text-paragraph';
            break;
        case 'button':
            content = '<button class="btn">Кнопка</button>';
            handleIcon = 'bi-ui-buttons';
            break;
        case 'image':
            content = '<img src="" alt="Изображение" style="max-width: 100%;">';
            handleIcon = 'bi-image';
            break;
        case 'section':
            content = '<div class="drop-zone" style="min-height: 100px;"></div>';
            handleIcon = 'bi-collection';
            break;
        case 'row':
            content = '<div class="d-flex flex-row gap-2 p-2 drop-zone"></div>';
            handleIcon = 'bi-layout-split';
            break;
        case 'column':
            content = '<div class="d-flex flex-column gap-2 p-2 drop-zone"></div>';
            handleIcon = 'bi-layout-sidebar-inset';
            break;
    }
    
    element.innerHTML = `
        <div class="element-handle">
            <span><i class="bi ${handleIcon}"></i> ${type}</span>
            <i class="bi bi-grip-vertical"></i>
        </div>
        <div class="element-content">${content}</div>
    `;
    
    // Двойной клик для редактирования текста
    if (type === 'text') {
        const contentDiv = element.querySelector('.element-content');
        contentDiv.addEventListener('dblclick', function() {
            const currentText = this.textContent;
            this.innerHTML = `<textarea class="form-control">${currentText}</textarea>`;
            const textarea = this.querySelector('textarea');
            textarea.focus();
            
            textarea.addEventListener('blur', function() {
                contentDiv.textContent = this.value;
                window.constructorApp.updateHtmlOutput();
            });
            
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    this.blur();
                }
            });
        });
    }
    
    return element;
}