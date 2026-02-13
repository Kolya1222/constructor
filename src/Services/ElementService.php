<?php

namespace roilafx\constructor\Services;

class ElementService
{
    /**
     * Получить иконки основных элементов для боковой панели
     */
    public function getElementIcons(): array
    {
        return [
            [
                'type' => 'content',
                'title' => 'Блок контента',
                'icon' => 'fa-file-alt',
                'label' => 'Контент'
            ],
            [
                'type' => 'link',
                'title' => 'Ссылка',
                'icon' => 'fa-link',
                'label' => 'Ссылка'
            ],
            [
                'type' => 'button',
                'title' => 'Кнопка',
                'icon' => 'fa-square',
                'label' => 'Кнопка'
            ],
            [
                'type' => 'row',
                'title' => 'Строка',
                'icon' => 'fa-grip-lines',
                'label' => 'Строка'
            ],
            [
                'type' => 'column',
                'title' => 'Колонка',
                'icon' => 'fa-columns',
                'label' => 'Колонка'
            ],
            [
                'type' => 'library',
                'title' => 'Библиотека блоков',
                'icon' => 'fa-book',
                'label' => 'Библиотека',
                'isLibrary' => true
            ]
        ];
    }

    /**
     * Получить список доступных репозиториев
     */
    public function getRepositories(): array
    {
        return [
            [
                'id' => 'evolution-cms-extensions',
                'name' => 'Evolution CMS Extensions',
                'url' => 'https://api.github.com/repos/Kolya1222/evolution-cms-extensions/contents/constructor-blocks',
                'type' => 'github',
                'branch' => 'main'
            ]
        ];
    }

}