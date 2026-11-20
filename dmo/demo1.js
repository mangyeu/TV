// =============================================================================
// CONFIGURATION & METADATA - TVHAY.BUZZ (ES5)
// =============================================================================

var BASE_URL = "https://tvhay.buzz";

function log(msg) {
    if (typeof nativeLog !== "undefined") {
        nativeLog("[TVHAY] " + msg);
    } else if (typeof console !== "undefined" && console.log) {
        console.log("[TVHAY] " + msg);
    }
}

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHAY",
        "version": "2.4.3",
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

function decodeText(s) {
    if (!s) return "";
    return String(s)
        .replace(/&/g, "&")
        .replace(/&/g, "&")
        .replace(/\\u0026/g, "&")
        .replace(/\\x3D/gi, "=")
        .replace(/\\\//g, "/")
        .replace(/"/g, '"')
        .replace(/'/g, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/&#(\d+);/g, function (m, n) {
            return String.fromCharCode(parseInt(n, 10));
        });
}

function cleanText(html) {
    return trimStr(
        decodeText(
            String(html || "")
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
        ).replace(/\s+/g, " ")
    );
}

function toAbsUrl(url, base) {
    var root = (base || BASE_URL).replace(/\/+$/, "");
    var u = trimStr(decodeText(url));
    if (!u || u.indexOf("data:") === 0 || u.indexOf("javascript:") === 0) return "";
    if (/^https?:\/\//i.test(u)) return u;
    if (u.indexOf("//") === 0) return "https:" + u;
    if (u.charAt(0) === "/") return root + u;
    return root + "/" + u;
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
    if (/\/(?:the-loai|quoc-gia|nam|nam-phat-hanh|danh-sach|tag|page|wp-content|wp-admin|wp-json|feed|xem)\//i.test(u)) {
        return false;
    }
    if (/\?(?:s|page|paged|filter)=/i.test(u)) return false;
    return true;
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
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": referer || (BASE_URL + "/")
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

function extractPlayerIframe(html, pageUrl) {
    var src = decodeText(String(html || ""));

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

function extractDirectStream(html) {
    var src = decodeText(String(html || ""));
    var m = src.match(/https?:\/\/[^"'<> \r\n\\]+\.(?:m3u8|mp4)(?:\?[^"'<> \r\n\\]*)?/i);
    return m ? decodeText(m[0]) : "";
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

        var url = BASE_URL + "/?s=" + encodeURIComponent(keyword || "");
        if (page > 1) {
            url += "&paged=" + page;
        }
        log("getUrlSearch -> " + url);
        return url;
    } catch (e) {
        return BASE_URL + "/?s=" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (/^https?:\/\//i.test(slug)) return slug;
    return BASE_URL + "/" + String(slug).replace(/^\/+/, "");
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
        id: extractSlug(url),
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
        var src = decodeText(String(htmlContent || ""));
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
            title = trimStr(decodeText(title));

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
                cardTitle = trimStr(decodeText(cardTitle));

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
    return parseListResponse(htmlContent);
}

function parseMovieDetail(htmlContent, pageUrl) {
    try {
        var src = decodeText(String(htmlContent || ""));
        var cleanUrl = toAbsUrl(pageUrl || "");

        var ogTitle = (src.match(/<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']*)["']/i) || [])[1] || "";
        var docTitle = cleanText((src.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
        var title = trimStr(decodeText(ogTitle || docTitle).replace(/\s*(?:\||-)\s*TVHAY.*$/i, ""));

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

        var year = 0;
        var yearMatch = /\b(19\d{2}|20\d{2})\b/.exec(title + " " + description);
        if (yearMatch) year = parseInt(yearMatch[1], 10);

        var episodes = [];
        var seenEp = {};
        var epLinks = src.match(/<a[^>]+href=["'][^"']*\/xem\/[^"']+["'][^>]*>[\s\S]*?<\/a>/gi) || [];

        for (var i = 0; i < epLinks.length; i++) {
            var epHref = toAbsUrl((epLinks[i].match(/href=["']([^"']+)["']/i) || [])[1] || "");
            if (!epHref || seenEp[epHref]) continue;
            seenEp[epHref] = true;

            var epName = cleanText(epLinks[i]) || ("Tập " + (episodes.length + 1));
            episodes.push({
                id: epHref,
                name: epName,
                slug: epHref
            });
        }

        var slug = extractSlug(cleanUrl) ||
            extractSlug((src.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1] || "");

        if (episodes.length === 0 && slug) {
            var fallbackWatch = BASE_URL + "/xem/" + slug + "/tap-1";
            episodes.push({
                id: fallbackWatch,
                name: "Tập 1",
                slug: fallbackWatch
            });
        }

        var servers = [
            { name: "H.PRO", episodes: episodes },
            { name: "S.PRO", episodes: episodes }
        ];

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
            episode_current: episodes.length > 0 ? episodes[episodes.length - 1].name : "",
            lang: "",
            category: "",
            country: "",
            director: "",
            casts: "",
            extra: episodes.length > 0 ? episodes[0].slug : ""
        });
    } catch (error) {
        log("parseMovieDetail error: " + error);
        return "null";
    }
}

function parseDetailResponse(htmlContent, pageUrl) {
    try {
        var src = decodeText(String(htmlContent || ""));
        var ref = decodeText(pageUrl || "") || (BASE_URL + "/");
        log("parseDetailResponse: " + ref);

        var directStream = extractDirectStream(src);
        if (directStream) {
            return JSON.stringify({
                url: directStream,
                isEmbed: false,
                mimeType: /\.m3u8(?:\?|$)/i.test(directStream) ? "application/x-mpegURL" : "video/mp4",
                headers: defaultHeaders(ref),
                subtitles: []
            });
        }

        var embedUrl = extractPlayerIframe(src, ref);
        if (embedUrl) {
            log("parseDetailResponse iframe: " + embedUrl);
            return JSON.stringify({
                url: embedUrl,
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
        var src = decodeText(String(htmlContent || ""));
        var ref = decodeText(url || "") || (BASE_URL + "/");
        log("parseEmbedResponse: " + ref);

        var streamUrl = extractDirectStream(src);
        if (streamUrl) {
            log("parseEmbedResponse stream: " + streamUrl);
            return JSON.stringify({
                url: streamUrl,
                isEmbed: false,
                mimeType: /\.m3u8(?:\?|$)/i.test(streamUrl) ? "application/x-mpegURL" : "video/mp4",
                headers: defaultHeaders(ref),
                subtitles: []
            });
        }

        var nestedIframe = extractPlayerIframe(src, ref);
        if (nestedIframe && nestedIframe !== ref) {
            log("parseEmbedResponse nested iframe: " + nestedIframe);
            return JSON.stringify({
                url: nestedIframe,
                isEmbed: true,
                headers: defaultHeaders(ref),
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
        var src = decodeText(String(htmlContent || ""));
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
        var src = decodeText(String(htmlContent || ""));
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
        var src = decodeText(String(htmlContent || ""));
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
