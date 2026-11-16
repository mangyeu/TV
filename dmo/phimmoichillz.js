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


function parseListResponse(html) {
  var moviesMap = {};
  var items = [];

  if (!html) return JSON.stringify({ items: items });

  try {
    // 1. Quét toàn bộ khối thẻ phim phổ biến trên WordPress phim
    var itemRegex = /<(?:article|li|div)[^>]*class="[^"]*\b(?:item|film-item|post-item|movie-item)\b[^"]*"[^>]*>([\s\S]*?)<\/(?:article|li|div)>/gi;
    var match;

    while ((match = itemRegex.exec(html)) !== null) {
      var block = match[1];

      // 2. Bóc tách đường dẫn (href) và tiêu đề (title)
      var linkMatch = block.match(/<a[^>]*href="([^"]+)"[^>]*title="([^"]+)"/i) ||
                      block.match(/<a[^>]*title="([^"]+)"[^>]*href="([^"]+)"/i);

      var href = "";
      var title = "";

      if (linkMatch) {
        if (linkMatch[1].indexOf("http") === 0 || linkMatch[1].indexOf("/") === 0) {
          href = linkMatch[1];
          title = linkMatch[2];
        } else {
          title = linkMatch[1];
          href = linkMatch[2];
        }
      } else {
        var hrefOnly = block.match(/<a[^>]*href="([^"]+)"/i);
        var titleOnly = block.match(/<(?:h2|h3|h4|p|span)[^>]*class="[^"]*(?:title|name)[^"]*"[^>]*>([\s\S]*?)<\/(?:h2|h3|h4|p|span)>/i);
        if (hrefOnly) href = hrefOnly[1];
        if (titleOnly) title = titleOnly[1].replace(/<[^>]+>/g, "").trim();
      }

      // 3. Bóc tách ảnh Poster (hỗ trợ cả ảnh tải chậm LazyLoad)
      var imgMatch = block.match(/<img[^>]*data-src="([^"]+)"/i) ||
                     block.match(/<img[^>]*data-original="([^"]+)"/i) ||
                     block.match(/<img[^>]*data-lazy-src="([^"]+)"/i) ||
                     block.match(/<img[^>]*src="([^"]+)"/i);
      var posterUrl = imgMatch ? imgMatch[1] : "";

      // Bỏ qua ảnh placeholder dạng base64 rỗng nếu có
      if (posterUrl.indexOf("data:image") === 0) {
        var realImg = block.match(/data-(?:src|original|lazy-src)="([^"]+)"/i);
        posterUrl = realImg ? realImg[1] : "";
      }

      if (posterUrl && posterUrl.indexOf("http") !== 0) {
        posterUrl = "https://phimmoichillz.top" + posterUrl.replace(/^\/+/, "");
      }

      // 4. Bóc tách năm phát hành
      var yearMatch = block.match(/\b(20\d{2}|19\d{2})\b/);
      var year = yearMatch ? yearMatch[1] : "";

      // 5. Chuẩn hóa id (slug) làm khóa chính cho moviesMap
      var id = href.replace("https://phimmoichillz.top", "").replace(/^\/+|\/+$/g, "");

      // 6. Lưu vào moviesMap để chống trùng lặp và đẩy vào mảng kết quả
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
    // Bỏ qua lỗi nếu HTML không hợp lệ
  }

  return JSON.stringify({ items: items });
}

// Hàm dùng chung cho kết quả tìm kiếm
function parseSearchResponse(html) {
  return parseListResponse(html);
}

// Hàm giải mã ký tự HTML đặc biệt
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


