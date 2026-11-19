// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://phimhdcss.com";

function getManifest() {
    return JSON.stringify({
        "id": "phimhdcs",
        "name": "PhimHDCS",
        "version": "1.1.4",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "playerType": "exoplayer",
        "type": "MOVIE"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[PhimHDCS] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[PhimHDCS] " + msg);
    }
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'top-phim-ngay', title: 'Top Phim Ngày', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'bang-xep-hang', title: 'Phim Đề Cử', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-ngan', title: 'Phim Ngắn', type: 'Horizontal', path: 'the-loai' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'the-loai' },
        { slug: 'phim-moi', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi' },
        { name: 'Top phim ngày', slug: 'top-phim-ngay' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' },
        { name: 'Phim ngắn', slug: 'phim-ngan' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Sắp xếp', value: '' },
            { name: 'Mới cập nhật', value: 'update' },
            { name: 'Thời gian đăng', value: 'create' },
            { name: 'Năm sản xuất', value: 'year' },
            { name: 'Lượt xem', value: 'view' }
        ],
        type: [
            { name: 'Phim bộ', value: 'series' },
            { name: 'Phim lẻ', value: 'single' }
        ],
        category: [
            { name: 'Thể loại', value: '' },
            { name: 'Âm Nhạc', value: '16' }, { name: 'Báo Thù', value: '52' }, { name: 'Bí ẩn', value: '13' },
            { name: 'Boyloves', value: '29' }, { name: 'Chiến Tranh', value: '18' }, { name: 'Chính kịch', value: '1' },
            { name: 'Chuyển Thể', value: '28' }, { name: 'Cổ Trang', value: '15' }, { name: 'Dân Quốc', value: '30' },
            { name: 'Đô Thị', value: '35' }, { name: 'Gây Cấn', value: '44' }, { name: 'Gia Đình', value: '3' },
            { name: 'Giả Tưởng', value: '43' }, { name: 'Hài Hước', value: '5' }, { name: 'Hành Động', value: '10' },
            { name: 'Hệ Thống', value: '51' }, { name: 'Hiện Đại', value: '36' }, { name: 'Hình Sự', value: '37' },
            { name: 'Hoạt Hình', value: '4' }, { name: 'Học Đường', value: '20' }, { name: 'Huyền Huyễn', value: '25' },
            { name: 'Khoa Học', value: '17' }, { name: 'Khoa Học Viễn Tưởng', value: '42' }, { name: 'Kinh Di Đồ', value: '12' },
            { name: 'Kỳ Ảo', value: '53' }, { name: 'Lãng Mạn', value: '40' }, { name: 'Lịch Sử', value: '46' },
            { name: 'Netflix', value: '48' }, { name: 'Ngôn Tình', value: '32' }, { name: 'Ngọt Sủng', value: '54' },
            { name: 'Phá Án', value: '11' }, { name: 'Phiêu Lưu', value: '9' }, { name: 'Phim 18+', value: '24' },
            { name: 'Phim ngắn', value: '38' }, { name: 'Tâm Lý', value: '6' }, { name: 'Thần Thoại', value: '23' },
            { name: 'Tiên Hiệp', value: '26' }, { name: 'Tình Cảm', value: '2' }, { name: 'Tội Phạm', value: '39' },
            { name: 'Trọng Sinh', value: '56' }, { name: 'TV Shows', value: '8' }, { name: 'Viễn Tưởng', value: '14' },
            { name: 'Võ Thuật', value: '21' }, { name: 'Xuyên Không', value: '27' }, { name: 'Xuyên Sách', value: '50' },
            { name: 'Y Khoa', value: '31' }
        ],
        country: [
            { name: 'Quốc gia', value: '' },
            { name: 'Thái Lan', value: '1' }, { name: 'Trung Quốc', value: '5' }, { name: 'Hàn Quốc', value: '6' },
            { name: 'Nhật Bản', value: '4' }, { name: 'Âu Mỹ', value: '2' }, { name: 'Hồng Kông', value: '26' },
            { name: 'Đài Loan', value: '22' }, { name: 'Việt Nam', value: '34' }, { name: 'Ấn Độ', value: '8' },
            { name: 'Anh', value: '7' }, { name: 'Pháp', value: '10' }, { name: 'Đức', value: '23' },
            { name: 'Tây Ban Nha', value: '12' }, { name: 'Thổ Nhĩ Kỳ', value: '3' }, { name: 'Nga', value: '18' },
            { name: 'Úc', value: '17' }, { name: 'Canada', value: '13' }, { name: 'Brazil', value: '28' },
            { name: 'Singapore', value: '45' }, { name: 'Philippines', value: '20' }, { name: 'Indonesia', value: '16' }
        ],
        language: [
            { name: 'Ngôn ngữ', value: '' },
            { name: 'Vietsub', value: 'Vietsub' },
            { name: 'Thuyết Minh', value: 'Thuyết Minh' },
            { name: 'Vietsub + Thuyết Minh', value: 'Vietsub + Thuyết Minh' },
            { name: 'Lồng Tiếng', value: 'Lồng Tiếng' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function normalizeUrl(url) {
    if (!url) return "";
    url = String(url).trim();
    if (/^https?:\/\//i.test(url)) return url;
    if (url.indexOf("//") === 0) return "https:" + url;
    return BASE_URL + (url.indexOf("/") === 0 ? "" : "/") + url;
}

function stripTags(html) {
    if (!html) return "";
    return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page || 1, 10) || 1;

        var hasFilter = filters.sort || filters.category || filters.country || filters.year || filters.type || filters.language;

        if (hasFilter) {
            var params = [];
            if (filters.sort) params.push("filter[sort]=" + encodeURIComponent(filters.sort));
            if (filters.type) params.push("filter[type]=" + encodeURIComponent(filters.type));
            if (filters.category) params.push("filter[category]=" + encodeURIComponent(filters.category));
            if (filters.country) params.push("filter[region]=" + encodeURIComponent(filters.country));
            if (filters.year) params.push("filter[year]=" + encodeURIComponent(filters.year));
            if (filters.language) params.push("filter[language]=" + encodeURIComponent(filters.language));
            if (page > 1) params.push("page=" + page);

            return BASE_URL + "/?" + params.join("&");
        }

        var path = "";
        if (slug === 'phim-de-cu') {
            path = "/danh-sach/bang-xep-hang";
        } else if (slug === 'bang-xep-hang' || slug === 'top-phim-ngay' || slug === 'phim-chieu-rap' || slug === 'phim-moi') {
            path = "/danh-sach/" + slug;
        } else {
            path = "/the-loai/" + slug;
        }

        var url = BASE_URL + path;
        if (page > 1) {
            url += "?page=" + page;
        }

        return url;
    } catch (e) {
        return BASE_URL + "/danh-sach/phim-moi";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = parseInt(filters.page || 1, 10) || 1;
        var url = BASE_URL + "/?search=" + encodeURIComponent(keyword || "").replace(/%20/g, "+");
        if (page > 1) {
            url += "&page=" + page;
        }
        return url;
    } catch (e) {
        return BASE_URL + "/?search=" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    if (/^https?:\/\//i.test(slug)) return slug;
    var path = slug.indexOf("/") === 0 ? slug.substring(1) : slug;
    return BASE_URL + "/" + path;
}

function getUrlCategories() {
    return BASE_URL + "/the-loai";
}

function getUrlCountries() {
    return BASE_URL + "/quoc-gia";
}

function getUrlYears() {
    return BASE_URL + "/nam";
}

// =============================================================================
// HTML & STREAM PARSERS
// =============================================================================

function decodeBase64(str) {
    try {
        var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var output = [];
        var clean = String(str || "").replace(/[^A-Za-z0-9+/=]/g, '');
        var len = clean.length;

        for (var i = 0; i < len; i += 4) {
            var c1 = lookup.indexOf(clean.charAt(i));
            var c2 = lookup.indexOf(clean.charAt(i + 1));
            var c3 = lookup.indexOf(clean.charAt(i + 2));
            var c4 = lookup.indexOf(clean.charAt(i + 3));

            if (c1 < 0 || c2 < 0) break;

            var b1 = (c1 << 2) | (c2 >> 4);
            output.push(String.fromCharCode(b1));

            if (c3 >= 0 && c3 !== 64) {
                var b2 = ((c2 & 15) << 4) | (c3 >> 2);
                output.push(String.fromCharCode(b2));
            }
            if (c4 >= 0 && c4 !== 64) {
                var b3 = ((c3 & 3) << 6) | c4;
                output.push(String.fromCharCode(b3));
            }
        }

        var raw = output.join('');
        try {
            return decodeURIComponent(escape(raw));
        } catch (e) {
            return raw;
        }
    } catch (e) {
        return "";
    }
}

function parseDynamicFilters(html) {
    var result = {};
    try {
        var parseSelect = function (namePattern) {
            var list = [];
            var selectMatch = new RegExp('<select[^>]+name="' + namePattern + '"[\\s\\S]*?>([\\s\\S]*?)<\\/select>', 'i').exec(html);
            if (selectMatch) {
                var optionsHtml = selectMatch[1];
                var optionPattern = /<option\s+value="([^"]*)"[^>]*>([\s\S]*?)<\/option>/gi;
                var optMatch;
                while ((optMatch = optionPattern.exec(optionsHtml)) !== null) {
                    var val = optMatch[1].trim();
                    var name = stripTags(optMatch[2]);
                    if (val && name) list.push({ name: name, value: val });
                }
            }
            return list;
        };

        result.category = parseSelect('filter\\[category\\]');
        result.country = parseSelect('filter\\[region\\]');
        result.language = parseSelect('filter\\[language\\]');
        result.year = parseSelect('filter\\[year\\]');
        result.sort = parseSelect('filter\\[sort\\]');
        result.type = parseSelect('filter\\[type\\]');
    } catch (e) { }
    return result;
}

function sortEpisodesAscending(episodes) {
    if (!episodes || episodes.length <= 1) return episodes || [];
    var firstMatch = /(?:Tập|Ep|Episode)?\s*(\d+)/i.exec(episodes[0].name);
    var lastMatch = /(?:Tập|Ep|Episode)?\s*(\d+)/i.exec(episodes[episodes.length - 1].name);
    if (firstMatch && lastMatch) {
        var firstNum = parseInt(firstMatch[1], 10);
        var lastNum = parseInt(lastMatch[1], 10);
        if (firstNum > lastNum) {
            episodes.reverse();
        }
    }
    return episodes;
}

function parseListResponse(htmlContent) {
    try {
        var movies = [];
        var itemPattern = /<li\s+class="item[^"]*">\s*<span\s+class="label">([^<]+)<\/span>\s*<a\s+href="https:\/\/phimhdcss\.com\/([^"]+)"\s+title="([^"]+)">\s*<img[^>]+(?:data-src|src)="([^"]+)"[^>]*\/?>[\s\S]*?<div\s+class="name">[\s\S]*?<a[^>]+title="([^"]+)">([^<]+)<\/a>/gi;
        var match;

        while ((match = itemPattern.exec(htmlContent)) !== null) {
            var label = match[1].trim();
            var slug = match[2].trim();
            var title = match[3].trim();
            var posterUrl = normalizeUrl(match[4]);
            var fullTitle = match[5].trim();

            var year = 0;
            var yearMatch = /(\d{4})/.exec(fullTitle);
            if (yearMatch) year = parseInt(yearMatch[1], 10);

            var episodeCurrent = "";
            var epMatch = /(Tập\s*\d+|Hoàn\s*[tT]ất\s*\(\d+\/\d+\)|Full)/i.exec(label);
            if (epMatch) episodeCurrent = epMatch[1].trim();

            var lang = label.replace(episodeCurrent, "")
                .replace(/^\s*\+\s*|\s*\+\s*$/g, "")
                .replace(/\b(Full|HD|FHD|CAM)\b/gi, "")
                .trim();

            var quality = "";
            if (/\bFull\b/i.test(label)) quality = "Full";
            else if (/\bFHD|1080p\b/i.test(label)) quality = "FHD";
            else if (/\bHD\b/i.test(label)) quality = "HD";

            movies.push({
                id: slug,
                title: title,
                posterUrl: posterUrl,
                backdropUrl: posterUrl,
                year: year,
                quality: quality,
                episode_current: episodeCurrent,
                lang: lang
            });
        }

        var totalPages = 1;
        var pagePattern = /page=(\d+)/gi;
        var pageMatch;
        while ((pageMatch = pagePattern.exec(htmlContent)) !== null) {
            var pageNum = parseInt(pageMatch[1], 10);
            if (pageNum > totalPages) totalPages = pageNum;
        }

        var currentPage = 1;
        var currentPageMatch = /<a[^>]*class="[^"]*current[^"]*"[^>]*>(\d+)<\/a>/i.exec(htmlContent);
        if (currentPageMatch) currentPage = parseInt(currentPageMatch[1], 10);

        var filterOptions = parseDynamicFilters(htmlContent);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalPages * 20,
                itemsPerPage: 20
            },
            filterOptions: filterOptions
        });
    } catch (error) {
        log("parseListResponse error: " + error);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 } });
    }
}

