var BASE_URL = "https://clbphimxua.top";
var DEFAULT_LIMIT = 24;

// =========================================================================
// 1. TIỆN ÍCH CƠ BẢN ES5
// =========================================================================
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

// Parse JSON an toàn: hỗ trợ cả chuỗi JSON lẫn object/array đã truyền sẵn
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

function safeStringify(obj, fallbackStr) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return fallbackStr || "{}";
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
    if (isArraySafe(response.items)) {
        return response.items;
    }
    if (isArraySafe(response.movies)) {
        return response.movies;
    }
    if (isArraySafe(response.results)) {
        return response.results;
    }
    if (isArraySafe(response.list)) {
        return response.list;
    }
    if (isArraySafe(response.data)) {
        return response.data;
    }
    if (isPlainObject(response.data)) {
        if (isArraySafe(response.data.items)) {
            return response.data.items;
        }
        if (isArraySafe(response.data.movies)) {
            return response.data.movies;
        }
        if (isArraySafe(response.data.results)) {
            return response.data.results;
        }
        if (isArraySafe(response.data.list)) {
            return response.data.list;
        }
    }
    return [];
}

function extractCdnDomain(response) {
    var candidates = [];
    if (isPlainObject(response)) {
        if (isPlainObject(response.data)) {
            candidates.push(response.data.cdnDomain);
            candidates.push(response.data.APP_DOMAIN_CDN_IMAGE);
            candidates.push(response.data.domain_cdn);
        }
        candidates.push(response.cdnDomain);
        candidates.push(response.APP_DOMAIN_CDN_IMAGE);
        candidates.push(response.domain_cdn);
    }

    var i;
    for (i = 0; i < candidates.length; i++) {
        var c = safeTrim(candidates[i]);
        if (c) {
            if (c.indexOf("http://") === 0 || c.indexOf("https://") === 0) {
                return c;
            }
            if (c.indexOf("//") === 0) {
                return "https:" + c;
            }
            return "https://" + c.replace(/^\/+/, "");
        }
    }
    return BASE_URL;
}

function buildMediaUrl(path, cdnDomain, fallbackPath) {
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
    if (!base) {
        base = BASE_URL;
    }
    var cleanPath = raw.replace(/^\/+/, "");
    return base + "/" + cleanPath;
}

function stripHtmlToText(html) {
    if (!html) {
        return "";
    }
    return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/ /gi, " ")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s+|\s+$/g, "");
}

function joinNamedList(list) {
    if (!isArraySafe(list)) {
        return "";
    }
    var parts = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        var text = "";
        if (typeof item === "string") {
            text = safeTrim(item);
        } else if (isPlainObject(item)) {
            text = safeTrim(item.name || item.title || item.slug || "");
        }
        if (text && parts.join(", ").indexOf(text) === -1) {
            parts.push(text);
        }
    }
    return parts.join(", ");
}

function buildDefaultPagination(page, limit, totalItems, totalPages) {
    var safePage = toInt(page, 1);
    if (safePage < 1) {
        safePage = 1;
    }
    var safeLimit = toInt(limit, DEFAULT_LIMIT);
    if (safeLimit < 1) {
        safeLimit = DEFAULT_LIMIT;
    }
    var safeTotalItems = toInt(totalItems, 0);
    if (safeTotalItems < 0) {
        safeTotalItems = 0;
    }
    var calcPages = Math.max(1, Math.ceil(safeTotalItems / safeLimit));
    var safeTotalPages = toInt(totalPages, calcPages);
    if (safeTotalPages < 1) {
        safeTotalPages = 1;
    }

    return {
        currentPage: safePage,
        totalPages: safeTotalPages,
        totalItems: safeTotalItems,
        itemsPerPage: safeLimit
    };
}

