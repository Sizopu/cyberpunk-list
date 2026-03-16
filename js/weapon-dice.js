// Weapon Dice Roller - отдельный модуль для броска кубиков оружия
// Поддерживает формат: 3d6 + 2d10 + 5
// Поддержка нескольких атак для одного оружия

document.addEventListener('DOMContentLoaded', () => {
  initWeaponDiceRoller();
});

function initWeaponDiceRoller() {
  const weaponsContainer = document.getElementById('weapons-container');
  if (!weaponsContainer) return;

  // Добавляем поле для dice formula и кнопку ролла для каждого оружия
  setupWeaponDiceInputs();

  // Слушаем изменения в контейнере оружия (для динамически добавляемых элементов)
  weaponsContainer.addEventListener('input', (e) => {
    if (e.target.classList.contains('weapon-dice-formula')) {
      // Можно добавить валидацию формулы в реальном времени
    }
  });
  
  // Обработка кликов для кнопок добавления/удаления атак
  weaponsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-attack-btn')) {
      e.stopPropagation();
      const weaponRow = e.target.closest('.weapon-row');
      addAttackSlot(weaponRow);
    }
    if (e.target.classList.contains('remove-attack-btn')) {
      e.stopPropagation();
      const attackSlot = e.target.closest('.attack-slot');
      attackSlot.remove();
    }
  });
}

// Настройка полей для броска кубиков в каждом оружии
function setupWeaponDiceInputs() {
  const weaponsContainer = document.getElementById('weapons-container');
  if (!weaponsContainer) return;

  const weaponRows = weaponsContainer.querySelectorAll('.weapon-row');
  weaponRows.forEach(row => {
    addDiceFormulaField(row);
  });
}

// Добавляем поле формулы и кнопку к существующему оружию
function addDiceFormulaField(weaponRow) {
  // Проверяем, уже ли добавлено
  if (weaponRow.querySelector('.weapon-dice-formula')) return;

  // Находим кнопку delete и вставляем перед ней
  const deleteBtn = weaponRow.querySelector('.delete-btn');
  if (!deleteBtn) return;

  // Создаём контейнер для dice roller с первой атакой
  const diceContainer = document.createElement('div');
  diceContainer.className = 'weapon-dice-container';
  diceContainer.innerHTML = `
    <div class="attack-slots">
      <div class="attack-slot">
        <input type="text" class="weapon-dice-formula" placeholder="3d6 + 2d10 + 5">
        <button class="weapon-roll-btn" type="button" title="Roll Damage">🎲</button>
        <button class="remove-attack-btn" type="button" title="Remove attack" style="display:none;">−</button>
        <input type="text" class="weapon-attack-notes" placeholder="Attack notes (e.g., headshot, burst)">
      </div>
    </div>
    <button class="add-attack-btn" type="button" title="Add attack">+ Attack</button>
  `;

  deleteBtn.before(diceContainer);

  // Добавляем обработчик кнопки ролла для первой атаки
  setupAttackSlotListeners(weaponRow);
}

