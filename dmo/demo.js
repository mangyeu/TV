// =============================================================================
// VAAPP Plugin - Mapped to Exact AVDBAPI JSON Structure
// =============================================================================

var PLUGIN_BASE_URL = "https://avdbapi.com";
var PLUGIN_API_URL = "https://avdbapi.com/api.php/provide/vod/";

// Dữ liệu mẫu đúng theo cấu trúc JSON bạn cung cấp
var MOCK_RAW_DATA = {
    "code": 1,
    "msg": "Data list",
    "page": 1,
    "pagecount": 1,
    "limit": 100,
    "total": 1,
    "list": [
        {
            "id": 663564,
            "name": "[ENGLISH-SUBTITLE] OFES-049 Yui Hatano - Seduced By Cleaning Lady",
            "origin_name": "[ENGLISH-SUBTITLE] OFES-049 Yui Hatano - Seduced By Cleaning Lady",
            "slug": "ofes-049-sub",
            "type_name": "English subtitle",
            "tag": "Censored, English Encoded, English Subtitle, subbed by yutatarokun, Big breast fetish",
            "category": [
                "Censored",
                "English Encoded",
                "English Subtitle",
                "Subbed By Yutatarokun",
                "Big Breast Fetish",
                "Big Breasts",
                "Boob Job",
                "Exclusive Distribution",
                "High Definition",
                "Hotel",
                "Internal Ejaculation",
                "Standalone Work"
            ],
            "poster_url": "https://upload18.cc/v/OFES-049-SUB/poster.jpg",
            "thumb_url": "https://upload18.cc/v/OFES-049-SUB/thumb.jpg",
            "actor": [
                "Yui Hatano in the Shirt"
            ],
            "director": [
                "Premium Production"
            ],
            "movie_code": "OFES-049-SUB",
            "created_at": "2026-07-29",
            "country": [
                "Japan"
            ],
            "year": 2026,
            "quality": "HD",
            "status": "Release",
            "author": "",
            "time": "02:00:28",
            "description": "OFES-049 English Subbed Yui Hatano in a thrilling encounter with a cleaning lady at a love hotel, featuring intense piston thrusts and boob pressing. Catalog: OFES-049-SUB (English Subtitle, Starring Yui Hatano in the Shirt, produced by Premium, released on 2026-07-29, runtime 02:00:28).",
            "vod_pubdate": "2026-07-29",
            "vod_time": "2026-11-28 10:36:53",
            "vod_time_add": 1795833413,
            "episodes": {
                "VIP #1": {
                    "server_name": "VIP #1",
                    "server_data": {
                        "Full": {
                            "name": "Full",
                            "slug": "full",
                            "link_embed": "https://upload18.to/play/index/ofes-049-sub"
                        }
                    }
                }
            }
        }
    ]
};

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdb_exact_feed",
        "name": "AVDB Feed",
        "version": "1.0.1",
        "baseUrl": PLUGIN_BASE_URL,
        "iconUrl": "https://upload18.cc/v/OFES-049-SUB/thumb.jpg",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "moi-cap-nhat", title: "Mới Cập Nhật", type: "Horizontal", path: "" },
        { slug: "english-subtitle", title: "English subtitle", type: "Horizontal", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Censored", slug: "censored" },
        { name: "English Subtitle", slug: "english-subtitle" },
        { name: "High Definition", slug: "high-definition" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { label: "Mới nhất", value: "new" },
            { label: "24 giờ qua", value: "24h" }
        ],
        category: [
            { label: "Tất cả", value: "" },
            { label: "Censored", value: "censored" },
            { label: "English Subtitle", value: "english-subtitle" }
        ]
    });
}

// =============================================================================
// NHÓM 2: SINH URL (App gọi hàm → nhận URL → tự fetch HTTP)
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = _safeJsonParse(filtersJson, {});
    var page = filters.page || 1;
    var query = ["ac=detail", "pg=" + encodeURIComponent(page)];

    if (filters.category) {
        query.push("t=" + encodeURIComponent(filters.category));
    } else if (slug && slug !== "moi-cap-nhat") {
        query.push("t=" + encodeURIComponent(slug));
    }

    if (filters.sort === "24h") {
        query.push("h=24");
    }

    return PLUGIN_API_URL + "?" + query.join("&");
}

