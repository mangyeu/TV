// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://tvhay.buzz";
var PLAYER_ORIGIN = "https://player.phimapi.com";
var PLAYER_REFERER = "https://player.phimapi.com/";
var DEFAULT_USER_AGENT = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHay",
        "version": "1.3.0",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.png",
        "isEnabled": true,
        "playerType": "exoplayer",
        "type": "MOVIE"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[TVHay] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[TVHay] " + msg);
    }
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi', title: 'Phim Mới Cập Nhật', type: 'Grid', path: '' },
        { slug: 'phim-bo', title: 'Phim Bộ Mới', type: 'Horizontal', path: '' },
        { slug: 'phim-le', title: 'Phim Lẻ Mới', type: 'Horizontal', path: '' },
        { slug: 'short-drama', title: 'Short Drama', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Short Drama', slug: 'short-drama' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Sắp xếp', value: '' },
            { name: 'Mới cập nhật', value: 'update' },
            { name: 'Thời gian đăng', value: 'create' },
            { name: 'Năm sản xuất', value: 'year' },
            { name: 'Lượt xem', value: 'view' }
        ],
        type: [
            { name: 'Tất cả', value: '' },
            { name: 'Phim bộ', value: 'series' },
            { name: 'Phim lẻ', value: 'single' }
        ],
        category: [
            { name: 'Thể loại', value: '' },
            { name: 'Bí Ẩn', value: 'bi-an' },
            { name: 'Chiến Tranh', value: 'chien-tranh' },
            { name: 'Chính Kịch', value: 'chinh-kich' },
            { name: 'Cổ Trang', value: 'co-trang' },
            { name: 'Gia Đình', value: 'gia-dinh' },
            { name: 'Hài Hước', value: 'hai-huoc' },
            { name: 'Hài', value: 'hai' },
            { name: 'Hành Động', value: 'hanh-dong' },
            { name: 'Hình Sự', value: 'hinh-su' },
            { name: 'Học Đường', value: 'hoc-duong' },
            { name: 'Khoa Học', value: 'khoa-hoc' },
            { name: 'Kinh Dị', value: 'kinh-di' },
            { name: 'Kinh Điển', value: 'kinh-dien' },
            { name: 'Lịch Sử', value: 'lich-su' },
            { name: 'Miền Tây', value: 'mien-tay' },
            { name: 'Phim 18+', value: 'phim-18' },
            { name: 'Phim Ngắn', value: 'phim-ngan' },
            { name: 'Phiêu Lưu', value: 'phieu-luu' },
            { name: 'Thần Thoại', value: 'than-thoai' },
            { name: 'Thể Thao', value: 'the-thao' },
            { name: 'Trẻ Em', value: 'tre-em' },
            { name: 'Tài Liệu', value: 'tai-lieu' },
            { name: 'Tâm Lý', value: 'tam-ly' },
            { name: 'Tình Cảm', value: 'tinh-cam' },
            { name: 'Viễn Tưởng', value: 'vien-tuong' },
            { name: 'Võ Thuật', value: 'vo-thuat' },
            { name: 'Âm Nhạc', value: 'am-nhac' }
        ],
        country: [
            { name: 'Quốc gia', value: '' },
            { name: 'Trung Quốc', value: 'trung-quoc' },
            { name: 'Hàn Quốc', value: 'han-quoc' },
            { name: 'Thái Lan', value: 'thai-lan' },
            { name: 'Nhật Bản', value: 'nhat-ban' },
            { name: 'Âu Mỹ', value: 'au-my' },
            { name: 'Hồng Kông', value: 'hong-kong' },
            { name: 'Đài Loan', value: 'dai-loan' },
            { name: 'Việt Nam', value: 'viet-nam' }
        ],
        language: [
            { name: 'Ngôn ngữ', value: '' },
            { name: 'Vietsub', value: 'Vietsub' },
            { name: 'Thuyết Minh', value: 'Thuyết Minh' },
            { name: 'Lồng Tiếng', value: 'Lồng Tiếng' }
        ]
    });
}

// =============================================================================
// URL & TEXT HELPERS
// =============================================================================

function parseFiltersArg(filtersJson) {
    if (!filtersJson) return {};
    if (typeof filtersJson === "object") return filtersJson;
    if (typeof filtersJson === "number") return { page: filtersJson };
    var str = String(filtersJson).trim();
    if (!str) return {};
    if (/^\d+$/.test(str)) return { page: parseInt(str, 10) };
    try {
        return JSON.parse(str) || {};
    } catch (e) {
        return {};
    }
}

