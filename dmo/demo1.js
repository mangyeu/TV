// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javhdz.today";

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.5",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embed"
    });
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'recent' },
        { name: 'Không Che', slug: 'uncensored-jav' },
        { name: 'Khử Che', slug: 'reducing-mosaic' },
        { name: 'Vietsub', slug: 'jav-sub' },
        { name: 'Nghiệp Dư', slug: 'amateur' }
    ]);
}

function getMenu() {
    return getPrimaryCategories();
}

function getMenus() {
    return getPrimaryCategories();
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'popular/today', title: 'Xem Nhiều Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'uncensored-jav', title: 'Jav Uncensored', type: 'Horizontal', path: '' },
        { slug: 'reducing-mosaic', title: 'Reducing Mosaic', type: 'Horizontal', path: '' },
        { slug: 'jav-sub', title: 'Jav Sub', type: 'Horizontal', path: '' },
        { slug: 'recent', title: 'Video Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'recent' },
            { name: 'Xem nhiều hôm nay', value: 'popular/today' },
            { name: 'Xem nhiều trong tuần', value: 'popular/week' },
            { name: 'Xem nhiều trong tháng', value: 'popular/month' },
            { name: 'Xem nhiều tất cả', value: 'popular/year' },
            { name: 'Nhiều lượt thích', value: 'rated/year' }
        ],
        category: [
            { name: "Uncensored Jav", value: "uncensored-jav" },
            { name: "Reducing Mosaic", value: "reducing-mosaic" },
            { name: "Jav Sub", value: "jav-sub" },
            { name: "Chinese Sub", value: "chinese-subtitle" },
            { name: "Creampie", value: "creampie" },
            { name: "Big Tits", value: "big-tits" },
            { name: "Amateur", value: "amateur" },
            { name: "Married Woman", value: "married-woman" },
            { name: "Beautiful Girl", value: "beautiful-girl" },
            { name: "Mature Woman", value: "mature-woman" },
            { name: "Cuckold", value: "cuckold" },
            { name: "Squirting", value: "squirting" },
            { name: "Nasty", value: "nasty" },
            { name: "Hardcore", value: "hardcore" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function appendPageQuery(url, page) {
    var p = parseInt(page, 10) || 1;
    if (/[?&]page=\d+/i.test(url)) {
        return url.replace(/([?&]page=)\d+/i, "$1" + p);
    }
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "page=" + p;
}

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
    var page = parseInt(filters.page, 10) || 1;
    var sort = (filters.sort && String(filters.sort).trim() !== "" && filters.sort !== "recent")
        ? String(filters.sort).replace(/^\/+|\/+$/g, "")
        : "";
    var sortPath = sort ? (sort + "/") : "";

    if (filters.category) {
        var cat = String(filters.category).replace(/^\/+|\/+$/g, "");
        return appendPageQuery(BASE_URL + "/" + cat + "/" + sortPath, page);
    }

    var cleanSlug = (slug === undefined || slug === null) ? "" : String(slug).trim();
    if (!cleanSlug || cleanSlug === "recent") {
        return appendPageQuery(BASE_URL + "/" + (sortPath || "recent/"), page);
    }

    if (/^https?:\/\//i.test(cleanSlug)) {
        return appendPageQuery(cleanSlug, page);
    }

    if (cleanSlug.indexOf("//") === 0) {
        return appendPageQuery("https:" + cleanSlug, page);
    }

    var normalizedSlug = cleanSlug.replace(/^\/+/, "");
    if (normalizedSlug.indexOf("?") !== -1) {
        return appendPageQuery(BASE_URL + "/" + normalizedSlug, page);
    }

    normalizedSlug = normalizedSlug.replace(/\/+$/, "");
    if (normalizedSlug.indexOf("/") !== -1) {
        return appendPageQuery(BASE_URL + "/" + normalizedSlug + "/", page);
    }

    return appendPageQuery(BASE_URL + "/" + normalizedSlug + "/" + sortPath, page);
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
    var page = parseInt(filters.page, 10) || 1;
    var q = encodeURIComponent(String(keyword || "").trim());
    return BASE_URL + "/search/video/?s=" + q + "&page=" + page;
}

function getUrlDetail(slug) {
    var s = (slug === undefined || slug === null) ? "" : String(slug).trim();
    if (!s) return BASE_URL + "/";
    if (/^https?:\/\//i.test(s)) return s;
    if (s.indexOf("//") === 0) return "https:" + s;
    if (s.indexOf("/") === 0) return BASE_URL + s;
    return BASE_URL + "/" + s;
}

function getUrlCategories() { return BASE_URL + "/categories/"; }
function getUrlCountries() { return BASE_URL + "/"; }
function getUrlYears() { return BASE_URL + "/"; }

// =============================================================================
// PARSERS
// =============================================================================

var PluginUtils = {
    cleanText: function (text) {
        if (!text) return "";
        return String(text)
            .replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/'/g, "'")
            .replace(/'/g, "'")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/ /g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }
};

function normalizeUrl(rawUrl) {
    if (!rawUrl) return "";
    var cleaned = String(rawUrl).replace(/\\\//g, "/").trim();
    if (!cleaned) return "";
    if (cleaned.indexOf("//") === 0) {
        return "https:" + cleaned;
    }
    if (cleaned.indexOf("/") === 0) {
        return BASE_URL + cleaned;
    }
    return cleaned;
}

function extractSlugFromHref(href) {
    if (!href) return "";
    var s = String(href).trim();
    if (/^https?:\/\//i.test(s)) {
        s = s.replace(/^https?:\/\/[^/]+/, "");
    } else if (s.indexOf("//") === 0) {
        s = s.replace(/^\/\/[^/]+/, "");
    }
    s = s.split("?")[0].split("#")[0].replace(/^\/+|\/+$/g, "");
    return s;
}

function parseListResponse(html) {
    var sourceHtml = typeof html === "string" ? html : "";
    var moviesMap = {};

    var parts = sourceHtml.split(/<(?:li|div|article)[^>]*(?:id=["']video-[^"']*["']|class=["'][^"']*(?:video-block|thumb-block|video-item|video-box)[^"']*["'])[^>]*>/i);

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var fullUrl = "";
        var title = "";

        var aRegex = /<a([^>]+)>([\s\S]*?)<\/a>/gi;
        var aMatch;
        while ((aMatch = aRegex.exec(itemHtml)) !== null) {
            var attrs = aMatch[1];
            var innerHtml = aMatch[2];
            var linkM = attrs.match(/href=["']([^"']+)["']/i);
            if (!linkM || !linkM[1] || linkM[1] === "#") continue;

            var titleM = attrs.match(/title=["']([^"']*)["']/i);
            var candidateTitle = titleM ? titleM[1] : "";
            if (!candidateTitle) {
                var imgTitleM = innerHtml.match(/<img[^>]+alt=["']([^"']*)["']/i);
                if (imgTitleM) candidateTitle = imgTitleM[1];
            }
            if (!candidateTitle) {
                candidateTitle = PluginUtils.cleanText(innerHtml);
            }

            if (attrs.indexOf("thumbnail") !== -1 || !fullUrl) {
                fullUrl = linkM[1];
                if (candidateTitle) title = candidateTitle;
                if (attrs.indexOf("thumbnail") !== -1) break;
            }
        }

        var slug = extractSlugFromHref(fullUrl);
        if (!slug) continue;

        var thumb = "";
        var imgMatch = itemHtml.match(/<img([^>]+)>/i);
        if (imgMatch) {
            var imgAttrs = imgMatch[1];
            var dataSrcM = imgAttrs.match(/data-(?:src|original|lazy-src)=["']([^"']+)["']/i);
            var srcM = imgAttrs.match(/src=["']([^"']+)["']/i);
            var rawThumb = (dataSrcM && dataSrcM[1]) ? dataSrcM[1] : (srcM ? srcM[1] : "");
            if (rawThumb && rawThumb.indexOf("data:image") !== 0) {
                thumb = normalizeUrl(rawThumb);
            }
            if (!title) {
                var altM = imgAttrs.match(/alt=["']([^"']*)["']/i);
                if (altM) title = altM[1];
            }
        }

        var rawTitle = PluginUtils.cleanText(title);
        var durationMatch = itemHtml.match(/<span[^>]*class=["'][^"']*video-overlay[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var duration = durationMatch ? PluginUtils.cleanText(durationMatch[1]) : "";

        var codeMatch = itemHtml.match(/<span[^>]*class=["'][^"']*video-overlay1[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";

        var labels = [];
        if (duration) labels.push(duration);
        if (code) labels.push(code);
        var labelText = labels.join(" | ") || "HD";

        if (!moviesMap[slug]) {
            moviesMap[slug] = {
                id: slug,
                title: rawTitle || "Phim không tiêu đề",
                posterUrl: thumb,
                backdropUrl: thumb,
                year: 0,
                quality: "HD",
                episode_current: labelText,
                lang: "Vietsub"
            };
        }
    }

    var movies = [];
    for (var key in moviesMap) {
        if (moviesMap.hasOwnProperty(key)) {
            movies.push(moviesMap[key]);
        }
    }

    var totalPages = 1;
    var pagesMatch = sourceHtml.match(/[?&]page=(\d+)/gi);
    if (pagesMatch) {
        for (var j = 0; j < pagesMatch.length; j++) {
            var pMatch = pagesMatch[j].match(/page=(\d+)/i);
            if (pMatch) {
                var p = parseInt(pMatch[1], 10);
                if (p > totalPages) totalPages = p;
            }
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: 1,
            totalPages: totalPages || 1,
            totalItems: movies.length,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function decodeBase64Safe(b64url) {
    var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var clean = String(b64url || "").replace(/-/g, "+").replace(/_/g, "/").trim();
    if (!clean) return "";
    try {
        if (typeof atob === 'function') {
            return atob(clean);
        }
    } catch (e) {}

    var out = "";
    var str = clean.replace(/=+$/, '');
    if (str.length % 4 === 1) return "";
    for (var bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? out += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = b64chars.indexOf(buffer);
    }
    return out;
}

function parseMovieDetail(html) {
    try {
        var sourceHtml = typeof html === "string" ? html : "";
        var titleMatch = sourceHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        var descMatch = sourceHtml.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        var servers = [];
        var serverBtnRegex = /<button[^>]*class=["'][^"']*button_choice_server[^"']*["'][^>]*>/gi;
        var btnMatch;
        var foundServer = false;

        while ((btnMatch = serverBtnRegex.exec(sourceHtml)) !== null) {
            var btnTag = btnMatch[0];
            var embedAttr = btnTag.match(/data-embed=["']([^"']+)["']/i);
            var nameAttr = btnTag.match(/data-name=["']([^"']+)["']/i);
            var serverName = nameAttr ? PluginUtils.cleanText(nameAttr[1]) : "Server";
            var rawEmbed = embedAttr ? embedAttr[1].trim() : "";
            var decodedUrl = "";

            if (rawEmbed) {
                if (/^https?:\/\//i.test(rawEmbed) || rawEmbed.indexOf("//") === 0) {
                    decodedUrl = normalizeUrl(rawEmbed);
                } else {
                    var b64Decoded = decodeBase64Safe(rawEmbed);
                    if (b64Decoded && (/^https?:\/\//i.test(b64Decoded) || b64Decoded.indexOf("//") === 0 || b64Decoded.indexOf("/") === 0)) {
                        decodedUrl = normalizeUrl(b64Decoded);
                    } else {
                        decodedUrl = normalizeUrl(rawEmbed);
                    }
                }
            }

            if (decodedUrl) {
                foundServer = true;
                servers.push({
                    name: serverName,
                    episodes: [{
                        id: decodedUrl,
                        name: "Full",
                        slug: "full"
                    }]
                });
            }
        }

        if (!foundServer) {
            var mainPlayerMatch = sourceHtml.match(/<iframe[^>]*id=["']main-player["'][^>]*>/i)
                || sourceHtml.match(/<[^>]*id=["']main-player["'][^>]*>/i);
            if (mainPlayerMatch) {
                var srcM = mainPlayerMatch[0].match(/data-src=["']([^"']+)["']|src=["']([^"']+)["']/i);
                var playerUrl = srcM ? (srcM[1] || srcM[2]) : "";
                if (playerUrl) {
                    servers.push({
                        name: "Embed Server",
                        episodes: [{
                            id: normalizeUrl(playerUrl),
                            name: "Full",
                            slug: "full"
                        }]
                    });
                    foundServer = true;
                }
            }
        }

        if (!foundServer) {
            var ultimateMatch = sourceHtml.match(/<iframe[^>]+src=["']((?:https?:)?\/\/[^"']+)["']/i);
            if (ultimateMatch && ultimateMatch[1]) {
                servers.push({
                    name: "Default Embed",
                    episodes: [{
                        id: normalizeUrl(ultimateMatch[1]),
                        name: "Full",
                        slug: "full"
                    }]
                });
            } else {
                servers.push({
                    name: "Unknown",
                    episodes: [{
                        id: "",
                        name: "Full",
                        slug: "full"
                    }]
                });
            }
        }

        var thumbMatch = sourceHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var thumb = thumbMatch ? normalizeUrl(thumbMatch[1]) : "";

        var codeMatch = sourceHtml.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "Full";

        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["'][^"']*fa-th-list[^"']*["'][^>]*><\/i>([^<]+)<\/a>/gi;
        var categoriesArr = [];
        var catMatch;
        while ((catMatch = categoryRegex.exec(sourceHtml)) !== null) {
            var catName = PluginUtils.cleanText(catMatch[2]);
            if (catName) categoriesArr.push(catName);
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: description,
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: 0,
            rating: 0,
            casts: "",
            director: "",
            country: "",
            category: categoriesArr.join(", "),
            status: code
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html, fallbackUrl) {
    try {
        var sourceHtml = typeof html === "string" ? html : "";
        var hostUrl = normalizeUrl(fallbackUrl || "");

        var mainPlayerMatch = sourceHtml.match(/<iframe[^>]*id=["']main-player["'][^>]*>/i)
            || sourceHtml.match(/<[^>]*id=["']main-player["'][^>]*>/i);
        if (mainPlayerMatch) {
            var srcM = mainPlayerMatch[0].match(/data-src=["']([^"']+)["']|src=["']([^"']+)["']/i);
            var playerUrl = srcM ? (srcM[1] || srcM[2]) : "";
            if (playerUrl) {
                hostUrl = normalizeUrl(playerUrl);
            }
        }

        return JSON.stringify({
            url: hostUrl,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": BASE_URL + "/"
            },
            subtitles: [],
            isEmbed: true,
            embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
        });
    } catch (e) {
        return JSON.stringify({ url: normalizeUrl(fallbackUrl || ""), headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(html, fallbackUrl) {
    var defaultHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": BASE_URL + "/"
    };

    var sourceHtml = typeof html === "string" ? html : "";
    var resolvedUrl = normalizeUrl(fallbackUrl || "");
    var isEmbed = false;

    if (sourceHtml) {
        var directMediaMatch = sourceHtml.match(
            /(?:https?:)?\/\/[^\s"'<>\\]+\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?/i
        );

        if (directMediaMatch) {
            resolvedUrl = normalizeUrl(directMediaMatch[0]);
            isEmbed = false;
        } else {
            var playerSrcMatch = sourceHtml.match(
                /(?:file|src|source|url)\s*[:=]\s*["']((?:https?:)?\/\/[^"']+\.(?:m3u8|mp4)[^"']*?)["']/i
            );

            if (playerSrcMatch) {
                resolvedUrl = normalizeUrl(playerSrcMatch[1]);
                isEmbed = false;
            } else {
                var nestedIframeMatch = sourceHtml.match(
                    /<iframe[^>]+src=["']([^"']+)["']/i
                );

                if (nestedIframeMatch) {
                    resolvedUrl = normalizeUrl(nestedIframeMatch[1]);
                    isEmbed = true;
                }
            }
        }
    }

    return JSON.stringify({
        url: resolvedUrl,
        headers: defaultHeaders,
        subtitles: [],
        isEmbed: isEmbed
    });
}

function parseCategoriesResponse(html) {
    var sourceHtml = typeof html === "string" ? html : "";
    var categoriesMap = {};
    var seenSlugs = {};

    var parts = sourceHtml.split(/<(?:li|div)[^>]*(?:id=["']category-[^"']*["']|class=["'][^"']*category[^"']*["'])[^>]*>/i);
    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var linkMatch = itemHtml.match(/href=["']([^"']+)["']/i);
        var nameMatch = itemHtml.match(/<(?:div|span|a|h\d)[^>]*class=["'][^"']*category-title[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|a|h\d)>/i)
            || itemHtml.match(/<a[^>]*>([\s\S]*?)<\/a>/i);

        if (linkMatch && nameMatch) {
            var slug = extractSlugFromHref(linkMatch[1]);
            var name = PluginUtils.cleanText(nameMatch[1]);
            if (!name) {
                var titleAttr = itemHtml.match(/title=["']([^"']+)["']/i);
                if (titleAttr) name = PluginUtils.cleanText(titleAttr[1]);
            }
            if (slug && name && !seenSlugs[slug]) {
                seenSlugs[slug] = true;
                categoriesMap[slug] = { name: name, slug: slug };
            }
        }
    }

    var categories = [];
    for (var key in categoriesMap) {
        if (categoriesMap.hasOwnProperty(key)) {
            categories.push(categoriesMap[key]);
        }
    }

    if (categories.length === 0) {
        var filterCfg = JSON.parse(getFilterConfig());
        if (filterCfg && filterCfg.category) {
            return JSON.stringify(filterCfg.category);
        }
    }

    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
