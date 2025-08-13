// Dashboard specific functionality
class DashboardController {
    constructor() {
        this.stats = {
            weather: { temp: 22, condition: 'Sunny' },
            steps: 6543,
            tasks: 5,
            calories: 1245
        };
        
        this.upcomingEvents = [
            { time: '9:00 AM', event: 'Morning Workout' },
            { time: '12:30 PM', event: 'Lunch Meeting' },
            { time: '6:00 PM', event: 'Dinner Prep' }
        ];
        
        this.init();
    }

    init() {
        this.updateStats();
        this.updateUpcomingEvents();
        this.startStatsAnimation();
    }

    updateStats() {
        // Update weather
        const weatherCard = document.querySelector('.weather-icon').closest('.stat-card');
        if (weatherCard) {
            const statInfo = weatherCard.querySelector('.stat-info');
            statInfo.querySelector('h3').textContent = `${this.stats.weather.temp}°C`;
            statInfo.querySelector('p').textContent = `${this.stats.weather.condition} Today`;
        }

        // Update steps
        const fitnessCard = document.querySelector('.fitness-icon').closest('.stat-card');
        if (fitnessCard) {
            const statInfo = fitnessCard.querySelector('.stat-info');
            statInfo.querySelector('h3').textContent = this.stats.steps.toLocaleString();
        }

        // Update tasks
        const reminderCard = document.querySelector('.reminder-icon').closest('.stat-card');
        if (reminderCard) {
            const statInfo = reminderCard.querySelector('.stat-info');
            statInfo.querySelector('h3').textContent = this.stats.tasks.toString();
        }

        // Update calories
        const dietCard = document.querySelector('.diet-icon').closest('.stat-card');
        if (dietCard) {
            const statInfo = dietCard.querySelector('.stat-info');
            statInfo.querySelector('h3').textContent = this.stats.calories.toLocaleString();
        }
    }

    updateUpcomingEvents() {
        const upcomingList = document.querySelector('.upcoming-list');
        if (upcomingList) {
            upcomingList.innerHTML = '';
            
            this.upcomingEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'upcoming-item';
                eventElement.innerHTML = `
                    <span class="time">${event.time}</span>
                    <span class="event">${event.event}</span>
                `;
                upcomingList.appendChild(eventElement);
            });
        }
    }

    startStatsAnimation() {
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.5s ease-out';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            }, index * 100);
        });
    }

    // Method to update stats from external sources
    updateStat(statType, value) {
        switch (statType) {
            case 'weather':
                this.stats.weather = value;
                break;
            case 'steps':
                this.stats.steps = value;
                break;
            case 'tasks':
                this.stats.tasks = value;
                break;
            case 'calories':
                this.stats.calories = value;
                break;
        }
        this.updateStats();
    }

    // Method to add new upcoming event
    addUpcomingEvent(time, event) {
        this.upcomingEvents.push({ time, event });
        this.updateUpcomingEvents();
    }

    // Method to remove upcoming event
    removeUpcomingEvent(index) {
        this.upcomingEvents.splice(index, 1);
        this.updateUpcomingEvents();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardController = new DashboardController();
});
