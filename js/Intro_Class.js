// function viewport() {
//   var e = window, a = 'inner'
//   if (!('innerWidth' in window )) {
//     a = 'client'
//     e = document.documentElement || document.body
//   }
//   return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
// }

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
    // this.clientW = viewport().width
    // this.clientH = viewport().height

    this.currentScene = 0
    this.isLoaderVisible = 0
    // An animation is running, discard this scroll evt ? 1 : 0
    this.isTransitioning = 1
    // The main thread is busy, discard this scroll evt ? 1 : 0
    this.thtrottling = 0
    this.scrollId = null
    this.scrollDelta = []
    this.paragraph = this.root.querySelector('p')
    this.loader = this.root.querySelector('img')
    this.scrollHelper = settings.scrollHelper

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
    this.scrollCoach = this.scrollCoach.bind(this)
    this.transitionFinished = this.transitionFinished.bind(this)

    if (settings.scrollGrain) {
      window.addEventListener('scroll', this.scrollWatcher)
      // this.paragraph.addEventListener('scroll', this.scrollWatcher)
    }

    this.scenes = settings.scenes
    this.toggleLoader()
    let that = this
    setTimeout(function () {
      that.showCurrent()
    }, 500)
  }

  scrollGrain () {
    if (this.scrollId === null) {
      this.scrollId = setTimeout(this.scrollCoach, 300)
    } else {
      clearTimeout(this.scrollId)
      this.scrollId = setTimeout(this.scrollCoach, 300)
    }

    this.scrollDelta.push(window.scrollY)
    // this.scrollDelta.push(this.paragraph.scrollTop)

    this.thtrottling = 0
  }

  scrollWatcher () {
    if (!this.thtrottling && !this.isTransitioning) {
      // Exec only if main thread is not busy
      window.requestAnimationFrame(this.scrollGrain)

      this.thtrottling = 1
    }
  }

  scrollCoach () {
    let sum = this.scrollDelta.reduce((a, b) => a + b)
    let avg = sum / this.scrollDelta.length
    this.scrollDelta = []
    if (avg > 0.5) {
      console.log('Up!')
      this.next()
    //   this.clientW > 500 ? this.prev() : this.next()
    } else {
      console.log('Down!')
      this.prev()
    //   this.clientW > 500 ? this.next() : this.prev()
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

  transitionStarted () {
    this.isTransitioning = 1
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
        this.scrollHelper.style.opacity = '1'
      })
    }
    setTimeout(function () {
      that.paragraph.innerHTML = `> ${that.scenes[that.currentScene]} /`
      that.paragraph.style.opacity = '1'

      document.body.scrollTop = document.documentElement.scrollTop = 1
      setTimeout(that.transitionFinished, 500)
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

// export default Intro
