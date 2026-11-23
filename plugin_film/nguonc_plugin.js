// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var NGUONC_BASE_URL = "https://phim.nguonc.com/api";
var NGUONC_SITE_URL = "https://phim.nguonc.com";

function isArraySafe(val) {
    return Object.prototype.toString.call(val) === "[object Array]";
}

function safeStringify(obj, fallbackStr) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return fallbackStr || "{}";
    }
}

function getManifest() {
    return safeStringify({
        id: "nguonc",
        name: "NguonC",
        version: "1.0.6",
        baseUrl: NGUONC_BASE_URL,
        iconUrl: "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonc.png",
        isEnabled: true,
        type: "MOVIE",
        supportsWebView: true
    }, "{}");
}

function getHomeSections() {
    return safeStringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "films" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "films" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "films" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "films" },
        { slug: "tv-shows", title: "TV Shows", type: "Horizontal", path: "films" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "films" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "films" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "films" }
    ], "[]");
}

function getPrimaryCategories() {
    return safeStringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "TV shows", slug: "tv-shows" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
    ], "[]");
}

function getFilterConfig() {
    return safeStringify({
        sort: [
            { name: "Mới cập nhật", value: "modified.time" },
            { name: "Năm phát hành", value: "year" }
        ]
    }, "{}");
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10);
        if (isNaN(page) || page < 1) page = 1;

        var typeList = (slug || "").replace(/^\s+|\s+$/g, "");
        if (!typeList || typeList === "phim-moi" || typeList === "phim-moi-cap-nhat-v3") {
            typeList = "phim-moi-cap-nhat";
        }

        // Slug phim lấy từ danh sách/tìm kiếm; URL mẫu chỉ dùng minh họa
        var url = NGUONC_BASE_URL + "/films/" + encodeURIComponent(typeList) + "?page=" + page;

        if (filters.limit !== undefined && filters.limit !== null && String(filters.limit).replace(/^\s+|\s+$/g, "") !== "") {
            url += "&limit=" + encodeURIComponent(String(filters.limit).replace(/^\s+|\s+$/g, ""));
        }
        if (filters.country && String(filters.country).replace(/^\s+|\s+$/g, "") !== "") {
            url += "&country=" + encodeURIComponent(String(filters.country).replace(/^\s+|\s+$/g, ""));
        }
        if (filters.year !== undefined && filters.year !== null && String(filters.year).replace(/^\s+|\s+$/g, "") !== "") {
            url += "&year=" + encodeURIComponent(String(filters.year).replace(/^\s+|\s+$/g, ""));
        }
        if (filters.category && String(filters.category).replace(/^\s+|\s+$/g, "") !== "") {
            url += "&category=" + encodeURIComponent(String(filters.category).replace(/^\s+|\s+$/g, ""));
        }
        if (filters.sort && String(filters.sort).replace(/^\s+|\s+$/g, "") !== "") {
            url += "&sort_field=" + encodeURIComponent(String(filters.sort).replace(/^\s+|\s+$/g, ""));
        }

        return url;
    } catch (e) {
        return NGUONC_BASE_URL + "/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10);
        if (isNaN(page) || page < 1) page = 1;

        var cleanKeyword = String(keyword || "").replace(/^\s+|\s+$/g, "");
        var url = NGUONC_BASE_URL + "/films/search?keyword=" + encodeURIComponent(cleanKeyword) + "&page=" + page;

        if (filters.limit !== undefined && filters.limit !== null && String(filters.limit).replace(/^\s+|\s+$/g, "") !== "") {
            url += "&limit=" + encodeURIComponent(String(filters.limit).replace(/^\s+|\s+$/g, ""));
        }

        return url;
    } catch (e) {
        return NGUONC_BASE_URL + "/films/search?keyword=" + encodeURIComponent(String(keyword || "")) + "&page=1";
    }
}

function getUrlDetail(slug) {
    var cleanSlug = String(slug || "").replace(/^\s+|\s+$/g, "");
    return NGUONC_BASE_URL + "/film/" + encodeURIComponent(cleanSlug);
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

    return { id: id, type: type, season: season, url: url };
}

