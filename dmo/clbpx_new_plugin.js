// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================
BaseURL = "https://phimchillh.im";
BaseJSON = "";

function getManifest() {
    return JSON.stringify({
        "id": "clbpx",
        "name": "CLB Phim Xưa",
        "version": "1.0.6",
        "baseUrl": "https://phimchillh.im",
        "iconUrl": "https://raw.githubusercontent.com/mangyeu/TV/refs/heads/main/dmo/nguonc.ico",
        "isEnabled": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL"
    });
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim Mới', slug: 'phim-moi' },
        { name: 'Phim Lẻ', slug: 'phim-le' },
        { name: 'Phim Bộ', slug: 'phim-bo' },
        { name: 'Hành Động', slug: 'genre/phim-hanh-dong' },
        { name: 'Chiếu Rạp', slug: 'genre/phim-chieu-rap' }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'list/phim-moi', title: 'Phim Mới Cập Nhật', type: 'Horizontal' },
        { slug: 'list/phim-le', title: 'Phim Lẻ', type: 'Horizontal' },
        { slug: 'list/phim-bo', title: 'Phim Bộ', type: 'Horizontal' },
        { slug: 'genre/phim-hanh-dong', title: 'Hành Động', type: 'Horizontal' },
        { slug: 'genre/phim-tinh-cam', title: 'Tình Cảm', type: 'Grid' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [],
        category: [
            { name: "Hành Động", value: "genre/phim-hanh-dong" },
            { name: "Võ Thuật", value: "genre/phim-vo-thuat" },
            { name: "Tình Cảm", value: "genre/phim-tinh-cam" },
            { name: "Hài Hước", value: "genre/phim-hai-huoc" },
            { name: "Hoạt Hình", value: "genre/phim-hoat-hinh" },
            { name: "Chiếu Rạp", value: "genre/phim-chieu-rap" }
        ]
    });
}

// =============================================================================
// URL GENERATION (Bóc tách slug sạch theo khuôn mẫu mới)
// =============================================================================

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
    var url = "https://phimchillh.im/";
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
    return "https://phimchillh.im/tim-kiem/" + encodeURIComponent(keyword).replace(/%20/g, '+');
}

function getUrlDetail(slug) {
    if (!slug) return "https://phimchillh.im/";
    if (slug.indexOf("http") === 0) return slug;

    // Xử lý slug bị lỗi do app gộp (nếu có /xem/ hoặc /info/ bên trong)
    if (slug.indexOf("/xem/") > -1 || slug.indexOf("/info/") > -1) {
        return "https://phimchillh.im" + (slug.indexOf("/") === 0 ? "" : "/") + slug;
    }

    // PhimMoiChill dùng /info/ cho trang chi tiết
    return "https://phimchillh.im/info/" + slug.replace(".html", "");
}

function getUrlCategories() { return "https://phimchillh.im/"; }
function getUrlCountries() { return "https://phimchillh.im/"; }
function getUrlYears() { return "https://phimchillh.im/"; }

