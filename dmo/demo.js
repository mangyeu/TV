// =============================================================================
// 1. MANIFEST & CONFIGURATION
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "av01_hybrid_vax",
        "name": "AV01 Media Pro",
        "version": "9.0.0",
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
    return "https://av01.tv/videos/" + (slug || "latest") + "?page=" + page;
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
// 3. KHO DỮ LIỆU ĐA TRANG (Phân chia nhiều video theo từng trang)
// =============================================================================

function getDatabase() {
    return [
        // --- TRANG 1 ---
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ [Trang 1] AV01 - Luồng Phát Sóng Chất Lượng HD 01",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phân phối qua CDN bảo mật cao",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🔥 [Trang 1] AV01 - Tuyển Tập Thịnh Hành Nhất 02",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phân phối qua CDN bảo mật cao",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "💎 [Trang 1] AV01 - Thể Loại Không Che Đặc Biệt 03",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phân phối qua CDN bảo mật cao",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "⭐ [Trang 1] AV01 - Cập Nhật Mới Trong Ngày 04",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phân phối qua CDN bảo mật cao",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },

        // --- TRANG 2 ---
        {
            page: 2,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ [Trang 2] AV01 - Kho Nội Dung Phần II - 01",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Danh mục mở rộng - Trang số 2",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 2,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🔥 [Trang 2] AV01 - Video Xem Nhiều Trong Tuần - 02",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Danh mục mở rộng - Trang số 2",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 2,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "💎 [Trang 2] AV01 - Uncensored Chọn Lọc - 03",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Danh mục mở rộng - Trang số 2",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },

        // --- TRANG 3 ---
        {
            page: 3,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ [Trang 3] AV01 - Lưu Trữ Độc Quyền - 01",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Danh mục mở rộng - Trang số 3",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            page: 3,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🔥 [Trang 3] AV01 - Tổng Hợp Chủ Đề Hot - 02",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Danh mục mở rộng - Trang số 3",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        }
    ];
}

function parseListResponse(html) {
    var db = getDatabase();
    var targetPage = 1;

    // Tự động nhận diện trang từ yêu cầu của app
    if (html && html.indexOf("page=") !== -1) {
        var m = html.match(/page=(\d+)/);
        if (m) {
            targetPage = parseInt(m[1], 10);
        }
    }

    var items = [];
    var i = 0;
    for (i = 0; i < db.length; i++) {
        if (db[i].page === targetPage) {
            items.push(db[i]);
        }
    }

    // Nếu trang yêu cầu chưa có, trả về trang 1 mặc định
    if (items.length === 0) {
        for (i = 0; i < db.length; i++) {
            if (db[i].page === 1) {
                items.push(db[i]);
            }
        }
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: targetPage,
            totalPages: 3,
            totalItems: db.length,
            itemsPerPage: 4
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// 4. DETAIL & STREAMING (Xử lý phát video qua CDN bảo mật)
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
        description: "Phát trực tiếp qua hạ tầng CDN bảo mật.",
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
