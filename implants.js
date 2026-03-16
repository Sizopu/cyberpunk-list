// Cyberware/Implants functionality
document.addEventListener('DOMContentLoaded', () => {
  initCyberware();
  initInventory();
  initLifepath();
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
});

// ==================== CYBERWARE ====================
let implants = [];
let selectedImplantId = null;

// 8 типов киберснаряжения
const implantTypes = {
  fashionware: {
    name: 'Fashionware',
    color: '#e91e63',
    description: 'Импланты для личного украшения',
    defaultZones: ['hair', 'skin']
  },
  neuralware: {
    name: 'Neuralware',
    color: '#9c27b0',
    description: 'Импланты для улучшения умственных способностей',
    defaultZones: ['brain', 'neck']
  },
  cyberoptics: {
    name: 'Cyberoptics',
    color: '#2196f3',
    description: 'Импланты для улучшения визуальных способностей',
    defaultZones: ['eyes']
  },
  cyberaudio: {
    name: 'Cyberaudio',
    color: '#00bcd4',
    description: 'Импланты для улучшения слуха',
    defaultZones: ['ears']
  },
  internal: {
    name: 'Internal',
    color: '#4caf50',
    description: 'Внутренние импланты (органы)',
    defaultZones: ['ribs', 'heart']
  },
  external: {
    name: 'External',
    color: '#ff9800',
    description: 'Внешние импланты (кожа)',
    defaultZones: ['right-shoulder', 'left-shoulder', 'chest']
  },
  limb: {
    name: 'Cyberlimb',
    color: '#795548',
    description: 'Кибернетические конечности',
    defaultZones: ['right-arm', 'left-arm', 'right-leg', 'left-leg']
  },
  borgware: {
    name: 'Borgware',
    color: '#607d8b',
    description: 'Полная замена тела кибернетикой',
    defaultZones: ['borg-head', 'borg-torso']
  }
};

const zonePositions = {
  // Fashionware
  'hair': { top: '4%', left: '50%' },
  'skin': { top: '25%', left: '55%' },
  // Neuralware
  'brain': { top: '7%', left: '50%' },
  'neck': { top: '14%', left: '50%' },
  // Cyberoptics
  'eyes': { top: '10%', left: '50%' },
  // Cyberaudio
  'ears': { top: '12%', left: '50%' },
  // Internal
  'ribs': { top: '28%', left: '50%' },
  'heart': { top: '24%', left: '50%' },
  // External
  'right-shoulder': { top: '19%', left: '30%' },
  'left-shoulder': { top: '19%', left: '70%' },
  'chest': { top: '22%', left: '50%' },
  // Limb
  'right-arm': { top: '30%', left: '22%' },
  'left-arm': { top: '30%', left: '78%' },
  'right-leg': { top: '56%', left: '44%' },
  'left-leg': { top: '56%', left: '56%' },
  // Borgware
  'borg-head': { top: '5%', left: '50%' },
  'borg-torso': { top: '32%', left: '50%' }
};

const zoneLabels = {
  // Fashionware
  'hair': 'Hair',
  'skin': 'Skin',
  // Neuralware
  'brain': 'Brain',
  'neck': 'Neck',
  // Cyberoptics
  'eyes': 'Eyes',
  // Cyberaudio
  'ears': 'Ears',
  // Internal
  'ribs': 'Ribs',
  'heart': 'Heart',
  // External
  'right-shoulder': 'Right Shoulder',
  'left-shoulder': 'Left Shoulder',
  'chest': 'Chest',
  // Limb
  'right-arm': 'Right Arm',
  'left-arm': 'Left Arm',
  'right-leg': 'Right Leg',
  'left-leg': 'Left Leg',
  // Borgware
  'borg-head': 'Head',
  'borg-torso': 'Torso'
};

