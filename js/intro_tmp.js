/* global Intro */

// INTRO
let introTexts = [
  'Piensa en tu día a día.',
  'En las 9 horas de trabajo<br /> y tus 8 durmiendo.',
  'Piensa en tu tiempo libre.',
  'Piensa en cuánto tiempo<br /> le dedicas al móvil.',
  'Haz el cálculo mental.',
  'Mira los mejores años de<br /> tu vida esfumándose.',
  'Asómate al espejo<br /> y obsérvate.',
  '¿Cuánto vale tu vida?'
]

function intro () {
  let introElement = document.querySelector('.intro')
  let scrollHelper = document.querySelector('.scrollHelper img')
  let intro = new Intro({
    root: introElement,
    scenes: introTexts,
    scrollHelper: scrollHelper,
    scrollGrain: true
  })

  console.log(intro)
}

document.onload = (function () {
  intro()
})()
