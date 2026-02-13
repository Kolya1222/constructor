@extends('constructor::layout')

@section('body')
    <!-- Боковая панель элементов -->
    <div class="elements-sidebar">
        <div class="elements-icons">
            <!-- Иконки элементов -->
            @include('constructor::partials.element-icons')
            <div class="elements-section">
                <h6 class="section-title">TV параметры</h6>
                <div class="tv-categories" id="tv-categories">
                    @foreach($tvCategories as $category)
                    <details class="tv-category" {{ $loop->first ? 'open' : '' }}>
                        <summary class="category-header">
                            <i class="fas fa-folder"></i>
                            {{ $category['name'] }}
                            <span class="badge bg-secondary">{{ count($category['tvs']) }}</span>
                        </summary>
                        <div class="tv-elements">
                            @foreach($category['tvs'] as $tv)
                            <div class="element-icon tv-element" draggable="true" data-type="tv" 
                                data-tv-id="{{ $tv['id'] }}" 
                                data-tv-name="{{ $tv['name'] }}" 
                                data-tv-type="{{ $tv['type'] }}" 
                                title="{{ $tv['description'] ?? $tv['caption'] }}">
                                <i class="fas fa-tag"></i>
                                <span class="element-label">{{ $tv['caption'] }}</span>
                            </div>
                            @endforeach
                        </div>
                    </details>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <!-- Основная рабочая область -->
    <div class="workspace-container">
        <div class="split-view">
            <!-- Левая панель - рабочая область -->
            <div class="split-panel">
                <div class="panel-header">
                    <i class="fas fa-pencil-ruler"></i>Рабочая область
                </div>
                <div class="workspace" id="workspace">
                    <!-- Здесь будут добавляться элементы -->
                </div>
            </div>

            <!-- Правая панель - предпросмотр -->
            <div class="split-panel">
                <div class="panel-header">
                    <i class="fas fa-eye"></i>Предпросмотр
                    <div class="ms-auto">
                        <button class="btn btn-sm btn-outline-secondary" id="copy-html" style="padding: 0;">
                            <i class="fas fa-clipboard"></i> Копировать
                        </button>
                    </div>
                </div>
                <div id="html-output">
                    <!-- Тут будет генерироваться HTML -->
                </div>
            </div>
        </div>
    </div>

    <!-- Панель свойств -->
    <div class="properties-panel" id="properties-panel">
        <div class="properties-icons">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="panel-title mb-0">
                    <i class="fas fa-sliders-h"></i>Свойства элемента
                </h5>
                <span class="badge bg-secondary" id="selected-element-type">Не выбран</span>
            </div>
            <div id="properties-form">
                <p class="text-muted">Выберите элемент для редактирования</p>
            </div>
        </div>
    </div>
    <!-- Контекстное меню -->
    @include('constructor::partials.context-menu')
    <div id="formbuilder-hidden-fields"></div>

    <!-- Модальное окно библиотеки блоков -->
    <div class="modal fade" id="libraryModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-book"></i> Библиотека готовых блоков
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="library-container">
                        <!-- Вкладки с репозиториями -->
                        <ul class="nav nav-tabs mb-3" id="libraryTabs" role="tablist">
                            @foreach($repositories as $index => $repo)
                            <li class="nav-item" role="presentation">
                                <button class="nav-link {{ $index === 0 ? 'active' : '' }}" 
                                        id="repo-{{ $repo['id'] }}-tab" 
                                        data-bs-toggle="tab" 
                                        data-bs-target="#repo-{{ $repo['id'] }}" 
                                        type="button" 
                                        role="tab">
                                    <i class="fab fa-github"></i> {{ $repo['name'] }}
                                </button>
                            </li>
                            @endforeach
                        </ul>
                        
                        <!-- Содержимое вкладок -->
                        <div class="tab-content" id="libraryTabsContent">
                            @foreach($repositories as $index => $repo)
                            <div class="tab-pane fade {{ $index === 0 ? 'show active' : '' }}" 
                                id="repo-{{ $repo['id'] }}" 
                                role="tabpanel"
                                data-repo-url="{{ $repo['url'] }}">
                                <div class="library-browser">
                                    <div class="library-sidebar">
                                        <div class="library-categories">
                                            <h6>Категории</h6>
                                            <div class="category-list" data-repo="{{ $repo['id'] }}">
                                                <div class="category-item" data-path="pages">
                                                    <i class="fas fa-folder"></i> Страницы
                                                </div>
                                                <div class="category-item" data-path="sections">
                                                    <i class="fas fa-folder"></i> Секции
                                                </div>
                                                <div class="category-item" data-path="blocks">
                                                    <i class="fas fa-folder"></i> Блоки
                                                </div>
                                                <div class="category-item" data-path="headers">
                                                    <i class="fas fa-folder"></i> Шапки
                                                </div>
                                                <div class="category-item" data-path="footers">
                                                    <i class="fas fa-folder"></i> Подвалы
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="library-content">
                                        <div class="library-search">
                                            <input type="text" class="form-control" placeholder="Поиск блоков...">
                                        </div>
                                        <div class="library-grid" id="library-grid-{{ $repo['id'] }}">
                                            <div class="text-center p-5">
                                                <div class="spinner-border" role="status">
                                                    <span class="visually-hidden">Загрузка...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            @endforeach
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                </div>
            </div>
        </div>
    </div>

@endsection