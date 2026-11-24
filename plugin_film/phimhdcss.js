/*
 * KKPhim plugin - optimized and backward-compatible
 * API: https://phimapi.com
 *
 * Giữ nguyên các hàm public để tương thích với ứng dụng/plugin host.
 * Tương thích JavaScript ES5 (không yêu cầu async/await, fetch hoặc DOM).
 */

var KKPHIM_BASE_URL = "https://phimapi.com";
var KKPHIM_IMAGE_FALLBACK = "https://phimimg.com";
var KKPHIM_DEFAULT_LIMIT = 24;
var KKPHIM_MIN_YEAR = 1970;

function getManifest() {
    return JSON.stringify({
        id: "kkphim",
        name: "KKPhim",
        version: "1.1.2",
        baseUrl: KKPHIM_BASE_URL,
        iconUrl: "https://raw.githubusercontent.com/youngbi/repo/main/plugins/kkphim.png",
        isEnabled: true,
        type: "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "tv-shows", title: "TV Shows", type: "Horizontal", path: "danh-sach" },
        { slug: "subteam", title: "Subteam", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-moi-cap-nhat-v3", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat-v3" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "TV shows", slug: "tv-shows" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Phim vietsub", slug: "phim-vietsub" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" },
        { name: "Subteam", slug: "subteam" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" }
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

/* -------------------------------------------------------------------------- */
/* COMMON HELPERS                                                             */
/* -------------------------------------------------------------------------- */

function safeJsonParse(value, fallback) {
    if (value && typeof value === "object") return value;
    if (typeof value !== "string" || !value.trim()) return fallback;
    try {
        return JSON.parse(value);
    } catch (e) {
        return fallback;
    }
}

function toInt(value, fallback, minValue) {
    var number = parseInt(value, 10);
    if (isNaN(number)) number = fallback;
    if (typeof minValue === "number" && number < minValue) number = minValue;
    return number;
}

function toText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
}

function firstNonEmpty() {
    var i;
    for (i = 0; i < arguments.length; i++) {
        if (arguments[i] !== null && typeof arguments[i] !== "undefined" &&
            String(arguments[i]).trim() !== "") {
            return arguments[i];
        }
    }
    return "";
}

function joinUrl(base, path) {
    return String(base || "").replace(/\/+$/, "") + "/" +
        String(path || "").replace(/^\/+/, "");
}

function buildQuery(params) {
    var parts = [];
    var key;
    for (key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key) &&
            params[key] !== null && typeof params[key] !== "undefined" &&
            String(params[key]).trim() !== "") {
            parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])));
        }
    }
    return parts.join("&");
}

function normalizeFilters(filtersJson) {
    var filters = safeJsonParse(filtersJson, {});
    if (!filters || typeof filters !== "object" || Array.isArray(filters)) filters = {};

    return {
        page: toInt(filters.page, 1, 1),
        limit: toInt(filters.limit, KKPHIM_DEFAULT_LIMIT, 1),
        country: toText(filters.country),
        year: toText(filters.year),
        category: toText(filters.category),
        sort: toText(filters.sort)
    };
}

/* -------------------------------------------------------------------------- */
/* URL GENERATION                                                             */
/* -------------------------------------------------------------------------- */

function getUrlList(slug, filtersJson) {
    var filters = normalizeFilters(filtersJson);
    var typeList = toText(slug) || "phim-moi-cap-nhat-v3";
    var listSlugs = [
        "phim-vietsub", "subteam", "phim-thuyet-minh", "phim-long-tieng",
        "phim-bo", "phim-le", "hoat-hinh", "tv-shows", "phim-chieu-rap",
        "phim-moi-cap-nhat"
    ];
    var basePath;
    var params;
    var url;

    if (typeList === "phim-moi") typeList = "phim-moi-cap-nhat-v3";

    params = {
        page: filters.page,
        limit: filters.limit
    };

    /*
     * Endpoint danh sách phim mới dạng V3 là endpoint riêng của API.
     * Các bộ lọc country/year/category/sort không được API này đảm bảo hỗ trợ.
     */
    if (typeList === "phim-moi-cap-nhat-v3") {
        return joinUrl(KKPHIM_BASE_URL, "danh-sach/phim-moi-cap-nhat-v3") +
            "?" + buildQuery(params);
    }

    basePath = listSlugs.indexOf(typeList) !== -1 ? "danh-sach" : "the-loai";
    if (filters.country) params.country = filters.country;
    if (filters.year) params.year = filters.year;
    if (filters.category) params.category = filters.category;
    if (filters.sort) params.sort_field = filters.sort;

    url = joinUrl(KKPHIM_BASE_URL, "v1/api/" + basePath + "/" + encodeURIComponent(typeList));
    return url + "?" + buildQuery(params);
}

