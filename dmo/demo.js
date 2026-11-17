/**
 * ============================================================================
 * VAAPP PARSER SCRIPT CHO MISSAV - DIRECT API & ID RESOLVER MODE
 * ============================================================================
 */

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "1.2",
        "baseUrl": "https://missav.media",
        "referrer": "https://missav.media/",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/missav.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "subtitleCat": true
    });
}

// ============================================================================
// 1. URL BUILDERS
// ============================================================================

function getUrlList(page, type, category, country, year) {
    var baseUrl = "https://missav.media";
    if (category && category !== '') {
        if (category.indexOf("actor-") === 0) {
            baseUrl += "/actors/" + encodeURIComponent(category.replace("actor-", ""));
        } else {
            baseUrl += "/genres/" + encodeURIComponent(category);
        }
    } else if (type && type !== 'all' && type !== '') {
        baseUrl += "/" + type;
    } else {
        baseUrl += "/new";
    }
    if (page && page > 1) {
        baseUrl += "?page=" + page;
    }
    return baseUrl;
}

function getUrlSearch(keyword, page) {
    var url = "https://missav.media/search/" + encodeURIComponent(keyword);
    if (page && page > 1) url += "?page=" + page;
    return url;
}

function getUrlDetail(url) {
    return url;
}

function getUrlCategories() { return "https://missav.media/genres"; }
function getUrlCountries() { return "https://missav.media/actors"; }
function getUrlYears() { return "https://missav.media/"; }

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Mới Nhất", value: "new" },
        { name: "Phổ Biến", value: "popular" },
        { name: "Thịnh Hành", value: "trending" },
        { name: "Uncensored", value: "uncensored-leak" },
        { name: "Diễn Viên", value: "actors-list" }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { title: "Video Mới Cập Nhật", url: "https://missav.media/new" },
        { title: "Xem Nhiều Nhất", url: "https://missav.media/popular" },
        { title: "Thịnh Hành", url: "https://missav.media/trending" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ supportCategories: true, supportCountries: true, supportYears: false, supportTypes: true });
}

// ============================================================================
// 2. PARSE LIST RESPONSE
// ============================================================================

function parseListResponse(htmlContent) {
    try {
        var items = [];
        if (!htmlContent) return "[]";

        if (htmlContent.indexOf("/actors/") !== -1 || htmlContent.indexOf("object-cover rounded-full") !== -1) {
            var actorRegex = /<a[^>]+href=["']https?:\/\/missav\.media\/actors\/([^/"']+)\/?["'][^>]*>([\s\S]*?)<\/a>/gi;
            var matchActor;
            while ((matchActor = actorRegex.exec(htmlContent)) !== null) {
                var actorSlug = matchActor[1].trim();
                var innerHtml = matchActor[2];
                var imgMatch = /src=["']([^"']+)["']/i.exec(innerHtml);
                var avatar = imgMatch ? imgMatch[1] : "";
                if (avatar.indexOf("//") === 0) avatar = "https:" + avatar;
                var nameMatch = /<span[^>]*>([^<]+)<\/span>/i.exec(innerHtml);
                var actorName = nameMatch ? nameMatch[1].trim() : actorSlug;

                items.push({
                    title: decodeHtmlEntities(actorName),
                    url: "https://missav.media/genres/actor-" + actorSlug,
                    posterUrl: avatar,
                    subTitle: "Diễn viên"
                });
            }
            if (items.length > 0) return JSON.stringify(items);
        }

        var standardRegex = /<a[^>]+href=["'](https?:\/\/missav\.media\/[^"']+|\/[^"']+)["'][^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=["']([^"']+)["'][\s\S]*?(?:<span[^>]*>([^<]+)<\/span>)?[\s\S]*?<\/a>/gi;
        var match;
        while ((match = standardRegex.exec(htmlContent)) !== null) {
            var rawUrl = match[1];
            var poster = match[2];
            var duration = match[3] ? match[3].trim() : "";
            var url = rawUrl.indexOf("http") === 0 ? rawUrl : "https://missav.media" + rawUrl;

            if (url.indexOf("/genres") !== -1 || url.indexOf("/search") !== -1 || url.indexOf("/tags") !== -1 || url.indexOf("/actors") !== -1) {
                continue;
            }
            if (poster.indexOf("//") === 0) poster = "https:" + poster;

            var titleMatch = new RegExp('<a[^>]+href=["\']' + rawUrl.replace(/[\/\.]/g, '\\$&') + '["\'][^>]*title=["\']([^\'"]+)["\']', 'i').exec(htmlContent);
            var title = titleMatch ? titleMatch[1] : "Video MissAV";

            var exists = items.some(function(i) { return i.url === url; });
            if (!exists && url.length > 20) {
                items.push({
                    title: decodeHtmlEntities(title.trim()),
                    url: url,
                    posterUrl: poster,
                    subTitle: duration
                });
            }
        }
        return JSON.stringify(items);
    } catch (e) {
        return "[]";
    }
}

