// Characters/Profiles Management Module

let characters = [];
let selectedCharacterId = null;
let editingCharacterId = null;

document.addEventListener('DOMContentLoaded', () => {
  initCharacters();
  initSaveLoadAll();
});

function initCharacters() {
  loadCharacters();
  renderCharactersList();
  
  // Add character button
  const addBtn = document.getElementById('add-character-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openCharacterDialog();
    });
  }
  
  // Dialog handlers
  const dialogClose = document.getElementById('dialog-close');
  const dialogCancel = document.getElementById('dialog-cancel');
  const dialogSave = document.getElementById('dialog-save');
  const dialogOverlay = document.getElementById('character-dialog-overlay');
  
  if (dialogClose) {
    dialogClose.addEventListener('click', closeCharacterDialog);
  }
  if (dialogCancel) {
    dialogCancel.addEventListener('click', closeCharacterDialog);
  }
  if (dialogSave) {
    dialogSave.addEventListener('click', saveCharacterDialog);
  }
  if (dialogOverlay) {
    dialogOverlay.addEventListener('click', (e) => {
      if (e.target === dialogOverlay) {
        closeCharacterDialog();
      }
    });
  }
}

// Load characters from localStorage
function loadCharacters() {
  const data = localStorage.getItem('characters');
  if (data) {
    characters = JSON.parse(data);
  }
}

// Save characters to localStorage
function saveCharacters() {
  localStorage.setItem('characters', JSON.stringify(characters));
}

// Render characters list
function renderCharactersList() {
  const list = document.getElementById('characters-list');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (characters.length === 0) {
    list.innerHTML = '<div style="padding: 20px; text-align: center; color: #8b949e; font-size: 10px;">No characters yet. Click + to create one.</div>';
    return;
  }
  
  characters.forEach(char => {
    const item = document.createElement('div');
    item.className = `character-item ${selectedCharacterId === char.id ? 'active' : ''}`;
    item.innerHTML = `
      <div class="character-item-info">
        <div class="character-item-name">${char.name || 'Unnamed'}</div>
        ${char.description ? `<div class="character-item-desc">${char.description}</div>` : ''}
        <div class="character-item-date">${formatDate(char.createdAt)}</div>
      </div>
      <div class="character-item-actions">
        <button class="character-item-btn edit-btn" title="Edit" data-id="${char.id}">✎</button>
        <button class="character-item-btn delete-btn" title="Delete" data-id="${char.id}">×</button>
      </div>
    `;
    
    // Click to select
    item.querySelector('.character-item-info').addEventListener('click', () => {
      selectCharacter(char.id);
    });
    
    // Edit button
    item.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openCharacterDialog(char.id);
    });
    
    // Delete button
    item.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCharacter(char.id);
    });
    
    list.appendChild(item);
  });
}

// Select character
function selectCharacter(id) {
  selectedCharacterId = id;
  renderCharactersList();
  renderCharacterDetails();
}

