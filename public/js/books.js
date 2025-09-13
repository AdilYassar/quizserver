class BooksManager {
    constructor() {
        this.books = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchTerm = '';
        this.sortBy = 'title';
        this.sortOrder = 'asc';
        this.selectedBooks = new Set();
        this.editingBook = null;
        
        this.init();
    }

    async init() {
        await this.loadBooks();
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
                this.loadBooks();
            }, 500);
        });
    }

    async loadBooks() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 10,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            const response = await fetch(`/api/management/books?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.books = data.data;
                this.totalPages = data.pagination.pages;
                this.renderBooks();
                this.renderPagination();
                this.updateStats();
            } else {
                this.showMessage('Error loading books: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error loading books:', error);
            this.showMessage('Failed to load books', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderBooks() {
        const tbody = document.getElementById('booksTableBody');
        
        if (this.books.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-book"></i>
                        <h3>No books found</h3>
                        <p>Try adjusting your search criteria or add a new book.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.books.map(book => `
            <tr>
                <td>
                    <input type="checkbox" 
                           value="${book._id}" 
                           onchange="booksManager.toggleBookSelection('${book._id}')"
                           ${this.selectedBooks.has(book._id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="book-title">${this.highlightSearch(book.title)}</div>
                </td>
                <td>
                    <div class="book-author">${this.highlightSearch(book.author)}</div>
                </td>
                <td>
                    <span class="genre-badge">${book.genre}</span>
                </td>
                <td>
                    <span class="language-badge">${book.language}</span>
                </td>
                <td>
                    <span class="pages-count">${book.pages}</span>
                </td>
                <td class="date-cell">${this.formatDate(book.publishedDate)}</td>
                <td class="action-buttons-cell">
                    <button class="btn btn-sm btn-primary" onclick="booksManager.editBook('${book._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="booksManager.deleteBook('${book._id}')">
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
            <button onclick="booksManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="booksManager.goToPage(${i})" 
                        class="${i === this.currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button onclick="booksManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    async goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            await this.loadBooks();
        }
    }

    openCreateModal() {
        this.editingBook = null;
        document.getElementById('modalTitle').textContent = 'Add New Book';
        document.getElementById('bookForm').reset();
        this.clearFormValidation();
        document.getElementById('bookModal').style.display = 'block';
    }

    editBook(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (!book) return;

        this.editingBook = book;
        document.getElementById('modalTitle').textContent = 'Edit Book';
        
        // Populate form
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('genre').value = book.genre;
        document.getElementById('language').value = book.language;
        document.getElementById('pages').value = book.pages;
        document.getElementById('publishedDate').value = new Date(book.publishedDate).toISOString().split('T')[0];
        
        this.clearFormValidation();
        document.getElementById('bookModal').style.display = 'block';
    }

    async saveBook() {
        const form = document.getElementById('bookForm');
        const formData = new FormData(form);

        const bookData = {
            title: formData.get('title'),
            author: formData.get('author'),
            genre: formData.get('genre'),
            language: formData.get('language'),
            pages: parseInt(formData.get('pages')),
            publishedDate: formData.get('publishedDate')
        };

        // Validation
        if (!this.validateForm(bookData)) {
            return;
        }

        try {
            const url = this.editingBook 
                ? `/api/management/books/${this.editingBook._id}`
                : '/api/management/books';
            
            const method = this.editingBook ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadBooks();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving book:', error);
            this.showMessage('Failed to save book', 'error');
        }
    }

    validateForm(data) {
        let isValid = true;
        this.clearFormValidation();

        // Title validation
        if (!data.title || data.title.trim().length === 0) {
            this.showFieldError('title', 'Title is required');
            isValid = false;
        }

        // Author validation
        if (!data.author || data.author.trim().length === 0) {
            this.showFieldError('author', 'Author is required');
            isValid = false;
        }

        // Genre validation
        if (!data.genre || data.genre.trim().length === 0) {
            this.showFieldError('genre', 'Genre is required');
            isValid = false;
        }

        // Language validation
        if (!data.language || data.language.trim().length === 0) {
            this.showFieldError('language', 'Language is required');
            isValid = false;
        }

        // Pages validation
        if (!data.pages || data.pages < 1) {
            this.showFieldError('pages', 'Pages must be at least 1');
            isValid = false;
        }

        // Published date validation
        if (!data.publishedDate) {
            this.showFieldError('publishedDate', 'Published date is required');
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
        const fields = ['title', 'author', 'genre', 'language', 'pages', 'publishedDate'];
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
        this.editingBook = null;
        document.getElementById('bookModal').style.display = 'none';
        document.getElementById('bookForm').reset();
        this.clearFormValidation();
    }

    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book?')) {
            return;
        }

        try {
            const response = await fetch(`/api/management/books/${bookId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                await this.loadBooks();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            this.showMessage('Failed to delete book', 'error');
        }
    }

    async bulkDelete() {
        if (this.selectedBooks.size === 0) return;

        try {
            const response = await fetch('/api/management/books/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(this.selectedBooks) })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(data.message, 'success');
                this.selectedBooks.clear();
                this.updateBulkActions();
                await this.loadBooks();
            } else {
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error bulk deleting books:', error);
            this.showMessage('Failed to delete books', 'error');
        }
    }

    toggleBookSelection(bookId) {
        if (this.selectedBooks.has(bookId)) {
            this.selectedBooks.delete(bookId);
        } else {
            this.selectedBooks.add(bookId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
        
        if (selectAllCheckbox.checked) {
            checkboxes.forEach(checkbox => {
                this.selectedBooks.add(checkbox.value);
                checkbox.checked = true;
            });
        } else {
            this.selectedBooks.clear();
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (this.selectedBooks.size > 0) {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.textContent = `Delete Selected (${this.selectedBooks.size})`;
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
        const tbody = document.getElementById('booksTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    <div class="spinner"></div>
                    Loading books...
                </td>
            </tr>
        `;
    }

    hideLoading() {
        // Loading is handled in renderBooks
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
            day: 'numeric'
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
function openCreateModal() {
    booksManager.openCreateModal();
}

function closeModal() {
    booksManager.closeModal();
}

function saveBook() {
    booksManager.saveBook();
}

function bulkDelete() {
    booksManager.bulkDelete();
}

function toggleSelectAll() {
    booksManager.toggleSelectAll();
}

function closeDeleteModal() {
    booksManager.closeDeleteModal();
}

// Initialize the manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing books manager...');
    window.booksManager = new BooksManager();
    console.log('Books manager initialized:', window.booksManager);
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
} else {
    console.log('DOM already loaded, initializing immediately...');
    window.booksManager = new BooksManager();
    console.log('Books manager initialized immediately:', window.booksManager);
}