function getUrlSearch(keyword, filtersJson) {
    var filters = normalizeFilters(filtersJson);
    var params = {
        keyword: toText(keyword),
        page: filters.page,
        limit: filters.limit
    };

    return joinUrl(KKPHIM_BASE_URL, "v1/api/tim-kiem") + "?" + buildQuery(params);
}

function getUrlDetail(slug) {
    return joinUrl(KKPHIM_BASE_URL, "phim/" + encodeURIComponent(toText(slug)));
}

function getUrlCategories() {
    return joinUrl(KKPHIM_BASE_URL, "the-loai");
}

function getUrlCountries() {
    return joinUrl(KKPHIM_BASE_URL, "quoc-gia");
}

/* API hiện tại không có endpoint năm được xác nhận trong cấu hình gốc. */
function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var currentYear = new Date().getFullYear();
    var years = [];
    var year;

    for (year = currentYear; year >= KKPHIM_MIN_YEAR; year--) {
        years.push({ name: String(year), value: String(year) });
    }
    return JSON.stringify(years);
}

/* -------------------------------------------------------------------------- */
/* RESPONSE HELPERS                                                           */
/* -------------------------------------------------------------------------- */

function extractArrayItems(response) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.items)) return response.data.items;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.result && Array.isArray(response.result.items)) return response.result.items;
    return [];
}

function extractCdnDomain(response) {
    var candidates = [
        response && response.data && response.data.APP_DOMAIN_CDN_IMAGE,
        response && response.APP_DOMAIN_CDN_IMAGE,
        response && response.data && response.data.APP_DOMAIN_CDN
    ];
    var i;
    for (i = 0; i < candidates.length; i++) {
        if (candidates[i]) return String(candidates[i]).trim().replace(/\/+$/, "");
    }
    return KKPHIM_IMAGE_FALLBACK;
}

function getPosterUrl(path, cdnDomain, fallbackPath) {
    var raw = firstNonEmpty(path, fallbackPath);
    var value;
    var base;

    if (!raw) return "";
    value = String(raw).trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value) || /^data:image\//i.test(value)) return value;
    if (value.indexOf("//") === 0) return "https:" + value;

    base = String(cdnDomain || KKPHIM_IMAGE_FALLBACK).trim().replace(/\/+$/, "");
    return base + "/" + value.replace(/^\/+/, "");
}

function getPagination(response, itemCount) {
    var data = response && response.data && !Array.isArray(response.data) ? response.data : {};
    var params = data.params || {};
    var pagination = (response && response.pagination) || params.pagination || data.pagination || {};
    var currentPage = toInt(firstNonEmpty(pagination.currentPage, pagination.current_page), 1, 1);
    var totalItems = toInt(firstNonEmpty(pagination.totalItems, pagination.total_items), itemCount, 0);
    var itemsPerPage = toInt(firstNonEmpty(
        pagination.totalItemsPerPage,
        pagination.itemsPerPage,
        pagination.items_per_page
    ), KKPHIM_DEFAULT_LIMIT, 1);
    var totalPages = toInt(firstNonEmpty(pagination.totalPages, pagination.total_pages),
        Math.max(1, Math.ceil(totalItems / itemsPerPage)), 1);

    return {
        currentPage: currentPage,
        totalPages: totalPages,
        totalItems: totalItems,
        itemsPerPage: itemsPerPage
    };
}

