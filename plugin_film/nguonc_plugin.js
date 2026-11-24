// =============================================================================
// VAAPP Plugin - NguonC (phim.nguonc.com)
// API-based plugin for movie streaming
// =============================================================================

var BASE_URL = "https://phim.nguonc.com";

// =============================================================================
// NHÓM 1: CẤU HÌNH
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguonc_plugin",
        "name": "NguonC Phim",
        "version": "1.0.0",
        "baseUrl": BASE_URL,
        "iconUrl": "https://phim.nguonc.com/favicon.ico",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Horizontal', path: '' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: '' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Hành Động', slug: 'hanh-dong' },
        { name: 'Kinh Dị', slug: 'kinh-di' },
        { name: 'Hài Hước', slug: 'phim-hai' },
        { name: 'Tình Cảm', slug: 'tinh-cam' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

// =============================================================================
// NHÓM 2: SINH URL
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    
    // Nếu slug là phim-moi-cap-nhat thì dùng endpoint riêng
    if (slug === 'phim-moi-cap-nhat') {
        return BASE_URL + "/api/films/phim-moi-cap-nhat?page=" + page;
    }
    // Ngược lại dùng endpoint danh sách (phim-le, phim-bo, hoat-hinh...)
    return BASE_URL + "/api/films/danh-sach/" + slug + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var page = JSON.parse(filtersJson || "{}").page || 1;
    return BASE_URL + "/api/films/search?keyword=" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(slug) {
    // Slug ở đây là slug phim hoặc ID tập phim (nếu là link trực tiếp thì không gọi hàm này)
    return BASE_URL + "/api/film/" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

/**
 * Helper: Chuyển đổi item từ API sang định dạng VAAPP
 */
function mapMovieItem(item) {
    return {
        id: item.slug,
        title: item.name,
        posterUrl: item.poster_url || item.thumb_url || "",
        backdropUrl: item.thumb_url || "",
        year: item.year || 0,
        quality: item.quality || "HD",
        description: item.description || "",
        status: item.current_episode || ""
    };
}

/**
 * Parse danh sách phim (JSON API)
 */
function parseListResponse(jsonText) {
    try {
        var data = JSON.parse(jsonText);
        var items = [];
        
        // Cấu trúc API: { items: [...], pagination: { totalItems, totalItemsPerPage, currentPage, totalPages } }
        var rawItems = data.items || (data.data && data.data.items) || [];
        
        for (var i = 0; i < rawItems.length; i++) {
            items.push(mapMovieItem(rawItems[i]));
        }
        
        var pagination = data.pagination || {};
        
        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: pagination.currentPage || 1,
                totalPages: pagination.totalPages || 1
            }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(jsonText) {
    return parseListResponse(jsonText);
}

/**
 * Parse chi tiết phim (JSON API)
 * Trả về servers + episodes.
 * Mỗi episode.id: ưu tiên link .m3u8/.mp4, nếu không có thì để nguyên slug/URL để App gọi getUrlDetail/parseDetailResponse
 */
function parseMovieDetail(jsonText) {
    try {
        var data = JSON.parse(jsonText);
        var movie = data.movie || data;
        
        var servers = [];
        var rawEpisodes = movie.episodes || [];
        
        // Xử lý episodes: có thể là mảng các server
        if (rawEpisodes.length > 0) {
            for (var s = 0; s < rawEpisodes.length; s++) {
                var serverData = rawEpisodes[s];
                var serverName = serverData.server_name || ("Server " + (s + 1));
                var episodes = [];
                
                // Mỗi server có danh sách items (tập phim)
                var listEpisodes = serverData.items || serverData.list || [];
                for (var e = 0; e < listEpisodes.length; e++) {
                    var ep = listEpisodes[e];
                    var epId = ep.link_m3u8 || ep.link_embed || ep.slug || ep.id || "";
                    var epName = ep.name || ("Tập " + (e + 1));
                    
                    episodes.push({
                        id: epId,
                        name: epName,
                        slug: ep.slug || ""
                    });
                }
                
                if (episodes.length > 0) {
                    servers.push({ name: serverName, episodes: episodes });
                }
            }
        }
        
        // Trích xuất metadata bổ sung từ category
        var categoryName = "";
        var countryName = "";
        if (movie.category) {
            var cats = movie.category;
            for (var key in cats) {
                if (cats.hasOwnProperty(key)) {
                    var group = cats[key];
                    if (group.group && group.group.name === "Thể loại" && group.list && group.list.length > 0) {
                        var catNames = [];
                        for (var c = 0; c < group.list.length; c++) {
                            catNames.push(group.list[c].name);
                        }
                        categoryName = catNames.join(", ");
                    }
                    if (group.group && group.group.name === "Quốc gia" && group.list && group.list.length > 0) {
                        countryName = group.list[0].name;
                    }
                }
            }
        }
        
        return JSON.stringify({
            id: movie.slug,
            title: movie.name,
            posterUrl: movie.poster_url || "",
            backdropUrl: movie.thumb_url || "",
            description: movie.description || "",
            servers: servers,
            quality: movie.quality || "HD",
            year: movie.year || 0,
            rating: 0,
            status: movie.current_episode || "",
            duration: movie.time || "",
            casts: movie.casts || "",
            director: movie.director || "",
            category: categoryName,
            country: countryName
        });
    } catch (e) {
        return JSON.stringify({
            id: "", title: "", posterUrl: "", servers: [],
            description: "", quality: "", year: 0, rating: 0,
            status: "", duration: "", casts: "", director: "", category: ""
        });
    }
}

/**
 * Parse link phát cuối cùng.
 * Trường hợp đơn giản: episode.id đã là link .m3u8/.mp4 → App phát trực tiếp, không gọi hàm này.
 * Nếu App gọi hàm này, nghĩa là cần resolve thêm từ một slug/URL.
 * Với NguonC, nếu episode.id là link embed, trả về isEmbed: true để WebView xử lý.
 */
function parseDetailResponse(jsonText) {
    try {
        // Thử parse JSON xem có phải API trả về không
        var data = JSON.parse(jsonText);
        
        // Nếu là response chi tiết phim, thử lấy link từ episode đầu tiên
        var movie = data.movie || data;
        var episodes = movie.episodes || [];
        
        for (var s = 0; s < episodes.length; s++) {
            var items = episodes[s].items || episodes[s].list || [];
            for (var e = 0; e < items.length; e++) {
                var ep = items[e];
                var url = ep.link_m3u8 || ep.link_embed || "";
                if (url) {
                    // Nếu là link m3u8/mp4 trực tiếp
                    if (url.indexOf('.m3u8') !== -1 || url.indexOf('.mp4') !== -1) {
                        return JSON.stringify({
                            url: url,
                            headers: { "Referer": BASE_URL + "/" },
                            isEmbed: false,
                            mimeType: url.indexOf('.m3u8') !== -1 ? "application/x-mpegURL" : "video/mp4"
                        });
                    }
                    // Link embed → WebView
                    return JSON.stringify({
                        url: url,
                        headers: { "Referer": BASE_URL + "/" },
                        isEmbed: true
                    });
                }
            }
        }
        
        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) {
        // Không phải JSON → thử regex tìm m3u8 trong HTML
        var match = jsonText.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
        if (match) {
            return JSON.stringify({
                url: match[0],
                headers: { "Referer": BASE_URL + "/" },
                isEmbed: false,
                mimeType: "application/x-mpegURL"
            });
        }
        return JSON.stringify({ url: "", isEmbed: false });
    }
}

/**
 * Xử lý embed nhiều bước (nếu cần).
 * Với NguonC, thường link embed là iframe từ bên thứ ba, App có thể phát trực tiếp bằng WebView.
 * Hàm này chủ yếu để dự phòng trường hợp cần fetch thêm.
 */
function parseEmbedResponse(html, sourceUrl) {
    // Thử tìm m3u8 trong HTML embed
    var match = html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
    if (match) {
        return JSON.stringify({
            url: match[0],
            headers: { "Referer": sourceUrl },
            isEmbed: false,
            mimeType: "application/x-mpegURL"
        });
    }
    
    // Thử tìm iframe src
    var iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/);
    if (iframeMatch) {
        return JSON.stringify({
            url: iframeMatch[1],
            isEmbed: true
        });
    }
    
    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
