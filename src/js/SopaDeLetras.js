/*
*    @author     Julio Viera 2025
*/

import { ESTADO_CARGA, CosoComponente } from './coso-ui/CosoComponente.js'
import { Conector } from './coso-ui/Conector.js'
import { CuentaRegresivaSegundos } from './coso-ui/CuentaRegresivaSegundos.js'
import { CosoAlmacenajeLocal } from './coso-ui/CosoAlmacenajeLocal.js'

export class Letra extends HTMLElement {
	constructor(props) {
		super()

		this.aceptaLetra = this.aceptaLetra.bind(this)
		this.asignarLetra = this.asignarLetra.bind(this)
		this.click = this.click.bind(this)
		this.esDePalabra = this.esDePalabra.bind(this)
		this.esDeAlgunaPalabra = this.esDeAlgunaPalabra.bind(this)

		this.props = props ?? {}

		this._seleccionada = false
		this._x = this.props.x ?? 0
		this._y = this.props.y ?? 0
		this._letra = this.props.letra ?? ''
		this._palabras_asignadas = this.props.palabras ?? []
		this._color = this.props.color ?? '#fff';
		this._estado = this.props.estado ?? 'normal'

		this.addEventListener('click', this.click)
	}

	connectedCallback() {
		if (this._letra) this.innerHTML = this._letra
	}

	disconnectedCallback() { }

	get letra() { return this._letra }

	set letra(letra) {

		if (!letra || letra.length !== 1) {
			console.error('La letra no es válida: ', letra)
			return false
		}

		this._letra = letra
		this.innerHTML = this._letra
	}

	get posX() { return this._x }
	set posX(x) { this._x = x }
	get posY() { return this._y }
	set posY(y) { this._y = y }

	set color(clr) {
		this._color = clr
		this.style.backgroundColor = this._color
	}

	get color() { return this._color }

	set seleccionada(sel) {
		this._seleccionada = sel
		if (this._seleccionada) {
			this.classList.add('seleccionada')
		}
		else {
			this.classList.remove('seleccionada')
		}
	}

	get seleccionada() { return this._seleccionada }

	aceptaLetra(l) {
		if (this._letra && this._letra != l) return false
		return true
	}

	asignarLetra(letra, palabra) {

		if (!letra || letra.length !== 1) {
			console.error('La letra no es válida: ', letra)
			return false
		}

		if (palabra instanceof Palabra) {
			for (const pal of this._palabras_asignadas) {
				if (pal.texto == palabra.texto) {
					console.error('La palabra ' + pal.texto + ' ya fue asignada a letra ' + this.letra, this._x, this._y)
					return false
				}
			}

			this._palabras_asignadas.push(palabra)
			this.letra = letra
			return true
		}
		else console.error('El parámetro palabra debe ser instancia de Palabra')

		return false
	}

	esDePalabra(palabra) {
		if (palabra instanceof Palabra) {
			for (const pal of this._palabras_asignadas) {
				if (pal.texto == palabra.texto) return true
			}
		}
		return false
	}

	esDeAlgunaPalabra() {
		return this._palabras_asignadas.length > 0
	}

	click(e) {

		const evento = new Event('LetraClick')
		evento.posX = this._x
		evento.posY = this._y
		evento.letra = this._letra
		evento.palabras = this._palabras_asignadas

		this.dispatchEvent(evento)
	}
}

customElements.define('letra-de-sopa', Letra);


export class Palabra extends HTMLElement {
	constructor(props) {
		super()

		this.asignarLetra = this.asignarLetra.bind(this)
		this.seleccionarLetras = this.seleccionarLetras.bind(this)
		this.comprobarSeleccionCompletada = this.comprobarSeleccionCompletada.bind(this)
		this.click = this.click.bind(this)

		this.props = props ?? {}

		this._estado = ''  // encontrada, revelada
		this._letras = {}
		this._texto = this.props.texto ?? ''
		this._puntos = this._texto.length * 100
		this._color = this.props.color ?? '#d22';

		this.addEventListener('click', this.click)
	}

	connectedCallback() {
		if (this._texto) this.innerHTML = this._texto
		if (this._color) this.color = this._color
	}

	disconnectedCallback() { }

	get texto() { return this._texto }

	set texto(t) {
		this._texto = t
		this._puntos = this._texto.length * 100
	}

	get puntos() { return this._puntos }

	set puntos(p) { this._puntos = p }

