// =============================================================================
// NGUONC MOVIE PLUGIN
// Version: 1.2.0
// =============================================================================

// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://phim.nguonc.com";
var API_URL = BASE_URL + "/api";
var IMAGE_URL = "https://img.phimapi.com/";

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

// =============================================================================
// HOME SECTIONS
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

// =============================================================================
// PRIMARY CATEGORIES
// =============================================================================

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "TV Shows", slug: "tv-shows" },
        { name: "Hoạt hình", slug: "hoat-hinh" }
    ]);
}

// =============================================================================
// FILTER CONFIGURATION
// =============================================================================

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
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");

        var page = parseInt(filters.page) || 1;
        var sort = filters.sort || "updated";

        // Latest movies
        if (
            slug === "phim-moi-cap-nhat" &&
            !filters.category &&
            !filters.country &&
            !filters.year
        ) {
            return API_URL +
                "/films/phim-moi-cap-nhat?page=" +
                page;
        }

        // Category filter
        if (filters.category) {
            return API_URL +
                "/films/the-loai/" +
                encodeURIComponent(filters.category) +
                "?page=" + page +
                "&sort=" + encodeURIComponent(sort);
        }

        // Country filter
        if (filters.country) {
            return API_URL +
                "/films/quoc-gia/" +
                encodeURIComponent(filters.country) +
                "?page=" + page +
                "&sort=" + encodeURIComponent(sort);
        }

        // Year filter
        if (filters.year) {
            return API_URL +
                "/films/nam-phat-hanh/" +
                encodeURIComponent(filters.year) +
                "?page=" + page +
                "&sort=" + encodeURIComponent(sort);
        }

        // Year slug
        if (/^\d{4}$/.test(slug)) {
            return API_URL +
                "/films/nam-phat-hanh/" +
                slug +
                "?page=" + page +
                "&sort=" + encodeURIComponent(sort);
        }

        // Movie lists
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
                encodeURIComponent(slug) +
                "?page=" + page +
                "&sort=" + encodeURIComponent(sort);
        }

        // Countries
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
                encodeURIComponent(slug) +
                "?page=" + page +
                "&sort=" + encodeURIComponent(sort);
        }

        // Default: genre
        return API_URL +
            "/films/the-loai/" +
            encodeURIComponent(slug) +
            "?page=" + page +
            "&sort=" + encodeURIComponent(sort);

    } catch (e) {
        return API_URL + "/films/phim-moi-cap-nhat?page=1";
    }
}

// =============================================================================
// SEARCH
// =============================================================================

function getUrlSearch(keyword, filtersJson) {
    try {
        return API_URL +
            "/films/search?keyword=" +
            encodeURIComponent(keyword || "");
    } catch (e) {
        return API_URL + "/films/phim-moi-cap-nhat?page=1";
    }
}

// =============================================================================
// DETAIL URL
// =============================================================================

