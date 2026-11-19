var BASE_URL = "https://missav.media/en";
var CDN_URL = "https://fourhoi.mrstcdn.store";

function trimStr(str) {
  return String(str == null ? "" : str).replace(/^\s+|\s+$/g, "");
}

function collapseSpaces(str) {
  return trimStr(String(str == null ? "" : str).replace(/\s+/g, " "));
}

function decodeEntities(str) {
  if (str == null) return "";
  return String(str)
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/ /g, " ");
}

function escapeRegExp(str) {
  return String(str).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

function cleanTitleText(raw, code) {
  var s = collapseSpaces(decodeEntities(raw));
  if (code) {
    var upperCode = String(code).toUpperCase();
    var rePrefix = new RegExp("^" + escapeRegExp(upperCode) + "\\s+", "i");
    s = trimStr(s.replace(rePrefix, ""));
  }
  return s;
}

function normalizeUrl(url, baseUrl) {
  var raw = trimStr(url);
  if (!raw || raw.indexOf("javascript:") === 0 || raw.indexOf("#") === 0) {
    return "";
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  if (raw.indexOf("//") === 0) {
    return "https:" + raw;
  }
  var root = trimStr(baseUrl || BASE_URL).replace(/\/+$/, "");
  if (raw.charAt(0) === "/") {
    return root.replace(/\/en$/i, "") + raw;
  }
  return root + "/" + raw.replace(/^\/+/, "");
}

function httpGetText(url, onSuccess, onError) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
          if (typeof onSuccess === "function") {
            onSuccess(xhr.responseText || "", xhr.status);
          }
        } else if (typeof onError === "function") {
          onError(new Error("HTTP status " + xhr.status + " for " + url));
        }
      }
    };
    xhr.onerror = function () {
      if (typeof onError === "function") {
        onError(new Error("Network error for " + url));
      }
    };
    xhr.send();
  } catch (err) {
    if (typeof onError === "function") {
      onError(err);
    }
  }
}

function getManifest() {
  return {
    id: "missav-media-en",
    name: "MissAV (EN)",
    version: "1.0.0",
    baseUrl: BASE_URL,
    cdnUrl: CDN_URL,
    locale: "en"
  };
}

function getHomeSections() {
  return [
    { id: "new-releases", title: "New Releases", path: "/release" },
    { id: "recent-update", title: "Recent update", path: "/new" },
    { id: "english-subtitle", title: "English subtitle", path: "/english-subtitle" },
    { id: "uncensored-leak", title: "Uncensored leak", path: "/uncensored-leak" },
    { id: "fc2", title: "FC2", path: "/fc2" },
    { id: "today-hot", title: "Most viewed today", path: "/today-hot" },
    { id: "weekly-hot", title: "Most viewed by week", path: "/weekly-hot" },
    { id: "monthly-hot", title: "Most viewed by month", path: "/monthly-hot" }
  ];
}

function getPrimaryCategories() {
  return [
    { id: "release", title: "New Releases", path: "/release" },
    { id: "new", title: "Recent update", path: "/new" },
    { id: "english-subtitle", title: "English subtitle", path: "/english-subtitle" },
    { id: "uncensored-leak", title: "Uncensored leak", path: "/uncensored-leak" },
    { id: "fc2", title: "FC2", path: "/fc2" },
    { id: "siro", title: "SIRO", path: "/siro" },
    { id: "luxu", title: "LUXU", path: "/luxu" },
    { id: "gana", title: "GANA", path: "/gana" },
    { id: "maan", title: "PRESTIGE PREMIUM", path: "/maan" },
    { id: "scute", title: "S-CUTE", path: "/scute" },
    { id: "ara", title: "ARA", path: "/ara" },
    { id: "heyzo", title: "HEYZO", path: "/heyzo" },
    { id: "tokyohot", title: "Tokyo Hot", path: "/tokyohot" },
    { id: "1pondo", title: "1pondo", path: "/1pondo" },
    { id: "caribbeancom", title: "Caribbeancom", path: "/caribbeancom" },
    { id: "caribbeancompr", title: "Caribbeancompr", path: "/caribbeancompr" },
    { id: "10musume", title: "10musume", path: "/10musume" },
    { id: "pacopacomama", title: "pacopacomama", path: "/pacopacomama" },
    { id: "gachinco", title: "Gachinco", path: "/gachinco" },
    { id: "xxxav", title: "XXX-AV", path: "/xxxav" },
    { id: "marriedslash", title: "Married Slash", path: "/marriedslash" },
    { id: "naughty4610", title: "Naughty 4610", path: "/naughty4610" },
    { id: "naughty0930", title: "Naughty 0930", path: "/naughty0930" },
    { id: "madou", title: "Madou", path: "/madou" },
    { id: "twav", title: "TWAV", path: "/twav" },
    { id: "furuke", title: "Furuke", path: "/furuke" },
    { id: "klive", title: "Korean Live", path: "/klive" },
    { id: "clive", title: "Chinese Live", path: "/clive" }
  ];
}

