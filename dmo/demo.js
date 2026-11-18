// =============================================================================
// AV01.tv CONFIGURATION & MANIFEST (Cập nhật chuẩn theo View Source)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "av01_tv",
        "name": "AV01.tv",
        "version": "2.0.0",
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
        { slug: 'popular', title: 'Xem Nhiều', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới nhất', slug: 'latest' },
        { name: 'Thịnh hành', slug: 'trending' },
        { name: 'Phổ biến', slug: 'popular' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'latest' },
            { name: 'Phổ biến', value: 'popular' }
        ],
        category: [
            { name: "Tất cả", value: "latest" }
        ]
    });
}

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    // Trỏ trực tiếp tới domain chính xác lấy từ view source
    return "https://av01.tv/videos/" + (slug || "latest") + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return "https://av01.tv/search?q=" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return "https://av01.tv" + slug;
    return "https://av01.tv/" + slug;
}

function getUrlCategories() { return "https://av01.tv/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

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
    },
    extractPreviewUrl: function (itemHtml) {
        var previewMatch = itemHtml.match(/<video[^>]+data-src="([^"]+)"/) || itemHtml.match(/<source[^>]+src="([^"]+)"/);
        var url = previewMatch ? previewMatch[1] : "";
        if (url && url.indexOf('//') === 0) {
            return "https:" + url;
        }
        return url;
    }
};

// =============================================================================
// 4. PARSERS (LIST & SEARCH)
// =============================================================================

function parseListResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var movies = [];

    // Tách các khối item video trên trang av01.media
    var parts = html.split('class="');
    
    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        
        // Chỉ xử lý các khối chứa link video chi tiết
        var linkMatch = itemHtml.match(/href="([^"]*\/vn\/video\/[^"]+)"/) || itemHtml.match(/href="([^"]*\/video\/[^"]+)"/);
        if (!linkMatch) continue;

        var fullUrl = linkMatch[1];
        var slug = fullUrl.replace(/https?:\/\/[^\/]+/, "");
        if (slug.indexOf("/") !== 0) slug = "/" + slug;

        // Tránh trùng lặp ID trong danh sách
        var isExist = false;
        for (var m = 0; m < movies.length; m++) {
            if (movies[m].id === slug) { isExist = true; break; }
        }
        if (isExist) continue;

        // Lấy tiêu đề phim từ thẻ alt của ảnh hoặc title bên trong
        var titleCandidates = [];
        var imgMatch = itemHtml.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
        if (imgMatch) {
            titleCandidates.push(PluginUtils.cleanText(imgMatch[1]));
        }

        var textTitleMatch = itemHtml.match(/<a[^>]+title="([^"]+)"/i);
        if (textTitleMatch) {
            titleCandidates.push(PluginUtils.cleanText(textTitleMatch[1]));
        }

        var cleanTitle = titleCandidates.length > 0 ? titleCandidates[0] : "Video AV";

        // Lấy hình ảnh thumbnail
        var thumbMatch = itemHtml.match(/<img[^>]+(?:data-src|src)="([^"]+)"/i);
        var thumb = thumbMatch ? thumbMatch[1] : "";
        if (thumb && thumb.indexOf('//') === 0) thumb = "https:" + thumb;

        // Lấy thời lượng hoặc nhãn chất lượng nếu có
        var durationMatch = itemHtml.match(/<span[^>]*>\s*(\d+:\d+)\s*<\/span>/);
        var duration = durationMatch ? durationMatch[1] : "";

        var previewUrl = PluginUtils.extractPreviewUrl(itemHtml);

        movies.push({
            id: slug,
            title: cleanTitle,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: duration,
            year: 0,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub",
            previewUrl: previewUrl
        });
    }

    // Xử lý phân trang
    var totalPages = 1;
    var currentPage = 1;

    var currentMatch = html.match(/class="[^"]*active[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i) ||
        html.match(/class="[^"]*current[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i);
    if (currentMatch) {
        currentPage = parseInt(currentMatch[1]);
    }

    var allPageNums = html.match(/page=(\d+)/g);
    if (allPageNums) {
        for (var j = 0; j < allPageNums.length; j++) {
            var p = parseInt(allPageNums[j].match(/\d+/)[0]);
            if (p > totalPages) totalPages = p;
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages || 1,
            totalItems: movies.length,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// 5. PARSERS (DETAIL & STREAMING CHO AV01)
// =============================================================================

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);
    try {
        var title = PluginUtils.getMeta(html, "og:title") || "Chi tiết video";
        var thumb = PluginUtils.getMeta(html, "og:image");
        var desc = PluginUtils.getMeta(html, "og:description");

        var streamUrl = "";
        
        // Quét UUID hoặc link m3u8 trực tiếp từ source của av01.media
        var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
        if (m3u8Match) {
            streamUrl = m3u8Match[1];
        } else {
            // Quét mã định danh hoặc đường dẫn CDN video dự phòng
            var uuidMatch = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
                streamUrl = "https://surrit.mrstcdn.store/" + uuidMatch[0] + "/720p/video.m3u8";
            }
        }

        var servers = [];
        if (streamUrl) {
            var episodeId = pageUrl || streamUrl;
            servers.push({
                name: "Stream AV01",
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

    // 1. Quét tìm kiếm định dạng m3u8 trực tiếp trong mã nguồn trang chi tiết
    var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (m3u8Match) {
        streamUrl = m3u8Match[1];
    } else {
        // 2. Quét UUID và tái tạo link CDN dòng tệp video tương thích
        var uuidMatch = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        if (uuidMatch) {
            streamUrl = "https://surrit.mrstcdn.store/" + uuidMatch[0] + "/720p/video.m3u8";
        }
    }

    if (!streamUrl && pageUrl && pageUrl.indexOf(".m3u8") !== -1) {
        streamUrl = pageUrl;
    }

    return JSON.stringify({
        url: streamUrl,
        streamUrl: streamUrl,
        file: streamUrl,
        link: streamUrl,
        isEmbed: false,
        mimeType: "application/x-mpegURL",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Referer": "https://www.av01.media/",
            "Origin": "https://www.av01.media",
            "Accept": "*/*"
        },
        subtitles: []
    });
}

function parseEmbedResponse(html, url) {
    return parseDetailResponse(html, url);
}

function parseCategoriesResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var categories = [];
    categories.push({ name: "Tất cả video", slug: "vn/videos/latest" });
    categories.push({ name: "Không che", slug: "vn/videos/uncensored" });
    categories.push({ name: "Thịnh hành", slug: "vn/videos/trending" });
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
