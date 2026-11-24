// =============================================================================
// VAAPP PLUGIN - JAVHDZ (https://javhdz.today)
// =============================================================================

var BASE_URL = "https://javhdz.today";
var DEFAULT_UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";

function getManifest() {
    return JSON.stringify({
        "id": "javhdz_today",
        "name": "JAVHDZ",
        "version": "1.0.0",
        "description": "Xem video từ JAVHDZ",
        "author": "VAAPP",
        "baseUrl": BASE_URL,
        "referrer": BASE_URL + "/",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embedtoexoplay",
        "adblock": true,
        "debug": true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "", title: "Mới Cập Nhật", type: "Horizontal", path: "" },
        { slug: "censored", title: "Censored", type: "Horizontal", path: "" },
        { slug: "uncensored", title: "Uncensored", type: "Horizontal", path: "" },
        { slug: "amateur", title: "Amateur", type: "Horizontal", path: "" },
        { slug: "trending", title: "Thịnh Hành", type: "Horizontal", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Mới Cập Nhật", slug: "" },
        { name: "Thịnh Hành", slug: "trending" },
        { name: "Censored", slug: "censored" },
        { name: "Uncensored", slug: "uncensored" },
        { name: "Amateur", slug: "amateur" },
        { name: "JavHD", slug: "javhd" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        filters: [
            {
                key: "page",
                name: "Trang",
                type: "number",
                defaultValue: 1,
                options: []
            },
            {
                key: "category",
                name: "Danh mục",
                type: "select",
                defaultValue: "",
                options: [
                    { name: "Mới Cập Nhật", slug: "" },
                    { name: "Thịnh Hành", slug: "trending" },
                    { name: "Censored", slug: "censored" },
                    { name: "Uncensored", slug: "uncensored" },
                    { name: "Amateur", slug: "amateur" },
                    { name: "JavHD", slug: "javhd" }
                ]
            }
        ]
    });
}

function _parsePage(filtersJson) {
    var page = 1;
    try {
        if (filtersJson) {
            var f = typeof filtersJson === "string" ? JSON.parse(filtersJson) : filtersJson;
            if (f && f.page) {
                var p = parseInt(f.page, 10);
                if (!isNaN(p) && p > 0) page = p;
            }
        }
    } catch (e) {}
    return page;
}

function _stripPipe(raw) {
    if (!raw) return "";
    return String(raw).split("|")[0].trim();
}

function _getPipeData(raw, datasend) {
    if (datasend) return datasend;
    if (!raw) return "";
    var str = String(raw);
    var idx = str.indexOf("|");
    if (idx < 0) return "";
    var s = str.substring(idx + 1).replace(/^\s+/, "");
    if (s.toLowerCase().indexOf("data:") === 0) {
        s = s.substring(5);
    }
    return s;
}

function _safeJsonParse(input) {
    if (input === null || input === undefined) return null;
    if (typeof input === "object") return input;
    var text = String(input).trim();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch (e1) {
        var firstBrace = text.indexOf("{");
        var lastBrace = text.lastIndexOf("}");
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            try {
                return JSON.parse(text.substring(firstBrace, lastBrace + 1));
            } catch (e2) {}
        }

        var firstBracket = text.indexOf("[");
        var lastBracket = text.lastIndexOf("]");
        if (firstBracket >= 0 && lastBracket > firstBracket) {
            try {
                return JSON.parse(text.substring(firstBracket, lastBracket + 1));
            } catch (e3) {}
        }
    }
    return null;
}

