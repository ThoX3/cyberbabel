const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Tooltip
const tooltip = document.getElementById("tooltip");

document.addEventListener("mouseover", (e) => {
  const el = e.target.closest("[data-tip]");
  if (!el) return;

  tooltip.style.display = "block";
  tooltip.innerHTML = el.getAttribute("data-tip");
});

document.addEventListener("mousemove", (e) => {
  tooltip.style.left = e.pageX + 10 + "px";
  tooltip.style.top = e.pageY + 10 + "px";
});

document.addEventListener("mouseout", (e) => {
  const el = e.target.closest("[data-tip]");
  if (!el) return;

  tooltip.style.display = "none";
});

// Tutorial Logic
let tutorialStep = 0;
let tutorialOpen = true;

const tutorialMessages = [
  "Des paquets de données (représentés différemment) arrivent de partout et se dirigent vers le centre de l'écran, notre coeur…",
  "À mi-chemin, ils traversent la ligne en pointillés appelée FIREWALL. C'est à ce moment précis que votre système décide de leur sort.",
  "Par défaut, la politique est \"DROP ALL\" : Absolument tous les paquets sont détruits à la frontière. Votre système est 100% sécurisé, mais vous ne gagnez aucun revenu.",
  "<b>Les règles ACL (Access Control List)</b><br>C'est votre arme principale. Vous devez utiliser le panneau ACL pour créer des règles ALLOW (autoriser) qui filtreront le trafic par leurs caractéristiques.",
  "<b>Le piège</b><br>Environ 15% des paquets générés sont des malwares déguisés. Si une de vos règles ALLOW est trop permissive et laisse passer un malware jusqu'au CORE, votre système subit des dégâts plus ou moins majeurs. A l'inverse, si elle est trop stricte, vous risquez de gagnez moins d'argent...",
  
  "Ce panneau est votre tableau de bord vital. Il affiche l'état de santé et de rentabilité de votre serveur en temps réel.",
  "<b>Integrity (Intégrité)</b><br>Représente la 'vie' de votre système. Elle commence à 100%. Chaque malware qui réussit à toucher le CORE fait chuter cette valeur aléatoirement (10-30%). À 0%, le système est compromis (Game Over).",
  "<b>Data/Revenue</b><br>Votre budget. Chaque paquet sain qui atteint le CORE vous rapporte de l'argent. Ce budget vous permet d'acheter des UPGRADES (améliorations).",
  "<b>Uptime</b><br>Le temps écoulé (en secondes) depuis le démarrage du serveur. C'est votre score de survie !",
  "<b>Traffic Load</b><br>Indique le niveau actuel d'apparition des paquets sur le réseau.",

  "Gérer un pare-feu est un processus itératif. Vous ne pouvez pas deviner le trafic à l'avance; vous devez l'observer et vous adapter grâce au Traffic Log (Journal de trafic).",
  "<b>Voici la boucle de travail idéale pour vous</b><br> Observer (Drop) : Au début, regardez votre Traffic Log. Vous verrez des lignes indiquant Dropped [Taille] [Couleur] [Forme]. Cela vous montre le trafic qui essaie d'entrer.",
  "<b>Autoriser (Allow)</b><br>Identifiez un motif récurrent (par exemple, beaucoup de paquets bleus viennent du Nord). L'argent va commencer à rentrer !",
  "<b>Surveiller les alertes (Alert)</b><br>Gardez un œil sur le log. Si vous voyez un message orange/rouge CRITICAL: Malware breach!, cela signifie qu'un paquet infecté a utilisé la règle que vous venez de créer. Le log vous donnera ses caractéristiques exactes.",
  "<b>Ajuster (Drop spécifique)</b><br>Si le malware était un 'Petit Carré Bleu du Nord', retournez dans votre ACL et ajoutez une règle très spécifique pour bloquer (DROP) uniquement cette combinaison, afin de sécuriser la faille tout en gardant le reste du trafic bleu ouvert."
];

const tutorialSteps = [
  {
    id: 0,
    title: "Mécanique de base + ACL"
  },
  {
    id: 5,
    title: "System Status"
  },
  {
    id: 10,
    title: "Le Processus : Analyser les logs"
  }
];

