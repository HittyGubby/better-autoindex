<template>
  <div class="container" v-if="fileData">
    <div class="title-bar">
      <a href="#" @click.prevent="goBack" class="go-back">&lt;</a>
      <div class="path-display">
        <span v-for="(pathPart, index) in pathParts" :key="index" class="path-part">
          <a v-if="index < pathParts.length" href="#" @click.prevent="goToPath(index)" class="path-link">{{ pathPart
          }}</a>
          <span v-else class="current-path">{{ pathPart }}</span>
          <span v-if="index < pathParts.length - 1" class="path-separator"> > </span>
        </span>
      </div>
    </div>

    <div class="yq-outer-box">
      <!-- Header row with sorting -->
      <div class="yq-header">
        <div class="sortable" @click="sortEntries('name')"
          :class="{ 'sorted-asc': sortConfig.key === 'name' && sortConfig.direction === 'asc', 'sorted-desc': sortConfig.key === 'name' && sortConfig.direction === 'desc' }">
          Name
        </div>
        <div class="sortable size-col" @click="sortEntries('size')"
          :class="{ 'sorted-asc': sortConfig.key === 'size' && sortConfig.direction === 'asc', 'sorted-desc': sortConfig.key === 'size' && sortConfig.direction === 'desc' }">
          Size
        </div>
        <div class="sortable date-col" @click="sortEntries('date')"
          :class="{ 'sorted-asc': sortConfig.key === 'date' && sortConfig.direction === 'asc', 'sorted-desc': sortConfig.key === 'date' && sortConfig.direction === 'desc' }">
          Last Modified
        </div>
      </div>

      <!-- File/folder rows -->
      <div v-for="entry in sortedEntries" :key="entry.href" class="yq-row">
        <a href="#" @click.prevent="handleEntryClick(entry)" @dragstart="handleDragStart(entry, $event)"
          :draggable="!entry.isDirectory && isAudioFile(entry.name)" class="entry-link"
          :class="[getEntryClass(entry.name), { 'draggable-audio': !entry.isDirectory && isAudioFile(entry.name) }]">
          <span class="icon">
            <svg v-if="getEntryClass(entry.name) === 'folder'" width="20" height="20" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18.784 3.87a1.565 1.565 0 0 0-.565-.356V2.426c0-.648-.523-1.171-1.15-1.171H8.996L7.908.25A.89.89 0 0 0 7.302 0H2.094C1.445 0 .944.523.944 1.171v2.3c-.21.085-.398.21-.565.356a1.348 1.348 0 0 0-.377 1.004l.398 9.83C.42 15.393 1.048 16 1.8 16h15.583c.753 0 1.36-.586 1.4-1.339l.398-9.83c.021-.313-.125-.69-.397-.962zM1.843 3.41V1.191c0-.146.104-.272.25-.272H7.26l1.234 1.088c.083.042.167.104.293.104h8.282c.125 0 .25.126.25.272V3.41H1.844zm15.54 11.712H1.78a.47.47 0 0 1-.481-.46l-.397-9.83c0-.147.041-.252.125-.356a.504.504 0 0 1 .377-.147H17.78c.125 0 .272.063.377.147.083.083.125.209.125.334l-.418 9.83c-.021.272-.23.482-.481.482z"
                fill="white" />
            </svg>
            <img v-else-if="getEntryClass(entry.name) === 'img'" :src="entry.href" class="img-thumbnail" />
            <svg v-else-if="getEntryClass(entry.name) === 'audio'" width="20" height="20" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                fill="white" />
            </svg>
            <svg v-else-if="getEntryClass(entry.name) === 'lambda'" width="20" height="20" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3.5 14.4354H5.31622L7.30541 9.81311H7.43514L8.65315 13.0797C9.05676 14.1643 9.55405 14.5 10.7 14.5C11.0171 14.5 11.291 14.4677 11.5 14.4032V13.1572C11.3847 13.1766 11.2622 13.2024 11.1541 13.2024C10.6351 13.2024 10.3829 13.0281 10.1595 12.4664L8.02613 7.07586C7.21171 5.01646 6.54865 4.5 5.11441 4.5C4.83333 4.5 4.62432 4.53228 4.37207 4.59038V5.83635C4.56667 5.81052 4.66036 5.79761 4.77568 5.79761C5.64775 5.79761 5.9 6.0042 6.4045 7.19852L6.64234 7.77954L3.5 14.4354Z"
                fill="white" />
              <rect x="0.5" y="0.5" width="14" height="18" rx="2.5" ry="2.5" stroke="white" />
            </svg>
            <svg v-else width="15" height="19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 8C8.34 8 7 6.66 7 5V1H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V8h-4zM8 5c0 1.1.9 2 2 2h3.59L8 1.41V5zM3 0h5l7 7v9c0 1.66-1.34 3-3 3H3c-1.66 0-3-1.34-3-3V3c0-1.66 1.34-3 3-3z"
                fill="white" />
            </svg>
          </span>
          <span class="name">{{ getDisplayName(entry) }}</span>
        </a>
        <div class="size-col">{{ entry.size }}</div>
        <div class="date-col">{{ entry.date }}</div>
      </div>
    </div>

    <Modal :show="showModal" :title="modalTitle" :download-url="modalSrc" @close="closeModal">
      <component :is="currentComponent" v-if="currentComponent" :key="modalSrc" :content="modalContent" :src="modalSrc"
        :filename="modalFilename" />
    </Modal>

    <ImageViewer :show="showImageViewer" :src="imageViewerSrc" :filename="imageViewerFilename"
      :images="imageViewerImages" :current-index="imageViewerCurrentIndex" @close="closeImageViewer"
      @update:current-index="updateImageIndex" />

    <AudioPlayerWidget />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, shallowRef } from 'vue';
