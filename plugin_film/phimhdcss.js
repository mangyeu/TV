// =============================================================================
// KKPHIM PLUGIN v1.1.0
// API: https://phimapi.com
// Type: MOVIE (JSON API, không scrape HTML)
// =============================================================================

// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "kkphim",
        "name": "KKPhim",
        "version": "1.1.0",
        "baseUrl": "https://phimapi.com",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/kkphim.png",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-chieu-rap',       title: 'Phim Chiếu Rạp',       type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo',              title: 'Phim Bộ',               type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-le',              title: 'Phim Lẻ',               type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh',            title: 'Hoạt Hình',             type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows',             title: 'TV Shows',              type: 'Horizontal', path: 'danh-sach' },
        { slug: 'subteam',              title: 'Subteam',               type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-thuyet-minh',     title: 'Phim Thuyết Minh',      type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-long-tieng',      title: 'Phim Lồng Tiếng',       type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-moi-cap-nhat-v3', title: 'Phim Mới Cập Nhật',     type: 'Grid',       path: 'danh-sach' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới',            slug: 'phim-moi-cap-nhat-v3' },
        { name: 'Phim bộ',             slug: 'phim-bo' },
        { name: 'Phim lẻ',             slug: 'phim-le' },
        { name: 'TV shows',            slug: 'tv-shows' },
        { name: 'Hoạt hình',           slug: 'hoat-hinh' },
        { name: 'Phim vietsub',        slug: 'phim-vietsub' },
        { name: 'Phim thuyết minh',    slug: 'phim-thuyet-minh' },
        { name: 'Phim lồng tiếng',     slug: 'phim-long-tieng' },
        { name: 'Subteam',             slug: 'subteam' },
        { name: 'Phim chiếu rạp',      slug: 'phim-chieu-rap' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Thời gian cập nhật', value: 'modified.time' },
            { name: 'Năm phát hành',       value: 'year' },
            { name: 'Theo ID',             value: '_id' }
        ]
    });
}

// =============================================================================
// CONSTANTS
// =============================================================================

var KKPHIM_LIST_SLUGS = [
    'phim-vietsub', 'subteam', 'phim-thuyet-minh', 'phim-long-tieng',
    'phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows', 'phim-chieu-rap',
    'phim-moi-cap-nhat'
];

var KKPHIM_DEFAULT_CDN = "https://phimimg.com";
var KKPHIM_DEFAULT_LIMIT = 24;
var KKPHIM_USER_AGENT = "Mozilla/5.0";

// =============================================================================
// SAFE HELPERS
// =============================================================================

function safeJsonParse(str, fallback) {
    try {
        if (str == null) return fallback;
        if (typeof str === "object") return str;
        return JSON.parse(String(str));
    } catch (e) {
        return fallback;
    }
}

function safeJsonStringify(obj) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return "{}";
    }
}

function toInt(value, fallback) {
    var n = parseInt(value, 10);
    return isNaN(n) ? (fallback || 0) : n;
}

function toFloat(value, fallback) {
    var n = parseFloat(value);
    return isNaN(n) ? (fallback || 0) : n;
}

function emptyListResponse() {
    return {
        items: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: KKPHIM_DEFAULT_LIMIT
        }
    };
}

function emptyDetailResponse() {
    return {
        id: "",
        title: "",
        originName: "",
        posterUrl: "",
        backdropUrl: "",
        description: "",
        year: 0,
        rating: 0,
        quality: "",
        duration: "",
        servers: [],
        episode_current: "",
        lang: "",
        category: "",
        country: "",
        director: "",
        casts: "",
        status: "",
        tmdbId: "",
        tmdbSeason: 0,
        tmdbType: ""
    };
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = safeJsonParse(filtersJson || "{}", {});
        var page = toInt(filters.page, 1) || 1;
        var limit = toInt(filters.limit, KKPHIM_DEFAULT_LIMIT) || KKPHIM_DEFAULT_LIMIT;

        var typeList = (slug === 'phim-moi') ? 'phim-moi-cap-nhat-v3' : (slug || 'phim-moi-cap-nhat-v3');

        // Endpoint đặc biệt cho "phim mới cập nhật"
        if (typeList === 'phim-moi-cap-nhat-v3') {
            return "https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3"
                + "?page=" + page
                + "&limit=" + limit;
        }

        // Danh sách chuẩn (phim-bo, phim-le, ...) dùng path "danh-sach"
        // Thể loại (action, drama, ...) dùng path "the-loai"
        var basePath = (KKPHIM_LIST_SLUGS.indexOf(typeList) !== -1) ? "danh-sach" : "the-loai";

        var url = "https://phimapi.com/v1/api/" + basePath + "/" + encodeURIComponent(typeList)
            + "?page=" + page
            + "&limit=" + limit;

        if (filters.country)  url += "&country="   + encodeURIComponent(filters.country);
        if (filters.year)     url += "&year="      + encodeURIComponent(filters.year);
        if (filters.category) url += "&category="  + encodeURIComponent(filters.category);
        if (filters.sort)     url += "&sort_field=" + encodeURIComponent(filters.sort);

        return url;
    } catch (e) {
        return "https://phimapi.com/v1/api/danh-sach/"
            + encodeURIComponent(slug || "phim-moi-cap-nhat")
            + "?page=1&limit=" + KKPHIM_DEFAULT_LIMIT;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = safeJsonParse(filtersJson || "{}", {});
        var page = toInt(filters.page, 1) || 1;
        var limit = toInt(filters.limit, KKPHIM_DEFAULT_LIMIT) || KKPHIM_DEFAULT_LIMIT;
        var q = encodeURIComponent(String(keyword || "").trim());

        return "https://phimapi.com/v1/api/tim-kiem"
            + "?keyword=" + q
            + "&page=" + page
            + "&limit=" + limit;
    } catch (e) {
        return "https://phimapi.com/v1/api/tim-kiem"
            + "?keyword=" + encodeURIComponent(keyword || "")
            + "&page=1&limit=" + KKPHIM_DEFAULT_LIMIT;
    }
}

