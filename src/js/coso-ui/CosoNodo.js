/*
*    @author     Julio Viera 2023
*/
/*
*   Proporciona las funcionalidades de carga base de los nodos.
*/
export class CosoNodo extends HTMLElement {
	constructor(props) {
		super()

		this.props = props ?? {}

		if (!this.props.html_id && this.hasAttribute('id')) this.id = this.getAttribute('id')
		else if (this.props.html_id) this.id = this.props.html_id
		else this.id = CosoNodo.uuidV4()

		if (this.hasAttribute('name')) this.props.name = this.getAttribute('name')

		if (this.hasAttribute('value')) this.props.value = this.getAttribute('value')

		if (this.hasAttribute('class')) this.props.class = this.getAttribute('class')

		if (this.hasAttribute('log')) this.props.log = this.getAttribute('log') === 'true'

		if (this.props.activo === false || this.hasAttribute('disabled')) this.props.activo = false
		else this.props.activo = true

		this.propiedadesBase(this.props)
	}

	connectedCallback() {
		this._modo_display = this.style.display
	}

	disconnectedCallback() { }

	propiedadesBase(props) {
		if (props.id) { this.props.id = props.id; this.id = this.props.id }

		if (props.name) { this.props.name = props.name; this.name = this.props.name }

		if (props.value) { this.props.value = props.value; this.value = this.props.value }

		this.log = false
		if (props.log) {
			this.props.log = props.log
			this.log = this.props.log
		}

		if (props.class) {
			this.props.class = props.class
			this.setAttribute('class', this.props.class)
		}

		if (props.title) {
			this.props.title = props.title
			this.setAttribute('title', this.props.title)
			this._titulo_original = this.props.title
		}

		if (props.activo === false) {
			this.props.activo = false
			this.activo = false
		}
		else {
			this.props.activo = true
			this.activo = true
		}

	}

	get activo() { return !this.hasAttribute('disabled') }

	set activo(val) {
		if (!val) {
			this.setAttribute('disabled', '')
			this.setAttribute('title', this._('Deshabilitado') + (this._titulo_original ? ' - ' + this._titulo_original : ''))

			let ev = new Event('CosoNodoDeshabilitado')
			this.dispatchEvent(ev)
		}
		else {
			this.removeAttribute('disabled')
			if (this._titulo_original) this.setAttribute('title', this._titulo_original)
			else this.removeAttribute('title')

			let ev = new Event('CosoNodoHabilitado')
			this.dispatchEvent(ev)
		}
	}

	mostrar(modo = 'block') {
		if (!modo && this._modo_display && this._modo_display != "none") modo = this._modo_display
		else if (!modo) modo = "block"

		this.style.display = modo

		let ev = new Event('CosoNodoMostrar')
		this.dispatchEvent(ev)
	}
	ocultar() {
		this.style.display = 'none'

		let ev = new Event('CosoNodoOcultar')
		this.dispatchEvent(ev)
	}

	crear(etiqueta = 'div', atributos = {}, hijos = []) {
		return CosoNodo.crearElemento(etiqueta, atributos, hijos);
	}

	static crearElemento(etiqueta = 'div', atributos = {}, hijos = []) {
		const elem = document.createElement(etiqueta)
		CosoNodo.asignarAtributos(elem, atributos)
		CosoNodo.asignarElementos(elem, hijos)

		elem.mostrar = function (modo = null) {
			if (!modo && this._modo_display && this._modo_display != 'none') modo = this._modo_display

			if (!modo || modo == 'none') modo = 'block'

			this.style.display = modo
		}

		elem.ocultar = function () {
			if (this.style.display != 'none') this._modo_display = this.style.display

			this.style.display = 'none'
		}

		return elem
	}
	static asignarAtributos(elem, atributos) {
		for (const a in atributos) {
			if (elem.type == 'checkbox' && a == 'checked' && atributos[a] === false) continue
			else if (a == 'required' && atributos[a] === false) continue
			else if (a == 'disabled' && atributos[a] === false) continue
			else if (elem.tagName == 'option' && a == 'selected' && atributos[a] === false) continue

			if (typeof atributos[a] === 'function') elem[a] = atributos[a]
			else elem.setAttribute(a, atributos[a])
		}
	}
	static asignarElementos(elem, hijos) {
		if (hijos instanceof Array) {
			for (const h of hijos) {
				if (h instanceof Node) elem.appendChild(h)
				else elem.appendChild(document.createTextNode(h))
			}
		}
		else if (hijos instanceof Node) elem.appendChild(hijos)
		else if (hijos) elem.appendChild(document.createTextNode(hijos))
	}

	_(t) {
		return window.coso_idioma && window.coso_idioma[t] ? window.coso_idioma[t] : t
	}

	// 		https://gist.github.com/scwood/3bff42cc005cc20ab7ec98f0d8e1d59d
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

customElements.define('coso-nodo', CosoNodo);
