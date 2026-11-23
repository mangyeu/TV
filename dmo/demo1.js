// NguonC plugin following the working Kkphim.js interface.
// API URLs/response shapes should be verified against the source site before deployment.
function getManifest() {
    return JSON.stringify({
        "id": "nguonc",
        "name": "Phim NguonC",
        "version": "1.1.5",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonC.png",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-moi", title: "Phim Mới", type: "Grid", path: "api/films" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "api/films" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "api/films" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim mới", slug: "phim-moi" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới cập nhật", value: "updated" },
            { name: "Năm phát hành", value: "year" }
        ]
    });
}

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var type = "";
        if (slug === "phim-le") type = "single";
        else if (slug === "phim-bo") type = "series";
        var url = "https://phim.nguonc.com/api/films?page=" + page;
        if (type) url += "&type=" + encodeURIComponent(type);
        if (filters.year) url += "&year=" + encodeURIComponent(filters.year);
        return url;
    } catch (e) {
        return "https://phim.nguonc.com/api/films?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        return "https://phim.nguonc.com/api/films?search=" +
            encodeURIComponent((keyword || "").trim()) + "&page=" + page;
    } catch (e) {
        return "https://phim.nguonc.com/api/films?search=" +
            encodeURIComponent(keyword || "") + "&page=1";
    }
}

function getUrlDetail(slug) {
    return "https://phim.nguonc.com/api/film/" + encodeURIComponent(slug || "");
}

function getUrlCategories() {
    return "";
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var y = currentYear; y >= 1970; y--) {
        years.push({ name: String(y), value: String(y) });
    }
    return JSON.stringify(years);
}

function extractArrayItems(response) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.films)) return response.films;
    if (Array.isArray(response.data)) {
        if (Array.isArray(response.data)) return response.data;
    }
    if (response.data && Array.isArray(response.data.items)) return response.data.items;
    if (response.data && Array.isArray(response.data.films)) return response.data.films;
    return [];
}

