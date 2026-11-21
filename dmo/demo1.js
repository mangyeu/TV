// =============================================================================
// CONFIGURATION & METADATA - TVHAY.BUZZ (ES5)
// =============================================================================

var BASE_URL = "https://tvhay.buzz";

function log(msg) {
    try {
        if (typeof nativeLog !== "undefined") {
            nativeLog("[TVHAY] " + msg);
        } else if (typeof console !== "undefined" && console.log) {
            console.log("[TVHAY] " + msg);
        }
    } catch (e) {}
}

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHAY",
        "version": "2.9.0",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "playerType": "exoplayer",
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "the-loai" },
        { slug: "tv-show", title: "TV Show", type: "Horizontal", path: "the-loai" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "TV Show", slug: "tv-show" }
    ]);
}

function getFilterConfig() {
    var years = [{ name: "Năm", value: "" }];
    var nowYear = new Date().getFullYear();
    for (var y = nowYear; y >= 2000; y--) {
        years.push({ name: String(y), value: String(y) });
    }

    return JSON.stringify({
        sort: [
            { name: "Sắp xếp", value: "" },
            { name: "Mới cập nhật", value: "update" },
            { name: "Thời gian đăng", value: "create" },
            { name: "Năm sản xuất", value: "year" },
            { name: "Lượt xem", value: "view" }
        ],
        type: [
            { name: "Tất cả", value: "" },
            { name: "Phim bộ", value: "series" },
            { name: "Phim lẻ", value: "single" }
        ],
        category: [
            { name: "Thể loại", value: "" },
            { name: "Hành Động", value: "hanh-dong" },
            { name: "Tình Cảm", value: "tinh-cam" },
            { name: "Hài Hước", value: "hai-huoc" },
            { name: "Cổ Trang", value: "co-trang" },
            { name: "Tâm Lý", value: "tam-ly" },
            { name: "Hình Sự", value: "hinh-su" },
            { name: "Viễn Tưởng", value: "vien-tuong" },
            { name: "Phiêu Lưu", value: "phieu-luu" },
            { name: "Hoạt Hình", value: "hoat-hinh" },
            { name: "Kinh Dị", value: "kinh-di" }
        ],
        country: [
            { name: "Quốc gia", value: "" },
            { name: "Trung Quốc", value: "trung-quoc" },
            { name: "Hàn Quốc", value: "han-quoc" },
            { name: "Nhật Bản", value: "nhat-ban" },
            { name: "Âu Mỹ", value: "au-my" },
            { name: "Thái Lan", value: "thai-lan" },
            { name: "Việt Nam", value: "viet-nam" }
        ],
        year: years
    });
}

// =============================================================================
// HELPERS
// =============================================================================

function trimStr(s) {
    return String(s || "").replace(/^\s+|\s+$/g, "");
}

function unescapeStreamStr(str) {
    return String(str || "")
        .replace(/\\u0026/gi, "&")
        .replace(/\\u002F/gi, "/")
        .replace(/\\x3D/gi, "=")
        .replace(/\\\//g, "/")
        .replace(/&/gi, "&")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/</gi, "<")
        .replace(/>/gi, ">")
        .replace(/&#(\d+);/g, function (m, n) {
            return String.fromCharCode(parseInt(n, 10));
        });
}

function decodeUrlDeep(val) {
    var cur = trimStr(unescapeStreamStr(String(val || "")));
    for (var i = 0; i < 3; i++) {
        try {
            var next = decodeURIComponent(cur);
            if (next === cur) break;
            cur = next;
        } catch (e) {
            break;
        }
    }
    return trimStr(unescapeStreamStr(cur));
}

function cleanText(html) {
    return trimStr(
        unescapeStreamStr(
            String(html || "")
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
        ).replace(/\s+/g, " ")
    );
}