function nextTutorialStep() {
  tutorialStep++;
  updateTutorial();
}

function getTutorialTitle() {
  for (let i = tutorialSteps.length - 1; i >= 0; i--) {
    if (tutorialStep >= tutorialSteps[i].id) {
      return tutorialSteps[i].title;
    }
  }
  return "";
}

function updateTutorial() {
    if (tutorialStep >= tutorialMessages.length) {
    document.querySelector(".tutorial-panel").style.display = "none";
    document.getElementById("tutorialReopenBtn").style.display = "block";
    return;
  }

  document.getElementById("tutorialContent").innerHTML =
    tutorialMessages[tutorialStep];

  document.getElementById("tutorialTitle").innerText = getTutorialTitle();
  document.getElementById("tutorialReopenBtn").style.display = "none";
}

function resetTutorial() {
  tutorialStep = 0;

  document.querySelector(".tutorial-panel").style.display = "flex";
  updateTutorial();
}

// Audio Generator (Web Audio API)
let audioCtx;
let musicInterval;
let isPlaying = false;
const bassNotes = [41.2, 41.2, 49.0, 41.2, 55.0, 41.2, 49.0, 58.27];
let noteIndex = 0;

let isPaused = false;
document.addEventListener("visibilitychange", () => {
  isPaused = document.hidden;

  if (!isPaused) {
    lastTime = performance.now();
    spawnTimer = 0;
  }
});

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

const FEATURE_UNLOCKS = {
  shape: 1,
  color: 2,
  size: 3,
  rotation: 5,
  origin: 6,
};

function isFeatureUnlocked(feature) {
  return state.trafficLevel >= FEATURE_UNLOCKS[feature];
}

function updateAclVisibility() {
  document.getElementById("aclOrigin").style.display =
    isFeatureUnlocked("origin") ? "" : "none";

  document.getElementById("aclColor").style.display =
    isFeatureUnlocked("color") ? "" : "none";

  document.getElementById("aclSize").style.display =
    isFeatureUnlocked("size") ? "" : "none";

  document.getElementById("aclRotation").style.display =
    isFeatureUnlocked("rotation") ? "" : "none";

  document.getElementById("aclShape").style.display =
    isFeatureUnlocked("shape") ? "" : "none";
}

// Malware
let malwarePatterns = {
  shape: null,
  color: null,
  size: null,
  origin: null,
  rotation: null
};

