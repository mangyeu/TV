// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.5",
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

var BASE_URL = "https://javhdz.today";

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
        if (page > 1) {
            params.push("page=" + page);
        }

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
        if (page > 1) {
            url += "&page=" + page;
        }
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
        .replace(/\s+/g, " ")
        .trim();
}

function decodeBase64(input) {
    var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var decoded = "";
    try {
        if (typeof atob === 'function') {
            return atob(input);
        }
        var str = String(input).replace(/[=]+$/, '');
        if (str.length % 4 === 1) return "";
        for (var bc = 0, bs, buffer, idx = 0; (buffer = str.charAt(idx++)); ) {
            buffer = b64chars.indexOf(buffer);
            if (~buffer) {
                bs = bc % 4 ? bs * 64 + buffer : buffer;
                if (bc++ % 4) {
                    decoded += String.fromCharCode(255 & bs >> (-2 * bc & 6));
                }
            }
        }
    } catch (e) {
        return "";
    }
    return decoded;
}

// =============================================================================
// PARSERS
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
                    if (data.pagination) {
                        paginationHtml = data.pagination;
                    }
                }
            } catch (e) {
                // Fallback to original html
            }
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
            var imgMatch = itemHtml.match(/<img([^>]+)>/);
            if (imgMatch) {
                var imgAttrs = imgMatch[1];
                var srcM = imgAttrs.match(/src=["']([^"']+)["']/);
                var dataSrcM = imgAttrs.match(/data-src=["']([^"']+)["']/);
                thumb = (dataSrcM && dataSrcM[1]) ? dataSrcM[1] : (srcM ? srcM[1] : "");
            }

            if (!slug) continue;
            if (moviesMap[slug]) continue;

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
                title: rawTitle || "Phim không tiêu đề",
                posterUrl: thumb,
                backdropUrl: thumb,
                year: 0,
                quality: "HD",
                episode_current: labelText,
                lang: "Vietsub"
            };
        }

        var movies = [];
        for (var key in moviesMap) {
            if (moviesMap.hasOwnProperty(key)) {
                movies.push(moviesMap[key]);
            }
        }

        // Pagination
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
                currentPage = parseInt(activeMatch[1], 10) || 1;
            }

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

function parseMovieDetail(html) {
    try {
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        var title = titleMatch ? cleanText(titleMatch[1]) : "";

        var descMatch = html.match(/<p[^>]*class=["']description["'][^>]*>([\s\S]*?)<\/p>/);
        var description = descMatch ? cleanText(descMatch[1]) : "";

        var servers = [];
        var serverRegex = /<button[^>]*class=["'][^"']*button_choice_server[^"']*["'][^>]*data-embed=["']([^"']+)["'][^>]*data-name=["']([^"']+)["']/gi;
        var serverMatch;
        var foundServer = false;

        while ((serverMatch = serverRegex.exec(html)) !== null) {
            var decodedUrl = decodeBase64(serverMatch[1]);
            if (decodedUrl) {
                foundServer = true;
                servers.push({
                    name: serverMatch[2],
                    episodes: [{
                        id: decodedUrl,
                        name: "Full",
                        slug: "full"
                    }]
                });
            }
        }

        // Fallback: id="main-player"
        if (!foundServer) {
            var idxMain = html.indexOf('id="main-player"');
            if (idxMain !== -1) {
                var idxSrc = html.indexOf('src="', idxMain);
                if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                    var startUrl = idxSrc + 5;
                    var endUrl = html.indexOf('"', startUrl);
                    if (endUrl !== -1) {
                        var embedUrl = html.substring(startUrl, endUrl);
                        servers.push({
                            name: "Embed Server",
                            episodes: [{
                                id: embedUrl,
                                name: "Full",
                                slug: "full"
                            }]
                        });
                        foundServer = true;
                    }
                }
            }
        }

        // Ultimate fallback
        if (!foundServer) {
            var ultimateMatch = html.match(/src=["'](https?:\/\/[a-z0-9A-Z.-]+\/(v|e|embed)\/[^"']+)["']/i);
            if (ultimateMatch) {
                servers.push({
                    name: "Default Embed",
                    episodes: [{
                        id: ultimateMatch[1],
                        name: "Full",
                        slug: "full"
                    }]
                });
            } else {
                servers.push({
                    name: "Unknown",
                    episodes: [{
                        id: "",
                        name: "Full",
                        slug: "full"
                    }]
                });
            }
        }

        var thumbMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/);
        var thumb = thumbMatch ? thumbMatch[1] : "";

        var codeMatch = html.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var code = codeMatch ? cleanText(codeMatch[1]) : "Full";

        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["']fa fa-th-list["'][^>]*><\/i>([^<]+)<\/a>/g;
        var categoriesArr = [];
        var catMatch;
        while ((catMatch = categoryRegex.exec(html)) !== null) {
            categoriesArr.push(cleanText(catMatch[2]));
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: description,
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: 0,
            rating: 0,
            casts: "",
            director: "",
            country: "",
            category: categoriesArr.join(", "),
            status: code
        });
    } catch (e) {
        return "null";
    }
}

function resolveStreamData(hostUrl, referer) {
    return JSON.stringify({
        url: hostUrl || "",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": referer || (BASE_URL + "/")
        },
        subtitles: [],
        isEmbed: true,
        embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
    });
}

function parseDetailResponse(html, fallbackUrl) {
    try {
        var hostUrl = fallbackUrl || "";

        var idxMain = html.indexOf('id="main-player"');
        if (idxMain !== -1) {
            var idxSrc = html.indexOf('src="', idxMain);
            if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                var startUrl = idxSrc + 5;
                var endUrl = html.indexOf('"', startUrl);
                if (endUrl !== -1) {
                    hostUrl = html.substring(startUrl, endUrl);
                }
            }
        }

        return resolveStreamData(hostUrl, BASE_URL + "/");
    } catch (e) {
        return JSON.stringify({ url: fallbackUrl || "", headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(html, fallbackUrl) {
    return JSON.stringify({
        url: fallbackUrl || "",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASE_URL + "/"
        },
        subtitles: [],
        isEmbed: false
    });
}

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
