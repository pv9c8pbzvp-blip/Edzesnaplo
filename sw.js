/* Edzésnapló – offline működés.
   Netről tölt, ha van (3 mp-en belül), így a frissítések azonnal megjönnek;
   ha nincs net vagy túl lassú, a telefonra mentett példány nyílik meg. */
var C="edzesnaplo-v1";
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(C).then(function(c){return c.add("./index.html")}).then(function(){return self.skipWaiting()}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener("fetch",function(e){
  var r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  /* az app főoldala ("/" vagy index.html) egy kulcson van, hogy mindig a legfrissebb mentett példány nyíljon */
  var u=new URL(r.url),home=r.mode==="navigate"&&/\/(index\.html)?$/.test(u.pathname),key=home?"./index.html":r;
  e.respondWith(new Promise(function(done){
    var fin=false,end=function(x){if(!fin&&x){fin=true;done(x)}};
    var fromCache=function(){return caches.match(key,{ignoreSearch:true})};
    var t=setTimeout(function(){fromCache().then(end)},3000);
    fetch(r).then(function(res){
      if(res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(key,cp)})}
      clearTimeout(t);end(res);
    }).catch(function(){clearTimeout(t);fromCache().then(function(m){end(m||Response.error())})});
  }));
});
