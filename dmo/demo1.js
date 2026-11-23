// VaxPlayer - NguonC API plugin
// Playback resolver returns direct URLs exposed by API. Embed links are returned as embed URLs
// for a player that supports WebView/iframe; this plugin does not bypass embed protections.

var API_BASE = "https://phim.nguonc.com/api";

function getManifest() {
    return JSON.stringify({
        id: "vaxplayer",
        name: "VaxPlayer - NguonC",
        version: "1.0.0",
        baseUrl: API_BASE,
        iconUrl: "",
        isEnabled: true,
        type: "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-moi-cap-nhat", title: "Phim mới cập nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-le", title: "Phim lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt hình", type: "Horizontal", path: "danh-sach" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim mới cập nhật", slug: "phim-moi-cap-nhat" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Hoạt hình", slug: "hoat-hinh" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [] });
}

function getUrlList(slug, filtersJson) {
    var f = {};
    try { f = JSON.parse(filtersJson || "{}"); } catch (_) {}
    var page = Math.max(1, parseInt(f.page, 10) || 1);
    var s = slug || "phim-moi-cap-nhat";
    if (s === "phim-moi" || s === "phim-moi-cap-nhat") {
        return API_BASE + "/films/phim-moi-cap-nhat?page=" + page;
    }
    return API_BASE + "/films/danh-sach/" + encodeURIComponent(s) + "?page=" + page;
}

function getUrlSearch(keyword, filtersJson) {
    var f = {};
    try { f = JSON.parse(filtersJson || "{}"); } catch (_) {}
    var page = Math.max(1, parseInt(f.page, 10) || 1);
    return API_BASE + "/films/search?keyword=" + encodeURIComponent((keyword || "").trim()) + "&page=" + page;
}

function getUrlDetail(slug) {
    return API_BASE + "/film/" + encodeURIComponent(slug || "");
}

function getUrlCategories() {
    return API_BASE + "/films/danh-sach";
}
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

function getLocalYearsJson() {
    var y = new Date().getFullYear(), out = [];
    for (; y >= 1970; y--) out.push({ name: String(y), value: String(y) });
    return JSON.stringify(out);
}

function extractItems(response) {
    if (!response) return [];
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.items)) return response.data.items;
    if (Array.isArray(response.movie)) return response.movie;
    return [];
}

