<?php

namespace roilafx\constructor\Services;

use Illuminate\Support\Facades\DB;

class TVService
{
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
}