const SHELL_CACHE = "stock-hub-shell-v1";
const CDN_CACHE = "stock-hub-cdn-v1";
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/stock-hub.svg",
  "/icons/stock-hub-192.png",
  "/icons/stock-hub-512.png",
  "/icons/stock-hub-maskable-512.png",
];
const API_PATH_PREFIXES = [
  "/api",
  "/auth",
  "/stock-movements",
  "/articles",
  "/locations",
  "/audit-logs",
  "/alerts",
];
const DEV_PATH_PREFIXES = ["/src/", "/@vite/", "/@react-refresh", "/node_modules/.vite/"];
const CDN_HOSTS = new Set(["cdn.tailwindcss.com", "unpkg.com"]);

function isLocalDevelopmentOrigin(url) {
  return ["127.0.0.1", "localhost"].includes(url.hostname);
}

function isApiRequest(url) {
  return API_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

function isViteDevelopmentRequest(url) {
  return DEV_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("install", (event) => {
  if (isLocalDevelopmentOrigin(new URL(self.location.href))) {
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const currentUrl = new URL(self.location.href);
  if (isLocalDevelopmentOrigin(currentUrl)) {
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("stock-hub-shell-") || key.startsWith("stock-hub-cdn-"))
              .map((key) => caches.delete(key)),
          ),
        )
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim()),
    );
    return;
  }

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE, CDN_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isLocalDevelopmentOrigin(url) || isViteDevelopmentRequest(url)) return;
  if (isApiRequest(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }

  if (CDN_HOSTS.has(url.hostname)) {
    event.respondWith(cacheFirst(request, CDN_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
  }
});
