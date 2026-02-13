import { invalidateElementCache } from './cache.js';

export const elementPropertiesConfig = {
    // Общие свойства для всех элементов
    common: {
        id: { type: 'text', label: 'ID элемента', category: 'general', placeholder: 'example-id' },
        classes: { type: 'text', label: 'Дополнительные классы', category: 'general', placeholder: 'class1 class2' },
        title: { type: 'text', label: 'Подсказка (title)', category: 'general', placeholder: 'Текст подсказки' },
        dataAttributes: { type: 'text', label: 'Data-атрибуты', category: 'general', placeholder: 'name:value' },
        
        // Размеры
        width: { type: 'text', label: 'Ширина', category: 'size', placeholder: '100px или 50%' },
        height: { type: 'text', label: 'Высота', category: 'size', placeholder: '100px или 50%' },
        minWidth: { type: 'text', label: 'Мин. ширина', category: 'size', placeholder: '100px' },
        minHeight: { type: 'text', label: 'Мин. высота', category: 'size', placeholder: '100px' },
        maxWidth: { type: 'text', label: 'Макс. ширина', category: 'size', placeholder: '100%' },
        maxHeight: { type: 'text', label: 'Макс. высота', category: 'size', placeholder: '100%' },
        
        // Отступы
        padding: { type: 'text', label: 'Внутренний отступ', category: 'spacing', placeholder: '10px' },
        paddingTop: { type: 'text', label: 'Отступ сверху', category: 'spacing', placeholder: '10px' },
        paddingRight: { type: 'text', label: 'Отступ справа', category: 'spacing', placeholder: '10px' },
        paddingBottom: { type: 'text', label: 'Отступ снизу', category: 'spacing', placeholder: '10px' },
        paddingLeft: { type: 'text', label: 'Отступ слева', category: 'spacing', placeholder: '10px' },
        margin: { type: 'text', label: 'Внешний отступ', category: 'spacing', placeholder: '10px' },
        marginTop: { type: 'text', label: 'Margin сверху', category: 'spacing', placeholder: '10px' },
        marginRight: { type: 'text', label: 'Margin справа', category: 'spacing', placeholder: '10px' },
        marginBottom: { type: 'text', label: 'Margin снизу', category: 'spacing', placeholder: '10px' },
        marginLeft: { type: 'text', label: 'Margin слева', category: 'spacing', placeholder: '10px' },
        
        // Стили фона и границ
        backgroundColor: { type: 'color', label: 'Цвет фона', category: 'style' },
        opacity: { type: 'range', label: 'Прозрачность', category: 'style', min: 0, max: 1, step: 0.1 },
        border: { type: 'text', label: 'Граница', category: 'style', placeholder: '1px solid #000' },
        borderRadius: { type: 'text', label: 'Скругление', category: 'style', placeholder: '5px' },
        boxShadow: { type: 'text', label: 'Тень', category: 'style', placeholder: '2px 2px 5px rgba(0,0,0,0.3)' },
        
        // Позиционирование
        display: { type: 'select', label: 'Display', category: 'layout', 
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'block', label: 'Block'},
                {value: 'flex', label: 'Flex'},
                {value: 'inline', label: 'Inline'},
                {value: 'inline-block', label: 'Inline-block'},
                {value: 'none', label: 'None'}
            ] 
        },
        position: { type: 'select', label: 'Position', category: 'layout',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'static', label: 'Static'},
                {value: 'relative', label: 'Relative'},
                {value: 'absolute', label: 'Absolute'},
                {value: 'fixed', label: 'Fixed'},
                {value: 'sticky', label: 'Sticky'}
            ]
        },
        top: { type: 'text', label: 'Top', category: 'layout', placeholder: '10px' },
        right: { type: 'text', label: 'Right', category: 'layout', placeholder: '10px' },
        bottom: { type: 'text', label: 'Bottom', category: 'layout', placeholder: '10px' },
        left: { type: 'text', label: 'Left', category: 'layout', placeholder: '10px' },
        zIndex: { type: 'number', label: 'Z-index', category: 'layout', placeholder: '1' },
        
        // Курсор
        cursor: { type: 'select', label: 'Курсор', category: 'other',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'pointer', label: 'Pointer'},
                {value: 'text', label: 'Text'},
                {value: 'move', label: 'Move'},
                {value: 'not-allowed', label: 'Not-allowed'},
                {value: 'help', label: 'Help'}
            ] 
        }
    },
    
    // Свойства для контентного блока
    content: {
        // Стили текста
        color: { type: 'color', label: 'Цвет текста', category: 'typography' },
        fontFamily: { type: 'text', label: 'Шрифт', category: 'typography', placeholder: 'Arial, sans-serif' },
        fontSize: { type: 'text', label: 'Размер шрифта', category: 'typography', placeholder: '16px' },
        fontWeight: { type: 'select', label: 'Насыщенность', category: 'typography',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'normal', label: 'Normal'},
                {value: 'bold', label: 'Bold'},
                {value: '300', label: 'Light'},
                {value: '400', label: 'Regular'},
                {value: '500', label: 'Medium'},
                {value: '600', label: 'Semi Bold'},
                {value: '700', label: 'Bold'},
                {value: '800', label: 'Extra Bold'},
                {value: '900', label: 'Black'}
            ]
        },
        fontStyle: { type: 'select', label: 'Стиль шрифта', category: 'typography',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'normal', label: 'Normal'},
                {value: 'italic', label: 'Italic'},
                {value: 'oblique', label: 'Oblique'}
            ]
        },
        textAlign: { type: 'select', label: 'Выравнивание', category: 'typography',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'left', label: 'По левому краю'},
                {value: 'center', label: 'По центру'},
                {value: 'right', label: 'По правому краю'},
                {value: 'justify', label: 'По ширине'}
            ]
        },
        lineHeight: { type: 'text', label: 'Межстрочный интервал', category: 'typography', placeholder: '1.5' },
        letterSpacing: { type: 'text', label: 'Межбуквенный интервал', category: 'typography', placeholder: '0px' },
        textDecoration: { type: 'text', label: 'Декорация', category: 'typography', placeholder: 'underline' },
        textShadow: { type: 'text', label: 'Тень текста', category: 'typography', placeholder: '1px 1px 2px #000' }
    },
    
    // Свойства для ссылки
    link: {
        text: { type: 'text', label: 'Текст ссылки', category: 'content', placeholder: 'Текст ссылки' },
        href: { type: 'text', label: 'URL адрес', category: 'content', placeholder: 'https://example.com' },
        target: { type: 'select', label: 'Открывать в', category: 'content',
            options: [
                {value: '_self', label: 'Текущее окно'},
                {value: '_blank', label: 'Новое окно'},
                {value: '_parent', label: 'Родительское окно'},
                {value: '_top', label: 'Верхнее окно'}
            ] 
        },
        title: { type: 'text', label: 'Подсказка', category: 'content', placeholder: 'Описание ссылки' },
        rel: { type: 'select', label: 'Атрибут rel', category: 'content',
            options: [
                {value: '', label: 'Нет'},
                {value: 'nofollow', label: 'Nofollow'},
                {value: 'noopener', label: 'Noopener'},
                {value: 'noreferrer', label: 'Noreferrer'},
                {value: 'external', label: 'External'}
            ] 
        }
    },
    
    // Свойства для кнопки
    button: {
        text: { type: 'text', label: 'Текст кнопки', category: 'content', placeholder: 'Нажми меня' },
        buttonType: { type: 'select', label: 'Тип кнопки', category: 'content',
            options: [
                {value: 'button', label: 'Button'},
                {value: 'submit', label: 'Submit'},
                {value: 'reset', label: 'Reset'}
            ] 
        },
        disabled: { type: 'checkbox', label: 'Отключена', category: 'content' }
    },
    
    // Свойства для строки
    row: {
        gap: { type: 'text', label: 'Расстояние между колонками', category: 'layout', placeholder: '16px' },
        alignItems: { type: 'select', label: 'Выравнивание по вертикали', category: 'layout',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'flex-start', label: 'Сверху'},
                {value: 'center', label: 'По центру'},
                {value: 'flex-end', label: 'Снизу'},
                {value: 'stretch', label: 'Растянуть'}
            ]
        },
        justifyContent: { type: 'select', label: 'Выравнивание по горизонтали', category: 'layout',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'flex-start', label: 'Слева'},
                {value: 'center', label: 'По центру'},
                {value: 'flex-end', label: 'Справа'},
                {value: 'space-between', label: 'Между'},
                {value: 'space-around', label: 'Вокруг'},
                {value: 'space-evenly', label: 'Равномерно'}
            ]
        }
    },
    
    // Свойства для колонки
    column: {
        gap: { type: 'text', label: 'Расстояние между элементами', category: 'layout', placeholder: '16px' },
        alignItems: { type: 'select', label: 'Выравнивание по горизонтали', category: 'layout',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'flex-start', label: 'Слева'},
                {value: 'center', label: 'По центру'},
                {value: 'flex-end', label: 'Справа'},
                {value: 'stretch', label: 'Растянуть'}
            ]
        }
    }
};