// Предустановленные импланты для каждого типа
const defaultImplants = {
  fashionware: [
    { name: 'SynthSkin', zone: 'skin', humanityLoss: 1, description: 'Синтетическая кожа с узорами', effects: ['Style +2', ''], cost: 50, rarity: 'common' },
    { name: 'ChromaHair', zone: 'hair', humanityLoss: 0, description: 'Волосяные фолликулы с изменением цвета', effects: ['Color shift', ''], cost: 100, rarity: 'common' }
  ],
  neuralware: [
    { name: 'Neural Link', zone: 'neck', humanityLoss: 2, description: 'Базовый нейроинтерфейс', effects: ['Interface plugs', ''], cost: 200, rarity: 'common' },
    { name: 'Braindance Recorder', zone: 'brain', humanityLoss: 3, description: 'Запись и воспроизведение braindance', effects: ['Record BD', 'Play BD'], cost: 500, rarity: 'uncommon' }
  ],
  cyberoptics: [
    { name: 'Kiroshi Optics Mk.I', zone: 'eyes', humanityLoss: 2, description: 'Базовая кибероптика', effects: ['Low-light', 'Anti-dazzle'], cost: 300, rarity: 'common' },
    { name: 'Targeting Scope', zone: 'eyes', humanityLoss: 2, description: 'Прицельный модуль', effects: ['+1 to hit', 'Range calc'], cost: 400, rarity: 'uncommon' }
  ],
  cyberaudio: [
    { name: 'AudioVox', zone: 'ears', humanityLoss: 1, description: 'Улучшенный слуховой аппарат', effects: ['Amplified hearing', ''], cost: 150, rarity: 'common' },
    { name: 'Radio Link', zone: 'ears', humanityLoss: 1, description: 'Встроенное радио', effects: ['Radio tx/rx', ''], cost: 200, rarity: 'common' }
  ],
  internal: [
    { name: 'SynthLung', zone: 'ribs', humanityLoss: 3, description: 'Синтетические лёгкие', effects: ['Toxin resistance', ''], cost: 600, rarity: 'uncommon' },
    { name: 'Artificial Heart', zone: 'heart', humanityLoss: 4, description: 'Искусственное сердце', effects: ['+1 BODY', 'Stun resistance'], cost: 800, rarity: 'rare' }
  ],
  external: [
    { name: 'Dermal Plating', zone: 'chest', humanityLoss: 2, description: 'Кожные пластины', effects: ['SP 8', '-1 REF'], cost: 400, rarity: 'common' },
    { name: 'Nanoweave Subdermal', zone: 'right-shoulder', humanityLoss: 1, description: 'Наноткань под кожей', effects: ['SP 4', ''], cost: 300, rarity: 'common' }
  ],
  limb: [
    { name: 'CyberArm Right', zone: 'right-arm', humanityLoss: 3, description: 'Кибернетическая правая рука', effects: ['STR +2', 'Grip +2'], cost: 700, rarity: 'common' },
    { name: 'CyberLeg Right', zone: 'right-leg', humanityLoss: 3, description: 'Кибернетическая правая нога', effects: ['MOVE +2', 'Jump +1'], cost: 700, rarity: 'common' }
  ],
  borgware: [
    { name: 'Full Borg Conversion', zone: 'borg-torso', humanityLoss: 18, description: 'Полная конверсия тела', effects: ['SP 20', 'STR +4', 'BODY +4'], cost: 5000, rarity: 'very-rare' }
  ]
};

function initCyberware() {
  const addImplantBtn = document.getElementById('add-implant-btn');
  const implantTypeDropdown = document.getElementById('implant-type-dropdown');
  const bodyMarkerZones = document.querySelectorAll('.body-marker-zone');
  
  // Load saved data
  loadCyberwareData();
  
  // Toggle dropdown
  if (addImplantBtn) {
    addImplantBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      implantTypeDropdown.classList.toggle('active');
    });
  }
  
  // Close dropdown on outside click
  document.addEventListener('click', () => {
    if (implantTypeDropdown) {
      implantTypeDropdown.classList.remove('active');
    }
  });
  
  // Add implant by type
  if (implantTypeDropdown) {
    const buttons = implantTypeDropdown.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        addImplantOfType(type);
        implantTypeDropdown.classList.remove('active');
      });
    });
  }
  
  // Click on body zones to add implant at that location
  bodyMarkerZones.forEach(zone => {
    zone.addEventListener('click', () => {
      const zoneName = zone.dataset.zone;
      // Determine type from zone class
      let type = 'external';
      Object.keys(implantTypes).forEach(key => {
        if (zone.classList.contains(`${key}-zone`)) {
          type = key;
        }
      });
      addImplantOfType(type, zoneName);
    });
  });
  
  // Initial render - load default implants if empty
  if (implants.length === 0) {
    loadDefaultImplants();
  }
  renderImplantCards();
  renderImplantMarkers();
  updateHumanityTotal();
}

