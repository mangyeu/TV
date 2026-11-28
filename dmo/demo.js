// =============================================================================
// VAAPP Plugin - AVDBAPI Adapter (kèm Dữ liệu mẫu / Mock Data)
// =============================================================================

var AVDB_BASE_URL = "https://avdbapi.com";
var AVDB_API_ENDPOINT = "https://avdbapi.com/api.php/provide/vod/";

// Dữ liệu mẫu chuẩn cấu trúc AVDBAPI để test khi cần
var MOCK_AVDB_RESPONSE = JSON.stringify({
    code: 1,
    msg: "success",
    page: 1,
    pagecount: 2,
    limit: 20,
    total: 25,
    list: [
        {
            vod_id: 10001,
            vod_name: "Chiến Binh Mùa Đông",
            vod_sub: "The Winter Soldier",
            vod_slug: "chien-binh-mua-dong",
            type_name: "Phim Lẻ",
            vod_pic: "https://example.com/images/thumb-10001.jpg",
            vod_year: "2024",
            vod_remarks: "Full Vietsub",
            vod_time: "2026-11-20 10:00:00",
            vod_content: "Nhiệm vụ bí mật trong mùa đông khắc nghiệt...",
            vod_actor: "Diễn viên A, Diễn viên B",
            vod_director: "Đạo diễn X",
            vod_play_from: "Server VIP$$$Server Dự Phòng",
            vod_play_url: "Full$https://cdn.example.com/hls/10001/index.m3u8#Tập 2$https://cdn.example.com/hls/10001/ep2.m3u8$$$Full$https://player.example.com/embed/10001"
        },
        {
            vod_id: 10002,
            vod_name: "Bí Mật Rừng Sâu",
            vod_sub: "Secret of the Forest",
            vod_slug: "bi-mat-rung-sau",
            type_name: "Phim Bộ",
            vod_pic: "https://example.com/images/thumb-10002.jpg",
            vod_year: "2025",
            vod_remarks: "Tập 2/12",
            vod_time: "2026-11-25 18:30:00",
            vod_content: "Hành trình khám phá những bí ẩn trong khu rừng cổ...",
            vod_actor: "Diễn viên C, Diễn viên D",
            vod_director: "Đạo diễn Y",
            vod_play_from: "Server HD",
            vod_play_url: "Tập 1$https://cdn.example.com/hls/10002/ep1.m3u8#Tập 2$https://cdn.example.com/hls/10002/ep2.m3u8"
        }
    ]
});

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdb_source",
        "name": "AVDB Nguồn Phim",
        "version": "1.0.0",
        "baseUrl": AVDB_BASE_URL,
        "iconUrl": "https://avdbapi.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "moi-cap-nhat", title: "Mới Cập Nhật", type: "Horizontal", path: "" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Hài Hước", slug: "hai-huoc" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { label: "Mới cập nhật", value: "new" },
            { label: "24 giờ qua", value: "24h" }
        ],
        category: [
            { label: "Tất cả", value: "" },
            { label: "Hành Động", value: "hanh-dong" },
            { label: "Kinh Dị", value: "kinh-di" }
        ]
    });
}

// =============================================================================
// NHÓM 2: SINH URL (AVDBAPI chuẩn AppleCMS/VOD query params)
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = filters.page || 1;
    var params = ["ac=detail", "pg=" + encodeURIComponent(page)];

    if (filters.category) {
        params.push("t=" + encodeURIComponent(filters.category));
    } else if (slug && slug !== "moi-cap-nhat") {
        params.push("t=" + encodeURIComponent(slug));
    }

    if (filters.sort === "24h") {
        params.push("h=24");
    }

    return AVDB_API_ENDPOINT + "?" + params.join("&");
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = filters.page || 1;
    return AVDB_API_ENDPOINT + "?ac=detail&wd=" + encodeURIComponent(keyword || "") + "&pg=" + encodeURIComponent(page);
}

function getUrlDetail(slug) {
    // Hỗ trợ truyền vào vod_id hoặc slug (nếu là số thì gọi ids=, ngược lại tìm theo wd=)
    if (/^\d+$/.test(String(slug))) {
        return AVDB_API_ENDPOINT + "?ac=detail&ids=" + encodeURIComponent(slug);
    }
    return AVDB_API_ENDPOINT + "?ac=detail&wd=" + encodeURIComponent(slug);
}

function getUrlCategories() {
    return AVDB_API_ENDPOINT + "?ac=list";
}

function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER
// =============================================================================

/**
 * Tách chuỗi play_from và play_url của AVDBAPI thành mảng servers chuẩn
 * Định dạng AVDBAPI:
 *   vod_play_from: "Server 1$$$Server 2"
 *   vod_play_url:  "Tập 1$url1#Tập 2$url2$$$Full$url3"
 */
function _parseAvdbServers(item) {
    var servers = [];
    var fromStr = item.vod_play_from || "Default";
    var urlStr = item.vod_play_url || "";

    var serverNames = fromStr.split("$$$");
    var serverGroups = urlStr.split("$$$");

    for (var i = 0; i < serverGroups.length; i++) {
        var groupRaw = serverGroups[i];
        if (!groupRaw) continue;

        var sName = (serverNames[i] && serverNames[i].trim()) ? serverNames[i].trim() : ("Server " + (i + 1));
        var episodes = [];
        var epList = groupRaw.split("#");

        for (var j = 0; j < epList.length; j++) {
            var epRaw = epList[j];
            if (!epRaw) continue;

            var parts = epRaw.split("$");
            var epName = parts.length > 1 ? parts[0].trim() : ("Tập " + (j + 1));
            var epUrl = parts.length > 1 ? parts[1].trim() : parts[0].trim();

            if (epUrl) {
                episodes.push({
                    id: epUrl, // App sẽ dùng trực tiếp URL .m3u8/.mp4 hoặc embed để phát
                    name: epName,
                    slug: epName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + (j + 1)
                });
            }
        }

        if (episodes.length > 0) {
            servers.push({
                name: sName,
                episodes: episodes
            });
        }
    }

    return servers;
}

