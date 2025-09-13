class UserProgressManager {
    constructor() {
        this.progressRecords = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'lastAccessedAt';
        this.sortOrder = 'desc';
        this.selectedProgress = new Set();
        this.editingProgress = null;
        
        this.init();
    }

    async init() {
        await this.loadProgress();
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
                this.loadProgress();
            }, 500);
        });
    }

    async loadProgress() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/user-progress?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.progressRecords = data.data;
                this.totalPages = data.pagination.pages;
                this.renderProgress();
                this.renderPagination();
            } else {
                this.showMessage('Error loading progress: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading progress:', error);
            this.showMessage('Failed to load progress', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderProgress() {
        const tbody = document.getElementById('progressTableBody');
        
        if (this.progressRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-chart-line"></i>
                        <h3>No progress records found</h3>
                        <p>Try adjusting your search criteria.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.progressRecords.map(progress => `
            <tr>
                <td>
                    <input type="checkbox" 
                           value="${progress._id}" 
                           onchange="userProgressManager.toggleProgressSelection('${progress._id}')"
                           ${this.selectedProgress.has(progress._id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="student-name">${progress.user ? progress.user.name || progress.user.email : 'N/A'}</div>
                </td>
                <td>
                    <div class="course-title">${progress.course ? progress.course.title : 'N/A'}</div>
                </td>
                <td>
                    <div class="chapter-title">${progress.chapterTitle || 'N/A'}</div>
                </td>
                <td>
                    <span class="status-badge ${progress.status}">${progress.status || 'not_started'}</span>
                </td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.completionPercentage || 0}%"></div>
                        <span class="progress-text">${progress.completionPercentage || 0}%</span>
                    </div>
                </td>
                <td>
                    <span class="time-spent">${progress.timeSpent || 0} min</span>
                </td>
                <td class="date-cell">${this.formatDate(progress.lastAccessedAt)}</td>
                <td class="action-buttons-cell">
                    <button class="btn btn-sm btn-primary" onclick="userProgressManager.editProgress('${progress._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="userProgressManager.deleteProgress('${progress._id}')">
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
            <button onclick="userProgressManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="userProgressManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        paginationHTML += `
            <button onclick="userProgressManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            await this.loadProgress();
        }
    }

    editProgress(progressId) {
        const progress = this.progressRecords.find(p => p._id === progressId);
        if (!progress) return;

        this.editingProgress = progress;
        
        document.getElementById('status').value = progress.status || 'not_started';
        document.getElementById('completionPercentage').value = progress.completionPercentage || 0;
        document.getElementById('timeSpent').value = progress.timeSpent || 0;
        
        this.clearFormValidation();
        document.getElementById('progressModal').style.display = 'block';
    }

    async saveProgress() {
        const form = document.getElementById('progressForm');
        const formData = new FormData(form);

        const progressData = {
            status: formData.get('status'),
            completionPercentage: parseInt(formData.get('completionPercentage')),
            timeSpent: parseInt(formData.get('timeSpent'))
        };

        if (!this.validateForm(progressData)) {
            return;
        }

        try {
            const response = await fetch(`/api/management/user-progress/${this.editingProgress._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(progressData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadProgress();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            this.showMessage('Failed to save progress', 'error');
        }
    }

    validateForm(data) {
        let isValid = true;
        this.clearFormValidation();

        if (!data.status) {
            this.showFieldError('status', 'Status is required');
            isValid = false;
        }

        if (data.completionPercentage < 0 || data.completionPercentage > 100) {
            this.showFieldError('completionPercentage', 'Completion percentage must be between 0 and 100');
            isValid = false;
        }

        if (data.timeSpent < 0) {
            this.showFieldError('timeSpent', 'Time spent cannot be negative');
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
        const fields = ['status', 'completionPercentage', 'timeSpent'];
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
        this.editingProgress = null;
        document.getElementById('progressModal').style.display = 'none';
        document.getElementById('progressForm').reset();
        this.clearFormValidation();
    }

    async deleteProgress(progressId) {
        if (!confirm('Are you sure you want to delete this progress record?')) {
            return;
        }

        try {
            const response = await fetch(`/api/management/user-progress/${progressId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                await this.loadProgress();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting progress:', error);
            this.showMessage('Failed to delete progress', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedProgress.size === 0) return;

        try {
            const response = await fetch('/api/management/user-progress/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedProgress) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedProgress.clear();
                this.updateBulkActions();
                await this.loadProgress();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting progress:', error);
            this.showMessage('Failed to delete progress records', 'error');
        }
    }

    toggleProgressSelection(progressId) {
        if (this.selectedProgress.has(progressId)) {
            this.selectedProgress.delete(progressId);
        } else {
            this.selectedProgress.add(progressId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
        
        if (selectAllCheckbox.checked) {
            checkboxes.forEach(checkbox => {
                this.selectedProgress.add(checkbox.value);
                checkbox.checked = true;
            });
        } else {
            this.selectedProgress.clear();
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (this.selectedProgress.size > 0) {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.textContent = `Delete Selected (${this.selectedProgress.size})`;
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
        const tbody = document.getElementById('progressTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="loading">
                    <div class="spinner"></div>
                    Loading progress records...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderProgress
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
function closeModal() {
    userProgressManager.closeModal();
}

function saveProgress() {
    userProgressManager.saveProgress();
}

function bulkDelete() {
    userProgressManager.bulkDelete();
}

function toggleSelectAll() {
    userProgressManager.toggleSelectAll();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    window.userProgressManager = new UserProgressManager();
});

if (document.readyState === 'loading') {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
} else {
    window.userProgressManager = new UserProgressManager();
}