	set color(clr) {
		this._color = clr
		this.style.backgroundColor = this._color
	}

	get color() { return this._color }

	set estado(est) {

		if (est == 'encontrada') {
			this._estado = est
			this.seleccionarLetras()
			this.classList.add('encontrada')
		}
		else if (est == 'revelada') {
			this._estado = est
			this.seleccionarLetras()
			this.classList.add('revelada')

			const evento = new Event('PalabraRevelada')
			evento.palabra = this

			this.dispatchEvent(evento)
		}
	}

	get estado() { return this._estado }

	asignarLetra(letra) {
		if (letra instanceof Letra) {
			if (this._letras[letra.posX + '-' + letra.posY]) {
				console.error('La letra ' + letra.letra + ' ya fue asignada a palabra ' + this._texto)
				return false
			}

			this._letras[letra.posX + '-' + letra.posY] = letra
			return true
		}
		else console.error('La letra no es instancia de Letra.')
		return false
	}

	seleccionarLetras() {
		for (const clave in this._letras) {
			const letra = this._letras[clave]
			letra.color = this._color
		}
	}

	comprobarSeleccionCompletada() {
		if (this.estado) return true
		if (Object.keys(this._letras).length == 0) return false

		for (const clave in this._letras) {
			const letra = this._letras[clave]
			if (!letra.seleccionada) return false
		}
		return true
	}
	click(e) {
		if (!this.estado && confirm('¿Seguro que quiere revelar la palabra? Si lo hace perderá los puntos de esa palabra.')) {
			this.estado = 'revelada'
		}
	}
}
customElements.define('palabra-de-sopa', Palabra);



