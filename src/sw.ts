const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest"
];

self.addEventListener("install", (e: any) => {
  e.waitUntil(
    caches.open("aura-shell-v1").then(c => c.addAll(APP_SHELL))
  );
});

self.addEventListener("fetch", (e: any) => {
  const req = e.request;
  
  // Network-first for API, cache-first for static
  if (req.url.includes("/functions/v1") || req.url.includes("/rest/v1")) {
    e.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
  } else {
    e.respondWith(
      caches.match(req).then(c => c || fetch(req))
    );
  }
});