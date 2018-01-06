function submitFormOne () {
  let form = document.querySelector('.part-one .slide form')
  let age = parseInt(form.querySelector('input[name="age"]').value)
  let time = parseInt(form.querySelector('input[name="time"]').value)

  if (time > 0 && time > 6) {
    console.log('vida not found')
    showNotFound()
    return
  }

  let statAge = 82
  let days = (statAge - age) * 365
  let hours = 24 * days
  console.log(days)
  console.log(hours)
}

function showNotFound () {
  let notFound = '<div class="slide not-found" data-index="-1"><h2>Vida<br /> not<br /> found</h2><div class="sectionHelper"><p>Volver al inicio</p></div></div>'
  let slideOne = document.querySelector('.part-one .slide:nth-child(1)')
  insertAfter(notFound, slideOne)
}

function insertAfter (newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

function partOne () {
  let submitForm = document.querySelector('.part-one .slide:nth-child(1) .sectionHelper')
  submitForm.addEventListener('click', submitFormOne, false)
}

document.onload = (function () {
  partOne()
})()
