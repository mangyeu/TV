// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================


var BASE_URL = "https://clbphimxua.top";

// 1. Khai báo thông tin Plugin
function getManifest() {
    return JSON.stringify({
        "id": "clbphimxua_top",
        "name": "CLB Phim Xưa",
        "version": "1.0.0",
        "type": "MOVIE",
        "layout": "VERTICAL"
    });
}

// 2. Cấu hình danh mục Trang chủ
function getHomeSections() {
    return JSON.stringify([
        { "slug": "moi-cap-nhat", "title": "Phim Mới Cập Nhật", "type": "GRID", "path": "" },
        { "slug": "phim-bo", "title": "Phim Bộ Xưa", "type": "HORIZONTAL", "path": "phim-bo" },
        { "slug": "phim-le", "title": "Phim Lẻ Xưa", "type": "HORIZONTAL", "path": "phim-le" },
        { "slug": "tvb", "title": "Phim TVB", "type": "HORIZONTAL", "path": "the-loai/tvb" },
        { "slug": "kiem-hiep", "title": "Kiếm Hiệp - Cổ Trang", "type": "HORIZONTAL", "path": "the-loai/kiem-hiep" }
    ]);
}

// 3. Cấu hình bộ lọc thể loại
function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Phim Bộ", "slug": "phim-bo" },
        { "name": "Phim Lẻ", "slug": "phim-le" },
        { "name": "Kiếm Hiệp", "slug": "the-loai/kiem-hiep" },
        { "name": "Cổ Trang", "slug": "the-loai/co-trang" },
        { "name": "TVB", "slug": "the-loai/tvb" },
        { "name": "Hành Động", "slug": "the-loai/hanh-dong" },
        { "name": "Tình Cảm", "slug": "the-loai/tinh-cam" },
        { "name": "Kinh Dị", "slug": "the-loai/kinh-di" }
    ]);
}

// 4. Sinh URL lấy danh sách & phân trang
function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    
    if (slug === "moi-cap-nhat" || slug === "") {
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

// Hàm bóc tách danh sách phim từ chuỗi HTML
function extractMoviesFromHtml(html) {
    var items = [];
    var seenUrls = {};
    try {
        // Quét các khối bài viết chứa link phim, tiêu đề và ảnh poster
        var regex = /<(?:article|div|li)[^>]*class="[^"]*(?:item|movie|post|halim-item|film)[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*title="([^"]+)"[\s\S]*?<img[^>]*src="([^"]+)"/g;
        var match;

        while ((match = regex.exec(html)) !== null) {
            var url = match;
            var title = match.replace(/&#8211;/g, "-").replace(/&amp;/g, "&").replace(/&#039;/g, "'").trim();
            var poster = match;

            // Lọc bỏ các link không phải phim (như actor, tag) và tránh trùng lặp
            if (url.indexOf(BASE_URL) !== -1 && url.indexOf("/actor/") === -1 && url.indexOf("/tag/") === -1 && !seenUrls[url]) {
                seenUrls[url] = true;
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
    var descMatch = html.match(/<div[^>]*class="[^"]*(?:entry-content|description|film-content|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (descMatch) {
        desc = descMatch.replace(/<[^>]+>/g, "").trim();
    }

    var episodes = [];
    // Khoanh vùng danh sách tập phim
    var epSectionMatch = html.match(/<(?:ul|div)[^>]*class="[^"]*(?:halim-list-eps|list-eps|list-episode|episodes)[^"]*"[^>]*>([\s\S]*?)<\/(?:ul|div)>/);
    var targetHtml = epSectionMatch ? epSectionMatch : html;

    var epRegex = /<a[^>]*href="([^"]+)"[^>]*>(?:<span[^>]*>)?([^<]+)(?:<\/span>)?<\/a>/g;
    var match;
    var seenEps = {};

    while ((match = epRegex.exec(targetHtml)) !== null) {
        var epUrl = match;
        var epName = match.trim();
        
        // Nhận diện link tập phim
        if ((epUrl.indexOf("tap-") !== -1 || epUrl.indexOf("episode") !== -1 || epUrl.indexOf("xem-phim") !== -1) && !seenEps[epUrl]) {
            seenEps[epUrl] = true;
            episodes.push({
                "id": epUrl,
                "name": epName
            });
        }
    }

    // Nếu là phim lẻ không có danh sách tập riêng, lấy chính trang hiện tại làm bản Full
    if (episodes.length === 0) {
        var canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
        if (canonicalMatch) {
            episodes.push({
                "id": canonicalMatch,
                "name": "Full"
            });
        }
    }

    return JSON.stringify({
        "description": desc,
        "episodes": [
            {
                "server_name": "Server Chính",
                "server_data": episodes
            }
        ]
    });
}

// 10. Bóc tách link phát video từ trang xem phim
function parseDetailResponse(html) {
    var streamUrl = "";

    // Ưu tiên 1: Tìm link trực tiếp .m3u8 hoặc .mp4
    var m3u8Match = html.match(/(https?:\/\/[^\s'"\\]+\.(?:m3u8|mp4)[^\s'"\\]*)/);
    if (m3u8Match) {
        streamUrl = m3u8Match.replace(/\\\//g, "/");
    }

    // Ưu tiên 2: Lấy link từ thẻ iframe nhúng player
    if (!streamUrl) {
        var iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"/i);
        if (iframeMatch) {
            streamUrl = iframeMatch;
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
