// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_API = "https://avdbapi.com/api.php/provide/vod";
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi",
        "name": "AVDB JAV",
        "version": "1.0.7",
        "baseUrl": BASE_API,
        "iconUrl": "https://avdbapi.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "embed"
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
// URL GENERATION
// =============================================================================

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
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_API + "?ac=detail&wd=" + encodeURIComponent(keyword) + "&pg=" + page + "&pagesize=24";
}

/**
 * Nhận episodeId:
 * - Nếu là link_embed (vd: https://upload18.to/play/index/ofes-049-sub): trả về chính URL để fetch
 * - Nếu là numeric id hoặc slug/code: gọi API chi tiết để lấy link_embed
 */
function getUrlDetail(episodeId) {
    if (!episodeId) return "";
    var idStr = String(episodeId).trim();

    if (idStr.indexOf("http://") === 0 || idStr.indexOf("https://") === 0) {
        return idStr;
    }
    if (/^\d+$/.test(idStr)) {
        return BASE_API + "?ac=detail&ids=" + idStr;
    }
    return BASE_API + "?ac=detail&code=" + encodeURIComponent(idStr) + "&pagesize=1";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// HELPERS
// =============================================================================

function getOriginFromUrl(url, fallback) {
    var defaultOrigin = fallback || "https://upload18.to/";
    if (!url) return defaultOrigin;
    var match = String(url).match(/^(https?:\/\/[^\/]+)/i);
    return match ? (match[1] + "/") : defaultOrigin;
}

function extractStreamUrl(text) {
    if (!text) return "";
    // Tìm link .m3u8 hoặc .mp4 trực tiếp trong HTML/JS/JSON
    var m3u8Match = text.match(/["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*?)["']/i);
    if (m3u8Match) return m3u8Match[1];

    var mp4Match = text.match(/["'](https?:\/\/[^"'\s]+\.mp4[^"'\s]*?)["']/i);
    if (mp4Match) return mp4Match[1];

    return "";
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var list = response.list || [];

        var movies = list.map(function (item) {
            return {
                id: String(item.id || item.slug || item.movie_code || ""),
                title: item.name || item.origin_name || "",
                posterUrl: item.poster_url || item.thumb_url || "",
                backdropUrl: item.thumb_url || item.poster_url || "",
                year: parseInt(item.year) || 0,
                quality: item.quality || "HD",
                episode_current: item.status || "",
                lang: item.movie_code || ""
            };
        });

        var currentPage = parseInt(response.page) || 1;
        var totalItems = parseInt(response.total) || 0;
        var itemsPerPage = parseInt(response.limit) || 24;
        var totalPages = parseInt(response.pagecount) || Math.ceil(totalItems / itemsPerPage) || 1;

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

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var list = response.list || [];
        if (list.length === 0) return "null";

        var movie = list[0];
        var servers = [];
        var eps = movie.episodes;

        if (eps) {
            var serverEpisodes = [];
            var serverData = eps.server_data || {};

            for (var epName in serverData) {
                if (serverData.hasOwnProperty(epName)) {
                    var epInfo = serverData[epName] || {};
                    var embedUrl = epInfo.link_embed || epInfo.link_m3u8 || "";
                    if (embedUrl) {
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
                    name: eps.server_name || "VIP #1",
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
            ? movie.director.filter(function (d) { return d && d !== "Updating"; }).join(", ")
            : (movie.director || "");
        var actors = Array.isArray(movie.actor)
            ? movie.actor.filter(function (a) { return a && a !== "Updating"; }).join(", ")
            : (movie.actor || "");

        return JSON.stringify({
            id: movie.slug || movie.movie_code || String(movie.id || ""),
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
            lang: movie.movie_code || "",
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

// =============================================================================
// STREAM LINK - parseDetailResponse & parseEmbedResponse
// =============================================================================

function parseDetailResponse(embedHtml, pageUrl) {
    try {
        var content = embedHtml || "";
        var url = pageUrl || "";

        // Nếu html có chứa link embed hoặc m3u8/mp4 rõ ràng thì ưu tiên bắt
        var streamMatch = content.match(/["'](https?:\/\/[^"'\s]+\.(?:m3u8|mp4)[^"'\s]*?)["']/i);
        if (streamMatch) {
            return JSON.stringify({
                url: streamMatch[1],
                isEmbed: false,
                headers: {
                    "Referer": getOriginFromUrl(url || streamMatch[1], "https://upload18.to/"),
                    "User-Agent": DEFAULT_UA
                },
                subtitles: []
            });
        }

        // Nếu content chính là URL embed (hoặc có pageUrl từ app)
        var embedTarget = url || (content.trim().indexOf("http") === 0 ? content.trim() : "");
        if (embedTarget) {
            return JSON.stringify({
                url: embedTarget,
                isEmbed: true,
                headers: {
                    "Referer": getOriginFromUrl(embedTarget, "https://upload18.to/"),
                    "User-Agent": DEFAULT_UA
                },
                subtitles: []
            });
        }

        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false });
    }
}

function parseEmbedResponse(embedResponse, sourceUrl) {
    try {
        var content = embedResponse || "";
        var referer = getOriginFromUrl(sourceUrl, "https://upload18.to/");
        var headers = {
            "Referer": referer,
            "User-Agent": DEFAULT_UA
        };

        // Nếu response là m3u8 playlist
        if (content.indexOf("#EXTM3U") !== -1 || content.indexOf("#EXT-X-") !== -1) {
            return JSON.stringify({
                url: sourceUrl || "",
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: headers,
                subtitles: []
            });
        }

        // Nếu response chứa link m3u8/mp4
        var streamUrl = extractStreamUrl(content);
        if (streamUrl) {
            return JSON.stringify({
                url: streamUrl,
                isEmbed: false,
                mimeType: streamUrl.indexOf(".m3u8") !== -1 ? "application/x-mpegURL" : "video/mp4",
                headers: headers,
                subtitles: []
            });
        }

        // Nếu response là JSON có trường url / link / stream / file
        if (content.trim().charAt(0) === "{") {
            try {
                var obj = JSON.parse(content);
                var candidate = obj.url || obj.link || obj.stream || obj.file || "";
                if (candidate) {
                    var looksLikeEmbed = candidate.indexOf(".m3u8") === -1 && candidate.indexOf(".mp4") === -1;
                    return JSON.stringify({
                        url: candidate,
                        isEmbed: looksLikeEmbed,
                        headers: headers,
                        subtitles: []
                    });
                }
            } catch (e) {}
        }

        return JSON.stringify({ url: "", isEmbed: false });
    } catch (error) {
        return "{}";
    }
}

// =============================================================================
// CATEGORIES / COUNTRIES / YEARS
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
