// =============================================================================
// VAAPP Plugin - AVDBAPI 1.3.0
// Based on the supplied plugin_template (1).js
// API docs: https://avdbapi.com/index.php/label/help.html
// =============================================================================

var AVDB_BASE = "https://avdbapi.com/vi/api.php/provide/vod";
var AVDB_SITE = "https://avdbapi.com";
var AVDB_PAGE_SIZE = 100; // AVDB Standard API caps pagesize at 100
var AVDB_PLUGIN_VERSION = "1.3.0";

function _safeJson(value, fallback) {
    try {
        if (typeof value === "string") return JSON.parse(value);
        return value || fallback;
    } catch (e) { return fallback; }
}
function _str(value) {
    if (value === null || value === undefined) return "";
    return String(value);
}
function _arr(value) {
    if (value === null || value === undefined || value === "") return [];
    if (Object.prototype.toString.call(value) === "[object Array]") return value;
    if (typeof value === "string") return value.split(/[,，|]+/).map(function (x) { return x.trim(); }).filter(Boolean);
    return [value];
}
function _first(obj, keys, fallback) {
    var i, value;
    for (i = 0; i < keys.length; i++) {
        value = obj ? obj[keys[i]] : null;
        if (value !== null && value !== undefined && value !== "") return value;
    }
    return fallback;
}
function _query(params) {
    var parts = [], key, value;
    for (key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key) && params[key] !== undefined && params[key] !== null && params[key] !== "") {
            value = params[key];
            parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)));
        }
    }
    return parts.join("&");
}
function _apiUrl(params) { return AVDB_BASE + "?" + _query(params); }
function _page(filters) {
    var page = parseInt(filters.page || filters.pg || 1, 10);
    return (!page || page < 1) ? 1 : page;
}
function _normalVideo(item) {
    item = item || {};
    var id = _first(item, ["id", "vod_id"], "");
    var code = _first(item, ["movie_code", "vod_remarks", "vod_sub", "slug"], "");
    var title = _first(item, ["name", "vod_name", "origin_name", "vod_en"], code || "Không có tiêu đề");
    var poster = _first(item, ["poster_url", "vod_pic", "thumb_url", "vod_pic_thumb"], "");
    var actors = _arr(_first(item, ["actor", "vod_actor"], []));
    return {
        id: _str(id || code || _first(item, ["slug"], title)),
        title: _str(title),
        posterUrl: _str(poster),
        backdropUrl: _str(_first(item, ["thumb_url", "vod_pic_thumb", "poster_url", "vod_pic"], poster)),
        description: _str(_first(item, ["description", "vod_content"], "")),
        year: _str(_first(item, ["year", "vod_year"], "")),
        quality: _str(_first(item, ["quality"], "")),
        status: _str(_first(item, ["status", "type_name"], "")),
        duration: _str(_first(item, ["time", "vod_duration"], "")),
        casts: actors.join(", "),
        actors: actors,
        director: _arr(_first(item, ["director", "vod_director"], [])).join(", "),
        category: _arr(_first(item, ["category", "vod_class"], [])).join(", "),
        movieCode: _str(code),
        raw: item
    };
}
function _extractVideos(data) {
    data = _safeJson(data, {});
    if (Object.prototype.toString.call(data) === "[object Array]") return data;
    if (data && Object.prototype.toString.call(data.list) === "[object Array]") return data.list;
    if (data && data.data && Object.prototype.toString.call(data.data.list) === "[object Array]") return data.data.list;
    return [];
}

// AVDB Standard API episodes.server_data is an object keyed by episode label.
// Keep link_embed separate from episode.id: VAAPP resolves episode.id via getUrlDetail().
function _episodeEntries(video) {
    var result = [], episodes = video ? video.episodes : null;
    var serverData, serverName, key, ep, playUrl, i;
    if (episodes && typeof episodes === "object" && episodes.server_data) {
        serverData = episodes.server_data;
        serverName = _str(episodes.server_name || "AVDB Embed");
        for (key in serverData) {
            if (Object.prototype.hasOwnProperty.call(serverData, key)) {
                ep = serverData[key] || {};
                playUrl = _first(ep, ["link_embed", "link", "url", "file", "link_url"], "");
                if (playUrl) result.push({ server: serverName, name: _str(key || ep.name || "Full"), playUrl: _str(playUrl), slug: _str(ep.slug || key) });
            }
        }
    }
    if (episodes && Object.prototype.toString.call(episodes) === "[object Array]") {
        for (i = 0; i < episodes.length; i++) {
            ep = episodes[i] || {};
            playUrl = _first(ep, ["link_embed", "url", "file", "link"], "");
            if (playUrl) result.push({ server: _str(ep.server_name || "AVDB Embed"), name: _str(ep.name || ep.title || ("Tập " + (i + 1))), playUrl: _str(playUrl), slug: _str(ep.slug || "") });
        }
    }
    return result;
}

