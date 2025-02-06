class TransitionManager {
    constructor() {
        this.hearts = [];
        this.animationFrameId = null;
        this.lastTime = 0;
        this.transitionSection = document.getElementById('transitionSection');
        
        // Pre-create heart pool
        this.heartPool = new Array(50).fill(null).map(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.style.display = 'none';
            return heart;
        });
        
        // Append hearts to document fragment
        const fragment = document.createDocumentFragment();
        this.heartPool.forEach(heart => fragment.appendChild(heart));
        this.transitionSection.appendChild(fragment);

        this.init();
    }

    init() {
        console.log('Initializing transition manager');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for state changes
        import('./state.js').then(({ default: stateManager }) => {
            stateManager.on('stateChange', ({ to }) => {
                if (to === 'transition') {
                    console.log('Starting transition sequence');
                    this.startTransition();
                }
            });
        });
    }

    async startTransition() {
        try {
            // Reset any existing animations
            this.stopTransition();
            
            // Use requestIdleCallback for non-critical initialization
            requestIdleCallback(() => {
                this.initializeHearts();
            }, { timeout: 1000 });

            // Start animation loop
            this.lastTime = performance.now();
            this.animate();

            // Create timeline for transition sequence
            const timeline = gsap.timeline({
                onComplete: () => {
                    console.log('Transition complete');
                    import('./state.js').then(({ default: stateManager }) => {
                        stateManager.setCondition('animationComplete');
                    });
                }
            });

            // Start with sudoku board explosion
            await this.explodeSudokuBoard();

            // Transform particles to stars
            await this.createStarfield();

            // Show moon and floating hearts
            await this.showMoonAndHearts();

        } catch (error) {
            console.error('Transition error:', error);
        }
    }

    stopTransition() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Reset hearts
        this.hearts.forEach(heart => {
            heart.element.style.display = 'none';
        });
        this.hearts = [];
    }

    initializeHearts() {
        const numHearts = Math.min(50, Math.floor(window.innerWidth / 20));
        
        for (let i = 0; i < numHearts; i++) {
            const heart = {
                element: this.heartPool[i],
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speed: 0.5 + Math.random() * 2,
                oscillationSpeed: 0.02 + Math.random() * 0.03,
                xOffset: 0,
                angle: Math.random() * Math.PI * 2
            };
            
            heart.element.style.display = 'block';
            this.hearts.push(heart);
        }
    }

    animate(currentTime = performance.now()) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Batch DOM updates
        requestAnimationFrame(() => {
            this.hearts.forEach(heart => {
                heart.angle += heart.oscillationSpeed * deltaTime;
                heart.y -= heart.speed * deltaTime / 16;
                heart.xOffset = Math.sin(heart.angle) * 50;

                if (heart.y < -20) {
                    heart.y = window.innerHeight + 20;
                }

                heart.element.style.transform = 
                    `translate3d(${heart.x + heart.xOffset}px, ${heart.y}px, 0) rotate(45deg)`;
            });
        });

        this.animationFrameId = requestAnimationFrame(time => this.animate(time));
    }

    explodeSudokuBoard() {
        return new Promise(resolve => {
            console.log('Exploding sudoku board');
            
            const cells = document.querySelectorAll('.sudoku-cell');
            const container = document.querySelector('.sudoku-container');
            
            if (!container || !cells.length) {
                console.error('Sudoku elements not found');
                resolve();
                return;
            }

            const containerRect = container.getBoundingClientRect();

            // Create explosion particles for each cell
            cells.forEach((cell, index) => {
                const rect = cell.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Create particles
                for (let i = 0; i < 5; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'transition-particle';
                    particle.style.cssText = `
                        position: fixed;
                        width: 4px;
                        height: 4px;
                        background: white;
                        border-radius: 50%;
                        left: ${centerX}px;
                        top: ${centerY}px;
                        pointer-events: none;
                    `;
                    document.body.appendChild(particle);

                    // Animate particle
                    gsap.to(particle, {
                        x: (Math.random() - 0.5) * window.innerWidth * 0.8,
                        y: (Math.random() - 0.5) * window.innerHeight * 0.8,
                        opacity: 0,
                        duration: 1.5,
                        ease: 'power2.out',
                        delay: index * 0.02,
                        onComplete: () => particle.remove()
                    });
                }

                // Fade out original cell
                gsap.to(cell, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.5,
                    delay: index * 0.02,
                    ease: 'power2.in'
                });
            });

            // Fade out container
            gsap.to(container, {
                opacity: 0,
                duration: 0.5,
                delay: cells.length * 0.02,
                ease: 'power2.in'
            });

            // Wait for explosion animation
            setTimeout(resolve, 2000);
        });
    }

    createStarfield() {
        return new Promise(resolve => {
            console.log('Creating starfield');
            
            const nightSky = document.querySelector('.night-sky');
            const stars = document.querySelector('.stars');
            
            if (!nightSky || !stars) {
                console.error('Night sky elements not found');
                resolve();
                return;
            }

            // Fade in night sky
            gsap.to(nightSky, {
                opacity: 1,
                duration: 2,
                ease: 'power2.inOut'
            });

            // Create stars
            const starCount = 100;
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 3 + 1}px;
                    height: ${Math.random() * 3 + 1}px;
                    background: white;
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    opacity: 0;
                `;
                stars.appendChild(star);

                // Animate star
                gsap.to(star, {
                    opacity: Math.random() * 0.8 + 0.2,
                    duration: 2,
                    delay: Math.random() * 2,
                    yoyo: true,
                    repeat: -1,
                    ease: 'power1.inOut'
                });
            }

            setTimeout(resolve, 2000);
        });
    }

    showMoonAndHearts() {
        return new Promise(resolve => {
            console.log('Showing moon and hearts');
            
            const moon = document.querySelector('.moon');
            const heartsContainer = document.querySelector('.floating-hearts');
            
            if (!moon || !heartsContainer) {
                console.error('Moon or hearts container not found');
                resolve();
                return;
            }

            // Rise moon
            gsap.to(moon, {
                opacity: 1,
                y: '100px',
                duration: 2,
                ease: 'power2.out'
            });

            // Add glow effect to moon
            gsap.to(moon, {
                boxShadow: '0 0 50px rgba(255, 255, 255, 0.8)',
                duration: 1,
                delay: 1
            });

            // Create floating hearts
            const createHeart = () => {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.textContent = '💗';
                heart.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    bottom: -50px;
                    font-size: 24px;
                    pointer-events: none;
                `;
                heartsContainer.appendChild(heart);

                gsap.to(heart, {
                    y: -window.innerHeight - 100,
                    x: (Math.random() - 0.5) * 200,
                    rotation: Math.random() * 360,
                    duration: 4 + Math.random() * 4,
                    ease: 'power1.out',
                    onComplete: () => {
                        heart.remove();
                        if (heartsContainer.isConnected) {
                            createHeart();
                        }
                    }
                });
            };

            // Start floating hearts
            for (let i = 0; i < 10; i++) {
                setTimeout(createHeart, i * 300);
            }

            setTimeout(resolve, 3000);
        });
    }
}

// Create and export transition manager instance
const transitionManager = new TransitionManager();
export default transitionManager;