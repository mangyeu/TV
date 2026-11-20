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
        version: "2.1.3",
        baseUrl: BASE_URL,
        iconUrl: "",
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

        var url = BASE_URL +
            "/tim-kiem?keyword=" +
            encodeURIComponent(String(keyword || "").trim());

        if (page > 1) {
            url += "&page=" + page;
        }

        return url;
    } catch (e) {
        return BASE_URL +
            "/tim-kiem?keyword=" +
            encodeURIComponent(String(keyword || ""));
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

    // Loại bỏ thẻ <style> hoặc <script> trước khi dò ảnh
    var cleanHtml = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

    // 1. Ưu tiên tìm các thẻ <img> (kể cả thẻ nằm trong phần tử có class/style ẩn như hidden, d-none, display:none, opacity:0)
    var imgRegex = /<img\b[^>]*>/gi;
    var imgMatch;
    var fallbackUrl = "";

    while ((imgMatch = imgRegex.exec(cleanHtml)) !== null) {
        var tag = imgMatch[0];
        var candidate = extractUrlFromImgTag(tag);

        if (candidate && !isPlaceholderImage(candidate)) {
            // Ưu tiên ảnh có từ khóa poster/thumb/cover/movie/avatar hoặc ảnh đầu tiên hợp lệ
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

    // 2. Nếu poster bị ẩn dưới dạng background-image: url(...) trên div/figure/a/span
    var bgRegex = /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
    var bgMatch;
    while ((bgMatch = bgRegex.exec(cleanHtml)) !== null) {
        if (bgMatch[1] && !isPlaceholderImage(bgMatch[1])) {
            return absoluteURL(bgMatch[1]);
        }
    }

    // 3. Nếu poster nằm trong thuộc tính data-poster / data-thumb / data-bg của thẻ chứa
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
            /\/(the-loai|quoc-gia|nam|tim-kiem|dang-nhap|dang-ky|page)\b/i.test(href)
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
    if (ogUrlMatch && ogUrlMatch[1
