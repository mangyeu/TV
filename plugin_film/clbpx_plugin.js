// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHAY",
        "version": "1.0.0",
        "baseUrl": "https://tvhay.buzz",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/tvhay.ico",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi', title: 'Phim Mới', type: 'Horizontal', path: 'danh-sach/phim-moi' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach/phim-bo' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach/phim-le' },
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach/phim-chieu-rap' },
        { slug: 'home', title: 'Trang Chủ', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim Mới', slug: 'phim-moi' },
        { name: 'Phim Bộ', slug: 'phim-bo' },
        { name: 'Phim Lẻ', slug: 'phim-le' },
        { name: 'Phim Chiếu Rạp', slug: 'phim-chieu-rap' },
        { name: 'Phim Hành Động', slug: 'the-loai/hanh-dong' },
        { name: 'Phim Tình Cảm', slug: 'the-loai/tinh-cam' },
        { name: 'Phim Hài Hước', slug: 'the-loai/hai-huoc' },
        { name: 'Phim Cổ Trang', slug: 'the-loai/co-trang' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({});
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://tvhay.buzz";

    // Nếu slug rỗng hoặc 'home' → trang chủ
    if (slug === '' || slug === 'home') {
        if (page > 1) {
            return baseUrl + "/page/" + page + "/";
        }
        return baseUrl + "/";
    }

    // Các slug đã chứa đường dẫn danh mục (ví dụ: danh-sach/phim-bo)
    var path = slug;
    if (page > 1) {
        return baseUrl + "/" + path + "/page/" + page + "/";
    }
    return baseUrl + "/" + path + "/";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var safeKeyword = encodeURIComponent(keyword);
    var url = "https://tvhay.buzz/tim-kiem/" + safeKeyword + "/";
    if (page > 1) {
        url = "https://tvhay.buzz/tim-kiem/" + safeKeyword + "/page/" + page + "/";
    }
    return url;
}

// getUrlDetail: App gọi với episode.id
// episode.id được lưu dưới dạng URL đầy đủ hoặc path
function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.charAt(0) !== '/') slug = '/' + slug;
    return "https://tvhay.buzz" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS (Giả định dựa trên cấu trúc phổ biến)
// =============================================================================