import { ExtractInfo, parseHTMLEntries, formatDate, formatSize } from './utils/onload.js';
import { FILE_CATEGORIES, TEXT_FILE_CONTENT_TYPES } from './constants/fileTypes.js';
import Modal from './components/Modal.vue';
import TextDisplay from './components/TextDisplay.vue';
import MediaDisplay from './components/MediaDisplay.vue';
import ImageViewer from './components/ImageViewer.vue';
import AudioPlayerWidget from './components/AudioPlayerWidget.vue';

// Reactive data
const fileData = ref(null);
const sortConfig = ref({
  key: 'name',
  direction: 'asc'
});

// Modal state
const showModal = ref(false);
const modalTitle = ref('');
const currentComponent = shallowRef(null);
const modalContent = ref('');
const modalSrc = ref('');
const modalFilename = ref('');

// Image Viewer state
const showImageViewer = ref(false);
const imageViewerSrc = ref('');
const imageViewerFilename = ref('');
const imageViewerImages = ref([]);
const imageViewerCurrentIndex = ref(0);

// Extract and process data on component mount
onMounted(async () => {
  fileData.value = ExtractInfo();
  // Set up history API handling
  window.addEventListener('popstate', handlePopState);
});

// Handle browser back/forward buttons
const handlePopState = async (event) => {
  if (event.state && event.state.path) {
    await loadPath(event.state.path);
  }
};

// Computed properties
const pathParts = computed(() => {
  if (!fileData.value || !fileData.value.currentPathArray) {
    return ['Home'];
  }

  const parts = ['Home', ...fileData.value.currentPathArray];
  return parts;
});

const sortedEntries = computed(() => {
  if (!fileData.value || !fileData.value.entries) return [];

  const entries = [...fileData.value.entries];

  // Sort by directory first (folders first)
  entries.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    // If both are directories or both are files, sort by the selected key
    let valA, valB;

    switch (sortConfig.value.key) {
      case 'name':
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case 'size':
        valA = parseSize(a.rawSize || '0');
        valB = parseSize(b.rawSize || '0');
        break;
      case 'date':
        valA = new Date(a.rawDate).getTime();
        valB = new Date(b.rawDate).getTime();
        break;
      default:
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
    }

    if (sortConfig.value.direction === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });

  return entries;
});

