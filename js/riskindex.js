// ============================================================
// TürkiyeMonitor — BIST Risk Tension Index (Turkey-specific)
// Replaces CNN Fear & Greed with a custom algorithm
// ============================================================

const RiskIndexModule = (() => {
  // Simulated components (in production: real API data)
  const COMPONENTS = {
    cds5y:        { label: 'CDS 5Y (bps)',      weight: 0.30 },
    usdtryVol:    { label: 'USD/TRY Volatilite', weight: 0.25 },
    bistMomentum: { label: 'BIST Momentum',      weight: 0.20 },
    volumeRatio:  { label: 'Hacim Oranı',        weight: 0.15 },
    foreignFlow:  { label: 'Yabancı Akışı',      weight: 0.10 },
  };

  function init() {
    calculateAndRender();
    // Recalculate every 5 minutes
    setInterval(calculateAndRender, 300000);
  }

  function calculateAndRender() {
    // ── Simulate component scores (0-100, where 0 = extreme risk, 100 = opportunity)
    const scores = {
      cds5y:        simulateCDS(),
      usdtryVol:    simulateVolatility(),
      bistMomentum: simulateMomentum(),
      volumeRatio:  simulateVolume(),
      foreignFlow:  simulateForeignFlow(),
    };

    // Weighted average
    let totalWeight = 0;
    let weightedSum = 0;
    for (const [key, config] of Object.entries(COMPONENTS)) {
      weightedSum += (scores[key] || 50) * config.weight;
      totalWeight += config.weight;
    }

    const index = Math.round(weightedSum / totalWeight);
    const label = getLabel(index);

    renderIndex(index, label, scores);
    document.getElementById('risk-status').textContent = 'AKTİF';
  }

  function getLabel(val) {
    if (val <= 15) return '» KRİTİK RİSK «';
    if (val <= 30) return '» YÜKSEK RİSK «';
    if (val <= 45) return '» DİKKAT «';
    if (val <= 55) return '» NÖTR «';
    if (val <= 70) return '» POZİTİF «';
    if (val <= 85) return '» FIRSAT «';
    return '» GÜÇLÜ FIRSAT «';
  }

  // ── Simulated Data Sources ────────────────────────────────
  function simulateCDS() {
    // CDS 5Y for Turkey typically 200-800bps
    // Lower CDS = safer = higher score
    const cds = 250 + Math.random() * 300;
    return Math.max(0, Math.min(100, 100 - ((cds - 200) / 6)));
  }

  function simulateVolatility() {
    // Daily USD/TRY vol: 0.5-3%
    // Lower vol = safer = higher score
    const vol = 0.5 + Math.random() * 2;
    return Math.max(0, Math.min(100, 100 - (vol * 40)));
  }

  function simulateMomentum() {
    // BIST 100 daily return -3% to +3%
    const ret = (Math.random() - 0.45) * 6;
    return Math.max(0, Math.min(100, 50 + ret * 15));
  }

  function simulateVolume() {
    // Volume ratio vs 20-day avg (0.5x to 2x)
    const ratio = 0.6 + Math.random() * 1.2;
    return Math.max(0, Math.min(100, ratio * 55));
  }

  function simulateForeignFlow() {
    // Net foreign flow: negative = selling, positive = buying
    const flow = (Math.random() - 0.4) * 100;
    return Math.max(0, Math.min(100, 50 + flow * 0.5));
  }

  // ── Render ────────────────────────────────────────────────
  function renderIndex(value, label, scores) {
    const body = document.getElementById('risk-body');
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    body.innerHTML = `
      <div class="risk-value">${value}</div>
      <div class="risk-label">${label}</div>

      <div class="risk-bar-container">
        <div class="risk-bar-fill" style="width:${value}%"></div>
      </div>
      <div class="risk-bar-labels">
        <span>0 RİSK</span>
        <span>50</span>
        <span>100 FIRSAT</span>
      </div>

      <div class="risk-gauge" style="margin-top:10px;">
        <div class="risk-gauge-fill" style="width:${value}%"></div>
        <span class="risk-gauge-val">${value}</span>
      </div>

      <div class="risk-updated">SON GÜNCELLEME: ${timeStr}</div>

      <div style="margin-top:8px; font-size:10px; color:var(--amber-dark); border-top:1px dotted var(--border); padding-top:6px;">
        ${Object.entries(COMPONENTS).map(([key, cfg]) => {
          const s = scores[key] || 0;
          return `<div style="display:flex;justify-content:space-between;padding:1px 0;">
            <span>${cfg.label}</span>
            <span style="color:${s < 30 ? 'var(--red)' : s > 70 ? 'var(--green)' : 'var(--amber)'}">
              ${s.toFixed(0)}/100 (w:${(cfg.weight*100).toFixed(0)}%)
            </span>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  return { init };
})();
