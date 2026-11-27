var BASE_URL = "https://missav.media";
var REFERER_URL = "https://missav.media/";
var ORIGIN_URL = "https://missav.media";

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "1.0.3",
        "baseUrl": BASE_URL,
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/missav.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "HORIZONTAL",
        "playerType": "auto",
        "subtitleCat": true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'vi/today-hot', title: 'Hot Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'vi/weekly-hot', title: 'Hot Trong Tuần', type: 'Horizontal', path: '' },
        { slug: 'vi/monthly-hot', title: 'Hot Trong Tháng', type: 'Horizontal', path: '' },
        { slug: 'vi/uncensored-leak', title: 'Không Che (Rò Rỉ)', type: 'Horizontal', path: '' },
        { slug: 'vi/release', title: 'Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'vi/new' },
        { name: 'Nữ diễn viên', slug: 'vi/actresses' },
        { name: 'Thể loại', slug: 'vi/genres' },
        { name: 'Không che', slug: 'vi/uncensored-leak' },
        { name: "FC2", slug: "vi/fc2" },
        { name: "HEYZO", slug: "vi/heyzo" },
        { name: "Tokyo Hot", slug: "vi/tokyohot" },
        { name: "1pondo", slug: "vi/1pondo" },
        { name: "Caribbeancom", slug: "vi/caribbeancom" },
        { name: "Caribbeancompr", slug: "vi/caribbeancompr" },
        { name: "10musume", slug: "vi/10musume" },
        { name: "pacopacomama", slug: "vi/pacopacomama" },
        { name: "Gachinco", slug: "vi/gachinco" },
        { name: "XXX-AV", slug: "vi/xxx-av" },
        { name: "MarriedSlash", slug: "vi/marriedslash" },
        { name: "Naughty4610", slug: "vi/naughty4610" },
        { name: "Naughty0930", slug: "vi/naughty0930" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'new' },
            { name: 'Xem nhiều', value: 'views' },
            { name: 'Hôm nay', value: 'today_views' },
            { name: 'Tuần này', value: 'weekly_views' },
            { name: 'Tháng này', value: 'monthly_views' }
        ],
        category: [
            { name: "Tất cả thể loại", value: "vi/genres" },
            { name: "Mới cập nhật", value: "vi/new" },
            { name: "Phát hành mới", value: "vi/release" },
            { name: "Không che (Rò rỉ)", value: "vi/uncensored-leak" },
            { name: "Nữ diễn viên", value: "vi/actresses" },
            { name: "BXH Diễn viên", value: "vi/actresses/ranking" },
            { name: "Nhà sản xuất", value: "vi/makers" },
            { name: "VR", value: "vi/genres/VR" },
            { name: "Xem nhiều hôm nay", value: "vi/today-hot" },
            { name: "Xem nhiều tuần", value: "vi/weekly-hot" },
            { name: "Xem nhiều tháng", value: "vi/monthly-hot" },
            { name: "Phụ đề Anh", value: "vi/english-subtitle" },
            { name: "Phụ đề China", value: "vi/chinese-subtitle" },
            { name: "SIRO", value: "vi/series/SIRO" },
            { name: "LUXU", value: "vi/series/LUXU" },
            { name: "GANA", value: "vi/series/GANA" },
            { name: "MAAN", value: "vi/series/MAAN" },
            { name: "S-CUTE", value: "vi/series/S-CUTE" },
            { name: "ARA", value: "vi/series/ARA" },
            { name: "FC2", value: "vi/series/FC2" },
            { name: "HEYZO", value: "vi/series/HEYZO" },
            { name: "Tokyo Hot", value: "vi/series/Tokyo-Hot" },
            { name: "1pondo", value: "vi/series/1pondo" },
            { name: "Caribbeancom", value: "vi/series/Caribbeancom" },
            { name: "Caribbeancompr", value: "vi/series/Caribbeancompr" },
            { name: "10musume", value: "vi/series/10musume" },
            { name: "pacopacomama", value: "vi/series/pacopacomama" },
            { name: "Gachinco", value: "vi/series/Gachinco" },
            { name: "XXX-AV", value: "vi/series/XXX-AV" },
            { name: "MarriedSlash", value: "vi/series/MarriedSlash" },
            { name: "Naughty4610", value: "vi/series/naughty4610" },
            { name: "Naughty0930", value: "vi/series/naughty0930" }
        ]
    });
}

