// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BACKUP_MP4_URL = "https://raw.githubusercontent.com/bbbiiii12/kiiyu/d5157ae0a44be124a47fa3305126750919414a39/output.mp4";

function getManifest() {
    return JSON.stringify({
        "id": "nguonc",
        "name": "Phim NguonC",
        "version": "1.1.8",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonC.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'the-loai' },
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'phim-moi-cap-nhat' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'TV Shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'updated' },
            { name: 'Mới nhất', value: 'new' },
            { name: 'Lượt xem', value: 'view' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var sort = filters.sort || "updated";

        if (slug === 'phim-moi-cap-nhat' && !filters.category && !filters.country && !filters.year) {
            return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=" + page;
        }

        if (filters.category) {
            return "https://phim.nguonc.com/api/films/the-loai/" + filters.category + "?page=" + page + "&sort=" + sort;
        }

        if (filters.country) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + filters.country + "?page=" + page + "&sort=" + sort;
        }

        if (filters.year) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + filters.year + "?page=" + page + "&sort=" + sort;
        }

        if (/^\d{4}$/.test(slug)) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + slug + "?page=" + page + "&sort=" + sort;
        }

        var listSlugs = ['phim-le', 'phim-bo', 'phim-dang-chieu', 'tv-shows', 'subteam'];
        if (listSlugs.indexOf(slug) >= 0) {
            return "https://phim.nguonc.com/api/films/danh-sach/" + slug + "?page=" + page + "&sort=" + sort;
        }

        var countrySlugs = [
            'au-my', 'anh', 'trung-quoc', 'indonesia', 'viet-nam', 'phap', 'hong-kong',
            'han-quoc', 'nhat-ban', 'thai-lan', 'dai-loan', 'nga', 'ha-lan',
            'philippines', 'an-do', 'quoc-gia-khac'
        ];
        if (countrySlugs.indexOf(slug) >= 0) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + slug + "?page=" + page + "&sort=" + sort;
        }

        return "https://phim.nguonc.com/api/films/the-loai/" + slug + "?page=" + page + "&sort=" + sort;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(keyword || "") + "&page=" + page;
    } catch (e) {
        return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(keyword || "") + "&page=1";
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    return "https://phim.nguonc.com/api/film/" + slug;
}

function getUrlCategories() { return "https://phim.nguonc.com"; }
function getUrlCountries() { return "https://phim.nguonc.com"; }
function getUrlYears() { return "https://phim.nguonc.com"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        if (!apiResponseJson) {
            return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 } });
        }

        var response = JSON.parse(apiResponseJson);
        var data = response.data || {};
        var items = [];

        if (Array.isArray(response)) {
            items = response;
        } else if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
        }

        var paginate = response.paginate || response.pagination || data.paginate || data.pagination || (data.params && data.params.pagination) || {};

        var movies = items.map(function (item) {
            var slugOrId = item.slug || item.id || "";
            return {
                id: slugOrId,
                title: item.name || item.title || "",
                posterUrl: getImageUrl(item.thumb_url || item.posterUrl),
                backdropUrl: getImageUrl(item.poster_url || item.backdropUrl),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current: item.current_episode || item.episode_current || "",
                lang: item.language || item.lang || ""
            };
        });

        var currentPage = parseInt(paginate.current_page || paginate.currentPage, 10) || 1;
        var totalItems = parseInt(paginate.total_items || paginate.totalItems, 10) || movies.length;
        var itemsPerPage = parseInt(paginate.items_per_page || paginate.itemsPerPage || paginate.totalItemsPerPage, 10) || 24;

        var totalPages = parseInt(paginate.total_page || paginate.totalPages, 10) || 0;
        if (totalPages === 0 && itemsPerPage > 0 && totalItems > 0) {
            totalPages = Math.ceil(totalItems / itemsPerPage);
        }
        if (totalPages === 0) totalPages = 1;

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

