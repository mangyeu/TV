// ==========================================
// A. NHÓM CONFIG & METADATA
// ==========================================

function getManifest() {
    return JSON.stringify({
        "id": "motchillv_org",
        "name": "Motchill (motchillv.org)",
        "version": "1.0.0",
        "baseUrl": https://motchillv.org,
        "isEnabled": true,
        "isAdult": false,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL"
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-moi", title: "Phim Mới Cập Nhật", type: "LIST", path: "/phim-moi" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp Mới", type: "LIST", path: "/phim-chieu-rap" },
        { slug: "phim-bo", title: "Phim Bộ Mới", type: "LIST", path: "/phim-bo" },
        { slug: "phim-le", title: "Phim Lẻ Mới", type: "LIST", path: "/phim-le" },
        { slug: "the-loai/hoat-hinh", title: "Phim Hoạt Hình", type: "LIST", path: "/the-loai/hoat-hinh" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "LIST", path: "/phim-thuyet-minh" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { slug: "phim-moi", name: "Phim Mới" },
        { slug: "phim-bo", name: "Phim Bộ" },
        { slug: "phim-le", name: "Phim Lẻ" },
        { slug: "phim-thuyet-minh", name: "Thuyết Minh" },
        { slug: "phim-chieu-rap", name: "Chiếu Rạp" },
        { slug: "the-loai/hanh-dong", name: "Hành Động" },
        { slug: "the-loai/tinh-cam", name: "Tình Cảm" },
        { slug: "the-loai/co-trang", name: "Cổ Trang" },
        { slug: "the-loai/kinh-di", name: "Kinh Dị" },
        { slug: "the-loai/hoat-hinh", name: "Hoạt Hình" },
        { slug: "quoc-gia/han-quoc", name: "Hàn Quốc" },
        { slug: "quoc-gia/trung-quoc", name: "Trung Quốc" },
        { slug: "quoc-gia/au-my", name: "Âu Mỹ" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { label: "Mới cập nhật", value: "update" },
            { label: "Lượt xem nhiều", value: "view" },
            { label: "Năm phát hành", value: "year" }
        ]
    });
}

// ==========================================
// B. NHÓM SINH ĐƯỜNG DẪN URL
// ==========================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseSlug = slug || 'phim-moi';
    var path = filters.path || 'list';

    // Nếu filter có category thì dùng category, ghi đè slug
    if (filters.category) {
        baseSlug = filters.category;
    }

    // Nếu slug đã chứa prefix thì không cần thêm path
    var url = "https://motchillv.org/";
    if (baseSlug.indexOf('/') > -1) {
        url += baseSlug;
    } else {
        url += path + "/" + baseSlug;
    }

    if (page > 1) {
        url += "/page-" + page;
    }
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return "https://motchillv.org/tim-kiem/" + encodeURIComponent(keyword).replace(/%20/g, '+');
}

function getUrlDetail(slug) {
    if (!slug) return "https://motchillv.org/";
    if (slug.indexOf("http") === 0) return slug;

    // Xử lý slug bị lỗi do app gộp (nếu có /xem/ hoặc /info/ bên trong)
    if (slug.indexOf("/xem/") > -1 || slug.indexOf("/info/") > -1) {
        return "https://motchillv.org" + (slug.indexOf("/") === 0 ? "" : "/") + slug;
    }

    // PhimMoiChill dùng /info/ cho trang chi tiết
    return "https://motchillv.org/info/" + slug.replace(".html", "");
}

function getUrlCategories() { return "https://motchillv.org/"; }
function getUrlCountries() { return "https://motchillv.org/"; }
function getUrlYears() { return "https://motchillv.org/"; }

// ==========================================
// C. NHÓM PHÂN TÍCH DỮ LIỆU HTML (PARSERS)
// ==========================================

function parseListResponse(html) {
    var items = [];
    try {
        // Bóc tách thẻ <a> bao quanh thẻ phim (thường có chứa thẻ <h4> tên phim và thẻ <img> poster)
        var cardRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;
        var seen = {};

        while ((match = cardRegex.exec(html)) !== null) {
            var href = match;
            var innerHtml = match;

            // Bỏ qua các link điều hướng menu hoặc link đã duyệt
            if (seen[href] || href === "/" || href.includes("/the-loai/") || href.includes("/quoc-gia/")) {
                continue;
            }

            // Lấy ảnh poster từ data-src, data-original hoặc src
            var imgMatch = innerHtml.match(/<img[^>]+(?:data-src|data-original|src)=["']([^"']+)["']/i);
            if (!imgMatch) continue;
            var posterUrl = imgMatch;
            if (posterUrl.startsWith("/")) posterUrl = https://motchillv.org + posterUrl;

            // Lấy tiêu đề phim từ thẻ <h4> (đặc trưng của Motchill) hoặc thuộc tính title/alt
            var title = "";
            var h4Match = innerHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
            var h3Match = innerHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
            var altMatch = innerHtml.match(/alt=["']([^"']+)["']/i);

            if (h4Match) {
                title = h4Match.replace(/<[^>]+>/g, "").trim();
            } else if (h3Match) {
                title = h3Match.replace(/<[^>]+>/g, "").trim();
            } else if (altMatch) {
                title = altMatch.trim();
            }

            if (title && posterUrl) {
                seen[href] = true;
                items.push({
                    id: href,
                    title: title,
                    posterUrl: posterUrl,
                    backdropUrl: posterUrl,
                    year: ""
                });
            }
        }
    } catch (e) {}

    return JSON.stringify({ items: items });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    var title = "";
    var posterUrl = "";
    var description = "";
    var episodes = [];

    try {
        // 1. Lấy tiêu đề phim từ thẻ <h1>
        var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        if (h1Match) title = h1Match.replace(/<[^>]+>/g, "").trim();

        // 2. Lấy ảnh poster từ thẻ meta og:image
        var ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        if (ogImgMatch) posterUrl = ogImgMatch;

        // 3. Lấy tóm tắt nội dung phim
        var descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
        if (descMatch) description = descMatch;

        // 4. Bóc tách danh sách tập phim (thường chứa /tap- hoặc /xem-phim/)
        var epList = [];
        var epRegex = /<a[^>]+href=["']([^"']*(?:tap-|xem-phim)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        var seenEp = {};

        while ((epMatch = epRegex.exec(html)) !== null) {
            var epUrl = epMatch;
            var epName = epMatch.replace(/<[^>]+>/g, "").trim();

            if (!seenEp[epUrl] && epName && epName.length < 30) {
                seenEp[epUrl] = true;
                epList.push({
                    id: epUrl,
                    name: epName
                });
            }
        }

        if (epList.length > 0) {
            episodes.push({
                serverName: "Server Vietsub / Thuyết Minh",
                items: epList
            });
        }
    } catch (e) {}

    return JSON.stringify({
        title: title,
        posterUrl: posterUrl,
        description: description,
        episodes: episodes
    });
}

function parseDetailResponse(html) {
    var streamUrl = "";
    var streamType = "hls";

    try {
        // Ưu tiên tìm link luồng .m3u8 trực tiếp trong mã nguồn
        var m3u8Match = html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
        if (m3u8Match) {
            streamUrl = m3u8Match.replace(/\\\//g, "/");
            streamType = "hls";
        } else {
            // Dự phòng: tìm thẻ <iframe> chứa trình phát nhúng
            var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
            if (iframeMatch) {
                streamUrl = iframeMatch;
                streamType = "embed";
            }
        }
    } catch (e) {}

    return JSON.stringify({
        url: streamUrl,
        type: streamType,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": https://motchillv.org + "/"
        }
    });
}
