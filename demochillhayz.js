function getManifest() {
    return JSON.stringify({
        "id": "chillPhim",
        "name": "chillPhim",
        "version": "0.0.1",
        "baseUrl": "https://chillhayz.pro",
        "iconUrl": "https://chillhayz.pro/assets/v1/images/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi-cap-nhat', title: 'phim-moi-cap-nhat', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi-cap-nhat' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' },
        { name: 'Phim vietsub', slug: 'phim-vietsub' },
        { name: 'Phim thuyết minh', slug: 'phim-thuyet-minh' },
        { name: 'Phim lồng tiếng', slug: 'phim-long-tieng' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Thời gian cập nhật', value: 'modified.time' },
            { name: 'Năm phát hành', value: 'year' },
            { name: 'Theo ID', value: '_id' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;

        // Slugs that belong to 'danh-sach'
        var listSlugs = ['phim-vietsub', 'phim-thuyet-minh', 'phim-long-tieng', 'phim-bo', 'phim-le', 'hoat-hinh', 'phim-chieu-rap', 'phim-moi-cap-nhat'];
        var basePath = listSlugs.indexOf(slug) !== -1 ? "danh-sach" : "the-loai";

        var typeList = slug;

        // Special handling for legacy slug
        if (typeList === 'phim-moi') typeList = 'phim-moi-cap-nhat';

        // Special handling for 'phim-moi-cap-nhat-v3' which uses a different base URL structure
        if (slug === 'phim-moi-cap-nhat-v3' || typeList === 'phim-moi-cap-nhat') {
            return "https://chillhayz.pro/danh-sach/phim-moi-cap-nhat?page=" + page;
        }

        var url = "https://chillhayz.pro/v1/api/" + basePath + "/" + typeList + "?page=" + page;

        // Query Params (Common for all endpoints)
        if (filters.limit) url += "&limit=" + filters.limit;
        else url += "&limit=24"; // Default limit

        if (filters.country) url += "&country=" + filters.country;
        if (filters.year) url += "&year=" + filters.year;
        if (filters.category) url += "&category=" + filters.category;

        if (filters.sort) url += "&sort_field=" + filters.sort;

        return url;
    } catch (e) {
        return "https://chillhayz.pro/v1/api/danh-sach/" + slug;
    }
}
