#!/usr/bin/env python3
"""Collect Marvel-only headlines from Google News RSS for the static site."""
import html
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

OUTPUT = Path("news-feed.json")
ALLOWED = {
    "marvel.com": "Marvel",
    "timesofindia.indiatimes.com": "Times of India",
    "deadline.com": "Deadline",
    "variety.com": "Variety",
    "hollywoodreporter.com": "The Hollywood Reporter",
    "ign.com": "IGN",
}
QUERY = 'Marvel OR "Marvel Studios" OR MCU OR Avengers OR Spider-Man OR X-Men OR "Fantastic Four" (site:marvel.com OR site:timesofindia.indiatimes.com OR site:deadline.com OR site:variety.com OR site:hollywoodreporter.com OR site:ign.com)'
FEED_URL = "https://news.google.com/rss/search?" + urllib.parse.urlencode({
    "q": QUERY, "hl": "en-IN", "gl": "IN", "ceid": "IN:en"
})

def clean(value):
    value = re.sub(r"<[^>]+>", " ", value or "")
    return re.sub(r"\s+", " ", html.unescape(value)).strip()

def source_for(item):
    node = item.find("source")
    if node is None:
        return None
    source_url = (node.attrib.get("url") or "").lower()
    source_title = clean(node.text)
    for domain, name in ALLOWED.items():
        if domain in source_url or name.lower() == source_title.lower():
            return name
    return None

def category_for(title):
    text = title.lower()
    if any(word in text for word in ("comic", "marvel comics", "issue #")):
        return "Comics"
    if any(word in text for word in ("casting", "cast", "joins", "star as", "to play")):
        return "Casting"
    if any(word in text for word in ("game", "gaming", "playstation", "xbox")):
        return "Games"
    if any(word in text for word in ("movie", "film", "series", "season", "trailer", "release", "box office", "marvel studios")):
        return "Movies & TV"
    return "Marvel"

def status_for(source, title):
    if source == "Marvel":
        return "official"
    if re.search(r"\b(rumou?r|speculation|unconfirmed)\b", title, re.I):
        return "rumour"
    return "reported"

def main():
    request = urllib.request.Request(FEED_URL, headers={"User-Agent": "MarvelUniverseNewsBot/1.0"})
    with urllib.request.urlopen(request, timeout=25) as response:
        root = ET.fromstring(response.read())
    articles, seen = [], set()
    for item in root.findall("./channel/item"):
        source = source_for(item)
        if not source:
            continue
        title = clean(item.findtext("title"))
        if not title or not re.search(r"\b(marvel|mcu|avengers|spider-man|x-men|fantastic four|deadpool|daredevil)\b", title, re.I):
            continue
        key = re.sub(r"[^a-z0-9]", "", title.lower())
        if key in seen:
            continue
        seen.add(key)
        published = item.findtext("pubDate")
        try:
            published_at = parsedate_to_datetime(published).astimezone(timezone.utc).isoformat()
        except Exception:
            published_at = datetime.now(timezone.utc).isoformat()
        articles.append({
            "id": key[:80],
            "title": title,
            "summary": clean(item.findtext("description"))[:420],
            "image_url": "",
            "article_url": (item.findtext("link") or "").strip(),
            "source": source,
            "source_id": re.sub(r"[^a-z0-9]+", "_", source.lower()).strip("_"),
            "category": category_for(title),
            "published_at": published_at,
            "status": status_for(source, title),
        })
    articles.sort(key=lambda article: article["published_at"], reverse=True)
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_count": len(ALLOWED),
        "articles": articles[:60],
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Published", len(payload["articles"]), "Marvel articles")

if __name__ == "__main__":
    main()
