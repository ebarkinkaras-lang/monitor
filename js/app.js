// ============================================================
// TürkiyeMonitor — Application Coordinator (v1.5)
// Boot sequence, neofetch header, clock, module init
// ============================================================

const App = (() => {
  // ── ASCII Turkey Logo for Neofetch Header ────────────────
  const TURKEY_ASCII = [
    '         _.--""--._       ',
    '      .-\'    __    \'-.    ',
    '    .\'   .-""  ""-. TR\'.  ',
    '   /   .\'  .-""-.  \'.  \\ ',
    '  ;   /   /  ★   \\  \\   ;',
    '  |  ;   ;  ANKARA ;  ;  |',
    '  |  |   |   ·    |  |  |',
    '  ;   \\   \\      /  /   ;',
    '   \\    `.  `-..-\'  .\'  / ',
    '    `.    `-.__.-\'  .\'   ',
    '      `-.________.-\'     ',
  ].join('\n');

  // ── Boot Sequence ────────────────────────────────────────
  const BOOT_ASCII = [
    '████████╗██╗   ██╗██████╗ ██╗  ██╗██╗██╗   ██╗███████╗',
    '╚══██╔══╝██║   ██║██╔══██╗██║ ██╔╝██║╚██╗ ██╔╝██╔════╝',
    '   ██║   ██║   ██║██████╔╝█████╔╝ ██║ ╚████╔╝ █████╗  ',
    '   ██║   ██║   ██║██╔══██╗██╔═██╗ ██║  ╚██╔╝  ██╔══╝  ',
    '   ██║   ╚██████╔╝██║  ██║██║  ██╗██║   ██║   ███████╗',
    '   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝',
    '',
    '   ███╗   ███╗ ██████╗ ███╗   ██╗██╗████████╗ ██████╗ ██████╗ ',
    '   ████╗ ████║██╔═══██╗████╗  ██║██║╚══██╔══╝██╔═══██╗██╔══██╗',
    '   ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║   ██║   ██║██████╔╝',
    '   ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║   ██║   ██║██╔══██╗',
    '   ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║   ██║   ╚██████╔╝██║  ██║',
    '   ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝',
  ].join('\n');

  const BOOT_STEPS = [
    { text: 'BIOS ............................................. ', ok: 'OK', delay: 150 },
    { text: 'Bellek testi: 32768 KB ........................... ', ok: 'OK', delay: 100 },
    { text: 'TÜRKIYE MONITOR SİSTEM v1.5 yükleniyor .......... ', ok: 'OK', delay: 200 },
    { text: 'Çekirdek modülleri bağlanıyor .................... ', ok: 'OK', delay: 150 },
    { text: 'SVG Harita modülü (81 il) ........................ ', ok: 'OK', delay: 200 },
    { text: 'BIST 50 fiyat modülü ............................. ', ok: 'OK', delay: 150 },
    { text: 'Haber akışı (Bloomberg HT + AA + Foreks) ........ ', ok: 'OK', delay: 200 },
    { text: 'İstihbarat akışı (RTR + AP + BBC) ................ ', ok: 'OK', delay: 200 },
    { text: 'BIST Risk Tension Index modülü ................... ', ok: 'OK', delay: 150 },
    { text: 'CORS proxy bağlantısı ............................ ', ok: 'OK', delay: 300 },
    { text: 'Ekran tampon belleği ayarlanıyor ................. ', ok: 'OK', delay: 100 },
    { text: '', ok: '', delay: 200 },
    { text: '>> Tüm sistemler hazır. Dashboard başlatılıyor...', ok: '', delay: 400 },
  ];

  async function boot() {
    const bootScreen = document.getElementById('boot-screen');
    const bootAscii = document.getElementById('boot-ascii');
    const bootLog = document.getElementById('boot-log');

    // Show ASCII header
    bootAscii.textContent = BOOT_ASCII;

    // Run boot steps
    for (const step of BOOT_STEPS) {
      await sleep(step.delay);
      const line = document.createElement('div');
      if (step.ok) {
        line.innerHTML = `<span class="dim">${escapeHTML(step.text)}</span><span class="ok">[${step.ok}]</span>`;
      } else {
        line.innerHTML = `<span>${escapeHTML(step.text)}</span>`;
      }
      bootLog.appendChild(line);
      bootLog.scrollTop = bootLog.scrollHeight;
    }

    await sleep(600);

    // Fade out boot, show dashboard
    bootScreen.classList.add('hidden');
    document.getElementById('app-root').style.display = 'flex';

    await sleep(400);
    bootScreen.style.display = 'none';

    // Init modules
    initNeofetch();
    startClock();
    startDebtClock();
    loadTurkeyMap();
    
    // Init data modules with stagger
    setTimeout(() => BistModule.init(), 200);
    setTimeout(() => NewsModule.init(), 500);
    setTimeout(() => IntelModule.init(), 800);
    setTimeout(() => BistNewsModule.init(), 1100);
    setTimeout(() => RiskIndexModule.init(), 1400);
  }

  // ── Neofetch-style System Header ──────────────────────────
  function initNeofetch() {
    const logo = document.getElementById('sys-ascii-logo');
    logo.textContent = TURKEY_ASCII;

    const info = document.getElementById('sys-info-fields');
    const now = new Date();
    const fields = [
      ['OS',       'TürkiyeMonitor v1.5'],
      ['Kernel',   'BIST-Core 2026.04'],
      ['Uptime',   '0 mins'],
      ['Packages', '6 (modules)'],
      ['Shell',    'electron'],
      ['Terminal', 'cool-retro-term'],
      ['CPU',      'BIST50 DataStream'],
      ['Memory',   '--/--'],
    ];

    info.innerHTML = fields.map(([label, val]) =>
      `<span><span class="label">${label}:</span> ${val}</span>`
    ).join('');

    // Color blocks
    const colors = ['#CC0000','#FF8800','#FFBB00','#00AA00','#0044CC','#8800CC','#FFB000','#805500'];
    const blocks = document.getElementById('sys-color-blocks');
    blocks.innerHTML = colors.map(c =>
      `<span style="background:${c}"></span>`
    ).join('');

    // Update uptime every minute
    const startTime = Date.now();
    setInterval(() => {
      const mins = Math.floor((Date.now() - startTime) / 60000);
      const hrs = Math.floor(mins / 60);
      const uptimeStr = hrs > 0 ? `${hrs} hours, ${mins % 60} mins` : `${mins} mins`;
      const spans = info.querySelectorAll('span');
      spans.forEach(s => {
        if (s.textContent.includes('Uptime:')) {
          s.innerHTML = `<span class="label">Uptime:</span> ${uptimeStr}`;
        }
      });
    }, 60000);
  }

  // ── Clock ──────────────────────────────────────────────────
  function startClock() {
    const el = document.getElementById('titlebar-clock');
    function update() {
      const now = new Date();
      const days = ['PZR','PZT','SAL','ÇAR','PER','CUM','CTS'];
      const day = days[now.getDay()];
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const h = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      el.textContent = `${day} ${y}/${m}/${d} ${h}:${min}:${s}`;
    }
    update();
    setInterval(update, 1000);
  }

  // ── National Debt Clock ────────────────────────────────────
  function startDebtClock() {
    const el = document.getElementById('debt-counter');
    const container = document.getElementById('debt-chart-container');
    if(!el || !container) return;
    
    // Build 20-year histogram (2005 - 2025)
    let svgHtml = '<svg viewBox="0 0 100 40" preserveAspectRatio="none" style="width:100%; height:100%;">';
    const yearCount = 20;
    const barWidth = 100 / yearCount;
    const debtRatios = [
        10, 11, 12, 13, 15, 14, 16, 17, 19, 21, 24, 25, 27, 30, 32, 34, 37, 40, 43, 46, 52
    ]; // Simulation data curve
    
    for(let i=0; i<yearCount; i++) {
        const x = i * barWidth;
        const val = debtRatios[i];
        const h = (val / 52) * 35; // max height 35 out of 40
        const y = 40 - h;
        const opacity = 0.4 + (i/yearCount)*0.6;
        const color = i > 15 ? '#FF1744' : '#FF8A65';
        svgHtml += `<rect x="${x + 0.5}" y="${y}" width="${barWidth - 1}" height="${h}" fill="${color}" opacity="${opacity}">
          <title>${2005 + i} Yılı</title>
        </rect>`;
    }
    
    svgHtml += '</svg>';
    svgHtml += '<div style="position:absolute; bottom:2px; left:2px; font-size:9px; color:#FF8A65; opacity:0.7">2005</div>';
    svgHtml += '<div style="position:absolute; top:2px; right:2px; font-size:9px; color:#FF1744; opacity:0.7">2025</div>';
    container.innerHTML = svgHtml;
    
    // Base amount: ~519.9 Billion USD (TCMB 2025 Q4 data)
    let debtAmount = 519900000000 + (Math.random() * 1000000); 
    
    // Initial format
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

    setInterval(() => {
       // fluctuate interest + growth per tick
       const tickAdd = 2500 + (Math.random() * 1500 - 500);
       debtAmount += tickAdd;
       el.textContent = fmt.format(debtAmount);
       
       // Flashing red effect randomly when big tick happens
       if (tickAdd > 3500) {
           el.style.textShadow = "0 0 15px #FF0000, 0 0 30px #FF0000";
           setTimeout(() => el.style.textShadow = "0 0 10px #FF1744", 200);
       }
    }, 1000);
  }

  // ── Load Turkey Political Map SVG ──────────────────────────
  async function loadTurkeyMap() {
    try {
      // The SVG is served from the same directory
      const response = await fetch('data/turkey_political.svg');
      const svgText = await response.text();
      const container = document.getElementById('turkey-map-container');
      container.innerHTML = svgText;

      // Add BIST50 facility markers
      if (typeof MapModule !== 'undefined') {
        MapModule.init(container);
      }
    } catch (e) {
      console.error('Map load failed:', e);
      document.getElementById('turkey-map-container').innerHTML =
        '<div class="loading">HARİTA YÜKLENEMEDİ</div>';
    }
  }

  // ── Helpers ────────────────────────────────────────────────
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // Boot on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    boot();
    
    // Terminal CLI setup
    const cliInput = document.getElementById('terminal-cli-input');
    if (cliInput) {
        cliInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                let val = cliInput.value.trim();
                // Allow tracking with or without the leading slash
                if (val.startsWith('/')) {
                    val = val.substring(1);
                }
                val = val.toUpperCase();
                
                if (val.length > 0) {
                    // Just open the chart if ChartModule exists
                    if (window.ChartModule && window.ChartModule.openChart) {
                        try {
                           // Attempt to find in BIST50 for name
                           let name = val;
                           if (typeof BIST50_COMPANIES !== 'undefined') {
                               const c = BIST50_COMPANIES.find(x => x.ticker === val);
                               if (c) name = c.name;
                           }
                           window.ChartModule.openChart(val, name);
                           cliInput.value = ''; // clear
                        } catch(err) {
                           console.error(err);
                        }
                    }
                }
            }
        });
    }
  });

  return { boot };
})();
