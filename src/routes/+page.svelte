<script>
  import CrosswordGrid from "$lib/components/CrosswordGrid.svelte";
  import WordDetails from "$lib/components/WordDetails.svelte";
  import AudioVerifier from "$lib/components/AudioVerifier.svelte";

  // Initialize with default values
  let currentStepGrid = $state(undefined); // Will hold the grid data across steps
  let globalWidth = $state(12);
  let globalHeight = $state(10);
  let jsonOutput = $state("");
  let words = $state([]);
  let gridComponentRef; // Reference to the CrosswordGrid component instance

  // State variables to store details from WordDetails component
  let puzzleDateStore = $state(new Date().toISOString().split("T")[0]);
  let puzzleTitleStore = $state("");
  let puzzleVersionStore = $state("1.0.0");
  let puzzleThemeStore = $state("black"); // Added puzzleThemeStore

  // UI state
  let step = $state(1); // 1: Edit Grid, 2: Edit Word Details, 3: Verify Audio, 4: View JSON

  // Initialize or update currentStepGrid when dimensions change or on initial load
  $effect(() => {
    if (
      currentStepGrid === undefined ||
      currentStepGrid.length !== globalHeight ||
      (currentStepGrid[0] && currentStepGrid[0].length !== globalWidth)
    ) {
      // Initialize if undefined or if dimensions mismatch (e.g. if width/height could change dynamically in future)
      currentStepGrid = Array(globalHeight)
        .fill(null)
        .map(() => Array(globalWidth).fill(""));
    }
  });

  // Function to identify words in the grid
  function identifyWords() {
    const gridToProcess = currentStepGrid; // Use the centrally managed grid state

    if (!gridToProcess || !gridToProcess.length || !gridToProcess[0]) {
      console.error(
        "Grid is still not available or malformed for word identification"
      );
      return [];
    }

    const foundWords = [];
    // Use globalHeight and globalWidth for dimensions
    const visited = Array(globalHeight)
      .fill(null)
      .map(() => Array(globalWidth).fill(false));

    // Helper function to check if a cell is valid for word detection
    function isValidCell(row, col) {
      return (
        row >= 0 &&
        row < globalHeight &&
        col >= 0 &&
        col < globalWidth &&
        gridToProcess[row][col] !== ""
      );
    }

    // Scan for across words
    for (let row = 0; row < globalHeight; row++) {
      for (let col = 0; col < globalWidth; col++) {
        if (gridToProcess[row][col] === "" || visited[row][col]) continue;

        const isStartOfAcrossWord =
          col === 0 || gridToProcess[row][col - 1] === "";

        if (isStartOfAcrossWord) {
          let wordLength = 0;
          let word = "";
          let displayWord = "";
          let currentCol = col;

          while (isValidCell(row, currentCol)) {
            displayWord +=
              gridToProcess[row][currentCol] === "_"
                ? " "
                : gridToProcess[row][currentCol];
            word += gridToProcess[row][currentCol];
            visited[row][currentCol] = true;
            wordLength++;
            currentCol++;
          }

          if (wordLength >= 2) {
            foundWords.push({
              word: displayWord,
              startX: col,
              startY: row,
              direction: "across",
              color: getNextColor(),
              textClue: `Song title`,
              audioUrl: "",
              startAt: "0:20",
              audioDuration: 6.5,
            });
          }
        }
      }
    }

    visited.forEach((row) => row.fill(false));

    // Scan for down words
    for (let col = 0; col < globalWidth; col++) {
      for (let row = 0; row < globalHeight; row++) {
        if (gridToProcess[row][col] === "" || visited[row][col]) continue;

        const isStartOfDownWord =
          row === 0 || gridToProcess[row - 1][col] === "";

        if (isStartOfDownWord) {
          let wordLength = 0;
          let word = "";
          let displayWord = "";
          let currentRow = row;

          while (isValidCell(currentRow, col)) {
            displayWord +=
              gridToProcess[currentRow][col] === "_"
                ? " "
                : gridToProcess[currentRow][col];
            word += gridToProcess[currentRow][col];
            visited[currentRow][col] = true;
            wordLength++;
            currentRow++;
          }

          if (wordLength >= 2) {
            foundWords.push({
              word: displayWord,
              startX: col,
              startY: row,
              direction: "down",
              color: getNextColor(),
              textClue: `Song title`,
              audioUrl: "",
              startAt: "0:20",
              audioDuration: 6.5,
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
      "#FE9C9C",
      "#28D66A",
      "#FFCEFD",
      "#FF5B5E",
      "#568EFF",
      "#FFB34B",
      "#00FFFF",
    ];
    const color = colors[colorIndex];
    colorIndex = (colorIndex + 1) % colors.length;
    return color;
  }

  // Function to find words and go to the next step
  function findWords() {
    console.log("Find words button clicked");

    // Get the latest grid data from the component and store it in currentStepGrid
    if (gridComponentRef) {
      currentStepGrid = gridComponentRef.getGrid();
    }

    words = identifyWords(); // identifyWords now uses currentStepGrid
    colorIndex = 0; // Reset color index when finding new words

    if (words.length > 0) {
      step = 2; // Go to word details
    } else {
      alert(
        "No words were found in the grid. Please add more letters to create words."
      );
    }
  }

  // Reference to WordDetails component
  let wordDetailsComponent;

  // Function to proceed to audio verification
  function goToVerification() {
    if (wordDetailsComponent) {
      puzzleDateStore = wordDetailsComponent.getDate();
      puzzleTitleStore = wordDetailsComponent.getTitle();
      puzzleVersionStore = wordDetailsComponent.getVersion();
      puzzleThemeStore = wordDetailsComponent.getTheme(); // Get theme
    }
    step = 3;
  }

  // Function to generate JSON output
  function generateJSON() {
    words = words.map((word) => ({
      ...word,
      color:
        word.color && word.color.startsWith("#")
          ? word.color
          : `#${word.color || "FE9C9C"}`,
      textClue: word.textClue || "",
      audioUrl: word.audioUrl || "",
      startAt: word.startAt || "0:20",
      audioDuration: word.audioDuration || 6.5,
    }));

    // Use stored values
    const dateKey = puzzleDateStore || new Date().toISOString().split("T")[0];
    const currentPuzzleTitle = puzzleTitleStore || "";
    const currentPuzzleVersion = puzzleVersionStore || "1.0.0";
    const currentPuzzleTheme = puzzleThemeStore || "black"; // Use stored theme

    const jsonData = {
      [dateKey]: {
        title: currentPuzzleTitle, // Use stored title
        version: currentPuzzleVersion, // Use stored version
        size: {
          width: globalWidth, // Use globalWidth
          height: globalHeight, // Use globalHeight
        },
        theme: currentPuzzleTheme, // Use stored theme
        words,
      },
    };

    jsonOutput = JSON.stringify(jsonData, null, 2).slice(1, -1);
    step = 4;
  }

  // Go back to grid editor
  function goBackToGrid() {
    // currentStepGrid already holds the state, CrosswordGrid will use it on re-render
    step = 1;
  }

  // Go back to word details
  function goBackToDetails() {
    step = 2;
  }

  // Go back to audio verification
  function goBackToVerification() {
    step = 3;
  }
</script>

<div class="min-h-screen bg-gray-100 py-8">
  <div class="container mx-auto px-4">
    <h1 class="text-3xl font-bold text-center mb-8">
      Crossword Puzzle Creator
    </h1>

    <!-- Progress steps -->
    <div class="max-w-5xl mx-auto mb-6">
      <div class="flex items-center justify-between">
        <div class="flex flex-col items-center text-center w-1/4">
          <div
            class={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          >
            1
          </div>
          <div class="text-sm mt-1">Create Grid</div>
        </div>
        <div class="flex-1 h-1 mx-2 bg-gray-300">
          <div
            class={`h-full ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`}
          ></div>
        </div>
        <div class="flex flex-col items-center text-center w-1/4">
          <div
            class={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          >
            2
          </div>
          <div class="text-sm mt-1">Edit Details</div>
        </div>
        <div class="flex-1 h-1 mx-2 bg-gray-300">
          <div
            class={`h-full ${step >= 3 ? "bg-blue-600" : "bg-gray-300"}`}
          ></div>
        </div>
        <div class="flex flex-col items-center text-center w-1/4">
          <div
            class={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          >
            3
          </div>
          <div class="text-sm mt-1">Verify Audio</div>
        </div>
        <div class="flex-1 h-1 mx-2 bg-gray-300">
          <div
            class={`h-full ${step >= 4 ? "bg-blue-600" : "bg-gray-300"}`}
          ></div>
        </div>
        <div class="flex flex-col items-center text-center w-1/4">
          <div
            class={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 4 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          >
            4
          </div>
          <div class="text-sm mt-1">Generate JSON</div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {#if step === 1}
        <!-- Step 1: Grid Editor -->
        {#if currentStepGrid}
          <!-- Ensure currentStepGrid is initialized before rendering CrosswordGrid -->
          <CrosswordGrid
            bind:this={gridComponentRef}
            width={globalWidth}
            height={globalHeight}
            grid={currentStepGrid}
          />
        {/if}

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
            onclick={goToVerification}
            class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
          >
            VERIFY AUDIO
          </button>
        </div>
      {:else if step === 3}
        <!-- Step 3: Audio Verification -->
        <div class="flex justify-between mb-4">
          <button
            onclick={goBackToDetails}
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Back to Details
          </button>
        </div>

        <AudioVerifier {words} />

        <div class="mt-6 flex justify-center">
          <button
            onclick={generateJSON}
            class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
          >
            CONFIRM & GENERATE JSON
          </button>
        </div>
      {:else if step === 4}
        <!-- Step 4: JSON Output -->
        <div class="flex justify-end mb-4">
          <button
            onclick={goBackToVerification}
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
          >
            Back to Verification
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
          <pre
            class="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{jsonOutput}</pre>
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
            class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200"
          >
            COPY JSON
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
