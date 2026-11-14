var BASE_URL = "https://tvhayd.pro";

// 1. Khai báo thông tin Plugin
function getManifest() {
    return JSON.stringify({
        "id": "tvhayd_html_source",
        "name": "TVHay (Thuyết Minh)",
        "version": "1.0.0",
        "baseUrl": BASE_URL,
        "type": "MOVIE",
        "layout": "VERTICAL"
    });
}

// 2. Khai báo các mục hiển thị ở Trang chủ
function getHomeSections() {
    return JSON.stringify([
        { "slug": "phim-moi", "title": "Phim Mới Cập Nhật", "path": "/" },
        { "slug": "phim-bo", "title": "Phim Bộ Thuyết Minh", "path": "/phim-bo" },
        { "slug": "phim-le", "title": "Phim Lẻ Thuyết Minh", "path": "/phim-le" }
    ]);
}

// 3. Tạo URL lấy danh sách theo trang
function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    
    if (slug === "phim-moi") {
        return page > 1 ? BASE_URL + "/page/" + page : BASE_URL;
    }
    return BASE_URL + "/" + slug + "/page/" + page;
}

// 4. Tạo URL tìm kiếm
function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_URL + "/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page;
}

// 5. Tạo URL chi tiết phim
function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return BASE_URL + slug;
}

// Hàm phụ trợ làm sạch thẻ HTML thừa trong tiêu đề / mô tả
function cleanHtml(str) {
    if (!str) return "";
    return str.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

// 6. Bóc tách HTML danh sách phim bằng RegExp
function parseListResponse(htmlString) {
    var movies = [];
    try {
        // Quét các khối item phim thường gặp ở theme phim WordPress/PHP (Halim/Dooplay/Custom)
        var itemRegex = /<li[^>]*class="[^"]*item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
        var match;

        while ((match = itemRegex.exec(htmlString)) !== null) {
            var block = match[1];
            
            // Lấy link phim (href) và tên phim (title)
            var linkMatch = /<a[^>]*href="([^"]+)"[^>]*title="([^"]+)"/i.exec(block);
            // Lấy ảnh poster (ưu tiên data-src nếu web dùng lazy-load, sau đó tới src)
            var imgMatch = /<img[^>]*(?:data-src|src)="([^"]+)"/i.exec(block);

            if (linkMatch) {
                var rawUrl = linkMatch[1];
                var slug = rawUrl.replace(BASE_URL, ""); // Giữ lại đường dẫn tương đối làm ID
                var title = cleanHtml(linkMatch[2]);
                var poster = imgMatch ? imgMatch[1] : "";

                if (poster && poster.indexOf("http") !== 0) {
                    poster = BASE_URL + poster;
                }

                movies.push({
                    "id": slug,
                    "title": title,
                    "posterUrl": poster,
                    "backdropUrl": poster,
                    "year": ""
                });
            }
        }
    } catch (e) {}

    return JSON.stringify({ "items": movies });
}

function parseSearchResponse(htmlString) {
    return parseListResponse(htmlString);
}

// 7. Bóc tách HTML trang chi tiết phim và danh sách tập
function parseMovieDetail(htmlString) {
    var title = "";
    var description = "";
    var poster = "";
    var episodesList = [];

    try {
        // Lấy tên phim từ thẻ h1
        var titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(htmlString);
        if (titleMatch) title = cleanHtml(titleMatch[1]);

        // Lấy nội dung tóm tắt
        var descMatch = /<div[^>]*class="[^"]*(?:film-content|entry-content|description)[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(htmlString);
        if (descMatch) description = cleanHtml(descMatch[1]);

        // Lấy poster
        var posterMatch = /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i.exec(htmlString);
        if (posterMatch) poster = posterMatch[1];

        // Quét danh sách các nút chọn tập phim (thường nằm trong thẻ ul/div list-episode)
        var epRegex = /<a[^>]*href="([^"]+)"[^>]*class="[^"]*btn-episode[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        while ((epMatch = epRegex.exec(htmlString)) !== null) {
            var epUrl = epMatch[1];
            if (epUrl.indexOf("http") !== 0) epUrl = BASE_URL + epUrl;
            var epName = cleanHtml(epMatch[2]);

            episodesList.push({
                "id": epUrl,
                "title": "Tập " + epName,
                "url": epUrl
            });
        }
    } catch (e) {}

    return JSON.stringify({
        "id": title,
        "title": title,
        "description": description,
        "posterUrl": poster,
        "backdropUrl": poster,
        "episodes": episodesList
    });
}

// 8. Lấy link phát video từ trang xem phim (iframe hoặc m3u8)
function parseDetailResponse(htmlString) {
    var videoUrl = "";
    try {
        // Tìm link file m3u8 trực tiếp trong mã nguồn trang
        var m3u8Match = /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i.exec(htmlString);
        if (m3u8Match) {
            videoUrl = m3u8Match[1];
        } else {
            // Nếu không lộ m3u8, lấy link nhúng iframe của trình phát
            var iframeMatch = /<iframe[^>]*src="([^"]+)"/i.exec(htmlString);
            if (iframeMatch) {
                videoUrl = iframeMatch[1];
            }
        }
    } catch (e) {}

    return JSON.stringify({
        "url": videoUrl,
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": BASE_URL + "/"
        }
    });
}
