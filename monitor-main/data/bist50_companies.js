// ============================================================
// TürkiyeMonitor — BIST 50 Company Data + Facility Coordinates
// ============================================================

// SVG coordinate system: viewBox="0 0 1000 450"
// Mapping from geographic coords:
//   x = (lon - 25.5) * 51.28
//   y = (42.5 - lat) * 62.5

const BIST50_COMPANIES = [
  // --- İstanbul Based ---
  { ticker: "THYAO", name: "Türk Hava Yolları", sector: "Havacılık", facilities: [
    { city: "İstanbul", x: 175, y: 87, types: ["Genel Merkez", "Hangar", "Operasyon Merkezi"] }
  ]},
  { ticker: "GARAN", name: "Garanti BBVA", sector: "Bankacılık", facilities: [
    { city: "İstanbul", x: 178, y: 90, types: ["Genel Merkez", "Veri Merkezi"] }
  ]},
  { ticker: "AKBNK", name: "Akbank", sector: "Bankacılık", facilities: [
    { city: "İstanbul", x: 172, y: 85, types: ["Genel Merkez", "Şube Ağı"] }
  ]},
  { ticker: "YKBNK", name: "Yapı Kredi", sector: "Bankacılık", facilities: [
    { city: "İstanbul", x: 180, y: 92, types: ["Genel Merkez", "Şube Ağı"] }
  ]},
  { ticker: "ISCTR", name: "İş Bankası", sector: "Bankacılık", facilities: [
    { city: "İstanbul", x: 176, y: 88, types: ["Genel Merkez", "Şube Ağı", "Veri Merkezi"] }
  ]},
  { ticker: "KCHOL", name: "Koç Holding", sector: "Holding", facilities: [
    { city: "İstanbul", x: 183, y: 94, types: ["Genel Merkez"] }
  ]},
  { ticker: "SAHOL", name: "Sabancı Holding", sector: "Holding", facilities: [
    { city: "İstanbul", x: 170, y: 83, types: ["Genel Merkez"] }
  ]},
  { ticker: "TCELL", name: "Turkcell", sector: "Telekomünikasyon", facilities: [
    { city: "İstanbul", x: 181, y: 96, types: ["Genel Merkez", "Veri Merkezi", "Ar-Ge Merkezi"] }
  ]},
  { ticker: "BIMAS", name: "BİM Mağazalar", sector: "Perakende", facilities: [
    { city: "İstanbul", x: 185, y: 98, types: ["Genel Merkez", "Dağıtım Deposu"] }
  ]},
  { ticker: "MGROS", name: "Migros", sector: "Perakende", facilities: [
    { city: "İstanbul", x: 169, y: 82, types: ["Genel Merkez", "Dağıtım Deposu"] }
  ]},
  { ticker: "SOKM",  name: "Şok Marketler", sector: "Perakende", facilities: [
    { city: "İstanbul", x: 186, y: 100, types: ["Genel Merkez", "Dağıtım Deposu"] }
  ]},
  { ticker: "ENKAI", name: "Enka İnşaat", sector: "İnşaat", facilities: [
    { city: "İstanbul", x: 174, y: 84, types: ["Genel Merkez", "Proje Ofisi"] }
  ]},
  { ticker: "PGSUS", name: "Pegasus", sector: "Havacılık", facilities: [
    { city: "İstanbul", x: 188, y: 95, types: ["Genel Merkez", "Operasyon Merkezi"] }
  ]},
  { ticker: "TAVHL", name: "TAV Havalimanları", sector: "Havacılık", facilities: [
    { city: "İstanbul", x: 171, y: 86, types: ["Genel Merkez", "Terminal İşletme"] }
  ]},
  { ticker: "SISE",  name: "Şişe Cam", sector: "Cam/Kimya", facilities: [
    { city: "İstanbul", x: 182, y: 91, types: ["Genel Merkez", "Ar-Ge Merkezi"] },
    { city: "Mersin", x: 473, y: 370, types: ["Fabrika", "Üretim Tesisi"] }
  ]},
  { ticker: "ARCLK", name: "Arçelik", sector: "Beyaz Eşya", facilities: [
    { city: "İstanbul", x: 177, y: 89, types: ["Genel Merkez"] },
    { city: "Bolu", x: 255, y: 68, types: ["Fabrika", "Üretim Tesisi"] },
    { city: "Eskişehir", x: 258, y: 155, types: ["Fabrika", "Bulaşık Makinesi Tesisi"] }
  ]},
  { ticker: "DOHOL", name: "Doğan Holding", sector: "Holding", facilities: [
    { city: "İstanbul", x: 173, y: 93, types: ["Genel Merkez"] }
  ]},
  { ticker: "EKGYO", name: "Emlak Konut GYO", sector: "GYO", facilities: [
    { city: "İstanbul", x: 179, y: 97, types: ["Genel Merkez", "Proje Ofisi"] }
  ]},
  { ticker: "ISGYO", name: "İş GYO", sector: "GYO", facilities: [
    { city: "İstanbul", x: 184, y: 99, types: ["Genel Merkez"] }
  ]},
  { ticker: "ULKER", name: "Ülker Bisküvi", sector: "Gıda", facilities: [
    { city: "İstanbul", x: 187, y: 101, types: ["Genel Merkez", "Fabrika", "Dağıtım Deposu"] }
  ]},
  { ticker: "AEFES", name: "Anadolu Efes", sector: "İçecek", facilities: [
    { city: "İstanbul", x: 168, y: 80, types: ["Genel Merkez", "Bira Fabrikası"] }
  ]},
  { ticker: "CCOLA", name: "Coca-Cola İçecek", sector: "İçecek", facilities: [
    { city: "İstanbul", x: 190, y: 93, types: ["Genel Merkez", "Şişeleme Tesisi"] }
  ]},
  { ticker: "TKFEN", name: "Tekfen Holding", sector: "Holding", facilities: [
    { city: "İstanbul", x: 167, y: 88, types: ["Genel Merkez"] }
  ]},
  { ticker: "ALARK", name: "Alarko Holding", sector: "Holding", facilities: [
    { city: "İstanbul", x: 191, y: 86, types: ["Genel Merkez"] }
  ]},

  // --- Ankara Based ---
  { ticker: "ASELS", name: "Aselsan", sector: "Savunma", facilities: [
    { city: "Ankara", x: 350, y: 155, types: ["Genel Merkez", "Fabrika", "Ar-Ge Merkezi", "Test Tesisi"] }
  ]},
  { ticker: "HALKB", name: "Halk Bankası", sector: "Bankacılık", facilities: [
    { city: "Ankara", x: 353, y: 158, types: ["Genel Merkez", "Şube Ağı"] }
  ]},
  { ticker: "VAKBN", name: "VakıfBank", sector: "Bankacılık", facilities: [
    { city: "Ankara", x: 347, y: 152, types: ["Genel Merkez", "Şube Ağı"] }
  ]},
  { ticker: "TTKOM", name: "Türk Telekom", sector: "Telekomünikasyon", facilities: [
    { city: "Ankara", x: 356, y: 161, types: ["Genel Merkez", "Veri Merkezi", "Santral"] }
  ]},
  { ticker: "KOZAL", name: "Koza Altın", sector: "Madencilik", facilities: [
    { city: "Ankara", x: 344, y: 149, types: ["Genel Merkez", "Maden İşletmesi"] }
  ]},
  { ticker: "KOZAA", name: "Koza Anadolu Metal", sector: "Madencilik", facilities: [
    { city: "Ankara", x: 358, y: 163, types: ["Genel Merkez", "Maden İşletmesi"] }
  ]},
  { ticker: "KONTR", name: "Kontrolmatik", sector: "Teknoloji", facilities: [
    { city: "Ankara", x: 341, y: 146, types: ["Genel Merkez", "Ar-Ge Merkezi"] }
  ]},

  // --- Kocaeli / Sakarya ---
  { ticker: "TUPRS", name: "Tüpraş", sector: "Enerji", facilities: [
    { city: "Kocaeli", x: 215, y: 87, types: ["Genel Merkez", "Rafineri", "Depolama Tesisi"] },
    { city: "İzmir", x: 80, y: 225, types: ["Rafineri", "Depolama Tesisi"] }
  ]},
  { ticker: "FROTO", name: "Ford Otosan", sector: "Otomotiv", facilities: [
    { city: "Kocaeli", x: 218, y: 90, types: ["Genel Merkez", "Otomobil Fabrikası"] },
    { city: "Eskişehir", x: 258, y: 155, types: ["Motor Fabrikası"] }
  ]},
  { ticker: "OTKAR", name: "Otokar", sector: "Otomotiv", facilities: [
    { city: "Sakarya", x: 240, y: 80, types: ["Genel Merkez", "Zırhlı Araç Fabrikası", "Otobüs Fabrikası"] }
  ]},

  // --- Bursa ---
  { ticker: "TOASO", name: "Tofaş Oto", sector: "Otomotiv", facilities: [
    { city: "Bursa", x: 205, y: 130, types: ["Genel Merkez", "Otomobil Fabrikası", "Test Pisti"] }
  ]},
  { ticker: "OYAKC", name: "Oyak Çimento", sector: "Çimento", facilities: [
    { city: "Bolu", x: 255, y: 68, types: ["Çimento Fabrikası", "Taş Ocağı"] }
  ]},

  // --- İzmir / Ege ---
  { ticker: "PETKM", name: "Petkim", sector: "Petrokimya", facilities: [
    { city: "İzmir", x: 85, y: 215, types: ["Genel Merkez", "Petrokimya Tesisi", "Liman"] }
  ]},
  { ticker: "VESTL", name: "Vestel", sector: "Elektronik", facilities: [
    { city: "Manisa", x: 112, y: 218, types: ["Genel Merkez", "Elektronik Fabrikası", "Beyaz Eşya Fabrikası", "Ar-Ge Merkezi"] }
  ]},
  { ticker: "EGEEN", name: "Ege Endüstri", sector: "Otomotiv Yedek Parça", facilities: [
    { city: "İzmir", x: 78, y: 228, types: ["Genel Merkez", "Fabrika"] }
  ]},

  // --- Güney ---
  { ticker: "SASA",  name: "SASA Polyester", sector: "Petrokimya", facilities: [
    { city: "Adana", x: 500, y: 310, types: ["Genel Merkez", "Polyester Fabrikası", "Elyaf Tesisi"] }
  ]},
  { ticker: "CIMSA", name: "Çimsa Çimento", sector: "Çimento", facilities: [
    { city: "Mersin", x: 468, y: 365, types: ["Genel Merkez", "Çimento Fabrikası", "Klinker Tesisi"] }
  ]},

  // --- Kuzey / Karadeniz ---
  { ticker: "EREGL", name: "Ereğli Demir Çelik", sector: "Demir/Çelik", facilities: [
    { city: "Zonguldak", x: 310, y: 50, types: ["Genel Merkez", "Demir Çelik Fabrikası", "Liman", "Enerji Santrali"] }
  ]},
  { ticker: "KRDMD", name: "Kardemir", sector: "Demir/Çelik", facilities: [
    { city: "Karabük", x: 295, y: 58, types: ["Genel Merkez", "Demir Çelik Fabrikası", "Haddehane"] }
  ]},

  // --- Diğer ---
  { ticker: "AKSEN", name: "Aksa Enerji", sector: "Enerji", facilities: [
    { city: "İstanbul", x: 192, y: 91, types: ["Genel Merkez", "Enerji Santrali"] }
  ]},
  { ticker: "AKSA",  name: "Aksa Akrilik", sector: "Kimya", facilities: [
    { city: "Yalova", x: 207, y: 110, types: ["Fabrika", "Akrilik Elyaf Tesisi"] }
  ]},
  { ticker: "HEKTS", name: "Hektaş", sector: "Tarım Kimya", facilities: [
    { city: "İstanbul", x: 165, y: 84, types: ["Genel Merkez"] },
  ]},
  { ticker: "GUBRF", name: "Gübre Fabrikaları", sector: "Kimya", facilities: [
    { city: "İstanbul", x: 193, y: 88, types: ["Genel Merkez"] },
    { city: "Kocaeli", x: 220, y: 92, types: ["Gübre Fabrikası", "Depolama Tesisi"] }
  ]},
  { ticker: "ODAS",  name: "Odaş Elektrik", sector: "Enerji", facilities: [
    { city: "İstanbul", x: 166, y: 86, types: ["Genel Merkez", "Enerji Santrali"] }
  ]},
  { ticker: "GESAN", name: "Gesan Elektrik", sector: "Enerji", facilities: [
    { city: "Ankara", x: 360, y: 165, types: ["Genel Merkez", "Enerji Santrali"] }
  ]},
  { ticker: "BRYAT", name: "Borusan Yatırım", sector: "Holding", facilities: [
    { city: "İstanbul", x: 194, y: 95, types: ["Genel Merkez"] }
  ]},
];

