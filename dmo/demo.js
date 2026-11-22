// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javhdz.today";

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.1.0",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embedtoexoplay",
        "supportsDetail": true,
        "supportsMultipleServers": true
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
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
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
            finalUrl = BASE_URL + "/" + filters.category + "/" + sortPath;
        } else if (!slug || slug === 'recent') {
            finalUrl = BASE_URL + "/recent/";
        } else if (slug.indexOf("http") === 0) {
            finalUrl = slug.replace(/\/+$/, '') + '/';
        } else {
            if (slug.indexOf("/") === 0) {
                slug = slug.replace(/^\/+/, '').replace(/\/+$/, '');
            }
            finalUrl = BASE_URL + "/" + slug + "/" + sortPath;
        }

        var params = [];
        params.push(isBrowse ? "ajax=browse_videos" : "ajax=1");
        if (page > 1) params.push("page=" + page);

        var separator = (finalUrl.indexOf('?') !== -1) ? '&' : '?';
        return finalUrl + separator + params.join('&');
    } catch (e) {
        return BASE_URL + "/recent/?ajax=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page, 10) || 1;
        var url = BASE_URL + "/search/video/?s=" + encodeURIComponent(keyword || "") + "&ajax=1";
        if (page > 1) url += "&page=" + page;
        return url;
    } catch (e) {
        return BASE_URL + "/search/video/?s=" + encodeURIComponent(keyword || "") + "&ajax=1";
    }
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return BASE_URL + slug;
    return BASE_URL + "/" + slug;
}

function getUrlCategories() { return BASE_URL + "/categories/"; }
function getUrlCountries() { return BASE_URL + "/"; }
function getUrlYears() { return BASE_URL + "/"; }

// =============================================================================
// HELPERS
// =============================================================================

function cleanText(text) {
    if (!text) return "";
    return String(text)
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function decodeBase64(input) {
    var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var decoded = "";
    try {
        if (typeof atob === 'function') return atob(input);
        var str = String(input).replace(/[=]+$/, '');
        if (str.length % 4 === 1) return "";
        for (var bc = 0, bs, buffer, idx = 0; (buffer = str.charAt(idx++)); ) {
            buffer = b64chars.indexOf(buffer);
            if (~buffer) {
                bs = bc % 4 ? bs * 64 + buffer : buffer;
                if (bc++ % 4) decoded += String.fromCharCode(255 & bs >> (-2 * bc & 6));
            }
        }
    } catch (e) {
        return "";
    }
    return decoded;
}

function detectHost(url) {
    var u = String(url || "").toLowerCase();
    if (u.indexOf("dood") !== -1 || u.indexOf("ds2play") !== -1 || u.indexOf("d000d") !== -1) return "dood";
    if (u.indexOf("streamwish") !== -1 || u.indexOf("swish") !== -1 || u.indexOf("wishembed") !== -1) return "streamwish";
    if (u.indexOf("mixdrop") !== -1) return "mixdrop";
    if (u.indexOf("streamtape") !== -1) return "streamtape";
    if (u.indexOf("filemoon") !== -1 || u.indexOf("moonfile") !== -1) return "filemoon";
    if (u.indexOf("voe") !== -1) return "voe";
    if (u.indexOf("ok.ru") !== -1 || u.indexOf("okru") !== -1) return "okru";
    if (u.indexOf(".m3u8") !== -1 || u.indexOf(".mp4") !== -1) return "direct";
    return "unknown";
}

function buildHeaders(referer) {
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": referer || (BASE_URL + "/"),
        "Origin": referer ? referer.replace(/\/$/, "") : BASE_URL
    };
}

// =============================================================================
// LIST / SEARCH PARSERS
// =============================================================================

