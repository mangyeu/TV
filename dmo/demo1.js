/*
 * TVHAY Provider
 * Version: 1.0.0
 * Compatibility: ES5
 * Website: https://tvhay.buzz
 *
 * Features:
 * - Homepage
 * - Movie categories
 * - Search
 * - Country / year filters
 * - Movie lists
 * - Movie details
 * - Episode lists
 * - Watch page metadata
 * var detailImages = extractImages(html);

   *result.poster =
   * getMeta(html, "og:image") ||
    * (detailImages.length > 0
   *     ? detailImages[0].src
     *   : "");
 *
 * Does not resolve or extract video streams.
 */

var TVHAY = (function () {
    "use strict";

    var BASE_URL = "https://tvhay.buzz";

    /* =========================================
       UTILITIES
    ========================================= */

    function trim(value) {
        return String(value || "")
            .replace(/^\s+|\s+$/g, "");
    }

    function decodeHTML(value) {
        return String(value || "")
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/gi, "&")
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">")
            .replace(/&#(\d+);/g, function (_, n) {
                return String.fromCharCode(parseInt(n, 10));
            })
            .replace(/&#x([0-9a-f]+);/gi, function (_, n) {
                return String.fromCharCode(parseInt(n, 16));
            });
    }

    function cleanText(value) {
        return decodeHTML(String(value || "")
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, ""))
            .replace(/\s+/g, " ")
            .replace(/^\s+|\s+$/g, "");
    }

    function absoluteURL(url) {
        url = trim(decodeHTML(url));

        if (!url) {
            return "";
        }

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

    function getAttribute(tag, name) {
        var regex = new RegExp(
            name + "\\s*=\\s*[\"']([^\"']*)[\"']",
            "i"
        );

        var match = String(tag || "").match(regex);

        return match ? decodeHTML(match[1]) : "";
    }

    function getTextByClass(html, className) {
        var regex = new RegExp(
            '<[^>]*class=["\\'][^"\\']*' +
            className +
            '[^"\\']*["\\'][^>]*>([\\s\\S]*?)<\\/[^>]+>',
            "i"
        );

        var match = String(html || "").match(regex);

        return match ? cleanText(match[1]) : "";
    }

    function unique(items) {
        var result = [];
        var seen = {};

        for (var i = 0; i < items.length; i++) {
            var value = trim(items[i]);

            if (value && !seen[value]) {
                seen[value] = true;
                result.push(value);
            }
        }

        return result;
    }

    function parseNumber(value) {
        var number = parseInt(
            String(value || "").replace(/[^\d]/g, ""),
            10
        );

        return isNaN(number) ? 0 : number;
    }

    function slugFromURL(url) {
        var match = String(url || "").match(/\/([^\/?#]+)\/?$/);

        return match ? match[1] : "";
    }

    function queryEncode(value) {
        return encodeURIComponent(String(value || ""));
    }

    function extractLinks(html) {
        var links = [];
        var regex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = regex.exec(html || "")) !== null) {
            links.push({
                url: absoluteURL(match[1]),
                text: cleanText(match[2]),
                html: match[0]
            });
        }

        return links;
    }

    function extractImages(html) {
        var images = [];
        var regex = /<img\b[^>]*>/gi;
        var match;

        while ((match = regex.exec(html || "")) !== null) {
            var tag = match[0];

            var src =
                getAttribute(tag, "src") ||
                getAttribute(tag, "data-src") ||
                getAttribute(tag, "data-lazy-src") ||
                getAttribute(tag, "data-original");

            if (src) {
                images.push({
                    src: absoluteURL(src),
                    alt: getAttribute(tag, "alt"),
                    title: getAttribute(tag, "title")
                });
            }
        }

        return images;
    }

    function getMeta(html, name) {
        var regex = new RegExp(
            '<meta[^>]*(?:name|property)=["\\']' +
            name +
            '["\\'][^>]*content=["\\']([^"\\']*)["\\'][^>]*>',
            "i"
        );

        var match = String(html || "").match(regex);

        if (match) {
            return decodeHTML(match[1]);
        }

        // Handle content attribute before name/property.
        regex = new RegExp(
            '<meta[^>]*content=["\\']([^"\\']*)["\\'][^>]*' +
            '(?:name|property)=["\\']' +
            name +
            '["\\'][^>]*>',
            "i"
        );

        match = String(html || "").match(regex);

        return match ? decodeHTML(match[1]) : "";
    }

    function extractTitle(html) {
        var match = String(html || "").match(
            /<title[^>]*>([\s\S]*?)<\/title>/i
        );

        return match ? cleanText(match[1]) : "";
    }

    function extractPagination(html) {
        var links = extractLinks(html);
        var pages = [];
        var current = 1;
        var maxPage = 1;

        links.forEach(function (link) {
            var pageMatch = link.url.match(/[?&]page=(\d+)/i);

            if (!pageMatch) {
                pageMatch = link.url.match(/\/page\/(\d+)/i);
            }

            if (pageMatch) {
                var page = parseInt(pageMatch[1], 10);

                if (page > maxPage) {
                    maxPage = page;
                }

                pages.push({
                    page: page,
                    url: link.url
                });
            }

            if (
                /current|active/i.test(link.html) ||
                /trang\s*(\d+)/i.test(link.text)
            ) {
                var currentMatch = link.text.match(/(\d+)/);

                if (currentMatch) {
                    current = parseInt(currentMatch[1], 10);
                }
            }
        });

        return {
            currentPage: current,
            pages: pages,
            maxPage: maxPage
        };
    }

    /* =========================================
       PROVIDER INFO
    ========================================= */

    var manifest = {
        id: "tvhay",
        name: "TVHAY",
        version: "1.0.0",
        baseURL: BASE_URL,
        language: "vi",
        description: "TVHAY movie catalog provider"
    };

    /* =========================================
       URL BUILDERS
    ========================================= */

    function getHomeURL() {
        return BASE_URL + "/";
    }

    function getNewMoviesURL() {
        return BASE_URL + "/phim-moi";
    }

    function getSeriesURL() {
        return BASE_URL + "/phim-bo";
    }

    function getMoviesURL() {
        return BASE_URL + "/phim-le";
    }

    function getShortDramaURL() {
        return BASE_URL + "/short-drama";
    }

    function getSearchURL(keyword) {
        return BASE_URL +
            "/?view=tim-kiem&keyword=" +
            queryEncode(keyword);
    }

    function getCategoryURL(slug) {
        return BASE_URL + "/the-loai/" + slug;
    }

    function getCountryURL(slug) {
        return BASE_URL + "/quoc-gia/" + slug;
    }

    function getYearURL(year) {
        return BASE_URL + "/nam/" + year;
    }

    function getMovieURL(slug) {
        return BASE_URL + "/phim/" + slug;
    }

    function getMovieURLFromPath(path) {
        return absoluteURL(path);
    }

    /* =========================================
       HOME SECTIONS
    ========================================= */

    function getHomeSections() {
        return [
            {
                id: "new",
                title: "Phim mới cập nhật",
                url: getNewMoviesURL()
            },
            {
                id: "series",
                title: "Phim bộ",
                url: getSeriesURL()
            },
            {
                id: "single",
                title: "Phim lẻ",
                url: getMoviesURL()
            },
            {
                id: "short-drama",
                title: "Short Drama",
                url: getShortDramaURL()
            }
        ];
    }

    /* =========================================
       CATEGORIES
    ========================================= */

    function getCategories() {
        return [
            { name: "Hành Động", slug: "hanh-dong" },
            { name: "Tình Cảm", slug: "tinh-cam" },
            { name: "Hài Hước", slug: "hai-huoc" },
            { name: "Cổ Trang", slug: "co-trang" },
            { name: "Tâm Lý", slug: "tam-ly" },
            { name: "Hình Sự", slug: "hinh-su" },
            { name: "Võ Thuật", slug: "vo-thuat" },
            { name: "Viễn Tưởng", slug: "vien-tuong" },
            { name: "Kinh Dị", slug: "kinh-di" },
            { name: "Phiêu Lưu", slug: "phieu-luu" },
            { name: "Gia Đình", slug: "gia-dinh" },
            { name: "Hoạt Hình", slug: "hoat-hinh" },
            { name: "Khoa Học", slug: "khoa-hoc" },
            { name: "Chiến Tranh", slug: "chien-tranh" },
            { name: "Âm Nhạc", slug: "am-nhac" },
            { name: "Thể Thao", slug: "the-thao" },
            { name: "Thần Thoại", slug: "than-thoai" },
            { name: "Học Đường", slug: "hoc-duong" }
        ];
    }

    /* =========================================
       COUNTRIES
    ========================================= */

    function getCountries() {
        return [
            { name: "Trung Quốc", slug: "trung-quoc" },
            { name: "Hàn Quốc", slug: "han-quoc" },
            { name: "Nhật Bản", slug: "nhat-ban" },
            { name: "Thái Lan", slug: "thai-lan" },
            { name: "Đài Loan", slug: "dai-loan" },
            { name: "Âu Mỹ", slug: "au-my" },
            { name: "Hong Kong", slug: "hong-kong" },
            { name: "Ấn Độ", slug: "an-do" },
            { name: "Việt Nam", slug: "viet-nam" },
            { name: "Philippines", slug: "philippines" },
            { name: "Indonesia", slug: "indonesia" },
            { name: "Singapore", slug: "singapore" }
        ];
    }

    /* =========================================
       YEARS
    ========================================= */

    function getYears() {
        var years = [];
        var year = new Date().getFullYear();

        for (var i = year; i >= 2000; i--) {
            years.push(i);
        }

        return years;
    }

    /* =========================================
       PARSE MOVIE CARD
    ========================================= */

    function parseMovieItem(itemHTML) {
        itemHTML = String(itemHTML || "");

        var linkMatch = itemHTML.match(
            /<a\b[^>]*href=["']([^"']+)["'][^>]*>/i
        );

        var movieURL = linkMatch
            ? absoluteURL(linkMatch[1])
            : "";

        var title = "";

        if (linkMatch) {
            title = getAttribute(linkMatch[0], "title");
        }

        if (!title) {
            title = getTextByClass(
                itemHTML,
                "movie-title"
            );
        }

        if (!title) {
            title = getAttribute(
                itemHTML,
                "alt"
            );
        }

        var image = extractImages(itemHTML)[0] || {};

        var label = getTextByClass(
            itemHTML,
            "movie-label"
        );

        var status = getTextByClass(
            itemHTML,
            "movie-ep-status"
        );

        var year = "";

        var meta = getTextByClass(
            itemHTML,
            "movie-meta-short"
        );

        var yearMatch = meta.match(/\b(19\d{2}|20\d{2})\b/);

        if (yearMatch) {
            year = yearMatch[1];
        }

        var likes = 0;

        var likeMatch = meta.match(
            /([\d,.]+)\s*$/
        );

        if (likeMatch) {
            likes = parseNumber(likeMatch[1]);
        }

        return {
            id: slugFromURL(movieURL),
            title: trim(title),
            url: movieURL,
            poster: image.src || "",
            thumbnail: image.src || "",
            image: image.src || "",
            label: label,
            quality: label,
            status: status,
            year: year,
            likes: likes
        };
    }

    /* =========================================
       PARSE MOVIE LIST
    ========================================= */

    function parseMovieList(html) {
        html = String(html || "");

        var movies = [];

        /*
         * TVHAY cards use:
         * <div class="movie-item">
         */

        var regex = /<div\b[^>]*class=["'][^"']*movie-item[^"']*["'][^>]*>/gi;
        var matches = [];
        var match;

        while ((match = regex.exec(html)) !== null) {
            matches.push(match.index);
        }

        for (var i = 0; i < matches.length; i++) {
            var start = matches[i];

            var end = i + 1 < matches.length
                ? matches[i + 1]
                : html.length;

            var cardHTML = html.substring(start, end);

            var movie = parseMovieItem(cardHTML);

            if (movie.title || movie.url) {
                movies.push(movie);
            }
        }

        return uniqueMovies(movies);
    }

    function uniqueMovies(movies) {
        var result = [];
        var seen = {};

        movies.forEach(function (movie) {
            var key = movie.url || movie.title;

            if (key && !seen[key]) {
                seen[key] = true;
                result.push(movie);
            }
        });

        return result;
    }

    /* =========================================
       SEARCH
    ========================================= */

    function parseSearch(html) {
        return parseMovieList(html);
    }

    /* =========================================
       DETAIL PAGE
    ========================================= */

    function parseMovieDetail(html, pageURL) {
        html = String(html || "");

        var result = {
            id: slugFromURL(pageURL),
            title: "",
            originalTitle: "",
            url: absoluteURL(pageURL),
            poster: "",
            description: "",
            year: "",
            country: [],
            categories: [],
            actors: [],
            directors: [],
            duration: "",
            status: "",
            quality: "",
            episodes: [],
            related: []
        };

        result.title =
            getMeta(html, "og:title") ||
            extractTitle(html);

        result.poster =
            getMeta(html, "og:image") ||
            extractImages(html)[0]?.src ||
            "";

        result.description =
            getMeta(html, "description") ||
            getMeta(html, "og:description");

        /*
         * Metadata text blocks
         */

        var yearMatch = html.match(
            /(?:Năm phát hành|Năm)\s*[:：]?\s*<\/[^>]+>\s*<[^>]+>([^<]+)/i
        );

        if (yearMatch) {
            result.year = cleanText(yearMatch[1]);
        }

        /*
         * Generic label/value parsing.
         */

        var labels = [
            "Quốc gia",
            "Thể loại",
            "Đạo diễn",
            "Diễn viên",
            "Thời lượng",
            "Trạng thái",
            "Chất lượng"
        ];

        labels.forEach(function (label) {
            var regex = new RegExp(
                label +
                "\\s*[:：]?\\s*([\\s\\S]{0,200})",
                "i"
            );

            var match = html.match(regex);

            if (!match) {
                return;
            }

            var text = cleanText(match[1])
                .split("  ")[0];

            if (label === "Quốc gia") {
                result.country = text
                    .split(/[,|]/)
                    .map(trim);
            }

            if (label === "Thể loại") {
                result.categories = text
                    .split(/[,|]/)
                    .map(trim);
            }

            if (label === "Đạo diễn") {
                result.directors = text
                    .split(/[,|]/)
                    .map(trim);
            }

            if (label === "Diễn viên") {
                result.actors = text
                    .split(/[,|]/)
                    .map(trim);
            }

            if (label === "Thời lượng") {
                result.duration = text;
            }

            if (label === "Trạng thái") {
                result.status = text;
            }

            if (label === "Chất lượng") {
                result.quality = text;
            }
        });

        /*
         * Episode links
         */

        result.episodes = parseEpisodes(html);

        /*
         * Related movies
         */

        result.related = parseMovieList(html);

        return result;
    }

    /* =========================================
       EPISODE LIST
    ========================================= */

    function parseEpisodes(html) {
        html = String(html || "");

        var episodes = [];
        var links = extractLinks(html);

        links.forEach(function (link) {
            if (!/\/xem\//i.test(link.url)) {
                return;
            }

            episodes.push({
                title: link.text || "Tập phim",
                url: link.url,
                id: slugFromURL(link.url)
            });
        });

        var seen = {};

        return episodes.filter(function (episode) {
            if (seen[episode.url]) {
                return false;
            }

            seen[episode.url] = true;

            return true;
        });
    }

    /* =========================================
       WATCH PAGE METADATA
    ========================================= */

    function parseWatchPage(html, pageURL) {
        html = String(html || "");

        var result = {
            url: absoluteURL(pageURL),
            title: extractTitle(html),
            playerPresent: false,
            server: "",
            servers: [],
            nextEpisode: "",
            previousEpisode: "",
            likes: 0
        };

        /*
         * Detect player iframe.
         * Intentionally does not extract video source.
         */

        result.playerPresent = /<iframe\b[^>]*id=["']movie-iframe["']/i
            .test(html);

        /*
         * Detect available server buttons.
         */

        var serverRegex =
            /<button\b[^>]*btn-player-mode[^>]*>[\s\S]*?<\/button>/gi;

        var serverMatch;

        while ((serverMatch = serverRegex.exec(html)) !== null) {
            var button = serverMatch[0];

            var modeMatch = button.match(
                /changePlayerMode\(['"]([^'"]+)['"]\)/i
            );

            var className = getAttribute(
                button,
                "class"
            );

            var name = cleanText(button);

            var server = {
                id: modeMatch ? modeMatch[1] : "",
                name: name,
                active: /\bactive\b/i.test(className)
            };

            result.servers.push(server);

            if (server.active) {
                result.server = server.id || server.name;
            }
        }

        /*
         * Next episode
         */

        var links = extractLinks(html);

        links.forEach(function (link) {
            if (/tiếp|forward/i.test(link.text)) {
                result.nextEpisode = link.url;
            }

            if (/trước|previous/i.test(link.text)) {
                result.previousEpisode = link.url;
            }
        });

        /*
         * Likes
         */

        var likeMatch = html.match(
            /([\d,.]+)\s*Like/i
        );

        if (likeMatch) {
            result.likes = parseNumber(
                likeMatch[1]
            );
        }

        return result;
    }

    /* =========================================
       PAGE RESPONSE
    ========================================= */

    function parsePage(html, pageURL) {
        html = String(html || "");

        return {
            url: absoluteURL(pageURL),
            title: extractTitle(html),
            movies: parseMovieList(html),
            pagination: extractPagination(html)
        };
    }

    /* =========================================
       PROVIDER EXPORT
    ========================================= */

    return {
        manifest: manifest,

        /*
         * URL
         */

        getHomeURL: getHomeURL,
        getNewMoviesURL: getNewMoviesURL,
        getSeriesURL: getSeriesURL,
        getMoviesURL: getMoviesURL,
        getShortDramaURL: getShortDramaURL,
        getSearchURL: getSearchURL,
        getCategoryURL: getCategoryURL,
        getCountryURL: getCountryURL,
        getYearURL: getYearURL,
        getMovieURL: getMovieURL,

        /*
         * Lists
         */

        getHomeSections: getHomeSections,
        getCategories: getCategories,
        getCountries: getCountries,
        getYears: getYears,

        /*
         * Parsing
         */

        parseMovieItem: parseMovieItem,
        parseMovieList: parseMovieList,
        parseSearch: parseSearch,
        parseMovieDetail: parseMovieDetail,
        parseEpisodes: parseEpisodes,
        parseWatchPage: parseWatchPage,
        parsePage: parsePage,

        /*
         * Utils
         */

        absoluteURL: absoluteURL,
        cleanText: cleanText
    };
})();
