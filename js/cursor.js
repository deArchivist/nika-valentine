class ParticlePool {
    constructor(size = 100) {
        this.pool = Array(size).fill(null).map(() => this.createParticle());
        this.active = new Set();
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.display = 'none';
        document.body.appendChild(particle);
        return particle;
    }

    acquire() {
        const particle = this.pool.pop();
        if (particle) {
            this.active.add(particle);
            particle.style.display = 'block';
            return particle;
        }
        return this.createParticle();
    }

    release(particle) {
        particle.style.display = 'none';
        this.active.delete(particle);
        if (this.pool.length < 100) {
            this.pool.push(particle);
        }
    }
}

class CursorEffect {
    constructor() {
        this.cursor = this.createCursor();
        this.particlePool = new ParticlePool();
        this.particles = [];
        this.isEnabled = true;
        this.lastX = 0;
        this.lastY = 0;
        this.init();
    }

    createCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'cursor';
        cursor.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
        `;
        document.body.appendChild(cursor);
        return cursor;
    }

    init() {
        let currentX = 0;
        let currentY = 0;
        let lastX = 0;
        let lastY = 0;

        document.addEventListener('mousemove', (e) => {
            if (!this.isEnabled) return;
            currentX = e.clientX;
            currentY = e.clientY;

            // Smooth cursor movement
            gsap.to(this.cursor, {
                x: currentX,
                y: currentY,
                duration: 0.1,
                ease: "power2.out"
            });

            // Create trail
            const now = Date.now();
            if (Math.abs(currentX - this.lastX) + Math.abs(currentY - this.lastY) > 5) {
                this.createTrail(currentX, currentY);
                this.lastX = currentX;
                this.lastY = currentY;
            }
        });

        document.addEventListener('mousedown', () => {
            if (!this.isEnabled) return;
            this.cursor.classList.add('active');
        });

        document.addEventListener('mouseup', () => {
            if (!this.isEnabled) return;
            this.cursor.classList.remove('active');
        });
    }

    createTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;
        document.body.appendChild(trail);

        gsap.to(trail, {
            opacity: 0,
            scale: 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => trail.remove()
        });
    }

    enable() {
        this.isEnabled = true;
        this.cursor.style.display = 'block';
        document.body.style.cursor = 'none';
    }

    disable() {
        this.isEnabled = false;
        this.cursor.style.display = 'none';
        document.body.style.cursor = 'auto';
    }
}

// Create and export cursor effect instance
const cursorEffect = new CursorEffect();
export default cursorEffect;