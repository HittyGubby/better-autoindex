<template>
  <div class="text-display-container">
    <div ref="editorContainer" class="editor-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { lineNumbers } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { basicSetup } from 'codemirror';

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  }
});

const editorContainer = ref(null);
let editorView = null;

// Function to get language extension based on file extension
const getLanguageExtension = (fileExtension) => {
  switch (fileExtension.toLowerCase()) {
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return javascript();
    case 'html':
    case 'htm':
      return html();
    case 'css':
      return css();
    case 'json':
      return json();
    case 'xml':
      return xml();
    case 'py':
      return python();
    case 'md':
      // Markdown can use html parser
      return html();
    default:
      return null;
  }
};

onMounted(() => {
  if (editorContainer.value) {
    // Determine language based on file extension
    const fileExtension = props.filename.split('.').pop().toLowerCase();

    // Map file extensions to CodeMirror language extensions
    const languageExtension = getLanguageExtension(fileExtension);

    // Create editor state with extensions
    const extensions = [
      lineNumbers(), // Add line numbers
      basicSetup,
      oneDark, // Dark theme
      EditorState.readOnly.of(true) // Read-only mode
    ];

    if (languageExtension) {
      extensions.push(languageExtension);
    }

    const startState = EditorState.create({
      doc: props.content,
      extensions: extensions
    });

    // Create editor view
    editorView = new EditorView({
      state: startState,
      parent: editorContainer.value
    });
  }
});

// Watch for changes in content and update the editor
watch(() => props.content, (newContent) => {
  if (editorView) {
    const transaction = editorView.state.update({
      changes: { from: 0, to: editorView.state.doc.length, insert: newContent }
    });
    editorView.dispatch(transaction);
  }
});

// Watch for changes in filename to update language highlighting
watch(() => props.filename, () => {
  // For now, we'll just keep the current implementation as changing language dynamically
  // would require recreating the entire editor, which is complex
  // The editor will continue to work with the language set during initial creation
});

onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy();
  }
});
</script>

<style scoped>
.text-display-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex: 1;
  width: 100%;
  min-height: 500px;
  border: 1px solid #444;
  border-radius: 4px;
  overflow: hidden;
}
</style>