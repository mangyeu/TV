var BASE_URL = "https://motchillf.im";

// 1. Khai báo thông tin Plugin
function getManifest() {
    return JSON.stringify({
        "id": "motchillf_im_source",
        "name": "MotchillF (HTML)",
        "version": "1.0.0",
        "baseUrl": "https://motchillf.im",
        "type": "MOVIE",
        "layout": "VERTICAL"
    });
}

// 2. Cấu hình các mục ngoài Trang chủ khớp với menu của motchillf.im
function getHomeSections() {
    return JSON.stringify([
        { "slug": "phim-moi", "title": "Phim Mới Cập Nhật", "path": "/" },
        { "slug": "phim-chieu-rap", "title": "Phim Chiếu Rạp", "path": "/phim-chieu-rap" },
        { "slug": "phim-bo", "title": "Phim Bộ", "path": "/phim-bo" },
        { "slug": "phim-le", "title": "Phim Lẻ", "path": "/phim-le" },
        { "slug": "hoat-hinh", "title": "Hoạt Hình", "path": "/hoat-hinh" }
    ]);
}

// 3. Tạo URL lấy danh sách phim theo từng trang
function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    
    if (slug === "phim-moi") {
        return page > 1 ? BASE_URL + "/phim-moi?page=" + page : BASE_URL;
    }
    return BASE_URL + "/" + slug + "?page=" + page;
}

// 4. Tạo URL tìm kiếm
function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_URL + "/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page;
}

// 5. Tạo URL trang chi tiết phim
function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return BASE_URL + (slug.indexOf("/") === 0 ? "" : "/") + slug;
}

// Hàm phụ trợ làm sạch mã HTML thừa
function cleanHtml(str) {
    if (!str) return "";
    return str.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

// Hàm chuẩn hóa đường dẫn ảnh và link
function fixUrl(url) {
    if (!url) return "";
    if (url.indexOf("//") === 0) return "https:" + url;
    if (url.indexOf("http") !== 0) return BASE_URL + (url.indexOf("/") === 0 ? "" : "/") + url;
    return url;
}

// 6. Bóc tách HTML danh sách phim trên motchillf.im
function parseListResponse(htmlString) {
    var movies = [];
    try {
        // Giao diện motchillf.im bọc mỗi phim trong thẻ <li> hoặc <article> có chứa thẻ <h3>
        var itemRegex = /<(?:li|article)[^>]*>([\s\S]*?)<\/(?:li|article)>/gi;
        var match;

        while ((match = itemRegex.exec(htmlString)) !== null) {
            var block = match;
            
            // Chỉ xử lý những khối có chứa thẻ <h3> (tên phim) để loại bỏ các thẻ <li> của menu
            var h3Match = /<h3[^>]*>([\s\S]*?)<\/h3>/i.exec(block);
            if (!h3Match) continue;

            var linkMatch = /<a[^>]*href="([^"]+)"/i.exec(block);
            var imgMatch = /<img[^>]*(?:data-src|data-original|src)="([^"]+)"/i.exec(block);

            if (linkMatch) {
                var rawUrl = linkMatch;
                var slug = rawUrl.replace(BASE_URL, "");
                var title = cleanHtml(h3Match);
                var poster = imgMatch ? fixUrl(imgMatch) : "";

                if (slug && title && poster) {
                    movies.push({
                        "id": slug,
                        "title": title,
                        "posterUrl": poster,
                        "backdropUrl": poster,
                        "year": ""
                    });
                }
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
        if (titleMatch) title = cleanHtml(titleMatch);

        // Lấy nội dung tóm tắt phim
        var descMatch = /<div[^>]*class="[^"]*(?:tab-content|film-content|content|description)[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(htmlString);
        if (descMatch) description = cleanHtml(descMatch);

        // Lấy ảnh bìa từ thẻ meta og:image
        var posterMatch = /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i.exec(htmlString);
        if (posterMatch) poster = fixUrl(posterMatch);

        // Quét khối chứa danh sách tập phim
        var epBlockMatch = /<(?:ul|div)[^>]*class="[^"]*(?:list-episode|list_episode|episodes|list-server)[^"]*"[^>]*>([\s\S]*?)<\/(?:ul|div)>/i.exec(htmlString);
        var epSource = epBlockMatch ? epBlockMatch : htmlString;

        var epRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        while ((epMatch = epRegex.exec(epSource)) !== null) {
            var epUrl = fixUrl(epMatch);
            var epName = cleanHtml(epMatch);

            // Lọc lấy các đường dẫn trỏ tới trang xem tập phim
            if (epUrl.indexOf("tap-") !== -1 || epUrl.indexOf("episode") !== -1 || epUrl.indexOf("xem-phim") !== -1 || epBlockMatch) {
                episodesList.push({
                    "id": epUrl,
                    "title": epName.indexOf("Tập") === -1 && epName.indexOf("Full") === -1 ? "Tập " + epName : epName,
                    "url": epUrl
                });
            }
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

// 8. Lấy link phát video từ trang xem phim
function parseDetailResponse(htmlString) {
    var videoUrl = "";
    try {
        // Ưu tiên 1: Tìm link .m3u8 trực tiếp trong mã nguồn
        var m3u8Match = /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i.exec(htmlString);
        if (m3u8Match) {
            videoUrl = m3u8Match.replace(/\\/g, "");
        } else {
            // Ưu tiên 2: Tìm link nhúng iframe của trình phát
            var iframeMatch = /<iframe[^>]*src="([^"]+)"/i.exec(htmlString);
            if (iframeMatch) {
                videoUrl = fixUrl(iframeMatch);
            }
        }
    } catch (e) {}

    return JSON.stringify({
        "url": " ",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": BASE_URL + "/"
        }
    });
}