// Применение изменений свойства
function applyPropertyChange(propertyName, value) {
    const selectedElement = window.constructorApp.getSelectedElement();
    if (!selectedElement) return;
    invalidateElementCache(selectedElement);
    const elementType = selectedElement.getAttribute('data-type');

    if (elementType === 'content') {
        const contentDiv = selectedElement.querySelector('.element-content');
        const contentHolder = contentDiv?.querySelector('.content-holder') || contentDiv?.firstElementChild;
        
        if (contentHolder) {
            switch (propertyName) {
                case 'id':
                    contentHolder.id = value;
                    break;
                case 'classes':
                    const constructorClasses = Array.from(selectedElement.classList)
                        .filter(c => c.startsWith('constructor-')).join(' ');
                    selectedElement.className = `${constructorClasses} ${value}`.trim();
                    contentHolder.className = 'content-holder';
                    if (value) {
                        value.split(' ').forEach(cls => {
                            if (cls) contentHolder.classList.add(cls);
                        });
                    }
                    break;

                case 'title':
                    contentHolder.title = value;
                    break;

                case 'dataAttributes':
                    if (value) {
                        const [name, val] = value.split(':').map(s => s.trim());
                        if (name) contentHolder.dataset[name] = val || '';
                    }
                    break;

                case 'color':
                case 'fontFamily':
                case 'fontSize':
                case 'fontWeight':
                case 'fontStyle':
                case 'textAlign':
                case 'lineHeight':
                case 'letterSpacing':
                case 'textDecoration':
                case 'textShadow':
                    contentHolder.style[propertyName] = value || '';
                    break;

                case 'backgroundColor':
                case 'opacity':
                case 'border':
                case 'borderRadius':
                case 'boxShadow':
                    contentHolder.style[propertyName] = value || '';
                    break;

                case 'padding':
                case 'paddingTop':
                case 'paddingRight':
                case 'paddingBottom':
                case 'paddingLeft':
                case 'margin':
                case 'marginTop':
                case 'marginRight':
                case 'marginBottom':
                case 'marginLeft':
                    contentHolder.style[propertyName] = value || '';
                    break;

                case 'width':
                case 'height':
                case 'minWidth':
                case 'minHeight':
                case 'maxWidth':
                case 'maxHeight':
                    contentHolder.style[propertyName] = value || '';
                    break;

                case 'display':
                case 'position':
                case 'top':
                case 'right':
                case 'bottom':
                case 'left':
                case 'zIndex':
                case 'cursor':
                    contentHolder.style[propertyName] = value || '';
                    break;
            }
        }
        
        window.constructorApp.updateHtmlOutput();
        return;
    }

    if (elementType === 'row' || elementType === 'column') {
        const dropZone = selectedElement.querySelector('.drop-zone');
        if (dropZone) {
            switch (propertyName) {
                case 'gap':
                    dropZone.style.gap = value || '16px';
                    break;
                case 'alignItems':
                    dropZone.style.alignItems = value || '';
                    break;
                case 'justifyContent':
                    if (elementType === 'row') {
                        dropZone.style.justifyContent = value || '';
                    }
                    break;
                case 'classes':
                    const constructorClasses = Array.from(selectedElement.classList)
                        .filter(c => c.startsWith('constructor-')).join(' ');
                    selectedElement.className = `${constructorClasses} ${value}`.trim();
                    break;
                default:
                    const targetElement = dropZone;
                    switch (propertyName) {
                        case 'id':
                            targetElement.id = value;
                            break;
                        case 'title':
                            targetElement.title = value;
                            break;
                        case 'backgroundColor':
                        case 'opacity':
                        case 'border':
                        case 'borderRadius':
                        case 'boxShadow':
                        case 'padding':
                        case 'margin':
                        case 'width':
                        case 'height':
                            targetElement.style[propertyName] = value || '';
                            break;
                    }
            }
        }
        window.constructorApp.updateHtmlOutput();
        return;
    }

    if (elementType === 'link') {
        const link = selectedElement.querySelector('a');
        if (link) {
            switch (propertyName) {
                case 'text':
                    link.textContent = value;
                    break;
                case 'href':
                    link.href = value;
                    break;
                case 'target':
                    link.target = value;
                    break;
                case 'title':
                    link.title = value;
                    break;
                case 'rel':
                    link.rel = value;
                    break;
                default:
                    const targetElement = link;
                    switch (propertyName) {
                        case 'id':
                            targetElement.id = value;
                            break;
                        case 'classes':
                            targetElement.className = value;
                            break;
                        case 'color':
                        case 'fontSize':
                        case 'fontWeight':
                        case 'textDecoration':
                            targetElement.style[propertyName] = value || '';
                            break;
                    }
            }
        }
        window.constructorApp.updateHtmlOutput();
        return;
    }
    
    // Для кнопки
    if (elementType === 'button') {
        const button = selectedElement.querySelector('button');
        if (button) {
            switch (propertyName) {
                case 'text':
                    button.textContent = value;
                    break;
                case 'buttonType':
                    button.type = value;
                    break;
                case 'disabled':
                    button.disabled = !!value;
                    break;
                default:
                    // Общие свойства
                    const targetElement = button;
                    switch (propertyName) {
                        case 'id':
                            targetElement.id = value;
                            break;
                        case 'classes':
                            targetElement.className = value;
                            break;
                        case 'backgroundColor':
                        case 'color':
                        case 'border':
                        case 'borderRadius':
                        case 'padding':
                        case 'fontSize':
                        case 'fontWeight':
                            targetElement.style[propertyName] = value || '';
                            break;
                    }
            }
        }
        window.constructorApp.updateHtmlOutput();
        return;
    }
}