export class SopaDeLetras extends CosoComponente {
	constructor(props) {
		super(props)

		this.almacenaje = new CosoAlmacenajeLocal()

		if (!this.props.tablero_tamanio) this.props.tablero_tamanio = this.almacenaje.obtener('tablero_tamanio', 4)
		if (!this.props.dificultad) this.props.dificultad = this.almacenaje.obtener('tablero_dificultad', 0)

		this._version = '0.9.0';

		this._signos = 'AEIOUABCDEFGHIJKMNÑOPQRSTUVWXYZÁÉÍÓÚÜAEIOUBCRPABCDEFGHIJKMNÑOPQRSTUVWXYZUOIEA';
		this._signos_cantidad = this._signos.length

		this.actualizarTableroDimensiones = this.actualizarTableroDimensiones.bind(this)
		this.revelarPalabras = this.revelarPalabras.bind(this)
		this.cargar = this.cargar.bind(this)
		this.terminar = this.terminar.bind(this)
		this.construir = this.construir.bind(this)
		this.actualizarPuntos = this.actualizarPuntos.bind(this)
		this.signoAleatorio = this.signoAleatorio.bind(this)
		this.ponerPalabraEnTablero = this.ponerPalabraEnTablero.bind(this)
		this.ponerPalabraEnPos = this.ponerPalabraEnPos.bind(this)
		this.limpiarLetrasSeleccionadas = this.limpiarLetrasSeleccionadas.bind(this)
		this.clickLetra = this.clickLetra.bind(this)
		this.comprobarSiTerminoPalabras = this.comprobarSiTerminoPalabras.bind(this)
		this.dibujar = this.dibujar.bind(this)
		this.obtenerEstilos = this.obtenerEstilos.bind(this)

		this.color_indice_asignacion = 0
		this.colores_palabras = [
			'#c0cdfb',
			'#f0f9bb',
			'#c1ffed',
			'#ddffd6',
			'#f5e4c0',
			'#cefbfb',
			'#ffd7ce',
			'#ffc6d6',
			'#eed5ff',
			'#fff8db',
			'#e3ffde',
			'#e3fff6',
			'#ffdffb',
			'#ffd8d8',
			'#e1f7cb',
			'#e3bfe2',
			'#e7b0b0',
			'#bfcbeb'
		]

		this._palabras_texto = []
		this._palabras_nodos = []

		this._puntos_de_palabras = 0


		this._cabecera = this.crear('div', { id: this.id + 'cabecera', class: 'cabecera' })
		this._palabras_cont = this.crear('div', { id: this.id + 'palabras-cont', class: 'palabras-cont' })
		this._tablero_cont = this.crear('div', { id: this.id + 'tablero_cont', class: 'tablero_cont' })
		this._tablero = this.crear('div', { id: this.id + 'tablero', class: 'tablero' })
		this._pie = this.crear('div', { id: this.id + 'pie', class: 'pie' })
		this._puntos = this.crear('div', { id: this.id + 'puntos', class: 'puntos' }, '0')
		this._tablero_escala = this.crear('input', { type: 'range', class: 'tablero_escala', min: 0.8, max: 4.0, value: 1.5, step: 0.01 })
		this._tablero_escala.value = this.almacenaje.obtener('tablero_escala', 1.5)
		this._tablero_saturacion = this.crear('input', { type: 'range', class: 'tablero_saturacion', min: 0.5, max: 5.0, value: 1.0, step: 0.01 })
		this._tablero_saturacion.value = this.almacenaje.obtener('tablero_saturacion', 1.0)
		this._tiempo = new CuentaRegresivaSegundos({ class: 'cuenta_tiempo' })
		this._tablero_letras = {}
		this._letras_seleccionadas = []
		this.btn_recargar = this.crear('button', { class: 'btn-recargar', title: this._('Recargar'), onclick: (e) => { this.cargar(this.props) } }, 'Nuevo Juego')
		this._dificultad = this.crear('select', { class: 'dificultad' })

		const dificultades = {
			0: 'Jugar sin Tiempo',
			1: 'Dificultadad - Fácil',
			2: 'Dificultadad - Intermedio',
			3: 'Dificultadad - Difícil'
		}

		for (const k in dificultades) {
			const op = document.createElement('option')
			op.value = k
			op.text = dificultades[k]
			this._dificultad.add(op)
		}

		this._dificultad.addEventListener('change', (e) => {
			this.almacenaje.guardar('tablero_dificultad', this._dificultad.value)
			this.props.dificultad = this._dificultad.value
			this.cargar(this.props)
		})


		this._tablero_tamanio = this.crear('select', { class: 'tablero_tamanio' })

		this._tablero_tamanios = {
			1: { nombre: 'Tablero - Diminuto', ancho: 4, alto: 3 },
			2: { nombre: 'Tablero - Muy Chico', ancho: 8, alto: 4 },
			3: { nombre: 'Tablero - Chico', ancho: 12, alto: 8 },
			4: { nombre: 'Tablero - Mediano', ancho: 20, alto: 14 },
			5: { nombre: 'Tablero - Grande', ancho: 25, alto: 21 },
			6: { nombre: 'Tablero - Muy Grande', ancho: 30, alto: 20 },
			7: { nombre: 'Tablero - Enorme', ancho: 40, alto: 30 },
		}

		for (const k in this._tablero_tamanios) {
			const op = document.createElement('option')
			op.value = k
			op.text = this._tablero_tamanios[k].nombre
			op.setAttribute('ancho', this._tablero_tamanios[k].ancho)
			op.setAttribute('alto', this._tablero_tamanios[k].alto)

			if (this.props.tablero_tamanio == k) op.selected = true

			this._tablero_tamanio.add(op)
		}

		this._tablero_tamanio.addEventListener('change', () => {
			this.almacenaje.guardar('tablero_tamanio', this._tablero_tamanio.value)

			this.actualizarTableroDimensiones()
		})

		this._cabecera_div1 = this.crear('div', { class: 'flex-vertical' })
		this._cabecera_div1.append(this._tablero_tamanio, this._dificultad)

		this._pie.append(
			this.crear('div', { class: 'flex-horizontal' }, ['Tamaño de letras', this._tablero_escala]),
			this.crear('div', { class: 'flex-horizontal' }, ['Intensidad del Color', this._tablero_saturacion]),
			this.crear('div', { class: 'flex-horizontal' }, 'JV Sopa de Letras - Julio Viera - 2025'),
			this.crear('div', { class: 'flex-horizontal' }, 'Versión: ' + this._version),
		)

		this._tiempo.addEventListener('CuentaRegresivaSegundosTermina', this.terminar)

		this.estilos = this.obtenerEstilos()
		this.agregarNodo(this.estilos)

		this._tablero_escala.addEventListener('input', () => {
			this.almacenaje.guardar('tablero_escala', this._tablero_escala.value)
			this._tablero.style.fontSize = this._tablero_escala.value + 'em'
		})
		this._tablero.style.fontSize = this._tablero_escala.value + 'em'

		this._tablero_saturacion.addEventListener('input', () => {
			this.almacenaje.guardar('tablero_saturacion', this._tablero_saturacion.value)
			this._tablero.style.filter = 'saturate(' + this._tablero_saturacion.value + ')'
		})
		this._tablero.style.filter = 'saturate(' + this._tablero_saturacion.value + ')'

		this._cabecera.append(this.btn_recargar, this._cabecera_div1, this._puntos, this._tiempo)
		this._tablero_cont.appendChild(this._tablero)

		this.agregarNodo(this._cabecera)
		this.agregarNodo(this._tablero_cont)
		this.agregarNodo(this._palabras_cont)
		this.agregarNodo(this._pie)

		this.conector = new Conector({ ruta: 'data/', log: false })
	}

