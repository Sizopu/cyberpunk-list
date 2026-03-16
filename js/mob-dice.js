// Mob Dice Roller - отдельный ролл для скиллов и инициативы мобов
// Работает независимо от основной страницы

document.addEventListener('DOMContentLoaded', () => {
  initMobDiceRoller();
});

function initMobDiceRoller() {
  // Обработчик для кнопки Roll Dice в шапке
  const diceBtn = document.getElementById("dice-roll-btn");
  const dialogOverlay = document.getElementById("dice-dialog-overlay");
  
  if (diceBtn && dialogOverlay) {
    diceBtn.addEventListener("click", () => {
      resetMobDiceOptions();
      dialogOverlay.classList.add("active");
    });
  }
  
  // Close dialog handlers
  const dialogClose = document.getElementById("dice-dialog-close");
  const dialogCancel = document.getElementById("dice-dialog-cancel");
  
  function closeDialog() {
    dialogOverlay?.classList.remove("active");
  }
  
  if (dialogClose) dialogClose.addEventListener("click", closeDialog);
  if (dialogCancel) dialogCancel.addEventListener("click", closeDialog);
  
  dialogOverlay?.addEventListener("click", (e) => {
    if (e.target === dialogOverlay) {
      closeDialog();
    }
  });
  
  // Dice type selection
  const diceTypeBtns = document.querySelectorAll(".dice-type-btn");
  diceTypeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      diceTypeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      window.currentMobDiceType = parseInt(btn.dataset.dice);
    });
  });
  
  // Dice count controls
  const diceCountDec = document.getElementById("dice-count-dec");
  const diceCountInc = document.getElementById("dice-count-inc");
  const diceCountInput = document.getElementById("dice-count");
  
  if (diceCountDec) {
    diceCountDec.addEventListener("click", () => {
      let count = parseInt(diceCountInput?.value) || 1;
      if (count > 1) {
        diceCountInput.value = count - 1;
        window.currentMobDiceCount = count - 1;
      }
    });
  }
  
  if (diceCountInc) {
    diceCountInc.addEventListener("click", () => {
      let count = parseInt(diceCountInput?.value) || 1;
      if (count < 10) {
        diceCountInput.value = count + 1;
        window.currentMobDiceCount = count + 1;
      }
    });
  }
  
  if (diceCountInput) {
    diceCountInput.addEventListener("change", () => {
      let count = parseInt(diceCountInput.value) || 1;
      count = Math.max(1, Math.min(10, count));
      diceCountInput.value = count;
      window.currentMobDiceCount = count;
    });
  }
  
  // Roll confirm button
  const diceRollConfirm = document.getElementById("dice-roll-confirm");
  if (diceRollConfirm) {
    diceRollConfirm.addEventListener("click", () => {
      performMobCustomRoll();
    });
  }
  
  // Initialize global dice state
  window.currentMobDiceType = 10;
  window.currentMobDiceCount = 1;
}

