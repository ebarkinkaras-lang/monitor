// ============================================================
// TürkiyeMonitor — BIST 50 News Panel
// Yahoo Finance Turkey news or Foreks borsa news
// ============================================================

const BistNewsModule = (() => {
  const RSS_URLS = [
    'https://www.bloomberght.com/rss',
    'https://www.foreks.com/rss/forsxml.php',
  ];

  const BIST_KEYWORDS = [
    'bist', 'borsa', 'hisse', 'endeks', 'pay piyasası', 'sermaye piyasası',
    'halka arz', 'temettü', 'bilanço', 'gelir tablosu', 'kar', 'zarar',
    'spk', 'takasbank', 'mkk', 'viop', 'opsiyon',
    ...BIST50_COMPANIES.map(c => c.ticker.toLowerCase()),
    ...BIST50_COMPANIES.map(c => c.name.toLowerCase()),
  ];

  let bistNews = [];

  async function init() {
    await fetchBistNews();
    renderBistNews();

    // Refresh every 5 minutes
    setInterval(async () => {
      await fetchBistNews();
      renderBistNews();
    }, 300000);
  }

  async function fetchBistNews() {
    bistNews = [];

    const promises = RSS_URLS.map(async (url, idx) => {
      try {
        const text = await fetchWithProxy(url);
        const items = parseRSS(text);
        const sourceTag = idx === 0 ? 'BHT' : 'FRK';
        items.forEach(item => {
          item.source = sourceTag;
        });

        // Filter BIST-related
        const relevant = items.filter(item => {
          const text = (item.title + ' ' + item.description).toLowerCase();
          return BIST_KEYWORDS.some(kw => text.includes(kw));
        });

        bistNews.push(...relevant);
      } catch (e) {
        console.warn('BIST news fetch failed:', e.message);
      }
    });

    await Promise.allSettled(promises);
    bistNews = sortByDate(bistNews);

    // If empty, generate demo
    if (bistNews.length === 0) {
      generateDemoBistNews();
    }

    document.getElementById('bistnews-status').textContent = `${bistNews.length} HABER | AKTİF`;
  }

  function generateDemoBistNews() {
    const demoItems = [
      "BIST 100 endeksi 10.000 puan seviyesini test ediyor",
      "THYAO hisselerinde güçlü alım baskısı",
      "Garanti BBVA bilanço beklentileri yükseldi",
      "SPK\'dan yeni halka arz düzenlemesi",
      "EREGL çelik üretiminde rekor kırdı",
      "TUPRS rafineri marjları genişliyor",
      "ASELS savunma ihracatı sözleşmesi imzaladı",
      "SASA polyester tesisinde kapasite artırımı",
      "Borsa İstanbul\'da yabancı yatırımcı girişi hızlandı",
      "FROTO yeni model üretimine başlıyor",
    ];

    const now = Date.now();
    bistNews = demoItems.map((title, i) => ({
      title,
      link: '',
      pubDate: new Date(now - i * 2400000),
      description: '',
      source: 'BIST',
    }));

    document.getElementById('bistnews-status').textContent = `${bistNews.length} HABER | DEMO`;
  }

  function renderBistNews() {
    const body = document.getElementById('bistnews-body');
    if (!body) return;

    if (bistNews.length === 0) {
      body.innerHTML = '<div class="loading">BIST HABERLERİ BEKLENİYOR</div>';
      return;
    }

    let html = '';
    bistNews.slice(0, 20).forEach(item => {
      const hasLink = item.link && item.link !== '#' && item.link !== '';
      html += `
        <div class="news-item">
          <span class="news-source">[${item.source}]</span>
          <span class="news-time">${timeAgo(item.pubDate)}</span>
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
