# Evolution CMS Constructor

## Возможности

**Основные функции:**
- Drag & Drop интерфейс с поддержкой вложенности
- Визуальное редактирование контента через TinyMCE
- Интеграция с TV параметрами Evolution CMS
- Библиотека готовых блоков из GitHub репозитория
- Панель свойств для тонкой настройки элементов
- Контекстное меню с операциями копирования/вставки
- Сохранение и загрузка структуры страницы
- Экспорт чистого HTML кода

---

## Требования

- TinyMCE 4

---

## Быстрый старт

### 1. Создание первой страницы

1. Откройте любой документ в админке Evolution CMS
2. Перейдите на вкладку **"Конструктор"**
3. Перетащите элемент **"Строка"** в рабочую область
4. Внутрь строки добавьте **"Колонку"**
5. В колонку добавьте **"Контент"**
6. Дважды кликните по тексту для редактирования

### 2. Работа с TV параметрами

1. Создайте TV параметр в админке Evolution
2. Привяжите его к шаблону страницы
3. В конструкторе перетащите TV параметр из боковой панели
4. Настройте отображение через панель свойств

### 3. Использование библиотеки блоков

1. Нажмите на иконку **"Библиотека"** в боковой панели
2. Выберите категорию (Страницы, Секции, Блоки)
3. Нажмите **"+"** на выбранном блоке
4. Готовый блок появится в рабочей области

---

### Использование в шаблоне

```
[!documentBuilder!]
```

```blade
{!! evo()->runSnippet('documentBuilder') !!}
```

---

## Библиотека блоков

### Подключение репозитория

```php
// В ElementService.php
public function getRepositories(): array
{
    return [
        [
            'id' => 'my-blocks',
            'name' => 'Мои блоки',
            'url' => 'https://api.github.com/repos/username/constructor-blocks/contents/',
            'type' => 'github',
            'branch' => 'main'
        ]
    ];
}
```

### Структура JSON файла блока

```json
{
    "title": "Название блока",
    "description": "Описание блока",
    "type": "section",
    "tags": ["bootstrap", "responsive", "tv:price"],
    "preview": "https://.../preview.png",
    "elements": [
        {
            "type": "row",
            "index": "0",
            "parentIndex": null,
            "values": {}
        }
    ]
}
```

### Параметры блока

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `title` | string | Да | Название блока |
| `description` | string | Нет | Описание |
| `type` | string | Да | `page`, `section`, `block` |
| `tags` | array | Нет | Теги для поиска |
| `preview` | string | Нет | URL превью |
| `elements` | array | Да | Массив элементов |

---

## Создание своих блоков

### 1. Базовый блок с контентом

```json
[
    {
        "id": "",
        "type": "column",
        "index": "0",
        "config": "column",
        "values": {
            "styles": "",
            "classes": "constructor-element",
            "attributes": [],
            "dropZoneStyles": "display: flex; flex-direction: column; gap: 16px; padding: 12px;",
            "dropZoneClasses": "drop-zone"
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": null
    },
    {
        "id": "",
        "type": "content",
        "index": "1",
        "config": "content",
        "values": {
            "styles": "",
            "classes": "constructor-element",
            "content": "<p>Нажмите кнопку редактирования для добавления контента</p>",
            "attributes": [],
            "innerStyles": "",
            "innerClasses": "content-holder"
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": 0
    },
    {
        "id": "",
        "type": "content",
        "index": "2",
        "config": "content",
        "values": {
            "styles": "",
            "classes": "constructor-element selected",
            "content": "<p>Нажмите кнопку редактирования для добавления контента</p>",
            "attributes": [],
            "innerStyles": "",
            "innerClasses": "content-holder"
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": 0
    }
]
```

### 2. Блок с TV параметрами

