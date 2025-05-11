/*
*    @author     Julio Viera 2023
*/

import { Conector } from './Conector.js'
import { CosoNodo } from './CosoNodo.js'

export const ESTADO_CARGA = {
	ERROR: 'ERROR',
	INICIADO: 'INICIADO',
	CARGADO: 'CARGADO',
	ESPERA: 'ESPERA'
}

/*
*   Proporciona las funcionalidades base de los componentes.
*/
export class CosoComponente extends CosoNodo {
	static componente_nodo_en_lightbox = null
	static componente_fondo_lightbox = null

	constructor(props) {
		super(props)

		this.agregarNodo = this.agregarNodo.bind(this)
		this.propiedadesBase = this.propiedadesBase.bind(this)
		this.obtenerEstilosBase = this.obtenerEstilosBase.bind(this)
		this.abrirLightbox = this.abrirLightbox.bind(this)
		this.cerrarLightbox = this.cerrarLightbox.bind(this)

		//this.propiedadesBase(this.props)

		this.estilos = this.obtenerEstilosBase()

		this.nodo_espera = null
		this.nodo_msj = null

		this._raiz = this.attachShadow({ mode: "closed" })
		this._main = this.crear('main', { class: 'coso-componente-main' }, '')
		this._raiz.appendChild(this._main)
		this._raiz.appendChild(this.estilos)

		this._estado = ESTADO_CARGA.INICIADO
	}

	agregarNodo(nodo) {
		this._main.appendChild(nodo)
	}

