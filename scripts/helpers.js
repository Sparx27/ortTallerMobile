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

function showToaster(mensaje) {
  const toaster = selector("#toaster")
  const toasterMensaje = selector("#toasterMensaje")

  toasterMensaje.innerHTML = mensaje

  toaster.classList.add("toaster-show")
  setTimeout(() => {
    toaster.classList.remove("toaster-show")
  }, 3000)
  setTimeout(() => {
    toasterMensaje.innerHTML = ""
  }, 4500)
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
