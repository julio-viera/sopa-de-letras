import { CosoNodo } from './CosoNodo.js'


export class CuentaRegresivaSegundos extends CosoNodo {
	constructor(props) {
		super(props)

		this.detener = this.detener.bind(this)
		this.segundosRestantes = this.segundosRestantes.bind(this)
		this.actualizar = this.actualizar.bind(this)

		this._segundos = this.props.segundos ?? 0
		this._fecha_inicio = null
		this._fecha_fin = null
		this._interval = null
	}

	connectedCallback() {
		super.connectedCallback()
		this.innerHTML = '00:00'
		this.segundos = this._segundos
	}

	disconnectedCallback() {
		super.disconnectedCallback()
	}

	get segundos() { return this._segundos }

	set segundos(seg) {
		this._segundos = seg

		if (this._segundos) {
			this._fecha_inicio = new Date()
			this._fecha_fin = new Date(this._fecha_inicio.getTime() + (this._segundos * 1000));

			if (!this._interval) this._interval = setInterval(this.actualizar, 1000)
		}
		else {
			if (this._interval) {
				clearInterval(this._interval)
				this._interval = null
			}
		}
	}

	detener() {
		if (this._interval) {
			clearInterval(this._interval)
			this._interval = null
		}
	}

	segundosRestantes() {
		const ahora = new Date().getTime();
		const objetivo = this._fecha_fin.getTime()

		const diferencia = objetivo - ahora;
		return Math.floor(diferencia / 1000)
	}

	actualizar() {
		const ahora = new Date().getTime();
		const objetivo = this._fecha_fin.getTime()

		const diferencia = objetivo - ahora;

		if (diferencia <= 0) {
			this.innerHTML = 'Se termino el tiempo!'

			const evento = new Event('CuentaRegresivaSegundosTermina')
			this.dispatchEvent(evento)
			clearInterval(this._interval)
			this._interval = null
			return
		}

		const days = Math.floor(diferencia / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diferencia % (1000 * 60)) / 1000);

		let dias_text = ''
		if (days && days > 0) {
			if (days == 1) dias_text = "" + days + " d&iacute;a "
			else dias_text = "" + days + " d&iacute;as "
		}

		this.innerHTML = 'Tiempo restante: ' + dias_text + String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
	}
}

customElements.define('cuenta-regresiva-segundos', CuentaRegresivaSegundos);