function _resolveUrl(rawUrl, baseRef) {
    var u = String(rawUrl || "").replace(/\\\//g, "").trim();
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    if (u.indexOf("//") === 0) return "https:" + u;
    var origin = _originFromUrl(baseRef || BASE_URL).replace(/\/$/, "");
    if (u.indexOf("/") === 0) return origin + u;
    return origin + "/" + u;
}

function _originFromUrl(urlStr) {
    var clean = _stripPipe(urlStr || "");
    if (clean.indexOf("//") === 0) clean = "https:" + clean;
    var m = clean.match(/^(https?:\/\/[^\/]+)/i);
    return m ? (m[1] + "/") : (BASE_URL + "/");
}

function _decodeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&")
        .replace(/"/g, "\"")
        .replace(/'/g, "'")
        .replace(/'/g, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

function getUrlList(slug, filtersJson) {
    var page = _parsePage(filtersJson);
    var cleanSlug = _stripPipe(slug || "");

    if (cleanSlug.indexOf("http") === 0) {
        return cleanSlug + (page > 1 ? ((cleanSlug.indexOf("?") >= 0 ? "&" : "?") + "page=" + page) : "");
    }

    if (cleanSlug.indexOf("/") === 0) {
        cleanSlug = cleanSlug.substring(1);
    }

    if (!cleanSlug) {
        return page > 1 ? (BASE_URL + "/page/" + page + "/") : (BASE_URL + "/");
    }

    var target = BASE_URL + "/" + cleanSlug.replace(/\/+$/, "");
    return page > 1 ? (target + "/page/" + page + "/") : (target + "/");
}

function getUrlSearch(keyword, filtersJson) {
    var page = _parsePage(filtersJson);
    var kw = encodeURIComponent(String(keyword || "").trim());
    var url = BASE_URL + "/?s=" + kw;
    if (page > 1) {
        url += "&paged=" + page + "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug, datasend) {
    var cleanSlug = _stripPipe(slug || "");

    if (datasend) {
        try {
            var epObj = JSON.parse(decodeURIComponent(datasend));
            if (epObj && (epObj.embed || epObj.m3u8 || epObj.url)) {
                return epObj.embed || epObj.m3u8 || epObj.url;
            }
        } catch (e1) {
            try {
                var epObj2 = JSON.parse(datasend);
                if (epObj2 && (epObj2.embed || epObj2.m3u8 || epObj2.url)) {
                    return epObj2.embed || epObj2.m3u8 || epObj2.url;
                }
            } catch (e2) {}
        }
    }

    if (!cleanSlug) return BASE_URL + "/";
    if (/^https?:\/\//i.test(cleanSlug)) return cleanSlug;
    return _resolveUrl(cleanSlug, BASE_URL);
}

function _extractTotalPages(html, currentPage) {
    var maxPage = currentPage || 1;
    var pageMatches = String(html || "").match(/(?:\/page\/(\d+)|[?&](?:page|paged)=(\d+))/gi) || [];
    for (var i = 0; i < pageMatches.length; i++) {
        var m = pageMatches[i].match(/(\d+)/);
        if (m && m[1]) {
            var p = parseInt(m[1], 10);
            if (!isNaN(p) && p > maxPage && p < 10000) {
                maxPage = p;
            }
        }
    }
    return maxPage;
}

function _parseVideoListHtml(html, apiUrl) {
    var items = [];
    var seenUrls = {};
    var raw = String(html || "");
    var currentPage = 1;

    try {
        var pMatch = apiUrl && apiUrl.match(/(?:\/page\/(\d+)|[?&](?:page|paged)=(\d+))/i);
        if (pMatch && (pMatch[1] || pMatch[2])) {
            currentPage = parseInt(pMatch[1] || pMatch[2], 10) || 1;
        }
    } catch (e) {}

    var totalPages = _extractTotalPages(raw, currentPage);

    var articleRegex = /<(?:article|div)[^>]*class=["'][^"']*(?:video|post|item|thumb|card|entry)[^"']*["'][^>]*>([\s\S]*?)<\/(?:article|div)>/gi;
    var blockMatch;

    while ((blockMatch = articleRegex.exec(raw)) !== null) {
        var block = blockMatch[1] || "";
        var linkMatch = block.match(/<a[^>]+href=["']([^"'#]+)["'][^>]*(?:title=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/a>/i);
        if (!linkMatch) continue;

        var href = _resolveUrl(linkMatch[1], apiUrl || BASE_URL);
        if (!href || href === BASE_URL || href === BASE_URL + "/" || seenUrls[href]) continue;
        if (/\/(?:category|tag|actor|actress|model|pornstar|page|search|dmca|privacy|terms|contact)\b/i.test(href)) continue;

        var imgMatch = block.match(/<img[^>]+(?:data-src|data-lazy-src|data-original|src)=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/i);
        var poster = imgMatch && imgMatch[1] ? _resolveUrl(imgMatch[1], apiUrl || BASE_URL) : "";

        var titleAttr = linkMatch[2] || "";
        var imgAlt = imgMatch && imgMatch[2] ? imgMatch[2] : "";
        var titleTagMatch = block.match(/<(?:h[1-6]|span|div|p)[^>]*class=["'][^"']*(?:title|name|video-title|entry-title)[^"']*["'][^>]*>([\s\S]*?)<\/(?:h[1-6]|span|div|p)>/i);
        var innerTitle = titleTagMatch ? titleTagMatch[1].replace(/<[^>]+>/g, "") : linkMatch[3].replace(/<[^>]+>/g, "");

        var title = _decodeHtml(titleAttr || titleTagMatch && innerTitle || imgAlt || innerTitle);
        if (!title || title.length < 2) continue;

        var durMatch = block.match(/(?:duration|time|length)[^>]*>\s*([0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)\s*</i);
        var duration = durMatch ? durMatch[1].trim() : "";

        var qualMatch = block.match(/(?:quality|hd|4k|1080p|720p)[^>]*>\s*(4K|1080P|720P|HD|SD)\s*</i);
        var quality = qualMatch ? qualMatch[1].toUpperCase() : "";

        seenUrls[href] = true;
        items.push({
            id: href,
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: duration ? ("Thời lượng: " + duration) : title,
            quality: quality,
            episode_current: duration,
            lang: ""
        });
    }

    if (items.length === 0) {
        var anchorRegex = /<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var aMatch;
        while ((aMatch = anchorRegex.exec(raw)) !== null) {
            var aHref = _resolveUrl(aMatch[1], apiUrl || BASE_URL);
            if (!aHref || seenUrls[aHref] || aHref.indexOf(BASE_URL) !== 0) continue;
            if (/\/(?:page\/\d+|category|tag|actor|actress|model|pornstar|dmca|privacy|terms)\b/i.test(aHref)) continue;
            if (aHref === BASE_URL || aHref === BASE_URL + "/") continue;

            var aInner = aMatch[2] || "";
            var aImg = aInner.match(/<img[^>]+(?:data-src|data-lazy-src|src)=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/i);
            if (!aImg) continue;

            var aPoster = _resolveUrl(aImg[1], apiUrl || BASE_URL);
            var aTitle = _decodeHtml(aImg[2] || aInner.replace(/<[^>]+>/g, ""));
            if (!aTitle || aTitle.length < 2) continue;

            seenUrls[aHref] = true;
            items.push({
                id: aHref,
                title: aTitle,
                posterUrl: aPoster,
                backdropUrl: aPoster,
                description: aTitle,
                quality: "",
                episode_current: "",
                lang: ""
            });
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

function parseListResponse(html, apiUrl, datasend) {
    return _parseVideoListHtml(html, apiUrl);
}

function parseSearchResponse(html, apiUrl, datasend) {
    return _parseVideoListHtml(html, apiUrl);
}

function _extractSourcesFromHtml(html, baseRef) {
    var sources = [];
    var seen = {};
    var raw = String(html || "").replace(/\\\//g, "/");

    function addSource(name, url, isEmbed) {
        var resolved = _resolveUrl(url, baseRef);
        if (!resolved || !/^https?:\/\//i.test(resolved) || seen[resolved]) return;
        seen[resolved] = true;
        sources.push({
            name: name || "Server",
            url: resolved,
            isEmbed: Boolean(isEmbed)
        });
    }

    var mediaRegex = /(https?:\/\/[^\s"'<>\\]+\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/gi;
    var mMatch;
    var mediaIdx = 1;
    while ((mMatch = mediaRegex.exec(raw)) !== null) {
        var mUrl = mMatch[1];
        var isDirect = /\.(?:m3u8|mp4)(?:\?|$)/i.test(mUrl);
        addSource("Direct #" + mediaIdx++, mUrl, !isDirect);
    }

    var iframeRegex = /<iframe[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>/gi;
    var iMatch;
    var iframeIdx = 1;
    while ((iMatch = iframeRegex.exec(raw)) !== null) {
        var iUrl = iMatch[1];
        if (/google|facebook|twitter|disqus|histats|googletagmanager|analytics|ad/i.test(iUrl) && !/player|embed|stream|video/i.test(iUrl)) {
            continue;
        }
        addSource("Embed #" + iframeIdx++, iUrl, true);
    }

    var srcFieldRegex = /["']?(?:file|url|stream|m3u8|embed|iframe|src)["']?\s*[:=]\s*["'](https?:\/\/[^"'\s<>\\]+)["']/gi;
    var sMatch;
    var fieldIdx = 1;
    while ((sMatch = srcFieldRegex.exec(raw)) !== null) {
        var fUrl = sMatch[1];
        var fIsDirect = /\.(?:m3u8|mp4)(?:\?|$)/i.test(fUrl);
        addSource("Stream #" + fieldIdx++, fUrl, !fIsDirect);
    }

    return sources;
}

function parseMovieDetail(html, apiUrl, datasend) {
    var cleanUrl = _resolveUrl(_stripPipe(apiUrl || ""), BASE_URL);
    var raw = String(html || "");

    var h1Match = raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    var ogTitleMatch = raw.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    var titleTagMatch = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    var title = _decodeHtml(
        (h1Match && h1Match[1].replace(/<[^>]+>/g, "")) ||
        (ogTitleMatch && ogTitleMatch[1]) ||
        (titleTagMatch && titleTagMatch[1].replace(/\s*[-|–—]\s*javhdz.*$/i, "").replace(/<[^>]+>/g, "")) ||
        cleanUrl
    );

    var ogImgMatch = raw.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    var videoPosterMatch = raw.match(/<video[^>]+poster=["']([^"']+)["']/i);
    var poster = _resolveUrl(
        (ogImgMatch && ogImgMatch[1]) ||
        (videoPosterMatch && videoPosterMatch[1]) ||
        "",
        cleanUrl
    );

    var ogDescMatch = raw.match(/<meta[^>]+(?:name=["']description["']|property=["']og:description["'])[^>]+content=["']([^"']+)["']/i);
    var descTagMatch = raw.match(/<(?:div|p)[^>]*class=["'][^"']*(?:desc|description|synopsis|entry-content)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p)>/i);
    var description = _decodeHtml(
        (ogDescMatch && ogDescMatch[1]) ||
        (descTagMatch && descTagMatch[1].replace(/<[^>]+>/g, "")) ||
        title
    );

    var categories = [];
    var catRegex = /<a[^>]+href=["'][^"']*\/(?:category|tag|genre|actor|actress|model|pornstar)\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    var cMatch;
    var seenCat = {};
    while ((cMatch = catRegex.exec(raw)) !== null) {
        var cName = _decodeHtml(cMatch[1].replace(/<[^>]+>/g, ""));
        if (cName && !seenCat[cName]) {
            seenCat[cName] = true;
            categories.push(cName);
        }
    }

    var foundSources = _extractSourcesFromHtml(raw, cleanUrl);
    var episodes = [];

    if (foundSources.length > 0) {
        for (var i = 0; i < foundSources.length; i++) {
            var srcItem = foundSources[i];
            var payload = encodeURIComponent(JSON.stringify({
                url: srcItem.url,
                embed: srcItem.isEmbed ? srcItem.url : "",
                m3u8: !srcItem.isEmbed ? srcItem.url : "",
                server: srcItem.name
            }));
            episodes.push({
                id: srcItem.url + "|data:" + payload,
                name: srcItem.name,
                slug: "ep-" + (i + 1)
            });
        }
    } else if (cleanUrl) {
        var fallbackPayload = encodeURIComponent(JSON.stringify({
            url: cleanUrl,
            embed: cleanUrl,
            server: "Server 1"
        }));
        episodes.push({
            id: cleanUrl + "|data:" + fallbackPayload,
            name: "Full",
            slug: "ep-1"
        });
    }

    var servers = episodes.length > 0 ? [{
        name: "Default",
        episodes: episodes
    }] : [];

    return JSON.stringify({
        id: cleanUrl,
        title: title,
        posterUrl: poster,
        backdropUrl: poster,
        description: description,
        servers: servers,
        category: categories.join(", ")
    });
}

function _buildStreamResult(targetUrl, fallbackReferer) {
    var clean = _resolveUrl(_stripPipe(targetUrl || ""), fallbackReferer || BASE_URL);
    if (!clean) {
        return JSON.stringify({ url: "", isEmbed: false });
    }

    var isM3u8 = /\.m3u8(\?|$)/i.test(clean);
    var isMp4 = /\.mp4(\?|$)/i.test(clean);
    var isDirect = isM3u8 || isMp4 || /\.(mkv|mpd|webm)(\?|$)/i.test(clean);
    var ref = fallbackReferer || _originFromUrl(clean) || (BASE_URL + "/");

    if (isDirect) {
        var mime = "";
        if (isM3u8) mime = "application/x-mpegURL";
        else if (isMp4) mime = "video/mp4";
        else if (/\.webm(\?|$)/i.test(clean)) mime = "video/webm";
        else if (/\.mpd(\?|$)/i.test(clean)) mime = "application/dash+xml";
        else if (/\.mkv(\?|$)/i.test(clean)) mime = "video/x-matroska";

        return JSON.stringify({
            url: clean,
            isEmbed: false,
            mimeType: mime,
            headers: {
                "Referer": ref,
                "User-Agent": DEFAULT_UA
            }
        });
    }

    return JSON.stringify({
        url: clean,
        isEmbed: true,
        headers: {
            "Referer": ref,
            "User-Agent": DEFAULT_UA,
            "Block-Ads": "true",
            "Block-Redirects": "true"
        }
    });
}

function parseDetailResponse(html, apiUrl, datasend) {
    var rawStr = html === undefined || html === null ? "" : String(html);
    var rawData = _getPipeData(apiUrl, datasend);

    if (rawData) {
        try {
            var epObj = JSON.parse(decodeURIComponent(rawData));
            if (epObj && (epObj.m3u8 || epObj.embed || epObj.url)) {
                return _buildStreamResult(epObj.m3u8 || epObj.embed || epObj.url, apiUrl);
            }
        } catch (e1) {
            try {
                var epObj2 = JSON.parse(rawData);
                if (epObj2 && (epObj2.m3u8 || epObj2.embed || epObj2.url)) {
                    return _buildStreamResult(epObj2.m3u8 || epObj2.embed || epObj2.url, apiUrl);
                }
            } catch (e2) {}
        }
    }

    var sources = _extractSourcesFromHtml(rawStr, apiUrl || BASE_URL);
    if (sources.length > 0) {
        var direct = null;
        for (var i = 0; i < sources.length; i++) {
            if (!sources[i].isEmbed) {
                direct = sources[i];
                break;
            }
        }
        var chosen = direct || sources[0];
        return _buildStreamResult(chosen.url, apiUrl || BASE_URL);
    }

    var cleanApiUrl = _stripPipe(apiUrl || "");
    if (cleanApiUrl && /^https?:\/\//i.test(cleanApiUrl)) {
        return _buildStreamResult(cleanApiUrl, cleanApiUrl);
    }

    return JSON.stringify({ url: "", isEmbed: false });
}

function parseEmbedResponse(html, url) {
    var rawStr = html === undefined || html === null ? "" : String(html);
    var cleanSrc = _resolveUrl(_stripPipe(url || ""), BASE_URL);
    var baseRef = _originFromUrl(cleanSrc);

    var sources = _extractSourcesFromHtml(rawStr, cleanSrc || baseRef);
    for (var i = 0; i < sources.length; i++) {
        if (!sources[i].isEmbed) {
            return _buildStreamResult(sources[i].url, cleanSrc || baseRef);
        }
    }

    for (var j = 0; j < sources.length; j++) {
        if (sources[j].url && sources[j].url !== cleanSrc) {
            return JSON.stringify({
                url: sources[j].url,
                isEmbed: true,
                headers: {
                    "Referer": cleanSrc || baseRef,
                    "User-Agent": DEFAULT_UA,
                    "Block-Ads": "true",
                    "Block-Redirects": "true"
                }
            });
        }
    }

    if (cleanSrc && /^https?:\/\//i.test(cleanSrc)) {
        return _buildStreamResult(cleanSrc, baseRef);
    }

    return JSON.stringify({ url: "", isEmbed: false });
}