// Helper functions
const getEntryClass = (name) => {
  if (!name) return 'file';
  // Check if it ends with '/' to identify folders
  if (name.endsWith('/')) return 'folder';
  const suffix = name.split('.').pop().toLowerCase();
  // Check audio files first to ensure they get the audio icon
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'oga', 'wma'].includes(suffix)) return 'audio';
  if (['gif', 'jpg', 'png', 'svg', 'jpeg', 'bmp', 'webp'].includes(suffix)) return 'img';
  if (['java', 'js', 'ts', 'go', 'c', 'cpp', 'cs', 'py', 'sh', 'swift', 'php', 'html', 'css', 'xml', 'json', 'yml', 'yaml', 'md', 'log', 'ini', 'conf', 'properties', 'cmd', 'bat', 'exe', 'dll', 'so'].includes(suffix)) return 'lambda';
  return 'file';
};

const isAudioFile = (name) => {
  if (!name) return false;
  const suffix = name.split('.').pop().toLowerCase();
  return ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'oga', 'wma'].includes(suffix);
};

const handleDragStart = (entry, event) => {
  if (!entry.isDirectory && isAudioFile(entry.name)) {
    // Convert relative href to absolute URL
    let audioHref = entry.href;
    if (!audioHref.startsWith('http')) {
      const currentPath = location.pathname;
      if (audioHref.startsWith('/')) {
        // Already absolute path
        audioHref = audioHref;
      } else {
        // Relative path, resolve it relative to current path
        if (currentPath.endsWith('/')) {
          audioHref = currentPath + audioHref;
        } else {
          audioHref = currentPath + '/' + audioHref;
        }
      }
      // Normalize the path
      audioHref = audioHref.replace(/\/+/g, '/');
    }
    
    const trackData = {
      href: audioHref,
      name: getDisplayName(entry),
      size: entry.size,
      date: entry.date
    };
    event.dataTransfer.setData('text/plain', JSON.stringify(trackData));
    event.dataTransfer.effectAllowed = 'copy';
  } else {
    event.preventDefault();
  }
};

const parseSize = (sizeStr) => {
  if (sizeStr === '-' || sizeStr === '') return 0;
  const units = { B: 1024 ** 0, KB: 1024 ** 1, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
  const [num, unit] = sizeStr.split(' ');
  return parseFloat(num) * (units[unit] || 1);
};

const sortEntries = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = 'asc';
  }
};

// Navigation functions
const goBack = () => {
  const currentPath = location.pathname;
  const pathParts = currentPath.split('/').filter(p => p);
  if (pathParts.length > 0) {
    pathParts.pop(); // Remove last part to go up one level
    const newPath = pathParts.length > 0 ? '/' + pathParts.join('/') + '/' : '/';
    navigateToPath(newPath);
  }
};

const goToPath = (index) => {
  if (index === 0) {
    navigateToPath('/');
  } else {
    const pathParts = fileData.value?.currentPathArray || [];
    const pathToIndex = pathParts.slice(0, index);
    const newPath = '/' + pathToIndex.join('/') + '/';
    navigateToPath(newPath);
  }
};

// Main navigation function
const navigateToPath = async (path) => {
  // Update browser history
  history.pushState({ path }, '', path);

  // Load the new path
  await loadPath(path);
};