function getFilterConfig() {
  return {
    groups: [
      { id: "jav", title: "Watch JAV", path: "/new" },
      { id: "amateur", title: "Amateur", path: "/siro" },
      { id: "uncensored", title: "Uncensored", path: "/uncensored-leak" },
      { id: "asia-av", title: "Asia AV", path: "/madou" }
    ],
    directories: [
      { id: "actresses", title: "Actress list", path: "/actresses" },
      { id: "actress-ranking", title: "Actress ranking", path: "/actresses/ranking" },
      { id: "genres", title: "Genre", path: "/genres" },
      { id: "makers", title: "Maker", path: "/makers" }
    ]
  };
}

function appendPageQuery(url, page) {
  var p = parseInt(page, 10);
  if (!p || p < 1) {
    p = 1;
  }
  if (p === 1) {
    return url;
  }
  return url + (url.indexOf("?") === -1 ? "?page=" + p : "&page=" + p);
}

function getUrlList(categoryOrSection, page) {
  var path = "";
  if (!categoryOrSection) {
    path = "";
  } else if (typeof categoryOrSection === "string") {
    path = categoryOrSection;
  } else {
    path = categoryOrSection.path || categoryOrSection.url || categoryOrSection.id || "";
  }

  var url = BASE_URL;
  if (path) {
    if (/^https?:\/\//i.test(path)) {
      url = path;
    } else {
      var cleanPath = String(path).replace(/^\/+/, "");
      if (cleanPath.indexOf("en/") === 0) {
        cleanPath = cleanPath.substring(3);
      }
      url = BASE_URL + "/" + cleanPath;
    }
  }
  return appendPageQuery(url, page);
}

function getUrlSearch(keyword, page) {
  var q = encodeURIComponent(collapseSpaces(keyword));
  return appendPageQuery(BASE_URL + "/search/" + q, page);
}

