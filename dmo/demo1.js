/* =========================================
   TVHAY.BUZZ PLUGIN
   JavaScript ES5
   Android WebView Compatible
========================================= */

var BASE_URL = "https://tvhay.buzz";


/* =========================================
   1. MANIFEST
========================================= */

function getManifest() {
    return {
        id: "tvhay",
        name: "TVHAY",
        version: "1.0.1",
        baseUrl: BASE_URL,
        language: "vi",
        type: "movie"
    };
}


/* =========================================
   2. HOME SECTIONS
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
   3. PRIMARY CATEGORIES
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
   5. URL LIST
========================================= */

function getUrlList(page) {
    page = page || 1;

    if (page <= 1) {
        return BASE_URL + "/phim-moi";
    }

    return BASE_URL + "/phim-moi/" + page;
}


/* =========================================
   6. URL SEARCH
========================================= */

function getUrlSearch(keyword, page) {
    keyword = String(keyword || "");
    page = page || 1;

    var url = BASE_URL +
        "/tim-kiem?keyword=" +
        encodeURIComponent(keyword);

    if (page > 1) {
        url += "&page=" + page;
    }

    return url;
}


/* =========================================
   7. URL DETAIL
========================================= */

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


/* =========================================
   8. URL CATEGORIES
========================================= */

function getUrlCategories(category, page) {
    category = String(category || "");
    page = page || 1;

    category = category.replace(/^\/+|\/+$/g, "");

    var url = BASE_URL + "/the-loai/" + category;

    if (page > 1) {
        url += "/" + page;
    }

    return url;
}


/* =========================================
   9. URL COUNTRIES
========================================= */

function getUrlCountries(country, page) {
    country = String(country || "");
    page = page || 1;

    country = country.replace(/^\/+|\/+$/g, "");

    var url = BASE_URL + "/quoc-gia/" + country;

    if (page > 1) {
        url += "/" + page;
    }

    return url;
}


/* =========================================
   10. URL YEARS
========================================= */

function getUrlYears(year, page) {
    year = String(year || "");
    page = page || 1;

    var url = BASE_URL + "/nam/" + year;

    if (page > 1) {
        url += "/" + page;
    }

    return url;
}


/* =========================================
   11. PARSE LIST RESPONSE
========================================= */

function parseListResponse(html) {
    html = String(html || "");

    var movies = [];
    var links = extractMovieLinks(html);
    var i;
    var item;

    for (i = 0; i < links.length; i++) {
        item = links[i];

        if (!item.title) {
            continue;
        }

        movies.push({
            id: item.id,
            title: item.title,
            url: item.url,
            poster: item.poster,
            thumbnail: item.poster,
            description: item.description,
            year: item.year,
            quality: item.quality,
            episode: item.episode,
            type: item.type
        });
    }

    return {
        items: movies,
        movies: movies,
        currentPage: extractCurrentPage(html),
        hasNextPage: extractHasNextPage(html),
        nextPage: extractNextPage(html)
    };
}


/* =========================================
   12. PARSE MOVIE DETAIL
========================================= */

function parseMovieDetail(html) {
    html = String(html || "");

    var title = extractMovieTitle(html);
    var poster = extractPoster(html);
    var description = extractDescription(html);
    var originalTitle = extractOriginalTitle(html);

    return {
        id: extractMovieId(html),
        title: title,
        originalTitle: originalTitle,
        description: description,
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


/* =========================================
   13. PARSE DETAIL RESPONSE
========================================= */

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
   HELPERS
========================================= */


/* -----------------------------------------
   HTML CLEAN
----------------------------------------- */

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

    text = text.replace(/&#(\d+);/g, function (match, code) {
        return String.fromCharCode(parseInt(code, 10));
    });

    text = text.replace(/\s+/g, " ");

    return text.replace(/^\s+|\s+$/g, "");
}


/* -----------------------------------------
   ATTRIBUTE
----------------------------------------- */

function getAttribute(html, name) {
    html = String(html || "");
    name = String(name || "");

    var regex = new RegExp(
        "\\b" + name + "\\s*=\\s*([\"'])([\\s\\S]*?)\\1",
        "i"
    );

    var match = html.match(regex);

    if (match) {
        return match[2];
    }

    return "";
}


