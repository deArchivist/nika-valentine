import stateManager from './state.js';

class FlowerSystem {
    constructor() {
        this.init();
    }

    init() {
        stateManager.on('stateChange', ({ to }) => {
            if (to === 'flower') {
                // Use the exact initialization from flower.md
                const c = setTimeout(() => {
                    document.body.classList.remove("not-loaded");
                    clearTimeout(c);
                }, 1000);
            }
        });
    }
}

const flowerSystem = new FlowerSystem();
export default flowerSystem;
