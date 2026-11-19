var BASE_URL = "https://clbphimxua.top";
var DEFAULT_LIMIT = 24;

function safeTrim(val) {
    if (val === null || val === undefined) {
        return "";
    }
    return String(val).replace(/^\s+|\s+$/g, "");
}

function toInt(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var n = parseInt(val, 10);
    return isNaN(n) ? defVal : n;
}

function toFloat(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var f = parseFloat(val);
    return isNaN(f) ? defVal : f;
}

function isArraySafe(val) {
    if (typeof Array !== "undefined" && typeof Array.isArray === "function") {
        return Array.isArray(val);
    }
    return Object.prototype.toString.call(val) === "[object Array]";
}

function isPlainObject(val) {
    return typeof val === "object" && val !== null && !isArraySafe(val);
}

function looksLikeHtml(str) {
    var s = safeTrim(str);
    if (!s) {
        return false;
    }
    return /^<!doctype html/i.test(s) || /^<html[\s>]/i.test(s) || /<(body|head|script|div|title)[\s>]/i.test(s);
}

function safeParseJson(input, fallback) {
    if (input === null || input === undefined) {
        return fallback;
    }
    if (isPlainObject(input) || isArraySafe(input)) {
        return input;
    }
    var raw = safeTrim(input);
    if (!raw || looksLikeHtml(raw)) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        var firstObj = raw.indexOf("{");
        var lastObj = raw.lastIndexOf("}");
        if (firstObj !== -1 && lastObj > firstObj) {
            try {
                return JSON.parse(raw.substring(firstObj, lastObj + 1));
            } catch (e2) {}
        }
        var firstArr = raw.indexOf("[");
        var lastArr = raw.lastIndexOf("]");
        if (firstArr !== -1 && lastArr > firstArr) {
            try {
                return JSON.parse(raw.substring(firstArr, lastArr + 1));
            } catch (e3) {}
        }
        return fallback;
    }
}

function extractArrayItems(response) {
    if (!response) {
        return [];
    }
    if (isArraySafe(response)) {
        return response;
    }
    if (!isPlainObject(response)) {
        return [];
    }
    if (isArraySafe(response.items)) return response.items;
    if (isArraySafe(response.movies)) return response.movies;
    if (isArraySafe(response.data)) return response.data;
    if (isPlainObject(response.data)) {
        if (isArraySafe(response.data.items)) return response.data.items;
        if (isArraySafe(response.data.movies)) return response.data.movies;
    }
    return [];
}

function extractCdnDomain(response) {
    if (isPlainObject(response) && isPlainObject(response.data) && response.data.APP_DOMAIN_CDN_IMAGE) {
        return safeTrim(response.data.APP_DOMAIN_CDN_IMAGE);
    }
    if (isPlainObject(response) && response.APP_DOMAIN_CDN_IMAGE) {
        return safeTrim(response.APP_DOMAIN_CDN_IMAGE);
    }
    return BASE_URL;
}

function getPosterUrl(path, cdnDomain, fallbackPath) {
    var raw = safeTrim(path) || safeTrim(fallbackPath);
    if (!raw) {
        return "";
    }
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
        return raw;
    }
    if (raw.indexOf("//") === 0) {
        return "https:" + raw;
    }
    var base = safeTrim(cdnDomain || BASE_URL).replace(/\/+$/, "");
    var cleanPath = raw.replace(/^\/+/, "");
    return (base || BASE_URL) + "/" + cleanPath;
}

function stripHtml(html) {
    return String(html || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/^\s+|\s+$/g, "");
}

function joinNames(list) {
    if (!isArraySafe(list)) {
        return "";
    }
    var out = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        var name = "";
        if (typeof item === "string") {
            name = safeTrim(item);
        } else if (isPlainObject(item)) {
            name = safeTrim(item.name || item.title || "");
        }
        if (name) {
            out.push(name);
        }
    }
    return out.join(", ");
}

function getManifest() {
    return JSON.stringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.3",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Thời gian cập nhật", value: "modified.time" },
            { name: "Năm phát hành", value: "year" },
            { name: "Theo ID", value: "_id" }
        ]
    });
}

