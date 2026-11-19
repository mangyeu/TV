function getManifest() {
    return JSON.stringify({
        "id": "missavmedia",
        "name": "MissAV Media",
        "version": "1.0.2",
        "versionCode": 1,
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

function getUrlCategories() {
    return "";
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

// =============================================================================
// PARSERS
// =============================================================================

function decodeHtmlEntities(text) {
    return String(text || "")
        .replace(/&/g, "&")
        .replace(/"/g, "\"")
        .replace(/'/g, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/^\s+|\s+$/g, "");
}

function normalizeImageUrl(src) {
    var raw = decodeHtmlEntities(src || "");
    if (!raw) return "";
    if (raw.indexOf("//") === 0) return "https:" + raw;
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) return raw;
    return "https://missav.media/" + raw.replace(/^\/+/, "");
}

function parseListResponse(htmlText) {
    try {
        var html = String(htmlText || "");
        var items = [];
        var seen = {};
        var cardRegex = /<a[^>]+href=["'](https?:\/\/[^"']*\/vi\/[^"']+|\/vi\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = cardRegex.exec(html)) !== null) {
            var href = match[1];
            var inner = match[2];
            var imgMatch = inner.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/i);
            if (!imgMatch) continue;

            var slug = href.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/vi\/|\/$/g, "");
            if (!slug || seen[slug]) continue;
            seen[slug] = true;

            var titleMatch = inner.match(/title=["']([^"']+)["']/i);
            var title = decodeHtmlEntities((titleMatch && titleMatch[1]) || imgMatch[2] || slug);
            var imgUrl = normalizeImageUrl(imgMatch[1]);

            items.push({
                id: slug,
                title: title,
                posterUrl: imgUrl,
                backdropUrl: imgUrl,
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
        var thumbMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        var descMatch = html.match(/<meta[^>]+(?:name=["']description["']|property=["']og:description["'])[^>]+content=["']([^"']+)["']/i);

        var title = decodeHtmlEntities(titleMatch ? titleMatch[1] : "");
        var poster = normalizeImageUrl(thumbMatch ? thumbMatch[1] : "");
        var desc = decodeHtmlEntities(descMatch ? descMatch[1] : "");

        return JSON.stringify({
            id: "",
            title: title,
            originName: "",
            posterUrl: poster,
            backdropUrl: poster,
            description: desc,
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
        });
    } catch (e) {
        return "null";
    }
}

function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").replace(/^\s+|\s+$/g, "");
    return JSON.stringify({
        url: raw,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://missav.media/"
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
