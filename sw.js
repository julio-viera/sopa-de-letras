
const log = false
const version = '0.0.4'
const nombre_cache = 'sopa-cache'
const precachear = [
	'/sopa-de-letras/sw_control.js',
	'/sopa-de-letras/data/palabras.json',
	'/sopa-de-letras/src/js/coso-ui/CosoNodo.js',
	'/sopa-de-letras/src/js/coso-ui/CosoComponente.js',
	'/sopa-de-letras/src/js/coso-ui/Conector.js',
	'/sopa-de-letras/src/js/coso-ui/CosoAlmacenajeLocal.js',
	'/sopa-de-letras/src/js/coso-ui/CuentaRegresivaSegundos.js',
	'/sopa-de-letras/src/js/SopaDeLetras.js',
	'/sopa-de-letras/img/sopa-192.png',
	'/sopa-de-letras/img/pantalla-614x360.jpg',
]

self.addEventListener("install", event => {
	if (log) console.log(`[Service Worker]  Instalado. v${version}`);

	event.waitUntil(
		caches.open(nombre_cache)

			.then(async (cache) => {

				let respuesta

				if (log) console.log(`([Service Worker]  cache: ${nombre_cache}`);

				cache.keys().then((keys) => {
					keys.forEach((request, index, array) => {

						const url = new URL(request.url);

						if (log) console.log(`[Service Worker] Comprueba cache en precarga: ${url.pathname}`);

						if (!precachear.includes(url.pathname)) {
							if (log) console.log(`[Service Worker] Borra cache en precarga: ${url.pathname}`);
							cache.delete(request);
						}
					});
				});

				try {
					respuesta = await cache.addAll(precachear);
				} catch (err) {
					console.error('[Service Worker] Error en la precarga cache.addAll');
					for (let item of precachear) {
						try {
							respuesta = await cache.add(item);
						} catch (err) {
							console.error('[Service Worker] Error en la precarga de cache: ', item);
						}
					}
				}

				return respuesta;

			})
			.catch(er => {
				console.error(er)
			})

	);

});
self.addEventListener("activate", event => {
	if (log) console.log(`[Service Worker]  Activado. v${version}`);
});


self.addEventListener('fetch', e => {

	e.respondWith(

		(async () => {

			if (log) console.log(`[Service Worker] Piden: ${e.request.url}`);

			const url = new URL(e.request.url);
			const esCache = precachear.includes(url.pathname);

			if (esCache) {
				const r = await caches.match(e.request);

				if (r) {
					if (log) console.log(`[Service Worker] Devuelve de cache: ${e.request.url}`)
					return r;
				}
			}

			if (log) console.log(`[Service Worker] Pide a la red: ${e.request.url}`);
			const response = await fetch(e.request);

			if (esCache) {
				const cache = await caches.open(nombre_cache);

				if (log) console.log(`[Service Worker] Guarda en cache: ${e.request.url}`);

				cache.put(e.request, response.clone());
			}

			return response;
		})(),

	);

});


self.addEventListener('message', (e) => {
	if (log) console.log(`[Service Worker] Mensaje: `, e);

	if (e.data === 'SW_SKIP_WAITING') {
		self.skipWaiting();
	}
});
