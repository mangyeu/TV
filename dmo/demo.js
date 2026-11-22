// =============================================================================
// Missav.js — Plugin MissAV (theo chuẩn KKPhim)
// Base: https://missav.media
// Kiểu: scrape HTML (không có API JSON công khai)
// =============================================================================

var BASE_URL = "https://missav.media";
var DEFAULT_LOCALE = "vi"; // có thể đổi: en, ja, cn, zh...

// -----------------------------------------------------------------------------
// 1. MANIFEST
// -----------------------------------------------------------------------------

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "1.0.0",
        "baseUrl": BASE_URL,
        "iconUrl": "https://missav.media/img/favicon.png",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

// -----------------------------------------------------------------------------
// 2. HOME SECTIONS & CATEGORIES (dựa trên menu thực tế ở câu 2, 3)
// -----------------------------------------------------------------------------

function getHomeSections() {
    return JSON.stringify([
        { slug: 'new', title: 'Mới cập nhật', type: 'Horizontal', path: 'list' },
        { slug: 'release', title: 'Bản phát hành mới', type: 'Horizontal', path: 'list' },
        { slug: 'uncensored-leak', title: 'Rò rỉ không kiểm duyệt', type: 'Horizontal', path: 'list' },
        { slug: 'today-hot', title: 'Xem nhiều nhất hôm nay', type: 'Horizontal', path: 'list' },
        { slug: 'weekly-hot', title: 'Xem nhiều nhất tuần', type: 'Horizontal', path: 'list' },
        { slug: 'monthly-hot', title: 'Xem nhiều nhất tháng', type: 'Horizontal', path: 'list' },
        { slug: 'actresses', title: 'Nữ diễn viên', type: 'Horizontal', path: 'list' },
        { slug: 'genres', title: 'Thể loại', type: 'Horizontal', path: 'list' },
        { slug: 'makers', title: 'Nhà sản xuất', type: 'Horizontal', path: 'list' },
        { slug: 'new', title: 'Phim mới', type: 'Grid', path: 'list' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'new' },
        { name: 'Phát hành mới', slug: 'release' },
        { name: 'Không kiểm duyệt', slug: 'uncensored-leak' },
        { name: 'Hot hôm nay', slug: 'today-hot' },
        { name: 'Hot tuần', slug: 'weekly-hot' },
        { name: 'Hot tháng', slug: 'monthly-hot' },
        { name: 'Nữ diễn viên', slug: 'actresses' },
        { name: 'Thể loại', slug: 'genres' },
        { name: 'Nhà sản xuất', slug: 'makers' },
        { name: 'VR', slug: 'genres/VR' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'new' },
            { name: 'Phát hành', value: 'release' },
            { name: 'Xem nhiều', value: 'today-hot' }
        ]
    });
}

// -----------------------------------------------------------------------------
// 3. URL GENERATION
// -----------------------------------------------------------------------------

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var safeSlug = String(slug || "new").replace(/^\/+/, "");

        var url = BASE_URL + "/" + DEFAULT_LOCALE + "/" + safeSlug;
        if (page > 1) {
            url += "?page=" + page;
        }
        return url;
    } catch (e) {
        return BASE_URL + "/" + DEFAULT_LOCALE + "/new";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var q = encodeURIComponent((keyword || "").trim());
        var url = BASE_URL + "/" + DEFAULT_LOCALE + "/search?keyword=" + q;
        if (page > 1) url += "&page=" + page;
        return url;
    } catch (e) {
        return BASE_URL + "/" + DEFAULT_LOCALE + "/search?keyword=" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    // slug dạng: rctd-708-uncensored-leak
    return BASE_URL + "/" + DEFAULT_LOCALE + "/" + encodeURIComponent(slug || "");
}

function getUrlCategories() {
    return BASE_URL + "/" + DEFAULT_LOCALE + "/genres";
}

function getUrlCountries() {
    return ""; // MissAV không có country filter
}

function getUrlYears() {
    return ""; // MissAV không có year filter
}

function getLocalYearsJson() {
    return "[]";
}

// -----------------------------------------------------------------------------
// 4. HELPERS (scrape HTML thuần regex, không có DOM)
// -----------------------------------------------------------------------------

/** Decode HTML entities cơ bản */
function decodeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();
}

/** Lấy text bên trong thẻ đầu tiên khớp regex */
function firstMatch(html, regex) {
    var m = html.match(regex);
    return m && m[1] ? decodeHtml(m[1]) : "";
}