function parseMovieDetail(html) {
    try {
        // Tên phim
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        if (!titleMatch) titleMatch = html.match(/<h2[^>]*class="title[^"]*"[^>]*>([\s\S]*?)<\/h2>/);
        var title = titleMatch ? titleMatch[1].trim() : "";

        // ID phim (Slug) - Cần cực kỳ cẩn thận với regex để không lấy nhầm tag html
        var id = "";
        var idMatch = html.match(/<link rel="canonical" href="[^"]+\/(?:phim|info)\/([^"\/?>\s]+)/) ||
            html.match(/<meta property="og:url" content="[^"]+\/(?:phim|info)\/([^"\/?>\s]+)/);
        if (idMatch) id = idMatch[1];

        if (!id) {
            // Fallback từ các link trên trang, ưu tiên /info/ hoặc /phim/
            var pathMatch = html.match(/\/(?:phim|info)\/([^"\/?>\s.]+)(?:\.html|)/);
            id = pathMatch ? pathMatch[1] : "";
        }

        // Final check để đảm bảo id không chứa ký tự lạ của HTML
        if (id) {
            id = id.split('"')[0].split("'")[0].split('>')[0].split(' ')[0];
        }

        // Mô tả
        var descMatch = html.match(/<div[^>]*class="[^"]*film-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
            html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
            html.match(/id="info-film"[^>]*>([\s\S]*?)<\/div>/i);
        var description = descMatch ? descMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        // URL Ảnh Thumbnail
        var thumbMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/) ||
            html.match(/<img[^>]*class="[^"]*poster[^"]*"[^>]*src="([^"]+)"/);
        var thumb = thumbMatch ? thumbMatch[1] : "";

        // Servers và Episodes
        var serversMap = {};
        serversMap["Server 1"] = [];
        var defaultServerName = "PhimMoi";

        // PhimMoiChill thường có list tập dạng <li><a href="...xem/slug-tap-1...">...
        // Hoặc có thể nằm rải rác trong các nút "Xem phim"
        var epsArr = [];
        var epRegex = /<a[^>]+href="([^"]*(?:\/xem\/)[^"]*)"[^>]*>(?:<span[^>]*>)?([\s\S]*?)(?:<\/span>)?<\/a>/gi;
        var epMatch;
        var seenUrls = {};

        // Tìm trong toàn bộ HTML trang info
        while ((epMatch = epRegex.exec(html)) !== null) {
            var epUrl = epMatch[1];
            var epName = PluginUtils.cleanText(epMatch[2]);

            // Nếu là icon-play hoặc không có text rõ ràng, đặt là "Xem Phim"
            if (!epName || epName === "" || epMatch[0].indexOf("icon-play") > -1) {
                epName = "Xem Phim";
            }

            if (!seenUrls[epUrl]) {
                var fullEpUrl = (epUrl.indexOf("http") === 0) ? epUrl : ("https://phimmoichillz.top" + epUrl);
                epsArr.push({
                    id: fullEpUrl, // Dùng FULL URL để tránh bị app prefix /info/ khi fetch stream
                    name: epName,
                    slug: epName
                });
                seenUrls[epUrl] = true;
            }
        }

        if (epsArr.length > 0) {
            // Sắp xếp lại nếu cần, hoặc lọc các mảng rác
            // Thường thì danh sách tập sẽ có tên là "Tập 1", "Tập 2"...
            // Ưu tiên các link có text là số
            serversMap[defaultServerName] = epsArr;
        }

        // Nếu vẫn không có mảng tập nào
        if (!serversMap[defaultServerName] || serversMap[defaultServerName].length === 0) {
            serversMap[defaultServerName] = [{
                id: "",
                name: "Trailer",
                slug: "trailer"
            }];
        }

        var parsedServers = [];
        for (var serverName in serversMap) {
            if (serversMap.hasOwnProperty(serverName) && serversMap[serverName].length > 0) {
                parsedServers.push({
                    name: serverName,
                    episodes: serversMap[serverName]
                });
            }
        }

        // Status text 
        var labels = [];
        var qualityMatch = html.match(/<span[^>]*class="quality"[^>]*>([\s\S]*?)<\/span>/i);
        if (qualityMatch) labels.push(PluginUtils.cleanText(qualityMatch[1]));

        if (html.indexOf("4K") !== -1) {
            if (labels.join(" ").indexOf("4K") === -1) {
                labels.push("4K");
            }
        }

        var statusMatch = html.match(/<span[^>]*class="status"[^>]*>([\s\S]*?)<\/span>/i);
        if (statusMatch) labels.push(PluginUtils.cleanText(statusMatch[1]));

        return JSON.stringify({
            id: id,
            title: PluginUtils.cleanText(title),
            posterUrl: thumb,
            backdropUrl: thumb,
            description: PluginUtils.cleanText(description),
            servers: parsedServers,
            quality: (labels.join(" ").indexOf("4K") > -1) ? "4K" : "HD",
            lang: "Vietsub",
            year: 0,
            rating: 0,
            casts: "",
            director: "",
            country: "",
            category: "",
            status: labels.length > 0 ? labels.join(" | ") : "Full"
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html, fallbackUrl) {
    try {
        // Trên trang xem phim PhimMoiChill, frame phim thường được nhúng vào hoặc gọi ajax 
        // 1. Kiểm tra iframe trực tiếp
        var iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"/);
        if (iframeMatch) {
            var url = iframeMatch[1];
            // Bỏ qua các iframe rác như facebook, youtube trailer
            if (url.indexOf("facebook") === -1 && url.indexOf("youtube") === -1 && url.indexOf("google") === -1) {
                // Nếu iframe là src dạng //domain.com thì thêm https:
                if (url.indexOf("//") === 0) {
                    url = "https:" + url;
                }
                return JSON.stringify({
                    url: url,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Referer": "https://phimmoichillz.top/",
                        "Custom-Js": "(function() { var s = document.createElement('style'); s.textContent = '#header, #footer, .header, .footer, .sidebar, .sidebar-content, .comment-box, .film-note, .breadcrumb, div[id^=\"ads-\"], div[id*=\"banner\"], div[class*=\"ads-top\"], div[class*=\"ads-bottom\"] { display:none !important; }'; document.head.appendChild(s); })();"
                    },
                    subtitles: []
                });
            }
        }

        // 2. Thử tìm script chứa link m3u8 hoặc nguồn embed (nếu có player trực tiếp)
        var sourceMatch = html.match(/sources:\s*\[\s*{\s*file:\s*["']([^"']+)["']/i) ||
            html.match(/source\s*src\s*=\s*["']([^"']+)["']/i);
        if (sourceMatch) {
            return JSON.stringify({
                url: sourceMatch[1],
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": "https://phimmoichillz.top/"
                },
                subtitles: []
            });
        }

        // 3. Fallback: Cố gắng bóc tách div bọc ngoài trình embed thay vì load cả website
        var playerDivMatch = html.match(/<div[^>]+(?:id|class)=["'](?:player|box-player|player-content|video-container|streaming-container)["'][^>]*>[\s\S]*?<\/div>/i);
        if (playerDivMatch) {
            var playerHtml = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:0;background:#000;overflow:hidden;display:flex;justify-content:center;align-items:center;height:100vh;} .player-container{width:100%;height:100%;}</style></head><body><div class="player-container">' + playerDivMatch[0] + '</div></body></html>';
            return JSON.stringify({
                url: playerHtml,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": "https://phimmoichillz.top/",
                    "Custom-Js": "(function() { var s = document.createElement('style'); s.textContent = '#header, #footer, .header, .footer, .sidebar, .sidebar-content, .comment-box, .film-note, .breadcrumb, div[id^=\"ads-\"], div[id*=\"banner\"], div[class*=\"ads-top\"], div[class*=\"ads-bottom\"] { display:none !important; }'; document.head.appendChild(s); })();"
                },
                subtitles: []
            });
        }

        var fullWebUrl = (fallbackUrl && fallbackUrl.indexOf("http") === 0) ? fallbackUrl : ("https://phimmoichillz.top" + (fallbackUrl || ""));
        return JSON.stringify({
            url: fullWebUrl,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://phimmoichillz.top/",
                "Allowed-Domains": "phimmoichill.my, googleapis.com",
                "Custom-Js": "(function() { var s = document.createElement('style'); s.textContent = '#header, #footer, .header, .footer, .sidebar, .sidebar-content, .comment-box, .film-note, .breadcrumb, div[id^=\"ads-\"], div[id*=\"banner\"], div[class*=\"ads-top\"], div[class*=\"ads-bottom\"] { display:none !important; }'; document.head.appendChild(s); })();"
            },
            subtitles: []
        });



    } catch (e) {
        return JSON.stringify({ url: "https://phimmoichillz.top" + fallbackUrl, headers: {}, subtitles: [] });
    }
}

function parseCategoriesResponse(html) {
    // Để cho dễ, trả về string rỗng hoặc menu tĩnh nếu trang không dễ parse menu
    return "[]";
}
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
