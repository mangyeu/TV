// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi",
        "name": "JAVHD",
        "version": "1.0.8",
        "baseUrl": "https://avdbapi.com/api.php/provide/vod",
        "iconUrl": "https://avdbapi.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
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
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

var BASE_API = "https://avdbapi.com/api.php/provide/vod";

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var url = BASE_API + "?ac=detail&pg=" + page + "&pagesize=24";

        if (/^[1-6]$/.test(String(slug || ""))) {
            url += "&t=" + encodeURIComponent(slug);
        } else if (filters.category) {
            url += "&t=" + encodeURIComponent(filters.category);
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
        var page = parseInt(filters.page, 10) || 1;
        return BASE_API + "?ac=detail&wd=" + encodeURIComponent(keyword || "") +
            "&pg=" + page + "&pagesize=24";
    } catch (e) {
        return BASE_API + "?ac=detail&wd=" + encodeURIComponent(keyword || "") +
            "&pg=1&pagesize=24";
    }
}

// episodeId can be an embed URL, numeric API ID, or movie code/slug.
function getUrlDetail(episodeId) {
    var id = String(episodeId || "");

    if (/^https?:\/\//i.test(id)) return id;

    if (/^\d+$/.test(id)) {
        return BASE_API + "?ac=detail&ids=" + encodeURIComponent(id);
    }

    return BASE_API + "?ac=detail&code=" + encodeURIComponent(id) + "&pagesize=1";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS & HELPERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");
        var list = Array.isArray(response.list) ? response.list : [];

        var movies = list.map(function (item) {
            return {
                id: String(item.id || item.slug || item.movie_code || ""),
                title: item.name || "",
                posterUrl: item.poster_url || "",
                backdropUrl: item.thumb_url || item.poster_url || "",
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "HD",
                episode_current: item.status || "",
                lang: item.movie_code || ""
            };
        });

        var currentPage = parseInt(response.page, 10) || 1;
        var totalItems = parseInt(response.total, 10) || movies.length;
        var itemsPerPage = parseInt(response.limit, 10) || 24;
        var totalPages = parseInt(response.pagecount, 10) ||
            Math.max(1, Math.ceil(totalItems / itemsPerPage));

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
// MOVIE DETAIL - KKPHIM STYLE METADATA
// =============================================================================

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");
        var list = Array.isArray(response.list) ? response.list : [];
        if (!list.length) return "null";

        var movie = list[0];

        function parseText(value) {
            if (value == null) return "";

            if (Array.isArray(value)) {
                return value.map(function (item) {
                    if (item == null) return "";
                    if (typeof item === "object") {
                        return item.name || item.title || item.value || "";
                    }
                    return String(item);
                }).filter(Boolean).join(", ");
            }

            if (typeof value === "object") {
                return value.name || value.title || value.value || "";
            }

            return String(value);
        }

        function cleanHtml(value) {
            return String(value || "")
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<\/p\s*>/gi, "\n")
                .replace(/<[^>]*>/g, "")
                .replace(/&nbsp;/gi, " ")
                .replace(/&amp;/gi, "&")
                .replace(/&quot;/gi, '"')
                .replace(/&#39;/gi, "'")
                .replace(/&lt;/gi, "<")
                .replace(/&gt;/gi, ">")
                .trim();
        }

        function names(value) {
            if (!value) return "";
            if (Array.isArray(value)) {
                return value.map(function (item) {
                    if (item == null || item === "Updating") return "";
                    if (typeof item === "object") {
                        return item.name || item.title || "";
                    }
                    return String(item);
                }).filter(Boolean).join(", ");
            }
            return parseText(value);
        }

        // AVDB episodes format:
        // episodes: { server_name: "...", server_data: { "Full": { slug, link_embed } } }
        var servers = [];
        var episodesData = movie.episodes || {};
        var serverData = episodesData.server_data || {};
        var serverEpisodes = [];

        if (Array.isArray(serverData)) {
            for (var i = 0; i < serverData.length; i++) {
                var ep = serverData[i] || {};
                var embed = ep.link_embed || ep.url || "";
                if (!embed) continue;

                serverEpisodes.push({
                    id: embed,
                    name: ep.name || ep.title || ("Tập " + (i + 1)),
                    slug: ep.slug || "",
                    m3u8: ep.link_m3u8 || "",
                    embed: embed
                });
            }
        } else {
            for (var epName in serverData) {
                if (!Object.prototype.hasOwnProperty.call(serverData, epName)) continue;
                var epInfo = serverData[epName] || {};
                var embedUrl = epInfo.link_embed || "";
                if (!embedUrl) continue;

                serverEpisodes.push({
                    id: embedUrl,
                    name: epName,
                    slug: epInfo.slug || epName.toLowerCase(),
                    m3u8: epInfo.link_m3u8 || "",
                    embed: embedUrl
                });
            }
        }

        if (serverEpisodes.length) {
            servers.push({
                name: episodesData.server_name || "Server #1",
                episodes: serverEpisodes
            });
        }

        var category = names(movie.category);
        var country = names(movie.country);
        var director = names(movie.director);
        var casts = names(movie.actor);

        var description = cleanHtml(
            movie.description || movie.content || movie.des || ""
        );

        var rating = parseFloat(
            movie.rating || movie.score || movie.vote_average || 0
        ) || 0;

        return JSON.stringify({
            id: movie.slug || movie.movie_code || String(movie.id || ""),
            title: movie.name || "",
            originName: movie.origin_name || "",
            posterUrl: movie.poster_url || "",
            backdropUrl: movie.thumb_url || movie.poster_url || "",
            description: description,
            year: parseInt(movie.year, 10) || 0,
            rating: rating,
            quality: movie.quality || "HD",
            duration: movie.time || movie.duration || "",
            servers: servers,
            episode_current: movie.status || "",
            lang: movie.lang || "",
            category: category,
            country: country,
            director: director,
            casts: casts,
            status: movie.status || "",
            tmdbId: movie.tmdb_id || "",
            tmdbSeason: parseInt(movie.tmdb_season, 10) || 0,
            tmdbType: movie.tmdb_type || "",
            imdbId: movie.imdb_id || "",
            movieCode: movie.movie_code || "",
            releaseDate: movie.release_date || "",
            updatedAt: movie.updated_at || movie.last_update || ""
        });
    } catch (error) {
        return "null";
    }
}

