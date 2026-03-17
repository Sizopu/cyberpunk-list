// Cyberdeck functionality
document.addEventListener('DOMContentLoaded', () => {
  initCyberdeck();
  initDiceRoller();
  loadCharacterFromStorage();

  // Auto-save on navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      savePrograms();
      saveHardware();
      saveCharacterToStorage();  // Only save lifepath fields, not full character data
    });
  });

  // Auto-save on page unload
  window.addEventListener('beforeunload', () => {
    savePrograms();
    saveHardware();
    saveCharacterToStorage();  // Only save lifepath fields
  });
});

let programsData = {};
let hardwareData = [];

// Save character data (all stats and fields from character sheet)
function saveCharacterData() {
  const charData = {};

  const statIds = ['stat_int', 'stat_ref', 'stat_dex', 'stat_tech', 'stat_cool', 'stat_will',
                   'stat_luck_current', 'stat_luck_max', 'stat_move', 'stat_body',
                   'stat_emp_current', 'stat_emp_max'];
  statIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) charData[id] = el.value;
  });

  const idFields = ['char-name', 'age', 'role', 'role_rank', 'xp_current', 'humanity_current', 'humanity_max', 'initiative'];
  idFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) charData[id] = el.value;
  });

  const healthFields = ['hp_current', 'hp_max', 'death_save'];
  healthFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) charData[id] = el.value;
  });
  
  const seriouslyWounded = document.getElementById('seriously_wounded');
  if (seriouslyWounded) charData['seriously_wounded'] = seriouslyWounded.checked;

  const armorFields = ['armor_head_sp', 'armor_head_notes', 'armor_head_penalty',
                       'armor_body_sp', 'armor_body_notes', 'armor_body_penalty',
                       'armor_shield_sp', 'armor_shield_notes', 'armor_shield_penalty'];
  armorFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) charData[id] = el.value;
  });

  const notesFields = ['critical_injuries', 'addictions', 'notes'];
  notesFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) charData[id] = el.value;
  });

  charStorage.setItem('characterData', JSON.stringify(charData));
}

// Save character data (lifepath fields that exist on this page)
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

  charStorage.setItem('lifepathData', JSON.stringify(lifepathData));
}

function initCyberdeck() {
  loadPrograms();
  loadHardware();
  createProgramRows();  // Create rows based on saved data
  renderPrograms();
  renderHardware();
  setupAddSectionButtons();
  setupDeleteProgramButtons();
  setupAddHardwareButton();
  setupCyberdeckInfo();
  setupInterfaceAbilities();
  setupNotes();
  setupHelpDialog();
  setupWeaponDiceListeners();
  setupProgramInputs();

  // Add event listeners for lifepath fields
  const impCurrent = document.getElementById('imp-current');
  const impMax = document.getElementById('imp-max');
  const repValue = document.getElementById('rep-value');
  const moneyTotal = document.getElementById('money-total');

  [impCurrent, impMax, repValue, moneyTotal].forEach(el => {
    if (el) {
      el.addEventListener('input', saveCharacterToStorage);
    }
  });
}

function createProgramRows() {
  const sections = ['poor', 'standard', 'excellent', 'cyberarm'];
  sections.forEach(section => {
    if (programsData[section] && programsData[section].length > 0) {
      // Create additional rows if we have saved data
      for (let i = 1; i < programsData[section].length; i++) {
        addProgramRow(section, false);  // false = don't save yet
      }
    }
  });
}

function setupProgramInputs() {
  console.log('setupProgramInputs called');
  
  // Direct listeners on existing inputs
  document.querySelectorAll('.program-name, .program-class, .program-stat, .program-atk-formula, .program-def-formula, .program-effect, .program-cost, .program-slots-input').forEach(input => {
    input.addEventListener('input', function() {
      console.log('Direct input changed, saving...');
      savePrograms();
    });
  });
  
  // Event delegation for dynamically added rows - listen on tbody
  const tbody = document.getElementById('programs-tbody');
  if (tbody) {
    tbody.addEventListener('input', function(e) {
      console.log('Delegated event on:', e.target.className);
      if (e.target.classList.contains('program-name') ||
          e.target.classList.contains('program-class') ||
          e.target.classList.contains('program-stat') ||
          e.target.classList.contains('program-atk-formula') ||
          e.target.classList.contains('program-def-formula') ||
          e.target.classList.contains('program-effect') ||
          e.target.classList.contains('program-cost') ||
          e.target.classList.contains('program-slots-input')) {
        console.log('Delegated input changed, saving...');
        savePrograms();
      }
    });
  }
}

