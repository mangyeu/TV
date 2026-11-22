// =============================================================================
// TVHAY Plugin - Theo cấu trúc Kkphim
// Base URL: https://tvhay.buzz
// Type: SCRAPER (không có API công khai)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHAY",
        "version": "1.0.0",
        "baseUrl": "https://tvhay.buzz",
        "iconUrl": "https://tvhay.buzz/favicon.png",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi', title: 'Phim Mới', type: 'Horizontal', path: 'list' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'list' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'list' },
        { slug: 'short-drama', title: 'Short Drama', type: 'Horizontal', path: 'list' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Short Drama', slug: 'short-drama' },
        { name: 'Hành động', slug: 'hanh-dong' },
        { name: 'Tình cảm', slug: 'tinh-cam' },
        { name: 'Hài hước', slug: 'hai-huoc' },
        { name: 'Kinh dị', slug: 'kinh-di' },
        { name: 'Võ thuật', slug: 'vo-thuat' },
        { name: 'Cổ trang', slug: 'co-trang' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'modified' },
            { name: 'Năm phát hành', value: 'year' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

var BASE_URL = "https://tvhay.buzz";

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        
        // Danh sách thuần
        var listSlugs = ['phim-moi', 'phim-bo', 'phim-le', 'short-drama'];
        
        var url;
        if (listSlugs.indexOf(slug) !== -1) {
            url = BASE_URL + "/" + slug;
        } else {
            // Thể loại
            url = BASE_URL + "/the-loai/" + encodeURIComponent(slug);
        }
        
        // Thêm query params
        var params = [];
        if (page > 1) params.push("page=" + page);
        if (filters.country) params.push("country=" + encodeURIComponent(filters.country));
        if (filters.year) params.push("year=" + encodeURIComponent(filters.year));
        if (filters.sort) params.push("sort=" + encodeURIComponent(filters.sort));
        
        if (params.length > 0) {
            url += "?" + params.join("&");
        }
        
        return url;
    } catch (e) {
        return BASE_URL + "/" + encodeURIComponent(slug || "phim-moi");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var q = encodeURIComponent((keyword || "").trim());
        
        var url = BASE_URL + "/?view=tim-kiem&keyword=" + q;
        if (page > 1) url += "&page=" + page;
        
        return url;
    } catch (e) {
        return BASE_URL + "/?view=tim-kiem&keyword=" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    // slug có thể là slug phim hoặc JSON chứa thông tin
    var s = String(slug || "");
    
    // Nếu là JSON (từ episode id)
    if (s.indexOf("{") === 0) {
        try {
            var parsed = JSON.parse(s);
            if (parsed.movieSlug) {
                return BASE_URL + "/phim/" + encodeURIComponent(parsed.movieSlug);
            }
            if (parsed.url) return parsed.url;
        } catch (e) {}
    }
    
    return BASE_URL + "/phim/" + encodeURIComponent(s);
}

function getUrlCategories() {
    return BASE_URL + "/the-loai";
}

function getUrlCountries() {
    return BASE_URL + "/quoc-gia";
}

function getUrlYears() {
    return ""; // Dùng local
}

function getLocalYearsJson() {
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var y = currentYear; y >= 1970; y--) {
        years.push({ name: String(y), value: String(y) });
    }
    return JSON.stringify(years);
}

// =============================================================================
// PARSERS & HELPERS
// =============================================================================

/**
 * Extract text từ HTML bằng regex (không có DOM parser trong môi trường plugin)
 */
function extractText(html, pattern, groupIndex) {
    if (!html) return "";
    var match = html.match(pattern);
    return match && match[groupIndex || 1] ? match[groupIndex || 1].trim() : "";
}

/**
 * Extract tất cả matches
 */
function extractAll(html, pattern, groupIndex) {
    if (!html) return [];
    var results = [];
    var regex = new RegExp(pattern.source || pattern, pattern.flags ? pattern.flags : "g");
    var match;
    while ((match = regex.exec(html)) !== null) {
        if (match[groupIndex || 1]) {
            results.push(match[groupIndex || 1].trim());
        }
    }
    return results;
}

