var BASE_URL = "https://phimhdcss.com";

function getManifest() {
    return {
        id: "phimhdcss",
        name: "PhimHDC",
        version: "1.1.0",
        baseUrl: BASE_URL,
        icon: BASE_URL + "/favicon.ico",
        description: "Plugin xem phim HD Vietsub, Thuyết Minh từ PhimHDC (ES5 - Fixed)",
        language: "vi",
        supportSearch: true,
        supportFilter: true
    };
}

function getHomeSections() {
    return [
        { id: "phim-de-cu", title: "Phim Đề Cử", url: BASE_URL + "/", type: "slider" },
        { id: "phim-chieu-rap", title: "Phim Chiếu Rạp", url: BASE_URL + "/danh-sach/phim-chieu-rap", type: "grid" },
        { id: "phim-bo", title: "Phim Bộ Mới", url: BASE_URL + "/danh-sach/phim-bo", type: "grid" },
        { id: "phim-le", title: "Phim Lẻ Mới", url: BASE_URL + "/danh-sach/phim-le", type: "grid" },
        { id: "hoat-hinh", title: "Hoạt Hình", url: BASE_URL + "/the-loai/hoat-hinh", type: "grid" }
    ];
}

function getPrimaryCategories() {
    return [
        { id: "phim-bo", name: "Phim Bộ", url: BASE_URL + "/danh-sach/phim-bo" },
        { id: "phim-le", name: "Phim Lẻ", url: BASE_URL + "/danh-sach/phim-le" },
        { id: "phim-chieu-rap", name: "Chiếu Rạp", url: BASE_URL + "/danh-sach/phim-chieu-rap" },
        { id: "hoat-hinh", name: "Hoạt Hình", url: BASE_URL + "/the-loai/hoat-hinh" }
    ];
}

function getFilterConfig() {
    return {
        searchUrl: BASE_URL + "/tim-kiem?keyword={keyword}&page={page}",
        categoryUrl: BASE_URL + "/{type}/{slug}?page={page}",
        filters: [
            {
                key: "the-loai",
                label: "Thể loại",
                options: [
                    { label: "Tất cả", value: "" },
                    { label: "Hành động", value: "hanh-dong" },
                    { label: "Tình cảm", value: "tinh-cam" },
                    { label: "Hài hước", value: "hai-huoc" },
                    { label: "Kinh dị", value: "kinh-di" },
                    { label: "Hoạt hình", value: "hoat-hinh" }
                ]
            }
        ]
    };
}

// --- HÀM HỖ TRỢ XỬ LÝ CHUỖI & URL (ES5) ---

