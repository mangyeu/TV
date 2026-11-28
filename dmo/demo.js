// =============================================================================
// VAAPP Plugin - AVDB API (MacCMS V10 format)
// =============================================================================

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi_v2",
        "name": "AVDB JAV (API)",
        "version": "1.0.0",
        "baseUrl": "https://avdbapi.com/api.php/provide/vod",
        "iconUrl": "https://avdbapi.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'latest', title: 'Mới Cập Nhật', type: 'Grid', path: '' },
        { slug: '3', title: 'Uncensored Leaked', type: 'Horizontal', path: 'category' },
        { slug: '1', title: 'Censored', type: 'Horizontal', path: 'category' },
        { slug: '2', title: 'Uncensored', type: 'Horizontal', path: 'category' },
        { slug: '4', title: 'Amateur', type: 'Horizontal', path: 'category' },
        { slug: '5', title: 'Chinese AV', type: 'Horizontal', path: 'category' },
        { slug: '6', title: 'Western', type: 'Horizontal', path: 'category' }
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
        ]
    });
}

// =============================================================================
// NHÓM 2: SINH URL
// =============================================================================

var BASE_API = "https://avdbapi.com/api.php/provide/vod";

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var url = BASE_API + "?ac=detail&pg=" + page;

        if (/^[1-6]$/.test(slug)) {
            url += "&t=" + slug;
        } else if (slug === 'latest') {
            // default sort by time
        } else if (filters.category) {
            url += "&t=" + filters.category;
        }

        if (filters.year) url += "&year=" + filters.year;
        if (filters.sort) url += "&sort_direction=" + filters.sort;

        return url;
    } catch (e) {
        return BASE_API + "?ac=detail&pg=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_API + "?ac=detail&wd=" + encodeURIComponent(keyword) + "&pg=" + page;
}

function getUrlDetail(episodeId) {
    // episodeId = embed URL (https://upload18.to/play/index/xxx) → fetch trực tiếp
    if (episodeId.indexOf("http") === 0) {
        return episodeId;
    }
    // numeric id → dùng ids= parameter
    if (/^\d+$/.test(episodeId)) {
        return BASE_API + "?ac=detail&ids=" + episodeId;
    }
    // fallback: tìm theo mã phim (vd: dldss-574-uncensored-leak)
    return BASE_API + "?ac=detail&wd=" + encodeURIComponent(episodeId) + "&pagesize=1";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var list = response.list || [];

        var movies = list.map(function (item) {
            return {
                id: String(item.vod_id || ""),
                title: item.vod_name || "",
                posterUrl: item.vod_pic || "",
                backdropUrl: item.vod_pic_thumb || item.vod_pic_slide || "",
                year: parseInt(item.vod_year) || 0,
                quality: item.vod_version || "HD",
                episode_current: item.vod_remarks || "",
                lang: item.vod_lang || "",
                rating: parseFloat(item.vod_score) || 0,
                duration: item.vod_duration || ""
            };
        });

        var currentPage = parseInt(response.page) || 1;
        var totalPages = parseInt(response.pagecount) || 1;
        var totalItems = parseInt(response.total) || 0;
        var itemsPerPage = parseInt(response.limit) || 100;

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
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var list = response.list || [];
        if (list.length === 0) return "null";

        var movie = list[0];

        // Parse servers từ vod_play_from / vod_play_url
        // vod_play_from = "ngm3u8"
        // vod_play_url  = "Full$https://upload18.to/play/index/dldss-574-uncensored-leak"
        var servers = [];
        var playFromArr = (movie.vod_play_from || "").split("$$$");
        var playUrlArr = (movie.vod_play_url || "").split("$$$");

        for (var i = 0; i < playUrlArr.length; i++) {
            var serverName = playFromArr[i] || ("Server #" + (i + 1));
            var epString = playUrlArr[i] || "";
            if (!epString) continue;

            var episodes = [];
            var epParts = epString.split("#");
            for (var j = 0; j < epParts.length; j++) {
                var ep = epParts[j];
                if (!ep) continue;
                var dollarIdx = ep.indexOf("$");
                if (dollarIdx === -1) continue;

                var epName = ep.substring(0, dollarIdx).trim();
                var epUrl = ep.substring(dollarIdx + 1).trim();
                if (!epUrl) continue;

                episodes.push({
                    id: epUrl,               // embed URL → dùng getUrlDetail để fetch
                    name: epName || ("Tập " + (j + 1)),
                    slug: epUrl
                });
            }

            if (episodes.length > 0) {
                servers.push({
                    name: serverName,
                    episodes: episodes
                });
            }
        }

        var categories = Array.isArray(movie.vod_class) ? movie.vod_class.join(", ") : (movie.vod_class || "");
        var country = movie.vod_area || "";
        var director = movie.vod_director || "";
        var actors = movie.vod_actor || "";

        // Lấy mô tả: ưu tiên vod_content, fallback vod_blurb
        var description = (movie.vod_content || movie.vod_blurb || "").replace(/<[^>]*>/g, "");

        return JSON.stringify({
            id: movie.vod_id ? String(movie.vod_id) : (movie.vod_sub || ""),
            title: movie.vod_name || "",
            originName: movie.vod_en || "",
            posterUrl: movie.vod_pic || "",
            backdropUrl: movie.vod_pic_slide || movie.vod_pic_thumb || "",
            description: description,
            year: parseInt(movie.vod_year) || 0,
            rating: parseFloat(movie.vod_score) || 0,
            quality: movie.vod_version || "HD",
            duration: movie.vod_duration || "",
            servers: servers,
            episode_current: movie.vod_remarks || "",
            lang: movie.vod_lang || "",
            category: categories,
            country: country,
            director: director,
            casts: actors,
            status: movie.vod_state || movie.vod_remarks || ""
        });
    } catch (error) { return "null"; }
}

