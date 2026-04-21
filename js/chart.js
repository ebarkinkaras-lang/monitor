/**
 * TürkiyeMonitor — TradingView Chart System
 * Integrates lightweight-charts with custom Pine Script translations
 */

const ChartModule = (() => {
  let chart = null;
  let candleSeries = null;
  let hullSeries = null;
  let macdHistogramSeries = null;
  let macdLineSeries = null;
  let signalLineSeries = null;
  
  let line2w = null;
  let line6m = null;

  let currentTicker = null;
  let currentCompanyName = null;
  let currentInterval = '1d';

  async function openChart(ticker, companyName) {
    const modal = document.getElementById('chart-modal-overlay');
    const title = document.getElementById('chart-modal-title');
    const subtitle = document.getElementById('chart-modal-subtitle');
    
    currentTicker = ticker;
    currentCompanyName = companyName;

    title.textContent = ticker;
    subtitle.textContent = companyName;
    modal.classList.add('visible');

    // Show loading state in tables
    document.getElementById('tv-info-content').innerHTML = '<div style="padding:10px; color:#B0BEC5;">Veri yükleniyor...</div>';
    document.getElementById('tv-dema-content').innerHTML = '<div style="padding:10px; color:#B0BEC5;">Hesaplanıyor...</div>';

    try {
      // Clear previous chart if exists
      const container = document.getElementById('tv-chart-container');
      container.innerHTML = '';
      
      chart = LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: container.clientHeight,
        layout: {
          background: { type: 'solid', color: 'transparent' },
          textColor: '#FFB000',
        },
        grid: {
          vertLines: { color: 'rgba(255, 176, 0, 0.15)' },
          horzLines: { color: 'rgba(255, 176, 0, 0.15)' },
        },
        crosshair: {
          mode: LightweightCharts.CrosshairMode.Normal,
          vertLine: { color: '#FFB000', labelBackgroundColor: '#936600' },
          horzLine: { color: '#FFB000', labelBackgroundColor: '#936600' },
        },
        timeScale: {
          timeVisible: true,
          borderColor: '#FFB000',
        },
        rightPriceScale: {
          borderColor: '#FFB000',
        }
      });

      // Create Main Series (Amber Theme: Up = Hollow, Down = Solid)
      candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
        upColor: 'transparent',
        downColor: '#936600',
        borderVisible: true,
        borderColor: '#FFB000',
        wickUpColor: '#FFB000',
        wickDownColor: '#936600',
      });

      hullSeries = chart.addSeries(LightweightCharts.LineSeries, {
        color: '#FFEA00', // Bright yellow for contrast against amber
        lineWidth: 2,
      });

      line2w = chart.addSeries(LightweightCharts.LineSeries, {
        color: 'rgba(255, 176, 0, 0.7)',
        lineWidth: 2,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        lastValueVisible: true,
        priceLineVisible: false
      });
      
      line6m = chart.addSeries(LightweightCharts.LineSeries, {
        color: 'rgba(147, 102, 0, 0.7)',
        lineWidth: 2,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        lastValueVisible: true,
        priceLineVisible: false
      });

      // Fetch data
      const queryTicker = ticker === 'XU100' ? 'XU100.IS' : `${ticker}.IS`;
      const ohlcv = await fetchYahooHistory(queryTicker, '2y', currentInterval);
      
      if (!ohlcv || ohlcv.length === 0) {
        document.getElementById('tv-info-content').innerHTML = '<div style="padding:10px; color:#EF5350;">Veri çekilemedi.</div>';
        return;
      }

      // Prepare data for TV
      const candleData = ohlcv.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close
      }));
      candleSeries.setData(candleData);

      // Calculate Indicators
      const mcPredict = Indicators.calculateMCPredict(ohlcv);
      const macdDema = Indicators.calculateMacdDemaPro(ohlcv);
      const preds = Indicators.calculatePredictionLines(ohlcv);

      // Prepare HullMA Data
      const hullData = [];
      const markers = [];

      for (let i = 0; i < ohlcv.length; i++) {
          if (!isNaN(mcPredict.hullVal[i])) {
              hullData.push({ time: ohlcv[i].time, value: mcPredict.hullVal[i] });
          }

          // Add Markers for strong buy/sell (mcPredict scores)
          const score = mcPredict.scores[i] ? mcPredict.scores[i].finalPrediction : 0;
          const prevScore = mcPredict.scores[i-1] ? mcPredict.scores[i-1].finalPrediction : 0;
          
          if (score >= 50 && prevScore < 50) {
              markers.push({ time: ohlcv[i].time, position: 'belowBar', color: '#4CAF50', shape: 'arrowUp', text: 'AL' });
          } else if (score <= -50 && prevScore > -50) {
              markers.push({ time: ohlcv[i].time, position: 'aboveBar', color: '#F44336', shape: 'arrowDown', text: 'SAT' });
          }

          // Divergence Markers
          if (macdDema.bullDiv[i]) {
              markers.push({ time: ohlcv[i].time, position: 'belowBar', color: '#00BCD4', shape: 'arrowUp', text: 'Bull Div' });
          } else if (macdDema.bearDiv[i]) {
              markers.push({ time: ohlcv[i].time, position: 'aboveBar', color: '#FF5722', shape: 'arrowDown', text: 'Bear Div' });
          }
      }
      
      hullSeries.setData(hullData);
      LightweightCharts.createSeriesMarkers(candleSeries, markers);

      // Linear Regression Extrapolations (We fake 1 point ahead for visual)
      const lastTime = ohlcv[ohlcv.length-1].time;
      // adding roughly 10 days in seconds
      const futureTime2w = lastTime + (10 * 86400); 
      const futureTime6m = lastTime + (126 * 86400);

      line2w.setData([
        { time: lastTime, value: ohlcv[ohlcv.length-1].close },
        { time: futureTime2w, value: preds.pred2w }
      ]);
      
      line6m.setData([
        { time: lastTime, value: ohlcv[ohlcv.length-1].close },
        { time: futureTime6m, value: preds.pred6m }
      ]);

      // MACD DEMA Pane (Bottom)
      macdHistogramSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
        priceScaleId: 'macdScales',
        priceFormat: { type: 'volume' },
      });
      macdLineSeries = chart.addSeries(LightweightCharts.LineSeries, {
        color: '#FFEA00',
        lineWidth: 2,
        priceScaleId: 'macdScales',
      });
      signalLineSeries = chart.addSeries(LightweightCharts.LineSeries, {
        color: '#936600',
        lineWidth: 1,
        priceScaleId: 'macdScales',
      });

      chart.priceScale('macdScales').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      const histData = [];
      const macdLineData = [];
      const sigLineData = [];

      for (let i = 0; i < ohlcv.length; i++) {
          if (isNaN(macdDema.histogram[i])) continue;
          
          let color = '#78909C';
          const h = macdDema.histogram[i];
          const hPrev = macdDema.histogram[i-1] || 0;
          
          if (h > 0 && h > hPrev) color = '#FFB000';
          else if (h > 0 && h <= hPrev) color = 'rgba(255, 176, 0, 0.5)';
          else if (h < 0 && h < hPrev) color = '#936600';
          else if (h < 0 && h >= hPrev) color = 'rgba(147, 102, 0, 0.5)';

          histData.push({ time: ohlcv[i].time, value: h, color: color });
          macdLineData.push({ time: ohlcv[i].time, value: macdDema.macdLine[i] });
          sigLineData.push({ time: ohlcv[i].time, value: macdDema.signalLine[i] });
      }

      macdHistogramSeries.setData(histData);
      macdLineSeries.setData(macdLineData);
      signalLineSeries.setData(sigLineData);

      // Fit to view
      chart.timeScale().fitContent();

      renderInfoTables(mcPredict, macdDema, preds, ohlcv[ohlcv.length-1]);
      renderSupplyChain(ticker);
      renderStockNews(ticker);
      renderStockContracts(ticker);
    } catch (err) {
      console.error("Chart generation error:", err);
      document.getElementById('tv-info-content').innerHTML = '<div style="padding:10px; color:#EF5350;">Error: ' + err.message + '<br>' + err.stack + '</div>';
    }
  }

  function renderInfoTables(mcPredict, macdDema, preds, lastTick) {
    const lastScore = mcPredict.scores[mcPredict.scores.length - 1];
    const lastStat = macdDema.stats[macdDema.stats.length - 1];

    if (!lastScore || !lastStat) return;

    // --- MC-PREDICT TABLE ---
    const pScore = lastScore.finalPrediction;
    const pColor = pScore > 50 ? '#00E676' : pScore > 20 ? '#69F0AE' : pScore > -20 ? '#B0BEC5' : pScore > -50 ? '#FF8A65' : '#FF1744';
    const sigText = pScore >= 50 ? "GÜÇLÜ AL" : pScore >= 20 ? "AL" : pScore <= -50 ? "GÜÇLÜ SAT" : pScore <= -20 ? "SAT" : "NÖTR";

    const mcHtml = `
      <div class="tv-table-row">
        <span class="tv-table-cell-left">TAHMİN SKORU</span>
        <span class="tv-table-cell-right" style="color:${pColor}; font-size:16px;">${pScore.toFixed(1)}</span>
      </div>
      <div class="tv-table-row">
        <span class="tv-table-cell-left">Sinyal</span>
        <span class="tv-table-cell-right" style="color:${pColor}">${sigText}</span>
      </div>
      <div class="tv-table-row">
        <span class="tv-table-cell-left">🔵 HullMA</span>
        <span class="tv-table-cell-right" style="color:${lastScore.n1_greater ? '#00E676' : '#FF1744'}">${lastScore.n1_greater ? 'Yukarı ▲' : 'Aşağı ▼'}</span>
      </div>
      <div class="tv-table-row">
        <span class="tv-table-cell-left">📈 Trend Skoru</span>
        <span class="tv-table-cell-right">${lastScore.trendScore.toFixed(0)}</span>
      </div>
      <div class="tv-table-row">
        <span class="tv-table-cell-left">⚡ Mom Skoru</span>
        <span class="tv-table-cell-right">${lastScore.momentumScore.toFixed(0)}</span>
      </div>
      <div class="tv-table-row">
        <span class="tv-table-cell-left">🤖 ML(kNN) YZ</span>
        <span class="tv-table-cell-right">${lastScore.mlScore.toFixed(0)}</span>
      </div>
      <div class="tv-table-row">
        <span class="tv-table-cell-left">🔮 2 Hafta Tahmin</span>
        <span class="tv-table-cell-right" style="color:#42A5F5">${preds.pred2w.toFixed(2)}</span>
      </div>
      <div class="tv-table-row">
        <span class="tv-table-cell-left">🔮 6 Ay Tahmin</span>
        <span class="tv-table-cell-right" style="color:#FFA726">${preds.pred6m.toFixed(2)}</span>
      </div>
    `;
    document.getElementById('tv-info-content').innerHTML = mcHtml;

    // --- MACD DEMA TABLE ---
    const mSig = lastStat.macdLine > lastStat.signalLine ? "🟢 Bullish" : "🔴 Bearish";
    const mColor = lastStat.macdLine > lastStat.signalLine ? "#26A69A" : "#EF5350";
    
    // Expensive emojis
    const eScore = lastStat.expScore;
    const emojis = '💰'.repeat(eScore);
    const eLabel = eScore >= 4 ? "Pahalı" : eScore >= 3 ? "Normal" : "Ucuz";
    const eColor = eScore >= 4 ? "#FF1744" : eScore >= 3 ? "#FFD54F" : "#00E676";

    // Entry score
    const enScore = lastStat.entryScore;
    const enText = enScore >= 4 ? "🟢 MÜKEMMEL" : enScore >= 2 ? "🟡 İYİ" : "🔴 ZAYIF";
    const enColor = enScore >= 4 ? "#00E676" : enScore >= 2 ? "#FFD54F" : "#FF1744";

    const demaHtml = `
      <div class="tv-table-row">
        <span class="tv-table-cell-left">MACD</span>
        <span class="tv-table-cell-right" style="color:${mColor}">${mSig}</span>
      </div>
      <div class="tv-table-row">
        <span class="tv-table-cell-left">Divergence</span>
        <span class="tv-table-cell-right">${lastStat.bullDiv ? '<span style="color:#00BCD4">💎 Bullish Div!</span>' : lastStat.bearDiv ? '<span style="color:#FF5722">⚠️ Bearish Div!</span>' : 'Yok'}</span>
      </div>
      <div class="tv-table-row" style="background:rgba(13,71,161,0.3)">
        <span class="tv-table-cell-left">🎯 Giriş Noktası</span>
        <span class="tv-table-cell-right" style="color:${enColor}">${enText} (${enScore}/5)</span>
      </div>
      <div class="tv-table-row" style="background:rgba(74,20,140,0.3)">
        <span class="tv-table-cell-left">💰 Pahalılık (1 Yıl)</span>
        <span class="tv-table-cell-right" style="color:${eColor}">${emojis} ${eLabel}</span>
      </div>
    `;
    document.getElementById('tv-dema-content').innerHTML = demaHtml;
  }

  async function renderSupplyChain(ticker) {
    const container = document.getElementById('sc-map-container');
    if (!container) return;
    
    try {
      const response = await fetch('data/turkey_political.svg');
      const svgText = await response.text();
      
      container.innerHTML = `<div id="sc-alert-text" style="position:absolute; top:2px; right:6px; font-size:11px; z-index:10; color:var(--amber-dim);">AĞ DURUMU: NORMAL</div>` + svgText;
      const alertText = document.getElementById('sc-alert-text');
      const svg = container.querySelector('svg');
      if (!svg) return;

      if (!svg.getAttribute('viewBox')) {
        svg.setAttribute('viewBox', '0 0 1005 490');
      }
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // Dim the map lines for the modal
      const paths = svg.querySelectorAll('path');
      paths.forEach(p => {
         p.style.stroke = 'rgba(255, 176, 0, 0.15)';
         p.style.fill = 'transparent';
         p.style.filter = 'none';
      });

      // Get company facilities
      const comp = BIST50_COMPANIES.find(c => c.ticker === ticker);
      if (!comp || !comp.facilities || comp.facilities.length === 0) {
         alertText.textContent = "TESİS VERİSİ BULUNAMADI";
         return;
      }

      const facs = comp.facilities;
      if (facs.length === 1) {
         alertText.textContent = "AĞ DURUMU: TEK MERKEZ";
      }
      
      // Assume hub is the first facility, connect to others (star topology)
      const hub = facs[0];
      
      // Random disruption simulation (25% chance)
      let hasDisruption = Math.random() < 0.25;
      let disruptedIndex = hasDisruption && facs.length > 1 ? Math.floor(Math.random() * (facs.length - 1)) + 1 : -1;

      // Ensure nodes (circles) are drawn on TOP of links (lines)
      const linksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      svg.appendChild(linksGroup);
      svg.appendChild(nodesGroup);

      // Draw links
      for(let i=1; i<facs.length; i++) {
         const target = facs[i];
         const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
         line.setAttribute('x1', hub.x);
         line.setAttribute('y1', hub.y);
         line.setAttribute('x2', target.x);
         line.setAttribute('y2', target.y);
         line.classList.add('sc-link');
         line.classList.add('sc-link-anim');

         if (hasDisruption && i === disruptedIndex) {
            line.classList.add('sc-alert-link');
         }

         linksGroup.appendChild(line);
      }

      // Draw nodes
      for(let i=0; i<facs.length; i++) {
         const fac = facs[i];
         const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
         circle.setAttribute('cx', fac.x);
         circle.setAttribute('cy', fac.y);
         circle.classList.add('sc-node');

         }
         
         // ── NODE HOVER TOOLTIP ──
         circle.addEventListener('mouseenter', (e) => {
            const tt = document.getElementById('map-tooltip');
            if (tt) {
               tt.style.display = 'block';
               tt.innerHTML = `<strong style="color:var(--amber)">${fac.city?.toUpperCase()} TESİSİ</strong><br>Tür: ${fac.types ? fac.types.join(', ') : 'Genel'}`;
               const rect = container.getBoundingClientRect();
               tt.style.left = (e.clientX - rect.left + 10) + 'px';
               tt.style.top = (e.clientY - rect.top - 20) + 'px';
            }
         });
         circle.addEventListener('mouseleave', () => {
            const tt = document.getElementById('map-tooltip');
            if (tt) tt.style.display = 'none';
         });
         
         nodesGroup.appendChild(circle);
      }

    } catch (e) {
      console.error("Supply chain load failed:", e);
      const alertText = document.getElementById('sc-alert-text');
      if (alertText) alertText.textContent = "HARİTA YÜKLENEMEDİ";
    }
  }

  function renderStockNews(ticker) {
    const news = [
      { time: "14:30", title: `${ticker} - Pay Alım Satım Bildirimi` },
      { time: "11:15", title: `Sermaye Artırımı / Temettü Kararı Hakkında` },
      { time: "09:42", title: `Yeni İş İlişkisi (Sözleşme İmzalanması)` },
      { time: "Dün", title: `${ticker} - Genel Kurul Toplantı Sonucu` },
      { time: "Dün", title: `Kredi Derecelendirme Notu Güncellemesi` },
      { time: "Pzt", title: `Maddi Duran Varlık Alımı Bildirimi` },
      { time: "Pzt", title: `${ticker} - Kurumsal Yönetim İlkeleri Uyum Raporu` }
    ];

    document.getElementById('stock-news-list').innerHTML = news.map(n => 
      `<div class="news-item"><span class="title">[KAP] ${n.title}</span><span class="time">${n.time}</span></div>`
    ).join('');
  }

  function renderStockContracts(ticker) {
    const list = document.getElementById('stock-contracts-list');
    if (!list) return;
    
    // FETCH REAL NEWS FROM CACHE (FILTER BY TICKER/NAME)
    // Accessing NewsModule hidden data would be ideal, 
    // but we'll use a globally shared state or re-filter the UI headlines
    const headlines = window.allNewsBuffer || [];
    const t = ticker.toLowerCase();
    const nameKeywords = currentCompanyName ? currentCompanyName.toLowerCase().split(' ') : [];
    
    // Filter logic for "Investment / Tender / Agreement"
    const contractKeywords = ['ihale', 'anlaşma', 'sözleşme', 'yatırım', 'kap', 'ortaklık', 'satın alım', 'lisans', 'proje'];
    
    const relevant = headlines.filter(h => {
       const title = h.title.toLowerCase();
       const matchesTicker = title.includes(t);
       const matchesName = nameKeywords.some(kw => kw.length > 3 && title.includes(kw));
       const isContract = contractKeywords.some(ck => title.includes(ck));
       return (matchesTicker || matchesName) && isContract;
    });
    
    if (relevant.length === 0) {
      list.innerHTML = `<div style="padding:10px; color:var(--amber-dim); font-size:14px; text-align:center; border:1px dashed var(--border); margin-top:5px;">
        YAKIN DÖNEM AÇIK KAYNAK İSTİHBARATINDA BU ŞİRKET İÇİN SÖZLEŞME/İHALE BİLDİRİMİNE RASTLANMADI.
      </div>`;
      return;
    }
    
    list.innerHTML = relevant.map(r => `
      <div class="news-item" style="border-left-color: #44FF44; font-size:15px; padding-left: 8px; margin-bottom: 8px;">
        <div style="color:var(--amber); margin-bottom:2px;">[GERÇEK VERİ] ${r.sourceLabel || 'HABER'}</div>
        <div style="color:#00E676; line-height:1.2;">${r.title}</div>
        <div style="color:var(--amber-dark); font-size:12px; margin-top:3px;">Kaynak: ${r.source} | ${new Date(r.pubDate).toLocaleDateString('tr-TR')}</div>
      </div>
    `).join('');
  }

  function init() {
    // Basic binding
    document.getElementById('chart-modal-close').addEventListener('click', () => {
      document.getElementById('chart-modal-overlay').classList.remove('visible');
      if (chart) {
        chart.remove();
        chart = null;
      }
    });

    // Handle resizing window
    window.addEventListener('resize', () => {
      if (chart) {
        const container = document.getElementById('tv-chart-container');
        chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
      }
    });
    // Interval Buttons
    const intervalBtns = document.querySelectorAll('.interval-btn');
    intervalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!currentTicker) return;
        intervalBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentInterval = e.target.dataset.interval;
        openChart(currentTicker, currentCompanyName);
      });
    });

  }

  return { init, openChart };
})();

window.ChartModule = ChartModule;

document.addEventListener('DOMContentLoaded', () => {
  ChartModule.init();
});
