// Mob Weapon Dice Roller - бросок кубиков для оружия мобов
// Поддерживает формат: 3d6 + 2d10 + 5

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
function rollMobWeaponDice(formula, resultContainer) {
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
        sign: sign
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

  showMobWeaponDiceResult(rolls, total, detailString, resultContainer);
}

// Показ результата броска
function showMobWeaponDiceResult(rolls, total, detailString, resultContainer) {
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

// Уведомления
function showDiceNotification(message, type = 'info') {
  let notification = document.querySelector('.dice-notification');

  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'dice-notification';
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.className = `dice-notification ${type}`;
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Экспорт функций
window.rollMobWeaponDice = rollMobWeaponDice;
window.parseMobDiceFormula = parseMobDiceFormula;
window.showDiceNotification = showDiceNotification;