// =============================================================================
// PARSERS
// =====================================================
function parseListResponse(html) {
    var moviesMap = {};
    // PhimMoiChill thường dùng thẻ li class="item" hoặc div class="item" 
    var parts = html.split(/<li[^>]*class=["']item["'][^>]*>/);
    if (parts.length <= 1) {
        parts = html.split(/<div[^>]*class=["']item(?:[^"']*)?["'][^>]*>/);
    }

    // Nếu trang web có wrapper "halim-item" thường thấy ở theme Halim/Phimmoi
    if (parts.length <= 1) {
        parts = html.split(/<article[^>]*class=["'][^"']*halim-item["'][^>]*>/);
        if (parts.length <= 1) {
            parts = html.split(/<div[^>]*class=["'][^"']*halim-item["'][^>]*>/);
        }
    }

    // Một cấu trúc khác phổ biến của phimmoichill
    if (parts.length <= 1) {
        parts = html.split(/<div[^>]*class=["']flw-item["'][^>]*>/); // flix mẫu
    }

    if (parts.length <= 1) {
        // Fallback catch-all links if needed
        var listItems = html.match(/<a[^>]+href="[^"]+\/phim\/[^"]+">[\s\S]*?<\/a>/g);
        if (listItems) {
            parts = [""];
            for (var k = 0; k < listItems.length; k++) parts.push(listItems[k]);
        }
    }

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];

        // Lấy link và ID/Slug
        var linkMatch = itemHtml.match(/href="([^"]*(?:\/phim\/|\/xem\/|\/info\/)([^"\/]+)(?:\.html|))"/);
        if (!linkMatch) linkMatch = itemHtml.match(/href="([^"]+)"/);

        var fullUrl = linkMatch ? linkMatch[1] : "";
        var slugMatch = fullUrl.match(/\/phim\/([^\/.]+)/) || fullUrl.match(/\/xem\/([^\/]+)-pm/) || fullUrl.match(/\/info\/([^\/.]+)/);
        var slug = slugMatch ? slugMatch[1] : (linkMatch ? linkMatch[2] : "");

        if (slug) {
            slug = slug.replace(".html", "")
                .replace("info-", "")
                .replace(/^info\//, "")
                .replace(/^phim\//, "");
        }

        // Lấy tiêu đề 
        var title = "";
        var pMatch = itemHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        if (pMatch) title = pMatch[1].replace(/<[^>]*>/g, "").trim();

        if (!title) {
            var h3Match = itemHtml.match(/<h3[^>]*>(?:<a[^>]*>)?([\s\S]*?)(?:<\/a>)?<\/h3>/i);
            if (h3Match) title = h3Match[1].replace(/<[^>]*>/g, "").trim();
            else {
                var pMatch2 = itemHtml.match(/<p[^>]*class="name"[^>]*>([\s\S]*?)<\/p>/i);
                if (pMatch2) title = pMatch2[1].replace(/<[^>]*>/g, "").trim();
            }
        }

        if (!title && itemHtml.indexOf('title="') > -1) {
            var maybeTitleMatch = itemHtml.match(/title="([^"]+)"/);
            if (maybeTitleMatch) title = maybeTitleMatch[1];
        }

        // Lấy ảnh Thumbnail
        var thumbMatch = itemHtml.match(/data-src="([^"]+)"/) || itemHtml.match(/src="([^"]+)"/);
        var thumb = thumbMatch ? thumbMatch[1] : "";

        // Dọn dẹp URL ảnh nếu là lazyload url base64
        if (thumb.indexOf("data:image") === 0) {
            var fallbackThumbMatch = itemHtml.match(/data-bg="([^"]+)"/) || itemHtml.match(/style=".*url\('([^']+)'/);
            if (fallbackThumbMatch) thumb = fallbackThumbMatch[1];
        }

        // Kiểm tra xem có lấy được hay không, nếu không bỏ qua
        if (slug && title) {
            var rawTitle = PluginUtils.cleanText(title);

            // Tìm nhãn chất lượng (VD: HD, FHD, 4K, Vietsub)
            var labels = [];
            var qualityMatch = itemHtml.match(/class="[^"]*(?:quality|label|status)[^"]*"[^>]*>([\s\S]*?)<\//i);
            if (!qualityMatch) qualityMatch = itemHtml.match(/<span class="status">([^<]+)<\/span>/);

            if (qualityMatch) labels.push(PluginUtils.cleanText(qualityMatch[1]));

            // Tìm 4K đặc biệt
            if (itemHtml.indexOf("4K") !== -1 || itemHtml.indexOf("4k") !== -1) {
                if (labels.join(" ").indexOf("4K") === -1) {
                    labels.push("4K");
                }
            }

            var episodeMatch = itemHtml.match(/class="[^"]*episode[^"]*"[^>]*>([\s\S]*?)<\//);
            if (episodeMatch && PluginUtils.cleanText(episodeMatch[1]) !== "") labels.push(PluginUtils.cleanText(episodeMatch[1]));

            var statusText = labels.length > 0 ? labels.join(" | ") : "Full";

            if (!moviesMap[slug]) {
                moviesMap[slug] = {
                    id: slug,
                    title: rawTitle || "Phim không tiêu đề",
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    year: 0,
                    quality: (labels.join(" ").indexOf("4K") > -1) ? "4K" : "HD",
                    episode_current: statusText,
                    lang: "Vietsub"
                };
            }
        }
    }

    var movies = [];
    for (var key in moviesMap) {
        if (moviesMap.hasOwnProperty(key)) {
            movies.push(moviesMap[key]);
        }
    }

    // Lấy số trang
    var totalPages = 1;
    var pagesMatch = html.match(/href="[^"]*page-(\d+)[^"]*"/g);
    if (!pagesMatch) pagesMatch = html.match(/page=(\d+)/g);
    if (pagesMatch) {
        for (var j = 0; j < pagesMatch.length; j++) {
            var pMatch = pagesMatch[j].match(/page-(\d+)/) || pagesMatch[j].match(/page=(\d+)/);
            if (pMatch) {
                var p = parseInt(pMatch[1]);
                if (p > totalPages) totalPages = p;
            }
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: 1,
            totalPages: totalPages || 1,
            totalItems: movies.length,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

var PluginUtils = {
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
    }
};
