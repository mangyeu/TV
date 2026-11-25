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
        version: "1.3.0",
        baseUrl: BASE,
        iconUrl: BASE + "/logo/javhd.png",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "watched", title: "Jav Uploaded Today", type: "Horizontal", path: "/recent/" },
        { slug: "engsub", title: "JAV English Sub", type: "Horizontal", path: "/jav-sub/" },
        { slug: "topmostsearch", title: "Top Most Searched", type: "Horizontal", path: "/top-most-searched-jav-movies-on-the-internet/" },
        { slug: "amateur", title: "Amateur", type: "Horizontal", path: "/mother/" },
        { slug: "beautifulgirl", title: "Beautiful Girl", type: "Horizontal", path: "/beautiful-girl/" },
        { slug: "uncensored", title: "Uncensored", type: "Horizontal", path: "/uncensored-jav/" },
        { slug: "bigtit", title: "Big Tits", type: "Horizontal", path: "/big-tits/" },
        { slug: "creampie", title: "Creampie", type: "Horizontal", path: "/creampie/" },
        { slug: "debut", title: "Debut Production", type: "Horizontal", path: "/debut-production/" },
        { slug: "featured", title: "New Releaseday", type: "Horizontal", path: "/releaseday/" },
        { slug: "recent", title: "Popular Videos", type: "Horizontal", path: "/popular/" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Uncensored Jav", slug: "uncensored-jav" },
        { name: "Reducing Mosaic", slug: "reducing-mosaic" },
        { name: "Jav Sub", slug: "jav-sub" },
        { name: "Chinese Sub", slug: "chinese-subtitle" },
        { name: "Creampie", slug: "creampie" },
        { name: "Big Tits", slug: "big-tits" },
        { name: "Amateur", slug: "amateur" },
        { name: "Married Woman", slug: "married-woman" },
        { name: "Beautiful Girl", slug: "beautiful-girl" },
        { name: "Slut", slug: "slut" },
        { name: "Mature Woman", slug: "mature-woman" },
        { name: "Cuckold", slug: "cuckold" },
        { name: "Squirting", slug: "squirting" },
        { name: "Nasty", slug: "nasty" },
        { name: "Hardcore", slug: "hardcore" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Newest", value: "recent" },
            { name: "Most Viewed Today", value: "popular/today" },
            { name: "Most Viewed This Week", value: "popular/week" },
            { name: "Most Viewed This Month", value: "popular/month" },
            { name: "Most Viewed All Time", value: "popular/year" },
            { name: "Top Rated", value: "rated/year" }
        ],
        category: [
            { name: "Uncensored Jav", value: "uncensored-jav" },
            { name: "Reducing Mosaic", value: "reducing-mosaic" },
            { name: "Jav Sub", value: "jav-sub" },
            { name: "Chinese Sub", value: "chinese-subtitle" },
            { name: "Creampie", value: "creampie" },
            { name: "Big Tits", value: "big-tits" },
            { name: "Amateur", value: "amateur" },
            { name: "Married Woman", value: "married-woman" },
            { name: "Beautiful Girl", value: "beautiful-girl" },
            { name: "Mature Woman", value: "mature-woman" },
            { name: "Cuckold", value: "cuckold" },
            { name: "Squirting", value: "squirting" },
            { name: "Nasty", value: "nasty" },
            { name: "Hardcore", value: "hardcore" }
        ]
    });
}

// -----------------------------------------------------------------------------
// URL builders
// -----------------------------------------------------------------------------

