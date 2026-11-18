// =============================================================================
// 1. MANIFEST & CONFIGURATION (Kết nối trực tiếp av01.tv)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "av01_direct_live",
        "name": "AV01 Live Direct",
        "version": "8.0.0",
        "baseUrl": "https://av01.tv",
        "referrer": "https://av01.tv/",
        "iconUrl": "https://static.iw01.xyz/static/av01-icon-export.svg",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "subtitleCat": false
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'latest', title: '🔥 Mới Cập Nhật (Trực Tiếp)', type: 'Horizontal', path: '' },
        { slug: 'trending', title: '📈 Thịnh Hành', type: 'Horizontal', path: '' },
        { slug: 'popular', title: '⭐ Phổ Biến', type: 'Horizontal', path: '' },
        { slug: 'uncensored', title: '💎 Không Che (Uncensored)', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới nhất', slug: 'latest' },
        { name: 'Thịnh hành', slug: 'trending' },
        { name: 'Phổ biến', slug: 'popular' },
        { name: 'Không che', slug: 'uncensored' },
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
            { name: "Tất cả", value: "latest" },
            { name: "Không che", value: "uncensored" }
        ]
    });
}

// =============================================================================
// 2. URL GENERATION (Trỏ trực tiếp đến cấu trúc đường dẫn của av01.tv)
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://av01.tv";
    
    var section = slug || "latest";
    if (section.indexOf("/") === 0) {
        section = section.substring(1);
    }

    // Trỏ thẳng đến các trang danh mục thực tế của web
    return baseUrl + "/videos/" + section + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return "https://av01.tv/search?q=" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(slug) {
    if (!slug) {
        return "https://av01.tv";
    }
    if (slug.indexOf("http") === 0) {
        return slug;
    }
    if (slug.indexOf("/") === 0) {
        return "https://av01.tv" + slug;
    }
    return "https://av01.tv/" + slug;
}

function getUrlCategories() { return "https://av01.tv/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// 3. PARSERS (Cào dữ liệu thực tế trực tiếp từ HTML/JSON trả về của web)
// =============================================================================

function parseListResponse(html) {
    var items = [];
    var currentPage = 1;
    var totalPages = 10;

    if (!html) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 } });
    }

    // Quét toàn bộ các đường dẫn video chi tiết có dạng /video/... trong mã nguồn
    var parts = html.split('href="');
    for (var i = 1; i < parts.length; i++) {
        var chunk = parts[i];
        var quoteIdx = chunk.indexOf('"');
        if (quoteIdx === -1) continue;

        var link = chunk.substring(0, quoteIdx);
        // Lọc các link chứa đường dẫn video thực tế của av01.tv
        if (link.indexOf("/video/") !== -1 || link.indexOf("/vn/video/") !== -1) {
            var slug = link.replace(/https?:\/\/[^\/]+/, "");
            if (slug.indexOf("/") !== 0) {
                slug = "/" + slug;
            }

            // Kiểm tra tránh trùng lặp item trong danh sách
            var isExist = false;
            var m = 0;
            for (m = 0; m < items.length; m++) {
                if (items[m].id === slug) {
                    isExist = true;
                    break;
                }
            }
            if (isExist) continue;

            var blockHtml = chunk.substring(0, 500);
            
            // Trích xuất tiêu đề thực tế từ thẻ title hoặc alt
            var titleMatch = blockHtml.match(/title="([^"]+)"/) || blockHtml.match(/alt="([^"]+)"/);
            var title = titleMatch ? titleMatch[1] : "AV01 Video";
            
            // Làm sạch các ký tự HTML entity cơ bản
            title = title.replace(/&/g, "&").replace(/"/g, '"').replace(/'/g, "'");

            // Trích xuất ảnh thumbnail trực tiếp từ thẻ img
            var imgMatch = blockHtml.match(/src="([^"]+)"/) || blockHtml.match(/data-src="([^"]+)"/);
            var thumb = imgMatch ? imgMatch[1] : "https://static.iw01.xyz/static/av01-icon-export.svg";
            if (thumb && thumb.indexOf("//") === 0) {
                thumb = "https:" + thumb;
            }

            items.push({
                id: slug,
                title: title,
                posterUrl: thumb,
                backdropUrl: thumb,
                description: "Trực tiếp từ AV01.tv",
                year: 2026,
                quality: "HD",
                episode_current: "Full",
                lang: "Vietsub"
            });
        }
    }

    // Quét số trang hiện tại và tổng số trang từ phân trang HTML nếu có
    var pageMatch = html.match(/page=(\d+)/g);
    if (pageMatch && pageMatch.length > 0) {
        var maxPage = 1;
        var p = 0;
        for (p = 0; p < pageMatch.length; p++) {
            var num = parseInt(pageMatch[p].replace("page=", ""), 10);
            if (num > maxPage) maxPage = num;
        }
        totalPages = maxPage;
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: items.length,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// 4. DETAIL & STREAMING (Quét UUID trực tiếp và sinh link CDN chuẩn)
// =============================================================================

function parseMovieDetail(html, pageUrl) {
    var title = "AV01 Video Trực Tiếp";
    var thumb = "https://static.iw01.xyz/static/av01-icon-export.svg";
    var desc = "Phát trực tiếp từ av01.tv";
    
    if (html) {
        var ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i);
        if (ogTitle) title = ogTitle[1];

        var ogImg = html.match(/property="og:image"\s+content="([^"]+)"/i);
        if (ogImg) thumb = ogImg[1];

        var ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i);
        if (ogDesc) desc = ogDesc[1];
    }

    var targetUrl = pageUrl;
    if (!targetUrl) targetUrl = "https://av01.tv";

    var servers = [{
        name: "AV01 Direct CDN",
        episodes: [
            { 
                id: targetUrl, 
                name: "Phát ngay (HD)", 
                slug: "full" 
            }
        ]
    }];

    return JSON.stringify({
        id: targetUrl,
        title: title,
        posterUrl: thumb,
        backdropUrl: thumb,
        description: desc,
        servers: servers,
        quality: "HD",
        lang: "Vietsub",
        year: 2026,
        rating: 0,
        casts: "",
        director: "",
        category: "Direct",
        status: "Online",
        duration: "",
        previewUrl: ""
    });
}

function parseDetailResponse(html, pageUrl) {
    var streamUrl = "";

    // 1. Dò tìm link m3u8 trực tiếp trong mã nguồn trang chi tiết
    if (html) {
        var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
        if (m3u8Match) {
            streamUrl = m3u8Match[1];
        }
    }

    // 2. Nếu chưa có, tự động quét mã UUID trong URL hoặc nội dung trang để tái tạo link CDN chuẩn mới nhất
    if (!streamUrl) {
        var checkStr = (pageUrl || "") + (html || "");
        var uuidMatch = checkStr.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        if (uuidMatch) {
            streamUrl = "https://surrit.mrstcdn.store/" + uuidMatch[0] + "/720p/video.m3u8";
        }
    }

    // Fallback mặc định nếu không quét được
    if (!streamUrl) {
        streamUrl = "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8";
    }

    // Trả về JSON chuẩn kèm toàn bộ Headers bảo mật để ExoPlayer không bị lỗi 403
    var responseData = {
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
    };

    return JSON.stringify(responseData);
}

function parseEmbedResponse(html, url) {
    return parseDetailResponse(html, url);
}

function parseCategoriesResponse(html) { 
    return JSON.stringify([
        { name: "Mới nhất", slug: "latest" },
        { name: "Thịnh hành", slug: "trending" },
        { name: "Phổ biến", slug: "popular" },
        { name: "Không che", slug: "uncensored" }
    ]); 
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
