import { URL, mostrarSeccion, selector, selectorValue, isNullOrEmpty, showToaster } from "../helpers.js";
import { actualizarUsuario } from "../usuario.js";
import { login } from "./login.js";

selector("#navRegistro").addEventListener("click", () => {
  mostrarSeccion("registro")
  getDepartamentos()
})

function registro() {
  const pRegistroMensaje = selector("#pRegistroMensaje")
  const usuario = selectorValue("#usuarioRegistro")
  const password = selectorValue("#passwordRegistro")
  const password2 = selectorValue("#passwordRegistro2")
  const idDepartamento = Number(selectorValue("#idDepartamentoRegistro"))
  const idCiudad = Number(selectorValue("#idCiudadRegistro"))

  pRegistroMensaje.innerHTML = ""
  if (isNullOrEmpty(usuario)) {
    pRegistroMensaje.innerHTML = "Debe proporcionar un usuario"
  }
  else if (isNullOrEmpty(password)) {
    pRegistroMensaje.innerHTML = "Debe proporcionar un password"
  }
  else if (isNullOrEmpty(password2)) {
    pRegistroMensaje.innerHTML = "Debe confirmar su password"
  }
  else if (password != password2) {
    pRegistroMensaje.innerHTML = "Su password no coincide con el de confirmación"
  }
  else {
    fetch(URL + "/usuarios.php", {
      method: "Post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "usuario": usuario,
        "password": password,
        "idDepartamento": idDepartamento,
        "idCiudad": idCiudad
      })
    })
      .then(res => res.json())
      .then(async data => {
        if (data.codigo != 200) {
          return Promise.reject(data)
        }

        //Pasarlo a un toast
        showToaster(`Usuario registrado con éxito.`)

        //Actualizo el usuario de usuario.js
        actualizarUsuario(data.iduser, data.apiKey)

        //Retorno el usuario y password para utilizar la funcion login(us, pas) de login.js
        return { usuario, password }
      })
      .then(usuario => login(usuario.usuario, usuario.password))
      .catch(errorData => {
        //Primero comprobar que tiene un código y mensaje como normalmente lo hace
        if (errorData.mensaje) {
          pRegistroMensaje.innerHTML = `Error: ${errorData.mensaje}`
        }
        else {
          pRegistroMensaje.innerHTML = "Disculpe, algo no salió correctamente"
        }
      })
  }
}

selector("#formRegistro").addEventListener("submit", e => {
  e.preventDefault()
  registro()
})


/***** GETTERS DE LOS SELECTORS *****/
const departamentoSelect = selector("#idDepartamentoRegistro")
const ciudadSelect = selector("#idCiudadRegistro")

function getDepartamentos() {
  return fetch(URL + "/departamentos.php", {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.codigo == 200) {
        data.departamentos.forEach(d => {
          departamentoSelect.innerHTML += `<option value="${d.id}">${d.nombre}</option>`
        })
      }
      else {
        Promise.reject(data)
      }
    })
    .catch(dataError => {
      if (dataError.mensaje) {
        showToaster(dataError.mensaje)
      }
      else {
        showToaster("Error en la obtención de los departamentos")
      }
    })
}

departamentoSelect.addEventListener("change", () => {
  if (departamentoSelect.value == "") {
    ciudadSelect.innerHTML = '<option value="">--Seleccionar--</option>'
    ciudadSelect.style.display = "none"
  }
  else {
    getCiudades()
  }
})

function getCiudades() {
  return fetch(URL + `/ciudades.php?idDepartamento=${departamentoSelect.value}`, {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.codigo != 200) {
        return Promise.reject("Error en la obtención de ciudades")
      }
      ciudadSelect.innerHTML = '<option value="">--Seleccionar--</option>'
      data.ciudades.forEach(a => {
        ciudadSelect.innerHTML += `<option value="${a.id}">${a.nombre}</option>`
      })
      ciudadSelect.style.display = "block"
    })
    .catch(dataError => {
      if (dataError.mensaje) {
        showToaster(dataError.mensaje)
      }
      else {
        showToaster("Error en la obtención de los departamentos")
      }
    })
}
