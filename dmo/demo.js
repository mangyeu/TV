// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "2.4.0",
        "baseUrl": "https://missav.media",
        "referrer": "https://missav.media/",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/missav.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "subtitleCat": true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'vi/today-hot', title: 'Hot Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'vi/weekly-hot', title: 'Hot Trong Tuần', type: 'Horizontal', path: '' },
        { slug: 'vi/monthly-hot', title: 'Hot Trong Tháng', type: 'Horizontal', path: '' },
        { slug: 'vi/uncensored-leak', title: 'Không Che (Rò Rỉ)', type: 'Horizontal', path: '' },
        { slug: 'vi/new', title: 'Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'vi/new' },
        { name: 'Nữ diễn viên', slug: 'vi/actresses' },
        { name: 'Thể loại', slug: 'vi/genres' },
        { name: 'Không che', slug: 'vi/uncensored-leak' },
        { name: "FC2", slug: "vi/series/FC2" },
        { name: "HEYZO", slug: "vi/series/HEYZO" },
        { name: "Tokyo Hot", slug: "vi/series/Tokyo-Hot" },
        { name: "1pondo", slug: "vi/series/1pondo" },
        { name: "Caribbeancom", slug: "vi/series/Caribbeancom" },
        { name: "10musume", slug: "vi/series/10musume" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'new' },
            { name: 'Xem nhiều', value: 'views' },
            { name: 'Hôm nay', value: 'today_views' },
            { name: 'Tuần này', value: 'weekly_views' },
            { name: 'Tháng này', value: 'monthly_views' }
        ],
        category: [
            { name: "Tất cả thể loại", value: "vi/genres" },
            { name: "Mới cập nhật", value: "vi/new" },
            { name: "Không che (Rò rỉ)", value: "vi/uncensored-leak" },
            { name: "Nữ diễn viên", value: "vi/actresses" },
            { name: "Xem nhiều hôm nay", value: "vi/today-hot" },
            { name: "Phụ đề Anh", value: "vi/english-subtitle" },
            { name: "Phụ đề China", value: "vi/chinese-subtitle" }
        ]
    });
}

// =============================================================================
// URL GENERATION (Fix lỗi thiếu trang)
// =============================================================================

function getUrlList(slugOrPage, filtersJsonOrType, category, country, year) {
    var page = 1;
    var path = "vi/new";
    var sort = "";

    if (typeof filtersJsonOrType === "string" && filtersJsonOrType.indexOf("{") !== -1) {
        try {
            var filters = JSON.parse(filtersJsonOrType);
            page = filters.page || 1;
            sort = filters.sort || "";
        } catch (e) {}
        path = slugOrPage || "vi/new";
    } else if (typeof slugOrPage === "number" || (typeof slugOrPage === "string" && !isNaN(slugOrPage))) {
        page = parseInt(slugOrPage) || 1;
        if (category && category !== "") {
            path = category;
        } else if (filtersJsonOrType && filtersJsonOrType !== "all" && filtersJsonOrType !== "") {
            path = "vi/" + filtersJsonOrType;
        } else {
            path = "vi/new";
        }
    } else if (slugOrPage) {
        path = slugOrPage;
    }

    if (path.indexOf("/") === 0) path = path.substring(1);
    if (path.indexOf("vi/") !== 0) path = "vi/" + path;

    var url = "https://missav.media/" + path;
    
    if (url.indexOf("?") === -1) {
        url += "?page=" + page;
    } else {
        url += "&page=" + page;
    }

    if (sort && sort !== 'new') {
        if (sort === 'hot') {
            url += "&sort=views";
        } else {
            url += "&sort=" + sort;
        }
    }

    return url;
}

function getUrlSearch(keyword, pageOrFilters) {
    var page = 1;
    if (typeof pageOrFilters === "object" && pageOrFilters !== null) {
        page = pageOrFilters.page || 1;
    } else if (typeof pageOrFilters === "number") {
        page = pageOrFilters;
    }
    return "https://missav.media/vi/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    if (!slug) return "https://missav.media/vi";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return "https://missav.media" + slug;
    return "https://missav.media/vi/" + slug;
}

function getUrlCategories() { return "https://missav.media/vi/genres"; }
function getUrlCountries() { return "https://missav.media/vi/actresses"; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS UTILS & CORE
// =============================================================================

var PluginUtils = {
    normalizeHtml: function (html) {
        if (!html) return "";
        return html.replace(/class="([^"]*)"/g, function (fullMatch, classValue) {
            var normalized = classValue.replace(/missav_media-/g, '');
            return 'class="' + normalized + '"';
        });
    },
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    },
    getMeta: function (html, property) {
        var regex = new RegExp('property="' + property + '"\\s+content="([^"]+)"', 'i');
        var match = html.match(regex);
        return match ? match[1] : "";
    }
};

function parseListResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var movies = [];

    // Tách các khối item video dựa trên thẻ chứa link hoặc khung thumbnail
    var parts = html.split('class="group relative"');
    if (parts.length <= 1) parts = html.split('thumbnail group');
    if (parts.length <= 1) parts = html.split('<div class="group">');

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        
        var linkMatch = itemHtml.match(/<a[^>]+href="([^"]+)"/);
        if (!linkMatch) continue;

        var fullUrl = linkMatch[1];
        var slug = fullUrl.replace(/https?:\/\/[^\/]+/, "");
        if (slug.indexOf("/") !== 0) slug = "/" + slug;

        if (slug.indexOf("/genres") !== -1 || slug.indexOf("/actresses") !== -1 || slug.indexOf("/search") !== -1) continue;

        var codeMatch = itemHtml.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";
        if (!code) {
            var partsSlug = slug.split("/");
            code = partsSlug[partsSlug.length - 1];
        }

        // Fix lỗi không hiện poster: Quét mọi trường hợp src, data-src, hoặc srcset
        var thumb = "";
        var imgMatch = itemHtml.match(/<img[^>]+(?:data-src|src)="([^"]+)"/i);
        if (imgMatch) {
            thumb = imgMatch[1];
        } else {
            var srcMatch = itemHtml.match(/src="([^"]+)"/i);
            if (srcMatch) thumb = srcMatch[1];
        }
        
        if (thumb && thumb.indexOf("//") === 0) thumb = "https:" + thumb;
        if (thumb && thumb.indexOf("cover-t.jpg") !== -1) {
            thumb = thumb.replace("/cover-t.jpg", "/cover.jpg");
        }

        var titleMatch = itemHtml.match(/title="([^"]+)"/i) || itemHtml.match(/alt="([^"]+)"/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : code;

        movies.push({
            id: slug,
            title: title,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: "",
            year: 0,
            quality: "HD",
            episode_current: "Full",
            lang: code
        });
    }

    // Fix lỗi thiếu trang: Quét số trang tổng cộng từ phân trang HTML
    var totalPages = 1;
    var pageMatches = html.match(/page=(\d+)/g);
    if (pageMatches) {
        for (var p = 0; p < pageMatches.length; p++) {
            var num = parseInt(pageMatches[p].replace("page=", ""));
            if (num > totalPages) totalPages = num;
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: { currentPage: 1, totalPages: totalPages, totalItems: movies.length, itemsPerPage: 20 }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);
    try {
        var title = PluginUtils.getMeta(html, "og:title") || "MissAV Video";
        var thumb = PluginUtils.getMeta(html, "og:image");
        var desc = PluginUtils.getMeta(html, "og:description");

        // Fix lỗi phát video: Quét chính xác UUID để sinh link m3u8
        var uuid = "";
        var evalMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
        if (evalMatch) {
            var parts = evalMatch[1].split('|');
            var uuidParts = [];
            for (var i = 0; i < parts.length; i++) {
                if (parts[i].match(/^[0-9a-f]{8,12}$/)) uuidParts.push(parts[i]);
            }
            if (uuidParts.length >= 5) {
                uuid = uuidParts[0] + '-' + uuidParts[1] + '-' + uuidParts[2] + '-' + uuidParts[3] + '-' + uuidParts[4];
            }
        }

        if (!uuid) {
            var surritMatch = html.match(/(?:surrit|sixyik|nineyu|fourhoi)\.com\/([0-9a-f-]{36})/i);
            if (surritMatch) uuid = surritMatch[1];
        }

        var streamUrl = uuid ? "https://surrit.com/" + uuid + "/playlist.m3u8" : "";
        var servers = [];
        if (streamUrl) {
            servers.push({
                name: "Stream HD",
                episodes: [{ id: pageUrl || streamUrl, name: "Full", slug: "full" }]
            });
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: desc,
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: 2026,
            rating: 5.0
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html) {
    var uuid = "";
    var surritMatch = html.match(/(?:surrit|sixyik|nineyu|fourhoi)\.com\/([0-9a-f-]{36})/i);
    if (surritMatch) uuid = surritMatch[1];

    var streamUrl = uuid ? "https://surrit.com/" + uuid + "/playlist.m3u8" : "";

    return JSON.stringify({
        url: streamUrl,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://missav123.com/",
            "Origin": "https://missav123.com"
        },
        subtitles: []
    });
}

function parseCategoriesResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var categories = [{ name: "Tất cả thể loại", slug: "vi/genres" }];
    var regex = /<a[^>]+href="([^"]*\/vi\/genres\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    var match;
    var seen = {};

    while ((match = regex.exec(html)) !== null) {
        var fullPath = match[1];
        var name = PluginUtils.cleanText(match[2]);
        var parts = fullPath.split("/genres/");
        var slug = parts.length > 1 ? parts[1] : "";

        if (slug && name && !seen[slug]) {
            seen[slug] = true;
            categories.push({ name: name, slug: "vi/genres/" + slug });
        }
    }
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