function loadDefaultImplants() {
  // Загружаем по одному импланту из каждого типа
  Object.keys(defaultImplants).forEach(type => {
    const defaults = defaultImplants[type];
    if (defaults && defaults.length > 0) {
      const def = defaults[0];
      implants.push({
        id: Date.now() + Math.random(),
        type: type,
        name: def.name,
        zone: def.zone,
        humanityLoss: def.humanityLoss,
        description: def.description,
        effects: def.effects,
        cost: def.cost,
        rarity: def.rarity
      });
    }
  });
}

function addImplantOfType(type, preferredZone = null) {
  const typeInfo = implantTypes[type];
  const zone = preferredZone || (typeInfo.defaultZones ? typeInfo.defaultZones[0] : 'chest');
  
  const implant = {
    id: Date.now(),
    type: type,
    name: '',
    zone: zone,
    humanityLoss: 0,
    description: '',
    effects: ['', '', ''],
    cost: 0,
    rarity: 'common'
  };
  implants.push(implant);
  selectedImplantId = implant.id;
  renderImplantCards();
  renderImplantMarkers();
  saveCyberwareData();
}

function deleteImplant(id) {
  implants = implants.filter(i => i.id !== id);
  if (selectedImplantId === id) {
    selectedImplantId = null;
  }
  renderImplantCards();
  renderImplantMarkers();
  saveCyberwareData();
  updateHumanityTotal();
}

function selectImplant(id) {
  selectedImplantId = id;
  renderImplantCards();
  renderImplantMarkers();
}

function updateImplant(id, field, value) {
  const implant = implants.find(i => i.id === id);
  if (implant) {
    implant[field] = value;
    renderImplantMarkers();
    saveCyberwareData();
    if (field === 'humanityLoss') {
      updateHumanityTotal();
    }
  }
}

function updateHumanityTotal() {
  const total = implants.reduce((sum, i) => sum + (parseInt(i.humanityLoss) || 0), 0);
  const el = document.getElementById('humanity-total');
  if (el) el.textContent = total;
}

