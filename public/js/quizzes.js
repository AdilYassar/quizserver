// Quizzes Management JavaScript
class QuizzesManager {
    constructor() {
        this.quizzes = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'title';
        this.sortOrder = 'asc';
        this.selectedQuizzes = new Set();
        this.editingQuiz = null;
        
        this.init();
    }

    async init() {
        await this.loadQuizzes();
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
                this.loadQuizzes();
            }, 300);
        });

        // Modal close on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('quizModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async loadQuizzes() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/quizzes?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.quizzes = data.data;
                this.totalPages = data.pagination.pages;
                this.renderQuizzes();
                this.renderPagination();
                this.updateStats();
            } else {
                this.showMessage('Error loading quizzes: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading quizzes:', error);
            this.showMessage('Failed to load quizzes', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderQuizzes() {
        const tbody = document.getElementById('quizzesTableBody');
        
        if (this.quizzes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-question-circle"></i>
                        <h3>No quizzes found</h3>
                        <p>Try adjusting your search criteria or add a new quiz.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.quizzes.map(quiz => `
            <tr>
                <td>
                    <input type="checkbox" 
                           value="${quiz._id}" 
                           onchange="quizzesManager.toggleQuizSelection('${quiz._id}')"
                           ${this.selectedQuizzes.has(quiz._id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="quiz-title">${this.highlightSearch(quiz.title)}</div>
                </td>
                <td>
                    <div class="quiz-description">${this.highlightSearch(quiz.description)}</div>
                </td>
                <td>
                    <span class="duration-badge">
                        <i class="fas fa-clock"></i>
                        ${quiz.duration || 0}m
                    </span>
                </td>
                <td>
                    <span class="questions-badge">
                        <i class="fas fa-question"></i>
                        ${quiz.questions ? quiz.questions.length : 0}
                    </span>
                </td>
                <td>
                    <span class="difficulty-badge difficulty-${quiz.difficulty || 'medium'}">
                        ${quiz.difficulty || 'medium'}
                    </span>
                </td>
                <td>
                    <span class="level-badge level-${quiz.level || 'beginner'}">
                        ${quiz.level || 'beginner'}
                    </span>
                </td>
                <td class="date-cell">${this.formatDate(quiz.createdAt)}</td>
                <td class="action-buttons-cell">
                    <button class="btn btn-sm btn-primary" onclick="quizzesManager.editQuiz('${quiz._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="quizzesManager.deleteQuiz('${quiz._id}')">
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
            <button onclick="quizzesManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="quizzesManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button onclick="quizzesManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async updateStats() {
        try {
            const response = await fetch('/api/management/quizzes?limit=1000');
            const data = await response.json();
            
            if (response.ok) {
                const quizzes = data.data;
                const totalQuizzes = quizzes.length;
                const activeQuizzes = quizzes.length; // All quizzes are considered active for now
                const newQuizzes = quizzes.filter(q => {
                    const created = new Date(q.createdAt);
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return created > monthAgo;
                }).length;

                document.getElementById('totalQuizzes').textContent = totalQuizzes;
                document.getElementById('activeQuizzes').textContent = activeQuizzes;
                document.getElementById('newQuizzes').textContent = newQuizzes;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    openCreateModal() {
        console.log('openCreateModal called');
        try {
            this.editingQuiz = null;
            
            // Check if elements exist before accessing them
            const modalTitle = document.getElementById('modalTitle');
            if (!modalTitle) {
                console.error('modalTitle element not found');
                alert('Modal title element not found');
                return;
            }
            modalTitle.textContent = 'Add New Quiz';
            
            const form = document.getElementById('quizForm');
            if (form) {
                form.reset();
            }
            
            this.clearFormValidation();
            
            const modal = document.getElementById('quizModal');
            console.log('Modal element found:', modal);
            if (modal) {
                modal.style.display = 'block';
                console.log('Modal should be visible now');
            } else {
                console.error('Modal element not found!');
                alert('Modal element not found!');
            }
        } catch (error) {
            console.error('Error in openCreateModal:', error);
            alert('Error opening modal: ' + error.message);
        }
    }

    editQuiz(quizId) {
        console.log('editQuiz called with ID:', quizId);
        const quiz = this.quizzes.find(q => q._id === quizId);
        console.log('Found quiz:', quiz);
        
        if (!quiz) {
            console.error('Quiz not found with ID:', quizId);
            alert('Quiz not found');
            return;
        }

        try {
            this.editingQuiz = quiz;
            
            // Check if elements exist before accessing them
            const modalTitle = document.getElementById('modalTitle');
            if (!modalTitle) {
                console.error('modalTitle element not found');
                alert('Modal title element not found');
                return;
            }
            modalTitle.textContent = 'Edit Quiz';
            
            // Populate form with null checks
            const titleField = document.getElementById('title');
            const descriptionField = document.getElementById('description');
            const durationField = document.getElementById('duration');
            const totalQuestionsField = document.getElementById('totalQuestions');
            const difficultyField = document.getElementById('difficulty');
            const levelField = document.getElementById('level');
            
            if (titleField) titleField.value = quiz.title || '';
            if (descriptionField) descriptionField.value = quiz.description || '';
            if (durationField) durationField.value = quiz.duration || 30;
            if (totalQuestionsField) totalQuestionsField.value = quiz.totalQuestions || 0;
            if (difficultyField) difficultyField.value = quiz.difficulty || 'medium';
            if (levelField) levelField.value = quiz.level || 'beginner';
            
            this.clearFormValidation();
            
            const modal = document.getElementById('quizModal');
            if (modal) {
                modal.style.display = 'block';
                console.log('Edit modal opened successfully');
            } else {
                console.error('Modal element not found');
                alert('Modal not found');
            }
        } catch (error) {
            console.error('Error in editQuiz:', error);
            alert('Error opening edit modal: ' + error.message);
        }
    }

    async saveQuiz() {
        console.log('saveQuiz called');
        const form = document.getElementById('quizForm');
        console.log('Form element:', form);
        
        if (!form) {
            console.error('Form not found');
            alert('Form not found');
            return;
        }
        
        const formData = new FormData(form);
        console.log('Form data created');
        
        // Debug form field values
        console.log('Form field values:');
        console.log('Title:', formData.get('title'));
        console.log('Description:', formData.get('description'));
        console.log('Duration:', formData.get('duration'));
        console.log('Total Questions:', formData.get('totalQuestions'));
        console.log('Difficulty:', formData.get('difficulty'));
        console.log('Level:', formData.get('level'));

        const quizData = {
            title: formData.get('title'),
            description: formData.get('description'),
            duration: parseInt(formData.get('duration')) || 30,
            totalQuestions: parseInt(formData.get('totalQuestions')) || 0,
            difficulty: formData.get('difficulty'),
            level: formData.get('level')
        };

        console.log('Quiz data prepared:', quizData);

        // Validation
        if (!this.validateForm(quizData)) {
            console.log('Form validation failed');
            return;
        }
        console.log('Form validation passed');

        try {
            const url = this.editingQuiz 
                ? `/api/management/quizzes/${this.editingQuiz._id}`
                : '/api/management/quizzes';
            
            const method = this.editingQuiz ? 'PUT' : 'POST';

            console.log('Making API call:', { url, method, quizData });

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quizData)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                console.log('Quiz saved successfully');
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadQuizzes();
            } else {
                console.error('API error:', data.error);
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving quiz:', error);
            this.showMessage('Failed to save quiz', 'error');
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

        // Duration validation
        if (data.duration < 1) {
            this.showFieldError('duration', 'Duration must be at least 1 minute');
            isValid = false;
        }

        // Total questions validation
        if (data.totalQuestions < 0) {
            this.showFieldError('totalQuestions', 'Total questions cannot be negative');
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
        const fields = ['title', 'description', 'duration', 'totalQuestions'];
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

    deleteQuiz(quizId) {
        this.deletingQuizId = quizId;
        document.getElementById('deleteModal').style.display = 'block';
    }

    async confirmDelete() {
        if (!this.deletingQuizId) return;

        try {
            const response = await fetch(`/api/management/quizzes/${this.deletingQuizId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeDeleteModal();
                await this.loadQuizzes();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting quiz:', error);
            this.showMessage('Failed to delete quiz', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedQuizzes.size === 0) return;

        try {
            const response = await fetch('/api/management/quizzes/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedQuizzes) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedQuizzes.clear();
                this.updateBulkActions();
                await this.loadQuizzes();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting quizzes:', error);
            this.showMessage('Failed to delete quizzes', 'error');
        }
    }

    toggleQuizSelection(quizId) {
        if (this.selectedQuizzes.has(quizId)) {
            this.selectedQuizzes.delete(quizId);
        } else {
            this.selectedQuizzes.add(quizId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
        
        if (selectAllCheckbox.checked) {
            this.quizzes.forEach(quiz => {
                this.selectedQuizzes.add(quiz._id);
            });
        } else {
            this.selectedQuizzes.clear();
        }
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        bulkDeleteBtn.disabled = this.selectedQuizzes.size === 0;
        
        if (this.selectedQuizzes.size === 0) {
            selectAllCheckbox.checked = false;
        } else if (this.selectedQuizzes.size === this.quizzes.length) {
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadQuizzes();
        }
    }

    closeModal() {
        document.getElementById('quizModal').style.display = 'none';
        this.editingQuiz = null;
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.deletingQuizId = null;
    }

    showLoading() {
        const tbody = document.getElementById('quizzesTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="loading">
                    <div class="spinner"></div>
                    Loading quizzes...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderQuizzes
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
    console.log('Global openCreateModal called');
    
    // Direct modal opening without manager dependency
    try {
        const modal = document.getElementById('quizModal');
        console.log('Modal element found:', modal);
        
        if (modal) {
            // Reset form
            const form = document.getElementById('quizForm');
            if (form) form.reset();
            
            // Set title
            const title = document.getElementById('modalTitle');
            if (title) {
                title.textContent = 'Add New Quiz';
            } else {
                console.error('modalTitle element not found');
                alert('Modal title element not found');
                return;
            }
            
            // Show modal
            modal.style.display = 'block';
            console.log('Modal should be visible now');
        } else {
            console.error('Modal element not found!');
            alert('Modal element not found!');
        }
    } catch (error) {
        console.error('Error opening modal:', error);
        alert('Error opening modal: ' + error.message);
    }
    
    // Also try with manager if available
    if (quizzesManager) {
        quizzesManager.openCreateModal();
    } else {
        console.log('quizzesManager not available, using direct approach');
    }
}

function closeModal() {
    console.log('closeModal called');
    const modal = document.getElementById('quizModal');
    if (modal) {
        modal.style.display = 'none';
        console.log('Modal hidden');
    }
    
    if (quizzesManager) {
        quizzesManager.closeModal();
    }
}

// Global save function
function saveQuiz() {
    console.log('Global saveQuiz called');
    
    if (quizzesManager) {
        console.log('Manager available, calling saveQuiz...');
        quizzesManager.saveQuiz();
    } else {
        console.error('quizzesManager not available for saving');
        alert('Error: Quiz manager not available');
    }
}

// Global edit function
function editQuiz(quizId) {
    console.log('Global editQuiz called with ID:', quizId);
    
    if (quizzesManager) {
        quizzesManager.editQuiz(quizId);
    } else {
        console.error('quizzesManager not available for editing');
        alert('Error: Quiz manager not available');
    }
}

function closeDeleteModal() {
    quizzesManager.closeDeleteModal();
}

function saveQuiz() {
    quizzesManager.saveQuiz();
}

function bulkDelete() {
    quizzesManager.bulkDelete();
}

function toggleSelectAll() {
    quizzesManager.toggleSelectAll();
}

function confirmDelete() {
    quizzesManager.confirmDelete();
}

// Initialize the quizzes manager when the page loads
let quizzesManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Quizzes page loaded, initializing manager...');
    try {
        quizzesManager = new QuizzesManager();
        console.log('Quizzes manager initialized successfully');
    } catch (error) {
        console.error('Error initializing quizzes manager:', error);
    }
});

// Debug function to test if JavaScript is working
window.testQuizzes = function() {
    console.log('Test function called - JavaScript is working');
    alert('JavaScript is working!');
};

// Debug function to test modal directly
window.testModal = function() {
    console.log('Testing modal directly...');
    const modal = document.getElementById('quizModal');
    console.log('Modal element:', modal);
    if (modal) {
        modal.style.display = 'block';
        console.log('Modal display set to block');
        alert('Modal should be visible now!');
    } else {
        console.error('Modal not found!');
        alert('Modal not found!');
    }
};

// Debug function to test save functionality
window.testSave = function() {
    console.log('Testing save functionality...');
    if (quizzesManager) {
        console.log('Manager available, testing save...');
        quizzesManager.saveQuiz();
    } else {
        console.error('Manager not available');
        alert('Manager not available for saving');
    }
};

// Debug function to test edit functionality
window.testEdit = function() {
    console.log('Testing edit functionality...');
    if (quizzesManager && quizzesManager.quizzes.length > 0) {
        console.log('Manager available, testing edit with first quiz...');
        const firstQuiz = quizzesManager.quizzes[0];
        console.log('First quiz:', firstQuiz);
        quizzesManager.editQuiz(firstQuiz._id);
    } else {
        console.error('Manager not available or no quizzes');
        alert('Manager not available or no quizzes to edit');
    }
};

// Debug function to test direct save without validation
window.testDirectSave = async function() {
    console.log('Testing direct save...');
    
    const testData = {
        title: 'Test Quiz ' + Date.now(),
        description: 'Test Description',
        duration: 30,
        totalQuestions: 5,
        difficulty: 'medium',
        level: 'beginner'
    };
    
    console.log('Sending test data:', testData);
    
    try {
        const response = await fetch('/api/management/quizzes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            alert('Direct save successful! Check console for details.');
            // Reload quizzes if manager is available
            if (quizzesManager) {
                await quizzesManager.loadQuizzes();
            }
        } else {
            alert('Direct save failed: ' + data.error);
        }
    } catch (error) {
        console.error('Direct save error:', error);
        alert('Direct save error: ' + error.message);
    }
};

// Initialize the manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing quizzes manager...');
    window.quizzesManager = new QuizzesManager();
    console.log('Quizzes manager initialized:', window.quizzesManager);
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
} else {
    console.log('DOM already loaded, initializing immediately...');
    window.quizzesManager = new QuizzesManager();
    console.log('Quizzes manager initialized immediately:', window.quizzesManager);
}