function normalizeMovieItem(item, cdnDomain) {
    item = item || {};
    return {
        id: toText(firstNonEmpty(item.slug, item._id, item.id)),
        title: toText(firstNonEmpty(item.name, item.title, item.origin_name)),
        posterUrl: getPosterUrl(item.poster_url || item.posterUrl, cdnDomain,
            item.thumb_url || item.thumbUrl),
        backdropUrl: getPosterUrl(item.thumb_url || item.thumbUrl, cdnDomain,
            item.poster_url || item.posterUrl),
        year: toInt(item.year, 0, 0),
        quality: toText(item.quality),
        episode_current: toText(firstNonEmpty(item.episode_current, item.episodeCurrent)),
        lang: toText(firstNonEmpty(item.lang, item.language))
    };
}

function parseListResponse(apiResponseJson) {
    var response = safeJsonParse(apiResponseJson, null);
    var items;
    var cdnDomain;
    var movies;
    var pagination;

    if (!response) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: KKPHIM_DEFAULT_LIMIT }
        });
    }

    items = extractArrayItems(response);
    cdnDomain = extractCdnDomain(response);
    movies = items.map(function (item) {
        return normalizeMovieItem(item, cdnDomain);
    });
    pagination = getPagination(response, movies.length);

    return JSON.stringify({ items: movies, pagination: pagination });
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

/* -------------------------------------------------------------------------- */
/* MOVIE DETAIL                                                               */
/* -------------------------------------------------------------------------- */

function decodeHtmlEntities(value) {
    var text = String(value || "");
    var named = {
        "&nbsp;": " ",
        "&amp;": "&",
        "&quot;": "\"",
        "&apos;": "'",
        "&lt;": "<",
        "&gt;": ">"
    };

    text = text.replace(/&(nbsp|amp|quot|apos|lt|gt);/gi, function (match) {
        return named[match.toLowerCase()] || match;
    });

    text = text.replace(/&#(\d+);/g, function (match, decimal) {
        var code = parseInt(decimal, 10);
        return code >= 0 && code <= 1114111 ? String.fromCharCode(code) : match;
    });

    text = text.replace(/&#x([0-9a-f]+);/gi, function (match, hex) {
        var code = parseInt(hex, 16);
        return code >= 0 && code <= 1114111 ? String.fromCharCode(code) : match;
    });

    return text;
}

function stripHtml(value) {
    return decodeHtmlEntities(String(value || "")
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|li|h[1-6])\s*>/gi, "\n")
        .replace(/<[^>]*>/g, " "))
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

function joinNames(items) {
    if (!Array.isArray(items)) return "";
    return items.map(function (item) {
        if (item && typeof item === "object") return toText(item.name);
        return toText(item);
    }).filter(Boolean).join(", ");
}

function parseEpisodeServers(episodes) {
    var servers = [];
    var seenServers = {};
    var i;
    var j;

    if (!Array.isArray(episodes)) return servers;

    for (i = 0; i < episodes.length; i++) {
        var server = episodes[i] || {};
        var serverData = Array.isArray(server.server_data) ? server.server_data : [];
        var serverEpisodes = [];
        var seenEpisodes = {};

        for (j = 0; j < serverData.length; j++) {
            var episode = serverData[j] || {};
            var m3u8 = toText(episode.link_m3u8);
            var embed = toText(episode.link_embed);
            var streamUrl = firstNonEmpty(m3u8, embed);
            var episodeId;

            if (!streamUrl) continue;
            episodeId = streamUrl;

            if (seenEpisodes[episodeId]) continue;
            seenEpisodes[episodeId] = true;

            serverEpisodes.push({
                id: episodeId,
                name: toText(firstNonEmpty(episode.name, episode.slug)),
                slug: toText(episode.slug),
                m3u8: m3u8,
                embed: embed
            });
        }

        if (serverEpisodes.length) {
            var serverName = toText(server.server_name) || ("Server " + (i + 1));
            var serverKey = serverName.toLowerCase();

            if (seenServers[serverKey]) serverName += " " + (i + 1);
            seenServers[serverKey] = true;

            servers.push({ name: serverName, episodes: serverEpisodes });
        }
    }

    return servers;
}

