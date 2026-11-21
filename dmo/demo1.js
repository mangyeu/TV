var TVHAY_CONFIG = {
    id: "tvhay",
    name: "TVHay",
    version: "1.0.0",
    baseUrl: "https://tvhay.buzz",
    iconUrl: "",
    defaultCdn: "https://tvhay.buzz",
    defaultReferer: "https://tvhay.buzz/",
    defaultUserAgent: "Mozilla/5.0"
};

function getManifest() {
    return JSON.stringify({
        "id": TVHAY_CONFIG.id,
        "name": TVHAY_CONFIG.name,
        "version": TVHAY_CONFIG.version,
        "baseUrl": TVHAY_CONFIG.baseUrl,
        "iconUrl": TVHAY_CONFIG.iconUrl,
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi-cap-nhat' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' }
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
        var page = parseInt(filters.page, 10) || 1;
        var limit = parseInt(filters.limit, 10) || 24;
        var targetSlug = slug || "phim-moi-cap-nhat";
        var url = TVHAY_CONFIG.baseUrl + "/danh-sach/" + encodeURIComponent(targetSlug) + "?page=" + page + "&limit=" + limit;

        if (filters.country) url += "&country=" + encodeURIComponent(filters.country);
        if (filters.year) url += "&year=" + encodeURIComponent(filters.year);
        if (filters.category) url += "&category=" + encodeURIComponent(filters.category);
        if (filters.sort) url += "&sort=" + encodeURIComponent(filters.sort);

        return url;
    } catch (e) {
        return TVHAY_CONFIG.baseUrl + "/danh-sach/" + encodeURIComponent(slug || "phim-moi-cap-nhat");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var limit = parseInt(filters.limit, 10) || 24;
        var q = encodeURIComponent(String(keyword || "").replace(/^\s+|\s+$/g, ""));
        return TVHAY_CONFIG.baseUrl + "/tim-kiem?keyword=" + q + "&page=" + page + "&limit=" + limit;
    } catch (e) {
        return TVHAY_CONFIG.baseUrl + "/tim-kiem?keyword=" + encodeURIComponent(keyword || "") + "&page=1&limit=24";
    }
}

function getUrlDetail(slug) {
    return TVHAY_CONFIG.baseUrl + "/phim/" + encodeURIComponent(slug || "");
}

function getUrlCategories() {
    return TVHAY_CONFIG.baseUrl + "/the-loai";
}

function getUrlCountries() {
    return TVHAY_CONFIG.baseUrl + "/quoc-gia";
}

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

// =============================================================================
// PARSERS & HELPERS
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
    if (response && response.data && typeof response.data === "object" && response.data.APP_DOMAIN_CDN_IMAGE) {
        return String(response.data.APP_DOMAIN_CDN_IMAGE).replace(/^\s+|\s+$/g, "");
    }
    if (response && response.APP_DOMAIN_CDN_IMAGE) {
        return String(response.APP_DOMAIN_CDN_IMAGE).replace(/^\s+|\s+$/g, "");
    }
    return TVHAY_CONFIG.defaultCdn;
}

