/* =========================================================
   TVHAY.BUZZ PLUGIN - VAXPLAYER
   Compatible format based on KKPhim plugin
   JavaScript ES5 / Android WebView
========================================================= */

var BASE_URL = "https://tvhay.buzz";
var PLUGIN_ID = "tvhay";

/* =========================================================
1. MANIFEST
========================================================= */

function getManifest() {
    return JSON.stringify({
        id: PLUGIN_ID,
        name: "TVHAY",
        version: "2.1.4",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.png",
        isEnabled: true,
        type: "MOVIE"
    });
}

/* =========================================================
2. HOME SECTIONS
========================================================= */

function getHomeSections() {
    return JSON.stringify([
        {
            slug: "phim-moi",
            title: "Phim Mới",
            type: "Grid",
            path: "phim-moi"
        },
        {
            slug: "phim-bo",
            title: "Phim Bộ",
            type: "Horizontal",
            path: "phim-bo"
        },
        {
            slug: "phim-le",
            title: "Phim Lẻ",
            type: "Horizontal",
            path: "phim-le"
        },
        {
            slug: "short-drama",
            title: "Short Drama",
            type: "Horizontal",
            path: "short-drama"
        }
    ]);
}

/* =========================================================
   NETWORK HELPER (Native Bridge Fallback + XHR)
========================================================= */

function fetchHTML(url, callback) {
    try {
        if (typeof window !== "undefined") {
            if (window.AndroidBridge && typeof window.AndroidBridge.fetchHTML === "function") {
                var nativeHtml = window.AndroidBridge.fetchHTML(url);
                if (nativeHtml && String(nativeHtml).length > 0) {
                    callback(null, String(nativeHtml));
                    return;
                }
            }
            if (window.NativeInterface && typeof window.NativeInterface.getHtml === "function") {
                var nativeHtml2 = window.NativeInterface.getHtml(url);
                if (nativeHtml2 && String(nativeHtml2).length > 0) {
                    callback(null, String(nativeHtml2));
                    return;
                }
            }
        }
    } catch (bridgeErr) {
        // Fallback sang XHR
    }

    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.timeout = 30000;

    try {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    } catch (headerErr) {
        // Bỏ qua nếu WebView chặn header
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        var status = xhr.status;
        var response = xhr.responseText || "";

        if (status >= 200 && status < 300 && response.length > 0) {
            callback(null, response);
        } else {
            callback({
                message: status === 0 ? "Network/CORS or Blocked by Host/Cloudflare" : "HTTP Error",
                status: status,
                response: response.substring(0, 500),
                url: url
            }, null);
        }
    };

    xhr.onerror = function () {
        callback({
            message: "Network error",
            status: xhr.status,
            url: url
        }, null);
    };

    xhr.ontimeout = function () {
        callback({
            message: "Timeout",
            url: url
        }, null);
    };

    xhr.send();
}

/* =========================================================
3. PRIMARY CATEGORIES
========================================================= */

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim mới", slug: "phim-moi" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Short Drama", slug: "short-drama" },
        { name: "Bí ẩn", slug: "bi-an" },
        { name: "Chiến tranh", slug: "chien-tranh" },
        { name: "Chính kịch", slug: "chinh-kich" },
        { name: "Cổ trang", slug: "co-trang" },
        { name: "Gia đình", slug: "gia-dinh" },
        { name: "Hài hước", slug: "hai-huoc" },
        { name: "Hành động", slug: "hanh-dong" },
        { name: "Hình sự", slug: "hinh-su" },
        { name: "Học đường", slug: "hoc-duong" },
        { name: "Khoa học", slug: "khoa-hoc" },
        { name: "Kinh dị", slug: "kinh-di" },
        { name: "Kinh điển", slug: "kinh-dien" },
        { name: "Lịch sử", slug: "lich-su" },
        { name: "Phiêu lưu", slug: "phieu-luu" },
        { name: "Thần thoại", slug: "than-thoai" },
        { name: "Thể thao", slug: "the-thao" },
        { name: "Tâm lý", slug: "tam-ly" },
        { name: "Tình cảm", slug: "tinh-cam" },
        { name: "Viễn tưởng", slug: "vien-tuong" },
        { name: "Võ thuật", slug: "vo-thuat" },
        { name: "Âm nhạc", slug: "am-nhac" }
    ]);
}

