<template>
  <div class="container" v-if="fileData">
    <div class="title-bar">
      <a :href="'../'" class="go-back">&lt;</a>
      <div class="path-display">
        <span v-for="(pathPart, index) in pathParts" :key="index" class="path-part">
          <a v-if="index < pathParts.length" :href="getBreadcrumbPath(index)" class="path-link">{{ pathPart }}</a>
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
        <a :href="entry.href" class="entry-link" :class="getEntryClass(entry.name)">
          <span class="icon">
            <svg v-if="getEntryClass(entry.name) === 'folder'" width="20" height="20" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18.784 3.87a1.565 1.565 0 0 0-.565-.356V2.426c0-.648-.523-1.171-1.15-1.171H8.996L7.908.25A.89.89 0 0 0 7.302 0H2.094C1.445 0 .944.523.944 1.171v2.3c-.21.085-.398.21-.565.356a1.348 1.348 0 0 0-.377 1.004l.398 9.83C.42 15.393 1.048 16 1.8 16h15.583c.753 0 1.36-.586 1.4-1.339l.398-9.83c.021-.313-.125-.69-.397-.962zM1.843 3.41V1.191c0-.146.104-.272.25-.272H7.26l1.234 1.088c.083.042.167.104.293.104h8.282c.125 0 .25.126.25.272V3.41H1.844zm15.54 11.712H1.78a.47.47 0 0 1-.481-.46l-.397-9.83c0-.147.041-.252.125-.356a.504.504 0 0 1 .377-.147H17.78c.125 0 .272.063.377.147.083.083.125.209.125.334l-.418 9.83c-.021.272-.23.482-.481.482z"
                fill="white" />
            </svg>
            <img v-else-if="getEntryClass(entry.name) === 'img'" :src="entry.href" class="img-thumbnail" />
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
          <span class="name">{{ entry.name.endsWith('/') ? entry.name.slice(0, -1) : entry.name }}</span>
        </a>
        <div class="size-col">{{ entry.size }}</div>
        <div class="date-col">{{ entry.date }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { ExtractInfo } from './utils/onload.js';

// Reactive data
const fileData = ref(null);
const sortConfig = ref({
  key: 'name',
  direction: 'asc'
});

// Extract and process data on component mount
onMounted(() => {
  fileData.value = ExtractInfo();
});

// Computed properties
const pathParts = computed(() => {
  if (!fileData.value || !fileData.value.currentPathArray) {
    return ['Home'];
  }

  const parts = ['Home', ...fileData.value.currentPathArray];
  return parts;
});

const getBreadcrumbPath = (index) => {
  if (index === 0) return '/'; // Home

  const pathParts = fileData.value?.currentPathArray || [];
  const pathToIndex = pathParts.slice(0, index);
  return '/' + pathToIndex.join('/') + (pathToIndex.length > 0 ? '/' : '');
};

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
  if (['gif', 'jpg', 'png', 'svg', 'jpeg', 'bmp'].includes(suffix)) return 'img';
  if (['java', 'js', 'ts', 'go', 'c', 'cpp', 'cs', 'py', 'sh', 'swift', 'php', 'html', 'css', 'xml', 'json', 'yml', 'yaml', 'md', 'log', 'ini', 'conf', 'properties', 'cmd', 'bat', 'exe', 'dll', 'so'].includes(suffix)) return 'lambda';
  return 'file';
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
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Electrolize&display=swap');

body {
  background-color: #121212;
  color: #e0e0e0;
  font-family: "Electrolize", sans-serif;
  margin: 0;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.title-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 1.4em;
  font-weight: 600;
  color: #ddd;
  margin: 30px 10px 20px;
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

.yq-row>.size-col,
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
  display: flex;
  align-items: center;
  background: rgb(56, 56, 56);
  outline: 1px solid #a7a7a7;
  height: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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
  width: 24px;
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
</style>