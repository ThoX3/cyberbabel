const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Audio Generator (Web Audio API)
let audioCtx;
let musicInterval;
let isPlaying = false;
const bassNotes = [41.2, 41.2, 49.0, 41.2, 55.0, 41.2, 49.0, 58.27];
let noteIndex = 0;

function playSynthNote() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(bassNotes[noteIndex], audioCtx.currentTime);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(600, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(
    100,
    audioCtx.currentTime + 0.2,
  );

  gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);

  noteIndex = (noteIndex + 1) % bassNotes.length;
}

function toggleMusic() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const btn = document.getElementById("btnMusic");
  if (isPlaying) {
    clearInterval(musicInterval);
    isPlaying = false;
    btn.innerText = "OFF";
    btn.style.color = "var(--text)";
  } else {
    if (audioCtx.state === "suspended") audioCtx.resume();
    musicInterval = setInterval(playSynthNote, 220);
    isPlaying = true;
    btn.innerText = "ON";
    btn.style.color = "var(--warning)";
  }
}

// Game State
let state = {
  integrity: 100,
  money: 0,
  uptime: 0,
  spawnRate: 0.6, // Seconds between spawns
  packetSpeed: 1.5,
  dpiActive: false,
  threatIntelActive: false,
  trafficLevel: 1,
  trafficCost: 50,
  dpiCost: 300,
  threatIntelCost: 500,
  repairCost: 100,
  gameOver: false,
  shakeFrames: 0,
};

let packets = [];
let rules = [];
let logs = [];
let lastTime = performance.now();
let spawnTimer = 0;

const SHAPES = ["Square", "Circle", "Triangle"];
const COLORS = ["Red", "Green", "Blue"];
const SIZES = ["Small", "Medium", "Large"];
const ROTATIONS = ["0", "90", "180", "270"];
const ORIGINS = ["North", "South", "East", "West"];

const SIZE_MAP = { Small: 8, Medium: 14, Large: 22 };
const COLOR_MAP = { Red: "#f33", Green: "#3f3", Blue: "#33f" };

const centerX = 400;
const centerY = 300;
const firewallRadius = 150;
const coreRadius = 40;

class Packet {
  constructor() {
    this.origin = ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
    let angleBase = 0;
    if (this.origin === "East") angleBase = 0;
    if (this.origin === "South") angleBase = Math.PI / 2;
    if (this.origin === "West") angleBase = Math.PI;
    if (this.origin === "North") angleBase = (3 * Math.PI) / 2;

    this.angle = angleBase + (Math.random() * Math.PI) / 2 - Math.PI / 4;

    const spawnRadius = 450;
    this.x = centerX + Math.cos(this.angle) * spawnRadius;
    this.y = centerY + Math.sin(this.angle) * spawnRadius;

    this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.sizeType = SIZES[Math.floor(Math.random() * SIZES.length)];
    this.rotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
    this.size = SIZE_MAP[this.sizeType];

    this.isMalware = Math.random() < 0.15; // 15% flat probability
    this.isKnownThreat = this.isMalware && Math.random() < 0.7; // 70% of malware has known patterns
    this.reward =
      this.sizeType === "Large" ? 15 : this.sizeType === "Medium" ? 10 : 5;

    this.evaluated = false;
    this.status = "IN_TRANSIT"; // IN_TRANSIT, ALLOWED, DROPPED
    this.speed = state.packetSpeed * (0.8 + Math.random() * 0.4);
  }

