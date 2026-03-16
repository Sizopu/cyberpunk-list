/* ========================================
   SHARED UTILITIES - Common functions
   ======================================== */

// Get current character ID
function getCurrentCharacterId() {
  return localStorage.getItem('currentCharacterId');
}

// Get character-specific storage key
function getCharStorageKey(key) {
  const charId = getCurrentCharacterId();
  if (charId) {
    return 'character_' + charId + '_' + key;
  }
  return key;
}

// Character-specific localStorage wrapper
const charStorage = {
  getItem: function(key) {
    const charId = getCurrentCharacterId();
    if (charId && !key.startsWith('character_')) {
      return localStorage.getItem('character_' + charId + '_' + key);
    }
    return localStorage.getItem(key);
  },
  setItem: function(key, value) {
    const charId = getCurrentCharacterId();
    if (charId && !key.startsWith('character_')) {
      localStorage.setItem('character_' + charId + '_' + key, value);
    } else {
      localStorage.setItem(key, value);
    }
  }
};

// Safe element value getter
function getElementValue(id) {
  const el = document.getElementById(id);
  return el ? (el.value || '') : '';
}

// Format date for display
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Export functions
window.getCurrentCharacterId = getCurrentCharacterId;
window.getCharStorageKey = getCharStorageKey;
window.charStorage = charStorage;
window.getElementValue = getElementValue;
window.formatDate = formatDate;
