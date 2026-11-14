var BASE_URL = "https://javhdz.today";

// ==========================================
// A. NHÓM CONFIG & METADATA
// ==========================================
function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.5",
        "baseUrl": "BASE_URL",
        "iconUrl": "https://javhdz.today/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embedtoexoplay"
    });
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'recent' },
        { name: 'Không Che', slug: 'uncensored-jav' },
        { name: 'Khử Che', slug: 'reducing-mosaic' },
        { name: 'Vietsub', slug: 'jav-sub' },
        { name: 'Nghiệp Dư', slug: 'amateur' }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'popular/today', title: 'Xem Nhiều Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'uncensored-jav', title: 'Jav Uncensored', type: 'Horizontal', path: '' },
        { slug: 'reducing-mosaic', title: 'Reducing Mosaic', type: 'Horizontal', path: '' },
        { slug: 'jav-sub', title: 'Jav Sub', type: 'Horizontal', path: '' },
        { slug: 'recent', title: 'Video Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'recent' },
            { name: 'Xem nhiều hôm nay', value: 'popular/today' },
            { name: 'Xem nhiều trong tuần', value: 'popular/week' },
            { name: 'Xem nhiều trong tháng', value: 'popular/month' },
            { name: 'Xem nhiều tất cả', value: 'popular/year' },
            { name: 'Nhiều lượt thích', value: 'rated/year' }
        ],
        category: [
            { name: "Uncensored Jav", value: "uncensored-jav" },
            { name: "Reducing Mosaic", value: "reducing-mosaic" },
            { name: "Jav Sub", value: "jav-sub" },
            { name: "Chinese Sub", value: "chinese-subtitle" },
            { name: "Creampie", value: "creampie" },
            { name: "Big Tits", value: "big-tits" },
            { name: "Amateur", value: "amateur" },
            { name: "Married Woman", value: "married-woman" },
            { name: "Beautiful Girl", value: "beautiful-girl" },
            { name: "Mature Woman", value: "mature-woman" },
            { name: "Cuckold", value: "cuckold" },
            { name: "Squirting", value: "squirting" },
            { name: "Nasty", value: "nasty" },
            { name: "Hardcore", value: "hardcore" }
        ]
    });
}

function getFilterConfig() {
    return JSON.stringify({});
}

// ==========================================
// B. NHÓM SINH ĐƯỜNG DẪN URL
// ==========================================
function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    // Cấu trúc phân trang phổ biến của Motchill: /phim-bo?page=2 hoặc /phim-bo/page/2
    return BASE_URL + "/" + slug + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_URL + "/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(slug) {
    // Đảm bảo slug luôn nối đúng với BASE_URL
    if (slug.indexOf("http") === 0) return slug;
    return BASE_URL + (slug.indexOf("/") === 0 ? slug : "/" + slug);
}

// ==========================================
// C. NHÓM BÓC TÁCH HTML (HTML PARSERS)
// ==========================================
function fixUrl(url) {
    if (!url) return "";
    if (url.indexOf("http") === 0) return url;
    return BASE_URL + (url.indexOf("/") === 0 ? url : "/" + url);
}

