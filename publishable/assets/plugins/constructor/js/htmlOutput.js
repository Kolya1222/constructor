export function updateHtmlOutput(workspace, htmlOutput) {
    if (!workspace) return;
    
    const clone = workspace.cloneNode(true);
    
    clone.querySelectorAll('.constructor-element').forEach(el => {
        const contentEl = el.querySelector('.element-content');
        
        if (contentEl) {
            if (el.dataset.type === 'column' || el.dataset.type === 'row') {
                const dropZone = contentEl.querySelector('.drop-zone');
                if (dropZone) {
                    dropZone.classList.remove('drop-zone');

                    Array.from(el.classList).forEach(className => {
                        if (!className.startsWith('constructor-') && 
                            className !== 'selected' && 
                            className !== 'dragging') {
                            dropZone.classList.add(className);
                        }
                    });

                    Array.from(el.style).forEach(prop => {
                        dropZone.style[prop] = el.style[prop];
                    });
                    
                    el.replaceWith(dropZone);
                }
            } else {
                const realElement = contentEl.firstElementChild || contentEl;

                Array.from(el.classList).forEach(className => {
                    if (!className.startsWith('constructor-') && 
                        className !== 'selected' && 
                        className !== 'dragging' &&
                        className !== 'drag-over' &&
                        className !== 'drag-over-top' &&
                        className !== 'drag-over-bottom') {
                        realElement.classList.add(className);
                    }
                });

                Array.from(el.style).forEach(prop => {
                    realElement.style[prop] = el.style[prop];
                });

                Array.from(el.attributes).forEach(attr => {
                    if (!['class', 'style', 'draggable', 'data-type', 'data-index', 'data-config', 'id'].includes(attr.name) &&
                        !attr.name.startsWith('data-constructor-')) {
                        realElement.setAttribute(attr.name, attr.value);
                    }
                });
                
                el.replaceWith(realElement);
            }
        }
    });

    clone.querySelectorAll('[class*="drop-zone"]').forEach(el => {
        el.classList.remove('drop-zone');
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
    let indent = 0;
    let result = '';
    const tokens = html.split(/(<[^>]+>)/);
    const inlineElements = new Set(['a', 'span', 'strong', 'em', 'b', 'i', 'u', 'mark', 'small', 'button', 'input', 'img', 'label']);
    
    tokens.forEach(token => {
        if (token.startsWith('</')) {
            indent--;
            const tagName = token.match(/<\/([^\s>]+)/)?.[1];
            if (!inlineElements.has(tagName)) {
                result += '\n' + '  '.repeat(indent) + token;
            } else {
                result += token;
            }
        } else if (token.startsWith('<')) {
            const tagName = token.match(/<([^\s>]+)/)?.[1];
            const isInline = inlineElements.has(tagName);
            const isSelfClosing = token.includes('/>') || token.match(/<(br|hr|img|input|meta|link)/i);
            
            if (!isInline && !isSelfClosing) {
                result += '\n' + '  '.repeat(indent) + token;
            } else {
                result += token;
            }
            
            if (!isSelfClosing && !token.match(/<(br|hr|img|input|meta|link)/i)) {
                indent++;
            }
        } else if (token.trim() !== '') {
            const prevToken = tokens[tokens.indexOf(token) - 1];
            const tagName = prevToken?.match(/<([^\s>]+)/)?.[1];
            const isInline = inlineElements.has(tagName);
            
            result += isInline ? token : '\n' + '  '.repeat(indent) + token.trim();
        }
    });
    
    return result.trim();
}