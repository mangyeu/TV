// @Allowed-Domains: clbphimxua.info, *.clbphimxua.info, phimimg.com, *.phimimg.com, ://nguonc.com, *.nguonc.com, kkphimplayer1.com, *.kkphimplayer1.com, kkphimplayer5.com, *.kkphimplayer5.com, kkphimplayer6.com, *.kkphimplayer6.com, kkphimplayer7.com, *.kkphimplayer7.com, kkphimplayer8.com, *.kkphimplayer8.com, phimapi.com, *.phimapi.com, googleapis.com, *.googleapis.com

var BASE_URL = "https://clbphimxua.info";

function getManifest() {
  return JSON.stringify({ id: "clbphimxua", name: "CLB Phim Xưa", version: "4.0", type: "MOVIE", baseUrl: BASE_URL });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "phim-moi", title: "Phim Mới Cập Nhật", type: "HORIZONTAL", path: "phim-moi" },
    { slug: "co-trang", title: "Phim Cổ Trang", type: "HORIZONTAL", path: "co-trang" },
    { slug: "kiem-hiep", title: "Phim Kiếm Hiệp", type: "HORIZONTAL", path: "kiem-hiep" },
    { slug: "country/hong-kong", title: "Phim TVB - Hồng Kông", type: "HORIZONTAL", path: "country/hong-kong" },
    { slug: "country/trung-quoc", title: "Phim Trung Quốc", type: "HORIZONTAL", path: "country/trung-quoc" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Phim Mới", slug: "phim-moi" }, { name: "Cổ Trang", slug: "co-trang" }, { name: "Kiếm Hiệp", slug: "kiem-hiep" },
    { name: "Võ Thuật", slug: "vo-thuat" }, { name: "Chiếu Rạp", slug: "chieu-rap" }, { name: "Hồng Kông", slug: "country/hong-kong" },
    { name: "Trung Quốc", slug: "country/trung-quoc" }, { name: "Đài Loan", slug: "country/dai-loan" }, { name: "Việt Nam", slug: "country/viet-nam" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({
    countries: [
      { name: "Tất cả", value: "" }, { name: "Hồng Kông", value: "hong-kong" }, { name: "Trung Quốc", value: "trung-quoc" },
      { name: "Đài Loan", value: "dai-loan" }, { name: "Việt Nam", value: "viet-nam" }, { name: "Hàn Quốc", value: "han-quoc" },
      { name: "Âu Mỹ", value: "au-my" }, { name: "Nhật Bản", value: "nhat-ban" }, { name: "Thái Lan", value: "thai-lan" },
      { name: "Ấn Độ", value: "an-do" }, { name: "Anh", value: "anh" }, { name: "Pháp", value: "phap" }, { name: "Nga", value: "nga" }
    ],
    categories: [
      { name: "Tất cả", value: "" }, { name: "Cổ Trang", value: "co-trang" }, { name: "Kiếm Hiệp", value: "kiem-hiep" },
      { name: "Võ Thuật", value: "vo-thuat" }, { name: "Hành Động", value: "hanh-dong" }, { name: "Phiêu Lưu", value: "phieu-luu" },
      { name: "Tâm Lý", value: "tam-ly" }, { name: "Tình Cảm", value: "tinh-cam" }, { name: "Hình Sự", value: "hinh-su" },
      { name: "Hài Hước", value: "hai-huoc" }, { name: "Thần Thoại", value: "than-thoai" }, { name: "Kinh Dị", value: "kinh-di" },
      { name: "Chiến Tranh", value: "chien-tranh" }, { name: "Lịch Sử", value: "lich-su" }, { name: "Kinh Điển", value: "kinh-dien" },
      { name: "Chính Kịch", value: "chinh-kich" }, { name: "Gia Đình", value: "gia-dinh" }, { name: "Hoạt Hình", value: "hoat-hinh" }
    ],
    years: [
      { name: "Tất cả", value: "" }, { name: "2026", value: "2026" }, { name: "2025", value: "2025" }, { name: "2020", value: "2020" },
      { name: "2010", value: "2010" }, { name: "2000", value: "2000" }, { name: "1995", value: "1995" }, { name: "1990", value: "1990" }
    ],
    sorts: [
      { name: "Mới cập nhật", value: "updatetime" }, { name: "Mới đăng", value: "posttime" }, { name: "Xem nhiều", value: "viewcount" }
    ]
  });
}

function getUrlList(slug, filtersJson) {
  var f = JSON.parse(filtersJson || "{}"), p = Number(f.page) || 1;
  var c = f.country || f.countries || "", g = f.category || f.categories || "", y = f.year || "", s = f.sort || "";
  if ((c && c !== "all") || (y && y !== "all") || (s && s !== "latest" && s !== "updatetime")) {
    var q = [];
    if (s && s !== "latest") q.push("sort=" + s);
    if (c && c !== "all") q.push("country=" + c.replace(/^country\//, ""));
    if (y && y !== "all") q.push("release=" + y);
    if (g && g !== "all") q.push("category=" + g.replace(/^\//, ""));
    if (p > 1) q.push("page=" + p);
    return BASE_URL + "/filter-movies?" + q.join("&");
  }
  if (g && g !== "all") return BASE_URL + "/" + g.replace(/^\//, "") + (p > 1 ? "/page/" + p : "");
  var path = (slug || f.slug || f.path || "phim-moi").replace(/^\/+|\/+$/g, "");
  return (path === "phim-moi" || path === "home") ? (BASE_URL + (p > 1 ? "/page/" + p : "/")) : (BASE_URL + "/" + path + (p > 1 ? "/page/" + p : ""));
}

function getUrlSearch(k, filtersJson) {
  var p = (JSON.parse(filtersJson || "{}")).page || 1;
  return BASE_URL + (p > 1 ? "/page/" + p : "") + "/?s=" + encodeURIComponent(k || "").replace(/%20/g, "+");
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
  var map = {}, items = [], totalPages = 1, currentPage = 1;
  if (!html) return JSON.stringify({ items: items });
  try {
    var mainEnd = html.indexOf("</main>");
    var mainHtml = mainEnd !== -1 ? html.substring(0, mainEnd) : html;
    var blocks = mainHtml.split(/<a[^>]*class=["'][^"']*\bhalim-thumb\b[^"']*["']/i);
    blocks.shift();
    while (blocks.length > 0) {
      var b = blocks.shift().substring(0, 1500);
      var href = match1(b, /href=["']([^"']+)["']/i);
      if (!href || href === "#") continue;
      var title = match1(b, /<h2[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i).replace(/<[^>]+>/g, "") || match1(b, /title=["']([^"']+)["']/i) || match1(b, /alt=["']([^"']+)["']/i);
      var img = match1(b, /<img[^>]*src=["']([^"']+)["']/i) || match1(b, /<img[^>]*data-src=["']([^"']+)["']/i);
      if (img && img.indexOf("data:image") !== 0 && img.indexOf("http") !== 0) img = BASE_URL + "/" + img.replace(/^\/+/, "");
      var id = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
      if (id && title && !map[id]) {
        map[id] = true;
        items.push({ id: id, title: decodeHtml(title), posterUrl: img, backdropUrl: img, year: match1(b, /\b(19\d{2}|20\d{2})\b/) });
      }
    }
    var pageRegex = /\/page\/(\d+)/gi, pm;
    while ((pm = pageRegex.exec(html)) !== null) {
      var num = parseInt(pm.slice(1, 2).join(""), 10);
      if (num > totalPages && num < 5000) totalPages = num;
    }
    if (totalPages === 1 && items.length >= 10) totalPages = 50;
  } catch (e) {}
  return JSON.stringify({ items: items, currentPage: currentPage, totalPages: totalPages, hasNextPage: items.length > 0 && currentPage < totalPages });
}

function parseSearchResponse(html) { return parseListResponse(html); }

function parseMovieDetail(html) {
  if (!html) return JSON.stringify({});
  var title = "", poster = "", desc = "", servers = [];
  try {
    title = match1(html, /id=["']bookmark["'][^>]*data-title=["']([^"']+)["']/i) || match1(html, /<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "").trim();
    poster = match1(html, /id=["']bookmark["'][^>]*data-thumbnail=["']([^"']+)["']/i) || match1(html, /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (poster && poster.indexOf("http") !== 0) poster = BASE_URL + "/" + poster.replace(/^\/+/, "");
    desc = match1(html, /id=["']expand-post-content["'][^>]*>([\s\S]*?)<\/div>/i).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || match1(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

    // 1. Giải mã trực tiếp biến var jsonEpisodes = [[...]] của clbphimxua.info
    var jsonStr = match1(html, /var\s+jsonEpisodes\s*=\s*(\[\s*\[[\s\S]*?\]\s*\])\s*;/i);
    if (jsonStr) {
      var svGroups = JSON.parse(jsonStr);
      for (var i = 0; i < svGroups.length; i++) {
        var group = svGroups.slice(i, i + 1).shift() || [];
        var eps = [];
        for (var j = 0; j < group.length; j++) {
          var ep = group.slice(j, j + 1).shift();
          if (ep && ep.postUrl) {
            var epSlug = ep.postUrl.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
            eps.push({ id: epSlug, name: ep.episodeName || ("Tập " + (j + 1)), slug: epSlug });
          }
        }
        if (eps.length > 0) {
          servers.push({ serverName: "Server #" + (i + 1), episodes: eps });
        }
      }
    }

    // 2. Dự phòng nếu đang ở trang giới thiệu (chưa có jsonEpisodes)
    if (servers.length === 0) {
      var ldUrl = match1(html, /"url"\s*:\s*"(https?:\/\/[^"]+\/xem-phim-[^"]+)"/i);
      if (ldUrl) {
        var ldSlug = ldUrl.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
        servers.push({ serverName: "Server Chính", episodes: [{ id: ldSlug, name: "Xem Phim", slug: ldSlug }] });
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
      if (emb && emb.indexOf("facebook.com") === -1 && emb.indexOf("google") === -1 && emb.indexOf("al5sm.com") === -1) {
        url = emb.replace(/\\\//g, "/");
        if (url.indexOf("//") === 0) url = "https:" + url;
        type = "embed";
      }
    }
  } catch (e) {}
return JSON.stringify({ url: url, type: type, headers: { "Referer": BASE_URL + "/", "Origin": BASE_URL, "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36" } });
}
