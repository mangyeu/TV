/* =========================================
   TVHAY.BUZZ PLUGIN - VAXPLAYER
   JavaScript ES5
   Android WebView Compatible
========================================= */

var BASE_URL = "https://tvhay.buzz";
var PLUGIN_ID = "tvhay";

/* =========================================
   1. MANIFEST
========================================= */

function getManifest() {
    return {
        id: PLUGIN_ID,
        name: "TVHAY",
        version: "2.0.0",
        baseUrl: BASE_URL,
        language: "vi",
        type: "movie"
    };
}

/* =========================================
   2. HOME
========================================= */

function getHomeSections() {
    return [
        {
            id: "latest",
            title: "Phim mới",
            url: BASE_URL + "/phim-moi"
        },
        {
            id: "series",
            title: "Phim bộ",
            url: BASE_URL + "/phim-bo"
        },
        {
            id: "movies",
            title: "Phim lẻ",
            url: BASE_URL + "/phim-le"
        },
        {
            id: "short-drama",
            title: "Short Drama",
            url: BASE_URL + "/short-drama"
        }
    ];
}

/* =========================================
   3. CATEGORIES
========================================= */

function getPrimaryCategories() {
    return [
        { id: "bi-an", name: "Bí Ẩn" },
        { id: "chien-tranh", name: "Chiến Tranh" },
        { id: "chinh-kich", name: "Chính Kịch" },
        { id: "co-trang", name: "Cổ Trang" },
        { id: "gia-dinh", name: "Gia Đình" },
        { id: "hai-huoc", name: "Hài Hước" },
        { id: "hanh-dong", name: "Hành Động" },
        { id: "hinh-su", name: "Hình Sự" },
        { id: "hoc-duong", name: "Học Đường" },
        { id: "khoa-hoc", name: "Khoa Học" },
        { id: "kinh-di", name: "Kinh Dị" },
        { id: "kinh-dien", name: "Kinh Điển" },
        { id: "lich-su", name: "Lịch Sử" },
        { id: "phieu-luu", name: "Phiêu Lưu" },
        { id: "than-thoai", name: "Thần Thoại" },
        { id: "the-thao", name: "Thể Thao" },
        { id: "tam-ly", name: "Tâm Lý" },
        { id: "tinh-cam", name: "Tình Cảm" },
        { id: "vien-tuong", name: "Viễn Tưởng" },
        { id: "vo-thuat", name: "Võ Thuật" },
        { id: "am-nhac", name: "Âm Nhạc" }
    ];
}

/* =========================================
   4. FILTER CONFIG
========================================= */

function getFilterConfig() {
    return {
        categories: true,
        countries: true,
        years: true,
        types: true,
        sort: false
    };
}

/* =========================================
   5. URL BUILDERS
========================================= */

function getUrlList(page) {
    page = parseInt(page, 10) || 1;

    if (page <= 1) {
        return BASE_URL + "/phim-moi";
    }

    return BASE_URL + "/phim-moi/" + page;
}

function getUrlSearch(keyword, page) {
    keyword = String(keyword || "");
    page = parseInt(page, 10) || 1;

    var url = BASE_URL +
        "/tim-kiem?keyword=" +
        encodeURIComponent(keyword);

    if (page > 1) {
        url += "&page=" + page;
    }

    return url;
}

function getUrlDetail(slug) {
    slug = String(slug || "");

    if (/^https?:\/\//i.test(slug)) {
        return slug;
    }

    slug = slug.replace(/^\/+/, "");

    if (/^phim\//i.test(slug)) {
        return BASE_URL + "/" + slug;
    }

    return BASE_URL + "/phim/" + slug;
}

function getUrlCategories(category, page) {
    category = String(category || "")
        .replace(/^\/+|\/+$/g, "");

    page = parseInt(page, 10) || 1;

    var url = BASE_URL + "/the-loai/" + category;

    if (page > 1) {
        url += "/" + page;
    }

    return url;
}

