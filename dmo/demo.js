// =============================================================================
// 1. MANIFEST & CONFIGURATION (CLB Phim Xưa - Chuẩn ES5)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "clb_phim_xua",
        "name": "CLB Phim Xưa",
        "version": "1.0.0",
        "baseUrl": "https://clbphimxua.top",
        "referrer": "https://clbphimxua.top/",
        "iconUrl": "https://clbphimxua.top/wp-content/uploads/2023/favicon.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "subtitleCat": false
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: '', title: '🔥 Phim Mới Cập Nhật', type: 'Horizontal', path: '' },
        { slug: 'phim-bo', title: '📺 Phim Bộ Kinh Điển', type: 'Horizontal', path: '' },
        { slug: 'phim-le', title: '🎬 Phim Lẻ Xưa', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Trang chủ', slug: '' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [],
        category: []
    });
}

// =============================================================================
// 2. URL GENERATION (Xây dựng đường dẫn trực tiếp đến clbphimxua.top)
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://clbphimxua.top";
    
    var path = slug || "";
    if (path.indexOf("/") === 0) {
        path = path.substring(1);
    }

    if (page > 1) {
        if (path) {
            return baseUrl + "/" + path + "/page/" + page + "/";
        }
        return baseUrl + "/page/" + page + "/";
    }

    return baseUrl + (path ? "/" + path + "/" : "");
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var url = "https://clbphimxua.top/?s=" + encodeURIComponent(keyword);
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    if (!slug) {
        return "https://clbphimxua.top";
    }
    if (slug.indexOf("http") === 0) {
        return slug;
    }
    if (slug.indexOf("/") === 0) {
        return "https://clbphimxua.top" + slug;
    }
    return "https://clbphimxua.top/" + slug;
}

function getUrlCategories() { 
    return "https://clbphimxua.top/"; 
}

function getUrlCountries() { 
    return ""; 
}

function getUrlYears() { 
    return ""; 
}

// =============================================================================
// 3. UTILS & HELPERS
// =============================================================================

var PluginUtils = {
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    }
};

// =============================================================================
// 4. PARSERS (Cào dữ liệu danh sách trực tiếp từ trang web)
// =============================================================================

