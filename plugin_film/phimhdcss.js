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
        "version": "1.2.4",
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
    return String(html)
        .replace(/<[^>]*>/g, " ")
        .replace(/ /gi, " ")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/'/gi, "'")
        .replace(/</gi, "<")
        .replace(/>/gi, ">")
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
        var filters = JSON.parse(filtersJson || "{}");
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
            return BASE_URL + "/?" + params.join("&");
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

        return BASE_URL + path + (page > 1 ? "?page=" + page : "");
    } catch (e) {
        return BASE_URL + "/phim-moi";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
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

    if (candidate.server === "Direct" || candidate.server === "Unwrapped") score -= 1;
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
    if (embedList.length === 0 && detailObj.streamUrl && /\.(?:php|html?)/i.test(detailObj.streamUrl)) {
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
            return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 } });
        }

        var movies = [];
        var seenIds = {};

        var cardBlocks = extractBalancedDivs(html, '<div[^>]*class="[^"]*movie-item[^"]*"[^>]*>');
        for (var i = 0; i < cardBlocks.length; i++) {
            var block = cardBlocks[i];
            var linkMatch = /<a[^>]+href="([^"]+)"[^>]*>/i.exec(block);
            if (!linkMatch) continue;

            var href = linkMatch[1].trim();
            var id = href.replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/+/, "");
            if (!id || seenIds[id]) continue;
            seenIds[id] = true;

            var imgMatch = /<img[^>]+(?:data-src|data-lazy-src|src)="([^"]+)"[^>]*>/i.exec(block);
            var posterUrl = imgMatch ? normalizeUrl(imgMatch[1]) : "";

            var titleMatch = /<div[^>]*class="[^"]*movie-title[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(block);
            var altMatch = /alt="([^"]+)"/i.exec(block);
            var title = titleMatch ? stripTags(titleMatch[1]) : (altMatch ? stripTags(altMatch[1]) : "");
            if (!title) continue;

            var labelMatch = /<div[^>]*class="[^"]*movie-label[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(block);
            var epStatusMatch = /<div[^>]*class="[^"]*movie-ep-status[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(block);
            var metaMatch = /<div[^>]*class="[^"]*movie-meta-short[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(block);

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

        // Fallback 1: thẻ <a> có đường dẫn /phim/ hoặc /xem/
        if (movies.length === 0) {
            var aRegex = /<a[^>]+href="((?:https?:\/\/[^"'\s]+)?\/(?:phim|xem)\/[^"'\s]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            var aMatch;
            while ((aMatch = aRegex.exec(html)) !== null) {
                var aHref = aMatch[1].trim();
                var aId = aHref.replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/+/, "");
                if (!aId || seenIds[aId]) continue;

                var inner = aMatch[2];
                var aImg = /<img[^>]+(?:data-src|data-lazy-src|src)="([^"]+)"[^>]*>/i.exec(inner);
                var aPoster = aImg ? normalizeUrl(aImg[1]) : "";
                var aAlt = /alt="([^"]+)"/i.exec(inner) || /title="([^"]+)"/i.exec(aMatch[0]);
                var aTitle = aAlt ? stripTags(aAlt[1]) : stripTags(inner);

                if (!aTitle || aTitle.length < 2 || /^\d+$/.test(aTitle)) continue;
                seenIds[aId] = true;

                movies.push({
                    id: aId,
                    title: aTitle,
                    posterUrl: aPoster,
                    backdropUrl: aPoster,
                    year: 0,
                    quality: "",
                    episode_current: "",
                    lang: ""
                });
            }
        }

        // Fallback 2: thẻ <a> nội bộ chứa ảnh poster nếu trang dùng slug trực tiếp
        if (movies.length === 0) {
            var anyCardRegex = /<a[^>]+href="((?:https?:\/\/tvhay\.buzz)?\/[^"'\s?#]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            var anyMatch;
            while ((anyMatch = anyCardRegex.exec(html)) !== null) {
                var anyHref = anyMatch[1].trim();
                var anyId = anyHref.replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/+/, "");
                if (!anyId || seenIds[anyId]) continue;
                if (/^(?:phim-moi|phim-bo|phim-le|short-drama|the-loai|quoc-gia|nam|index\.php|login|register|search)/i.test(anyId)) continue;

                var anyInner = anyMatch[2];
                var anyImg = /<img[^>]+(?:data-src|data-lazy-src|src)="([^"]+)"[^>]*>/i.exec(anyInner);
                if (!anyImg) continue;

                var anyAlt = /alt="([^"]+)"/i.exec(anyImg[0]) || /title="([^"]+)"/i.exec(anyMatch[0]);
                var anyTitle = anyAlt ? stripTags(anyAlt[1]) : stripTags(anyInner);
                if (!anyTitle || anyTitle.length < 2) continue;

                seenIds[anyId] = true;
                var anyPoster = normalizeUrl(anyImg[1]);
                movies.push({
                    id: anyId,
                    title: anyTitle,
                    posterUrl: anyPoster,
                    backdropUrl: anyPoster,
                    year: 0,
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
        var curMatch = /<a[^>]*class="[^"]*current[^"]*"[^>]*>(\d+)<\/a>/i.exec(html) || /<span[^>]*class="[^"]*current[^"]*"[^>]*>(\d+)<\/span>/i.exec(html);
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
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 } });
    }
}

