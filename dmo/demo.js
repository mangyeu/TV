/**
 * ============================================================================
 * VAAPP COMPREHENSIVE PARSER SCRIPT CHO PHIMHDCSS (phimhdcss.com)
 * ============================================================================
 */
function getManifest() {
    return JSON.stringify({
        "id": "phimhdcs",
        "name": "PhimHDCS",
        "version": "1.1",
        "baseUrl": "https://phimhdcss.com",
        "iconUrl": "https://phimhdcss.com/favicon.ico",
        "isEnabled": true,
        "playerType": "exoplayer",
        "type": "MOVIE"
    });
}

// --- CÁC HÀM TIỆN ÍCH CƠ BẢN ---

function decodeBase64(str) {
    try {
        var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var result = '';
        str = String(str).replace(/[^A-Za-z0-9+\/=]/g, '');
        var len = str.length;
        for (var i = 0; i < len; i += 4) {
            var a = lookup.indexOf(str.charAt(i));
            var b = i + 1 < len ? lookup.indexOf(str.charAt(i + 1)) : 0;
            var c = i + 2 < len ? lookup.indexOf(str.charAt(i + 2)) : -1;
            var d = i + 3 < len ? lookup.indexOf(str.charAt(i + 3)) : -1;
            result += String.fromCharCode((a << 2) | (b >> 4));
            if (c !== -1) result += String.fromCharCode(((b & 15) << 4) | (c >> 2));
            if (d !== -1) result += String.fromCharCode(((c & 3) << 6) | d);
        }
        return result;
    } catch (e) { return null; }
}

function decodeChunksWithSalt(chunks, saltString) {
    var revBase64 = chunks.join('');
    var base64 = revBase64.split('').reverse().join('');
    if (saltString) base64 = base64.replace(saltString, '');
    return decodeBase64(base64);
}

