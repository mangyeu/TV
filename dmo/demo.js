// =============================================================================
// VAAPP Plugin: AVDBAPI (avdbapi.com) - Cập nhật theo schema thực tế
// =============================================================================

var BASE_URL = "https://avdbapi.com";
var API_URL = "https://avdbapi.com/api.php/provide/vod";
var THUMB_BASE = "https://upload18.cc/v/";

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi_plugin",
        "name": "AVDBAPI",
        "version": "1.0.1",
        "baseUrl": BASE_URL,
        "iconUrl": "https://avdbapi.com/template/api/lemetu/v2/favicon-32.b434cfc1bf.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "auto" // Hỗ trợ cả m3u8/mp4 trực tiếp lẫn link_embed
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'all', title: 'Mới Cập Nhật', type: 'Horizontal', path: '' },
        { slug: '1', title: 'Censored', type: 'Horizontal', path: '' },
        { slug: '2', title: 'Uncensored', type: 'Horizontal', path: '' },
        { slug: '3', title: 'Uncensored Leaked', type: 'Horizontal', path: '' },
        { slug: '4', title: 'Amateur', type: 'Horizontal', path: '' },
        { slug: '7', title: 'English Subtitle', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'All', slug: 'all' },
        { name: 'Censored', slug: '1' },
        { name: 'Uncensored', slug: '2' },
        { name: 'Uncensored Leaked', slug: '3' },
        { name: 'Amateur', slug: '4' },
        { name: 'Chinese AV', slug: '5' },
        { name: 'Hentai', slug: '6' },
        { name: 'English Subtitle', slug: '7' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'desc' },
            { name: 'Cũ nhất', value: 'asc' }
        ],
        category: []
    });
}

// =============================================================================
// NHÓM 2: SINH URL
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var url = API_URL + "?ac=detail&pg=" + page;

    if (slug && slug !== 'all') {
        if (!isNaN(slug)) {
            url += "&t=" + slug;
        } else {
            url += "&category=" + encodeURIComponent(slug);
        }
    }

    if (filters.sort) {
        url += "&sort_direction=" + encodeURIComponent(filters.sort);
    }
    if (filters.year) {
        url += "&year=" + encodeURIComponent(filters.year);
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return API_URL + "?ac=detail&wd=" + encodeURIComponent(keyword) + "&pg=" + page;
}

function getUrlDetail(slug) {
    return API_URL + "?ac=detail&ids=" + encodeURIComponent(slug);
}

function getUrlCategories() {
    return API_URL;
}

function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

function joinArrayField(val, fallback) {
    if (Array.isArray(val)) {
        var filtered = val.filter(function(x) {
            return x && String(x).toLowerCase() !== "updating";
        });
        return filtered.length > 0 ? filtered.join(", ") : (fallback || "");
    }
    return val ? String(val) : (fallback || "");
}

function buildPosterUrl(item) {
    if (item.posterUrl) return item.posterUrl;
    if (item.thumb) return item.thumb;
    if (item.pic) return item.pic;
    if (item.movie_code) {
        return THUMB_BASE + encodeURIComponent(String(item.movie_code).trim()) + "/thumb.jpg";
    }
    return "";
}

function parseListResponse(responseText) {
    try {
        var data = JSON.parse(responseText);
        var list = data.list || [];
        var items = [];

        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var poster = buildPosterUrl(item);

            items.push({
                id: String(item.id),
                title: item.name || item.origin_name || "",
                posterUrl: poster,
                backdropUrl: poster,
                quality: item.movie_code || "",
                year: item.vod_time ? parseInt(String(item.vod_time).slice(0, 4), 10) || 2026 : 2026
            });
        }

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: parseInt(data.page, 10) || 1,
                totalPages: parseInt(data.pagecount, 10) || 1
            }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(responseText) {
    return parseListResponse(responseText);
}

/**
 * Hỗ trợ episodes ở dạng:
 * - Object: { server_name: "VIP #1", server_data: { Full: { slug: "full", link_embed: "...", link_m3u8: "..." } } }
 * - Hoặc Array các server nếu API mở rộng thêm server khác
 */