function toAbsUrl(url, base) {
    var root = String(base || BASE_URL).replace(/\/+$/, "");
    var u = trimStr(unescapeStreamStr(url));
    if (!u || u.indexOf("data:") === 0 || u.indexOf("javascript:") === 0) return "";
    if (/^https?:\/\//i.test(u)) return u;
    if (u.indexOf("//") === 0) return "https:" + u;
    if (u.charAt(0) === "/") return root + u;
    return root + "/" + u;
}

function extractMovieId(url) {
    var raw = trimStr(unescapeStreamStr(url || ""));
    if (!raw) return "";
    var clean = raw.replace(/^https?:\/\/[^/]+/i, "");
    return clean || raw;
}

function extractSlug(url) {
    var s = String(url || "").split("?")[0].split("#")[0].replace(/\/+$/, "");
    if (!s) return "";
    var parts = s.split("/");
    return parts[parts.length - 1] || "";
}

function isMoviePageUrl(url) {
    if (!url) return false;
    var u = String(url).toLowerCase();
    if (u === BASE_URL || u === BASE_URL + "/") return false;
    if (u.indexOf(BASE_URL) !== 0) return false;
    if (/\/(?:the-loai|quoc-gia|nam|nam-phat-hanh|danh-sach|tag|page|wp-content|wp-admin|wp-json|feed)\//i.test(u)) {
        return false;
    }
    if (/\?(?:s|page|paged|filter)=/i.test(u)) return false;
    return true;
}

function isVidsrcUrl(url) {
    return /vidsrc\.(?:xyz|to|me|in|net|pro|cc|vip)|cloudnestra\.com/i.test(String(url || ""));
}

function appendPage(url, page) {
    var p = parseInt(page || 1, 10);
    if (isNaN(p) || p <= 1) return url;
    if (url.indexOf("?") !== -1) {
        return url + "&paged=" + p;
    }
    return url.replace(/\/+$/, "") + "/page/" + p;
}

function defaultHeaders(referer) {
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": referer || (BASE_URL + "/")
    };
}

function embedHeaders(embedUrl, refererUrl) {
    var origin = BASE_URL;
    var mOrigin = String(embedUrl || "").match(/^(https?:\/\/[^/]+)/i);
    if (mOrigin && mOrigin[1]) {
        origin = mOrigin[1];
    }

    var ref = refererUrl || (BASE_URL + "/");
    if (isVidsrcUrl(embedUrl) && ref.indexOf("tvhay") === -1 && ref === embedUrl) {
        ref = BASE_URL + "/";
    }

    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Origin": isVidsrcUrl(embedUrl) ? BASE_URL : origin,
        "Referer": ref
    };
}

function getImgSrcFromTag(imgTag) {
    if (!imgTag) return "";
    var attrs = ["data-src", "data-lazy-src", "data-original", "data-srcset", "src"];
    for (var i = 0; i < attrs.length; i++) {
        var re = new RegExp(attrs[i] + '=["\']([^"\']+)["\']', "i");
        var m = imgTag.match(re);
        if (m && m[1]) {
            var val = trimStr(m[1]).split(",")[0].split(" ")[0];
            if (val && val.indexOf("data:image") !== 0) {
                return toAbsUrl(val);
            }
        }
    }
    return "";
}

