// Import all required modules
import stateManager from './state.js';
import cursorEffect from './cursor.js';
import particleSystem from './particles.js';
import audioController from './audio.js';
import sudoku from './sudoku.js';

class ValentineApp {
    constructor() {
        this.isLoading = true;
        // Set initial background color
        document.body.style.backgroundColor = '#ffd1dd';
        
        // Initialize when document is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        console.log('Initializing Valentine App');
        
        try {
            // Force initial background color
            document.body.style.backgroundColor = '#ffd1dd';
            document.documentElement.style.backgroundColor = '#ffd1dd';
            
            // Initialize components
            await this.initializeComponents();

            // Setup event listeners
            this.setupEventListeners();

            // Start the app
            this.start();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    async initializeComponents() {
        console.log('Initializing components');
        
        try {
            // Enable cursor effect
            cursorEffect.enable();
            document.body.classList.add('no-cursor');

            // Initialize audio (add this line)
            audioController.play();

            // Initialize particle system
            particleSystem.start();

            // Initialize sudoku grid
            sudoku.init();

            // Set up state change handlers
            this.setupStateHandlers();

            return Promise.resolve();
        } catch (error) {
            console.error('Component initialization error:', error);
            return Promise.reject(error);
        }
    }

    setupStateHandlers() {
        stateManager.on('stateChange', ({ from, to }) => {
            console.log(`State changed from ${from} to ${to}`);
            
            // Handle transitions based on state
            switch(to) {
                case 'sudoku':
                    gsap.set(document.body, {
                        backgroundColor: '#ffd1dd'
                    });
                    break;
                case 'transition':
                case 'valentine':
                    gsap.to(document.body, {
                        backgroundColor: '#122139',
                        duration: 0.8,
                        ease: 'power2.inOut'
                    });
                    
                    // Ensure night sky is visible and properly colored
                    const nightSky = document.querySelector('.night-sky');
                    if (nightSky) {
                        gsap.to(nightSky, {
                            opacity: 1,
                            duration: 0.8,
                            ease: 'power2.inOut'
                        });
                    }
                    break;
                case 'flower':
                    gsap.to(document.body, {
                        backgroundColor: '#122139',
                        duration: 0.8,
                        ease: 'power2.inOut'
                    });
                    break;
            }

            // Update body classes after background transition
            document.body.classList.remove('sudoku-active', 'transition-active', 'valentine-active', 'flower-active');
            document.body.classList.add(`${to}-active`);
        });
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            if (stateManager.getCurrentState() === 'transition') {
                particleSystem.clear();
                particleSystem.createStarField();
            }
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            const currentState = stateManager.getCurrentState();
            if (document.hidden) {
                // Pause animations or heavy operations
                particleSystem.stop();
            } else {
                // Resume animations
                if (currentState === 'transition') {
                    particleSystem.start();
                }
            }
        });

        // Handle errors
        window.addEventListener('error', (event) => {
            console.error('Runtime error:', event.error);
            this.showError('An error occurred. Please refresh the page.');
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showError('An error occurred. Please refresh the page.');
        });

        // Add button click handlers
        const letsGoBtn = document.getElementById('letsGoBtn');
        letsGoBtn.addEventListener('click', async () => {
            // Play twinkle sound when transitioning
            audioController.playTwinkleSound();

            const sudokuGrid = document.querySelector('.sudoku-grid');
            const sudokuContainer = document.querySelector('.sudoku-container');
            const cells = document.querySelectorAll('.sudoku-cell');
            
            // Smoother fade out for container
            gsap.to([sudokuGrid, sudokuContainer], {
                opacity: 0,
                duration: 0.4,
                ease: "power2.inOut"
            });
            
            // Transform cells into stars with better timing
            cells.forEach((cell, index) => {
                const rect = cell.getBoundingClientRect();
                const star = document.createElement('div');
                star.className = 'grid-star';
                star.style.left = `${rect.left}px`;
                star.style.top = `${rect.top}px`;
                document.body.appendChild(star);
                
                // Smoother stagger animation
                gsap.to(star, {
                    x: Math.random() * window.innerWidth - rect.left,
                    y: Math.random() * window.innerHeight - rect.top,
                    scale: 1,
                    duration: 1.2,
                    delay: index * 0.015,
                    ease: "power2.out"
                });
            });

            // Seamless state transitions
            setTimeout(() => {
                stateManager.setState('transition');
                gsap.to('.night-sky', {
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.inOut"
                });
                
                // Smoother transition to valentine section
                setTimeout(() => {
                    stateManager.setState('valentine');
                    audioController.startShimmerSound();
                    startValentineSequence();
                }, 1800); // Slightly adjusted for better flow
            }, 700); // Start transition sooner

            // After stars disperse, create twinkling background
            setTimeout(() => {
                this.createTwinklingStars();
            }, 1000);
        });

        // Valentine sequence
        function startValentineSequence() {
            const textElement = document.querySelector('.typewriter-text');
            const buttonContainer = document.querySelector('.button-container');
            
            textElement.textContent = "Nika, will you continue to be my valentine indefinitely?";
            
            setTimeout(() => {
                buttonContainer.style.opacity = '1';
                buttonContainer.style.transform = 'translateY(0)';
            }, 500);

            document.querySelector('.yes-btn').addEventListener('click', () => {
                // Play yay sound when yes is clicked
                audioController.playYaySound();
                
                const valentineContainer = document.querySelector('.valentine-container');
                const stars = document.querySelectorAll('.twinkling-star');
                
                // Create master timeline
                const masterTl = gsap.timeline({
                    onComplete: () => {
                        setTimeout(() => {
                            // Clean transition to flower section
                            stateManager.setState('flower');
                            document.querySelector('#flowerSection').style.display = 'flex';
                            audioController.startPlantSounds(); // Add plant sounds here
                            gsap.to('#flowerSection', {
                                opacity: 1,
                                duration: 0.5
                            });
                        }, 500);
                    }
                });

                // Execute animation sequence
                masterTl
                    // Fade out valentine content
                    .to(valentineContainer, {
                        opacity: 0,
                        y: -20,
                        duration: 0.3,
                        ease: 'power2.inOut'
                    })
                    // Move stars up quickly
                    .to(stars, {
                        y: '-100vh',
                        duration: 0.6,
                        stagger: {
                            amount: 0.2,
                            from: 'random'
                        },
                        ease: 'power2.in'
                    }, '-=0.2');
            });

            document.querySelector('.no-btn').addEventListener('click', function() {
                const yesBtn = document.querySelector('.yes-btn');
                yesBtn.style.transform = `scale(${1.1})`;
                
                // Reset the no button's transform after the animation
                this.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            });
        }
    }

