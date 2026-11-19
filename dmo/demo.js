// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javhdz.today";
var DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": BASE_URL + "/"
};

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.7",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embedtoexoplay"
    });
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'recent' },
        { name: 'Không Che', slug: 'uncensored-jav' },
        { name: 'Khử Che', slug: 'reducing-mosaic' },
        { name: 'Vietsub', slug: 'jav-sub' },
        { name: 'Nghiệp Dư', slug: 'amateur' },
        { name: 'Diễn Viên', slug: 'pornstars' }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'popular/today', title: 'Xem Nhiều Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'uncensored-jav', title: 'Jav Uncensored', type: 'Horizontal', path: '' },
        { slug: 'reducing-mosaic', title: 'Reducing Mosaic', type: 'Horizontal', path: '' },
        { slug: 'jav-sub', title: 'Jav Sub', type: 'Horizontal', path: '' },
        { slug: 'pornstars', title: 'Diễn Viên Nổi Bật', type: 'Horizontal', path: '' },
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
// UTILS & SERVER HELPERS
// =============================================================================

var PluginUtils = {
    safeParseJson: function (jsonStr, fallback) {
        if (!jsonStr) return fallback;
        if (typeof jsonStr === "object") return jsonStr;
        try {
            return JSON.parse(String(jsonStr));
        } catch (e) {
            return fallback;
        }
    },

    cleanText: function (text) {
        if (!text) return "";
        return String(text)
            .replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/'/g, "'")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/&#(\d+);/g, function (_, code) {
                var num = parseInt(code, 10);
                return isNaN(num) ? "" : String.fromCharCode(num);
            })
            .replace(/\s+/g, " ")
            .trim();
    },

    normalizeUrl: function (url) {
        if (!url) return "";
        var clean = String(url).trim()
            .replace(/\\+/g, "")
            .replace(/&/g, "&");
        if (!clean || clean === "#" || clean.indexOf("about:blank") === 0 || clean.indexOf("javascript:") === 0) {
            return "";
        }
        if (clean.indexOf("http://") === 0 || clean.indexOf("https://") === 0) {
            return clean;
        }
        if (clean.indexOf("//") === 0) {
            return "https:" + clean;
        }
        if (clean.indexOf("/") === 0) {
            return BASE_URL + clean;
        }
        return BASE_URL + "/" + clean;
    },

    extractSlug: function (urlOrSlug) {
        if (!urlOrSlug) return "";
        var s = String(urlOrSlug).trim();
        s = s.replace(/^https?:\/\/[^/]+/i, "");
        s = s.replace(/[?#].*$/, "");
        s = s.replace(/^\/+|\/+$/g, "");
        return s;
    },

    extractAttr: function (tagHtml, attrName) {
        if (!tagHtml || !attrName) return "";
        var re = new RegExp(attrName + "\\s*=\\s*[\"']([^\"']*)[\"']", "i");
        var m = tagHtml.match(re);
        return m ? m[1].trim() : "";
    },

    extractImageUrl: function (imgAttrs) {
        if (!imgAttrs) return "";
        var attrNames = ["data-src", "data-original", "data-lazy-src", "data-lazy", "data-cfsrc", "src"];
        for (var i = 0; i < attrNames.length; i++) {
            var re = new RegExp(attrNames[i] + "\\s*=\\s*[\"']([^\"']+)[\"']", "i");
            var m = imgAttrs.match(re);
            if (m && m[1]) {
                var val = m[1].trim();
                if (val.indexOf("data:image") !== 0 && val.indexOf("blank.") === -1) {
                    return PluginUtils.normalizeUrl(val);
                }
            }
        }
        return "";
    },

    decodeBase64Safe: function (b64str) {
        if (!b64str) return "";
        var normalized = String(b64str).trim()
            .replace(/\s+/g, "")
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        try {
            if (typeof atob === "function") {
                return atob(normalized);
            }
        } catch (e) { }

        var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var output = "";
        var str = normalized.replace(/=+$/, "");
        if (str.length % 4 === 1) return "";

        for (var bc = 0, bs = 0, buffer, idx = 0; (buffer = str.charAt(idx++)); ) {
            buffer = b64chars.indexOf(buffer);
            if (~buffer) {
                bs = bc % 4 ? bs * 64 + buffer : buffer;
                if (bc++ % 4) {
                    output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
                }
            }
        }
        return output;
    },

    getServerPriority: function (urlOrName) {
        var s = String(urlOrName || "").toLowerCase();
        if (s.indexOf(".m3u8") !== -1 || s.indexOf(".mp4") !== -1) return 100;
        if (
            s.indexOf("streamwish") !== -1 ||
            s.indexOf("filemoon") !== -1 ||
            s.indexOf("voe") !== -1 ||
            s.indexOf("vidhide") !== -1 ||
            s.indexOf("lulustream") !== -1 ||
            s.indexOf("dood") !== -1
        ) return 80;
        if (s.indexOf("embed") !== -1 || s.indexOf("/e/") !== -1 || s.indexOf("/v/") !== -1) return 50;
        return 10;
    },

    prioritizeServers: function (servers) {
        if (!servers || !servers.length) return servers;
        return servers.slice().sort(function (a, b) {
            var urlA = (a.episodes && a.episodes[0]) ? a.episodes[0].id : "";
            var urlB = (b.episodes && b.episodes[0]) ? b.episodes[0].id : "";
            var scoreA = PluginUtils.getServerPriority(urlA + " " + (a.name || ""));
            var scoreB = PluginUtils.getServerPriority(urlB + " " + (b.name || ""));
            return scoreB - scoreA;
        });
    },

    unwrapPayload: function (rawInput) {
        var text = String(rawInput || "");
        var paginationHtml = "";
        var trimmed = text.trim();

        if (trimmed.indexOf("{") === 0) {
            var data = PluginUtils.safeParseJson(trimmed, null);
            if (data && typeof data === "object") {
                if (data.html) {
                    text = String(data.html);
                } else if (data.data && data.data.html) {
                    text = String(data.data.html);
                } else if (data.content) {
                    text = String(data.content);
                }
                if (data.pagination) {
                    paginationHtml = String(data.pagination);
                } else if (data.data && data.data.pagination) {
                    paginationHtml = String(data.data.pagination);
                }
            }
        }

        return {
            html: text,
            paginationHtml: paginationHtml
        };
    }
};

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlPornstars(filtersJson) {
    var filters = PluginUtils.safeParseJson(filtersJson, {});
    var page = parseInt(filters.page, 10) || 1;
    var sortPath = (filters.sort && filters.sort !== "default" && filters.sort !== "recent")
        ? (PluginUtils.extractSlug(filters.sort) + "/")
        : "";

    var url = BASE_URL + "/pornstars/" + sortPath;
    if (page > 1) {
        url += page + "/";
    }
    return url;
}

function getUrlList(slug, filtersJson) {
    var filters = PluginUtils.safeParseJson(filtersJson, {});
    var page = parseInt(filters.page, 10) || 1;
    var cleanInputSlug = PluginUtils.extractSlug(slug || "recent");
    var targetSlug = filters.category
        ? PluginUtils.extractSlug(filters.category)
        : (cleanInputSlug || "recent");

    if (targetSlug.indexOf("pornstars") === 0 || targetSlug.indexOf("pornstar") === 0 || targetSlug.indexOf("models") === 0) {
        var pUrl = BASE_URL + "/" + targetSlug.replace(/\/+$/, "") + "/";
        if (page > 1) {
            pUrl += page + "/";
        }
        return pUrl;
    }

    var sortClean = (filters.sort && filters.sort !== "recent")
        ? PluginUtils.extractSlug(filters.sort)
        : "";

    var isBrowse = false;
    var browsePrefixes = ["recent", "popular", "rated", "discussed", "downloaded", "longest", "watched"];
    for (var i = 0; i < browsePrefixes.length; i++) {
        if (targetSlug.indexOf(browsePrefixes[i]) === 0 || sortClean.indexOf(browsePrefixes[i]) === 0) {
            isBrowse = true;
            break;
        }
    }

    var finalUrl = "";
    if (slug && String(slug).indexOf("http") === 0 && !filters.category) {
        finalUrl = String(slug).replace(/\/+$/, "") + "/";
    } else if (sortClean && targetSlug.indexOf(sortClean) !== 0) {
        finalUrl = BASE_URL + "/" + targetSlug + "/" + sortClean + "/";
    } else {
        finalUrl = BASE_URL + "/" + targetSlug + "/";
    }

    var params = [];
    params.push(isBrowse ? "ajax=browse_videos" : "ajax=1");
    if (page > 1) {
        params.push("page=" + page);
    }

    var separator = (finalUrl.indexOf("?") !== -1) ? "&" : "?";
    return finalUrl + separator + params.join("&");
}

function getUrlSearch(keyword, filtersJson) {
    var filters = PluginUtils.safeParseJson(filtersJson, {});
    var page = parseInt(filters.page, 10) || 1;
    var url = BASE_URL + "/search/video/?s=" + encodeURIComponent(keyword || "") + "&ajax=1";
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    return PluginUtils.normalizeUrl(slug);
}

function getUrlCategories() { return BASE_URL + "/categories/"; }
function getUrlCountries() { return BASE_URL + "/"; }
function getUrlYears() { return BASE_URL + "/"; }

// =============================================================================
// PAGINATION HELPER
// =============================================================================

function parsePaginationInfo(paginationSrc, fallbackCount) {
    var totalPages = 1;
    var currentPage = 1;
    var pagNav = paginationSrc || "";

    var paginationBlock = pagNav.match(/<(?:ul|div|nav)[^>]*class=["'][^"]*pagination[^"]*["'][^>]*>([\s\S]*?)<\/(?:ul|div|nav)>/i);
    if (paginationBlock) {
        pagNav = paginationBlock[1];
    }

    if (pagNav) {
        var activeMatch = pagNav.match(/<li[^>]*class=["'][^"]*active[^"]*["'][^>]*>\s*<(?:a|span)[^>]*>(\d+)<\/(?:a|span)>/i)
            || pagNav.match(/<(?:a|span)[^>]*class=["'][^"]*(?:current|active)[^"]*["'][^>]*>(\d+)<\/(?:a|span)>/i);
        if (activeMatch) {
            currentPage = parseInt(activeMatch[1], 10) || 1;
        }

        var pageLinks = pagNav.match(/href=["'][^"']*\/(\d+)\/?(?:[?#][^"']*)?["']/gi);
        if (pageLinks) {
            for (var j = 0; j < pageLinks.length; j++) {
                var pMatch = pageLinks[j].match(/\/(\d+)\/?(?:[?#][^"']*)?["']$/);
                if (pMatch) {
                    var p = parseInt(pMatch[1], 10);
                    if (!isNaN(p) && p > totalPages) totalPages = p;
                }
            }
        }

        var queryPageLinks = pagNav.match(/(?:[?&]|&)page=(\d+)/gi);
        if (queryPageLinks) {
            for (var k = 0; k < queryPageLinks.length; k++) {
                var qMatch = queryPageLinks[k].match(/page=(\d+)/i);
                if (qMatch) {
                    var qp = parseInt(qMatch[1], 10);
                    if (!isNaN(qp) && qp > totalPages) totalPages = qp;
                }
            }
        }
    }

    return {
        currentPage: currentPage,
        totalPages: totalPages || 1,
        totalItems: fallbackCount || 0,
        itemsPerPage: fallbackCount > 0 ? fallbackCount : 20
    };
}

// =============================================================================
// PARSERS
// =============================================================================

function parsePornstarsResponse(html) {
    var payload = PluginUtils.unwrapPayload(html);
    var responseHtml = payload.html;
    var paginationHtml = payload.paginationHtml;

    var pornstarsMap = {};
    var parts = responseHtml.split(/<(?:li|div)[^>]*(?:id=["'](?:pornstar|model)-[^"']*["']|class=["'][^"']*(?:pornstar-item|model-item|pornstar-card|pornstar)[^"']*["'])[^>]*>/i);

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var href = "";
        var name = "";

        var linkMatch = itemHtml.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/i);
        if (linkMatch) {
            href = linkMatch[1];
            name = PluginUtils.extractAttr(linkMatch[0], "title");
        }

        if (!name) {
            var nameMatch = itemHtml.match(/<[^>]*class=["'][^"']*(?:pornstar-title|model-title|pornstar-name|model-name|title)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i);
            if (nameMatch) {
                name = nameMatch[1];
            }
        }

        var cleanName = PluginUtils.cleanText(name);
        var slug = PluginUtils.extractSlug(href);

        var avatar = "";
        var imgMatch = itemHtml.match(/<img([^>]+)>/i);
        if (imgMatch) {
            avatar = PluginUtils.extractImageUrl(imgMatch[1]);
            if (!cleanName) {
                cleanName = PluginUtils.cleanText(PluginUtils.extractAttr(imgMatch[1], "alt"));
            }
        }

        var countMatch = itemHtml.match(/<[^>]*class=["'][^"']*(?:videos-count|video-count|count|badge)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i);
        var videoCountText = countMatch ? PluginUtils.cleanText(countMatch[1]) : "";
        var videoCountNum = parseInt(videoCountText.replace(/[^\d]/g, ""), 10) || 0;

        if (slug && !pornstarsMap[slug]) {
            pornstarsMap[slug] = {
                id: slug,
                slug: slug,
                name: cleanName || "Không rõ tên",
                title: cleanName || "Không rõ tên",
                avatarUrl: avatar,
                posterUrl: avatar,
                backdropUrl: avatar,
                videoCount: videoCountNum,
                subtitle: videoCountText || ""
            };
        }
    }

    var pornstars = [];
    for (var key in pornstarsMap) {
        if (pornstarsMap.hasOwnProperty(key)) {
            pornstars.push(pornstarsMap[key]);
        }
    }

    return JSON.stringify({
        items: pornstars,
        pagination: parsePaginationInfo(paginationHtml || responseHtml, pornstars.length)
    });
}

function parseListResponse(html) {
    var payload = PluginUtils.unwrapPayload(html);
    var responseHtml = payload.html;
    var paginationHtml = payload.paginationHtml;

    if (
        responseHtml.indexOf('id="pornstar-') !== -1 ||
        responseHtml.indexOf("id='pornstar-") !== -1 ||
        responseHtml.indexOf("pornstar-title") !== -1 ||
        responseHtml.indexOf("model-title") !== -1
    ) {
        return parsePornstarsResponse(html);
    }

    var moviesMap = {};
    var parts = responseHtml.split(/<li[^>]*id=["']video-[^"']*["'][^>]*>/i);

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var fullUrl = "";
        var title = "";

        var aRegex = /<a([^>]+)>/gi;
        var aMatch;
        while ((aMatch = aRegex.exec(itemHtml)) !== null) {
            var attrs = aMatch[1];
            if (attrs.indexOf("thumbnail") !== -1) {
                fullUrl = PluginUtils.extractAttr(attrs, "href");
                title = PluginUtils.extractAttr(attrs, "title");
                break;
            }
        }

        if (!fullUrl) {
            var anyLink = itemHtml.match(/<a([^>]+)>/i);
            if (anyLink) {
                fullUrl = PluginUtils.extractAttr(anyLink[1], "href");
                if (!title) title = PluginUtils.extractAttr(anyLink[1], "title");
            }
        }

        var slug = PluginUtils.extractSlug(fullUrl);
        var thumb = "";
        var imgMatch = itemHtml.match(/<img([^>]+)>/i);
        if (imgMatch) {
            thumb = PluginUtils.extractImageUrl(imgMatch[1]);
        }

        if (slug) {
            var rawTitle = PluginUtils.cleanText(title);
            if (!rawTitle && imgMatch) {
                rawTitle = PluginUtils.cleanText(PluginUtils.extractAttr(imgMatch[1], "alt"));
            }

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
    }

    var movies = [];
    for (var key in moviesMap) {
        if (moviesMap.hasOwnProperty(key)) {
            movies.push(moviesMap[key]);
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: parsePaginationInfo(paginationHtml || responseHtml, movies.length)
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var rawHtml = String(html || "");
        var titleMatch = rawHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        var descMatch = rawHtml.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        var servers = [];
        var seenUrls = {};

        var btnRegex = /<button([^>]*class=["'][^"']*button_choice_server[^"']*["'][^>]*)>/gi;
        var btnMatch;
        while ((btnMatch = btnRegex.exec(rawHtml)) !== null) {
            var btnAttrs = btnMatch[1];
            var b64url = PluginUtils.extractAttr(btnAttrs, "data-embed");
            var serverName = PluginUtils.cleanText(PluginUtils.extractAttr(btnAttrs, "data-name")) || "Server";
            var decodedUrl = PluginUtils.normalizeStreamUrl(PluginUtils.decodeBase64Safe(b64url));

            if (decodedUrl && !seenUrls[decodedUrl]) {
                seenUrls[decodedUrl] = true;
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

        if (servers.length === 0) {
            var mainPlayerMatch = rawHtml.match(/<(?:iframe|video|embed)[^>]*id=["']main-player["'][^>]*>/i);
            if (mainPlayerMatch) {
                var embedUrl = PluginUtils.normalizeStreamUrl(PluginUtils.extractAttr(mainPlayerMatch[0], "src"));
                if (embedUrl && !seenUrls[embedUrl]) {
                    seenUrls[embedUrl] = true;
                    servers.push({
                        name: "Embed Server",
                        episodes: [{
                            id: embedUrl,
                            name: "Full",
                            slug: "full"
                        }]
                    });
                }
            }
        }

        if (servers.length === 0) {
            var ultimateMatch = rawHtml.match(/src=["'](https?:\/\/[a-z0-9A-Z.-]+\/(?:v|e|embed)\/[^"']+)["']/i);
            if (ultimateMatch) {
                var fallbackEmbed = PluginUtils.normalizeStreamUrl(ultimateMatch[1]);
                if (fallbackEmbed) {
                    servers.push({
                        name: "Default Embed",
                        episodes: [{
                            id: fallbackEmbed,
                            name: "Full",
                            slug: "full"
                        }]
                    });
                }
            }
        }

        if (servers.length === 0) {
            servers.push({
                name: "Unknown",
                episodes: [{
                    id: "",
                    name: "Full",
                    slug: "full"
                }]
            });
        } else {
            servers = PluginUtils.prioritizeServers(servers);
        }

        var thumbMatch = rawHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var thumb = thumbMatch ? PluginUtils.normalizeUrl(thumbMatch[1]) : "";

        var codeMatch = rawHtml.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "Full";

        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["'][^"']*fa-th-list[^"']*["'][^>]*><\/i>([\s\S]*?)<\/a>/gi;
        var categoriesArr = [];
        var catMatch;
        while ((catMatch = categoryRegex.exec(rawHtml)) !== null) {
            var catText = PluginUtils.cleanText(catMatch[2]);
            if (catText) categoriesArr.push(catText);
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
