import { initDraggableElement } from './dragAndDrop.js';

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
    if (typeof DOMPurify === 'undefined') {
        console.error('DOMPurify не загружен. HTML-контент не будет очищен!');
        return dirtyHTML || '';
    }
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
    if (elementData.classes) {
        const userClasses = elementData.classes
            .split(/\s+/)
            .filter(c => c && c !== 'constructor-element');
        if (userClasses.length > 0) {
            element.classList.add(...userClasses);
        }
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
            const rawContent = elementData.content ||
                '<p>Нажмите кнопку редактирования для добавления контента</p>';
            contentHolder.innerHTML = sanitizeHTML(rawContent);
            if (elementData.innerStyles) {
                contentHolder.style.cssText = sanitizeCSS(elementData.innerStyles);
            }
            if (elementData.innerClasses) {
                contentHolder.classList.add(...elementData.innerClasses.split(/\s+/).filter(Boolean));
            }
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
            if (elementData.innerClasses) link.classList.add(...elementData.innerClasses.split(/\s+/).filter(Boolean));
            contentDiv.appendChild(link);
            handleIcon = 'fas fa-link';
            label = 'Ссылка';
            break;
        }
        case 'button': {
            const button = document.createElement('button');
            button.textContent = elementData.content || 'Кнопка';
            if (elementData.innerStyles) button.style.cssText = sanitizeCSS(elementData.innerStyles);
            if (elementData.innerClasses) button.classList.add(...elementData.innerClasses.split(/\s+/).filter(Boolean));
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
            if (elementData.dropZoneClasses) {
                dropZone.classList.add(...elementData.dropZoneClasses.split(/\s+/).filter(c => c !== 'drop-zone'));
            }
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
            const baseUrl = window.formBuilderData?.baseUrl || '';

            if (tvType === 'image') {
                const tvImage = document.createElement('img');
                let imgSrc = elementData.content || `{{$documentObject['${tvName}']}}`;
                const isAbsoluteUrl = /^(https?:|data:image\/|\/|\{\{)/i.test(imgSrc);
                if (!isAbsoluteUrl) {
                    imgSrc = baseUrl + imgSrc.replace(/^\//, '');
                } else if (imgSrc.startsWith('data:') && !imgSrc.startsWith('data:image/')) {
                    imgSrc = 'data:image/svg+xml,' + encodeURIComponent(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="#ccc"/></svg>'
                    );
                }

                tvImage.setAttribute('src', imgSrc);
                tvImage.setAttribute('alt', elementData.alt || tvName);
                tvImage.style.maxWidth = '100%';
                if (elementData.targetStyles) tvImage.style.cssText = sanitizeCSS(elementData.targetStyles);
                if (elementData.targetClasses) tvImage.classList.add(...elementData.targetClasses.split(/\s+/).filter(Boolean));
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
                if (elementData.targetClasses) tvLink.classList.add(...elementData.targetClasses.split(/\s+/).filter(Boolean));
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
                if (elementData.targetClasses) tvText.classList.add(...elementData.targetClasses.split(/\s+/).filter(Boolean));
                contentDiv.appendChild(tvText);
                label = `TV поле ${tvName}`;
            }
            if (elementData.tvId) element.setAttribute('data-tv-id', elementData.tvId);
            if (elementData.tvType) element.setAttribute('data-tv-type', elementData.tvType);
            if (elementData.tvName) element.setAttribute('data-tv-name', elementData.tvName);
            handleIcon = 'fas fa-tag';
            break;
        }
        default: {
            console.warn(`Неизвестный тип элемента: ${type}`);
            const placeholder = document.createElement('div');
            placeholder.textContent = `Неизвестный тип: ${type}`;
            placeholder.style.color = 'red';
            contentDiv.appendChild(placeholder);
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
    return element;
}