/** Lấy tất cả match (mảng group 1) */
function allMatches(html, regex) {
    var out = [];
    var m;
    var re = new RegExp(regex.source, regex.flags.indexOf("g") === -1 ? regex.flags + "g" : regex.flags);
    while ((m = re.exec(html)) !== null) {
        if (m[1] !== undefined) out.push(decodeHtml(m[1]));
    }
    return out;
}

/**
 * Parse các khối item phim từ HTML danh sách MissAV.
 * Dựa trên cấu trúc thực tế (thumbnail + title + duration + badge).
 */
function extractMovieItems(html) {
    var items = [];

    // Mỗi item có link dạng: /vi/{slug} hoặc /dm2/vi/{slug}
    // Ta bắt từng khối <div class="thumbnail group"> ... </div>
    var blockRegex = /<div[^>]*class="[^"]*thumbnail[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
    var block;
    var seen = {};

    while ((block = blockRegex.exec(html)) !== null) {
        var chunk = block[0] + block[1];

        // Lấy slug từ href
        var slug = firstMatch(chunk, /href="[^"]*?\/(?:dm2\/)?(?:[a-z]{2,3}\/)?([a-z0-9\-]+)"[^>]*>/i);
        if (!slug || seen[slug]) continue;
        seen[slug] = true;

        // Title từ alt hoặc từ <a ...>text</a>
        var title = firstMatch(chunk, /alt="([^"]+)"/i);
        if (!title) {
            title = firstMatch(chunk, /<a[^>]*>([^<]{3,})<\/a>/i);
        }

        // Ảnh cover
        var poster = firstMatch(chunk, /(?:data-src|src)="(https?:\/\/[^"]+cover[^"]+)"/i);

        // Duration: HH:MM:SS trong span
        var durationText = firstMatch(chunk, /(\d{1,2}:\d{2}:\d{2})/);

        items.push({
            slug: slug,
            title: title,
            poster: poster,
            duration: durationText
        });
    }

    // Fallback: nếu không bắt được khối, thử bắt tất cả link phim
    if (items.length === 0) {
        var links = allMatches(html, /<a[^>]*href="https?:\/\/missav\.media\/(?:dm2\/)?(?:[a-z]{2,3}\/)?([a-z0-9\-]{4,})"[^>]*>/gi);
        var uniq = {};
        for (var i = 0; i < links.length; i++) {
            var s = links[i];
            if (uniq[s]) continue;
            uniq[s] = true;
            items.push({ slug: s, title: s, poster: "", duration: "" });
        }
    }

    return items;
}

// -----------------------------------------------------------------------------
// 5. PARSERS
// -----------------------------------------------------------------------------

function parseListResponse(apiResponseJson) {
    // apiResponseJson ở đây là HTML thô của trang danh sách
    var html = String(apiResponseJson || "");
    var items = extractMovieItems(html);

    // Pagination: tìm "?page=N" lớn nhất trong HTML
    var pageNums = allMatches(html, /[?&]page=(\d+)/g).map(function (n) { return parseInt(n, 10) || 1; });
    var totalPages = pageNums.length ? Math.max.apply(null, pageNums) : 1;

    var movies = items.map(function (it) {
        return {
            id: it.slug,
            title: it.title || it.slug,
            posterUrl: it.poster || "",
            backdropUrl: it.poster || "",
            year: 0,
            quality: "",
            episode_current: it.duration || "",
            lang: ""
        };
    });

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: 1,
            totalPages: totalPages,
            totalItems: movies.length,
            itemsPerPage: 24
        }
    });
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    var html = String(apiResponseJson || "");
    try {
        // Title
        var title = firstMatch(html, /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
        if (!title) title = firstMatch(html, /<title>([^<]+)<\/title>/i);

        // Description
        var description = firstMatch(html, /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);

        // Poster
        var poster = firstMatch(html, /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);

        // Duration từ og:video:duration (giây)
        var durationSec = parseInt(firstMatch(html, /property="og:video:duration"[^>]*content="(\d+)"/i), 10) || 0;
        var duration = "";
        if (durationSec > 0) {
            var h = Math.floor(durationSec / 3600);
            var m = Math.floor((durationSec % 3600) / 60);
            var s = durationSec % 60;
            duration = (h > 0 ? h + ":" : "") +
                String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
        }

        // Release date
        var releaseDate = firstMatch(html, /property="og:video:release_date"[^>]*content="([^"]+)"/i);

        // Master m3u8 (nếu có nhúng trong HTML)
        var masterUrl = firstMatch(html, /(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);

        // Keywords → thể loại
        var keywords = firstMatch(html, /<meta[^>]*name="keywords"[^>]*content="([^"]+)"/i);

        // Servers: MissAV chỉ có 1 "server" chính là m3u8 master
        var servers = [];
        if (masterUrl) {
            servers.push({
                name: "MissAV",
                episodes: [{
                    id: masterUrl,
                    name: "Full",
                    slug: "full",
                    m3u8: masterUrl,
                    embed: ""
                }]
            });
        }

        return JSON.stringify({
            id: firstMatch(html, /<link[^>]*rel="canonical"[^>]*href="[^"]*?\/([a-z0-9\-]+)"/i) || "",
            title: title || "",
            originName: "",
            posterUrl: poster || "",
            backdropUrl: poster || "",
            description: description || "",
            year: releaseDate ? parseInt(releaseDate.substring(0, 4), 10) || 0 : 0,
            rating: 0,
            quality: "",
            duration: duration,
            servers: servers,
            episode_current: "",
            lang: DEFAULT_LOCALE,
            category: keywords || "",
            country: "Japan",
            director: "",
            casts: "",
            status: "",
            tmdbId: "",
            tmdbSeason: 0,
            tmdbType: ""
        });
    } catch (e) {
        return "null";
    }
}

