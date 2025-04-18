<script>
  // Grid dimensions
  let { width, height, grid } = $props();
  width = 12;
  height = 10;

  // Create a 2D array for the grid
  let gridState = $state(grid);

  grid = Array(height)
    .fill()
    .map(() => Array(width).fill(""));

  // Track the currently selected cell
  let selectedCell = $state({ row: 0, col: 0 });

  // Direction of input (across or down)
  let direction = $state("across");

  // Handle cell click
  function handleCellClick(row, col) {
    // Toggle direction if clicking the same cell twice
    if (row === selectedCell.row && col === selectedCell.col) {
      direction = direction === "across" ? "down" : "across";
    } else {
      selectedCell = { row, col };
    }
  }

  // Handle key presses
  function handleKeyDown(e, row, col) {
    const key = e.key.toUpperCase();

    // Handle letter input (A-Z), punctuation, and underscore for spaces
    if (/^[A-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]$/.test(key) || key === "_") {
      grid[row][col] = key;
      moveToNextCell(row, col);
      e.preventDefault();
    }
    // Handle navigation keys
    else if (e.key === "ArrowRight") {
      moveToCell(row, Math.min(col + 1, width - 1));
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      moveToCell(row, Math.max(col - 1, 0));
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      moveToCell(Math.min(row + 1, height - 1), col);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      moveToCell(Math.max(row - 1, 0), col);
      e.preventDefault();
    } else if (e.key === "Tab") {
      if (e.shiftKey) {
        // Move left
        const prevCol = col > 0 ? col - 1 : width - 1;
        const prevRow = col > 0 ? row : row > 0 ? row - 1 : height - 1;
        moveToCell(prevRow, prevCol);
      } else {
        // Move right
        const nextCol = col < width - 1 ? col + 1 : 0;
        const nextRow = col < width - 1 ? row : row < height - 1 ? row + 1 : 0;
        moveToCell(nextRow, nextCol);
      }
      e.preventDefault();
    } else if (e.key === "Enter") {
      direction = direction === "across" ? "down" : "across";
      e.preventDefault();
    } else if (e.key === "Backspace") {
      // Clear the current cell
      grid[row][col] = "";

      // Move to previous cell
      if (direction === "across" && col > 0) {
        moveToCell(row, col - 1);
      } else if (direction === "down" && row > 0) {
        moveToCell(row - 1, col);
      }
      e.preventDefault();
    } else if (e.key === " ") {
      // Convert space to underscore
      grid[row][col] = "_";
      moveToNextCell(row, col);
      e.preventDefault();
    }
  }

  // Move to next cell based on current direction
  function moveToNextCell(row, col) {
    if (direction === "across") {
      if (col < width - 1) {
        moveToCell(row, col + 1);
      }
    } else {
      if (row < height - 1) {
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
  let cellRefs = Array(height)
    .fill()
    .map(() => Array(width).fill(null));

  // Effect to focus the selected cell when it changes
  $effect(() => {
    const { row, col } = selectedCell;
    const input = cellRefs[row][col];
    if (input) {
      input.focus();
    }
  });

  // Clear the grid
  function clearGrid() {
    grid = Array(height)
      .fill()
      .map(() => Array(width).fill(""));
  }

  // Make a function to get the current grid state
  export function getGrid() {
    return grid;
  }
</script>

<div class="flex flex-col items-center justify-center p-4">
  <div class="mb-4 flex items-center justify-between w-full">
    <h2 class="text-xl font-bold">Crossword Grid Editor</h2>
    <div class="flex items-center space-x-2">
      <span class="text-sm"
        >Direction: {direction.charAt(0).toUpperCase() +
          direction.slice(1)}</span
      >
      <button
        class="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded ml-4"
        onclick={clearGrid}
      >
        Clear Grid
      </button>
    </div>
  </div>

  <div class="grid grid-cols-12 gap-0 border border-gray-400">
    {#each Array(height) as _, rowIndex}
      {#each Array(width) as _, colIndex}
        <div
          class="w-10 h-10 border border-gray-300 flex items-center justify-center
                        font-bold text-lg cursor-pointer
                        {selectedCell.row === rowIndex &&
          selectedCell.col === colIndex
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
    <p>
      Use arrow keys to navigate, Tab to move right, Enter to change direction.
    </p>
    <p>Type a letter to fill the cell and move to the next one.</p>
    <p>
      Use <strong>space bar</strong> or type <strong>_</strong> to add a space in
      the word (will appear as "_" in grid).
    </p>
  </div>
</div>
