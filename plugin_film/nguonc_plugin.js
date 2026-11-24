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
        "version": "1.0.1",
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
    if (slug === 'phim-moi-cap-nhat') {
        return BASE_URL + "/api/films/phim-moi-cap-nhat?page=" + page;
    }
    return BASE_URL + "/api/films/danh-sach/" + slug + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var page = JSON.parse(filtersJson || "{}").page || 1;
    return BASE_URL + "/api/films/search?keyword=" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(slug) {
    return BASE_URL + "/api/film/" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

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

function parseListResponse(jsonText) {
    try {
        var data = JSON.parse(jsonText);
        var items = [];
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
 * Parse chi tiết phim.
 * SỬA: bổ sung ep.embed để lấy liên kết phát thực tế từ NguonC.
 */
function parseMovieDetail(jsonText) {
    try {
        var data = JSON.parse(jsonText);
        var movie = data.movie || data;

        var servers = [];
        var rawEpisodes = movie.episodes || [];

        if (rawEpisodes.length > 0) {
            for (var s = 0; s < rawEpisodes.length; s++) {
                var serverData = rawEpisodes[s];
                var serverName = serverData.server_name || ("Server " + (s + 1));
                var episodes = [];
                var listEpisodes = serverData.items || serverData.list || [];

                for (var e = 0; e < listEpisodes.length; e++) {
                    var ep = listEpisodes[e];
                    // QUAN TRỌNG: ưu tiên ep.embed (trường thực tế của NguonC)
                    var epId = ep.embed || ep.link_m3u8 || ep.link_embed || ep.slug || ep.id || "";
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

        // Trích xuất metadata phân loại
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
 * Parse liên kết phát cuối cùng.
 * Nếu episode.id là liên kết embed, trả về isEmbed: true để WebView xử lý.
 */
function parseDetailResponse(jsonText) {
    if (jsonText && jsonText.indexOf('embed.php') !== -1) {
        return JSON.stringify({
            url: jsonText,
            headers: {
                "Referer": "https://phim.nguonc.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            isEmbed: true
        });
    }

    try {
        var data = JSON.parse(jsonText);
        var movie = data.movie || data;
        var episodes = movie.episodes || [];

        for (var s = 0; s < episodes.length; s++) {
            var items = episodes[s].items || [];
            for (var e = 0; e < items.length; e++) {
                var ep = items[e];
                var url = ep.embed || ep.link_m3u8 || ep.link_embed || "";
                if (!url) continue;

                if (url.indexOf('.m3u8') !== -1 || url.indexOf('.mp4') !== -1) {
                    return JSON.stringify({
                        url: url,
                        headers: { "Referer": "https://phim.nguonc.com/" },
                        isEmbed: false,
                        mimeType: url.indexOf('.m3u8') !== -1 ? "application/x-mpegURL" : "video/mp4"
                    });
                }

                return JSON.stringify({
                    url: url,
                    headers: {
                        "Referer": "https://phim.nguonc.com/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    },
                    isEmbed: true
                });
            }
        }
    } catch (e) {
        // Bỏ qua, thực hiện fallback
    }

    return JSON.stringify({ url: "", isEmbed: false });
}

/**
 * Phân tích phản hồi HTML của embed (dự phòng).
 * Tăng cường khả năng trích xuất m3u8/mp4 trong script và iframe.
 */
function parseEmbedResponse(html, sourceUrl) {
    if (!html) {
        return JSON.stringify({ url: "", isEmbed: false });
    }

    var referer = sourceUrl || "https://phim.nguonc.com/";

    // 1. Tìm trực tiếp URL media (bao gồm trong script, thuộc tính)
    var mediaRegex = /https?:\/\/[^"'\s\\<>]+\.(?:m3u8|mp4)(?:\?[^"'\s\\<>]*)?/gi;
    var matches = html.match(mediaRegex);
    if (matches && matches.length > 0) {
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].indexOf('.m3u8') !== -1) {
                return JSON.stringify({
                    url: matches[i],
                    headers: { "Referer": referer },
                    isEmbed: false,
                    mimeType: "application/x-mpegURL"
                });
            }
        }
        return JSON.stringify({
            url: matches[0],
            headers: { "Referer": referer },
            isEmbed: false,
            mimeType: "video/mp4"
        });
    }

    // 2. Tìm iframe (embed lồng nhau)
    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
        var iframeUrl = iframeMatch[1];
        if (iframeUrl.indexOf('//') === 0) {
            iframeUrl = 'https:' + iframeUrl;
        }
        return JSON.stringify({
            url: iframeUrl,
            isEmbed: true
        });
    }

    // 3. Tìm biến JS: file/src/url: "xxx.m3u8"
    var jsVarRegex = /(?:file|src|url|source)\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i;
    var jsMatch = html.match(jsVarRegex);
    if (jsMatch && jsMatch[1]) {
        var jsUrl = jsMatch[1];
        if (jsUrl.indexOf('//') === 0) {
            jsUrl = 'https:' + jsUrl;
        }
        return JSON.stringify({
            url: jsUrl,
            headers: { "Referer": referer },
            isEmbed: false,
            mimeType: jsUrl.indexOf('.m3u8') !== -1 ? "application/x-mpegURL" : "video/mp4"
        });
    }

    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
