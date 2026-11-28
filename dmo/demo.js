// =============================================================================
// AVDBAPI Plugin cho VAAPP - Hoàn chỉnh
// API: https://avdbapi.com
// Stream: upload18.to (JWPlayer + helvid.com HLS)
// =============================================================================

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi_jav",
        "name": "AVDB JAV",
        "version": "1.0.4",
        "baseUrl": "https://avdbapi.com",
        "iconUrl": "https://avdbapi.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: '1', title: 'Censored', type: 'Horizontal', path: 'category' },
        { slug: '2', title: 'Uncensored', type: 'Horizontal', path: 'category' },
        { slug: '3', title: 'Uncensored Leaked', type: 'Horizontal', path: 'category' },
        { slug: '4', title: 'Amateur', type: 'Horizontal', path: 'category' },
        { slug: '5', title: 'Chinese AV', type: 'Horizontal', path: 'category' },
        { slug: '6', title: 'Western', type: 'Horizontal', path: 'category' },
        { slug: 'latest', title: 'Mới Cập Nhật', type: 'Grid', path: 'latest' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Censored', slug: '1' },
        { name: 'Uncensored', slug: '2' },
        { name: 'Uncensored Leaked', slug: '3' },
        { name: 'Amateur', slug: '4' },
        { name: 'Chinese AV', slug: '5' },
        { name: 'Western', slug: '6' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'desc' },
            { name: 'Cũ nhất', value: 'asc' }
        ]
    });
}

// =============================================================================
// NHÓM 2: SINH URL (App gọi hàm → nhận URL → tự fetch HTTP)
// =============================================================================