/* =========================================================
4. FILTER CONFIG
========================================================= */

function getFilterConfig() {
    return JSON.stringify({
        categories: true,
        countries: true,
        years: true,
        types: true,
        sort: []
    });
}

/* =========================================================
5. URL BUILDERS
========================================================= */

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;

        slug = String(slug || "phim-moi");

        var url;

        if (
            slug === "phim-moi" ||
            slug === "latest" ||
            slug === "phim-moi-cap-nhat"
        ) {
            url = BASE_URL + "/phim-moi";
        } else {
            url = BASE_URL + "/" + slug.replace(/^\/+|\/+$/g, "");
        }

        if (page > 1) {
            url += "/" + page;
        }

        return url;
    } catch (e) {
        return BASE_URL + "/phim-moi";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var kw = encodeURIComponent(String(keyword || "").trim());

        var url = BASE_URL + "/search/" + kw;

        if (page > 1) {
            url += "?page=" + page;
        }

        return url;
    } catch (e) {
        return BASE_URL + "/search/" + encodeURIComponent(String(keyword || "").trim());
    }
}

function getUrlDetail(slug) {
    slug = String(slug || "");

    if (/^https?:\/\//i.test(slug)) {
        return slug;
    }

    slug = slug.replace(/^\/+/, "");

    if (slug.indexOf("phim/") === 0) {
        return BASE_URL + "/" + slug;
    }

    return BASE_URL + "/phim/" + slug;
}

function getUrlCategories(category, page) {
    category = String(category || "")
        .replace(/^\/+|\/+$/g, "");

    page = parseInt(page, 10) || 1;

    var url = BASE_URL + "/the-loai";

    if (category) {
        url += "/" + category;
    }

    if (page > 1) {
        url += "/" + page;
    }

    return url;
}

function getUrlCountries(country, page) {
    country = String(country || "")
        .replace(/^\/+|\/+$/g, "");

    page = parseInt(page, 10) || 1;

    var url = BASE_URL + "/quoc-gia";

    if (country) {
        url += "/" + country;
    }

    if (page > 1) {
        url += "/" + page;
    }

    return url;
}

function getUrlYears(year, page) {
    year = String(year || "");
    page = parseInt(page, 10) || 1;

    var url = BASE_URL + "/nam";

    if (year) {
        url += "/" + year;
    }

    if (page > 1) {
        url += "/" + page;
    }

    return url;
}

/* =========================================================
6. LOCAL YEARS
========================================================= */

function getLocalYearsJson() {
    var currentYear = new Date().getFullYear();
    var years = [];

    for (var y = currentYear; y >= 1970; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }

    return JSON.stringify(years);
}

/* =========================================================
7. HTML HELPERS
========================================================= */

function cleanText(text) {
    text = String(text || "");

    text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
    text = text.replace(/<!--[\s\S]*?-->/g, "");
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/p>/gi, "\n");
    text = text.replace(/<[^>]+>/g, " ");

    text = text.replace(/ /gi, " ");
    text = text.replace(/&/gi, "&");
    text = text.replace(/"/gi, '"');
    text = text.replace(/'/gi, "'");
    text = text.replace(/'/gi, "'");
    text = text.replace(/</gi, "<");
    text = text.replace(/>/gi, ">");

    text = text.replace(/&#(\d+);/g, function (m, n) {
        return String.fromCharCode(parseInt(n, 10));
    });

    text = text.replace(/&#x([0-9a-f]+);/gi, function (m, n) {
        return String.fromCharCode(parseInt(n, 16));
    });

    text = text.replace(/\s+/g, " ");

    return text.replace(/^\s+|\s+$/g, "");
}

