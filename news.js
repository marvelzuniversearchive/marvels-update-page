(() => {
  "use strict";
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