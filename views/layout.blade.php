<link rel="stylesheet" href="{{ MODX_BASE_URL }}assets/plugins/constructor/css/main.css">
@yield('body')
<script>
    // Передаем данные из PHP в JavaScript
    window.formBuilderData = {
        savedData: @json($savedData ?? null),
        documentId: {{ $documentId ?? 0 }},
        repositories: @json($repositories ?? []),
        baseUrl: "{{ MODX_BASE_URL }}"
    };
</script>
<script type="module" src="{{ MODX_BASE_URL }}assets/plugins/constructor/js/main.js"></script>