function normalizeUrl(url) {
    if (!url) return "";
    url = url.replace(/\\\//g, "/").trim();
    if (url.indexOf("//") === 0) {
        return "https:" + url;
    }
    if (url.indexOf("/") === 0) {
        return BASE_URL + url;
    }
    return url;
}

function cleanHtmlText(str) {
    if (!str) return "";
    return str
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

// --- PARSE DANH SÁCH PHIM (ĐÃ TỐI ƯU REGEX CHỐNG LỖI RỖNG) ---

function parseListResponse(html) {
    var items = [];
    var seenUrls = {};
    if (!html) return items;

    // Quét linh hoạt các thẻ item phim (thường nằm trong thẻ a hoặc article)
    var linkRegex = /<a[^>]+href=["']([^"']*\/(?:phim|thong-tin-phim)\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = linkRegex.exec(html)) !== null) {
        var href = normalizeUrl(match[1]);
        var innerHtml = match[2];

        var cleanSlugUrl = href.replace(/\/tap-[^\/]+.*$/, "").replace(/\/xem-phim.*$/, "");
        if (seenUrls[cleanSlugUrl]) continue;

        // Bắt mọi định dạng ảnh thumbnail (src, data-src, data-original, srcset)
        var imgMatch = innerHtml.match(/<img[^>]+(?:data-src|data-original|src)=["']([^"']+)["']/i);
        if (!imgMatch) continue;

        var poster = normalizeUrl(imgMatch[1]);
        if (poster.indexOf("data:image") === 0) {
            var lazyMatch = innerHtml.match(/data-src=["']([^"']+)["']/i);
            if (lazyMatch) poster = normalizeUrl(lazyMatch[1]);
        }

        var title = "";
        var titleAttrMatch = match[0].match(/title=["']([^"']+)["']/i);
        var altAttrMatch = innerHtml.match(/alt=["']([^"']+)["']/i);

        if (titleAttrMatch && titleAttrMatch[1]) {
            title = cleanHtmlText(titleAttrMatch[1]);
        } else if (altAttrMatch && altAttrMatch[1]) {
            title = cleanHtmlText(altAttrMatch[1]);
        } else {
            // Lấy text trong thẻ h3, h4 hoặc span nếu có
            var headingMatch = innerHtml.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
            title = headingMatch ? cleanHtmlText(headingMatch[1]) : cleanHtmlText(innerHtml);
        }

        if (!title || title.length < 2) continue;

        var badge = "";
        var badgeMatch = innerHtml.match(/<(?:span|div|label)[^>]*class=["'][^"']*(?:badge|episode|status|label|quality|tag)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div|label)>/i);
        if (badgeMatch) {
            badge = cleanHtmlText(badgeMatch[1]);
        }

        seenUrls[cleanSlugUrl] = true;
        items.push({
            id: cleanSlugUrl,
            title: title,
            url: cleanSlugUrl,
            poster: poster,
            badge: badge
        });
    }

    return items;
}

// --- PARSE CHI TIẾT PHIM & DANH SÁCH TẬP ---

function parseDetailResponse(html, pageUrl) {
    var result = {
        id: pageUrl || "",
        title: "",
        originalTitle: "",
        poster: "",
        banner: "",
        description: "",
        servers: []
    };

    if (!html) return result;

    var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
        result.title = cleanHtmlText(h1Match[1]);
    } else {
        var ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
        if (ogTitle) result.title = cleanHtmlText(ogTitle[1]);
    }

    var ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImage) {
        result.poster = normalizeUrl(ogImage[1]);
        result.banner = result.poster;
    }

    var descMatch = html.match(/<(?:div|p)[^>]*class=["'][^"']*(?:description|content|film-content|entry-content|summary)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p)>/i);
    if (descMatch) {
        result.description = cleanHtmlText(descMatch[1]);
    }

    var episodes = [];
    var seenEpUrls = {};
    
    // Quét link tập phim linh hoạt hơn
    var epRegex = /<a[^>]+href=["']([^"']*(?:\/tap-|\/xem-phim|\?tap=|\/episode\/)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var epMatch;

    while ((epMatch = epRegex.exec(html)) !== null) {
        var epUrl = normalizeUrl(epMatch[1]);
        var epName = cleanHtmlText(epMatch[2]);

        if (!epName || epName.length > 50) continue;
        if (epName.toLowerCase().indexOf("xem phim") !== -1 || epName.toLowerCase() === "play") {
            epName = "Tập Full";
        }

        if (!seenEpUrls[epUrl]) {
            seenEpUrls[epUrl] = true;
            episodes.push({
                id: epUrl,
                name: epName,
                url: epUrl
            });
        }
    }

    if (episodes.length === 0) {
        var watchBtn = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>\s*(?:Xem\s*Phim|Xem\s*Ngay|Play|Thưởng thức)\s*<\/a>/i);
        if (watchBtn) {
            var watchUrl = normalizeUrl(watchBtn[1]);
            episodes.push({
                id: watchUrl,
                name: "Full",
                url: watchUrl
            });
        }
    }

    if (episodes.length > 0) {
        result.servers.push({
            name: "Server Chính (Vietsub)",
            episodes: episodes
        });
    }

    return result;
}

// --- GIẢI MÃ EVAL PACKER CHUẨN ES5 ---

function unpackEvalScripts(html) {
    var unpackedAll = "";
    var packerRegex = /eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]*?\}\('([^']+)',\s*(\d+),\s*(\d+),\s*'([^']+)'\.split\('\|'\)/g;
    var match;

    while ((match = packerRegex.exec(html)) !== null) {
        var p = match[1];
        var a = parseInt(match[2], 10);
        var c = parseInt(match[3], 10);
        var k = match[4].split("|");

        var encodeBase = function(num, radix) {
            var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var res = "";
            if (num === 0) return "0";
            while (num > 0) {
                res = chars.charAt(num % radix) + res;
                num = Math.floor(num / radix);
            }
            return res;
        };

        while (c--) {
            if (k[c]) {
                var token = encodeBase(c, a);
                var tokenRegex = new RegExp("\\b" + token + "\\b", "g");
                p = p.replace(tokenRegex, k[c]);
            }
        }
        unpackedAll += "\n" + p;
    }

    return unpackedAll;
}

// --- BÓC TÁCH LINK STREAM (.M3U8 / MP4) ĐA TẦNG CẢI TIẾN ---

function parseStreamResponse(html, episodeUrl) {
    var streams = [];
    if (!html) return streams;

    var unpacked = unpackEvalScripts(html);
    var combinedSource = html + "\n" + unpacked;
    var normalizedSource = combinedSource.replace(/\\\//g, "/");

    var foundUrls = {};

    // 1. Quét trực tiếp các đuôi .m3u8 hoặc .mp4 phổ biến
    var mediaRegex = /(https?:\/\/[^\s"'<>\\]+?\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/gi;
    var mediaMatch;

    while ((mediaMatch = mediaRegex.exec(normalizedSource)) !== null) {
        var streamUrl = mediaMatch[1];
        if (!foundUrls[streamUrl]) {
            foundUrls[streamUrl] = true;
            streams.push({
                url: streamUrl,
                type: streamUrl.indexOf(".mp4") !== -1 ? "mp4" : "hls",
                quality: "Auto / HD",
                headers: {
                    "Referer": BASE_URL + "/",
                    "Origin": BASE_URL,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            });
        }
    }

    if (streams.length > 0) return streams;

    // 2. Quét các biến cấu hình stream phổ biến trong Javascript (file:, link:, url:)
    var jsConfigRegex = /(?:file|source|link|streamUrl|videoUrl|hls)\s*[:=]\s*["'](https?:\/\/[^"']+)["']/gi;
    var cfgMatch;
    while ((cfgMatch = jsConfigRegex.exec(normalizedSource)) !== null) {
        var val = cfgMatch[1];
        if (!foundUrls[val] && (val.indexOf(".m3u8") !== -1 || val.indexOf(".mp4") !== -1)) {
            foundUrls[val] = true;
            streams.push({
                url: val,
                type: val.indexOf(".mp4") !== -1 ? "mp4" : "hls",
                quality: "HD",
                headers: { "Referer": BASE_URL + "/" }
            });
        }
    }

    return streams;
}
