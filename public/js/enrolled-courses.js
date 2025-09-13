class EnrolledCoursesManager {
    constructor() {
        this.enrollments = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'enrolledAt';
        this.sortOrder = 'desc';
        this.selectedEnrollments = new Set();
        this.editingEnrollment = null;
        
        this.init();
    }

    async init() {
        await this.loadEnrollments();
        await this.loadUsers();
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
                this.loadEnrollments();
            }, 500);
        });
    }

    async loadEnrollments() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/enrolled-courses?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.enrollments = data.data;
                this.totalPages = data.pagination.pages;
                this.renderEnrollments();
                this.renderPagination();
            } else {
                this.showMessage('Error loading enrollments: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading enrollments:', error);
            this.showMessage('Failed to load enrollments', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            
            if (response.ok) {
                this.users = data.data || [];
                this.populateUserSelect();
            } else {
                console.error('Error loading users:', data);
                this.showMessage('Error loading users: ' + (data.message || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showMessage('Failed to load users', 'error');
        }
    }

    async loadCourses() {
        try {
            const response = await fetch('/api/courses');
            const data = await response.json();
            
            console.log('Courses response status:', response.status);
            
            if (response.ok) {
                this.courses = data.data || [];
                this.populateCourseSelect();
            } else {
                console.error('Error loading courses:', data);
                this.showMessage('Error loading courses: ' + (data.message || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showMessage('Failed to load courses', 'error');
        }
    }

    populateUserSelect() {
        const select = document.getElementById('userId');
        if (!select || !this.users) return;
        
        select.innerHTML = '<option value="">Select a student...</option>';
        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = user.name || user.email;
            select.appendChild(option);
        });
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

    renderEnrollments() {
        const tbody = document.getElementById('enrollmentsTableBody');
        
        if (this.enrollments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>No enrollments found</h3>
                        <p>Try adjusting your search criteria or add a new enrollment.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.enrollments.map(enrollment => `
            <tr>
                <td>
                    <input type="checkbox" 
                           value="${enrollment._id}" 
                           onchange="enrolledCoursesManager.toggleEnrollmentSelection('${enrollment._id}')"
                           ${this.selectedEnrollments.has(enrollment._id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="student-name">${enrollment.user ? enrollment.user.name || enrollment.user.email : 'N/A'}</div>
                </td>
                <td>
                    <div class="course-title">${enrollment.course ? enrollment.course.title : 'N/A'}</div>
                </td>
                <td class="date-cell">${this.formatDate(enrollment.enrolledAt)}</td>
                <td class="action-buttons-cell">
                    <button class="btn btn-sm btn-danger" onclick="enrolledCoursesManager.deleteEnrollment('${enrollment._id}')">
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
            <button onclick="enrolledCoursesManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="enrolledCoursesManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        paginationHTML += `
            <button onclick="enrolledCoursesManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            await this.loadEnrollments();
        }
    }

    openCreateModal() {
        this.editingEnrollment = null;
        document.getElementById('modalTitle').textContent = 'Add New Enrollment';
        document.getElementById('enrollmentForm').reset();
        this.clearFormValidation();
        document.getElementById('enrollmentModal').style.display = 'block';
    }

    async saveEnrollment() {
        const form = document.getElementById('enrollmentForm');
        const formData = new FormData(form);

        const enrollmentData = {
            userId: formData.get('userId'),
            courseId: formData.get('courseId')
        };

        if (!this.validateForm(enrollmentData)) {
            return;
        }

        try {
            const response = await fetch('/api/admin/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(enrollmentData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadEnrollments();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving enrollment:', error);
            this.showMessage('Failed to save enrollment', 'error');
        }
    }

    validateForm(data) {
        let isValid = true;
        this.clearFormValidation();

        if (!data.userId) {
            this.showFieldError('userId', 'Student is required');
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
        const fields = ['userId', 'courseId'];
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
        this.editingEnrollment = null;
        document.getElementById('enrollmentModal').style.display = 'none';
        document.getElementById('enrollmentForm').reset();
        this.clearFormValidation();
    }

    async deleteEnrollment(enrollmentId) {
        if (!confirm('Are you sure you want to delete this enrollment?')) {
            return;
        }

        try {
            const response = await fetch(`/api/management/enrolled-courses/${enrollmentId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                await this.loadEnrollments();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting enrollment:', error);
            this.showMessage('Failed to delete enrollment', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedEnrollments.size === 0) return;

        try {
            const response = await fetch('/api/management/enrolled-courses/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedEnrollments) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedEnrollments.clear();
                this.updateBulkActions();
                await this.loadEnrollments();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting enrollments:', error);
            this.showMessage('Failed to delete enrollments', 'error');
        }
    }

    toggleEnrollmentSelection(enrollmentId) {
        if (this.selectedEnrollments.has(enrollmentId)) {
            this.selectedEnrollments.delete(enrollmentId);
        } else {
            this.selectedEnrollments.add(enrollmentId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
        
        if (selectAllCheckbox.checked) {
            checkboxes.forEach(checkbox => {
                this.selectedEnrollments.add(checkbox.value);
                checkbox.checked = true;
            });
        } else {
            this.selectedEnrollments.clear();
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (this.selectedEnrollments.size > 0) {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.textContent = `Delete Selected (${this.selectedEnrollments.size})`;
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
        const tbody = document.getElementById('enrollmentsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="loading">
                    <div class="spinner"></div>
                    Loading enrollments...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderEnrollments
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
function openCreateModal() {
    enrolledCoursesManager.openCreateModal();
}

function closeModal() {
    enrolledCoursesManager.closeModal();
}

function saveEnrollment() {
    enrolledCoursesManager.saveEnrollment();
}

function bulkDelete() {
    enrolledCoursesManager.bulkDelete();
}

function toggleSelectAll() {
    enrolledCoursesManager.toggleSelectAll();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    window.enrolledCoursesManager = new EnrolledCoursesManager();
});

if (document.readyState === 'loading') {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
} else {
    window.enrolledCoursesManager = new EnrolledCoursesManager();
}