function renderImplantCards() {
  const container = document.getElementById('implant-cards-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Group implants by type
  const implantsByType = {};
  implants.forEach(implant => {
    if (!implantsByType[implant.type]) {
      implantsByType[implant.type] = [];
    }
    implantsByType[implant.type].push(implant);
  });
  
  // Render by type
  Object.keys(implantTypes).forEach(type => {
    const typeImplants = implantsByType[type] || [];
    const typeInfo = implantTypes[type];
    
    // Type header
    const typeHeader = document.createElement('div');
    typeHeader.className = 'implant-type-header';
    typeHeader.style.borderColor = typeInfo.color;
    typeHeader.innerHTML = `
      <span class="type-name">${typeInfo.name}</span>
      <span class="type-count">${typeImplants.length}</span>
    `;
    container.appendChild(typeHeader);
    
    // Render implants of this type
    typeImplants.forEach(implant => {
      const card = document.createElement('div');
      card.className = `implant-card ${selectedImplantId === implant.id ? 'selected' : ''}`;
      card.style.borderLeftColor = typeInfo.color;
      card.innerHTML = `
        <div class="implant-card-header">
          <input type="text" class="implant-card-name" placeholder="IMPLANT NAME..." value="${implant.name}" data-id="${implant.id}">
          <button class="implant-card-delete" data-id="${implant.id}" title="Delete">×</button>
        </div>
        <div class="implant-card-body">
          <div class="implant-card-row">
            <label>Location</label>
            <select class="implant-card-zone" data-id="${implant.id}">
              ${Object.keys(zoneLabels).map(z => `<option value="${z}" ${implant.zone === z ? 'selected' : ''}>${zoneLabels[z]}</option>`).join('')}
            </select>
          </div>
          <div class="implant-card-row">
            <label>Humanity Loss</label>
            <input type="number" class="implant-card-humanity" value="${implant.humanityLoss}" min="0" data-id="${implant.id}">
          </div>
          <div class="implant-card-row">
            <label>Cost</label>
            <input type="number" class="implant-card-cost" value="${implant.cost}" min="0" data-id="${implant.id}">
          </div>
          <div class="implant-card-row">
            <label>Rarity</label>
            <select class="implant-card-rarity" data-id="${implant.id}">
              <option value="common" ${implant.rarity === 'common' ? 'selected' : ''}>Common</option>
              <option value="uncommon" ${implant.rarity === 'uncommon' ? 'selected' : ''}>Uncommon</option>
              <option value="rare" ${implant.rarity === 'rare' ? 'selected' : ''}>Rare</option>
              <option value="very-rare" ${implant.rarity === 'very-rare' ? 'selected' : ''}>Very Rare</option>
            </select>
          </div>
          <div class="implant-card-row full">
            <label>Description</label>
            <textarea class="implant-card-description" placeholder="Description..." data-id="${implant.id}">${implant.description}</textarea>
          </div>
          <div class="implant-card-row full">
            <label>Effects</label>
            <div class="effects-grid">
              <input type="text" class="implant-card-effect" placeholder="Effect 1" value="${implant.effects[0] || ''}" data-id="${implant.id}" data-effect="0">
              <input type="text" class="implant-card-effect" placeholder="Effect 2" value="${implant.effects[1] || ''}" data-id="${implant.id}" data-effect="1">
              <input type="text" class="implant-card-effect" placeholder="Effect 3" value="${implant.effects[2] || ''}" data-id="${implant.id}" data-effect="2">
            </div>
          </div>
        </div>
      `;
      
      container.appendChild(card);
      
      // Add event listeners - stop propagation on form elements
      const formElements = card.querySelectorAll('input, select, textarea, button');
      formElements.forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      });
      
      const nameInput = card.querySelector('.implant-card-name');
      nameInput.addEventListener('input', (e) => {
        e.stopPropagation();
        updateImplant(implant.id, 'name', e.target.value);
      });
      
      const zoneSelect = card.querySelector('.implant-card-zone');
      zoneSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        updateImplant(implant.id, 'zone', e.target.value);
      });
      
      const humanityInput = card.querySelector('.implant-card-humanity');
      humanityInput.addEventListener('input', (e) => {
        e.stopPropagation();
        updateImplant(implant.id, 'humanityLoss', parseInt(e.target.value) || 0);
      });
      
      const costInput = card.querySelector('.implant-card-cost');
      costInput.addEventListener('input', (e) => {
        e.stopPropagation();
        updateImplant(implant.id, 'cost', parseInt(e.target.value) || 0);
      });
      
      const raritySelect = card.querySelector('.implant-card-rarity');
      raritySelect.addEventListener('change', (e) => {
        e.stopPropagation();
        updateImplant(implant.id, 'rarity', e.target.value);
      });
      
      const descriptionInput = card.querySelector('.implant-card-description');
      descriptionInput.addEventListener('input', (e) => {
        e.stopPropagation();
        updateImplant(implant.id, 'description', e.target.value);
      });
      
      const effectInputs = card.querySelectorAll('.implant-card-effect');
      effectInputs.forEach(input => {
        input.addEventListener('input', (e) => {
          e.stopPropagation();
          const effectIndex = parseInt(e.target.dataset.effect);
          const effects = [...implant.effects];
          effects[effectIndex] = e.target.value;
          updateImplant(implant.id, 'effects', effects);
        });
      });
      
      const deleteBtn = card.querySelector('.implant-card-delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteImplant(implant.id);
      });
      
      card.addEventListener('click', () => {
        selectImplant(implant.id);
      });
    });
  });
}

