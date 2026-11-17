// @Allowed-Domains: phim.nguonc.com, *.nguonc.com, nguonc.com, *.nguonc.com, streamc.xyz, *.streamc.xyz, googleapis.com, *.googleapis.com

var BASE_URL = "https://nguonc.com";

function getManifest() {
  return JSON.stringify({
    id: "nguonc_vax",
    name: "Nguồn C",
    version: "2.1",
    type: "MOVIE",
    baseUrl: BASE_URL
  });
}

function getHomeSections() {
  return JSON.stringify(new Array(
    { slug: "danh-sach/phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "HORIZONTAL", path: "danh-sach/phim-moi-cap-nhat" },
    { slug: "danh-sach/phim-bo", title: "Phim Bộ Mới", type: "HORIZONTAL", path: "danh-sach/phim-bo" },
    { slug: "danh-sach/phim-le", title: "Phim Lẻ Mới", type: "HORIZONTAL", path: "danh-sach/phim-le" },
    { slug: "danh-sach/tv-shows", title: "TV Shows", type: "HORIZONTAL", path: "danh-sach/tv-shows" },
    { slug: "the-loai/co-trang", title: "Phim Cổ Trang", type: "HORIZONTAL", path: "the-loai/co-trang" }
  ));
}

function getPrimaryCategories() {
  return JSON.stringify(new Array(
    { name: "Phim Mới", slug: "danh-sach/phim-moi-cap-nhat" },
    { name: "Phim Bộ", slug: "danh-sach/phim-bo" },
    { name: "Phim Lẻ", slug: "danh-sach/phim-le" },
    { name: "TV Shows", slug: "danh-sach/tv-shows" },
    { name: "Hành Động", slug: "the-loai/hanh-dong" },
    { name: "Cổ Trang", slug: "the-loai/co-trang" },
    { name: "Trung Quốc", slug: "quoc-gia/trung-quoc" },
    { name: "Hàn Quốc", slug: "quoc-gia/han-quoc" },
    { name: "Việt Nam", slug: "quoc-gia/viet-nam" }
  ));
}

function getFilterConfig() {
  return JSON.stringify({
    countries: new Array(
      { name: "Tất cả", value: "" }, { name: "Trung Quốc", value: "trung-quoc" }, { name: "Hàn Quốc", value: "han-quoc" },
      { name: "Nhật Bản", value: "nhat-ban" }, { name: "Mỹ", value: "my" }, { name: "Hồng Kông", value: "hong-kong" },
      { name: "Thái Lan", value: "thai-lan" }, { name: "Việt Nam", value: "viet-nam" }, { name: "Đài Loan", value: "dai-loan" },
      { name: "Anh", value: "anh" }, { name: "Pháp", value: "phap" }, { name: "Đức", value: "duc" },
      { name: "Ấn Độ", value: "an-do" }, { name: "Nga", value: "nga" }, { name: "Úc", value: "uc" }
    ),
    categories: new Array(
      { name: "Tất cả", value: "" }, { name: "Hành Động", value: "hanh-dong" }, { name: "Phiêu Lưu", value: "phieu-luu" },
      { name: "Hoạt Hình", value: "hoat-hinh" }, { name: "Hài", value: "hai" }, { name: "Hình Sự", value: "hinh-su" },
      { name: "Tài Liệu", value: "tai-lieu" }, { name: "Chính Kịch", value: "chinh-kich" }, { name: "Gia Đình", value: "gia-dinh" },
      { name: "Giả Tưởng", value: "gia-tuong" }, { name: "Lịch Sử", value: "lich-su" }, { name: "Kinh Dị", value: "kinh-di" },
      { name: "Nhạc", value: "nhac" }, { name: "Bí Ẩn", value: "bi-an" }, { name: "Lãng Mạn", value: "lang-man" },
      { name: "Khoa Học Viễn Tưởng", value: "khoa-hoc-vien-tuong" }, { name: "Gây Cấn", value: "gay-can" },
      { name: "Chiến Tranh", value: "chien-tranh" }, { name: "Tâm Lý", value: "tam-ly" }, { name: "Tình Cảm", value: "tinh-cam" },
      { name: "Cổ Trang", value: "co-trang" }, { name: "Miền Tây", value: "mien-tay" }
    ),
    years: new Array(
      { name: "Tất cả", value: "" }, { name: "2026", value: "2026" }, { name: "2025", value: "2025" },
      { name: "2024", value: "2024" }, { name: "2023", value: "2023" }, { name: "2020", value: "2020" },
      { name: "2015", value: "2015" }, { name: "2010", value: "2010" }, { name: "2000", value: "2000" }
    )
  });
}

function getUrlList(slug, filtersJson) {
  var f = JSON.parse(filtersJson || "{}"), p = Number(f.page) || 1;
  var c = f.country || f.countries || "";
  var g = f.category || f.categories || "";
  var y = f.year || f.years || "";
  
  var path = (slug || f.slug || f.path || "danh-sach/phim-moi-cap-nhat").replace(/^\/+|\/+$/g, "");

  // 1. Ánh xạ chuẩn cho Bộ lọc (Quốc gia, Thể loại, Năm)
  if (c && c !== "all") {
    path = "quoc-gia/" + c.replace(/^quoc-gia\//, "");
  } else if (g && g !== "all") {
    path = "the-loai/" + g.replace(/^the-loai\//, "");
  } else if (y && y !== "all") {
    path = "nam-phat-hanh/" + y;
  }

  // 2. Đảm bảo đường dẫn luôn bắt đầu bằng đúng 1 trong 4 nhóm của API Nguồn C
  if (
    path.indexOf("danh-sach/") !== 0 &&
    path.indexOf("the-loai/") !== 0 &&
    path.indexOf("quoc-gia/") !== 0 &&
    path.indexOf("nam-phat-hanh/") !== 0
  ) {
    path = "danh-sach/" + path;
  }

  return BASE_URL + "/films/" + path + "?page=" + p;
}


function getUrlSearch(k, filtersJson) {
  var p = (JSON.parse(filtersJson || "{}")).page || 1;
  return BASE_URL + "/films/search?keyword=" + encodeURIComponent(k || "") + "&page=" + p;
}

function getUrlDetail(slug) {
  if (!slug) return "";
  var clean = slug.replace(/^.*\/film\//, "").replace(/^\/+|\/+$/g, "");
  return BASE_URL + "/film/" + clean;
}

function parseListResponse(jsonStr) {
  var items = new Array(), currentPage = 1, totalPages = 1, totalItems = 0;
  try {
    var data = JSON.parse(jsonStr || "{}");
    var list = data.items || new Array();
    while (list.length > 0) {
      var m = list.shift();
      if (!m || !m.slug) continue;
      items.push({
        id: m.slug,
        title: m.name || m.original_name || "",
        posterUrl: m.thumb_url || m.poster_url || "",
        backdropUrl: m.poster_url || m.thumb_url || "",
        year: ""
      });
    }
    if (data.paginate) {
      currentPage = Number(data.paginate.current_page) || 1;
      totalPages = Number(data.paginate.total_page) || 1;
      totalItems = Number(data.paginate.total_items) || (totalPages * 24);
    }
  } catch (e) {}

  return JSON.stringify({
    items: items,
    currentPage: currentPage,
    totalPages: totalPages,
    totalItems: totalItems,
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
    title = movie.name || "";
    poster = movie.thumb_url || movie.poster_url || "";
    desc = (movie.description || "").replace(/<[^>]+>/g, " ").trim();

    var epGroups = movie.episodes || new Array();
    while (epGroups.length > 0) {
      var sv = epGroups.shift(), eps = new Array();
      var svItems = sv.items || new Array();
      while (svItems.length > 0) {
        var ep = svItems.shift();
        var link = ep.m3u8 || ep.embed || "";
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
      var firstEp = d.movie.episodes.shift().items.shift();
      url = firstEp.m3u8 || firstEp.embed || "";
    } catch (e) {}
  }
  var type = url.indexOf(".m3u8") !== -1 ? "hls" : "embed";
  return JSON.stringify({ url: url, type: type });
}
