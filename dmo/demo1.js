// JAVCC.ME - VAAPP plugin
// Based on the supplied VAAPP template and JAVCC page source.
// Player extraction: JAVCC detail page -> defaultUrl iframe -> HLS URL if exposed by iframe response.
// The stream URL is dynamic; do not hard-code Download Helper tokens.

function getManifest() {
    return JSON.stringify({
        id: "javcc_me",
        name: "JAVCC.ME",
        version: "1.0.0",
        baseUrl: "https://javcc.me",
        iconUrl: "https://javcc.me/wp-content/uploads/2026/02/javcc.png",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "", title: "Mới cập nhật", type: "Vertical", path: "" },
        { slug: "category/reducing-mosaic", title: "Reducing Mosaic", type: "Horizontal", path: "category/reducing-mosaic" },
        { slug: "category/censored", title: "Censored", type: "Horizontal", path: "category/censored" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Reducing Mosaic", slug: "category/reducing-mosaic" },
        { name: "Censored", slug: "category/censored" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [], country: [], year: [] });
}

var JAVCC_BASE = "https://javcc.me";

function _jTrim(s) {
    return String(s == null ? "" : s).replace(/^\s+|\s+$/g, "");
}
function _jDecode(s) {
    s = String(s == null ? "" : s);
    var map = {
        "&amp;": "&", "&quot;": '"', "&#039;": "'", "&apos;": "'",
        "&lt;": "<", "&gt;": ">", "&nbsp;": " ",
        "&#8217;": "’", "&#8216;": "‘", "&#8220;": "“", "&#8221;": "”",
        "&#8211;": "–", "&#8212;": "—", "&#038;": "&"
    };
    s = s.replace(/&(?:amp|quot|apos|lt|gt|nbsp|#0?39|#8217|#8216|#8220|#8221|#8211|#8212|#038);/g, function(x) {
        return map[x] !== undefined ? map[x] : x;
    });
    return s.replace(/&#(\d+);/g, function(_, n) {
        var c = parseInt(n, 10);
        return c >= 0 && c <= 65535 ? String.fromCharCode(c) : _;
    }).replace(/&#x([0-9a-f]+);/gi, function(_, n) {
        var c = parseInt(n, 16);
        return c >= 0 && c <= 65535 ? String.fromCharCode(c) : _;
    });
}
function _jStrip(s) {
    return _jDecode(String(s || "").replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ").replace(/<!--[\s\S]*?-->/g, " "))
        .replace(/\s+/g, " ").trim();
}
function _jAttr(tag, name) {
    var re = new RegExp("\\b" + name + "\\s*=\\s*(['\"])([\\s\\S]*?)\\1", "i");
    var m = tag.match(re);
    return m ? _jDecode(m[2]) : "";
}
function _jAbs(url, base) {
    url = _jTrim(_jDecode(url)).replace(/&amp;/g, "&");
    if (!url || /^(javascript:|data:|mailto:|#)/i.test(url)) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.indexOf("//") === 0) return "https:" + url;
    if (url.charAt(0) === "/") return (base || JAVCC_BASE).replace(/\/$/, "") + url;
    return (base || JAVCC_BASE).replace(/\/$/, "") + "/" + url;
}
function _jPage(filtersJson) {
    var f = {};
    try { f = JSON.parse(filtersJson || "{}") || {}; } catch (e) {}
    var p = parseInt(f.page || f.currentPage || 1, 10);
    return p > 0 ? p : 1;
}
function _jPath(slug) {
    slug = _jTrim(slug || "").replace(/^\/+|\/+$/g, "");
    if (!slug) return JAVCC_BASE + "/";
    if (/^https?:\/\//i.test(slug)) return slug;
    return JAVCC_BASE + "/" + slug;
}

function getUrlList(slug, filtersJson) {
    var page = _jPage(filtersJson);
    var url = _jPath(slug);
    if (page > 1) {
        url = url.replace(/\/$/, "") + "/page/" + page + "/";
    }
    return url;
}
function getUrlSearch(keyword, filtersJson) {
    var page = _jPage(filtersJson);
    var url = JAVCC_BASE + "/?s=" + encodeURIComponent(keyword || "");
    if (page > 1) url += "&paged=" + page;
    return url;
}
function getUrlDetail(slug) {
    slug = _jTrim(slug || "");
    if (/^https?:\/\//i.test(slug)) return slug;
    slug = slug.replace(/^\/+/, "");
    if (!slug) return JAVCC_BASE + "/";
    return JAVCC_BASE + "/" + slug.replace(/\/+$/, "");
}
function getUrlCategories() { return JAVCC_BASE + "/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// Pull title/URL/poster from JAVCC's article cards.
// Card pattern in supplied source: article.loop-video.thumb-block > a[href] > .post-thumbnail img[data-src] + header span.
function _jParseCards(html) {
    var out = [];
    var re = /<article\b([^>]*)>([\s\S]*?)<\/article>/gi, m;
    while ((m = re.exec(String(html || ""))) !== null) {
        var block = m[0];
        if (!/thumb-block|loop-video/i.test(m[1] + " " + block.slice(0, 500))) continue;
        var a = block.match(/<a\b[^>]*>/i);
        if (!a) continue;
        var href = _jAbs(_jAttr(a[0], "href"));
        if (!href || href.indexOf("javcc.me/") < 0) continue;
        var img = block.match(/<img\b[^>]*>/i);
        var poster = "";
        if (img) poster = _jAbs(_jAttr(img[0], "data-src") || _jAttr(img[0], "data-lazy-src") || _jAttr(img[0], "src"));
        var title = _jAttr(a[0], "title");
        if (!title) {
            var h = block.match(/<header\b[^>]*>([\s\S]*?)<\/header>/i);
            title = h ? _jStrip(h[1]) : "";
        }
        if (!title) title = _jAttr(img ? img[0] : "", "alt");
        var duration = "";
        var dm = block.match(/class=["'][^"']*\bduration\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        if (dm) duration = _jStrip(dm[1]);
        if (title && href) {
            var id = href.replace(/\/+$/, "").split("/").pop();
            var exists = false;
            for (var i = 0; i < out.length; i++) if (out[i].id === id) exists = true;
            if (!exists) out.push({ id: id, title: title, posterUrl: poster, url: href, duration: duration });
        }
    }
    return out;
}
function _jPagination(html) {
    var s = String(html || ""), nums = [], re = /<a\b[^>]*class=["'][^"']*page-numbers[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, m;
    while ((m = re.exec(s)) !== null) {
        var n = parseInt(_jStrip(m[1]), 10);
        if (n > 0 && nums.indexOf(n) < 0) nums.push(n);
    }
    var cur = 1;
    var cm = s.match(/<(?:span|a)\b[^>]*class=["'][^"']*page-numbers[^"']*current[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|a)>/i);
    if (cm) cur = parseInt(_jStrip(cm[1]), 10) || 1;
    var total = nums.length ? Math.max.apply(Math, nums) : cur;
    var rel = s.match(/<a\b[^>]*rel=["']next["'][^>]*>/i);
    if (rel && total < cur + 1) total = cur + 1;
    return { currentPage: cur, totalPages: total };
}
function parseListResponse(html) {
    try {
        return JSON.stringify({ items: _jParseCards(html), pagination: _jPagination(html) });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}
function parseSearchResponse(html) { return parseListResponse(html); }

function _jMeta(html, key) {
    var re = /<meta\b[^>]*>/gi, m;
    while ((m = re.exec(String(html || ""))) !== null) {
        var tag = m[0];
        var prop = _jAttr(tag, "property") || _jAttr(tag, "name");
        if (String(prop).toLowerCase() === String(key).toLowerCase()) return _jAttr(tag, "content");
    }
    return "";
}
function _jTitle(html) {
    var m = String(html || "").match(/<h1\b[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i);
    if (m) return _jStrip(m[1]);
    return _jMeta(html, "og:title") || _jStrip((String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [,""])[1]).replace(/\s*-\s*JAVCC\.ME\s*$/i, "");
}
function _jBase64Decode(input) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", clean = String(input || "").replace(/[^A-Za-z0-9+\\/=]/g, "");
    var bytes = [], buffer = 0, bits = 0;
    for (var i = 0; i < clean.length; i++) {
        var ch = clean.charAt(i);
        if (ch === "=") break;
        var v = chars.indexOf(ch);
        if (v < 0) continue;
        buffer = (buffer << 6) | v;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            bytes.push((buffer >> bits) & 255);
        }
    }
    var encoded = "";
    for (var j = 0; j < bytes.length; j++) encoded += "%" + (bytes[j] < 16 ? "0" : "") + bytes[j].toString(16);
    try { return decodeURIComponent(encoded); } catch (e) {
        var out = "";
        for (var k = 0; k < bytes.length; k++) out += String.fromCharCode(bytes[k]);
        return out;
    }
}
function _jFindDefaultIframe(html) {
    var source = String(html || ""), scripts = [], sm;
    var scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    while ((sm = scriptRe.exec(source)) !== null) {
        var body = sm[2] || "";
        var data = _jAttr("<script " + sm[1] + ">", "data:text/javascript;base64");
        var bm = (sm[1] + " " + body).match(/data:text\/javascript;base64,([A-Za-z0-9+/=]+)/i);
        if (bm) {
            try {
                var b64 = bm[1];
                body += "\n" + _jBase64Decode(b64);
            } catch (e) {}
        }
        scripts.push(body);
    }
    var all = scripts.join("\n") + "\n" + source;
    var m = all.match(/\bdefaultUrl\s*=\s*["'](https?:\/\/[^"']+)["']/i);
    if (m) return _jAbs(m[1]);
    m = all.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/i);
    if (m) return _jAbs(m[1]);
    return "";
}
function _jDetails(html) {
    var s = String(html || "");
    var title = _jTitle(s);
    var poster = _jMeta(s, "og:image") || _jMeta(s, "twitter:image");
    if (!poster) {
        var im = s.match(/<img\b[^>]*class=["'][^"']*wp-post-image[^"']*["'][^>]*>/i);
        if (im) poster = _jAbs(_jAttr(im[0], "src") || _jAttr(im[0], "data-src"));
    }
    var desc = "";
    var dm = s.match(/<div\b[^>]*class=["'][^"']*\bvideo-description\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    if (dm) desc = _jStrip(dm[1]);
    if (!desc) desc = _jMeta(s, "og:description") || _jMeta(s, "description");
    var canonical = _jMeta(s, "og:url");
    if (!canonical) {
        var cm = s.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i);
        if (cm) canonical = _jAttr(cm[0], "href");
    }
    var player = _jFindDefaultIframe(s);
    var duration = "";
    var dur = desc.match(/Runtime:\s*([0-9:]+)/i);
    if (dur) duration = dur[1];
    return { id: canonical || "", title: title, posterUrl: poster, backdropUrl: poster,
        description: desc, playerUrl: player, duration: duration };
}
function parseMovieDetail(html) {
    try {
        var d = _jDetails(html);
        var servers = [];
        if (d.playerUrl) {
            servers.push({
                name: "VPlay (mặc định)",
                episodes: [{ id: d.playerUrl, name: "Xem phim", slug: "default" }]
            });
        }
        return JSON.stringify({
            id: d.id, title: d.title, posterUrl: d.posterUrl, backdropUrl: d.backdropUrl,
            description: d.description, servers: servers, quality: "HD",
            year: "", rating: "", status: "", duration: d.duration,
            casts: "", director: "", category: ""
        });
    } catch (e) {
        return JSON.stringify({ id: "", title: "", posterUrl: "", description: "", servers: [] });
    }
}

// Decode base64 inline scripts where the player embeds its bootstrap code.
function _jDecodeScripts(html) {
    var s = String(html || ""), out = s, re = /data:text\/javascript;base64,([A-Za-z0-9+/=]+)/gi, m;
    while ((m = re.exec(s)) !== null) {
        try {
            out += "\n" + _jBase64Decode(m[1]);
        } catch (e) {}
    }
    return out;
}
function _jFindStream(html) {
    var s = _jDecodeScripts(html);
    // Look for explicit HLS URLs in source, inline JS, JSON or escaped strings.
    var patterns = [
        /https?:\\?\/\\?\/[^"'\\\s<>]+?\.m3u8(?:\?[^"'\\\s<>]*)?/ig,
        /https?:\/\/[^"'\\\s<>]+?\.m3u8(?:\?[^"'\\\s<>]*)?/ig,
        /["'](?:file|src|hls|master|url)["']\s*:\s*["'](https?:[^"']+)["']/ig
    ];
    for (var p = 0; p < patterns.length; p++) {
        var m = patterns[p].exec(s);
        if (m) {
            var u = m[1] || m[0];
            u = u.replace(/\\\//g, "/").replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
            if (/\.m3u8(?:$|[?#])/i.test(u)) return u;
        }
    }
    return "";
}
function _jPlayerResult(html, sourceUrl) {
    var stream = _jFindStream(html);
    if (stream) {
        var origin = "https://x.videplay.us";
        return {
            url: stream,
            isEmbed: false,
            mimeType: "application/x-mpegURL",
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
                "Origin": origin,
                "Referer": origin + "/"
            },
            subtitles: []
        };
    }
    // If this is the JAVCC detail HTML, hand off to the player iframe.
    var iframe = _jFindDefaultIframe(html);
    if (iframe && iframe !== sourceUrl) {
        return { url: iframe, isEmbed: true, headers: { "Referer": JAVCC_BASE + "/" } };
    }
    // Follow an iframe found in the player document if present.
    var im = String(html || "").match(/<iframe\b[^>]*>/i);
    if (im) {
        var src = _jAbs(_jAttr(im[0], "src"), sourceUrl || JAVCC_BASE);
        if (src && src !== sourceUrl) return { url: src, isEmbed: true, headers: { "Referer": sourceUrl || JAVCC_BASE + "/" } };
    }
    return { url: "", isEmbed: false, headers: {} };
}
function parseDetailResponse(html) {
    try { return JSON.stringify(_jPlayerResult(html, "")); }
    catch (e) { return JSON.stringify({ url: "", isEmbed: false }); }
}
function parseEmbedResponse(html, sourceUrl) {
    try { return JSON.stringify(_jPlayerResult(html, sourceUrl || "")); }
    catch (e) { return JSON.stringify({ url: "", isEmbed: false }); }
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
