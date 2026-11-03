#!/usr/bin/env python3
"""Collect, validate and enrich Marvel headlines for the static archive."""
import html
import os
import json
import re
import urllib.parse
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from urllib.parse import urlparse
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

OUTPUT = Path("news-feed.json")
ALLOWED = {
    "marvel.com": "Marvel",
    "deadline.com": "Deadline",
    "variety.com": "Variety",
    "hollywoodreporter.com": "The Hollywood Reporter",
    "ign.com": "IGN",
    "thedirect.com": "The Direct",
    "comicbook.com": "ComicBook.com",
    "screenrant.com": "Screen Rant",
    "cbr.com": "CBR",
    "gamesradar.com": "GamesRadar+",
    "ew.com": "Entertainment Weekly",
    "indianexpress.com": "The Indian Express",
    "timesofindia.indiatimes.com": "Times of India",
    "rottentomatoes.com": "Rotten Tomatoes",
    "imdb.com": "IMDb",
}
QUERIES = [
    'Marvel OR "Marvel Studios" OR MCU OR Avengers OR Spider-Man OR X-Men OR "Fantastic Four" OR Daredevil OR Deadpool when:30d',
    '"Vision Quest" Marvel when:365d',
    'Marvel "Rotten Tomatoes" score review movie series when:30d',
    'Marvel IMDb rating movie series cast release when:30d',
    'site:rottentomatoes.com Marvel movie series review score when:30d',
    'site:imdb.com Marvel movie series rating cast release when:30d',
    'Marvel animation comics games Sony Spider-Man television news when:30d',
]
UA = "Mozilla/5.0 (compatible; MarvelUniverseArchiveNews/2.0)"
MAX_ARTICLES = 60
ENRICH_LIMIT = 22
GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '').strip()
# Release windows are based on announced dates. The spotlight switches by date;
# unknown future dates are deliberately not guessed.
SERIES_SCHEDULE = [
    {
        "name": "VisionQuest",
        "aliases": ["VisionQuest", "Vision Quest"],
        "premiere": "2026-10-14",
        "finale": "2026-11-11",
        "description": "Vision’s search for identity continues as he confronts the legacy of Ultron."
    },
    {
        "name": "Your Friendly Neighborhood Spider-Man — Season 2",
        "aliases": ["Your Friendly Neighborhood Spider-Man", "Friendly Neighborhood Spider-Man"],
        "premiere": "2027-01-13",
        "finale": None,
        "description": "Peter Parker returns for a new animated chapter."
    },
]
MARVEL_TERMS = re.compile(r"\b(marvel|mcu|avengers|spider[ -]?man|x[ -]?men|fantastic four|deadpool|daredevil|wolverine|thunderbolts|blade|black panther|captain america|iron man|thor|guardians of the galaxy|vision quest)\b", re.I)

def clean(value):
    value = re.sub(r"<[^>]+>", " ", value or "")
    return re.sub(r"\s+", " ", html.unescape(value)).strip()

def safe_http_url(value):
    try:
        parsed = urlparse((value or "").strip())
        return parsed.geturl() if parsed.scheme in ("http", "https") and parsed.hostname else ""
    except Exception:
        return ""

def allowed_source(item):
    node = item.find("source")
    if node is None:
        return None
    host = (urlparse(node.attrib.get("url", "")).hostname or "").lower()
    title = clean(node.text).lower()
    for domain, name in ALLOWED.items():
        if host == domain or host.endswith("." + domain) or title == name.lower():
            return name
    aliases = {
        "the direct": "The Direct", "comicbook": "ComicBook.com",
        "screen rant": "Screen Rant", "the hollywood reporter": "The Hollywood Reporter",
        "entertainment weekly": "Entertainment Weekly", "the indian express": "The Indian Express",
    }
    return aliases.get(title)

def featured_series_for(today=None):
    today = today or datetime.now(timezone.utc).date()
    parsed = []
    for series in SERIES_SCHEDULE:
        start = datetime.strptime(series["premiere"], "%Y-%m-%d").date()
        end = datetime.strptime(series["finale"], "%Y-%m-%d").date() if series.get("finale") else None
        parsed.append((series, start, end))
    for series, start, end in parsed:
        if start <= today and (end is None or today <= end):
            return {**series, "status": "airing"}
    upcoming = [(series, start) for series, start, end in parsed if start > today]
    if upcoming:
        series, _ = min(upcoming, key=lambda item: item[1])
        return {**series, "status": "upcoming"}
    return None

