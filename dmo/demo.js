function getManifest() {
    return JSON.stringify({
        "id": "javhdz",
        "name": "JAVHDZ",
        "version": "1.0.4",
        "baseUrl": "https://javhdz.today",
        "iconUrl": "https://javhdz.today/favicon-32x32.png",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'watched', title: 'Jav Uploaded Today', type: 'Horizontal', path: 'fp_section' },
        { slug: 'engsub', title: 'Jav English Sub', type: 'Horizontal', path: 'fp_section' },
        { slug: 'topmostsearch', title: 'Top Most Searched', type: 'Horizontal', path: 'fp_section' },
        { slug: 'amateur', title: 'Mom Fuck Son', type: 'Horizontal', path: 'fp_section' },
        { slug: 'beautifulgirl', title: 'Beautiful Girl', type: 'Horizontal', path: 'fp_section' },
        { slug: 'uncensored', title: 'Uncensored Leak', type: 'Horizontal', path: 'fp_section' },
        { slug: 'bigtit', title: 'Big Tits Jav', type: 'Horizontal', path: 'fp_section' },
        { slug: 'creampie', title: 'Creampie Jav', type: 'Horizontal', path: 'fp_section' },
        { slug: 'debut', title: 'Debut Production', type: 'Horizontal', path: 'fp_section' },
        { slug: 'featured', title: 'New Releaseday', type: 'Horizontal', path: 'fp_section' },
        { slug: 'recent', title: 'Best AV Videos', type: 'Grid', path: 'fp_section' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Recent', slug: 'recent' },
        { name: 'Popular', slug: 'popular' },
        { name: 'Release Date', slug: 'releaseday' },
        { name: 'Jav Sub', slug: 'jav-sub' },
        { name: 'Uncensored Jav', slug: 'uncensored-jav' },
        { name: 'Reducing Mosaic', slug: 'reducing-mosaic' },
        { name: 'Amateur', slug: 'amateur' },
        { name: 'Big Tits', slug: 'big-tits' },
        { name: 'Creampie', slug: 'creampie' },
        { name: 'Beautiful Girl', slug: 'beautiful-girl' },
        { name: 'Debut Production', slug: 'debut-production' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Recent', value: 'recent' },
            { name: 'Popular', value: 'popular' },
            { name: 'Release Date', value: 'releaseday' },
            { name: 'Rated', value: 'rated' },
            { name: 'Discussed', value: 'discussed' },
            { name: 'Downloaded', value: 'downloaded' },
            { name: 'Longest', value: 'longest' },
            { name: 'Watched', value: 'watched' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

var JAVHDZ_BASE_URL = "https://javhdz.today";

var SECTION_SLUGS = [
    'watched', 'engsub', 'topmostsearch', 'amateur',
    'beautifulgirl', 'uncensored', 'bigtit', 'creampie',
    'debut', 'featured', 'recent'
];

var SORT_ROUTES = [
    'recent', 'popular', 'releaseday', 'rated',
    'discussed', 'downloaded', 'longest', 'watched'
];

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var cleanSlug = String(slug || "recent").replace(/^\/+|\/+$/g, "");

        // Nếu gọi section AJAX của trang chủ (?ajax=fp_section&s=...)
        if (SECTION_SLUGS.indexOf(cleanSlug) !== -1) {
            var ajaxUrl = JAVHDZ_BASE_URL + "/?ajax=fp_section&s=" + encodeURIComponent(cleanSlug);
            if (page > 1) {
                ajaxUrl += "&page=" + page;
            }
            return ajaxUrl;
        }

        // Nếu có chọn sort tương ứng với route của site (/popular/, /rated/, ...)
        var targetSlug = cleanSlug;
        if (filters.sort && SORT_ROUTES.indexOf(filters.sort) !== -1 && (cleanSlug === 'recent' || cleanSlug === 'popular')) {
            targetSlug = filters.sort;
        }

        var url = JAVHDZ_BASE_URL + "/" + targetSlug.replace(/^\/+|\/+$/g, "") + "/";
        var query = [];

        if (page > 1) {
            query.push("page=" + page);
        }
        if (filters.year) {
            query.push("year=" + encodeURIComponent(filters.year));
        }
        if (query.length > 0) {
            url += "?" + query.join("&");
        }

        return url;
    } catch (e) {
        return JAVHDZ_BASE_URL + "/recent/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var q = encodeURIComponent((keyword || "").trim());
        var url = JAVHDZ_BASE_URL + "/search/video/?s=" + q;
        if (page > 1) {
            url += "&page=" + page;
        }
        return url;
    } catch (e) {
        return JAVHDZ_BASE_URL + "/search/video/?s=" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    var raw = String(slug || "").trim();
    if (!raw) return JAVHDZ_BASE_URL;
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
        return raw;
    }
    return JAVHDZ_BASE_URL + "/" + raw.replace(/^\/+/, "");
}

function getUrlCategories() {
    return JAVHDZ_BASE_URL + "/categories/";
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var y = currentYear; y >= 1990; y--) {
        years.push({ name: String(y), value: String(y) });
    }
    return JSON.stringify(years);
}

// =============================================================================
// PARSERS & HELPERS
// =============================================================================

function decodeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&")
        .replace(/"/g, "\"")
        .replace(/'|'/g, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/&#x([0-9a-fA-F]+);/g, function (_, hex) {
            return String.fromCharCode(parseInt(hex, 16));
        })
        .replace(/&#([0-9]+);/g, function (_, dec) {
            return String.fromCharCode(parseInt(dec, 10));
        })
        .trim();
}

