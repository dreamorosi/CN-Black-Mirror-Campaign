/* global Image */
import TextScramble from './TextScramble'
import crackingGlassSrc from '../images/0-03.gif'
import oneImgs0 from '../images/1-03.png'
import oneImgs1 from '../images/1-04.png'
import oneImgs2 from '../images/1-05.png'
import oneImgs3 from '../images/1-06.png'
import oneImgs4 from '../images/1-07.png'
import oneImgs5 from '../images/1-08.png'

class Intro {
  constructor (settings) {
    if (!settings.root) {
      throw Error(`No root element passed.`)
    }
    if (!settings.scenes || !settings.scenes.length || !Array.isArray(settings.scenes)) {
      throw Error(`No scenes array passed.`)
    }
    if (!settings.shutDownCall || typeof settings.shutDownCall !== 'function') {
      throw Error(`No shutdown callback passed passed.`)
    }

    this.root = settings.root
    this.isTouchDevice = 'ontouchstart' in document.documentElement

    this.shutdownCallBack = settings.shutDownCall

    this.currentScene = settings.setScene || 0
    this.isRestored = settings.setScene !== 0
    this.isLoaderVisible = 0
    // An animation is running, discard this scroll evt ? 1 : 0
    this.isTransitioning = 1
    // The main thread is busy, discard this scroll evt ? 1 : 0
    this.isThreadBusy = false
    this.scrollId = null

    this.paragraph = this.root.querySelector('p')
    this.loader = this.root.querySelector('img')

    this.scrollHelper = settings.scrollHelper
    this.isHelperVisible = 0

    this.autoadvance = null

    if (!this.paragraph) {
      throw Error(`No paragraph element found.`)
    }

    this.fx = new TextScramble(this.paragraph)

    if (!this.loader) {
      throw Error(`No loader element found.`)
    }
    if (!this.scrollHelper) {
      throw Error(`No scrollHelper element passed.`)
    }

    this.showCurrent = this.showCurrent.bind(this)
    this.next = this.next.bind(this)
    this.scrollGrain = this.scrollGrain.bind(this)
    this.scrollWatcher = this.scrollWatcher.bind(this)
    this.transitionFinished = this.transitionFinished.bind(this)
    this.toggleLoader = this.toggleLoader.bind(this)
    this.toggleScrollHelper = this.toggleScrollHelper.bind(this)
    this.showScrollHelper = this.showScrollHelper.bind(this)
    this.hideScrollHelper = this.hideScrollHelper.bind(this)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.shutdown = this.shutdown.bind(this)

    if (settings.scrollGrain) {
      this.scrollStatus = {
        wheeling: false,
        isBusy: false
      }
      if (this.isTouchDevice) {
        // Track touch strokes on mobile
        this.scrollStatus.tartScrollPos = 0
        window.addEventListener('touchstart', this.handleTouchStart, false)
        window.addEventListener('touchmove', this.handleTouchMove, false)
      } else {
        // Track wheel scrolling on desktops
        window.addEventListener('wheel', this.scrollWatcher)
      }
    }
    this.scenes = settings.scenes
    this.toggleLoader()
    setTimeout(this.showCurrent, 500)
    setTimeout(this.showScrollHelper, 1000)
    this.scrollHelper.addEventListener('click', this.next)
    setTimeout(this.preloadGif, 1500)
  }

  handleTouchStart (evt) {
    this.scrollStatus.startScrollPos = evt.touches[0].clientY

    // Advance when a single tap is made
    this.isTouchingId = setTimeout(() => {
      this.next()
    }, 100)
  }

  handleTouchMove () {
    window.clearTimeout(this.isTouching)
    this.scrollWatcher()
  }

  scrollGrain (evt) {
    window.clearTimeout(this.scrollId)
    this.scrollId = setTimeout(() => {
      this.scrollStatus.wheeling = false
      this.scrollStatus.isBusy = false

      let dir = 0
      if (this.isTouchDevice) {
        let clientY = 0
        if (evt.touches) {
          clientY = evt.touches[0].clientY
        }
        let yDown = this.scrollStatus.startScrollPos
        dir = clientY - yDown
      } else {
        dir = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1
      }
      if (dir > 0) {
        console.log('Up!')
        this.prev()
      } else {
        console.log('Down!')
        this.next()
      }
    }, 1000)
    this.isThreadBusy = false
  }

  scrollWatcher (e) {
    this.scrollStatus.wheeling = true
    if (!this.isThreadBusy && !this.scrollStatus.isBusy) {
      // Exec only if main thread is not busy
      window.requestAnimationFrame(() => this.scrollGrain(e))

      this.isThreadBusy = true
      this.scrollStatus.isBusy = true
    }
  }

  preloadGif () {
    this.crackingGlass = new Image()
    this.crackingGlass.src = crackingGlassSrc
  }

  preloadOne () {
    let img = new Image()
    img.src = oneImgs0
    img.src = oneImgs1
    img.src = oneImgs2
    img.src = oneImgs3
    img.src = oneImgs4
    img.src = oneImgs5
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

    window.clearTimeout(this.autoadvance)
  }

  transitionFinished () {
    this.isTransitioning = 0
  }

  swapText () {
    this.fx.setText(this.scenes[this.currentScene])
    setTimeout(this.transitionFinished, 300)
    // After 4 seconds we move to the next
    this.autoadvance = setTimeout(this.next, 5000)
  }

  showCurrent () {
    if (this.currentScene === 3) {
      this.preloadOne()
    }
    // Final scene
    if (this.currentScene === this.scenes.length - 1) {
      this.loader.src = crackingGlassSrc
      this.scrollHelper.removeEventListener('click', this.next)
      this.isRestored = true
      setTimeout(() => {
        this.scrollHelper.addEventListener('click', this.shutdown)
      }, 1000)
    } else if (this.isRestored) {
      this.loader.src = './images/0-02.gif'
      this.scrollHelper.addEventListener('click', this.next)
    }

    // Trigger text animation
    this.swapText()

    // After 0.5 seconds we show the arrow one time
    setTimeout(this.showScrollHelper, 500)
  }

  prev () {
    if (this.currentScene > 0) {
      this.transitionStarted()
      this.hideScrollHelper()
      this.currentScene--
      this.showCurrent()
      console.log(this.scenes[this.currentScene], 'PREV')
    }
  }

  next () {
    if (this.currentScene < this.scenes.length - 1) {
      this.transitionStarted()
      this.hideScrollHelper()
      this.currentScene++
      this.showCurrent()
      console.log(this.scenes[this.currentScene], 'NEXT')
    }
  }

  shutdown () {
    window.clearTimeout(this.autoadvance)
    window.removeEventListener('touchstart', this.handleTouchStart, false)
    window.removeEventListener('touchmove', this.handleTouchMove, false)
    window.removeEventListener('wheel', this.scrollWatcher)
    this.scrollHelper.removeEventListener('click', this.shutdown)
    this.hideScrollHelper()
    this.loader.removeEventListener('load', this.toggleLoader)

    this.root.style.display = 'none'

    this.shutdownCallBack()
  }
}

export default Intro
