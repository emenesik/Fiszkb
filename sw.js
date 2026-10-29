'use strict';

const VERSION = '1.10.14';
const BASE = new URL('./', self.location).pathname;

const CACHE_PREFIX = 'fiszkb-' + encodeURIComponent(BASE) + '-';
const SHELL_CACHE = CACHE_PREFIX + 'shell-' + VERSION;

const RUNTIME_CACHE = CACHE_PREFIX + 'runtime';
const APP_PAGE = BASE + 'index.html';

const SHELL_URLS = [APP_PAGE];
const NAVIGATION_TIMEOUT_MS = 4000;
const RUNTIME_MAX_ENTRIES = 150;
const STATIC_ASSET_RE = /\.(?:png|jpe?g|gif|webp|svg|ico|css|js|mjs|woff2?|ttf|webmanifest|json)$/i;
const CACHEABLE_HOSTS = new Map([
    ['cdn.jsdelivr.net', false],
    ['cdnjs.cloudflare.com', false],
    ['unpkg.com', false],
    ['fonts.googleapis.com', true],
    ['fonts.gstatic.com', false],
]);

const OFFLINE_HTML =
    '<!doctype html><html lang="pl"><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Brak połączenia</title>' +
    '<body style="background:#121018;color:#eee;font:16px/1.5 system-ui;text-align:center;padding:24px">' +
    '<h1>Brak połączenia</h1><p>Sprawdź internet i spróbuj ponownie.</p>' +
    '<button onclick="location.reload()">Odśwież</button></body></html>';

self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(SHELL_CACHE);

            await cache.addAll(SHELL_URLS.map((url) => new Request(url, { cache: 'reload' })));
        })()
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keep = new Set([SHELL_CACHE, RUNTIME_CACHE]);
            const keys = await caches.keys();
            const previousRuntime = keys.filter((key) => key.startsWith(CACHE_PREFIX + 'runtime-'));
            if (previousRuntime.length) {
                try {
                    const target = await caches.open(RUNTIME_CACHE);
                    for (const name of previousRuntime) {
                        const source = await caches.open(name);
                        for (const request of await source.keys()) {
                            if (await target.match(request)) continue;
                            const response = await source.match(request);
                            if (response) await target.put(request, response);
                        }
                    }
                    await trimCache(target, RUNTIME_MAX_ENTRIES);
                } catch (_) {
                    previousRuntime.forEach((name) => keep.add(name));
                }
            }
            await Promise.all(
                keys
                    .filter((key) => {
                        const legacyRoot =
                            BASE === '/' && /^fiszkb-(?:shell|runtime)-v\d+$/.test(key);
                        return (key.startsWith(CACHE_PREFIX) || legacyRoot) && !keep.has(key);
                    })
                    .map((key) => caches.delete(key))
            );
            await self.clients.claim();
        })()
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
    if (
        event.data &&
        event.data.type === 'SET_LANGUAGE' &&
        ['pl', 'en'].includes(event.data.language)
    ) {
        event.waitUntil(
            caches
                .open(SHELL_CACHE)
                .then((cache) =>
                    cache.put(BASE + '__ui_language', new Response(event.data.language))
                )
                .catch(() => {})
        );
    }
});

function isCacheable(response, allowOpaque) {
    return (
        !!response &&
        ((response.status === 200 && ['basic', 'cors', 'default'].includes(response.type)) ||
            (!!allowOpaque && response.type === 'opaque'))
    );
}

async function trimCache(cache, maxEntries) {
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - maxEntries; i++) await cache.delete(keys[i]);
}

async function putSafely(cache, key, response, maxEntries) {
    try {
        await cache.put(key, response.clone());
        if (maxEntries) await trimCache(cache, maxEntries);
    } catch (_) {}
}

async function staleWhileRevalidate(event, cacheName, allowOpaque, maxEntries) {
    const req = event.request;
    let cache, cached;
    try {
        cache = await caches.open(cacheName);
        cached = await cache.match(req);
    } catch (_) {}
    const refresh = fetch(req).then(async (response) => {
        if (cache && isCacheable(response, allowOpaque))
            await putSafely(cache, req, response, maxEntries);
        return response;
    });
    event.waitUntil(
        refresh.then(
            () => {},
            () => {}
        )
    );
    return cached || refresh;
}

