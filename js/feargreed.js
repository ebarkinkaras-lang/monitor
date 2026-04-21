// ============================================================
// TürkiyeMonitor — Fear & Greed Index
// CNN Fear & Greed with ASCII gauge
// ============================================================

const FearGreedModule = (() => {
  let currentValue = null;

  async function init() {
    await fetchIndex();
    renderGauge();

    // Refresh every 10 minutes
    setInterval(async () => {
      await fetchIndex();
      renderGauge();
    }, 600000);
  }

  async function fetchIndex() {
    try {
      const url = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
      const text = await fetchWithProxy(url);
      const data = JSON.parse(text);

      if (data && data.fear_and_greed) {
        currentValue = {
          score: Math.round(data.fear_and_greed.score),
          rating: data.fear_and_greed.rating,
          timestamp: new Date(data.fear_and_greed.timestamp)
        };
      }

      document.getElementById('fg-status').textContent = 'AKTİF';
    } catch (e) {
      console.warn('Fear & Greed fetch failed:', e.message);
      // Use mock data
      currentValue = {
        score: Math.floor(Math.random() * 100),
        rating: 'Neutral',
        timestamp: new Date()
      };
      document.getElementById('fg-status').textContent = 'DEMO';
    }
  }

  function getLabel(score) {
    if (score <= 20) return 'EXTREME FEAR';
    if (score <= 40) return 'FEAR';
    if (score <= 60) return 'NEUTRAL';
    if (score <= 80) return 'GREED';
    return 'EXTREME GREED';
  }

  function getASCIIBar(score, width = 30) {
    const filled = Math.round((score / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  function renderGauge() {
    const body = document.getElementById('fg-body');
    if (!body || !currentValue) return;

    const score = currentValue.score;
    const label = getLabel(score);
    const bar = getASCIIBar(score, 24);
    const pct = score + '%';

    body.innerHTML = `
      <div class="fg-container">
        <div class="fg-value glow">${score}</div>
        <div class="fg-label glow">» ${label} «</div>
        <div class="fg-gauge-wrapper">
          <div class="fg-gauge-bar">
            <div class="fg-gauge-fill" style="width: ${score}%"></div>
          </div>
          <div class="fg-scale">
            <span>0 FEAR</span>
            <span>50</span>
            <span>100 GREED</span>
          </div>
        </div>
        <div style="font-size: 14px; color: var(--amber-dim); margin-top: 8px; text-align: center; font-family: var(--font-main);">
          ╔════════════════════════════╗<br>
          ║ ${bar} ${String(score).padStart(3, ' ')} ║<br>
          ╚════════════════════════════╝
        </div>
        <div style="font-size: 11px; color: var(--amber-very-dim); margin-top: 4px;">
          SON GÜNCELLEME: ${formatDateTime(currentValue.timestamp)}
        </div>
      </div>
    `;
  }

  return { init };
})();
