// =============================================================================
// JAVHD PLUGIN - COMPLETE (v1.0.9)
// =============================================================================

// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.9",
        "baseUrl": "https://javhdz.today",
        "iconUrl": "https://javhdz.today/favicon.ico",
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
        { name: 'Nghiệp Dư', slug: 'amateur' }
    ]);
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

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = parseInt(filters.page) || 1;
    var sortPath = (filters.sort && filters.sort !== 'recent') ? (filters.sort + '/') : '';

    var targetSlug = slug || 'recent';
    if (filters.category) targetSlug = filters.category;

    var isBrowse = false;
    var browsePrefixes = ['recent', 'popular', 'rated', 'discussed', 'downloaded', 'longest', 'watched'];
    for (var i = 0; i < browsePrefixes.length; i++) {
        if (targetSlug.indexOf(browsePrefixes[i]) === 0) { isBrowse = true; break; }
    }

    var finalUrl = "";
    if (filters.category) {
        finalUrl = "https://javhdz.today/" + filters.category + "/" + sortPath;
    } else if (!slug || slug === 'recent') {
        finalUrl = "https://javhdz.today/recent/";
    } else if (slug.indexOf("http") === 0) {
        finalUrl = slug.replace(/\/+$/, '') + '/';
    } else {
        if (slug.indexOf("/") === 0) slug = slug.replace(/^\/+/, '').replace(/\/+$/, '');
        finalUrl = "https://javhdz.today/" + slug + "/" + sortPath;
    }

    var params = [isBrowse ? "ajax=browse_videos" : "ajax=1"];
    if (page > 1) params.push("page=" + page);

    var separator = (finalUrl.indexOf('?') !== -1) ? '&' : '?';
    return finalUrl + separator + params.join('&');
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = parseInt(filters.page) || 1;
    var url = "https://javhdz.today/search/video/?s=" + encodeURIComponent(keyword) + "&ajax=1";
    if (page > 1) url += "&page=" + page;
    return url;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return "https://javhdz.today" + slug;
    return "https://javhdz.today/" + slug;
}

function getUrlCategories() { return "https://javhdz.today/categories/"; }
function getUrlCountries() { return "https://javhdz.today/"; }
function getUrlYears() { return "https://javhdz.today/"; }

// =============================================================================
// HELPERS
// =============================================================================