// Major cities for the map background dots
const TURKEY_CITIES = [
  { name: "İstanbul",     x: 180, y: 90 },
  { name: "Ankara",       x: 350, y: 155 },
  { name: "İzmir",        x: 80,  y: 225 },
  { name: "Bursa",        x: 205, y: 130 },
  { name: "Antalya",      x: 270, y: 310 },
  { name: "Adana",        x: 500, y: 310 },
  { name: "Konya",        x: 350, y: 250 },
  { name: "Gaziantep",    x: 575, y: 310 },
  { name: "Mersin",       x: 468, y: 365 },
  { name: "Kayseri",      x: 430, y: 208 },
  { name: "Eskişehir",    x: 258, y: 155 },
  { name: "Trabzon",      x: 738, y: 82 },
  { name: "Samsun",       x: 560, y: 67 },
  { name: "Diyarbakır",   x: 740, y: 250 },
  { name: "Erzurum",      x: 765, y: 150 },
  { name: "Malatya",      x: 615, y: 220 },
  { name: "Van",          x: 870, y: 218 },
  { name: "Kocaeli",      x: 215, y: 87 },
  { name: "Sakarya",      x: 240, y: 80 },
  { name: "Denizli",      x: 183, y: 275 },
  { name: "Şanlıurfa",    x: 660, y: 300 },
  { name: "Mardin",       x: 740, y: 300 },
  { name: "Edirne",       x: 40,  y: 50 },
  { name: "Çanakkale",    x: 75,  y: 140 },
  { name: "Manisa",       x: 112, y: 218 },
  { name: "Sivas",        x: 530, y: 170 },
  { name: "Kars",         x: 860, y: 125 },
  { name: "Hatay",        x: 550, y: 380 },
  { name: "Zonguldak",    x: 310, y: 50 },
  { name: "Karabük",      x: 295, y: 58 },
  { name: "Bolu",         x: 255, y: 68 },
  { name: "Rize",         x: 780, y: 70 },
  { name: "Artvin",       x: 810, y: 60 },
  { name: "Muğla",        x: 130, y: 290 },
];

