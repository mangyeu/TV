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
        "type": "MOVIE",
        "playerType": "embedtoexoplay"
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
