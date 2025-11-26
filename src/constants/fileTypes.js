// File extension categories
export const FILE_CATEGORIES = {
  TEXT: [
    'txt', 'js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'json', 'xml', 
    'yaml', 'yml', 'md', 'py', 'rb', 'php', 'java', 'cpp', 'c', 'cs', 
    'go', 'rs', 'sql', 'sh', 'bash', 'log', 'ini', 'conf', 'properties',
    'cmd', 'bat', 'pl', 'r', 'scala', 'swift', 'kt', 'kts', 'groovy', 'dart'
  ],
  IMAGE: ['gif', 'jpg', 'jpeg', 'png', 'svg', 'bmp', 'webp'],
  VIDEO: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'm4v', 'm3u8'],
  AUDIO: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'opus', 'oga'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  EXECUTABLE: ['exe', 'bin', 'app', 'deb', 'rpm', 'msi', 'sh']
};

// Text file content types for detection
export const TEXT_FILE_CONTENT_TYPES = [
  'text/',
  'application/json',
  'application/javascript',
  'application/xml',
  'application/yaml',
  'application/x-sh'
];

// Media types
export const MEDIA_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  YOUTUBE: 'youtube',
  VIMEO: 'vimeo',
  FILE: 'file'
};

// Default settings
export const DEFAULT_SETTINGS = {
  maxZoom: 5,
  minZoom: 0.1,
  zoomDoubleClickSpeed: 1,
  panOnlyWhenZoomed: false,
  smoothScroll: false,
  plyrTheme: 'dark'
};