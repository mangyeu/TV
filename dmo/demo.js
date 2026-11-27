// =============================================================================
// AVDBAPI -> VAAPP plugin
// API response format: MacCMS / provide1/vod (vod_* fields)
// Language: Vietnamese by default. Change AVDB_LANG if needed.
// =============================================================================

var AVDB_LANG = "vi"; // vi, en, th, id, ko, zh, ja, fr, de, es, pt, ru, ar, tr, hi, ms, tl
var AVDB_PAGE_SIZE = 30;
var AVDB_HOST = "https://avdbapi.com";

function apiBase() {
    var prefix = AVDB_LANG && AVDB_LANG !== "en" ? "/" + AVDB_LANG : "";
    return AVDB_HOST + prefix + "/api.php/provide1/vod";
}

function apiUrl(params) {
    var parts = [];
    for (var key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key) &&
            params[key] !== undefined && params[key] !== null && params[key] !== "") {
            parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])));
        }
    }
    return apiBase() + (parts.length ? "?" + parts.join("&") : "");
}

function parseJson(input) {
    if (input && typeof input === "object") return input;
    try { return JSON.parse(String(input || "{}")); } catch (e) { return {}; }
}

function str(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
}

function firstValue(obj, keys) {
    for (var i = 0; i < keys.length; i++) {
        var v = obj ? obj[keys[i]] : "";
        if (v !== undefined && v !== null && v !== "") return v;
    }
    return "";
}

