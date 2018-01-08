/* global IntersectionObserver */

function viewport () {
  var e = window
  var a = 'inner'
  if (!('innerWidth' in window)) {
    a = 'client'
    e = document.documentElement || document.body
  }
  return { width: e[a + 'Width'], height: e[a + 'Height'] }
}

class Two {
  constructor (settings) {
    if (!settings.root) {
      console.error('No root element passed.')
      return
    }
    this.root = settings.root
    this.scenes = Array.from(this.root.querySelectorAll('.slide'))
    if (!this.scenes.length) {
      console.error('No scenes found.')
      return
    }

    this.clientW = viewport().width
    this.clientH = viewport().height
    this.currentScene = 0
    // An animation is running, discard this scroll evt ? 1 : 0
    this.isTransitioning = 1
    // The main thread is busy, discard this scroll evt ? 1 : 0
    this.thtrottling = 0
    // Scrolling is locked, discard this scroll evt ? 1 : 0
    this.scrollLocked = 1
    this.scrollId = null
    this.scrollDelta = []
    this.isHelperVisible = 0
    this.scrollHelper = settings.scrollHelper

    if (!this.scrollHelper) {
      console.error('No scrollHelper element passed.')
      return
    }

    this.showCurrent = this.showCurrent.bind(this)
    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
    this.transitionFinished = this.transitionFinished.bind(this)
    this.toggleScrollHelper = this.toggleScrollHelper.bind(this)
    this.showScrollHelper = this.showScrollHelper.bind(this)
    this.hideScrollHelper = this.hideScrollHelper.bind(this)
    this.toggleElementOpacity = this.toggleElementOpacity.bind(this)
    this.hideFirst = this.hideFirst.bind(this)
    this.showSecond = this.showSecond.bind(this)
    this.hideSecond = this.hideSecond.bind(this)
    this.observeFirstHandler = this.observeFirstHandler.bind(this)
    this.observeSecondHandler = this.observeSecondHandler.bind(this)

    this.first = {}
    this.second = {}
    this.elements = {}
    this.prepareFirst()
    // this.prepareSecond()

    setTimeout(() => {
      this.showCurrent()
    }, 300)
  }

  toggleScrollHelper () {
    if (this.isHelperVisible) {
      this.hideScrollHelper()
    } else {
      this.showScrollHelper()
    }
  }

  hideScrollHelper () {
    this.scrollHelper.style.opacity = '0'
    this.isHelperVisible = 0
  }

  showScrollHelper () {
    this.scrollHelper.style.opacity = '1'
    this.isHelperVisible = 1
  }

  transitionStarted () {
    this.isTransitioning = 1
  }

  transitionFinished () {
    this.isTransitioning = 0
  }

  toggleElementOpacity (el) {
    if (el.state.isVisible) {
      el.node.style.opacity = '0'
      el.state.isVisible = 0
    } else {
      el.node.style.opacity = '1'
      el.state.isVisible = 1
    }
  }

  prepareFirst () {
    let currentScene = this.scenes[0]
    this.first = {
      title: {
        node: currentScene.querySelector('h2'),
        state: {
          isVisible: 0
        }
      },
      boxes: []
    }

    // Select container blocks
    let tmp = Array.from(currentScene.querySelectorAll('.images > div'))
    this.first.boxes = tmp.map(node => ({
      node: node,
      state: {
        isVisible: 0
      }
    }))

    // OPTIMIZE: test references
  }

  showFirst () {
    let { scenes, first } = this
    let currentScene = scenes[0]
    currentScene.style.display = 'block'
    setTimeout(() => {
      this.toggleElementOpacity(first.title)
    }, 500)

    // If on mobile trigger first box & start observing scrolling
    if (this.clientW < 500) {
      setTimeout(() => {
        // Toggle first Number
        this.toggleElementOpacity(first.boxes[0])
      }, 500)

      setTimeout(() => {
        // Toggle show state on first Number
        first.boxes[0].node.classList.add('show')
      }, 2000)

      if (this.clientH > 580) {
        setTimeout(() => {
          // Toggle second Number
          this.toggleElementOpacity(first.boxes[1])
        }, 1500)

        setTimeout(() => {
          // Toggle show state on second Number
          first.boxes[1].node.classList.add('show')
        }, 4000)
      }

      this.observeFirst()
    } else {
      // If on desktop trigger each box evry 1.5s
      let delta = 0
      first.boxes.forEach(box => {
        setTimeout(() => {
          // Toggle Number
          this.toggleElementOpacity(box)
        }, delta + 500)

        delta = delta + 1000
      })

      // Then toggle scrollHelper after 5 additional seconds
      setTimeout(() => {
        this.toggleScrollHelper()
        this.scrollHelper.addEventListener('click', this.hideFirst)
        this.prepareSecond()
      }, 7500)
    }
  }

