var BASE_URL = "https://chillhayz.pro";

// 1. Thông tin nhận diện nguồn
function getManifest() {
    return JSON.stringify({
        "id": "chillhayz_pro",
        "name": "ChillHay (Thuyết Minh)",
        "version": "1.0.0",
        "baseUrl": BASE_URL,
        "type": "MOVIE",
        "layout": "VERTICAL"
    });
}

// 2. Các mục hiển thị ngoài trang chủ (khớp với menu trên web)
function getHomeSections() {
    return JSON.stringify([
        { "slug": "phim-moi", "title": "Phim Mới Cập Nhật", "type": "LIST", "path": "/phim-moi" },
        { "slug": "phim-le", "title": "Phim Lẻ Thuyết Minh", "type": "LIST", "path": "/phim-le" },
        { "slug": "phim-bo", "title": "Phim Bộ Thuyết Minh", "type": "LIST", "path": "/phim-bo" },
        { "slug": "the-loai/phim-thuyet-minh", "title": "Phim Thuyết Minh Hay", "type": "LIST", "path": "/the-loai/phim-thuyet-minh" }
    ]);
}

// 3. Danh sách thể loại (khớp với menu Thể loại của Chillhay)
function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "the-loai/phim-hanh-dong", "title": "Phim Hành Động" },
        { "slug": "the-loai/phim-tinh-cam", "title": "Phim Tình Cảm" },
        { "slug": "the-loai/phim-vo-thuat", "title": "Phim Võ Thuật" },
        { "slug": "the-loai/phim-tam-ly", "title": "Phim Tâm Lý" },
        { "slug": "the-loai/phim-hai-huoc", "title": "Phim Hài" },
        { "slug": "the-loai/phim-hoat-hinh", "title": "Phim Hoạt Hình" },
        { "slug": "the-loai/phim-phieu-luu", "title": "Phim Phiêu Lưu" },
        { "slug": "the-loai/phim-kinh-di", "title": "Phim Kinh Dị" },
        { "slug": "the-loai/phim-co-trang", "title": "Phim Cổ Trang" },
        { "slug": "the-loai/phim-vien-tuong", "title": "Phim Viễn Tưởng" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({});
}

// 4. Tạo URL lấy danh sách & phân trang
function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var cleanSlug = slug.replace(/^\/+/, "");
    if (page > 1) {
        return BASE_URL + "/" + cleanSlug + "/trang-" + page + ".html";
    }
    return BASE_URL + "/" + cleanSlug;
}

// 5. Tạo URL tìm kiếm
function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_URL + "/tim-kiem/" + encodeURIComponent(keyword) + "/trang-" + page + ".html";
}

// 6. Tạo URL trang chi tiết
function getUrlDetail(slug) {
    return slug.indexOf("http") === 0 ? slug : BASE_URL + "/" + slug.replace(/^\/+/, "");
}

// 7. Bóc tách danh sách phim từ HTML
function parseListResponse(html) {
    var items = [];
    // Bắt khối thẻ <li> hoặc <div class="item"> chứa thẻ <a href="..." title="..."> và <img>
    var itemRegex = /<li[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]+title="([^"]+)"[\s\S]*?<img[^>]+(?:data-src|src)="([^"]+)"[\s\S]*?<\/li>/gi;
    var match;

    while ((match = regex.exec(html)) !== null) {
        items.push({
            "id": match[1],        // Đường dẫn chi tiết phim
            "title": match[2],     // Tên phim
            "posterUrl": match[3], // Link ảnh bìa
            "year": ""
        });
    }

        // Lọc bỏ các thẻ <li> của thanh menu điều hướng
        if (href.indexOf("/the-loai/") === -1 && href.indexOf("/quoc-gia/") === -1 && poster.indexOf("http") !== -1) {
            items.push({
                "id": href.indexOf("http") === 0 ? href : BASE_URL + href,
                "title": title.replace(/^Xem phim\s+/i, "").trim(),
                "posterUrl": poster,
                "year": ""
            });
        }
    }
    return JSON.stringify({ "items": items });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// 8. Bóc tách thông tin phim và danh sách tập
function parseMovieDetail(html) {
    var titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
    var descMatch = /<div[^>]+class="[^"]*(?:film-content|description|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(html);
    var posterMatch = /<div[^>]+class="[^"]*poster[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i.exec(html);

    // Tìm nút "Xem Phim" nếu trang chi tiết tách riêng với trang phát
    var watchBtnMatch = /<a[^>]+href="([^"]+)"[^>]*>(?:Xem Phim|Tập 1|Full)<\/a>/i.exec(html);

    // Bóc tách danh sách tập phim (thường nằm trong khối danh sách tập)
    var episodes = [];
    var epRegex = /<a[^>]+href="([^"]+)"[^>]*>(?:Tập\s*)?([0-9]+|Full|End|HD|Thuyết Minh)<\/a>/gi;
    var epMatch;
    while ((epMatch = epRegex.exec(html)) !== null) {
        var epUrl = epMatch;
        episodes.push({
            "id": epUrl.indexOf("http") === 0 ? epUrl : BASE_URL + epUrl,
            "name": "Tập " + epMatch.trim()
        });
    }

    // Nếu không tìm thấy danh sách tập ở trang thông tin, lấy link từ nút Xem Phim
    if (episodes.length === 0 && watchBtnMatch) {
        var wUrl = watchBtnMatch;
        episodes.push({
            "id": wUrl.indexOf("http") === 0 ? wUrl : BASE_URL + wUrl,
            "name": "Full (Thuyết Minh)"
        });
    }

    return JSON.stringify({
        "title": titleMatch ? titleMatch.replace(/<[^>]+>/g, "").trim() : "",
        "description": descMatch ? descMatch.replace(/<[^>]+>/g, "").trim() : "",
        "posterUrl": posterMatch ? posterMatch : "",
        "episodes": [
            {
                "server_name": "Server ChillHay",
                "server_data": episodes
            }
        ]
    });
}

// 9. Bóc tách link luồng phát video (.m3u8 hoặc iframe)
function parseDetailResponse(html) {
    // Ưu tiên tìm luồng trực tiếp .m3u8 / .mp4 trong mã nguồn hoặc biến JS player
    var m3u8Match = /(https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)/i.exec(html);
    var iframeMatch = /<iframe[^>]+src="([^"]+)"/i.exec(html);

    var streamUrl = "";
    if (m3u8Match) {
        streamUrl = m3u8Match.replace(/\\\//g, "/");
    } else if (iframeMatch) {
        streamUrl = iframeMatch;
    }

    return JSON.stringify({
        "url": streamUrl,
        "headers": {
            "Referer": BASE_URL + "/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    });
}

