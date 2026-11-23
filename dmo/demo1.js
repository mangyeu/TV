
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
// PARSERS
// =============================================================================

var PluginUtils = {
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
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

            // Extract labels
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

    // Parse pagination: links are path-based like /recent/2/, /recent/11640/
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
        // Find current page from active li
        var activeMatch = pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<a[^>]*>(\d+)<\/a>/i)
            || pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<span[^>]*>(\d+)<\/span>/i);
        if (activeMatch) {
            currentPage = parseInt(activeMatch[1]) || 1;
        }

        // Find all page numbers from links: href="/slug/N/" hoặc ?page=N
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

    // Fallback: try ?page=N format
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

function parseMovieHtml(html) {
    if (!html || typeof html !== "string") {
        return null;
    }

    var doc = new DOMParser().parseFromString(html, "text/html");

    // Helper lấy text an toàn
    function getText(selector) {
        var el = doc.querySelector(selector);
        return el ? el.textContent.trim() : "";
    }

    // Helper lấy attribute an toàn
    function getAttr(selector, attr) {
        var el = doc.querySelector(selector);
        return el ? (el.getAttribute(attr) || "") : "";
    }

    // =========================
    // TITLE
    // =========================
    var title =
        getText("h1") ||
        getText("title") ||
        getAttr('meta[property="og:title"]', "content") ||
        "Unknown";

    // =========================
    // POSTER
    // =========================
    var thumb =
        getAttr('meta[property="og:image"]', "content") ||
        getAttr('meta[name="twitter:image"]', "content");

    // Lấy poster từ background-image
    if (!thumb) {
        var posterElement = doc.querySelector("#player-poster");

        if (posterElement) {
            var style = posterElement.getAttribute("style") || "";

            var match = style.match(
                /background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i
            );

            if (match) {
                thumb = match[1];
            }
        }
    }

    // =========================
    // STATUS / LABEL
    // =========================
    var status = "";

    var labelElement = doc.querySelector(".label, .movie-label, .status");

    if (labelElement) {
        status = labelElement.textContent.trim();
    }
function parseMovieDetail(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");

    // Helpers
    const text = (selector) =>
        doc.querySelector(selector)?.textContent?.trim() || "";

    const attr = (selector, attribute) =>
        doc.querySelector(selector)?.getAttribute(attribute) || "";

    const cleanText = (value) =>
        (value || "")
            .replace(/\s+/g, " ")
            .trim();

    // --------------------------------
    // TITLE
    // --------------------------------

    const title =
        text(".movie-title") ||
        text("h1") ||
        text("h2") ||
        text("title");

    // --------------------------------
    // DESCRIPTION
    // --------------------------------

    const description =
        text(".description") ||
        text(".movie-description") ||
        text(".detail-description") ||
        text(".content-description");

    // --------------------------------
    // THUMBNAIL
    // --------------------------------

    const thumbnail =
        attr(".movie-poster img", "src") ||
        attr(".poster img", "src") ||
        attr("meta[property='og:image']", "content") ||
        attr("video", "poster") ||
        attr("img", "src");

    // --------------------------------
    // VIDEO / TRAILER
    // --------------------------------

    const video = doc.querySelector("video");

    const trailerSources = video
        ? [...video.querySelectorAll("source")].map(source => ({
            type: source.getAttribute("type") || "",
            label: source.getAttribute("label") || "",
            resolution: source.getAttribute("res") || "",
            url: source.getAttribute("src") || ""
        }))
        : [];

    const trailer = video
        ? {
            id: video.id || null,
            poster: video.getAttribute("poster") || null,
            controls: video.hasAttribute("controls"),
            preload: video.getAttribute("preload") || null,
            sources: trailerSources
        }
        : null;

    // --------------------------------
    // SERVER BUTTONS
    // --------------------------------

    const serverSelectors = [
        ".button_choice_server",
        ".server-item",
        ".server-button",
        ".server-option",
        "[data-embed]",
        "[data-embeds]"
    ].join(",");

    const serverElements = [
        ...doc.querySelectorAll(serverSelectors)
    ];

    // Avoid duplicate elements matched by multiple selectors
    const uniqueServerElements = [...new Set(serverElements)];

    const servers = uniqueServerElements.map((element, index) => {
        const name = cleanText(
            element.getAttribute("data-name") ||
            element.getAttribute("title") ||
            element.textContent
        );

        const hasSingleEmbed =
            element.hasAttribute("data-embed");

        const hasMultipleEmbeds =
            element.hasAttribute("data-embeds");

        let type = "unknown";

        if (hasMultipleEmbeds) {
            type = "multi";
        } else if (hasSingleEmbed) {
            type = "single";
        }

        return {
            id: index,
            name: name || `Server ${index + 1}`,
            type,

            player: element.getAttribute("data-player"),

            active:
                element.classList.contains("active") ||
                element.classList.contains("selected"),

            disabled:
                element.classList.contains("disabled") ||
                element.hasAttribute("disabled"),

            attributes: {
                hasEmbed: hasSingleEmbed,
                hasEmbeds: hasMultipleEmbeds
            }
        };
    });

    // --------------------------------
    // CATEGORIES
    // --------------------------------

    const categories = [
        ...doc.querySelectorAll(
            ".category a, .categories a, .genre a"
        )
    ]
        .map(element => cleanText(element.textContent))
        .filter(Boolean);

    // --------------------------------
    // TAGS
    // --------------------------------

    const tags = [
        ...doc.querySelectorAll(".tag a, .tags a")
    ]
        .map(element => cleanText(element.textContent))
        .filter(Boolean);

    // --------------------------------
    // STATUS
    // --------------------------------

    const status =
        text(".movie-status") ||
        text(".status") ||
        null;

    // --------------------------------
    // OUTPUT
    // --------------------------------

    return {
        title,
        description,
        thumbnail,

        trailer,

        servers,

        categories,
        tags,

        status,

        metadata: {
            pageTitle: doc.title || "",
            serverCount: servers.length,
            trailerAvailable: trailer !== null
        }
    };
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
    // If the streaming link is doodstream or streamwish, the app core might handle it
    // Or if `parseDetailResponse` marked `isEmbed = true`, App's engine intercepts it.
    // If we need to extract raw mp4/m3u8 from the iframe body, add logic here.
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
