// Mobile LifeSync App Controller
class MobileLifeSyncApp {
    constructor() {
        this.currentView = 'home';
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDateTime();
        this.updateUpcomingEvent();
        
        // Update date/time every minute
        setInterval(() => this.updateDateTime(), 60000);
    }

    bindEvents() {
        // Bottom navigation
        this.bindBottomNavigation();
        
        // App tiles
        this.bindAppTiles();
        
        // Add buttons
        this.bindAddButtons();
        
        // Reminder toggles
        this.bindReminderToggles();
    }

    bindBottomNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetView = item.getAttribute('data-view');
                this.switchView(targetView);
                this.setActiveNavItem(item);
            });
        });
    }

    bindAppTiles() {
        const appTiles = document.querySelectorAll('.app-tile');
        
        appTiles.forEach(tile => {
            tile.addEventListener('click', () => {
                const appName = tile.getAttribute('data-app');
                this.openApp(appName);
            });
        });
    }

    bindAddButtons() {
        const addReminderBtn = document.getElementById('add-reminder');
        const addEntryBtn = document.getElementById('add-entry');
        
        if (addReminderBtn) {
            addReminderBtn.addEventListener('click', () => {
                this.addReminder();
            });
        }
        
        if (addEntryBtn) {
            addEntryBtn.addEventListener('click', () => {
                this.addJournalEntry();
            });
        }
    }

    bindReminderToggles() {
        const reminderStatuses = document.querySelectorAll('.reminder-status');
        
        reminderStatuses.forEach(status => {
            status.addEventListener('click', () => {
                this.toggleReminder(status);
            });
        });
    }

    switchView(viewName) {
        // Hide all views
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));
        
        // Show target view
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

    openApp(appName) {
        // Map app tiles to views
        const appViewMap = {
            'weather': 'weather',
            'reminders': 'reminders',
            'fitness': 'fitness',
            'journal': 'journal'
        };
        
        const targetView = appViewMap[appName];
        if (targetView) {
            this.switchView(targetView);
            
            // Update bottom nav
            const navItem = document.querySelector(`[data-view="${targetView}"]`);
            if (navItem) {
                this.setActiveNavItem(navItem);
            }
        }
    }

    updateDateTime() {
        const todayDate = document.getElementById('today-date');
        if (todayDate) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
            };
            todayDate.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    updateUpcomingEvent() {
        const upcomingEvent = document.getElementById('upcoming-event');
        if (upcomingEvent) {
            const now = new Date();
            const hour = now.getHours();
            
            let nextEvent = '';
            if (hour < 7) {
                nextEvent = 'Morning Workout at 7:00 AM';
            } else if (hour < 12) {
                nextEvent = 'Lunch Break at 12:30 PM';
            } else if (hour < 18) {
                nextEvent = 'Evening Walk at 6:00 PM';
            } else {
                nextEvent = 'Dinner Time at 7:00 PM';
            }
            
            upcomingEvent.textContent = nextEvent;
        }
    }

    addReminder() {
        const reminderText = prompt('What would you like to be reminded about?');
        if (reminderText) {
            const time = prompt('What time? (e.g., 2:00 PM)');
            if (time) {
                this.createReminderItem(reminderText, time);
                this.showToast('Reminder added successfully!');
            }
        }
    }

    createReminderItem(text, time) {
        const remindersList = document.querySelector('.reminders-list');
        const reminderItem = document.createElement('div');
        reminderItem.className = 'reminder-item';
        reminderItem.innerHTML = `
            <div class="reminder-content">
                <h4>${text}</h4>
                <p>${time}</p>
            </div>
            <div class="reminder-status">○</div>
        `;
        
        // Add event listener to the new reminder
        const status = reminderItem.querySelector('.reminder-status');
        status.addEventListener('click', () => {
            this.toggleReminder(status);
        });
        
        remindersList.appendChild(reminderItem);
    }

    toggleReminder(statusElement) {
        if (statusElement.textContent === '○') {
            statusElement.textContent = '●';
            statusElement.style.color = '#22c55e';
        } else {
            statusElement.textContent = '○';
            statusElement.style.color = '#000000';
        }
    }

    addJournalEntry() {
        const entryText = prompt('What\'s on your mind today?');
        if (entryText) {
            this.createJournalEntry(entryText);
            this.showToast('Journal entry added!');
        }
    }

    createJournalEntry(text) {
        const journalEntries = document.querySelector('.journal-entries');
        const entryItem = document.createElement('div');
        entryItem.className = 'journal-entry';
        entryItem.innerHTML = `
            <div class="entry-date">Today</div>
            <div class="entry-content">
                <p>${text}</p>
            </div>
        `;
        
        journalEntries.insertBefore(entryItem, journalEntries.firstChild);
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #000000;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }
}

// Initialize the mobile app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mobileLifeSyncApp = new MobileLifeSyncApp();
});

// Handle device orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});
