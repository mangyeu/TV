// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javhdz.today";

var DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": BASE_URL + "/"
};

var PORNSTARS_LIST = [
    { name: "Hatano Yui", slug: "pornstar/hatano-yui" },
    { name: "Aika", slug: "pornstar/aika" },
    { name: "Hasumi Kurea", slug: "pornstar/hasumi-kurea" },
    { name: "Iioka Kanako", slug: "pornstar/iioka-kanako" },
    { name: "Nagisa Mitsuki", slug: "pornstar/nagisa-mitsuki" },
    { name: "Shinoda Yuu", slug: "pornstar/shinoda-yuu" },
    { name: "Matsumoto Ichika", slug: "pornstar/matsumoto-ichika" },
    { name: "Hamasaki Mao", slug: "pornstar/hamasaki-mao" },
    { name: "Haruna Hana", slug: "pornstar/haruna-hana" },
    { name: "Mitani Akari", slug: "pornstar/mitani-akari" },
    { name: "Ootsuki Hibiki", slug: "pornstar/ootsuki-hibiki" },
    { name: "Uehara Ai", slug: "pornstar/uehara-ai" },
    { name: "Seina Arisa", slug: "pornstar/seina-arisa" },
    { name: "Hachino Tsubasa", slug: "pornstar/hachino-tsubasa" },
    { name: "Yayoi Mizuki", slug: "pornstar/yayoi-mizuki" },
    { name: "Kimijima Mio", slug: "pornstar/kimijima-mio" }
];

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
        { name: "Mới cập nhật", slug: "recent" },
        { name: "Không Che", slug: "uncensored-jav" },
        { name: "Khử Che", slug: "reducing-mosaic" },
        { name: "Vietsub", slug: "jav-sub" },
        { name: "Nghiệp Dư", slug: "amateur" },
        { name: "Diễn Viên", slug: "pornstar" }
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
        ],
        pornstar: PORNSTARS_LIST
    });
}