def category_for(title):
    text = title.lower()
    if "vision quest" in text: return "Vision Quest"
    if re.search(r"\b(rotten tomatoes|imdb|tomatometer|audience score|rating|ratings|review|reviews|score)\b", text): return "Ratings"
    if re.search(r"\b(trailer|teaser|first look|clip)\b", text): return "Trailers"
    if re.search(r"\b(game|gaming|playstation|xbox|marvel rivals|snap)\b", text): return "Games"
    if re.search(r"\b(casting|cast|joins|star as|to play|actor|actress)\b", text): return "Casting"
    if re.search(r"\b(comic|issue #|comic book|variant cover|marvel comics)\b", text): return "Comics"
    if re.search(r"\b(series|season|episode|disney\+|tv show|streaming)\b", text): return "TV"
    if re.search(r"\b(movie|film|box office|theatrical|marvel studios)\b", text): return "Movies"
    if re.search(r"\b(event|convention|sdcc|nycc|crossover)\b", text): return "Events"
    if re.search(r"\b(announce|announced|announcement|reveals|revealed|unveils|unveiled)\b", text): return "Announcements"
    return "Marvel"

def status_for(source, title):
    if source == "Marvel": return "official"
    if re.search(r"\b(rumou?r|speculation|unconfirmed|reportedly)\b", title, re.I): return "rumour"
    return "reported"

def get_xml_text(item, name):
    node = item.find(name)
    return clean(node.text if node is not None else "")

def rss_image(item):
    for node in item.iter():
        if node.tag.lower().endswith(("thumbnail", "content")):
            url = node.attrib.get("url", "")
            if safe_http_url(url): return url
    enclosure = item.find("enclosure")
    if enclosure is not None and enclosure.attrib.get("type", "").startswith("image/"):
        return safe_http_url(enclosure.attrib.get("url"))
    return ""

def parse_date(value):
    try: return parsedate_to_datetime(value).astimezone(timezone.utc).isoformat()
    except Exception: return datetime.now(timezone.utc).isoformat()

def fetch_page_metadata(url):
    """Follow publisher redirects and extract only Open Graph preview metadata."""
    if not url: return url, "", ""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
        with urllib.request.urlopen(req, timeout=9) as response:
            final_url = safe_http_url(response.geturl())
            host = (urlparse(final_url).hostname or "").lower()
            if not any(host == d or host.endswith("." + d) for d in ALLOWED):
                return url, "", ""
            raw = response.read(500_000).decode("utf-8", "replace")
        def meta(keys):
            for key in keys:
                patterns = [
                    r"<meta[^>]+(?:property|name)=['\\\"]" + re.escape(key) + r"['\\\"][^>]+content=['\\\"]([^'\\\"]+)",
                    r"<meta[^>]+content=['\\\"]([^'\\\"]+)['\\\"][^>]+(?:property|name)=['\\\"]" + re.escape(key) + r"['\\\"]",
                ]
                for pattern in patterns:
                    match = re.search(pattern, raw, re.I)
                    if match: return clean(match.group(1))
            return ""
        desc = meta(("og:description", "twitter:description", "description"))[:420]
        image = meta(("og:image", "twitter:image", "twitter:image:src"))
        image = safe_http_url(urllib.parse.urljoin(final_url, image)) if image else ""
        return final_url or url, desc, image
    except Exception:
        return url, "", ""

class ArticleParagraphParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.in_paragraph = False
        self.current = []
        self.paragraphs = []
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "nav", "header", "footer", "aside", "form", "noscript"):
            self.skip += 1
        if tag == "p" and not self.skip:
            self.in_paragraph = True
            self.current = []
    def handle_endtag(self, tag):
        if tag == "p" and self.in_paragraph:
            value = clean(" ".join(self.current))
            if len(value) > 55:
                self.paragraphs.append(value)
            self.in_paragraph = False
            self.current = []
        if tag in ("script", "style", "nav", "header", "footer", "aside", "form", "noscript") and self.skip:
            self.skip -= 1
    def handle_data(self, data):
        if self.in_paragraph and not self.skip:
            self.current.append(data)

