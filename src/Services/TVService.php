<?php

namespace roilafx\constructor\Services;

use Illuminate\Support\Facades\DB;

class TVService
{
    /**
     * Получить все TV с информацией о привязках к шаблонам
     */
    public function getAllTVs()
    {
        // Получаем TV с названиями категорий и информацией о шаблонах
        $tvs = DB::table('site_tmplvars as tv')
            ->leftJoin('categories as cat', 'tv.category', '=', 'cat.id')
            ->select(
                'tv.id',
                'tv.name',
                'tv.caption', 
                'tv.description',
                'tv.type',
                'tv.category',
                'tv.rank',
                'cat.category as category_name'
            )
            ->orderBy('cat.category', 'ASC')
            ->orderBy('tv.rank', 'ASC')
            ->get();
        return $tvs->map(function($tv) {
            // Получаем шаблоны для каждого TV
            $templates = $this->getTemplatesForTV($tv->id);
            return [
                'id' => $tv->id,
                'name' => $tv->name,
                'caption' => $tv->caption,
                'description' => $tv->description,
                'type' => $tv->type,
                'category_id' => $tv->category,
                'category' => $tv->category_name ?: 'Без категории',
                'rank' => $tv->rank,
                'templates' => $templates,
                'templates_count' => $templates->count()
            ];
        });
    }

    /**
     * Получить TV сгруппированные по категориям
     */
    public function getTVsByCategory()
    {
        $tvs = $this->getAllTVs();
        $grouped = $tvs->groupBy('category')->map(function($items, $category) {
            return [
                'name' => $category,
                'tvs' => $items
            ];
        });
        $sorted = $grouped->sortBy(function($category, $key) {
            return $key === 'Без категории' ? 'zzz' : $key;
        });
        return $sorted->values();
    }

    /**
     * Получить TV привязанные к конкретному шаблону
     */
    public function getTVsByTemplate($templateId)
    {
        $tvs = DB::table('site_tmplvars as tv')
            ->join('site_tmplvar_templates as tvt', 'tv.id', '=', 'tvt.tmplvarid')
            ->leftJoin('categories as cat', 'tv.category', '=', 'cat.id')
            ->where('tvt.templateid', $templateId)
            ->select(
                'tv.id',
                'tv.name',
                'tv.caption',
                'tv.description',
                'tv.type',
                'tv.category',
                'tv.rank',
                'cat.category as category_name',
                'tvt.rank as template_rank'
            )
            ->orderBy('tvt.rank', 'ASC')
            ->get();
        return $tvs->map(function($tv) {
            return [
                'id' => $tv->id,
                'name' => $tv->name,
                'caption' => $tv->caption,
                'description' => $tv->description,
                'type' => $tv->type,
                'category_id' => $tv->category,
                'category' => $tv->category_name ?: 'Без категории',
                'rank' => $tv->rank,
                'template_rank' => $tv->template_rank
            ];
        });
    }

    /**
     * Получить TV НЕ привязанные к шаблону
     */
    public function getTVsNotInTemplate($templateId)
    {
        $tvs = DB::table('site_tmplvars as tv')
            ->leftJoin('categories as cat', 'tv.category', '=', 'cat.id')
            ->whereNotExists(function($query) use ($templateId) {
                $query->select(DB::raw(1))
                      ->from('site_tmplvar_templates as tvt')
                      ->whereRaw('tvt.tmplvarid = tv.id')
                      ->where('tvt.templateid', $templateId);
            })
            ->select(
                'tv.id',
                'tv.name',
                'tv.caption',
                'tv.description',
                'tv.type',
                'tv.category',
                'tv.rank',
                'cat.category as category_name'
            )
            ->orderBy('cat.category', 'ASC')
            ->orderBy('tv.rank', 'ASC')
            ->get();
        return $tvs->map(function($tv) {
            return [
                'id' => $tv->id,
                'name' => $tv->name,
                'caption' => $tv->caption,
                'description' => $tv->description,
                'type' => $tv->type,
                'category_id' => $tv->category,
                'category' => $tv->category_name ?: 'Без категории',
                'rank' => $tv->rank
            ];
        });
    }

    /**
     * Получить шаблоны для конкретного TV
     */
    public function getTemplatesForTV($tvId)
    {
        return DB::table('site_tmplvar_templates as tvt')
            ->join('site_templates as t', 'tvt.templateid', '=', 't.id')
            ->where('tvt.tmplvarid', $tvId)
            ->select(
                't.id',
                't.templatename as name',
                'tvt.rank'
            )
            ->orderBy('tvt.rank', 'ASC')
            ->get();
    }

    /**
     * Получить все шаблоны с количеством привязанных TV
     */
    public function getAllTemplatesWithTVCount()
    {
        return DB::table('site_templates as t')
            ->leftJoin('site_tmplvar_templates as tvt', 't.id', '=', 'tvt.templateid')
            ->select(
                't.id',
                't.templatename as name',
                't.description',
                DB::raw('COUNT(tvt.tmplvarid) as tv_count')
            )
            ->groupBy('t.id', 't.templatename', 't.description')
            ->orderBy('t.templatename', 'ASC')
            ->get();
    }

    public function getTVTypes()
    {
        return [
            'text' => 'Текст',
            'textarea' => 'Текстовая область', 
            'richtext' => 'Rich Text',
            'number' => 'Число',
            'date' => 'Дата',
            'dropdown' => 'Выпадающий список',
            'checkbox' => 'Чекбокс',
            'image' => 'Изображение',
            'file' => 'Файл',
            'url' => 'URL',
            'email' => 'Email'
        ];
    }
}