function getUrlSearch(keyword, filtersJson) {
    var filters = _safeJsonParse(filtersJson, {});
    var page = filters.page || 1;
    return PLUGIN_API_URL + "?ac=detail&wd=" + encodeURIComponent(keyword || "") + "&pg=" + encodeURIComponent(page);
}

function getUrlDetail(slug) {
    // Nếu slug là URL embed/stream trực tiếp thì trả về chính nó để parseDetailResponse xử lý
    if (/^https?:\/\//i.test(String(slug || ""))) {
        return String(slug);
    }
    if (/^\d+$/.test(String(slug || ""))) {
        return PLUGIN_API_URL + "?ac=detail&ids=" + encodeURIComponent(slug);
    }
    return PLUGIN_API_URL + "?ac=detail&wd=" + encodeURIComponent(slug || "");
}

function getUrlCategories() {
    return PLUGIN_API_URL + "?ac=list";
}

function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

function _safeJsonParse(input, fallback) {
    if (!input) return fallback;
    if (typeof input === "object") return input;
    try {
        return JSON.parse(String(input));
    } catch (e) {
        return fallback;
    }
}

function _joinArray(val) {
    if (!val) return "";
    if (Array.isArray(val)) return val.join(", ");
    return String(val);
}

/**
 * Chuyển đổi cấu trúc episodes object:
 * { "VIP #1": { server_name: "VIP #1", server_data: { "Full": { name: "Full", slug: "full", link_embed: "..." } } } }
 * sang mảng chuẩn:
 * [{ name: "VIP #1", episodes: [{ id, name, slug }] }]
 */
function _mapEpisodesObject(episodesObj) {
    var servers = [];
    if (!episodesObj) return servers;

    // Trường hợp episodes là object (như data mẫu)
    if (!Array.isArray(episodesObj) && typeof episodesObj === "object") {
        var serverKeys = Object.keys(episodesObj);
        for (var i = 0; i < serverKeys.length; i++) {
            var sKey = serverKeys[i];
            var sBlock = episodesObj[sKey] || {};
            var sName = sBlock.server_name || sKey || ("Server " + (i + 1));
            var epList = [];

            var epData = sBlock.server_data;
            if (epData && !Array.isArray(epData) && typeof epData === "object") {
                var epKeys = Object.keys(epData);
                for (var j = 0; j < epKeys.length; j++) {
                    var epItem = epData[epKeys[j]] || {};
                    var epUrl = epItem.link_embed || epItem.link_m3u8 || "";
                    if (epUrl) {
                        epList.push({
                            id: epUrl,
                            name: epItem.name || epKeys[j] || ("Tập " + (j + 1)),
                            slug: epItem.slug || epKeys[j] || ("ep-" + (j + 1))
                        });
                    }
                }
            } else if (Array.isArray(epData)) {
                for (var k = 0; k < epData.length; k++) {
                    var arrEp = epData[k] || {};
                    var arrUrl = arrEp.link_embed || arrEp.link_m3u8 || "";
                    if (arrUrl) {
                        epList.push({
                            id: arrUrl,
                            name: arrEp.name || ("Tập " + (k + 1)),
                            slug: arrEp.slug || ("ep-" + (k + 1))
                        });
                    }
                }
            }

            if (epList.length > 0) {
                servers.push({
                    name: sName,
                    episodes: epList
                });
            }
        }
    }

    return servers;
}

function parseListResponse(rawText) {
    try {
        var trimmed = (rawText && String(rawText).trim()) ? String(rawText).trim() : "";
        var data = trimmed ? JSON.parse(trimmed) : MOCK_RAW_DATA;
        var rawList = data.list || [];
        var items = [];

        for (var i = 0; i < rawList.length; i++) {
            var m = rawList[i];
            items.push({
                id: String(m.slug || m.id || i),
                title: m.name || m.origin_name || "Không có tiêu đề",
                posterUrl: m.poster_url || m.thumb_url || "",
                subtitle: m.type_name || m.quality || ""
            });
        }

        var currentPage = parseInt(data.page || 1, 10) || 1;
        var totalPages = parseInt(data.pagecount || 1, 10) || 1;

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages
            }
        });
    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }
}