// =============================================================================
// STREAM LINK
// =============================================================================

    function parseDetailResponse(embedHtml, pageUrl) {
    var headers = {
        "Referer": "https://upload18.to/",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
    };

    // Luôn trả URL embed gốc — đã xác nhận phát được
    return JSON.stringify({
        url: pageUrl || "",
        isEmbed: true,
        headers: headers,
        subtitles: []
    });
}

        // Trường hợp 2: HTML embed page (JWPlayer, Cloudflare, token_hash)
        if (embedHtml.indexOf("PLAYER_CONFIG") !== -1 ||
            embedHtml.indexOf("jwplayer") !== -1 ||
            embedHtml.indexOf("token_hash") !== -1 ||
            embedHtml.indexOf("<video") !== -1) {
            return JSON.stringify({
                url: pageUrl || "",
                isEmbed: true,
                headers: {
                    "Referer": "https://upload18.to/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                },
                subtitles: []
            });
        }

        // Trường hợp 3: tìm link m3u8 trực tiếp trong HTML
        var m3u8Match = embedHtml.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*?)["']/);
        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1],
                isEmbed: false,
                headers: {
                    "Referer": "https://upload18.to/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                },
                subtitles: []
            });
        }

        // Fallback: load embed URL bằng WebView
        return JSON.stringify({
            url: pageUrl || "",
            isEmbed: true,
            headers: {
                "Referer": "https://upload18.to/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            },
            subtitles: []
        });
    } catch (error) { return "{}"; }
}

function parseEmbedResponse(m3u8Content, tokenUrl) {
    try {
        if (m3u8Content.indexOf("#EXTM3U") !== -1 || m3u8Content.indexOf("#EXT-X-") !== -1) {
            return JSON.stringify({
                url: tokenUrl,
                headers: {
                    "Referer": "https://upload18.to/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                },
                subtitles: []
            });
        }
        return "{}";
    } catch (error) { return "{}"; }
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
        { name: "Japan", value: "Japan" },
        { name: "China", value: "China" },
        { name: "Western", value: "Western" }
    ]);
}

function parseYearsResponse(apiResponseJson) {
    var years = [];
    for (var i = 2026; i >= 2010; i--) {
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}
