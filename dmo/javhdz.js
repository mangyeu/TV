// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.1",
        "baseUrl": "https://javhdz.today",
        "iconUrl": "https://javhdz.today/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "layoutType": "VERTICAL",
        "playerType": "embed"
    });
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

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'recent' },
        { name: 'Không Che', slug: 'uncensored-jav' },
        { name: 'Khử Che', slug: 'reducing-mosaic' },
        { name: 'Vietsub', slug: 'jav-sub' },
        { name: 'Nghiệp Dư', slug: 'amateur' }
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
// NHÓM 2: SINH URL (App gọi hàm → nhận URL → tự fetch HTTP)
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

// Trả về danh sách kiểu tìm kiếm để giao diện app có thể hiển thị
// Videos / Photos / Pornstars / Users.
function getSearchTypes() {
    return JSON.stringify([
        { name: "Videos", value: "video", icon: "video-camera" },
        { name: "Photos", value: "photo", icon: "image" },
        { name: "Pornstars", value: "pornstar", icon: "user" },
        { name: "Users", value: "users", icon: "users" }
    ]);
}

// Tạo URL tìm kiếm theo loại được chọn.
// filters.searchType (hoặc filters.type) nhận một trong:
// video, photo, pornstar, users.
// Mặc định là pornstar theo form HTML bạn cung cấp.
function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    var searchType = String(
        filters.searchType || filters.search_type || filters.type || "pornstar"
    ).toLowerCase();

    // Chuẩn hóa một số tên thường gặp từ giao diện.
    if (searchType === "videos") searchType = "video";
    if (searchType === "photos") searchType = "photo";
    if (searchType === "user" || searchType === "community") searchType = "users";

    // Các đường dẫn theo cấu trúc /search/{type}/ của website.
    var searchPaths = {
        video: "video",
        photo: "photo",
        pornstar: "pornstar",
        users: "users"
    };

    if (!searchPaths[searchType]) {
        searchType = "pornstar";
    }

    var url = "https://javhdz.today/search/" +
        searchPaths[searchType] +
        "/?s=" + encodeURIComponent(keyword || "") +
        "&ajax=1";

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
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// NHÓM 3: PARSER (App fetch URL xong → ném HTML/JSON thô vào đây → bạn parse)
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
    }
};

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
    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }
}

