// NguonC plugin - KKPhim compatible structure
// API: https://phim.nguonc.com/api

function getManifest() {
    return JSON.stringify({
        id: "nguonc",
        name: "NguồnC",
        version: "1.1.0",
        baseUrl: "https://phim.nguonc.com",
        iconUrl: "https://phim.nguonc.com/favicon.ico",
        isEnabled: true,
        type: "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "films" },
        { slug: "tv-shows", title: "TV Shows", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim mới cập nhật", slug: "phim-moi-cap-nhat" },
        { name: "TV Shows", slug: "tv-shows" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Hành động", slug: "category:hanh-dong" },
        { name: "Việt Nam", slug: "country:viet-nam" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], filters: ["country", "category", "year"] });
}

// ==================== TẦNG YÊU CẦU (gộp + cache) ====================

var _cache = {};
var _inflight = {};

function _fetchJson(url) {
    // Cache đơn giản trong bộ nhớ (có thể mở rộng theo nhu cầu)
    if (_cache[url]) return _cache[url];
    if (_inflight[url]) return _inflight[url];

    var p = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.timeout = 15000; // timeout 15s

        xhr.onload = function () {
            delete _inflight[url];
            var status = xhr.status;
            if (status === 404) return reject(new Error("Không tìm thấy tài nguyên (404)"));
            if (status === 422) return reject(new Error("Tham số không hợp lệ (422)"));
            if (status === 429) {
                // Chờ 2 giây rồi thử lại một lần
                setTimeout(function () {
                    _fetchJson(url).then(resolve).catch(reject);
                }, 2000);
                return;
            }
            if (status < 200 || status >= 300) {
                return reject(new Error("HTTP " + status));
            }
            try {
                var data = JSON.parse(xhr.responseText);
                _cache[url] = data;
                resolve(data);
            } catch (e) {
                reject(new Error("Phân tích JSON thất bại: " + e.message));
            }
        };

        xhr.onerror = function () {
            delete _inflight[url];
            reject(new Error("Lỗi mạng"));
        };
        xhr.ontimeout = function () {
            delete _inflight[url];
            reject(new Error("Yêu cầu hết thời gian chờ"));
        };

        xhr.send();
    });

    _inflight[url] = p;
    return p;
}

// ==================== TẠO URL ====================

