// @Allowed-Domains: phim.nguonc.com, *.nguonc.com, img.nguonc.com, streamc.xyz, *.streamc.xyz, googleapis.com, *.googleapis.com

var BASE_URL = "https://phim.nguonc.com";

function getManifest() {
  return JSON.stringify({
    id: "phim_nguonc",
    name: "Nguồn C",
    version: "4.2",
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
  // 1. Nếu là link phát video trực tiếp của tập phim (https://embed...) -> Trả về nguyên vẹn
  if (s.indexOf("http") === 0) {
    return s;
  }
  // 2. Nếu là slug của bộ phim -> Cắt lấy phần tên cuối cùng và gọi API chi tiết
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

function parseDetailResponse(input) {
  var raw = (input || "").trim();
  if (!raw) return JSON.stringify({ url: "" });

  // Trường hợp 1: Truyền thẳng URL (https://embed...)
  if (raw.indexOf("http") === 0 && raw.indexOf("<") === -1) {
    var type = (raw.indexOf(".m3u8") !== -1 || raw.indexOf(".mp4") !== -1) ? "hls" : "embed";
    return JSON.stringify({
      url: raw,
      type: type,
      headers: { "Referer": BASE_URL + "/", "Origin": BASE_URL }
    });
  }

  // Trường hợp 2: VAX Player đã tải sẵn HTML của trang streamc.xyz -> Bóc lấy link .m3u8 bên trong
  var url = "", vType = "hls";
  try {
    var m3u8 = match1(raw, /["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i);
    if (m3u8) {
      url = m3u8.replace(/\\\//g, "/");
      vType = url.indexOf(".mp4") !== -1 ? "mp4" : "hls";
    }
    if (!url) {
      var emb = match1(raw, /<iframe[^>]*src=["']((?:https?:)?\/\/[^"']+)["']/i);
      if (emb) {
        url = emb.replace(/\\\//g, "/");
        if (url.indexOf("//") === 0) url = "https:" + url;
        vType = "embed";
      }
    }
  } catch (e) {}

  return JSON.stringify({
    url: url,
    type: vType,
    headers: { "Referer": "https://streamc.xyz", "Origin": "https://streamc.xyz" }
  });
}


function parseSearchResponse(html) { return parseListResponse(html); }

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
          eps.push({
            id: link,
            name: epTitle,
            slug: link
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

    // Ưu tiên đưa Server Thuyết Minh / Lồng Tiếng lên vị trí đầu tiên
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
  var url = (input || "").trim();
  if (url.indexOf("{") === 0) {
    try {
      var d = JSON.parse(url);
      var firstEp = d.movie.episodes.shift().items.shift();
      url = firstEp.m3u8 || firstEp.embed || "";
    } catch (e) {}
  }
  var type = (url.indexOf(".m3u8") !== -1 || url.indexOf(".mp4") !== -1) ? "hls" : "embed";
  return JSON.stringify({
    url: url,
    type: type,
    headers: {
      "Referer": BASE_URL + "/",
      "Origin": BASE_URL
    }
  });
}
