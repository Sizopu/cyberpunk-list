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
  `;
  specialisedSkillsBody.appendChild(tr);
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

  weaponsContainer.appendChild(weaponRow);
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
};

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

  // Dice type selection
  diceTypeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      diceTypeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentDiceType = parseInt(btn.dataset.dice);
    });
  });

  // Dice count controls
  if (diceCountDec) {
    diceCountDec.addEventListener("click", () => {
      let count = parseInt(diceCountInput.value) || 1;
      if (count > 1) {
        diceCountInput.value = count - 1;
        currentDiceCount = count - 1;
      }
    });
  }

  if (diceCountInc) {
    diceCountInc.addEventListener("click", () => {
      let count = parseInt(diceCountInput.value) || 1;
      if (count < 10) {
        diceCountInput.value = count + 1;
        currentDiceCount = count + 1;
      }
    });
  }

  if (diceCountInput) {
    diceCountInput.addEventListener("change", () => {
      let count = parseInt(diceCountInput.value) || 1;
      count = Math.max(1, Math.min(10, count));
      diceCountInput.value = count;
      currentDiceCount = count;
    });
  }

  // Roll confirm button
  if (diceRollConfirm) {
    diceRollConfirm.addEventListener("click", () => {
      performCustomRoll();
    });
  }
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

  // Show dialog
  dialogOverlay.classList.add("active");

  // Hide options, show results section
  document.getElementById("dice-options").style.display = "none";
  document.getElementById("dice-result-section").style.display = "flex";

  // Roll 1d10
  const roll = Math.floor(Math.random() * 10) + 1;
  const total = roll + baseValue;

  // Display result with animation
  displayDiceResult([roll], `${roll} + ${baseValue} = ${total}`, `1d10 + ${baseValue} (${skillName})`, true);
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
  for (let i = 0; i < currentDiceCount; i++) {
    rolls.push(Math.floor(Math.random() * currentDiceType) + 1);
  }
  
  const total = rolls.reduce((a, b) => a + b, 0);

  // Display result with animation
  displayDiceResult(rolls, total.toString(), `${currentDiceCount}d${currentDiceType}`, false);
}

// Display dice result with animation
function displayDiceResult(rolls, totalText, description, isSkillRoll) {
  const diceRollsContainer = document.getElementById("dice-rolls");
  const diceTotalValue = document.getElementById("dice-total-value");
  const diceDescription = document.getElementById("dice-description");

  if (!diceRollsContainer) return;

  // Clear previous results
  diceRollsContainer.innerHTML = "";
  diceTotalValue.textContent = "0";

  // Display each die with staggered animation
  rolls.forEach((roll, index) => {
    setTimeout(() => {
      const dieEl = document.createElement("div");
      dieEl.className = "die-result";
      dieEl.textContent = roll;
      diceRollsContainer.appendChild(dieEl);

      // Update total after last die
      if (index === rolls.length - 1) {
        setTimeout(() => {
          diceTotalValue.textContent = totalText;
          diceDescription.textContent = description;
        }, 100);
      }
    }, index * 150);
  });
}