function getUrlList(slug, filtersJson) {
    var filters = {};
    try { filters = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var page = Math.max(1, parseInt(filters.page, 10) || 1);
    var s = String(slug || "phim-moi-cap-nhat").trim();
    var base = "https://phim.nguonc.com/api/films/";

    if (s === "phim-moi" || s === "phim-moi-cap-nhat") {
        return base + "phim-moi-cap-nhat?page=" + page;
    }
    if (s.indexOf("country:") === 0 || filters.country) {
        var country = filters.country || s.substring(8);
        return base + "quoc-gia/" + encodeURIComponent(country) + "?page=" + page;
    }
    if (s.indexOf("year:") === 0 || filters.year) {
        var year = filters.year || s.substring(5);
        return base + "nam-phat-hanh/" + encodeURIComponent(year) + "?page=" + page;
    }
    if (s.indexOf("category:") === 0 || filters.category) {
        var category = filters.category || s.substring(9);
        return base + "the-loai/" + encodeURIComponent(category) + "?page=" + page;
    }
    if (["phim-bo", "phim-le", "tv-shows", "hoat-hinh"].indexOf(s) >= 0) {
        return base + "danh-sach/" + encodeURIComponent(s) + "?page=" + page;
    }
    return base + "the-loai/" + encodeURIComponent(s) + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try { filters = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var page = Math.max(1, parseInt(filters.page, 10) || 1);
    return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(String(keyword || "").trim()) + "&page=" + page;
}

function getUrlDetail(slug) {
    return "https://phim.nguonc.com/api/film/" + encodeURIComponent(slug || "");
}

// ==================== CÔNG CỤ ====================

function _getImageUrl(path) {
    if (!path) return "";
    var p = String(path).trim();
    if (/^https?:\/\//i.test(p)) return p;
    return "https://phim.nguonc.com" + (p.charAt(0) === "/" ? p : "/" + p);
}

function _cleanText(html) {
    return String(html || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p\s*>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();
}

function _toNames(arr) {
    if (!Array.isArray(arr)) return "";
    return arr.map(function (x) {
        return typeof x === "string" ? x : (x && (x.name || x.title)) || "";
    }).filter(Boolean).join(", ");
}

// ==================== PHÂN TÍCH DANH SÁCH ====================

function parseListResponse(apiResponseJson) {
    try {
        var response = typeof apiResponseJson === "string" ? JSON.parse(apiResponseJson) : apiResponseJson;
        if (response.status && response.status !== "success") {
            return JSON.stringify({ items: [], error: response.message || "Lỗi API", pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 } });
        }

        var items = response.items || (response.data && response.data.items) || [];
        var paginate = response.paginate || {};
        var movies = items.map(function (item) {
            return {
                id: item.slug || item.id || "",
                title: item.name || item.title || "",
                posterUrl: _getImageUrl(item.poster_url || item.thumb_url),
                backdropUrl: _getImageUrl(item.thumb_url || item.poster_url),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current: item.current_episode || item.episode_current || "",
                lang: item.language || item.lang || ""
            };
        });

        var current = parseInt(paginate.current_page, 10) || 1;
        var perPage = parseInt(paginate.items_per_page, 10) || (movies.length || 24);
        var total = parseInt(paginate.total_items, 10);
        if (isNaN(total)) total = movies.length;
        var pages = parseInt(paginate.total_page, 10) || Math.max(1, Math.ceil(total / perPage));

        return JSON.stringify({
            items: movies,
            pagination: { currentPage: current, totalPages: pages, totalItems: total, itemsPerPage: perPage },
            category: response.cat || null
        });
    } catch (e) {
        return JSON.stringify({ items: [], error: "Phân tích thất bại: " + e.message, pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 } });
    }
}

// ==================== PHÂN TÍCH CHI TIẾT & LIÊN KẾT PHÁT (CỐT LÕI) ====================

function _isPlayableUrl(str) {
    if (typeof str !== "string") return false;
    var v = str.trim();
    // Loại trừ ảnh, chấp nhận http(s)
    return /^https?:\/\//i.test(v) && !/\.(jpg|jpeg|png|webp|gif|svg|ico)(\?|$)/i.test(v);
}

// Trích xuất đệ quy tất cả các liên kết có thể phát từ bất kỳ cấu trúc nào
function _extractLinks(obj, out, seen) {
    if (!obj) return;
    if (typeof obj === "string") {
        var s = obj.trim();
        if ((s.charAt(0) === "{" || s.charAt(0) === "[") && s.length < 5000) {
            try { _extractLinks(JSON.parse(s), out, seen); return; } catch (e) {}
        }
        // Thử trích xuất iframe src
        var iframeMatch = s.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        if (iframeMatch && _isPlayableUrl(iframeMatch[1]) && !seen[iframeMatch[1]]) {
            seen[iframeMatch[1]] = true;
            out.push(iframeMatch[1]);
        }
        if (_isPlayableUrl(s) && !seen[s]) {
            seen[s] = true;
            out.push(s);
        }
        return;
    }
    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) _extractLinks(obj[i], out, seen);
        return;
    }
    if (typeof obj !== "object") return;

    // Ưu tiên các trường liên kết phổ biến
    var priorityKeys = ["m3u8", "link_m3u8", "hls", "video_url", "stream_url", "stream", "file", "src", "source", "embed", "link_embed", "embed_url", "url_embed", "url", "link", "play_url", "playUrl", "content_url"];
    for (var k = 0; k < priorityKeys.length; k++) {
        if (obj[priorityKeys[k]] != null) _extractLinks(obj[priorityKeys[k]], out, seen);
    }

    // Quét các trường khác, bỏ qua metadata rõ ràng
    for (var key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (priorityKeys.indexOf(key) >= 0) continue;
        if (/poster|thumb|image|avatar|logo|description|content|actor|director|category|country|tmdb|imdb|title|name|slug|quality|language|year|rating/i.test(key)) continue;
        var val = obj[key];
        if (typeof val === "object" || (typeof val === "string" && _isPlayableUrl(val))) {
            _extractLinks(val, out, seen);
        }
    }
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = typeof apiResponseJson === "string" ? JSON.parse(apiResponseJson) : apiResponseJson;
        var movie = response.movie || (response.data && response.data.movie) || {};

        // Phân tích episodes: NguồnC thực tế có thể trả về object hoặc mảng
        var episodeGroups = movie.episodes || response.episodes || (response.data && response.data.episodes) || [];
        if (!Array.isArray(episodeGroups)) {
            // Nếu là object, chuyển thành mảng
            if (episodeGroups && typeof episodeGroups === "object") {
                episodeGroups = Object.keys(episodeGroups).map(function (k) { return episodeGroups[k]; });
            } else {
                episodeGroups = [];
            }
        }

        var servers = [];

        for (var i = 0; i < episodeGroups.length; i++) {
            var group = episodeGroups[i] || {};
            // Thử lấy mảng tập từ nhiều tên trường khác nhau
            var episodeList = group.items || group.list || group.episodes || group.server_data || group.data || group.sources || [];
            if (!Array.isArray(episodeList) && (group.url || group.embed || group.link || group.m3u8)) {
                episodeList = [group];
            }
            if (!Array.isArray(episodeList)) episodeList = [];

            var parsedEpisodes = [];
            for (var j = 0; j < episodeList.length; j++) {
                var ep = episodeList[j] || {};
                var links = [];
                var seen = {};
                // Trích xuất tất cả liên kết có thể có từ object tập phim
                _extractLinks(ep, links, seen);

                // Nếu tập phim không có liên kết, thử trích xuất từ group (một số API đặt ở cấp group)
                if (links.length === 0) {
                    _extractLinks(group, links, seen);
                }

                for (var n = 0; n < links.length; n++) {
                    var url = links[n];
                    parsedEpisodes.push({
                        id: url,
                        name: ep.name || ep.title || ep.episode || ep.slug || ("Tập " + (j + 1)),
                        slug: ep.slug || "",
                        m3u8: /\.m3u8(\?|#|$)/i.test(url) ? url : "",
                        embed: /\.m3u8(\?|#|$)/i.test(url) ? "" : url,
                        sourceType: /\.m3u8(\?|#|$)/i.test(url) ? "m3u8" : "embed"
                    });
                }
            }

            if (parsedEpisodes.length > 0) {
                servers.push({
                    name: group.server_name || group.server || group.name || ("Server " + (i + 1)),
                    episodes: parsedEpisodes
                });
            }
        }

        // Phương án dự phòng: nếu không có server nào, quét toàn bộ phản hồi để tìm liên kết
        if (servers.length === 0) {
            var fallbackLinks = [];
            var fallbackSeen = {};
            _extractLinks(response, fallbackLinks, fallbackSeen);
            if (fallbackLinks.length > 0) {
                servers.push({
                    name: "Nguồn dự phòng",
                    episodes: fallbackLinks.map(function (url, idx) {
                        return {
                            id: url,
                            name: "Nguồn " + (idx + 1),
                            slug: "",
                            m3u8: /\.m3u8(\?|#|$)/i.test(url) ? url : "",
                            embed: /\.m3u8(\?|#|$)/i.test(url) ? "" : url,
                            sourceType: /\.m3u8(\?|#|$)/i.test(url) ? "m3u8" : "embed"
                        };
                    })
                });
            }
        }

        return JSON.stringify({
            id: movie.slug || movie.id || "",
            title: movie.name || movie.title || "",
            originName: movie.original_name || movie.origin_name || "",
            posterUrl: _getImageUrl(movie.poster_url || movie.thumb_url),
            backdropUrl: _getImageUrl(movie.thumb_url || movie.poster_url),
            description: _cleanText(movie.description || movie.content),
            year: parseInt(movie.year, 10) || 0,
            rating: parseFloat(movie.rating || movie.vote_average) || 0,
            quality: movie.quality || "",
            duration: movie.time || movie.duration || "",
            servers: servers,
            episode_current: movie.current_episode || "",
            lang: movie.language || "",
            category: _toNames(movie.category),
            country: _toNames(movie.country),
            director: movie.director || "",
            casts: movie.casts || movie.actor || "",
            status: movie.status || response.status || ""
        });
    } catch (e) {
        return JSON.stringify({ error: "Phân tích chi tiết thất bại: " + e.message, servers: [] });
    }
}

// Chuyển đổi liên kết phát thành thông tin luồng có thể phát
function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").trim();
    var links = [];
    var seen = {};
    _extractLinks(raw, links, seen);
    var url = links.length > 0 ? links[0] : raw;
    var isDirect = /\.(m3u8|mp4|m4v|mov|webm)(\?|#|$)/i.test(url);

    return JSON.stringify({
        url: url,
        isDirectStream: isDirect,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://phim.nguonc.com/"
        },
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    try {
        var parsed = typeof apiResponseJson === "string" ? JSON.parse(apiResponseJson) : apiResponseJson;
        var links = [];
        var seen = {};
        _extractLinks(parsed, links, seen);
        var url = links.length > 0 ? links[0] : "";
        return resolveStreamData(url);
    } catch (e) {
        return resolveStreamData(apiResponseJson);
    }
}

// ==================== PHÂN TÍCH DANH MỤC/QUỐC GIA/NĂM ====================

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = typeof apiResponseJson === "string" ? JSON.parse(apiResponseJson) : apiResponseJson;
        var cat = response.cat;
        if (Array.isArray(cat)) return JSON.stringify(cat.map(function (x) { return { name: x.name || x.title || "", slug: x.slug || "" }; }));
        if (cat && typeof cat === "object") return JSON.stringify([{ name: cat.name || cat.title || "", slug: cat.slug || "" }]);
        var items = response.items || [];
        return JSON.stringify(items.map(function (x) { return { name: x.name || x.title || "", slug: x.slug || "" }; }));
    } catch (e) { return "[]"; }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var response = typeof apiResponseJson === "string" ? JSON.parse(apiResponseJson) : apiResponseJson;
        var cat = response.cat;
        if (Array.isArray(cat)) return JSON.stringify(cat.map(function (x) { return { name: x.name || x.title || "", value: x.slug || "" }; }));
        if (cat && typeof cat === "object") return JSON.stringify([{ name: cat.name || cat.title || "", value: cat.slug || "" }]);
        var items = response.items || [];
        return JSON.stringify(items.map(function (x) { return { name: x.name || x.title || "", value: x.slug || "" }; }));
    } catch (e) { return "[]"; }
}

function parseYearsResponse(apiResponseJson) {
    try {
        var response = typeof apiResponseJson === "string" ? JSON.parse(apiResponseJson) : apiResponseJson;
        var items = response.items || [];
        return JSON.stringify(items.map(function (x) {
            var val = typeof x === "object" ? (x.slug || x.value || x.year || x.name) : x;
            return { name: String(val || ""), value: String(val || "") };
        }));
    } catch (e) { return "[]"; }
}
