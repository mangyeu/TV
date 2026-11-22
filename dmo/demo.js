// =============================================================================
// TVHAY Plugin - Improved scraper/parser
// Compatible function interface with Kkphim plugin structure
// Base URL: https://tvhay.buzz
// NOTE: This file parses responses supplied by the host app. It does not perform
// network requests itself. If the source blocks the app's HTTP request, parser
// changes cannot fix that transport-level problem.
// =============================================================================

var BASE_URL = "https://tvhay.buzz";

function getManifest() {
    return JSON.stringify({
        id: "tvhay",
        name: "TVHAY",
        version: "1.2.0",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.png",
        isEnabled: true,
        type: "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-moi", title: "Phim Mới", type: "Horizontal", path: "list" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "list" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "list" },
        { slug: "short-drama", title: "Short Drama", type: "Horizontal", path: "list" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim mới", slug: "phim-moi" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Short Drama", slug: "short-drama" },
        { name: "Hành động", slug: "hanh-dong" },
        { name: "Tình cảm", slug: "tinh-cam" },
        { name: "Hài hước", slug: "hai-huoc" },
        { name: "Kinh dị", slug: "kinh-di" },
        { name: "Võ thuật", slug: "vo-thuat" },
        { name: "Cổ trang", slug: "co-trang" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới cập nhật", value: "modified" },
            { name: "Năm phát hành", value: "year" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function safeDecode(value) {
    try { return decodeURIComponent(value); } catch (e) { return value; }
}

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = Math.max(1, parseInt(filters.page, 10) || 1);
        var listSlugs = ["phim-moi", "phim-bo", "phim-le", "short-drama"];
        var safeSlug = String(slug || "phim-moi").replace(/^\/+|\/+$/g, "");
        var url = listSlugs.indexOf(safeSlug) !== -1
            ? BASE_URL + "/" + safeSlug
            : BASE_URL + "/the-loai/" + encodeURIComponent(safeSlug);

        var params = [];
        if (page > 1) params.push("page=" + page);
        if (filters.country) params.push("country=" + encodeURIComponent(filters.country));
        if (filters.year) params.push("year=" + encodeURIComponent(filters.year));
        if (filters.sort) params.push("sort=" + encodeURIComponent(filters.sort));

        return params.length ? url + "?" + params.join("&") : url;
    } catch (e) {
        return BASE_URL + "/" + encodeURIComponent(slug || "phim-moi");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = Math.max(1, parseInt(filters.page, 10) || 1);
        var q = encodeURIComponent(String(keyword || "").trim());
        var url = BASE_URL + "/?view=tim-kiem&keyword=" + q;
        if (page > 1) url += "&page=" + page;
        return url;
    } catch (e) {
        return BASE_URL + "/?view=tim-kiem&keyword=" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    var value = String(slug || "").trim();
    if (value.charAt(0) === "{") {
        try {
            var parsed = JSON.parse(value);
            if (parsed.movieSlug) return BASE_URL + "/phim/" + encodeURIComponent(parsed.movieSlug);
            if (parsed.url) return normalizeUrl(parsed.url);
        } catch (e) {}
    }
    return BASE_URL + "/phim/" + encodeURIComponent(value);
}

function getUrlCategories() { return BASE_URL + "/the-loai"; }
function getUrlCountries() { return BASE_URL + "/quoc-gia"; }
function getUrlYears() { return ""; }

function getLocalYearsJson() {
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var y = currentYear; y >= 1970; y--) {
        years.push({ name: String(y), value: String(y) });
    }
    return JSON.stringify(years);
}

// =============================================================================
// HELPERS
// =============================================================================

function normalizeUrl(url) {
    if (!url) return "";
    url = String(url).trim();
    if (/^https?:\/\//i.test(url)) return url;
    if (url.indexOf("//") === 0) return "https:" + url;
    if (url.charAt(0) === "/") return BASE_URL + url;
    return BASE_URL + "/" + url;
}

function decodeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#(\d+);/g, function (_, n) {
            return String.fromCharCode(parseInt(n, 10));
        })
        .replace(/&#x([0-9a-f]+);/gi, function (_, n) {
            return String.fromCharCode(parseInt(n, 16));
        });
}

function stripTags(text) {
    return decodeHtml(String(text || "").replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " "))
        .replace(/\s+/g, " ").trim();
}

function extractText(html, pattern, groupIndex) {
    if (!html) return "";
    var match = String(html).match(pattern);
    return match && match[groupIndex || 1] ? stripTags(match[groupIndex || 1]) : "";
}

