
/*
 * ============================================================
 * PHIM NGUONC - VERSION 1.2.0
 * Android WebView + vaxPlayer
 *
 * Playback priority:
 * 1. Embed
 * 2. M3U8
 * 3. MP4
 *
 * Compatible with old and new NguonC API response structures.
 * ============================================================
 */

// ============================================================
// 1. CONFIGURATION & MANIFEST
// ============================================================

var BASE_URL = "https://phim.nguonc.com";
var API_BASE = BASE_URL + "/api";
var IMAGE_BASE = "https://img.phimapi.com/";

function getManifest() {
    return JSON.stringify({
        id: "nguonc",
        name: "Phim NguonC",
        version: "1.2.0",
        baseUrl: BASE_URL,
        iconUrl: "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonC.png",
        isEnabled: true,
        type: "MOVIE",
        playerType: "embed"
    });
}

// ============================================================
// 2. HOME SECTIONS
// ============================================================

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

// ============================================================
// 3. COMMON HELPERS
// ============================================================

function safeJson(value) {
    try {
        if (typeof value === "object" && value !== null) {
            return value;
        }

        return JSON.parse(value || "{}");
    } catch (e) {
        return {};
    }
}

function firstValue() {
    for (var i = 0; i < arguments.length; i++) {
        var value = arguments[i];

        if (value !== undefined &&
            value !== null &&
            String(value).trim() !== "") {
            return value;
        }
    }

    return "";
}

function safeEncode(value) {
    return encodeURIComponent(String(value || ""));
}

function getImageUrl(path) {
    if (!path) return "";

    path = String(path).trim();

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    if (path.indexOf("//") === 0) {
        return "https:" + path;
    }

    return IMAGE_BASE + path.replace(/^\/+/, "");
}

function normalizeUrl(url, base) {
    if (!url) return "";

    url = String(url).trim()
        .replace(/&amp;/g, "&")
        .replace(/\\u0026/g, "&")
        .replace(/\\\//g, "/");

    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    if (url.indexOf("//") === 0) {
        return "https:" + url;
    }

    if (base) {
        var match = String(base).match(
            /^(https?:\/\/[^/]+)/i
        );

        if (match) {
            return match[1] +
                (url.charAt(0) === "/" ? url : "/" + url);
        }
    }

    return "";
}

function getPage(filters) {
    var page = parseInt(filters.page, 10);
    return page > 0 ? page : 1;
}

function getSort(filters) {
    var allowed = ["updated", "new", "view", "year"];
    var sort = filters.sort || "updated";

    return allowed.indexOf(sort) >= 0
        ? sort
        : "updated";
}

// ============================================================
// 4. URL GENERATION
// ============================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = safeJson(filtersJson);
        var page = getPage(filters);
        var sort = getSort(filters);

        var category = filters.category || "";
        var country = filters.country || "";
        var year = filters.year || "";

        // Latest updated movies
        if (
            slug === "phim-moi-cap-nhat" &&
            !category &&
            !country &&
            !year
        ) {
            return API_BASE +
                "/films/phim-moi-cap-nhat?page=" + page;
        }

        // Category filter
        if (category) {
            return API_BASE +
                "/films/the-loai/" +
                safeEncode(category) +
                "?page=" + page +
                "&sort=" + sort;
        }

        // Country filter
        if (country) {
            return API_BASE +
                "/films/quoc-gia/" +
                safeEncode(country) +
                "?page=" + page +
                "&sort=" + sort;
        }

        // Year filter
        if (year) {
            return API_BASE +
                "/films/nam-phat-hanh/" +
                safeEncode(year) +
                "?page=" + page +
                "&sort=" + sort;
        }

        // Year slug
        if (/^\d{4}$/.test(String(slug))) {
            return API_BASE +
                "/films/nam-phat-hanh/" +
                slug +
                "?page=" + page +
                "&sort=" + sort;
        }

        // Movie lists
        var listSlugs = [
            "phim-le",
            "phim-bo",
            "phim-dang-chieu",
            "tv-shows",
            "subteam"
        ];

        if (listSlugs.indexOf(slug) >= 0) {
            return API_BASE +
                "/films/danh-sach/" +
                safeEncode(slug) +
                "?page=" + page +
                "&sort=" + sort;
        }

        // Country slugs
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

        if (countrySlugs.indexOf(slug) >= 0) {
            return API_BASE +
                "/films/quoc-gia/" +
                safeEncode(slug) +
                "?page=" + page +
                "&sort=" + sort;
        }

        // Default: genre
        return API_BASE +
            "/films/the-loai/" +
            safeEncode(slug) +
            "?page=" + page +
            "&sort=" + sort;

    } catch (e) {
        return API_BASE +
            "/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        return API_BASE +
            "/films/search?keyword=" +
            safeEncode(keyword);
    } catch (e) {
        return API_BASE + "/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";

    slug = String(slug).trim();

    if (/^https?:\/\//i.test(slug)) {
        return slug;
    }

    return API_BASE +
        "/film/" +
        safeEncode(slug);
}