// Turkey outline polygon (simplified SVG coordinates)
const TURKEY_OUTLINE = [
  // Thrace (NW)
  [31, 25], [40, 18], [60, 15], [82, 22], [95, 35],
  [110, 55], [130, 68], [155, 78], [170, 72],
  // Bosphorus area → Asian side
  [185, 75], [200, 68], [210, 60],
  // Black Sea coast going east
  [235, 50], [260, 42], [290, 38], [310, 40], [330, 48],
  [360, 38], [395, 30], [420, 24], [450, 18], [475, 15],
  [497, 12], [515, 18], [530, 30], [545, 45], [560, 55],
  [580, 62], [600, 68], [625, 72], [650, 75], [680, 78],
  [710, 80], [738, 78], [760, 72], [780, 68], [800, 62],
  [820, 58], [835, 60],
  // NE corner → Eastern border going south
  [850, 68], [865, 80], [880, 95], [900, 110],
  [920, 128], [935, 148], [948, 168], [955, 185],
  [952, 200], [945, 218], [940, 235], [945, 255],
  [950, 275], [955, 295], [950, 310],
  // SE border going west (Syria/Iraq)
  [935, 318], [915, 325], [895, 330], [875, 335],
  [855, 330], [835, 325], [818, 330], [800, 338],
  [780, 342], [758, 345], [735, 348], [710, 350],
  [688, 348], [665, 345], [640, 340], [618, 338],
  [595, 340], [578, 348], [565, 358],
  // Hatay peninsula
  [555, 370], [548, 385], [540, 400], [532, 410],
  [525, 398], [528, 382], [530, 370],
  // Mediterranean coast going west
  [510, 365], [490, 368], [470, 372], [450, 375],
  [430, 378], [408, 380], [388, 375], [365, 368],
  [340, 362], [315, 358], [290, 355], [268, 352],
  [248, 348], [228, 345], [208, 348], [188, 352],
  [168, 355], [148, 358], [130, 352], [115, 345],
  // Aegean coast going north (jagged)
  [105, 338], [98, 325], [88, 310], [82, 298],
  [78, 285], [82, 270], [75, 258], [68, 245],
  [62, 232], [65, 218], [60, 205], [55, 192],
  [50, 180], [48, 168], [52, 155], [48, 142],
  [42, 130], [38, 118],
  // Back to Thrace
  [35, 108], [40, 95], [45, 82], [38, 68],
  [32, 55], [28, 42], [31, 25]
];

// GCC Investments Data (Mock)
const GCC_INVESTMENTS = [
  { name: "Katar Yatırım Otoritesi (QIA)", type: "Finans Merkezi", city: "İstanbul", x: 190, y: 105, info: "Finans ve Liman İşletmeciliği, $20B" },
  { name: "BAE Varlık Fonu (ADQ)", type: "Enerji/Liman", city: "Mersin", x: 480, y: 380, info: "Liman Altyapısı ve Yenilenebilir Enerji, $15B" },
  { name: "Suudi Arabistan Kamu Yatırım Fonu (PIF)", type: "Savunma/Teknoloji", city: "Ankara", x: 340, y: 165, info: "Yapay Zeka ve Savunma Sanayi Yatırımları, $5B" },
  { name: "Kuveyt Yatırım Otoritesi (KIA)", type: "Turizm/Gayrimenkul", city: "Antalya", x: 260, y: 330, info: "Kıyı Şeridi Turizm Projeleri, $3B" }
];
