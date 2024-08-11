import {
  URL,
  selector,
  selectorValue,
  mostrarSeccion,
  showLoader,
  hideLoader,
  showToaster,
  manejarEl401,
} from "../helpers.js";
import { getUsuario, logout } from "../usuario.js";
import { getCategorias } from "./agregarEvento.js";

selector("#navHome").addEventListener("click", () => {
  const usuario = getUsuario();
  if (usuario.apikey == null || usuario.userid == null) {
    manejarEl401();
  } else {
    mostrarSeccion("home");
    mostrarEventos();
    document.querySelector("#menu").close();
  }
});

async function obtenerEventos() {
  const usuario = getUsuario();
  /* selector("#divEventos").innerHTML = ""; */

  return fetch(URL + `/eventos.php?idUsuario=${usuario.userid}`, {
    headers: {
      "Content-Type": "application/json",
      apikey: usuario.apikey,
      iduser: usuario.userid,
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(res.json());
    })
    .then((data) => {
      if (data.eventos.length == 0) {
        return null;
      } else {
        return data.eventos;
      }
    })
    .catch((errorData) => {
      if (errorData.codigo == 401) {
        manejarEl401();
      } else if (errorData.mensaje) {
        showLoader(errorData.mensaje);
      } else {
        showToaster("Disculpe, no fue posible obtener los eventos");
      }
    });
}

async function mostrarEventos() {
  showLoader();
  const divEventosDia = selector("#divEventosDia");
  const divEventosAntes = selector("#divEventosAntes");
  const divInformes = selector("#divInformes");
  divEventosDia.innerHTML = "<h1>Eventos del día</h1>";
  divEventosAntes.innerHTML = "<h2>Eventos anteriores</h2>";
  divInformes.style.display = "flex";

  const eventosDia = [];
  const eventosPasados = [];
  try {
    const [eventos, categorias] = await Promise.all([
      obtenerEventos(),
      getCategorias(),
    ]);
    if (eventos) {
      //Ordenar eventos por fechas y hora
      eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      //Separar los eventos del día

      eventos.forEach((e) => {
        if (
          new Date(e.fecha).setHours(0, 0, 0, 0) ==
          new Date().setHours(0, 0, 0, 0)
        ) {
          eventosDia.unshift(e);
        } else {
          eventosPasados.unshift(e);
        }
      });
    }

    if (eventosDia.length == 0) {
      divEventosDia.innerHTML = "<h1>Eventos del día</h1><h3>Aún no se han agregado eventos</h3>";
    } else {
      construirEventosDia(eventosDia, categorias);
    }

    if (eventosPasados.length == 0) {
      divEventosAntes.innerHTML = "<h1>Eventos anteriores</h1><h3>Aún no se han agregado eventos</h3>";
    } else {
      construirEventosPasados(eventosPasados, categorias);
    }

    const btns = document.querySelectorAll(".btnEliminarEvento");
    btns.forEach((b) => {
      b.addEventListener("click", borrarEvento);
    });

  } finally {
    hideLoader();
  }
}

function calcularInformes(eventos) {
  //Se debe ordenar nuevamente para que tome por hora el ultimo
  eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  let res = {
    biberones: 0,
    ultBiberon: "--",
    paniales: 0,
    ultPanial: "--",
  };

  eventos.forEach((e) => {
    if (e.idCategoria == 35) {
      res.biberones++;
      res.ultBiberon = Math.trunc(
        (new Date() - new Date(e.fecha)) / (1000 * 60)
      );
    }
    if (e.idCategoria == 33) {
      res.paniales++;
      res.ultPanial = Math.trunc(
        (new Date() - new Date(e.fecha)) / (1000 * 60)
      );
    }
  });

  res.ultBiberon;

  return res;
}

function construirEventosDia(eventosDia, categorias) {
  const informes = calcularInformes(eventosDia);
  selector("#spanBiberon").innerHTML = informes.biberones;
  selector("#spanBiberon2").innerHTML = `${informes.ultBiberon == "--"
    ? "--"
    : informes.ultBiberon >= 60
      ? Math.trunc(informes.ultBiberon / 60) +
      " hrs : " +
      Math.round(
        (informes.ultBiberon / 60 - Math.trunc(informes.ultBiberon / 60)) * 60
      ) +
      " mins"
      : informes.ultBiberon + " mins"
    }`;
  selector("#spanPanial").innerHTML = informes.paniales;
  selector("#spanPanial2").innerHTML = `${informes.ultPanial == "--"
    ? "--"
    : informes.ultPanial >= 60
      ? Math.trunc(informes.ultPanial / 60) +
      " hrs : " +
      Math.round(
        (informes.ultPanial / 60 - Math.trunc(informes.ultPanial / 60)) * 60
      ) +
      " mins"
      : informes.ultPanial + " mins"
    }`;

  eventosDia.forEach((e) => {
    let idImage = categorias.find((a) => a.id == e.idCategoria)
      ? categorias.find((a) => a.id == e.idCategoria).imagen
      : "";
    divEventosDia.innerHTML += construirCard(e, categorias, idImage);
  });
}

function construirEventosPasados(eventosPasados, categorias) {
  selector("#divEventosAntes").innerHTML = "<h2>DIAS ANTERIORES</h2>";
  eventosPasados.forEach((e) => {
    let idImage = categorias.find((a) => a.id == e.idCategoria)
      ? categorias.find((a) => a.id == e.idCategoria).imagen
      : "";
    divEventosAntes.innerHTML += construirCard(e, categorias, idImage);
  });
}

function construirCard(e, categorias, idImage) {
  return `
  <ion-card>
            <ion-card-header>
              <ion-card-title class="card-title" style="font-size: 22px">
                <img alt="imagen de evento" src="https://babytracker.develotion.com/imgs/${idImage}.png" />

                 ${categorias.find((a) => a.id == e.idCategoria)
      ? categorias.find((a) => a.id == e.idCategoria).tipo
      : ""
    }</ion-card-title
              >
            </ion-card-header>

            <ion-card-content>
              <p class="card-detalle">${e.detalle}</p>
              <div class="card-fecha-btn">
                <p>${String(e.fecha).substring(0, 16)}</p>
                <ion-button
                  size="small"
                  fill="outline"
                  color="danger"
                  style="font-size: 11px"
                  id="e-${e.id}"
                  class="btnEliminarEvento"
                  >Eliminar</ion-button
                >
              </div>
            </ion-card-content>
          </ion-card>
  `;
}

function borrarEvento(e) {
  const usuario = getUsuario();
  showLoader();

  fetch(URL + `/eventos.php?idEvento=${e.target.id.substring(2)}`, {
    method: "Delete",
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
      showToaster(data.mensaje);
      hideLoader();
      mostrarEventos();
    })
    .catch((errorData) => {
      hideLoader();
      if (errorData.codigo == 401) {
        manejarEl401();
      } else if (errorData.mensaje) {
        showToaster(errorData.mensaje);
      } else {
        showToaster("Disculpe, algo salió mal al intentar eliminar el evento.");
      }
    });
}

selector("#btnEventosAnteriores").addEventListener("click", () => {
  mostrarSeccion("eventosAnteriores")
})
selector("#backEventos").addEventListener("click", () => {
  mostrarSeccion("home")
})

export { mostrarEventos, borrarEvento };
