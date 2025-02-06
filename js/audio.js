class AudioController {
    constructor() {
        this.backgroundMusic = new Audio('/assets/audio/background-music.mp3');
        this.buttonSound = new Audio('/assets/effect/button.wav');
        this.hoverSound = new Audio('/assets/effect/hover.wav');
        this.yaySound = new Audio('/assets/effect/yay.wav');  // Add yay sound
        this.twinkleSound = new Audio('/assets/effect/twinkle.mp3');
        this.shimmerSound = new Audio('/assets/effect/nature-shimmer.wav');
        this.plantRustlingSound = new Audio('/assets/effect/plant-rustling.wav');
        
        this.backgroundMusic.loop = true;
        this.isPlaying = false;
        
        // Preload and set volumes
        this.backgroundMusic.volume = 0.65;
        this.buttonSound.volume = 0.3;
        this.hoverSound.volume = 0.25; // Reduced volume
        this.yaySound.volume = 1;  // Adjust volume as needed
        this.shimmerSound.loop = true;
        this.shimmerSound.volume = 0.15; // Adjust volume as needed
        this.twinkleSound.volume = 0.9;
        this.plantRustlingSound.volume = 1;

        this.lastHoverTime = 0;
        this.hoverDelay = 100; // Minimum delay between hover sounds in milliseconds

        // Create a pool of button sounds
        this.buttonSoundPool = Array(5).fill(null).map(() => {
            const sound = new Audio('/assets/effect/button.wav');
            sound.volume = 0.3;
            return sound;
        });
        this.currentButtonSoundIndex = 0;
        this.lastButtonSoundTime = 0;
        this.buttonSoundDelay = 50; // Minimum delay between button sounds in milliseconds

        this.setupEventListeners();
        this.setupSoundEffects();
    }

    setupEventListeners() {
        const toggleButton = document.getElementById('audioToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleAudio());
        }
        // Removed visibility change handler to keep music playing
    }

    setupSoundEffects() {
        // Add hover sound to all buttons and interactive elements
        const interactiveElements = document.querySelectorAll('.lets-go-btn, .yes-btn, .no-btn, .sudoku-cell:not(.prefilled)');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
            
            element.addEventListener('click', () => {
                this.playButtonSound();
            });
        });

        // Add hover sound to sudoku grid cells that aren't prefilled
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('sudoku-cell') && !e.target.classList.contains('prefilled')) {
                this.playHoverSound();
            }
        });

        // Add click sound to all buttons
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('sudoku-cell')) {
                this.playButtonSound();
            }
        });
    }

    playHoverSound() {
        if (!this.isPlaying) return;
        
        const now = Date.now();
        if (now - this.lastHoverTime < this.hoverDelay) {
            return; // Skip if too soon after last hover sound
        }

        const hoverSound = this.hoverSound.cloneNode();
        hoverSound.volume = 0.05; // Quieter hover sound
        
        // Add fade in/out effect
        hoverSound.addEventListener('timeupdate', () => {
            if (hoverSound.currentTime > 0.1) { // Start fading out near the end
                hoverSound.volume = Math.max(0, 0.05 * (1 - hoverSound.currentTime / hoverSound.duration));
            }
        });

        hoverSound.play()
            .then(() => {
                this.lastHoverTime = now;
            })
            .catch(error => console.log("Hover sound playback error:", error));
    }

    playButtonSound() {
        if (!this.isPlaying) return;
        
        const now = Date.now();
        if (now - this.lastButtonSoundTime < this.buttonSoundDelay) {
            return; // Skip if too soon after last button sound
        }

        // Get next sound from pool
        const buttonSound = this.buttonSoundPool[this.currentButtonSoundIndex];
        
        // Reset sound if it's still playing
        if (!buttonSound.ended) {
            buttonSound.currentTime = 0;
        }

        buttonSound.play()
            .then(() => {
                this.lastButtonSoundTime = now;
            })
            .catch(error => console.log("Button sound playback error:", error));

        // Move to next sound in pool
        this.currentButtonSoundIndex = (this.currentButtonSoundIndex + 1) % this.buttonSoundPool.length;
    }

    playYaySound() {
        if (!this.isPlaying) return;
        const yaySound = this.yaySound.cloneNode();
        yaySound.play().catch(error => console.log("Yay sound playback error:", error));
    }

    playTwinkleSound() {
        if (!this.isPlaying) return;
        const twinkle = this.twinkleSound.cloneNode();
        twinkle.play().catch(error => console.log("Twinkle sound playback error:", error));
    }

    startShimmerSound() {
        if (!this.isPlaying) return;
        this.shimmerSound.play().catch(error => console.log("Shimmer sound playback error:", error));
    }

    stopShimmerSound() {
        this.shimmerSound.pause();
        this.shimmerSound.currentTime = 0;
    }

    startPlantSounds() {
        if (!this.isPlaying) return;
        this.plantRustlingSound.play()
            .catch(error => console.log("Plant rustling sound error:", error));
    }

    stopPlantSounds() {
        this.plantRustlingSound.pause();
        this.plantRustlingSound.currentTime = 0;
    }

    play() {
        const playPromise = this.backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio playback error:", error);
            });
        }
        this.isPlaying = true;
        this.updateButtonState(true);
    }

    pause() {
        this.backgroundMusic.pause();
        this.isPlaying = false;
        this.updateButtonState(false);
    }

    toggleAudio() {
        if (this.isPlaying) {
            this.pause();
            this.stopShimmerSound();
            this.stopPlantSounds();
        } else {
            this.play();
            const currentState = document.body.className;
            if (currentState.includes('valentine')) {
                this.startShimmerSound();
            } else if (currentState.includes('flower')) {
                this.startShimmerSound();
                this.startPlantSounds();
            }
        }
    }

    updateButtonState(isPlaying) {
        const button = document.getElementById('audioToggle');
        if (button) {
            button.textContent = isPlaying ? '🔊' : '🔈';
            button.setAttribute('aria-label', isPlaying ? 'Mute Audio' : 'Unmute Audio');
        }
    }
}

const audioController = new AudioController();
export default audioController;