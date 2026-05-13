function sanitizeCSS(cssText) {
    return cssText
        .replace(/expression\s*\(/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/-moz-binding/gi, '')
        .replace(/behavior\s*:/gi, '')
        .replace(/@import/gi, '')
        .replace(/url\s*\(\s*["']?\s*javascript\s*:/gi, 'url(');
}

export function updateHtmlOutput(workspace, htmlOutput) {
    if (!workspace) return;
    
    const clone = workspace.cloneNode(true);

    const allElements = Array.from(clone.querySelectorAll('.constructor-element'));
    allElements.reverse();
    
    for (const el of allElements) {
        const contentEl = el.querySelector('.element-content');
        if (!contentEl) continue;
        
        if (el.dataset.type === 'column' || el.dataset.type === 'row') {
            const dropZone = contentEl.querySelector('.drop-zone');
            if (dropZone) {
                dropZone.classList.remove('drop-zone');

                for (const className of el.classList) {
                    if (!className.startsWith('constructor-') && 
                        className !== 'selected' && 
                        className !== 'dragging') {
                        dropZone.classList.add(className);
                    }
                }

                for (const prop of el.style) {
                    const value = el.style[prop];
                    dropZone.style[prop] = prop === 'cssText' ? sanitizeCSS(value) : value;
                }

                if (el.id) dropZone.id = el.id;
                
                el.replaceWith(dropZone);
            }
        } else {
            const realElement = contentEl.firstElementChild || contentEl;
            
            for (const className of el.classList) {
                if (!className.startsWith('constructor-') && 
                    className !== 'selected' && 
                    className !== 'dragging' &&
                    className !== 'drag-over' &&
                    className !== 'drag-over-top' &&
                    className !== 'drag-over-bottom') {
                    realElement.classList.add(className);
                }
            }

            for (const prop of el.style) {
                const value = el.style[prop];
                realElement.style[prop] = prop === 'cssText' ? sanitizeCSS(value) : value;
            }

            for (const attr of el.attributes) {
                const name = attr.name;
                if (name === 'id' || name === 'title' || name.startsWith('data-')) {
                    if (!['data-type', 'data-index', 'data-config'].includes(name) &&
                        !name.startsWith('data-constructor-')) {
                        realElement.setAttribute(name, attr.value);
                    }
                }
            }

            if (el.id) realElement.id = el.id;
            
            el.replaceWith(realElement);
        }
    }

    clone.querySelectorAll('[class*="drop-zone"]').forEach(el => {
        el.classList.remove('drop-zone');
        el.classList.remove('drag-over', 'drag-over-top', 'drag-over-bottom');
    });
    
    let htmlString = clone.innerHTML;
    htmlString = htmlString.replace(/<!--\s*constructor-debug:.*?-->/gs, '');
    const formattedHtml = formatHtmlAdvanced(htmlString);
    htmlOutput.textContent = formattedHtml;
    
    return formattedHtml;
}

function formatHtmlAdvanced(html) {
    const preserveWhitespaceTags = new Set(['pre', 'textarea', 'code', 'samp', 'kbd']);
    
    let indent = 0;
    let result = '';
    const tokens = html.split(/(<[^>]+>)/);
    const inlineElements = new Set([
        'a', 'span', 'strong', 'em', 'b', 'i', 'u', 'mark', 'small', 
        'button', 'input', 'img', 'label', 'sub', 'sup', 'br', 'wbr',
        'code', 'kbd', 'samp', 'var', 'time', 'q', 'cite', 'abbr', 
        'acronym', 'bdo', 'dfn', 'ins', 'del', 's', 'strike'
    ]);
    
    let insidePreserve = false;
    let currentPreserveTag = null;
    
    tokens.forEach(token => {
        if (token.startsWith('<')) {
            const tagMatch = token.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/);
            if (tagMatch) {
                const tagName = tagMatch[1].toLowerCase();
                if (preserveWhitespaceTags.has(tagName)) {
                    if (!token.startsWith('</')) {
                        insidePreserve = true;
                        currentPreserveTag = tagName;
                    } else {
                        insidePreserve = false;
                        currentPreserveTag = null;
                    }
                }
            }
        }
        
        if (token.startsWith('</')) {
            indent = Math.max(0, indent - 1);
            const tagName = token.match(/<\/([^\s>]+)/)?.[1];
            if (tagName && !inlineElements.has(tagName) && !insidePreserve) {
                result += '\n' + '  '.repeat(indent) + token;
            } else {
                result += token;
            }
        } 
        else if (token.startsWith('<')) {
            const tagName = token.match(/<([^\s>]+)/)?.[1];
            const isInline = inlineElements.has(tagName);
            const isSelfClosing = token.includes('/>') || /^<(br|hr|img|input|meta|link|wbr)/i.test(token);
            
            if (!isInline && !isSelfClosing && !insidePreserve) {
                result += '\n' + '  '.repeat(indent) + token;
            } else {
                result += token;
            }
            
            if (!isSelfClosing && !/^<(br|hr|img|input|meta|link|wbr)/i.test(token) && !insidePreserve) {
                indent++;
            }
        } 
        else if (token.trim() !== '') {
            if (insidePreserve) {
                result += token;
            } else {
                const prevToken = tokens[tokens.indexOf(token) - 1];
                const tagName = prevToken?.match(/<([^\s>]+)/)?.[1];
                const isInline = tagName && inlineElements.has(tagName);
                
                if (isInline) {
                    result += token.trim();
                } else {
                    const trimmed = token.trim();
                    if (trimmed) {
                        result += '\n' + '  '.repeat(indent) + trimmed;
                    }
                }
            }
        }
    });
    
    return result.trim();
}