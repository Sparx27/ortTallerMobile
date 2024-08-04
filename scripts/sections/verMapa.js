import {
  showToaster,
  URL,
  selector,
  mostrarSeccion,
  showLoader,
  hideLoader,
} from "../helpers.js";
import { getUsuario } from "../usuario.js";

selector("#navMapa").addEventListener("click", () => {
  const usuario = getUsuario();
  if (usuario.apikey == null || usuario.userid == null) {
    manejarEl401();
  } else {
    geolocalizacion();
    mostrarSeccion("verMapa");
    document.querySelector("#menu").close();
  }
});

function geolocalizacion() {
  showLoader();
  let latitud;
  let longitud;

  navigator.geolocation.getCurrentPosition(success, mostrarError);

  function success(position) {
    latitud = position.coords.latitude;
    longitud = position.coords.longitude;
    elMapa(latitud, longitud);
  }
  function mostrarError(error) {
    elMapa();
  }
}

let map;
function elMapa(latitud, longitud) {
  if (map != null || map != undefined) {
    map.remove();
    map = null;
  }
  map = L.map("map").fitWorld();
  L.tileLayer(`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  map.locate({ setView: true, maxZoom: 16 });

  L.marker([
    latitud ? latitud : -34.90371088968206,
    longitud ? longitud : -56.19058160486342,
  ]).addTo(map);

  function onLocationFound(e) {
    var radius = e.accuracy;

    L.marker(e.latlng)
      .addTo(map)
      .bindPopup("You are within " + radius + " meters from this point")
      .openPopup();

    L.circle(e.latlng, radius).addTo(map);
    hideLoader();
  }

  map.on("locationfound", onLocationFound);
}

function obtenerPlazas() {
  const usuario = getUsuario();

  fetch(URL + "/plazas.php", {
    headers: {
      "Content-Type": "application/json",
      apikey: usuario.apikey,
      iduser: usuario.userid,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.codigo != 200) {
        return Promise.reject(data);
      }

      //Hacer algo con el data que es del tipo:
      /* 
      {
        "codigo": 200,
        "plazas": [
          {
            "idPlaza": 87423,
            "latitud": -34.8744554000000022142558009363710880279541015625,
            "longitud": -55.11719719999999966830728226341307163238525390625,
            "accesible": 1,
            "aceptaMascotas": 1
          },
          {
            ...
          },
          ...
      }
      */
    })
    .catch((errorData) => {
      if (errorData.mensaje) {
        showToaster(errorData.mensaje);
      } else {
        showToaster("Disculpe, algo salió mal en la obtención de plazas.");
      }
    });
}

export { geolocalizacion };
