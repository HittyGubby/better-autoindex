<template>
  <div 
    v-if="store.state.audioPlayer.playlist.length > 0 || store.state.audioPlayer.currentTrack" 
    class="audio-player-widget"
    :style="{ left: `${store.state.audioPlayer.widgetPosition.x}px`, top: `${store.state.audioPlayer.widgetPosition.y}px` }"
    @mousedown="startDrag"
    @dragover.prevent
    @drop="handleExternalDrop"
  >
    <!-- Widget header with title and controls -->
    <div class="widget-header">
      <div class="current-track-info" v-if="store.state.audioPlayer.currentTrack">
        <div class="track-info-header">
          <span class="track-name">{{ store.state.audioPlayer.currentTrack.name }}</span>
          <div class="widget-controls">
            <button @click="togglePlaylist" class="playlist-toggle" :class="{ 'active': !store.state.audioPlayer.playlistCollapsed }">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar" @click="handleProgressClick">
            <div 
              class="progress-fill" 
              :style="{ width: `${(store.state.audioPlayer.currentTime / store.state.audioPlayer.duration * 100) || 0}%` }"
            ></div>
          </div>
          <span class="time">{{ formatTime(store.state.audioPlayer.currentTime) }} / {{ formatTime(store.state.audioPlayer.duration) }}</span>
        </div>
        <div class="controls">
          <button @click="prevTrack" class="control-btn" title="Previous">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            </svg>
          </button>
          <button @click="togglePlayPause" class="control-btn play-btn" title="Play/Pause">
            <svg v-if="!store.state.audioPlayer.isPlaying" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          </button>
          <button @click="nextTrack" class="control-btn" title="Next">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 19.5l7.5-7.5L5.25 5.5m6 15l7.5-7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        <!-- Volume and Speed controls -->
        <div class="extra-controls">
          <div class="volume-control">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="volume-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              :value="store.state.audioPlayer.volume"
              @input="handleVolumeChange"
              class="volume-slider"
            />
            <span class="volume-label">{{ Math.round(store.state.audioPlayer.volume * 100) }}%</span>
          </div>
          <div class="speed-control">
            <span class="speed-label">Speed:</span>
            <select :value="store.state.audioPlayer.playbackRate" @change="handleSpeedChange" class="speed-select">
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <span>No track playing</span>
        <div class="widget-controls">
          <button @click="togglePlaylist" class="playlist-toggle" :class="{ 'active': !store.state.audioPlayer.playlistCollapsed }">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Playlist -->
    <Transition name="playlist">
      <div v-if="!store.state.audioPlayer.playlistCollapsed" class="playlist-container">
        <div class="playlist-header">
          <span>Playlist ({{ store.state.audioPlayer.playlist.length }})</span>
          <button @click="clearPlaylist" class="clear-btn" title="Clear playlist">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
        <div class="drop-zone" v-if="store.state.audioPlayer.playlist.length === 0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0024 44.5h.003" />
          </svg>
          <span>Drag audio files here</span>
        </div>
        <div v-else class="playlist">
          <div 
            v-for="(track, index) in store.state.audioPlayer.playlist"
            :key="track.href"
            class="playlist-item"
            :class="{ 'playing': track.href === store.state.audioPlayer.currentTrack?.href, 'dragging': dragIndex === index }"
            @click="playTrack(index)"
            draggable="true"
            @dragstart="handleDragStart(index, $event)"
            @dragover="handleDragOver($event)"
            @drop="handleDrop(index, $event)"
            @dragend="handleDragEnd"
          >
            <div class="playlist-item-content">
              <span class="playlist-index">{{ index + 1 }}</span>
              <div class="track-info">
                <span class="track-name">{{ track.name }}</span>
                <span class="track-duration" v-if="track.duration">{{ formatTime(track.duration) }}</span>
              </div>
              <div class="track-actions">
                <button @click.stop="downloadTrack(track)" class="download-btn" title="Download">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
                <button @click.stop="removeFromPlaylist(index)" class="remove-btn" title="Remove">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Hidden audio element -->
    <audio 
      ref="audioRef"
      :src="store.state.audioPlayer.currentTrack?.href" 
      @timeupdate="onTimeUpdate"
      @ended="onTrackEnded"
      @loadedmetadata="onMetadataLoaded"
      @pause="onAudioPause"
      @play="onAudioPlay"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from '../stores/appStore.js';

