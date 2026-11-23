// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javcc.me";

function getManifest() {
    return JSON.stringify({
        "id": "javcc",
        "name": "JAVCC",
        "version": "1.0.5",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "censored", title: "JAV Censored Videos", type: "Horizontal", path: "category" },
        { slug: "reducing-mosaic", title: "JAV Reducing Mosaic Porn Videos", type: "Horizontal", path: "category" },
        { slug: "english-subtitle", title: "English Subtitle", type: "Horizontal", path: "category" },
        { slug: "latest", title: "Latest Videos", type: "Grid", path: "filter" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Latest", slug: "latest" },
        { name: "Censored", slug: "censored" },
        { name: "Reducing Mosaic", slug: "reducing-mosaic" },
        { name: "English Subtitle", slug: "english-subtitle" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Latest", value: "latest" },
            { name: "Random", value: "random" }
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
        if (page < 1) page = 1;
        var sort = String(filters.sort || "").trim();
        var cleanSlug = String(slug || "latest").replace(/^\/+|\/+$/g, "");

        if (cleanSlug === "latest" || cleanSlug === "random") {
            var filterType = sort || cleanSlug;
            return page > 1
                ? BASE_URL + "/page/" + page + "/?filter=" + encodeURIComponent(filterType)
                : BASE_URL + "/?filter=" + encodeURIComponent(filterType);
        }

        var url = page > 1
            ? BASE_URL + "/category/" + encodeURIComponent(cleanSlug) + "/page/" + page + "/"
            : BASE_URL + "/category/" + encodeURIComponent(cleanSlug) + "/";

        if (sort) {
            url += (url.indexOf("?") === -1 ? "?" : "&") + "filter=" + encodeURIComponent(sort);
        }

        return url;
    } catch (e) {
        return BASE_URL + "/category/" + encodeURIComponent(String(slug || "")) + "/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        if (page < 1) page = 1;
        var q = encodeURIComponent(String(keyword || "").trim());
        return page > 1
            ? BASE_URL + "/page/" + page + "/?s=" + q
            : BASE_URL + "/?s=" + q;
    } catch (e) {
        return BASE_URL + "/?s=" + encodeURIComponent(String(keyword || "").trim());
    }
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    var str = String(slug).trim();
    if (/^https?:\/\//i.test(str)) return str;
    if (str.indexOf("//") === 0) return "https:" + str;
    var cleanSlug = str.replace(/^\/+|\/+$/g, "");
    return BASE_URL + "/" + cleanSlug + "/";
}

function getUrlCategories() {
    return BASE_URL + "/category/";
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

// =============================================================================
// HTML & URL HELPERS
// =============================================================================

function resolveUrl(path) {
    if (!path) return "";
    var clean = String(path).trim();
    if (!clean) return "";
    if (/^https?:\/\//i.test(clean)) return clean;
    if (clean.indexOf("//") === 0) return "https:" + clean;
    return BASE_URL + "/" + clean.replace(/^\/+/, "");
}

function decodeHtmlEntities(str) {
    if (!str) return "";
    var namedMap = {
        "&": "&",
        """: '"',
        "'": "'",
        "'": "'",
        "<": "<",
        ">": ">",
        "–": "-",
        "—": "--",
        "‘": "'",
        "’": "'",
        "“": '"',
        "”": '"',
        "…": "...",
        " ": " "
    };

    return String(str)
        .replace(/&#(\d+);/g, function (_, dec) {
            var code = parseInt(dec, 10);
            return isNaN(code) ? "" : String.fromCharCode(code);
        })
        .replace(/&#x([0-9a-fA-F]+);/g, function (_, hex) {
            var code = parseInt(hex, 16);
            return isNaN(code) ? "" : String.fromCharCode(code);
        })
        .replace(/&(amp|quot|#039|apos|lt|gt|ndash|mdash|lsquo|rsquo|ldquo|rdquo|hellip|nbsp);/gi, function (entity) {
            var key = entity.toLowerCase();
            return Object.prototype.hasOwnProperty.call(namedMap, key) ? namedMap[key] : entity;
        })
        .replace(/\u00a0/g, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function extractSlugFromUrl(href) {
    if (!href) return "";
    var cleaned = String(href)
        .replace(/^https?:\/\/[^/]+/i, "")
        .split("?")[0]
        .split("#")[0]
        .replace(/^\/+|\/+$/g, "");
    if (!cleaned) return "";
    var parts = cleaned.split("/");
    return parts[parts.length - 1] || cleaned;
}

function extractPagination(html) {
    var currentPageMatch = html.match(/<(?:span|a)[^>]*class=["'][^"']*page-numbers\s+current[^"']*["'][^>]*>(\d+)<\/(?:span|a)>/i);
    var currentPage = currentPageMatch ? parseInt(currentPageMatch[1], 10) : 1;
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

    var maxPage = currentPage;

    var numRegex = /<(?:a|span)[^>]*class=["'][^"']*page-numbers[^"']*["'][^>]*>([\d,]+)<\/(?:a|span)>/gi;
    var m;
    while ((m = numRegex.exec(html)) !== null) {
        var n = parseInt(String(m[1]).replace(/,/g, ""), 10);
        if (!isNaN(n) && n > maxPage) maxPage = n;
    }

    var pageMatches = html.match(/\/page\/(\d+)\//gi) || [];
    for (var i = 0; i < pageMatches.length; i++) {
        var numMatch = pageMatches[i].match(/\/page\/(\d+)\//i);
        if (numMatch) {
            var p = parseInt(numMatch[1], 10);
            if (!isNaN(p) && p > maxPage) maxPage = p;
        }
    }

    return {
        currentPage: currentPage,
        totalPages: maxPage
    };
}

// =============================================================================
// STREAM & EMBED EXTRACTION HELPERS
// =============================================================================

function normalizeStreamCandidate(raw) {
    if (!raw) return "";
    var cleaned = String(raw)
        .trim()
        .replace(/\\u002F/gi, "/")
        .replace(/\\\//g, "/")
        .replace(/&/gi, "&")
        .replace(/^["']|["']$/g, "");

    if (!cleaned || cleaned.indexOf("data:") === 0 || cleaned.indexOf("blob:") === 0) {
        return "";
    }
    return resolveUrl(cleaned);
}

function isDirectStreamUrl(url) {
    if (!url) return false;
    return /\.(m3u8|mp4|m4s|mpd)(\?[^"'#\s]*)?$/i.test(url)
        || /(\.m3u8|\.mp4)([?&/]|$)/i.test(url);
}

function isIgnoredIframe(url) {
    var lower = String(url || "").toLowerCase();
    if (!lower) return true;
    return (
        lower.indexOf("javcc.me") !== -1 ||
        lower.indexOf("facebook.com") !== -1 ||
        lower.indexOf("twitter.com") !== -1 ||
        lower.indexOf("x.com") !== -1 ||
        lower.indexOf("google.com/recaptcha") !== -1 ||
        lower.indexOf("googletagmanager.com") !== -1 ||
        lower.indexOf("google-analytics.com") !== -1 ||
        lower.indexOf("histats.com") !== -1 ||
        lower.indexOf("disqus.com") !== -1 ||
        lower.indexOf("addthis.com") !== -1 ||
        lower.indexOf("sharethis.com") !== -1
    );
}

function extractStreamSources(html) {
    var directSources = [];
    var embedSources = [];

    function pushDirect(candidate) {
        var url = normalizeStreamCandidate(candidate);
        if (url && directSources.indexOf(url) === -1) {
            directSources.push(url);
        }
    }

    function pushEmbed(candidate) {
        var url = normalizeStreamCandidate(candidate);
        if (url && !isIgnoredIframe(url) && !isDirectStreamUrl(url) && embedSources.indexOf(url) === -1) {
            embedSources.push(url);
        }
    }

    var match;

    var directUrlRegex = /(https?:(?:\\\/|\/)[^\s"'<>\\]+\.(?:m3u8|mp4|m4s|mpd)(?:\\?\?[^\s"'<>\\]*)?)/gi;
    while ((match = directUrlRegex.exec(html)) !== null) {
        pushDirect(match[1]);
    }

    var mediaTagRegex = /<(?:video|source)[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi;
    while ((match = mediaTagRegex.exec(html)) !== null) {
        var mediaUrl = normalizeStreamCandidate(match[1]);
        if (isDirectStreamUrl(mediaUrl)) {
            pushDirect(mediaUrl);
        } else if (mediaUrl) {
            pushEmbed(mediaUrl);
        }
    }

    var jsConfigRegex = /["']?(?:file|src|url|hls|mp4)["']?\s*[:=]\s*["'](https?:(?:\\\/|\/)[^"'\s<>]+)["']/gi;
    while ((match = jsConfigRegex.exec(html)) !== null) {
        var cfgUrl = normalizeStreamCandidate(match[1]);
        if (isDirectStreamUrl(cfgUrl)) {
            pushDirect(cfgUrl);
        }
    }

    var iframeRegex = /<iframe[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["'][^>]*>/gi;
    while ((match = iframeRegex.exec(html)) !== null) {
        pushEmbed(match[1]);
    }

    var dataEmbedRegex = /<[^>]+data-(?:embed|player|video|src)=["'](https?:(?:\\\/|\/)[^"']+)["'][^>]*>/gi;
    while ((match = dataEmbedRegex.exec(html)) !== null) {
        var attrUrl = normalizeStreamCandidate(match[1]);
        if (isDirectStreamUrl(attrUrl)) {
            pushDirect(attrUrl);
        } else {
            pushEmbed(attrUrl);
        }
    }

    return directSources.concat(embedSources);
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlOrJson) {
    try {
        var html = String(htmlOrJson || "");
        var articleRegex = /<article\b[^>]*>([\s\S]*?)<\/article>/gi;
        var movies = [];
        var seenIds = {};
        var match;

        while ((match = articleRegex.exec(html)) !== null) {
            var fullTag = match[0];
            var inner = match[1];

            var hrefMatch = inner.match(/<a[^>]*href=["']([^"'#]+)["'][^>]*class=["'][^"']*(?:clip-link|post-thumbnail|entry-title-link)[^"']*["']/i)
                || inner.match(/<a[^>]*href=["']([^"'#]+)["'][^>]*>/i);

            var titleSpanMatch = inner.match(/<header[^>]*class=["'][^"']*entry-header[^"']*["'][^>]*>[\s\S]*?<(?:span|h2|h3|a)[^>]*>([\s\S]*?)<\/(?:span|h2|h3|a)>/i);
            var titleAttrMatch = inner.match(/<a[^>]*title=["']([^"']+)["']/i);
            var imgMatch = inner.match(/<img[^>]+(?:data-src|data-lazy-src|data-original|src)=["']([^"']+)["']/i);
            var durationMatch = inner.match(/<(?:span|div|time)[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div|time)>/i);
            var catMatch = fullTag.match(/\bcategory-([a-z0-9-]+)\b/i);

            var href = hrefMatch ? resolveUrl(hrefMatch[1]) : "";
            var rawTitle = titleSpanMatch ? titleSpanMatch[1] : (titleAttrMatch ? titleAttrMatch[1] : "");
            var title = decodeHtmlEntities(rawTitle);
            var slug = extractSlugFromUrl(href);
            var itemId = slug || href;
            var poster = getPosterUrl(imgMatch ? imgMatch[1] : "");

            if ((title || slug) && itemId && !seenIds[itemId]) {
                seenIds[itemId] = true;
                movies.push({
                    id: itemId,
                    title: title || slug,
                    posterUrl: poster,
                    backdropUrl: poster,
                    year: 0,
                    quality: "",
                    episode_current: durationMatch ? decodeHtmlEntities(durationMatch[1]) : "",
                    lang: catMatch ? catMatch[1] : ""
                });
            }
        }

        var pager = extractPagination(html);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: pager.currentPage,
                totalPages: pager.totalPages,
                totalItems: movies.length,
                itemsPerPage: movies.length || 24
            }
        });
    } catch (error) {
        return JSON.stringify({
            items: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 24
            }
        });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(htmlOrJson) {
    try {
        var html = String(htmlOrJson || "");

        var canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
            || html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        var pageId = canonicalMatch ? extractSlugFromUrl(canonicalMatch[1]) : "";

        var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        var descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        var durationMatch = html.match(/<(?:span|div|time)[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div|time)>/i);
        var imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
            || html.match(/<img[^>]+(?:data-src|data-lazy-src|src)=["']([^"']+)["']/i);

        var actors = [];
        var actorRegex = /<a[^>]*href=["'][^"']*\/actors?\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/gi;
        var aMatch;
        while ((aMatch = actorRegex.exec(html)) !== null) {
            var actorName = decodeHtmlEntities(aMatch[1]);
            if (actorName && actors.indexOf(actorName) === -1) {
                actors.push(actorName);
            }
        }

        var categories = [];
        var catRegex = /<a[^>]*href=["'][^"']*\/category\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/gi;
        var cMatch;
        while ((cMatch = catRegex.exec(html)) !== null) {
            var catName = decodeHtmlEntities(cMatch[1]);
            if (catName && categories.indexOf(catName) === -1) {
                categories.push(catName);
            }
        }

        var streamSources = extractStreamSources(html);

        var episodes = streamSources.map(function (srcUrl, idx) {
            return {
                id: srcUrl,
                name: "Server " + (idx + 1),
                slug: "server-" + (idx + 1)
            };
        });

        var servers = episodes.length > 0
            ? [{ name: "Default", episodes: episodes }]
            : [];

        var title = decodeHtmlEntities(
            (h1Match && h1Match[1]) || (titleMatch && titleMatch[1]) || ""
        );
        var poster = getPosterUrl(imgMatch ? imgMatch[1] : "");
        var duration = durationMatch ? decodeHtmlEntities(durationMatch[1]) : "";

        return JSON.stringify({
            id: pageId,
            title: title,
            originName: "",
            posterUrl: poster,
            backdropUrl: poster,
            description: decodeHtmlEntities(descMatch ? descMatch[1] : ""),
            year: 0,
            rating: 0,
            quality: "",
            duration: duration,
            servers: servers,
            episode_current: duration,
            lang: "",
            category: categories.join(", "),
            country: "",
            director: "",
            casts: actors.join(", "),
            status: "",
            tmdbId: "",
            tmdbSeason: 0,
            tmdbType: ""
        });
    } catch (error) {
        return "null";
    }
}

function parseDetailResponse(input) {
    var rawUrl = "";
    try {
        if (typeof input === "string" && input.trim().indexOf("{") === 0) {
            var parsed = JSON.parse(input);
            rawUrl = parsed.url || parsed.id || parsed.embedUrl || "";
        } else {
            rawUrl = String(input || "").trim();
        }
    } catch (e) {
        rawUrl = String(input || "").trim();
    }

    var resolved = normalizeStreamCandidate(rawUrl);
    var directUrl = isDirectStreamUrl(resolved) ? resolved : "";

    return JSON.stringify({
        url: directUrl,
        embedUrl: directUrl ? "" : resolved,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Referer": BASE_URL + "/"
        },
        subtitles: []
    });
}

function parseCategoriesResponse(htmlOrJson) {
    try {
        var html = String(htmlOrJson || "");
        var regex = /<a[^>]*href=["'](?:https?:\/\/javcc\.me)?\/category\/([^"'/?#]+)\/?["'][^>]*>([\s\S]*?)<\/a>/gi;
        var seen = {};
        var result = [];
        var match;

        while ((match = regex.exec(html)) !== null) {
            var slug = String(match[1] || "").trim();
            var name = decodeHtmlEntities(match[2]);
            if (slug && name && !seen[slug]) {
                seen[slug] = true;
                result.push({ name: name, slug: slug });
            }
        }

        return JSON.stringify(result);
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(apiResponseJson) {
    return "[]";
}

function parseYearsResponse(apiResponseJson) {
    return "[]";
}

function getPosterUrl(path) {
    return resolveUrl(path);
}
