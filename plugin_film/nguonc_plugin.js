// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguonc",
        "name": "Phim NguonC",
        "version": "1.0.1",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://raw.githubusercontent.com/mangyeu/TV/refs/heads/main/plugin_film/nguonc.ico",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'films' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'films' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'films' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'films' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'films' },
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'films' },
        { slug: 'phim-thuyet-minh', title: 'Phim Thuyết Minh', type: 'Horizontal', path: 'films' },
        { slug: 'phim-long-tieng', title: 'Phim Lồng Tiếng', type: 'Horizontal', path: 'films' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi-cap-nhat' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' },
        { name: 'TV shows', slug: 'tv-shows' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' },
        { name: 'Phim thuyết minh', slug: 'phim-thuyet-minh' },
        { name: 'Phim lồng tiếng', slug: 'phim-long-tieng' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'modified.time' },
            { name: 'Năm phát hành', value: 'year' }
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
        if (page < 1) page = 1;

        var typeList = (slug || "").trim();
        if (!typeList || typeList === 'phim-moi' || typeList === 'phim-moi-cap-nhat-v3') {
            typeList = 'phim-moi-cap-nhat';
        }

        // Slug phim lấy từ danh sách/tìm kiếm; URL mẫu chỉ dùng minh họa
        var url = "https://phim.nguonc.com/api/films/" + encodeURIComponent(typeList) + "?page=" + page;

        if (filters.limit) url += "&limit=" + encodeURIComponent(filters.limit);
        if (filters.country) url += "&country=" + encodeURIComponent(filters.country);
        if (filters.year) url += "&year=" + encodeURIComponent(filters.year);
        if (filters.category) url += "&category=" + encodeURIComponent(filters.category);
        if (filters.sort) url += "&sort_field=" + encodeURIComponent(filters.sort);

        return url;
    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        if (page < 1) page = 1;
        var cleanKeyword = String(keyword || "").trim();

        var url = "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(cleanKeyword) + "&page=" + page;
        if (filters.limit) url += "&limit=" + encodeURIComponent(filters.limit);
        return url;
    } catch (e) {
        return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(String(keyword || "")) + "&page=1";
    }
}