var BASE_API = "https://avdbapi.com/api.php/provide/vod";

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var url = BASE_API + "?ac=detail&pg=" + page + "&pagesize=24";

        if (/^[1-6]$/.test(slug)) {
            url += "&t=" + slug;
        } else if (slug === 'latest') {
            // Mới cập nhật - default sort
        } else if (filters.category) {
            url += "&t=" + filters.category;
        }

        if (filters.year) url += "&year=" + filters.year;
        if (filters.sort) url += "&sort_direction=" + filters.sort;

        return url;
    } catch (e) {
        return BASE_API + "?ac=detail&pg=1&pagesize=24";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try { filters = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var page = filters.page || 1;
    return BASE_API + "?ac=detail&wd=" + encodeURIComponent(keyword) + "&pg=" + page + "&pagesize=24";
}

/**
 * getUrlDetail nhận episodeId.
 * - Nếu là URL http(s) → đây là embed URL (upload18.to) → fetch trực tiếp
 * - Nếu là numeric id → dùng ids= parameter
 * - Nếu là slug/movie_code → dùng code= parameter
 */
function getUrlDetail(episodeId) {
    if (!episodeId) return "";
    if (/^https?:\/\//i.test(String(episodeId))) {
        return String(episodeId).trim();
    }
    if (/^\d+$/.test(episodeId)) {
        return BASE_API + "?ac=detail&ids=" + episodeId;
    }
    return BASE_API + "?ac=detail&code=" + encodeURIComponent(episodeId) + "&pagesize=1";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

function parseJson(input) {
    if (input && typeof input === "object") return input;
    try { return JSON.parse(input || "{}"); } catch (e) { return {}; }
}

function asText(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
}

/**
 * Giải mã URL trong JSON nhúng của upload18.to:
 *   `\/`      → `/`
 *   `\u0026`  → `&`
 *   `\u003d`  → `=`
 *   `\u0025`  → `%`
 *   `&amp;`   → `&`
 */
function cleanUrl(raw) {
    return String(raw || "")
        .replace(/\\\//g, "/")
        .replace(/\\u0026/g, "&")
        .replace(/\\u003d/g, "=")
        .replace(/\\u0025/g, "%")
        .replace(/&amp;/g, "&")
        .trim();
}

// -----------------------------------------------------------------------------
// DANH SÁCH PHIM
// -----------------------------------------------------------------------------

function parseListResponse(apiResponseJson) {
    try {
        var response = parseJson(apiResponseJson);
        var list = response.list || [];

        var movies = list.map(function (item) {
            return {
                id: String(item.id || ""),
                title: item.name || "",
                posterUrl: item.poster_url || "",
                backdropUrl: item.thumb_url || "",
                year: parseInt(item.year) || 0,
                quality: item.quality || "HD",
                episode_current: item.status || "",
                lang: item.movie_code || ""
            };
        });

        var currentPage = parseInt(response.page) || 1;
        var totalItems = parseInt(response.total) || 0;
        var itemsPerPage = parseInt(response.limit) || 24;
        var totalPages = parseInt(response.pagecount) || Math.ceil(totalItems / itemsPerPage);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

// -----------------------------------------------------------------------------
// CHI TIẾT PHIM
// -----------------------------------------------------------------------------

function parseMovieDetail(apiResponseJson) {
    try {
        var response = parseJson(apiResponseJson);
        var list = response.list || [];
        if (list.length === 0) return "null";

        var movie = list[0];

        // Parse episodes: { server_name, server_data: { "Full": { slug, link_embed } } }
        var servers = [];
        var eps = movie.episodes;
        if (eps) {
            var serverEpisodes = [];
            var serverData = eps.server_data || {};

            for (var epName in serverData) {
                if (serverData.hasOwnProperty(epName)) {
                    var epInfo = serverData[epName];
                    var embedUrl = epInfo.link_embed || "";
                    if (embedUrl) {
                        // episode.id = embed URL (upload18.to)
                        // → App gọi getUrlDetail(id) → fetch HTML trang play
                        // → parseDetailResponse(html) → trích xuất m3u8
                        serverEpisodes.push({
                            id: embedUrl,
                            name: epName,
                            slug: epInfo.slug || epName.toLowerCase()
                        });
                    }
                }
            }

            if (serverEpisodes.length > 0) {
                servers.push({
                    name: eps.server_name || "Server #1",
                    episodes: serverEpisodes
                });
            }
        }

        var categories = Array.isArray(movie.category)
            ? movie.category.join(", ")
            : (movie.category || "");
        var countries = Array.isArray(movie.country)
            ? movie.country.join(", ")
            : (movie.country || "");
        var directors = Array.isArray(movie.director)
            ? movie.director.filter(function (d) { return d !== "Updating"; }).join(", ")
            : (movie.director || "");
        var actors = Array.isArray(movie.actor)
            ? movie.actor.filter(function (a) { return a !== "Updating"; }).join(", ")
            : (movie.actor || "");

        return JSON.stringify({
            id: movie.slug || movie.movie_code || "",
            title: movie.name || "",
            originName: movie.origin_name || "",
            posterUrl: movie.poster_url || "",
            backdropUrl: movie.thumb_url || "",
            description: (movie.description || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year) || 0,
            rating: 0,
            quality: movie.quality || "HD",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.status || "",
            lang: "",
            category: categories,
            country: countries,
            director: directors,
            casts: actors,
            status: movie.status || ""
        });
    } catch (error) {
        return "null";
    }
}

// -----------------------------------------------------------------------------
// STREAM LINK (parseDetailResponse)
//
// Input: HTML trang play upload18.to
// HTML chứa: window.PLAYER_CONFIG = {... "m3u8":"https:\/\/helvid.com\/m\/...playlist.m3u8?e=...&h=...", ...}
//
// Output mong đợi của VAAPP:
//   { url, isEmbed, mimeType, headers, subtitles }
//   - isEmbed: false → phát luôn bằng ExoPlayer
//   - isEmbed: true  → App fetch tiếp URL
// -----------------------------------------------------------------------------

function parseDetailResponse(embedHtml, pageUrl) {
    try {
        var html = String(embedHtml || "");

        // 1) Nếu App truyền thẳng URL thuần → fetch tiếp
        if (/^https?:\/\/[^\s"'<>]+$/i.test(html.trim())) {
            return JSON.stringify({
                url: html.trim(),
                isEmbed: true,
                headers: {}
            });
        }

        // 2) Nếu response đã là JSON có url → dùng luôn
        if (html.trim().charAt(0) === "{") {
            var j = parseJson(html);
            if (j.url) return JSON.stringify(j);
        }

        // 3) Bắt link m3u8 trong window.PLAYER_CONFIG (ưu tiên)
        var m = html.match(/"m3u8"\s*:\s*"([^"]+)"/i);
        if (m && m[1]) {
            var streamUrl = cleanUrl(m[1]);
            if (/^https?:\/\//i.test(streamUrl)) {
                return JSON.stringify({
                    url: streamUrl,
                    isEmbed: false,
                    mimeType: "application/x-mpegURL",
                    headers: {
                        "Referer": "https://upload18.to/",
                        "Origin": "https://upload18.to",
                        "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36"
                    },
                    subtitles: []
                });
            }
        }

        // 4) Fallback: bắt "file"/"src"/"source"/"hls": "...m3u8|mp4"
        m = html.match(/"(?:file|src|source|hls)"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/i);
        if (m && m[1]) {
            var fileUrl = cleanUrl(m[1]);
            if (/^https?:\/\//i.test(fileUrl)) {
                return JSON.stringify({
                    url: fileUrl,
                    isEmbed: false,
                    mimeType: /\.m3u8/i.test(fileUrl) ? "application/x-mpegURL" : "video/mp4",
                    headers: { "Referer": "https://upload18.to/" },
                    subtitles: []
                });
            }
        }

        // 5) Fallback: bất kỳ link m3u8/mp4 trong HTML
        m = html.match(/(https?:\\?\/\\?\/[^"'\\\s<>]+\.(?:m3u8|mp4)(?:\?[^"'\\\s<>]*)?)/i);
        if (m && m[1]) {
            var fallbackUrl = cleanUrl(m[1]);
            return JSON.stringify({
                url: fallbackUrl,
                isEmbed: false,
                mimeType: /\.m3u8/i.test(fallbackUrl) ? "application/x-mpegURL" : "video/mp4",
                headers: { "Referer": "https://upload18.to/" },
                subtitles: []
            });
        }

        // 6) Fallback: iframe (một số video dùng embed khác)
        m = html.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);
        if (m && m[1]) {
            return JSON.stringify({
                url: m[1],
                isEmbed: true,
                headers: {}
            });
        }

        // 7) Fallback cuối: trả embed URL cho WebView
        return JSON.stringify({
            url: pageUrl || "",
            isEmbed: true,
            headers: {
                "Referer": "https://upload18.to/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            },
            subtitles: []
        });
    } catch (error) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

/**
 * parseEmbedResponse: xử lý embed nhiều bước (tối đa 3 lần).
 * Với upload18.to thường không cần vì đã lấy m3u8 ở bước 1,
 * nhưng giữ để phòng iframe lồng nhau.
 */
function parseEmbedResponse(response, sourceUrl) {
    try {
        var html = String(response || "").trim();

        // URL thuần → fetch tiếp
        if (/^https?:\/\/[^\s"'<>]+$/i.test(html)) {
            return JSON.stringify({
                url: html,
                isEmbed: true,
                headers: {}
            });
        }

        // Bắt m3u8/file
        var m = html.match(/"m3u8"\s*:\s*"([^"]+)"/i)
             || html.match(/"(?:file|src|source|hls)"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/i)
             || html.match(/(https?:\\?\/\\?\/[^"'\\\s<>]+\.(?:m3u8|mp4)(?:\?[^"'\\\s<>]*)?)/i);
        if (m && m[1]) {
            var u = cleanUrl(m[1]);
            if (/^https?:\/\//i.test(u)) {
                return JSON.stringify({
                    url: u,
                    isEmbed: false,
                    mimeType: /\.m3u8/i.test(u) ? "application/x-mpegURL" : "video/mp4",
                    headers: {
                        "Referer": sourceUrl || "https://upload18.to/",
                        "Origin": "https://upload18.to"
                    }
                });
            }
        }

        // Iframe
        m = html.match(/<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/i);
        if (m && m[1]) {
            var abs = /^https?:\/\//i.test(m[1]) ? m[1]
                    : (m[1].charAt(0) === "/" ? "https://upload18.to" + m[1] : m[1]);
            return JSON.stringify({ url: abs, isEmbed: true, headers: {} });
        }

        return JSON.stringify({ url: "", isEmbed: false });
    } catch (error) {
        return JSON.stringify({ url: "", isEmbed: false });
    }
}

// =============================================================================
// DANH MỤC / QUỐC GIA / NĂM
// =============================================================================

function parseCategoriesResponse(apiResponseJson) {
    return JSON.stringify([
        { name: "Censored", slug: "1" },
        { name: "Uncensored", slug: "2" },
        { name: "Uncensored Leaked", slug: "3" },
        { name: "Amateur", slug: "4" },
        { name: "Chinese AV", slug: "5" },
        { name: "Western", slug: "6" }
    ]);
}

function parseCountriesResponse(apiResponseJson) {
    return JSON.stringify([
        { name: "Japan", value: "japan" },
        { name: "China", value: "china" },
        { name: "Western", value: "western" }
    ]);
}

function parseYearsResponse(apiResponseJson) {
    var years = [];
    for (var i = 2026; i >= 2010; i--) {
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}
