import {
  showToaster,
  selector,
  mostrarSeccion,
  showLoader,
  hideLoader,
} from "../helpers.js";
import { getUsuario } from "../usuario.js";
const cusIco = new URL('../../assets/custom_icon.png', import.meta.url).href

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
    }, 1000);
  }
  function mostrarError(error) {
    setTimeout(() => {
      elMapa();
    }, 1000)
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

  if (latitud == undefined || longitud == undefined) {
    map.setView([-34.90371088968206, -56.19058160486342], 16)
  }
  else {
    map.locate({ setView: true, maxZoom: 16 });
  }

  var customIcon = L.icon({
    iconUrl: cusIco,  // La ruta a tu imagen de icono
    iconSize: [38, 38],              // Tamaño del icono
    iconAnchor: [19, 38],            // Punto del icono que estará en la posición del marcador
    popupAnchor: [0, -38]            // Punto desde donde se abrirá el popup
  });

  L.marker([
    latitud ? latitud : -34.90371088968206,
    longitud ? longitud : -56.19058160486342,
  ], { icon: customIcon }).addTo(map).bindPopup("No fue posible encontrar su ubicación").openPopup();

  function onLocationFound(e) {
    var radius = e.accuracy;

    L.marker(e.latlng, { icon: customIcon })
      .addTo(map)
      .bindPopup("Usted se encuentra aquí")
      .openPopup();

    L.circle(e.latlng, radius).addTo(map);
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
      hideLoader();
    })
    .catch((errorData) => {
      hideLoader();
      if (errorData.mensaje) {
        showToaster(errorData.mensaje);
      } else {
        showToaster("Disculpe, algo salió mal en la obtención de plazas.");
      }
    });
}

export { geolocalizacion };
