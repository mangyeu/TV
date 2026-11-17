// @Allowed-Domains: phim.nguonc.com, *.nguonc.com, img.nguonc.com, streamc.xyz, *.streamc.xyz, googleapis.com, *.googleapis.com

var BASE_URL = "https://nguonc.com";

function getManifest() {
  return JSON.stringify({
    id: "phim_nguonc",
    name: "Nguồn C",
    version: "3.2",
    type: "MOVIE",
    baseUrl: BASE_URL
  });
}

function getHomeSections() {
  return JSON.stringify(new Array(
    { slug: "danh-sach-phim", title: "Phim Mới Cập Nhật", type: "HORIZONTAL", path: "danh-sach-phim" },
    { slug: "danh-sach/phim-bo", title: "Phim Bộ Mới", type: "HORIZONTAL", path: "danh-sach/phim-bo" },
    { slug: "danh-sach/phim-le", title: "Phim Lẻ Mới", type: "HORIZONTAL", path: "danh-sach/phim-le" },
    { slug: "danh-sach/tv-shows", title: "TV Shows", type: "HORIZONTAL", path: "danh-sach/tv-shows" }
  ));
}

function getPrimaryCategories() {
  return JSON.stringify(new Array(
    { name: "Tất cả", slug: "danh-sach-phim" },
    { name: "Phim Bộ", slug: "danh-sach/phim-bo" },
    { name: "Phim Lẻ", slug: "danh-sach/phim-le" },
    { name: "TV Shows", slug: "danh-sach/tv-shows" },
    { name: "Hành Động", slug: "the-loai/hanh-dong" },
    { name: "Cổ Trang", slug: "the-loai/co-trang" },
    { name: "Trung Quốc", slug: "quoc-gia/trung-quoc" },
    { name: "Hàn Quốc", slug: "quoc-gia/han-quoc" }
  ));
}

function getFilterConfig() {
  return JSON.stringify({
    countries: new Array(
      { name: "Tất cả", value: "" }, { name: "Trung Quốc", value: "trung-quoc" },
      { name: "Hàn Quốc", value: "han-quoc" }, { name: "Nhật Bản", value: "nhat-ban" },
      { name: "Mỹ", value: "my" }, { name: "Hồng Kông", value: "hong-kong" }, { name: "Việt Nam", value: "viet-nam" }
    ),
    categories: new Array(
      { name: "Tất cả", value: "" }, { name: "Hành Động", value: "hanh-dong" },
      { name: "Cổ Trang", value: "co-trang" }, { name: "Tình Cảm", value: "tinh-cam" },
      { name: "Tâm Lý", value: "tam-ly" }, { name: "Hài", value: "hai" }, { name: "Kinh Dị", value: "kinh-di" }
    ),
    years: new Array(
      { name: "Tất cả", value: "" }, { name: "2026", value: "2026" },
      { name: "2025", value: "2025" }, { name: "2024", value: "2024" }, { name: "2020", value: "2020" }
    )
  });
}

