// Notes functionality
document.addEventListener('DOMContentLoaded', () => {
  initNotes();
  initSaveLoad();
  initDiceRoller();
  loadCharacterFromStorage();

  // Add event listeners for character data saving
  const impCurrent = document.getElementById('imp-current');
  const impMax = document.getElementById('imp-max');
  const repValue = document.getElementById('rep-value');
  const moneyTotal = document.getElementById('money-total');

  [impCurrent, impMax, repValue, moneyTotal].forEach(el => {
    if (el) {
      el.addEventListener('input', saveCharacterToStorage);
    }
  });

  // Auto-save on navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      saveNotes();
      saveCharacterToStorage();
    });
  });

  // Auto-save on page unload
  window.addEventListener('beforeunload', () => {
    saveNotes();
    saveCharacterToStorage();
  });
});

let notes = [];
let selectedNoteId = null;

// Use getCharStorageKey from utils.js

function initNotes() {
  const addNoteBtn = document.getElementById('add-note-btn');
  const noteTypeDropdown = document.getElementById('note-type-dropdown');
  const notesList = document.getElementById('notes-list');
  
  // Load saved notes
  loadNotes();
  
  // Toggle dropdown
  if (addNoteBtn) {
    addNoteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      noteTypeDropdown.classList.toggle('active');
    });
  }
  
  // Close dropdown on outside click
  document.addEventListener('click', () => {
    if (noteTypeDropdown) {
      noteTypeDropdown.classList.remove('active');
    }
  });
  
  // Add note by type
  if (noteTypeDropdown) {
    const buttons = noteTypeDropdown.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        addNote(type);
        noteTypeDropdown.classList.remove('active');
      });
    });
  }
  
  // Initial render
  renderNotesList();
}

function addNote(type = 'note') {
  const note = {
    id: Date.now(),
    type: type,
    title: type === 'table' ? 'New Table' : 'New Note',
    content: '',
    tableRows: type === 'table' ? 3 : 0,
    tableCols: type === 'table' ? 3 : 0,
    tableData: type === 'table' ? [] : [],
    createdAt: new Date().toISOString()
  };
  
  if (type === 'table') {
    // Initialize empty table data
    for (let i = 0; i < note.tableRows; i++) {
      const row = [];
      for (let j = 0; j < note.tableCols; j++) {
        row.push('');
      }
      note.tableData.push(row);
    }
  }
  
  notes.push(note);
  selectedNoteId = note.id;
  renderNotesList();
  renderNoteEditor();
  saveNotes();
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  if (selectedNoteId === id) {
    selectedNoteId = null;
  }
  renderNotesList();
  renderNoteEditor();
  saveNotes();
}

function selectNote(id) {
  selectedNoteId = id;
  renderNotesList();
  renderNoteEditor();
}

function updateNote(id, field, value) {
  const note = notes.find(n => n.id === id);
  if (note) {
    note[field] = value;
    saveNotes();
  }
}

function addTableRow(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (note && note.type === 'table') {
    const newRow = [];
    for (let j = 0; j < note.tableCols; j++) {
      newRow.push('');
    }
    note.tableData.push(newRow);
    note.tableRows++;
    renderNoteEditor();
    saveNotes();
  }
}

function addTableCol(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (note && note.type === 'table') {
    note.tableData.forEach(row => {
      row.push('');
    });
    note.tableCols++;
    renderNoteEditor();
    saveNotes();
  }
}

function deleteTableRow(noteId, rowIndex) {
  const note = notes.find(n => n.id === noteId);
  if (note && note.type === 'table' && note.tableRows > 1) {
    note.tableData.splice(rowIndex, 1);
    note.tableRows--;
    renderNoteEditor();
    saveNotes();
  }
}

function deleteTableCol(noteId, colIndex) {
  const note = notes.find(n => n.id === noteId);
  if (note && note.type === 'table' && note.tableCols > 1) {
    note.tableData.forEach(row => {
      row.splice(colIndex, 1);
    });
    note.tableCols--;
    renderNoteEditor();
    saveNotes();
  }
}

function updateTableCell(noteId, rowIndex, colIndex, value) {
  const note = notes.find(n => n.id === noteId);
  if (note && note.type === 'table') {
    note.tableData[rowIndex][colIndex] = value;
    saveNotes();
  }
}

