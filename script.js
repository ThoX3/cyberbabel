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

// Highlighting for tutorial
let highlightedCanvasElement = null;

function highlightCanvasElement(name) {
  console.log(name)
  highlightedCanvasElement = name;
}

function clearTutorialHighlights() {
  document
    .querySelectorAll(".tutorial-highlight")
    .forEach(el => {
      el.classList.remove("tutorial-highlight");
    });
    highlightedCanvasElement = null;
    document.querySelector(".tutorial-panel").classList.remove("tutorial-panel-left");
}

function highlightElement(selector) {
  if (selector == '') return;
  const el = document.querySelector(selector);
  highlightCanvasElement(selector);
  if (el) {
    el.classList.add("tutorial-highlight");
    if (selector.startsWith("#aclPanel") || selector.startsWith("#logPanel")) {
      document.querySelector(".tutorial-panel").classList.add("tutorial-panel-left");
    }
  }
}

// Tutorial Logic
let tutorialStep = 0;
let tutorialOpen = true;

const tutorialMessages = [
  {
    id: "intro",
    highlights: ["#gameCanvas"]
  },
  {
    id: "firewall",
    highlights: ["firewall"]
  },
  {
    id: "default_policy",
    highlights: []
  },
  {
    id: "acl",
    highlights: ["#aclPanel"]
  },
  {
    id: "malware",
    highlights: []
  },
  {
    id: "status",
    highlights: ["#statusPanel"]
  },
  {
    id: "integrity",
    highlights: ["#valIntegrity"]
  },
  {
    id: "revenue",
    highlights: ["#valMoney", "#upgradePanel"]
  },
  {
    id: "uptime",
    highlights: ["#valUptime"]
  },
  {
    id: "traffic",
    highlights: ["#valTraffic"]
  },
  {
    id: "logs",
    highlights: ["#logPanel"]
  },
  {
    id: "loop",
    highlights: ["#logPanel"]
  },
  {
    id: "allow",
    highlights: ["#aclPanel"]
  },
  {
    id: "alert",
    highlights: ["#logPanel"],
    onEnter: () => {
      addLog(t("logs.malware_breach", { damage: state.malwareDamage, description: getPacketDescription({ shape: "Triangle" }) }),
        "alert"
      );
    }
  },
  {
    id: "adjust",
    highlights: ["#aclPanel", "#logPanel"]
  }
];

document
  .getElementById("tutorialReopenBtn")
  .addEventListener("click", () => {
    document
      .getElementById("tutorialDropdown")
      .classList.toggle("open");
  });

function buildTutorialMenu() {
  const dropdown = document.getElementById("tutorialDropdown");

  dropdown.innerHTML = tutorialMessages.map(message => `
    <button onclick="openTutorialAt(${tutorialMessages.indexOf(message)})">
      ${getTutorialStep(tutorialMessages.indexOf(message)).subtitle}
    </button>
  `).join("");
}

function openTutorialAt(stepIndex) {
  tutorialStep = stepIndex;

  document.querySelector(".tutorial-panel").style.display = "flex";

  updateTutorial();

  document.getElementById("tutorialDropdown")
    .classList.remove("open");
}

function closeTutorial() {
  tutorialStep = tutorialMessages.length;
  updateTutorial();
}

function nextTutorialStep() {
  tutorialStep++;
  updateTutorial();
}

function previousTutorialStep() {
  tutorialStep--;
  if (tutorialStep < 0) {
    tutorialStep = 0;
  }
  updateTutorial();
}

function getTutorialStep(index) {
  const logicStep = tutorialMessages[index];
  const text = TUTORIAL_TEXT[currentLanguage][logicStep.id];

  return {
    ...logicStep,
    title: text.title,
    subtitle: text.subtitle,
    text: text.text
  };
}

function updateTutorial() {
    if (tutorialStep >= tutorialMessages.length) {
    document.querySelector(".tutorial-panel").style.display = "none";
    document.getElementById("tutorialReopenBtn").style.display = "block";
    clearTutorialHighlights();
    return;
  }

  if (tutorialStep <= 0) {
    document.getElementById("tutorialPreviousBtn").style.display = "none";
  } else {
    document.getElementById("tutorialPreviousBtn").style.display = "block";
  }

  const step = getTutorialStep(tutorialStep);


  document.getElementById("tutorialContent").innerHTML = step.text;

  document.getElementById("tutorialTitle").innerText = step.title;
  document.getElementById("tutorialSubtitle").innerText = step.subtitle;
  document.getElementById("tutorialReopenBtn").style.display = "none";

  clearTutorialHighlights();
  for (let highlight of step.highlights) {
    highlightElement(highlight);
    if (step.onEnter) {
      step.onEnter();
    }
  }
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
  totalPackets: 0,
  correctRejectedPackets: 0,
  incorrectRejectedPackets: 0,
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

      addLog(t("logs.dpi_block", { description: getPacketDescription(packet) }), "drop");
      state.correctRejectedPackets++;
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

      addLog(t("logs.packet_dropped", { description: getPacketDescription(packet) }), "drop");

      if (packet.isMalware) {
      state.correctRejectedPackets++;
      }
      else state.incorrectRejectedPackets++;

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
    addLog(t("logs.packet_allowed", { description: desc }), "allow");
  } else {
    addLog(t("logs.packet_dropped", { description: desc }), "drop");
    if (packet.isMalware) {
      state.correctRejectedPackets++;
    }
    else state.incorrectRejectedPackets++;
  }
}