function getUrlList(slug, filtersJson) {
    var safeSlug = safeTrim(slug || "phim-moi-cap-nhat");
    var parsed = safeParseJson(filtersJson, {});
    var filters = isPlainObject(parsed) ? parsed : {};
    var page = Math.max(1, toInt(filters.page, 1));
    var limit = Math.max(1, toInt(filters.limit, DEFAULT_LIMIT));
    var url = BASE_URL + "/api/danh-sach/" + encodeURIComponent(safeSlug) + "?page=" + page + "&limit=" + limit;

    if (safeTrim(filters.country)) url += "&country=" + encodeURIComponent(safeTrim(filters.country));
    if (safeTrim(filters.year)) url += "&year=" + encodeURIComponent(safeTrim(filters.year));
    if (safeTrim(filters.category)) url += "&category=" + encodeURIComponent(safeTrim(filters.category));
    if (safeTrim(filters.sort)) url += "&sort_field=" + encodeURIComponent(safeTrim(filters.sort));

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var parsed = safeParseJson(filtersJson, {});
    var filters = isPlainObject(parsed) ? parsed : {};
    var page = Math.max(1, toInt(filters.page, 1));
    var limit = Math.max(1, toInt(filters.limit, DEFAULT_LIMIT));
    var q = encodeURIComponent(safeTrim(keyword));
    return BASE_URL + "/api/tim-kiem?keyword=" + q + "&page=" + page + "&limit=" + limit;
}

function getUrlDetail(slug) {
    return BASE_URL + "/api/phim/" + encodeURIComponent(safeTrim(slug));
}

function getUrlCategories() {
    return BASE_URL + "/api/the-loai";
}

function getUrlCountries() {
    return BASE_URL + "/api/quoc-gia";
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var currentYear = new Date().getFullYear();
    var years = [];
    var y;
    for (y = currentYear; y >= 1970; y--) {
        years.push({ name: String(y), value: String(y) });
    }
    return JSON.stringify(years);
}

