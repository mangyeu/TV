// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "phimmoichill",
        "name": "PhimMoiChill",
        "version": "1.0.1",
        "baseUrl": "https://phimmoichillz.top",
        "iconUrl": "https://phimmoichillz.top/icon-phimmoichill.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL"
    });
}

function getPrimaryCategories() {
  return JSON.stringify([
    // Các danh mục chính thường có trên thanh menu
    { name: "Phim Lẻ", slug: "phim-le" },
    { name: "Phim Bộ", slug: "phim-bo" },
    { name: "Phim Chiếu Rạp", slug: "phim-chieu-rap" },
    { name: "Phim Thuyết Minh", slug: "phim-thuyet-minh" },
    { name: "Phim Vietsub", slug: "phim-vietsub" },

    // Danh sách 27 quốc gia bóc tách từ HTML của bạn
    { name: "Nga", slug: "quoc-gia/nga" },
    { name: "Ấn Độ", slug: "quoc-gia/an-do" },
    { name: "Hồng Kông", slug: "quoc-gia/hong-kong" },
    { name: "Việt Nam", slug: "quoc-gia/viet-nam" },
    { name: "Úc", slug: "quoc-gia/uc" },
    { name: "Ý", slug: "quoc-gia/y" },
    { name: "Tây Ban Nha", slug: "quoc-gia/tay-ban-nha" },
    { name: "Canada", slug: "quoc-gia/canada" },
    { name: "Pháp", slug: "quoc-gia/phap" },
    { name: "Indonesia", slug: "quoc-gia/indonesia" },
    { name: "Philippines", slug: "quoc-gia/philippines" },
    { name: "Đức", slug: "quoc-gia/duc" },
    { name: "Malaysia", slug: "quoc-gia/malaysia" },
    { name: "Mexico", slug: "quoc-gia/mexico" },
    { name: "Nam Phi", slug: "quoc-gia/nam-phi" },
    { name: "Brazil", slug: "quoc-gia/brazil" },
    { name: "Na Uy", slug: "quoc-gia/na-uy" },
    { name: "Châu Phi", slug: "quoc-gia/chau-phi" },
    { name: "Thụy Điển", slug: "quoc-gia/thuy-dien" },
    { name: "Ba Lan", slug: "quoc-gia/ba-lan" },
    { name: "Hà Lan", slug: "quoc-gia/ha-lan" },
    { name: "Ireland", slug: "quoc-gia/ireland" },
    { name: "Bỉ", slug: "quoc-gia/bi" },
    { name: "Đan Mạch", slug: "quoc-gia/dan-mach" },
    { name: "Ukraina", slug: "quoc-gia/ukraina" },
    { name: "Phần Lan", slug: "quoc-gia/phan-lan" },
    { name: "Thụy Sĩ", slug: "quoc-gia/thuy-si" }
  ]);
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "quoc-gia/viet-nam", title: "Phim Việt Nam", type: "HORIZONTAL", path: "quoc-gia/viet-nam" },
    { slug: "quoc-gia/hong-kong", title: "Phim Hồng Kông", type: "HORIZONTAL", path: "quoc-gia/hong-kong" },
    { slug: "quoc-gia/an-do", title: "Phim Ấn Độ", type: "HORIZONTAL", path: "quoc-gia/an-do" },
    { slug: "quoc-gia/phap", title: "Phim Pháp", type: "HORIZONTAL", path: "quoc-gia/phap" },
    { slug: "quoc-gia/nga", title: "Phim Nga", type: "HORIZONTAL", path: "quoc-gia/nga" },
    { slug: "quoc-gia/duc", title: "Phim Đức", type: "HORIZONTAL", path: "quoc-gia/duc" },
    { slug: "quoc-gia/tay-ban-nha", title: "Phim Tây Ban Nha", type: "HORIZONTAL", path: "quoc-gia/tay-ban-nha" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({
    countries: [
      { name: "Tất cả quốc gia", value: "" },
      { name: "Nga", value: "nga" },
      { name: "Ấn Độ", value: "an-do" },
      { name: "Hồng Kông", value: "hong-kong" },
      { name: "Việt Nam", value: "viet-nam" },
      { name: "Úc", value: "uc" },
      { name: "Ý", value: "y" },
      { name: "Tây Ban Nha", value: "tay-ban-nha" },
      { name: "Canada", value: "canada" },
      { name: "Pháp", value: "phap" },
      { name: "Indonesia", value: "indonesia" },
      { name: "Philippines", value: "philippines" },
      { name: "Đức", value: "duc" },
      { name: "Malaysia", value: "malaysia" },
      { name: "Mexico", value: "mexico" },
      { name: "Nam Phi", value: "nam-phi" },
      { name: "Brazil", value: "brazil" },
      { name: "Na Uy", value: "na-uy" },
      { name: "Châu Phi", value: "chau-phi" },
      { name: "Thụy Điển", value: "thuy-dien" },
      { name: "Ba Lan", value: "ba-lan" },
      { name: "Hà Lan", value: "ha-lan" },
      { name: "Ireland", value: "ireland" },
      { name: "Bỉ", value: "bi" },
      { name: "Đan Mạch", value: "dan-mach" },
      { name: "Ukraina", value: "ukraina" },
      { name: "Phần Lan", value: "phan-lan" },
      { name: "Thụy Sĩ", value: "thuy-si" }
    ],
    categories: [
      { name: "Tất cả thể loại", value: "" }
      // Dán thêm danh sách thể loại từ HTML của web vào đây (ví dụ: { name: "Hành Động", value: "hanh-dong" })
    ],
    years: [
      { name: "Tất cả năm", value: "" },
      { name: "2026", value: "2026" },
      { name: "2025", value: "2025" },
      { name: "2024", value: "2024" },
      { name: "2023", value: "2023" },
      { name: "2022", value: "2022" },
      { name: "2021", value: "2021" },
      { name: "2020", value: "2020" }
    ],
    sorts: [
      { name: "Mới cập nhật", value: "latest" },
      { name: "Xem nhiều nhất", value: "views" },
      { name: "Năm phát hành", value: "year" }
    ]
  });
}


// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  var path = "";

  // 1. Ưu tiên xử lý nếu người dùng đang chọn trong Bộ lọc (Filter)
  if (filters.country && filters.country !== "") {
    path = "quoc-gia/" + filters.country;
  } else if (filters.category && filters.category !== "") {
    path = "the-loai/" + filters.category;
  } else if (filters.year && filters.year !== "") {
    path = "nam-phat-hanh/" + filters.year;
  } else {
    // 2. Lấy theo danh mục mặc định từ Trang chủ hoặc Menu (ví dụ: "phim-le", "quoc-gia/nga")
    path = (slug || "phim-moi").replace(/^\/+|\/+$/g, "");
  }

  var url = "https://phimmoichillz.top/ + path;

  // 3. Nối thêm phân trang chuẩn của WordPress
  if (page > 1) {
    url += "/page/" + page;
  }

  // 4. Nối tham số sắp xếp (nếu có và khác mặc định)
  if (filters.sort && filters.sort !== "" && filters.sort !== "latest") {
    url += "?sort=" + filters.sort;
  }

  return url;
}

function getUrlSearch(keyword, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  
  // Mã hóa từ khóa để xử lý tiếng Việt có dấu và khoảng trắng an toàn
  var encodedKeyword = encodeURIComponent(keyword || "").replace(/%20/g, "+");
  
  var url = "https://phimmoichillz.top";

  // Cấu trúc phân trang kết hợp tham số tìm kiếm ?s= chuẩn của WordPress
  if (page > 1) {
    url += "/page/" + page + "/?s=" + encodedKeyword;
  } else {
    url += "/?s=" + encodedKeyword;
  }

  return url;
}

function getUrlDetail(slug) {
  if (!slug) return "";

  // 1. Nếu slug bóc tách từ HTML đã là đường dẫn đầy đủ (http/https) thì giữ nguyên
  if (slug.indexOf("http://") === 0 || slug.indexOf("https://") === 0) {
    return slug;
  }

  // 2. Xóa dấu gạch chéo ở đầu (nếu có) rồi ghép với BASE_URL
  var cleanSlug = slug.replace(/^\/+/, "");
  return "https://phimmoichillz.top/" + cleanSlug;
}

function getUrlCategories() { return "https://phimmoichillz.top/"; }
function getUrlCountries() { return "https://phimmoichillz.top/"; }
function getUrlYears() { return "https://phimmoichillz.top/"; }

// =============================================================================
// PARSERS
// =============================================================================

var BASE_URL = "https://phimmoichillz.top";

