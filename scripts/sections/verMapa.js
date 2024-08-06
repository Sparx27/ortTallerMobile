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
    setTimeout(() => {
      elMapa(latitud, longitud);
    }, 2500);
  }
  function mostrarError(error) {
    elMapa();
  }
}

let map;
async function elMapa(latitud, longitud) {
  if (map != null || map != undefined) {
    map.remove();
    map = null;
  }
  map = L.map("map").fitWorld();
  L.tileLayer(`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
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

  await obtenerPlazas();
}

async function obtenerPlazas() {
  const usuario = getUsuario();

  fetch("https://babytracker.develotion.com/plazas.php", {
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
      let accesible;
      let mascotas;

      data.plazas.forEach((p) => {
        let plaza = L.marker([p.latitud, p.longitud]).addTo(map);
        let props;
        if (p.accesible == 1) {
          accesible = "♿";
        } else {
          accesible = "";
        }
        if (p.aceptaMascotas == 1) {
          mascotas = "🐶";
        } else {
          mascotas = "";
        }
        props = accesible + mascotas;
        if (props) plaza.bindPopup(`${props}`);
      });
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