// =========================================================================
// 2. MANIFEST & CẤU HÌNH GIAO DIỆN / BỘ LỌC
// =========================================================================
function getManifest() {
    var baseUrl = safeTrim(BASE_URL) || "https://clbphimxua.top";
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "baseUrl": baseUrl,
        "iconUrl": baseUrl + "/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","iconUrl":"https://clbphimxua.top/favicon.ico","isEnabled":true,"type":"MOVIE"}');
}

function getHomeSections() {
    return safeStringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
    ], "[]");
}

function getPrimaryCategories() {
    return safeStringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
    ], "[]");
}

function getFilterConfig() {
    return safeStringify({
        sort: [
            { name: "Mới cập nhật", value: "modified" },
            { name: "Năm phát hành", value: "year" },
            { name: "Tên phim", value: "name" }
        ]
    }, '{"sort":[]}');
}

// =========================================================================
// 3. TẠO URL AN TOÀN
// =========================================================================
function getUrlList(slug, filtersJson) {
    var cleanSlug = safeTrim(slug) || "phim-moi-cap-nhat";
    var filters = safeParseJson(filtersJson, {});
    if (!isPlainObject(filters)) {
        filters = {};
    }

    var page = toInt(filters.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(filters.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }

    var url = BASE_URL + "/api/danh-sach/" + encodeURIComponent(cleanSlug) +
        "?page=" + page + "&limit=" + limit;

    if (safeTrim(filters.category)) {
        url += "&category=" + encodeURIComponent(safeTrim(filters.category));
    }
    if (safeTrim(filters.country)) {
        url += "&country=" + encodeURIComponent(safeTrim(filters.country));
    }
    if (safeTrim(filters.year)) {
        url += "&year=" + encodeURIComponent(safeTrim(filters.year));
    }
    if (safeTrim(filters.sort)) {
        url += "&sort=" + encodeURIComponent(safeTrim(filters.sort));
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var cleanKeyword = safeTrim(keyword);
    var filters = safeParseJson(filtersJson, {});
    if (!isPlainObject(filters)) {
        filters = {};
    }

    var page = toInt(filters.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(filters.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }

    return BASE_URL + "/api/tim-kiem?keyword=" + encodeURIComponent(cleanKeyword) +
        "&page=" + page + "&limit=" + limit;
}

function getUrlDetail(slug) {
    var cleanSlug = safeTrim(slug);
    if (!cleanSlug) {
        return BASE_URL + "/api/phim";
    }
    return BASE_URL + "/api/phim/" + encodeURIComponent(cleanSlug);
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
    var nowYear = new Date().getFullYear();
    var endYear = (typeof nowYear === "number" && !isNaN(nowYear) && nowYear >= 1950) ? nowYear : 2026;
    var years = [];
    var y;
    for (y = endYear; y >= 1950; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }
    return safeStringify(years, "[]");
}

// =========================================================================
// 4. PARSER & STREAM RESOLVER CHỐNG LỖI DỮ LIỆU NGUỒN
// =========================================================================
function parseListResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed) {
        return safeStringify({
            items: [],
            pagination: buildDefaultPagination(1, DEFAULT_LIMIT, 0, 1)
        }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
    }

    var rawItems = extractArrayItems(parsed);
    var cdnDomain = extractCdnDomain(parsed);
    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : {};
    var paramsObj = isPlainObject(dataObj.params) ? dataObj.params : {};

    var pagination = null;
    if (isPlainObject(parsed) && isPlainObject(parsed.pagination)) {
        pagination = parsed.pagination;
    } else if (isPlainObject(dataObj.pagination)) {
        pagination = dataObj.pagination;
    } else if (isPlainObject(paramsObj.pagination)) {
        pagination = paramsObj.pagination;
    } else {
        pagination = {};
    }

    var currentPage = toInt(pagination.currentPage || pagination.page, 1);
    var itemsPerPage = toInt(
        pagination.totalItemsPerPage || pagination.itemsPerPage || pagination.limit,
        DEFAULT_LIMIT
    );
    var totalItems = toInt(pagination.totalItems || pagination.total, rawItems.length);
    var totalPages = toInt(pagination.totalPages || pagination.lastPage, 0);

    var movies = [];
    var i;
    for (i = 0; i < rawItems.length; i++) {
        var item = rawItems[i];
        if (!isPlainObject(item)) {
            continue;
        }
        var movieId = safeTrim(item.slug || item.id || item._id || "");
        var title = safeTrim(item.name || item.title || item.origin_name || "");
        if (!movieId && !title) {
            continue;
        }

        var posterRaw = item.poster_url || item.posterUrl || item.poster || item.thumb_url || item.thumb || "";
        var backdropRaw = item.thumb_url || item.backdrop_url || item.backdropUrl || item.poster_url || "";

        movies.push({
            id: movieId || title,
            title: title || movieId,
            posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
            backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
            year: toInt(item.year, 0),
            quality: safeTrim(item.quality || ""),
            episode_current: safeTrim(item.episode_current || item.episodeCurrent || ""),
            lang: safeTrim(item.lang || "")
        });
    }

    return safeStringify({
        items: movies,
        pagination: buildDefaultPagination(currentPage, itemsPerPage, totalItems, totalPages)
    }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}
function parseMovieDetail(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed || (!isPlainObject(parsed) && !isArraySafe(parsed))) {
        return "null";
    }

    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : parsed;
    var movie = null;
    if (isPlainObject(dataObj)) {
        if (isPlainObject(dataObj.movie)) {
            movie = dataObj.movie;
        } else if (isPlainObject(dataObj.item)) {
            movie = dataObj.item;
        } else if (dataObj.name || dataObj.title || dataObj.slug) {
            movie = dataObj;
        }
    }

    if (!movie) {
        return "null";
    }

    var cdnDomain = extractCdnDomain(parsed);
    var episodesRaw = [];
    if (isPlainObject(dataObj) && isArraySafe(dataObj.episodes)) {
        episodesRaw = dataObj.episodes;
    } else if (isPlainObject(parsed) && isArraySafe(parsed.episodes)) {
        episodesRaw = parsed.episodes;
    } else if (isArraySafe(movie.episodes)) {
        episodesRaw = movie.episodes;
    }

    var servers = [];
    var i;
    for (i = 0; i < episodesRaw.length; i++) {
        var srv = episodesRaw[i];
        if (!isPlainObject(srv)) {
            continue;
        }
        var srvData = isArraySafe(srv.server_data)
            ? srv.server_data
            : (isArraySafe(srv.episodes) ? srv.episodes : []);

        var serverEpisodes = [];
        var j;
        for (j = 0; j < srvData.length; j++) {
            var ep = srvData[j];
            if (!isPlainObject(ep)) {
                continue;
            }
            var m3u8Url = safeTrim(ep.link_m3u8 || ep.m3u8 || "");
            var embedUrl = safeTrim(ep.link_embed || ep.embed || "");
            var directUrl = safeTrim(ep.url || ep.link || "");
            var streamUrl = m3u8Url || embedUrl || directUrl;

            if (streamUrl) {
                serverEpisodes.push({
                    id: streamUrl,
                    name: safeTrim(ep.name || ep.title || ("Tập " + (j + 1))),
                    slug: safeTrim(ep.slug || ""),
                    m3u8: m3u8Url,
                    embed: embedUrl
                });
            }
        }

        if (serverEpisodes.length > 0) {
            servers.push({
                name: safeTrim(srv.server_name || srv.name || ("Server " + (i + 1))),
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
        if (movie.tmdb.id !== null && movie.tmdb.id !== undefined) {
            tmdbId = safeTrim(movie.tmdb.id);
        }
        tmdbSeason = toInt(movie.tmdb.season, 0);
        if (movie.tmdb.type !== null && movie.tmdb.type !== undefined) {
            tmdbType = safeTrim(movie.tmdb.type);
        }
    } else if (movie.rating !== null && movie.rating !== undefined) {
        ratingValue = toFloat(movie.rating, 0);
    }

    var posterRaw = movie.poster_url || movie.posterUrl || movie.poster || movie.thumb_url || "";
    var backdropRaw = movie.thumb_url || movie.backdrop_url || movie.backdropUrl || movie.poster_url || "";
    var movieId = safeTrim(movie.slug || movie.id || movie._id || "");
    var movieTitle = safeTrim(movie.name || movie.title || movie.origin_name || "");

    if (!movieId && !movieTitle && servers.length === 0) {
        return "null";
    }
    return safeStringify({
        id: movieId || movieTitle,
        title: movieTitle || movieId,
        originName: safeTrim(movie.origin_name || movie.originName || ""),
        posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
        backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
        description: stripHtmlToText(movie.content || movie.description || ""),
        year: toInt(movie.year, 0),
        rating: ratingValue,
        quality: safeTrim(movie.quality || ""),
        duration: safeTrim(movie.time || movie.duration || ""),
        servers: servers,
        episode_current: safeTrim(movie.episode_current || movie.episodeCurrent || ""),
        lang: safeTrim(movie.lang || ""),
        category: joinNamedList(movie.category || movie.categories),
        country: joinNamedList(movie.country || movie.countries),
        director: joinNamedList(movie.director || movie.directors),
        casts: joinNamedList(movie.actor || movie.actors || movie.casts),
        status: safeTrim(movie.status || ""),
        tmdbId: tmdbId,
        tmdbSeason: tmdbSeason,
        tmdbType: tmdbType
    }, "null");
}

function resolveStreamData(streamInput) {
    var raw = safeTrim(streamInput);
    if (looksLikeHtml(raw)) {
        raw = "";
    }
    var isDirect = raw.length > 0 && (/\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw));
    return safeStringify({
        url: raw,
        isDirectStream: isDirect,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL + "/"
        },
        subtitles: []
    }, '{"url":"","isDirectStream":false,"headers":{},"subtitles":[]}');
}
function parseDetailResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    var candidate = "";

    if (isPlainObject(parsed)) {
        candidate = safeTrim(
            parsed.url ||
            parsed.streamUrl ||
            parsed.link_m3u8 ||
            parsed.m3u8 ||
            parsed.link_embed ||
            parsed.embed ||
            ""
        );
        if (!candidate && isPlainObject(parsed.data)) {
            candidate = safeTrim(
                parsed.data.url ||
                parsed.data.streamUrl ||
                parsed.data.link_m3u8 ||
                parsed.data.m3u8 ||
                parsed.data.link_embed ||
                parsed.data.embed ||
                ""
            );
        }
    } else if (typeof apiResponseJson === "string" && !looksLikeHtml(apiResponseJson)) {
        var trimmed = safeTrim(apiResponseJson);
        if (trimmed.indexOf("http://") === 0 || trimmed.indexOf("https://") === 0) {
            candidate = trimmed;
        }
    }

    return resolveStreamData(candidate);
}

function parseCategoriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var slug = safeTrim(entry.slug || entry.id || name);
        if (name && slug) {
            result.push({
                name: name,
                slug: slug
            });
        }
    }

    return safeStringify(result, "[]");
}
function parseCountriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var value = safeTrim(entry.slug || entry.value || entry.id || name);
        if (name && value) {
            result.push({
                name: name,
                value: value
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseYearsResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        var val = "";
        var label = "";

        if (isPlainObject(entry)) {
            val = safeTrim(entry.slug || entry.value || entry.year || entry.name || "");
            label = safeTrim(entry.name || entry.year || val || "");
        } else if (typeof entry === "string" || typeof entry === "number") {
            val = safeTrim(entry);
            label = val;
        }

        if (val && label) {
            result.push({
                name: label,
                value: val
            });
        }
    }

    if (result.length === 0) {
        return getLocalYearsJson();
    }

    return safeStringify(result, "[]");
}
