/* ============================================
   ECE Hub JNTUH — Main JavaScript
   Theme Toggle, Scroll Animations, Search,
   Accordion, Mobile Menu, Back-to-Top
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initScrollReveal();
  initNavbar();
  initMobileMenu();
  initAccordion();
  initBackToTop();
  initSearch();
  initFilterTabs();
  initBranchTabs();
  initSoftwareDetails();
});

/* ---- Theme Toggle ---- */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const savedTheme = localStorage.getItem('ece-hub-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(toggle, savedTheme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ece-hub-theme', next);
    updateThemeIcon(toggle, next);
  });
}

function updateThemeIcon(btn, theme) {
  btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
}

/* ---- Navbar Scroll Effect ---- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const updateNavbar = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // Active nav link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ---- Scroll Reveal Animations ---- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ---- Accordion ---- */
function initAccordion() {
  const items = document.querySelectorAll('.accordion-item');

  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');
    if (!header || !body) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      items.forEach(i => {
        i.classList.remove('active');
        const b = i.querySelector('.accordion-body');
        if (b) b.style.maxHeight = null;
      });

      // Open clicked (if it was closed)
      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* ---- Back to Top ---- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---- Search / Filter ---- */
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase().trim();
    const cards = document.querySelectorAll('[data-searchable]');

    cards.forEach(card => {
      const text = card.getAttribute('data-searchable').toLowerCase();
      const match = !query || text.includes(query);
      card.style.display = match ? '' : 'none';

      // Animate back in
      if (match) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      }
    });

    // Show "no results" message
    const container = document.querySelector('[data-search-container]');
    if (container) {
      let noResults = container.querySelector('.no-results');
      const visibleCards = container.querySelectorAll('[data-searchable]:not([style*="display: none"])');
      
      if (visibleCards.length === 0 && query) {
        if (!noResults) {
          noResults = document.createElement('div');
          noResults.className = 'no-results';
          noResults.style.cssText = 'text-align:center;padding:3rem;color:var(--text-secondary);font-size:1.1rem;grid-column:1/-1;';
          noResults.innerHTML = `<p>😕 No results found for "<strong>${escapeHtml(query)}</strong>"</p><p style="margin-top:0.5rem;font-size:0.9rem;">Try different keywords</p>`;
          container.appendChild(noResults);
        }
      } else if (noResults) {
        noResults.remove();
      }
    }
  }, 200));
}

/* ---- Filter Tabs ---- */
function initFilterTabs() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-filter');
      const container = btn.closest('section') || document;

      // Update active state
      btn.closest('.filter-bar').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      const cards = container.querySelectorAll('[data-category]');
      cards.forEach(card => {
        const match = category === 'all' || card.getAttribute('data-category') === category;
        card.style.display = match ? '' : 'none';

        if (match) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          requestAnimationFrame(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        }
      });
    });
  });
}

/* ---- Utility Functions ---- */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---- Custom Notification Modal ---- */
function showNotificationModal(title, msg) {
  let overlay = document.getElementById('customNotificationModal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'customNotificationModal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <span class="modal-icon">⚠️</span>
        <h3>${title}</h3>
        <p>${msg}</p>
        <button class="btn btn-secondary btn-sm" onclick="closeNotificationModal()">Close</button>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Close on clicking overlay background
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeNotificationModal();
    });
  } else {
    overlay.querySelector('h3').innerText = title;
    overlay.querySelector('p').innerText = msg;
  }
  
  document.body.style.overflow = 'hidden'; // Lock scrolling
  overlay.classList.add('active');
}

function closeNotificationModal() {
  const overlay = document.getElementById('customNotificationModal');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scrolling
  }
}

/* ---- Drive Folder Access Handler ---- */
function handleDriveAccess(branch, semester, url) {
  if (branch === 'ece') {
    if (semester === 1 || semester === 2 || semester === 3) {
      window.open(url, '_blank');
    } else {
      showNotificationModal(
        `Semester ${semester} Folder Under Construction`,
        `We are actively compiling reference books, notes, and lab manuals for ECE Semester ${semester}. These folders will be populated shortly!`
      );
    }
  } else {
    // Other branches
    const branchNames = {
      cse: 'Computer Science (CSE)',
      eee: 'Electrical & Electronics (EEE)',
      mech: 'Mechanical Engineering (Mech)',
      civil: 'Civil Engineering (Civil)'
    };
    const name = branchNames[branch] || branch.toUpperCase();
    showNotificationModal(
      `${name} Drive Not Available Yet`,
      `The shared digital library for ${name} is currently under construction. Textbooks and lecture guides will be available here soon as we expand our systems to all branches!`
    );
  }
}

