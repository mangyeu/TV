// A. NHÓM CONFIG & METADATA (Bắt buộc)
function getManifest() {
    return JSON.stringify({
        "id": "phimapi_nguon",
        "name": "Nguồn PhimAPI",
        "version": "1.0.0",
        "baseUrl": "https://phimapi.com",
        "type": "MOVIE",
        "layout": "VERTICAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "phim-moi-cap-nhat", "title": "Phim Mới Cập Nhật", "type": "LIST", "path": "/danh-sach/phim-moi-cap-nhat" },
        { "slug": "phim-le", "title": "Phim Lẻ", "type": "LIST", "path": "/v1/api/danh-sach/phim-le" },
        { "slug": "phim-bo", "title": "Phim Bộ", "type": "LIST", "path": "/v1/api/danh-sach/phim-bo" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "hanh-dong", "name": "Hành Động" },
        { "slug": "tinh-cam", "name": "Tình Cảm" },
        { "slug": "co-trang", "name": "Cổ Trang" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({});
}

// B. NHÓM SINH MẪU ĐƯỜNG DẪN URL (Bắt buộc)
function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    if (slug === "phim-moi-cap-nhat") {
        return "https://phimapi.com" + page;
    }
    return "https://phimapi.com" + slug + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return "https://phimapi.com" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(slug) {
    return "https://phimapi.com" + slug;
}

// C. NHÓM PHÂN TÍCH DỮ LIỆU - PARSERS (Quan trọng nhất)
function parseListResponse(apiResponseJson) {
    try {
        var res = JSON.parse(apiResponseJson);
        var rawItems = res.items || (res.data && res.data.items) || [];
        var domainImg = (res.data && res.data.APP_DOMAIN_CDN_IMAGE) ? res.data.APP_DOMAIN_CDN_IMAGE : "https://phimimg.com";

        var movies = rawItems.map(function(item) {
            var poster = item.poster_url || "";
            if (poster && poster.indexOf("http") !== 0) {
                poster = domainImg + "/" + poster;
            }
            return {
                "id": item.slug,
                "title": item.name,
                "posterUrl": poster,
                "backdropUrl": poster,
                "year": item.year || ""
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

function parseMovieDetail(apiResponseJson) {
    try {
        var res = JSON.parse(apiResponseJson);
        var movie = res.movie || {};
        var episodesData = res.episodes || [];

        var servers = episodesData.map(function(sv) {
            var epList = (sv.server_data || []).map(function(ep) {
                return {
                    "id": ep.link_m3u8 || ep.link_embed,
                    "name": ep.name,
                    "url": ep.link_m3u8 || ep.link_embed
                };
            });
            return {
                "serverName": sv.server_name,
                "episodes": epList
            };
        });

        return JSON.stringify({
            "id": movie.slug,
            "title": movie.name,
            "description": movie.content || "",
            "posterUrl": movie.poster_url || "",
            "servers": servers
        });
    } catch (e) {
        return JSON.stringify({});
    }
}

function parseDetailResponse(url) {
    // Trả về link phát trực tiếp (.m3u8 hoặc embed) kèm headers nếu cần
    return JSON.stringify({
        "url": url,
        "headers": {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://phimapi.com"
        }
    });
}