function parseListResponse(html) {
  var moviesMap = {};
  var items = [];

  if (!html) return JSON.stringify({ items: items });

  try {
    // 1. Cắt chuỗi HTML theo từng thẻ mở của item (an toàn 100%, không bị lỗi thẻ lồng nhau)
    var blocks = html.split(/<(?:article|li|div)[^>]*class=["'][^"']*\b(?:item|film-item|post-item|movie-item|halim-item|tray-item)\b[^"']*["'][^>]*>/i);

    // Bỏ qua phần tử đầu tiên (header trước danh sách phim)
    for (var i = 1; i < blocks.length; i++) {
      // Giới hạn phạm vi tìm kiếm trong 2500 ký tự đầu của mỗi khối để tránh ăn sang phim kế tiếp
      var block = blocks[i].substring(0, 2500);

      // 2. Lấy đường dẫn (hỗ trợ cả nháy đơn ' và nháy kép ")
      var hrefMatch = block.match(/<a[^>]*href=["']([^"']+)["']/i);
      var href = hrefMatch ? hrefMatch[1] : "";

      // Bỏ qua nếu không phải link phim (ví dụ link rỗng, javascript, hoặc chuyên mục)
      if (!href || href === "#" || href.indexOf("javascript:") === 0) continue;

      // 3. Lấy tiêu đề (từ thuộc tính title của <a>, alt của <img>, hoặc thẻ tiêu đề)
      var title = "";
      var titleAttr = block.match(/<a[^>]*title=["']([^"']+)["']/i);
      var altAttr = block.match(/<img[^>]*alt=["']([^"']+)["']/i);
      var headingTag = block.match(/<(?:h2|h3|h4|p|span|div)[^>]*class=["'][^"']*(?:title|name)[^"']*["'][^>]*>([\s\S]*?)<\/(?:h2|h3|h4|p|span|div)>/i);

      if (titleAttr && titleAttr[1]) {
        title = titleAttr[1];
      } else if (headingTag && headingTag[1]) {
        title = headingTag[1].replace(/<[^>]+>/g, "");
      } else if (altAttr && altAttr[1]) {
        title = altAttr[1];
      }

      // 4. Lấy ảnh Poster (hỗ trợ cả background-image trong style và thẻ img)
      var posterUrl = "";
      var imgMatch = block.match(/<img[^>]*data-(?:src|original|lazy-src)=["']([^"']+)["']/i) ||
                     block.match(/<img[^>]*src=["']([^"']+)["']/i) ||
                     block.match(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/i);

      if (imgMatch && imgMatch[1]) {
        posterUrl = imgMatch[1];
      }

      if (posterUrl && posterUrl.indexOf("data:image") !== 0 && posterUrl.indexOf("http") !== 0) {
        posterUrl = BASE_URL + "/" + posterUrl.replace(/^\/+/, "");
      }

      // 5. Lấy năm phát hành
      var yearMatch = block.match(/\b(20\d{2}|19\d{2})\b/);
      var year = yearMatch ? yearMatch[1] : "";

      // 6. Chuẩn hóa id và lưu vào moviesMap
      var id = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");

      if (id && title && !moviesMap[id]) {
        var movieObj = {
          id: id,
          title: decodeHtmlEntities(title),
          posterUrl: posterUrl,
          backdropUrl: posterUrl,
          year: year
        };

        moviesMap[id] = movieObj;
        items.push(movieObj);
      }
    }
  } catch (e) {
    // Bỏ qua lỗi
  }

  return JSON.stringify({ items: items });
}

function parseSearchResponse(html) {
  return parseListResponse(html);
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}


var BASE_URL = "https://phimmoichillz.top";

function parseMovieDetail(html) {
  if (!html) return JSON.stringify({});

  try {
    // 1. Lấy tiêu đề phim (ưu tiên thẻ h1 hoặc meta og:title)
    var title = "";
    var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    var ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    
    if (h1Match && h1Match[1]) {
      title = h1Match[1].replace(/<[^>]+>/g, "").trim();
    } else if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1].trim();
    }

    // 2. Lấy ảnh Poster / Backdrop (từ meta og:image hoặc thẻ img chính)
    var posterUrl = "";
    var ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogImgMatch && ogImgMatch[1]) {
      posterUrl = ogImgMatch[1];
    }
    if (posterUrl && posterUrl.indexOf("http") !== 0) {
      posterUrl = BASE_URL + "/" + posterUrl.replace(/^\/+/, "");
    }

    // 3. Lấy nội dung tóm tắt phim
    var description = "";
    var descMatch = html.match(/<(?:div|p|article)[^>]*class=["'][^"']*(?:film-content|entry-content|content|description|storyline)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p|article)>/i) ||
                    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    // 4. Lấy năm phát hành
    var yearMatch = html.match(/(?:Năm|Year)[^<]*<\/[^>]+>\s*([^<\n]+)/i) || html.match(/\b(20\d{2}|19\d{2})\b/);
    var year = yearMatch ? yearMatch[1].trim() : "";

    // 5. Lấy danh sách Thể loại & Quốc gia
    var categories = [];
    var catRegex = /<a[^>]*href=["'][^"']*\/the-loai\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    var catMatch;
    while ((catMatch = catRegex.exec(html)) !== null) {
      var catName = catMatch[1].replace(/<[^>]+>/g, "").trim();
      if (catName && categories.indexOf(catName) === -1) {
        categories.push(catName);
      }
    }

    // 6. Bóc tách danh sách Server và Tập phim (Episodes)
    var servers = [];
    var episodesList = [];
    var epMap = {};

    // Quét các thẻ <a> nằm trong khu vực danh sách tập (thường chứa class halim-btn, btn-episode, hoặc link xem-phim)
    var epRegex = /<a[^>]*href=["']([^"']+)["'][^>]*(?:class=["'][^"']*(?:episode|halim-btn|btn-ep|server)[^"']*["']|data-episode|data-slug)[^>]*>([\s\S]*?)<\/a>/gi;
    var epMatch;

    while ((epMatch = epRegex.exec(html)) !== null) {
      var epHref = epMatch[1];
      var epName = epMatch[2].replace(/<[^>]+>/g, "").trim();
      var epSlug = epHref.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");

      if (epSlug && epName && !epMap[epSlug]) {
        epMap[epSlug] = true;
        episodesList.push({
          id: epSlug,
          name: decodeHtmlEntities(epName),
          slug: epSlug
        });
      }
    }

    // Dự phòng: Nếu trang chi tiết chỉ có nút "Xem Phim" (phim lẻ 1 tập) mà chưa hiện danh sách tập
    if (episodesList.length === 0) {
      var watchBtn = html.match(/<a[^>]*href=["']([^"']*(?:xem-phim|watch|tap-1|full)[^"']*)["'][^>]*>/i);
      if (watchBtn && watchBtn[1]) {
        var watchSlug = watchBtn[1].replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
        episodesList.push({
          id: watchSlug,
          name: "Full / Tập 1",
          slug: watchSlug
        });
      }
    }

    if (episodesList.length > 0) {
      servers.push({
        serverName: "Vietsub / Thuyết Minh",
        episodes: episodesList
      });
    }

    return JSON.stringify({
      title: decodeHtmlEntities(title),
      posterUrl: posterUrl,
      backdropUrl: posterUrl,
      description: decodeHtmlEntities(description),
      year: year,
      categories: categories,
      servers: servers
    });

  } catch (e) {
    return JSON.stringify({});
  }
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

var BASE_URL = "https://phimmoichillz.top";

function parseDetailResponse(html) {
  if (!html) return JSON.stringify({ url: "" });

  var streamUrl = "";
  var streamType = "hls"; // Mặc định ưu tiên luồng trực tiếp m3u8/mp4

  try {
    // 1. Ưu tiên tìm link phát trực tiếp .m3u8 hoặc .mp4 ẩn trong mã nguồn / biến JavaScript
    var directMatch = html.match(/["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i);
    if (directMatch && directMatch) {
      streamUrl = directMatch.replace(/\\\//g, "/");
      streamType = streamUrl.indexOf(".mp4") !== -1 ? "mp4" : "hls";
    }

    // 2. Tìm các biến cấu hình trình phát phổ biến của giao diện Halim/JWPlayer (ví dụ: file: "...", source: "...", link_play: "...")
    if (!streamUrl) {
      var playerVarMatch = html.match(/(?:file|source|link_play|url_play|stream_url)\s*[:=]\s*["'](https?:\/\/[^"'\s]+)["']/i);
      if (playerVarMatch && playerVarMatch) {
        streamUrl = playerVarMatch.replace(/\\\//g, "/");
        streamType = (streamUrl.indexOf(".m3u8") !== -1 || streamUrl.indexOf(".mp4") !== -1) ? "hls" : "embed";
      }
    }

    // 3. Dự phòng: Lấy đường dẫn trình phát nhúng từ thẻ <iframe>
    if (!streamUrl) {
      var iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi;
      var iframeMatch;
      while ((iframeMatch = iframeRegex.exec(html)) !== null) {
        var src = iframeMatch;
        // Bỏ qua các iframe quảng cáo, nút like Facebook hoặc Google Tag Manager
        if (
          src &&
          src.indexOf("facebook.com") === -1 &&
          src.indexOf("google") === -1 &&
          src.indexOf("doubleclick") === -1 &&
          src.indexOf("about:blank") === -1
        ) {
          streamUrl = src;
          streamType = "embed";
          break;
        }
      }
    }

    // Chuẩn hóa URL nếu đường dẫn bắt đầu bằng // (ví dụ: //vip.opstream...)
    if (streamUrl && streamUrl.indexOf("//") === 0) {
      streamUrl = "https:" + streamUrl;
    }

  } catch (e) {
    // Bỏ qua lỗi cú pháp nếu có
  }

  // 4. Trả về link phát kèm Headers bắt buộc để server video không chặn (lỗi 403 Forbidden)
  return JSON.stringify({
    url: streamUrl,
    type: streamType,
    headers: {
      "Referer": BASE_URL + "/",
      "Origin": BASE_URL,
      "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
    }
  });
}

function parseCategoriesResponse(html) {
    // Để cho dễ, trả về string rỗng hoặc menu tĩnh nếu trang không dễ parse menu
    return "[]";
}
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