/**
 * Parse danh sách phim từ HTML trang list
 * Cấu trúc: <div class="movie-item">...<a href="/phim/{slug}" title="{title}">...
 */
function parseListResponse(htmlResponse) {
    try {
        var html = String(htmlResponse || "");
        var movies = [];
        
        // Tìm tất cả movie-item blocks
        var itemRegex = /<div class="movie-item">([\s\S]*?)<\/div>\s*<\/div>\s*<\/a>\s*<\/div>/g;
        var itemMatch;
        
        // Fallback: tìm từng link phim
        var linkRegex = /<a href="\/phim\/([^"]+)" title="([^"]*)">([\s\S]*?)<\/a>/g;
        var linkMatch;
        var seen = {};
        
        while ((linkMatch = linkRegex.exec(html)) !== null) {
            var slug = linkMatch[1];
            if (seen[slug]) continue;
            seen[slug] = true;
            
            var title = linkMatch[2] || "";
            var block = linkMatch[3] || "";
            
            // Extract poster
            var posterMatch = block.match(/<img[^>]*src="([^"]+)"[^>]*>/);
            var poster = posterMatch ? posterMatch[1] : "";
            
            // Extract episode status
            var epMatch = block.match(/<span class="movie-ep-status">([^<]+)<\/span>/);
            var episode = epMatch ? epMatch[1].trim() : "";
            
            // Extract lang label
            var langMatch = block.match(/<span class="movie-label">([^<]+)<\/span>/);
            var lang = langMatch ? langMatch[1].trim() : "";
            
            // Extract year và views từ meta
            var yearMatch = block.match(/<span style="font-weight: bold;">(\d{4})<\/span>/);
            var year = yearMatch ? parseInt(yearMatch[1], 10) : 0;
            
            var viewsMatch = block.match(/fa-heart[^>]*><\/i>\s*([\d,]+)/);
            var views = viewsMatch ? viewsMatch[1] : "";
            
            movies.push({
                id: slug,
                title: title,
                posterUrl: poster ? (poster.indexOf("http") === 0 ? poster : BASE_URL + poster) : "",
                backdropUrl: "",
                year: year,
                quality: "",
                episode_current: episode,
                lang: lang
            });
        }
        
        // Phân trang (đơn giản)
        var currentPage = 1;
        var pageMatch = html.match(/class="current">(\d+)</);
        if (pageMatch) currentPage = parseInt(pageMatch[1], 10);
        
        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: currentPage + 1, // Không biết chính xác, cho phép next
                totalItems: movies.length,
                itemsPerPage: movies.length
            }
        });
    } catch (error) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 }
        });
    }
}

function parseSearchResponse(htmlResponse) {
    return parseListResponse(htmlResponse);
}

/**
 * Parse chi tiết phim từ HTML trang /phim/{slug}
 */
