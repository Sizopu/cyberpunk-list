// Mobs functionality
document.addEventListener('DOMContentLoaded', () => {
  initMobs();
  initSaveLoad();
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

let mobs = [];
let selectedMobId = null;

function initMobs() {
  const addMobBtn = document.getElementById('add-mob-btn');
  const mobsList = document.getElementById('mobs-list');
  
  // Load saved mobs
  loadMobs();
  
  if (addMobBtn) {
    addMobBtn.addEventListener('click', () => {
      addMob();
    });
  }
  
  // Initial render
  renderMobsList();
}

function addMob() {
  const mob = {
    id: Date.now(),
    name: 'New Mob',
    stats: {
      int: 0,
      ref: 0,
      dex: 0,
      tech: 0,
      cool: 0,
      will: 0,
      luck: 0,
      move: 0,
      body: 0,
      emp: 0
    },
    hitPoints: { current: 0, max: 0 },
    seriouslyWounded: false,
    deathSave: 0,
    weapons: [{ name: '', dmg: '', mag: '', rof: '', notes: '' }],
    handWeapons: [{ name: '', dmg: '', rof: '', notes: '' }],
    armor: {
      head: { sp: '', notes: '', penalty: '' },
      body: { sp: '', notes: '', penalty: '' }
    },
    skillBases: '',
    cyberware: ''
  };
  
  mobs.push(mob);
  selectedMobId = mob.id;
  renderMobsList();
  renderMobEditor();
  saveMobs();
}

function deleteMob(id) {
  mobs = mobs.filter(m => m.id !== id);
  if (selectedMobId === id) {
    selectedMobId = null;
  }
  renderMobsList();
  renderMobEditor();
  saveMobs();
}

function selectMob(id) {
  selectedMobId = id;
  renderMobsList();
  renderMobEditor();
}

function updateMob(id, field, value) {
  const mob = mobs.find(m => m.id === id);
  if (mob) {
    mob[field] = value;
    saveMobs();
  }
}

function updateMobStat(id, stat, value) {
  const mob = mobs.find(m => m.id === id);
  if (mob) {
    mob.stats[stat] = value;
    saveMobs();
  }
}

function addWeapon(id, type = 'weapon') {
  const mob = mobs.find(m => m.id === id);
  if (mob) {
    if (type === 'weapon') {
      mob.weapons.push({ name: '', dmg: '', mag: '', rof: '', notes: '' });
    } else if (type === 'hand') {
      mob.handWeapons.push({ name: '', dmg: '', rof: '', notes: '' });
    }
    renderMobEditor();
    saveMobs();
  }
}

function updateWeapon(id, type, index, field, value) {
  const mob = mobs.find(m => m.id === id);
  if (mob) {
    if (type === 'weapon' && mob.weapons[index]) {
      mob.weapons[index][field] = value;
    } else if (type === 'hand' && mob.handWeapons[index]) {
      mob.handWeapons[index][field] = value;
    }
    saveMobs();
  }
}

function deleteWeapon(id, type, index) {
  const mob = mobs.find(m => m.id === id);
  if (mob) {
    if (type === 'weapon' && mob.weapons.length > 1) {
      mob.weapons.splice(index, 1);
    } else if (type === 'hand' && mob.handWeapons.length > 1) {
      mob.handWeapons.splice(index, 1);
    }
    renderMobEditor();
    saveMobs();
  }
}

function renderMobsList() {
  const container = document.getElementById('mobs-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  mobs.forEach(mob => {
    const mobItem = document.createElement('div');
    mobItem.className = `mob-item ${selectedMobId === mob.id ? 'selected' : ''}`;
    mobItem.innerHTML = `
      <div class="mob-item-name">${mob.name || 'Untitled'}</div>
      <button class="mob-item-delete" data-id="${mob.id}" title="Delete">×</button>
    `;
    
    container.appendChild(mobItem);
    
    const deleteBtn = mobItem.querySelector('.mob-item-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteMob(mob.id);
    });
    
    mobItem.addEventListener('click', () => {
      selectMob(mob.id);
    });
  });
}