function getUrlList(slug, filtersJson) {
  var f = JSON.parse(filtersJson || "{}"), p = Number(f.page) || 1;
  var c = f.country || f.countries || "", g = f.category || f.categories || "", y = f.year || "";
  var path = (slug || f.slug || f.path || "danh-sach-phim").replace(/^\/+|\/+$/g, "");
  if (c && c !== "all") path = "quoc-gia/" + c.replace(/^quoc-gia\//, "");
  else if (g && g !== "all") path = "the-loai/" + g.replace(/^the-loai\//, "");
  else if (y && y !== "all") path = "nam-phat-hanh/" + y;
  return BASE_URL + "/" + path + (p > 1 ? "?page=" + p : "");
}

function getUrlSearch(k, filtersJson) {
  var p = (JSON.parse(filtersJson || "{}")).page || 1;
  return BASE_URL + "/tim-kiem?keyword=" + encodeURIComponent(k || "") + (p > 1 ? "&page=" + p : "");
}

function getUrlDetail(s) {
  return !s ? "" : (s.indexOf("http") === 0 ? s : BASE_URL + "/" + s.replace(/^\/+|\/+$/g, ""));
}

function match1(str, regex) {
  var m = str.match(regex);
  if (!m) return "";
  m.shift();
  return m.shift() || "";
}

function decodeHtml(s) {
  return (s || "").replace(/&#038;|&amp;/g, "&").replace(/&#8211;|&#8212;/g, "-").replace(/&#039;|&apos;/g, "'").replace(/&quot;/g, '"').trim();
}

function parseListResponse(html) {
  var map = new Object(), items = new Array(), totalPages = 1, currentPage = 1;
  if (!html) return JSON.stringify({ items: items });
  try {
    var blocks = html.split("nc-movie-identity");
    blocks.shift();
    while (blocks.length > 0) {
      var b = blocks.shift().substring(0, 1800);
      var href = match1(b, /href=["']([^"']+)["']/i);
      if (!href || href === "#") continue;
      var title = match1(b, /<strong>([\s\S]*?)<\/strong>/i).replace(/<[^>]+>/g, "") || match1(b, /alt=["']([^"']+)["']/i);
      var img = match1(b, /<img[^>]*data-src=["']([^"']+)["']/i) || match1(b, /<img[^>]*src=["']([^"']+)["']/i);
      if (img && img.indexOf("data:image") !== 0 && img.indexOf("http") !== 0) img = BASE_URL + "/" + img.replace(/^\/+/, "");
      var id = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
      if (id && title && !map[id]) {
        map[id] = true;
        items.push({ id: id, title: decodeHtml(title), posterUrl: img, backdropUrl: img, year: "" });
      }
    }
    var pageRegex = /[?&]page=(\d+)/gi, pm;
    while ((pm = pageRegex.exec(html)) !== null) {
      var num = parseInt(pm.slice(1, 2).join(""), 10);
      if (num > totalPages && num < 5000) totalPages = num;
    }
    if (totalPages === 1 && items.length >= 10) totalPages = 1405;
  } catch (e) {}
  return JSON.stringify({ items: items, currentPage: currentPage, totalPages: totalPages, hasNextPage: items.length > 0 && currentPage < totalPages });
}

function parseSearchResponse(html) { return parseListResponse(html); }

function parseMovieDetail(html) {
  if (!html) return JSON.stringify({});
  var title = "", poster = "", desc = "", servers = new Array();
  try {
    title = match1(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "").trim();
    poster = match1(html, /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (poster && poster.indexOf("http") !== 0) poster = BASE_URL + "/" + poster.replace(/^\/+/, "");
    desc = match1(html, /class=["'][^"']*nc-film-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    var svBlocks = html.split("nc-player-episodes__grid");
    svBlocks.shift();
    while (svBlocks.length > 0) {
      var sb = svBlocks.shift().substring(0, 15000), eps = new Array(), epMap = new Object();
      var links = sb.split("<a ");
      links.shift();
      while (links.length > 0) {
        var chunk = links.shift().substring(0, 500);
        var h = match1(chunk, /href=["']([^"']+)["']/i);
        var t = match1(chunk, />([\s\S]*?)<\/a>/i).replace(/<[^>]+>/g, "").trim();
        if (h && h !== "#" && t.length > 0 && t.length < 30) {
          var s = h.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
          if (s && !epMap[s]) { epMap[s] = true; eps.push({ id: s, name: decodeHtml(t), slug: s }); }
        }
      }
      if (eps.length > 0) servers.push({ serverName: "Server #" + (servers.length + 1), episodes: eps });
    }
    if (servers.length === 0) {
      var watchLink = match1(html, /href=["']([^"']*\/xem-phim\/[^"']+)["']/i);
      if (watchLink) {
        var wSlug = watchLink.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
        servers.push({ serverName: "Server Chính", episodes: new Array({ id: wSlug, name: "Xem Phim", slug: wSlug }) });
      }
    }
  } catch (e) {}
  return JSON.stringify({ title: decodeHtml(title), posterUrl: poster, backdropUrl: poster, description: decodeHtml(desc), servers: servers });
}

function parseDetailResponse(html) {
  if (!html) return JSON.stringify({ url: "" });
  var url = "", type = "hls";
  try {
    var m3u8 = match1(html, /["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i);
    if (m3u8) { url = m3u8.replace(/\\\//g, "/"); type = url.indexOf(".mp4") !== -1 ? "mp4" : "hls"; }
    if (!url) {
      var emb = match1(html, /<iframe[^>]*src=["']((?:https?:)?\/\/[^"']+)["']/i);
      if (emb && emb.indexOf("facebook.com") === -1 && emb.indexOf("google") === -1) {
        url = emb.replace(/\\\//g, "/");
        if (url.indexOf("//") === 0) url = "https:" + url;
        type = "embed";
      }
    }
  } catch (e) {}
  return JSON.stringify({ url: url, type: type, headers: { "Referer": BASE_URL + "/", "Origin": BASE_URL } });
}