function getUrlDetail(itemOrId) {
  var id = "";
  if (typeof itemOrId === "string") {
    id = itemOrId;
  } else if (itemOrId) {
    if (itemOrId.url) {
      return normalizeUrl(itemOrId.url, BASE_URL);
    }
    id = itemOrId.id || itemOrId.dvd_id || itemOrId.slug || "";
  }
  id = trimStr(id).replace(/^\/+|\/+$/g, "");
  if (!id) return "";
  if (/^https?:\/\//i.test(id)) return id;
  if (id.indexOf("en/") === 0) {
    return BASE_URL + "/" + id.substring(3);
  }
  return BASE_URL + "/" + id;
}

function getUrlCategories() {
  return BASE_URL + "/genres";
}

function getUrlCountries() {
  return BASE_URL + "/makers";
}

function getUrlYears() {
  return BASE_URL + "/release";
}

function parseListResponse(html, baseUrl) {
  var text = String(html == null ? "" : html);
  var items = [];
  var seen = {};
  var root = trimStr(baseUrl || BASE_URL).replace(/\/+$/, "");

  var blocks = text.split(/class="thumbnail group"/i);
  for (var i = 1; i < blocks.length; i++) {
    var block = blocks[i];

    if (block.indexOf("data-src=") === -1 && block.indexOf("/en/") === -1) {
      continue;
    }

    var hrefMatch = block.match(/href="(https?:\/\/[^"]*\/en\/([^"#?]+)|\/en\/([^"#?]+))"/i);
    if (!hrefMatch) {
      continue;
    }

    var rawHref = hrefMatch[1];
    var slug = trimStr(hrefMatch[2] || hrefMatch[3] || "").replace(/^\/+|\/+$/g, "");
    if (!slug || slug.indexOf("javascript:") === 0) {
      continue;
    }

    var fullUrl = normalizeUrl(rawHref, root);
    if (!fullUrl || seen[fullUrl]) {
      continue;
    }
    seen[fullUrl] = true;

    var imgMatch = block.match(/<img[^>]*\bdata-src="([^"]+)"[^>]*>/i);
    var cover = imgMatch ? normalizeUrl(decodeEntities(imgMatch[1]), root) : "";

    var vidMatch = block.match(/<video[^>]*\bdata-src="([^"]+)"[^>]*>/i);
    var preview = vidMatch ? normalizeUrl(decodeEntities(vidMatch[1]), root) : "";

    var titleMatch = block.match(/<a[^>]*class="[^"]*text-secondary[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
    var rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, " ") : "";
    if (!trimStr(rawTitle)) {
      var altMatch = block.match(/<img[^>]*\balt="([^"]*)"[^>]*>/i);
      rawTitle = altMatch ? altMatch[1] : slug;
    }

    var durMatch = block.match(/>\s*(\d+:\d{2}:\d{2})\s*</);
    var duration = durMatch ? durMatch[1] : "";

    var isUncensored = /Uncensored/i.test(block) || /-uncensored-leak/i.test(slug);

    items.push({
      id: slug,
      title: cleanTitleText(rawTitle, slug),
      url: fullUrl,
      cover: cover,
      preview: preview,
      duration: duration,
      isUncensored: isUncensored
    });
  }

  return items;
}

function parseSearchResponse(html, baseUrl) {
  return parseListResponse(html, baseUrl);
}

