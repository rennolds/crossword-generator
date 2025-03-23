<script>
    import CrosswordGrid from '$lib/components/CrosswordGrid.svelte';
    
    // Initialize with default values
    let grid;
    let width = $state(12);
    let height = $state(10);
    let jsonOutput = $state('');
    let words = $state([]);
    let gridComponent;
    
    // Function to identify words in the grid
    function identifyWords() {
        if (!grid) {
            // If grid is not available, get it from the component
            grid = gridComponent.getGrid();
            console.log("Getting grid from component method:", grid);
        }
        
        if (!grid || !grid.length) {
            console.error("Grid is still not available");
            return [];
        }
        
        const foundWords = [];
        const visited = Array(height).fill().map(() => Array(width).fill(false));
        
        // Helper function to check if a cell is valid for word detection
        function isValidCell(row, col) {
            return row >= 0 && row < height && col >= 0 && col < width && grid[row][col] !== '';
        }
        
        // Scan for across words
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                // Skip if the cell is empty or has been visited for across words
                if (grid[row][col] === '' || visited[row][col]) continue;
                
                // Check if this is the start of an across word
                // (either at the left edge or has an empty cell to its left)
                const isStartOfAcrossWord = col === 0 || grid[row][col - 1] === '';
                
                if (isStartOfAcrossWord) {
                    let wordLength = 0;
                    let word = '';
                    let currentCol = col;
                    
                    // Scan right until we hit the end of the word
                    while (isValidCell(row, currentCol)) {
                        word += grid[row][currentCol];
                        visited[row][currentCol] = true;
                        wordLength++;
                        currentCol++;
                    }
                    
                    // Only consider words of length >= 2
                    if (wordLength >= 2) {
                        foundWords.push({
                            word,
                            startX: col,
                            startY: row,
                            direction: 'across',
                            color: getRandomColor(),
                            textClue: `Clue for ${word}`
                        });
                    }
                }
            }
        }
        
        // Reset visited array for down words
        visited.forEach(row => row.fill(false));
        
        // Scan for down words
        for (let col = 0; col < width; col++) {
            for (let row = 0; row < height; row++) {
                // Skip if the cell is empty or has been visited for down words
                if (grid[row][col] === '' || visited[row][col]) continue;
                
                // Check if this is the start of a down word
                // (either at the top edge or has an empty cell above it)
                const isStartOfDownWord = row === 0 || grid[row - 1][col] === '';
                
                if (isStartOfDownWord) {
                    let wordLength = 0;
                    let word = '';
                    let currentRow = row;
                    
                    // Scan down until we hit the end of the word
                    while (isValidCell(currentRow, col)) {
                        word += grid[currentRow][col];
                        visited[currentRow][col] = true;
                        wordLength++;
                        currentRow++;
                    }
                    
                    // Only consider words of length >= 2
                    if (wordLength >= 2) {
                        foundWords.push({
                            word,
                            startX: col,
                            startY: row,
                            direction: 'down',
                            color: getRandomColor(),
                            textClue: `Clue for ${word}`
                        });
                    }
                }
            }
        }
        
        return foundWords;
    }
    
    // Function to generate a random color
    function getRandomColor() {
        const colors = [
            "#FFCEFD", "#568EFF", "#28D66A", "#FFB34B", 
            "#FE9C9C", "#FCEB00", "#FF5B5E", "#00FFFF"
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Function to generate JSON output
    function generateJSON() {
        console.log("Generate button clicked");
        console.log("Grid before identifying words:", grid);
        
        // Make sure we get the latest grid data from the component
        if (gridComponent) {
            grid = gridComponent.grid;
            console.log("Updated grid from component:", grid);
        }
        
        words = identifyWords();
        
        // Create the date for today
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0];
        
        const jsonData = {
            [dateKey]: {
                size: {
                    width,
                    height
                },
                backgroundImage: "https://raw.githubusercontent.com/saasify-sh/react-blobby-blob/master/media/blob.jpg",
                words: words.map(word => ({
                    ...word,
                    audioUrl: "123456789", // Placeholder
                    startAt: "00:24" // Placeholder
                }))
            }
        };
        
        jsonOutput = JSON.stringify(jsonData, null, 2);
    }
</script>

<div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-center mb-8">Crossword Puzzle Creator</h1>
        
        <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <CrosswordGrid bind:this={gridComponent} bind:width bind:height />
            
            <div class="mt-8 flex justify-center">
                <button 
                    onclick={generateJSON}
                    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
                >
                    GENERATE JSON
                </button>
            </div>
            
            {#if words.length > 0}
                <div class="mt-8">
                    <h2 class="text-2xl font-bold mb-4">Identified Words</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {#each words as word}
                            <div class="border rounded-lg p-4 shadow-sm" style="border-left: 4px solid {word.color}">
                                <div class="font-bold">{word.word}</div>
                                <div class="text-sm text-gray-600">
                                    Position: ({word.startX}, {word.startY})
                                </div>
                                <div class="text-sm text-gray-600">
                                    Direction: {word.direction}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
            
            {#if jsonOutput}
                <div class="mt-8">
                    <h2 class="text-2xl font-bold mb-4">JSON Output</h2>
                    <div class="relative">
                        <button 
                            onclick={() => navigator.clipboard.writeText(jsonOutput)}
                            class="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded text-sm"
                        >
                            Copy
                        </button>
                        <pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{jsonOutput}</pre>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>