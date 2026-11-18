// =============================================================================
// 1. CONFIGURATION & MANIFEST (AV01.tv - Chuẩn ES5)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "av01_tv",
        "name": "AV01.tv",
        "version": "2.1.0",
        "baseUrl": "https://av01.tv",
        "referrer": "https://av01.tv/",
        "iconUrl": "https://static.iw01.xyz/static/av01-icon-export.svg",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "subtitleCat": true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'latest', title: 'Mới Cập Nhật', type: 'Horizontal', path: '' },
        { slug: 'trending', title: 'Thịnh Hành', type: 'Horizontal', path: '' },
        { slug: 'popular', title: 'Xem Nhiều', type: 'Horizontal', path: '' },
        { slug: 'uncensored', title: 'Không Che', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới nhất', slug: 'latest' },
        { name: 'Thịnh hành', slug: 'trending' },
        { name: 'Phổ biến', slug: 'popular' },
        { name: 'Không che', slug: 'uncensored' },
        { name: 'Diễn viên', slug: 'actresses' },
        { name: 'Thể loại', slug: 'genres' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'latest' },
            { name: 'Phổ biến', value: 'popular' },
            { name: 'Thịnh hành', value: 'trending' }
        ],
        category: [
            { name: "Tất cả video", value: "latest" },
            { name: "Không che", value: "uncensored" },
            { name: "Thịnh hành", value: "trending" }
        ]
    });
}

// =============================================================================
// 2. URL GENERATION (Sử dụng nối chuỗi chuẩn ES5)
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://av01.tv";

    var path = slug || "latest";
    if (path.indexOf("/") === 0) {
        path = path.substring(1);
    }

    return baseUrl + "/videos/" + path + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return "https://av01.tv/search?q=" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(slug) {
    if (!slug) return "https://av01.tv";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return "https://av01.tv" + slug;
    return "https://av01.tv/" + slug;
}

function getUrlCategories() { 
    return "https://av01.tv/genres"; 
}

function getUrlCountries() { 
    return ""; 
}

function getUrlYears() { 
    return ""; 
}

// =============================================================================
// 3. UTILS & HELPERS
// =============================================================================

var PluginUtils = {
    normalizeHtml: function (html) {
        if (!html) return "";
        return html;
    },
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    },
    getMeta: function (html, property) {
        var regex = new RegExp('property="' + property + '"\\s+content="([^"]+)"', 'i');
        var match = html.match(regex);
        return match ? match[1] : "";
    }
};

// =============================================================================
// 4. PARSERS (LIST & SEARCH)
// =============================================================================

function parseListResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var movies = [];

    // Quét các liên kết video trong HTML (hỗ trợ cả SPA render thô hoặc cấu trúc thẻ a)
    var parts = html.split('href="');
    for (var i = 1; i < parts.length; i++) {
        var chunk = parts[i];
        var quoteIdx = chunk.indexOf('"');
        if (quoteIdx === -1) continue;

        var link = chunk.substring(0, quoteIdx);
        // Lọc các đường dẫn video chi tiết
        if (link.indexOf("/video/") !== -1 || link.indexOf("/vn/video/") !== -1) {
            var slug = link.replace(/https?:\/\/[^\/]+/, "");
            if (slug.indexOf("/") !== 0) {
                slug = "/" + slug;
            }

            // Tránh trùng lặp
            var isExist = false;
            for (var m = 0; m < movies.length; m++) {
                if (movies[m].id === slug) {
                    isExist = true;
                    break;
                }
            }
            if (isExist) continue;

            // Tìm tiêu đề và ảnh thumbnail xung quanh khối HTML đó
            var blockHtml = chunk.substring(0, 500);
            var titleMatch = blockHtml.match(/title="([^"]+)"/) || blockHtml.match(/alt="([^"]+)"/);
            var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "Video AV01";

            var imgMatch = blockHtml.match(/src="([^"]+)"/) || blockHtml.match(/data-src="([^"]+)"/);
            var thumb = imgMatch ? imgMatch[1] : "";
            if (thumb && thumb.indexOf("//") === 0) {
                thumb = "https:" + thumb;
            }

            movies.push({
                id: slug,
                title: title,
                posterUrl: thumb,
                backdropUrl: thumb,
                description: "",
                year: 2026,
                quality: "HD",
                episode_current: "Full",
                lang: "Vietsub"
            });
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: 1,
            totalPages: 10,
            totalItems: movies.length,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// 5. PARSERS (DETAIL & STREAMING - Tương thích chuẩn CDN mới)
// =============================================================================

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);
    try {
        var title = PluginUtils.getMeta(html, "og:title") || "Chi tiết video";
        var thumb = PluginUtils.getMeta(html, "og:image");
        var desc = PluginUtils.getMeta(html, "og:description");

        var streamUrl = "";

        // 1. Quét tìm trực tiếp link m3u8 trong mã nguồn
        var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
        if (m3u8Match) {
            streamUrl = m3u8Match[1];
        } else {
            // 2. Quét UUID và dựng link CDN dòng 720p mới nhất (.mrstcdn.store)
            var uuidMatch = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
                streamUrl = "https://surrit.mrstcdn.store/" + uuidMatch[0] + "/720p/video.m3u8";
            }
        }

        var servers = [];
        if (streamUrl) {
            var episodeId = pageUrl || streamUrl;
            servers.push({
                name: "Stream CDN",
                episodes: [{ id: episodeId, name: "Full", slug: "full" }]
            });
        }

        return JSON.stringify({
            id: pageUrl || "",
            title: PluginUtils.cleanText(title),
            posterUrl: thumb,
            backdropUrl: thumb,
            description: PluginUtils.cleanText(desc),
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: 2026,
            rating: 0,
            casts: "",
            director: "",
            category: "AV",
            status: "Full",
            duration: "",
            previewUrl: ""
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html, pageUrl) {
    var streamUrl = "";

    // 1. Quét m3u8
    var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (m3u8Match) {
        streamUrl = m3u8Match[1];
    } else {
        // 2. Quét UUID dựng chuẩn CDN mới
        var uuidMatch = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        if (uuidMatch) {
            streamUrl = "https://surrit.mrstcdn.store/" + uuidMatch[0] + "/720p/video.m3u8";
        }
    }

    if (!streamUrl && pageUrl && pageUrl.indexOf(".m3u8") !== -1) {
        streamUrl = pageUrl;
    }

    // Trả về định dạng JSON bao gồm headers bảo mật đầy đủ cho App
    return JSON.stringify({
        url: streamUrl,
        streamUrl: streamUrl,
        file: streamUrl,
        link: streamUrl,
        isEmbed: false,
        mimeType: "application/x-mpegURL",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Referer": "https://av01.tv/",
            "Origin": "https://av01.tv",
            "Accept": "*/*"
        },
        subtitles: []
    });
}

function parseEmbedResponse(html, url) {
    return parseDetailResponse(html, url);
}

function parseCategoriesResponse(html) {
    var categories = [
        { name: "Tất cả video", slug: "latest" },
        { name: "Không che", slug: "uncensored" },
        { name: "Thịnh hành", slug: "trending" },
        { name: "Phổ biến", slug: "popular" }
    ];
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { 
    return "[]"; 
}

function parseYearsResponse(html) { 
    return "[]"; 
}