    createTwinklingStars() {
        // Remove any existing stars container
        const existingContainer = document.querySelector('.stars-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        starsContainer.style.opacity = '0';
        
        // Insert into body for persistent visibility
        document.body.appendChild(starsContainer);

        // Optimize by reducing number of stars
        const starCounts = {
            small: 150,  // Reduced from 200
            medium: 75,  // Reduced from 100
            large: 35    // Reduced from 50
        };

        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        Object.entries(starCounts).forEach(([size, count]) => {
            for (let i = 0; i < count; i++) {
                const star = document.createElement('div');
                star.className = `twinkling-star twinkling-star--${size}`;
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 100}%`;
                
                // Initial opacity and animation
                gsap.fromTo(star, 
                    { opacity: 0 },
                    { 
                        opacity: 1,
                        duration: 1 + Math.random(),
                        delay: Math.random() * 1.5,
                        ease: "power2.inOut"
                    }
                );
                
                star.style.animation = `twinkle ${2 + Math.random() * 2}s infinite ${Math.random() * 1.5}s`;
                fragment.appendChild(star);
            }
        });

        starsContainer.appendChild(fragment);

        // More efficient opacity animation
        gsap.to(starsContainer, {
            opacity: 1,
            duration: 0.8,
            ease: "power2.inOut"
        });
    }

    showError(message) {
        const error = document.createElement('div');
        error.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.1);
            color: #ff0000;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 9999;
            font-family: 'Mali', cursive;
        `;
        error.textContent = message;
        document.body.appendChild(error);
    }

    start() {
        console.log('Starting application');
        this.isLoading = false;
        // State manager will handle showing the initial sudoku section
    }
}

// Create app instance
const app = new ValentineApp();
export default app;