// Chi tiết phim: endpoint KHÁC với list — không có "/v1/api/"
function getUrlDetail(slug) {
    return "https://phimapi.com/phim/" + encodeURIComponent(slug || "");
}

function getUrlCategories() {
    return "https://phimapi.com/the-loai";
}

function getUrlCountries() {
    return "https://phimapi.com/quoc-gia";
}

// Danh sách năm là local (không có endpoint) → trả luôn danh sách
function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var y = currentYear; y >= 1970; y--) {
        years.push({ name: String(y), value: String(y) });
    }
    return JSON.stringify(years);
}

function parseYearsResponse() {
    return getLocalYearsJson();
}

// =============================================================================
// HELPERS
// =============================================================================

function extractArrayItems(response) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.items)) return response.data.items;
    return [];
}

function extractCdnDomain(response) {
    if (response && response.data && typeof response.data === "object"
        && response.data.APP_DOMAIN_CDN_IMAGE) {
        return String(response.data.APP_DOMAIN_CDN_IMAGE).trim();
    }
    if (response && response.APP_DOMAIN_CDN_IMAGE) {
        return String(response.APP_DOMAIN_CDN_IMAGE).trim();
    }
    return KKPHIM_DEFAULT_CDN;
}

function getPosterUrl(path, cdnDomain, fallbackPath) {
    var raw = path || fallbackPath || "";
    if (!raw) return "";

    var str = String(raw).trim();
    if (!str) return "";

    if (str.indexOf("http://") === 0 || str.indexOf("https://") === 0) {
        return str;
    }

    var baseCdn = String(cdnDomain || KKPHIM_DEFAULT_CDN).trim().replace(/\/+$/, "");
    var cleanPath = str.replace(/^\/+/, "");

    return baseCdn + "/" + cleanPath;
}

