class MarksManager {
    constructor() {
        this.marks = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'percentage';
        this.sortOrder = 'desc';
        this.selectedMarks = new Set();
        
        this.init();
    }

    async init() {
        await this.loadMarks();
        this.updateStats();
        this.setupEventListeners();
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
                this.loadMarks();
            }, 300);
        });

        // Modal close functionality
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('markModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async loadMarks() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/marks-summary?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.marks = data.data || [];
            this.totalPages = data.totalPages || 1;
            this.currentPage = data.currentPage || 1;

            this.renderMarks();
            this.renderPagination();
            this.updateStats();
        } catch (error) {
            console.error('Error loading marks:', error);
            this.showError('Failed to load marks data');
        }
    }

    renderMarks() {
        const tbody = document.getElementById('marksTableBody');
        
        if (this.marks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="empty-icon">📊</div>
                        <div class="empty-title">No marks found</div>
                        <div class="empty-desc">No marks data matches your search criteria.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.marks.map(mark => `
            <tr data-id="${mark._id}">
                <td>
                    <input type="checkbox" class="mark-checkbox" value="${mark._id}" 
                           onchange="marksManager.toggleMarkSelection('${mark._id}')">
                </td>
                <td>
                    <div class="user-info">
                        <div class="user-name">${mark.user?.name || 'N/A'}</div>
                        <div class="user-email">${mark.user?.email || 'N/A'}</div>
                    </div>
                </td>
                <td>
                    <span class="course-title">${mark.course?.title || 'N/A'}</span>
                </td>
                <td>
                    <span class="quiz-title">${mark.quiz?.title || 'N/A'}</span>
                </td>
                <td>
                    <span class="score">${mark.obtainedMarks || 0}/${mark.totalMarks || 0}</span>
                </td>
                <td>
                    <div class="percentage-container">
                        <span class="percentage">${mark.percentage || 0}%</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${mark.percentage || 0}%"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="grade-badge grade-${(mark.grade || 'F').toLowerCase()}">${mark.grade || 'F'}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="marksManager.viewMark('${mark._id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="marksManager.deleteMark('${mark._id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async viewMark(markId) {
        try {
            const response = await fetch(`/api/management/marks-summary/${markId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const mark = await response.json();
            
            // Populate modal with mark details
            document.getElementById('studentName').textContent = mark.user?.name || 'N/A';
            document.getElementById('studentEmail').textContent = mark.user?.email || 'N/A';
            document.getElementById('courseName').textContent = mark.course?.title || 'N/A';
            document.getElementById('quizName').textContent = mark.quiz?.title || 'N/A';
            document.getElementById('totalMarks').textContent = mark.totalMarks || 0;
            document.getElementById('obtainedMarks').textContent = mark.obtainedMarks || 0;
            document.getElementById('percentage').textContent = `${mark.percentage || 0}%`;
            
            const gradeElement = document.getElementById('grade');
            gradeElement.textContent = mark.grade || 'F';
            gradeElement.className = `grade-badge grade-${(mark.grade || 'F').toLowerCase()}`;
            
            document.getElementById('submissionDate').textContent = mark.createdAt ? 
                new Date(mark.createdAt).toLocaleDateString() : 'N/A';

            // Show modal
            document.getElementById('markModal').style.display = 'block';
        } catch (error) {
            console.error('Error loading mark details:', error);
            this.showError('Failed to load mark details');
        }
    }

    async deleteMark(markId) {
        if (!confirm('Are you sure you want to delete this mark record?')) {
            return;
        }

        try {
            const response = await fetch(`/api/management/marks-summary/${markId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.showSuccess('Mark record deleted successfully');
            await this.loadMarks();
        } catch (error) {
            console.error('Error deleting mark:', error);
            this.showError('Failed to delete mark record');
        }
    }

    async bulkDelete() {
        if (this.selectedMarks.size === 0) {
            this.showError('Please select marks to delete');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${this.selectedMarks.size} mark record(s)?`)) {
            return;
        }

        try {
            const response = await fetch('/api/management/marks-summary/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ids: Array.from(this.selectedMarks)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.showSuccess(`${this.selectedMarks.size} mark record(s) deleted successfully`);
            this.selectedMarks.clear();
            await this.loadMarks();
            this.updateBulkDeleteButton();
        } catch (error) {
            console.error('Error deleting marks:', error);
            this.showError('Failed to delete selected marks');
        }
    }

    toggleMarkSelection(markId) {
        if (this.selectedMarks.has(markId)) {
            this.selectedMarks.delete(markId);
        } else {
            this.selectedMarks.add(markId);
        }
        this.updateBulkDeleteButton();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.mark-checkbox');
        
        if (selectAllCheckbox.checked) {
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
                this.selectedMarks.add(checkbox.value);
            });
        } else {
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                this.selectedMarks.delete(checkbox.value);
            });
        }
        
        this.updateBulkDeleteButton();
    }

    updateBulkDeleteButton() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        bulkDeleteBtn.disabled = this.selectedMarks.size === 0;
        
        if (this.selectedMarks.size > 0) {
            bulkDeleteBtn.textContent = `Delete Selected (${this.selectedMarks.size})`;
        } else {
            bulkDeleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Selected';
        }
    }

    sort(column) {
        if (this.sortBy === column) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = column;
            this.sortOrder = 'asc';
        }
        
        this.currentPage = 1;
        this.loadMarks();
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        
        if (this.totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="marksManager.goToPage(${this.currentPage - 1})">Previous</button>`;
        }

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="marksManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="marksManager.goToPage(${i})">${i}</button>`;
        }

        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="pagination-btn" onclick="marksManager.goToPage(${this.totalPages})">${this.totalPages}</button>`;
        }

        // Next button
        if (this.currentPage < this.totalPages) {
            paginationHTML += `<button class="pagination-btn" onclick="marksManager.goToPage(${this.currentPage + 1})">Next</button>`;
        }

        pagination.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadMarks();
    }

    updateStats() {
        const totalRecords = this.marks.length;
        
        // Calculate statistics
        let highPerformers = 0;
        let failedCount = 0;
        let totalPercentage = 0;
        let recentCount = 0;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        this.marks.forEach(mark => {
            const percentage = mark.percentage || 0;
            totalPercentage += percentage;
            
            if (percentage >= 80) highPerformers++;
            if (percentage < 50) failedCount++;
            
            if (mark.createdAt && new Date(mark.createdAt) >= oneWeekAgo) {
                recentCount++;
            }
        });
        
        const averageScore = totalRecords > 0 ? Math.round(totalPercentage / totalRecords) : 0;
        
        // Update UI
        document.getElementById('totalRecords').textContent = totalRecords;
        document.getElementById('highPerformers').textContent = highPerformers;
        document.getElementById('averageScore').textContent = `${averageScore}%`;
        document.getElementById('failedCount').textContent = failedCount;
        document.getElementById('recentMarks').textContent = recentCount;
    }

    closeModal() {
        document.getElementById('markModal').style.display = 'none';
    }

    async exportMarks() {
        try {
            const response = await fetch('/api/management/marks-summary/export');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'marks-summary.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            this.showSuccess('Marks exported successfully');
        } catch (error) {
            console.error('Error exporting marks:', error);
            this.showError('Failed to export marks');
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function viewMark(markId) {
    marksManager.viewMark(markId);
}

function deleteMark(markId) {
    marksManager.deleteMark(markId);
}

function bulkDelete() {
    marksManager.bulkDelete();
}

function toggleSelectAll() {
    marksManager.toggleSelectAll();
}

function sort(column) {
    marksManager.sort(column);
}

function closeModal() {
    marksManager.closeModal();
}

function exportMarks() {
    marksManager.exportMarks();
}

// Initialize when page loads
let marksManager;
document.addEventListener('DOMContentLoaded', () => {
    marksManager = new MarksManager();
});
