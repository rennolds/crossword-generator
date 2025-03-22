<script>
    import CrosswordGrid from '$lib/components/CrosswordGrid.svelte';
    import WordList from '$lib/components/WordList.svelte';
    
    // Initialize with default values
    let grid = $state(Array(10).fill().map(() => Array(12).fill('')));
    let width = $state(12);
    let height = $state(10);
</script>

<div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-center mb-8">Crossword Puzzle Creator</h1>
        
        <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <CrosswordGrid bind:grid bind:width bind:height />
            
            <WordList {grid} {width} {height} />
        </div>
    </div>
</div>