const store = useStore();
const audioRef = ref(null);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

// Playlist drag and drop state
const dragIndex = ref(null);
const dropIndex = ref(null);

// Format time in seconds to MM:SS
const formatTime = (time) => {
  if (!time) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Drag functionality for widget position
const startDrag = (e) => {
  if (e.target.closest('.playlist-item') || 
      e.target.closest('.remove-btn') || 
      e.target.closest('.playlist-toggle') || 
      e.target.closest('.control-btn') ||
      e.target.closest('.progress-bar') ||
      e.target.closest('.clear-btn')) {
    return; // Don't drag when clicking on interactive elements
  }
  
  isDragging.value = true;
  const rect = e.currentTarget.getBoundingClientRect();
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  
  const x = e.clientX - dragOffset.value.x;
  const y = e.clientY - dragOffset.value.y;
  
  // Constrain to viewport
  const widgetWidth = 450;
  const widgetHeight = store.state.audioPlayer.playlistCollapsed ? 180 : 450;
  const maxX = window.innerWidth - widgetWidth;
  const maxY = window.innerHeight - widgetHeight;
  
  const constrainedX = Math.max(0, Math.min(x, maxX));
  const constrainedY = Math.max(0, Math.min(y, maxY));
  
  store.setWidgetPosition(constrainedX, constrainedY);
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};



// Handle external drag and drop
const handleExternalDrop = (event) => {
  event.preventDefault();
  const data = event.dataTransfer.getData('text/plain');
  if (data) {
    try {
      const trackData = JSON.parse(data);
      if (trackData.href && trackData.name) {
        store.addToPlaylist(trackData);
        // If this is the first track or if user wants to play it immediately
        if (!store.state.audioPlayer.currentTrack || store.state.audioPlayer.playlist.length === 1) {
          playTrack(store.state.audioPlayer.playlist.length - 1);
        }
      }
    } catch (e) {
      console.error('Error parsing dropped data:', e);
    }
  }
};

// Audio controls
const togglePlaylist = () => {
  store.togglePlaylist();
};

const togglePlayPause = () => {
  if (audioRef.value) {
    if (store.state.audioPlayer.isPlaying) {
      audioRef.value.pause();
      store.setPlaying(false);
    } else {
      audioRef.value.play().catch(e => console.error('Error playing audio:', e));
      store.setPlaying(true);
    }
  }
};

const prevTrack = () => {
  if (store.state.audioPlayer.playlist.length > 0) {
    const currentIndex = store.state.audioPlayer.playlist.findIndex(
      track => track.href === store.state.audioPlayer.currentTrack?.href
    );
    
    let newIndex;
    if (currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      // Loop to end
      newIndex = store.state.audioPlayer.playlist.length - 1;
    }
    
    if (newIndex >= 0) {
      playTrack(newIndex);
    }
  }
};

const nextTrack = () => {
  if (store.state.audioPlayer.playlist.length > 0) {
    const currentIndex = store.state.audioPlayer.playlist.findIndex(
      track => track.href === store.state.audioPlayer.currentTrack?.href
    );
    
    let newIndex;
    if (currentIndex < store.state.audioPlayer.playlist.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      // Loop to start
      newIndex = 0;
    }
    
    if (newIndex >= 0) {
      playTrack(newIndex);
    }
  }
};

const playTrack = (index) => {
  const track = store.state.audioPlayer.playlist[index];
  store.setCurrentTrack(track);
  
  // Wait for next tick to ensure the audio source is updated
  setTimeout(() => {
    if (audioRef.value) {
      audioRef.value.play().catch(e => console.error('Error playing audio:', e));
      store.setPlaying(true);
    }
  }, 0);
};

const removeFromPlaylist = (index) => {
  store.removeFromPlaylist(index);
  // If we're removing the currently playing track, stop playback
  if (store.state.audioPlayer.currentTrack?.href === store.state.audioPlayer.playlist[index]?.href) {
    if (audioRef.value) {
      audioRef.value.pause();
      store.setPlaying(false);
    }
    store.setCurrentTrack(null);
    
    // If there are still tracks in the playlist, play the next one
    if (store.state.audioPlayer.playlist.length > 0) {
      const nextIndex = Math.min(index, store.state.audioPlayer.playlist.length - 1);
      if (nextIndex >= 0) {
        playTrack(nextIndex);
      }
    }
  }
};

const clearPlaylist = () => {
  store.clearPlaylist();
  if (audioRef.value) {
    audioRef.value.pause();
  }
};

const downloadTrack = (track) => {
  const link = document.createElement('a');
  link.href = track.href;
  link.download = track.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleVolumeChange = (event) => {
  const volume = parseFloat(event.target.value);
  store.setVolume(volume);
  if (audioRef.value) {
    audioRef.value.volume = volume;
  }
};

const handleSpeedChange = (event) => {
  const speed = parseFloat(event.target.value);
  store.setPlaybackRate(speed);
  if (audioRef.value) {
    audioRef.value.playbackRate = speed;
  }
};

// Playlist drag and drop handlers
const handleDragStart = (index, event) => {
  dragIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', index);
};

const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

const handleDrop = (index, event) => {
  event.preventDefault();
  dropIndex.value = index;
  
  if (dragIndex.value !== null && dragIndex.value !== dropIndex.value) {
    // Reorder the playlist
    const playlist = [...store.state.audioPlayer.playlist];
    const draggedItem = playlist[dragIndex.value];
    
    // Remove the dragged item
    playlist.splice(dragIndex.value, 1);
    
    // Insert it at the new position
    const newIndex = dragIndex.value < dropIndex.value ? dropIndex.value - 1 : dropIndex.value;
    playlist.splice(newIndex, 0, draggedItem);
    
    // Update the playlist in the store
    store.reorderPlaylist(playlist);
    
    // Update the current track index if needed
    if (store.state.audioPlayer.currentTrack) {
      const currentTrackIndex = playlist.findIndex(
        track => track.href === store.state.audioPlayer.currentTrack.href
      );
      // The current track position will be updated automatically by the store
    }
  }
};

const handleDragEnd = () => {
  dragIndex.value = null;
  dropIndex.value = null;
};

const handleProgressClick = (event) => {
  if (audioRef.value && store.state.audioPlayer.duration > 0) {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (event.clientX - rect.left) / rect.width;
    const newTime = clickPosition * store.state.audioPlayer.duration;
    
    audioRef.value.currentTime = newTime;
    store.setAudioTime(newTime, store.state.audioPlayer.duration);
  }
};

const onTimeUpdate = () => {
  if (audioRef.value) {
    store.setAudioTime(audioRef.value.currentTime, audioRef.value.duration);
  }
};

const onTrackEnded = () => {
  // Play next track
  nextTrack();
};

const onMetadataLoaded = () => {
  if (audioRef.value) {
    store.setAudioTime(audioRef.value.currentTime, audioRef.value.duration);
  }
};

const onAudioPause = () => {
  store.setPlaying(false);
};

const onAudioPlay = () => {
  store.setPlaying(true);
};

// Watch for changes in current track to play/pause
watch(() => store.state.audioPlayer.currentTrack, (newTrack) => {
  if (newTrack && audioRef.value) {
    setTimeout(() => {
      audioRef.value.play().catch(e => console.error('Error playing audio:', e));
      store.setPlaying(true);
    }, 0);
  }
}, { immediate: true });

// Watch for play/pause state
watch(() => store.state.audioPlayer.isPlaying, (isPlaying) => {
  if (audioRef.value) {
    if (isPlaying) {
      audioRef.value.play().catch(e => console.error('Error playing audio:', e));
    } else {
      audioRef.value.pause();
    }
  }
});

// Watch for volume changes
watch(() => store.state.audioPlayer.volume, (volume) => {
  if (audioRef.value) {
    audioRef.value.volume = volume;
  }
});

// Watch for playback rate changes
watch(() => store.state.audioPlayer.playbackRate, (rate) => {
  if (audioRef.value) {
    audioRef.value.playbackRate = rate;
  }
});

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause();
  }
});
</script>

