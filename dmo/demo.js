// =============================================================================
// MISS AV PLUGIN v1.2.0
// Refactored: giảm lặp code, gom logic UUID/preview/header về 1 chỗ
// =============================================================================

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------
var BASE_URL     = "https://missav.media";
var REFERER_URL  = "https://missav123.com/";
var CDN_HOSTS    = ["surrit.com", "sixyik.com", "nineyu.com", "fourhoi.com"];
var UUID_REGEX   = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
var UUID_BLACKLIST = [
    "snaptrckr", "user_uuid", "popunder", "banner",
    "monitoring", "crypto", "randomUUID", "generateUUID"
];
var LANG_NAMES = [
    "Tiếng Việt", "English", "繁體中文", "简体中文", "日本語", "한국의",
    "Melayu", "ไทย", "Deutsch", "Français", "Bahasa Indonesia",
    "Filipino", "Português", "MissAV"
];

// -----------------------------------------------------------------------------
// MANIFEST & CONFIG
// -----------------------------------------------------------------------------
function getManifest() {
    return JSON.stringify({
        id: "missav",
        name: "MissAV",
        version: "1.2.0",
        baseUrl: BASE_URL,
        referrer: REFERER_URL,
        iconUrl: "https://raw.githubusercontent.com/youngbi/repo/main/plugins/missav.ico",
        isEnabled: true,
        isAdult: true,
        type: "VIDEO",
        layoutType: "HORIZONTAL",
        subtitleCat: true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'vi/today-hot',   title: 'Hot Hôm Nay',      type: 'Horizontal', path: '' },
        { slug: 'vi/weekly-hot',  title: 'Hot Trong Tuần',   type: 'Horizontal', path: '' },
        { slug: 'vi/monthly-hot', title: 'Hot Trong Tháng',  type: 'Horizontal', path: '' },
        { slug: 'vi/uncensored-leak', title: 'Không Che (Rò Rỉ)', type: 'Horizontal', path: '' },
        { slug: 'vi/release',     title: 'Mới Cập Nhật',     type: 'Grid',       path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'vi/new' },
        { name: 'Nữ diễn viên', slug: 'vi/actresses' },
        { name: 'Thể loại',     slug: 'vi/genres' },
        { name: 'Không che',    slug: 'vi/uncensored-leak' },
        { name: "FC2",              slug: "vi/fc2" },
        { name: "HEYZO",            slug: "vi/heyzo" },
        { name: "Tokyo Hot",        slug: "vi/tokyohot" },
        { name: "1pondo",           slug: "vi/1pondo" },
        { name: "Caribbeancom",     slug: "vi/caribbeancom" },
        { name: "Caribbeancompr",   slug: "vi/caribbeancompr" },
        { name: "10musume",         slug: "vi/10musume" },
        { name: "pacopacomama",     slug: "vi/pacopacomama" },
        { name: "Gachinco",         slug: "vi/gachinco" },
        { name: "XXX-AV",           slug: "vi/xxx-av" },
        { name: "MarriedSlash",     slug: "vi/marriedslash" },
        { name: "Naughty4610",      slug: "vi/naughty4610" },
        { name: "Naughty0930",      slug: "vi/naughty0930" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất',   value: 'new' },
            { name: 'Xem nhiều',  value: 'views' },
            { name: 'Hôm nay',    value: 'today_views' },
            { name: 'Tuần này',   value: 'weekly_views' },
            { name: 'Tháng này',  value: 'monthly_views' }
        ],
        category: [
            { name: "Tất cả thể loại",     value: "vi/genres" },
            { name: "Mới cập nhật",        value: "vi/new" },
            { name: "Phát hành mới",       value: "vi/release" },
            { name: "Không che (Rò rỉ)",   value: "vi/uncensored-leak" },
            { name: "Nữ diễn viên",        value: "vi/actresses" },
            { name: "BXH Diễn viên",       value: "vi/actresses/ranking" },
            { name: "Nhà sản xuất",        value: "vi/makers" },
            { name: "VR",                  value: "vi/genres/VR" },
            { name: "Xem nhiều hôm nay",   value: "vi/today-hot" },
            { name: "Xem nhiều tuần",      value: "vi/weekly-hot" },
            { name: "Xem nhiều tháng",     value: "vi/monthly-hot" },
            { name: "Phụ đề Anh",          value: "vi/english-subtitle" },
            { name: "Phụ đề China",        value: "vi/chinese-subtitle" },
            { name: "SIRO",       value: "vi/series/SIRO" },
            { name: "LUXU",       value: "vi/series/LUXU" },
            { name: "GANA",       value: "vi/series/GANA" },
            { name: "MAAN",       value: "vi/series/MAAN" },
            { name: "S-CUTE",     value: "vi/series/S-CUTE" },
            { name: "ARA",        value: "vi/series/ARA" },
            { name: "FC2",            value: "vi/series/FC2" },
            { name: "HEYZO",          value: "vi/series/HEYZO" },
            { name: "Tokyo Hot",      value: "vi/series/Tokyo-Hot" },
            { name: "1pondo",         value: "vi/series/1pondo" },
            { name: "Caribbeancom",   value: "vi/series/Caribbeancom" },
            { name: "Caribbeancompr", value: "vi/series/Caribbeancompr" },
            { name: "10musume",       value: "vi/series/10musume" },
            { name: "pacopacomama",   value: "vi/series/pacopacomama" },
            { name: "Gachinco",       value: "vi/series/Gachinco" },
            { name: "XXX-AV",         value: "vi/series/XXX-AV" },
            { name: "MarriedSlash",   value: "vi/series/MarriedSlash" },
            { name: "Naughty4610",    value: "vi/series/naughty4610" },
            { name: "Naughty0930",    value: "vi/series/naughty0930" }
        ]
    });
}

