// =============================================================================
// VAAPP PLUGIN - NGUON C (https://phim.nguonc.com)
// =============================================================================

var BASE_URL = "https://phim.nguonc.com";
var API_BASE = "https://phim.nguonc.com/api";

function getManifest() {
    return JSON.stringify({
        "id": "nguonc_phim",
        "name": "Nguồn C",
        "version": "1.1.0",
        "description": "Phim Vietsub, Thuyết minh, Lồng tiếng từ Nguồn C",
        "author": "VAAPP",
        "baseUrl": BASE_URL,
        "referrer": BASE_URL + "/",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embedtoexoplay",
        "adblock": true,
        "debug": false
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Horizontal", path: "" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "" },
        { slug: "hoat-hinh", title: "Hoạt Hình / Anime", type: "Horizontal", path: "" },
        { slug: "tv-shows", title: "TV Shows", type: "Horizontal", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim Mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim Lẻ", slug: "phim-le" },
        { name: "Phim Bộ", slug: "phim-bo" },
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "TV Shows", slug: "tv-shows" },
        { name: "Phim Đang Chiếu", slug: "phim-dang-chieu" },
        { name: "Phim Chiếu Rạp", slug: "phim-chieu-rap" },
        { name: "Subteam", slug: "subteam" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        filters: [
            {
                key: "page",
                name: "Trang",
                type: "number",
                defaultValue: 1,
                options: []
            },
            {
                key: "category",
                name: "Danh mục",
                type: "select",
                defaultValue: "phim-moi-cap-nhat",
                options: [
                    { name: "Phim Mới Cập Nhật", slug: "phim-moi-cap-nhat" },
                    { name: "Phim Lẻ", slug: "phim-le" },
                    { name: "Phim Bộ", slug: "phim-bo" },
                    { name: "Hoạt Hình", slug: "hoat-hinh" },
                    { name: "TV Shows", slug: "tv-shows" },
                    { name: "Phim Đang Chiếu", slug: "phim-dang-chieu" },
                    { name: "Phim Chiếu Rạp", slug: "phim-chieu-rap" },
                    { name: "Subteam", slug: "subteam" }
                ]
            }
        ]
    });
}

function _parsePage(filtersJson) {
    var page = 1;
    try {
        if (filtersJson) {
            var f = typeof filtersJson === "string" ? JSON.parse(filtersJson) : filtersJson;
            if (f && f.page) {
                var p = parseInt(f.page, 10);
                if (!isNaN(p) && p > 0) page = p;
            }
        }
    } catch (e) {}
    return page;
}

function _stripPipe(raw) {
    if (!raw) return "";
    return String(raw).split("|")[0].trim();
}

function _getPipeData(raw, datasend) {
    if (datasend) return datasend;
    if (!raw) return "";
    var str = String(raw);
    var idx = str.indexOf("|");
    if (idx < 0) return "";
    var s = str.substring(idx + 1).replace(/^\s+/, "");
    if (s.toLowerCase().indexOf("data:") === 0) {
        s = s.substring(5);
    }
    return s;
}

function getUrlList(slug, filtersJson) {
    var page = _parsePage(filtersJson);
    var cleanSlug = _stripPipe(slug || "phim-moi-cap-nhat");

    if (!cleanSlug) cleanSlug = "phim-moi-cap-nhat";
    if (cleanSlug.indexOf("http") === 0) {
        return cleanSlug + (cleanSlug.indexOf("?") >= 0 ? "&" : "?") + "page=" + page;
    }
    if (cleanSlug.indexOf("/") === 0) {
        cleanSlug = cleanSlug.substring(1);
    }
    if (cleanSlug.indexOf("api/films/") === 0) {
        return BASE_URL + "/" + cleanSlug + (cleanSlug.indexOf("?") >= 0 ? "&" : "?") + "page=" + page;
    }
    if (cleanSlug.indexOf("films/") === 0) {
        return API_BASE + "/" + cleanSlug + (cleanSlug.indexOf("?") >= 0 ? "&" : "?") + "page=" + page;
    }
    return API_BASE + "/films/" + cleanSlug + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var page = _parsePage(filtersJson);
    var kw = encodeURIComponent(String(keyword || "").trim());
    return API_BASE + "/films/search?keyword=" + kw + "&page=" + page;
}

function getUrlDetail(slug, datasend) {
    var cleanSlug = _stripPipe(slug || "");

    if (datasend) {
        try {
            var epObj = JSON.parse(decodeURIComponent(datasend));
            if (epObj && (epObj.embed || epObj.m3u8)) {
                return epObj.embed || epObj.m3u8;
            }
        } catch (e) {
            try {
                var epObj2 = JSON.parse(datasend);
                if (epObj2 && (epObj2.embed || epObj2.m3u8)) {
                    return epObj2.embed || epObj2.m3u8;
                }
            } catch (e2) {}
        }
    }

    if (cleanSlug.indexOf("http") === 0) {
        return cleanSlug;
    }
    if (cleanSlug.indexOf("api/film/") === 0) {
        return BASE_URL + "/" + cleanSlug;
    }
    if (cleanSlug.indexOf("film/") === 0) {
        return API_BASE + "/" + cleanSlug;
    }
    return API_BASE + "/film/" + cleanSlug;
}

function _parseFilmsList(html, apiUrl) {
    var items = [];
    var pagination = { currentPage: 1, totalPages: 1 };

    try {
        if (!html) {
            return JSON.stringify({ items: items, pagination: pagination });
        }

        var json = typeof html === "string" ? JSON.parse(html) : html;
        if (json && json.status && String(json.status).toLowerCase() !== "success") {
            return JSON.stringify({ items: items, pagination: pagination });
        }

        var list = [];
        if (Array.isArray(json)) {
            list = json;
        } else if (json && typeof json === "object") {
            list = json.items || json.data || json.films || [];
        }

        if (json && json.paginate && typeof json.paginate === "object") {
            pagination.currentPage = parseInt(json.paginate.current_page, 10) || 1;
            pagination.totalPages = parseInt(json.paginate.total_page, 10) || 1;
            if (json.paginate.total_items !== undefined) {
                pagination.totalItems = parseInt(json.paginate.total_items, 10) || list.length;
            }
            if (json.paginate.items_per_page !== undefined) {
                pagination.itemsPerPage = parseInt(json.paginate.items_per_page, 10) || list.length;
            }
        }

        for (var i = 0; i < list.length; i++) {
            var m = list[i] || {};
            var slug = m.slug || (m.id !== undefined && m.id !== null ? String(m.id) : "");
            var title = m.name || m.title || m.original_name || "";
            if (!slug && !title) continue;

            var poster = m.thumb_url || m.poster_url || m.poster || m.image || "";
            var backdrop = m.poster_url || m.thumb_url || "";

            var year = 0;
            if (m.category && typeof m.category === "object") {
                for (var k in m.category) {
                    var grp = m.category[k];
                    if (grp && grp.list && grp.list.length > 0) {
                        var yNum = parseInt(grp.list[0].name, 10);
                        if (yNum >= 1900 && yNum <= 2100) {
                            year = yNum;
                            break;
                        }
                    }
                }
            }

            var itemObj = {
                id: slug,
                title: title,
                posterUrl: poster,
                backdropUrl: backdrop,
                description: m.original_name || m.description || "",
                quality: m.quality || "",
                episode_current: m.current_episode || m.episode_current || "",
                lang: m.language || m.lang || ""
            };
            if (year > 0) itemObj.year = year;

            items.push(itemObj);
        }
    } catch (e) {
        console.error("Lỗi parseListResponse NguonC:", e && e.message ? e.message : e);
    }

    return JSON.stringify({
        items: items,
        pagination: pagination
    });
}

function parseListResponse(html, apiUrl) {
    return _parseFilmsList(html, apiUrl);
}

function parseSearchResponse(html, apiUrl) {
    return _parseFilmsList(html, apiUrl);
}

function parseMovieDetail(html, apiUrl, datasend) {
    var cleanUrl = _stripPipe(apiUrl || "");
    var fallbackSlug = cleanUrl.split("/").pop() || "";

    try {
        var json = typeof html === "string" ? JSON.parse(html) : html;
        var film = (json && (json.movie || json.data)) ? (json.movie || json.data) : (json || {});

        var servers = [];
        var rawServers = Array.isArray(film.episodes) ? film.episodes : [];

        for (var sIdx = 0; sIdx < rawServers.length; sIdx++) {
            var srv = rawServers[sIdx] || {};
            var serverName = srv.server_name || srv.name || ("Server #" + (sIdx + 1));
            var rawEps = Array.isArray(srv.items) ? srv.items : (Array.isArray(srv.server_data) ? srv.server_data : []);
            var episodes = [];

            for (var eIdx = 0; eIdx < rawEps.length; eIdx++) {
                var ep = rawEps[eIdx] || {};
                var epName = ep.name || ("Tập " + (eIdx + 1));
                var rawEpSlug = ep.slug || ("tap-" + (eIdx + 1));
                var uniqueSlug = "sv" + (sIdx + 1) + "-" + rawEpSlug + "-" + (eIdx + 1);

                var embedUrl = ep.embed || ep.link_embed || "";
                var m3u8Url = ep.m3u8 || ep.link_m3u8 || "";
                var playUrl = embedUrl || m3u8Url || "";

                var payloadStr = encodeURIComponent(JSON.stringify({
                    embed: embedUrl,
                    m3u8: m3u8Url,
                    server: serverName,
                    episode: epName
                }));

                var epId = playUrl
                    ? (playUrl + "|data:" + payloadStr)
                    : (fallbackSlug + "|data:" + payloadStr);

                episodes.push({
                    id: epId,
                    name: epName,
                    slug: uniqueSlug
                });
            }

            if (episodes.length > 0) {
                servers.push({
                    name: serverName,
                    episodes: episodes
                });
            }
        }

        var categories = [];
        var years = [];
        var countries = [];

        if (film.category && typeof film.category === "object") {
            for (var key in film.category) {
                var group = film.category[key] || {};
                var gName = (group.group && group.group.name) ? String(group.group.name).toLowerCase() : "";
                var gList = Array.isArray(group.list) ? group.list : [];

                for (var g = 0; g < gList.length; g++) {
                    var cItem = gList[g];
                    if (!cItem || !cItem.name) continue;
                    var mdLink = "[" + cItem.name + "](" + (cItem.slug || key) + ")";

                    if (gName.indexOf("thể loại") >= 0 || key === "2") {
                        categories.push(mdLink);
                    } else if (gName.indexOf("năm") >= 0 || key === "3") {
                        years.push(cItem.name);
                    } else if (gName.indexOf("quốc gia") >= 0 || key === "4") {
                        countries.push(mdLink);
                    }
                }
            }
        }

        var detailObj = {
            id: film.slug || fallbackSlug,
            title: film.name || film.title || film.original_name || fallbackSlug,
            posterUrl: film.thumb_url || film.poster_url || "",
            backdropUrl: film.poster_url || film.thumb_url || "",
            description: film.description || "",
            servers: servers,
            quality: film.quality || "",
            casts: film.casts || "",
            director: film.director || "",
            category: categories.join(", "),
            status: film.current_episode || "",
            duration: film.time || ""
        };

        if (years.length > 0) {
            var yVal = parseInt(years[0], 10);
            if (!isNaN(yVal) && yVal > 0) detailObj.year = yVal;
        }

        return JSON.stringify(detailObj);
    } catch (e) {
        console.error("Lỗi parseMovieDetail NguonC:", e && e.message ? e.message : e);
        return JSON.stringify({
            id: fallbackSlug,
            title: fallbackSlug,
            servers: []
        });
    }
}

function _buildStreamResult(targetUrl) {
    var clean = _stripPipe(targetUrl || "");
    if (!clean || clean.indexOf("http") !== 0) {
        return JSON.stringify({ url: "", isEmbed: false });
    }

    var isM3u8 = /\.m3u8(\?|$)/i.test(clean);
    var isMp4 = /\.mp4(\?|$)/i.test(clean);
    if (isM3u8 || isMp4) {
        return JSON.stringify({
            url: clean,
            isEmbed: false,
            mimeType: isM3u8 ? "application/x-mpegURL" : "video/mp4",
            headers: {
                "Referer": BASE_URL + "/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36"
            }
        });
    }

    var ref = BASE_URL + "/";
    var originMatch = clean.match(/^(https?:\/\/[^\/]+)/i);
    if (originMatch) ref = originMatch[1] + "/";

    return JSON.stringify({
        url: clean,
        isEmbed: true,
        headers: {
            "Referer": ref,
            "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36",
            "Block-Ads": "true",
            "Block-Redirects": "true"
        }
    });
}

function parseDetailResponse(html, apiUrl, datasend) {
    var rawData = _getPipeData(apiUrl, datasend);
    if (rawData) {
        try {
            var epObj = JSON.parse(decodeURIComponent(rawData));
            if (epObj && (epObj.embed || epObj.m3u8)) {
                return _buildStreamResult(epObj.embed || epObj.m3u8);
            }
        } catch (e) {
            try {
                var epObj2 = JSON.parse(rawData);
                if (epObj2 && (epObj2.embed || epObj2.m3u8)) {
                    return _buildStreamResult(epObj2.embed || epObj2.m3u8);
                }
            } catch (e2) {}
        }
    }

    // Nếu html là JSON từ /api/film/{slug}
    try {
        var trimmed = typeof html === "string" ? html.trim() : "";
        if (trimmed.indexOf("{") === 0) {
            var json = JSON.parse(trimmed);
            var film = json.movie || json.data || json;
            if (film && Array.isArray(film.episodes) && film.episodes.length > 0) {
                var firstEps = film.episodes[0].items || film.episodes[0].server_data || [];
                if (firstEps.length > 0) {
                    var candidate = firstEps[0].embed || firstEps[0].link_embed || firstEps[0].m3u8 || firstEps[0].link_m3u8 || "";
                    if (candidate) return _buildStreamResult(candidate);
                }
            }
        }
    } catch (e) {}

    return _buildStreamResult(apiUrl);
}

function parseEmbedResponse(html, sourceUrl) {
    var baseRef = BASE_URL + "/";
    var cleanSrc = _stripPipe(sourceUrl || "");
    var originMatch = cleanSrc.match(/^(https?:\/\/[^\/]+)/i);
    if (originMatch) baseRef = originMatch[1] + "/";

    var raw = typeof html === "string" ? html : "";

    // 1. Tìm link stream trực tiếp (.m3u8 / .mp4) trong HTML/JS
    var streamMatch = raw.match(/(https?:\/\/[^\s"'<>\\]+\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/i);
    if (streamMatch && streamMatch[1]) {
        var streamUrl = streamMatch[1].replace(/\\\//g, "/");
        var isHls = /\.m3u8(\?|$)/i.test(streamUrl);
        return JSON.stringify({
            url: streamUrl,
            isEmbed: false,
            mimeType: isHls ? "application/x-mpegURL" : "video/mp4",
            headers: {
                "Referer": baseRef,
                "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36"
            }
        });
    }

    // 2. Nếu có iframe trung gian → trả isEmbed: true để app fetch tiếp (tối đa 3 lần)
    var iframeMatch = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
        var nextUrl = iframeMatch[1].replace(/\\\//g, "/");
        if (nextUrl.indexOf("//") === 0) {
            nextUrl = "https:" + nextUrl;
        } else if (nextUrl.indexOf("/") === 0) {
            nextUrl = baseRef.replace(/\/$/, "") + nextUrl;
        }
        return JSON.stringify({
            url: nextUrl,
            isEmbed: true,
            headers: {
                "Referer": baseRef,
                "Block-Ads": "true"
            }
        });
    }

    return JSON.stringify({ url: "", isEmbed: false });
}
