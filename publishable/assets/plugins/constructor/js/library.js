function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `library-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 10000;
        padding: 12px 20px; border-radius: 8px; background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white; font-size: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: fadeOut 3s forwards;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

if (!document.querySelector('#library-notification-style')) {
    const style = document.createElement('style');
    style.id = 'library-notification-style';
    style.textContent = `
        @keyframes fadeOut {
            0% { opacity: 1; transform: translateY(0); }
            70% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(20px); visibility: hidden; }
        }
    `;
    document.head.appendChild(style);
}

export function initLibrary() {
    const libraryIcon = document.querySelector('.element-icon[data-type="library"]');
    if (!libraryIcon) return;
    libraryIcon.removeAttribute('data-bs-toggle');
    libraryIcon.removeAttribute('data-bs-target');
    
    libraryIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLibraryModal();
    });
    initLibraryModal();
}

function initLibraryModal() {
    const modal = document.getElementById('libraryModal');
    if (!modal) return;

    // Закрытие по кнопкам
    const closeBtn = modal.querySelector('.btn-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeLibraryModal());
    const closeFooterBtn = modal.querySelector('.btn-secondary');
    if (closeFooterBtn) closeFooterBtn.addEventListener('click', () => closeLibraryModal());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeLibraryModal();
    });

    // Категории
    document.querySelectorAll('.category-item').forEach(category => {
        category.addEventListener('click', function(e) {
            e.preventDefault();
            const repoId = this.closest('.category-list')?.dataset.repo;
            if (!repoId) return;
            document.querySelectorAll(`.category-list[data-repo="${repoId}"] .category-item`).forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const tabPane = document.querySelector(`#repo-${repoId}`);
            if (tabPane) {
                const searchInput = tabPane.querySelector('.library-search input');
                if (searchInput) searchInput.value = '';
                loadBlocksFromGithub(repoId, this.dataset.path);
            }
        });
    });

    // Табы
    document.querySelectorAll('.nav-tabs .nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-tabs .nav-link').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.getAttribute('data-bs-target') || this.getAttribute('href');
            if (targetId) {
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));
                const targetPane = document.querySelector(targetId);
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                    const repoId = targetPane.id.replace('repo-', '');

                    const searchInput = targetPane.querySelector('.library-search input');
                    if (searchInput) searchInput.value = '';
                    const activeCategory = targetPane.querySelector('.category-item.active');
                    const path = activeCategory?.dataset.path || '';
                    loadBlocksFromGithub(repoId, path);
                }
            }
        });
    });

    document.querySelectorAll('.library-search input').forEach(input => {
        input.addEventListener('input', debounce(function() {
            const tabPane = this.closest('.tab-pane');
            if (!tabPane) return;
            const repoId = tabPane.id.replace('repo-', '');
            filterBlocks(repoId, this.value);
        }, 300));
    });
}

function openLibraryModal() {
    const modal = document.getElementById('libraryModal');
    if (!modal) return;

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    } else {
        modal.style.display = 'flex';
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }

    const activeTab = document.querySelector('.nav-tabs .nav-link.active');
    if (activeTab) {
        const targetId = activeTab.getAttribute('data-bs-target') || activeTab.getAttribute('href');
        if (targetId) {
            const targetPane = document.querySelector(targetId);
            if (targetPane) {
                const repoId = targetPane.id.replace('repo-', '');
                const activeCategory = targetPane.querySelector('.category-item.active');
                const path = activeCategory?.dataset.path || '';
                loadBlocksFromGithub(repoId, path);
            }
        }
    }
}

function closeLibraryModal() {
    const modal = document.getElementById('libraryModal');
    if (!modal) return;
    
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
    } else {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
}

async function loadBlocksFromGithub(repoId, path = '') {
    const repo = window.formBuilderData?.repositories?.find(r => r.id === repoId);
    if (!repo) {
        console.error('Репозиторий не найден:', repoId);
        showNotification('Репозиторий не найден', 'error');
        return;
    }
    
    const grid = document.getElementById(`library-grid-${repoId}`);
    if (!grid) return;
    
    grid.innerHTML = '<div class="text-center p-5"><div class="spinner-border" role="status"><span class="visually-hidden">Загрузка...</span></div></div>';
    
    try {
        const baseUrl = repo.url.replace(/\/+$/, '');
        const pathClean = path.replace(/^\/+|\/+$/g, '');
        const apiUrl = pathClean ? `${baseUrl}/${pathClean}` : baseUrl;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        const files = await response.json();
        if (!Array.isArray(files)) {
            grid.innerHTML = '<div class="empty-state error"><i class="fas fa-exclamation-triangle"></i><p>Репозиторий пуст или не содержит файлов</p></div>';
            return;
        }

        const jsonFiles = files.filter(f => f.name?.endsWith('.json') && f.type === 'file');
        if (jsonFiles.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Нет JSON файлов в этой категории</p></div>';
            return;
        }

        const blocks = [];
        for (const file of jsonFiles) {
            try {
                const contentResponse = await fetch(file.download_url);
                const content = await contentResponse.json();
                blocks.push({
                    ...content,
                    filename: file.name,
                    path: file.path,
                    download_url: file.download_url
                });
            } catch (e) {
                console.error('Ошибка загрузки блока:', file.name, e);
                showNotification(`Не удалось загрузить ${file.name}`, 'error');
            }
        }
        
        renderBlocks(grid, blocks.filter(b => b !== null));
    } catch (error) {
        console.error('Ошибка загрузки блока:', error);
        const safeMessage = escapeHTML(error.message);
        grid.innerHTML = `<div class="empty-state error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Ошибка загрузки: ${safeMessage}</p>
        </div>`;
        showNotification(safeMessage, 'error');
    }
}

