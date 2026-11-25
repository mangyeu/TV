// =============================================================================
// VAAPP Plugin - JAVCC (javcc.me) — WordPress + RetroTube theme
// Phát qua WebView (embed): extract defaultUrl từ script base64 trong trang chi tiết.
// Nguồn 18+ → Manifest isAdult: true.
// =============================================================================

var CONFIG = {
    baseUrl: "https://javcc.me",
    // Phân trang kiểu WordPress: /page/N/
    // Nếu base có query (?s=..., ?filter=...) → chèn /page/N/ TRƯỚC query string
    posterAttrs: ["data-src", "data-original", "data-lazy-src", "src"]
};

function getManifest() {
    return JSON.stringify({
        "id": "javcc_me",
        "name": "JAVCC",
        "version": "1.1.0",
        "baseUrl": CONFIG.baseUrl,
        "iconUrl": CONFIG.baseUrl + "/wp-content/uploads/2026/02/javcc.png",
        "isEnabled": true,
        "isAdult": true,               // ⚠️ Nội dung 18+
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embed"          // WebView phát embed
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'latest',                title: 'Mới Nhất',        type: 'Vertical', path: '/?filter=latest' },
        { slug: 'trending',              title: 'Xem Nhiều',       type: 'Vertical', path: '/?filter=views' },
        { slug: 'category/censored',         title: 'Censored',        type: 'Vertical', path: '/category/censored' },
        { slug: 'category/reducing-mosaic', title: 'Reducing Mosaic', type: 'Vertical', path: '/category/reducing-mosaic' },
        { slug: 'category/english-subtitle', title: 'English Subtitle', type: 'Vertical', path: '/category/english-subtitle' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Censored', slug: 'category/censored' },
        { name: 'Reducing Mosaic', slug: 'category/reducing-mosaic' },
        { name: 'English Subtitle', slug: 'category/english-subtitle' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ sort: [], category: [] });
}

// =============================================================================
// NHÓM 2: SINH URL
// =============================================================================

function buildPageUrl(base, page) {
    page = page || 1;
    if (page <= 1) return base;
    var q = base.indexOf("?");
    if (q !== -1) {
        // "https://javcc.me/?s=abc" → "https://javcc.me/page/2/?s=abc"
        return base.slice(0, q).replace(/\/$/, "") + "/page/" + page + "/" + base.slice(q);
    }
    return base.replace(/\/$/, "") + "/page/" + page + "/";
}

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var base;

    if (slug && slug.indexOf("http") === 0) {
        base = slug;
    } else if (slug === 'latest' || slug === '' || slug === 'home') {
        base = CONFIG.baseUrl + "/?filter=latest";
    } else if (slug === 'trending' || slug === 'views' || slug === 'popular') {
        base = CONFIG.baseUrl + "/?filter=views";
    } else {
        // slug dạng "category/censored", "actor/xxx", "studios/xxx", "tag/xxx"
        base = CONFIG.baseUrl + "/" + slug;
    }
    return buildPageUrl(base, page);
}

function getUrlSearch(keyword, filtersJson) {
    var page = JSON.parse(filtersJson || "{}").page || 1;
    // WordPress search chuẩn
    return buildPageUrl(CONFIG.baseUrl + "/?s=" + encodeURIComponent(keyword), page);
}

function getUrlDetail(slug) {
    if (slug && slug.indexOf("http") === 0) return slug;
    return CONFIG.baseUrl + "/" + slug;
}

function getUrlCategories() { return CONFIG.baseUrl + "/category"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: HELPER
// =============================================================================

function absUrl(url) {
    if (!url) return "";
    url = url.trim();
    if (url.indexOf("//") === 0) return "https:" + url;
    if (url.indexOf("http") === 0) return url;
    if (url.indexOf("/") === 0) return CONFIG.baseUrl + url;
    return CONFIG.baseUrl + "/" + url;
}

function decodeEntities(s) {
    if (!s) return "";
    return s
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&#x27;/g, "'")
        .replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(+n); })
        .replace(/\s+/g, " ").trim();
}

