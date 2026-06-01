const LANG = {
    en: {
        title: "// Network Perimeter Defense",

        systemStatus: "System Status",
        upgrades: "Upgrades",
        aclTitle: "Access Control (ACL)",
        trafficLog: "Traffic Log",

        integrity: "Integrity",
        revenue: "Data/Revenue",
        uptime: "Uptime",
        trafficLoad: "Traffic Load",
        audioMatrix: "Audio Matrix",

        bandwidth: "Bandwidth",
        dpiModule: "DPI Module",
        patternDb: "Pattern Analysis DB",
        heavyBastion: "Heavy Bastion",
        repairSystem: "Repair System",

        buy: "Buy",
        deploy: "Deploy",
        repair: "Repair",

        addRule: "Add Rule",
        defaultPolicy: "Default Policy: DROP ALL",

        aclRuleAction: "Action",
        aclRuleShape: "Shape",
        aclRuleColor: "Color",
        aclRuleOrigin: "Origin",
        aclRuleRotation: "Rotation",
        aclRuleSize: "Size",
        allow: "ALLOW",
        drop: "DROP",
        critical: "CRITICAL",

        firewall: "FIREWALL",
        core: "CORE",

        north: "NORTH",
        east: "EAST",
        south: "SOUTH",
        west: "WEST",

        tutorial: "Tutorial",
        previous: "Previous",
        next: "Next",

        systemCompromised: "SYSTEM COMPROMISED",
        refreshToReboot: "Refresh to reboot.",

        totalPackets: "Total Packets",
        rejectedPackets: "Rejected Packets",
        incorrectRejects: "Incorrect Rejects",
        falsePositiveRate: "False Positive Rate",

        logs: {
          firewall_initialized: "Firewall initialized. Default policy: DROP ALL.",
          malware_spawn: "Malware spawned: {description}",
          bastion_activated: "Malware mitigated by Bastion! (-{damage}%)",
          malware_breach: "CRITICAL: Malware breach! (-{damage}%) by {description}",
          packet_dropped: "Dropped {description}",
          packet_allowed: "Allowed {description}",
          dpi_block: "DPI Blocked Malware: {description}",
          system_repaired: "System integrity restored.",
          heavy_bastion_deployed: "HEAVY BASTION deployed. Core integrity damage reduced by 50%.",
          pattern_db_updated: "Pattern Analysis DB Synced. Blocking known malicious signatures.",
          dpi_module_deployed: "Deep Packet Inspection (DPI) Module Activated.",
          bandwidth_upgraded: "Bandwidth upgraded. Traffic Level: {trafficLevel}",
        }
    },

    fr: {
        title: "// Défense du périmètre réseau",

        systemStatus: "État du système",
        upgrades: "Améliorations",
        aclTitle: "Contrôle d'accès (ACL)",
        trafficLog: "Journal réseau",
        audioMatrix: "Matrice audio",

        integrity: "Intégrité",
        revenue: "Données/Revenus",
        uptime: "Temps actif",
        trafficLoad: "Charge réseau",

        bandwidth: "Bande passante",
        dpiModule: "Module DPI",
        patternDb: "Base d'analyse",
        heavyBastion: "Bastion lourd",
        repairSystem: "Système de réparation",

        buy: "Acheter",
        deploy: "Déployer",
        repair: "Réparer",

        addRule: "Ajouter une règle",
        defaultPolicy: "Politique par défaut : TOUT BLOQUER",

        aclRuleAction: "Action",
        aclRuleShape: "Forme",
        aclRuleColor: "Couleur",
        aclRuleOrigin: "Origine",
        aclRuleRotation: "Rotation",
        aclRuleSize: "Taille",
        
        firewall: "PARE-FEU",
        core: "Noyau",

        allow: "AUTORISER",
        drop: "BLOQUER",
        critical: "CRITIQUE",

        north: "NORD",
        east: "EST",
        south: "SUD",
        west: "OUEST",

        tutorial: "Tutoriel",
        previous: "Précédent",
        next: "Suivant",

        systemCompromised: "SYSTÈME COMPROMIS",
        refreshToReboot: "Actualisez pour redémarrer.",

        totalPackets: "Paquets totaux",
        rejectedPackets: "Paquets rejetés",
        incorrectRejects: "Rejets incorrects",
        falsePositiveRate: "Taux de faux positifs",

        logs: {
          firewall_initialized: "Pare-feu initialisé. Politique par défaut : TOUT BLOQUER.",
          malware_spawn: "Malware détecté : {description}",
          bastion_activated: "Malware atténué par le Bastion ! (-{damage}%)",
          malware_breach: "CRITIQUE : Intrusion malware ! (-{damage}%) par {description}",
          packet_dropped: "Bloqué : {description}",
          packet_allowed: "Autorisé : {description}",
          dpi_block: "Malware bloqué par le DPI : {description}",
          system_repaired: "Intégrité du système restaurée.",
          heavy_bastion_deployed: "BASTION LOURD déployé. Les dégâts au cœur sont réduits de 50 %.",
          pattern_db_updated: "Base d'analyse des modèles synchronisée. Blocage des signatures malveillantes connues.",
          dpi_module_deployed: "Module d'inspection approfondie des paquets (DPI) activé.",
          bandwidth_upgraded: "Bande passante améliorée. Niveau de trafic : {trafficLevel}",
        }
    },
};

