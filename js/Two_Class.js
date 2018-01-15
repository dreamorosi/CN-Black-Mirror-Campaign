/* global IntersectionObserver */

import TextScramble from './TextScramble'

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
      throw Error(`No root element passed.`)
    }
    this.root = settings.root
    this.scenes = Array.from(this.root.querySelectorAll('.slide'))
    if (!this.scenes.length) {
      throw Error(`No scenes found.`)
    }

    if (!settings.shutDownCall || typeof settings.shutDownCall !== 'function') {
      throw Error(`No shutdown callback passed passed.`)
    }

    this.clientW = viewport().width
    this.clientH = viewport().height
    this.shutdownCallBack = settings.shutDownCall
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
    this.shutdown = this.shutdown.bind(this)
    this.observeFirstHandler = this.observeFirstHandler.bind(this)

    this.texts = settings.texts

    this.first = {}
    this.second = {}
    this.elements = {}
    this.prepareFirst()
    this.video = document.querySelector('video')
    this.vidSource = this.video.querySelector('source')
    this.video.style.height = this.clientH
    this.video.style.width = this.clientW
    document.body.scrollTop = document.documentElement.scrollTop = 0
    // this.prepareSecond()

    setTimeout(() => {
      this.showCurrent()
      this.root.style.display = 'flex'
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

  setVideo (n) {
    this.vidSource.src = this.clientW < 500 ? `./videos/fondo_0${n}_m.mp4` : `./videos/fondo_0${n}.mp4`
    this.video.load()
    this.video.play().then(() => {
      console.log('ok')
    }).catch((error) => {
      console.log(error)
    })
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

    this.first.imagesC = {
      node: currentScene.querySelector('.images'),
      state: {
        isVisible: 0
      }
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
    this.setVideo(2)
    setTimeout(() => {
      this.toggleElementOpacity(first.title)
      first.imagesC.node.style.display = 'flex'
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
        }, 3000)
      }

      this.observeFirst()
    } else {
      // If on desktop trigger each box evry 250ms
      let delta = 0
      first.boxes.forEach(box => {
        setTimeout(() => {
          // Toggle Number
          this.toggleElementOpacity(box)
        }, delta + 500)

        delta = delta + 250
      })
    }

    setTimeout(() => {
      this.toggleScrollHelper()
      this.scrollHelper.parentNode.addEventListener('click', this.hideFirst)
      this.scrollHelper.parentNode.style.background = 'rgba(0,0,0,.5)'
      this.prepareSecond()
    }, 500)
  }

  hideFirst () {
    let { title, boxes } = this.first

    // remove evt listener from scrollHelper
    this.scrollHelper.parentNode.removeEventListener('click', this.hideFirst)
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
    setTimeout(() => { this.first.observing = true }, 1500)
  }

  observeFirstHandler (entries) {
    if (!this.first.observing) {
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
    })
  }

  prepareSecond () {
    let currentScene = this.scenes[1]
    this.second = {
      boxes: []
    }

    // Select container blocks
    let tmp = Array.from(currentScene.querySelectorAll('p'))
    this.second.paragraphs = tmp.map(node => ({
      node: node,
      state: {
        isVisible: 0
      }
    }))

    this.scrollHelper.parentNode.style.background = 'transparent'
    // OPTIMIZE: test references
  }

  showSecond () {
    let { scenes, second } = this
    let currentScene = scenes[1]
    currentScene.style.display = 'flex'
    this.setVideo(3)
    let delta = 0
    second.paragraphs.forEach(box => {
      setTimeout(() => {
        // Toggle Sentence
        let fx = new TextScramble(box.node)
        fx.setText(this.texts[box.node.dataset.idx])
      }, delta + 500)

      delta = delta + 1500
    })

    // Activate scrollHelper after 2 additional seconds
    setTimeout(() => {
      this.scrollHelper.parentNode.addEventListener('click', this.shutdown)
      console.log('should prepare part 3')
    }, 2000)
  }

  shutdown () {
    let { boxes } = this.second

    // remove evt listener from scrollHelper
    this.scrollHelper.parentNode.removeEventListener('click', this.shutdown)
    // fadeout content
    boxes.forEach(box => {
      this.toggleElementOpacity(box)
    })

    this.toggleScrollHelper()
    // display none slide
    setTimeout(() => {
      this.scenes[1].style.display = 'none'
    }, 500)
    this.root.style.display = 'none'
    // call next
    this.shutdownCallBack()
    console.log('should go to part 3')
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
