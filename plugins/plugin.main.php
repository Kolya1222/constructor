<?php
namespace roilafx\constructor;

use Illuminate\Support\Facades\Event;
use roilafx\constructor\Services\TVService;
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
            $modx->log(1, 'Builder table created successfully');
        }
    } catch (\Exception $e) {
        $modx->log(1, 'Builder table creation error: ' . $e->getMessage());
    }
});

Event::listen(['evolution.OnDocFormRender'], function () use ($modx) { 
    try {
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

        // Загружаем сохраненные данные из таблицы
        $savedData = null;
        if ($documentId > 0) {
            $savedRecord = \Illuminate\Support\Facades\DB::table('document_builder_data')
                ->where('document_id', $documentId)
                ->first();
            if ($savedRecord) {
                $savedData = [
                    'elements' => json_decode($savedRecord->content, true) ?? [],
                    'html' => $savedRecord->html_output ?? '',
                ];
                $modx->log(1, "Loaded builder data for document $documentId: " . count($savedData['elements']) . " elements");
            }
        }
        $renderedContent = view('main::bbevo', [
            'tvCategories' => $tvCategories,
            'tvTypes' => $tvService->getTVTypes(),
            'savedData' => $savedData,
            'documentId' => $documentId
        ])->render();
        $modx->regClientHTMLBlock("
            <div class='tab' id='tab'>
                <div class='tab' id='startTab'>
                    <h2 class='tab'>Конструктор</h2>
                    <script type='text/javascript'>tpSettings.addTabPage(document.getElementById('startTab'));</script>
                    <div class = 'buildcontainer' >
                        $renderedContent
                    </div>
                </div>  
            </div>
        ");
    } catch (\Exception $e) {
        $modx->log(1, 'TV Constructor Error: ' . $e->getMessage());
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
                        $element = [
                            'id' => $block['id'] ?? null,
                            'type' => $block['type'] ?? '',
                            'config' => $block['config'] ?? '',
                            'values' => isset($block['values']) ? json_decode($block['values'], true) : [],
                            'visible' => $block['visible'] ?? 1,
                            'index' => $block['index'] ?? $index,
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
                'content' => json_encode($elements, JSON_UNESCAPED_UNICODE),
                'html_output' => $htmlOutput,
                'updated_at' => now()
            ];
            if ($existingRecord) {
                // Обновляем существующую запись
                DB::table('document_builder_data')
                    ->where('document_id', $documentId)
                    ->update($data);
            } else {
                // Создаем новую запись
                $data['created_at'] = now();
                DB::table('document_builder_data')
                    ->insert($data);
            }
            $modx->log(1, "Builder data saved for document $documentId");
        } else {
            DB::table('document_builder_data')
                ->where('document_id', $documentId)
                ->delete();
        }
    } catch (\Exception $e) {
        $modx->log(1, 'Builder save error: ' . $e->getMessage());
    }
});