// -----------------------------------------------------------------------------
// URL GENERATORS
// -----------------------------------------------------------------------------
function _normalizePath(path) {
    if (!path) path = "vi/new";
    return path.charAt(0) === "/" ? path.substring(1) : path;
}

function getUrlList(slug, filtersJson) {
    var f = JSON.parse(filtersJson || "{}");
    var page = f.page || 1;
    var path = _normalizePath(slug || "vi/new");

    var url = BASE_URL + "/" + path + "?page=" + page;
    if (f.sort && f.sort !== 'new' && f.sort !== 'hot') {
        url += "&sort=" + f.sort;
    } else if (f.sort === 'hot') {
        url += "&sort=views";
    }
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var f = JSON.parse(filtersJson || "{}");
    var page = f.page || 1;
    return BASE_URL + "/vi/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    if (slug.indexOf("http") === 0) return slug;
    return slug.charAt(0) === "/" ? BASE_URL + slug : BASE_URL + "/vi/" + slug;
}

function getUrlCategories() { return BASE_URL + "/vi/genres"; }
function getUrlCountries()  { return ""; }
function getUrlYears()      { return ""; }

// =============================================================================
// CORE HELPERS (gom logic dùng chung)
// =============================================================================
var U = {
    // --- HTML normalization ---
    normalize: function (html) {
        if (!html) return "";
        return html.replace(/class="([^"]*)"/g, function (_, v) {
            return 'class="' + v.replace(/missav_media-/g, '') + '"';
        });
    },

    // --- Text cleanup ---
    text: function (s) {
        if (!s) return "";
        return s.replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
            .replace(/\s+/g, " ").trim();
    },

    meta: function (html, prop) {
        var m = html.match(new RegExp('property="' + prop + '"\\s+content="([^"]+)"', 'i'));
        return m ? m[1] : "";
    },

    metaList: function (html, prop) {
        var rx = new RegExp('property="' + prop + '"\\s+content="([^"]+)"', 'gi');
        var out = [], m;
        while ((m = rx.exec(html)) !== null) out.push(m[1]);
        return out;
    },

    // --- Slug helpers ---
    toSlug: function (url) {
        if (!url) return "";
        var s = url.replace(/^https?:\/\/[^\/]+/, "");
        return s.charAt(0) === "/" ? s : "/" + s;
    },

    // =========================================================================
    // ★ CORE: UUID EXTRACTION — dùng chung cho player & preview
    // =========================================================================
    extractUuid: function (html) {
        if (!html) return "";

        // Strategy 1: eval(p,a,c,k,e,d) packer
        var evalMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
        if (evalMatch) {
            var parts = evalMatch[1].split('|');
            var hasCdn = parts.some(function (p) {
                return p === 'surrit' || p === 'sixyik';
            });
            if (hasCdn) {
                var hex = parts.filter(function (p) { return /^[0-9a-f]{8,12}$/.test(p); });
                if (hex.length >= 5) {
                    return hex[0] + '-' + hex[1] + '-' + hex[2] + '-' + hex[3] + '-' + hex[4];
                }
            }
        }

        // Strategy 2: domain direct scan
        for (var i = 0; i < CDN_HOSTS.length; i++) {
            var host = CDN_HOSTS[i].replace(".", "\\.");
            var m = html.match(new RegExp(host + '\\/([0-9a-f-]{36})', 'i'));
            if (m) return m[1];
        }

        // Strategy 3: blob: URL
        var blob = html.match(/src=["']blob:[^"']+\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})["']/i);
        if (blob) return blob[1];

        // Strategy 4: deep scan with context blacklist
        var matches = html.match(UUID_REGEX) || [];
        for (var i = 0; i < matches.length; i++) {
            var u = matches[i];
            var idx = html.indexOf(u);
            if (idx === -1) continue;
            var ctx = html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 80));
            var bad = UUID_BLACKLIST.some(function (b) { return ctx.indexOf(b) !== -1; });
            if (!bad) return u;
        }
        return "";
    },

    // Preview URL từ item HTML (list page)
    extractPreview: function (itemHtml) {
        var m = itemHtml.match(/<video[^>]+data-src="([^"]+)"/);
        var url = m ? m[1] : "";
        if (url && /^[0-9a-f-]{36}$/i.test(url)) return "https://surrit.com/" + url + "/preview.mp4";
        if (!url) {
            var u = U.extractUuid(itemHtml);
            if (u) return "https://surrit.com/" + u + "/preview.mp4";
        }
        return url && url.indexOf('//') === 0 ? "https:" + url : url;
    },

    // Build stream link đầy đủ (dùng trong parseDetailResponse)
    buildStream: function (uuid) {
        return uuid ? "https://surrit.com/" + uuid + "/playlist.m3u8" : "";
    },

    buildHeaders: function () {
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": REFERER_URL,
            "Origin": "https://missav123.com"
        };
    }
};

