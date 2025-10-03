export function createElement(type, elementData = {}) {
    const element = document.createElement('div');
    element.className = 'constructor-element';
    element.setAttribute('data-type', type);
    
    let content = '';
    let handleIcon = 'bi-square';
    let label = type;
    
    switch (type) {
        case 'text':
            // Используем тег из elementData или 'div' по умолчанию
            const textTag = elementData.textTag || 'div';
            content = `<${textTag}>${elementData.content || 'Текстовый блок. Нажмите дважды, чтобы изменить текст.'}</${textTag}>`;
            handleIcon = 'bi-text-paragraph';
            break;
        case 'link':
            const linkText = elementData.text || 'Текст ссылки';
            const linkHref = elementData.href || '#';
            content = `<a href="${linkHref}">${linkText}</a>`;
            handleIcon = 'bi-link-45deg';
            label = 'Ссылка';
            break;
        case 'button':
            content = '<button class="btn">Кнопка</button>';
            handleIcon = 'bi-ui-buttons';
            break;
        case 'image':
            content = '<img src="" alt="Изображение" style="max-width: 100%;">';
            handleIcon = 'bi-image';
            break;
        case 'row':
            content = '<div class="d-flex flex-row gap-2 p-2 drop-zone"></div>';
            handleIcon = 'bi-layout-split';
            break;
        case 'column':
            content = '<div class="d-flex flex-column gap-2 p-2 drop-zone"></div>';
            handleIcon = 'bi-layout-sidebar-inset';
            break;
        case 'tv':
            // Используем данные из elementData или значения по умолчанию
            const tvName = elementData.tvName || 'tv_field';
            const tvLabel = elementData.tvLabel || 'TV поле';
            content = `{{$documentObject['${tvName}']}}`;
            handleIcon = 'bi-tag';
            label = tvLabel;
            
            // Сохраняем TV-specific данные в элементе
            if (elementData.tvId) element.setAttribute('data-tv-id', elementData.tvId);
            if (elementData.tvType) element.setAttribute('data-tv-type', elementData.tvType);
            if (elementData.tvName) element.setAttribute('data-tv-name', elementData.tvName);
            break;
    }
    
    element.innerHTML = `
        <div class="element-handle">
            <span><i class="bi ${handleIcon}"></i> ${label}</span>
            <i class="bi bi-grip-vertical"></i>
        </div>
        <div class="element-content">${content}</div>
    `;
    
    // Двойной клик для редактирования текста
    if (type === 'text') {
        const contentDiv = element.querySelector('.element-content');
        contentDiv.addEventListener('dblclick', function() {
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
                
                contentDiv.innerHTML = '';
                contentDiv.appendChild(newElement);
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