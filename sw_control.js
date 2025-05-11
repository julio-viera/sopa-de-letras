

function preguntarRecargarParaActualizarSW(registration) {

	if (confirm('Hay una nueva version de la APP. ¿Desea recargar la página ahora para actualizar?')) {
		registration.waiting.postMessage('SW_SKIP_WAITING')
	}
}


async function sw_control(ruta) {

	if ('serviceWorker' in navigator) {

		const registro_sw = await navigator.serviceWorker.register(ruta)

		// ensure the case when the updatefound event was missed is also handled
		// by re-invoking the prompt when there's a waiting Service Worker
		if (registro_sw.waiting) {
			//preguntarRecargarParaActualizarSW(registro_sw)
		}

		registro_sw.addEventListener('updatefound', () => {
			if (registro_sw.installing) {

				registro_sw.installing.addEventListener('statechange', () => {
					if (registro_sw.waiting) {

						// una controladora previa es que existía un sw previo, pregunta para recargar
						if (navigator.serviceWorker.controller) {
							preguntarRecargarParaActualizarSW(registro_sw)
						}
					}
				})

			}
		})

		// si cambia la controladora (nuevo sw) recarga
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			window.location.reload()
		})

	}

}

sw_control('sw.js')
