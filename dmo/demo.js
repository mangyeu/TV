function getManifest() {
    return JSON.stringify({
        "id": "missavmedia",
        "name": "MissAV Media",
        "version": "1.0.5",
        "versionCode": 5,
        "baseUrl": "https://missav.media",
        "iconUrl": "",
        "description": "MissAV Media plugin",
        "author": "Plugin",
        "lang": "vi",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "new", title: "Mới cập nhật", type: "Grid", path: "vi" },
        { slug: "release", title: "Phát hành mới", type: "Horizontal", path: "vi" },
        { slug: "uncensored-leak", title: "Không che", type: "Horizontal", path: "vi" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Mới cập nhật", slug: "new" },
        { name: "Phát hành mới", slug: "release" },
        { name: "Không che", slug: "uncensored-leak" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới nhất", value: "newest" },
            { name: "Xem nhiều", value: "views" }
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
        var base = "https://missav.media/vi/" + encodeURIComponent(slug || "new");

        var params = [];
        if (page > 1) params.push("page=" + page);
        if (filters.sort) params.push("sort=" + encodeURIComponent(filters.sort));

        return params.length > 0 ? (base + "?" + params.join("&")) : base;
    } catch (e) {
        return "https://missav.media/vi/new";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var q = encodeURIComponent(String(keyword || "").replace(/^\s+|\s+$/g, ""));
        var url = "https://missav.media/vi/search/" + q;
        return page > 1 ? (url + "?page=" + page) : url;
    } catch (e) {
        return "https://missav.media/vi/search/" + encodeURIComponent(String(keyword || ""));
    }
}

function getUrlDetail(slug) {
    var cleanSlug = String(slug || "").replace(/^\/+|\/+$/g, "");
    if (!cleanSlug) return "https://missav.media/vi/new";
    if (cleanSlug.indexOf("http://") === 0 || cleanSlug.indexOf("https://") === 0) return cleanSlug;
    if (cleanSlug.indexOf("vi/") === 0) return "https://missav.media/" + cleanSlug;
    return "https://missav.media/vi/" + cleanSlug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// POSTER / IMAGE HELPERS
// =============================================================================

function decodeHtmlEntities(text) {
    return String(text || "")
        .replace(/"/g, "\"")
        .replace(/'/g, "'")
        .replace(/'/gi, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/&/g, "&")
        .replace(/^\s+|\s+$/g, "");
}

function isHiddenOrPlaceholderUrl(url) {
    var s = String(url || "").replace(/^\s+|\s+$/g, "").toLowerCase();
    if (!s) return true;
    if (s.indexOf("data:image") === 0) return true;
    if (s.indexOf("about:blank") === 0) return true;
    if (/(\/|_|-)(blank|placeholder|spacer|loading|default-thumb|no-image)\.(png|jpg|jpeg|gif|webp)/i.test(s)) {
        return true;
    }
    return false;
}

function isHiddenElementAttrs(tagStr) {
    var t = String(tagStr || "");
    if (/\b(hidden|d-none|sr-only|invisible)\b/i.test(t)) return true;
    if (/style=["'][^"']*(display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(\s*;|\s*["']|$))/i.test(t)) {
        return true;
    }
    return false;
}

function normalizeImageUrl(src, baseUrl) {
    var raw = decodeHtmlEntities(src || "");
    if (isHiddenOrPlaceholderUrl(raw)) return "";

    var base = String(baseUrl || "https://missav.media").replace(/\/+$/, "");
    if (raw.indexOf("//") === 0) return "https:" + raw;
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) return raw;
    return base + "/" + raw.replace(/^\/+/, "");
}

function extractImageFromBlock(blockHtml, baseUrl) {
    var html = String(blockHtml || "");

    var imgRegex = /<img\b([^>]*)>/gi;
    var imgMatch;
    var fallbackCandidate = "";

    while ((imgMatch = imgRegex.exec(html)) !== null) {
        var attrs = imgMatch[1] || "";
        var attrHidden = isHiddenElementAttrs(attrs);

        var candidates = [
            (attrs.match(/\bdata-src=["']([^"']+)["']/i) || [])[1],
            (attrs.match(/\bdata-original=["']([^"']+)["']/i) || [])[1],
            (attrs.match(/\bdata-lazy-src=["']([^"']+)["']/i) || [])[1],
            (attrs.match(/\bdata-poster=["']([^"']+)["']/i) || [])[1],
            (attrs.match(/\bsrc=["']([^"']+)["']/i) || [])[1]
        ];

        for (var i = 0; i < candidates.length; i++) {
            var normalized = normalizeImageUrl(candidates[i], baseUrl);
            if (normalized) {
                if (!attrHidden) return normalized;
                if (!fallbackCandidate) fallbackCandidate = normalized;
            }
        }
    }

    var bgMatch = html.match(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/i)
        || html.match(/\b(?:data-bg|data-background)=["']([^"']+)["']/i);
    if (bgMatch && bgMatch[1]) {
        var bgUrl = normalizeImageUrl(bgMatch[1], baseUrl);
        if (bgUrl) return bgUrl;
    }

    return fallbackCandidate || "";
}

function resolvePosterWithFallback(primary, secondary, baseUrl) {
    var p = normalizeImageUrl(primary, baseUrl);
    if (p) return p;
    var s = normalizeImageUrl(secondary, baseUrl);
    if (s) return s;
    return "";
}

// =============================================================================
// STREAM HELPERS
// =============================================================================

function extractServersFromHtml(htmlText) {
    var html = String(htmlText || "");
    var m3u8Matches = html.match(/https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/gi) || [];
    var mp4Matches = html.match(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/gi) || [];

    var mainEpisodes = [];
    var previewEpisodes = [];
    var seen = {};

    for (var i = 0; i < m3u8Matches.length; i++) {
        var u1 = decodeHtmlEntities(m3u8Matches[i]).replace(/\\\//g, "/");
        if (!u1 || seen[u1]) continue;
        seen[u1] = true;
        mainEpisodes.push({
            id: u1,
            name: mainEpisodes.length === 0 ? "HLS 1" : ("HLS " + (mainEpisodes.length + 1)),
            slug: "hls-" + (mainEpisodes.length + 1),
            m3u8: u1,
            embed: ""
        });
    }

    for (var j = 0; j < mp4Matches.length; j++) {
        var u2 = decodeHtmlEntities(mp4Matches[j]).replace(/\\\//g, "/");
        if (!u2 || seen[u2]) continue;
        seen[u2] = true;
        if (/\/preview\.mp4(\?|$)/i.test(u2)) {
            previewEpisodes.push({
                id: u2,
                name: "Preview",
                slug: "preview",
                m3u8: "",
                embed: u2
            });
        } else {
            mainEpisodes.push({
                id: u2,
                name: "MP4 " + (mainEpisodes.length + 1),
                slug: "mp4-" + (mainEpisodes.length + 1),
                m3u8: "",
                embed: u2
            });
        }
    }

    var servers = [];
    if (mainEpisodes.length > 0) {
        servers.push({ name: "Main", episodes: mainEpisodes });
    }
    if (previewEpisodes.length > 0) {
        servers.push({ name: "Preview", episodes: previewEpisodes });
    }
    return servers;
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlText) {
    try {
        var html = String(htmlText || "");
        var items = [];
        var seen = {};
        var cardRegex = /<a\b[^>]*href=["'](https?:\/\/[^"']*\/vi\/[^"']+|\/vi\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = cardRegex.exec(html)) !== null) {
            var href = match[1];
            var inner = match[2];

            var slug = href.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/vi\/|\/$/g, "");
            if (!slug || seen[slug]) continue;

            var posterUrl = extractImageFromBlock(inner, "https://missav.media");
            if (!posterUrl) continue;

            seen[slug] = true;

            var titleMatch = inner.match(/\btitle=["']([^"']+)["']/i)
                || inner.match(/<img\b[^>]*\balt=["']([^"']+)["']/i);
            var title = decodeHtmlEntities((titleMatch && titleMatch[1]) || slug);

            items.push({
                id: slug,
                title: title,
                posterUrl: posterUrl,
                backdropUrl: posterUrl,
                year: 0,
                quality: "",
                episode_current: "",
                lang: ""
            });
        }

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: items.length,
                itemsPerPage: items.length || 24
            }
        });
    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 }
        });
    }
}