function getUrlDetail(slug) {
    var cleanSlug = String(slug || "").trim();
    return "https://phim.nguonc.com/api/film/" + encodeURIComponent(cleanSlug);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NORMALIZERS & PARSERS
// =============================================================================

function normalizeStatusError(response) {
    if (!response || typeof response !== "object") return null;

    var statusText = String(response.status || "").toLowerCase();
    var statusCode = parseInt(
        response.statusCode || response.status_code || response.code || response.httpStatus || 0,
        10
    );

    if (statusText === "error" || statusCode >= 400) {
        var msg = response.message || "Yêu cầu thất bại";
        if (statusCode === 404) {
            return { error: true, code: 404, message: msg || "Phim hoặc bộ lọc không tồn tại (404)" };
        }
        if (statusCode === 422) {
            return { error: true, code: 422, message: msg || "Tham số không hợp lệ (422)" };
        }
        if (statusCode === 429) {
            return { error: true, code: 429, retryAfterMs: 3000, message: msg || "Quá nhiều yêu cầu, cần chờ trước khi thử lại (429)" };
        }
        return { error: true, code: statusCode || 400, message: msg };
    }

    return null;
}

function normalizeTmdb(tmdb) {
    var obj = tmdb && typeof tmdb === "object" ? tmdb : {};
    var id = (obj.id !== null && obj.id !== undefined && obj.id !== "") ? (parseInt(obj.id, 10) || null) : null;
    var type = (obj.type === "movie" || obj.type === "tv") ? obj.type : null;
    var season = (obj.season !== null && obj.season !== undefined && obj.season !== "")
        ? (isNaN(parseInt(obj.season, 10)) ? null : parseInt(obj.season, 10))
        : null;
    var url = obj.url ? String(obj.url) : null;

    return {
        id: id,
        type: type,
        season: season,
        url: url
    };
}

function normalizeImdb(imdb) {
    var obj = imdb && typeof imdb === "object" ? imdb : {};
    var rawId = obj.id ? String(obj.id).trim() : null;
    var id = (rawId && rawId.indexOf("tt") === 0) ? rawId : null;
    var url = obj.url ? String(obj.url) : null;

    return {
        id: id,
        url: url
    };
}

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var errInfo = normalizeStatusError(response);
        if (errInfo) {
            return JSON.stringify({
                items: [],
                error: errInfo.message,
                errorCode: errInfo.code,
                retryAfterMs: errInfo.retryAfterMs || 0,
                pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10, hasNextPage: false, nextPage: null }
            });
        }

        var catInfo = response.cat && typeof response.cat === "object" ? response.cat : null;
        var items = Array.isArray(response.items) ? response.items : [];
        var paginate = response.paginate || {};

        var currentPage = parseInt(paginate.current_page, 10) || 1;
        var totalPages = parseInt(paginate.total_page, 10) || 1;
        var totalItems = parseInt(paginate.total_items, 10) || items.length;
        var itemsPerPage = parseInt(paginate.items_per_page, 10) || items.length || 10;

        var movies = items.map(function (item) {
            var slug = item.slug || "";
            var tmdb = normalizeTmdb(item.tmdb);
            var imdb = normalizeImdb(item.imdb);

            return {
                id: slug,
                slug: slug,
                title: item.name || "",
                originName: item.original_name || item.origin_name || "",
                posterUrl: getPosterUrl(item.poster_url || item.thumb_url || ""),
                backdropUrl: getPosterUrl(item.thumb_url || item.poster_url || ""),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current: item.current_episode || item.episode_current || "",
                lang: item.language || item.lang || "",
                categoryTitle: catInfo && catInfo.name ? String(catInfo.name) : "",
                categorySlug: catInfo && catInfo.slug ? String(catInfo.slug) : "",
                tmdb: tmdb,
                imdb: imdb,
                tmdbId: tmdb.id !== null ? String(tmdb.id) : "",
                tmdbType: tmdb.type || "",
                tmdbSeason: tmdb.season !== null ? tmdb.season : 0,
                imdbId: imdb.id || ""
            };
        });

        return JSON.stringify({
            items: movies,
            category: catInfo,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage,
                hasNextPage: currentPage < totalPages,
                nextPage: currentPage < totalPages ? (currentPage + 1) : null
            }
        });
    } catch (error) {
        return JSON.stringify({
            items: [],
            error: "Lỗi phân tích dữ liệu danh sách",
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10, hasNextPage: false, nextPage: null }
        });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var errInfo = normalizeStatusError(response);
        if (errInfo) {
            return JSON.stringify({
                error: errInfo.message,
                errorCode: errInfo.code,
                retryAfterMs: errInfo.retryAfterMs || 0
            });
        }

        var movie = response.movie || {};
        var episodes = Array.isArray(movie.episodes) ? movie.episodes : [];

        var servers = [];
        episodes.forEach(function (server, sIdx) {
            var serverEpisodes = [];
            var epList = Array.isArray(server.items) ? server.items : (Array.isArray(server.server_data) ? server.server_data : []);

            epList.forEach(function (ep, eIdx) {
                var m3u8Url = (ep.m3u8 || ep.link_m3u8 || "").trim();
                var embedUrl = (ep.embed || ep.link_embed || "").trim();
                var streamUrl = m3u8Url || embedUrl;

                if (streamUrl) {
                    serverEpisodes.push({
                        id: streamUrl,
                        url: streamUrl,
                        m3u8: m3u8Url,
                        embed: embedUrl,
                        name: ep.name != null ? String(ep.name) : ("Tập " + (eIdx + 1)),
                        slug: ep.slug || ("tap-" + (eIdx + 1))
                    });
                }
            });

            if (serverEpisodes.length > 0) {
                servers.push({
                    name: server.server_name || ("Server " + (sIdx + 1)),
                    episodes: serverEpisodes
                });
            }
        });

        var categories = extractNames(movie.category);
        var countries = extractNames(movie.country);
        var directors = Array.isArray(movie.director) ? movie.director.join(", ") : (movie.director || "");
        var actors = Array.isArray(movie.casts) ? movie.casts : (Array.isArray(movie.actor) ? movie.actor.join(", ") : (movie.actor || ""));

        var tmdb = normalizeTmdb(movie.tmdb);
        var imdb = normalizeImdb(movie.imdb);
        var slug = movie.slug || "";

        return JSON.stringify({
            id: slug,
            slug: slug,
            title: movie.name || "",
            originName: movie.original_name || movie.origin_name || "",
            posterUrl: getPosterUrl(movie.poster_url || movie.thumb_url || ""),
            backdropUrl: getPosterUrl(movie.thumb_url || movie.poster_url || ""),
            description: (movie.description || movie.content || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year, 10) || 0,
            quality: movie.quality || "",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.current_episode || movie.episode_current || "",
            lang: movie.language || movie.lang || "",
            category: categories,
            country: countries,
            director: directors,
            casts: actors,
            status: movie.status || "",
            tmdb: tmdb,
            imdb: imdb,
            tmdbId: tmdb.id !== null ? String(tmdb.id) : "",
            tmdbSeason: tmdb.season !== null ? tmdb.season : 0,
            tmdbType: tmdb.type || "",
            imdbId: imdb.id || ""
        });
    } catch (error) {
        return "null";
    }
}

function parseDetailResponse(input) {
    try {
        var raw = typeof input === "string" ? input.trim() : "";
        var streamUrl = "";

        if (raw.indexOf("{") === 0) {
            var parsed = JSON.parse(raw);
            streamUrl = parsed.url || parsed.m3u8 || parsed.link_m3u8 || parsed.embed || parsed.link_embed || "";
        } else if (raw.indexOf("http") === 0) {
            streamUrl = raw;
        }

        return JSON.stringify({
            url: streamUrl,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Referer": "https://phim.nguonc.com/"
            },
            subtitles: []
        });
    } catch (e) {
        return JSON.stringify({
            url: "",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://phim.nguonc.com/"
            },
            subtitles: []
        });
    }
}

function parseCategoriesResponse(apiResponseJson) { return "[]"; }
function parseCountriesResponse(apiResponseJson) { return "[]"; }
function parseYearsResponse(apiResponseJson) { return "[]"; }

// =============================================================================
// HELPERS
// =============================================================================

function extractNames(field) {
    if (!field) return "";
    if (Array.isArray(field)) {
        return field.map(function (item) {
            return typeof item === "string" ? item : (item.name || "");
        }).filter(Boolean).join(", ");
    }
    if (typeof field === "object") {
        return Object.keys(field).map(function (k) {
            var val = field[k];
            if (typeof val === "string") return val;
            if (val && val.list) {
                return val.list.map(function (x) { return x.name || x; }).join(", ");
            }
            return val && val.name ? val.name : "";
        }).filter(Boolean).join(", ");
    }
    return String(field);
}

function getPosterUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    if (path.indexOf("/") === 0) return "https://phim.nguonc.com" + path;
    return "https://phim.nguonc.com/" + path;
}
