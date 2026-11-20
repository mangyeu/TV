/* =========================================================
   TVHAY.BUZZ PLUGIN - VAXPLAYER
   H.PRO PRIORITY
   JavaScript ES5 / Android WebView
========================================================= */

var BASE_URL = "https://tvhay.buzz";
var PLUGIN_ID = "tvhay";
var DEFAULT_SERVER = "hpro";
var HPRO_SERVER_PARAM = "0";

/* =========================================================
1. MANIFEST
========================================================= */

function getManifest() {
    return JSON.stringify({
        id: PLUGIN_ID,
        name: "TVHAY",
        version: "2.2.0",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.png",
        isEnabled: true,
        type: "MOVIE"
    });
}

/* =========================================================
2. HOME
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
3. NETWORK
========================================================= */

function fetchHTML(url, callback) {
    try {
        if (typeof window !== "undefined") {
            if (
                window.AndroidBridge &&
                typeof window.AndroidBridge.fetchHTML === "function"
            ) {
                var result = window.AndroidBridge.fetchHTML(url);

                if (result && String(result).length > 0) {
                    callback(null, String(result));
                    return;
                }
            }

            if (
                window.NativeInterface &&
                typeof window.NativeInterface.getHtml === "function"
            ) {
                var result2 = window.NativeInterface.getHtml(url);

                if (result2 && String(result2).length > 0) {
                    callback(null, String(result2));
                    return;
                }
            }
        }
    } catch (e) {
        // Fallback XHR
    }

    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.timeout = 30000;

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        var response = xhr.responseText || "";

        if (xhr.status >= 200 && xhr.status < 300 && response.length > 0) {
            callback(null, response);
        } else {
            callback({
                message: xhr.status === 0
                    ? "Network/CORS/Cloudflare blocked"
                    : "HTTP Error",
                status: xhr.status,
                url: url,
                response: response.substring(0, 500)
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
4. CATEGORIES
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
5. FILTER
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
6. URL BUILDERS
========================================================= */

function getUrlList(slug, filtersJson) {
    var filters = {};

    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;

    slug = String(slug || "phim-moi")
        .replace(/^\/+|\/+$/g, "");

    var url = BASE_URL + "/" + slug;

    if (page > 1) {
        url += "/" + page;
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};

    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {}

    var page = parseInt(filters.page, 10) || 1;

    var url = BASE_URL + "/search/" +
        encodeURIComponent(String(keyword || "").trim());

    if (page > 1) {
        url += "?page=" + page;
    }

    return url;
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

/* Alias tương thích nếu app gọi getUrlMovieDetail */

function getUrlMovieDetail(slug) {
    return getUrlDetail(slug);
}

function getUrlCategories(category, page) {
    category = String(category || "").replace(/^\/+|\/+$/g, "");
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
    country = String(country || "").replace(/^\/+|\/+$/g, "");
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
7. WATCH URL - H.PRO PRIORITY
========================================================= */

function getUrlWatch(slug, episode, server) {
    slug = String(slug || "").replace(/^\/+|\/+$/g, "");
    episode = String(episode || "tap-1");

    server = String(server || DEFAULT_SERVER).toLowerCase();

    var serverValue = server === "spro" ? "1" : HPRO_SERVER_PARAM;

    return BASE_URL +
        "/xem/" + slug +
        "/" + episode +
        "?sv=" + serverValue;
}

/* H.PRO mặc định */

function getUrlEpisode(slug, episode) {
    return getUrlWatch(slug, episode, "hpro");
}

/* =========================================================
8. YEARS
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
9. HTML HELPERS
========================================================= */

function decodeHTML(text) {
    text = String(text || "");

    return text
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#(\d+);/g, function (m, n) {
            return String.fromCharCode(parseInt(n, 10));
        })
        .replace(/&#x([0-9a-f]+);/gi, function (m, n) {
            return String.fromCharCode(parseInt(n, 16));
        });
}

function cleanText(text) {
    text = String(text || "");

    text = text
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/p>/gi, " ")
        .replace(/<[^>]+>/g, " ");

    text = decodeHTML(text);
    text = text.replace(/\s+/g, " ");

    return text.replace(/^\s+|\s+$/g, "");
}

function getAttribute(html, name) {
    html = String(html || "");

    var regex = new RegExp(
        "\\b" + name + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))",
        "i"
    );

    var match = html.match(regex);

    if (!match) return "";

    return decodeHTML(match[1] || match[2] || match[3] || "");
}

/* =========================================================
10. URL HELPERS
========================================================= */

