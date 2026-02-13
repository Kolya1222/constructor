<?php
namespace roilafx\constructor;

use Illuminate\Support\Facades\Event;
use roilafx\constructor\Services\TVService;
use roilafx\constructor\Services\ElementService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

$modx = evo();

Event::listen(['evolution.OnLoadSettings'], function() use ($modx) {
    try {
        if (!Schema::hasTable('document_builder_data')) {
            Schema::create('document_builder_data', function (Blueprint $table) {
                $table->id();
                $table->integer('document_id')->unique();
                $table->json('content')->nullable();
                $table->text('html_output')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
                $table->index('document_id');
            });
        }
    } catch (\Exception $e) {
        \Log::info(1, 'Ошибка создания БД: ' . $e->getMessage());
    }
});

Event::listen(['evolution.OnDocFormRender'], function () use ($modx) { 
    try {
        $elementService = new ElementService();
        $repositories = $elementService->getRepositories();
        $tvService = new TVService();
        $documentId = $_GET['id'] ?? 0;
        $templateId = 0;
        
        if ($documentId > 0) {
            $document = $modx->getDocument($documentId);
            $templateId = $document['template'] ?? 0;
        } else {
            $templateId = $_GET['template'] ?? 0;
        }
        
        $templateTVs = $tvService->getTVsByTemplate($templateId);
        $tvCategories = $templateTVs->groupBy('category')->map(function($items, $category) {
            return [
                'name' => $category,
                'tvs' => $items
            ];
        })->values();

        // Загружаем сохраненные данные
        $savedData = null;
        if ($documentId > 0) {
            $savedRecord = DB::table('document_builder_data')
                ->where('document_id', $documentId)
                ->first();
            if ($savedRecord) {
                $savedData = [
                    'elements' => json_decode($savedRecord->content, true) ?? [],
                    'html' => $savedRecord->html_output ?? '',
                ];
            }
        }
        
        // Используем сервис для получения иконок
        $elementIcons = $elementService->getElementIcons();
        
        $renderedContent = view('constructor::bbevo', [
            'tvCategories' => $tvCategories,
            'savedData' => $savedData,
            'documentId' => $documentId,
            'elementIcons' => $elementIcons,
            'repositories' => $repositories
        ])->render();
        
        $modx->regClientHTMLBlock("
            <div class='tab' id='tab'>
                <div class='tab' id='startTab'>
                    <h2 class='tab'><i class='fa fa-building'></i>Конструктор</h2>
                    <script type='text/javascript'>tpSettings.addTabPage(document.getElementById('startTab'));</script>
                    <div class = 'buildcontainer' >
                        $renderedContent
                    </div>
                </div>  
            </div>
        ");
    } catch (\Exception $e) {
        \Log::info(1, 'TV ошибка: ' . $e->getMessage());
    }
});

// Событие для сохранения данных конструктора
Event::listen(['evolution.OnDocFormSave'], function($params) use ($modx) {
    try {
        $documentId = $params['id'];
        
        // Проверяем, есть ли данные конструктора в POST
        if (isset($_POST['formbuilder']) && is_array($_POST['formbuilder'])) {
            $formData = $_POST['formbuilder'];
            $elements = [];
            
            foreach ($formData as $container => $blocks) {
                if ($container === 'workspace' && is_array($blocks)) {
                    foreach ($blocks as $index => $block) {
                        $parentIndex = $block['parentIndex'] ?? null;
                        if ($parentIndex === '') {
                            $parentIndex = null;
                        }
                        // Если parentIndex строка, но содержит число
                        elseif (is_string($parentIndex) && is_numeric($parentIndex)) {
                            $parentIndex = (int)$parentIndex;
                        }
                        
                        $element = [
                            'id' => $block['id'] ?? '',
                            'type' => $block['type'] ?? '',
                            'config' => $block['config'] ?? '',
                            'values' => isset($block['values']) ? json_decode($block['values'], true) : [],
                            'visible' => $block['visible'] ?? 1,
                            'index' => $block['index'] ?? $index,
                            'parentIndex' => $parentIndex,
                            'container' => $container
                        ];
                        $elements[] = $element;
                    }
                }
            }
            
            // Генерируем HTML
            $htmlOutput = $_POST['formbuilder_html'] ?? '';
            
            // Сохраняем в базу данных
            $existingRecord = DB::table('document_builder_data')
                ->where('document_id', $documentId)
                ->first();
                
            $data = [
                'document_id' => $documentId,
                'content' => json_encode($elements, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
                'html_output' => $htmlOutput,
                'updated_at' => now()
            ];
            
            if ($existingRecord) {
                DB::table('document_builder_data')
                    ->where('document_id', $documentId)
                    ->update($data);
            } else {
                $data['created_at'] = now();
                DB::table('document_builder_data')
                    ->insert($data);
            }
        } else {
            // Если данных нет, удаляем запись
            DB::table('document_builder_data')
                ->where('document_id', $documentId)
                ->delete();
        }
    } catch (\Exception $e) {
        \Log::info(1, 'Ошибка сохранения: ' . $e->getMessage());
    }
});