// Настройка слушателей для слота атаки
function setupAttackSlotListeners(weaponRow) {
  const rollBtns = weaponRow.querySelectorAll('.weapon-roll-btn');
  rollBtns.forEach(btn => {
    // Удаляем старые обработчики (клонированием)
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const attackSlot = newBtn.closest('.attack-slot');
      const formulaInput = attackSlot.querySelector('.weapon-dice-formula');
      const formula = formulaInput.value.trim();
      if (formula) {
        rollWeaponDice(formula, weaponRow, attackSlot);
      } else {
        showDiceNotification('Введите формулу (например: 3d6 + 5)', 'warning');
      }
    });
  });

  // Поддержка Enter для броска
  const formulaInputs = weaponRow.querySelectorAll('.weapon-dice-formula');
  formulaInputs.forEach(input => {
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    newInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const attackSlot = newInput.closest('.attack-slot');
        const formula = newInput.value.trim();
        if (formula) {
          rollWeaponDice(formula, weaponRow, attackSlot);
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

// Добавление нового слота атаки
function addAttackSlot(weaponRow) {
  const diceContainer = weaponRow.querySelector('.weapon-dice-container');
  const attackSlots = diceContainer.querySelector('.attack-slots');

  const attackSlot = document.createElement('div');
  attackSlot.className = 'attack-slot';
  attackSlot.innerHTML = `
    <input type="text" class="weapon-dice-formula" placeholder="3d6 + 2d10 + 5">
    <button class="weapon-roll-btn" type="button" title="Roll Damage">🎲</button>
    <button class="remove-attack-btn" type="button" title="Remove attack">−</button>
    <input type="text" class="weapon-attack-notes" placeholder="Attack notes (e.g., headshot, burst)">
  `;

  attackSlots.appendChild(attackSlot);
  setupAttackSlotListeners(weaponRow);

  // Фокус на новом поле
  const newInput = attackSlot.querySelector('.weapon-dice-formula');
  newInput.focus();
}

// Парсинг формулы кубиков (например: "3d6 + 2d10 + 5")
function parseDiceFormula(formula) {
  // Удаляем все пробелы для упрощения парсинга
  const cleanFormula = formula.replace(/\s/g, '');
  
  // Массив для хранения частей формулы
  const parts = [];
  let total = 0;
  
  // Разделяем по + и - (сохраняя знаки)
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
    
    // Проверяем, это кость (NdM) или число
    const diceMatch = token.match(/^(\d+)[dD](\d+)$/);
    
    if (diceMatch) {
      // Это кость: количество и тип
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
      // Это простое число
      parts.push({
        type: 'number',
        value: parseInt(token),
        sign: currentSign
      });
    } else {
      return { error: `Неверный формат: ${token}` };
    }
    
    currentSign = 1; // Сбрасываем знак
  }
  
  return { parts, error: null };
}

// Бросок кубиков по формуле
function rollWeaponDice(formula, weaponRow = null, attackSlot = null) {
  const parsed = parseDiceFormula(formula);

  if (parsed.error) {
    showDiceNotification(parsed.error, 'error');
    return;
  }

  // Get seriously wounded modifier
  const seriouslyWounded = document.getElementById("seriously_wounded")?.checked || false;
  const swModifier = seriouslyWounded ? -2 : 0;
  const swText = seriouslyWounded ? ' (SW -2)' : '';

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

  // Apply seriously wounded modifier to total
  total += swModifier;

  // Убираем первый знак если это +
  if (detailString.startsWith(' +')) {
    detailString = detailString.substring(3);
  }

  // Показываем результат
  showWeaponDiceResult(rolls, total, detailString, weaponRow, formula, attackSlot, swText);
}

// Показ результата броска
function showWeaponDiceResult(rolls, total, detailString, weaponRow, formula, attackSlot = null, swText = '') {
  // Создаём или находим контейнер для результата
  let resultContainer;

  if (attackSlot) {
    // Ищем результат после этого attackSlot
    resultContainer = attackSlot.nextElementSibling;
    if (!resultContainer || !resultContainer.classList.contains('attack-dice-result')) {
      // Создаём новый результат ПОСЛЕ attackSlot
      resultContainer = document.createElement('div');
      resultContainer.className = 'attack-dice-result';
      attackSlot.parentNode.insertBefore(resultContainer, attackSlot.nextSibling);
    }
  } else if (weaponRow) {
    // Старое поведение - результат для всего оружия
    resultContainer = weaponRow.querySelector('.weapon-dice-result');
    if (!resultContainer) {
      resultContainer = document.createElement('div');
      resultContainer.className = 'weapon-dice-result';
      weaponRow.appendChild(resultContainer);
    }
  }

  // Формируем HTML результата
  let rollsHtml = '';
  rolls.forEach(roll => {
    const highlightedRolls = roll.rolls.map(r => {
      // Криты: 1 - красным, макс - зелёным
      const isCritFail = r === 1;
      const isCritSuccess = r === roll.sides;
      const className = isCritFail ? 'crit-fail' : (isCritSuccess ? 'crit-success' : '');
      return `<span class="dice-roll ${className}">${r}</span>`;
    }).join(' × ');

    rollsHtml += `
      <div class="weapon-dice-group">
        <span class="dice-type">${roll.type}:</span>
        <span class="dice-values">${highlightedRolls}</span>
        <span class="dice-sum">= ${roll.sum}</span>
      </div>
    `;
  });

  resultContainer.innerHTML = `
    <div class="weapon-dice-detail">
      ${rollsHtml}
    </div>
    <div class="weapon-dice-total">
      <span class="total-label">Итого:</span>
      <span class="total-value">${total}</span>
      <span class="total-formula">(${detailString}${swText} = ${total})</span>
    </div>
    <button class="weapon-dice-clear" type="button">×</button>
  `;

  // Кнопка закрытия
  const clearBtn = resultContainer.querySelector('.weapon-dice-clear');
  clearBtn.addEventListener('click', () => {
    resultContainer.remove();
  });

  // Анимация появления
  resultContainer.style.opacity = '0';
  resultContainer.style.maxHeight = '0';
  setTimeout(() => {
    resultContainer.style.transition = 'opacity 0.3s, max-height 0.3s';
    resultContainer.style.opacity = '1';
    resultContainer.style.maxHeight = '200px';
  }, 10);
}

// Уведомления об ошибках
function showDiceNotification(message, type = 'info') {
  // Создаём уведомление
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

// Экспорт функции для использования из других скриптов
window.rollWeaponDice = rollWeaponDice;
window.parseDiceFormula = parseDiceFormula;
