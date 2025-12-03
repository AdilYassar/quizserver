// Questions Management JavaScript
class QuestionsManager {
    constructor() {
        this.questions = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.typeFilter = '';
        this.difficultyFilter = '';
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
        this.selectedQuestions = new Set();
        this.editingQuestion = null;
        
        this.init();
    }

    async init() {
        await this.loadQuestions();
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
                this.loadQuestions();
            }, 300);
        });

        // Filter functionality
        const typeFilter = document.getElementById('typeFilter');
        const difficultyFilter = document.getElementById('difficultyFilter');
        
        typeFilter.addEventListener('change', (e) => {
            this.typeFilter = e.target.value;
            this.currentPage = 1;
            this.loadQuestions();
        });
        
        difficultyFilter.addEventListener('change', (e) => {
            this.difficultyFilter = e.target.value;
            this.currentPage = 1;
            this.loadQuestions();
        });

        // Modal close on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('questionModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async loadQuestions() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                type: this.typeFilter,
                difficulty: this.difficultyFilter,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/questions?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.questions = data.data;
                this.totalPages = data.pagination.pages;
                this.renderQuestions();
                this.renderPagination();
                this.updateStats();
            } else {
                this.showMessage('Error loading questions: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showMessage('Failed to load questions', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadQuizzes() {
        try {
            const response = await fetch('/api/management/quizzes?limit=1000');
            const data = await response.json();

            if (response.ok) {
                this.quizzes = data.data;
                this.populateQuizSelect();
            } else {
                console.error('Error loading quizzes:', data.error);
            }
        } catch (error) {
            console.error('Error loading quizzes:', error);
        }
    }

    populateQuizSelect() {
        const quizSelect = document.getElementById('quiz');
        if (!quizSelect) return;

        // Clear existing options except the first one
        quizSelect.innerHTML = '<option value="">Select a quiz (optional)</option>';
        
        this.quizzes.forEach(quiz => {
            const option = document.createElement('option');
            option.value = quiz._id;
            option.textContent = quiz.title;
            quizSelect.appendChild(option);
        });
    }

    renderQuestions() {
        const tbody = document.getElementById('questionsTableBody');
        
        if (this.questions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-10 text-gray-600">
                        <i class="fas fa-question text-4xl mb-4 text-gray-400"></i>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
                        <p class="text-sm text-gray-600">Try adjusting your search criteria or add a new question.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.questions.map(question => `
            <tr class="transition-all duration-200 hover:bg-gray-100">
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <input type="checkbox" 
                           value="${question._id}" 
                           onchange="questionsManager.toggleQuestionSelection('${question._id}')"
                           ${this.selectedQuestions.has(question._id) ? 'checked' : ''}>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <div class="text-gray-900">${this.highlightSearch(question.question)}</div>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <span class="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-800 text-white">
                        ${this.formatQuestionType(question.type || 'multiple-choice')}
                    </span>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <span class="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-700 text-white">
                        ${question.quiz ? question.quiz.title : 'No Quiz'}
                    </span>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <div class="text-gray-700" title="${this.formatOptions(question.options || [])}">
                        ${this.formatOptions(question.options || [])}
                    </div>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <span class="font-medium text-gray-900">${question.correctAnswer || 'N/A'}</span>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <span class="inline-block px-2 py-1 rounded text-xs font-medium uppercase bg-gray-600 text-white">
                        ${question.difficulty || 'medium'}
                    </span>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <span class="inline-flex items-center gap-1 text-gray-700">
                        <i class="fas fa-star text-xs"></i>
                        ${question.points || 1}
                    </span>
                </td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">${this.formatDate(question.createdAt)}</td>
                <td class="py-4 px-4 text-gray-900 border-b border-gray-200 text-sm align-middle">
                    <div class="flex gap-2">
                        <button class="bg-black text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 shadow-sm hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md focus:outline-2 focus:outline-black focus:outline-offset-2 h-8 flex items-center justify-center gap-1 border-none cursor-pointer" onclick="questionsManager.editQuestion('${question._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 shadow-sm hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-md focus:outline-2 focus:outline-black focus:outline-offset-2 h-8 flex items-center justify-center gap-1 border-none cursor-pointer" onclick="questionsManager.deleteQuestion('${question._id}')">
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
            <button onclick="questionsManager.goToPage(${this.currentPage - 1})" 
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
                <button onclick="questionsManager.goToPage(${i})" 
                        class="px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 ${i === this.currentPage ? 'bg-black text-white border-black' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'}">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button onclick="questionsManager.goToPage(${this.currentPage + 1})" 
                    class="px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async updateStats() {
        try {
            const response = await fetch('/api/management/questions?limit=1000');
            const data = await response.json();
            
            if (response.ok) {
                const questions = data.data;
                const totalQuestions = questions.length;
                const multipleChoiceQuestions = questions.filter(q => q.type === 'multiple-choice').length;
                const trueFalseQuestions = questions.filter(q => q.type === 'true-false').length;

                document.getElementById('totalQuestions').textContent = totalQuestions;
                document.getElementById('multipleChoiceQuestions').textContent = multipleChoiceQuestions;
                document.getElementById('trueFalseQuestions').textContent = trueFalseQuestions;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    openCreateModal() {
        console.log('openCreateModal called for questions');
        try {
            this.editingQuestion = null;
            document.getElementById('modalTitle').textContent = 'Add New Question';
            document.getElementById('questionForm').reset();
            this.clearFormValidation();
            this.resetOptions();
            this.toggleQuestionType();
            const modal = document.getElementById('questionModal');
            console.log('Question modal element found:', modal);
            if (modal) {
                modal.classList.remove('hidden');
                console.log('Question modal should be visible now');
            } else {
                console.error('Question modal element not found!');
            }
        } catch (error) {
            console.error('Error in openCreateModal for questions:', error);
        }
    }

    editQuestion(questionId) {
        console.log('editQuestion called with ID:', questionId);
        const question = this.questions.find(q => q._id === questionId);
        console.log('Found question:', question);
        
        if (!question) {
            console.error('Question not found with ID:', questionId);
            alert('Question not found');
            return;
        }

        try {
            this.editingQuestion = question;
            document.getElementById('modalTitle').textContent = 'Edit Question';
            
            // Populate form
            document.getElementById('question').value = question.question || '';
            document.getElementById('type').value = question.type || 'multiple-choice';
            document.getElementById('difficulty').value = question.difficulty || 'medium';
            document.getElementById('points').value = question.points || 1;
            document.getElementById('correctAnswer').value = question.correctAnswer || '';
            
            // Populate quiz selection
            const quizSelect = document.getElementById('quiz');
            if (quizSelect) {
                quizSelect.value = question.quiz || '';
            }
            
            // Populate options
            this.resetOptions();
            if (question.options && question.options.length > 0) {
                question.options.forEach(option => {
                    this.addOption(option);
                });
            }
            
            this.toggleQuestionType();
            this.clearFormValidation();
            
            const modal = document.getElementById('questionModal');
            if (modal) {
                modal.classList.remove('hidden');
                console.log('Edit modal opened successfully');
            } else {
                console.error('Modal element not found');
                alert('Modal not found');
            }
        } catch (error) {
            console.error('Error in editQuestion:', error);
            alert('Error opening edit modal: ' + error.message);
        }
    }

    async saveQuestion() {
        const form = document.getElementById('questionForm');
        const formData = new FormData(form);

        // Collect options
        const options = [];
        const optionInputs = document.querySelectorAll('input[name="options"]');
        optionInputs.forEach(input => {
            if (input.value.trim()) {
                options.push(input.value.trim());
            }
        });

        const questionData = {
            question: formData.get('question'),
            type: formData.get('type'),
            options: options,
            correctAnswer: formData.get('correctAnswer'),
            difficulty: formData.get('difficulty'),
            points: parseInt(formData.get('points')) || 1,
            quiz: formData.get('quiz') || null
        };

        // Validation
        if (!this.validateForm(questionData)) {
            return;
        }

        try {
            const url = this.editingQuestion 
                ? `/api/management/questions/${this.editingQuestion._id}`
                : '/api/management/questions';
            
            const method = this.editingQuestion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(questionData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadQuestions();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving question:', error);
            this.showMessage('Failed to save question', 'error');
        }
    }

    validateForm(data) {
        let isValid = true;
        this.clearFormValidation();

        // Question validation
        if (!data.question || data.question.trim().length < 10) {
            this.showFieldError('question', 'Question must be at least 10 characters long');
            isValid = false;
        }

        // Correct answer validation
        if (!data.correctAnswer || data.correctAnswer.trim().length === 0) {
            this.showFieldError('correctAnswer', 'Correct answer is required');
            isValid = false;
        }

        // Options validation for multiple choice
        if (data.type === 'multiple-choice') {
            const optionInputs = document.querySelectorAll('input[name="options"]');
            const validOptions = Array.from(optionInputs).filter(input => input.value.trim());
            
            if (validOptions.length < 2) {
                this.showMessage('Multiple choice questions must have at least 2 options', 'error');
                isValid = false;
            }
        }

        // Points validation
        if (data.points < 1) {
            this.showFieldError('points', 'Points must be at least 1');
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
        const fields = ['question', 'correctAnswer', 'points'];
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

    toggleQuestionType() {
        const type = document.getElementById('type').value;
        const optionsContainer = document.getElementById('optionsContainer');
        
        if (type === 'multiple-choice') {
            optionsContainer.classList.remove('hidden');
        } else {
            optionsContainer.classList.add('hidden');
        }
    }

    addOption(optionValue = '') {
        const optionsList = document.getElementById('optionsList');
        const optionDiv = document.createElement('div');
        optionDiv.className = 'flex gap-2 mb-2 items-center';
        optionDiv.innerHTML = `
            <input type="text" name="options" class="flex-1 px-4 py-3.5 border border-gray-200 rounded-lg text-sm transition-all duration-300 bg-white h-12 text-black focus:outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]" placeholder="Enter option text" value="${optionValue}">
            <button type="button" class="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 shadow-sm hover:bg-gray-700 h-8 flex items-center justify-center gap-1 border-none cursor-pointer" onclick="removeOption(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        optionsList.appendChild(optionDiv);
    }

    resetOptions() {
        const optionsList = document.getElementById('optionsList');
        optionsList.innerHTML = `
            <div class="flex gap-2 mb-2 items-center">
                <input type="text" name="options" class="flex-1 px-4 py-3.5 border border-gray-200 rounded-lg text-sm transition-all duration-300 bg-white h-12 text-black focus:outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]" placeholder="Enter option text">
                <button type="button" class="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 shadow-sm hover:bg-gray-700 h-8 flex items-center justify-center gap-1 border-none cursor-pointer" onclick="removeOption(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    deleteQuestion(questionId) {
        this.deletingQuestionId = questionId;
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    async confirmDelete() {
        if (!this.deletingQuestionId) return;

        try {
            const response = await fetch(`/api/management/questions/${this.deletingQuestionId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeDeleteModal();
                await this.loadQuestions();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            this.showMessage('Failed to delete question', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedQuestions.size === 0) return;

        try {
            const response = await fetch('/api/management/questions/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedQuestions) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedQuestions.clear();
                this.updateBulkActions();
                await this.loadQuestions();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting questions:', error);
            this.showMessage('Failed to delete questions', 'error');
        }
    }

    toggleQuestionSelection(questionId) {
        if (this.selectedQuestions.has(questionId)) {
            this.selectedQuestions.delete(questionId);
        } else {
            this.selectedQuestions.add(questionId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
        
        if (selectAllCheckbox.checked) {
            this.questions.forEach(question => {
                this.selectedQuestions.add(question._id);
            });
        } else {
            this.selectedQuestions.clear();
        }
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        bulkDeleteBtn.disabled = this.selectedQuestions.size === 0;
        
        if (this.selectedQuestions.size === 0) {
            selectAllCheckbox.checked = false;
        } else if (this.selectedQuestions.size === this.questions.length) {
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadQuestions();
        }
    }

    closeModal() {
        document.getElementById('questionModal').classList.add('hidden');
        this.editingQuestion = null;
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.deletingQuestionId = null;
    }

    showLoading() {
        const tbody = document.getElementById('questionsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-10 text-gray-600">
                    <div class="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    Loading questions...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderQuestions
    }

    highlightSearch(text) {
        if (!this.searchTerm) return text;
        
        const regex = new RegExp(`(${this.searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    formatQuestionType(type) {
        const typeMap = {
            'multiple-choice': 'MCQ',
            'true-false': 'T/F',
            'short-answer': 'Short'
        };
        return typeMap[type] || type;
    }

    formatOptions(options) {
        if (!options || options.length === 0) return 'No options';
        return options.slice(0, 2).join(', ') + (options.length > 2 ? '...' : '');
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
    console.log('Global openCreateModal called for questions');
    
    // Direct modal opening without manager dependency
    try {
        const modal = document.getElementById('questionModal');
        console.log('Question modal element found:', modal);
        
        if (modal) {
            // Reset form
            const form = document.getElementById('questionForm');
            if (form) form.reset();
            
            // Set title
            const title = document.getElementById('modalTitle');
            if (title) title.textContent = 'Add New Question';
            
            // Show modal
            modal.style.display = 'block';
            console.log('Question modal should be visible now');
        } else {
            console.error('Question modal element not found!');
            alert('Question modal element not found!');
        }
    } catch (error) {
        console.error('Error opening question modal:', error);
        alert('Error opening question modal: ' + error.message);
    }
    
    // Also try with manager if available
    if (questionsManager) {
        questionsManager.openCreateModal();
    } else {
        console.log('questionsManager not available, using direct approach');
    }
}

function closeModal() {
    console.log('closeModal called for questions');
    const modal = document.getElementById('questionModal');
    if (modal) {
        modal.style.display = 'none';
        console.log('Question modal hidden');
    }
    
    if (questionsManager) {
        questionsManager.closeModal();
    }
}

// Global save function
function saveQuestion() {
    console.log('Global saveQuestion called');
    
    if (questionsManager) {
        questionsManager.saveQuestion();
    } else {
        console.error('questionsManager not available for saving');
        alert('Error: Question manager not available');
    }
}

// Global edit function
function editQuestion(questionId) {
    console.log('Global editQuestion called with ID:', questionId);
    
    if (questionsManager) {
        questionsManager.editQuestion(questionId);
    } else {
        console.error('questionsManager not available for editing');
        alert('Error: Question manager not available');
    }
}

function closeDeleteModal() {
    questionsManager.closeDeleteModal();
}

function bulkDelete() {
    questionsManager.bulkDelete();
}

function toggleSelectAll() {
    questionsManager.toggleSelectAll();
}

function confirmDelete() {
    questionsManager.confirmDelete();
}

function toggleQuestionType() {
    questionsManager.toggleQuestionType();
}

function addOption() {
    questionsManager.addOption();
}

function removeOption(button) {
    button.parentElement.remove();
}

// Initialize the questions manager when the page loads
let questionsManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Questions page loaded, initializing manager...');
    try {
        questionsManager = new QuestionsManager();
        console.log('Questions manager initialized successfully');
    } catch (error) {
        console.error('Error initializing questions manager:', error);
    }
});

// Debug function to test if JavaScript is working
window.testQuestions = function() {
    console.log('Test function called - JavaScript is working');
    alert('JavaScript is working!');
};

// Debug function to test modal directly
window.testQuestionModal = function() {
    console.log('Testing question modal directly...');
    const modal = document.getElementById('questionModal');
    console.log('Question modal element:', modal);
    if (modal) {
        modal.style.display = 'block';
        console.log('Question modal display set to block');
        alert('Question modal should be visible now!');
    } else {
        console.error('Question modal not found!');
        alert('Question modal not found!');
    }
};

// Debug function to test question edit functionality
window.testQuestionEdit = function() {
    console.log('Testing question edit functionality...');
    if (questionsManager && questionsManager.questions.length > 0) {
        console.log('Manager available, testing edit with first question...');
        const firstQuestion = questionsManager.questions[0];
        console.log('First question:', firstQuestion);
        questionsManager.editQuestion(firstQuestion._id);
    } else {
        console.error('Manager not available or no questions');
        alert('Manager not available or no questions to edit');
    }
};

// Initialize the manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing questions manager...');
    window.questionsManager = new QuestionsManager();
    console.log('Questions manager initialized:', window.questionsManager);
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
} else {
    console.log('DOM already loaded, initializing immediately...');
    window.questionsManager = new QuestionsManager();
    console.log('Questions manager initialized immediately:', window.questionsManager);
}
