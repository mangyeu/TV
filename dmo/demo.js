// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javhdz.today";

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.6",
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
// UTILS
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
        var clean = String(url).trim().replace(/&/g, "&");
        if (!clean) return "";
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
        s = s.replace(/^\/+|\/+$/g, "");
        return s;
    },

    extractImageUrl: function (imgAttrs) {
        if (!imgAttrs) return "";
        var attrNames = ["data-src", "data-original", "data-lazy-src", "data-lazy", "src"];
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

    extractAttr: function (tagHtml, attrName) {
        if (!tagHtml || !attrName) return "";
        var re = new RegExp(attrName + "\\s*=\\s*[\"']([^\"']*)[\"']", "i");
        var m = tagHtml.match(re);
        return m ? m[1] : "";
    },

    decodeBase64: function (b64str) {
        if (!b64str) return "";
        var clean = String(b64str).trim().replace(/\s+/g, "");
        try {
            if (typeof atob === "function") {
                return atob(clean);
            }
        } catch (e) { }

        var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var output = "";
        var str = clean.replace(/=+$/, "");
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
    }
};

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlPornstars(filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
    var page = parseInt(filters.page, 10) || 1;
    var sortPath = (filters.sort && filters.sort !== "default" && filters.sort !== "recent")
        ? (String(filters.sort).replace(/^\/+|\/+$/g, "") + "/")
        : "";

    var url = BASE_URL + "/pornstars/" + sortPath;
    if (page > 1) {
        url += page + "/";
    }
    return url;
}

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    var cleanInputSlug = PluginUtils.extractSlug(slug || "recent");
    var targetSlug = filters.category
        ? PluginUtils.extractSlug(filters.category)
        : (cleanInputSlug || "recent");

    // Nếu là danh sách diễn viên thì chuyển sang luồng pornstars
    if (targetSlug.indexOf("pornstars") === 0 || targetSlug.indexOf("pornstar") === 0 || targetSlug.indexOf("models") === 0) {
        var pUrl = BASE_URL + "/" + targetSlug.replace(/\/+$/, "") + "/";
        if (page > 1) {
            pUrl += page + "/";
        }
        return pUrl;
    }

    var sortClean = (filters.sort && filters.sort !== "recent")
        ? String(filters.sort).replace(/^\/+|\/+$/g, "")
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
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
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

    var paginationBlock = pagNav.match(/<ul[^>]*class=["'][^"]*pagination[^"]*["'][^>]*>([\s\S]*?)<\/ul>/i)
        || pagNav.match(/<div[^>]*class=["'][^"]*pagination[^"]*["'][^>]*>([\s\S]*?)<\/div>/i)
        || pagNav.match(/<nav[^>]*class=["'][^"]*pagination[^"]*["'][^>]*>([\s\S]*?)<\/nav>/i);
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
    var responseHtml = html || "";
    var paginationHtml = "";

    if (responseHtml.trim().indexOf("{") === 0) {
        try {
            var data = JSON.parse(responseHtml);
            if (data && data.html) {
                responseHtml = data.html;
                if (data.pagination) {
                    paginationHtml = data.pagination;
                }
            }
        } catch (e) { }
    }

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
    var responseHtml = html || "";
    var paginationHtml = "";

    if (responseHtml.trim().indexOf("{") === 0) {
        try {
            var data = JSON.parse(responseHtml);
            if (data && data.html) {
                responseHtml = data.html;
                if (data.pagination) {
                    paginationHtml = data.pagination;
                }
            }
        } catch (e) { }
    }

    // Nếu response là danh sách pornstar/model khi gọi qua getUrlList("pornstars")
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
            if (!rawTitle) {
                var imgAlt = imgMatch ? PluginUtils.extractAttr(imgMatch[1], "alt") : "";
                rawTitle = PluginUtils.cleanText(imgAlt);
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
        var rawHtml = html || "";
        var titleMatch = rawHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        var descMatch = rawHtml.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        var servers = [];
        var foundServer = false;

        var btnRegex = /<button([^>]*class=["'][^"']*button_choice_server[^"']*["'][^>]*)>/gi;
        var btnMatch;
        while ((btnMatch = btnRegex.exec(rawHtml)) !== null) {
            var btnAttrs = btnMatch[1];
            var b64url = PluginUtils.extractAttr(btnAttrs, "data-embed");
            var serverName = PluginUtils.cleanText(PluginUtils.extractAttr(btnAttrs, "data-name")) || "Server";
            var decodedUrl = PluginUtils.decodeBase64(b64url);

            if (decodedUrl) {
                foundServer = true;
                servers.push({
                    name: serverName,
                    episodes: [{
                        id: PluginUtils.normalizeUrl(decodedUrl),
                        name: "Full",
                        slug: "full"
                    }]
                });
            }
        }

        if (!foundServer) {
            var mainPlayerMatch = rawHtml.match(/<(?:iframe|video|embed)[^>]*id=["']main-player["'][^>]*>/i);
            if (mainPlayerMatch) {
                var embedUrl = PluginUtils.extractAttr(mainPlayerMatch[0], "src");
                if (embedUrl) {
                    foundServer = true;
                    servers.push({
                        name: "Embed Server",
                        episodes: [{
                            id: PluginUtils.normalizeUrl(embedUrl),
                            name: "Full",
                            slug: "full"
                        }]
                    });
                }
            }
        }

        if (!foundServer) {
            var ultimateMatch = rawHtml.match(/src=["'](https?:\/\/[a-z0-9A-Z.-]+\/(?:v|e|embed)\/[^"']+)["']/i);
            if (ultimateMatch) {
                servers.push({
                    name: "Default Embed",
                    episodes: [{
                        id: ultimateMatch[1],
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
        var rawHtml = html || "";
        var hostUrl = PluginUtils.normalizeUrl(fallbackUrl || "");

        var mainPlayerMatch = rawHtml.match(/<(?:iframe|video|embed)[^>]*id=["']main-player["'][^>]*>/i);
        if (mainPlayerMatch) {
            var srcVal = PluginUtils.extractAttr(mainPlayerMatch[0], "src");
            if (srcVal) {
                hostUrl = PluginUtils.normalizeUrl(srcVal);
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
        return JSON.stringify({
            url: PluginUtils.normalizeUrl(fallbackUrl || ""),
            headers: {},
            subtitles: []
        });
    }
}

function parseEmbedResponse(html, fallbackUrl) {
    var rawHtml = html || "";
    var resolvedUrl = PluginUtils.normalizeUrl(fallbackUrl || "");

    var streamMatch = rawHtml.match(/['"](https?:\/\/[^'"\s]+(?:\.m3u8|\.mp4)[^'"\s]*)['"]/i);
    if (streamMatch && streamMatch[1]) {
        resolvedUrl = streamMatch[1];
    }

    return JSON.stringify({
        url: resolvedUrl,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASE_URL + "/"
        },
        subtitles: [],
        isEmbed: false
    });
}

function parseCategoriesResponse(html) {
    var categories = [];
    var parts = (html || "").split(/<li[^>]*id=["']category-[^"']*["'][^>]*>/i);
    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var linkMatch = itemHtml.match(/href=["']\/([^"']+)[\/]?["']/i);
        var nameMatch = itemHtml.match(/<div[^>]*class=["'][^"']*category-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

        if (linkMatch && nameMatch) {
            var slug = PluginUtils.extractSlug(linkMatch[1]);
            var name = PluginUtils.cleanText(nameMatch[1]);
            if (slug && name) {
                categories.push({
                    name: name,
                    slug: slug
                });
            }
        }
    }
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