function parseDynamicFilters(htmlContent) {
    var result = { category: [], country: [], year: [] };
    try {
        var selectRegex = /<select[^>]*name=["'](category|country|year)["'][^>]*>([\s\S]*?)<\/select>/gi;
        var selectMatch;
        while ((selectMatch = selectRegex.exec(htmlContent)) !== null) {
            var type = selectMatch[1].toLowerCase();
            var optionsHtml = selectMatch[2];
            var optRegex = /<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/gi;
            var optMatch;
            while ((optMatch = optRegex.exec(optionsHtml)) !== null) {
                var val = optMatch[1].trim();
                var label = optMatch[2].trim();
                if (val && val !== '' && val !== '0') {
                    result[type].push({ name: label, value: val });
                }
            }
        }
    } catch (e) {}
    return result;
}

// ============================================================================
// 1. CÁC HÀM XÂY DỰNG URL (URL BUILDERS)
// ============================================================================

function getUrlList(page, type, category, country, year) {
    var baseUrl = "https://phimhdcss.com";
    if (type && type !== 'all' && type !== '') {
        baseUrl += "/" + type; // ví dụ: /phim-le, /phim-bo
    } else {
        baseUrl += "/phim-moi";
    }

    var queryParams = [];
    if (category && category !== '') queryParams.push("category=" + encodeURIComponent(category));
    if (country && country !== '') queryParams.push("country=" + encodeURIComponent(country));
    if (year && year !== '') queryParams.push("year=" + encodeURIComponent(year));
    if (page && page > 1) queryParams.push("page=" + page);

    if (queryParams.length > 0) {
        baseUrl += "?" + queryParams.join("&");
    }
    return baseUrl;
}

function getUrlSearch(keyword, page) {
    var url = "https://phimhdcss.com/tim-kiem?keyword=" + encodeURIComponent(keyword);
    if (page && page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(url) {
    return url;
}

function getUrlCategories() {
    return "https://phimhdcss.com/";
}

function getUrlCountries() {
    return "https://phimhdcss.com/";
}

function getUrlYears() {
    return "https://phimhdcss.com/";
}

// ============================================================================
// 2. CÁC HÀM XỬ LÝ TRANG CHỦ & DANH MỤC CHÍNH
// ============================================================================

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim Mới", value: "phim-moi" },
        { name: "Phim Lẻ", value: "phim-le" },
        { name: "Phim Bộ", value: "phim-bo" },
        { name: "Hoạt Hình", value: "hoat-hinh" },
        { name: "TV Shows", value: "tv-shows" }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { title: "Phim Đề Cử", url: "https://phimhdcss.com/" },
        { title: "Phim Mới Cập Nhật", url: "https://phimhdcss.com/" },
        { title: "Phim Lẻ Hot", url: "https://phimhdcss.com/phim-le" },
        { title: "Phim Bộ Hot", url: "https://phimhdcss.com/phim-bo" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        supportCategories: true,
        supportCountries: true,
        supportYears: true,
        supportTypes: true
    });
}

// ============================================================================
// 3. GET MANIFEST & GIẢI MÃ LUỒNG PHIM
// ============================================================================

function getManifest(pageUrl, htmlContent) {
    try {
        var logMsg = typeof log === 'function' ? log : function(m) { console.log('[getManifest]', m); };
        logMsg("=== BẮT ĐẦU GET MANIFEST ===");
        logMsg("Page URL: " + pageUrl);

        if (!htmlContent) {
            logMsg("Lỗi: htmlContent trống.");
            return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
        }

        var detailResultStr = parseDetailResponse(htmlContent, pageUrl);
        var detailConfig;
        
        try {
            detailConfig = JSON.parse(detailResultStr);
        } catch (e) {
            logMsg("Lỗi parse JSON từ parseDetailResponse: " + e);
            return detailResultStr;
        }

        if (!detailConfig || !detailConfig.url) {
            logMsg("Không tìm thấy URL hợp lệ từ parseDetailResponse.");
            return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
        }

        if (!detailConfig.isEmbed) {
            logMsg("Thành công! Đã lấy được link stream trực tiếp: " + detailConfig.url);
            return JSON.stringify(detailConfig);
        }

        logMsg("Phát hiện link dạng Embed / trung gian: " + detailConfig.url);
        return JSON.stringify({
            url: detailConfig.url,
            isEmbed: true,
            postBody: detailConfig.postBody || null,
            headers: detailConfig.headers || {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://phimhdcss.com/"
            },
            subtitles: detailConfig.subtitles || []
        });

    } catch (error) {
        var logErr = typeof log === 'function' ? log : function(m) {};
        logErr("getManifest exception: " + error);
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseDetailResponse(htmlContent, pageUrl) {
    try {
        var saltMatch = /(?:const|let|var)\s+_0xS\s*=\s*["']([^"']+)["']/.exec(htmlContent);
        var saltString = saltMatch ? saltMatch[1] : "";

        var oxData = null;
        
        var realObjMatch = /(?:const|let|var)\s+realObj\s*=\s*JSON\.parse\(\s*atob\(\s*["']([^"']+)["']\s*\)\s*\)/i.exec(htmlContent);
        if (realObjMatch) {
            try {
                var decodedRealObj = decodeBase64(realObjMatch[1]);
                if (decodedRealObj) {
                    oxData = JSON.parse(decodedRealObj);
                    if (typeof log === 'function') log('PHIMHDCS_DEBUG Found realObj successfully');
                }
            } catch (e) {}
        }

        if (!oxData) {
            var dataMatch = /(?:const|let|var)\s+_0xData\s*=\s*(\{[\s\S]*?\})\s*;/.exec(htmlContent);
            if (dataMatch) {
                try {
                    var startIdx = dataMatch.index + dataMatch[0].indexOf('{');
                    var braceCount = 0;
                    var jsonEnd = -1;
                    for (var j = startIdx; j < htmlContent.length && j < startIdx + 100000; j++) {
                        if (htmlContent[j] === '{') braceCount++;
                        else if (htmlContent[j] === '}') {
                            braceCount--;
                            if (braceCount === 0) { jsonEnd = j + 1; break; }
                        }
                    }
                    if (jsonEnd > 0) {
                        var jsonStr = htmlContent.substring(startIdx, jsonEnd);
                        oxData = JSON.parse(jsonStr);
                        if (typeof log === 'function') log('PHIMHDCS_DEBUG Found fallback _0xData successfully');
                    }
                } catch (e) {}
            }
        }

        if (oxData) {
            var curId = null;
            var curIdPatterns = [
                /(?:const|let|var)\s+curId\s*=\s*['"]?(\d+)['"]?/,
                /(?:const|let|var)\s+episode\s*=\s*['"]?(\d+)['"]?/,
                /(?:const|let|var)\s+episode_id\s*=\s*['"]?(\d+)['"]?/,
                /(?:const|let|var)\s+currentEpisodeId\s*=\s*['"]?(\d+)['"]?/,
                /data-id="(\d+)"[^>]*class="[^"]*active[^"]*streaming-server/i,
                /class="[^"]*active[^"]*streaming-server[^"]*"[^>]*data-id="(\d+)"/i
            ];
            for (var pi = 0; pi < curIdPatterns.length; pi++) {
                var m = curIdPatterns[pi].exec(htmlContent);
                if (m) { curId = m[1]; break; }
            }

            var targetId = curId;

            if (!targetId && pageUrl) {
                var urlIdMatch = /(\d{5,})(?:\?|$|#)/.exec(pageUrl);
                if (!urlIdMatch) urlIdMatch = /-(\d{5,})$/.exec(pageUrl);
                if (urlIdMatch && oxData[urlIdMatch[1]]) {
                    targetId = urlIdMatch[1];
                }
            }

            if (!targetId) {
                var keys = [];
                for (var k in oxData) { if (oxData.hasOwnProperty(k)) keys.push(k); }
                if (keys.length > 0) targetId = keys[0];
            }

            if (targetId && oxData[targetId] && Array.isArray(oxData[targetId])) {
                var chunks = oxData[targetId];
                var playerUrl = decodeChunksWithSalt(chunks, saltString);

                if (playerUrl && playerUrl.indexOf("player.php?") !== -1) {
                    var matchLink = /[?&](?:link|url)=([^&]+)/.exec(playerUrl);
                    if (matchLink) {
                        playerUrl = decodeURIComponent(matchLink[1]);
                    }
                }
                
                if (playerUrl && playerUrl.indexOf('http') === 0) {
                    var isDirect = playerUrl.indexOf('.m3u8') !== -1 || playerUrl.indexOf('.mp4') !== -1;
                    return JSON.stringify({
                        url: playerUrl,
                        isEmbed: !isDirect,
                        mimeType: isDirect ? "application/x-mpegURL" : undefined,
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                            "Referer": "https://phimhdcss.com/"
                        },
                        subtitles: []
                    });
                }
            }
        }

        var iframeMatch = htmlContent.match(/<iframe[^>]*src="([^"]+)"/i);
        if (iframeMatch) {
            var embedUrl = iframeMatch[1];
            if (embedUrl.indexOf('//') === 0) embedUrl = "https:" + embedUrl;
            
            if (embedUrl.indexOf("player.php?") !== -1) {
                var matchLink = /[?&](?:link|url)=([^&]+)/.exec(embedUrl);
                if (matchLink) {
                    embedUrl = decodeURIComponent(matchLink[1]);
                }
            }

            if (embedUrl && embedUrl !== pageUrl && embedUrl.length > 5) {
                var isDirect = embedUrl.indexOf('.m3u8') !== -1 || embedUrl.indexOf('.mp4') !== -1;
                return JSON.stringify({
                    url: embedUrl,
                    isEmbed: !isDirect,
                    mimeType: isDirect ? "application/x-mpegURL" : undefined,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Referer": "https://phimhdcss.com/"
                    },
                    subtitles: []
                });
            }
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    } catch (error) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(htmlContent, url) {
    try {
        if (url.indexOf("do=getVideo") !== -1 || (htmlContent.indexOf("securedLink") !== -1 && htmlContent.indexOf("hls") !== -1)) {
            var jData = JSON.parse(htmlContent);
            var streamUrl = "";
            if (jData.securedLink) {
                streamUrl = jData.securedLink;
            } else if (jData.videoSource) {
                streamUrl = jData.videoSource;
            } else if (jData.videoSources && jData.videoSources.length > 0) {
                streamUrl = jData.videoSources[0].file;
            }
            
            var subtitles = [];
            var subMatch = /[?&]subs=([^&]+)/.exec(url);
            if (subMatch) {
                try {
                    subtitles = JSON.parse(decodeURIComponent(subMatch[1]));
                } catch(e) {}
            }
            
            if (streamUrl) {
                return JSON.stringify({
                    url: streamUrl,
                    isEmbed: false,
                    mimeType: "application/x-mpegURL",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Referer": "https://play.streamxemphimhd.site/"
                    },
                    subtitles: subtitles
                });
            } else {
                return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
            }
        }

        var embedId = null;
        var idMatch = /\/video\/([a-zA-Z0-9]+)/.exec(url);
        if (idMatch) {
            embedId = idMatch[1];
        }
        
        var subtitles = [];
        var match = htmlContent.match(/eval\((function\(p,a,c,k,e,d\)[\s\S]+?split\('\|'\),0,\{\}\))\)/);
        if (match) {
            var innerCode = match[1];
            try {
                var unpacked = eval("(" + innerCode + ")");
                var firePlayerIdMatch = /FirePlayer\(\s*["']([^"']+)["']/.exec(unpacked);
                if (firePlayerIdMatch) {
                    embedId = firePlayerIdMatch[1];
                }
                
                var tracksMatch = /"tracks"\s*:\s*(\[[\s\S]*?\])/.exec(unpacked);
                if (tracksMatch) {
                    var tracks = JSON.parse(tracksMatch[1]);
                    for (var i = 0; i < tracks.length; i++) {
                        var track = tracks[i];
                        if (track.kind === "captions" && track.file && track.label) {
                            subtitles.push({
                                lang: track.label,
                                url: track.file,
                                isAutoTranslated: false
                            });
                        }
                    }
                }
            } catch (e) {}
        }
        
        if (!embedId) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
        }
        
        var subtitlesQuery = encodeURIComponent(JSON.stringify(subtitles));
        var postUrl = "https://play.streamxemphimhd.site/player/index.php?data=" + embedId + "&do=getVideo&subs=" + subtitlesQuery;
        var postBody = "hash=" + embedId + "&r=https%3A%2F%2Fphimhdcss.com%2F";
        var headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": url,
            "Origin": "https://play.streamxemphimhd.site",
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest"
        };
        
        return JSON.stringify({
            url: postUrl,
            isEmbed: true,
            postBody: postBody,
            headers: headers,
            subtitles: []
        });
        
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

// ============================================================================
// 4. PARSER BỘ LỌC & DANH MỤC
// ============================================================================

function parseCategoriesResponse(htmlContent) {
    try {
        var filters = parseDynamicFilters(htmlContent);
        if (filters.category && filters.category.length > 0) return JSON.stringify(filters.category);

        var categories = [];
        var catPattern = /<a[^>]+href="https:\/\/phimhdcss\.com\/the-loai\/([^"]+)">([^<]+)<\/a>/gi;
        var match;
        while ((match = catPattern.exec(htmlContent)) !== null) {
            var slug = match[1];
            var name = match[2].trim();
            var exists = categories.some(function(c) { return c.value === slug; });
            if (!exists) categories.push({ name: name, value: slug });
        }
        return JSON.stringify(categories);
    } catch (e) { return "[]"; }
}

function parseCountriesResponse(htmlContent) {
    try {
        var filters = parseDynamicFilters(htmlContent);
        if (filters.country && filters.country.length > 0) return JSON.stringify(filters.country);

        var countries = [];
        var countryPattern = /<a[^>]+href="https:\/\/phimhdcss\.com\/quoc-gia\/([^"]+)">([^<]+)<\/a>/gi;
        var match;
        while ((match = countryPattern.exec(htmlContent)) !== null) {
            var slug = match[1];
            var name = match[2].trim();
            var exists = countries.some(function(c) { return c.value === slug; });
            if (!exists) countries.push({ name: name, value: slug });
        }
        return JSON.stringify(countries);
    } catch (e) { return "[]"; }
}

function parseYearsResponse(htmlContent) {
    try {
        var filters = parseDynamicFilters(htmlContent);
        if (filters.year && filters.year.length > 0) return JSON.stringify(filters.year);

        var years = [];
        for (var y = 2026; y >= 2000; y--) years.push({ name: y.toString(), value: y.toString() });
        return JSON.stringify(years);
    } catch (e) { return "[]"; }
}
