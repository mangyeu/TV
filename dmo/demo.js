// =============================================================================
// VAAPP Plugin - AVDB API
// Version: 1.0.0
// Source API: https://avdbapi.com/api.php/provide/vod/
// Compatible with VAAPP plugin_template (JSON/MacCMS Provide API)
// =============================================================================

var AVDB_API_BASE = "https://avdbapi.com/api.php/provide/vod/";
var AVDB_SITE_BASE = "https://avdbapi.com";
var AVDB_REFERER = "https://avdbapi.com/";
var AVDB_PAGE_SIZE = 20;

// -----------------------------------------------------------------------------
// Helpers (ES5 only; no DOM, jQuery, fetch, or external libraries)
// -----------------------------------------------------------------------------

function avdbParseJson(input) {
    if (input && typeof input === "object") return input;
    var raw = String(input == null ? "" : input).replace(/^\uFEFF/, "").trim();
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) {}
    // Some providers wrap JSON in a callback or return JSON inside <pre>.
    var pre = raw.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if (pre) {
        raw = avdbDecodeHtml(pre[1]).trim();
        try { return JSON.parse(raw); } catch (e2) {}
    }
    var start = raw.indexOf("{");
    var end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
        try { return JSON.parse(raw.substring(start, end + 1)); } catch (e3) {}
    }
    return {};
}

function avdbDecodeHtml(value) {
    var s = String(value == null ? "" : value);
    s = s.replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">").replace(/&#(\d+);/g, function (m, n) {
            return String.fromCharCode(parseInt(n, 10));
        }).replace(/&#x([0-9a-f]+);/gi, function (m, n) {
            return String.fromCharCode(parseInt(n, 16));
        });
    return s.replace(/\\\//g, "/").replace(/\\u0026/gi, "&")
        .replace(/\\u003d/gi, "=").replace(/\\u002f/gi, "/")
        .replace(/\\u003a/gi, ":");
}

