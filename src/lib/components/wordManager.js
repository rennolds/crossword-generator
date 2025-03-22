
export function extractWords(grid) {
    // Return empty array if grid is undefined or empty
    if (!grid || !Array.isArray(grid) || grid.length === 0) {
        return [];
    }
    
    const words = [];
    const gridHeight = grid.length;
    const gridWidth = grid[0]?.length || 0;
    
    // Return empty array if grid dimensions are invalid
    if (gridWidth === 0) {
        return [];
    }
    
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

function getRandomColor() {
    const colors = [
        "#FFCEFD", "#568EFF", "#28D66A", "#FFB34B", 
        "#FE9C9C", "#FCEB00", "#FF5B5E", "#00FFFF",
        "#FF9CEF", "#6F9CFF", "#50E27C", "#FFCF7D",
        "#FFAEAE", "#FFF04D", "#FF7B7D", "#7DFFFF"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

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

export function formatJSON(jsonObj) {
    return JSON.stringify(jsonObj, null, 2);
}