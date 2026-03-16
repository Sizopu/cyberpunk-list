const stats = {
  INT: "stat_int",
  REF: "stat_ref",
  DEX: "stat_dex",
  TECH: "stat_tech",
  COOL: "stat_cool",
  WILL: "stat_will",
  LUCK: "stat_luck_current",
  MOVE: "stat_move",
  BODY: "stat_body",
  EMP: "stat_emp_current"
};

// Character Profiles System
function getCurrentCharacterId() {
  return localStorage.getItem('currentCharacterId');
}

function getStorageKey(baseKey) {
  const charId = getCurrentCharacterId();
  if (charId) {
    return 'character_' + charId + '_' + baseKey;
  }
  return baseKey;
}

// Override localStorage for character-specific data
const charLocalStorage = {
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

// Skills that can have multiple entries (with add/remove buttons)
const expandableSkills = {
  "EDUCATION_SKILLS": ["language", "local expert", "science"],
  "FIGHTING_SKILLS": ["martial arts"],
  "PERFORMANCE_SKILLS": ["play instrument"]
};

const skillGroups = {
  "AWARENESS_SKILLS": [
    ["concentration", "WILL"],
    ["conceal/reveal object", "INT"],
    ["lip reading", "INT"],
    ["perception", "INT"],
    ["tracking", "INT"]
  ],
  "BODY_SKILLS": [
    ["athletics", "DEX"],
    ["contortionist", "DEX"],
    ["dance", "DEX"],
    ["endurance", "WILL"],
    ["resist torture/drugs", "WILL"],
    ["stealth", "DEX"]
  ],
  "CONTROL_SKILLS": [
    ["drive land vehicle", "REF"],
    ["pilot air vehicle", "REF"],
    ["pilot sea vehicle", "REF"],
    ["riding", "REF"]
  ],
  "EDUCATION_SKILLS": [
    ["accounting", "INT"],
    ["animal handling", "INT"],
    ["bureaucracy", "INT"],
    ["business", "INT"],
    ["composition", "INT"],
    ["criminology", "INT"],
    ["cryptography", "INT"],
    ["deduction", "INT"],
    ["education", "INT"],
    ["gamble", "INT"],
    ["language", "INT"],
    ["library search", "INT"],
    ["local expert", "INT"],
    ["science", "INT"],
    ["tactics", "INT"],
    ["wilderness survival", "INT"]
  ],
  "FIGHTING_SKILLS": [
    ["brawling", "DEX"],
    ["evasion", "DEX"],
    ["martial arts", "DEX"],
    ["melee weapon", "DEX"]
  ],
  "PERFORMANCE_SKILLS": [
    ["acting", "COOL"],
    ["play instrument", "COOL"]
  ],
  "RANGED_WEAPON_SKILLS": [
    ["archery", "REF"],
    ["autofire", "REF"],
    ["handgun", "REF"],
    ["heavy weapons", "REF"],
    ["shoulder arms", "REF"]
  ],
  "SOCIAL_SKILLS": [
    ["bribery", "COOL"],
    ["conversation", "EMP"],
    ["human perception", "EMP"],
    ["interrogation", "COOL"],
    ["persuasion", "COOL"],
    ["personal grooming", "COOL"],
    ["streetwise", "COOL"],
    ["trading", "COOL"],
    ["wardrobe/style", "COOL"]
  ],
  "TECHNIQUE_SKILLS": [
    ["air vehicle tech", "TECH"],
    ["basic tech", "TECH"],
    ["cybertech", "TECH"],
    ["demolitions", "TECH"],
    ["electronics/security tech", "TECH"],
    ["first aid", "TECH"],
    ["forgery", "TECH"],
    ["land vehicle tech", "TECH"],
    ["paint/draw/sculpt", "TECH"],
    ["paramedic", "TECH"],
    ["photography", "TECH"],
    ["pick lock", "TECH"],
    ["pick pocket", "DEX"],
    ["sea vehicle tech", "TECH"],
    ["weaponstech", "TECH"]
  ]
};

const skillsContainer = document.getElementById("skills-container");
const specialisedSkillsBody = document.getElementById("specialised-skills-body");
const weaponsContainer = document.getElementById("weapons-container");
const roleAbilityContainer = document.getElementById("role-ability-container");
const addWeaponBtn = document.getElementById("add-weapon-btn");

// Dice state for nav button
let currentDiceType = 10;
let currentDiceCount = 1;

// Generate main skills table
for (const group in skillGroups) {
  const groupDiv = document.createElement("div");
  groupDiv.className = "skill-group";

  const titleDiv = document.createElement("div");
  titleDiv.className = "skill-group-title";
  titleDiv.textContent = group.replaceAll("_", " ");
  groupDiv.appendChild(titleDiv);

  const table = document.createElement("table");
  table.className = "skill-table";
  table.innerHTML = `
    <tr>
      <th class="skill-name-cell">SKILL</th>
      <th>MOD</th>
      <th>LVL</th>
      <th>STAT</th>
      <th>BASE</th>
      <th></th>
    </tr>
  `;

  skillGroups[group].forEach(skill => {
    const tr = document.createElement("tr");
    tr.dataset.stat = skill[1];
    tr.dataset.skillName = skill[0];
    
    const isExpandable = expandableSkills[group] && expandableSkills[group].includes(skill[0]);
    
    tr.innerHTML = `
      <td class="skill-name-cell"><input type="text" class="skill-name-input" value="${skill[0]}" readonly></td>
      <td><input type="number" class="mod-input" value="0"></td>
      <td><input type="number" class="lvl-input" value="0"></td>
      <td><input type="text" class="stat-input-display" readonly></td>
      <td><input type="text" class="base-input" readonly></td>
      <td class="skill-action-cell">
        ${isExpandable ? '<button class="add-skill-btn" type="button" title="Add">+</button>' : ''}
        <button class="roll-skill-btn" type="button" title="Roll">🎲</button>
      </td>
    `;
    
    table.appendChild(tr);
    
    // Add click handler for add button
    if (isExpandable) {
      const addBtn = tr.querySelector(".add-skill-btn");
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        addExpandableSkillRow(group, skill[0], skill[1], tr);
      });
    }
    
    // Add click handler for roll button
    const rollBtn = tr.querySelector(".roll-skill-btn");
    rollBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const baseValue = parseInt(tr.querySelector(".base-input")?.value) || 0;
      performSkillRoll(baseValue, skill[0]);
    });
  });

  groupDiv.appendChild(table);
  skillsContainer.appendChild(groupDiv);
}

