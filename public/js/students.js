// Students Management JavaScript
class StudentsManager {
    constructor() {
        this.students = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
        this.selectedStudents = new Set();
        this.editingStudent = null;
        
        this.init();
    }

    async init() {
        await this.loadStudents();
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
                this.loadStudents();
            }, 300);
        });

        // Modal close on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('studentModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async loadStudents() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/students?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.students = data.data;
                this.totalPages = data.pagination.pages;
                this.renderStudents();
                this.renderPagination();
                this.updateStats();
            } else {
                this.showMessage('Error loading students: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading students:', error);
            this.showMessage('Failed to load students', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderStudents() {
        const tbody = document.getElementById('studentsTableBody');
        
        if (this.students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-10 text-gray-600">
                        <i class="fas fa-users text-4xl mb-4 text-gray-400"></i>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
                        <p class="text-sm text-gray-600">Try adjusting your search criteria or add a new student.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.students.map(student => `
            <tr class="transition-all duration-200 hover:bg-gray-100">
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <input type="checkbox" 
                           value="${student._id}" 
                           onchange="studentsManager.toggleStudentSelection('${student._id}')"
                           ${this.selectedStudents.has(student._id) ? 'checked' : ''}>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">${this.highlightSearch(student.email)}</td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <span class="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-800 text-white">
                        ${student.role}
                    </span>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${student.isActivated ? 'bg-gray-800 text-white' : 'bg-gray-600 text-white'}">
                        <i class="fas fa-${student.isActivated ? 'check' : 'times'}"></i>
                        ${student.isActivated ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">${this.formatDate(student.createdAt)}</td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <div class="flex gap-2">
                        <button class="bg-black text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 shadow-sm hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md focus:outline-2 focus:outline-black focus:outline-offset-2 h-8 flex items-center justify-center gap-1 border-none cursor-pointer" onclick="studentsManager.editStudent('${student._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 shadow-sm hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-md focus:outline-2 focus:outline-black focus:outline-offset-2 h-8 flex items-center justify-center gap-1 border-none cursor-pointer" onclick="studentsManager.deleteStudent('${student._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
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
            <button onclick="studentsManager.goToPage(${this.currentPage - 1})" 
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
                <button onclick="studentsManager.goToPage(${i})" 
                        class="px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 ${i === this.currentPage ? 'bg-black text-white border-black' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'}">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button onclick="studentsManager.goToPage(${this.currentPage + 1})" 
                    class="px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async updateStats() {
        try {
            const response = await fetch('/api/management/students?limit=1000');
            const data = await response.json();
            
            if (response.ok) {
                const students = data.data;
                const totalStudents = students.length;
                const activeStudents = students.filter(s => s.isActivated).length;
                const newStudents = students.filter(s => {
                    const created = new Date(s.createdAt);
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return created > monthAgo;
                }).length;

                document.getElementById('totalStudents').textContent = totalStudents;
                document.getElementById('activeStudents').textContent = activeStudents;
                document.getElementById('newStudents').textContent = newStudents;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    openCreateModal() {
        this.editingStudent = null;
        document.getElementById('modalTitle').textContent = 'Add New Student';
        document.getElementById('studentForm').reset();
        this.clearFormValidation();
        document.getElementById('studentModal').classList.remove('hidden');
    }

    editStudent(studentId) {
        const student = this.students.find(s => s._id === studentId);
        if (!student) return;

        this.editingStudent = student;
        document.getElementById('modalTitle').textContent = 'Edit Student';
        
        // Populate form
        document.getElementById('email').value = student.email;
        document.getElementById('role').value = student.role;
        document.getElementById('isActivated').value = student.isActivated.toString();
        
        // Clear password field for editing
        document.getElementById('password').value = '';
        document.getElementById('password').required = false;
        
        this.clearFormValidation();
        document.getElementById('studentModal').classList.remove('hidden');
    }

    async saveStudent() {
        const form = document.getElementById('studentForm');
        const formData = new FormData(form);
        
        const studentData = {
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            isActivated: formData.get('isActivated') === 'true'
        };

        // Validation
        if (!this.validateForm(studentData)) {
            return;
        }

        try {
            const url = this.editingStudent 
                ? `/api/management/students/${this.editingStudent._id}`
                : '/api/management/students';
            
            const method = this.editingStudent ? 'PUT' : 'POST';
            
            // Remove password from update if not provided
            if (this.editingStudent && !studentData.password) {
                delete studentData.password;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadStudents();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving student:', error);
            this.showMessage('Failed to save student', 'error');
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

        // Password validation (only for new students or if password is provided)
        if (!this.editingStudent && (!data.password || data.password.length < 6)) {
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
        
        field.classList.add('is-invalid');
        errorDiv.textContent = message;
    }

    clearFormValidation() {
        const fields = ['email', 'password'];
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const errorDiv = document.getElementById(fieldName + 'Error');
            
            field.classList.remove('is-invalid', 'is-valid');
            errorDiv.textContent = '';
        });
    }

    deleteStudent(studentId) {
        this.deletingStudentId = studentId;
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    async confirmDelete() {
        if (!this.deletingStudentId) return;

        try {
            const response = await fetch(`/api/management/students/${this.deletingStudentId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeDeleteModal();
                await this.loadStudents();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            this.showMessage('Failed to delete student', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedStudents.size === 0) return;

        try {
            const response = await fetch('/api/management/students/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedStudents) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedStudents.clear();
                this.updateBulkActions();
                await this.loadStudents();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting students:', error);
            this.showMessage('Failed to delete students', 'error');
        }
    }

    toggleStudentSelection(studentId) {
        if (this.selectedStudents.has(studentId)) {
            this.selectedStudents.delete(studentId);
        } else {
            this.selectedStudents.add(studentId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
        
        if (selectAllCheckbox.checked) {
            this.students.forEach(student => {
                this.selectedStudents.add(student._id);
            });
        } else {
            this.selectedStudents.clear();
        }
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        bulkDeleteBtn.disabled = this.selectedStudents.size === 0;
        
        if (this.selectedStudents.size === 0) {
            selectAllCheckbox.checked = false;
        } else if (this.selectedStudents.size === this.students.length) {
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadStudents();
        }
    }

    closeModal() {
        document.getElementById('studentModal').classList.add('hidden');
        this.editingStudent = null;
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.deletingStudentId = null;
    }

    showLoading() {
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-10 text-gray-600">
                    <div class="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    Loading students...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderStudents
    }

    highlightSearch(text) {
        if (!this.searchTerm) return text;
        
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
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
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;

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
    studentsManager.openCreateModal();
}

function closeModal() {
    studentsManager.closeModal();
}

function closeDeleteModal() {
    studentsManager.closeDeleteModal();
}

function saveStudent() {
    studentsManager.saveStudent();
}

function bulkDelete() {
    studentsManager.bulkDelete();
}

function toggleSelectAll() {
    studentsManager.toggleSelectAll();
}

function confirmDelete() {
    studentsManager.confirmDelete();
}

// Initialize the students manager when the page loads
let studentsManager;
document.addEventListener('DOMContentLoaded', () => {
    studentsManager = new StudentsManager();
});
