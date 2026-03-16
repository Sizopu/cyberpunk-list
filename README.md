# Cyberpunk RED Character Sheet Manager

Полнофункциональное веб-приложение для управления персонажами и NPC в настольной ролевой игре Cyberpunk RED.

## 📁 Структура проекта

```
project-dnd/
├── html/                   # HTML-страницы
│   ├── index.html          # Лист персонажа (редактирование)
│   ├── main.html           # Управление персонажами (список)
│   ├── implants.html       # Киберимпланты и инвентарь
│   ├── notes.html          # Заметки
│   └── mobs.html           # NPC/Мобы
│
├── css/                    # Таблицы стилей
│   ├── common.css          # Общие стили (навигация, диалоги, кубики)
│   ├── character.css       # Стили листа персонажа
│   ├── main.css            # Стили страницы управления
│   ├── implants.css        # Стили имплантов
│   ├── mobs.css            # Стили страницы мобов
│   └── notes.css           # Стили заметок
│
├── js/                     # JavaScript модули
│   ├── utils.js            # Утилиты (хранилище, ключи)
│   ├── script.js           # Логика листа персонажа
│   ├── main.js             # Управление персонажами
│   ├── implants.js         # Логика имплантов
│   ├── notes.js            # Логика заметок
│   ├── mobs.js             # Логика NPC/мобов
│   ├── weapon-dice.js      # Бросок урона оружия (персонаж)
│   ├── mob-weapon-dice.js  # Бросок урона оружия (мобы)
│   └── mob-dice.js         # Броски кубиков для мобов
│
├── skill-presets.json      # Пресеты навыков для мобов
├── images/                 # Изображения
│   └── cyberpunk.png       # Иконка приложения
└── README.md               # Документация
```

---

## 🚀 Быстрый старт

### Запуск
1. Откройте `html/main.html` в браузере (Chrome, Firefox, Edge)
2. Или используйте локальный сервер:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js (npx)
   npx http-server -p 8000
   ```
3. Перейдите на `http://localhost:8000/html/main.html`

### Навигация
- **Characters** (`main.html`) — список персонажей
- **Character Sheet** (`index.html`) — редактирование персонажа
- **Implants** — киберимпланты и инвентарь
- **Notes** — заметки
- **Mobs** — NPC/мобы

---

## 📊 Структура данных

### Персонажи (localStorage)

**Ключ:** `characters`  
**Формат:**
```json
[
  {
    "id": 1710234567890,
    "name": "Johnny Silverhand",
    "role": "Rockerboy",
    "createdAt": "2026-03-16T10:00:00.000Z"
  }
]
```

**Ключ текущего персонажа:** `currentCharacterId`

### Данные персонажа

Все данные хранятся с префиксом `character_{id}_`:

| Ключ | Описание | Тип |
|------|----------|-----|
| `character_{id}_stats` | Характеристики (INT, REF, DEX...) | `object` |
| `character_{id}_skills` | Навыки | `array` |
| `character_{id}_weapons` | Оружие | `array` |
| `character_{id}_armor` | Броня | `object` |
| `character_{id}_health` | Здоровье (HP, Death Save) | `object` |
| `character_{id}_idBlock` | ID блок (имя, возраст, роль) | `object` |
| `character_{id}_cyberware` | Киберимпланты | `array` |
| `character_{id}_inventory` | Инвентарь | `array` |
| `character_{id}_notes` | Заметки | `array` |

### Мобы/NPC (localStorage)

**Ключ:** `mobsData` (общий для всех мобов)

**Формат:**
```json
[
  {
    "id": 1710234567890,
    "name": "Gang Thug",
    "stats": {
      "int": 5, "ref": 7, "dex": 6, "tech": 4,
      "cool": 5, "will": 6, "luck": 5, "move": 6,
      "body": 7, "emp": 6
    },
    "hitPoints": { "current": 15, "max": 20 },
    "seriouslyWounded": false,
    "deathSave": 0,
    "initiative": 12,
    "weapons": [
      {
        "name": "Revolver",
        "dmg": "3d6",
        "mag": "6",
        "rof": "1",
        "notes": "",
        "diceFormula": "3d6 + 2"
      }
    ],
    "handWeapons": [],
    "armor": {
      "head": { "sp": "14", "notes": "", "penalty": "0" },
      "body": { "sp": "14", "notes": "", "penalty": "0" }
    },
    "skills": [
      { "name": "Handgun", "stat": "REF", "lvl": 4 }
    ],
    "skillBases": "",
    "cyberware": ""
  }
]
```

---

## 🎮 Как пользоваться

### Создание персонажа

1. Откройте **Characters** (`main.html`)
2. Нажмите **+** (Add Character)
3. Введите имя персонажа
4. Нажмите **Load to Character Sheet** для редактирования

### Редактирование персонажа

**Характеристики (Stats):**
- Введите значения: INT, REF, DEX, TECH, COOL, WILL, LUCK, MOVE, BODY, EMP
- Значения сохраняются автоматически

**Навыки (Skills):**
- Выберите навык из списка или введите свой
- Укажите уровень (LVL)
- Модификатор считается автоматически: `Stat + LVL`
- 🎲 — бросок навыка (1d10 + модификатор)

**Специализированные навыки:**
- Нажмите **+ Add Specialised Skill**
- Выберите характеристику (STAT)
- Введите название навыка
- Укажите модификатор и уровень
- 🎲 — бросок

**Оружие:**
- Нажмите **+** в секции Weapons
- Заполните: Name, DMG, MAG, ROF, Notes
- В поле NOTES введите формулу урона: `3d6 + 2d10 + 5`
- 🎲 — бросок урона