function parseListResponse(html) {
    try {
        var responseHtml = html || "";
        var paginationHtml = "";

        if (responseHtml.trim().indexOf('{') === 0) {
            try {
                var data = JSON.parse(responseHtml);
                if (data && data.html) {
                    responseHtml = data.html;
                    if (data.pagination) paginationHtml = data.pagination;
                }
            } catch (e) { /* fallback */ }
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
            if (!slug || moviesMap[slug]) continue;

            var thumb = "";
            var imgMatch = itemHtml.match(/<img([^>]+)>/);
            if (imgMatch) {
                var imgAttrs = imgMatch[1];
                var srcM = imgAttrs.match(/src=["']([^"']+)["']/);
                var dataSrcM = imgAttrs.match(/data-src=["']([^"']+)["']/);
                thumb = (dataSrcM && dataSrcM[1]) ? dataSrcM[1] : (srcM ? srcM[1] : "");
            }

            var rawTitle = cleanText(title);

            var durationMatch = itemHtml.match(/<span[^>]*class=["']video-overlay badge transparent["'][^>]*>([\s\S]*?)<\/span>/);
            var duration = durationMatch ? cleanText(durationMatch[1]) : "";

            var codeMatch = itemHtml.match(/<span[^>]*class=["']video-overlay1 badge transparent["'][^>]*>([\s\S]*?)<\/span>/);
            var code = codeMatch ? cleanText(codeMatch[1]) : "";

            var labels = [];
            if (duration) labels.push(duration);
            if (code) labels.push(code);
            var labelText = labels.join(" | ") || "HD";

            moviesMap[slug] = {
                id: slug,
                title: rawTitle || "Video không tiêu đề",
                posterUrl: thumb,
                backdropUrl: thumb,
                year: 0,
                quality: "HD",
                episode_current: labelText,
                lang: "Vietsub",
                category: code || "",
                country: "Japan",
                duration: duration,
                rating: 0
            };
        }

        var movies = [];
        for (var key in moviesMap) {
            if (moviesMap.hasOwnProperty(key)) movies.push(moviesMap[key]);
        }

        // ---- Pagination ----
        var totalPages = 1;
        var currentPage = 1;
        var paginationSrc = paginationHtml || responseHtml;

        var pagNav = "";
        var paginationBlock = paginationSrc.match(/<ul[^>]*class="[^"]*pagination[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
        if (paginationBlock) pagNav = paginationBlock[1];
        else if (paginationHtml) pagNav = paginationHtml;

        if (pagNav) {
            var activeMatch = pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<a[^>]*>(\d+)<\/a>/i)
                || pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<span[^>]*>(\d+)<\/span>/i);
            if (activeMatch) currentPage = parseInt(activeMatch[1], 10) || 1;

            var pageLinks = pagNav.match(/href="[^"]*\/(\d+)\/?[^"]*"/g);
            if (pageLinks) {
                for (var j = 0; j < pageLinks.length; j++) {
                    var pMatch = pageLinks[j].match(/\/(\d+)\/?"/);
                    if (pMatch) {
                        var p = parseInt(pMatch[1], 10);
                        if (p > totalPages) totalPages = p;
                    }
                }
            }

            var queryPageLinks = pagNav.match(/href="[^"]*(?:[?&]|&amp;)page=(\d+)[^"]*"/g);
            if (queryPageLinks) {
                for (var k = 0; k < queryPageLinks.length; k++) {
                    var qpMatch = queryPageLinks[k].match(/(?:[?&]|&amp;)page=(\d+)/);
                    if (qpMatch) {
                        var qp = parseInt(qpMatch[1], 10);
                        if (qp > totalPages) totalPages = qp;
                    }
                }
            }
        }

        if (totalPages <= 1) {
            var queryPages = paginationSrc.match(/(?:[?&]|&amp;)page=(\d+)/g);
            if (queryPages) {
                for (var q = 0; q < queryPages.length; q++) {
                    var m = queryPages[q].match(/page=(\d+)/) || queryPages[q].match(/(\d+)/);
                    if (m) {
                        var n = parseInt(m[1], 10);
                        if (n > totalPages) totalPages = n;
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
    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 }
        });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// =============================================================================
// DETAIL PARSER (full metadata)
// =============================================================================

function parseMovieDetail(html) {
    try {
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        var title = titleMatch ? cleanText(titleMatch[1]) : "";

        var originName = "";
        var originMatch = html.match(/<h2[^>]*class=["'][^"']*(?:video-title|sub-title|origin)[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i)
            || html.match(/<p[^>]*class=["'][^"']*sub-title[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
        if (originMatch) originName = cleanText(originMatch[1]);

        var descMatch = html.match(/<p[^>]*class=["']description["'][^>]*>([\s\S]*?)<\/p>/);
        var description = descMatch ? cleanText(descMatch[1]) : "";

        // ---- Servers ----
        var servers = [];
        var serverRegex = /<button[^>]*class=["'][^"']*button_choice_server[^"']*["'][^>]*data-embed=["']([^"']+)["'][^>]*data-name=["']([^"']+)["']/gi;
        var serverMatch;
        var foundServer = false;

        while ((serverMatch = serverRegex.exec(html)) !== null) {
            var decodedUrl = decodeBase64(serverMatch[1]).trim();
            var serverName = cleanText(serverMatch[2]);
            if (!decodedUrl) continue;
            if (!/^https?:\/\//i.test(decodedUrl)) continue;
            if (/^https?:\/\/(javhdz\.today|localhost)/i.test(decodedUrl)) continue;

            foundServer = true;
            servers.push({
                name: serverName || ("Server " + servers.length),
                episodes: [{ id: decodedUrl, name: "Full", slug: "full" }]
            });
        }

        if (!foundServer) {
            var idxMain = html.indexOf('id="main-player"');
            if (idxMain !== -1) {
                var idxSrc = html.indexOf('src="', idxMain);
                if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                    var startUrl = idxSrc + 5;
                    var endUrl = html.indexOf('"', startUrl);
                    if (endUrl !== -1) {
                        servers.push({
                            name: "Embed Server",
                            episodes: [{ id: html.substring(startUrl, endUrl), name: "Full", slug: "full" }]
                        });
                        foundServer = true;
                    }
                }
            }
        }

        if (!foundServer) {
            var ultimateMatch = html.match(/src=["'](https?:\/\/[a-z0-9A-Z.-]+\/(v|e|embed)\/[^"']+)["']/i);
            servers.push({
                name: ultimateMatch ? "Default Embed" : "Unknown",
                episodes: [{ id: ultimateMatch ? ultimateMatch[1] : "", name: "Full", slug: "full" }]
            });
        }

        // ---- Poster ----
        var thumbMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/);
        var thumb = thumbMatch ? thumbMatch[1] : "";

        // ---- Code / Label ----
        var codeMatch = html.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var code = codeMatch ? cleanText(codeMatch[1]) : "Full";

        // ---- Categories ----
        var categoriesArr = [];
        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["']fa fa-th-list["'][^>]*><\/i>([^<]+)<\/a>/g;
        var catMatch;
        while ((catMatch = categoryRegex.exec(html)) !== null) {
            var cName = cleanText(catMatch[2]);
            if (cName && categoriesArr.indexOf(cName) === -1) categoriesArr.push(cName);
        }

        // ---- Actresses ----
        var actressesArr = [];
        var actressRegex = /<a[^>]*href=["']\/(?:actress|idol|star|pornstar)\/[^"']*["'][^>]*>([^<]+)<\/a>/gi;
        var aM;
        while ((aM = actressRegex.exec(html)) !== null) {
            var aName = cleanText(aM[1]);
            if (aName && actressesArr.indexOf(aName) === -1) actressesArr.push(aName);
        }

        // ---- Studio / Maker ----
        var studioArr = [];
        var studioRegex = /<a[^>]*href=["']\/(?:studio|maker|label|channel)\/[^"']*["'][^>]*>([^<]+)<\/a>/gi;
        var sM;
        while ((sM = studioRegex.exec(html)) !== null) {
            var sName = cleanText(sM[1]);
            if (sName && studioArr.indexOf(sName) === -1) studioArr.push(sName);
        }

        // ---- Tags ----
        var tagsArr = [];
        var tagRegex = /<a[^>]*href=["']\/(?:tag|tags)\/[^"']*["'][^>]*>([^<]+)<\/a>/gi;
        var tM;
        while ((tM = tagRegex.exec(html)) !== null) {
            var tName = cleanText(tM[1]);
            if (tName && tagsArr.indexOf(tName) === -1) tagsArr.push(tName);
        }

        // ---- Duration ----
        var duration = "";
        var durMatch = html.match(/(?:Duration|Thời lượng|Runtime)\s*[:<][^0-9]*?(\d{1,2}:\d{2}(?::\d{2})?)/i)
            || html.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s*<\/span>/);
        if (durMatch) duration = durMatch[1];

        // ---- Release date / Year ----
        var year = 0;
        var releaseDate = "";
        var dateMatch = html.match(/(?:Release|Published|Ngày(?: phát hành| đăng)?|Date)\s*[:<][^0-9]*?(\d{4})[-/](\d{1,2})[-/](\d{1,2})/i)
            || html.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (dateMatch) {
            year = parseInt(dateMatch[1], 10) || 0;
            releaseDate = dateMatch[1] + "-" + ("0" + dateMatch[2]).slice(-2) + "-" + ("0" + dateMatch[3]).slice(-2);
        } else {
            var yearOnly = html.match(/(?:Year|Năm)\s*[:<][^0-9]*?(\d{4})/i);
            if (yearOnly) year = parseInt(yearOnly[1], 10) || 0;
        }

        // ---- Rating ----
        var rating = 0;
        var ratingMatch = html.match(/(?:Rating|Đánh giá|IMDb)\s*[:<][^0-9]*?([\d.]+)/i)
            || html.match(/class=["'][^"']*rating[^"']*["'][^>]*>([\d.]+)/i);
        if (ratingMatch) rating = parseFloat(ratingMatch[1]) || 0;

        // ---- Fallback: nhồi info phụ vào description để app nào cũng hiện ----
        var extraInfo = [];
        if (duration) extraInfo.push("⏱ Thời lượng: " + duration);
        if (releaseDate) extraInfo.push("📅 Phát hành: " + releaseDate);
        if (actressesArr.length) extraInfo.push("👤 Diễn viên: " + actressesArr.join(", "));
        if (studioArr.length) extraInfo.push("🏢 Studio: " + studioArr.join(", "));
        if (tagsArr.length) extraInfo.push("🏷 Tags: " + tagsArr.join(", "));
        if (code && code !== "Full") extraInfo.push("🔖 Mã: " + code);

        var finalDescription = description;
        if (extraInfo.length > 0) {
            finalDescription = (description ? description + "\n\n" : "") + extraInfo.join("\n");
        }

        return JSON.stringify({
            id: "",
            title: title,
            originName: originName,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: finalDescription,
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: year,
            rating: rating,
            duration: duration,
            releaseDate: releaseDate,
            casts: actressesArr.join(", "),
            director: studioArr.join(", "),
            country: "Japan",
            category: categoriesArr.join(", "),
            tags: tagsArr.join(", "),
            status: code
        });
    } catch (e) {
        return "null";
    }
}

// =============================================================================
// STREAM RESOLVERS
// =============================================================================

function resolveStreamData(hostUrl, referer) {
    return JSON.stringify({
        url: hostUrl || "",
        headers: buildHeaders(referer || (BASE_URL + "/")),
        subtitles: [],
        isEmbed: true,
        embedRegex: "[\"'](https?:\\/\\/[^\\s\"']+\\.(?:m3u8|mp4)[^\"']*)[\"']"
    });
}

function parseDetailResponse(html, fallbackUrl) {
    try {
        var rawUrl = fallbackUrl || "";

        // Trường hợp input chính là URL embed (app truyền thẳng)
        if (/^https?:\/\//i.test(String(html || "").trim()) && String(html).length < 500) {
            rawUrl = String(html).trim();
        }

        // Ưu tiên extract từ main-player
        if (html && html.indexOf("main-player") !== -1) {
            var idxMain = html.indexOf('id="main-player"');
            var idxSrc = html.indexOf('src="', idxMain);
            if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                var startUrl = idxSrc + 5;
                var endUrl = html.indexOf('"', startUrl);
                if (endUrl !== -1) rawUrl = html.substring(startUrl, endUrl);
            }
        }

        if (!rawUrl) {
            return JSON.stringify({ url: "", headers: {}, subtitles: [], isEmbed: false });
        }

        var host = detectHost(rawUrl);

        // Link trực tiếp m3u8/mp4 → load luôn
        if (host === "direct") {
            return JSON.stringify({
                url: rawUrl,
                headers: buildHeaders(BASE_URL + "/"),
                subtitles: [],
                isEmbed: false
            });
        }

        // Host embed → cần app gọi parseEmbedResponse để resolve
        return resolveStreamData(rawUrl, BASE_URL + "/");
    } catch (e) {
        return JSON.stringify({ url: fallbackUrl || "", headers: {}, subtitles: [], isEmbed: false });
    }
}

function parseEmbedResponse(html, fallbackUrl) {
    try {
        var body = html || "";
        var src = fallbackUrl || "";
        var headers = buildHeaders(src);

        // 1. Tìm m3u8/mp4 trực tiếp trong HTML
        var direct = body.match(/https?:\\?\/\\?\/[^"'\s\\]+\.(?:m3u8|mp4)(?:\?[^"'\s\\]*)?/i);
        if (direct && direct[0]) {
            return JSON.stringify({
                url: direct[0].replace(/\\\//g, "/"),
                headers: headers,
                subtitles: [],
                isEmbed: false
            });
        }

        // 2. Doodstream: pass_md5 → ghép token
        if (body.indexOf("pass_md5") !== -1) {
            var tokenMatch = body.match(/token=([a-z0-9]+)/i);
            var passMatch = body.match(/pass_md5\/([^"'\s]+)/i);
            var hostMatch = src.match(/^(https?:\/\/[^\/]+)/);
            if (tokenMatch && passMatch && hostMatch) {
                var doodUrl = hostMatch[1] + "/pass_md5/" + passMatch[1] + "/" + tokenMatch[1];
                return JSON.stringify({
                    url: doodUrl,
                    headers: buildHeaders(src),
                    subtitles: [],
                    isEmbed: true,
                    embedRegex: "https?:\\/\\/[^\\s\"']+"
                });
            }
        }

        // 3. Streamwish / Filemoon: sources trong JS
        var sourcesMatch = body.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/i)
            || body.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
        if (sourcesMatch && sourcesMatch[1]) {
            return JSON.stringify({
                url: sourcesMatch[1],
                headers: headers,
                subtitles: [],
                isEmbed: false
            });
        }

        // 4. Fallback: trả nguyên url gốc
        return JSON.stringify({
            url: src,
            headers: headers,
            subtitles: [],
            isEmbed: false
        });
    } catch (e) {
        return JSON.stringify({
            url: fallbackUrl || "",
            headers: buildHeaders(BASE_URL + "/"),
            subtitles: [],
            isEmbed: false
        });
    }
}

// =============================================================================
// CATEGORY / COUNTRY / YEAR PARSERS
// =============================================================================

function parseCategoriesResponse(html) {
    try {
        var categories = [];
        var parts = html.split(/<li[^>]*id=["']category-[^"']*["'][^>]*>/);
        for (var i = 1; i < parts.length; i++) {
            var itemHtml = parts[i];
            var linkMatch = itemHtml.match(/href=["']\/([^"']+)[\/]?["']/);
            var nameMatch = itemHtml.match(/<div[^>]*class=["']category-title["'][^>]*>([\s\S]*?)<\/div>/);

            if (linkMatch && nameMatch) {
                var slug = linkMatch[1];
                if (slug.charAt(slug.length - 1) === '/') slug = slug.substring(0, slug.length - 1);
                categories.push({
                    name: cleanText(nameMatch[1]),
                    slug: slug
                });
            }
        }
        return JSON.stringify(categories);
    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
