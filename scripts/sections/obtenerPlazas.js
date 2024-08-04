import { showToaster, URL } from "../helpers.js";
import { getUsuario } from "../usuario.js";

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
