class CategoriesManager {
    constructor() {
        this.categories = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.selectedCategories = new Set();
        this.editingCategory = null;
        
        this.init();
    }

    async init() {
        await this.loadCategories();
        this.setupEventListeners();
        this.updateStats();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.loadCategories();
            }, 500);
        });
    }

    async loadCategories() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/categories?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.categories = data.data;
                this.totalPages = data.pagination.pages;
                this.renderCategories();
                this.renderPagination();
                this.updateStats();
            } else {
                this.showMessage('Error loading categories: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showMessage('Failed to load categories', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderCategories() {
        const tbody = document.getElementById('categoriesTableBody');
        
        if (this.categories.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-tags"></i>
                        <h3>No categories found</h3>
                        <p>Try adjusting your search criteria or add a new category.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.categories.map(category => `
            <tr>
                <td>
                    <input type="checkbox" 
                           value="${category._id}" 
                           onchange="categoriesManager.toggleCategorySelection('${category._id}')"
                           ${this.selectedCategories.has(category._id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="category-name">${this.highlightSearch(category.name)}</div>
                </td>
                <td>
                    <div class="category-image">
                        <img src="${category.image}" alt="${category.name}" 
                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMEMyMi43NjE0IDEwIDI1IDEyLjIzODYgMjUgMTVDMjUgMTcuNzYxNCAyMi43NjE0IDIwIDIwIDIwQzE3LjIzODYgMjAgMTUgMTcuNzYxNCAxNSAxNUMxNSAxMi4yMzg2IDE3LjIzODYgMTAgMjAgMTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yMCAyNUMxNi42ODYzIDI1IDE0IDIyLjMxMzcgMTQgMTlDMTQgMTUuNjg2MyAxNi42ODYzIDEzIDIwIDEzQzIzLjMxMzcgMTMgMjYgMTUuNjg2MyAyNiAxOUMyNiAyMi4zMTM3IDIzLjMxMzcgMjUgMjAgMjVaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='">
                    </div>
                </td>
                <td>
                    <span class="quiz-category-badge ${category.isQuizCategory ? 'yes' : 'no'}">
                        ${category.isQuizCategory ? 'Yes' : 'No'}
                    </span>
                </td>
                <td class="action-buttons-cell">
                    <button class="btn btn-sm btn-primary" onclick="categoriesManager.editCategory('${category._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="categoriesManager.deleteCategory('${category._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        
        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button onclick="categoriesManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="categoriesManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button onclick="categoriesManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            await this.loadCategories();
        }
    }

    openCreateModal() {
        this.editingCategory = null;
        document.getElementById('modalTitle').textContent = 'Add New Category';
        document.getElementById('categoryForm').reset();
        this.clearFormValidation();
        document.getElementById('categoryModal').style.display = 'block';
    }

    editCategory(categoryId) {
        const category = this.categories.find(c => c._id === categoryId);
        if (!category) return;

        this.editingCategory = category;
        document.getElementById('modalTitle').textContent = 'Edit Category';
        
        // Populate form
        document.getElementById('name').value = category.name;
        document.getElementById('image').value = category.image;
        document.getElementById('isQuizCategory').value = category.isQuizCategory.toString();
        
        this.clearFormValidation();
        document.getElementById('categoryModal').style.display = 'block';
    }

    async saveCategory() {
        const form = document.getElementById('categoryForm');
        const formData = new FormData(form);

        const categoryData = {
            name: formData.get('name'),
            image: formData.get('image'),
            isQuizCategory: formData.get('isQuizCategory') === 'true'
        };

        // Validation
        if (!this.validateForm(categoryData)) {
            return;
        }

        try {
            const url = this.editingCategory 
                ? `/api/management/categories/${this.editingCategory._id}`
                : '/api/management/categories';
            
            const method = this.editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadCategories();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            this.showMessage('Failed to save category', 'error');
        }
    }

    validateForm(data) {
        let isValid = true;
        this.clearFormValidation();

        // Name validation
        if (!data.name || data.name.trim().length === 0) {
            this.showFieldError('name', 'Name is required');
            isValid = false;
        }

        // Image validation
        if (!data.image || data.image.trim().length === 0) {
            this.showFieldError('image', 'Image URL is required');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorDiv = document.getElementById(fieldName + 'Error');
        
        if (field) {
            field.classList.add('is-invalid');
        }
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }

    clearFormValidation() {
        const fields = ['name', 'image', 'isQuizCategory'];
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const errorDiv = document.getElementById(fieldName + 'Error');
            
            if (field) {
                field.classList.remove('is-invalid', 'is-valid');
            }
            if (errorDiv) {
                errorDiv.textContent = '';
            }
        });
    }

    closeModal() {
        this.editingCategory = null;
        document.getElementById('categoryModal').style.display = 'none';
        document.getElementById('categoryForm').reset();
        this.clearFormValidation();
    }

    async deleteCategory(categoryId) {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            const response = await fetch(`/api/management/categories/${categoryId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                await this.loadCategories();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showMessage('Failed to delete category', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedCategories.size === 0) return;

        try {
            const response = await fetch('/api/management/categories/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedCategories) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedCategories.clear();
                this.updateBulkActions();
                await this.loadCategories();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting categories:', error);
            this.showMessage('Failed to delete categories', 'error');
        }
    }

    toggleCategorySelection(categoryId) {
        if (this.selectedCategories.has(categoryId)) {
            this.selectedCategories.delete(categoryId);
        } else {
            this.selectedCategories.add(categoryId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
        
        if (selectAllCheckbox.checked) {
            checkboxes.forEach(checkbox => {
                this.selectedCategories.add(checkbox.value);
                checkbox.checked = true;
            });
        } else {
            this.selectedCategories.clear();
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (this.selectedCategories.size > 0) {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.textContent = `Delete Selected (${this.selectedCategories.size})`;
        } else {
            bulkDeleteBtn.disabled = true;
            bulkDeleteBtn.textContent = 'Delete Selected';
        }
        
        // Update select all checkbox state
        const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        if (checkedCount === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedCount === checkboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    showLoading() {
        const tbody = document.getElementById('categoriesTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="loading">
                    <div class="spinner"></div>
                    Loading categories...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderCategories
    }

    highlightSearch(text) {
        if (!this.searchTerm) return text;
        
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Insert at the top of the page
        const pageHeader = document.querySelector('.page-header');
        pageHeader.insertAdjacentElement('afterend', messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    updateStats() {
        // Update any stats if needed
    }
}

// Global functions for HTML onclick handlers
function openCreateModal() {
    categoriesManager.openCreateModal();
}

function closeModal() {
    categoriesManager.closeModal();
}

function saveCategory() {
    categoriesManager.saveCategory();
}

function bulkDelete() {
    categoriesManager.bulkDelete();
}

function toggleSelectAll() {
    categoriesManager.toggleSelectAll();
}

function closeDeleteModal() {
    categoriesManager.closeDeleteModal();
}

// Initialize the manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing categories manager...');
    window.categoriesManager = new CategoriesManager();
    console.log('Categories manager initialized:', window.categoriesManager);
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
} else {
    console.log('DOM already loaded, initializing immediately...');
    window.categoriesManager = new CategoriesManager();
    console.log('Categories manager initialized immediately:', window.categoriesManager);
}
