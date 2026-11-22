// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.6",
        "baseUrl": "https://javhdz.today",
        "iconUrl": "https://javhdz.today/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embedtoexoplay"
    });
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'recent' },
        { name: 'Không Che', slug: 'uncensored-jav' },
        { name: 'Khử Che', slug: 'reducing-mosaic' },
        { name: 'Vietsub', slug: 'jav-sub' },
        { name: 'Nghiệp Dư', slug: 'amateur' }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'popular/today', title: 'Xem Nhiều Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'uncensored-jav', title: 'Jav Uncensored', type: 'Horizontal', path: '' },
        { slug: 'reducing-mosaic', title: 'Reducing Mosaic', type: 'Horizontal', path: '' },
        { slug: 'jav-sub', title: 'Jav Sub', type: 'Horizontal', path: '' },
        { slug: 'recent', title: 'Video Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'recent' },
            { name: 'Xem nhiều hôm nay', value: 'popular/today' },
            { name: 'Xem nhiều trong tuần', value: 'popular/week' },
            { name: 'Xem nhiều trong tháng', value: 'popular/month' },
            { name: 'Xem nhiều tất cả', value: 'popular/year' },
            { name: 'Nhiều lượt thích', value: 'rated/year' }
        ],
        category: [
            { name: "Uncensored Jav", value: "uncensored-jav" },
            { name: "Reducing Mosaic", value: "reducing-mosaic" },
            { name: "Jav Sub", value: "jav-sub" },
            { name: "Chinese Sub", value: "chinese-subtitle" },
            { name: "Creampie", value: "creampie" },
            { name: "Big Tits", value: "big-tits" },
            { name: "Amateur", value: "amateur" },
            { name: "Married Woman", value: "married-woman" },
            { name: "Beautiful Girl", value: "beautiful-girl" },
            { name: "Mature Woman", value: "mature-woman" },
            { name: "Cuckold", value: "cuckold" },
            { name: "Squirting", value: "squirting" },
            { name: "Nasty", value: "nasty" },
            { name: "Hardcore", value: "hardcore" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = parseInt(filters.page) || 1;
    var sortPath = (filters.sort && filters.sort !== 'recent') ? (filters.sort + '/') : '';

    var targetSlug = slug || 'recent';
    if (filters.category) {
        targetSlug = filters.category;
    }

    var isBrowse = false;
    var browsePrefixes = ['recent', 'popular', 'rated', 'discussed', 'downloaded', 'longest', 'watched'];
    for (var i = 0; i < browsePrefixes.length; i++) {
        if (targetSlug.indexOf(browsePrefixes[i]) === 0) {
            isBrowse = true;
            break;
        }
    }

    var finalUrl = "";
    if (filters.category) {
        finalUrl = "https://javhdz.today/" + filters.category + "/" + sortPath;
    } else if (!slug || slug === 'recent') {
        finalUrl = "https://javhdz.today/recent/";
    } else if (slug.indexOf("http") === 0) {
        finalUrl = slug.replace(/\/+$/, '') + '/';
    } else {
        if (slug.indexOf("/") === 0) {
            slug = slug.replace(/^\/+/, '').replace(/\/+$/, '');
        }
        finalUrl = "https://javhdz.today/" + slug + "/" + sortPath;
    }

    var params = [];
    if (isBrowse) {
        params.push("ajax=browse_videos");
    } else {
        params.push("ajax=1");
    }

    if (page > 1) {
        params.push("page=" + page);
    }

    var separator = (finalUrl.indexOf('?') !== -1) ? '&' : '?';
    return finalUrl + separator + params.join('&');
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = parseInt(filters.page) || 1;
    var url = "https://javhdz.today/search/video/?s=" + encodeURIComponent(keyword) + "&ajax=1";
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return "https://javhdz.today" + slug;
    return "https://javhdz.today/" + slug;
}

function getUrlCategories() { return "https://javhdz.today/categories/"; }
function getUrlCountries() { return "https://javhdz.today/"; }
function getUrlYears() { return "https://javhdz.today/"; }

// =============================================================================
// PARSERS & HELPERS
// =============================================================================

var PluginUtils = {
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/\s+/g, " ")
            .trim();
    },
    decodeBase64: function (input) {
        if (!input) return "";
        var str = String(input).trim();
        try {
            if (typeof atob === "function") {
                return atob(str);
            }
        } catch (e) {}

        var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var output = "";
        str = str.replace(/[^A-Za-z0-9\+\/]/g, "");
        for (var bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
            buffer = b64chars.indexOf(buffer);
        }
        return output;
    },
    getAttr: function (attrsStr, attrName) {
        if (!attrsStr || !attrName) return "";
        var re = new RegExp(attrName + "\\s*=\\s*([\"'])([\\s\\S]*?)\\1", "i");
        var m = attrsStr.match(re);
        return m ? m[2] : "";
    },
    getHostName: function (url) {
        if (!url) return "";
        var m = String(url).match(/^https?:\/\/([^\/?#]+)/i);
        return m ? m[1].replace(/^www\./i, "") : "";
    }
};

function parseListResponse(html) {
    var responseHtml = html || "";
    var paginationHtml = "";

    if (responseHtml.trim().indexOf('{') === 0) {
        try {
            var data = JSON.parse(responseHtml);
            if (data && data.html) {
                responseHtml = data.html;
                if (data.pagination) {
                    paginationHtml = data.pagination;
                }
            }
        } catch (e) {}
    }

    var moviesMap = {};
    var parts = responseHtml.split(/<li[^>]*id=["']video-[^"']*["'][^>]*>/);

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];

        var fullUrl = "";
        var title = "";

        var aRegex = /<a([^>]+)>/g;
        var aMatch;
        while ((aMatch = aRegex.exec(itemHtml)) !== null) {
            var attrs = aMatch[1];
            if (attrs.indexOf('thumbnail') !== -1) {
                var linkM = attrs.match(/href=["']([^"']+)["']/);
                var titleM = attrs.match(/title=["']([^"']*)["']/);
                if (linkM) fullUrl = linkM[1];
                if (titleM) title = titleM[1];
                break;
            }
        }

        var slug = fullUrl;
        if (slug && slug.indexOf('/') === 0) slug = slug.substring(1);

        var thumb = "";
        var imgRegex = /<img([^>]+)>/;
        var imgMatch = itemHtml.match(imgRegex);
        if (imgMatch) {
            var imgAttrs = imgMatch[1];
            var srcM = imgAttrs.match(/src=["']([^"']+)["']/);
            var dataSrcM = imgAttrs.match(/data-src=["']([^"']+)["']/);
            thumb = (dataSrcM && dataSrcM[1]) ? dataSrcM[1] : (srcM ? srcM[1] : "");
        }

        if (slug) {
            var rawTitle = PluginUtils.cleanText(title);

            var durationMatch = itemHtml.match(/<span[^>]*class=["']video-overlay badge transparent["'][^>]*>([\s\S]*?)<\/span>/);
            var duration = durationMatch ? PluginUtils.cleanText(durationMatch[1]) : "";

            var codeMatch = itemHtml.match(/<span[^>]*class=["']video-overlay1 badge transparent["'][^>]*>([\s\S]*?)<\/span>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";

            var labels = [];
            if (duration) labels.push(duration);
            if (code) labels.push(code);

            var labelText = labels.join(" | ") || "HD";

            if (!moviesMap[slug]) {
                moviesMap[slug] = {
                    id: slug,
                    title: rawTitle || "Phim không tiêu đề",
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    year: 0,
                    quality: "HD",
                    episode_current: labelText,
                    lang: "Vietsub"
                };
            }
        }
    }

    var movies = [];
    for (var key in moviesMap) {
        if (moviesMap.hasOwnProperty(key)) {
            movies.push(moviesMap[key]);
        }
    }

    var totalPages = 1;
    var currentPage = 1;

    var paginationSrc = paginationHtml || responseHtml;
    var pagNav = "";
    var paginationBlock = paginationSrc.match(/<ul[^>]*class="[^"]*pagination[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
    if (paginationBlock) {
        pagNav = paginationBlock[1];
    } else if (paginationHtml) {
        pagNav = paginationHtml;
    }

    if (pagNav) {
        var activeMatch = pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<a[^>]*>(\d+)<\/a>/i)
            || pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<span[^>]*>(\d+)<\/span>/i);
        if (activeMatch) {
            currentPage = parseInt(activeMatch[1]) || 1;
        }

        var pageLinks = pagNav.match(/href="[^"]*\/(\d+)\/?[^"]*"/g);
        if (pageLinks) {
            for (var j = 0; j < pageLinks.length; j++) {
                var pMatch = pageLinks[j].match(/\/(\d+)\/?"/);
                if (pMatch) {
                    var p = parseInt(pMatch[1]);
                    if (p > totalPages) totalPages = p;
                }
            }
        }

        var queryPageLinks = pagNav.match(/href="[^"]*(?:[?&]|&)page=(\d+)[^"]*"/g);
        if (queryPageLinks) {
            for (var j = 0; j < queryPageLinks.length; j++) {
                var pMatch = queryPageLinks[j].match(/(?:[?&]|&)page=(\d+)/);
                if (pMatch) {
                    var p = parseInt(pMatch[1]);
                    if (p > totalPages) totalPages = p;
                }
            }
        }
    }

    if (totalPages <= 1) {
        var queryPages = paginationSrc.match(/(?:[?&]|&)page=(\d+)/g);
        if (queryPages) {
            for (var k = 0; k < queryPages.length; k++) {
                var qMatch = queryPages[k].match(/page=(\d+)/) || queryPages[k].match(/(\d+)/);
                if (qMatch) {
                    var qp = parseInt(qMatch[1]);
                    if (qp > totalPages) totalPages = qp;
                }
            }
        }
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

function parseMovieDetail(html) {
    try {
        var safeHtml = html || "";

        // Tiêu đề phim
        var titleMatch = safeHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        // Mô tả phim
        var descMatch = safeHtml.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        // Ảnh thumbnail / poster
        var thumbMatch = safeHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var thumb = thumbMatch ? thumbMatch[1] : "";

        // Mã phim / Label
        var codeMatch = safeHtml.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "Full";

        // Thời lượng nếu có
        var durationMatch = safeHtml.match(/(?:Duration|Thời lượng)[^<]*:\s*<[^>]*>([^<]+)<\/[^>]*>/i)
            || safeHtml.match(/<span[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var duration = durationMatch ? PluginUtils.cleanText(durationMatch[1]) : "";

        // Diễn viên / Casts nếu có
        var castLinks = [];
        var castRegex = /<a[^>]*href=["']\/(?:actor|model|actress|cast|pornstar)\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
        var castMatch;
        while ((castMatch = castRegex.exec(safeHtml)) !== null) {
            var cName = PluginUtils.cleanText(castMatch[1]);
            if (cName && castLinks.indexOf(cName) === -1) {
                castLinks.push(cName);
            }
        }

        // Thể loại / Categories
        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["']fa fa-th-list["'][^>]*><\/i>([^<]+)<\/a>/gi;
        var categoriesArr = [];
        var catMatch;
        while ((catMatch = categoryRegex.exec(safeHtml)) !== null) {
            var catName = PluginUtils.cleanText(catMatch[2]);
            if (catName && categoriesArr.indexOf(catName) === -1) {
                categoriesArr.push(catName);
            }
        }

        // Danh sách server & chi tiết server
        var servers = [];
        var serverDetails = [];
        var foundServer = false;

        var btnRegex = /<button([^>]*\bclass=["'][^"']*\bbutton_choice_server\b[^"']*["'][^>]*)>([\s\S]*?)<\/button>/gi;
        var btnMatch;
        var idxCounter = 0;

        while ((btnMatch = btnRegex.exec(safeHtml)) !== null) {
            var attrs = btnMatch[1] || "";
            var innerHtml = btnMatch[2] || "";

            var dataName = PluginUtils.cleanText(PluginUtils.getAttr(attrs, "data-name"));
            var dataPlayer = PluginUtils.getAttr(attrs, "data-player");
            var btnClass = PluginUtils.getAttr(attrs, "class");
            var isActive = /\bactive-server\b/i.test(btnClass);

            var badgeMatch = innerHtml.match(/<span[^>]*class=["'][^"']*server-label[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var badge = badgeMatch ? PluginUtils.cleanText(badgeMatch[1]) : "";

            var htmlWithoutBadge = innerHtml.replace(/<span[^>]*class=["'][^"']*server-label[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, "");
            var labelText = PluginUtils.cleanText(htmlWithoutBadge);

            var dataEmbeds = PluginUtils.getAttr(attrs, "data-embeds");
            var dataEmbed = PluginUtils.getAttr(attrs, "data-embed");

            var urls = [];
            if (dataEmbeds) {
                try {
                    var parsedArr = JSON.parse(PluginUtils.decodeBase64(dataEmbeds));
                    if (Array.isArray(parsedArr)) {
                        for (var uIdx = 0; uIdx < parsedArr.length; uIdx++) {
                            var uItem = String(parsedArr[uIdx] || "").trim();
                            if (uItem) urls.push(uItem);
                        }
                    }
                } catch (e) {}
            }

            if (urls.length === 0 && dataEmbed) {
                var singleUrl = PluginUtils.decodeBase64(dataEmbed).trim();
                if (singleUrl) urls.push(singleUrl);
            }

            if (urls.length > 0) {
                foundServer = true;
                idxCounter++;

                var baseName = dataName || labelText || ("Server " + idxCounter);
                var hosts = [];
                var episodes = [];

                for (var eIdx = 0; eIdx < urls.length; eIdx++) {
                    var streamUrl = urls[eIdx];
                    var host = PluginUtils.getHostName(streamUrl);
                    if (host && hosts.indexOf(host) === -1) {
                        hosts.push(host);
                    }

                    var epName = urls.length > 1
                        ? ("Mirror " + (eIdx + 1) + "/" + urls.length + (host ? " (" + host + ")" : ""))
                        : ("Full" + (host ? " (" + host + ")" : ""));

                    episodes.push({
                        id: streamUrl,
                        name: epName,
                        slug: urls.length > 1 ? ("mirror-" + (eIdx + 1)) : "full",
                        host: host,
                        serverName: baseName
                    });
                }

                var metaParts = [];
                if (badge) metaParts.push(badge);
                if (isActive) metaParts.push("Active");
                metaParts.push(urls.length > 1 ? (urls.length + " mirrors") : "1 link");
                if (dataPlayer !== "") metaParts.push("Player " + dataPlayer);
                if (hosts.length > 0) metaParts.push(hosts.join(", "));

                var displayName = baseName + " [" + metaParts.join(" • ") + "]";

                servers.push({
                    name: displayName,
                    rawName: baseName,
                    badge: badge,
                    player: dataPlayer,
                    isActive: isActive,
                    linkCount: urls.length,
                    hosts: hosts,
                    episodes: episodes
                });

                serverDetails.push(
                    baseName +
                    (badge ? " [" + badge + "]" : "") +
                    " — " + urls.length + " link" +
                    (dataPlayer !== "" ? " (player=" + dataPlayer + ")" : "") +
                    (hosts.length > 0 ? " — Hosts: " + hosts.join(", ") : "")
                );
            }
        }

        if (!foundServer) {
            servers.push({
                name: "Không tìm thấy server",
                episodes: [{ id: "", name: "Full", slug: "full" }]
            });
            serverDetails.push("Không tìm thấy server");
        }

        // Tổng hợp chi tiết phim + chi tiết server
        var infoLines = [];
        if (title) infoLines.push("Tên phim: " + title);
        if (code) infoLines.push("Mã / Label: " + code);
        if (duration) infoLines.push("Thời lượng: " + duration);
        if (categoriesArr.length > 0) infoLines.push("Thể loại: " + categoriesArr.join(", "));
        if (castLinks.length > 0) infoLines.push("Diễn viên: " + castLinks.join(", "));
        if (description) infoLines.push("Nội dung: " + description);
        infoLines.push("Chi tiết Server (" + servers.length + "):\n- " + serverDetails.join("\n- "));

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: infoLines.join("\n"),
            servers: servers,
            serverDetails: serverDetails,
            quality: "HD",
            lang: "Vietsub",
            duration: duration,
            year: 0,
            rating: 0,
            casts: castLinks.join(", "),
            director: "",
            country: "",
            category: categoriesArr.join(", "),
            status: code
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html, fallbackUrl) {
    try {
        var hostUrl = fallbackUrl || "";

        var mainPlayerStr = 'id="main-player"';
        var idxMain = html.indexOf(mainPlayerStr);
        if (idxMain !== -1) {
            var srcStr = 'src="';
            var idxSrc = html.indexOf(srcStr, idxMain);
            if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                var startUrl = idxSrc + srcStr.length;
                var endUrl = html.indexOf('"', startUrl);
                if (endUrl !== -1) {
                    hostUrl = html.substring(startUrl, endUrl);
                }
            }
        }

        return JSON.stringify({
            url: hostUrl,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://javhdz.today/"
            },
            subtitles: [],
            isEmbed: true,
            embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
        });
    } catch (e) {
        return JSON.stringify({ url: fallbackUrl || "", headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(html, fallbackUrl) {
    return JSON.stringify({
        url: fallbackUrl || "",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://javhdz.today/"
        },
        subtitles: [],
        isEmbed: false
    });
}

function parseCategoriesResponse(html) {
    var categories = [];
    var parts = html.split(/<li[^>]*id=["']category-[^"']*["'][^>]*>/);
    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var linkMatch = itemHtml.match(/href=["']\/([^"']+)[\/]?["']/);
        var nameMatch = itemHtml.match(/<div[^>]*class=["']category-title["'][^>]*>([\s\S]*?)<\/div>/);

        if (linkMatch && nameMatch) {
            var slug = linkMatch[1];
            if (slug.endsWith('/')) slug = slug.substring(0, slug.length - 1);
            var name = PluginUtils.cleanText(nameMatch[1]);
            categories.push({
                name: name,
                slug: slug
            });
        }
    }
    return JSON.stringify(categories);
}
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