// Получение значения свойства
function getPropertyValue(propName, element) {
    const elementType = element.getAttribute('data-type');

    if (elementType === 'content') {
        const contentDiv = element.querySelector('.element-content');
        const contentHolder = contentDiv?.querySelector('.content-holder') || contentDiv?.firstElementChild;
        
        if (contentHolder) {
            switch (propName) {
                case 'id':
                    return contentHolder.id || '';
                case 'classes':
                    return Array.from(contentHolder.classList)
                        .filter(c => !c.startsWith('constructor-') && c !== 'content-holder')
                        .join(' ');
                case 'title':
                    return contentHolder.title || '';
                case 'dataAttributes':
                    const dataAttr = Object.keys(contentHolder.dataset)[0];
                    return dataAttr ? `${dataAttr}:${contentHolder.dataset[dataAttr]}` : '';
                case 'color':
                case 'fontFamily':
                case 'fontSize':
                case 'fontWeight':
                case 'fontStyle':
                case 'textAlign':
                case 'lineHeight':
                case 'letterSpacing':
                case 'textDecoration':
                case 'textShadow':
                case 'backgroundColor':
                case 'opacity':
                case 'border':
                case 'borderRadius':
                case 'boxShadow':
                case 'padding':
                case 'paddingTop':
                case 'paddingRight':
                case 'paddingBottom':
                case 'paddingLeft':
                case 'margin':
                case 'marginTop':
                case 'marginRight':
                case 'marginBottom':
                case 'marginLeft':
                case 'width':
                case 'height':
                case 'minWidth':
                case 'minHeight':
                case 'maxWidth':
                case 'maxHeight':
                case 'display':
                case 'position':
                case 'top':
                case 'right':
                case 'bottom':
                case 'left':
                case 'zIndex':
                case 'cursor':
                    return contentHolder.style[propName] || '';
            }
        }
        return '';
    }
    
    // Для строки/колонки
    if (elementType === 'row' || elementType === 'column') {
        const dropZone = element.querySelector('.drop-zone');
        if (dropZone) {
            switch (propName) {
                case 'gap':
                    return dropZone.style.gap || '16px';
                case 'alignItems':
                    return dropZone.style.alignItems || '';
                case 'justifyContent':
                    return dropZone.style.justifyContent || '';
                case 'classes':
                    return Array.from(dropZone.classList)
                        .filter(c => !c.startsWith('constructor-') && !c.includes('drop-zone'))
                        .join(' ');
                case 'id':
                    return dropZone.id || '';
                case 'title':
                    return dropZone.title || '';
                default:
                    return dropZone.style[propName] || '';
            }
        }
        return '';
    }
    
    // Для ссылки
    if (elementType === 'link') {
        const link = element.querySelector('a');
        if (link) {
            switch (propName) {
                case 'text':
                    return link.textContent || '';
                case 'href':
                    return link.href || '';
                case 'target':
                    return link.target || '';
                case 'title':
                    return link.title || '';
                case 'rel':
                    return link.rel || '';
                case 'classes':
                    return link.className || '';
                case 'id':
                    return link.id || '';
                default:
                    return link.style[propName] || '';
            }
        }
        return '';
    }
    
    // Для кнопки
    if (elementType === 'button') {
        const button = element.querySelector('button');
        if (button) {
            switch (propName) {
                case 'text':
                    return button.textContent || '';
                case 'buttonType':
                    return button.type || 'button';
                case 'disabled':
                    return button.disabled;
                case 'classes':
                    return button.className || '';
                case 'id':
                    return button.id || '';
                default:
                    return button.style[propName] || '';
            }
        }
        return '';
    }
    
    return '';
}

