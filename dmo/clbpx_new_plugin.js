// @Allowed-Domains: phimapi.com, *.phimapi.com, phimimg.com, *.phimimg.com, kkphimplayer1.com, *.kkphimplayer1.com, kkphimplayer5.com, *.kkphimplayer5.com, kkphimplayer6.com, *.kkphimplayer6.com, kkphimplayer7.com, *.kkphimplayer7.com, kkphimplayer8.com, *.kkphimplayer8.com, googleapis.com, *.googleapis.com

var BASE_URL = "https://phimapi.com";

function getManifest() {
  return JSON.stringify({
    id: "kkphim_full",
    name: "KKPhim (Kho Phim Tổng Hợp)",
    version: "1.0",
    type: "MOVIE",
    baseUrl: BASE_URL
  });
}

function getHomeSections() {
  return JSON.stringify(new Array(
    { slug: "v1/api/danh-sach/phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "HORIZONTAL", path: "v1/api/danh-sach/phim-moi-cap-nhat" },
    { slug: "v1/api/danh-sach/phim-bo", title: "Phim Bộ Mới", type: "HORIZONTAL", path: "v1/api/danh-sach/phim-bo" },
    { slug: "v1/api/danh-sach/phim-le", title: "Phim Lẻ Mới", type: "HORIZONTAL", path: "v1/api/danh-sach/phim-le" },
    { slug: "v1/api/quoc-gia/hong-kong", title: "Phim TVB - Hồng Kông", type: "HORIZONTAL", path: "v1/api/quoc-gia/hong-kong" },
    { slug: "v1/api/the-loai/co-trang", title: "Phim Cổ Trang", type: "HORIZONTAL", path: "v1/api/the-loai/co-trang" }
  ));
}

function getPrimaryCategories() {
  return JSON.stringify(new Array(
    { name: "Phim Mới", slug: "v1/api/danh-sach/phim-moi-cap-nhat" },
    { name: "Phim Bộ", slug: "v1/api/danh-sach/phim-bo" },
    { name: "Phim Lẻ", slug: "v1/api/danh-sach/phim-le" },
    { name: "Hoạt Hình", slug: "v1/api/danh-sach/hoat-hinh" },
    { name: "Hồng Kông", slug: "v1/api/quoc-gia/hong-kong" },
    { name: "Trung Quốc", slug: "v1/api/quoc-gia/trung-quoc" },
    { name: "Hàn Quốc", slug: "v1/api/quoc-gia/han-quoc" },
    { name: "Việt Nam", slug: "v1/api/quoc-gia/viet-nam" }
  ));
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

function parseListResponse(jsonStr) {
  var items = new Array(), currentPage = 1, totalPages = 1, totalItems = 0;
  try {
    var raw = JSON.parse(jsonStr || "{}");
    var data = raw.data ? raw.data : raw;
    var list = data.items || new Array();
    while (list.length > 0) {
      var m = list.shift();
      if (!m || !m.slug) continue;
      items.push({
        id: m.slug,
        title: m.name || m.origin_name || "",
        posterUrl: fixImg(m.poster_url || m.thumb_url),
        backdropUrl: fixImg(m.thumb_url || m.poster_url),
        year: m.year ? String(m.year) : ""
      });
    }

    var pag = (data.params && data.params.pagination) ? data.params.pagination : (raw.pagination || {});
    currentPage = Number(pag.currentPage) || 1;
    totalItems = Number(pag.totalItems) || 0;
    var perPage = Number(pag.totalItemsPerPage) || 24;

    totalPages = Number(pag.totalPages) || 0;
    if (totalPages <= 1 && totalItems > 0) {
      totalPages = Math.ceil(totalItems / perPage);
    }
    if (totalPages <= 1 && items.length >= 10) {
      totalPages = currentPage + 10;
    }
  } catch (e) {}

  return JSON.stringify({
    items: items,
    currentPage: currentPage,
    totalPages: totalPages,
    totalItems: totalItems || (totalPages * 24),
    hasNextPage: items.length > 0 && currentPage < totalPages,
    pagination: {
      currentPage: currentPage,
      totalPages: totalPages
    }
  });
}


function getUrlSearch(k, filtersJson) {
  var p = (JSON.parse(filtersJson || "{}")).page || 1;
  return BASE_URL + "/v1/api/tim-kiem?keyword=" + encodeURIComponent(k || "") + "&page=" + p + "&limit=24";
}

function getUrlDetail(slug) {
  if (!slug) return "";
  var clean = slug.replace(/^.*\/phim\//, "").replace(/^\/+|\/+$/g, "");
  return BASE_URL + "/phim/" + clean;
}

function fixImg(url) {
  if (!url) return "";
  return url.indexOf("http") === 0 ? url : "https://phimimg.com" + url.replace(/^\/+/, "");
}

function parseSearchResponse(jsonStr) { return parseListResponse(jsonStr); }

function parseMovieDetail(jsonStr) {
  var title = "", poster = "", desc = "", servers = new Array();
  try {
    var data = JSON.parse(jsonStr || "{}");
    var movie = data.movie || {};
    title = movie.name || "";
    poster = fixImg(movie.poster_url || movie.thumb_url);
    desc = (movie.content || "").replace(/<[^>]+>/g, " ").trim();

    var epGroups = data.episodes || new Array();
    while (epGroups.length > 0) {
      var sv = epGroups.shift(), eps = new Array();
      var svItems = sv.server_data || new Array();
      while (svItems.length > 0) {
        var ep = svItems.shift();
        var link = ep.link_m3u8 || ep.link_embed || "";
        if (link) {
          eps.push({
            id: link,
            name: ep.name || ("Tập " + (eps.length + 1)),
            slug: link
          });
        }
      }
      if (eps.length > 0) {
        servers.push({ serverName: sv.server_name || ("Server #" + (servers.length + 1)), episodes: eps });
      }
    }
  } catch (e) {}
  return JSON.stringify({ title: title, posterUrl: poster, backdropUrl: poster, description: desc, servers: servers });
}

function parseDetailResponse(input) {
  var url = (input || "").trim();
  if (url.indexOf("{") === 0) {
    try {
      var d = JSON.parse(url);
      var firstEp = d.episodes.shift().server_data.shift();
      url = firstEp.link_m3u8 || firstEp.link_embed || "";
    } catch (e) {}
  }
  var type = url.indexOf(".m3u8") !== -1 ? "hls" : "embed";
  return JSON.stringify({ url: url, type: type });
}
