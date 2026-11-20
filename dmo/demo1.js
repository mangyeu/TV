/*
 * TVHAY.BUZZ - VAXPlayer Plugin
 * Version: 2.4.1
 * ES5 compatible
 */

var BASE_URL = "https://tvhay.buzz";
var PLUGIN_ID = "tvhay";
var DEFAULT_SERVER = "hpro";
var HPRO_SERVER_PARAM = "0";
var DEFAULT_STREAM_HOST = "https://v13.streamvsmov.com";

/* =========================
   LOGGING & UTILITIES
========================= */

function tvhayLog(msg) {
    if (typeof nativeLog !== "undefined") {
        nativeLog("[TVHAY] " + msg);
    } else if (typeof console !== "undefined" && console.log) {
        console.log("[TVHAY] " + msg);
    }
}

function trim(s) {
    return String(s || "").replace(/^\s+|\s+$/g, "");
}

function decodeHTML(s) {
    if (!s) return "";
    return String(s)
        .replace(/&/g, "&")
        .replace(/&/g, "&")
        .replace(/\\u0026/g, "&")
        .replace(/\\x3D/gi, "=")
        .replace(/\\\//g, "/")
        .replace(/"/g, '"')
        .replace(/'/g, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/&#(\d+);/g, function (m, n) {
            return String.fromCharCode(parseInt(n, 10));
        });
}

function absoluteURL(url, base) {
    var root = base || BASE_URL;
    url = trim(decodeHTML(url));

    if (!url) return "";

    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    if (url.indexOf("//") === 0) {
        return "https:" + url;
    }

    root = String(root || BASE_URL).replace(/\/+$/, "");

    if (url.charAt(0) === "/") {
        return root + url;
    }

    return root + "/" + url;
}

function cleanURL(url) {
    return absoluteURL(url);
}

function stripHTML(html) {
    return trim(
        decodeHTML(
            String(html || "")
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
        ).replace(/\s+/g, " ")
    );
}

function getAttr(html, name) {
    var re = new RegExp(
        name + "\\s*=\\s*[\"']([^\"']*)[\"']",
        "i"
    );
    var m = String(html || "").match(re);
    return m ? decodeHTML(m[1]) : "";
}

function getMeta(html, name) {
    var src = String(html || "");
    var re1 = new RegExp(
        '<meta[^>]+(?:property|name)=["\']' +
        name +
        '["\'][^>]+content=["\']([^"\']*)["\']',
        "i"
    );
    var m = src.match(re1);
    if (m) return decodeHTML(m[1]);

    var re2 = new RegExp(
        '<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']' +
        name +
        '["\']',
        "i"
    );
    m = src.match(re2);
    return m ? decodeHTML(m[1]) : "";
}

function getSlug(url) {
    var clean = String(url || "")
        .split("?")[0]
        .split("#")[0]
        .replace(/\/+$/, "");

    if (!clean) return "";
    var parts = clean.split("/");
    return parts.length ? parts[parts.length - 1] : "";
}

function getMovieTitle(html) {
    var title = getMeta(html, "og:title");

    if (!title) {
        var m = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        title = m ? stripHTML(m[1]) : "";
    }

    return trim(
        title
            .replace(/\s*\|\s*TVHAY.*$/i, "")
            .replace(/\s*-\s*TVHAY.*$/i, "")
    );
}

function getMovieImage(html) {
    return getMeta(html, "og:image") ||
        getMeta(html, "twitter:image") ||
        "";
}