// Function to add an expandable skill row
function addExpandableSkillRow(group, skillName, statKey, referenceRow) {
  const tr = document.createElement("tr");
  tr.dataset.stat = statKey;
  tr.dataset.skillName = skillName;
  tr.className = "expandable-skill-row";
  
  tr.innerHTML = `
    <td class="skill-name-cell"><input type="text" class="skill-name-input" value="${skillName}" readonly></td>
    <td><input type="number" class="mod-input" value="0" min="0"></td>
    <td><input type="number" class="lvl-input" value="0" min="0" max="10"></td>
    <td><input type="text" class="stat-input-display" readonly></td>
    <td><input type="text" class="base-input" readonly></td>
    <td class="skill-action-cell">
      <button class="delete-skill-btn" type="button" title="Delete">×</button>
      <button class="roll-skill-btn" type="button" title="Roll">🎲</button>
    </td>
  `;
  
  // Add delete handler
  const deleteBtn = tr.querySelector(".delete-skill-btn");
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    tr.remove();
  });
  
  // Add roll handler
  const rollBtn = tr.querySelector(".roll-skill-btn");
  rollBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const baseValue = parseInt(tr.querySelector(".base-input")?.value) || 0;
    performSkillRoll(baseValue, skillName);
  });
  
  // Insert after the reference row
  referenceRow.parentNode.insertBefore(tr, referenceRow.nextSibling);
  
  // Update calculations
  updateRow(tr);
}

// Generate specialised skills rows (6 empty rows)
for (let i = 0; i < 6; i++) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" class="ss-stat"></td>
    <td><input type="text" class="ss-name"></td>
    <td><input type="number" class="ss-mod" value="0"></td>
    <td><input type="number" class="ss-lvl" value="0"></td>
    <td><input type="text" class="ss-stat-val" readonly></td>
    <td><input type="text" class="ss-base" readonly></td>
    <td class="ss-action-cell">
      <button class="roll-ss-btn" type="button" title="Roll">🎲</button>
      <button class="delete-ss-btn" type="button" title="Delete">×</button>
    </td>
  `;
  specialisedSkillsBody.appendChild(tr);
  
  // Add event listeners for initial rows
  const row = specialisedSkillsBody.querySelectorAll("tr")[i];
  const statInput = row.querySelector(".ss-stat");
  statInput.addEventListener("input", () => updateSpecialisedRow(row));
  
  const modInput = row.querySelector(".ss-mod");
  modInput.addEventListener("input", () => updateSpecialisedRow(row));
  
  const lvlInput = row.querySelector(".ss-lvl");
  lvlInput.addEventListener("input", () => updateSpecialisedRow(row));
  
  const rollBtn = row.querySelector(".roll-ss-btn");
  rollBtn.addEventListener("click", () => {
    const baseValue = parseInt(row.querySelector(".ss-base")?.value) || 0;
    const skillName = row.querySelector(".ss-name")?.value || "Specialised Skill";
    performSkillRoll(baseValue, skillName);
  });
  
  const deleteBtn = row.querySelector(".delete-ss-btn");
  deleteBtn.addEventListener("click", () => {
    const rows = specialisedSkillsBody.querySelectorAll("tr");
    if (rows.length > 1) {
      row.remove();
      saveAllCharacterData();
    }
  });
}

// Add specialised skill row button
const addSsBtn = document.getElementById("add-ss-btn");
if (addSsBtn) {
  addSsBtn.addEventListener("click", () => {
    addSpecialisedSkillRow();
  });
}

// Function to add specialised skill row
function addSpecialisedSkillRow() {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" class="ss-stat"></td>
    <td><input type="text" class="ss-name"></td>
    <td><input type="number" class="ss-mod" value="0"></td>
    <td><input type="number" class="ss-lvl" value="0"></td>
    <td><input type="text" class="ss-stat-val" readonly></td>
    <td><input type="text" class="ss-base" readonly></td>
    <td class="ss-action-cell">
      <button class="roll-ss-btn" type="button" title="Roll">🎲</button>
      <button class="delete-ss-btn" type="button" title="Delete">×</button>
    </td>
  `;
  specialisedSkillsBody.appendChild(tr);
  updateSpecialisedRow(tr);
  
  // Add event listeners
  const statInput = tr.querySelector(".ss-stat");
  statInput.addEventListener("input", () => updateSpecialisedRow(tr));
  
  const modInput = tr.querySelector(".ss-mod");
  modInput.addEventListener("input", () => updateSpecialisedRow(tr));
  
  const lvlInput = tr.querySelector(".ss-lvl");
  lvlInput.addEventListener("input", () => updateSpecialisedRow(tr));
  
  const rollBtn = tr.querySelector(".roll-ss-btn");
  rollBtn.addEventListener("click", () => {
    const baseValue = parseInt(tr.querySelector(".ss-base")?.value) || 0;
    const skillName = tr.querySelector(".ss-name")?.value || "Specialised Skill";
    performSkillRoll(baseValue, skillName);
  });
  
  const deleteBtn = tr.querySelector(".delete-ss-btn");
  deleteBtn.addEventListener("click", () => {
    // Don't delete if it's the last row
    const rows = specialisedSkillsBody.querySelectorAll("tr");
    if (rows.length > 1) {
      tr.remove();
      saveAllCharacterData();
    }
  });
}