// =============================================================================
// NHÓM 2: SINH URL
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var path = (slug || "vi/new").replace(/^\/+/, "");
    var url = BASE_URL + "/" + path + "?page=" + page;

    if (filters.sort && filters.sort !== "new" && filters.sort !== "hot") {
        url += "&sort=" + filters.sort;
    } else if (filters.sort === "hot") {
        url += "&sort=views";
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_URL + "/vi/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    if (slug.indexOf("http") === 0) return slug;
    var cleanSlug = slug.replace(/^\/+/, "");
    if (cleanSlug.indexOf("vi/") === 0) {
        return BASE_URL + "/" + cleanSlug;
    }
    return BASE_URL + "/vi/" + cleanSlug;
}

function getUrlCategories() { return BASE_URL + "/vi/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: TIỆN ÍCH & PARSER
// =============================================================================

var PluginUtils = {
    normalizeHtml: function (html) {
        if (!html) return "";
        return html.replace(/class="([^"]*)"/g, function (_, classValue) {
            return 'class="' + classValue.replace(/missav_media-/g, '') + '"';
        });
    },

    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    },

    getMeta: function (html, property) {
        var regex = new RegExp('(?:property|name)=["\']' + property + '["\'][^>]*content=["\']([^"\']+)["\']', 'i');
        var match = html.match(regex);
        return match ? match[1].trim() : "";
    },

    /**
     * Chuẩn hóa và nâng cấp chất lượng Poster/Thumbnail:
     * - Xử lý URL dạng //..., /path..., hoặc trùng protocol
     * - Nâng cấp cover-t.jpg -> cover.jpg nếu có
     * - Fallback sang preview/icon nếu không tìm thấy ảnh hợp lệ
     */
    normalizePosterUrl: function (rawUrl, fallbackUrl) {
        var url = (rawUrl || "").trim();

        // Loại bỏ các placeholder template chưa render
        if (!url || url.indexOf("item.") !== -1 || url.indexOf("{{") !== -1 || url.indexOf("data:image") === 0) {
            url = (fallbackUrl || "").trim();
        }

        if (!url) return "";

        // Sửa lỗi protocol bị lặp kiểu https://https://
        url = url.replace(/^https?:\/\/https?:\/\//i, "https://");

        if (url.indexOf("//") === 0) {
            url = "https:" + url;
        } else if (url.indexOf("/") === 0) {
            url = BASE_URL + url;
        }

        // Nâng cấp ảnh thumbnail nhỏ sang ảnh cover lớn hơn
        if (url.indexOf("/cover-t.jpg") !== -1) {
            url = url.replace("/cover-t.jpg", "/cover.jpg");
        } else if (url.indexOf("-t.jpg") !== -1 && url.indexOf("cover") !== -1) {
            url = url.replace("-t.jpg", ".jpg");
        }

        return url;
    },

    extractPosterFromHtml: function (blockHtml, fallbackUrl) {
        if (!blockHtml) return this.normalizePosterUrl("", fallbackUrl);

        var candidates = [];
        var attrPatterns = [
            /<img[^>]+data-src=["']([^"']+)["']/i,
            /<img[^>]+data-original=["']([^"']+)["']/i,
            /<img[^>]+data-lazy-src=["']([^"']+)["']/i,
            /<video[^>]+poster=["']([^"']+)["']/i,
            /<img[^>]+src=["']([^"']+)["']/i
        ];

        for (var i = 0; i < attrPatterns.length; i++) {
            var m = blockHtml.match(attrPatterns[i]);
            if (m && m[1]) {
                candidates.push(m[1].trim());
            }
        }

        for (var j = 0; j < candidates.length; j++) {
            var c = candidates[j];
            if (c.indexOf("flag") !== -1 || c.indexOf("icon") !== -1 || c.indexOf("blank") !== -1) {
                continue;
            }
            var normalized = this.normalizePosterUrl(c, "");
            if (normalized) return normalized;
        }

        return this.normalizePosterUrl("", fallbackUrl);
    },

    extractPreviewUrl: function (itemHtml) {
        var previewMatch = itemHtml.match(/<video[^>]+data-src=["']([^"']+)["']/i);
        var url = previewMatch ? previewMatch[1].trim() : "";

        if (url && url.length === 36 && /^[0-9a-f-]{36}$/i.test(url)) {
            return "https://surrit.com/" + url + "/preview.mp4";
        }

        if (!url) {
            var uuidMatch = itemHtml.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
                return "https://surrit.com/" + uuidMatch[0] + "/preview.mp4";
            }
        }

        if (url && url.indexOf("//") === 0) {
            return "https:" + url;
        }

        return url;
    },

    /**
     * Trích xuất link stream (.m3u8 / .mp4) hoặc UUID từ HTML
     */
    extractStreamInfo: function (html) {
        if (!html) return { streamUrl: "", uuid: "", mimeType: "" };

        var uuid = "";
        var streamUrl = "";
        var mimeType = "";

        // 1. Direct m3u8 / mp4 URL
        var directMediaMatch = html.match(/https?:\/\/[^\s"'<>\\]+\.(?:m3u8|mp4)(?:\?[^\s"'<>\\]*)?/i);
        if (directMediaMatch) {
            streamUrl = directMediaMatch[0].replace(/\\\//g, "/");
            mimeType = streamUrl.indexOf(".mp4") !== -1 ? "video/mp4" : "application/x-mpegURL";
            return { streamUrl: streamUrl, uuid: "", mimeType: mimeType };
        }

        // 2. Decode eval() packer array chứa UUID / domain
        var evalMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
        if (evalMatch) {
            var parts = evalMatch[1].split("|");
            var hasVideoDomain = false;
            for (var i = 0; i < parts.length; i++) {
                if (/^(surrit|sixyik|nineyu|fourhoi|m3u8|playlist)$/i.test(parts[i])) {
                    hasVideoDomain = true;
                    break;
                }
            }
            if (hasVideoDomain) {
                var uuidParts = [];
                for (var j = 0; j < parts.length; j++) {
                    if (/^[0-9a-f]{4,12}$/i.test(parts[j])) {
                        uuidParts.push(parts[j]);
                    }
                }
                if (uuidParts.length >= 5) {
                    uuid = uuidParts[0] + "-" + uuidParts[1] + "-" + uuidParts[2] + "-" + uuidParts[3] + "-" + uuidParts[4];
                }
            }
        }

        // 3. Direct stream host + UUID
        if (!uuid) {
            var hostMatch = html.match(/(?:surrit|sixyik|nineyu|fourhoi)\.com\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
            if (hostMatch) {
                uuid = hostMatch[1];
            }
        }

        // 4. Blob / data-source / source tag
        if (!uuid) {
            var blobMatch = html.match(/(?:src|data-source)=["'](?:blob:[^"']*\/)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})[^"']*["']/i);
            if (blobMatch) {
                uuid = blobMatch[1];
            }
        }

        // 5. Deep scan UUID an toàn (loại bỏ các từ khóa tracking/ads/crypto)
        if (!uuid) {
            var matches = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
            var blacklist = ["snaptrckr", "user_uuid", "popunder", "banner", "monitoring", "crypto", "randomUUID", "generateUUID", "fingerprint"];

            for (var k = 0; k < matches.length; k++) {
                var candidateUuid = matches[k];
                var idx = html.indexOf(candidateUuid);
                var isBad = false;

                if (idx !== -1) {
                    var ctx = html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 80)).toLowerCase();
                    for (var b = 0; b < blacklist.length; b++) {
                        if (ctx.indexOf(blacklist[b].toLowerCase()) !== -1) {
                            isBad = true;
                            break;
                        }
                    }
                }

                if (!isBad) {
                    uuid = candidateUuid;
                    break;
                }
            }
        }

        if (uuid) {
            streamUrl = "https://surrit.com/" + uuid + "/playlist.m3u8";
            mimeType = "application/x-mpegURL";
        }

        return { streamUrl: streamUrl, uuid: uuid, mimeType: mimeType };
    }
};

function parseListResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var movies = [];

    var isSearchPage = html.indexOf('window.recombeeClient.send(new recombee.SearchItems') !== -1 ||
        (html.indexOf('x-data="{') !== -1 && html.indexOf('recommendItems') !== -1);

    if (isSearchPage) {
        return JSON.stringify({
            items: [{
                id: "/vi",
                title: "⚠️ Tìm kiếm MissAV chưa hỗ trợ trực tiếp",
                posterUrl: PluginUtils.normalizePosterUrl("", "https://raw.githubusercontent.com/youngbi/repo/main/plugins/missav.ico"),
                backdropUrl: "",
                description: "Trang tìm kiếm của MissAV tải động qua JS/Recombee nên không parse được từ HTML tĩnh. Hãy duyệt theo mục Thể loại, Hot Hôm Nay hoặc Mới Cập Nhật.",
                year: 0,
                quality: "INFO",
                episode_current: "",
                lang: ""
            }],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 1 }
        });
    }

    var actressLinkMatch = html.match(/href="[^"]*\/actresses\/[^"]+"/g);
    var isActressesPage = (actressLinkMatch && actressLinkMatch.length > 5);

    var isAllGenresPage = !isActressesPage &&
        html.indexOf('class="text-nord13"') !== -1 &&
        html.indexOf(':đếm video') !== -1;

    if (isActressesPage) {
        var gridMatch = html.match(/<ul[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
        var searchScope = gridMatch ? gridMatch[1] : html;
        var blockedNames = ["Tiếng Việt", "English", "繁體中文", "简体中文", "日本語", "한국의", "Melayu", "ไทย", "Deutsch", "Français", "Bahasa Indonesia", "Filipino", "Português", "MissAV"];
        var foundActresses = {};
        var liRegex = /<li[\s\S]*?<\/li>/gi;
        var match;

        while ((match = liRegex.exec(searchScope)) !== null) {
            var itemHtml = match[0];
            var urlMatch = itemHtml.match(/href="([^"]*\/actresses\/[^"]+)"/);
            if (!urlMatch) continue;

            var url = urlMatch[1];
            if (url.indexOf("?") !== -1) continue;

            var nameMatch = itemHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
            var nameRaw = nameMatch ? nameMatch[1] : "";
            if (!nameRaw) {
                var altMatch = itemHtml.match(/<img[^>]+alt="([^"]+)"/);
                if (altMatch) nameRaw = altMatch[1];
            }

            var name = PluginUtils.cleanText(nameRaw);
            if (!name || name.length < 2 || name.indexOf(":đếm") !== -1) continue;

            var isBlocked = false;
            for (var k = 0; k < blockedNames.length; k++) {
                if (name === blockedNames[k]) { isBlocked = true; break; }
            }
            if (isBlocked) continue;

            var poster = PluginUtils.extractPosterFromHtml(itemHtml, "");
            var slug = url.replace(/https?:\/\/[^\/]+/, "");
            if (slug.indexOf("/") !== 0) slug = "/" + slug;

            if (!foundActresses[slug]) {
                movies.push({
                    id: slug,
                    title: name,
                    posterUrl: poster,
                    backdropUrl: poster,
                    description: "Nữ diễn viên",
                    year: 0,
                    quality: "ACTRESS",
                    episode_current: "",
                    lang: ""
                });
                foundActresses[slug] = true;
            }
        }
    } else if (isAllGenresPage) {
        var genreRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var foundSlugs = {};
        var gMatch;

        while ((gMatch = genreRegex.exec(html)) !== null) {
            var gUrl = gMatch[1];
            var innerContent = gMatch[2];

            if (gUrl.indexOf("/genres/") !== -1 && innerContent.indexOf(":đếm video") === -1) {
                var gName = PluginUtils.cleanText(innerContent);
                if (!gName || gName.length < 2) continue;

                var gSlug = gUrl.replace(/https?:\/\/[^\/]+/, "");
                if (gSlug.indexOf("/") !== 0) gSlug = "/" + gSlug;

                if (!foundSlugs[gSlug]) {
                    movies.push({
                        id: gSlug,
                        title: gName,
                        posterUrl: "",
                        backdropUrl: "",
                        description: "Thể loại",
                        year: 0,
                        quality: "CAT",
                        episode_current: "",
                        lang: ""
                    });
                    foundSlugs[gSlug] = true;
                }
            }
        }
    }

    if (movies.length === 0) {
        var parts = html.split("thumbnail group");
        if (parts.length <= 1) parts = html.split('class="thumbnail');

        for (var i = 1; i < parts.length; i++) {
            var itemHtml = parts[i];
            var slug = "";

            var fullLinkMatch = itemHtml.match(/<a[^>]+href="([^"]+)"/);
            if (fullLinkMatch) {
                slug = fullLinkMatch[1].replace(/https?:\/\/[^\/]+/, "");
                if (slug.indexOf("/") !== 0) slug = "/" + slug;
            }

            var codeMatch = itemHtml.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";
            if (!code && slug) {
                var slugParts = slug.split("/");
                code = slugParts[slugParts.length - 1];
            }

            var titleCandidates = [];
            var imgFullMatch = itemHtml.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
            if (imgFullMatch) titleCandidates.push(PluginUtils.cleanText(imgFullMatch[1]));

            var otherTitleRegex = /title="([^"]+)"/gi;
            var tMatch;
            while ((tMatch = otherTitleRegex.exec(itemHtml)) !== null) {
                var val = PluginUtils.cleanText(tMatch[1]);
                if (val.toUpperCase() !== code.toUpperCase()) {
                    titleCandidates.push(val);
                }
            }

            var bestTitle = "";
            for (var c = 0; c < titleCandidates.length; c++) {
                if (titleCandidates[c].length > bestTitle.length) {
                    bestTitle = titleCandidates[c];
                }
            }

            var cleanTitle = bestTitle || code;
            if (code && cleanTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
                var stripped = cleanTitle.substring(code.length).trim();
                if (stripped.indexOf("-") === 0 || stripped.indexOf(" ") === 0) {
                    stripped = stripped.substring(1).trim();
                }
                if (stripped.length > 3) {
                    cleanTitle = stripped;
                }
            }
            if (!cleanTitle) cleanTitle = code || "No Title";

            var posterUrl = PluginUtils.extractPosterFromHtml(itemHtml, "");

            if (slug && slug.indexOf("actresses") === -1 && slug.indexOf("genres") === -1) {
                if (slug.indexOf("item.") !== -1 || slug.indexOf("{{") !== -1 || slug === "/" || slug === "#") continue;
                if (cleanTitle.indexOf("item.") !== -1 || cleanTitle.indexOf("{{") !== -1) continue;

                var durationMatch = itemHtml.match(/<span[^>]*>\s*(\d+):(\d+):(\d+)\s*<\/span>/);
                var duration = durationMatch ? durationMatch[1] + ":" + durationMatch[2] + ":" + durationMatch[3] : "";

                var isUncensored = itemHtml.indexOf("Không kiểm duyệt") !== -1 ||
                    itemHtml.indexOf("Uncensored") !== -1 ||
                    itemHtml.indexOf("bg-blue-800") !== -1;

                var previewUrl = PluginUtils.extractPreviewUrl(itemHtml);

                movies.push({
                    id: slug,
                    title: cleanTitle,
                    posterUrl: posterUrl,
                    backdropUrl: posterUrl,
                    description: duration,
                    year: 0,
                    quality: isUncensored ? "K.K.Duyệt" : "HD",
                    episode_current: isUncensored ? "K.K.Duyệt" : "Full",
                    lang: code,
                    previewUrl: previewUrl
                });
            }
        }
    }

    var totalPages = 1;
    var currentPage = 1;

    var currentMatch = html.match(/<span[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i) ||
        html.match(/<a[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/a>/i);
    if (currentMatch) currentPage = parseInt(currentMatch[1], 10);

    var allPageNums = html.match(/page=(\d+)/g);
    if (allPageNums) {
        for (var pIdx = 0; pIdx < allPageNums.length; pIdx++) {
            var pNum = parseInt(allPageNums[pIdx].match(/\d+/)[0], 10);
            if (pNum > totalPages) totalPages = pNum;
        }
    }

    var inputPageMatch = html.match(/name="page" value="(\d+)"/) || html.match(/type="number" value="(\d+)"/);
    if (inputPageMatch) {
        var pVal = parseInt(inputPageMatch[1], 10);
        if (pVal > 0) currentPage = Math.max(currentPage, pVal);
    }

    var totalLabelMatch = html.match(/\/ (\d+)\s*<\/span>/) ||
        html.match(/>(\d+)<\/a>\s*<a[^>]*aria-label="Next"/i) ||
        html.match(/page=(\d+)[^>]*aria-label="Last"/i);
    if (totalLabelMatch) {
        var tVal = parseInt(totalLabelMatch[1], 10);
        if (tVal > 0) totalPages = Math.max(totalPages, tVal);
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages || 1,
            totalItems: movies.length,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);
    try {
        var getSlug = function (url) {
            if (!url) return "";
            return url.replace(/^https?:\/\/[^\/]+/, "");
        };

        var getField = function (labelKey) {
            var regex = new RegExp("<span>" + labelKey + ":<\\/span>([\\s\\S]*?)<\\/div>", "i");
            var match = html.match(regex);
            if (!match) return "";

            var content = match[1];
            var linkMatch = content.match(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
            if (linkMatch) {
                return "[" + PluginUtils.cleanText(linkMatch[2]) + "](" + getSlug(linkMatch[1]) + ")";
            }
            var timeMatch = content.match(/<time[^>]*>([^<]+)<\/time>/i);
            if (timeMatch) return PluginUtils.cleanText(timeMatch[1]);

            var spanMatch = content.match(/<span[^>]*>([^<]+)<\/span>/i);
            if (spanMatch) return PluginUtils.cleanText(spanMatch[1]);

            return PluginUtils.cleanText(content.replace(/<[^>]+>/g, ""));
        };

        var getMultiField = function (labelKey) {
            var regexStart = new RegExp("<span>" + labelKey + ":<\\/span>", "i");
            var matchStart = html.match(regexStart);
            if (!matchStart) return "";

            var startIndex = matchStart.index + matchStart[0].length;
            var searchArea = html.substring(startIndex);
            var divEnd = searchArea.indexOf("</div>");
            var content = searchArea.substring(0, divEnd === -1 ? searchArea.length : divEnd);

            var items = [];
            var linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
            var linkMatch;
            while ((linkMatch = linkRegex.exec(content)) !== null) {
                var text = PluginUtils.cleanText(linkMatch[2]);
                if (text && text.indexOf("<img") === -1) {
                    items.push("[" + text + "](" + getSlug(linkMatch[1]) + ")");
                }
            }
            return items.join(", ");
        };

        var code = getField("Mã số") || getField("Code");
        var releaseDate = getField("Ngày phát hành") || getField("Release date");
        var studio = getField("nhà sản xuất") || getField("Maker");
        var director = getField("Giám đốc") || getField("Director");
        var label = getField("Nhãn") || getField("Label");

        var casts = getMultiField("Nữ diễn viên") || getMultiField("Actresses");
        var genres = getMultiField("thể loại") || getMultiField("Genre") || getMultiField("Genres");
        var series = getMultiField("Loạt") || getMultiField("Series");

        if (!code) {
            var dvdIdMatch = html.match(/dvdId:\s*['"]([^'"]+)['"]/);
            code = dvdIdMatch ? dvdIdMatch[1] : "";
        }

        var title = PluginUtils.getMeta(html, "og:title");
        var ogImage = PluginUtils.getMeta(html, "og:image");
        var posterUrl = PluginUtils.normalizePosterUrl(ogImage, PluginUtils.extractPosterFromHtml(html, ""));
        var desc = PluginUtils.getMeta(html, "og:description");

        var previewMatch = html.match(/<video[^>]+data-src=["']([^"']+)["']/i) || html.match(/video_url:\s*['"]([^'"]+)['"]/i);
        var previewUrl = previewMatch ? PluginUtils.normalizePosterUrl(previewMatch[1], "") : "";
        if (!previewUrl && posterUrl && posterUrl.indexOf("cover.jpg") !== -1) {
            previewUrl = posterUrl.replace("cover.jpg", "preview.mp4");
        }

        var displayTitle = title;
        if (code && displayTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
            displayTitle = displayTitle.substring(code.length).trim();
            if (displayTitle.indexOf("-") === 0 || displayTitle.indexOf(" ") === 0) {
                displayTitle = displayTitle.substring(1).trim();
            }
        }
        if (code) {
            displayTitle = "[" + code.toUpperCase() + "] " + displayTitle;
        }

        var titleWords = displayTitle.split(" ");
        if (titleWords.length > 25) {
            displayTitle = titleWords.slice(0, 25).join(" ") + "...";
        }

        var streamInfo = PluginUtils.extractStreamInfo(html);
        var servers = [];

        if (streamInfo.streamUrl) {
            // Dùng pageUrl (nếu có) để parseDetailResponse gắn đúng Referer/Origin
            servers.push({
                name: "Stream",
                episodes: [{
                    id: pageUrl || streamInfo.streamUrl,
                    name: "Full",
                    slug: "full"
                }]
            });
        } else if (pageUrl) {
            // Luồng dự phòng: không tách được link stream trực tiếp -> mở trang gốc qua embed/WebView
            servers.push({
                name: "Embed Dự Phòng",
                episodes: [{
                    id: pageUrl,
                    name: "Xem Web/Embed",
                    slug: "embed-fallback"
                }]
            });
        }

        var statusLine = "";
        if (studio) statusLine += "Studio: " + studio;
        if (label) statusLine += (statusLine ? " | " : "") + "Label: " + label;
        if (!statusLine && releaseDate) statusLine = "Released: " + releaseDate;
        if (!streamInfo.streamUrl) {
            statusLine += (statusLine ? " | " : "") + "Chế độ dự phòng (không có link stream trực tiếp)";
        }

        var year = releaseDate ? parseInt(releaseDate.substring(0, 4), 10) : 0;

        return JSON.stringify({
            id: code || "",
            title: PluginUtils.cleanText(displayTitle),
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: PluginUtils.cleanText(desc),
            servers: servers,
            quality: streamInfo.streamUrl ? "HD" : "EMBED",
            lang: "Vietsub",
            year: year || 0,
            rating: 0,
            casts: casts,
            director: director,
            category: genres,
            status: statusLine,
            duration: series ? "Series: " + series : "",
            previewUrl: previewUrl || ""
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html, sourceUrl) {
    html = PluginUtils.normalizeHtml(html || "");
    var streamInfo = PluginUtils.extractStreamInfo(html);

    if (streamInfo.streamUrl) {
        return JSON.stringify({
            url: streamInfo.streamUrl,
            isEmbed: false,
            mimeType: streamInfo.mimeType || "application/x-mpegURL",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": REFERER_URL,
                "Origin": ORIGIN_URL
            },
            subtitles: []
        });
    }

    // Không tìm thấy link stream trực tiếp -> kiểm tra iframe/embed hoặc fallback về sourceUrl
    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    var fallbackUrl = iframeMatch ? PluginUtils.normalizePosterUrl(iframeMatch[1], "") : (sourceUrl || "");

    if (fallbackUrl && fallbackUrl.indexOf("http") === 0) {
        return JSON.stringify({
            url: fallbackUrl,
            isEmbed: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": REFERER_URL
            },
            subtitles: [],
            error: "Không tìm thấy link stream trực tiếp, đang chuyển sang chế độ phát nhúng (embed)."
        });
    }

    return JSON.stringify({
        url: "",
        isEmbed: false,
        headers: {},
        subtitles: [],
        error: "Không tìm thấy đường link phát video từ trang nguồn."
    });
}

function parseEmbedResponse(html, sourceUrl) {
    html = PluginUtils.normalizeHtml(html || "");
    var streamInfo = PluginUtils.extractStreamInfo(html);

    if (streamInfo.streamUrl) {
        return JSON.stringify({
            url: streamInfo.streamUrl,
            isEmbed: false,
            mimeType: streamInfo.mimeType || "application/x-mpegURL",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": sourceUrl || REFERER_URL,
                "Origin": ORIGIN_URL
            },
            subtitles: []
        });
    }

    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
        var nextUrl = PluginUtils.normalizePosterUrl(iframeMatch[1], "");
        if (nextUrl && nextUrl !== sourceUrl) {
            return JSON.stringify({
                url: nextUrl,
                isEmbed: true,
                headers: { "Referer": sourceUrl || REFERER_URL }
            });
        }
    }

    return JSON.stringify({
        url: "",
        isEmbed: false,
        error: "Không tìm thấy đường link phát video trong nguồn nhúng."
    });
}

function parseCategoriesResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var categories = [{ name: "Tất cả thể loại", slug: "vi/genres" }];
    var regex = /<a[^>]+href="([^"]*\/vi\/genres\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    var match;
    var seen = {};

    while ((match = regex.exec(html)) !== null) {
        var fullPath = match[1];
        var name = PluginUtils.cleanText(match[2]);
        var parts = fullPath.split("/genres/");
        var slug = parts.length > 1 ? parts[1] : "";

        if (slug && name && !seen[slug]) {
            seen[slug] = true;
            categories.push({ name: name, slug: "vi/genres/" + slug });
        }
    }

    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
