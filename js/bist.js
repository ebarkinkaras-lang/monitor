// ============================================================
// TürkiyeMonitor — BIST 50 Price Fetcher & Renderer
// ============================================================

const BistModule = (() => {
  const TICKERS = BIST50_COMPANIES.map(c => c.ticker + '.IS');
  const BATCH_SIZE = 15;
  let priceData = [];

  async function init() {
    await fetchPrices();
    renderPrices();
    // Refresh every 60 seconds
    setInterval(async () => {
      await fetchPrices();
      renderPrices();
    }, 60000);
  }

  async function fetchPrices() {
    try {
      // Split tickers into batches to avoid URL length limits
      const batches = [];
      for (let i = 0; i < TICKERS.length; i += BATCH_SIZE) {
        batches.push(TICKERS.slice(i, i + BATCH_SIZE));
      }

      priceData = [];
      for (const batch of batches) {
        const symbols = batch.join(',');
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=symbol,regularMarketPrice,regularMarketChangePercent,regularMarketChange`;

        try {
          const text = await fetchWithProxy(url);
          const data = JSON.parse(text);
          if (data.quoteResponse && data.quoteResponse.result) {
            priceData.push(...data.quoteResponse.result);
          }
        } catch (e) {
          console.warn('BIST batch failed:', e.message);
        }
      }

      if (priceData.length === 0) {
        generateMockData();
      } else {
        document.getElementById('bist-status').textContent = `${priceData.length} HİSSE | AKTİF`;
      }
    } catch (e) {
      console.error('BIST fetch failed:', e);
      document.getElementById('bist-status').textContent = 'HATA';
      if (priceData.length === 0) {
        generateMockData();
      }
    }
  }

  function generateMockData() {
    priceData = BIST50_COMPANIES.map(c => ({
      symbol: c.ticker + '.IS',
      regularMarketPrice: (Math.random() * 200 + 10).toFixed(2),
      regularMarketChangePercent: ((Math.random() - 0.5) * 8).toFixed(2),
    }));
    document.getElementById('bist-status').textContent = `${priceData.length} HİSSE | DEMO`;
  }

  function renderPrices() {
    const body = document.getElementById('bist-body');
    if (!body) return;

    if (priceData.length === 0) {
      body.innerHTML = '<div class="loading">VERİ BEKLENİYOR</div>';
      return;
    }

    let html = '';
    priceData.forEach(quote => {
      const ticker = (quote.symbol || '').replace('.IS', '');
      const price = Number(quote.regularMarketPrice || 0).toFixed(2);
      const change = Number(quote.regularMarketChangePercent || 0).toFixed(2);
      const isPositive = change >= 0;
      const changeClass = isPositive ? 'positive' : 'negative';
      const changeSign = isPositive ? '+' : '';

      const company = BIST50_COMPANIES.find(c => c.ticker === ticker);
      const name = company ? company.name.replace(/'/g, "\\'") : ticker;

      html += `
        <div class="bist-row" style="cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-panel-alt)'" onmouseout="this.style.background='transparent'" onclick="if(window.ChartModule) ChartModule.openChart('${escapeHTML(ticker)}', '${escapeHTML(name)}')">
          <span class="bist-ticker">${escapeHTML(ticker)}</span>
          <span class="bist-price">${price} ₺</span>
          <span class="bist-change ${changeClass}">${changeSign}${change}%</span>
        </div>`;
    });

    body.innerHTML = html;
  }

  return { init };
})();
