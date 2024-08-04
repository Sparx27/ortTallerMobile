import { menuIncognito } from "./main.js";
import { logout } from "./usuario.js";
import { mostrarEventos } from "./sections/home.js";
import { geolocalizacion } from "./sections/verMapa.js";

const URL = "https://babytracker.develotion.com";

function selector(element) {
  return document.querySelector(`${element}`);
}

function selectorValue(element) {
  return selector(element).value;
}

function mostrarSeccion(sectionId) {
  const sections = document.querySelectorAll("ion-page");
  sections.forEach((s) => (s.style.display = "none"));

  let rutaUrl = sectionId == "home" ? "/" : `/${sectionId}`;
  ruteo.push(rutaUrl);
  document.getElementById(sectionId).style.display = "block";
}

function isNullOrEmpty(string) {
  if (string == undefined || string == null || string.trim().length == 0) {
    return true;
  }
  return false;
}

function showLoader() {
  selector("#loaderContainer").style.display = "block";
}

function hideLoader() {
  selector("#loaderContainer").style.display = "none";
}

let toastShowId = null;
let toastShow = function (toaster) {
  toaster.classList.add("toaster-show");
  let crearSet = setTimeout(() => {
    toaster.classList.remove("toaster-show");
  }, 3000);
  toastShowId = crearSet;
};

let toastMessageId = null;
let toastMessageClear = function () {
  let crearSet = setTimeout(() => {
    toasterMensaje.innerHTML = "";
  }, 4500);
  toastMessageId = crearSet;
};

function showToaster(mensaje) {
  let toast = document.createElement("ion-toast");
  toast.message = mensaje;
  toast.duration = 3500;
  toast.position = "bottom";
  toast.present();
  document.body.appendChild(toast);
}

function limpiarInputs(arr) {
  arr.forEach((i) => (i.value = ""));
}

function manejarEl401() {
  logout();
  menuIncognito();
  mostrarSeccion("login");
  showToaster("Por favor, inicie sesión nuevamente.");
}

let ruteo = selector("#ruteo");
ruteo.addEventListener("ionRouteWillChange", manejarRouter);

function manejarRouter(e) {
  console.log(e);
  let rutaDestino = e.detail.to;
  switch (rutaDestino) {
    case "/":
      mostrarSeccion("home");
      mostrarEventos();
      break;
    case "/registro":
      mostrarSeccion("registro");
      break;
    case "/login":
      mostrarSeccion("login");
      break;
    case "/logout":
      logout();
      break;
    case "/agregarEvento":
      mostrarSeccion("agregarEvento");
      break;
    case "/verMapa":
      mostrarSeccion("verMapa");
      geolocalizacion();
      break;
  }
}

function mostrarMensaje(texto) {
  let toast = document.createElement("ion-toast");
  toast.message = texto;
  toast.duration = 3500;
  toast.position = "bottom";
  toast.present();
  document.body.appendChild(toast);
}

function Volver() {
  console.log("entró");
  console.log(ruteo.detail);
  ruteo.back();
}

document.querySelectorAll(".volver").forEach((e) => {
  e.innerHTML = `<ion-button id="backHome" size="small">Volver</ion-button>`;
});

document.querySelectorAll(".volver").forEach((e) => {
  e.addEventListener("click", Volver);
});

export {
  URL,
  selector,
  selectorValue,
  mostrarSeccion,
  isNullOrEmpty,
  showLoader,
  hideLoader,
  showToaster,
  limpiarInputs,
  manejarEl401,
  mostrarMensaje,
  ruteo,
};
