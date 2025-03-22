<script>
    // Grid dimensions
    const GRID_WIDTH = 12;
    const GRID_HEIGHT = 10;
    
    // Create a 2D array for the grid
    let grid = $state(
        Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(''))
    );
    
    // Track the currently selected cell
    let selectedCell = $state({ row: 0, col: 0 });
    
    // Direction of input (across or down)
    let direction = $state('across');
    
    // Handle cell click
    function handleCellClick(row, col) {
        // Toggle direction if clicking the same cell twice
        if (row === selectedCell.row && col === selectedCell.col) {
            direction = direction === 'across' ? 'down' : 'across';
        } else {
            selectedCell = { row, col };
        }
    }
    
    // Handle key presses
    function handleKeyDown(e, row, col) {
        const key = e.key.toUpperCase();
        
        // Handle letter input (A-Z)
        if (/^[A-Z]$/.test(key)) {
            grid[row][col] = key;
            moveToNextCell(row, col);
            e.preventDefault();
        } 
        // Handle navigation keys
        else if (e.key === 'ArrowRight') {
            moveToCell(row, Math.min(col + 1, GRID_WIDTH - 1));
            e.preventDefault();
        } 
        else if (e.key === 'ArrowLeft') {
            moveToCell(row, Math.max(col - 1, 0));
            e.preventDefault();
        } 
        else if (e.key === 'ArrowDown') {
            moveToCell(Math.min(row + 1, GRID_HEIGHT - 1), col);
            e.preventDefault();
        } 
        else if (e.key === 'ArrowUp') {
            moveToCell(Math.max(row - 1, 0), col);
            e.preventDefault();
        } 
        else if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Move left
                const prevCol = col > 0 ? col - 1 : GRID_WIDTH - 1;
                const prevRow = col > 0 ? row : (row > 0 ? row - 1 : GRID_HEIGHT - 1);
                moveToCell(prevRow, prevCol);
            } else {
                // Move right
                const nextCol = col < GRID_WIDTH - 1 ? col + 1 : 0;
                const nextRow = col < GRID_WIDTH - 1 ? row : (row < GRID_HEIGHT - 1 ? row + 1 : 0);
                moveToCell(nextRow, nextCol);
            }
            e.preventDefault();
        } 
        else if (e.key === 'Enter') {
            direction = direction === 'across' ? 'down' : 'across';
            e.preventDefault();
        }
        else if (e.key === 'Backspace') {
            // Clear the current cell
            grid[row][col] = '';
            
            // Move to previous cell
            if (direction === 'across' && col > 0) {
                moveToCell(row, col - 1);
            } else if (direction === 'down' && row > 0) {
                moveToCell(row - 1, col);
            }
            e.preventDefault();
        }
    }
    
    // Move to next cell based on current direction
    function moveToNextCell(row, col) {
        if (direction === 'across') {
            if (col < GRID_WIDTH - 1) {
                moveToCell(row, col + 1);
            }
        } else {
            if (row < GRID_HEIGHT - 1) {
                moveToCell(row + 1, col);
            }
        }
    }
    
    // Move to a specific cell
    function moveToCell(row, col) {
        selectedCell = { row, col };
        // Focus the cell input (done with bind:this in template)
    }
    
    // Create a 2D array to store references to the cell inputs
    let cellRefs = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));
    
    // Effect to focus the selected cell when it changes
    $effect(() => {
        const { row, col } = selectedCell;
        const input = cellRefs[row][col];
        if (input) {
            input.focus();
        }
    });
</script>

<div class="flex flex-col items-center justify-center p-4">
    <div class="mb-4">
        <h2 class="text-xl font-bold">Crossword Grid Editor</h2>
        <p>Direction: {direction.charAt(0).toUpperCase() + direction.slice(1)}</p>
    </div>
    
    <div class="grid grid-cols-12 gap-0 border border-gray-400">
        {#each Array(GRID_HEIGHT) as _, rowIndex}
            {#each Array(GRID_WIDTH) as _, colIndex}
                <div
                    class="w-10 h-10 border border-gray-300 flex items-center justify-center 
                        font-bold text-lg cursor-pointer
                        {selectedCell.row === rowIndex && selectedCell.col === colIndex 
                            ? 'bg-blue-200' 
                            : 'bg-white'}"
                    onclick={() => handleCellClick(rowIndex, colIndex)}
                >
                    <input
                        bind:this={cellRefs[rowIndex][colIndex]}
                        type="text"
                        value={grid[rowIndex][colIndex]}
                        onkeydown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        class="w-full h-full text-center font-bold text-lg outline-none bg-transparent"
                        maxlength="1"
                        autocomplete="off"
                        aria-label={`Cell ${rowIndex}, ${colIndex}`}
                    />
                </div>
            {/each}
        {/each}
    </div>
    
    <div class="mt-4 text-sm text-gray-600">
        <p>Click a cell to select it. Click again to toggle direction.</p>
        <p>Use arrow keys to navigate, Tab to move right, Enter to change direction.</p>
        <p>Type a letter to fill the cell and move to the next one.</p>
    </div>
</div>