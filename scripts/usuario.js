let usuario = {
  userid: window.localStorage.getItem("iduser"),
  apikey: window.localStorage.getItem("apikey")
}

function actualizarUsuario(iduser, apikey) {
  window.localStorage.setItem("iduser", iduser)
  window.localStorage.setItem("apikey", apikey)
  usuario.userid = window.localStorage.getItem("iduser")
  usuario.apikey = window.localStorage.getItem("apikey")
}

function logout() {
  window.localStorage.removeItem("iduser")
  window.localStorage.removeItem("apikey")
}

function getUsuario() {
  return usuario
}

export { getUsuario, actualizarUsuario, logout }