function extractWatchPageUrl(html, pageUrl) {
    var src = unescapeStreamStr(String(html || ""));
    var base = pageUrl || BASE_URL;

    var watchRe = /<a[^>]+href=["']([^"']*\/(?:xem|watch)\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var wm;
    while ((wm = watchRe.exec(src)) !== null) {
        var u = toAbsUrl(wm[1], base);
        if (u) return u;
    }

    var btnRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var bm;
    while ((bm = btnRe.exec(src)) !== null) {
        var txt = cleanText(bm[2]).toLowerCase();
        if (txt.indexOf("xem phim") !== -1 || txt.indexOf("xem ngay") !== -1) {
            var uBtn = toAbsUrl(bm[1], base);
            if (uBtn && uBtn !== toAbsUrl(base)) return uBtn;
        }
    }

    return "";
}

function extractStreamFromIframeQuery(iframeUrl) {
    var raw = unescapeStreamStr(String(iframeUrl || ""));
    var m = raw.match(/[?&]url=([^&#]+)/i);
    if (!m || !m[1]) return "";
    var decoded = decodeUrlDeep(m[1]);
    if (/^https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4)(?:\?[^\s"'<>]*)?$/i.test(decoded)) {
        return decoded;
    }
    return "";
}

function extractPlayerLinkFromVars(html, pageUrl) {
    var src = unescapeStreamStr(String(html || ""));
    var mHPro = src.match(/\blinkHPro\s*=\s*["']([^"']+)["']/i);
    var mSPro = src.match(/\blinkSPro\s*=\s*["']([^"']+)["']/i);

    var hPro = (mHPro && mHPro[1]) ? toAbsUrl(mHPro[1], pageUrl) : "";
    var sPro = (mSPro && mSPro[1]) ? toAbsUrl(mSPro[1], pageUrl) : "";

    if (hPro && (/phimapi|\.m3u8/i.test(hPro) || !sPro || isVidsrcUrl(sPro))) {
        return hPro;
    }
    if (sPro) {
        return sPro;
    }
    return hPro || "";
}

function extractPlayerIframe(html, pageUrl) {
    var src = unescapeStreamStr(String(html || ""));
    var idMatch = src.match(/<iframe[^>]+id=["']movie-iframe["'][^>]*>/i);
    if (idMatch) {
        var s1 = (idMatch[0].match(/(?:src|data-src)=["']([^"']+)["']/i) || [])[1];
        if (s1) return toAbsUrl(s1, pageUrl);
    }
    var boxMatch = src.match(/(?:player-frame|watch-wrapper)[\s\S]*?<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);
    if (boxMatch && boxMatch[1]) {
        return toAbsUrl(boxMatch[1], pageUrl);
    }
    var anyMatch = src.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);
    return anyMatch && anyMatch[1] ? toAbsUrl(anyMatch[1], pageUrl) : "";
}

function findMediaUrl(html, baseUrl) {
    var raw = unescapeStreamStr(String(html || ""));
    var base = baseUrl || "https://v13.streamvsmov.com/";

    var absMedia = raw.match(/https?:\/\/[^"'<> \r\n\\]+\.(?:m3u8|mp4|vl)(?:\?[^"'<> \r\n\\]*)?/i);
    if (absMedia) return absMedia[0];

    var propPatterns = [
        /(?:file|src|source|url|stream|hls|playlist)\s*[:=]\s*["']([^"']+(?:\.m3u8|\.mp4|\.vl|\/playlist|\/stream|\/manifest)[^"']*)["']/i,
        /"(?:file|src|source|url|stream|hls|playlist)"\s*:\s*"([^"]+)"/i
    ];

    for (var i = 0; i < propPatterns.length; i++) {
        var pm = raw.match(propPatterns[i]);
        if (pm && pm[1]) {
            var candidate = unescapeStreamStr(pm[1]);
            if (/^https?:\/\//i.test(candidate) || candidate.charAt(0) === "/") {
                return toAbsUrl(candidate, base);
            }
        }
    }

    var relMedia = raw.match(/\/[^"'<> \r\n\\]+\.(?:m3u8|mp4|vl)(?:\?[^"'<> \r\n\\]*)?/i);
    if (relMedia) return toAbsUrl(relMedia[0], base);

    return "";
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page || 1, 10);
        if (isNaN(page) || page < 1) page = 1;

        var params = [];
        if (filters.sort) params.push("sort=" + encodeURIComponent(filters.sort));
        if (filters.type) params.push("type=" + encodeURIComponent(filters.type));
        if (filters.category) params.push("category=" + encodeURIComponent(filters.category));
        if (filters.country) params.push("country=" + encodeURIComponent(filters.country));
        if (filters.year) params.push("year=" + encodeURIComponent(filters.year));

        if (params.length > 0) {
            return appendPage(BASE_URL + "/?" + params.join("&"), page);
        }

        var path = (!slug || slug === "phim-moi-cap-nhat" || slug === "phim-moi")
            ? ""
            : "/" + String(slug).replace(/^\/+/, "");

        var finalUrl = appendPage(BASE_URL + path, page);
        log("getUrlList -> " + finalUrl);
        return finalUrl;
    } catch (e) {
        return BASE_URL;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page || 1, 10);
        if (isNaN(page) || page < 1) page = 1;

        var url = BASE_URL + "/index.php?view=ajax-search&keyword=" + encodeURIComponent(keyword || "");
        if (page > 1) {
            url += "&paged=" + page;
        }
        log("getUrlSearch -> " + url);
        return url;
    } catch (e) {
        return BASE_URL + "/index.php?view=ajax-search&keyword=" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var s = trimStr(unescapeStreamStr(slug));
    if (/^https?:\/\//i.test(s)) {
        log("getUrlDetail -> " + s);
        return s;
    }
    var full = BASE_URL + "/" + s.replace(/^\/+/, "");
    log("getUrlDetail -> " + full);
    return full;
}

function getUrlCategories() {
    return BASE_URL + "/the-loai";
}

function getUrlCountries() {
    return BASE_URL + "/quoc-gia";
}

function getUrlYears() {
    return BASE_URL + "/nam-phat-hanh";
}

// =============================================================================
// HTML PARSERS
// =============================================================================

function buildMovieItem(url, title, posterUrl, rawHtml) {
    var year = 0;
    var yearMatch = /\b(19\d{2}|20\d{2})\b/.exec(title + " " + rawHtml);
    if (yearMatch) year = parseInt(yearMatch[1], 10);

    var epMatch = /(?:Tập\s*\d+|Hoàn\s*tất\s*\(\d+\/\d+\)|Full)/i.exec(rawHtml);
    var episodeCurrent = epMatch ? trimStr(epMatch[0]) : "";

    var qualMatch = /\b(4K|Full\s*HD|FHD|HD|CAM|SD)\b/i.exec(rawHtml);
    var quality = qualMatch ? trimStr(qualMatch[1]) : "";

    var lang = "";
    if (/vietsub/i.test(rawHtml) && /thuyết\s*minh/i.test(rawHtml)) lang = "Vietsub + Thuyết Minh";
    else if (/thuyết\s*minh/i.test(rawHtml)) lang = "Thuyết Minh";
    else if (/vietsub/i.test(rawHtml)) lang = "Vietsub";
    else if (/lồng\s*tiếng/i.test(rawHtml)) lang = "Lồng Tiếng";

    return {
        id: extractMovieId(url) || extractSlug(url),
        title: title,
        posterUrl: posterUrl,
        backdropUrl: posterUrl,
        year: year,
        quality: quality,
        episode_current: episodeCurrent,
        lang: lang
    };
}

function parseListResponse(htmlContent) {
    try {
        var src = unescapeStreamStr(String(htmlContent || ""));
        log("parseListResponse html length: " + src.length);

        var movies = [];
        var seen = {};

        var blocks = src.match(/<article[\s\S]*?<\/article>/gi);
        if (!blocks || blocks.length === 0) {
            blocks = src.match(/<li[^>]+class=["'][^"']*(?:item|movie|film|post|grid)[^"']*["'][\s\S]*?<\/li>/gi) || [];
        }

        for (var i = 0; i < blocks.length; i++) {
            var box = blocks[i];
            var linkMatch = box.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
            if (!linkMatch) continue;

            var url = toAbsUrl(linkMatch[1]);
            if (!isMoviePageUrl(url) || seen[url]) continue;

            var imgMatch = box.match(/<img[^>]+>/i);
            var posterUrl = imgMatch ? getImgSrcFromTag(imgMatch[0]) : "";

            var title =
                (box.match(/title=["']([^"']+)["']/i) || [])[1] ||
                (imgMatch ? ((imgMatch[0].match(/alt=["']([^"']+)["']/i) || [])[1] || "") : "") ||
                cleanText((box.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i) || [])[1] || "") ||
                cleanText(box);
            title = trimStr(unescapeStreamStr(title));

            if (!title) continue;
            seen[url] = true;
            movies.push(buildMovieItem(url, title, posterUrl, box));
        }

        if (movies.length === 0) {
            var anchorCardRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?<img[^>]+>[\s\S]*?)<\/a>/gi;
            var am;
            while ((am = anchorCardRe.exec(src)) !== null) {
                var cardUrl = toAbsUrl(am[1]);
                if (!isMoviePageUrl(cardUrl) || seen[cardUrl]) continue;

                var inner = am[2];
                var cardImgMatch = inner.match(/<img[^>]+>/i);
                var cardPoster = cardImgMatch ? getImgSrcFromTag(cardImgMatch[0]) : "";
                if (!cardPoster) continue;

                var cardTitle =
                    (am[0].match(/title=["']([^"']+)["']/i) || [])[1] ||
                    (cardImgMatch ? ((cardImgMatch[0].match(/alt=["']([^"']+)["']/i) || [])[1] || "") : "") ||
                    cleanText(inner);
                cardTitle = trimStr(unescapeStreamStr(cardTitle));

                if (!cardTitle || cardTitle.length < 2) continue;
                seen[cardUrl] = true;
                movies.push(buildMovieItem(cardUrl, cardTitle, cardPoster, inner));
            }
        }

        var totalPages = 1;
        var pagePattern = /(?:\/page\/(\d+)|[?&](?:paged|page)=(\d+))/gi;
        var pMatch;
        while ((pMatch = pagePattern.exec(src)) !== null) {
            var pNum = parseInt(pMatch[1] || pMatch[2], 10);
            if (!isNaN(pNum) && pNum > totalPages) totalPages = pNum;
        }

        var currentPage = 1;
        var curMatch = /<(?:span|a)[^>]+class=["'][^"']*current[^"']*["'][^>]*>(\d+)<\/(?:span|a)>/i.exec(src);
        if (curMatch) currentPage = parseInt(curMatch[1], 10) || 1;

        log("parseListResponse parsed items: " + movies.length);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalPages * 20,
                itemsPerPage: 20
            }
        });
    } catch (error) {
        log("parseListResponse error: " + error);
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 }
        });
    }
}

function parseSearchResponse(htmlContent) {
    try {
        var raw = trimStr(unescapeStreamStr(String(htmlContent || "")));
        if (raw.charAt(0) === "[") {
            var arr = JSON.parse(raw);
            var items = [];
            for (var i = 0; i < arr.length; i++) {
                var m = arr[i] || {};
                var slug = trimStr(m.slug || "");
                var href = slug ? ("/phim/" + slug.replace(/^\/+/, "")) : "";
                var title = trimStr(unescapeStreamStr(m.name || ""));
                if (!title) continue;
                var poster = toAbsUrl(m.thumb || "");
                var yr = parseInt(m.year || 0, 10) || 0;
                var lang = trimStr(m.lang || "");
                items.push({
                    id: href || slug,
                    title: title,
                    posterUrl: poster,
                    backdropUrl: poster,
                    year: yr,
                    quality: "",
                    episode_current: "",
                    lang: lang
                });
            }
            return JSON.stringify({
                items: items,
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: items.length,
                    itemsPerPage: items.length || 20
                }
            });
        }
    } catch (e) {
        log("parseSearchResponse json error: " + e);
    }
    return parseListResponse(htmlContent);
}