/* -----------------------------------------
   ABSOLUTE URL
----------------------------------------- */

function absoluteURL(url) {
    url = String(url || "").replace(/^\s+|\s+$/g, "");

    if (!url) {
        return "";
    }

    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    if (/^\/\//.test(url)) {
        return "https:" + url;
    }

    if (url.charAt(0) === "/") {
        return BASE_URL + url;
    }

    return BASE_URL + "/" + url;
}


/* -----------------------------------------
   SLUG
----------------------------------------- */

function extractSlug(url) {
    url = String(url || "");

    url = url.replace(/[?#].*$/, "");
    url = url.replace(/\/+$/, "");

    var parts = url.split("/");

    return parts[parts.length - 1] || "";
}


/* -----------------------------------------
   MOVIE LINKS
----------------------------------------- */

function extractMovieLinks(html) {
    html = String(html || "");

    var result = [];

    var regex =
        /<a\b[^>]*href\s*=\s*["']([^"']*\/phim\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

    var match;
    var block;
    var href;
    var title;
    var poster;
    var description;
    var year;
    var quality;
    var episode;
    var type;

    while ((match = regex.exec(html)) !== null) {
        href = match[1];
        block = match[0];

        title = getAttribute(block, "title");

        if (!title) {
            title = getAttribute(block, "data-title");
        }

        if (!title) {
            title = getAttribute(block, "alt");
        }

        if (!title) {
            title = extractImageAlt(block);
        }

        if (!title) {
            title = cleanText(block);
        }

        title = cleanText(title);

        poster = extractImageFromBlock(block);

        description = getAttribute(block, "data-description");

        if (!description) {
            description = cleanText(block);
        }

        year = extractYearFromText(block);

        quality = extractQualityFromText(block);

        episode = extractEpisodeFromText(block);

        type = extractMovieType(block);

        result.push({
            id: extractSlug(href),
            title: title,
            url: absoluteURL(href),
            poster: poster,
            description: description,
            year: year,
            quality: quality,
            episode: episode,
            type: type
        });
    }

    return removeDuplicateMovies(result);
}


/* -----------------------------------------
   DUPLICATE MOVIES
----------------------------------------- */

function removeDuplicateMovies(items) {
    var result = [];
    var used = {};
    var i;
    var key;

    for (i = 0; i < items.length; i++) {
        key = items[i].url;

        if (!key) {
            key = items[i].title;
        }

        if (!used[key]) {
            used[key] = true;
            result.push(items[i]);
        }
    }

    return result;
}


/* -----------------------------------------
   IMAGE
----------------------------------------- */

function extractImageFromBlock(html) {
    html = String(html || "");

    var match = html.match(
        /<img\b[^>]*src\s*=\s*["']([^"']+)["']/i
    );

    if (!match) {
        match = html.match(
            /<img\b[^>]*data-src\s*=\s*["']([^"']+)["']/i
        );
    }

    if (!match) {
        match = html.match(
            /<img\b[^>]*data-original\s*=\s*["']([^"']+)["']/i
        );
    }

    if (!match) {
        match = html.match(
            /<img\b[^>]*src\s*=\s*["']([^"']+)["']/i
        );
    }

    if (match) {
        return absoluteURL(match[1]);
    }

    return "";
}


function extractImageAlt(html) {
    html = String(html || "");

    var match = html.match(
        /<img\b[^>]*alt\s*=\s*["']([^"']+)["']/i
    );

    return match ? cleanText(match[1]) : "";
}


/* -----------------------------------------
   MOVIE TITLE
----------------------------------------- */

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

    if (match) {
        return cleanText(match[1]);
    }

    return "";
}


/* -----------------------------------------
   ORIGINAL TITLE
----------------------------------------- */

function extractOriginalTitle(html) {
    html = String(html || "");

    var match = html.match(
        /(?:tên gốc|original title)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}


/* -----------------------------------------
   POSTER
----------------------------------------- */

function extractPoster(html) {
    html = String(html || "");

    var match = html.match(
        /<meta\b[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/i
    );

    if (match) {
        return absoluteURL(match[1]);
    }

    return extractImageFromBlock(html);
}


/* -----------------------------------------
   DESCRIPTION
----------------------------------------- */

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
        /<div\b[^>]*class\s*=\s*["'][^"']*(?:description|content|gioi-thieu)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    );

    if (match) {
        return cleanText(match[1]);
    }

    return "";
}


/* -----------------------------------------
   YEAR
----------------------------------------- */

function extractYear(html) {
    html = String(html || "");

    var match = html.match(
        /(?:năm|year|khởi chiếu)\s*[:：]?\s*(19\d{2}|20\d{2})/i
    );

    if (match) {
        return match[1];
    }

    match = html.match(
        /\b(19\d{2}|20\d{2})\b/
    );

    return match ? match[1] : "";
}


function extractYearFromText(html) {
    html = String(html || "");

    var match = html.match(
        /\b(19\d{2}|20\d{2})\b/
    );

    return match ? match[1] : "";
}


/* -----------------------------------------
   COUNTRY
----------------------------------------- */

function extractCountries(html) {
    html = String(html || "");

    var result = [];

    var regex =
        /<a\b[^>]*href\s*=\s*["'][^"']*\/quoc-gia\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
        var country = cleanText(match[1]);

        if (country && result.indexOf(country) === -1) {
            result.push(country);
        }
    }

    if (result.length > 0) {
        return result;
    }

    match = html.match(
        /(?:quốc gia|country)\s*[:：]?\s*([^<]+)/i
    );

    if (match) {
        result.push(cleanText(match[1]));
    }

    return result;
}


/* -----------------------------------------
   CATEGORIES
----------------------------------------- */

function extractCategories(html) {
    html = String(html || "");

    var result = [];

    var regex =
        /<a\b[^>]*href\s*=\s*["'][^"']*\/the-loai\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
        var category = cleanText(match[1]);

        if (category && result.indexOf(category) === -1) {
            result.push(category);
        }
    }

    return result;
}


/* -----------------------------------------
   ACTORS
----------------------------------------- */

function extractActors(html) {
    html = String(html || "");

    var match = html.match(
        /(?:diễn viên|actors)\s*[:：]?\s*([\s\S]*?)(?:<\/div>|<\/li>)/i
    );

    if (!match) {
        return [];
    }

    return extractNames(match[1]);
}


/* -----------------------------------------
   DIRECTORS
----------------------------------------- */

function extractDirectors(html) {
    html = String(html || "");

    var match = html.match(
        /(?:đạo diễn|director)\s*[:：]?\s*([\s\S]*?)(?:<\/div>|<\/li>)/i
    );

    if (!match) {
        return [];
    }

    return extractNames(match[1]);
}


/* -----------------------------------------
   NAMES
----------------------------------------- */

function extractNames(html) {
    html = String(html || "");

    var result = [];

    var regex =
        /<a\b[^>]*>([\s\S]*?)<\/a>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
        var name = cleanText(match[1]);

        if (name && result.indexOf(name) === -1) {
            result.push(name);
        }
    }

    return result;
}


/* -----------------------------------------
   DURATION
----------------------------------------- */

function extractDuration(html) {
    html = String(html || "");

    var match = html.match(
        /(?:thời lượng|duration)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}


/* -----------------------------------------
   QUALITY
----------------------------------------- */

function extractQuality(html) {
    return extractQualityFromText(html);
}


function extractQualityFromText(html) {
    html = String(html || "");

    var match = html.match(
        /\b(4K|2160P|1080P|720P|480P|FHD|HD|CAM|SD)\b/i
    );

    return match ? match[1].toUpperCase() : "";
}


/* -----------------------------------------
   STATUS
----------------------------------------- */

function extractStatus(html) {
    html = String(html || "");

    var match = html.match(
        /(?:trạng thái|status)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}


/* -----------------------------------------
   EPISODE
----------------------------------------- */

function extractEpisodeFromText(html) {
    html = String(html || "");

    var match = html.match(
        /(?:tập|episode|ep)\s*(\d+(?:\/\d+)?)/i
    );

    if (match) {
        return match[1];
    }

    if (/full/i.test(html)) {
        return "Full";
    }

    return "";
}


/* -----------------------------------------
   MOVIE TYPE
----------------------------------------- */

function extractMovieType(html) {
    html = String(html || "");

    if (/phim bộ|series/i.test(html)) {
        return "series";
    }

    if (/phim lẻ|movie/i.test(html)) {
        return "movie";
    }

    if (/short drama/i.test(html)) {
        return "short-drama";
    }

    return "";
}


/* -----------------------------------------
   MOVIE ID
----------------------------------------- */

function extractMovieId(html) {
    html = String(html || "");

    var match = html.match(
        /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i
    );

    if (match) {
        return extractSlug(match[1]);
    }

    match = html.match(
        /<meta\b[^>]*property\s*=\s*["']og:url["'][^>]*content\s*=\s*["']([^"']+)["']/i
    );

    if (match) {
        return extractSlug(match[1]);
    }

    return "";
}


/* -----------------------------------------
   CANONICAL URL
----------------------------------------- */

function extractCanonicalURL(html) {
    html = String(html || "");

    var match = html.match(
        /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']+)["']/i
    );

    if (match) {
        return absoluteURL(match[1]);
    }

    return "";
}


/* -----------------------------------------
   PLAYER DETECT
----------------------------------------- */

function detectPlayer(html) {
    html = String(html || "");

    return /<iframe\b/i.test(html);
}


/* -----------------------------------------
   SERVER NAMES
----------------------------------------- */

function extractServerNames(html) {
    html = String(html || "");

    var result = [];

    var regex =
        /<button\b[^>]*class\s*=\s*["'][^"']*btn-player-mode[^"']*["'][^>]*>([\s\S]*?)<\/button>/gi;

    var match;

    while ((match = regex.exec(html)) !== null) {
        var name = cleanText(match[1]);

        if (name) {
            result.push(name);
        }
    }

    return result;
}


/* -----------------------------------------
   NEXT EPISODE
----------------------------------------- */

function extractNextEpisode(html) {
    html = String(html || "");

    var links = extractLinks(html);
    var i;

    for (i = 0; i < links.length; i++) {
        if (/tiếp|next|forward/i.test(links[i].text)) {
            return links[i].url;
        }
    }

    return "";
}


/* -----------------------------------------
   PREVIOUS EPISODE
----------------------------------------- */

function extractPreviousEpisode(html) {
    html = String(html || "");

    var links = extractLinks(html);
    var i;

    for (i = 0; i < links.length; i++) {
        if (/trước|previous|prev/i.test(links[i].text)) {
            return links[i].url;
        }
    }

    return "";
}


/* -----------------------------------------
   LINKS
----------------------------------------- */

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


/* -----------------------------------------
   LIKES
----------------------------------------- */

function extractLikes(html) {
    html = String(html || "");

    var match = html.match(
        /([\d,.]+)\s*(?:like|lượt thích)/i
    );

    if (!match) {
        return 0;
    }

    return parseNumber(match[1]);
}


/* -----------------------------------------
   NUMBER
----------------------------------------- */

function parseNumber(value) {
    value = String(value || "");

    value = value.replace(/[^\d.,]/g, "");
    value = value.replace(/,/g, "");

    var number = parseFloat(value);

    if (isNaN(number)) {
        return 0;
    }

    return number;
}


/* -----------------------------------------
   CURRENT PAGE
----------------------------------------- */

function extractCurrentPage(html) {
    html = String(html || "");

    var match = html.match(
        /(?:page|trang)\s*=\s*(\d+)/i
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


/* -----------------------------------------
   NEXT PAGE
----------------------------------------- */

function extractHasNextPage(html) {
    html = String(html || "");

    return /rel\s*=\s*["']next["']|pagination-next|next-page|trang sau|»/i.test(html);
}


function extractNextPage(html) {
    html = String(html || "");

    var match = html.match(
        /<a\b[^>]*rel\s*=\s*["']next["'][^>]*href\s*=\s*["']([^"']+)["']/i
    );

    if (match) {
        return absoluteURL(match[1]);
    }

    match = html.match(
        /<a\b[^>]*class\s*=\s*["'][^"']*(?:next|pagination-next)[^"']*["'][^>]*href\s*=\s*["']([^"']+)["']/i
    );

    if (match) {
        return absoluteURL(match[1]);
    }

    return "";
}


/* =========================================
   END
========================================= */
