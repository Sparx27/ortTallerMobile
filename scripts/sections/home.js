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


// Problemas en el cors
async function obtenerImgsCategorias() {
  const usuario = getUsuario()

  return fetch("https://babytracker.develotion.com/imgs/1.png", {
    headers: {
      "Content-Type": "application/json",
      "apikey": usuario.apikey,
      "iduser": usuario.userid
    }
  })
    .then(res => res.json())
    .then(img => console.log(img))
    .catch(dataError => showToaster("Algo salio mal obteniendo la imagen"))
}
/* obtenerImgsCategorias() */

async function mostrarEventos() {
  showLoader()
  const divEventosDia = selector("#divEventosDia")
  const divEventosAntes = selector("#divEventosAntes")
  const divInformes = selector("#divInformes")
  divEventosDia.innerHTML = "<h2>ESTE DIA</h2>"
  divEventosAntes.innerHTML = "<h2>DIAS ANTERIORES</h2>"
  divInformes.style.display = "flex"

  try {
    const [eventos, categorias] = await Promise.all([obtenerEventos(), getCategorias()])
    if (eventos) {
      //Ordenar eventos por fechas y hora
      eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

      //Separar los eventos del día
      const eventosDia = []
      const eventosPasados = []
      eventos.forEach(e => {
        if (new Date(e.fecha).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)) {
          eventosDia.unshift(e)
        }
        else {
          eventosPasados.unshift(e)
        }
      })

      if (eventosDia.length == 0) {
        divInformes.style.display = "none"
        divEventosDia.innerHTML += "<h3>Aún no se han agregado eventos</h3>"
      }
      else {
        const informes = calcularInformes(eventosDia)
        console.log(Math.trunc(informes.ultBiberon / 60) * 60)
        selector("#spanBiberon").innerHTML = informes.biberones
        selector("#spanBiberon2").innerHTML = `${informes.ultBiberon == "--"
          ? "--"
          : informes.ultBiberon >= 60
            ? Math.trunc(informes.ultBiberon / 60) + " hrs : " + Math.round(((informes.ultBiberon / 60) - Math.trunc(informes.ultBiberon / 60)) * 60) + " mins"
            : (informes.ultBiberon + " mins")
          }`
        selector("#spanPanial").innerHTML = informes.paniales
        selector("#spanPanial2").innerHTML = `${informes.ultPanial == "--"
          ? "--"
          : informes.ultPanial >= 60
            ? Math.trunc(informes.ultPanial / 60) + " hrs : " + Math.round(((informes.ultPanial / 60) - Math.trunc(informes.ultPanial / 60)) * 60) + " mins"
            : (informes.ultPanial + " mins")
          }`

        eventosDia.forEach(e => {
          divEventosDia.innerHTML += `
          <article class="eventoCard">
            <h2>${categorias.find(a => a.id == e.idCategoria) ? categorias.find(a => a.id == e.idCategoria).tipo : ""}</h2>
            <p>${e.detalle}</p>
            <p>${e.fecha}</p>
            <button id="e-${e.id}" class="btnEliminarEvento">Eliminar</button>
          </article>
        `
        })
      }

      if (eventosPasados.length == 0) {
        divEventosAntes.innerHTML = "<h3>Aún no se han agregado eventos</h3>"
      }
      else {
        eventosPasados.forEach(e => {
          divEventosAntes.innerHTML += `
          <article class="eventoCard">
            <h2>${categorias.find(a => a.id == e.idCategoria) ? categorias.find(a => a.id == e.idCategoria).tipo : ""}</h2>
            <p>${e.detalle}</p>
            <p>${e.fecha}</p>
            <button id="e-${e.id}" class="btnEliminarEvento">Eliminar</button>
          </article>
        `
        })
      }

      const btns = document.querySelectorAll(".btnEliminarEvento")
      btns.forEach(b => {
        b.addEventListener("click", borrarEvento)
      })
    }
    else {
      divInformes.style.display = "none"
      divEventosDia.innerHTML = ""
      divEventosAntes.innerHTML = ""
      selector("#divEventos").innerHTML = "Aún no se han agregado eventos"
    }
  }
  finally {
    hideLoader()
  }
}

function calcularInformes(eventos) {
  //Se debe ordenar nuevamente para que tome por hora el ultimo
  eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  let res = {
    biberones: 0,
    ultBiberon: "--",
    paniales: 0,
    ultPanial: "--"
  }

  eventos.forEach(e => {
    if (e.idCategoria == 35) {
      res.biberones++
      res.ultBiberon = Math.trunc((new Date() - new Date(e.fecha)) / (1000 * 60))
    }
    if (e.idCategoria == 33) {
      res.paniales++
      res.ultPanial = Math.trunc((new Date() - new Date(e.fecha)) / (1000 * 60))
    }
  })

  res.ultBiberon

  return res
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