function parseMovieDetail(htmlResponse) {
    try {
        var html = String(htmlResponse || "");
        
        // Title
        var title = extractText(html, /<h1[^>]*>([^<]+)<\/h1>/) || 
                    extractText(html, /<title>([^<]+)<\/title>/);
        
        // Poster
        var posterMatch = html.match(/<img[^>]*class="[^"]*poster[^"]*"[^>]*src="([^"]+)"/) ||
                         html.match(/<meta property="og:image" content="([^"]+)"/);
        var poster = posterMatch ? posterMatch[1] : "";
        
        // Description
        var desc = extractText(html, /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/);
        desc = desc.replace(/<[^>]*>/g, "").trim();
        
        // Year
        var yearMatch = html.match(/(\d{4})/);
        var year = yearMatch ? parseInt(yearMatch[1], 10) : 0;
        
        // Tìm servers và episodes
        var servers = [];
        
        // Tìm tất cả các tab server (thường là button hoặc link với data-server)
        var serverRegex = /<a[^>]*class="[^"]*server[^"]*"[^>]*data-server="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
        var serverMatch;
        var serverMap = {};
        
        while ((serverMatch = serverRegex.exec(html)) !== null) {
            var serverId = serverMatch[1];
            var serverName = serverMatch[2].trim();
            if (!serverMap[serverId]) {
                serverMap[serverId] = { name: serverName, episodes: [] };
            }
        }
        
        // Tìm episodes - thường có dạng link /xem/{slug}/{tap}
        var epRegex = /<a[^>]*href="(\/xem\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
        var epMatch;
        var allEpisodes = [];
        
        while ((epMatch = epRegex.exec(html)) !== null) {
            var epUrl = epMatch[1];
            var epName = epMatch[2].trim();
            
            // Extract slug và tap từ URL
            var urlParts = epUrl.match(/\/xem\/([^\/]+)\/([^\/]+)/);
            if (urlParts) {
                allEpisodes.push({
                    slug: urlParts[1],
                    tap: urlParts[2],
                    name: epName,
                    url: BASE_URL + epUrl
                });
            }
        }
        
        // Nhóm episodes vào server mặc định nếu không tìm thấy server
        if (allEpisodes.length > 0) {
            var defaultServer = { name: "Server 1", episodes: [] };
            for (var i = 0; i < allEpisodes.length; i++) {
                var ep = allEpisodes[i];
                defaultServer.episodes.push({
                    id: JSON.stringify({
                        movieSlug: ep.slug,
                        tap: ep.tap,
                        url: ep.url
                    }),
                    name: ep.name || ("Tập " + (i + 1)),
                    slug: ep.tap,
                    m3u8: "",
                    embed: ep.url
                });
            }
            servers.push(defaultServer);
        }
        
        // Nếu có server từ serverMap, merge vào
        for (var sid in serverMap) {
            if (serverMap.hasOwnProperty(sid) && serverMap[sid].episodes.length > 0) {
                servers.push(serverMap[sid]);
            }
        }
        
        return JSON.stringify({
            id: extractText(html, /\/phim\/([^"]+)"/) || "",
            title: title,
            originName: "",
            posterUrl: poster ? (poster.indexOf("http") === 0 ? poster : BASE_URL + poster) : "",
            backdropUrl: "",
            description: desc,
            year: year,
            rating: 0,
            quality: "HD",
            duration: "",
            servers: servers,
            episode_current: "",
            lang: "",
            category: "",
            country: "",
            director: "",
            casts: "",
            status: "",
            tmdbId: "",
            tmdbSeason: 0,
            tmdbType: ""
        });
    } catch (error) {
        return "null";
    }
}

// =============================================================================
// DEEP-SCAN STREAM RESOLVER (từ phân tích trước)
// =============================================================================

var STREAM_CONFIG = {
    directExtensions: [".m3u8", ".mp4", ".mkv", ".ts", ".webm", ".flv"],
    knownStreamHosts: ["phimapi.com", "phimimg.com", "vsmov.com", "nguonc.com",
                       "streamtape", "abyss", "dood", "mixdrop", "fembed",
                       "player.", "stream.", "cdn.", "embed.", "video."],
    maxDepth: 6,
    defaultHeaders: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://tvhay.buzz/"
    }
};

