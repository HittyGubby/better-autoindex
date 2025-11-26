import { reactive, watch } from 'vue';

// Initialize state from localStorage or defaults
const loadState = () => {
  try {
    const stored = localStorage.getItem('betterAutoIndexState');
    return stored ? JSON.parse(stored) : {
      audioPlayer: {
        currentTrack: null,
        playlist: [],
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        playbackRate: 1,
        widgetPosition: { x: 20, y: 20 },
        isPlaylistVisible: false,
        playlistCollapsed: true
      }
    };
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
    return {
      audioPlayer: {
        currentTrack: null,
        playlist: [],
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        playbackRate: 1,
        widgetPosition: { x: 20, y: 20 },
        isPlaylistVisible: false,
        playlistCollapsed: true
      }
    };
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    localStorage.setItem('betterAutoIndexState', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
};

// Create reactive state
const state = reactive(loadState());

// Watch for changes and save to localStorage
watch(state, (newState) => {
  saveState(newState);
}, { deep: true });

// Export methods to interact with the store
export const useStore = () => {
  return {
    state,
    togglePlaylist: () => {
      state.audioPlayer.playlistCollapsed = !state.audioPlayer.playlistCollapsed;
    },
    addToPlaylist: (track) => {
      // Check if track is already in playlist
      const exists = state.audioPlayer.playlist.some(item => item.href === track.href);
      if (!exists) {
        state.audioPlayer.playlist.push(track);
      }
    },
    removeFromPlaylist: (index) => {
      state.audioPlayer.playlist.splice(index, 1);
    },
    setCurrentTrack: (track) => {
      state.audioPlayer.currentTrack = track;
    },
    setPlaying: (isPlaying) => {
      state.audioPlayer.isPlaying = isPlaying;
    },
    setAudioTime: (currentTime, duration) => {
      state.audioPlayer.currentTime = currentTime;
      state.audioPlayer.duration = duration;
    },
    setVolume: (volume) => {
      state.audioPlayer.volume = volume;
    },
    setPlaybackRate: (rate) => {
      state.audioPlayer.playbackRate = rate;
    },
    setWidgetPosition: (x, y) => {
      state.audioPlayer.widgetPosition = { x, y };
    },
    setPlaylistVisible: (visible) => {
      state.audioPlayer.isPlaylistVisible = visible;
    },
    clearPlaylist: () => {
      state.audioPlayer.playlist = [];
      state.audioPlayer.currentTrack = null;
      state.audioPlayer.isPlaying = false;
      state.audioPlayer.currentTime = 0;
      state.audioPlayer.duration = 0;
    },
    reorderPlaylist: (newPlaylist) => {
      state.audioPlayer.playlist = newPlaylist;
    }
  };
};