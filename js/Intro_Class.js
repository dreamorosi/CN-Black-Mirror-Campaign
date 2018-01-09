import TextScramble from './TextScramble'

class Intro {
  constructor (settings) {
    if (!settings.root) {
      console.error('No root element passed.')
      return
    }
    if (!settings.scenes || !settings.scenes.length || !Array.isArray(settings.scenes)) {
      console.error('No scenes array passed.')
      return
    }
    this.root = settings.root
    this.isTouchDevice = 'ontouchstart' in document.documentElement

    this.currentScene = 0
    this.isLoaderVisible = 0
    // An animation is running, discard this scroll evt ? 1 : 0
    this.isTransitioning = 1
    // The main thread is busy, discard this scroll evt ? 1 : 0
    this.isThreadBusy = false
    this.scrollId = null
    this.scrollDelta = []
    this.paragraph = this.root.querySelector('p')
    this.loader = this.root.querySelector('img')

    this.scrollHelper = settings.scrollHelper
    this.isHelperVisible = 0

    this.autoadvance = null

    if (!this.paragraph) {
      console.error('No paragraph element found.')
      return
    }

    this.fx = new TextScramble(this.paragraph)

    if (!this.loader) {
      console.error('No loader element found.')
      return
    }
    if (!this.scrollHelper) {
      console.error('No scrollHelper element passed.')
      return
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

    if (settings.scrollGrain) {
      this.scrollStatus = {
        wheeling: false,
        isBusy: false
      }
      if (this.isTouchDevice) {
        // Track touch strokes on mobile
        this.scrollStatus.tartScrollPos = 0
        window.addEventListener('touchstart', (evt) => {
          this.scrollStatus.startScrollPos = evt.touches[0].clientY

          // Advance when a single tap is made
          this.isTouchingId = setTimeout(() => this.next(), 100)
        }, false)
        window.addEventListener('touchmove', () => {
          window.clearTimeout(this.isTouching)
          this.scrollWatcher()
        }, false)
      } else {
        // Track wheel scrolling on desktops
        window.addEventListener('wheel', this.scrollWatcher)
      }
    }

    this.scenes = settings.scenes
    this.toggleLoader()
    let that = this
    setTimeout(function () {
      that.showCurrent()
    }, 500)
  }

  scrollGrain (evt) {
    window.clearTimeout(this.scrollId)
    this.scrollId = setTimeout(() => {
      this.scrollStatus.wheeling = false
      this.scrollStatus.isBusy = false

      let dir = 0
      if (this.isTouchDevice) {
        let { clientY } = evt.touches[0]
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
    if (!this.isThreadBusy && !this.isTransitioning && !this.scrollStatus.isBusy) {
      // Exec only if main thread is not busy
      window.requestAnimationFrame(() => this.scrollGrain(e))

      this.isThreadBusy = true
      this.scrollStatus.isBusy = true
    }
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

    window.clearTimeout(this.firstHelp)
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
    // Final scene
    if (this.currentScene === this.scenes.length - 1) {
      this.toggleLoader()
      this.loader.src = 'http://placehold.it/100x100'
      this.loader.addEventListener('load', () => { this.toggleLoader() })
      setTimeout(this.showScrollHelper, 3000)
      console.log('Should preload next part')
    }

    // Trigger text animation
    this.swapText()

    // After 1.5 seconds we show the arrow one time
    this.firstHelp = setTimeout(this.toggleScrollHelper, 1500)
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
}

export default Intro