/* =========================================================
8. ATTRIBUTE
========================================================= */

function getAttribute(html, name) {
    html = String(html || "");
    name = String(name || "");

    var regex = new RegExp(
        "\\b" + name + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))",
        "i"
    );

    var match = html.match(regex);

    if (!match) {
        return "";
    }

    return match[1] || match[2] || match[3] || "";
}

/* =========================================================
9. URL HELPERS
========================================================= */

function absoluteURL(url) {
    url = String(url || "").replace(/^\s+|\s+$/g, "");

    if (!url) {
        return "";
    }

    if (/^(https?:|data:|blob:)/i.test(url)) {
        return url;
    }

    if (/^\/\//.test(url)) {
        return "https:" + url;
    }

    if (url.charAt(0) === "/") {
        return BASE_URL + url;
    }

    return BASE_URL + "/" + url.replace(/^\.\/+/, "");
}

function extractSlug(url) {
    url = String(url || "");

    url = url.replace(/[?#].*$/, "");
    url = url.replace(/\/+$/, "");

    var parts = url.split("/");

    return parts[parts.length - 1] || "";
}

/* =========================================================
10. IMAGE & HIDDEN POSTER RECOVERY
========================================================= */

function isPlaceholderImage(url) {
    var u = String(url || "").toLowerCase();
    if (!u) return true;
    if (u.indexOf("data:image/gif;base64,r0lgodlh") === 0) return true;
    if (u.indexOf("data:image/svg+xml") === 0) return true;
    if (/\/(?:phim|favicon|logo)\.(?:png|jpg|jpeg|webp|gif)(?:\?|$)/i.test(u)) {
        return true;
    }
    if (/(?:blank|placeholder|loading|spinner|default-poster|no-image|no_poster)\.(?:png|jpg|jpeg|webp|gif)/i.test(u)) {
        return true;
    }
    return false;
}

function extractFirstUrlFromSrcset(srcset) {
    var raw = String(srcset || "").replace(/^\s+|\s+$/g, "");
    if (!raw) return "";
    var firstPart = raw.split(",")[0] || "";
    var urlPart = firstPart.replace(/^\s+|\s+$/g, "").split(/\s+/)[0] || "";
    return urlPart;
}

function extractUrlFromImgTag(imgTag) {
    var attrs = [
        "data-src",
        "data-lazy-src",
        "data-original",
        "data-thumb",
        "data-poster",
        "data-bg",
        "data-url",
        "data-lazy",
        "src"
    ];

    var i;
    var val;

    for (i = 0; i < attrs.length; i++) {
        val = getAttribute(imgTag, attrs[i]);
        if (val && !isPlaceholderImage(val)) {
            return absoluteURL(val);
        }
    }

    var srcsetVal = getAttribute(imgTag, "srcset") || getAttribute(imgTag, "data-srcset");
    var fromSrcset = extractFirstUrlFromSrcset(srcsetVal);
    if (fromSrcset && !isPlaceholderImage(fromSrcset)) {
        return absoluteURL(fromSrcset);
    }

    return "";
}

function extractImageFromBlock(html) {
    html = String(html || "");

    var cleanHtml = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

    var imgRegex = /<img\b[^>]*>/gi;
    var imgMatch;
    var fallbackUrl = "";

    while ((imgMatch = imgRegex.exec(cleanHtml)) !== null) {
        var tag = imgMatch[0];
        var candidate = extractUrlFromImgTag(tag);

        if (candidate && !isPlaceholderImage(candidate)) {
            if (/(?:poster|thumb|cover|movie|phim|film|anh)/i.test(tag)) {
                return candidate;
            }
            if (!fallbackUrl) {
                fallbackUrl = candidate;
            }
        }
    }

    if (fallbackUrl) {
        return fallbackUrl;
    }

    var bgRegex = /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
    var bgMatch;
    while ((bgMatch = bgRegex.exec(cleanHtml)) !== null) {
        if (bgMatch[1] && !isPlaceholderImage(bgMatch[1])) {
            return absoluteURL(bgMatch[1]);
        }
    }

    var dataPosterRegex = /\bdata-(?:poster|thumb|thumbnail|image|img|bg|backdrop)\s*=\s*["']([^"']+)["']/gi;
    var dataMatch;
    while ((dataMatch = dataPosterRegex.exec(cleanHtml)) !== null) {
        if (dataMatch[1] && !isPlaceholderImage(dataMatch[1])) {
            return absoluteURL(dataMatch[1]);
        }
    }

    return "";
}

function extractImageAlt(html) {
    var match = String(html || "").match(
        /<img\b[^>]*\balt\s*=\s*["']([^"']+)["']/i
    );

    return match ? cleanText(match[1]) : "";
}

/* =========================================================
11. MOVIE LINKS
========================================================= */

function extractMovieLinks(html) {
    html = String(html || "");

    var result = [];

    var regex = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

    var match;
    var href;
    var block;
    var title;
    var poster;
    var description;

    while ((match = regex.exec(html)) !== null) {
        href = match[1] || "";

        if (
            !/\/phim\//i.test(href) &&
            !/\/xem-phim\//i.test(href) &&
            !/\/movie\//i.test(href)
        ) {
            continue;
        }

        if (
            /\/(the-loai|quoc-gia|nam|search|tim-kiem|dang-nhap|dang-ky|page)\b/i.test(href)
        ) {
            continue;
        }

        block = match[0];

        title = getAttribute(block, "title") ||
            getAttribute(block, "data-title") ||
            extractImageAlt(block) ||
            cleanText(match[2]);

        title = cleanText(title);

        if (!title || title.length < 2) {
            continue;
        }

        poster = extractImageFromBlock(block);

        description = getAttribute(block, "data-description") || title;

        result.push({
            id: extractSlug(href),
            title: title,
            url: absoluteURL(href),
            posterUrl: poster,
            backdropUrl: poster,
            description: cleanText(description),
            year: extractYearFromText(block),
            quality: extractQualityFromText(block),
            episode_current: extractEpisodeFromText(block),
            type: extractMovieType(block)
        });
    }

    return removeDuplicateMovies(result);
}

/* =========================================================
12. REMOVE DUPLICATES
========================================================= */

function removeDuplicateMovies(items) {
    var result = [];
    var used = {};
    var i;
    var key;

    for (i = 0; i < items.length; i++) {
        key = items[i].url || items[i].id || items[i].title;

        if (!used[key]) {
            used[key] = true;
            result.push(items[i]);
        }
    }

    return result;
}

/* =========================================================
13. LIST RESPONSE & PAGINATION
========================================================= */

function extractCurrentPage(html) {
    html = String(html || "");

    var activeMatch = html.match(
        /<(?:li|a|span)\b[^>]*class\s*=\s*["'][^"']*(?:active|current)[^"']*["'][^>]*>\s*(\d+)\s*<\/(?:li|a|span)>/i
    );
    if (activeMatch && activeMatch[1]) {
        return parseInt(activeMatch[1], 10) || 1;
    }

    var pageParamMatch = html.match(/[?&]page=(\d+)/i);
    if (pageParamMatch && pageParamMatch[1]) {
        return parseInt(pageParamMatch[1], 10) || 1;
    }

    return 1;
}

function extractTotalPages(html, currentPage) {
    html = String(html || "");
    currentPage = parseInt(currentPage, 10) || 1;

    var maxPage = currentPage;
    var regex = /(?:\/page\/|\/|\?page=)(\d+)(?:\/|"|'|&|$)/gi;
    var match;

    var paginationScopeMatch = html.match(
        /<(?:nav|ul|div)\b[^>]*class\s*=\s*["'][^"']*(?:paginat|page-nav|wp-pagenavi)[^"']*["'][^>]*>([\s\S]*?)<\/(?:nav|ul|div)>/i
    );
    var scope = paginationScopeMatch ? paginationScopeMatch[1] : "";

    if (!scope) {
        return currentPage;
    }

    while ((match = regex.exec(scope)) !== null) {
        var num = parseInt(match[1], 10);
        if (num > 0 && num < 5000 && num > maxPage) {
            maxPage = num;
        }
    }

    return maxPage;
}

function extractHasNextPage(html) {
    html = String(html || "");

    if (
        /rel\s*=\s*["']next["']/i.test(html) ||
        />(?:\s*Tiếp|\s*Next|\s*»|\s*»)\s*<\/a>/i.test(html)
    ) {
        return true;
    }

    var current = extractCurrentPage(html);
    var total = extractTotalPages(html, current);

    return total > current;
}

function extractNextPage(html) {
    var current = extractCurrentPage(html);
    if (extractHasNextPage(html)) {
        return current + 1;
    }
    return null;
}

function parseListResponse(html) {
    html = String(html || "");

    var movies = extractMovieLinks(html);
    var currentPage = extractCurrentPage(html);
    var totalPages = extractTotalPages(html, currentPage);

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: movies.length,
            itemsPerPage: movies.length || 24
        },
        hasNextPage: extractHasNextPage(html),
        nextPage: extractNextPage(html)
    });
}

/* =========================================================
14. SEARCH RESPONSE
========================================================= */

function parseSearchResponse(html) {
    return parseListResponse(html);
}

/* =========================================================
15. DETAIL RESPONSE
========================================================= */

function extractMovieId(html) {
    html = String(html || "");

    var canonicalMatch = html.match(
        /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i
    );
    if (canonicalMatch && canonicalMatch[1]) {
        return extractSlug(canonicalMatch[1]);
    }

    var ogUrlMatch = html.match(
        /<meta\b[^>]*property\s*=\s*["']og:url["'][^>]*content\s*=\s*["']([^"']+)["']/i
    );
    if (ogUrlMatch && ogUrlMatch[1]) {
        return extractSlug(ogUrlMatch[1]);
    }

    var idAttrMatch = html.match(/data-movie-id\s*=\s*["']([^"']+)["']/i);
    if (idAttrMatch && idAttrMatch[1]) {
        return cleanText(idAttrMatch[1]);
    }

    return extractSlug(extractMovieTitle(html));
}

function parseMovieDetail(html) {
    html = String(html || "");

    var poster = extractPoster(html);

    return JSON.stringify({
        id: extractMovieId(html),
        title: extractMovieTitle(html),
        originName: extractOriginalTitle(html),
        posterUrl: poster,
        backdropUrl: poster,
        description: extractDescription(html),
        year: parseInt(extractYear(html), 10) || 0,
        rating: 0,
        quality: extractQuality(html),
        duration: extractDuration(html),
        servers: extractEpisodes(html),
        episode_current: extractStatus(html),
        lang: "",
        category: extractCategories(html).join(", "),
        country: extractCountries(html).join(", "),
        director: extractDirectors(html).join(", "),
        casts: extractActors(html).join(", "),
        status: extractStatus(html)
    });
}

/* =========================================================
16. STREAM / DETAIL PARSER (IFRAME + DIRECT STREAM)
========================================================= */

function extractStreamURL(html) {
    html = String(html || "");

    var movieIframeMatch = html.match(
        /<iframe\b[^>]*\bid\s*=\s*["']movie-iframe["'][^>]*\b(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*>/i
    ) || html.match(
        /<iframe\b[^>]*\b(?:src|data-src)\s*=\s*["']([^"']+)["'][^>]*\bid\s*=\s*["']movie-iframe["'][^>]*>/i
    );

    if (movieIframeMatch && movieIframeMatch[1]) {
        return absoluteURL(movieIframeMatch[1]);
    }

    var iframeMatch = html.match(
        /<iframe\b[^>]*\b(?:src|data-src)\s*=\s*["']([^"']+)["']/i
    );
    if (iframeMatch && iframeMatch[1]) {
        return absoluteURL(iframeMatch[1]);
    }

    var directMatch = html.match(
        /(https?:\/\/[^\s"'<>\\]+\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/i
    );
    if (directMatch && directMatch[1]) {
        return directMatch[1].replace(/\\\//g, "/");
    }

    var jsSourceMatch = html.match(
        /(?:file|source|streamUrl|videoUrl)\s*[:=]\s*["'](https?:\/\/[^"']+)["']/i
    );
    if (jsSourceMatch && jsSourceMatch[1]) {
        return jsSourceMatch[1].replace(/\\\//g, "/");
    }

    return "";
}

function parseDetailResponse(html) {
    html = String(html || "");

    var stream = extractStreamURL(html);
    var isDirect = /\.(m3u8|mp4)(\?|$)/i.test(stream);

    return JSON.stringify({
        url: stream,
        embedUrl: isDirect ? "" : stream,
        isDirectStream: isDirect,
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Referer": BASE_URL + "/"
        },
        subtitles: []
    });
}

/* =========================================================
17. TITLE
========================================================= */

function extractMovieTitle(html) {
    html = String(html || "");

    var match = html.match(
        /<h1\b[^>]*>([\s\S]*?)<\/h1>/i
    );

    if (match) {
        return cleanText(match[1]);
    }

    match = html.match(
        /<meta\b[^>]*property\s*=\s*["']og:title["'][^>]*content\s*=\s*["']([^"']+)["']/i
    );

    if (match) {
        return cleanText(match[1]);
    }

    match = html.match(
        /<title\b[^>]*>([\s\S]*?)<\/title>/i
    );

    return match ? cleanText(match[1]) : "";
}

function extractOriginalTitle(html) {
    var match = String(html || "").match(
        /(?:tên gốc|original title)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}

/* =========================================================
18. POSTER (INCLUDING HIDDEN / LAZY / CSS POSTERS)
========================================================= */

function extractPoster(html) {
    html = String(html || "");

    var patterns = [
        /<meta\b[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/i,
        /<meta\b[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:image["']/i,
        /<meta\b[^>]*name\s*=\s*["']twitter:image["'][^>]*content\s*=\s*["']([^"']+)["']/i,
        /<meta\b[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']twitter:image["']/i
    ];

    var i;
    var match;

    for (i = 0; i < patterns.length; i++) {
        match = html.match(patterns[i]);

        if (match && match[1] && !isPlaceholderImage(match[1])) {
            return absoluteURL(match[1]);
        }
    }

    var posterScopeMatch = html.match(
        /<(?:div|figure|aside|section)\b[^>]*(?:poster|thumb|thumbnail|movie-img|detail-thumb)[^>]*>([\s\S]*?)<\/(?:div|figure|aside|section)>/i
    );
    if (posterScopeMatch && posterScopeMatch[1]) {
        var scopedImg = extractImageFromBlock(posterScopeMatch[1]);
        if (scopedImg) {
            return scopedImg;
        }
    }

    return extractImageFromBlock(html);
}

/* =========================================================
19. DESCRIPTION
========================================================= */

function extractDescription(html) {
    html = String(html || "");

    var patterns = [
        /<meta\b[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["']/i,
        /<meta\b[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["']/i
    ];

    var i;
    var match;

    for (i = 0; i < patterns.length; i++) {
        match = html.match(patterns[i]);

        if (match && match[1]) {
            return cleanText(match[1]);
        }
    }

    match = html.match(
        /<(?:div|p)\b[^>]*class\s*=\s*["'][^"']*(?:description|content|gioi-thieu|desc)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p)>/i
    );

    return match ? cleanText(match[1]) : "";
}

/* =========================================================
20. YEAR
========================================================= */

function extractYear(html) {
    var match = String(html || "").match(
        /(?:năm|year|khởi chiếu)\s*[:：]?\s*(19\d{2}|20\d{2})/i
    );

    if (match) {
        return match[1];
    }

    return extractYearFromText(html);
}

function extractYearFromText(html) {
    var match = String(html || "").match(
        /\b(19\d{2}|20\d{2})\b/
    );

    return match ? match[1] : "";
}

/* =========================================================
21. COUNTRIES
========================================================= */

function extractCountries(html) {
    html = String(html || "");

    var result = [];

    var regex =
        /<a\b[^>]*href\s*=\s*["'][^"']*\/quoc-gia\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
        var value = cleanText(match[1]);

        if (value && result.indexOf(value) === -1) {
            result.push(value);
        }
    }

    return result;
}

/* =========================================================
22. CATEGORIES
========================================================= */

function extractCategories(html) {
    html = String(html || "");

    var result = [];

    var regex =
        /<a\b[^>]*href\s*=\s*["'][^"']*\/the-loai\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
        var value = cleanText(match[1]);

        if (value && result.indexOf(value) === -1) {
            result.push(value);
        }
    }

    return result;
}

/* =========================================================
23. ACTORS / DIRECTORS
========================================================= */

function extractActors(html) {
    var match = String(html || "").match(
        /(?:diễn viên|actors)\s*[:：]?\s*([\s\S]*?)(?:<\/div>|<\/li>)/i
    );

    return match ? extractNames(match[1]) : [];
}

function extractDirectors(html) {
    var match = String(html || "").match(
        /(?:đạo diễn|director)\s*[:：]?\s*([\s\S]*?)(?:<\/div>|<\/li>)/i
    );

    return match ? extractNames(match[1]) : [];
}

function extractNames(html) {
    html = String(html || "");

    var result = [];

    var regex = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
        var name = cleanText(match[1]);

        if (name && result.indexOf(name) === -1) {
            result.push(name);
        }
    }

    return result;
}

/* =========================================================
24. DURATION
========================================================= */

function extractDuration(html) {
    var match = String(html || "").match(
        /(?:thời lượng|duration)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}

/* =========================================================
25. QUALITY
========================================================= */

function extractQuality(html) {
    return extractQualityFromText(html);
}

function extractQualityFromText(html) {
    var match = String(html || "").match(
        /\b(4K|2160P|1080P|720P|480P|FHD|HD|CAM|SD)\b/i
    );

    return match ? match[1].toUpperCase() : "";
}

/* =========================================================
26. STATUS, EPISODE & TYPE HELPERS
========================================================= */

function extractStatus(html) {
    var match = String(html || "").match(
        /(?:trạng thái|status)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}

function extractEpisodeFromText(text) {
    var cleaned = cleanText(text);

    var match = cleaned.match(
        /(?:tập\s*\d+(?:\s*\/\s*\d+)?|full|hoàn tất|\d+\/\d+\s*tập)/i
    );

    return match ? cleanText(match[0]) : "";
}

function extractMovieType(text) {
    var cleaned = cleanText(text).toLowerCase();

    if (cleaned.indexOf("phim bộ") !== -1 || cleaned.indexOf("tập ") !== -1 || cleaned.indexOf("short drama") !== -1) {
        return "series";
    }

    if (cleaned.indexOf("phim lẻ") !== -1 || cleaned.indexOf("full") !== -1) {
        return "single";
    }

    return "movie";
}

/* =========================================================
27. EPISODES
========================================================= */

function extractEpisodes(html) {
    html = String(html || "");

    var episodes = [];
    var seenUrls = {};
    var regex = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = regex.exec(html)) !== null) {
        var href = match[1] || "";
        var label = cleanText(match[2] || "");

        if (
            !label ||
            label.length > 30 ||
            !/^(?:tập\s*\d+|ep\s*\d+|episode\s*\d+|full|\d+)$/i.test(label)
        ) {
            continue;
        }

        if (/^(?:javascript:|#)/i.test(href)) {
            continue;
        }

        var fullUrl = absoluteURL(href);
        if (!fullUrl || seenUrls[fullUrl]) {
            continue;
        }

        seenUrls[fullUrl] = true;
        episodes.push({
            name: label,
            slug: extractSlug(fullUrl) || label,
            url: fullUrl
        });
    }

    return [
        {
            serverName: "Server #1",
            episodes: episodes
        }
    ];
}
