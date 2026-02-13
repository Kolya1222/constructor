import { initDraggableElement } from './dragAndDrop.js';
import { addElementControls } from './elementControls.js';

export function createElement(type, elementData = {}) {
    const element = document.createElement('div');
    element.className = 'constructor-element';
    element.setAttribute('data-type', type);

    if (elementData.styles) {
        element.style.cssText = elementData.styles;
    }

    if (elementData.classes && elementData.classes !== 'constructor-element') {
        element.className = elementData.classes;
    }

    if (elementData.attributes) {
        Object.entries(elementData.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    
    let handleIcon = 'fas fa-square';
    let label = type;
    let content = '';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'element-content';
    
    switch (type) {
        case 'content':
            const contentHolder = document.createElement('div');
            contentHolder.className = 'content-holder';
            contentHolder.innerHTML = elementData.content || '<p>Нажмите кнопку редактирования для добавления контента</p>';

            if (elementData.innerStyles) {
                contentHolder.style.cssText = elementData.innerStyles;
            }
            if (elementData.innerClasses) {
                contentHolder.className = contentHolder.className + ' ' + elementData.innerClasses;
            }
            
            contentDiv.appendChild(contentHolder);
            handleIcon = 'fas fa-file-alt';
            label = 'Контент';
            break;
            
        case 'link':
            const link = document.createElement('a');
            link.href = elementData.href || '#';
            link.textContent = elementData.content || 'Текст ссылки';
            
            if (elementData.target) link.target = elementData.target;
            if (elementData.rel) link.rel = elementData.rel;
            if (elementData.innerStyles) link.style.cssText = elementData.innerStyles;
            if (elementData.innerClasses) link.className = elementData.innerClasses;
            
            contentDiv.appendChild(link);
            handleIcon = 'fas fa-link';
            label = 'Ссылка';
            break;
            
        case 'button':
            const button = document.createElement('button');
            button.textContent = elementData.content || 'Кнопка';
            
            if (elementData.innerStyles) button.style.cssText = elementData.innerStyles;
            if (elementData.innerClasses) button.className = elementData.innerClasses;
            
            contentDiv.appendChild(button);
            handleIcon = 'fas fa-square';
            break;
            
        case 'row':
        case 'column':
            const dropZone = document.createElement('div');
            
            if (elementData.dropZoneClasses) {
                dropZone.className = elementData.dropZoneClasses;
            }

            dropZone.style.display = 'flex';
            if (type === 'row') {
                dropZone.style.flexDirection = 'row';
            } else {
                dropZone.style.flexDirection = 'column';
            }
            dropZone.style.gap = '16px';
            dropZone.style.padding = '12px';

            if (elementData.dropZoneStyles) {
                dropZone.style.cssText = elementData.dropZoneStyles;
            }

            dropZone.classList.add('drop-zone');
            
            contentDiv.appendChild(dropZone);
            handleIcon = type === 'row' ? 'fas fa-grip-lines' : 'fas fa-columns';
            break;
            
        case 'tv':
            const tvName = elementData.tvName || 'tv_field';
            const tvType = elementData.tvType || 'text';
            
            if (tvType === 'image') {
                const tvImage = document.createElement('img');
                let imgSrc = elementData.content || `{{$documentObject['${tvName}']}}`;
                
                if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('https') && 
                    !imgSrc.startsWith('{{') && !imgSrc.startsWith('/') && !imgSrc.startsWith('data:')) {
                    imgSrc = window.formBuilderData?.baseUrl + imgSrc;
                }
                
                tvImage.setAttribute('src', imgSrc);
                tvImage.setAttribute('alt', elementData.alt || tvName);
                tvImage.style.maxWidth = '100%';
                
                if (elementData.targetStyles) tvImage.style.cssText = elementData.targetStyles;
                if (elementData.targetClasses) tvImage.className = elementData.targetClasses;
                
                contentDiv.appendChild(tvImage);
                label = `TV Image ${tvName}`;
            } else if (tvType === 'file') {
                const tvLink = document.createElement('a');
                tvLink.href = elementData.content || `{{$documentObject['${tvName}']}}`;
                tvLink.textContent = `Скачать ${tvName}`;
                tvLink.target = '_blank';
                
                if (elementData.targetStyles) {
                    tvLink.style.cssText = elementData.targetStyles;
                }
                if (elementData.targetClasses) {
                    tvLink.className = elementData.targetClasses;
                }
                
                contentDiv.appendChild(tvLink);
                label = `TV File ${tvName}`;
            } else if (tvType === 'url' || tvType === 'email') {
                const tvLink = document.createElement('a');
                tvLink.href = elementData.content || `{{$documentObject['${tvName}']}}`;
                tvLink.textContent = elementData.content || tvName;
                
                if (tvType === 'email') {
                    tvLink.href = `mailto:${tvLink.href}`;
                }
                
                if (elementData.targetStyles) {
                    tvLink.style.cssText = elementData.targetStyles;
                }
                if (elementData.targetClasses) {
                    tvLink.className = elementData.targetClasses;
                }
                
                contentDiv.appendChild(tvLink);
                label = `TV Link ${tvName}`;
            } else if (tvType === 'checkbox') {
                const tvCheckbox = document.createElement('input');
                tvCheckbox.type = 'checkbox';
                tvCheckbox.disabled = true;
                tvCheckbox.checked = elementData.content === '1' || elementData.content === 'true';
                
                const labelEl = document.createElement('span');
                labelEl.textContent = ` ${tvName}`;
                labelEl.style.marginLeft = '5px';
                
                if (elementData.targetStyles) {
                    tvCheckbox.style.cssText = elementData.targetStyles;
                }
                
                contentDiv.appendChild(tvCheckbox);
                contentDiv.appendChild(labelEl);
                label = `TV Checkbox ${tvName}`;
            } else {
                const tvText = document.createElement('span');
                tvText.textContent = elementData.content || `{{$documentObject['${tvName}']}}`;
                
                if (elementData.targetStyles) {
                    tvText.style.cssText = elementData.targetStyles;
                }
                if (elementData.targetClasses) {
                    tvText.className = elementData.targetClasses;
                }
                
                contentDiv.appendChild(tvText);
                label = `TV поле ${tvName}`;
            }
            
            if (elementData.tvId) element.setAttribute('data-tv-id', elementData.tvId);
            if (elementData.tvType) element.setAttribute('data-tv-type', elementData.tvType);
            if (elementData.tvName) element.setAttribute('data-tv-name', elementData.tvName);
            
            handleIcon = 'fas fa-tag';
            break;
    }

    const handle = document.createElement('div');
    handle.className = 'element-handle';
    handle.innerHTML = `
        <span><i class="${handleIcon}"></i> ${label}</span>
        <i class="fas fa-grip-vertical"></i>
    `;
    
    element.appendChild(handle);
    element.appendChild(contentDiv);

    initDraggableElement(element);
    addElementControls(element);
    
    return element;
}