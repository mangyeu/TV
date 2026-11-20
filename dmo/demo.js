// =============================================================================
// NGUONC PLUGIN FOR VAXPLAYER
// Version: 1.1.8
// =============================================================================

function getManifest() {
    return JSON.stringify({
        id: "nguonc",
        name: "Phim NguonC",
        version: "1.1.8",
        baseUrl: "https://phim.nguonc.com",
        iconUrl: "",
        isEnabled: true,
        type: "MOVIE"
    });
}

// =============================================================================
// HOME
// =============================================================================

function getHomeSections() {
    return JSON.stringify([
        {
            slug: "phim-moi-cap-nhat",
            title: "Phim Mới Cập Nhật",
            type: "Grid",
            path: "films"
        },
        {
            slug: "phim-bo",
            title: "Phim Bộ",
            type: "Horizontal",
            path: "films"
        },
        {
            slug: "phim-le",
            title: "Phim Lẻ",
            type: "Horizontal",
            path: "films"
        },
        {
            slug: "hoat-hinh",
            title: "Hoạt Hình",
            type: "Horizontal",
            path: "films"
        },
        {
            slug: "phim-chieu-rap",
            title: "Phim Chiếu Rạp",
            type: "Horizontal",
            path: "films"
        },
        {
            slug: "tv-shows",
            title: "TV Shows",
            type: "Horizontal",
            path: "films"
        }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        {
            name: "Phim mới cập nhật",
            slug: "phim-moi-cap-nhat"
        },
        {
            name: "Phim bộ",
            slug: "phim-bo"
        },
        {
            name: "Phim lẻ",
            slug: "phim-le"
        },
        {
            name: "Hoạt hình",
            slug: "hoat-hinh"
        },
        {
            name: "Phim chiếu rạp",
            slug: "phim-chieu-rap"
        },
        {
            name: "TV Shows",
            slug: "tv-shows"
        }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            {
                name: "Mới cập nhật",
                value: "updated"
            },
            {
                name: "Năm phát hành",
                value: "year"
            }
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

        var category = slug || "phim-moi-cap-nhat";

        if (category === "phim-moi" ||
            category === "phim-moi-cap-nhat-v3") {
            category = "phim-moi-cap-nhat";
        }

        var url =
            "https://phim.nguonc.com/api/films/" +
            encodeURIComponent(category) +
            "?page=" + page;

        if (filters.year) {
            url += "&year=" + encodeURIComponent(filters.year);
        }

        if (filters.country) {
            url += "&country=" + encodeURIComponent(filters.country);
        }

        if (filters.category) {
            url += "&category=" + encodeURIComponent(filters.category);
        }

        if (filters.sort) {
            url += "&sort=" + encodeURIComponent(filters.sort);
        }

        return url;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");

        var page = parseInt(filters.page, 10) || 1;

        var query = encodeURIComponent(
            String(keyword || "").trim()
        );

        return "https://phim.nguonc.com/api/search?keyword=" +
            query +
            "&page=" + page;

    } catch (e) {
        return "https://phim.nguonc.com/api/search?keyword=" +
            encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    return "https://phim.nguonc.com/api/film/" +
        encodeURIComponent(slug || "");
}

function getUrlCategories() {
    return "https://phim.nguonc.com/api/categories";
}

function getUrlCountries() {
    return "https://phim.nguonc.com/api/countries";
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var currentYear = new Date().getFullYear();

    var years = [];

    for (var y = currentYear; y >= 1970; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }

    return JSON.stringify(years);
}

// =============================================================================
// HELPERS
// =============================================================================

function safeString(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function safeParseJSON(value) {
    try {
        if (typeof value === "object" && value !== null) {
            return value;
        }

        return JSON.parse(value || "{}");

    } catch (e) {
        return {};
    }
}

function normalizeUrl(url) {
    var value = safeString(url).trim();

    if (!value) {
        return "";
    }

    if (value.indexOf("//") === 0) {
        return "https:" + value;
    }

    if (value.indexOf("http://") === 0 ||
        value.indexOf("https://") === 0) {
        return value;
    }

    if (value.indexOf("/") === 0) {
        return "https://phim.nguonc.com" + value;
    }

    return value;
}

function getMovieImage(movie, type) {
    if (!movie) {
        return "";
    }

    var image = "";

    if (type === "poster") {
        image =
            movie.poster_url_webp ||
            movie.poster_url ||
            movie.thumb_url_webp ||
            movie.thumb_url ||
            "";
    } else {
        image =
            movie.thumb_url_webp ||
            movie.thumb_url ||
            movie.poster_url_webp ||
            movie.poster_url ||
            "";
    }

    return normalizeUrl(image);
}

function extractArrayItems(response) {
    if (!response) {
        return [];
    }

    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response.items)) {
        return response.items;
    }

    if (Array.isArray(response.films)) {
        return response.films;
    }

    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (response.data) {
        if (Array.isArray(response.data.items)) {
            return response.data.items;
        }

        if (Array.isArray(response.data.films)) {
            return response.data.films;
        }

        if (Array.isArray(response.data.results)) {
            return response.data.results;
        }
    }

    if (Array.isArray(response.results)) {
        return response.results;
    }

    return [];
}

function extractPagination(response, itemCount) {
    var pagination = {};

    if (response && response.pagination) {
        pagination = response.pagination;
    } else if (response && response.data && response.data.pagination) {
        pagination = response.data.pagination;
    } else if (response && response.data && response.data.params) {
        pagination = response.data.params.pagination || {};
    }

    var currentPage =
        parseInt(
            pagination.currentPage ||
            pagination.current_page ||
            pagination.page,
            10
        ) || 1;

    var totalItems =
        parseInt(
            pagination.totalItems ||
            pagination.total_items ||
            pagination.total ||
            pagination.totalFilms,
            10
        ) || itemCount;

    var itemsPerPage =
        parseInt(
            pagination.itemsPerPage ||
            pagination.totalItemsPerPage ||
            pagination.limit,
            10
        ) || 24;

    var totalPages =
        parseInt(
            pagination.totalPages ||
            pagination.total_pages,
            10
        ) || Math.max(
            1,
            Math.ceil(totalItems / itemsPerPage)
        );

    return {
        currentPage: currentPage,
        totalPages: totalPages,
        totalItems: totalItems,
        itemsPerPage: itemsPerPage
    };
}

function cleanHtml(text) {
    return safeString(text)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();
}

// =============================================================================
// LIST PARSER
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = safeParseJSON(apiResponseJson);

        var items = extractArrayItems(response);

        var pagination = extractPagination(
            response,
            items.length
        );

        var movies = items.map(function (item) {
            item = item || {};

            return {
                id: item.slug || item.id || "",
                title: item.name || item.title || "",
                posterUrl: getMovieImage(item, "poster"),
                backdropUrl: getMovieImage(item, "backdrop"),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current:
                    item.episode_current ||
                    item.current_episode ||
                    "",
                lang:
                    item.language ||
                    item.lang ||
                    "",
                duration: item.time || "",
                description: cleanHtml(item.content || "")
            };
        });

        return JSON.stringify({
            items: movies,
            pagination: pagination
        });

    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 24
            }
        });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