	connectedCallback() {

		if (this.hasAttribute('tablero_tamanio')) this.props.tablero_tamanio = this.getAttribute('tablero_tamanio')
		if (this.hasAttribute('dificultad')) this.props.dificultad = this.getAttribute('dificultad')

		this._dificultad.value = this.props.dificultad
		this._tablero_tamanio.value = this.props.tablero_tamanio

		this.actualizarTableroDimensiones()
	}

	disconnectedCallback() { }

	actualizarTableroDimensiones() {
		const op = this._tablero_tamanio.options[this._tablero_tamanio.selectedIndex]
		this.props.ancho = op.getAttribute('ancho')
		this.props.alto = op.getAttribute('alto')

		this.cargar(this.props)
	}

	limpiar() {
		this._palabras_cont.innerHTML = ''
		this._palabras_texto = []
		this._palabras_nodos = []
		this._tablero.innerHTML = ''
		this._tablero_letras = {}
		this.mensaje = ''
		this._puntos.innerHTML = ''
		this._puntos_de_palabras = 0
		this._puntos.ocultar()
		this._tiempo.ocultar()
	}

	revelarPalabras() {

		for (const nodo of this._palabras_nodos) {
			if (nodo.estado) continue
			nodo.estado = 'revelada'
		}

		if (this.btn_revelar) this.btn_revelar.remove()
	}

	cargar(props) {
		super.propiedadesBase(props)

		this.estado = ESTADO_CARGA.ESPERA
		this.limpiar()

		this.props.permitir_recargar = props.permitir_recargar ?? this.props.permitir_recargar
		this.props.ancho = props.ancho ?? this.props.ancho
		this.props.alto = props.alto ?? this.props.alto
		this.props.dificultad = props.dificultad ?? this.props.dificultad

		if (this.props.ancho < 3 || this.props.alto < 3) {
			this.estado = ESTADO_CARGA.ERROR
			console.error('Dimensiones muy chicas. ', this.props.ancho, this.props.alto)
			this.mensaje = 'Dimensiones muy chicas. ' + this.props.ancho + 'x' + this.props.alto
			return
		}

		const cantidad_palabras = Math.floor(Math.sqrt(Math.pow(this.props.ancho, 2) + Math.pow(this.props.alto, 2)))
		const dif = this.props.dificultad
		let minutos = (cantidad_palabras * 1)

		if(dif == 0) minutos = 0
		else if (dif == 1) minutos *= 3.0
		else if (dif == 2) minutos *= 2.0

		minutos = Math.floor(minutos)

		if (this.log) console.log('Carga Sopa de Letras', this.id, ' Tablero ' + this.props.ancho + 'x' + this.props.alto + ' Cantidad a resolver: ' + cantidad_palabras + ' Minutos: ' + minutos)

		if (this.activo) {
			SopaDeLetras.palabras(this.conector, cantidad_palabras, Math.min(this.props.ancho, this.props.alto))
				.then((j) => {

					if (j && j.error === false && j.palabras && Array.isArray(j.palabras) && j.palabras.length > 0) {
						this.construir(j.palabras)
						this.estado = ESTADO_CARGA.CARGADO
						if(dif == 0){
							this._tiempo.detener()
							this._tiempo.ocultar()
						}
						else{
							this._tiempo.segundos = 60 * minutos
							this._tiempo.mostrar('flex')
						}
						this.actualizarPuntos()
					}
					else {
						console.error('Error: no se pueden cargar las palabras.')
						if (j.msj) this.mensaje = j.msj
						else this.mensaje = this._('Error') + ' ' + this._('No se puede procesar su pedido.') + ' ' + this._('Intentelo de nuevo.')

						this.estado = ESTADO_CARGA.ERROR
					}
				})
				.catch((m) => {
					console.error(m)
					this.mensaje = this._('Error') + ' ' + m
					this.estado = ESTADO_CARGA.ERROR
				})
		}
		else {
			this.mensaje = this._('Sin Palabras.')
			this.estado = ESTADO_CARGA.ERROR
		}
	}