function _stripHtml(htmlStr) {
    if (!htmlStr) return "";
    return String(htmlStr).replace(/<[^>]*>/g, "").trim();
}

function parseListResponse(rawText) {
    try {
        var text = (rawText && rawText.trim()) ? rawText : MOCK_AVDB_RESPONSE;
        var data = JSON.parse(text);
        var rawList = data.list || data.items || [];
        var items = [];

        for (var i = 0; i < rawList.length; i++) {
            var m = rawList[i];
            var itemId = String(m.vod_id || m.id || m.vod_slug || m.slug || i);
            items.push({
                id: itemId,
                title: m.vod_name || m.name || "Không có tiêu đề",
                posterUrl: m.vod_pic || m.thumb_url || "",
                subtitle: m.vod_remarks || m.vod_year || "",
                rawDetail: JSON.stringify(m) // Lưu sẵn object gốc nếu cần dùng nhanh
            });
        }

        var currentPage = parseInt(data.page || data.currentPage || 1, 10) || 1;
        var totalPages = parseInt(data.pagecount || data.totalPages || 1, 10) || 1;

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages
            }
        });
    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }
}

function parseSearchResponse(rawText) {
    return parseListResponse(rawText);
}

function parseMovieDetail(rawText) {
    try {
        var text = (rawText && rawText.trim()) ? rawText : MOCK_AVDB_RESPONSE;
        var data = JSON.parse(text);
        var m = null;

        if (data.list && data.list.length > 0) {
            m = data.list[0];
        } else if (data.data) {
            m = data.data;
        } else {
            m = data;
        }

        var servers = _parseAvdbServers(m);

        return JSON.stringify({
            id: String(m.vod_id || m.id || m.vod_slug || ""),
            title: m.vod_name || m.name || "Tên phim",
            posterUrl: m.vod_pic || m.thumb_url || "",
            backdropUrl: m.vod_pic_slide || m.poster_url || m.vod_pic || "",
            description: _stripHtml(m.vod_content || m.content || ""),
            servers: servers,
            quality: m.vod_remarks || m.quality || "HD",
            year: parseInt(m.vod_year || m.year || 0, 10) || 0,
            rating: parseFloat(m.vod_score || 0) || 0,
            status: m.vod_remarks || m.status || "",
            duration: m.vod_duration || m.time || "",
            casts: m.vod_actor || "",
            director: m.vod_director || "",
            category: m.type_name || ""
        });
    } catch (e) {
        return JSON.stringify({
            id: "",
            title: "",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: []
        });
    }
}

function parseDetailResponse(rawInput) {
    if (!rawInput) {
        return JSON.stringify({ url: "", headers: {}, subtitles: [] });
    }

    var trimmed = String(rawInput).trim();

    // Nếu rawInput chính là URL stream hoặc embed truyền thẳng vào
    if (/^https?:\/\//i.test(trimmed)) {
        var isHls = trimmed.indexOf(".m3u8") !== -1;
        var isMp4 = trimmed.indexOf(".mp4") !== -1;
        var result = {
            url: trimmed,
            headers: {
                "Referer": AVDB_BASE_URL + "/",
                "User-Agent": "Mozilla/5.0"
            },
            subtitles: []
        };
        if (isHls) {
            result.mimeType = "application/x-mpegURL";
        } else if (isMp4) {
            result.mimeType = "video/mp4";
        }
        return JSON.stringify(result);
    }

    // Nếu là JSON response từ API chi tiết
    try {
        var parsed = JSON.parse(trimmed);
        var detailObj = JSON.parse(parseMovieDetail(trimmed));
        if (detailObj.servers && detailObj.servers.length > 0 && detailObj.servers[0].episodes.length > 0) {
            var firstEpUrl = detailObj.servers[0].episodes[0].id;
            return parseDetailResponse(firstEpUrl);
        }
        if (parsed.url) {
            return JSON.stringify({
                url: parsed.url,
                headers: { "Referer": AVDB_BASE_URL + "/" },
                subtitles: []
            });
        }
    } catch (e) {
        // Không phải JSON
    }

    return JSON.stringify({ url: "", headers: {}, subtitles: [] });
}

function parseEmbedResponse(html, sourceUrl) {
    if (!html) {
        return JSON.stringify({ url: "", isEmbed: false });
    }

    var m3u8Match = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i);
    if (m3u8Match) {
        return JSON.stringify({
            url: m3u8Match[1],
            isEmbed: false,
            mimeType: "application/x-mpegURL",
            headers: { "Referer": sourceUrl || (AVDB_BASE_URL + "/") }
        });
    }

    var mp4Match = html.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/i);
    if (mp4Match) {
        return JSON.stringify({
            url: mp4Match[1],
            isEmbed: false,
            mimeType: "video/mp4",
            headers: { "Referer": sourceUrl || (AVDB_BASE_URL + "/") }
        });
    }

    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(rawText) {
    try {
        var data = JSON.parse(rawText || "{}");
        var cats = data.class || [];
        var mapped = [];
        for (var i = 0; i < cats.length; i++) {
            mapped.push({
                id: String(cats[i].type_id || i),
                name: cats[i].type_name || "",
                slug: String(cats[i].type_id || i)
            });
        }
        return JSON.stringify(mapped);
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
