// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================
var BASE_URL = "https://hoathinh3d.pw";

// 1. Khai báo thông tin nguồn
function getManifest() {
    return JSON.stringify({
        "id": "hoathinh3d_pw",
        "name": "Hoạt Hình 3D (HH3D)",
        "version": "1.0.0",
        "type": "MOVIE",
        "layout": "VERTICAL"
    });
}

// 2. Cấu hình danh mục Trang chủ (Dựa theo menu thực tế của web)
function getHomeSections() {
    return JSON.stringify([
        { "slug": "moi-cap-nhat", "title": "Mới Cập Nhật", "type": "GRID", "path": "" },
        { "slug": "dang-chieu", "title": "Đang Chiếu", "type": "HORIZONTAL", "path": "dang-chieu" },
        { "slug": "phim-le", "title": "Phim Lẻ", "type": "HORIZONTAL", "path": "phim-le" },
        { "slug": "hoan-thanh", "title": "Hoàn Thành", "type": "HORIZONTAL", "path": "hoan-thanh" },
        { "slug": "huyen-huyen", "title": "Huyền Huyễn", "type": "HORIZONTAL", "path": "the-loai/huyen-huyen" },
        { "slug": "tien-hiep", "title": "Tiên Hiệp", "type": "HORIZONTAL", "path": "the-loai/tien-hiep" }
    ]);
}

// 3. Cấu hình bộ lọc thể loại
function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Huyền Huyễn", "slug": "the-loai/huyen-huyen" },
        { "name": "Xuyên Không", "slug": "the-loai/xuyen-khong" },
        { "name": "Trùng Sinh", "slug": "the-loai/trung-sinh" },
        { "name": "Tiên Hiệp", "slug": "the-loai/tien-hiep" },
        { "name": "Cổ Trang", "slug": "the-loai/co-trang" },
        { "name": "Kiếm Hiệp", "slug": "the-loai/kiem-hiep" },
        { "name": "Hiện Đại", "slug": "the-loai/hien-dai" }
    ]);
}

// 4. Sinh URL lấy danh sách & phân trang
function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    
    if (slug === "moi-cap-nhat" || slug === "") {
        return page > 1 ? BASE_URL + "/page/" + page : BASE_URL;
    }
    return page > 1 ? BASE_URL + "/" + slug + "/page/" + page : BASE_URL + "/" + slug;
}

// 5. Sinh URL tìm kiếm
function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var query = encodeURIComponent(keyword);
    return page > 1 ? BASE_URL + "/page/" + page + "/?s=" + query : BASE_URL + "/?s=" + query;
}

// Hàm dùng chung để bóc tách thẻ phim từ HTML của HH3D
function extractMoviesFromHtml(html) {
    var items = [];
    try {
        // Quét các khối bài viết chứa link, ảnh poster và tiêu đề
        var regex = /<(?:article|div)[^>]*class="[^"]*(?:item|halim-item|post)[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*title="([^"]+)"[\s\S]*?<img[^>]*src="([^"]+)"/g;
        var match;

        while ((match = regex.exec(html)) !== null) {
            var url = match;
            var title = match.replace(/&#8211;/g, "-").replace(/&amp;/g, "&");
            var poster = match;

            // Tránh trùng lặp link
            if (url.indexOf(BASE_URL) !== -1 && title !== "") {
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
    var descMatch = html.match(/<div[^>]*class="[^"]*(?:entry-content|description|film-content)[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (descMatch) {
        desc = descMatch.replace(/<[^>]+>/g, "").trim();
    }

    var episodes = [];
    // Bóc tách danh sách tập trong khung danh sách tập (halim-list-eps / list-episode)
    var epRegex = /<a[^>]*href="([^"]+)"[^>]*>(?:<span[^>]*>)?([^<]+)(?:<\/span>)?<\/a>/g;
    var match;

    // Khoanh vùng khu vực chứa tập phim để tránh lấy nhầm menu
    var epSectionMatch = html.match(/<(?:ul|div)[^>]*class="[^"]*(?:halim-list-eps|list-eps|list-episode)[^"]*"[^>]*>([\s\S]*?)<\/(?:ul|div)>/);
    var targetHtml = epSectionMatch ? epSectionMatch : html;

    while ((match = epRegex.exec(targetHtml)) !== null) {
        var epUrl = match;
        var epName = match.trim();
        if (epUrl.indexOf("tap-") !== -1 || epUrl.indexOf("episode") !== -1) {
            episodes.push({
                "id": epUrl,
                "name": "Tập " + epName.replace(/Tập\s*/i, "")
            });
        }
    }

    return JSON.stringify({
        "description": desc,
        "episodes": [
            {
                "server_name": "Vietsub HH3D",
                "server_data": episodes
            }
        ]
    });
}

// 10. Bóc tách link phát video từ trang xem phim
function parseDetailResponse(html) {
    var streamUrl = "";

    // Ưu tiên 1: Tìm link trực tiếp .m3u8 hoặc .mp4 trong mã nguồn trang
    var m3u8Match = html.match(/(https?:\/\/[^\s'"\\]+\.(?:m3u8|mp4)[^\s'"\\]*)/);
    if (m3u8Match) {
        streamUrl = m3u8Match.replace(/\\\//g, "/");
    }

    // Ưu tiên 2: Nếu không có m3u8 trực tiếp, lấy link trong thẻ iframe player
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
