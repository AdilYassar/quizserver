// Courses Management JavaScript
class CoursesManager {
    constructor() {
        this.courses = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'title';
        this.sortOrder = 'asc';
        this.selectedCourses = new Set();
        this.editingCourse = null;
        
        this.init();
    }

    async init() {
        await this.loadCourses();
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
                this.loadCourses();
            }, 300);
        });

        // Modal close on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('courseModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async loadCourses() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/courses?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.courses = data.data;
                this.totalPages = data.pagination.pages;
                this.renderCourses();
                this.renderPagination();
                this.updateStats();
            } else {
                this.showMessage('Error loading courses: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showMessage('Failed to load courses', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderCourses() {
        const tbody = document.getElementById('coursesTableBody');
        
        if (this.courses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-book"></i>
                        <h3>No courses found</h3>
                        <p>Try adjusting your search criteria or add a new course.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.courses.map(course => `
            <tr>
                <td>
                    <input type="checkbox" 
                           value="${course._id}" 
                           onchange="coursesManager.toggleCourseSelection('${course._id}')"
                           ${this.selectedCourses.has(course._id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="course-title">${this.highlightSearch(course.title)}</div>
                </td>
                <td>
                    <div class="course-description">${this.highlightSearch(course.description)}</div>
                </td>
                <td>
                    <span class="duration-badge">
                        <i class="fas fa-clock"></i>
                        ${course.estimatedTime || 0}h
                    </span>
                </td>
                <td>
                    <div class="materials-cell" title="${course.materialsNeeded || 'No materials specified'}">
                        ${course.materialsNeeded || 'None'}
                    </div>
                </td>
                <td class="date-cell">${this.formatDate(course.createdAt)}</td>
                <td class="action-buttons-cell">
                    <button class="btn btn-sm btn-primary" onclick="coursesManager.editCourse('${course._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="coursesManager.deleteCourse('${course._id}')">
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
            <button onclick="coursesManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="coursesManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button onclick="coursesManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async updateStats() {
        try {
            const response = await fetch('/api/management/courses?limit=1000');
            const data = await response.json();
            
            if (response.ok) {
                const courses = data.data;
                const totalCourses = courses.length;
                const activeCourses = courses.length; // All courses are considered active for now
                const newCourses = courses.filter(c => {
                    const created = new Date(c.createdAt);
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return created > monthAgo;
                }).length;

                document.getElementById('totalCourses').textContent = totalCourses;
                document.getElementById('activeCourses').textContent = activeCourses;
                document.getElementById('newCourses').textContent = newCourses;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    openCreateModal() {
        this.editingCourse = null;
        document.getElementById('modalTitle').textContent = 'Add New Course';
        document.getElementById('courseForm').reset();
        this.clearFormValidation();
        this.resetSteps();
        document.getElementById('courseModal').style.display = 'block';
    }

    editCourse(courseId) {
        const course = this.courses.find(c => c._id === courseId);
        if (!course) return;

        this.editingCourse = course;
        document.getElementById('modalTitle').textContent = 'Edit Course';
        
        // Populate form
        document.getElementById('title').value = course.title;
        document.getElementById('description').value = course.description;
        document.getElementById('estimatedTime').value = course.estimatedTime || '';
        document.getElementById('materialsNeeded').value = course.materialsNeeded || '';
        
        // Populate steps
        this.resetSteps();
        if (course.steps && course.steps.length > 0) {
            course.steps.forEach(step => {
                this.addStep(step);
            });
        }
        
        this.clearFormValidation();
        document.getElementById('courseModal').style.display = 'block';
    }

    async saveCourse() {
        const form = document.getElementById('courseForm');
        const formData = new FormData(form);
        
        // Collect steps as simple strings
        const steps = [];
        const stepInputs = document.querySelectorAll('input[name="steps"]');
        stepInputs.forEach(input => {
            if (input.value.trim()) {
                steps.push(input.value.trim());
            }
        });

        const courseData = {
            title: formData.get('title'),
            description: formData.get('description'),
            estimatedTime: parseFloat(formData.get('estimatedTime')) || 0,
            materialsNeeded: formData.get('materialsNeeded'),
            steps: steps
        };

        // Validation
        if (!this.validateForm(courseData)) {
            return;
        }

        try {
            const url = this.editingCourse 
                ? `/api/management/courses/${this.editingCourse._id}`
                : '/api/management/courses';
            
            const method = this.editingCourse ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courseData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadCourses();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            this.showMessage('Failed to save course', 'error');
        }
    }

    validateForm(data) {
        let isValid = true;
        this.clearFormValidation();

        // Title validation
        if (!data.title || data.title.trim().length < 3) {
            this.showFieldError('title', 'Title must be at least 3 characters long');
            isValid = false;
        }

        // Description validation
        if (!data.description || data.description.trim().length < 10) {
            this.showFieldError('description', 'Description must be at least 10 characters long');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorDiv = document.getElementById(fieldName + 'Error');
        
        field.classList.add('is-invalid');
        errorDiv.textContent = message;
    }

    clearFormValidation() {
        const fields = ['title', 'description'];
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const errorDiv = document.getElementById(fieldName + 'Error');
            
            field.classList.remove('is-invalid', 'is-valid');
            errorDiv.textContent = '';
        });
    }

    addStep(stepValue = '') {
        const container = document.getElementById('stepsContainer');
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item';
        
        stepDiv.innerHTML = `
            <input type="text" name="steps" class="form-control step-input" placeholder="Enter step description" value="${stepValue}">
            <button type="button" class="btn btn-sm btn-danger" onclick="removeStep(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(stepDiv);
    }

    resetSteps() {
        const container = document.getElementById('stepsContainer');
        container.innerHTML = `
            <div class="step-item">
                <input type="text" name="steps" class="form-control step-input" placeholder="Enter step description">
                <button type="button" class="btn btn-sm btn-danger" onclick="removeStep(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    deleteCourse(courseId) {
        this.deletingCourseId = courseId;
        document.getElementById('deleteModal').style.display = 'block';
    }

    async confirmDelete() {
        if (!this.deletingCourseId) return;

        try {
            const response = await fetch(`/api/management/courses/${this.deletingCourseId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeDeleteModal();
                await this.loadCourses();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            this.showMessage('Failed to delete course', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedCourses.size === 0) return;

        try {
            const response = await fetch('/api/management/courses/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedCourses) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedCourses.clear();
                this.updateBulkActions();
                await this.loadCourses();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting courses:', error);
            this.showMessage('Failed to delete courses', 'error');
        }
    }

    toggleCourseSelection(courseId) {
        if (this.selectedCourses.has(courseId)) {
            this.selectedCourses.delete(courseId);
        } else {
            this.selectedCourses.add(courseId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
        
        if (selectAllCheckbox.checked) {
            this.courses.forEach(course => {
                this.selectedCourses.add(course._id);
            });
        } else {
            this.selectedCourses.clear();
        }
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        bulkDeleteBtn.disabled = this.selectedCourses.size === 0;
        
        if (this.selectedCourses.size === 0) {
            selectAllCheckbox.checked = false;
        } else if (this.selectedCourses.size === this.courses.length) {
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadCourses();
        }
    }

    closeModal() {
        document.getElementById('courseModal').style.display = 'none';
        this.editingCourse = null;
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.deletingCourseId = null;
    }

    showLoading() {
        const tbody = document.getElementById('coursesTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    <div class="spinner"></div>
                    Loading courses...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderCourses
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
    coursesManager.openCreateModal();
}

function closeModal() {
    coursesManager.closeModal();
}

function closeDeleteModal() {
    coursesManager.closeDeleteModal();
}

function saveCourse() {
    coursesManager.saveCourse();
}

function bulkDelete() {
    coursesManager.bulkDelete();
}

function toggleSelectAll() {
    coursesManager.toggleSelectAll();
}

function confirmDelete() {
    coursesManager.confirmDelete();
}

function addStep() {
    coursesManager.addStep();
}

function removeStep(button) {
    button.parentElement.remove();
}

// Initialize the courses manager when the page loads
let coursesManager;
document.addEventListener('DOMContentLoaded', () => {
    coursesManager = new CoursesManager();
});