/* ---- Branch Tabs Handler (academics.html) ---- */
function initBranchTabs() {
  const container = document.querySelector('.branch-tabs-container');
  if (!container) return;

  const btns = container.querySelectorAll('.branch-tab-btn');
  const branches = document.querySelectorAll('[data-branch]');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedBranch = btn.getAttribute('data-branch-target');

      // Update active tab button style
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide corresponding branch sections
      branches.forEach(section => {
        const isMatch = section.getAttribute('data-branch') === selectedBranch;
        section.style.display = isMatch ? '' : 'none';

        if (isMatch) {
          // Animate items back in
          section.style.opacity = '0';
          section.style.transform = 'translateY(15px)';
          requestAnimationFrame(() => {
            section.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
          });
          
          // Recalculate accordion heights for active child items if any
          section.querySelectorAll('.accordion-item.active .accordion-body').forEach(body => {
            body.style.maxHeight = body.scrollHeight + 'px';
          });
        }
      });
    });
  });

  // Initialize first display (show active, hide others)
  const activeBtn = container.querySelector('.branch-tab-btn.active');
  if (activeBtn) {
    activeBtn.click();
  }
}

/* ---- Detailed Software Cards Enhancer ---- */
function initSoftwareDetails() {
  const cards = document.querySelectorAll('.software-card');
  if (!cards.length) return;

  const detailsDb = {
    "Wokwi Simulator": {
      license: "Free",
      os: "Browser, Web-based",
      subjects: "IoT, Microcontrollers, Embedded Systems",
      alternatives: "Tinkercad Circuits, Proteus VSM",
      quickStart: "Open browser, select your microcontroller board (e.g. ESP32), connect components, write code, and click the start simulation button.",
      docUrl: "https://docs.wokwi.com/",
      logoImg: "https://raw.githubusercontent.com/wokwi/wokwi-features/main/img/wokwi-logo.png",
      initials: "WK"
    },
    "Analog Devices LTspice": {
      license: "Free",
      os: "Windows, macOS",
      subjects: "Electronic Devices & Circuits, Analog Circuits, Network Analysis",
      alternatives: "Cadence PSpice, NI Multisim, falstad CircuitJS",
      quickStart: "Press F2 to place components, G for ground, F3 to wire. Press the 'Simulate' icon and add a transient command like '.tran 10m'.",
      docUrl: "https://www.analog.com/media/en/simulation-models/spice-models/LTspice_Guide.pdf",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/c/cc/LTspice_Logo.png",
      initials: "LT"
    },
    "Cadence PSpice": {
      license: "Paid / Student Trial",
      os: "Windows Only",
      subjects: "Network Analysis, Electric Circuits, Device Modelling",
      alternatives: "LTspice, ngspice, Qucs-S",
      quickStart: "Draw circuit in schematic capture, add stimulus sources, create transient/frequency sweep profile, run solver, and probe wires for plots.",
      docUrl: "https://www.cadence.com/content/dam/cadence-www/global/en_US/documents/tools/pcb-design-analysis/pspice-datasheet.pdf",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/f/fe/PSpice_Icon.png",
      initials: "PS"
    },
    "NI Multisim": {
      license: "Paid / Student Edition",
      os: "Windows, Browser",
      subjects: "Analog Circuits, Digital Circuits, Lab Simulations",
      alternatives: "falstad CircuitJS, LTspice, Proteus",
      quickStart: "Drag devices from the components list, wire nodes, drop virtual multimeter/oscilloscope probes on testpoints, and toggle power switch.",
      docUrl: "https://www.ni.com/pdf/manuals/374483d.pdf",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/3/3f/NI_logo.svg",
      initials: "MS"
    },
    "Falstad CircuitJS": {
      license: "Free",
      os: "Browser, Offline Desktop",
      subjects: "Basic Electronics, EDC, Network Theorems",
      alternatives: "EveryCircuit, Multisim Live",
      quickStart: "Select components, draw connections, view live animated voltage colors (green/gray) and current flows (speed of dots).",
      docUrl: "https://www.falstad.com/circuit/directions.html",
      logoImg: "https://www.falstad.com/favicon.ico",
      initials: "FC"
    },
    "Qucs-S": {
      license: "Free",
      os: "Windows, Linux, macOS",
      subjects: "RF Circuits, Microwave Engineering, Network Synthesis",
      alternatives: "LTspice, ngspice, Qucs",
      quickStart: "Place components, click 'Simulations' tab to choose analysis type (DC/AC), run simulation, drag graph containers to show inputs.",
      docUrl: "https://qucs-s.github.io/docs/qucs-s.pdf",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/2/22/Qucs_logo.svg",
      initials: "QS"
    },
    "ngspice": {
      license: "Free",
      os: "Windows, Linux, macOS",
      subjects: "Circuit Layout, ASIC Netlisting, Advanced Simulation",
      alternatives: "LTspice, SPICE3f5",
      quickStart: "Write or generate a SPICE netlist text file, open command prompt, run 'ngspice circuit.sp', write 'run' and 'plot v(node_name)'.",
      docUrl: "https://ngspice.sourceforge.io/docs/ngspice-manual.pdf",
      logoImg: "https://ngspice.sourceforge.io/images/logo.png",
      initials: "NG"
    },
    "KiCad PCB Suite": {
      license: "Free",
      os: "Windows, macOS, Linux",
      subjects: "PCB Design, Mini Projects, Lab Hardware Design",
      alternatives: "Altium Designer, Autodesk EAGLE, EasyEDA",
      quickStart: "Open KiCad project, draw schematic in Eeschema, allocate footprints, import design in PCBnew, route connections, export Gerber files.",
      docUrl: "https://docs.kicad.org/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/e/e9/KiCad_Logo.svg",
      initials: "KC"
    },
    "Altium Designer": {
      license: "Paid / Student License",
      os: "Windows Only",
      subjects: "Professional PCB Layout, Embedded Hardware",
      alternatives: "KiCad, Autodesk EAGLE",
      quickStart: "Design schematic sheets, synchronise with PCB layout canvas, define layer stack, auto-route or hand-route traces, and run 3D view check.",
      docUrl: "https://www.altium.com/documentation",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Altium_Logo.svg",
      initials: "AD"
    },
    "Autodesk Eagle": {
      license: "Free Student tier",
      os: "Windows, macOS, Linux",
      subjects: "PCB Design, Hardware Prototyping",
      alternatives: "KiCad, EasyEDA",
      quickStart: "Draw logic schematics, click 'Generate Board' to layout components, route tracks, use DRC tool to check design width clearances.",
      docUrl: "https://www.autodesk.com/products/eagle/overview",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Autodesk_Eagle_logo.svg",
      initials: "EG"
    },
    "Labcenter Proteus": {
      license: "Paid / University Demo",
      os: "Windows Only",
      subjects: "Microcontrollers, Embedded C, EDC Labs",
      alternatives: "Multisim, Tinkercad Circuits",
      quickStart: "Draw schematic with processor (e.g. 8051), double-click chip to load compiler hex file, click run button to execute interactive simulation.",
      docUrl: "https://www.labcenter.com/tutorials/",
      logoImg: "https://www.labcenter.com/images/logo.png",
      initials: "PR"
    },
    "EasyEDA": {
      license: "Free",
      os: "Web Browser, Windows, Linux",
      subjects: "Rapid PCB Prototyping, Schematics",
      alternatives: "KiCad, Tinkercad",
      quickStart: "Search LCSC system catalog for parts, draw schematics online, auto-route board traces, order custom printed board from JLCPCB directly.",
      docUrl: "https://docs.easyeda.com/",
      logoImg: "https://easyeda.com/assets/static/images/logo.svg",
      initials: "EE"
    },
    "FlatCAM": {
      license: "Free",
      os: "Windows, Linux, macOS",
      subjects: "CNC PCB Milling, Hardware Labs",
      alternatives: "CopperCAM",
      quickStart: "Load Gerber layout files, configure isolation milling tool dimensions, generate CNC G-code path, save file to drive CNC mill.",
      docUrl: "http://flatcam.org/manual/",
      logoImg: "http://flatcam.org/_static/flatcam_icon.png",
      initials: "FC"
    },
    "Cadence Virtuoso": {
      license: "Institutional License",
      os: "Linux / RedHat",
      subjects: "CMOS VLSI Design, IC Layout, Analog IC design",
      alternatives: "Magic VLSI, KLayout",
      quickStart: "Create library, draw transistor-level schematics, run Spectre simulation, draw custom physical layout cells, execute DRC and LVS checks.",
      docUrl: "https://www.cadence.com/en_US/home/tools/custom-ic-analog-rf-design/layout-design/virtuoso-layout-suite.html",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Cadence_Design_Systems_logo.svg",
      initials: "CV"
    },
    "Synopsys Design Compiler": {
      license: "Institutional License",
      os: "Linux",
      subjects: "CMOS VLSI Design, ASIC Synthesis",
      alternatives: "Yosys Open Synthesis",
      quickStart: "Define target cell library, read Verilog design files, run 'compile' shell commands, optimize timing constraints, export gate-level netlist.",
      docUrl: "https://www.synopsys.com/implementation-and-signoff/rtl-synthesis-test/design-compiler-graphical.html",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/8/87/Synopsys_logo.svg",
      initials: "SD"
    },
    "Siemens Calibre": {
      license: "Institutional License",
      os: "Linux",
      subjects: "VLSI Verification, IC Physical Checks",
      alternatives: "OpenVerify, Magic VLSI",
      quickStart: "Import IC layout GDSII files, run rule decks for Design Rule Check (DRC) and Layout vs Schematic (LVS) prior to tape-out.",
      docUrl: "https://eda.sw.siemens.com/en-US/ic/calibre-design/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Siemens_AG_logo.svg",
      initials: "SC"
    },
    "AMD Xilinx Vivado": {
      license: "Free WebPack Edition",
      os: "Windows, Linux",
      subjects: "VLSI Design, FPGA Lab, Verilog coding",
      alternatives: "Intel Quartus Prime, ModelSim",
      quickStart: "Add Verilog/VHDL source files, run behavior simulation, select FPGA target pin configurations, run synthesis and implementation, write bitstream.",
      docUrl: "https://docs.amd.com/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/0/07/Xilinx_Logo.svg",
      initials: "XV"
    },
    "Xilinx ISE Design Suite": {
      license: "Free Classic tier",
      os: "Windows, Linux",
      subjects: "Digital System Design, Legacy FPGA boards",
      alternatives: "AMD Vivado",
      quickStart: "Create legacy project, compile Verilog models, configure pin mappings, synthesis netlist, flash target CPLD boards.",
      docUrl: "https://www.xilinx.com/products/design-tools/ise-design-suite.html",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/0/07/Xilinx_Logo.svg",
      initials: "XI"
    },
    "Intel Quartus Prime Lite": {
      license: "Free Lite Edition",
      os: "Windows, Linux",
      subjects: "VLSI Lab, Digital Design, FPGA Boards",
      alternatives: "AMD Xilinx Vivado",
      quickStart: "Write VHDL/Verilog code, assign hardware pins via Pin Planner, run compilation flow, connect USB-Blaster, and program target boards.",
      docUrl: "https://fpgasoftware.intel.com/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg",
      initials: "QP"
    },
    "Siemens ModelSim": {
      license: "Free Starter Edition",
      os: "Windows, Linux",
      subjects: "VLSI Lab, Digital Logic Design",
      alternatives: "QuestaSim, Icarus Verilog, GTKWave",
      quickStart: "Create work library, compile VHDL/Verilog files, load simulation design in work environment, configure waveform viewer, run simulation time.",
      docUrl: "https://eda.sw.siemens.com/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Siemens_AG_logo.svg",
      initials: "MS"
    },
    "Logisim Evolution": {
      license: "Free",
      os: "Windows, macOS, Linux (Java)",
      subjects: "Digital Logic Design, Computer Architecture",
      alternatives: "Digital Simulator, Logisim",
      quickStart: "Choose logic gates from the toolbar, wire them together, use the hand tool to toggle input pins, and observe output logic changes.",
      docUrl: "https://github.com/logisim-evolution/logisim-evolution/blob/master/README.md",
      logoImg: "https://raw.githubusercontent.com/logisim-evolution/logisim-evolution/master/src/resources/logisim/img/logisim-evolution.svg",
      initials: "LE"
    },
    "OpenLane / OpenROAD": {
      license: "Free",
      os: "Linux, Docker containers",
      subjects: "Open-source VLSI synthesis, ASIC Tape-out",
      alternatives: "Synopsys Design Compiler, Cadence Innovus",
      quickStart: "Configure design path parameters inside config.tcl, run OpenLane Docker image, execute flow commands: './flow.tcl -design my_chip'.",
      docUrl: "https://openlane.readthedocs.io/",
      logoImg: "https://raw.githubusercontent.com/The-OpenROAD-Project/OpenLane/master/docs/source/_static/OpenLane_Logo.png",
      initials: "OL"
    },
    "Magic VLSI Layout": {
      license: "Free",
      os: "Linux, macOS",
      subjects: "IC Layout, Microelectronics Design",
      alternatives: "KLayout, Cadence Virtuoso",
      quickStart: "Draw layouts using command prompts (e.g., paint metal1), click layers to examine connectivity, view real-time DRC highlights.",
      docUrl: "http://opencircuitdesign.com/magic/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/c/cc/LTspice_Logo.png",
      initials: "MG"
    },
    "Electric VLSI System": {
      license: "Free",
      os: "Java-supported (Cross-platform)",
      subjects: "ASIC Schematic Design, Physical IC Layout",
      alternatives: "Magic VLSI, Cadence Virtuoso",
      quickStart: "Create custom node cells, connect components using node arcs, build schematics and physical layout structures, run electrical rules checking.",
      docUrl: "https://www.gnu.org/software/electric/electric.html",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg",
      initials: "EL"
    },
    "Keil µVision": {
      license: "Free Community tier",
      os: "Windows Only",
      subjects: "Microcontrollers, Assembly Language, Embedded Systems",
      alternatives: "STM32CubeIDE, VS Code, PlatformIO",
      quickStart: "Create project, pick ARM Core MCU, write assembly/C code, build code target, click Debug icon to step through memory registers.",
      docUrl: "https://www.keil.com/support/man/docs/uv4/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/b/bc/ARM_logo.svg",
      initials: "KL"
    },
    "STM32CubeIDE": {
      license: "Free",
      os: "Windows, macOS, Linux",
      subjects: "Microcontrollers, Advanced Embedded Systems",
      alternatives: "Keil MDK, PlatformIO",
      quickStart: "Use STM32CubeMX graphical interface to configure MCU peripheral pins, generate C startup templates, write main logic code, compile & debug.",
      docUrl: "https://www.st.com/resource/en/user_manual/um2609-stm32cubeide-user-guide-stmicroelectronics.pdf",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/2/2e/STMicroelectronics_logo.svg",
      initials: "ST"
    },
    "Microchip MPLAB X IDE": {
      license: "Free",
      os: "Windows, macOS, Linux",
      subjects: "Microcontrollers, Embedded C",
      alternatives: "Arduino IDE, Keil MDK",
      quickStart: "Create compiler project for target PIC chip, write code, compile hex using XC8/XC16, connect PICkit programmer to flash boards.",
      docUrl: "https://microchipdeveloper.com/mplabx:start",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/0/05/Microchip_Technology_logo.svg",
      initials: "MX"
    },
    "TI Energia IDE": {
      license: "Free",
      os: "Windows, macOS, Linux",
      subjects: "Microcontrollers, Embedded Systems",
      alternatives: "Arduino IDE, Code Composer Studio",
      quickStart: "Write standard wiring sketches, choose Texas Instruments LaunchPad target board (e.g., MSP430), select port, and click Upload.",
      docUrl: "http://energia.nu/guide/",
      logoImg: "http://energia.nu/wp-content/themes/energia/images/logo.png",
      initials: "EN"
    },
    "PlatformIO": {
      license: "Free",
      os: "Windows, macOS, Linux (VS Code extension)",
      subjects: "Microcontrollers, IoT prototyping, Embedded Development",
      alternatives: "Arduino IDE, STM32CubeIDE",
      quickStart: "Open VS Code, load PlatformIO home page, select board framework (e.g., Arduino), download libraries from library manager, compile and upload.",
      docUrl: "https://docs.platformio.org/",
      logoImg: "https://raw.githubusercontent.com/platformio/platformio-artwork/master/platformio-logo.png",
      initials: "PI"
    },
    "Arduino IDE": {
      license: "Free",
      os: "Windows, macOS, Linux, Web",
      subjects: "Microcontrollers, IoT basics, Maker Projects",
      alternatives: "PlatformIO, Wokwi Simulator",
      quickStart: "Connect Arduino board, select board port from drop-down, write C/C++ setup & loop routines, click Upload button.",
      docUrl: "https://docs.arduino.cc/software/ide-v2",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/8/87/Arduino_Logo.svg",
      initials: "AR"
    },
    "MathWorks MATLAB": {
      license: "Campus / Student license",
      os: "Windows, macOS, Linux, Web",
      subjects: "Signals & Systems, DSP, Control Systems, Math",
      alternatives: "GNU Octave, Scilab, Python SciPy",
      quickStart: "Write scripts in Command window, use standard functions: `t = 0:0.1:10; y = sin(t); plot(t,y)` to plot vectors.",
      docUrl: "https://www.mathworks.com/help/matlab/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/2/21/Matlab_Logo.png",
      initials: "ML"
    },
    "MathWorks Simulink": {
      license: "Campus / Student license",
      os: "Windows, macOS, Linux",
      subjects: "Control Engineering, Communication Systems",
      alternatives: "Scilab Xcos, OpenModelica",
      quickStart: "Type 'simulink' in MATLAB command line, select canvas template, drag functional mathematical blocks, connect nodes, run analysis.",
      docUrl: "https://www.mathworks.com/help/simulink/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/2/23/Simulink_Logo.png",
      initials: "SL"
    },
    "GNU Octave": {
      license: "Free",
      os: "Windows, macOS, Linux",
      subjects: "Signals & Systems, DSP, Numerical Computations",
      alternatives: "MathWorks MATLAB, Scilab",
      quickStart: "Write and execute .m command scripts, load signal packs using `pkg load signal` in command interface.",
      docUrl: "https://octave.org/doc/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Gnu-octave-logo.svg",
      initials: "OC"
    },
    "Scilab + Xcos": {
      license: "Free",
      os: "Windows, macOS, Linux",
      subjects: "Control Systems, DSP, Mathematical Modeling",
      alternatives: "MATLAB, Simulink",
      quickStart: "Write calculations in Console, type `xcos` to open structural block editor, build signal graphs, press run to simulate modeling equations.",
      docUrl: "https://www.scilab.org/resources/documentation",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Scilab_Logo.svg",
      initials: "SL"
    },
    "Code Composer Studio (CCS)": {
      license: "Free",
      os: "Windows, Linux, macOS",
      subjects: "DSP Processors, Microcontrollers",
      alternatives: "MATLAB, Keil MDK",
      quickStart: "Configure TI DSP target, write real-time loops in C, compile executable target, hook up emulator board, monitor variables on graph.",
      docUrl: "https://software-dl.ti.com/ccs/esd/documents/users_guide/index.html",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Texas_Instruments_logo.svg",
      initials: "CC"
    },
    "GNU Radio Toolkit": {
      license: "Free",
      os: "Linux, macOS, Windows",
      subjects: "Communication Systems, DSP, SDR Labs",
      alternatives: "MATLAB Communications Toolbox",
      quickStart: "Open GNU Radio Companion, drag signal source and sink blocks (e.g., Audio Sink), wire blocks on screen, click play to run flowgraph.",
      docUrl: "https://www.gnuradio.org/doc/doxygen/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Gnu_radio_logo.svg",
      initials: "GR"
    },
    "Visual Studio Code": {
      license: "Free",
      os: "Windows, macOS, Linux",
      subjects: "C Programming, Python, Verilog Coding",
      alternatives: "Cursor, Sublime Text, Dev-C++",
      quickStart: "Open directory, install languages plugins (e.g. Python, C++), configure tasks/launch files, write code, run code from terminal console.",
      docUrl: "https://code.visualstudio.com/docs",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg",
      initials: "VC"
    },
    "Git SCM System": {
      license: "Free",
      os: "Windows, macOS, Linux",
      subjects: "Software Version Control, Collaboration",
      alternatives: "Subversion, Mercurial",
      quickStart: "Run terminal command: `git init` to start repository, `git add .` to index code changes, and `git commit -m 'initial'` to save snapshot.",
      docUrl: "https://git-scm.com/doc",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Git-logo.svg",
      initials: "GT"
    },
    "GitHub Desktop": {
      license: "Free",
      os: "Windows, macOS",
      subjects: "Git GUI repositories, Collaboration",
      alternatives: "Sourcetree, Gitkraken",
      quickStart: "Clone online Git repositories, view code differences side-by-side, write commit summaries, press Push to upload modifications.",
      docUrl: "https://docs.github.com/en/desktop",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
      initials: "GD"
    },
    "Python 3.x": {
      license: "Free",
      os: "Windows, macOS, Linux",
      subjects: "Python Programming Lab, Signal Processing, AI/ML",
      alternatives: "MATLAB, R Language",
      quickStart: "Download and run Python installer (ensure 'Add Python to Path' is checked), open terminal command, run `python` shell.",
      docUrl: "https://docs.python.org/3/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
      initials: "PY"
    },
    "Anaconda Distribution": {
      license: "Free",
      os: "Windows, macOS, Linux",
      subjects: "Data Science, Python Libraries, Machine Learning",
      alternatives: "Pip, Miniconda",
      quickStart: "Install distribution, open Anaconda Navigator, create virtual coding environment, launch Spyder or Jupyter Notebook directly.",
      docUrl: "https://docs.anaconda.com/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Anaconda_Logo.svg",
      initials: "AN"
    },
    "JupyterLab": {
      license: "Free",
      os: "Windows, macOS, Linux (Web-based)",
      subjects: "Python Labs, Signal Visualization, Data Analysis",
      alternatives: "Google Colab, Jupyter Notebook",
      quickStart: "Run `jupyter lab` command in console, select new Python notebook, write python code in cells, press Shift+Enter to execute cells and display plots.",
      docUrl: "https://jupyterlab.readthedocs.io/en/stable/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/3/38/Jupyter_logo.svg",
      initials: "JL"
    },
    "Docker Desktop": {
      license: "Free Tier",
      os: "Windows, macOS, Linux",
      subjects: "Software environments, VLSI flow setups",
      alternatives: "Podman, VirtualBox",
      quickStart: "Install Docker, open terminal command, download environments: `docker pull ubuntu`, run containers: `docker run -it ubuntu`.",
      docUrl: "https://docs.docker.com/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg",
      initials: "DK"
    },
    "Dassault SolidWorks": {
      license: "Paid / Student License",
      os: "Windows Only",
      subjects: "Mechanical CAD, 3D Modelling",
      alternatives: "FreeCAD, Fusion 360",
      quickStart: "Sketch 2D profile outlines, extrude profiles to build 3D models, combine models in assembly, run structural simulations.",
      docUrl: "https://www.solidworks.com/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/1/15/SolidWorks_Logo.svg",
      initials: "SW"
    },
    "Autodesk Fusion 360": {
      license: "Free Student access",
      os: "Windows, macOS",
      subjects: "Mechanical CAD/CAM, Rapid Prototyping",
      alternatives: "SolidWorks, FreeCAD",
      quickStart: "Create sketch drawings, extrude to solid blocks, design joints, configure manufacturing toolpaths, export G-code to 3D printer.",
      docUrl: "https://help.autodesk.com/view/fusion360/ENU/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Autodesk_Fusion_360_logo.svg",
      initials: "F3"
    },
    "Dassault CATIA": {
      license: "Institutional License",
      os: "Windows, Linux",
      subjects: "Advanced Product CAD, Aerospace engineering",
      alternatives: "SolidWorks, Siemens NX",
      quickStart: "Define component architecture, design complex surface contours, assembly components, check mechanical interference levels.",
      docUrl: "https://www.3ds.com/products-services/catia/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/5/5e/CATIA_Logo.svg",
      initials: "CA"
    },
    "ANSYS Mechanical": {
      license: "Free Student Edition",
      os: "Windows Only",
      subjects: "Structural Analysis, Finite Element Analysis (FEA)",
      alternatives: "FreeCAD FEM, OpenFOAM",
      quickStart: "Import 3D CAD design geometries, assign material properties, define boundary loads and supports, run FEA solver to see stress heatmaps.",
      docUrl: "https://www.ansys.com/academic/students/ansys-structures-student",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/1/18/Ansys_logo.svg",
      initials: "AN"
    },
    "AutoCAD Civil 3D": {
      license: "Free Student access",
      os: "Windows Only",
      subjects: "Civil CAD, Mapping, Surveys",
      alternatives: "QGIS, FreeCAD",
      quickStart: "Import survey point coordinates, create elevation surface contours, design roadway alignments, compute earthwork cut/fill quantities.",
      docUrl: "https://help.autodesk.com/view/CIV3D/2024/ENU/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/d/df/Autocad_2017_logo.svg",
      initials: "AC"
    },
    "CSI ETABS": {
      license: "Institutional License",
      os: "Windows Only",
      subjects: "Structural analysis, Concrete building designs",
      alternatives: "STAAD.Pro, Robot Structural Analysis",
      quickStart: "Draw columns, beams, and slabs layout, define dead and wind loads, run analysis, check structural steel reinforcement ratios.",
      docUrl: "https://www.csiamerica.com/products/etabs",
      logoImg: "https://www.csiamerica.com/templates/csiamerica/images/logo.png",
      initials: "ET"
    },
    "Bentley STAAD.Pro": {
      license: "Paid / Student Trial",
      os: "Windows Only",
      subjects: "Structural engineering, Steel frame design",
      alternatives: "CSI ETABS",
      quickStart: "Create 3D node wireframes, select steel section properties, specify load cases (dead, live, seismic), solve and verify pass/fail criteria.",
      docUrl: "https://docs.bentley.com/",
      logoImg: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Bentley_Systems-Logo.svg",
      initials: "ST"
    },
    "ETAP Power Suite": {
      license: "Institutional License",
      os: "Windows Only",
      subjects: "Electrical Power Systems, Grid Analysis",
      alternatives: "PowerWorld, MATPOWER",
      quickStart: "Draw one-line power system diagram, input generator and load ratings, run Load Flow study, inspect bus voltage levels.",
      docUrl: "https://etap.com/demo",
      logoImg: "https://etap.com/images/default-source/etap-logos/etap-logo-large.png",
      initials: "EP"
    }
  };

  cards.forEach(card => {
    const titleEl = card.querySelector('.software-title');
    if (!titleEl) return;
    const title = titleEl.textContent.trim();
    const details = detailsDb[title];
    if (!details) return;

    // 1. Structure the top section
    const topContainer = document.createElement('div');
    topContainer.className = 'software-card-top';

    const iconEl = card.querySelector('.software-icon');
    const metaContainer = document.createElement('div');
    metaContainer.className = 'software-meta';

    // Move title and tags/badge inside metaContainer
    titleEl.parentNode.insertBefore(topContainer, titleEl);
    
    // License Badge
    const licenseBadge = document.createElement('span');
    const licenseText = details.license.toLowerCase();
    licenseBadge.className = 'software-license-badge ' + 
      (licenseText.includes('free') ? 'license-free' : 
       licenseText.includes('student') ? 'license-student' : 'license-paid');
    licenseBadge.textContent = details.license;

    metaContainer.appendChild(titleEl);
    metaContainer.appendChild(licenseBadge);

    if (iconEl) {
      const originalEmoji = iconEl.innerText.trim();
      if (details.logoImg) {
        iconEl.innerHTML = `<img src="${details.logoImg}" alt="${title}" onerror="this.style.display='none'; this.parentNode.innerText='${originalEmoji}'; this.parentNode.style.background=''; this.parentNode.style.boxShadow='';">`;
        iconEl.style.background = '#ffffff';
        iconEl.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
      } else {
        iconEl.innerText = originalEmoji;
      }
      topContainer.appendChild(iconEl);
    }
    topContainer.appendChild(metaContainer);

    // 2. Remove old tags (we will show them in details dropdown)
    const oldTags = card.querySelector('.software-tags');
    if (oldTags) oldTags.remove();

    // 3. Inject details dropdown
    const detailsDropdown = document.createElement('div');
    detailsDropdown.className = 'software-details-dropdown';
    detailsDropdown.innerHTML = `
      <div class="details-grid">
        <div><strong>💻 OS:</strong> ${details.os}</div>
        <div><strong>📚 Subjects:</strong> ${details.subjects}</div>
        <div><strong>🔄 Alternatives:</strong> ${details.alternatives}</div>
        <div><strong>🚀 Quick Start:</strong> <em>${details.quickStart}</em></div>
      </div>
    `;

    // Insert details dropdown before the button
    const downloadBtn = card.querySelector('.btn-download');
    if (downloadBtn) {
      card.insertBefore(detailsDropdown, downloadBtn);
      
      // 4. Transform single download button into dual action buttons
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'software-actions';

      // Update download button
      downloadBtn.className = 'btn btn-download btn-sm';
      downloadBtn.textContent = '🚀 Get Software';

      // Create Documentation button
      const docBtn = document.createElement('a');
      docBtn.href = details.docUrl;
      docBtn.target = '_blank';
      docBtn.rel = 'noopener noreferrer';
      docBtn.className = 'btn btn-secondary btn-sm';
      docBtn.textContent = '📖 Documentation';

      // Assemble actions
      downloadBtn.parentNode.insertBefore(actionsContainer, downloadBtn);
      actionsContainer.appendChild(downloadBtn);
      actionsContainer.appendChild(docBtn);
    }
  });
}
