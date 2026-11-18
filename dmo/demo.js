// =============================================================================
// 1. MANIFEST & CONFIGURATION (AV01 Direct / ES5 Standard)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "av01_direct_vax",
        "name": "AV01 Player",
        "version": "3.5.0",
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
        { 
            slug: 'stream_channels', 
            title: 'Kênh Phát Sóng & Mẫu Test Luồng CDN', 
            type: 'Horizontal', 
            path: '' 
        }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phát trực tiếp CDN', slug: 'direct_stream' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [],
        category: []
    });
}

// =============================================================================
// 2. URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    return "https://av01.tv/";
}

function getUrlSearch(keyword, filtersJson) {
    return "https://av01.tv/";
}

function getUrlDetail(slug) {
    if (!slug) {
        return "https://av01.tv";
    }
    if (slug.indexOf("http") === 0) {
        return slug;
    }
    return "https://av01.tv/" + slug;
}

function getUrlCategories() { 
    return ""; 
}

function getUrlCountries() { 
    return ""; 
}

function getUrlYears() { 
    return ""; 
}

// =============================================================================
// 3. PARSERS (Xử lý danh sách và luồng tương thích VAX Player)
// =============================================================================

function parseListResponse(html) {
    var items = [
        {
            id: "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8",
            title: "▶️ [Mẫu Test 1] - Luồng phát CDN chính thức (720p)",
            posterUrl: "https://static.iw01.xyz/static/av01-icon-export.svg",
            backdropUrl: "",
            description: "Luồng video định dạng HLS m3u8 kèm bảo mật Origin/Referer",
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
// 4. DETAIL & STREAMING (Bơm Headers bảo mật qua ExoPlayer / XhrLoader)
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
        posterUrl: "",
        backdropUrl: "",
        description: "Hệ thống phát trực tiếp qua hạ tầng CDN bảo mật cao.",
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
    
    // Nếu pageUrl không chứa link m3u8, tự động quy về link CDN chuẩn dự phòng
    if (!streamUrl || streamUrl.indexOf(".m3u8") === -1) {
        streamUrl = "https://surrit.mrstcdn.store/aea57715-ad36-4946-a244-e11c8ed391b4/720p/video.m3u8";
    }

    // Trả về JSON chuẩn kèm Headers bắt buộc để Player nhận diện luồng mà không bị lỗi 403
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
    return "[]"; 
}

function parseCountriesResponse(html) { 
    return "[]"; 
}

function parseYearsResponse(html) { 
    return "[]"; 
}
