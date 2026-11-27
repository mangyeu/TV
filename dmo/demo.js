// =============================================================================
// VAAPP Plugin - AVDB API
// API mẫu: https://avdbapi.com/api.php/provide/vod?ac=detail&ids=663160
// Lưu ý: API được cung cấp chỉ có endpoint CHI TIẾT theo ID.
// Chưa có endpoint danh sách/tìm kiếm nên các hàm list/search để trống.
// =============================================================================

var API_BASE = "https://avdbapi.com/api.php/provide/vod";
var SITE_BASE = "https://avdbapi.com";
var DEFAULT_MOVIE_ID = "663160";

function safeJsonParse(value) {
    try {
        return typeof value === "string" ? JSON.parse(value) : value;
    } catch (e) {
        return null;
    }
}

function decodeHtml(value) {
    return String(value || "")
        .replace(/&amp;/g, "&")
        .replace(/&#039;|&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function asText(value) {
    if (Array.isArray(value)) return value.join(", ");
    return value == null ? "" : String(value);
}

function getManifest() {
    return JSON.stringify({
        id: "avdb_api",
        name: "AVDB API",
        version: "1.0.0",
        baseUrl: SITE_BASE,
        iconUrl: "https://avdbapi.com/favicon.ico",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        layoutType: "VERTICAL",
        // Link nguồn là trang embed; nếu App hỗ trợ WebView thì dùng embed.
        playerType: "embed"
    });
}

function getHomeSections() {
    // Chưa có endpoint danh sách trong thông tin API được cung cấp.
    return JSON.stringify([]);
}

function getPrimaryCategories() {
    return JSON.stringify([]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [], country: [], year: [] });
}

// =============================================================================
// SINH URL
// =============================================================================

function getUrlList(slug, filtersJson) {
    // Không tự đoán endpoint danh sách khi chưa có tài liệu API.
    return "";
}

function getUrlSearch(keyword, filtersJson) {
    // Không có endpoint search trong API mẫu.
    return "";
}

function getUrlDetail(slug) {
    var value = String(slug || DEFAULT_MOVIE_ID).trim();

    // Cho phép episode.id là URL embed; App sẽ tải URL này để parser xử lý.
    if (/^https?:\/\//i.test(value)) return value;

    // API detail nhận ID số qua tham số ids.
    var id = /^\d+$/.test(value) ? value : DEFAULT_MOVIE_ID;
    return API_BASE + "?ac=detail&ids=" + encodeURIComponent(id);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSER DANH SÁCH
// Dùng được nếu sau này API trả JSON có cấu trúc { list: [...] }.
// =============================================================================

function parseListResponse(response) {
    try {
        var data = safeJsonParse(response) || {};
        var source = Array.isArray(data.list) ? data.list : [];
        var items = source.map(function (item) {
            return {
                id: String(item.id || item.slug || ""),
                title: decodeHtml(item.name || item.origin_name || ""),
                posterUrl: item.poster_url || item.thumb_url || "",
                thumbUrl: item.thumb_url || item.poster_url || "",
                description: decodeHtml(item.description || ""),
                year: item.year || "",
                quality: item.quality || "",
                category: asText(item.category || item.type_name)
            };
        });

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: Number(data.page || 1),
                totalPages: Number(data.pagecount || 1),
                totalItems: Number(data.total || items.length)
            }
        });
    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }
}

function parseSearchResponse(response) {
    return parseListResponse(response);
}

// =============================================================================
// PARSER CHI TIẾT PHIM
// API trả episodes.server_data dạng object:
// { "Full": { "slug": "full", "link_embed": "https://..." } }
// =============================================================================

