// =============================================================================
// VAAPP Plugin - AVDBAPI JSON
// =============================================================================

var BASE_URL = "https://avdbapi.com";
var API_ENDPOINT = BASE_URL + "/api.php/provide/vod";
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:161.0) Gecko/20100101 Firefox/161.0";

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi_json",
        "name": "AVDB JAV",
        "version": "1.0.1",
        "baseUrl": API_ENDPOINT,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "latest", title: "Mới Cập Nhật", type: "Horizontal", path: "latest" },
        { slug: "1", title: "Censored", type: "Horizontal", path: "category" },
        { slug: "2", title: "Uncensored", type: "Horizontal", path: "category" },
        { slug: "3", title: "Uncensored Leaked", type: "Horizontal", path: "category" },
        { slug: "4", title: "Amateur", type: "Horizontal", path: "category" },
        { slug: "5", title: "Chinese AV", type: "Horizontal", path: "category" },
        { slug: "6", title: "Western", type: "Grid", path: "category" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Censored", slug: "1" },
        { name: "Uncensored", slug: "2" },
        { name: "Uncensored Leaked", slug: "3" },
        { name: "Amateur", slug: "4" },
        { name: "Chinese AV", slug: "5" },
        { name: "Western", slug: "6" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới nhất", value: "desc" },
            { name: "Cũ nhất", value: "asc" }
        ],
        category: []
    });
}

// =============================================================================
// NHÓM 2: SINH URL
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var limit = filters.limit || 24;
        var url = API_ENDPOINT + "?ac=detail&pg=" + page + "&pagesize=" + limit;

        if (slug && slug !== "latest") {
            url += "&t=" + encodeURIComponent(slug);
        } else if (filters.category) {
            url += "&t=" + encodeURIComponent(filters.category);
        }

        if (filters.year) {
            url += "&year=" + encodeURIComponent(filters.year);
        }
        if (filters.sort) {
            url += "&sort_direction=" + encodeURIComponent(filters.sort);
        }

        return url;
    } catch (e) {
        return API_ENDPOINT + "?ac=detail&pg=1&pagesize=24";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var limit = filters.limit || 24;
    return API_ENDPOINT + "?ac=detail&wd=" + encodeURIComponent(keyword || "") + "&pg=" + page + "&pagesize=" + limit;
}

function getUrlDetail(episodeOrMovieId) {
    if (!episodeOrMovieId) return "";
    var target = String(episodeOrMovieId).trim();
    if (target.indexOf("http") === 0) {
        return target;
    }
    if (/^\d+$/.test(target)) {
        return API_ENDPOINT + "?ac=detail&ids=" + target;
    }
    return API_ENDPOINT + "?ac=detail&code=" + encodeURIComponent(target) + "&pagesize=1";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

function joinCleanArray(val) {
    if (Array.isArray(val)) {
        return val
            .map(function (x) { return String(x || "").trim(); })
            .filter(function (x) { return x && x.toLowerCase() !== "updating"; })
            .join(", ");
    }
    return String(val || "").trim();
}

function getEmbedReferer(url) {
    if (!url) return BASE_URL + "/";
    var match = String(url).match(/^(https?:\/\/[^\/]+)/i);
    return match ? (match[1] + "/") : (BASE_URL + "/");
}

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var list = Array.isArray(response.list) ? response.list : [];

        var items = list.map(function (item) {
            return {
                id: String(item.id || item.slug || item.movie_code || ""),
                title: item.name || item.origin_name || "",
                posterUrl: item.poster_url || item.thumb_url || "",
                backdropUrl: item.thumb_url || item.poster_url || "",
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "HD",
                episode_current: item.status || item.time || "",
                lang: item.movie_code || ""
            };
        });

        var currentPage = parseInt(response.page, 10) || 1;
        var totalItems = parseInt(response.total, 10) || items.length;
        var itemsPerPage = parseInt(response.limit, 10) || 24;
        var totalPages = parseInt(response.pagecount, 10) || Math.max(1, Math.ceil(totalItems / itemsPerPage));

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var list = Array.isArray(response.list) ? response.list : [];
        if (list.length === 0) return "null";

        var movie = list[0];
        var servers = [];
        var eps = movie.episodes;

        if (eps && eps.server_data && typeof eps.server_data === "object") {
            var serverEpisodes = [];
            var serverData = eps.server_data;

            for (var epName in serverData) {
                if (Object.prototype.hasOwnProperty.call(serverData, epName)) {
                    var epInfo = serverData[epName] || {};
                    var streamOrEmbedUrl = epInfo.link_embed || epInfo.link_m3u8 || "";
                    if (streamOrEmbedUrl) {
                        serverEpisodes.push({
                            id: streamOrEmbedUrl,
                            name: epName,
                            slug: epInfo.slug || epName.toLowerCase().replace(/\s+/g, "-")
                        });
                    }
                }
            }

            if (serverEpisodes.length > 0) {
                servers.push({
                    name: eps.server_name || eps.type_name || "Server #1",
                    episodes: serverEpisodes
                });
            }
        }

        var cleanDesc = String(movie.description || "").replace(/<[^>]*>/g, "").trim();

        return JSON.stringify({
            id: String(movie.id || movie.slug || movie.movie_code || ""),
            title: movie.name || "",
            originName: movie.origin_name || "",
            posterUrl: movie.poster_url || movie.thumb_url || "",
            backdropUrl: movie.thumb_url || movie.poster_url || "",
            description: cleanDesc,
            year: parseInt(movie.year, 10) || 0,
            rating: 0,
            quality: movie.quality || "HD",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.status || "",
            lang: joinCleanArray(movie.type_name) || "",
            category: joinCleanArray(movie.category),
            country: joinCleanArray(movie.country),
            director: joinCleanArray(movie.director),
            casts: joinCleanArray(movie.actor),
            status: movie.status || ""
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(htmlOrStream, pageUrl) {
    try {
        var content = String(htmlOrStream || "");
        var referer = getEmbedReferer(pageUrl);
        var defaultHeaders = {
            "Referer": referer,
            "User-Agent": DEFAULT_UA
        };

        if (content.indexOf("#EXTM3U") !== -1 || content.indexOf("#EXT-X-") !== -1) {
            return JSON.stringify({
                url: pageUrl || "",
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: defaultHeaders,
                subtitles: []
            });
        }

        var m3u8Match = content.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*?)["']/i);
        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1],
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: defaultHeaders,
                subtitles: []
            });
        }

        return JSON.stringify({
            url: pageUrl || "",
            isEmbed: true,
            headers: defaultHeaders,
            subtitles: []
        });
    } catch (e) {
        return "{}";
    }
}

function parseEmbedResponse(embedContent, sourceUrl) {
    try {
        var content = String(embedContent || "");
        var referer = getEmbedReferer(sourceUrl);
        var defaultHeaders = {
            "Referer": referer,
            "User-Agent": DEFAULT_UA
        };

        if (content.indexOf("#EXTM3U") !== -1 || content.indexOf("#EXT-X-") !== -1) {
            return JSON.stringify({
                url: sourceUrl || "",
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: defaultHeaders,
                subtitles: []
            });
        }

        var fileMatch = content.match(/["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*?)["']/i);
        if (fileMatch) {
            return JSON.stringify({
                url: fileMatch[1],
                isEmbed: false,
                headers: defaultHeaders,
                subtitles: []
            });
        }

        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) {
        return "{}";
    }
}

function parseCategoriesResponse(apiResponseJson) {
    return getPrimaryCategories();
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
        years.push({ name: String(i), value: String(i) });
    }
    return JSON.stringify(years);
}