function b64decode(s) {
    try {
        if (typeof atob === "function") return atob(s);
    } catch (e) { /* fallthrough */ }
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var out = "";
    s = s.replace(/[^A-Za-z0-9+/=]/g, "");
    for (var i = 0; i < s.length; i += 4) {
        var c1 = chars.indexOf(s[i]);
        var c2 = chars.indexOf(s.charAt(i + 1) || "A");
        var c3 = s.charAt(i + 2) === "" || s.charAt(i + 2) === "=" ? 64 : chars.indexOf(s.charAt(i + 2));
        var c4 = s.charAt(i + 3) === "" || s.charAt(i + 3) === "=" ? 64 : chars.indexOf(s.charAt(i + 3));
        if (c1 < 0 || c2 < 0) break;
        out += String.fromCharCode((c1 << 2) | (c2 >> 4));
        if (c3 !== 64 && c3 >= 0) out += String.fromCharCode(((c2 & 15) << 4) | (c3 >> 2));
        if (c4 !== 64 && c4 >= 0) out += String.fromCharCode(((c3 & 3) << 6) | c4);
    }
    return out;
}

function pickPoster(block) {
    for (var i = 0; i < CONFIG.posterAttrs.length; i++) {
        var re = new RegExp(CONFIG.posterAttrs[i] + "=[\"']([^\"']+)[\"']", "i");
        var m = block.match(re);
        if (m && m[1] && !/blank|placeholder|svg|spacer/i.test(m[1])) return absUrl(m[1]);
    }
    return "";
}

function detectTotalPages(html, currentPage) {
    var max = currentPage, m;
    var re = /\/page\/(\d+)\//g;
    while ((m = re.exec(html)) !== null) { if (+m[1] > max) max = +m[1]; }
    re = /[?&]paged=(\d+)/g;
    while ((m = re.exec(html)) !== null) { if (+m[1] > max) max = +m[1]; }
    if (max === currentPage) {
        if (/class="[^"]*(next|pagination)[^"]*"/i.test(html) && />\s*(?:Next|›|»)\s*</i.test(html)) {
            max = currentPage + 1;
        }
    }
    return max;
}

// =============================================================================
// NHÓM 4: PARSER
// =============================================================================

/**
 * Danh sách phim — cấu trúc thật của RetroTube:
 * <article class="loop-video thumb-block ...">
 *   <a href="https://javcc.me/{slug}" title="...">
 *     <img data-src="https://pic.javcc.me/image/{slug}.jpg" alt="...">
 *     <header><span>TITLE</span></header>
 *   </a>
 * </article>
 */
function parseListResponse(html) {
    try {
        var items = [], seen = {}, m;
        // slug root-level: ngay sau domain phải là nháy đóng → loại /category/, /tag/, /page/, /actor/...
        var re = /<a\s[^>]*href="(https?:\/\/javcc\.me\/([a-z0-9][a-z0-9\-]*))"[^>]*>([\s\S]{0,1500}?)<\/a>/gi;
        while ((m = re.exec(html)) !== null) {
            var slug = m[2];
            var block = m[0];
            if (seen[slug]) continue;
            // Chỉ lấy block có ảnh (thumbnail) — lọc link menu/footer
            var poster = pickPoster(block);
            if (!poster) continue;
            var title = "";
            var tm = block.match(/title="([^"]{3,})"/i);
            if (tm) title = decodeEntities(tm[1]);
            if (!title) {
                var sm = block.match(/<span[^>]*>([\s\S]{1,300}?)<\/span>/i);
                if (sm) title = decodeEntities(sm[1].replace(/<[^>]+>/g, ""));
            }
            if (!title) {
                var am = block.match(/alt="([^"]{3,})"/i);
                if (am) title = decodeEntities(am[1]);
            }
            if (!title) title = decodeEntities(slug.replace(/-/g, " "));
            seen[slug] = 1;
            items.push({ id: slug, title: title, posterUrl: poster });
        }

        var curPage = 1;
        var curM = html.match(/\/page\/(\d+)\//) || html.match(/[?&]paged=(\d+)/);
        if (curM) curPage = +curM[1];

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: curPage,
                totalPages: Math.max(detectTotalPages(html, curPage), curPage)
            }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

