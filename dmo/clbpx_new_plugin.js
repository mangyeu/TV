const BASE_URL = "https://motphim.hair";

// ==========================================
// A. NHÓM CONFIG & METADATA
// ==========================================

function getManifest() {
    return JSON.stringify({
        "id": "motphim_hair",
        "name": "Motphim (motphim.hair)",
        "version": "1.0.0",
        "baseUrl": BASE_URL,
        "type": "MOVIE",
        "layout": "VERTICAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-bo", title: "Phim Bộ Mới", type: "LIST", path: "/phim-bo" },
        { slug: "phim-le", title: "Phim Lẻ Mới", type: "LIST", path: "/phim-le" },
        { slug: "tv-shows", title: "TV Shows", type: "LIST", path: "/tv-shows" },
        { slug: "han-quoc", title: "Phim Hàn Quốc", type: "LIST", path: "/quoc-gia/han-quoc" },
        { slug: "trung-quoc", title: "Phim Trung Quốc", type: "LIST", path: "/quoc-gia/trung-quoc" },
        { slug: "au-my", title: "Phim Âu Mỹ", type: "LIST", path: "/quoc-gia/au-my" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { slug: "phim-bo", name: "Phim Bộ" },
        { slug: "phim-le", name: "Phim Lẻ" },
        { slug: "the-loai/hanh-dong", name: "Hành Động" },
        { slug: "the-loai/tinh-cam", name: "Tình Cảm" },
        { slug: "the-loai/co-trang", name: "Cổ Trang" },
        { slug: "the-loai/bi-an", name: "Bí Ẩn" },
        { slug: "the-loai/hai-huoc", name: "Hài Hước" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { label: "Mới cập nhật", value: "update" },
            { label: "Xem nhiều", value: "view" },
            { label: "Năm phát hành", value: "year" }
        ]
    });
}

// ==========================================
// B. NHÓM SINH ĐƯỜNG DẪN URL
// ==========================================

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {}
    var page = filters.page || 1;
    var cleanSlug = slug.replace(/^\/+/, "");
    return BASE_URL + "/" + cleanSlug + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {}
    var page = filters.page || 1;
    return BASE_URL + "/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(slug) {
    if (slug.startsWith("http")) return slug;
    var cleanSlug = slug.replace(/^\/+/, "");
    return BASE_URL + "/" + cleanSlug;
}

// ==========================================
// C. NHÓM PHÂN TÍCH DỮ LIỆU HTML (PARSERS)
// ==========================================

function parseListResponse(html) {
    var items = [];
    try {
        // Bóc tách thẻ <a> chứa link phim (/phim/...) cùng ảnh poster và tiêu đề
        var itemRegex = /<a[^>]+href=["'](\/phim\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;
        var seen = {};

        while ((match = itemRegex.exec(html)) !== null) {
            var href = match;
            var innerHtml = match;

            if (seen[href]) continue;

            // Lấy URL ảnh poster (ưu tiên data-src hoặc src)
            var imgMatch = innerHtml.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/i);
            if (!imgMatch) continue;
            var posterUrl = imgMatch;
            if (posterUrl.startsWith("/")) posterUrl = BASE_URL + posterUrl;

            // Lấy tên phim từ thuộc tính title, alt hoặc thẻ tiêu đề h3/h2
            var title = "";
            var titleTagMatch = innerHtml.match(/<(?:h2|h3|h4|span)[^>]*class=["'][^"']*(?:title|name)[^"']*["'][^>]*>([\s\S]*?)<\/(?:h2|h3|h4|span)>/i);
            var altMatch = innerHtml.match(/alt=["']([^"']+)["']/i);

            if (titleTagMatch) {
                title = titleTagMatch.replace(/<[^>]+>/g, "").trim();
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
        // 1. Lấy tiêu đề phim
        var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        if (h1Match) title = h1Match.replace(/<[^>]+>/g, "").trim();

        // 2. Lấy ảnh poster từ thẻ meta og:image
        var ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        if (ogImgMatch) posterUrl = ogImgMatch;

        // 3. Lấy mô tả nội dung phim
        var descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
        if (descMatch) description = descMatch;

        // 4. Bóc tách danh sách tập phim (/xem-phim/...)
        var epList = [];
        var epRegex = /<a[^>]+href=["'](\/xem-phim\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        var seenEp = {};

        while ((epMatch = epRegex.exec(html)) !== null) {
            var epUrl = epMatch;
            var epName = epMatch.replace(/<[^>]+>/g, "").trim();

            if (!seenEp[epUrl] && epName) {
                seenEp[epUrl] = true;
                epList.push({
                    id: epUrl,
                    name: epName
                });
            }
        }

        if (epList.length > 0) {
            episodes.push({
                serverName: "Server Chính (Vietsub / Thuyết Minh)",
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
        // Tìm link luồng phát trực tiếp .m3u8 trong mã nguồn trang xem phim
        var m3u8Match = html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
        if (m3u8Match) {
            streamUrl = m3u8Match.replace(/\\\//g, "/");
            streamType = "hls";
        } else {
            // Nếu web nhúng trình phát qua iframe embed
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
            "Referer": BASE_URL + "/"
        }
    });
}
