// @Allowed-Domains: ://nguonc.com, *.nguonc.com, ://nguonc.com, streamc.xyz, *.streamc.xyz, googleapis.com, *.googleapis.com

var BASE_URL = "https://nguonc.com";

function getManifest() {
  return JSON.stringify({
    id: "phim_nguonc",
    name: "Nguồn C",
    version: "3.8",
    type: "MOVIE",
    baseUrl: BASE_URL,
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
      "Referer": BASE_URL + "/",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
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
  var seen = "|", items = new Array(), totalPages = 1, currentPage = 1;
  if (!html) return JSON.stringify({ items: items });

  try {
    // 1. Quét danh sách phim theo từng hàng <tr>
    var rows = html.split("<tr");
    rows.shift();

    while (rows.length > 0) {
      var r = rows.shift().substring(0, 2200);
      if (r.indexOf("nc-movie-identity") === -1) continue;

      var href = match1(r, /href=["']([^"']+)["']/i);
      if (!href || href === "#") continue;

      var title = match1(r, /<strong>([\s\S]*?)<\/strong>/i).replace(/<[^>]+>/g, "") ||
                  match1(r, /alt=["']([^"']+)["']/i);

      var img = match1(r, /<img[^>]*data-src=["']([^"']+)["']/i) ||
                match1(r, /<img[^>]*src=["']([^"']+)["']/i);

      if (img && img.indexOf("data:image") !== 0 && img.indexOf("http") !== 0) {
        img = BASE_URL + "/" + img.replace(/^\/+/, "");
      }

      var id = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
      if (id && title && seen.indexOf("|" + id + "|") === -1) {
        seen += id + "|";
        items.push({
          id: id,
          title: decodeHtml(title),
          posterUrl: img,
          backdropUrl: img,
          year: match1(r, /\b(19\d{2}|20\d{2})\b/)
        });
      }
    }

    // 2. Lấy chính xác trang hiện tại từ thuộc tính aria-current="page" trên ://nguonc.com
    var curMatch = match1(html, /aria-current=["']page["'][^>]*>\s*(\d+)\s*</i);
    if (curMatch) {
      currentPage = parseInt(curMatch, 10) || 1;
    }

    // 3. Quét tổng số trang từ tất cả các nút ?page=...
    var pageRegex = /[?&]page=(\d+)/gi, pm;
    while ((pm = pageRegex.exec(html)) !== null) {
      var num = parseInt(pm.slice(1, 2).join(""), 10);
      if (num > totalPages && num < 5000) totalPages = num;
    }

    // Dự phòng: Nếu trang hiện tại >= totalPages mà vẫn còn đủ phim, tự mở thêm trang kế tiếp
    if (items.length >= 10 && totalPages <= currentPage) {
      totalPages = currentPage + 5;
    }
  } catch (e) {}

  return JSON.stringify({
    items: items,
    currentPage: currentPage,
    totalPages: totalPages,
    totalItems: totalPages * 24,
    hasNextPage: items.length > 0 && currentPage < totalPages,
    pagination: {
      currentPage: currentPage,
      totalPages: totalPages
    }
  });
}



function parseSearchResponse(html) { return parseListResponse(html); }

function parseMovieDetail(html) {
  if (!html) return JSON.stringify({});
  var title = "", poster = "", desc = "", servers = new Array();

  try {
    title = match1(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "").trim();
    poster = match1(html, /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (poster && poster.indexOf("http") !== 0) poster = BASE_URL + "/" + poster.replace(/^\/+/, "");
    desc = match1(html, /class=["'][^"']*nc-film-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
           match1(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

    // 1. Lấy danh sách tên các Server (.nc-player-server)
    var svNames = new Array();
    var svNameBlocks = html.split("nc-player-server");
    svNameBlocks.shift();
    while (svNameBlocks.length > 0) {
      var snb = svNameBlocks.shift().substring(0, 300);
      var sName = match1(snb, />([\s\S]*?)<\/button>/i).replace(/<[^>]+>/g, "").trim();
      if (sName && sName.length < 40) {
        svNames.push(decodeHtml(sName));
      }
    }

    // 2. Quét danh sách tập phim theo từng khối (.nc-player-episodes__grid)
    var svBlocks = html.split("nc-player-episodes__grid");
    svBlocks.shift();

    while (svBlocks.length > 0) {
      var sb = svBlocks.shift().substring(0, 50000);
      var endGrid = sb.indexOf("</div>");
      if (endGrid !== -1) sb = sb.substring(0, endGrid);

      var eps = new Array(), epSeen = "|";
      var btnBlocks = sb.split("nc-player-episode");
      btnBlocks.shift();

      while (btnBlocks.length > 0) {
        var b = btnBlocks.shift().substring(0, 600);
        var link = match1(b, /data-(?:link|embed|url|src)=["']([^"']+)["']/i) ||
                   match1(b, /href=["']([^"']+)["']/i);
        var name = match1(b, />([\s\S]*?)<\/(?:button|a)>/i).replace(/<[^>]+>/g, "").trim();

        if (link && link !== "#" && link.indexOf("javascript:") !== 0) {
          var cleanId = link.indexOf("http") === 0 ? link : link.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
          if (cleanId && epSeen.indexOf("|" + cleanId + "|") === -1) {
            epSeen += cleanId + "|";
            eps.push({
              id: cleanId,
              name: decodeHtml(name) || ("Tập " + (eps.length + 1)),
              slug: cleanId
            });
          }
        }
      }

      if (eps.length > 0) {
        var currentSvName = svNames.length > 0 ? svNames.shift() : ("Server #" + (servers.length + 1));
        servers.push({
          serverName: currentSvName,
          episodes: eps
        });
      }
    }

    // 3. Dự phòng nếu tập phim nằm dạng link nhúng trong script
    if (servers.length === 0) {
      var jsonEmbeds = html.match(/https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)|https?:\/\/[^"'\s\\]+\/embed\/[^"'\s\\]+/gi);
      if (jsonEmbeds && jsonEmbeds.length > 0) {
        var fallbackEps = new Array(), fSeen = "|";
        while (jsonEmbeds.length > 0) {
          var rawUrl = jsonEmbeds.shift().replace(/\\\//g, "/");
          if (fSeen.indexOf("|" + rawUrl + "|") === -1) {
            fSeen += rawUrl + "|";
            fallbackEps.push({
              id: rawUrl,
              name: "Tập " + (fallbackEps.length + 1),
              slug: rawUrl
            });
          }
        }
        if (fallbackEps.length > 0) {
          servers.push({ serverName: "Server Chính", episodes: fallbackEps });
        }
      }
    }

    // 4. Sắp xếp ưu tiên Server Thuyết Minh lên đầu tiên
    if (servers.length > 1) {
      var tmServers = new Array();
      var otherServers = new Array();
      while (servers.length > 0) {
        var sv = servers.shift();
        var lowerName = (sv.serverName || "").toLowerCase();
        if (lowerName.indexOf("thuyết minh") !== -1 || lowerName.indexOf("thuyet minh") !== -1) {
          tmServers.push(sv);
        } else {
          otherServers.push(sv);
        }
      }
      servers = tmServers.concat(otherServers);
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


function parseDetailResponse(input) {
  if (!input) return JSON.stringify({ url: "" });
  var raw = input.trim();
  var url = "", type = "embed";

  // Trường hợp 1: VAX Player truyền thẳng URL của tập phim từ slug/id
  if (raw.indexOf("http") === 0 && raw.indexOf("<") === -1) {
    url = raw;
    type = (url.indexOf(".m3u8") !== -1 || url.indexOf(".mp4") !== -1) ? "hls" : "embed";
    return JSON.stringify({
      url: url,
      type: type,
      headers: { "Referer": BASE_URL + "/", "Origin": BASE_URL }
    });
  }

  // Trường hợp 2: VAX Player truyền vào mã HTML của trang
  try {
    var m3u8 = match1(raw, /["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i);
    if (m3u8) {
      url = m3u8.replace(/\\\//g, "/");
      type = url.indexOf(".mp4") !== -1 ? "mp4" : "hls";
    }
    if (!url) {
      var emb = match1(raw, /data-(?:link|embed|url|src)=["'](https?:\/\/[^"']+)["']/i) ||
                match1(raw, /<iframe[^>]*src=["']((?:https?:)?\/\/[^"']+)["']/i);
      if (emb && emb.indexOf("facebook.com") === -1 && emb.indexOf("google") === -1) {
        url = emb.replace(/\\\//g, "/");
        if (url.indexOf("//") === 0) url = "https:" + url;
        type = "embed";
      }
    }
  } catch (e) {}

  return JSON.stringify({
    url: url,
    type: type,
    headers: { "Referer": BASE_URL + "/", "Origin": BASE_URL }
  });
}