function parseMovieDetail(apiResponseJson) {
    var response = safeJsonParse(apiResponseJson, null);
    var movie;
    var tmdb;
    var cdnDomain;
    var result;

    if (!response || typeof response !== "object") return "null";

    movie = response.movie || (response.data && response.data.movie) || {};
    if (!movie || typeof movie !== "object") return "null";

    tmdb = movie.tmdb && typeof movie.tmdb === "object" ? movie.tmdb : {};
    cdnDomain = extractCdnDomain(response);

    result = {
        id: toText(firstNonEmpty(movie.slug, movie._id)),
        title: toText(firstNonEmpty(movie.name, movie.title)),
        originName: toText(movie.origin_name),
        posterUrl: getPosterUrl(movie.poster_url, cdnDomain, movie.thumb_url),
        backdropUrl: getPosterUrl(movie.thumb_url, cdnDomain, movie.poster_url),
        description: stripHtml(firstNonEmpty(movie.content, movie.description)),
        year: toInt(movie.year, 0, 0),
        rating: parseFloat(tmdb.vote_average) || 0,
        quality: toText(movie.quality),
        duration: toText(firstNonEmpty(movie.time, movie.duration)),
        servers: parseEpisodeServers(response.episodes || response.server_data || []),
        episode_current: toText(firstNonEmpty(movie.episode_current, movie.episodeCurrent)),
        lang: toText(firstNonEmpty(movie.lang, movie.language)),
        category: joinNames(movie.category),
        country: joinNames(movie.country),
        director: joinNames(movie.director),
        casts: joinNames(movie.actor),
        status: toText(movie.status),
        tmdbId: toText(tmdb.id),
        tmdbSeason: toInt(tmdb.season, 0, 0),
        tmdbType: toText(tmdb.type)
    };

    return JSON.stringify(result);
}

/* -------------------------------------------------------------------------- */
/* STREAM RESOLUTION                                                          */
/* -------------------------------------------------------------------------- */

function resolveStreamData(streamInput) {
    var raw = toText(streamInput);
    var isDirect = /\.(m3u8|mp4)(\?|#|$)/i.test(raw);

    return JSON.stringify({
        url: raw,
        isDirectStream: isDirect,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": KKPHIM_BASE_URL + "/"
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    var parsed;
    var candidate;

    if (apiResponseJson === null || typeof apiResponseJson === "undefined") {
        return resolveStreamData("");
    }

    parsed = safeJsonParse(apiResponseJson, null);

    if (parsed && typeof parsed === "object") {
        candidate = firstNonEmpty(
            parsed.url,
            parsed.streamUrl,
            parsed.stream_url,
            parsed.link_m3u8,
            parsed.link_embed,
            parsed.link
        );

        if (!candidate && parsed.data && typeof parsed.data === "object") {
            candidate = firstNonEmpty(
                parsed.data.url,
                parsed.data.streamUrl,
                parsed.data.link_m3u8,
                parsed.data.link_embed
            );
        }
        return resolveStreamData(candidate);
    }

    return resolveStreamData(apiResponseJson);
}

/* -------------------------------------------------------------------------- */
/* CATEGORY / COUNTRY / YEAR PARSERS                                           */
/* -------------------------------------------------------------------------- */

function parseCategoriesResponse(apiResponseJson) {
    var response = safeJsonParse(apiResponseJson, null);
    var items = extractArrayItems(response);

    return JSON.stringify(items.map(function (item) {
        item = item || {};
        return {
            name: toText(item.name),
            slug: toText(firstNonEmpty(item.slug, item.value))
        };
    }).filter(function (item) {
        return item.name || item.slug;
    }));
}

function parseCountriesResponse(apiResponseJson) {
    var response = safeJsonParse(apiResponseJson, null);
    var items = extractArrayItems(response);

    return JSON.stringify(items.map(function (item) {
        item = item || {};
        return {
            name: toText(item.name),
            value: toText(firstNonEmpty(item.slug, item.value))
        };
    }).filter(function (item) {
        return item.name || item.value;
    }));
}

function parseYearsResponse(apiResponseJson) {
    var response = safeJsonParse(apiResponseJson, null);
    var items = extractArrayItems(response);

    return JSON.stringify(items.map(function (item) {
        var value;
        var label;

        if (item && typeof item === "object") {
            value = firstNonEmpty(item.slug, item.value, item.year, item.name);
            label = firstNonEmpty(item.name, item.year, value);
        } else {
            value = item;
            label = item;
        }

        return {
            name: toText(label),
            value: toText(value)
        };
    }).filter(function (item) {
        return item.name || item.value;
    }));
}