function absoluteURL(url) {
    url = String(url || "").replace(/^\s+|\s+$/g, "");

    if (!url) return "";

    url = decodeHTML(url);

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
    url = String(url || "")
        .replace(/[?#].*$/, "")
        .replace(/\/+$/, "");

    var parts = url.split("/");

    return parts[parts.length - 1] || "";
}

function decodeScriptURL(url) {
    return String(url || "")
        .replace(/\\\//g, "/")
        .replace(/\\u0026/g, "&")
        .replace(/\\x26/g, "&")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"');
}

/* =========================================================
11. IMAGE HELPERS
========================================================= */

function isPlaceholderImage(url) {
    var u = String(url || "").toLowerCase();

    if (!u) return true;

    return (
        u.indexOf("placehold.co") !== -1 ||
        u.indexOf("placeholder") !== -1 ||
        u.indexOf("spinner") !== -1 ||
        u.indexOf("loading") !== -1 ||
        u.indexOf("no-image") !== -1 ||
        u.indexOf("no_poster") !== -1 ||
        u.indexOf("default-poster") !== -1
    );
}

function extractImageFromBlock(html) {
    html = String(html || "");

    var imgRegex = /<img\b[^>]*>/gi;
    var match;

    while ((match = imgRegex.exec(html)) !== null) {
        var tag = match[0];

        var src =
            getAttribute(tag, "data-src") ||
            getAttribute(tag, "data-lazy-src") ||
            getAttribute(tag, "data-original") ||
            getAttribute(tag, "data-thumb") ||
            getAttribute(tag, "data-poster") ||
            getAttribute(tag, "src");

        if (src && !isPlaceholderImage(src)) {
            return absoluteURL(src);
        }
    }

    var bgMatch = html.match(
        /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/i
    );

    if (bgMatch && bgMatch[1]) {
        return absoluteURL(bgMatch[1]);
    }

    return "";
}

function extractPoster(html) {
    html = String(html || "");

    var patterns = [
        /property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/i,
        /content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:image["']/i,
        /name\s*=\s*["']twitter:image["'][^>]*content\s*=\s*["']([^"']+)["']/i
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = html.match(patterns[i]);

        if (match && match[1] && !isPlaceholderImage(match[1])) {
            return absoluteURL(match[1]);
        }
    }

    return extractImageFromBlock(html);
}

/* =========================================================
12. MOVIE LIST
========================================================= */

function extractCardTitle(block, linkText) {
    var match = block.match(
        /class\s*=\s*["'][^"']*movie-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    );

    if (match) {
        var title = cleanText(match[1]);

        if (title) return title;
    }

    return cleanText(
        getAttribute(block, "title") ||
        getAttribute(block, "data-title") ||
        linkText
    );
}

function extractYearFromText(text) {
    var match = String(text || "").match(/\b(19\d{2}|20\d{2})\b/);
    return match ? match[1] : "";
}

function extractQualityFromText(text) {
    var match = String(text || "").match(
        /\b(4K|2160P|1080P|720P|480P|FHD|HD|CAM|SD)\b/i
    );

    return match ? match[1].toUpperCase() : "";
}

function extractEpisodeFromText(text) {
    var match = cleanText(text).match(
        /(?:tập\s*\d+(?:\s*\/\s*\d+)?|ep\s*\d+|episode\s*\d+|full|hoàn tất)/i
    );

    return match ? match[0] : "";
}

function extractMovieType(text) {
    text = cleanText(text).toLowerCase();

    if (
        text.indexOf("phim bộ") !== -1 ||
        text.indexOf("tập ") !== -1 ||
        text.indexOf("short drama") !== -1
    ) {
        return "series";
    }

    if (
        text.indexOf("phim lẻ") !== -1 ||
        text.indexOf("full") !== -1
    ) {
        return "single";
    }

    return "movie";
}

function extractMovieLinks(html) {
    html = String(html || "");

    var result = [];
    var seen = {};

    var regex = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = regex.exec(html)) !== null) {
        var href = match[1] || "";
        var body = match[2] || "";

        if (!/\/phim\//i.test(href)) continue;

        var title = extractCardTitle(body, body);

        if (!title || title.length < 2) {
            title = cleanText(
                getAttribute(match[0], "title")
            );
        }

        if (!title || title.length < 2) continue;

        var url = absoluteURL(href);

        if (seen[url]) continue;

        seen[url] = true;

        result.push({
            id: extractSlug(href),
            title: title,
            url: url,
            posterUrl: extractImageFromBlock(match[0]),
            backdropUrl: extractImageFromBlock(match[0]),
            description: title,
            year: extractYearFromText(match[0]),
            quality: extractQualityFromText(match[0]),
            episode_current: extractEpisodeFromText(match[0]),
            type: extractMovieType(match[0])
        });
    }

    return result;
}

function removeDuplicateMovies(items) {
    var result = [];
    var seen = {};

    for (var i = 0; i < items.length; i++) {
        var key = items[i].url || items[i].id || items[i].title;

        if (!seen[key]) {
            seen[key] = true;
            result.push(items[i]);
        }
    }

    return result;
}

/* =========================================================
13. PAGINATION
========================================================= */

function extractCurrentPage(html) {
    var match = String(html || "").match(
        /class\s*=\s*["'][^"']*(?:active|current)[^"']*["'][^>]*>\s*(\d+)/i
    );

    return match ? parseInt(match[1], 10) || 1 : 1;
}

function extractTotalPages(html, currentPage) {
    currentPage = parseInt(currentPage, 10) || 1;

    var maxPage = currentPage;

    var regex = /(?:\/|page=)(\d+)(?:\/|"|'|&|$)/gi;
    var match;

    while ((match = regex.exec(String(html || ""))) !== null) {
        var page = parseInt(match[1], 10);

        if (page > maxPage && page < 5000) {
            maxPage = page;
        }
    }

    return maxPage;
}

function extractHasNextPage(html) {
    html = String(html || "");

    if (/rel\s*=\s*["']next["']/i.test(html)) {
        return true;
    }

    if (/(?:Tiếp|Next|»)/i.test(html)) {
        return true;
    }

    var current = extractCurrentPage(html);
    var total = extractTotalPages(html, current);

    return total > current;
}

function extractNextPage(html) {
    var current = extractCurrentPage(html);

    return extractHasNextPage(html) ? current + 1 : null;
}

function parseListResponse(html) {
    html = String(html || "");

    var movies = removeDuplicateMovies(extractMovieLinks(html));
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

function parseSearchResponse(html) {
    return parseListResponse(html);
}

/* =========================================================
14. MOVIE DETAIL
========================================================= */

function extractMovieTitle(html) {
    html = String(html || "");

    var match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);

    if (match) return cleanText(match[1]);

    match = html.match(
        /property\s*=\s*["']og:title["'][^>]*content\s*=\s*["']([^"']+)["']/i
    );

    if (match) return cleanText(match[1]);

    match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);

    return match ? cleanText(match[1]) : "";
}

function extractOriginalTitle(html) {
    var match = String(html || "").match(
        /(?:tên gốc|original title)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}

function extractMovieId(html) {
    var match = String(html || "").match(
        /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i
    );

    if (match) return extractSlug(match[1]);

    match = html.match(/data-movie-id\s*=\s*["']([^"']+)["']/i);

    if (match) return match[1];

    return extractSlug(extractMovieTitle(html));
}

function extractDescription(html) {
    html = String(html || "");

    var match = html.match(
        /name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["']/i
    );

    if (match) return cleanText(match[1]);

    match = html.match(
        /property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["']/i
    );

    if (match) return cleanText(match[1]);

    return "";
}

function extractYear(html) {
    var match = String(html || "").match(
        /(?:năm|year|khởi chiếu)\s*[:：]?\s*(19\d{2}|20\d{2})/i
    );

    return match ? match[1] : extractYearFromText(html);
}

function extractQuality(html) {
    return extractQualityFromText(html);
}

function extractDuration(html) {
    var match = String(html || "").match(
        /(?:thời lượng|duration)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}

function extractStatus(html) {
    var match = String(html || "").match(
        /(?:trạng thái|status)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}

function extractCategories(html) {
    var result = [];
    var regex = /href\s*=\s*["'][^"']*\/the-loai\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = regex.exec(String(html || ""))) !== null) {
        var value = cleanText(match[1]);

        if (value && result.indexOf(value) === -1) {
            result.push(value);
        }
    }

    return result;
}

function extractCountries(html) {
    var result = [];
    var regex = /href\s*=\s*["'][^"']*\/quoc-gia\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = regex.exec(String(html || ""))) !== null) {
        var value = cleanText(match[1]);

        if (value && result.indexOf(value) === -1) {
            result.push(value);
        }
    }

    return result;
}

function extractNames(html) {
    var result = [];
    var regex = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = regex.exec(String(html || ""))) !== null) {
        var value = cleanText(match[1]);

        if (value && result.indexOf(value) === -1) {
            result.push(value);
        }
    }

    return result;
}

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

/* =========================================================
15. EPISODES
========================================================= */

function extractEpisodes(html) {
    html = String(html || "");

    var episodes = [];
    var seen = {};

    var regex = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = regex.exec(html)) !== null) {
        var href = match[1] || "";
        var label = cleanText(match[2] || "");

        if (!label || label.length > 40) continue;

        if (!/^(?:tập\s*\d+|ep\s*\d+|episode\s*\d+|full|\d+)$/i.test(label)) {
            continue;
        }

        if (/^(?:javascript:|#)/i.test(href)) continue;

        var url = absoluteURL(href);

        if (seen[url]) continue;

        seen[url] = true;

        episodes.push({
            name: label,
            slug: extractSlug(url),
            url: url
        });
    }

    return [
        {
            serverName: "H.PRO",
            episodes: episodes
        }
    ];
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

/* Alias */

function parseDetailMovie(html) {
    return parseMovieDetail(html);
}

/* =========================================================
16. STREAM URL - H.PRO PRIORITY
========================================================= */

function extractStreamURL(html) {
    html = String(html || "");

    // HTML encoded
    html = html
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&amp;/gi, "&");

    // JS escaped URL
    html = decodeScriptURL(html);

    // -----------------------------------------------------
    // Find movie iframe
    // -----------------------------------------------------

    var iframeMatch = html.match(
        /<iframe\b[^>]*\bid\s*=\s*["']movie-iframe["'][^>]*>/i
    );

    // Fallback iframe
    if (!iframeMatch) {
        iframeMatch = html.match(/<iframe\b[^>]*>/i);
    }

    if (iframeMatch) {
        var iframeTag = iframeMatch[0];

        var iframeUrl =
            getAttribute(iframeTag, "src") ||
            getAttribute(iframeTag, "data-src") ||
            getAttribute(iframeTag, "data-lazy-src") ||
            getAttribute(iframeTag, "data-url");

        if (iframeUrl) {
            iframeUrl = absoluteURL(iframeUrl);

            // -------------------------------------------------
            // STREAMVSMOV
            // -------------------------------------------------

            var streamvsmov = iframeUrl.match(
                /https?:\/\/([^\/]+)\/video\/([a-f0-9-]+)/i
            );

            if (streamvsmov) {
                var host = streamvsmov[1];
                var videoId = streamvsmov[2];

                return "https://" + host +
                    "/stream/" + videoId +
                    "/master.m3u8";
            }

            // -------------------------------------------------
            // Direct iframe fallback
            // -------------------------------------------------

            return iframeUrl;
        }
    }

    // -----------------------------------------------------
    // Direct m3u8
    // -----------------------------------------------------

    var directMatch = html.match(
        /https?:\/\/[^"'<>\\\s]+\.m3u8(?:\?[^"'<>\\\s]*)?/i
    );

    if (directMatch) {
        return decodeScriptURL(directMatch[0]);
    }

    // -----------------------------------------------------
    // Direct MP4
    // -----------------------------------------------------

    directMatch = html.match(
        /https?:\/\/[^"'<>\\\s]+\.mp4(?:\?[^"'<>\\\s]*)?/i
    );

    if (directMatch) {
        return decodeScriptURL(directMatch[0]);
    }

    // -----------------------------------------------------
    // JavaScript player file
    // -----------------------------------------------------

    var patterns = [
        /\bfile\s*:\s*["']([^"']+)["']/i,
        /\bsource\s*:\s*["']([^"']+)["']/i,
        /\bvideoUrl\s*=\s*["']([^"']+)["']/i,
        /\bstreamUrl\s*=\s*["']([^"']+)["']/i,
        /\bsrc\s*:\s*["']([^"']+)["']/i
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = html.match(patterns[i]);

        if (match && match[1]) {
            var candidate = decodeScriptURL(match[1]);

            if (/^(https?:)?\/\//i.test(candidate)) {
                return absoluteURL(candidate);
            }
        }
    }

    return "";
}

/* =========================================================
17. PARSE PLAYER RESPONSE
========================================================= */

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
18. DEBUG
========================================================= */

function debugStream(html) {
    html = String(html || "");

    var stream = extractStreamURL(html);

    return JSON.stringify({
        htmlLength: html.length,
        iframeFound: /<iframe\b/i.test(html),
        movieIframeFound: /id\s*=\s*["']movie-iframe["']/i.test(html),
        streamFound: stream.length > 0,
        streamUrl: stream,
        direct: /\.(m3u8|mp4)(\?|$)/i.test(stream)
    });
}