async function matchesInstalledVersion(response) {
    const reader = response.clone().body?.getReader();
    if (!reader) return false;
    const decoder = new TextDecoder();
    let head = '',
        bytes = 0;
    try {
        while (bytes < 8192) {
            const part = await reader.read();
            if (part.done) break;
            const value = part.value.subarray(0, 8192 - bytes);
            bytes += value.length;
            head += decoder.decode(value, { stream: true });
            const version = head.match(
                /<meta\s+name=["']application-version["']\s+content=["']([^"']+)/i
            );
            if (version) return version[1] === VERSION;
        }
        return false;
    } finally {
        reader.cancel().catch(() => {});
    }
}

async function handleAppPage(event) {
    let cache;
    try {
        cache = await caches.open(SHELL_CACHE);
    } catch (_) {}
    let cached;
    try {
        if (cache) cached = (await cache.match(APP_PAGE)) || (await cache.match(BASE));
    } catch (_) {}
    const controller = new AbortController();
    const fetchTimer = setTimeout(() => controller.abort(), 8000);
    const network = fetch(event.request, { cache: 'no-store', signal: controller.signal })
        .then(async (response) => {
            if (!isCacheable(response, false)) return null;

            if (!(await matchesInstalledVersion(response))) {
                response.body?.cancel().catch(() => {});
                return null;
            }
            if (cache) await putSafely(cache, APP_PAGE, response);
            return response;
        })
        .catch(() => null)
        .finally(() => clearTimeout(fetchTimer));
    event.waitUntil(network.then(() => {}));

    if (cached) return cached;
    let timer;
    const timeout = new Promise((resolve) => {
        timer = setTimeout(() => resolve(null), NAVIGATION_TIMEOUT_MS);
    });
    const first = await Promise.race([network, timeout]);
    clearTimeout(timer);
    if (first) return first;

    let language = 'en';
    try {
        const saved = cache && (await cache.match(BASE + '__ui_language'));
        if (saved) {
            const value = await saved.text();
            if (['pl', 'en'].includes(value)) language = value;
        }
    } catch (_) {}
    const offlineHtml =
        language === 'en'
            ? OFFLINE_HTML.replace('lang="pl"', 'lang="en"')
                  .replaceAll('Brak połączenia', 'Offline')
                  .replace(
                      'Sprawdź internet i spróbuj ponownie.',
                      'Check your internet connection and try again.'
                  )
                  .replace('Odśwież', 'Refresh')
            : OFFLINE_HTML;
    return new Response(offlineHtml, {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET' || req.headers.has('range')) return;
    const url = new URL(req.url);
    if (!['https:', 'http:'].includes(url.protocol)) return;
    if (url.origin !== self.location.origin) {
        if (/accents\.txt$/i.test(url.pathname)) return;
        if (CACHEABLE_HOSTS.has(url.hostname)) {
            event.respondWith(
                staleWhileRevalidate(
                    event,
                    RUNTIME_CACHE,
                    CACHEABLE_HOSTS.get(url.hostname),
                    RUNTIME_MAX_ENTRIES
                )
            );
        }
        return;
    }
    if (!url.pathname.startsWith(BASE)) return;
    const isAppPage = url.pathname === BASE || url.pathname === APP_PAGE;
    if (
        isAppPage &&
        (req.mode === 'navigate' || req.destination === 'document' || req.destination === '')
    ) {
        event.respondWith(handleAppPage(event));
    } else if (
        (url.pathname.startsWith(BASE + 'assets/fonts/') ||
            url.pathname.startsWith(BASE + 'assets/katex/')) &&
        /\.(?:woff2|js)$/.test(url.pathname)
    ) {
        event.respondWith(
            (async () => {
                const cache = await caches.open(SHELL_CACHE);
                const cached = await cache.match(req);
                if (cached) return cached;
                const response = await fetch(req);
                if (isCacheable(response, false)) await putSafely(cache, req, response);
                return response;
            })()
        );
    } else if (req.mode !== 'navigate' && STATIC_ASSET_RE.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event, SHELL_CACHE, false, 0));
    }
});
