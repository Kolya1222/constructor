const elementPropertiesConfig = {
    common: {
        id: { type: 'text', label: 'ID элемента', category: 'general', placeholder: 'example-id' },
        classes: { type: 'text', label: 'Дополнительные классы', category: 'general', placeholder: 'class1 class2' },
        title: { type: 'text', label: 'Подсказка (title)', category: 'general', placeholder: 'Текст подсказки' },
        dataAttributes: { type: 'text', label: 'Data-атрибуты', category: 'general', placeholder: 'name:value' },
        
        // Layout
        display: { type: 'select', label: 'Display', category: 'layout', 
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'block', label: 'Block'},
                {value: 'flex', label: 'Flex'},
                {value: 'inline', label: 'Inline'},
                {value: 'inline-block', label: 'Inline-block'},
                {value: 'none', label: 'None'},
                {value: 'grid', label: 'Grid'}
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
        overflow: { type: 'select', label: 'Overflow', category: 'layout',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'visible', label: 'Visible'},
                {value: 'hidden', label: 'Hidden'},
                {value: 'scroll', label: 'Scroll'},
                {value: 'auto', label: 'Auto'}
            ]
        },
        
        // Flex
        flexDirection: { type: 'select', label: 'Направление flex', category: 'flex', 
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'row', label: 'Row'},
                {value: 'row-reverse', label: 'Row-reverse'},
                {value: 'column', label: 'Column'},
                {value: 'column-reverse', label: 'Column-reverse'}
            ] 
        },
        justifyContent: { type: 'select', label: 'Выравнивание по главной оси', category: 'flex', 
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'flex-start', label: 'Flex-start'},
                {value: 'flex-end', label: 'Flex-end'},
                {value: 'center', label: 'Center'},
                {value: 'space-between', label: 'Space-between'},
                {value: 'space-around', label: 'Space-around'},
                {value: 'space-evenly', label: 'Space-evenly'}
            ] 
        },
        alignItems: { type: 'select', label: 'Выравнивание по поперечной оси', category: 'flex', 
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'flex-start', label: 'Flex-start'},
                {value: 'flex-end', label: 'Flex-end'},
                {value: 'center', label: 'Center'},
                {value: 'baseline', label: 'Baseline'},
                {value: 'stretch', label: 'Stretch'}
            ] 
        },
        flexWrap: { type: 'select', label: 'Перенос элементов', category: 'flex',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'nowrap', label: 'Nowrap'},
                {value: 'wrap', label: 'Wrap'},
                {value: 'wrap-reverse', label: 'Wrap-reverse'}
            ]
        },
        flexGrow: { type: 'number', label: 'Flex grow', category: 'flex', placeholder: '0' },
        flexShrink: { type: 'number', label: 'Flex shrink', category: 'flex', placeholder: '1' },
        flexBasis: { type: 'text', label: 'Flex basis', category: 'flex', placeholder: 'auto' },
        order: { type: 'number', label: 'Order', category: 'flex', placeholder: '0' },
        
        // Grid
        gridTemplateColumns: { type: 'text', label: 'Grid columns', category: 'grid', placeholder: '1fr 1fr 1fr' },
        gridTemplateRows: { type: 'text', label: 'Grid rows', category: 'grid', placeholder: '100px 100px' },
        gridGap: { type: 'text', label: 'Grid gap', category: 'grid', placeholder: '10px' },
        
        // Размеры
        width: { type: 'text', label: 'Ширина', category: 'size', placeholder: '100px или 50%' },
        height: { type: 'text', label: 'Высота', category: 'size', placeholder: '100px или 50%' },
        minWidth: { type: 'text', label: 'Мин. ширина', category: 'size', placeholder: '100px' },
        minHeight: { type: 'text', label: 'Мин. высота', category: 'size', placeholder: '100px' },
        maxWidth: { type: 'text', label: 'Макс. ширина', category: 'size', placeholder: '100%' },
        maxHeight: { type: 'text', label: 'Макс. высота', category: 'size', placeholder: '100%' },
        aspectRatio: { type: 'text', label: 'Соотношение сторон', category: 'size', placeholder: '16/9' },
        
        // Отступы
        padding: { type: 'text', label: 'Внутренний отступ', category: 'spacing', placeholder: '10px' },
        paddingTop: { type: 'text', label: 'Верхний отступ', category: 'spacing', placeholder: '10px' },
        paddingRight: { type: 'text', label: 'Правый отступ', category: 'spacing', placeholder: '10px' },
        paddingBottom: { type: 'text', label: 'Нижний отступ', category: 'spacing', placeholder: '10px' },
        paddingLeft: { type: 'text', label: 'Левый отступ', category: 'spacing', placeholder: '10px' },
        margin: { type: 'text', label: 'Внешний отступ', category: 'spacing', placeholder: '10px' },
        marginTop: { type: 'text', label: 'Верхний margin', category: 'spacing', placeholder: '10px' },
        marginRight: { type: 'text', label: 'Правый margin', category: 'spacing', placeholder: '10px' },
        marginBottom: { type: 'text', label: 'Нижний margin', category: 'spacing', placeholder: '10px' },
        marginLeft: { type: 'text', label: 'Левый margin', category: 'spacing', placeholder: '10px' },
        
        // Стили
        backgroundColor: { type: 'color', label: 'Цвет фона', category: 'style' },
        color: { type: 'color', label: 'Цвет текста', category: 'style' },
        opacity: { type: 'range', label: 'Прозрачность', category: 'style', min: 0, max: 1, step: 0.1 },
        border: { type: 'text', label: 'Граница', category: 'style', placeholder: '1px solid #000' },
        borderRadius: { type: 'text', label: 'Скругление углов', category: 'style', placeholder: '5px' },
        borderTopLeftRadius: { type: 'text', label: 'Скругление (лев. верх)', category: 'style', placeholder: '5px' },
        borderTopRightRadius: { type: 'text', label: 'Скругление (прав. верх)', category: 'style', placeholder: '5px' },
        borderBottomRightRadius: { type: 'text', label: 'Скругление (прав. низ)', category: 'style', placeholder: '5px' },
        borderBottomLeftRadius: { type: 'text', label: 'Скругление (лев. низ)', category: 'style', placeholder: '5px' },
        boxShadow: { type: 'text', label: 'Тень', category: 'style', placeholder: '2px 2px 5px rgba(0,0,0,0.3)' },
        
        // Текст
        fontFamily: { type: 'text', label: 'Шрифт', category: 'typography', placeholder: 'Arial, sans-serif' },
        fontSize: { type: 'text', label: 'Размер шрифта', category: 'typography', placeholder: '16px' },
        fontWeight: { type: 'select', label: 'Насыщенность', category: 'typography',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'normal', label: 'Normal'},
                {value: 'bold', label: 'Bold'},
                {value: 'bolder', label: 'Bolder'},
                {value: 'lighter', label: 'Lighter'},
                {value: '100', label: '100 (Thin)'},
                {value: '200', label: '200 (Extra Light)'},
                {value: '300', label: '300 (Light)'},
                {value: '400', label: '400 (Regular)'},
                {value: '500', label: '500 (Medium)'},
                {value: '600', label: '600 (Semi Bold)'},
                {value: '700', label: '700 (Bold)'},
                {value: '800', label: '800 (Extra Bold)'},
                {value: '900', label: '900 (Black)'}
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
        textAlign: { type: 'select', label: 'Выравнивание текста', category: 'typography',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'left', label: 'Left'},
                {value: 'right', label: 'Right'},
                {value: 'center', label: 'Center'},
                {value: 'justify', label: 'Justify'}
            ] 
        },
        textDecoration: { type: 'text', label: 'Декорация текста', category: 'typography', placeholder: 'underline' },
        lineHeight: { type: 'text', label: 'Высота строки', category: 'typography', placeholder: '1.5' },
        letterSpacing: { type: 'text', label: 'Межбуквенный интервал', category: 'typography', placeholder: '1px' },
        textShadow: { type: 'text', label: 'Тень текста', category: 'typography', placeholder: '1px 1px 2px #000' },
        
        // Анимация
        transition: { type: 'text', label: 'Transition', category: 'animation', placeholder: 'all 0.3s ease' },
        animation: { type: 'text', label: 'Animation', category: 'animation', placeholder: 'slide 2s infinite' },
        
        // Другие
        cursor: { type: 'select', label: 'Тип курсора', category: 'other',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'auto', label: 'Auto'},
                {value: 'default', label: 'Default'},
                {value: 'pointer', label: 'Pointer'},
                {value: 'text', label: 'Text'},
                {value: 'move', label: 'Move'},
                {value: 'not-allowed', label: 'Not-allowed'},
                {value: 'help', label: 'Help'}
            ] 
        },
        visibility: { type: 'select', label: 'Видимость', category: 'other',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'visible', label: 'Visible'},
                {value: 'hidden', label: 'Hidden'},
                {value: 'collapse', label: 'Collapse'}
            ] 
        },
        pointerEvents: { type: 'select', label: 'Pointer events', category: 'other',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'auto', label: 'Auto'},
                {value: 'none', label: 'None'}
            ] 
        },
        userSelect: { type: 'select', label: 'Выделение текста', category: 'other',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'auto', label: 'Auto'},
                {value: 'none', label: 'None'},
                {value: 'text', label: 'Text'},
                {value: 'all', label: 'All'}
            ] 
        }
    },
    
    // Специфические свойства для разных типов элементов
    text: {
        text: { type: 'textarea', label: 'Текст', category: 'content', placeholder: 'Введите ваш текст здесь...' },
        whiteSpace: { type: 'select', label: 'Перенос текста', category: 'typography',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'normal', label: 'Normal'},
                {value: 'nowrap', label: 'Nowrap'},
                {value: 'pre', label: 'Pre'},
                {value: 'pre-wrap', label: 'Pre-wrap'},
                {value: 'pre-line', label: 'Pre-line'},
                {value: 'break-spaces', label: 'Break-spaces'}
            ] 
        },
        textOverflow: { type: 'select', label: 'Переполнение текста', category: 'typography',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'clip', label: 'Clip'},
                {value: 'ellipsis', label: 'Ellipsis'}
            ] 
        }
    },
    
    button: {
        text: { type: 'text', label: 'Текст кнопки', category: 'content', placeholder: 'Нажми меня' },
        href: { type: 'text', label: 'Ссылка', category: 'content', placeholder: 'https://example.com' },
        target: { type: 'select', label: 'Target', category: 'content',
            options: [
                {value: '_self', label: 'Текущая вкладка (_self)'},
                {value: '_blank', label: 'Новая вкладка (_blank)'},
                {value: '_parent', label: 'Родитель (_parent)'},
                {value: '_top', label: 'Верх (_top)'}
            ] 
        },
        buttonType: { type: 'select', label: 'Тип кнопки', category: 'content',
            options: [
                {value: 'button', label: 'Button'},
                {value: 'submit', label: 'Submit'},
                {value: 'reset', label: 'Reset'}
            ] 
        },
        disabled: { type: 'checkbox', label: 'Disabled', category: 'content' }
    },
    
    image: {
        src: { type: 'text', label: 'URL изображения', category: 'content', placeholder: 'https://example.com/image.jpg' },
        alt: { type: 'text', label: 'Альтернативный текст', category: 'content', placeholder: 'Описание изображения' },
        objectFit: { type: 'select', label: 'Object fit', category: 'style',
            options: [
                {value: '', label: 'По умолчанию'},
                {value: 'fill', label: 'Fill'},
                {value: 'contain', label: 'Contain'},
                {value: 'cover', label: 'Cover'},
                {value: 'none', label: 'None'},
                {value: 'scale-down', label: 'Scale-down'}
            ] 
        },
        objectPosition: { type: 'text', label: 'Object position', category: 'style', placeholder: '50% 50%' }
    },
    
    input: {
        type: { type: 'select', label: 'Тип поля', category: 'content',
            options: [
                {value: 'text', label: 'Text'},
                {value: 'password', label: 'Password'},
                {value: 'email', label: 'Email'},
                {value: 'number', label: 'Number'},
                {value: 'tel', label: 'Telephone'},
                {value: 'url', label: 'URL'},
                {value: 'search', label: 'Search'},
                {value: 'date', label: 'Date'},
                {value: 'time', label: 'Time'},
                {value: 'datetime-local', label: 'Datetime-local'}
            ] 
        },
        placeholder: { type: 'text', label: 'Подсказка', category: 'content', placeholder: 'Введите текст...' },
        value: { type: 'text', label: 'Значение', category: 'content', placeholder: 'Значение по умолчанию' },
        required: { type: 'checkbox', label: 'Обязательное', category: 'content' },
        readonly: { type: 'checkbox', label: 'Только чтение', category: 'content' },
        disabled: { type: 'checkbox', label: 'Disabled', category: 'content' },
        min: { type: 'text', label: 'Минимум', category: 'content', placeholder: '0' },
        max: { type: 'text', label: 'Максимум', category: 'content', placeholder: '100' },
        step: { type: 'text', label: 'Шаг', category: 'content', placeholder: '1' }
    }
};