const TUTORIAL_TEXT = {
  en: {
    intro: {
      title: "Core Mechanics + ACL",
      subtitle: "Introduction",
      text: "Data packets arrive from everywhere and move toward the CORE at the center of the screen..."
    },

    firewall: {
      title: "Core Mechanics + ACL",
      subtitle: "Firewall",
      text: "Halfway through, packets cross the dotted FIREWALL line. This is the moment the system decides their fate."
    },

    default_policy: {
      title: "Core Mechanics + ACL",
      subtitle: "Default Policy",
      text: "By default, the policy is DROP ALL: every packet is destroyed at the boundary. Safe, but no income is generated."
    },

    acl: {
      title: "Core Mechanics + ACL",
      subtitle: "ACL Rules",
      text: "Your main tool is the ACL panel. Create ALLOW rules to filter traffic based on packet properties."
    },

    malware: {
      title: "Core Mechanics + ACL",
      subtitle: "Malware",
      text: "<b>The Trap</b><br>About 15% of packets are disguised malware. If a rule is too permissive, malware may reach the CORE and damage the system."
    },

    status: {
      title: "System Status",
      subtitle: "Dashboard",
      text: "This panel shows the real-time health and performance of your system."
    },

    integrity: {
      title: "System Status",
      subtitle: "Integrity",
      text: "System integrity starts at 100%. Each malware that reaches the CORE reduces it. At 0%, the system is compromised."
    },

    revenue: {
      title: "System Status",
      subtitle: "Revenue",
      text: "Each safe packet reaching the CORE generates income. This money is used for upgrades."
    },

    uptime: {
      title: "System Status",
      subtitle: "Uptime",
      text: "Time elapsed since startup. This is your survival score."
    },

    traffic: {
      title: "System Status",
      subtitle: "Traffic Load",
      text: "Shows the current intensity of incoming packets."
    },

    logs: {
      title: "Traffic Analysis",
      subtitle: "Log System",
      text: "You must observe traffic through the log and adapt your rules over time."
    },

    loop: {
      title: "Traffic Analysis",
      subtitle: "Workflow",
      text: "<b>Recommended loop:</b><br>Observe dropped packets → identify patterns → create ALLOW rules → refine."
    },

    allow: {
      title: "Traffic Analysis",
      subtitle: "Filtering",
      text: "Identify patterns in traffic (e.g. many square packets) and allow only what you want."
    },

    alert: {
      title: "Traffic Analysis",
      subtitle: "Alerts",
      text: "Critical alerts appear when malware breaches your rules. The log will show exactly what passed."
    },

    adjust: {
      title: "Traffic Analysis",
      subtitle: "Rule Adjustment",
      text: "If a malware type leaks through, create a more specific DROP rule targeting that exact pattern."
    }
  },

  fr: {
    intro: {
      title: "Mécanique de base + ACL",
      subtitle: "Introduction",
      text: "Des paquets de données arrivent de partout et se dirigent vers le CORE au centre de l'écran..."
    },

    firewall: {
      title: "Mécanique de base + ACL",
      subtitle: "Firewall",
      text: "À mi-chemin, les paquets traversent la ligne pointillée FIREWALL. C'est là que le système décide leur sort."
    },

    default_policy: {
      title: "Mécanique de base + ACL",
      subtitle: "Politique par défaut",
      text: "Par défaut, la politique est DROP ALL : tous les paquets sont détruits à la frontière. Sécurisé mais aucun revenu."
    },

    acl: {
      title: "Mécanique de base + ACL",
      subtitle: "Règles ACL",
      text: "Votre outil principal est le panneau ACL. Créez des règles ALLOW pour filtrer les paquets selon leurs propriétés."
    },

    malware: {
      title: "Mécanique de base + ACL",
      subtitle: "Malwares",
      text: "<b>Le piège</b><br>Environ 15% des paquets sont des malwares déguisés. Une règle trop permissive peut laisser passer une attaque jusqu'au CORE."
    },

    status: {
      title: "État du système",
      subtitle: "Tableau de bord",
      text: "Ce panneau affiche la santé et la performance du système en temps réel."
    },

    integrity: {
      title: "État du système",
      subtitle: "Intégrité",
      text: "L'intégrité commence à 100%. Chaque malware qui atteint le CORE la réduit. À 0%, le système est compromis."
    },

    revenue: {
      title: "État du système",
      subtitle: "Revenus",
      text: "Chaque paquet sain qui atteint le CORE génère de l'argent utilisé pour les améliorations."
    },

    uptime: {
      title: "État du système",
      subtitle: "Uptime",
      text: "Temps écoulé depuis le démarrage. C'est votre score de survie."
    },

    traffic: {
      title: "État du système",
      subtitle: "Charge réseau",
      text: "Indique l'intensité actuelle des paquets entrants."
    },

    logs: {
      title: "Analyse du trafic",
      subtitle: "Journal",
      text: "Vous devez observer les logs et adapter vos règles en conséquence."
    },

    loop: {
      title: "Analyse du trafic",
      subtitle: "Boucle de travail",
      text: "<b>Boucle recommandée :</b><br>Observer les paquets rejetés → identifier des motifs → créer des règles ALLOW → ajuster."
    },

    allow: {
      title: "Analyse du trafic",
      subtitle: "Filtrage",
      text: "Identifiez les motifs (ex: carrés) et autorisez uniquement ce qui est nécessaire."
    },

    alert: {
      title: "Analyse du trafic",
      subtitle: "Alertes",
      text: "Les alertes critiques apparaissent lorsqu'un malware passe. Le log indique exactement quoi a traversé."
    },

    adjust: {
      title: "Analyse du trafic",
      subtitle: "Ajustement",
      text: "Si un malware passe, ajoutez une règle DROP plus spécifique ciblant ce pattern exact."
    }
  }
};

let currentLanguage = "en";

function t(key, params = {}) {
    let text = key.split(".").reduce(
        (obj, part) => obj?.[part],
        LANG[currentLanguage]
    );

    if (!text) return key;

    for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, value);
    }

    return text;
}

function setLanguage(lang) {
    currentLanguage = lang;
    applyLocalization();
}

function applyLocalization() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        el.innerHTML = t(key);
    });

    updateTutorial()
}