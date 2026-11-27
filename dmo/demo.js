// =============================================================================
// AVDBAPI Plugin cho VAAPP
// API: https://avdbapi.com
// Ngôn ngữ mặc định: Tiếng Việt (vi)
// Dựa trên VAAPP Plugin Template và tài liệu AVDBAPI Multilingual.
// =============================================================================

var AVDB_LANG = "vi"; // vi, en, th, id, ko, zh, ja, fr, de, es, pt, ru, ar, tr, hi, ms, tl
// Dùng provide1 vì trường vod_play_url / vod_play_from thuộc Maccms API.
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

function parseJson(input) {
    if (input && typeof input === "object") return input;
    try { return JSON.parse(input || "{}"); } catch (e) { return {}; }
}

function asText(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
}

function getManifest() {
    return JSON.stringify({
        id: "avdbapi_jav",
        name: "AVDBAPI - JAV",
        version: "1.0.1",
        baseUrl: "https://avdbapi.com",
        iconUrl: "https://avdbapi.com/favicon.ico",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        layoutType: "HORIZONTAL",
        playerType: "embed"
    });
}

// Danh mục API: t=1..7 theo tài liệu AVDBAPI.
function getHomeSections() {
    return JSON.stringify([
        { slug: "latest", title: "Mới cập nhật", type: "Horizontal", path: "" },
        { slug: "censored", title: "Censored", type: "Horizontal", path: "" },
        { slug: "uncensored", title: "Uncensored", type: "Horizontal", path: "" },
        { slug: "leaked", title: "Uncensored Leaked", type: "Horizontal", path: "" },
        { slug: "amateur", title: "Amateur", type: "Horizontal", path: "" },
        { slug: "chinese", title: "Chinese AV", type: "Horizontal", path: "" },
        { slug: "hentai", title: "Hentai", type: "Horizontal", path: "" },
        { slug: "english-subtitle", title: "English Subtitle", type: "Horizontal", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Censored", slug: "censored" },
        { name: "Uncensored", slug: "uncensored" },
        { name: "Uncensored Leaked", slug: "leaked" },
        { name: "Amateur", slug: "amateur" },
        { name: "Chinese AV", slug: "chinese" },
        { name: "Hentai", slug: "hentai" },
        { name: "English Subtitle", slug: "english-subtitle" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới nhất", slug: "desc" },
            { name: "Cũ nhất", slug: "asc" }
        ],
        category: []
    });
}

// Sinh URL danh sách. API cung cấp ac=detail để lấy poster và metadata đầy đủ.
function getUrlList(slug, filtersJson) {
    var filters = parseJson(filtersJson);
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
    var filters = parseJson(filtersJson);
    return apiUrl({
        ac: "detail",
        wd: keyword,
        pg: filters.page || 1,
        pagesize: AVDB_PAGE_SIZE
    });
}

// id của item dùng AVDBAPI numeric id; fallback slug/movie_code nếu App truyền dạng khác.
function getUrlDetail(id) {
    // VAAPP có thể gọi hàm này với episode.id là URL trang phát.
    // URL tập phải được fetch trực tiếp, không được biến thành tham số ids=...
    if (/^https?:\/\//i.test(String(id || ""))) return String(id).trim();
    return apiUrl({ ac: "detail", ids: id });
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// Chuẩn hóa item AVDBAPI sang cấu trúc VAAPP.
function mapVideo(item) {
    return {
        id: String(item.id || item.vod_id || item.slug || item.vod_sub || item.movie_code || item.vod_remarks || ""),
        title: asText(item.name || item.vod_name || item.origin_name || item.vod_en || item.movie_code || item.vod_remarks),
        posterUrl: item.poster_url || item.vod_pic || item.thumb_url || "",
        description: asText(item.description || item.vod_content),
        year: item.year || item.vod_year || "",
        quality: item.quality || item.vod_quality || "",
        category: asText(item.category || item.vod_class || item.type_name),
        casts: asText(item.actor || item.vod_actor),
        director: asText(item.director || item.vod_director),
        duration: item.time || item.vod_duration || "",
        status: item.status || item.vod_status || "",
        movieCode: item.movie_code || item.vod_remarks || item.vod_sub || "",
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

function parseSearchResponse(response) {
    return parseListResponse(response);
}

// Parse link phát theo cả Standard API (episodes.server_data) và
// Maccms API (vod_play_from + vod_play_url).
// Ví dụ: vod_play_url = "Full$https://upload18.to/play/index/fns-053"
// Nhiều server phân cách bằng $$$; nhiều tập trong server phân cách bằng #.
function parseVodPlayUrl(item) {
    var servers = [];
    var playUrlText = item.vod_play_url || "";
    var playFromText = item.vod_play_from || "";
    if (!playUrlText) return servers;

    var sourceNames = String(playFromText).split("$$$");
    var sourceBlocks = String(playUrlText).split("$$$");

    for (var si = 0; si < sourceBlocks.length; si++) {
        var block = sourceBlocks[si] || "";
        var episodeRows = block.split("#");
        var episodes = [];

        for (var ei = 0; ei < episodeRows.length; ei++) {
            var row = episodeRows[ei] || "";
            var dollar = row.indexOf("$");
            if (dollar < 0) continue;

            var epName = row.substring(0, dollar).trim() || ("Tập " + (ei + 1));
            var epUrl = row.substring(dollar + 1).trim();
            if (!epUrl) continue;

            // URL trang play (ví dụ upload18.to/play/...) dùng WebView/embed.
            episodes.push({
                id: epUrl,
                name: epName,
                slug: epName
            });
        }

        if (episodes.length) {
            servers.push({
                name: (sourceNames[si] || ("Server " + (si + 1))).trim(),
                episodes: episodes
            });
        }
    }
    return servers;
}

function parseMovieDetail(response) {
    try {
        var data = parseJson(response);
        var item = (data.list && data.list.length) ? data.list[0] : data;
        var servers = [];

        // Ưu tiên Maccms vod_play_url nếu API trả trường này.
        servers = parseVodPlayUrl(item);

        // Standard API: episodes.server_data.
        if (!servers.length) {
            var epObject = item.episodes || {};
            var serverName = epObject.server_name || "AVDBAPI";
            var serverData = epObject.server_data || {};
            var episodes = [];

            for (var key in serverData) {
                if (!serverData.hasOwnProperty(key)) continue;
                var ep = serverData[key];
                if (!ep) continue;
                var playUrl = ep.link_embed || ep.link || ep.url || "";
                if (playUrl) {
                    episodes.push({
                        id: playUrl,
                        name: key || ep.name || "Full",
                        slug: ep.slug || key || "full"
                    });
                }
            }

            if (episodes.length === 0 && Array.isArray(epObject)) {
                for (var i = 0; i < epObject.length; i++) {
                    var row = epObject[i] || {};
                    var url = row.link_embed || row.link || row.url || "";
                    if (url) episodes.push({
                        id: url,
                        name: row.name || ("Tập " + (i + 1)),
                        slug: row.slug || ""
                    });
                }
            }
            if (episodes.length) servers.push({ name: serverName, episodes: episodes });
        }

        var video = mapVideo(item);
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
            id: "", title: "", posterUrl: "", description: "",
            servers: []
        });
    }
}

// Episode.id đã là link_embed. Hàm này là fallback nếu VAAPP gọi parser resolve.
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

function parseDetailResponse(response) {
    try {
        var data = parseJson(response);
        if (data.url) return JSON.stringify(data);

        // Trường hợp parser nhận trực tiếp URL của tập.
        if (typeof response === "string" &&
            /^https?:\/\/[^\s"'<>]+$/i.test(response.trim())) {
            return JSON.stringify({
                url: response.trim(),
                isEmbed: true,
                headers: {},
                subtitles: []
            });
        }

        // Nếu response là JSON Maccms.
        var item = (data.list && data.list.length) ? data.list[0] : data;
        var maccmsServers = parseVodPlayUrl(item);
        if (maccmsServers.length && maccmsServers[0].episodes.length) {
            return JSON.stringify({
                url: maccmsServers[0].episodes[0].id,
                isEmbed: true,
                headers: {},
                subtitles: []
            });
        }

        // Nếu HTML trang phát chứa iframe hoặc thẻ video.
        var html = String(response || "");
        var match = html.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);
        if (!match) match = html.match(/(?:file|src|hls|url)\s*[:=]\s*["'](https?:\/\/[^"']+)["']/i);
        if (!match) match = html.match(/https?:\\?\/\\?\/[^"'\\\s<>]+\.(?:m3u8|mp4)(?:\?[^"'\\\s<>]*)?/i);
        if (match) {
            var found = match[1] || match[0];
            return JSON.stringify({
                url: getAbsoluteUrl(found, ""),
                isEmbed: !/\.(m3u8|mp4)(\?|$)/i.test(found),
                headers: {},
                subtitles: []
            });
        }
    } catch (e) {}
    return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
}

function parseEmbedResponse(response, sourceUrl) {
    // Phân tích iframe / video URL công khai trong HTML trang phát.
    var result = parseJson(parseDetailResponse(response));
    if (result.url && sourceUrl) result.url = getAbsoluteUrl(result.url, sourceUrl);
    return JSON.stringify(result);
}

function parseCategoriesResponse(response) { return "[]"; }
function parseCountriesResponse(response) { return "[]"; }
function parseYearsResponse(response) { return "[]"; }