function parseServersFromEpisodes(episodesObj) {
    var servers = [];
    if (!episodesObj) return servers;

    var rawServers = Array.isArray(episodesObj) ? episodesObj : [episodesObj];

    for (var i = 0; i < rawServers.length; i++) {
        var srv = rawServers[i];
        if (!srv || !srv.server_data) continue;

        var serverName = srv.server_name || ("Server " + (i + 1));
        var serverData = srv.server_data;
        var epKeys = Object.keys(serverData);
        var episodes = [];

        for (var j = 0; j < epKeys.length; j++) {
            var epKey = epKeys[j];
            var epInfo = serverData[epKey] || {};
            var streamUrl = epInfo.link_m3u8 || epInfo.link_embed || epInfo.url || "";

            // Nếu link rỗng, vẫn giữ tập với id là slug hoặc rỗng để tránh crash UI
            var epId = streamUrl || (epInfo.slug ? String(epInfo.slug) : "");

            episodes.push({
                id: epId,
                name: epKey,
                slug: epInfo.slug || epKey
            });
        }

        if (episodes.length > 0) {
            servers.push({
                name: serverName,
                episodes: episodes
            });
        }
    }

    return servers;
}

function parseMovieDetail(responseText) {
    try {
        var data = JSON.parse(responseText);
        var vod = null;

        if (Array.isArray(data.list) && data.list.length > 0) {
            vod = data.list[0];
        } else if (data && data.id) {
            vod = data;
        }

        if (!vod) return "{}";

        var poster = buildPosterUrl(vod);
        var servers = parseServersFromEpisodes(vod.episodes);
        var categoryStr = joinArrayField(vod.category, vod.type_name || "");

        return JSON.stringify({
            id: String(vod.id),
            title: vod.name || vod.origin_name || "",
            posterUrl: poster,
            backdropUrl: poster,
            description: vod.origin_name && vod.origin_name !== vod.name ? vod.origin_name : "",
            servers: servers,
            quality: vod.movie_code || "HD",
            year: vod.vod_time ? parseInt(String(vod.vod_time).slice(0, 4), 10) || 2026 : 2026,
            rating: 8.0,
            status: vod.vod_time ? ("Cập nhật: " + vod.vod_time) : "Full",
            duration: "",
            casts: joinArrayField(vod.actor, ""),
            director: joinArrayField(vod.director, ""),
            category: categoryStr
        });
    } catch (e) {
        return "{}";
    }
}

function parseDetailResponse(responseText) {
    var trimmed = (responseText || "").trim();
    if (!trimmed) {
        return JSON.stringify({ url: "", headers: {}, subtitles: [] });
    }

    // Nếu App truyền thẳng URL stream vào đây
    if (trimmed.indexOf("http") === 0 && trimmed.indexOf("{") !== 0) {
        var isDirect = trimmed.indexOf(".m3u8") !== -1 || trimmed.indexOf(".mp4") !== -1;
        return JSON.stringify({
            url: trimmed,
            isEmbed: !isDirect,
            mimeType: trimmed.indexOf(".m3u8") !== -1 ? "application/x-mpegURL" : "",
            headers: {
                "Referer": BASE_URL + "/"
            },
            subtitles: []
        });
    }

    // Nếu App gọi lại URL chi tiết JSON
    try {
        var data = JSON.parse(trimmed);
        var vod = (Array.isArray(data.list) && data.list.length > 0) ? data.list[0] : data;
        var servers = parseServersFromEpisodes(vod && vod.episodes);

        if (servers.length > 0 && servers[0].episodes.length > 0) {
            var firstUrl = servers[0].episodes[0].id || "";
            if (firstUrl.indexOf("http") === 0) {
                var isM3u8 = firstUrl.indexOf(".m3u8") !== -1;
                return JSON.stringify({
                    url: firstUrl,
                    isEmbed: !isM3u8 && firstUrl.indexOf(".mp4") === -1,
                    mimeType: isM3u8 ? "application/x-mpegURL" : "",
                    headers: {
                        "Referer": BASE_URL + "/"
                    },
                    subtitles: []
                });
            }
        }
    } catch (e) {}

    return JSON.stringify({ url: "", headers: {}, subtitles: [] });
}

function parseEmbedResponse(html, sourceUrl) {
    var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/);
    if (m3u8Match) {
        return JSON.stringify({
            url: m3u8Match[1],
            isEmbed: false,
            mimeType: "application/x-mpegURL",
            headers: { "Referer": sourceUrl }
        });
    }
    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(responseText) {
    try {
        var data = JSON.parse(responseText);
        var classes = data.class || [];
        var categories = [];

        for (var i = 0; i < classes.length; i++) {
            var c = classes[i];
            if (c && c.type_name) {
                var slugVal = c.type_id !== undefined ? String(c.type_id) : (c.slug || String(i + 1));
                categories.push({
                    name: String(c.type_name),
                    slug: slugVal
                });
            }
        }
        return JSON.stringify(categories);
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
