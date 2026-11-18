// =============================================================================
// MANIFEST & CONFIG
// =============================================================================

var BASE_URL = "https://vlxx.net";

function getManifest() {
    return JSON.stringify({
        id: "vlxx",
        name: "VLXX Pro",
        version: "1.2.3",
        baseUrl: BASE_URL,
        iconUrl: "https://raw.githubusercontent.com/youngbi/repo/main/plugins/vlxx.ico",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        playerType: "exoplayer",
        layoutType: "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'jav', title: 'Phim JAV', type: 'Horizontal', path: 'category' },
        { slug: 'phim-sex-hay', title: 'Phim Sex Hay', type: 'Horizontal', path: 'category' },
        { slug: 'vietsub', title: 'Phim Sex Vietsub', type: 'Horizontal', path: 'category' },
        { slug: 'khong-che', title: 'Không Che', type: 'Horizontal', path: 'category' },
        { slug: 'home', title: 'Phim Sex Mới', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'JAV', slug: 'jav' },
        { name: 'Phim Sex Hay', slug: 'phim-sex-hay' },
        { name: 'Vietsub', slug: 'vietsub' },
        { name: 'Không Che', slug: 'khong-che' },
        { name: 'Sex Học Sinh', slug: 'hoc-sinh' },
        { name: 'Vụng Trộm', slug: 'vung-trom' },
        { name: 'Phim Cấp 3', slug: 'cap-3' },
        { name: 'Mỹ - Châu Âu', slug: 'chau-au' },
        { name: 'XVIDEOS', slug: 'xvideos' },
        { name: 'XNXX', slug: 'xnxx' },
        { name: 'XXX', slug: 'xxx' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới nhất", value: "moi-nhat" },
            { name: "Xem nhiều", value: "xem-nhieu" }
        ]
    });
}

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    
    if (!slug || slug === 'home') {
        return (page > 1) ? (BASE_URL + "/new/" + page + "/") : (BASE_URL + "/");
    }
    
    return (page > 1) ? (BASE_URL + "/" + slug + "/" + page + "/") : (BASE_URL + "/" + slug + "/");
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var safeKeyword = encodeURIComponent(keyword.trim().replace(/\s+/g, '-'));
    
    return (page > 1) 
        ? (BASE_URL + "/search/" + safeKeyword + "/" + page + "/") 
        : (BASE_URL + "/search/" + safeKeyword + "/");
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    return (slug.charAt(0) === '/') ? (BASE_URL + slug) : (BASE_URL + "/" + slug);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================
function parseListResponse(html) {
    var items = [];
    var blocks = html.split('class="video-item"');

    for (var i = 1; i < blocks.length; i++) {
        var block = blocks[i];

        var linkMatch = block.match(/href=["']([^"']+)["']/i);
        var titleMatch = block.match(/title=["']([^"']+)["']/i);
        var thumbMatch = block.match(/data-original=["']([^"']+)["']/i) || block.match(/<img[^>]*src=["']([^"']+)["']/i);

        var link = linkMatch ? linkMatch[1] : "";
        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "";
        var thumb = thumbMatch ? thumbMatch[1] : "";

        if (thumb && thumb.indexOf("data:image") === 0) thumb = "";

        if (link && title) {
            items.push({
                id: link,
                title: title,
                posterUrl: thumb,
                backdropUrl: thumb,
                year: 0
            });
        }
    }

    var currentPage = 1;
    var totalPages = 1;

    var cpMatch = html.match(/<a[^>]*class=["'][^"']*active[^"']*["'][^>]*data-page=["'](\d+)["']/i);
    if (cpMatch) currentPage = parseInt(cpMatch[1], 10);

    var lpRegex = /<a[^>]*data-page=["'](\d+)["'][^>]*>[0-9]+<\/a>/gi;
    var lpMatch;
    while ((lpMatch = lpRegex.exec(html)) !== null) {
        var pageNum = parseInt(lpMatch[1], 10);
        if (pageNum > totalPages) totalPages = pageNum;
    }
    if (currentPage > totalPages) totalPages = currentPage;

    return JSON.stringify({
        items: items,
        pagination: { 
            currentPage: currentPage, 
            totalPages: totalPages 
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var titleMatch = html.match(/<h1[^>]*page-title[^>]*>([\s\S]*?)<\/h1>/i) ||
                         html.match(/<h2[^>]*page-title[^>]*>([\s\S]*?)<\/h2>/i) ||
                         html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "";

        var descMatch = html.match(/<div[^>]*class=["']video-description["'][^>]*>([\s\S]*?)<\/div>/i);
        var description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : "";

        var codeMatch = html.match(/<span[^>]*class=["']video-code["'][^>]*>([\s\S]*?)<\/span>/i);
        var code = codeMatch ? codeMatch[1].replace(/<[^>]+>/g, '').trim() : "";

        if (code && title) {
            title = "(" + code + ") " + title;
        }

        var ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var posterUrl = ogImg ? ogImg[1] : "";

        var castsArr = [];
        var castRegex = /<div[^>]*class=["']actress-tag["'][^>]*><a[^>]*>([\s\S]*?)<\/a>/gi;
        var castMatch;
        while ((castMatch = castRegex.exec(html)) !== null) {
            castsArr.push(castMatch[1].replace(/<[^>]+>/g, '').trim());
        }

        var categoriesArr = [];
        var catSectionMatch = html.match(/<div[^>]*class=["']category-tag["'][^>]*>([\s\S]*?)<\/div>/i);
        if (catSectionMatch) {
            var catRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi;
            var cmMatch;
            while ((cmMatch = catRegex.exec(catSectionMatch[1])) !== null) {
                categoriesArr.push(cmMatch[1].replace(/<[^>]+>/g, '').trim());
            }
        }

        var canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        var pageUrl = canonicalMatch ? canonicalMatch[1] : "";

        var servers = [];
        var serverRegex = /onclick=["']server\((\d+),\s*(\d+)\)["']/gi;
        var srvMatch;
        var addedServers = {};

        while ((srvMatch = serverRegex.exec(html)) !== null) {
            var serverId = srvMatch[1];
            if (!addedServers[serverId]) {
                addedServers[serverId] = true;
                servers.push({
                    name: "Server VIP #" + serverId + " (Tối ưu)",
                    episodes: [{
                        id: pageUrl + "#s" + serverId,
                        name: "Full HD",
                        slug: "full-s" + serverId
                    }]
                });
            }
        }

        if (!addedServers["2"] && pageUrl) {
            servers.push({
                name: "Server Dự Phòng #2",
                episodes: [{
                    id: pageUrl + "#s2",
                    name: "Full HD",
                    slug: "full-s2"
                }]
            });
        }

        if (servers.length === 0 && pageUrl) {
            servers.push({
                name: "Server #1",
                episodes: [{
                    id: pageUrl + "#s1",
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
            year: 0,
            rating: 0,
            casts: castsArr.join(", "),
            director: "",
            country: "",
            category: categoriesArr.join(", "),
            status: code || "Full"
        });

    } catch (e) {
        return "null";
    }
}

// =============================================================================
// STREAM RESOLUTION & PERFORMANCE OPTIMIZATION
// =============================================================================

function parseListResponse(html) {
    var items = [];
    
    // Sử dụng Regex linh hoạt tìm các khối video bất kể tên class có thay đổi nhẹ
    var blocks = html.split('class="video-item"');
    if (blocks.length <= 1) {
        // Fallback dự phòng nếu web đổi class thành 'item' hoặc 'box'
        blocks = html.split('class="item"');
    }
    if (blocks.length <= 1) {
        blocks = html.split('<article');
    }

    for (var i = 1; i < blocks.length; i++) {
        var block = blocks[i];

        var linkMatch = block.match(/href=["']([^"']+)["']/i);
        var titleMatch = block.match(/title=["']([^"']+)["']/i) || block.match(/alt=["']([^"']+)["']/i) || block.match(/<h\d[^>]*>([\s\S]*?)<\/h\d>/i);
        
        // Mở rộng tìm kiếm ảnh: ưu tiên data-original, data-src, đến src thông thường
        var thumbMatch = block.match(/data-original=["']([^"']+)["']/i) || 
                         block.match(/data-src=["']([^"']+)["']/i) || 
                         block.match(/<img[^>]*src=["']([^"']+)["']/i);

        var link = linkMatch ? linkMatch[1] : "";
        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "";
        var thumb = thumbMatch ? thumbMatch[1] : "";

        if (thumb && (thumb.indexOf("data:image") === 0 || thumb.indexOf("pixel") !== -1)) {
            thumb = "";
        }

        if (link && title) {
            items.push({
                id: link,
                title: title,
                posterUrl: thumb,
                backdropUrl: thumb,
                year: 0
            });
        }
    }

    var currentPage = 1;
    var totalPages = 1;

    var cpMatch = html.match(/<a[^>]*class=["'][^"']*active[^"']*["'][^>]*data-page=["'](\d+)["']/i) ||
                  html.match(/<span[^>]*class=["'][^"']*current[^"']*["'][^>]*>(\d+)<\/span>/i);
    if (cpMatch) currentPage = parseInt(cpMatch[1], 10);

    var lpRegex = /data-page=["'](\d+)["']/gi;
    var lpMatch;
    while ((lpMatch = lpRegex.exec(html)) !== null) {
        var pageNum = parseInt(lpMatch[1], 10);
        if (pageNum > totalPages) totalPages = pageNum;
    }
    if (currentPage > totalPages) totalPages = currentPage;

    return JSON.stringify({
        items: items,
        pagination: { 
            currentPage: currentPage, 
            totalPages: totalPages 
        }
    });
}

function parseEmbedResponse(html, url) {
    var emptyResult = JSON.stringify({ url: "", isEmbed: false, headers: {} });
    try {
        if (html.indexOf('"player"') !== -1) {
            try {
                var jsonObj = JSON.parse(html);
                if (jsonObj && jsonObj.player) {
                    var srcMatch = jsonObj.player.match(/src=["']([^"']+)["']/i);
                    if (srcMatch) {
                        return JSON.stringify({
                            url: srcMatch[1],
                            isEmbed: true,
                            headers: { 
                                "Referer": BASE_URL + "/",
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                            }
                        });
                    }
                }
            } catch (parseErr) {
                var cleaned = html.replace(/\\\//g, '/');
                var iframeMatch = cleaned.match(/src=(?:\\\\)?["'](https?:\/\/[^"'\\]+)(?:\\\\)?["']/i);
                if (iframeMatch) {
                    return JSON.stringify({
                        url: iframeMatch[1],
                        isEmbed: true,
                        headers: { 
                            "Referer": BASE_URL + "/",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                        }
                    });
                }
            }
        }

        var fileMatch = html.match(/"file"\s*:\s*"(https?[^"]+\.vl[^"]*)"/i);
        if (fileMatch) {
            return JSON.stringify({
                url: fileMatch[1],
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: { 
                    "Referer": "https://play.vlstream.net/",
                    "Origin": "https://play.vlstream.net"
                }
            });
        }

        var sourcesMatch = html.match(/sources\s*:\s*(\[[^\]]+\])/i);
        if (sourcesMatch) {
            try {
                var sources = JSON.parse(sourcesMatch[1]);
                if (sources && sources.length > 0 && sources[0].file) {
                    return JSON.stringify({
                        url: sources[0].file,
                        isEmbed: false,
                        mimeType: "application/x-mpegURL",
                        headers: { 
                            "Referer": "https://play.vlstream.net/",
                            "Origin": "https://play.vlstream.net"
                        }
                    });
                }
            } catch (e) {
                var regexFile = sourcesMatch[1].match(/"file"\s*:\s*"([^"]+)"/i);
                if (regexFile) {
                    return JSON.stringify({
                        url: regexFile[1],
                        isEmbed: false,
                        mimeType: "application/x-mpegURL",
                        headers: { 
                            "Referer": "https://play.vlstream.net/",
                            "Origin": "https://play.vlstream.net"
                        }
                    });
                }
            }
        }

        var streamMatch = html.match(/(https?:\/\/[^\s"'\\]+\.(?:vl|m3u8)[^\s"'\\]*)/i);
        if (streamMatch) {
            return JSON.stringify({
                url: streamMatch[1],
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: { 
                    "Referer": "https://play.vlstream.net/",
                    "Origin": "https://play.vlstream.net"
                }
            });
        }

        return emptyResult;
    } catch (e) {
        return emptyResult;
    }
}
