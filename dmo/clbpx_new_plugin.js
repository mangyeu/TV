// @Allowed-Domains: clbphimxua.info, *.clbphimxua.info, phimimg.com, *.phimimg.com, kkphimplayer1.com, *.kkphimplayer1.com, kkphimplayer5.com, *.kkphimplayer5.com, kkphimplayer6.com, *.kkphimplayer6.com, kkphimplayer7.com, *.kkphimplayer7.com, kkphimplayer8.com, *.kkphimplayer8.com, phimapi.com, *.phimapi.com, googleapis.com, *.googleapis.com

var BASE_URL = "https://clbphimxua.info";

function getManifest() {
  return JSON.stringify({ id: "clbphimxua", name: "CLB Phim Xưa", version: "2.2", type: "MOVIE", baseUrl: BASE_URL });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "phim-moi", title: "Phim Mới Cập Nhật", type: "HORIZONTAL", path: "phim-moi" },
    { slug: "country/hong-kong", title: "Phim TVB - Hồng Kông", type: "HORIZONTAL", path: "country/hong-kong" },
    { slug: "country/trung-quoc", title: "Phim Trung Quốc Xưa", type: "HORIZONTAL", path: "country/trung-quoc" },
    { slug: "country/viet-nam", title: "Phim Việt Nam Xưa", type: "HORIZONTAL", path: "country/viet-nam" },
    { slug: "kiem-hiep", title: "Phim Kiếm Hiệp", type: "HORIZONTAL", path: "kiem-hiep" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Phim Mới", slug: "phim-moi" }, { name: "Kiếm Hiệp", slug: "kiem-hiep" }, { name: "Cổ Trang", slug: "co-trang" },
    { name: "Võ Thuật", slug: "vo-thuat" }, { name: "Chiếu Rạp", slug: "chieu-rap" }, { name: "Hồng Kông", slug: "country/hong-kong" },
    { name: "Trung Quốc", slug: "country/trung-quoc" }, { name: "Đài Loan", slug: "country/dai-loan" }, { name: "Việt Nam", slug: "country/viet-nam" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({
    countries: [
      { name: "Tất cả", value: "" }, { name: "Hồng Kông", value: "hong-kong" }, { name: "Trung Quốc", value: "trung-quoc" },
      { name: "Đài Loan", value: "dai-loan" }, { name: "Việt Nam", value: "viet-nam" }, { name: "Hàn Quốc", value: "han-quoc" },
      { name: "Âu Mỹ", value: "au-my" }, { name: "Nhật Bản", value: "nhat-ban" }, { name: "Thái Lan", value: "thai-lan" }
    ],
    categories: [
      { name: "Tất cả", value: "" }, { name: "Kiếm Hiệp", value: "kiem-hiep" }, { name: "Cổ Trang", value: "co-trang" },
      { name: "Võ Thuật", value: "vo-thuat" }, { name: "Hành Động", value: "hanh-dong" }, { name: "Tâm Lý", value: "tam-ly" },
      { name: "Tình Cảm", value: "tinh-cam" }, { name: "Hình Sự", value: "hinh-su" }, { name: "Hài Hước", value: "hai-huoc" }
    ],
    years: [
      { name: "Tất cả", value: "" }, { name: "2020", value: "2020" }, { name: "2010", value: "2010" },
      { name: "2000", value: "2000" }, { name: "1995", value: "1995" }, { name: "1990", value: "1990" }
    ]
  });
}

function getUrlList(slug, filtersJson) {
  var f = JSON.parse(filtersJson || "{}"), p = Number(f.page) || 1;
  var c = f.country || f.countries || "", g = f.category || f.categories || "", y = f.year || "";
  var path = (slug || f.slug || f.path || "phim-moi").replace(/^\/+|\/+$/g, "");
  if (c && c !== "all") path = "country/" + c.replace(/^country\//, "");
  else if (g && g !== "all") path = g.replace(/^\//, "");
  else if (y && y !== "all") path = "release/" + y;
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
    // Chỉ lấy vùng nội dung chính từ main-contents trở đi để bỏ qua logo và menu
    var mainPos = html.indexOf("main-contents");
    var mainHtml = mainPos !== -1 ? html.substring(mainPos) : html;

    var aRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi, m;
    while ((m = aRegex.exec(mainHtml)) !== null) {
      var attrs = m.slice(1, 2).join("");
      var inner = m.slice(2, 3).join("");
      if (inner.indexOf("<img") === -1) continue;

      var href = match1(attrs, /href=["']([^"']+)["']/i);
      if (!href || href === "#" || href.indexOf("/country/") !== -1 || href.indexOf("/release/") !== -1 || href.indexOf("hflex_view") !== -1) continue;

      var title = match1(attrs, /title=["']([^"']+)["']/i) ||
                  match1(inner, /alt=["']([^"']+)["']/i) ||
                  inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      var img = match1(inner, /data-(?:src|original|lazy-src)=["']([^"']+)["']/i) ||
                match1(inner, /src=["']([^"']+)["']/i);

      if (img && img.indexOf("data:image") !== 0 && img.indexOf("http") !== 0) {
        img = BASE_URL + "/" + img.replace(/^\/+/, "");
      }

      var id = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
      if (id && title && img && !map[id]) {
        map[id] = true;
        items.push({ id: id, title: decodeHtml(title), posterUrl: img, backdropUrl: img, year: match1(inner, /\b(19\d{2}|20\d{2})\b/) });
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
  var title = "", poster = "", desc = "", servers = [], eps = [], epMap = {};
  try {
    title = match1(html, /id=["']bookmark["'][^>]*data-title=["']([^"']+)["']/i) || match1(html, /data-title=["']([^"']+)["'][^>]*id=["']bookmark["']/i) || match1(html, /<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "").trim();
    poster = match1(html, /id=["']bookmark["'][^>]*data-thumbnail=["']([^"']+)["']/i) || match1(html, /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (poster && poster.indexOf("http") !== 0) poster = BASE_URL + "/" + poster.replace(/^\/+/, "");
    desc = match1(html, /id=["']expand-post-content["'][^>]*>([\s\S]*?)<\/div>/i).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || match1(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

    var links = html.split("<a ");
    links.shift();
    while (links.length > 0) {
      var chunk = links.shift().substring(0, 600);
      var h = match1(chunk, /href=["']([^"']+)["']/i);
      var t = match1(chunk, />([\s\S]*?)<\/a>/i).replace(/<[^>]+>/g, "").trim();
      if (h && h.indexOf("/xem-phim-") !== -1 && t.length > 0 && t.length < 35) {
        var s = h.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
        if (s && !epMap[s]) { epMap[s] = true; eps.push({ id: s, name: decodeHtml(t), slug: s }); }
      }
    }
    if (eps.length === 0) {
      var ldUrl = match1(html, /"url"\s*:\s*"(https?:\/\/[^"]+\/xem-phim-[^"]+)"/i);
      if (ldUrl) {
        var ldSlug = ldUrl.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
        eps.push({ id: ldSlug, name: "Tập 1 / Xem Phim", slug: ldSlug });
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
    var m3u8 = match1(html, /["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i);
    if (m3u8) { url = m3u8.replace(/\\\//g, "/"); type = url.indexOf(".mp4") !== -1 ? "mp4" : "hls"; }
    if (!url) {
      var cfgLink = match1(html, /"(?:player_url|link|url|embed_url)"\s*:\s*"(https?:\\\/\\\/[^"]+)"/i);
      if (cfgLink) { url = cfgLink.replace(/\\\//g, "/"); type = (url.indexOf(".m3u8") !== -1 || url.indexOf(".mp4") !== -1) ? "hls" : "embed"; }
    }
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
