var loader = document.querySelector('.loader')

window.onscroll = function () {
  // stickyElement(loader)
}

function getWidth () {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  )
}

function triggerPos (el, buffer) {
  return el.offsetTop - el.height + buffer
}

function stickyElement (element, className = 'sticky') {
  if (window.pageYOffset > element.offsetTop) {
    element.classList.add(className)
  } else {
    element.classList.remove(className)
  }
}

var options = {
  root: null,
  threshold: [0.25, 0.5, 0.75]
}

var intro = document.querySelector('.intro')
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

var viewer = {
  direction: null,
  isScrolling: false,
  scrollId: null,
  lastSnap: {},
  tick: function (snap) {
    this.direction = this.lastSnap.intersectionRatio < snap.intersectionRatio
    this.lastSnap = snap
    if (this.scrollId === null) {
      this.scrollId = setTimeout(viewer.lock, 0)
    } else {
      clearTimeout(this.scrollId)
      this.scrollId = setTimeout(viewer.lock, 2000)
      this.isScrolling = true
    }
  },
  snap: function (entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return
      }
      viewer.tick(entry)
      // console.log(entry.target)
      if (viewer.direction && entry.intersectionRatio > 0 && entry.intersectionRatio < 0.5) {
        // console.log('is entering', entry.target)
        var d = entry.target.querySelector('p')
        d.style.opacity = 1
      }

      if (viewer.direction && entry.intersectionRatio < 0.6 && entry.intersectionRatio > 0.4) {
        // let c = Array.from(entry.target.parentElement.children)
        // console.log(c.indexOf(entry.target))
        let prevColor = entry.target.dataset.background - 1
        console.log('going to prev', prevColor)
        intro.style.backgroundColor = colors[prevColor]
      }

      if (!viewer.direction && entry.intersectionRatio < 1 && entry.intersectionRatio > 0.5) {
        // console.log('is exiting', entry.target)
        var d = entry.target.querySelector('p')
        console.log(d)
        d.style.opacity = 0
      }

      if (!viewer.direction && entry.intersectionRatio < 0.6 && entry.intersectionRatio > 0.4) {
        let nextColor = entry.target.dataset.background + 1
        console.log('going to next', nextColor)
        intro.style.backgroundColor = colors[nextColor]
      }

      // Each entry describes an intersection change for one observed
      // target element:
      //   entry.boundingClientRect
      //   entry.intersectionRatio
      //   entry.intersectionRect
      //   entry.isIntersecting
      //   entry.rootBounds
      //   entry.target
      //   entry.time
    })
  },
  lock: function () {
    viewer.isScrolling = false
    // console.log(viewer)
  }
}

document.onload = function () {
  var observer = new IntersectionObserver(viewer.snap, options)
  var target = document.querySelector('.intro .slide:nth-child(1)')

  // var observer2 = new IntersectionObserver(viewer.snap, options)
  var target2 = document.querySelector('.intro .slide:nth-child(2)')

  observer.observe(target)
  observer.observe(target2)
}()