function parseSearchResponse(htmlContent) {
    return parseListResponse(htmlContent);
}

function parseMovieDetail(htmlContent) {
    try {
        var title = "";
        var titleMatch = /<span\s+class="title"\s+itemprop="name">([^<]+)<\/span>/i.exec(htmlContent);
        if (titleMatch) title = titleMatch[1].trim();

        var originalTitle = "";
        var origMatch = /<span\s+class="real-name">([^<]+)<\/span>/i.exec(htmlContent);
        if (origMatch) originalTitle = origMatch[1].trim();

        var posterUrl = "";
        var posterMatch = /<img\s+itemprop="image"\s+(?:data-src|src)="([^"]+)"/i.exec(htmlContent);
        if (posterMatch) posterUrl = normalizeUrl(posterMatch[1]);

        var description = "";
        var descMatch = /<div\s+class="tab">[\s\S]*?<div\s+style="text-align:\s*justify;?"[^>]*>([\s\S]*?)<\/div>/i.exec(htmlContent);
        if (!descMatch) descMatch = /<div\s+style="text-align:\s*justify;?"[^>]*>([\s\S]*?)<\/div>/i.exec(htmlContent);
        if (descMatch) description = stripTags(descMatch[1]);

        function extractInfo(label) {
            var regex = new RegExp('<dt>' + label + ':<\\/dt>\\s*<dd>([\\s\\S]*?)<\\/dd>', 'i');
            var match = regex.exec(htmlContent);
            return match ? stripTags(match[1]) : "";
        }

        var director = extractInfo("Đạo diễn");
        var duration = extractInfo("Thời lượng");
        var totalEpisodes = extractInfo("Số tập");
        var statusInfo = extractInfo("Tình trạng");
        var language = extractInfo("Ngôn ngữ");
        var prodYear = extractInfo("Năm sản xuất");
        var countryTag = extractInfo("Quốc gia");

        var year = 0;
        if (prodYear) year = parseInt(prodYear, 10) || 0;
        if (!year) {
            var yearMatch = /(\d{4})/.exec(originalTitle);
            if (yearMatch) year = parseInt(yearMatch[1], 10) || 0;
        }

        var rating = 0;
        var ratingMatch = /<span\s+class="average"\s+id="average"\s+itemprop="ratingValue">([^<]+)<\/span>/i.exec(htmlContent);
        if (ratingMatch) rating = parseFloat(ratingMatch[1].trim()) || 0;

        var episodeCurrent = "";
        var statusMatch = /<dd\s+class="film-status">[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i.exec(htmlContent);
        if (statusMatch) episodeCurrent = stripTags(statusMatch[1]);
        if (!episodeCurrent) episodeCurrent = statusInfo;

        var categories = [];
        var catPattern = /<a\s+href="https:\/\/phimhdcss\.com\/the-loai\/[^"]+"\s+(?:tite|title)="([^"]+)">/gi;
        var match;
        while ((match = catPattern.exec(htmlContent)) !== null) {
            categories.push(match[1].trim());
        }

        var countries = [];
        var countryPattern = /<a\s+href="https:\/\/phimhdcss\.com\/quoc-gia\/[^"]+"\s+(?:tite|title)="([^"]+)">/gi;
        while ((match = countryPattern.exec(htmlContent)) !== null) {
            countries.push(match[1].trim());
        }
        if (countries.length === 0 && countryTag) countries.push(countryTag);

        var actors = [];
        var actorPattern = /<a\s+href="https:\/\/phimhdcss\.com\/dien-vien\/[^"]+"\s+(?:tite|title)="Diễn viên ([^"]+)">/gi;
        while ((match = actorPattern.exec(htmlContent)) !== null) {
            actors.push(match[1].trim());
        }

        var servers = [];
        var serverPattern = /<div[^>]*class="server-episode-block"[^>]*>[\s\S]*?Danh sách\s*(?:Sever)?\s*([^:<]+)[\s\S]*?<div[^>]*class="list-episode[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;

        while ((match = serverPattern.exec(htmlContent)) !== null) {
            var cleanServerName = match[1].trim()
                .replace(/^Server\s+/i, '')
                .replace(/^z/i, '')
                .replace(/\s*#\d+$/, '')
                .trim();

            var episodesHtml = match[2];
            var episodes = [];
            var epPattern = /<a\s+href="([^"]+)"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
            var epMatch;
            while ((epMatch = epPattern.exec(episodesHtml)) !== null) {
                var epUrl = normalizeUrl(epMatch[1]);
                var epName = (epMatch[2] || stripTags(epMatch[3])).trim();
                episodes.push({
                    id: epUrl,
                    name: epName,
                    slug: epUrl
                });
            }

            if (episodes.length > 0) {
                sortEpisodesAscending(episodes);
                servers.push({ name: cleanServerName, episodes: episodes });
            }
        }

        var slug = "";
        var slugMatch = /<link\s+rel="canonical"\s+href="https:\/\/phimhdcss\.com\/([^"\/]+)"/i.exec(htmlContent);
        if (slugMatch) slug = slugMatch[1].trim();

        var extraUrl = "";
        var btnPlayMatch = /<a\s+class="btn-see btn btn-danger btn-stream-link"\s+href="([^"]+)"/i.exec(htmlContent);
        if (btnPlayMatch) extraUrl = normalizeUrl(btnPlayMatch[1]);

        var fullDesc = description;
        if (duration) fullDesc += "\nThời lượng: " + duration;
        if (totalEpisodes) fullDesc += "\nSố tập: " + totalEpisodes;
        if (statusInfo) fullDesc += "\nTình trạng: " + statusInfo;

        return JSON.stringify({
            id: slug,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: fullDesc,
            year: year,
            rating: rating,
            quality: "",
            servers: servers,
            episode_current: episodeCurrent,
            lang: language,
            category: categories.join(", "),
            country: countries.join(", "),
            director: director,
            casts: actors.join(", "),
            extra: extraUrl
        });
    } catch (error) {
        log("parseMovieDetail error: " + error);
        return "null";
    }
}

