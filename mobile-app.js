// Enhanced LifeSync App with Swipe Carousel
class SwipeLifeSyncApp {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 8;
        this.isAnimating = false;
        this.startX = 0;
        this.startY = 0;
        this.diffX = 0;
        this.diffY = 0;
        this.threshold = 50;
        this.restraint = 100;
        this.allowedTime = 300;
        this.startTime = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDateTime();
        this.updateGreeting();
        this.updateCalendarDate();
        this.hideSwipeHint();
        
        // Update time every minute
        setInterval(() => {
            this.updateDateTime();
            this.updateGreeting();
        }, 60000);
    }

    bindEvents() {
        // Touch/swipe events
        this.bindSwipeEvents();
        
        // Carousel indicators
        this.bindIndicators();
        
        // App circle clicks
        this.bindAppCircles();
        
        // Back buttons
        this.bindBackButtons();
        
        // Mood selector
        this.bindMoodSelector();
    }

    bindSwipeEvents() {
        const carouselTrack = document.getElementById('carousel-track');
        
        // Touch events
        carouselTrack.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });
        
        carouselTrack.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });
        
        carouselTrack.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });

        // Mouse events for desktop testing
        carouselTrack.addEventListener('mousedown', (e) => {
            this.handleMouseStart(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        document.addEventListener('mouseup', (e) => {
            this.handleMouseEnd(e);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
    }

    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.startTime = new Date().getTime();
    }

    handleTouchMove(e) {
        if (!this.startX || !this.startY) return;
        
        this.diffX = e.touches[0].clientX - this.startX;
        this.diffY = e.touches[0].clientY - this.startY;
        
        // Prevent vertical scrolling during horizontal swipe
        if (Math.abs(this.diffX) > Math.abs(this.diffY)) {
            e.preventDefault();
        }
    }

    handleTouchEnd(e) {
        if (!this.startX || !this.startY) return;
        
        const elapsedTime = new Date().getTime() - this.startTime;
        
        if (elapsedTime <= this.allowedTime) {
            if (Math.abs(this.diffX) >= this.threshold && Math.abs(this.diffY) <= this.restraint) {
                if (this.diffX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        }
        
        this.resetSwipe();
    }

    handleMouseStart(e) {
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startTime = new Date().getTime();
        this.isDragging = true;
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        this.diffX = e.clientX - this.startX;
        this.diffY = e.clientY - this.startY;
    }

    handleMouseEnd(e) {
        if (!this.isDragging) return;
        
        const elapsedTime = new Date().getTime() - this.startTime;
        
        if (elapsedTime <= this.allowedTime) {
            if (Math.abs(this.diffX) >= this.threshold && Math.abs(this.diffY) <= this.restraint) {
                if (this.diffX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        }
        
        this.isDragging = false;
        this.resetSwipe();
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowLeft') {
            this.previousSlide();
        } else if (e.key === 'ArrowRight') {
            this.nextSlide();
        }
    }

    resetSwipe() {
        this.startX = 0;
        this.startY = 0;
        this.diffX = 0;
        this.diffY = 0;
    }

    nextSlide() {
        if (this.isAnimating) return;
        
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
        this.hideSwipeHint();
    }

    previousSlide() {
        if (this.isAnimating) return;
        
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
        this.hideSwipeHint();
    }

    goToSlide(slideIndex) {
        if (this.isAnimating || slideIndex === this.currentSlide) return;
        
        this.currentSlide = slideIndex;
        this.updateCarousel();
        this.hideSwipeHint();
    }

    updateCarousel() {
        this.isAnimating = true;
        
        const carouselTrack = document.getElementById('carousel-track');
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        // Update transform
        const translateX = -this.currentSlide * 100;
        carouselTrack.style.transform = `translateX(${translateX}%)`;
        
        // Update active states
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
        
        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
        
        // Add haptic feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    bindIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
    }

    bindAppCircles() {
        const appCircles = document.querySelectorAll('.app-circle');
        
        appCircles.forEach(circle => {
            circle.addEventListener('click', () => {
                const slide = circle.closest('.carousel-slide');
                const appName = slide.getAttribute('data-app');
                this.openApp(appName);
            });
        });
    }

    bindBackButtons() {
        const backButtons = document.querySelectorAll('.back-btn');
        
        backButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.returnToCarousel();
            });
        });
    }

    bindMoodSelector() {
        const moodOptions = document.querySelectorAll('.mood-option');
        
        moodOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active from all
                moodOptions.forEach(opt => opt.classList.remove('active'));
                // Add active to clicked
                option.classList.add('active');
                
                const mood = option.getAttribute('data-mood');
                this.updateMood(mood);
                this.showToast(`Mood updated to ${mood}! 😊`);
            });
        });
    }

    openApp(appName) {
        const carouselContainer = document.getElementById('carousel-container');
        const appViews = document.getElementById('app-views');
        const targetView = document.getElementById(`${appName}-view`);
        
        if (targetView) {
            // Hide carousel
            carouselContainer.style.display = 'none';
            
            // Show app views container
            appViews.style.display = 'block';
            
            // Hide all views
            const allViews = document.querySelectorAll('.app-view');
            allViews.forEach(view => view.classList.remove('active'));
            
            // Show target view
            targetView.classList.add('active');
            
            // Add haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate([10, 50, 10]);
            }
        }
    }

    returnToCarousel() {
        const carouselContainer = document.getElementById('carousel-container');
        const appViews = document.getElementById('app-views');
        
        // Hide app views
        appViews.style.display = 'none';
        
        // Show carousel
        carouselContainer.style.display = 'flex';
        
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    updateGreeting() {
        const greetingTime = document.getElementById('greeting-time');
        if (greetingTime) {
            const hour = new Date().getHours();
            let greeting = '';
            
            if (hour < 12) {
                greeting = 'Good Morning';
            } else if (hour < 17) {
                greeting = 'Good Afternoon';
            } else {
                greeting = 'Good Evening';
            }
            
            greetingTime.textContent = greeting;
        }
    }

    updateDateTime() {
        const headerDate = document.getElementById('header-date');
        if (headerDate) {
            const now = new Date();
            const options = { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            };
            headerDate.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    updateCalendarDate() {
        const calendarDateMini = document.getElementById('calendar-date-mini');
        if (calendarDateMini) {
            const today = new Date().getDate();
            calendarDateMini.textContent = today;
        }
    }

    updateMood(mood) {
        const avatar = document.querySelector('.avatar-emoji');
        const moodEmojis = {
            amazing: '🥳',
            happy: '😊',
            good: '😌',
            okay: '😐',
            sad: '😔'
        };
        
        if (avatar && moodEmojis[mood]) {
            avatar.textContent = moodEmojis[mood];
        }
    }

    hideSwipeHint() {
        const swipeHint = document.getElementById('swipe-hint');
        if (swipeHint) {
            setTimeout(() => {
                swipeHint.style.opacity = '0';
                swipeHint.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    swipeHint.style.display = 'none';
                }, 300);
            }, 3000);
        }
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // Auto-play functionality (optional)
    startAutoPlay(interval = 5000) {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, interval);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.swipeLifeSyncApp = new SwipeLifeSyncApp();
});

// Handle visibility change to pause/resume auto-play
document.addEventListener('visibilitychange', () => {
    if (window.swipeLifeSyncApp) {
        if (document.hidden) {
            window.swipeLifeSyncApp.stopAutoPlay();
        } else {
            // window.swipeLifeSyncApp.startAutoPlay(); // Uncomment to enable auto-play
        }
    }
});

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
