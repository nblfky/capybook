// LifeSync App - Main Application Controller
class LifeSyncApp {
    constructor() {
        this.currentView = 'dashboard';
        this.sidebarOpen = true;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDateTime();
        this.setActiveView('dashboard');
        
        // Update date/time every minute
        setInterval(() => this.updateDateTime(), 60000);
    }

    bindEvents() {
        // Navigation events
        this.bindNavigationEvents();
        
        // Sidebar toggle events
        this.bindSidebarEvents();
        
        // Search events
        this.bindSearchEvents();
        
        // Quick action events
        this.bindQuickActionEvents();
    }

    bindNavigationEvents() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const appName = item.getAttribute('data-app');
                this.setActiveView(appName);
                this.setActiveNavItem(item);
                this.updatePageTitle(appName);
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 768) {
                    this.closeSidebar();
                }
            });
        });
    }

    bindSidebarEvents() {
        const menuBtn = document.getElementById('menuBtn');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && this.sidebarOpen && sidebar) {
                if (!sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
                    this.closeSidebar();
                }
            }
        });
    }

    bindSearchEvents() {
        const searchInput = document.querySelector('.search-input');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
    }

    bindQuickActionEvents() {
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = this.getActionFromButton(btn);
                this.handleQuickAction(action);
            });
        });
    }

    setActiveView(viewName) {
        // Hide all views
        const views = document.querySelectorAll('.app-view');
        views.forEach(view => view.classList.remove('active'));
        
        // Show selected view
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
        }
    }

    setActiveNavItem(activeItem) {
        // Remove active class from all nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to selected item
        activeItem.classList.add('active');
    }

    updatePageTitle(viewName) {
        const pageTitle = document.getElementById('pageTitle');
        const titles = {
            dashboard: 'Dashboard',
            weather: 'Weather Updates',
            entertainment: 'Entertainment',
            reminders: 'Reminders',
            diet: 'Diet Tracker',
            fitness: 'Fitness',
            journal: 'Journal',
            calendar: 'Calendar'
        };
        
        if (pageTitle && titles[viewName]) {
            pageTitle.textContent = titles[viewName];
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (sidebar) {
            if (window.innerWidth <= 768) {
                // Mobile: Toggle sidebar visibility
                sidebar.classList.toggle('active');
                this.sidebarOpen = sidebar.classList.contains('active');
            } else {
                // Desktop: Toggle sidebar collapsed state
                this.sidebarOpen = !this.sidebarOpen;
                if (this.sidebarOpen) {
                    sidebar.style.transform = 'translateX(0)';
                    if (mainContent) mainContent.style.marginLeft = '280px';
                } else {
                    sidebar.style.transform = 'translateX(-280px)';
                    if (mainContent) mainContent.style.marginLeft = '0';
                }
            }
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            this.sidebarOpen = false;
        }
    }

    updateDateTime() {
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            currentDateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    handleSearch(query) {
        // Implement search functionality
        console.log('Searching for:', query);
        // TODO: Add search logic for different app sections
    }

    performSearch(query) {
        if (query.trim()) {
            console.log('Performing search for:', query);
            // TODO: Implement full search functionality
        }
    }

    getActionFromButton(button) {
        const text = button.textContent.trim();
        const actionMap = {
            'Add Reminder': 'add-reminder',
            'Log Meal': 'log-meal',
            'Write Journal': 'write-journal'
        };
        return actionMap[text] || 'unknown';
    }

    handleQuickAction(action) {
        switch (action) {
            case 'add-reminder':
                this.setActiveView('reminders');
                this.setActiveNavItem(document.querySelector('[data-app="reminders"]'));
                this.updatePageTitle('reminders');
                console.log('Navigating to reminders to add new reminder');
                break;
            case 'log-meal':
                this.setActiveView('diet');
                this.setActiveNavItem(document.querySelector('[data-app="diet"]'));
                this.updatePageTitle('diet');
                console.log('Navigating to diet tracker to log meal');
                break;
            case 'write-journal':
                this.setActiveView('journal');
                this.setActiveNavItem(document.querySelector('[data-app="journal"]'));
                this.updatePageTitle('journal');
                console.log('Navigating to journal to write entry');
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    // Utility methods
    showNotification(message, type = 'info') {
        // TODO: Implement notification system
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    updateTheme(theme) {
        // TODO: Implement theme switching
        document.documentElement.setAttribute('data-theme', theme);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lifeSyncApp = new LifeSyncApp();
});

// Handle window resize events
window.addEventListener('resize', () => {
    if (window.lifeSyncApp && window.innerWidth > 768) {
        // Reset sidebar on desktop
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        if (sidebar && mainContent) {
            sidebar.classList.remove('active');
            sidebar.style.transform = 'translateX(0)';
            mainContent.style.marginLeft = '280px';
            window.lifeSyncApp.sidebarOpen = true;
        }
    }
});
