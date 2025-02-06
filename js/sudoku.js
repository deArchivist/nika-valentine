class SudokuGame {
    constructor() {
        // Initial grid with given numbers
        this.grid = [
            [5,3,0,0,7,0,0,0,0],
            [6,0,0,1,9,5,0,0,0],
            [0,9,8,0,0,0,0,6,0],
            [8,0,0,0,6,0,0,0,3],
            [4,0,0,8,0,3,0,0,1],
            [7,0,0,0,2,0,0,0,6],
            [0,6,0,0,0,0,2,8,0],
            [0,0,0,4,1,9,0,0,5],
            [0,0,0,0,8,0,0,7,9]
        ];

        // Solution grid
        this.solution = [
            [5,3,4,6,7,8,9,1,2],
            [6,7,2,1,9,5,3,4,8],
            [1,9,8,3,4,2,5,6,7],
            [8,5,9,7,6,1,4,2,3],
            [4,2,6,8,5,3,7,9,1],
            [7,1,3,9,2,4,8,5,6],
            [9,6,1,5,3,7,2,8,4],
            [2,8,7,4,1,9,6,3,5],
            [3,4,5,2,8,6,1,7,9]
        ];

        // 1 means show, 0 means hide
        this.visibleCells = [
            [1,1,0,0,1,0,0,0,0],
            [1,0,0,1,1,1,0,0,0],
            [0,1,1,0,0,0,0,1,0],
            [1,0,0,0,1,0,0,0,1],
            [1,0,0,1,0,1,0,0,1],
            [1,0,0,0,1,0,0,0,1],
            [0,1,0,0,0,0,1,1,0],
            [0,0,0,1,1,1,0,0,1],
            [0,0,0,0,1,0,0,1,1]
        ];

        this.selectedCell = null;
        
        // Initialize immediately if document is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing Sudoku game');
        this.createGrid();
        this.setupEventListeners();
        this.setupLetsGoButton();
        // Create keypad after grid is created
        this.createMobileKeypad();
        document.getElementById('letsGoBtn').disabled = true;
    }

    createGrid() {
        console.log('Creating Sudoku grid');
        const gridElement = document.querySelector('.sudoku-grid');
        if (!gridElement) {
            console.error('Sudoku grid element not found');
            return;
        }
        
        gridElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                // Show only visible cells
                if (this.grid[row][col] !== 0) {
                    cell.textContent = this.grid[row][col];
                    cell.classList.add('prefilled');
                }

                gridElement.appendChild(cell);
            }
        }
    }

    createMobileKeypad() {
        // Remove any existing keypad first
        const existingKeypad = document.querySelector('.mobile-keypad');
        if (existingKeypad) {
            existingKeypad.remove();
        }

        const container = document.querySelector('.sudoku-container');
        const keypad = document.createElement('div');
        keypad.className = 'mobile-keypad';
        
        // Create number buttons 1-9
        for (let i = 1; i <= 9; i++) {
            const button = document.createElement('button');
            button.className = 'keypad-button';
            button.textContent = i;
            button.setAttribute('data-number', i);
            keypad.appendChild(button);
        }

        // Add clear button
        const clearButton = document.createElement('button');
        clearButton.className = 'keypad-button clear-button';
        clearButton.textContent = '⌫';
        keypad.appendChild(clearButton);

        container.appendChild(keypad);

        // Add click handler directly here
        keypad.addEventListener('click', (e) => {
            const button = e.target.closest('.keypad-button');
            if (!button || !this.selectedCell) return;

            if (button.classList.contains('clear-button')) {
                this.handleInput(0);
            } else {
                const num = parseInt(button.getAttribute('data-number'));
                if (!isNaN(num)) {
                    this.handleInput(num);
                }
            }
        });
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        const gridElement = document.querySelector('.sudoku-grid');
        if (!gridElement) {
            console.error('Sudoku grid element not found');
            return;
        }

        // Cell click handler
        gridElement.addEventListener('click', (e) => {
            const cell = e.target.closest('.sudoku-cell');
            if (!cell || cell.classList.contains('prefilled')) return;

            if (this.selectedCell) {
                this.selectedCell.classList.remove('selected');
            }
            
            cell.classList.add('selected');
            this.selectedCell = cell;
        });

        // Number input handler
        document.addEventListener('keydown', (e) => {
            if (!this.selectedCell) return;

            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.handleInput(num);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.handleInput(0);
            }
        });
    }

    setupLetsGoButton() {
        console.log('Setting up Lets Go button');
        const button = document.getElementById('letsGoBtn');
        if (!button) {
            console.error('Lets Go button not found');
            return;
        }

        // Start with button disabled
        button.disabled = true;

        button.addEventListener('click', () => {
            console.log('Lets Go clicked');
            import('./state.js').then(({ default: stateManager }) => {
                stateManager.setCondition('puzzleComplete');
                this.explodeToParticles();
            }).catch(error => {
                console.error('Error importing state manager:', error);
            });
        });
    }

    handleInput(num) {
        if (!this.selectedCell) return;
        
        if (num === 0) {
            this.selectedCell.textContent = '';
        } else {
            this.selectedCell.textContent = num;
        }

        // Add console log to debug
        console.log('Checking puzzle correctness...');
        const isCorrect = this.isPuzzleCorrect();
        console.log('Puzzle correct:', isCorrect);

        if (isCorrect) {
            console.log('Enabling button...');
            this.enableLetsGoButton();
        } else {
            document.getElementById('letsGoBtn').disabled = true;
        }
    }

    isValidMove(row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (x !== col && this.getCellValue(row, x) === num) {
                return false;
            }
        }

        // Check column
        for (let y = 0; y < 9; y++) {
            if (y !== row && this.getCellValue(y, col) === num) {
                return false;
            }
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let y = boxRow; y < boxRow + 3; y++) {
            for (let x = boxCol; x < boxCol + 3; x++) {
                if ((y !== row || x !== col) && this.getCellValue(y, x) === num) {
                    return false;
                }
            }
        }

        return true;
    }

    getCellValue(row, col) {
        const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
        return cell ? parseInt(cell.textContent) || 0 : 0;
    }

    isPuzzleComplete() {
        // Check if all cells are filled correctly
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.getCellValue(row, col);
                // If any cell is empty, puzzle is not complete
                if (value === 0) return false;
                // Store current value
                const currentValue = value;
                // Clear cell temporarily for validation
                const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
                const originalContent = cell.textContent;
                cell.textContent = '';
                // Check if the move would be valid
                const isValid = this.isValidMove(row, col, currentValue);
                // Restore cell content
                cell.textContent = originalContent;
                if (!isValid) return false;
            }
        }
        return true;
    }

    // Uncomment solution checking method
    isPuzzleCorrect() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.getCellValue(row, col);
                // Add debug logging
                console.log(`Checking cell [${row},${col}]: ${value} vs ${this.solution[row][col]}`);
                if (value === 0) return false;
                if (value !== this.solution[row][col]) return false;
            }
        }
        return true;
    }

    enableLetsGoButton() {
        const button = document.getElementById('letsGoBtn');
        if (button) {
            button.disabled = false;
            button.classList.add('active');
            // Add visual feedback
            console.log('Button enabled!');
        }
    }

    explodeToParticles() {
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => {
            const rect = cell.getBoundingClientRect();
            const numParticles = 5;
            
            for (let i = 0; i < numParticles; i++) {
                const particle = document.createElement('div');
                particle.className = 'transition-particle';
                particle.style.left = `${rect.left + rect.width / 2}px`;
                particle.style.top = `${rect.top + rect.height / 2}px`;
                document.body.appendChild(particle);
                
                gsap.to(particle, {
                    x: (Math.random() - 0.5) * window.innerWidth * 2,
                    y: (Math.random() - 0.5) * window.innerHeight * 2,
                    opacity: 0,
                    duration: 2,
                    ease: "power2.out",
                    onComplete: () => particle.remove()
                });
            }
        });
    }
}

// Create and initialize Sudoku game
const game = new SudokuGame();
export default game;