// Generate initial weapon rows (6 weapons)
for (let i = 0; i < 6; i++) {
  addWeaponRow();
}

// Add role ability entries (3 total)
for (let i = 0; i < 2; i++) {
  addRoleAbilityEntry();
}

// Function to add a role ability entry
function addRoleAbilityEntry() {
  const entry = document.createElement("div");
  entry.className = "role-ability-entry";
  entry.innerHTML = `
    <input type="text" class="role-ability-name" placeholder="Ability name">
    <input type="number" class="role-ability-lvl" placeholder="LVL" min="1" max="10">
  `;
  roleAbilityContainer.appendChild(entry);
}

// Function to add a weapon row
function addWeaponRow() {
  const weaponRow = document.createElement("div");
  weaponRow.className = "weapon-row";
  weaponRow.innerHTML = `
    <div class="weapon-label">Weapon</div>
    <div class="weapon-label">DMG</div>
    <div class="weapon-label">MAG</div>
    <div class="weapon-label">ROF</div>
    <div></div>
    <input type="text" class="weapon-name-input" placeholder="Weapon name">
    <input type="text" class="weapon-dmg-input" placeholder="DMG">
    <input type="text" class="weapon-mag-input" placeholder="MAG">
    <input type="text" class="weapon-rof-input" placeholder="ROF">
    <button class="delete-btn" type="button" title="Delete">×</button>
    <div class="weapon-dice-container">
      <div class="attack-slots">
        <div class="attack-slot">
          <input type="text" class="weapon-dice-formula" placeholder="3d6 + 2d10 + 5">
          <button class="weapon-roll-btn" type="button" title="Roll Damage">🎲</button>
          <button class="remove-attack-btn" type="button" title="Remove attack" style="display:none;">−</button>
          <input type="text" class="weapon-attack-notes" placeholder="Attack notes (e.g., headshot, burst)">
        </div>
      </div>
      <button class="add-attack-btn" type="button" title="Add attack">+ Attack</button>
    </div>
    <div class="weapon-notes">
      <span class="weapon-notes-label">NOTES</span>
      <input type="text" class="weapon-notes-input" placeholder="Notes">
    </div>
  `;

  // Add delete functionality
  const deleteBtn = weaponRow.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    weaponRow.remove();
  });

  // Add dice roll functionality
  setupWeaponDiceListeners(weaponRow);
  
  // Add attack button functionality
  const addAttackBtn = weaponRow.querySelector('.add-attack-btn');
  addAttackBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    addAttackSlot(weaponRow);
  });

  weaponsContainer.appendChild(weaponRow);
}

// Настройка слушателей для кубиков оружия
function setupWeaponDiceListeners(weaponRow) {
  const attackSlots = weaponRow.querySelector('.attack-slots');
  
  const rollBtns = weaponRow.querySelectorAll('.weapon-roll-btn');
  rollBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const attackSlot = newBtn.closest('.attack-slot');
      const formulaInput = attackSlot.querySelector('.weapon-dice-formula');
      const formula = formulaInput.value.trim();
      if (formula && typeof window.rollWeaponDice === 'function') {
        window.rollWeaponDice(formula, weaponRow, attackSlot);
      } else if (formula) {
        rollWeaponDiceFallback(formula, weaponRow, attackSlot);
      }
    });
  });
  
  const formulaInputs = weaponRow.querySelectorAll('.weapon-dice-formula');
  formulaInputs.forEach(input => {
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    
    newInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const attackSlot = newInput.closest('.attack-slot');
        const formula = newInput.value.trim();
        if (formula && typeof window.rollWeaponDice === 'function') {
          window.rollWeaponDice(formula, weaponRow, attackSlot);
        } else if (formula) {
          rollWeaponDiceFallback(formula, weaponRow, attackSlot);
        }
      }
    });
  });
  
  // Настройка кнопок удаления
  const removeBtns = weaponRow.querySelectorAll('.remove-attack-btn');
  removeBtns.forEach(btn => {
    if (btn.style.display !== 'none') {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const attackSlot = newBtn.closest('.attack-slot');
        attackSlot.remove();
      });
    }
  });
}

