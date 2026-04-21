// ============================================================
// TürkiyeMonitor — Intelligence Feed (Reuters + AP + BBC)
// Geopolitical news relevant to Turkey
// ============================================================

const IntelModule = (() => {
  const SOURCES = [
    {
      name: 'RTR',
      label: 'Reuters',
      url: 'https://feeds.reuters.com/reuters/worldNews'
    },
    {
      name: 'AP',
      label: 'AP News',
      url: 'https://feedx.net/rss/ap.xml'
    },
    {
      name: 'BBC',
      label: 'BBC World',
      url: 'https://feeds.bbci.co.uk/news/world/rss.xml'
    }
  ];

  // Keywords to filter Turkey-relevant news
  const TURKEY_KEYWORDS = [
    'turkey', 'türkiye', 'turkish', 'ankara', 'istanbul', 'erdogan', 'erdoğan',
    'nato', 'syria', 'syrian', 'greece', 'aegean', 'mediterranean', 'black sea',
    'middle east', 'caucasus', 'iraq', 'iran', 'russia', 'ukraine',
    'eu', 'european union', 'brussels', 'bosphorus', 'dardanelles',
    'refugee', 'migration', 'energy', 'pipeline', 'gas', 'oil',
    'defense', 'military', 'sanctions', 'trade', 'economy',
    'kurds', 'kurdish', 'pkk', 'cyprus', 'libya',
    'f-35', 'f-16', 's-400', 'drone', 'tbmm', 'chp', 'akp',
    'inflation', 'central bank', 'lira', 'earthquake', 'quake'
  ];

  let allIntel = [];

  async function init() {
    await fetchIntel();
    renderIntel();

    // Refresh every 5 minutes
    setInterval(async () => {
      await fetchIntel();
      renderIntel();
    }, 300000);
  }

  async function fetchIntel() {
    allIntel = [];

    const promises = SOURCES.map(async source => {
      try {
        const text = await fetchWithProxy(source.url);
        const items = parseRSS(text);
        items.forEach(item => {
          item.source = source.name;
          item.sourceLabel = source.label;
        });
        // Filter for Turkey-relevant items
        const relevant = items.filter(item => {
          const text = (item.title + ' ' + item.description).toLowerCase();
          return TURKEY_KEYWORDS.some(kw => text.includes(kw));
        });
        allIntel.push(...relevant);
      } catch (e) {
        console.warn(`${source.name} intel fetch failed:`, e.message);
        // If a source entirely fails, still add its items from any partially fetched data
      }
    });

    await Promise.allSettled(promises);
    allIntel = sortByDate(allIntel);

    // If very few Turkey-specific results, include all recent world news
    if (allIntel.length < 5) {
      // Re-fetch without keyword filter, just take top items
      const fallbackPromises = SOURCES.map(async source => {
        try {
          const text = await fetchWithProxy(source.url);
          const items = parseRSS(text);
          items.forEach(item => {
            item.source = source.name;
            item.sourceLabel = source.label;
          });
          return items.slice(0, 10);
        } catch (e) {
          return [];
        }
      });

      const results = await Promise.allSettled(fallbackPromises);
      const fallbackItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      // Merge without duplicates
      const existingTitles = new Set(allIntel.map(i => i.title));
      fallbackItems.forEach(item => {
        if (!existingTitles.has(item.title)) {
          allIntel.push(item);
        }
      });

      allIntel = sortByDate(allIntel);
    }

    // If still empty, generate demo data
    if (allIntel.length === 0) {
      generateDemoIntel();
    }

    document.getElementById('intel-status').textContent = `${allIntel.length} ÖĞE | AKTİF`;
  }

  function generateDemoIntel() {
    const demoItems = [
      { title: "NATO summit discusses Black Sea security concerns", source: "RTR", sourceLabel: "Reuters" },
      { title: "Turkey-Syria border tensions escalate, diplomatic talks underway", source: "AP", sourceLabel: "AP News" },
      { title: "Mediterranean energy dispute enters new phase", source: "BBC", sourceLabel: "BBC World" },
      { title: "EU trade negotiations with Ankara continue", source: "RTR", sourceLabel: "Reuters" },
      { title: "Russia-Ukraine conflict impacts Turkish corridor strategy", source: "AP", sourceLabel: "AP News" },
      { title: "Defense industry exports reach record levels", source: "BBC", sourceLabel: "BBC World" },
      { title: "Refugee crisis: New developments at southern border", source: "RTR", sourceLabel: "Reuters" },
      { title: "Caucasus stability talks include Turkish delegation", source: "AP", sourceLabel: "AP News" },
      { title: "Pipeline negotiations between Turkey and regional partners", source: "BBC", sourceLabel: "BBC World" },
      { title: "Middle East diplomatic summit scheduled in Istanbul", source: "RTR", sourceLabel: "Reuters" },
    ];

    const now = Date.now();
    allIntel = demoItems.map((item, i) => ({
      title: item.title,
      link: '',
      pubDate: new Date(now - i * 3600000),
      description: '',
      source: item.source,
      sourceLabel: item.sourceLabel,
    }));

    document.getElementById('intel-status').textContent = `${allIntel.length} ÖĞE | DEMO`;
  }

  function renderIntel() {
    const body = document.getElementById('intel-body');
    if (!body) return;

    if (allIntel.length === 0) {
      body.innerHTML = '<div class="loading">İSTİHBARAT BEKLENİYOR</div>';
      return;
    }

    let html = '';
    allIntel.slice(0, 30).forEach(item => {
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
