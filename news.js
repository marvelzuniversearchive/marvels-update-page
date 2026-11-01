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
    .mnews-card{min-width:0;overflow:hidden;border:1px solid var(--line);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.025))}
    .mnews-card.featured{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);margin-bottom:15px}
    .mnews-image{height:170px;display:grid;place-items:center;position:relative;overflow:hidden;background:radial-gradient(circle at 75% 25%,rgba(230,57,70,.38),transparent 35%),linear-gradient(135deg,#171d34,#351c39 60%,#151d2b);text-decoration:none}
    .featured .mnews-image{height:100%;min-height:270px}
    .mnews-image img{width:100%;height:100%;object-fit:cover}
    .mnews-art-fallback{display:flex;flex-direction:column;align-items:center;gap:2px;color:#ffffff35;font:900 42px 'Barlow Condensed',sans-serif;letter-spacing:2px}
    .mnews-art-fallback b{font-size:14px;letter-spacing:5px;color:#e6394680}
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
    .mnews-detail{border:1px solid var(--line);border-radius:18px;padding:clamp(18px,3vw,32px);background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.02))}
    .mnews-detail h2{font:800 clamp(28px,4vw,46px)/1.05 'Barlow Condensed',sans-serif;margin:15px 0}
    .mnews-detail .summary{font-size:14px;line-height:1.85;color:#c1cad7;max-width:850px}
    .mnews-detail img{width:100%;max-height:430px;object-fit:cover;border-radius:12px;margin:18px 0}
    .mnews-detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
    .mnews-detail-actions a{display:inline-flex;align-items:center;padding:11px 15px;border-radius:9px;background:#e63946;color:white;text-decoration:none;font-size:10px;font-weight:800;letter-spacing:1px}
    .mnews-detail-actions button{border:1px solid var(--line);background:#ffffff0b;color:#eee;border-radius:9px;padding:11px 15px;font-size:10px;cursor:pointer}
    .mnews-state{padding:12px 14px;border:1px solid #ffc85744;border-radius:10px;background:#ffc8570b;color:#e6d2a4;font-size:10px;margin:14px 0}
    @media(max-width:900px){.mnews-card.featured{grid-template-columns:1fr}.featured .mnews-image{min-height:190px}}
    @media(max-width:650px){.mnews-toolbar{grid-template-columns:1fr 1fr}.mnews-toolbar input{grid-column:1/-1}.mnews-heading{align-items:flex-start}}
    @media(max-width:560px){.mnews-filters button{padding:7px 9px}.mnews-card.featured{display:block}}
  `;
  document.head.appendChild(style);

  const FEED_URL = "news-feed.json";
  const categories = ["all","official","movies","tv","comics","trailers","casting","games","events","announcements"];
  const labels = {all:"All news",official:"Official",movies:"Movies",tv:"TV",comics:"Comics",trailers:"Trailers",casting:"Casting",games:"Games",events:"Events",announcements:"Announcements"};
  let articles = [], filter = "all", query = "", order = "newest", active = false, selected = null, timer = null, lastError = false;

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
      const hay = [a.title,a.summary,a.source,a.category,...(a.tags || [])].join(" ").toLowerCase();
      const matchesQuery = !query || hay.includes(query.toLowerCase());
      const matchesFilter = filter === "all" || (filter === "official" ? a.status === "official" : String(a.category || "").toLowerCase() === filter);
      return matchesQuery && matchesFilter;
    });
    rows.sort((a,b) => (new Date(a.published_at)-new Date(b.published_at)) * (order === "oldest" ? 1 : -1));
    return rows;
  }
  function card(item, featured) {
    const img = item.image_url ? '<img src="' + safeUrl(item.image_url) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<div class="mnews-art-fallback"><span>MARVEL</span><b>NEWSWIRE</b></div>';
    return '<article class="mnews-card ' + (featured ? "featured" : "") + '">' +
      '<button class="mnews-image" type="button" data-news-open="' + esc(item.id) + '">' + img +
      '<span class="mnews-status ' + esc(status(item).toLowerCase()) + '">' + status(item) + '</span></button>' +
      '<div class="mnews-card-body"><div class="mnews-meta"><span>' + esc(item.category || "Marvel") + '</span><span>' + esc(item.source || "Publisher") + '</span></div>' +
      '<h2><button type="button" data-news-open="' + esc(item.id) + '">' + esc(item.title) + '</button></h2>' +
      '<p>' + esc(item.summary || "Open the original publisher for the complete report.") + '</p>' +
      '<div class="mnews-card-bottom"><time>' + esc(date(item.published_at)) + '</time><button type="button" data-news-open="' + esc(item.id) + '">READ STORY ↗</button></div></div></article>';
  }
  function render() {
    const content = document.getElementById("content");
    if (!content || !active) return;
    const rows = filtered();
    const updated = window.marvelNewsGeneratedAt ? "Feed checked " + date(window.marvelNewsGeneratedAt) : "Waiting for first sync";
    const controls = '<div class="mnews-toolbar"><input id="mnewsSearch" type="search" placeholder="Search Marvel headlines, characters or publishers…" value="' + esc(query) + '" aria-label="Search Marvel news">' +
      '<select id="mnewsSort" aria-label="Sort news"><option value="newest"' + (order === "newest" ? " selected" : "") + '>Newest first</option><option value="oldest"' + (order === "oldest" ? " selected" : "") + '>Oldest first</option></select>' +
      '<span class="mnews-count">' + rows.length + ' of ' + articles.length + ' stories</span></div>';
    const filters = '<div class="mnews-filters">' + categories.map(c => '<button type="button" data-news-filter="' + c + '" class="' + (filter === c ? "active" : "") + '">' + labels[c] + '</button>').join("") + '</div>';
    const banner = lastError ? '<div class="mnews-state">The latest source check failed. Showing the last successfully saved headlines; automatic retries continue.</div>' : '';
    if (selected) {
      const item = articles.find(a => a.id === selected);
      if (item) {
        content.innerHTML = '<section class="mnews-page" data-marvel-news-content><button type="button" class="mnews-back" data-news-back>← BACK TO NEWS</button>' +
          '<div class="mnews-detail"><div class="eyebrow">' + esc(item.category || "MARVEL") + ' · ' + esc(status(item)) + '</div>' +
          '<h2>' + esc(item.title) + '</h2><div class="mnews-meta"><span>' + esc(item.source || "Publisher") + '</span><time>' + esc(date(item.published_at)) + '</time></div>' +
          (item.image_url ? '<img src="' + safeUrl(item.image_url) + '" alt="" referrerpolicy="no-referrer">' : '') +
          '<p class="summary">' + esc(item.summary || "The publisher has not supplied a description for this story. Visit the original report for full details.") + '</p>' +
          '<div class="mnews-detail-actions"><a href="' + safeUrl(item.article_url) + '" target="_blank" rel="noopener noreferrer">OPEN ORIGINAL STORY ↗</a><button type="button" data-news-back>BACK TO NEWS</button></div>' +
          '<p class="mnews-footnote">This archive displays a short factual preview and links to the original publisher. The publisher retains ownership of its reporting and media.</p></div></section>';
        return;
      }
      selected = null;
    }
    content.innerHTML = '<section class="mnews-page" data-marvel-news-content>' +
      '<div class="mnews-heading"><div><div class="eyebrow">MARVEL UNIVERSE · NEWSROOM</div><h1>Marvel <span>News</span></h1><p>Marvel headlines, official announcements and coverage from established publishers — collected, organised and refreshed automatically.</p></div>' +
      '<div class="mnews-live"><i></i><span>LIVE NEWS SYSTEM</span><small id="mnewsUpdated">' + esc(updated) + '</small></div></div>' + banner + controls + filters +
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