function parseSearchResponse(htmlText) {
    return parseListResponse(htmlText);
}

function parseMovieDetail(htmlText) {
    try {
        var html = String(htmlText || "");
        var titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<title>([^<]+)<\/title>/i);
        var ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        var videoPosterMatch = html.match(/<video\b[^>]*\bposter=["']([^"']+)["']/i);
        var descMatch = html.match(/<meta[^>]+(?:name=["']description["']|property=["']og:description["'])[^>]+content=["']([^"']+)["']/i);

        var title = decodeHtmlEntities(titleMatch ? titleMatch[1] : "");
        var bodyImg = extractImageFromBlock(html, "https://missav.media");
        var poster = resolvePosterWithFallback(
            videoPosterMatch ? videoPosterMatch[1] : "",
            (ogImgMatch && ogImgMatch[1]) || bodyImg,
            "https://missav.media"
        );
        var backdrop = resolvePosterWithFallback(
            (ogImgMatch && ogImgMatch[1]) || bodyImg,
            poster,
            "https://missav.media"
        );
        var desc = decodeHtmlEntities(descMatch ? descMatch[1] : "");
        var servers = extractServersFromHtml(html);

        return JSON.stringify({
            id: "",
            title: title,
            originName: "",
            posterUrl: poster,
            backdropUrl: backdrop,
            description: desc,
            year: 0,
            rating: 0,
            quality: "",
            duration: "",
            servers: servers,
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
        });
    } catch (e) {
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
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            "Referer": "https://missav.media/",
            "Origin": "https://missav.media"
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    try {
        var parsed = JSON.parse(apiResponseJson || "{}");
        var candidate = parsed.url || parsed.streamUrl || parsed.link_m3u8 || parsed.link_embed || "";
        return resolveStreamData(candidate);
    } catch (e) {
        return resolveStreamData(apiResponseJson);
    }
}