// =============================================================================
// PARSERS
// =============================================================================

// -----------------------------------------------------------------------------
// parseListResponse
// -----------------------------------------------------------------------------
function parseListResponse(html) {
    html = U.normalize(html);
    var movies = [];

    // --- Detect search page (dynamic JS) ---
    var isSearch = html.indexOf('recombee.SearchItems') !== -1 ||
                   (html.indexOf('x-data="{') !== -1 && html.indexOf('recommendItems') !== -1);

    if (isSearch) {
        return JSON.stringify({
            items: [{
                id: "/vi", title: "⚠️ Tìm kiếm MissAV chưa hỗ trợ",
                posterUrl: "", backdropUrl: "",
                description: "Trang tìm kiếm dùng Alpine.js + Recombee API (dynamic), không parse được từ HTML tĩnh. Vui lòng dùng 'Thể loại' hoặc 'Mới nhất'.",
                year: 0, quality: "INFO", episode_current: "", lang: ""
            }],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 1 }
        });
    }

    // --- Detect page type ---
    var actressLinks = html.match(/href="[^"]*\/actresses\/[^"]+"/g);
    var isActresses = actressLinks && actressLinks.length > 5;
    var isGenres = !isActresses &&
                   html.indexOf('class="text-nord13"') !== -1 &&
                   html.indexOf(':đếm video') !== -1;

    if (isActresses) movies = _parseActresses(html);
    else if (isGenres) movies = _parseGenres(html);

    // --- Standard movie list ---
    if (movies.length === 0) movies = _parseMovieList(html);

    return JSON.stringify({
        items: movies,
        pagination: _parsePagination(html, movies.length)
    });
}

