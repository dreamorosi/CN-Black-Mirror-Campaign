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
let introEl = document.querySelector('.intro')
let oneEl = document.querySelector('.part-one')
let twoEl = document.querySelector('.part-two')
let threeEl = document.querySelector('.part-three')
let scrollHelper = document.querySelector('.scrollHelper img')

function introInit (scene = 0) {
  window.intro = null
  introEl.style.display = 'block'
  window.one = null
  oneEl.style.display = 'none'
  window.two = null
  twoEl.style.display = 'none'
  window.three = null
  threeEl.style.display = 'none'

  window.intro = new Intro({
    root: introEl,
    scenes: introTexts,
    scrollHelper: scrollHelper,
    scrollGrain: true,
    shutDownCall: oneInit,
    setScene: scene
  })
}

function oneInit (scene = 0) {
  window.intro = null
  introEl.style.display = 'none'
  window.one = null
  oneEl.style.display = 'flex'
  window.two = null
  twoEl.style.display = 'none'
  window.three = null
  threeEl.style.display = 'none'

  window.one = new One({
    root: oneEl,
    scrollHelper: scrollHelper,
    scrollGrain: false,
    shutDownCall: twoInit,
    restorePrev: introInit,
    setScene: scene
  })
}

const twoTexts = [
  '&gt; Tu vida en la nube es una ficción acelerada.<br class="bg" /> Una broma rentabilizada por visionarios<br class="bg" /> de Silicon Valley. /',
  '&gt; Hueles a batería caliente.<br class="bg" /> A manojo de datos. /',
  '&gt; ¿Te aterra desconectarte? hazme caso:<br class="bg" /> junta tus likes, súmalos, apunta el número<br class="bg" /> y guárdalo en una caja fuerte. /',
  '&gt; Dentro de 10 años será tu único recuerdo agradable.<br class="bg" /> Todo lo demás se habrá desvanecido. /'
]

function twoInit (scene = 0) {
  window.intro = null
  introEl.style.display = 'none'
  window.one = null
  oneEl.style.display = 'none'
  window.two = null
  // twoEl.style.display = 'none'
  window.three = null
  threeEl.style.display = 'none'

  window.two = new Two({
    root: twoEl,
    scrollHelper: scrollHelper,
    scrollGrain: false,
    texts: twoTexts,
    shutDownCall: threeInit,
    restorePrev: oneInit,
    setScene: scene
  })
}

function threeInit (scene = 0) {
  window.intro = null
  introEl.style.display = 'none'
  window.one = null
  oneEl.style.display = 'none'
  window.two = null
  twoEl.style.display = 'none'
  window.three = null
  // threeEl.style.display = 'none'

  window.three = new Three({
    root: threeEl,
    scrollHelper: scrollHelper,
    scrollGrain: false,
    restorePrev: twoInit,
    setScene: scene
  })
}

document.onload = (function () {
  // introInit()
  // oneInit()
  // twoInit()
  threeInit()
})()
