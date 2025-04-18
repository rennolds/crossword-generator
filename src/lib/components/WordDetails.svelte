<script>
  let { words = [] } = $props();

  // Export date, title, and version for parent component to use
  export function getDate() {
    return date;
  }
  export function getTitle() {
    return title;
  }
  export function getVersion() {
    return version;
  }

  let date = $state(new Date().toISOString().split("T")[0]); // Default to today's date
  let title = $state(""); // Default empty string
  let version = $state("1.0.0"); // Default version

  // Validate color and ensure it has a # prefix
  function validateColor(color) {
    if (!color) return "#FE9C9C"; // Default color (first in our sequence)
    return color.startsWith("#") ? color : `#${color}`;
  }

  // Validate audio start time format
  function validateStartTime(time) {
    if (!time) return "0:20";
    // Basic validation - could be enhanced

    // If time doesn't have a colon, try to format it
    if (!time.includes(":")) {
      if (time.length <= 2) {
        return `0:${time.padStart(2, "0")}`;
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
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div>
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

    <div>
      <label class="block text-gray-700 font-bold mb-2" for="title-input">
        Title
      </label>
      <input
        id="title-input"
        type="text"
        bind:value={title}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Enter puzzle title"
      />
      {#if title.length > 60}
        <p class="text-red-500 text-xs italic mt-1">
          Warning: Title exceeds 60 characters.
        </p>
      {/if}
    </div>

    <div>
      <label class="block text-gray-700 font-bold mb-2" for="version-input">
        Version
      </label>
      <input
        id="version-input"
        type="text"
        bind:value={version}
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="1.0.0"
      />
      {#if version.length > 60}
        <p class="text-red-500 text-xs italic mt-1">
          Warning: Version exceeds 60 characters.
        </p>
      {/if}
    </div>
  </div>

  <h2 class="text-2xl font-bold mb-4">Edit Word Details</h2>

  {#if words.length === 0}
    <p class="text-gray-500 italic">
      No words identified yet. Fill in the grid and press Generate to find
      words.
    </p>
  {:else}
    <div class="space-y-6">
      {#each words as word, index}
        <div
          class="border rounded-lg p-4 shadow-sm"
          style="border-left: 4px solid {validateColor(word.color)}"
        >
          <div class="font-bold text-lg mb-2">{word.word}</div>
          <div class="text-sm text-gray-600 mb-2">
            Position: ({word.startX}, {word.startY}) • Direction: {word.direction}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <!-- Color input -->
            <div>
              <label
                class="block text-gray-700 text-sm font-bold mb-1"
                for={`color-${index}`}
              >
                Color
              </label>
              <input
                id={`color-${index}`}
                type="text"
                value={word.color || "#FE9C9C"}
                oninput={(e) =>
                  updateWord(index, "color", validateColor(e.target.value))}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="#FE9C9C"
              />
            </div>

            <!-- Clue input -->
            <div>
              <label
                class="block text-gray-700 text-sm font-bold mb-1"
                for={`clue-${index}`}
              >
                Clue
              </label>
              <input
                id={`clue-${index}`}
                type="text"
                value={word.textClue || ""}
                oninput={(e) => updateWord(index, "textClue", e.target.value)}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter a clue for this word"
              />
              {#if word.textClue && word.textClue.length > 60}
                <p class="text-red-500 text-xs italic mt-1">
                  Warning: Clue exceeds 60 characters.
                </p>
              {/if}
            </div>

            <!-- Audio ID input -->
            <div>
              <label
                class="block text-gray-700 text-sm font-bold mb-1"
                for={`audio-${index}`}
              >
                Audio ID
              </label>
              <input
                id={`audio-${index}`}
                type="text"
                value={word.audioUrl || ""}
                oninput={(e) => updateWord(index, "audioUrl", e.target.value)}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter audio ID"
              />
              {#if word.audioUrl && word.audioUrl.length > 60}
                <p class="text-red-500 text-xs italic mt-1">
                  Warning: Audio ID exceeds 60 characters.
                </p>
              {/if}
            </div>

            <!-- Start Time input -->
            <div>
              <label
                class="block text-gray-700 text-sm font-bold mb-1"
                for={`start-${index}`}
              >
                Start Time
              </label>
              <input
                id={`start-${index}`}
                type="text"
                value={word.startAt || "0:20"}
                oninput={(e) =>
                  updateWord(
                    index,
                    "startAt",
                    validateStartTime(e.target.value)
                  )}
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="0:20"
              />
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