function normalizeImdb(imdb) {
    var obj = imdb && typeof imdb === "object" ? imdb : {};
    var rawId = obj.id ? String(obj.id).replace(/^\s+|\s+$/g, "") : null;
    var id = (rawId && rawId.indexOf("tt") === 0) ? rawId : null;
    var url = obj.url ? String(obj.url) : null;

    return { id: id, url: url };
}

function buildPlayerPayload(m3u8Url, embedUrl, preferWebView) {
    var cleanM3u8 = String(m3u8Url || "").replace(/^\s+|\s+$/g, "");
    var cleanEmbed = String(embedUrl || "").replace(/^\s+|\s+$/g, "");

    var useWebView = Boolean(preferWebView || (cleanEmbed && !cleanM3u8));
    var primaryUrl = useWebView ? (cleanEmbed || cleanM3u8) : (cleanM3u8 || cleanEmbed);

    var defaultHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": NGUONC_SITE_URL + "/"
    };

    return {
        url: primaryUrl,
        m3u8: cleanM3u8,
        embed: cleanEmbed,
        embedUrl: cleanEmbed,
        isEmbed: useWebView,
        useWebView: useWebView,
        playerType: useWebView ? "webview" : "hls",
        headers: defaultHeaders,
        webviewConfig: {
            enabled: useWebView,
            javaScriptEnabled: true,
            domStorageEnabled: true,
            allowFileAccess: false,
            mediaPlaybackRequiresUserGesture: false,
            headers: defaultHeaders
        }
    };
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var raw = typeof apiResponseJson === "string" ? apiResponseJson.replace(/^\s+|\s+$/g, "") : "";
        if (!raw) {
            return safeStringify({
                items: [],
                error: "Phản hồi rỗng từ máy chủ",
                pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10, hasNextPage: false, nextPage: null }
            }, "{}");
        }

        var response = JSON.parse(raw);
        var errInfo = normalizeStatusError(response);
        if (errInfo) {
            return safeStringify({
                items: [],
                error: errInfo.message,
                errorCode: errInfo.code,
                retryAfterMs: errInfo.retryAfterMs || 0,
                pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10, hasNextPage: false, nextPage: null }
            }, "{}");
        }

        var catInfo = response.cat && typeof response.cat === "object" ? response.cat : null;
        var items = isArraySafe(response.items)
            ? response.items
            : (response.data && isArraySafe(response.data.items) ? response.data.items : []);
        var paginate = response.paginate || (response.data && response.data.paginate) || {};

        var currentPage = parseInt(paginate.current_page, 10);
        if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

        var totalPages = parseInt(paginate.total_page, 10);
        if (isNaN(totalPages) || totalPages < 1) totalPages = 1;

        var totalItems = parseInt(paginate.total_items, 10);
        if (isNaN(totalItems) || totalItems < 0) totalItems = items.length;

        var itemsPerPage = parseInt(paginate.items_per_page, 10);
        if (isNaN(itemsPerPage) || itemsPerPage < 1) itemsPerPage = items.length || 10;

        var movies = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i] || {};
            var slug = item.slug || "";
            var tmdb = normalizeTmdb(item.tmdb);
            var imdb = normalizeImdb(item.imdb);

            movies.push({
                id: slug,
                slug: slug,
                title: item.name || "",
                originName: item.original_name || item.origin_name || "",
                posterUrl: getPosterUrl(item.poster_url || item.thumb_url || ""),
                backdropUrl: getPosterUrl(item.thumb_url || item.poster_url || ""),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current: item.current_episode || item.episode_current || "",
                lang: item.language || item.lang || "",
                categoryTitle: catInfo && catInfo.name ? String(catInfo.name) : "",
                categorySlug: catInfo && catInfo.slug ? String(catInfo.slug) : "",
                tmdb: tmdb,
                imdb: imdb,
                tmdbId: tmdb.id !== null ? String(tmdb.id) : "",
                tmdbType: tmdb.type || "",
                tmdbSeason: tmdb.season !== null ? tmdb.season : 0,
                imdbId: imdb.id || ""
            });
        }

        return safeStringify({
            items: movies,
            category: catInfo,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage,
                hasNextPage: currentPage < totalPages,
                nextPage: currentPage < totalPages ? (currentPage + 1) : null
            }
        }, "{}");
    } catch (error) {
        return safeStringify({
            items: [],
            error: "Lỗi phân tích dữ liệu danh sách",
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10, hasNextPage: false, nextPage: null }
        }, "{}");
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var raw = typeof apiResponseJson === "string" ? apiResponseJson.replace(/^\s+|\s+$/g, "") : "";
        if (!raw) return "null";

        var response = JSON.parse(raw);
        var errInfo = normalizeStatusError(response);
        if (errInfo) {
            return safeStringify({
                error: errInfo.message,
                errorCode: errInfo.code,
                retryAfterMs: errInfo.retryAfterMs || 0
            }, "null");
        }

        var movie = response.movie || response.data || {};
        var episodes = isArraySafe(movie.episodes)
            ? movie.episodes
            : (isArraySafe(response.episodes) ? response.episodes : []);

        var servers = [];
        for (var sIdx = 0; sIdx < episodes.length; sIdx++) {
            var server = episodes[sIdx] || {};
            var serverEpisodes = [];
            var epList = isArraySafe(server.items)
                ? server.items
                : (isArraySafe(server.server_data) ? server.server_data : []);

            for (var eIdx = 0; eIdx < epList.length; eIdx++) {
                var ep = epList[eIdx] || {};
                var m3u8Url = String(ep.m3u8 || ep.link_m3u8 || "").replace(/^\s+|\s+$/g, "");
                var embedUrl = String(ep.embed || ep.link_embed || "").replace(/^\s+|\s+$/g, "");
                var payload = buildPlayerPayload(m3u8Url, embedUrl, false);

                if (payload.url) {
                    serverEpisodes.push({
                        id: payload.url,
                        url: payload.url,
                        m3u8: payload.m3u8,
                        embed: payload.embed,
                        embedUrl: payload.embedUrl,
                        isEmbed: payload.isEmbed,
                        useWebView: payload.useWebView,
                        playerType: payload.playerType,
                        headers: payload.headers,
                        webviewConfig: payload.webviewConfig,
                        name: ep.name != null ? String(ep.name) : ("Tập " + (eIdx + 1)),
                        slug: ep.slug || ("tap-" + (eIdx + 1))
                    });
                }
            }

            if (serverEpisodes.length > 0) {
                servers.push({
                    name: server.server_name || ("Server " + (sIdx + 1)),
                    episodes: serverEpisodes
                });
            }
        }

        var categories = extractNames(movie.category);
        var countries = extractNames(movie.country);
        var directors = isArraySafe(movie.director) ? movie.director.join(", ") : (movie.director || "");
        var actors = isArraySafe(movie.casts) ? movie.casts.join(", ") : (movie.casts || (isArraySafe(movie.actor) ? movie.actor.join(", ") : (movie.actor || "")));

        var tmdb = normalizeTmdb(movie.tmdb);
        var imdb = normalizeImdb(movie.imdb);
        var slug = movie.slug || "";

        return safeStringify({
            id: slug,
            slug: slug,
            title: movie.name || "",
            originName: movie.original_name || movie.origin_name || "",
            posterUrl: getPosterUrl(movie.poster_url || movie.thumb_url || ""),
            backdropUrl: getPosterUrl(movie.thumb_url || movie.poster_url || ""),
            description: String(movie.description || movie.content || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year, 10) || 0,
            quality: movie.quality || "",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.current_episode || movie.episode_current || "",
            lang: movie.language || movie.lang || "",
            category: categories,
            country: countries,
            director: directors,
            casts: actors,
            status: movie.status || "",
            tmdb: tmdb,
            imdb: imdb,
            tmdbId: tmdb.id !== null ? String(tmdb.id) : "",
            tmdbSeason: tmdb.season !== null ? tmdb.season : 0,
            tmdbType: tmdb.type || "",
            imdbId: imdb.id || ""
        }, "null");
    } catch (error) {
        return "null";
    }
}