function getManifest() {
    return JSON.stringify({
        id: "avdbapi_jav",
        name: "AVDBAPI - JAV",
        version: AVDB_PLUGIN_VERSION,
        baseUrl: AVDB_SITE,
        iconUrl: "https://avdbapi.com/favicon.ico",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        layoutType: "VERTICAL",
        // AVDB recommends link_embed when direct HLS playback fails.
        playerType: "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "latest", title: "Mới cập nhật", type: "Horizontal", path: "" },
        { slug: "censored", title: "Có kiểm duyệt", type: "Horizontal", path: "" },
        { slug: "uncensored", title: "Không kiểm duyệt", type: "Horizontal", path: "" },
        { slug: "uncensored-leaked", title: "Không kiểm duyệt (Leak)", type: "Horizontal", path: "" },
        { slug: "amateur", title: "Amateur", type: "Horizontal", path: "" },
        { slug: "chinese", title: "Chinese AV", type: "Horizontal", path: "" },
        { slug: "hentai", title: "Hentai", type: "Horizontal", path: "" },
        { slug: "english-subtitle", title: "Phụ đề tiếng Anh", type: "Horizontal", path: "" }
    ]);
}
function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Có kiểm duyệt", slug: "1" },
        { name: "Không kiểm duyệt", slug: "2" },
        { name: "Không kiểm duyệt (Leak)", slug: "3" },
        { name: "Amateur", slug: "4" },
        { name: "Chinese AV", slug: "5" },
        { name: "Hentai", slug: "6" },
        { name: "Phụ đề tiếng Anh", slug: "7" }
    ]);
}
function getFilterConfig() {
    return JSON.stringify({
        sort: [{ name: "Mới nhất", value: "desc" }, { name: "Cũ nhất", value: "asc" }],
        category: [], year: true
    });
}

function getUrlList(slug, filtersJson) {
    var filters = _safeJson(filtersJson, {});
    var page = _page(filters);
    var sectionMap = {
        censored: "1", uncensored: "2", "uncensored-leaked": "3",
        amateur: "4", chinese: "5", hentai: "6", "english-subtitle": "7"
    };
    var actor = _str(filters.actor || "").trim();
    var typeId = "";
    slug = _str(slug || "").trim();

    if (slug.indexOf("actor:") === 0) actor = slug.substring(6).trim();
    else if (slug.indexOf("actor/") === 0) actor = decodeURIComponent(slug.substring(6)).trim();

    if (actor) {
        return _apiUrl({ ac: "detail", actor: actor, pg: page, pagesize: AVDB_PAGE_SIZE,
            year: filters.year || "", sort_direction: filters.sort || filters.sort_direction || "desc" });
    }

    if (/^[1-7]$/.test(slug)) typeId = slug;
    else if (sectionMap[slug]) typeId = sectionMap[slug];
    else if (filters.categoryId) typeId = filters.categoryId;

    // latest has no t parameter: return the complete newest feed, page by page.
    return _apiUrl({ ac: "detail", t: typeId, pg: page, pagesize: AVDB_PAGE_SIZE,
        sort_direction: filters.sort || filters.sort_direction || "desc",
        year: filters.year || "", isend: filters.isend || "" });
}
function getUrlSearch(keyword, filtersJson) {
    var filters = _safeJson(filtersJson, {});
    var page = _page(filters);
    keyword = _str(keyword).trim();
    if (keyword.toLowerCase().indexOf("actor:") === 0) {
        return _apiUrl({ ac: "detail", actor: keyword.substring(6).trim(), pg: page, pagesize: AVDB_PAGE_SIZE });
    }
    return _apiUrl({ ac: "detail", wd: keyword, pg: page, pagesize: AVDB_PAGE_SIZE });
}
// Host integration hook. The supplied VAAPP template does not define a cast-click callback.
function getUrlActor(actorName, filtersJson) {
    var filters = _safeJson(filtersJson, {});
    return _apiUrl({ ac: "detail", actor: _str(actorName).trim(), pg: _page(filters), pagesize: AVDB_PAGE_SIZE,
        year: filters.year || "", sort_direction: filters.sort || filters.sort_direction || "desc" });
}
function getUrlDetail(slug) {
    var value = _str(slug).trim();
    if (/^https?:\/\//i.test(value)) return value;
    if (/^\d+$/.test(value)) return _apiUrl({ ac: "detail", ids: value, pagesize: 1 });
    return _apiUrl({ ac: "detail", wd: value, pagesize: 1 });
}
function getUrlCategories() { return _apiUrl({ ac: "list", pg: 1, pagesize: 100 }); }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function parseListResponse(response) {
    try {
        var data = _safeJson(response, {});
        var rawItems = _extractVideos(data);
        var items = rawItems.map(function (item) {
            var v = _normalVideo(item);
            return { id: v.id, title: v.title, posterUrl: v.posterUrl, backdropUrl: v.backdropUrl,
                description: v.description, year: v.year, quality: v.quality, status: v.status,
                movieCode: v.movieCode, casts: v.casts, actors: v.actors };
        });
        var page = parseInt(data.page || (data.data && data.data.page) || 1, 10);
        var pageCount = parseInt(data.pagecount || (data.data && data.data.pagecount) || 1, 10);
        var total = parseInt(data.total || (data.data && data.data.total) || items.length, 10);
        if (!page || page < 1) page = 1;
        if (!pageCount || pageCount < 1) pageCount = 1;
        return JSON.stringify({ items: items, pagination: { currentPage: page, totalPages: pageCount, totalItems: total } });
    } catch (e) { return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } }); }
}
function parseSearchResponse(response) { return parseListResponse(response); }