function updateMalwarePatterns() {
  if (isFeatureUnlocked("shape") && !malwarePatterns.shape) {
    malwarePatterns.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  }

  if (isFeatureUnlocked("color") && !malwarePatterns.color) {
    malwarePatterns.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  if (isFeatureUnlocked("size") && !malwarePatterns.size) {
    malwarePatterns.size = SIZES[Math.floor(Math.random() * SIZES.length)];
  }

  if (isFeatureUnlocked("origin") && !malwarePatterns.origin) {
    malwarePatterns.origin = ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
  }

  if (isFeatureUnlocked("rotation") && !malwarePatterns.rotation) {
    malwarePatterns.rotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
  }
}

// Game State
let state = {
  integrity: 100,
  money: 0,
  uptime: 0,
  spawnRate: 0.8, // Seconds between spawns
  packetSpeed: 1.5,
  dpiActive: false,
  threatIntelActive: false,
  dpiPourcentage: 0.3,
  threatIntelPourcentage: 0.6,
  trafficLevel: 1,
  trafficCost: 50,
  dpiCost: 300,
  threatIntelCost: 500,
  repairCost: 100,
  gameOver: false,
  shakeFrames: 0,
  malwarePercentage: 0.15,
  heavyBastionActive: false,
  heavyBastionCost: 750,
  malwareDamage : 5
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
    this.isMalware = Math.random() < state.malwarePercentage;

    this.origin = isFeatureUnlocked("origin")
      ? ORIGINS[Math.floor(Math.random() * ORIGINS.length)]
      : null;
    let angleBase = 0;
    if (this.origin === "East") angleBase = 0;
    if (this.origin === "South") angleBase = Math.PI / 2;
    if (this.origin === "West") angleBase = Math.PI;
    if (this.origin === "North") angleBase = (3 * Math.PI) / 2;

    this.angle = angleBase + (Math.random() * Math.PI) / 2 - Math.PI / 4;

    const spawnRadius = 450;
    this.x = centerX + Math.cos(this.angle) * spawnRadius;
    this.y = centerY + Math.sin(this.angle) * spawnRadius;

    this.shape = isFeatureUnlocked("shape")
      ? SHAPES[Math.floor(Math.random() * SHAPES.length)]
      : null;
    this.color = isFeatureUnlocked("color")
      ? COLORS[Math.floor(Math.random() * COLORS.length)]
      : null;
    this.sizeType = isFeatureUnlocked("size")
      ? SIZES[Math.floor(Math.random() * SIZES.length)]
      : null;
    this.rotation = isFeatureUnlocked("rotation")
      ? ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)]
      : null;
    this.size = this.sizeType
      ? SIZE_MAP[this.sizeType]
      : 14;

    this.isMalware = this.verifyMalware();

    /*if (this.isMalware) {
      this.applyMalwareSignature();
    }*/
    this.reward =
      this.sizeType === "Large" ? 15 : this.sizeType === "Medium" ? 10 : 5;

    this.evaluated = false;
    this.status = "IN_TRANSIT"; // IN_TRANSIT, ALLOWED, DROPPED
    this.speed = state.packetSpeed * (0.8 + Math.random() * 0.4);
  }

  verifyMalware() {
    let matches = 0;
    let total = 0;

    if (isFeatureUnlocked("shape")) {
      total++;
      if (this.shape === malwarePatterns.shape) {
        matches++;
      }
    }

    if (isFeatureUnlocked("color")) {
      total++;
      if (this.color === malwarePatterns.color) {
        matches++;
      }
    }

    if (isFeatureUnlocked("size")) {
      total++;
      if (this.sizeType === malwarePatterns.size) {
        matches++;
      }
    }

    if (isFeatureUnlocked("origin")) {
      total++;
      if (this.origin === malwarePatterns.origin) {
        matches++;
      }
    }

    if (isFeatureUnlocked("rotation")) {
      total++;
      if (this.rotation === malwarePatterns.rotation) {
        matches++;
      }
    }

    // Require at least 1 match
    return matches > 0;
  }

  applyMalwareSignature() {
    const possibleTraits = [];

    if (isFeatureUnlocked("shape")) {
      possibleTraits.push("shape");
    }

    if (isFeatureUnlocked("color")) {
      possibleTraits.push("color");
    }

    if (isFeatureUnlocked("size")) {
      possibleTraits.push("size");
    }

    if (isFeatureUnlocked("origin")) {
      possibleTraits.push("origin");
    }

    if (isFeatureUnlocked("rotation")) {
      possibleTraits.push("rotation");
    }

    if (possibleTraits.length === 0) return;

    // Malware must match at least ONE trait
    const mandatoryTrait =
      possibleTraits[Math.floor(Math.random() * possibleTraits.length)];

    // Randomly apply traits
    for (const trait of possibleTraits) {

      // If it's the mandatory trait, it must be applied. For others, 50% chance.
      const shouldApply =
        trait === mandatoryTrait || Math.random() < 0.5;

      if (!shouldApply) continue;

      switch (trait) {
        case "shape":
          this.shape = malwarePatterns.shape;
          break;

        case "color":
          this.color = malwarePatterns.color;
          break;

        case "size":
          this.sizeType = malwarePatterns.size;
          break;

        case "origin":
          this.origin = malwarePatterns.origin;
          break;

        case "rotation":
          this.rotation = malwarePatterns.rotation;
          break;
      }
    }
    addLog(`Malware Spawned: ${getPacketDescription(this)}`, "alert");
  }

  draw() {
    if (this.status === "DROPPED") return;

    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.rotation !== null) {
      ctx.rotate((parseInt(this.rotation) * Math.PI) / 180);
    }

    ctx.fillStyle = this.color
      ? COLOR_MAP[this.color]
      : "#c0bfbf";
    ctx.strokeStyle = this.isMalware && state.dpiActive ? "#fff" : "#000";
    if (this.status === "ALLOWED") ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;
    ctx.beginPath();

    const r = this.size / 2;

    if (this.shape === null || this.shape === "Square"){
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

  if (this.rotation !== null) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

    ctx.restore();
  }

  update() {
    if (this.status !== "DROPPED") {
      this.x -= Math.cos(this.angle) * this.speed;
      this.y -= Math.sin(this.angle) * this.speed;
    }
  }
}

