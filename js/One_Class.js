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

class One {
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
    this.currentScene = 2
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
    this.scrollGrain = this.scrollGrain.bind(this)
    this.scrollWatcher = this.scrollWatcher.bind(this)
    this.scrollCoach = this.scrollCoach.bind(this)
    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
    this.transitionFinished = this.transitionFinished.bind(this)
    this.handleFormChange = this.handleFormChange.bind(this)
    this.submitForm = this.submitForm.bind(this)
    this.toggleScrollHelper = this.toggleScrollHelper.bind(this)
    this.showScrollHelper = this.showScrollHelper.bind(this)
    this.hideScrollHelper = this.hideScrollHelper.bind(this)
    this.showFirst = this.showFirst.bind(this)
    this.showSecond = this.showSecond.bind(this)
    this.hideSecond = this.hideSecond.bind(this)
    this.observeSecondHandler = this.observeSecondHandler.bind(this)

    if (settings.scrollGrain) {
      window.addEventListener('scroll', this.scrollWatcher)
    }

    this.first = {}
    this.second = {}
    this.prepareFirst()
    // this.prepareSecond()

    this.showCurrent()
  }

  scrollGrain () {
    if (this.scrollId === null) {
      this.scrollId = setTimeout(this.scrollCoach, 300)
    } else {
      clearTimeout(this.scrollId)
      this.scrollId = setTimeout(this.scrollCoach, 300)
    }

    this.scrollDelta.push(window.scrollY)

    this.thtrottling = 0
  }

  scrollWatcher () {
    if (!this.thtrottling && !this.isTransitioning && !this.scrollLocked) {
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
    } else {
      console.log('Down!')
      this.prev()
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
  }

  transitionFinished () {
    this.isTransitioning = 0
  }

  checkReferences (obj) {
    let result = true
    let keys = Object.keys(obj)
    keys.forEach(key => {
      if (!obj[key]) {
        result = false
      }
    })

    return result
  }

  prepareFirst () {
    this.first.form = this.scenes[0].querySelector('form')
    this.first.firstLabel = this.scenes[0].querySelector('label[for="age"]')
    this.first.firstInput = this.scenes[0].querySelector('input[name="age"]')
    this.first.secondLabel = this.scenes[0].querySelector('label[for="time"]')
    this.first.secondInput = this.scenes[0].querySelector('input[name="time"]')
    if (!this.checkReferences(this.first)) {
      console.error('Scene one is missing elements.')
      return
    }
    this.isFormFilled = 0
    this.formValues = {
      age: null,
      time: null
    }
    this.first.firstInput.addEventListener('change', this.handleFormChange)
    this.first.secondInput.addEventListener('change', this.handleFormChange)

    this.isTransitioning = 0
  }

  showFirst () {
    this.scenes[0].style.display = 'flex'
    this.first.form.style.opacity = 1
    this.first.firstLabel.style.opacity = 1
    let that = this
    setTimeout(function () {
      that.first.firstInput.style.opacity = 1
    }, 500)
    setTimeout(function () {
      that.first.secondLabel.style.opacity = 1
    }, 1000)
    setTimeout(function () {
      that.first.secondInput.style.opacity = 1
    }, 1500)
  }

  hideFirst () {
    this.first.form.style.opacity = 0
    this.toggleScrollHelper()
    let that = this
    setTimeout(function () {
      that.scenes[0].style.display = 'none'
    }, 1100)
    setTimeout(this.next, 1200)
  }

  handleFormChange (e) {
    this.formValues[e.target.name] = parseInt(e.target.value)
    if (this.formValues.age && this.formValues.time) {
      setTimeout(this.showScrollHelper, 1000)
      this.scrollHelper.addEventListener('click', this.submitForm)
      this.prepareSecond()
    }
  }

  submitForm () {
    let statAge = 82
    this.formValues.days = (statAge - this.formValues.age) * 365
    this.formValues.hours = 24 * this.formValues.days
    this.scrollHelper.removeEventListener('click', this.submitForm)
    this.hideFirst()
  }

  observeSecond () {
    let options = {
      threshold: [0]
    }
    this.secondObserver = new IntersectionObserver(this.observeSecondHandler, options)
    this.secondObserver.observe(this.second.firstParagraph)
  }

  observeSecondHandler (entry) {
    if (entry[0].intersectionRatio <= 0 && this.currentScene === 1) {
      this.second.graph.style.opacity = '1'
      this.showScrollHelper()
      this.scrollHelper.addEventListener('click', this.hideSecond)
      this.prepareThird()
    }
  }

  prepareSecond () {
    this.second.firstParagraph = this.scenes[1].querySelector('p:nth-of-type(1)')
    this.second.firstBox = this.scenes[1].querySelector('.blue-box:nth-of-type(1)')
    this.second.firstNumber = this.scenes[1].querySelector('.blue-box:nth-of-type(1) h3')
    this.second.firstHeading = this.clientW > 500
      ? this.scenes[1].querySelector('.blue-box:nth-of-type(1) h4')
      : this.scenes[1].querySelector('.blue-box:nth-of-type(1) + h4')

    this.second.secondParagraph = this.scenes[1].querySelector('p:nth-of-type(2)')
    this.second.secondBox = this.scenes[1].querySelector('.blue-box:nth-of-type(2)')
    this.second.secondNumber = this.scenes[1].querySelector('.blue-box:nth-of-type(2) h3')
    this.second.secondHeading = this.clientW > 500
      ? this.scenes[1].querySelector('.blue-box:nth-of-type(2) h4')
      : this.scenes[1].querySelector('.blue-box:nth-of-type(2) + h4')

    this.second.graph = this.scenes[1].querySelector('.right-side img')

    if (!this.checkReferences(this.second)) {
      console.error('Scene two is missing elements')
      return
    }

    if (this.clientW < 500) {
      this.observeSecond()
    }
  }

  showSecond () {
    this.scenes[1].style.display = 'flex'
    this.second.firstParagraph.style.opacity = '1'
    let that = this
    setTimeout(function () {
      that.second.firstBox.style.opacity = '1'
    }, 500)
    setTimeout(function () {
      that.second.firstNumber.style.opacity = '1'
      console.log('should start counting')
    }, 1500)
    setTimeout(function () {
      that.second.firstHeading.style.opacity = '1'
    }, 2000)

    setTimeout(function () {
      that.second.secondParagraph.style.opacity = '1'
    }, 2500)
    setTimeout(function () {
      that.second.secondBox.style.opacity = '1'
    }, 3500)
    setTimeout(function () {
      that.second.secondNumber.style.opacity = '1'
      console.log('should start counting')
    }, 4000)
    setTimeout(function () {
      that.second.secondHeading.style.opacity = '1'
    }, 4500)

    if (this.clientW > 500) {
      setTimeout(function () {
        that.second.graph.style.opacity = '1'
      }, 5500)

      setTimeout(function () {
        that.showScrollHelper()
        that.scrollHelper.addEventListener('click', that.hideSecond)
        that.prepareThird()
      }, 7000)
    }
  }

  hideSecond () {
    // remove evt listener from scrollHelper
    this.scrollHelper.removeEventListener('click', this.hideSecond)
    // stop observer
    this.secondObserver.unobserve(this.second.firstParagraph)
    // fadeout content
    this.scenes[1].querySelector('.left-side').style.opacity = '0'
    this.scenes[1].querySelector('.right-side').style.opacity = '0'
    let that = this
    // display none slide
    setTimeout(function () {
      that.scenes[1].style.display = 'none'
    }, 1100)
    // call next
    setTimeout(this.next, 1200)
  }

  prepareThird () {

  }

  showThird () {
    this.scenes[2].style.display = 'flex'
  }

  hideThird () {

  }

  prepareFourth () {

  }

  showFourth () {
    this.scenes[3].style.display = 'flex'
  }

  hideFourth () {

  }

  showCurrent () {
    switch (this.currentScene) {
      case 0:
        this.showFirst()
        break
      case 1:
        this.showSecond()
        break
      case 2:
        this.showThird()
        break
      case 3:
        this.showFourth()
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

export default One
