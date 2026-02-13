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

    const closeBtn = modal.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeLibraryModal());
    }

    const closeFooterBtn = modal.querySelector('.btn-secondary');
    if (closeFooterBtn) {
        closeFooterBtn.addEventListener('click', () => closeLibraryModal());
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLibraryModal();
        }
    });

    document.querySelectorAll('.category-item').forEach(category => {
        category.addEventListener('click', function(e) {
            e.preventDefault();
            
            const repoId = this.closest('.category-list')?.dataset.repo;
            if (!repoId) return;

            document.querySelectorAll(`.category-list[data-repo="${repoId}"] .category-item`).forEach(c => {
                c.classList.remove('active');
            });
            
            this.classList.add('active');

            const tabPane = document.querySelector(`#repo-${repoId}`);
            if (tabPane) {
                loadBlocksFromGithub(repoId, this.dataset.path);
            }
        });
    });

    document.querySelectorAll('.nav-tabs .nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();

            document.querySelectorAll('.nav-tabs .nav-link').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');

            const targetId = this.getAttribute('data-bs-target') || this.getAttribute('href');
            if (targetId) {
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                const targetPane = document.querySelector(targetId);
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                    const repoId = targetPane.id.replace('repo-', '');
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
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('modal-open');

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
    
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
}

async function loadBlocksFromGithub(repoId, path = '') {
    const repo = window.formBuilderData?.repositories?.find(r => r.id === repoId);
    if (!repo) {
        console.error('Репозиторий не найден:', repoId);
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
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const files = await response.json();

        if (!Array.isArray(files)) {
            console.error('GitHub API вернул:', files);
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
            }
        }
        
        renderBlocks(grid, blocks.filter(b => b !== null));
        
    } catch (error) {
        console.error('Ошибка загрузки блока:', error);
        grid.innerHTML = `<div class="empty-state error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Ошибка загрузки: ${error.message}</p>
        </div>`;
    }
}

function renderBlocks(grid, blocks) {
    if (blocks.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Нет доступных блоков</p></div>';
        return;
    }
    
    let html = '';
    blocks.forEach(block => {
        const title = block.title || block.name || 'Без названия';
        const description = block.description || block.filename?.replace('.json', '') || 'Готовый блок';
        let elementsArray = [];
        if (block.elements && Array.isArray(block.elements)) {
            elementsArray = block.elements;
        } else {
            elementsArray = Object.values(block).filter(item => 
                item && typeof item === 'object' && item.type
            );
        }

        const blockData = {
            title: title,
            description: description,
            elements: elementsArray,
            filename: block.filename,
            path: block.path
        };
        
        const icon = getBlockIcon(block.type);
        
        html += `
            <div class="library-item" data-block='${JSON.stringify(blockData).replace(/'/g, '&apos;')}'>
                <div class="library-item-preview" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${icon}" style="font-size: 48px; color: white;"></i>
                </div>
                <div class="library-item-info">
                    <h6>${title}</h6>
                    <p>${description}</p>
                    ${block.tags ? `
                    <div class="library-item-tags">
                        ${block.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}
                    </div>
                    ` : ''}
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
                window.insertLibraryBlock(blockData);
            } catch (e) {
                console.error('Ошибка парсинга данных:', e);
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
        
        if (term === '' || title.includes(term) || desc.includes(term) || tags.includes(term)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
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

window.insertLibraryBlock = function(blockData) {
    const workspace = document.getElementById('workspace');
    if (!workspace) {
        console.error('Нет рабочей области');
        return;
    }
    
    try {
        const elements = blockData.elements;
        
        if (elements && Array.isArray(elements) && elements.length > 0) {
            const cleanElements = elements.map(el => {
                if (el.values && el.values.classes) {
                    el.values.classes = el.values.classes.replace(/selected/g, '').trim();
                }
                return el;
            });
            const reindexedElements = reindexElements(cleanElements);

            if (typeof window.loadFromStructuredData === 'function') {
                window.loadFromStructuredData(reindexedElements, workspace);
            } 
            else if (window.constructorApp && typeof window.constructorApp.loadFromStructuredData === 'function') {
                window.constructorApp.loadFromStructuredData(reindexedElements, workspace);
            }
            else {
                console.error('Не найдена функция loadFromStructuredData');
                return;
            }
        }

        closeLibraryModal();

        if (window.constructorApp && window.constructorApp.updateHtmlOutput) {
            setTimeout(() => {
                window.constructorApp.updateHtmlOutput();
            }, 100);
        }
        
    } catch (e) {
        console.error('Ошибка при вставке блока:', e);
    }
};

function reindexElements(elements) {
    if (!elements || !Array.isArray(elements)) return elements;

    const maxIndex = getMaxElementIndex();
    let nextIndex = maxIndex + 1;
    const indexMap = new Map();
    const reindexed = elements.map(el => {
        const oldIndex = parseInt(el.index) || 0;
        const newIndex = nextIndex++;
        indexMap.set(oldIndex, newIndex);
        
        return {
            ...el,
            index: newIndex.toString()
        };
    });

    return reindexed.map(el => {
        if (el.parentIndex !== null && el.parentIndex !== undefined && el.parentIndex !== '') {
            const oldParentIndex = parseInt(el.parentIndex);
            const newParentIndex = indexMap.get(oldParentIndex);
            
            if (newParentIndex !== undefined) {
                return {
                    ...el,
                    parentIndex: newParentIndex.toString()
                };
            }
        }
        return {
            ...el,
            parentIndex: null
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
            const index = parseInt(dataIndex);
            if (!isNaN(index) && index > maxIndex) {
                maxIndex = index;
            }
        }
    });
    
    return maxIndex;
}