let logVisibility = {
  allow: true,
  drop: true,
  alert: true
};

function toggleLogType(type) {
  logVisibility[type] = !logVisibility[type];

  const map = {
    allow: "btnAllow",
    drop: "btnDrop",
    alert: "btnAlert"
  };

  const btn = document.getElementById(map[type]);

  btn.style.opacity = logVisibility[type] ? "1" : "0.4";

  renderLogs();
}

function addLog(msg, type = "allow") {
  logs.unshift({ msg, type });
  if (logs.length > 50) logs.pop();
  renderLogs();
}

function renderLogs() {
  const logEl = document.getElementById("sysLog");

  logEl.innerHTML = logs
    .filter(l => logVisibility[l.type])
    .map(
      (l) =>
        `<div class="log-entry log-${l.type}">[${Math.floor(state.uptime)}s] ${l.msg}</div>`
    )
    .join("");
}

function evaluatePacket(packet) {
  packet.evaluated = true;

  // DPI
  if (state.dpiActive && packet.isMalware) {
    let percentage = state.dpiPourcentage;

    if (state.threatIntelActive) {
      percentage = state.threatIntelPourcentage;
    }

    if (Math.random() < percentage) {
      packet.status = "DROPPED";

      addLog(
        `DPI Blocked Malware: ${getPacketDescription(packet)}`,
        "drop",
      );

      state.money += 1;
      return;
    }
  }

  // ACL Evaluation
  let allowMatched = false;

  for (let rule of rules) {
    let oMatch =
      !isFeatureUnlocked("origin") ||
      rule.origin === "*" ||
      rule.origin === packet.origin;

    let sMatch =
      !isFeatureUnlocked("shape") ||
      rule.shape === "*" ||
      rule.shape === packet.shape;

    let cMatch =
      !isFeatureUnlocked("color") ||
      rule.color === "*" ||
      rule.color === packet.color;

    let szMatch =
      !isFeatureUnlocked("size") ||
      rule.size === "*" ||
      rule.size === packet.sizeType;

    let rMatch =
      !isFeatureUnlocked("rotation") ||
      rule.rot === "*" ||
      rule.rot === packet.rotation;

    const matched =
      oMatch && sMatch && cMatch && szMatch && rMatch;

    if (!matched) continue;

    // DROP always has priority
    if (rule.action === "DROP") {
      packet.status = "DROPPED";

      addLog(
        `Dropped ${getPacketDescription(packet)}`,
        "drop",
      );

      return;
    }

    // Remember ALLOW match
    if (rule.action === "ALLOW") {
      allowMatched = true;
    }
  }

  // Final decision
  packet.status = allowMatched
    ? "ALLOWED"
    : "DROPPED";

  const desc = getPacketDescription(packet);

  if (packet.status === "ALLOWED") {
    addLog(`Allowed ${desc}`, "allow");
  } else {
    addLog(`Dropped ${desc}`, "drop");
  }
}


function getPacketDescription(packet) {
  let parts = [];

  if (isFeatureUnlocked("size")) {
    parts.push(packet.sizeType);
  }

  if (isFeatureUnlocked("color")) {
    parts.push(packet.color);
  }

  if (isFeatureUnlocked("shape")) {
    parts.push(packet.shape);
  }

  if (isFeatureUnlocked("origin")) {
    parts.push(`from ${packet.origin}`);
  }

  if (isFeatureUnlocked("rotation")) {
    parts.push(`rot ${packet.rotation}°`);
  }

  return parts.join(" ");
}

