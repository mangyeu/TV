var BASE_URL = "https://clbphimxua.info";

// 1. Khai báo thông tin nguồn
function getManifest() {
    return JSON.stringify({
        "id": "clbphimxua_info",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "type": "MOVIE",
        "layout": "VERTICAL"
    });
}

// 2. Cấu hình danh mục Trang chủ (Khớp với giao diện thực tế của clbphimxua.info)
function getHomeSections() {
    return JSON.stringify([
        { "slug": "phim-bo", "title": "Phim Bộ", "type": "GRID", "path": "phim-bo" },
        { "slug": "phim-le", "title": "Phim Lẻ", "type": "HORIZONTAL", "path": "phim-le" },
        { "slug": "kiem-hiep", "title": "Kiếm Hiệp - Cổ Trang", "type": "HORIZONTAL", "path": "the-loai/kiem-hiep" },
        { "slug": "tinh-cam", "title": "Phim Tình Cảm", "type": "HORIZONTAL", "path": "the-loai/tinh-cam" },
        { "slug": "hoat-hinh", "title": "Phim Hoạt Họa", "type": "HORIZONTAL", "path": "the-loai/hoat-hinh" }
    ]);
}

// 3. Cấu hình bộ lọc Thể loại
function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Phim Bộ", "slug": "phim-bo" },
        { "name": "Phim Lẻ", "slug": "phim-le" },
        { "name": "Kiếm Hiệp", "slug": "the-loai/kiem-hiep" },
        { "name": "Cổ Trang", "slug": "the-loai/co-trang" },
        { "name": "Hành Động", "slug": "the-loai/hanh-dong" },
        { "name": "Tình Cảm", "slug": "the-loai/tinh-cam" },
        { "name": "Hoạt Hình", "slug": "the-loai/hoat-hinh" },
        { "name": "Kinh Dị", "slug": "the-loai/kinh-di" },
        { "name": "Hài Hước", "slug": "the-loai/hai-huoc" },
        { "name": "Võ Thuật", "slug": "the-loai/vo-thuat" },
        { "name": "Tâm Lý", "slug": "the-loai/tam-ly" },
        { "name": "Kinh Điển", "slug": "the-loai/kinh-dien" }
    ]);
}

// 4. Sinh URL lấy danh sách & phân trang
function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    
    if (!slug || slug === "moi-cap-nhat") {
        return page > 1 ? BASE_URL + "/page/" + page + "/" : BASE_URL + "/";
    }
    return page > 1 ? BASE_URL + "/" + slug + "/page/" + page + "/" : BASE_URL + "/" + slug + "/";
}

// 5. Sinh URL tìm kiếm
function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var query = encodeURIComponent(keyword);
    return page > 1 ? BASE_URL + "/page/" + page + "/?s=" + query : BASE_URL + "/?s=" + query;
}

// Hàm giải mã ký tự đặc biệt HTML
function decodeHtmlEntities(str) {
    if (!str) return "";
    return str
        .replace(/&#8211;/g, "-")
        .replace(/&#8217;/g, "'")
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .trim();
}

// Hàm bóc tách danh sách phim từ chuỗi HTML
function extractMoviesFromHtml(html) {
    var items = [];
    var seenUrls = {};
    try {
        // Quét các khối item chứa đường dẫn phim, tiêu đề và hình ảnh (hỗ trợ cả src và data-src lazy-load)
        var regex = /<(?:article|div|li)[^>]*class="[^"]*(?:item|movie|post|film|card)[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*title="([^"]+)"[\s\S]*?<img[^>]+(?:data-src|src)="([^"]+)"/g;
        var match;

        while ((match = regex.exec(html)) !== null) {
            var url = match[1];
            var title = decodeHtmlEntities(match[2]);
            var poster = match[3];

            // Lọc bỏ các đường dẫn rác (tài khoản, diễn viên, thẻ tag, thể loại) và tránh trùng lặp
            if (
                url.indexOf(BASE_URL) !== -1 &&
                url.indexOf("/the-loai/") === -1 &&
                url.indexOf("/quoc-gia/") === -1 &&
                url.indexOf("/nam/") === -1 &&
                url.indexOf("/dien-vien/") === -1 &&
                !seenUrls[url]
            ) {
                seenUrls[url] = true;
                // Xử lý link ảnh tương đối nếu có
                if (poster.indexOf("/") === 0) {
                    poster = BASE_URL + poster;
                }
                items.push({
                    "id": url,
                    "title": title,
                    "posterUrl": poster,
                    "year": ""
                });
            }
        }
    } catch (e) {}
    return items;
}

// 6. Bóc tách HTML danh sách phim
function parseListResponse(html) {
    return JSON.stringify({
        "items": extractMoviesFromHtml(html)
    });
}

// 7. Bóc tách HTML kết quả tìm kiếm
function parseSearchResponse(html) {
    return JSON.stringify({
        "items": extractMoviesFromHtml(html)
    });
}

// 8. Sinh URL trang chi tiết phim
function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return BASE_URL + (slug.indexOf("/") === 0 ? slug : "/" + slug);
}

// 9. Bóc tách thông tin chi tiết & Danh sách tập phim
function parseMovieDetail(html) {
    var desc = "";
    var descMatch = html.match(/<div[^>]*class="[^"]*(?:entry-content|description|film-content|content|movie-desc)[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (descMatch) {
        desc = decodeHtmlEntities(descMatch[1].replace(/<[^>]+>/g, ""));
    }

    var episodes = [];
    var seenEps = {};

    // Khoanh vùng khu vực chứa danh sách tập phim
    var epSectionMatch = html.match(/<(?:ul|div)[^>]*class="[^"]*(?:list-eps|list-episode|episodes|server-list|halim-list-eps)[^"]*"[^>]*>([\s\S]*?)<\/(?:ul|div)>/);
    var targetHtml = epSectionMatch ? epSectionMatch[1] : html;

    var epRegex = /<a[^>]*href="([^"]+)"[^>]*>(?:<span[^>]*>)?([^<]+)(?:<\/span>)?<\/a>/g;
    var match;

    while ((match = epRegex.exec(targetHtml)) !== null) {
        var epUrl = match[1];
        var epName = decodeHtmlEntities(match[2]);

        // Lọc các đường dẫn là tập phim hoặc trang xem phim
        if (
            (epUrl.indexOf("tap-") !== -1 || epUrl.indexOf("episode") !== -1 || epUrl.indexOf("xem-phim") !== -1) &&
            !seenEps[epUrl]
        ) {
            seenEps[epUrl] = true;
            episodes.push({
                "id": epUrl,
                "name": epName
            });
        }
    }

    // Nếu là phim lẻ không chia tập, dùng nút "Xem ngay" hoặc chính URL hiện tại
    if (episodes.length === 0) {
        var watchBtnMatch = html.match(/<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?Xem ngay[\s\S]*?<\/a>/i);
        if (watchBtnMatch) {
            episodes.push({
                "id": watchBtnMatch[1],
                "name": "Full"
            });
        } else {
            var canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
            if (canonicalMatch) {
                episodes.push({
                    "id": canonicalMatch[1],
                    "name": "Full"
                });
            }
        }
    }

    return JSON.stringify({
        "description": desc,
        "episodes": [
            {
                "server_name": "Server CLBPhimXua",
                "server_data": episodes
            }
        ]
    });
}

