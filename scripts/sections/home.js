import { URL, selector, selectorValue, mostrarSeccion, showLoader, hideLoader } from '../helpers.js'
import { getUsuario } from '../usuario.js'
import { getCategorias } from './agregarEvento.js'

selector("#navHome").addEventListener("click", () => {
  mostrarSeccion("home")
  mostrarEventos()
})

async function obtenerEventos() {
  const usuario = getUsuario()

  const pMensajeEventos = selector("#pMensajeEventos")
  showLoader()
  selector("#divEventos").innerHTML = ""

  return fetch(URL + `/eventos.php?idUsuario=${usuario.userid}`, {
    headers: {
      "Content-Type": "application/json",
      "apikey": usuario.apikey,
      "iduser": usuario.userid
    }
  })
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      return Promise.reject("Disculpe, algo no salió correctamente")
    })
    .then(data => {
      if (data.eventos.length == 0) {
        selector("#divEventos").innerHTML = "Aún no se han agregado eventos"
        hideLoader()
        return null
      }
      else {
        hideLoader()
        return data.eventos
      }
    })
    .catch(errorData => {
      hideLoader()
      pMensajeEventos.innerHTML = errorData
    })
}

async function mostrarEventos() {
  selector("#divEventos").innerHTML = ""

  const [eventos, categorias] = await Promise.all([obtenerEventos(), getCategorias()])

  eventos.forEach(e => {
    selector("#divEventos").innerHTML += `
      <article class="eventoCard">
        <h2>${categorias.find(a => a.id == e.idCategoria) ? categorias.find(a => a.id == e.idCategoria).tipo : ""}</h2>
        <p>${e.detalle}</p>
        <p>${e.fecha}</p>
        <button id="e-${e.id}" class="btnEliminarEvento">Eliminar</button>
      </article>
    `
  })

  const btns = document.querySelectorAll(".btnEliminarEvento")
  btns.forEach(b => {
    b.addEventListener("click", borrarEvento)
  })
}

function borrarEvento(e) {

}

export { mostrarEventos }