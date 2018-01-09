function viewport() {
  var e = window, a = 'inner'
  if (!('innerWidth' in window )) {
    a = 'client'
    e = document.documentElement || document.body
  }
  return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

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
    this.clientW = viewport().width
    // this.clientH = viewport().height

    this.currentScene = 0
    this.isLoaderVisible = 0
    this.isHelperVisible = 0
    // An animation is running, discard this scroll evt ? 1 : 0
    this.isTransitioning = 1
    // The main thread is busy, discard this scroll evt ? 1 : 0
    this.isThreadBusy = 0
    this.scrollId = null
    this.scrollDelta = []
    this.paragraph = this.root.querySelector('p')
    this.loader = this.root.querySelector('img')
    this.scrollHelper = settings.scrollHelper
    this.scrollHelperLongWait = null

    if (!this.paragraph) {
      console.error('No paragraph element found.')
      return
    }
    if (!this.loader) {
      console.error('No loader element found.')
      return
    }
    if (!this.scrollHelper) {
      console.error('No scrollHelper element passed.')
      return
    }

    this.showCurrent = this.showCurrent.bind(this)
    this.scrollGrain = this.scrollGrain.bind(this)
    this.scrollWatcher = this.scrollWatcher.bind(this)
    // this.scrollCoach = this.scrollCoach.bind(this)
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
      if (this.clientW > 500) {
        // Track wheel scrolling on desktops
        window.addEventListener('wheel', this.scrollWatcher)
      } else {
        // Track touch strokes on mobile
        this.scrollStatus.tartScrollPos = 0
        window.addEventListener('touchstart', (evt) => {
          this.scrollStatus.startScrollPos = evt.touches[0].clientY
        }, false)
        window.addEventListener('touchmove', this.scrollWatcher, false)
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
    clearTimeout(this.scrollId)
    this.scrollId = setTimeout(() => {
      this.scrollStatus.wheeling = false
      this.scrollStatus.isBusy = false

      let dir = 0
      if (this.clientW > 500) {
        dir = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1
      } else {
        let { clientY } = evt.touches[0]
        let yDown = this.scrollStatus.startScrollPos
        dir = clientY - yDown
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

      this.isThreadBusy = 1
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

  toggleScrollHelper (expires = true) {
    if (this.isHelperVisible) {
      this.hideScrollHelper()
    } else {
      this.showScrollHelper()
      if (expires) {
        setTimeout(this.hideScrollHelper, 5000)
      }
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
    clearTimeout(this.scrollHelperLongWait)
  }

  transitionFinished () {
    this.isTransitioning = 0
  }

  showCurrent () {
    this.paragraph.style.opacity = '0'
    let that = this
    if (this.currentScene === this.scenes.length - 1) {
      this.toggleLoader()
      this.loader.src = 'http://placehold.it/100x100'
      this.loader.addEventListener('load', function () {
        that.toggleLoader()
      })
      setTimeout(this.showScrollHelper, 3000)
    }
    setTimeout(function () {
      that.paragraph.innerHTML = `> ${that.scenes[that.currentScene]} /`
      that.paragraph.style.opacity = '1'

      document.body.scrollTop = document.documentElement.scrollTop = 1
      setTimeout(that.transitionFinished, 500)
      setTimeout(that.toggleScrollHelper, 1500)
      this.scrollHelperLongWait = setTimeout(that.toggleScrollHelper, 16500)
    }, 1000)
  }

  setScenes (array) {
    if (!Array.isArray(array) || array.length === 0) {
      console.error('No array passed')
    }

    this.scenes = array
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