function getOriginFromUrl(url) {
    if (!url || typeof url !== "string") return "";
    var match = url.match(/^(https?:\/\/[^\/?#]+)/i);
    return match ? (match[1] + "/") : "https://embed.streamc.xyz/";
}

function normalizeStreamUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return "";
    return rawUrl.replace(/\\\//g, "/").replace(/&/g, "&").trim();
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var dataObj = (response && typeof response.data === "object" && response.data !== null) ? response.data : null;
        var dataItem = (dataObj && dataObj.item) ? dataObj.item : null;
        var movie = response.movie || dataItem || (!Array.isArray(response.data) && dataObj) || {};

        var rawEpisodes = movie.episodes
            || response.episodes
            || (dataItem && dataItem.episodes)
            || [];

        var servers = [];
        if (Array.isArray(rawEpisodes)) {
            rawEpisodes.forEach(function (server, sIdx) {
                var episodes = [];
                var serverItems = server.items || server.server_data || [];

                if (Array.isArray(serverItems)) {
                    serverItems.forEach(function (ep, eIdx) {
                        var embed = normalizeStreamUrl(ep.embed || ep.link_embed || "");
                        var m3u8 = normalizeStreamUrl(ep.m3u8 || ep.link_m3u8 || "");

                        // Giữ embed làm id để parseDetailResponse tải HTML và bóc m3u8 + Referer;
                        // nếu không có embed thì dùng trực tiếp m3u8.
                        var playTarget = embed || m3u8;

                        if (playTarget) {
                            episodes.push({
                                id: playTarget,
                                name: ep.name || ep.episode_name || ("Tập " + (eIdx + 1)),
                                slug: ep.slug || ep.episode_slug || ("tap-" + (eIdx + 1)),
                                embedUrl: embed,
                                m3u8Url: m3u8,
                                serverName: server.server_name || server.name || ("Server " + (sIdx + 1))
                            });
                        }
                    });
                }

                if (episodes.length > 0) {
                    servers.push({
                        name: server.server_name || server.name || ("Server " + (sIdx + 1)),
                        episodes: episodes
                    });
                }
            });
        }

        var extractGroup = function (categoryObj, groupName) {
            if (!categoryObj) return "";
            for (var key in categoryObj) {
                if (!Object.prototype.hasOwnProperty.call(categoryObj, key)) continue;
                var group = categoryObj[key];
                if (group && group.group && group.group.name === groupName && Array.isArray(group.list) && group.list.length > 0) {
                    return group.list.map(function (item) { return item.name; }).join(", ");
                }
            }
            return "";
        };

        var extractedYear = extractGroup(movie.category, "Năm");

        return JSON.stringify({
            id: movie.slug || movie.id || "",
            title: movie.name || "",
            original_name: movie.original_name || "",
            posterUrl: getImageUrl(movie.thumb_url || movie.thumb_url_webp),
            backdropUrl: getImageUrl(movie.poster_url || movie.poster_url_webp),
            description: (movie.description || movie.content || "").replace(/<[^>]*>/g, "").trim(),
            year: parseInt(movie.year || extractedYear, 10) || 0,
            rating: parseFloat(movie.view) || 0,
            quality: movie.quality || "",
            time: movie.time || "",
            total_episodes: parseInt(movie.total_episodes, 10) || 0,
            servers: servers,
            episode_current: movie.current_episode || movie.episode_current || "",
            lang: movie.language || movie.lang || "",
            casts: movie.casts || movie.actor || "",
            director: movie.director || "",
            category: extractGroup(movie.category, "Thể loại"),
            country: extractGroup(movie.category, "Quốc gia"),
            view: parseInt(movie.view, 10) || 0,
            status: movie.status || ""
        });
    } catch (error) {
        return "{}";
    }
}

function parseDetailResponse(html, sourceUrl) {
    try {
        if (!html || typeof html !== "string") return "{}";

        var cleanHtml = html.replace(/\\\//g, "/");

        // 1. Ưu tiên bắt link .m3u8 gắn với player / nguồn phát (file:, source:, src:, hoặc URL https có .m3u8)
        var patterns = [
            /(?:file|source|src|hls|url)\s*[:=]\s*["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)["']/i,
            /["'](https?:\/\/[^"'\s]+\.m3u8(?:\?[^"'\s]*)?)["']/i,
            /(?:file|source|src)\s*[:=]\s*["']([^"'\s]+\.m3u8[^"'\s]*)["']/i
        ];

        var streamUrl = "";
        for (var i = 0; i < patterns.length; i++) {
            var m = cleanHtml.match(patterns[i]);
            if (m && m[1]) {
                streamUrl = normalizeStreamUrl(m[1]);
                break;
            }
        }

        // 2. Nếu HTML chứa iframe embed lồng bên trong thay vì m3u8 trực tiếp
        var iframeUrl = "";
        if (!streamUrl) {
            var iframeMatch = cleanHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
            if (iframeMatch && iframeMatch[1]) {
                iframeUrl = normalizeStreamUrl(iframeMatch[1]);
            }
        }

        // Xác định Referer theo đúng host của link embed/iframe nếu có, fallback về embed.streamc.xyz
        var refUrl = sourceUrl || iframeUrl || "";
        var referer = getOriginFromUrl(refUrl);

        if (streamUrl) {
            return JSON.stringify({
                url: streamUrl,
                type: "hls",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": referer
                }
            });
        }

        if (iframeUrl) {
            return JSON.stringify({
                url: iframeUrl,
                type: "embed",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": sourceUrl || "https://phim.nguonc.com/"
                }
            });
        }

        // Fallback trả về sourceUrl nếu có để app mở trực tiếp thay vì chết hẳn
        if (sourceUrl) {
            return JSON.stringify({
                url: normalizeStreamUrl(sourceUrl),
                type: "embed",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": "https://phim.nguonc.com/"
                }
            });
        }

        return "{}";
    } catch (error) {
        return "{}";
    }
}

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

function parseYearsResponse(apiResponseJson) {
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var i = currentYear; i >= 2004; i--) {
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}

function getImageUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    var cleanPath = path.replace(/^\/+/, "");
    return "https://img.phimapi.com/" + cleanPath;
}