function isDirectStreamUrl(url) {
    if (!url || typeof url !== "string") return false;
    var u = url.trim().toLowerCase();
    for (var i = 0; i < STREAM_CONFIG.directExtensions.length; i++) {
        if (u.indexOf(STREAM_CONFIG.directExtensions[i]) !== -1) return true;
    }
    if (/[?&](type|format|ext)=(m3u8|mp4|mkv)/i.test(u)) return true;
    if (/\/(hls|stream|playlist|master)\//i.test(u)) return true;
    return false;
}

function isEmbedUrl(url) {
    if (!url || typeof url !== "string") return false;
    var u = url.trim().toLowerCase();
    if (isDirectStreamUrl(u)) return false;
    if (/^https?:\/\//.test(u)) {
        for (var i = 0; i < STREAM_CONFIG.knownStreamHosts.length; i++) {
            if (u.indexOf(STREAM_CONFIG.knownStreamHosts[i]) !== -1) return true;
        }
        if (/\/(embed|player|iframe)/i.test(u)) return true;
    }
    return false;
}

function extractUrlsFromText(text) {
    if (!text || typeof text !== "string") return [];
    var urls = [];
    var patterns = [
        /(?:src|href|data-src|data-url|file|source)\s*=\s*["']([^"']+)["']/gi,
        /["'](?:url|link|file|source|src|stream|m3u8|mp4|playlist)["']\s*:\s*["']([^"']+)["']/gi,
        /https?:\/\/[^\s"'<>\\]+\.(?:m3u8|mp4|mkv|ts)(?:\?[^\s"'<>\\]*)?/gi
    ];
    for (var p = 0; p < patterns.length; p++) {
        var regex = patterns[p];
        var match;
        while ((match = regex.exec(text)) !== null) {
            urls.push(match[1] || match[0]);
        }
    }
    var seen = {};
    return urls.filter(function(u) {
        if (!u || seen[u]) return false;
        seen[u] = true;
        return true;
    });
}

function deepScanForStreams(obj, depth, found) {
    depth = depth || 0;
    found = found || [];
    if (depth > STREAM_CONFIG.maxDepth || obj === null || obj === undefined) return found;
    
    if (typeof obj === "string") {
        var s = obj.trim();
        if (isDirectStreamUrl(s)) found.push({ url: s, type: "direct" });
        else if (isEmbedUrl(s)) found.push({ url: s, type: "embed" });
        return found;
    }
    
    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) deepScanForStreams(obj[i], depth + 1, found);
        return found;
    }
    
    if (typeof obj === "object") {
        var priorityKeys = ["link_m3u8", "link_embed", "m3u8", "mp4", "url", "streamUrl", "file", "source", "src"];
        for (var k = 0; k < priorityKeys.length; k++) {
            var key = priorityKeys[k];
            if (obj[key] && typeof obj[key] === "string") {
                var v = obj[key].trim();
                if (isDirectStreamUrl(v)) found.push({ url: v, type: "direct" });
                else if (isEmbedUrl(v)) found.push({ url: v, type: "embed" });
            }
        }
        for (var key2 in obj) {
            if (obj.hasOwnProperty(key2) && priorityKeys.indexOf(key2) === -1) {
                deepScanForStreams(obj[key2], depth + 1, found);
            }
        }
    }
    return found;
}

/**
 * Parse detail response (stream URL)
 * Nhận: JSON string, URL string, hoặc HTML
 */
function parseDetailResponse(apiResponseJson) {
    try {
        var raw = String(apiResponseJson || "").trim();
        if (!raw) {
            return JSON.stringify({
                url: "",
                isDirectStream: false,
                headers: STREAM_CONFIG.defaultHeaders,
                subtitles: [],
                error: "empty_input"
            });
        }
        
        // Nếu là URL trực tiếp
        if (/^https?:\/\//i.test(raw)) {
            if (isDirectStreamUrl(raw)) {
                return JSON.stringify({
                    url: raw,
                    isDirectStream: true,
                    headers: STREAM_CONFIG.defaultHeaders,
                    subtitles: [],
                    resolvedFrom: "direct"
                });
            }
            // Embed URL - trả về để player tự xử lý
            return JSON.stringify({
                url: raw,
                isDirectStream: false,
                headers: STREAM_CONFIG.defaultHeaders,
                subtitles: [],
                resolvedFrom: "embed_passthrough",
                isEmbed: true
            });
        }
        
        // Nếu là JSON
        try {
            var parsed = JSON.parse(raw);
            var found = deepScanForStreams(parsed, 0, []);
            var direct = found.filter(function(f) { return f.type === "direct"; });
            var embeds = found.filter(function(f) { return f.type === "embed"; });
            
            if (direct.length > 0) {
                return JSON.stringify({
                    url: direct[0].url,
                    isDirectStream: true,
                    headers: STREAM_CONFIG.defaultHeaders,
                    subtitles: [],
                    resolvedFrom: "json_deep_scan",
                    allStreams: direct.map(function(d) { return d.url; })
                });
            }
            if (embeds.length > 0) {
                return JSON.stringify({
                    url: embeds[0].url,
                    isDirectStream: false,
                    headers: STREAM_CONFIG.defaultHeaders,
                    subtitles: [],
                    resolvedFrom: "json_embed",
                    isEmbed: true,
                    allStreams: embeds.map(function(d) { return d.url; })
                });
            }
        } catch (e) { /* không phải JSON */ }
        
        // Fallback
        return JSON.stringify({
            url: raw,
            isDirectStream: false,
            headers: STREAM_CONFIG.defaultHeaders,
            subtitles: [],
            resolvedFrom: "raw_fallback"
        });
    } catch (err) {
        return JSON.stringify({
            url: String(apiResponseJson || ""),
            isDirectStream: false,
            headers: STREAM_CONFIG.defaultHeaders,
            subtitles: [],
            error: String(err && err.message || err)
        });
    }
}

// =============================================================================
// CATEGORIES & COUNTRIES (từ HTML tĩnh)
// =============================================================================

function parseCategoriesResponse(apiResponseJson) {
    try {
        var html = String(apiResponseJson || "");
        var categories = [];
        
        // Tìm từ dropdown menu thể loại
        var regex = /<a href="\/the-loai\/([^"]+)">([^<]+)<\/a>/g;
        var match;
        while ((match = regex.exec(html)) !== null) {
            categories.push({
                name: match[2].trim(),
                slug: match[1]
            });
        }
        
        // Fallback nếu không tìm thấy
        if (categories.length === 0) {
            categories = [
                { name: 'Hành Động', slug: 'hanh-dong' },
                { name: 'Tình Cảm', slug: 'tinh-cam' },
                { name: 'Hài Hước', slug: 'hai-huoc' },
                { name: 'Kinh Dị', slug: 'kinh-di' },
                { name: 'Võ Thuật', slug: 'vo-thuat' },
                { name: 'Cổ Trang', slug: 'co-trang' },
                { name: 'Viễn Tưởng', slug: 'vien-tuong' },
                { name: 'Phiêu Lưu', slug: 'phieu-luu' }
            ];
        }
        
        return JSON.stringify(categories);
    } catch (e) {
        return JSON.stringify([
            { name: 'Hành Động', slug: 'hanh-dong' },
            { name: 'Tình Cảm', slug: 'tinh-cam' }
        ]);
    }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var html = String(apiResponseJson || "");
        var countries = [];
        
        var regex = /<a href="\/quoc-gia\/([^"]+)">([^<]+)<\/a>/g;
        var match;
        while ((match = regex.exec(html)) !== null) {
            countries.push({
                name: match[2].trim(),
                value: match[1]
            });
        }
        
        if (countries.length === 0) {
            countries = [
                { name: 'Việt Nam', value: 'viet-nam' },
                { name: 'Hàn Quốc', value: 'han-quoc' },
                { name: 'Trung Quốc', value: 'trung-quoc' },
                { name: 'Nhật Bản', value: 'nhat-ban' },
                { name: 'Thái Lan', value: 'thai-lan' },
                { name: 'Âu Mỹ', value: 'au-my' }
            ];
        }
        
        return JSON.stringify(countries);
    } catch (e) {
        return JSON.stringify([
            { name: 'Việt Nam', value: 'viet-nam' },
            { name: 'Hàn Quốc', value: 'han-quoc' }
        ]);
    }
}

function parseYearsResponse(apiResponseJson) {
    // TVHAY không có API năm riêng, dùng local
    return getLocalYearsJson();
}