export function initPropertiesPanel() {
    // Инициализация панели свойств
    document.getElementById('properties-panel').innerHTML = `
        <div class="properties-header">
            <h5 class="mb-0">Свойства элемента</h5>
            <div class="selected-element-type" id="selected-element-type">Не выбран</div>
        </div>
        <div class="properties-body">
            <form id="properties-form" class="properties-form">
                <p class="text-muted">Выберите элемент для редактирования</p>
            </form>
        </div>
    `;
    document.getElementById('properties-form').addEventListener('submit', (e) => {
        e.preventDefault(); // Запрещаем отправку формы
    });
}

function applyPropertyChange(propertyName, value) {
    const selectedElement = window.constructorApp.getSelectedElement();
    if (!selectedElement) return;
    
    const innerElement = selectedElement.querySelector('.element-content > *') || selectedElement.querySelector('.element-content');
    const targetElement = innerElement || selectedElement;
    const elementType = selectedElement.getAttribute('data-type');
    
    // Обработка общих свойств
    switch (propertyName) {
        case 'id':
            targetElement.id = value;
            break;
        case 'classes':
            const constructorClasses = Array.from(selectedElement.classList)
                .filter(c => c.startsWith('constructor-')).join(' ');
            selectedElement.className = `${constructorClasses} ${value}`.trim();
            break;
        case 'title':
            targetElement.title = value;
            break;
        case 'dataAttributes':
            if (value) {
                const [name, val] = value.split(':').map(s => s.trim());
                if (name) targetElement.dataset[name] = val || '';
            }
            break;
            
        // Layout
        case 'display':
        case 'position':
        case 'overflow':
        case 'zIndex':
        case 'top':
        case 'right':
        case 'bottom':
        case 'left':
            targetElement.style[propertyName] = value || '';
            break;
            
        // Flex
        case 'flexDirection':
        case 'justifyContent':
        case 'alignItems':
        case 'flexWrap':
        case 'flexGrow':
        case 'flexShrink':
        case 'flexBasis':
        case 'order':
            targetElement.style[propertyName] = value || '';
            break;
            
        // Grid
        case 'gridTemplateColumns':
        case 'gridTemplateRows':
        case 'gridGap':
            targetElement.style[propertyName] = value || '';
            break;
            
        // Размеры
        case 'width':
        case 'height':
        case 'minWidth':
        case 'minHeight':
        case 'maxWidth':
        case 'maxHeight':
        case 'aspectRatio':
            targetElement.style[propertyName] = value || '';
            break;
            
        // Отступы
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
            targetElement.style[propertyName] = value || '';
            break;
            
        // Стили
        case 'backgroundColor':
        case 'color':
        case 'opacity':
        case 'border':
        case 'borderRadius':
        case 'borderTopLeftRadius':
        case 'borderTopRightRadius':
        case 'borderBottomRightRadius':
        case 'borderBottomLeftRadius':
        case 'boxShadow':
            targetElement.style[propertyName] = value || '';
            break;
            
        // Текст
        case 'fontFamily':
        case 'fontSize':
        case 'fontWeight':
        case 'fontStyle':
        case 'textAlign':
        case 'textDecoration':
        case 'lineHeight':
        case 'letterSpacing':
        case 'textShadow':
        case 'whiteSpace':
        case 'textOverflow':
            targetElement.style[propertyName] = value || '';
            break;
            
        // Анимация
        case 'transition':
        case 'animation':
            targetElement.style[propertyName] = value || '';
            break;
            
        // Другие
        case 'cursor':
        case 'visibility':
        case 'pointerEvents':
        case 'userSelect':
            targetElement.style[propertyName] = value || '';
            break;
    }
    
    // Обработка специфических свойств
    switch (elementType) {
        case 'text':
            if (propertyName === 'text') {
                targetElement.textContent = value;
            }
            break;
            
        case 'button':
            if (propertyName === 'text') {
                targetElement.textContent = value;
            } else if (propertyName === 'href') {
                if (targetElement.tagName === 'A') {
                    targetElement.href = value;
                } else {
                    const link = document.createElement('a');
                    link.href = value;
                    link.innerHTML = targetElement.outerHTML;
                    selectedElement.querySelector('.element-content').innerHTML = link.outerHTML;
                }
            } else if (propertyName === 'target') {
                if (targetElement.tagName === 'A') {
                    targetElement.target = value;
                }
            } else if (propertyName === 'buttonType') {
                if (targetElement.tagName === 'BUTTON') {
                    targetElement.type = value;
                }
            } else if (propertyName === 'disabled') {
                targetElement.disabled = !!value;
            }
            break;
            
        case 'image':
            if (propertyName === 'src') {
                targetElement.src = value;
            } else if (propertyName === 'alt') {
                targetElement.alt = value;
            } else if (propertyName === 'objectFit') {
                targetElement.style.objectFit = value || '';
            } else if (propertyName === 'objectPosition') {
                targetElement.style.objectPosition = value || '';
            }
            break;
            
        case 'input':
            if (['type', 'placeholder', 'value', 'min', 'max', 'step'].includes(propertyName)) {
                targetElement[propertyName] = value;
            } else if (['required', 'readonly', 'disabled'].includes(propertyName)) {
                targetElement[propertyName] = !!value;
            }
            break;
    }
    
    window.constructorApp.updateHtmlOutput();
}

