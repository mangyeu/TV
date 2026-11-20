// =============================================================================
// NGUONC PLUGIN 1.1.6 - IMPROVED VIDEO LOADING
// =============================================================================

// =============================================================================
// CONFIGURATION
// =============================================================================

var BASE_URL = "https://phim.nguonc.com";
var API_URL = BASE_URL + "/api";
var IMAGE_URL = "https://img.phimapi.com/";

function getManifest() {
    return JSON.stringify({
        id: "nguonc",
        name: "Phim NguonC",
        version: "1.1.6",
        baseUrl: BASE_URL,
        iconUrl: "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonC.png",
        isEnabled: true,
        type: "MOVIE",
        playerType: "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "tv-shows", title: "TV Shows", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "the-loai" },
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "phim-moi-cap-nhat" }
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
// URL HELPERS
// =============================================================================

function safeParseJSON(json) {
    try {
        return JSON.parse(json || "{}");
    } catch (e) {
        return {};
    }
}

function encode(value) {
    return encodeURIComponent(value || "");
}

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
                "/films/the-loai/" + encodeURIComponent(filters.category) +
                "?page=" + page + "&sort=" + encodeURIComponent(sort);
        }

        if (filters.country) {
            return API_URL +
                "/films/quoc-gia/" + encodeURIComponent(filters.country) +
                "?page=" + page + "&sort=" + encodeURIComponent(sort);
        }

        if (filters.year) {
            return API_URL +
                "/films/nam-phat-hanh/" + encodeURIComponent(filters.year) +
                "?page=" + page + "&sort=" + encodeURIComponent(sort);
        }

        if (/^\d{4}$/.test(slug)) {
            return API_URL +
                "/films/nam-phat-hanh/" + slug +
                "?page=" + page + "&sort=" + encodeURIComponent(sort);
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
                "/films/danh-sach/" + slug +
                "?page=" + page + "&sort=" + encodeURIComponent(sort);
        }

        var countrySlugs = [
            "au-my", "anh", "trung-quoc", "indonesia",
            "viet-nam", "phap", "hong-kong", "han-quoc",
            "nhat-ban", "thai-lan", "dai-loan", "nga",
            "ha-lan", "philippines", "an-do", "quoc-gia-khac"
        ];

        if (countrySlugs.indexOf(slug) !== -1) {
            return API_URL +
                "/films/quoc-gia/" + slug +
                "?page=" + page + "&sort=" + encodeURIComponent(sort);
        }

        return API_URL +
            "/films/the-loai/" + encodeURIComponent(slug) +
            "?page=" + page + "&sort=" + encodeURIComponent(sort);

    } catch (e) {
        return API_URL + "/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    return API_URL +
        "/films/search?keyword=" + encode(keyword);
}

