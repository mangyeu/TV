// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================
BaseURL = "";
BaseJSON = "";

function getManifest() {
    return JSON.stringify({
        "id": "clbpx",
        "name": "CLB Phim Xưa",
        "version": "1.0.6",
        "baseUrl": "https://missav.media",
        "referrer": "https://missav123.com/",
        "iconUrl": "https://raw.githubusercontent.com/mangyeu/TV/refs/heads/main/dmo/nguonc.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "subtitleCat": true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'vi/today-hot', title: 'Hot HÃ´m Nay', type: 'Horizontal', path: '' },
        { slug: 'vi/weekly-hot', title: 'Hot Trong Tuáº§n', type: 'Horizontal', path: '' },
        { slug: 'vi/monthly-hot', title: 'Hot Trong ThÃ¡ng', type: 'Horizontal', path: '' },
        { slug: 'vi/uncensored-leak', title: 'KhÃ´ng Che (RÃ² Rá»‰)', type: 'Horizontal', path: '' },
        { slug: 'vi/release', title: 'Má»›i Cáº­p Nháº­t', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Má»›i cáº­p nháº­t', slug: 'vi/new' },
        { name: 'Ná»¯ diá»…n viÃªn', slug: 'vi/actresses' },
        { name: 'Thá»ƒ loáº¡i', slug: 'vi/genres' },
        { name: 'KhÃ´ng che', slug: 'vi/uncensored-leak' },
        { name: "FC2", slug: "vi/fc2" },
        { name: "HEYZO", slug: "vi/heyzo" },
        { name: "Tokyo Hot", slug: "vi/tokyohot" },
        { name: "1pondo", slug: "vi/1pondo" },
        { name: "Caribbeancom", slug: "vi/caribbeancom" },
        { name: "Caribbeancompr", slug: "vi/caribbeancompr" },
        { name: "10musume", slug: "vi/10musume" },
        { name: "pacopacomama", slug: "vi/pacopacomama" },
        { name: "Gachinco", slug: "vi/gachinco" },
        { name: "XXX-AV", slug: "vi/xxx-av" },
        { name: "MarriedSlash", slug: "vi/marriedslash" },
        { name: "Naughty4610", slug: "vi/naughty4610" },
        { name: "Naughty0930", slug: "vi/naughty0930" }
    ]);
}
function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Má»›i nháº¥t', value: 'new' },
            { name: 'Xem nhiá»u', value: 'views' },
            { name: 'HÃ´m nay', value: 'today_views' },
            { name: 'Tuáº§n nÃ y', value: 'weekly_views' },
            { name: 'ThÃ¡ng nÃ y', value: 'monthly_views' }
        ],
        category: [
            { name: "Táº¥t cáº£ thá»ƒ loáº¡i", value: "vi/genres" },
            { name: "Má»›i cáº­p nháº­t", value: "vi/new" },
            { name: "PhÃ¡t hÃ nh má»›i", value: "vi/release" },
            { name: "KhÃ´ng che (RÃ² rá»‰)", value: "vi/uncensored-leak" },
            { name: "Ná»¯ diá»…n viÃªn", value: "vi/actresses" },
            { name: "BXH Diá»…n viÃªn", value: "vi/actresses/ranking" },
            { name: "NhÃ  sáº£n xuáº¥t", value: "vi/makers" },
            { name: "VR", value: "vi/genres/VR" },
            { name: "Xem nhiá»u hÃ´m nay", value: "vi/today-hot" },
            { name: "Xem nhiá»u tuáº§n", value: "vi/weekly-hot" },
            { name: "Xem nhiá»u thÃ¡ng", value: "vi/monthly-hot" },
            { name: "Phá»¥ Ä‘á» Anh", value: "vi/english-subtitle" },
            { name: "Phá»¥ Ä‘á» China", value: "vi/chinese-subtitle" }, // Mapped from old config, keeping consistency 

            // Amateur
            { name: "SIRO", value: "vi/series/SIRO" },
            { name: "LUXU", value: "vi/series/LUXU" },
            { name: "GANA", value: "vi/series/GANA" },
            { name: "MAAN", value: "vi/series/MAAN" },
            { name: "S-CUTE", value: "vi/series/S-CUTE" },
            { name: "ARA", value: "vi/series/ARA" },

            // Uncensored Brands
            { name: "FC2", value: "vi/series/FC2" },
            { name: "HEYZO", value: "vi/series/HEYZO" },
            { name: "Tokyo Hot", value: "vi/series/Tokyo-Hot" },
            { name: "1pondo", value: "vi/series/1pondo" },
            { name: "Caribbeancom", value: "vi/series/Caribbeancom" },
            { name: "Caribbeancompr", value: "vi/series/Caribbeancompr" },
            { name: "10musume", value: "vi/series/10musume" },
            { name: "pacopacomama", value: "vi/series/pacopacomama" },
            { name: "Gachinco", value: "vi/series/Gachinco" },
            { name: "XXX-AV", value: "vi/series/XXX-AV" },
            { name: "MarriedSlash", value: "vi/series/MarriedSlash" },
            { name: "Naughty4610", value: "vi/series/naughty4610" },
            { name: "Naughty0930", value: "vi/series/naughty0930" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://missav.media";

    // If slug is empty (default), use 'vi/new'
    var path = slug || "vi/new";

    // Ensure path starts with /
    if (path.indexOf("/") !== 0) path = "/" + path;

    // Handle pagination (Slug handling with slash protection)
    var pathStr = path;
    if (pathStr.indexOf("/") === 0) pathStr = pathStr.substring(1);

    var url = baseUrl + "/" + pathStr + "?page=" + page;

    // Append sort parameter if applicable
    if (filters.sort && filters.sort !== 'new' && filters.sort !== 'hot') {
        url += "&sort=" + filters.sort;
    } else if (filters.sort === 'hot') {
        url += "&sort=views";
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return "https://missav.media/vi/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return "https://missav.media" + slug;
    return "https://missav.media/vi/" + slug;
}

function getUrlCategories() { return "https://missav.media/vi/genres"; }
function getUrlCountries() { return ""; } // Not supported
function getUrlYears() { return ""; } // Not supported

// =============================================================================
// PARSERS
// =============================================================================

var PluginUtils = {
    /**
     * Strip prefix missav_media- (hoáº·c báº¥t ká»³ prefix dáº¡ng domain_) khá»i CSS class names.
     * VÃ­ dá»¥: class="missav_media-thumbnail missav_media-group" -> class="thumbnail group"
     * Äiá»u nÃ y Ä‘áº£m báº£o parser hoáº¡t Ä‘á»™ng vá»›i cáº£ HTML cÅ© vÃ  má»›i.
     */
    normalizeHtml: function (html) {
        if (!html) return "";
        // Strip missav_media- prefix trong class attributes
        // Pattern: tÃ¬m class="..." rá»“i strip prefix bÃªn trong
        return html.replace(/class="([^"]*)"/g, function (fullMatch, classValue) {
            var normalized = classValue.replace(/missav_media-/g, '');
            return 'class="' + normalized + '"';
        });
    },
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    },
    getMeta: function (html, property) {
        var regex = new RegExp('property="' + property + '"\\s+content="([^"]+)"', 'i');
        var match = html.match(regex);
        return match ? match[1] : "";
    },
    getMetaList: function (html, property) {
        var regex = new RegExp('property="' + property + '"\\s+content="([^"]+)"', 'gi');
        var results = [];
        var match;
        while ((match = regex.exec(html)) !== null) {
            results.push(match[1]);
        }
        return results;
    },
    /**
     * Tá»‘i Æ°u hÃ³a viá»‡c láº¥y Preview URL báº±ng 3 bÆ°á»›c Strategy tÆ°Æ¡ng tá»± nhÆ° láº¥y link phim
     */
    extractPreviewUrl: function (itemHtml) {
        // Strategy 1: Regex cÆ¡ báº£n tá»« data-src cá»§a tháº» video
        var previewMatch = itemHtml.match(/<video[^>]+data-src="([^"]+)"/);
        var url = previewMatch ? previewMatch[1] : "";
        
        // Strategy 2: Náº¿u chá»‰ lÃ  UUID (36 kÃ½ tá»±) thÃ¬ dá»±ng link surrit
        if (url && url.length === 36 && url.match(/^[0-9a-f-]{36}$/i)) {
            return "https://surrit.com/" + url + "/preview.mp4";
        }
        
        // Strategy 3: Deep Scan UUID trong cá»¥m HTML cá»§a item (giá»‘ng Strategy cá»§a link phim)
        if (!url || url === "") {
            var uuidMatch = itemHtml.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
                return "https://surrit.com/" + uuidMatch[0] + "/preview.mp4";
            }
        }
        
        // Chuáº©n hÃ³a protocol
        if (url && url.indexOf('//') === 0) {
            return "https:" + url;
        }
        
        return url;
    }
};