	connectedCallback() {
		super.connectedCallback()

		if (this.props.usar_espera && !this.nodo_espera) {
			this.nodo_espera = this.crear('div', { class: 'coso-espera' }, this.crear('span', { class: 'coso-espera-puntos' }))
			this.agregarNodo(this.nodo_espera)
		}

		if (this.props.usar_msj && !this.nodo_msj) {
			this.nodo_msj = this.crear('span', { class: 'msj' }, '')
			this.agregarNodo(this.nodo_msj)
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback()
	}

	propiedadesBase(props) {
		super.propiedadesBase(props)

		if (!this.classList.contains('coso-componente')) this.classList.add('coso-componente')

		if (props.conector) this.props.conector = props.conector
	}

	get espera() { return this._estado == ESTADO_CARGA.ESPERA }

	set espera(e) {
		this.estado = ESTADO_CARGA.ESPERA
	}

	get estado() { return this._estado }

	set estado(e) {
		this._estado = e

		this.setAttribute('estado', this._estado)

		if (this.nodo_espera) {
			this.nodo_espera.style.display = this._estado == ESTADO_CARGA.ESPERA ? 'flex' : 'none'
		}

		let est = new Event('CosoComponenteEstado')
		est.estado = e
		this.dispatchEvent(est)

		if (this.dibujar) this.dibujar()
	}

	get mensaje() {
		if (!this.nodo_msj) return null

		return this.nodo_msj.textContent
	}

	set mensaje(m) {
		if (!this.nodo_msj) return

		if (m) this.nodo_msj.style.display = 'inline'
		else this.nodo_msj.style.display = 'none'

		this.nodo_msj.textContent = m
	}

	abrirLightbox() {
		if (this._main.hasAttribute('coso_componente_lightbox')) return

		this._main.setAttribute('coso_componente_lightbox', '1')

		if (!this._fondo_lightbox) {
			this._fondo_lightbox = document.createElement('div')
			this._fondo_lightbox.setAttribute('class', 'coso-componente-lightbox-fondo')
			this._fondo_lightbox.onclick = this.cerrarLightbox
			this._raiz.appendChild(this._fondo_lightbox)
		}


		let ev = new Event('CosoComponenteLightboxAbrir')
		this.dispatchEvent(ev)
	}
	cerrarLightbox() {
		if (!this._main.hasAttribute('coso_componente_lightbox')) return

		this._main.removeAttribute('coso_componente_lightbox')

		if (this._fondo_lightbox) {
			this._fondo_lightbox.remove()
			this._fondo_lightbox = null
		}

		let ev = new Event('CosoComponenteLightboxCerrar')
		this.dispatchEvent(ev)
	}

	get conector() {
		if (!this._conector) this._conector = new Conector({ ruta: '/rest/', log: true })
		return this._conector
	}

	set conector(c) {
		this._conector = c
	}

	obtenerEstilosBase() {
		const estilos_base = document.createElement("style");

		estilos_base.textContent = `
			:host {font-size:calc(10px + 0.15vw);}

		  * {
		    padding: 0;
		    margin: 0;
		    color: black;
		    box-sizing: border-box;
		    word-wrap: break-word;
		    font-family: sans-serif;
				transition: 0.3s all;
		  }

		  body{background-color:#fff; font-family: sans-serif; color: #000; font-size: 1.0rem;}
		  h1,h2,h3,h4,h5,h6{margin:10px 20px;}
		  article,aside,details,figcaption,figure,footer,header,hgroup,main,nav,section,summary{display:block;}
		  ul{list-style-type: none;}
		  li{list-style-type:none;}
		  td{vertical-align:top;}
		  mark{background: #b6ebeb; padding: 0.2em; border-radius: 0.3em;}

		  audio,canvas,video{display:inline-block}
		  audio:not([controls]){display:none;height:0}

		  :host
		  {
		    --espera-ancho: 1em;
		    --espera-desplazar: 1em;
		    --bg-espera1: #9fa0ca;
		    --bg-espera2: #3e3fac;

		    box-sizing: border-box;
		  }
		  :host([disabled])
		  {
				filter: brightness(0.5);
		  }

		  .coso-espera {

		      display: flex;
		      justify-content: center;
		      width: calc(calc(var(--espera-ancho) * 3) + calc(var(--espera-desplazar) * 2));
		      height: auto;
		      margin: 0.3em 1em;
		  }
		  .coso-espera-puntos {
		      display: inline-block;
		      width: var(--espera-ancho);
		      height: var(--espera-ancho);
		      border-radius: 50%;
		      background-color: var(--bg-espera1);
		      box-shadow: var(--espera-desplazar) 0 var(--bg-espera1), calc(var(--espera-desplazar) * -1) 0 var(--bg-espera1);
		      position: relative;
		      animation: anim-espera 1.0s ease-out infinite alternate;
		  }

		  @keyframes anim-espera {
		      0% {
		          background-color: var(--bg-espera2);
		          box-shadow: var(--espera-desplazar) 0 var(--bg-espera2), calc(var(--espera-desplazar) * -1) 0 var(--bg-espera1);
		      }
		      50% {
		          background-color: var(--bg-espera1);
		          box-shadow: var(--espera-desplazar) 0 var(--bg-espera2), calc(var(--espera-desplazar) * -1) 0 var(--bg-espera2);
		      }
		      100% {
		          background-color: var(--bg-espera2);
		          box-shadow: var(--espera-desplazar) 0 var(--bg-espera1), calc(var(--espera-desplazar) * -1) 0 var(--bg-espera2);
		      }
		  }

			:host
			{
				display: block;
				position: relative;
			}

		  main[coso_componente_lightbox]
		  {
		      box-sizing: border-box !important;
		      width: fit-content !important;
		      min-width: 50% !important;
		      max-width: 90% !important;
		      box-shadow: 1px 1px 10px 1px #000 !important;
		      cursor: default !important;
		      position: fixed !important;
		      top: 3% !important;
		      left: 5% !important;
		      right: 5% !important;
		      margin: auto !important;
		      z-index: 100000001 !important;
		      overflow: auto !important;
		      max-height: 90vh !important;
		  }

		  .coso-componente-lightbox-fondo
		  {
		      z-index: 100000000;
		      position: fixed;
		      top: 0;
		      left: 0;
		      width: 100%;
		      height: 100%;
		      background-color: rgba(0,0,0,.5);
		      cursor: crosshair;
		  }

			.coso-componente-main
			{
				display: block;
				position: relative;
				font-size: 1em;
			}

		  `;

		return estilos_base
	}
}

customElements.define('coso-componente', CosoComponente);