/**
 * Trang chi tiết.
 * RetroTube: og:title/og:image/og:description đầy đủ; duration trong #video-date;
 * actors/studios trong các block #video-actors.
 */
function parseMovieDetail(html) {
    try {
        function og(prop) {
            var re = new RegExp('<meta[^>]+property="og:' + prop + '"[^>]+content="([^"]*)"', "i");
            var m = html.match(re);
            return m ? decodeEntities(m[1]) : "";
        }

        var canonical = "";
        var cm = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
        if (cm) canonical = cm[1];

        var id = "";
        if (canonical) {
            var sm = canonical.match(/javcc\.me\/([a-z0-9][a-z0-9\-]*)\/?$/i);
            if (sm) id = sm[1];
        }
        if (!id) {
            var ogm = html.match(/property="og:url"[^>]+content="https?:\/\/javcc\.me\/([a-z0-9][a-z0-9\-]*)"/i);
            if (ogm) id = ogm[1];
        }

        var title = og("title").replace(/\s*-\s*JAVCC\.ME\s*$/i, "");
        if (!title) {
            var hm = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            if (hm) title = decodeEntities(hm[1].replace(/<[^>]+>/g, ""));
        }

        var poster = absUrl(og("image"));

        var description = og("description");
        if (!description) {
            var dm = html.match(/<div class="desc[^"]*"[^>]*>([\s\S]{1,3000}?)<\/div>/i);
            if (dm) description = decodeEntities(dm[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
        }

        var duration = "";
        var dcm = html.match(/Duration:\s*([0-9]{1,3}:[0-9]{2}(?::[0-9]{2})?)/i);
        if (dcm) {
            var parts = dcm[1].split(":");
            if (parts.length === 3) duration = (+parts[0] * 60 + +parts[1]) + " Phút";
            else duration = dcm[1];
        }

        var year = 0;
        var ym = html.match(/article:published_time" content="(\d{4})-/) || html.match(/Date:\s*[A-Za-z]+\s+\d+,\s*(\d{4})/);
        if (ym) year = +ym[1];

        var casts = "";
        // Icon fa-star = Pornstars, fa-film = Studios (RetroTube) — neo vào icon để khỏi nhầm chữ trong mô tả
        var am = html.match(/fa-star[^<]*<\/i>\s*Pornstars?:[\s\S]{0,300}?<a [^>]*>([^<]+)<\/a>/i)
                || html.match(/Pornstars?:[\s\S]{0,200}?<a [^>]*>([^<]+)<\/a>/i);
        if (am) casts = decodeEntities(am[1].trim());

        var studio = "";
        var sm2 = html.match(/fa-film[^<]*<\/i>\s*Studios?:[\s\S]{0,300}?<a [^>]*>([^<]+)<\/a>/i)
                || html.match(/Studios?:[\s\S]{0,200}?<a [^>]*href="[^"]*\/studios\/[^"]*"[^>]*>([^<]+)<\/a>/i);
        if (sm2) studio = decodeEntities(sm2[1].trim());

        return JSON.stringify({
            id: id,
            title: title || id || "Unknown",
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            servers: [
                {
                    name: "JAVCC",
                    episodes: [{ id: id, name: "Full", slug: id }]
                }
            ],
            quality: "HD",
            year: year,
            rating: 0,
            status: "Full",
            duration: duration,
            casts: casts,
            director: studio,
            category: ""
        });
    } catch (e) {
        return JSON.stringify({
            id: "", title: "Unknown", posterUrl: "", backdropUrl: "", description: "",
            servers: [{ name: "JAVCC", episodes: [{ id: "", name: "Full", slug: "" }] }],
            quality: "", year: 0, rating: 0, status: "Full",
            duration: "", casts: "", director: "", category: ""
        });
    }
}

/**
 * Trang chi tiết → link embed WebView.
 * Player ẩn trong: <script data-rocketlazyloadscript='data:text/javascript;base64,...'>
 * JS sau khi decode chứa: var defaultUrl = "https://x.videoplay.us/x/...";
 */
function parseDetailResponse(html) {
    try {
        function embed(url) {
            return JSON.stringify({
                url: url,
                isEmbed: true,
                headers: { "Referer": CONFIG.baseUrl + "/" },
                subtitles: []
            });
        }

        // 1. defaultUrl dạng plaintext (nếu theme đổi và không còn base64)
        var m = html.match(/defaultUrl\s*=\s*"([^"]+)"/);
        if (m && /^https?:/i.test(m[1])) return embed(m[1]);

        // 2. Script base64 (rocketlazyload) — phổ biến hiện tại
        var b = html.match(/data-rocketlazyloadscript=["']data:text\/javascript;base64,([^"']+)["']/);
        if (b) {
            var js = b64decode(b[1]);
            var m2 = js.match(/defaultUrl\s*=\s*"([^"]+)"/);
            if (m2 && /^https?:/i.test(m2[1])) return embed(m2[1]);
            // Có thể script append iframe với biến khác
            var m3 = js.match(/<iframe[^>]+src=["']\s*'?\s*\+?\s*"?([^"'+\s]+)"?/);
            if (m3 && /^https?:/i.test(m3[1])) return embed(m3[1]);
        }

        // 3. Iframe có sẵn trong HTML
        var im = html.match(/<iframe[^>]+src="([^"]+)"/i);
        if (im && /^https?:/i.test(im[1])) return embed(im[1]);

        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false });
    }
}

