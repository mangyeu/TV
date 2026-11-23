// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "javcc",
        "name": "JAVCC",
        "version": "1.0.2",
        "baseUrl": "https://javcc.me",
        "iconUrl": "https://javcc.me/wp-content/themes/retrotube/assets/stylesheets/font-awesome/css/font-awesome.min.css",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'censored', title: 'JAV Censored Videos', type: 'Horizontal', path: 'category' },
        { slug: 'reducing-mosaic', title: 'JAV Reducing Mosaic Porn Videos', type: 'Horizontal', path: 'category' },
        { slug: 'english-subtitle', title: 'English Subtitle', type: 'Horizontal', path: 'category' },
        { slug: 'latest', title: 'Latest Videos', type: 'Grid', path: 'filter' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Latest', slug: 'latest' },
        { name: 'Censored', slug: 'censored' },
        { name: 'Reducing Mosaic', slug: 'reducing-mosaic' },
        { name: 'English Subtitle', slug: 'english-subtitle' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Latest', value: 'latest' },
            { name: 'Random', value: 'random' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

var BASE_URL = "https://javcc.me";

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var sort = filters.sort || "";

        if (slug === "latest" || slug === "random") {
            var filterType = sort || slug;
            return page > 1
                ? BASE_URL + "/page/" + page + "/?filter=" + encodeURIComponent(filterType)
                : BASE_URL + "/?filter=" + encodeURIComponent(filterType);
        }

        var url = page > 1
            ? BASE_URL + "/category/" + slug + "/page/" + page + "/"
            : BASE_URL + "/category/" + slug + "/";

        if (sort) {
            url += (url.indexOf("?") === -1 ? "?" : "&") + "filter=" + encodeURIComponent(sort);
        }

        return url;
    } catch (e) {
        return BASE_URL + "/category/" + slug + "/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = parseInt(filters.page, 10) || 1;
    var q = encodeURIComponent(keyword || "");
    return page > 1
        ? BASE_URL + "/page/" + page + "/?s=" + q
        : BASE_URL + "/?s=" + q;
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    if (slug.indexOf("http") === 0) return slug;
    var cleanSlug = slug.replace(/^\/+|\/+$/g, "");
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
// HTML HELPERS & PARSERS
// =============================================================================

function decodeHtmlEntities(str) {
    if (!str) return "";
    return String(str)
        .replace(/’/g, "'")
        .replace(/‘/g, "'")
        .replace(/“/g, '"')
        .replace(/”/g, '"')
        .replace(/–/g, "-")
        .replace(/—/g, "--")
        .replace(/&/g, "&")
        .replace(/&/g, "&")
        .replace(/"/g, '"')
        .replace(/'/g, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/<[^>]*>/g, "")
        .trim();
}

function extractSlugFromUrl(href) {
    if (!href) return "";
    var cleaned = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
    var parts = cleaned.split("/");
    return parts[parts.length - 1] || cleaned;
}

function parseListResponse(htmlOrJson) {
    try {
        var html = String(htmlOrJson || "");
        var articleRegex = /<article\b[^>]*>([\s\S]*?)<\/article>/gi;
        var movies = [];
        var match;

        while ((match = articleRegex.exec(html)) !== null) {
            var fullTag = match[0];
            var inner = match[1];

            var hrefMatch = inner.match(/<a[^>]*href=["']([^"']+)["']/i);
            var titleSpanMatch = inner.match(/<header[^>]*class=["'][^"']*entry-header[^"']*["'][^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
            var titleAttrMatch = inner.match(/<a[^>]*title=["']([^"']+)["']/i);
            var imgMatch = inner.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/i);
            var durationMatch = inner.match(/<span[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var viewsMatch = inner.match(/<span[^>]*class=["'][^"']*views[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var catMatch = fullTag.match(/\bcategory-([a-z0-9-]+)\b/i);

            var href = hrefMatch ? hrefMatch[1] : "";
            var rawTitle = titleSpanMatch ? titleSpanMatch[1] : (titleAttrMatch ? titleAttrMatch[1] : "");
            var title = decodeHtmlEntities(rawTitle);
            var slug = extractSlugFromUrl(href);

            if (title || slug) {
                movies.push({
                    id: slug || href,
                    title: title,
                    posterUrl: getPosterUrl(imgMatch ? imgMatch[1] : ""),
                    backdropUrl: getPosterUrl(imgMatch ? imgMatch[1] : ""),
                    year: 0,
                    quality: "",
                    episode_current: durationMatch ? decodeHtmlEntities(durationMatch[1]) : "",
                    lang: catMatch ? catMatch[1] : ""
                });
            }
        }

        var pageMatches = html.match(/\/page\/(\d+)\//g) || [];
        var maxPage = 1;
        for (var i = 0; i < pageMatches.length; i++) {
            var numMatch = pageMatches[i].match(/\/page\/(\d+)\//);
            if (numMatch) {
                var p = parseInt(numMatch[1], 10);
                if (p > maxPage) maxPage = p;
            }
        }

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: 1,
                totalPages: maxPage,
                totalItems: movies.length,
                itemsPerPage: movies.length || 24
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(htmlOrJson) {
    try {
        var html = String(htmlOrJson || "");

        var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        var descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        var imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
            || html.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/i);

        var actors = [];
        var actorRegex = /<a[^>]*href=["'][^"']*\/actors\/[^"']+["'][^>]*>([^<]+)<\/a>/gi;
        var aMatch;
        while ((aMatch = actorRegex.exec(html)) !== null) {
            var actorName = decodeHtmlEntities(aMatch[1]);
            if (actorName && actors.indexOf(actorName) === -1) actors.push(actorName);
        }

        var categories = [];
        var catRegex = /<a[^>]*href=["'][^"']*\/category\/[^"']+["'][^>]*>([^<]+)<\/a>/gi;
        var cMatch;
        while ((cMatch = catRegex.exec(html)) !== null) {
            var catName = decodeHtmlEntities(cMatch[1]);
            if (catName && categories.indexOf(catName) === -1) categories.push(catName);
        }

        var streamSources = [];
        var m3u8Regex = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/gi;
        var mp4Regex = /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/gi;
        var iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
        var sMatch;

        while ((sMatch = m3u8Regex.exec(html)) !== null) {
            if (streamSources.indexOf(sMatch[1]) === -1) streamSources.push(sMatch[1]);
        }
        while ((sMatch = mp4Regex.exec(html)) !== null) {
            if (streamSources.indexOf(sMatch[1]) === -1) streamSources.push(sMatch[1]);
        }
        while ((sMatch = iframeRegex.exec(html)) !== null) {
            var iframeUrl = sMatch[1];
            if (iframeUrl.indexOf("javcc.me") === -1 && streamSources.indexOf(iframeUrl) === -1) {
                streamSources.push(iframeUrl);
            }
        }

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

        return JSON.stringify({
            id: "",
            title: title,
            originName: "",
            posterUrl: getPosterUrl(imgMatch ? imgMatch[1] : ""),
            backdropUrl: getPosterUrl(imgMatch ? imgMatch[1] : ""),
            description: decodeHtmlEntities(descMatch ? descMatch[1] : ""),
            year: 0,
            rating: 0,
            quality: "",
            duration: "",
            servers: servers,
            episode_current: "",
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

function parseDetailResponse(apiResponseJson) {
    return JSON.stringify({
        url: "",
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL + "/"
        },
        subtitles: []
    });
}

function parseCategoriesResponse(htmlOrJson) {
    try {
        var html = String(htmlOrJson || "");
        var regex = /<a[^>]*href=["']https?:\/\/javcc\.me\/category\/([^"'/?#]+)\/?["'][^>]*>([\s\S]*?)<\/a>/gi;
        var seen = {};
        var result = [];
        var match;

        while ((match = regex.exec(html)) !== null) {
            var slug = match[1];
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
    if (!path) return "";
    var clean = String(path).trim();
    if (clean.indexOf("//") === 0) return "https:" + clean;
    if (clean.indexOf("http") === 0) return clean;
    return BASE_URL + "/" + clean.replace(/^\/+/, "");
}
