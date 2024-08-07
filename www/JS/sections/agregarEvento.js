import {
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
  ruteo,
} from "../helpers.js";
import { getUsuario } from "../usuario.js";

selector("#navAgregarEvento").addEventListener("click", () => {
  getCategorias();
  mostrarSeccion("agregarEvento");
});

selector("#formAgregarEvento").addEventListener("click", () => {
  showLoader();
  const usuario = getUsuario();
  let idCategoria = null;
  if (Number(selectorValue("#idCategoriaAgregarEvento")) != 0) {
    idCategoria = Number(selectorValue("#idCategoriaAgregarEvento"));
  }
  const detalle = selectorValue("#detalleAgregarEvento");
  const fecha = selectorValue("#fechaAgregarEvento");

  if (idCategoria == null) {
    showToaster("Por favor, ingrese una categoría");
    hideLoader();
  } else if (new Date(fecha) > new Date()) {
    showToaster(
      "La fecha y hora ingresada, no puede ser posterior a la actual"
    );
    hideLoader();
  } else {
    fetch(URL + "/eventos.php", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
        apikey: usuario.apikey,
        iduser: usuario.userid,
      },
      body: JSON.stringify({
        idCategoria: idCategoria,
        idUsuario: usuario.userid,
        detalle: detalle,
        fecha: fecha,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.codigo != 200) {
          return Promise.reject(data);
        }

        showToaster(data.mensaje);
        limpiarInputs([
          selector("#idCategoriaAgregarEvento"),
          selector("#detalleAgregarEvento"),
          selector("#fechaAgregarEvento"),
        ]);
        hideLoader();
      })
      .catch((dataError) => {
        hideLoader();
        if (dataError.mensaje == 401) {
          manejarEl401();
        } else if (dataError.mensaje) {
          showToaster(dataError.mensaje);
        } else {
          showToaster(
            "Disculpe, algo en agregar evento, no salio correctamente"
          );
        }
      });
  }
});

/***** GETTERS DEL SELECT *****/
async function getCategorias() {
  const usuario = getUsuario();
  const categoriasSelect = selector("#idCategoriaAgregarEvento");
  categoriasSelect.innerHTML = "";
  return fetch(URL + "/categorias.php", {
    headers: {
      "Content-Type": "application/json",
      apikey: usuario.apikey,
      iduser: usuario.userid,
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (data.codigo != 200) {
        return Promise.reject(data);
      }

      data.categorias.forEach((a) => {
        categoriasSelect.innerHTML += `<ion-select-option value="${a.id}">${a.tipo}</ion-select-option>`;
      });
      return data.categorias;
    })
    .catch((dataError) => {
      if (dataError.codigo == 401) {
        manejarEl401();
      } else if (dataError.mensaje) {
        showToaster(dataError.mensaje);
      } else {
        showToaster("Disculpe, no fue posible obtener las categorías");
      }
    });
}

export { getCategorias };
