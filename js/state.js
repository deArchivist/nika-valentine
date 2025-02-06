class StateManager {
    constructor() {
        this.currentState = 'sudoku';
        this.listeners = new Set();
        this.states = ['sudoku', 'transition', 'valentine', 'flower'];
    }

    on(event, callback) {
        this.listeners.add(callback);
    }

    setState(newState) {
        if (!this.states.includes(newState)) return;
        const oldState = this.currentState;
        this.currentState = newState;

        // Handle flower section transition
        if (newState === 'flower') {
            const flowerSection = document.getElementById('flowerSection');
            flowerSection.style.display = 'flex';
            document.body.style.backgroundColor = '#122139';
            
            // Start plant sounds when the iframe becomes visible
            requestAnimationFrame(() => {
                flowerSection.style.opacity = '1';
                document.body.classList.add('flower-active');
                // Force reflow
                flowerSection.offsetHeight;
                flowerSection.classList.add('active');
                
                // Add a slight delay to match the visual transition
                setTimeout(() => {
                    import('./audio.js').then(({default: audioController}) => {
                        audioController.startPlantSounds();
                    });
                }, 300);
            });
        }

        // Keep particle container visible during transitions
        const particleContainer = document.querySelector('.particle-container');
        if (particleContainer) {
            particleContainer.style.transition = 'none';
            particleContainer.style.opacity = '1';
        }

        // Crossfade sections
        const oldSection = document.getElementById(`${oldState}Section`);
        const newSection = document.getElementById(`${newState}Section`);
        
        oldSection.style.transition = 'opacity 1s ease';
        newSection.style.transition = 'opacity 1s ease';
        
        // Show new section before hiding old one
        newSection.style.display = 'flex';
        newSection.offsetHeight; // Force reflow
        
        oldSection.style.opacity = '0';
        newSection.style.opacity = '1';
        
        setTimeout(() => {
            oldSection.style.display = 'none';
            // Notify listeners after transition
            this.listeners.forEach(callback => 
                callback({ from: oldState, to: newState }));
        }, 1000);
    }

    getCurrentState() {
        return this.currentState;
    }
}

const stateManager = new StateManager();
export default stateManager;