// Добавление слота атаки
function addAttackSlot(weaponRow) {
  const attackSlots = weaponRow.querySelector('.attack-slots');
  
  const attackSlot = document.createElement('div');
  attackSlot.className = 'attack-slot';
  attackSlot.innerHTML = `
    <input type="text" class="weapon-dice-formula" placeholder="3d6 + 2d10 + 5">
    <button class="weapon-roll-btn" type="button" title="Roll Damage">🎲</button>
    <button class="remove-attack-btn" type="button" title="Remove attack">−</button>
    <input type="text" class="weapon-attack-notes" placeholder="Attack notes (e.g., headshot, burst)">
  `;
  
  attackSlots.appendChild(attackSlot);
  setupWeaponDiceListeners(weaponRow);
  
  // Настройка кнопки удаления
  const removeBtn = attackSlot.querySelector('.remove-attack-btn');
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    attackSlot.remove();
  });
  
  // Фокус на новом поле
  const newInput = attackSlot.querySelector('.weapon-dice-formula');
  newInput.focus();
}

// Fallback dice roll function (если weapon-dice.js ещё не загружен)
function rollWeaponDiceFallback(formula, weaponRow, attackSlot = null) {
  // Простой парсинг: NdM + K
  const diceMatch = formula.match(/(\d+)[dD](\d+)\s*(?:\+\s*(\d+))?/);
  if (diceMatch) {
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
    
    // Определяем куда добавлять результат
    let resultContainer;
    if (attackSlot) {
      resultContainer = attackSlot.querySelector('.attack-dice-result');
      if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.className = 'attack-dice-result';
        attackSlot.appendChild(resultContainer);
      }
    } else {
      resultContainer = weaponRow.querySelector('.weapon-dice-result');
      if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.className = 'weapon-dice-result';
        weaponRow.appendChild(resultContainer);
      }
    }
    
    resultContainer.innerHTML = `
      <div class="weapon-dice-detail">
        <div class="weapon-dice-group">
          <span class="dice-type">${count}d${sides}:</span>
          <span class="dice-values">${rollsHtml}</span>
          <span class="dice-sum">= ${sum - bonus}</span>
        </div>
      </div>
      <div class="weapon-dice-total">
        <span class="total-label">Итого:</span>
        <span class="total-value">${sum}</span>
        <span class="total-formula">(${rolls.join('+')} ${bonus > 0 ? '+ ' + bonus : ''}= ${sum})</span>
      </div>
      <button class="weapon-dice-clear" type="button">×</button>
    `;
    
    resultContainer.querySelector('.weapon-dice-clear').addEventListener('click', () => {
      resultContainer.remove();
    });
  }
}

// Add weapon button event listener
addWeaponBtn.addEventListener("click", addWeaponRow);

// Update row calculation
function updateRow(row) {
  const statKey = row.dataset.stat;
  if (!statKey) return;

  const statId = stats[statKey];
  const statValue = parseInt(document.getElementById(statId)?.value) || 0;
  const mod = parseInt(row.querySelector(".mod-input")?.value) || 0;
  const lvl = parseInt(row.querySelector(".lvl-input")?.value) || 0;

  const statDisplay = row.querySelector(".stat-input-display");
  const baseDisplay = row.querySelector(".base-input");

  if (statDisplay) statDisplay.value = statValue;
  if (baseDisplay) baseDisplay.value = statValue + mod + lvl;
}

// Update specialised skill row
function updateSpecialisedRow(row) {
  const statKey = row.querySelector(".ss-stat")?.value.toUpperCase();
  const statId = stats[statKey];
  const statValue = statId ? (parseInt(document.getElementById(statId)?.value) || 0) : 0;
  const mod = parseInt(row.querySelector(".ss-mod")?.value) || 0;
  const lvl = parseInt(row.querySelector(".ss-lvl")?.value) || 0;

  const statValDisplay = row.querySelector(".ss-stat-val");
  const baseDisplay = row.querySelector(".ss-base");

  if (statValDisplay) statValDisplay.value = statValue;
  if (baseDisplay) baseDisplay.value = statValue + mod + lvl;
}

// Update all skill rows
function updateAllSkills() {
  document.querySelectorAll(".skill-table tr").forEach(row => {
    if (row.dataset.stat) updateRow(row);
  });
}

// Update all specialised skill rows
function updateAllSpecialised() {
  document.querySelectorAll("#specialised-skills-body tr").forEach(row => {
    updateSpecialisedRow(row);
  });
}

// Event listeners
document.addEventListener("input", (e) => {
  const target = e.target;

  // Main skill mod/lvl changes
  if (target.classList.contains("mod-input") || target.classList.contains("lvl-input")) {
    updateRow(target.closest("tr"));
  }

  // Stat changes
  if (target.classList.contains("stat-input")) {
    updateAllSkills();
    updateAllSpecialised();
  }

  // Specialised skill changes
  if (target.classList.contains("ss-stat") || target.classList.contains("ss-mod") || target.classList.contains("ss-lvl")) {
    updateSpecialisedRow(target.closest("tr"));
  }
});

// Initialize on load
window.onload = () => {
  updateAllSkills();
  updateAllSpecialised();
  initDiceRoller();
  initSaveLoad();
  loadAllCharacterData();
};

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
      // Update totals
      if (typeof updateTotalWeight === 'function') updateTotalWeight();
      if (typeof updateTotalMoney === 'function') updateTotalMoney();
    }
  }
}

