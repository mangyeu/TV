// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://tvhay.buzz";

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHay",
        "version": "1.2.0",
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
            { name: 'Anh', value: 'anh' },
            { name: 'Ba Lan', value: 'ba-lan' },
            { name: 'Brazil', value: 'brazil' },
            { name: 'Bồ Đào Nha', value: 'bo-dao-nha' },
            { name: 'Canada', value: 'canada' },
            { name: 'Châu Phi', value: 'chau-phi' },
            { name: 'Hà Lan', value: 'ha-lan' },
            { name: 'Hàn Quốc', value: 'han-quoc' },
            { name: 'Hồng Kông', value: 'hong-kong' },
            { name: 'Indonesia', value: 'indonesia' },
            { name: 'Malaysia', value: 'malaysia' },
            { name: 'Mexico', value: 'mexico' },
            { name: 'Na Uy', value: 'na-uy' },
            { name: 'Nam Phi', value: 'nam-phi' },
            { name: 'Nga', value: 'nga' },
            { name: 'Nhật Bản', value: 'nhat-ban' },
            { name: 'Philippines', value: 'philippines' },
            { name: 'Pháp', value: 'phap' },
            { name: 'Quốc Gia Khác', value: 'quoc-gia-khac' },
            { name: 'Thái Lan', value: 'thai-lan' },
            { name: 'Thổ Nhĩ Kỳ', value: 'tho-nhi-ky' },
            { name: 'Thụy Sĩ', value: 'thuy-si' },
            { name: 'Thụy Điển', value: 'thuy-dien' },
            { name: 'Trung Quốc', value: 'trung-quoc' },
            { name: 'Tây Ban Nha', value: 'tay-ban-nha' },
            { name: 'UAE', value: 'uae' },
            { name: 'Ukraina', value: 'ukraina' },
            { name: 'Việt Nam', value: 'viet-nam' },
            { name: 'Âu Mỹ', value: 'au-my' },
            { name: 'Úc', value: 'uc' },
            { name: 'Ý', value: 'y' },
            { name: 'Đan Mạch', value: 'dan-mach' },
            { name: 'Đài Loan', value: 'dai-loan' },
            { name: 'Đức', value: 'duc' },
            { name: 'Ả Rập Xê Út', value: 'a-rap-xe-ut' },
            { name: 'Ấn Độ', value: 'an-do' }
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

        var path = "";
        if (slug === 'phim-moi' || slug === 'phim-bo' || slug === 'phim-le' || slug === 'short-drama') {
            path = "/" + slug;
        } else {
            path = "/the-loai/" + slug;
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
    var path = slug.indexOf("/") === 0 ? slug.substring(1) : slug;
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

    // 1. Biến linkHPro / linkSPro trong script trang xem phim
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

    // 2. Thẻ iframe#movie-iframe hoặc iframe trong player-frame
    var iframeRegex = /<iframe[^>]+src=["']([^
