/*
*    @author     Julio Viera 2023
*/


export class Util {
	static _(t) {
		return window.contexto && window.contexto[t] ? window.contexto[t] : t
	}


	static obtenerCookie(nombre) {
		const reg = RegExp('^' + nombre + '=')

		for (const iter of document.cookie.split(';')) {
			const ck = iter.trimStart();

			if (reg.test(ck)) return decodeURIComponent(ck.replace(reg, ''));
		}

		return null;
	}

	static ponerCookie(nombre, valor, segundos, ruta = '/') {
		const fecha = new Date();
		fecha.setTime(fecha.getTime() + (segundos * 1000));
		document.cookie = nombre + '=' + encodeURIComponent(valor) + ';expires=' + fecha.toUTCString() + ';path=' + ruta;
	}
	static borrarCookie(nombre) {
		document.cookie = nombre + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}

	static dimensionesNavegador() {
		let w = 0, h = 0
		if (typeof window.innerWidth != 'undefined') { w = window.innerWidth; h = window.innerHeight }
		else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) { w = document.documentElement.clientWidth; h = document.documentElement.clientHeight }
		else { w = document.body.clientWidth; h = document.body.clientHeight }
		return { 'w': w, 'h': h }
	}

	static mostrar(i, modo) {
		if (i instanceof Element) i.style.display = modo == undefined ? 'block' : modo
		else try { document.querySelector(i).style.display = modo == undefined ? 'block' : modo } catch (e) { }
	}
	static ocultar(i) {
		if (i instanceof Element) i.style.display = 'none'
		else try { document.querySelector(i).style.display = 'none' } catch (e) { }
	}
	static quitarClase(e, c) {
		let elem;
		if (e instanceof Element) elem = e
		else elem = document.querySelector(e)

		if (elem) elem.classList.remove(c);
	}
	static agregarClase(e, c) {
		let elem;
		if (e instanceof Element) elem = e
		else elem = document.querySelector(e)

		if (elem) elem.classList.add(c);
	}

	static capitalizar(s) {
		return s.charAt(0).toUpperCase() + s.slice(1)
	}
	static formatearHora(d, etq = true) {
		let f = (d instanceof Date ? d : new Date(d))
		if (isNaN(f)) f = new Date('2000-01-10 ' + d)
		return f.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit' }) + (etq ? ' ' + this._('hs') : '')
	}
	static formatearFecha(d) {
		if (d instanceof Date) return d.toLocaleDateString()

		if (!d.includes('T')) d += 'T00:00:00'
		return (new Date(Date.parse(d))).toLocaleDateString()
	}
	static esFecha(str) {
		return (str instanceof Date) || !isNaN(Date.parse(str));
	}
	static fechaDiferenciaDias(fecha1, fecha2) {
		const utc1 = Date.UTC(fecha1.getFullYear(), fecha1.getMonth(), fecha1.getDate());
		const utc2 = Date.UTC(fecha2.getFullYear(), fecha2.getMonth(), fecha2.getDate());

		return ((utc2 - utc1) / (1000 * 60 * 60 * 24));
	}
	// formato YYYY-MM-DD
	static fechaACadenaEstandar(d) {
		let fecha
		if (d instanceof Date) fecha = d
		else if (self.esFecha(d)) fecha = Date.parse(d)
		return fecha.getFullYear() + '-' + ((fecha.getMonth() < 9 ? '0' : '') + (fecha.getMonth() + 1)) + '-' + fecha.getDate()
	}
	static minHoraFormateada(d, etq = true) {
		let h = Math.trunc(d / 60)
		let m = d % 60
		h = (h < 10 ? '0' : '') + h
		m = (m < 10 ? '0' : '') + m
		return h + ':' + m + (etq ? ' ' + this._('hs') : '')
	}
	static etiquetaFecha(fecha_str) {
		return (fecha_str == 'hoy' || fecha_str == 'now' ? Util._('Hoy') + ' ' + (new Date()).toLocaleDateString() : Util.formatearFecha(fecha_str))
	}
	/*
	*   Devuelve los minutos totales para la hora en formato HH:mm:ss
	*   Los segundos se desprecian.
	*/
	static minutosDeHora(str_h) {
		const h = String(str_h).split(':')
		return 60 * Number.parseInt(h[0]) + Number.parseInt(h[1]);
	}
	static rellenoIzq(original, cantidad_requerida, relleno = '0') {
		return (String(original).length < cantidad_requerida ? relleno.repeat(cantidad_requerida - String(original).length) : '') + String(original)
	}
	static rellenoDer(original, cantidad_requerida, relleno = '0') {
		return String(original) + (String(original).length < cantidad_requerida ? relleno.repeat(cantidad_requerida - String(original).length) : '')
	}
	static vaciarSelect(s) {
		if (!(s instanceof HTMLSelectElement)) return
		while (s.options.length > 0) s.remove(0)
	}

	static construirOpciones(opciones, seleccionado = '') {
		let ops = []
		for (const i in opciones) {
			const op = document.createElement('option')
			op.value = i
			op.text = opciones[i]

			if (i == seleccionado) op.selected = true

			ops.push(op)
		}

		return ops
	}

	// formato de opciones {codigo:###, nombre:%%%%%}
	static construirOpcionesCodigoNombre(opciones, seleccionado = '') {
		let ops = []
		for (const o of opciones) {
			const op = document.createElement('option')
			op.value = o.codigo
			op.text = o.nombre

			if (o.codigo == seleccionado) op.selected = true

			ops.push(op)
		}

		return ops
	}

	static opcionesDeSelect(select) {
		const opciones = {}
		if (select) {
			for (let opt of select.options) {
				opciones[opt.value] = opt.text
			}
		}
		return opciones
	}
	static opcionesSeleccionadasDeSelect(select) {
		const seleccionados = {}
		for (let opcion of select.options) {
			if (opcion.selected) seleccionados[opcion.value] = opcion.text
		}
		return seleccionados
	}
	static ponerOpcionSelect(select, val, tx) {
		if (!select) return
		const opciones = Util.opcionesDeSelect(select)

		if (!opciones[val]) {
			var opt = document.createElement("option")
			opt.value = val
			opt.text = tx
			select.add(opt, 0)
		}
	}
	static quitarOpcionSelect(select, val) {
		for (let opcion of select.options) {
			if (opcion.value == val) opcion.remove()
		}
	}


	static valoresDeSelect(select, seleccionados = false) {
		const valores = []
		if (select) {
			for (let opt of select.options) {
				if (!seleccionados || opt.selected) valores.push(opt.value)
			}
		}
		return valores
	}

	static elemento(etiqueta = 'div', atributos = {}, hijos = []) {
		const elem = document.createElement(etiqueta)
		for (const a in atributos) {
			if (typeof atributos[a] === 'function') elem[a] = atributos[a]
			else elem.setAttribute(a, atributos[a])
		}

		if (hijos instanceof Array) {
			for (const h of hijos) {
				if (h instanceof Node) elem.appendChild(h)
				else elem.appendChild(document.createTextNode(h))
			}
		}
		else if (hijos instanceof Node) elem.appendChild(hijos)
		else elem.appendChild(document.createTextNode(hijos))

		return elem
	}
	static esCheckbox(e) {
		return e instanceof HTMLInputElement && e.getAttribute('type') == 'checkbox'
	}
	static pnrCheckbox(_query, _bool) {
		for (let chk of document.querySelectorAll(_query + ' input[type=checkbox]')) chk.checked = _bool
	}
	static esEnteroPositivo(val) {
		return !/\D/.test(val);
	}
	static enRango(val, min, max) {
		return val >= min && val <= max
	}
	static vacio(v) {
		return v === undefined || v === null || v === '' || v === 0 || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && Object.keys(v).length === 0)
	}

	static limitarRangoCampoNumerico(nodo_input) {
		nodo_input.addEventListener('change', (e) => {
			const val = parseFloat(e.target.value)
			const min = parseFloat(e.target.getAttribute('min'))
			const max = parseFloat(e.target.getAttribute('max'))

			if (isNaN(min)) {
				console.error('(limitarRangoCampoNumerico) Falta atributo min sobre: ', nodo_input)
			}
			if (isNaN(max)) {
				console.error('(limitarRangoCampoNumerico) Falta atributo max sobre: ', nodo_input)
			}

			if (val < min) e.target.value = min
			if (val > max) e.target.value = max
		})

		nodo_input.addEventListener('keyup', (e) => {
			const val = parseFloat(e.target.value)
			const min = parseFloat(e.target.getAttribute('min'))
			const max = parseFloat(e.target.getAttribute('max'))

			if (isNaN(min)) {
				console.error('(limitarRangoCampoNumerico) Falta atributo min sobre: ', nodo_input)
			}
			if (isNaN(max)) {
				console.error('(limitarRangoCampoNumerico) Falta atributo max sobre: ', nodo_input)
			}

			if (val < min) e.target.value = min
			if (val > max) e.target.value = max
		})

	}

	/*
	*	trata de identificar el mime type desde el inicio de la cadena base64
	* https://en.wikipedia.org/wiki/List_of_file_signatures
	*/
	static mimeTypeDeBase64(base64) {
		const firmas = {
			"JVBERi0": "application/pdf",
			"R0lGODdh": "image/gif",
			"R0lGODlh": "image/gif",
			"Qk02U": "image/bmp",
			"iVBORw0KGgo": "image/png",
			"/9j/": "image/jpg",
			"TU0AK": "image/tiff",
			"AAABukQABAAEAUNDW": "video/mpeg",
			"AAAAHGZ0eXBtcDQyAAAAAG1wNDJtcDQxaXNvNA": "video/mp4",
			"T2dnUwACA": "video/ogg",
			"GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEA": "video/webm",
			"UklGR": "video/x-msvideo",
			"UEs": "application/vnd.openxmlformats-officedocument.",
			"PK": "application/zip",
			"T2dnUwACAAAAAAAAAA": "video/ogg", // el de audio es igual "T2dnUwACAAAAAAAAAA": "audio/ogg",
			"PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0i": "image/svg+xml",
			"SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA": "audio/mpeg",
		}

		for (const f in firmas) {
			if (base64.indexOf(f) === 0) return firmas[f];
		}

		return null
	}

	static blobDeBase64(base64, mime = null) {
		if (!mime) mime = this.mimeTypeDeBase64(base64.substring(0, 100))
		if (!mime) {
			console.error('No se puede determinar MimeType de Base64.')
			return null
		}

		const data = atob(base64);
		const uInt8Array = new Uint8Array(data.length);

		for (let i = 0; i < data.length; i++) {
			uInt8Array[i] = data.charCodeAt(i);
		}

		try {
			return new Blob([uInt8Array], { type: mime })
		}
		catch (er) {
			console.error(er)
		}
		return null
	}

	/*
		https://gist.github.com/scwood/3bff42cc005cc20ab7ec98f0d8e1d59d
	*/
	static uuidV4() {
		const uuid = new Array(36);
		for (let i = 0; i < 36; i++) {
			uuid[i] = Math.floor(Math.random() * 16);
		}
		uuid[14] = 4; // set bits 12-15 of time-high-and-version to 0100
		uuid[19] = uuid[19] &= ~(1 << 2); // set bit 6 of clock-seq-and-reserved to zero
		uuid[19] = uuid[19] |= (1 << 3); // set bit 7 of clock-seq-and-reserved to one
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		return uuid.map((x) => x.toString(16)).join('');
	}
}