function getUrlDetail(slug) {
    if (!slug) return "";

    if (/^https?:\/\//i.test(slug)) {
        return slug;
    }

    return API_URL + "/film/" + encodeURIComponent(slug);
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

// =============================================================================
// IMAGE HELPERS
// =============================================================================

function getImageUrl(path) {
    if (!path) return "";

    path = String(path).trim();

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    if (path.indexOf("//") === 0) {
        return "https:" + path;
    }

    return IMAGE_URL + path.replace(/^\/+/, "");
}

// =============================================================================
// LIST PARSER
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = safeParseJSON(apiResponseJson);
        var data = response.data || {};
        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (Array.isArray(data.items)) {
            items = data.items;
        } else if (Array.isArray(data.data)) {
            items = data.data;
        }

        var pagination =
            response.paginate ||
            response.pagination ||
            data.pagination ||
            (data.params && data.params.pagination) ||
            {};

        var movies = [];

        items.forEach(function (item) {
            if (!item) return;

            movies.push({
                id: item.slug || item.id || "",
                title: item.name || item.title || "",
                posterUrl: getImageUrl(item.thumb_url || item.poster_url),
                backdropUrl: getImageUrl(item.poster_url || item.thumb_url),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current:
                    item.current_episode ||
                    item.episode_current ||
                    "",
                lang: item.language || item.lang || ""
            });
        });

        var currentPage =
            parseInt(pagination.current_page, 10) ||
            parseInt(pagination.currentPage, 10) ||
            1;

        var totalItems =
            parseInt(pagination.total_items, 10) ||
            parseInt(pagination.totalItems, 10) ||
            parseInt(pagination.total, 10) ||
            movies.length;

        var itemsPerPage =
            parseInt(pagination.items_per_page, 10) ||
            parseInt(pagination.itemsPerPage, 10) ||
            parseInt(pagination.totalItemsPerPage, 10) ||
            movies.length ||
            24;

        var totalPages =
            parseInt(pagination.total_page, 10) ||
            parseInt(pagination.totalPages, 10) ||
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
// DETAIL PARSER
// =============================================================================

function parseMovieDetail(apiResponseJson) {
    try {
        var response = safeParseJSON(apiResponseJson);

        var movie =
            response.movie ||
            (response.data && response.data.item) ||
            response.data ||
            response;

        if (!movie) {
            return "{}";
        }

        var rawEpisodes =
            movie.episodes ||
            response.episodes ||
            [];

        var servers = [];

        if (Array.isArray(rawEpisodes)) {
            rawEpisodes.forEach(function (server, serverIndex) {
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

                serverItems.forEach(function (ep, epIndex) {
                    if (!ep) return;

                    var embed =
                        ep.embed ||
                        ep.link_embed ||
                        ep.link ||
                        "";

                    var m3u8 =
                        ep.m3u8 ||
                        ep.link_m3u8 ||
                        ep.file ||
                        "";

                    // Prefer Embed; use direct HLS as fallback.
                    var link = embed || m3u8;

                    if (!link) return;

                    episodes.push({
                        id: link,
                        name: ep.name ||
                            ep.episode_name ||
                            ("Tập " + (epIndex + 1)),
                        slug: ep.slug ||
                            ep.episode_slug ||
                            String(epIndex + 1)
                    });
                });

                if (episodes.length > 0) {
                    servers.push({
                        name: server.server_name ||
                            server.name ||
                            ("Server " + (serverIndex + 1)),
                        episodes: episodes
                    });
                }
            });
        }

        function extractGroup(categoryObj, groupName) {
            if (!categoryObj) return "";

            if (Array.isArray(categoryObj)) {
                for (var i = 0; i < categoryObj.length; i++) {
                    var entry = categoryObj[i];

                    if (
                        entry &&
                        entry.group &&
                        entry.group.name === groupName &&
                        Array.isArray(entry.list)
                    ) {
                        return entry.list
                            .map(function (item) {
                                return item && item.name ? item.name : "";
                            })
                            .filter(Boolean)
                            .join(", ");
                    }
                }
            }

            if (typeof categoryObj === "object") {
                for (var key in categoryObj) {
                    if (!categoryObj.hasOwnProperty(key)) continue;

                    var group = categoryObj[key];

                    if (
                        group &&
                        group.group &&
                        group.group.name === groupName &&
                        Array.isArray(group.list)
                    ) {
                        return group.list
                            .map(function (item) {
                                return item && item.name ? item.name : "";
                            })
                            .filter(Boolean)
                            .join(", ");
                    }
                }
            }

            return "";
        }

        var year =
            parseInt(movie.year, 10) ||
            parseInt(extractGroup(movie.category, "Năm"), 10) ||
            0;

        return JSON.stringify({
            id: movie.slug || movie.id || "",
            title: movie.name || movie.title || "",
            posterUrl: getImageUrl(movie.thumb_url || movie.poster_url),
            backdropUrl: getImageUrl(movie.poster_url || movie.thumb_url),
            description: (movie.description || movie.content || "")
                .replace(/<[^>]*>/g, "")
                .trim(),
            year: year,

            // Do not use view count as rating.
            rating: parseFloat(movie.rating) || 0,

            quality: movie.quality || "",
            servers: servers,

            episode_current:
                movie.current_episode ||
                movie.episode_current ||
                "",

            lang:
                movie.language ||
                movie.lang ||
                "",

            casts:
                movie.casts ||
                movie.actor ||
                "",

            director: movie.director || "",

            category: extractGroup(movie.category, "Thể loại"),
            country: extractGroup(movie.category, "Quốc gia"),

            view: parseInt(movie.view, 10) || 0,
            status: movie.status || ""
        });

    } catch (e) {
        return "{}";
    }
}

// =============================================================================
// VIDEO RESOLVER
// =============================================================================

// Normalize escaped URLs found in embedded HTML/JS.
function normalizeVideoUrl(url) {
    if (!url) return "";

    url = String(url).trim();

    // Remove surrounding quotes.
    url = url.replace(/^["']|["']$/g, "");

    // Common JavaScript escaping.
    url = url.replace(/\\\//g, "/");
    url = url.replace(/\\\\/g, "");
    url = url.replace(/\\u0026/g, "&");
    url = url.replace(/&amp;/g, "&");

    // Decode URL encoding where possible.
    try {
        if (url.indexOf("%3A") !== -1 ||
            url.indexOf("%2F") !== -1) {
            url = decodeURIComponent(url);
        }
    } catch (e) {}

    return url;
}

// Extract HLS links from different common embed formats.
function extractM3U8(html) {
    if (!html) return "";

    html = String(html);

    var patterns = [
        /file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,
        /source\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,
        /src\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,

        /["']file["']\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,
        /["']url["']\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,

        /https?:\\?\/\\?\/[^"'\\\s]+\.m3u8[^"'\\\s]*/i,
        /https?:\/\/[^"'<> \s]+\.m3u8[^"'<> \s]*/i
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = html.match(patterns[i]);

        if (match) {
            var candidate = match[1] || match[0];
            candidate = normalizeVideoUrl(candidate);

            if (/\.m3u8/i.test(candidate)) {
                return candidate;
            }
        }
    }

    return "";
}

// Parse embed HTML.
function parseDetailResponse(html) {
    try {
        var m3u8 = extractM3U8(html);

        if (!m3u8) {
            return "{}";
        }

        return JSON.stringify({
            url: m3u8,
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