**Броня:**
- HEAD/BODY: SP (защита), NOTES, PENALTY

**Здоровье:**
- HIT POINTS: текущие / максимум
- SERIOUSLY WOUNDED: чекбокс (даёт -2 ко всем броскам)
- DEATH SAVE: значение

### Мобы/NPC

1. Откройте **Mobs** (`mobs.html`)
2. Нажмите **+** для создания моба
3. Заполните:
   - **Имя**
   - **Stats** (все характеристики)
   - **HP** (здоровье)
   - **Weapons** (оружие с формулой урона)
   - **Armor** (броня HEAD/BODY)
   - **Skills** (навыки из 29 пресетов или свои)
4. 🎲 рядом с инициативой — бросок инициативы (1d10 + REF)
5. 🎲 рядом с навыком — бросок навыка

### Импланты

1. Откройте **Implants**
2. Выберите тип импланта (8 типов)
3. Нажмите **+ Add Implant**
4. Заполните:
   - Название
   -slots (сколько слотов занимает)
   - Описание
5. Humanity loss считается автоматически

### Инвентарь

1. Откройте **Implants** → секция Inventory
2. Нажмите **+ Add Item**
3. Заполните: Gear, Cost, Weight, Notes
4. Cash — доступные деньги
5. Итоги считаются автоматически

### Заметки

1. Откройте **Notes**
2. Выберите тип: Regular / Table
3. Нажмите **+ Add Note**
4. Заполните заголовок и содержимое

---

## 💾 Сохранение и передача данных

### Автосохранение
Все данные сохраняются автоматически в `localStorage` браузера при каждом изменении.

### Экспорт (Save)
1. Нажмите **💾 Save** в навигационной панели
2. Скачается файл: `cyberpunk-character-YYYY-MM-DD.json`
3. Файл содержит **все данные**:
   - Все персонажи
   - Все импланты
   - Весь инвентарь
   - Все заметки
   - Все мобы/NPC
   - Lifepath данные

**Структура экспортного файла:**
```json
{
  "version": "1.0",
  "exportDate": "2026-03-16T10:00:00.000Z",
  "character": { ... },
  "roleAbilities": [ ... ],
  "weapons": [ ... ],
  "skills": [ ... ],
  "specialisedSkills": [ ... ],
  "lifepath": { ... },
  "inventory": { ... },
  "cyberware": [ ... ],
  "notes": [ ... ],
  "mobs": [ ... ],
  "moneyTotal": "1000"
}
```

### Импорт (Load)
1. Нажмите **📂 Load**
2. Выберите JSON-файл экспорта
3. Данные загрузятся и страница перезагрузится

### Передача между устройствами
1. На старом устройстве: **💾 Save** → скачается JSON
2. Передайте файл на новое устройство
3. На новом устройстве: **📂 Load** → выберите файл
4. Все данные появятся в браузере

---

## 🎲 Формулы кубиков

### Формат формул
```
3d6 + 2d10 + 5
```

**Поддерживается:**
- Любое количество кубиков: `NdM` где N — количество, M — тип
- Типы кубиков: d4, d6, d8, d10, d12, d20
- Сложение/вычитание констант: `+ 5`, `- 2`
- Пробелы не обязательны: `3d6+2d10+5`

### Примеры
| Формула | Описание |
|---------|----------|
| `1d10` | Один d10 |
| `3d6 + 2` | 3 кубика d6 + 2 |
| `2d10 + 4d6 + 3` | 2d10 + 4d6 + 3 |
| `5d10 - 1` | 5d10 - 1 |

### Критические успехи/неудачи
- **1** на d10 — критическая неудача (красный)
- **10** на d10 — критический успех (зелёный)

---

## 🔧 Технические детали

### LocalStorage ключи

| Ключ | Описание |
|------|----------|
| `characters` | Список всех персонажей |
| `currentCharacterId` | ID текущего персонажа |
| `character_{id}_*` | Данные персонажа |
| `mobsData` | Все мобы/NPC |
| `lifepathData` | Lifepath текущего персонажа |
| `inventoryData` | Инвентарь текущего персонажа |
| `cyberwareImplants` | Импланты текущего персонажа |
| `notesData` | Заметки текущего персонажа |
| `moneyTotal` | Общая сумма денег |

### Утилиты (js/utils.js)

```javascript
// Получить ID текущего персонажа
getCurrentCharacterId()

// Получить ключ хранилища для текущего персонажа
getCharStorageKey(key)  // → "character_123_key"

// Обёртка для localStorage с префиксом
charStorage.getItem(key)
charStorage.setItem(key, value)

// Безопасное получение значения из input
getElementValue(id)

// Форматирование даты
formatDate(timestamp)
```

---

## 📋 Пресеты навыков (мобы)

Всего 29 пресетов:

| Навык | Характеристика |
|-------|---------------|
| Athletics, Brawling, Evasion, Stealth, Melee Weapon, Martial Arts | DEX |
| Handgun, Rifle, Shotgun, SMG, Driving, Pilot | REF |
| Perception, Gambling, Tactics, Cyberdeck Operation, Programming, Hacking | INT |
| Concentration, Endurance, Resist Torture | WILL |
| Persuasion, Intimidation, Streetwise, Trading, Leadership | COOL |
| First Aid, Electronics, Demolitions | TECH |

---

## 🌐 Поддержка браузеров

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

**Требования:**
- Поддержка ES6+
- localStorage включён
- JavaScript включён

---

## 📝 Примечания

1. Данные хранятся только в браузере — регулярно делайте экспорт (Save)
2. Очистка кэша браузера удалит все данные
3. Используйте импорт/экспорт для резервных копий
4. Для передачи между устройствами используйте JSON-файлы
