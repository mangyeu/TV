// ============================================================
// NguonC Plugin - KKPhim Compatible
// Version: 1.1.7
// API: https://phim.nguonc.com/api
// ============================================================
function getManifest() {
    return JSON.stringify({
        "id": "nguonc",
        "name": "Phim NguonC",
        "version": "1.1.7",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonC.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "embed"
    });
}


// ============================================================
// HOME
// ============================================================

function getHomeSections() {
    return JSON.stringify([
        {
            slug: "phim-moi-cap-nhat",
            title: "Phim Mới Cập Nhật",
            type: "Grid",
            path: "films"
        },
        {
            slug: "tv-shows",
            title: "TV Shows",
            type: "Horizontal",
            path: "danh-sach"
        },
        {
            slug: "phim-bo",
            title: "Phim Bộ",
            type: "Horizontal",
            path: "danh-sach"
        },
        {
            slug: "phim-le",
            title: "Phim Lẻ",
            type: "Horizontal",
            path: "danh-sach"
        },
        {
            slug: "hoat-hinh",
            title: "Hoạt Hình",
            type: "Horizontal",
            path: "danh-sach"
        },
        {
            slug: "hanh-dong",
            title: "Phim Hành Động",
            type: "Horizontal",
            path: "the-loai"
        }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim mới cập nhật", slug: "phim-moi-cap-nhat" },
        { name: "TV Shows", slug: "tv-shows" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Hành động", slug: "category:hanh-dong" },
        { name: "Việt Nam", slug: "country:viet-nam" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [],
        filters: ["country", "category", "year"]
    });
}

// ============================================================
// URL
// ============================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = Math.max(1, parseInt(filters.page, 10) || 1);
        var s = String(slug || "phim-moi-cap-nhat").trim();

        var base = "https://phim.nguonc.com/api/films/";

        if (
            s === "phim-moi" ||
            s === "phim-moi-cap-nhat" ||
            s === "phim-moi-cap-nhat-v3"
        ) {
            return base + "phim-moi-cap-nhat?page=" + page;
        }

        if (s.indexOf("country:") === 0 || filters.country) {
            var country = filters.country || s.substring(8);

            return base + "quoc-gia/" +
                encodeURIComponent(country) +
                "?page=" + page;
        }

        if (s.indexOf("year:") === 0 || filters.year) {
            var year = filters.year || s.substring(5);

            return base + "nam-phat-hanh/" +
                encodeURIComponent(year) +
                "?page=" + page;
        }

        if (s.indexOf("category:") === 0 || filters.category) {
            var category = filters.category || s.substring(9);

            return base + "the-loai/" +
                encodeURIComponent(category) +
                "?page=" + page;
        }

        var lists = [
            "phim-bo",
            "phim-le",
            "tv-shows",
            "hoat-hinh",
            "phim-vietsub",
            "phim-thuyet-minh",
            "phim-long-tieng",
            "subteam"
        ];

        if (lists.indexOf(s) >= 0) {
            return base + "danh-sach/" +
                encodeURIComponent(s) +
                "?page=" + page;
        }

        return base + "the-loai/" +
            encodeURIComponent(s) +
            "?page=" + page;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = Math.max(1, parseInt(filters.page, 10) || 1);

        return "https://phim.nguonc.com/api/films/search?keyword=" +
            encodeURIComponent(String(keyword || "").trim()) +
            "&page=" + page;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/search?keyword=" +
            encodeURIComponent(keyword || "") +
            "&page=1";
    }
}

function getUrlDetail(slug) {
    return "https://phim.nguonc.com/api/film/" +
        encodeURIComponent(slug || "");
}

// Endpoint danh sách tập mới của NguonC
function getUrlEpisodes(slug) {
    return "https://phim.nguonc.com/phim/" +
        encodeURIComponent(slug || "") +
        "/episodes";
}

function getUrlCategories() {
    return "https://phim.nguonc.com/api/films/the-loai/hanh-dong?page=1";
}

function getUrlCountries() {
    return "https://phim.nguonc.com/api/films/quoc-gia/viet-nam?page=1";
}

function getUrlYears() {
    return "https://phim.nguonc.com/api/films/nam-phat-hanh/" +
        new Date().getFullYear() +
        "?page=1";
}

function getLocalYearsJson() {
    var years = [];
    var current = new Date().getFullYear();

    for (var y = current; y >= 1970; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }

    return JSON.stringify(years);
}