// Обновление панели свойств
export function updatePropertiesPanel() {
    const selectedElement = window.constructorApp.getSelectedElement();
    const propertiesForm = document.getElementById('properties-form');
    
    if (!selectedElement) {
        document.getElementById('selected-element-type').textContent = 'Не выбран';
        propertiesForm.innerHTML = '<p class="text-muted">Выберите элемент для редактирования</p>';
        return;
    }
    
    const elementType = selectedElement.getAttribute('data-type');
    let typeName = '';
    switch (elementType) {
        case 'content': typeName = 'Контент'; break;
        case 'link': typeName = 'Ссылка'; break;
        case 'button': typeName = 'Кнопка'; break;
        case 'row': typeName = 'Строка'; break;
        case 'column': typeName = 'Колонка'; break;
        default: typeName = elementType.charAt(0).toUpperCase() + elementType.slice(1);
    }
    document.getElementById('selected-element-type').textContent = typeName;
    propertiesForm.innerHTML = '';
    const allProperties = {
        ...elementPropertiesConfig.common,
        ...(elementPropertiesConfig[elementType] || {})
    };
    const propertiesByCategory = {};
    for (const [propName, propConfig] of Object.entries(allProperties)) {
        if (!propertiesByCategory[propConfig.category]) {
            propertiesByCategory[propConfig.category] = [];
        }
        propertiesByCategory[propConfig.category].push({ name: propName, ...propConfig });
    }
    const accordion = document.createElement('div');
    accordion.className = 'accordion mb-3';
    accordion.id = 'propertiesAccordion';
    const categoryOrder = [
        'general', 'content', 'typography', 'style', 
        'spacing', 'size', 'layout', 'other'
    ];
    categoryOrder.forEach(category => {
        if (!propertiesByCategory[category]) return;
        
        const categoryId = `category-${category}`;
        const categoryTitle = getCategoryTitle(category);
        
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        
        const accordionHeader = document.createElement('h2');
        accordionHeader.className = 'accordion-header';
        
        const accordionButton = document.createElement('button');
        accordionButton.className = 'accordion-button collapsed';
        accordionButton.type = 'button';
        accordionButton.addEventListener('click', function(e) {
            e.preventDefault();
            toggleAccordion(this);
        });
        accordionButton.innerHTML = `<i class="fas ${getCategoryIcon(category)} me-2"></i>${categoryTitle}`;
        
        accordionHeader.appendChild(accordionButton);
        accordionItem.appendChild(accordionHeader);
        
        const accordionCollapse = document.createElement('div');
        accordionCollapse.id = categoryId;
        accordionCollapse.className = 'accordion-collapse collapse';
        
        const accordionBody = document.createElement('div');
        accordionBody.className = 'accordion-body p-2';
        
        propertiesByCategory[category].forEach(prop => {
            const propControl = createPropertyControl(prop, selectedElement);
            accordionBody.appendChild(propControl);
        });
        
        accordionCollapse.appendChild(accordionBody);
        accordionItem.appendChild(accordionCollapse);
        accordion.appendChild(accordionItem);
    });
    
    propertiesForm.appendChild(accordion);
    const actionButtons = document.createElement('div');
    actionButtons.className = 'mt-3';
    
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-danger w-100 mb-2';
    removeButton.id = 'remove-element';
    removeButton.innerHTML = '<i class="fas fa-trash me-1"></i> Удалить элемент';
    removeButton.addEventListener('click', () => window.constructorApp.removeSelectedElement());
    
    const duplicateButton = document.createElement('button');
    duplicateButton.className = 'btn btn-outline-secondary w-100';
    duplicateButton.id = 'duplicate-element';
    duplicateButton.innerHTML = '<i class="fas fa-clone me-1"></i> Дублировать';
    duplicateButton.addEventListener('click', () => window.constructorApp.duplicateSelectedElement());
    
    actionButtons.appendChild(removeButton);
    actionButtons.appendChild(duplicateButton);
    propertiesForm.appendChild(actionButtons);
    
    initDynamicControls();
}

