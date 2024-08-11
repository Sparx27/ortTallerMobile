import {
  URL,
  mostrarSeccion,
  selector,
  selectorValue,
  isNullOrEmpty,
  showToaster,
  limpiarInputs,
  mostrarMensaje,
} from "../helpers.js";
import { actualizarUsuario } from "../usuario.js";
import { login } from "./login.js";

selector("#navRegistro").addEventListener("click", () => {
  mostrarSeccion("registro");
  getDepartamentos();
  document.querySelector("#menu").close();
});

function registro() {
  const usuario = selectorValue("#usuarioRegistro");
  const password = selectorValue("#passwordRegistro");
  const password2 = selectorValue("#passwordRegistro2");
  const idDepartamento = Number(selectorValue("#idDepartamentoRegistro"));
  const idCiudad = Number(selectorValue("#idCiudadRegistro"));

  if (isNullOrEmpty(usuario)) {
    mostrarMensaje("Debe proporcionar un usuario");
  } else if (isNullOrEmpty(password)) {
    mostrarMensaje("Debe proporcionar un password");
  } else if (isNullOrEmpty(password2)) {
    mostrarMensaje("Debe confirmar su password");
  } else if (password != password2) {
    mostrarMensaje("Su password no coincide con el de confirmación");
  } else if (isNaN(idDepartamento)) {
    mostrarMensaje("Debe seleccionar un departamento")
  } else if (isNaN(idCiudad)) {
    mostrarMensaje("Debe seleccionar una ciudad")
  } else {
    fetch(URL + "/usuarios.php", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario: usuario,
        password: password,
        idDepartamento: idDepartamento,
        idCiudad: idCiudad,
      }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.codigo != 200) {
          return Promise.reject(data);
        }

        //Pasarlo a un toast
        showToaster(`Usuario registrado con éxito.`);
        mostrarMensaje("Usuario registrado con éxito.");

        //Actualizo el usuario de usuario.js
        actualizarUsuario(data.iduser, data.apiKey);

        limpiarInputs([
          selector("#usuarioRegistro"),
          selector("#passwordRegistro"),
          selector("#passwordRegistro2"),
          selector("#idDepartamentoRegistro"),
          selector("#idCiudadRegistro"),
        ]);

        //Retorno el usuario y password para utilizar la funcion login(us, pas) de login.js
        return { usuario, password };
      })
      .then((usuario) => login(usuario.usuario, usuario.password))
      .catch((errorData) => {
        //Primero comprobar que tiene un código y mensaje como normalmente lo hace
        if (errorData.mensaje) {
          mostrarMensaje(errorData.mensaje);
        } else {
          mostrarMensaje(
            "Disculpe, algo en el registro no salió correctamente"
          );
        }
      });
  }
}

selector("#formRegistro").addEventListener("click", () => {
  registro();
});

/***** GETTERS DE LOS SELECTORS *****/
const departamentoSelect = selector("#idDepartamentoRegistro");
const ciudadSelect = selector("#idCiudadRegistro");
const itemCiudadSelect = selector("#itemCiudadRegistro");

function getDepartamentos() {
  return fetch(URL + "/departamentos.php", {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.codigo == 200) {
        data.departamentos.forEach((d) => {
          departamentoSelect.innerHTML += `<ion-select-option value="${d.id}">${d.nombre}</ion-select-option>`;
        });
      } else {
        Promise.reject(data);
      }
    })
    .catch((dataError) => {
      if (dataError.mensaje) {
        showToaster(dataError.mensaje);
      } else {
        showToaster("Error en la obtención de los departamentos");
      }
    });
}

departamentoSelect.addEventListener("ionChange", () => {
  if (departamentoSelect.value == undefined) {
    ciudadSelect.style.display = "none";
    itemCiudadSelect.style.display = "none";
  } else {
    getCiudades();
  }
});

function getCiudades() {
  return fetch(
    URL + `/ciudades.php?idDepartamento=${departamentoSelect.value}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.codigo != 200) {
        return Promise.reject("Error en la obtención de ciudades");
      }
      ciudadSelect.innerHTML = "";
      data.ciudades.forEach((a) => {
        ciudadSelect.innerHTML += `<ion-select-option value="${a.id}">${a.nombre}</ion-select-option>`;
      });
      ciudadSelect.style.display = "block";
      itemCiudadSelect.style.display = "block";
    })
    .catch((dataError) => {
      if (dataError.mensaje) {
        showToaster(dataError.mensaje);
      } else {
        showToaster("Error en la obtención de los departamentos");
      }
    });
}

export {
  getDepartamentos
}