function getUrlCountries(country, page) {
    country = String(country || "")
        .replace(/^\/+|\/+$/g, "");

    page = parseInt(page, 10) || 1;

    var url = BASE_URL + "/quoc-gia/" + country;

    if (page > 1) {
        url += "/" + page;
    }

    return url;
}

function getUrlYears(year, page) {
    year = String(year || "");
    page = parseInt(page, 10) || 1;

    var url = BASE_URL + "/nam/" + year;

    if (page > 1) {
        url += "/" + page;
    }

    return url;
}

/* =========================================
   6. HTTP REQUEST
========================================= */

function fetchHTML(url, callback) {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);

    xhr.timeout = 20000;

    xhr.setRequestHeader(
        "Accept",
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    );

    xhr.setRequestHeader(
        "User-Agent",
        "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
    );

    xhr.setRequestHeader(
        "Referer",
        BASE_URL + "/"
    );

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) {
            return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
            callback(null, xhr.responseText);
        } else {
            callback({
                message: "HTTP Error",
                status: xhr.status,
                url: url
            }, null);
        }
    };

    xhr.onerror = function () {
        callback({
            message: "Network error",
            status: xhr.status || 0,
            url: url
        }, null);
    };

    xhr.ontimeout = function () {
        callback({
            message: "Request timeout",
            url: url
        }, null);
    };

    xhr.send(null);
}

/* =========================================
   7. TEST SOURCE
========================================= */

function testSource(callback) {
    fetchHTML(BASE_URL + "/phim-moi", function (error, html) {
        if (error) {
            callback({
                success: false,
                error: error
            });
            return;
        }

        callback({
            success: true,
            htmlLength: html.length,
            containsMovie: html.indexOf("/phim/") !== -1,
            preview: html.substring(0, 500)
        });
    });
}

/* =========================================
   8. HTML CLEAN
========================================= */

function cleanText(text) {
    text = String(text || "");

    text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
    text = text.replace(/<!--[\s\S]*?-->/g, "");
    text = text.replace(/<[^>]+>/g, " ");

    text = text.replace(/&nbsp;/gi, " ");
    text = text.replace(/&amp;/gi, "&");
    text = text.replace(/&quot;/gi, '"');
    text = text.replace(/&#39;/gi, "'");
    text = text.replace(/&lt;/gi, "<");
    text = text.replace(/&gt;/gi, ">");

    text = text.replace(/&#(\d+);/g, function (m, n) {
        return String.fromCharCode(parseInt(n, 10));
    });

    text = text.replace(/&#x([0-9a-f]+);/gi, function (m, n) {
        return String.fromCharCode(parseInt(n, 16));
    });

    text = text.replace(/\s+/g, " ");

    return text.replace(/^\s+|\s+$/g, "");
}

/* =========================================
   9. ATTRIBUTE
========================================= */

function getAttribute(html, name) {
    html = String(html || "");
    name = String(name || "");

    var regex = new RegExp(
        "(?:^|\\s)" +
        name +
        "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))",
        "i"
    );

    var match = html.match(regex);

    if (!match) {
        return "";
    }

    return match[1] || match[2] || match[3] || "";
}

/* =========================================
   10. URL
========================================= */