function absoluteImage(path) {
    if (!path) return "";
    var s = String(path).trim();
    if (/^https?:\/\//i.test(s)) return s;
    return "https://phim.nguonc.com" + (s.charAt(0) === "/" ? s : "/" + s);
}

function parseListResponse(apiResponseJson) {
    try {
        var r = JSON.parse(apiResponseJson || "{}");
        var items = extractItems(r);
        var pg = r.paginate || r.pagination || {};
        return JSON.stringify({
            items: items.map(function (m) {
                return {
                    id: m.slug || m.id || "",
                    title: m.name || "",
                    posterUrl: absoluteImage(m.poster_url || m.thumb_url),
                    backdropUrl: absoluteImage(m.thumb_url || m.poster_url),
                    year: parseInt(m.year, 10) || 0,
                    quality: m.quality || "",
                    episode_current: m.current_episode || m.episode_current || "",
                    lang: m.language || m.lang || ""
                };
            }),
            pagination: {
                currentPage: parseInt(pg.current_page || pg.currentPage, 10) || 1,
                totalPages: parseInt(pg.total_page || pg.totalPages, 10) || 1,
                totalItems: parseInt(pg.total_items || pg.totalItems, 10) || items.length,
                itemsPerPage: parseInt(pg.items_per_page || pg.itemsPerPage, 10) || items.length || 24
            }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 } });
    }
}
function parseSearchResponse(json) { return parseListResponse(json); }
function isDirectMediaUrl(url) {
    return /^https?:\/\//i.test(String(url || "").trim()) && /\.(m3u8|mp4|mpd)(?:$|[?#])/i.test(String(url || "").trim());
}
function isEmbedUrl(url) {
    return /^https?:\/\//i.test(String(url || "").trim()) && !isDirectMediaUrl(url);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var r = JSON.parse(apiResponseJson || "{}");
        var movie = r.movie || {};
        var episodes = Array.isArray(movie.episodes) ? movie.episodes : (Array.isArray(r.episodes) ? r.episodes : []);
        var servers = episodes.map(function (server, i) {
            var items = Array.isArray(server.items) ? server.items : (Array.isArray(server.server_data) ? server.server_data : []);
            var eps = items.map(function (ep) {
                var direct = ep.m3u8 || ep.link_m3u8 || ep.url || ep.file || "";
                var embed = ep.embed || ep.link_embed || ep.url_embed || ep.link || "";
                var chosen = isDirectMediaUrl(direct) ? direct : (isEmbedUrl(embed) ? embed : (isEmbedUrl(direct) ? direct : ""));
                if (!chosen) return null;
                var directMedia = isDirectMediaUrl(chosen);
                return {
                    id: chosen,
                    name: ep.name || ep.title || ep.slug || "Tập",
                    slug: ep.slug || "",
                    m3u8: directMedia && /\.m3u8(?:$|[?#])/i.test(chosen) ? chosen : "",
                    embed: directMedia ? "" : chosen,
                    playbackType: directMedia ? "direct" : "embed"
                };
            }).filter(Boolean);
            return { name: server.server_name || server.name || ("Server " + (i + 1)), episodes: eps };
        }).filter(function (s) { return s.episodes.length > 0; });

        var categories = [];
        var countries = [];
        var year = parseInt(movie.year, 10) || 0;
        var groups = movie.category;
        if (Array.isArray(groups)) {
            groups.forEach(function (g) {
                var groupName = (g.group && g.group.name || "").toLowerCase();
                (g.list || []).forEach(function (v) {
                    if (groupName.indexOf("năm") >= 0) year = parseInt(v.name, 10) || year;
                    else if (groupName.indexOf("quốc gia") >= 0) countries.push(v.name);
                    else categories.push(v.name);
                });
            });
        }

        var desc = String(movie.description || movie.content || "")
            .replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim();

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            originName: movie.original_name || movie.origin_name || "",
            posterUrl: absoluteImage(movie.poster_url || movie.thumb_url),
            backdropUrl: absoluteImage(movie.thumb_url || movie.poster_url),
            description: desc,
            year: year,
            rating: 0,
            quality: movie.quality || "",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.current_episode || movie.episode_current || "",
            lang: movie.language || movie.lang || "",
            category: categories.join(", "),
            country: countries.join(", "),
            director: movie.director || "",
            casts: movie.casts || movie.actor || "",
            status: movie.status || ""
        });
    } catch (e) {
        return "null";
    }
}

// streamInput may be an API-provided direct HLS/MP4 URL, or an embed URL.
// Embed URLs are not direct media streams; the host app must support embedded playback.
function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").trim();
    var direct = isDirectMediaUrl(raw);
    var embed = /^https?:\/\//i.test(raw) && !direct;
    return JSON.stringify({
        url: raw,
        embedUrl: embed ? raw : "",
        playbackType: direct ? "direct" : (embed ? "embed" : "unknown"),
        isDirectStream: direct,
        headers: direct ? {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://phim.nguonc.com/"
        } : {},
        subtitles: []
    });
}

function parseDetailResponse(apiResponseJson) {
    try {
        var r = JSON.parse(apiResponseJson || "{}");
        var candidate = r.url || r.streamUrl || r.link_m3u8 || r.m3u8 || r.file || "";
        // Accept a direct URL only when the API response explicitly contains it.
        if (!candidate && r.embed) candidate = r.embed;
        return resolveStreamData(candidate);
    } catch (e) {
        return resolveStreamData("");
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var r = JSON.parse(apiResponseJson || "{}");
        var items = extractItems(r);
        return JSON.stringify(items.map(function (x) {
            return { name: x.name || "", slug: x.slug || x.id || "" };
        }));
    } catch (_) { return "[]"; }
}
function parseCountriesResponse(apiResponseJson) {
    try {
        var r = JSON.parse(apiResponseJson || "{}");
        return JSON.stringify(extractItems(r).map(function (x) {
            return { name: x.name || "", value: x.slug || x.id || "" };
        }));
    } catch (_) { return "[]"; }
}
function parseYearsResponse(apiResponseJson) {
    try {
        var items = extractItems(JSON.parse(apiResponseJson || "{}"));
        return JSON.stringify(items.map(function (x) {
            var val = x.slug || x.value || x.year || x.name || x;
            return { name: String(x.name || val), value: String(val) };
        }));
    } catch (_) { return getLocalYearsJson(); }
}