function isWatchHTML(html, pageURL) {
    var u = String(pageURL || "");
    var h = String(html || "");
    if (/\/xem\//i.test(u)) return true;
    if (/<iframe[^>]+(?:streamvsmov|embed|player|m3u8)/i.test(h)) return true;
    if (/\.m3u8(?:\?|$|"|')/i.test(h)) return true;
    return false;
}

/* =========================
   MANIFEST & CONFIG
========================= */

function getManifest() {
    return {
        id: PLUGIN_ID,
        name: "TVHAY",
        title: "TVHAY.BUZZ",
        version: "2.4.1",
        baseUrl: BASE_URL,
        url: BASE_URL,
        language: "vi",
        type: "movie",
        enabled: true
    };
}

function getHomeSections() {
    return [
        {
            id: "latest",
            title: "Phim mới cập nhật",
            url: BASE_URL
        },
        {
            id: "series",
            title: "Phim bộ",
            url: BASE_URL + "/phim-bo"
        },
        {
            id: "movies",
            title: "Phim lẻ",
            url: BASE_URL + "/phim-le"
        },
        {
            id: "anime",
            title: "Anime",
            url: BASE_URL + "/hoat-hinh"
        }
    ];
}

function getPrimaryCategories() {
    return [
        {
            id: "phim-bo",
            name: "Phim bộ",
            url: BASE_URL + "/phim-bo"
        },
        {
            id: "phim-le",
            name: "Phim lẻ",
            url: BASE_URL + "/phim-le"
        },
        {
            id: "hoat-hinh",
            name: "Hoạt hình",
            url: BASE_URL + "/hoat-hinh"
        },
        {
            id: "tv-show",
            name: "TV Show",
            url: BASE_URL + "/tv-show"
        }
    ];
}

function getYears() {
    var result = [];
    var year = new Date().getFullYear();

    for (var i = year; i >= 2000; i--) {
        result.push({
            id: String(i),
            name: String(i)
        });
    }

    return result;
}

function getFilterConfig() {
    return {
        categories: getPrimaryCategories(),
        countries: [],
        years: getYears()
    };
}

/* =========================
   URL BUILDERS
========================= */

function getUrlList(page) {
    var p = parseInt(page || 1, 10);
    if (isNaN(p) || p <= 1) {
        return BASE_URL;
    }
    return BASE_URL + "/page/" + p;
}

function getUrlCategory(category, page) {
    var p = parseInt(page || 1, 10);
    var url = absoluteURL(category);

    if (!url) return BASE_URL;

    if (!isNaN(p) && p > 1) {
        url = url.replace(/\/+$/, "") + "/page/" + p;
    }

    return url;
}

function getUrlSearch(keyword, page) {
    var p = parseInt(page || 1, 10);
    var url = BASE_URL + "/?s=" + encodeURIComponent(keyword || "");

    if (!isNaN(p) && p > 1) {
        url += "&paged=" + p;
    }

    return url;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (/^https?:\/\//i.test(slug)) {
        return slug;
    }
    return BASE_URL + "/" + String(slug).replace(/^\/+/, "");
}

function getUrlWatch(slug, episode, server) {
    if (!slug) return "";

    var movieURL = /^https?:\/\//i.test(slug)
        ? slug
        : BASE_URL + "/" + String(slug).replace(/^\/+/, "");

    var movieSlug = getSlug(movieURL);
    var ep = episode || "tap-1";
    var srv = server || DEFAULT_SERVER;
    var serverParam = srv === "hpro" ? HPRO_SERVER_PARAM : "1";

    return BASE_URL +
        "/xem/" +
        movieSlug +
        "/" +
        ep +
        "?sv=" +
        serverParam;
}

function getUrlEpisode(slug, episode, server) {
    return getUrlWatch(slug, episode, server);
}

function getUrlPage(slug, episode) {
    return getUrlWatch(slug, episode, DEFAULT_SERVER);
}

function getUrlPageWatch(slug, episode) {
    return getUrlWatch(slug, episode, DEFAULT_SERVER);
}

function getUrlPlay(slug, episode, server) {
    return getUrlWatch(slug, episode, server);
}

function getUrlPlayer(slug, episode, server) {
    return getUrlWatch(slug, episode, server);
}

/* =========================
   HTML LIST & DETAIL PARSING
========================= */

function parseMovieList(html) {
    var result = [];
    var src = String(html || "");

    var items = src.match(/<article[\s\S]*?<\/article>/gi);
    if (!items) {
        items = src.match(/<li[^>]+class=["'][^"']*(?:item|movie|film|post)[^"']*["'][\s\S]*?<\/li>/gi);
    }
    if (!items) {
        items = src.match(/<div[^>]+class=["'][^"']*(?:movie-item|film-item|item-movie)[^"']*["'][\s\S]*?<\/div>/gi);
    }
    if (!items) return result;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var linkMatch = item.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
        if (!linkMatch) continue;

        var url = absoluteURL(linkMatch[1]);
        var title =
            getAttr(item, "title") ||
            getAttr(linkMatch[0], "title") ||
            getAttr(item, "alt");

        if (!title) {
            var titleMatch = item.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
            if (titleMatch) {
                title = stripHTML(titleMatch[1]);
            }
        }

        if (!title) {
            title = stripHTML(item);
        }

        var image =
            getAttr(item, "data-src") ||
            getAttr(item, "data-lazy-src") ||
            getAttr(item, "src") ||
            "";

        var imageMatch = item.match(/<img[^>]+>/i);
        if (imageMatch) {
            image =
                getAttr(imageMatch[0], "data-src") ||
                getAttr(imageMatch[0], "data-lazy-src") ||
                getAttr(imageMatch[0], "src") ||
                image;
        }

        var episodeMatch = item.match(/(?:Tập|Ep|Episode)\s*([^<"]+)/i);
        var qualityMatch = item.match(/\b(4K|Full\s*HD|HD|CAM|SD)\b/i);

        result.push({
            id: getSlug(url),
            title: trim(title),
            name: trim(title),
            url: url,
            detailUrl: url,
            image: absoluteURL(image),
            poster: absoluteURL(image),
            episode: episodeMatch ? trim(episodeMatch[1]) : "",
            quality: qualityMatch ? trim(qualityMatch[1]) : ""
        });
    }

    return result;
}

function parseListResponse(html) {
    var list = parseMovieList(html);
    return JSON.stringify({
        items: list,
        movies: list,
        page: 1
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseEpisodes(html, movieURL) {
    var episodes = [];
    var seen = {};
    var src = String(html || "");

    var links = src.match(/<a[^>]+href=["'][^"']*\/xem\/[^"']+["'][^>]*>[\s\S]*?<\/a>/gi);
    if (!links) {
        links = src.match(/<a[^>]+href=["'][^"']*tap-[^"']+["'][^>]*>[\s\S]*?<\/a>/gi);
    }

    if (!links) {
        var fallbackURL = getUrlWatch(movieURL, "tap-1");
        if (fallbackURL) {
            episodes.push({
                id: "tap-1",
                name: "Tập 1",
                title: "Tập 1",
                episode: "tap-1",
                url: fallbackURL,
                page: fallbackURL
            });
        }
        return episodes;
    }

    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var href = getAttr(link, "href");
        if (!href) continue;

        var watchURL = absoluteURL(href);
        if (seen[watchURL]) continue;
        seen[watchURL] = true;

        var label = stripHTML(link) || ("Tập " + (episodes.length + 1));
        var epSlug = getSlug(watchURL) || ("tap-" + (episodes.length + 1));

        episodes.push({
            id: epSlug,
            name: label,
            title: label,
            episode: epSlug,
            url: watchURL,
            page: watchURL
        });
    }

    return episodes;
}

function parseMovieDetail(html, url) {
    var src = String(html || "");
    var cleanUrl = absoluteURL(url);
    var title = getMovieTitle(src);
    var image = absoluteURL(getMovieImage(src));
    var description = stripHTML(
        getMeta(src, "og:description") ||
        getMeta(src, "description") ||
        ""
    );

    return {
        id: getSlug(cleanUrl),
        title: title,
        name: title,
        url: cleanUrl,
        detailUrl: cleanUrl,
        image: image,
        poster: image,
        description: description,
        episodes: parseEpisodes(src, cleanUrl),
        servers: [
            { id: "hpro", name: "H.PRO" },
            { id: "spro", name: "S.PRO" }
        ]
    };
}

function parseDetailMovie(html, url) {
    return parseMovieDetail(html, url);
}

/* =========================
   STREAM & EMBED EXTRACTION
========================= */

function normalizeStreamHTML(html) {
    return decodeHTML(html);
}

function extractIframeURL(html, baseUrl) {
    var src = normalizeStreamHTML(html);
    var patterns = [
        /<iframe[^>]+src=["']([^"']+)["']/i,
        /<iframe[^>]+data-src=["']([^"']+)["']/i,
        /iframe[^>]+src\s*=\s*["']([^"']+)["']/i,
        /movie-iframe[^>]*src=["']([^"']+)["']/i,
        /["'](?:embed|player|iframe)["']\s*:\s*["']([^"']+)["']/i
    ];

    for (var i = 0; i < patterns.length; i++) {
        var m = src.match(patterns[i]);
        if (m && m[1]) {
            return absoluteURL(m[1], baseUrl || BASE_URL);
        }
    }

    return "";
}

function extractVideoID(urlOrHtml) {
    var text = normalizeStreamHTML(urlOrHtml);
    var patterns = [
        /streamvsmov\.com\/video\/([a-zA-Z0-9-]+)/i,
        /streamvsmov\.com\/stream\/([a-zA-Z0-9-]+)/i,
        /\/video\/([a-f0-9-]{8,})/i,
        /\/stream\/([a-f0-9-]{8,})/i
    ];

    for (var i = 0; i < patterns.length; i++) {
        var m = text.match(patterns[i]);
        if (m && m[1]) {
            return m[1];
        }
    }

    return "";
}

function extractM3U8URL(html) {
    var src = normalizeStreamHTML(html);
    var m = src.match(/https?:\/\/[^"'<> \r\n]+\.m3u8(?:\?[^"'<> \r\n]*)?/i);
    return m ? m[0] : "";
}

function convertVideoToHLS(urlOrId) {
    var raw = trim(urlOrId);
    if (!raw) return "";

    if (/\.m3u8(?:\?|$)/i.test(raw)) {
        return raw;
    }

    var id = /^[a-zA-Z0-9-]{8,}$/.test(raw) ? raw : extractVideoID(raw);
    if (!id) return "";

    var hostMatch = raw.match(/^(https?:\/\/[^/]+)/i);
    var host = (hostMatch && /streamvsmov\.com/i.test(hostMatch[1]))
        ? hostMatch[1]
        : DEFAULT_STREAM_HOST;

    return host + "/stream/" + id + "/master.m3u8";
}

function extractStreamURL(html, baseUrl) {
    var src = normalizeStreamHTML(html);

    var directM3U8 = extractM3U8URL(src);
    if (directM3U8) {
        return directM3U8;
    }

    var vsmMatch = src.match(/https?:\/\/[^"'<> \r\n]*streamvsmov\.com\/video\/[a-zA-Z0-9-]+/i);
    if (vsmMatch) {
        return convertVideoToHLS(vsmMatch[0]);
    }

    var iframeURL = extractIframeURL(src, baseUrl);
    if (iframeURL) {
        if (/\.m3u8(?:\?|$)/i.test(iframeURL)) {
            return iframeURL;
        }
        var converted = convertVideoToHLS(iframeURL);
        if (converted) {
            return converted;
        }
    }

    return "";
}

function parseWatchPage(html, pageURL) {
    var src = normalizeStreamHTML(html);
    var ref = pageURL || (BASE_URL + "/");

    var directStream = extractM3U8URL(src);
    if (directStream) {
        return {
            url: directStream,
            embedUrl: "",
            page: ref,
            isEmbed: false,
            mimeType: "application/x-mpegURL",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": ref
            },
            subtitles: []
        };
    }

    var embedUrl = extractIframeURL(src, ref);
    if (embedUrl) {
        if (/\.m3u8(?:\?|$)/i.test(embedUrl)) {
            return {
                url: embedUrl,
                embedUrl: embedUrl,
                page: ref,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": ref
                },
                subtitles: []
            };
        }

        return {
            url: embedUrl,
            embedUrl: embedUrl,
            page: ref,
            isEmbed: true,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": ref
            },
            subtitles: []
        };
    }

    var fallbackHLS = convertVideoToHLS(src);
    if (fallbackHLS) {
        return {
            url: fallbackHLS,
            embedUrl: "",
            page: ref,
            isEmbed: false,
            mimeType: "application/x-mpegURL",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": ref,
                "Origin": DEFAULT_STREAM_HOST
            },
            subtitles: []
        };
    }

    return {
        url: "",
        embedUrl: "",
        page: ref,
        isEmbed: false,
        headers: {},
        subtitles: []
    };
}

function parseEmbedResponse(htmlContent, url) {
    try {
        var src = normalizeStreamHTML(htmlContent);
        var ref = normalizeStreamHTML(url || "");

        tvhayLog("parseEmbedResponse: " + ref);

        var streamUrl = extractM3U8URL(src);
        if (streamUrl) {
            return JSON.stringify({
                url: streamUrl,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": ref || (BASE_URL + "/")
                },
                subtitles: []
            });
        }

        var videoID = extractVideoID(ref) || extractVideoID(src);
        if (videoID) {
            var generated = convertVideoToHLS(videoID);
            return JSON.stringify({
                url: generated,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": ref || (BASE_URL + "/"),
                    "Origin": DEFAULT_STREAM_HOST
                },
                subtitles: []
            });
        }

        var nestedIframe = extractIframeURL(src, ref);
        if (nestedIframe) {
            return JSON.stringify({
                url: nestedIframe,
                isEmbed: true,
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": ref || (BASE_URL + "/")
                },
                subtitles: []
            });
        }

        return JSON.stringify({
            url: "",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    } catch (e) {
        tvhayLog("parseEmbedResponse error: " + e);
        return JSON.stringify({
            url: "",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}

/*
 * Hỗ trợ cả 2 ngữ cảnh nếu VAXPlayer gọi parseDetailResponse:
 * - Nếu là trang xem (/xem/...) hoặc trang có player/iframe -> trả về stream/embed info
 * - Nếu là trang chi tiết phim -> trả về thông tin phim + danh sách tập
 */
function parseDetailResponse(html, pageURL) {
    try {
        if (isWatchHTML(html, pageURL)) {
            return JSON.stringify(parseWatchPage(html, pageURL));
        }
        return JSON.stringify(parseMovieDetail(html, pageURL));
    } catch (e) {
        tvhayLog("parseDetailResponse error: " + e);
        return JSON.stringify({
            url: "",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}

/* =========================
   DEBUG
========================= */

function debugStream(html, pageURL) {
    var result = parseWatchPage(html, pageURL);
    return JSON.stringify({
        inputPage: pageURL,
        iframe: result.embedUrl,
        stream: result.url,
        page: result.page,
        success: !!result.url,
        result: result
    });
}

/* =========================
   EXPORT
========================= */

var TVHAY_PLUGIN = {
    getManifest: getManifest,
    getHomeSections: getHomeSections,
    getPrimaryCategories: getPrimaryCategories,
    getFilterConfig: getFilterConfig,
    getYears: getYears,

    getUrlList: getUrlList,
    getUrlCategory: getUrlCategory,
    getUrlSearch: getUrlSearch,
    getUrlDetail: getUrlDetail,

    getUrlWatch: getUrlWatch,
    getUrlEpisode: getUrlEpisode,
    getUrlPage: getUrlPage,
    getUrlPageWatch: getUrlPageWatch,
    getUrlPlay: getUrlPlay,
    getUrlPlayer: getUrlPlayer,

    parseMovieList: parseMovieList,
    parseListResponse: parseListResponse,
    parseSearchResponse: parseSearchResponse,

    parseMovieDetail: parseMovieDetail,
    parseDetailMovie: parseDetailMovie,
    parseDetailResponse: parseDetailResponse,

    parseEpisodes: parseEpisodes,
    parseWatchPage: parseWatchPage,
    parseEmbedResponse: parseEmbedResponse,

    extractIframeURL: extractIframeURL,
    extractStreamURL: extractStreamURL,
    convertVideoToHLS: convertVideoToHLS,
    debugStream: debugStream
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = TVHAY_PLUGIN;
}

if (typeof exports !== "undefined") {
    exports.getManifest = getManifest;
    exports.getHomeSections = getHomeSections;
    exports.getPrimaryCategories = getPrimaryCategories;
    exports.getFilterConfig = getFilterConfig;
    exports.getYears = getYears;

    exports.getUrlList = getUrlList;
    exports.getUrlCategory = getUrlCategory;
    exports.getUrlSearch = getUrlSearch;
    exports.getUrlDetail = getUrlDetail;

    exports.getUrlWatch = getUrlWatch;
    exports.getUrlEpisode = getUrlEpisode;
    exports.getUrlPage = getUrlPage;
    exports.getUrlPageWatch = getUrlPageWatch;
    exports.getUrlPlay = getUrlPlay;
    exports.getUrlPlayer = getUrlPlayer;

    exports.parseMovieList = parseMovieList;
    exports.parseListResponse = parseListResponse;
    exports.parseSearchResponse = parseSearchResponse;

    exports.parseMovieDetail = parseMovieDetail;
    exports.parseDetailMovie = parseDetailMovie;
    exports.parseDetailResponse = parseDetailResponse;

    exports.parseEpisodes = parseEpisodes;
    exports.parseWatchPage = parseWatchPage;
    exports.parseEmbedResponse = parseEmbedResponse;

    exports.extractIframeURL = extractIframeURL;
    exports.extractStreamURL = extractStreamURL;
    exports.convertVideoToHLS = convertVideoToHLS;
    exports.debugStream = debugStream;
}
