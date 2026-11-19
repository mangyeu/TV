function getManifest() {
    return JSON.stringify({
        "id": "vlxx",
        "name": "VLXX",
        "version": "1.0.0",
        "baseUrl": "https://vlxx.net",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/vlxx.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL"
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
    return JSON.stringify({});
}

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://vlxx.net";

    if (slug === '' || slug === 'home') {
        if (page > 1) {
            return baseUrl + "/new/" + page + "/";
        }
        return baseUrl + "/";
    }

    if (page > 1) {
        return baseUrl + "/" + slug + "/" + page + "/";
    }
    return baseUrl + "/" + slug + "/";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://vlxx.net";
    var safeKeyword = encodeURIComponent(keyword.replace(/\s+/g, '-'));
    var url = baseUrl + "/search/" + safeKeyword + "/";
    if (page > 1) {
        url = baseUrl + "/search/" + safeKeyword + "/" + page + "/";
    }
    return url;
}

// getUrlDetail: App gọi với episode.id
// episode.id = canonical URL (có thể kèm #s2 cho server 2)
// Trả về URL as-is (starts with http) → App fetch trang detail
function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("//") === 0) return "https:" + slug;
    if (slug.charAt(0) !== '/') slug = '/' + slug;
    return "https://vlxx.net" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    var items = [];
    var baseUrl = "https://vlxx.net";
    var blocks = html.split('class="video-item"');

    for (var i = 1; i < blocks.length; i++) {
        var block = blocks[i];

        var linkMatch = block.match(/href=["']([^"']+)["']/i);
        var link = linkMatch ? linkMatch[1] : "";
        if (link) {
            if (link.indexOf("//") === 0) {
                link = "https:" + link;
            } else if (link.indexOf("http") !== 0) {
                link = baseUrl + (link.charAt(0) === '/' ? '' : '/') + link;
            }
        }

        var titleMatch = block.match(/title=["']([^"']+)["']/i);
        var title = titleMatch ? titleMatch[1] : "";

        var thumbMatch = block.match(/data-original=["']([^"']+)["']/i);
        if (!thumbMatch) {
            thumbMatch = block.match(/<img[^>]*src=["']([^"']+)["']/i);
        }
        var thumb = thumbMatch ? thumbMatch[1] : "";

        if (thumb) {
            if (thumb.indexOf("data:image") === 0) {
                thumb = "";
            } else if (thumb.indexOf("//") === 0) {
                thumb = "https:" + thumb;
            } else if (thumb.indexOf("http") !== 0) {
                thumb = baseUrl + (thumb.charAt(0) === '/' ? '' : '/') + thumb;
            }
        }

        if (link && title) {
            items.push({
                id: link,
                title: title.replace(/<[^>]+>/g, '').trim(),
                posterUrl: thumb,
                backdropUrl: thumb,
                year: 0
            });
        }
    }

    var currentPage = 1;
    var totalPages = 1;

    var cpMatch = html.match(/<a[^>]*class=["'][^"']*active[^"']*["'][^>]*data-page=["'](\d+)["']/i);
    if (cpMatch) {
        currentPage = parseInt(cpMatch[1], 10);
    }

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
        function cleanText(str) {
            return (str || "").replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        }

        var titleMatch = html.match(/<h1[^>]*class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i)
            || html.match(/<h2[^>]*class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i)
            || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? cleanText(titleMatch[1]) : "";

        var descMatch = html.match(/<div[^>]*class=["'][^"']*video-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        var description = descMatch ? cleanText(descMatch[1]) : "";

        var codeMatch = html.match(/<span[^>]*class=["'][^"']*video-code[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var code = codeMatch ? cleanText(codeMatch[1]) : "";

        if (code && title && title.indexOf("(" + code + ")") !== 0) {
            title = "(" + code + ") " + title;
        }

        var ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var posterUrl = ogImg ? ogImg[1].trim() : "";

        var castsArr = [];
        var castRegex = /<div[^>]*class=["'][^"']*actress-tag[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/gi;
        var castMatch;
        while ((castMatch = castRegex.exec(html)) !== null) {
            var castName = cleanText(castMatch[1]);
            if (castName) castsArr.push(castName);
        }

        var categoriesArr = [];
        var catSectionMatch = html.match(/<div[^>]*class=["'][^"']*category-tag[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        if (catSectionMatch) {
            var catRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi;
            var cmMatch;
            while ((cmMatch = catRegex.exec(catSectionMatch[1])) !== null) {
                var catName = cleanText(cmMatch[1]);
                if (catName) categoriesArr.push(catName);
            }
        }

        var servers = [];
        var seenServers = {};

        var canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
            || html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        var pageUrl = canonicalMatch ? canonicalMatch[1].trim() : "";

        var serverRegex = /onclick=["']server\((\d+)\s*,\s*(\d+)\)["']/gi;
        var srvMatch;
        while ((srvMatch = serverRegex.exec(html)) !== null) {
            var serverId = srvMatch[1];
            if (!seenServers[serverId] && pageUrl) {
                seenServers[serverId] = true;
                servers.push({
                    name: "Server #" + serverId,
                    episodes: [{
                        id: pageUrl + "#s" + serverId,
                        name: "Full",
                        slug: "full-s" + serverId
                    }]
                });
            }
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

function parseEmbedResponse(html, url) {
    try {
        function getRefererFromUrl(targetUrl, fallback) {
            if (!targetUrl) return fallback;
            var originMatch = targetUrl.match(/^(https?:\/\/[^/?#]+)/i);
            return originMatch ? originMatch[1] + "/" : targetUrl;
        }

        var siteReferer = "https://vlxx.net/";
        var embedReferer = getRefererFromUrl(url, "https://play.vlstream.net/");

        // === CASE 1: AJAX JSON response (chứa "player" key) ===
        if (html.indexOf('"player"') !== -1) {
            try {
                var jsonObj = JSON.parse(html);
                if (jsonObj && jsonObj.player) {
                    var playerHtml = String(jsonObj.player);
                    var srcMatch = playerHtml.match(/src=["']([^"']+)["']/i);
                    if (srcMatch && srcMatch[1]) {
                        return JSON.stringify({
                            url: srcMatch[1].trim(),
                            isEmbed: true,
                            headers: {
                                "Referer": siteReferer
                            }
                        });
                    }
                }
            } catch (parseErr) {
                var cleaned = html.replace(/\\\//g, '/');
                var iframeMatch = cleaned.match(/src=(?:\\+)?["'](https?:\/\/[^"'\\\s<>]+)(?:\\+)?["']/i);
                if (iframeMatch && iframeMatch[1]) {
                    return JSON.stringify({
                        url: iframeMatch[1].trim(),
                        isEmbed: true,
                        headers: {
                            "Referer": siteReferer
                        }
                    });
                }
            }
        }

        // === CASE 2: Embed page HTML (JWPlayer with .vl sources) ===
        var normalizedHtml = html.replace(/\\\//g, '/');

        var fileMatch = normalizedHtml.match(/["']?file["']?\s*:\s*["'](https?[^"']+\.vl[^"']*)["']/i);
        if (fileMatch && fileMatch[1]) {
            return JSON.stringify({
                url: fileMatch[1].trim(),
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "Referer": embedReferer
                }
            });
        }

        var sourcesMatch = normalizedHtml.match(/["']?sources["']?\s*:\s*(\[[\s\S]*?\])/i);
        if (sourcesMatch && sourcesMatch[1]) {
            var rawSources = sourcesMatch[1];
            try {
                var sources = JSON.parse(rawSources);
                if (sources && sources.length > 0 && sources[0].file) {
                    return JSON.stringify({
                        url: String(sources[0].file).trim(),
                        isEmbed: false,
                        mimeType: sources[0].type === 'hls' ? 'application/x-mpegURL' : '',
                        headers: {
                            "Referer": embedReferer
                        }
                    });
                }
            } catch (e) {
                var looseFileMatch = rawSources.match(/["']?file["']?\s*:\s*["']([^"']+)["']/i);
                var looseTypeMatch = rawSources.match(/["']?type["']?\s*:\s*["']([^"']+)["']/i);
                if (looseFileMatch && looseFileMatch[1]) {
                    var isHls = looseTypeMatch && looseTypeMatch[1].toLowerCase() === 'hls';
                    return JSON.stringify({
                        url: looseFileMatch[1].trim(),
                        isEmbed: false,
                        mimeType: isHls ? 'application/x-mpegURL' : '',
                        headers: {
                            "Referer": embedReferer
                        }
                    });
                }
            }
        }

        var vlMatch = normalizedHtml.match(/(https?:\/\/[^\s"'<>\\]+\.vl[^\s"'<>\\]*)/i);
        if (vlMatch && vlMatch[1]) {
            return JSON.stringify({
                url: vlMatch[1].trim(),
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "Referer": embedReferer
                }
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}
