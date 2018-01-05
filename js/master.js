// list of options for observer
let options = {
  threshold: [0, 0.25, 0.5, 0.75]
}
// create observer reference
let observer
// elements in currently in viewport (assumes <= 2)
let inView = new Set()
//
let inViewRatios = []
// contains scrollId, if has value the page is scrolling and will call lock()
let scrollId = null
// contains reference to main item
let mainInView = null

// container element
let rootEl = document.querySelector('.intro')
let scrollHelper = document.querySelector('.scrollHelper img.down')
let scrollHelperAlt = document.querySelector('.scrollHelper img.down_alt')
var introColors = [
  "#F9F7E8",
  "#F3E8DA",
  "#EEDACC",
  "#E8CCBF",
  "#E5C4B9",
  "#E5C4B9",
  "#E5C4B9",
  "#DEC2BB",
  "#CCBBC1",
  "#BBB5C7",
  "#A8ADCA",
  "#9DA8CB",
  "#000"
]

function onTick(entry) {
  // First run, add just first slide
  if (!inView.size) {
    inView.add(entry[0].target)
    entry[0].target.querySelector('p').style.opacity = '1'
    entry[0].target.querySelector('img').style.opacity = '1'
    setTimeout(function () {
      scrollHelper.style.opacity = '1'
    }, 1500)
    return
  }

  entry.forEach((change) => {
    let { isIntersecting, intersectionRatio, target } = change
    if(isIntersecting && intersectionRatio > 0) {
      // Reset scrolling lock timer
      if (scrollId === null) {
        scrollId = setTimeout(lock, 2000)
      } else {
        clearTimeout(scrollId)
        scrollId = setTimeout(lock, 2000)
      }

      // Add to elements in view Set
      if (!inView.has(target)) {
        inView.add(target)
        // console.info('it\s now in', target)
      }

      // Decide wich is the element with max ratio
      // TODO: remove fixed number
      inViewArray = Array.from(inView.values())
      if (inViewArray[0] == target) {
        inViewRatios[0] = intersectionRatio
      }
      if (inViewArray[1] == target) {
        inViewRatios[1] = intersectionRatio
      }
    } else {
      inView.delete(target)
      // console.info('it\s now out', target)
      return
    }

    if (!inView.has(target)) {
      return
    }

    let paragraph = target.querySelector('p')
    let loader = target.querySelector('img')

    // console.log('item', target)
    // console.log('item', intersectionRatio)
    if (intersectionRatio > 0.25) {
      rootEl.style.backgroundColor = introColors[change.target.dataset.background]
      if (loader) {
        loader.style.opacity = '1'
      }
    } else if (intersectionRatio < 0.25) {
      paragraph.style.opacity = '0'
      if (loader) {
        loader.style.opacity = '0'
      }
      scrollHelper.style.opacity = '0'
      scrollHelperAlt.style.opacity = '0'
    }
    if (intersectionRatio > 0.5) {
      paragraph.style.opacity = '1'
    }
  })
}

function handleNext () {
  console.log('pressed')
}

function offsetTop(el) {
  var rect = el.getBoundingClientRect()
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop
  return rect.top + scrollTop
}

function lock() {
  let inViewArray = Array.from(inView.values())
  let scrollTo = inViewRatios[0] > inViewRatios[1] ? inViewArray[0] : inViewArray[1]
  if (scrollTo) {
    var elOffset = offsetTop(scrollTo)
    doScrolling(elOffset, 500)
  }
  if (scrollTo.dataset.background === "12") {
    scrollHelperAlt.style.opacity = '1'
  } else {
    scrollHelper.style.opacity = '1'
  }
  // console.log('should scroll to', elOffset)
}

function doScrolling(elementY, duration) {
  var startingY = window.pageYOffset
  var diff = elementY - startingY
  var start

  // Bootstrap our animation - it will get called right before next frame shall be rendered.
  window.requestAnimationFrame(function step(timestamp) {
    if (!start) start = timestamp
    // Elapsed miliseconds since start of scrolling.
    var time = timestamp - start
    // Get percent of completion in range [0, 1].
    var percent = Math.min(time / duration, 1)

    window.scrollTo(0, startingY + diff * percent)

    // Proceed with animation as long as we wanted it to.
    if (time < duration) {
      window.requestAnimationFrame(step)
    }
  })
}

function intro () {
  // instantiate a new Intersection Observer
  observer  = new IntersectionObserver(onTick, options)

  // list of paragraphs
  let elements = document.querySelectorAll('.intro .slide')
  // down button
  // scrollHelper.addEventListener('touchstart', handleNext, false)
  scrollHelper.addEventListener('click', handleNext, false)

  // observe all elements
  for (let elm of elements) {
    observer.observe(elm)
  }
}