def extract_article_text(url):
    """Read publisher article paragraphs; never store or republish the full article."""
    if not url:
        return ""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
        with urllib.request.urlopen(req, timeout=14) as response:
            final_url = safe_http_url(response.geturl())
            host = (urlparse(final_url).hostname or "").lower()
            if not any(host == d or host.endswith("." + d) for d in ALLOWED):
                return ""
            raw = response.read(1200000).decode("utf-8", "replace")
        for match in re.finditer(r'"articleBody"\s*:\s*"((?:\\.|[^"\\])*)"', raw, re.I):
            try:
                body = clean(json.loads('"' + match.group(1) + '"'))
                if len(body) > 500:
                    return body[:16000]
            except Exception:
                pass
        parser = ArticleParagraphParser()
        parser.feed(raw)
        paragraphs = [p for p in parser.paragraphs if not re.search(
            r"(subscribe|sign up for|follow us|read more|advertisement|cookie policy|privacy policy|terms of use)", p, re.I)]
        return "\n\n".join(paragraphs[:45])[:16000]
    except Exception as exc:
        print("Article text extraction failed:", str(exc)[:160])
        return ""

def generate_synopsis(title, source, published_at, url, article_text):
    """Generate a factual, original 3–5 paragraph synopsis from extracted reporting."""
    if not GEMINI_API_KEY or len(article_text) < 500:
        return ""
    prompt = (
        "Write a detailed, readable news synopsis for a Marvel news archive. Use ONLY the supplied "
        "publisher article text. Do not invent facts, dates, quotes, motives or context. Clearly label "
        "rumours and attribute reported claims. Do not copy sentences verbatim or reproduce the article. "
        "Write 3 to 5 coherent paragraphs, about 170–240 words, explaining what happened, who or what "
        "is involved, the important reported details, why it matters, and what is still unknown or next "
        "when the source actually says so. For ratings/reviews, include the exact score only if supplied. "
        "Return plain text only, with paragraphs separated by blank lines and no heading.\n\n"
        f"Headline: {title}\nPublisher: {source}\nPublished: {published_at}\nURL: {url}\n\n"
        f"Publisher article text:\n{article_text[:13500]}"
    )
    payload = {"contents":[{"parts":[{"text":prompt}]}],
               "generationConfig":{"temperature":0.2,"maxOutputTokens":850}}
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    request = urllib.request.Request(endpoint, data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type":"application/json","User-Agent":UA}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=35) as response:
            result = json.loads(response.read().decode("utf-8"))
        parts = result.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        value = "\n".join(part.get("text", "") for part in parts if part.get("text")).strip()
        return value[:5000] if len(value) >= 450 else ""
    except Exception as exc:
        print("Synopsis generation failed:", str(exc)[:180])
        return ""

def related_characters(text):
    known = [
        "Spider-Man","Iron Man","Captain America","Thor","Hulk","Black Panther",
        "Doctor Strange","Wolverine","Deadpool","Daredevil","Fantastic Four",
        "Avengers","X-Men","Loki","Scarlet Witch","Vision","Ant-Man","Captain Marvel",
        "Guardians of the Galaxy","Miles Morales","Venom","Punisher","Moon Knight",
        "Blade","Ghost Rider","Silver Surfer","Galactus","Thanos","Doom"
    ]
    low = text.lower()
    return [name for name in known if name.lower() in low][:8]

def main():
    articles, seen = [], set()
    # Query separate topic feeds so a niche project like Vision Quest or a
    # ratings story is not buried by the broad Marvel search.
    for query in QUERIES:
        feed_url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({
            "q": query, "hl": "en-IN", "gl": "IN", "ceid": "IN:en"
        })
        req = urllib.request.Request(feed_url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml"})
        try:
            with urllib.request.urlopen(req, timeout=25) as response:
                root = ET.fromstring(response.read())
        except Exception as exc:
            print("Search feed failed:", query, str(exc)[:180])
            continue
        for item in root.findall("./channel/item"):
            source = allowed_source(item)
            if not source: continue
            raw_title = get_xml_text(item, "title")
            title = re.sub(r"\s+-\s+[^-]{2,45}$", "", raw_title).strip()
            if not title or not MARVEL_TERMS.search(title): continue
            link = safe_http_url(get_xml_text(item, "link"))
            if not link: continue
            key = re.sub(r"[^a-z0-9]", "", title.lower())
            if key in seen: continue
            seen.add(key)
            guid = get_xml_text(item, "guid") or link
            summary = get_xml_text(item, "description")[:420]
            coverage_tags = []
            low_text = (title + " " + summary + " " + source).lower()
            if "vision quest" in low_text: coverage_tags.append("Vision Quest")
            for series in SERIES_SCHEDULE:
                if any(alias.lower() in low_text for alias in series["aliases"]):
                    tag = "Series: " + series["name"]
                    if tag not in coverage_tags: coverage_tags.append(tag)
            if any(term in low_text for term in ("imdb", "rotten tomatoes", "tomatometer", "audience score")):
                coverage_tags.append("Ratings & Reviews")
            if "imdb" in low_text or source == "IMDb": coverage_tags.append("IMDb")
            if "rotten tomatoes" in low_text or source == "Rotten Tomatoes": coverage_tags.append("Rotten Tomatoes")
            articles.append({
                "id": key[:80], "title": title, "summary": summary,
                "coverage_tags": coverage_tags,
                "image_url": rss_image(item), "article_url": link,
                "source": source, "source_id": re.sub(r"[^a-z0-9]+", "_", source.lower()).strip("_"),
                "category": category_for(title), "published_at": parse_date(get_xml_text(item, "pubDate")),
                "status": status_for(source, title), "tags": related_characters(title + " " + summary),
                "related_characters": related_characters(title + " " + summary),
                "external_id": guid[:200],
            })
    
    articles.sort(key=lambda a: a["published_at"], reverse=True)
    # Keep completed synopses and enrich the newest stories with publisher article text.
    old = {}
    previous = {}
    if OUTPUT.exists():
        try:
            previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
            old = {a.get("id"): a for a in previous.get("articles", []) if a.get("id")}
        except Exception:
            previous, old = {}, {}
    for article in articles:
        prior = old.get(article["id"], {})
        if prior.get("synopsis"):
            article["synopsis"] = prior["synopsis"]
            article["synopsis_status"] = "ready"
            if len(prior.get("summary", "")) > len(article.get("summary", "")):
                article["summary"] = prior["summary"]
        else:
            article["synopsis"] = ""
            article["synopsis_status"] = "pending"

    for article in [a for a in articles if not a.get("synopsis")][:ENRICH_LIMIT]:
        final_url, description, image = fetch_page_metadata(article["article_url"])
        article["article_url"] = final_url or article["article_url"]
        if description and len(description) > 80:
            article["summary"] = description
        if image:
            article["image_url"] = image
        article_text = extract_article_text(article["article_url"])
        synopsis_text = generate_synopsis(article["title"], article["source"], article["published_at"],
                                           article["article_url"], article_text)
        if synopsis_text:
            article["synopsis"] = synopsis_text
            article["synopsis_status"] = "ready"
            article["summary"] = re.split(r"(?<=[.!?])\\s+", synopsis_text)[0][:360]
        elif not GEMINI_API_KEY:
            article["synopsis_status"] = "needs_api_key" if article_text else "publisher_unavailable"
        elif article_text:
            article["synopsis_status"] = "generation_failed"
        elif description and len(description) > 100:
            article["synopsis_status"] = "publisher_excerpt_only"
        else:
            article["synopsis_status"] = "publisher_unavailable"

    # Never replace a healthy feed with an empty response. Preserve existing
    # headlines when the upstream RSS provider returns no usable entries.
    for article in articles:
        old[article["id"]] = article
    merged = sorted(old.values(), key=lambda a: a.get("published_at", ""), reverse=True)[:150]
    if not merged:
        raise RuntimeError("No valid Marvel stories returned; keeping the previous feed unchanged.")

    # Keep the feed file unchanged between successful checks when no story data
    # changed. This avoids creating a needless Git commit every 15 minutes.
    previous_articles = previous.get("articles", [])
    content_changed = merged != previous_articles
    generated_at = (
        datetime.now(timezone.utc).isoformat()
        if content_changed or not previous.get("generated_at")
        else previous["generated_at"]
    )
    payload = {
        "generated_at": generated_at,
        "source_count": len(ALLOWED),
        "search_topics": ["Marvel Universe", "Marvel Series Spotlight", "Vision Quest", "IMDb", "Rotten Tomatoes", "Movies & TV", "Comics", "Animation", "Games"],
        "featured_series": featured_series_for(),
        "article_count": len(merged),
        "articles": merged,
        "synopsis_engine": "Gemini publisher-text synthesis" if GEMINI_API_KEY else "publisher extraction awaiting GEMINI_API_KEY",
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Updated", len(articles), "new/updated stories; retained", len(merged), "total Marvel stories.")

if __name__ == "__main__":
    main()
