var BASE_API = "https://avdbapi.com/api.php/provide/vod";
var UPLOAD18_REFERER = "https://upload18.to/";
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi",
        "name": "AVDB JAV",
        "version": "1.0.1",
        "baseUrl": "https://avdbapi.com",
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
        { slug: '1', title: 'Censored', type: 'Horizontal', path: 'category' },
        { slug: '2', title: 'Uncensored', type: 'Horizontal', path: 'category' },
        { slug: '3', title: 'Uncensored Leaked', type: 'Horizontal', path: 'category' },
        { slug: '4', title: 'Amateur', type: 'Horizontal', path: 'category' },
        { slug: '5', title: 'Chinese AV', type: 'Horizontal', path: 'category' },
        { slug: '6', title: 'Western', type: 'Horizontal', path: 'category' },
        { slug: 'latest', title: 'Mới Cập Nhật', type: 'Grid', path: 'latest' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Censored', slug: '1' },
        { name: 'Uncensored', slug: '2' },
        { name: 'Uncensored Leaked', slug: '3' },
        { name: 'Amateur', slug: '4' },
        { name: 'Chinese AV', slug: '5' },
        { name: 'Western', slug: '6' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'desc' },
            { name: 'Cũ nhất', value: 'asc' }
        ],
        category: []
    });
}

// =============================================================================
// NHÓM 2: SINH URL (App gọi hàm → nhận URL → tự fetch HTTP)
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var url = BASE_API + "?ac=detail&pg=" + page + "&pagesize=24";

        if (/^[1-6]$/.test(slug)) {
            url += "&t=" + slug;
        } else if (slug === 'latest') {
            // Mới cập nhật - mặc định theo sort của API
        } else if (filters.category) {
            url += "&t=" + filters.category;
        }

        if (filters.year) url += "&year=" + filters.year;
        if (filters.sort) url += "&sort_direction=" + filters.sort;

        return url;
    } catch (e) {
        return BASE_API + "?ac=detail&pg=1&pagesize=24";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_API + "?ac=detail&wd=" + encodeURIComponent(keyword) + "&pg=" + page + "&pagesize=24";
}