// Render character details
function renderCharacterDetails() {
  const details = document.getElementById('character-details');
  if (!details) return;

  if (!selectedCharacterId) {
    details.innerHTML = '<div class="details-placeholder"><p>Select a character or create a new one</p></div>';
    return;
  }

  const char = characters.find(c => c.id === selectedCharacterId);
  if (!char) return;

  // Load character data from localStorage with correct key
  const charDataKey = 'character_' + char.id + '_characterData';
  const charData = JSON.parse(localStorage.getItem(charDataKey) || '{}');
  
  // Get name from character data if available
  const characterName = charData.char_name || char.name || 'Unnamed';
  
  // Get stats
  const stats = {
    int: charData.stat_int || '-',
    ref: charData.stat_ref || '-',
    dex: charData.stat_dex || '-',
    tech: charData.stat_tech || '-',
    cool: charData.stat_cool || '-',
    will: charData.stat_will || '-',
    body: charData.stat_body || '-',
    emp: charData.stat_emp_current || '-'
  };

  details.innerHTML = `
    <div class="character-detail-section">
      <h3>Character Info</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-item-label">Name</div>
          <div class="detail-item-value">${characterName}</div>
        </div>
        ${char.description ? `
        <div class="detail-item">
          <div class="detail-item-label">Description</div>
          <div class="detail-item-value">${char.description}</div>
        </div>
        ` : ''}
        <div class="detail-item">
          <div class="detail-item-label">Role</div>
          <div class="detail-item-value">${charData.role || 'Not set'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Created</div>
          <div class="detail-item-value">${formatDate(char.createdAt)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Last Modified</div>
          <div class="detail-item-value">${formatDate(char.updatedAt || char.createdAt)}</div>
        </div>
      </div>
    </div>
    
    <div class="character-detail-section">
      <h3>Stats</h3>
      <div class="stats-summary">
        <div class="stat-summary-item">
          <span class="stat-label">INT</span>
          <span class="stat-value">${stats.int}</span>
        </div>
        <div class="stat-summary-item">
          <span class="stat-label">REF</span>
          <span class="stat-value">${stats.ref}</span>
        </div>
        <div class="stat-summary-item">
          <span class="stat-label">DEX</span>
          <span class="stat-value">${stats.dex}</span>
        </div>
        <div class="stat-summary-item">
          <span class="stat-label">TECH</span>
          <span class="stat-value">${stats.tech}</span>
        </div>
        <div class="stat-summary-item">
          <span class="stat-label">COOL</span>
          <span class="stat-value">${stats.cool}</span>
        </div>
        <div class="stat-summary-item">
          <span class="stat-label">WILL</span>
          <span class="stat-value">${stats.will}</span>
        </div>
        <div class="stat-summary-item">
          <span class="stat-label">BODY</span>
          <span class="stat-value">${stats.body}</span>
        </div>
        <div class="stat-summary-item">
          <span class="stat-label">EMP</span>
          <span class="stat-value">${stats.emp}</span>
        </div>
      </div>
    </div>
    
    <div class="character-detail-section">
      <h3>Stats Preview</h3>
      <div class="detail-grid">
        ${renderStatPreview(charData, 'stat_int', 'INT')}
        ${renderStatPreview(charData, 'stat_ref', 'REF')}
        ${renderStatPreview(charData, 'stat_dex', 'DEX')}
        ${renderStatPreview(charData, 'stat_tech', 'TECH')}
        ${renderStatPreview(charData, 'stat_cool', 'COOL')}
        ${renderStatPreview(charData, 'stat_will', 'WILL')}
      </div>
    </div>
    
    <div class="character-actions">
      <button class="action-btn action-btn-primary" onclick="loadCharacterToSheet('${char.id}')">Load to Character Sheet</button>
      <button class="action-btn action-btn-danger" onclick="deleteCharacter('${char.id}')">Delete</button>
    </div>
  `;
}

function renderStatPreview(charData, statKey, label) {
  const value = charData[statKey] || '0';
  return `
    <div class="detail-item">
      <div class="detail-item-label">${label}</div>
      <div class="detail-item-value">${value}</div>
    </div>
  `;
}

// Open dialog
function openCharacterDialog(editId = null) {
  const dialog = document.getElementById('character-dialog-overlay');
  const title = document.getElementById('dialog-title');
  const nameInput = document.getElementById('char-name-input');
  const descInput = document.getElementById('char-desc-input');
  
  editingCharacterId = editId;
  
  if (editId) {
    const char = characters.find(c => c.id === editId);
    if (char) {
      title.textContent = 'Edit Character';
      nameInput.value = char.name || '';
      descInput.value = char.description || '';
    }
  } else {
    title.textContent = 'New Character';
    nameInput.value = '';
    descInput.value = '';
  }
  
  dialog.style.display = 'flex';
  nameInput.focus();
}

// Close dialog
function closeCharacterDialog() {
  const dialog = document.getElementById('character-dialog-overlay');
  dialog.style.display = 'none';
  editingCharacterId = null;
}

