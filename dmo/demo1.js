// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var TVHAY_BASE_URL = "https://tvhay.buzz";

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHAY",
        "version": "1.0.4",
        "baseUrl": TVHAY_BASE_URL,
        "iconUrl": "https://tvhay.buzz/favicon.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-hay", title: "Phim Hay", type: "Horizontal", path: "" },
        { slug: "phim-moi", title: "Phim Mới", type: "Horizontal", path: "" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "" },
        { slug: "short-drama", title: "Short Drama", type: "Grid", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Bí Ẩn", slug: "bi-an" },
        { name: "Chiến Tranh", slug: "chien-tranh" },
        { name: "Chính Kịch", slug: "chinh-kich" },
        { name: "Cổ Trang", slug: "co-trang" },
        { name: "Gia Đình", slug: "gia-dinh" },
        { name: "Hài Hước", slug: "hai-huoc" },
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Hình Sự", slug: "hinh-su" },
        { name: "Học Đường", slug: "hoc-duong" },
        { name: "Khoa Học", slug: "khoa-hoc" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Kinh Điển", slug: "kinh-dien" },
        { name: "Lịch Sử", slug: "lich-su" },
        { name: "Miền Tây", slug: "mien-tay" },
        { name: "Phim 18+", slug: "phim-18" },
        { name: "Phim Ngắn", slug: "phim-ngan" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Thần Thoại", slug: "than-thoai" },
        { name: "Thể Thao", slug: "the-thao" },
        { name: "Trẻ Em", slug: "tre-em" },
        { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Tâm Lý", slug: "tam-ly" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Viễn Tưởng", slug: "vien-tuong" },
        { name: "Võ Thuật", slug: "vo-thuat" },
        { name: "Âm Nhạc", slug: "am-nhac" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        countries: [
            { name: "Anh", slug: "anh" },
            { name: "Hàn Quốc", slug: "han-quoc" },
            { name: "Hồng Kông", slug: "hong-kong" },
            { name: "Nhật Bản", slug: "nhat-ban" },
            { name: "Thái Lan", slug: "thai-lan" },
            { name: "Trung Quốc", slug: "trung-quoc" },
            { name: "Việt Nam", slug: "viet-nam" },
            { name: "Âu Mỹ", slug: "au-my" },
            { name: "Đài Loan", slug: "dai-loan" },
            { name: "Ấn Độ", slug: "an-do" }
        ],
        years: [
            "2026", "2025", "2024", "2023", "2022", "2021",
            "2020", "2019", "2018", "2017", "2016", "2015",
            "2014", "2013", "2012", "2011", "2010"
        ]
    });
}

// =============================================================================
// HELPER FUNCTIONS (ES5)
// =============================================================================

function _tvhayTrim(str) {
    if (!str) return "";
    return String(str).replace(/^\s+|\s+$/g, "");
}

function _tvhayAbsUrl(href, baseOrigin) {
    if (!href) return "";
    href = _tvhayTrim(href);
    if (href.indexOf("http://") === 0 || href.indexOf("https://") === 0) {
        return href;
    }
    if (href.indexOf("//") === 0) {
        return "https:" + href;
    }
    var origin = baseOrigin || TVHAY_BASE_URL;
    if (href.charAt(0) !== "/") {
        href = "/" + href;
    }
    return origin + href;
}

function _tvhayStripTags(str) {
    if (!str) return "";
    return _tvhayTrim(String(str).replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

function _tvhayDecodeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&")
        .replace(/"/g, '"')
        .replace(/'/g, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">");
}

function _tvhayExtractMode(fetchedUrl) {
    if (!fetchedUrl) return "hpro";
    var m = String(fetchedUrl).match(/(?:[#&?])mode=([a-zA-Z0-9_-]+)/i);
    return (m && m[1]) ? m[1].toLowerCase() : "hpro";
}

function _tvhayDeepUnescape(str) {
    if (!str) return "";
    var s = String(str)
        .replace(/\\\//g, "/")
        .replace(/\\u0026/gi, "&")
        .replace(/\\u003a/gi, ":")
        .replace(/\\u002f/gi, "/")
        .replace(/\\u003d/gi, "=")
        .replace(/\\u003f/gi, "?")
        .replace(/\\x2f/gi, "/")
        .replace(/\\x3a/gi, ":")
        .replace(/&/g, "&")
        .replace(///gi, "/");

    s = s.replace(/\\x([0-9a-fA-F]{2})/g, function (_, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });

    s = s.replace(/\\u([0-9a-fA-F]{4})/g, function (_, u) {
        return String.fromCharCode(parseInt(u, 16));
    });

    return s;
}

function _tvhayJoinBaseAndPath(baseUrl, relPath) {
    if (!relPath) return "";
    relPath = _tvhayTrim(relPath);
    if (relPath.indexOf("http://") === 0 || relPath.indexOf("https://") === 0) {
        return relPath;
    }
    if (relPath.indexOf("//") === 0) {
        return "https:" + relPath;
    }
    if (!baseUrl) {
        return _tvhayAbsUrl(relPath);
    }
    if (relPath.charAt(0) === "/") {
        var originMatch = String(baseUrl).match(/^(https?:\/\/[^\/]+)/i);
        return (originMatch ? originMatch[1] : TVHAY_BASE_URL) + relPath;
    }
    var dir = String(baseUrl).replace(/[^\/?#]+([?#].*)?$/, "");
    return dir + relPath;
}

function _tvhayDeriveM3u8FromAnyUrl(candidateUrl, baseUrl) {
    if (!candidateUrl) return "";
    var full = _tvhayJoinBaseAndPath(baseUrl, candidateUrl);
    if (!full) return "";

    if (/\.m3u8(\?|$)/i.test(full)) {
        return full;
    }

    var segMatch = full.match(/^(https?:\/\/[^?#]+\/\d{8}\/[^/?#]+\/)(?:[^/?#]+\/)?hls\/[^/?#]+\.ts(?:[?#].*)?$/i);
    if (segMatch && segMatch[1]) {
        return segMatch[1] + "index.m3u8";
    }

    return "";
}

function _tvhayExtractImageFromBlock(block) {
    if (!block) return "";
    var imgMatch = block.match(/<img[^>]*>/i);
    var tag = imgMatch ? imgMatch[0] : block;

    var attrMatch = tag.match(/(?:data-src|data-original|data-lazy-src|data-url|src)=["']([^"']+)["']/i);
    var raw = attrMatch ? attrMatch[1] : "";

    if (!raw) {
        var srcsetMatch = tag.match(/srcset=["']([^"'\s,]+)/i);
        if (srcsetMatch && srcsetMatch[1]) {
            raw = srcsetMatch[1];
        }
    }

    var url = _tvhayAbsUrl(_tvhayDecodeHtml(raw));
    if (!url || url.indexOf("data:image") === 0 || url.indexOf("placehold.co") !== -1) {
        return "";
    }
    return url;
}

// --- 1. BỘ QUÉT TĨNH ---
function _tvhayStaticScanM3u8(text, baseUrl) {
    if (!text) return "";
    var s = _tvhayDeepUnescape(text).replace(/["']\s*\+\s*["']/g, "");

    var fullM3u8 = s.match(/(https?:\/\/[^\s"'<>\\`]+\.m3u8(?:\?[^\s"'<>\\`]*)?)/i);
    if (fullM3u8 && fullM3u8[1]) {
        return fullM3u8[1];
    }

    var relM3u8 = s.match(/((?:\/[a-zA-Z0-9_\-\.]+)+\.m3u8(?:\?[^\s"'<>\\`]*)?)/i);
    if (relM3u8 && relM3u8[1]) {
        return _tvhayJoinBaseAndPath(baseUrl, relM3u8[1]);
    }

    if (typeof atob === "function") {
        var atobRegex = /atob\(\s*["']([A-Za-z0-9+/=]{12,})["']\s*\)/gi;
        var aMatch;
        while ((aMatch = atobRegex.exec(s)) !== null) {
            try {
                var dec = _tvhayDeepUnescape(atob(aMatch[1]));
                var m1 = dec.match(/(https?:\/\/[^\s"'<>\\`]+\.m3u8(?:\?[^\s"'<>\\`]*)?)/i);
                if (m1 && m1[1]) return m1[1];
                var m2 = dec.match(/((?:\/[a-zA-Z0-9_\-\.]+)+\.m3u8(?:\?[^\s"'<>\\`]*)?)/i);
                if (m2 && m2[1]) return _tvhayJoinBaseAndPath(baseUrl, m2[1]);
                var dB64 = _tvhayDeriveM3u8FromAnyUrl(dec, baseUrl);
                if (dB64) return dB64;
            } catch (e) {}
        }
    }

    var joinArrRegex = /\[([^\]]{10,})\]\s*\.\s*join\(\s*["']([^"']*)["']\s*\)/gi;
    var jMatch;
    while ((jMatch = joinArrRegex.exec(s)) !== null) {
        var sep = jMatch[2] || "";
        var parts = [];
        var partRegex = /["']([^"']*)["']/g;
        var pMatch;
        while ((pMatch = partRegex.exec(jMatch[1])) !== null) {
            parts.push(pMatch[1]);
        }
        var combined = _tvhayDeepUnescape(parts.join(sep));
        var mJoin = combined.match(/(https?:\/\/[^\s"'<>\\`]+\.m3u8(?:\?[^\s"'<>\\`]*)?)/i);
        if (mJoin && mJoin[1]) return mJoin[1];
        var dJoin = _tvhayDeriveM3u8FromAnyUrl(combined, baseUrl);
        if (dJoin) return dJoin;
    }

    var tsMatch = s.match(/(https?:\/\/[^\s"'<>\\`]+\/hls\/[^\s"'<>\\`]+\.ts(?:\?[^\s"'<>\\`]*)?)/i);
    if (tsMatch && tsMatch[1]) {
        var fromTs = _tvhayDeriveM3u8FromAnyUrl(tsMatch[1], baseUrl);
        if (fromTs) return fromTs;
    }

    return "";
}

// --- Giải mã JS Packer cơ bản ---
function _tvhayUnpackJs(code) {
    try {
        var m = code.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]*?\}\(\s*(['"])([\s\S]*?)\1\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(['"])([\s\S]*?)\5\.split\(['"]\|['"]\)/i);
        if (!m) return "";
        var p = m[2];
        var a = parseInt(m[3], 10);
        var c = parseInt(m[4], 10);
        var k = m[6].split("|");
        if (!a || !c || !k.length) return "";

        var toBase = function (num, base) {
            var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var prefix = num < base ? "" : toBase(parseInt(num / base, 10), base);
            var mod = num % base;
            return prefix + (mod > 35 ? String.fromCharCode(mod + 29) : chars.charAt(mod));
        };

        var dict = {};
        while (c--) {
            var key = toBase(c, a);
            dict[key] = k[c] || key;
        }

        return p.replace(/\b([0-9a-zA-Z]+)\b/g, function (w) {
            return (dict[w] !== undefined) ? dict[w] : w;
        });
    } catch (e) {
        return "";
    }
}

// --- 2. BỘ QUÉT ĐỘNG ---
function _tvhayDynamicResolveOrNext(html, refererUrl) {
    var cleaned = _tvhayDeepUnescape(html);
    var trimmed = _tvhayTrim(cleaned);

    if (trimmed.charAt(0) === "{") {
        try {
            var obj = JSON.parse(trimmed);
            var rawCandidate = obj.url || obj.link || obj.stream || obj.file || obj.m3u8 || obj.src || obj.iframe || obj.playlist || "";
            if (rawCandidate) {
                var scannedFromJson = _tvhayStaticScanM3u8(rawCandidate, refererUrl);
                var resolvedJson = scannedFromJson || _tvhayJoinBaseAndPath(refererUrl, rawCandidate);
                var isHls = /\.m3u8(\?|$)/i.test(resolvedJson) || resolvedJson.indexOf("m3u8") !== -1;
                var isMp4 = /\.mp4(\?|$)/i.test(resolvedJson);
                return {
                    url: resolvedJson,
                    isEmbed: !isHls && !isMp4,
                    mimeType: isHls ? "application/x-mpegURL" : (isMp4 ? "video/mp4" : ""),
                    headers: { "Referer": refererUrl }
                };
            }
        } catch (e) {}
    }

    var unpacked = _tvhayUnpackJs(cleaned);
    if (unpacked) {
        var m3u8FromPacked = _tvhayStaticScanM3u8(unpacked, refererUrl);
        if (m3u8FromPacked) {
            return {
                url: m3u8FromPacked,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: { "Referer": refererUrl }
            };
        }
        cleaned = cleaned + "\n" + unpacked;
    }

    var iframeMatch = cleaned.match(/<iframe[^>]*src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
        return {
            url: _tvhayJoinBaseAndPath(refererUrl, iframeMatch[1]),
            isEmbed: true,
            headers: { "Referer": refererUrl }
        };
    }

    var apiMatch = cleaned.match(/(?:fetch|axios\.(?:get|post)|\$\.(?:ajax|get|post)|\.open\s*\(\s*["'](?:GET|POST)["']\s*,)\s*["']([^"']*(?:stream|source|play|video|link|playlist|m3u8|hash|token|api|embed)[^"']*)["']/i);
    if (apiMatch && apiMatch[1]) {
        return {
            url: _tvhayJoinBaseAndPath(refererUrl, apiMatch[1]),
            isEmbed: true,
            headers: {
                "Referer": refererUrl,
                "X-Requested-With": "XMLHttpRequest"
            }
        };
    }

    return null;
}

// =============================================================================
// URL GENERATION & PARSERS
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    var country = filters.country || "";
    var year = filters.year || "";
    var base = TVHAY_BASE_URL;

    if (country) {
        return page > 1
            ? base + "/quoc-gia/" + country + "/trang-" + page
            : base + "/quoc-gia/" + country;
    }

    if (year) {
        return page > 1
            ? base + "/nam/" + year + "/trang-" + page
            : base + "/nam/" + year;
    }

    if (!slug || slug === "" || slug === "home" || slug === "phim-hay") {
        return page > 1
            ? base + "/phim-moi/trang-" + page
            : base + "/";
    }

    if (
        slug === "phim-moi" ||
        slug === "phim-bo" ||
        slug === "phim-le" ||
        slug === "short-drama"
    ) {
        return page > 1
            ? base + "/" + slug + "/trang-" + page
            : base + "/" + slug;
    }

    return page > 1
        ? base + "/the-loai/" + slug + "/trang-" + page
        : base + "/the-loai/" + slug;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    var q = _tvhayTrim(keyword || "");
    var url = TVHAY_BASE_URL + "/?view=tim-kiem&keyword=" + encodeURIComponent(q);
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.charAt(0) !== "/") slug = "/" + slug;
    return TVHAY_BASE_URL + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function parseListResponse(html) {
    var items = [];
    var seenIds = {};

    if (!html) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }

    if (_tvhayTrim(html).charAt(0) === "[") {
        try {
            var arr = JSON.parse(html);
            for (var j = 0; j < arr.length; j++) {
                var m = arr[j] || {};
                var mUrl = m.slug ? _tvhayAbsUrl("/phim/" + m.slug) : _tvhayAbsUrl(m.url || m.link || "");
                var mThumb = _tvhayAbsUrl(m.thumb || m.poster || m.posterUrl || m.image || "");
                if (mUrl && m.name && !seenIds[mUrl]) {
                    seenIds[mUrl] = true;
                    items.push({
                        id: mUrl,
                        title: _tvhayDecodeHtml(_tvhayStripTags(String(m.name))),
                        posterUrl: mThumb,
                        poster: mThumb,
                        backdropUrl: mThumb,
                        year: parseInt(m.year, 10) || 0,
                        lang: m.lang || ""
                    });
                }
            }
            return JSON.stringify({
                items: items,
                pagination: { currentPage: 1, totalPages: 1 }
            });
        } catch (jsonErr) {}
    }

    var blocks = html.split(/class=["'][^"']*movie-item[^"']*["']/i);
    for (var i = 1; i < blocks.length; i++) {
        var block = blocks[i];
        var prevTail = blocks[i - 1].slice(-300);
        var searchScope = prevTail + block;

        var linkMatch = block.match(/href=["']([^"']+)["']/i) || prevTail.match(/href=["']([^"']+)["']/i);
        var fullLink = _tvhayAbsUrl(linkMatch ? linkMatch[1] : "");

        var titleMatch = block.match(/class=["'][^"']*movie-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
            || block.match(/title=["']([^"']+)["']/i)
            || prevTail.match(/title=["']([^"']+)["']/i);
        var cleanTitle = _tvhayDecodeHtml(_tvhayStripTags(titleMatch ? titleMatch[1] : ""));

        var thumb = _tvhayExtractImageFromBlock(block) || _tvhayExtractImageFromBlock(searchScope);

        var yearMatch = block.match(/<span[^>]*font-weight:\s*bold[^>]*>(\d{4})<\/span>/i)
            || block.match(/\b(19\d{2}|20\d{2})\b/);
        var year = yearMatch ? (parseInt(yearMatch[1], 10) || 0) : 0;

        var langMatch = block.match(/class=["'][^"']*movie-label[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var lang = langMatch ? _tvhayStripTags(langMatch[1]) : "";

        var epMatch = block.match(/class=["'][^"']*movie-ep-status[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var status = epMatch ? _tvhayStripTags(epMatch[1]) : "";

        if (fullLink && cleanTitle && !seenIds[fullLink]) {
            seenIds[fullLink] = true;
            items.push({
                id: fullLink,
                title: cleanTitle,
                posterUrl: thumb,
                poster: thumb,
                backdropUrl: thumb,
                year: year,
                lang: lang,
                status: status
            });
        }
    }

    var currentPage = 1;
    var totalPages = 1;

    var cpMatch = html.match(/<[^>]*class=["'][^"']*current[^"']*["'][^>]*>(\d+)<\/[^>]+>/i);
    if (cpMatch) {
        currentPage = parseInt(cpMatch[1], 10) || 1;
    }

    var pageRegex = /<(?:a|span)[^>]*>(\d+)<\/(?:a|span)>/gi;
    var pMatch;
    while ((pMatch = pageRegex.exec(html)) !== null) {
        var num = parseInt(pMatch[1], 10);
        if (num > totalPages && num < 10000) {
            totalPages = num;
        }
    }
    if (currentPage > totalPages) {
        totalPages = currentPage;
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        if (!html) return "null";

        var canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
            || html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        var pageUrl = canonicalMatch ? _tvhayAbsUrl(canonicalMatch[1]) : "";

        var h1Match = html.match(/<h1[^>]*class=["'][^"']*movie-h1[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i)
            || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var h2Match = html.match(/<h2[^>]*class=["'][^"']*movie-h2[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i);
        var ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);

        var title = "";
        if (h1Match) {
            title = _tvhayDecodeHtml(_tvhayStripTags(h1Match[1]))
                .replace(/\s*TẬP\s*\d+.*$/i, "")
                .replace(/\s*(THUYẾT MINH|LỒNG TIẾNG|VIETSUB).*$/i, "");
            title = _tvhayTrim(title);
        }
        if (!title && ogTitleMatch) {
            title = _tvhayTrim(
                _tvhayDecodeHtml(_tvhayStripTags(ogTitleMatch[1]))
                    .replace(/^Xem phim\s+/i, "")
                    .replace(/\s*-\s*.*$/, "")
            );
        }

        var descMatch = html.match(/<div[^>]*class=["'][^"']*movie-desc[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
            || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        var description = descMatch ? _tvhayDecodeHtml(_tvhayStripTags(descMatch[1])) : "";

        var ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var posterUrl = ogImgMatch ? _tvhayAbsUrl(ogImgMatch[1]) : "";

        var yearText = h2Match ? _tvhayStripTags(h2Match[1]) : html;
        var yearMatch = yearText.match(/\b(19\d{2}|20\d{2})\b/);
        var year = yearMatch ? (parseInt(yearMatch[1], 10) || 0) : 0;

        var episodeBlockMatch = html.match(/<div[^>]*class=["'][^"']*episode-block["'][^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class=["'][^"']*movie-info-block["']/i);
        var epScope = episodeBlockMatch ? episodeBlockMatch[1] : html;

        var sourceSplits = epScope.split(/class=["'][^"']*source-container[^"']*["']/i);
        var sourceGroups = [];

        if (sourceSplits.length > 1) {
            for (var s = 1; s < sourceSplits.length; s++) {
                var sBlock = sourceSplits[s];
                var sTitleMatch = sBlock.match(/class=["'][^"']*source-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
                var sName = sTitleMatch ? _tvhayDecodeHtml(_tvhayStripTags(sTitleMatch[1])) : ("Nguồn #" + s);

                var eps = [];
                var seenEp = {};
                var epRegex = /<a[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*ep-btn[^"']*["'][^>]*>([\s\S]*?)<\/a>|<a[^>]*class=["'][^"']*ep-btn[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
                var epMatch;
                while ((epMatch = epRegex.exec(sBlock)) !== null) {
                    var href = _tvhayAbsUrl(epMatch[1] || epMatch[3]);
                    var epLabel = _tvhayDecodeHtml(_tvhayStripTags(epMatch[2] || epMatch[4]));
                    var epName = /^\d+$/.test(epLabel) ? ("Tập " + epLabel) : (epLabel || ("Tập " + (eps.length + 1)));
                    if (href && !seenEp[href]) {
                        seenEp[href] = true;
                        eps.push({
                            id: href,
                            name: epName,
                            slug: href
                        });
                    }
                }

                if (eps.length > 0) {
                    sourceGroups.push({
                        sourceName: sName,
                        episodes: eps
                    });
                }
            }
        }

        if (sourceGroups.length === 0) {
            var fallbackEps = [];
            var seenFallback = {};
            var fbRegex = /<a[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*ep-btn[^"']*["'][^>]*>([\s\S]*?)<\/a>|<a[^>]*class=["'][^"']*ep-btn[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            var fbMatch;
            while ((fbMatch = fbRegex.exec(epScope)) !== null) {
                var fbHref = _tvhayAbsUrl(fbMatch[1] || fbMatch[3]);
                var fbLabel = _tvhayDecodeHtml(_tvhayStripTags(fbMatch[2] || fbMatch[4]));
                var fbName = /^\d+$/.test(fbLabel) ? ("Tập " + fbLabel) : (fbLabel || ("Tập " + (fallbackEps.length + 1)));
                if (fbHref && !seenFallback[fbHref]) {
                    seenFallback[fbHref] = true;
                    fallbackEps.push({
                        id: fbHref,
                        name: fbName,
                        slug: fbHref
                    });
                }
            }
            if (fallbackEps.length === 0 && pageUrl) {
                fallbackEps.push({
                    id: pageUrl,
                    name: "Full",
                    slug: "full"
                });
            }
            sourceGroups.push({
                sourceName: "Lồng tiếng #1",
                episodes: fallbackEps
            });
        }

        var playerModes = [];
        var modeRegex = /onclick=["']changePlayerMode\(['"]([^'"]+)['"]\)["'][^>]*>([\s\S]*?)<\/button>/gi;
        var modeMatch;
        while ((modeMatch = modeRegex.exec(html)) !== null) {
            var modeKey = _tvhayTrim(modeMatch[1]).toLowerCase();
            var modeLabel = _tvhayDecodeHtml(_tvhayStripTags(modeMatch[2])) || modeKey.toUpperCase();
            playerModes.push({
                key: modeKey,
                label: modeLabel
            });
        }
        if (playerModes.length === 0) {
            playerModes.push({ key: "hpro", label: "H.PRO" });
            playerModes.push({ key: "spro", label: "S.PRO" });
        }

        var servers = [];
        for (var g = 0; g < sourceGroups.length; g++) {
            var group = sourceGroups[g];
            for (var m = 0; m < playerModes.length; m++) {
                var modeObj = playerModes[m];
                var modeEps = [];
                for (var e = 0; e < group.episodes.length; e++) {
                    var baseEp = group.episodes[e];
                    var sep = baseEp.id.indexOf("#") !== -1 ? "&" : "#";
                    modeEps.push({
                        id: baseEp.id + sep + "mode=" + modeObj.key,
                        name: baseEp.name,
                        slug: baseEp.slug + "-" + modeObj.key
                    });
                }
                servers.push({
                    name: group.sourceName + " - " + modeObj.label,
                    episodes: modeEps
                });
            }
        }

        var lang = "Thuyết Minh / Lồng Tiếng";
        if (/lồng tiếng/i.test(html) && !/thuyết minh/i.test(html)) {
            lang = "Lồng Tiếng";
        } else if (/thuyết minh/i.test(html) && !/lồng tiếng/i.test(html)) {
            lang = "Thuyết Minh";
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: posterUrl,
            poster: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            servers: servers,
            quality: "HD",
            lang: lang,
            year: year,
            rating: 0,
            casts: "",
            director: "",
            country: "",
            category: "",
            status: "HD"
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html, fetchedUrl) {
    try {
        if (!html) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var cleaned = _tvhayDeepUnescape(html);
        var mode = _tvhayExtractMode(fetchedUrl);

        var hProMatch = cleaned.match(/var\s+linkHPro\s*=\s*["']([^"']*)["']/i);
        var sProMatch = cleaned.match(/var\s+linkSPro\s*=\s*["']([^"']*)["']/i);
        var iframeMatch = cleaned.match(/<iframe[^>]*id=["']movie-iframe["'][^>]*src=["']([^"']+)["']/i)
            || cleaned.match(/<iframe[^>]*src=["']([^"']+)["']/i);

        var chosenUrl = "";
        if (mode === "spro" && sProMatch && _tvhayTrim(sProMatch[1])) {
            chosenUrl = _tvhayTrim(sProMatch[1]);
        } else if (mode === "hpro" && hProMatch && _tvhayTrim(hProMatch[1])) {
            chosenUrl = _tvhayTrim(hProMatch[1]);
        } else if (hProMatch && _tvhayTrim(hProMatch[1])) {
            chosenUrl = _tvhayTrim(hProMatch[1]);
        } else if (sProMatch && _tvhayTrim(sProMatch[1])) {
            chosenUrl = _tvhayTrim(sProMatch[1]);
        } else if (iframeMatch && _tvhayTrim(iframeMatch[1])) {
            chosenUrl = _tvhayTrim(iframeMatch[1]);
        }

        chosenUrl = _tvhayAbsUrl(chosenUrl);
        if (!chosenUrl) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var isHls = /\.m3u8(\?|$)/i.test(chosenUrl);
        var isMp4 = /\.mp4(\?|$)/i.test(chosenUrl);
        var isDirect = isHls || isMp4;

        return JSON.stringify({
            url: chosenUrl,
            isEmbed: !isDirect,
            mimeType: isHls ? "application/x-mpegURL" : (isMp4 ? "video/mp4" : ""),
            headers: {
                "Referer": TVHAY_BASE_URL + "/"
            }
        });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

function parseEmbedResponse(html, url) {
    try {
        if (!html) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var refererUrl = url || (TVHAY_BASE_URL + "/");
        var trimmed = _tvhayTrim(_tvhayDeepUnescape(html));

        if (/^#EXTM3U/i.test(trimmed) && url) {
            return JSON.stringify({
                url: url,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: { "Referer": TVHAY_BASE_URL + "/" }
            });
        }

        var staticM3u8 = _tvhayStaticScanM3u8(html, refererUrl);
        if (staticM3u8) {
            return JSON.stringify({
                url: staticM3u8,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: { "Referer": refererUrl }
            });
        }

        var dynamicRes = _tvhayDynamicResolveOrNext(html, refererUrl);
        if (dynamicRes && dynamicRes.url) {
            return JSON.stringify(dynamicRes);
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}