// =============================================================================
// EPISODES
// =============================================================================

function parseEpisodeServers(episodeData) {
    var servers = [];

    if (!Array.isArray(episodeData)) {
        return servers;
    }

    for (var i = 0; i < episodeData.length; i++) {
        var server = episodeData[i] || {};

        var items = [];

        if (Array.isArray(server.items)) {
            items = server.items;
        } else if (Array.isArray(server.server_data)) {
            items = server.server_data;
        } else if (Array.isArray(server.episodes)) {
            items = server.episodes;
        }

        var episodes = [];

        for (var j = 0; j < items.length; j++) {
            var ep = items[j] || {};

            var embedUrl =
                ep.embed ||
                ep.link_embed ||
                ep.url_embed ||
                ep.url ||
                ep.link ||
                ep.m3u8 ||
                ep.link_m3u8 ||
                ep.file ||
                "";

            embedUrl = normalizeUrl(embedUrl);

            if (!embedUrl) {
                continue;
            }

            episodes.push({
                id: embedUrl,
                name: ep.name || String(j + 1),
                slug: ep.slug || "",
                m3u8: ep.link_m3u8 || ep.m3u8 || "",
                embed: embedUrl
            });
        }

        if (episodes.length > 0) {
            servers.push({
                name: server.server_name ||
                    server.name ||
                    ("Server " + (i + 1)),
                episodes: episodes
            });
        }
    }

    return servers;
}

// =============================================================================
// MOVIE DETAIL
// =============================================================================

