class QuizSubmissionsManager {
    constructor() {
        this.submissions = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'startedAt';
        this.sortOrder = 'desc';
        this.selectedSubmissions = new Set();
        
        this.init();
    }

    async init() {
        await this.loadSubmissions();
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
                this.loadSubmissions();
            }, 500);
        });
    }

    async loadSubmissions() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/quiz-submissions?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.submissions = data.data;
                this.totalPages = data.pagination.pages;
                this.renderSubmissions();
                this.renderPagination();
            } else {
                this.showMessage('Error loading submissions: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
            this.showMessage('Failed to load submissions', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderSubmissions() {
        const tbody = document.getElementById('submissionsTableBody');
        
        if (this.submissions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-file-alt"></i>
                        <h3>No submissions found</h3>
                        <p>Try adjusting your search criteria.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.submissions.map(submission => `
            <tr>
                <td>
                    <input type="checkbox" 
                           value="${submission._id}" 
                           onchange="quizSubmissionsManager.toggleSubmissionSelection('${submission._id}')"
                           ${this.selectedSubmissions.has(submission._id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="student-name">${submission.user ? submission.user.name || submission.user.email : 'N/A'}</div>
                </td>
                <td>
                    <div class="course-title">${submission.course ? submission.course.title : 'N/A'}</div>
                </td>
                <td>
                    <div class="quiz-title">${submission.quiz ? submission.quiz.title : 'N/A'}</div>
                </td>
                <td>
                    <span class="score-badge">${submission.score || 0}/${submission.totalQuestions || 0}</span>
                </td>
                <td>
                    <span class="grade-badge ${this.getGradeClass(submission.grade)}">${submission.grade || 'F'}</span>
                </td>
                <td>
                    <span class="status-badge ${submission.status}">${submission.status || 'pending'}</span>
                </td>
                <td class="date-cell">${this.formatDate(submission.startedAt)}</td>
                <td class="action-buttons-cell">
                    <button class="btn btn-sm btn-primary" onclick="quizSubmissionsManager.viewSubmission('${submission._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="quizSubmissionsManager.deleteSubmission('${submission._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getGradeClass(grade) {
        if (!grade) return 'grade-f';
        const gradeLetter = grade.charAt(0).toUpperCase();
        return `grade-${gradeLetter}`;
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        
        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        paginationHTML += `
            <button onclick="quizSubmissionsManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="quizSubmissionsManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        paginationHTML += `
            <button onclick="quizSubmissionsManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            await this.loadSubmissions();
        }
    }

    async viewSubmission(submissionId) {
        try {
            const response = await fetch(`/api/management/quiz-submissions/${submissionId}`);
            const data = await response.json();

            if (response.ok) {
                this.displaySubmissionDetails(data);
                document.getElementById('submissionModal').style.display = 'block';
            } else {
                this.showMessage('Error loading submission: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading submission:', error);
            this.showMessage('Failed to load submission', 'error');
        }
    }

    displaySubmissionDetails(submission) {
        const detailsDiv = document.getElementById('submissionDetails');
        detailsDiv.innerHTML = `
            <div class="submission-details">
                <h3>Submission Details</h3>
                <div class="detail-row">
                    <strong>Student:</strong> ${submission.user ? submission.user.name || submission.user.email : 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Course:</strong> ${submission.course ? submission.course.title : 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Quiz:</strong> ${submission.quiz ? submission.quiz.title : 'N/A'}
                </div>
                <div class="detail-row">
                    <strong>Score:</strong> ${submission.score || 0}/${submission.totalQuestions || 0}
                </div>
                <div class="detail-row">
                    <strong>Grade:</strong> ${submission.grade || 'F'}
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> ${submission.status || 'pending'}
                </div>
                <div class="detail-row">
                    <strong>Started:</strong> ${this.formatDate(submission.startedAt)}
                </div>
                <div class="detail-row">
                    <strong>Completed:</strong> ${submission.completedAt ? this.formatDate(submission.completedAt) : 'Not completed'}
                </div>
                <div class="detail-row">
                    <strong>Duration:</strong> ${submission.duration || 0} minutes
                </div>
            </div>
        `;
    }

    async deleteSubmission(submissionId) {
        if (!confirm('Are you sure you want to delete this submission?')) {
            return;
        }

        try {
            const response = await fetch(`/api/management/quiz-submissions/${submissionId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                await this.loadSubmissions();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting submission:', error);
            this.showMessage('Failed to delete submission', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedSubmissions.size === 0) return;

        try {
            const response = await fetch('/api/management/quiz-submissions/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedSubmissions) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedSubmissions.clear();
                this.updateBulkActions();
                await this.loadSubmissions();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting submissions:', error);
            this.showMessage('Failed to delete submissions', 'error');
        }
    }

    toggleSubmissionSelection(submissionId) {
        if (this.selectedSubmissions.has(submissionId)) {
            this.selectedSubmissions.delete(submissionId);
        } else {
            this.selectedSubmissions.add(submissionId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
        
        if (selectAllCheckbox.checked) {
            checkboxes.forEach(checkbox => {
                this.selectedSubmissions.add(checkbox.value);
                checkbox.checked = true;
            });
        } else {
            this.selectedSubmissions.clear();
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (this.selectedSubmissions.size > 0) {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.textContent = `Delete Selected (${this.selectedSubmissions.size})`;
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
        const tbody = document.getElementById('submissionsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="loading">
                    <div class="spinner"></div>
                    Loading submissions...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderSubmissions
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
    document.getElementById('submissionModal').style.display = 'none';
}

function bulkDelete() {
    quizSubmissionsManager.bulkDelete();
}

function toggleSelectAll() {
    quizSubmissionsManager.toggleSelectAll();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    window.quizSubmissionsManager = new QuizSubmissionsManager();
});

if (document.readyState === 'loading') {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
} else {
    window.quizSubmissionsManager = new QuizSubmissionsManager();
}
