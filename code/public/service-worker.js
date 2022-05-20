
let dataCacheName = 'storyData-v1';
let cacheName = 'storyPWA-step-8-1';
let filesToCache = [
    '/',
    '/scripts/app.js',
    '/scripts/users.js',
    '/scripts/database.js',
    '/scripts/annotationDatabase.js',
    '/scripts/chat.js',
    '/scripts/canvas.js',
    '/scripts/knowledgeGraph.js',
    '/styles/inline.css',
    '/styles/bootstrap.css',
    '/styles/bootstrap.min.css',
    '/scripts/bootstrap.js',
    '/scripts/jquery.min.js',
    '/scripts/axios.min.js',
    '/scripts/idb/index.js',
    '/scripts/idb/wrap-idb-value.js',
    '/favicon.ico',
    '/css/base.css',
    '/css/index.css',
    '/css/login.css',
    '/css/bootstrap.css'
];


/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', function (e) {
    // if (ENV === 'development') {
    //     self.skipWaiting()
    // }
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});


/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    /*
     * Fixes a corner case in which the app wasn't returning the latest data.
     * You can reproduce the corner case by commenting out the line below and
     * then doing the following steps: 1) load app for first time so that the
     * initial New York City data is shown 2) press the refresh button on the
     * app 3) go offline 4) reload the app. You expect to see the newer NYC
     * data, but you actually see the initial data. This happens because the
     * service worker is not yet activated. The code below essentially lets
     * you activate the service worker faster.
     */
    return self.clients.claim();
});


/**
 * this is called every time a file is fetched. This is a middleware, i.e. this method is
 * called every time a page is fetched by the browser
 * there are two main branches:
 * /weather_data posts cities names to get data about the weather from the server. if offline, the fetch will fail and the
 *      control will be sent back to Ajax with an error - you will have to recover the situation
 *      from there (e.g. showing the cached data)
 * all the other pages are searched for in the cache. If not found, they are returned
 */
self.addEventListener('fetch', function (e) {
    console.log('[Service Worker] Fetch', e.request.url);
    var dataUrl = '/allStories';
    let urlList = ['/allStories', '/singleStory', '/insertStory']
    //if the request must online, post to the server - do nit try to cache it
    if (e.request.url.indexOf('/allStories') > -1 || e.request.url.indexOf('/insertStory') > -1 || e.request.url.indexOf('/updateStory') > -1
    || e.request.url.indexOf('/widget') > -1 || e.request.url.indexOf('/kgsearch') > -1 || e.request.url.indexOf('/encrypted-tbn') > -1 || e.request.url.indexOf('/api-docs') > -1
    ){
        /*
         * When the request URL contains dataUrl, the app is asking for fresh
         * weather data. In this case, the service worker always goes to the
         * network and then caches the response. This is called the "Cache then
         * network" strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
         */
        return fetch(e.request)
            .then( (response) => {
                // console.log(response)
                // note: it the network is down, response will contain the error
                // that will be passed to Ajax
                return response;
            })
            // the error will be passed to Ajax
            .catch((error) => {
                console.log(error)
                return error;
            })
    } else {
        /*
         * The app is asking for app shell files. In this scenario the app uses the
         * "Cache, falling back to the network" offline strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
         */
        e.respondWith(
            caches.match(e.request).then(function (response) {
                // console.log(response)
                return response
                    || fetch(e.request)
                        .then(function (response) {
                            // note if network error happens, fetch does not return
                            // an error. it just returns response not ok
                            // https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
                            if (!response.ok ||  response.statusCode>299) {
                                console.log("error: " + response.error());
                            } else {
                                // console.log(response)
                                // caches.add(response.clone());
                                return response;
                            }
                        })
                        .catch(function (err) {
                            console.log("error: " + err);
                        })
            })
        );
    }

});
