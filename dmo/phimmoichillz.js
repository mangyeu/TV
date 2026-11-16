// @Allowed-Domains: phimmoichillz.top, *.phimmoichillz.top, phimmoichill.top, *.phimmoichill.top, phimimg.com, *.phimimg.com, kkphimplayer5.com, *.kkphimplayer5.com, kkphimplayer6.com, *.kkphimplayer6.com, kkphimplayer7.com, *.kkphimplayer7.com, kkphimplayer8.com, *.kkphimplayer8.com, phimapi.com, *.phimapi.com, opstream1.com, *.opstream1.com, opstream10.com, *.opstream10.com, opstream11.com, *.opstream11.com, nguonc.com, *.nguonc.com *.googleapis.com

var BASE_URL = "https://phimmoichillz.top";

function getManifest() {
  return JSON.stringify({ id: "phimmoichillz", name: "PhimMoiChillZ", version: "5.2", type: "MOVIE", baseUrl: BASE_URL });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "danh-sach/phim-le", title: "Phim Lẻ Mới", type: "HORIZONTAL", path: "danh-sach/phim-le" },
    { slug: "danh-sach/phim-bo", title: "Phim Bộ Mới", type: "HORIZONTAL", path: "danh-sach/phim-bo" },
    { slug: "quoc-gia/viet-nam", title: "Phim Việt Nam", type: "HORIZONTAL", path: "quoc-gia/viet-nam" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Phim Bộ", slug: "danh-sach/phim-bo" },
    { name: "Phim Lẻ", slug: "danh-sach/phim-le" },
    { name: "Hoạt Hình", slug: "the-loai/hoat-hinh" },
    { name: "Chiếu Rạp", slug: "danh-sach/phim-chieu-rap" },
    { name: "Việt Nam", slug: "quoc-gia/viet-nam" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({
    countries: [{ name: "Tất cả", value: "" }, { name: "Việt Nam", value: "viet-nam" }, { name: "Hồng Kông", value: "hong-kong" }, { name: "Ấn Độ", value: "an-do" }],
    categories: [{ name: "Tất cả", value: "" }, { name: "Hành Động", value: "hanh-dong" }, { name: "Tình Cảm", value: "tinh-cam" }],
    years: [{ name: "Tất cả", value: "" }, { name: "2026", value: "2026" }, { name: "2025", value: "2025" }]
  });
}

function getUrlList(slug, filtersJson) {
  var f = JSON.parse(filtersJson || "{}"), p = f.page || 1;
  var c = f.country || f.countries || "", g = f.category || f.categories || "", y = f.year || "";
  var path = (slug || f.slug || f.path || "danh-sach/phim-le").replace(/^\/+|\/+$/g, "");
  if (c && c !== "all") path = "quoc-gia/" + c.replace(/^quoc-gia\//, "");
  else if (g && g !== "all") path = "the-loai/" + g.replace(/^the-loai\//, "");
  else if (y && y !== "all") path = "nam-phat-hanh/" + y;
  return BASE_URL + "/" + path + (p > 1 ? "?page=" + p : "");
}

function getUrlSearch(k, filtersJson) {
  var p = (JSON.parse(filtersJson || "{}")).page || 1;
  return BASE_URL + "/?search=" + encodeURIComponent(k || "").replace(/%20/g, "+") + (p > 1 ? "&page=" + p : "");
}

function getUrlDetail(s) {
  return !s ? "" : (s.indexOf("http") === 0 ? s : BASE_URL + "/" + s.replace(/^\/+|\/+$/g, ""));
}

// Hàm lấy kết quả Regex nhóm 1 mà không cần dùng dấu ngoặc vuông
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
  var map = {}, items = [];
  if (!html) return JSON.stringify({ items: items });
  try {
    var blocks = html.split("TPostMv");
    blocks.shift();
    while (blocks.length > 0) {
      var b = blocks.shift().substring(0, 2000);
      var href = match1(b, /<a[^>]*href=["']([^"']+)["']/i);
      if (!href || href.indexOf("/phim/") === -1) continue;

      var title = match1(b, /<h2[^>]*class=["'][^"']*Title[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i).replace(/<[^>]+>/g, "") ||
                  match1(b, /<img[^>]*alt=["']([^"']+)["']/i);

      var img = match1(b, /<img[^>]*data-src=["']([^"']+)["']/i) ||
                match1(b, /<img[^>]*src=["']([^"']+)["']/i);

      if (img && img.indexOf("data:image") !== 0 && img.indexOf("http") !== 0) {
        img = BASE_URL + "/" + img.replace(/^\/+/, "");
      }

      var id = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
      if (id && title && !map[id]) {
        map[id] = true;
        items.push({ id: id, title: decodeHtml(title), posterUrl: img, backdropUrl: img, year: match1(b, /\b(20\d{2}|19\d{2})\b/) });
      }
    }
  } catch (e) {}
  return JSON.stringify({ items: items });
}

function parseSearchResponse(html) { return parseListResponse(html); }

function parseMovieDetail(html) {
  if (!html) return JSON.stringify({});
  var title = "", poster = "", desc = "", servers = [], eps = [], epMap = {};

  try {
    title = (match1(html, /<h1[^>]*class=["'][^"']*Title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
             match1(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
             match1(html, /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)).replace(/<[^>]+>/g, "").trim();

    poster = match1(html, /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (poster && poster.indexOf("http") !== 0) poster = BASE_URL + "/" + poster.replace(/^\/+/, "");

    desc = match1(html, /<div[^>]*class=["'][^"']*Description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
           match1(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

    // 1. Quét tất cả thẻ <a> có thể là tập phim hoặc nút Xem Phim / Xem Ngay
    var links = html.split("<a ");
    links.shift();
    while (links.length > 0) {
      var chunk = links.shift().substring(0, 600);
      var h = match1(chunk, /href=["']([^"']+)["']/i);
      var t = match1(chunk, />([\s\S]*?)<\/a>/i).replace(/<[^>]+>/g, "").trim();
      var lowerT = t.toLowerCase();

      if (!h || h === "#" || h.indexOf("javascript:") === 0 || h.indexOf("/the-loai/") !== -1 || h.indexOf("/quoc-gia/") !== -1) continue;

      if (
        h.indexOf("/xem-phim") !== -1 || h.indexOf("/tap-") !== -1 || h.indexOf("/watch") !== -1 ||
        lowerT.indexOf("xem phim") !== -1 || lowerT.indexOf("xem ngay") !== -1 ||
        lowerT.indexOf("tập ") === 0 || lowerT === "full" || lowerT === "hd"
      ) {
        var s = h.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
        if (s && !epMap[s]) {
          epMap[s] = true;
          eps.push({ id: s, name: decodeHtml(t) || "Xem Phim", slug: s });
        }
      }
    }

    // 2. Dự phòng chống "dữ liệu rỗng": Lấy từ og:url hoặc canonical nếu trang đã có sẵn trình phát
    if (eps.length === 0) {
      var pageUrl = match1(html, /<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i) ||
                    match1(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
      var cleanSlug = pageUrl.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
      if (cleanSlug) {
        eps.push({ id: cleanSlug, name: "Full / Tập 1", slug: cleanSlug });
      }
    }

    if (eps.length > 0) {
      servers.push({ serverName: "Server Chính", episodes: eps });
    }
  } catch (e) {}

  return JSON.stringify({
    title: decodeHtml(title),
    posterUrl: poster,
    backdropUrl: poster,
    description: decodeHtml(desc),
    servers: servers
  });
}

function parseDetailResponse(html) {
  if (!html) return JSON.stringify({ url: "" });
  var url = "", type = "hls";

  try {
    // 1. Bắt link .m3u8 trong data-link (mọi vị trí)
    var m3u8 = match1(html, /data-link=["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i) ||
               match1(html, /["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i);
    if (m3u8) {
      url = m3u8.replace(/\\\//g, "/");
      type = url.indexOf(".mp4") !== -1 ? "mp4" : "hls";
    }

    // 2. Bắt mọi link dự phòng trong data-link hoặc thẻ iframe (bỏ qua quảng cáo/MXH)
    if (!url) {
      var emb = match1(html, /data-link=["']((?:https?:)?\/\/[^"']+)["']/i) ||
                match1(html, /<iframe[^>]*src=["']((?:https?:)?\/\/[^"']+)["']/i);
      if (emb && emb.indexOf("facebook.com") === -1 && emb.indexOf("google") === -1 && emb.indexOf("doubleclick") === -1) {
        url = emb.replace(/\\\//g, "/");
        if (url.indexOf("//") === 0) url = "https:" + url;
        type = "embed";
      }
    }
  } catch (e) {}

  return JSON.stringify({
    url: url,
    type: type,
    headers: {
      "Referer": BASE_URL + "/",
      "Origin": BASE_URL,
      "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36"
    }
  });
}


