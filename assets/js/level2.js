// Grid Layout: 5x5 Matrix (0..4, 0..4)
// A1 = (0,0), E5 = (4,4)
const MAZE_CONFIG = {
  start: { x: 0, y: 0 }, // A1
  exit: { x: 4, y: 4 },  // E5
  traps: ['B2', 'D1', 'C4'], // Kamers die gereset worden
  clues: {
    'A2': "Gecodeerd fragment [1/3]: 'Sleutelwoord begint met A...'",
    'C3': "Terminal-log gevonden: Gebruik de route A1 -> A2 -> B2(VAL!) -> Vermijd B2!",
    'D3': "Gecodeerd fragment [2/3]: '...ETHER...'",
    'E4': "Gecodeerd fragment [3/3]: '...IA2026'",
    'E5': "SYSTEEM GECONTROLEERD. Toegangscode voor Level 3: AETHERIA2026"
  }
};

let playerPos = { ...MAZE_CONFIG.start };
let visitedRooms = new Set(['A1']);
let moveCooldown = false;
let isGyroActive = false;

document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  updateUI("Systeem opgestart. Kantel je telefoon om te navigeren.");
  
  document.getElementById('enable-gyro-btn').addEventListener('click', requestGyroPermission);
});

// Grid Renderen
function renderGrid() {
  const gridEl = document.getElementById('maze-grid');
  gridEl.innerHTML = '';

  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const roomCode = getRoomCode(x, y);
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.id = `cell-${roomCode}`;
      cell.innerText = roomCode;

      if (x === playerPos.x && y === playerPos.y) {
        cell.classList.add('current');
      } else if (visitedRooms.has(roomCode)) {
        cell.classList.add('visited');
      }

      gridEl.appendChild(cell);
    }
  }
}

function getRoomCode(x, y) {
  const rowLetter = String.fromCharCode(65 + y); // 0=A, 1=B, etc.
  return `${rowLetter}${x + 1}`;
}

// Navigatie Logica
function move(direction) {
  if (moveCooldown) return;

  let { x, y } = playerPos;
  if (direction === 'NOORD' && y > 0) y--;
  if (direction === 'ZUID' && y < 4) y++;
  if (direction === 'WEST' && x > 0) x--;
  if (direction === 'OOST' && x < 4) x++;

  if (x !== playerPos.x || y !== playerPos.y) {
    playerPos = { x, y };
    const currentCode = getRoomCode(x, y);
    visitedRooms.add(currentCode);

    // Cooldown instellen tegen te snel 'doorsteken'
    moveCooldown = true;
    setTimeout(() => { moveCooldown = false; }, 600);

    processRoomLogic(currentCode);
    renderGrid();
  }
}

function processRoomLogic(roomCode) {
  // Check op valstrikken
  if (MAZE_CONFIG.traps.includes(roomCode)) {
    updateUI(`[ALARM] Valstrik geactiveerd in ${roomCode}! Verbinding verbroken... Reset naar A1.`, true);
    playerPos = { ...MAZE_CONFIG.start };
    return;
  }

  // Check op hints
  if (MAZE_CONFIG.clues[roomCode]) {
    updateUI(`[DATA FOUND] ${MAZE_CONFIG.clues[roomCode]}`);
  } else {
    updateUI(`Binnengegaan in kamer ${roomCode}. Geen dreiging gedetecteerd.`);
  }
}

function updateUI(message, isError = false) {
  const consoleEl = document.getElementById('console-output');
  const roomEl = document.getElementById('current-room-display');
  
  roomEl.innerText = getRoomCode(playerPos.x, playerPos.y);
  consoleEl.innerText = message;
  
  if (isError) {
    consoleEl.classList.add('text-error');
  } else {
    consoleEl.classList.remove('text-error');
  }
}

// Gyroscoop Implementatie
async function requestGyroPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission === 'granted') {
        startGyro();
      } else {
        updateUI("Sensor toegang geweigerd. Gebruik de handmatige besturing.", true);
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    startGyro();
  }
}

function startGyro() {
  isGyroActive = true;
  document.getElementById('enable-gyro-btn').style.display = 'none';
  window.addEventListener('deviceorientation', handleOrientation);
  updateUI("Sensoren actief. Kantel de telefoon om te sturen.");
}

function handleOrientation(e) {
  if (!isGyroActive || moveCooldown) return;

  const tiltLR = e.gamma; // Links (-90) / Rechts (+90)
  const tiltFB = e.beta;  // Naar voren / Naar achteren

  const THRESHOLD = 25; // Graden kanteling vereist

  if (tiltFB < -THRESHOLD) move('NOORD');
  else if (tiltFB > THRESHOLD) move('ZUID');
  else if (tiltLR < -THRESHOLD) move('WEST');
  else if (tiltLR > THRESHOLD) move('OOST');
}