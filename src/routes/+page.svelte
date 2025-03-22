<script>
    import CrosswordGrid from '$lib/components/CrosswordGrid.svelte';
</script>

<div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-center mb-8">Crossword Puzzle Creator</h1>
        
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <CrosswordGrid />
            
            <div class="mt-8 flex justify-end">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Generate JSON
                </button>
            </div>
        </div>
    </div>
</div>