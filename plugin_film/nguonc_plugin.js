// =============================================================================
// VAAPP Plugin - NguonC New (Hoàn chỉnh theo plugin_template.js)
// =============================================================================

var BASE_URL = "https://phim.nguonc.com";
var API_BASE = "https://phim.nguonc.com/api";

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguonc_new_plugin",
        "name": "NguồnC New",
        "version": "1.0.2",
        "baseUrl": BASE_URL,
        "iconUrl": "https://phim.nguonc.com/favicon.ico",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Horizontal", path: "" },
        { slug: "phim-le", title: "Phim Lẻ Mới", type: "Horizontal", path: "" },
        { slug: "phim-bo", title: "Phim Bộ Mới", type: "Horizontal", path: "" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "" },
        { slug: "tv-shows", title: "TV Shows", type: "Horizontal", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "Hài Hước", slug: "hai-huoc" },
        { name: "Hình Sự", slug: "hinh-su" },
        { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Chính Kịch", slug: "chinh-kich" },
        { name: "Gia Đình", slug: "gia-dinh" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Bí Ẩn", slug: "bi-an" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Khoa Học Viễn Tưởng", slug: "khoa-hoc-vien-tuong" },
        { name: "Thần Thoại", slug: "than-thoai" },
        { name: "Cổ Trang", slug: "co-trang" },
        { name: "Chiến Tranh", slug: "chien-tranh" },
        { name: "Tâm Lý", slug: "tam-ly" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới cập nhật", value: "latest" },
            { name: "Năm sản xuất", value: "year" }
        ],
        category: []
    });
}

// =============================================================================
// NHÓM 2: SINH URL (App gọi hàm → nhận URL → tự fetch HTTP)
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = filters.page || 1;
    var targetSlug = String(slug || "phim-moi-cap-nhat").trim();

    var url = "";
    if (targetSlug === "phim-moi-cap-nhat") {
        url = API_BASE + "/films/phim-moi-cap-nhat?page=" + page;
    } else {
        url = API_BASE + "/films/danh-sach/" + encodeURIComponent(targetSlug) + "?page=" + page;
    }

    if (filters.category) {
        url += "&category=" + encodeURIComponent(filters.category);
    }
    if (filters.country) {
        url += "&country=" + encodeURIComponent(filters.country);
    }
    if (filters.year) {
        url += "&year=" + encodeURIComponent(filters.year);
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = filters.page || 1;
    var q = String(keyword || "").trim();
    return API_BASE + "/films/search?keyword=" + encodeURIComponent(q) + "&page=" + page;
}

function getUrlDetail(slugOrId) {
    var raw = String(slugOrId || "").trim();
    if (!raw) return "";

    // Nếu App truyền vào URL stream/embed trực tiếp để resolve ở parseDetailResponse
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
        return raw;
    }

    var cleanSlug = raw.replace(/^\/+|\/+$/g, "");
    return API_BASE + "/film/" + encodeURIComponent(cleanSlug);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER (App fetch URL xong → ném HTML/JSON thô vào đây → parse)
// =============================================================================

function _normalizeUrl(url) {
    if (!url) return "";
    var u = String(url).trim();
    if (!u) return "";
    if (u.indexOf("//") === 0) return "https:" + u;
    if (u.indexOf("http://") !== 0 && u.indexOf("https://") !== 0) {
        return BASE_URL + (u.charAt(0) === "/" ? "" : "/") + u;
    }
    return u;
}