// Save character data to localStorage
function saveCharacterToStorage() {
  const lifepathData = JSON.parse(localStorage.getItem('lifepathData') || '{}');

  // Save Improvement Points
  if (document.getElementById('imp-current')) {
    lifepathData.impCurrent = document.getElementById('imp-current').value;
  }
  if (document.getElementById('imp-max')) {
    lifepathData.impMax = document.getElementById('imp-max').value;
  }
  // Save Reputation
  if (document.getElementById('rep-value')) {
    lifepathData.repValue = document.getElementById('rep-value').value;
  }
  // Save Money Total
  if (document.getElementById('money-total')) {
    lifepathData.moneyTotal = document.getElementById('money-total').value;
  }

  localStorage.setItem('lifepathData', JSON.stringify(lifepathData));
}

// Save all character stats and data to localStorage
function saveAllCharacterData() {
  const charData = {};
  
  // Stats
  const statIds = ['stat_int', 'stat_ref', 'stat_dex', 'stat_tech', 'stat_cool', 'stat_will', 
                   'stat_luck_current', 'stat_luck_max', 'stat_move', 'stat_body', 
                   'stat_emp_current', 'stat_emp_max'];
  statIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) charData[id] = el.value;
  });
  
  // ID Block
  const idFields = ['char_name', 'age', 'role', 'role_rank', 'humanity_current', 'humanity_max', 'initiative'];
  idFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) charData[id] = el.value;
  });
  
  // Health
  const healthFields = ['hp_current', 'hp_max', 'death_save'];
  healthFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) charData[id] = el.value;
  });
  const seriouslyWounded = document.getElementById('seriously_wounded');
  if (seriouslyWounded) charData['seriously_wounded'] = seriouslyWounded.checked;
  
  // Armor
  const armorFields = ['armor_head_sp', 'armor_head_notes', 'armor_head_penalty',
                       'armor_body_sp', 'armor_body_notes', 'armor_body_penalty',
                       'armor_shield_sp', 'armor_shield_notes', 'armor_shield_penalty'];
  armorFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) charData[id] = el.value;
  });
  
  // Notes
  const notesFields = ['critical_injuries', 'addictions', 'notes'];
  notesFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) charData[id] = el.value;
  });
  
  localStorage.setItem('characterData', JSON.stringify(charData));
  charLocalStorage.setItem('characterData', JSON.stringify(charData));
  
  // Also save role abilities
  const roleAbilities = Array.from(document.querySelectorAll('.role-ability-entry')).map(entry => ({
    name: entry.querySelector('.role-ability-name')?.value || '',
    lvl: entry.querySelector('.role-ability-lvl')?.value || ''
  }));
  charLocalStorage.setItem('roleAbilitiesData', JSON.stringify(roleAbilities));
  
  // Save weapons
  const weapons = Array.from(document.querySelectorAll('.weapon-row')).map(row => ({
    name: row.querySelector('.weapon-name-input')?.value || '',
    dmg: row.querySelector('.weapon-dmg-input')?.value || '',
    mag: row.querySelector('.weapon-mag-input')?.value || '',
    rof: row.querySelector('.weapon-rof-input')?.value || '',
    notes: row.querySelector('.weapon-notes-input')?.value || '',
    diceFormulas: Array.from(row.querySelectorAll('.weapon-dice-formula')).map(input => input.value || ''),
    attackNotes: Array.from(row.querySelectorAll('.weapon-attack-notes')).map(input => input.value || '')
  }));
  charLocalStorage.setItem('weaponsData', JSON.stringify(weapons));
  
  // Save skills
  const skills = Array.from(document.querySelectorAll('.skill-table tr[data-stat]')).map(row => ({
    skillName: row.querySelector('.skill-name-input')?.value || '',
    mod: row.querySelector('.mod-input')?.value || '0',
    lvl: row.querySelector('.lvl-input')?.value || '0',
    stat: row.dataset.stat
  }));
  charLocalStorage.setItem('skillsData', JSON.stringify(skills));
  
  // Save specialised skills
  const specialisedSkills = Array.from(document.querySelectorAll('#specialised-skills-body tr')).map(row => ({
    stat: row.querySelector('.ss-stat')?.value || '',
    name: row.querySelector('.ss-name')?.value || '',
    mod: row.querySelector('.ss-mod')?.value || '0',
    lvl: row.querySelector('.ss-lvl')?.value || '0'
  }));
  charLocalStorage.setItem('specialisedSkillsData', JSON.stringify(specialisedSkills));
  
  saveCharacterToStorage();
}