export function updatePropertiesPanel() {
    const selectedElement = window.constructorApp.getSelectedElement();
    const propertiesForm = document.getElementById('properties-form');
    
    if (!selectedElement) {
        document.getElementById('selected-element-type').textContent = 'Не выбран';
        propertiesForm.innerHTML = '<p class="text-muted">Выберите элемент для редактирования</p>';
        return;
    }
    
    const elementType = selectedElement.getAttribute('data-type');
    document.getElementById('selected-element-type').textContent = elementType.charAt(0).toUpperCase() + elementType.slice(1);
    
    // Очищаем форму
    propertiesForm.innerHTML = '';
    
    // Собираем все свойства для этого элемента
    const allProperties = {
        ...elementPropertiesConfig.common,
        ...(elementPropertiesConfig[elementType] || {})
    };
    
    // Группируем свойства по категориям
    const propertiesByCategory = {};
    for (const [propName, propConfig] of Object.entries(allProperties)) {
        if (!propertiesByCategory[propConfig.category]) {
            propertiesByCategory[propConfig.category] = [];
        }
        propertiesByCategory[propConfig.category].push({ name: propName, ...propConfig });
    }
    
    // Создаем аккордеон с категориями
    const accordion = document.createElement('div');
    accordion.className = 'accordion mb-3';
    accordion.id = 'propertiesAccordion';
    
    // Определяем порядок категорий
    const categoryOrder = [
        'general', 'content', 'layout', 'flex', 'grid', 
        'size', 'spacing', 'style', 'typography', 
        'animation', 'other'
    ];
    
    // Добавляем категории в аккордеон в заданном порядке
    categoryOrder.forEach(category => {
        if (!propertiesByCategory[category]) return;
        
        const categoryId = `category-${category}`;
        const categoryTitle = getCategoryTitle(category);
        
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        
        // Заголовок аккордеона
        const accordionHeader = document.createElement('h2');
        accordionHeader.className = 'accordion-header';
        
        const accordionButton = document.createElement('button');
        accordionButton.className = 'accordion-button collapsed';
        accordionButton.type = 'button';
        accordionButton.dataset.bsToggle = 'collapse';
        accordionButton.dataset.bsTarget = `#${categoryId}`;
        accordionButton.innerHTML = `<i class="bi ${getCategoryIcon(category)} me-2"></i>${categoryTitle}`;
        
        accordionHeader.appendChild(accordionButton);
        accordionItem.appendChild(accordionHeader);
        
        // Тело аккордеона
        const accordionCollapse = document.createElement('div');
        accordionCollapse.id = categoryId;
        accordionCollapse.className = 'accordion-collapse collapse';
        accordionCollapse.dataset.bsParent = '#propertiesAccordion';
        
        const accordionBody = document.createElement('div');
        accordionBody.className = 'accordion-body p-2';
        
        // Добавляем элементы управления для каждого свойства
        propertiesByCategory[category].forEach(prop => {
            const propControl = createPropertyControl(prop, selectedElement);
            accordionBody.appendChild(propControl);
        });
        
        accordionCollapse.appendChild(accordionBody);
        accordionItem.appendChild(accordionCollapse);
        accordion.appendChild(accordionItem);
    });
    
    propertiesForm.appendChild(accordion);
    
    // Добавляем кнопки действий
    const actionButtons = document.createElement('div');
    actionButtons.className = 'mt-3';
    
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-danger w-100 mb-2';
    removeButton.id = 'remove-element';
    removeButton.innerHTML = '<i class="bi bi-trash me-1"></i> Удалить элемент';
    removeButton.addEventListener('click', () => window.constructorApp.removeSelectedElement());
    
    const duplicateButton = document.createElement('button');
    duplicateButton.className = 'btn btn-outline-secondary w-100';
    duplicateButton.id = 'duplicate-element';
    duplicateButton.innerHTML = '<i class="bi bi-files me-1"></i> Дублировать';
    duplicateButton.addEventListener('click', () => window.constructorApp.duplicateSelectedElement());
    
    actionButtons.appendChild(removeButton);
    actionButtons.appendChild(duplicateButton);
    propertiesForm.appendChild(actionButtons);
    
    // Инициализируем обработчики событий для динамически созданных элементов
    initDynamicControls();
}

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
    
    // Добавляем подсказку с примером для некоторых свойств
    if (prop.placeholder && prop.type !== 'color') {
        const hint = document.createElement('div');
        hint.className = 'form-text small text-muted';
        hint.textContent = `Пример: ${prop.placeholder}`;
        controlDiv.appendChild(hint);
    }
    
    return controlDiv;
}

