/*
 * TVHAY.BUZZ - VAXPlayer Plugin
 * Version: 2.4.0
 * ES5 compatible
 */

var BASE_URL = "https://tvhay.buzz";
var PLUGIN_ID = "tvhay";
var DEFAULT_SERVER = "hpro";
var HPRO_SERVER_PARAM = "0";

/* =========================
   UTILITIES
========================= */

function trim(s) {
    return String(s || "").replace(/^\s+|\s+$/g, "");
}

function decodeHTML(s) {
    if (!s) return "";
    return String(s)
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#(\d+);/g, function (m, n) {
            return String.fromCharCode(parseInt(n, 10));
        });
}

function absoluteURL(url) {
    url = trim(decodeHTML(url));

    if (!url) return "";

    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    if (url.indexOf("//") === 0) {
        return "https:" + url;
    }

    if (url.charAt(0) === "/") {
        return BASE_URL + url;
    }

    return BASE_URL + "/" + url;
}

function cleanURL(url) {
    return absoluteURL(url)
        .replace(/&amp;/g, "&")
        .replace(/&#038;/g, "&");
}

function stripHTML(html) {
    return decodeHTML(String(html || "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " "))
        .replace(/\s+/g, " ")
        .trim();
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
    var re = new RegExp(
        '<meta[^>]+(?:property|name)=["\']' +
        name +
        '["\'][^>]+content=["\']([^"\']+)["\']',
        "i"
    );

    var m = String(html || "").match(re);

    if (m) return decodeHTML(m[1]);

    re = new RegExp(
        '<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']' +
        name +
        '["\']',
        "i"
    );

    m = String(html || "").match(re);

    return m ? decodeHTML(m[1]) : "";
}

function getSlug(url) {
    url = String(url || "").replace(/\/+$/, "");

    var parts = url.split("/");

    return parts.length ? parts[parts.length - 1] : "";
}

function getMovieTitle(html) {
    var title = getMeta(html, "og:title");

    if (!title) {
        var m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        title = m ? stripHTML(m[1]) : "";
    }

    return trim(title)
        .replace(/\s*\|\s*TVHAY.*$/i, "")
        .replace(/\s*-\s*TVHAY.*$/i, "");
}

function getMovieImage(html) {
    return getMeta(html, "og:image") ||
        getMeta(html, "twitter:image");
}

/* =========================
   MANIFEST
========================= */

function getManifest() {
    return {
        id: PLUGIN_ID,
        name: "TVHAY",
        title: "TVHAY.BUZZ",
        version: "2.4.0",
        baseUrl: BASE_URL,
        url: BASE_URL,
        language: "vi",
        type: "movie",
        enabled: true
    };
}

/* =========================
   HOME
========================= */

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

function getFilterConfig() {
    return {
        categories: getPrimaryCategories(),
        countries: [],
        years: getYears()
    };
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

/* =========================
   URL BUILDERS
========================= */

function getUrlList(page) {
    page = parseInt(page || 1, 10);

    if (page <= 1) {
        return BASE_URL;
    }

    return BASE_URL + "/page/" + page;
}

function getUrlCategory(category, page) {
    page = parseInt(page || 1, 10);

    var url = absoluteURL(category);

    if (page > 1) {
        url = url.replace(/\/$/, "") + "/page/" + page;
    }

    return url;
}

function getUrlSearch(keyword, page) {
    page = parseInt(page || 1, 10);

    var url = BASE_URL + "/";

    url += "?s=" + encodeURIComponent(keyword || "");

    if (page > 1) {
        url += "&paged=" + page;
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

    var movieURL;

    if (/^https?:\/\//i.test(slug)) {
        movieURL = slug;
    } else {
        movieURL = BASE_URL + "/" + String(slug).replace(/^\/+/, "");
    }

    var movieSlug = getSlug(movieURL);

    episode = episode || "tap-1";
    server = server || DEFAULT_SERVER;

    var serverParam = server === "hpro"
        ? HPRO_SERVER_PARAM
        : "1";

    return BASE_URL +
        "/xem/" +
        movieSlug +
        "/" +
        episode +
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
   HTML PARSING
========================= */

function parseMovieList(html) {
    var result = [];
    var items = String(html || "").match(
        /<article[\s\S]*?<\/article>/gi
    );

    if (!items) {
        items = String(html || "").match(
            /<div[^>]+class=["'][^"']*(?:item|movie|film)[^"']*["'][\s\S]*?<\/div>/gi
        );
    }

    if (!items) return result;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        var linkMatch = item.match(
            /<a[^>]+href=["']([^"']+)["'][^>]*>/i
        );

        if (!linkMatch) continue;

        var url = absoluteURL(linkMatch[1]);

        var title =
            getAttr(item, "title") ||
            getAttr(item, "alt");

        if (!title) {
            var titleMatch = item.match(
                /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i
            );

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
            getAttr(item, "src");

        var imageMatch = item.match(
            /<img[^>]+(?:src|data-src)=["']([^"']+)["']/i
        );

        if (imageMatch) {
            image = imageMatch[1];
        }

        var episodeMatch = item.match(
            /(?:Tập|Ep|Episode)\s*([^<]+)/i
        );

        var qualityMatch = item.match(
            /(HD|Full HD|4K|CAM|SD)/i
        );

        result.push({
            id: getSlug(url),
            title: trim(title),
            name: trim(title),
            url: url,
            detailUrl: url,
            image: absoluteURL(image),
            poster: absoluteURL(image),
            episode: episodeMatch
                ? trim(episodeMatch[1])
                : "",
            quality: qualityMatch
                ? qualityMatch[1]
                : ""
        });
    }

    return result;
}

function parseListResponse(html) {
    return JSON.stringify({
        items: parseMovieList(html),
        movies: parseMovieList(html),
        page: 1
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

/* =========================
   DETAIL
========================= */

function parseMovieDetail(html, url) {
    html = String(html || "");

    var title = getMovieTitle(html);

    var image = getMovieImage(html);

    var description =
        getMeta(html, "og:description") ||
        getMeta(html, "description");

    var episodes = parseEpisodes(html, url);

    var movie = {
        id: getSlug(url),
        title: title,
        name: title,
        url: absoluteURL(url),
        detailUrl: absoluteURL(url),
        image: absoluteURL(image),
        poster: absoluteURL(image),
        description: stripHTML(description),
        episodes: episodes,
        servers: [
            {
                id: "hpro",
                name: "H.PRO"
            },
            {
                id: "spro",
                name: "S.PRO"
            }
        ]
    };

    return movie;
}

function parseDetailMovie(html, url) {
    return parseMovieDetail(html, url);
}

function parseDetailResponse(html, url) {
    var detail = parseMovieDetail(html, url);

    return JSON.stringify(detail);
}

/* =========================
   EPISODES
========================= */

function parseEpisodes(html, movieURL) {
    var episodes = [];

    html = String(html || "");

    var links = html.match(
        /<a[^>]+href=["'][^"']*\/xem\/[^"']+["'][^>]*>[\s\S]*?<\/a>/gi
    );

    if (!links) {
        links = html.match(
            /<a[^>]+href=["'][^"']*tap-[^"']+["'][^>]*>/gi
        );
    }

    if (!links) {
        var watchURL = getUrlWatch(movieURL, "tap-1");

        episodes.push({
            id: "tap-1",
            name: "Tập 1",
            title: "Tập 1",
            episode: "tap-1",
            url: watchURL,
            page: watchURL
        });

        return episodes;
    }

    for (var i = 0; i < links.length; i++) {
        var link = links[i];

        var href = getAttr(link, "href");

        if (!href) {
            var hrefMatch = link.match(
                /href=["']([^"']+)["']/i
            );

            if (hrefMatch) {
                href = hrefMatch[1];
            }
        }

        href = absoluteURL(href);

        var label = stripHTML(link);

        if (!label) {
            label = "Tập " + (i + 1);
        }

        var episodeSlug = getSlug(href);

        var watchURL = href;

        episodes.push({
            id: episodeSlug,
            name: label,
            title: label,
            episode: episodeSlug,
            url: watchURL,
            page: watchURL
        });
    }

    return episodes;
}

/* =========================
   PLAYER / STREAM
========================= */

function normalizeStreamHTML(html) {
    return String(html || "")
        .replace(/\\u0026/g, "&")
        .replace(/\\\//g, "/")
        .replace(/&amp;/g, "&")
        .replace(/\\x3D/g, "=")
        .replace(/&quot;/g, '"');
}

function extractIframeURL(html) {
    html = normalizeStreamHTML(html);

    var iframePatterns = [
        /<iframe[^>]+src=["']([^"']+)["']/gi,
        /iframe[^>]+src\s*=\s*["']([^"']+)["']/gi,
        /["'](?:embed|player|iframe)["']\s*:\s*["']([^"']+)["']/gi
    ];

    for (var i = 0; i < iframePatterns.length; i++) {
        var re = iframePatterns[i];
        var m = re.exec(html);

        if (m && m[1]) {
            return absoluteURL(m[1]);
        }
    }

    return "";
}

function extractVideoID(url) {
    url = String(url || "");

    var m = url.match(
        /\/video\/([a-f0-9-]+)/i
    );

    if (m) return m[1];

    m = url.match(
        /\/stream\/([a-f0-9-]+)/i
    );

    if (m) return m[1];

    return "";
}

function convertVideoToHLS(url) {
    url = String(url || "");

    if (/\.m3u8(?:\?|$)/i.test(url)) {
        return url;
    }

    var id = extractVideoID(url);

    if (!id) {
        return "";
    }

    return "https://v13.streamvsmov.com/stream/" +
        id +
        "/master.m3u8";
}

function extractStreamURL(html) {
    html = normalizeStreamHTML(html);

    /*
     * Direct HLS
     */
    var m = html.match(
        /https?:\/\/[^"'<> \s]+\.m3u8(?:\?[^"'<> \s]*)?/i
    );

    if (m) {
        return m[0].replace(/&amp;/g, "&");
    }

    /*
     * VSM video URL
     */
    m = html.match(
        /https?:\/\/[^"'<> \s]*streamvsmov\.com\/video\/[a-z0-9-]+/i
    );

    if (m) {
        return convertVideoToHLS(m[0]);
    }

    /*
     * iframe URL
     */
    var iframeURL = extractIframeURL(html);

    if (iframeURL) {
        var converted = convertVideoToHLS(iframeURL);

        if (converted) {
            return converted;
        }

        if (/\.m3u8/i.test(iframeURL)) {
            return iframeURL;
        }
    }

    /*
     * Raw video URL
     */
    m = html.match(
        /https?:\/\/[^"'<> \s]*\/video\/[a-z0-9-]+/i
    );

    if (m) {
        return convertVideoToHLS(m[0]);
    }

    return "";
}

/* =========================
   WATCH PAGE
========================= */

function parseWatchPage(html, pageURL) {
    html = normalizeStreamHTML(html);

    pageURL = absoluteURL(pageURL);

    var iframeURL = extractIframeURL(html);

    var streamURL = extractStreamURL(html);

    var title = getMovieTitle(html);

    /*
     * IMPORTANT:
     * page is the TVHAY watch page.
     * embedUrl is the iframe page.
     * url is the direct HLS stream.
     */

    return {
        page: pageURL,
        watchPage: pageURL,
        embedUrl: iframeURL,
        iframe: iframeURL,
        url: streamURL,
        streamUrl: streamURL,
        title: title,
        isDirectStream: !!streamURL,
        type: streamURL ? "hls" : "embed",
        headers: {
            Referer: BASE_URL + "/",
            Origin: BASE_URL
        },
        subtitles: []
    };
}

/*
 * VAXPlayer thường gọi hàm này sau khi
 * lấy HTML của trang xem.
 */
function parseDetailResponse(html, pageURL) {
    var result = parseWatchPage(html, pageURL);

    return JSON.stringify(result);
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

    extractIframeURL: extractIframeURL,
    extractStreamURL: extractStreamURL,
    convertVideoToHLS: convertVideoToHLS,
    parseWatchPage: parseWatchPage,
    debugStream: debugStream
};

/*
 * Export for plugin engines.
 */
if (typeof module !== "undefined" && module.exports) {
    module.exports = TVHAY_PLUGIN;
}

if (typeof exports !== "undefined") {
    exports.getManifest = getManifest;
    exports.getHomeSections = getHomeSections;
    exports.getPrimaryCategories = getPrimaryCategories;
    exports.getFilterConfig = getFilterConfig;

    exports.getUrlList = getUrlList;
    exports.getUrlSearch = getUrlSearch;
    exports.getUrlDetail = getUrlDetail;
    exports.getUrlWatch = getUrlWatch;
    exports.getUrlEpisode = getUrlEpisode;

    exports.parseMovieList = parseMovieList;
    exports.parseListResponse = parseListResponse;
    exports.parseSearchResponse = parseSearchResponse;

    exports.parseMovieDetail = parseMovieDetail;
    exports.parseDetailMovie = parseDetailMovie;
    exports.parseDetailResponse = parseDetailResponse;

    exports.parseEpisodes = parseEpisodes;
    exports.extractStreamURL = extractStreamURL;
    exports.debugStream = debugStream;
}