```json
[
    {
        "id": "",
        "type": "row",
        "index": "0",
        "config": "row",
        "values": {
            "styles": "padding: 40px 20px;",
            "classes": "constructor-element product-section",
            "attributes": {
                "data-index": "0"
            },
            "dropZoneStyles": "display: flex; flex-direction: row; gap: 40px; max-width: 1200px; margin: 0px auto;",
            "dropZoneClasses": "drop-zone container"
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": null
    },
    {
        "id": "",
        "type": "column",
        "index": "1",
        "config": "column",
        "values": {
            "styles": "flex: 1 1 0%;",
            "classes": "constructor-element",
            "attributes": {
                "data-index": "1"
            },
            "dropZoneStyles": "display: flex; flex-direction: column; gap: 20px;",
            "dropZoneClasses": "drop-zone"
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": 0
    },
    {
        "id": "",
        "type": "column",
        "index": "2",
        "config": "column",
        "values": {
            "styles": "flex: 1 1 0%;",
            "classes": "constructor-element",
            "attributes": {
                "data-index": "2"
            },
            "dropZoneStyles": "display: flex; flex-direction: column; gap: 20px;",
            "dropZoneClasses": "drop-zone"
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": 0
    },
    {
        "id": "",
        "type": "tv",
        "index": "3",
        "config": "tv",
        "values": {
            "alt": "test",
            "tvId": "1",
            "styles": "",
            "tvName": "test",
            "tvType": "image",
            "classes": "constructor-element selected",
            "content": "{{$documentObject['test']}}",
            "attributes": {
                "data-index": "3",
                "data-tv-id": "1",
                "data-tv-name": "test",
                "data-tv-type": "image"
            },
            "targetStyles": "max-width: 100%;",
            "targetClasses": ""
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": 1
    },
    {
        "id": "",
        "type": "content",
        "index": "4",
        "config": "content",
        "values": {
            "styles": "",
            "classes": "constructor-element",
            "content": "<h1 style=\"font-size: 32px; color: #333;\">Название товара</h1>",
            "attributes": {
                "data-index": "4"
            },
            "innerStyles": "",
            "innerClasses": "content-holder content-holder content-holder content-holder content-holder"
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": 2
    },
    {
        "id": "",
        "type": "content",
        "index": "5",
        "config": "content",
        "values": {
            "styles": "",
            "classes": "constructor-element",
            "content": "<p style=\"font-size: 24px; color: #667eea; font-weight: bold;\">9 990 ₽</p>",
            "attributes": {
                "data-index": "5"
            },
            "innerStyles": "",
            "innerClasses": "content-holder content-holder content-holder content-holder content-holder product-price"
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": 2
    },
    {
        "id": "",
        "type": "content",
        "index": "6",
        "config": "content",
        "values": {
            "styles": "",
            "classes": "constructor-element",
            "content": "<p style=\"color: #666; line-height: 1.6;\">Описание товара. Здесь можно рассказать о характеристиках, преимуществах и особенностях продукта.</p>",
            "attributes": {
                "data-index": "6"
            },
            "innerStyles": "",
            "innerClasses": "content-holder content-holder content-holder content-holder content-holder product-description"
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": 2
    },
    {
        "id": "",
        "type": "button",
        "index": "7",
        "config": "button",
        "values": {
            "styles": "",
            "classes": "constructor-element",
            "content": "Добавить в корзину",
            "disabled": false,
            "attributes": {
                "data-index": "7"
            },
            "buttonType": "submit",
            "innerStyles": "background: rgb(102, 126, 234); color: white; border: none; padding: 12px 30px; border-radius: 5px; font-size: 16px; cursor: pointer; transition: background 0.3s;",
            "innerClasses": "btn btn-primary btn-lg"
        },
        "visible": "1",
        "container": "workspace",
        "parentIndex": 2
    }
]
```

### 3. Загрузка в репозиторий

1. Создайте JSON файл в папке `blocks/`
2. Закоммитьте в GitHub
3. Блок появится в библиотеке конструктора

---

## Устранение неполадок

### Не загружаются блоки из GitHub

**Проверьте:**
1. Правильно ли указан URL репозитория
2. Доступен ли GitHub API (нет блокировки CORS)
3. Есть ли JSON файлы в указанной папке

### Проблемы с TinyMCE

**Проверьте:**
1. Подключен ли редактор в Evolution CMS
2. Есть ли конфликт версий TinyMCE
3. Правильно ли указан селектор

## Благодарности

- Evolution CMS Team за отличную платформу
- Сообществу Evolution за идеи и тестирование
- Всем пользователям конструктора

---
