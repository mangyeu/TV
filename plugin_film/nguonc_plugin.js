// =============================================================================
// VAAPP Plugin - NguồnC (phim.nguonc.com)
// API: https://phim.nguonc.com/api/films/... (trả JSON)
// Phát phim: embed URL qua WebView (server embed chặn fetch trực tiếp)
// =============================================================================

var BASE = "https://phim.nguonc.com";

// Biến tạm lưu embed URL của tập đang xử lý
var __lastEmbedUrl = "";

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguonc",
        "name": "NguồnC",
        "version": "1.0.1",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://phim.nguonc.com/favicon.ico",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embed"   // Mọi link phát qua WebView
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Horizontal', path: '' },
        { slug: 'phim-le', title: 'Phim Lẻ Mới', type: 'Horizontal', path: '' },
        { slug: 'phim-bo', title: 'Phim Bộ Mới', type: 'Horizontal', path: '' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: '' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Hành Động', slug: 'the-loai/hanh-dong' },
        { name: 'Tình Cảm', slug: 'the-loai/tinh-cam' },
        { name: 'Hài Hước', slug: 'the-loai/hai-huoc' },
        { name: 'Kinh Dị', slug: 'the-loai/kinh-di' },
        { name: 'Viễn Tưởng', slug: 'the-loai/vien-tuong' },
        { name: 'Phiêu Lưu', slug: 'the-loai/phieu-luu' },
        { name: 'Hoạt Hình', slug: 'the-loai/hoat-hinh' },
        { name: 'Võ Thuật', slug: 'the-loai/vo-thuat' },
        { name: 'Thần Bí', slug: 'the-loai/than-bi' },
        { name: 'Cổ Trang', slug: 'the-loai/co-trang' },
        { name: 'Khoa Học', slug: 'the-loai/khoa-hoc' },
        { name: 'Tâm Lý', slug: 'the-loai/tam-ly' },
        { name: 'Chiến Tranh', slug: 'the-loai/chien-tranh' },
        { name: 'Tài Liệu', slug: 'the-loai/tai-lieu' },
        { name: 'Thể Thao', slug: 'the-loai/the-thao' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [
        { name: 'Hành Động', slug: 'the-loai/hanh-dong' },
        { name: 'Tình Cảm', slug: 'the-loai/tinh-cam' },
        { name: 'Kinh Dị', slug: 'the-loai/kinh-di' },
        { name: 'Viễn Tưởng', slug: 'the-loai/vien-tuong' },
        { name: 'Hoạt Hình', slug: 'the-loai/hoat-hinh' },
        { name: 'Cổ Trang', slug: 'the-loai/co-trang' },
        { name: 'Hài Hước', slug: 'the-loai/hai-huoc' }
    ]});
}

// =============================================================================
// NHÓM 2: SINH URL
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE + "/api/films/" + slug + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var page = JSON.parse(filtersJson || "{}").page || 1;
    return BASE + "/api/films/search?keyword=" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(id) {
    // id là embed URL của tập → trả về chính nó, lưu tạm để parseDetailResponse dùng
    if (id && id.indexOf("http") === 0) {
        __lastEmbedUrl = id;
        return id;
    }
    // id là slug phim → API chi tiết
    return BASE + "/api/film/" + id;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

function mapItem(item) {
    return {
        id: item.slug,
        title: item.name,
        originalTitle: item.original_name || "",
        posterUrl: item.poster_url || item.thumb_url || "",
        year: parseInt(item.year) || 0,
        quality: item.quality || "",
        language: item.language || "",
        currentEpisode: item.current_episode || "",
        totalEpisodes: item.total_episodes || 0
    };
}

function parseListResponse(html) {
    try {
        var data = JSON.parse(html);
        var items = [];
        if (data.items && data.items.length) {
            for (var i = 0; i < data.items.length; i++) {
                items.push(mapItem(data.items[i]));
            }
        }
        var paginate = data.paginate || {};
        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: paginate.current_page || 1,
                totalPages: paginate.total_page || 1,
                totalItems: paginate.total_items || items.length
            }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var data = JSON.parse(html);
        var movie = data.movie || {};
        __lastEmbedUrl = "";

        var servers = [];
        var eps = movie.episodes || [];
        for (var s = 0; s < eps.length; s++) {
            var server = eps[s];
            var episodes = [];
            var items = server.items || [];
            for (var i = 0; i < items.length; i++) {
                var ep = items[i];
                episodes.push({
                    id: ep.embed || "",      // embed URL → App gọi getUrlDetail(id)
                    name: ep.name || ("Tập " + (i + 1)),
                    slug: ep.slug || ""
                });
            }
            if (episodes.length > 0) {
                servers.push({
                    name: server.server_name || ("Server " + (s + 1)),
                    episodes: episodes
                });
            }
        }

        var cats = [];
        var groups = movie.category || [];
        for (var g = 0; g < groups.length; g++) {
            var list = groups[g].list || [];
            for (var l = 0; l < list.length; l++) {
                if (list[l] && list[l].name) cats.push(list[l].name);
            }
        }

        var desc = (movie.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

        var status = "Đang chiếu";
        if (movie.current_episode && movie.current_episode.indexOf("Hoàn tất") !== -1) {
            status = "Full";
        }

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            originalTitle: movie.original_name || "",
            posterUrl: movie.poster_url || movie.thumb_url || "",
            backdropUrl: movie.thumb_url || "",
            description: desc,
            servers: servers,
            quality: movie.quality || "",
            year: parseInt(movie.year) || 0,
            status: status,
            duration: movie.time || "",
            casts: movie.casts || "",
            director: movie.director || "",
            category: cats.join(", "),
            language: movie.language || "",
            totalEpisodes: movie.total_episodes || 0,
            currentEpisode: movie.current_episode || ""
        });
    } catch (e) {
        return JSON.stringify({
            id: "", title: "", posterUrl: "", backdropUrl: "", description: "",
            servers: []
        });
    }
}

function parseDetailResponse(html) {
    try {
        // Server embed chặn fetch từ App (không trả HTML hữu ích),
        // nên bỏ qua nội dung fetch và trả embed URL để WebView tự tải.
        // Referer = trang gốc nguonc.com để vượt kiểm tra nguồn của server embed.
        if (__lastEmbedUrl) {
            return JSON.stringify({
                url: __lastEmbedUrl,
                isEmbed: false,
                headers: {
                    "Referer": "https://phim.nguonc.com/",
                    "Origin": "https://phim.nguonc.com"
                },
                subtitles: []
            });
        }
        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false });
    }
}

function parseEmbedResponse(html, sourceUrl) {
    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
