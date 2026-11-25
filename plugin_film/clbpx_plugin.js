// =============================================================================
// VAAPP Plugin - TVHAY (https://tvhay.buzz)
// =============================================================================

var BASE = "https://tvhay.buzz";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

function getManifest() {
    return JSON.stringify({
        id: "tvhay_buzz",
        name: "TVHAY",
        version: "1.0.1",
        baseUrl: BASE,
        iconUrl: BASE + "/favicon.ico",
        isEnabled: true,
        isAdult: false,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-moi", title: "Phim Mới Cập Nhật", type: "Horizontal", path: "/" },
        { slug: "phim-bo-moi", title: "Phim Bộ Mới", type: "Horizontal", path: "/" },
        { slug: "phim-le-moi", title: "Phim Lẻ Mới", type: "Horizontal", path: "/" },
        { slug: "phim-yeu-thich", title: "Phim Được Yêu Thích", type: "Horizontal", path: "/index.php?section=favorite&tab=favorite&view=ajax-tab" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim Bộ", slug: "phim-bo" },
        { name: "Phim Lẻ", slug: "phim-le" },
        { name: "Phim Mới", slug: "phim-moi" },
        { name: "Phim Thuyết Minh", slug: "thuyet-minh" },
        { name: "Phim Lồng Tiếng", slug: "long-tieng" },
        { name: "Phim Hành Động", slug: "hanh-dong" },
        { name: "Phim Tình Cảm", slug: "tinh-cam" },
        { name: "Phim Kinh Dị", slug: "kinh-di" },
        { name: "Phim Hài Hước", slug: "hai-huoc" },
        { name: "Phim Hoạt Hình", slug: "hoat-hinh" },
        { name: "Phim Trung Quốc", slug: "phim-trung-quoc" },
        { name: "Phim Hàn Quốc", slug: "phim-han-quoc" },
        { name: "Phim Âu Mỹ", slug: "phim-au-my" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới cập nhật", value: "new" },
            { name: "Xem nhiều", value: "views" },
            { name: "Đánh giá cao", value: "rating" }
        ],
        category: []
    });
}

function enc(v) { return encodeURIComponent(String(v || "")); }
function absUrl(u) {
    u = String(u || "").replace(/&amp;/g, "&").replace(/\\\//g, "/").trim();
    if (!u || u.indexOf("javascript:") === 0 || u.indexOf("#") === 0) return "";
    if (/^https?:\/\//i.test(u)) return u;
    if (u.indexOf("//") === 0) return "https:" + u;
    return BASE + (u.charAt(0) === "/" ? "" : "/") + u;
}
function getUrlList(slug, filtersJson) {
    var f = {};
    try { f = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var page = parseInt(f.page || 1, 10); if (!(page > 0)) page = 1;
    var s = String(slug || "").toLowerCase();
    var routes = {
        "phim-moi": "/",
        "phim-bo-moi": "/",
        "phim-le-moi": "/",
        "phim-yeu-thich": "/index.php?section=favorite&tab=favorite&view=ajax-tab",
        "phim-bo": "/phim-bo/",
        "phim-le": "/phim-le/",
        "thuyet-minh": "/thuyet-minh/",
        "long-tieng": "/long-tieng/"
    };
    var path = routes[s] || (s.charAt(0) === "/" ? s : "/" + s + "/");
    if (path === "/") return BASE + (page > 1 ? "?page=" + page : "");
    if (path.indexOf("?") >= 0) return BASE + path + "&page=" + page;
    return BASE + path + (page > 1 ? "?page=" + page : "");
}
function getUrlSearch(keyword, filtersJson) {
    var f = {}; try { f = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var p = parseInt(f.page || 1, 10); if (!(p > 0)) p = 1;
    // TVHAY uses a query-string search endpoint; retain a fallback-friendly URL.
    return BASE + "/?s=" + enc(keyword) + "&page=" + p;
}
function getUrlDetail(slug) {
    var s = String(slug || "");
    if (/^https?:\/\//i.test(s)) return s;
    if (s.charAt(0) === "/") return BASE + s;
    return BASE + "/" + s.replace(/^\/+|\/+$/g, "") + "/";
}
function getUrlCategories() { return BASE + "/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function decodeHtml(s) {
    return String(s || "")
        .replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#(\d+);/g, function(_, n) { return String.fromCharCode(parseInt(n, 10)); });
}
function stripTags(s) { return decodeHtml(String(s || "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim(); }
function attr(tag, name) {
    var re = new RegExp("\\b" + name + "\\s*=\\s*(?:\\\"([^\\\"]*)\\\"|'([^']*)'|([^\\s>]+))", "i");
    var m = re.exec(tag || ""); return m ? decodeHtml(m[1] || m[2] || m[3] || "") : "";
}
function firstMatch(s, patterns) {
    for (var i = 0; i < patterns.length; i++) { var m = patterns[i].exec(s); if (m && m[1]) return decodeHtml(m[1]); }
    return "";
}
function cleanId(u) {
    var x = String(u || "").split("?")[0].split("#")[0].replace(/\/$/, "");
    return x.substring(x.lastIndexOf("/") + 1) || x;
}
function posterFrom(block) {
    var imgs = block.match(/<img\b[^>]*>/gi) || [];
    for (var i = 0; i < imgs.length; i++) {
        var src = attr(imgs[i], "data-src") || attr(imgs[i], "data-original") || attr(imgs[i], "data-lazy-src") || attr(imgs[i], "src") || attr(imgs[i], "data-image");
        if (src && !/blank|loading|placeholder/i.test(src)) return absUrl(src);
    }
    var bg = firstMatch(block, [/background-image\s*:\s*url\(['"]?([^'"\)]+)['"]?\)/i]);
    return bg ? absUrl(bg) : "";
}
function extractItems(html) {
    var out = [], seen = {}, h = String(html || "");
    // Prefer anchors with a movie-like URL and an image/title inside the same card.
    var re = /<a\b[^>]*href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>[\s\S]{0,1800}?<\/a>/gi, m;
    while ((m = re.exec(h)) !== null) {
        var block = m[0], href = decodeHtml(m[1] || m[2] || m[3] || "");
        if (!href || /#|javascript:|index\.php\?section/i.test(href)) continue;
        var title = attr(block.match(/<[^>]+>/) ? block.match(/<[^>]+>/)[0] : "", "title");
        title = title || firstMatch(block, [/<(?:h[1-6]|strong|b)[^>]*>([\s\S]*?)<\/(?:h[1-6]|strong|b)>/i, /alt\s*=\s*["']([^"']+)["']/i]);
        title = stripTags(title);
        var poster = posterFrom(block);
        if (!title) title = stripTags(block);
        title = title.replace(/^(Thuyết Minh|Lồng Tiếng|Vietsub|Full|HD|FHD)\s*/i, "").trim();
        if (!title || title.length > 180 || !poster) continue;
        var url = absUrl(href);
        if (!url || url === BASE + "/") continue;
        var id = url;
        if (seen[id]) continue;
        seen[id] = true;
        var year = firstMatch(block, [/(?:\(|\b)(19\d{2}|20\d{2})(?:\)|\b)/]);
        var desc = stripTags(block).substring(0, 240);
        out.push({ id: id, title: title, posterUrl: poster, description: desc, year: year ? parseInt(year, 10) : 0 });
    }
    return out;
}
function parseListResponse(html) {
    try {
        var items = extractItems(html);
        var page = firstMatch(String(html || ""), [/[?&]page=(\d+)/i, /class=["'][^"']*current[^"']*["'][^>]*>\s*(\d+)/i]);
        var total = firstMatch(String(html || ""), [/class=["'][^"']*(?:last|total-pages)[^"']*["'][^>]*>\s*(\d+)/i, /page-numbers[^>]*>\s*(\d+)\s*<\/a>/i]);
        return JSON.stringify({ items: items, pagination: { currentPage: page ? parseInt(page, 10) : 1, totalPages: total ? parseInt(total, 10) : 1 } });
    } catch (e) { return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } }); }
}
function parseSearchResponse(html) { return parseListResponse(html); }

function parseMovieDetail(html) {
    try {
        var h = String(html || "");
        var title = firstMatch(h, [/<h1\b[^>]*>([\s\S]*?)<\/h1>/i, /<title[^>]*>([\s\S]*?)<\/title>/i, /property=["']og:title["'][^>]*content=["']([^"']+)/i]);
        title = stripTags(title).replace(/\s*[-|].*TVHAY.*$/i, "").trim();
        var poster = firstMatch(h, [/property=["']og:image["'][^>]*content=["']([^"']+)/i, /content=["']([^"']+)["'][^>]*property=["']og:image["']/i]);
        if (!poster) poster = posterFrom(h);
        poster = absUrl(poster);
        var description = firstMatch(h, [/property=["']og:description["'][^>]*content=["']([^"']+)/i, /name=["']description["'][^>]*content=["']([^"']+)/i, /class=["'][^"']*(?:description|content-film|movie-description)[^"']*["'][^>]*>([\s\S]*?)<\//i]);
        description = stripTags(description);
        var year = firstMatch(h, [/(?:Năm phát hành|Năm|Year)[^<]{0,50}(?:<[^>]+>)*\s*(19\d{2}|20\d{2})/i, /\b(19\d{2}|20\d{2})\b/]);
        var rating = firstMatch(h, [/(?:IMDb|Rating|Đánh giá)[^\d]{0,20}(\d(?:\.\d)?)/i]);
        var duration = firstMatch(h, [/(?:Thời lượng|Duration)[^<]{0,40}(?:<[^>]+>)*\s*([^<]{2,40})/i]);
        var category = firstMatch(h, [/(?:Thể loại|Genre)[\s\S]{0,120}?<a[^>]*>([^<]+)/i]);
        var director = firstMatch(h, [/(?:Đạo diễn|Director)[\s\S]{0,120}?<a[^>]*>([^<]+)/i]);
        var casts = firstMatch(h, [/(?:Diễn viên|Cast)[\s\S]{0,160}?((?:<a[^>]*>[^<]+<\/a>\s*,?\s*){1,8})/i]);
        casts = stripTags(casts);

        var servers = [], serverMap = {}, episodeRe = /<a\b[^>]*(?:href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+)))[^>]*>([\s\S]*?)<\/a>/gi, em;
        while ((em = episodeRe.exec(h)) !== null) {
            var href = decodeHtml(em[1] || em[2] || em[3] || "");
            var label = stripTags(em[4]);
            if (!href || !label || !/(?:tập|episode|full|server|xem phim|play)/i.test(label + " " + href)) continue;
            if (/^(?:#|javascript:)/i.test(href)) continue;
            var serverName = firstMatch(em[0], [/data-server=["']([^"']+)/i, /data-name=["']([^"']+)/i]) || "Server TVHAY";
            if (!serverMap[serverName]) { serverMap[serverName] = { name: serverName, episodes: [] }; servers.push(serverMap[serverName]); }
            var episodeUrl = absUrl(href);
            var epId = episodeUrl;
            var exists = false;
            for (var z = 0; z < serverMap[serverName].episodes.length; z++) if (serverMap[serverName].episodes[z].id === epId) exists = true;
            if (!exists) serverMap[serverName].episodes.push({ id: epId, name: label.substring(0, 80), slug: cleanId(href) });
        }
        // Player iframe/file fallback: expose the player URL as an episode when no episode list is found.
        if (!servers.length) {
            var iframe = firstMatch(h, [/<iframe\b[^>]*src=["']([^"']+)/i, /data-embed=["']([^"']+)/i, /data-src=["'](https?:[^"']+)/i]);
            if (iframe) servers.push({ name: "Server 1", episodes: [{ id: absUrl(iframe), name: "Tập 1", slug: "tap-1" }] });
        }
        return JSON.stringify({
            id: "", title: title || "TVHAY", posterUrl: poster, backdropUrl: poster,
            description: description, servers: servers, quality: "HD",
            year: year ? parseInt(year, 10) : 0, rating: rating ? parseFloat(rating) : 0,
            status: /hoàn tất|hoàn thành|full/i.test(h) ? "Full" : "Đang chiếu",
            duration: stripTags(duration), casts: casts, director: stripTags(director), category: stripTags(category)
        });
    } catch (e) {
        return JSON.stringify({ id: "", title: "TVHAY", posterUrl: "", backdropUrl: "", description: "", servers: [], quality: "HD", year: 0, rating: 0, status: "", duration: "", casts: "", director: "", category: "" });
    }
}

function extractStream(h) {
    var s = String(h || "").replace(/\\\\\//g, "/").replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
    var url = firstMatch(s, [
        /(?:file|source|src|url|hls|play_url)\s*[:=]\s*["'](https?:[^"']+)["']/i,
        /["']file["']\s*:\s*["']([^"']+)["']/i,
        /<source\b[^>]*src=["']([^"']+)/i,
        /<video\b[^>]*src=["']([^"']+)/i,
        /https?:[^\s"'<>\\]+\.(?:m3u8|mp4|mpd|m4v)(?:\?[^\s"'<>\\]*)?/i
    ]);
    return url ? absUrl(url) : "";
}
function parseDetailResponse(html) {
    try {
        var h = String(html || "");
        var stream = extractStream(h);
        if (stream) {
            var mime = /\.mpd(?:\?|$)/i.test(stream) ? "application/dash+xml" : (/\.mp4(?:\?|$)|\.m4v(?:\?|$)/i.test(stream) ? "video/mp4" : "application/x-mpegURL");
            return JSON.stringify({ url: stream, mimeType: mime, headers: { Referer: BASE + "/", "User-Agent": UA }, subtitles: [] });
        }
        var embed = firstMatch(h, [/<iframe\b[^>]*src=["']([^"']+)/i, /(?:embed|player_url|link xem)["'\s:=]+([^"'\s<>]+)/i, /data-src=["'](https?:[^"']+)/i]);
        if (embed) return JSON.stringify({ url: absUrl(embed), isEmbed: true, headers: { Referer: BASE + "/", "User-Agent": UA } });
        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) { return JSON.stringify({ url: "", isEmbed: false }); }
}
function parseEmbedResponse(html, sourceUrl) {
    try {
        var h = String(html || "");
        var stream = extractStream(h);
        if (stream) {
            var mime = /\.mpd(?:\?|$)/i.test(stream) ? "application/dash+xml" : (/\.mp4(?:\?|$)|\.m4v(?:\?|$)/i.test(stream) ? "video/mp4" : "application/x-mpegURL");
            return JSON.stringify({ url: stream, isEmbed: false, mimeType: mime, headers: { Referer: sourceUrl || BASE + "/", "User-Agent": UA }, subtitles: [] });
        }
        var next = firstMatch(h, [/<iframe\b[^>]*src=["']([^"']+)/i, /(?:player|embed|src)\s*[:=]\s*["'](https?:[^"']+)["']/i]);
        if (next) {
            next = absUrl(next);
            if (next !== sourceUrl) return JSON.stringify({ url: next, isEmbed: true, headers: { Referer: sourceUrl || BASE + "/", "User-Agent": UA } });
        }
        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) { return JSON.stringify({ url: "", isEmbed: false }); }
}
function parseCategoriesResponse(html) { return JSON.stringify([]); }
function parseCountriesResponse(html) { return JSON.stringify([]); }
function parseYearsResponse(html) { return JSON.stringify([]); }
