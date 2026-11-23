// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javcc.me";

function normalizeSlug(rawSlug) {
    if (!rawSlug) return "";
    var s = String(rawSlug).trim();
    if (s.indexOf("http") === 0) {
        s = s.replace(/^https?:\/\/[^\/]+/i, "");
    }
    s = s.replace(/^\/+|\/+$/g, "");
    return s;
}

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.2",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embedtoexoplay"
    });
}

// Menu chính lấy trực tiếp theo cấu trúc <ul id="menu-main-menu"> của javcc.me
function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Home", slug: "" },
        { name: "Latest", slug: "?filter=latest" },
        { name: "Censored", slug: "category/censored" },
        { name: "Reducing Mosaic", slug: "category/reducing-mosaic" },
        { name: "English Subtitle", slug: "category/english-subtitle" },
        { name: "Actors", slug: "actors" },
        { name: "Studios", slug: "studios" },
        { name: "Tags", slug: "tags" }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "category/censored", title: "JAV Censored Videos", type: "Horizontal", path: "" },
        { slug: "?filter=random", title: "JAV Random Videos", type: "Horizontal", path: "" },
        { slug: "category/reducing-mosaic", title: "JAV Reducing Mosaic Porn Videos", type: "Horizontal", path: "" },
        { slug: "?filter=latest", title: "Latest Videos", type: "Grid", path: "" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mặc định", value: "" },
            { name: "Mới nhất", value: "?filter=latest" },
            { name: "Ngẫu nhiên", value: "?filter=random" }
        ],
        category: [
            { name: "Censored", value: "category/censored" },
            { name: "Reducing Mosaic", value: "category/reducing-mosaic" },
            { name: "English Subtitle", value: "category/english-subtitle" },
            { name: "Actors", value: "actors" },
            { name: "Studios", value: "studios" },
            { name: "Tags", value: "tags" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    var target = (filters.category || slug || "").trim();

    if (!target || target === "recent") {
        target = "";
    }

    if (target.indexOf("http") === 0) {
        target = target.replace(/^https?:\/\/[^\/]+/i, "");
    }

    var baseTargetUrl = BASE_URL + "/";
    if (target) {
        if (target.indexOf("?") === 0) {
            baseTargetUrl = BASE_URL + "/" + target;
        } else {
            baseTargetUrl = BASE_URL + "/" + target.replace(/^\/+|\/+$/g, "");
        }
    }

    // Thêm sort filter nếu có
    if (filters.sort && filters.sort.indexOf("?filter=") === 0 && baseTargetUrl.indexOf("filter=") === -1) {
        baseTargetUrl += (baseTargetUrl.indexOf("?") !== -1 ? "&" : "?") + filters.sort.substring(1);
    }

    // Phân trang WordPress: /page/2/ hoặc &paged=2
    if (page > 1) {
        if (baseTargetUrl.indexOf("?") !== -1) {
            baseTargetUrl += "&paged=" + page;
        } else {
            baseTargetUrl = baseTargetUrl.replace(/\/+$/, "") + "/page/" + page + "/";
        }
    }

    return baseTargetUrl;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
    var page = parseInt(filters.page, 10) || 1;
    var url = BASE_URL + "/?s=" + encodeURIComponent(keyword || "");
    if (page > 1) {
        url += "&paged=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    var s = String(slug).trim();
    if (s.indexOf("http") === 0) return s;
    return BASE_URL + "/" + normalizeSlug(s);
}

// Trả về trang chủ có chứa <ul id="menu-main-menu"> để parseCategoriesResponse bóc menu
function getUrlCategories() { return BASE_URL + "/"; }
function getUrlCountries() { return BASE_URL + "/"; }
function getUrlYears() { return BASE_URL + "/"; }

// =============================================================================
// PARSERS
// =============================================================================

var PluginUtils = {
    cleanText: function (text) {
        if (!text) return "";
        return String(text)
            .replace(/<[^>]*>/g, "")
            .replace(/–/g, "-")
            .replace(/’/g, "'")
            .replace(/“|”/g, '"')
            .replace(/…/g, "...")
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/ /g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }
};

function parseListResponse(html) {
    var src = html || "";
    var moviesMap = {};

    // Cấu trúc thật: <article ... class="loop-video ...">
    var parts = src.split(/<article[^>]*class=["'][^"']*loop-video[^"']*["'][^>]*>/i);

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];

        var linkMatch = itemHtml.match(/<a[^>]*href=["']([^"']+)["'][^>]*(?:title=["']([^"']*)["'])?/i)
            || itemHtml.match(/<a[^>]*title=["']([^"']*)["'][^>]*href=["']([^"']+)["']/i);

        var fullUrl = "";
        var title = "";
        if (linkMatch) {
            if (itemHtml.indexOf("href=") < itemHtml.indexOf("title=") || itemHtml.indexOf("title=") === -1) {
                fullUrl = linkMatch[1] || "";
                title = linkMatch[2] || "";
            } else {
                title = linkMatch[1] || "";
                fullUrl = linkMatch[2] || "";
            }
        }

        if (!title) {
            var spanTitle = itemHtml.match(/<header[^>]*class=["']entry-header["'][^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
            if (spanTitle) title = spanTitle[1];
        }

        var slug = normalizeSlug(fullUrl);

        var thumb = "";
        var imgMatch = itemHtml.match(/<img([^>]+)>/i);
        if (imgMatch) {
            var imgAttrs = imgMatch[1];
            var dataSrcM = imgAttrs.match(/data-src=["']([^"']+)["']/i);
            var srcM = imgAttrs.match(/src=["']([^"']+)["']/i);
            thumb = (dataSrcM && dataSrcM[1]) ? dataSrcM[1] : (srcM ? srcM[1] : "");
        }

        var durationMatch = itemHtml.match(/<span[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var duration = durationMatch ? PluginUtils.cleanText(durationMatch[1]) : "";

        var viewsMatch = itemHtml.match(/<span[^>]*class=["'][^"']*views[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var views = viewsMatch ? PluginUtils.cleanText(viewsMatch[1]) : "";

        var labels = [];
        if (duration) labels.push(duration);
        if (views) labels.push(views + " views");

        if (slug && !moviesMap[slug]) {
            moviesMap[slug] = {
                id: slug,
                title: PluginUtils.cleanText(title) || "Phim không tiêu đề",
                posterUrl: thumb,
                backdropUrl: thumb,
                year: 0,
                quality: "HD",
                episode_current: labels.join(" | ") || "HD",
                lang: "English / JAV"
            };
        }
    }

    var movies = [];
    for (var key in moviesMap) {
        if (moviesMap.hasOwnProperty(key)) {
            movies.push(moviesMap[key]);
        }
    }

    var currentPage = 1;
    var totalPages = 1;
    var activePage = src.match(/<span[^>]*class=["'][^"']*page-numbers current[^"']*["'][^>]*>(\d+)<\/span>/i);
    if (activePage) {
        currentPage = parseInt(activePage[1], 10) || 1;
    }

    var pageNums = src.match(/class=["'][^"']*page-numbers[^"']*["'][^>]*>(\d+)</gi);
    if (pageNums) {
        for (var j = 0; j < pageNums.length; j++) {
            var numM = pageNums[j].match(/>(\d+)</);
            if (numM) {
                var n = parseInt(numM[1], 10);
                if (n > totalPages) totalPages = n;
            }
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: movies.length,
            itemsPerPage: movies.length || 20
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        var descMatch = html.match(/<div[^>]*class=["'][^"']*desc[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
            || html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        var thumbMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var thumb = thumbMatch ? thumbMatch[1] : "";

        var iframeMatch = html.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        var embedUrl =
