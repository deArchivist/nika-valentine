import stateManager from './state.js';

class ValentineUI {
    constructor() {
        this.typewriterSpeed = 50;
        this.question = "Will you continue to be my valentine indefinitely nika? 💝";
        this.typewriterTimeout = null;
        this.init();
    }

    init() {
        stateManager.on('stateChange', ({ to }) => {
            if (to === 'valentine') {
                console.log('Starting Valentine UI');
                this.startTypewriter();
                this.setupButtons();
            }
        });
    }

    startTypewriter() {
        console.log('Starting typewriter effect');
        const textElement = document.querySelector('.typewriter-text');
        if (!textElement) return;

        textElement.textContent = '';
        let index = 0;

        const type = () => {
            if (index < this.question.length) {
                textElement.textContent += this.question.charAt(index);
                index++;
                this.typewriterTimeout = setTimeout(type, this.typewriterSpeed);
            } else {
                this.showButtons();
            }
        };

        type();
    }

    showButtons() {
        console.log('Showing buttons');
        const buttons = document.querySelector('.button-container');
        if (!buttons) return;

        gsap.to(buttons, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
        });
    }

    setupButtons() {
        const yesButton = document.querySelector('.yes-btn');
        const noButton = document.querySelector('.no-btn');
        
        if (!yesButton || !noButton) return;

        // Reset button states
        gsap.set([yesButton, noButton], {
            scale: 1,
            opacity: 1
        });
        
        // Yes button handler
        yesButton.addEventListener('click', () => {
            console.log('Yes clicked');
            this.handleYesClick();
        });
        
        // No button handler
        noButton.addEventListener('click', () => {
            console.log('No clicked');
            this.handleNoClick();
        });
    }

    handleYesClick() {
        const yesButton = document.querySelector('.yes-btn');
        if (!yesButton) return;

        // Animate yes button
        gsap.timeline()
            .to(yesButton, {
                scale: 1.2,
                duration: 0.3,
                ease: 'back.out'
            })
            .to(yesButton, {
                boxShadow: '0 0 30px rgba(255, 209, 221, 1)',
                duration: 0.3
            });

        // Create heart burst effect
        this.createHeartBurst();

        // Trigger transition to flower section
        setTimeout(() => {
            stateManager.setCondition('yesClicked');
        }, 1000);
    }

    handleNoClick() {
        const noButton = document.querySelector('.no-btn');
        const yesButton = document.querySelector('.yes-btn');
        if (!noButton || !yesButton) return;

        // Shrink no button
        gsap.to(noButton, {
            scale: 0.8,
            duration: 0.3,
            ease: 'power2.in'
        });

        // Grow yes button
        gsap.to(yesButton, {
            scale: 1.2,
            duration: 0.3,
            ease: 'back.out',
            boxShadow: '0 0 30px rgba(255, 209, 221, 0.8)'
        });

        // Add floating hearts around yes button
        this.createFloatingHearts();
    }

    createHeartBurst() {
        const yesButton = document.querySelector('.yes-btn');
        if (!yesButton) return;

        const rect = yesButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 12; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '💝';
            heart.style.position = 'fixed';
            heart.style.fontSize = '24px';
            heart.style.left = `${centerX}px`;
            heart.style.top = `${centerY}px`;
            heart.style.pointerEvents = 'none';
            document.body.appendChild(heart);

            const angle = (i / 12) * Math.PI * 2;
            const radius = 100;
            const destinationX = centerX + Math.cos(angle) * radius;
            const destinationY = centerY + Math.sin(angle) * radius;

            gsap.to(heart, {
                x: destinationX - centerX,
                y: destinationY - centerY,
                opacity: 0,
                duration: 1,
                ease: 'power2.out',
                onComplete: () => heart.remove()
            });
        }
    }

    createFloatingHearts() {
        const yesButton = document.querySelector('.yes-btn');
        if (!yesButton) return;

        const rect = yesButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 5; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '💝';
            heart.style.position = 'fixed';
            heart.style.fontSize = '24px';
            heart.style.left = `${centerX}px`;
            heart.style.top = `${centerY}px`;
            heart.style.pointerEvents = 'none';
            document.body.appendChild(heart);

            gsap.to(heart, {
                y: -100,
                x: (Math.random() - 0.5) * 100,
                opacity: 0,
                duration: 1,
                ease: 'power2.out',
                onComplete: () => heart.remove()
            });
        }
    }

    cleanup() {
        if (this.typewriterTimeout) {
            clearTimeout(this.typewriterTimeout);
        }
        
        const textElement = document.querySelector('.typewriter-text');
        if (textElement) {
            textElement.textContent = '';
        }

        gsap.killTweensOf('.yes-btn');
        gsap.killTweensOf('.no-btn');
        gsap.killTweensOf('.button-container');

        // Remove any floating hearts
        document.querySelectorAll('[style*="position: fixed"]').forEach(el => {
            if (el.innerHTML === '💝') {
                el.remove();
            }
        });
    }
}

// Create and export valentine UI instance
const valentineUI = new ValentineUI();
export default valentineUI;