// Phân tích danh sách phim (trang chủ, danh mục, tìm kiếm)
function parseListResponse(html) {
    var items = [];
    
    // Giả định cấu trúc: <div class="movie-item"> hoặc <div class="film-item">
    // Thử nhiều selector phổ biến
    var blocks = html.split('class="movie-item"');
    if (blocks.length <= 1) {
        blocks = html.split('class="film-item"');
    }
    if (blocks.length <= 1) {
        blocks = html.split('class="item"');
    }

    for (var i = 1; i < blocks.length; i++) {
        var block = blocks[i];

        // Link phim: thường nằm trong thẻ <a> bao quanh title hoặc poster
        var linkMatch = block.match(/href=["']([^"']+)["']/i);
        var link = linkMatch ? linkMatch[1] : "";

        // Title: trong thuộc tính title hoặc thẻ heading
        var titleMatch = block.match(/title=["']([^"']+)["']/i);
        if (!titleMatch) {
            titleMatch = block.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
        }
        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "";

        // Poster: data-original hoặc src của img
        var thumbMatch = block.match(/data-original=["']([^"']+)["']/i);
        if (!thumbMatch) {
            thumbMatch = block.match(/data-src=["']([^"']+)["']/i);
        }
        if (!thumbMatch) {
            thumbMatch = block.match(/<img[^>]*src=["']([^"']+)["']/i);
        }
        var thumb = thumbMatch ? thumbMatch[1] : "";

        if (thumb && thumb.indexOf("data:image") === 0) thumb = "";

        if (link && title) {
            items.push({
                id: link,
                title: title,
                posterUrl: thumb,
                backdropUrl: thumb,
                year: 0
            });
        }
    }

    // Phân trang
    var currentPage = 1;
    var totalPages = 1;

    // Tìm trang hiện tại (class active)
    var cpMatch = html.match(/<a[^>]*class=["'][^"']*(?:active|current)[^"']*["'][^>]*>(\d+)<\/a>/i);
    if (cpMatch) {
        currentPage = parseInt(cpMatch[1]);
    }

    // Tìm tổng số trang (link phân trang cuối)
    var lpRegex = /<a[^>]*href=["'][^"']*\/page\/(\d+)\/?["'][^>]*>/gi;
    var lpMatch;
    while ((lpMatch = lpRegex.exec(html)) !== null) {
        var pageNum = parseInt(lpMatch[1]);
        if (pageNum > totalPages) totalPages = pageNum;
    }
    if (currentPage > totalPages) totalPages = currentPage;

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// Phân tích chi tiết phim
function parseMovieDetail(html) {
    try {
        // Title: thường trong <h1> có class "title" hoặc "movie-title"
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "";

        // Description: trong div "description" hoặc "content"
        var descMatch = html.match(/<div[^>]*class=["'][^"']*(?:description|content|summary)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        var description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : "";

        // Poster: og:image
        var ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var posterUrl = ogImg ? ogImg[1] : "";

        // Năm sản xuất
        var yearMatch = html.match(/(?:Năm|Year)[^<]*?(\d{4})/i);
        var year = yearMatch ? parseInt(yearMatch[1]) : 0;

        // Diễn viên (casts)
        var castsArr = [];
        var castRegex = /<a[^>]*href=["'][^"']*\/dien-vien\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
        var castMatch;
        while ((castMatch = castRegex.exec(html)) !== null) {
            castsArr.push(castMatch[1].replace(/<[^>]+>/g, '').trim());
        }

        // Thể loại (categories)
        var categoriesArr = [];
        var catRegex = /<a[^>]*href=["'][^"']*\/the-loai\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
        var cmMatch;
        while ((cmMatch = catRegex.exec(html)) !== null) {
            categoriesArr.push(cmMatch[1].replace(/<[^>]+>/g, '').trim());
        }

        // =====================================================================
        // Phân tích Tập phim (Servers)
        // =====================================================================
        var servers = [];

        // Lấy canonical URL để làm base cho episode ID
        var canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
        var pageUrl = canonicalMatch ? canonicalMatch[1] : "";

        // Tìm các nút chọn server (thường là tab hoặc button)
        // Giả định: <a ... data-server="1"> hoặc onclick="changeServer(1)"
        // Hoặc tìm các link tập phim: <a href="...tap-1...">Tập 1</a>
        
        // Cách 1: Tìm các episode links trong khu vực danh sách tập
        var episodeRegex = /<a[^>]*href=["']([^"']*(?:tap|episode|full)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        var episodes = [];
        
        while ((epMatch = episodeRegex.exec(html)) !== null) {
            var epLink = epMatch[1];
            var epName = epMatch[2].replace(/<[^>]+>/g, '').trim();
            
            // Chỉ lấy những link có vẻ là tập phim (chứa tap hoặc full)
            if (epLink && epName) {
                episodes.push({
                    id: epLink.indexOf("http") === 0 ? epLink : "https://tvhay.buzz" + epLink,
                    name: epName,
                    slug: epLink.replace(/[^a-z0-9]/gi, '-').toLowerCase()
                });
            }
        }

        // Nếu tìm thấy episodes, gom vào 1 server
        if (episodes.length > 0) {
            servers.push({
                name: "Vietsub",
                episodes: episodes
            });
        } 
        // Fallback: nếu không tìm thấy, tạo 1 episode full từ URL hiện tại
        else if (pageUrl) {
            servers.push({
                name: "Full",
                episodes: [{
                    id: pageUrl,
                    name: "Full",
                    slug: "full"
                }]
            });
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: year,
            rating: 0,
            casts: castsArr.join(", "),
            director: "",
            country: "",
            category: categoriesArr.join(", "),
            status: "Full"
        });

    } catch (e) {
        return "null";
    }
}

// =============================================================================
// STREAM RESOLUTION
// =============================================================================

// parseDetailResponse: Xử lý HTML trang chi tiết/tập phim để tìm link stream
// Đối với TVHAY, thường link stream nằm trong iframe hoặc script player
function parseDetailResponse(html, fetchedUrl) {
    try {
        // Tìm iframe embed (thường là player)
        var iframeMatch = html.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        if (iframeMatch) {
            return JSON.stringify({
                url: iframeMatch[1],
                isEmbed: true,
                headers: {
                    "Referer": "https://tvhay.buzz/"
                }
            });
        }

        // Tìm link stream trực tiếp trong script (file: "...")
        var fileMatch = html.match(/"file"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/i);
        if (fileMatch) {
            return JSON.stringify({
                url: fileMatch[1],
                isEmbed: false,
                mimeType: fileMatch[1].indexOf(".m3u8") !== -1 ? "application/x-mpegURL" : "video/mp4",
                headers: {
                    "Referer": "https://tvhay.buzz/"
                }
            });
        }

        // Tìm bất kỳ URL m3u8 nào
        var m3u8Match = html.match(/(https?:\/\/[^\s"'\\]+\.m3u8[^\s"'\\]*)/i);
        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1],
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "Referer": "https://tvhay.buzz/"
                }
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    } catch (error) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

// parseEmbedResponse: Xử lý HTML từ embed page (nếu isEmbed = true)
function parseEmbedResponse(html, url) {
    try {
        // Tương tự như trên, tìm link stream trong embed page
        var fileMatch = html.match(/"file"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/i);
        if (fileMatch) {
            return JSON.stringify({
                url: fileMatch[1],
                isEmbed: false,
                mimeType: fileMatch[1].indexOf(".m3u8") !== -1 ? "application/x-mpegURL" : "video/mp4",
                headers: {
                    "Referer": url
                }
            });
        }

        var m3u8Match = html.match(/(https?:\/\/[^\s"'\\]+\.m3u8[^\s"'\\]*)/i);
        if (m3u8Match) {
            return JSON.stringify({
                url: m3u8Match[1],
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "Referer": url
                }
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}
