// =============================================================================
// 1. MANIFEST & CONFIGURATION
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "av01_custom_gallery",
        "name": "AV01 Custom Gallery",
        "version": "13.0.0",
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
        { slug: 'latest', title: '🔥 Danh Sách Video Tổng Hợp', type: 'Horizontal', path: '' },
        { slug: 'trending', title: '📈 Thịnh Hành', type: 'Horizontal', path: '' },
        { slug: 'uncensored', title: '💎 Không Che (Uncensored)', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới nhất', slug: 'latest' },
        { name: 'Thịnh hành', slug: 'trending' },
        { name: 'Không che', slug: 'uncensored' }
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

// =============================================================================
// 2. URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return "https://av01.tv/videos/" + (slug || "latest") + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    return "https://av01.tv/search?q=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (!slug) return "https://av01.tv";
    if (slug.indexOf("http") === 0) return slug;
    return "https://av01.tv/" + slug;
}

function getUrlCategories() { return "https://av01.tv/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// 3. PARSERS (Danh sách video độc lập - Mỗi mục một link stream riêng)
// =============================================================================

function parseListResponse(html) {
    // 💡 TẠI ĐÂY: Bạn có thể thay thế các URL .m3u8 khác nhau ở trường "id" cho từng video
    var items = [
        {
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ Video Số 01 - Phân Phối Qua CDN Chính Thức",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - Nội dung 01",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            // Ví dụ: Thay link m3u8 khác vào đây cho video số 2
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "🔥 Video Số 02 - Tuyển Tập Thịnh Hành",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - Nội dung 02",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        },
        {
            // Ví dụ: Thay link m3u8 khác vào đây cho video số 3
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "💎 Video Số 03 - Thể Loại Không Che",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            description: "Chất lượng HD 720p - Nội dung 03",
            year: 2026, quality: "HD", episode_current: "Full", lang: "Vietsub"
        }
    ];

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: items.length,
            itemsPerPage: 10
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// 4. DETAIL & STREAMING (Bóc tách luồng tương ứng theo từng video được bấm)
// =============================================================================

function parseMovieDetail(html, pageUrl) {
    var targetUrl = pageUrl;
    if (!targetUrl || targetUrl.indexOf("http") !== 0 || targetUrl.indexOf(".m3u8") === -1) {
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
    var streamUrl = "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8";
    
    if (pageUrl && pageUrl.indexOf("http") === 0 && pageUrl.indexOf(".m3u8") !== -1) {
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
    return JSON.stringify([
        { name: "Mới nhất", slug: "latest" },
        { name: "Thịnh hành", slug: "trending" }
    ]); 
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
