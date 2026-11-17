// @Allowed-Domains: phim.nguonc.com, *.nguonc.com, img.nguonc.com, streamc.xyz, *.streamc.xyz, googleapis.com, *.googleapis.com

var BASE_URL = "https://phim.nguonc.com";

function getManifest() {
  return JSON.stringify({
    id: "phim_nguonc",
    name: "Nguồn C",
    version: "4.3",
    type: "MOVIE",
    baseUrl: BASE_URL,
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      "Referer": BASE_URL + "/"
    }
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
      { name: "2025", value: "2025" }, { name: "2024", value: "2024" },
      { name: "2020", value: "2020" }, { name: "1996", value: "1996" }
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
  if (!s) return "";
  if (s.indexOf("http") === 0) return s;
  var parts = s.replace(/^\/+|\/+$/g, "").split("/");
  var cleanSlug = parts.pop() || "";
  return BASE_URL + "/api/film/" + cleanSlug;
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
  var seen = "|", items = new Array(), totalPages = 1, currentPage = 1;
  if (!html) return JSON.stringify({ items: items });

  try {
    var rows = html.split("<tr");
    rows.shift();

    while (rows.length > 0) {
      var r = rows.shift().substring(0, 2200);
      if (r.indexOf("nc-movie-identity") === -1) continue;

      var href = match1(r, /href=["']([^"']+)["']/i);
      if (!href || href === "#") continue;

      var title = match1(r, /<strong>([\s\S]*?)<\/strong>/i).replace(/<[^>]+>/g, "") || match1(r, /alt=["']([^"']+)["']/i);
      var img = match1(r, /<img[^>]*data-src=["']([^"']+)["']/i) || match1(r, /<img[^>]*src=["']([^"']+)["']/i);
      if (img && img.indexOf("data:image") !== 0 && img.indexOf("http") !== 0) img = BASE_URL + "/" + img.replace(/^\/+/, "");

      var id = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
      if (id && title && seen.indexOf("|" + id + "|") === -1) {
        seen += id + "|";
        items.push({ id: id, title: decodeHtml(title), posterUrl: img, backdropUrl: img, year: match1(r, /\b(19\d{2}|20\d{2})\b/) });
      }
    }

    var curMatch = match1(html, /aria-current=["']page["'][^>]*>\s*(\d+)\s*</i);
    if (curMatch) currentPage = parseInt(curMatch, 10) || 1;

    var pageRegex = /[?&]page=(\d+)/gi, pm;
    while ((pm = pageRegex.exec(html)) !== null) {
      var num = parseInt(pm.slice(1, 2).join(""), 10);
      if (num > totalPages && num < 5000) totalPages = num;
    }
    if (items.length >= 10 && totalPages <= currentPage) totalPages = currentPage + 5;
  } catch (e) {}

  return JSON.stringify({
    items: items,
    currentPage: currentPage,
    totalPages: totalPages,
    totalItems: totalPages * 24,
    hasNextPage: items.length > 0 && currentPage < totalPages,
    pagination: { currentPage: currentPage, totalPages: totalPages }
  });
}

function parseMovieDetail(jsonStr) {
  var title = "", poster = "", desc = "", servers = new Array();
  try {
    var data = JSON.parse(jsonStr || "{}");
    var movie = data.movie || {};
    title = movie.name || movie.original_name || "";
    poster = movie.poster_url || movie.thumb_url || "";
    desc = (movie.description || "").replace(/<[^>]+>/g, " ").trim();

    var epGroups = movie.episodes || new Array();
    while (epGroups.length > 0) {
      var sv = epGroups.shift(), eps = new Array();
      var svItems = sv.items || new Array();
      while (svItems.length > 0) {
        var ep = svItems.shift();
        var link = ep.m3u8 || ep.embed || "";
        if (link) {
          var epTitle = ep.name ? (ep.name.toLowerCase().indexOf("tập") === -1 && ep.name.toLowerCase() !== "full" ? "Tập " + ep.name : ep.name) : ("Tập " + (eps.length + 1));
          // Gắn thêm cờ #vax_embed để báo cho parseDetailResponse biết đây là link embed gốc
          var safeId = link.indexOf(".m3u8") === -1 ? (link + "#vax_embed") : link;
          eps.push({
            id: safeId,
            name: epTitle,
            slug: safeId
          });
        }
      }
      if (eps.length > 0) {
        servers.push({
          serverName: sv.server_name || ("Server #" + (servers.length + 1)),
          episodes: eps
        });
      }
    }

    if (servers.length > 1) {
      var vnServers = new Array(), otherServers = new Array();
      while (servers.length > 0) {
        var s = servers.shift();
        var low = (s.serverName || "").toLowerCase();
        if (low.indexOf("thuyết minh") !== -1 || low.indexOf("thuyet minh") !== -1 || low.indexOf("lồng tiếng") !== -1 || low.indexOf("long tieng") !== -1) {
          vnServers.push(s);
        } else {
          otherServers.push(s);
        }
      }
      servers = vnServers.concat(otherServers);
    }
  } catch (e) {}

  return JSON.stringify({
    title: title,
    posterUrl: poster,
    backdropUrl: poster,
    description: desc,
    servers: servers
  });
}

function parseDetailResponse(input) {
  var raw = (input || "").trim();
  if (!raw) return JSON.stringify({ url: "" });

  // 1. Nếu nhận được URL trực tiếp từ tập phim
  if (raw.indexOf("http") === 0 && raw.indexOf("<") === -1) {
    var cleanUrl = raw.replace("#vax_embed", "");
    var isHls = (cleanUrl.indexOf(".m3u8") !== -1 || cleanUrl.indexOf(".mp4") !== -1);
    return JSON.stringify({
      url: cleanUrl,
      type: isHls ? "hls" : "embed",
      headers: {
        "Referer": "https://nguonc.com",
        "Origin": "https://nguonc.com",
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
      }
    });
  }

  // 2. Nếu nhận được HTML từ trang embed.php của streamc.xyz
  var url = "", vType = "hls";
  try {
    var m3u8 = match1(raw, /["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i);
    if (m3u8) {
      url = m3u8.replace(/\\\//g, "/");
      vType = url.indexOf(".mp4") !== -1 ? "mp4" : "hls";
    }
    // Bắt link dự phòng từ thẻ canonical hoặc og:url nếu trang streamc.xyz giấu link m3u8 bằng JS
    if (!url) {
      var selfUrl = match1(raw, /<link[^>]*rel=["']canonical["'][^>]*href=["'](https?:\/\/[^"']+)["']/i) ||
                    match1(raw, /<meta[^>]*property=["']og:url["'][^>]*content=["'](https?:\/\/[^"']+)["']/i) ||
                    match1(raw, /["'](https?:\/\/embed\d*\.streamc\.xyz\/embed\.php\?hash=[a-zA-Z0-9]+)["']/i);
      if (selfUrl) {
        url = selfUrl.replace(/\\\//g, "/");
        vType = "embed";
      }
    }
  } catch (e) {}

  return JSON.stringify({
    url: url,
    type: vType,
    headers: {
      "Referer": "https://nguonc.com",
      "Origin": "https://nguonc.com",
      "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
    }
  });
}