function _parseActresses(html) {
    var grid = html.match(/<ul[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
    var scope = grid ? grid[1] : html;
    var out = [], seen = {};
    var liRx = /<li[\s\S]*?<\/li>/gi, m;

    while ((m = liRx.exec(scope)) !== null) {
        var item = m[0];
        var url = (item.match(/href="([^"]*\/actresses\/[^"]+)"/) || [])[1];
        if (!url || url.indexOf('?') !== -1) continue;

        var nameRaw = (item.match(/<h4[^>]*>([\s\S]*?)<\/h4>/) || [])[1]
                   || (item.match(/<img[^>]+alt="([^"]+)"/) || [])[1] || "";
        var name = U.text(nameRaw);
        if (!name || name.length < 2 || name.indexOf(':đếm') !== -1) continue;
        if (LANG_NAMES.indexOf(name) !== -1) continue;

        var img = (item.match(/<img[^>]+src="([^"]+)"/) || [])[1] || "";
        if (img.indexOf('flag') !== -1 || img.indexOf('icon') !== -1) img = "";

        var slug = U.toSlug(url);
        if (seen[slug]) continue;
        seen[slug] = true;

        out.push({
            id: slug, title: name, posterUrl: img, backdropUrl: img,
            description: "Nữ diễn viên", year: 0, quality: "ACTRESS",
            episode_current: "", lang: ""
        });
    }
    return out;
}

function _parseGenres(html) {
    var out = [], seen = {};
    var rx = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, m;

    while ((m = rx.exec(html)) !== null) {
        var url = m[1], inner = m[2];
        if (url.indexOf('/genres/') === -1) continue;
        if (inner.indexOf(':đếm video') !== -1) continue;

        var name = U.text(inner);
        if (!name || name.length < 2) continue;

        var slug = U.toSlug(url);
        if (seen[slug]) continue;
        seen[slug] = true;

        out.push({
            id: slug, title: name, posterUrl: "", backdropUrl: "",
            description: "Thể loại", year: 0, quality: "CAT",
            episode_current: "", lang: ""
        });
    }
    return out;
}

function _parseMovieList(html) {
    var out = [];
    var parts = html.split('thumbnail group');
    if (parts.length <= 1) parts = html.split('class="thumbnail');

    for (var i = 1; i < parts.length; i++) {
        var item = parts[i];

        // Slug từ href
        var href = (item.match(/<a[^>]+href="([^"]+)"/) || [])[1] || "";
        var slug = href ? U.toSlug(href) : "";
        if (!slug || slug.indexOf('actresses') !== -1 || slug.indexOf('genres') !== -1) continue;

        // Code
        var code = U.text((item.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/) || [])[1] || "");
        if (!code && slug) {
            var sp = slug.split("/");
            code = sp[sp.length - 1];
        }

        // Title candidates (lấy dài nhất)
        var titleCandidates = [];
        var imgAlt = item.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
        if (imgAlt) titleCandidates.push(U.text(imgAlt[1]));
        var tRx = /title="([^"]+)"/gi, t;
        while ((t = tRx.exec(item)) !== null) {
            var v = U.text(t[1]);
            if (v.toUpperCase() !== code.toUpperCase()) titleCandidates.push(v);
        }
        var best = "";
        titleCandidates.forEach(function (c) { if (c.length > best.length) best = c; });

        // Strip code prefix
        var title = best || code;
        if (code && title.toUpperCase().indexOf(code.toUpperCase()) === 0) {
            var stripped = title.substring(code.length).trim();
            if (stripped.charAt(0) === "-" || stripped.charAt(0) === " ") stripped = stripped.substring(1).trim();
            if (stripped.length > 3) title = stripped;
        }
        if (!title) title = "No Title";

        // Thumbnail (upgrade to cover.jpg)
        var thumb = (item.match(/<img[\s\S]*?data-src="([^"]+)"/) || item.match(/<img[\s\S]*?src="([^"]+)"/) || [])[1] || "";
        if (thumb.indexOf("cover-t.jpg") !== -1) thumb = thumb.replace("/cover-t.jpg", "/cover.jpg");

        // Filter junk template items
        if (slug.indexOf('item.') !== -1 || slug.indexOf('{{') !== -1 || slug === "/" || slug === "#") continue;
        if (title.indexOf('item.') !== -1 || title.indexOf('{{') !== -1) continue;
        if (thumb.indexOf('item.') !== -1 || thumb.indexOf('itemUrl') !== -1) continue;

        // Duration + Uncensored
        var durM = item.match(/<span[^>]*>\s*(\d+):(\d+):(\d+)\s*<\/span>/);
        var duration = durM ? durM[1] + ":" + durM[2] + ":" + durM[3] : "";
        var uncensored = item.indexOf("Không kiểm duyệt") !== -1 ||
                         item.indexOf("Uncensored") !== -1 ||
                         item.indexOf("bg-blue-800") !== -1;

        out.push({
            id: slug,
            title: title,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: duration,
            year: 0,
            quality: uncensored ? "K.K.Duyệt" : "HD",
            episode_current: uncensored ? "K.K.Duyệt" : "Full",
            lang: code,
            previewUrl: U.extractPreview(item)
        });
    }
    return out;
}