function parseListResponse(apiResponseJson) {
    var emptyResult = JSON.stringify({
        items: [],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: DEFAULT_LIMIT }
    });
    var response = safeParseJson(apiResponseJson, null);
    if (!response) {
        return emptyResult;
    }

    var items = extractArrayItems(response);
    var cdnDomain = extractCdnDomain(response);
    var data = (isPlainObject(response) && isPlainObject(response.data)) ? response.data : {};
    var params = isPlainObject(data.params) ? data.params : {};
    var pagination = isPlainObject(response.pagination)
        ? response.pagination
        : (isPlainObject(params.pagination) ? params.pagination : {});

    var currentPage = Math.max(1, toInt(pagination.currentPage, 1));
    var itemsPerPage = Math.max(1, toInt(pagination.totalItemsPerPage || pagination.itemsPerPage, DEFAULT_LIMIT));
    var totalItems = Math.max(0, toInt(pagination.totalItems, items.length));
    var totalPages = Math.max(1, toInt(pagination.totalPages, Math.ceil(totalItems / itemsPerPage)));

    var movies = [];
    var i;
    for (i = 0; i < items.length; i++) {
        var item = items[i];
        if (!isPlainObject(item)) {
            continue;
        }
        movies.push({
            id: safeTrim(item.slug || item.id || ""),
            title: safeTrim(item.name || item.title || ""),
            posterUrl: getPosterUrl(item.poster_url, cdnDomain, item.thumb_url),
            backdropUrl: getPosterUrl(item.thumb_url, cdnDomain, item.poster_url),
            year: toInt(item.year, 0),
            quality: safeTrim(item.quality || ""),
            episode_current: safeTrim(item.episode_current || ""),
            lang: safeTrim(item.lang || "")
        });
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: itemsPerPage
        }
    });
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    var response = safeParseJson(apiResponseJson, null);
    if (!response || !isPlainObject(response)) {
        return "null";
    }

    var movie = isPlainObject(response.movie) ? response.movie : (isPlainObject(response.data) && isPlainObject(response.data.movie) ? response.data.movie : {});
    var episodes = isArraySafe(response.episodes)
        ? response.episodes
        : (isPlainObject(response.data) && isArraySafe(response.data.episodes) ? response.data.episodes : []);
    var cdnDomain = extractCdnDomain(response);

    if (!safeTrim(movie.slug || movie.name || "") && episodes.length === 0) {
        return "null";
    }

    var servers = [];
    var i;
    for (i = 0; i < episodes.length; i++) {
        var server = isPlainObject(episodes[i]) ? episodes[i] : {};
        var serverData = isArraySafe(server.server_data) ? server.server_data : [];
        var serverEpisodes = [];
        var j;

        for (j = 0; j < serverData.length; j++) {
            var ep = isPlainObject(serverData[j]) ? serverData[j] : {};
            var streamUrl = safeTrim(ep.link_m3u8 || ep.link_embed || "");
            if (streamUrl) {
                serverEpisodes.push({
                    id: streamUrl,
                    name: safeTrim(ep.name || ""),
                    slug: safeTrim(ep.slug || ""),
                    m3u8: safeTrim(ep.link_m3u8 || ""),
                    embed: safeTrim(ep.link_embed || "")
                });
            }
        }

        if (serverEpisodes.length > 0) {
            servers.push({
                name: safeTrim(server.server_name || ("Server " + (i + 1))),
                episodes: serverEpisodes
            });
        }
    }

    var ratingValue = 0;
    var tmdbId = "";
    var tmdbSeason = 0;
    var tmdbType = "";

    if (isPlainObject(movie.tmdb)) {
        ratingValue = toFloat(movie.tmdb.vote_average, 0);
        if (movie.tmdb.id !== undefined && movie.tmdb.id !== null) tmdbId = safeTrim(movie.tmdb.id);
        tmdbSeason = toInt(movie.tmdb.season, 0);
        if (movie.tmdb.type !== undefined && movie.tmdb.type !== null) tmdbType = safeTrim(movie.tmdb.type);
    }

    return JSON.stringify({
        id: safeTrim(movie.slug || ""),
        title: safeTrim(movie.name || ""),
        originName: safeTrim(movie.origin_name || ""),
        posterUrl: getPosterUrl(movie.poster_url, cdnDomain, movie.thumb_url),
        backdropUrl: getPosterUrl(movie.thumb_url, cdnDomain, movie.poster_url),
        description: stripHtml(movie.content || ""),
        year: toInt(movie.year, 0),
        rating: ratingValue,
        quality: safeTrim(movie.quality || ""),
        duration: safeTrim(movie.time || ""),
        servers: servers,
        episode_current: safeTrim(movie.episode_current || ""),
        lang: safeTrim(movie.lang || ""),
        category: joinNames(movie.category),
        country: joinNames(movie.country),
        director: joinNames(movie.director),
        casts: joinNames(movie.actor),
        status: safeTrim(movie.status || ""),
        tmdbId: tmdbId,
        tmdbSeason: tmdbSeason,
        tmdbType: tmdbType
    });
}

function resolveStreamData(streamInput) {
    var raw = safeTrim(streamInput);
    if (looksLikeHtml(raw)) {
        raw = "";
    }
    var isHlsOrDirect = /\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw);
    return JSON.stringify({
        url: raw,
        isDirectStream: isHlsOrDirect,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL + "/"
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, {});
    var obj = isPlainObject(parsed) ? parsed : {};
    var candidate = safeTrim(obj.url || obj.streamUrl || obj.link_m3u8 || obj.link_embed || "");
    return resolveStreamData(candidate);
}

function parseCategoriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;
    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) continue;
        result.push({
            name: safeTrim(entry.name || ""),
            slug: safeTrim(entry.slug || "")
        });
    }
    return JSON.stringify(result);
}

function parseCountriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;
    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) continue;
        result.push({
            name: safeTrim(entry.name || ""),
            value: safeTrim(entry.slug || "")
        });
    }
    return JSON.stringify(result);
}

function parseYearsResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;
    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        var val = isPlainObject(entry) ? (entry.slug || entry.value || entry.year || entry.name) : entry;
        var label = isPlainObject(entry) ? (entry.name || entry.year || val) : entry;
        result.push({
            name: safeTrim(label),
            value: safeTrim(val)
        });
    }
    return JSON.stringify(result);
}