function parseServersFromWatchHtml(src, pageUrl) {
    var servers = [];
    var seenServers = {};
    var titleRe = /<div[^>]*class=["'][^"']*source-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
    var tm;

    while ((tm = titleRe.exec(src)) !== null) {
        var serverName = cleanText(tm[1]) || ("Server " + (servers.length + 1));
        var afterTitle = src.slice(tm.index + tm[0].length);
        var gridMatch = /<div[^>]*class=["'][^"']*ep-grid[^"']*["'][^>]*>([\s\S]*?)<\/div>/i.exec(afterTitle);
        if (!gridMatch) continue;

        var episodes = [];
        var seenEp = {};
        var epRe = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var em;

        while ((em = epRe.exec(gridMatch[1])) !== null) {
            var epUrl = toAbsUrl(em[1], pageUrl);
            if (!epUrl || seenEp[epUrl]) continue;
            seenEp[epUrl] = true;

            var rawEp = cleanText(em[2]);
            var epName = rawEp
                ? (/^(?:tập|ep|episode|full)/i.test(rawEp) ? rawEp : ("Tập " + rawEp))
                : ("Tập " + (episodes.length + 1));

            episodes.push({
                id: epUrl,
                name: epName,
                slug: epUrl
            });
        }

        var key = serverName + "|" + episodes.length;
        if (episodes.length > 0 && !seenServers[key]) {
            seenServers[key] = true;
            servers.push({
                name: serverName,
                episodes: episodes
            });
        }
    }

    if (servers.length === 0) {
        var gridMatchFb = /<div[^>]*class=["'][^"']*ep-grid[^"']*["'][^>]*>([\s\S]*?)<\/div>/i.exec(src);
        if (gridMatchFb) {
            var fbEps = [];
            var seenFb = {};
            var epReFb = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            var emFb;
            while ((emFb = epReFb.exec(gridMatchFb[1])) !== null) {
                var uFb = toAbsUrl(emFb[1], pageUrl);
                if (!uFb || seenFb[uFb]) continue;
                seenFb[uFb] = true;

                var rFb = cleanText(emFb[2]);
                var nFb = rFb
                    ? (/^(?:tập|ep|episode|full)/i.test(rFb) ? rFb : ("Tập " + rFb))
                    : ("Tập " + (fbEps.length + 1));

                fbEps.push({
                    id: uFb,
                    name: nFb,
                    slug: uFb
                });
            }
            if (fbEps.length > 0) {
                servers.push({
                    name: "Server #1",
                    episodes: fbEps
                });
            }
        }
    }

    if (servers.length === 0 && pageUrl && (extractPlayerLinkFromVars(src, pageUrl) || extractPlayerIframe(src, pageUrl))) {
        servers.push({
            name: "Server #1",
            episodes: [{
                id: pageUrl,
                name: "Tập 1",
                slug: pageUrl
            }]
        });
    }

    return servers;
}

function parseMovieDetail(htmlContent, pageUrl) {
    try {
        var src = unescapeStreamStr(String(htmlContent || ""));
        var cleanUrl = toAbsUrl(pageUrl || "");

        var h1Match = /<h1[^>]*class=["'][^"']*movie-h1[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i.exec(src);
        var h2Match = /<h2[^>]*class=["'][^"']*movie-h2[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i.exec(src);
        var ogTitle = (src.match(/<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']*)["']/i) || [])[1] || "";

        var rawTitle = (h1Match ? cleanText(h1Match[1]) : "") ||
            unescapeStreamStr(ogTitle) ||
            cleanText((src.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");

        var title = trimStr(
            rawTitle
                .replace(/\s+TẬP\s*\d+.*$/i, "")
                .replace(/\s*(?:\||-)\s*TVHAY.*$/i, "")
        ) || rawTitle;

        var subTitle = h2Match ? cleanText(h2Match[1]) : "";

        var posterUrl = toAbsUrl(
            (src.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']*)["']/i) || [])[1] ||
            (src.match(/<meta[^>]+(?:property|name)=["']twitter:image["'][^>]+content=["']([^"']*)["']/i) || [])[1] ||
            ""
        );

        var description = cleanText(
            (src.match(/<meta[^>]+(?:property|name)=["']og:description["'][^>]+content=["']([^"']*)["']/i) || [])[1] ||
            (src.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [])[1] ||
            ""
        );
        if (subTitle) {
            description = subTitle + (description ? "\n" + description : "");
        }

        var year = 0;
        var yearMatch = /\((\d{4})\)|\b(19\d{2}|20\d{2})\b/.exec(subTitle + " " + title + " " + description);
        if (yearMatch) year = parseInt(yearMatch[1] || yearMatch[2], 10);

        var servers = parseServersFromWatchHtml(src, cleanUrl);
        if (servers.length === 0) {
            var watchUrl = extractWatchPageUrl(src, cleanUrl);
            if (watchUrl) {
                servers.push({
                    name: "Server #1",
                    episodes: [{
                        id: watchUrl,
                        name: "Xem phim",
                        slug: watchUrl
                    }]
                });
            }
        }

        var firstServerEps = servers.length > 0 ? servers[0].episodes : [];

        var lang = "";
        var srcTitleText = servers.length > 0 ? servers[0].name : rawTitle;
        if (/lồng\s*tiếng/i.test(srcTitleText)) lang = "Lồng Tiếng";
        else if (/thuyết\s*minh/i.test(srcTitleText)) lang = "Thuyết Minh";
        else if (/vietsub/i.test(srcTitleText)) lang = "Vietsub";

        var slug = extractMovieId(cleanUrl) ||
            extractSlug((src.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1] || "");

        log("parseMovieDetail servers: " + servers.length + ", firstEps: " + firstServerEps.length);

        return JSON.stringify({
            id: slug,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            rating: 0,
            quality: "",
            servers: servers,
            episode_current: firstServerEps.length > 0 ? firstServerEps[firstServerEps.length - 1].name : "",
            lang: lang,
            category: "",
            country: "",
            director: "",
            casts: "",
            extra: firstServerEps.length > 0 ? firstServerEps[0].slug : ""
        });
    } catch (error) {
        log("parseMovieDetail error: " + error);
        return "null";
    }
}

function parseDetailResponse(htmlContent, pageUrl) {
    try {
        var src = unescapeStreamStr(String(htmlContent || ""));
        var ref = unescapeStreamStr(pageUrl || "") || (BASE_URL + "/");
        log("parseDetailResponse: " + ref);

        var directUrl = findMediaUrl(src, ref);
        if (directUrl) {
            log("parseDetailResponse direct: " + directUrl);
            return JSON.stringify({
                url: directUrl,
                isEmbed: false,
                mimeType: /\.m3u8(?:\?|$)/i.test(directUrl) ? "application/x-mpegURL" : "video/mp4",
                headers: defaultHeaders(ref),
                subtitles: []
            });
        }

        var playerVarUrl = extractPlayerLinkFromVars(src, ref);
        if (playerVarUrl) {
            var qStreamVar = extractStreamFromIframeQuery(playerVarUrl);
            if (qStreamVar) {
                log("parseDetailResponse var query stream: " + qStreamVar);
                return JSON.stringify({
                    url: qStreamVar,
                    isEmbed: false,
                    mimeType: /\.m3u8(?:\?|$)/i.test(qStreamVar) ? "application/x-mpegURL" : "video/mp4",
                    headers: defaultHeaders(ref),
                    subtitles: []
                });
            }
            var isDirectVar = /\.(?:m3u8|mp4)(?:\?|$)/i.test(playerVarUrl);
            log("parseDetailResponse var link: " + playerVarUrl);
            return JSON.stringify({
                url: playerVarUrl,
                isEmbed: !isDirectVar,
                mimeType: isDirectVar ? (/\.m3u8/i.test(playerVarUrl) ? "application/x-mpegURL" : "video/mp4") : undefined,
                headers: isDirectVar ? defaultHeaders(ref) : embedHeaders(playerVarUrl, ref),
                subtitles: []
            });
        }

        var embedUrl = extractPlayerIframe(src, ref);
        if (embedUrl) {
            var qStreamIframe = extractStreamFromIframeQuery(embedUrl);
            if (qStreamIframe) {
                log("parseDetailResponse iframe query stream: " + qStreamIframe);
                return JSON.stringify({
                    url: qStreamIframe,
                    isEmbed: false,
                    mimeType: /\.m3u8(?:\?|$)/i.test(qStreamIframe) ? "application/x-mpegURL" : "video/mp4",
                    headers: defaultHeaders(ref),
                    subtitles: []
                });
            }
            log("parseDetailResponse iframe: " + embedUrl);
            return JSON.stringify({
                url: embedUrl,
                isEmbed: true,
                headers: embedHeaders(embedUrl, ref),
                subtitles: []
            });
        }

        var watchPage = extractWatchPageUrl(src, ref);
        if (watchPage && watchPage !== ref) {
            log("parseDetailResponse watch page: " + watchPage);
            return JSON.stringify({
                url: watchPage,
                isEmbed: true,
                headers: defaultHeaders(ref),
                subtitles: []
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    } catch (error) {
        log("parseDetailResponse error: " + error);
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(htmlContent, url) {
    try {
        var src = unescapeStreamStr(String(htmlContent || ""));
        var ref = unescapeStreamStr(url || "") || (BASE_URL + "/");
        var hdrs = embedHeaders(ref, ref);
        log("parseEmbedResponse: " + ref);

        var qStream = extractStreamFromIframeQuery(ref);
        if (qStream) {
            log("parseEmbedResponse query stream: " + qStream);
            return JSON.stringify({
                url: qStream,
                isEmbed: false,
                mimeType: /\.m3u8(?:\?|$)/i.test(qStream) ? "application/x-mpegURL" : "video/mp4",
                headers: defaultHeaders(BASE_URL + "/"),
                subtitles: []
            });
        }

        var streamUrl = findMediaUrl(src, ref);
        if (streamUrl) {
            var isHlsOrMp4 = /\.(?:m3u8|mp4)(?:\?|$)/i.test(streamUrl);
            log("parseEmbedResponse stream: " + streamUrl);
            return JSON.stringify({
                url: streamUrl,
                isEmbed: false,
                mimeType: isHlsOrMp4 ? (/\.m3u8/i.test(streamUrl) ? "application/x-mpegURL" : "video/mp4") : undefined,
                headers: hdrs,
                subtitles: []
            });
        }

        var nestedIframe = extractPlayerIframe(src, ref);
        if (nestedIframe && nestedIframe !== ref) {
            var nestedQ = extractStreamFromIframeQuery(nestedIframe);
            if (nestedQ) {
                log("parseEmbedResponse nested query stream: " + nestedQ);
                return JSON.stringify({
                    url: nestedQ,
                    isEmbed: false,
                    mimeType: /\.m3u8(?:\?|$)/i.test(nestedQ) ? "application/x-mpegURL" : "video/mp4",
                    headers: defaultHeaders(ref),
                    subtitles: []
                });
            }
            log("parseEmbedResponse nested iframe: " + nestedIframe);
            return JSON.stringify({
                url: nestedIframe,
                isEmbed: true,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Referer": ref
                },
                subtitles: []
            });
        }

        var watchPage = extractWatchPageUrl(src, ref);
        if (watchPage && watchPage !== ref) {
            log("parseEmbedResponse watch page: " + watchPage);
            return JSON.stringify({
                url: watchPage,
                isEmbed: true,
                headers: defaultHeaders(ref),
                subtitles: []
            });
        }

        if (/^https?:\/\//i.test(ref)) {
            log("parseEmbedResponse fallback embed: " + ref);
            return JSON.stringify({
                url: ref,
                isEmbed: true,
                headers: hdrs,
                subtitles: []
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    } catch (error) {
        log("parseEmbedResponse error: " + error);
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseCategoriesResponse(htmlContent) {
    try {
        var src = unescapeStreamStr(String(htmlContent || ""));
        var list = [];
        var seen = {};
        var re = /<a[^>]+href=["'][^"']*\/(?:the-loai|danh-sach)\/([^"'/?#]+)\/?["'][^>]*>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = re.exec(src)) !== null) {
            var val = m[1];
            var name = cleanText(m[2]);
            if (val && name && !seen[val]) {
                seen[val] = true;
                list.push({ name: name, value: val });
            }
        }
        return JSON.stringify(list);
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(htmlContent) {
    try {
        var src = unescapeStreamStr(String(htmlContent || ""));
        var list = [];
        var seen = {};
        var re = /<a[^>]+href=["'][^"']*\/quoc-gia\/([^"'/?#]+)\/?["'][^>]*>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = re.exec(src)) !== null) {
            var val = m[1];
            var name = cleanText(m[2]);
            if (val && name && !seen[val]) {
                seen[val] = true;
                list.push({ name: name, value: val });
            }
        }
        return JSON.stringify(list);
    } catch (e) {
        return "[]";
    }
}

function parseYearsResponse(htmlContent) {
    try {
        var src = unescapeStreamStr(String(htmlContent || ""));
        var list = [];
        var seen = {};
        var re = /<a[^>]+href=["'][^"']*\/(?:nam|nam-phat-hanh)\/(\d{4})\/?["'][^>]*>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = re.exec(src)) !== null) {
            var val = m[1];
            var name = cleanText(m[2]) || val;
            if (!seen[val]) {
                seen[val] = true;
                list.push({ name: name, value: val });
            }
        }
        if (list.length > 0) return JSON.stringify(list);

        var fallback = [];
        for (var y = 2026; y >= 2000; y--) {
            fallback.push({ name: String(y), value: String(y) });
        }
        return JSON.stringify(fallback);
    } catch (e) {
        return "[]";
    }
}