	get fn_seleccion() { return this.props.fn_seleccion }

	set fn_seleccion(fn) {
		if (typeof fn == 'function') this.props.fn_seleccion = fn
	}

	set palabras(opts) {
		if (opts && Array.isArray(opts) && opts.length > 0) {
			this._palabras_texto = opts
		}
	}

	get palabras() { return this._palabras_texto }

	terminar() {
		this.revelarPalabras()
		this.actualizarPuntos(null, true)
		this._tiempo.detener()
	}

	construir(palabras) {

		this.limpiar()

		this._palabras_texto = palabras

		this.btn_revelar = this.crear('div', { class: 'revelar-palabras' }, 'MOSTRAR PALABRAS')
		this.btn_revelar.addEventListener('click', (e) => {
			if (!confirm('¿Seguro que quiere revelar las palabras? Si lo hace perderá los puntos.')) return

			this.terminar()
		})

		this._palabras_cont.appendChild(this.btn_revelar)

		const palabras_nodos_temp = []
		for (const p of this._palabras_texto) {

			if (this.color_indice_asignacion >= this.colores_palabras.length) this.color_indice_asignacion = 0

			const palabra = new Palabra({ texto: p, color: this.colores_palabras[this.color_indice_asignacion++] })
			palabras_nodos_temp.push(palabra)

			palabra.addEventListener('PalabraRevelada', this.comprobarSiTerminoPalabras)
		}

		this._tablero.style.gridTemplateColumns = 'repeat(' + this.props.ancho + ', 1fr)';
		this._tablero.style.gridTemplateRows = 'repeat(' + this.props.alto + ', 1fr)';


		// crea el tablero
		for (let y = 1; y <= this.props.alto; y++) {
			for (let x = 1; x <= this.props.ancho; x++) {
				const letra_nodo = new Letra({ x: x, y: y, letra: '' })

				if (!this._tablero_letras[x]) this._tablero_letras[x] = {}
				this._tablero_letras[x][y] = letra_nodo

				this._tablero.appendChild(letra_nodo)

				letra_nodo.addEventListener('LetraClick', this.clickLetra)
			}
		}

		for (const palabra of palabras_nodos_temp) {
			if (this.ponerPalabraEnTablero(palabra)) {
				this._palabras_nodos.push(palabra)
				this._palabras_cont.appendChild(palabra)
			}
		}

		for (let y = 1; y <= this.props.alto; y++) {
			for (let x = 1; x <= this.props.ancho; x++) {
				const letra_nodo = this._tablero_letras[x][y]
				const signo = letra_nodo.letra
				if (signo == '' || signo == undefined) {
					letra_nodo.letra = this.signoAleatorio()
				}
			}
		}
	}

	signoAleatorio() {
		const i = Math.floor(Math.random() * (this._signos_cantidad - 1))
		return this._signos[i]
	}

	ponerPalabraEnTablero(palabra) {

		let intentos = 10000
		while (intentos--) {
			const iniX = Math.floor(Math.random() * this.props.ancho) + 1
			const iniY = Math.floor(Math.random() * this.props.alto) + 1
			let dirX = 0
			let dirY = 0

			let dir = Math.random()
			if (dir < 0.4) dirX = -1
			else if (dir < 0.8) dirX = 1

			dir = Math.random()
			if (dir < 0.4) dirY = -1
			else if (dir < 0.8) dirY = 1

			if (this.ponerPalabraEnPos(palabra, iniX, iniY, dirX, dirY)) {
				return true
			}
		}

		//console.error('No se puedo asignar Palabra - ' + palabra.texto)

		return false
	}

	ponerPalabraEnPos(palabra, iniX, iniY, dirX, dirY) {

		if (dirX == 0 && dirY == 0) return false

		// verifica si acepta todas las letras la dirección
		const texto = palabra.texto
		let x = iniX
		let y = iniY
		for (const lt of texto) {

			if (!this._tablero_letras[x] || !this._tablero_letras[x][y]) return false

			const letra_nodo = this._tablero_letras[x][y]
			if (!letra_nodo.aceptaLetra(lt)) return false

			x += dirX
			y += dirY
		}

		// aceptadas las posiciones, asigna
		x = iniX
		y = iniY

		for (const lt of texto) {

			const letra_nodo = this._tablero_letras[x][y]

			if (!letra_nodo.asignarLetra(lt, palabra)) return false

			palabra.asignarLetra(letra_nodo)
			x += dirX
			y += dirY
		}

		return true
	}