function renderNotesList() {
  const container = document.getElementById('notes-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  notes.forEach(note => {
    const noteItem = document.createElement('div');
    noteItem.className = `note-item ${selectedNoteId === note.id ? 'selected' : ''}`;
    noteItem.innerHTML = `
      <div class="note-item-icon">${note.type === 'table' ? '📊' : '📄'}</div>
      <div class="note-item-title">${note.title || 'Untitled'}</div>
      <button class="note-item-delete" data-id="${note.id}" title="Delete">×</button>
    `;
    
    container.appendChild(noteItem);
    
    const deleteBtn = noteItem.querySelector('.note-item-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNote(note.id);
    });
    
    noteItem.addEventListener('click', () => {
      selectNote(note.id);
    });
  });
}

function renderNoteEditor() {
  const container = document.getElementById('note-editor');
  if (!container) return;
  
  if (!selectedNoteId) {
    container.innerHTML = `
      <div class="editor-placeholder">
        <p>Select a note or create a new one</p>
      </div>
    `;
    return;
  }
  
  const note = notes.find(n => n.id === selectedNoteId);
  if (!note) return;
  
  if (note.type === 'note') {
    container.innerHTML = `
      <div class="note-editor-content">
        <input type="text" class="note-title-input" value="${note.title}" placeholder="Note title..." data-id="${note.id}">
        <textarea class="note-content-input" placeholder="Write your note here..." data-id="${note.id}">${note.content}</textarea>
      </div>
    `;
    
    const titleInput = container.querySelector('.note-title-input');
    titleInput.addEventListener('input', (e) => {
      updateNote(note.id, 'title', e.target.value);
      renderNotesList();
    });
    
    const contentInput = container.querySelector('.note-content-input');
    contentInput.addEventListener('input', (e) => {
      updateNote(note.id, 'content', e.target.value);
    });
  } else if (note.type === 'table') {
    let tableHTML = `
      <div class="table-editor-content">
        <input type="text" class="note-title-input" value="${note.title}" placeholder="Table title..." data-id="${note.id}">
        <div class="table-controls">
          <button class="table-add-row" data-id="${note.id}">+ Row</button>
          <button class="table-add-col" data-id="${note.id}">+ Column</button>
        </div>
        <div class="table-wrapper">
          <table class="notes-table">
            <thead>
              <tr>
    `;
    
    // Header row with delete buttons
    for (let j = 0; j < note.tableCols; j++) {
      tableHTML += `
        <th>
          <input type="text" class="table-header-input" placeholder="Col ${j + 1}" value="${note.tableData[0][j] || ''}" data-row="0" data-col="${j}" data-id="${note.id}">
          ${note.tableCols > 1 ? `<button class="table-col-delete" data-col="${j}" data-id="${note.id}">×</button>` : ''}
        </th>
      `;
    }
    
    tableHTML += `
              </tr>
            </thead>
            <tbody>
    `;
    
    // Data rows
    for (let i = 1; i < note.tableRows; i++) {
      tableHTML += `<tr>`;
      for (let j = 0; j < note.tableCols; j++) {
        tableHTML += `
          <td>
            <input type="text" class="table-cell-input" value="${note.tableData[i][j] || ''}" data-row="${i}" data-col="${j}" data-id="${note.id}">
          </td>
        `;
      }
      if (note.tableRows > 1) {
        tableHTML += `
          <td class="row-delete-cell">
            <button class="table-row-delete" data-row="${i}" data-id="${note.id}">×</button>
          </td>
        `;
      }
      tableHTML += `</tr>`;
    }
    
    tableHTML += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    container.innerHTML = tableHTML;
    
    // Title input
    const titleInput = container.querySelector('.note-title-input');
    titleInput.addEventListener('input', (e) => {
      updateNote(note.id, 'title', e.target.value);
      renderNotesList();
    });
    
    // Add row button
    const addRowBtn = container.querySelector('.table-add-row');
    addRowBtn.addEventListener('click', () => {
      addTableRow(note.id);
    });
    
    // Add column button
    const addColBtn = container.querySelector('.table-add-col');
    addColBtn.addEventListener('click', () => {
      addTableCol(note.id);
    });
    
    // Header inputs
    const headerInputs = container.querySelectorAll('.table-header-input');
    headerInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        updateTableCell(note.id, row, col, e.target.value);
      });
    });
    
    // Cell inputs
    const cellInputs = container.querySelectorAll('.table-cell-input');
    cellInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        updateTableCell(note.id, row, col, e.target.value);
      });
    });
    
    // Delete row buttons
    const deleteRowBtns = container.querySelectorAll('.table-row-delete');
    deleteRowBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = parseInt(btn.dataset.row);
        deleteTableRow(note.id, row);
      });
    });
    
    // Delete column buttons
    const deleteColBtns = container.querySelectorAll('.table-col-delete');
    deleteColBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const col = parseInt(btn.dataset.col);
        deleteTableCol(note.id, col);
      });
    });
  }
}

