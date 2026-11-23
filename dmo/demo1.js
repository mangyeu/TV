// NguonC plugin - KKPhim compatible structure
// API: https://phim.nguonc.com/api

function getManifest() {
    return JSON.stringify({
        id: "nguonc",
        name: "NguồnC",
        version: "1.0.3",
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
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "hanh-dong", title: "Phim Hành Động", type: "Horizontal", path: "the-loai" }
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

// URL GENERATION
function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = Math.max(1, parseInt(filters.page, 10) || 1);
        var s = String(slug || "phim-moi-cap-nhat").trim();
        var base = "https://phim.nguonc.com/api/films/";

        if (s === "phim-moi" || s === "phim-moi-cap-nhat" || s === "phim-moi-cap-nhat-v3") {
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
        if (["phim-bo", "phim-le", "tv-shows", "hoat-hinh", "phim-vietsub", "phim-thuyet-minh", "phim-long-tieng", "subteam"].indexOf(s) >= 0) {
            return base + "danh-sach/" + encodeURIComponent(s) + "?page=" + page;
        }
        return base + "the-loai/" + encodeURIComponent(s) + "?page=" + page;
    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = Math.max(1, parseInt(filters.page, 10) || 1);
        return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(String(keyword || "").trim()) + "&page=" + page;
    } catch (e) {
        return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(keyword || "") + "&page=1";
    }
}

function getUrlDetail(slug) {
    return "https://phim.nguonc.com/api/film/" + encodeURIComponent(slug || "");
}
function getUrlCategories() {
    return "https://phim.nguonc.com/api/films/the-loai/hanh-dong?page=1";
}
function getUrlCountries() {
    return "https://phim.nguonc.com/api/films/quoc-gia/viet-nam?page=1";
}
function getUrlYears() {
    return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + new Date().getFullYear() + "?page=1";
}
function getLocalYearsJson() {
    var years = [], current = new Date().getFullYear();
    for (var y = current; y >= 1970; y--) years.push({ name: String(y), value: String(y) });
    return JSON.stringify(years);
}

// HELPERS
function extractArrayItems(response) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.items)) return response.data.items;
    return [];
}
function apiSucceeded(response) {
    return !response || response.status === undefined || response.status === "success";
}
function normalizeExternalIds(value) {
    value = value || {};
    var tmdb = value.tmdb || null;
    var imdb = value.imdb || null;
    return {
        tmdb: tmdb ? {
            id: tmdb.id == null ? null : tmdb.id,
            type: tmdb.type || null,
            season: tmdb.season == null ? null : tmdb.season,
            url: tmdb.url || null
        } : null,
        imdb: imdb ? { id: imdb.id || null, url: imdb.url || null } : null
    };
}
function getImageUrl(path) {
    if (!path) return "";
    var p = String(path).trim();
    if (/^https?:\/\//i.test(p)) return p;
    return "https://phim.nguonc.com" + (p.charAt(0) === "/" ? p : "/" + p);
}
function cleanText(html) {
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
function toNames(arr) {
    if (!Array.isArray(arr)) return "";
    return arr.map(function (x) {
        return typeof x === "string" ? x : (x && (x.name || x.title)) || "";
    }).filter(Boolean).join(", ");
}
function defaultPagination(itemsLength) {
    return { currentPage: 1, totalPages: 1, totalItems: itemsLength || 0, itemsPerPage: 24 };
}

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");
        if (!apiSucceeded(response)) {
            return JSON.stringify({ items: [], error: response.message || "API error", pagination: defaultPagination(0) });
        }
        var items = extractArrayItems(response);
        var paginate = response.paginate || {};
        var movies = items.map(function (item) {
            item = item || {};
            var external = normalizeExternalIds(item);
            return {
                id: item.slug || item.id || "",
                title: item.name || item.title || "",
                posterUrl: getImageUrl(item.poster_url || item.poster || item.thumb_url || item.thumb || item.image),
                backdropUrl: getImageUrl(item.thumb_url || item.thumb || item.backdrop || item.poster_url || item.poster),
                year: parseInt(item.year, 10) || 0,
                quality: item.quality || "",
                episode_current: item.current_episode || item.episode_current || item.episode || "",
                lang: item.language || item.lang || "",
                tmdb: external.tmdb,
                imdb: external.imdb,
                tmdbId: external.tmdb && external.tmdb.id != null ? String(external.tmdb.id) : "",
                tmdbType: external.tmdb && external.tmdb.type ? external.tmdb.type : "",
                tmdbSeason: external.tmdb && external.tmdb.season != null ? external.tmdb.season : 0,
                tmdbUrl: external.tmdb && external.tmdb.url ? external.tmdb.url : "",
                imdbId: external.imdb && external.imdb.id ? external.imdb.id : "",
                imdbUrl: external.imdb && external.imdb.url ? external.imdb.url : ""
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
            category: response.cat || null,
            status: response.status || "success"
        });
    } catch (e) {
        return JSON.stringify({ items: [], error: "Invalid API response: " + e.message, pagination: defaultPagination(0) });
    }
}
function parseSearchResponse(apiResponseJson) { return parseListResponse(apiResponseJson); }

// PLAYABLE SOURCE SCAN: tolerate changing API fields and nested server/episode shapes.
function isPlayableUrl(value) {
    if (typeof value !== "string") return false;
    var v = value.trim();
    return /^https?:\/\//i.test(v) && !/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(v);
}
function urlKind(url) {
    if (/\.m3u8(\?|#|$)/i.test(url)) return "m3u8";
    if (/\.mp4(\?|#|$)/i.test(url)) return "mp4";
    if (/\.(mpd|m4v|mov|webm)(\?|#|$)/i.test(url)) return "direct";
    return "embed";
}
function collectPlayableLinks(obj, out, seen, depth) {
    if (!obj || depth > 10) return;
    if (typeof obj === "string") {
        var str = obj.trim();
        // Handle JSON strings nested inside API fields.
        if ((str.charAt(0) === "{" || str.charAt(0) === "[") && depth < 10) {
            try { collectPlayableLinks(JSON.parse(str), out, seen, depth + 1); return; } catch (_) {}
        }
        if (isPlayableUrl(str) && !seen[str]) { seen[str] = true; out.push(str); }
        return;
    }
    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) collectPlayableLinks(obj[i], out, seen, depth + 1);
        return;
    }
    if (typeof obj !== "object") return;
    // Prioritize known playback fields, then scan nested values for alternate source structures.
    var keys = ["m3u8", "link_m3u8", "hls", "video_url", "stream_url", "stream", "file", "src", "source", "embed", "link_embed", "embed_url", "url_embed", "url", "link", "play_url", "playUrl", "content_url", "contentUrl"];
    for (var k = 0; k < keys.length; k++) {
        var val = obj[keys[k]];
        if (val != null) collectPlayableLinks(val, out, seen, depth + 1);
    }
    for (var key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key) || keys.indexOf(key) >= 0) continue;
        // Ignore metadata and artwork; scan likely source/server/episode containers and unknown nested objects.
        if (/poster|thumb|image|avatar|logo|description|content|actor|director|category|country|tmdb|imdb/i.test(key)) continue;
        if (typeof obj[key] === "object" || (typeof obj[key] === "string" && /^https?:\/\//i.test(obj[key]))) {
            collectPlayableLinks(obj[key], out, seen, depth + 1);
        }
    }
}
function getEpisodeArrays(group) {
    if (!group) return [];
    var candidates = [group.items, group.list, group.episodes, group.server_data, group.data, group.sources];
    for (var i = 0; i < candidates.length; i++) if (Array.isArray(candidates[i])) return candidates[i];
    return [];
}
function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");
        if (!apiSucceeded(response)) return JSON.stringify({ error: response.message || "API error", servers: [] });
        var movie = response.movie || response.data && response.data.movie || {};
        var episodeGroups = movie.episodes || response.episodes || response.data && response.data.episodes || [];
        if (!Array.isArray(episodeGroups)) episodeGroups = [];
        var servers = [];
        var allSeen = {};
        for (var i = 0; i < episodeGroups.length; i++) {
            var group = episodeGroups[i] || {};
            var episodes = getEpisodeArrays(group);
            // Some APIs place one episode/source object directly in the server group.
            if (!episodes.length && (group.url || group.embed || group.link || group.m3u8 || group.file)) episodes = [group];
            var parsedEpisodes = [];
            for (var j = 0; j < episodes.length; j++) {
                var ep = episodes[j] || {};
                var links = [], localSeen = {};
                collectPlayableLinks(ep, links, localSeen, 0);
                // Episode group may expose source URLs at group level; include them as fallback.
                if (!links.length) collectPlayableLinks(group, links, localSeen, 0);
                for (var n = 0; n < links.length; n++) {
                    var link = links[n];
                    parsedEpisodes.push({
                        id: link,
                        name: ep.name || ep.title || ep.episode || ep.slug || String(j + 1),
                        slug: ep.slug || "",
                        m3u8: urlKind(link) === "m3u8" ? link : "",
                        embed: urlKind(link) === "embed" ? link : "",
                        sourceType: urlKind(link)
                    });
                }
            }
            if (parsedEpisodes.length) servers.push({ name: group.server_name || group.server || group.name || ("Server " + (i + 1)), episodes: parsedEpisodes });
        }
        // Last-resort scan entire detail response for playable URLs missed by schema assumptions.
        if (!servers.length) {
            var fallbackLinks = [], fallbackSeen = {};
            collectPlayableLinks(response, fallbackLinks, fallbackSeen, 0);
            if (fallbackLinks.length) servers.push({ name: "Nguồn dự phòng", episodes: fallbackLinks.map(function (url, index) {
                return { id: url, name: "Nguồn " + (index + 1), slug: "", m3u8: urlKind(url) === "m3u8" ? url : "", embed: urlKind(url) === "embed" ? url : "", sourceType: urlKind(url) };
            }) });
        }
        var external = normalizeExternalIds(movie);
        return JSON.stringify({
            id: movie.slug || movie.id || "", title: movie.name || movie.title || "",
            originName: movie.original_name || movie.origin_name || movie.original_title || "",
            posterUrl: getImageUrl(movie.poster_url || movie.poster || movie.thumb_url || movie.thumb),
            backdropUrl: getImageUrl(movie.thumb_url || movie.thumb || movie.backdrop || movie.poster_url || movie.poster),
            description: cleanText(movie.description || movie.content || movie.desc),
            year: parseInt(movie.year, 10) || 0, rating: parseFloat(movie.rating || movie.vote_average) || 0,
            quality: movie.quality || "", duration: movie.duration || movie.time || "", servers: servers,
            episode_current: movie.current_episode || movie.episode_current || movie.episode || "",
            lang: movie.language || movie.lang || "", category: toNames(movie.category || movie.categories),
            country: toNames(movie.country || movie.countries), director: toNames(movie.director),
            casts: toNames(movie.actor || movie.actors || movie.cast), status: movie.status || response.status || "",
            tmdb: external.tmdb, imdb: external.imdb,
            tmdbId: external.tmdb && external.tmdb.id != null ? String(external.tmdb.id) : "",
            tmdbSeason: external.tmdb && external.tmdb.season != null ? external.tmdb.season : 0,
            tmdbType: external.tmdb && external.tmdb.type ? external.tmdb.type : "",
            tmdbUrl: external.tmdb && external.tmdb.url ? external.tmdb.url : "",
            imdbId: external.imdb && external.imdb.id ? external.imdb.id : "",
            imdbUrl: external.imdb && external.imdb.url ? external.imdb.url : ""
        });
    } catch (e) { return JSON.stringify({ error: "Parse detail failed: " + e.message, servers: [] }); }
}

function resolveStreamData(streamInput) {
    var raw = String(streamInput || "").trim();
    var links = [], seen = {};
    collectPlayableLinks(raw, links, seen, 0);
    var url = links.length ? links[0] : raw;
    return JSON.stringify({
        url: url,
        isDirectStream: urlKind(url) === "m3u8" || urlKind(url) === "mp4" || urlKind(url) === "direct",
        headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://phim.nguonc.com/" },
        subtitles: []
    });
}
function parseDetailResponse(apiResponseJson) {
    try {
        var parsed = JSON.parse(apiResponseJson || "{}");
        var links = [], seen = {};
        collectPlayableLinks(parsed, links, seen, 0);
        var url = links.length ? links[0] : (parsed.url || parsed.streamUrl || parsed.m3u8 || parsed.link_m3u8 || parsed.embed || parsed.link_embed || parsed.link || "");
        return resolveStreamData(url);
    } catch (e) { return resolveStreamData(apiResponseJson); }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");
        if (!apiSucceeded(response)) return "[]";
        var cat = response.cat;
        if (Array.isArray(cat)) return JSON.stringify(cat.map(function (x) { return { name: x.name || x.title || "", slug: x.slug || x.value || "" }; }));
        if (cat && typeof cat === "object") return JSON.stringify([{ name: cat.name || cat.title || "", slug: cat.slug || cat.value || "" }]);
        return JSON.stringify(extractArrayItems(response).map(function (x) { return { name: x.name || x.title || "", slug: x.slug || x.value || "" }; }));
    } catch (e) { return "[]"; }
}
function parseCountriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");
        if (!apiSucceeded(response)) return "[]";
        var cat = response.cat;
        if (Array.isArray(cat)) return JSON.stringify(cat.map(function (x) { return { name: x.name || x.title || "", value: x.slug || x.value || "" }; }));
        if (cat && typeof cat === "object") return JSON.stringify([{ name: cat.name || cat.title || "", value: cat.slug || cat.value || "" }]);
        return JSON.stringify(extractArrayItems(response).map(function (x) { return { name: x.name || x.title || "", value: x.slug || x.value || "" }; }));
    } catch (e) { return "[]"; }
}
function parseYearsResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson || "{}");
        if (!apiSucceeded(response)) return "[]";
        return JSON.stringify(extractArrayItems(response).map(function (x) {
            var value = typeof x === "object" ? (x.slug || x.value || x.year || x.name) : x;
            return { name: String(value || ""), value: String(value || "") };
        }));
    } catch (e) { return "[]"; }
}