function renderImplantMarkers() {
  const container = document.getElementById('implant-markers');
  if (!container) return;
  
  container.innerHTML = '';
  
  implants.forEach(implant => {
    const position = zonePositions[implant.zone];
    if (!position) return;
    
    const typeInfo = implantTypes[implant.type];
    const marker = document.createElement('div');
    marker.className = `implant-marker ${selectedImplantId === implant.id ? 'selected' : ''}`;
    marker.style.top = position.top;
    marker.style.left = position.left;
    marker.style.background = typeInfo ? typeInfo.color : '#f78166';
    marker.style.boxShadow = `0 0 10px ${typeInfo ? typeInfo.color : '#f78166'}`;
    marker.title = implant.name || 'Implant';
    marker.dataset.id = implant.id;
    
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      selectImplant(implant.id);
      // Scroll to card
      const card = document.querySelector(`.implant-card[data-id="${implant.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    container.appendChild(marker);
  });
}

function saveCyberwareData() {
  localStorage.setItem('cyberwareImplants', JSON.stringify(implants));
}

function loadCyberwareData() {
  const saved = localStorage.getItem('cyberwareImplants');
  if (!saved) return;
  
  implants = JSON.parse(saved);
}

// Load character data from localStorage on page load
function loadCharacterFromStorage() {
  const lifepathData = localStorage.getItem('lifepathData');
  if (lifepathData) {
    const data = JSON.parse(lifepathData);
    
    // Load Improvement Points
    if ('impCurrent' in data && document.getElementById('imp-current')) {
      document.getElementById('imp-current').value = data.impCurrent;
    }
    if ('impMax' in data && document.getElementById('imp-max')) {
      document.getElementById('imp-max').value = data.impMax;
    }
    // Load Reputation
    if ('repValue' in data && document.getElementById('rep-value')) {
      document.getElementById('rep-value').value = data.repValue;
    }
    // Load Money Total
    if ('moneyTotal' in data && document.getElementById('money-total')) {
      document.getElementById('money-total').value = data.moneyTotal;
    }
  }
  
  // Load inventory
  const inventoryData = localStorage.getItem('inventoryData');
  if (inventoryData) {
    const data = JSON.parse(inventoryData);
    const inventoryBody = document.getElementById('inventory-body');
    if (inventoryBody && data.length > 0) {
      inventoryBody.innerHTML = '';
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
      if (typeof updateTotalWeight === 'function') updateTotalWeight();
      if (typeof updateTotalMoney === 'function') updateTotalMoney();
    }
  }
}

// Save character data to localStorage
function saveCharacterToStorage() {
  const lifepathData = JSON.parse(localStorage.getItem('lifepathData') || '{}');
  
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
  
  localStorage.setItem('lifepathData', JSON.stringify(lifepathData));
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
  if ('age' in char && document.getElementById('age')) document.getElementById('age').value = char.age;
  if ('role' in char && document.getElementById('role')) document.getElementById('role').value = char.role;
  if ('role_rank' in char && document.getElementById('role_rank')) document.getElementById('role_rank').value = char.role_rank;
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
    localStorage.setItem('inventoryData', JSON.stringify(data.inventory));
  }
  if (data.cyberware) {
    localStorage.setItem('cyberwareImplants', JSON.stringify(data.cyberware));
  }
  if (data.notes) {
    localStorage.setItem('notesData', JSON.stringify(data.notes));
  }
  if (data.mobs) {
    localStorage.setItem('mobsData', JSON.stringify(data.mobs));
  }
  if (data.moneyTotal) {
    localStorage.setItem('moneyTotal', data.moneyTotal);
    if (document.getElementById('money-total')) {
      document.getElementById('money-total').value = data.moneyTotal;
    }
  }
  
  // Reload page after a short delay to apply all changes
  setTimeout(() => {
    location.reload();
  }, 100);
}

// ==================== INVENTORY ====================
function initInventory() {
  const addBtn = document.getElementById('add-inventory-row');
  const inventoryBody = document.getElementById('inventory-body');
  
  // Load saved inventory
  loadInventoryData();
  
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addInventoryRow();
      saveInventoryData();
    });
  }
  
  // Initial rows
  if (inventoryBody.children.length === 0) {
    for (let i = 0; i < 15; i++) {
      addInventoryRow();
    }
    updateTotalWeight();
  }
  
  // Save on input
  inventoryBody.addEventListener('input', saveInventoryData);
}

function addInventoryRow() {
  const inventoryBody = document.getElementById('inventory-body');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="inventory-gear" placeholder=""></td>
    <td><input type="number" class="inventory-cost" placeholder=""></td>
    <td><input type="number" class="inventory-weight" placeholder=""></td>
    <td><input type="text" class="inventory-notes" placeholder=""></td>
    <td><input type="number" class="inventory-cash" placeholder=""></td>
  `;
  inventoryBody.appendChild(tr);
}

function saveInventoryData() {
  const data = [];
  document.querySelectorAll('#inventory-body tr').forEach(row => {
    data.push({
      gear: row.querySelector('.inventory-gear')?.value || '',
      cost: row.querySelector('.inventory-cost')?.value || '',
      weight: row.querySelector('.inventory-weight')?.value || '',
      notes: row.querySelector('.inventory-notes')?.value || '',
      cash: row.querySelector('.inventory-cash')?.value || ''
    });
  });
  localStorage.setItem('inventoryData', JSON.stringify(data));
  updateTotalWeight();
}

function updateTotalWeight() {
  let total = 0;
  document.querySelectorAll('.inventory-weight').forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  const el = document.getElementById('total-weight-value');
  if (el) el.textContent = total.toFixed(2);
}

function loadInventoryData() {
  const saved = localStorage.getItem('inventoryData');
  const inventoryBody = document.getElementById('inventory-body');
  if (!saved) return;
  
  const data = JSON.parse(saved);
  inventoryBody.innerHTML = '';
  
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
  
  updateTotalWeight();
}

// ==================== LIFEPATH ====================
function initLifepath() {
  const lifepathInputs = document.querySelectorAll('.lifepath-content input, .lifepath-top-content input, .lifepath-top-content textarea, #role-lifepath-text, #rep-events, #rep-value, #imp-current, #imp-max, #money-total');
  
  // Load saved data
  loadLifepathData();
  
  // Save on input
  lifepathInputs.forEach(input => {
    input.addEventListener('input', saveLifepathData);
  });
}

function saveLifepathData() {
  const data = {
    // Improvement Points
    impCurrent: document.getElementById('imp-current')?.value || '0',
    impMax: document.getElementById('imp-max')?.value || '0',
    // Reputation
    repValue: document.getElementById('rep-value')?.value || '0',
    // Money Total
    moneyTotal: document.getElementById('money-total')?.value || '',
    // Main lifepath
    culturalOrigins: document.getElementById('cultural-origins')?.value || '',
    personality: document.getElementById('personality')?.value || '',
    clothingStyles: document.getElementById('clothing-styles')?.value || '',
    hairstyle: document.getElementById('hairstyle')?.value || '',
    valueMost: document.getElementById('value-most')?.value || '',
    feelingsPeople: document.getElementById('feelings-people')?.value || '',
    valuedPerson: document.getElementById('valued-person')?.value || '',
    valuedPossession: document.getElementById('valued-possession')?.value || '',
    familyBackground: document.getElementById('family-background')?.value || '',
    childhoodEnvironment: document.getElementById('childhood-environment')?.value || '',
    familyCrisis: document.getElementById('family-crisis')?.value || '',
    lifeGoals: document.getElementById('life-goals')?.value || '',
    fashion: document.getElementById('fashion')?.value || '',
    // Top lifepath
    friends: document.getElementById('friends')?.value || '',
    tragicLove: document.getElementById('tragic-love')?.value || '',
    roleLifepath: document.getElementById('role-lifepath-text')?.value || '',
    repEvents: document.getElementById('rep-events')?.value || '',
    // Housing
    housing: document.getElementById('housing')?.value || '',
    rent: document.getElementById('rent')?.value || '',
    lifestyle: document.getElementById('lifestyle')?.value || ''
  };
  localStorage.setItem('lifepathData', JSON.stringify(data));
}

function loadLifepathData() {
  const saved = localStorage.getItem('lifepathData');
  if (!saved) return;
  
  const data = JSON.parse(saved);
  
  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  };
  
  setVal('imp-current', data.impCurrent);
  setVal('imp-max', data.impMax);
  setVal('rep-value', data.repValue);
  setVal('money-total', data.moneyTotal);
  setVal('cultural-origins', data.culturalOrigins);
  setVal('personality', data.personality);
  setVal('clothing-styles', data.clothingStyles);
  setVal('hairstyle', data.hairstyle);
  setVal('value-most', data.valueMost);
  setVal('feelings-people', data.feelingsPeople);
  setVal('valued-person', data.valuedPerson);
  setVal('valued-possession', data.valuedPossession);
  setVal('family-background', data.familyBackground);
  setVal('childhood-environment', data.childhoodEnvironment);
  setVal('family-crisis', data.familyCrisis);
  setVal('life-goals', data.lifeGoals);
  setVal('fashion', data.fashion);
  setVal('friends', data.friends);
  setVal('tragic-love', data.tragicLove);
  setVal('role-lifepath-text', data.roleLifepath);
  setVal('rep-events', data.repEvents);
  setVal('housing', data.housing);
  setVal('rent', data.rent);
  setVal('lifestyle', data.lifestyle);
}
