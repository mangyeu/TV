// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.2.0",
        "baseUrl": "https://javhdz.today",
        "iconUrl": "https://javhdz.today/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE"
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
    if (!slug) return "https://javhdz.today/";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return "https://javhdz.today" + slug;
    return "https://javhdz.today/" + slug;
}

function getUrlCategories() { return "https://javhdz.today/categories/"; }
function getUrlCountries() { return "https://javhdz.today/"; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS & HELPERS
// =============================================================================

var PluginUtils = {
    cleanText: function (text) {
        if (!text) return "";
        return String(text)
            .replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&nbsp;/g, " ")
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
    },
    // Chỉ dùng để tìm link media trực tiếp trong HTML (nếu có)
    extractMediaUrl: function (text) {
        var unescaped = String(text || "")
            .replace(/\\\//g, "/")
            .replace(/\\u0026/g, "&")
            .replace(/&amp;/g, "&");

        var patterns = [
            /(https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*)/i,
            /(https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*)/i
        ];

        for (var i = 0; i < patterns.length; i++) {
            var m = unescaped.match(patterns[i]);
            if (m && m[1]) {
                return m[1].trim();
            }
        }
        return "";
    },
    extractIframeUrl: function (html) {
        var unescaped = String(html || "")
            .replace(/\\\//g, "/")
            .replace(/&amp;/g, "&");

        var iframeMatch = unescaped.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        if (iframeMatch) {
            var u = (iframeMatch[1] || "").trim();
            if (u.indexOf("//") === 0) u = "https:" + u;
            return u;
        }
        return "";
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

        var slug = fullUrl || "";
        if (slug.indexOf("https://javhdz.today/") === 0) {
            slug = slug.replace("https://javhdz.today/", "");
        } else if (slug.indexOf("http://javhdz.today/") === 0) {
            slug = slug.replace("http://javhdz.today/", "");
        }
        if (slug.indexOf('/') === 0) {
            slug = slug.substring(1);
        }

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

        var queryPageLinks = pagNav.match(/href="[^"]*(?:[?&]|&amp;)page=(\d+)[^"]*"/g);
        if (queryPageLinks) {
            for (var j = 0; j < queryPageLinks.length; j++) {
                var pMatch = queryPageLinks[j].match(/(?:[?&]|&amp;)page=(\d+)/);
                if (pMatch) {
                    var p = parseInt(pMatch[1]);
                    if (p > totalPages) totalPages = p;
                }
            }
        }
    }

    if (totalPages <= 1) {
        var queryPages = paginationSrc.match(/(?:[?&]|&amp;)page=(\d+)/g);
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

        var canonicalMatch = safeHtml.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
            || safeHtml.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        var movieSlug = canonicalMatch
            ? canonicalMatch[1].replace(/^https?:\/\/[^\/]+\/?/, "")
            : "";

        var titleMatch = safeHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
            || safeHtml.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
            || safeHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "Chi tiết phim";

        var descMatch = safeHtml.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)
            || safeHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        var thumbMatch = safeHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var thumb = thumbMatch ? thumbMatch[1] : "";

        var codeMatch = safeHtml.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";

        var durationMatch = safeHtml.match(/(?:Duration|Thời\s*lượng)[^<]*:\s*<[^>]*>([\s\S]*?)<\/[^>]*>/i);
        var duration = durationMatch ? PluginUtils.cleanText(durationMatch[1]) : "";

        var yearMatch = safeHtml.match(/(?:Release\s*Date|Release\s*Year|Year|Năm)[^<]*:[\s\S]{0,60}?(\b(?:19|20)\d{2}\b)/i);
        var year = yearMatch ? (parseInt(yearMatch[1], 10) || 0) : 0;

        var ratingMatch = safeHtml.match(/(?:Rating|Đánh\s*giá)[^<]*:[\s\S]{0,40}?([0-9]+(?:\.[0-9]+)?)/i);
        var rating = ratingMatch ? (parseFloat(ratingMatch[1]) || 0) : 0;

        var categoriesArr = [];
        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["']fa fa-th-list["'][^>]*><\/i>([^<]+)<\/a>/gi;
        var catMatch;
        while ((catMatch = categoryRegex.exec(safeHtml)) !== null) {
            var catName = PluginUtils.cleanText(catMatch[2]);
            if (catName && categoriesArr.indexOf(catName) === -1) {
                categoriesArr.push(catName);
            }
        }

        var countryArr = [];
        var countryRegex = /<a[^>]*href=["']\/(?:country|quoc-gia)\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
        var countryMatch;
        while ((countryMatch = countryRegex.exec(safeHtml)) !== null) {
            var countryName = PluginUtils.cleanText(countryMatch[1]);
            if (countryName && countryArr.indexOf(countryName) === -1) {
                countryArr.push(countryName);
            }
        }

        var directorArr = [];
        var directorRegex = /<a[^>]*href=["']\/(?:director|dao-dien)\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
        var dirMatch;
        while ((dirMatch = directorRegex.exec(safeHtml)) !== null) {
            var dirName = PluginUtils.cleanText(dirMatch[1]);
            if (dirName && directorArr.indexOf(dirName) === -1) {
                directorArr.push(dirName);
            }
        }

        var castsArr = [];
        var castRegex = /<a[^>]*href=["']\/(?:actor|model|actress|cast|pornstar)\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
        var castMatch;
        while ((castMatch = castRegex.exec(safeHtml)) !== null) {
            var actorName = PluginUtils.cleanText(castMatch[1]);
            if (actorName && castsArr.indexOf(actorName) === -1) {
                castsArr.push(actorName);
            }
        }

        var servers = [];
        var serverInfoLines = [];
        var btnRegex = /<button([^>]*button_choice_server[^>]*)>([\s\S]*?)<\/button>/gi;
        var btnMatch;
        var idxCounter = 0;

        while ((btnMatch = btnRegex.exec(safeHtml)) !== null) {
            var attrs = btnMatch[1] || "";
            var innerHtml = btnMatch[2] || "";

            var dataName = PluginUtils.cleanText(PluginUtils.getAttr(attrs, "data-name"));
            var badgeMatch = innerHtml.match(/<span[^>]*class=["'][^"']*server-label[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var badge = badgeMatch ? PluginUtils.cleanText(badgeMatch[1]) : "";
            var labelText = PluginUtils.cleanText(
                innerHtml.replace(/<span[^>]*class=["'][^"']*server-label[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, "")
            );

            var dataEmbeds = PluginUtils.getAttr(attrs, "data-embeds");
            var dataEmbed = PluginUtils.getAttr(attrs, "data-embed");
            var urls = [];

            if (dataEmbeds) {
                try {
                    var decodedEmbeds = PluginUtils.decodeBase64(dataEmbeds);
                    var parsedArr = JSON.parse(decodedEmbeds);
                    if (parsedArr && parsedArr.length) {
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
                idxCounter++;
                var baseName = dataName || labelText || ("Server " + idxCounter);
                var serverName = baseName + (badge ? " [" + badge + "]" : "");
                var serverEpisodes = [];
                var hosts = [];

                for (var eIdx = 0; eIdx < urls.length; eIdx++) {
                    var streamUrl = urls[eIdx];
                    var host = PluginUtils.getHostName(streamUrl);
                    if (host && hosts.indexOf(host) === -1) {
                        hosts.push(host);
                    }

                    var epLabel = urls.length > 1
                        ? ("Mirror " + (eIdx + 1) + (host ? " (" + host + ")" : ""))
                        : ("Full" + (host ? " (" + host + ")" : ""));

                    serverEpisodes.push({
                        id: streamUrl,
                        name: epLabel,
                        slug: urls.length > 1 ? ("mirror-" + (eIdx + 1)) : "full"
                    });
                }

                servers.push({
                    name: serverName,
                    episodes: serverEpisodes
                });

                serverInfoLines.push(
                    serverName + " (" + urls.length + " link" + (hosts.length ? ": " + hosts.join(", ") : "") + ")"
                );
            }
        }

        if (servers.length === 0) {
            var iframeUrl = PluginUtils.extractIframeUrl(safeHtml);
            if (iframeUrl) {
                servers.push({
                    name: "Embed Server",
                    episodes: [{ id: iframeUrl, name: "Full", slug: "full" }]
                });
                serverInfoLines.push("Embed Server (1 link)");
            }
        }

        if (servers.length === 0) {
            servers.push({
                name: "Unknown",
                episodes: [{ id: "", name: "Full", slug: "full" }]
            });
        }

        var fullDescription = description;
        if (serverInfoLines.length > 0) {
            fullDescription = (description ? description + "\n\n" : "")
                + "Danh sách Server (" + servers.length + "):\n• " + serverInfoLines.join("\n• ");
        }

        return JSON.stringify({
            id: movieSlug || title,
            title: title,
            originName: code || "",
            posterUrl: thumb,
            backdropUrl: thumb,
            description: fullDescription,
            year: year,
            rating: rating,
            quality: "HD",
            duration: duration,
            servers: servers,
            episode_current: code || "Full",
            lang: "Vietsub",
            category: categoriesArr.join(", "),
            country: countryArr.join(", "),
            director: directorArr.join(", "),
            casts: castsArr.join(", "),
            status: code || "Full",
            tmdbId: "",
            tmdbSeason: 0,
            tmdbType: ""
        });
    } catch (error) {
        return "null";
    }
}

function parseDetailResponse(html, fallbackUrl) {
    try {
        var safeHtml = html || "";
        // Chỉ tìm link media trực tiếp nếu có (hiếm khi xảy ra với mycloudz)
        var mediaUrl = PluginUtils.extractMediaUrl(safeHtml);
        var iframeUrl = PluginUtils.extractIframeUrl(safeHtml);
        var targetUrl = mediaUrl || iframeUrl || (fallbackUrl || "");
        
        // Nếu tìm thấy link media trực tiếp -> không phải embed
        // Ngược lại -> là embed, để app core xử lý
        var isEmbed = !mediaUrl;

        var host = PluginUtils.getHostName(targetUrl);
        var referer = host ? ("https://" + host + "/") : "https://javhdz.today/";

        return JSON.stringify({
            url: targetUrl,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
                "Referer": referer
            },
            subtitles: [],
            isEmbed: isEmbed,
            // Regex này sẽ được app core dùng để tìm link stream bên trong iframe
            // sau khi JavaScript của player mycloudz đã chạy và tạo ra link .m3u8
            embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
        });
    } catch (e) {
        return JSON.stringify({
            url: fallbackUrl || "",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
                "Referer": "https://javhdz.today/"
            },
            subtitles: [],
            isEmbed: true
        });
    }
}

/**
 * Hàm này được gọi khi app core tải nội dung của iframe embed.
 * Với mycloudz.cc, nội dung HTML ban đầu KHÔNG chứa link .m3u8.
 * Link .m3u8 được tạo ra bởi JavaScript (provider.hlsjs.js) sau khi iframe được tải.
 * 
 * Do đó, chiến lược đúng đắn là:
 * 1. Nếu tìm thấy link media trực tiếp trong HTML (may mắn) -> trả về ngay.
 * 2. Nếu không, trả về URL embed gốc với isEmbed: true.
 *    App core của bạn (với khả năng thực thi JS trong WebView) sẽ tự động
 *    chạy player, đợi link .m3u8 xuất hiện, rồi dùng embedRegex để bắt lấy.
 * 
 * TUYỆT ĐỐI KHÔNG cố gắng tự xây dựng URL /dl hay tìm link trong HTML tĩnh.
 */
function parseEmbedResponse(html, fallbackUrl) {
    try {
        var safeHtml = String(html || "").trim();
        var cleanFallback = String(fallbackUrl || "").trim();

        // 1. Thử tìm link media trực tiếp trong HTML (trường hợp may mắn)
        var mediaUrl = PluginUtils.extractMediaUrl(safeHtml);
        if (mediaUrl) {
            var host = PluginUtils.getHostName(mediaUrl);
            return JSON.stringify({
                url: mediaUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
                    "Referer": cleanFallback || ("https://" + (host || "mycloudz.cc") + "/")
                },
                subtitles: [],
                isEmbed: false
            });
        }

        // 2. Không tìm thấy link trực tiếp -> trả về URL embed gốc để app core xử lý
        // App core sẽ tải iframe, chạy JS, và trích xuất link .m3u8 từ player
        if (cleanFallback) {
            var embedHost = PluginUtils.getHostName(cleanFallback) || "mycloudz.cc";
            return JSON.stringify({
                url: cleanFallback,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
                    "Referer": "https://javhdz.today/"
                },
                subtitles: [],
                isEmbed: true,
                embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
            });
        }
    } catch (e) {}

    // Fallback cuối cùng
    return JSON.stringify({
        url: fallbackUrl || "",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
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
