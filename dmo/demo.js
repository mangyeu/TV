// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.1.2",
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
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/ /g, " ")
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
    extractMediaUrl: function (text) {
        var unescaped = String(text || "")
            .replace(/\\\//g, "/")
            .replace(/\\u0026/g, "&")
            .replace(/&/g, "&");

        var patterns = [
            /(https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*)/i,
            /(https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*)/i,
            /(?:file|source|src|url|hls|stream|link)\s*[:=]\s*["'](https?:\/\/[^"'\s<>]+(?:\.m3u8|\.mp4|playlist|master|stream|dl)[^"'\s<>]*)["']/i
        ];

        for (var i = 0; i < patterns.length; i++) {
            var m = unescaped.match(patterns[i]);
            if (m && m[1]) {
                return m[1].trim();
            }
        }

        var tagMatch = unescaped.match(/<(?:source|video)[^>]+src=["']([^"']+)["']/i);
        if (tagMatch && tagMatch[1]) {
            var srcVal = tagMatch[1].trim();
            if (srcVal.indexOf("//") === 0) srcVal = "https:" + srcVal;
            return srcVal;
        }

        return "";
    },
    extractIframeUrl: function (html) {
        var unescaped = String(html || "")
            .replace(/\\\//g, "/")
            .replace(/&/g, "&");

        var iframeMatch = unescaped.match(/<iframe[^>]+(?:id=["']main-player["'][^>]*src=["']([^"']+)["']|src=["']([^"']+)["'][^>]*id=["']main-player["']|src=["']([^"']+)["'])/i);
        if (iframeMatch) {
            var u = (iframeMatch[1] || iframeMatch[2] || iframeMatch[3] || "").trim();
            if (u.indexOf("//") === 0) u = "https:" + u;
            return u;
        }
        return "";
    },
    buildMycloudzDlUrl: function (html, embedUrl) {
        var safeHtml = String(html || "");
        var cleanEmbed = String(embedUrl || "").trim();
        var host = PluginUtils.getHostName(cleanEmbed) || "mycloudz.cc";
        var schemeMatch = cleanEmbed.match(/^(https?):\/\//i);
        var scheme = schemeMatch ? schemeMatch[1].toLowerCase() : "https";

        var codeMatch = cleanEmbed.match(/\/(?:v|e|embed)\/([a-zA-Z0-9_-]+)/i)
            || safeHtml.match(/file_code\s*[:=]\s*["']([^"']+)["']/i);
        var hashMatch = safeHtml.match(/hash\s*[:=]\s*["']([^"']+)["']/i)
            || safeHtml.match(/([0-9]+-[0-9]+-[a-f0-9]{32})/i);

        var fileCode = codeMatch ? codeMatch[1] : "";
        var hashVal = hashMatch ? hashMatch[1] : "";

        if (!fileCode && !hashVal) return "";

        var query = [
            "op=view",
            "file_code=" + encodeURIComponent(fileCode),
            "hash=" + encodeURIComponent(hashVal),
            "embed=1",
            "referer=" + encodeURIComponent("javhdz.today"),
            "ad=b0",
            "hls=41"
        ];
        return scheme + "://" + host + "/dl?" + query.join("&");
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

        var codeMatch = safeHtml.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i)
            || safeHtml.match(/Code:\s*<[^>]*>([\s\S]*?)<\/[^>]*>/i);
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";

        var durationMatch = safeHtml.match(/(?:Duration|Thời\s*lượng)[^<]*:\s*<[^>]*>([\s\S]*?)<\/[^>]*>/i)
            || safeHtml.match(/<span[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
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
        var mediaUrl = PluginUtils.extractMediaUrl(safeHtml);
        var iframeUrl = PluginUtils.extractIframeUrl(safeHtml);
        var targetUrl = mediaUrl || iframeUrl || (fallbackUrl || "");
        var isEmbed = !mediaUrl;

        var host = PluginUtils.getHostName(targetUrl);
        var referer = host ? ("https://" + host + "/") : "https://javhdz.today/";

        return JSON.stringify({
            url: targetUrl,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
                "Referer": referer,
                "X-Requested-With": "XMLHttpRequest"
            },
            subtitles: [],
            isEmbed: isEmbed,
            embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.(?:m3u8|mp4)[^'\"]*)['\"]"
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

function parseEmbedResponse(html, fallbackUrl) {
    try {
        var safeHtml = String(html || "").trim();
        var cleanFallback = String(fallbackUrl || "").trim();
        var host = PluginUtils.getHostName(cleanFallback) || "mycloudz.cc";
        var referer = cleanFallback || ("https://" + host + "/");

        // Nếu response là JSON từ endpoint /dl
        if (safeHtml.indexOf("{") === 0) {
            try {
                var jsonObj = JSON.parse(safeHtml);
                var jsonStr = JSON.stringify(jsonObj);
                var jsonMedia = PluginUtils.extractMediaUrl(jsonStr)
                    || jsonObj.url || jsonObj.stream || jsonObj.file || jsonObj.link || jsonObj.src || "";
                if (jsonMedia) {
                    return JSON.stringify({
                        url: String(jsonMedia).replace(/\\\//g, "/"),
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
                            "Referer": referer,
                            "X-Requested-With": "XMLHttpRequest"
                        },
                        subtitles: [],
                        isEmbed: false
                    });
                }
            } catch (e) {}
        }

        // Tìm trực tiếp link stream (.m3u8 / .mp4 / video tag)
        var mediaUrl = PluginUtils.extractMediaUrl(safeHtml);
        if (mediaUrl) {
            return JSON.stringify({
                url: mediaUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
                    "Referer": referer,
                    "X-Requested-With": "XMLHttpRequest"
                },
                subtitles: [],
                isEmbed: false
            });
        }

        // Nếu đang ở trang /v/... (hoặc /e/...) và chưa thấy link stream, xây dựng URL /dl đúng tham số
        var dlUrl = PluginUtils.buildMycloudzDlUrl(safeHtml, cleanFallback);
        if (dlUrl && cleanFallback.indexOf("/dl?") === -1) {
            return JSON.stringify({
                url: dlUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
                    "Referer": referer,
                    "X-Requested-With": "XMLHttpRequest"
                },
                subtitles: [],
                isEmbed: true
            });
        }

        // Nếu có iframe con bên trong
        var nestedIframe = PluginUtils.extractIframeUrl(safeHtml);
        if (nestedIframe) {
            return JSON.stringify({
                url: nestedIframe,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
                    "Referer": referer,
                    "X-Requested-With": "XMLHttpRequest"
                },
                subtitles: [],
                isEmbed: true,
                embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.(?:m3u8|mp4)[^'\"]*)['\"]"
            });
        }
    } catch (e) {}

    return JSON.stringify({
        url: fallbackUrl || "",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0",
            "Referer": fallbackUrl || "https://javhdz.today/",
            "X-Requested-With": "XMLHttpRequest"
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