function getPropertyValue(propName, element) {
    const innerElement = element.querySelector('.element-content > *') || element.querySelector('.element-content');
    const targetElement = innerElement || element;
    const elementType = element.getAttribute('data-type');
    
    // Обработка общих свойств
    switch (propName) {
        case 'id':
            return targetElement.id || '';
        case 'classes':
            return Array.from(element.classList)
                .filter(c => !c.startsWith('constructor-') && c !== 'selected')
                .join(' ');
        case 'title':
            return targetElement.title || '';
        case 'dataAttributes':
            const dataAttr = Object.keys(targetElement.dataset)[0];
            return dataAttr ? `${dataAttr}:${targetElement.dataset[dataAttr]}` : '';
            
        // Layout
        case 'position':
        case 'overflow':
        case 'zIndex':
        case 'top':
        case 'right':
        case 'bottom':
        case 'left':
            return targetElement.style[propName] || '';
            
        // Flex
        case 'flexDirection':
        case 'justifyContent':
        case 'alignItems':
        case 'flexWrap':
        case 'flexGrow':
        case 'flexShrink':
        case 'flexBasis':
        case 'order':
            return targetElement.style[propName] || '';
            
        // Grid
        case 'gridTemplateColumns':
        case 'gridTemplateRows':
        case 'gridGap':
            return targetElement.style[propName] || '';
            
        // Размеры
        case 'width':
        case 'height':
        case 'minWidth':
        case 'minHeight':
        case 'maxWidth':
        case 'maxHeight':
        case 'aspectRatio':
            return targetElement.style[propName] || '';
            
        // Отступы
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
            return targetElement.style[propName] || '';
            
        // Стили
        case 'backgroundColor':
        case 'color':
        case 'opacity':
        case 'border':
        case 'borderRadius':
        case 'borderTopLeftRadius':
        case 'borderTopRightRadius':
        case 'borderBottomRightRadius':
        case 'borderBottomLeftRadius':
        case 'boxShadow':
            return targetElement.style[propName] || '';
            
        // Текст
        case 'fontFamily':
        case 'fontSize':
        case 'fontWeight':
        case 'fontStyle':
        case 'textAlign':
        case 'textDecoration':
        case 'lineHeight':
        case 'letterSpacing':
        case 'textShadow':
        case 'whiteSpace':
        case 'textOverflow':
            return targetElement.style[propName] || '';
            
        // Анимация
        case 'transition':
        case 'animation':
            return targetElement.style[propName] || '';
            
        // Другие
        case 'cursor':
        case 'visibility':
        case 'pointerEvents':
        case 'userSelect':
            return targetElement.style[propName] || '';
    }
    
    // Обработка специфических свойств
    switch (elementType) {
        case 'text':
            if (propName === 'text') {
                return targetElement.textContent || '';
            }
            break;
            
        case 'button':
            if (propName === 'text') {
                return targetElement.textContent || '';
            } else if (propName === 'href') {
                return targetElement.tagName === 'A' ? targetElement.href : '';
            } else if (propName === 'target') {
                return targetElement.tagName === 'A' ? targetElement.target : '';
            } else if (propName === 'buttonType') {
                return targetElement.tagName === 'BUTTON' ? targetElement.type : 'button';
            } else if (propName === 'disabled') {
                return targetElement.disabled;
            }
            break;
            
        case 'image':
            if (propName === 'src') {
                return targetElement.src || '';
            } else if (propName === 'alt') {
                return targetElement.alt || '';
            } else if (propName === 'objectFit') {
                return targetElement.style.objectFit || '';
            } else if (propName === 'objectPosition') {
                return targetElement.style.objectPosition || '';
            }
            break;
            
        case 'input':
            if (['type', 'placeholder', 'value', 'min', 'max', 'step'].includes(propName)) {
                return targetElement[propName] || '';
            } else if (['required', 'readonly', 'disabled'].includes(propName)) {
                return targetElement[propName];
            }
            break;
    }
    
    return '';
}

