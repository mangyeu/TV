function getManifest() {
    return JSON.stringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "baseUrl": https://clbphimxua.info,
        "iconUrl": https://raw.githubusercontent.com/mangyeu/TV/refs/heads/main/dmo/clbphimxua-logo.ico,
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "embed",
        "layoutType": "VERTICAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        {"slug": "phim-bo",title": "Phim Bộ Mới","type": "LIST","path": "/phim-bo"},
        {"slug": "phim-le","title": "Phim Lẻ Mới","type": "LIST","path": "/phim-le"},
        {"slug": "hoat-hinh","title": "Phim Hoạt Họa","type": "LIST","path": "/hoat-hinh"},
        {"slug": "kiem-hiep","title": "Kiếm Hiệp - Cổ Trang","type": "LIST","path": "/kiem-hiep"},
        {"slug": "tinh-cam","title": "Phim Tình Cảm","type": "LIST","path": "/tinh-cam"}
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "phim-bo", "name": "Phim Bộ" },
        { "slug": "phim-le", "name": "Phim Lẻ" },
        { "slug": "kiem-hiep", "name": "Kiếm Hiệp" },
        { "slug": "tvb", "name": "Phim TVB" },
        { "slug": "hoat-hinh", "name": "Hoạt Hình - Anime" },
        { "slug": "kinh-di", "name": "Kinh Dị" },
        { "slug": "phim-han", "name": "Phim Hàn" },
        { "slug": "phim-tay", "name": "Phim Tây" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { value: "newest", label: "Mới cập nhật" },
            { value: "year", label: "Năm phát hành" },
            { value: "views", label: "Xem nhiều nhất" }
        ],
        categories: [
            { value: "phim-bo", label: "Phim Bộ" },
            { value: "phim-le", label: "Phim Lẻ" },
            { value: "kiem-hiep", label: "Kiếm Hiệp" },
            { value: "tvb", label: "Phim TVB" },
            { value: "hoat-hinh", label: "Hoạt Hình - Anime" },
            { value: "kinh-di", label: "Kinh Dị" },
            { value: "co-trang", label: "Cổ Trang" },
            { value: "hanh-dong", label: "Hành Động" },
            { value: "tinh-cam", label: "Tình Cảm" },
            { value: "hai-huoc", label: "Hài Hước" }
        ],
        countries: [
            { value: "hong-kong", label: "Hồng Kông (TVB)" },
            { value: "trung-quoc", label: "Trung Quốc" },
            { value: "han-quoc", label: "Hàn Quốc" },
            { value: "au-my", label: "Âu Mỹ (Phim Tây)" },
            { value: "nhat-ban", label: "Nhật Bản" },
            { value: "dai-loan", label: "Đài Loan" },
            { value: "thai-lan", label: "Thái Lan" }
        ],
        years: [
            { value: "2020s", label: "Thập niên 2020s" },
            { value: "2010s", label: "Thập niên 2010s" },
            { value: "2000s", label: "Thập niên 2000s" },
            { value: "1990s", label: "Thập niên 90s" },
            { value: "1980s", label: "Thập niên 80s" },
            { value: "1970s", label: "Thập niên 70s" }
        ]
    });
}