function cleanHtmlText(html) {
    if (!html) return "";
    return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function joinNames(arr) {
    if (!Array.isArray(arr)) return "";
    return arr.map(function (x) {
        if (!x) return "";
        if (typeof x === "string") return x;
        return x.name || x.slug || "";
    }).filter(Boolean).join(", ");
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = safeJsonParse(apiResponseJson, null);
        if (!response) return safeJsonStringify(emptyListResponse());

        var items = extractArrayItems(response);
        var cdnDomain = extractCdnDomain(response);

        // Pagination có thể nằm ở top-level hoặc trong data.params
        var data = (response.data && !Array.isArray(response.data)) ? response.data : {};
        var params = data.params || {};
        var pagination = response.pagination || params.pagination || {};

        var currentPage = toInt(pagination.currentPage, 1) || 1;
        var totalItems = toInt(pagination.totalItems, items.length);
        var itemsPerPage = toInt(
            pagination.totalItemsPerPage || pagination.itemsPerPage,
            KKPHIM_DEFAULT_LIMIT
        ) || KKPHIM_DEFAULT_LIMIT;
        var totalPages = toInt(pagination.totalPages, 0)
            || Math.max(1, Math.ceil(totalItems / itemsPerPage));

        var movies = items.map(function (item) {
            item = item || {};
            return {
                id: item.slug || item._id || "",
                title: item.name || item.origin_name || "",
                posterUrl: getPosterUrl(item.poster_url, cdnDomain, item.thumb_url),
                backdropUrl: getPosterUrl(item.thumb_url, cdnDomain, item.poster_url),
                year: toInt(item.year, 0),
                quality: item.quality || "",
                episode_current: item.episode_current || "",
                lang: item.lang || ""
            };
        }).filter(function (m) { return m.id; });

        return safeJsonStringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        return safeJsonStringify(emptyListResponse());
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = safeJsonParse(apiResponseJson, null);
        if (!response || !response.movie) {
            return safeJsonStringify(emptyDetailResponse());
        }

        var movie = response.movie || {};
        var episodes = Array.isArray(response.episodes) ? response.episodes : [];
        var cdnDomain = extractCdnDomain(response);

        // Build servers
        var servers = [];
        for (var i = 0; i < episodes.length; i++) {
            var server = episodes[i] || {};
            var serverData = Array.isArray(server.server_data) ? server.server_data : [];
            var serverEpisodes = [];

            for (var j = 0; j < serverData.length; j++) {
                var ep = serverData[j] || {};
                var streamUrl = ep.link_m3u8 || ep.link_embed || "";
                if (!streamUrl) continue;

                serverEpisodes.push({
                    id: streamUrl,
                    name: ep.name || "",
                    slug: ep.slug || "",
                    m3u8: ep.link_m3u8 || "",
                    embed: ep.link_embed || ""
                });
            }

            if (serverEpisodes.length > 0) {
                servers.push({
                    name: server.server_name || ("Server " + (i + 1)),
                    episodes: serverEpisodes
                });
            }
        }

        // TMDB metadata
        var ratingValue = 0;
        var tmdbId = "";
        var tmdbSeason = 0;
        var tmdbType = "";

        if (movie.tmdb && typeof movie.tmdb === "object") {
            ratingValue = toFloat(movie.tmdb.vote_average, 0);
            tmdbId = movie.tmdb.id ? String(movie.tmdb.id) : "";
            tmdbSeason = toInt(movie.tmdb.season, 0);
            tmdbType = movie.tmdb.type ? String(movie.tmdb.type) : "";
        }

        return safeJsonStringify({
            id: movie.slug || "",
            title: movie.name || "",
            originName: movie.origin_name || "",
            posterUrl: getPosterUrl(movie.poster_url, cdnDomain, movie.thumb_url),
            backdropUrl: getPosterUrl(movie.thumb_url, cdnDomain, movie.poster_url),
            description: cleanHtmlText(movie.content || ""),
            year: toInt(movie.year, 0),
            rating: ratingValue,
            quality: movie.quality || "",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.episode_current || "",
            lang: movie.lang || "",
            category: joinNames(movie.category),
            country: joinNames(movie.country),
            director: joinNames(movie.director),
            casts: joinNames(movie.actor),
            status: movie.status || "",
            tmdbId: tmdbId,
            tmdbSeason: tmdbSeason,
            tmdbType: tmdbType
        });
    } catch (error) {
        return safeJsonStringify(emptyDetailResponse());
    }
}

// =============================================================================
// STREAM RESOLUTION
// =============================================================================

function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").trim();
    var isHlsOrDirect = /\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw);

    return safeJsonStringify({
        url: raw,
        isDirectStream: isHlsOrDirect,
        headers: {
            "User-Agent": KKPHIM_USER_AGENT,
            "Referer": "https://phimapi.com/"
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    try {
        var parsed = safeJsonParse(apiResponseJson, null);

        // Trường hợp parsed là string URL thuần (không phải object)
        if (typeof parsed === "string") {
            return resolveStreamData(parsed);
        }

        // Trường hợp parsed là object có chứa stream field
        if (parsed && typeof parsed === "object") {
            var candidate = parsed.url
                || parsed.streamUrl
                || parsed.link_m3u8
                || parsed.link_embed
                || "";
            if (candidate) return resolveStreamData(candidate);
        }

        // Fallback: coi input gốc là stream URL
        return resolveStreamData(apiResponseJson);
    } catch (e) {
        return resolveStreamData(apiResponseJson);
    }
}

function parseEmbedResponse(apiResponseJson) {
    return parseDetailResponse(apiResponseJson);
}

// =============================================================================
// CATEGORIES / COUNTRIES
// =============================================================================

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = safeJsonParse(apiResponseJson, null);
        var items = extractArrayItems(response);

        return safeJsonStringify(items.map(function (i) {
            i = i || {};
            return {
                name: i.name || "",
                slug: i.slug || ""
            };
        }).filter(function (c) { return c.slug || c.name; }));
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var response = safeJsonParse(apiResponseJson, null);
        var items = extractArrayItems(response);

        return safeJsonStringify(items.map(function (i) {
            i = i || {};
            return {
                name: i.name || "",
                value: i.slug || ""
            };
        }).filter(function (c) { return c.value || c.name; }));
    } catch (e) {
        return "[]";
    }
}