// ============================================================================
// 3. PARSE DETAIL RESPONSE (GIẢI PHÁP THAY THẾ TRỰC TIẾP)
// ============================================================================

function parseDetailResponse(htmlContent, pageUrl) {
    try {
        if (!htmlContent) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
        }

        // 1. Quét tìm kiếm trực tiếp các biến chứa m3u8 trong thẻ script của trang chi tiết
        var m3u8Regex = /https?:\/\/[^"'\s<>]+\.m3u8(?:\?[^"'\s<>]*)?/gi;
        var match;
        var bestUrl = "";

        while ((match = m3u8Regex.exec(htmlContent)) !== null) {
            var found = match[0].replace(/\\\//g, "/");
            // Lọc ưu tiên link stream chính hãng
            if (found.indexOf("playlist.m3u8") !== -1 || found.indexOf("index.m3u8") !== -1 || found.indexOf("master.m3u8") !== -1) {
                bestUrl = found;
                break;
            } else if (!bestUrl) {
                bestUrl = found;
            }
        }

        if (bestUrl) {
            return JSON.stringify({
                url: bestUrl,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Referer": pageUrl || "https://missav.media/"
                },
                subtitles: []
            });
        }

        // 2. Nếu không tìm thấy bằng m3u8, thử tìm kiếm chuỗi mã hóa hls/video source dạng JSON trong script
        var sourceDataRegex = /sources\s*:\s*(\{[\s\S]*?\})|file\s*:\s*["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i.exec(htmlContent);
        if (sourceDataRegex && sourceDataRegex[2]) {
            return JSON.stringify({
                url: sourceDataRegex[2].replace(/\\\//g, "/"),
                isEmbed: false,
                mimeType: "video/mp4",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": pageUrl
                },
                subtitles: []
            });
        }

        // 3. Phương án cuối cùng: Trả về một đối tượng phản hồi rỗng thay vì báo lỗi chết ứng dụng, 
        // giúp VAAPP tự động chuyển sang cơ chế xử lý dự phòng của app.
        return JSON.stringify({
            url: "",
            isEmbed: false,
            headers: {},
            subtitles: []
        });

    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(htmlContent, url) {
    return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
}

// ============================================================================
// 4. PARSER CATEGORIES & UTILS
// ============================================================================

function parseCategoriesResponse(htmlContent) {
    try {
        var categories = [];
        var catRegex = /<a[^>]+href=["']https?:\/\/missav\.media\/genres\/([^/"']+)\/?["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;
        while ((match = catRegex.exec(htmlContent)) !== null) {
            var slug = match[1].trim();
            var rawName = match[2].replace(/<[^>]+>/g, "").trim();
            var exists = categories.some(function(c) { return c.value === slug; });
            if (!exists && rawName) {
                categories.push({ name: decodeHtmlEntities(rawName), value: slug });
            }
        }
        return JSON.stringify(categories);
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(htmlContent) {
    try {
        var actors = [];
        var actorRegex = /<a[^>]+href=["']https?:\/\/missav\.media\/actors\/([^/"']+)\/?["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;
        while ((match = actorRegex.exec(htmlContent)) !== null) {
            var slug = match[1].trim();
            var rawName = match[2].replace(/<[^>]+>/g, "").trim();
            var exists = actors.some(function(a) { return a.value === "actor-" + slug; });
            if (!exists && rawName) {
                actors.push({ name: decodeHtmlEntities(rawName), value: "actor-" + slug });
            }
        }
        return JSON.stringify(actors);
    } catch (e) {
        return "[]";
    }
}

function parseYearsResponse(htmlContent) { return "[]"; }

function decodeHtmlEntities(str) {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}