function getUrlDetail(slug) {
    if (!slug) return "";

    // Keep full embed/video URLs intact
    if (/^https?:\/\//i.test(slug)) {
        return slug;
    }

    return API_URL +
        "/film/" +
        encodeURIComponent(slug);
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
// URL HELPERS
// =============================================================================

function normalizeVideoUrl(url) {
    if (!url) return "";

    url = String(url).trim();

    if (url.indexOf("//") === 0) {
        url = "https:" + url;
    }

    if (!/^https?:\/\//i.test(url)) {
        return "";
    }

    return url;
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

    return IMAGE_URL + path.replace(/^\/+/, "");
}

// =============================================================================
// LIST PARSER
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");

        var data = response.data || {};
        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (Array.isArray(data.items)) {
            items = data.items;
        } else if (Array.isArray(data.films)) {
            items = data.films;
        } else if (Array.isArray(response.films)) {
            items = response.films;
        }

        var movies = items.map(function(item) {
            return {
                id: item.slug || item.id || "",
                title: item.name || item.title || "",
                posterUrl: getImageUrl(
                    item.thumb_url ||
                    item.thumb ||
                    item.thumbnail ||
                    item.poster
                ),
                backdropUrl: getImageUrl(
                    item.poster_url ||
                    item.backdrop ||
                    item.cover
                ),
                year: parseInt(item.year) || 0,
                quality: item.quality || "",
                episode_current:
                    item.current_episode ||
                    item.episode_current ||
                    "",
                lang:
                    item.language ||
                    item.lang ||
                    ""
            };
        });

        var paginate =
            response.paginate ||
            response.pagination ||
            data.paginate ||
            data.pagination ||
            data.params?.pagination ||
            {};

        var currentPage =
            parseInt(
                paginate.current_page ||
                paginate.currentPage ||
                paginate.page
            ) || 1;

        var totalItems =
            parseInt(
                paginate.total_items ||
                paginate.totalItems ||
                paginate.total
            ) || movies.length;

        var itemsPerPage =
            parseInt(
                paginate.items_per_page ||
                paginate.itemsPerPage ||
                paginate.totalItemsPerPage
            ) || 24;

        var totalPages =
            parseInt(
                paginate.total_page ||
                paginate.totalPages ||
                paginate.total_pages
            ) || 0;

        if (totalPages <= 0) {
            totalPages = Math.ceil(totalItems / itemsPerPage);
        }

        if (totalPages <= 0) {
            totalPages = 1;
        }

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

// =============================================================================
// SEARCH PARSER
// =============================================================================

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

// =============================================================================
// CATEGORY HELPERS
// =============================================================================

function extractGroup(categoryObj, groupName) {
    if (!categoryObj) return "";

    // Array format
    if (Array.isArray(categoryObj)) {
        var result = [];

        categoryObj.forEach(function(group) {
            if (
                group.group &&
                group.group.name === groupName &&
                Array.isArray(group.list)
            ) {
                group.list.forEach(function(item) {
                    result.push(item.name || item);
                });
            }
        });

        return result.join(", ");
    }

    // Object format
    for (var key in categoryObj) {
        var group = categoryObj[key];

        if (
            group &&
            group.group &&
            group.group.name === groupName &&
            Array.isArray(group.list)
        ) {
            return group.list.map(function(item) {
                return item.name || item;
            }).join(", ");
        }
    }

    return "";
}

// =============================================================================
// MOVIE DETAIL PARSER
// =============================================================================

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");

        var movie =
            response.movie ||
            response.data?.item ||
            response.data?.movie ||
            response.data ||
            response.item ||
            response;

        var rawEpisodes =
            movie.episodes ||
            response.episodes ||
            response.data?.episodes ||
            [];

        var servers = [];

        if (Array.isArray(rawEpisodes)) {
            rawEpisodes.forEach(function(server, serverIndex) {
                var serverItems =
                    server.items ||
                    server.server_data ||
                    server.episodes ||
                    [];

                var episodes = [];

                if (Array.isArray(serverItems)) {
                    serverItems.forEach(function(ep, epIndex) {
                        var candidates = [
                            ep.embed,
                            ep.link_embed,
                            ep.url,
                            ep.link,
                            ep.m3u8,
                            ep.link_m3u8,
                            ep.mp4,
                            ep.video_url
                        ];

                        var link = "";

                        for (var i = 0; i < candidates.length; i++) {
                            link = normalizeVideoUrl(candidates[i]);

                            if (link) break;
                        }

                        if (!link) return;

                        episodes.push({
                            id: link,
                            name:
                                ep.name ||
                                ep.episode_name ||
                                ep.filename ||
                                ("Tập " + (epIndex + 1)),
                            slug: ep.slug || ep.episode_slug || ""
                        });
                    });
                }

                if (episodes.length > 0) {
                    servers.push({
                        name:
                            server.server_name ||
                            server.name ||
                            ("Server " + (serverIndex + 1)),
                        episodes: episodes
                    });
                }
            });
        }

        var extractedYear =
            extractGroup(movie.category, "Năm");

        return JSON.stringify({
            id: movie.slug || movie.id || "",
            title: movie.name || movie.title || "",
            posterUrl: getImageUrl(
                movie.thumb_url ||
                movie.thumb ||
                movie.thumbnail
            ),
            backdropUrl: getImageUrl(
                movie.poster_url ||
                movie.poster ||
                movie.backdrop
            ),
            description: (
                movie.description ||
                movie.content ||
                movie.plot ||
                ""
            ).replace(/<[^>]*>/g, ""),
            year:
                parseInt(movie.year || extractedYear) || 0,
            rating:
                parseFloat(movie.rating || movie.view) || 0,
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
            director:
                movie.director ||
                "",
            category:
                extractGroup(movie.category, "Thể loại"),
            country:
                extractGroup(movie.category, "Quốc gia"),
            view:
                parseInt(movie.view) || 0,
            status:
                movie.status || ""
        });

    } catch (e) {
        return JSON.stringify({
            id: "",
            title: "",
            servers: [],
            description: "",
            error: "Lỗi đọc dữ liệu phim"
        });
    }
}

// =============================================================================
// EMBED / VIDEO DETAIL PARSER
// =============================================================================

function parseDetailResponse(html) {
    try {
        if (!html) {
            return JSON.stringify({});
        }

        var text = String(html);

        // Normalize escaped URL characters
        text = text
            .replace(/\\\//g, "/")
            .replace(/\\u0026/g, "&")
            .replace(/&amp;/g, "&");

        // Recognize directly declared video sources.
        // Does not attempt to bypass protected players.
        var patterns = [
            /["']file["']\s*:\s*["']([^"']+)["']/i,
            /["']src["']\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
            /(https?:\/\/[^"'\\\s<>]+\.m3u8(?:\?[^"'\\\s<>]*)?)/i,
            /(https?:\/\/[^"'\\\s<>]+\.mp4(?:\?[^"'\\\s<>]*)?)/i
        ];

        var videoUrl = "";

        for (var i = 0; i < patterns.length; i++) {
            var match = text.match(patterns[i]);

            if (match) {
                videoUrl = match[1] || match[0];
                break;
            }
        }

        if (videoUrl) {
            videoUrl = normalizeVideoUrl(videoUrl);

            return JSON.stringify({
                url: videoUrl,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                        "AppleWebKit/537.36 (KHTML, like Gecko) " +
                        "Chrome/120.0.0.0 Safari/537.36"
                }
            });
        }

        // Embed page: let the compatible WebView/player handle the page.
        return JSON.stringify({});

    } catch (e) {
        return JSON.stringify({});
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

    for (var i = 2026; i >= 2004; i--) {
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