function parseWatchPage(htmlContent, pageUrl) {
    var title = "";
    var episodeCurrent = "";
    var originalTitle = "";
    var year = 0;
    var description = "";
    var rating = 0;
    var ratingCount = 0;
    var detailUrl = "";
    var countries = [];

    // 1. Breadcrumb
    var crumbPattern = /<li[^>]*itemprop="itemListElement"[^>]*>([\s\S]*?)<\/li>/gi;
    var crumbMatch;
    while ((crumbMatch = crumbPattern.exec(htmlContent)) !== null) {
        var crumbHtml = crumbMatch[1];
        var crumbText = stripTags(crumbHtml);
        var crumbHrefMatch = /href="([^"]+)"/i.exec(crumbHtml);
        var crumbHref = crumbHrefMatch ? normalizeUrl(crumbHrefMatch[1]) : "";

        if (/\/quoc-gia\//i.test(crumbHref) && crumbText) {
            countries.push(crumbText);
        } else if (/-\d+$/.test(crumbHref) && crumbText) {
            if (!title) title = crumbText;
            if (!detailUrl) detailUrl = crumbHref;
        }
    }

    // 2. Khối .details
    var h1Match = /<h1[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/h1>/i.exec(htmlContent);
    if (h1Match) {
        var h1Html = h1Match[1];
        var chapterMatch = /<span[^>]*class="chapter-name"[^>]*>([\s\S]*?)<\/span>/i.exec(h1Html);
        if (chapterMatch) episodeCurrent = stripTags(chapterMatch[1]);

        var h1LinkMatch = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(h1Html);
        if (h1LinkMatch) {
            detailUrl = normalizeUrl(h1LinkMatch[1]);
            var h1Title = stripTags(h1LinkMatch[2]);
            if (h1Title) title = h1Title;
        }
    }

    var realNameMatch = /<h2[^>]*class="real-name"[^>]*>([\s\S]*?)<\/h2>/i.exec(htmlContent);
    if (realNameMatch) {
        var rawReal = stripTags(realNameMatch[1]);
        var yearMatch = /\((\d{4})\)/.exec(rawReal);
        if (yearMatch) {
            year = parseInt(yearMatch[1], 10) || 0;
            originalTitle = rawReal.replace(/\s*\(\d{4}\)\s*$/, "").trim();
        } else {
            originalTitle = rawReal;
        }
    }

    var shortDescMatch = /<p[^>]*class="[^"]*short-description[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(htmlContent);
    if (shortDescMatch) {
        description = stripTags(shortDescMatch[1]);
    }

    var ratingMatch = /itemprop="ratingValue"[^>]*>([^<]+)</i.exec(htmlContent);
    if (ratingMatch) {
        rating = parseFloat(ratingMatch[1].trim()) || 0;
    } else {
        var starMatch = /<div[^>]*id="star"[^>]*data-score="([^"]+)"/i.exec(htmlContent);
        if (starMatch) rating = parseFloat(starMatch[1].trim()) || 0;
    }

    var rateCountMatch = /itemprop="ratingCount"[^>]*>([^<]+)</i.exec(htmlContent);
    if (rateCountMatch) {
        ratingCount = parseInt(rateCountMatch[1].replace(/[^\d]/g, ""), 10) || 0;
    }

    // 3. Player metadata & danh sách server phát (FHDC, HDC, NC, HD...)
    var playerEndpoint = "";
    var playerSignature = "";
    var currentEpisodeId = "";

    var playerBoxMatch = /<div[^>]*id="player-video"[^>]*>/i.exec(htmlContent);
    if (playerBoxMatch) {
        var playerTag = playerBoxMatch[0];
        var epAttr = /data-endpoint="([^"]+)"/i.exec(playerTag);
        var sigAttr = /data-signature="([^"]+)"/i.exec(playerTag);
        var curIdAttr = /data-current-episode-id="([^"]+)"/i.exec(playerTag);
        if (epAttr) playerEndpoint = epAttr[1].trim();
        if (sigAttr) playerSignature = sigAttr[1].trim();
        if (curIdAttr) currentEpisodeId = curIdAttr[1].trim();
    }

    var streamingServers = [];
    var svPattern = /<a[^>]*class="[^"]*streaming-server[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
    var svMatch;
    while ((svMatch = svPattern.exec(htmlContent)) !== null) {
        var svTag = svMatch[0];
        var idM = /data-id="([^"]*)"/i.exec(svTag);
        var typeM = /data-type="([^"]*)"/i.exec(svTag);
        var active = /\bactive\b/i.test(svTag);
        var svName = stripTags(svMatch[1]);
        streamingServers.push({
            id: idM ? idM[1].trim() : "",
            type: typeM ? typeM[1].trim() : "embed",
            name: svName,
            active: active
        });
    }

    // 4. Danh sách tập theo từng khối .episodes
    var servers = [];
    var epContainerPattern = /<div[^>]*class="episodes[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
    var epContainerMatch;
    while ((epContainerMatch = epContainerPattern.exec(htmlContent)) !== null) {
        var containerHtml = epContainerMatch[1];
        var serverName = "Vietsub";
        var svNameMatch = /data-server="([^"]+)"/i.exec(containerHtml);
        if (svNameMatch) serverName = svNameMatch[1].trim();

        var episodes = [];
        var epLinkPattern = /<a\s+href="([^"]+)"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        var epLinkMatch;
        while ((epLinkMatch = epLinkPattern.exec(containerHtml)) !== null) {
            var epUrl = normalizeUrl(epLinkMatch[1]);
            var epTitle = (epLinkMatch[2] || stripTags(epLinkMatch[3])).trim();
            episodes.push({
                id: epUrl,
                name: epTitle,
                slug: epUrl
            });
        }

        if (episodes.length > 0) {
            sortEpisodesAscending(episodes);
            servers.push({
                name: serverName,
                episodes: episodes
            });
        }
    }

    // Fallback nếu không khớp cấu trúc container trên
    if (servers.length === 0) {
        var fallbackEps = [];
        var fallbackPattern = /<a\s+href="(https:\/\/phimhdcss\.com\/[^"]+\/tap-[^"]+)"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        var fbMatch;
        while ((fbMatch = fallbackPattern.exec(htmlContent)) !== null) {
            fallbackEps.push({
                id: normalizeUrl(fbMatch[1]),
                name: (fbMatch[2] || stripTags(fbMatch[3])).trim(),
                slug: normalizeUrl(fbMatch[1])
            });
        }
        if (fallbackEps.length > 0) {
            sortEpisodesAscending(fallbackEps);
            servers.push({
                name: "Vietsub",
                episodes: fallbackEps
            });
        }
    }

    // 5. Dò link stream trực tiếp nếu có nhúng sẵn trong HTML/script
    var streamUrl = "";
    var m3u8Match = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i.exec(htmlContent);
    var mp4Match = /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/i.exec(htmlContent);
    var iframeMatch = /<div[^>]*id="player"[^>]*>[\s\S]*?<iframe[^>]+src="([^"]+)"/i.exec(htmlContent);

    if (m3u8Match) {
        streamUrl = m3u8Match[1];
    } else if (mp4Match) {
        streamUrl = mp4Match[1];
    } else if (iframeMatch) {
        streamUrl = normalizeUrl(iframeMatch[1]);
    } else {
        var b64Match = /(?:atob\(|base64,|data-link=|data-url=|source\s*[:=]\s*)["']([A-Za-z0-9+/=]{24,})["']/i.exec(htmlContent);
        if (b64Match) {
            var decoded = decodeBase64(b64Match[1]).trim();
            if (/^(https?:\/\/|\/)/i.test(decoded)) {
                streamUrl = normalizeUrl(decoded);
            }
        }
    }

    var slug = "";
    if (detailUrl) {
        slug = detailUrl.replace(BASE_URL + "/", "").replace(/^\/+/, "");
    }

    return {
        id: slug,
        title: title,
        originalTitle: originalTitle,
        description: description,
        year: year,
        rating: rating,
        ratingCount: ratingCount,
        episode_current: episodeCurrent,
        country: countries.join(", "),
        servers: servers,
        streamUrl: streamUrl,
        pageUrl: pageUrl || "",
        playerMeta: {
            endpoint: playerEndpoint,
            signature: playerSignature,
            currentEpisodeId: currentEpisodeId,
            streamingServers: streamingServers
        }
    };
}

function parseDetailResponse(htmlContent, pageUrl) {
    try {
        var hasWatchMarkers = /id="player-video"|class="streaming-server"|class="chapter-name"|class="js-episode-list"/i.test(htmlContent);

        if (hasWatchMarkers) {
            var watchObj = parseWatchPage(htmlContent, pageUrl);
            return JSON.stringify(watchObj);
        }

        var detailJsonStr = parseMovieDetail(htmlContent);
        var detailObj = (detailJsonStr && detailJsonStr !== "null") ? JSON.parse(detailJsonStr) : {};

        var streamUrl = "";
        var m3u8Match = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i.exec(htmlContent);
        var mp4Match = /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/i.exec(htmlContent);
        if (m3u8Match) {
            streamUrl = m3u8Match[1];
        } else if (mp4Match) {
            streamUrl = mp4Match[1];
        } else {
            var b64Match = /(?:atob\(|base64,|data-link=|data-url=|source\s*[:=]\s*)["']([A-Za-z0-9+/=]{24,})["']/i.exec(htmlContent);
            if (b64Match) {
                var decoded = decodeBase64(b64Match[1]).trim();
                if (/^(https?:\/\/|\/)/i.test(decoded)) {
                    streamUrl = normalizeUrl(decoded);
                }
            }
        }

        detailObj.pageUrl = pageUrl || "";
        detailObj.streamUrl = streamUrl;

        return JSON.stringify(detailObj);
    } catch (error) {
        log("parseDetailResponse error: " + error);
        return "null";
    }
}
