<script>
    import { extractWords, generateJSON, formatJSON } from '$lib/utilities/wordManager.js';
    
    let { grid = [], width = 12, height = 10 } = $props();
    
    // Extract words from the grid
    let words = $derived(() => {
        if (!grid || !Array.isArray(grid)) return [];
        return extractWords(grid);
    });
    
    // Generate JSON output
    let jsonOutput = $derived(() => {
        if (!Array.isArray(words)) return {};
        return generateJSON(words, width, height);
    });
    
    // Store the formatted JSON string
    let jsonString = $derived(() => {
        if (!jsonOutput) return "{}";
        return formatJSON(jsonOutput);
    });
    
    // Show/hide JSON modal
    let showJsonModal = $state(false);
    
    // Handle word updates
    function updateWord(index, field, value) {
        // Create a new array to ensure reactivity
        words = words.map((word, i) => {
            if (i === index) {
                return {
                    ...word,
                    [field]: value
                };
            }
            return word;
        });
    }
    
    // Functions to show and hide the JSON modal
    function showJson() {
        showJsonModal = true;
    }
    
    function hideJson() {
        showJsonModal = false;
    }
    
    // Copy JSON to clipboard
    function copyToClipboard() {
        navigator.clipboard.writeText(jsonString)
            .then(() => {
                alert('JSON copied to clipboard!');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    }
</script>

<div class="mt-8">
    <h2 class="text-xl font-bold mb-4">Words Found ({words.length})</h2>
    
    {#if words.length === 0}
        <p class="text-gray-500 italic">No words found yet. Add letters to the grid to form words.</p>
    {:else}
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="py-2 px-4 border">Word</th>
                        <th class="py-2 px-4 border">Direction</th>
                        <th class="py-2 px-4 border">Position</th>
                        <th class="py-2 px-4 border">Color</th>
                        <th class="py-2 px-4 border">Clue</th>
                        <th class="py-2 px-4 border">Audio ID</th>
                        <th class="py-2 px-4 border">Start At</th>
                    </tr>
                </thead>
                <tbody>
                    {#each words as word, index}
                        <tr class="hover:bg-gray-50">
                            <td class="py-2 px-4 border font-bold">{word.word}</td>
                            <td class="py-2 px-4 border">{word.direction}</td>
                            <td class="py-2 px-4 border">({word.startX}, {word.startY})</td>
                            <td class="py-2 px-4 border">
                                <div class="flex items-center">
                                    <div class="w-6 h-6 mr-2 rounded" style="background-color: {word.color}"></div>
                                    <input 
                                        type="text" 
                                        class="w-20 border rounded px-2 py-1"
                                        value={word.color}
                                        oninput={(e) => updateWord(index, 'color', e.target.value)}
                                    />
                                </div>
                            </td>
                            <td class="py-2 px-4 border">
                                <input 
                                    type="text" 
                                    class="w-full border rounded px-2 py-1"
                                    placeholder="Enter clue"
                                    value={word.textClue}
                                    oninput={(e) => updateWord(index, 'textClue', e.target.value)}
                                />
                            </td>
                            <td class="py-2 px-4 border">
                                <input 
                                    type="text" 
                                    class="w-full border rounded px-2 py-1"
                                    placeholder="Audio ID"
                                    value={word.audioUrl}
                                    oninput={(e) => updateWord(index, 'audioUrl', e.target.value)}
                                />
                            </td>
                            <td class="py-2 px-4 border">
                                <input 
                                    type="text" 
                                    class="w-full border rounded px-2 py-1"
                                    placeholder="00:00"
                                    value={word.startAt}
                                    oninput={(e) => updateWord(index, 'startAt', e.target.value)}
                                />
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        
        <div class="mt-4">
            <button 
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                onclick={showJson}
            >
                Generate JSON
            </button>
        </div>
    {/if}
    
    <!-- JSON Modal -->
    {#if showJsonModal}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Generated JSON</h3>
                    <button 
                        class="text-gray-500 hover:text-gray-700"
                        onclick={hideJson}
                    >
                        ×
                    </button>
                </div>
                
                <div class="overflow-auto flex-grow">
                    <pre class="bg-gray-100 p-4 rounded whitespace-pre-wrap">{jsonString}</pre>
                </div>
                
                <div class="flex justify-end mt-4">
                    <button 
                        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        onclick={copyToClipboard}
                    >
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>