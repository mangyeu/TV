// =============================================================================
// JAVHDZ.TODAY - VAAPP Plugin
// Based on the supplied VAAPP template and javhdz.today View Source files.
// Supports HTML/AJAX listing pages, poster metadata, server embeds,
// direct HLS (.m3u8) and MP4 links when exposed by the fetched player page.
// =============================================================================

var BASE = "https://javhdz.today";

function getManifest() {
    return JSON.stringify({
        id: "javhdz_today",
        name: "JavHDZ Today",
        version: "1.1.0",
        baseUrl: BASE,
        iconUrl: BASE + "/logo/javhd.png",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "embedtoexoplay"
    });
}

function getHomeSections() {
    // Các slug này là đường dẫn có thật trong menu và homepage của javhdz.today.
    return JSON.stringify([
        { slug: "recent", title: "Latest Updates", type: "Horizontal", path: "/recent/" },
        { slug: "jav-sub", title: "JAV Sub", type: "Horizontal", path: "/jav-sub/" },
        { slug: "uncensored-jav", title: "Uncensored JAV", type: "Horizontal", path: "/uncensored-jav/" },
        { slug: "reducing-mosaic", title: "Reducing Mosaic", type: "Horizontal", path: "/reducing-mosaic/" },
        { slug: "amateur", title: "Amateur", type: "Horizontal", path: "/amateur/" },
        { slug: "beautiful-girl", title: "Beautiful Girl", type: "Horizontal", path: "/beautiful-girl/" },
        { slug: "big-tits", title: "Big Tits", type: "Horizontal", path: "/big-tits/" },
        { slug: "creampie", title: "Creampie", type: "Horizontal", path: "/creampie/" },
        { slug: "debut-production", title: "Debut Production", type: "Horizontal", path: "/debut-production/" }
    ]);
}

