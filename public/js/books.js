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
        // Ensure DOM is ready before manipulating DOM nodes (some pages may load this script early)
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }

        await this.loadBooks();
        this.setupEventListeners();
        this.updateStats();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchTerm = e.target.value;
                    this.currentPage = 1;
                    this.loadBooks();
                }, 500);
            });
        }

        // Form submission
        const bookForm = document.getElementById('bookForm');
        if (bookForm) {
            bookForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBook();
            });
        }

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
    if (pdfFileError) pdfFileError.textContent = '';
    const pdfInputEl = document.getElementById('pdfFile');
    if (pdfInputEl) pdfInputEl.classList.remove('is-invalid');

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
        const booksList = document.getElementById('booksList');
        
        if (!booksList) return; // defensive: bail if DOM not present

        if (this.books.length === 0) {
            booksList.innerHTML = `
                <div class="col-span-full flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-book text-gray-400"></i>
                        </div>
                        <p class="text-sm text-gray-500">No books found</p>
                    </div>
                </div>
            `;
            return;
        }

        booksList.innerHTML = this.books.map(book => `
            <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div class="flex items-start space-x-3">
                    <div class="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <i class="fas fa-book text-gray-400"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-medium text-gray-900 truncate">${this.highlightSearch(book.title)}</h3>
                        <p class="text-sm text-gray-600 truncate">${this.highlightSearch(book.author)}</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <span class="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">${book.genre || 'Unknown'}</span>
                            <span class="text-xs text-gray-500">${book.language || 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1">
                        <button onclick="booksManager.viewPDF('${book._id}')" 
                                class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded" 
                                title="View PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button onclick="booksManager.editBook('${book._id}')" 
                                class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded" 
                                title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="booksManager.deleteBook('${book._id}')" 
                                class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded" 
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPagination() {
        // Remove pagination since the HTML doesn't have pagination elements
        // Keep method for compatibility but do nothing
        return;
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
        
        // Create book data object based on actual form fields
        const bookData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            categoryId: document.getElementById('categoryId').value,
            description: document.getElementById('description').value,
            isPublished: document.getElementById('isPublished').checked
        };

        // Basic validation
        if (!bookData.title || !bookData.author) {
            this.showMessage('Title and author are required', 'error');
            return;
        }

        try {
            let url, method, requestBody, headers;

            if (this.editingBook) {
                // Update existing book
                url = `/api/management/books/${this.editingBook._id}`;
                method = 'PUT';
                headers = { 'Content-Type': 'application/json' };
                requestBody = JSON.stringify(bookData);
            } else {
                // Create new book with PDF
                url = '/api/management/books';
                method = 'POST';
                headers = { 'Content-Type': 'application/json' };
                
                // Convert PDF file to base64 if provided
                if (fileInput.files[0]) {
                    try {
                        const pdfBase64 = await this.fileToBase64(fileInput.files[0]);
                        bookData.pdf = pdfBase64;
                        console.log('PDF converted to base64');
                    } catch (conversionError) {
                        this.showMessage('Failed to process PDF file: ' + conversionError.message, 'error');
                        return;
                    }
                }
                
                requestBody = JSON.stringify(bookData);
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
                this.showMessage(data.message || 'Book saved successfully', 'success');
                form.reset();
                this.editingBook = null;
                document.getElementById('submitBtnText').textContent = 'Add Book';
                await this.loadBooks();
            } else {
                this.showMessage('Error: ' + (data.error || data.message), 'error');
            }
        } catch (error) {
            console.error('Error saving book:', error);
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
        
        if (bulkDeleteBtn) {
            if (this.selectedBooks.size > 0) {
                bulkDeleteBtn.disabled = false;
                bulkDeleteBtn.textContent = `Delete Selected (${this.selectedBooks.size})`;
            } else {
                bulkDeleteBtn.disabled = true;
                bulkDeleteBtn.textContent = 'Delete Selected';
            }
        }
        
        // Update select all checkbox state
        const checkboxes = document.querySelectorAll('input[type="checkbox"][value]');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        if (selectAllCheckbox) {
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
    }

    showLoading() {
        const booksList = document.getElementById('booksList');
        if (!booksList) return; // defensive: avoid setting innerHTML on null

        booksList.innerHTML = `
            <div class="col-span-full flex items-center justify-center py-12">
                <div class="text-center">
                    <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-spinner fa-spin text-gray-400"></i>
                    </div>
                    <p class="text-sm text-gray-500">Loading books...</p>
                </div>
            </div>
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
        messageDiv.className = `message fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm`;
        
        if (type === 'success') {
            messageDiv.className += ' bg-green-100 border border-green-200 text-green-800';
        } else if (type === 'error') {
            messageDiv.className += ' bg-red-100 border border-red-200 text-red-800';
        } else {
            messageDiv.className += ' bg-blue-100 border border-blue-200 text-blue-800';
        }
        
        messageDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
                <span class="text-sm">${message}</span>
            </div>
        `;

        // Insert into body
        document.body.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    updateStats() {
        const totalBooks = this.books.length;
        
        // Update UI - match the HTML element IDs
        const totalBooksEl = document.getElementById('totalBooks');
        if (totalBooksEl) totalBooksEl.textContent = totalBooks;
        
        // Other stats elements might not exist in this HTML, so guard them
        const publishedBooksEl = document.getElementById('publishedBooks');
        if (publishedBooksEl) publishedBooksEl.textContent = this.books.filter(b => b.isPublished).length;
        
        const totalCategoriesEl = document.getElementById('totalCategories');
        if (totalCategoriesEl) {
            const uniqueCategories = new Set(this.books.map(b => b.categoryId).filter(Boolean));
            totalCategoriesEl.textContent = uniqueCategories.size;
        }
        
        const totalDownloadsEl = document.getElementById('totalDownloads');
        if (totalDownloadsEl) totalDownloadsEl.textContent = '-'; // No download data available
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

function loadBooks() {
    if (window.booksManager) {
        booksManager.loadBooks();
    }
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
