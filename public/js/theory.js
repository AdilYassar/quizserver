class TheoryManager {
    constructor() {
        this.theories = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'courseTitle';
        this.sortOrder = 'asc';
        this.selectedTheories = new Set();
        this.editingTheory = null;
        
        this.init();
    }

    async init() {
        await this.loadTheories();
        await this.loadCourses();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.loadTheories();
            }, 500);
        });
    }

    async loadTheories() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/theory?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.theories = data.data;
                this.totalPages = data.pagination.pages;
                this.renderTheories();
                this.renderPagination();
            } else {
                this.showMessage('Error loading theories: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading theories:', error);
            this.showMessage('Failed to load theories', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadCourses() {
        try {
            const response = await fetch('/api/management/courses');
            const data = await response.json();
            
            if (response.ok) {
                this.courses = data.data || [];
                this.populateCourseSelect();
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    }

    populateCourseSelect() {
        const select = document.getElementById('courseId');
        if (!select || !this.courses) return;
        
        select.innerHTML = '<option value="">Select a course...</option>';
        this.courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course._id;
            option.textContent = course.title;
            select.appendChild(option);
        });
    }

    renderTheories() {
        const tbody = document.getElementById('theoryTableBody');
        
        if (this.theories.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-book-open"></i>
                        <h3>No theory content found</h3>
                        <p>Try adjusting your search criteria or add new theory content.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.theories.map(theory => `
            <tr>
                <td>
                    <input type="checkbox" 
                           value="${theory._id}" 
                           onchange="theoryManager.toggleTheorySelection('${theory._id}')"
                           ${this.selectedTheories.has(theory._id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="theory-title">${this.highlightSearch(theory.courseTitle)}</div>
                </td>
                <td>
                    <div class="course-title">${theory.course ? theory.course.title : 'N/A'}</div>
                </td>
                <td>
                    <span class="chapters-count">
                        <i class="fas fa-list"></i>
                        ${theory.chapters ? theory.chapters.length : 0}
                    </span>
                </td>
                <td>
                    <div class="theory-description">${theory.description || 'No description'}</div>
                </td>
                <td class="action-buttons-cell">
                    <button class="btn btn-sm btn-primary" onclick="theoryManager.editTheory('${theory._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="theoryManager.deleteTheory('${theory._id}')">
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
        
        paginationHTML += `
            <button onclick="theoryManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="theoryManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        paginationHTML += `
            <button onclick="theoryManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            await this.loadTheories();
        }
    }

    openCreateModal() {
        this.editingTheory = null;
        document.getElementById('modalTitle').textContent = 'Add New Theory';
        document.getElementById('theoryForm').reset();
        this.clearFormValidation();
        document.getElementById('theoryModal').style.display = 'block';
    }

    editTheory(theoryId) {
        const theory = this.theories.find(t => t._id === theoryId);
        if (!theory) return;

        this.editingTheory = theory;
        document.getElementById('modalTitle').textContent = 'Edit Theory';
        
        document.getElementById('courseTitle').value = theory.courseTitle;
        document.getElementById('courseId').value = theory.course ? theory.course._id : '';
        document.getElementById('description').value = theory.description || '';
        
        this.clearFormValidation();
        document.getElementById('theoryModal').style.display = 'block';
    }

    async saveTheory() {
        const form = document.getElementById('theoryForm');
        const formData = new FormData(form);

        const theoryData = {
            courseTitle: formData.get('courseTitle'),
            courseId: formData.get('courseId'),
            description: formData.get('description'),
            chapters: []
        };

        if (!this.validateForm(theoryData)) {
            return;
        }

        try {
            const url = this.editingTheory 
                ? `/api/management/theory/${this.editingTheory._id}`
                : '/api/management/theory';
            
            const method = this.editingTheory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(theoryData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadTheories();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving theory:', error);
            this.showMessage('Failed to save theory', 'error');
        }
    }

    validateForm(data) {
        let isValid = true;
        this.clearFormValidation();

        if (!data.courseTitle || data.courseTitle.trim().length === 0) {
            this.showFieldError('courseTitle', 'Course title is required');
            isValid = false;
        }

        if (!data.courseId) {
            this.showFieldError('courseId', 'Course is required');
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
        const fields = ['courseTitle', 'courseId', 'description'];
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
        this.editingTheory = null;
        document.getElementById('theoryModal').style.display = 'none';
        document.getElementById('theoryForm').reset();
        this.clearFormValidation();
    }

    async deleteTheory(theoryId) {
        if (!confirm('Are you sure you want to delete this theory content?')) {
            return;
        }

        try {
            const response = await fetch(`/api/management/theory/${theoryId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                await this.loadTheories();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting theory:', error);
            this.showMessage('Failed to delete theory', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedTheories.size === 0) return;

        try {
            const response = await fetch('/api/management/theory/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedTheories) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedTheories.clear();
                this.updateBulkActions();
                await this.loadTheories();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting theories:', error);
            this.showMessage('Failed to delete theories', 'error');
        }
    }

    toggleTheorySelection(theoryId) {
        if (this.selectedTheories.has(theoryId)) {
            this.selectedTheories.delete(theoryId);
        } else {
            this.selectedTheories.add(theoryId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
        
        if (selectAllCheckbox.checked) {
            checkboxes.forEach(checkbox => {
                this.selectedTheories.add(checkbox.value);
                checkbox.checked = true;
            });
        } else {
            this.selectedTheories.clear();
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (this.selectedTheories.size > 0) {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.textContent = `Delete Selected (${this.selectedTheories.size})`;
        } else {
            bulkDeleteBtn.disabled = true;
            bulkDeleteBtn.textContent = 'Delete Selected';
        }
        
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
        const tbody = document.getElementById('theoryTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    <div class="spinner"></div>
                    Loading theory content...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderTheories
    }

    highlightSearch(text) {
        if (!this.searchTerm) return text;
        
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    showMessage(message, type = 'info') {
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        const pageHeader = document.querySelector('.page-header');
        pageHeader.insertAdjacentElement('afterend', messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Global functions
function openCreateModal() {
    theoryManager.openCreateModal();
}

function closeModal() {
    theoryManager.closeModal();
}

function saveTheory() {
    theoryManager.saveTheory();
}

function bulkDelete() {
    theoryManager.bulkDelete();
}

function toggleSelectAll() {
    theoryManager.toggleSelectAll();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    window.theoryManager = new TheoryManager();
});

if (document.readyState === 'loading') {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
} else {
    window.theoryManager = new TheoryManager();
}
