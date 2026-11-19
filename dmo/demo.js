function getManifest() {
    return JSON.stringify({
        "id": "missav_media",
        "name": "MissAV Media",
        "version": "1.0.0",
        "baseUrl": "https://missav.media",
        "iconUrl": "",
        "isEnabled": false,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "new", title: "Mới cập nhật", type: "Grid", path: "vi" },
        { slug: "release", title: "Phát hành mới", type: "Horizontal", path: "vi" },
        { slug: "uncensored-leak", title: "Không che / Leak", type: "Horizontal", path: "vi" }
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
// URL GENERATION (HTML pages)
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
        var q = encodeURIComponent((keyword || "").trim());
        var url = "https://missav.media/vi/search/" + q;
        return page > 1 ? (url + "?page=" + page) : url;
    } catch (e) {
        return "https://missav.media/vi/search/" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    var cleanSlug = String(slug || "").replace(/^\/+|\/+$/g, "");
    if (cleanSlug.indexOf("http") === 0) return cleanSlug;
    if (cleanSlug.indexOf("vi/") === 0) return "https://missav.media/" + cleanSlug;
    return "https://missav.media/vi/" + cleanSlug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// HTML PARSERS (Cần điều chỉnh selector/regex theo HTML thực tế của trang)
// =============================================================================

function decodeHtmlEntities(text) {
    return String(text || "")
        .replace(/&/g, "&")
        .replace(/"/g, "\"")
        .replace(/'/g, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .trim();
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

        // Ví dụ mẫu bóc thẻ <a> chứa link video và <img> thumbnail
        // Thực tế cần đối chiếu DOM/HTML hiện tại của trang vì cấu trúc có thể thay đổi
        var cardRegex = /<a[^>]+href=["'](https?:\/\/[^"']*\/vi\/[^"']+|\/vi\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var seen = {};
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
            var title = decodeHtmlEntities((titleMatch && titleMatch[1]) || (imgMatch && imgMatch[2]) || slug);

            items.push({
                id: slug,
                title: title,
                posterUrl: normalizeImageUrl(imgMatch[1]),
                backdropUrl: normalizeImageUrl(imgMatch[1]),
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

        // Cần bổ sung logic trích xuất nguồn phát (m3u8 / packed js / player url) ở tầng fetch/JS phù hợp
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
            status: ""
        });
    } catch (e) {
        return "null";
    }
}

function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").trim();
    return JSON.stringify({
        url: raw,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://missav.media/"
        },
        subtitles: []
    });
}
