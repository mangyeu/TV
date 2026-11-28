// =============================================================================
// NHÓM 1: CẤU HÌNH
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi_jav",
        "name": "AVDBAPI - JAV",
        "version": "1.0.2",
        "baseUrl": "https://avdbapi.com",
        "iconUrl": "https://avdbapi.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        // Trang play trả về link .m3u8 → dùng exoplayer (HLS native) thay vì WebView
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'latest', title: 'Mới cập nhật', type: 'Horizontal', path: '' },
        { slug: 'censored', title: 'Censored', type: 'Horizontal', path: '' },
        { slug: 'uncensored', title: 'Uncensored', type: 'Horizontal', path: '' },
        { slug: 'leaked', title: 'Uncensored Leaked', type: 'Horizontal', path: '' },
        { slug: 'amateur', title: 'Amateur', type: 'Horizontal', path: '' },
        { slug: 'chinese', title: 'Chinese AV', type: 'Horizontal', path: '' },
        { slug: 'hentai', title: 'Hentai', type: 'Horizontal', path: '' },
        { slug: 'english-subtitle', title: 'English Subtitle', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Censored', slug: 'censored' },
        { name: 'Uncensored', slug: 'uncensored' },
        { name: 'Uncensored Leaked', slug: 'leaked' },
        { name: 'Amateur', slug: 'amateur' },
        { name: 'Chinese AV', slug: 'chinese' },
        { name: 'Hentai', slug: 'hentai' },
        { name: 'English Subtitle', slug: 'english-subtitle' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', slug: 'desc' },
            { name: 'Cũ nhất', slug: 'asc' }
        ],
        category: []
    });
}

// =============================================================================
// NHÓM 2: SINH URL
// =============================================================================

var AVDB_LANG = "vi";
var AVDB_BASE = "https://avdbapi.com/" + (AVDB_LANG === "en" ? "" : AVDB_LANG + "/") + "api.php/provide1/vod";
var AVDB_PAGE_SIZE = 30;

function apiUrl(params) {
    var query = [];
    for (var key in params) {
        if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null && params[key] !== "") {
            query.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])));
        }
    }
    return AVDB_BASE + "?" + query.join("&");
}

