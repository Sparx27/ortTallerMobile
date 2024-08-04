import { mostrarSeccion, selector, showToaster } from "./helpers.js";
import { getUsuario, logout } from "./usuario.js";
import { mostrarEventos } from "./sections/home.js";

import "./sections/registro.js";
import "./sections/login.js";
import "./sections/home.js";
import "./sections/agregarEvento.js";
import "./sections/obtenerPlazas.js";

/***** MENU *****/
const navHome = selector("#navHome");
const navLogin = selector("#navLogin");
const navRegistro = selector("#navRegistro");
const navLogout = selector("#navLogout");
const menu = selector("#menu");
const navMapa = selector("#navMapa");

navLogout.addEventListener("click", () => {
  logout();
  showToaster("Sesión cerrada");
  menuIncognito();
  mostrarSeccion("login");
  menuIncognito();
  document.querySelector("#menu").close();
});

/***** SECTIONS *****/
const sectionHome = selector("#home");
const sectionLogin = selector("#login");

Inicio();
function Inicio() {
  const usuario = getUsuario();

  if (usuario.userid == null || usuario.apikey == null) {
    inicioIncognito();
  } else {
    inicioUsuario();
  }
}

function inicioIncognito() {
  menuIncognito();
  sectionLogin.style.display = "block";
}

function inicioUsuario() {
  menuUsuario();
  mostrarEventos();
  sectionHome.style.display = "block";
}

function menuIncognito() {
  /** MOSTRAR **/
  navLogin.style.display = "inline";
  navRegistro.style.display = "inline";
  /** OCULTAR **/
  navHome.style.display = "none";
  navLogout.style.display = "none";
  navMapa.style.display = "none";
}

function menuUsuario() {
  /** MOSTRAR **/
  navHome.style.display = "inline";
  navLogout.style.display = "inline";
  navMapa.style.display = "inline";
  /** OCULTAR **/
  navLogin.style.display = "none";
  navRegistro.style.display = "none";
}

export { menuIncognito, menuUsuario };