var PluginUtils = {
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
            .replace(/\s+/g, " ").trim();
    },
    decodeBase64: function (input) {
        if (!input) return "";
        var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        try {
            if (typeof atob === 'function') return atob(input);
            var str = String(input).replace(/[=]+$/, '');
            var output = "";
            if (str.length % 4 === 1) return "";
            for (var bc = 0, bs, buffer, idx = 0; (buffer = str.charAt(idx++)); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
                buffer = b64chars.indexOf(buffer);
            }
            return output;
        } catch (e) { return ""; }
    },
    b64UrlToStd: function (s) {
        if (!s) return "";
        s = String(s).replace(/-/g, "+").replace(/_/g, "/");
        while (s.length % 4 !== 0) s += "=";
        return s;
    },
    _findUrlInObj: function (obj) {
        if (!obj) return "";
        if (typeof obj === "string") return /^https?:\/\//i.test(obj) ? obj : "";
        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                var r = PluginUtils._findUrlInObj(obj[i]);
                if (r) return r;
            }
            return "";
        }
        if (typeof obj === "object") {
            for (var k in obj) {
                if (!obj.hasOwnProperty(k)) continue;
                var r2 = PluginUtils._findUrlInObj(obj[k]);
                if (r2) return r2;
            }
        }
        return "";
    },
    decodeEmbedPayload: function (p) {
        if (!p) return "";
        var std = PluginUtils.b64UrlToStd(p);
        var decoded = PluginUtils.decodeBase64(std);
        if (!decoded) return "";
        try {
            var obj = JSON.parse(decoded);
            var candidates = [obj.m3u8, obj.hls, obj.src, obj.url, obj.file, obj.video_url, obj.link, obj.link_m3u8, obj.link_embed, obj.stream, obj.play_url];
            for (var i = 0; i < candidates.length; i++) {
                if (candidates[i] && typeof candidates[i] === "string" && /^https?:\/\//i.test(candidates[i])) return candidates[i];
            }
            var found = PluginUtils._findUrlInObj(obj);
            if (found) return found;
        } catch (e) { }
        if (/^https?:\/\//i.test(decoded)) return decoded;
        var m = decoded.match(/(https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4)[^\s"'<>]*)/i);
        if (m) return m[1];
        var any = decoded.match(/(https?:\/\/[^\s"'<>]+)/i);
        return any ? any[1] : "";
    },
    isDirectStream: function (url) {
        return /\.(m3u8|mp4)(\?|$)/i.test(url || "");
    }
};

// =============================================================================
// LIST PARSER
// =============================================================================

function parseListResponse(html) {
    var responseHtml = html || "";
    var paginationHtml = "";

    if (responseHtml.trim().indexOf('{') === 0) {
        try {
            var data = JSON.parse(responseHtml);
            if (data && data.html) {
                responseHtml = data.html;
                if (data.pagination) paginationHtml = data.pagination;
            }
        } catch (e) { }
    }

    var moviesMap = {};
    var parts = responseHtml.split(/<li[^>]*id=["']video-[^"']*["'][^>]*>/);

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var fullUrl = "", title = "";

        var aRegex = /<a([^>]+)>/g;
        var aMatch;
        while ((aMatch = aRegex.exec(itemHtml)) !== null) {
            var attrs = aMatch[1];
            if (attrs.indexOf('thumbnail') !== -1) {
                var linkM = attrs.match(/href=["']([^"']+)["']/);
                var titleM = attrs.match(/title=["']([^"']*)["']/);
                if (linkM) fullUrl = linkM[1];
                if (titleM) title = titleM[1];
                break;
            }
        }

        var slug = fullUrl;
        if (slug && slug.indexOf('/') === 0) slug = slug.substring(1);

        var thumb = "";
        var imgMatch = itemHtml.match(/<img([^>]+)>/);
        if (imgMatch) {
            var srcM = imgMatch[1].match(/src=["']([^"']+)["']/);
            var dataSrcM = imgMatch[1].match(/data-src=["']([^"']+)["']/);
            thumb = (dataSrcM && dataSrcM[1]) ? dataSrcM[1] : (srcM ? srcM[1] : "");
        }

        if (slug) {
            var rawTitle = PluginUtils.cleanText(title);
            var durM = itemHtml.match(/<span[^>]*class=["']video-overlay badge transparent["'][^>]*>([\s\S]*?)<\/span>/);
            var codeM = itemHtml.match(/<span[^>]*class=["']video-overlay1 badge transparent["'][^>]*>([\s\S]*?)<\/span>/);
            var labels = [];
            if (durM) labels.push(PluginUtils.cleanText(durM[1]));
            if (codeM) labels.push(PluginUtils.cleanText(codeM[1]));

            if (!moviesMap[slug]) {
                moviesMap[slug] = {
                    id: slug,
                    title: rawTitle || "Video",
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    year: 0,
                    quality: "HD",
                    episode_current: labels.join(" | ") || "HD",
                    lang: "Vietsub"
                };
            }
        }
    }

    var movies = [];
    for (var key in moviesMap) if (moviesMap.hasOwnProperty(key)) movies.push(moviesMap[key]);

    var totalPages = 1, currentPage = 1;
    var paginationSrc = paginationHtml || responseHtml;
    var pagNav = "";
    var pagBlock = paginationSrc.match(/<ul[^>]*class="[^"]*pagination[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
    if (pagBlock) pagNav = pagBlock[1];
    else if (paginationHtml) pagNav = paginationHtml;

    if (pagNav) {
        var activeM = pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<(?:a|span)[^>]*>(\d+)<\/(?:a|span)>/i);
        if (activeM) currentPage = parseInt(activeM[1]) || 1;

        var pageLinks = pagNav.match(/href="[^"]*\/(\d+)\/?[^"]*"/g);
        if (pageLinks) for (var j = 0; j < pageLinks.length; j++) {
            var pm = pageLinks[j].match(/\/(\d+)\/?"/);
            if (pm) { var p = parseInt(pm[1]); if (p > totalPages) totalPages = p; }
        }
        var qpLinks = pagNav.match(/href="[^"]*(?:[?&]|&amp;)page=(\d+)[^"]*"/g);
        if (qpLinks) for (var j2 = 0; j2 < qpLinks.length; j2++) {
            var pm2 = qpLinks[j2].match(/(?:[?&]|&amp;)page=(\d+)/);
            if (pm2) { var p2 = parseInt(pm2[1]); if (p2 > totalPages) totalPages = p2; }
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

function parseSearchResponse(html) { return parseListResponse(html); }

// =============================================================================
// DETAIL PARSER (CORE FIX)
// =============================================================================

function parseMovieDetail(html) {
    try {
        html = html || "";

        // --- TITLE: og:title ưu tiên ---
        var title = "";
        var ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        if (ogTitle) title = PluginUtils.cleanText(ogTitle[1]);
        if (!title) {
            var h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            if (h1) title = PluginUtils.cleanText(h1[1]);
        }
        if (!title) {
            var bc = html.match(/<li[^>]*class=["']active["'][^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
            if (bc) title = PluginUtils.cleanText(bc[1]);
        }
        if (!title) {
            var t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            if (t) title = PluginUtils.cleanText(t[1]);
        }

        // --- DESCRIPTION ---
        var description = "";
        var ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
        if (ogDesc) description = PluginUtils.cleanText(ogDesc[1]);

        // --- THUMB: og:image ưu tiên ---
        var thumb = "";
        var ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogImg) thumb = ogImg[1];

        // --- VIDEO_ID: input hidden ---
        var videoId = "";
        var vidInput = html.match(/<input[^>]*name=["']video_id["'][^>]*value=["'](\d+)["']/i);
        if (vidInput) videoId = vidInput[1];

        // --- SERVERS ---
        var servers = [];

        // (A) data-embeds base64 JSON array
        var buttonRegex = /<button[^>]*class=["'][^"']*button_choice_server[^"']*["'][^>]*>[\s\S]*?<\/button>/gi;
        var btnMatch;
        while ((btnMatch = buttonRegex.exec(html)) !== null) {
            var btnHtml = btnMatch[0];
            var nameM = btnHtml.match(/data-name=["']([^"']*)["']/i);
            var embedsM = btnHtml.match(/data-embeds=["']([^"']*)["']/i);
            var serverName = nameM ? nameM[1].trim() : "Server";
            var episodes = [];

            if (embedsM) {
                var decoded = PluginUtils.decodeBase64(PluginUtils.b64UrlToStd(embedsM[1]));
                if (decoded) {
                    try {
                        var urlList = JSON.parse(decoded);
                        if (Array.isArray(urlList)) {
                            for (var u = 0; u < urlList.length; u++) {
                                var url = String(urlList[u] || "").trim();
                                if (!url) continue;
                                episodes.push({ id: url, name: "Full", slug: "full", embed: url });
                            }
                        }
                    } catch (e) { }
                }
            }
            if (episodes.length > 0) servers.push({ name: serverName, episodes: episodes });
        }

        // (B) data-embed đơn
        if (servers.length === 0) {
            var oldRe = /<button[^>]*class=["'][^"']*button_choice_server[^"']*["'][^>]*data-embed=["']([^"']+)["'][^>]*data-name=["']([^"']+)["']/gi;
            var oldM;
            while ((oldM = oldRe.exec(html)) !== null) {
                var decodedUrl = PluginUtils.decodeBase64(PluginUtils.b64UrlToStd(oldM[1]));
                if (decodedUrl) {
                    servers.push({
                        name: oldM[2] || "Server",
                        episodes: [{ id: decodedUrl, name: "Full", slug: "full", embed: decodedUrl }]
                    });
                }
            }
        }

        // (C) iframe src trực tiếp trong HTML tĩnh
        if (servers.length === 0) {
            var mainIframeM = html.match(/<iframe[^>]*id=["']main-player["'][^>]*src=["']([^"']+)["']/i)
                || html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*id=["']main-player["']/i);
            if (mainIframeM && mainIframeM[1] && mainIframeM[1].indexOf("http") === 0) {
                servers.push({
                    name: "Main Player",
                    episodes: [{ id: mainIframeM[1], name: "Full", slug: "full", embed: mainIframeM[1] }]
                });
            }
        }

        // (C2) Bất kỳ iframe embed.php?p=... nào
        if (servers.length === 0) {
            var embedIframes = html.match(/<iframe[^>]*src=["'](https?:\/\/[^"']*embed(?:_server\d+)?\.php\?p=[^"']+)["']/gi);
            if (embedIframes) {
                for (var ei = 0; ei < embedIframes.length; ei++) {
                    var srcM = embedIframes[ei].match(/src=["']([^"']+)["']/i);
                    if (srcM) {
                        servers.push({
                            name: "Embed " + (ei + 1),
                            episodes: [{ id: srcM[1], name: "Full", slug: "full", embed: srcM[1] }]
                        });
                    }
                }
            }
        }

        // (D) FALLBACK QUAN TRỌNG: từ video_id tạo embed URL dự phòng
        //    JavHD thường cho phép /embed/{id} hoặc gọi ajax để lấy server
        if (servers.length === 0 && videoId) {
            var embedCandidates = [
                "https://javhdz.today/embed/" + videoId,
                "https://javhdz.today/embed.php?id=" + videoId
            ];
            var eps = [];
            for (var c = 0; c < embedCandidates.length; c++) {
                eps.push({ id: embedCandidates[c], name: "Full", slug: "full", embed: embedCandidates[c] });
            }
            servers.push({ name: "Auto Server", episodes: eps });
        }

        // (E) Fallback link trực tiếp
        if (servers.length === 0) {
            var directM = html.match(/src=["'](https?:\/\/[a-z0-9A-Z.-]+\/(?:v|e|embed)\/[^"']+)["']/i);
            if (directM) {
                servers.push({
                    name: "Embed",
                    episodes: [{ id: directM[1], name: "Full", slug: "full", embed: directM[1] }]
                });
            }
        }

        // (F) Cuối cùng: server rỗng để UI không crash
        if (servers.length === 0) {
            servers.push({
                name: "Unknown",
                episodes: [{ id: "", name: "Full", slug: "full" }]
            });
        }

        // --- CODE ---
        var code = "Full";
        var labelM = html.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        if (labelM) code = PluginUtils.cleanText(labelM[1]);
        else if (title) {
            var codeInTitle = title.match(/([A-Z]{2,}[A-Z0-9]*-?\d{2,})/);
            if (codeInTitle) code = codeInTitle[1];
        }

        // --- CATEGORIES ---
        var categoriesArr = [];
        var catRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["']fa fa-th-list["'][^>]*><\/i>([^<]+)<\/a>/g;
        var catM;
        while ((catM = catRegex.exec(html)) !== null) {
            categoriesArr.push(PluginUtils.cleanText(catM[2]));
        }

        return JSON.stringify({
            id: videoId || "",
            title: title || "Video",
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
        return JSON.stringify({
            id: "",
            title: "Video",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: [{ name: "Unknown", episodes: [{ id: "", name: "Full", slug: "full" }] }],
            quality: "HD", lang: "Vietsub", year: 0, rating: 0,
            casts: "", director: "", country: "", category: "", status: "Full"
        });
    }
}

// =============================================================================
// DETAIL RESPONSE (giải mã payload p=)
// =============================================================================

function parseDetailResponse(html, fallbackUrl) {
    try {
        var hostUrl = fallbackUrl || "";

        // Nếu fallbackUrl là embed.php?p=... → giải mã payload
        if (hostUrl && hostUrl.indexOf("embed") !== -1 && hostUrl.indexOf("?p=") !== -1) {
            var pM = hostUrl.match(/[?&]p=([^&]+)/);
            if (pM) {
                var stream = PluginUtils.decodeEmbedPayload(pM[1]);
                if (stream) {
                    if (PluginUtils.isDirectStream(stream)) {
                        return JSON.stringify({
                            url: stream,
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                                "Referer": "https://javhdz.today/",
                                "Origin": "https://javhdz.today"
                            },
                            subtitles: [],
                            isEmbed: false
                        });
                    }
                    return JSON.stringify({
                        url: stream,
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Referer": "https://javhdz.today/"
                        },
                        subtitles: [],
                        isEmbed: true,
                        embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
                    });
                }
            }
        }

        // Nếu HTML có #main-player src
        var idxMain = html.indexOf('id="main-player"');
        if (idxMain !== -1) {
            var idxSrc = html.indexOf('src="', idxMain);
            if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                var startU = idxSrc + 5;
                var endU = html.indexOf('"', startU);
                if (endU !== -1) {
                    var u = html.substring(startU, endU);
                    if (u && u.indexOf("http") === 0) hostUrl = u;
                }
            }
        }

        // Thử giải mã p= một lần nữa
        if (hostUrl && hostUrl.indexOf("?p=") !== -1) {
            var pM2 = hostUrl.match(/[?&]p=([^&]+)/);
            if (pM2) {
                var stream2 = PluginUtils.decodeEmbedPayload(pM2[1]);
                if (stream2 && PluginUtils.isDirectStream(stream2)) {
                    return JSON.stringify({
                        url: stream2,
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Referer": "https://javhdz.today/"
                        },
                        subtitles: [],
                        isEmbed: false
                    });
                }
            }
        }

        return JSON.stringify({
            url: hostUrl,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://javhdz.today/"
            },
            subtitles: [],
            isEmbed: true,
            embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
        });
    } catch (e) {
        return JSON.stringify({ url: fallbackUrl || "", headers: {}, subtitles: [] });
    }
}

// =============================================================================
// EMBED RESPONSE
// =============================================================================

function parseEmbedResponse(html, fallbackUrl) {
    try {
        var url = fallbackUrl || "";

        if (url && url.indexOf("?p=") !== -1) {
            var pM = url.match(/[?&]p=([^&]+)/);
            if (pM) {
                var stream = PluginUtils.decodeEmbedPayload(pM[1]);
                if (stream) {
                    return JSON.stringify({
                        url: stream,
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Referer": "https://javhdz.today/"
                        },
                        subtitles: [],
                        isEmbed: !PluginUtils.isDirectStream(stream),
                        embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
                    });
                }
            }
        }

        if (html) {
            var m3u8M = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i);
            if (m3u8M) {
                return JSON.stringify({
                    url: m3u8M[1],
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Referer": "https://javhdz.today/"
                    },
                    subtitles: [],
                    isEmbed: false
                });
            }
        }

        return JSON.stringify({
            url: url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://javhdz.today/"
            },
            subtitles: [],
            isEmbed: false
        });
    } catch (e) {
        return JSON.stringify({ url: fallbackUrl || "", headers: {}, subtitles: [] });
    }
}

// =============================================================================
// CATEGORIES / COUNTRIES / YEARS
// =============================================================================

function parseCategoriesResponse(html) {
    var categories = [];
    var parts = html.split(/<li[^>]*id=["']category-[^"']*["'][^>]*>/);
    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var linkM = itemHtml.match(/href=["']\/([^"']+)[\/]?["']/);
        var nameM = itemHtml.match(/<div[^>]*class=["']category-title["'][^>]*>([\s\S]*?)<\/div>/);
        if (linkM && nameM) {
            var slug = linkM[1];
            if (slug.endsWith('/')) slug = slug.substring(0, slug.length - 1);
            categories.push({ name: PluginUtils.cleanText(nameM[1]), slug: slug });
        }
    }
    return JSON.stringify(categories);
}
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
