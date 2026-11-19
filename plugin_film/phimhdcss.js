function getManifest() {
    return JSON.stringify({
        "id": "kkphim",
        "name": "KKPhim",
        "version": "1.0.2",
        "baseUrl": "https://phimapi.com",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/kkphim.png",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'subteam', title: 'Subteam', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-thuyet-minh', title: 'Phim Thuyết Minh', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-long-tieng', title: 'Phim Lồng Tiếng', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-moi-cap-nhat-v3', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi-cap-nhat-v3' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'TV shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' },
        { name: 'Phim vietsub', slug: 'phim-vietsub' },
        { name: 'Phim thuyết minh', slug: 'phim-thuyet-minh' },
        { name: 'Phim lồng tiếng', slug: 'phim-long-tieng' },
        { name: 'Subteam', slug: 'subteam' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Thời gian cập nhật', value: 'modified.time' },
            { name: 'Năm phát hành', value: 'year' },
            { name: 'Theo ID', value: '_id' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var limit = parseInt(filters.limit, 10) || 24;

        var listSlugs = [
            'phim-vietsub', 'subteam', 'phim-thuyet-minh', 'phim-long-tieng',
            'phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows', 'phim-chieu-rap',
            'phim-moi-cap-nhat'
        ];

        var typeList = (slug === 'phim-moi') ? 'phim-moi-cap-nhat-v3' : slug;

        if (typeList === 'phim-moi-cap-nhat-v3') {
            return "https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=" + page + "&limit=" + limit;
        }

        var basePath = (listSlugs.indexOf(typeList) !== -1) ? "danh-sach" : "the-loai";
        var url = "https://phimapi.com/v1/api/" + basePath + "/" + encodeURIComponent(typeList) + "?page=" + page + "&limit=" + limit;

        if (filters.country) url += "&country=" + encodeURIComponent(filters.country);
        if (filters.year) url += "&year=" + encodeURIComponent(filters.year);
        if (filters.category) url += "&category=" + encodeURIComponent(filters.category);
        if (filters.sort) url += "&sort_field=" + encodeURIComponent(filters.sort);

        return url;
    } catch (e) {
        return "https://phimapi.com/v1/api/danh-sach/" + encodeURIComponent(slug || "phim-moi-cap-nhat");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var limit = parseInt(filters.limit, 10) || 24;
        var q = encodeURIComponent((keyword || "").trim());
        return "https://phimapi.com/v1/api/tim-kiem?keyword=" + q + "&page=" + page + "&limit=" + limit;
    } catch (e) {
        return "https://phimapi.com/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword || "") + "&page=1&limit=24";
    }
}

function getUrlDetail(slug) {
    return "https://phimapi.com/phim/" + encodeURIComponent(slug || "");
}

function getUrlCategories() {
    return "https://phimapi.com/the-loai";
}

function getUrlCountries() {
    return "https://phimapi.com/quoc-gia";
}

function getUrlYears() {
    // KKPhim không có endpoint trả về danh sách năm; dùng getLocalYearsJson() nếu cần danh sách tĩnh.
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

// =============================================================================
// PARSERS
// =============================================================================

function extractArrayItems(response) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.items)) return response.data.items;
    return [];
}

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = extractArrayItems(response);
        var data = (response && response.data && !Array.isArray(response.data)) ? response.data : {};
        var params = data.params || {};
        var pagination = response.pagination || params.pagination || {};

        var currentPage = parseInt(pagination.currentPage, 10) || 1;
        var totalItems = parseInt(pagination.totalItems, 10) || items.length;
        var itemsPerPage = parseInt(pagination.totalItemsPerPage || pagination.itemsPerPage, 10) || 24;
        var totalPages = parseInt(pagination.totalPages, 10) || Math.max(1, Math.ceil(totalItems / itemsPerPage));

        var movies = items.map(function (item) {
            return {
                id: item.slug || "",
                title: item.name || "",
                posterUrl: getPosterUrl(item.poster_url),
                backdropUrl: getPosterUrl(item.thumb_url),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current: item.episode_current || "",
                lang: item.lang || ""
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
    } catch (error) {
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
        var movie = response.movie || {};
        var episodes = Array.isArray(response.episodes) ? response.episodes : [];

        var servers = [];
        for (var i = 0; i < episodes.length; i++) {
            var server = episodes[i] || {};
            var serverData = Array.isArray(server.server_data) ? server.server_data : [];
            var serverEpisodes = [];

            for (var j = 0; j < serverData.length; j++) {
                var ep = serverData[j] || {};
                var streamUrl = ep.link_m3u8 || ep.link_embed || "";
                if (streamUrl) {
                    serverEpisodes.push({
                        id: streamUrl,
                        name: ep.name || "",
                        slug: ep.slug || "",
                        m3u8: ep.link_m3u8 || "",
                        embed: ep.link_embed || ""
                    });
                }
            }

            if (serverEpisodes.length > 0) {
                servers.push({
                    name: server.server_name || ("Server " + (i + 1)),
                    episodes: serverEpisodes
                });
            }
        }

        var categories = Array.isArray(movie.category)
            ? movie.category.map(function (c) { return c && c.name ? c.name : ""; }).filter(Boolean).join(", ")
            : "";

        var countries = Array.isArray(movie.country)
            ? movie.country.map(function (c) { return c && c.name ? c.name : ""; }).filter(Boolean).join(", ")
            : "";

        var directors = Array.isArray(movie.director) ? movie.director.filter(Boolean).join(", ") : "";
        var actors = Array.isArray(movie.actor) ? movie.actor.filter(Boolean).join(", ") : "";

        var ratingValue = 0;
        var tmdbId = "";
        var tmdbSeason = 0;
        var tmdbType = "";

        if (movie.tmdb && typeof movie.tmdb === "object") {
            if (movie.tmdb.vote_average) ratingValue = parseFloat(movie.tmdb.vote_average) || 0;
            if (movie.tmdb.id) tmdbId = String(movie.tmdb.id);
            if (movie.tmdb.season) tmdbSeason = parseInt(movie.tmdb.season, 10) || 0;
            if (movie.tmdb.type) tmdbType = String(movie.tmdb.type);
        }

        var cleanDescription = String(movie.content || "")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<[^>]*>/g, "")
            .trim();

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            originName: movie.origin_name || "",
            posterUrl: getPosterUrl(movie.poster_url),
            backdropUrl: getPosterUrl(movie.thumb_url),
            description: cleanDescription,
            year: parseInt(movie.year, 10) || 0,
            rating: ratingValue,
            quality: movie.quality || "",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.episode_current || "",
            lang: movie.lang || "",
            category: categories,
            country: countries,
            director: directors,
            casts: actors,
            status: movie.status || "",
            tmdbId: tmdbId,
            tmdbSeason: tmdbSeason,
            tmdbType: tmdbType
        });
    } catch (error) {
        return "null";
    }
}