  hideFirst () {
    let { title, boxes } = this.first

    // remove evt listener from scrollHelper
    this.scrollHelper.removeEventListener('click', this.hideFirst)
    // stop observer (if running)
    if (this.firstObserver) {
      boxes.forEach(box => this.firstObserver.unobserve(box))
    }
    // fadeout title
    this.toggleElementOpacity(title)
    // fadeout content
    boxes.forEach(box => {
      this.toggleElementOpacity(box)
    })

    // display none slide
    setTimeout(() => {
      this.scenes[0].style.display = 'none'
    }, 1100)
    // call next
    setTimeout(this.next, 1200)
  }

  observeFirst () {
    let options = {
      threshold: [0.2]
    }
    let { firstObserver, boxes } = this.first
    this.first.observing = false

    firstObserver = new IntersectionObserver(this.observeFirstHandler, options)
    boxes.forEach(box => firstObserver.observe(box.node))
  }

  observeFirstHandler (entries) {
    if (!this.first.observing) {
      this.first.observing = true
      return
    }
    entries.forEach(entry => {
      let { target } = entry
      let { boxes } = this.first
      let idx = target.dataset.idx
      this.toggleElementOpacity(boxes[idx])
      setTimeout(() => {
        boxes[idx].node.classList.add('show')
      }, 1000)

      if (parseInt(idx) < 7) {

      } else {
        setTimeout(() => {
          this.toggleScrollHelper()
          this.scrollHelper.addEventListener('click', this.hideFirst)
          this.prepareSecond()
        }, 2000)
      }
    })
  }

  prepareSecond () {
    let currentScene = this.scenes[1]
    this.second = {
      boxes: []
    }

    // Select container blocks
    let tmp = Array.from(currentScene.querySelectorAll('p'))
    this.second.boxes = tmp.map(node => ({
      node: node,
      state: {
        isVisible: 0
      }
    }))

    // OPTIMIZE: test references
  }

  showSecond () {
    let { scenes, second } = this
    let currentScene = scenes[1]
    currentScene.style.display = 'flex'

    // If on mobile trigger first box & start observing scrolling
    if (this.clientW < 500) {
      setTimeout(() => {
        // Toggle first Number
        this.toggleElementOpacity(second.boxes[0])
      }, 500)

      setTimeout(() => {
        // Toggle first Number
        this.toggleElementOpacity(second.boxes[1])
      }, 1500)

      setTimeout(() => {
        // Toggle first Number
        this.toggleElementOpacity(second.boxes[2])
      }, 3000)

      this.observeSecond()
    } else {
      // If on desktop trigger each box evry 1.5s
      let delta = 0
      second.boxes.forEach(box => {
        setTimeout(() => {
          // Toggle Sentence
          this.toggleElementOpacity(box)
        }, delta + 500)

        delta = delta + 1000
      })

      // Then toggle scrollHelper after 5 additional seconds
      setTimeout(() => {
        this.toggleScrollHelper()
        this.scrollHelper.addEventListener('click', this.hideSecond)
        console.log('should prepare part 3')
      }, 4500)
    }
  }

  hideSecond () {
    let { boxes } = this.second

    // remove evt listener from scrollHelper
    this.scrollHelper.removeEventListener('click', this.hideSecond)
    // stop observer (if running)
    if (this.secondObserver) {
      boxes.forEach(box => this.secondObserver.unobserve(box))
    }
    // fadeout content
    boxes.forEach(box => {
      this.toggleElementOpacity(box)
    })

    // display none slide
    setTimeout(() => {
      this.scenes[1].style.display = 'none'
    }, 1100)
    // call next
    console.log('should go to part 3')
  }

  observeSecond () {
    let options = {
      threshold: [0.1]
    }

    let { second, secondObserver } = this

    secondObserver = new IntersectionObserver(this.observeSecondHandler, options)
    second.observing = false

    second.boxes.forEach(box => secondObserver.observe(box.node))
  }

  observeSecondHandler (entries) {
    if (!this.second.observing) {
      this.second.observing = true
      return
    }
    entries.forEach(entry => {
      let { target } = entry
      let { boxes } = this.second
      let idx = target.dataset.idx
      this.toggleElementOpacity(boxes[idx])

      if (parseInt(idx) < 3) {

      } else {
        setTimeout(() => {
          this.toggleScrollHelper()
          this.scrollHelper.addEventListener('click', this.hideSecond)
          console.log('should prepare part 3')
        }, 2000)
      }
    })
  }

  showCurrent () {
    switch (this.currentScene) {
      case 0:
        this.showFirst()
        break
      case 1:
        this.showSecond()
        break
    }
  }

  prev () {
    if (this.currentScene > 0) {
      this.transitionStarted()
      this.currentScene--
      this.showCurrent()
      console.log(this.scenes[this.currentScene], 'PREV')
    }
  }

  next () {
    if (this.currentScene < this.scenes.length - 1) {
      this.transitionStarted()
      this.currentScene++
      this.showCurrent()
      console.log(this.scenes[this.currentScene], 'NEXT')
    }
  }
}

export default Two