function avdbText(value) {
    return avdbDecodeHtml(String(value == null ? "" : value))
        .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function avdbEncode(value) {
    return encodeURIComponent(String(value == null ? "" : value));
}

function avdbFilters(json) {
    try { return JSON.parse(json || "{}") || {}; } catch (e) { return {}; }
}

function avdbFirst(obj, names, fallback) {
    var i, v;
    for (i = 0; i < names.length; i++) {
        v = obj ? obj[names[i]] : null;
        if (v !== undefined && v !== null && v !== "") return v;
    }
    return fallback;
}

function avdbAbsoluteUrl(url) {
    var s = avdbDecodeHtml(url).trim();
    if (!s) return "";
    if (/^(https?:)?\/\//i.test(s)) {
        if (s.indexOf("//") === 0) return "https:" + s;
        if (s.indexOf("http://") === 0 || s.indexOf("https://") === 0) return s;
    }
    if (s.charAt(0) === "/") return AVDB_SITE_BASE + s;
    return s;
}

function avdbIsDirectMedia(url) {
    return /\.(m3u8|mp4|m4v|mpd|flv|webm)(?:$|[?#])/i.test(String(url || "")) ||
        /(?:m3u8|playlist|\.mp4)(?:[?&]|$)/i.test(String(url || ""));
}

function avdbEmptyList(page) {
    return JSON.stringify({
        items: [],
        pagination: { currentPage: page || 1, totalPages: 1, totalItems: 0 }
    });
}

function avdbNormalizeMovie(movie) {
    var id = avdbFirst(movie, ["vod_id", "id", "vod_en"], "");
    var title = avdbFirst(movie, ["vod_name", "title", "name"], "");
    if (id === "" || title === "") return null;
    var poster = avdbAbsoluteUrl(avdbFirst(movie, ["vod_pic", "vod_pic_thumb", "pic", "poster"], ""));
    var year = avdbFirst(movie, ["vod_year", "year"], "");
    var remarks = avdbFirst(movie, ["vod_remarks", "remarks", "vod_state"], "");
    return {
        id: String(id),
        title: avdbText(title),
        posterUrl: poster,
        backdropUrl: avdbAbsoluteUrl(avdbFirst(movie, ["vod_pic_slide", "vod_bg", "backdrop"], poster)),
        description: avdbText(avdbFirst(movie, ["vod_blurb", "vod_content", "description"], "")),
        year: year,
        status: avdbText(remarks),
        category: avdbText(avdbFirst(movie, ["type_name", "vod_class", "category"], "")),
        quality: avdbText(avdbFirst(movie, ["vod_remarks", "quality"], "")),
        rating: avdbFirst(movie, ["vod_score", "rating"], ""),
        duration: avdbText(avdbFirst(movie, ["vod_duration", "duration"], "")),
        casts: avdbText(avdbFirst(movie, ["vod_actor", "actors"], "")),
        director: avdbText(avdbFirst(movie, ["vod_director", "director"], ""))
    };
}

function avdbParseList(input) {
    var data = avdbParseJson(input);
    var source = data.list || data.data || data.items || [];
    if (!source.length && data.vod) source = data.vod;
    var items = [];
    var i, normalized;
    for (i = 0; i < source.length; i++) {
        normalized = avdbNormalizeMovie(source[i] || {});
        if (normalized) items.push(normalized);
    }
    var page = parseInt(data.page, 10) || 1;
    var totalPages = parseInt(data.pagecount || data.total_pages, 10) || 1;
    var totalItems = parseInt(data.total, 10) || items.length;
    return JSON.stringify({
        items: items,
        pagination: { currentPage: page, totalPages: totalPages, totalItems: totalItems }
    });
}

// Parse MacCMS play_url format:
// "Episode 1$url1#Episode 2$url2$$$Episode 1$url3"
function avdbParsePlaySources(movie) {
    var fromRaw = String(avdbFirst(movie, ["vod_play_from", "play_from"], "") || "");
    var urlRaw = String(avdbFirst(movie, ["vod_play_url", "play_url"], "") || "");
    var from = fromRaw.split("$$$");
    var sourceLists = urlRaw.split("$$$");
    var servers = [];
    var i, j, sourceName, entries, pair, label, link, episodes;
    for (i = 0; i < sourceLists.length; i++) {
        sourceName = avdbText(from[i] || ("Server " + (i + 1)));
        entries = sourceLists[i].split("#");
        episodes = [];
        for (j = 0; j < entries.length; j++) {
            pair = entries[j].split("$");
            if (pair.length < 2) continue;
            label = avdbText(pair.shift());
            link = avdbAbsoluteUrl(pair.join("$").trim());
            if (!link) continue;
            episodes.push({
                id: link,
                name: label || ("Tập " + (episodes.length + 1)),
                slug: label || String(episodes.length + 1)
            });
        }
        if (episodes.length) servers.push({ name: sourceName, episodes: episodes });
    }
    // Alternative JSON-style episode fields used by some API mirrors.
    if (!servers.length && movie.episodes && movie.episodes.length) {
        episodes = [];
        for (j = 0; j < movie.episodes.length; j++) {
            var ep = movie.episodes[j] || {};
            link = avdbAbsoluteUrl(avdbFirst(ep, ["url", "link", "play_url", "id"], ""));
            if (link) episodes.push({
                id: link,
                name: avdbText(avdbFirst(ep, ["name", "title"], "Tập " + (j + 1))),
                slug: String(j + 1)
            });
        }
        if (episodes.length) servers.push({ name: "Server", episodes: episodes });
    }
    return servers;
}

function avdbExtractMedia(html) {
    var raw = String(html == null ? "" : html);
    var decoded = avdbDecodeHtml(raw);
    var patterns = [
        /(?:\"|')?(?:url|file|src|hls|m3u8)(?:\"|')?\s*[:=]\s*(?:\"|')((?:https?:)?\/\/[^\"'\s<>]+)(?:\"|')/i,
        /https?:\\?\/\\?\/[^"'\\\s<>]+\.m3u8(?:\?[^"'\\\s<>]*)?/i,
        /https?:\\?\/\\?\/[^"'\\\s<>]+\.mp4(?:\?[^"'\\\s<>]*)?/i,
        /<iframe[^>]+src=[\"']([^\"']+)[\"']/i,
        /<source[^>]+src=[\"']([^\"']+)[\"']/i
    ];
    var i, m;
    for (i = 0; i < patterns.length; i++) {
        m = decoded.match(patterns[i]);
        if (m) {
            var candidate = m[1] || m[0];
            candidate = avdbAbsoluteUrl(candidate.replace(/\\\//g, "/"));
            if (candidate) return candidate;
        }
    }
    return "";
}

function avdbDetailObject(input) {
    var data = avdbParseJson(input);
    var list = data.list || data.data || data.items || [];
    if (list.length) return list[0] || {};
    if (data.vod && data.vod.length) return data.vod[0] || {};
    if (data.vod_id || data.id) return data;
    return {};
}

// -----------------------------------------------------------------------------
// 1. Config & Metadata
// -----------------------------------------------------------------------------

function getManifest() {
    return JSON.stringify({
        id: "avdb_api",
        name: "AVDB API",
        version: "1.0.5",
        baseUrl: AVDB_SITE_BASE,
        iconUrl: "",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "latest", title: "Mới cập nhật", type: "Horizontal", path: "" },
        { slug: "censored", title: "Censored", type: "Horizontal", path: "" },
        { slug: "uncensored", title: "Uncensored", type: "Horizontal", path: "" },
        { slug: "uncensored-leaked", title: "Uncensored Leaked", type: "Horizontal", path: "" },
        { slug: "amateur", title: "Amateur", type: "Horizontal", path: "" },
        { slug: "chinese-av", title: "Chinese AV", type: "Horizontal", path: "" },
        { slug: "hentai", title: "Hentai", type: "Horizontal", path: "" },
        { slug: "english-subtitle", title: "English Subtitle", type: "Horizontal", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Censored", slug: "censored" },
        { name: "Uncensored", slug: "uncensored" },
        { name: "Uncensored Leaked", slug: "uncensored-leaked" },
        { name: "Amateur", slug: "amateur" },
        { name: "Chinese AV", slug: "chinese-av" },
        { name: "Hentai", slug: "hentai" },
        { name: "English Subtitle", slug: "english-subtitle" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [],
        category: [],
        year: [],
        country: []
    });
}

// -----------------------------------------------------------------------------
// 2. URL builders
// -----------------------------------------------------------------------------

function getUrlList(slug, filtersJson) {
    var filters = avdbFilters(filtersJson);
    var page = parseInt(filters.page, 10) || 1;
    var params = ["ac=list", "pg=" + page, "pagesize=" + (parseInt(filters.pagesize, 10) || AVDB_PAGE_SIZE)];
    var categoryMap = {
        "censored": 1, "uncensored": 2, "uncensored-leaked": 3,
        "amateur": 4, "chinese-av": 5, "hentai": 6, "english-subtitle": 7
    };
    var category = filters.category || filters.type || categoryMap[String(slug || "").toLowerCase()];
    if (category && /^\d+$/.test(String(category))) params.push("t=" + encodeURIComponent(category));
    if (filters.year) params.push("year=" + avdbEncode(filters.year));
    if (filters.hours || filters.h) params.push("h=" + avdbEncode(filters.hours || filters.h));
    if (filters.sort_direction) params.push("sort_direction=" + avdbEncode(filters.sort_direction));
    // Home's latest section uses no category; category slugs map to AVDB IDs.
    return AVDB_API_BASE + "?" + params.join("&");
}

function getUrlSearch(keyword, filtersJson) {
    var filters = avdbFilters(filtersJson);
    var page = parseInt(filters.page, 10) || 1;
    return AVDB_API_BASE + "?ac=list&wd=" + avdbEncode(keyword) +
        "&pg=" + page + "&pagesize=" + (parseInt(filters.pagesize, 10) || AVDB_PAGE_SIZE);
}

function getUrlDetail(slug) {
    var value = String(slug == null ? "" : slug).trim();
    if (/^https?:\/\//i.test(value)) return value;
    return AVDB_API_BASE + "?ac=detail&ids=" + avdbEncode(value);
}

function getUrlCategories() {
    return AVDB_API_BASE + "?ac=list";
}
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// -----------------------------------------------------------------------------
// 3. Parsers
// -----------------------------------------------------------------------------

function parseListResponse(html) {
    return avdbParseList(html);
}

function parseSearchResponse(html) {
    return avdbParseList(html);
}

function parseMovieDetail(html) {
    var movie = avdbDetailObject(html);
    if (!movie || (!movie.vod_id && !movie.id && !movie.vod_name)) {
        return JSON.stringify({
            id: "", title: "", posterUrl: "", backdropUrl: "",
            description: "", servers: [], quality: "", year: "",
            rating: "", status: "", duration: "", casts: "",
            director: "", category: ""
        });
    }
    var normalized = avdbNormalizeMovie(movie) || {};
    return JSON.stringify({
        id: String(avdbFirst(movie, ["vod_id", "id"], normalized.id || "")),
        title: normalized.title || "",
        posterUrl: normalized.posterUrl || "",
        backdropUrl: normalized.backdropUrl || normalized.posterUrl || "",
        description: avdbText(avdbFirst(movie, ["vod_content", "vod_blurb", "description"], normalized.description || "")),
        servers: avdbParsePlaySources(movie),
        quality: avdbText(avdbFirst(movie, ["vod_remarks", "vod_version", "quality"], "")),
        year: avdbFirst(movie, ["vod_year", "year"], ""),
        rating: avdbFirst(movie, ["vod_score", "rating"], ""),
        status: avdbText(avdbFirst(movie, ["vod_remarks", "vod_state", "status"], "")),
        duration: avdbText(avdbFirst(movie, ["vod_duration", "duration"], "")),
        casts: avdbText(avdbFirst(movie, ["vod_actor", "actors"], "")),
        director: avdbText(avdbFirst(movie, ["vod_director", "director"], "")),
        category: avdbText(avdbFirst(movie, ["type_name", "vod_class", "category"], ""))
    });
}

// Receives a direct episode URL or a fetched player/stream response.
// Direct M3U8/MP4 links are returned unchanged for ExoPlayer.
function parseDetailResponse(html) {
    var raw = String(html == null ? "" : html).trim();
    var direct = avdbAbsoluteUrl(raw);
    if (/^https?:\/\/\S+$/i.test(direct) && avdbIsDirectMedia(direct)) {
        return JSON.stringify({
            url: direct,
            isEmbed: false,
            mimeType: /\.mp4(?:$|[?#])/i.test(direct) ? "video/mp4" : "application/x-mpegURL",
            headers: { Referer: AVDB_REFERER },
            subtitles: []
        });
    }
    var data = avdbParseJson(raw);
    var media = avdbFirst(data, ["url", "file", "play_url", "m3u8", "src"], "");
    if (media) {
        media = avdbAbsoluteUrl(media);
        return JSON.stringify({
            url: media,
            isEmbed: !avdbIsDirectMedia(media),
            mimeType: /\.mp4(?:$|[?#])/i.test(media) ? "video/mp4" :
                (avdbIsDirectMedia(media) ? "application/x-mpegURL" : ""),
            headers: { Referer: AVDB_REFERER },
            subtitles: []
        });
    }
    media = avdbExtractMedia(raw);
    if (media) {
        return JSON.stringify({
            url: media,
            isEmbed: !avdbIsDirectMedia(media),
            mimeType: /\.mp4(?:$|[?#])/i.test(media) ? "video/mp4" :
                (avdbIsDirectMedia(media) ? "application/x-mpegURL" : ""),
            headers: { Referer: AVDB_REFERER },
            subtitles: []
        });
    }
    // If a URL was supplied but is not a direct media file, let App load it as embed.
    if (/^https?:\/\//i.test(raw)) {
        return JSON.stringify({
            url: raw,
            isEmbed: true,
            headers: { Referer: AVDB_REFERER },
            subtitles: []
        });
    }
    return JSON.stringify({ url: "", isEmbed: false, subtitles: [] });
}

function parseEmbedResponse(html, sourceUrl) {
    var media = avdbExtractMedia(html);
    if (!media) {
        var data = avdbParseJson(html);
        media = avdbAbsoluteUrl(avdbFirst(data, ["url", "file", "play_url", "m3u8", "src"], ""));
    }
    if (media) {
        return JSON.stringify({
            url: media,
            isEmbed: !avdbIsDirectMedia(media),
            mimeType: /\.mp4(?:$|[?#])/i.test(media) ? "video/mp4" :
                (avdbIsDirectMedia(media) ? "application/x-mpegURL" : ""),
            headers: { Referer: sourceUrl || AVDB_REFERER },
            subtitles: []
        });
    }
    var iframe = String(html || "").match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframe && iframe[1]) {
        return JSON.stringify({
            url: avdbAbsoluteUrl(iframe[1]),
            isEmbed: true,
            headers: { Referer: sourceUrl || AVDB_REFERER }
        });
    }
    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(html) {
    var data = avdbParseJson(html);
    var classes = data.class || data.classes || data.categories || [];
    var result = [];
    var i, item, id, name;
    for (i = 0; i < classes.length; i++) {
        item = classes[i] || {};
        id = avdbFirst(item, ["type_id", "id"], "");
        name = avdbFirst(item, ["type_name", "name"], "");
        if (id !== "" && name !== "") result.push({ name: avdbText(name), slug: String(id) });
    }
    return JSON.stringify(result);
}

function parseCountriesResponse(html) {
    return "[]";
}

function parseYearsResponse(html) {
    return "[]";
}