// ============================================================
// HELPERS
// ============================================================

function extractArrayItems(response) {
    if (!response) return [];

    if (Array.isArray(response)) return response;

    if (Array.isArray(response.items)) {
        return response.items;
    }

    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (response.data && Array.isArray(response.data.items)) {
        return response.data.items;
    }

    if (response.data && Array.isArray(response.data.films)) {
        return response.data.films;
    }

    if (Array.isArray(response.films)) {
        return response.films;
    }

    return [];
}

function apiSucceeded(response) {
    return !response ||
        response.status === undefined ||
        response.status === "success";
}

function normalizeExternalIds(value) {
    value = value || {};

    var tmdb = value.tmdb || null;
    var imdb = value.imdb || null;

    return {
        tmdb: tmdb ? {
            id: tmdb.id == null ? null : tmdb.id,
            type: tmdb.type || null,
            season: tmdb.season == null ? null : tmdb.season,
            url: tmdb.url || null
        } : null,

        imdb: imdb ? {
            id: imdb.id || null,
            url: imdb.url || null
        } : null
    };
}

function getImageUrl(path) {
    if (!path) return "";

    var p = String(path).trim();

    if (/^https?:\/\//i.test(p)) {
        return p;
    }

    return "https://phim.nguonc.com" +
        (p.charAt(0) === "/" ? p : "/" + p);
}

function cleanText(html) {
    return String(html || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p\s*>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();
}

function toNames(arr) {
    if (!Array.isArray(arr)) return "";

    return arr.map(function (x) {
        if (typeof x === "string") return x;

        return x && (x.name || x.title) || "";
    }).filter(Boolean).join(", ");
}

function defaultPagination(itemsLength) {
    return {
        currentPage: 1,
        totalPages: 1,
        totalItems: itemsLength || 0,
        itemsPerPage: 24
    };
}

// ============================================================
// LIST RESPONSE
// ============================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");

        if (!apiSucceeded(response)) {
            return JSON.stringify({
                items: [],
                error: response.message || "API error",
                pagination: defaultPagination(0)
            });
        }

        var items = extractArrayItems(response);
        var paginate = response.paginate || {};

        var movies = items.map(function (item) {
            item = item || {};

            var external = normalizeExternalIds(item);

            return {
                id: item.slug || item.id || "",
                title: item.name || item.title || "",

                posterUrl: getImageUrl(
                    item.poster_url ||
                    item.poster ||
                    item.thumb_url ||
                    item.thumb ||
                    item.image
                ),

                backdropUrl: getImageUrl(
                    item.thumb_url ||
                    item.thumb ||
                    item.backdrop ||
                    item.poster_url ||
                    item.poster
                ),

                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",

                episode_current:
                    item.current_episode ||
                    item.episode_current ||
                    item.episode ||
                    "",

                lang: item.language || item.lang || "",

                tmdb: external.tmdb,
                imdb: external.imdb,

                tmdbId:
                    external.tmdb && external.tmdb.id != null
                        ? String(external.tmdb.id)
                        : "",

                tmdbType:
                    external.tmdb && external.tmdb.type
                        ? external.tmdb.type
                        : "",

                tmdbSeason:
                    external.tmdb && external.tmdb.season != null
                        ? external.tmdb.season
                        : 0,

                tmdbUrl:
                    external.tmdb && external.tmdb.url
                        ? external.tmdb.url
                        : "",

                imdbId:
                    external.imdb && external.imdb.id
                        ? external.imdb.id
                        : "",

                imdbUrl:
                    external.imdb && external.imdb.url
                        ? external.imdb.url
                        : ""
            };
        });

        var current =
            parseInt(paginate.current_page, 10) || 1;

        var perPage =
            parseInt(paginate.items_per_page, 10) ||
            movies.length ||
            24;

        var total =
            parseInt(paginate.total_items, 10);

        if (isNaN(total)) {
            total = movies.length;
        }

        var pages =
            parseInt(paginate.total_page, 10) ||
            Math.max(1, Math.ceil(total / perPage));

        return JSON.stringify({
            items: movies,

            pagination: {
                currentPage: current,
                totalPages: pages,
                totalItems: total,
                itemsPerPage: perPage
            },

            category: response.cat || null,
            status: response.status || "success"
        });

    } catch (e) {
        return JSON.stringify({
            items: [],
            error: "Invalid API response: " + e.message,
            pagination: defaultPagination(0)
        });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

// ============================================================
// EPISODE PARSER
// ============================================================

function getUrlValue(value) {
    if (typeof value === "string") {
        return value.trim();
    }

    if (value && typeof value === "object") {
        return value.url ||
            value.src ||
            value.link ||
            value.href ||
            "";
    }

    return "";
}

function isHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
}

