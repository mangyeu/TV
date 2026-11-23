// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javcc.me";

function normalizeSlug(rawSlug) {
    if (!rawSlug) return "";
    var s = String(rawSlug).trim();
    if (s.indexOf("http") === 0) {
        s = s.replace(/^https?:\/\/[^\/]+/i, "");
    }
    s = s.split("?")[0].split("#")[0];
    s = s.replace(/^\/+|\/+$/g, "");
    return s;
}

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.1",
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
        { name: "Mới cập nhật", slug: "recent" },
        { name: "Không Che", slug: "uncensored-jav" },
        { name: "Khử Che", slug: "reducing-mosaic" },
        { name: "Vietsub", slug: "jav-sub" },
        { name: "Nghiệp Dư", slug: "amateur" }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "popular/today", title: "Xem Nhiều Hôm Nay", type: "Horizontal", path: "" },
        { slug: "uncensored-jav", title: "Jav Uncensored", type: "Horizontal", path: "" },
        { slug: "reducing-mosaic", title: "Reducing Mosaic", type: "Horizontal", path: "" },
        { slug: "jav-sub", title: "Jav Sub", type: "Horizontal", path: "" },
        { slug: "recent", title: "Video Mới Cập Nhật", type: "Grid", path: "" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới nhất", value: "recent" },
            { name: "Xem nhiều hôm nay", value: "popular/today" },
            { name: "Xem nhiều trong tuần", value: "popular/week" },
            { name: "Xem nhiều trong tháng", value: "popular/month" },
            { name: "Xem nhiều tất cả", value: "popular/year" },
            { name: "Nhiều lượt thích", value: "rated/year" }
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

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    var sortPath = (filters.sort && filters.sort !== "recent")
        ? (normalizeSlug(filters.sort) + "/")
        : "";

    var cleanCategory = normalizeSlug(filters.category);
    var cleanSlug = normalizeSlug(slug);
    var targetSlug = cleanCategory || cleanSlug || "recent";

    var isBrowse = false;
    var browsePrefixes = ["recent", "popular", "rated", "discussed", "downloaded", "longest", "watched"];
    for (var i = 0; i < browsePrefixes.length; i++) {
        if (targetSlug.indexOf(browsePrefixes[i]) === 0) {
            isBrowse = true;
            break;
        }
    }

    var finalUrl = BASE_URL + "/" + targetSlug + "/" + (sortPath && targetSlug.indexOf(sortPath.replace(/\/$/, "")) !== 0 ? sortPath : "");
    finalUrl = finalUrl.replace(/([^:]\/)\/+/g, "$1");

    var params = [];
    params.push(isBrowse ? "ajax=browse_videos" : "ajax=1");
    if (page > 1) {
        params.push("page=" + page);
    }

    var separator = finalUrl.indexOf("?") !== -1 ? "&" : "?";
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
    var s = String(slug).trim();
    if (s.indexOf("http") === 0) return s;
    return BASE_URL + "/" + normalizeSlug(s);
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
            .replace(/ /g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }
};

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
        } catch (e) {
            // Fallback to original html
        }
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
                var linkM = attrs.match(/href=["']([^"']+)["']/i);
                var titleM = attrs.match(/title=["']([^"']*)["']/i);
                if (linkM) fullUrl = linkM[1];
                if (titleM) title = titleM[1];
                break;
            }
        }

        var slug = normalizeSlug(fullUrl);

        var thumb = "";
        var imgMatch = itemHtml.match(/<img([^>]+)>/i);
        if (imgMatch) {
            var imgAttrs = imgMatch[1];
            var srcM = imgAttrs.match(/src=["']([^"']+)["']/i);
            var dataSrcM = imgAttrs.match(/data-src=["']([^"']+)["']/i);
            thumb = (dataSrcM && dataSrcM[1]) ? dataSrcM[1] : (srcM ? srcM[1] : "");
        }

        if (slug) {
            var rawTitle = PluginUtils.cleanText(title);
            var durationMatch = itemHtml.match(/<span[^>]*class=["']video-overlay badge transparent["'][^>]*>([\s\S]*?)<\/span>/i);
            var duration = durationMatch ? PluginUtils.cleanText(durationMatch[1]) : "";

            var codeMatch = itemHtml.match(/<span[^>]*class=["']video-overlay1 badge transparent["'][^>]*>([\s\S]*?)<\/span>/i);
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

    var totalPages = 1;
    var currentPage = 1;
    var paginationSrc = paginationHtml || responseHtml;
    var pagNav = "";
    var paginationBlock = paginationSrc.match(/<ul[^>]*class="[^"]*pagination[^"]*"[^>]*>([\s\S]*?)<\/ul>/i);
    if (paginationBlock) {
        pagNav = paginationBlock[1];
    } else if (paginationHtml) {
        pagNav = paginationHtml;
    }

    if (pagNav) {
        var activeMatch = pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<a[^>]*>(\d+)<\/a>/i)
            || pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<span[^>]*>(\d+)<\/span>/i);
        if (activeMatch) {
            currentPage = parseInt(activeMatch[1], 10) || 1;
        }

        var pageLinks = pagNav.match(/href="[^"]*\/(\d+)\/?[^"]*"/gi);
        if (pageLinks) {
            for (var j = 0; j < pageLinks.length; j++) {
                var pMatch = pageLinks[j].match(/\/(\d+)\/?"/);
                if (pMatch) {
                    var p = parseInt(pMatch[1], 10);
                    if (p > totalPages) totalPages = p;
                }
            }
        }

        var queryPageLinks = pagNav.match(/href="[^"]*(?:[?&]|&)page=(\d+)[^"]*"/gi);
        if (queryPageLinks) {
            for (var k = 0; k < queryPageLinks.length; k++) {
                var qMatch = queryPageLinks[k].match(/(?:[?&]|&)page=(\d+)/i);
                if (qMatch) {
                    var qp = parseInt(qMatch[1], 10);
                    if (qp > totalPages) totalPages = qp;
                }
            }
        }
    }

    if (totalPages <= 1) {
        var queryPages = paginationSrc.match(/(?:[?&]|&)page=(\d+)/gi);
        if (queryPages) {
            for (var m = 0; m < queryPages.length; m++) {
                var mMatch = queryPages[m].match(/page=(\d+)/i);
                if (mMatch) {
                    var mp = parseInt(mMatch[1], 10);
                    if (mp > totalPages) totalPages = mp;
                }
            }
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages || 1,
            totalItems: movies.length,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? titleMatch[1].trim() : "";

        var descMatch = html.match(/<p[^>]*class=["']description["'][^>]*>([\s\S]*?)<\/p>/i);
        var description = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "";

        var servers = [];
        var serverRegex = /<button[^>]*class=["'][^"']*button_choice_server[^"']*["'][^>]*data-embed=["']([^"']+)["'][^>]*data-name=["']([^"']+)["']/gi;
        var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var serverMatch;
        var foundServer = false;

        while ((serverMatch = serverRegex.exec(html)) !== null) {
            var b64url = serverMatch[1];
            var serverName = serverMatch[2];
            var decodedUrl = "";
            try {
                if (typeof atob === "function") {
                    decodedUrl = atob(b64url);
                } else {
                    var str = String(b64url).replace(/[=]+$/, "");
                    if (str.length % 4 !== 1) {
                        for (var bc = 0, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? decodedUrl += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
                            buffer = b64chars.indexOf(buffer);
                        }
                    }
                }
            } catch (e) {}

            if (decodedUrl) {
                foundServer = true;
                servers.push({
                    name: serverName,
                    episodes: [{ id: decodedUrl, name: "Full", slug: "full" }]
                });
            }
        }

        if (!foundServer) {
            var mainPlayerStr = 'id="main-player"';
            var idxMain = html.indexOf(mainPlayerStr);
            if (idxMain !== -1) {
                var srcStr = 'src="';
                var idxSrc = html.indexOf(srcStr, idxMain);
                if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                    var startUrl = idxSrc + srcStr.length;
                    var endUrl = html.indexOf('"', startUrl);
                    if (endUrl !== -1) {
                        servers.push({
                            name: "Embed Server",
                            episodes: [{ id: html.substring(startUrl, endUrl), name: "Full", slug: "full" }]
                        });
                        foundServer = true;
                    }
                }
            }
        }

        if (!foundServer) {
            var ultimateMatch = html.match(/src=["'](https?:\/\/[a-z0-9A-Z.-]+\/(v|e|embed)\/[^"']+)["']/i);
            servers.push({
                name: ultimateMatch ? "Default Embed" : "Unknown",
                episodes: [{ id: ultimateMatch ? ultimateMatch[1] : "", name: "Full", slug: "full" }]
            });
        }

        var thumbMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var thumb = thumbMatch ? thumbMatch[1] : "";

        var codeMatch = html.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var code = codeMatch ? codeMatch[1].replace(/<[^>]+>/g, "").trim() : "Full";

        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["']fa fa-th-list["'][^>]*><\/i>([^<]+)<\/a>/gi;
        var categoriesArr = [];
        var catMatch;
        while ((catMatch = categoryRegex.exec(html)) !== null) {
            categoriesArr.push(catMatch[2].replace(/<[^>]+>/g, "").trim());
        }

        return JSON.stringify({
            id: "",
            title: title.replace(/<[^>]+>/g, "").trim(),
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
        var hostUrl = fallbackUrl || "";
        var mainPlayerStr = 'id="main-player"';
        var idxMain = html.indexOf(mainPlayerStr);
        if (idxMain !== -1) {
            var srcStr = 'src="';
            var idxSrc = html.indexOf(srcStr, idxMain);
            if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                var startUrl = idxSrc + srcStr.length;
                var endUrl = html.indexOf('"', startUrl);
                if (endUrl !== -1) {
                    hostUrl = html.substring(startUrl, endUrl);
                }
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
        return JSON.stringify({ url: fallbackUrl || "", headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(html, fallbackUrl) {
    return JSON.stringify({
        url: fallbackUrl || "",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASE_URL + "/"
        },
        subtitles: [],
        isEmbed: false
    });
}

function parseCategoriesResponse(html) {
    var rawHtml = html || "";
    if (rawHtml.trim().indexOf("{") === 0) {
        try {
            var json = JSON.parse(rawHtml);
            if (json && json.html) rawHtml = json.html;
        } catch (e) {}
    }

    var seen = {};
    var categories = [];

    function addCategory(name, rawSlug) {
        var cleanName = PluginUtils.cleanText(name);
        var cleanSlug = normalizeSlug(rawSlug);
        if (!cleanName || !cleanSlug) return;
        // Bỏ qua link không phải danh mục
        if (/^(categories|search|login|register|dmca|contact|popular|recent|rated|tag|tags)(\/|$)/i.test(cleanSlug)) {
            return;
        }
        if (!seen[cleanSlug]) {
            seen[cleanSlug] = true;
            categories.push({
                name: cleanName,
                slug: cleanSlug
            });
        }
    }

    // Cách 1: Thẻ <li id="category-..."> hoặc class="category-item"
    var parts = rawHtml.split(/<li[^>]*(?:id=["']category-[^"']*["']|class=["'][^"']*category[^"']*["'])[^>]*>/i);
    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var linkMatch = itemHtml.match(/href=["']([^"']+)["']/i);
        var nameMatch = itemHtml.match(/<div[^>]*class=["'][^"']*category-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
            || itemHtml.match(/<span[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)
            || itemHtml.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
        if (linkMatch && nameMatch) {
            addCategory(nameMatch[1], linkMatch[1]);
        }
    }

    // Cách 2 (Fallback): Quét toàn bộ thẻ <a> nếu cấu trúc HTML khác
    if (categories.length === 0) {
        var aRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var aMatch;
        while ((aMatch = aRegex.exec(rawHtml)) !== null) {
            addCategory(aMatch[2], aMatch[1]);
        }
    }

    // Cách 3 (Fallback cuối): Dùng danh sách mặc định để menu không bao giờ bị rỗng
    if (categories.length === 0) {
        var fallback = JSON.parse(getFilterConfig()).category || [];
        for (var j = 0; j < fallback.length; j++) {
            addCategory(fallback[j].name, fallback[j].value);
        }
    }

    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
