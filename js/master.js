import '../scss/master.scss'
import 'Intersection-observer'
import Intro from './Intro_class'
import One from './One_Class'
import Two from './Two_Class'
import Three from './Three_Class'

// INTRO
let introTexts = [
  'Piensa en tu día a día.',
  'En las 9 horas de trabajo\n y tus 8 durmiendo.',
  'Piensa en tu tiempo libre.',
  'Piensa en cuánto tiempo\n le dedicas al móvil.',
  'Haz el cálculo mental.',
  'Mira los mejores años de\n tu vida esfumándose.',
  'Asómate al espejo\n y obsérvate.',
  '¿Cuánto vale tu vida?'
]

function introInit () {
  let introElement = document.querySelector('.intro')
  let scrollHelper = document.querySelector('.scrollHelper img')

  window.intro = new Intro({
    root: introElement,
    scenes: introTexts,
    scrollHelper: scrollHelper,
    scrollGrain: true,
    shutDownCall: oneInit
  })
}

function oneInit () {
  let partOne = document.querySelector('.part-one')
  let scrollHelper = document.querySelector('.scrollHelper img')

  window.one = new One({
    root: partOne,
    scrollHelper: scrollHelper,
    scrollGrain: false
  })
}

function twoInit () {
  let partTwo = document.querySelector('.part-two')
  let scrollHelper = document.querySelector('.scrollHelper img')

  window.two = new Two({
    root: partTwo,
    scrollHelper: scrollHelper,
    scrollGrain: false
  })
}

function threeInit () {
  let partThree = document.querySelector('.part-three')
  let scrollHelper = document.querySelector('.scrollHelper img')

  window.three = new Three({
    root: partThree,
    scrollHelper: scrollHelper,
    scrollGrain: false
  })
}

function viewport () {
  var e = window
  var a = 'inner'
  if (!('innerWidth' in window)) {
    a = 'client'
    e = document.documentElement || document.body
  }
  return { width: e[a + 'Width'], height: e[a + 'Height'] }
}

document.onload = (function () {
  introInit()
  // oneInit()
  // twoInit()
  // threeInit()
})()
