// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://tvhay.buzz";

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHay",
        "version": "1.2.1",
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

function normalizeUrl(url) {
    if (!url) return "";
    url = String(url).trim().replace(/^http:\/\//i, "https://");
    if (/^https?:\/\//i.test(url)) return url;
    if (url.indexOf("//") === 0) return "https:" + url;
    return BASE_URL + (url.indexOf("/") === 0 ? "" : "/") + url;
}

function stripTags(html) {
    if (!html) return "";
    return String(html)
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#039;/gi, "'")
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
    return /(?:trafficstars|doubleclick|googlesyndication|googletagmanager|google-analytics|cloudflareinsights|bit\.ly|shortlink|omg10\.com|t\.co\/|154\.82\.109\.164|choitic88|c168n\.biz|blogger\.googleusercontent\.com|iili\.io|ibb\.co)/i.test(url || "");
}

function extractStreamCandidates(htmlContent) {
    var candidates = [];

    var varLinkRegex = /\b(linkHPro|linkSPro|embedUrl|streamUrl|videoUrl)\s*=\s*["']([^"']+)["']/gi;
    var vMatch;
    while ((vMatch = varLinkRegex.exec(htmlContent)) !== null) {
        var vName = vMatch[1];
        var vUrl = normalizeUrl(vMatch[2]);
        if (vUrl && !isAdOrTrackerUrl(vUrl)) {
            candidates.push({
                url: vUrl,
                type: /\.m3u8/i.test(vUrl) ? "hls" : (/\.mp4/i.test(vUrl) ? "mp4" : "embed"),
                server: vName
            });
        }
    }

    var iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
    var iMatch;
    while ((iMatch = iframeRegex.exec(htmlContent)) !== null) {
        var iUrl = normalizeUrl(iMatch[1]);
        if (iUrl && !isAdOrTrackerUrl(iUrl)) {
            candidates.push({
                url: iUrl,
                type: /\.m3u8/i.test(iUrl) ? "hls" : (/\.mp4/i.test(iUrl) ? "mp4" : "embed"),
                server: "Iframe"
            });
        }
    }

    var mediaRegex = /(https?:\/\/[^\s"'<>\\]+\.(?:m3u8|mp4)(?:[^\s"'<>\\]*)?)/gi;
    var mMatch;
    while ((mMatch = mediaRegex.exec(htmlContent)) !== null) {
        var mUrl = mMatch[1].replace(/\\\//g, "/");
        if (mUrl && !isAdOrTrackerUrl(mUrl) && mUrl.indexOf("1s_blank.mp4") === -1) {
            candidates.push({
                url: mUrl,
                type: /\.m3u8/i.test(mUrl) ? "hls" : "mp4",
                server: "Direct"
            });
        }
    }

    var b64Regex = /(?:atob\(|base64,|data-link=|data-url=|source\s*[:=]\s*)["']([A-Za-z0-9+/=]{24,})["']/gi;
    var bMatch;
    while ((bMatch = b64Regex.exec(htmlContent)) !== null) {
        var decoded = decodeBase64(bMatch[1]).trim();
        if (/^(https?:\/\/|\/)/i.test(decoded)) {
            var decNorm = normalizeUrl(decoded);
            if (!isAdOrTrackerUrl(decNorm)) {
                candidates.push({
                    url: decNorm,
                    type: /\.m3u8/i.test(decNorm) ? "hls" : (/\.mp4/i.test(decNorm) ? "mp4" : "embed"),
                    server: "Decoded"
                });
            }
        }
    }

    var seen = {};
    return candidates.filter(function (item) {
        if (!item.url || seen[item.url]) return false;
        seen[item.url] = true;
        return true;
    });
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlContent) {
    try {
        var html = String(htmlContent || "");
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

        // Fallback rộng nếu trang dùng cấu trúc thẻ khác
        if (movies.length === 0) {
            var aRegex = /<a[^>]+href="(\/(?:phim|xem)\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            var aMatch;
            while ((aMatch = aRegex.exec(html)) !== null) {
                var aHref = aMatch[1].trim();
                var aId = aHref.replace(/^\/+/, "");
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

        detailObj.pageUrl = pageUrl || "";
        detailObj.streamUrl = primary ? primary.url : "";
        detailObj.streamType = primary ? primary.type : "";
        detailObj.headers = {
            "Referer": BASE_URL + "/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        };
        detailObj.streamCandidates = candidates;

        return JSON.stringify(detailObj);
    } catch (error) {
        log("parseDetailResponse error: " + error);
        return "null";
    }
}