function renderMobEditor() {
  const container = document.getElementById('mob-editor');
  if (!container) return;
  
  if (!selectedMobId) {
    container.innerHTML = `
      <div class="editor-placeholder">
        <p>Select a mob or create a new one</p>
      </div>
    `;
    return;
  }
  
  const mob = mobs.find(m => m.id === selectedMobId);
  if (!mob) return;
  
  let html = `
    <div class="mob-editor-content">
      <input type="text" class="mob-name-input" value="${mob.name}" placeholder="Mob name..." data-id="${mob.id}">
      
      <!-- STATS ROW 1 -->
      <div class="mob-stats-block">
        <div class="stats-label">STATS</div>
        <div class="stats-grid">
          <div class="stat-field">
            <label>INT</label>
            <input type="number" value="${mob.stats.int}" data-id="${mob.id}" data-stat="int">
          </div>
          <div class="stat-field">
            <label>REF</label>
            <input type="number" value="${mob.stats.ref}" data-id="${mob.id}" data-stat="ref">
          </div>
          <div class="stat-field">
            <label>DEX</label>
            <input type="number" value="${mob.stats.dex}" data-id="${mob.id}" data-stat="dex">
          </div>
          <div class="stat-field">
            <label>TECH</label>
            <input type="number" value="${mob.stats.tech}" data-id="${mob.id}" data-stat="tech">
          </div>
          <div class="stat-field">
            <label>COOL</label>
            <input type="number" value="${mob.stats.cool}" data-id="${mob.id}" data-stat="cool">
          </div>
        </div>
      </div>
      
      <!-- STATS ROW 2 -->
      <div class="mob-stats-block">
        <div class="stats-label">STATS</div>
        <div class="stats-grid">
          <div class="stat-field">
            <label>WILL</label>
            <input type="number" value="${mob.stats.will}" data-id="${mob.id}" data-stat="will">
          </div>
          <div class="stat-field">
            <label>LUCK</label>
            <input type="number" value="${mob.stats.luck}" data-id="${mob.id}" data-stat="luck">
          </div>
          <div class="stat-field">
            <label>MOVE</label>
            <input type="number" value="${mob.stats.move}" data-id="${mob.id}" data-stat="move">
          </div>
          <div class="stat-field">
            <label>BODY</label>
            <input type="number" value="${mob.stats.body}" data-id="${mob.id}" data-stat="body">
          </div>
          <div class="stat-field emp-field">
            <label>EMP</label>
            <input type="number" value="${mob.stats.emp}" data-id="${mob.id}" data-stat="emp">
          </div>
        </div>
      </div>
      
      <!-- HEALTH -->
      <div class="mob-health-row">
        <div class="health-field">
          <label>HIT_points</label>
          <input type="number" value="${mob.hitPoints.current}" data-id="${mob.id}" data-health="current">
        </div>
        <div class="health-field">
          <label>SERIOUSLY_wounded</label>
          <input type="checkbox" ${mob.seriouslyWounded ? 'checked' : ''} data-id="${mob.id}" data-health="seriouslyWounded">
        </div>
        <div class="health-field">
          <label>DEATH_save</label>
          <input type="number" value="${mob.deathSave}" data-id="${mob.id}" data-health="deathSave">
        </div>
      </div>
      
      <!-- WEAPONS & ARMOR -->
      <div class="mob-combat-section">
        <div class="weapons-section">
          <div class="section-header">
            <span>WEAPONS</span>
            <button class="add-weapon-btn" data-id="${mob.id}" data-type="weapon">+</button>
          </div>
          ${mob.weapons.map((weapon, i) => `
            <div class="weapon-row">
              <input type="text" class="weapon-name" placeholder="Weapon" value="${weapon.name}" data-id="${mob.id}" data-type="weapon" data-index="${i}">
              <input type="text" class="weapon-dmg" placeholder="DMG" value="${weapon.dmg}" data-id="${mob.id}" data-type="weapon" data-index="${i}">
              <input type="text" class="weapon-mag" placeholder="MAG" value="${weapon.mag}" data-id="${mob.id}" data-type="weapon" data-index="${i}">
              <input type="text" class="weapon-rof" placeholder="ROF" value="${weapon.rof}" data-id="${mob.id}" data-type="weapon" data-index="${i}">
              <button class="delete-weapon-btn" data-id="${mob.id}" data-type="weapon" data-index="${i}">×</button>
            </div>
            <div class="weapon-notes-row">
              <input type="text" class="weapon-notes" placeholder="NOTES" value="${weapon.notes}" data-id="${mob.id}" data-type="weapon" data-index="${i}">
            </div>
          `).join('')}
        </div>
        
        <div class="hand-weapons-section">
          <div class="section-header">
            <span>H.Weapon</span>
            <button class="add-weapon-btn" data-id="${mob.id}" data-type="hand">+</button>
          </div>
          ${mob.handWeapons.map((weapon, i) => `
            <div class="weapon-row">
              <input type="text" class="weapon-name" placeholder="H.Weapon" value="${weapon.name}" data-id="${mob.id}" data-type="hand" data-index="${i}">
              <input type="text" class="weapon-dmg" placeholder="DMG" value="${weapon.dmg}" data-id="${mob.id}" data-type="hand" data-index="${i}">
              <input type="text" class="weapon-rof" placeholder="ROF" value="${weapon.rof}" data-id="${mob.id}" data-type="hand" data-index="${i}">
              <button class="delete-weapon-btn" data-id="${mob.id}" data-type="hand" data-index="${i}">×</button>
            </div>
            <div class="weapon-notes-row">
              <input type="text" class="weapon-notes" placeholder="NOTES" value="${weapon.notes}" data-id="${mob.id}" data-type="hand" data-index="${i}">
            </div>
          `).join('')}
        </div>
        
        <div class="armor-section">
          <div class="section-header">ARMOR</div>
          <div class="armor-row">
            <div class="armor-label">HEAD</div>
            <input type="text" class="armor-sp" placeholder="SP" value="${mob.armor.head.sp}" data-id="${mob.id}" data-armor-part="head" data-armor-field="sp">
            <input type="text" class="armor-notes" placeholder="NOTES" value="${mob.armor.head.notes}" data-id="${mob.id}" data-armor-part="head" data-armor-field="notes">
            <input type="text" class="armor-penalty" placeholder="PENALTY" value="${mob.armor.head.penalty}" data-id="${mob.id}" data-armor-part="head" data-armor-field="penalty">
          </div>
          <div class="armor-row">
            <div class="armor-label">BODY</div>
            <input type="text" class="armor-sp" placeholder="SP" value="${mob.armor.body.sp}" data-id="${mob.id}" data-armor-part="body" data-armor-field="sp">
            <input type="text" class="armor-notes" placeholder="NOTES" value="${mob.armor.body.notes}" data-id="${mob.id}" data-armor-part="body" data-armor-field="notes">
            <input type="text" class="armor-penalty" placeholder="PENALTY" value="${mob.armor.body.penalty}" data-id="${mob.id}" data-armor-part="body" data-armor-field="penalty">
          </div>
        </div>
      </div>
      
      <!-- SKILL BASES -->
      <div class="mob-skill-bases">
        <label>SKILL_bases</label>
        <textarea class="skill-bases-input" placeholder="Skill bases..." data-id="${mob.id}">${mob.skillBases}</textarea>
      </div>
      
      <!-- CYBERWARE -->
      <div class="mob-cyberware">
        <label>Cyberware/Special_equipment</label>
        <textarea class="cyberware-input" placeholder="Cyberware..." data-id="${mob.id}">${mob.cyberware}</textarea>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Add event listeners
  const nameInput = container.querySelector('.mob-name-input');
  nameInput.addEventListener('input', (e) => {
    updateMob(mob.id, 'name', e.target.value);
    renderMobsList();
  });
  
  // Stats
  const statInputs = container.querySelectorAll('[data-stat]');
  statInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      updateMobStat(mob.id, e.target.dataset.stat, e.target.value);
    });
  });
  
  // Health
  const hpInput = container.querySelector('[data-health="current"]');
  if (hpInput) {
    hpInput.addEventListener('input', (e) => {
      updateMob(mob.id, 'hitPoints', { ...mob.hitPoints, current: e.target.value });
    });
  }
  
  const seriouslyWoundedInput = container.querySelector('[data-health="seriouslyWounded"]');
  if (seriouslyWoundedInput) {
    seriouslyWoundedInput.addEventListener('change', (e) => {
      updateMob(mob.id, 'seriouslyWounded', e.target.checked);
    });
  }
  
  const deathSaveInput = container.querySelector('[data-health="deathSave"]');
  if (deathSaveInput) {
    deathSaveInput.addEventListener('input', (e) => {
      updateMob(mob.id, 'deathSave', e.target.value);
    });
  }
  
  // Weapons
  const addWeaponBtns = container.querySelectorAll('.add-weapon-btn');
  addWeaponBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      addWeapon(mob.id, btn.dataset.type);
    });
  });
  
  const weaponInputs = container.querySelectorAll('[data-type="weapon"], [data-type="hand"]');
  weaponInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      updateWeapon(mob.id, e.target.dataset.type, parseInt(e.target.dataset.index), e.target.placeholder.toLowerCase(), e.target.value);
    });
  });
  
  const deleteWeaponBtns = container.querySelectorAll('.delete-weapon-btn');
  deleteWeaponBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteWeapon(mob.id, btn.dataset.type, parseInt(btn.dataset.index));
    });
  });
  
  // Armor
  const armorInputs = container.querySelectorAll('[data-armor-part]');
  armorInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const part = e.target.dataset.armorPart;
      const field = e.target.dataset.armorField;
      const mob = mobs.find(m => m.id === selectedMobId);
      if (mob && mob.armor[part]) {
        mob.armor[part][field] = e.target.value;
        saveMobs();
      }
    });
  });
  
  // Skill bases
  const skillBasesInput = container.querySelector('.skill-bases-input');
  skillBasesInput.addEventListener('input', (e) => {
    updateMob(mob.id, 'skillBases', e.target.value);
  });
  
  // Cyberware
  const cyberwareInput = container.querySelector('.cyberware-input');
  cyberwareInput.addEventListener('input', (e) => {
    updateMob(mob.id, 'cyberware', e.target.value);
  });
}

function saveMobs() {
  localStorage.setItem('mobsData', JSON.stringify(mobs));
}

function loadMobs() {
  const saved = localStorage.getItem('mobsData');
  if (!saved) return;
  
  mobs = JSON.parse(saved);
}

// ==================== SAVE/LOAD FUNCTIONS ====================
function getElementValue(id) {
  const el = document.getElementById(id);
  return el ? (el.value || '') : '';
}

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
  const allData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    character: {
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
      age: getElementValue('age'),
      role: getElementValue('role'),
      role_rank: getElementValue('role_rank'),
      humanity_current: getElementValue('humanity_current'),
      humanity_max: getElementValue('humanity_max'),
      initiative: getElementValue('initiative'),
      hp_current: getElementValue('hp_current'),
      hp_max: getElementValue('hp_max'),
      seriously_wounded: document.getElementById('seriously_wounded')?.checked || false,
      death_save: getElementValue('death_save'),
      armor_head_sp: getElementValue('armor_head_sp'),
      armor_head_notes: getElementValue('armor_head_notes'),
      armor_head_penalty: getElementValue('armor_head_penalty'),
      armor_body_sp: getElementValue('armor_body_sp'),
      armor_body_notes: getElementValue('armor_body_notes'),
      armor_body_penalty: getElementValue('armor_body_penalty'),
      armor_shield_sp: getElementValue('armor_shield_sp'),
      armor_shield_notes: getElementValue('armor_shield_notes'),
      armor_shield_penalty: getElementValue('armor_shield_penalty'),
      critical_injuries: getElementValue('critical_injuries'),
      addictions: getElementValue('addictions'),
      notes: getElementValue('notes')
    },
    roleAbilities: Array.from(document.querySelectorAll('.role-ability-entry')).map(entry => ({
      name: entry.querySelector('.role-ability-name')?.value || '',
      lvl: entry.querySelector('.role-ability-lvl')?.value || ''
    })),
    weapons: Array.from(document.querySelectorAll('.weapon-row')).map(row => ({
      name: row.querySelector('.weapon-name-input')?.value || '',
      dmg: row.querySelector('.weapon-dmg-input')?.value || '',
      mag: row.querySelector('.weapon-mag-input')?.value || '',
      rof: row.querySelector('.weapon-rof-input')?.value || '',
      notes: row.querySelector('.weapon-notes-input')?.value || ''
    })),
    skills: Array.from(document.querySelectorAll('.skill-table tr[data-stat]')).map(row => ({
      skillName: row.querySelector('.skill-name-input')?.value || '',
      mod: row.querySelector('.mod-input')?.value || '0',
      lvl: row.querySelector('.lvl-input')?.value || '0',
      stat: row.dataset.stat
    })),
    specialisedSkills: Array.from(document.querySelectorAll('#specialised-skills-body tr')).map(row => ({
      stat: row.querySelector('.ss-stat')?.value || '',
      name: row.querySelector('.ss-name')?.value || '',
      mod: row.querySelector('.ss-mod')?.value || '0',
      lvl: row.querySelector('.ss-lvl')?.value || '0'
    })),
    lifepath: JSON.parse(localStorage.getItem('lifepathData') || '{}'),
    inventory: JSON.parse(localStorage.getItem('inventoryData') || '{}'),
    cyberware: JSON.parse(localStorage.getItem('cyberwareImplants') || '[]'),
    notes: JSON.parse(localStorage.getItem('notesData') || '[]'),
    mobs: JSON.parse(localStorage.getItem('mobsData') || '[]'),
    moneyTotal: localStorage.getItem('moneyTotal') || ''
  };
  
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
  event.target.value = '';
}

function loadData(data) {
  const char = data.character || {};
  
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
  
  if ('age' in char && document.getElementById('age')) document.getElementById('age').value = char.age;
  if ('role' in char && document.getElementById('role')) document.getElementById('role').value = char.role;
  if ('role_rank' in char && document.getElementById('role_rank')) document.getElementById('role_rank').value = char.role_rank;
  if ('humanity_current' in char && document.getElementById('humanity_current')) document.getElementById('humanity_current').value = char.humanity_current;
  if ('humanity_max' in char && document.getElementById('humanity_max')) document.getElementById('humanity_max').value = char.humanity_max;
  if ('initiative' in char && document.getElementById('initiative')) document.getElementById('initiative').value = char.initiative;
  
  if ('hp_current' in char && document.getElementById('hp_current')) document.getElementById('hp_current').value = char.hp_current;
  if ('hp_max' in char && document.getElementById('hp_max')) document.getElementById('hp_max').value = char.hp_max;
  if ('seriously_wounded' in char && document.getElementById('seriously_wounded')) document.getElementById('seriously_wounded').checked = char.seriously_wounded;
  if ('death_save' in char && document.getElementById('death_save')) document.getElementById('death_save').value = char.death_save;
  
  if ('armor_head_sp' in char && document.getElementById('armor_head_sp')) document.getElementById('armor_head_sp').value = char.armor_head_sp;
  if ('armor_head_notes' in char && document.getElementById('armor_head_notes')) document.getElementById('armor_head_notes').value = char.armor_head_notes;
  if ('armor_head_penalty' in char && document.getElementById('armor_head_penalty')) document.getElementById('armor_head_penalty').value = char.armor_head_penalty;
  if ('armor_body_sp' in char && document.getElementById('armor_body_sp')) document.getElementById('armor_body_sp').value = char.armor_body_sp;
  if ('armor_body_notes' in char && document.getElementById('armor_body_notes')) document.getElementById('armor_body_notes').value = char.armor_body_notes;
  if ('armor_body_penalty' in char && document.getElementById('armor_body_penalty')) document.getElementById('armor_body_penalty').value = char.armor_body_penalty;
  if ('armor_shield_sp' in char && document.getElementById('armor_shield_sp')) document.getElementById('armor_shield_sp').value = char.armor_shield_sp;
  if ('armor_shield_notes' in char && document.getElementById('armor_shield_notes')) document.getElementById('armor_shield_notes').value = char.armor_shield_notes;
  if ('armor_shield_penalty' in char && document.getElementById('armor_shield_penalty')) document.getElementById('armor_shield_penalty').value = char.armor_shield_penalty;
  
  if ('critical_injuries' in char && document.getElementById('critical_injuries')) document.getElementById('critical_injuries').value = char.critical_injuries;
  if ('addictions' in char && document.getElementById('addictions')) document.getElementById('addictions').value = char.addictions;
  if ('notes' in char && document.getElementById('notes')) document.getElementById('notes').value = char.notes;
  
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
  
  if (data.lifepath && Object.keys(data.lifepath).length > 0) {
    localStorage.setItem('lifepathData', JSON.stringify(data.lifepath));
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
  
  // Trigger global save to persist all data
  if (typeof saveAllCharacterData === 'function') {
    saveAllCharacterData();
  }
  
  setTimeout(() => {
    location.reload();
  }, 100);
}

// Load character data from localStorage on page load
function loadCharacterFromStorage() {
  const lifepathData = localStorage.getItem('lifepathData');
  if (lifepathData) {
    const data = JSON.parse(lifepathData);
    
    if ('impCurrent' in data && document.getElementById('imp-current')) {
      document.getElementById('imp-current').value = data.impCurrent;
    }
    if ('impMax' in data && document.getElementById('imp-max')) {
      document.getElementById('imp-max').value = data.impMax;
    }
    if ('repValue' in data && document.getElementById('rep-value')) {
      document.getElementById('rep-value').value = data.repValue;
    }
    if ('moneyTotal' in data && document.getElementById('money-total')) {
      document.getElementById('money-total').value = data.moneyTotal;
    }
  }
  
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