// =============================================================================
// STREAM RESPONSE PARSER
// =============================================================================

function parseDetailResponse(embedHtml, pageUrl) {
    try {
        var content = String(embedHtml || "");
        var url = String(pageUrl || "");

        // HLS playlist content
        if (content.indexOf("#EXTM3U") !== -1 || content.indexOf("#EXT-X-") !== -1) {
            return JSON.stringify({
                url: url,
                isEmbed: false,
                headers: {
                    Referer: "https://upload18.org/",
                    "User-Agent": "Mozilla/5.0"
                },
                subtitles: []
            });
        }

        // Embed player page
        if (content.indexOf("PLAYER_CONFIG") !== -1 ||
            content.indexOf("jwplayer") !== -1 ||
            content.indexOf("<iframe") !== -1) {
            return JSON.stringify({
                url: url,
                isEmbed: true,
                headers: {
                    Referer: "https://upload18.org/",
                    "User-Agent": "Mozilla/5.0"
                },
                subtitles: []
            });
        }

        // Fallback: find m3u8 URL in HTML
        var match = content.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
        if (match) {
            return JSON.stringify({
                url: match[1],
                isEmbed: false,
                headers: {
                    Referer: "https://upload18.org/",
                    "User-Agent": "Mozilla/5.0"
                },
                subtitles: []
            });
        }

        // Default: let WebView open embed page
        return JSON.stringify({
            url: url,
            isEmbed: true,
            headers: {
                Referer: "https://upload18.org/",
                "User-Agent": "Mozilla/5.0"
            },
            subtitles: []
        });
    } catch (error) {
        return "{}";
    }
}

// =============================================================================
// EMBED RESPONSE PARSER
// =============================================================================

function parseEmbedResponse(m3u8Content, tokenUrl) {
    try {
        var content = String(m3u8Content || "");
        var url = String(tokenUrl || "");

        if (content.indexOf("#EXTM3U") !== -1 || content.indexOf("#EXT-X-") !== -1) {
            return JSON.stringify({
                url: url,
                headers: {
                    Referer: "https://upload18.org/",
                    "User-Agent": "Mozilla/5.0"
                },
                subtitles: []
            });
        }

        return "{}";
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
    for (var i = new Date().getFullYear(); i >= 2010; i--) {
        years.push({
            name: String(i),
            value: String(i)
        });
    }
    return JSON.stringify(years);
}