function stripHtml(html) {
    return decodeHtml(String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " "));
}

function toFullUrl(url) {
    var raw = String(url || "").trim();
    if (!raw) return "";
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) return raw;
    if (raw.indexOf("//") === 0) return "https:" + raw;
    return JAVHDZ_BASE_URL + "/" + raw.replace(/^\/+/, "");
}

function extractItemsFromHtml(html) {
    var source = String(html || "");
    var movies = [];
    var seen = {};

    // Khớp các thẻ <li> chứa khối .video hoặc link video
    var blockRegex = /<li[^>]*>([\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>[\s\S]*?)<\/li>/gi;
    var match;

    while ((match = blockRegex.exec(source)) !== null) {
        var blockHtml = match[1] || "";
        var href = toFullUrl(match[2] || "");

        // Bỏ qua link điều hướng/phân trang/danh mục không phải video
        if (!href || /\/(categories|pornstar|channels|search|news|static|user)\b/i.test(href)) {
            continue;
        }

        var id = href.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+/, "");
        if (!id || seen[id]) continue;

        var imgMatch = blockHtml.match(/<img[^>]+(?:data-src|data-original|src)=["']([^"']+)["'][^>]*>/i);
        var posterUrl = imgMatch ? toFullUrl(imgMatch[1]) : "";

        // Bỏ qua icon nhỏ hoặc ảnh placeholder
        if (!posterUrl || /favicon|logo|icon|pulse/i.test(posterUrl)) {
            continue;
        }

        var titleMatch = blockHtml.match(/class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/a>/i)
            || blockHtml.match(/<a[^>]+title=["']([^"']+)["']/i)
            || blockHtml.match(/<img[^>]+alt=["']([^"']+)["']/i);

        var rawTitle = titleMatch ? (titleMatch[1] || "") : stripHtml(blockHtml);
        var title = stripHtml(rawTitle);
        if (!title) continue;

        var qualityMatch = blockHtml.match(/\b(4K|1080p|720p|HD|FHD|CAM)\b/i);
        var durationMatch = blockHtml.match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/);

        seen[id] = true;
        movies.push({
            id: id,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            year: 0,
            quality: qualityMatch ? qualityMatch[1].toUpperCase() : "HD",
            episode_current: durationMatch ? durationMatch[1] : "Full",
            lang: "JAV"
        });
    }

    return movies;
}