// Reset dice options
function resetMobDiceOptions() {
  window.currentMobDiceType = 10;
  window.currentMobDiceCount = 1;
  
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

// Perform custom roll
function performMobCustomRoll() {
  const diceOptions = document.getElementById("dice-options");
  const diceResultSection = document.getElementById("dice-result-section");
  
  if (!diceOptions || !diceResultSection) return;
  
  diceOptions.style.display = "none";
  diceResultSection.style.display = "flex";
  
  const rolls = [];
  for (let i = 0; i < window.currentMobDiceCount; i++) {
    rolls.push(Math.floor(Math.random() * window.currentMobDiceType) + 1);
  }
  
  const total = rolls.reduce((a, b) => a + b, 0);
  
  displayMobDiceResult(rolls, total, `${window.currentMobDiceCount}d${window.currentMobDiceType} = ${total}`, `${window.currentMobDiceCount}d${window.currentMobDiceType}`, false, window.currentMobDiceType);
}

// Perform mob skill roll
function performMobSkillRoll(baseValue, skillName, seriouslyWounded = false) {
  const dialogOverlay = document.getElementById("dice-dialog-overlay");
  const diceOptions = document.getElementById("dice-options");
  const diceResultSection = document.getElementById("dice-result-section");

  if (!dialogOverlay || !diceOptions || !diceResultSection) return;

  // Ensure baseValue is a number
  const base = parseInt(baseValue) || 0;
  const swModifier = seriouslyWounded ? -2 : 0;
  const swText = seriouslyWounded ? ' (SW -2)' : '';

  dialogOverlay.classList.add("active");
  diceOptions.style.display = "none";
  diceResultSection.style.display = "flex";

  const roll = Math.floor(Math.random() * 10) + 1;
  const total = parseInt(roll) + parseInt(base) + swModifier;

  displayMobDiceResult([roll], total, `${roll} + ${base}${swText} = ${total}`, `1d10 + ${base}${swText} (${skillName})`, true, 10);
}

// Perform mob initiative roll
function performMobInitiativeRoll(refValue, mobName, rollResult = null) {
  const dialogOverlay = document.getElementById("dice-dialog-overlay");
  const diceOptions = document.getElementById("dice-options");
  const diceResultSection = document.getElementById("dice-result-section");

  if (!dialogOverlay || !diceOptions || !diceResultSection) return;

  // Ensure refValue is a number
  const ref = parseInt(refValue) || 0;

  dialogOverlay.classList.add("active");
  diceOptions.style.display = "none";
  diceResultSection.style.display = "flex";

  const roll = rollResult !== null ? parseInt(rollResult) : (Math.floor(Math.random() * 10) + 1);
  const total = parseInt(roll) + parseInt(ref);

  displayMobDiceResult([roll], total, `${roll} + ${ref} = ${total}`, `1d10 + ${ref} (Initiative - ${mobName})`, true, 10);
  
  return total;
}

// Display dice result with animation
function displayMobDiceResult(rolls, total, descriptionText, formulaText, isSkillRoll, diceType = 10) {
  const diceRollsContainer = document.getElementById("dice-rolls");
  const diceTotalValue = document.getElementById("dice-total-value");
  const diceDescription = document.getElementById("dice-description");
  
  if (!diceRollsContainer) return;
  
  // Clear and add rolls with animation
  diceRollsContainer.innerHTML = '';
  
  rolls.forEach((roll, index) => {
    const rollEl = document.createElement("div");
    rollEl.className = "dice-roll-item";
    
    const isCritFail = roll === 1;
    const isCritSuccess = roll === diceType;
    
    if (isCritFail) rollEl.classList.add("crit-fail");
    if (isCritSuccess) rollEl.classList.add("crit-success");
    
    rollEl.textContent = roll;
    rollEl.style.opacity = '0';
    rollEl.style.transform = 'scale(0.5)';
    diceRollsContainer.appendChild(rollEl);
    
    // Animate each roll with delay
    setTimeout(() => {
      rollEl.style.transition = 'opacity 0.2s, transform 0.2s';
      rollEl.style.opacity = '1';
      rollEl.style.transform = 'scale(1)';
    }, index * 100);
  });
  
  // Animate total
  if (diceTotalValue) {
    diceTotalValue.style.opacity = '0';
    diceTotalValue.textContent = total;
    diceTotalValue.classList.remove("crit-fail", "crit-success");
    
    if (isSkillRoll && total === 10) {
      diceTotalValue.classList.add("crit-success");
    }
    
    setTimeout(() => {
      diceTotalValue.style.transition = 'opacity 0.3s';
      diceTotalValue.style.opacity = '1';
    }, rolls.length * 100 + 100);
  }
  
  // Set description
  if (diceDescription) {
    diceDescription.textContent = formulaText || descriptionText;
  }
}

// Export functions
window.performMobSkillRoll = performMobSkillRoll;
window.performMobInitiativeRoll = performMobInitiativeRoll;
window.displayMobDiceResult = displayMobDiceResult;
