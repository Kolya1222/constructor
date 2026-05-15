<?php
namespace roilafx\constructor;

use Illuminate\Support\Facades\Event;
use roilafx\constructor\Services\TVService;
use roilafx\constructor\Services\ElementService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

Event::listen(['evolution.OnLoadSettings'], function() {
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

Event::listen(['evolution.OnDocFormRender'], function () { 
    try {
        $elementService = new ElementService();
        $repositories = $elementService->getRepositories();
        $tvService = new TVService();
        $baseFields = $tvService->getBaseFields();
        $documentId = $_GET['id'] ?? 0;
        $templateId = 0;
        
        if ($documentId > 0) {
            $document = evo()->getDocument($documentId);
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

        $elementIcons = $elementService->getElementIcons();
        
        $renderedContent = view('constructor::bbevo', [
            'tvCategories' => $tvCategories,
            'baseFields' => $baseFields,
            'savedData' => $savedData,
            'documentId' => $documentId,
            'elementIcons' => $elementIcons,
            'repositories' => $repositories
        ])->render();
        
        evo()->regClientHTMLBlock("
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

Event::listen(['evolution.OnDocFormSave'], function($params) {
    try {
        $documentId = $params['id'];

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

            $htmlOutput = $_POST['formbuilder_html'] ?? '';

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
            DB::table('document_builder_data')
                ->where('document_id', $documentId)
                ->delete();
        }
    } catch (\Exception $e) {
        \Log::info(1, 'Ошибка сохранения: ' . $e->getMessage());
    }
});