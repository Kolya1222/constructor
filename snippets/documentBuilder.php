<?php
use Illuminate\Support\Facades\DB;

$docid = isset($params['docid']) ? (int)$params['docid'] : $modx->documentIdentifier;
if (!$docid) return '';
try {
    $data = DB::table('document_builder_data')
             ->where('document_id', $docid)
             ->first();
    if (!$data) return '';
    $output = $data->html_output ?: '';
    $output = html_entity_decode($output, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $output = preg_replace('/{{\$documentObject\[\'(.*?)\'\]}}/', '[*$1*]', $output);
    $output = $modx->parseDocumentSource($output);
    return $output;
} catch (Exception $e) {
    return '';
}
?>