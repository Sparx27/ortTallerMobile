import {
  URL,
  selector,
  selectorValue,
  mostrarSeccion,
  isNullOrEmpty,
  showLoader,
  hideLoader,
  mostrarMensaje,
} from "../helpers.js";
import { actualizarUsuario, logout } from "../usuario.js";
import { mostrarEventos } from "./home.js";
import { menuUsuario } from "../main.js";
import { getUsuario } from "../usuario.js";

selector("#navLogin").addEventListener("click", () => {
  mostrarSeccion("login");
  document.querySelector("#menu").close();
});

function login(us, pas) {
  const pLoginMensaje = selector("#pLoginMensaje");
  let usuario = selectorValue("#usuarioLogin");
  let password = selectorValue("#passwordLogin");

  //Este bloque de if es unicamente para cuando el usuario se registra (en registro.js)
  //y se le pasan por parametros el us y el pas
  if (us !== undefined && pas !== undefined) {
    usuario = us;
    password = pas;
  }

  if (isNullOrEmpty(usuario) || isNullOrEmpty(password)) {
    mostrarMensaje("Debe proporcionar un usuario y password");
  } else {
    showLoader();

    fetch(URL + "/login.php", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario: usuario,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.codigo != 200) {
          return Promise.reject(data);
        }

        menuUsuario();
        hideLoader();
        actualizarUsuario(data.id, data.apiKey);
      })
      .then(() => {
        mostrarSeccion("home");
        mostrarEventos();
      })
      .catch((errorData) => {
        hideLoader();
        if (errorData.mensaje) {
          mostrarMensaje(errorData.mensaje);
        } else {
          mostrarMensaje("Disculpe, algo no salió correctamente");
        }
      });
  }
}

selector("#formLogin").addEventListener("click", () => {
  login();
});

export { login };