function handleEndpoint(packet) {
  if (packet.status === "ALLOWED") {
    if (packet.isMalware) {
      let damage = state.heavyBastionActive ? state.malwareDamage / 2 : state.malwareDamage;
      state.integrity -= damage;
      state.shakeFrames = 15;
      const logMsg = state.heavyBastionActive 
        ? `Malware mitigated by Bastion! (-${damage}%)` 
        : `CRITICAL: Malware breach! (-${damage}%) by (${getPacketDescription(packet)})`;
      addLog(logMsg, "alert");
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

  rules.push({
    action,
    origin: isFeatureUnlocked("origin") ? origin : null,
    shape: isFeatureUnlocked("shape") ? shape : null,
    color: isFeatureUnlocked("color") ? color : null,
    size: isFeatureUnlocked("size") ? size : null,
    rot: isFeatureUnlocked("rotation") ? rot : null,
  });
  renderAcl();
}

function syncRulesWithUnlocks() {
  for (let rule of rules) {
    if (isFeatureUnlocked("origin") && rule.origin == null) {
      rule.origin = "*";
    }

    if (isFeatureUnlocked("shape") && rule.shape == null) {
      rule.shape = "*";
    }

    if (isFeatureUnlocked("color") && rule.color == null) {
      rule.color = "*";
    }

    if (isFeatureUnlocked("size") && rule.size == null) {
      rule.size = "*";
    }

    if (isFeatureUnlocked("rotation") && rule.rot == null) {
      rule.rot = "*";
    }
  }
}

function removeAclRule(index) {
  rules.splice(index, 1);
  renderAcl();
}

const STATUS_ICONS = {
  ALLOW: "✅",
  DROP: "⛔"
}

const SHAPE_ICONS = {
  Square: "&#9633",
  Circle: "&#9675",
  Triangle: "&#9651"
};

const COLOR_ICONS = {
  Red: "🟥",
  Green: "🟩",
  Blue: "🟦"
};

const SIZE_ICONS = {
  Small: "▫️",
  Medium: "◻️",
  Large: "⬜"
};

function renderAcl() {
  const tbody = document.getElementById("aclList");

  tbody.innerHTML = rules
    .map((r, i) => `
      <tr draggable="true" data-index="${i}">
        <td style="color: ${r.action === "ALLOW" ? "#0f0" : "#f33"}">
          ${STATUS_ICONS[r.action]}
        </td>

        ${isFeatureUnlocked("origin")
          ? `<td>${r.origin.substring(0, 3)}</td>`
          : ""}

        ${isFeatureUnlocked("shape")
          ? `<td>${SHAPE_ICONS[r.shape] || r.shape.substring(0, 3)}</td>`
          : ""}

        ${isFeatureUnlocked("color")
          ? `<td>${COLOR_ICONS[r.color] || r.color.substring(0, 3)}</td>`
          : ""}

        ${isFeatureUnlocked("size")
          ? `<td>${SIZE_ICONS[r.size] || r.size.substring(0, 3)}</td>`
          : ""}

        ${isFeatureUnlocked("rotation")
          ? `<td>${r.rot === "*" ? "*" : r.rot + "°"}</td>`
          : ""}

        <td>
          <button onclick="removeAclRule(${i})">X</button>
        </td>
      </tr>
    `)
    .join("");

    attachDragHandlers();
}

let dragStartIndex = null;

function moveRule(from, to) {
  const moved = rules.splice(from, 1)[0];
  rules.splice(to, 0, moved);

  renderAcl();
}

function attachDragHandlers() {
  const rows = document.querySelectorAll("#aclList tr");

  rows.forEach(row => {
    row.addEventListener("dragstart", (e) => {
      dragStartIndex = Number(row.dataset.index);
      row.style.opacity = "0.5";
    });

    row.addEventListener("dragend", (e) => {
      row.style.opacity = "1";
    });

    row.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    row.addEventListener("drop", (e) => {
      e.preventDefault();

      const dragEndIndex = Number(row.dataset.index);

      if (dragStartIndex === null || dragEndIndex === dragStartIndex) return;

      moveRule(dragStartIndex, dragEndIndex);
    });
  });
}

function renderAclHeaders() {
  const header = document.getElementById("aclHeader");

  header.innerHTML = `
    <th>Act</th>

    ${isFeatureUnlocked("origin") ? "<th>Ori</th>" : ""}
    ${isFeatureUnlocked("shape") ? "<th>Shp</th>" : ""}
    ${isFeatureUnlocked("color") ? "<th>Col</th>" : ""}
    ${isFeatureUnlocked("size") ? "<th>Siz</th>" : ""}
    ${isFeatureUnlocked("rotation") ? "<th>Rot</th>" : ""}

    <th></th>
  `;
}

// --- Upgrades ---
const UPGRADE_UNLOCKS = {
  traffic: 1,
  dpi: 4,
  threatIntel: 8,
  repair: 1,
  heavyBastion: 6
};

function isUpgradeUnlocked(type) {
  return state.trafficLevel >= UPGRADE_UNLOCKS[type];
}

function updateUpgradeVisibility() {
  document.getElementById("upgradeTraffic").style.display =
    isUpgradeUnlocked("traffic") ? "flex" : "none";

  document.getElementById("upgradeDPI").style.display =
    isUpgradeUnlocked("dpi") ? "flex" : "none";

  document.getElementById("upgradeIntel").style.display =
    isUpgradeUnlocked("threatIntel") ? "flex" : "none";

  document.getElementById("upgradeRepair").style.display =
    isUpgradeUnlocked("repair") ? "flex" : "none";

  document.getElementById("upgradeHeavyBastion").style.display = 
    isUpgradeUnlocked("heavyBastion") ? "flex" : "none";
}

function upgradeTraffic() {
  if (state.money >= state.trafficCost) {
    state.money -= state.trafficCost;
    state.trafficLevel++;
    state.malwarePercentage = Math.min(0.9, state.malwarePercentage + 0.05);
    state.spawnRate = Math.max(0.01, state.spawnRate - 0.15);
    state.trafficCost = Math.floor(state.trafficCost * 1.8);
    document.getElementById("btnUpgradeTraffic").innerText =
      `Buy ($${state.trafficCost})`;
    addLog(`Bandwidth upgraded. Traffic Level: ${state.trafficLevel}`, "allow");
    syncRulesWithUnlocks();
    updateMalwarePatterns();
    renderAclHeaders();
    renderAcl();
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

function deployHeavyBastion() {
  if (state.money >= state.heavyBastionCost && !state.heavyBastionActive) {
    state.money -= state.heavyBastionCost;
    state.heavyBastionActive = true;
    
    // Mise à jour du bouton
    const btn = document.getElementById("btnUpgradeBastion");
    btn.innerText = "DEPLOYED";
    btn.disabled = true;
    
    addLog("HEAVY BASTION deployed. Core integrity damage reduced by 50%.", "allow");
    updateUI();
  }
}

function repairSystem() {
  if (state.money >= state.repairCost && state.integrity < 100) {
    state.money -= state.repairCost;
    state.repairCost = Math.floor(state.repairCost * 1.5);
    document.getElementById("btnRepair").innerText =
      `Repair System ($${state.repairCost})`;
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

  const btnBastion = document.getElementById("btnUpgradeBastion");
  if (btnBastion) {
    btnBastion.disabled = state.money < state.heavyBastionCost || state.heavyBastionActive;
    if (state.heavyBastionActive) {
      btnBastion.innerText = "DEPLOYED";
    }
  }

  if (state.integrity <= 0) {
    state.gameOver = true;
  }

  updateAclVisibility();
  updateUpgradeVisibility();
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

  if (isFeatureUnlocked("origin")) {
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
  }

  if (state.heavyBastionActive) {
    ctx.save();
    ctx.beginPath();
    // On dessine un cercle un peu plus large que le core (coreRadius + 15)
    ctx.arc(centerX, centerY, coreRadius + 15, 0, Math.PI * 2);
    
    // Style "Cyber Shield" bleu cyan
    ctx.strokeStyle = "rgba(0, 255, 255, 0.6)"; 
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]); // Effet pointillés rotatifs (statique ici)
    ctx.stroke();
    
    // Halo lumineux interne
    ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
    ctx.fill();
    ctx.restore();
  }
  
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
    if (isPaused) {
    requestAnimationFrame(gameLoop);
    return;
  }
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
updateTutorial();
addLog("Firewall initialized. Default policy: DROP ALL.");
updateMalwarePatterns();
renderAcl();
renderAclHeaders();
gameLoop();