function saveNotes() {
  charStorage.setItem('notesData', JSON.stringify(notes));
}

function loadNotes() {
  const saved = charStorage.getItem('notesData');
  if (!saved) return;

  notes = JSON.parse(saved);
}

// Load character data from localStorage on page load
function loadCharacterFromStorage() {
  // Load main character data from character-specific storage
  const charDataStr = charStorage.getItem('characterData');
  const charData = charDataStr ? JSON.parse(charDataStr) : {};
  
  // Load character data if available
  if (Object.keys(charData).length > 0) {
    // Stats
    const statIds = ['stat_int', 'stat_ref', 'stat_dex', 'stat_tech', 'stat_cool', 'stat_will',
                     'stat_luck_current', 'stat_luck_max', 'stat_move', 'stat_body',
                     'stat_emp_current', 'stat_emp_max'];
    statIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && charData[id] !== undefined) {
        el.value = charData[id];
      }
    });

    // ID Block - including char-name
    const idFields = ['char-name', 'age', 'role', 'role_rank', 'xp_current', 'humanity_current', 'humanity_max', 'initiative'];
    idFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && charData[id] !== undefined) {
        el.value = charData[id];
      }
    });

    // Health
    const healthFields = ['hp_current', 'hp_max', 'death_save'];
    healthFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && charData[id] !== undefined) {
        el.value = charData[id];
      }
    });
    
    const seriouslyWounded = document.getElementById('seriously_wounded');
    if (seriouslyWounded && charData['seriously_wounded'] !== undefined) {
      seriouslyWounded.checked = charData['seriously_wounded'];
    }

    // Armor
    const armorFields = ['armor_head_sp', 'armor_head_notes', 'armor_head_penalty',
                         'armor_body_sp', 'armor_body_notes', 'armor_body_penalty',
                         'armor_shield_sp', 'armor_shield_notes', 'armor_shield_penalty'];
    armorFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && charData[id] !== undefined) {
        el.value = charData[id];
      }
    });

    // Notes
    const notesFields = ['critical_injuries', 'addictions', 'notes'];
    notesFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && charData[id] !== undefined) {
        el.value = charData[id];
      }
    });

    // Load avatar
    if (charData['avatar'] && typeof loadAvatar === 'function') {
      loadAvatar(charData['avatar']);
    }
  }

  const lifepathData = JSON.parse(charStorage.getItem('lifepathData') || '{}');

  if (Object.keys(lifepathData).length > 0) {
    // Load Improvement Points
    if ('impCurrent' in lifepathData && document.getElementById('imp-current')) {
      document.getElementById('imp-current').value = lifepathData.impCurrent;
    }
    if ('impMax' in lifepathData && document.getElementById('imp-max')) {
      document.getElementById('imp-max').value = lifepathData.impMax;
    }
    // Load Reputation
    if ('repValue' in lifepathData && document.getElementById('rep-value')) {
      document.getElementById('rep-value').value = lifepathData.repValue;
    }
    // Load Money Total
    if ('moneyTotal' in lifepathData && document.getElementById('money-total')) {
      document.getElementById('money-total').value = lifepathData.moneyTotal;
    }
  }

  // Load inventory from character-specific storage
  const inventoryData = charStorage.getItem('inventoryData');
  const inventoryBody = document.getElementById('inventory-body');

  if (inventoryBody) {
    inventoryBody.innerHTML = '';

    if (inventoryData) {
      const data = JSON.parse(inventoryData);
      if (data.length > 0) {
        data.forEach(item => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><input type="text" class="inventory-gear" value="${item.gear || ''}"></td>
            <td><input type="number" class="inventory-cost" value="${item.cost || ''}"></td>
            <td><input type="number" class="inventory-weight" value="${item.weight || ''}"></td>
            <td><input type="text" class="inventory-notes" value="${item.notes || ''}"></td>
            <td><input type="number" class="inventory-cash" value="${item.cash || ''}"></td>
          `;
          inventoryBody.appendChild(tr);
        });
      }
    }

    // Update totals
    if (typeof updateTotalWeight === 'function') updateTotalWeight();
    if (typeof updateTotalMoney === 'function') updateTotalMoney();
  }

  // Load aliases
  if (lifepathData.aliases) {
    const aliasesInput = document.querySelector('.aliases-input');
    if (aliasesInput) {
      aliasesInput.value = lifepathData.aliases;
    }
  }

  // Load enemies
  if (lifepathData.enemies && Array.isArray(lifepathData.enemies)) {
    const enemiesInputs = document.querySelectorAll('.enemies-grid input');
    lifepathData.enemies.forEach((enemy, index) => {
      if (enemiesInputs[index]) {
        enemiesInputs[index].value = enemy;
      }
    });
  }
}

// Save character data to localStorage
function saveCharacterToStorage() {
  const lifepathData = JSON.parse(charStorage.getItem('lifepathData') || '{}');

  if (document.getElementById('imp-current')) {
    lifepathData.impCurrent = document.getElementById('imp-current').value;
  }
  if (document.getElementById('imp-max')) {
    lifepathData.impMax = document.getElementById('imp-max').value;
  }
  if (document.getElementById('rep-value')) {
    lifepathData.repValue = document.getElementById('rep-value').value;
  }
  if (document.getElementById('money-total')) {
    lifepathData.moneyTotal = document.getElementById('money-total').value;
  }
  
  // Save aliases
  const aliasesInput = document.querySelector('.aliases-input');
  if (aliasesInput) {
    lifepathData.aliases = aliasesInput.value;
  }
  
  // Save enemies
  const enemiesInputs = document.querySelectorAll('.enemies-grid input');
  if (enemiesInputs.length > 0) {
    lifepathData.enemies = Array.from(enemiesInputs).map(input => input.value);
  }

  charStorage.setItem('lifepathData', JSON.stringify(lifepathData));
}

// Helper function to safely get element value
function getElementValue(id) {
  const el = document.getElementById(id);
  return el ? (el.value || '') : '';
}

// ==================== SAVE/LOAD FUNCTIONS ====================
function initSaveLoad() {
  const saveBtn = document.getElementById('save-data-btn');
  const loadBtn = document.getElementById('load-data-btn');
  const fileInput = document.getElementById('load-file-input');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', saveAllData);
  }
  
  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', handleFileLoad);
  }
}

function saveAllData() {
  // Collect all data from localStorage and DOM (only if elements exist)
  const allData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    character: {
      // Stats
      stat_int: getElementValue('stat_int'),
      stat_ref: getElementValue('stat_ref'),
      stat_dex: getElementValue('stat_dex'),
      stat_tech: getElementValue('stat_tech'),
      stat_cool: getElementValue('stat_cool'),
      stat_will: getElementValue('stat_will'),
      stat_luck_current: getElementValue('stat_luck_current'),
      stat_luck_max: getElementValue('stat_luck_max'),
      stat_move: getElementValue('stat_move'),
      stat_body: getElementValue('stat_body'),
      stat_emp_current: getElementValue('stat_emp_current'),
      stat_emp_max: getElementValue('stat_emp_max'),
      // ID Block
      age: getElementValue('age'),
      role: getElementValue('role'),
      role_rank: getElementValue('role_rank'),
      humanity_current: getElementValue('humanity_current'),
      humanity_max: getElementValue('humanity_max'),
      initiative: getElementValue('initiative'),
      // Health
      hp_current: getElementValue('hp_current'),
      hp_max: getElementValue('hp_max'),
      seriously_wounded: document.getElementById('seriously_wounded')?.checked || false,
      death_save: getElementValue('death_save'),
      // Armor
      armor_head_sp: getElementValue('armor_head_sp'),
      armor_head_notes: getElementValue('armor_head_notes'),
      armor_head_penalty: getElementValue('armor_head_penalty'),
      armor_body_sp: getElementValue('armor_body_sp'),
      armor_body_notes: getElementValue('armor_body_notes'),
      armor_body_penalty: getElementValue('armor_body_penalty'),
      armor_shield_sp: getElementValue('armor_shield_sp'),
      armor_shield_notes: getElementValue('armor_shield_notes'),
      armor_shield_penalty: getElementValue('armor_shield_penalty'),
      // Notes
      critical_injuries: getElementValue('critical_injuries'),
      addictions: getElementValue('addictions'),
      notes: getElementValue('notes')
    },
    // Role abilities
    roleAbilities: Array.from(document.querySelectorAll('.role-ability-entry')).map(entry => ({
      name: entry.querySelector('.role-ability-name')?.value || '',
      lvl: entry.querySelector('.role-ability-lvl')?.value || ''
    })),
    // Weapons
    weapons: Array.from(document.querySelectorAll('.weapon-row')).map(row => ({
      name: row.querySelector('.weapon-name-input')?.value || '',
      dmg: row.querySelector('.weapon-dmg-input')?.value || '',
      mag: row.querySelector('.weapon-mag-input')?.value || '',
      rof: row.querySelector('.weapon-rof-input')?.value || '',
      notes: row.querySelector('.weapon-notes-input')?.value || ''
    })),
    // Skills - main table
    skills: Array.from(document.querySelectorAll('.skill-table tr[data-stat]')).map(row => ({
      skillName: row.querySelector('.skill-name-input')?.value || '',
      mod: row.querySelector('.mod-input')?.value || '0',
      lvl: row.querySelector('.lvl-input')?.value || '0',
      stat: row.dataset.stat
    })),
    // Specialised skills
    specialisedSkills: Array.from(document.querySelectorAll('#specialised-skills-body tr')).map(row => ({
      stat: row.querySelector('.ss-stat')?.value || '',
      name: row.querySelector('.ss-name')?.value || '',
      mod: row.querySelector('.ss-mod')?.value || '0',
      lvl: row.querySelector('.ss-lvl')?.value || '0'
    })),
    // LocalStorage data
    lifepath: JSON.parse(localStorage.getItem('lifepathData') || '{}'),
    inventory: JSON.parse(localStorage.getItem('inventoryData') || '{}'),
    cyberware: JSON.parse(localStorage.getItem('cyberwareImplants') || '[]'),
    notes: JSON.parse(localStorage.getItem('notesData') || '[]'),
    mobs: JSON.parse(localStorage.getItem('mobsData') || '[]'),
    moneyTotal: localStorage.getItem('moneyTotal') || ''
  };
  
  // Create and download file
  const dataStr = JSON.stringify(allData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cyberpunk-character-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleFileLoad(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      loadData(data);
      alert('Character loaded successfully!');
    } catch (error) {
      alert('Error loading file: ' + error.message);
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}

function loadData(data) {
  // Load character data
  const char = data.character || {};
  
  // Stats - check if element exists AND property exists
  if ('stat_int' in char && document.getElementById('stat_int')) document.getElementById('stat_int').value = char.stat_int;
  if ('stat_ref' in char && document.getElementById('stat_ref')) document.getElementById('stat_ref').value = char.stat_ref;
  if ('stat_dex' in char && document.getElementById('stat_dex')) document.getElementById('stat_dex').value = char.stat_dex;
  if ('stat_tech' in char && document.getElementById('stat_tech')) document.getElementById('stat_tech').value = char.stat_tech;
  if ('stat_cool' in char && document.getElementById('stat_cool')) document.getElementById('stat_cool').value = char.stat_cool;
  if ('stat_will' in char && document.getElementById('stat_will')) document.getElementById('stat_will').value = char.stat_will;
  if ('stat_luck_current' in char && document.getElementById('stat_luck_current')) document.getElementById('stat_luck_current').value = char.stat_luck_current;
  if ('stat_luck_max' in char && document.getElementById('stat_luck_max')) document.getElementById('stat_luck_max').value = char.stat_luck_max;
  if ('stat_move' in char && document.getElementById('stat_move')) document.getElementById('stat_move').value = char.stat_move;
  if ('stat_body' in char && document.getElementById('stat_body')) document.getElementById('stat_body').value = char.stat_body;
  if ('stat_emp_current' in char && document.getElementById('stat_emp_current')) document.getElementById('stat_emp_current').value = char.stat_emp_current;
  if ('stat_emp_max' in char && document.getElementById('stat_emp_max')) document.getElementById('stat_emp_max').value = char.stat_emp_max;
  
  // ID Block
  if ('char_name' in char && document.getElementById('char-name')) document.getElementById('char-name').value = char.char_name;
  if ('age' in char && document.getElementById('age')) document.getElementById('age').value = char.age;
  if ('role' in char && document.getElementById('role')) document.getElementById('role').value = char.role;
  if ('role_rank' in char && document.getElementById('role_rank')) document.getElementById('role_rank').value = char.role_rank;
  if ('xp_current' in char && document.getElementById('xp_current')) document.getElementById('xp_current').value = char.xp_current;
  if ('humanity_current' in char && document.getElementById('humanity_current')) document.getElementById('humanity_current').value = char.humanity_current;
  if ('humanity_max' in char && document.getElementById('humanity_max')) document.getElementById('humanity_max').value = char.humanity_max;
  if ('initiative' in char && document.getElementById('initiative')) document.getElementById('initiative').value = char.initiative;
  
  // Health
  if ('hp_current' in char && document.getElementById('hp_current')) document.getElementById('hp_current').value = char.hp_current;
  if ('hp_max' in char && document.getElementById('hp_max')) document.getElementById('hp_max').value = char.hp_max;
  if ('seriously_wounded' in char && document.getElementById('seriously_wounded')) document.getElementById('seriously_wounded').checked = char.seriously_wounded;
  if ('death_save' in char && document.getElementById('death_save')) document.getElementById('death_save').value = char.death_save;
  
  // Armor
  if ('armor_head_sp' in char && document.getElementById('armor_head_sp')) document.getElementById('armor_head_sp').value = char.armor_head_sp;
  if ('armor_head_notes' in char && document.getElementById('armor_head_notes')) document.getElementById('armor_head_notes').value = char.armor_head_notes;
  if ('armor_head_penalty' in char && document.getElementById('armor_head_penalty')) document.getElementById('armor_head_penalty').value = char.armor_head_penalty;
  if ('armor_body_sp' in char && document.getElementById('armor_body_sp')) document.getElementById('armor_body_sp').value = char.armor_body_sp;
  if ('armor_body_notes' in char && document.getElementById('armor_body_notes')) document.getElementById('armor_body_notes').value = char.armor_body_notes;
  if ('armor_body_penalty' in char && document.getElementById('armor_body_penalty')) document.getElementById('armor_body_penalty').value = char.armor_body_penalty;
  if ('armor_shield_sp' in char && document.getElementById('armor_shield_sp')) document.getElementById('armor_shield_sp').value = char.armor_shield_sp;
  if ('armor_shield_notes' in char && document.getElementById('armor_shield_notes')) document.getElementById('armor_shield_notes').value = char.armor_shield_notes;
  if ('armor_shield_penalty' in char && document.getElementById('armor_shield_penalty')) document.getElementById('armor_shield_penalty').value = char.armor_shield_penalty;
  
  // Notes
  if ('critical_injuries' in char && document.getElementById('critical_injuries')) document.getElementById('critical_injuries').value = char.critical_injuries;
  if ('addictions' in char && document.getElementById('addictions')) document.getElementById('addictions').value = char.addictions;
  if ('notes' in char && document.getElementById('notes')) document.getElementById('notes').value = char.notes;
  
  // Load Role Abilities
  if (data.roleAbilities && data.roleAbilities.length > 0) {
    const roleAbilityContainer = document.getElementById('role-ability-container');
    if (roleAbilityContainer) {
      roleAbilityContainer.innerHTML = '';
      data.roleAbilities.forEach(ability => {
        const entry = document.createElement('div');
        entry.className = 'role-ability-entry';
        entry.innerHTML = `
          <input type="text" class="role-ability-name" placeholder="Ability name" value="${ability.name || ''}">
          <input type="number" class="role-ability-lvl" placeholder="LVL" value="${ability.lvl || ''}">
        `;
        roleAbilityContainer.appendChild(entry);
      });
    }
  }
  
  // Load Weapons
  if (data.weapons && data.weapons.length > 0) {
    const weaponsContainer = document.getElementById('weapons-container');
    if (weaponsContainer) {
      weaponsContainer.innerHTML = '';
      data.weapons.forEach(weapon => {
        const weaponRow = document.createElement('div');
        weaponRow.className = 'weapon-row';
        weaponRow.innerHTML = `
          <div class="weapon-label">Weapon</div>
          <div class="weapon-label">DMG</div>
          <div class="weapon-label">MAG</div>
          <div class="weapon-label">ROF</div>
          <div></div>
          <input type="text" class="weapon-name-input" placeholder="Weapon name" value="${weapon.name || ''}">
          <input type="text" class="weapon-dmg-input" placeholder="DMG" value="${weapon.dmg || ''}">
          <input type="text" class="weapon-mag-input" placeholder="MAG" value="${weapon.mag || ''}">
          <input type="text" class="weapon-rof-input" placeholder="ROF" value="${weapon.rof || ''}">
          <button class="delete-btn" type="button" title="Delete">×</button>
          <div class="weapon-notes">
            <span class="weapon-notes-label">NOTES</span>
            <input type="text" class="weapon-notes-input" placeholder="Notes" value="${weapon.notes || ''}">
          </div>
        `;
        const deleteBtn = weaponRow.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
          weaponRow.remove();
        });
        weaponsContainer.appendChild(weaponRow);
      });
    }
  }
  
  // Load Skills
  if (data.skills && data.skills.length > 0) {
    data.skills.forEach(skillData => {
      const row = document.querySelector(`.skill-table tr[data-stat="${skillData.stat}"][data-skill-name="${skillData.skillName}"]`);
      if (row) {
        if (skillData.mod) row.querySelector('.mod-input').value = skillData.mod;
        if (skillData.lvl) row.querySelector('.lvl-input').value = skillData.lvl;
        row.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }
  
  // Load Specialised Skills
  if (data.specialisedSkills && data.specialisedSkills.length > 0) {
    const specRows = document.querySelectorAll('#specialised-skills-body tr');
    data.specialisedSkills.forEach((skillData, index) => {
      if (index < specRows.length) {
        const row = specRows[index];
        if (skillData.stat) row.querySelector('.ss-stat').value = skillData.stat;
        if (skillData.name) row.querySelector('.ss-name').value = skillData.name;
        if (skillData.mod) row.querySelector('.ss-mod').value = skillData.mod;
        if (skillData.lvl) row.querySelector('.ss-lvl').value = skillData.lvl;
        row.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }
  
  // LocalStorage data
  if (data.lifepath && Object.keys(data.lifepath).length > 0) {
    localStorage.setItem('lifepathData', JSON.stringify(data.lifepath));
    // Also update DOM elements for imp-current, imp-max, rep-value
    if (data.lifepath.impCurrent && document.getElementById('imp-current')) {
      document.getElementById('imp-current').value = data.lifepath.impCurrent;
    }
    if (data.lifepath.impMax && document.getElementById('imp-max')) {
      document.getElementById('imp-max').value = data.lifepath.impMax;
    }
    if (data.lifepath.repValue && document.getElementById('rep-value')) {
      document.getElementById('rep-value').value = data.lifepath.repValue;
    }
  }
  if (data.inventory && Object.keys(data.inventory).length > 0) {
    charStorage.setItem('inventoryData', JSON.stringify(data.inventory));
  }
  if (data.cyberware) {
    charStorage.setItem('cyberwareImplants', JSON.stringify(data.cyberware));
  }
  if (data.notes) {
    charStorage.setItem('notesData', JSON.stringify(data.notes));
    // Reload notes to display loaded data
    loadNotes();
    renderNotesList();
  }
  if (data.mobs) {
    charStorage.setItem('mobsData', JSON.stringify(data.mobs));
  }
  if (data.moneyTotal) {
    charStorage.setItem('moneyTotal', data.moneyTotal);
    if (document.getElementById('money-total')) {
      document.getElementById('money-total').value = data.moneyTotal;
    }
  }

  // Trigger global save to persist all data
  if (typeof saveAllCharacterData === 'function') {
    saveAllCharacterData();
  }
  
  // Reload character data to update the page
  if (typeof loadAllCharacterData === 'function') {
    loadAllCharacterData();
  }
}
