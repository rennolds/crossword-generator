/**
 * Extract words from the grid
 * @param {Array<Array<string>>} grid - 2D array representing the crossword grid
 * @returns {Array<Object>} - List of words found in the grid
 */
export function extractWords(grid) {
    const words = [];
    const gridHeight = grid.length;
    const gridWidth = grid[0].length;
    
    // Find horizontal words (across)
    for (let row = 0; row < gridHeight; row++) {
        let currentWord = '';
        let startCol = 0;
        
        for (let col = 0; col < gridWidth; col++) {
            const letter = grid[row][col];
            
            if (letter && letter !== '') {
                if (currentWord === '') {
                    startCol = col;
                }
                currentWord += letter;
            } else if (currentWord.length > 1) {
                // We've found a complete word
                words.push({
                    word: currentWord,
                    startX: startCol,
                    startY: row,
                    direction: 'across',
                    audioUrl: '',
                    startAt: '00:00',
                    color: getRandomColor(),
                    textClue: ''
                });
                currentWord = '';
            } else {
                currentWord = '';
            }
        }
        
        // Check if there's a word at the end of the row
        if (currentWord.length > 1) {
            words.push({
                word: currentWord,
                startX: startCol,
                startY: row,
                direction: 'across',
                audioUrl: '',
                startAt: '00:00',
                color: getRandomColor(),
                textClue: ''
            });
        }
    }
    
    // Find vertical words (down)
    for (let col = 0; col < gridWidth; col++) {
        let currentWord = '';
        let startRow = 0;
        
        for (let row = 0; row < gridHeight; row++) {
            const letter = grid[row][col];
            
            if (letter && letter !== '') {
                if (currentWord === '') {
                    startRow = row;
                }
                currentWord += letter;
            } else if (currentWord.length > 1) {
                // We've found a complete word
                words.push({
                    word: currentWord,
                    startX: col,
                    startY: startRow,
                    direction: 'down',
                    audioUrl: '',
                    startAt: '00:00',
                    color: getRandomColor(),
                    textClue: ''
                });
                currentWord = '';
            } else {
                currentWord = '';
            }
        }
        
        // Check if there's a word at the end of the column
        if (currentWord.length > 1) {
            words.push({
                word: currentWord,
                startX: col,
                startY: startRow,
                direction: 'down',
                audioUrl: '',
                startAt: '00:00',
                color: getRandomColor(),
                textClue: ''
            });
        }
    }
    
    return words;
}

/**
 * Generate a random color
 * @returns {string} - Hex color code
 */
function getRandomColor() {
    const colors = [
        "#FFCEFD", "#568EFF", "#28D66A", "#FFB34B", 
        "#FE9C9C", "#FCEB00", "#FF5B5E", "#00FFFF",
        "#FF9CEF", "#6F9CFF", "#50E27C", "#FFCF7D",
        "#FFAEAE", "#FFF04D", "#FF7B7D", "#7DFFFF"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Generate JSON output for the crossword
 * @param {Array<Object>} words - List of words found in the grid
 * @param {number} width - Width of the grid
 * @param {number} height - Height of the grid
 * @returns {Object} - JSON structure for the crossword
 */
export function generateJSON(words, width, height) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    return {
        [dateStr]: {
            size: {
                width,
                height
            },
            backgroundImage: "https://raw.githubusercontent.com/saasify-sh/react-blobby-blob/master/media/blob.jpg",
            words
        }
    };
}

/**
 * Generate a pretty-printed JSON string
 * @param {Object} jsonObj - The JSON object to stringify
 * @returns {string} - Formatted JSON string
 */
export function formatJSON(jsonObj) {
    return JSON.stringify(jsonObj, null, 2);
}