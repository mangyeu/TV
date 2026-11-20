
/*
===============================================================================
NGUONC PLUGIN 1.1.7
Improved API Parser + Episode Parser + Video Resolver
===============================================================================
*/

// =============================================================================
// CONFIGURATION
// =============================================================================

var BASE_URL = "https://phim.nguonc.com";
var API_URL = BASE_URL + "/api";
var IMAGE_URL = "https://img.nguonc.com/images/";

function getManifest() {
    return JSON.stringify({
        id: "nguonc",
        name: "Phim NguonC",
        version: "1.1.7",
        baseUrl: BASE_URL,
        iconUrl: "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonC.png",
        isEnabled: true,
        type: "MOVIE",
        playerType: "embed"
    });
}

// =============================================================================
// HOME
// =============================================================================

function getHomeSections() {
    return JSON.stringify([
        {
            slug: "phim-le",
            title: "Phim Lẻ",
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
            slug: "tv-shows",
            title: "TV Shows",
            type: "Horizontal",
            path: "danh-sach"
        },
        {
            slug: "hoat-hinh",
            title: "Hoạt Hình",
            type: "Horizontal",
            path: "the-loai"
        },
        {
            slug: "phim-moi-cap-nhat",
            title: "Phim Mới Cập Nhật",
            type: "Grid",
            path: "phim-moi-cap-nhat"
        }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "TV Shows", slug: "tv-shows" },
        { name: "Hoạt hình", slug: "hoat-hinh" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới cập nhật", value: "updated" },
            { name: "Mới nhất", value: "new" },
            { name: "Lượt xem", value: "view" }
        ]
    });
}

// =============================================================================
// JSON HELPERS
// =============================================================================

function safeParseJSON(json) {
    if (!json) return {};

    if (typeof json === "object") {
        return json;
    }

    try {
        return JSON.parse(json);
    } catch (e) {
        return {};
    }
}

function safeString(value) {
    if (value === undefined || value === null) {
        return "";
    }

    if (Array.isArray(value)) {
        return value.length > 0
            ? safeString(value[0])
            : "";
    }

    return String(value).trim();
}

function encode(value) {
    return encodeURIComponent(value || "");
}

function isHttpUrl(url) {
    return /^https?:\/\//i.test(url || "");
}