function _parsePagination(html, itemCount) {
    var current = 1, total = 1;
    var cm = html.match(/<span[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i)
          || html.match(/<a[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/a>/i);
    if (cm) current = parseInt(cm[1]);

    var pages = html.match(/page=(\d+)/g) || [];
    pages.forEach(function (p) {
        var n = parseInt(p.match(/\d+/)[0]);
        if (n > total) total = n;
    });

    var totalM = html.match(/\/ (\d+)\s*<\/span>/)
              || html.match(/>(\d+)<\/a>\s*<a[^>]*aria-label="Next"/i);
    if (totalM) total = Math.max(total, parseInt(totalM[1]));

    return { currentPage: current, totalPages: total || 1, totalItems: itemCount, itemsPerPage: 20 };
}

function parseSearchResponse(html) { return parseListResponse(html); }

// -----------------------------------------------------------------------------
// parseMovieDetail — KHÔNG chứa logic UUID (đã chuyển sang parseDetailResponse)
// -----------------------------------------------------------------------------
function parseMovieDetail(html, pageUrl) {
    html = U.normalize(html);
    try {
        var getField = function (key) {
            var rx = new RegExp("<span>" + key + ":<\\/span>([\\s\\S]*?)<\\/div>", "i");
            var m = html.match(rx);
            if (!m) return "";
            var c = m[1];
            var link = c.match(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
            if (link) return "[" + U.text(link[2]) + "](" + U.toSlug(link[1]) + ")";
            var time = c.match(/<time[^>]*>([^<]+)<\/time>/i);
            if (time) return U.text(time[1]);
            var span = c.match(/<span[^>]*>([^<]+)<\/span>/i);
            if (span) return U.text(span[1]);
            return U.text(c.replace(/<[^>]+>/g, ""));
        };

        var getMultiField = function (key) {
            var start = html.match(new RegExp("<span>" + key + ":<\\/span>", "i"));
            if (!start) return "";
            var idx = start.index + start[0].length;
            var rest = html.substring(idx);
            var end = rest.indexOf("</div>");
            var content = end === -1 ? rest : rest.substring(0, end);
            var items = [];
            var rx = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, m;
            while ((m = rx.exec(content)) !== null) {
                var txt = U.text(m[2]);
                if (txt && txt.indexOf("<img") === -1) items.push("[" + txt + "](" + U.toSlug(m[1]) + ")");
            }
            return items.join(", ");
        };

        var code        = getField("Mã số") || getField("Code") || (html.match(/dvdId:\s*'([^']+)'/) || [])[1] || "";
        var releaseDate = getField("Ngày phát hành") || getField("Release date");
        var studio      = getField("nhà sản xuất") || getField("Maker");
        var director    = getField("Giám đốc") || getField("Director");
        var label       = getField("Nhãn") || getField("Label");
        var casts       = getMultiField("Nữ diễn viên") || getMultiField("Actresses");
        var genres      = getMultiField("thể loại") || getMultiField("Genre") || getMultiField("Genres");
        var series      = getMultiField("Loạt") || getMultiField("Series");

        var title = U.meta(html, "og:title");
        var thumb = U.meta(html, "og:image");
        var desc  = U.meta(html, "og:description");

        // Preview: ưu tiên data-src của <video>, fallback từ cover.jpg
        var previewUrl = (html.match(/<video[^>]+data-src="([^"]+)"/) || [])[1] || "";
        if (!previewUrl && thumb && thumb.indexOf("cover.jpg") !== -1) {
            previewUrl = thumb.replace("cover.jpg", "preview.mp4");
        }

        // Display title: [CODE] Title (truncated)
        var displayTitle = title;
        if (code && displayTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
            displayTitle = displayTitle.substring(code.length).trim();
            if (displayTitle.charAt(0) === "-" || displayTitle.charAt(0) === " ") displayTitle = displayTitle.substring(1).trim();
        }
        if (code) displayTitle = "[" + code.toUpperCase() + "] " + displayTitle;
        var words = displayTitle.split(" ");
        if (words.length > 25) displayTitle = words.slice(0, 25).join(" ") + "...";

        // Status line
        var status = "";
        if (studio) status += "Studio: " + studio;
        if (label)  status += (status ? " | " : "") + "Label: " + label;
        if (!status && releaseDate) status = "Released: " + releaseDate;

        var year = releaseDate ? parseInt(releaseDate.substring(0, 4)) : 0;

        // ★ Server: trả về pageUrl làm episodeId → player gọi parseDetailResponse() để resolve m3u8 + headers
        var servers = [];
        if (pageUrl) {
            servers.push({
                name: "Stream",
                episodes: [{ id: pageUrl, name: "Full", slug: "full" }]
            });
        }

        return JSON.stringify({
            id: code || "",
            title: U.text(displayTitle),
            posterUrl: thumb,
            backdropUrl: thumb,
            description: U.text(desc),
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: year,
            rating: 0,
            casts: casts,
            director: director,
            category: genres,
            status: status,
            duration: series ? "Series: " + series : "",
            previewUrl: previewUrl
        });
    } catch (e) {
        return "null";
    }
}

// -----------------------------------------------------------------------------
// parseDetailResponse — CHỈ resolve m3u8 + headers (dùng U.extractUuid)
// -----------------------------------------------------------------------------
function parseDetailResponse(html) {
    var uuid = U.extractUuid(html);
    return JSON.stringify({
        url: U.buildStream(uuid),
        headers: U.buildHeaders(),
        subtitles: []
    });
}

// -----------------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------------
function parseCategoriesResponse(html) {
    html = U.normalize(html);
    var cats = [{ name: "Tất cả thể loại", slug: "vi/genres" }];
    var rx = /<a[^>]+href="([^"]*\/vi\/genres\/[^"]+)"[^>]*>([^<]+)<\/a>/g, m, seen = {};

    while ((m = rx.exec(html)) !== null) {
        var parts = m[1].split("/genres/");
        var slug = parts.length > 1 ? parts[1] : "";
        var name = U.text(m[2]);
        if (slug && name && !seen[slug]) {
            seen[slug] = true;
            cats.push({ name: name, slug: "vi/genres/" + slug });
        }
    }
    return JSON.stringify(cats);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html)     { return "[]"; }