function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").trim();
    var isHlsOrDirect = /\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw);
    return JSON.stringify({
        url: raw,
        isDirectStream: isHlsOrDirect,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://phimapi.com/"
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    try {
        var parsed = JSON.parse(apiResponseJson || "{}");
        var candidate = parsed.url || parsed.streamUrl || parsed.link_m3u8 || parsed.link_embed || "";
        return resolveStreamData(candidate);
    } catch (e) {
        return resolveStreamData(apiResponseJson);
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = extractArrayItems(response);
        return JSON.stringify(items.map(function (i) {
            return {
                name: i.name || "",
                slug: i.slug || ""
            };
        }));
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = extractArrayItems(response);
        return JSON.stringify(items.map(function (i) {
            return {
                name: i.name || "",
                value: i.slug || ""
            };
        }));
    } catch (e) {
        return "[]";
    }
}

function parseYearsResponse(apiResponseJson) {
    try {
        var items = extractArrayItems(JSON.parse(apiResponseJson));
        return JSON.stringify(items.map(function (i) {
            var val = (typeof i === "object" && i !== null) ? (i.slug || i.value || i.year || i.name) : i;
            var label = (typeof i === "object" && i !== null) ? (i.name || i.year || val) : i;
            return { name: String(label || ""), value: String(val || "") };
        }));
    } catch (e) {
        return "[]";
    }
}

function getPosterUrl(path) {
    if (!path) return "";
    var str = String(path).trim();
    if (!str) return "";
    if (str.indexOf("http://") === 0 || str.indexOf("https://") === 0) return str;
    var cleanPath = str.replace(/^\/+/, "");
    return "https://phimapi.com/image.php?url=" + encodeURIComponent("https://phimimg.com/" + cleanPath);
}