function parseDetailResponse(input) {
    try {
        var raw = typeof input === "string" ? input.replace(/^\s+|\s+$/g, "") : "";
        var m3u8Url = "";
        var embedUrl = "";
        var preferWebView = false;

        if (raw.indexOf("{") === 0) {
            var parsed = JSON.parse(raw);
            m3u8Url = String(parsed.m3u8 || parsed.link_m3u8 || "").replace(/^\s+|\s+$/g, "");
            embedUrl = String(parsed.embed || parsed.link_embed || parsed.embedUrl || "").replace(/^\s+|\s+$/g, "");
            var anyUrl = String(parsed.url || "").replace(/^\s+|\s+$/g, "");

            if (!m3u8Url && !embedUrl && anyUrl) {
                if (anyUrl.indexOf(".m3u8") !== -1) {
                    m3u8Url = anyUrl;
                } else {
                    embedUrl = anyUrl;
                }
            }

            preferWebView = Boolean(
                parsed.useWebView ||
                parsed.isEmbed ||
                parsed.playerType === "webview" ||
                (embedUrl && !m3u8Url)
            );
        } else if (raw.indexOf("http") === 0) {
            if (raw.indexOf(".m3u8") !== -1) {
                m3u8Url = raw;
            } else {
                embedUrl = raw;
                preferWebView = true;
            }
        }

        var payload = buildPlayerPayload(m3u8Url, embedUrl, preferWebView);
        return safeStringify({
            url: payload.url,
            m3u8: payload.m3u8,
            embed: payload.embed,
            embedUrl: payload.embedUrl,
            isEmbed: payload.isEmbed,
            useWebView: payload.useWebView,
            playerType: payload.playerType,
            headers: payload.headers,
            webviewConfig: payload.webviewConfig,
            subtitles: []
        }, "{}");
    } catch (e) {
        var fallback = buildPlayerPayload("", "", true);
        return safeStringify({
            url: "",
            m3u8: "",
            embed: "",
            embedUrl: "",
            isEmbed: true,
            useWebView: true,
            playerType: "webview",
            headers: fallback.headers,
            webviewConfig: fallback.webviewConfig,
            subtitles: []
        }, "{}");
    }
}

