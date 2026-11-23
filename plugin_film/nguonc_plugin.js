// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguonc",
        "name": "NguonC",
        "version": "1.0.5",
        "baseUrl": "https://phim.nguonc.com/api",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonc.png",
        "isEnabled": true,
        "type": "MOVIE",
        "supportsWebView": true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'films' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'films' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'films' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'films' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'films' },
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'films' },
        { slug: 'phim-thuyet-minh', title: 'Phim Thuyết Minh', type: 'Horizontal', path: 'films' },
        { slug: 'phim-long-tieng', title: 'Phim Lồng Tiếng', type: 'Horizontal', path: 'films' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi-cap-nhat' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' },
        { name: 'TV shows', slug: 'tv-shows' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' },
        { name: 'Phim thuyết minh', slug: 'phim-thuyet-minh' },
        { name: 'Phim lồng tiếng', slug: 'phim-long-tieng' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'modified.time' },
            { name: 'Năm phát hành', value: 'year' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10);
        if (isNaN(page) || page < 1) page = 1;

        var typeList = (slug || "").trim();
        if (!typeList || typeList === "phim-moi" || typeList === "phim-moi-cap-nhat-v3") {
            typeList = "phim-moi-cap-nhat";
        }

        // Slug phim lấy từ danh sách hoặc tìm kiếm; URL mẫu chỉ dùng minh họa
        var url = "https://phim.nguonc.com/api/films/" + encodeURIComponent(typeList) + "?page=" + page;

        if (filters.limit !== undefined && filters.limit !== null && String(filters.limit).trim() !== "") {
            url += "&limit=" + encodeURIComponent(String(filters.limit).trim());
        }
        if (filters.country && String(filters.country).trim() !== "") {
            url += "&country=" + encodeURIComponent(String(filters.country).trim());
        }
        if (filters.year !== undefined && filters.year !== null && String(filters.year).trim() !== "") {
            url += "&year=" + encodeURIComponent(String(filters.year).trim());
        }
        if (filters.category && String(filters.category).trim() !== "") {
            url += "&category=" + encodeURIComponent(String(filters.category).trim());
        }
        if (filters.sort && String(filters.sort).trim() !== "") {
            url += "&sort_field=" + encodeURIComponent(String(filters.sort).trim());
        }

        return url;
    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10);
        if (isNaN(page) || page < 1) page = 1;

        var cleanKeyword = String(keyword || "").trim();
        var url = "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(cleanKeyword) + "&page=" + page;

        if (filters.limit !== undefined && filters.limit !== null && String(filters.limit).trim() !== "") {
            url += "&limit=" + encodeURIComponent(String(filters.limit).trim());
        }

        return url;
    } catch (e) {
        return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(String(keyword || "")) + "&page=1";
    }
}

function getUrlDetail(slug) {
    var cleanSlug = String(slug || "").trim();
    return "https://phim.nguonc.com/api/film/" + encodeURIComponent(cleanSlug);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NORMALIZERS & PLAYER PAYLOAD
// =============================================================================

function normalizeStatusError(response) {
    if (!response || typeof response !== "object") return null;

    var statusText = String(response.status || "").toLowerCase();
    var statusCode = parseInt(
        response.statusCode || response.status_code || response.code || response.httpStatus || 0,
        10
    );

    if (statusText === "error" || statusCode >= 400) {
        var msg = response.message || "Yêu cầu thất bại";
        if (statusCode === 404) {
            return { error: true, code: 404, message: msg || "Phim hoặc bộ lọc không tồn tại (404)" };
        }
        if (statusCode === 422) {
            return { error: true, code: 422, message: msg || "Tham số không hợp lệ (422)" };
        }
        if (statusCode === 429) {
            return { error: true, code: 429, retryAfterMs: 3000, message: msg || "Quá nhiều yêu cầu, cần chờ trước khi thử lại (429)" };
        }
        return { error: true, code: statusCode || 400, message: msg };
    }

    return null;
}

function normalizeTmdb(tmdb) {
    var obj = tmdb && typeof tmdb === "object" ? tmdb : {};
    var id = (obj.id !== null && obj.id !== undefined && obj.id !== "") ? (parseInt(obj.id, 10) || null) : null;
    var type = (obj.type === "movie" || obj.type === "tv") ? obj.type : null;
    var season = (obj.season !== null && obj.season !== undefined && obj.season !== "")
        ? (isNaN(parseInt(obj.season, 10)) ? null : parseInt(obj.season, 10))
        : null;
    var url = obj.url ? String(obj.url) : null;

    return {
        id: id,
        type: type,
        season: season,
        url: url
    };
}

function normalizeImdb(imdb) {
    var obj = imdb && typeof imdb === "object" ? imdb : {};
    var rawId = obj.id ? String(obj.id).trim() : null;
    var id = (rawId && rawId.indexOf("tt") === 0) ? rawId : null;
    var url = obj.url ? String(obj.url) : null;

    return {
        id: id,
        url: url
    };
}

function buildPlayerPayload(m3u