function renderBlocks(grid, blocks) {
    if (blocks.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Нет доступных блоков</p></div>';
        return;
    }
    
    let html = '';
    blocks.forEach(block => {
        const title = escapeHTML(block.title || block.name || 'Без названия');
        const description = escapeHTML(block.description || block.filename?.replace('.json', '') || 'Готовый блок');
        
        let elementsArray = [];
        if (block.elements && Array.isArray(block.elements)) {
            elementsArray = block.elements;
        } else {
            elementsArray = Object.values(block).filter(item => 
                item && typeof item === 'object' && item.type
            );
        }

        const blockData = {
            title,
            description,
            elements: elementsArray,
            filename: block.filename,
            path: block.path
        };
        
        const icon = getBlockIcon(block.type);
        const safeJSON = JSON.stringify(blockData)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/'/g, '\\u0027');
        
        let tagsHTML = '';
        if (block.tags && Array.isArray(block.tags)) {
            tagsHTML = '<div class="library-item-tags">' +
                block.tags.map(tag => `<span class="badge">${escapeHTML(tag)}</span>`).join('') +
                '</div>';
        }
        
        html += `
            <div class="library-item" data-block='${safeJSON}'>
                <div class="library-item-preview" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${icon}" style="font-size: 48px; color: white;"></i>
                </div>
                <div class="library-item-info">
                    <h6>${title}</h6>
                    <p>${description}</p>
                    ${tagsHTML}
                </div>
                <button class="library-item-insert" title="Вставить блок">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    grid.querySelectorAll('.library-item-insert').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const item = this.closest('.library-item');
            if (!item) return;
            try {
                const blockData = JSON.parse(item.dataset.block);
                insertLibraryBlock(blockData);
            } catch (err) {
                console.error('Ошибка парсинга данных блока:', err);
                showNotification('Не удалось вставить блок', 'error');
            }
        });
    });
}

function getBlockIcon(type) {
    const icons = {
        'page': 'fa-file-alt',
        'section': 'fa-layer-group',
        'block': 'fa-cube',
        'default': 'fa-cube'
    };
    return icons[type] || icons.default;
}

function filterBlocks(repoId, searchTerm) {
    const grid = document.getElementById(`library-grid-${repoId}`);
    if (!grid) return;
    
    const items = grid.querySelectorAll('.library-item');
    const term = searchTerm.toLowerCase().trim();
    
    items.forEach(item => {
        const title = item.querySelector('h6')?.textContent.toLowerCase() || '';
        const desc = item.querySelector('p')?.textContent.toLowerCase() || '';
        const tags = Array.from(item.querySelectorAll('.badge')).map(t => t.textContent.toLowerCase()).join(' ');
        
        const matches = term === '' || title.includes(term) || desc.includes(term) || tags.includes(term);
        item.style.display = matches ? 'flex' : 'none';
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function insertLibraryBlock(blockData) {
    const workspace = document.getElementById('workspace');
    if (!workspace) {
        console.error('Нет рабочей области');
        showNotification('Рабочая область не найдена', 'error');
        return;
    }
    
    try {
        const elements = blockData.elements;
        if (!elements || !Array.isArray(elements) || elements.length === 0) {
            showNotification('Блок не содержит элементов', 'error');
            return;
        }

        const cleanElements = elements.map(el => {
            if (el.values && el.values.classes) {
                el.values.classes = el.values.classes.replace(/selected/g, '').trim();
            }
            return el;
        });

        const reindexed = reindexElements(cleanElements);

        if (window.constructorApp && typeof window.constructorApp.appendStructuredData === 'function') {
            window.constructorApp.appendStructuredData(reindexed, workspace);
        } else {
            console.error('Не найдена функция appendStructuredData');
            showNotification('Ошибка: не удалось вставить блок', 'error');
            return;
        }
        
        closeLibraryModal();

        if (window.constructorApp && window.constructorApp.updateHtmlOutput) {
            window.constructorApp.updateHtmlOutput();
        }
        if (window.constructorApp && window.constructorApp.reinitializeEvents) {
            window.constructorApp.reinitializeEvents();
        }
    } catch (e) {
        console.error('Ошибка при вставке блока:', e);
        showNotification('Ошибка при вставке блока', 'error');
    }
}

function reindexElements(elements) {
    if (!elements || !Array.isArray(elements)) return elements;
    
    const maxIndex = getMaxElementIndex();
    let nextIndex = maxIndex + 1;
    const indexMap = new Map();
    
    const reindexed = elements.map(el => {
        let oldIndex = parseInt(el.index, 10);
        if (isNaN(oldIndex)) oldIndex = 0;
        const newIndex = nextIndex++;
        indexMap.set(oldIndex, newIndex);
        
        return {
            ...el,
            index: newIndex.toString()
        };
    });

    return reindexed.map(el => {
        let parentIdx = el.parentIndex;
        if (parentIdx === null || parentIdx === undefined || parentIdx === '') {
            return { ...el, parentIndex: null };
        }
        let oldParent = parseInt(parentIdx, 10);
        if (isNaN(oldParent)) return { ...el, parentIndex: null };
        
        const newParent = indexMap.get(oldParent);
        return {
            ...el,
            parentIndex: newParent !== undefined ? newParent.toString() : null
        };
    });
}

function getMaxElementIndex() {
    const workspace = document.getElementById('workspace');
    if (!workspace) return 0;
    
    let maxIndex = 0;
    const elements = workspace.querySelectorAll('.constructor-element');
    elements.forEach(el => {
        const dataIndex = el.dataset.index;
        if (dataIndex) {
            const idx = parseInt(dataIndex, 10);
            if (!isNaN(idx) && idx > maxIndex) maxIndex = idx;
        }
    });
    return maxIndex;
}