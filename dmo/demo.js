var BASE_URL = "https://vlxx.net";
var DEFAULT_SITE_REFERER = "https://vlxx.net/";
var DEFAULT_EMBED_REFERER = "https://play.vlstream.net/";
var DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function getManifest() {
    return JSON.stringify({
        "id": "vlxx",
        "name": "VLXX",
        "version": "1.0.6",
        "baseUrl": BASE_URL,
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/vlxx.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'jav', title: 'Phim JAV', type: 'Horizontal', path: 'category' },
        { slug: 'phim-sex-hay', title: 'Phim Sex Hay', type: 'Horizontal', path: 'category' },
        { slug: 'vietsub', title: 'Phim Sex Vietsub', type: 'Horizontal', path: 'category' },
        { slug: 'khong-che', title: 'Không Che', type: 'Horizontal', path: 'category' },
        { slug: 'home', title: 'Phim Sex Mới', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'JAV', slug: 'jav' },
        { name: 'Phim Sex Hay', slug: 'phim-sex-hay' },
        { name: 'Vietsub', slug: 'vietsub' },
        { name: 'Không Che', slug: 'khong-che' },
        { name: 'Sex Học Sinh', slug: 'hoc-sinh' },
        { name: 'Vụng Trộm', slug: 'vung-trom' },
        { name: 'Phim Cấp 3', slug: 'cap-3' },
        { name: 'Mỹ - Châu Âu', slug: 'chau-au' },
        { name: 'XVIDEOS', slug: 'xvideos' },
        { name: 'XNXX', slug: 'xnxx' },
        { name: 'XXX', slug: 'xxx' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({});
}

// =============================================================================
// HELPERS
// =============================================================================

function resolveUrl(rawUrl, base) {
    if (!rawUrl) return "";
    var val = String(rawUrl).trim();
    if (!val) return "";
    if (val.indexOf("http://") === 0 || val.indexOf("https://") === 0) return val;
    if (val.indexOf("//") === 0) return "https:" + val;
    var root = base || BASE_URL;
    if (val.charAt(0) !== "/") val = "/" + val;
    return root + val;
}

function getRefererFromUrl(targetUrl, fallback) {
    if (!targetUrl) return fallback;
    var match = String(targetUrl).match(/^(https?:\/\/[^/?#]+)/i);
    return match ? match[1] + "/" : targetUrl;
}

function cleanText(str) {
    return String(str || "")
        .replace(/<[^>]+>/g, "")
        .replace(/&/g, "&")
        .replace(/"/g, '"')
        .replace(/'/g, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

function unescapeCommon(str) {
    return String(str || "")
        .replace(/\\\//g, "/")
        .replace(/\\u002F/gi, "/")
        .replace(/\\u003A/gi, ":")
        .replace(/\\u003F/gi, "?")
        .replace(/\\u0026/gi, "&")
        .replace(/\\u003D/gi, "=")
        .replace(/\\"/g, '"');
}

function decodeBase64Safe(b64) {
    try {
        if (typeof atob === "function") {
            return atob(b64);
        }
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var input = String(b64).replace(/[^A-Za-z0-9+/=]/g, "");
        var i = 0;
        while (i < input.length) {
            var enc1 = chars.indexOf(input.charAt(i++));
            var enc2 = chars.indexOf(input.charAt(i++));
            var enc3 = chars.indexOf(input.charAt(i++));
            var enc4 = chars.indexOf(input.charAt(i++));
            var chr1 = (enc1 << 2) | (enc2 >> 4);
            var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            var chr3 = ((enc3 & 3) << 6) | enc4;
            output += String.fromCharCode(chr1);
            if (enc3 !== 64) output += String.fromCharCode(chr2);
            if (enc4 !== 64) output += String.fromCharCode(chr3);
        }
        return output;
    } catch (e) {
        return "";
    }
}

function buildStreamResult(streamUrl, referer, mimeType) {
    var cleanUrl = String(streamUrl || "").trim();
    if (!cleanUrl) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
    var resolved = resolveUrl(cleanUrl, BASE_URL);
    var detectedMime = mimeType;
    if (!detectedMime) {
        if (/\.mp4(\?|#|$)/i.test(resolved)) {
            detectedMime = "video/mp4";
        } else {
            detectedMime = "application/x-mpegURL";
        }
    }
    return JSON.stringify({
        url: resolved,
        isEmbed: false,
        mimeType: detectedMime,
        headers: {
            "Referer": referer || DEFAULT_EMBED_REFERER,
            "User-Agent": DEFAULT_USER_AGENT
        }
    });
}

// =============================================================================
// URL BUILDERS
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
    var page = parseInt(filters.page, 10) || 1;

    if (!slug || slug === "home") {
        if (page > 1) {
            return BASE_URL + "/new/" + page + "/";
        }
        return BASE_URL + "/";
    }

    if (page > 1) {
        return BASE_URL + "/" + slug + "/" + page + "/";
    }
    return BASE_URL + "/" + slug + "/";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
    var page = parseInt(filters.page, 10) || 1;
    var safeKeyword = encodeURIComponent(String(keyword || "").trim().replace(/\s+/g, "-"));
    var url = BASE_URL + "/search/" + safeKeyword + "/";
    if (page > 1) {
        url = BASE_URL + "/search/" + safeKeyword + "/" + page + "/";
    }
    return url;
}

// getUrlDetail: App gọi với episode.id
// episode.id = canonical URL (có thể kèm #s2 cho server 2)
// Trả về URL sạch (bỏ #s...) để fetch trang detail
function getUrlDetail(slug) {
    if (!slug) return "";
    var raw = String(slug).trim();
    var hashIdx = raw.indexOf("#");
    var cleanSlug = hashIdx !== -1 ? raw.substring(0, hashIdx) : raw;
    return resolveUrl(cleanSlug, BASE_URL);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    try {
        var items = [];
        var blocks = String(html || "").split('class="video-item"');

        for (var i = 1; i < blocks.length; i++) {
            var block = blocks[i];

            var linkMatch = block.match(/href=["']([^"']+)["']/i);
            var link = linkMatch ? resolveUrl(linkMatch[1], BASE_URL) : "";

            var titleMatch = block.match(/title=["']([^"']+)["']/i);
            var title = titleMatch ? cleanText(titleMatch[1]) : "";

            var thumbMatch = block.match(/data-original=["']([^"']+)["']/i);
            if (!thumbMatch) {
                thumbMatch = block.match(/<img[^>]*src=["']([^"']+)["']/i);
            }
            var thumb = thumbMatch ? thumbMatch[1].trim() : "";

            if (thumb) {
                if (thumb.indexOf("data:image") === 0) {
                    thumb = "";
                } else {
                    thumb = resolveUrl(thumb, BASE_URL);
                }
            }

            if (link && title) {
                items.push({
                    id: link,
                    title: title,
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    year: 0
                });
            }
        }

        var currentPage = 1;
        var totalPages = 1;

        var cpMatch = String(html || "").match(/<a[^>]*class=["'][^"']*active[^"']*["'][^>]*data-page=["'](\d+)["']/i);
        if (cpMatch) {
            currentPage = parseInt(cpMatch[1], 10) || 1;
        }

        var lpRegex = /<a[^>]*data-page=["'](\d+)["'][^>]*>[0-9]+<\/a>/gi;
        var lpMatch;
        while ((lpMatch = lpRegex.exec(html)) !== null) {
            var pageNum = parseInt(lpMatch[1], 10) || 1;
            if (pageNum > totalPages) totalPages = pageNum;
        }
        if (currentPage > totalPages) totalPages = currentPage;

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages
            }
        });
    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: {
                currentPage: 1,
                totalPages: 1
            }
        });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var srcHtml = String(html || "");

        var titleMatch = srcHtml.match(/<h1[^>]*class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i)
            || srcHtml.match(/<h2[^>]*class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i)
            || srcHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? cleanText(titleMatch[1]) : "";

        var descMatch = srcHtml.match(/<div[^>]*class=["'][^"']*video-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        var description = descMatch ? cleanText(descMatch[1]) : "";

        var codeMatch = srcHtml.match(/<span[^>]*class=["'][^"']*video-code[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var code = codeMatch ? cleanText(codeMatch[1]) : "";

        if (code && title && title.indexOf("(" + code + ")") !== 0) {
            title = "(" + code + ") " + title;
        }

        var ogImg = srcHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var posterUrl = ogImg ? resolveUrl(ogImg[1], BASE_URL) : "";

        var castsArr = [];
        var castRegex = /<div[^>]*class=["'][^"']*actress-tag[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/gi;
        var castMatch;
        while ((castMatch = castRegex.exec(srcHtml)) !== null) {
            var castName = cleanText(castMatch[1]);
            if (castName) castsArr.push(castName);
        }

        var categoriesArr = [];
        var catSectionMatch = srcHtml.match(/<div[^>]*class=["'][^"']*category-tag[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        if (catSectionMatch) {
            var catRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi;
            var cmMatch;
            while ((cmMatch = catRegex.exec(catSectionMatch[1])) !== null) {
                var catName = cleanText(cmMatch[1]);
                if (catName) categoriesArr.push(catName);
            }
        }

        // episode.id = canonical URL + #s{serverId}
        var servers = [];
        var seenServers = {};

        var canonicalMatch = srcHtml.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
            || srcHtml.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        var pageUrl = canonicalMatch ? resolveUrl(canonicalMatch[1], BASE_URL) : BASE_URL;

        var serverRegex = /server\((\d+)\s*,\s*(\d+)\)/gi;
        var srvMatch;
        while ((srvMatch = serverRegex.exec(srcHtml)) !== null) {
            var serverId = srvMatch[1];
            if (!seenServers[serverId]) {
                seenServers[serverId] = true;
                servers.push({
                    name: "Server #" + serverId,
                    episodes: [{
                        id: pageUrl + "#s" + serverId,
                        name: "Full",
                        slug: "full-s" + serverId
                    }]
                });
            }
        }

        if (servers.length === 0) {
            servers.push({
                name: "Server #1",
                episodes: [{
                    id: pageUrl + "#s1",
                    name: "Full",
                    slug: "full"
                }]
            });
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: 0,
            rating: 0,
            casts: castsArr.join(", "),
            director: "",
            country: "",
            category: categoriesArr.join(", "),
            status: code || "Full"
        });
    } catch (e) {
        return "null";
    }
}

// Trích xuất thông tin AJAX/embed từ trang detail khi người dùng chọn tập (episodeUrl có thể chứa #s1, #s2)
function parseDetailResponse(html, episodeUrl) {
    try {
        var srcHtml = String(html || "");
        var fullUrl = String(episodeUrl || "");
        var hashMatch = fullUrl.match(/#s(\d+)/i);
        var targetServer = hashMatch ? hashMatch[1] : "1";

        // Tìm videoId từ onclick="server(1, 3105)" hoặc data-id="..."
        var srvCallMatch = srcHtml.match(/server\(\s*\d+\s*,\s*(\d+)\s*\)/i);
        var dataIdMatch = srcHtml.match(/data-id=["'](\d+)["']/i);
        var videoId = srvCallMatch ? srvCallMatch[1] : (dataIdMatch ? dataIdMatch[1] : "");

        // Tìm endpoint AJAX nếu có khai báo trong script
        var ajaxUrlMatch = srcHtml.match(/url\s*:\s*["']([^"']*ajax[^"']*|[^"']*player[^"']*)["']/i);
        var ajaxUrl = ajaxUrlMatch ? resolveUrl(ajaxUrlMatch[1], BASE_URL) : (BASE_URL + "/ajax/player");

        // Nếu trang detail đã có sẵn iframe embed trực tiếp
        var directIframeMatch = srcHtml.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
        if (directIframeMatch && directIframeMatch[1]) {
            return JSON.stringify({
                url: resolveUrl(directIframeMatch[1], BASE_URL),
                isEmbed: true,
                headers: {
                    "Referer": getRefererFromUrl(fullUrl, DEFAULT_SITE_REFERER),
                    "User-Agent": DEFAULT_USER_AGENT
                }
            });
        }

        // Trả về thông tin request AJAX POST để host app thực hiện (nếu host app hỗ trợ)
        if (videoId) {
            return JSON.stringify({
                url: ajaxUrl,
                method: "POST",
                isEmbed: true,
                body: "id=" + encodeURIComponent(videoId) + "&server=" + encodeURIComponent(targetServer),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest",
                    "Referer": getRefererFromUrl(fullUrl, DEFAULT_SITE_REFERER),
                    "User-Agent": DEFAULT_USER_AGENT
                }
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

// parseEmbedResponse:
// Depth 1 - AJAX JSON: {"player":"<iframe src=\"...\">"} -> trích iframe URL
// Depth 2 - Embed HTML: JWPlayer / stream (.vl, .m3u8, .mp4) -> trích stream URL
function parseEmbedResponse(html, url) {
    try {
        var rawHtml = String(html || "");
        var embedReferer = getRefererFromUrl(url, DEFAULT_EMBED_REFERER);

        // === CASE 1: AJAX JSON response (chứa "player" key) ===
        if (rawHtml.indexOf('"player"') !== -1 || rawHtml.indexOf("'player'") !== -1) {
            try {
                var jsonObj = JSON.parse(rawHtml);
                if (jsonObj && jsonObj.player) {
                    var playerHtml = unescapeCommon(String(jsonObj.player));
                    var srcMatch = playerHtml.match(/src=["']([^"']+)["']/i);
                    if (srcMatch && srcMatch[1]) {
                        return JSON.stringify({
                            url: resolveUrl(srcMatch[1], BASE_URL),
                            isEmbed: true,
                            headers: {
                                "Referer": DEFAULT_SITE_REFERER,
                                "User-Agent": DEFAULT_USER_AGENT
                            }
                        });
                    }
                }
            } catch (parseErr) {
                var cleaned = unescapeCommon(rawHtml);
                var iframeMatch = cleaned.match(/src=(?:\\+)?["'](https?:\/\/[^"'\\\s<>]+|\/\/[^"'\\\s<>]+)(?:\\+)?["']/i);
                if (iframeMatch && iframeMatch[1]) {
                    return JSON.stringify({
                        url: resolveUrl(iframeMatch[1], BASE_URL),
                        isEmbed: true,
                        headers: {
                            "Referer": DEFAULT_SITE_REFERER,
                            "User-Agent": DEFAULT_USER_AGENT
                        }
                    });
                }
            }
        }

        // === CASE 2: Embed page HTML (JWPlayer / .vl / .m3u8 / .mp4) ===
        var normalizedHtml = unescapeCommon(rawHtml);

        // 2a. Tìm trực tiếp trong file / sources / URL có .vl, .m3u8, .mp4
        var directStreamMatch =
            normalizedHtml.match(/["']?file["']?\s*:\s*["'](https?:\/\/[^"']+\.(?:vl|m3u8|mp4)[^"']*)["']/i)
            || normalizedHtml.match(/(https?:\/\/[^\s"'<>\\]+\.(?:vl|m3u8|mp4)[^\s"'<>\\]*)/i);

        if (directStreamMatch && directStreamMatch[1]) {
            return buildStreamResult(directStreamMatch[1], embedReferer, "");
        }

        // 2b. Thử parse mảng sources của JWPlayer
        var sourcesMatch = normalizedHtml.match(/["']?sources["']?\s*:\s*(\[[\s\S]*?\])\s*(?:,|;|\})/i);
        if (sourcesMatch && sourcesMatch[1]) {
            var rawSources = sourcesMatch[1];
            try {
                var sources = JSON.parse(rawSources);
                if (sources && sources.length > 0 && sources[0].file) {
                    var mimeFromType = sources[0].type === "hls" ? "application/x-mpegURL" : "";
                    return buildStreamResult(sources[0].file, embedReferer, mimeFromType);
                }
            } catch (e) {
                var looseFileMatch = rawSources.match(/["']?file["']?\s*:\s*["']([^"']+)["']/i);
                var looseTypeMatch = rawSources.match(/["']?type["']?\s*:\s*["']([^"']+)["']/i);
                if (looseFileMatch && looseFileMatch[1]) {
                    var isHls = looseTypeMatch && looseTypeMatch[1].toLowerCase() === "hls";
                    return buildStreamResult(
                        looseFileMatch[1],
                        embedReferer,
                        isHls ? "application/x-mpegURL" : ""
                    );
                }
            }
        }

        // 2c. Thử giải mã các chuỗi Base64 dài nếu trang nhúng link stream dưới dạng Base64
        var b64Regex = /["']([A-Za-z0-9+/=]{24,})["']/g;
        var b64Match;
        while ((b64Match = b64Regex.exec(normalizedHtml)) !== null) {
            var decoded = unescapeCommon(decodeBase64Safe(b64Match[1]));
            var innerStream = decoded.match(/(https?:\/\/[^\s"'<>\\]+\.(?:vl|m3u8|mp4)[^\s"'<>\\]*)/i);
            if (innerStream && innerStream[1]) {
                return buildStreamResult(innerStream[1], embedReferer, "");
            }
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}