<style scoped>
.audio-player-widget {
  position: fixed;
  width: 450px;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid #444;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 9000; /* Lower than modal/image viewer */
  backdrop-filter: blur(20px);
  font-family: "Electrolize", sans-serif;
  user-select: none;
  transition: box-shadow 0.3s ease;
}

.audio-player-widget:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #444;
  cursor: move;
}

.current-track-info {
  flex: 1;
  min-width: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  font-size: 14px;
}

.track-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.track-name {
  font-size: 16px;
  color: #e0e0e0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #555;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: height 0.2s ease;
}

.progress-bar:hover {
  height: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #66bbff, #42a5f5);
  transition: width 0.1s ease;
  border-radius: 4px;
}

.time {
  font-size: 12px;
  color: #aaa;
  font-variant-numeric: tabular-nums;
  min-width: 80px;
}

.controls {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.extra-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding: 8px 0;
  border-top: 1px solid #444;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.volume-icon {
  width: 16px;
  height: 16px;
  color: #aaa;
}

.volume-slider {
  flex: 1;
  height: 4px;
  background: #555;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #66bbff;
  cursor: pointer;
  border-radius: 50%;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #66bbff;
  cursor: pointer;
  border-radius: 50%;
  border: none;
}

.volume-label {
  font-size: 11px;
  color: #aaa;
  min-width: 35px;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.speed-label {
  font-size: 12px;
  color: #aaa;
}

.speed-select {
  background: #444;
  border: 1px solid #666;
  color: #e0e0e0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.speed-select:hover {
  background: #555;
}

.control-btn {
  background: rgba(68, 68, 68, 0.8);
  border: 1px solid #666;
  color: #e0e0e0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(85, 85, 85, 0.9);
  transform: scale(1.05);
}

.control-btn.play-btn {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #66bbff, #42a5f5);
  border: none;
}

.control-btn.play-btn:hover {
  background: linear-gradient(135deg, #42a5f5, #1e88e5);
}

.control-btn svg {
  width: 18px;
  height: 18px;
}

.play-btn svg {
  width: 24px;
  height: 24px;
}

.widget-controls {
  display: flex;
  gap: 8px;
}

.playlist-toggle, .clear-btn {
  background: rgba(68, 68, 68, 0.8);
  border: 1px solid #555;
  color: #e0e0e0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.playlist-toggle:hover, .clear-btn:hover {
  background: rgba(85, 85, 85, 0.9);
}

.playlist-toggle.active {
  background: linear-gradient(135deg, #66bbff, #42a5f5);
  border-color: #42a5f5;
}

.playlist-toggle svg, .clear-btn svg {
  width: 16px;
  height: 16px;
}

.playlist-container {
  border-top: 1px solid #444;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  color: #e0e0e0;
  border-bottom: 1px solid #444;
}

.clear-btn {
  background: rgba(244, 67, 54, 0.2);
  border-color: #f44336;
  color: #f44336;
}

.clear-btn:hover {
  background: rgba(244, 67, 54, 0.3);
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #888;
  border: 2px dashed #555;
  border-radius: 8px;
  margin: 16px;
  transition: all 0.3s ease;
}

.drop-zone svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.playlist {
  max-height: 250px;
  overflow-y: auto;
  padding: 8px;
}

.playlist-item {
  margin-bottom: 6px;
  cursor: pointer; /* Indicate clickable */
  transition: all 0.2s ease;
  border-radius: 8px;
}

.playlist-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

.playlist-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.playlist-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.playlist-item.playing {
  background: linear-gradient(135deg, rgba(102, 187, 255, 0.1), rgba(66, 165, 245, 0.1));
  border: 1px solid rgba(102, 187, 255, 0.3);
}

.playlist-item-content {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  gap: 12px;
}

.playlist-index {
  width: 24px;
  color: #888;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-name {
  display: block;
  font-size: 14px;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.track-duration {
  font-size: 12px;
  color: #888;
}

.track-actions {
  display: flex;
  gap: 6px;
}

.download-btn {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4caf50;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s ease;
}

.playlist-item:hover .download-btn {
  opacity: 1;
}

.download-btn:hover {
  background: rgba(76, 175, 80, 0.3);
  transform: scale(1.1);
}

.download-btn svg {
  width: 14px;
  height: 14px;
}

.remove-btn {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s ease;
}

.playlist-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 0.3);
  transform: scale(1.1);
}

.remove-btn svg {
  width: 14px;
  height: 14px;
}



/* Playlist transition */
.playlist-enter-active,
.playlist-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.playlist-enter-from,
.playlist-leave-to {
  max-height: 0;
  opacity: 0;
}

.playlist-enter-to,
.playlist-leave-from {
  max-height: 400px;
  opacity: 1;
}

/* Custom scrollbar */
.playlist::-webkit-scrollbar {
  width: 6px;
}

.playlist::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.playlist::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.playlist::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>