// Save dialog
function saveCharacterDialog() {
  const nameInput = document.getElementById('char-name-input');
  const descInput = document.getElementById('char-desc-input');
  
  const name = nameInput.value.trim();
  const description = descInput.value.trim();
  
  if (!name) {
    alert('Please enter a character name');
    return;
  }
  
  if (editingCharacterId) {
    // Edit existing
    const char = characters.find(c => c.id === editingCharacterId);
    if (char) {
      char.name = name;
      char.description = description;
      char.updatedAt = Date.now();
    }
  } else {
    // Create new
    const newChar = {
      id: 'char_' + Date.now(),
      name: name,
      description: description,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    characters.push(newChar);
    selectedCharacterId = newChar.id;
    
    // Initialize empty character data
    localStorage.setItem('character_' + newChar.id, JSON.stringify({}));
  }
  
  saveCharacters();
  renderCharactersList();
  renderCharacterDetails();
  closeCharacterDialog();
}

// Delete character
function deleteCharacter(id) {
  if (!confirm('Are you sure you want to delete this character? This cannot be undone.')) return;
  
  characters = characters.filter(c => c.id !== id);
  
  if (selectedCharacterId === id) {
    selectedCharacterId = null;
  }
  
  // Remove character data
  localStorage.removeItem('character_' + id);
  
  saveCharacters();
  renderCharactersList();
  renderCharacterDetails();
}

// Format date
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

// Load character to sheet (global function)
window.loadCharacterToSheet = function(charId) {
  // Save current character data to specific storage
  localStorage.setItem('currentCharacterId', charId);
  
  // Redirect to character sheet
  window.location.href = 'index.html';
};

// Save/Load All Characters
function saveAllCharacters() {
  // Get all characters
  const characters = JSON.parse(localStorage.getItem('characters') || '[]');
  
  // Collect all characters data
  const allCharactersData = [];
  
  characters.forEach(char => {
    const charId = char.id;
    const charDataKey = 'character_' + charId;
    const charFullData = {
      profile: char,
      character: JSON.parse(localStorage.getItem(charDataKey + '_characterData') || '{}'),
      roleAbilities: JSON.parse(localStorage.getItem(charDataKey + '_roleAbilitiesData') || '[]'),
      weapons: JSON.parse(localStorage.getItem(charDataKey + '_weaponsData') || '[]'),
      skills: JSON.parse(localStorage.getItem(charDataKey + '_skillsData') || '[]'),
      specialisedSkills: JSON.parse(localStorage.getItem(charDataKey + '_specialisedSkillsData') || '[]'),
      lifepath: JSON.parse(localStorage.getItem(charDataKey + '_lifepathData') || '{}'),
      inventory: JSON.parse(localStorage.getItem(charDataKey + '_inventoryData') || '[]'),
      cyberware: JSON.parse(localStorage.getItem(charDataKey + '_cyberwareImplants') || '[]'),
      notes: JSON.parse(localStorage.getItem(charDataKey + '_notesData') || '[]'),
      mobs: JSON.parse(localStorage.getItem(charDataKey + '_mobsData') || '[]'),
      moneyTotal: localStorage.getItem(charDataKey + '_moneyTotal') || ''
    };
    allCharactersData.push(charFullData);
  });
  
  // Create export data
  const allData = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    characters: allCharactersData
  };

  // Create and download file
  const dataStr = JSON.stringify(allData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cyberpunk-all-characters-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleLoadAll(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      loadAllCharacters(data);
      alert('All characters loaded successfully!');
      location.reload();
    } catch (error) {
      alert('Error loading file: ' + error.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function loadAllCharacters(data) {
  if (data.characters && Array.isArray(data.characters)) {
    // Get existing characters
    const existingCharacters = JSON.parse(localStorage.getItem('characters') || '[]');
    const newCharacters = [];
    
    data.characters.forEach(charData => {
      const profile = charData.profile;
      const charId = profile.id;
      const charDataKey = 'character_' + charId;

      // Check if character already exists
      const existingIndex = existingCharacters.findIndex(c => c.id === charId);
      
      if (existingIndex >= 0) {
        // Update existing character profile
        existingCharacters[existingIndex] = profile;
      } else {
        // Add new character
        newCharacters.push(profile);
      }

      // Save character-specific data (always update)
      if (charData.character) localStorage.setItem(charDataKey + '_characterData', JSON.stringify(charData.character));
      if (charData.roleAbilities) localStorage.setItem(charDataKey + '_roleAbilitiesData', JSON.stringify(charData.roleAbilities));
      if (charData.weapons) localStorage.setItem(charDataKey + '_weaponsData', JSON.stringify(charData.weapons));
      if (charData.skills) localStorage.setItem(charDataKey + '_skillsData', JSON.stringify(charData.skills));
      if (charData.specialisedSkills) localStorage.setItem(charDataKey + '_specialisedSkillsData', JSON.stringify(charData.specialisedSkills));
      if (charData.lifepath) localStorage.setItem(charDataKey + '_lifepathData', JSON.stringify(charData.lifepath));
      if (charData.inventory) localStorage.setItem(charDataKey + '_inventoryData', JSON.stringify(charData.inventory));
      if (charData.cyberware) localStorage.setItem(charDataKey + '_cyberwareImplants', JSON.stringify(charData.cyberware));
      if (charData.notes) localStorage.setItem(charDataKey + '_notesData', JSON.stringify(charData.notes));
      if (charData.mobs) localStorage.setItem(charDataKey + '_mobsData', JSON.stringify(charData.mobs));
      if (charData.moneyTotal) localStorage.setItem(charDataKey + '_moneyTotal', charData.moneyTotal);
    });
    
    // Merge existing and new characters
    const allCharacters = [...existingCharacters, ...newCharacters];
    localStorage.setItem('characters', JSON.stringify(allCharacters));
  }
}

function initSaveLoadAll() {
  const saveAllBtn = document.getElementById('save-all-btn');
  const loadAllBtn = document.getElementById('load-all-btn');
  const fileInput = document.getElementById('load-file-input');
  
  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', saveAllCharacters);
  }
  
  if (loadAllBtn) {
    loadAllBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', handleLoadAll);
  }
}
