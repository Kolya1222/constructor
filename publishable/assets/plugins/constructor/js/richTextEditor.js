import { invalidateElementCache } from './cache.js';

function sanitizeHTML(dirtyHTML) {
    return DOMPurify.sanitize(dirtyHTML);
}

export function initRichTextEditor(element) {
    if (element.classList.contains('editing')) {
        console.warn('Редактор уже активен для этого элемента');
        return;
    }
    
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
    
    const editorId = 'tinymce_' + Math.random().toString(36).substring(2, 11);
    const safeContent = sanitizeHTML(elementState.content);
    contentDiv.innerHTML = `<textarea id="${editorId}" class="richtext">${safeContent}</textarea>`;
    
    if (elementState.classes.contentDiv) {
        contentDiv.className = elementState.classes.contentDiv;
    }
    if (elementState.styles.contentDiv) {
        contentDiv.style.cssText = elementState.styles.contentDiv;
    }
    
    element.classList.add('editing');

    if (window.constructorApp && window.constructorApp.lockPropertiesPanel) {
        window.constructorApp.lockPropertiesPanel(true);
    }
    
    initTinyMCE(contentDiv.querySelector('textarea.richtext'), element, editorId);
    
    setTimeout(() => {
        setupClickOutsideHandler(element);
    }, 100);
}

function initTinyMCE(textarea, element, editorId) {
    if (typeof tinymce === 'undefined') {
        console.warn('TinyMCE не загружен');
        return;
    }

    let baseConfig = {};
    if (window.config_tinymce4_custom) {
        baseConfig = { ...window.config_tinymce4_custom };
    } else if (window.config_tinymce4_evolution) {
        baseConfig = { ...window.config_tinymce4_evolution };
    }

    const originalSetup = baseConfig.setup;
    
    const config = {
        ...baseConfig,
        selector: `#${editorId}`,
        setup: function(editor) {
            if (typeof originalSetup === 'function') {
                originalSetup(editor);
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
        }
    };
    
    tinymce.init(config);
}

function setupClickOutsideHandler(element) {
    if (element.dataset.outsideHandler) {
        const oldHandler = window[element.dataset.outsideHandler];
        if (oldHandler) {
            document.removeEventListener('mousedown', oldHandler);
            delete window[element.dataset.outsideHandler];
        }
        delete element.dataset.outsideHandler;
    }
    
    const handlerName = 'outsideClick_' + Math.random().toString(36).substring(2, 11);
    
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
    let content = editor.getContent();
    content = sanitizeHTML(content);
    
    const contentDiv = element.querySelector('.element-content');
    if (!contentDiv) return;
    
    const savedState = JSON.parse(element.dataset.editorState || '{}');

    const newContentHolder = document.createElement('div');
    newContentHolder.className = savedState.classes?.contentHolder || 'content-holder';
    newContentHolder.innerHTML = content;
    
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

    if (window.constructorApp && window.constructorApp.lockPropertiesPanel) {
        window.constructorApp.lockPropertiesPanel(false);
    }
    
    invalidateElementCache(element);
    if (window.constructorApp && window.constructorApp.updateHtmlOutput) {
        window.constructorApp.updateHtmlOutput();
    }
    if (window.constructorApp && window.constructorApp.updatePropertiesPanel) {
        window.constructorApp.updatePropertiesPanel();
    }
}

export function destroyRichTextEditor(element) {
    if (element.dataset.outsideHandler) {
        const handler = window[element.dataset.outsideHandler];
        if (handler) {
            document.removeEventListener('mousedown', handler);
            delete window[element.dataset.outsideHandler];
        }
        delete element.dataset.outsideHandler;
    }
    
    const contentDiv = element.querySelector('.element-content');
    if (!contentDiv) return;
    
    const textarea = contentDiv.querySelector('textarea.richtext');
    if (textarea && textarea.id && typeof tinymce !== 'undefined' && tinymce.editors[textarea.id]) {
        try {
            tinymce.editors[textarea.id].destroy();
        } catch (e) {
            console.warn('Ошибка при уничтожении редактора TinyMCE:', e);
        }
    }

    if (element.classList.contains('editing')) {
        element.classList.remove('editing');
        if (window.constructorApp && window.constructorApp.lockPropertiesPanel) {
            window.constructorApp.lockPropertiesPanel(false);
        }
        delete element.dataset.editorState;
    }
}