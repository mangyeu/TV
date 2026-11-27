var BASE_API = "https://avdbapi.com/api.php/provide/vod";
var DEFAULT_HEADERS = {
    "Referer": "https://upload18.org/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
};

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi",
        "name": "AVDB JAV",
        "version": "1.0.0",
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
        { slug: "1", title: "Censored", type: "Horizontal", path: "category" },
        { slug: "2", title: "Uncensored", type: "Horizontal", path: "category" },
        { slug: "3", title: "Uncensored Leaked", type: "Horizontal", path: "category" },
        { slug: "4", title: "Amateur", type: "Horizontal", path: "category" },
        { slug: "5", title: "Chinese AV", type: "Horizontal", path: "category" },
        { slug: "6", title: "Western", type: "Horizontal", path: "category" },
        { slug: "latest", title: "Mới Cập Nhật", type: "Grid", path: "latest" }
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
        category: [],
        year: []
    });
}

// =============================================================================
// NHÓM 2: SINH URL (App gọi hàm → nhận URL → tự fetch HTTP)
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var url = BASE_API + "?ac=detail&pg=" + page + "&pagesize=24";

        if (/^[1-6]$/.test(slug)) {
            url += "&t=" + slug;
        } else if (filters.category) {
            url += "&t=" + filters.category;
        }

        if (filters.year) url += "&year=" + encodeURIComponent(filters.year);
        if (filters.sort) url += "&sort_direction=" + encodeURIComponent(filters.sort);

        return url;
    } catch (e) {
        return BASE_API + "?ac=detail&pg=1&pagesize=24";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        return BASE_API + "?ac=detail&wd=" + encodeURIComponent(keyword || "") + "&pg=" + page + "&pagesize=24";
    } catch (e) {
        return BASE_API + "?ac=detail&wd=" + encodeURIComponent(keyword || "") + "&pg=1&pagesize=24";
    }
}

function getUrlDetail(episodeId) {
    if (!episodeId) return "";
    if (episodeId.indexOf("http") === 0) {
        return episodeId;
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
// NHÓM 3: PARSER (App fetch URL xong → ném HTML/JSON thô vào đây → bạn parse)
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var list = response.list || [];

        var items = list.map(function (item) {
            return {
                id: String(item.id || ""),
                title: item.name || "",
                posterUrl: item.poster_url || "",
                backdropUrl: item.thumb_url || "",
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "HD",
                episode_current: item.status || "",
                lang: item.movie_code || ""
            };
        });

        var currentPage = parseInt(response.page, 10) || 1;
        var totalItems = parseInt(response.total, 10) || 0;
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
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function joinCleanList(value) {
    if (Array.isArray(value)) {
        return value.filter(function (v) { return v && v !== "Updating"; }).join(", ");
    }
    return value || "";
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var list = response.list || [];
        if (list.length === 0) return "null";

        var movie = list[0];
        var servers = [];
        var eps = movie.episodes;

        if (eps && eps.server_data) {
            var serverEpisodes = [];
            var serverData = eps.server_data;

            for (var epName in serverData) {
                if (Object.prototype.hasOwnProperty.call(serverData, epName)) {
                    var epInfo = serverData[epName] || {};
                    var embedUrl = epInfo.link_embed || "";
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
                    name: eps.server_name || "Server #1",
                    episodes: serverEpisodes
                });
            }
        }

        return JSON.stringify({
            id: movie.slug || movie.movie_code || String(movie.id || ""),
            title: movie.name || "",
            originName: movie.origin_name || "",
            posterUrl: movie.poster_url || "",
            backdropUrl: movie.thumb_url || "",
            description: (movie.description || "").replace(/<[^>]*>/g, "").trim(),
            year: parseInt(movie.year, 10) || 0,
            rating: 0,
            quality: movie.quality || "HD",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.status || "",
            lang: "",
            category: joinCleanList(movie.category),
            country: joinCleanList(movie.country),
            director: joinCleanList(movie.director),
            casts: joinCleanList(movie.actor),
            status: movie.status || ""
        });
    } catch (e) {
        return "null";
    }
}

function isM3u8Content(text) {
    if (!text) return false;
    return text.indexOf("#EXTM3U") !== -1 || text.indexOf("#EXT-X-") !== -1;
}

function parseDetailResponse(embedHtml, pageUrl) {
    try {
        if (isM3u8Content(embedHtml)) {
            return JSON.stringify({
                url: pageUrl || "",
                isEmbed: false,
                headers: DEFAULT_HEADERS,
                subtitles: []
            });
        }

        if (embedHtml.indexOf("PLAYER_CONFIG") !== -1 || embedHtml.indexOf("jwplayer") !== -1) {
            return JSON.stringify({
                url: pageUrl || "",
                isEmbed: true,
                headers: DEFAULT_HEADERS,
                subtitles: []
            });
        }

        var fallbackMatch = embedHtml.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*?)["']/);
        if (fallbackMatch) {
            return JSON.stringify({
                url: fallbackMatch[1],
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: { "Referer": "https://upload18.org/" },
                subtitles: []
            });
        }

        return JSON.stringify({
            url: pageUrl || "",
            isEmbed: true,
            headers: DEFAULT_HEADERS,
            subtitles: []
        });
    } catch (e) {
        return "{}";
    }
}

function parseEmbedResponse(m3u8Content, tokenUrl) {
    try {
        if (isM3u8Content(m3u8Content)) {
            return JSON.stringify({
                url: tokenUrl || "",
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: DEFAULT_HEADERS,
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
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}
