// Admin Emails Management JavaScript
class AdminEmailsManager {
    constructor() {
        this.admins = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
        this.selectedAdmins = new Set();
        this.editingAdmin = null;
        this.isSuperAdmin = false;
        
        this.init();
    }

    async init() {
        // Session-based authentication - cookies are sent automatically
        await this.loadAdmins();
        await this.checkSuperAdmin();
        this.setupEventListeners();
        this.updateStats();
    }

    async checkSuperAdmin() {
        try {
            // Get current user info from backend
            const response = await fetch('/api/management/admin-emails/current-user', {
                credentials: 'include' // Include session cookies
            });
            
            if (response.ok) {
                const data = await response.json();
                this.isSuperAdmin = data.isSuperAdmin === true;
                console.log('Current user is super admin:', this.isSuperAdmin);
            } else if (response.status === 401) {
                // Not authenticated, redirect to login
                this.showMessage('Please login to access this page', 'error');
                setTimeout(() => {
                    window.location.href = '/admin-login';
                }, 2000);
                return;
            } else {
                // If we can't determine super admin status, default to false for security
                this.isSuperAdmin = false;
                console.warn('Could not determine super admin status');
            }
        } catch (error) {
            console.error('Error checking super admin:', error);
            this.isSuperAdmin = false; // Default to false for security
        }
        
        // Update UI based on super admin status
        this.updateUIForSuperAdmin();
    }

    updateUIForSuperAdmin() {
        const createBtn = document.getElementById('createBtn');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        
        if (!this.isSuperAdmin) {
            if (createBtn) createBtn.style.display = 'none';
            if (bulkDeleteBtn) bulkDeleteBtn.style.display = 'none';
        }
    }

