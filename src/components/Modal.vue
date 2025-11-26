<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <div class="header-actions">
          <a v-if="downloadUrl" :href="downloadUrl" class="download-btn" title="Download file" target="_blank">↓</a>
          <button class="close-btn" @click="closeModal" title="Close">&times;</button>
        </div>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  downloadUrl: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #1e1e1e;
  border-radius: 8px;
  height: 90%;
  max-height: 90%;
  min-width: 70%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  min-height: 300px;
  /* Ensure minimum height for controls */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
  background-color: #252526;
  flex-shrink: 0;
  /* Prevent header from shrinking */
}

.modal-header h3 {
  margin: 0;
  color: #e0e0e0;
  font-size: 1.2em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.download-btn {
  background-color: #333;
  color: white;
  border: 1px solid #555;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.download-btn:hover {
  background-color: #444;
}

.close-btn {
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 1.5em;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

.close-btn:hover {
  background-color: #333;
  border-radius: 4px;
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  /* Ensure space for controls */
}
</style>