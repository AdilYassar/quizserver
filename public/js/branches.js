class BranchesManager {
    constructor() {
        this.branches = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.selectedBranches = new Set();
        this.editingBranch = null;
        
        this.init();
    }

    async init() {
        await this.loadBranches();
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
                this.loadBranches();
            }, 500);
        });
    }

    async loadBranches() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/branches?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.branches = data.data;
                this.totalPages = data.pagination.pages;
                this.renderBranches();
                this.renderPagination();
            } else {
                this.showMessage('Error loading branches: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading branches:', error);
            this.showMessage('Failed to load branches', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderBranches() {
        const tbody = document.getElementById('branchesTableBody');
        
        if (this.branches.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-building"></i>
                        <h3>No branches found</h3>
                        <p>Try adjusting your search criteria or add a new branch.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.branches.map(branch => `
            <tr>
                <td>
                    <input type="checkbox" 
                           value="${branch._id}" 
                           onchange="branchesManager.toggleBranchSelection('${branch._id}')"
                           ${this.selectedBranches.has(branch._id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="branch-name">${this.highlightSearch(branch.name)}</div>
                </td>
                <td>
                    <div class="branch-location">${this.highlightSearch(branch.location)}</div>
                </td>
                <td>
                    <span class="courses-count">
                        <i class="fas fa-book"></i>
                        ${branch.courses ? branch.courses.length : 0}
                    </span>
                </td>
                <td class="action-buttons-cell">
                    <button class="btn btn-sm btn-primary" onclick="branchesManager.editBranch('${branch._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="branchesManager.deleteBranch('${branch._id}')">
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
            <button onclick="branchesManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="branchesManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        paginationHTML += `
            <button onclick="branchesManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            await this.loadBranches();
        }
    }

    openCreateModal() {
        this.editingBranch = null;
        document.getElementById('modalTitle').textContent = 'Add New Branch';
        document.getElementById('branchForm').reset();
        this.clearFormValidation();
        document.getElementById('branchModal').style.display = 'block';
    }

    editBranch(branchId) {
        const branch = this.branches.find(b => b._id === branchId);
        if (!branch) return;

        this.editingBranch = branch;
        document.getElementById('modalTitle').textContent = 'Edit Branch';
        
        document.getElementById('name').value = branch.name;
        document.getElementById('location').value = branch.location;
        
        this.clearFormValidation();
        document.getElementById('branchModal').style.display = 'block';
    }

    async saveBranch() {
        const form = document.getElementById('branchForm');
        const formData = new FormData(form);

        const branchData = {
            name: formData.get('name'),
            location: formData.get('location'),
            courses: []
        };

        if (!this.validateForm(branchData)) {
            return;
        }

        try {
            const url = this.editingBranch 
                ? `/api/management/branches/${this.editingBranch._id}`
                : '/api/management/branches';
            
            const method = this.editingBranch ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(branchData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadBranches();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving branch:', error);
            this.showMessage('Failed to save branch', 'error');
        }
    }

    validateForm(data) {
        let isValid = true;
        this.clearFormValidation();

        if (!data.name || data.name.trim().length === 0) {
            this.showFieldError('name', 'Name is required');
            isValid = false;
        }

        if (!data.location || data.location.trim().length === 0) {
            this.showFieldError('location', 'Location is required');
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
        const fields = ['name', 'location'];
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
        this.editingBranch = null;
        document.getElementById('branchModal').style.display = 'none';
        document.getElementById('branchForm').reset();
        this.clearFormValidation();
    }

    async deleteBranch(branchId) {
        if (!confirm('Are you sure you want to delete this branch?')) {
            return;
        }

        try {
            const response = await fetch(`/api/management/branches/${branchId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                await this.loadBranches();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting branch:', error);
            this.showMessage('Failed to delete branch', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedBranches.size === 0) return;

        try {
            const response = await fetch('/api/management/branches/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedBranches) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedBranches.clear();
                this.updateBulkActions();
                await this.loadBranches();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting branches:', error);
            this.showMessage('Failed to delete branches', 'error');
        }
    }

    toggleBranchSelection(branchId) {
        if (this.selectedBranches.has(branchId)) {
            this.selectedBranches.delete(branchId);
        } else {
            this.selectedBranches.add(branchId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
        
        if (selectAllCheckbox.checked) {
            checkboxes.forEach(checkbox => {
                this.selectedBranches.add(checkbox.value);
                checkbox.checked = true;
            });
        } else {
            this.selectedBranches.clear();
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (this.selectedBranches.size > 0) {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.textContent = `Delete Selected (${this.selectedBranches.size})`;
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
        const tbody = document.getElementById('branchesTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="loading">
                    <div class="spinner"></div>
                    Loading branches...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderBranches
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
    branchesManager.openCreateModal();
}

function closeModal() {
    branchesManager.closeModal();
}

function saveBranch() {
    branchesManager.saveBranch();
}

function bulkDelete() {
    branchesManager.bulkDelete();
}

function toggleSelectAll() {
    branchesManager.toggleSelectAll();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    window.branchesManager = new BranchesManager();
});

if (document.readyState === 'loading') {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
} else {
    window.branchesManager = new BranchesManager();
}
