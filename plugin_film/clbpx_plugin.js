// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHAY",
        "version": "1.0.1",
        "baseUrl": "https://tvhay.buzz",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/tvhay.ico",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi', title: 'Phim Mới', type: 'Horizontal', path: 'danh-sach/phim-moi' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach/phim-bo' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach/phim-le' },
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach/phim-chieu-rap' },
        { slug: 'home', title: 'Trang Chủ', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim Mới', slug: 'phim-moi' },
        { name: 'Phim Bộ', slug: 'phim-bo' },
        { name: 'Phim Lẻ', slug: 'phim-le' },
        { name: 'Phim Chiếu Rạp', slug: 'phim-chieu-rap' },
        { name: 'Phim Hành Động', slug: 'the-loai/hanh-dong' },
        { name: 'Phim Tình Cảm', slug: 'the-loai/tinh-cam' },
        { name: 'Phim Hài Hước', slug: 'the-loai/hai-huoc' },
        { name: 'Phim Cổ Trang', slug: 'the-loai/co-trang' }
    ]);
}

function getFilterConfig() {
    // TVHAY hiện cung cấp danh mục qua getPrimaryCategories() và phân trang
    // qua filters.page. Không tự tạo schema filter không được app hỗ trợ.
    return JSON.stringify({});
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://tvhay.buzz";

    // Nếu slug rỗng hoặc 'home' → trang chủ
    if (slug === '' || slug === 'home') {
        if (page > 1) {
            return baseUrl + "/page/" + page + "/";
        }
        return baseUrl + "/";
    }

    // Các slug đã chứa đường dẫn danh mục (ví dụ: danh-sach/phim-bo)
    var path = slug;
    if (page > 1) {
        return baseUrl + "/" + path + "/page/" + page + "/";
    }
    return baseUrl + "/" + path + "/";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var safeKeyword = encodeURIComponent(keyword);
    var url = "https://tvhay.buzz/tim-kiem/" + safeKeyword + "/";
    if (page > 1) {
        url = "https://tvhay.buzz/tim-kiem/" + safeKeyword + "/page/" + page + "/";
    }
    return url;
}

// getUrlDetail: App gọi với episode.id
// episode.id được lưu dưới dạng URL đầy đủ hoặc path
function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.charAt(0) !== '/') slug = '/' + slug;
    return "https://tvhay.buzz" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS (Giả định dựa trên cấu trúc phổ biến)
// =============================================================================