function cleanText(value) {
    return str(value).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'")
        .replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

function isHttpUrl(value) {
    return /^https?:\/\/[^\s"'<>]+/i.test(str(value).trim());
}

function isDirectMedia(url) {
    return /\.(m3u8|mp4|mpd|mp3)(?:[?#]|$)/i.test(str(url));
}

function getManifest() {
    return JSON.stringify({
        id: "avdbapi_vaapp",
        name: "AVDBAPI",
        version: "1.2.0",
        baseUrl: AVDB_HOST,
        iconUrl: AVDB_HOST + "/favicon.ico",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        layoutType: "VERTICAL",
        // Player page (Upload18 / other provider pages) should open in WebView.
        // Direct .m3u8/.mp4 URLs are still returned as direct media by parsers.
        playerType: "embed"
    });
}

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

function getUrlList(slug, filtersJson) {
    var f = parseJson(filtersJson);
    var typeMap = {
        censored: 1, uncensored: 2, leaked: 3, amateur: 4,
        chinese: 5, hentai: 6, "english-subtitle": 7
    };
    var p = { ac: "detail", pg: f.page || 1, pagesize: f.pagesize || AVDB_PAGE_SIZE };
    if (typeMap[slug]) p.t = typeMap[slug];
    if (f.year) p.year = f.year;
    if (f.wd) p.wd = f.wd;
    if (f.actor) p.actor = f.actor;
    if (f.area) p.area = f.area;
    if (f.sort) p.sort = f.sort;
    return apiUrl(p);
}

function getUrlSearch(keyword, filtersJson) {
    var f = parseJson(filtersJson);
    return apiUrl({
        ac: "detail",
        wd: keyword,
        pg: f.page || 1,
        pagesize: f.pagesize || AVDB_PAGE_SIZE
    });
}

function getUrlDetail(id) {
    var value = str(id).trim();
    // Episode id may already be a provider/player URL. Do not send it as ids=...
    if (isHttpUrl(value)) return value;
    return apiUrl({ ac: "detail", ids: value });
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function getList(data) {
    if (Array.isArray(data.list)) return data.list;
    if (data.data && Array.isArray(data.data.list)) return data.data.list;
    if (Array.isArray(data)) return data;
    return [];
}

function mapVideo(item) {
    var id = firstValue(item, ["vod_id", "id"]);
    var title = firstValue(item, ["vod_name", "name", "vod_en", "vod_sub"]);
    var poster = firstValue(item, ["vod_pic", "vod_pic_thumb", "poster_url", "thumb_url"]);
    return {
        id: str(id || firstValue(item, ["vod_en", "vod_sub", "vod_name"])),
        title: cleanText(title),
        posterUrl: str(poster),
        backdropUrl: str(firstValue(item, ["vod_pic_thumb", "vod_pic", "thumb_url"])),
        description: cleanText(firstValue(item, ["vod_content", "description"])),
        year: str(firstValue(item, ["vod_year", "year"])),
        quality: str(firstValue(item, ["vod_remarks", "vod_version", "quality"])),
        category: cleanText(firstValue(item, ["vod_class", "vod_type", "type_name"])),
        casts: cleanText(firstValue(item, ["vod_actor", "actor"])),
        director: cleanText(firstValue(item, ["vod_director", "director"])),
        duration: str(firstValue(item, ["vod_duration", "vod_time", "time"])),
        status: str(firstValue(item, ["vod_remarks", "vod_serial", "status"])),
        movieCode: str(firstValue(item, ["vod_sub", "vod_en", "movie_code"])),
        area: str(firstValue(item, ["vod_area", "area"]))
    };
}

function parseListResponse(response) {
    try {
        var data = parseJson(response);
        var source = getList(data);
        var items = [];
        for (var i = 0; i < source.length; i++) items.push(mapVideo(source[i]));
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

// Maccms format:
// vod_play_from: "Server A$$$Server B"
// vod_play_url:  "Full$url1#Part 2$url2$$$Full$url3"
function parsePlaySources(item) {
    var from = str(item.vod_play_from || item.play_from || "");
    var raw = str(item.vod_play_url || item.play_url || "");
    var serverNames = from.split("$$$");
    var serverBlocks = raw.split("$$$");
    var servers = [];

    for (var s = 0; s < serverBlocks.length; s++) {
        var block = serverBlocks[s] || "";
        var rows = block.split("#");
        var episodes = [];
        for (var e = 0; e < rows.length; e++) {
            var row = rows[e].trim();
            if (!row) continue;
            var dollar = row.indexOf("$");
            var name = dollar >= 0 ? row.substring(0, dollar).trim() : ("Tập " + (e + 1));
            var url = dollar >= 0 ? row.substring(dollar + 1).trim() : row;
            if (!url) continue;
            // Keep the provider URL exactly as supplied; VAAPP resolves it in the player.
            episodes.push({
                id: url,
                name: name || ("Tập " + (e + 1)),
                slug: name || ("episode-" + (e + 1))
            });
        }
        if (episodes.length) {
            servers.push({
                name: (serverNames[s] || ("Server " + (s + 1))).trim(),
                episodes: episodes
            });
        }
    }
    return servers;
}

function parseMovieDetail(response) {
    try {
        var data = parseJson(response);
        var list = getList(data);
        var item = list.length ? list[0] : (data.data || data);
        var video = mapVideo(item);
        var servers = parsePlaySources(item);
        return JSON.stringify({
            id: video.id,
            title: video.title,
            posterUrl: video.posterUrl,
            backdropUrl: video.backdropUrl,
            description: video.description,
            servers: servers,
            quality: video.quality,
            year: video.year,
            rating: Number(item.vod_score || item.rating || 0),
            status: video.status,
            duration: video.duration,
            casts: video.casts,
            director: video.director,
            category: video.category
        });
    } catch (e) {
        return JSON.stringify({
            id: "", title: "", posterUrl: "", backdropUrl: "",
            description: "", servers: []
        });
    }
}

// Decode common escaped URL forms without evaluating page scripts.
function decodeUrl(value) {
    return str(value).replace(/\\u0026/gi, "&").replace(/\\\//g, "/")
        .replace(/&amp;/g, "&").replace(/\\x3a/gi, ":")
        .replace(/\\x2f/gi, "/").replace(/\\u003a/gi, ":");
}

function absoluteUrl(url, base) {
    url = decodeUrl(url).trim();
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.indexOf("//") === 0) {
        var scheme = (str(base).match(/^(https?):/i) || [,"https"])[1];
        return scheme + ":" + url;
    }
    var origin = str(base).match(/^(https?:\/\/[^\/]+)/i);
    if (!origin) return url;
    if (url.charAt(0) === "/") return origin[1] + url;
    var path = str(base).replace(/[?#].*$/, "");
    path = path.substring(0, path.lastIndexOf("/") + 1);
    return path + url;
}

function extractFirst(html, patterns, base) {
    for (var i = 0; i < patterns.length; i++) {
        var m = patterns[i].exec(html);
        if (m && m[1]) return absoluteUrl(m[1].replace(/&quot;/g, '"'), base);
    }
    return "";
}

function parsePlayerPage(html, sourceUrl) {
    var body = str(html);
    if (!body) return { url: "", isEmbed: false };

    // First prefer a real media URL explicitly present in page/player config.
    var media = extractFirst(body, [
        /["'](?:file|src|hls|url|source|video_url|play_url)["']\s*:\s*["'](https?:[^"'\\\s]+|\/\/[^"'\\\s]+|\/[^"'\\\s]+)["']/i,
        /(?:file|hls|video_url|play_url)\s*[:=]\s*["'](https?:[^"'\s]+|\/\/[^"'\s]+|\/[^"'\s]+)["']/i,
        /<source[^>]+src=["']([^"']+)["']/i,
        /<video[^>]+src=["']([^"']+)["']/i,
        /(https?:[^"'\\\s<>]+\.(?:m3u8|mp4|mpd)(?:\?[^"'\\\s<>]*)?)/i
    ], sourceUrl);
    if (media) {
        return {
            url: media,
            isEmbed: false,
            mimeType: /\.m3u8(?:[?#]|$)/i.test(media) ? "application/x-mpegURL" :
                (/\.mpd(?:[?#]|$)/i.test(media) ? "application/dash+xml" :
                (/\.mp4(?:[?#]|$)/i.test(media) ? "video/mp4" : "")),
            headers: sourceUrl ? { Referer: sourceUrl } : {}
        };
    }

    // Otherwise use the page's iframe/player page. This is a WebView/embed result,
    // not an attempt to bypass DRM, tokens, login walls or provider protections.
    var frame = extractFirst(body, [
        /<iframe[^>]+src=["']([^"']+)["']/i,
        /["'](?:iframe|embed|player_url)["']\s*:\s*["']([^"']+)["']/i
    ], sourceUrl);
    if (frame) return { url: frame, isEmbed: false, headers: sourceUrl ? { Referer: sourceUrl } : {} };

    // If the fetched document is itself a player page, let VAAPP's embed player render it.
    if (sourceUrl && isHttpUrl(sourceUrl)) {
        return { url: sourceUrl, isEmbed: false, headers: {} };
    }
    return { url: "", isEmbed: false };
}

function parseDetailResponse(response) {
    try {
        var data = parseJson(response);
        if (data && data.url) return JSON.stringify(data);
    } catch (e) {}
    return JSON.stringify(parsePlayerPage(response, ""));
}

function parseEmbedResponse(response, sourceUrl) {
    return JSON.stringify(parsePlayerPage(response, sourceUrl || ""));
}

function parseCategoriesResponse(response) { return "[]"; }
function parseCountriesResponse(response) { return "[]"; }
function parseYearsResponse(response) { return "[]"; }
