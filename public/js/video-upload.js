// Video Upload Management Script
class VideoUploadManager {
    constructor() {
        this.init();
        this.loadVideos();
    }

    init() {
        // Get DOM elements
        this.form = document.getElementById('videoUploadForm');
        this.fileInput = document.getElementById('video');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.status = document.getElementById('status');
        this.videoContainer = document.getElementById('videoContainer');
        this.fileDisplay = document.getElementById('file-display');

        // Bind events
        this.bindEvents();
    }

    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleUpload(e));
        
        // File selection
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop on the drop zone
        const dropZone = document.getElementById('dropZone');
        dropZone.addEventListener('click', () => this.fileInput.click());
        dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.displaySelectedFile(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    handleDrop(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('video/')) {
                this.fileInput.files = files;
                this.displaySelectedFile(file);
            } else {
                this.showStatus('Please select a valid video file', 'error');
            }
        }
    }

    displaySelectedFile(file) {
        const fileSize = (file.size / (1024 * 1024)).toFixed(2); // MB
        const fileName = file.name;
        
        const uploadPrompt = document.getElementById('uploadPrompt');
        uploadPrompt.style.display = 'none';
        
        this.fileDisplay.style.display = 'block';
        this.fileDisplay.innerHTML = `
            <div class="flex items-center justify-center space-x-4">
                <div class="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                    <i class="fas fa-video text-white"></i>
                </div>
                <div class="text-left">
                    <p class="text-sm font-medium text-gray-900">${fileName}</p>
                    <p class="text-xs text-gray-500">Size: ${fileSize} MB</p>
                    <p class="text-xs text-green-600">✓ File selected</p>
                </div>
            </div>
        `;
        
        // Update drop zone styling
        const dropZone = document.getElementById('dropZone');
        dropZone.classList.add('border-green-400', 'bg-green-50');
        dropZone.classList.remove('border-gray-300');
    }

    async handleUpload(event) {
        event.preventDefault();
        
        const file = this.fileInput.files[0];
        
        if (!file) {
            this.showStatus('Please select a video file', 'error');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('video/')) {
            this.showStatus('Please select a valid video file', 'error');
            return;
        }

        // Validate file size (80MB limit)
        const maxSize = 80 * 1024 * 1024; // 80MB
        if (file.size > maxSize) {
            this.showStatus('File size must be less than 80MB', 'error');
            return;
        }

        // Create FormData and explicitly add all fields
        const formData = new FormData();
        
        // Add form fields
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        
        formData.append('title', title);
        formData.append('description', description);
        formData.append('video', file); // Explicitly add the video file
        
        console.log('📤 Sending FormData with:');
        console.log('- Title:', title);
        console.log('- Description:', description);
        console.log('- File:', file.name, file.type, file.size);

        try {
            await this.uploadVideo(formData);
        } catch (error) {
            console.error('Upload error:', error);
            this.showStatus(`Upload failed: ${error.message}`, 'error');
        }
    }

    async uploadVideo(formData) {
        // Disable form and show progress
        this.toggleUploadState(true);
        this.showProgress(0);
        
        try {
            const xhr = new XMLHttpRequest();
            
            // Progress tracking
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    this.showProgress(percentComplete);
                }
            });

            // Upload promise
            const uploadPromise = new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status === 201) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                    }
                };
                
                xhr.onerror = () => reject(new Error('Network error occurred'));
            });

            // Start upload
            xhr.open('POST', '/api/videos/upload');
            xhr.send(formData);

            // Wait for completion
            const result = await uploadPromise;
            
            // Success handling
            this.showStatus('✅ Video uploaded successfully to Google Drive!', 'success');
            this.resetForm();
            this.loadVideos(); // Refresh video list
            
        } catch (error) {
            throw error;
        } finally {
            this.toggleUploadState(false);
            this.hideProgress();
        }
    }

    toggleUploadState(uploading) {
        this.uploadBtn.disabled = uploading;
        const btnText = document.getElementById('uploadBtnText');
        btnText.textContent = uploading ? 'Uploading...' : 'Upload Video';
        
        // Disable form inputs
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => input.disabled = uploading);
    }

    showProgress(percent) {
        this.progressContainer.classList.remove('hidden');
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = `${Math.round(percent)}%`;
    }

    hideProgress() {
        setTimeout(() => {
            this.progressContainer.classList.add('hidden');
            this.progressFill.style.width = '0%';
        }, 1000);
    }

    showStatus(message, type) {
        const statusColors = {
            'success': 'bg-green-50 border-green-200 text-green-800',
            'error': 'bg-red-50 border-red-200 text-red-800'
        };
        
        this.status.className = `p-4 rounded-lg text-sm border ${statusColors[type] || 'bg-gray-50 border-gray-200 text-gray-800'}`;
        this.status.innerHTML = message;
        this.status.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.status.classList.add('hidden');
        }, 5000);
    }

    resetForm() {
        this.form.reset();
        
        // Reset file display
        const uploadPrompt = document.getElementById('uploadPrompt');
        uploadPrompt.style.display = 'block';
        this.fileDisplay.style.display = 'none';
        
        // Reset drop zone styling
        const dropZone = document.getElementById('dropZone');
        dropZone.classList.remove('border-green-400', 'bg-green-50');
        dropZone.classList.add('border-gray-300');
    }

    async loadVideos() {
        try {
            console.log('📡 Fetching videos from /api/videos...');
            const response = await fetch('/api/videos');
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Server returned ${response.status}:`, errorText);
                
                if (response.status === 401) {
                    this.videoContainer.innerHTML = `
                        <div class="flex items-center justify-center py-12">
                            <div class="text-center">
                                <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i class="fas fa-lock text-amber-500"></i>
                                </div>
                                <p class="text-sm text-amber-600 font-medium">Session Expired</p>
                                <p class="text-xs text-gray-500 mt-1">Please log in again to manage videos.</p>
                                <a href="/admin-login" class="inline-block mt-3 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg hover:bg-black transition-colors">Log In</a>
                            </div>
                        </div>
                    `;
                    return;
                }
                throw new Error(`Server error: ${response.status}`);
            }

            const responseText = await response.text();
            if (!responseText) {
                console.warn('⚠️ Received empty response from server');
                this.renderVideos([]);
                return;
            }

            try {
                const videos = JSON.parse(responseText);
                this.allVideos = videos;
                this.renderVideos(videos);
            } catch (parseError) {
                console.error('❌ Failed to parse JSON:', responseText);
                throw parseError;
            }
        } catch (error) {
            console.error('Error loading videos:', error);
            this.videoContainer.innerHTML = `
                <div class="flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-exclamation-triangle text-red-400"></i>
                        </div>
                        <p class="text-sm text-red-500">Failed to load videos: ${error.message}</p>
                    </div>
                </div>
            `;
        }
    }

    renderVideos(videos) {
        if (!videos || videos.length === 0) {
            this.videoContainer.innerHTML = `
                <div class="flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i class="fas fa-video text-gray-400"></i>
                        </div>
                        <p class="text-sm text-gray-500">No videos uploaded yet</p>
                    </div>
                </div>
            `;
            return;
        }

        const videosHTML = videos.map(video => `
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                            <i class="fas fa-video text-white text-sm"></i>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900">${video.title}</h3>
                            <p class="text-sm text-gray-600">${video.description || 'No description'}</p>
                            <div class="flex items-center space-x-4 mt-1">
                                <span class="text-xs text-gray-500">${this.formatFileSize(video.fileSize)}</span>
                                <span class="text-xs text-gray-500">${new Date(video.uploadedAt).toLocaleDateString()}</span>
                                <a href="${video.url}" target="_blank" class="text-xs text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-external-link-alt mr-1"></i>View
                                </a>
                            </div>
                        </div>
                    </div>
                    <button onclick="videoManager.deleteVideo('${video._id}')" 
                            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.videoContainer.innerHTML = videosHTML;
    }

    handleSearch(searchTerm) {
        if (!this.allVideos) return;
        
        const filteredVideos = this.allVideos.filter(video => 
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        this.renderVideos(filteredVideos);
    }

    async deleteVideo(videoId) {
        if (!confirm('Are you sure you want to delete this video? This will remove it from both the database and Google Drive.')) {
            return;
        }

        try {
            const response = await fetch(`/api/videos/${videoId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showStatus('✅ Video deleted successfully', 'success');
                this.loadVideos(); // Refresh list
            } else {
                throw new Error('Failed to delete video');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showStatus(`❌ Failed to delete video: ${error.message}`, 'error');
        }
    }

    formatFileSize(bytes) {
        if (!bytes) return 'Unknown';
        
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }
}

// Initialize the video upload manager when page loads
let videoManager;
document.addEventListener('DOMContentLoaded', () => {
    videoManager = new VideoUploadManager();
    
    // Add some helpful console messages
    console.log('📹 Video Upload Manager initialized');
    console.log('🚀 Ready to upload videos to Google Drive!');
});
