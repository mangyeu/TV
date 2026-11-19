var BASE_URL = "https://av01.tv";
var SITE_REFERER = "https://av01.tv/";
var EMBED_REFERER = "https://files.iw01.xyz/";

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

// === 1. MANIFEST & ĐIỀU HƯỚNG ===

function getManifest() {
    return JSON.stringify({
        "id": "av01",
        "name": "AV01",
        "version": "1.0.0",
        "baseUrl": BASE_URL,
        "iconUrl": "https://static.av01.tv/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "censored", title: "Censored", type: "Horizontal", path: "category" },
        { slug: "uncensored", title: "Uncensored", type: "Horizontal", path: "category" },
        { slug: "subtitled", title: "Subtitled", type: "Horizontal", path: "category" },
        { slug: "popular", title: "Popular", type: "Horizontal", path: "category" },
        { slug: "home", title: "Latest Videos", type: "Grid", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Censored", slug: "censored" },
        { name: "Uncensored", slug: "uncensored" },
        { name: "Subtitled", slug: "subtitled" },
        { name: "Popular", slug: "popular" },
        { name: "Amateur", slug: "amateur" },
        { name: "Asian", slug: "asian" },
        { name: "HD", slug: "hd" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({});
}

// === 2. BỘ SINH URL ===

function getUrlList(slug, filtersJson) {
    var page = parsePageNumber(filtersJson);
    if (!slug || slug === "home") {
        return page > 1 ? (BASE_URL + "/page/" + page + "/") : (BASE_URL + "/");
    }
    return page > 1 ? (BASE_URL + "/" + slug + "/page/" + page + "/") : (BASE_URL + "/" + slug + "/");
}

function getUrlSearch(keyword, filtersJson) {
    var page = parsePageNumber(filtersJson);
    var safeText = typeof keyword === "string" ? keyword : "";
    var safeKeyword = encodeURIComponent(trimStr(safeText).replace(/\s+/g, "+"));
    var baseSearch = BASE_URL + "/search/?q=" + safeKeyword;
    return page > 1 ? (baseSearch + "&page=" + page) : baseSearch;
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
        var blocks = html.split(/class=["'][^"']*(?:video-item|video-block|thumb-block|item-video)[^"']*["']/i);
        for (var i = 1; i < blocks.length; i++) {
            var block = blocks[i];

            var linkMatch = block.match(/href=["']([^"']+)["']/i);
            var link = linkMatch ? resolveUrl(linkMatch[1], BASE_URL) : "";

            var titleMatch = block.match(/title=["']([^"']+)["']/i)
                || block.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
            var title = titleMatch ? stripTags(titleMatch[1]) : "";

            var thumbMatch = block.match(/data-src=["']([^"']+)["']/i)
                || block.match(/data-original=["']([^"']+)["']/i)
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

        // Thu hẹp vùng phân trang để tránh bắt nhầm số ngoài pagination
        var pagAreaMatch = html.match(/<(?:nav|div|ul)[^>]*class=["'][^"']*(?:pagination|pager|page-nav)[^"']*["'][^>]*>([\s\S]*?)<\/(?:nav|div|ul)>/i);
        var pagHtml = pagAreaMatch ? pagAreaMatch[1] : "";

        var cpMatch = pagHtml.match(/<(?:a|span|li)[^>]*class=["'][^"']*(?:active|current)[^"']*["'][^>]*>(?:\s*<a[^>]*>)?\s*(\d+)\s*(?:<\/a>)?<\/(?:a|span|li)>/i);
        if (cpMatch) {
            currentPage = parseInt(cpMatch[1], 10);
        }

        var pageRegex = /(?:href=["'][^"']*(?:page[=\/])(\d+)["']|data-page=["'](\d+)["']|>(\d+)<\/(?:a|span)>)/gi;
        var pMatch;
        while ((pMatch = pageRegex.exec(pagHtml)) !== null) {
            var rawNum = pMatch[1] || pMatch[2] || pMatch[3];
            if (rawNum) {
                var num = parseInt(rawNum, 10);
                if (!isNaN(num) && num > totalPages && num < 10000) {
                    totalPages = num;
                }
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

        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
            || html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        var title = titleMatch ? stripTags(titleMatch[1]) : "";

        var descMatch = html.match(/<div[^>]*class=["'][^"']*(?:description|video-desc|synopsis)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
            || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        var description = descMatch ? stripTags(descMatch[1]) : "";

        var ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var posterUrl = ogImg ? resolveUrl(ogImg[1], BASE_URL) : "";

        var castsArr = [];
        var castRegex = /<a[^>]*href=["'][^"']*(?:actress|actor|model|star)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
        var castMatch;
        while ((castMatch = castRegex.exec(html)) !== null) {
            var castName = stripTags(castMatch[1]);
            if (castName && castsArr.indexOf(castName) === -1) {
                castsArr.push(castName);
            }
        }

        var categoriesArr = [];
        var catRegex = /<a[^>]*href=["'][^"']*(?:category|categories|tag|genre)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
        var cmMatch;
        while ((cmMatch = catRegex.exec(html)) !== null) {
            var catName = stripTags(cmMatch[1]);
            if (catName && categoriesArr.indexOf(catName) === -1) {
                categoriesArr.push(catName);
            }
        }

        var canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
            || html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        var pageUrl = canonicalMatch ? resolveUrl(canonicalMatch[1], BASE_URL) : resolveUrl(fallbackUrl || "", BASE_URL);

        var servers = [];
        var serverRegex = /data-server=["']([^"']+)["']/gi;
        var srvMatch;
        while ((srvMatch = serverRegex.exec(html)) !== null) {
            var srvKey = trimStr(srvMatch[1]);
            if (srvKey) {
                servers.push({
                    name: "Server " + srvKey,
                    episodes: [{
                        id: (pageUrl || "") + "#srv=" + encodeURIComponent(srvKey),
                        name: "Full",
                        slug: "full-" + srvKey
                    }]
                });
            }
        }

        if (servers.length === 0 && pageUrl) {
            servers.push({
                name: "Server #1",
                episodes: [{
                    id: pageUrl,
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
            lang: "",
            year: 0,
            rating: 0,
            casts: castsArr.join(", "),
            director: "",
            country: "",
            category: categoriesArr.join(", "),
            status: "Full"
        });
    } catch (e) {
        return "null";
    }
}

// === 4. PARSE EMBED / STREAM ===

function parseDetailResponse(html, fetchedUrl) {
    try {
        if (typeof html !== "string" || !html) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var pageReferer = getOriginReferer(fetchedUrl, SITE_REFERER);
        var iframeMatch = html.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        if (iframeMatch && iframeMatch[1]) {
            return JSON.stringify({
                url: resolveUrl(iframeMatch[1], pageReferer),
                isEmbed: true,
                headers: {
                    "Referer": pageReferer
                }
            });
        }

        return parseEmbedResponse(html, fetchedUrl || BASE_URL);
    } catch (error) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

function parseEmbedResponse(html, url) {
    try {
        if (typeof html !== "string" || !html) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var referer = getOriginReferer(url, EMBED_REFERER);
        var unescaped = html.replace(/\\\//g, "/");

        // 1. Tìm link stream trực tiếp (.m3u8 hoặc .mp4)
        var streamMatch = unescaped.match(/(https?:\/\/[^\s"'\\<>]+?\.(?:m3u8|mp4)(?:\?[^\s"'\\<>]*)?)/i);
        if (streamMatch && streamMatch[1]) {
            var streamUrl = resolveUrl(streamMatch[1], referer);
            var isHls = /\.m3u8/i.test(streamUrl);
            return JSON.stringify({
                url: streamUrl,
                isEmbed: false,
                mimeType: isHls ? "application/x-mpegURL" : "video/mp4",
                headers: {
                    "Referer": referer
                }
            });
        }

        // 2. Tìm cấu hình file / url / src trong JSON hoặc JS
        var fileMatch = unescaped.match(/["']?(?:file|stream|url|src)["']?\s*[:=]\s*["'](https?:\/\/[^"']+(?:\.m3u8|\.mp4|embed)[^"']*)["']/i);
        if (fileMatch && fileMatch[1]) {
            var matchedUrl = resolveUrl(fileMatch[1], referer);
            var isMedia = /\.(?:m3u8|mp4)/i.test(matchedUrl);
            return JSON.stringify({
                url: matchedUrl,
                isEmbed: !isMedia,
                mimeType: isMedia ? (/\.m3u8/i.test(matchedUrl) ? "application/x-mpegURL" : "video/mp4") : "",
                headers: {
                    "Referer": referer
                }
            });
        }

        // 3. Tìm iframe lồng tiếp nếu chưa có link stream
        var nestedIframe = unescaped.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        if (nestedIframe && nestedIframe[1]) {
            return JSON.stringify({
                url: resolveUrl(nestedIframe[1], referer),
                isEmbed: true,
                headers: {
                    "Referer": referer
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

    if (!firstStep.isEmbed) {
        callback(firstStep);
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
