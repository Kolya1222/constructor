@foreach($elementIcons as $element)
@if($element['type'] === 'library')
    <div class="element-icon library-icon" 
         data-type="{{ $element['type'] }}" 
         title="{{ $element['title'] }}"
         data-bs-toggle="modal" 
         data-path="pages"
         data-bs-target="#libraryModal">
        <i class="fas {{ $element['icon'] }}"></i>
        <span class="element-label">{{ $element['label'] }}</span>
    </div>
@else
    <div class="element-icon" 
         draggable="true" 
         data-type="{{ $element['type'] }}" 
         title="{{ $element['title'] }}">
        <i class="fas {{ $element['icon'] }}"></i>
        <span class="element-label">{{ $element['label'] }}</span>
    </div>
@endif
@endforeach