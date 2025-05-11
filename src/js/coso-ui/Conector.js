/*
*    @author     Julio Viera 2023
*/

export class Conector {
	static global_request_id = 0

	constructor(config = {}) {
		this.config = config
		this.ruta = this.config && this.config.ruta ? this.config.ruta : '/rest/'
		this.cabeceras = this.config && this.config.cabeceras ? this.config.cabeceras : {}

		if (this.config.log) console.info('Instancia Rest.')
	}

	agregarCabecera(nombre, valor) {
		this.cabeceras[nombre] = valor
	}
	quitarCabecera(nombre) {
		delete this.cabeceras[nombre]
	}

	async get(uri, cabeceras_extra = {}) {
		let cab = this.cabeceras ?? {}

		for (const cb in cabeceras_extra) {
			cab[cb] = cabeceras_extra[cb]
		}

		cab['X-ECHO-REQUEST-ID'] = '' + ++Conector.global_request_id

		const r = await fetch(this.ruta + uri, { method: 'GET', headers: cab })
		const t = await r.text()
		const request_id = r.headers.get('x-echo-request-id')

		if (this.config.log) console.log('GET Respuesta => ', t)

		try {
			const j = JSON.parse(t)
			j.request_id = parseInt(request_id)
			return j
		}
		catch (er) {
			console.error('NO es json, ruta: ', this.ruta + uri, ' contenido: ', t)
		}
		return null
	}

	async post(uri, datos, cabeceras_extra = {}) {
		let cab = this.cabeceras ?? {}

		for (const cb in cabeceras_extra) {
			cab[cb] = cabeceras_extra[cb]
		}

		cab['X-ECHO-REQUEST-ID'] = '' + ++Conector.global_request_id

		if (!(datos instanceof FormData)) {
			datos = this.construirParametros(datos)
			if (!cab['Content-Type']) cab['Content-Type'] = 'application/x-www-form-urlencoded'
		}

		if (this.config.log) console.info('POST => ' + uri)
		const r = await fetch(this.ruta + uri, { method: 'POST', headers: cab, body: datos })
		const t = await r.text()
		const request_id = r.headers.get('x-echo-request-id')

		if (this.config.log) console.log('POST Respuesta => ', t)
		try {
			const j = JSON.parse(t)
			j.request_id = parseInt(request_id)
			return j
		}
		catch (er) {
			console.error('NO es json, ruta: ', this.ruta + uri, ' contenido: ', t)
		}
		return null
	}

	construirParametros(datos) {
		if (datos instanceof FormData) return datos

		if (Array.isArray(datos) || typeof datos === 'object') {
			let tmp = ''
			for (const k in datos) {
				tmp += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(datos[k])
			}
			datos = tmp
		}
		return datos;
	}
	contruirUriRecurso(recurso) {
		return this.construirParametros(recurso)
	}
}