	limpiarLetrasSeleccionadas() {
		for (const letra of this._letras_seleccionadas) {
			letra.seleccionada = false
		}
		this._letras_seleccionadas = []
	}

	clickLetra(e) {
		const letra_nodo = e.target

		if (letra_nodo.seleccionada) return

		// click sobre letra sin palabras
		if (!e.palabras || e.palabras.length == 0) {
			this.limpiarLetrasSeleccionadas()
			letra_nodo.seleccionada = true
			this._letras_seleccionadas.push(letra_nodo)
			return
		}

		// click sobre letra con palabra, quita las seleccionadas sin palabras anteriores (debe ser una...)
		const _seleccionadas = []
		for (const letra of this._letras_seleccionadas) {
			if (!letra.esDeAlgunaPalabra()) {
				letra.seleccionada = false
			}
			else {
				_seleccionadas.push(letra)
			}
		}
		this._letras_seleccionadas = _seleccionadas


		// seleccionadas de alguna otra palabra
		let de_palabra = 0
		for (const otra_letra of this._letras_seleccionadas) {
			for (const palabra of e.palabras) {
				if (otra_letra.esDePalabra(palabra)) {
					de_palabra++
				}
			}
		}

		if (de_palabra == 0) this.limpiarLetrasSeleccionadas()

		// selecciona la letra si tiene alguna palabra no encontrada
		let encontradas = 0
		for (const palabra of e.palabras) {
			if (palabra.estado == 'encontrada') encontradas++
		}
		if (encontradas < e.palabras.length) {
			letra_nodo.seleccionada = true
			this._letras_seleccionadas.push(letra_nodo)
		}

		// comprueba si se completo la palabra
		for (const palabra of e.palabras) {
			if (!palabra.estado) {
				if (palabra.comprobarSeleccionCompletada()) {
					palabra.estado = 'encontrada'
					this.limpiarLetrasSeleccionadas()
					this.actualizarPuntos(palabra.puntos)
				}
			}
		}

		this.comprobarSiTerminoPalabras()
	}

	comprobarSiTerminoPalabras() {
		let no_disponibles = 0
		for (const palabra of this._palabras_nodos) {
			if (palabra.estado) no_disponibles++
		}

		if (no_disponibles == this._palabras_nodos.length) this.terminar()
	}

	actualizarPuntos(mas_puntos = null, final = false) {

		if (mas_puntos) this._puntos_de_palabras += mas_puntos

		if (final) {
			this._puntos.innerHTML = 'Puntaje final: ' + this._puntos_de_palabras + '!!!'
		}
		else {
			this._puntos.innerHTML = 'Puntos: ' + this._puntos_de_palabras
		}

		this._puntos.mostrar('flex')
	}

	dibujar() {
		if (this.log) console.log('Dibuja Sopa de Letras: ', this.props)

		let ev = new Event('SopaDeLetrasDibujar')
		ev.estado = this.estado
		this.dispatchEvent(ev)

	}

	static async palabras(conector, cantidad, largo_max_palabra) {

		if (!cantidad || cantidad < 0 || cantidad > 1000) {
			return {
				error: true,
				msj: 'Cantidad de palabras no válida.'
			}
		}

		const j = await conector.get('palabras.json')

		// console.log(j)

		if (!j || !j.length) {
			return {
				error: true,
				msj: 'Sin respuesta.'
			}
		}

		const palabras = []
		const max = j.length - 1
		let iter = cantidad
		const indices_usados = new Set()
		while (iter--) {
			while (1) {
				const indice = Math.floor(Math.random() * max)
				const palabra = j[indice].toUpperCase()

				if (palabra.length > largo_max_palabra) continue
				if (indices_usados.has(indice)) continue

				indices_usados.add(indice)
				palabras.push(palabra)
				break;
			}
		}

		return {
			error: false,
			msj: '',
			palabras: palabras
		}

	}