function getUrlList(slug, filtersJson) {
    var filters = safeJson(filtersJson, {});
    var page = parseInt(filters.page || 1, 10);
    if (!page || page < 1) page = 1;

    var target = String((filters.category || slug || "recent")).replace(/^\/+|\/+$/g, "");
    var homeSections = {
        watched: 1, engsub: 1, topmostsearch: 1, amateur: 1,
        beautifulgirl: 1, uncensored: 1, bigtit: 1, creampie: 1,
        debut: 1, featured: 1, recent: 1
    };

    // Homepage cards are not in the initial HTML. The homepage source explicitly
    // fetches them from /?ajax=fp_section&s=SECTION and receives JSON {total,html,pagination}.
    if (homeSections[target]) {
        return BASE + "/?ajax=fp_section&s=" + encodeURIComponent(target) +
            (page > 1 ? "&page=" + page : "");
    }

    if (/^https?:\/\//i.test(target)) {
        target = target.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+|\/+$/g, "");
    }
    var path = target || "recent";
    var url = BASE + "/" + path.replace(/^\/+|\/+$/g, "") + "/";
    var browse = /^(recent|popular|rated|discussed|downloaded|longest|watched)(?:\/|$)/i.test(path);
    url += browse ? "?ajax=browse_videos" : "?ajax=1";
    if (page > 1) url += "&page=" + page;
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = safeJson(filtersJson, {});
    var page = parseInt(filters.page || 1, 10);
    if (!page || page < 1) page = 1;
    return BASE + "/search/video/?s=" + encodeURIComponent(keyword || "") +
        "&ajax=1" + (page > 1 ? "&page=" + page : "");
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
        var input = String(value || "").replace(/\s/g, "")
            .replace(/-/g, "+").replace(/_/g, "/");
        while (input.length % 4) input += "=";
        if (typeof atob === "function") return atob(input);
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var out = "", buffer = 0, bits = 0;
        for (var i = 0; i < input.length; i++) {
            if (input.charAt(i) === "=") break;
            var v = chars.indexOf(input.charAt(i));
            if (v < 0) continue;
            buffer = (buffer << 6) | v;
            bits += 6;
            if (bits >= 8) {
                bits -= 8;
                out += String.fromCharCode((buffer >> bits) & 255);
            }
        }
        return out;
    } catch (e) { return ""; }
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
        var raw = String(input || "").trim();
        var response = safeJson(raw, null);
        var html = raw;
        var paginationHtml = "";
        var total = 0;

        // Support the response shapes used by the site's AJAX endpoints:
        // {html,total,pagination}, {data:{html,total,pagination}}, or {data:"..."}.
        if (response) {
            var payload = response.data && typeof response.data === "object"
                ? response.data : response;
            if (typeof payload.html === "string") html = payload.html;
            else if (typeof response.html === "string") html = response.html;
            else if (typeof response.data === "string") html = response.data;
            if (typeof payload.pagination === "string") paginationHtml = payload.pagination;
            else if (typeof response.pagination === "string") paginationHtml = response.pagination;
            total = parseInt(payload.total || response.total || 0, 10) || 0;
        }

        var items = [];
        var seen = {};
        function addCard(cardHtml) {
            var anchorRe = /<a\b[^>]*href\s*=\s*(['"])([^'"]+)\1[^>]*>/gi;
            var am, href = "", anchorTag = "";
            while ((am = anchorRe.exec(cardHtml)) !== null) {
                var candidate = absoluteUrl(am[2]);
                if (/\/\d+\/[^/?#]+\/?(?:[?#].*)?$/i.test(candidate)) {
                    href = candidate;
                    anchorTag = am[0];
                    break;
                }
            }
            if (!href || seen[href]) return;
            var image = "";
            var imgRe = /<img\b[^>]*>/gi, im;
            while ((im = imgRe.exec(cardHtml)) !== null) {
                image = attr(im[0], "data-original") || attr(im[0], "data-src") ||
                    attr(im[0], "data-lazy-src") || attr(im[0], "src");
                if (image) break;
            }
            var title = attr(anchorTag, "title") || attr(anchorTag, "aria-label");
            if (!title) {
                var titleMatch = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(cardHtml);
                if (titleMatch) title = stripTags(titleMatch[1]);
            }
            if (!title) title = makeSlugFromUrl(href).replace(/[-_]+/g, " ");
            if (!image) return;
            seen[href] = true;
            items.push({ id: href, title: title, posterUrl: absoluteUrl(image), backdropUrl: absoluteUrl(image) });
        }

        // Primary structure used by JAVHDZ list responses: <li id="video-...">.
        var liRe = /<li\b[^>]*id\s*=\s*(['"])video-[^'"]+\1[^>]*>[\s\S]*?<\/li>/gi;
        var li, foundLi = false;
        while ((li = liRe.exec(html)) !== null) {
            foundLi = true;
            addCard(li[0]);
        }

        // Fallback for section responses that return thumbnail cards without li IDs.
        if (!foundLi || !items.length) {
            var cardRe = /<a\b[^>]*href\s*=\s*(['"])(https?:\/\/[^'"]+|\/[^'"]+)\1[^>]*>[\s\S]{0,3000}?<\/a>/gi;
            var card;
            while ((card = cardRe.exec(html)) !== null) {
                if (/\/\d+\/[^/?#]+\/?(?:[?#].*)?$/i.test(absoluteUrl(card[2]))) addCard(card[0]);
            }
        }

        var currentPage = 1, totalPages = 1;
        var paginationSource = paginationHtml;
        if (!paginationSource) {
            var paginationBlock = /<ul\b[^>]*class=['"][^'"]*pagination[^'"]*['"][^>]*>[\s\S]*?<\/ul>/i.exec(html);
            paginationSource = paginationBlock ? paginationBlock[0] : "";
        }
        if (paginationSource) {
            var active = /class=['"][^'"]*active[^'"]*['"][^>]*>\s*<(?:a|span)[^>]*>(\d+)/i.exec(paginationSource);
            if (active) currentPage = parseInt(active[1], 10) || 1;
            var pageNums = paginationSource.match(/(?:\/|[?&]page=)(\d+)(?:\/|&|['"])/g);
            if (pageNums) {
                for (var i = 0; i < pageNums.length; i++) {
                    var n = pageNums[i].match(/(\d+)/);
                    if (n && parseInt(n[1], 10) > totalPages) totalPages = parseInt(n[1], 10);
                }
            }
        }
        if (total && items.length) totalPages = Math.max(totalPages, Math.ceil(total / items.length));

        return JSON.stringify({
            items: items,
            pagination: { currentPage: currentPage, totalPages: totalPages || 1, totalItems: total || items.length, itemsPerPage: items.length || 20 }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 } });
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
            }
            if (!urls.length && single) {
                var decodedOne = decodeBase64(single);
                if (decodedOne) urls = [decodedOne];
            }
            for (var u = 0; u < urls.length; u++) {
                var serverUrl = String(urls[u] || "").trim();
                if (!/^https?:\/\//i.test(serverUrl)) continue;
                var hostMatch = serverUrl.match(/^https?:\/\/([^\/?#]+)/i);
                var host = hostMatch ? hostMatch[1].replace(/^www\./i, "") : "Mirror " + (u + 1);
                servers.push({
                    name: urls.length > 1 ? name + " (" + host + ")" : name,
                    episodes: [{ id: serverUrl, name: "Play", slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + (u + 1) }]
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
