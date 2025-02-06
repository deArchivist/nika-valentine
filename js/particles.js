class Particle {
    constructor(x, y, type = 'star') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.maxLife = Math.random() * 100 + 100;
        this.size = Math.random() * 3 + 2;
        this.element = this.createElement();
    }

    createElement() {
        const element = document.createElement('div');
        element.className = `transition-particle ${this.type}`;
        element.style.position = 'absolute';
        element.style.left = `${this.x}px`;
        element.style.top = `${this.y}px`;
        element.style.width = `${this.size}px`;
        element.style.height = `${this.size}px`;
        return element;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        // Apply gravity for floating hearts
        if (this.type === 'heart') {
            this.vy -= 0.1;
        }

        const progress = this.life / this.maxLife;
        const opacity = 1 - progress;

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.opacity = opacity;

        return this.life < this.maxLife;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = document.createElement('div');
        this.container.className = 'particle-container';
        document.body.appendChild(this.container);
        this.isAnimating = false;
    }

    createExplosion(x, y, count, type = 'star') {
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y, type);
            this.container.appendChild(particle.element);
            this.particles.push(particle);
        }
    }

    createStarField() {
        const fragment = document.createDocumentFragment();
        const width = window.innerWidth;
        const height = window.innerHeight;
        const starCount = Math.floor((width * height) / 12000); // Reduced star count

        // Create stars in batches for better performance
        const createStarBatch = (startIndex, batchSize) => {
            for (let i = startIndex; i < Math.min(startIndex + batchSize, starCount); i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = `${Math.random() * width}px`;
                star.style.top = `${Math.random() * height}px`;
                star.style.willChange = 'transform, opacity';
                star.style.animationDelay = `${Math.random() * 2}s`;
                fragment.appendChild(star);
            }
            
            if (startIndex + batchSize < starCount) {
                requestAnimationFrame(() => createStarBatch(startIndex + batchSize, batchSize));
            } else {
                this.container.appendChild(fragment);
            }
        };

        // Start creating stars in batches of 50
        createStarBatch(0, 50);
    }

    createShootingStars() {
        const createStar = () => {
            const star = document.createElement('div');
            star.className = 'shooting-star';
            
            // Random position at top of screen
            star.style.left = `${Math.random() * window.innerWidth}px`;
            star.style.top = '0';

            this.container.appendChild(star);

            gsap.to(star, {
                x: 500,
                y: 500,
                opacity: [0, 1, 0],
                duration: 1,
                ease: "power1.out",
                onComplete: () => {
                    star.remove();
                    // Create new star after delay
                    setTimeout(createStar, Math.random() * 3000);
                }
            });
        };

        // Create initial shooting stars
        for (let i = 0; i < 3; i++) {
            setTimeout(createStar, i * 2000);
        }
    }

    createFloatingHearts() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        const createHeart = () => {
            const x = Math.random() * width;
            const y = height + 50;
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.textContent = '💗';
            heart.style.left = `${x}px`;
            heart.style.top = `${y}px`;
            this.container.appendChild(heart);

            const speed = Math.random() * 2 + 1;
            const drift = Math.random() * 2 - 1;

            const animate = () => {
                const currentY = parseFloat(heart.style.top);
                const currentX = parseFloat(heart.style.left);
                
                if (currentY < -50) {
                    this.container.removeChild(heart);
                    createHeart();
                } else {
                    heart.style.top = `${currentY - speed}px`;
                    heart.style.left = `${currentX + drift}px`;
                    requestAnimationFrame(animate);
                }
            };

            animate();
        };

        // Create initial hearts
        for (let i = 0; i < 10; i++) {
            setTimeout(() => createHeart(), i * 300);
        }
    }

    explodeSudokuBoard() {
        const sudokuCells = document.querySelectorAll('.sudoku-cell');
        const particles = [];
        
        sudokuCells.forEach(cell => {
            const rect = cell.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Create a particle for each cell
            const particle = document.createElement('div');
            particle.className = 'grid-particle';
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            this.container.appendChild(particle);
            
            // Store particle data
            particles.push({
                element: particle,
                initialX: centerX,
                initialY: centerY,
                targetX: Math.random() * window.innerWidth,
                targetY: Math.random() * window.innerHeight
            });
        });

        // Animate particles spreading out
        particles.forEach(particle => {
            gsap.to(particle.element, {
                x: particle.targetX - particle.initialX,
                y: particle.targetY - particle.initialY,
                duration: 2,
                ease: "power2.out",
                onComplete: () => {
                    // Start twinkling animation
                    gsap.to(particle.element, {
                        opacity: 0.2,
                        duration: 1,
                        repeat: -1,
                        yoyo: true,
                        ease: "none"
                    });
                }
            });
        });

        return particles; // Return particles for future reference
    }

    explodeValentineContainer() {
        const container = document.querySelector('.valentine-container');
        const rect = container.getBoundingClientRect();
        const particles = [];
        const particleCount = 100; // Number of particles to create
        
        // Create particles based on container size
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'grid-particle';
            
            // Random position within container bounds
            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * rect.height;
            
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            this.container.appendChild(particle);
            
            particles.push({
                element: particle,
                initialX: x,
                initialY: y,
                targetX: Math.random() * window.innerWidth,
                targetY: Math.random() * window.innerHeight
            });
        }

        // Animate particles
        particles.forEach(particle => {
            gsap.to(particle.element, {
                x: particle.targetX - particle.initialX,
                y: particle.targetY - particle.initialY,
                duration: 2,
                ease: "power2.out",
                onComplete: () => {
                    // Transform into twinkling star
                    gsap.to(particle.element, {
                        opacity: [0.2, 1, 0.2],
                        scale: [0.8, 1.2, 0.8],
                        duration: 2,
                        repeat: -1,
                        ease: "none"
                    });
                }
            });
        });

        return particles;
    }

    animate() {
        if (!this.isAnimating) return;

        this.particles = this.particles.filter(particle => {
            const isAlive = particle.update();
            if (!isAlive) {
                this.container.removeChild(particle.element);
            }
            return isAlive;
        });

        requestAnimationFrame(() => this.animate());
    }

    start() {
        this.isAnimating = true;
        this.animate();
    }

    stop() {
        this.isAnimating = false;
        this.particles.forEach(particle => {
            this.container.removeChild(particle.element);
        });
        this.particles = [];
    }

    clear() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.particles = [];
    }
}

// Create and export particle system instance
const particleSystem = new ParticleSystem();
export default particleSystem;