function parseMovieDetail(html, pageUrl) {
  var text = String(html == null ? "" : html);
  var h1Match = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  var ogTitleMatch = text.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
  var ogImageMatch = text.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
  var posterMatch = text.match(/<video[^>]*\bposter="([^"]*)"[^>]*>/i);

  var title = "";
  if (h1Match && trimStr(h1Match[1].replace(/<[^>]+>/g, " "))) {
    title = collapseSpaces(decodeEntities(h1Match[1].replace(/<[^>]+>/g, " ")));
  } else if (ogTitleMatch) {
    title = collapseSpaces(decodeEntities(ogTitleMatch[1]));
  }

  var cover = "";
  if (posterMatch && trimStr(posterMatch[1])) {
    cover = normalizeUrl(decodeEntities(posterMatch[1]), pageUrl);
  } else if (ogImageMatch && trimStr(ogImageMatch[1])) {
    cover = normalizeUrl(decodeEntities(ogImageMatch[1]), pageUrl);
  }

  var streams = [];
  var seenStream = {};

  function addStream(u, quality) {
    var cleanU = normalizeUrl(decodeEntities(u), pageUrl);
    if (!cleanU || seenStream[cleanU]) return;
    seenStream[cleanU] = true;
    streams.push({
      url: cleanU,
      quality: quality || "auto",
      type: cleanU.indexOf(".m3u8") !== -1 ? "hls" : "video"
    });
  }

  var m3u8Matches = text.match(/https?:\/\/[^"'\\\s<>]+\.m3u8[^"'\\\s<>]*/gi) || [];
  for (var i = 0; i < m3u8Matches.length; i++) {
    addStream(m3u8Matches[i], "auto");
  }

  var mp4Matches = text.match(/https?:\/\/[^"'\\\s<>]+\.mp4[^"'\\\s<>]*/gi) || [];
  for (var j = 0; j < mp4Matches.length; j++) {
    if (mp4Matches[j].indexOf("/preview.mp4") === -1) {
      addStream(mp4Matches[j], "mp4");
    }
  }

  var embedUrls = [];
  var seenEmbed = {};
  var iframeMatches = text.match(/<iframe[^>]*\b(?:src|data-src)="([^"]+)"[^>]*>/gi) || [];
  for (var k = 0; k < iframeMatches.length; k++) {
    var srcM = iframeMatches[k].match(/\b(?:src|data-src)="([^"]+)"/i);
    if (srcM && srcM[1]) {
      var eUrl = normalizeUrl(decodeEntities(srcM[1]), pageUrl);
      if (eUrl && !seenEmbed[eUrl]) {
        seenEmbed[eUrl] = true;
        embedUrls.push(eUrl);
      }
    }
  }

  return {
    title: title,
    cover: cover,
    streams: streams,
    embedUrls: embedUrls
  };
}

function parseDetailResponse(html, pageUrl) {
  return parseMovieDetail(html, pageUrl);
}

function parseEmbedResponse(html, embedUrl) {
  return parseMovieDetail(html, embedUrl);
}

function resolveStreamFromDetail(detailOrUrl, onSuccess, onError, depth, visited) {
  var currentDepth = typeof depth === "number" ? depth : 0;
  var maxDepth = 4;
  var seenPages = visited || {};

  if (currentDepth > maxDepth) {
    if (typeof onError === "function") {
      onError(new Error("Max recursion depth reached while resolving stream"));
    }
    return;
  }

  if (detailOrUrl && typeof detailOrUrl === "object" && detailOrUrl.streams && detailOrUrl.streams.length > 0) {
    if (typeof onSuccess === "function") {
      onSuccess(detailOrUrl.streams[0], detailOrUrl.streams);
    }
    return;
  }

  var targetUrl = typeof detailOrUrl === "string" ? detailOrUrl : getUrlDetail(detailOrUrl);
  targetUrl = normalizeUrl(targetUrl, BASE_URL);

  if (!targetUrl) {
    if (typeof onError === "function") {
      onError(new Error("Invalid detail or stream URL"));
    }
    return;
  }

  if (/\.(m3u8|mp4)(\?.*)?$/i.test(targetUrl)) {
    if (typeof onSuccess === "function") {
      onSuccess({
        url: targetUrl,
        quality: "auto",
        type: targetUrl.indexOf(".m3u8") !== -1 ? "hls" : "video"
      }, [{
        url: targetUrl,
        quality: "auto",
        type: targetUrl.indexOf(".m3u8") !== -1 ? "hls" : "video"
      }]);
    }
    return;
  }

  if (seenPages[targetUrl]) {
    if (typeof onError === "function") {
      onError(new Error("Circular URL detected while resolving stream: " + targetUrl));
    }
    return;
  }
  seenPages[targetUrl] = true;

  httpGetText(targetUrl, function (html) {
    var parsed = parseMovieDetail(html, targetUrl);
    if (parsed.streams && parsed.streams.length > 0) {
      if (typeof onSuccess === "function") {
        onSuccess(parsed.streams[0], parsed.streams);
      }
      return;
    }

    if (parsed.embedUrls && parsed.embedUrls.length > 0) {
      var idx = 0;
      function tryNextEmbed() {
        if (idx >= parsed.embedUrls.length) {
          if (typeof onError === "function") {
            onError(new Error("No playable stream found in embed URLs"));
          }
          return;
        }
        var nextEmbed = parsed.embedUrls[idx];
        idx += 1;
        resolveStreamFromDetail(nextEmbed, onSuccess, function () {
          tryNextEmbed();
        }, currentDepth + 1, seenPages);
      }
      tryNextEmbed();
      return;
    }

    if (typeof onError === "function") {
      onError(new Error("Stream not found in response: " + targetUrl));
    }
  }, function (err) {
    if (typeof onError === "function") {
      onError(err);
    }
  });
}
