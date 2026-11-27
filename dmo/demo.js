// =============================================================================
// VAAPP Plugin - AVDBAPI
// Danh sach/tim kiem: HTML website AVDBAPI
// Chi tiet: JSON API /api.php/provide/vod?ac=detail&ids=ID
// =============================================================================

var API_BASE = "https://avdbapi.com/api.php/provide/vod";
var SITE_BASE = "https://avdbapi.com";
var DEFAULT_MOVIE_ID = "663160";

function safeJsonParse(value) {
    try {
        return typeof value === "string" ? JSON.parse(value) : value;
    } catch (e) {
        return null;
    }
}

function decodeHtml(value) {
    return String(value || "")
        .replace(/&amp;/g, "&")
        .replace(/&#039;|&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function asText(value) {
    if (Array.isArray(value)) return value.join(", ");
    return value == null ? "" : String(value);
}

function getManifest() {
    return JSON.stringify({
        id: "avdb_api",
        name: "AVDB API",
        version: "1.0.1",
        baseUrl: SITE_BASE,
        iconUrl: "https://avdbapi.com/favicon.ico",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        layoutType: "VERTICAL",
        // Link nguồn là trang embed; nếu App hỗ trợ WebView thì dùng embed.
        playerType: "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "latest", title: "Mới cập nhật", type: "Vertical", path: "/" },
        { slug: "censored", title: "Censored", type: "Vertical", path: "/category/censored/" },
        { slug: "uncensored", title: "Uncensored", type: "Vertical", path: "/category/uncensored/" },
        { slug: "uncensored-leaked", title: "Uncensored Leaked", type: "Vertical", path: "/category/uncensored-leaked/" },
        { slug: "amateur", title: "Amateur", type: "Vertical", path: "/category/amateur/" },
        { slug: "chinese-av", title: "Chinese AV", type: "Vertical", path: "/category/chinese-av/" },
        { slug: "hentai", title: "Hentai", type: "Vertical", path: "/category/hentai/" },
        { slug: "english-subtitle", title: "English subtitle", type: "Vertical", path: "/category/english-subtitle/" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Censored", slug: "censored" },
        { name: "Uncensored", slug: "uncensored" },
        { name: "Uncensored Leaked", slug: "uncensored-leaked" },
        { name: "Amateur", slug: "amateur" },
        { name: "Chinese AV", slug: "chinese-av" },
        { name: "Hentai", slug: "hentai" },
        { name: "English subtitle", slug: "english-subtitle" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [], country: [], year: [] });
}

// =============================================================================
// SINH URL
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = safeJsonParse(filtersJson) || {};
    var page = Math.max(1, parseInt(filters.page || 1, 10));
    var path = "/";
    var key = String(slug || "latest").replace(/^\/+|\/+$/g, "");
    if (key && key !== "latest" && key !== "home") {
        if (key.indexOf("category/") === 0) path = "/" + key + "/";
        else path = "/category/" + key + "/";
    }
    if (page > 1) {
        if (path === "/") path = "/index-" + page + "/";
        else path = path.replace(/\/$/, "") + "-" + page + "/";
    }
    return SITE_BASE + path;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = safeJsonParse(filtersJson) || {};
    var page = Math.max(1, parseInt(filters.page || 1, 10));
    return SITE_BASE + "/search/?wd=" + encodeURIComponent(String(keyword || "")) + (page > 1 ? "&page=" + page : "");
}

function getUrlDetail(slug) {
    var value = String(slug || DEFAULT_MOVIE_ID).trim();

    // Cho phép episode.id là URL embed; App sẽ tải URL này để parser xử lý.
    if (/^https?:\/\//i.test(value)) return value;

    // API detail nhận ID số qua tham số ids.
    var id = /^\d+$/.test(value) ? value : DEFAULT_MOVIE_ID;
    return API_BASE + "?ac=detail&ids=" + encodeURIComponent(id);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSER DANH SÁCH
// Dùng được nếu sau này API trả JSON có cấu trúc { list: [...] }.
// =============================================================================

function parseListResponse(response) {
    try {
        var html = String(response || "");
        var data = safeJsonParse(html);
        if (data && Array.isArray(data.list)) {
            var jsonItems = data.list.map(function (item) {
                return {
                    id: String(item.id || item.slug || ""),
                    title: decodeHtml(item.name || item.origin_name || ""),
                    posterUrl: item.poster_url || item.thumb_url || "",
                    thumbUrl: item.thumb_url || item.poster_url || "",
                    description: decodeHtml(item.description || ""),
                    year: item.year || "", quality: item.quality || "",
                    category: asText(item.category || item.type_name)
                };
            });
            return JSON.stringify({ items: jsonItems, pagination: {
                currentPage: Number(data.page || 1), totalPages: Number(data.pagecount || 1),
                totalItems: Number(data.total || jsonItems.length)
            }});
        }

        function attr(tag, name) {
            var m = String(tag || "").match(new RegExp(name + "=([^\\s>]+)", "i"));
            if (!m) return "";
            var value = m[1].replace(/^[\"']|[\"']$/g, "");
            return decodeHtml(value);
        }
        function textOf(fragment) {
            return decodeHtml(String(fragment || "").replace(/<[^>]*>/g, " ")
                .replace(/&middot;/g, "·").replace(/\s+/g, " ").trim());
        }
        var items = [];
        var liRe = /<li\b[^>]*class=["'][^"']*\bv\b[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi;
        var li;
        while ((li = liRe.exec(html)) !== null) {
            var block = li[1];
            var linkMatch = block.match(/<a\b[^>]*class=["'][^"']*v-thumb[^"']*["'][^>]*>/i);
            var titleMatch = block.match(/<a\b[^>]*class=["'][^"']*v-title[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
            var idMatch = block.match(/<span\b[^>]*class=["'][^"']*v-id[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var codeMatch = block.match(/<span\b[^>]*class=["'][^"']*v-code[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var durMatch = block.match(/<span\b[^>]*class=["'][^"']*v-dur[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var typeMatch = block.match(/<span\b[^>]*class=["'][^"']*v-type[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var dateMatch = block.match(/<span\b[^>]*class=["'][^"']*v-date[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var id = idMatch ? textOf(idMatch[1]) : "";
            var titleTag = titleMatch ? titleMatch[0].match(/^<a\b[^>]*>/i) : null;
            var detailPath = titleTag ? attr(titleTag[0], "href") : "";
            var imageMatch = block.match(/<img\b[^>]*>/i);
            var imageTag = imageMatch ? imageMatch[0] : "";
            var poster = imageTag ? (attr(imageTag, "data-src") || attr(imageTag, "src")) : "";
            if (!id && detailPath) { var idFromPath = detailPath.match(/(\d+)(?:\/)?$/); if (idFromPath) id = idFromPath[1]; }
            if (!id || !titleMatch) continue;
            items.push({
                id: id, title: textOf(titleMatch[1]), posterUrl: poster, thumbUrl: poster,
                detailUrl: detailPath ? SITE_BASE + detailPath : "",
                code: codeMatch ? textOf(codeMatch[1]) : "",
                duration: durMatch ? textOf(durMatch[1]) : "",
                category: typeMatch ? textOf(typeMatch[1]) : "",
                updatedAt: dateMatch ? textOf(dateMatch[1]) : ""
            });
        }
        var total = 0, currentPage = 1;
        var pager = html.match(/<nav\b[^>]*class=["'][^"']*pager[^"']*["'][^>]*>/i);
        if (pager) {
            var totalMatch = pager[0].match(/data-total=["'](\d+)["']/i);
            if (totalMatch) total = parseInt(totalMatch[1], 10);
            var cur = html.match(/<a\b[^>]*aria-current=["']page["'][^>]*>(\d+)<\/a>/i);
            if (cur) currentPage = parseInt(cur[1], 10);
        }
        var totalPages = total || 1;
        return JSON.stringify({ items: items, pagination: {
            currentPage: currentPage, totalPages: totalPages,
            totalItems: total ? total * 50 : items.length
        }});
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } });
    }
}

function parseSearchResponse(response) {
    return parseListResponse(response);
}

// =============================================================================
// PARSER CHI TIẾT PHIM
// API trả episodes.server_data dạng object:
// { "Full": { "slug": "full", "link_embed": "https://..." } }
// =============================================================================

function parseMovieDetail(response) {
    try {
        var data = safeJsonParse(response) || {};
        var item = data.list && data.list.length ? data.list[0] : data;

        if (!item || !item.id) {
            return JSON.stringify({
                id: "",
                title: "Không tìm thấy dữ liệu phim",
                posterUrl: "",
                backdropUrl: "",
                description: "",
                servers: [],
                quality: "",
                year: "",
                status: "",
                duration: "",
                casts: "",
                director: "",
                category: ""
            });
        }

        var serverData = item.episodes && item.episodes.server_data
            ? item.episodes.server_data
            : {};

        var episodes = [];
        Object.keys(serverData).forEach(function (episodeName) {
            var ep = serverData[episodeName] || {};
            if (!ep.link_embed) return;

            episodes.push({
                // Giữ URL embed để getUrlDetail() nhận biết đây là URL đầy đủ.
                id: ep.link_embed,
                name: episodeName || ep.slug || "Full",
                slug: ep.slug || episodeName || "full"
            });
        });

        var serverName = item.episodes && item.episodes.server_name
            ? item.episodes.server_name
            : "Server 1";

        return JSON.stringify({
            id: String(item.id),
            title: decodeHtml(item.name || item.origin_name || ""),
            posterUrl: item.poster_url || item.thumb_url || "",
            backdropUrl: item.thumb_url || item.poster_url || "",
            description: decodeHtml(item.description || ""),
            servers: episodes.length ? [{
                name: serverName,
                episodes: episodes
            }] : [],
            quality: item.quality || "",
            year: item.year || "",
            rating: 0,
            status: item.status || "",
            duration: item.time || "",
            casts: asText(item.actor),
            director: asText(item.director),
            category: asText(item.category || item.type_name),
            country: asText(item.country),
            movieCode: item.movie_code || "",
            releaseDate: item.vod_pubdate || item.created_at || ""
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
            year: "",
            status: "",
            duration: "",
            casts: "",
            director: "",
            category: ""
        });
    }
}

// =============================================================================
// PARSER LINK XEM
// Hỗ trợ lấy iframe hoặc URL player từ HTML/JSON của trang embed.
// Nếu upload18.to thay đổi cấu trúc trang, cần cập nhật regex tương ứng.
// =============================================================================

function extractEmbedUrl(content) {
    var source = String(content || "");
    var patterns = [
        /<iframe[^>]+src=["']([^"']+)["']/i,
        /<iframe[^]+?src=["']([^"']+)["']/i,
        /(?:file|url|src)\s*[:=]\s*["'](https?:\\?\/\\?\/[^"'\\]+)["']/i,
        /https?:\/\/[^"'\\\s<>]+(?:\.m3u8|\.mp4)(?:\?[^"'\\\s<>]*)?/i
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = source.match(patterns[i]);
        if (match) {
            var found = match[1] || match[0];
            found = found.replace(/\\\//g, "/").replace(/&amp;/g, "&");
            if (found.indexOf("//") === 0) found = "https:" + found;
            return found;
        }
    }
    return "";
}

function parseDetailResponse(response) {
    try {
        var data = safeJsonParse(response);

        // Trường hợp endpoint trả JSON có URL trực tiếp.
        if (data && typeof data === "object") {
            var direct = data.url || data.file || data.src || "";
            if (direct) {
                return JSON.stringify({
                    url: direct,
                    headers: {},
                    subtitles: [],
                    isEmbed: false
                });
            }
        }

        var embedUrl = extractEmbedUrl(response);
        if (embedUrl) {
            return JSON.stringify({
                url: embedUrl,
                headers: { "Referer": "https://upload18.to/" },
                subtitles: [],
                isEmbed: !/\.(m3u8|mp4)(\?|$)/i.test(embedUrl),
                mimeType: /\.(m3u8)(\?|$)/i.test(embedUrl)
                    ? "application/x-mpegURL"
                    : (/\.(mp4)(\?|$)/i.test(embedUrl) ? "video/mp4" : "")
            });
        }

        // Không có URL player nhận diện được: trả rỗng để tránh phát sai URL.
        return JSON.stringify({ url: "", isEmbed: false, subtitles: [] });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, subtitles: [] });
    }
}

function parseEmbedResponse(response, sourceUrl) {
    var embedUrl = extractEmbedUrl(response);

    if (embedUrl) {
        var isMedia = /\.(m3u8|mp4)(\?|$)/i.test(embedUrl);
        return JSON.stringify({
            url: embedUrl,
            isEmbed: !isMedia,
            headers: {
                "Referer": sourceUrl || "https://upload18.to/"
            },
            mimeType: /\.m3u8(\?|$)/i.test(embedUrl)
                ? "application/x-mpegURL"
                : (/\.mp4(\?|$)/i.test(embedUrl) ? "video/mp4" : "")
        });
    }

    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(response) { return "[]"; }
function parseCountriesResponse(response) { return "[]"; }
function parseYearsResponse(response) { return "[]"; }
