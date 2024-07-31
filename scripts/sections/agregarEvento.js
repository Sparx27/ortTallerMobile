import { URL, selector, selectorValue, mostrarSeccion, isNullOrEmpty, showLoader, hideLoader, showToaster } from '../helpers.js'
import { getUsuario } from '../usuario.js'

selector("#navAgregarEvento").addEventListener("click", () => {
  getCategorias()
  mostrarSeccion("agregarEvento")
})

selector("#formAgregarEvento").addEventListener("submit", (e) => {
  e.preventDefault()
  const usuario = getUsuario()
  let idCategoria = null
  if (Number(selectorValue("#idCategoriaAgregarEvento")) != 0) {
    idCategoria = Number(selectorValue("#idCategoriaAgregarEvento"))
  }
  const detalle = selectorValue("#detalleAgregarEvento")
  const fecha = selectorValue("#fechaAgregarEvento")
  const pMensajeAgregarEvento = selector("#pMensajeAgregarEvento")
  pMensajeAgregarEvento.innerHTML = ""

  if (isNullOrEmpty(detalle) && idCategoria == null) {
    showToaster("Por favor, ingrese un detalle o una categoría")
  }
  else {
    fetch(URL + "/eventos.php", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
        "apikey": usuario.apikey,
        "iduser": usuario.userid
      },
      body: JSON.stringify({
        "idCategoria": idCategoria,
        "idUsuario": usuario.userid,
        "detalle": detalle,
        "fecha": fecha
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.codigo != 200) {
          return Promise.reject(data)
        }

        showToaster(data.mensaje)
      })
      .catch(dataError => {
        if (dataError.mensaje) {
          showToaster(dataError.mensaje)
        }
        else {
          showToaster("Disculpe, algo no salio correctamente")
        }
      })
  }
})


/***** GETTERS DEL SELECT *****/
async function getCategorias() {
  const usuario = getUsuario()
  const categoriasSelect = selector("#idCategoriaAgregarEvento")
  categoriasSelect.innerHTML = '<option value="">--Seleccionar--</option>'

  return fetch(URL + "/categorias.php", {
    headers: {
      "Content-Type": "application/json",
      "apikey": usuario.apikey,
      "iduser": usuario.userid
    }
  })
    .then(res => {
      return res.json()
    })
    .then(data => {
      if (data.codigo != 200) {
        return Promise.reject(data)
      }

      data.categorias.forEach(a => {
        categoriasSelect.innerHTML += `<option value="${a.id}">${a.tipo}</option>`
      })
      return data.categorias
    })
    .catch(dataError => {
      if (dataError.mensaje) {
        showToaster(dataError.mensaje)
      }
      else {
        showToaster("Disculpe, no fue posible obtener las categorías")
      }
    })
}

export { getCategorias }