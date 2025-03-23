<script>
    import CrosswordGrid from '$lib/components/CrosswordGrid.svelte';
    import WordDetails from '$lib/components/WordDetails.svelte';
    
    // Initialize with default values
    let grid;
    let width = $state(12);
    let height = $state(10);
    let jsonOutput = $state('');
    let words = $state([]);
    let gridComponent;
    
    // UI state
    let step = $state(1); // 1: Edit Grid, 2: Edit Word Details, 3: View JSON
    
    // Function to identify words in the grid
    function identifyWords() {
        if (!grid) {
            // If grid is not available, get it from the component
            grid = gridComponent.getGrid();
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
                    // Convert underscores to spaces for the output
                    let wordLength = 0;
                    let word = '';
                    let displayWord = '';
                    let currentCol = col;
                    
                    // Scan right until we hit the end of the word
                    while (isValidCell(row, currentCol)) {
                        // Replace underscores with spaces for the word value in JSON
                        displayWord += grid[row][currentCol] === '_' ? ' ' : grid[row][currentCol];
                        word += grid[row][currentCol];
                        visited[row][currentCol] = true;
                        wordLength++;
                        currentCol++;
                    }
                    
                    // Only consider words of length >= 2
                    if (wordLength >= 2) {
                        foundWords.push({
                            word: displayWord,
                            startX: col,
                            startY: row,
                            direction: 'across',
                            color: getNextColor(),
                            textClue: `Song Title`,
                            audioUrl: "",
                            startAt: "0:00"
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
                    let displayWord = '';
                    let currentRow = row;
                    
                    // Scan down until we hit the end of the word
                    while (isValidCell(currentRow, col)) {
                        // Replace underscores with spaces for the word value in JSON
                        displayWord += grid[currentRow][col] === '_' ? ' ' : grid[currentRow][col];
                        word += grid[currentRow][col];
                        visited[currentRow][col] = true;
                        wordLength++;
                        currentRow++;
                    }
                    
                    // Only consider words of length >= 2
                    if (wordLength >= 2) {
                        foundWords.push({
                            word: displayWord,
                            startX: col,
                            startY: row,
                            direction: 'down',
                            color: getNextColor(),
                            textClue: `Song Title`,
                            audioUrl: "",
                            startAt: "0:00"
                        });
                    }
                }
            }
        }
        
        return foundWords;
    }
    
    // Function to get color from our predefined list
    let colorIndex = $state(0);
    function getNextColor() {
        const colors = [
            "#FE9C9C", "#28D66A", "#FFCEFD", "#FF5B5E", 
            "#568EFF", "#FFB34B", "#00FFFF"
        ];
        const color = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
        return color;
    }
    
    // Function to find words and go to the next step
    function findWords() {
        console.log("Find words button clicked");
        
        // Make sure we get the latest grid data from the component
        if (gridComponent) {
            grid = gridComponent.getGrid();
        }
        
        words = identifyWords();
        
        if (words.length > 0) {
            step = 2; // Go to word details
        } else {
            alert("No words were found in the grid. Please add more letters to create words.");
        }
    }
    
    // Reference to WordDetails component
    let wordDetailsComponent;
    
    // Function to generate JSON output
    function generateJSON() {
        // Ensure all words have properly formatted values
        words = words.map(word => ({
            ...word,
            color: word.color && word.color.startsWith('#') ? word.color : `#${word.color || 'FE9C9C'}`,
            textClue: word.textClue || "",
            audioUrl: word.audioUrl || "",
            startAt: word.startAt || "0:00"
        }));
        
        // Get date from WordDetails component
        let dateKey;
        if (wordDetailsComponent) {
            dateKey = wordDetailsComponent.getDate();
        } else {
            dateKey = new Date().toISOString().split('T')[0];
        }
        
        const jsonData = {
            [dateKey]: {
                size: {
                    width,
                    height
                },
                backgroundImage: "https://raw.githubusercontent.com/saasify-sh/react-blobby-blob/master/media/blob.jpg",
                words
            }
        };
        
        jsonOutput = JSON.stringify(jsonData, null, 2);
        step = 3; // Go to JSON view
    }
    
    // Go back to grid editor
    function goBackToGrid() {
        step = 1;
    }
    
    // Go back to word details
    function goBackToDetails() {
        step = 2;
    }
</script>

<div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-center mb-8">Crossword Puzzle Creator</h1>
        
        <!-- Progress steps -->
        <div class="max-w-4xl mx-auto mb-6">
            <div class="flex items-center justify-between">
                <div class="flex flex-col items-center">
                    <div class={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>1</div>
                    <div class="text-sm mt-1">Create Grid</div>
                </div>
                <div class="flex-1 h-1 mx-2 bg-gray-300">
                    <div class={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                </div>
                <div class="flex flex-col items-center">
                    <div class={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>2</div>
                    <div class="text-sm mt-1">Edit Details</div>
                </div>
                <div class="flex-1 h-1 mx-2 bg-gray-300">
                    <div class={`h-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                </div>
                <div class="flex flex-col items-center">
                    <div class={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
                    <div class="text-sm mt-1">Generate JSON</div>
                </div>
            </div>
        </div>
        
        <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
            {#if step === 1}
                <!-- Step 1: Grid Editor -->
                <CrosswordGrid bind:this={gridComponent} bind:width bind:height />
                
                <div class="mt-8 flex justify-center">
                    <button 
                        onclick={findWords}
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
                    >
                        FIND WORDS & CONTINUE
                    </button>
                </div>
            {:else if step === 2}
                <!-- Step 2: Word Details -->
                <div class="flex justify-end mb-4">
                    <button 
                        onclick={goBackToGrid}
                        class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                    >
                        Back to Grid
                    </button>
                </div>
                
                <WordDetails bind:this={wordDetailsComponent} {words} />
                
                <div class="mt-6 flex justify-center">
                    <button 
                        onclick={generateJSON}
                        class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
                    >
                        CONFIRM & GENERATE JSON
                    </button>
                </div>
            {:else if step === 3}
                <!-- Step 3: JSON Output -->
                <div class="flex justify-end mb-4">
                    <button 
                        onclick={goBackToDetails}
                        class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
                    >
                        Back to Details
                    </button>
                </div>
                
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
                
                <div class="mt-6 flex justify-center">
                    <button 
                        onclick={goBackToGrid}
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 mr-3"
                    >
                        START OVER
                    </button>
                    <button 
                        onclick={() => navigator.clipboard.writeText(jsonOutput)}
                        class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200"
                    >
                        COPY JSON
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>