function parseListResponse(responseText) {
    try {
        var rawText = String(responseText || "").trim();
        var html = rawText;
        var totalFromJson = 0;
        var paginationHtml = "";

        // Xử lý phản hồi JSON từ ?ajax=fp_section&s=...
        if (rawText.charAt(0) === "{") {
            var json = JSON.parse(rawText);
            html = String(json.html || "");
            totalFromJson = parseInt(json.total, 10) || 0;
            paginationHtml = String(json.pagination || "");
        }

        var items = extractItemsFromHtml(html);
        var pageMatch = (html + " " + paginationHtml).match(/[?&]page=(\d+)/i);
        var currentPage = pageMatch ? (parseInt(pageMatch[1], 10) || 1) : 1;

        var pages = [];
        var pageLinkRegex = /[?&]page=(\d+)/gi;
        var pMatch;
        var maxPage = currentPage;
        while ((pMatch = pageLinkRegex.exec(paginationHtml || html)) !== null) {
            var num = parseInt(pMatch[1], 10) || 1;
            if (num > maxPage) maxPage = num;
            pages.push(num);
        }

        var totalItems = totalFromJson > 0 ? totalFromJson : items.length;
        var itemsPerPage = items.length > 0 ? items.length : 24;
        var totalPages = maxPage > currentPage ? maxPage : Math.max(1, Math.ceil(totalItems / itemsPerPage));

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 }
        });
    }
}

function parseSearchResponse(responseText) {
    return parseListResponse(responseText);
}

function parseMovieDetail(htmlText) {
    try {
        var html = String(htmlText || "");

        var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
        var title = stripHtml((h1Match && h1Match[1]) || (ogTitleMatch && ogTitleMatch[1]) || "");

        var ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        var posterUrl = ogImgMatch ? toFullUrl(ogImgMatch[1]) : "";

        var descMatch = html.match(/<meta[^>]+(?:name=["']description["']|property=["']og:description["'])[^>]+content=["']([^"']+)["']/i);
        var description = descMatch ? decodeHtml(descMatch[1]) : "";

        var streams = [];
        var seenUrls = {};

        function pushStream(url, label) {
            var full = toFullUrl(url);
            if (!full || seenUrls[full]) return;
            seenUrls[full] = true;
            var isM3u8 = /\.m3u8(\?|$)/i.test(full);
            streams.push({
                id: full,
                name: label || "Server",
                slug: "full",
                m3u8: isM3u8 ? full : "",
                embed: isM3u8 ? "" : full
            });
        }

        var mediaRegex = /(https?:\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/gi;
        var mMatch;
        var mIdx = 1;
        while ((mMatch = mediaRegex.exec(html)) !== null) {
            pushStream(mMatch[1], "Direct " + mIdx++);
        }

        var iframeRegex = /<iframe[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>/gi;
        var iMatch;
        var iIdx = 1;
        while ((iMatch = iframeRegex.exec(html)) !== null) {
            pushStream(iMatch[1], "Embed " + iIdx++);
        }

        var servers = [];
        if (streams.length > 0) {
            servers.push({
                name: "Server 1",
                episodes: streams
            });
        }

        return JSON.stringify({
            id: "",
            title: title,
            originName: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: 0,
            rating: 0,
            quality: "HD",
            duration: "",
            servers: servers,
            episode_current: streams.length > 0 ? "Full" : "",
            lang: "JAV",
            category: "",
            country: "Nhật Bản",
            director: "",
            casts: "",
            status: "",
            tmdbId: "",
            tmdbSeason: 0,
            tmdbType: ""
        });
    } catch (error) {
        return "null";
    }
}

function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").trim();
    var isHlsOrDirect = /\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw);
    return JSON.stringify({
        url: raw,
        isDirectStream: isHlsOrDirect,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": JAVHDZ_BASE_URL + "/"
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    try {
        var parsed = JSON.parse(apiResponseJson || "{}");
        var candidate = parsed.url || parsed.streamUrl || parsed.link_m3u8 || parsed.link_embed || "";
        return resolveStreamData(candidate);
    } catch (e) {
        return resolveStreamData(apiResponseJson);
    }
}

function parseCategoriesResponse() {
    return getPrimaryCategories();
}

function parseCountriesResponse() {
    return JSON.stringify([
        { name: "Nhật Bản", value: "japan" }
    ]);
}

function parseYearsResponse() {
    return getLocalYearsJson();
}