function parseMovieDetail(response) {
    try {
        var data = _safeJson(response, {});
        var list = _extractVideos(data);
        var item = list.length ? list[0] : (data && (data.id || data.episodes) ? data : null);
        if (!item) return JSON.stringify({ id: "", title: "Không tìm thấy dữ liệu", posterUrl: "", description: "", servers: [] });
        var v = _normalVideo(item);
        var entries = _episodeEntries(item);
        var servers = [], byServer = {}, i, e;
        for (i = 0; i < entries.length; i++) {
            e = entries[i];
            if (!byServer[e.server]) {
                byServer[e.server] = { name: e.server, episodes: [] };
                servers.push(byServer[e.server]);
            }
            // IMPORTANT: use AVDB video ID, not link_embed, so getUrlDetail fetches API JSON.
            // parseDetailResponse then extracts link_embed as the final embed-player URL.
            byServer[e.server].episodes.push({ id: v.id, name: e.name, slug: e.slug });
        }
        return JSON.stringify({ id: v.id, title: v.title, posterUrl: v.posterUrl, backdropUrl: v.backdropUrl,
            description: v.description, servers: servers, quality: v.quality,
            year: parseInt(v.year, 10) || v.year, rating: 0, status: v.status,
            duration: v.duration, casts: v.casts, actors: v.actors,
            director: v.director, category: v.category, movieCode: v.movieCode });
    } catch (e) { return JSON.stringify({ id: "", title: "Lỗi đọc dữ liệu", posterUrl: "", description: "", servers: [] }); }
}

