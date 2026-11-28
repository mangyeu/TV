// =============================================================================
// AVDBAPI Plugin cho VAAPP (viết lại theo plugin_template)
// API: https://avdbapi.com
// Ngôn ngữ mặc định: Tiếng Việt (vi)
// =============================================================================

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi_jav",
        "name": "AVDBAPI - JAV",
        "version": "1.0.1",
        "baseUrl": "https://avdbapi.com",
        "iconUrl": "https://avdbapi.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embed"
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
// NHÓM 2: SINH URL (App gọi hàm → nhận URL → tự fetch HTTP)
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
    return apiUrl({
        ac: "detail",
        wd: keyword,
        pg: filters.page || 1,
        pagesize: AVDB_PAGE_SIZE
    });
}

function getUrlDetail(id) {
    // Nếu episode.id là URL trang phát (http/https) → fetch trực tiếp
    if (/^https?:\/\//i.test(String(id || ""))) return String(id).trim();
    return apiUrl({ ac: "detail", ids: id });
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER (App fetch URL xong → ném HTML/JSON thô vào đây → bạn parse)
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

/**
 * Parse danh sách phim từ JSON AVDBAPI.
 * App mong đợi: { items: [{id, title, posterUrl, ...}], pagination: {...} }
 */
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

function parseSearchResponse(response) {
    return parseListResponse(response);
}

/**
 * Parse chi tiết phim: title, description, servers + episodes.
 * Cấu trúc AVDBAPI:
 *   episodes.server_name = "VIP #1"
 *   episodes.server_data = { "Full": { slug, link_embed } }
 *
 * episode.id = link_embed (URL trang play) → App sẽ gọi getUrlDetail(id) để fetch
 *              trang play đó, rồi gọi parseDetailResponse(html) để lấy link stream.
 */
function parseMovieDetail(response) {
    try {
        var data = parseJson(response);
        var item = (data.list && data.list.length) ? data.list[0] : data;
        var video = mapVideo(item);
        var servers = [];

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
                    id: playUrl,
                    name: key || ep.name || "Full",
                    slug: ep.slug || key.toLowerCase()
                });
            }

            if (episodes.length) {
                servers.push({ name: serverName, episodes: episodes });
            }
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
        return JSON.stringify({
            id: "", title: "", posterUrl: "", description: "", servers: []
        });
    }
}

function getAbsoluteUrl(url, base) {
    if (!url) return "";
    url = String(url).trim().replace(/&amp;/g, "&");
    if (/^https?:\/\//i.test(url)) return url;
    if (url.indexOf("//") === 0) return "https:" + url;
    if (!base) return url;
    var origin = base.match(/^(https?:\/\/[^\/]+)/i);
    if (!origin) return url;
    if (url.charAt(0) === "/") return origin[1] + url;
    var dir = base.substring(0, base.lastIndexOf("/") + 1);
    return dir + url;
}

/**
 * Parse link video cuối cùng để Player phát.
 *
 * Với AVDBAPI: episode.id = link_embed (vd: https://upload18.to/play/index/wpsl-285)
 * → App fetch URL đó → response là HTML trang play của upload18.to
 * → Hàm này trích xuất iframe / stream URL từ HTML đó.
 *
 * Trả về:
 *   - isEmbed: true  → App fetch tiếp URL (iframe)
 *   - isEmbed: false → URL cuối cùng, phát luôn (m3u8/mp4)
 *   - url: ""        → Dừng
 */
function parseDetailResponse(response) {
    try {
        var text = String(response || "").trim();

        // 1) Nếu response đã là JSON có url → dùng luôn
        if (text.charAt(0) === "{") {
            var data = parseJson(text);
            if (data.url) return JSON.stringify(data);
        }

        // 2) Nếu response là URL thuần (trang play) → fetch tiếp
        if (/^https?:\/\/[^\s"'<>]+$/i.test(text)) {
            return JSON.stringify({
                url: text,
                isEmbed: true,
                headers: {},
                subtitles: []
            });
        }

        // 3) Trích iframe src (trang play upload18.to thường chứa iframe)
        var match = text.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);

        // 4) Trích file m3u8/mp4 trong script
        if (!match) {
            match = text.match(/(?:file|src|hls|url|source)\s*[:=]\s*["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
        }

        // 5) Fallback: bất kỳ link m3u8/mp4 nào
        if (!match) {
            match = text.match(/https?:\\?\/\\?\/[^"'\\\s<>]+\.(?:m3u8|mp4)(?:\?[^"'\\\s<>]*)?/i);
        }

        if (match) {
            var found = match[1] || match[0];
            found = found.replace(/\\\//g, "/");
            var absolute = getAbsoluteUrl(found, "");
            var isDirect = /\.(m3u8|mp4)(\?|$)/i.test(absolute);
            return JSON.stringify({
                url: absolute,
                isEmbed: !isDirect,
                headers: { "Referer": "https://upload18.to/" },
                subtitles: []
            });
        }
    } catch (e) {}
    return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
}

/**
 * Xử lý embed nhiều bước (tối đa 3 lần).
 * AVDBAPI: trang play → iframe → stream URL
 */
function parseEmbedResponse(response, sourceUrl) {
    var text = String(response || "").trim();

    // Nếu response là URL thuần → fetch tiếp
    if (/^https?:\/\/[^\s"'<>]+$/i.test(text)) {
        return JSON.stringify({
            url: getAbsoluteUrl(text, sourceUrl),
            isEmbed: true,
            headers: {}
        });
    }

    // Trích iframe
    var match = text.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);
    if (match) {
        return JSON.stringify({
            url: getAbsoluteUrl(match[1], sourceUrl),
            isEmbed: true,
            headers: {}
        });
    }

    // Trích stream URL
    match = text.match(/(?:file|src|hls|url|source)\s*[:=]\s*["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
    if (!match) {
        match = text.match(/https?:\\?\/\\?\/[^"'\\\s<>]+\.(?:m3u8|mp4)(?:\?[^"'\\\s<>]*)?/i);
    }
    if (match) {
        var found = (match[1] || match[0]).replace(/\\\//g, "/");
        return JSON.stringify({
            url: getAbsoluteUrl(found, sourceUrl),
            isEmbed: false,
            mimeType: "application/x-mpegURL",
            headers: { "Referer": sourceUrl || "https://upload18.to/" }
        });
    }

    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(response) { return "[]"; }
function parseCountriesResponse(response) { return "[]"; }
function parseYearsResponse(response) { return "[]"; }