function parseSearchResponse(rawText) {
    return parseListResponse(rawText);
}

function parseMovieDetail(rawText) {
    try {
        var trimmed = (rawText && String(rawText).trim()) ? String(rawText).trim() : "";
        var data = trimmed ? JSON.parse(trimmed) : MOCK_RAW_DATA;

        var m = null;
        if (data.list && data.list.length > 0) {
            m = data.list[0];
        } else if (data.data) {
            m = data.data;
        } else {
            m = data;
        }

        var servers = _mapEpisodesObject(m.episodes);

        return JSON.stringify({
            id: String(m.slug || m.id || ""),
            title: m.name || m.origin_name || "Tên phim",
            posterUrl: m.poster_url || m.thumb_url || "",
            backdropUrl: m.thumb_url || m.poster_url || "",
            description: m.description || "",
            servers: servers,
            quality: m.quality || "HD",
            year: parseInt(m.year || 0, 10) || 0,
            rating: 0,
            status: m.status || "",
            duration: m.time || "",
            casts: _joinArray(m.actor),
            director: _joinArray(m.director),
            category: _joinArray(m.category) || m.type_name || ""
        });
    } catch (e) {
        return JSON.stringify({
            id: "",
            title: "",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: []
        });
    }
}

function parseDetailResponse(rawInput) {
    if (!rawInput) {
        return JSON.stringify({ url: "", headers: {}, subtitles: [] });
    }

    var trimmed = String(rawInput).trim();

    // Nếu episode.id truyền thẳng link_embed (vd: https://upload18.to/play/index/ofes-049-sub)
    if (/^https?:\/\//i.test(trimmed)) {
        var isEmbedPage = trimmed.indexOf("/play/") !== -1 || trimmed.indexOf("embed") !== -1;
        return JSON.stringify({
            url: trimmed,
            isEmbed: isEmbedPage,
            headers: {
                "Referer": PLUGIN_BASE_URL + "/",
                "User-Agent": "Mozilla/5.0"
            },
            subtitles: []
        });
    }

    // Nếu nhận nguyên JSON chi tiết thì tự rút link_embed đầu tiên
    try {
        var detail = JSON.parse(parseMovieDetail(trimmed));
        if (detail.servers && detail.servers.length > 0 && detail.servers[0].episodes.length > 0) {
            return parseDetailResponse(detail.servers[0].episodes[0].id);
        }
    } catch (e) {}

    return JSON.stringify({ url: "", headers: {}, subtitles: [] });
}

function parseEmbedResponse(html, sourceUrl) {
    if (!html) {
        return JSON.stringify({ url: "", isEmbed: false });
    }

    var m3u8Match = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i);
    if (m3u8Match) {
        return JSON.stringify({
            url: m3u8Match[1],
            isEmbed: false,
            mimeType: "application/x-mpegURL",
            headers: { "Referer": sourceUrl || (PLUGIN_BASE_URL + "/") }
        });
    }

    var mp4Match = html.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/i);
    if (mp4Match) {
        return JSON.stringify({
            url: mp4Match[1],
            isEmbed: false,
            mimeType: "video/mp4",
            headers: { "Referer": sourceUrl || (PLUGIN_BASE_URL + "/") }
        });
    }

    // Nếu không bắt được stream trực tiếp thì trả về chính sourceUrl để phát qua WebView/Embed
    if (sourceUrl && /^https?:\/\//i.test(sourceUrl)) {
        return JSON.stringify({
            url: sourceUrl,
            isEmbed: false,
            headers: { "Referer": PLUGIN_BASE_URL + "/" }
        });
    }

    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(rawText) {
    try {
        var data = JSON.parse(rawText || "{}");
        var list = data.category || data.class || [];
        var result = [];
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (typeof item === "string") {
                result.push({
                    id: item,
                    name: item,
                    slug: item.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                });
            } else if (item && typeof item === "object") {
                result.push({
                    id: String(item.type_id || item.id || i),
                    name: item.type_name || item.name || "",
                    slug: item.slug || String(item.type_id || i)
                });
            }
        }
        return JSON.stringify(result);
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