function parseMovieDetail(apiResponseJson) {
    try {
        var response = safeParseJSON(apiResponseJson);

        var movie = response.movie || {};

        if (response.data && response.data.movie) {
            movie = response.data.movie;
        }

        var episodeData =
            response.episodes ||
            (response.data && response.data.episodes) ||
            [];

        var servers = parseEpisodeServers(episodeData);

        // Categories
        var categories = [];

        if (movie.category) {
            if (Array.isArray(movie.category)) {
                for (var i = 0; i < movie.category.length; i++) {
                    var cat = movie.category[i];

                    if (cat) {
                        categories.push(
                            cat.name || cat.slug || String(cat)
                        );
                    }
                }
            } else if (typeof movie.category === "object") {
                Object.keys(movie.category).forEach(function (key) {
                    var group = movie.category[key];

                    if (group && Array.isArray(group.list)) {
                        group.list.forEach(function (cat) {
                            if (cat && cat.name) {
                                categories.push(cat.name);
                            }
                        });
                    }
                });
            }
        }

        // Countries
        var countries = [];

        if (Array.isArray(movie.country)) {
            countries = movie.country.map(function (country) {
                return country && (
                    country.name ||
                    country.slug ||
                    String(country)
                );
            });
        } else if (movie.country && typeof movie.country === "object") {
            Object.keys(movie.country).forEach(function (key) {
                var country = movie.country[key];

                if (country && country.name) {
                    countries.push(country.name);
                }
            });
        }

        // Directors
        var directors = [];

        if (Array.isArray(movie.director)) {
            directors = movie.director.map(function (d) {
                return typeof d === "object"
                    ? d.name || ""
                    : String(d || "");
            });
        } else if (movie.director) {
            directors = [String(movie.director)];
        }

        // Actors
        var actors = [];

        if (Array.isArray(movie.actor)) {
            actors = movie.actor.map(function (a) {
                return typeof a === "object"
                    ? a.name || ""
                    : String(a || "");
            });
        } else if (movie.actor) {
            actors = [String(movie.actor)];
        }

        // Rating
        var rating = 0;

        if (movie.tmdb && movie.tmdb.vote_average) {
            rating = parseFloat(movie.tmdb.vote_average) || 0;
        } else if (movie.rating) {
            rating = parseFloat(movie.rating) || 0;
        }

        // Description
        var description = cleanHtml(
            movie.content ||
            movie.description ||
            movie.plot ||
            ""
        );

        return JSON.stringify({
            id: movie.slug || movie.id || "",
            title: movie.name || movie.title || "",
            originName:
                movie.original_name ||
                movie.origin_name ||
                "",
            posterUrl: getMovieImage(movie, "poster"),
            backdropUrl: getMovieImage(movie, "backdrop"),
            description: description,
            year: parseInt(movie.year, 10) || 0,
            rating: rating,
            quality: movie.quality || "",
            duration: movie.time || movie.duration || "",
            servers: servers,
            episode_current:
                movie.episode_current ||
                movie.current_episode ||
                "",
            lang:
                movie.language ||
                movie.lang ||
                "",
            category: categories.join(", "),
            country: countries.join(", "),
            director: directors.join(", "),
            casts: actors.join(", "),
            status: movie.status || "",
            tmdbId:
                movie.tmdb && movie.tmdb.id
                    ? String(movie.tmdb.id)
                    : "",
            tmdbSeason:
                movie.tmdb && movie.tmdb.season
                    ? parseInt(movie.tmdb.season, 10) || 0
                    : 0,
            tmdbType:
                movie.tmdb && movie.tmdb.type
                    ? String(movie.tmdb.type)
                    : ""
        });

    } catch (e) {
        return "null";
    }
}

// =============================================================================
// STREAM RESOLVER
// =============================================================================

function resolveStreamData(streamInput) {
    var raw = safeString(streamInput).trim();

    var isDirectStream =
        /\.m3u8(\?|$)/i.test(raw) ||
        /\.mp4(\?|$)/i.test(raw) ||
        /\.mpd(\?|$)/i.test(raw);

    return JSON.stringify({
        url: raw,
        isDirectStream: isDirectStream,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://phim.nguonc.com/"
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    try {
        var parsed = safeParseJSON(apiResponseJson);

        var candidate =
            parsed.url ||
            parsed.streamUrl ||
            parsed.link_m3u8 ||
            parsed.link_embed ||
            parsed.embed ||
            parsed.file ||
            "";

        if (candidate) {
            return resolveStreamData(candidate);
        }

        return resolveStreamData(apiResponseJson);

    } catch (e) {
        return resolveStreamData(apiResponseJson);
    }
}

// =============================================================================
// CATEGORY PARSER
// =============================================================================

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = safeParseJSON(apiResponseJson);

        var items = extractArrayItems(response);

        return JSON.stringify(
            items.map(function (item) {
                item = item || {};

                return {
                    name: item.name || item.title || "",
                    slug: item.slug || item.id || ""
                };
            })
        );

    } catch (e) {
        return "[]";
    }
}

// =============================================================================
// COUNTRY PARSER
// =============================================================================

function parseCountriesResponse(apiResponseJson) {
    try {
        var response = safeParseJSON(apiResponseJson);

        var items = extractArrayItems(response);

        return JSON.stringify(
            items.map(function (item) {
                item = item || {};

                return {
                    name: item.name || item.title || "",
                    value: item.slug || item.id || item.value || ""
                };
            })
        );

    } catch (e) {
        return "[]";
    }
}

// =============================================================================
// YEAR PARSER
// =============================================================================

function parseYearsResponse(apiResponseJson) {
    try {
        var response = safeParseJSON(apiResponseJson);

        var items = extractArrayItems(response);

        return JSON.stringify(
            items.map(function (item) {
                var value;

                if (typeof item === "object" && item !== null) {
                    value =
                        item.slug ||
                        item.value ||
                        item.year ||
                        item.name ||
                        "";
                } else {
                    value = item;
                }

                return {
                    name: String(value || ""),
                    value: String(value || "")
                };
            })
        );

    } catch (e) {
        return getLocalYearsJson();
    }
}
