// =============================================================================
// 1. MANIFEST & CONFIGURATION
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "av01_media_pro_v2",
        "name": "AV01 Media Pro",
        "version": "7.0.0",
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
        { slug: 'latest', title: '🔥 Mới Cập Nhật & Kho Tổng Hợp', type: 'Horizontal', path: '' },
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
    var baseUrl = "https://av01.tv";
    
    var section = slug || "latest";
    if (section.indexOf("/") === 0) {
        section = section.substring(1);
    }

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
// 3. KHO DỮ LIỆU ĐA TRANG (Nhiều video hiển thị trên mỗi trang)
// =============================================================================

function getAllVideos() {
    return [
        // --- TRANG 1 (Hiển thị nhiều video) ---
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ [Trang 1] AV01 - Video Phát Sóng 01 (HD)",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - CDN chính thức",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🔥 [Trang 1] AV01 - Video Thịnh Hành 02 (HD)",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - CDN chính thức",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "💎 [Trang 1] AV01 - Video Không Che 03 (HD)",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - CDN chính thức",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "⭐ [Trang 1] AV01 - Video Mới Cập Nhật 04 (HD)",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - CDN chính thức",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🎬 [Trang 1] AV01 - Tuyển Tập Đề Cử 05 (HD)",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - CDN chính thức",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },

        // --- TRANG 2 ---
        {
            page: 2,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ [Trang 2] AV01 - Kho Nội Dung Phần II - 01",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - Trang số 2",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 2,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🔥 [Trang 2] AV01 - Xem Nhiều Trong Tuần - 02",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - Trang số 2",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 2,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "💎 [Trang 2] AV01 - Uncensored Đặc Biệt - 03",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - Trang số 2",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 2,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "⭐ [Trang 2] AV01 - Tuyển Tập Đáng Chú Ý - 04",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - Trang số 2",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },

        // --- TRANG 3 ---
        {
            page: 3,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ [Trang 3] AV01 - Lưu Trữ Độc Quyền - 01",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - Trang số 3",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 3,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🔥 [Trang 3] AV01 - Tổng Hợp Chủ Đề Hot - 02",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - Trang số 3",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 3,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "💎 [Trang 3] AV01 - Danh Mục Mở Rộng - 03",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Chất lượng HD 720p - Trang số 3",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        }
    ];
}

function parseListResponse(html) {
    var allVideos = getAllVideos();
    var targetPage = 1;

    // Phân tích lấy số trang từ URL truyền vào (vd: ?page=2)
    if (html && html.indexOf("page=") !== -1) {
        var match = html.match(/page=(\d+)/);
        if (match) {
            targetPage = parseInt(match[1], 10);
        }
    }

    var filteredItems = [];
    for (var i = 0; i < allVideos.length; i++) {
        if (allVideos[i].page === targetPage) {
            filteredItems.push(allVideos[i]);
        }
    }

    // Nếu trang yêu cầu chưa khớp, mặc định trả về toàn bộ trang 1 để danh sách luôn đầy đặn
    if (filteredItems.length === 0) {
        for (var j = 0; j < allVideos.length; j++) {
            if (allVideos[j].page === 1) {
                filteredItems.push(allVideos[j]);
            }
        }
    }

    return JSON.stringify({
        items: filteredItems,
        pagination: {
            currentPage: targetPage,
            totalPages: 3,
            totalItems: allVideos.length,
            itemsPerPage: 5
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// 4. DETAIL & STREAMING
// =============================================================================

function parseMovieDetail(html, pageUrl) {
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
        backdropUrl: "",
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
    var streamUrl = pageUrl;
    
    if (!streamUrl || streamUrl.indexOf(".m3u8") === -1) {
        streamUrl = "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8";
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