function normalizeUrl(url) {
    url = safeString(url);

    if (!url) return "";

    url = url.replace(/^["']|["']$/g, "");
    url = url.replace(/\\\//g, "/");
    url = url.replace(/\\u0026/gi, "&");
    url = url.replace(/&amp;/gi, "&");

    if (url.indexOf("//") === 0) {
        url = "https:" + url;
    }

    return url.trim();
}

// =============================================================================
// URL LIST
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = safeParseJSON(filtersJson);

        var page = parseInt(filters.page, 10) || 1;
        var sort = filters.sort || "updated";

        if (
            slug === "phim-moi-cap-nhat" &&
            !filters.category &&
            !filters.country &&
            !filters.year
        ) {
            return API_URL +
                "/films/phim-moi-cap-nhat?page=" + page;
        }

        if (filters.category) {
            return API_URL +
                "/films/the-loai/" +
                encode(filters.category) +
                "?page=" + page +
                "&sort=" + encode(sort);
        }

        if (filters.country) {
            return API_URL +
                "/films/quoc-gia/" +
                encode(filters.country) +
                "?page=" + page +
                "&sort=" + encode(sort);
        }

        if (filters.year) {
            return API_URL +
                "/films/nam-phat-hanh/" +
                encode(filters.year) +
                "?page=" + page +
                "&sort=" + encode(sort);
        }

        if (/^\d{4}$/.test(slug || "")) {
            return API_URL +
                "/films/nam-phat-hanh/" +
                slug +
                "?page=" + page +
                "&sort=" + encode(sort);
        }

        var listSlugs = [
            "phim-le",
            "phim-bo",
            "phim-dang-chieu",
            "tv-shows",
            "subteam"
        ];

        if (listSlugs.indexOf(slug) !== -1) {
            return API_URL +
                "/films/danh-sach/" +
                encode(slug) +
                "?page=" + page +
                "&sort=" + encode(sort);
        }

        var countrySlugs = [
            "au-my",
            "anh",
            "trung-quoc",
            "indonesia",
            "viet-nam",
            "phap",
            "hong-kong",
            "han-quoc",
            "nhat-ban",
            "thai-lan",
            "dai-loan",
            "nga",
            "ha-lan",
            "philippines",
            "an-do",
            "quoc-gia-khac"
        ];

        if (countrySlugs.indexOf(slug) !== -1) {
            return API_URL +
                "/films/quoc-gia/" +
                encode(slug) +
                "?page=" + page +
                "&sort=" + encode(sort);
        }

        return API_URL +
            "/films/the-loai/" +
            encode(slug) +
            "?page=" + page +
            "&sort=" + encode(sort);

    } catch (e) {
        return API_URL +
            "/films/phim-moi-cap-nhat?page=1";
    }
}

// =============================================================================
// SEARCH
// =============================================================================

function getUrlSearch(keyword, filtersJson) {
    return API_URL +
        "/films/search?keyword=" +
        encode(keyword);
}

// =============================================================================
// DETAIL
// =============================================================================

function getUrlDetail(slug) {
    if (!slug) return "";

    if (isHttpUrl(slug)) {
        return slug;
    }

    return API_URL +
        "/film/" +
        encode(slug);
}

// =============================================================================
// CATEGORY / COUNTRY / YEAR URL
// =============================================================================

function getUrlCategories() {
    return BASE_URL;
}

function getUrlCountries() {
    return BASE_URL;
}

function getUrlYears() {
    return BASE_URL;
}

// =============================================================================
// IMAGE
// =============================================================================

function getImageUrl(path) {
    if (!path) return "";

    path = safeString(path);

    if (isHttpUrl(path)) {
        return path;
    }

    if (path.indexOf("//") === 0) {
        return "https:" + path;
    }

    if (path.charAt(0) === "/") {
        return BASE_URL + path;
    }

    return IMAGE_URL + path.replace(/^\/+/, "");
}

function getMovieImage(movie, type) {
    if (!movie) return "";

    if (type === "poster") {
        return getImageUrl(
            movie.poster_url_webp ||
            movie.poster_url ||
            movie.thumb_url_webp ||
            movie.thumb_url
        );
    }

    return getImageUrl(
        movie.thumb_url_webp ||
        movie.thumb_url ||
        movie.poster_url_webp ||
        movie.poster_url
    );
}

// =============================================================================
// LIST PARSER
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = safeParseJSON(apiResponseJson);

        var data = response.data || response;

        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (Array.isArray(data.items)) {
            items = data.items;
        } else if (Array.isArray(data.data)) {
            items = data.data;
        } else if (Array.isArray(data.films)) {
            items = data.films;
        } else if (Array.isArray(data.movies)) {
            items = data.movies;
        }

        var movies = [];

        items.forEach(function(item) {
            if (!item) return;

            movies.push({
                id: item.slug || item.id || "",
                title: item.name || item.title || "",
                posterUrl: getMovieImage(item, "thumb"),
                backdropUrl: getMovieImage(item, "poster"),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current:
                    item.current_episode ||
                    item.episode_current ||
                    "",
                lang:
                    item.language ||
                    item.lang ||
                    ""
            });
        });

        var pagination =
            response.paginate ||
            response.pagination ||
            data.pagination ||
            data.paginate ||
            (data.params && data.params.pagination) ||
            {};

        var currentPage =
            parseInt(pagination.current_page, 10) ||
            parseInt(pagination.currentPage, 10) ||
            parseInt(pagination.page, 10) ||
            1;

        var totalItems =
            parseInt(pagination.total_items, 10) ||
            parseInt(pagination.totalItems, 10) ||
            parseInt(pagination.total, 10) ||
            movies.length;

        var itemsPerPage =
            parseInt(pagination.items_per_page, 10) ||
            parseInt(pagination.itemsPerPage, 10) ||
            parseInt(pagination.per_page, 10) ||
            parseInt(pagination.totalItemsPerPage, 10) ||
            movies.length ||
            24;

        var totalPages =
            parseInt(pagination.total_page, 10) ||
            parseInt(pagination.totalPages, 10) ||
            parseInt(pagination.last_page, 10) ||
            Math.ceil(totalItems / itemsPerPage) ||
            1;

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
// CATEGORY PARSER
// =============================================================================

function extractGroup(categoryObj, groupName) {
    if (!categoryObj) return "";

    var groups = Array.isArray(categoryObj)
        ? categoryObj
        : Object.keys(categoryObj).map(function(key) {
            return categoryObj[key];
        });

    var result = [];

    groups.forEach(function(entry) {
        if (
            entry &&
            entry.group &&
            entry.group.name === groupName &&
            Array.isArray(entry.list)
        ) {
            entry.list.forEach(function(item) {
                if (item && item.name) {
                    result.push(item.name);
                }
            });
        }
    });

    return result.join(", ");
}

function extractCategoryNames(categoryObj) {
    if (!categoryObj) return [];

    var groups = Array.isArray(categoryObj)
        ? categoryObj
        : Object.keys(categoryObj).map(function(key) {
            return categoryObj[key];
        });

    var result = [];

    groups.forEach(function(entry) {
        if (!entry || !Array.isArray(entry.list)) return;

        entry.list.forEach(function(item) {
            if (item && item.name) {
                result.push(item.name);
            }
        });
    });

    return result;
}

// =============================================================================
// EPISODE PARSER
// =============================================================================

function getEpisodeLink(ep) {
    if (!ep) return "";

    var candidates = [
        ep.embed,
        ep.link_embed,
        ep.url_embed,
        ep.link,
        ep.url,
        ep.m3u8,
        ep.link_m3u8,
        ep.file
    ];

    for (var i = 0; i < candidates.length; i++) {
        var link = normalizeUrl(candidates[i]);

        if (isHttpUrl(link)) {
            return link;
        }
    }

    return "";
}

function parseEpisodeServers(movie) {
    var rawEpisodes =
        movie.episodes ||
        movie.server_data ||
        [];

    var servers = [];

    if (!Array.isArray(rawEpisodes)) {
        return servers;
    }

    rawEpisodes.forEach(function(server, serverIndex) {
        if (!server) return;

        var serverItems =
            server.items ||
            server.server_data ||
            server.episodes ||
            [];

        if (!Array.isArray(serverItems)) {
            return;
        }

        var episodes = [];

        serverItems.forEach(function(ep, epIndex) {
            if (!ep) return;

            var link = getEpisodeLink(ep);

            if (!link) return;

            episodes.push({
                id: link,
                name: safeString(ep.name) ||
                    safeString(ep.episode_name) ||
                    ("Tập " + (epIndex + 1)),
                slug: safeString(ep.slug) ||
                    safeString(ep.episode_slug) ||
                    String(epIndex + 1)
            });
        });

        if (episodes.length > 0) {
            servers.push({
                name: safeString(server.server_name) ||
                    safeString(server.name) ||
                    ("Server " + (serverIndex + 1)),
                episodes: episodes
            });
        }
    });

    return servers;
}

// =============================================================================
// DETAIL PARSER
// =============================================================================

function parseMovieDetail(apiResponseJson) {
    try {
        var response = safeParseJSON(apiResponseJson);

        var movie =
            response.movie ||
            (response.data && response.data.movie) ||
            (response.data && response.data.item) ||
            response.data ||
            response;

        if (!movie || typeof movie !== "object") {
            return "{}";
        }

        var servers = parseEpisodeServers(movie);

        var year =
            parseInt(movie.year, 10) ||
            parseInt(extractGroup(movie.category, "Năm"), 10) ||
            0;

        return JSON.stringify({
            id: movie.slug || movie.id || "",
            title: movie.name || movie.title || "",
            original_name: movie.original_name || "",
            posterUrl: getMovieImage(movie, "thumb"),
            backdropUrl: getMovieImage(movie, "poster"),

            description: safeString(
                movie.description ||
                movie.content ||
                ""
            ).replace(/<[^>]*>/g, "").trim(),

            year: year,

            rating: parseFloat(movie.rating) || 0,

            quality: movie.quality || "",

            servers: servers,

            episode_current:
                movie.current_episode ||
                movie.episode_current ||
                "",

            total_episodes:
                parseInt(movie.total_episodes, 10) || 0,

            lang:
                movie.language ||
                movie.lang ||
                "",

            casts:
                movie.casts ||
                movie.actor ||
                "",

            director: movie.director || "",

            category: extractGroup(
                movie.category,
                "Thể loại"
            ),

            country: extractGroup(
                movie.category,
                "Quốc gia"
            ),

            format: extractGroup(
                movie.category,
                "Định dạng"
            ),

            view: parseInt(movie.view, 10) || 0,

            status: movie.status || "",

            tmdb: movie.tmdb || null,

            imdb: movie.imdb || null

        });

    } catch (e) {
        return "{}";
    }
}

// =============================================================================
// VIDEO URL NORMALIZATION
// =============================================================================

function normalizeVideoUrl(url) {
    url = safeString(url);

    if (!url) return "";

    url = url.replace(/^["']|["']$/g, "");
    url = url.replace(/\\\//g, "/");
    url = url.replace(/\\u0026/gi, "&");
    url = url.replace(/&amp;/gi, "&");

    try {
        if (
            url.indexOf("%3A") !== -1 ||
            url.indexOf("%2F") !== -1
        ) {
            url = decodeURIComponent(url);
        }
    } catch (e) {}

    return url.trim();
}

// =============================================================================
// VIDEO SOURCE EXTRACTION
// =============================================================================

function extractVideoSource(html) {
    if (!html) return "";

    html = String(html);

    var patterns = [
        /["']file["']\s*:\s*["']([^"']+)["']/i,
        /file\s*:\s*["']([^"']+)["']/i,

        /["']source["']\s*:\s*["']([^"']+)["']/i,
        /source\s*:\s*["']([^"']+)["']/i,

        /["']src["']\s*:\s*["']([^"']+)["']/i,

        /["']url["']\s*:\s*["']([^"']+)["']/i,

        /["']hls["']\s*:\s*["']([^"']+)["']/i,

        /https?:\\?\/\\?\/[^"'<>\\\s]+\.m3u8[^"'<>\\\s]*/i,

        /https?:\/\/[^"'<> \s]+\.m3u8[^"'<> \s]*/i,

        /https?:\\?\/\\?\/[^"'<>\\\s]+\.mp4[^"'<>\\\s]*/i,

        /https?:\/\/[^"'<> \s]+\.mp4[^"'<> \s]*/i
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = html.match(patterns[i]);

        if (!match) continue;

        var candidate = normalizeVideoUrl(
            match[1] || match[0]
        );

        if (
            /\.(m3u8|mp4)(?:[?#]|$)/i.test(candidate)
        ) {
            return candidate;
        }
    }

    return "";
}

function extractM3U8(html) {
    var source = extractVideoSource(html);

    if (/\.m3u8(?:[?#]|$)/i.test(source)) {
        return source;
    }

    return "";
}

function extractMP4(html) {
    var source = extractVideoSource(html);

    if (/\.mp4(?:[?#]|$)/i.test(source)) {
        return source;
    }

    return "";
}

// =============================================================================
// EMBED RESPONSE PARSER
// =============================================================================

function parseDetailResponse(html) {
    try {
        if (!html) {
            return "{}";
        }

        var source = extractVideoSource(html);

        if (!source) {
            return "{}";
        }

        return JSON.stringify({
            url: source,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                    "AppleWebKit/537.36 (KHTML, like Gecko) " +
                    "Chrome/120.0.0.0 Safari/537.36"
            }
        });

    } catch (e) {
        return "{}";
    }
}

// =============================================================================
// DEBUG
// =============================================================================

function debugNguonCDetail(apiResponseJson) {
    try {
        var response = safeParseJSON(apiResponseJson);

        var movie =
            response.movie ||
            response.data ||
            response;

        var result = {
            status: response.status || "",
            movie: movie.name || "",
            slug: movie.slug || "",
            episodeCount: 0,
            servers: []
        };

        (movie.episodes || []).forEach(function(server) {
            var serverInfo = {
                name: server.server_name || "",
                episodes: []
            };

            (server.items || []).forEach(function(ep) {
                serverInfo.episodes.push({
                    name: ep.name || "",
                    slug: ep.slug || "",
                    embedType: typeof ep.embed,
                    embed: ep.embed || null,
                    link: ep.link || null,
                    m3u8: ep.m3u8 || null
                });

                result.episodeCount++;
            });

            result.servers.push(serverInfo);
        });

        return JSON.stringify(result, null, 2);

    } catch (e) {
        return JSON.stringify({
            error: String(e)
        });
    }
}

// =============================================================================
// CATEGORIES
// =============================================================================

function parseCategoriesResponse(apiResponseJson) {
    var genres = [
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "Hài", slug: "phim-hai" },
        { name: "Hình Sự", slug: "hinh-su" },
        { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Chính Kịch", slug: "chinh-kich" },
        { name: "Gia Đình", slug: "gia-dinh" },
        { name: "Giả Tưởng", slug: "gia-tuong" },
        { name: "Lịch Sử", slug: "lich-su" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Nhạc", slug: "phim-nhac" },
        { name: "Bí Ẩn", slug: "bi-an" },
        { name: "Lãng Mạn", slug: "lang-man" },
        { name: "Khoa Học Viễn Tưởng", slug: "khoa-hoc-vien-tuong" },
        { name: "Gây Cấn", slug: "gay-can" },
        { name: "Chiến Tranh", slug: "chien-tranh" },
        { name: "Tâm Lý", slug: "tam-ly" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Cổ Trang", slug: "co-trang" },
        { name: "Miền Tây", slug: "mien-tay" },
        { name: "Phim 18+", slug: "phim-18" }
    ];

    return JSON.stringify(genres);
}

// =============================================================================
// COUNTRIES
// =============================================================================

function parseCountriesResponse(apiResponseJson) {
    var countries = [
        { name: "Âu Mỹ", value: "au-my" },
        { name: "Anh", value: "anh" },
        { name: "Trung Quốc", value: "trung-quoc" },
        { name: "Indonesia", value: "indonesia" },
        { name: "Việt Nam", value: "viet-nam" },
        { name: "Pháp", value: "phap" },
        { name: "Hồng Kông", value: "hong-kong" },
        { name: "Hàn Quốc", value: "han-quoc" },
        { name: "Nhật Bản", value: "nhat-ban" },
        { name: "Thái Lan", value: "thai-lan" },
        { name: "Đài Loan", value: "dai-loan" },
        { name: "Nga", value: "nga" },
        { name: "Hà Lan", value: "ha-lan" },
        { name: "Philippines", value: "philippines" },
        { name: "Ấn Độ", value: "an-do" },
        { name: "Quốc gia khác", value: "quoc-gia-khac" }
    ];

    return JSON.stringify(countries);
}

// =============================================================================
// YEARS
// =============================================================================

function parseYearsResponse(apiResponseJson) {
    var years = [];
    var currentYear = new Date().getFullYear();

    for (var i = currentYear; i >= 1970; i--) {
        years.push({
            name: String(i),
            value: String(i)
        });
    }

    return JSON.stringify(years);
}

// =============================================================================
// END
// =============================================================================