function _decodeHtml(value) {
    return _str(value).replace(/&amp;/g, "&").replace(/&#38;/g, "&").replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'").replace(/&#x2F;/g, "/").replace(/\\\//g, "/").replace(/\\u0026/g, "&");
}
function _absoluteUrl(url, base) {
    url = _decodeHtml(url).trim();
    if (!url) return "";
    if (/^(https?:)?\/\//i.test(url)) return url.indexOf("//") === 0 ? "https:" + url : url;
    if (url.charAt(0) === "/") {
        var m = _str(base).match(/^(https?:\/\/[^/]+)/i);
        return (m ? m[1] : AVDB_SITE) + url;
    }
    var origin = _str(base).match(/^(https?:\/\/[^/]+)/i);
    return (origin ? origin[1] + "/" : AVDB_SITE + "/") + url;
}
function _extractEmbedLinks(item) {
    var entries = _episodeEntries(item), links = [], i;
    for (i = 0; i < entries.length; i++) if (entries[i].playUrl) links.push(entries[i].playUrl);
    return links;
}
function _findStream(text) {
    var source = _str(text), patterns = [
        /(?:file|src|url|source|hls)\s*[:=]\s*["']([^"']+\.m3u8(?:\?[^"']*)?)["']/i,
        /["'](https?:\\?\/\\?\/[^"'\s]+\.m3u8(?:\?[^"']*)?)["']/i,
        /(https?:\/\/[^\s"'<>]+\.m3u8(?:\?[^\s"'<>]*)?)/i,
        /(?:file|src|url|source)\s*[:=]\s*["']([^"']+\.mp4(?:\?[^"']*)?)["']/i,
        /(https?:\/\/[^\s"'<>]+\.mp4(?:\?[^\s"'<>]*)?)/i
    ];
    var i, match;
    for (i = 0; i < patterns.length; i++) {
        match = source.match(patterns[i]);
        if (match && match[1]) return _decodeHtml(match[1]).replace(/\\\//g, "/");
    }
    return "";
}
function _findIframe(text) {
    var match = _str(text).match(/<iframe[^>]+(?:src|data-src)\s*=\s*["']([^"']+)["']/i);
    if (!match) match = _str(text).match(/["'](?:url|embed|iframe)["']\s*:\s*["']([^"']+)["']/i);
    return match && match[1] ? _decodeHtml(match[1]) : "";
}
function _parseApiVideo(response) {
    var data = _safeJson(response, {}), list = _extractVideos(data);
    if (list.length) return list[0];
    if (data && (data.episodes || data.id)) return data;
    return null;
}
function parseDetailResponse(response) {
    var text = _str(response), item = _parseApiVideo(text), embeds, stream, iframe, plain;
    // API detail JSON: extract AVDB's official link_embed and return it as a final WebView URL.
    if (item) {
        embeds = _extractEmbedLinks(item);
        if (embeds.length) return JSON.stringify({ url: _absoluteUrl(embeds[0], AVDB_SITE), isEmbed: false,
            headers: { "Referer": AVDB_SITE + "/", "User-Agent": "Mozilla/5.0" }, subtitles: [] });
    }
    stream = _findStream(text);
    if (stream) return JSON.stringify({ url: _absoluteUrl(stream, AVDB_SITE), isEmbed: false,
        mimeType: /\.m3u8(?:\?|$)/i.test(stream) ? "application/x-mpegURL" : "video/mp4",
        headers: { "Referer": AVDB_SITE + "/" }, subtitles: [] });
    iframe = _findIframe(text);
    if (iframe) return JSON.stringify({ url: _absoluteUrl(iframe, AVDB_SITE), isEmbed: true,
        headers: { "Referer": AVDB_SITE + "/" }, subtitles: [] });
    plain = text.trim().replace(/^"|"$/g, "");
    if (/^https?:\/\//i.test(plain)) return JSON.stringify({ url: plain, isEmbed: false,
        headers: { "Referer": AVDB_SITE + "/" }, subtitles: [] });
    return JSON.stringify({ url: "", isEmbed: false, subtitles: [], error: "API không trả về episodes.server_data.link_embed" });
}
function parseEmbedResponse(response, sourceUrl) {
    var text = _str(response), stream = _findStream(text), iframe;
    if (stream) return JSON.stringify({ url: _absoluteUrl(stream, sourceUrl), isEmbed: false,
        mimeType: /\.m3u8(?:\?|$)/i.test(stream) ? "application/x-mpegURL" : "video/mp4",
        headers: { "Referer": sourceUrl || AVDB_SITE + "/" }, subtitles: [] });
    iframe = _findIframe(text);
    if (iframe) return JSON.stringify({ url: _absoluteUrl(iframe, sourceUrl), isEmbed: true,
        headers: { "Referer": sourceUrl || AVDB_SITE + "/" }, subtitles: [] });
    // If AVDB's embed page is itself the player page, stop recursion and let WebView open it.
    if (/^https?:\/\//i.test(_str(sourceUrl))) return JSON.stringify({ url: sourceUrl, isEmbed: false,
        headers: { "Referer": AVDB_SITE + "/" }, subtitles: [] });
    return JSON.stringify({ url: "", isEmbed: false, subtitles: [] });
}
function parseCategoriesResponse(response) {
    try {
        var data = _safeJson(response, {}), classes = data.class || (data.data && data.data.class) || [];
        if (Object.prototype.toString.call(classes) !== "[object Array]") return "[]";
        return JSON.stringify(classes.map(function (item) {
            return { name: _str(item.type_name || item.name || item), slug: _str(item.type_id || item.id || "") };
        }));
    } catch (e) { return "[]"; }
}
function parseCountriesResponse() { return "[]"; }
function parseYearsResponse() { return "[]"; }
