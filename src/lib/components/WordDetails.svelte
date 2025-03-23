<script>
    let { words = [] } = $props();
    
    // Export date for parent component to use
    export function getDate() {
        return date;
    }
    let date = $state(new Date().toISOString().split('T')[0]); // Default to today's date
    
    // Validate color and ensure it has a # prefix
    function validateColor(color) {
        if (!color) return "#FE9C9C"; // Default color (first in our sequence)
        return color.startsWith('#') ? color : `#${color}`;
    }
    
    // Validate audio start time format
    function validateStartTime(time) {
        if (!time) return "0:00";
        // Basic validation - could be enhanced
        
        // If time doesn't have a colon, try to format it
        if (!time.includes(':')) {
            if (time.length <= 2) {
                return `0:${time.padStart(2, '0')}`;
            } else {
                const minutes = time.slice(0, -2);
                const seconds = time.slice(-2);
                return `${minutes}:${seconds}`;
            }
        }
        return time;
    }
    
    function updateWord(index, field, value) {
        words[index][field] = value;
    }
</script>

<div class="mb-8">
    <div class="mb-6">
        <label class="block text-gray-700 font-bold mb-2" for="date-input">
            Puzzle Date
        </label>
        <input 
            id="date-input"
            type="date" 
            bind:value={date}
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
    </div>
    
    <h2 class="text-2xl font-bold mb-4">Edit Word Details</h2>
    
    {#if words.length === 0}
        <p class="text-gray-500 italic">No words identified yet. Fill in the grid and press Generate to find words.</p>
    {:else}
        <div class="space-y-6">
            {#each words as word, index}
                <div class="border rounded-lg p-4 shadow-sm" style="border-left: 4px solid {validateColor(word.color)}">
                    <div class="font-bold text-lg mb-2">{word.word}</div>
                    <div class="text-sm text-gray-600 mb-2">
                        Position: ({word.startX}, {word.startY}) • Direction: {word.direction}
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <!-- Color input -->
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-1" for={`color-${index}`}>
                                Color
                            </label>
                            <input 
                                id={`color-${index}`}
                                type="text" 
                                value={word.color || "#FE9C9C"}
                                oninput={(e) => updateWord(index, 'color', validateColor(e.target.value))}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="#FE9C9C"
                            />
                        </div>
                        
                        <!-- Clue input -->
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-1" for={`clue-${index}`}>
                                Clue
                            </label>
                            <input 
                                id={`clue-${index}`}
                                type="text" 
                                value={word.textClue || ""}
                                oninput={(e) => updateWord(index, 'textClue', e.target.value)}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Enter a clue for this word"
                            />
                        </div>
                        
                        <!-- Audio ID input -->
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-1" for={`audio-${index}`}>
                                Audio ID
                            </label>
                            <input 
                                id={`audio-${index}`}
                                type="text" 
                                value={word.audioUrl || ""}
                                oninput={(e) => updateWord(index, 'audioUrl', e.target.value)}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Enter audio ID"
                            />
                        </div>
                        
                        <!-- Start Time input -->
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-1" for={`start-${index}`}>
                                Start Time
                            </label>
                            <input 
                                id={`start-${index}`}
                                type="text" 
                                value={word.startAt || "0:00"}
                                oninput={(e) => updateWord(index, 'startAt', validateStartTime(e.target.value))}
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="0:00"
                            />
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>