function _stripHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/<[^>]*>/g, " ")
        .replace(/ /gi, " ")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function parseListResponse(html) {
    try {
        var data = JSON.parse(html);
        var rawItems = data.items || data.data || [];
        var items = [];

        if (Array.isArray(rawItems)) {
            for (var i = 0; i < rawItems.length; i++) {
                var item = rawItems[i] || {};
                var slug = item.slug || item.id || "";
                var title = _stripHtml(item.name || item.title || "");
                var poster = _normalizeUrl(item.thumb_url || item.poster_url || item.thumb || "");

                if (slug && title) {
                    items.push({
                        id: String(slug),
                        slug: String(slug),
                        title: title,
                        posterUrl: poster,
                        quality: item.quality || "",
                        status: item.current_episode || item.episode_current || ""
                    });
                }
            }
        }

        var paginate = data.paginate || data.pagination || {};
        var currentPage = Number(paginate.current_page || paginate.currentPage || 1) || 1;
        var totalPages = Number(paginate.total_page || paginate.totalPages || 1) || 1;

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

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function _extractMetaFromCategoryObject(categoryObj) {
    var result = {
        categories: [],
        countries: [],
        year: 0
    };

    if (!categoryObj || typeof categoryObj !== "object") {
        return result;
    }

    var keys = Object.keys(categoryObj);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var group = categoryObj[key];
        if (!group) continue;

        var groupName = String(group.group_name || group.name || "").toLowerCase();
        var list = Array.isArray(group.list) ? group.list : [];

        for (var j = 0; j < list.length; j++) {
            var entry = list[j] || {};
            var entryName = _stripHtml(entry.name || "");
            if (!entryName) continue;

            if (key === "1" || groupName.indexOf("thể loại") !== -1 || groupName.indexOf("category") !== -1) {
                result.categories.push(entryName);
            } else if (key === "2" || groupName.indexOf("quốc gia") !== -1 || groupName.indexOf("country") !== -1) {
                result.countries.push(entryName);
            } else if (key === "3" || groupName.indexOf("năm") !== -1 || groupName.indexOf("year") !== -1) {
                if (!result.year) {
                    var parsedYear = parseInt(entryName, 10);
                    if (!isNaN(parsedYear)) result.year = parsedYear;
                }
            }
        }
    }

    return result;
}

function parseMovieDetail(html) {
    try {
        var root = JSON.parse(html);
        var movie = root.movie || root.data || root || {};
        var servers = [];

        var rawEpisodes = movie.episodes;

        // Dạng Object: { "Full HD": { server_name: "...", items: [...] } }
        if (rawEpisodes && !Array.isArray(rawEpisodes) && typeof rawEpisodes === "object") {
            var srvKeys = Object.keys(rawEpisodes);
            for (var k = 0; k < srvKeys.length; k++) {
                var srvKey = srvKeys[k];
                var srvObj = rawEpisodes[srvKey] || {};
                var rawList = srvObj.items || srvObj.server_data || [];
                var epItems = [];

                if (Array.isArray(rawList)) {
                    for (var j = 0; j < rawList.length; j++) {
                        var ep = rawList[j] || {};
                        var streamLink = ep.m3u8 || ep.link_m3u8 || ep.embed || ep.link_embed || "";
                        var epId = streamLink ? _normalizeUrl(streamLink) : (ep.slug || String(j + 1));

                        epItems.push({
                            id: String(epId),
                            name: _stripHtml(ep.name || ("Tập " + (j + 1))),
                            slug: String(ep.slug || ("tap-" + (j + 1)))
                        });
                    }
                }

                if (epItems.length > 0) {
                    servers.push({
                        name: _stripHtml(srvObj.server_name || srvKey || ("Server " + (k + 1))),
                        episodes: epItems
                    });
                }
            }
        } else if (Array.isArray(rawEpisodes)) {
            // Dạng Array: [{ server_name: "...", server_data: [...] }]
            for (var s = 0; s < rawEpisodes.length; s++) {
                var srv = rawEpisodes[s] || {};
                var rawData = srv.server_data || srv.items || [];
                var eps = [];

                if (Array.isArray(rawData)) {
                    for (var e = 0; e < rawData.length; e++) {
                        var epItem = rawData[e] || {};
                        var link = epItem.link_m3u8 || epItem.m3u8 || epItem.link_embed || epItem.embed || "";
                        var resolvedId = link ? _normalizeUrl(link) : (epItem.slug || String(e + 1));

                        eps.push({
                            id: String(resolvedId),
                            name: _stripHtml(epItem.name || ("Tập " + (e + 1))),
                            slug: String(epItem.slug || ("tap-" + (e + 1)))
                        });
                    }
                }

                if (eps.length > 0) {
                    servers.push({
                        name: _stripHtml(srv.server_name || srv.name || ("Server " + (s + 1))),
                        episodes: eps
                    });
                }
            }
        }

        var meta = _extractMetaFromCategoryObject(movie.category);
        var categoryText = meta.categories.length > 0
            ? meta.categories.join(", ")
            : (typeof movie.category === "string" ? _stripHtml(movie.category) : "");

        var yearValue = meta.year || parseInt(movie.year, 10) || 0;
        var posterUrl = _normalizeUrl(movie.thumb_url || movie.poster_url || "");
        var backdropUrl = _normalizeUrl(movie.poster_url || movie.thumb_url || "");

        return JSON.stringify({
            id: String(movie.slug || ""),
            title: _stripHtml(movie.name || movie.title || ""),
            posterUrl: posterUrl,
            backdropUrl: backdropUrl,
            description: _stripHtml(movie.description || movie.content || ""),
            servers: servers,
            quality: movie.quality || "HD",
            year: yearValue,
            rating: Number(movie.rating) || 0,
            status: _stripHtml(movie.current_episode || movie.status || ""),
            duration: _stripHtml(movie.time || ""),
            casts: _stripHtml(movie.casts || movie.actor || ""),
            director: _stripHtml(movie.director || ""),
            category: categoryText
        });
    } catch (e) {
        return JSON.stringify({
            id: "",
            title: "",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: [],
            quality: "",
            year: 0,
            rating: 0,
            status: "",
            duration: "",
            casts: "",
            director: "",
            category: ""
        });
    }
}

function parseDetailResponse(html) {
    try {
        var raw = String(html || "").trim();
        if (!raw) {
            return JSON.stringify({ url: "", headers: { "Referer": BASE_URL + "/" }, subtitles: [] });
        }

        var finalUrl = "";
        var mimeType = "";

        if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
            finalUrl = raw;
        } else if (raw.charAt(0) === "{") {
            var obj = JSON.parse(raw);
            finalUrl = obj.url || obj.link_m3u8 || obj.m3u8 || obj.link_embed || obj.embed || "";
            mimeType = obj.mimeType || "";
        } else {
            // Fallback nếu response là HTML có nhúng m3u8/mp4
            var m3u8Match = raw.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i);
            var mp4Match = raw.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/i);
            if (m3u8Match) {
                finalUrl = m3u8Match[1];
            } else if (mp4Match) {
                finalUrl = mp4Match[1];
            }
        }

        finalUrl = _normalizeUrl(finalUrl);

        if (!mimeType && finalUrl) {
            if (finalUrl.indexOf(".m3u8") !== -1) {
                mimeType = "application/x-mpegURL";
            } else if (finalUrl.indexOf(".mp4") !== -1) {
                mimeType = "video/mp4";
            }
        }

        var result = {
            url: finalUrl,
            headers: {
                "Referer": BASE_URL + "/"
            },
            subtitles: []
        };

        if (mimeType) {
            result.mimeType = mimeType;
        }

        return JSON.stringify(result);
    } catch (e) {
        return JSON.stringify({
            url: "",
            headers: { "Referer": BASE_URL + "/" },
            subtitles: []
        });
    }
}

function parseEmbedResponse(html, sourceUrl) {
    try {
        var raw = String(html || "");
        var fileMatch = raw.match(/(https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4)[^\s"'<>]*)/i);
        if (fileMatch) {
            var streamUrl = fileMatch[1];
            return JSON.stringify({
                url: streamUrl,
                isEmbed: false,
                mimeType: streamUrl.indexOf(".m3u8") !== -1 ? "application/x-mpegURL" : "video/mp4",
                headers: {
                    "Referer": sourceUrl || (BASE_URL + "/")
                }
            });
        }
        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false });
    }
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
