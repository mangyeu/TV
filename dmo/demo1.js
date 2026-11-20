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
        id: "tvhay",
        name: "TVHAY",
        version: "2.1.1",
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
   10. IMAGE
========================================================= */

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
            "<img\\b[^>]*\\b" +
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
            title = cleanText(match[2]);
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
        key = items[i].url || items[i].title;

        if (!used[key]) {
            used[key] = true;
            result.push(items[i]);
        }
    }

    return result;
}

/* =========================================================
   13. LIST RESPONSE
========================================================= */

function parseListResponse(html) {
    html = String(html || "");

    var movies = extractMovieLinks(html);

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: extractCurrentPage(html),
            totalPages: 1,
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
   16. DETAIL PARSER
========================================================= */

function parseDetailResponse(html) {
    html = String(html || "");

    var stream = extractStreamURL(html);

    return JSON.stringify({
        url: stream,
        isDirectStream: /\.(m3u8|mp4)(\?|$)/i.test(stream),
        headers: {
            "User-Agent": "Mozilla/5.0",
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
   18. POSTER
========================================================= */

function extractPoster(html) {
    html = String(html || "");

    var patterns = [
        /<meta\b[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/i,
        /<meta\b[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:image["']/i,
        /<meta\b[^>]*name\s*=\s*["']twitter:image["'][^>]*content\s*=\s*["']([^"']+)["']/i
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

        if (match) {
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
   26. STATUS
========================================================= */

function extractStatus(html) {
    var match = String(html || "").match(
        /(?:trạng thái|status)\s*[:：]?\s*([^<]+)/i
    );

    return match ? cleanText(match[1]) : "";
}

/* =========================================================
   27. EPISODES
============================================