function isDirectUrl(value) {
    return /\.m3u8(?:\?|$)/i.test(value) ||
        /\.mp4(?:\?|$)/i.test(value) ||
        /\.mpd(?:\?|$)/i.test(value);
}

function isEmbedUrl(value) {
    return /embed/i.test(value) ||
        /[?&]hash=/i.test(value) ||
        /iframe/i.test(value) ||
        /streamc/i.test(value);
}

// Hỗ trợ:
// 1|tap-1|https://embed17.streamc.xyz/embed.php?hash=...
function parseEpisodeString(value) {
    if (!value || typeof value !== "string") {
        return null;
    }

    var parts = value.split("|");

    if (parts.length < 3) {
        return null;
    }

    var number = parts[0].trim();
    var name = parts[1].trim();
    var url = parts.slice(2).join("|").trim();

    if (!isHttpUrl(url)) {
        return null;
    }

    return {
        id: url,
        name: name || number || "Tập " + number,
        slug: "",
        url: url,
        m3u8: isDirectUrl(url) ? url : "",
        embed: isDirectUrl(url) ? "" : url,
        playbackType: isDirectUrl(url) ? "direct" : "embed"
    };
}

// Lấy URL từ nhiều tên field
function pickEpisodeUrls(ep) {
    ep = ep || {};

    var directCandidates = [
        ep.m3u8,
        ep.link_m3u8,
        ep.mp4,
        ep.video_url,
        ep.url_video,
        ep.file,
        ep.stream
    ];

    var embedCandidates = [
        ep.embed,
        ep.link_embed,
        ep.embed_url,
        ep.url_embed,
        ep.iframe,
        ep.link,
        ep.url,
        ep.src,
        ep.href
    ];

    var direct = "";
    var embed = "";

    for (var i = 0; i < directCandidates.length; i++) {
        var u = getUrlValue(directCandidates[i]);

        if (isHttpUrl(u)) {
            direct = u;
            break;
        }
    }

    for (var j = 0; j < embedCandidates.length; j++) {
        var u = getUrlValue(embedCandidates[j]);

        if (!isHttpUrl(u)) continue;

        if (isDirectUrl(u)) {
            if (!direct) direct = u;
        } else {
            embed = u;
            break;
        }
    }

    return {
        direct: direct,
        embed: embed
    };
}

function parseEpisodeObject(ep, index) {
    if (!ep) return null;

    if (typeof ep === "string") {
        return parseEpisodeString(ep);
    }

    var urls = pickEpisodeUrls(ep);

    var stream = urls.direct || urls.embed;

    if (!stream) return null;

    return {
        id: stream,

        name:
            ep.name ||
            ep.title ||
            ep.episode ||
            ep.slug ||
            "Tập " + (index + 1),

        slug: ep.slug || "",

        url: stream,
        m3u8: urls.direct || "",
        embed: urls.embed || "",

        playbackType:
            urls.direct ? "direct" : "embed"
    };
}

// Xử lý danh sách episode
function parseEpisodeArray(episodes) {
    if (!Array.isArray(episodes)) {
        if (typeof episodes === "string") {
            episodes = episodes.split(/\r?\n/);
        } else {
            return [];
        }
    }

    var result = [];

    for (var i = 0; i < episodes.length; i++) {
        var ep = parseEpisodeObject(episodes[i], i);

        if (ep) {
            result.push(ep);
        }
    }

    return result;
}

// Xử lý một server
function parseEpisodeGroup(group, groupIndex) {
    group = group || {};

    var episodes =
        group.items ||
        group.list ||
        group.server_data ||
        group.episodes ||
        group.data ||
        [];

    var parsedEpisodes = parseEpisodeArray(episodes);

    // Server có thể chứa một tập trực tiếp
    if (parsedEpisodes.length === 0) {
        var directEpisode = parseEpisodeObject(group, groupIndex);

        if (directEpisode) {
            parsedEpisodes.push(directEpisode);
        }
    }

    if (parsedEpisodes.length === 0) {
        return null;
    }

    return {
        name:
            group.server_name ||
            group.name ||
            group.title ||
            "Server " + (groupIndex + 1),

        episodes: parsedEpisodes
    };
}