function getUrlCategories() {
    return BASE_URL;
}

function getUrlCountries() {
    return BASE_URL;
}

function getUrlYears() {
    return BASE_URL;
}

// ============================================================
// 5. LIST RESPONSE PARSER
// ============================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = safeJson(apiResponseJson);
        var data = response.data || {};
        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(data.items)) {
            items = data.items;
        } else if (Array.isArray(data.films)) {
            items = data.films;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (Array.isArray(response.films)) {
            items = response.films;
        }

        var paginate =
            response.paginate ||
            response.pagination ||
            data.paginate ||
            (data.params && data.params.pagination) ||
            {};

        var movies = [];

        items.forEach(function(item) {
            if (!item) return;

            var title = firstValue(
                item.name,
                item.title
            );

            var id = firstValue(
                item.slug,
                item.id
            );

            if (!title || !id) return;

            movies.push({
                id: id,
                title: title,
                posterUrl: getImageUrl(
                    firstValue(
                        item.thumb_url,
                        item.poster_url
                    )
                ),
                backdropUrl: getImageUrl(
                    firstValue(
                        item.poster_url,
                        item.thumb_url
                    )
                ),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current: firstValue(
                    item.current_episode,
                    item.episode_current
                ),
                lang: firstValue(
                    item.language,
                    item.lang
                )
            });
        });

        var currentPage = parseInt(
            firstValue(
                paginate.current_page,
                paginate.currentPage
            ),
            10
        ) || 1;

        var totalItems = parseInt(
            firstValue(
                paginate.total_items,
                paginate.totalItems
            ),
            10
        ) || 0;

        var itemsPerPage = parseInt(
            firstValue(
                paginate.items_per_page,
                paginate.itemsPerPage,
                paginate.totalItemsPerPage
            ),
            10
        ) || 24;

        var totalPages = parseInt(
            firstValue(
                paginate.total_page,
                paginate.totalPages
            ),
            10
        ) || Math.max(
            1,
            Math.ceil(totalItems / itemsPerPage)
        );

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

// ============================================================
// 6. MOVIE DETAIL & EPISODE PARSER
// ============================================================

function parseMovieDetail(apiResponseJson) {
    try {
        var response = safeJson(apiResponseJson);

        var movie =
            response.movie ||
            (response.data && response.data.item) ||
            response.data ||
            {};

        var rawServers =
            movie.episodes ||
            response.episodes ||
            movie.servers ||
            response.servers ||
            [];

        var servers = [];

        function normalizeEpisode(ep) {
            if (!ep) return null;

            var embed = firstValue(
                ep.embed,
                ep.link_embed
            );

            var m3u8 = firstValue(
                ep.m3u8,
                ep.link_m3u8,
                ep.hls
            );

            var mp4 = firstValue(
                ep.mp4,
                ep.link_mp4
            );

            // Embed is preferred.
            var link = firstValue(
                embed,
                m3u8,
                mp4
            );

            if (!link) return null;

            return {
                id: String(link),
                name: String(firstValue(
                    ep.name,
                    ep.episode_name,
                    ep.slug,
                    "Tập phim"
                )),
                slug: String(firstValue(
                    ep.slug,
                    ep.episode_slug
                ))
            };
        }

        function addServer(name, list) {
            if (!Array.isArray(list)) return;

            var episodes = [];

            list.forEach(function(ep) {
                var item = normalizeEpisode(ep);

                if (item) {
                    episodes.push(item);
                }
            });

            if (episodes.length > 0) {
                servers.push({
                    name: name || "Server",
                    episodes: episodes
                });
            }
        }

        // API may return array or object of servers.
        if (Array.isArray(rawServers)) {
            rawServers.forEach(function(server) {
                if (!server) return;

                var list =
                    server.items ||
                    server.server_data ||
                    server.list ||
                    [];

                addServer(
                    firstValue(
                        server.server_name,
                        server.name,
                        "Server " + (servers.length + 1)
                    ),
                    list
                );
            });
        } else if (
            rawServers &&
            typeof rawServers === "object"
        ) {
            Object.keys(rawServers).forEach(function(key) {
                var server = rawServers[key];

                if (!server) return;

                addServer(
                    firstValue(
                        server.server_name,
                        server.name,
                        "Server " + (servers.length + 1)
                    ),
                    server.items ||
                    server.server_data ||
                    server.list ||
                    []
                );
            });
        }

        // Fallback: single movie-level media URL.
        if (!servers.length) {
            var singleEpisode = normalizeEpisode(movie);

            if (singleEpisode) {
                servers.push({
                    name: "Server mặc định",
                    episodes: [singleEpisode]
                });
            }
        }

        function extractGroup(categoryObj, groupName) {
            if (!categoryObj) return "";

            var groups = [];

            if (Array.isArray(categoryObj)) {
                groups = categoryObj;
            } else {
                Object.keys(categoryObj).forEach(function(key) {
                    groups.push(categoryObj[key]);
                });
            }

            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];

                if (
                    group &&
                    group.group &&
                    group.group.name === groupName &&
                    Array.isArray(group.list)
                ) {
                    return group.list.map(function(item) {
                        return item.name;
                    }).filter(Boolean).join(", ");
                }
            }

            return "";
        }

        var year = firstValue(
            movie.year,
            extractGroup(movie.category, "Năm")
        );

        return JSON.stringify({
            id: firstValue(movie.slug, movie.id),
            title: firstValue(movie.name, movie.title),
            posterUrl: getImageUrl(movie.thumb_url),
            backdropUrl: getImageUrl(movie.poster_url),
            description: String(
                firstValue(
                    movie.description,
                    movie.content
                )
            ).replace(/<[^>]*>/g, "").trim(),
            year: parseInt(year, 10) || 0,
            rating: parseFloat(movie.rating) || 0,
            quality: movie.quality || "",
            servers: servers,
            episode_current: firstValue(
                movie.current_episode,
                movie.episode_current
            ),
            lang: firstValue(
                movie.language,
                movie.lang
            ),
            casts: firstValue(
                movie.casts,
                movie.actor
            ),
            director: movie.director || "",
            category: extractGroup(
                movie.category,
                "Thể loại"
            ),
            country: extractGroup(
                movie.category,
                "Quốc gia"
            ),
            view: parseInt(movie.view, 10) || 0,
            status: movie.status || ""
        });

    } catch (e) {
        return "{}";
    }
}