function parseCategoriesResponse(apiResponseJson) { return "[]"; }
function parseCountriesResponse(apiResponseJson) { return "[]"; }
function parseYearsResponse(apiResponseJson) { return "[]"; }

// =============================================================================
// HELPERS
// =============================================================================

function extractNames(field) {
    if (!field) return "";
    if (isArraySafe(field)) {
        var arr = [];
        for (var i = 0; i < field.length; i++) {
            var item = field[i];
            var name = typeof item === "string" ? item : (item && item.name ? item.name : "");
            if (name) arr.push(name);
        }
        return arr.join(", ");
    }
    if (typeof field === "object") {
        var parts = [];
        for (var k in field) {
            if (Object.prototype.hasOwnProperty.call(field, k)) {
                var val = field[k];
                if (typeof val === "string" && val) {
                    parts.push(val);
                } else if (val && isArraySafe(val.list)) {
                    for (var j = 0; j < val.list.length; j++) {
                        var sub = val.list[j];
                        var subName = typeof sub === "string" ? sub : (sub && sub.name ? sub.name : "");
                        if (subName) parts.push(subName);
                    }
                } else if (val && val.name) {
                    parts.push(val.name);
                }
            }
        }
        return parts.join(", ");
    }
    return String(field);
}

function getPosterUrl(path) {
    if (!path) return "";
    var clean = String(path).replace(/^\s+|\s+$/g, "");
    if (!clean) return "";
    if (clean.indexOf("http") === 0) return clean;
    if (clean.indexOf("/") === 0) return NGUONC_SITE_URL + clean;
    return NGUONC_SITE_URL + "/" + clean;
}
