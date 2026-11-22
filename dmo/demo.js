/* TVHAY scraper plugin - KKPhim-compatible parser layer
 * Base: https://tvhay.buzz
 * Note: The host app must perform HTTP requests and pass response HTML into these parsers.
 */
var BASE_URL = "https://tvhay.buzz";

function getManifest() {
  return JSON.stringify({ id: "tvhay", name: "TVHAY", version: "1.1.0", baseUrl: BASE_URL,
    iconUrl: BASE_URL + "/favicon.ico", isEnabled: true, type: "MOVIE" });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "phim-moi", title: "Phim Mới", type: "Horizontal", path: "list" },
    { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "list" },
    { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "list" },
    { slug: "short-drama", title: "Short Drama", type: "Horizontal", path: "list" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Phim mới", slug: "phim-moi" }, { name: "Phim bộ", slug: "phim-bo" },
    { name: "Phim lẻ", slug: "phim-le" }, { name: "Short Drama", slug: "short-drama" },
    { name: "Hành động", slug: "hanh-dong" }, { name: "Tình cảm", slug: "tinh-cam" },
    { name: "Hài hước", slug: "hai-huoc" }, { name: "Kinh dị", slug: "kinh-di" },
    { name: "Võ thuật", slug: "vo-thuat" }, { name: "Cổ trang", slug: "co-trang" },
    { name: "Viễn tưởng", slug: "vien-tuong" }, { name: "Phiêu lưu", slug: "phieu-luu" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({ sort: [{ name: "Mới cập nhật", value: "modified" }, { name: "Năm phát hành", value: "year" }] });
}

function getUrlList(slug, filtersJson) {
  try {
    var f = JSON.parse(filtersJson || "{}");
    var page = Math.max(1, parseInt(f.page, 10) || 1);
    var known = ["phim-moi", "phim-bo", "phim-le", "short-drama"];
    var url = known.indexOf(slug) >= 0 ? BASE_URL + "/" + slug : BASE_URL + "/the-loai/" + encodeURIComponent(slug || "phim-moi");
    var params = [];
    if (page > 1) params.push("page=" + page);
    if (f.country) params.push("country=" + encodeURIComponent(f.country));
    if (f.year) params.push("year=" + encodeURIComponent(f.year));
    if (f.sort) params.push("sort=" + encodeURIComponent(f.sort));
    return url + (params.length ? "?" + params.join("&") : "");
  } catch (_) { return BASE_URL + "/phim-moi"; }
}

function getUrlSearch(keyword, filtersJson) {
  try {
    var f = JSON.parse(filtersJson || "{}");
    var q = encodeURIComponent(String(keyword || "").trim());
    var url = BASE_URL + "/?view=tim-kiem&keyword=" + q;
    var page = parseInt(f.page, 10) || 1;
    if (page > 1) url += "&page=" + page;
    return url;
  } catch (_) { return BASE_URL + "/?view=tim-kiem&keyword=" + encodeURIComponent(keyword || ""); }
}

function getUrlDetail(slug) {
  var s = String(slug || "").trim();
  if (s.charAt(0) === "{") {
    try { var x = JSON.parse(s); if (x.movieSlug) s = x.movieSlug; else if (x.url) return normalizeUrl(x.url); } catch (_) {}
  }
  if (/^https?:\/\//i.test(s)) return s;
  return BASE_URL + "/phim/" + encodeURIComponent(s.replace(/^\/+|\/+$/g, ""));
}
function getUrlCategories() { return BASE_URL + "/the-loai"; }
function getUrlCountries() { return BASE_URL + "/quoc-gia"; }
function getUrlYears() { return ""; }
function getLocalYearsJson() {
  var a = []; for (var y = new Date().getFullYear(); y >= 1970; y--) a.push({ name: String(y), value: String(y) });
  return JSON.stringify(a);
}

function normalizeUrl(url) {
  if (!url) return "";
  url = String(url).trim().replace(/&amp;/g, "&");
  if (/^(data:|javascript:|#)/i.test(url)) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.indexOf("//") === 0) return "https:" + url;
  return BASE_URL + (url.charAt(0) === "/" ? url : "/" + url);
}
function decodeHtml(s) {
  return String(s || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, function(_, n) { return String.fromCharCode(parseInt(n, 10)); })
    .replace(/&#x([\da-f]+);/gi, function(_, n) { return String.fromCharCode(parseInt(n, 16)); });
}
function stripHtml(s) { return decodeHtml(String(s || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(); }
function extractText(html, regex, group) { var m = String(html || "").match(regex); return m && m[group || 1] ? stripHtml(m[group || 1]) : ""; }
function attr(tag, name) { var r = new RegExp("\\b" + name + "\\s*=\\s*(?:\\\"([^\\\"]*)\\\"|'([^']*)'|([^\\s>]+))", "i"); var m = String(tag || "").match(r); return m ? decodeHtml(m[1] || m[2] || m[3] || "") : ""; }
function extractImage(block) {
  var tags = String(block || "").match(/<img\b[^>]*>/gi) || [];
  for (var i = 0; i < tags.length; i++) {
    var t = tags[i], src = attr(t, "src") || attr(t, "data-src") || attr(t, "data-original") || attr(t, "data-lazy-src");
    if (!src) { var ss = attr(t, "srcset"); if (ss) src = ss.split(",")[0].trim().split(/\s+/)[0]; }
    if (src && !/placeholder|loading/i.test(src)) return normalizeUrl(src);
  }
  return "";
}
function extractSlugFromHref(href) {
  href = decodeHtml(href || "");
  var m = href.match(/\/phim\/([^/?#]+)/i);
  return m ? m[1] : "";
}
function parseListResponse(htmlResponse) {
  var html = String(htmlResponse || "");
  var movies = [], seen = {};
  // Match anchor elements regardless of attribute order or quote style.
  var anchors = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
  for (var i = 0; i < anchors.length; i++) {
    var a = anchors[i], href = attr(a, "href"), slug = extractSlugFromHref(href);
    if (!slug || seen[slug]) continue;
    seen[slug] = true;
    var title = attr(a, "title") || attr(a, "data-title") || extractText(a, /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i) || stripHtml(a);
    if (!title) continue;
    var ep = extractText(a, /class\s*=\s*["'][^"']*(?:movie-ep-status|episode|ep)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    var lang = extractText(a, /class\s*=\s*["'][^"']*(?:movie-label|label|lang)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    var yearMatch = a.match(/(?:^|\D)(19\d{2}|20\d{2})(?:\D|$)/);
    movies.push({ id: slug, title: title, posterUrl: extractImage(a), backdropUrl: "", year: yearMatch ? parseInt(yearMatch[1], 10) : 0, quality: "", episode_current: ep, lang: lang, detailUrl: normalizeUrl(href) });
  }
  var current = parseInt(extractText(html, /class\s*=\s*["'][^"']*current[^"']*["'][^>]*>(\d+)</i), 10) || 1;
  var pageNums = (html.match(/(?:page=|\/page\/)(\d+)/gi) || []).map(function(x) { return parseInt(x.match(/\d+/)[0], 10); }).filter(function(n) { return n > 0; });
  var maxPage = pageNums.length ? Math.max.apply(Math, pageNums) : current + (movies.length >= 12 ? 1 : 0);
  return JSON.stringify({ items: movies, pagination: { currentPage: current, totalPages: Math.max(current, maxPage), totalItems: movies.length, itemsPerPage: movies.length } });
}
function parseSearchResponse(htmlResponse) { return parseListResponse(htmlResponse); }

function parseMovieDetail(htmlResponse) {
  var html = String(htmlResponse || "");
  if (!html) return "null";
  var title = extractText(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || extractText(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  var poster = extractText(html, /<meta\s+[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)/i) || extractText(html, /<meta\s+[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:image/i);
  if (!poster) poster = extractImage(html);
  var description = extractText(html, /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)/i) || extractText(html, /<meta\s+[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']description/i);
  if (!description) description = extractText(html, /class\s*=\s*["'][^"']*(?:description|content|summary)[^"']*["'][^>]*>([\s\S]*?)<\/div/i);
  var year = 0, ym = html.match(/(?:năm|year|release)[^>]*>\s*(19\d{2}|20\d{2})/i) || html.match(/\b(19\d{2}|20\d{2})\b/); if (ym) year = parseInt(ym[1], 10);
  var slug = extractSlugFromHref((html.match(/href\s*=\s*["']([^"']*\/phim\/[^"']+)/i) || [])[1] || "") || (locationSlug(html) || "");
  var episodes = [], epSeen = {};
  var links = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
  for (var i = 0; i < links.length; i++) {
    var a = links[i], href = attr(a, "href"), m = href.match(/\/(?:xem|watch|episode|tap)\/([^/?#]+)(?:\/([^/?#]+))?/i);
    if (!m) continue;
    var epSlug = m[1], epNo = m[2] || "", key = href;
    if (epSeen[key]) continue; epSeen[key] = true;
    episodes.push({ id: JSON.stringify({ movieSlug: slug || epSlug, tap: epNo || epSlug, url: normalizeUrl(href) }), name: stripHtml(a) || ("Tập " + (episodes.length + 1)), slug: epNo || epSlug, m3u8: "", embed: normalizeUrl(href) });
  }
  var servers = episodes.length ? [{ name: "Danh sách tập", episodes: episodes }] : [];
  return JSON.stringify({ id: slug, title: title, originName: "", posterUrl: normalizeUrl(poster), backdropUrl: "", description: description, year: year, rating: 0, quality: "HD", duration: "", servers: servers, episode_current: "", lang: "", category: "", country: "", director: "", casts: "", status: "", tmdbId: "", tmdbSeason: 0, tmdbType: "" });
}
function locationSlug(html) { var m = String(html || "").match(/(?:canonical|og:url)[^>]+(?:href|content)=["']https?:\/\/[^/]+\/phim\/([^"/?#]+)/i); return m ? m[1] : ""; }

// Parser passthrough for the host's player/detail response. Does not resolve or bypass protected streams.
function parseDetailResponse(response) {
  var raw = String(response || "").trim();
  if (!raw) return JSON.stringify({ url: "", isDirectStream: false, headers: { Referer: BASE_URL + "/" }, subtitles: [], error: "empty_input" });
  var parsed;
  try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
  if (parsed && typeof parsed === "object") {
    var url = parsed.url || parsed.link || parsed.embed || parsed.src || "";
    return JSON.stringify({ url: normalizeUrl(url), isDirectStream: false, headers: { Referer: BASE_URL + "/" }, subtitles: parsed.subtitles || parsed.subtitle || [], resolvedFrom: "json_passthrough" });
  }
  if (/^https?:\/\//i.test(raw)) return JSON.stringify({ url: raw, isDirectStream: false, headers: { Referer: BASE_URL + "/" }, subtitles: [], resolvedFrom: "url_passthrough" });
  return JSON.stringify({ url: "", isDirectStream: false, headers: { Referer: BASE_URL + "/" }, subtitles: [], error: "unrecognized_response" });
}

function parseCategoriesResponse(response) {
  var html = String(response || ""), out = [], seen = {};
  var links = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
  for (var i = 0; i < links.length; i++) {
    var href = attr(links[i], "href"), m = href.match(/\/the-loai\/([^/?#]+)/i), name = attr(links[i], "title") || stripHtml(links[i]);
    if (m && name && !seen[m[1]]) { seen[m[1]] = true; out.push({ name: name, slug: m[1] }); }
  }
  if (!out.length) out = [{ name: "Hành Động", slug: "hanh-dong" }, { name: "Tình Cảm", slug: "tinh-cam" }, { name: "Hài Hước", slug: "hai-huoc" }, { name: "Kinh Dị", slug: "kinh-di" }, { name: "Võ Thuật", slug: "vo-thuat" }, { name: "Cổ Trang", slug: "co-trang" }];
  return JSON.stringify(out);
}
function parseCountriesResponse(response) {
  var html = String(response || ""), out = [], seen = {};
  var links = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
  for (var i = 0; i < links.length; i++) {
    var href = attr(links[i], "href"), m = href.match(/\/quoc-gia\/([^/?#]+)/i), name = attr(links[i], "title") || stripHtml(links[i]);
    if (m && name && !seen[m[1]]) { seen[m[1]] = true; out.push({ name: name, value: m[1] }); }
  }
  if (!out.length) out = [{ name: "Việt Nam", value: "viet-nam" }, { name: "Hàn Quốc", value: "han-quoc" }, { name: "Trung Quốc", value: "trung-quoc" }, { name: "Nhật Bản", value: "nhat-ban" }, { name: "Thái Lan", value: "thai-lan" }, { name: "Âu Mỹ", value: "au-my" }];
  return JSON.stringify(out);
}
function parseYearsResponse() { return getLocalYearsJson(); }

// Optional diagnostics: call with the raw HTTP response in the host to identify blocking pages.
function diagnoseResponse(response, statusCode) {
  var html = String(response || "");
  var result = { status: statusCode || 0, length: html.length, htmlReceived: !!html, blocked: false, reason: "" };
  if (!html) result.reason = "empty_response";
  else if (statusCode === 403) { result.blocked = true; result.reason = "http_403"; }
  else if (statusCode === 503) { result.blocked = true; result.reason = "http_503"; }
  else if (/cloudflare|checking your browser|verify you are human|captcha/i.test(html)) { result.blocked = true; result.reason = "anti_bot_page"; }
  else if (/404 not found|page not found/i.test(html)) result.reason = "not_found_page";
  else if (!/<html|<!doctype|<body/i.test(html)) result.reason = "non_html_response";
  else result.reason = "html_received";
  return JSON.stringify(result);
}