// Создание контрола для свойства
function createPropertyControl(prop, element) {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'property-control mb-3';
    
    const label = document.createElement('label');
    label.htmlFor = `prop-${prop.name}`;
    label.textContent = prop.label;
    label.className = 'form-label small mb-1 d-block';
    controlDiv.appendChild(label);
    
    let control;
    const propId = `prop-${prop.name}`;
    
    switch (prop.type) {
        case 'text':
        case 'number':
            control = document.createElement('input');
            control.type = prop.type;
            control.className = 'form-control form-control-sm';
            control.id = propId;
            control.value = getPropertyValue(prop.name, element);
            if (prop.placeholder) control.placeholder = prop.placeholder;
            break;
            
        case 'textarea':
            control = document.createElement('textarea');
            control.className = 'form-control form-control-sm';
            control.id = propId;
            control.rows = 3;
            control.value = getPropertyValue(prop.name, element);
            if (prop.placeholder) control.placeholder = prop.placeholder;
            break;
            
        case 'select':
            control = document.createElement('select');
            control.className = 'form-select form-select-sm';
            control.id = propId;
            
            prop.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.label;
                optionElement.selected = option.value === getPropertyValue(prop.name, element);
                control.appendChild(optionElement);
            });
            break;
            
        case 'color':
            const colorWrapper = document.createElement('div');
            colorWrapper.className = 'd-flex align-items-center';
            
            control = document.createElement('input');
            control.type = 'color';
            control.className = 'form-control form-control-color p-1 me-2';
            control.id = propId;
            control.value = rgbToHex(getPropertyValue(prop.name, element)) || '#000000';
            
            const colorText = document.createElement('input');
            colorText.type = 'text';
            colorText.className = 'form-control form-control-sm flex-grow-1';
            colorText.value = control.value;
            colorText.placeholder = 'HEX или rgb()';
            
            control.addEventListener('change', () => {
                colorText.value = control.value;
                applyPropertyChange(prop.name, control.value);
            });
            
            colorText.addEventListener('change', () => {
                if (isValidColor(colorText.value)) {
                    control.value = rgbToHex(colorText.value) || '#000000';
                    applyPropertyChange(prop.name, colorText.value);
                }
            });
            
            colorWrapper.appendChild(control);
            colorWrapper.appendChild(colorText);
            controlDiv.appendChild(colorWrapper);
            break;
            
        case 'range':
            control = document.createElement('input');
            control.type = 'range';
            control.className = 'form-range';
            control.id = propId;
            control.min = prop.min || 0;
            control.max = prop.max || 1;
            control.step = prop.step || 0.1;
            control.value = getPropertyValue(prop.name, element) || 1;
            
            const rangeWrapper = document.createElement('div');
            rangeWrapper.className = 'd-flex align-items-center';
            
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'range-value small text-muted ms-2';
            valueDisplay.style.minWidth = '30px';
            valueDisplay.textContent = control.value;
            
            rangeWrapper.appendChild(control);
            rangeWrapper.appendChild(valueDisplay);
            
            control.addEventListener('input', () => {
                valueDisplay.textContent = control.value;
                applyPropertyChange(prop.name, control.value);
            });
            
            controlDiv.appendChild(rangeWrapper);
            break;
            
        case 'checkbox':
            control = document.createElement('input');
            control.type = 'checkbox';
            control.className = 'form-check-input';
            control.id = propId;
            control.checked = !!getPropertyValue(prop.name, element);
            
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'form-check form-switch';
            
            const checkboxLabel = label.cloneNode(true);
            checkboxLabel.className = 'form-check-label';
            checkboxLabel.htmlFor = propId;
            
            checkboxWrapper.appendChild(control);
            checkboxWrapper.appendChild(checkboxLabel);
            
            controlDiv.removeChild(label);
            controlDiv.appendChild(checkboxWrapper);
            break;
    }
    
    if (control && !['range', 'checkbox', 'color'].includes(prop.type)) {
        controlDiv.appendChild(control);
    }
    
    if (prop.placeholder && prop.type !== 'color') {
        const hint = document.createElement('div');
        hint.className = 'form-text small text-muted';
        hint.textContent = `Пример: ${prop.placeholder}`;
        controlDiv.appendChild(hint);
    }
    
    return controlDiv;
}

