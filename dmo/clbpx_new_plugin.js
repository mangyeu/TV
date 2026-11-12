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
