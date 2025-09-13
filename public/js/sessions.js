class SessionsManager {
    constructor() {
        this.sessions = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
        this.selectedSessions = new Set();
        this.deletingSessionId = null;
        
        this.init();
    }

    async init() {
        await this.loadSessions();
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
                this.loadSessions();
            }, 500);
        });
    }

    async loadSessions() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/sessions?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.sessions = data.data;
                this.totalPages = data.pagination.pages;
                this.renderSessions();
                this.renderPagination();
                this.updateStats();
            } else {
                this.showMessage('Error loading sessions: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
            this.showMessage('Failed to load sessions', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderSessions() {
        const tbody = document.getElementById('sessionsTableBody');
        
        if (this.sessions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-video"></i>
                        <h3>No sessions found</h3>
                        <p>Try adjusting your search criteria.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.sessions.map(session => `
            <tr>
                <td>
                    <input type="checkbox" 
                           value="${session._id}" 
                           onchange="sessionsManager.toggleSessionSelection('${session._id}')"
                           ${this.selectedSessions.has(session._id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="session-id">${this.highlightSearch(session.sessionId)}</div>
                </td>
                <td>
                    <span class="participants-count">
                        <i class="fas fa-users"></i>
                        ${session.participants ? session.participants.length : 0}
                    </span>
                </td>
                <td>
                    <span class="messages-count">
                        <i class="fas fa-comments"></i>
                        ${session.chat ? session.chat.length : 0}
                    </span>
                </td>
                <td class="date-cell">${this.formatDate(session.createdAt)}</td>
                <td class="action-buttons-cell">
                    <button class="btn btn-sm btn-danger" onclick="sessionsManager.deleteSession('${session._id}')">
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
            <button onclick="sessionsManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="sessionsManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button onclick="sessionsManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            await this.loadSessions();
        }
    }

    async deleteSession(sessionId) {
        if (!confirm('Are you sure you want to delete this session?')) {
            return;
        }

        try {
            const response = await fetch(`/api/management/sessions/${sessionId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                await this.loadSessions();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            this.showMessage('Failed to delete session', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedSessions.size === 0) return;

        try {
            const response = await fetch('/api/management/sessions/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedSessions) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedSessions.clear();
                this.updateBulkActions();
                await this.loadSessions();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting sessions:', error);
            this.showMessage('Failed to delete sessions', 'error');
        }
    }

    toggleSessionSelection(sessionId) {
        if (this.selectedSessions.has(sessionId)) {
            this.selectedSessions.delete(sessionId);
        } else {
            this.selectedSessions.add(sessionId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
        
        if (selectAllCheckbox.checked) {
            checkboxes.forEach(checkbox => {
                this.selectedSessions.add(checkbox.value);
                checkbox.checked = true;
            });
        } else {
            this.selectedSessions.clear();
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (this.selectedSessions.size > 0) {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.textContent = `Delete Selected (${this.selectedSessions.size})`;
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
        const tbody = document.getElementById('sessionsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    <div class="spinner"></div>
                    Loading sessions...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderSessions
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
function bulkDelete() {
    sessionsManager.bulkDelete();
}

function toggleSelectAll() {
    sessionsManager.toggleSelectAll();
}

function closeDeleteModal() {
    sessionsManager.closeDeleteModal();
}

// Initialize the manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing sessions manager...');
    window.sessionsManager = new SessionsManager();
    console.log('Sessions manager initialized:', window.sessionsManager);
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
} else {
    console.log('DOM already loaded, initializing immediately...');
    window.sessionsManager = new SessionsManager();
    console.log('Sessions manager initialized immediately:', window.sessionsManager);
}
