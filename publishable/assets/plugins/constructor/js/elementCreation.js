import { initDraggableElement } from './dragAndDrop.js';
import { addElementControls } from './elementControls.js';

function sanitizeCSS(cssText) {
    return cssText
        .replace(/expression\s*\(/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/-moz-binding/gi, '')
        .replace(/behavior\s*:/gi, '')
        .replace(/@import/gi, '')
        .replace(/url\s*\(\s*["']?\s*javascript\s*:/gi, 'url(');
}

function sanitizeHTML(dirtyHTML) {
    return DOMPurify.sanitize(dirtyHTML);
}

function isSafeURL(url) {
    return /^(https?:|mailto:|#|\/|\{\{)/i.test(url);
}

export function createElement(type, elementData = {}) {
    const element = document.createElement('div');
    element.className = 'constructor-element';
    element.setAttribute('data-type', type);

    if (elementData.styles) {
        element.style.cssText = sanitizeCSS(elementData.styles);
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
    const contentDiv = document.createElement('div');
    contentDiv.className = 'element-content';

    switch (type) {
        case 'content': {
            const contentHolder = document.createElement('div');
            contentHolder.className = 'content-holder';
            const safeContent = sanitizeHTML(
                elementData.content || '<p>Нажмите кнопку редактирования для добавления контента</p>'
            );
            contentHolder.innerHTML = safeContent;
            if (elementData.innerStyles) contentHolder.style.cssText = sanitizeCSS(elementData.innerStyles);
            if (elementData.innerClasses) contentHolder.className += ' ' + elementData.innerClasses;
            contentDiv.appendChild(contentHolder);
            handleIcon = 'fas fa-file-alt';
            label = 'Контент';
            break;
        }
        case 'link': {
            const link = document.createElement('a');
            link.href = elementData.href || '#';
            link.textContent = elementData.content || 'Текст ссылки';
            if (elementData.target) link.target = elementData.target;
            if (elementData.rel) link.rel = elementData.rel;
            if (elementData.innerStyles) link.style.cssText = sanitizeCSS(elementData.innerStyles);
            if (elementData.innerClasses) link.className = elementData.innerClasses;
            contentDiv.appendChild(link);
            handleIcon = 'fas fa-link';
            label = 'Ссылка';
            break;
        }
        case 'button': {
            const button = document.createElement('button');
            button.textContent = elementData.content || 'Кнопка';
            if (elementData.innerStyles) button.style.cssText = sanitizeCSS(elementData.innerStyles);
            if (elementData.innerClasses) button.className = elementData.innerClasses;
            if (elementData.buttonType) button.type = elementData.buttonType;
            if (elementData.disabled) button.disabled = true;
            contentDiv.appendChild(button);
            handleIcon = 'fas fa-square';
            break;
        }
        case 'row':
        case 'column': {
            const dropZone = document.createElement('div');
            dropZone.classList.add('drop-zone');
            dropZone.style.display = 'flex';
            dropZone.style.flexDirection = type === 'row' ? 'row' : 'column';
            dropZone.style.gap = '16px';
            dropZone.style.padding = '12px';
            if (elementData.dropZoneClasses) dropZone.className = elementData.dropZoneClasses + ' drop-zone';
            if (elementData.dropZoneStyles) {
                dropZone.style.cssText = sanitizeCSS(elementData.dropZoneStyles);
            }
            contentDiv.appendChild(dropZone);
            handleIcon = type === 'row' ? 'fas fa-grip-lines' : 'fas fa-columns';
            break;
        }
        case 'tv': {
            const tvName = elementData.tvName || 'tv_field';
            const tvType = elementData.tvType || 'text';
            if (tvType === 'image') {
                const tvImage = document.createElement('img');
                let imgSrc = elementData.content || `{{$documentObject['${tvName}']}}`;
                const isSafeSrc = /^(https?:|data:image\/|\/|\{\{)/i.test(imgSrc);
                if (!isSafeSrc && imgSrc.startsWith('data:')) {
                    imgSrc = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>';
                } else if (!isSafeSrc) {
                    imgSrc = window.formBuilderData?.baseUrl + imgSrc;
                }
                tvImage.setAttribute('src', imgSrc);
                tvImage.setAttribute('alt', elementData.alt || tvName);
                tvImage.style.maxWidth = '100%';
                if (elementData.targetStyles) tvImage.style.cssText = sanitizeCSS(elementData.targetStyles);
                if (elementData.targetClasses) tvImage.className = elementData.targetClasses;
                contentDiv.appendChild(tvImage);
                label = `TV Image ${tvName}`;
            } else if (tvType === 'file' || tvType === 'url' || tvType === 'email') {
                const tvLink = document.createElement('a');
                let href = elementData.content || `{{$documentObject['${tvName}']}}`;
                if (tvType === 'email') href = `mailto:${href.replace(/^mailto:/, '')}`;
                if (!isSafeURL(href)) href = '#';
                tvLink.href = href;
                tvLink.textContent = elementData.content || (tvType === 'file' ? `Скачать ${tvName}` : tvName);
                tvLink.target = '_blank';
                if (elementData.targetStyles) tvLink.style.cssText = sanitizeCSS(elementData.targetStyles);
                if (elementData.targetClasses) tvLink.className = elementData.targetClasses;
                contentDiv.appendChild(tvLink);
                label = tvType === 'file' ? `TV File ${tvName}` : `TV Link ${tvName}`;
            } else if (tvType === 'checkbox') {
                const tvCheckbox = document.createElement('input');
                tvCheckbox.type = 'checkbox';
                tvCheckbox.disabled = true;
                tvCheckbox.checked = elementData.content === '1' || elementData.content === 'true';
                const labelEl = document.createElement('span');
                labelEl.textContent = ` ${tvName}`;
                labelEl.style.marginLeft = '5px';
                if (elementData.targetStyles) tvCheckbox.style.cssText = sanitizeCSS(elementData.targetStyles);
                contentDiv.appendChild(tvCheckbox);
                contentDiv.appendChild(labelEl);
                label = `TV Checkbox ${tvName}`;
            } else {
                const tvText = document.createElement('span');
                tvText.textContent = elementData.content || `{{$documentObject['${tvName}']}}`;
                if (elementData.targetStyles) tvText.style.cssText = sanitizeCSS(elementData.targetStyles);
                if (elementData.targetClasses) tvText.className = elementData.targetClasses;
                contentDiv.appendChild(tvText);
                label = `TV поле ${tvName}`;
            }
            if (elementData.tvId) element.setAttribute('data-tv-id', elementData.tvId);
            if (elementData.tvType) element.setAttribute('data-tv-type', elementData.tvType);
            if (elementData.tvName) element.setAttribute('data-tv-name', elementData.tvName);
            handleIcon = 'fas fa-tag';
            break;
        }
    }

    const handle = document.createElement('div');
    handle.className = 'element-handle';
    const labelSpan = document.createElement('span');
    const iconEl = document.createElement('i');
    iconEl.className = handleIcon;
    labelSpan.appendChild(iconEl);
    labelSpan.appendChild(document.createTextNode(' ' + label));
    const gripIcon = document.createElement('i');
    gripIcon.className = 'fas fa-grip-vertical';
    handle.appendChild(labelSpan);
    handle.appendChild(gripIcon);
    element.appendChild(handle);
    element.appendChild(contentDiv);
    initDraggableElement(element);
    addElementControls(element);
    return element;
}