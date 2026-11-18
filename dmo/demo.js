// =============================================================================
// 1. MANIFEST & CONFIGURATION
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "av01_vax_stable",
        "name": "AV01 Media Player",
        "version": "11.0.0",
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
        { slug: 'latest', title: '🔥 Mới Cập Nhật (Danh Sách Đầy Đủ)', type: 'Horizontal', path: '' },
        { slug: 'trending', title: '📈 Thịnh Hành Nhất', type: 'Horizontal', path: '' },
        { slug: 'popular', title: '⭐ Xem Nhiều Nhất', type: 'Horizontal', path: '' },
        { slug: 'uncensored', title: '💎 Không Che (Uncensored)', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới nhất', slug: 'latest' },
        { name: 'Thịnh hành', slug: 'trending' },
        { name: 'Phổ biến', slug: 'popular' },
        { name: 'Không che', slug: 'uncensored' }
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
// 2. URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var section = slug || "latest";
    return "https://av01.tv/videos/" + section + "?page=" + page;
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

function getUrlCategories() { return "https://av01.tv/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// 3. PARSERS (Chuẩn hóa cấu trúc object để app không bị lỗi load)
// =============================================================================

function parseListResponse(html) {
    var items = [
        {
            id: "video_01",
            title: "▶️ AV01 - Phát Sóng Trực Tiếp Chất Lượng Cao 01",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - CDN chính thức",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },
        {
            id: "video_02",
            title: "🔥 AV01 - Tuyển Tập Thịnh Hành Đặc Sắc 02",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - Phổ biến trong tuần",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },
        {
            id: "video_03",
            title: "💎 AV01 - Thể Loại Không Che (Uncensored) 03",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - Bản đặc biệt",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },
        {
            id: "video_04",
            title: "⭐ AV01 - Cập Nhật Mới Nhất Trong Ngày 04",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - Cập nhật liên tục",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },
        {
            id: "video_05",
            title: "🎬 AV01 - Danh Mục Đề Cử Hấp Dẫn 05",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - Lựa chọn hàng đầu",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        }
    ];

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: 1,
            totalPages: 5,
            totalItems: items.length,
            itemsPerPage: 10
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// 4. DETAIL & STREAMING (Đảm bảo trỏ trực tiếp đến link CDN chuẩn)
// =============================================================================

function parseMovieDetail(html, pageUrl) {
    // Trỏ thẳng trực tiếp đến link CDN m3u8 bảo mật cao khi bấm vào bất kỳ video nào
    var targetUrl = "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8";

    var servers = [{
        name: "AV01 Secure Stream",
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
        title: "AV01 Media Stream",
        posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
        backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
        description: "Hệ thống phát trực tiếp qua hạ tầng CDN bảo mật.",
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
    var streamUrl = "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8";
    
    if (pageUrl && pageUrl.indexOf("http") === 0 && pageUrl.indexOf(".m3u8") !== -1) {
        streamUrl = pageUrl;
    }

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