// Parser tìm kiếm.
// Videos giữ nguyên parser cũ để không ảnh hưởng dữ liệu phim.
// Với Photos / Pornstars / Users, parser đọc các thẻ liên kết và ảnh phổ biến
// rồi chuẩn hóa về cấu trúc item mà app đang sử dụng.
function parseSearchResponse(html, searchType) {
    var type = String(searchType || "video").toLowerCase();

    if (type === "video" || type === "videos" || !searchType) {
        return parseListResponse(html);
    }

    try {
        var responseHtml = html || "";
        var paginationHtml = "";

        // Một số endpoint AJAX trả JSON dạng { html, pagination }.
        if (responseHtml.trim().charAt(0) === "{") {
            try {
                var data = JSON.parse(responseHtml);
                if (data && data.html) {
                    responseHtml = data.html;
                    paginationHtml = data.pagination || "";
                }
            } catch (e) {
                // Nếu không phải JSON hợp lệ, tiếp tục parse HTML gốc.
            }
        }

        var items = [];
        var seen = {};
        var anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = anchorRegex.exec(responseHtml)) !== null) {
            var attrs = match[1] || "";
            var inner = match[2] || "";
            var hrefMatch = attrs.match(/\bhref=["']([^"']+)["']/i);
            if (!hrefMatch) continue;

            var href = hrefMatch[1];
            if (!href || href.charAt(0) === "#") continue;

            var imgMatch = inner.match(/<img\b([^>]*)>/i);
            var imgAttrs = imgMatch ? imgMatch[1] : "";
            var srcMatch = imgAttrs.match(/\b(?:data-src|data-original|src)=["']([^"']+)["']/i);
            var titleMatch = attrs.match(/\btitle=["']([^"']*)["']/i);
            var altMatch = imgAttrs.match(/\balt=["']([^"']*)["']/i);

            var title = titleMatch ? titleMatch[1] :
                (altMatch ? altMatch[1] : PluginUtils.cleanText(inner));

            title = PluginUtils.cleanText(title);
            if (!title && !srcMatch) continue;

            // Bỏ qua các link điều hướng không phải kết quả.
            if (/^(javascript:|mailto:)/i.test(href)) continue;

            var id = href;
            if (id.indexOf("http") !== 0 && id.charAt(0) !== "/") {
                id = "/" + id;
            }

            if (seen[id]) continue;
            seen[id] = true;

            var imageUrl = srcMatch ? srcMatch[1] : "";
            items.push({
                id: id,
                title: title || "Không có tiêu đề",
                posterUrl: imageUrl,
                backdropUrl: imageUrl,
                year: 0,
                quality: "",
                episode_current: "",
                lang: "",
                itemType: type
            });
        }

        var totalPages = 1;
        var currentPage = 1;
        var paginationSrc = paginationHtml || responseHtml;
        var activeMatch = paginationSrc.match(
            /<li[^>]*class=["'][^"']*active[^"']*["'][^>]*>\s*<a[^>]*>(\d+)<\/a>/i
        ) || paginationSrc.match(
            /<li[^>]*class=["'][^"']*active[^"']*["'][^>]*>\s*<span[^>]*>(\d+)<\/span>/i
        );

        if (activeMatch) currentPage = parseInt(activeMatch[1], 10) || 1;

        var pageMatches = paginationSrc.match(/(?:[?&]page=|\/page\/)(\d+)/gi);
        if (pageMatches) {
            for (var i = 0; i < pageMatches.length; i++) {
                var numberMatch = pageMatches[i].match(/(\d+)/);
                if (numberMatch) {
                    var pageNumber = parseInt(numberMatch[1], 10);
                    if (pageNumber > totalPages) totalPages = pageNumber;
                }
            }
        }

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: items.length,
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

function parseMovieDetail(html) {
    try {
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        var descMatch = html.match(/<p[^>]*class=["']description["'][^>]*>([\s\S]*?)<\/p>/);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        var servers = [];

        var serverRegex = /<button[^>]*class=["'][^"']*button_choice_server[^"']*["'][^>]*data-embed=["']([^"']+)["'][^>]*data-name=["']([^"']+)["']/gi;
        var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var serverMatch;
        var foundServer = false;

        while ((serverMatch = serverRegex.exec(html)) !== null) {
            var b64url = serverMatch[1];
            var serverName = serverMatch[2];
            var decodedUrl = "";
            try {
                if (typeof atob === 'function') {
                    decodedUrl = atob(b64url);
                } else {
                    var str = String(b64url).replace(/[=]+$/, '');
                    if (str.length % 4 !== 1) {
                        for (var bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? decodedUrl += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
                            buffer = b64chars.indexOf(buffer);
                        }
                    }
                }
            } catch (e) { }

            if (decodedUrl) {
                foundServer = true;
                servers.push({
                    name: serverName,
                    episodes: [{
                        id: decodedUrl,
                        name: "Full",
                        slug: "full"
                    }]
                });
            }
        }

        if (!foundServer) {
            var mainPlayerStr = 'id="main-player"';
            var idxMain = html.indexOf(mainPlayerStr);
            if (idxMain !== -1) {
                var srcStr = 'src="';
                var idxSrc = html.indexOf(srcStr, idxMain);
                if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                    var startUrl = idxSrc + srcStr.length;
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
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "Full";

        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["']fa fa-th-list["'][^>]*><\/i>([^<]+)<\/a>/g;
        var categoriesArr = [];
        var catMatch;
        while ((catMatch = categoryRegex.exec(html)) !== null) {
            categoriesArr.push(PluginUtils.cleanText(catMatch[2]));
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
            duration: "",
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

function parseDetailResponse(html, sourceUrl) {
    try {
        var hostUrl = sourceUrl || "";

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
            isEmbed: Boolean(hostUrl)
        });
    } catch (e) {
        return JSON.stringify({
            url: sourceUrl || "",
            headers: {},
            subtitles: []
        });
    }
}

function parseEmbedResponse(html, sourceUrl) {
    try {
        var streamMatch = html && html.match(/['"](https?:\/\/[^\s'"]+\.m3u8[^\s'"]*)['"]/i);
        if (streamMatch && streamMatch[1]) {
            return JSON.stringify({
                url: streamMatch[1],
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": sourceUrl || "https://javhdz.today/"
                },
                subtitles: [],
                isEmbed: false,
                mimeType: "application/x-mpegURL"
            });
        }

        return JSON.stringify({
            url: sourceUrl || "",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://javhdz.today/"
            },
            subtitles: [],
            isEmbed: false
        });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false });
    }
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
