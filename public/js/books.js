// Define genre categories
const GENRE_CATEGORIES = {
    fiction: [
        'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Thriller', 
        'Horror', 'Historical Fiction', 'Adventure', 'Crime', 'Drama', 'Literary Fiction'
    ],
    nonFiction: [
        'Biography', 'Autobiography', 'History', 'Science', 'Technology', 
        'Business', 'Self-Help', 'Health & Fitness', 'Cooking', 'Travel', 
        'Politics', 'Philosophy', 'Religion', 'Psychology'
    ],
    educational: [
        'Textbook', 'Mathematics', 'Computer Science', 'Engineering', 'Medicine', 
        'Law', 'Economics', 'Physics', 'Chemistry', 'Biology', 'Literature', 
        'Language Learning', 'Art & Design', 'Music', 'Programming', 'Database Systems'
    ],
    children: [
        'Picture Books', 'Early Readers', 'Middle Grade', 'Young Adult'
    ],
    reference: [
        'Dictionary', 'Encyclopedia', 'Manual', 'Guide'
    ]
};

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

        // File upload functionality
        this.setupFileUpload();
    }

    setupFileUpload() {
        const fileInput = document.getElementById('pdfFile');
        const uploadContainer = document.querySelector('.file-upload-container');
        const uploadInfo = document.querySelector('.file-upload-info');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

        if (!fileInput || !uploadContainer) return;

        // File input change event
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Drag and drop functionality
        uploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadContainer.classList.add('dragover');
        });

        uploadContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('dragover');
        });

        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
                fileInput.files = files; // Update the input
            }
        });
    }

    handleFileSelect(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const uploadInfo = document.querySelector('.file-upload-info');
        const pdfFileError = document.getElementById('pdfFileError');

        // Clear previous errors
        pdfFileError.textContent = '';
        document.getElementById('pdfFile').classList.remove('is-invalid');

        if (!file) {
            fileInfo.style.display = 'none';
            uploadInfo.style.display = 'flex';
            return;
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            this.showFieldError('pdfFile', 'Please select a PDF file');
            return;
        }

        // Validate file size (25MB)
        const maxSize = 25 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showFieldError('pdfFile', 'File size must be less than 25MB');
            return;
        }

        // Show file info
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        fileInfo.style.display = 'flex';
        uploadInfo.style.display = 'none';

        // Clear validation error if any
        document.getElementById('pdfFile').classList.remove('is-invalid');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                    <button class="btn btn-sm btn-secondary" onclick="booksManager.viewPDF('${book._id}')" title="View PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="booksManager.editBook('${book._id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="booksManager.deleteBook('${book._id}')" title="Delete">
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
        
        // Reset and show file upload UI for new books
        const fileUploadContainer = document.querySelector('.file-upload-container');
        const fileInfo = document.getElementById('fileInfo');
        const uploadInfo = document.querySelector('.file-upload-info');
        const progressContainer = document.getElementById('uploadProgress');
        const pdfFileInput = document.getElementById('pdfFile');
        
        // Show file upload container
        if (fileUploadContainer) fileUploadContainer.style.display = 'block';
        
        // Hide file info and show upload prompt
        if (fileInfo) fileInfo.style.display = 'none';
        if (uploadInfo) uploadInfo.style.display = 'flex';
        if (progressContainer) progressContainer.style.display = 'none';
        
        // Make PDF field required for new books
        if (pdfFileInput) {
            pdfFileInput.setAttribute('required', 'required');
        }
        
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
        
        // Hide file upload section for editing and show current PDF info
        const fileUploadContainer = document.querySelector('.file-upload-container');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const pdfFileInput = document.getElementById('pdfFile');
        
        if (fileUploadContainer) fileUploadContainer.style.display = 'none';
        
        // Show current PDF info
        if (fileInfo && fileName && fileSize) {
            fileName.textContent = `${book.title}.pdf (Current PDF)`;
            fileSize.textContent = 'Stored in database';
            fileInfo.style.display = 'flex';
            
            // Add view current PDF link
            const existingLink = fileInfo.querySelector('.view-current-pdf');
            if (existingLink) existingLink.remove();
            
            const viewLink = document.createElement('button');
            viewLink.className = 'btn btn-sm btn-secondary view-current-pdf';
            viewLink.innerHTML = '<i class="fas fa-eye"></i> View Current PDF';
            viewLink.style.marginLeft = 'auto';
            viewLink.onclick = (e) => {
                e.preventDefault();
                this.viewPDF(book._id);
            };
            fileInfo.appendChild(viewLink);
        }
        
        // Make PDF field not required for editing
        if (pdfFileInput) {
            pdfFileInput.removeAttribute('required');
        }
        
        this.clearFormValidation();
        document.getElementById('bookModal').style.display = 'block';
    }

    viewPDF(bookId) {
        const book = this.books.find(b => b._id === bookId);
        if (!book) return;

        // Open PDF in a new tab
        const pdfUrl = `/api/management/books/${bookId}/pdf`;
        window.open(pdfUrl, '_blank');
    }

    async saveBook() {
        const form = document.getElementById('bookForm');
        const fileInput = document.getElementById('pdfFile');
        
        // Create book data object
        const bookData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            genre: document.getElementById('genre').value,
            language: document.getElementById('language').value,
            pages: parseInt(document.getElementById('pages').value),
            publishedDate: document.getElementById('publishedDate').value
        };

        // Validation
        if (!this.validateForm(bookData, !this.editingBook)) {
            return;
        }

        try {
            let url, method, requestBody, headers;

            if (this.editingBook) {
                // Update existing book (without PDF for now)
                url = `/api/management/books/${this.editingBook._id}`;
                method = 'PUT';
                headers = { 'Content-Type': 'application/json' };
                requestBody = JSON.stringify(bookData);
            } else {
                // Create new book with PDF
                url = '/api/admin/management/books';
                method = 'POST';
                headers = { 'Content-Type': 'application/json' };
                
                // Convert PDF file to base64
                if (fileInput.files[0]) {
                    this.showUploadProgress(10);
                    
                    try {
                        const pdfBase64 = await this.fileToBase64(fileInput.files[0]);
                        bookData.pdf = pdfBase64; // Add base64 PDF to the data
                        
                        this.showUploadProgress(50);
                        console.log('PDF converted to base64, size:', pdfBase64.length, 'characters');
                    } catch (conversionError) {
                        this.hideUploadProgress();
                        this.showMessage('Failed to process PDF file: ' + conversionError.message, 'error');
                        return;
                    }
                }
                
                requestBody = JSON.stringify(bookData);
            }

            // Show progress for file uploads
            if (!this.editingBook && fileInput.files[0]) {
                this.showUploadProgress(70);
            }

            console.log(`Making ${method} request to ${url}`);
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: requestBody
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                this.hideUploadProgress();
                this.showMessage(data.message, 'success');
                this.closeModal();
                await this.loadBooks();
            } else {
                this.hideUploadProgress();
                this.showMessage('Error: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving book:', error);
            this.hideUploadProgress();
            this.showMessage('Failed to save book', 'error');
        }
    }

    showUploadProgress(percent) {
        const progressContainer = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressContainer && progressFill && progressText) {
            progressContainer.style.display = 'block';
            progressFill.style.width = percent + '%';
            progressText.textContent = Math.round(percent) + '%';
        }
    }

    hideUploadProgress() {
        const progressContainer = document.getElementById('uploadProgress');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    // Helper function to convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove the data:application/pdf;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    validateForm(data, requirePdf = false) {
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

        // PDF file validation (only for new books)
        if (requirePdf) {
            const fileInput = document.getElementById('pdfFile');
            if (!fileInput.files || !fileInput.files[0]) {
                this.showFieldError('pdfFile', 'PDF file is required');
                isValid = false;
            } else {
                const file = fileInput.files[0];
                if (file.type !== 'application/pdf') {
                    this.showFieldError('pdfFile', 'Please select a PDF file');
                    isValid = false;
                }
                if (file.size > 20 * 1024 * 1024) {
                    this.showFieldError('pdfFile', 'File size must be less than 20MB');
                    isValid = false;
                }
            }
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
        
        // Reset file upload UI to default state
        const fileUploadContainer = document.querySelector('.file-upload-container');
        const fileInfo = document.getElementById('fileInfo');
        const uploadInfo = document.querySelector('.file-upload-info');
        const progressContainer = document.getElementById('uploadProgress');
        const pdfFileInput = document.getElementById('pdfFile');
        
        if (fileUploadContainer) fileUploadContainer.style.display = 'block';
        if (fileInfo) fileInfo.style.display = 'none';
        if (uploadInfo) uploadInfo.style.display = 'flex';
        if (progressContainer) progressContainer.style.display = 'none';
        if (pdfFileInput) pdfFileInput.setAttribute('required', 'required');
        
        // Remove any view PDF buttons
        const viewButtons = document.querySelectorAll('.view-current-pdf');
        viewButtons.forEach(btn => btn.remove());
        
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
        const totalBooks = this.books.length;
        
        // Categorize books by genre
        let fictionCount = 0;
        let nonFictionCount = 0;
        let educationalCount = 0;
        let recentCount = 0;
        
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        this.books.forEach(book => {
            const genre = book.genre || '';
            
            // Check categories - including children's and reference in appropriate categories
            if (GENRE_CATEGORIES.fiction.includes(genre) || GENRE_CATEGORIES.children.includes(genre)) {
                fictionCount++;
            } else if (GENRE_CATEGORIES.nonFiction.includes(genre) || GENRE_CATEGORIES.reference.includes(genre)) {
                nonFictionCount++;
            } else if (GENRE_CATEGORIES.educational.includes(genre)) {
                educationalCount++;
            } else if (genre) {
                // For custom genres, try to categorize based on common patterns
                const lowerGenre = genre.toLowerCase();
                if (lowerGenre.includes('fiction') || lowerGenre.includes('novel') || lowerGenre.includes('story')) {
                    fictionCount++;
                } else if (lowerGenre.includes('textbook') || lowerGenre.includes('academic') || lowerGenre.includes('education')) {
                    educationalCount++;
                } else {
                    // Default custom genres to non-fiction
                    nonFictionCount++;
                }
            }
            
            // Count recent books (this month)
            if (book.createdAt && new Date(book.createdAt) >= thisMonth) {
                recentCount++;
            }
        });
        
        // Update UI
        document.getElementById('totalBooks').textContent = totalBooks;
        document.getElementById('fictionBooks').textContent = fictionCount;
        document.getElementById('nonFictionBooks').textContent = nonFictionCount;
        document.getElementById('educationalBooks').textContent = educationalCount;
        document.getElementById('recentBooks').textContent = recentCount;
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
