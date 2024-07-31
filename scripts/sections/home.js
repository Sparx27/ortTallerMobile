import { URL, selector, selectorValue, mostrarSeccion, showLoader, hideLoader, showToaster, manejarEl401 } from '../helpers.js'
import { getUsuario, logout } from '../usuario.js'
import { getCategorias } from './agregarEvento.js'

selector("#navHome").addEventListener("click", () => {
  mostrarSeccion("home")
  mostrarEventos()
})

async function obtenerEventos() {
  const usuario = getUsuario()
  const pMensajeEventos = selector("#pMensajeEventos")
  pMensajeEventos.innerHTML = ""

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
      return Promise.reject(res.json())
    })
    .then(data => {
      if (data.eventos.length == 0) {
        selector("#divEventos").innerHTML = "Aún no se han agregado eventos"
        return null
      }
      else {
        return data.eventos
      }
    })
    .catch(errorData => {
      if (errorData.codigo == 401) {
        manejarEl401()
      }
      else if (errorData.mensaje) {
        showLoader(errorData.mensaje)
      }
      else {
        showToaster("Disculpe, no fue posible obtener las categorías")
      }
    })
}

async function mostrarEventos() {
  showLoader()
  selector("#divEventos").innerHTML = ""

  try {
    const [eventos, categorias] = await Promise.all([obtenerEventos(), getCategorias()])

    console.log(eventos)


    if (eventos) {
      //Ordenar eventos por fechas y hora
      eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

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
    else {
      selector("#divEventos").innerHTML = "Aún no se han agregado eventos"
    }
  }
  finally {
    hideLoader()
  }
}

function borrarEvento(e) {
  const usuario = getUsuario()
  showLoader()

  fetch(URL + `/eventos.php?idEvento=${e.target.id.substring(2)}`, {
    method: "Delete",
    headers: {
      "Content-Type": "application/json",
      "apikey": usuario.apikey,
      "iduser": usuario.userid
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.codigo != 200) {
        return Promise.reject(data)
      }
      showToaster(data.mensaje)
      hideLoader()
      mostrarEventos()
    })
    .catch(errorData => {
      hideLoader()
      if (errorData.codigo == 401) {
        manejarEl401()
      }
      else if (errorData.mensaje) {
        showToaster(errorData.mensaje)
      }
      else {
        showToaster("Disculpe, algo salió mal al intentar eliminar el evento.")
      }
    })
}

export { mostrarEventos }