	obtenerEstilos() {
		const estilos = document.createElement("style");

		estilos.textContent = `
	    :host
	    {
	        --sopa-bg-fondo: #ebebeb;
	        --sopa-fn-general: #000000;

	        --sopa-bg-tablero: #222;
	        --sopa-fn-tablero: #000000;

	        --sopa-bg-palabras-cont: #454959;
	        --sopa-bg-palabra: #f33;
	        --sopa-fn-palabra: #000;
	        --sopa-sombra-palabra: #fff;
	        --sopa-borde-palabra-encontrada: #2f3;

	        --sopa-bg-letra: #fff;
	        --sopa-fn-letra: #000000;
	        --sopa-borde-letra: #282a30;

	        --sopa-bg-letra-seleccionada: #9aa4a5;

	        --sopa-bg-letra_hover: #ecf9b3;
	        --sopa-fn-letra_hover: #222;
	        --sopa-borde-letra_hover: #282a30;

	        --sopa-bg-msj: #d3d3d3;
	        --sopa-fn-msj: #1a0101;

	        --sopa-bg-btn-recargar: #d3d3d3;
	        --sopa-fn-btn-recargar: #000000;
	        --sopa-bg-btn-recargar2: #d3d3d3;
	        --sopa-fn-btn-recargar2: #000000;
	    }

			* {
			  padding: 0;
			  margin: 0;
			  color: black;
			  box-sizing: border-box;
			  word-wrap: break-word;
			  font-family: sans-serif;
				transition: 0.3s all;
			}


			:host
			{
					display: block;
			    font-size: 1.0em;
			    background-color: var(--sopa-bg-fondo);
			    color: var(--sopa-fn-general);
			    padding: 1em;
			    margin: 0em;
			    position: relative;
			    border: solid 1px var(--sopa-borde);
			    border-radius: 0.5em;
			    align-items: center;
			    overflow: auto;
			}

			:host([estado="ERROR"])
			{
				border: solid 1px red;
			}



			.coso-espera {
		    display: flex;
		    width: 100% !important;
		    height: 100% !important;
				margin: 0px !important;
		    align-items: center;
		    justify-content: center;
		    position: absolute;
				top: 0;
				background: #12c4c5;
			}

			.btn-recargar
			{
			    display: block;
			    background-color: #4ebb4b;
			    color: #000000;
			    padding: 0.3em 1em;
			    font-size: 1.6em;
			    font-weight: bold;
			    border: none;
			    border-radius: 0.5em;
			    cursor: pointer;
			}
			.btn-recargar:hover
			{
			    background-color: var(--sopa-bg-btn-recargar2);
			    color: var(--sopa-fn-btn-recargar2);
			}

			.dificultad{
		   padding: 0.3em 1em;
		    border-radius: 0.5em;
			}
			.tablero_tamanio{
		   padding: 0.3em 1em;
		    border-radius: 0.5em;
			}

			.revelar-palabras{
		    padding: 0.5em 1em;
		    border-radius: 0.4em;
		    cursor: pointer;
		    background: #bf5353;
		    color: #fff;
		    border: solid 1px black;
				font-weight: bold;
    		text-align: center;
			}

			.palabras-cont{
	  		grid-area: palabras;
				display: flex;
				flex-direction: column;
				gap: 0.6em;
		    background-color: var(--sopa-bg-palabras-cont);
				padding: 1.0em;
				border-radius: 0.3em;
				overflow: auto;
    		font-size: 1.0em;
			}

			palabra-de-sopa{
				position: relative;
				display: flex;
				align-items: center;
		    background-color: var(--sopa-bg-palabra);
		    color: var(--sopa-fn-palabra);
				padding: 0.5em 2em 0.5em 3em;
				border-radius: 0.3em;
				cursor: pointer;
				font-weight: bold;
			}
			palabra-de-sopa.encontrada{
				border: solid 1px var(--sopa-borde-palabra-encontrada);
			}
			palabra-de-sopa.encontrada:before{
				content: '✔';
				position: absolute;
				left: -0.3em;
				top: -0.2em;
				display: flex;
				justify-content: center;
    		align-items: center;
				font-size: 1.4em;
				color: green;
				background-color: white;
				padding: 0.4em;
				margin: 0 1em 0 0;
				border-radius: 50%;
				aspect-ratio: 1;
			}
			palabra-de-sopa.revelada:before{
				content: '✘';
				position: absolute;
				left: -0.3em;
				top: -0.2em;
				display: flex;
				justify-content: center;
    		align-items: center;
				font-size: 1.4em;
				color: red;
				background-color: white;
				padding: 0.4em;
				margin: 0 1em 0 0;
				border-radius: 50%;
				aspect-ratio: 1;
			}

			palabra-de-sopa:hover
			{
				transform: scale(1.05);
			}

			.tablero_cont{
	  		grid-area: tablero;
				background-color: var(--sopa-bg-palabras-cont);
				border-radius: 0.3em;
				padding: 1em;
				overflow: auto;
			}
			.tablero{
				display: grid;
				gap: 0.0em;
		    color: var(--sopa-fn-tablero);
				padding: 0.5em;
				border-radius: 0.3em;
		    font-size: 2.0em;
				font-weight: bold;

				-webkit-touch-callout: none;
		    -webkit-user-select: none;
		    -khtml-user-select: none;
		    -moz-user-select: none;
		    -ms-user-select: none;
		    user-select: none;
			}
			letra-de-sopa
			{
					display: flex;
					padding: 0.2em;
			    background-color: var(--sopa-bg-letra);
			    color: var(--sopa-fn-letra);
       		border: solid 1px var(--sopa-borde-letra);
         	border-radius: 0.0em;
			    justify-content: center;
			    align-items: center;
					cursor: pointer;
					aspect-ratio: 1;
			}
			letra-de-sopa:hover{
			    background-color: var(--sopa-bg-letra_hover);
			    color: var(--sopa-fn-letra_hover);
       		border: solid 1px var(--sopa-borde-letra_hover);
			}

			letra-de-sopa.seleccionada{
			    background-color: var(--sopa-bg-letra-seleccionada) !important;
			}

			.cabecera{
				grid-area: cabecera;
		    display: grid;
		    grid-template-columns: auto auto 1fr 1fr;
				gap: 1em;
			}
			.flex-vertical{
   			display: flex;
      	flex-direction: column;
       	gap: 1em;
        justify-content: center;
		    align-items: center;
			}
			.flex-horizontal{
   			display: flex;
      	flex-direction: row;
       	gap: 1em;
        justify-content: center;
		    align-items: center;
			}
			.puntos{
		   	display: flex;
		    justify-content: center;
		    align-items: center;
				font-size: 2em;
				background: #dcf5f4;
		    border-radius: 0.5em;
		    border: solid 1px #90afae;
   		}
			.cuenta_tiempo{
				display: flex;
		    justify-content: center;
		    align-items: center;
				font-size: 2em;
				background: beige;
		    border-radius: 0.5em;
		    border: solid 1px #aaaf78;
			}
			.pie{
				grid-area: pie;
		    display: grid;
		    padding: 0.5em 1em;
		    grid-template-rows: 1fr;
		    grid-template-columns: 1fr 1fr 1fr 1fr;
				gap: 1em;
			}

			.derecha{
		   	align-self: end;
		    justify-self: end;
			}
			.izquierda{
				align-self: start;
    		justify-self: start;
 			}

			.msj
			{
					grid-area: mensaje;
			    display: block;
			    font-size: 1.6em;
			    background-color: var(--sopa-bg-msj);
			    color: var(--sopa-fn-msj);
			    padding: 0.5em 1em;
			    border-radius: 0.5em;
			}


			main{
			    display: grid !important;
					grid-template-columns: 4fr 1fr !important;
				  grid-template-areas:
						"cabecera cabecera"
						"mensaje mensaje"
						"tablero palabras"
						"pie pie" !important;
					gap: 0.5em;

			    background: white;
					padding: 1em;
				}

				@media only screen and (max-width: 800px) {
					main {
						display: grid !important;
						grid-template-areas:
							"cabecera"
							"mensaje"
							"tablero"
							"palabras"
							"pie" !important;
						grid-template-columns: 1fr !important;
						grid-template-rows: auto auto auto auto !important;
						background: white;
						padding: 1em;
					}

					.palabras-cont{
						flex-direction: row;
						flex-wrap: wrap;
					}
				}

				@media only screen and (max-width: 600px) {
					.cabecera{
						grid-template-columns: auto auto;
					}
					.pie{
				    grid-template-columns: auto auto;
				    gap: 1em;
					}
					.tablero{
						padding: 0;
					}
				}

	  `;

		return estilos
	}
}

customElements.define('sopa-de-letras', SopaDeLetras);
