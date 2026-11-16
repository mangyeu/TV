function getManifest() {
    return JSON.stringify({
        "id": "clbpx",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "baseUrl": "https://clbphimxua.com",
        "iconUrl": "https://raw.githubusercontent.com/mangyeu/TV/refs/heads/main/dmo/clbphimxua-logo.ico",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "embed",
        "layoutType": "VERTICAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-hk-tk', title: 'Phim Châu Á', type: 'Horizontal', path: 'category' },
        { slug: 'phim-bo-kiem-hiep-co-trang', title: 'Kiếm Hiệp Cô Trang', type: 'Horizontal', path: 'category' },
        { slug: 'tien-hiep-ngon-tinh', title: 'Tiên Hiệp - Thần Thoại', type: 'Horizontal', path: 'category' },
        { slug: 'ma-kinh-di', title: 'Phim Ma - Kinh Dị', type: 'Horizontal', path: 'category' },
        { slug: 'thap-nien-90', title: 'Ký Ức Thập Niên 90', type: 'Horizontal', path: 'category' },
        { slug: 'home', title: 'Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Kiếm Hiệp', slug: 'phim-bo-kiem-hiep-co-trang' },
        { name: 'Tiên Hiệp', slug: 'tien-hiep-ngon-tinh' },
        { name: 'Tâm Lý', slug: 'tlhd' },
        { name: 'Ma Kinh Dị', slug: 'ma-kinh-di' },
        { name: 'Điện Ảnh Châu Á', slug: 'phim-hk-tk' },
        { name: 'Điện Ảnh Âu Mỹ', slug: 'dien-anh-tay' },
        { name: 'Hàn Quốc', slug: 'drama-hq-nb' },
        { name: 'Anime', slug: 'phim-hoat-hinh' },
        { name: 'TV Series', slug: 'phim-tv' },
        { name: 'Thập Niên 60', slug: 'thap-nien-60' },
        { name: 'Thập Niên 70', slug: 'thap-nien-70' },
        { name: 'Thập Niên 80', slug: 'thap-nien-80' },
        { name: 'Thập Niên 90', slug: 'thap-nien-90' },
        { name: 'Thập Niên 2000', slug: 'thap-nien-2000' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Cũ nhất', value: 'oldest' },
            { name: 'Mới nhất', value: 'newest' }
        ]
    });
}