function getUrlList(slug, filtersJson) {
    var filters = {};
    try { filters = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var params = { ac: "detail", pg: filters.page || 1, pagesize: AVDB_PAGE_SIZE };
    var typeMap = {
        censored: 1, uncensored: 2, leaked: 3, amateur: 4,
        chinese: 5, hentai: 6, "english-subtitle": 7
    };
    if (typeMap[slug]) params.t = typeMap[slug];
    if (filters.year) params.year = filters.year;
    if (filters.sort) params.sort_direction = filters.sort;
    if (filters.actor) params.actor = filters.actor;
    if (filters.category) params.category = filters.category;
    return apiUrl(params);
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try { filters = JSON.parse(filtersJson || "{}"); } catch (e) {}
    return apiUrl({ ac: "detail", wd: keyword, pg: filters.page || 1, pagesize: AVDB_PAGE_SIZE });
}

function getUrlDetail(id) {
    // episode.id là URL trang play (upload18.to/play/index/...) → fetch trực tiếp
    if (/^https?:\/\//i.test(String(id || ""))) return String(id).trim();
    return apiUrl({ ac: "detail", ids: id });
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

function parseJson(input) {
    if (input && typeof input === "object") return input;
    try { return JSON.parse(input || "{}"); } catch (e) { return {}; }
}

function asText(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
}

function mapVideo(item) {
    return {
        id: String(item.id || item.vod_id || item.slug || ""),
        title: asText(item.name || item.vod_name || item.origin_name || item.movie_code),
        posterUrl: item.poster_url || item.vod_pic || item.thumb_url || "",
        description: asText(item.description || item.vod_content),
        year: item.year || item.vod_year || "",
        quality: item.quality || item.vod_quality || "",
        category: asText(item.category || item.vod_class || item.type_name),
        casts: asText(item.actor || item.vod_actor),
        director: asText(item.director || item.vod_director),
        duration: item.time || item.vod_duration || "",
        status: item.status || item.vod_status || "",
        movieCode: item.movie_code || "",
        backdropUrl: item.thumb_url || item.poster_url || item.vod_pic || ""
    };
}

function parseListResponse(response) {
    try {
        var data = parseJson(response);
        var source = Array.isArray(data.list) ? data.list : [];
        var items = source.map(mapVideo);
        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: Number(data.page || 1),
                totalPages: Number(data.pagecount || 1),
                totalItems: Number(data.total || items.length)
            }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(response) { return parseListResponse(response); }

function parseMovieDetail(response) {
    try {
        var data = parseJson(response);
        var item = (data.list && data.list.length) ? data.list[0] : data;
        var video = mapVideo(item);
        var servers = [];

        // AVDBAPI Standard: episodes.server_data = { "Full": { slug, link_embed } }
        var epObject = item.episodes || {};
        if (epObject && epObject.server_data) {
            var serverName = epObject.server_name || "AVDBAPI";
            var serverData = epObject.server_data;
            var episodes = [];
            for (var key in serverData) {
                if (!serverData.hasOwnProperty(key)) continue;
                var ep = serverData[key] || {};
                var playUrl = ep.link_embed || ep.link || ep.url || "";
                if (!playUrl) continue;
                episodes.push({
                    id: playUrl,                       // URL trang play → App fetch tiếp
                    name: key || ep.name || "Full",
                    slug: ep.slug || String(key).toLowerCase()
                });
            }
            if (episodes.length) servers.push({ name: serverName, episodes: episodes });
        }

        return JSON.stringify({
            id: video.id,
            title: video.title,
            posterUrl: video.posterUrl,
            backdropUrl: video.backdropUrl,
            description: video.description,
            servers: servers,
            quality: video.quality,
            year: video.year,
            rating: 0,
            status: video.status,
            duration: video.duration,
            casts: video.casts,
            director: video.director,
            category: video.category
        });
    } catch (e) {
        return JSON.stringify({ id: "", title: "", posterUrl: "", description: "", servers: [] });
    }
}

/**
 * Giải mã chuỗi URL trong JSON của upload18.to:
 *   - `\/`  → `/`
 *   - `\u0026` → `&`
 *   - `\u0025` → `%` (nếu có)
 *   - `&amp;` → `&`
 */
function cleanUrl(raw) {
    return String(raw || "")
        .replace(/\\\//g, "/")
        .replace(/\\u0026/g, "&")
        .replace(/\\u003d/g, "=")
        .replace(/\\u0025/g, "%")
        .replace(/&amp;/g, "&")
        .trim();
}

/**
 * Parse trang play upload18.to → lấy link .m3u8 từ window.PLAYER_CONFIG.
 *
 * HTML chứa:
 *   window.PLAYER_CONFIG = {... "m3u8":"https:\/\/helvid.com\/m\/...playlist.m3u8?e=...&h=...&s=...", ...};
 *
 * Trả về: { url: "https://helvid.com/m/.../playlist.m3u8?...", isEmbed: false, mimeType: "application/x-mpegURL", headers: {...} }
 */
function parseDetailResponse(response) {
    try {
        var html = String(response || "").trim();

        // 1) Nếu App truyền thẳng URL thuần → fetch tiếp
        if (/^https?:\/\/[^\s"'<>]+$/i.test(html)) {
            return JSON.stringify({ url: html, isEmbed: true, headers: {} });
        }

        // 2) Nếu response đã là JSON có url → dùng luôn
        if (html.charAt(0) === "{") {
            var j = parseJson(html);
            if (j.url) return JSON.stringify(j);
        }

        // 3) Bắt link trong PLAYER_CONFIG: "m3u8":"https:\/\/...m3u8?..."
        var m = html.match(/"m3u8"\s*:\s*"([^"]+)"/i);
        if (m && m[1]) {
            var stream = cleanUrl(m[1]);
            if (/^https?:\/\//i.test(stream)) {
                return JSON.stringify({
                    url: stream,
                    isEmbed: false,
                    mimeType: "application/x-mpegURL",
                    headers: {
                        "Referer": "https://upload18.to/",
                        "Origin": "https://upload18.to",
                        "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36"
                    },
                    subtitles: []
                });
            }
        }

        // 4) Fallback: bắt "file":"...m3u8|mp4" hoặc bất kỳ link m3u8/mp4 trong HTML
        m = html.match(/"(?:file|src|source|hls)"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/i)
         || html.match(/(https?:\\?\/\\?\/[^"'\\\s<>]+\.(?:m3u8|mp4)(?:\?[^"'\\\s<>]*)?)/i);
        if (m && m[1]) {
            var u = cleanUrl(m[1]);
            if (/^https?:\/\//i.test(u)) {
                var direct = /\.(m3u8|mp4)(\?|$)/i.test(u);
                return JSON.stringify({
                    url: u,
                    isEmbed: !direct,
                    mimeType: direct ? (/\.m3u8/i.test(u) ? "application/x-mpegURL" : "video/mp4") : "",
                    headers: { "Referer": "https://upload18.to/" },
                    subtitles: []
                });
            }
        }

        // 5) Fallback cuối: iframe (một số video dùng embed khác)
        m = html.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);
        if (m && m[1]) {
            return JSON.stringify({ url: m[1], isEmbed: true, headers: {} });
        }
    } catch (e) {}
    return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
}

/**
 * Xử lý embed nhiều bước (tối đa 3 lần).
 * Với upload18.to thường không cần vì đã lấy được .m3u8 ở bước 1,
 * nhưng giữ để phòng iframe lồng nhau.
 */
function parseEmbedResponse(response, sourceUrl) {
    var html = String(response || "").trim();

    // URL thuần → fetch tiếp
    if (/^https?:\/\/[^\s"'<>]+$/i.test(html)) {
        return JSON.stringify({ url: html, isEmbed: true, headers: {} });
    }

    // Bắt m3u8 trong embed page
    var m = html.match(/"m3u8"\s*:\s*"([^"]+)"/i)
         || html.match(/"(?:file|src|source|hls)"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/i)
         || html.match(/(https?:\\?\/\\?\/[^"'\\\s<>]+\.(?:m3u8|mp4)(?:\?[^"'\\\s<>]*)?)/i);
    if (m && m[1]) {
        var u = cleanUrl(m[1]);
        if (/^https?:\/\//i.test(u)) {
            return JSON.stringify({
                url: u,
                isEmbed: false,
                mimeType: /\.m3u8/i.test(u) ? "application/x-mpegURL" : "video/mp4",
                headers: {
                    "Referer": sourceUrl || "https://upload18.to/",
                    "Origin": "https://upload18.to"
                }
            });
        }
    }

    // Iframe
    m = html.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);
    if (m && m[1]) {
        var abs = /^https?:\/\//i.test(m[1]) ? m[1]
                : (m[1].charAt(0) === "/" ? "https://upload18.to" + m[1] : m[1]);
        return JSON.stringify({ url: abs, isEmbed: true, headers: {} });
    }

    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(response) { return "[]"; }
function parseCountriesResponse(response) { return "[]"; }
function parseYearsResponse(response) { return "[]"; }