function getPrimaryCategories() {
    // Chỉ dùng các URL danh mục xuất hiện trong View Source của website.
    return JSON.stringify([
        { name: "Latest Updates", slug: "recent" },
        { name: "Popular Today", slug: "popular/today" },
        { name: "JAV Sub", slug: "jav-sub" },
        { name: "Chinese Subtitle", slug: "chinese-subtitle" },
        { name: "Uncensored JAV", slug: "uncensored-jav" },
        { name: "Reducing Mosaic", slug: "reducing-mosaic" },
        { name: "Amateur", slug: "amateur" },
        { name: "Creampie", slug: "creampie" },
        { name: "Big Tits", slug: "big-tits" },
        { name: "Married Woman", slug: "married-woman" },
        { name: "Beautiful Girl", slug: "beautiful-girl" },
        { name: "Mature Woman", slug: "mature-woman" },
        { name: "Cuckold", slug: "cuckold" },
        { name: "Squirting", slug: "squirting" },
        { name: "Nasty", slug: "nasty" },
        { name: "Hardcore", slug: "hardcore" },
        { name: "Mother", slug: "mother" },
        { name: "Debut Production", slug: "debut-production" },
        { name: "Release Day", slug: "releaseday" },
        { name: "Top Most Searched", slug: "top-most-searched-jav-movies-on-the-internet" },
        { name: "Popular", slug: "popular" },
        { name: "Top Rated", slug: "rated" },
        { name: "Most Discussed", slug: "discussed" },
        { name: "Most Downloaded", slug: "downloaded" },
        { name: "Longest Videos", slug: "longest" },
        { name: "Most Watched", slug: "watched" },
        { name: "All Categories", slug: "categories" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

// -----------------------------------------------------------------------------
// URL builders
// -----------------------------------------------------------------------------

function getUrlList(slug, filtersJson) {
    var filters = safeJson(filtersJson, {});
    var page = parseInt(filters.page || 1, 10);
    if (!page || page < 1) page = 1;

    // The supplied homepage source loads the "recent" section through this
    // public AJAX endpoint. Its response is JSON containing data.html.
    if (slug === "recent-home") {
        return BASE + "/?ajax=fp_section&s=recent";
    }

    var path = String(slug || "recent").replace(/^\/+|\/+$/g, "");
    return BASE + "/" + path + "/" + (page > 1 ? "?page=" + page : "");
}

function getUrlSearch(keyword, filtersJson) {
    var filters = safeJson(filtersJson, {});
    var page = parseInt(filters.page || 1, 10);
    if (!page || page < 1) page = 1;
    return BASE + "/search/video/?s=" + encodeURIComponent(keyword || "") +
        "&page=" + page;
}

function getUrlDetail(slug) {
    var value = String(slug || "");
    if (/^https?:\/\//i.test(value)) return value;
    if (value.charAt(0) === "/") return BASE + value;
    return BASE + "/" + value.replace(/^\/+/, "");
}

function getUrlCategories() { return BASE + "/categories/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// -----------------------------------------------------------------------------
// Small parsing helpers (ES5-compatible)
// -----------------------------------------------------------------------------

function safeJson(value, fallback) {
    try { return JSON.parse(value || "{}"); }
    catch (e) { return fallback; }
}

function decodeHtml(value) {
    return String(value || "")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#(\d+);/g, function (all, n) {
            return String.fromCharCode(parseInt(n, 10));
        });
}

function stripTags(value) {
    return decodeHtml(String(value || "")
        .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " "))
        .trim();
}

function attr(tag, name) {
    var re = new RegExp("\\b" + name + "\\s*=\\s*(['\"])([\\s\\S]*?)\\1", "i");
    var m = re.exec(tag || "");
    return m ? decodeHtml(m[2].trim()) : "";
}

function absoluteUrl(url) {
    url = decodeHtml(String(url || "").trim());
    if (!url) return "";
    if (/^(https?:)?\/\//i.test(url)) {
        return url.indexOf("//") === 0 ? "https:" + url : url;
    }
    if (url.charAt(0) === "/") return BASE + url;
    return BASE + "/" + url;
}

function getMeta(html, key) {
    var re = new RegExp(
        "<meta\\b(?=[^>]*(?:property|name)=['\"]" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
        "['\"])[^>]*>",
        "i"
    );
    var m = re.exec(html || "");
    return m ? (attr(m[0], "content") || "") : "";
}

function decodeBase64(value) {
    try {
        if (typeof atob !== "function") return "";
        var raw = atob(String(value || "").replace(/\s/g, ""));
        try {
            return decodeURIComponent(escape(raw));
        } catch (e) {
            return raw;
        }
    } catch (e2) {
        return "";
    }
}

function extractMovieId(url) {
    var m = String(url || "").match(/\/(\d+)(?:\/|$)/);
    return m ? m[1] : "";
}

function makeSlugFromUrl(url) {
    var clean = String(url || "").replace(/[?#].*$/, "").replace(/\/+$/, "");
    var parts = clean.split("/");
    return parts.length ? parts[parts.length - 1] : "";
}

// -----------------------------------------------------------------------------
// Listing parser
// -----------------------------------------------------------------------------

function parseListResponse(input) {
    try {
        var html = String(input || "");
        var json = safeJson(html, null);

        // Homepage AJAX response: { total: n, html: "...", pagination: "..." }
        if (json && typeof json.html === "string") {
            html = json.html;
        } else if (json && typeof json.data === "string") {
            html = json.data;
        }

        var items = [];
        var seen = {};
        var linkRe = /<a\b[^>]*href\s*=\s*(['"])(https?:\/\/[^'"]+|\/[^'"]+) \1[^>]*>/gi;
        // The expression above intentionally has no dependency on one card class;
        // a second pass handles compact href markup without whitespace.
        linkRe = /<a\b[^>]*href\s*=\s*(['"])(https?:\/\/[^'"]+|\/[^'"]+)\1[^>]*>/gi;

        var match;
        while ((match = linkRe.exec(html)) !== null) {
            var openTag = match[0];
            var href = absoluteUrl(match[2]);
            if (!/\/\d+\/[^/?#]+\/?$/.test(href)) continue;
            if (seen[href]) continue;

            var start = Math.max(0, match.index - 900);
            var end = Math.min(html.length, match.index + 1800);
            var context = html.substring(start, end);
            var imgMatch = /<img\b[^>]*>/i.exec(context);
            var image = "";
            if (imgMatch) {
                image = attr(imgMatch[0], "data-original") ||
                        attr(imgMatch[0], "data-src") ||
                        attr(imgMatch[0], "src") ||
                        attr(imgMatch[0], "data-lazy-src");
            }

            var title = attr(openTag, "title") || attr(openTag, "aria-label");
            if (!title) {
                var titleMatch = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(context);
                if (titleMatch) title = stripTags(titleMatch[1]);
            }
            if (!title) {
                var textMatch = /<a\b[^>]*>[\s\S]*?<\/a>/i.exec(html.substring(match.index, match.index + 1400));
                if (textMatch) title = stripTags(textMatch[0]);
            }
            if (!title) title = makeSlugFromUrl(href).replace(/-/g, " ");

            if (image) {
                seen[href] = true;
                items.push({
                    id: href,
                    title: title,
                    posterUrl: absoluteUrl(image)
                });
            }
        }

        var currentPage = 1;
        var totalPages = 1;
        var pageMatch = html.match(/[?&]page=(\d+)/i);
        if (pageMatch) currentPage = parseInt(pageMatch[1], 10) || 1;
        if (json && json.pagination && typeof json.pagination === "string") {
            var nums = json.pagination.match(/page=(\d+)/g);
            if (nums && nums.length) totalPages = nums.length + 1;
        }

        return JSON.stringify({
            items: items,
            pagination: { currentPage: currentPage, totalPages: totalPages }
        });
    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// -----------------------------------------------------------------------------
// Movie detail parser
// -----------------------------------------------------------------------------

function parseMovieDetail(html) {
    try {
        html = String(html || "");

        var canonical = getMeta(html, "og:url");
        if (!canonical) {
            var canonicalTag = /<link\b[^>]*rel=['"]canonical['"][^>]*>/i.exec(html);
            if (canonicalTag) canonical = attr(canonicalTag[0], "href");
        }

        var id = extractMovieId(canonical);
        if (!id) id = extractMovieId(html);
        var title = getMeta(html, "og:title");
        if (!title) {
            var h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
            title = h1 ? stripTags(h1[1]) : "Untitled";
        }

        var poster = getMeta(html, "og:image");
        if (!poster) {
            var posterMatch = /<img\b[^>]*class=['"][^'"]*(?:poster|video)[^'"]*['"][^>]*>/i.exec(html);
            if (posterMatch) poster = attr(posterMatch[0], "src");
        }

        var description = getMeta(html, "og:description");
        if (!description) {
            var desc = /<p\b[^>]*class=['"][^'"]*description[^'"]*['"][^>]*>([\s\S]*?)<\/p>/i.exec(html);
            description = desc ? stripTags(desc[1]) : "";
        }

        var servers = [];
        var buttonRe = /<button\b[^>]*class=['"][^'"]*button_choice_server[^'"]*['"][^>]*>[\s\S]*?<\/button>/gi;
        var button;
        while ((button = buttonRe.exec(html)) !== null) {
            var tag = button[0];
            var name = attr(tag, "data-name") || "Server " + (servers.length + 1);
            var urls = [];
            var embeds = attr(tag, "data-embeds");
            var single = attr(tag, "data-embed");

            if (embeds) {
                var decoded = decodeBase64(embeds);
                var arr = safeJson(decoded, []);
                if (arr && arr.length) urls = arr;
            } else if (single) {
                var decodedOne = decodeBase64(single);
                if (decodedOne) urls = [decodedOne];
            }

            if (urls.length) {
                // The website's data-embeds is a list of alternate embed hosts.
                // Keep the first host URL as this template exposes one episode ID.
                servers.push({
                    name: name,
                    episodes: [{
                        id: urls[0],
                        name: name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                    }]
                });
            }
        }

        // Fallback to the site's documented public embed endpoint when the
        // player buttons are absent from a cached or simplified detail page.
        if (!servers.length && id) {
            servers.push({
                name: "Default Embed",
                episodes: [{
                    id: BASE + "/embed/" + id + "/",
                    name: "Watch",
                    slug: "watch"
                }]
            });
        }

        var date = "";
        var dateMatch = html.match(/Release Day:\s*<\/?[^>]*>\s*(\d{4}-\d{2}-\d{2})/i) ||
                        html.match(/Release Day:\s*(\d{4}-\d{2}-\d{2})/i);
        if (dateMatch) date = dateMatch[1];

        var director = "";
        var directorMatch = html.match(/Director:\s*<a\b[^>]*>([\s\S]*?)<\/a>/i);
        if (directorMatch) director = stripTags(directorMatch[1]);

        var studio = "";
        var studioMatch = html.match(/Studio:\s*<a\b[^>]*>([\s\S]*?)<\/a>/i);
        if (studioMatch) studio = stripTags(studioMatch[1]);

        var categories = [];
        var genreMatch = /Genre:\s*([\s\S]*?)(?:<hr|<\/div>)/i.exec(html);
        if (genreMatch) {
            var catRe = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
            var cm;
            while ((cm = catRe.exec(genreMatch[1])) !== null) {
                var cat = stripTags(cm[1]);
                if (cat && categories.indexOf(cat) < 0) categories.push(cat);
            }
        }

        return JSON.stringify({
            id: id || canonical || "",
            title: title,
            posterUrl: absoluteUrl(poster),
            backdropUrl: absoluteUrl(poster),
            description: description,
            servers: servers,
            quality: "HD",
            year: date ? parseInt(date.substring(0, 4), 10) : 0,
            rating: 0,
            status: "Available",
            duration: "",
            casts: "",
            director: director,
            category: categories.join(", ") || studio
        });
    } catch (e) {
        return JSON.stringify({
            id: "",
            title: "",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: [],
            quality: "",
            year: 0,
            rating: 0,
            status: "",
            duration: "",
            casts: "",
            director: "",
            category: ""
        });
    }
}

// -----------------------------------------------------------------------------
// Resolve an embed/player response to a direct HLS or MP4 URL when the fetched
// page exposes one. If it only exposes another iframe, return that iframe URL.
// -----------------------------------------------------------------------------

function parseDetailResponse(html) {
    try {
        html = String(html || "");

        // Common direct source formats in player HTML / JSON.
        var patterns = [
            /["'](?:file|src|url|source)["']\s*:\s*["'](https?:\\?\/\\?\/[^"']+\.(?:m3u8|mp4)(?:\?[^"']*)?)["']/i,
            /(?:file|src|url)\s*=\s*["'](https?:\/\/[^"']+\.(?:m3u8|mp4)(?:\?[^"']*)?)["']/i,
            /<source\b[^>]*src\s*=\s*["']([^"']+\.(?:m3u8|mp4)(?:\?[^"']*)?)["']/i,
            /(https?:\/\/[^"'\\\s<>]+\.(?:m3u8|mp4)(?:\?[^"'\\\s<>]*)?)/i
        ];

        for (var i = 0; i < patterns.length; i++) {
            var m = patterns[i].exec(html);
            if (m && m[1]) {
                var direct = decodeHtml(m[1]).replace(/\\\//g, "/").replace(/\\u0026/g, "&");
                var isHls = /\.m3u8(?:\?|$)/i.test(direct);
                return JSON.stringify({
                    url: direct,
                    headers: { "Referer": BASE + "/" },
                    mimeType: isHls ? "application/x-mpegURL" : "video/mp4",
                    isEmbed: false,
                    subtitles: []
                });
            }
        }

        // Some player pages wrap the playable content in an iframe.
        var iframe = /<iframe\b[^>]*src\s*=\s*(['"])(.*?)\1/i.exec(html);
        if (iframe && iframe[2]) {
            return JSON.stringify({
                url: absoluteUrl(iframe[2]),
                headers: { "Referer": BASE + "/" },
                isEmbed: false,
                subtitles: []
            });
        }

        // HLS playlists may be exposed as a bare URL without a file suffix.
        var hls = /(https?:\/\/[^"'\\\s<>]+(?:m3u8|playlist)[^"'\\\s<>]*)/i.exec(html);
        if (hls) {
            return JSON.stringify({
                url: decodeHtml(hls[1]).replace(/\\\//g, "/"),
                headers: { "Referer": BASE + "/" },
                mimeType: "application/x-mpegURL",
                isEmbed: false,
                subtitles: []
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, subtitles: [] });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, subtitles: [] });
    }
}

// -----------------------------------------------------------------------------
// Recursive embed parser: used when an embed page returns another iframe or
// a direct media URL. The app may call this up to three times per template.
// -----------------------------------------------------------------------------

function parseEmbedResponse(html, sourceUrl) {
    try {
        html = String(html || "");

        var direct = parseDetailResponse(html);
        var directObj = safeJson(direct, {});
        if (directObj.url) return direct;

        var iframe = /<iframe\b[^>]*src\s*=\s*(['"])(.*?)\1/i.exec(html);
        if (iframe && iframe[2]) {
            return JSON.stringify({
                url: absoluteUrl(iframe[2]),
                isEmbed: true,
                headers: { "Referer": sourceUrl || BASE + "/" }
            });
        }

        // A JS player may hold its next page in an encoded data attribute.
        var dataEmbed = /data-embed\s*=\s*["']([^"']+)["']/i.exec(html);
        if (dataEmbed) {
            var decoded = decodeBase64(dataEmbed[1]);
            if (decoded) {
                return JSON.stringify({
                    url: decoded,
                    isEmbed: true,
                    headers: { "Referer": sourceUrl || BASE + "/" }
                });
            }
        }

        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false });
    }
}

function parseCategoriesResponse(html) {
    return getPrimaryCategories();
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