var introColors = [
  "#F9F7E8",
  "#A0AAD1",
  "#BCB6C8",
  "#D7D8DC"
]

function submitFormOne () {
  let form = document.querySelector('.part-one .slide form')
  let age = parseInt(form.querySelector('input[name="age"]').value)
  let time = parseInt(form.querySelector('input[name="time"]').value)

  if (time > 0 && time > 6) {
    console.log('vida not found')
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
  // insertAfter(notFound)
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

function partOne () {
  let submitForm = document.querySelector('.part-one .slide:nth-child(1) .sectionHelper')
  submitForm.addEventListener('click', submitFormOne, false)
}

let introTexts = [
  'Piensa en tu día a día.',
  'En las 9 horas de trabajo<br /> y tus 8 durmiendo.',
  'Piensa en tu tiempo libre.',
  'Piensa en cuánto tiempo<br /> le dedicas al móvil.',
  'Haz el cálculo mental.',
  'Mira los mejores años de<br /> tu vida esfumándose.',
  'Asómate al espejo y obsérvate.',
  '¿Cuánto vale tu vida?'
]

const intr =

function intro_alt () {
  var last_known_scroll_position = 0
  var ticking = false
  let scrollId = null
  let thisScroll = []

  let intro = document.querySelector('.intro')
  let paragraph = intro.querySelector('p')
  let intr = new Intro(intro)
  intr.setScenes(introTexts)
  intr.toggleLoader()
  setTimeout(function () {
    intr.showCurrent()
  }, 500)
  // intr.scrollGrain()
  console.log('ok')

  function doSomething(scroll_pos) {
    // do something with the scroll position
    if (scrollId === null) {
      scrollId = setTimeout(finishedScrolling, 300)
    } else {
      clearTimeout(scrollId)
      scrollId = setTimeout(finishedScrolling, 300)
    }
    thisScroll.push(scroll_pos)
  }

  function viewport() {
    var e = window, a = 'inner'
    if (!('innerWidth' in window )) {
      a = 'client'
      e = document.documentElement || document.body
    }
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
  }

  function finishedScrolling () {
    var sum = thisScroll.reduce(function(a, b) { return a + b; })
    var avg = sum / thisScroll.length
    var clientW = viewport().width
    thisScroll = []
    if (avg > 0) {
      console.log('Up!')
      clientW > 500 ? intr.prev() : intr.next()
    } else {
      console.log('Down!')
      // intr.next()
      clientW > 500 ? intr.next() : intr.prev()
      // intr.prev()
    }
  }
}

class Intro {
  constructor (el) {
    if (!el) {
      console.error('No root element passed.')
      return
    }
    this.root = el
    this.currentScene = 0
    this.isLoaderVisible = 0
    this.isTransitioning = 0
    this.thtrottling = 0
    this.paragraph = this.root.querySelector('p')
    this.loader = this.root.querySelector('img')

    if (!this.paragraph) {
      console.error('No paragraph element found.')
      return
    }
    if (!this.loader) {
      console.error('No loader element found.')
      return
    }
  }

  scrollGrain () {
    this.paragraph.addEventListener('scroll', function(e) {
      let lastKnownPos = window.scrollY
      if (!this.thtrottling && !this.isTransitioning) {
        window.requestAnimationFrame(function() {
          doSomething(lastKnownPos)
          this.thtrottling = 0
        })

        this.thtrottling = 1
      }
    })
  }

  toggleLoader () {
    if (this.isLoaderVisible) {
      this.loader.style.opacity = '0'
      this.isLoaderVisible = 0
    } else {
      this.loader.style.opacity = '1'
      this.isLoaderVisible = 1
    }
  }

  showCurrent () {
    this.paragraph.innerHTML = `> ${this.scenes[this.currentScene]} /`
    this.paragraph.style.opacity = '1'
  }

  setScenes (array) {
    if (!Array.isArray(array) || array.length === 0) {
      console.error('No array passed')
    }

    this.scenes = array
  }

  prev () {
    if (this.currentScene > 0) {
      this.currentScene--
      // this.paragraph.innerHTML = `> ${this.scenes[this.currentScene]} /`
      this.paragraph.style.opacity = '0'
      console.log(this.scenes[this.currentScene], 'PREV')
    }
  }

  next () {
    if (this.currentScene < this.scenes.length - 1) {
      this.currentScene++
      this.paragraph.style.opacity = '0'
      setTimeout(this.showCurrent.bind(this), 1000)
      console.log(this.scenes[this.currentScene], 'NEXT')
    }
  }
}

document.onload = function () {
  // intro()
  // partOne()
  // intro_alt()
}()