// Phân tích danh sách phim (trang chủ, danh mục, tìm kiếm)
function decodeHtml(value) {
    if (!value) return "";
    return String(value)
        .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">").replace(/&#(\d+);/g, function(_, n) { return String.fromCharCode(parseInt(n, 10)); })
        .replace(/&#x([0-9a-f]+);/gi, function(_, n) { return String.fromCharCode(parseInt(n, 16)); });
}

function absoluteUrl(url, base) {
    url = decodeHtml(String(url || "").trim());
    if (!url || /^(?:data:|javascript:|#)/i.test(url)) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.indexOf("//") === 0) return "https:" + url;
    var origin = (base || "https://tvhay.buzz/").match(/^https?:\/\/[^/]+/i);
    var root = origin ? origin[0] : "https://tvhay.buzz";
    if (url.charAt(0) === "/") return root + url;
    var cleanBase = (base || root + "/").split(/[?#]/)[0];
    return cleanBase.substring(0, cleanBase.lastIndexOf("/") + 1) + url;
}

function firstMatch(text, patterns) {
    for (var i = 0; i < patterns.length; i++) {
        var m = text.match(patterns[i]);
        if (m && m[1]) return decodeHtml(m[1].trim());
    }
    return "";
}

function extractPoster(html, baseUrl) {
    var value = firstMatch(html, [
        /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
        /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
        /<img[^>]+(?:data-original|data-lazy-src|data-src|data-echo|src)=["']([^"']+)["'][^>]+(?:class=["'][^"']*(?:poster|thumb|cover)[^"']*["'])/i,
        /<img[^>]+class=["'][^"']*(?:poster|thumb|cover)[^"']*["'][^>]+(?:data-original|data-lazy-src|data-src|src)=["']([^"']+)["']/i
    ]);
    if (!value) return "";
    return absoluteUrl(value, baseUrl);
}

function extractImageFromBlock(block, baseUrl) {
    var value = firstMatch(block, [
        /<(?:img|source)[^>]+(?:data-original|data-lazy-src|data-src|data- src|src)=["']([^"']+)["']/i,
        /<(?:img|source)[^>]+srcset=["']([^"', ]+)/i,
        /style=["'][^"']*background-image\s*:\s*url\(["']?([^"')]+)["']?\)/i
    ]);
    if (!value || /^data:image/i.test(value)) return "";
    return absoluteUrl(value, baseUrl);
}

function parseListResponse(html) {
    html = String(html || "");
    var items = [];
    var seen = {};
    var baseUrl = "https://tvhay.buzz/";

    // Ưu tiên các card phim phổ biến, nhưng không phụ thuộc một class duy nhất.
    var blocks = html.split(/(?=<(?:div|article|li)[^>]+class=["'][^"']*(?:movie|film|item|post|product)[^"']*["'])/i);
    if (blocks.length < 2) blocks = [html];

    function addFromBlock(block) {
        var href = firstMatch(block, [
            /<a[^>]+href=["']([^"']+)["']/i,
            /data-href=["']([^"']+)["']/i
        ]);
        var poster = extractImageFromBlock(block, href ? absoluteUrl(href, baseUrl) : baseUrl);
        if (!poster) return;
        var title = firstMatch(block, [
            /<a[^>]+title=["']([^"']+)["']/i,
            /<img[^>]+alt=["']([^"']+)["']/i,
            /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i
        ]).replace(/<[^>]+>/g, "").trim();
        if (!title) title = firstMatch(block, [/<a[^>]*>([\s\S]*?)<\/a>/i]).replace(/<[^>]+>/g, "").trim();
        var link = absoluteUrl(href, baseUrl);
        if (!link || !title || seen[link]) return;
        if (/^(?:javascript:|#)/i.test(link)) return;
        seen[link] = true;
        items.push({ id: link, title: decodeHtml(title), posterUrl: poster, backdropUrl: poster, year: 0 });
    }

    for (var i = 0; i < blocks.length; i++) addFromBlock(blocks[i]);

    // Fallback: duyệt anchor chứa ảnh, dùng được khi website đổi tên class card.
    if (items.length === 0) {
        var anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
        var match;
        while ((match = anchorRegex.exec(html)) !== null) {
            var attrs = match[1];
            var inner = match[2];
            var hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
            if (!hrefMatch || !/<img\b/i.test(inner)) continue;
            addFromBlock('<a ' + attrs + '>' + inner + '</a>');
        }
    }

    var currentPage = 1, totalPages = 1;
    var cpMatch = html.match(/<(?:a|span)[^>]*class=["'][^"']*(?:active|current)[^"']*["'][^>]*>(\d+)</i);
    if (cpMatch) currentPage = parseInt(cpMatch[1], 10) || 1;
    var lpRegex = /(?:\/page\/|[?&]paged=)(\d+)/gi, lpMatch;
    while ((lpMatch = lpRegex.exec(html)) !== null) totalPages = Math.max(totalPages, parseInt(lpMatch[1], 10) || 1);
    totalPages = Math.max(totalPages, currentPage);
    return JSON.stringify({ items: items, pagination: { currentPage: currentPage, totalPages: totalPages } });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// Phân tích chi tiết phim
function parseMovieDetail(html) {
    try {
        // Title: thường trong <h1> có class "title" hoặc "movie-title"
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '').trim()) : firstMatch(html, [/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i, /<title[^>]*>([\s\S]*?)<\/title>/i]);

        // Description: trong div "description" hoặc "content"
        var descMatch = html.match(/<(?:div|section)[^>]*class=["'][^"']*(?:description|content|summary|plot)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/i);
        var description = descMatch ? decodeHtml(descMatch[1].replace(/<[^>]+>/g, '').trim()) : firstMatch(html, [/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i]);

        // Poster: hỗ trợ og:image, twitter:image và ảnh poster lazy-load.
        var posterUrl = extractPoster(html, "https://tvhay.buzz/");

        // Năm sản xuất
        var yearMatch = html.match(/(?:Năm|Year)[^<]*?(\d{4})/i);
        var year = yearMatch ? parseInt(yearMatch[1]) : 0;

        // Diễn viên (casts)
        var castsArr = [];
        var castRegex = /<a[^>]*href=["'][^"']*\/dien-vien\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
        var castMatch;
        while ((castMatch = castRegex.exec(html)) !== null) {
            castsArr.push(castMatch[1].replace(/<[^>]+>/g, '').trim());
        }

        // Thể loại (categories)
        var categoriesArr = [];
        var catRegex = /<a[^>]*href=["'][^"']*\/the-loai\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
        var cmMatch;
        while ((cmMatch = catRegex.exec(html)) !== null) {
            categoriesArr.push(cmMatch[1].replace(/<[^>]+>/g, '').trim());
        }

        // =====================================================================
        // Phân tích Tập phim (Servers)
        // =====================================================================
        var servers = [];

        // Lấy canonical URL để làm base cho episode ID
        var canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
        if (!canonicalMatch) canonicalMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        var pageUrl = canonicalMatch ? absoluteUrl(canonicalMatch[1], "https://tvhay.buzz/") : "";

        // Tìm các nút chọn server (thường là tab hoặc button)
        // Giả định: <a ... data-server="1"> hoặc onclick="changeServer(1)"
        // Hoặc tìm các link tập phim: <a href="...tap-1...">Tập 1</a>
        
        // Cách 1: Tìm các episode links trong khu vực danh sách tập
        var episodeRegex = /<a\b([^>]*)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
        var epMatch;
        var episodes = [];
        var episodeSeen = {};
        while ((epMatch = episodeRegex.exec(html)) !== null) {
            var epLink = epMatch[2];
            var epName = decodeHtml(epMatch[4].replace(/<[^>]+>/g, '').trim());
            var searchable = (epLink + " " + epName + " " + epMatch[1] + " " + epMatch[3]).toLowerCase();
            if (!epLink || !epName || !/(tap|tập|episode|full|xem-phim|play)/i.test(searchable)) continue;
            var absoluteEpisode = absoluteUrl(epLink, pageUrl || "https://tvhay.buzz/");
            if (episodeSeen[absoluteEpisode]) continue;
            episodeSeen[absoluteEpisode] = true;
            episodes.push({ id: absoluteEpisode, name: epName, slug: epLink.replace(/[^a-z0-9]/gi, '-').toLowerCase() });
        }

        // Nếu tìm thấy episodes, gom vào 1 server
        if (episodes.length > 0) {
            servers.push({
                name: "Vietsub",
                episodes: episodes
            });
        } 
        // Fallback: nếu không tìm thấy, tạo 1 episode full từ URL hiện tại
        else if (pageUrl) {
            servers.push({
                name: "Full",
                episodes: [{
                    id: pageUrl,
                    name: "Full",
                    slug: "full"
                }]
            });
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: year,
            rating: 0,
            casts: castsArr.join(", "),
            director: "",
            country: "",
            category: categoriesArr.join(", "),
            status: "Full"
        });

    } catch (e) {
        return "null";
    }
}

// =============================================================================
// STREAM RESOLUTION
// =============================================================================

// MIME type cho stream. Một số server dùng extension không chuẩn hoặc không có extension.
function getStreamMimeType(streamUrl) {
    if (!streamUrl) return "";

    // Bỏ query/hash trước khi kiểm tra extension.
    var cleanUrl = String(streamUrl).split("?")[0].split("#")[0].toLowerCase();

    if (/\.m3u8$/.test(cleanUrl) || /\.vl$/.test(cleanUrl)) {
        return "application/x-mpegURL";
    }

    if (/\.mp4$/.test(cleanUrl)) {
        return "video/mp4";
    }

    // Endpoint stream của streamvsmov có dạng /video/<UUID>, không có extension.
    // Endpoint này được cấu hình là HLS theo yêu cầu.
    if (/^https?:\/\/v\d+\.streamvsmov\.com\/video\/[0-9a-f-]{36}$/i.test(cleanUrl)) {
        return "application/x-mpegURL";
    }

    // Để trống để ExoPlayer/app tự nhận dạng nếu chưa đủ thông tin.
    return "";
}

function makeStreamResult(streamUrl, referer) {
    var result = {
        url: streamUrl,
        isEmbed: false,
        headers: {}
    };
    var mimeType = getStreamMimeType(streamUrl);
    if (mimeType) result.mimeType = mimeType;
    if (referer) result.headers.Referer = referer;
    return JSON.stringify(result);
}

// Tìm URL stream trong HTML hoặc script player.
function findStreamUrl(html) {
    if (!html) return "";

    // Trường file của player: hỗ trợ URL có extension lạ hoặc không có extension.
    var fileMatch = html.match(/["']file["']\s*:\s*["'](https?:\\?\/\\?\/[^"']+)["']/i);
    if (fileMatch) {
        return fileMatch[1].replace(/\\\//g, "/").replace(/\\u0026/gi, "&");
    }

    // URL HLS thông thường.
    var m3u8Match = html.match(/https?:\/\/[^\s"'<>\\]+\.m3u8(?:\?[^\s"'<>\\]*)?/i);
    if (m3u8Match) return m3u8Match[0];

    // URL streamvsmov dạng /video/<UUID>, không có phần mở rộng.
    var streamvsmovMatch = html.match(/https?:\/\/v\d+\.streamvsmov\.com\/video\/[0-9a-f-]{36}(?:\?[^\s"'<>\\]*)?/i);
    if (streamvsmovMatch) return streamvsmovMatch[0];

    // File MP4.
    var mp4Match = html.match(/https?:\/\/[^\s"'<>\\]+\.mp4(?:\?[^\s"'<>\\]*)?/i);
    if (mp4Match) return mp4Match[0];

    // Extension .vl thường được server dùng cho nội dung HLS.
    var vlMatch = html.match(/https?:\/\/[^\s"'<>\\]+\.vl(?:\?[^\s"'<>\\]*)?/i);
    if (vlMatch) return vlMatch[0];

    return "";
}

// parseDetailResponse: xử lý HTML trang chi tiết/tập phim để tìm link stream.
function parseDetailResponse(html, fetchedUrl) {
    try {
        var directStreamUrl = "https://v13.streamvsmov.com/video/4b208176-9136-499c-8ebd-074b0b35854d";

        // Nếu app gọi trực tiếp endpoint stream đã cung cấp, trả về HLS ngay.
        if (fetchedUrl && fetchedUrl.indexOf(directStreamUrl) === 0) {
            return makeStreamResult(directStreamUrl, "https://tvhay.buzz/");
        }

        // Nếu URL stream được nhúng trong HTML, ưu tiên phân tích URL trực tiếp.
        var streamUrl = findStreamUrl(html);
        if (streamUrl) {
            return makeStreamResult(streamUrl, "https://tvhay.buzz/");
        }

        // Nếu trang có iframe player thì trả về để app tiếp tục phân tích embed.
        var iframeMatch = html.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        if (iframeMatch) {
            return JSON.stringify({
                url: iframeMatch[1],
                isEmbed: true,
                headers: {
                    "Referer": "https://tvhay.buzz/"
                }
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {}, error: "Không tìm thấy link phát trong trang. Có thể website đã đổi player hoặc yêu cầu cookie/JavaScript." });
    } catch (error) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, error: "Không tìm thấy link stream trong trang embed." });
    }
}

// parseEmbedResponse: xử lý HTML từ embed page (nếu isEmbed = true).
function parseEmbedResponse(html, url) {
    try {
        var streamUrl = findStreamUrl(html);
        if (streamUrl) {
            return makeStreamResult(streamUrl, url || "https://tvhay.buzz/");
        }

        // Một số embed trả thẳng URL stream trong chính URL được tải.
        if (url && getStreamMimeType(url)) {
            return makeStreamResult(url, "https://tvhay.buzz/");
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}
