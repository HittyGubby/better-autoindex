<template>
  <!-- Modal mode -->
  <div v-if="content && !show" class="image-display-container">
    <div ref="panzoomContainer" class="panzoom-container">
      <img ref="imageRef" :src="content.src" :alt="content.filename" class="image-content" />
    </div>
  </div>
  
  <!-- Fullscreen viewer mode -->
  <div v-else-if="show" class="image-viewer-overlay" @click="closeViewer">
    <div class="image-viewer-content" @click.stop>
      <!-- Top bar with close button and image info -->
      <div class="viewer-header">
        <div class="header-info">
          <span class="image-name">{{ currentImage?.name || filename }}</span>
          <span class="image-info" v-if="currentImage">{{ currentImage.size }} | {{ currentImage.date }}</span>
        </div>
        <button class="close-btn" @click="closeViewer" title="Close">&times;</button>
      </div>

      <!-- Navigation controls -->
      <button class="nav-btn nav-prev" @click.stop="prevImage" :disabled="!hasPrev" title="Previous image">
        &lt;
      </button>
      <button class="nav-btn nav-next" @click.stop="nextImage" :disabled="!hasNext" title="Next image">
        &gt;
      </button>

      <!-- Image display container with panzoom functionality -->
      <div ref="panzoomContainer" class="panzoom-container">
        <img ref="imageRef" :src="src" :alt="filename" class="image-content" @load="handleImageLoad"
          @error="handleImageError" />
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Panzoom from '@panzoom/panzoom';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  src: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    default: ''
  },
  images: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  content: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'update:currentIndex']);

const panzoomContainer = ref(null);
const imageRef = ref(null);
const isLoading = ref(false);
let panzoomInstance = null;

// Get current image details from the images array
const currentImage = ref(null);

// Navigation logic
const hasPrev = ref(false);
const hasNext = ref(false);

const updateNavigation = () => {
  hasPrev.value = props.currentIndex > 0;
  hasNext.value = props.currentIndex < props.images.length - 1;
  currentImage.value = props.images[props.currentIndex] || null;
};

const prevImage = () => {
  if (hasPrev.value) {
    const newIndex = props.currentIndex - 1;
    emit('update:currentIndex', newIndex);
  }
};

const nextImage = () => {
  if (hasNext.value) {
    const newIndex = props.currentIndex + 1;
    emit('update:currentIndex', newIndex);
  }
};

const closeViewer = () => {
  emit('close');
};

const resetZoom = () => {
  if (panzoomInstance) {
    panzoomInstance.reset();
  }
};

// Keyboard navigation
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeViewer();
  } else if (event.key === 'ArrowLeft') {
    prevImage();
  } else if (event.key === 'ArrowRight') {
    nextImage();
  } else if (event.key === '0') {
    resetZoom();
  }
};

// Handle image load completion
const handleImageLoad = () => {
  isLoading.value = false;
  if (panzoomInstance) {
    // Reset panzoom after image loads
    setTimeout(() => {
      panzoomInstance.reset();
    }, 10);
  }
};

// Handle image error
const handleImageError = () => {
  isLoading.value = false;
};

onMounted(() => {
  updateNavigation();

  if (imageRef.value && panzoomContainer.value) {
    // Configure panzoom with mouse controls
    panzoomInstance = Panzoom(imageRef.value, {
      maxScale: 5,
      minScale: 0.1,
      contain: 'outside',
      cursor: 'grab',
      smoothScroll: false,
      zoomDoubleClickSpeed: 1,
      panOnlyWhenZoomed: false,
    });

    // Add zoom with wheel functionality - attach to parent container
    panzoomContainer.value.addEventListener('wheel', (e) => {
      if (panzoomInstance && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        panzoomInstance.zoomWithWheel(e);
      }
    });

    // Add zoom controls to panzoom container
    panzoomInstance.on('zoom', (e) => {
      // Update styles if needed
    });

    // Change cursor based on action
    panzoomInstance.on('panstart', () => {
      imageRef.value.style.cursor = 'grabbing';
    });

    panzoomInstance.on('panend', () => {
      imageRef.value.style.cursor = 'grab';
    });
  }

  // Only add keyboard navigation for fullscreen mode
  if (props.show) {
    document.addEventListener('keydown', handleKeydown);
  }
});

// Watch for changes in src and reset the panzoom if needed
watch(() => props.src, () => {
  if (imageRef.value) {
    // Show loading spinner when src changes
    isLoading.value = true;
    // Reset the image's load/error event handlers
    imageRef.value.onload = handleImageLoad;
    imageRef.value.onerror = handleImageError;
  }
});

// Watch for changes in currentIndex and update navigation
watch(() => props.currentIndex, () => {
  updateNavigation();
});

// Watch for changes in images array
watch(() => props.images, () => {
  updateNavigation();
});

onBeforeUnmount(() => {
  if (panzoomInstance) {
    panzoomInstance.destroy();
  }
  if (props.show) {
    document.removeEventListener('keydown', handleKeydown);
  }
});
</script>

<style scoped>
.image-display-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #000;
}

.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.image-viewer-content {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 10001;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.image-name {
  color: #fff;
  font-size: 1.2em;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-info {
  color: #aaa;
  font-size: 0.9em;
  margin-top: 3px;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5em;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 15px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 60px;
  height: 60px;
  font-size: 24px;
  cursor: pointer;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.8);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-prev {
  left: 20px;
}

.nav-next {
  right: 20px;
}

.panzoom-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.image-content {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: grab;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10002;
  background-color: rgba(0, 0, 0, 0.5);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 5px solid #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>