function getPosterUrl(path, cdnDomain, fallbackPath) {
    var raw = path || fallbackPath || "";
    if (!raw) return "";
    var str = String(raw).trim();
    if (!str) return "";
    if (str.indexOf("http://") === 0 || str.indexOf("https://") === 0) return str;
    var base = String(cdnDomain || "https://img.nguonc.com").replace(/\/+$/, "");
    return base + "/" + str.replace(/^\/+/, "");
}

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = extractArrayItems(response);
        var data = response && response.data && !Array.isArray(response.data) ? response.data : {};
        var pagination = response.pagination || data.pagination || {};
        var currentPage = parseInt(pagination.currentPage || response.page, 10) || 1;
        var totalItems = parseInt(pagination.totalItems || response.total, 10) || items.length;
        var itemsPerPage = parseInt(pagination.totalItemsPerPage || pagination.itemsPerPage || response.limit, 10) || 24;
        var totalPages = parseInt(pagination.totalPages, 10) || Math.max(1, Math.ceil(totalItems / itemsPerPage));

        var movies = items.map(function (item) {
            item = item || {};
            return {
                id: item.slug || item.id || "",
                title: item.name || item.title || "",
                posterUrl: getPosterUrl(item.thumb_url || item.poster_url || item.image),
                backdropUrl: getPosterUrl(item.poster_url || item.thumb_url || item.image),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current: item.episode_current || "",
                lang: item.language || item.lang || ""
            };
        });

        return JSON.stringify({
            items: movies,
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
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 }
        });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.movie || response.film || response.data || response;
        var episodeData = movie.episodes || response.episodes || [];
        var servers = [];

        // Normalize common episode/server layouts while preserving source URLs.
        if (Array.isArray(episodeData)) {
            for (var i = 0; i < episodeData.length; i++) {
                var server = episodeData[i] || {};
                var serverData = server.server_data || server.items || server.episodes || [];
                if (!Array.isArray(serverData) && serverData && typeof serverData === "object") {
                    serverData = Object.keys(serverData).map(function (key) { return serverData[key]; });
                }
                var serverEpisodes = [];
                for (var j = 0; j < serverData.length; j++) {
                    var ep = serverData[j] || {};
                    var embedUrl = ep.embed || ep.link_embed || ep.url || ep.link || "";
                    var directUrl = ep.m3u8 || ep.link_m3u8 || ep.file || "";
                    var sourceUrl = embedUrl || directUrl;
                    if (sourceUrl) {
                        serverEpisodes.push({
                            id: sourceUrl,
                            name: ep.name || ep.episode || ("Tập " + (j + 1)),
                            slug: ep.slug || "",
                            m3u8: directUrl,
                            embed: embedUrl
                        });
                    }
                }
                if (serverEpisodes.length) {
                    servers.push({
                        name: server.server_name || server.name || ("Server " + (i + 1)),
                        episodes: serverEpisodes
                    });
                }
            }
        }

        var categories = Array.isArray(movie.category)
            ? movie.category.map(function (c) { return c && c.name ? c.name : c; }).filter(Boolean).join(", ")
            : (movie.category || "");
        var countries = Array.isArray(movie.country)
            ? movie.country.map(function (c) { return c && c.name ? c.name : c; }).filter(Boolean).join(", ")
            : (movie.country || "");
        var directors = Array.isArray(movie.director) ? movie.director.filter(Boolean).join(", ") : (movie.director || "");
        var actors = Array.isArray(movie.actor) ? movie.actor.filter(Boolean).join(", ") : (movie.actor || "");

        return JSON.stringify({
            id: movie.slug || movie.id || "",
            title: movie.name || movie.title || "",
            originName: movie.origin_name || "",
            posterUrl: getPosterUrl(movie.poster_url || movie.thumb_url || movie.image),
            backdropUrl: getPosterUrl(movie.thumb_url || movie.poster_url || movie.image),
            description: String(movie.content || movie.description || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim(),
            year: parseInt(movie.year, 10) || 0,
            rating: parseFloat(movie.rating || movie.tmdb && movie.tmdb.vote_average) || 0,
            quality: movie.quality || "",
            duration: movie.time || movie.duration || "",
            servers: servers,
            episode_current: movie.episode_current || "",
            lang: movie.lang || movie.language || "",
            category: categories,
            country: countries,
            director: directors,
            casts: actors,
            status: movie.status || ""
        });
    } catch (e) {
        return "null";
    }
}

function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").trim();
    var direct = /\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw);
    return JSON.stringify({
        url: raw,
        isDirectStream: direct,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://phim.nguonc.com/"
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    try {
        var parsed = JSON.parse(apiResponseJson || "{}");
        var candidate = parsed.url || parsed.streamUrl || parsed.link_m3u8 || parsed.m3u8 || parsed.embed || parsed.link_embed || "";
        return resolveStreamData(candidate);
    } catch (e) {
        return resolveStreamData(apiResponseJson);
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        return JSON.stringify(extractArrayItems(JSON.parse(apiResponseJson)).map(function (i) {
            return { name: i.name || "", slug: i.slug || "" };
        }));
    } catch (e) { return "[]"; }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        return JSON.stringify(extractArrayItems(JSON.parse(apiResponseJson)).map(function (i) {
            return { name: i.name || "", value: i.slug || i.code || "" };
        }));
    } catch (e) { return "[]"; }
}

function parseYearsResponse(apiResponseJson) {
    try {
        return JSON.stringify(extractArrayItems(JSON.parse(apiResponseJson)).map(function (i) {
            var value = (typeof i === "object" && i !== null) ? (i.slug || i.value || i.year || i.name) : i;
            var name = (typeof i === "object" && i !== null) ? (i.name || i.year || value) : i;
            return { name: String(name || ""), value: String(value || "") };
        }));
    } catch (e) { return "[]"; }
}