function parseMovieDetail(response) {
    try {
        var data = safeJsonParse(response) || {};
        var item = data.list && data.list.length ? data.list[0] : data;

        if (!item || !item.id) {
            return JSON.stringify({
                id: "",
                title: "Không tìm thấy dữ liệu phim",
                posterUrl: "",
                backdropUrl: "",
                description: "",
                servers: [],
                quality: "",
                year: "",
                status: "",
                duration: "",
                casts: "",
                director: "",
                category: ""
            });
        }

        var serverData = item.episodes && item.episodes.server_data
            ? item.episodes.server_data
            : {};

        var episodes = [];
        Object.keys(serverData).forEach(function (episodeName) {
            var ep = serverData[episodeName] || {};
            if (!ep.link_embed) return;

            episodes.push({
                // Giữ URL embed để getUrlDetail() nhận biết đây là URL đầy đủ.
                id: ep.link_embed,
                name: episodeName || ep.slug || "Full",
                slug: ep.slug || episodeName || "full"
            });
        });

        var serverName = item.episodes && item.episodes.server_name
            ? item.episodes.server_name
            : "Server 1";

        return JSON.stringify({
            id: String(item.id),
            title: decodeHtml(item.name || item.origin_name || ""),
            posterUrl: item.poster_url || item.thumb_url || "",
            backdropUrl: item.thumb_url || item.poster_url || "",
            description: decodeHtml(item.description || ""),
            servers: episodes.length ? [{
                name: serverName,
                episodes: episodes
            }] : [],
            quality: item.quality || "",
            year: item.year || "",
            rating: 0,
            status: item.status || "",
            duration: item.time || "",
            casts: asText(item.actor),
            director: asText(item.director),
            category: asText(item.category || item.type_name),
            country: asText(item.country),
            movieCode: item.movie_code || "",
            releaseDate: item.vod_pubdate || item.created_at || ""
        });
    } catch (e) {
        return JSON.stringify({
            id: "",
            title: "",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: [],
            quality: "",
            year: "",
            status: "",
            duration: "",
            casts: "",
            director: "",
            category: ""
        });
    }
}

// =============================================================================
// PARSER LINK XEM
// Hỗ trợ lấy iframe hoặc URL player từ HTML/JSON của trang embed.
// Nếu upload18.to thay đổi cấu trúc trang, cần cập nhật regex tương ứng.
// =============================================================================

function extractEmbedUrl(content) {
    var source = String(content || "");
    var patterns = [
        /<iframe[^>]+src=["']([^"']+)["']/i,
        /<iframe[^]+?src=["']([^"']+)["']/i,
        /(?:file|url|src)\s*[:=]\s*["'](https?:\\?\/\\?\/[^"'\\]+)["']/i,
        /https?:\/\/[^"'\\\s<>]+(?:\.m3u8|\.mp4)(?:\?[^"'\\\s<>]*)?/i
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = source.match(patterns[i]);
        if (match) {
            var found = match[1] || match[0];
            found = found.replace(/\\\//g, "/").replace(/&amp;/g, "&");
            if (found.indexOf("//") === 0) found = "https:" + found;
            return found;
        }
    }
    return "";
}

function parseDetailResponse(response) {
    try {
        var data = safeJsonParse(response);

        // Trường hợp endpoint trả JSON có URL trực tiếp.
        if (data && typeof data === "object") {
            var direct = data.url || data.file || data.src || "";
            if (direct) {
                return JSON.stringify({
                    url: direct,
                    headers: {},
                    subtitles: [],
                    isEmbed: false
                });
            }
        }

        var embedUrl = extractEmbedUrl(response);
        if (embedUrl) {
            return JSON.stringify({
                url: embedUrl,
                headers: { "Referer": "https://upload18.to/" },
                subtitles: [],
                isEmbed: !/\.(m3u8|mp4)(\?|$)/i.test(embedUrl),
                mimeType: /\.(m3u8)(\?|$)/i.test(embedUrl)
                    ? "application/x-mpegURL"
                    : (/\.(mp4)(\?|$)/i.test(embedUrl) ? "video/mp4" : "")
            });
        }

        // Không có URL player nhận diện được: trả rỗng để tránh phát sai URL.
        return JSON.stringify({ url: "", isEmbed: false, subtitles: [] });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, subtitles: [] });
    }
}

function parseEmbedResponse(response, sourceUrl) {
    var embedUrl = extractEmbedUrl(response);

    if (embedUrl) {
        var isMedia = /\.(m3u8|mp4)(\?|$)/i.test(embedUrl);
        return JSON.stringify({
            url: embedUrl,
            isEmbed: !isMedia,
            headers: {
                "Referer": sourceUrl || "https://upload18.to/"
            },
            mimeType: /\.m3u8(\?|$)/i.test(embedUrl)
                ? "application/x-mpegURL"
                : (/\.mp4(\?|$)/i.test(embedUrl) ? "video/mp4" : "")
        });
    }

    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(response) { return "[]"; }
function parseCountriesResponse(response) { return "[]"; }
function parseYearsResponse(response) { return "[]"; }