    makeAuthenticatedRequest(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        return fetch(url, {
            ...options,
            headers,
            credentials: 'include' // Include session cookies
        });
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
                this.loadAdmins();
            }, 300);
        });

        // Modal close on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('adminModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async loadAdmins() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await this.makeAuthenticatedRequest(`/api/management/admin-emails?${params}`);
            const data = await response.json();
            
            if (response.status === 401) {
                this.showMessage('Authentication required. Please login again.', 'error');
                setTimeout(() => {
                    window.location.href = '/admin-login';
                }, 2000);
                return;
            }

            if (response.status === 403) {
                this.showMessage(data.error || 'Insufficient permissions', 'error');
                return;
            }

            if (response.ok) {
                this.admins = data.data;
                this.totalPages = data.pagination.pages;
                this.renderAdmins();
                this.renderPagination();
                this.updateStats();
            } else {
                this.showMessage('Error loading admins: ' + (data.error || data.message), 'error');
            }
        } catch (error) {
            console.error('Error loading admins:', error);
            this.showMessage('Failed to load admins', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderAdmins() {
        const tbody = document.getElementById('adminsTableBody');
        
        if (this.admins.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-10 text-gray-600">
                        <i class="fas fa-users-cog text-4xl mb-4 text-gray-400"></i>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">No admins found</h3>
                        <p class="text-sm text-gray-600">Try adjusting your search criteria or add a new admin.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.admins.map(admin => `
            <tr class="transition-all duration-200 hover:bg-gray-100">
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <input type="checkbox" 
                           value="${admin._id}" 
                           onchange="adminEmailsManager.toggleAdminSelection('${admin._id}')"
                           ${this.selectedAdmins.has(admin._id) ? 'checked' : ''}
                           ${admin.isSuperAdmin ? 'disabled' : ''}>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    ${this.highlightSearch(admin.email)}
                    ${admin.isSuperAdmin ? '<span class="ml-2 text-xs text-gray-600">(Super Admin)</span>' : ''}
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">${admin.name || '-'}</td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">${admin.phone || '-'}</td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${admin.isActivated ? 'bg-gray-800 text-white' : 'bg-gray-600 text-white'}">
                        <i class="fas fa-${admin.isActivated ? 'check' : 'times'}"></i>
                        ${admin.isActivated ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <span class="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-800 text-white">
                        ${admin.role || 'Admin'}
                    </span>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">${this.formatDate(admin.createdAt)}</td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <div class="flex gap-2">
                        ${this.isSuperAdmin ? `
                            <button class="bg-black text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 shadow-sm hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md focus:outline-2 focus:outline-black focus:outline-offset-2 h-8 flex items-center justify-center gap-1 border-none cursor-pointer" onclick="adminEmailsManager.editAdmin('${admin._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${!admin.isSuperAdmin ? `
                                <button class="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 shadow-sm hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-md focus:outline-2 focus:outline-black focus:outline-offset-2 h-8 flex items-center justify-center gap-1 border-none cursor-pointer" onclick="adminEmailsManager.deleteAdmin('${admin._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        ` : ''}
                    </div>
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
            <button onclick="adminEmailsManager.goToPage(${this.currentPage - 1})" 
                    class="px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="adminEmailsManager.goToPage(${i})" 
                        class="px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 ${i === this.currentPage ? 'bg-black text-white border-black' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'}">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button onclick="adminEmailsManager.goToPage(${this.currentPage + 1})" 
                    class="px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async updateStats() {
        try {
            const response = await this.makeAuthenticatedRequest('/api/management/admin-emails/stats');
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('totalAdmins').textContent = data.totalAdmins || 0;
                document.getElementById('activeAdmins').textContent = data.activeAdmins || 0;
                document.getElementById('newAdmins').textContent = data.newAdmins || 0;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    openCreateModal() {
        if (!this.isSuperAdmin) {
            this.showMessage('Only super admin can create admin accounts', 'error');
            return;
        }

        this.editingAdmin = null;
        document.getElementById('modalTitle').textContent = 'Add New Admin';
        document.getElementById('adminForm').reset();
        document.getElementById('password').required = true;
        this.clearFormValidation();
        document.getElementById('adminModal').classList.remove('hidden');
    }

    editAdmin(adminId) {
        if (!this.isSuperAdmin) {
            this.showMessage('Only super admin can edit admin accounts', 'error');
            return;
        }

        const admin = this.admins.find(a => a._id === adminId);
        if (!admin) return;

        this.editingAdmin = admin;
        document.getElementById('modalTitle').textContent = 'Edit Admin';
        
        // Populate form
        document.getElementById('email').value = admin.email;
        document.getElementById('name').value = admin.name || '';
        document.getElementById('phone').value = admin.phone || '';
        document.getElementById('isActivated').value = admin.isActivated.toString();
        
        // Clear password field for editing
        document.getElementById('password').value = '';
        document.getElementById('password').required = false;
        
        this.clearFormValidation();
        document.getElementById('adminModal').classList.remove('hidden');
    }

    async saveAdmin() {
        if (!this.isSuperAdmin) {
            this.showMessage('Only super admin can save admin accounts', 'error');
            return;
        }

        const form = document.getElementById('adminForm');
        const formData = new FormData(form);
        
        const adminData = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name') || undefined,
            phone: formData.get('phone') || undefined,
            isActivated: formData.get('isActivated') === 'true'
        };

        // Validation
        if (!this.validateForm(adminData)) {
            return;
        }

        try {
            const url = this.editingAdmin 
                ? `/api/management/admin-emails/${this.editingAdmin._id}`
                : '/api/management/admin-emails';
            
            const method = this.editingAdmin ? 'PUT' : 'POST';
            
            // Remove password from update if not provided
            if (this.editingAdmin && !adminData.password) {
                delete adminData.password;
            }

            const response = await this.makeAuthenticatedRequest(url, {
                method: method,
                body: JSON.stringify(adminData)
            });

            const data = await response.json();

            if (response.status === 401) {
                this.showMessage('Authentication required. Please login again.', 'error');
                setTimeout(() => {
                    window.location.href = '/admin-login';
                }, 2000);
                return;
            }

            if (response.status === 403) {
                // Permission denied - show specific message
                this.showMessage(data.error || 'Only super admin can perform this action', 'error');
                return;
            }

            if (response.ok) {
                this.showMessage(data.message || 'Admin saved successfully', 'success');
                this.closeModal();
                await this.loadAdmins();
            } else {
                this.showMessage('Error: ' + (data.error || data.message), 'error');
            }
        } catch (error) {
            console.error('Error saving admin:', error);
            this.showMessage('Failed to save admin', 'error');
        }
    }

    validateForm(data) {
        let isValid = true;
        this.clearFormValidation();

        // Email validation
        if (!data.email || !this.isValidEmail(data.email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Password validation (only for new admins or if password is provided)
        if (!this.editingAdmin && (!data.password || data.password.length < 6)) {
            this.showFieldError('password', 'Password must be at least 6 characters long');
            isValid = false;
        }

        // Password validation for updates (if provided)
        if (this.editingAdmin && data.password && data.password.length < 6) {
            this.showFieldError('password', 'Password must be at least 6 characters long');
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorDiv = document.getElementById(fieldName + 'Error');
        
        if (field) field.classList.add('is-invalid');
        if (errorDiv) errorDiv.textContent = message;
    }

    clearFormValidation() {
        const fields = ['email', 'password'];
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const errorDiv = document.getElementById(fieldName + 'Error');
            
            if (field) field.classList.remove('is-invalid', 'is-valid');
            if (errorDiv) errorDiv.textContent = '';
        });
    }

    deleteAdmin(adminId) {
        if (!this.isSuperAdmin) {
            this.showMessage('Only super admin can delete admin accounts', 'error');
            return;
        }

        const admin = this.admins.find(a => a._id === adminId);
        if (admin && admin.isSuperAdmin) {
            this.showMessage('Cannot delete super admin account', 'error');
            return;
        }

        this.deletingAdminId = adminId;
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    async confirmDelete() {
        if (!this.deletingAdminId || !this.isSuperAdmin) return;

        try {
            const response = await this.makeAuthenticatedRequest(`/api/management/admin-emails/${this.deletingAdminId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.status === 401) {
                this.showMessage('Authentication required. Please login again.', 'error');
                setTimeout(() => {
                    window.location.href = '/admin-login';
                }, 2000);
                return;
            }

            if (response.status === 403) {
                // Permission denied - show specific message
                this.showMessage(data.error || 'Only super admin can perform this action', 'error');
                return;
            }

            if (response.ok) {
                this.showMessage(data.message || 'Admin deleted successfully', 'success');
                this.closeDeleteModal();
                await this.loadAdmins();
            } else {
                this.showMessage('Error: ' + (data.error || data.message), 'error');
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
            this.showMessage('Failed to delete admin', 'error');
        }
    }

    async bulkDelete() {
        if (!this.isSuperAdmin) {
            this.showMessage('Only super admin can delete admin accounts', 'error');
            return;
        }

        if (this.selectedAdmins.size === 0) return;

        try {
            const response = await this.makeAuthenticatedRequest('/api/management/admin-emails/bulk', {
                method: 'DELETE',
                body: JSON.stringify({ ids: Array.from(this.selectedAdmins) })
            });

            const data = await response.json();

            if (response.status === 401) {
                this.showMessage('Authentication required. Please login again.', 'error');
                setTimeout(() => {
                    window.location.href = '/admin-login';
                }, 2000);
                return;
            }

            if (response.status === 403) {
                // Permission denied - show specific message
                this.showMessage(data.error || 'Only super admin can perform this action', 'error');
                return;
            }

            if (response.ok) {
                this.showMessage(data.message || 'Admins deleted successfully', 'success');
                this.selectedAdmins.clear();
                this.updateBulkActions();
                await this.loadAdmins();
            } else {
                this.showMessage('Error: ' + (data.error || data.message), 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting admins:', error);
            this.showMessage('Failed to delete admins', 'error');
        }
    }

    toggleAdminSelection(adminId) {
        const admin = this.admins.find(a => a._id === adminId);
        if (admin && admin.isSuperAdmin) return; // Can't select super admin

        if (this.selectedAdmins.has(adminId)) {
            this.selectedAdmins.delete(adminId);
        } else {
            this.selectedAdmins.add(adminId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]:not(:disabled)');
        
        if (selectAllCheckbox.checked) {
            this.admins.forEach(admin => {
                if (!admin.isSuperAdmin) {
                    this.selectedAdmins.add(admin._id);
                }
            });
        } else {
            this.selectedAdmins.clear();
        }
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (bulkDeleteBtn) {
            bulkDeleteBtn.disabled = this.selectedAdmins.size === 0 || !this.isSuperAdmin;
        }
        
        if (this.selectedAdmins.size === 0) {
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
        } else {
            const selectableAdmins = this.admins.filter(a => !a.isSuperAdmin);
            if (this.selectedAdmins.size === selectableAdmins.length) {
                if (selectAllCheckbox) selectAllCheckbox.checked = true;
            } else {
                if (selectAllCheckbox) selectAllCheckbox.indeterminate = true;
            }
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadAdmins();
        }
    }

    closeModal() {
        document.getElementById('adminModal').classList.add('hidden');
        this.editingAdmin = null;
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.deletingAdminId = null;
    }

    showLoading() {
        const tbody = document.getElementById('adminsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-10 text-gray-600">
                    <div class="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    Loading admins...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderAdmins
    }

    highlightSearch(text) {
        if (!this.searchTerm || !text) return text;
        
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return text.replace(regex, '<span class="bg-yellow-200">$1</span>');
    }

    formatDate(dateString) {
        if (!dateString) return '-';
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
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            ${type === 'error' ? 'background: #fee; color: #c33; border-left: 4px solid #c33;' : ''}
            ${type === 'success' ? 'background: #efe; color: #3c3; border-left: 4px solid #3c3;' : ''}
            ${type === 'info' ? 'background: #eef; color: #33c; border-left: 4px solid #33c;' : ''}
        `;

        document.body.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function openCreateModal() {
    adminEmailsManager.openCreateModal();
}

function closeModal() {
    adminEmailsManager.closeModal();
}

function closeDeleteModal() {
    adminEmailsManager.closeDeleteModal();
}

function saveAdmin() {
    adminEmailsManager.saveAdmin();
}

function bulkDelete() {
    adminEmailsManager.bulkDelete();
}

function toggleSelectAll() {
    adminEmailsManager.toggleSelectAll();
}

function confirmDelete() {
    adminEmailsManager.confirmDelete();
}

// Initialize the admin emails manager when the page loads
let adminEmailsManager;
document.addEventListener('DOMContentLoaded', () => {
    adminEmailsManager = new AdminEmailsManager();
});