// Load path content
const loadPath = async (path) => {
  try {
    // Fetch the raw server response
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load path: ${path}`);
    }

    const htmlText = await response.text();

    // Use the shared parsing function from onload.js
    const parsedData = parseHTMLEntries(htmlText);

    // Update fileData with new content
    fileData.value = {
      currentPath: parsedData.currentPath,
      currentPathArray: parsedData.currentPathArray,
      entries: parsedData.entries
    };

    // Update the document title
    document.title = `Index of ${parsedData.currentPath}`;
  } catch (error) {
    console.error('Error loading path:', error);
    alert(`Error loading path: ${error.message}`);
    // Revert the URL to the previous state to prevent mismatch
    history.back();
  }
};

// Handle entry click (file or folder)
const handleEntryClick = async (entry) => {
  if (entry.isDirectory) {
    // Handle folder navigation without page reload
    // Convert relative path to absolute path
    const currentPath = location.pathname;
    let newPath;
    if (entry.href.startsWith('/')) {
      // Already absolute path
      newPath = entry.href;
    } else {
      // Relative path, resolve it relative to current path
      if (currentPath.endsWith('/')) {
        newPath = currentPath + entry.href;
      } else {
        newPath = currentPath + '/' + entry.href;
      }
    }
    // Normalize the path to avoid double slashes or duplicates
    const normalizedPath = newPath.replace(/\/+/g, '/').replace(/\/$/, '') + '/';
    await navigateToPath(normalizedPath);
  } else {
    // Determine file type to decide how to handle it
    const hrefFilename = entry.href.split('/').pop();
    const filename = decodeURIComponent(hrefFilename);
    const extension = filename.split('.').pop().toLowerCase();

    // Audio files - add to playlist and play
    const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'oga', 'wma'];
    if (audioExts.includes(extension)) {
      // Convert relative href to absolute URL
      let audioHref = entry.href;
      if (!audioHref.startsWith('http')) {
        const currentPath = location.pathname;
        if (audioHref.startsWith('/')) {
          // Already absolute path
          audioHref = audioHref;
        } else {
          // Relative path, resolve it relative to current path
          if (currentPath.endsWith('/')) {
            audioHref = currentPath + audioHref;
          } else {
            audioHref = currentPath + '/' + audioHref;
          }
        }
        // Normalize the path
        audioHref = audioHref.replace(/\/+/g, '/');
      }
      
      const trackData = {
        href: audioHref,
        name: getDisplayName(entry),
        size: entry.size,
        date: entry.date
      };

      // Import store dynamically to avoid circular dependency
      const { useStore } = await import('./stores/appStore.js');
      const store = useStore();

      store.addToPlaylist(trackData);
      // Play the track immediately
      const trackIndex = store.state.audioPlayer.playlist.findIndex(
        track => track.href === trackData.href
      );
      if (trackIndex >= 0) {
        // This will be handled by the AudioPlayerWidget component
        store.setCurrentTrack(trackData);
      }
    }
    // Image files should be opened in the image viewer
    else if (['gif', 'jpg', 'jpeg', 'png', 'svg', 'bmp', 'webp'].includes(extension)) {
      // Show the image in the image viewer
      await showImageInViewer(entry);
    } else {
      // Handle other file types in modal
      await showFileContent(entry);
    }
  }
};

// Show image in image viewer popup
const showImageInViewer = async (entry) => {
  try {
    // Extract filename from href to avoid truncation issues
    const hrefFilename = entry.href.split('/').pop();
    const filename = decodeURIComponent(hrefFilename);

    // Get all images in the current directory for navigation
    const currentImages = fileData.value?.entries?.filter(item => {
      const itemExtension = item.href.split('.').pop().toLowerCase();
      const imgExts = ['gif', 'jpg', 'jpeg', 'png', 'svg', 'bmp', 'webp'];
      return imgExts.includes(itemExtension);
    }) || [];

    // Find the current index of the clicked image
    const currentIndex = currentImages.findIndex(img => img.href === entry.href);

    // Set the image viewer data
    imageViewerSrc.value = entry.href;
    imageViewerFilename.value = filename;
    imageViewerImages.value = currentImages;
    imageViewerCurrentIndex.value = currentIndex;

    // Show the image viewer
    showImageViewer.value = true;
  } catch (error) {
    console.error('Error loading image:', error);
    alert(`Error loading image: ${error.message}`);
  }
};

// Detect if a file is a text file by checking content-type or trying to read it
const isTextFile = async (url) => {
  try {
    // First, try to get the content-type header
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');

    if (contentType) {
      // Check if content type indicates a text file
      for (const textType of TEXT_FILE_CONTENT_TYPES) {
        if (contentType.includes(textType)) {
          return true;
        }
      }
    }

    // If we can't determine from headers, try to fetch a small portion
    // and check if it looks like text
    const fullResponse = await fetch(url);
    const content = await fullResponse.text();

    // Check if the content looks like text by checking for binary indicators
    // If the content is mostly printable ASCII, it's likely a text file
    const textRatio = content.split('').filter(char =>
      (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) ||
      char === '\n' || char === '\r' || char === '\t'
    ).length / content.length;

    return textRatio > 0.8; // If 80%+ of characters are printable, treat as text
  } catch (error) {
    console.error('Error detecting file type:', error);
    return false;
  }
};

// Show file content in modal
const showFileContent = async (entry) => {
  try {
    // Extract filename from href to avoid truncation issues
    const hrefFilename = entry.href.split('/').pop();
    const filename = decodeURIComponent(hrefFilename);
    const extension = filename.split('.').pop().toLowerCase() || null;

    modalTitle.value = filename;
    modalFilename.value = filename;
    modalSrc.value = entry.href;

    // Determine content type and show appropriate component using constants
    if (FILE_CATEGORIES.TEXT.includes(extension)) {
      // Load text content for editor
      const response = await fetch(entry.href);
      const content = await response.text();
      modalContent.value = content;
      currentComponent.value = TextDisplay;
    } else if (FILE_CATEGORIES.IMAGE.includes(extension)) {
      // Image viewer
      modalContent.value = { src: entry.href, filename: getDisplayName(entry) };
      currentComponent.value = ImageViewer;
    } else if (FILE_CATEGORIES.VIDEO.includes(extension)) {
      // Video player
      modalContent.value = null;
      currentComponent.value = MediaDisplay;
    } else if (FILE_CATEGORIES.AUDIO.includes(extension)) {
      // Audio player
      modalContent.value = null;
      currentComponent.value = MediaDisplay;
    } else {
      // For files outside existing categories, detect if it's a text file
      const isText = await isTextFile(entry.href);

      if (isText) {
        // Load text content for editor
        const response = await fetch(entry.href);
        const content = await response.text();
        modalContent.value = content;
        currentComponent.value = TextDisplay;
      } else {
        // For non-text files, trigger download
        const link = document.createElement('a');
        link.href = entry.href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
    }

    showModal.value = true;
  } catch (error) {
    console.error('Error loading file content:', error);
    alert(`Error loading file: ${error.message}`);
  }
};

// Helper function to get display name from href
const getDisplayName = (entry) => {
  // Extract the filename from the href and URL decode it
  const href = entry.href;
  let filename = href.split('/').pop();

  // If it's a folder, it ends with '/', so we remove it for display
  if (entry.isDirectory && filename === '') {
    // If the last part is empty, get the second-to-last part
    const parts = href.split('/').filter(p => p);
    filename = parts.length > 0 ? parts[parts.length - 1] : entry.name;
  }

  // URL decode the filename
  filename = decodeURIComponent(filename);

  // Remove trailing slash if present (for directories)
  if (filename.endsWith('/') && entry.isDirectory) {
    filename = filename.slice(0, -1);
  }

  return filename;
};



// Modal control
const closeModal = () => {
  showModal.value = false;
  currentComponent.value = null;
  modalContent.value = '';
  modalSrc.value = '';
  modalTitle.value = '';
  modalFilename.value = '';
};

// Image Viewer control
const closeImageViewer = () => {
  showImageViewer.value = false;
  imageViewerSrc.value = '';
  imageViewerFilename.value = '';
  imageViewerImages.value = [];
  imageViewerCurrentIndex.value = 0;
};

const updateImageIndex = (newIndex) => {
  if (newIndex >= 0 && newIndex < imageViewerImages.value.length) {
    imageViewerCurrentIndex.value = newIndex;
    // Update the current image source
    const newEntry = imageViewerImages.value[newIndex];
    if (newEntry) {
      imageViewerSrc.value = newEntry.href;
      const hrefFilename = newEntry.href.split('/').pop();
      imageViewerFilename.value = decodeURIComponent(hrefFilename);
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Electrolize&display=swap');

body {
  background-color: #121212;
  color: #e0e0e0;
  font-family: "Electrolize", sans-serif;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 80px;
  /* Space for fixed header */
}

.title-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 1.4em;
  font-weight: 600;
  color: #ddd;
  padding: 20px;
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #333;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.go-back {
  text-decoration: none;
  background: #444;
  padding: 6px 12px;
  border-radius: 8px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: background 0.3s ease;
}

.go-back:hover {
  background: #666;
}

.path-display {
  color: #aaa;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.path-part {
  display: inline-flex;
  align-items: center;
}

.path-link {
  color: #66bbff;
  text-decoration: none;
}

.path-link:hover {
  text-decoration: underline;
}

.current-path {
  color: #ddd;
}

.path-separator {
  margin: 0 5px;
  color: #999;
}

.sortable {
  cursor: pointer;
  position: relative;
}

.sortable::after {
  content: ' ⬍';
  font-size: 0.8em;
  opacity: 0.6;
}

.sortable.sorted-asc::after {
  content: ' ↑';
}

.sortable.sorted-desc::after {
  content: ' ↓';
}

.yq-outer-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeIn 1s ease;
}

.yq-row {
  display: flex;
  align-items: center;
  background: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.yq-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.7);
}

.yq-row>* {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.yq-row> :first-child {
  flex: 1;
  text-align: left;
}

.yq-row>.size-col {
  flex: 0 0 100px;
  /* Fixed width for size and date columns */
  text-align: right;
  font-variant-numeric: tabular-nums;
  /* Ensures consistent number width */
}

.yq-row>.date-col {
  flex: 0 0 150px;
  /* Fixed width for size and date columns */
  text-align: right;
  font-variant-numeric: tabular-nums;
  /* Ensures consistent number width */
}

.entry-link {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
  min-width: 0;
  color: #e1e1e1;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  text-shadow: 0 0 3px #2196f3;
}

.entry-link:hover {
  text-decoration: underline;
  color: #bbdefb;
}

.size-col,
.date-col {
  font-size: 0.9rem;
  color: #ccc;
  text-shadow: 0 0 2px #666;
}

.yq-header {
  position: sticky;
  top: 80px;
  /* Below the fixed title bar */
  display: flex;
  align-items: center;
  background: rgba(56, 56, 56, 0.95);
  outline: 1px solid #a7a7a7;
  height: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(10px);
  z-index: 999;
  margin: 10px;
}

.yq-header>* {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #ccc;
  text-shadow: 0 0 2px #666;
}

.yq-header> :first-child {
  flex: 1;
  text-align: left;
}

.yq-header>.size-col,
.yq-header>.date-col {
  flex: 0 0 150px;
  /* Fixed width for size and date columns */
  text-align: right;
  font-variant-numeric: tabular-nums;
  /* Ensures consistent number width */
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.img-thumbnail {
  height: 20px;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.draggable-audio {
  cursor: grab;
}

.draggable-audio:hover {
  background: rgba(102, 187, 255, 0.1);
}

.draggable-audio:active {
  cursor: grabbing;
}

.draggable-audio .icon svg {
  color: #66bbff;
}
</style>