// ============================================================
// GET EPISODE GROUPS
// ============================================================

function getEpisodeGroups(movie, response) {
    movie = movie || {};
    response = response || {};

    var groups = [];

    // API mới
    if (Array.isArray(response.servers)) {
        groups = response.servers;
    }

    // API movie.episodes
    else if (Array.isArray(movie.episodes)) {
        groups = movie.episodes;
    }

    // API response.episodes
    else if (Array.isArray(response.episodes)) {
        groups = response.episodes;
    }

    // API movie.server_data
    else if (Array.isArray(movie.server_data)) {
        groups = [{
            server_name: movie.server_name || "Server",
            items: movie.server_data
        }];
    }

    // API response.server_data
    else if (Array.isArray(response.server_data)) {
        groups = [{
            server_name: response.server_name || "Server",
            items: response.server_data
        }];
    }

    // episodes dạng object
    if (!Array.isArray(groups) && groups && typeof groups === "object") {
        groups = Object.keys(groups).map(function (key) {
            return groups[key];
        });
    }

    return groups || [];
}

// ============================================================
// PARSE EPISODES ENDPOINT
// Endpoint: /phim/{slug}/episodes
// ============================================================

function parseEpisodesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");

        var groups = [];

        if (Array.isArray(response.servers)) {
            groups = response.servers;
        } else if (Array.isArray(response.episodes)) {
            groups = response.episodes;
        } else if (Array.isArray(response.data)) {
            groups = response.data;
        } else if (Array.isArray(response.data && response.data.servers)) {
            groups = response.data.servers;
        }

        var result = [];

        for (var i = 0; i < groups.length; i++) {
            var parsed = parseEpisodeGroup(groups[i], i);

            if (parsed) {
                result.push(parsed);
            }
        }

        return JSON.stringify({
            servers: result,
            items: result,
            status: "success"
        });

    } catch (e) {
        return JSON.stringify({
            servers: [],
            items: [],
            error: e.message
        });
    }
}

// ============================================================
// MOVIE DETAIL
// ============================================================

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");

        if (!apiSucceeded(response)) {
            return JSON.stringify({
                error: response.message || "API error",
                servers: []
            });
        }

        var movie = response.movie || response.data || response || {};

        var episodeGroups = getEpisodeGroups(movie, response);

        var servers = [];

        for (var i = 0; i < episodeGroups.length; i++) {
            var parsedGroup = parseEpisodeGroup(
                episodeGroups[i],
                i
            );

            if (parsedGroup) {
                servers.push(parsedGroup);
            }
        }

        var external = normalizeExternalIds(movie);

        return JSON.stringify({
            id: movie.slug || movie.id || "",

            title:
                movie.name ||
                movie.title ||
                "",

            originName:
                movie.original_name ||
                movie.origin_name ||
                movie.original_title ||
                "",

            posterUrl: getImageUrl(
                movie.poster_url ||
                movie.poster ||
                movie.thumb_url ||
                movie.thumb
            ),

            backdropUrl: getImageUrl(
                movie.thumb_url ||
                movie.thumb ||
                movie.backdrop ||
                movie.poster_url ||
                movie.poster
            ),

            description: cleanText(
                movie.description ||
                movie.content ||
                movie.desc
            ),

            year: parseInt(movie.year, 10) || 0,

            rating:
                parseFloat(movie.rating || movie.vote_average) || 0,

            quality: movie.quality || "",

            duration:
                movie.duration ||
                movie.time ||
                "",

            servers: servers,

            episode_current:
                movie.current_episode ||
                movie.episode_current ||
                movie.episode ||
                "",

            lang:
                movie.language ||
                movie.lang ||
                "",

            category: toNames(
                movie.category ||
                movie.categories
            ),

            country: toNames(
                movie.country ||
                movie.countries
            ),

            director: toNames(movie.director),

            casts: toNames(
                movie.actor ||
                movie.actors ||
                movie.cast
            ),

            status:
                movie.status ||
                response.status ||
                "",

            tmdb: external.tmdb,
            imdb: external.imdb,

            tmdbId:
                external.tmdb && external.tmdb.id != null
                    ? String(external.tmdb.id)
                    : "",

            tmdbSeason:
                external.tmdb && external.tmdb.season != null
                    ? external.tmdb.season
                    : 0,

            tmdbType:
                external.tmdb && external.tmdb.type
                    ? external.tmdb.type
                    : "",

            tmdbUrl:
                external.tmdb && external.tmdb.url
                    ? external.tmdb.url
                    : "",

            imdbId:
                external.imdb && external.imdb.id
                    ? external.imdb.id
                    : "",

            imdbUrl:
                external.imdb && external.imdb.url
                    ? external.imdb.url
                    : ""
        });

    } catch (e) {
        return JSON.stringify({
            error: "Invalid movie response: " + e.message,
            servers: []
        });
    }
}

