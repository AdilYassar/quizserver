const fs = require('fs');
const path = require('path');

// Template for consistent management page structure
const getManagementPageTemplate = (title, description, stats, tableColumns) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Quiz Server</title>
    <link rel="stylesheet" href="css/management-shared.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="management-container">
        <!-- Main Content -->
        <main class="main-content">
            <div class="top-bar">
                <h1 class="page-title">${title}</h1>
                <a href="/custom-dashboard" class="admin-link">
                    <i class="fas fa-arrow-left"></i>
                    Back to Dashboard
                </a>
            </div>

            <div class="content">
                <!-- Page Header -->
                <div class="page-header">
                    <h1>${title}</h1>
                    <p>${description}</p>
                </div>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    ${stats}
                </div>

                <!-- Action Bar -->
                <div class="action-bar">
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="searchInput" class="search-input" placeholder="Search...">
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="openCreateModal()">
                            <i class="fas fa-plus"></i>
                            Add Item
                        </button>
                        <button class="btn btn-danger" onclick="bulkDelete()" id="bulkDeleteBtn" disabled>
                            <i class="fas fa-trash"></i>
                            Delete Selected
                        </button>
                    </div>
                </div>

                <!-- Data Table -->
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" id="selectAll" onchange="toggleSelectAll()">
                                </th>
                                ${tableColumns}
                            </tr>
                        </thead>
                        <tbody id="dataTableBody">
                            <tr>
                                <td colspan="100" class="loading">
                                    <div class="spinner"></div>
                                    Loading data...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="pagination" id="pagination">
                    <!-- Pagination buttons will be generated here -->
                </div>
            </div>
        </main>
    </div>

    <!-- Modals and scripts will be added by individual pages -->
</body>
</html>`;

// Page configurations
const pages = [
    {
        file: 'enrolled-courses.html',
        title: 'Enrolled Courses Management',
        description: 'Track student course enrollments in the system.',
        stats: `
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Total Enrollments</span>
                    <div class="stat-icon">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                </div>
                <div class="stat-value" id="totalEnrollments">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>All enrollments</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Active Students</span>
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
                <div class="stat-value" id="activeStudents">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>Currently enrolled</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Popular Courses</span>
                    <div class="stat-icon">
                        <i class="fas fa-star"></i>
                    </div>
                </div>
                <div class="stat-value" id="popularCourses">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>Most enrolled</span>
                </div>
            </div>
        `,
        tableColumns: `
            <th>Student</th>
            <th>Course</th>
            <th>Enrolled At</th>
            <th>Actions</th>
        `
    },
    {
        file: 'quiz-submissions.html',
        title: 'Quiz Submissions Management',
        description: 'Review and manage quiz submissions in the system.',
        stats: `
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Total Submissions</span>
                    <div class="stat-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                </div>
                <div class="stat-value" id="totalSubmissions">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>All submissions</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Completed</span>
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="stat-value" id="completedSubmissions">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>Finished quizzes</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Average Score</span>
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                </div>
                <div class="stat-value" id="averageScore">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>Overall performance</span>
                </div>
            </div>
        `,
        tableColumns: `
            <th>Student</th>
            <th>Course</th>
            <th>Quiz</th>
            <th>Score</th>
            <th>Status</th>
            <th>Started At</th>
            <th>Actions</th>
        `
    },
    {
        file: 'theory.html',
        title: 'Theory Management',
        description: 'Manage theoretical content and chapters in the system.',
        stats: `
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Total Theories</span>
                    <div class="stat-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                </div>
                <div class="stat-value" id="totalTheories">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>All theories</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Total Chapters</span>
                    <div class="stat-icon">
                        <i class="fas fa-list-ol"></i>
                    </div>
                </div>
                <div class="stat-value" id="totalChapters">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>All chapters</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Courses Covered</span>
                    <div class="stat-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                </div>
                <div class="stat-value" id="coursesCovered">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>With theory content</span>
                </div>
            </div>
        `,
        tableColumns: `
            <th>Course Title</th>
            <th>Course</th>
            <th>Chapters</th>
            <th>Description</th>
            <th>Actions</th>
        `
    },
    {
        file: 'user-progress.html',
        title: 'User Progress Management',
        description: 'Track and manage user progress across courses in the system.',
        stats: `
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Total Progress</span>
                    <div class="stat-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                </div>
                <div class="stat-value" id="totalProgress">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>All progress records</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Completed</span>
                    <div class="stat-icon">
                        <i class="fas fa-check-double"></i>
                    </div>
                </div>
                <div class="stat-value" id="completedProgress">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>Finished chapters</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">In Progress</span>
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                </div>
                <div class="stat-value" id="inProgress">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>Currently studying</span>
                </div>
            </div>
        `,
        tableColumns: `
            <th>User</th>
            <th>Course</th>
            <th>Chapter</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Time Spent</th>
            <th>Actions</th>
        `
    },
    {
        file: 'sessions.html',
        title: 'Sessions Management',
        description: 'Manage user sessions and activity in the system.',
        stats: `
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Total Sessions</span>
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                </div>
                <div class="stat-value" id="totalSessions">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>All sessions</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Active Sessions</span>
                    <div class="stat-icon">
                        <i class="fas fa-play-circle"></i>
                    </div>
                </div>
                <div class="stat-value" id="activeSessions">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>Currently active</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Participants</span>
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
                <div class="stat-value" id="totalParticipants">-</div>
                <div class="stat-change">
                    <i class="fas fa-arrow-up"></i>
                    <span>Total users</span>
                </div>
            </div>
        `,
        tableColumns: `
            <th>Session ID</th>
            <th>Participants</th>
            <th>Created At</th>
            <th>Actions</th>
        `
    }
];

// Fix each page
pages.forEach(page => {
    const filePath = path.join(__dirname, 'public', page.file);
    const content = getManagementPageTemplate(page.title, page.description, page.stats, page.tableColumns);
    
    try {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed ${page.file}`);
    } catch (error) {
        console.error(`❌ Error fixing ${page.file}:`, error.message);
    }
});

console.log('🎉 All management pages have been updated with consistent layout!');