function initDynamicControls() {
    // Обработка изменений для динамически созданных элементов управления
    document.querySelectorAll('#properties-form input:not([type="color"]), #properties-form select, #properties-form textarea').forEach(control => {
        control.addEventListener('change', function() {
            const propName = this.id.replace('prop-', '');
            const value = this.type === 'checkbox' ? this.checked : this.value;
            applyPropertyChange(propName, value);
        });
        
        // Для текстовых полей - обработка по нажатию Enter
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
        layout: 'Расположение',
        flex: 'Flexbox',
        grid: 'Grid',
        size: 'Размеры',
        spacing: 'Отступы',
        style: 'Стили',
        typography: 'Текст',
        animation: 'Анимация',
        content: 'Содержимое',
        other: 'Другие'
    };
    return titles[category] || category;
}

function getCategoryIcon(category) {
    const icons = {
        general: 'bi-gear',
        layout: 'bi-layout-text-sidebar',
        flex: 'bi-layout-three-columns',
        grid: 'bi-grid',
        size: 'bi-arrows-angle-expand',
        spacing: 'bi-border-width',
        style: 'bi-palette',
        typography: 'bi-fonts',
        animation: 'bi-lightning',
        content: 'bi-file-earmark-text',
        other: 'bi-three-dots'
    };
    return icons[category] || 'bi-gear';
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
