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
var colors = [
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
      rootEl.style.backgroundColor = colors[change.target.dataset.background]
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

document.onload = function () {
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
}()