function getPornstars(page, pageSize) {
    if (typeof page === "undefined" || page === null) {
        return JSON.stringify(PORNSTARS_LIST);
    }

    var currentPage = parseInt(page, 10) || 1;
    var perPage = parseInt(pageSize, 10) || 10;
    if (currentPage < 1) currentPage = 1;
    if (perPage < 1) perPage = 10;

    var totalItems = PORNSTARS_LIST.length;
    var totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * perPage;
    var end = start + perPage;

    return JSON.stringify({
        items: PORNSTARS_LIST.slice(start, end),
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: perPage
        }
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
    if (page < 1) page = 1;

    var sortPath = (filters.sort && filters.sort !== "recent")
        ? (String(filters.sort).replace(/^\/+|\/+$/g, "") + "/")
        : "";

    var targetSlug = filters.pornstar || filters.category || slug || "recent";
    targetSlug = String(targetSlug).trim();

    if (targetSlug.indexOf("http") === 0) {
        var cleanFull = targetSlug.replace(/\/+$/, "");
        var sepFull = (cleanFull.indexOf("?") !== -1) ? "&" : "?";
        return cleanFull + "/" + sepFull + (page > 1 ? "ajax=1&page=" + page : "ajax=1");
    }

    targetSlug = targetSlug.replace(/^\/+|\/+$/g, "");
    if (!targetSlug) targetSlug = "recent";

    var isBrowse = false;
    var browsePrefixes = ["recent", "popular", "rated", "discussed", "downloaded", "longest", "watched"];
    for (var i = 0; i < browsePrefixes.length; i++) {
        if (targetSlug.indexOf(browsePrefixes[i]) === 0) {
            isBrowse = true;
            break;
        }
    }

    var finalUrl = BASE_URL + "/" + targetSlug + "/" + sortPath;
    var params = [isBrowse ? "ajax=browse_videos" : "ajax=1"];
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
    if (page < 1) page = 1;

    var url = BASE_URL + "/search/video/?s=" + encodeURIComponent(keyword || "") + "&ajax=1";
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    var s = String(slug || "").trim();
    if (!s) return BASE_URL;
    if (s.indexOf("http") === 0) return s;
    if (s.indexOf("/") === 0) return BASE_URL + s;
    return BASE_URL + "/" + s;
}

function getUrlCategories() { return BASE_URL + "/categories/"; }
function getUrlPornstarsPage(page) {
    var p = parseInt(page, 10) || 1;
    return p > 1 ? (BASE_URL + "/pornstar/" + p + "/") : (BASE_URL + "/pornstar/");
}
function getUrlCountries() { return BASE_URL + "/"; }
function getUrlYears() { return BASE_URL + "/"; }

// =============================================================================
// UTILITIES & SERVER PROBE / RANKING
// =============================================================================

var PluginUtils = {
    cleanText: function (text) {
        if (!text) return "";
        return String(text)
            .replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    },
    normalizeUrl: function (url) {
        if (!url) return "";
        var u = String(url).trim();
        if (u.indexOf("//") === 0) return "https:" + u;
        if (u.indexOf("/") === 0) return BASE_URL + u;
        return u;
    },
    decodeBase64: function (b64Str) {
        var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var clean = String(b64Str || "").replace(/[^A-Za-z0-9+/=]/g, "");
        if (!clean) return "";

        if (typeof atob === "function") {
            try {
                return atob(clean);
            } catch (e) {}
        }

        var output = "";
        var str = clean.replace(/=+$/, "");
        if (str.length % 4 === 1) return "";

        for (var bc = 0, bs, buffer, idx = 0; (buffer = str.charAt(idx++)); ) {
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
    extractStreamUrl: function (html) {
        if (!html) return "";
        var text = String(html);
        var patterns = [
            /["'](https?:\/\/[^"'\\\s]+\.m3u8[^"'\\\s]*)["']/i,
            /["'](https?:\/\/[^"'\\\s]+\.mp4[^"'\\\s]*)["']/i
        ];
        for (var i = 0; i < patterns.length; i++) {
            var m = text.match(patterns[i]);
            if (m && m[1]) {
                return m[1].replace(/\\\//g, "/");
            }
        }
        return "";
    }
};

function extractServersFromHtml(html) {
    var servers = [];
    var btnRegex = /<button\b([^>]*\bbutton_choice_server\b[^>]*)>/gi;
    var btnMatch;

    while ((btnMatch = btnRegex.exec(html)) !== null) {
        var attrs = btnMatch[1];

        var nameMatch = attrs.match(/\bdata-name=["']([^"']*)["']/i);
        var embedsMatch = attrs.match(/\bdata-embeds=["']([^"']*)["']/i);
        var embedMatch = attrs.match(/\bdata-embed=["']([^"']*)["']/i);

        var serverName = nameMatch ? PluginUtils.cleanText(nameMatch[1]) : "Server";
        var episodes = [];

        if (embedsMatch && embedsMatch[1]) {
            var decodedList = PluginUtils.decodeBase64(embedsMatch[1]);
            try {
                var urls = JSON.parse(decodedList);
                if (urls && urls.length) {
                    for (var i = 0; i < urls.length; i++) {
                        var normMirror = PluginUtils.normalizeUrl(urls[i]);
                        if (normMirror) {
                            episodes.push({
                                id: normMirror,
                                name: urls.length > 1 ? ("Mirror " + (i + 1)) : "Full",
                                slug: "full-" + (i + 1)
                            });
                        }
                    }
                }
            } catch (e) {}
        }

        if (episodes.length === 0 && embedMatch && embedMatch[1]) {
            var decodedSingle = PluginUtils.decodeBase64(embedMatch[1]);
            var normSingle = PluginUtils.normalizeUrl(decodedSingle);
            if (normSingle) {
                episodes.push({
                    id: normSingle,
                    name: "Full",
                    slug: "full"
                });
            }
        }

        if (episodes.length > 0) {
            servers.push({
                name: serverName,
                episodes: episodes
            });
        }
    }

    return servers;
}

function rankAndFilterServers(rawServers, options) {
    var opts = options || {};
    var enableProbe = !!opts.enableProbe;
    var timeoutMs = opts.timeoutMs || 2500;
    var maxProbePerServer = opts.maxProbePerServer || 2;

    var priorityKeywords = [
        "fastserver", "topserver", "maxcloud", "myserver", "bpserver",
        "cloudwish", "mycloudz", "upnshare", "dood"
    ];

    function getPriorityScore(serverName) {
        var lower = String(serverName || "").toLowerCase();
        for (var i = 0; i < priorityKeywords.length; i++) {
            if (lower.indexOf(priorityKeywords[i]) !== -1) {
                return priorityKeywords.length - i;
            }
        }
        return 0;
    }

    function isUrlReachable(url) {
        if (!url || url.indexOf("http") !== 0) return false;
        if (!enableProbe || typeof XMLHttpRequest === "undefined") return true;

        try {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            if (typeof xhr.timeout === "number") {
                xhr.timeout = timeoutMs;
            }
            try {
                xhr.setRequestHeader("Referer", DEFAULT_HEADERS.Referer);
                xhr.setRequestHeader("User-Agent", DEFAULT_HEADERS["User-Agent"]);
            } catch (eHeader) {}

            xhr.send(null);
            if (xhr.status < 200 || xhr.status >= 400) return false;

            var body = String(xhr.responseText || "");
            if (!body || body.length < 30) return false;

            var lowerBody = body.toLowerCase();
            var deadMarkers = [
                "file was deleted",
                "video not found",
                "404 not found",
                "video is processing",
                "encoding in progress",
                "cf-browser-verification"
            ];
            for (var m = 0; m < deadMarkers.length; m++) {
                if (lowerBody.indexOf(deadMarkers[m]) !== -1) {
                    return false;
                }
            }
            return true;
        } catch (eReq) {
            return false;
        }
    }

    var indexed = [];
    for (var i = 0; i < rawServers.length; i++) {
        indexed.push({
            idx: i,
            score: getPriorityScore(rawServers[i].name),
            server: rawServers[i]
        });
    }

    indexed.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.idx - b.idx;
    });

    var workingServers = [];
    var fallbackServers = [];

    for (var s = 0; s < indexed.length; s++) {
        var srv = indexed[s].server;
        var seenUrls = {};
        var validEpisodes = [];
        var probedCount = 0;
        var hasWorkingEp = false;

        for (var e = 0; e < srv.episodes.length; e++) {
            var ep = srv.episodes[e];
            if (!ep || !ep.id || seenUrls[ep.id]) continue;
            seenUrls[ep.id] = true;

            if (enableProbe && probedCount < maxProbePerServer) {
                probedCount++;
                if (isUrlReachable(ep.id)) {
                    validEpisodes.push(ep);
                    hasWorkingEp = true;
                }
            } else {
                validEpisodes.push(ep);
            }
        }

        if (validEpisodes.length > 0) {
            var cleanSrv = {
                name: srv.name,
                episodes: validEpisodes
            };
            if (enableProbe && hasWorkingEp) {
                workingServers.push(cleanSrv);
            } else {
                fallbackServers.push(cleanSrv);
            }
        }
    }

    return workingServers.concat(fallbackServers);
}

// =============================================================================
// PARSERS
// =============================================================================

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
        } catch (e) {}
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

        var slug = fullUrl;
        if (slug && slug.indexOf("http") === 0) {
            slug = slug.replace(/^https?:\/\/[^/]+\/?/, "");
        } else if (slug && slug.indexOf("/") === 0) {
            slug = slug.substring(1);
        }

        var thumb = "";
        var imgMatch = itemHtml.match(/<img([^>]+)>/i);
        if (imgMatch) {
            var imgAttrs = imgMatch[1];
            var srcM = imgAttrs.match(/src=["']([^"']+)["']/i);
            var dataSrcM = imgAttrs.match(/data-src=["']([^"']+)["']/i);
            thumb = (dataSrcM && dataSrcM[1]) ? dataSrcM[1] : (srcM ? srcM[1] : "");
            thumb = PluginUtils.normalizeUrl(thumb);
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
                var pMatch = pageLinks[j].match(/\/(\d+)\/?[^"]*$/);
                if (pMatch) {
                    var p = parseInt(pMatch[1], 10);
                    if (p > totalPages) totalPages = p;
                }
            }
        }

        var queryPageLinks = pagNav.match(/href="[^"]*(?:[?&]|&)page=(\d+)[^"]*"/gi);
        if (queryPageLinks) {
            for (var j = 0; j < queryPageLinks.length; j++) {
                var pMatch = queryPageLinks[j].match(/(?:[?&]|&)page=(\d+)/i);
                if (pMatch) {
                    var p = parseInt(pMatch[1], 10);
                    if (p > totalPages) totalPages = p;
                }
            }
        }
    }

    if (totalPages <= 1) {
        var queryPages = paginationSrc.match(/(?:[?&]|&)page=(\d+)/gi);
        if (queryPages) {
            for (var k = 0; k < queryPages.length; k++) {
                var qMatch = queryPages[k].match(/page=(\d+)/i);
                if (qMatch) {
                    var qp = parseInt(qMatch[1], 10);
                    if (qp > totalPages) totalPages = qp;
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
        var srcHtml = html || "";
        var titleMatch = srcHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        if (!title) {
            var crumbMatch = srcHtml.match(/<li[^>]*class=["'][^"']*active[^"']*["'][^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
            if (crumbMatch) title = PluginUtils.cleanText(crumbMatch[1]);
        }

        var descMatch = srcHtml.match(/<p[^>]*class=["']description["'][^>]*>([\s\S]*?)<\/p>/i);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        var servers = extractServersFromHtml(srcHtml);

        if (servers.length === 0) {
            var mainPlayerStr = 'id="main-player"';
            var idxMain = srcHtml.indexOf(mainPlayerStr);
            if (idxMain !== -1) {
                var srcStr = 'src="';
                var idxSrc = srcHtml.indexOf(srcStr, idxMain);
                if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                    var startUrl = idxSrc + srcStr.length;
                    var endUrl = srcHtml.indexOf('"', startUrl);
                    if (endUrl !== -1) {
                        var embedUrl = PluginUtils.normalizeUrl(srcHtml.substring(startUrl, endUrl));
                        if (embedUrl) {
                            servers.push({
                                name: "Embed Server",
                                episodes: [{ id: embedUrl, name: "Full", slug: "full" }]
                            });
                        }
                    }
                }
            }
        }

        if (servers.length === 0) {
            var ultimateMatch = srcHtml.match(/src=["'](https?:\/\/[a-z0-9A-Z.-]+\/(v|e|embed)\/[^"']+)["']/i);
            if (ultimateMatch) {
                servers.push({
                    name: "Default Embed",
                    episodes: [{ id: ultimateMatch[1], name: "Full", slug: "full" }]
                });
            } else {
                servers.push({
                    name: "Unknown",
                    episodes: [{ id: "", name: "Full", slug: "full" }]
                });
            }
        }

        // Bật enableProbe: true chỉ khi engine hỗ trợ sync XHR không gây block UI
        servers = rankAndFilterServers(servers, {
            enableProbe: false,
            timeoutMs: 2500,
            maxProbePerServer: 2
        });

        var thumbMatch = srcHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var thumb = thumbMatch ? PluginUtils.normalizeUrl(thumbMatch[1]) : "";
        if (!thumb) {
            var posterBgMatch = srcHtml.match(/id=["']player-poster["'][^>]*background-image:\s*url\(([^)]+)\)/i)
                || srcHtml.match(/background-image:\s*url\(([^)]+)\)/i);
            if (posterBgMatch && posterBgMatch[1]) {
                thumb = PluginUtils.normalizeUrl(posterBgMatch[1].replace(/["']/g, ""));
            }
        }

        var codeMatch = srcHtml.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "Full";

        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["']fa fa-th-list["'][^>]*><\/i>([^<]+)<\/a>/gi;
        var categoriesArr = [];
        var catMatch;
        while ((catMatch = categoryRegex.exec(srcHtml)) !== null) {
            categoriesArr.push(PluginUtils.cleanText(catMatch[2]));
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
        var srcHtml = html || "";
        var hostUrl = PluginUtils.normalizeUrl(fallbackUrl || "");

        var mainPlayerStr = 'id="main-player"';
        var idxMain = srcHtml.indexOf(mainPlayerStr);
        if (idxMain !== -1) {
            var srcStr = 'src="';
            var idxSrc = srcHtml.indexOf(srcStr, idxMain);
            if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                var startUrl = idxSrc + srcStr.length;
                var endUrl = srcHtml.indexOf('"', startUrl);
                if (endUrl !== -1) {
                    var extractedSrc = PluginUtils.normalizeUrl(srcHtml.substring(startUrl, endUrl));
                    if (extractedSrc) hostUrl = extractedSrc;
                }
            }
        }

        var directStream = PluginUtils.extractStreamUrl(srcHtml);
        if (directStream) {
            return JSON.stringify({
                url: directStream,
                headers: DEFAULT_HEADERS,
                subtitles: [],
                isEmbed: false
            });
        }

        return JSON.stringify({
            url: hostUrl,
            headers: DEFAULT_HEADERS,
            subtitles: [],
            isEmbed: true,
            embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
        });
    } catch (e) {
        return JSON.stringify({ url: fallbackUrl || "", headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(html, fallbackUrl) {
    try {
        var srcHtml = html || "";
        var streamUrl = PluginUtils.extractStreamUrl(srcHtml);
        if (streamUrl) {
            return JSON.stringify({
                url: streamUrl,
                headers: DEFAULT_HEADERS,
                subtitles: [],
                isEmbed: false
            });
        }

        var iframeMatch = srcHtml.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        var nextUrl = iframeMatch ? PluginUtils.normalizeUrl(iframeMatch[1]) : PluginUtils.normalizeUrl(fallbackUrl || "");

        return JSON.stringify({
            url: nextUrl,
            headers: DEFAULT_HEADERS,
            subtitles: [],
            isEmbed: !!iframeMatch
        });
    } catch (e) {
        return JSON.stringify({ url: fallbackUrl || "", headers: DEFAULT_HEADERS, subtitles: [], isEmbed: false });
    }
}

function parseCategoriesResponse(html) {
    var categories = [];
    var parts = (html || "").split(/<li[^>]*id=["']category-[^"']*["'][^>]*>/i);
    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var linkMatch = itemHtml.match(/href=["']\/([^"']+)[\/]?["']/i);
        var nameMatch = itemHtml.match(/<div[^>]*class=["']category-title["'][^>]*>([\s\S]*?)<\/div>/i);

        if (linkMatch && nameMatch) {
            var slug = linkMatch[1].replace(/\/+$/, "");
            var name = PluginUtils.cleanText(nameMatch[1]);
            categories.push({
                name: name,
                slug: slug
            });
        }
    }
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