function absoluteURL(url) {
    url = String(url || "")
        .replace(/^\s+|\s+$/g, "");

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

/* =========================================
   11. IMAGE
========================================= */

function extractImageFromBlock(html) {
    html = String(html || "");

    var attributes = [
        "data-src",
        "data-original",
        "data-lazy-src",
        "data-thumb",
        "src"
    ];

    var i;
    var regex;
    var match;

    for (i = 0; i < attributes.length; i++) {
        regex = new RegExp(
            "<img\\b[^>]*" +
            attributes[i] +
            "\\s*=\\s*[\"']([^\"']+)[\"']",
            "i"
        );

        match = html.match(regex);

        if (match && match[1]) {
            return absoluteURL(match[1]);
        }
    }

    return "";
}

function extractImageAlt(html) {
    var match = String(html || "").match(
        /<img\b[^>]*alt\s*=\s*["']([^"']+)["']/i
    );

    return match ? cleanText(match[1]) : "";
}

/* =========================================
   12. MOVIE LINKS
========================================= */

function extractMovieLinks(html) {
    html = String(html || "");

    var result = [];

    var regex =
        /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

    var match;
    var href;
    var block;
    var title;
    var poster;
    var description;

    while ((match = regex.exec(html)) !== null) {
        href = match[1];

        if (!/\/phim\//i.test(href)) {
            continue;
        }

        block = match[0];

        title = getAttribute(block, "title");

        if (!title) {
            title = getAttribute(block, "data-title");
        }

        if (!title) {
            title = extractImageAlt(block);
        }

        if (!title) {
            title = cleanText(block);
        }

        title = cleanText(title);

        if (!title || title.length < 2) {
            continue;
        }

        poster = extractImageFromBlock(block);

        description = getAttribute(block, "data-description");

        if (!description) {
            description = title;
        }

        result.push({
            id: extractSlug(href),
            title: title,
            url: absoluteURL(href),
            poster: poster,
            thumbnail: poster,
            description: cleanText(description),
            year: extractYearFromText(block),
            quality: extractQualityFromText(block),
            episode: extractEpisodeFromText(block),
            type: extractMovieType(block)
        });
    }

    return removeDuplicateMovies(result);
}

/* =========================================
   13. REMOVE DUPLICATES
========================================= */

function removeDuplicateMovies(items) {
    var result = [];
    var used = {};
    var i;
    var key;

    for (i = 0; i < items.length; i++) {
        key = items[i].url || items[i].title;

        if (!used[key]) {
            used[key] = true;
            result.push(items[i]);
        }
    }

    return result;
}

/* =========================================
   14. LIST RESPONSE
========================================= */

function parseListResponse(html) {
    html = String(html || "");

    var movies = extractMovieLinks(html);

    return {
        items: movies,
        movies: movies,
        currentPage: extractCurrentPage(html),
        hasNextPage: extractHasNextPage(html),
        nextPage: extractNextPage(html)
    };
}

/* =========================================
   15. SEARCH RESPONSE
========================================= */

function parseSearchResponse(html) {
    return parseListResponse(html);
}

/* =========================================
   16. DETAIL
========================================= */

function parseMovieDetail(html) {
    html = String(html || "");

    var poster = extractPoster(html);

    return {
        id: extractMovieId(html),
        title: extractMovieTitle(html),
        originalTitle: extractOriginalTitle(html),
        description: extractDescription(html),
        poster: poster,
        thumbnail: poster,
        year: extractYear(html),
        country: extractCountries(html),
        category: extractCategories(html),
        actors: extractActors(html),
        directors: extractDirectors(html),
        duration: extractDuration(html),
        quality: extractQuality(html),
        status: extractStatus(html),
        episodes: extractEpisodes(html)
    };
}

function parseDetailResponse(html) {
    html = String(html || "");

    var detail = parseMovieDetail(html);

    detail.url = extractCanonicalURL(html);
    detail.playerPresent = detectPlayer(html);
    detail.servers = extractServerNames(html);
    detail.nextEpisode = extractNextEpisode(html);
    detail.previousEpisode = extractPreviousEpisode(html);
    detail.likes = extractLikes(html);

    return detail;
}

/* =========================================
   17. TITLE
========================================= */

function extractMovieTitle(html) {
    html = String(html || "");

    var match = html.match(
        /<h1\b[^>]*>([\s\S]*?)<\/h1>/i
    );

    if (match) {
        return cleanText(match[1]);
    }

    match = html.match(
        /<meta\b[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:title["']/i
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

/* =========================================
   18. POSTER
========================================= */

function extractPoster(html) {
    html = String(html || "");

    var patterns = [
        /<meta\b[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/i,
        /<meta\b[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:image["']/i
    ];

    var i;
    var match;

    for (i = 0; i < patterns.length; i++) {
        match = html.match(patterns[i]);

        if (match) {
            return absoluteURL(match[1]);
        }
    }

    return extractImageFromBlock(html);
}

/* =========================================
   19. DESCRIPTION
========================================= */

function extractDescription(html) {
    html = String(html || "");

    var match = html.match(
        /<meta\b[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["']/i
    );

    if (match) {
        return cleanText(match[1]);
    }

    match = html.match(
        /<meta\b[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["']/i
    );

    if (match) {
        return cleanText(match[1]);
    }

    match = html.match(
        /<(?:div|p)\b[^>]*class\s*=\s*["'][^"']*(?:description|content|gioi-thieu|desc)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p)>/i
    );

    return match ? cleanText(match[1]) : "";
}

/* =========================================
   20. YEAR
========================================= */

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

/* =========================================
   21. COUNTRIES
========================================= */

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

/* =========================================
   22. CATEGORIES
========================================= */

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

/* =========================================
   23. ACTORS / DIRECTORS
========================================= */

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

/* =========================================
   24. DURATION
========================================= */

function extractDuration(html) {
    var match = String(html || "").match(
        /(?:thời lượng|duration)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}

/* =========================================
   25. QUALITY
========================================= */

function extractQuality(html) {
    return extractQualityFromText(html);
}

function extractQualityFromText(html) {
    var match = String(html || "").match(
        /\b(4K|2160P|1080P|720P|480P|FHD|HD|CAM|SD)\b/i
    );

    return match ? match[1].toUpperCase() : "";
}

/* =========================================
   26. STATUS
========================================= */

function extractStatus(html) {
    var match = String(html || "").match(
        /(?:trạng thái|status)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}

/* =========================================
   27. EPISODES
========================================= */

function extractEpisodeFromText(html) {
    html = String(html || "");

    var match = html.match(
        /(?:tập|episode|ep)\s*(\d+(?:\/\d+)?)/i
    );

    if (match) {
        return match[1];
    }

    return /full/i.test(html) ? "Full" : "";
}

function extractEpisodes(html) {
    html = String(html || "");

    var result = [];

    var regex =
        /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
        var text = cleanText(match[2]);

        if (/tập\s*\d+|episode\s*\d+|ep\s*\d+|full/i.test(text)) {
            result.push({
                title: text,
                url: absoluteURL(match[1])
            });
        }
    }

    return result;
}

/* =========================================
   28. TYPE
========================================= */

function extractMovieType(html) {
    html = String(html || "");

    if (/short drama/i.test(html)) {
        return "short-drama";
    }

    if (/phim bộ|series/i.test(html)) {
        return "series";
    }

    if (/phim lẻ|movie/i.test(html)) {
        return "movie";
    }

    return "";
}

/* =========================================
   29. MOVIE ID
========================================= */

function extractMovieId(html) {
    var url = extractCanonicalURL(html);

    if (!url) {
        var match = String(html || "").match(
            /<meta\b[^>]*property\s*=\s*["']og:url["'][^>]*content\s*=\s*["']([^"']+)["']/i
        );

        if (match) {
            url = match[1];
        }
    }

    return url ? extractSlug(url) : "";
}

/* =========================================
   30. CANONICAL
========================================= */

function extractCanonicalURL(html) {
    var match = String(html || "").match(
        /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i
    );

    return match ? absoluteURL(match[1]) : "";
}

/* =========================================
   31. PLAYER
========================================= */

function detectPlayer(html) {
    html = String(html || "");

    return (
        /<iframe\b/i.test(html) ||
        /player/i.test(html) ||
        /video/i.test(html)
    );
}

/* =========================================
   32. SERVERS
========================================= */

function extractServerNames(html) {
    html = String(html || "");

    var result = [];
    var regex =
        /<(?:button|a)\b[^>]*class\s*=\s*["'][^"']*(?:btn-player-mode|server|episode-server)[^"']*["'][^>]*>([\s\S]*?)<\/(?:button|a)>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
        var name = cleanText(match[1]);

        if (name && result.indexOf(name) === -1) {
            result.push(name);
        }
    }

    return result;
}

/* =========================================
   33. LINKS
========================================= */

function extractLinks(html) {
    html = String(html || "");

    var result = [];
    var regex =
        /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
        result.push({
            url: absoluteURL(match[1]),
            text: cleanText(match[2])
        });
    }

    return result;
}

function extractNextEpisode(html) {
    var links = extractLinks(html);
    var i;

    for (i = 0; i < links.length; i++) {
        if (/tiếp|next|forward/i.test(links[i].text)) {
            return links[i].url;
        }
    }

    return "";
}

function extractPreviousEpisode(html) {
    var links = extractLinks(html);
    var i;

    for (i = 0; i < links.length; i++) {
        if (/trước|previous|prev/i.test(links[i].text)) {
            return links[i].url;
        }
    }

    return "";
}

/* =========================================
   34. LIKES
========================================= */

function extractLikes(html) {
    var match = String(html || "").match(
        /([\d,.]+)\s*(?:like|lượt thích)/i
    );

    return match ? parseNumber(match[1]) : 0;
}

function parseNumber(value) {
    value = String(value || "");
    value = value.replace(/[^\d]/g, "");

    var number = parseInt(value, 10);

    return isNaN(number) ? 0 : number;
}

/* =========================================
   35. PAGINATION
========================================= */

function extractCurrentPage(html) {
    html = String(html || "");

    var match = html.match(
        /(?:page|trang)\s*=\s*(\d+)/i
    );

    if (match) {
        return parseInt(match[1], 10);
    }

    match = html.match(
        /class\s*=\s*["'][^"']*active[^"']*["'][^>]*>\s*(\d+)/i
    );

    if (match) {
        return parseInt(match[1], 10);
    }

    match = html.match(
        /class\s*=\s*["'][^"']*current[^"']*["'][^>]*>\s*(\d+)/i
    );

    if (match) {
        return parseInt(match[1], 10);
    }

    return 1;
}

function extractHasNextPage(html) {
    html = String(html || "");

    return (
        /rel\s*=\s*["']next["']/i.test(html) ||
        /pagination-next/i.test(html) ||
        /next-page/i.test(html) ||
        /trang sau/i.test(html) ||
        /»/i.test(html)
    );
}

function extractNextPage(html) {
    html = String(html || "");

    var patterns = [
        /<a\b[^>]*rel\s*=\s*["']next["'][^>]*href\s*=\s*["']([^"']+)["']/i,
        /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["']next["']/i,
        /<a\b[^>]*class\s*=\s*["'][^"']*(?:next|pagination-next)[^"']*["'][^>]*href\s*=\s*["']([^"']+)["']/i
    ];

    var i;
    var match;

    for (i = 0; i < patterns.length; i++) {
        match = html.match(patterns[i]);

        if (match) {
            return absoluteURL(match[1]);
        }
    }

    return "";
}

/* =========================================
   36. DEBUG
========================================= */

function debugListParser(html) {
    html = String(html || "");

    var movies = extractMovieLinks(html);

    return {
        htmlLength: html.length,
        containsMovie: html.indexOf("/phim/") !== -1,
        movieCount: movies.length,
        currentPage: extractCurrentPage(html),
        hasNextPage: extractHasNextPage(html),
        nextPage: extractNextPage(html),
        firstMovie: movies.length > 0 ? movies[0] : null,
        preview: html.substring(0, 500)
    };
}

/* =========================================
   END
========================================= */