// ==================== CYBERDECK INFO ====================
function setupCyberdeckInfo() {
  const inputs = ['deck-model', 'deck-icon', 'deck-net-actions', 'deck-black', 'deck-cost'];
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      const savedValue = charStorage.getItem(id);
      if (savedValue) {
        input.value = savedValue;
      }
      input.addEventListener('input', () => {
        charStorage.setItem(id, input.value);
      });
    }
  });
}

// ==================== INTERFACE ABILITIES ====================
function setupInterfaceAbilities() {
  const savedAbilities = charStorage.getItem('interfaceAbilities');
  if (savedAbilities) {
    const abilities = JSON.parse(savedAbilities);
    abilities.forEach(ability => {
      const checkbox = document.querySelector(`input[data-ability="${ability}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }

  document.querySelectorAll('.ability-label input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const abilities = [];
      document.querySelectorAll('.ability-label input[type="checkbox"]:checked').forEach(checked => {
        abilities.push(checked.dataset.ability);
      });
      charStorage.setItem('interfaceAbilities', JSON.stringify(abilities));
    });
  });
}

// ==================== NOTES ====================
function setupNotes() {
  const notesTextarea = document.getElementById('cyberdeck-notes');
  if (notesTextarea) {
    const savedValue = charStorage.getItem('cyberdeckNotes');
    if (savedValue) {
      notesTextarea.value = savedValue;
    }
    notesTextarea.addEventListener('input', () => {
      charStorage.setItem('cyberdeckNotes', notesTextarea.value);
    });
  }
}

// ==================== HELP DIALOG ====================
function setupHelpDialog() {
  const helpBtn = document.getElementById('cyberdeck-help-btn');
  const helpOverlay = document.getElementById('help-dialog-overlay');
  const helpClose = document.getElementById('help-dialog-close');
  const helpContent = document.getElementById('help-dialog-content');

  if (helpBtn) {
    helpBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('../text/cyberdeck.txt?' + Date.now());
        if (!response.ok) throw new Error('Failed to load');
        const text = await response.text();
        helpContent.textContent = text;
        helpOverlay.classList.add('active');
      } catch (error) {
        // Fallback: try to read from localStorage if fetch fails
        const cachedHelp = localStorage.getItem('cyberdeckHelpText');
        if (cachedHelp) {
          helpContent.textContent = cachedHelp;
        } else {
          helpContent.textContent = 'Cyberdeck Help\n\n' +
            'Model: Name of your cyberdeck\n' +
            'Icon: Visual representation\n' +
            'NET Actions: Actions per turn\n' +
            'Black: Black ICE resistance\n' +
            'Cost: Price in eurodollars\n\n' +
            'ATK: Attack formula (e.g., 2d6+3)\n' +
            'DEF: Defense formula (e.g., 1d10+2)\n' +
            'REZ: Program hit points\n\n' +
            'Slots: Total slots available\n' +
            'Program Slots: For software\n' +
            'Hardware Slots: For hardware modules';
        }
        helpOverlay.classList.add('active');
      }
    });
  }

  if (helpClose) {
    helpClose.addEventListener('click', () => {
      helpOverlay.classList.remove('active');
    });
  }

  if (helpOverlay) {
    helpOverlay.addEventListener('click', (e) => {
      if (e.target === helpOverlay) {
        helpOverlay.classList.remove('active');
      }
    });
  }
}

// ==================== PROGRAMS ====================
function loadPrograms() {
  const data = charStorage.getItem('programsData');
  console.log('Programs load:', data);

  if (data) {
    try {
      programsData = JSON.parse(data);
      console.log('Programs loaded:', programsData);
    } catch (e) {
      console.error('Error parsing programs:', e);
      programsData = { poor: [], standard: [], excellent: [], cyberarm: [] };
    }
  } else {
    programsData = { poor: [], standard: [], excellent: [], cyberarm: [] };
    console.log('No programs data found');
  }
}

function savePrograms() {
  programsData = { poor: [], standard: [], excellent: [], cyberarm: [] };

  const sections = ['poor', 'standard', 'excellent', 'cyberarm'];
  sections.forEach(section => {
    const rows = document.querySelectorAll(`.section-main-row[data-section="${section}"]`);

    rows.forEach(row => {
      const rowNum = row.getAttribute('data-row');

      // Collect ATK formulas
      const atkFormulas = [];
      row.querySelectorAll('.program-atk-formula').forEach(input => {
        atkFormulas.push(input.value || '');
      });

      // Collect DEF formulas
      const defFormulas = [];
      row.querySelectorAll('.program-def-formula').forEach(input => {
        defFormulas.push(input.value || '');
      });

      // Collect slots
      const slots = {};
      const slotsInputs = document.querySelectorAll(`.program-slots-input[data-section="${section}"][data-row="${rowNum}"]`);
      slotsInputs.forEach(input => {
        slots[input.dataset.slot] = input.value || '';
      });

      programsData[section][rowNum] = {
        name: row.querySelector('.program-name')?.value || '',
        class: row.querySelector('.program-class')?.value || '',
        per: row.querySelector('.program-stat[data-stat="per"]')?.value || '',
        spd: row.querySelector('.program-stat[data-stat="spd"]')?.value || '',
        atkFormulas: atkFormulas,
        defFormulas: defFormulas,
        rez: row.querySelector('.program-stat[data-stat="rez"]')?.value || '',
        effect: row.querySelector('.program-effect')?.value || '',
        cost: row.querySelector('.program-cost')?.value || '',
        slots: slots
      };
    });
  });

  charStorage.setItem('programsData', JSON.stringify(programsData));
  console.log('Programs saved:', programsData);
}

function renderPrograms() {
  console.log('Rendering programs, data:', programsData);
  
  const sections = ['poor', 'standard', 'excellent', 'cyberarm'];
  sections.forEach(section => {
    console.log(`Section ${section}:`, programsData[section]);
    
    if (programsData[section] && Array.isArray(programsData[section])) {
      programsData[section].forEach((program, row) => {
        console.log(`  Row ${row}:`, program);
        
        if (!program) return;

        const rowEl = document.querySelector(`.section-main-row[data-section="${section}"][data-row="${row}"]`);
        console.log(`  Element found:`, rowEl ? 'yes' : 'no');
        
        if (!rowEl) return;

        const nameInput = rowEl.querySelector('.program-name');
        const classInput = rowEl.querySelector('.program-class');
        const perInput = rowEl.querySelector('.program-stat[data-stat="per"]');
        const spdInput = rowEl.querySelector('.program-stat[data-stat="spd"]');
        const rezInput = rowEl.querySelector('.program-stat[data-stat="rez"]');
        const effectInput = rowEl.querySelector('.program-effect');
        const costInput = rowEl.querySelector('.program-cost');

        if (nameInput) nameInput.value = program.name || '';
        if (classInput) classInput.value = program.class || '';
        if (perInput) perInput.value = program.per || '';
        if (spdInput) spdInput.value = program.spd || '';
        if (rezInput) rezInput.value = program.rez || '';
        if (effectInput) effectInput.value = program.effect || '';
        if (costInput) costInput.value = program.cost || '';

        // Render ATK formula
        const atkInput = rowEl.querySelector('.program-atk-formula');
        if (atkInput && program.atkFormulas && program.atkFormulas.length > 0) {
          atkInput.value = program.atkFormulas[0] || '';
        }

        // Render DEF formula
        const defInput = rowEl.querySelector('.program-def-formula');
        if (defInput && program.defFormulas && program.defFormulas.length > 0) {
          defInput.value = program.defFormulas[0] || '';
        }

        // Render slots
        if (program.slots) {
          const slotsInputs = document.querySelectorAll(`.program-slots-input[data-section="${section}"][data-row="${row}"]`);
          slotsInputs.forEach(input => {
            const slotType = input.dataset.slot;
            if (program.slots[slotType] !== undefined) {
              input.value = program.slots[slotType];
            }
          });
        }
      });
    }
  });
}

// ==================== ADD/DELETE PROGRAM SECTIONS ====================
function setupAddSectionButtons() {
  document.getElementById('add-poor-btn')?.addEventListener('click', () => addProgramRow('poor'));
  document.getElementById('add-standard-btn')?.addEventListener('click', () => addProgramRow('standard'));
  document.getElementById('add-excellent-btn')?.addEventListener('click', () => addProgramRow('excellent'));
  document.getElementById('add-cyberarm-btn')?.addEventListener('click', () => addProgramRow('cyberarm'));
}

function setupDeleteProgramButtons() {
  console.log('setupDeleteProgramButtons called');
  document.addEventListener('click', function(e) {
    console.log('Click on:', e.target.className, e.target.dataset);
    if (e.target.classList.contains('delete-row-btn')) {
      const section = e.target.dataset.section;
      const row = e.target.dataset.row;
      console.log('Delete:', section, row);
      deleteProgramRow(section, row);
    }
  });
}

function addProgramRow(section, save = true) {
  const tbody = document.getElementById('programs-tbody');
  if (!tbody) return;

  const existingRows = document.querySelectorAll(`.section-main-row[data-section="${section}"]`);
  const newRowNum = existingRows.length;

  // Find the last sub-row of this section to insert after
  const lastMainRow = existingRows[existingRows.length - 1];
  let insertBefore = null;
  if (lastMainRow) {
    const lastSubRow = lastMainRow.nextElementSibling;
    if (lastSubRow && lastSubRow.classList.contains('section-sub-row')) {
      insertBefore = lastSubRow.nextElementSibling;
    }
  }

  // Create main row
  const mainTr = document.createElement('tr');
  mainTr.className = 'section-main-row section-divider';
  mainTr.dataset.section = section;
  mainTr.dataset.row = newRowNum;
  mainTr.innerHTML = `
    <td class="section-label-cell" rowspan="2">${section.charAt(0).toUpperCase() + section.slice(1)}</td>
    <td><input type="text" class="program-name" data-section="${section}" data-row="${newRowNum}"></td>
    <td><input type="text" class="program-class" data-section="${section}" data-row="${newRowNum}"></td>
    <td><input type="number" class="program-stat" data-section="${section}" data-row="${newRowNum}" data-stat="per"></td>
    <td><input type="number" class="program-stat" data-section="${section}" data-row="${newRowNum}" data-stat="spd"></td>
    <td>
      <div class="program-dice-wrapper">
        <input type="text" class="program-atk-formula" data-section="${section}" data-row="${newRowNum}" placeholder="ATK formula (e.g., 2d6+3)">
        <button class="program-roll-btn" data-section="${section}" data-row="${newRowNum}" data-type="atk" title="Roll ATK">🎲</button>
        <div class="program-dice-result" data-section="${section}" data-row="${newRowNum}" data-type="atk"></div>
      </div>
    </td>
    <td>
      <div class="program-dice-wrapper">
        <input type="text" class="program-def-formula" data-section="${section}" data-row="${newRowNum}" placeholder="DEF formula (e.g., 1d10+2)">
        <button class="program-roll-btn" data-section="${section}" data-row="${newRowNum}" data-type="def" title="Roll DEF">🎲</button>
        <div class="program-dice-result" data-section="${section}" data-row="${newRowNum}" data-type="def"></div>
      </div>
    </td>
    <td><input type="number" class="program-stat" data-section="${section}" data-row="${newRowNum}" data-stat="rez"></td>
    <td><input type="text" class="program-effect" data-section="${section}" data-row="${newRowNum}"></td>
    <td><input type="number" class="program-cost" data-section="${section}" data-row="${newRowNum}"></td>
    <td><button class="delete-row-btn" data-section="${section}" data-row="${newRowNum}" title="Delete">×</button></td>
  `;

  // Create sub row
  const subTr = document.createElement('tr');
  subTr.className = 'section-sub-row';
  subTr.dataset.section = section;
  subTr.dataset.row = newRowNum;
  subTr.innerHTML = `
    <td colspan="10" class="sub-row-content">
      <div class="sub-row-labels">
        <span>Slots</span>
        <span>Program Slots</span>
        <span>Hardware Slots</span>
      </div>
      <div class="sub-row-inputs">
        <input type="number" class="program-slots-input" data-section="${section}" data-row="${newRowNum}" data-slot="slots" placeholder="0">
        <input type="number" class="program-slots-input" data-section="${section}" data-row="${newRowNum}" data-slot="program" placeholder="0">
        <input type="number" class="program-slots-input" data-section="${section}" data-row="${newRowNum}" data-slot="hardware" placeholder="0">
      </div>
    </td>
  `;

  // Insert rows
  if (insertBefore) {
    tbody.insertBefore(mainTr, insertBefore);
    tbody.insertBefore(subTr, mainTr.nextSibling);
  } else {
    tbody.appendChild(mainTr);
    tbody.appendChild(subTr);
  }

  if (save) {
    savePrograms();
  }
}

function deleteProgramRow(section, row) {
  const mainRow = document.querySelector(`.section-main-row[data-section="${section}"][data-row="${row}"]`);
  const subRow = document.querySelector(`.section-sub-row[data-section="${section}"][data-row="${row}"]`);
  
  // Don't delete if it's the only row in this section
  const remainingRows = document.querySelectorAll(`.section-main-row[data-section="${section}"]`);
  if (remainingRows.length <= 1) {
    // Clear the values instead of deleting
    if (mainRow) {
      mainRow.querySelectorAll('input').forEach(input => {
        if (input.type === 'text' || input.type === 'number') {
          input.value = '';
        }
      });
      const resultDivs = mainRow.querySelectorAll('.program-dice-result');
      resultDivs.forEach(div => {
        div.classList.remove('active');
        div.innerHTML = '';
      });
    }
    if (subRow) {
      subRow.querySelectorAll('input').forEach(input => {
        input.value = '';
      });
    }
    savePrograms();
    return;
  }
  
  if (mainRow) mainRow.remove();
  if (subRow) subRow.remove();
  
  // Renumber remaining rows
  const newRemainingRows = document.querySelectorAll(`.section-main-row[data-section="${section}"]`);
  newRemainingRows.forEach((r, index) => {
    r.dataset.row = index;
    r.querySelectorAll('input, button').forEach(el => {
      if (el.dataset.row) el.dataset.row = index;
    });
    const subR = document.querySelector(`.section-sub-row[data-section="${section}"][data-row="${index}"]`);
    if (subR) {
      subR.dataset.row = index;
      subR.querySelectorAll('input').forEach(el => {
        if (el.dataset.row) el.dataset.row = index;
      });
    }
  });
  
  savePrograms();
}

// ==================== ATK/DEF SLOTS ====================
function setupWeaponDiceListeners() {
  // Use event delegation for roll buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('program-roll-btn')) {
      e.stopPropagation();
      const section = e.target.dataset.section;
      const row = e.target.dataset.row;
      const type = e.target.dataset.type;
      rollProgramDice(section, row, type, e.target);
    }
    
    if (e.target.classList.contains('close-result')) {
      e.stopPropagation();
      const resultDiv = e.target.closest('.program-dice-result');
      if (resultDiv) {
        resultDiv.classList.remove('active');
        resultDiv.innerHTML = '';
      }
    }
  });

  // Formula inputs - save on input (use event delegation)
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('program-atk-formula') || e.target.classList.contains('program-def-formula')) {
      savePrograms();
    }
  });
  
  // Enter to roll
  document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && (e.target.classList.contains('program-atk-formula') || e.target.classList.contains('program-def-formula'))) {
      e.preventDefault();
      const section = e.target.dataset.section;
      const row = e.target.dataset.row;
      const type = e.target.classList.contains('program-atk-formula') ? 'atk' : 'def';
      const btn = e.target.closest('.program-dice-wrapper')?.querySelector('.program-roll-btn');
      if (btn) rollProgramDice(section, row, type, btn);
    }
  });
}

function rollProgramDice(section, row, type, btn) {
  const wrapper = btn.closest('.program-dice-wrapper');
  const formulaInput = wrapper.querySelector(`.program-${type}-formula`);
  const resultDiv = wrapper.querySelector(`.program-dice-result[data-type="${type}"]`);
  const formula = formulaInput.value.trim();
  
  if (!formula) {
    alert('Please enter a formula (e.g., 2d6 + 3)');
    return;
  }
  
  // Parse formula (e.g., "2d6 + 3" or "1d10")
  const diceMatch = formula.match(/(\d+)[dD](\d+)\s*(?:\+\s*(\d+))?/);
  if (!diceMatch) {
    alert('Invalid formula. Use format: NdM + K (e.g., 2d6 + 3)');
    return;
  }
  
  const count = parseInt(diceMatch[1]);
  const sides = parseInt(diceMatch[2]);
  const bonus = parseInt(diceMatch[3] || '0');
  
  let rolls = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    sum += roll;
  }
  sum += bonus;
  
  const rollsHtml = rolls.map(r => {
    const isCrit = r === sides;
    const isFail = r === 1;
    const className = isCrit ? 'crit-success' : (isFail ? 'crit-fail' : '');
    return `<span class="dice-roll ${className}">${r}</span>`;
  }).join(' ');
  
  // Show result
  resultDiv.innerHTML = `
    <button class="close-result" type="button">×</button>
    <div class="roll-details">
      <span style="color: #8b949e;">${count}d${sides}:</span>
      <span class="dice-values">${rollsHtml}</span>
      <span style="color: #8b949e; margin-left: 6px;">= ${sum - bonus}</span>
    </div>
    <div class="total-line">
      <span class="total-label">Total:</span>
      <span class="total-value">${sum}</span>
      <span class="total-formula">(${rolls.join('+')} ${bonus > 0 ? '+ ' + bonus : ''}= ${sum})</span>
    </div>
  `;
  
  resultDiv.classList.add('active');
  
  // Save after roll
  savePrograms();
}

// ==================== HARDWARE ====================
function loadHardware() {
  const data = charStorage.getItem('hardwareData');
  console.log('Hardware load:', data);
  
  if (data) {
    try {
      hardwareData = JSON.parse(data);
      console.log('Hardware loaded:', hardwareData);
    } catch (e) {
      hardwareData = [];
    }
  }
  if (!Array.isArray(hardwareData)) {
    hardwareData = [];
  }
}

function saveHardware() {
  hardwareData = [];
  document.querySelectorAll('.hardware-row').forEach(row => {
    const rowNum = row.dataset.row;
    const nameInput = row.querySelector('.hardware-name');
    const effectInput = row.querySelector('.hardware-effect');
    const costInput = row.querySelector('.hardware-cost');

    hardwareData[rowNum] = {
      name: nameInput?.value || '',
      effect: effectInput?.value || '',
      cost: costInput?.value || ''
    };
  });
  charStorage.setItem('hardwareData', JSON.stringify(hardwareData));
  console.log('Hardware saved:', hardwareData);
}

function renderHardware() {
  const tbody = document.getElementById('hardware-tbody');
  if (!tbody) return;
  
  // Clear existing rows except the add row
  const addRow = tbody.querySelector('.hardware-add-row');
  tbody.innerHTML = '';
  
  if (hardwareData && hardwareData.length > 0) {
    hardwareData.forEach((item, row) => {
      const tr = document.createElement('tr');
      tr.className = 'hardware-row';
      tr.dataset.row = row;
      tr.innerHTML = `
        <td><input type="text" class="hardware-name" data-row="${row}" value="${item.name || ''}"></td>
        <td><input type="text" class="hardware-effect" data-row="${row}" value="${item.effect || ''}"></td>
        <td><input type="number" class="hardware-cost" data-row="${row}" value="${item.cost || ''}"></td>
        <td><button class="delete-hardware-btn" data-row="${row}" title="Delete">×</button></td>
      `;
      tbody.appendChild(tr);
      
      // Add event listeners
      tr.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', saveHardware);
      });
    });
  } else {
    // Add at least one empty row
    const tr = document.createElement('tr');
    tr.className = 'hardware-row';
    tr.dataset.row = 0;
    tr.innerHTML = `
      <td><input type="text" class="hardware-name" data-row="0"></td>
      <td><input type="text" class="hardware-effect" data-row="0"></td>
      <td><input type="number" class="hardware-cost" data-row="0"></td>
      <td><button class="delete-hardware-btn" data-row="0" title="Delete">×</button></td>
    `;
    tbody.appendChild(tr);
    
    tr.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', saveHardware);
    });
  }
  
  // Add the add row back
  if (addRow) {
    tbody.appendChild(addRow);
  } else {
    const newAddRow = document.createElement('tr');
    newAddRow.className = 'hardware-add-row';
    newAddRow.innerHTML = `
      <td colspan="4">
        <button class="add-hardware-btn" id="add-hardware-btn" title="Add Hardware Row">+ Add Hardware</button>
      </td>
    `;
    tbody.appendChild(newAddRow);
    
    document.getElementById('add-hardware-btn')?.addEventListener('click', addHardwareRow);
  }
  
  setupDeleteHardwareButtons();
}

function setupAddHardwareButton() {
  document.addEventListener('click', (e) => {
    if (e.target.id === 'add-hardware-btn') {
      addHardwareRow();
    }
  });
}

function setupDeleteHardwareButtons() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-hardware-btn')) {
      const row = e.target.dataset.row;
      deleteHardwareRow(row);
    }
  });
}

function addHardwareRow() {
  const tbody = document.getElementById('hardware-tbody');
  if (!tbody) return;
  
  const addRow = tbody.querySelector('.hardware-add-row');
  const existingRows = tbody.querySelectorAll('.hardware-row');
  const newRowNum = existingRows.length;
  
  const tr = document.createElement('tr');
  tr.className = 'hardware-row';
  tr.dataset.row = newRowNum;
  tr.innerHTML = `
    <td><input type="text" class="hardware-name" data-row="${newRowNum}"></td>
    <td><input type="text" class="hardware-effect" data-row="${newRowNum}"></td>
    <td><input type="number" class="hardware-cost" data-row="${newRowNum}"></td>
    <td><button class="delete-hardware-btn" data-row="${newRowNum}" title="Delete">×</button></td>
  `;
  
  if (addRow) {
    addRow.parentNode.insertBefore(tr, addRow);
  } else {
    tbody.appendChild(tr);
  }
  
  tr.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', saveHardware);
  });
  
  saveHardware();
}

function deleteHardwareRow(row) {
  const rowEl = document.querySelector(`.hardware-row[data-row="${row}"]`);
  if (rowEl) {
    rowEl.remove();
    
    // Renumber remaining rows
    const remainingRows = document.querySelectorAll('.hardware-row');
    remainingRows.forEach((r, index) => {
      r.dataset.row = index;
      r.querySelectorAll('input, button').forEach(el => {
        if (el.dataset.row) el.dataset.row = index;
      });
    });
    
    saveHardware();
  }
}

// ==================== DICE ROLLER ====================
function initDiceRoller() {
  const diceRollBtn = document.getElementById('dice-roll-btn');
  const diceDialogOverlay = document.getElementById('dice-dialog-overlay');
  const diceDialogClose = document.getElementById('dice-dialog-close');
  const diceDialogCancel = document.getElementById('dice-dialog-cancel');
  const diceRollConfirm = document.getElementById('dice-roll-confirm');
  const diceOptions = document.getElementById('dice-options');
  const diceResultSection = document.getElementById('dice-result-section');
  const diceRollsContainer = document.getElementById('dice-rolls');
  const diceTotalValue = document.getElementById('dice-total-value');
  const diceDescription = document.getElementById('dice-description');
  const diceCountInput = document.getElementById('dice-count');
  const diceCountDec = document.getElementById('dice-count-dec');
  const diceCountInc = document.getElementById('dice-count-inc');
  const diceTypeBtns = document.querySelectorAll('.dice-type-btn');

  let currentDiceType = 10;
  let currentDiceCount = 1;

  // Make variables accessible to performCustomRoll
  window.getCurrentDiceVars = function() {
    return { currentDiceType, currentDiceCount };
  };

  if (diceRollBtn) {
    diceRollBtn.addEventListener('click', () => {
      if (diceDialogOverlay) {
        diceDialogOverlay.classList.add('active');
        if (diceOptions) {
          diceOptions.style.display = 'flex';
        }
        if (diceResultSection) {
          diceResultSection.style.display = 'none';
        }
      }
    });
  }

  if (diceDialogClose) {
    diceDialogClose.addEventListener('click', () => {
      diceDialogOverlay.classList.remove('active');
    });
  }

  if (diceDialogCancel) {
    diceDialogCancel.addEventListener('click', () => {
      diceDialogOverlay.classList.remove('active');
    });
  }

  if (diceDialogOverlay) {
    diceDialogOverlay.addEventListener('click', (e) => {
      if (e.target === diceDialogOverlay) {
        diceDialogOverlay.classList.remove('active');
      }
    });
  }

  if (diceTypeBtns) {
    diceTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        diceTypeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDiceType = parseInt(btn.dataset.dice);
      });
    });
  }

  if (diceCountDec) {
    diceCountDec.addEventListener('click', () => {
      if (currentDiceCount > 1) {
        currentDiceCount--;
        diceCountInput.value = currentDiceCount;
      }
    });
  }

  if (diceCountInc) {
    diceCountInc.addEventListener('click', () => {
      if (currentDiceCount < 10) {
        currentDiceCount++;
        diceCountInput.value = currentDiceCount;
      }
    });
  }

  if (diceCountInput) {
    diceCountInput.addEventListener('change', () => {
      let val = parseInt(diceCountInput.value);
      if (val < 1) val = 1;
      if (val > 10) val = 10;
      currentDiceCount = val;
      diceCountInput.value = currentDiceCount;
    });
  }

  if (diceRollConfirm) {
    diceRollConfirm.addEventListener('click', () => {
      performCustomRoll();
    });
  }

  if (diceDialogOverlay) {
    diceDialogOverlay.addEventListener('click', (e) => {
      if (e.target === diceDialogOverlay) {
        diceDialogOverlay.classList.remove('active');
      }
    });
  }

  // Expose performCustomRoll with closure variables
  window.performCustomRoll = function() {
    if (!diceOptions || !diceResultSection) return;

    // Hide options, show results
    diceOptions.style.display = 'none';
    diceResultSection.style.display = 'flex';

    // Roll dice
    const rolls = [];
    for (let i = 0; i < currentDiceCount; i++) {
      rolls.push(Math.floor(Math.random() * currentDiceType) + 1);
    }

    const total = rolls.reduce((a, b) => a + b, 0);

    // Display result with animation
    displayDiceResult(rolls, total.toString(), `${currentDiceCount}d${currentDiceType}`, currentDiceType);
  };

  function displayDiceResult(rolls, totalText, description, diceType = 10) {
    const diceRollsContainer = document.getElementById('dice-rolls');
    const diceTotalValue = document.getElementById('dice-total-value');
    const diceDescription = document.getElementById('dice-description');

    if (!diceRollsContainer) return;

    // Clear previous results
    diceRollsContainer.innerHTML = '';

    // Display each die with staggered animation
    rolls.forEach((roll, index) => {
      const dieEl = document.createElement('div');
      dieEl.className = 'dice-roll-item';

      const isCritFail = roll === 1;
      const isCritSuccess = roll === diceType;

      if (isCritFail) dieEl.classList.add('crit-fail');
      if (isCritSuccess) dieEl.classList.add('crit-success');

      dieEl.textContent = roll;
      dieEl.style.opacity = '0';
      dieEl.style.transform = 'scale(0.5)';
      diceRollsContainer.appendChild(dieEl);

      // Animate each roll with delay
      setTimeout(() => {
        dieEl.style.transition = 'opacity 0.2s, transform 0.2s';
        dieEl.style.opacity = '1';
        dieEl.style.transform = 'scale(1)';
      }, index * 100);
    });

    // Animate total
    if (diceTotalValue) {
      diceTotalValue.style.opacity = '0';
      diceTotalValue.textContent = totalText;

      setTimeout(() => {
        diceTotalValue.style.transition = 'opacity 0.3s';
        diceTotalValue.style.opacity = '1';
      }, rolls.length * 100 + 100);
    }

    if (diceDescription) {
      diceDescription.textContent = description;
    }
  }
}

// ==================== CHARACTER DATA ====================
function loadCharacterFromStorage() {
  const charDataStr = charStorage.getItem('characterData');
  const charData = charDataStr ? JSON.parse(charDataStr) : {};

  const statIds = ['stat_int', 'stat_ref', 'stat_dex', 'stat_tech', 'stat_cool', 'stat_will',
                   'stat_luck_current', 'stat_luck_max', 'stat_move', 'stat_body',
                   'stat_emp_current', 'stat_emp_max'];
  statIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = charData[id] !== undefined ? charData[id] : '';
    }
  });

  const idFields = ['char-name', 'age', 'role', 'role_rank', 'xp_current', 'humanity_current', 'humanity_max', 'initiative'];
  idFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = charData[id] !== undefined ? charData[id] : '';
    }
  });

  const healthFields = ['hp_current', 'hp_max', 'death_save'];
  healthFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = charData[id] !== undefined ? charData[id] : '';
    }
  });

  const seriouslyWounded = document.getElementById('seriously_wounded');
  if (seriouslyWounded) {
    seriouslyWounded.checked = charData['seriously_wounded'] === true;
  }

  const armorFields = ['armor_head_sp', 'armor_head_notes', 'armor_head_penalty',
                       'armor_body_sp', 'armor_body_notes', 'armor_body_penalty',
                       'armor_shield_sp', 'armor_shield_notes', 'armor_shield_penalty'];
  armorFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = charData[id] !== undefined ? charData[id] : '';
    }
  });

  const notesFields = ['critical_injuries', 'addictions', 'notes'];
  notesFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = charData[id] !== undefined ? charData[id] : '';
    }
  });

  if (charData['avatar'] && typeof loadAvatar === 'function') {
    loadAvatar(charData['avatar']);
  }

  const lifepathData = JSON.parse(charStorage.getItem('lifepathData') || '{}');
  if (lifepathData.impCurrent && document.getElementById('imp-current')) {
    document.getElementById('imp-current').value = lifepathData.impCurrent;
  }
  if (lifepathData.impMax && document.getElementById('imp-max')) {
    document.getElementById('imp-max').value = lifepathData.impMax;
  }
  if (lifepathData.repValue && document.getElementById('rep-value')) {
    document.getElementById('rep-value').value = lifepathData.repValue;
  }
  if (lifepathData.moneyTotal && document.getElementById('money-total')) {
    document.getElementById('money-total').value = lifepathData.moneyTotal;
  }
}