// 10. Bóc tách link phát video từ trang xem phim
function parseDetailResponse(html) {
    var streamUrl = "";

    // Ưu tiên 1: Tìm link stream trực tiếp .m3u8 hoặc .mp4
    var m3u8Match = html.match(/(https?:\/\/[^\s'"\\]+\.(?:m3u8|mp4)[^\s'"\\]*)/);
    if (m3u8Match) {
        streamUrl = m3u8Match[1].replace(/\\\//g, "/");
    }

    // Ưu tiên 2: Tìm thẻ iframe nhúng trình phát video
    if (!streamUrl) {
        var iframeMatch = html.match(/<iframe[^>]+(?:data-src|src)="([^"]+)"/i);
        if (iframeMatch) {
            streamUrl = iframeMatch[1];
        }
    }

    return JSON.stringify({
        "url": streamUrl,
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": BASE_URL + "/"
        }
    });
}

motchill
const BASE_URL = "https://motchillf.im";

// Hàm hỗ trợ tải mã HTML của trang web
async function fetchHTML(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": BASE_URL + "/"
    }
  });
  return await response.text();
}

// 1. Hàm lấy danh sách phim ở Trang Chủ (Phim Hot, Phim Mới...)
async function getHome() {
  const html = await fetchHTML(BASE_URL);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const results = [];
  // Tìm tất cả thẻ <h3> chứa tên phim trên trang chủ
  const titleElements = doc.querySelectorAll("h3");

  titleElements.forEach((h3) => {
    // Tìm thẻ <a> và <img> bao quanh hoặc nằm cùng khối với thẻ <h3>
    const itemBox = h3.closest("li") || h3.closest("article") || h3.parentElement;
    const linkTag = itemBox?.querySelector("a");
    const imgTag = itemBox?.querySelector("img");

    if (linkTag) {
      let href = linkTag.getAttribute("href") || "";
      if (href && !href.startsWith("http")) {
        href = BASE_URL + (href.startsWith("/") ? "" : "/") + href;
      }

      const poster = imgTag?.getAttribute("data-src") || imgTag?.getAttribute("src") || "";

      results.push({
        title: h3.textContent.trim(),
        url: href,
        poster: poster
      });
    }
  });

  return results;
}

// 2. Hàm lấy thông tin chi tiết phim và danh sách các tập
async function getDetail(movieUrl) {
  const html = await fetchHTML(movieUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const title = doc.querySelector("h1")?.textContent.trim() || "Đang cập nhật";
  const episodes = [];

  // Quét các thẻ <a> dẫn đến trang xem phim (thường chứa chữ 'tap-' hoặc nút 'Xem phim')
  const links = doc.querySelectorAll("a");
  links.forEach((a) => {
    const href = a.getAttribute("href") || "";
    const text = a.textContent.trim();

    if (href.includes("tap-") || text.toLowerCase().includes("tập") || text.toLowerCase().includes("xem phim")) {
      const fullUrl = href.startsWith("http") ? href : BASE_URL + (href.startsWith("/") ? "" : "/") + href;
      episodes.push({
        name: text || "Full",
        url: fullUrl
      });
    }
  });

  return {
    title: title,
    episodes: episodes
  };
}

// 3. Hàm bóc tách link phát trực tiếp (.m3u8 hoặc .mp4)
async function getStream(episodeUrl) {
  const html = await fetchHTML(episodeUrl);

  // Cách 1: Quét trực tiếp link .m3u8 trong các biến cấu hình của trình phát
  const m3u8Match = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/);
  if (m3u8Match) {
    return {
      url: m3u8Match[0].replace(/\\/g, ""),
      headers: {
        "Referer": BASE_URL + "/",
        "Origin": BASE_URL
      }
    };
  }

  // Cách 2: Nếu web nhúng qua iframe, lấy link iframe để xử lý tiếp
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const iframeSrc = doc.querySelector("iframe")?.getAttribute("src");

  return {
    url: iframeSrc || "",
    headers: {
      "Referer": episodeUrl
    }
  };
}