function getPosterUrl(path, cdnDomain, fallbackPath) {
    var raw = path || fallbackPath || "";
    if (!raw) return "";

    var str = String(raw).replace(/^\s+|\s+$/g, "");
    if (!str) return "";

    if (str.indexOf("http://") === 0 || str.indexOf("https://") === 0) {
        return str;
    }

    var baseCdn = String(cdnDomain || TVHAY_CONFIG.defaultCdn).replace(/^\s+|\s+$/g, "").replace(/\/+$/, "");
    var cleanPath = str.replace(/^\/+/, "");

    return baseCdn + "/" + cleanPath;
}

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = extractArrayItems(response);
        var cdnDomain = extractCdnDomain(response);
        var data = (response && response.data && !Array.isArray(response.data)) ? response.data : {};
        var params = data.params || {};
        var pagination = response.pagination || params.pagination || {};

        var currentPage = parseInt(pagination.currentPage, 10) || 1;
        var totalItems = parseInt(pagination.totalItems, 10) || items.length;
        var itemsPerPage = parseInt(pagination.totalItemsPerPage || pagination.itemsPerPage, 10) || 24;
        var totalPages = parseInt(pagination.totalPages, 10) || Math.max(1, Math.ceil(totalItems / itemsPerPage));

        var movies = items.map(function (item) {
            return {
                id: item.slug || "",
                title: item.name || item.title || "",
                posterUrl: getPosterUrl(item.poster_url || item.posterUrl, cdnDomain, item.thumb_url || item.thumbUrl),
                backdropUrl: getPosterUrl(item.thumb_url || item.thumbUrl, cdnDomain, item.poster_url || item.posterUrl),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current: item.episode_current || "",
                lang: item.lang || ""
            };
        });

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 }
        });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.movie || response.data || {};
        var episodes = Array.isArray(response.episodes)
            ? response.episodes
            : (Array.isArray(movie.episodes) ? movie.episodes : []);
        var cdnDomain = extractCdnDomain(response);

        var servers = [];
        for (var i = 0; i < episodes.length; i++) {
            var server = episodes[i] || {};
            var serverData = Array.isArray(server.server_data) ? server.server_data : [];
            var serverEpisodes = [];

            for (var j = 0; j < serverData.length; j++) {
                var ep = serverData[j] || {};
                var streamUrl = ep.link_m3u8 || ep.m3u8 || ep.link_embed || ep.embed || "";
                if (streamUrl) {
                    serverEpisodes.push({
                        id: streamUrl,
                        name: ep.name || "",
                        slug: ep.slug || "",
                        m3u8: ep.link_m3u8 || ep.m3u8 || "",
                        embed: ep.link_embed || ep.embed || ""
                    });
                }
            }

            if (serverEpisodes.length > 0) {
                servers.push({
                    name: server.server_name || server.name || ("Server " + (i + 1)),
                    episodes: serverEpisodes
                });
            }
        }

        var categories = Array.isArray(movie.category)
            ? movie.category.map(function (c) { return c && c.name ? c.name : ""; }).filter(Boolean).join(", ")
            : "";

        var countries = Array.isArray(movie.country)
            ? movie.country.map(function (c) { return c && c.name ? c.name : ""; }).filter(Boolean).join(", ")
            : "";

        var directors = Array.isArray(movie.director) ? movie.director.filter(Boolean).join(", ") : "";
        var actors = Array.isArray(movie.actor) ? movie.actor.filter(Boolean).join(", ") : "";

        var ratingValue = 0;
        var tmdbId = "";
        var tmdbSeason = 0;
        var tmdbType = "";

        if (movie.tmdb && typeof movie.tmdb === "object") {
            if (movie.tmdb.vote_average) ratingValue = parseFloat(movie.tmdb.vote_average) || 0;
            if (movie.tmdb.id) tmdbId = String(movie.tmdb.id);
            if (movie.tmdb.season) tmdbSeason = parseInt(movie.tmdb.season, 10) || 0;
            if (movie.tmdb.type) tmdbType = String(movie.tmdb.type);
        }

        var cleanDescription = String(movie.content || movie.description || "")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<[^>]*>/g, "")
            .replace(/^\s+|\s+$/g, "");

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || movie.title || "",
            originName: movie.origin_name || movie.originName || "",
            posterUrl: getPosterUrl(movie.poster_url || movie.posterUrl, cdnDomain, movie.thumb_url || movie.thumbUrl),
            backdropUrl: getPosterUrl(movie.thumb_url || movie.thumbUrl, cdnDomain, movie.poster_url || movie.posterUrl),
            description: cleanDescription,
            year: parseInt(movie.year, 10) || 0,
            rating: ratingValue,
            quality: movie.quality || "",
            duration: movie.time || movie.duration || "",
            servers: servers,
            episode_current: movie.episode_current || "",
            lang: movie.lang || "",
            category: categories,
            country: countries,
            director: directors,
            casts: actors,
            status: movie.status || "",
            tmdbId: tmdbId,
            tmdbSeason: tmdbSeason,
            tmdbType: tmdbType
        });
    } catch (error) {
        return "null";
    }
}

function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").replace(/^\s+|\s+$/g, "");
    var isHlsOrDirect = /\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw);
    return JSON.stringify({
        url: raw,
        isDirectStream: isHlsOrDirect,
        headers: {
            "User-Agent": TVHAY_CONFIG.defaultUserAgent,
            "Referer": TVHAY_CONFIG.defaultReferer
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    try {
        var parsed = JSON.parse(apiResponseJson || "{}");
        var candidate = parsed.url || parsed.streamUrl || parsed.link_m3u8 || parsed.m3u8 || parsed.link_embed || parsed.embed || "";
        return resolveStreamData(candidate);
    } catch (e) {
        return resolveStreamData(apiResponseJson);
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = extractArrayItems(response);
        return JSON.stringify(items.map(function (i) {
            return {
                name: i.name || "",
                slug: i.slug || ""
            };
        }));
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = extractArrayItems(response);
        return JSON.stringify(items.map(function (i) {
            return {
                name: i.name || "",
                value: i.slug || i.value || ""
            };
        }));
    } catch (e) {
        return "[]";
    }
}

function parseYearsResponse(apiResponseJson) {
    try {
        var items = extractArrayItems(JSON.parse(apiResponseJson));
        return JSON.stringify(items.map(function (i) {
            var val = (typeof i === "object" && i !== null) ? (i.slug || i.value || i.year || i.name) : i;
            var label = (typeof i === "object" && i !== null) ? (i.name || i.year || val) : i;
            return { name: String(label || ""), value: String(val || "") };
        }));
    } catch (e) {
        return "[]";
    }
}