function extractAll(html, pattern, groupIndex) {
    if (!html) return [];
    var regex = new RegExp(pattern.source || pattern, pattern.flags || "g");
    var results = [], match;
    while ((match = regex.exec(String(html))) !== null) {
        if (match[groupIndex || 1]) results.push(stripTags(match[groupIndex || 1]));
        if (match[0] === "") regex.lastIndex++;
    }
    return results;
}

function getAttribute(tag, name) {
    var re = new RegExp("\\b" + name + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i");
    var match = String(tag || "").match(re);
    return match ? decodeHtml(match[1] || match[2] || match[3] || "") : "";
}

function getImageFromBlock(block) {
    var imgMatch = String(block || "").match(/<img\b[^>]*>/i);
    if (!imgMatch) return "";
    var tag = imgMatch[0];
    return normalizeUrl(
        getAttribute(tag, "data-lazy-src") ||
        getAttribute(tag, "data-src") ||
        getAttribute(tag, "data-original") ||
        getAttribute(tag, "src") ||
        getAttribute(tag, "srcset").split(/\s+/)[0]
    );
}

function getMovieSlug(href) {
    var value = decodeHtml(href || "");
    var match = value.match(/\/phim\/([^/?#]+)/i);
    if (match) return safeDecode(match[1]);
    return "";
}

function uniqueMovies(items) {
    var seen = {};
    return items.filter(function (item) {
        var key = item.id || item.title;
        if (!key || seen[key]) return false;
        seen[key] = true;
        return true;
    });
}

function emptyListResult(message) {
    return JSON.stringify({
        items: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 24
        },
        error: message || ""
    });
}

// =============================================================================
// LIST PARSER
// =============================================================================

function parseListResponse(htmlResponse) {
    try {
        var html = String(htmlResponse || "");
        if (!html.trim()) return emptyListResult("empty_response");

        if (/cloudflare|checking your browser|access denied|captcha/i.test(html) &&
            !/<a\b[^>]*href=["'][^"']*\/phim\//i.test(html)) {
            return emptyListResult("source_blocked_or_challenge");
        }

        var movies = [];
        var seen = {};

        // Strategy 1: Find anchors containing a movie URL, regardless of
        // attribute order or quote style.
        var anchorRegex = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
        var anchorMatch;
        while ((anchorMatch = anchorRegex.exec(html)) !== null) {
            var anchor = anchorMatch[0];
            var opening = anchor.match(/^<a\b[^>]*>/i);
            if (!opening) continue;

            var href = getAttribute(opening[0], "href");
            var slug = getMovieSlug(href);
            if (!slug || seen[slug]) continue;

            var title = getAttribute(opening[0], "title");
            if (!title) {
                title = extractText(anchor, /<span[^>]*class=["'][^"']*movie-title[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
                    extractText(anchor, /<h\d[^>]*>([\s\S]*?)<\/h\d>/i);
            }
            if (!title) title = stripTags(anchor);

            var poster = getImageFromBlock(anchor);
            var ep = extractText(anchor, /<span[^>]*class=["'][^"']*(?:movie-ep-status|episode|ep)[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var lang = extractText(anchor, /<span[^>]*class=["'][^"']*movie-label[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var yearMatch = anchor.match(/\b(19\d{2}|20\d{2})\b/);
            var year = yearMatch ? parseInt(yearMatch[1], 10) : 0;

            seen[slug] = true;
            movies.push({
                id: slug,
                title: title,
                posterUrl: poster,
                backdropUrl: poster,
                year: year,
                quality: "",
                episode_current: ep,
                lang: lang
            });
        }

        // Strategy 2: Older TVHAY markup can use a movie-item wrapper.
        if (!movies.length) {
            var itemRegex = /<div\b[^>]*class=["'][^"']*movie-item[^"']*["'][^>]*>([\s\S]*?)(?=<div\b[^>]*class=["'][^"']*movie-item|$)/gi;
            var itemMatch;
            while ((itemMatch = itemRegex.exec(html)) !== null) {
                var block = itemMatch[1];
                var hrefMatch = block.match(/href\s*=\s*["']([^"']*\/phim\/[^"']+)["']/i);
                var itemSlug = hrefMatch ? getMovieSlug(hrefMatch[1]) : "";
                if (!itemSlug || seen[itemSlug]) continue;

                var itemTitle = extractText(block, /<[^>]*title=["']([^"']+)["']/i) ||
                    extractText(block, /<h\d[^>]*>([\s\S]*?)<\/h\d>/i);
                seen[itemSlug] = true;
                movies.push({
                    id: itemSlug,
                    title: itemTitle || itemSlug,
                    posterUrl: getImageFromBlock(block),
                    backdropUrl: getImageFromBlock(block),
                    year: 0,
                    quality: "",
                    episode_current: "",
                    lang: ""
                });
            }
        }

        movies = uniqueMovies(movies);

        var currentPage = 1;
        var pageMatch = html.match(/class=["'][^"']*current[^"']*["'][^>]*>\s*(\d+)/i) ||
            html.match(/[?&]page=(\d+)/i);
        if (pageMatch) currentPage = parseInt(pageMatch[1], 10) || 1;

        var hasNext = /(?:page|trang)[^>]*>\s*(?:next|tiếp|»|&raquo;)/i.test(html) ||
            /class=["'][^"']*(?:next|pagination-next)[^"']*["']/i.test(html);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: hasNext ? currentPage + 1 : currentPage,
                totalItems: movies.length,
                itemsPerPage: movies.length || 24
            },
            error: movies.length ? "" : "no_movie_links_detected"
        });
    } catch (error) {
        return emptyListResult("parse_list_error: " + String(error && error.message || error));
    }
}

function parseSearchResponse(htmlResponse) {
    return parseListResponse(htmlResponse);
}

// =============================================================================
// DETAIL PARSER
// =============================================================================

function parseMovieDetail(htmlResponse) {
    try {
        var html = String(htmlResponse || "");
        if (!html.trim()) return "null";

        var title = extractText(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) ||
            extractText(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);

        var poster = "";
        var ogImage = html.match(/<meta\b[^>]*property=["']og:image["'][^>]*>/i);
        if (ogImage) poster = getAttribute(ogImage[0], "content");
        if (!poster) poster = getImageFromBlock(html.match(/<img\b[^>]*class=["'][^"']*poster[^"']*["'][^>]*>/i) || [""]);

        var description = "";
        var descMatch = html.match(/<(?:div|p)\b[^>]*class=["'][^"']*(?:description|content|summary|detail-content)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p)>/i);
        if (descMatch) description = stripTags(descMatch[1]);
        if (!description) {
            var metaDesc = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i);
            if (metaDesc) description = getAttribute(metaDesc[0], "content");
        }

        var yearMatch = html.match(/\b(19\d{2}|20\d{2})\b/);
        var year = yearMatch ? parseInt(yearMatch[1], 10) : 0;

        var episodeMap = {};
        var episodes = [];
        var epRegex = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        while ((epMatch = epRegex.exec(html)) !== null) {
            var epUrl = decodeHtml(epMatch[1]);
            if (!/\/(?:xem|watch|episode|tap)\//i.test(epUrl)) continue;

            var epName = stripTags(epMatch[2]);
            var absoluteUrl = normalizeUrl(epUrl);
            if (episodeMap[absoluteUrl]) continue;
            episodeMap[absoluteUrl] = true;

            episodes.push({
                id: JSON.stringify({ movieSlug: getMovieSlug(html) || "", url: absoluteUrl }),
                name: epName || ("Tập " + (episodes.length + 1)),
                slug: epUrl.split("/").pop(),
                m3u8: "",
                embed: absoluteUrl
            });
        }

        // Alternative links: URLs whose path contains the movie slug and an
        // episode number, while avoiding collecting unrelated navigation.
        if (!episodes.length) {
            var slugFromPage = extractText(html, /href=["']\/phim\/([^"']+)["']/i);
            var altRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            while ((epMatch = altRegex.exec(html)) !== null) {
                var label = stripTags(epMatch[2]);
                if (!/(?:tập|episode|ep\.?)\s*\d+/i.test(label)) continue;
                var epHref = decodeHtml(epMatch[1]);
                if (!epHref || /\/phim\//i.test(epHref)) continue;
                var epAbsolute = normalizeUrl(epHref);
                if (episodeMap[epAbsolute]) continue;
                episodeMap[epAbsolute] = true;
                episodes.push({
                    id: JSON.stringify({ movieSlug: slugFromPage, url: epAbsolute }),
                    name: label,
                    slug: epHref.split("/").pop(),
                    m3u8: "",
                    embed: epAbsolute
                });
            }
        }

        var servers = episodes.length ? [{ name: "Server 1", episodes: episodes }] : [];

        var movieSlug = extractText(html, /href=["']\/phim\/([^"']+)["']/i);
        return JSON.stringify({
            id: movieSlug,
            title: title,
            originName: "",
            posterUrl: normalizeUrl(poster),
            backdropUrl: normalizeUrl(poster),
            description: description,
            year: year,
            rating: 0,
            quality: "HD",
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
            tmdbType: "",
            error: episodes.length ? "" : "no_episode_links_detected"
        });
    } catch (error) {
        return "null";
    }
}

// =============================================================================
// DETAIL RESPONSE / STREAM DATA
// =============================================================================
// This parser only normalizes a supplied URL or response. It does not bypass
// access controls, extract protected media, or resolve third-party stream hosts.

function parseDetailResponse(apiResponseJson) {
    try {
        var raw = String(apiResponseJson || "").trim();
        if (!raw) {
            return JSON.stringify({
                url: "",
                isDirectStream: false,
                headers: { "Referer": BASE_URL + "/" },
                subtitles: [],
                error: "empty_input"
            });
        }

        var candidate = raw;
        try {
            var parsed = JSON.parse(raw);
            candidate = parsed.url || parsed.streamUrl || parsed.link_embed || parsed.link_m3u8 || raw;
        } catch (e) {}

        candidate = String(candidate || "").trim();
        var direct = /\.m3u8(?:\?|$)|\.mp4(?:\?|$)/i.test(candidate);
        return JSON.stringify({
            url: candidate,
            isDirectStream: direct,
            headers: { "Referer": BASE_URL + "/" },
            subtitles: [],
            resolvedFrom: "input_passthrough"
        });
    } catch (error) {
        return JSON.stringify({
            url: String(apiResponseJson || ""),
            isDirectStream: false,
            headers: { "Referer": BASE_URL + "/" },
            subtitles: [],
            error: String(error && error.message || error)
        });
    }
}

// =============================================================================
// CATEGORY / COUNTRY / YEAR PARSERS
// =============================================================================

function parseCategoriesResponse(apiResponseJson) {
    try {
        var html = String(apiResponseJson || "");
        var categories = [];
        var regex = /<a\b[^>]*href\s*=\s*["']\/the-loai\/([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match, seen = {};
        while ((match = regex.exec(html)) !== null) {
            var slug = safeDecode(match[1]);
            var name = stripTags(match[2]);
            if (!slug || !name || seen[slug]) continue;
            seen[slug] = true;
            categories.push({ name: name, slug: slug });
        }
        if (!categories.length) {
            categories = [
                { name: "Hành Động", slug: "hanh-dong" },
                { name: "Tình Cảm", slug: "tinh-cam" },
                { name: "Hài Hước", slug: "hai-huoc" },
                { name: "Kinh Dị", slug: "kinh-di" },
                { name: "Võ Thuật", slug: "vo-thuat" },
                { name: "Cổ Trang", slug: "co-trang" },
                { name: "Viễn Tưởng", slug: "vien-tuong" },
                { name: "Phiêu Lưu", slug: "phieu-luu" }
            ];
        }
        return JSON.stringify(categories);
    } catch (e) {
        return JSON.stringify([]);
    }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var html = String(apiResponseJson || "");
        var countries = [];
        var regex = /<a\b[^>]*href\s*=\s*["']\/quoc-gia\/([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match, seen = {};
        while ((match = regex.exec(html)) !== null) {
            var slug = safeDecode(match[1]);
            var name = stripTags(match[2]);
            if (!slug || !name || seen[slug]) continue;
            seen[slug] = true;
            countries.push({ name: name, value: slug });
        }
        if (!countries.length) {
            countries = [
                { name: "Việt Nam", value: "viet-nam" },
                { name: "Hàn Quốc", value: "han-quoc" },
                { name: "Trung Quốc", value: "trung-quoc" },
                { name: "Nhật Bản", value: "nhat-ban" },
                { name: "Thái Lan", value: "thai-lan" },
                { name: "Âu Mỹ", value: "au-my" }
            ];
        }
        return JSON.stringify(countries);
    } catch (e) {
        return JSON.stringify([]);
    }
}

function parseYearsResponse(apiResponseJson) {
    return getLocalYearsJson();
}

// =============================================================================
// OPTIONAL DEBUG HELPERS
// =============================================================================

function getParserDiagnostics(htmlResponse) {
    var html = String(htmlResponse || "");
    var parsed;
    try { parsed = JSON.parse(parseListResponse(html)); } catch (e) { parsed = {}; }
    return JSON.stringify({
        responseLength: html.length,
        looksLikeHtml: /<html|<body|<div|<a/i.test(html),
        looksBlocked: /cloudflare|access denied|captcha|checking your browser/i.test(html),
        detectedMovieLinks: (parsed.items || []).length,
        parserError: parsed.error || "",
        sample: html.substring(0, 300)
    });
}
