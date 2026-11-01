(() => {
  "use strict";
  const newsStyles = document.createElement("style");
  newsStyles.textContent = `
    [data-marvel-news]{margin-top:4px}
    .mnews-page{padding:24px 0 45px;color:var(--paper,#f4f1ec)}
    .mnews-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:22px;flex-wrap:wrap;margin-bottom:24px}
    .mnews-live{display:grid;grid-template-columns:10px auto;align-items:center;column-gap:8px;padding:10px 13px;border:1px solid rgba(123,224,179,.25);border-radius:13px;background:rgba(123,224,179,.07);font-size:10px;letter-spacing:1.4px}
    .mnews-live i{width:7px;height:7px;border-radius:50%;background:#7be0b3;box-shadow:0 0 12px #7be0b3}
    .mnews-live small{grid-column:2;color:#9da8bb;font-size:9px;letter-spacing:0;margin-top:3px}
    .mnews-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:22px 0 16px}
    .mnews-filters{display:flex;gap:7px;flex-wrap:wrap}
    .mnews-filters button{border:1px solid var(--line);background:rgba(255,255,255,.055);color:#bac4d4;border-radius:99px;padding:8px 12px;font-size:10px}
    .mnews-filters button.active{background:linear-gradient(110deg,var(--red),#ad284b);border-color:transparent;color:white}
    .mnews-count,.mnews-footnote{font-size:10px;color:#96a2b6}
    .mnews-feature{margin-bottom:16px}
    .mnews-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .mnews-card{min-width:0;overflow:hidden;border:1px solid var(--line);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.025));}
    .mnews-card.featured{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)}
    .mnews-image{height:165px;display:grid;place-items:center;position:relative;overflow:hidden;background:radial-gradient(circle at 75% 25%,rgba(230,57,70,.38),transparent 35%),linear-gradient(135deg,#171d34,#351c39 60%,#151d2b);text-decoration:none}
    .featured .mnews-image{height:100%;min-height:270px}
    .mnews-image img{width:100%;height:100%;object-fit:cover}
    .mnews-art-fallback{display:flex;flex-direction:column;align-items:center;gap:2px;color:#ffffff25;font:900 42px 'Barlow Condensed',sans-serif;letter-spacing:2px}
    .mnews-art-fallback b{font-size:14px;letter-spacing:5px;color:#e6394680}
    .mnews-status{position:absolute;left:12px;top:12px;padding:6px 8px;border-radius:7px;background:#101522d9;border:1px solid #ffffff2b;color:#f2f4f8;font-size:8px;font-weight:800;letter-spacing:1px}
    .mnews-status.official{color:#a9f5cf;border-color:#7be0b366}.mnews-status.rumour{color:#ffd99a;border-color:#ffc85766}
    .mnews-card-body{padding:16px;display:flex;flex-direction:column;min-width:0}
    .mnews-meta{display:flex;justify-content:space-between;gap:8px;color:#91a0b8;font-size:9px}
    .mnews-card h2{font:700 21px/1.12 'Barlow Condensed',sans-serif;margin:13px 0 8px}
    .featured h2{font-size:clamp(25px,3vw,36px)}
    .mnews-card h2 a{color:#f4f1ec;text-decoration:none}.mnews-card h2 a:hover{color:#ff9ca4}
    .mnews-card p{font-size:11px;line-height:1.65;color:#aeb8c8;margin:0 0 18px}
    .mnews-card-bottom{margin-top:auto;display:flex;justify-content:space-between;gap:8px;align-items:center;color:#8e9bb0;font-size:9px}
    .mnews-card-bottom a{color:#ff9da5;text-decoration:none;font-weight:800;letter-spacing:.7px}
    .mnews-empty,.mnews-feature-placeholder{padding:30px;border:1px dashed var(--line);border-radius:16px;text-align:center;color:#aab4c6}
    .mnews-feature-placeholder{font:900 22px 'Barlow Condensed';letter-spacing:4px;color:#ffffff30}
    .mnews-empty strong{color:#f4f1ec;font:700 22px 'Barlow Condensed'}
    .mnews-empty p{font-size:11px}
    .mnews-footnote{margin-top:22px;line-height:1.6}
    @media(max-width:900px){.mnews-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mnews-card.featured{grid-template-columns:1fr}.featured .mnews-image{min-height:190px}}
    @media(max-width:560px){.mnews-grid{grid-template-columns:1fr}.mnews-card.featured{display:block}.mnews-heading{align-items:flex-start}.mnews-filters button{padding:7px 9px}}
  `;
  document.head.appendChild(newsStyles);
  const FEED_URL = "news-feed.json";
  let articles = [];
  let filter = "all";
  let active = false;
  let refreshTimer = null;

  const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
  const formatDate = value => {
    if (!value) return "Recently published";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently published" : date.toLocaleString();
  };

  function addNavigation() {
    const firstNav = document.querySelector(".sidebar .nav");
    if (!firstNav || document.querySelector("[data-marvel-news]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.marvelNews = "true";
    button.innerHTML = '<span class="ico">◈</span>Marvel News';
    firstNav.insertBefore(button, firstNav.children[1] || null);
  }

  function setActive(isActive) {
    active = isActive;
    const button = document.querySelector("[data-marvel-news]");
    if (button) button.classList.toggle("active", isActive);
    if (isActive) {
      document.querySelectorAll("[data-view]").forEach(el => el.classList.remove("active"));
      const crumb = document.getElementById("crumbName");
      if (crumb) crumb.textContent = "MARVEL NEWS";
    }
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = isActive ? setInterval(() => {
      if (!document.hidden && active) loadFeed();
    }, 60000) : null;
  }

  function card(article, featured = false) {
    const title = escapeHtml(article.title || "Marvel update");
    const summary = escapeHtml(article.summary || "Open the original publisher for the full report.");
    const source = escapeHtml(article.source || "News source");
    const category = escapeHtml(article.category || "Marvel");
    const url = escapeHtml(article.article_url || "#");
    const status = article.status === "official" ? "OFFICIAL" : article.status === "rumour" ? "RUMOUR" : "REPORTED";
    const image = article.image_url
      ? '<img src="' + escapeHtml(article.image_url) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'
      : '<div class="mnews-art-fallback"><span>MARVEL</span><b>NEWSWIRE</b></div>';
    return '<article class="mnews-card ' + (featured ? "featured" : "") + '">' +
      '<a class="mnews-image" href="' + url + '" target="_blank" rel="noopener noreferrer">' + image +
      '<span class="mnews-status ' + status.toLowerCase() + '">' + status + '</span></a>' +
      '<div class="mnews-card-body"><div class="mnews-meta"><span>' + category + '</span><span>' + source + '</span></div>' +
      '<h2><a href="' + url + '" target="_blank" rel="noopener noreferrer">' + title + '</a></h2>' +
      '<p>' + summary + '</p><div class="mnews-card-bottom"><time>' + escapeHtml(formatDate(article.published_at)) +
      '</time><a href="' + url + '" target="_blank" rel="noopener noreferrer">READ STORY ↗</a></div></div></article>';
  }

  function render() {
    const content = document.getElementById("content");
    if (!content || !active) return;
    const list = articles.filter(article => {
      if (filter === "all") return true;
      if (filter === "official") return article.status === "official";
      return String(article.category || "").toLowerCase().includes(filter);
    });
    const updated = window.marvelNewsGeneratedAt ? "Updated " + formatDate(window.marvelNewsGeneratedAt) : "Checking sources…";
    content.innerHTML = '<section class="mnews-page">' +
      '<div class="mnews-heading"><div><div class="eyebrow">MARVEL UNIVERSE · NEWSROOM</div>' +
      '<h1 class="page-title">Marvel <span>News</span></h1><p class="subhead">The latest Marvel-only updates from official announcements and established publishers.</p></div>' +
      '<div class="mnews-live"><i></i><span>LIVE FEED</span><small id="mnewsUpdated">' + escapeHtml(updated) + '</small></div></div>' +
      '<div class="mnews-toolbar"><div class="mnews-filters" id="mnewsFilters">' +
      ['all','official','movies','comics','casting','games'].map(key =>
        '<button type="button" data-news-filter="' + key + '" class="' + (filter === key ? "active" : "") + '">' +
        ({all:"All News",official:"Official",movies:"Movies & TV",comics:"Comics",casting:"Casting",games:"Games"}[key]) + '</button>'
      ).join("") + '</div><span class="mnews-count">' + list.length + ' stories</span></div>' +
      (list.length ? '<div class="mnews-feature">' + card(list[0], true) + '</div>' : '<div class="mnews-feature-placeholder">MARVEL NEWSWIRE</div>') +
      '<div class="mnews-grid">' + (list.length > 1 ? list.slice(1).map(item => card(item)).join("") :
        '<div class="mnews-empty"><strong>' + (list.length ? "You’re all caught up." : "No Marvel stories are available yet.") +
        '</strong><p>New stories will appear after the next successful source check.</p></div>') + '</div>' +
      '<div class="mnews-footnote">Stories link to their original publishers. Official announcements, reported stories and rumours are labelled separately.</div></section>';
  }

  async function loadFeed() {
    try {
      const response = await fetch(FEED_URL + "?t=" + Date.now(), {cache:"no-store"});
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      articles = Array.isArray(data.articles) ? data.articles : [];
      window.marvelNewsGeneratedAt = data.generated_at || "";
      render();
    } catch (error) {
      const content = document.getElementById("content");
      if (active && content) {
        const status = document.getElementById("mnewsUpdated");
        if (status) status.textContent = "Feed reconnecting…";
      }
    }
  }

  document.addEventListener("click", event => {
    const newsButton = event.target.closest("[data-marvel-news]");
    if (newsButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setActive(true);
      render();
      loadFeed();
      return;
    }
    if (event.target.closest("[data-view]")) setActive(false);
    const filterButton = event.target.closest("[data-news-filter]");
    if (filterButton && active) {
      filter = filterButton.dataset.newsFilter;
      render();
    }
  }, true);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && active) loadFeed();
  });
  const observer = new MutationObserver(() => addNavigation());
  observer.observe(document.documentElement, {childList:true,subtree:true});
  addNavigation();
})();