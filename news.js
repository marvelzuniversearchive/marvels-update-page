(() => {
  "use strict";
  const style = document.createElement("style");
  style.textContent = `
    [data-marvel-news]{margin-top:4px}
    .mnews-page{padding:24px 0 48px;color:var(--paper,#f4f1ec)}
    .mnews-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:22px;flex-wrap:wrap;margin-bottom:22px}
    .mnews-heading h1{font:900 clamp(34px,5vw,58px)/.95 'Barlow Condensed',sans-serif;margin:9px 0}
    .mnews-heading h1 span{color:var(--red,#e63946)}
    .mnews-heading p{max-width:650px;color:#aeb8c8;font-size:12px;line-height:1.7}
    .mnews-live{display:grid;grid-template-columns:10px auto;align-items:center;column-gap:8px;padding:10px 13px;border:1px solid #7be0b344;border-radius:13px;background:#7be0b30d;font-size:10px;letter-spacing:1.4px}
    .mnews-live i{width:7px;height:7px;border-radius:50%;background:#7be0b3;box-shadow:0 0 12px #7be0b3}
    .mnews-live small{grid-column:2;color:#9da8bb;font-size:9px;letter-spacing:0;margin-top:3px}
    .mnews-toolbar{display:grid;grid-template-columns:minmax(180px,1fr) auto auto;gap:9px;margin:20px 0 14px}
    .mnews-toolbar input,.mnews-toolbar select{min-height:42px;min-width:0;border:1px solid var(--line);border-radius:10px;background:#111827;color:#f4f1ec;padding:0 12px;font-size:11px}
    .mnews-filters{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0 18px}
    .mnews-filters button,.mnews-back{border:1px solid var(--line);background:rgba(255,255,255,.055);color:#bac4d4;border-radius:99px;padding:8px 12px;font-size:10px;cursor:pointer}
    .mnews-filters button.active{background:linear-gradient(110deg,var(--red,#e63946),#ad284b);border-color:transparent;color:white}
    .mnews-count,.mnews-footnote{font-size:10px;color:#96a2b6}
    .mnews-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}\n    .mnews-card{min-width:0;overflow:hidden;border:1px solid var(--line);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.025))}
    .mnews-card.featured{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);margin-bottom:15px}
    .mnews-image{height:170px;display:grid;place-items:center;position:relative;overflow:hidden;background:radial-gradient(circle at 75% 25%,rgba(230,57,70,.38),transparent 35%),linear-gradient(135deg,#171d34,#351c39 60%,#151d2b);text-decoration:none}
    .featured .mnews-image{height:100%;min-height:270px}
    .mnews-image img{width:100%;height:100%;object-fit:cover}
    .mnews-comic-poster{width:100%;height:100%;min-height:170px;display:block;position:relative;overflow:hidden;background:#15152a}
    .mnews-comic-poster svg{display:block;width:100%;height:100%;min-height:170px}
    .mnews-comic-poster:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 42%,rgba(255,255,255,.13) 42.3%,transparent 43%),radial-gradient(circle at 18% 15%,rgba(255,255,255,.2),transparent 28%);mix-blend-mode:screen}
    .mnews-art-caption{position:absolute;left:13px;bottom:12px;padding:5px 8px;background:#101522df;border:1px solid #ffffff55;color:#fff;font:800 9px 'Barlow Condensed',sans-serif;letter-spacing:1.7px;transform:rotate(-2deg)}
    .mnews-status{position:absolute;left:12px;top:12px;padding:6px 8px;border-radius:7px;background:#101522e8;border:1px solid #ffffff2b;color:#f2f4f8;font-size:8px;font-weight:800;letter-spacing:1px}
    .mnews-status.official{color:#a9f5cf;border-color:#7be0b366}.mnews-status.rumour{color:#ffd99a;border-color:#ffc85766}
    .mnews-card-body{padding:16px;display:flex;flex-direction:column;min-width:0}
    .mnews-meta{display:flex;justify-content:space-between;gap:8px;color:#91a0b8;font-size:9px}
    .mnews-card h2{font:700 21px/1.12 'Barlow Condensed',sans-serif;margin:13px 0 8px}
    .featured h2{font-size:clamp(25px,3vw,36px)}
    .mnews-card h2 button{padding:0;text-align:left;color:#f4f1ec;background:none;border:0;font:inherit;cursor:pointer}
    .mnews-card h2 button:hover{color:#ff9ca4}
    .mnews-card p{font-size:11px;line-height:1.65;color:#aeb8c8;margin:0 0 18px}
    .mnews-card-bottom{margin-top:auto;display:flex;justify-content:space-between;gap:8px;align-items:center;color:#8e9bb0;font-size:9px}
    .mnews-card-bottom button{color:#ff9da5;background:none;border:0;text-decoration:none;font-weight:800;letter-spacing:.7px;cursor:pointer}
    .mnews-empty,.mnews-feature-placeholder{padding:30px;border:1px dashed var(--line);border-radius:16px;text-align:center;color:#aab4c6}
    .mnews-empty strong{color:#f4f1ec;font:700 22px 'Barlow Condensed'}
    .mnews-empty p{font-size:11px}
    .mnews-footnote{margin-top:22px;line-height:1.6}
    .mnews-detail{color:#f5f7ff;border:1px solid #35415b;border-radius:18px;padding:clamp(18px,3vw,32px);background:radial-gradient(circle at 92% 0%,rgba(55,91,234,.13),transparent 34%),linear-gradient(145deg,#0b1220,#080d17 72%);box-shadow:0 24px 70px rgba(0,0,0,.28)}
    .mnews-detail h2{color:#fff;font:800 clamp(28px,4vw,46px)/1.05 'Barlow Condensed',sans-serif;margin:15px 0}
    .mnews-detail .summary{font-size:14px;line-height:1.9;color:#e1e8f5;max-width:850px}
    .mnews-detail .eyebrow{color:#ff9ca4}
    .mnews-detail .mnews-meta{color:#b8c4d8}
    .mnews-detail img,.mnews-detail .mnews-comic-poster{width:100%;max-height:430px;object-fit:cover;border-radius:12px;margin:18px 0;overflow:hidden}
    .mnews-detail .mnews-comic-poster{height:300px}
    .mnews-detail .mnews-comic-poster svg{height:300px}
    .mnews-detail .mnews-footnote{color:#aebbd0}
    .mnews-detail .mnews-detail-actions a{background:#d83245}
    .mnews-detail .mnews-detail-actions button{background:#172235;color:#f5f7ff;border-color:#46536b}
    .mnews-detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
    .mnews-detail-actions a{display:inline-flex;align-items:center;padding:11px 15px;border-radius:9px;background:#e63946;color:white;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:1px}
    .mnews-detail-actions button{border:1px solid var(--line);background:#ffffff0b;color:#eee;border-radius:9px;padding:11px 15px;font-size:10px;cursor:pointer}
    .mnews-series-spotlight{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;margin:18px 0;padding:20px 22px;border:1px solid #e6394655;border-radius:16px;background:linear-gradient(115deg,#191c30,#111827)}
    .mnews-series-spotlight .eyebrow{color:#ff9ca4;font-size:9px;letter-spacing:1.8px;font-weight:900}
    .mnews-series-spotlight h2{margin:7px 0 5px;color:#fff;font-size:clamp(23px,3vw,34px);font-weight:900}
    .mnews-series-spotlight p{margin:0;color:#b8c4d6;font-size:11px;line-height:1.6;max-width:650px}
    .mnews-series-spotlight button{border:1px solid #ff7b89;background:#e63946;color:#fff;border-radius:9px;padding:11px 14px;font-size:9px;font-weight:900;letter-spacing:1px;cursor:pointer}
    .mnews-state{padding:12px 14px;border:1px solid #ffc85744;border-radius:10px;background:#ffc8570b;color:#e6d2a4;font-size:10px;margin:14px 0}
    @media(max-width:900px){.mnews-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mnews-card.featured{grid-template-columns:1fr}.featured .mnews-image{min-height:190px}}
    @media(max-width:650px){.mnews-toolbar{grid-template-columns:1fr 1fr}.mnews-toolbar input{grid-column:1/-1}.mnews-heading{align-items:flex-start}}
    @media(max-width:560px){.mnews-grid{grid-template-columns:1fr}.mnews-filters button{padding:7px 9px}.mnews-card.featured{display:block}}
  `;
  document.head.appendChild(style);

  const FEED_URL = "news-feed.json";
  const categories = ["all","series_spotlight","ratings","official","movies","tv","comics","trailers","casting","games","events","announcements"];
  const labels = {all:"All news",series_spotlight:"Series Spotlight",ratings:"IMDb & Rotten Tomatoes",official:"Official",movies:"Movies",tv:"TV",comics:"Comics",trailers:"Trailers",casting:"Casting",games:"Games",events:"Events",announcements:"Announcements"};
  let articles = [], filter = "all", query = "", order = "newest", active = false, selected = null, timer = null, lastError = false, featuredSeries = null;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const safeUrl = value => { try { const u = new URL(value, location.href); return /^https?:$/.test(u.protocol) ? esc(u.href) : "#"; } catch { return "#"; } };
  const date = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? "Date unavailable" : d.toLocaleString(); };
  const status = item => item.status === "official" ? "OFFICIAL" : item.status === "rumour" ? "RUMOUR" : "REPORTED";

  function addNavigation() {
    const nav = document.querySelector(".sidebar .nav");
    if (!nav || document.querySelector("[data-marvel-news]")) return;
    const button = document.createElement("button");
    button.type = "button"; button.dataset.marvelNews = "true";
    button.innerHTML = '<span class="ico">◈</span>Marvel News';
    nav.insertBefore(button, nav.children[1] || null);
  }
  function setActive(value) {
    active = value;
    document.body.classList.toggle("marvel-news-night", value);
    const button = document.querySelector("[data-marvel-news]");
    if (button) button.classList.toggle("active", value);
    if (value) {
      document.querySelectorAll("[data-view]").forEach(el => el.classList.remove("active"));
      const crumb = document.getElementById("crumbName");
      if (crumb) crumb.textContent = "MARVEL NEWS";
    }
    if (timer) clearInterval(timer);
    timer = value ? setInterval(() => { if (!document.hidden && active) loadFeed(); }, 60000) : null;
  }
  function filtered() {
    let rows = articles.filter(a => {
      const hay = [a.title,a.summary,a.source,a.category,...(a.tags || []),...(a.coverage_tags || [])].join(" ").toLowerCase();
      const matchesQuery = !query || hay.includes(query.toLowerCase());
      const coverage = (a.coverage_tags || []).map(tag => String(tag).toLowerCase());
      const matchesFilter = filter === "all" || (filter === "official" ? a.status === "official" : filter === "series_spotlight" ? !!featuredSeries && coverage.includes(("series: " + featuredSeries.name).toLowerCase()) : filter === "ratings" ? coverage.includes("ratings & reviews") || coverage.includes("imdb") || coverage.includes("rotten tomatoes") : String(a.category || "").toLowerCase() === filter);
      return matchesQuery && matchesFilter;
    });
    rows.sort((a,b) => (new Date(a.published_at)-new Date(b.published_at)) * (order === "oldest" ? 1 : -1));
    return rows;
  }
  function comicArt(item) {
    const title = String(item.title || "Marvel News");
    let hash = 0;
    for (let i=0;i<title.length;i++) hash = (hash*31 + title.charCodeAt(i)) >>> 0;
    const palettes = [
      ["#ffb33f","#ef3e68","#552b91"],["#36d5d0","#2765bd","#f05b8d"],
      ["#f6cf4a","#ed5b35","#51318d"],["#9e72ef","#ed477d","#243e83"]
    ];
    const p = palettes[hash % palettes.length];
    const label = esc(title.length > 48 ? title.slice(0,45) + "…" : title);
    return '<div class="mnews-comic-poster" role="img" aria-label="Illustrated comic-book news artwork">' +
      '<svg viewBox="0 0 720 380" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="cg'+hash+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+p[0]+'"/><stop offset=".52" stop-color="'+p[1]+'"/><stop offset="1" stop-color="'+p[2]+'"/></linearGradient>' +
      '<pattern id="dots'+hash+'" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.7" fill="#120d28" opacity=".65"/></pattern>' +
      '<filter id="shadow'+hash+'" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="9" dy="10" stdDeviation="0" flood-color="#100b22" flood-opacity=".85"/></filter></defs>' +
      '<path fill="url(#cg'+hash+')" d="M0 0H720V380H0Z"/><path fill="url(#dots'+hash+')" d="M0 0H720V380H0Z"/>' +
      '<path d="M-20 300L130 190 195 245 300 120 390 218 500 145 750 305V400H-20Z" fill="#17152e" stroke="#09091a" stroke-width="9"/>' +
      '<path d="M25 285V210H82V270M110 260V170H158V235M470 240V150H520V220M555 265V105H615V250M640 270V185H690V285" fill="#27335c" stroke="#09091a" stroke-width="8"/>' +
      '<path d="M34 228h38m-38 18h38m-38 18h38M565 130h38m-38 18h38m-38 18h38m-38 18h38" stroke="'+p[0]+'" stroke-width="5"/>' +
      '<g filter="url(#shadow'+hash+')"><path d="M282 380l22-96-32-43 25-52 63-24 66 34 21 58-37 42 22 81Z" fill="#17152e" stroke="#09091a" stroke-width="12"/>' +
      '<path d="M320 188q38-47 78-4l18 39-35 29-54-8-24-26Z" fill="'+p[0]+'" stroke="#09091a" stroke-width="10"/>' +
      '<path d="M323 222l24 8m37-9l23-9" stroke="#fff" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M295 284l-78 42m204-44l75 33" stroke="#17152e" stroke-width="24" stroke-linecap="round"/>' +
      '<path d="M290 280l-78 42m210-40l75 31" stroke="#09091a" stroke-width="10" stroke-linecap="round"/></g>' +
      '<path d="M30 45L185 18M8 78L158 52M525 35L690 8M540 68L710 42" stroke="#fff" stroke-width="8" opacity=".65"/>' +
      '<path d="M0 0H720V380H0Z" fill="none" stroke="#09091a" stroke-width="14"/>' +
      '<text x="28" y="350" fill="#fff" font-family="Arial Black,sans-serif" font-size="22" font-weight="900" stroke="#09091a" stroke-width="4" paint-order="stroke">'+label+'</text></svg>' +
      '<span class="mnews-art-caption">COMIC-BOOK ART · EDITORIAL ILLUSTRATION</span></div>';
  }
  function synopsis(item) {
    const raw = String(item.summary || "").trim();
    const title = String(item.title || "").trim();
    const compact = raw.toLowerCase().replace(/[^a-z0-9]/g,"");
    const titleKey = title.toLowerCase().replace(/[^a-z0-9]/g,"");
    if (!raw || compact === titleKey || compact.startsWith(titleKey)) {
      return "The headline reports: " + title + ". The feed does not yet contain enough publisher-provided detail to write a reliable fuller synopsis. Open the credited source for the complete context.";
    }
    return raw;
  }

  function card(item, featured) {
    const img = item.image_url ? '<img src="' + safeUrl(item.image_url) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : comicArt(item);
    return '<article class="mnews-card ' + (featured ? "featured" : "") + '">' +
      '<button class="mnews-image" type="button" data-news-open="' + esc(item.id) + '">' + img +
      '<span class="mnews-status ' + esc(status(item).toLowerCase()) + '">' + status(item) + '</span></button>' +
      '<div class="mnews-card-body"><div class="mnews-meta"><span>' + esc(item.category || "Marvel") + '</span><span>' + esc(item.source || "Publisher") + '</span></div>' +
      '<h2><button type="button" data-news-open="' + esc(item.id) + '">' + esc(item.title) + '</button></h2>' +
      '<p>' + esc(synopsis(item)) + '</p>' +
      '<div class="mnews-card-bottom"><time>' + esc(date(item.published_at)) + '</time><button type="button" data-news-open="' + esc(item.id) + '">READ STORY ↗</button></div></div></article>';
  }
  function render() {
    const content = document.getElementById("content");
    if (!content || !active) return;
    const rows = filtered();
    const updated = window.marvelNewsGeneratedAt ? "Feed last updated " + date(window.marvelNewsGeneratedAt) : "Waiting for first sync";
    const controls = '<div class="mnews-toolbar"><input id="mnewsSearch" type="search" placeholder="Search Marvel headlines, characters or publishers…" value="' + esc(query) + '" aria-label="Search Marvel news">' +
      '<select id="mnewsSort" aria-label="Sort news"><option value="newest"' + (order === "newest" ? " selected" : "") + '>Newest first</option><option value="oldest"' + (order === "oldest" ? " selected" : "") + '>Oldest first</option></select>' +
      '<span class="mnews-count">' + rows.length + ' of ' + articles.length + ' stories</span></div>';
    const filters = '<div class="mnews-filters">' + categories.map(c => '<button type="button" data-news-filter="' + c + '" class="' + (filter === c ? "active" : "") + '">' + (c === "series_spotlight" && featuredSeries ? (featuredSeries.status === "airing" ? "Now Airing: " : "Next Series: ") + featuredSeries.name : labels[c]) + '</button>').join("") + '</div>';
    const banner = lastError ? '<div class="mnews-state">The latest source check failed. Showing the last successfully saved headlines; automatic retries continue.</div>' : '';
    if (selected) {
      const item = articles.find(a => a.id === selected);
      if (item) {
        content.innerHTML = '<section class="mnews-page" data-marvel-news-content><button type="button" class="mnews-back" data-news-back>← BACK TO NEWS</button>' +
          '<div class="mnews-detail"><div class="eyebrow">' + esc(item.category || "MARVEL") + ' · ' + esc(status(item)) + '</div>' +
          '<h2>' + esc(item.title) + '</h2><div class="mnews-meta"><span>' + esc(item.source || "Publisher") + '</span><time>' + esc(date(item.published_at)) + '</time></div>' +
          (item.image_url ? '<img src="' + safeUrl(item.image_url) + '" alt="" referrerpolicy="no-referrer">' : comicArt(item)) +
          '<div class="eyebrow" style="margin-top:18px">STORY SYNOPSIS</div>' +
          '<p class="summary">' + esc(synopsis(item)) + '</p>' +
          (Array.isArray(item.related_characters) && item.related_characters.length ? '<div class="mnews-meta" style="justify-content:flex-start;flex-wrap:wrap;margin-top:12px"><strong>RELATED:</strong> ' + item.related_characters.map(esc).join(' · ') + '</div>' : '') +
          '<div class="mnews-detail-actions"><a href="' + safeUrl(item.article_url) + '" target="_blank" rel="noopener noreferrer">OPEN ORIGINAL STORY ↗</a><button type="button" data-news-back>BACK TO NEWS</button></div>' +
          '<p class="mnews-footnote">This archive displays a short factual preview and links to the original publisher. The publisher retains ownership of its reporting and media.</p></div></section>';
        return;
      }
      selected = null;
    }
    content.innerHTML = '<section class="mnews-page" data-marvel-news-content>' +
      '<div class="mnews-heading"><div><div class="eyebrow">MARVEL UNIVERSE · NEWSROOM</div><h1>Marvel <span>News</span></h1><p>Marvel headlines, official announcements and coverage from established publishers — collected, organised and refreshed automatically.</p></div>' +
      '<div class="mnews-live"><i></i><span>LIVE NEWS SYSTEM</span><small id="mnewsUpdated">' + esc(updated) + '</small></div></div>' + banner + controls + filters +
      (featuredSeries ? '<section class="mnews-series-spotlight"><div><div class="eyebrow">' + (featuredSeries.status === "airing" ? "CURRENTLY AIRING · SERIES SPOTLIGHT" : "UP NEXT · SERIES SPOTLIGHT") + '</div><h2>' + esc(featuredSeries.name) + '</h2><p>' + esc(featuredSeries.description || "Latest news, episode coverage and updates for this Marvel series.") + (featuredSeries.status === "airing" ? " · Finale: " + esc(featuredSeries.finale || "Date to be announced") : " · Premiere: " + esc(featuredSeries.premiere)) + '</p></div><button type="button" data-news-filter="series_spotlight">EXPLORE SERIES COVERAGE ↗</button></section>' : '') +
      (rows.length ? card(rows[0], true) + '<div class="mnews-grid">' + rows.slice(1).map(a => card(a,false)).join("") + '</div>' :
      '<div class="mnews-empty"><strong>' + (articles.length ? "No stories match those filters." : "No Marvel stories are available yet.") + '</strong><p>Try another category or check again shortly.</p></div>') +
      '<div class="mnews-footnote">The feed checks sources every 15 minutes. This page also refreshes its displayed feed while open. Official announcements, reported coverage and rumours are labelled separately.</div></section>';
  }
  async function loadFeed() {
    try {
      const response = await fetch(FEED_URL + "?t=" + Date.now(), {cache:"no-store"});
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (!data || !Array.isArray(data.articles)) throw new Error("Invalid feed format");
      articles = data.articles;
      featuredSeries = data.featured_series || null;
      window.marvelNewsFeaturedSeries = featuredSeries;
      window.marvelNewsGeneratedAt = data.generated_at || "";
      lastError = false;
      render();
    } catch (error) {
      lastError = true;
      render();
    }
  }
  document.addEventListener("click", event => {
    const target = event.target.closest("[data-marvel-news]");
    if (target) {
      event.preventDefault(); event.stopImmediatePropagation();
      selected = null; setActive(true); render(); loadFeed(); return;
    }
    if (event.target.closest("[data-view]")) setActive(false);
    if (!active) return;
    if (event.target.closest("[data-marvel-news-content]")) event.stopImmediatePropagation();
    const filterButton = event.target.closest("[data-news-filter]");
    if (filterButton) { filter = filterButton.dataset.newsFilter; render(); return; }
    const open = event.target.closest("[data-news-open]");
    if (open) { selected = open.dataset.newsOpen; render(); return; }
    if (event.target.closest("[data-news-back]")) { selected = null; render(); }
  }, true);
  document.addEventListener("input", event => {
    if (event.target && event.target.id === "mnewsSearch" && active) {
      const pos = event.target.selectionStart;
      query = event.target.value;
      render();
      const next = document.getElementById("mnewsSearch");
      if (next) { next.focus(); next.setSelectionRange(pos,pos); }
    }
  });
  document.addEventListener("change", event => {
    if (event.target && event.target.id === "mnewsSort" && active) { order = event.target.value; render(); }
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && active) loadFeed(); });
  new MutationObserver(addNavigation).observe(document.documentElement,{childList:true,subtree:true});
  addNavigation();
})();