function parseListResponse(htmlString) {
    var movies = [];
    try {
        // Bóc tách từng khối item phim dựa trên thẻ <article> hoặc <li> chứa thông tin phim
        // Lưu ý: Cần kiểm tra thẻ HTML thực tế bằng F12 (Inspect) trên trình duyệt
        var itemRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
        var match;

        while ((match = itemRegex.exec(htmlString)) !== null) {
            var block = match[1];

            // 1. Lấy đường dẫn (href) và tên phim (title)
            var linkMatch = block.match(/<a[^>]+href=["']([^"']+)["'][^>]*title=["']([^"']+)["']/i) ||
                            block.match(/<a[^>]+title=["']([^"']+)["'][^>]*href=["']([^"']+)["']/i);
            
            // 2. Lấy ảnh poster (ưu tiên data-src cho lazy load, sau đó đến src)
            var imgMatch = block.match(/<img[^>]+data-src=["']([^"']+)["']/i) ||
                           block.match(/<img[^>]+src=["']([^"']+)["']/i);

            // 3. Lấy nhãn tập (ví dụ: Tập 22 Vietsub)
            var epMatch = block.match(/<span[^>]*class=["'][^"']*label[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);

            if (linkMatch) {
                var href = linkMatch[1].indexOf("/") === 0 || linkMatch[1].indexOf("http") === 0 ? linkMatch[1] : linkMatch[2];
                var title = href === linkMatch[1] ? linkMatch[2] : linkMatch[1];
                var poster = imgMatch ? fixUrl(imgMatch[1]) : "";
                var subtitle = epMatch ? epMatch[1].replace(/<[^>]*>?/gm, "").trim() : "";

                movies.push({
                    "id": href,
                    "title": title.trim(),
                    "subtitle": subtitle,
                    "posterUrl": poster,
                    "backdropUrl": poster,
                    "year": ""
                });
            }
        }
    } catch (e) {}

    return JSON.stringify({ "items": movies });
}

function parseSearchResponse(htmlString) {
    return parseListResponse(htmlString);
}

function parseMovieDetail(htmlString) {
    try {
        // 1. Lấy tiêu đề phim từ thẻ <h1>
        var titleMatch = htmlString.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]*>?/gm, "").trim() : "Không rõ tên";

        // 2. Lấy mô tả nội dung phim
        var descMatch = htmlString.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        var description = descMatch ? descMatch[1].replace(/<[^>]*>?/gm, "").trim() : "";

        // 3. Lấy ảnh đại diện (og:image trong thẻ meta là chính xác và dễ lấy nhất)
        var posterMatch = htmlString.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        var posterUrl = posterMatch ? fixUrl(posterMatch[1]) : "";

        // 4. Lấy danh sách tập phim (tìm các thẻ <a> nằm trong khu vực danh sách tập)
        var episodes = [];
        var serverItems = [];
        
        // Regex tìm các link tập phim (thường có chữ tap- hoặc episode)
        var epRegex = /<a[^>]+href=["']([^"']*(?:tap-|episode)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        var seenUrls = {};

        while ((epMatch = epRegex.exec(htmlString)) !== null) {
            var epUrl = fixUrl(epMatch[1]);
            var epName = epMatch[2].replace(/<[^>]*>?/gm, "").trim();

            if (!seenUrls[epUrl] && epName) {
                seenUrls[epUrl] = true;
                serverItems.push({
                    "id": epUrl,
                    "title": epName,
                    "url": epUrl
                });
            }
        }

        if (serverItems.length > 0) {
            episodes.push({
                "serverName": "Server Vietsub",
                "items": serverItems
            });
        }

        return JSON.stringify({
            "id": "",
            "title": title,
            "description": description,
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "year": "",
            "episodes": episodes
        });
    } catch (e) {
        return JSON.stringify({});
    }
}

function parseDetailResponse(htmlStringOrUrl) {
    // Ở bước này, VAX sẽ tải HTML của trang xem tập phim (epUrl) và truyền vào hàm này
    // Tìm link .m3u8 hoặc link iframe nhúng trong mã nguồn trang xem phim
    var m3u8Match = htmlStringOrUrl.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
    if (m3u8Match) {
        return JSON.stringify({
            "url": m3u8Match[1].replace(/\\\//g, "/"),
            "type": "HLS",
            "headers": {
                "Referer": BASE_URL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });
    }

    // Nếu không có .m3u8 trực tiếp, tìm thẻ <iframe> chứa trình phát
    var iframeMatch = htmlStringOrUrl.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    var streamUrl = iframeMatch ? fixUrl(iframeMatch[1]) : htmlStringOrUrl;

    return JSON.stringify({
        "url": streamUrl,
        "type": "EMBED",
        "headers": {
            "Referer": BASE_URL + "/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    });
}
