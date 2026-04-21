// ============================================================
// TürkiyeMonitor — Headlines Panel (Bloomberg HT + AA + Foreks)
// 3 sources merged, time filter (6h / 48h / 5d)
// ============================================================

const NewsModule = (() => {
  const SOURCES = [
    {
      name: 'BHT',
      label: 'Bloomberg HT',
      urls: [
        'https://www.bloomberght.com/rss',
      ]
    },
    {
      name: 'AA',
      label: 'Anadolu Ajansı',
      urls: [
        'https://www.aa.com.tr/tr/rss/default?cat=ekonomi',
      ]
    },
    {
      name: 'FRK',
      label: 'Foreks Haber',
      urls: [
        'https://www.foreks.com/rss/forsxml.php',
      ]
    }
  ];

  let allHeadlines = [];
  let currentFilterHours = 6;

  async function init() {
    setupFilterButtons();
    await fetchAllHeadlines();
    renderHeadlines();

    // Refresh every 5 minutes
    setInterval(async () => {
      await fetchAllHeadlines();
      renderHeadlines();
    }, 300000);
  }

  function setupFilterButtons() {
    document.querySelectorAll('.news-filters button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.news-filters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilterHours = parseInt(btn.dataset.hours);
        renderHeadlines();
      });
    });
  }

  async function fetchAllHeadlines() {
    allHeadlines = [];

    const promises = SOURCES.map(async source => {
      for (const url of source.urls) {
        try {
          const text = await fetchWithProxy(url);
          const items = parseRSS(text);
          items.forEach(item => {
            item.source = source.name;
            item.sourceLabel = source.label;
          });
          allHeadlines.push(...items);
        } catch (e) {
          console.warn(`${source.name} RSS failed:`, e.message);
        }
      }
    });

    await Promise.allSettled(promises);

    // Sort by date
    allHeadlines = sortByDate(allHeadlines);
    window.allNewsBuffer = allHeadlines;

    const statusEl = document.getElementById('news-panel')?.querySelector('.panel-status');
    if (statusEl) {
      statusEl.textContent = `${allHeadlines.length} MANŞET | AKTİF`;
    }

    // If no headlines fetched, add demo data
    if (allHeadlines.length === 0) {
      generateDemoHeadlines();
    }
  }

  function generateDemoHeadlines() {
    const demoItems = [
      { title: "BIST 100 endeksi güne yükselişle başladı", source: "BHT", sourceLabel: "Bloomberg HT" },
      { title: "Merkez Bankası faiz kararını açıkladı", source: "AA", sourceLabel: "Anadolu Ajansı" },
      { title: "Dolar/TL kuru son durum", source: "FRK", sourceLabel: "Foreks Haber" },
      { title: "Enflasyon verileri beklentilerin altında kaldı", source: "BHT", sourceLabel: "Bloomberg HT" },
      { title: "İhracat rakamları rekor kırdı", source: "AA", sourceLabel: "Anadolu Ajansı" },
      { title: "Altın fiyatlarında son gelişmeler", source: "FRK", sourceLabel: "Foreks Haber" },
      { title: "BIST 50 şirketleri bilanço dönemine giriyor", source: "BHT", sourceLabel: "Bloomberg HT" },
      { title: "Hazine ve Maliye Bakanlığı açıklama yaptı", source: "AA", sourceLabel: "Anadolu Ajansı" },
      { title: "Euro/TL paritesinde hareketlilik", source: "FRK", sourceLabel: "Foreks Haber" },
      { title: "Sanayi üretimi verileri açıklandı", source: "BHT", sourceLabel: "Bloomberg HT" },
      { title: "Türkiye ekonomisi büyüme rakamları", source: "AA", sourceLabel: "Anadolu Ajansı" },
      { title: "Petrol fiyatlarında düşüş sürüyor", source: "FRK", sourceLabel: "Foreks Haber" },
    ];

    const now = Date.now();
    allHeadlines = demoItems.map((item, i) => ({
      title: item.title,
      link: '',
      pubDate: new Date(now - i * 1800000), // every 30 min
      description: '',
      source: item.source,
      sourceLabel: item.sourceLabel,
    }));
    window.allNewsBuffer = allHeadlines;

    const statusEl = document.getElementById('news-panel')?.querySelector('.panel-status');
    if (statusEl) {
      statusEl.textContent = `${allHeadlines.length} MANŞET | DEMO`;
    }
  }

  function renderHeadlines() {
    const body = document.getElementById('news-body');
    if (!body) return;

    const filtered = filterByTime(allHeadlines, currentFilterHours);

    if (filtered.length === 0) {
      body.innerHTML = `<div class="loading">SON ${currentFilterHours} SAAT İÇİN MANŞET YOK</div>`;
      return;
    }

    let html = '';
    filtered.forEach(item => {
      const hasLink = item.link && item.link !== '#' && item.link !== '';

      html += `
        <div class="news-item">
          <span class="news-source">[${item.source}]</span>
          <span class="news-time">${formatDateTime(item.pubDate)}</span>
          ${hasLink
            ? `<span class="news-title" onclick="event.preventDefault();event.stopPropagation();window.electronAPI?window.electronAPI.openExternal('${escapeHTML(item.link)}'):window.open('${escapeHTML(item.link)}','_blank')">${escapeHTML(item.title)}</span>`
            : `<span class="news-title">${escapeHTML(item.title)}</span>`
          }
        </div>`;
    });

    body.innerHTML = html;
  }

  return { init };
})();