function getUrlDetail(episodeId) {
    if (!episodeId) return "";

    // Nếu episodeId đã là URL đầy đủ (ví dụ: https://upload18.to/play/index/wpsl-285)
    if (episodeId.indexOf("http") === 0) {
        return episodeId;
    }

    // Nếu là numeric id (ví dụ: "134")
    if (/^\d+$/.test(episodeId)) {
        return BASE_API + "?ac=detail&ids=" + episodeId;
    }

    // Fallback theo mã phim / slug (ví dụ: "wpsl-285")
    return BASE_API + "?ac=detail&code=" + encodeURIComponent(episodeId) + "&pagesize=1";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER (App fetch URL xong → ném HTML/JSON thô vào đây → bạn parse)
// =============================================================================

function parseListResponse(html) {
    try {
        var response = JSON.parse(html);
        var list = response.list || [];

        var items = list.map(function (item) {
            return {
                id: String(item.id || ""),
                title: item.name || "",
                posterUrl: item.poster_url || "",
                backdropUrl: item.thumb_url || "",
                year: parseInt(item.year) || 0,
                quality: item.quality || "HD",
                episode_current: item.status || "",
                lang: item.movie_code || ""
            };
        });

        var currentPage = parseInt(response.page) || 1;
        var totalItems = parseInt(response.total) || 0;
        var itemsPerPage = parseInt(response.limit) || 24;
        var totalPages = parseInt(response.pagecount) || Math.ceil(totalItems / itemsPerPage);

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var response = JSON.parse(html);
        var list = response.list || [];
        if (list.length === 0) return "null";

        var movie = list[0];
        var servers = [];
        var eps = movie.episodes;

        if (eps && eps.server_data) {
            var serverEpisodes = [];
            var serverData = eps.server_data;

            for (var epName in serverData) {
                if (serverData.hasOwnProperty(epName)) {
                    var epInfo = serverData[epName] || {};
                    var streamOrEmbedId = epInfo.link_embed || epInfo.slug || movie.slug || "";
                    if (streamOrEmbedId) {
                        serverEpisodes.push({
                            id: streamOrEmbedId,
                            name: epName,
                            slug: epInfo.slug || epName.toLowerCase()
                        });
                    }
                }
            }

            if (serverEpisodes.length > 0) {
                servers.push({
                    name: eps.server_name || "VIP #1",
                    episodes: serverEpisodes
                });
            }
        }

        var categories = Array.isArray(movie.category)
            ? movie.category.join(", ")
            : (movie.category || "");
        var countries = Array.isArray(movie.country)
            ? movie.country.join(", ")
            : (movie.country || "");
        var directors = Array.isArray(movie.director)
            ? movie.director.filter(function (d) { return d !== "Updating"; }).join(", ")
            : (movie.director || "");
        var actors = Array.isArray(movie.actor)
            ? movie.actor.filter(function (a) { return a !== "Updating"; }).join(", ")
            : (movie.actor || "");

        return JSON.stringify({
            id: movie.slug || movie.movie_code || String(movie.id || ""),
            title: movie.name || "",
            originName: movie.origin_name || "",
            posterUrl: movie.poster_url || "",
            backdropUrl: movie.thumb_url || "",
            description: (movie.description || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year) || 0,
            rating: 0,
            quality: movie.quality || "HD",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.status || "",
            lang: movie.movie_code || "",
            category: categories,
            country: countries,
            director: directors,
            casts: actors,
            status: movie.status || ""
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html, pageUrl) {
    try {
        var headers = {
            "Referer": pageUrl || UPLOAD18_REFERER,
            "User-Agent": DEFAULT_UA
        };

        if (!html) {
            return JSON.stringify({
                url: pageUrl || "",
                isEmbed: true,
                headers: headers,
                subtitles: []
            });
        }

        // 1. Nếu nội dung trả về đã là playlist M3U8
        if (html.indexOf("#EXTM3U") !== -1 || html.indexOf("#EXT-X-") !== -1) {
            return JSON.stringify({
                url: pageUrl || "",
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: headers,
                subtitles: []
            });
        }

        // 2. Tìm trực tiếp link .m3u8 trong HTML/script
        var m3u8Match = html.match(/["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*?)["']/i);
        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1].replace(/\\\//g, "/"),
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: headers,
                subtitles: []
            });
        }

        // 3. Nếu có endpoint token_hash → fetch tiếp qua parseEmbedResponse
        var tokenMatch = html.match(/["']((?:https?:\/\/[^"'\s]+)?\/play\/token_hash[^"'\s]*?)["']/i);
        if (tokenMatch) {
            var tokenUrl = tokenMatch[1].replace(/\\\//g, "/");
            if (tokenUrl.indexOf("http") !== 0) {
                tokenUrl = "https://upload18.to" + (tokenUrl.charAt(0) === "/" ? "" : "/") + tokenUrl;
            }
            return JSON.stringify({
                url: tokenUrl,
                isEmbed: true,
                headers: headers,
                subtitles: []
            });
        }

        // 4. Mặc định trả về trang embed để WebView / Player xử lý
        return JSON.stringify({
            url: pageUrl || "",
            isEmbed: true,
            headers: headers,
            subtitles: []
        });
    } catch (e) {
        return JSON.stringify({
            url: pageUrl || "",
            isEmbed: true,
            headers: {
                "Referer": UPLOAD18_REFERER,
                "User-Agent": DEFAULT_UA
            },
            subtitles: []
        });
    }
}

function parseEmbedResponse(html, sourceUrl) {
    try {
        var headers = {
            "Referer": UPLOAD18_REFERER,
            "User-Agent": DEFAULT_UA
        };

        if (!html) {
            return JSON.stringify({ url: "", isEmbed: false });
        }

        // Nếu response là nội dung playlist M3U8 → trả sourceUrl để player phát
        if (html.indexOf("#EXTM3U") !== -1 || html.indexOf("#EXT-X-") !== -1) {
            return JSON.stringify({
                url: sourceUrl || "",
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: headers,
                subtitles: []
            });
        }

        // Nếu response là JSON hoặc text chứa link .m3u8
        var m3u8Match = html.match(/["']?(https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*?)["']?/i);
        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1].replace(/\\\//g, "/"),
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: headers,
                subtitles: []
            });
        }

        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false });
    }
}

function parseCategoriesResponse(html) {
    return JSON.stringify([
        { name: "Censored", slug: "1" },
        { name: "Uncensored", slug: "2" },
        { name: "Uncensored Leaked", slug: "3" },
        { name: "Amateur", slug: "4" },
        { name: "Chinese AV", slug: "5" },
        { name: "Western", slug: "6" }
    ]);
}

function parseCountriesResponse(html) {
    return JSON.stringify([
        { name: "Japan", value: "japan" },
        { name: "China", value: "china" },
        { name: "Western", value: "western" }
    ]);
}

function parseYearsResponse(html) {
    var years = [];
    for (var i = 2026; i >= 2010; i--) {
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}