// Load all character data from localStorage
function loadAllCharacterData() {
  const charData = JSON.parse(charLocalStorage.getItem('characterData') || '{}');
  
  // Stats
  const statIds = ['stat_int', 'stat_ref', 'stat_dex', 'stat_tech', 'stat_cool', 'stat_will', 
                   'stat_luck_current', 'stat_luck_max', 'stat_move', 'stat_body', 
                   'stat_emp_current', 'stat_emp_max'];
  statIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && charData[id]) el.value = charData[id];
  });
  
  // ID Block
  const idFields = ['char_name', 'age', 'role', 'role_rank', 'humanity_current', 'humanity_max', 'initiative'];
  idFields.forEach(id => {
    const el = document.getElementById(id);
    if (el && charData[id]) el.value = charData[id];
  });
  
  // Health
  const healthFields = ['hp_current', 'hp_max', 'death_save'];
  healthFields.forEach(id => {
    const el = document.getElementById(id);
    if (el && charData[id]) el.value = charData[id];
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
    if (el && charData[id]) el.value = charData[id];
  });
  
  // Notes
  const notesFields = ['critical_injuries', 'addictions', 'notes'];
  notesFields.forEach(id => {
    const el = document.getElementById(id);
    if (el && charData[id]) el.value = charData[id];
  });
  
  // Load role abilities
  const roleAbilities = JSON.parse(charLocalStorage.getItem('roleAbilitiesData') || '[]');
  if (roleAbilities.length > 0) {
    const roleAbilityContainer = document.getElementById('role-ability-container');
    if (roleAbilityContainer) {
      roleAbilityContainer.innerHTML = '';
      roleAbilities.forEach(ability => {
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
  
  // Load weapons
  const weapons = JSON.parse(charLocalStorage.getItem('weaponsData') || '[]');
  if (weapons.length > 0) {
    const weaponsContainer = document.getElementById('weapons-container');
    if (weaponsContainer) {
      weaponsContainer.innerHTML = '';
      weapons.forEach(weapon => {
        const weaponRow = document.createElement('div');
        weaponRow.className = 'weapon-row';
        
        // Поддержка нескольких атак (diceFormulas - массив) или одной (diceFormula - строка)
        const diceFormulas = weapon.diceFormulas || (weapon.diceFormula ? [weapon.diceFormula] : ['']);
        const attackNotes = weapon.attackNotes || [];

        let attackSlotsHtml = '';
        diceFormulas.forEach((formula, index) => {
          attackSlotsHtml += `
            <div class="attack-slot">
              <input type="text" class="weapon-dice-formula" placeholder="3d6 + 2d10 + 5" value="${formula || ''}">
              <button class="weapon-roll-btn" type="button" title="Roll Damage">🎲</button>
              <button class="remove-attack-btn" type="button" title="Remove attack" style="${index === 0 ? 'display:none;' : ''}">−</button>
              <input type="text" class="weapon-attack-notes" placeholder="Attack notes" value="${attackNotes[index] || ''}">
            </div>
          `;
        });
        
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
          <div class="weapon-dice-container">
            <div class="attack-slots">
              ${attackSlotsHtml}
            </div>
            <button class="add-attack-btn" type="button" title="Add attack">+ Attack</button>
          </div>
          <div class="weapon-notes">
            <span class="weapon-notes-label">NOTES</span>
            <input type="text" class="weapon-notes-input" placeholder="Notes" value="${weapon.notes || ''}">
          </div>
        `;

        const deleteBtn = weaponRow.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => weaponRow.remove());

        // Add dice roll functionality
        setupWeaponDiceListeners(weaponRow);
        
        // Add attack button functionality
        const addAttackBtn = weaponRow.querySelector('.add-attack-btn');
        addAttackBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          addAttackSlot(weaponRow);
        });
        
        // Setup remove buttons
        const removeBtns = weaponRow.querySelectorAll('.remove-attack-btn');
        removeBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const attackSlot = btn.closest('.attack-slot');
            attackSlot.remove();
          });
        });

        weaponsContainer.appendChild(weaponRow);
      });
    }
  }
  
  // Load skills
  const skills = JSON.parse(charLocalStorage.getItem('skillsData') || '[]');
  if (skills.length > 0) {
    skills.forEach(skill => {
      const row = document.querySelector(`.skill-table tr[data-stat="${skill.stat}"][data-skill-name="${skill.skillName}"]`);
      if (row) {
        const modInput = row.querySelector('.mod-input');
        const lvlInput = row.querySelector('.lvl-input');
        if (modInput && skill.mod) modInput.value = skill.mod;
        if (lvlInput && skill.lvl) lvlInput.value = skill.lvl;
        updateRow(row);
      }
    });
  }
  
  // Load specialised skills
  const specialisedSkills = JSON.parse(charLocalStorage.getItem('specialisedSkillsData') || '[]');
  if (specialisedSkills.length > 0) {
    const specRows = document.querySelectorAll('#specialised-skills-body tr');
    
    // Если данных больше чем строк, добавляем новые
    if (specialisedSkills.length > specRows.length) {
      for (let i = specRows.length; i < specialisedSkills.length; i++) {
        addSpecialisedSkillRow();
      }
    }
    
    const updatedRows = document.querySelectorAll('#specialised-skills-body tr');
    specialisedSkills.forEach((skill, index) => {
      if (index < updatedRows.length) {
        const row = updatedRows[index];
        const statInput = row.querySelector('.ss-stat');
        const nameInput = row.querySelector('.ss-name');
        const modInput = row.querySelector('.ss-mod');
        const lvlInput = row.querySelector('.ss-lvl');
        if (statInput && skill.stat) statInput.value = skill.stat;
        if (nameInput && skill.name) nameInput.value = skill.name;
        if (modInput && skill.mod) modInput.value = skill.mod;
        if (lvlInput && skill.lvl) lvlInput.value = skill.lvl;
        updateSpecialisedRow(row);
      }
    });
  }
  
  loadCharacterFromStorage();
}

// Add event listeners for character data saving
document.addEventListener('DOMContentLoaded', () => {
  const impCurrent = document.getElementById('imp-current');
  const impMax = document.getElementById('imp-max');
  const repValue = document.getElementById('rep-value');
  const moneyTotal = document.getElementById('money-total');

  [impCurrent, impMax, repValue, moneyTotal].forEach(el => {
    if (el) {
      el.addEventListener('input', saveCharacterToStorage);
    }
  });
  
  // Global auto-save for all inputs on the page
  document.addEventListener('input', (e) => {
    // Save on any input change with debounce
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(() => {
        saveAllCharacterData();
      }, 500);
    }
  });
  
  // Save before page unload
  window.addEventListener('beforeunload', () => {
    saveAllCharacterData();
  });
});

// Dice Roller Functions
function initDiceRoller() {
  const diceBtn = document.getElementById("dice-roll-btn");
  const dialogOverlay = document.getElementById("dice-dialog-overlay");
  const dialogClose = document.getElementById("dice-dialog-close");
  const dialogCancel = document.getElementById("dice-dialog-cancel");
  const diceRollConfirm = document.getElementById("dice-roll-confirm");
  const diceTypeBtns = document.querySelectorAll(".dice-type-btn");
  const diceCountDec = document.getElementById("dice-count-dec");
  const diceCountInc = document.getElementById("dice-count-inc");
  const diceCountInput = document.getElementById("dice-count");

  if (!dialogOverlay) return;

  // Initialize global dice state if not exists
  if (window.currentDiceType === undefined) window.currentDiceType = 10;
  if (window.currentDiceCount === undefined) window.currentDiceCount = 1;

  // Open dialog from nav button (with dice selection)
  if (diceBtn) {
    diceBtn.addEventListener("click", () => {
      resetDiceOptions();
      dialogOverlay.classList.add("active");
    });
  }

  // Close dialog
  function closeDialog() {
    dialogOverlay.classList.remove("active");
  }

  if (dialogClose) dialogClose.addEventListener("click", closeDialog);
  if (dialogCancel) dialogCancel.addEventListener("click", closeDialog);

  // Close on overlay click
  dialogOverlay.addEventListener("click", (e) => {
    if (e.target === dialogOverlay) {
      closeDialog();
    }
  });

  // Close button in result section
  if (dialogCancel) {
    dialogCancel.addEventListener("click", closeDialog);
  }

  // Dice type selection
  diceTypeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      diceTypeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      window.currentDiceType = parseInt(btn.dataset.dice);
    });
  });

  // Dice count controls
  if (diceCountDec && diceCountInput) {
    diceCountDec.addEventListener("click", () => {
      let count = parseInt(diceCountInput.value) || 1;
      if (count > 1) {
        diceCountInput.value = count - 1;
        window.currentDiceCount = count - 1;
      }
    });
  }

  if (diceCountInc && diceCountInput) {
    diceCountInc.addEventListener("click", () => {
      let count = parseInt(diceCountInput.value) || 1;
      if (count < 10) {
        diceCountInput.value = count + 1;
        window.currentDiceCount = count + 1;
      }
    });
  }

  if (diceCountInput) {
    diceCountInput.addEventListener("change", () => {
      let count = parseInt(diceCountInput.value) || 1;
      count = Math.max(1, Math.min(10, count));
      diceCountInput.value = count;
      window.currentDiceCount = count;
    });
  }

  // Roll confirm button
  if (diceRollConfirm) {
    diceRollConfirm.addEventListener("click", () => {
      performCustomRoll();
    });
  }
  
  // Initiative roll button (main page only)
  const rollInitBtn = document.getElementById("roll-init-btn");
  if (rollInitBtn) {
    rollInitBtn.addEventListener("click", () => {
      const refValue = parseInt(document.getElementById("stat_ref")?.value) || 0;
      performInitiativeRoll(refValue);
    });
  }
}

// Perform initiative roll (1d10 + REF)
function performInitiativeRoll(refValue) {
  const dialogOverlay = document.getElementById("dice-dialog-overlay");
  if (!dialogOverlay) return;

  // Show dialog
  dialogOverlay.classList.add("active");

  // Hide options, show results section
  document.getElementById("dice-options").style.display = "none";
  document.getElementById("dice-result-section").style.display = "flex";

  // Roll 1d10
  const roll = Math.floor(Math.random() * 10) + 1;
  const total = roll + refValue;

  // Display result with animation
  displayDiceResult([roll], `${roll} + ${refValue} = ${total}`, `1d10 + ${refValue} (Initiative)`, true, 10);
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
  // Get all characters
  const characters = JSON.parse(localStorage.getItem('characters') || '[]');
  
  // Collect all characters data
  const allCharactersData = [];
  
  characters.forEach(char => {
    const charDataKey = 'character_' + char.id;
    const charFullData = {
      profile: char,
      character: {},
      roleAbilities: [],
      weapons: [],
      skills: [],
      specialisedSkills: [],
      lifepath: {},
      inventory: [],
      cyberware: [],
      notes: [],
      mobs: [],
      moneyTotal: ''
    };
    
    // Load character-specific data
    const charSpecificData = JSON.parse(localStorage.getItem(charDataKey + '_characterData') || '{}');
    charFullData.character = charSpecificData;
    
    charFullData.roleAbilities = JSON.parse(localStorage.getItem(charDataKey + '_roleAbilitiesData') || '[]');
    charFullData.weapons = JSON.parse(localStorage.getItem(charDataKey + '_weaponsData') || '[]');
    charFullData.skills = JSON.parse(localStorage.getItem(charDataKey + '_skillsData') || '[]');
    charFullData.specialisedSkills = JSON.parse(localStorage.getItem(charDataKey + '_specialisedSkillsData') || '[]');
    charFullData.lifepath = JSON.parse(localStorage.getItem(charDataKey + '_lifepathData') || '{}');
    charFullData.inventory = JSON.parse(localStorage.getItem(charDataKey + '_inventoryData') || '[]');
    charFullData.cyberware = JSON.parse(localStorage.getItem(charDataKey + '_cyberwareImplants') || '[]');
    charFullData.notes = JSON.parse(localStorage.getItem(charDataKey + '_notesData') || '[]');
    charFullData.mobs = JSON.parse(localStorage.getItem(charDataKey + '_mobsData') || '[]');
    charFullData.moneyTotal = localStorage.getItem(charDataKey + '_moneyTotal') || '';
    
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

// Helper function to safely get element value
function getElementValue(id) {
  const el = document.getElementById(id);
  return el ? (el.value || '') : '';
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
  // Check if this is a multi-character export (version 2.0)
  if (data.characters && Array.isArray(data.characters)) {
    // Load all characters
    data.characters.forEach(charData => {
      const profile = charData.profile;
      const charId = profile.id;
      const charDataKey = 'character_' + charId;
      
      // Save profile
      const characters = JSON.parse(localStorage.getItem('characters') || '[]');
      if (!characters.find(c => c.id === charId)) {
        characters.push(profile);
        localStorage.setItem('characters', JSON.stringify(characters));
      }
      
      // Save character-specific data
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
    
    alert('All characters loaded successfully! Go to Characters page to select one.');
    return;
  }
  
  // Legacy single character load (version 1.0)
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
        // Trigger update
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
        // Trigger update
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
  
  // Save loaded data to localStorage for persistence
  saveAllCharacterData();
}

// Reset dice options to default
function resetDiceOptions() {
  currentDiceType = 10;
  currentDiceCount = 1;
  
  document.querySelectorAll(".dice-type-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.dice === "10");
  });
  
  const diceCountInput = document.getElementById("dice-count");
  if (diceCountInput) diceCountInput.value = 1;
  
  document.getElementById("dice-options").style.display = "flex";
  document.getElementById("dice-result-section").style.display = "none";
}

// Perform skill roll (1d10 + base) - instant, no dialog options
function performSkillRoll(baseValue, skillName) {
  const dialogOverlay = document.getElementById("dice-dialog-overlay");
  if (!dialogOverlay) return;

  // Get seriously wounded modifier
  const seriouslyWounded = document.getElementById("seriously_wounded")?.checked || false;
  const swModifier = seriouslyWounded ? -2 : 0;
  const swText = seriouslyWounded ? ' (SW -2)' : '';

  // Show dialog
  dialogOverlay.classList.add("active");

  // Hide options, show results section
  document.getElementById("dice-options").style.display = "none";
  document.getElementById("dice-result-section").style.display = "flex";

  // Roll 1d10
  const roll = Math.floor(Math.random() * 10) + 1;
  const total = roll + baseValue + swModifier;

  // Display result with animation
  const description = `1d10 + ${baseValue}${swText} = ${total} (${skillName})`;
  displayDiceResult([roll], `${roll} + ${baseValue}${swText} = ${total}`, description, true, 10);
}

// Perform custom roll (nav button with selection)
function performCustomRoll() {
  const diceOptions = document.getElementById("dice-options");
  const diceResultSection = document.getElementById("dice-result-section");

  if (!diceOptions || !diceResultSection) return;

  // Hide options, show results
  diceOptions.style.display = "none";
  diceResultSection.style.display = "flex";

  // Roll dice
  const rolls = [];
  for (let i = 0; i < window.currentDiceCount; i++) {
    rolls.push(Math.floor(Math.random() * window.currentDiceType) + 1);
  }

  const total = rolls.reduce((a, b) => a + b, 0);

  // Display result with animation
  displayDiceResult(rolls, total.toString(), `${window.currentDiceCount}d${window.currentDiceType}`, false, window.currentDiceType);
}

// Reset dice options to default
function resetDiceOptions() {
  window.currentDiceType = 10;
  window.currentDiceCount = 1;

  document.querySelectorAll(".dice-type-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.dice === "10");
  });

  const diceCountInput = document.getElementById("dice-count");
  if (diceCountInput) diceCountInput.value = 1;

  const diceOptions = document.getElementById("dice-options");
  const diceResultSection = document.getElementById("dice-result-section");
  if (diceOptions) diceOptions.style.display = "flex";
  if (diceResultSection) diceResultSection.style.display = "none";
}

// Display dice result with animation
function displayDiceResult(rolls, totalText, description, isSkillRoll, diceType = 10) {
  const diceRollsContainer = document.getElementById("dice-rolls");
  const diceTotalValue = document.getElementById("dice-total-value");
  const diceDescription = document.getElementById("dice-description");

  if (!diceRollsContainer) return;

  // Clear previous results
  diceRollsContainer.innerHTML = "";
  
  // Display each die with staggered animation
  rolls.forEach((roll, index) => {
    const dieEl = document.createElement("div");
    dieEl.className = "dice-roll-item";
    
    const isCritFail = roll === 1;
    const isCritSuccess = roll === diceType;
    
    if (isCritFail) dieEl.classList.add("crit-fail");
    if (isCritSuccess) dieEl.classList.add("crit-success");
    
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
    diceTotalValue.classList.remove("crit-fail", "crit-success");
    
    if (isSkillRoll && parseInt(totalText) === 10) {
      diceTotalValue.classList.add("crit-success");
    }
    
    setTimeout(() => {
      diceTotalValue.style.transition = 'opacity 0.3s';
      diceTotalValue.style.opacity = '1';
    }, rolls.length * 100 + 100);
  }
  
  // Set description
  if (diceDescription) {
    diceDescription.textContent = description;
  }
}