/**
 * Nếu App fetch tiếp trang embed (x.videoplay.us...) — tìm file trực tiếp.
 */
function parseEmbedResponse(html, sourceUrl) {
    try {
        var file = html.match(/["'](https?:\/\/[^"'\s]+\.(?:m3u8|mp4)(?:\?[^"'\s]*)?)["']/i)
                || html.match(/"file"\s*:\s*"(https?:\/\/[^"]+)"/i)
                || html.match(/"src"\s*:\s*"(https?:\/\/[^"]+\.(?:m3u8|mp4)[^"]*)"/i);
        if (file) {
            return JSON.stringify({
                url: file[1],
                isEmbed: false,
                mimeType: /\.m3u8/i.test(file[1]) ? "application/x-mpegURL" : "video/mp4",
                headers: {
                    "Referer": sourceUrl || CONFIG.baseUrl + "/",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10)"
                }
            });
        }
        var iframe = html.match(/<iframe[^>]+src="([^"]+)"/i);
        if (iframe && /^https?:/i.test(iframe[1])) {
            return JSON.stringify({ url: iframe[1], isEmbed: true, headers: { "Referer": sourceUrl || CONFIG.baseUrl + "/" } });
        }
        return JSON.stringify({ url: "", isEmbed: false });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false });
    }
}

// =============================================================================
// NHÓM 5: DANH MỤC / QUỐC GIA / NĂM
// =============================================================================

/**
 * Trang /category liệt kê các category của RetroTube.
 */
function parseCategoriesResponse(html) {
    try {
        var cats = [], seen = {}, m;
        var re = /href="https?:\/\/javcc\.me\/category\/([a-z0-9\-]+)"[^>]*>([\s\S]{1,100}?)<\/a>/gi;
        while ((m = re.exec(html)) !== null) {
            var slug = m[1];
            if (seen[slug]) continue;
            var name = decodeEntities(m[2].replace(/<[^>]+>/g, "").trim());
            if (!name || name.length < 2) continue;
            seen[slug] = 1;
            cats.push({ name: name, slug: "category/" + slug });
            if (cats.length >= 100) break;
        }
        return JSON.stringify(cats);
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
