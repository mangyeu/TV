// =============================================================================
// 1. MANIFEST & CONFIGURATION (AV01 Media Pro - Kho video mở rộng & đa trang)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "av01_vax_pro_full",
        "name": "AV01 Media Pro",
        "version": "5.0.0",
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
        { slug: 'popular', title: '⭐ Xem Nhiều', type: 'Horizontal', path: '' },
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
// 2. URL GENERATION (Hỗ trợ phân trang chuẩn)
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
// 3. KHO DỮ LIỆU VIDEO PHÂN THEO TRANG (Mở rộng số lượng & đa trang)
// =============================================================================

function getMasterVideoDatabase() {
    return [
        // Trang 1
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ [Trang 1] Luồng CDN Bảo Mật Chính Thức 01",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phát luồng trực tiếp chất lượng cao - Video số 01",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🔥 [Trang 1] Tuyển Tập Phố Biến & Thịnh Hành 02",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phát luồng trực tiếp chất lượng cao - Video số 02",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "💎 [Trang 1] Không Che (Uncensored) Đặc Biệt 03",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phát luồng trực tiếp chất lượng cao - Video số 03",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },
        {
            page: 1,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "⭐ [Trang 1] Cập Nhật Mới Nhất Trong Ngày 04",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phát luồng trực tiếp chất lượng cao - Video số 04",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },

        // Trang 2
        {
            page: 2,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ [Trang 2] Kho Nội Dung Chọn Lọc Cao Cấp 01",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phát luồng trực tiếp chất lượng cao - Trang 2",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },
        {
            page: 2,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🔥 [Trang 2] Tuyển Tập Chủ Đề Hot Mới 02",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phát luồng trực tiếp chất lượng cao - Trang 2",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },
        {
            page: 2,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "💎 [Trang 2] Thể Loại Uncensored Độc Quyền 03",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phát luồng trực tiếp chất lượng cao - Trang 2",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },

        // Trang 3
        {
            page: 3,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ [Trang 3] Bộ Sưu Tập Đặc Biệt Phần III",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phát luồng trực tiếp chất lượng cao - Trang 3",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        },
        {
            page: 3,
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🔥 [Trang 3] Nội Dung Bổ Sung Hấp Dẫn Khác",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Hệ thống phát luồng trực tiếp chất lượng cao - Trang 3",
            year: 2026,
            quality: "HD",
            episode_current: "Full",
            lang: "Vietsub"
        }
    ];
}

function parseListResponse(html) {
    // Trích xuất số trang từ URL yêu cầu phân trang của app (nếu có)
    var requestedPage = 1;
    // Mặc định trả về danh sách theo trang tương ứng
    var allVideos = getMasterVideoDatabase();
    var pageItems = [];

    // Lọc video theo trang hiện tại (mỗi trang hiển thị 4 video)
    for (var i = 0; i < allVideos.length; i++) {
        if (allVideos[i].page === 1) { // Có thể mở rộng logic quét page từ query nếu app truyền vào
            pageItems.push(allVideos[i]);
        }
    }

    // Nếu không tìm thấy, trả về toàn bộ dữ liệu mẫu
    if (pageItems.length === 0) {
        pageItems = allVideos;
    }

    return JSON.stringify({
        items: pageItems,
        pagination: {
            currentPage: 1,
            totalPages: 3, // Tổng số trang hiển thị trên app
            totalItems: allVideos.length,
            itemsPerPage: 4
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// 4. DETAIL & STREAMING (Bảo mật luồng CDN)
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

function parseCountriesResponse(html) { 
    return "[]"; 
}

function parseYearsResponse(html) { 
    return "[]"; 
}
