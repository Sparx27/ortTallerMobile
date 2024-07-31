const URL = "https://babytracker.develotion.com"

function selector(element) {
  return document.querySelector(`${element}`)
}

function selectorValue(element) {
  return selector(element).value
}

function mostrarSeccion(sectionId) {
  const sections = document.querySelectorAll("section")
  sections.forEach(s => s.style.display = "none")

  document.getElementById(sectionId).style.display = "block"
}

function isNullOrEmpty(string) {
  if (string == undefined || string == null || string.trim().length == 0) {
    return true
  }
  return false
}

function showLoader() {
  selector("#loaderContainer").style.display = "block"
}

function hideLoader() {
  selector("#loaderContainer").style.display = "none"
}

let toastShowId = null
let toastShow = function (toaster) {
  toaster.classList.add("toaster-show")
  let crearSet = setTimeout(() => {
    toaster.classList.remove("toaster-show")
  }, 3000)
  toastShowId = crearSet
}

let toastMessageId = null
let toastMessageClear = function () {
  let crearSet = setTimeout(() => {
    toasterMensaje.innerHTML = ""
  }, 4500)
  toastMessageId = crearSet
}

function showToaster(mensaje) {
  const toaster = selector("#toaster")
  const toasterMensaje = selector("#toasterMensaje")

  if (toastShowId) {
    clearTimeout(toastShowId)
    toastShowId = null
  }
  if (toastMessageId) {
    clearTimeout(toastMessageId)
    toastMessageId = null
  }

  toasterMensaje.innerHTML = mensaje

  toastShow(toaster)
  toastMessageClear()
}

function limpiarInputs(arr) {
  arr.forEach(i => i.value = "")
}

export {
  URL,
  selector,
  selectorValue,
  mostrarSeccion,
  isNullOrEmpty,
  showLoader,
  hideLoader,
  showToaster,
  limpiarInputs
}
