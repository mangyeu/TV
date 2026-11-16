// @Allowed-Domains: phimmoichillz.top, *.phimmoichillz.top, phimmoichill.top, *.phimmoichill.top, phimimg.com, *.phimimg.com, kkphimplayer5.com, *.kkphimplayer5.com, kkphimplayer6.com, *.kkphimplayer6.com, kkphimplayer7.com, *.kkphimplayer7.com, kkphimplayer8.com, *.kkphimplayer8.com, phimapi.com, *.phimapi.com, googleapis.com, *.googleapis.com

var BASE_URL = "https://phimmoichillz.top";

function getManifest() {
  return JSON.stringify({ id: "phimmoichillz", name: "PhimMoiChillZ", version: "5.1", type: "MOVIE", baseUrl: BASE_URL });
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

function parseDetailResponse(html) {
  if (!html) return JSON.stringify({ url: "" });
  var url = "", type = "hls";

  try {
    // 1. Tìm bất kỳ link .m3u8 nào nằm trong thuộc tính data-link (không phụ thuộc thứ tự thẻ)
    var linkM3u8 = match1(html, /data-link=["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
    if (linkM3u8) {
      url = linkM3u8;
      type = "hls";
    }

    // 2. Nếu chưa thấy, tìm chuỗi .m3u8 hoặc .mp4 bất kỳ trong mã nguồn trang
    if (!url) {
      var anyMedia = match1(html, /["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i);
      if (anyMedia) {
        url = anyMedia.replace(/\\\//g, "/");
        type = url.indexOf(".mp4") !== -1 ? "mp4" : "hls";
      }
    }

    // 3. Nếu phim chỉ có server nhúng (embed), lấy link trong data-link hoặc thẻ iframe
    if (!url) {
      var embLink = match1(html, /data-link=["'](https?:\/\/[^"']+)["']/i) ||
                    match1(html, /<iframe[^>]*src=["'](https?:\/\/[^"']+)["']/i);
      if (embLink && embLink.indexOf("facebook.com") === -1 && embLink.indexOf("google") === -1) {
        url = embLink;
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