// Инициализация динамических контролов
function initDynamicControls() {
    document.querySelectorAll('#properties-form input:not([type="color"]), #properties-form select, #properties-form textarea').forEach(control => {
        control.addEventListener('change', function() {
            const propName = this.id.replace('prop-', '');
            const value = this.type === 'checkbox' ? this.checked : this.value;
            applyPropertyChange(propName, value);
        });
        
        if (control.tagName === 'INPUT' && control.type === 'text') {
            control.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const propName = this.id.replace('prop-', '');
                    applyPropertyChange(propName, this.value);
                }
            });
        }
    });
}

// Вспомогательные функции
function getCategoryTitle(category) {
    const titles = {
        general: 'Основные',
        content: 'Содержимое',
        typography: 'Текст',
        style: 'Оформление',
        spacing: 'Отступы',
        size: 'Размеры',
        layout: 'Расположение',
        other: 'Другое'
    };
    return titles[category] || category;
}

function getCategoryIcon(category) {
    const icons = {
        general: 'fas fa-cog',
        content: 'fas fa-file-alt',
        typography: 'fas fa-font',
        style: 'fas fa-palette',
        spacing: 'fas fa-arrows-alt',
        size: 'fas fa-expand',
        layout: 'fas fa-th-large',
        other: 'fas fa-ellipsis-h'
    };
    return icons[category] || 'fas fa-cog';
}

