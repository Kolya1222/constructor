import { invalidateElementCache } from './cache.js';

export function initRichTextEditor(element) {
    const contentDiv = element.querySelector('.element-content');
    if (!contentDiv) return;
    
    const contentHolder = contentDiv.querySelector('.content-holder') || contentDiv.firstElementChild;
    if (!contentHolder) return;
    const elementState = {
        content: contentHolder.innerHTML,
        styles: {
            element: element.style.cssText,
            contentHolder: contentHolder.style.cssText,
            contentDiv: contentDiv.style.cssText
        },
        classes: {
            element: element.className,
            contentHolder: contentHolder.className,
            contentDiv: contentDiv.className
        },
        attributes: {},
        tvData: {}
    };
    Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
            elementState.attributes[attr.name] = attr.value;
        }
    });

    if (element.dataset.tvId) elementState.tvData.tvId = element.dataset.tvId;
    if (element.dataset.tvName) elementState.tvData.tvName = element.dataset.tvName;
    if (element.dataset.tvType) elementState.tvData.tvType = element.dataset.tvType;

    element.dataset.editorState = JSON.stringify(elementState);

    const editorId = 'tinymce_' + Math.random().toString(36).substr(2, 9);

    contentDiv.innerHTML = `<textarea id="${editorId}" class="richtext">${elementState.content}</textarea>`;

    if (elementState.classes.contentDiv) {
        contentDiv.className = elementState.classes.contentDiv;
    }
    if (elementState.styles.contentDiv) {
        contentDiv.style.cssText = elementState.styles.contentDiv;
    }
    
    element.classList.add('editing');

    initTinyMCE(contentDiv.querySelector('textarea.richtext'), element, editorId);
    
    setTimeout(() => {
        setupClickOutsideHandler(element);
    }, 100);
}

function initTinyMCE(textarea, element, editorId) {
    if (typeof tinymce === 'undefined') {
        console.warn('Не загружен TinyMCE');
        return;
    }

    let editorConfig = {};
    if (window.config_tinymce4_custom) {
        editorConfig = JSON.parse(JSON.stringify(window.config_tinymce4_custom));
    } else if (window.config_tinymce4_evolution) {
        editorConfig = JSON.parse(JSON.stringify(window.config_tinymce4_evolution));
    }
    
    const config = {
        ...editorConfig,
        selector: `#${editorId}`,
        setup: function(editor) {
            if (editorConfig.setup) {
                editorConfig.setup(editor);
            }
            
            editor.on('blur', function() {
                saveTinyMCEContent(editor, element);
            });
            
            editor.on('keydown', function(e) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    saveTinyMCEContent(editor, element);
                }
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    saveTinyMCEContent(editor, element);
                }
            });
            
            editor.on('change', function() {
                if (typeof documentDirty !== 'undefined') {
                    documentDirty = true;
                }
            });
        }
    };
    
    tinymce.init(config);
}

function setupClickOutsideHandler(element) {
    if (element.dataset.outsideHandler) {
        document.removeEventListener('mousedown', window[element.dataset.outsideHandler]);
        delete window[element.dataset.outsideHandler];
    }
    
    const handlerName = 'outsideClick_' + Math.random().toString(36).substr(2, 9);
    
    window[handlerName] = function(e) {
        if (!element.contains(e.target) && 
            !e.target.closest('.mce-container') && 
            !e.target.closest('.tox-tinymce')) {
            
            const contentDiv = element.querySelector('.element-content');
            const textarea = contentDiv?.querySelector('textarea.richtext');
            
            if (textarea && textarea.id && typeof tinymce !== 'undefined') {
                const editor = tinymce.editors[textarea.id];
                if (editor) {
                    saveTinyMCEContent(editor, element);
                }
            }
        }
    };
    
    element.dataset.outsideHandler = handlerName;
    
    setTimeout(() => {
        document.addEventListener('mousedown', window[handlerName]);
    }, 200);
}

function saveTinyMCEContent(editor, element) {
    const content = editor.getContent();
    const contentDiv = element.querySelector('.element-content');
    
    if (!contentDiv) return;

    const savedState = JSON.parse(element.dataset.editorState || '{}');

    const newContentHolder = document.createElement('div');
    newContentHolder.className = 'content-holder';
    newContentHolder.innerHTML = content;

    if (savedState.classes?.contentHolder) {
        newContentHolder.className = savedState.classes.contentHolder;
    }
    if (savedState.styles?.contentHolder) {
        newContentHolder.style.cssText = savedState.styles.contentHolder;
    }

    contentDiv.innerHTML = '';
    contentDiv.appendChild(newContentHolder);

    if (savedState.classes?.contentDiv) {
        contentDiv.className = savedState.classes.contentDiv;
    }
    if (savedState.styles?.contentDiv) {
        contentDiv.style.cssText = savedState.styles.contentDiv;
    }

    if (savedState.classes?.element) {
        element.className = savedState.classes.element;
    }
    if (savedState.styles?.element) {
        element.style.cssText = savedState.styles.element;
    }

    if (savedState.attributes) {
        Object.entries(savedState.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    if (savedState.tvData) {
        if (savedState.tvData.tvId) element.dataset.tvId = savedState.tvData.tvId;
        if (savedState.tvData.tvName) element.dataset.tvName = savedState.tvData.tvName;
        if (savedState.tvData.tvType) element.dataset.tvType = savedState.tvData.tvType;
    }
    
    element.classList.remove('editing');
    delete element.dataset.editorState;
    invalidateElementCache(element);
    window.constructorApp.updateHtmlOutput();
    window.constructorApp.updatePropertiesPanel();
}

// Объединяем панель свойств и быстрые настройки
export function syncPropertiesWithElement(element) {
    const contentDiv = element.querySelector('.element-content');
    const contentHolder = contentDiv?.querySelector('.content-holder') || contentDiv?.firstElementChild;
    
    if (!contentHolder) return;
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes') {
                if (mutation.attributeName === 'style') {
                    contentHolder.style.cssText = element.style.cssText;
                }
                if (mutation.attributeName === 'class') {
                    contentHolder.className = contentHolder.className + ' ' + 
                        Array.from(element.classList)
                            .filter(c => !c.startsWith('constructor-') && c !== 'selected')
                            .join(' ');
                }
            }
        });
    });
    
    observer.observe(element, {
        attributes: true,
        attributeFilter: ['style', 'class']
    });
}

export function destroyRichTextEditor(element) {
    if (element.dataset.outsideHandler) {
        document.removeEventListener('mousedown', window[element.dataset.outsideHandler]);
        delete window[element.dataset.outsideHandler];
        delete element.dataset.outsideHandler;
    }
    
    const contentDiv = element.querySelector('.element-content');
    if (!contentDiv) return;
    
    const textarea = contentDiv.querySelector('textarea.richtext');
    if (textarea && textarea.id && typeof tinymce !== 'undefined' && tinymce.editors[textarea.id]) {
        tinymce.editors[textarea.id].destroy();
    }
    
    element.classList.remove('editing');
}