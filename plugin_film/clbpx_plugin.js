/*
 * TVHAY.BUZZ - VAAPP PLUGIN
 * Adapted to the VAApp plugin contract used by 123avupdate-new.js.
 * Version 1.0.0
 *
 * Notes:
 * - The public homepage is indexed, but direct HTTP inspection may be blocked by
 *   Cloudflare/403. Parsers therefore support common HTML card, WordPress and
 *   JWPlayer/HTML5 player layouts instead of assuming one brittle DOM template.
 * - This plugin only extracts publicly exposed page/player URLs. It does not
 *   bypass DRM, authentication, paywalls or other access controls.
 */

var DEBUG_MODE = true;
var LOG_PREFIX = "[TVHAY]";
var BASE_URL = "https://tvhay.buzz";
var DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
  "Referer": BASE_URL + "/"
};

function log(level, msg, data) {
  if (!DEBUG_MODE) return;
  var p = LOG_PREFIX + "[" + level + "][" + new Date().toISOString().substring(11, 19) + "]";
  if (typeof data !== "undefined") console.log(p, msg, data);
  else console.log(p, msg);
}
function logInfo(m,d){log("INFO",m,d);}
function logWarn(m,d){log("WARN",m,d);}
function logError(m,d){log("ERROR",m,d);}
function logStep(m,d){log("STEP",m,d);}
function setDebugMode(v){DEBUG_MODE=!!v; logInfo("DEBUG_MODE="+DEBUG_MODE);}

