<script>
  // Grid dimensions from props, with defaults
  let {
    width: propWidth = 12,
    height: propHeight = 10,
    grid: initialGridProp,
  } = $props();

  // Use constants for dimensions within this component instance
  const componentWidth = propWidth;
  const componentHeight = propHeight;

  // Create a reactive 2D array for the internal grid state.
  // Initialize from initialGridProp if valid, otherwise create a new empty grid.
  // Deep copy initialGridProp to ensure mutability and avoid direct prop modification.
  let internalGrid = $state(
    initialGridProp &&
      initialGridProp.length === componentHeight &&
      initialGridProp[0] &&
      initialGridProp[0].length === componentWidth
      ? initialGridProp.map((row) => [...row])
      : Array(componentHeight)
          .fill(null)
          .map(() => Array(componentWidth).fill(""))
  );

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

  // Handle key presses - all modifications are to internalGrid
  function handleKeyDown(e, row, col) {
    const key = e.key.toUpperCase();

    // Handle letter input (A-Z), punctuation, and underscore for spaces
    if (/^[A-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]$/.test(key) || key === "_") {
      internalGrid[row][col] = key === "_" ? "_" : key; // Modify internalGrid
      moveToNextCell(row, col);
      e.preventDefault();
    }
    // Handle navigation keys
    else if (e.key === "ArrowRight") {
      moveToCell(row, Math.min(col + 1, componentWidth - 1));
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      moveToCell(row, Math.max(col - 1, 0));
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      moveToCell(Math.min(row + 1, componentHeight - 1), col);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      moveToCell(Math.max(row - 1, 0), col);
      e.preventDefault();
    } else if (e.key === "Tab") {
      if (e.shiftKey) {
        // Move left
        const prevCol = col > 0 ? col - 1 : componentWidth - 1;
        const prevRow = col > 0 ? row : row > 0 ? row - 1 : componentHeight - 1;
        moveToCell(prevRow, prevCol);
      } else {
        // Move right
        const nextCol = col < componentWidth - 1 ? col + 1 : 0;
        const nextRow =
          col < componentWidth - 1
            ? row
            : row < componentHeight - 1
              ? row + 1
              : 0;
        moveToCell(nextRow, nextCol);
      }
      e.preventDefault();
    } else if (e.key === "Enter") {
      direction = direction === "across" ? "down" : "across";
      e.preventDefault();
    } else if (e.key === "Backspace") {
      // Clear the current cell
      internalGrid[row][col] = ""; // Modify internalGrid

      // Move to previous cell
      if (direction === "across" && col > 0) {
        moveToCell(row, col - 1);
      } else if (direction === "down" && row > 0) {
        moveToCell(row - 1, col);
      }
      e.preventDefault();
    } else if (e.key === " ") {
      // Convert space to underscore
      internalGrid[row][col] = "_"; // Modify internalGrid
      moveToNextCell(row, col);
      e.preventDefault();
    }
  }

  // Move to next cell based on current direction
  function moveToNextCell(row, col) {
    if (direction === "across") {
      if (col < componentWidth - 1) {
        moveToCell(row, col + 1);
      }
    } else {
      if (row < componentHeight - 1) {
        moveToCell(row + 1, col);
      }
    }
  }

  // Move to a specific cell
  function moveToCell(row, col) {
    selectedCell = { row, col };
    // Focus the cell input (done with bind:this in template)
  }

  // Create a 2D array to store references to the cell inputs, sized dynamically
  let cellRefs = Array(componentHeight)
    .fill(null)
    .map(() => Array(componentWidth).fill(null));

  // Effect to focus the selected cell when it changes
  $effect(() => {
    const { row, col } = selectedCell;
    // Ensure row and col are within bounds for cellRefs
    if (row >= 0 && row < componentHeight && col >= 0 && col < componentWidth) {
      const input = cellRefs[row]?.[col]; // Safely access using optional chaining
      if (input) {
        input.focus();
      }
    }
  });

  // Clear the internal grid
  function clearGrid() {
    internalGrid = Array(componentHeight)
      .fill(null)
      .map(() => Array(componentWidth).fill(""));
    selectedCell = { row: 0, col: 0 }; // Reset selection
    direction = "across"; // Reset direction
  }

  // Make a function to get the current internal grid state
  export function getGrid() {
    return internalGrid;
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

  <div
    class="grid gap-0 border border-gray-400"
    style={`grid-template-columns: repeat(${componentWidth}, minmax(0, 1fr));`}
  >
    {#each Array(componentHeight) as _, rowIndex}
      {#each Array(componentWidth) as _, colIndex}
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
            value={internalGrid[rowIndex][colIndex]}
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
