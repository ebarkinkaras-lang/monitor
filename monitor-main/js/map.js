// ============================================================
// TürkiyeMonitor — Map Module (Political SVG + BIST Facilities)
// ============================================================

const MapModule = (() => {
  function init(container) {
    const svg = container.querySelector('svg');
    if (!svg) return;

    // Ensure viewBox
    if (!svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', '0 0 1005 490');
    }
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Add facility dots for BIST 50 companies
    drawFacilities(svg);
    
    // Add GCC Investments
    drawGCCInvestments(svg);

    // Province hover + click interaction
    setupProvinceInteraction(svg, container);

    // Setup toggles
    setupMapToggles(svg);

    // Setup modal close
    setupModalClose();

    document.getElementById('map-status').textContent = 'AKTİF';
  }

  function drawFacilities(svg) {
    const tooltip = document.getElementById('map-tooltip');

    BIST50_COMPANIES.forEach(company => {
      if (!company.facilities) return;
      company.facilities.forEach(fac => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', fac.x);
        circle.setAttribute('cy', fac.y);
        circle.setAttribute('r', '3');
        circle.classList.add('facility-dot', 'layer-bist50');

        circle.addEventListener('mouseenter', (e) => {
          tooltip.style.display = 'block';
          const typesStr = fac.types ? fac.types.join(', ') : '';
          tooltip.innerHTML = `<strong>${company.ticker}</strong> — ${company.name}<br>📍 ${fac.city || ''}${typesStr ? '<br>🏭 ' + typesStr : ''}`;
          const rect = svg.closest('.panel-body').getBoundingClientRect();
          tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
          tooltip.style.top = (e.clientY - rect.top - 20) + 'px';
        });

        circle.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });

        svg.appendChild(circle);
      });
    });
  }

  function drawGCCInvestments(svg) {
    const tooltip = document.getElementById('map-tooltip');
    
    if (typeof GCC_INVESTMENTS === 'undefined') return;

    GCC_INVESTMENTS.forEach(inv => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('layer-gcc');
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', inv.x);
      circle.setAttribute('cy', inv.y);
      circle.setAttribute('r', '5');
      circle.style.fill = 'rgba(0, 255, 128, 0.9)';
      circle.style.filter = 'drop-shadow(0 0 6px rgba(0,255,128,0.8))';
      circle.style.cursor = 'pointer';

      // Pulse ring
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', inv.x);
      ring.setAttribute('cy', inv.y);
      ring.setAttribute('r', '8');
      ring.style.fill = 'none';
      ring.style.stroke = 'rgba(0, 255, 128, 0.5)';
      ring.style.strokeWidth = '1.5';
      ring.style.animation = 'gcc-pulse 2s infinite alternate';

      // Attach hover events to group
      g.addEventListener('mouseenter', (e) => {
        tooltip.style.display = 'block';
        tooltip.innerHTML = `<strong style="color:#00ff80">${inv.name}</strong><br>📍 ${inv.city} - ${inv.type}<br>💰 ${inv.info}`;
        const rect = svg.closest('.panel-body').getBoundingClientRect();
        tooltip.style.left = (e.clientX - rect.left + 15) + 'px';
        tooltip.style.top = (e.clientY - rect.top - 25) + 'px';
      });

      g.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });

      g.appendChild(ring);
      g.appendChild(circle);
      svg.appendChild(g);
    });

    // Add keyframes for GCC pulse if not exists
    if (!document.getElementById('gcc-keyframes')) {
      const style = document.createElement('style');
      style.id = 'gcc-keyframes';
      style.innerHTML = `@keyframes gcc-pulse { 0% { r: 5; opacity: 1; } 100% { r: 12; opacity: 0; } }`;
      document.head.appendChild(style);
    }
  }

  function setupProvinceInteraction(svg, container) {
    const infoBox = document.getElementById('province-info');

    // Handle group-level hover and click
    const groups = svg.querySelectorAll('g[data-city-name]');
    groups.forEach(g => {
      const cityName = g.getAttribute('data-city-name') || g.id || '';

      // ── Hover: show quick info ────────────────────────
      g.addEventListener('mouseenter', () => {
        const count = countFacilitiesInCity(cityName);
        infoBox.innerHTML = `
          <div class="prov-name">${cityName.toUpperCase()}</div>
          <div class="prov-detail">
            ${count > 0
              ? `BIST50 Tesis Sayısı: ${count} (tıkla)`
              : 'BIST50 tesisi bulunmuyor'}
          </div>`;
        infoBox.style.display = 'block';
      });

      g.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        infoBox.style.left = (e.clientX - rect.left + 15) + 'px';
        infoBox.style.top = (e.clientY - rect.top - 10) + 'px';
      });

      g.addEventListener('mouseleave', () => {
        infoBox.style.display = 'none';
      });

      // ── Click: open modal with facility details ───────
      g.style.cursor = 'pointer';
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        infoBox.style.display = 'none';
        openProvinceModal(cityName);
      });
    });

    // Also handle paths with data-city-name (if no group wrapper)
    const directPaths = svg.querySelectorAll('path[data-city-name]');
    directPaths.forEach(p => {
      // Only if not already inside a group with data-city-name
      if (p.closest('g[data-city-name]')) return;

      const cityName = p.getAttribute('data-city-name') || '';
      p.style.cursor = 'pointer';
      p.addEventListener('click', (e) => {
        e.stopPropagation();
        openProvinceModal(cityName);
      });
    });
  }

  // ── Count facilities in a city ──────────────────────────────
  function countFacilitiesInCity(cityName) {
    let count = 0;
    const cn = cityName.toLowerCase();
    BIST50_COMPANIES.forEach(c => {
      if (!c.facilities) return;
      c.facilities.forEach(f => {
        if (f.city && f.city.toLowerCase() === cn) count++;
      });
    });
    return count;
  }

  function setupMapToggles(svg) {
    const buttons = document.querySelectorAll('#map-filters button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const layerClass = btn.getAttribute('data-layer');
        const isActive = btn.classList.contains('active');
        const selector = layerClass === 'bist50' ? '.layer-bist50' : '.layer-gcc';
        
        const elements = svg.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = isActive ? '' : 'none';
        });
      });
    });
  }

  // ── Open Province Detail Modal ──────────────────────────────
  function openProvinceModal(cityName) {
    const overlay = document.getElementById('province-modal-overlay');
    const title = document.getElementById('province-modal-title');
    const body = document.getElementById('province-modal-body');

    title.textContent = `◆ ${cityName.toUpperCase()} — BIST50 TESİSLERİ`;

    // Find all companies with facilities in this province
    const cn = cityName.toLowerCase();
    const matches = [];

    BIST50_COMPANIES.forEach(company => {
      if (!company.facilities) return;
      company.facilities.forEach(fac => {
        if (fac.city && fac.city.toLowerCase() === cn) {
          matches.push({
            typeC: 'bist',
            ticker: company.ticker,
            name: company.name,
            sector: company.sector,
            types: fac.types || [],
          });
        }
      });
    });

    if (typeof GCC_INVESTMENTS !== 'undefined') {
      GCC_INVESTMENTS.forEach(inv => {
        if (inv.city && inv.city.toLowerCase() === cn) {
          matches.push({
            typeC: 'gcc',
            name: inv.name,
            sector: inv.type,
            info: inv.info
          });
        }
      });
    }

    if (matches.length === 0) {
      body.innerHTML = `
        <div class="no-facilities">
          Bu ilde BIST50 şirketi veya seçili Ulusal Yatırım bulunmamaktadır.
        </div>`;
    } else {
      let html = `<div style="color:var(--amber-dark);margin-bottom:10px;font-size:15px;">
        Toplam ${matches.length} kayıt bulundu
      </div>`;

      matches.forEach(m => {
        if (m.typeC === 'bist') {
          html += `
            <div class="fac-card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div class="fac-ticker">${escapeHTML(m.ticker)}</div>
                  <button class="interval-btn" style="color:#00E676; border-color:#00E676;" onclick="window.ChartModule?.openChart('${escapeHTML(m.ticker)}', '${escapeHTML(m.name)}')">[»] ANALİZ ET</button>
              </div>
              <div class="fac-name">${escapeHTML(m.name)}</div>
              <div class="fac-sector">Sektör: ${escapeHTML(m.sector)}</div>
              <div class="fac-types">
                ${m.types.map(t => `<span class="fac-type-badge">${escapeHTML(t)}</span>`).join('')}
              </div>
            </div>`;
        } else {
          html += `
            <div class="fac-card" style="border-color: rgba(0, 255, 128, 0.4); box-shadow: 0 0 5px rgba(0, 255, 128, 0.1);">
              <div class="fac-ticker" style="color:#00ff80;">[YATIRIM FONU]</div>
              <div class="fac-name" style="color: #e0ffe0; font-size:16px;">${escapeHTML(m.name)}</div>
              <div class="fac-sector" style="color:var(--amber-dim);">Tür: ${escapeHTML(m.sector)}</div>
              <div style="font-size: 14px; margin-top: 4px; color:#00cc66;">Büyüklük: ${escapeHTML(m.info)}</div>
            </div>`;
        }
      });

      body.innerHTML = html;
    }

    overlay.classList.add('visible');
  }

  // ── Modal Close ─────────────────────────────────────────────
  function setupModalClose() {
    const overlay = document.getElementById('province-modal-overlay');
    const closeBtn = document.getElementById('province-modal-close');

    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('visible');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('visible');
      }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        overlay.classList.remove('visible');
      }
    });
  }

  return { init };
})();
