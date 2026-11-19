function getManifest() {
    return JSON.stringify({
        "id": "missavmedia",
        "name": "MissAV Media",
        "version": "1.0.8",
        "versionCode": 8,
        "baseUrl": "https://missav.media",
        "iconUrl": "",
        "description": "MissAV Media plugin",
        "author": "Plugin",
        "lang": "vi",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "new", title: "Mới cập nhật", type: "Grid", path: "vi" },
        { slug: "release", title: "Phát hành mới", type: "Horizontal", path: "vi" },
        { slug: "uncensored-leak", title: "Không che", type: "Horizontal", path: "vi" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Mới cập nhật", slug: "new" },
        { name: "Phát hành mới", slug: "release" },
        { name: "Không che", slug: "uncensored-leak" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới nhất", value: "newest" },
            { name: "Xem nhiều", value: "views" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var baseUrl = "https://missav.media";

        var path = String(slug || "vi/new").replace(/^\s+|\s+$/g, "");
        if (!path) path = "vi/new";
        if (path.indexOf("http://") === 0 || path.indexOf("https://") === 0) {
            path = path.replace(/^https?:\/\/[^/]+/i, "");
        }
        if (path.indexOf("/") === 0) path = path.substring(1);

        var sep = path.indexOf("?") === -1 ? "?" : "&";
        var url = baseUrl + "/" + path + sep + "page=" + page;

        if (filters.sort && filters.sort !== "new" && filters.sort !== "hot") {
            url += "&sort=" + encodeURIComponent(filters.sort);
        } else if (filters.sort === "hot") {
            url += "&sort=views";
        }

        return url;
    } catch (e) {
        return "https://missav.media/vi/new?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var q = encodeURIComponent(String(keyword || "").trim());
        return "https://missav.media/vi/search/" + q + "?page=" + page;
    } catch (e) {
        return "https://missav.media/vi/search/" + encodeURIComponent(String(keyword || "")) + "?page=1";
    }
}

function getUrlDetail(slug) {
    var s = String(slug || "").trim();
    if (!s) return "https://missav.media/vi/new";
    if (s.indexOf("http://") === 0 || s.indexOf("https://") === 0) return s;
    if (s.indexOf("/") === 0) return "https://missav.media" + s;
    return "https://missav.media/vi/" + s;
}

function getUrlCategories() { return "https://missav.media/vi/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS & HELPERS
// =============================================================================

var PluginUtils = {
    normalizeHtml: function (html) {
        if (!html) return "";
        return String(html).replace(/class="([^"]*)"/g, function (fullMatch, classValue) {
            var normalized = classValue.replace(/[a-z0-9-]+_/gi, function (prefix) {
                return prefix === "missav_media-" ? "" : prefix;
            }).replace(/missav_media-/g, "");
            return 'class="' + normalized + '"';
        });
    },

    cleanText: function (text) {
        if (!text) return "";
        return String(text)
            .replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/'/gi, "'")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    },

    getMeta: function (html, property) {
        var regex = new RegExp('(?:property|name)=["\']' + property + '["\'][^>]*content=["\']([^"\']+)["\']', 'i');
        var match = String(html || "").match(regex);
        return match ? match[1] : "";
    },

    getMetaList: function (html, property) {
        var regex = new RegExp('(?:property|name)=["\']' + property + '["\'][^>]*content=["\']([^"\']+)["\']', 'gi');
        var results = [];
        var match;
        var str = String(html || "");
        while ((match = regex.exec(str)) !== null) {
            results.push(match[1]);
        }
        return results;
    },

    isBadImage: function (url) {
        var u = String(url || "").trim().toLowerCase();
        if (!u) return true;
        if (u.indexOf("data:image") === 0 || u.indexOf("about:blank") === 0) return true;
        if (u.indexOf("flag") !== -1 || u.indexOf("icon") !== -1) return true;
        if (/(\/|_|-)(blank|placeholder|spacer|loading|default-thumb|no-image)\.(png|jpg|jpeg|gif|webp)/i.test(u)) {
            return true;
        }
        return false;
    },

    normalizeUrl: function (url) {
        var u = PluginUtils.cleanText(url || "");
        if (!u || PluginUtils.isBadImage(u)) return "";
        if (u.indexOf("//") === 0) return "https:" + u;
        if (u.indexOf("http://") === 0 || u.indexOf("https://") === 0) return u;
        if (u.indexOf("/") === 0) return "https://missav.media" + u;
        return "https://missav.media/" + u;
    },

    extractImage: function (blockHtml) {
        var html = String(blockHtml || "");
        var imgRegex = /<img\b([^>]*)>/gi;
        var match;
        var fallback = "";

        while ((match = imgRegex.exec(html)) !== null) {
            var attrs = match[1] || "";
            var hidden = /\b(hidden|d-none|sr-only|invisible)\b/i.test(attrs) ||
                /style=["'][^"']*(display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0)/i.test(attrs);

            var cands = [
                (attrs.match(/\bdata-src=["']([^"']+)["']/i) || [])[1],
                (attrs.match(/\bdata-original=["']([^"']+)["']/i) || [])[1],
                (attrs.match(/\bdata-lazy-src=["']([^"']+)["']/i) || [])[1],
                (attrs.match(/\bdata-poster=["']([^"']+)["']/i) || [])[1],
                (attrs.match(/\bsrc=["']([^"']+)["']/i) || [])[1]
            ];

            for (var i = 0; i < cands.length; i++) {
                var norm = PluginUtils.normalizeUrl(cands[i]);
                if (norm) {
                    if (!hidden) return norm;
                    if (!fallback) fallback = norm;
                }
            }
        }

        var bg = html.match(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/i) ||
            html.match(/\b(?:data-bg|data-background)=["']([^"']+)["']/i);
        if (bg && bg[1]) {
            var bgNorm = PluginUtils.normalizeUrl(bg[1]);
            if (bgNorm) return bgNorm;
        }

        return fallback;
    },

    extractPreviewUrl: function (itemHtml) {
        var str = String(itemHtml || "");
        var previewMatch = str.match(/<video[^>]+(?:data-src|src)=["']([^"']+)["']/i);
        var url = previewMatch ? previewMatch[1] : "";

        if (url && url.length === 36 && /^[0-9a-f-]{36}$/i.test(url)) {
            return "https://surrit.com/" + url + "/preview.mp4";
        }

        if (!url) {
            var uuidMatch = str.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
                return "https://surrit.com/" + uuidMatch[0] + "/preview.mp4";
            }
        }

        if (url && url.indexOf("//") === 0) {
            return "https:" + url;
        }

        return url;
    },

    extractStreamUrl: function (html) {
        var raw = String(html || "").replace(/\\u002F/gi, "/").replace(/\\\//g, "/");

        // 1. Tìm trực tiếp link .m3u8
        var m3u8Match = raw.match(/https?:\/\/[^\s"'<>\\)]+\.m3u8[^\s"'<>\\)]*/i);
        if (m3u8Match && m3u8Match[0]) {
            return m3u8Match[0];
        }

        // 2. Tìm UUID trên các host liên quan (ưu tiên mrstcdn.store / surrit / fourhoi / sixyik / nineyu)
        var hostUuidMatch = raw.match(/(https?:\/\/(?:[a-z0-9-]+\.)?(?:mrstcdn\.store|surrit(?:\.com)?|fourhoi(?:\.com)?|sixyik\.com|nineyu\.com)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
        if (hostUuidMatch && hostUuidMatch[1]) {
            return hostUuidMatch[1].replace(/\/+$/, "") + "/playlist.m3u8";
        }

        // 3. Fallback: tìm UUID hợp lệ và ghép playlist.m3u8
        var uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
        var matches = raw.match(uuidRegex) || [];
        var blacklist = ["snaptrckr", "user_uuid", "popunder", "banner", "monitoring", "crypto", "randomUUID", "generateUUID"];

        for (var i = 0; i < matches.length; i++) {
            var u = matches[i];
            var idx = raw.indexOf(u);
            var isBad = false;
            if (idx !== -1) {
                var ctx = raw.substring(Math.max(0, idx - 80), Math.min(raw.length, idx + 80));
                for (var j = 0; j < blacklist.length; j++) {
                    if (ctx.indexOf(blacklist[j]) !== -1) {
                        isBad = true;
                        break;
                    }
                }
            }
            if (!isBad) {
                return "https://surrit.com/" + u + "/playlist.m3u8";
            }
        }

        return "";
    }
};

function parseListResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var movies = [];

    var isSearchPage = html.indexOf("window.recombeeClient.send(new recombee.SearchItems") !== -1 ||
        (html.indexOf('x-data="{') !== -1 && html.indexOf("recommendItems") !== -1);

    if (isSearchPage) {
        return JSON.stringify({
            items: [{
                id: "/vi",
                title: "⚠️ Tìm kiếm MissAV chưa hỗ trợ",
                posterUrl: "",
                backdropUrl: "",
                description: "Trang tìm kiếm của MissAV sử dụng công nghệ tải động (Alpine.js + Recombee API), không thể parse từ HTML tĩnh. Vui lòng sử dụng các mục 'Thể loại', 'Hôm nay nóng', 'Mới nhất' để duyệt phim.",
                year: 0,
                quality: "INFO",
                episode_current: "",
                lang: ""
            }],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 1 }
        });
    }

    var actressLinkMatch = html.match(/href="[^"]*\/actresses\/[^"]+"/g);
    var isActressesPage = !!(actressLinkMatch && actressLinkMatch.length > 5);

    var isAllGenresPage = !isActressesPage &&
        html.indexOf('class="text-nord13"') !== -1 &&
        html.indexOf(":đếm video") !== -1;

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

            var img = PluginUtils.extractImage(itemHtml);
            var slug = url.replace(/^https?:\/\/[^/]+/, "");
            if (slug.indexOf("/") !== 0) slug = "/" + slug;

            if (!foundActresses[slug]) {
                movies.push({
                    id: slug,
                    title: name,
                    posterUrl: img,
                    backdropUrl: img,
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

                var gSlug = gUrl.replace(/^https?:\/\/[^/]+/, "");
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
            var pHtml = parts[i];
            var slug = "";
            var fullLinkMatch = pHtml.match(/<a[^>]+href="([^"]+)"/);
            if (fullLinkMatch) {
                slug = fullLinkMatch[1].replace(/^https?:\/\/[^/]+/, "");
                if (slug.indexOf("/") !== 0) slug = "/" + slug;
            }

            var codeMatch = pHtml.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";
            if (!code && slug) {
                var slugParts = slug.split("/");
                code = slugParts[slugParts.length - 1];
            }

            var titleCandidates = [];
            var imgFullMatch = pHtml.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
            if (imgFullMatch) titleCandidates.push(PluginUtils.cleanText(imgFullMatch[1]));

            var otherTitleRegex = /title="([^"]+)"/gi;
            var tMatch;
            while ((tMatch = otherTitleRegex.exec(pHtml)) !== null) {
                var val = PluginUtils.cleanText(tMatch[1]);
                if (val.toUpperCase() !== code.toUpperCase()) titleCandidates.push(val);
            }

            var bestTitle = "";
            for (var c = 0; c < titleCandidates.length; c++) {
                if (titleCandidates[c].length > bestTitle.length) bestTitle = titleCandidates[c];
            }

            var cleanTitle = bestTitle || code;
            if (code && cleanTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
                var stripped = cleanTitle.substring(code.length).trim();
                if (stripped.indexOf("-") === 0 || stripped.indexOf(" ") === 0) {
                    stripped = stripped.substring(1).trim();
                }
                if (stripped.length > 3) cleanTitle = stripped;
            }
            if (!cleanTitle) cleanTitle = code || "No Title";

            var thumb = PluginUtils.extractImage(pHtml);
            if (thumb && thumb.indexOf("cover-t.jpg") !== -1) {
                thumb = PluginUtils.normalizeUrl(thumb.replace("/cover-t.jpg", "/cover.jpg")) || thumb;
            }

            if (slug && slug.indexOf("actresses") === -1 && slug.indexOf("genres") === -1) {
                if (slug.indexOf("item.") !== -1 || slug.indexOf("{{") !== -1 || slug === "/" || slug === "#") continue;
                if (cleanTitle.indexOf("item.") !== -1 || cleanTitle.indexOf("{{") !== -1) continue;
                if (thumb.indexOf("item.") !== -1 || thumb.indexOf("itemUrl") !== -1) continue;

                var durationMatch = pHtml.match(/<span[^>]*>\s*(\d+):(\d+):(\d+)\s*<\/span>/);
                var duration = durationMatch ? durationMatch[1] + ":" + durationMatch[2] + ":" + durationMatch[3] : "";

                var isUncensored = pHtml.indexOf("Không kiểm duyệt") !== -1 ||
                    pHtml.indexOf("Uncensored") !== -1 ||
                    pHtml.indexOf("bg-blue-800") !== -1;

                var previewUrl = PluginUtils.extractPreviewUrl(pHtml);

                movies.push({
                    id: slug,
                    title: cleanTitle,
                    posterUrl: thumb,
                    backdropUrl: thumb,
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
    if (currentMatch) currentPage = parseInt(currentMatch[1], 10) || 1;

    var allPageNums = html.match(/page=(\d+)/g);
    if (allPageNums) {
        for (var j = 0; j < allPageNums.length; j++) {
            var p = parseInt(allPageNums[j].match(/\d+/)[0], 10);
            if (p > totalPages) totalPages = p;
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
            return String(url).replace(/^https?:\/\/[^/]+/, "");
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
            if (divEnd === -1) divEnd = searchArea.length;

            var content = searchArea.substring(0, divEnd);
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
            var dvdIdMatch = html.match(/dvdId:\s*'([^']+)'/);
            code = dvdIdMatch ? dvdIdMatch[1] : "";
        }

        var title = PluginUtils.getMeta(html, "og:title");
        var thumb = PluginUtils.normalizeUrl(PluginUtils.getMeta(html, "og:image")) || PluginUtils.extractImage(html);
        var desc = PluginUtils.getMeta(html, "og:description");

        var previewMatch = html.match(/<video[^>]+(?:data-src|src)=["']([^"']+)["']/i) || html.match(/video_url:\s*'([^']+)'/);
        var previewUrl = previewMatch ? previewMatch[1] : "";
        if (!previewUrl && thumb && thumb.indexOf("cover.jpg") !== -1) {
            previewUrl = thumb.replace("cover.jpg", "preview.mp4");
        }

        var displayTitle = title;
        if (code && displayTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
            displayTitle = displayTitle.substring(code.length).trim();
            if (displayTitle.indexOf("-") === 0 || displayTitle.indexOf(" ") === 0) {
                displayTitle = displayTitle.substring(1).trim();
            }
        }
        if (code) displayTitle = "[" + code.toUpperCase() + "] " + displayTitle;

        var titleWords = displayTitle.split(" ");
        if (titleWords.length > 25) {
            displayTitle = titleWords.slice(0, 25).join(" ") + "...";
        }

        var streamUrl = PluginUtils.extractStreamUrl(html);
        var servers = [];
        if (streamUrl) {
            servers.push({
                name: "Stream",
                episodes: [{
                    id: pageUrl || streamUrl,
                    name: "Full",
                    slug: "full",
                    m3u8: streamUrl
                }]
            });
        }

        var statusLine = "";
        if (studio) statusLine += "Studio: " + studio;
        if (label) statusLine += (statusLine ? " | " : "") + "Label: " + label;
        if (!statusLine && releaseDate) statusLine = "Released: " + releaseDate;

        var year = releaseDate ? (parseInt(releaseDate.substring(0, 4), 10) || 0) : 0;

        return JSON.stringify({
            id: code || "",
            title: PluginUtils.cleanText(displayTitle),
            posterUrl: thumb,
            backdropUrl: thumb,
            description: PluginUtils.cleanText(desc),
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: year,
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

function parseDetailResponse(html) {
    var streamUrl = PluginUtils.extractStreamUrl(html);
    return JSON.stringify({
        url: streamUrl,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            "Referer": "https://missav.media/",
            "Origin": "https://missav.media"
        },
        subtitles: []
    });
}

function parseCategoriesResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var categories = [{ name: "Tất cả thể loại", slug: "vi/genres" }];
    var regex = /<a[^>]+href=["']([^"']*\/vi\/genres\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;
    var seen = {};

    while ((match = regex.exec(html)) !== null) {
        var fullPath = match[1];
        var name = PluginUtils.cleanText(match[2]);
        var parts = fullPath.split("/genres/");
        var slug = parts.length > 1 ? parts[1].replace(/^\/+|\/+$/g, "") : "";

        if (slug && name && !seen[slug]) {
            seen[slug] = true;
            categories.push({
                name: name,
                slug: "vi/genres/" + slug
            });
        }
    }

    return JSON.stringify(categories);
}
