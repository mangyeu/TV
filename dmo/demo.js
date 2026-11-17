// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "4.0.3",
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
// URL GENERATION
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
    var movies = [];
    var seenUrls = {};

    var cardRegex = /<a[^>]+href="([^"]+\/([a-zA-Z0-9\-]+))"[^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = cardRegex.exec(html)) !== null) {
        var fullUrl = match[1];
        var innerHtml = match[3];

        if (fullUrl.indexOf("/genres") !== -1 || fullUrl.indexOf("/actresses") !== -1 || fullUrl.indexOf("/search") !== -1 || fullUrl.indexOf("/login") !== -1 || fullUrl.indexOf("/tag") !== -1) {
            continue;
        }

        if (fullUrl.indexOf("missav.media") === -1 && fullUrl.indexOf("/vi/") === -1) continue;

        var slug = fullUrl.replace(/https?:\/\/[^\/]+/, "");
        if (slug.indexOf("/") !== 0) slug = "/" + slug;

        if (seenUrls[slug]) continue;
        seenUrls[slug] = true;

        // Quét link ảnh từ data-src hoặc src (Hỗ trợ cấu trúc bốn miền CDN như fourhoi.mrstcdn.store)
        var thumb = "";
        var imgMatches = innerHtml.match(/<img[^>]+(?:data-src|src|srcset)="([^"]+)"/gi);
        if (imgMatches) {
            for (var im = 0; im < imgMatches.length; im++) {
                var srcMatch = imgMatches[im].match(/(?:data-src|src|srcset)="([^"]+)"/i);
                if (srcMatch && srcMatch[1]) {
                    var candidate = srcMatch[1];
                    if (candidate.indexOf("http") === 0 || candidate.indexOf("//") === 0) {
                        thumb = candidate;
                        break;
                    }
                }
            }
        }

        if (!thumb) {
            var rawLinkMatch = innerHtml.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/i);
            if (rawLinkMatch) thumb = rawLinkMatch[0];
        }

        if (thumb && thumb.indexOf("//") === 0) thumb = "https:" + thumb;
        if (thumb && thumb.indexOf("cover-t.jpg") !== -1) {
            thumb = thumb.replace("/cover-t.jpg", "/cover-n.jpg");
        }
        if (!thumb || thumb.indexOf("svg") !== -1 || thumb.indexOf("data:image") !== -1) {
            // Fallback tự dựng link poster từ mã code phim dựa theo chuẩn fourhoi CDN mới
            var partsSlug = slug.split("/");
            var dvdCode = partsSlug[partsSlug.length - 1];
            if (dvdCode) {
                thumb = "https://fourhoi.mrstcdn.store/" + dvdCode + "/cover-n.jpg";
            }
        }

        var titleMatch = innerHtml.match(/title="([^"]+)"/i) || innerHtml.match(/alt="([^"]+)"/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";
        
        var partsSlug = slug.split("/");
        var code = partsSlug[partsSlug.length - 1].toUpperCase();
        if (!title) title = code;

        if (slug.length > 5 && code) {
            movies.push({
                id: slug,
                title: title,
                posterUrl: thumb,
                image: thumb,
                thumbnail: thumb,
                backdropUrl: thumb,
                description: "",
                year: 0,
                quality: "HD",
                episode_current: "Full",
                lang: code
            });
        }
    }

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
    try {
        var title = PluginUtils.getMeta(html, "og:title") || "MissAV Video";
        var thumb = PluginUtils.getMeta(html, "og:image");
        if (thumb && thumb.indexOf("//") === 0) thumb = "https:" + thumb;
        if (!thumb && pageUrl) {
            var parts = pageUrl.split("/");
            var dvd = parts[parts.length - 1];
            if (dvd) thumb = "https://fourhoi.mrstcdn.store/" + dvd + "/cover-n.jpg";
        }

        var desc = PluginUtils.getMeta(html, "og:description");
        var streamUrl = extractStreamUrl(html);
        var servers = [];
        
        servers.push({
            name: "Stream HD",
            episodes: [{ 
                id: pageUrl || streamUrl, 
                name: "Full", 
                slug: "full" 
            }]
        });

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: thumb,
            image: thumb,
            thumbnail: thumb,
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
function parseDetailResponse(html, pageUrl) {
    // Trả về thẳng pageUrl dưới dạng WebView fallback để app bật trình duyệt nhúng bên trong
    return JSON.stringify({
        url: pageUrl,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://missav.media/"
        },
        subtitles: []
    });
}


function extractStreamUrl(html) {
    if (!html) return "";
    var directM3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8(?:\?[^"'\s<>]*)?/i);
    if (directM3u8) {
        return directM3u8[0].replace(/\\\//g, "/");
    }
    var uuidMatch = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidMatch) {
        return "https://fourhoi.mrstcdn.store/" + uuidMatch[0] + "/1080p/video.m3u8";
    }
    return "";
}

// Bóc tách link stream tích hợp hệ thống CDN mới (fourhoi / mrstcdn / surrit)
function extractStreamUrl(html) {
    if (!html) return "";
    
    // 1. Quét tìm trực tiếp file .m3u8 hoàn chỉnh
    var directM3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8(?:\?[^"'\s<>]*)?/i);
    if (directM3u8) {
        return directM3u8[0].replace(/\\\//g, "/");
    }

    // 2. Quét cấu trúc link chứa UUID đi kèm tên miền CDN mới (ví dụ: fourhoi.mrstcdn.store)
    var cdnMatch = html.match(/(?:fourhoi|surrit|sixyik|nineyu|mrstcdn|apidata|m3u8)\.[a-z]+\/[^"'\s<>]+([0-9a-f-]{36})[^"'\s<>]*playlist\.m3u8/i);
    if (cdnMatch) {
        var fullStreamMatch = html.match(new RegExp("https?://[^\"'\\s<>]+/" + cdnMatch[1] + "/[^\"'\\s<>]+\\.m3u8", "i"));
        if (fullStreamMatch) return fullStreamMatch[0].replace(/\\\//g, "/");
    }

    // 3. Quét UUID và fallback dựng lại link stream chuẩn qua surrit / mrstcdn
    var uuidMatch = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuidMatch) {
        return "https://fourhoi.mrstcdn.store/" + uuidMatch[0] + "/1080p/video.m3u8";
    }

    return "";
}

function parseCategoriesResponse(html) {
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
    
