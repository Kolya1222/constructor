export function updateHtmlOutput(workspace, htmlOutput) {
    if (!workspace) return;
    
    const clone = workspace.cloneNode(true);
    
    clone.querySelectorAll('.constructor-element').forEach(el => {
        const contentEl = el.querySelector('.element-content');
        
        if (contentEl) {
            const realElement = contentEl.firstElementChild || contentEl;
            
            // 1. Переносим классы
            Array.from(el.classList).forEach(className => {
                if (!className.startsWith('constructor-') && 
                    className !== 'selected' && 
                    className !== 'drop-zone' &&
                    className !== 'dragging') {
                    realElement.classList.add(className);
                }
            });
            
            // 2. Переносим стили (по одному свойству)
            Array.from(el.style).forEach(prop => {
                realElement.style[prop] = el.style[prop];
            });
            
            // 3. Переносим атрибуты
            Array.from(el.attributes).forEach(attr => {
                if (!['class', 'style', 'draggable', 'data-type'].includes(attr.name)) {
                    realElement.setAttribute(attr.name, attr.value);
                }
            });
            
            el.replaceWith(realElement);
        }
    });
    
    const htmlString = clone.innerHTML
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
    
    const formattedHtml = formatHtml(htmlString);
    htmlOutput.textContent = formattedHtml;
    
    return formattedHtml;
}

function formatHtml(html) {
    // Улучшенная функция для форматирования HTML с отступами
    let indent = 0;
    let result = '';
    const tokens = html.split(/(<[^>]+>)/);
    const inlineElements = new Set(['a', 'span', 'strong', 'em', 'b', 'i', 'u', 'mark', 'small', 'button', 'input', 'img']);
    
    tokens.forEach(token => {
        if (token.startsWith('</')) {
            indent--;
            if (!inlineElements.has(token.match(/<\/([^\s>]+)/)?.[1])) {
                result += '\n' + '  '.repeat(indent) + token;
            } else {
                result += token;
            }
        } else if (token.startsWith('<')) {
            const tagName = token.match(/<([^\s>]+)/)?.[1];
            const isInline = inlineElements.has(tagName);
            
            if (!isInline) {
                result += '\n' + '  '.repeat(indent) + token;
            } else {
                result += token;
            }
            
            if (!token.includes('/>') && !token.match(/<(br|hr|img|input|meta|link)/i)) {
                indent++;
            }
        } else if (token.trim() !== '') {
            const isInline = inlineElements.has(tokens[tokens.indexOf(token) - 1]?.match(/<([^\s>]+)/)?.[1]);
            result += isInline ? token : '\n' + '  '.repeat(indent) + token;
        }
    });
    
    return result.trim();
}