// ============================================================
// STREAM RESOLVER
// ============================================================

function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").trim();

    if (!raw) {
        return JSON.stringify({
            url: "",
            error: "Không tìm thấy đường dẫn phát video",
            playbackType: "unknown"
        });
    }

    var direct =
        /\.m3u8(?:\?|$)/i.test(raw) ||
        /\.mp4(?:\?|$)/i.test(raw) ||
        /\.mpd(?:\?|$)/i.test(raw);

    var embed =
        /^https?:\/\//i.test(raw) &&
        !direct;

    return JSON.stringify({
        url: raw,

        isDirectStream: direct,

        playbackType:
            direct
                ? "direct"
                : embed
                    ? "embed"
                    : "unknown",

        type:
            direct
                ? "video"
                : "embed",

        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://phim.nguonc.com/",
            "Origin": "https://phim.nguonc.com"
        },

        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    try {
        var parsed = JSON.parse(apiResponseJson || "{}");

        // Input trực tiếp là URL
        if (typeof parsed === "string") {
            return resolveStreamData(parsed);
        }

        var candidate =
            parsed.url ||
            parsed.streamUrl ||
            parsed.stream_url ||
            parsed.m3u8 ||
            parsed.link_m3u8 ||
            parsed.mp4 ||
            parsed.video_url ||
            parsed.embed ||
            parsed.link_embed ||
            parsed.embed_url ||
            parsed.url_embed ||
            parsed.link ||
            parsed.src ||
            parsed.href ||
            "";

        if (candidate && typeof candidate === "object") {
            candidate =
                candidate.url ||
                candidate.src ||
                candidate.link ||
                candidate.href ||
                "";
        }

        return resolveStreamData(candidate);

    } catch (e) {
        return resolveStreamData(apiResponseJson);
    }
}

// ============================================================
// CATEGORIES
// ============================================================

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");

        if (!apiSucceeded(response)) {
            return "[]";
        }

        var cat = response.cat;

        if (Array.isArray(cat)) {
            return JSON.stringify(cat.map(function (x) {
                return {
                    name: x.name || x.title || "",
                    slug: x.slug || x.value || ""
                };
            }));
        }

        if (cat && typeof cat === "object") {
            return JSON.stringify([
                {
                    name: cat.name || cat.title || "",
                    slug: cat.slug || cat.value || ""
                }
            ]);
        }

        return JSON.stringify(
            extractArrayItems(response).map(function (x) {
                return {
                    name: x.name || x.title || "",
                    slug: x.slug || x.value || ""
                };
            })
        );

    } catch (e) {
        return "[]";
    }
}

// ============================================================
// COUNTRIES
// ============================================================

function parseCountriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");

        if (!apiSucceeded(response)) {
            return "[]";
        }

        var cat = response.cat;

        if (Array.isArray(cat)) {
            return JSON.stringify(cat.map(function (x) {
                return {
                    name: x.name || x.title || "",
                    value: x.slug || x.value || ""
                };
            }));
        }

        if (cat && typeof cat === "object") {
            return JSON.stringify([
                {
                    name: cat.name || cat.title || "",
                    value: cat.slug || cat.value || ""
                }
            ]);
        }

        return JSON.stringify(
            extractArrayItems(response).map(function (x) {
                return {
                    name: x.name || x.title || "",
                    value: x.slug || x.value || ""
                };
            })
        );

    } catch (e) {
        return "[]";
    }
}

// ============================================================
// YEARS
// ============================================================

function parseYearsResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");

        if (!apiSucceeded(response)) {
            return "[]";
        }

        return JSON.stringify(
            extractArrayItems(response).map(function (x) {
                var value =
                    typeof x === "object"
                        ? (
                            x.slug ||
                            x.value ||
                            x.year ||
                            x.name
                        )
                        : x;

                return {
                    name: String(value || ""),
                    value: String(value || "")
                };
            })
        );

    } catch (e) {
        return "[]";
    }
}
