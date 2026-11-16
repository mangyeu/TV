// @Allowed-Domains: phimmoichillz.top, *.phimmoichillz.top, phimmoichill.top, *.phimmoichill.top, phimimg.com, *.phimimg.com, *.kkphimplayer7.com, *.kkphimplayer6.com, *.kkphimplayer5.com, *.kkphimplayer8.com, *.phimapi.com, googleapis.com, *.googleapis.com

var BASE_URL = "https://phimmoichillz.top";

function getManifest() {
  return JSON.stringify({ id: "phimmoichillz", name: "PhimMoiChillZ", version: "4.0", type: "MOVIE", baseUrl: BASE_URL });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "danh-sach/phim-le", title: "Phim Lẻ Mới", type: "HORIZONTAL", path: "danh-sach/phim-le" },
    { slug: "danh-sach/phim-bo", title: "Phim Bộ Mới", type: "HORIZONTAL", path: "danh-sach/phim-bo" },
    { slug: "danh-sach/phim-chieu-rap", title: "Chiếu Rạp", type: "HORIZONTAL", path: "danh-sach/phim-chieu-rap" },
    { slug: "the-loai/hoat-hinh", title: "Hoạt Hình", type: "HORIZONTAL", path: "the-loai/hoat-hinh" },
    { slug: "quoc-gia/viet-nam", title: "Việt Nam", type: "HORIZONTAL", path: "quoc-gia/viet-nam" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Phim Bộ", slug: "danh-sach/phim-bo" }, { name: "Phim Lẻ", slug: "danh-sach/phim-le" },
    { name: "Hoạt Hình", slug: "the-loai/hoat-hinh" }, { name: "Chiếu Rạp", slug: "danh-sach/phim-chieu-rap" },
    { name: "Việt Nam", slug: "quoc-gia/viet-nam" }, { name: "Hồng Kông", slug: "quoc-gia/hong-kong" },
    { name: "Ấn Độ", slug: "quoc-gia/an-do" }, { name: "Pháp", slug: "quoc-gia/phap" },
    { name: "Nga", slug: "quoc-gia/nga" }, { name: "Singapore", slug: "quoc-gia/singapore" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({
    countries: [
      { name: "Tất cả", value: "" }, { name: "Việt Nam", value: "viet-nam" }, { name: "Hồng Kông", value: "hong-kong" },
      { name: "Ấn Độ", value: "an-do" }, { name: "Nga", value: "nga" }, { name: "Pháp", value: "phap" },
      { name: "Đức", value: "duc" }, { name: "Úc", value: "uc" }, { name: "Ý", value: "y" },
      { name: "Tây Ban Nha", value: "tay-ban-nha" }, { name: "Canada", value: "canada" }, { name: "Indonesia", value: "indonesia" },
      { name: "Philippines", value: "philippines" }, { name: "Malaysia", value: "malaysia" }, { name: "Mexico", value: "mexico" },
      { name: "Nam Phi", value: "nam-phi" }, { name: "Brazil", value: "brazil" }, { name: "Na Uy", value: "na-uy" },
      { name: "Thụy Điển", value: "thuy-dien" }, { name: "Ba Lan", value: "ba-lan" }, { name: "Hà Lan", value: "ha-lan" },
      { name: "Ireland", value: "ireland" }, { name: "Bỉ", value: "bi" }, { name: "Đan Mạch", value: "dan-mach" },
      { name: "Ukraina", value: "ukraina" }, { name: "Phần Lan", value: "phan-lan" }, { name: "Thụy Sĩ", value: "thuy-si" },
      { name: "UAE", value: "uae" }, { name: "Ả Rập Xê Út", value: "a-rap-xe-ut" }, { name: "Bồ Đào Nha", value: "bo-dao-nha" },
      { name: "Colombia", value: "colombia" }, { name: "Chile", value: "chile" }, { name: "Hy Lạp", value: "hy-lap" },
      { name: "Nigeria", value: "nigeria" }, { name: "Argentina", value: "argentina" }, { name: "Singapore", value: "singapore" }
    ],
    categories: [
      { name: "Tất cả", value: "" }, { name: "Chính Kịch", value: "chinh-kich" }, { name: "Tình Cảm", value: "tinh-cam" },
      { name: "Tâm Lý", value: "tam-ly" }, { name: "Học Đường", value: "hoc-duong" }, { name: "Hành Động", value: "hanh-dong" },
      { name: "Phiêu Lưu", value: "phieu-luu" }, { name: "Hài Hước", value: "hai-huoc" }, { name: "Hoạt Hình", value: "hoat-hinh" },
      { name: "Gia Đình", value: "gia-dinh" }, { name: "Bí Ẩn", value: "bi-an" }, { name: "Cổ Trang", value: "co-trang" },
      { name: "Khoa Học", value: "khoa-hoc" }, { name: "Tài Liệu", value: "tai-lieu" }, { name: "Kinh Dị", value: "kinh-di" },
      { name: "Viễn Tưởng", value: "vien-tuong" }
    ],
    years: [{ name: "Tất cả", value: "" }, { name: "2026", value: "2026" }, { name: "2025", value: "2025" }, { name: "2024", value: "2024" }]
  });
}

function getUrlList(slug, filtersJson) {
  var f = JSON.parse(filtersJson || "{}"), p = f.page || 1;
  var c = f.country || f.countries || f.countryId || "";
  var g = f.category || f.categories || f.categoryId || "";
  var y = f.year || f.years || "";
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

function getGroup(m, i) {
  return (m && m.length > i) ? (m.slice(i, i + 1).join("") || "") : "";
}

function decodeHtml(s) {
  return (s || "").replace(/&#038;|&amp;/g, "&").replace(/&#8211;|&#8212;/g, "-").replace(/&#039;|&apos;/g, "'").replace(/&quot;/g, '"').trim();
}

function parseListResponse(html) {
  var map = {}, items = [];
  if (!html) return JSON.stringify({ items: items });
  try {
    var topPos = html.indexOf("MovieListTop"), main = html;
    if (topPos !== -1) {
      var listStart = html.indexOf("<ul", topPos);
      if (listStart === -1) listStart = html.indexOf("<section", topPos);
      if (listStart !== -1) main = html.substring(listStart);
    }
    var blocks = main.split(/<div[^>]*class=["'][^"']*\bTPostMv\b[^"']*["'][^>]*>/i);
    for (var i = 1; i < blocks.length; i++) {
      var b = getGroup(blocks, i).substring(0, 2000);
      var href = getGroup(b.match(/<a[^>]*href=["']([^"']+)["']/i), 1);
      if (!href || href.indexOf("/phim/") === -1) continue;
      var title = getGroup(b.match(/<h2[^>]*class=["'][^"']*Title[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i), 1).replace(/<[^>]+>/g, "") || getGroup(b.match(/<img[^>]*alt=["']([^"']+)["']/i), 1);
      var img = getGroup(b.match(/<img[^>]*data-src=["']([^"']+)["']/i), 1) || getGroup(b.match(/<img[^>]*src=["']([^"']+)["']/i), 1);
      if (img && img.indexOf("data:image") !== 0 && img.indexOf("http") !== 0) img = BASE_URL + "/" + img.replace(/^\/+/, "");
      var id = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
      if (id && title && !map[id]) {
        map[id] = true;
        items.push({ id: id, title: decodeHtml(title), posterUrl: img, backdropUrl: img, year: getGroup(b.match(/\b(20\d{2}|19\d{2})\b/), 1) });
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
    title = (getGroup(html.match(/<h1[^>]*class=["'][^"']*Title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i), 1) || getGroup(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i), 1)).replace(/<[^>]+>/g, "").trim();
    poster = getGroup(html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i), 1);
    if (poster && poster.indexOf("http") !== 0) poster = BASE_URL + "/" + poster.replace(/^\/+/, "");
    desc = getGroup(html.match(/<div[^>]*class=["'][^"']*Description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i), 1).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || getGroup(html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i), 1);
    
    // Quét danh sách tập phim (thường có link dạng /xem-phim/..., /tap-..., hoặc thẻ <a> trong danh sách tập)
    var epRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, m;
    while ((m = epRegex.exec(html)) !== null) {
      var h = getGroup(m, 1), t = getGroup(m, 2).replace(/<[^>]+>/g, "").trim();
      if (h && (h.indexOf("/xem-phim") !== -1 || h.indexOf("/tap-") !== -1 || h.indexOf("episode") !== -1 || h.indexOf("watch") !== -1) && t.length > 0 && t.length < 30) {
        var s = h.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
        if (s && !epMap[s]) { epMap[s] = true; eps.push({ id: s, name: decodeHtml(t), slug: s }); }
      }
    }
    // Nếu đang ở sẵn trang xem phim (có data-link) mà chưa thấy nút tập, tự tạo Tập 1
    if (eps.length === 0 && html.indexOf("data-link=") !== -1) {
      var curUrl = getGroup(html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i), 1);
      var curSlug = curUrl.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
      if (curSlug) eps.push({ id: curSlug, name: "Tập 1 / Full", slug: curSlug });
    }
    if (eps.length > 0) servers.push({ serverName: "Server Chính", episodes: eps });
  } catch (e) {}
  return JSON.stringify({ title: decodeHtml(title), posterUrl: poster, backdropUrl: poster, description: decodeHtml(desc), servers: servers });
}

function parseDetailResponse(html) {
  if (!html) return JSON.stringify({ url: "" });
  var url = "", type = "hls";
  try {
    // 1. Bắt chuẩn link .m3u8 từ thuộc tính data-link của nút server (chooseStreamingServer)
    var dataLink = getGroup(html.match(/data-type=["']m3u8["'][^>]*data-link=["']([^"']+)["']/i), 1) ||
                   getGroup(html.match(/data-link=["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i), 1);
    if (dataLink) {
      url = dataLink;
      type = "hls";
    }
    // 2. Dự phòng tìm chuỗi .m3u8 hoặc .mp4 bất kỳ trong mã nguồn
    if (!url) {
      var m3u8 = getGroup(html.match(/["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i), 1);
      if (m3u8) { url = m3u8.replace(/\\\//g, "/"); type = url.indexOf(".mp4") !== -1 ? "mp4" : "hls"; }
    }
    // 3. Dự phòng lấy link embed từ data-link
    if (!url) {
      var emb = getGroup(html.match(/data-link=["'](https?:\/\/[^"']+)["']/i), 1);
      if (emb) { url = emb; type = "embed"; }
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
