// =============================================================================
// VAAPP PLUGIN - NGUON C (https://phim.nguonc.com)
// =============================================================================

var BASE_URL = "https://phim.nguonc.com";
var API_BASE = "https://phim.nguonc.com/api";
var DEFAULT_UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";

function getManifest() {
    return JSON.stringify({
        "id": "nguonc_phim",
        "name": "Nguồn C",
        "version": "1.3.1",
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
        "debug": true
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

function _safeJsonParse(input) {
    if (input === null || input === undefined) return null;
    if (typeof input === "object") return input;
    var text = String(input).trim();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch (e1) {
        var firstBrace = text.indexOf("{");
        var lastBrace = text.lastIndexOf("}");
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            try {
                return JSON.parse(text.substring(firstBrace, lastBrace + 1));
            } catch (e2) {}
        }

        var firstBracket = text.indexOf("[");
        var lastBracket = text.lastIndexOf("]");
        if (firstBracket >= 0 && lastBracket > firstBracket) {
            try {
                return JSON.parse(text.substring(firstBracket, lastBracket + 1));
            } catch (e3) {}
        }
    }
    return null;
}

function _originFromUrl(urlStr) {
    var clean = _stripPipe(urlStr || "");
    if (clean.indexOf("//") === 0) clean = "https:" + clean;
    var m = clean.match(/^(https?:\/\/[^\/]+)/i);
    return m ? (m[1] + "/") : (BASE_URL + "/");
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
        } catch (e1) {
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

function _parseFilmsList(html, apiUrl, datasend) {
    var items = [];
    var pagination = { currentPage: 1, totalPages: 1 };

    try {
        var rawStr = html === undefined || html === null ? "" : String(html);
        var json = _safeJsonParse(rawStr);

        if (json) {
            var list = [];
            if (Array.isArray(json)) {
                list = json;
            } else if (typeof json === "object") {
                list = json.items || json.data || json.films || json.movies || [];
            }

            if (json && !Array.isArray(json) && json.paginate && typeof json.paginate === "object") {
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

                var year = parseInt(m.year, 10) || 0;
                if (!year && m.category && typeof m.category === "object") {
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
        }
    } catch (e) {
        console.error("Lỗi _parseFilmsList:", e && e.message ? e.message : e);
    }

    return JSON.stringify({
        items: items,
        pagination: pagination
    });
}

function parseListResponse(html, apiUrl, datasend) {
    return _parseFilmsList(html, apiUrl, datasend);
}

function parseSearchResponse(html, apiUrl, datasend) {
    return _parseFilmsList(html, apiUrl, datasend);
}

function _parsePipeEpisodeLines(rawText) {
    var lines = String(rawText || "").split(/\r?\n/);
    var parsed = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line.indexOf("{") === 0 || line.indexOf("[") === 0) continue;
        var parts = line.split("|");
        if (parts.length >= 3 && /^https?:\/\//i.test(parts[2].trim())) {
            parsed.push({
                name: parts[0].trim() || ("Tập " + (parsed.length + 1)),
                slug: parts[1].trim() || ("tap-" + (parsed.length + 1)),
                embed: parts[2].trim()
            });
        }
    }
    return parsed;
}

function parseMovieDetail(html, apiUrl, datasend) {
    var cleanUrl = _stripPipe(apiUrl || "");
    var fallbackSlug = cleanUrl.split("/").pop() || "nguonc-movie";

    try {
        var rawStr = html === undefined || html === null ? "" : String(html);
        var json = _safeJsonParse(rawStr);
        var film = (json && (json.movie || json.data)) ? (json.movie || json.data) : json;

        var servers = [];
        var rawServers = (film && Array.isArray(film.episodes)) ? film.episodes : [];

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

        if (servers.length === 0 && rawStr.indexOf("|") >= 0) {
            var pipeEps = _parsePipeEpisodeLines(rawStr);
            if (pipeEps.length > 0) {
                var mapped = [];
                for (var pIdx = 0; pIdx < pipeEps.length; pIdx++) {
                    var pItem = pipeEps[pIdx];
                    var pPayload = encodeURIComponent(JSON.stringify({
                        embed: pItem.embed,
                        episode: pItem.name
                    }));
                    mapped.push({
                        id: pItem.embed + "|data:" + pPayload,
                        name: pItem.name,
                        slug: "sv1-" + pItem.slug + "-" + (pIdx + 1)
                    });
                }
                servers.push({
                    name: "Vietsub #1",
                    episodes: mapped
                });
            }
        }

        var categories = [];
        var years = [];
        var countries = [];

        if (film && film.category && typeof film.category === "object") {
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

        var yVal = (film && film.year) ? (parseInt(film.year, 10) || 0) : 0;
        if (!yVal && years.length > 0) {
            yVal = parseInt(years[0], 10) || 0;
        }

        var detailObj = {
            id: (film && film.slug) ? film.slug : fallbackSlug,
            title: (film && (film.name || film.title || film.original_name)) ? (film.name || film.title || film.original_name) : fallbackSlug,
            posterUrl: (film && (film.thumb_url || film.poster_url)) ? (film.thumb_url || film.poster_url) : "",
            backdropUrl: (film && (film.poster_url || film.thumb_url)) ? (film.poster_url || film.thumb_url) : "",
            description: (film && film.description) ? film.description : "",
            servers: servers,
            quality: (film && film.quality) ? film.quality : "",
            casts: (film && film.casts) ? film.casts : "",
            director: (film && film.director) ? film.director : "",
            category: categories.join(", "),
            status: (film && film.current_episode) ? film.current_episode : "",
            duration: (film && film.time) ? film.time : ""
        };
        if (yVal > 0) detailObj.year = yVal;

        return JSON.stringify(detailObj);
    } catch (e) {
        console.error("Lỗi parseMovieDetail:", e && e.message ? e.message : e);
        return JSON.stringify({
            id: fallbackSlug,
            title: fallbackSlug,
            servers: []
        });
    }
}

function _buildStreamResult(targetUrl, fallbackReferer) {
    var clean = _stripPipe(targetUrl || "");
    if (!clean) {
        return JSON.stringify({ url: "", isEmbed: false });
    }
    if (clean.indexOf("//") === 0) {
        clean = "https:" + clean;
    }

    var isM3u8 = /\.m3u8(\?|$)/i.test(clean);
    var isMp4 = /\.mp4(\?|$)/i.test(clean);
    var isDirect = isM3u8 || isMp4 || /\.(mkv|mpd)(\?|$)/i.test(clean);
    var ref = _originFromUrl(clean) || fallbackReferer || (BASE_URL + "/");

    if (isDirect) {
        var mime = "";
        if (isM3u8) mime = "application/x-mpegURL";
        else if (isMp4) mime = "video/mp4";
        else if (/\.mpd(\?|$)/i.test(clean)) mime = "application/dash+xml";
        else if (/\.mkv(\?|$)/i.test(clean)) mime = "video/x-matroska";

        return JSON.stringify({
            url: clean,
            isEmbed: false,
            mimeType: mime,
            headers: {
                "Referer": ref,
                "User-Agent": DEFAULT_UA
            }
        });
    }

    return JSON.stringify({
        url: clean,
        isEmbed: true,
        headers: {
            "Referer": ref,
            "User-Agent": DEFAULT_UA,
            "Block-Ads": "true",
            "Block-Redirects": "true"
        }
    });
}

function _extractStreamFromText(text) {
    if (!text) return "";
    var str = String(text).replace(/\\\//g, "/");

    var mediaMatch = str.match(/(https?:\/\/[^\s"'<>\\]+\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?)/i);
    if (mediaMatch && mediaMatch[1]) {
        return mediaMatch[1];
    }

    var fieldMatch = str.match(/["']?(?:file|url|stream|m3u8|link|src)["']?\s*[:=]\s*["'](https?:\/\/[^"'\s<>\\]+)["']/i);
    if (fieldMatch && fieldMatch[1]) {
        return fieldMatch[1];
    }

    return "";
}

function parseDetailResponse(html, apiUrl, datasend) {
    var rawStr = html === undefined || html === null ? "" : String(html);
    var rawData = _getPipeData(apiUrl, datasend);

    if (rawData) {
        try {
            var epObj = JSON.parse(decodeURIComponent(rawData));
            if (epObj && (epObj.m3u8 || epObj.embed)) {
                return _buildStreamResult(epObj.m3u8 || epObj.embed, apiUrl);
            }
        } catch (e1) {
            try {
                var epObj2 = JSON.parse(rawData);
                if (epObj2 && (epObj2.m3u8 || epObj2.embed)) {
                    return _buildStreamResult(epObj2.m3u8 || epObj2.embed, apiUrl);
                }
            } catch (e2) {}
        }
    }

    var extracted = _extractStreamFromText(rawStr);
    if (extracted) {
        return _buildStreamResult(extracted, apiUrl);
    }

    var json = _safeJsonParse(rawStr);
    if (json && typeof json === "object") {
        var film = json.movie || json.data || json;
        if (film && Array.isArray(film.episodes) && film.episodes.length > 0) {
            var firstEps = film.episodes[0].items || film.episodes[0].server_data || [];
            if (firstEps.length > 0) {
                var candidate = firstEps[0].m3u8 || firstEps[0].link_m3u8 || firstEps[0].embed || firstEps[0].link_embed || "";
                if (candidate) return _buildStreamResult(candidate, apiUrl);
            }
        }
    }

    var embedMatch = rawStr.match(/(https?:\/\/[^\s"'<>\\]+embed\.php\?[^\s"'<>\\]+)/i);
    if (embedMatch && embedMatch[1]) {
        return _buildStreamResult(embedMatch[1].replace(/\\\//g, "/"), apiUrl);
    }

    var cleanApiUrl = _stripPipe(apiUrl || "");
    if (cleanApiUrl && cleanApiUrl.indexOf("http") === 0) {
        return _buildStreamResult(cleanApiUrl, cleanApiUrl);
    }

    return _buildStreamResult(BASE_URL + "/", BASE_URL + "/");
}

function parseEmbedResponse(html, url) {
    var rawStr = html === undefined || html === null ? "" : String(html);
    var cleanSrc = _stripPipe(url || "");
    var baseRef = _originFromUrl(cleanSrc);

    var directStream = _extractStreamFromText(rawStr);
    if (directStream && /\.(m3u8|mp4)(\?|$)/i.test(directStream)) {
        return _buildStreamResult(directStream, baseRef);
    }

    var iframeMatch = rawStr.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
        var nextUrl = iframeMatch[1].replace(/\\\//g, "/").trim();
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
                "User-Agent": DEFAULT_UA,
                "Block-Ads": "true",
                "Block-Redirects": "true"
            }
        });
    }

    if (directStream && directStream.indexOf("http") === 0) {
        return _buildStreamResult(directStream, baseRef);
    }

    if (cleanSrc && cleanSrc.indexOf("http") === 0) {
        return _buildStreamResult(cleanSrc, baseRef);
    }

    return JSON.stringify({ url: "", isEmbed: false });
}
