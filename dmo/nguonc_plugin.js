// @Allowed-Domains: phimapi.com, *.phimapi.com, phimimg.com, *.phimimg.com, *.phim1280.tv, *.kkphimplayer1.com, *.kkphimplayer2.com, *.kkphimplayer3.com, *.kkphimplayer4.com, *.kkphimplayer5.com, *.kkphimplayer6.com, *.kkphimplayer7.com, *.kkphimplayer8.com, *.kkphimplayer9.com, googleapis.com, *.googleapis.com

var BASE_URL = "https://phimapi.com";
var IMG_HOST = "https://phimimg" + ".com";

function getManifest() {
  return JSON.stringify({
    id: "kkphim_clbphimxua",
    name: "Kho Phim Xưa & Tổng Hợp (M3U8)",
    version: "3.3",
    type: "MOVIE",
    baseUrl: BASE_URL
  });
}

function getHomeSections() {
  return JSON.stringify(new Array(
    { slug: "v1/api/danh-sach/phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "HORIZONTAL", path: "v1/api/danh-sach/phim-moi-cap-nhat" },
    { slug: "v1/api/quoc-gia/hong-kong", title: "Phim TVB - Hồng Kông", type: "HORIZONTAL", path: "v1/api/quoc-gia/hong-kong" },
    { slug: "v1/api/quoc-gia/dai-loan", title: "Phim Đài Loan Xưa", type: "HORIZONTAL", path: "v1/api/quoc-gia/dai-loan" },
    { slug: "v1/api/the-loai/co-trang", title: "Phim Cổ Trang", type: "HORIZONTAL", path: "v1/api/the-loai/co-trang" },
    { slug: "v1/api/the-loai/vo-thuat", title: "Phim Kiếm Hiệp - Võ Thuật", type: "HORIZONTAL", path: "v1/api/the-loai/vo-thuat" }
  ));
}

function getPrimaryCategories() {
  return JSON.stringify(new Array(
    { name: "Phim Mới", slug: "v1/api/danh-sach/phim-moi-cap-nhat" },
    { name: "Phim Bộ", slug: "v1/api/danh-sach/phim-bo" },
    { name: "Phim Lẻ", slug: "v1/api/danh-sach/phim-le" },
    { name: "Hồng Kông", slug: "v1/api/quoc-gia/hong-kong" },
    { name: "Đài Loan", slug: "v1/api/quoc-gia/dai-loan" },
    { name: "Trung Quốc", slug: "v1/api/quoc-gia/trung-quoc" },
    { name: "Cổ Trang", slug: "v1/api/the-loai/co-trang" },
    { name: "Việt Nam", slug: "v1/api/quoc-gia/viet-nam" }
  ));
}

function getFilterConfig() {
  return JSON.stringify({
    countries: new Array(
      { name: "Tất cả", value: "" }, { name: "Hồng Kông", value: "hong-kong" }, { name: "Đài Loan", value: "dai-loan" },
      { name: "Trung Quốc", value: "trung-quoc" }, { name: "Hàn Quốc", value: "han-quoc" }, { name: "Việt Nam", value: "viet-nam" },
      { name: "Âu Mỹ", value: "au-my" }, { name: "Nhật Bản", value: "nhat-ban" }, { name: "Thái Lan", value: "thai-lan" }
    ),
    categories: new Array(
      { name: "Tất cả", value: "" }, { name: "Cổ Trang", value: "co-trang" }, { name: "Võ Thuật", value: "vo-thuat" },
      { name: "Hành Động", value: "hanh-dong" }, { name: "Hài Hước", value: "hai-huoc" }, { name: "Tình Cảm", value: "tinh-cam" },
      { name: "Tâm Lý", value: "tam-ly" }, { name: "Hình Sự", value: "hinh-su" }, { name: "Thần Thoại", value: "than-thoai" }
    ),
    years: new Array(
      { name: "Tất cả", value: "" }, { name: "2005", value: "2005" }, { name: "2000", value: "2000" },
      { name: "1998", value: "1998" }, { name: "1996", value: "1996" }, { name: "1995", value: "1995" }, { name: "1990", value: "1990" }
    )
  });
}

function getUrlList(slug, filtersJson) {
  var f = JSON.parse(filtersJson || "{}"), p = Number(f.page) || 1;
  var c = f.country || f.countries || "", g = f.category || f.categories || "", y = f.year || "";
  var path = (slug || f.slug || f.path || "v1/api/danh-sach/phim-moi-cap-nhat").replace(/^\/+|\/+$/g, "");

  if (c && c !== "all") path = "v1/api/quoc-gia/" + c;
  else if (g && g !== "all") path = "v1/api/the-loai/" + g;
  else if (y && y !== "all") path = "v1/api/nam/" + y;

  return BASE_URL + "/" + path + "?page=" + p + "&limit=24";
}

function getUrlSearch(k, filtersJson) {
  var p = (JSON.parse(filtersJson || "{}")).page || 1;
  return BASE_URL + "/v1/api/tim-kiem?keyword=" + encodeURIComponent(k || "") + "&page=" + p + "&limit=24";
}

function getUrlDetail(slug) {
  if (!slug) return "";
  if (slug.indexOf("http") === 0) return slug;
  // Tách lấy slug gốc của phim nếu có kèm chỉ số tập (vd: ten-phim|0|0)
  var baseSlug = slug.split("|").shift();
  var clean = baseSlug.replace(/^.*\/phim\//, "").replace(/^\/+|\/+$/g, "");
  return BASE_URL + "/phim/" + clean;
}

function makeImgUrl(url, cdn) {
  if (!url) return "";
  if (url.indexOf("http") === 0) return url;
  var base = (cdn || IMG_HOST).replace(/\/+$/, "");
  var path = url.replace(/^\/+/, "");
  if (path.indexOf("upload/") !== 0) path = "upload/vod/" + path;
  return base + "/" + path;
}

function parseListResponse(jsonStr) {
  var items = new Array(), currentPage = 1, totalPages = 1, totalItems = 0;
  try {
    var raw = JSON.parse(jsonStr || "{}");
    var data = raw.data ? raw.data : raw;
    var cdn = data.APP_DOMAIN_CDN_IMAGE || raw.APP_DOMAIN_CDN_IMAGE || IMG_HOST;
    var list = data.items || new Array();

    while (list.length > 0) {
      var m = list.shift();
      if (!m || !m.slug) continue;
      items.push({
        id: m.slug,
        title: m.name || m.origin_name || "",
        posterUrl: makeImgUrl(m.poster_url || m.thumb_url, cdn),
        backdropUrl: makeImgUrl(m.thumb_url || m.poster_url, cdn),
        year: m.year ? String(m.year) : ""
      });
    }

    var pag = (data.params && data.params.pagination) ? data.params.pagination : (raw.pagination || {});
    currentPage = Number(pag.currentPage) || 1;
    totalItems = Number(pag.totalItems) || 0;
    var perPage = Number(pag.totalItemsPerPage) || 24;
    totalPages = Number(pag.totalPages) || (totalItems > 0 ? Math.ceil(totalItems / perPage) : 1);
    if (totalPages <= 1 && items.length >= 10) totalPages = currentPage + 10;
  } catch (e) {}

  return JSON.stringify({
    items: items,
    currentPage: currentPage,
    totalPages: totalPages,
    totalItems: totalItems || (totalPages * 24),
    hasNextPage: items.length > 0 && currentPage < totalPages,
    pagination: { currentPage: currentPage, totalPages: totalPages }
  });
}

function parseSearchResponse(jsonStr) { return parseListResponse(jsonStr); }

function parseMovieDetail(jsonStr) {
  var title = "", poster = "", desc = "", servers = new Array();
  try {
    var data = JSON.parse(jsonStr || "{}");
    var movie = data.movie || {};
    var movieSlug = movie.slug || "";
    title = movie.name || "";
    poster = makeImgUrl(movie.poster_url || movie.thumb_url, IMG_HOST);
    desc = (movie.content || "").replace(/<[^>]+>/g, " ").trim();

    var epGroups = data.episodes || new Array();
    // Sắp xếp ưu tiên Server Thuyết Minh / Lồng Tiếng lên đầu trước khi đánh số
    if (epGroups.length > 1) {
      var vnGroups = new Array(), otherGroups = new Array();
      while (epGroups.length > 0) {
        var g = epGroups.shift();
        var low = (g.server_name || "").toLowerCase();
        if (low.indexOf("thuyết minh") !== -1 || low.indexOf("thuyet minh") !== -1 || low.indexOf("lồng tiếng") !== -1 || low.indexOf("long tieng") !== -1) {
          vnGroups.push(g);
        } else {
          otherGroups.push(g);
        }
      }
      epGroups = vnGroups.concat(otherGroups);
    }

    var svIdx = 0;
    while (epGroups.length > 0) {
      var sv = epGroups.shift(), eps = new Array();
      var svItems = sv.server_data || new Array();
      var epIdx = 0;
      while (svItems.length > 0) {
        var ep = svItems.shift();
        var link = ep.link_m3u8 || ep.link_embed || "";
        if (link) {
          var epTitle = ep.name ? (ep.name.toLowerCase().indexOf("tập") === -1 && ep.name.toLowerCase() !== "full" ? "Tập " + ep.name : ep.name) : ("Tập " + (epIdx + 1));
          // Truyền định danh chuẩn: slug-phim|thứ-tự-server|thứ-tự-tập
          var epId = movieSlug ? (movieSlug + "|" + svIdx + "|" + epIdx) : link;
          eps.push({ id: epId, name: epTitle, slug: epId });
        }
        epIdx++;
      }
      if (eps.length > 0) {
        servers.push({ serverName: sv.server_name || ("Server #" + (svIdx + 1)), episodes: eps });
      }
      svIdx++;
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

function parseDetailResponse(input, episodeId) {
  var raw = (input || "").trim();
  if (!raw) return JSON.stringify({ url: "" });

  var url = "";
  if (raw.indexOf("{") === 0) {
    try {
      var d = JSON.parse(raw);
      var epGroups = d.episodes || new Array();
      if (epGroups.length > 1) {
        var vnG = new Array(), otG = new Array();
        while (epGroups.length > 0) {
          var itemG = epGroups.shift();
          var lName = (itemG.server_name || "").toLowerCase();
          if (lName.indexOf("thuyết minh") !== -1 || lName.indexOf("thuyet minh") !== -1 || lName.indexOf("lồng tiếng") !== -1 || lName.indexOf("long tieng") !== -1) {
            vnG.push(itemG);
          } else {
            otG.push(itemG);
          }
        }
        epGroups = vnG.concat(otG);
      }

      var targetSv = 0, targetEp = 0;
      if (episodeId && episodeId.indexOf("|") !== -1) {
        var parts = episodeId.split("|");
        parts.shift();
        targetSv = parseInt(parts.shift(), 10) || 0;
        targetEp = parseInt(parts.shift(), 10) || 0;
      }

      // Lấy đúng Server và Tập được chọn
      var chosenSv = epGroups.slice(targetSv, targetSv + 1).shift() || epGroups.shift();
      var svList = (chosenSv && chosenSv.server_data) ? chosenSv.server_data : new Array();
      var chosenEp = svList.slice(targetEp, targetEp + 1).shift() || svList.shift();
      if (chosenEp) {
        url = chosenEp.link_m3u8 || chosenEp.link_embed || "";
      }
    } catch (e) {}
  } else if (raw.indexOf("http") === 0 && raw.indexOf("\n") === -1) {
    url = raw;
  }

  var type = (url.indexOf(".m3u8") !== -1 || url.indexOf(".mp4") !== -1) ? "hls" : "embed";
  return JSON.stringify({
    url: url,
    type: type,
    headers: {
      "Referer": "https://phimapi.com",
      "Origin": "https://phimapi.com",
      "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
    }
  });
}