  draw() {
    if (this.status === "DROPPED") return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((parseInt(this.rotation) * Math.PI) / 180);

    ctx.fillStyle = COLOR_MAP[this.color];
    ctx.strokeStyle = this.isMalware && state.dpiActive ? "#fff" : "#000";
    if (this.status === "ALLOWED") ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;
    ctx.beginPath();

    const r = this.size / 2;

    if (this.shape === "Square") {
      ctx.rect(-r, -r, this.size, this.size);
    } else if (this.shape === "Circle") {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    } else if (this.shape === "Triangle") {
      ctx.moveTo(0, -r);
      ctx.lineTo(r, r);
      ctx.lineTo(-r, r);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  update() {
    if (this.status !== "DROPPED") {
      this.x -= Math.cos(this.angle) * this.speed;
      this.y -= Math.sin(this.angle) * this.speed;
    }
  }
}

function addLog(msg, type = "allow") {
  logs.unshift({ msg, type });
  if (logs.length > 50) logs.pop();
  renderLogs();
}

function renderLogs() {
  const logEl = document.getElementById("sysLog");
  logEl.innerHTML = logs
    .map(
      (l) =>
        `<div class="log-entry log-${l.type}">[${state.uptime}s] ${l.msg}</div>`,
    )
    .join("");
}

function evaluatePacket(packet) {
  packet.evaluated = true;

  if (state.threatIntelActive && packet.isKnownThreat) {
    packet.status = "DROPPED";
    addLog(
      `Pattern DB Blocked ${packet.sizeType} ${packet.color} ${packet.shape}`,
      "drop",
    );
    state.money += 2;
    return;
  }

  if (state.dpiActive && packet.isMalware) {
    packet.status = "DROPPED";
    addLog(
      `DPI Blocked Malware: ${packet.sizeType} ${packet.color} ${packet.shape}`,
      "drop",
    );
    state.money += 1;
    return;
  }

  let action = "DROP";
  for (let rule of rules) {
    let oMatch = rule.origin === "*" || rule.origin === packet.origin;
    let sMatch = rule.shape === "*" || rule.shape === packet.shape;
    let cMatch = rule.color === "*" || rule.color === packet.color;
    let szMatch = rule.size === "*" || rule.size === packet.sizeType;
    let rMatch = rule.rot === "*" || rule.rot === packet.rotation;

    if (oMatch && sMatch && cMatch && szMatch && rMatch) {
      action = rule.action;
      break;
    }
  }

  packet.status = action === "ALLOW" ? "ALLOWED" : "DROPPED";
  const desc = `${packet.sizeType} ${packet.color} ${packet.shape} from ${packet.origin}`;

  if (action === "ALLOW") {
    addLog(`Allowed ${desc}`, "allow");
  } else {
    addLog(`Dropped ${desc}`, "drop");
  }
}

function handleEndpoint(packet) {
  if (packet.status === "ALLOWED") {
    if (packet.isMalware) {
      state.integrity -= 10;
      state.shakeFrames = 15;
      addLog(
        `CRITICAL: Malware breach! (${packet.sizeType} ${packet.color} ${packet.shape})`,
        "alert",
      );
    } else {
      state.money += packet.reward;
    }
  }
}

function spawnPacket() {
  packets.push(new Packet());
}

// --- UI Controls ---

function addAclRule() {
  const action = document.getElementById("aclAction").value;
  const origin = document.getElementById("aclOrigin").value;
  const shape = document.getElementById("aclShape").value;
  const color = document.getElementById("aclColor").value;
  const size = document.getElementById("aclSize").value;
  const rot = document.getElementById("aclRotation").value;

  rules.push({ action, origin, shape, color, size, rot });
  renderAcl();
}

function removeAclRule(index) {
  rules.splice(index, 1);
  renderAcl();
}

function renderAcl() {
  const tbody = document.getElementById("aclList");
  tbody.innerHTML = rules
    .map(
      (r, i) => `
        <tr>
            <td style="color: ${r.action === "ALLOW" ? "#0f0" : "#f33"}">${r.action}</td>
            <td>${r.origin.substring(0, 3)}</td>
            <td>${r.shape.substring(0, 3)}</td>
            <td>${r.color.substring(0, 3)}</td>
            <td>${r.size.substring(0, 3)}</td>
            <td>${r.rot === "*" ? "*" : r.rot + "°"}</td>
            <td><button onclick="removeAclRule(${i})">X</button></td>
        </tr>
    `,
    )
    .join("");
}

// --- Upgrades ---

function upgradeTraffic() {
  if (state.money >= state.trafficCost) {
    state.money -= state.trafficCost;
    state.trafficLevel++;
    state.spawnRate = Math.max(20, state.spawnRate - 20);
    state.trafficCost = Math.floor(state.trafficCost * 1.8);
    document.getElementById("btnUpgradeTraffic").innerText =
      `Buy ($${state.trafficCost})`;
    addLog(`Bandwidth upgraded. Traffic Level: ${state.trafficLevel}`, "allow");
    updateUI();
  }
}

function upgradeDPI() {
  if (state.money >= state.dpiCost && !state.dpiActive) {
    state.money -= state.dpiCost;
    state.dpiActive = true;
    document.getElementById("btnUpgradeDPI").innerText = "ACQUIRED";
    document.getElementById("btnUpgradeDPI").disabled = true;
    addLog(`Deep Packet Inspection (DPI) Module Activated.`, "allow");
    updateUI();
  }
}

function upgradeThreatIntel() {
  if (state.money >= state.threatIntelCost && !state.threatIntelActive) {
    state.money -= state.threatIntelCost;
    state.threatIntelActive = true;
    document.getElementById("btnUpgradeIntel").innerText = "ACQUIRED";
    document.getElementById("btnUpgradeIntel").disabled = true;
    addLog(
      `Pattern Analysis DB Synced. Blocking known malicious signatures.`,
      "allow",
    );
    updateUI();
  }
}

function repairSystem() {
  if (state.money >= state.repairCost && state.integrity < 100) {
    state.money -= state.repairCost;
    state.integrity = 100;
    addLog(`System integrity restored.`, "allow");
    updateUI();
  }
}

function updateUI() {
  document.getElementById("valIntegrity").innerText =
    Math.max(0, state.integrity) + "%";
  document.getElementById("valIntegrity").style.color =
    state.integrity < 40 ? "var(--danger)" : "var(--text)";
  document.getElementById("valMoney").innerText = "$" + state.money;
  document.getElementById("valTraffic").innerText = `Lv ${state.trafficLevel}`;

  document.getElementById("btnUpgradeTraffic").disabled =
    state.money < state.trafficCost;
  document.getElementById("btnUpgradeDPI").disabled =
    state.money < state.dpiCost || state.dpiActive;
  document.getElementById("btnUpgradeIntel").disabled =
    state.money < state.threatIntelCost || state.threatIntelActive;
  document.getElementById("btnRepair").disabled =
    state.money < state.repairCost || state.integrity >= 100;

  if (state.integrity <= 0) {
    state.gameOver = true;
  }
}

// --- Core Loop ---

function drawScenery() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Grid
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i < canvas.height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Quadrant Diagonals
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.moveTo(canvas.width, 0);
  ctx.lineTo(0, canvas.height);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Quadrant Labels
  ctx.fillStyle = "#333";
  ctx.font = "20px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("NORTH", centerX, 30);
  ctx.fillText("SOUTH", centerX, canvas.height - 20);
  ctx.fillText("WEST", 40, centerY);
  ctx.fillText("EAST", canvas.width - 40, centerY);

  // Draw Core
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#020";
  ctx.fill();
  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#0f0";
  ctx.font = "12px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("CORE", centerX, centerY + 4);

  // Draw Firewall Line
  ctx.beginPath();
  ctx.arc(centerX, centerY, firewallRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "#3f3";
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#3f3";
  ctx.fillText("FIREWALL", centerX, centerY - firewallRadius - 10);

  ctx.textAlign = "left"; // reset
}

function gameLoop() {
  if (state.gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f33";
    ctx.font = "30px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("SYSTEM COMPROMISED", canvas.width / 2, canvas.height / 2);
    ctx.font = "16px Courier New";
    ctx.fillText(
      "Refresh to reboot.",
      canvas.width / 2,
      canvas.height / 2 + 30,
    );
    ctx.textAlign = "left";
    return;
  }

  // Timer
  const now = performance.now();
  const delta = (now - lastTime) / 1000; // seconds
  lastTime = now;

  state.uptime += delta;

  const totalSeconds = Math.floor(state.uptime);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  document.getElementById("valUptime").innerText = `${minutes}m${seconds}s`;


  // Spawn Logic
  spawnTimer += delta;

  const spawnInterval = state.spawnRate;

  while (spawnTimer >= spawnInterval) {
    spawnPacket();
    spawnTimer -= spawnInterval;
  }

  ctx.save();
  if (state.shakeFrames > 0) {
    const dx = (Math.random() - 0.5) * 12;
    const dy = (Math.random() - 0.5) * 12;
    ctx.translate(dx, dy);
    state.shakeFrames--;
  }

  drawScenery();

  for (let i = packets.length - 1; i >= 0; i--) {
    let p = packets[i];

    p.update();
    p.draw();

    const dist = Math.hypot(p.x - centerX, p.y - centerY);

    // Evaluation at Firewall line
    if (!p.evaluated && dist <= firewallRadius) {
      evaluatePacket(p);
    }

    // Remove dropped packets immediately after firewall
    if (p.evaluated && p.status === "DROPPED") {
      packets.splice(i, 1);
      continue;
    }

    // End of line processing (hitting the core)
    if (dist <= coreRadius) {
      handleEndpoint(p);
      packets.splice(i, 1);
    }
  }

  ctx.restore();

  updateUI();
  requestAnimationFrame(gameLoop);
}

// Initialize
addLog("Firewall initialized. Default policy: DROP ALL.");
renderAcl();
gameLoop();
