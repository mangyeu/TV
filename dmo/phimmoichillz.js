// @Allowed-Domains: phimmoichillz.top, *.phimmoichillz.top, phimmoichill.top, *.phimmoichill.top, googleapis.com, *.googleapis.com

var BASE_URL = "https://phimmoichillz.top";

function getManifest() {
  return JSON.stringify({
    "id": "phimmoichillz",
    "name": "PhimMoiChillZ",
    "version": "3.1",
    "type": "MOVIE",
    "baseUrl": BASE_URL
  });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "phim-le", title: "Phim Lẻ Mới", type: "HORIZONTAL", path: "phim-le" },
    { slug: "phim-bo", title: "Phim Bộ Mới", type: "HORIZONTAL", path: "phim-bo" },
    { slug: "quoc-gia/viet-nam", title: "Phim Việt Nam", type: "HORIZONTAL", path: "quoc-gia/viet-nam" },
    { slug: "quoc-gia/hong-kong", title: "Phim Hồng Kông", type: "HORIZONTAL", path: "quoc-gia/hong-kong" },
    { slug: "quoc-gia/an-do", title: "Phim Ấn Độ", type: "HORIZONTAL", path: "quoc-gia/an-do" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Phim Lẻ", slug: "phim-le" },
    { name: "Phim Bộ", slug: "phim-bo" },
    { name: "Việt Nam", slug: "quoc-gia/viet-nam" },
    { name: "Hồng Kông", slug: "quoc-gia/hong-kong" },
    { name: "Ấn Độ", slug: "quoc-gia/an-do" },
    { name: "Pháp", slug: "quoc-gia/phap" },
    { name: "Nga", slug: "quoc-gia/nga" },
    { name: "Đức", slug: "quoc-gia/duc" },
    { name: "Tây Ban Nha", slug: "quoc-gia/tay-ban-nha" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({
    countries: [
      { name: "Tất cả", value: "" },
      { name: "Việt Nam", value: "viet-nam" },
      { name: "Hồng Kông", value: "hong-kong" },
      { name: "Ấn Độ", value: "an-do" },
      { name: "Pháp", value: "phap" },
      { name: "Nga", value: "nga" }
    ],
    categories: [
      { name: "Tất cả", value: "" },
      { name: "Hành Động", value: "hanh-dong" },
      { name: "Tình Cảm", value: "tinh-cam" },
      { name: "Kinh Dị", value: "kinh-di" }
    ],
    years: [
      { name: "Tất cả", value: "" },
      { name: "2026", value: "2026" },
      { name: "2025", value: "2025" }
    ]
  });
}

function getUrlList(slug, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  var path = (slug || filters.slug || filters.path || "phim-le").replace(/^\/+|\/+$/g, "");
  if (filters.country) path = "quoc-gia/" + filters.country;
  else if (filters.category) path = "the-loai/" + filters.category;
  else if (filters.year) path = "nam-phat-hanh/" + filters.year;
  return BASE_URL + "/" + path + (page > 1 ? "/page/" + page : "");
}

function getUrlSearch(keyword, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  var q = encodeURIComponent(keyword || "").replace(/%20/g, "+");
  return BASE_URL + (page > 1 ? "/page/" + page : "") + "/?s=" + q;
}

function getUrlDetail(slug) {
  if (!slug) return "";
  return slug.indexOf("http") === 0 ? slug : BASE_URL + "/" + slug.replace(/^\/+|\/+$/g, "");
}

function getGroup(m, i) {
  if (!m || m.length <= i) return "";
  var val = m.slice(i, i + 1).join("");
  return val ? val : "";
}

function decodeHtml(s) {
  return (s || "").replace(/&#038;|&amp;/g, "&").replace(/&#8211;|&#8212;/g, "-").replace(/&#039;|&apos;/g, "'").replace(/&quot;/g, '"').trim();
}

function parseListResponse(html) {
  var map = {}, items = [];
  if (!html) return JSON.stringify({ items: items });
  try {
    var mainHtml = html;
    var topEnd = html.indexOf("</section>");
    if (html.indexOf("MovieListTop") !== -1 && topEnd !== -1 && topEnd < 15000) {
      mainHtml = html.substring(topEnd);
    }

    var blocks = mainHtml.split(/<div[^>]*class=["'][^"']*\bTPostMv\b[^"']*["'][^>]*>/i);
    for (var i = 1; i < blocks.length; i++) {
      var b = getGroup(blocks, i).substring(0, 2000);
      var href = getGroup(b.match(/<a[^>]*href=["']([^"']+)["']/i), 1);
      if (!href || href.indexOf("/phim/") === -1) continue;

      var title = getGroup(b.match(/<img[^>]*alt=["']([^"']+)["']/i), 1) ||
                  getGroup(b.match(/<(?:h2|h3|div)[^>]*class=["'][^"']*Title[^"']*["'][^>]*>([\s\S]*?)<\/(?:h2|h3|div)>/i), 1).replace(/<[^>]+>/g, "");

      var img = getGroup(b.match(/<img[^>]*data-src=["']([^"']+)["']/i), 1) ||
                getGroup(b.match(/<img[^>]*src=["']([^"']+)["']/i), 1);

      if (img && img.indexOf("data:image") !== 0 && img.indexOf("http") !== 0) {
        img = BASE_URL + "/" + img.replace(/^\/+/, "");
      }

      var id = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
      if (id && title && !map[id]) {
        map[id] = true;
        items.push({
          id: id,
          title: decodeHtml(title),
          posterUrl: img,
          backdropUrl: img,
          year: getGroup(b.match(/\b(20\d{2}|19\d{2})\b/), 1)
        });
      }
    }
  } catch (e) {}
  return JSON.stringify({ items: items });
}

function parseSearchResponse(html) {
  return parseListResponse(html);
}

function parseMovieDetail(html) {
  if (!html) return JSON.stringify({});
  var title = "", poster = "", desc = "", servers = [], eps = [], epMap = {};
  try {
    title = (getGroup(html.match(/<h1[^>]*class=["'][^"']*Title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i), 1) ||
             getGroup(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i), 1) ||
             getGroup(html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i), 1)).replace(/<[^>]+>/g, "").trim();

    poster = getGroup(html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i), 1);
    if (poster && poster.indexOf("http") !== 0) poster = BASE_URL + "/" + poster.replace(/^\/+/, "");

    desc = getGroup(html.match(/<div[^>]*class=["'][^"']*Description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i), 1).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
           getGroup(html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i), 1);

    var epRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, m;
    while ((m = epRegex.exec(html)) !== null) {
      var h = getGroup(m, 1), t = getGroup(m, 2).replace(/<[^>]+>/g, "").trim();
      if (h && (h.indexOf("/xem-phim") !== -1 || h.indexOf("/tap-") !== -1 || h.indexOf("episode") !== -1 || h.indexOf("watch") !== -1) && t.length > 0 && t.length < 30) {
        var s = h.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
        if (s && !epMap[s]) { epMap[s] = true; eps.push({ id: s, name: decodeHtml(t), slug: s }); }
      }
    }
    if (eps.length > 0) servers.push({ serverName: "Server Chính", episodes: eps });
  } catch (e) {}
  return JSON.stringify({ title: decodeHtml(title), posterUrl: poster, backdropUrl: poster, description: decodeHtml(desc), servers: servers });
}

function parseDetailResponse(html) {
  if (!html) return JSON.stringify({ url: "" });
  var url = "", type = "hls";
  try {
    var m3u8 = getGroup(html.match(/["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i), 1);
    if (m3u8) { url = m3u8.replace(/\\\//g, "/"); type = url.indexOf(".mp4") !== -1 ? "mp4" : "hls"; }
    else {
      var emb = getGroup(html.match(/(?:<iframe[^>]*src|data-link|data-src|data-embed|file|source)\s*[:=]\s*["']((?:https?:)?\/\/[^"'\s]+)["']/i), 1);
      if (emb && emb.indexOf("facebook.com") === -1 && emb.indexOf("google") === -1) {
        url = emb.replace(/\\\//g, "/");
        if (url.indexOf("//") === 0) url = "https:" + url;
        type = "embed";
      }
    }
  } catch (e) {}
  return JSON.stringify({ url: url, type: type, headers: { "Referer": BASE_URL + "/", "Origin": BASE_URL, "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36" } });
}