function parseListResponse(html) {
    // Normalize HTML: strip missav_media- prefix tá»« CSS class
    html = PluginUtils.normalizeHtml(html);
    var movies = [];

    // SPECIAL CASE: Search page uses Alpine.js + Recombee API (dynamic loading)
    // The search results are loaded via JavaScript, not static HTML
    // We detect this by looking for the Recombee client initialization
    var isSearchPage = html.indexOf('window.recombeeClient.send(new recombee.SearchItems') !== -1 ||
        html.indexOf('x-data="{') !== -1 && html.indexOf('recommendItems') !== -1;

    if (isSearchPage) {
        // Return a helpful message since we can't parse dynamic JS content
        return JSON.stringify({
            items: [{
                id: "/vi",
                title: "âš ï¸ TÃ¬m kiáº¿m MissAV chÆ°a há»— trá»£",
                posterUrl: "",
                backdropUrl: "",
                description: "Trang tÃ¬m kiáº¿m cá»§a MissAV sá»­ dá»¥ng cÃ´ng nghá»‡ táº£i Ä‘á»™ng (Alpine.js + Recombee API), khÃ´ng thá»ƒ parse tá»« HTML tÄ©nh. Vui lÃ²ng sá»­ dá»¥ng cÃ¡c má»¥c 'Thá»ƒ loáº¡i', 'HÃ´m nay nÃ³ng', 'Má»›i nháº¥t' Ä‘á»ƒ duyá»‡t phim.",
                year: 0,
                quality: "INFO",
                episode_current: "",
                lang: ""
            }],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 1,
                itemsPerPage: 1
            }
        });
    }

    // Scenario 1: Genre Grid (e.g. from /vi/genres)
    // Scenario 1.5: Actresses Grid (e.g. from /vi/actresses)

    // DETECT PAGE TYPE
    // 1. Check for Actresses Page first (Priority)
    // Look for multiple links containing '/actresses/'
    var actressLinkMatch = html.match(/href="[^"]*\/actresses\/[^"]+"/g);
    var isActressesPage = (actressLinkMatch && actressLinkMatch.length > 5);

    // 2. Check for Genres Page (if not Actresses)
    var isAllGenresPage = !isActressesPage &&
        html.indexOf('class="text-nord13"') !== -1 &&
        html.indexOf(':Ä‘áº¿m video') !== -1;

    if (isActressesPage) {
        // Tactic: Isolate the Grid UL first to avoid header/footer noise (Language flags etc.)
        // The list is usually inside a <ul class="... grid-cols-2 ...">
        var gridMatch = html.match(/<ul[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
        var searchScope = gridMatch ? gridMatch[1] : html;

        // List of blocked names (Language switcher labels)
        var blockedNames = ["Tiáº¿ng Viá»‡t", "English", "ç¹é«”ä¸­æ–‡", "ç®€ä½“ä¸­æ–‡", "æ—¥æœ¬èªž", "í•œêµ­ì˜", "Melayu", "à¹„à¸—à¸¢", "Deutsch", "FranÃ§ais", "Bahasa Indonesia", "Filipino", "PortuguÃªs", "MissAV"];
        var foundActresses = {};

        // Parse each <li> item
        var liRegex = /<li[\s\S]*?<\/li>/gi;
        var match;

        while ((match = liRegex.exec(searchScope)) !== null) {
            var itemHtml = match[0];

            // 1. Identify Actress URL
            // Look for link containing /actresses/ inside this item
            var urlMatch = itemHtml.match(/href="([^"]*\/actresses\/[^"]+)"/);
            if (!urlMatch) continue;

            var url = urlMatch[1];
            // Exclude links with '?' (pagination/language)
            if (url.indexOf('?') !== -1) continue;

            // 2. Extract Name
            // Try to find h4 first (most reliable in this layout)
            var nameMatch = itemHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
            var nameRaw = nameMatch ? nameMatch[1] : "";

            // Fallback to alt tag on image if h4 missing
            if (!nameRaw) {
                var altMatch = itemHtml.match(/<img[^>]+alt="([^"]+)"/);
                if (altMatch) nameRaw = altMatch[1];
            }

            var name = PluginUtils.cleanText(nameRaw);
            if (!name || name.length < 2) continue;
            if (name.indexOf(':Ä‘áº¿m') !== -1) continue;

            // Filter out language names
            var isBlocked = false;
            for (var k = 0; k < blockedNames.length; k++) {
                if (name === blockedNames[k]) { isBlocked = true; break; }
            }
            if (isBlocked) continue;

            // 3. Extract Image
            // Find img tag with src
            var imgMatch = itemHtml.match(/<img[^>]+src="([^"]+)"/);
            var img = imgMatch ? imgMatch[1] : "";

            // Filter flags/icons just in case
            if (img.indexOf('flag') !== -1 || img.indexOf('icon') !== -1) img = "";

            var slug = url.replace(/https?:\/\/[^\/]+/, "");
            if (slug.indexOf("/") !== 0) slug = "/" + slug;

            if (!foundActresses[slug]) {
                movies.push({
                    id: slug,
                    title: name,
                    posterUrl: img,
                    backdropUrl: img,
                    description: "Ná»¯ diá»…n viÃªn",
                    year: 0,
                    quality: "ACTRESS",
                    episode_current: "",
                    lang: ""
                });
                foundActresses[slug] = true;
            }
        }
    } else if (isAllGenresPage) {
        // GENRE PARSING LOGIC
        var genreRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var foundSlugs = {};
        var match;

        while ((match = genreRegex.exec(html)) !== null) {
            var url = match[1];
            var innerContent = match[2];

            // Filter: Must be a genre link and MUST NOT contain the count text in the link itself
            if (url.indexOf('/genres/') !== -1 && innerContent.indexOf(':Ä‘áº¿m video') === -1) {
                var name = PluginUtils.cleanText(innerContent);
                if (!name || name.length < 2) continue;

                var slug = url.replace(/https?:\/\/[^\/]+/, "");
                if (slug.indexOf("/") !== 0) slug = "/" + slug;

                // Avoid duplicates
                if (!foundSlugs[slug]) {
                    movies.push({
                        id: slug,
                        title: name,
                        posterUrl: "",
                        backdropUrl: "",
                        description: "Thá»ƒ loáº¡i",
                        year: 0,
                        quality: "CAT",
                        episode_current: "",
                        lang: ""
                    });
                    foundSlugs[slug] = true;
                }
            }
        }
    }

    // Scenario 2: Standard Movie List
    if (movies.length === 0) {
        // More resilient split by searching for partial class name
        var parts = html.split('thumbnail group');
        if (parts.length <= 1) parts = html.split('class="thumbnail'); // Fallback split

        for (var i = 1; i < parts.length; i++) {
            var itemHtml = parts[i];

            // Extract Slug/ID first
            var linkMatch = itemHtml.match(/<a[^>]+href="[^"]*\/vi\/([^"\/ \?]+)"/);
            var slug = linkMatch ? "vi/" + linkMatch[1] : "";

            var fullLinkMatch = itemHtml.match(/<a[^>]+href="([^"]+)"/);
            if (fullLinkMatch) {
                var fullUrl = fullLinkMatch[1];
                slug = fullUrl.replace(/https?:\/\/[^\/]+/, "");
                if (slug.indexOf("/") !== 0) slug = "/" + slug;
            }

            // Extract Code from text-nord13 explicitly
            var codeMatch = itemHtml.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";

            // Fallback for code: extract from slug (e.g., /vi/snos-056 -> snos-056)
            if (!code && slug) {
                var slugParts = slug.split("/");
                code = slugParts[slugParts.length - 1];
            }

            // Extract Candidates for Title
            var titleCandidates = [];
            // 1. Look for alt/title in img tag (best source)
            var imgFullMatch = itemHtml.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
            if (imgFullMatch) titleCandidates.push(PluginUtils.cleanText(imgFullMatch[1]));

            // 2. Look for any other title attributes
            var otherTitleRegex = /title="([^"]+)"/gi;
            var tMatch;
            while ((tMatch = otherTitleRegex.exec(itemHtml)) !== null) {
                var val = PluginUtils.cleanText(tMatch[1]);
                if (val.toUpperCase() !== code.toUpperCase()) {
                    titleCandidates.push(val);
                }
            }

            // Choose the longest candidate
            var bestTitle = "";
            for (var c = 0; c < titleCandidates.length; c++) {
                if (titleCandidates[c].length > bestTitle.length) {
                    bestTitle = titleCandidates[c];
                }
            }

            // Clean bestTitle: remove code if it prefixes the title
            var cleanTitle = bestTitle || code;
            if (code && cleanTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
                var stripped = cleanTitle.substring(code.length).trim();
                if (stripped.indexOf("-") === 0 || stripped.indexOf(" ") === 0) {
                    stripped = stripped.substring(1).trim();
                }
                if (stripped.length > 3) {
                    cleanTitle = stripped;
                }
            }

            if (!cleanTitle) cleanTitle = code || "No Title";

            // Extract Thumbnail
            var thumbMatch = itemHtml.match(/<img[\s\S]*?data-src="([^"]+)"/) ||
                itemHtml.match(/<img[\s\S]*?src="([^"]+)"/);
            var thumb = thumbMatch ? thumbMatch[1] : "";

            // Upgrade thumbnail to cover
            if (thumb && thumb.indexOf("cover-t.jpg") !== -1) {
                thumb = thumb.replace("/cover-t.jpg", "/cover.jpg");
            }

            if (slug && !slug.includes("actresses") && !slug.includes("genres")) {
                // FILTER: Discard template items (junk data often found at the end of search/lists)
                if (slug.indexOf('item.') !== -1 || slug.indexOf('{{') !== -1 || slug === "/" || slug === "#") continue;
                if (cleanTitle.indexOf('item.') !== -1 || cleanTitle.indexOf('{{') !== -1) continue;
                if (thumb.indexOf('item.') !== -1 || thumb.indexOf('itemUrl') !== -1) continue;

                // Try to extract Year/Duration if available
                var durationMatch = itemHtml.match(/<span[^>]*>\s*(\d+):(\d+):(\d+)\s*<\/span>/);
                var duration = durationMatch ? durationMatch[1] + ":" + durationMatch[2] + ":" + durationMatch[3] : "";

                // Check for "KhÃ´ng kiá»ƒm duyá»‡t" (Uncensored) badge
                var isUncensored = itemHtml.indexOf("KhÃ´ng kiá»ƒm duyá»‡t") !== -1 ||
                    itemHtml.indexOf("Uncensored") !== -1 ||
                    itemHtml.indexOf("bg-blue-800") !== -1;

                // Extract Preview Video báº±ng Strategy tá»‘i Æ°u
                var previewUrl = PluginUtils.extractPreviewUrl(itemHtml);

                movies.push({
                    id: slug,
                    title: cleanTitle,
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    description: duration,
                    year: 0,
                    quality: isUncensored ? "K.K.Duyá»‡t" : "HD",
                    episode_current: isUncensored ? "K.K.Duyá»‡t" : "Full",
                    lang: code, // Show only the code below the title
                    previewUrl: previewUrl
                });
            }
        }
    }

    // Pagination
    var totalPages = 1;
    var currentPage = 1;

    // Parse current page: <span class="bg-nord8 ...">2</span> or similar active class
    var currentMatch = html.match(/<span[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i) ||
        html.match(/<a[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/a>/i);

    if (currentMatch) {
        currentPage = parseInt(currentMatch[1]);
    }

    // Capture all page numbers and find max
    var allPageNums = html.match(/page=(\d+)/g);
    if (allPageNums) {
        for (var j = 0; j < allPageNums.length; j++) {
            var p = parseInt(allPageNums[j].match(/\d+/)[0]);
            if (p > totalPages) totalPages = p;
        }
    }

    // Also check input field pagination value (if any)
    var inputPageMatch = html.match(/name="page" value="(\d+)"/) || html.match(/type="number" value="(\d+)"/);
    if (inputPageMatch) {
        var pVal = parseInt(inputPageMatch[1]);
        if (pVal > 0) currentPage = Math.max(currentPage, pVal);
    }

    // Total pages usually appears after a slash or in a last-page link or in the last numeric link before "Next"
    var totalLabelMatch = html.match(/\/ (\d+)\s*<\/span>/) ||
        html.match(/>(\d+)<\/a>\s*<a[^>]*aria-label="Next"/i) ||
        html.match(/page=(\d+)[^>]*aria-label="Last"/i);

    if (totalLabelMatch) {
        var tVal = parseInt(totalLabelMatch[1]);
        if (tVal > 0) totalPages = Math.max(totalPages, tVal);
    }

    // Fallback: If we have many page=N links, find the maximum N mentioned
    if (totalPages === 1 && allPageNums) {
        // allPageNums was already captured above
        for (var k = 0; k < allPageNums.length; k++) {
            var p = parseInt(allPageNums[k].match(/\d+/)[0]);
            if (p > totalPages) totalPages = p;
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

function parseMovieDetail(html, pageUrl) {
    // Normalize HTML: strip missav_media- prefix tá»« CSS class
    html = PluginUtils.normalizeHtml(html);
    try {
        // Helper to extract relative slug from full URL
        var getSlug = function (url) {
            if (!url) return "";
            return url.replace(/^https?:\/\/[^\/]+/, "");
        };

        // 1. Helper for specific HTML structure: 
        // <div class="text-secondary"><span>Label:</span> <tag>Value</tag></div>
        var getField = function (labelKey) {
            // Capture entire content between </span> and </div> (across newlines)
            var regex = new RegExp("<span>" + labelKey + ":<\\/span>([\\s\\S]*?)<\\/div>", "i");
            var match = html.match(regex);
            if (!match) return "";

            var content = match[1];
            // Check for link
            var linkMatch = content.match(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
            if (linkMatch) {
                var url = linkMatch[1];
                var text = PluginUtils.cleanText(linkMatch[2]);
                return "[" + text + "](" + getSlug(url) + ")";
            }
            // Check for <time> tag (e.g. release date)
            var timeMatch = content.match(/<time[^>]*>([^<]+)<\/time>/i);
            if (timeMatch) {
                return PluginUtils.cleanText(timeMatch[1]);
            }
            // Check for <span class="font-medium"> (e.g. code, title)
            var spanMatch = content.match(/<span[^>]*>([^<]+)<\/span>/i);
            if (spanMatch) {
                return PluginUtils.cleanText(spanMatch[1]);
            }
            // Fallback to text (strip all tags)
            return PluginUtils.cleanText(content.replace(/<[^>]+>/g, ""));
        };

        var getMultiField = function (labelKey) {
            // Find start: <span>Label:</span>
            var regexStart = new RegExp("<span>" + labelKey + ":<\\/span>", "i");
            var matchStart = html.match(regexStart);
            if (!matchStart) return "";

            // Look ahead for closing div of the text-secondary container
            var startIndex = matchStart.index + matchStart[0].length;
            var searchArea = html.substring(startIndex);
            var divEnd = searchArea.indexOf("</div>");
            if (divEnd === -1) divEnd = searchArea.length;

            var content = searchArea.substring(0, divEnd);

            // Extract all links: [Name](Slug)
            var items = [];
            var linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
            var linkMatch;
            while ((linkMatch = linkRegex.exec(content)) !== null) {
                var url = linkMatch[1];
                var text = PluginUtils.cleanText(linkMatch[2]);
                if (text && !text.includes("<img")) {
                    items.push("[" + text + "](" + getSlug(url) + ")");
                }
            }
            return items.join(", ");
        };

        // 2. Extract Metadata
        var code = getField("MÃ£ sá»‘") || getField("Code");
        var releaseDate = getField("NgÃ y phÃ¡t hÃ nh") || getField("Release date");
        var studio = getField("nhÃ  sáº£n xuáº¥t") || getField("Maker");
        var director = getField("GiÃ¡m Ä‘á»‘c") || getField("Director");
        var label = getField("NhÃ£n") || getField("Label");

        var casts = getMultiField("Ná»¯ diá»…n viÃªn") || getMultiField("Actresses");
        var genres = getMultiField("thá»ƒ loáº¡i") || getMultiField("Genre") || getMultiField("Genres");
        var series = getMultiField("Loáº¡t") || getMultiField("Series");

        // 3. Fallback/Original Metadata (if above fails)
        if (!code) {
            var dvdIdMatch = html.match(/dvdId:\s*'([^']+)'/);
            code = dvdIdMatch ? dvdIdMatch[1] : "";
        }

        var title = PluginUtils.getMeta(html, "og:title");
        var thumb = PluginUtils.getMeta(html, "og:image");
        var desc = PluginUtils.getMeta(html, "og:description");

        var previewMatch = html.match(/<video[^>]+data-src="([^"]+)"/) || html.match(/video_url:\s*'([^']+)'/);
        var previewUrl = previewMatch ? previewMatch[1] : "";

        // Alternative: derive from thumb if it's a cover.jpg
        if (!previewUrl && thumb && thumb.indexOf("cover.jpg") !== -1) {
            previewUrl = thumb.replace("cover.jpg", "preview.mp4");
        }

        // Prepare a Display Title that includes the code in brackets for clarity in Details
        var displayTitle = title;
        // Strip code if it's already there to re-add in a standardized way [CODE] Title
        if (code && displayTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
            displayTitle = displayTitle.substring(code.length).trim();
            if (displayTitle.indexOf("-") === 0 || displayTitle.indexOf(" ") === 0) {
                displayTitle = displayTitle.substring(1).trim();
            }
        }

        if (code) {
            displayTitle = "[" + code.toUpperCase() + "] " + displayTitle;
        }

        // Truncate Title if extremely long
        var titleWords = displayTitle.split(" ");
        if (titleWords.length > 25) {
            displayTitle = titleWords.slice(0, 25).join(" ") + "...";
        }

        // 4. Stream URL Logic
        var streamUrl = "";
        var uuid = "";

        // Strategy 1: Extract from eval() obfuscated code (new pattern)
        // The source URL is now hidden inside eval(function(p,a,c,k,e,d){...})
        // Look for the split('|') array which contains UUID parts and domain
        var evalMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
        if (evalMatch) {
            var parts = evalMatch[1].split('|');
            // Look for 'surrit' or 'sixyik' in parts to confirm it's the video source eval
            var hasSurrit = false;
            for (var ei = 0; ei < parts.length; ei++) {
                if (parts[ei] === 'surrit' || parts[ei] === 'sixyik') {
                    hasSurrit = true;
                    break;
                }
            }
            if (hasSurrit) {
                // Find UUID parts (5 hex segments) in the array
                var uuidParts = [];
                for (var ei = 0; ei < parts.length; ei++) {
                    if (parts[ei].match(/^[0-9a-f]{8,12}$/)) {
                        uuidParts.push(parts[ei]);
                    }
                }
                // Try to reconstruct UUID from parts array
                // Pattern: fa80d6f9|e876|491d|877c|f56188cab276
                if (uuidParts.length >= 5) {
                    uuid = uuidParts[0] + '-' + uuidParts[1] + '-' + uuidParts[2] + '-' + uuidParts[3] + '-' + uuidParts[4];
                }
            }
        }

        // Strategy 2: Check for direct Surrit/Sixyik/Nineyu/Fourhoi patterns
        if (!uuid) {
            var surritMatch = html.match(/surrit\.com\/([0-9a-f-]{36})/i) ||
                html.match(/sixyik\.com\/([0-9a-f-]{36})/i) ||
                html.match(/nineyu\.com\/([0-9a-f-]{36})/i) ||
                html.match(/fourhoi\.com\/([0-9a-f-]{36})/i);
            if (surritMatch) {
                uuid = surritMatch[1];
            }
        }

        // Strategy 3: Check for blob/data-source patterns
        if (!uuid && !streamUrl) {
            var blobMatch = html.match(/src=["']blob:[^"']+\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})["']/i);
            var sourceMatch = html.match(/data-source=["']([^"']+)["']/i);
            if (blobMatch) {
                uuid = blobMatch[1];
            } else if (sourceMatch && sourceMatch[1].indexOf('m3u8') !== -1) {
                streamUrl = sourceMatch[1];
            }
        }

        // Strategy 4: Deep Scan for UUID (fallback)
        if (!uuid && !streamUrl) {
            var uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
            var matches = html.match(uuidRegex) || [];
            var blacklist = ["snaptrckr", "user_uuid", "popunder", "banner", "monitoring", "crypto", "randomUUID", "generateUUID"];

            for (var i = 0; i < matches.length; i++) {
                var u = matches[i];
                var isBad = false;
                var idx = html.indexOf(u);
                if (idx !== -1) {
                    var context = html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 80));
                    for (var j = 0; j < blacklist.length; j++) {
                        if (context.indexOf(blacklist[j]) !== -1) {
                            isBad = true; break;
                        }
                    }
                }
                if (!isBad) { uuid = u; break; }
            }
        }

        if (uuid) {
            streamUrl = "https://surrit.com/" + uuid + "/playlist.m3u8";
        }

        var servers = [];
        if (streamUrl) {
            // IMPORTANT: DÃ¹ng URL gá»‘c thay vÃ¬ m3u8 URL trá»±c tiáº¿p
            // Äá»ƒ PlayerViewModel gá»i getStreamLink() â†’ headers Referer Ä‘Æ°á»£c gáº¯n
            // surrit.com yÃªu cáº§u Referer header, náº¿u gá»i trá»±c tiáº¿p sáº½ bá»‹ 403
            var episodeId = pageUrl || streamUrl;
            servers.push({
                name: "Stream",
                episodes: [{
                    id: episodeId,
                    name: "Full",
                    slug: "full"
                }]
            });
        }

        // 5. Construct Result
        // Composite status field to show Studio and Label
        var statusLine = "";
        if (studio) statusLine += "Studio: " + studio;
        if (label) statusLine += (statusLine ? " | " : "") + "Label: " + label;
        if (!statusLine && releaseDate) statusLine = "Released: " + releaseDate;

        var year = releaseDate ? parseInt(releaseDate.substring(0, 4)) : 0;

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
            duration: series ? "Series: " + series : "", // Or parse duration if needed
            previewUrl: previewUrl || ""
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html) {
    // Extract UUID directly from HTML (independent from parseMovieDetail)
    var uuid = "";
    var streamUrl = "";

    // Strategy 1: Decode eval() obfuscated code
    var evalMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
    if (evalMatch) {
        var parts = evalMatch[1].split('|');
        var hasSurrit = false;
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === 'surrit' || parts[i] === 'sixyik') { hasSurrit = true; break; }
        }
        if (hasSurrit) {
            var uuidParts = [];
            for (var i = 0; i < parts.length; i++) {
                if (parts[i].match(/^[0-9a-f]{8,12}$/)) uuidParts.push(parts[i]);
            }
            if (uuidParts.length >= 5) {
                uuid = uuidParts[0] + '-' + uuidParts[1] + '-' + uuidParts[2] + '-' + uuidParts[3] + '-' + uuidParts[4];
            }
        }
    }

    // Strategy 2: Direct domain scan
    if (!uuid) {
        var m = html.match(/surrit\.com\/([0-9a-f-]{36})/i) ||
            html.match(/sixyik\.com\/([0-9a-f-]{36})/i) ||
            html.match(/nineyu\.com\/([0-9a-f-]{36})/i) ||
            html.match(/fourhoi\.com\/([0-9a-f-]{36})/i);
        if (m) uuid = m[1];
    }

    // Strategy 3: Deep UUID scan (fallback)
    if (!uuid) {
        var matches = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
        var blacklist = ["snaptrckr", "user_uuid", "popunder", "banner", "monitoring", "crypto", "randomUUID", "generateUUID"];
        for (var i = 0; i < matches.length; i++) {
            var u = matches[i];
            var isBad = false;
            var idx = html.indexOf(u);
            if (idx !== -1) {
                var ctx = html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 80));
                for (var j = 0; j < blacklist.length; j++) {
                    if (ctx.indexOf(blacklist[j]) !== -1) { isBad = true; break; }
                }
            }
            if (!isBad) { uuid = u; break; }
        }
    }

    if (uuid) {
        streamUrl = "https://surrit.com/" + uuid + "/playlist.m3u8";
    }

    return JSON.stringify({
        url: streamUrl,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://missav123.com/",
            "Origin": "https://missav123.com"
        },
        subtitles: []
    });
}

function parseCategoriesResponse(html) {
    // Normalize HTML: strip missav_media- prefix tá»« CSS class
    html = PluginUtils.normalizeHtml(html);
    var categories = [];

    // Add "All Genres" as the first item
    categories.push({ name: "Táº¥t cáº£ thá»ƒ loáº¡i", slug: "vi/genres" });

    // Regex to capture both relative and absolute links: href=".../vi/genres/slug"
    // Capture group 1: potentially full url or relative path
    // Capture group 2: Category Name
    var regex = /<a[^>]+href="([^"]*\/vi\/genres\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    var match;
    var seen = {};

    while ((match = regex.exec(html)) !== null) {
        var fullPath = match[1];
        var name = PluginUtils.cleanText(match[2]);

        // Extract slug from path (e.g. /vi/genres/vr -> vr)
        var parts = fullPath.split("/genres/");
        var slug = parts.length > 1 ? parts[1] : "";

        if (slug && name && !seen[slug]) {
            seen[slug] = true;
            // Ensure slug is full relative path for plugin system
            categories.push({ name: name, slug: "vi/genres/" + slug });
        }
    }
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
