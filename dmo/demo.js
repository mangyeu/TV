var BASE_URL = "https://vlxx.net";
var SITE_REFERER = "https://vlxx.net/";
var EMBED_REFERER = "https://play.vlstream.net/";

function trimStr(str) {
    if (!str || typeof str !== "string") {
        return "";
    }
    return str.replace(/^\s+|\s+$/g, "");
}

function stripTags(str) {
    return trimStr(str).replace(/<[^>]+>/g, "");
}

function getOriginReferer(targetUrl, fallbackUrl) {
    var source = targetUrl || fallbackUrl || "";
    var match = source.match(/^(https?:\/\/[^/]+)\//i);
    return match ? match[1] + "/" : fallbackUrl;
}

function resolveUrl(rawUrl, baseUrl) {
    var trimmed = trimStr(rawUrl);
    if (!trimmed) {
        return "";
    }
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    if (/^\/\//.test(trimmed)) {
        var protoMatch = (baseUrl || BASE_URL).match(/^(https?:)/i);
        var proto = protoMatch ? protoMatch[1] : "https:";
        return proto + trimmed;
    }
    var origin = getOriginReferer(baseUrl, SITE_REFERER);
    if (!origin) {
        return trimmed;
    }
    if (trimmed.charAt(0) === "/") {
        return origin.replace(/\/$/, "") + trimmed;
    }
    return origin + trimmed;
}

// === 1. MANIFEST & ĐIỀU HƯỚNG ===

function getManifest() {
    return JSON.stringify({
        "id": "vlxx",
        "name": "VLXX",
        "version": "1.0.1",
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
        { slug: "jav", title: "Phim JAV", type: "Horizontal", path: "category" },
        { slug: "phim-sex-hay", title: "Phim Sex Hay", type: "Horizontal", path: "category" },
        { slug: "vietsub", title: "Phim Sex Vietsub", type: "Horizontal", path: "category" },
        { slug: "khong-che", title: "Không Che", type: "Horizontal", path: "category" },
        { slug: "home", title: "Phim Sex Mới", type: "Grid", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "JAV", slug: "jav" },
        { name: "Phim Sex Hay", slug: "phim-sex-hay" },
        { name: "Vietsub", slug: "vietsub" },
        { name: "Không Che", slug: "khong-che" },
        { name: "Sex Học Sinh", slug: "hoc-sinh" },
        { name: "Vụng Trộm", slug: "vung-trom" },
        { name: "Phim Cấp 3", slug: "cap-3" },
        { name: "Mỹ - Châu Âu", slug: "chau-au" },
        { name: "XVIDEOS", slug: "xvideos" },
        { name: "XNXX", slug: "xnxx" },
        { name: "XXX", slug: "xxx" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({});
}

// === 2. BỘ SINH URL ===

function parsePageNumber(filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
    var page = filters && filters.page ? parseInt(filters.page, 10) : 1;
    return (!isNaN(page) && page > 0) ? page : 1;
}

function getUrlList(slug, filtersJson) {
    var page = parsePageNumber(filtersJson);
    if (!slug || slug === "home") {
        return page > 1 ? (BASE_URL + "/new/" + page + "/") : (BASE_URL + "/");
    }
    return page > 1 ? (BASE_URL + "/" + slug + "/" + page + "/") : (BASE_URL + "/" + slug + "/");
}

function getUrlSearch(keyword, filtersJson) {
    var page = parsePageNumber(filtersJson);
    var safeText = typeof keyword === "string" ? keyword : "";
    var safeKeyword = encodeURIComponent(trimStr(safeText).replace(/\s+/g, "-"));
    return page > 1
        ? (BASE_URL + "/search/" + safeKeyword + "/" + page + "/")
        : (BASE_URL + "/search/" + safeKeyword + "/");
}

function getUrlDetail(slug) {
    var clean = trimStr(slug);
    if (!clean) {
        return "";
    }
    if (/^https?:\/\//i.test(clean)) {
        return clean;
    }
    if (clean.charAt(0) !== "/") {
        clean = "/" + clean;
    }
    return BASE_URL + clean;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// === 3. PARSE DANH SÁCH & CHI TIẾT ===

function parseListResponse(html) {
    var items = [];
    var currentPage = 1;
    var totalPages = 1;

    if (typeof html === "string" && html) {
        var blocks = html.split(/class=["'][^"']*video-item[^"']*["']/i);
        for (var i = 1; i < blocks.length; i++) {
            var block = blocks[i];

            var linkMatch = block.match(/href=["']([^"']+)["']/i);
            var link = linkMatch ? resolveUrl(linkMatch[1], BASE_URL) : "";

            var titleMatch = block.match(/title=["']([^"']+)["']/i);
            var title = titleMatch ? stripTags(titleMatch[1]) : "";

            var thumbMatch = block.match(/data-original=["']([^"']+)["']/i)
                || block.match(/data-src=["']([^"']+)["']/i)
                || block.match(/<img[^>]*src=["']([^"']+)["']/i);
            var thumb = thumbMatch ? resolveUrl(thumbMatch[1], BASE_URL) : "";

            if (!thumb || thumb.indexOf("data:image") === 0) {
                thumb = "";
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

        var cpMatch = html.match(/<a[^>]*class=["'][^"']*active[^"']*["'][^>]*data-page=["'](\d+)["']/i);
        if (cpMatch) {
            currentPage = parseInt(cpMatch[1], 10);
        }

        var lpRegex = /<a[^>]*data-page=["'](\d+)["'][^>]*>[0-9]+<\/a>/gi;
        var lpMatch;
        while ((lpMatch = lpRegex.exec(html)) !== null) {
            var pageNum = parseInt(lpMatch[1], 10);
            if (pageNum > totalPages) {
                totalPages = pageNum;
            }
        }
        if (currentPage > totalPages) {
            totalPages = currentPage;
        }
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html, fallbackUrl) {
    try {
        if (typeof html !== "string" || !html) {
            return "null";
        }

        var titleMatch = html.match(/<h1[^>]*class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i)
            || html.match(/<h2[^>]*class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i)
            || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? stripTags(titleMatch[1]) : "";

        var descMatch = html.match(/<div[^>]*class=["'][^"']*video-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        var description = descMatch ? stripTags(descMatch[1]) : "";

        var codeMatch = html.match(/<span[^>]*class=["'][^"']*video-code[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var code = codeMatch ? stripTags(codeMatch[1]) : "";

        if (code && title) {
            title = "(" + code + ") " + title;
        }

        var ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var posterUrl = ogImg ? resolveUrl(ogImg[1], BASE_URL) : "";

        var castsArr = [];
        var castRegex = /<div[^>]*class=["'][^"']*actress-tag[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/gi;
        var castMatch;
        while ((castMatch = castRegex.exec(html)) !== null) {
            var castName = stripTags(castMatch[1]);
            if (castName) {
                castsArr.push(castName);
            }
        }

        var categoriesArr = [];
        var catSectionMatch = html.match(/<div[^>]*class=["'][^"']*category-tag[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        if (catSectionMatch) {
            var catRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi;
            var cmMatch;
            while ((cmMatch = catRegex.exec(catSectionMatch[1])) !== null) {
                var catName = stripTags(cmMatch[1]);
                if (catName) {
                    categoriesArr.push(catName);
                }
            }
        }

        var canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
            || html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        var pageUrl = canonicalMatch ? resolveUrl(canonicalMatch[1], BASE_URL) : resolveUrl(fallbackUrl || "", BASE_URL);

        var servers = [];
        var serverRegex = /onclick=["']server\((\d+),\s*(\d+)\)["']/gi;
        var srvMatch;
        while ((srvMatch = serverRegex.exec(html)) !== null) {
            var serverId = srvMatch[1];
            servers.push({
                name: "Server #" + serverId,
                episodes: [{
                    id: (pageUrl || "") + "#s" + serverId,
                    name: "Full",
                    slug: "full-s" + serverId
                }]
            });
        }

        if (servers.length === 0 && pageUrl) {
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

// === 4. TẠO REQUEST AJAX & PARSE EMBED / STREAM ===

function extractVideoId(html, fetchedUrl) {
    if (typeof html === "string" && html) {
        var dataIdMatch = html.match(/data-id=["'](\d+)["']/i)
            || html.match(/onclick=["']server\(\d+,\s*(\d+)\)["']/i)
            || html.match(/\bvideoId\s*[:=]\s*["']?(\d+)["']?/i);
        if (dataIdMatch && dataIdMatch[1]) {
            return dataIdMatch[1];
        }
    }
    if (typeof fetchedUrl === "string" && fetchedUrl) {
        var noHash = fetchedUrl.split("#")[0];
        var tailMatch = noHash.match(/(?:\/|-)(\d+)\/?$/);
        if (tailMatch && tailMatch[1]) {
            return tailMatch[1];
        }
    }
    return "";
}

function parseDetailResponse(html, fetchedUrl) {
    try {
        var siteReferer = getOriginReferer(fetchedUrl, SITE_REFERER);
        var ajaxEndpoint = siteReferer.replace(/\/$/, "") + "/ajax.php";
        var videoId = extractVideoId(html, fetchedUrl);

        if (!videoId) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var serverId = "1";
        if (typeof fetchedUrl === "string" && fetchedUrl) {
            var fragMatch = fetchedUrl.match(/#s(\d+)/i);
            if (fragMatch && fragMatch[1]) {
                serverId = fragMatch[1];
            }
        }

        var deviceType = "mobile";
        if (typeof html === "string" && html) {
            var deviceMatch = html.match(/deviceType\s*=\s*['"](\w+)['"]/i);
            if (deviceMatch && deviceMatch[1]) {
                deviceType = deviceMatch[1].toLowerCase();
            }
        }
        var vlxxServer = deviceType === "desktop" ? "1" : "2";

        return JSON.stringify({
            url: ajaxEndpoint,
            isEmbed: true,
            postBody: "vlxx_server=" + vlxxServer + "&id=" + videoId + "&server=" + serverId,
            headers: {
                "Referer": siteReferer,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    } catch (error) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

function parseEmbedResponse(html, url) {
    try {
        if (typeof html !== "string" || !html) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var isAjaxUrl = typeof url === "string" && url.indexOf("/ajax.php") !== -1;
        var iframeReferer = isAjaxUrl ? SITE_REFERER : getOriginReferer(url, SITE_REFERER);
        var streamReferer = /vlstream/i.test(url || "") ? getOriginReferer(url, EMBED_REFERER) : EMBED_REFERER;

        // === CASE 1: AJAX JSON response (chứa "player" key) ===
        if (html.indexOf('"player"') !== -1 || html.indexOf("'player'") !== -1) {
            try {
                var jsonObj = JSON.parse(html);
                if (jsonObj && typeof jsonObj.player === "string") {
                    var srcMatch = jsonObj.player.match(/src=["']([^"']+)["']/i);
                    if (srcMatch && srcMatch[1]) {
                        return JSON.stringify({
                            url: resolveUrl(srcMatch[1], iframeReferer),
                            isEmbed: true,
                            headers: {
                                "Referer": iframeReferer
                            }
                        });
                    }
                }
            } catch (parseErr) {
                var cleaned = html.replace(/\\\//g, "/");
                var iframeMatch = cleaned.match(/src=(?:\\\\)?["'](https?:\/\/[^"'\\]+|\/\/[^"'\\]+|\/[^"'\\]+)(?:\\\\)?["']/i);
                if (iframeMatch && iframeMatch[1]) {
                    return JSON.stringify({
                        url: resolveUrl(iframeMatch[1], iframeReferer),
                        isEmbed: true,
                        headers: {
                            "Referer": iframeReferer
                        }
                    });
                }
            }
        }

        // === CASE 2A: JWPlayer / config có "file" chứa .vl ===
        var fileMatch = html.match(/["']?file["']?\s*:\s*["'](https?:\/\/[^"']+\.vl[^"']*)["']/i);
        if (fileMatch && fileMatch[1]) {
            return JSON.stringify({
                url: resolveUrl(fileMatch[1], streamReferer),
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "Referer": streamReferer
                }
            });
        }

        // === CASE 2B: Mảng sources ===
        var sourcesMatch = html.match(/sources\s*:\s*(\[[\s\S]*?\])\s*(?:,|;|\})/i);
        if (sourcesMatch && sourcesMatch[1]) {
            var rawSources = sourcesMatch[1];
            try {
                var normalized = rawSources
                    .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    .replace(/'/g, '"');
                var sources = JSON.parse(normalized);
                if (sources && sources.length > 0 && sources[0] && sources[0].file) {
                    return JSON.stringify({
                        url: resolveUrl(sources[0].file, streamReferer),
                        isEmbed: false,
                        mimeType: sources[0].type === "hls" ? "application/x-mpegURL" : "",
                        headers: {
                            "Referer": streamReferer
                        }
                    });
                }
            } catch (e) {
                var regexFile = rawSources.match(/["']?file["']?\s*[:=]\s*["']([^"']+)["']/i);
                if (regexFile && regexFile[1]) {
                    return JSON.stringify({
                        url: resolveUrl(regexFile[1], streamReferer),
                        isEmbed: false,
                        mimeType: "application/x-mpegURL",
                        headers: {
                            "Referer": streamReferer
                        }
                    });
                }
            }
        }

        // === CASE 2C: Bất kỳ URL .vl nào ===
        var vlMatch = html.match(/(https?:\/\/[^\s"'\\<>]+\.vl[^\s"'\\<>]*)/i);
        if (vlMatch && vlMatch[1]) {
            return JSON.stringify({
                url: resolveUrl(vlMatch[1], streamReferer),
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "Referer": streamReferer
                }
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

// === 5. BỘ CHẠY ĐỆ QUY QUA XHR ===

function requestTextEs5(reqConfig, onSuccess, onError) {
    if (typeof XMLHttpRequest === "undefined") {
        onError(new Error("XMLHttpRequest is not available in this runtime; use host HTTP client."));
        return;
    }
    try {
        var method = reqConfig.postBody ? "POST" : "GET";
        var xhr = new XMLHttpRequest();
        xhr.open(method, reqConfig.url, true);

        var headers = reqConfig.headers || {};
        for (var key in headers) {
            if (headers.hasOwnProperty(key) && headers[key]) {
                try {
                    xhr.setRequestHeader(key, headers[key]);
                } catch (hdrErr) {}
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    onSuccess(xhr.responseText);
                } else {
                    onError(new Error("HTTP status " + xhr.status));
                }
            }
        };

        xhr.send(reqConfig.postBody || null);
    } catch (err) {
        onError(err);
    }
}

function resolveStreamFromDetail(detailHtml, fetchedUrl, options, callback) {
    var opts = options || {};
    var maxDepth = typeof opts.maxDepth === "number" ? opts.maxDepth : 5;
    var visited = opts.visited || {};

    var firstStepJson = parseDetailResponse(detailHtml, fetchedUrl);
    var firstStep;
    try {
        firstStep = JSON.parse(firstStepJson);
    } catch (e) {
        callback({ url: "", isEmbed: false, headers: {}, error: "Invalid detail parse JSON" });
        return;
    }

    if (!firstStep || !firstStep.url) {
        callback({ url: "", isEmbed: false, headers: {} });
        return;
    }

    function loopEmbed(reqSpec, depth) {
        if (depth > maxDepth) {
            callback({ url: "", isEmbed: false, headers: {}, error: "Max depth exceeded" });
            return;
        }

        var visitKey = reqSpec.url + "|" + (reqSpec.postBody || "");
        if (visited[visitKey]) {
            callback({ url: "", isEmbed: false, headers: {}, error: "Circular request detected" });
            return;
        }
        visited[visitKey] = true;

        requestTextEs5(
            reqSpec,
            function (respText) {
                var parsed;
                try {
                    parsed = JSON.parse(parseEmbedResponse(respText, reqSpec.url));
                } catch (parseErr) {
                    callback({ url: "", isEmbed: false, headers: {}, error: "Invalid embed parse JSON" });
                    return;
                }

                if (!parsed || !parsed.url) {
                    callback({ url: "", isEmbed: false, headers: {} });
                    return;
                }

                if (!parsed.isEmbed) {
                    callback(parsed);
                    return;
                }

                loopEmbed({
                    url: parsed.url,
                    postBody: "",
                    headers: parsed.headers || {}
                }, depth + 1);
            },
            function (err) {
                callback({
                    url: "",
                    isEmbed: false,
                    headers: {},
                    error: err && err.message ? err.message : "Request failed"
                });
            }
        );
    }

    loopEmbed(firstStep, 0);
}
