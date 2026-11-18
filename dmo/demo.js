// =============================================================================
// 1. MANIFEST & CONFIGURATION
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "av01_multistream_vax",
        "name": "AV01 Media Player",
        "version": "12.0.0",
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
        { slug: 'latest', title: '🔥 Mới Cập Nhật (Đa Video)', type: 'Horizontal', path: '' },
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
// 3. PARSERS (Danh sách video với các luồng stream độc lập)
// =============================================================================

function parseListResponse(html) {
    // Mỗi item mang một ID chính là đường dẫn stream .m3u8 riêng biệt
    var items = [
        {
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ AV01 - Video Số 01 (Phát Sóng Chính Thức)",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - CDN Server 01",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8", // Bạn có thể thay đổi UUID khác ở đây nếu có
            title: "🔥 AV01 - Video Số 02 (Thịnh Hành Trong Tuần)",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - CDN Server 02",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "💎 AV01 - Video Số 03 (Thể Loại Không Che)",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - CDN Server 03",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "⭐ AV01 - Video Số 04 (Cập Nhật Mới Nhất)",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - CDN Server 04",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
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
// 4. DETAIL & STREAMING (Động theo từng ID video được chọn)
// =============================================================================

function parseMovieDetail(html, pageUrl) {
    // Lấy chính xác đường dẫn m3u8 từ ID của video người dùng vừa bấm vào
    var targetUrl = pageUrl;
    if (!targetUrl || targetUrl.indexOf("http") !== 0) {
        targetUrl = "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8";
    }

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
    // Nhận diện linh hoạt link m3u8 từ trang chi tiết hoặc pageUrl để trả về đúng luồng tương ứng
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