function rgbToHex(rgb) {
    if (!rgb) return '';
    if (rgb.startsWith('#')) return rgb;
    
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    if (!match) return '';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function isValidColor(color) {
    const style = new Option().style;
    style.color = color;
    return style.color !== '';
}

function toggleAccordion(button) {
    const accordionItem = button.closest('.accordion-item');
    const collapse = accordionItem.querySelector('.accordion-collapse');
    
    document.querySelectorAll('.accordion-item').forEach(item => {
        if (item !== accordionItem) {
            item.querySelector('.accordion-collapse').classList.remove('show');
            item.querySelector('.accordion-button').classList.add('collapsed');
        }
    });
    
    collapse.classList.toggle('show');
    button.classList.toggle('collapsed');
}

// Инициализация панели свойств
export function initPropertiesPanel() {
    const propertiesPanel = document.querySelector('.properties-panel');
    const workspaceContainer = document.querySelector('.workspace-container');
    
    if (!propertiesPanel || !workspaceContainer) return;
    
    propertiesPanel.addEventListener('mouseleave', () => {
        if (!propertiesPanel.classList.contains('force-expand')) {
            workspaceContainer.style.right = 'var(--properties-collapsed-width)';
        }
    });
    
    propertiesPanel.addEventListener('mouseenter', () => {
        workspaceContainer.style.right = 'var(--properties-panel-width)';
    });
}

// Разворачивание панели свойств
export function expandPropertiesPanel() {
    const propertiesPanel = document.querySelector('.properties-panel');
    const workspaceContainer = document.querySelector('.workspace-container');
    
    if (!propertiesPanel || !workspaceContainer) return;
    
    propertiesPanel.classList.add('force-expand');
    workspaceContainer.style.right = 'var(--properties-panel-width)';
}

// Сохранение состояния аккордеона
export function saveAccordionState() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    const state = {};
    
    accordionItems.forEach((item, index) => {
        const button = item.querySelector('.accordion-button');
        state[`category_${index}`] = button ? !button.classList.contains('collapsed') : false;
    });
    
    localStorage.setItem('constructor_accordion', JSON.stringify(state));
}

// Восстановление состояния аккордеона
export function restoreAccordionState() {
    const savedState = localStorage.getItem('constructor_accordion');
    if (!savedState) return;
    
    try {
        const state = JSON.parse(savedState);
        const accordionItems = document.querySelectorAll('.accordion-item');
        
        accordionItems.forEach((item, index) => {
            const button = item.querySelector('.accordion-button');
            const collapse = item.querySelector('.accordion-collapse');
            
            if (state[`category_${index}`]) {
                button?.classList.remove('collapsed');
                collapse?.classList.add('show');
            }
        });
    } catch (e) {}
}