function decodeEscapedUrl(str) {
    if (!str) return "";
    return String(str)
        .replace(/\\\//g, "/")
        .replace(/\\u0026/gi, "&")
        .replace(/\\u003d/gi, "=")
        .replace(/\\u003f/gi, "?")
        .replace(/\\u002f/gi, "/")
        .replace(/\\x2f/gi, "/")
        .replace(/&/gi, "&")
        .trim();
}

function normalizeUrl(url) {
    if (!url) return "";
    url = decodeEscapedUrl(url).replace(/^http:\/\//i, "https://");
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.indexOf("//") === 0) return "https:" + url;
    return BASE_URL + (url.indexOf("/") === 0 ? "" : "/") + url;
}

function unwrapPlayerUrl(rawUrl) {
    if (!rawUrl) return "";
    var decodedStr = decodeEscapedUrl(rawUrl);
    var match = /[?&]url=([^&#"'\s<>]+)/i.exec(decodedStr);
    if (!match || !match[1]) return "";
    var val = match[1];
    try {
        val = decodeURIComponent(val);
    } catch (e) {}
    return normalizeUrl(val);
}

function stripTags(html) {
    if (!html) return "";
    var s = String(html);
    for (var pass = 0; pass < 2; pass++) {
        s = s
            .replace(/</gi, "<")
            .replace(/>/gi, ">")
            .replace(/"/gi, '"')
            .replace(/'/gi, "'")
            .replace(/'/gi, "'")
            .replace(/&/gi, "&")
            .replace(/ /gi, " ");
    }
    return s
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function decodeBase64(str) {
    try {
        var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var output = [];
        var clean = String(str || "").replace(/[^A-Za-z0-9+/=]/g, '');
        var len = clean.length;

        for (var i = 0; i < len; i += 4) {
            var c1 = lookup.indexOf(clean.charAt(i));
            var c2 = lookup.indexOf(clean.charAt(i + 1));
            var c3 = lookup.indexOf(clean.charAt(i + 2));
            var c4 = lookup.indexOf(clean.charAt(i + 3));
            if (c1 < 0 || c2 < 0) break;

            output.push(String.fromCharCode((c1 << 2) | (c2 >> 4)));
            if (c3 >= 0 && c3 !== 64) {
                output.push(String.fromCharCode(((c2 & 15) << 4) | (c3 >> 2)));
            }
            if (c4 >= 0 && c4 !== 64) {
                output.push(String.fromCharCode(((c3 & 3) << 6) | c4));
            }
        }

        var raw = output.join('');
        try {
            return decodeURIComponent(escape(raw));
        } catch (e) {
            return raw;
        }
    } catch (e) {
        return "";
    }
}

function extractBalancedDivs(html, startPattern) {
    var results = [];
    var regex = new RegExp(startPattern, "gi");
    var m;
    while ((m = regex.exec(html)) !== null) {
        var openIdx = m.index;
        var tagEnd = html.indexOf(">", openIdx);
        if (tagEnd === -1) break;

        var depth = 1;
        var pos = tagEnd + 1;
        var divTokenRegex = /<\/?div\b[^>]*>/gi;
        divTokenRegex.lastIndex = pos;
        var tMatch;
        while ((tMatch = divTokenRegex.exec(html)) !== null) {
            if (tMatch[0].charAt(1) === "/") {
                depth--;
                if (depth === 0) {
                    results.push(html.slice(tagEnd + 1, tMatch.index));
                    regex.lastIndex = tMatch.index + tMatch[0].length;
                    break;
                }
            } else {
                depth++;
            }
        }
        if (depth !== 0) break;
    }
    return results;
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = parseFiltersArg(filtersJson);
        var page = parseInt(filters.page || 1, 10) || 1;
        var hasFilter = filters.sort || filters.category || filters.country || filters.year || filters.type || filters.language;

        if (hasFilter) {
            var params = [];
            if (filters.sort) params.push("filter[sort]=" + encodeURIComponent(filters.sort));
            if (filters.type) params.push("filter[type]=" + encodeURIComponent(filters.type));
            if (filters.category) params.push("filter[category]=" + encodeURIComponent(filters.category));
            if (filters.country) params.push("filter[region]=" + encodeURIComponent(filters.country));
            if (filters.year) params.push("filter[year]=" + encodeURIComponent(filters.year));
            if (filters.language) params.push("filter[language]=" + encodeURIComponent(filters.language));
            if (page > 1) params.push("page=" + page);
            var fUrl = BASE_URL + "/?" + params.join("&");
            log("getUrlList -> " + fUrl);
            return fUrl;
        }

        var cleanSlug = String(slug || "phim-moi").replace(/^\/+/, "");
        var path = "";
        if (
            cleanSlug === "phim-moi" ||
            cleanSlug === "phim-bo" ||
            cleanSlug === "phim-le" ||
            cleanSlug === "short-drama" ||
            cleanSlug.indexOf("the-loai/") === 0 ||
            cleanSlug.indexOf("quoc-gia/") === 0 ||
            cleanSlug.indexOf("nam/") === 0
        ) {
            path = "/" + cleanSlug;
        } else {
            path = "/the-loai/" + cleanSlug;
        }

        var u = BASE_URL + path + (page > 1 ? "?page=" + page : "");
        log("getUrlList -> " + u);
        return u;
    } catch (e) {
        log("getUrlList error: " + e);
        return BASE_URL + "/phim-moi";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = parseFiltersArg(filtersJson);
        var page = parseInt(filters.page || 1, 10) || 1;
        var url = BASE_URL + "/index.php?view=tim-kiem&keyword=" + encodeURIComponent(keyword || "");
        if (page > 1) url += "&page=" + page;
        return url;
    } catch (e) {
        return BASE_URL + "/index.php?view=tim-kiem&keyword=" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    if (/^https?:\/\//i.test(slug)) return slug;
    var path = String(slug).replace(/^\/+/, "");
    return BASE_URL + "/" + path;
}

function getUrlCategories() { return BASE_URL + "/the-loai"; }
function getUrlCountries() { return BASE_URL + "/quoc-gia"; }
function getUrlYears() { return BASE_URL + "/nam"; }

// =============================================================================
// STREAM / EMBED EXTRACTION
// =============================================================================

function isAdOrTrackerUrl(url) {
    return /(?:trafficstars|tsyndicate|doubleclick|googlesyndication|googletagmanager|google-analytics|cloudflareinsights|bit\.ly|shortlink|omg10\.com|t\.co\/|154\.82\.109\.164|choitic88|c168n\.biz|blogger\.googleusercontent\.com|iili\.io|ibb\.co)/i.test(url || "");
}

function isMediaSegmentUrl(url) {
    return /\.(?:ts|m4s|key|vtt|srt)(?:\?|$|#)/i.test(url || "");
}

function detectStreamType(url) {
    if (!url) return "embed";
    if (/\.m3u8(?:\?|$|#)/i.test(url)) return "hls";
    if (/\.mp4(?:\?|$|#)/i.test(url)) return "mp4";
    return "embed";
}

function scoreStreamCandidate(candidate) {
    var score = 100;
    if (!candidate || !candidate.url) return score;
    var u = candidate.url.toLowerCase();

    if (candidate.type === "hls") score = 10;
    else if (candidate.type === "mp4") score = 30;
    else if (candidate.type === "embed") score = 50;

    if (candidate.type === "hls") {
        if (/\/index\.m3u8(?:\?|$|#)/i.test(u) || /master\.m3u8/i.test(u)) {
            score -= 5;
        }
        if (/\/\d+kb\/hls\//i.test(u) || /playlist\.m3u8/i.test(u)) {
            score += 2;
        }
    }

    if (candidate.server === "Direct" || candidate.server.indexOf("Unwrapped") !== -1) {
        score -= 2;
    }
    return score;
}

function sortAndDedupeCandidates(list) {
    var seen = {};
    var unique = [];
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (!item || !item.url || seen[item.url]) continue;
        seen[item.url] = true;
        unique.push(item);
    }
    unique.sort(function (a, b) {
        return scoreStreamCandidate(a) - scoreStreamCandidate(b);
    });
    return unique;
}

function extractStreamCandidates(htmlContent) {
    var html = decodeEscapedUrl(htmlContent || "");
    var candidates = [];

    function addCandidate(rawUrl, typeHint, serverLabel) {
        var unwrapped = unwrapPlayerUrl(rawUrl);
        if (unwrapped) {
            var uNorm = normalizeUrl(unwrapped);
            if (uNorm && !isAdOrTrackerUrl(uNorm) && !isMediaSegmentUrl(uNorm)) {
                candidates.push({
                    url: uNorm,
                    type: detectStreamType(uNorm),
                    server: (serverLabel || "Player") + "-Unwrapped"
                });
            }
        }

        var norm = normalizeUrl(rawUrl);
        if (!norm || isAdOrTrackerUrl(norm) || isMediaSegmentUrl(norm)) return;
        if (/1s_blank\.mp4|preview\.mp4/i.test(norm)) return;

        var sType = typeHint || detectStreamType(norm);
        candidates.push({
            url: norm,
            type: sType,
            server: serverLabel || "Unknown"
        });
    }

    var varLinkRegex = /\b(linkHPro|linkSPro|embedUrl|streamUrl|videoUrl|hlsUrl|m3u8Url|playUrl|source|file)\s*[:=]\s*["']([^"'\s<>]+)["']/gi;
    var vMatch;
    while ((vMatch = varLinkRegex.exec(html)) !== null) {
        var val = vMatch[2];
        if (/^(https?:\/\/|\/\/|\/)/i.test(val) || /\.m3u8|\.mp4|embed\.php|player/i.test(val)) {
            addCandidate(val, "", vMatch[1]);
        }
    }

    var mediaRegex = /((?:https?:\/\/|\/)[^\s"'<>\\()]+?\.(?:m3u8|mp4)(?:[^\s"'<>\\()]*)?)/gi;
    var mMatch;
    while ((mMatch = mediaRegex.exec(html)) !== null) {
        var mUrl = mMatch[1];
        addCandidate(mUrl, /\.m3u8/i.test(mUrl) ? "hls" : "mp4", "Direct");
    }

    var wrapRegex = /(https?:\/\/[^\s"'<>\\()]*player[^\s"'<>\\()]*\?[^\s"'<>\\()]*url=[^\s"'<>\\()]+)/gi;
    var wMatch;
    while ((wMatch = wrapRegex.exec(html)) !== null) {
        addCandidate(wMatch[1], "embed", "PlayerWrap");
    }

    var tagSrcRegex = /<(?:iframe|video|source)\b[^>]+(?:src|data-src|data-url|data-video)=["']([^"']+)["']/gi;
    var tMatch;
    while ((tMatch = tagSrcRegex.exec(html)) !== null) {
        addCandidate(tMatch[1], "", "TagSrc");
    }

    var b64Regex = /(?:atob\(|base64,|data-link=|data-url=|data-src=|source\s*[:=]\s*)[\s"']*([A-Za-z0-9+/=]{24,})["']/gi;
    var bMatch;
    while ((bMatch = b64Regex.exec(html)) !== null) {
        var decoded = decodeBase64(bMatch[1]).trim();
        if (/^(https?:\/\/|\/\/|\/)/i.test(decoded)) {
            addCandidate(decoded, "", "Decoded");
        }
    }

    return sortAndDedupeCandidates(candidates);
}

// =============================================================================
// ASYNC EMBED RESOLVER (ES5 + XMLHttpRequest)
// =============================================================================

function requestTextWithHeaders(url, refererUrl, onDone, onFail) {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("User-Agent", DEFAULT_USER_AGENT);
        if (refererUrl) {
            try { xhr.setRequestHeader("Referer", refererUrl); } catch (e1) {}
        }
        try { xhr.setRequestHeader("Origin", PLAYER_ORIGIN); } catch (e2) {}
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                    onDone(xhr.responseText || "");
                } else {
                    onFail(new Error("HTTP " + xhr.status + " for " + url));
                }
            }
        };
        xhr.onerror = function () {
            onFail(new Error("XHR error for " + url));
        };
        xhr.send();
    } catch (err) {
        onFail(err);
    }
}

function resolveStreamFromDetail(detailOrJson, pageUrl, onSuccess, onError, depth, visited) {
    var d = typeof depth === "number" ? depth : 0;
    var maxDepth = 3;
    var seen = visited || {};
    var detailObj = detailOrJson;

    if (typeof detailOrJson === "string") {
        try {
            detailObj = JSON.parse(detailOrJson);
        } catch (e) {
            detailObj = { streamUrl: detailOrJson, streamCandidates: [] };
        }
    }
    if (!detailObj) detailObj = {};

    var ref = pageUrl || detailObj.pageUrl || (BASE_URL + "/");
    var candidates = sortAndDedupeCandidates(detailObj.streamCandidates || []);

    for (var i = 0; i < candidates.length; i++) {
        if (candidates[i] && (candidates[i].type === "hls" || candidates[i].type === "mp4")) {
            detailObj.streamUrl = candidates[i].url;
            detailObj.streamType = candidates[i].type;
            detailObj.headers = {
                "Referer": PLAYER_REFERER,
                "Origin": PLAYER_ORIGIN,
                "User-Agent": DEFAULT_USER_AGENT
            };
            detailObj.streamCandidates = candidates;
            if (typeof onSuccess === "function") {
                onSuccess(JSON.stringify(detailObj));
            }
            return;
        }
    }

    if (d >= maxDepth) {
        if (typeof onError === "function") {
            onError(new Error("Max embed resolve depth reached"));
        }
        return;
    }

    var embedList = [];
    for (var j = 0; j < candidates.length; j++) {
        if (candidates[j] && candidates[j].type === "embed" && candidates[j].url) {
            embedList.push(candidates[j].url);
        }
    }
    if (embedList.length === 0 && detailObj.streamUrl && /\.(?:php|html?)|player/i.test(detailObj.streamUrl)) {
        embedList.push(detailObj.streamUrl);
    }

    var idx = 0;
    function nextEmbed() {
        if (idx >= embedList.length) {
            if (typeof onError === "function") {
                onError(new Error("No playable stream found after resolving embeds"));
            }
            return;
        }
        var target = embedList[idx++];
        var unwrappedTarget = unwrapPlayerUrl(target);
        if (unwrappedTarget) {
            detailObj.streamUrl = unwrappedTarget;
            detailObj.streamType = detectStreamType(unwrappedTarget);
            detailObj.headers = {
                "Referer": PLAYER_REFERER,
                "Origin": PLAYER_ORIGIN,
                "User-Agent": DEFAULT_USER_AGENT
            };
            if (typeof onSuccess === "function") {
                onSuccess(JSON.stringify(detailObj));
            }
            return;
        }

        if (seen[target]) {
            nextEmbed();
            return;
        }
        seen[target] = true;

        requestTextWithHeaders(target, ref, function (embedHtml) {
            var subCandidates = extractStreamCandidates(embedHtml);
            if (subCandidates.length > 0) {
                detailObj.streamCandidates = sortAndDedupeCandidates(subCandidates.concat(candidates));
                resolveStreamFromDetail(detailObj, target, onSuccess, onError, d + 1, seen);
            } else {
                nextEmbed();
            }
        }, function () {
            nextEmbed();
        });
    }

    nextEmbed();
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlContent) {
    try {
        var html = String(htmlContent || "");
        if (!html || html.length < 50) {
            log("parseListResponse received empty or too short HTML (length=" + html.length + ")");
            return JSON.stringify({
                items: [],
                pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 }
            });
        }

        var movies = [];
        var seenIds = {};

        function cleanMovieId(rawHref) {
            var h = decodeEscapedUrl(rawHref || "")
                .replace(/^https?:\/\/[^/]+/i, "")
                .replace(/#.*$/, "")
                .replace(/\?.*$/, "")
                .replace(/^\/+/, "")
                .replace(/\/+$/, "");
            return h;
        }

        function extractImgSrc(fragment) {
            var m = /<img\b[^>]*?(?:data-src|data-lazy-src|data-original|src)\s*=\s*["']([^"']+)["'][^>]*>/i.exec(fragment || "");
            return m && m[1] ? normalizeUrl(m[1]) : "";
        }

        function extractAltOrTitle(fragment) {
            var altM = /\balt\s*=\s*["']([^"']+)["']/i.exec(fragment || "");
            if (altM && altM[1]) {
                var a = stripTags(altM[1]);
                if (a && !/^(?:quảng cáo|qc|banner|logo|no image)$/i.test(a)) return a;
            }
            var titleM = /\btitle\s*=\s*["']([^"']+)["']/i.exec(fragment || "");
            if (titleM && titleM[1]) {
                var t = stripTags(titleM[1]);
                if (t && !/^(?:quảng cáo|qc|banner|logo)$/i.test(t)) return t;
            }
            return "";
        }

        // 1. Ưu tiên khối .movie-item chuẩn
        var cardBlocks = extractBalancedDivs(html, '<div[^>]*class=["\'][^"\']*movie-item[^"\']*["\'][^>]*>');
        for (var i = 0; i < cardBlocks.length; i++) {
            var block = cardBlocks[i];
            var linkMatch = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/i.exec(block);
            if (!linkMatch) continue;

            var id = cleanMovieId(linkMatch[1]);
            if (!id || seenIds[id]) continue;

            var posterUrl = extractImgSrc(block);
            var titleMatch = /<div[^>]*class=["\'][^"\']*movie-title[^"\']*["\'][^>]*>([\s\S]*?)<\/div>/i.exec(block);
            var title = titleMatch ? stripTags(titleMatch[1]) : extractAltOrTitle(block);
            if (!title) continue;

            seenIds[id] = true;

            var labelMatch = /<div[^>]*class=["\'][^"\']*movie-label[^"\']*["\'][^>]*>([\s\S]*?)<\/div>/i.exec(block);
            var epStatusMatch = /<div[^>]*class=["\'][^"\']*movie-ep-status[^"\']*["\'][^>]*>([\s\S]*?)<\/div>/i.exec(block);
            var metaMatch = /<div[^>]*class=["\'][^"\']*movie-meta-short[^"\']*["\'][^>]*>([\s\S]*?)<\/div>/i.exec(block);

            var labelText = labelMatch ? stripTags(labelMatch[1]) : "";
            var epStatusText = epStatusMatch ? stripTags(epStatusMatch[1]) : "";
            var metaText = metaMatch ? stripTags(metaMatch[1]) : "";

            var year = 0;
            var yearMatch = /\b(19\d{2}|20\d{2})\b/.exec(metaText + " " + title);
            if (yearMatch) year = parseInt(yearMatch[1], 10) || 0;

            movies.push({
                id: id,
                title: title,
                posterUrl: posterUrl,
                backdropUrl: posterUrl,
                year: year,
                quality: labelText,
                episode_current: epStatusText,
                lang: metaText
            });
        }

        // 2. Fallback: các thẻ <a> trỏ tới /phim/... hoặc /xem/...
        if (movies.length === 0) {
            var aRegex = /<a\b[^>]*\bhref\s*=\s*["']((?:https?:\/\/[^"'\s]+)?\/(?:phim|xem)\/[^"'\s?#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            var aMatch;
            while ((aMatch = aRegex.exec(html)) !== null) {
                var aId = cleanMovieId(aMatch[1]);
                if (!aId || seenIds[aId]) continue;

                var inner = aMatch[2] || "";
                var aPoster = extractImgSrc(inner);
                var aTitle = extractAltOrTitle(inner) || extractAltOrTitle(aMatch[0]) || stripTags(inner);

                if (!aTitle || aTitle.length < 2 || /^\d+$/.test(aTitle)) continue;
                seenIds[aId] = true;

                var aYear = 0;
                var aYearMatch = /\b(19\d{2}|20\d{2})\b/.exec(aTitle);
                if (aYearMatch) aYear = parseInt(aYearMatch[1], 10) || 0;

                movies.push({
                    id: aId,
                    title: aTitle,
                    posterUrl: aPoster,
                    backdropUrl: aPoster,
                    year: aYear,
                    quality: "",
                    episode_current: "",
                    lang: ""
                });
            }
        }

        log("parseListResponse parsed items: " + movies.length);

        var totalPages = 1;
        var pagePattern = /[?&]page=(\d+)/gi;
        var pMatch;
        while ((pMatch = pagePattern.exec(html)) !== null) {
            var num = parseInt(pMatch[1], 10);
            if (num > totalPages) totalPages = num;
        }

        var currentPage = 1;
        var curMatch = /<a[^>]*class=["\'][^"\']*current[^"\']*["\'][^>]*>(\d+)<\/a>/i.exec(html) ||
            /<span[^>]*class=["\'][^"\']*current[^"\']*["\'][^>]*>(\d+)<\/span>/i.exec(html);
        if (curMatch) currentPage = parseInt(curMatch[1], 10) || 1;

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: movies.length > 0 ? Math.max(movies.length, totalPages * 20) : 0,
                itemsPerPage: 20
            }
        });
    } catch (error) {
        log("parseListResponse error: " + error);
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 }
        });
    }
}

function parseSearchResponse(htmlContent) {
    return parseListResponse(htmlContent);
}

function parseMovieDetail(htmlContent) {
    try {
        var html = String(htmlContent || "");
        if (!html || html.length < 50) {
            log("parseMovieDetail received empty or too short HTML");
            return "null";
        }

        function extractAttr(tagHtml, attrName) {
            var re = new RegExp("\\b" + attrName + "\\s*=\\s*[\"']([^\"']*)[\"']", "i");
            var m = re.exec(tagHtml || "");
            return m && m[1] ? m[1].trim() : "";
        }

        function extractEpisodeAnchors(scopeHtml) {
            var list = [];
            var seen = {};
            var aRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
            var m;
            while ((m = aRe.exec(scopeHtml || "")) !== null) {
                var attrs = m[1] || "";
                var cls = extractAttr(attrs, "class");
                if (!/(?:^|\s)ep-btn(?:\s|$)/i.test(cls) && !/ep-btn/i.test(cls)) continue;

                var href = extractAttr(attrs, "href");
                var epUrl = normalizeUrl(href);
                if (!epUrl || seen[epUrl]) continue;
                seen[epUrl] = true;

                var epLabel = stripTags(m[2] || "");
                var epName = /^Tập\b/i.test(epLabel) ? epLabel : ("Tập " + (epLabel || (list.length + 1)));
                list.push({
                    id: epUrl,
                    name: epName,
                    slug: epUrl
                });
            }
            return list;
        }

        var posterUrl = "";
        var ogImgMatch = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html) ||
            /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i.exec(html);
        if (ogImgMatch && ogImgMatch[1]) {
            posterUrl = normalizeUrl(ogImgMatch[1]);
        }

        var h1Match = /<h1[^>]*class=["'][^"']*movie-h1[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i.exec(html) ||
            /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
        var rawH1 = h1Match ? stripTags(h1Match[1]) : "";

        var h2Match = /<h2[^>]*class=["'][^"']*movie-h2[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i.exec(html) ||
            /<h2\b[^>]*>([\s\S]*?)<\/h2>/i.exec(html);
        var rawH2 = h2Match ? stripTags(h2Match[1]) : "";

        var year = 0;
        var yearMatch = /\((\d{4})\)/.exec(rawH2) || /\b(19\d{2}|20\d{2})\b/.exec(rawH2);
        if (yearMatch) {
            year = parseInt(yearMatch[1], 10) || 0;
        }

        var originalTitle = rawH2.replace(/\s*\(\d{4}\)\s*$/, "").trim();
        var title = rawH1
            .replace(/\s+TẬP\s+Tập\s+\d+.*$/i, "")
            .replace(/\s+TẬP\s+\d+.*$/i, "")
            .replace(/\s+Tập\s+\d+.*$/i, "")
            .replace(/\s+-\s+\d+\s*\[.*$/i, "")
            .replace(/\s+(?:VIETSUB|THUYẾT MINH|THUYET MINH|LỒNG TIẾNG|LONG TIENG)\s*$/i, "")
            .trim() || rawH1;

        var descMatch = /<div[^>]*class=["'][^"']*movie-desc[^"']*["'][^>]*>([\s\S]*?)<\/div>/i.exec(html);
        var description = descMatch ? stripTags(descMatch[1]) : "";

        var categories = [];
        var catPattern = /<a\b[^>]*href=["'][^"']*\/the-loai\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/gi;
        var cMatch;
        while ((cMatch = catPattern.exec(html)) !== null) {
            var cName = stripTags(cMatch[1]);
            if (cName && categories.indexOf(cName) === -1) {
                categories.push(cName);
            }
        }

        var servers = [];
        var epBlockSlices = extractBalancedDivs(html, '<div[^>]*class=["\'][^"\']*episode-block[^"\']*["\'][^>]*>');
        var epScope = epBlockSlices.length > 0 ? epBlockSlices.join("\n") : html;
        var sourceBlocks = extractBalancedDivs(epScope, '<div[^>]*class=["\'][^"\']*source-container[^"\']*["\'][^>]*>');

        for (var i = 0; i < sourceBlocks.length; i++) {
            var sBlock = sourceBlocks[i];
            var sTitleMatch = /<div[^>]*class=["'][^"']*source-title[^"']*["\'][^>]*>([\s\S]*?)<\/div>/i.exec(sBlock);
            var serverName = sTitleMatch ? stripTags(sTitleMatch[1]) : ("Server #" + (i + 1));
            var episodes = extractEpisodeAnchors(sBlock);

            if (episodes.length > 0) {
                servers.push({
                    name: serverName,
                    episodes: episodes
                });
            }
        }

        if (servers.length === 0) {
            var fallbackEps = extractEpisodeAnchors(epScope);
            if (fallbackEps.length > 0) {
                servers.push({
                    name: "Server #1",
                    episodes: fallbackEps
                });
            }
        }

        var slug = "";
        var canonMatch = /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i.exec(html) ||
            /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i.exec(html);
        if (canonMatch && canonMatch[1]) {
            slug = decodeEscapedUrl(canonMatch[1])
                .replace(/^https?:\/\/[^/]+/i, "")
                .replace(/#.*$/, "")
                .replace(/\?.*$/, "")
                .replace(/^\/+/, "")
                .replace(/\/+$/, "");
        }

        var lang = "";
        if (/thuyết minh|thuyet minh/i.test(rawH1 + " " + epScope)) lang = "Thuyết Minh";
        else if (/lồng tiếng|long tieng/i.test(rawH1 + " " + epScope)) lang = "Lồng Tiếng";
        else if (/vietsub/i.test(rawH1 + " " + epScope)) lang = "Vietsub";

        var epCurrentMatch = /<div[^>]*class=["'][^"']*breadcrumb-bar[^"']*["\'][^>]*>[\s\S]*?<span>([^<]+)<\/span>/i.exec(html);
        var episodeCurrent = epCurrentMatch ? stripTags(epCurrentMatch[1]) : rawH1;

        return JSON.stringify({
            id: slug,
            title: title,
            originalTitle: originalTitle,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            rating: 0,
            quality: "",
            servers: servers,
            episode_current: episodeCurrent,
            lang: lang,
            category: categories.join(", "),
            country: "",
            director: "",
            casts: "",
            extra: ""
        });
    } catch (error) {
        log("parseMovieDetail error: " + error);
        return "null";
    }
}

function parseDetailResponse(htmlContent, pageUrl) {
    try {
        var html = String(htmlContent || "");
        var detailJsonStr = parseMovieDetail(html);
        var detailObj = {};

        if (detailJsonStr && detailJsonStr !== "null") {
            try {
                detailObj = JSON.parse(detailJsonStr) || {};
            } catch (eParse) {
                detailObj = {};
            }
        }

        var resolvedPageUrl = pageUrl ? normalizeUrl(pageUrl) : "";
        if (!resolvedPageUrl) {
            var canonMatch = /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i.exec(html) ||
                /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i.exec(html);
            if (canonMatch && canonMatch[1]) {
                resolvedPageUrl = normalizeUrl(canonMatch[1]);
            }
        }

        var candidates = extractStreamCandidates(html);
        var primary = candidates.length > 0 ? candidates[0] : null;

        if (!detailObj.id && resolvedPageUrl) {
            detailObj.id = resolvedPageUrl.replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/+/, "");
        }
        if (!detailObj.title) detailObj.title = "";
        if (!detailObj.servers) detailObj.servers = [];

        detailObj.pageUrl = resolvedPageUrl;
        detailObj.streamUrl = primary && primary.url ? primary.url : "";
        detailObj.streamType = primary && primary.type ? primary.type : "";
        detailObj.headers = {
            "Referer": PLAYER_REFERER,
            "Origin": PLAYER_ORIGIN,
            "User-Agent": DEFAULT_USER_AGENT
        };
        detailObj.streamCandidates = candidates;

        if (!detailObj.streamUrl) {
            log("parseDetailResponse: no streamUrl found for " + (resolvedPageUrl || "unknown"));
        } else if (detailObj.streamType === "embed") {
            log("parseDetailResponse: embed candidate found (" + detailObj.streamUrl + "), resolve with resolveStreamFromDetail");
        } else {
            log("parseDetailResponse: direct stream (" + detailObj.streamType + ") -> " + detailObj.streamUrl);
        }

        return JSON.stringify(detailObj);
    } catch (error) {
        log("parseDetailResponse error: " + error);
        return "null";
    }
}
// =============================================================================
// COMPATIBILITY ALIASES
// =============================================================================

function getList(slug, filtersJson) {
    return getUrlList(slug, filtersJson);
}

function parseList(htmlContent) {
    return parseListResponse(htmlContent);
}

function getDetail(slug) {
    return getUrlDetail(slug);
}

function parseDetail(htmlContent, pageUrl) {
    return parseDetailResponse(htmlContent, pageUrl);
}