function getPacketDescription(packet) {
  let parts = [];

  if (isFeatureUnlocked("size") && packet.sizeType) {
    parts.push(SIZE_ICONS[packet.sizeType] || packet.sizeType.substring(0, 3));
  }

  if (isFeatureUnlocked("color") && packet.color) {
    parts.push(COLOR_ICONS[packet.color] || packet.color.substring(0, 3));
  }

  if (isFeatureUnlocked("shape") && packet.shape) {
    parts.push(SHAPE_ICONS[packet.shape] || packet.shape.substring(0, 3));
  }

  if (isFeatureUnlocked("origin") && packet.origin) {
    parts.push(packet.origin.substring(0, 3));
  }

  if (isFeatureUnlocked("rotation") && packet.rotation) {
    parts.push(packet.rotation.substring(0, 3) + "°");
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
        ? t("logs.bastion_activated", { damage: damage }) 
        : t("logs.malware_breach", { damage: damage, description: getPacketDescription(packet) });
      addLog(logMsg, "alert");
    } else {
      state.money += packet.reward;
    }
  }
}

function spawnPacket() {
  packets.push(new Packet());
  state.totalPackets++;
}

// --- UI Controls ---

function addAclRule() {
  const action = getSelectedRadioValue("aclAction");
  const origin = getSelectedRadioValue("aclOrigin");
  const shape = getSelectedRadioValue("aclShape");
  const color = getSelectedRadioValue("aclColor");
  const size = getSelectedRadioValue("aclSize");
  const rot = getSelectedRadioValue("aclRotation");

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

function getSelectedRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "*";
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
          
          ${isFeatureUnlocked("origin")
          ? `<td>${r.origin.substring(0, 3)}</td>`
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

    ${isFeatureUnlocked("shape") ? "<th>Shp</th>" : ""}
    ${isFeatureUnlocked("color") ? "<th>Col</th>" : ""}
    ${isFeatureUnlocked("size") ? "<th>Siz</th>" : ""}
    ${isFeatureUnlocked("rotation") ? "<th>Rot</th>" : ""}
    ${isFeatureUnlocked("origin") ? "<th>Ori</th>" : ""}
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
    addLog(t("logs.bandwidth_upgraded", { trafficLevel: state.trafficLevel }), "allow");
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
    addLog(t("logs.dpi_module_deployed"), "allow");
    updateUI();
  }
}

function upgradeThreatIntel() {
  if (state.money >= state.threatIntelCost && !state.threatIntelActive) {
    state.money -= state.threatIntelCost;
    state.threatIntelActive = true;
    document.getElementById("btnUpgradeIntel").innerText = "ACQUIRED";
    document.getElementById("btnUpgradeIntel").disabled = true;
    addLog(t("logs.pattern_db_updated"), "allow");
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
    
    addLog(t("logs.heavy_bastion_deployed"), "allow");
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
    addLog(t("logs.system_repaired"), "allow");
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
    ctx.fillText(t("north"), centerX, 30);
    ctx.fillText(t("south"), centerX, canvas.height - 20);
    ctx.fillText(t("west"), 40, centerY);
    ctx.fillText(t("east"), canvas.width - 40, centerY);
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
  ctx.fillText(t("core"), centerX, centerY + 4);

  // Draw Firewall Line
  ctx.beginPath();
  ctx.arc(centerX, centerY, firewallRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "#3f3";
  ctx.setLineDash([5, 5]);
  if (highlightedCanvasElement === "firewall") {
    ctx.shadowColor = "#0f0";
    ctx.shadowBlur = 20;
  }
  ctx.stroke();
  ctx.setLineDash([]);


  ctx.fillStyle = "#3f3";
  ctx.fillText(t("firewall"), centerX, centerY - firewallRadius - 10);

  ctx.textAlign = "left"; // reset
  ctx.restore();
}

function gameover() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.textAlign = "center";

      ctx.fillStyle = "#f33";
      ctx.font = "30px Courier New";
      ctx.fillText(
          t("systemCompromised"),
          canvas.width / 2,
          canvas.height / 2 - 80
      );

      ctx.fillStyle = "#0f0";
      ctx.font = "18px Courier New";

      ctx.fillText(
          `Total Packets: ${state.totalPackets}`,
          canvas.width / 2,
          canvas.height / 2 - 10
      );

      ctx.fillText(
          `Correct Rejected Packets: ${state.correctRejectedPackets}`,
          canvas.width / 2,
          canvas.height / 2 + 20
      );

      ctx.fillText(
          `Incorrect Rejected Packets: ${state.incorrectRejectedPackets}`,
          canvas.width / 2,
          canvas.height / 2 + 50
      );

      const rejectRate =
          state.totalPackets > 0
              ? Math.round(
                    (state.incorrectRejectedPackets /
                        state.totalPackets) *
                        100
                )
              : 0;

      ctx.fillText(
          `False Positive Rate: ${rejectRate}%`,
          canvas.width / 2,
          canvas.height / 2 + 80
      );

      const totalSeconds = Math.floor(state.uptime);
      const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');

      ctx.fillText(
          `Time: ${minutes}m${seconds}s`,
          canvas.width / 2,
          canvas.height / 2 + 110
      );

      ctx.font = "16px Courier New";

      ctx.fillStyle = "#aaa";

      ctx.fillText(
          "Refresh to reboot.",
          canvas.width / 2,
          canvas.height / 2 + 140
      );

      ctx.textAlign = "left";
      return;
}

function gameLoop() {
    if (isPaused) {
    requestAnimationFrame(gameLoop);
    return;
  }
  if (state.gameOver) {
    gameover();
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
addLog(t("logs.firewall_initialized"));
updateMalwarePatterns();
buildTutorialMenu();
renderAcl();
renderAclHeaders();
gameLoop();