/**
 * Resolve stream: MissAV dùng HLS m3u8 không DRM (câu 5).
 * Cần Referer + Origin để CDN không chặn.
 */
function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").trim();
    var isHls = /\.m3u8(\?|$)/i.test(raw);
    var isMp4 = /\.mp4(\?|$)/i.test(raw);

    return JSON.stringify({
        url: raw,
        isDirectStream: isHls || isMp4,
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Referer": BASE_URL + "/",
            "Origin": BASE_URL
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    // Ở đây apiResponseJson là HTML chi tiết; ta trích m3u8 master
    var html = String(apiResponseJson || "");
    var master = firstMatch(html, /(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
    return resolveStreamData(master);
}

function parseStreamResponse(apiResponseJson) {
    return parseDetailResponse(apiResponseJson);
}

function parseCategoriesResponse(apiResponseJson) {
    var html = String(apiResponseJson || "");
    // Trang /genres liệt kê link dạng /vi/genres/{slug}
    var slugs = allMatches(html, /href="[^"]*\/genres\/([a-z0-9\-]+)"/gi);
    var uniq = {};
    var out = [];
    for (var i = 0; i < slugs.length; i++) {
        if (uniq[slugs[i]]) continue;
        uniq[slugs[i]] = true;
        out.push({ name: slugs[i], slug: slugs[i] });
    }
    return JSON.stringify(out);
}

function parseCountriesResponse(_apiResponseJson) {
    return "[]";
}

function parseYearsResponse(_apiResponseJson) {
    return "[]";
}

// -----------------------------------------------------------------------------
// 6. BỔ SUNG cho engine (giống Kkphim)
// -----------------------------------------------------------------------------

function parseHomeSections(_apiResponseJson) { return getHomeSections(); }
function parsePrimaryCategories(_apiResponseJson) { return getPrimaryCategories(); }
function parseFilterConfig(_apiResponseJson) { return getFilterConfig(); }

function getHeaders() {
    return JSON.stringify({
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "Referer": BASE_URL + "/",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8"
    });
}

function getStreamHeaders() {
    return JSON.stringify({
        "User-Agent": "Mozilla/5.0",
        "Referer": BASE_URL + "/",
        "Origin": BASE_URL
    });
}

function getFallbackImageUrl() {
    return BASE_URL + "/img/favicon.png";
}

// -----------------------------------------------------------------------------
// 7. EXPORT
// -----------------------------------------------------------------------------

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        getManifest,
        getHomeSections,
        getPrimaryCategories,
        getFilterConfig,
        getUrlList,
        getUrlSearch,
        getUrlDetail,
        getUrlCategories,
        getUrlCountries,
        getUrlYears,
        getLocalYearsJson,
        parseListResponse,
        parseSearchResponse,
        parseMovieDetail,
        parseDetailResponse,
        parseStreamResponse,
        parseCategoriesResponse,
        parseCountriesResponse,
        parseYearsResponse,
        parseHomeSections,
        parsePrimaryCategories,
        parseFilterConfig,
        getHeaders,
        getStreamHeaders,
        getFallbackImageUrl,
        resolveStreamData
    };
}