// ============================================================
// 7. EMBED / M3U8 / MP4 PLAYBACK PARSER
// ============================================================

function parseDetailResponse(html) {
    try {
        if (!html || typeof html !== "string") {
            return "{}";
        }

        var source = html
            .replace(/&amp;/g, "&")
            .replace(/\\u0026/g, "&")
            .replace(/\\\//g, "/")
            .replace(/\\x2f/gi, "/")
            .replace(/\\x3a/gi, ":");

        var patterns = [
            /["']file["']\s*:\s*["']([^"']+)["']/ig,
            /file\s*:\s*["']([^"']+)["']/ig,
            /["']src["']\s*:\s*["']([^"']+)["']/ig,
            /["']source["']\s*:\s*["']([^"']+)["']/ig,
            /["']url["']\s*:\s*["']([^"']+)["']/ig,
            /https?:\/\/[^"'\\\s<>]+?\.(?:m3u8|mp4)(?:\?[^"'\\\s<>]*)?/ig
        ];

        var mediaUrl = "";

        for (var i = 0; i < patterns.length; i++) {
            var match = patterns[i].exec(source);

            if (match) {
                var candidate = match[1] || match[0];

                if (/\.(m3u8|mp4)(?:[?#]|$)/i.test(candidate)) {
                    mediaUrl = candidate;
                    break;
                }
            }
        }

        if (!mediaUrl) {
            return "{}";
        }

        mediaUrl = normalizeUrl(mediaUrl);

        if (!mediaUrl) {
            return "{}";
        }

        return JSON.stringify({
            url: mediaUrl,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            }
        });

    } catch (e) {
        return "{}";
    }
}

// ============================================================
// 8. CATEGORIES
// ============================================================

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

// ============================================================
// 9. COUNTRIES
// ============================================================

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

// ============================================================
// 10. YEARS
// ============================================================

function parseYearsResponse(apiResponseJson) {
    var years = [];
    var currentYear = new Date().getFullYear();

    for (var i = currentYear; i >= 2004; i--) {
        years.push({
            name: String(i),
            value: String(i)
        });
    }

    return JSON.stringify(years);
}

// ============================================================
// 11. PLAYBACK UTILITIES
// ============================================================

// Classify source URL.
// This helper is available for integrations that support it.
// It does not itself start playback.

function getPlaybackType(url) {
    if (!url) return "unknown";

    url = String(url).toLowerCase();

    if (/\.(m3u8)(?:[?#]|$)/i.test(url)) {
        return "hls";
    }

    if (/\.(mp4)(?:[?#]|$)/i.test(url)) {
        return "mp4";
    }

    if (
        url.indexOf("embed") >= 0 ||
        url.indexOf("player") >= 0
    ) {
        return "embed";
    }

    return "unknown";
}

// Return an episode URL without changing its content.
function getEpisodeUrl(episode) {
    if (!episode) return "";

    if (typeof episode === "string") {
        return episode;
    }

    return firstValue(
        episode.id,
        episode.embed,
        episode.link_embed,
        episode.m3u8,
        episode.link_m3u8,
        episode.mp4
    );
}

// ============================================================
// END OF PHIM NGUONC PLUGIN
// ============================================================