function safeJson(value, fallback) {
  try { return JSON.parse(value); } catch (e) { return fallback; }
}
function decodeEntities(s) {
  if (!s) return "";
  return String(s)
    .replace(/&nbsp;|&#160;/gi," ")
    .replace(/&amp;/gi,"&")
    .replace(/&quot;/gi,'"')
    .replace(/&#0*39;|&apos;/gi,"'")
    .replace(/&lt;/gi,"<").replace(/&gt;/gi,">")
    .replace(/&#(\d+);/g,function(_,n){return String.fromCharCode(parseInt(n,10));})
    .replace(/&#x([0-9a-f]+);/gi,function(_,n){return String.fromCharCode(parseInt(n,16));});
}
function stripTags(s) {
  return decodeEntities(String(s || "").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim());
}
function attr(tag, name) {
  var re = new RegExp("\\b"+name+"\\s*=\\s*([\\\"'])([\\s\\S]*?)\\1","i");
  var m = String(tag || "").match(re);
  return m ? decodeEntities(m[2].replace(/\\\//g,"/")) : "";
}
function absoluteUrl(url, base) {
  if (!url) return "";
  url = decodeEntities(String(url).trim()).replace(/\\\//g,"/");
  if (/^(data:|javascript:|blob:)/i.test(url)) return url;
  if (url.indexOf("//") === 0) return "https:" + url;
  if (/^https?:\/\//i.test(url)) return url;
  var root = base || BASE_URL;
  if (url.charAt(0) === "#") return root + url;
  if (url.charAt(0) === "?") return root + url;
  if (url.charAt(0) !== "/") url = "/" + url;
  return root.replace(/\/$/,"") + url;
}
function getMeta(html, key) {
  var h = String(html || "");
  var esc = key.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  var patterns = [
    new RegExp("<meta[^>]*(?:property|name)=[\"\\\']"+esc+"[\"\\\'][^>]*content=[\"\\\']([^\"\\\']*)[\"\\\'][^>]*>","i"),
    new RegExp("<meta[^>]*content=[\"\\\']([^\"\\\']*)[\"\\\'][^>]*(?:property|name)=[\"\\\']"+esc+"[\"\\\'][^>]*>","i")
  ];
  for (var i=0;i<patterns.length;i++){var m=h.match(patterns[i]);if(m)return decodeEntities(m[1]);}
  return "";
}
function requestHtml(url) {
  try {
    var r = httpRequest(url,{method:"GET",headers:DEFAULT_HEADERS});
    if (r && r.isSuccessful && r.body) return r.body;
    logWarn("HTTP không thành công",{url:url,status:r?r.status:"null"});
  } catch(e) { logError("requestHtml lỗi",e.message); }
  return "";
}
function normalizePath(path) {
  if (!path) return "/";
  if (/^https?:\/\//i.test(path)) return path;
  return path.charAt(0)==="/"?path:"/"+path;
}
function extractPageNumber(html) {
  var m = String(html||"").match(/[?&]paged?=(\d+)/i) || String(html||"").match(/\/page\/(\d+)\//i);
  return m ? parseInt(m[1],10) : 1;
}
function getManifest() {
  return JSON.stringify({
    id:"tvhay", name:"TVHAY", version:"1.0.0", baseUrl:BASE_URL,
    author:"VAApp Community", referrer:BASE_URL+"/", imageReferer:BASE_URL+"/",
    iconUrl:"https://tvhay.buzz/favicon.png", isEnabled:true, isAdult:false, type:"VIDEO",
    layoutType:"HORIZONTAL", playerType:"exoplayer", subtitleCat:true,
    debug:DEBUG_MODE, adblock:true
  });
}
function getHomeSections() {
  return JSON.stringify([
    {slug:"/",title:"Phim mới cập nhật",type:"Horizontal",path:""},
    {slug:"/phim-bo-moi",title:"Phim bộ mới",type:"Horizontal",path:""},
    {slug:"/phim-le-moi",title:"Phim lẻ mới",type:"Horizontal",path:""},
    {slug:"/phim-chieu-rap",title:"Phim chiếu rạp",type:"Horizontal",path:""},
    {slug:"/hoat-hinh",title:"Phim hoạt hình",type:"Horizontal",path:""}
  ]);
}
function getPrimaryCategories() {
  return JSON.stringify([
    {name:"Trang chủ",slug:"/"},
    {name:"Phim mới",slug:"/phim-moi"},
    {name:"Phim bộ",slug:"/phim-bo-moi"},
    {name:"Phim lẻ",slug:"/phim-le-moi"},
    {name:"Phim chiếu rạp",slug:"/phim-chieu-rap"},
    {name:"Hoạt hình",slug:"/hoat-hinh"},
    {name:"Thể loại",slug:"/the-loai"},
    {name:"Quốc gia",slug:"/quoc-gia"},
    {name:"Năm phát hành",slug:"/nam-phat-hanh"}
  ]);
}
function getFilterConfig() {
  return JSON.stringify({
    sort:[
      {name:"Mới cập nhật",value:"latest"},
      {name:"Mới nhất",value:"new"},
      {name:"Xem nhiều",value:"views"},
      {name:"Đánh giá cao",value:"rating"}
    ],
    category:[
      {name:"Tất cả phim",value:"/"},
      {name:"Phim bộ",value:"/phim-bo-moi"},
      {name:"Phim lẻ",value:"/phim-le-moi"},
      {name:"Chiếu rạp",value:"/phim-chieu-rap"},
      {name:"Hoạt hình",value:"/hoat-hinh"}
    ],
    type:[
      {name:"Tất cả",value:""},
      {name:"Phim bộ",value:"series"},
      {name:"Phim lẻ",value:"single"}
    ],
    year:(function(){var a=[];for(var y=new Date().getFullYear();y>=1990;y--)a.push({name:String(y),value:String(y)});return a;})()
  });
}
function getUrlList(slug, filtersJson) {
  var f=safeJson(filtersJson||"{}",{}), path=normalizePath(slug||"/");
  if (path.indexOf("http")===0) return path;
  var params=[];
  if(f.page && !/\/page\/\d+\//.test(path)) path=path.replace(/\/$/,"")+"/page/"+parseInt(f.page,10)+"/";
  if(f.year) params.push("year="+encodeURIComponent(f.year));
  if(f.sort && f.sort!=="latest") params.push("orderby="+encodeURIComponent(f.sort));
  if(f.type) params.push("type="+encodeURIComponent(f.type));
  return BASE_URL+path+(params.length?(path.indexOf("?")>=0?"&":"?")+params.join("&"):"");
}
function getUrlSearch(keyword, filtersJson) {
  var f=safeJson(filtersJson||"{}",{}), p="/?s="+encodeURIComponent(keyword||"");
  if(f.page && parseInt(f.page,10)>1) p+="&paged="+parseInt(f.page,10);
  if(f.year) p+="&year="+encodeURIComponent(f.year);
  return BASE_URL+p;
}
function getUrlDetail(slug, datasend) {
  if(datasend){var d=safeJson(datasend,null);if(d&&d.url)return d.url;if(d&&d.id&&/^https?:/.test(d.id))return d.id;}
  if(!slug)return BASE_URL;
  return absoluteUrl(slug);
}
function getUrlCategories(){return BASE_URL+"/the-loai";}
function getUrlCountries(){return BASE_URL+"/quoc-gia";}
function getUrlYears(){return BASE_URL+"/nam-phat-hanh";}

// Extract likely movie cards. A link is treated as a movie only when it has a
// usable title and image or its URL resembles a movie permalink.
function parseCards(html, base) {
  var out=[], seen={};
  var h=String(html||"");
  var cardRe=/<(?:article|div|li)[^>]*(?:class|id)=["'][^"']*(?:item|movie|film|poster|thumb|entry|video|film-item|movie-item)[^"']*["'][^>]*>[\s\S]*?<\/(?:article|div|li)>/gi;
  var chunks=[], m;
  while((m=cardRe.exec(h))!==null){chunks.push(m[0]);if(chunks.length>400)break;}
  // Some templates do not wrap each card with a predictable class; inspect
  // individual anchors as a resilient fallback.
  if(!chunks.length){var aRe=/<a\b[^>]*href=["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi;while((m=aRe.exec(h))!==null)chunks.push(m[0]);}
  for(var i=0;i<chunks.length;i++){
    var c=chunks[i], am=c.match(/<a\b[^>]*>/i); if(!am)continue;
    var href=attr(am[0],"href"); if(!href)continue;
    var title=attr(am[0],"title")||attr(am[0],"aria-label");
    if(!title){var tm=c.match(/<(?:h[1-6]|strong|b)[^>]*>([\s\S]*?)<\/(?:h[1-6]|strong|b)>/i);if(tm)title=stripTags(tm[1]);}
    if(!title){var imgt=c.match(/<img\b[^>]*>/i);if(imgt)title=attr(imgt[0],"alt");}
    if(!title)title=stripTags(c);
    title=stripTags(title);
    var imgm=c.match(/<(?:img|source)\b[^>]*>/i), poster="";
    if(imgm)poster=attr(imgm[0],"data-src")||attr(imgm[0],"data-lazy-src")||attr(imgm[0],"data-original")||attr(imgm[0],"src")||attr(imgm[0],"srcset").split(",")[0].trim().split(" ")[0];
    if(!poster){var bg=c.match(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/i);if(bg)poster=bg[1];}
    var url=absoluteUrl(href,base), key=url.toLowerCase();
    if(!title||title.length<2||title.length>220||!/^https?:/i.test(url)||seen[key])continue;
    var movieLike=/phim|film|movie|watch|xem|tap|episode|\d{4}/i.test(url);
    if(!poster&&!movieLike)continue;
    seen[key]=true;
    var desc="";
    var dm=c.match(/<(?:span|div|p)[^>]*class=["'][^"']*(?:quality|episode|year|status|views|meta)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    if(dm)desc=stripTags(dm[1]);
    out.push({id:url,title:title,posterUrl:absoluteUrl(poster,base),backdropUrl:absoluteUrl(poster,base),description:desc,year:(title.match(/\b(19|20)\d{2}\b/)||[])[0]||0,quality:"HD",episode_current:desc||"",lang:"",previewUrl:""});
  }
  return out;
}
function parseListResponse(html, apiUrl, datasend) {
  logStep("parseListResponse",{url:apiUrl,length:(html||"").length});
  var items=parseCards(html,apiUrl||BASE_URL);
  // Remove obvious navigation/category links accidentally collected.
  items=items.filter(function(x){return !/(the-loai|quoc-gia|nam-phat-hanh|dang-nhap|lien-he|gioi-thieu)(\/|$)/i.test(x.id);});
  var page=extractPageNumber(html);
  var pages=page;
  var pageMatches=String(html||"").match(/(?:paged?|page)=(\d+)|\/page\/(\d+)\//gi)||[];
  for(var i=0;i<pageMatches.length;i++){var n=parseInt((pageMatches[i].match(/\d+/)||[])[0],10);if(n>pages)pages=n;}
  return JSON.stringify({items:items,pagination:{currentPage:page,totalPages:Math.max(page,pages),totalItems:items.length,itemsPerPage:items.length||20}});
}
function parseSearchResponse(html, apiUrl, datasend){return parseListResponse(html,apiUrl,datasend);}

function extractJsonObjects(html) {
  var found=[], patterns=[
    /(?:sources|file|hls|playlist)\s*[:=]\s*(\[[\s\S]*?\])/gi,
    /(?:player_[\w]+|jwplayer\([^)]*\))\s*\.[\s\S]{0,100}?setup\s*\(\s*(\{[\s\S]*?\})\s*\)/gi,
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  ];
  for(var p=0;p<patterns.length;p++){var m;while((m=patterns[p].exec(String(html||"")))!==null){found.push(m[1]);if(found.length>30)break;}}
  return found;
}
function decodeEscapedUrl(s){return String(s||"").replace(/\\\//g,"/").replace(/\\u0026/gi,"&").replace(/&amp;/g,"&").replace(/\\x3a/gi,":").replace(/\\x2f/gi,"/").replace(/\\n/g,"").replace(/\\r/g,"");}
function detectMime(url, explicit) {
  if(explicit)return explicit;
  var u=String(url||"").toLowerCase().split("?")[0].split("#")[0];
  if(/\.m3u8$/.test(u))return "application/x-mpegURL";
  if(/\.mpd$/.test(u))return "application/dash+xml";
  if(/\.mp4$/.test(u))return "video/mp4";
  if(/\.webm$/.test(u))return "video/webm";
  if(/\.mkv$/.test(u))return "video/x-matroska";
  if(/\.mp3$/.test(u))return "audio/mpeg";
  return "application/x-mpegURL";
}
function parsePlayerSources(html, pageUrl) {
  var h=decodeEscapedUrl(html||""), sources=[], seen={};
  function add(url,type,label,headers){
    url=decodeEscapedUrl(url).replace(/["'<>\\\s]+$/g,"");
    if(!url||/^(blob:|data:|javascript:)/i.test(url))return;
    url=absoluteUrl(url,pageUrl||BASE_URL);
    if(!/^https?:\/\//i.test(url)||seen[url])return;
    seen[url]=true;
    sources.push({url:url,mimeType:detectMime(url,type),name:label||("Server "+(sources.length+1)),headers:headers||{"Referer":pageUrl||BASE_URL+"/","User-Agent":DEFAULT_HEADERS["User-Agent"]}});
  }
  // HTML5 video/source tags
  var tagRe=/<(?:video|source)\b[^>]*>/gi,m;
  while((m=tagRe.exec(h))!==null){var u=attr(m[0],"src")||attr(m[0],"data-src");var typ=attr(m[0],"type");if(u)add(u,typ,"HTML5");}
  // iframe/embed sources are returned as embeds, not mislabelled as HLS.
  var ifrRe=/<iframe\b[^>]*>/gi;
  while((m=ifrRe.exec(h))!==null){var iu=attr(m[0],"src")||attr(m[0],"data-src");if(iu)add(iu,"","Embed");}
  // Common JS player config keys. Avoid collecting poster images.
  var urlRe=/(?:file|src|url|hls|m3u8|mp4)\s*[:=]\s*["']((?:https?:)?\/\/[^"']+|\/[^"']+)["']/gi;
  while((m=urlRe.exec(h))!==null){var candidate=decodeEscapedUrl(m[1]);if(/\.(?:m3u8|mp4|mpd|webm|mkv)(?:[?#]|$)/i.test(candidate)||/\.php\?.*(?:id|file|url)=/i.test(candidate))add(candidate,"", "Player");}
  // HLS/DASH URLs can be nested in escaped JSON or script strings.
  var directRe=/(https?:\\?\/\\?\/[^\s"'<>\\]+?\.(?:m3u8|mpd|mp4|webm|mkv)(?:\?[^\s"'<>\\]*)?)/gi;
  while((m=directRe.exec(h))!==null)add(m[1],"","Direct source");
  return sources;
}
function parseMovieDetail(html, apiUrl, datasend) {
  var h=String(html||""), title=getMeta(h,"og:title")||getMeta(h,"twitter:title"), poster=getMeta(h,"og:image")||getMeta(h,"twitter:image"), desc=getMeta(h,"og:description")||getMeta(h,"description");
  var canonical=(h.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)||[])[1]||apiUrl||"";
  if(!title){var t=h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);if(t)title=stripTags(t[1]);}
  if(!poster){var im=h.match(/<(?:img|meta)\b[^>]*(?:property=["']og:image["']|class=["'][^"']*(?:poster|thumb|cover)[^"']*["'])[^>]*>/i);if(im)poster=attr(im[0],"src")||attr(im[0],"content")||attr(im[0],"data-src");}
  poster=absoluteUrl(poster,apiUrl||BASE_URL);
  var year=(h.match(/(?:Năm phát hành|Năm|Year)[\s\S]{0,100}?(20\d{2}|19\d{2})/i)||[])[1]||((title.match(/\b(19|20)\d{2}\b/)||[])[0]||0);
  var genres=[],actors=[];
  var genreRe=/<a\b[^>]*href=["'][^"']*(?:the-loai|genre)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, mm;
  while((mm=genreRe.exec(h))!==null){var g=stripTags(mm[1]);if(g&&genres.indexOf(g)<0)genres.push(g);}
  var actorRe=/<a\b[^>]*href=["'][^"']*(?:dien-vien|actor|cast)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  while((mm=actorRe.exec(h))!==null){var a=stripTags(mm[1]);if(a&&actors.indexOf(a)<0)actors.push(a);}
  // Episode anchors: retain links in episode/playlist containers; broad fallback
  // only when the page has an explicit episode label.
  var episodes=[], epSeen={};
  var epRe=/<a\b[^>]*(?:href|data-href)=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while((mm=epRe.exec(h))!==null){var full=mm[0], href=mm[1], label=stripTags(mm[2])||attr(full,"title");
    if(!href||!label||!/(?:tap|tập|episode|full|server|vietsub|thuyet-minh|long-tieng)/i.test(label+" "+full))continue;
    var eu=absoluteUrl(href,apiUrl||BASE_URL);if(epSeen[eu]||eu===canonical)continue;epSeen[eu]=true;
    episodes.push({id:eu,name:label,slug:"episode-"+(episodes.length+1)});
  }
  var sources=parsePlayerSources(h,apiUrl||BASE_URL);
  var servers=[];
  if(sources.length){var eps=[];for(var i=0;i<sources.length;i++)eps.push({id:sources[i].url,name:sources[i].name,slug:"source-"+(i+1),mimeType:sources[i].mimeType,headers:sources[i].headers,isEmbed:/^Embed$/.test(sources[i].name)});servers.push({name:"TVHAY Player",episodes:eps});}
  // Some sites keep player config in JSON script blocks; parse common object fields.
  if(!servers.length){var raw=extractJsonObjects(h);for(var r=0;r<raw.length;r++){var obj=safeJson(raw[r],null);if(!obj)continue;var arr=Array.isArray(obj)?obj:(obj.sources||obj.file?[].concat(obj.sources||[{file:obj.file,type:obj.type}]):[]);for(var j=0;j<arr.length;j++){var f=arr[j].file||arr[j].src||arr[j].url;if(f){var u=absoluteUrl(f,apiUrl||BASE_URL);servers.push({name:obj.label||"TVHAY Player",episodes:[{id:u,name:arr[j].label||"Phát phim",slug:"source-"+(j+1),mimeType:detectMime(u,arr[j].type),headers:{"Referer":apiUrl||BASE_URL+"/"}}]});}}if(servers.length)break;}}
  return JSON.stringify({id:canonical,title:stripTags(title||"TVHAY"),posterUrl:poster,backdropUrl:poster,description:stripTags(desc),year:parseInt(year,10)||0,rating:0,quality:"HD",servers:servers,episodes:episodes,episode_current:episodes.length?episodes.length+" tập":(servers.length?"Full":"Chưa có nguồn"),lang:"",category:genres.join(", "),casts:actors.join(", "),previewUrl:""});
}
function parseDetailResponse(htmlContent, apiUrl, datasend) {
  var h=String(htmlContent||""), url="", isEmbed=false, explicitType="";
  if(datasend){var d=safeJson(datasend,null);if(d&&d.url)return JSON.stringify({url:d.url,isEmbed:!!d.isEmbed,headers:d.headers||{"Referer":apiUrl||BASE_URL+"/","User-Agent":DEFAULT_HEADERS["User-Agent"]},mimeType:d.mimeType||detectMime(d.url),subtitles:d.subtitles||[]});}
  var src=parsePlayerSources(h,apiUrl||BASE_URL);
  if(src.length){url=src[0].url;explicitType=src[0].mimeType;isEmbed=src[0].name==="Embed";}
  if(!url){var iframe=h.match(/<iframe\b[^>]*src=["']([^"']+)["']/i);if(iframe){url=absoluteUrl(iframe[1],apiUrl||BASE_URL);isEmbed=true;}}
  if(!url){var m=h.match(/(https?:\\?\/\\?\/[^\s"'<>]+?\.(?:m3u8|mpd|mp4|webm|mkv)(?:\?[^\s"'<>]*)?)/i);if(m)url=decodeEscapedUrl(m[1]);}
  var subs=[], subRe=/<track\b[^>]*>/gi, sm;
  while((sm=subRe.exec(h))!==null){var su=attr(sm[0],"src");if(su)subs.push({lang:attr(sm[0],"srclang")||"vi",label:attr(sm[0],"label")||"Phụ đề",url:absoluteUrl(su,apiUrl||BASE_URL)});}
  return JSON.stringify({url:url,isEmbed:isEmbed,headers:{"Referer":apiUrl||BASE_URL+"/","User-Agent":DEFAULT_HEADERS["User-Agent"]},mimeType:explicitType||detectMime(url),subtitles:subs});
}
function parseEmbedResponse(html, sourceUrl) {
  var result=parseDetailResponse(html,sourceUrl,null);
  var d=safeJson(result,{});
  if(d.url)return JSON.stringify(d);
  var iframe=String(html||"").match(/<iframe\b[^>]*src=["']([^"']+)["']/i);
  if(iframe)return JSON.stringify({url:absoluteUrl(iframe[1],sourceUrl||BASE_URL),isEmbed:true,headers:{"Referer":sourceUrl||BASE_URL+"/","User-Agent":DEFAULT_HEADERS["User-Agent"]}});
  return JSON.stringify({url:"",isEmbed:false,mimeType:"application/x-mpegURL",error:false});
}
function parseCategoriesResponse(html, apiUrl) {
  var out=[],seen={},re=/<a\b[^>]*href=["']([^"']*(?:the-loai|genre)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,m;
  while((m=re.exec(String(html||"")))!==null){var name=stripTags(m[2]),url=absoluteUrl(m[1],apiUrl||BASE_URL);if(name.length<2||seen[url])continue;seen[url]=true;out.push({name:name,slug:url});}
  return JSON.stringify(out);
}
function parseCountriesResponse(html) {
  var out=[],seen={},re=/<a\b[^>]*href=["']([^"']*(?:quoc-gia|country)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,m;
  while((m=re.exec(String(html||"")))!==null){var n=stripTags(m[2]),u=absoluteUrl(m[1]);if(n.length>1&&!seen[u]){seen[u]=true;out.push({name:n,slug:u});}}
  return JSON.stringify(out);
}
function parseYearsResponse(html) {
  var out=[],seen={},re=/(?:19|20)\d{2}/g,m;while((m=re.exec(String(html||"")))!==null){if(!seen[m[0]]){seen[m[0]]=true;out.push({name:m[0],slug:m[0]});}}
  out.sort(function(a,b){return parseInt(b.name,10)-parseInt(a.name,10);});return JSON.stringify(out);
}

var pluginExports={
  getManifest:getManifest,getHomeSections:getHomeSections,getPrimaryCategories:getPrimaryCategories,getFilterConfig:getFilterConfig,
  getUrlList:getUrlList,getUrlSearch:getUrlSearch,getUrlDetail:getUrlDetail,getUrlCategories:getUrlCategories,getUrlCountries:getUrlCountries,getUrlYears:getUrlYears,
  parseListResponse:parseListResponse,parseSearchResponse:parseSearchResponse,parseMovieDetail:parseMovieDetail,parseDetailResponse:parseDetailResponse,parseEmbedResponse:parseEmbedResponse,
  parseCategoriesResponse:parseCategoriesResponse,parseCountriesResponse:parseCountriesResponse,parseYearsResponse:parseYearsResponse,
  setDebugMode:setDebugMode,isDebugMode:function(){return DEBUG_MODE;}
};

if(typeof _vaapp_register!=="undefined"){
  try{_vaapp_register(pluginExports);logInfo("Đã đăng ký VAApp");}catch(e){logError("Đăng ký VAApp lỗi",e.message);}
}
if(typeof window!=="undefined"){
  for(var key in pluginExports)if(Object.prototype.hasOwnProperty.call(pluginExports,key))window[key]=pluginExports[key];
}
if(typeof module!=="undefined"&&module.exports)module.exports=pluginExports;
logInfo("TVHAY plugin loaded",{version:"1.0.0",baseUrl:BASE_URL});
