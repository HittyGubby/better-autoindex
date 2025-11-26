<template>
  <div class="media-display-container">
    <video v-if="mediaType === 'video'" ref="videoPlayerRef"
      :data-plyr-provider="mediaType === 'youtube' || mediaType === 'vimeo' ? mediaType : undefined"
      :data-plyr-embed-id="mediaType === 'youtube' || mediaType === 'vimeo' ? src.split('/').pop() : undefined"
      :src="mediaType === 'youtube' || mediaType === 'vimeo' ? undefined : src" :poster="poster || undefined"
      playsinline class="media-element video-element"></video>
    <audio v-else-if="mediaType === 'audio'" ref="audioPlayerRef" :src="src" playsinline class="media-element audio-element"></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: 'auto' // 'auto', 'video', 'audio', 'youtube', 'vimeo'
  }
});

const videoPlayerRef = ref(null);
const audioPlayerRef = ref(null);
let videoPlayer = null;
let audioPlayer = null;

// Determine media type
const mediaType = ref('file');

// Function to determine media type
const determineMediaType = () => {
  if (props.type !== 'auto') {
    mediaType.value = props.type;
  } else {
    // Auto-detect from URL
    if (props.src.includes('youtube.com') || props.src.includes('youtu.be')) {
      mediaType.value = 'youtube';
    } else if (props.src.includes('vimeo.com')) {
      mediaType.value = 'vimeo';
    } else {
      // Detect from file extension
      const ext = props.src.split('.').pop().toLowerCase();
      const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'm4v', 'm3u8'];
      const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'opus', 'oga'];

      if (videoExts.includes(ext)) {
        mediaType.value = 'video';
      } else if (audioExts.includes(ext)) {
        mediaType.value = 'audio';
      } else {
        // Default to audio if we can't determine (to prevent redirect)
        mediaType.value = 'audio';
      }
    }
  }
};

// Initialize Plyr player
const initializePlayer = async (playerElement, isVideo) => {
  if (!playerElement) return null;
  
  // Initialize Plyr with dark theme
  const player = new Plyr(playerElement, {
    theme: 'dark', // Dark theme
    invertTime: false,
    resetOnEnd: false,
    hideControls: false,
    controls: isVideo ? [
      'play-large', // The large play button in the center
      'play', // Play/pause playback
      'progress', // The progress bar and scrubber for playback and buffering
      'current-time', // The current time of playback
      'duration', // The full duration of the media
      'mute', // Toggle mute
      'volume', // Volume control
      'captions', // Toggle captions
      'settings', // Settings menu
      'fullscreen' // Toggle fullscreen
    ] : [
      'play-large',
      'play',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'download'
    ],
    i18n: {
      restart: 'Restart',
      rewind: 'Rewind {seektime}s',
      play: 'Play',
      pause: 'Pause',
      fastForward: 'Forward {seektime}s',
      seek: 'Seek',
      played: 'Played',
      buffered: 'Buffered',
      currentTime: 'Current time',
      duration: 'Duration',
      volume: 'Volume',
      mute: 'Mute',
      unmute: 'Unmute',
      enableCaptions: 'Enable captions',
      disableCaptions: 'Disable captions',
      download: 'Download',
      fullscreen: 'Fullscreen',
      pip: 'PIP',
      airplay: 'AirPlay',
      settings: 'Settings',
      speed: 'Speed',
      normal: 'Normal',
      quality: 'Quality',
      loop: 'Loop',
      start: 'Start',
      end: 'End',
      all: 'All',
      reset: 'Reset',
      disabled: 'Disabled',
      advertisement: 'Ad',
    }
  });

  // Set the source after creating the player
  const sourceType = isVideo ? 'video' : 'audio';
  player.source = {
    type: sourceType,
    sources: [{
      src: props.src
    }]
  };

  return player;
};

onMounted(async () => {
  // Determine media type initially
  determineMediaType();

  // Wait for next tick to ensure DOM is updated
  await nextTick();

  if (videoPlayerRef.value && mediaType.value === 'video') {
    videoPlayer = await initializePlayer(videoPlayerRef.value, true);
  } else if (audioPlayerRef.value && mediaType.value === 'audio') {
    audioPlayer = await initializePlayer(audioPlayerRef.value, false);
  }
});

// Watch for changes in src and update the player
watch(() => props.src, async (newSrc) => {
  if (!newSrc) return;

  determineMediaType();

  // Wait for next tick to ensure DOM updates
  await nextTick();

  // Destroy existing players
  if (videoPlayer) {
    videoPlayer.destroy();
    videoPlayer = null;
  }
  if (audioPlayer) {
    audioPlayer.destroy();
    audioPlayer = null;
  }

  // Reinitialize the appropriate player
  if (videoPlayerRef.value && mediaType.value === 'video') {
    videoPlayer = await initializePlayer(videoPlayerRef.value, true);
  } else if (audioPlayerRef.value && mediaType.value === 'audio') {
    audioPlayer = await initializePlayer(audioPlayerRef.value, false);
  }
}, { immediate: true });

onBeforeUnmount(() => {
  if (videoPlayer) {
    videoPlayer.destroy();
  }
  if (audioPlayer) {
    audioPlayer.destroy();
  }
});
</script>

<style scoped>
.media-display-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #000;
  position: relative;
}

.media-element {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* Ensure video content fits without overflow */
  flex-shrink: 0;
}

.video-element {
  object-fit: contain;
}

.audio-element {
  width: 100%;
  /* For audio, we want it to be centered and not take up full height */
  max-width: 800px;
  margin: auto;
  padding: 20px;
}
</style>