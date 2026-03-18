// Mob Weapon Dice Roller - бросок кубиков для оружия мобов
// Копия механизма из weapon-dice.js

// Парсинг формулы кубиков
function parseMobDiceFormula(formula) {
  const cleanFormula = formula.replace(/\s/g, '');
  const parts = [];
  let total = 0;
  const tokens = cleanFormula.split(/([+-])/);
  let currentSign = 1;

  for (let token of tokens) {
    if (!token) continue;

    if (token === '+') {
      currentSign = 1;
      continue;
    }

    if (token === '-') {
      currentSign = -1;
      continue;
    }

    const diceMatch = token.match(/^(\d+)[dD](\d+)$/);

    if (diceMatch) {
      const count = parseInt(diceMatch[1]);
      const sides = parseInt(diceMatch[2]);

      if (count > 0 && count <= 100 && sides > 0 && sides <= 100) {
        parts.push({
          type: 'dice',
          count: count,
          sides: sides,
          sign: currentSign
        });
      } else {
        return { error: `Неверные параметры кубика: ${token}` };
      }
    } else if (/^\d+$/.test(token)) {
      parts.push({
        type: 'number',
        value: parseInt(token),
        sign: currentSign
      });
    } else {
      return { error: `Неверный формат: ${token}` };
    }

    currentSign = 1;
  }

  return { parts, error: null };
}

// Бросок кубиков по формуле
function rollMobWeaponDice(formula, weaponRow, attackSlot) {
  const parsed = parseMobDiceFormula(formula);

  if (parsed.error) {
    showDiceNotification(parsed.error, 'error');
    return;
  }

  const rolls = [];
  let total = 0;
  let detailString = '';

  parsed.parts.forEach(part => {
    const sign = part.sign;
    const signChar = sign === -1 ? '-' : '+';

    if (part.type === 'dice') {
      const diceRolls = [];
      let diceSum = 0;

      for (let i = 0; i < part.count; i++) {
        const roll = Math.floor(Math.random() * part.sides) + 1;
        diceRolls.push(roll);
        diceSum += roll;
      }

      const contribution = sign * diceSum;
      total += contribution;

      rolls.push({
        type: `${part.count}d${part.sides}`,
        rolls: diceRolls,
        sum: diceSum,
        sign: sign,
        sides: part.sides
      });

      detailString += ` ${signChar} ${diceRolls.join('+')}[${diceSum}]`;

    } else if (part.type === 'number') {
      const contribution = sign * part.value;
      total += contribution;
      detailString += ` ${signChar} ${part.value}`;
    }
  });

  if (detailString.startsWith(' +')) {
    detailString = detailString.substring(3);
  }

  showMobWeaponDiceResult(rolls, total, detailString, weaponRow, attackSlot);
}

// Показ результата броска
function showMobWeaponDiceResult(rolls, total, detailString, weaponRow, attackSlot) {
  // Находим или создаём контейнер для результата
  let resultContainer;

  if (attackSlot) {
    // Ищем результат после этого attackSlot
    const diceContainer = attackSlot.closest('.mob-weapon-dice-container');
    resultContainer = diceContainer.querySelector('.mob-weapon-dice-result');
    if (!resultContainer) {
      resultContainer = document.createElement('div');
      resultContainer.className = 'mob-weapon-dice-result';
      diceContainer.appendChild(resultContainer);
    }
  }

  if (!resultContainer) return;

  let rollsHtml = '';
  rolls.forEach(roll => {
    const highlightedRolls = roll.rolls.map(r => {
      const isCritFail = r === 1;
      const isCritSuccess = r === roll.sides;
      const className = isCritFail ? 'crit-fail' : (isCritSuccess ? 'crit-success' : '');
      return `<span class="dice-roll ${className}">${r}</span>`;
    }).join(' × ');

    rollsHtml += `
      <div class="mob-weapon-dice-group">
        <span class="dice-type">${roll.type}:</span>
        <span class="dice-values">${highlightedRolls}</span>
        <span class="dice-sum">= ${roll.sum}</span>
      </div>
    `;
  });

  resultContainer.innerHTML = `
    <div class="mob-weapon-dice-detail">
      ${rollsHtml}
    </div>
    <div class="mob-weapon-dice-total">
      <span class="total-label">Итого:</span>
      <span class="total-value">${total}</span>
      <span class="total-formula">(${detailString} = ${total})</span>
    </div>
    <button class="mob-weapon-dice-clear" type="button">×</button>
  `;

  const clearBtn = resultContainer.querySelector('.mob-weapon-dice-clear');
  clearBtn.addEventListener('click', () => {
    resultContainer.innerHTML = '';
  });

  resultContainer.style.opacity = '0';
  resultContainer.style.maxHeight = '0';
  setTimeout(() => {
    resultContainer.style.transition = 'opacity 0.3s, max-height 0.3s';
    resultContainer.style.opacity = '1';
    resultContainer.style.maxHeight = '200px';
  }, 10);
}

// Настройка слушателей для оружия мобов - вызывается после рендеринга
function setupMobWeaponDiceListeners(container) {
  // Настройка кнопок броска - без клонирования!
  const rollBtns = container.querySelectorAll('.mob-weapon-roll-btn');
  rollBtns.forEach(btn => {
    // Проверяем, есть ли уже обработчик (чтобы не дублировать)
    if (btn._hasRollListener) return;
    btn._hasRollListener = true;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const attackSlot = btn.closest('.attack-slot');
      const weaponRow = attackSlot.closest('.weapon-row');
      const formulaInput = attackSlot.querySelector('.mob-weapon-dice-formula');
      const formula = formulaInput.value.trim();
      if (formula) {
        rollMobWeaponDice(formula, weaponRow, attackSlot);
      } else {
        showDiceNotification('Введите формулу (например: 3d6 + 5)', 'warning');
      }
    });
  });

  // Поддержка Enter для броска
  const formulaInputs = container.querySelectorAll('.mob-weapon-dice-formula');
  formulaInputs.forEach(input => {
    if (input._hasEnterListener) return;
    input._hasEnterListener = true;

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const attackSlot = input.closest('.attack-slot');
        const weaponRow = attackSlot.closest('.weapon-row');
        const formula = input.value.trim();
        if (formula) {
          rollMobWeaponDice(formula, weaponRow, attackSlot);
        }
      }
    });
  });
}

// Уведомления
function showDiceNotification(message, type = 'info') {
  // Простая реализация через console для мобов
  console.log(`[${type}] ${message}`);
}
