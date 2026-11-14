var BASE_URL = "https://phimapi.com";
var IMG_DOMAIN = "https://phimimg.com";

// 1. Khai báo thông tin Plugin
function getManifest() {
    return JSON.stringify({
        "id": "kkphim_source",
        "name": "KKPhim (PhimAPI)",
        "version": "1.0.0",
        "baseUrl": BASE_URL,
        "type": "MOVIE",
        "layout": "VERTICAL"
    });
}

// 2. Cấu hình các mục ngoài Trang chủ
function getHomeSections() {
    return JSON.stringify([
        { "slug": "phim-moi-cap-nhat", "title": "Phim Mới Cập Nhật", "type": "list", "path": "/danh-sach/phim-moi-cap-nhat" },
        { "slug": "phim-le", "title": "Phim Lẻ", "type": "v1", "path": "/v1/api/danh-sach/phim-le" },
        { "slug": "phim-bo", "title": "Phim Bộ", "type": "v1", "path": "/v1/api/danh-sach/phim-bo" }
    ]);
}

// 3. Tạo URL lấy danh sách phim
function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    
    if (slug === "phim-moi-cap-nhat") {
        return BASE_URL + "/danh-sach/phim-moi-cap-nhat?page=" + page;
    }
    return BASE_URL + "/v1/api/danh-sach/" + slug + "?page=" + page;
}

// 4. Tạo URL tìm kiếm
function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_URL + "/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page;
}

// 5. Tạo URL lấy chi tiết phim
function getUrlDetail(slug) {
    return BASE_URL + "/phim/" + slug;
}

// Hàm phụ trợ chuẩn hóa link ảnh
function fixImageUrl(url) {
    if (!url) return "";
    if (url.indexOf("http") === 0) return url;
    return IMG_DOMAIN + url;
}

// 6. Bóc tách JSON danh sách phim (Trang chủ & Tìm kiếm)
function parseListResponse(apiResponseJson) {
    try {
        var res = JSON.parse(apiResponseJson);
        // API v1 bọc dữ liệu trong res.data.items, API thường nằm ở res.items
        var rawItems = (res.data && res.data.items) ? res.data.items : (res.items || []);
        
        var movies = rawItems.map(function(item) {
            return {
                "id": item.slug,
                "title": item.name,
                "posterUrl": fixImageUrl(item.poster_url),
                "backdropUrl": fixImageUrl(item.thumb_url),
                "year": item.year ? String(item.year) : ""
            };
        });
        return JSON.stringify({ "items": movies });
    } catch (e) {
        return JSON.stringify({ "items": [] });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

// 7. Bóc tách JSON chi tiết phim và danh sách tập
function parseMovieDetail(apiResponseJson) {
    try {
        var res = JSON.parse(apiResponseJson);
        var movie = res.movie || {};
        var episodesData = res.episodes || [];
        var episodesList = [];

        episodesData.forEach(function(server) {
            var serverName = server.server_name || "Server 1";
            var items = server.server_data || [];
            
            items.forEach(function(ep) {
                episodesList.push({
                    "id": ep.link_m3u8 || ep.link_embed,
                    "title": ep.name + " (" + serverName + ")",
                    "url": ep.link_m3u8 || ep.link_embed
                });
            });
        });

        return JSON.stringify({
            "id": movie.slug,
            "title": movie.name,
            "description": movie.content || "",
            "posterUrl": fixImageUrl(movie.poster_url),
            "backdropUrl": fixImageUrl(movie.thumb_url),
            "episodes": episodesList
        });
    } catch (e) {
        return JSON.stringify({});
    }
}

// 8. Trả về link phát video (m3u8 hoặc embed) cho trình phát
function parseDetailResponse(episodeUrl) {
    return JSON.stringify({
        "url": episodeUrl,
        "headers": {
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL + "/"
        }
    });
}