function parseSearchResponse(htmlContent) {
    return parseListResponse(htmlContent);
}

function parseMovieDetail(htmlContent) {
    try {
        var html = String(htmlContent || "");
        var posterUrl = "";
        var ogImgMatch = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i.exec(html);
        if (ogImgMatch) posterUrl = normalizeUrl(ogImgMatch[1]);

        var h1Match = /<h1[^>]*class="[^"]*movie-h1[^"]*"[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
        if (!h1Match) h1Match = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
        var rawH1 = h1Match ? stripTags(h1Match[1]) : "";

        var h2Match = /<h2[^>]*class="[^"]*movie-h2[^"]*"[^>]*>([\s\S]*?)<\/h2>/i.exec(html);
        var rawH2 = h2Match ? stripTags(h2Match[1]) : "";

        var year = 0;
        var yearMatch = /\((\d{4})\)/.exec(rawH2) || /\b(19\d{2}|20\d{2})\b/.exec(rawH2);
        if (yearMatch) year = parseInt(yearMatch[1], 10) || 0;

        var originalTitle = rawH2.replace(/\s*\(\d{4}\)\s*$/, "").trim();
        var title = rawH1
            .replace(/\s+TẬP\s+\d+.*$/i, "")
            .replace(/\s+-\s+\d+\s*\[.*$/i, "")
            .trim() || rawH1;

        var descMatch = /<div[^>]*class="[^"]*movie-desc[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(html);
        var description = descMatch ? stripTags(descMatch[1]) : "";

        var categories = [];
        var catPattern = /<a[^>]+href="[^"]*\/the-loai\/[^"]+"[^>]*>([\s\S]*?)<\/a>/gi;
        var cMatch;
        while ((cMatch = catPattern.exec(html)) !== null) {
            var cName = stripTags(cMatch[1]);
            if (cName && categories.indexOf(cName) === -1) categories.push(cName);
        }

        var servers = [];
        var sourceBlocks = extractBalancedDivs(html, '<div[^>]*class="[^"]*source-container[^"]*"[^>]*>');
        for (var i = 0; i < sourceBlocks.length; i++) {
            var sBlock = sourceBlocks[i];
            var sTitleMatch = /<div[^>]*class="[^"]*source-title[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(sBlock);
            var serverName = sTitleMatch ? stripTags(sTitleMatch[1]) : ("Server #" + (i + 1));

            var episodes = [];
            var epPattern = /<a[^>]+href="([^"]+)"[^>]*class="[^"]*ep-btn[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
            var epMatch;
            while ((epMatch = epPattern.exec(sBlock)) !== null) {
                var epUrl = normalizeUrl(epMatch[1]);
                var epLabel = stripTags(epMatch[2]);
                var epName = /^Tập\b/i.test(epLabel) ? epLabel : ("Tập " + epLabel);
                episodes.push({
                    id: epUrl,
                    name: epName,
                    slug: epUrl
                });
            }

            if (episodes.length > 0) {
                servers.push({
                    name: serverName,
                    episodes: episodes
                });
            }
        }

        if (servers.length === 0) {
            var fallbackEps = [];
            var fbPattern = /<a[^>]+href="([^"]+)"[^>]*class="[^"]*ep-btn[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
            var fbMatch;
            while ((fbMatch = fbPattern.exec(html)) !== null) {
                var fbUrl = normalizeUrl(fbMatch[1]);
                var fbLabel = stripTags(fbMatch[2]);
                fallbackEps.push({
                    id: fbUrl,
                    name: /^Tập\b/i.test(fbLabel) ? fbLabel : ("Tập " + fbLabel),
                    slug: fbUrl
                });
            }
            if (fallbackEps.length > 0) {
                servers.push({
                    name: "Lồng Tiếng #1",
                    episodes: fallbackEps
                });
            }
        }

        var slug = "";
        var canonMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html);
        if (canonMatch) {
            slug = canonMatch[1].replace(/^https?:\/\/[^/]+\//i, "").replace(/^\/+/, "");
        }

        var lang = "";
        if (/thuyết minh/i.test(rawH1)) lang = "Thuyết Minh";
        else if (/lồng tiếng/i.test(rawH1)) lang = "Lồng Tiếng";
        else if (/vietsub/i.test(rawH1)) lang = "Vietsub";

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
            episode_current: rawH1,
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
        var detailJsonStr = parseMovieDetail(htmlContent);
        var detailObj = (detailJsonStr && detailJsonStr !== "null") ? JSON.parse(detailJsonStr) : {};
        var candidates = extractStreamCandidates(htmlContent);
        var primary = candidates.length > 0 ? candidates[0] : null;
        var refererUrl = pageUrl ? normalizeUrl(pageUrl) : PLAYER_REFERER;

        detailObj.pageUrl = pageUrl || "";
        detailObj.streamUrl = primary ? primary.url : "";
        detailObj.streamType = primary ? primary.type : "";
        detailObj.headers = {
            "Referer": PLAYER_REFERER,
            "Origin": PLAYER_ORIGIN,
            "User-Agent": DEFAULT_USER_AGENT
        };
        detailObj.streamCandidates = candidates;

        if (!detailObj.streamUrl && refererUrl) {
            log("No direct stream found in HTML; call resolveStreamFromDetail for " + refererUrl);
        }

        return JSON.stringify(detailObj);
    } catch (error) {
        log("parseDetailResponse error: " + error);
        return "null";
    }
}
