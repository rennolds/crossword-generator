<script>
  import { onMount } from "svelte";

  let { words } = $props();
  let widgetStates = $state({}); // To track loading status: 'loading', 'ready', 'error'
  let widgets = $state({}); // To store the actual SC.Widget instances

  // Filter words that have an audioUrl
  let wordsWithAudio = $derived(
    words.filter((word) => word.audioUrl && word.audioUrl.trim() !== "")
  );

  onMount(() => {
    // Ensure the SoundCloud API script is loaded.
    // This might need to be added to app.html or loaded dynamically if not already present.
    // Example:
    // const script = document.createElement('script');
    // script.src = 'https://w.soundcloud.com/player/api.js';
    // script.onload = initializeWidgets;
    // document.body.appendChild(script);

    // Assuming the script is loaded globally for now:
    if (window.SC && window.SC.Widget) {
      initializeWidgets();
    } else {
      console.warn("SoundCloud Widget API not found. Widgets will not load.");
      // Handle cases where the script might load later if using dynamic loading
      window.onSCWidgetApiReady = initializeWidgets;
    }
  });

  function initializeWidgets() {
    console.log("SoundCloud Widget API is ready or already was.");

    wordsWithAudio.forEach((word) => {
      const widgetId = `sc-widget-${word.startX}-${word.startY}-${word.direction}`;
      const iframe = document.getElementById(widgetId);
      const wordKey = `${word.startX}:${word.startY}:${word.direction}`;

      if (iframe) {
        // Initialize state
        widgetStates[wordKey] = "loading";

        try {
          const widget = SC.Widget(iframe);

          widget.bind(SC.Widget.Events.READY, () => {
            console.log(`Widget ${widgetId} (${word.word}) is ready`);
            widgetStates[wordKey] = "ready";
            widgets[wordKey] = widget; // Store the widget instance
          });

          // Add error handling
          widget.bind(SC.Widget.Events.ERROR, (error) => {
            console.warn(
              `Widget ${widgetId} (${word.word}) failed to load:`,
              error
            );
            widgetStates[wordKey] = "error";
          });
        } catch (e) {
          console.error(
            `Failed to initialize widget ${widgetId} (${word.word}):`,
            e
          );
          widgetStates[wordKey] = "error";
        }
      } else {
        console.warn(
          `Iframe with id ${widgetId} not found for word "${word.word}".`
        );
        widgetStates[wordKey] = "error"; // Mark as error if iframe isn't found
      }
    });
  }

  // Function to parse "m:ss" or "ss" time format into milliseconds
  function parseTime(timeString) {
    if (!timeString || typeof timeString !== "string") return 0;
    const parts = timeString.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
        seconds = parts[0] * 60 + parts[1];
      }
    } else if (parts.length === 1) {
      if (!isNaN(parts[0])) {
        seconds = parts[0];
      }
    }
    return seconds * 1000;
  }

  // Function to seek to the startAt time and play
  function testStartTime(wordKey, startAt) {
    const widget = widgets[wordKey];
    if (!widget) {
      console.error("Widget not found for key:", wordKey);
      return;
    }
    const timeMs = parseTime(startAt);
    console.log(`Seeking widget ${wordKey} to ${startAt} (${timeMs}ms)`);

    // Seek to the desired time first, then play in the callback.
    widget.seekTo(timeMs, () => {
      console.log(`Seek complete for ${wordKey}, attempting to play.`);
      widget.play();
    });
  }

  // Function to get border color based on state
  function getBorderColor(wordKey) {
    switch (widgetStates[wordKey]) {
      case "ready":
        return "border-green-500";
      case "error":
        return "border-red-500";
      case "loading":
      default:
        return "border-gray-300"; // Default/loading border
    }
  }
</script>

<div class="space-y-4">
  <h3 class="text-xl font-semibold mb-4">Verify Audio Tracks</h3>
  {#if wordsWithAudio.length === 0}
    <p class="text-gray-600">No words have audio URLs provided.</p>
  {:else}
    <p class="text-sm text-gray-600 mb-4">
      Check each SoundCloud widget below to ensure the audio track loads
      correctly. A green border indicates success, red indicates an error.
    </p>
    {#each wordsWithAudio as word (word.startX + ":" + word.startY + ":" + word.direction)}
      {@const wordKey = `${word.startX}:${word.startY}:${word.direction}`}
      {@const widgetId = `sc-widget-${word.startX}-${word.startY}-${word.direction}`}
      <div class={`p-3 border-2 rounded ${getBorderColor(wordKey)}`}>
        <p class="font-medium mb-2">
          {word.word} ({word.direction}) -
          <code class="text-sm bg-gray-100 px-1 rounded">{word.audioUrl}</code>
        </p>
        {#if word.audioUrl && word.audioUrl.trim() !== ""}
          <iframe
            title="SoundCloud Player for {word.word}"
            id={widgetId}
            width="100%"
            height="120"
            scrolling="no"
            frameborder="no"
            allow="autoplay"
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{encodeURIComponent(
              word.audioUrl
            )}&amp;show_user=false&amp;show_artwork=false&amp;show_playcount=false&amp;download=false&amp;sharing=false&amp;buying=false&amp;color=%23ff5500&amp;auto_play=false&amp;hide_related=true&amp;show_comments=false&amp;show_reposts=false&amp;visual=false"
          >
          </iframe>
          {#if widgetStates[wordKey] === "loading"}
            <p class="text-sm text-gray-500 mt-1">Loading widget...</p>
          {:else if widgetStates[wordKey] === "error"}
            <p class="text-sm text-red-600 mt-1">
              Failed to load track. Please check the Audio ID/URL.
            </p>
          {:else if widgetStates[wordKey] === "ready"}
            <p class="text-sm text-green-600 mt-1">
              Widget loaded successfully.
            </p>
            {#if word.startAt}
              <button
                onclick={() => testStartTime(wordKey, word.startAt)}
                class="mt-2 text-sm bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded disabled:opacity-50"
                disabled={widgetStates[wordKey] !== "ready"}
                title="Seek to {word.startAt} and play"
              >
                Test Start Time ({word.startAt})
              </button>
            {/if}
          {/if}
        {:else}
          <p class="text-sm text-gray-500">No Audio URL provided.</p>
        {/if}
      </div>
    {/each}
  {/if}
</div>