function parseListResponse(html) {
    var items = [];
    if (!html) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 }
        });
    }

    // Quét các liên kết bài viết / phim trong mã HTML trả về từ clbphimxua.top
    var parts = html.split('href="');
    for (var i = 1; i < parts.length; i++) {
        var chunk = parts[i];
        var quoteIdx = chunk.indexOf('"');
        if (quoteIdx === -1) continue;

        var link = chunk.substring(0, quoteIdx);
        
        // Lọc các liên kết thuộc tên miền clbphimxua.top và loại bỏ các trang hệ thống không cần thiết
        if (link.indexOf("clbphimxua.top") !== -1 || link.indexOf("/") === 0) {
            if (link.indexOf("/wp-content/") !== -1 || 
                link.indexOf("/wp-json/") !== -1 || 
                link.indexOf("/tag/") !== -1 || 
                link.indexOf("/category/") !== -1 ||
                link.indexOf("/page/") !== -1) {
                continue;
            }

            var slug = link.replace(/https?:\/\/[^\/]+/, "");
            if (slug === "" || slug === "/") continue;

            // Tránh trùng lặp item
            var isExist = false;
            var m = 0;
            for (m = 0; m < items.length; m++) {
                if (items[m].id === link || items[m].id === slug) {
                    isExist = true;
                    break;
                }
            }
            if (isExist) continue;

            var blockHtml = chunk.substring(0, 500);
            
            // Trích xuất tiêu đề phim
            var titleMatch = blockHtml.match(/title="([^"]+)"/) || blockHtml.match(/alt="([^"]+)"/);
            var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";
            
            if (!title || title.length < 2) continue;

            // Trích xuất ảnh poster
            var imgMatch = blockHtml.match(/src="([^"]+)"/) || blockHtml.match(/data-src="([^"]+)"/);
            var thumb = imgMatch ? imgMatch[1] : "";
            if (thumb && thumb.indexOf("//") === 0) {
                thumb = "https:" + thumb;
            }

            items.push({
                id: link.indexOf("http") === 0 ? link : slug,
                title: title,
                posterUrl: thumb,
                backdropUrl: thumb,
                description: "Phim xưa kinh điển trực tiếp từ CLB Phim Xưa",
                year: 2026,
                quality: "HD",
                episode_current: "Full",
                lang: "Thuyết Minh / Vietsub"
            });
        }
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: 1,
            totalPages: 10,
            totalItems: items.length,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// 5. PARSERS (Xử lý chi tiết và lấy luồng phát video trực tiếp)
// =============================================================================

function parseMovieDetail(html, pageUrl) {
    var title = "Phim Xưa";
    var thumb = "";
    var desc = "";

    if (html) {
        var ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i);
        if (ogTitle) title = PluginUtils.cleanText(ogTitle[1]);

        var ogImg = html.match(/property="og:image"\s+content="([^"]+)"/i);
        if (ogImg) thumb = ogImg[1];

        var ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i);
        if (ogDesc) desc = PluginUtils.cleanText(ogDesc[1]);
    }

    var targetUrl = pageUrl;
    if (!targetUrl) {
        targetUrl = "https://clbphimxua.top";
    }

    var servers = [{
        name: "Server Phim Xưa Chính Thức",
        episodes: [
            { 
                id: targetUrl, 
                name: "Xem Phim (Full)", 
                slug: "full" 
            }
        ]
    }];

    return JSON.stringify({
        id: targetUrl,
        title: title,
        posterUrl: thumb,
        backdropUrl: thumb,
        description: desc,
        servers: servers,
        quality: "HD",
        lang: "Vietsub",
        year: 2026,
        rating: 5.0,
        casts: "",
        director: "",
        category: "Phim Kinh Điển",
        status: "Full",
        duration: "",
        previewUrl: ""
    });
}

function parseDetailResponse(html, pageUrl) {
    var streamUrl = "";

    if (html) {
        // 1. Quét tìm trực tiếp file video m3u8 hoặc mp4 trong mã nguồn trang chi tiết
        var mediaMatch = html.match(/(https?:\/\/[^"'\s]+\.(m3u8|mp4)[^"'\s]*)/i);
        if (mediaMatch) {
            streamUrl = mediaMatch[1];
        } else {
            // 2. Quét tìm thẻ iframe nhúng player nếu trang dùng nguồn phát ngoài
            var iframeMatch = html.match(/src="(https?:\/\/[^"'\s]+embed[^"'\s]*)"/i) || html.match(/iframe[^>]+src="([^"]+)"/i);
            if (iframeMatch) {
                streamUrl = iframeMatch[1];
            }
        }
    }

    if (!streamUrl) {
        streamUrl = pageUrl;
    }

    var isEmbed = streamUrl.indexOf(".m3u8") === -1 && streamUrl.indexOf(".mp4") === -1;

    var responseData = {
        url: streamUrl,
        streamUrl: streamUrl,
        file: streamUrl,
        link: streamUrl,
        isEmbed: isEmbed,
        mimeType: isEmbed ? "" : "application/x-mpegURL",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Referer": "https://clbphimxua.top/",
            "Origin": "https://clbphimxua.top",
            "Accept": "*/*"
        },
        subtitles: []
    };

    return JSON.stringify(responseData);
}

function parseEmbedResponse(html, url) {
    return parseDetailResponse(html, url);
}

function parseCategoriesResponse(html) { 
    return JSON.stringify([
        { name: "Phim Mới", slug: "phim-moi" },
        { name: "Phim Bộ", slug: "phim-bo" },
        { name: "Phim Lẻ", slug: "phim-le" }
    ]); 
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
