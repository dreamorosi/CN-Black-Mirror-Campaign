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
    this.showThird = this.showThird.bind(this)
    this.hideThird = this.hideThird.bind(this)
    this.hideFourth = this.hideFourth.bind(this)
    this.observeSecondHandler = this.observeSecondHandler.bind(this)
    this.observeThirdHandler = this.observeThirdHandler.bind(this)
    this.observeFourthHandler = this.observeFourthHandler.bind(this)
    this.toggleElementOpacity = this.toggleElementOpacity.bind(this)

    if (settings.scrollGrain) {
      window.addEventListener('scroll', this.scrollWatcher)
    }

    this.first = {}
    this.second = {}
    this.third = {}
    this.elements = {}
    this.fourth = {}
    this.prepareFirst()
    // this.prepareSecond()
    // this.prepareThird()
    // this.prepareFourth()

    setTimeout(() => {
      this.showCurrent()
    }, 300)
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

  // TODO: refactor when scenes are in common array
  checkReferences (obj, name) {
    let result = true
    let keys = Object.keys(obj)
    keys.forEach(key => {
      if (!obj[key]) {
        result = false
      }
    })

    if (!result) {
      throw Error(`Scene ${name} is missing elements`)
    }
  }

  prepareFirst () {
    this.first.form = this.scenes[0].querySelector('form')
    this.first.firstLabel = this.scenes[0].querySelector('label[for="age"]')
    this.first.firstInput = this.scenes[0].querySelector('input[name="age"]')
    this.first.secondLabel = this.scenes[0].querySelector('label[for="time"]')
    this.first.secondInput = this.scenes[0].querySelector('input[name="time"]')

    this.checkReferences(this.first, 'one')

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

    this.checkReferences(this.second, 'two')

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
    // stop observer (if running)
    if (this.secondObserver) {
      this.secondObserver.unobserve(this.second.firstParagraph)
    }
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

  observeThird () {
    let options = {
      threshold: [0.7]
    }
    this.thirdObserver = new IntersectionObserver(this.observeThirdHandler, options)

    let { boxes } = this.third
    boxes.forEach(box => this.thirdObserver.observe(box.children[0].node))
  }

  observeThirdHandler (entries) {
    if (entries.length === 3) {
      return
    }

    entries.forEach(entry => {
      let { target } = entry
      let { boxes, spacers } = this.third
      let idx = target.dataset.idx
      this.toggleElementOpacity(boxes[idx].children[0])
      setTimeout(() => {
        this.toggleElementOpacity(boxes[idx].children[1])
      }, 1000)

      if (idx < 2) {
        setTimeout(() => {
          this.toggleElementOpacity(spacers[idx])
        }, 2000)
      } else {
        setTimeout(() => {
          this.toggleScrollHelper()
          this.scrollHelper.addEventListener('click', this.hideThird)
          this.prepareFourth()
        }, 2000)
      }
    })
  }

  prepareThird () {
    let currentScene = this.scenes[2]
    this.third = {
      title: {
        node: currentScene.querySelector('h3'),
        state: {
          isVisible: 0
        }
      },
      boxes: []
    }

    // Select container blocks
    let tmp = Array.from(currentScene.querySelectorAll('.content > div'))
    this.third.boxes = tmp.map(node => ({
      node: node,
      state: {
        isVisible: parseInt(window.getComputedStyle(node).getPropertyValue('opacity'))
      }
    }))

    // OPTIMIZE: test references

    // Select img and text inside a box
    this.third.boxes = this.third.boxes.map(box => {
      let node = box.node.querySelector('img')
      // IDEA: try parseInt(window.getComputedStyle(node).getPropertyValue('opacity'))
      let imgObj = {
        node: node,
        state: {
          isVisible: 0
        }
      }

      // OPTIMIZE: extrapolate utility

      let textNode = box.node.querySelector('h4')
      let textObj = {
        node: textNode,
        state: {
          isVisible: 0
        }
      }

      box.children = [
        imgObj,
        textObj
      ]

      return box
    })

    // OPTIMIZE: test references

    tmp = Array.from(currentScene.querySelectorAll('.content > hr'))
    this.third.spacers = tmp.map(node => ({
      node: node,
      state: {
        isVisible: 0
      }
    }))

    // this.checkReferences(this.third, 'third')
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

  showThird () {
    let { scenes, third } = this
    let currentScene = scenes[2]
    currentScene.style.display = 'flex'
    setTimeout(() => {
      this.toggleElementOpacity(this.third.title)
    }, 500)

    // If on mobile trigger first box & start observing scrolling
    if (this.clientW < 500) {
      let [ img, text ] = third.boxes[0].children
      setTimeout(() => {
        // Toggle Image
        this.toggleElementOpacity(img)
      }, 500)

      setTimeout(() => {
        // Toggle Text
        this.toggleElementOpacity(text)
      }, 1500)

      setTimeout(() => {
        this.toggleElementOpacity(third.spacers[0])
      }, 2500)

      this.observeThird()
    } else {
      // If on desktop trigger each box evry 1.5s
      let delta = 0
      third.boxes.forEach(box => {
        let [ img, text ] = box.children
        setTimeout(() => {
          // Toggle Image
          this.toggleElementOpacity(img)
        }, delta + 500)

        setTimeout(() => {
          // Toggle Text
          this.toggleElementOpacity(text)
        }, delta + 1000)

        delta = delta + 1500
      })

      // Then trigger vertical spacers (border-right)
      setTimeout(() => {
        // Toggle Spacer
        third.boxes[0].node.style.borderRight = '1px solid #fff'
      }, 2000)

      setTimeout(() => {
        // Toggle Spacer
        third.boxes[1].node.style.borderRight = '1px solid #fff'
      }, 3500)

      // Then toggle scrollHelper after 5 additional seconds
      setTimeout(() => {
        this.toggleScrollHelper()
        this.scrollHelper.addEventListener('click', this.hideThird)
        this.prepareFourth()
      }, 8500)
    }
  }

  hideThird () {
    let { title, boxes } = this.third

    // remove evt listener from scrollHelper
    this.scrollHelper.removeEventListener('click', this.hideThird)
    // stop observer (if running)
    if (this.thirdObserver) {
      boxes.forEach(box => this.thirdObserver.unobserve(box.children[0].node))
    }
    // fadeout title
    this.toggleElementOpacity(title)
    // fadeout content
    boxes.forEach(box => {
      this.toggleElementOpacity(box)
      this.toggleElementOpacity(box.children[0])
      this.toggleElementOpacity(box.children[1])
    })

    // display none slide
    setTimeout(() => {
      this.scenes[2].style.display = 'none'
    }, 1100)
    // call next
    setTimeout(this.next, 1200)
  }

  prepareFourth () {
    let currentScene = this.scenes[3]
    this.fourth = {
      title: {
        node: currentScene.querySelector('h3'),
        state: {
          isVisible: 0
        }
      },
      boxes: []
    }

    // Select container blocks
    let tmp = Array.from(currentScene.querySelectorAll('.content > div'))
    this.fourth.boxes = tmp.map(node => ({
      node: node,
      state: {
        isVisible: parseInt(window.getComputedStyle(node).getPropertyValue('opacity'))
      }
    }))

    // OPTIMIZE: test references

    // Select img and text inside a box
    this.fourth.boxes = this.fourth.boxes.map(box => {
      let labelNode = box.node.querySelector('p')
      let labelObj = {
        node: labelNode,
        state: {
          isVisible: 0
        }
      }
      // OPTIMIZE: extrapolate utility

      let textNode = box.node.querySelector('.text')
      let textObj = {
        node: textNode,
        state: {
          isVisible: 0
        }
      }

      let node = box.node.querySelector('img')
      // IDEA: try parseInt(window.getComputedStyle(node).getPropertyValue('opacity'))
      let imgObj = {
        node: node,
        state: {
          isVisible: 0
        }
      }

      box.children = [
        labelObj,
        textObj,
        imgObj
      ]

      return box
    })

    // OPTIMIZE: test references

    tmp = Array.from(currentScene.querySelectorAll('.content > hr'))
    this.fourth.spacers = tmp.map(node => ({
      node: node,
      state: {
        isVisible: 0
      }
    }))
  }

  observeFourth () {
    let options = {
      threshold: [0.1]
    }
    this.fourth.observing = false
    this.fourthObserver = new IntersectionObserver(this.observeFourthHandler, options)

    let { boxes } = this.fourth
    boxes.forEach(box => this.fourthObserver.observe(box.node))
  }

  observeFourthHandler (entries) {
    if (!this.fourth.observing) {
      this.fourth.observing = true
      return
    }
    entries.forEach(entry => {
      let { target } = entry
      let { boxes } = this.fourth
      let idx = target.dataset.idx
      this.toggleElementOpacity(boxes[idx].children[0])
      setTimeout(() => {
        this.toggleElementOpacity(boxes[idx].children[1])
      }, 1000)
      setTimeout(() => {
        this.toggleElementOpacity(boxes[idx].children[2])
      }, 2000)

      if (idx < 1) {

      } else {
        setTimeout(() => {
          this.toggleScrollHelper()
          this.scrollHelper.addEventListener('click', this.hideFourth)
          console.log('should prepare part 2')
        }, 2000)
      }
    })
  }

  showFourth () {
    let { scenes, fourth } = this
    let currentScene = scenes[3]
    currentScene.style.display = 'flex'
    setTimeout(() => {
      this.toggleElementOpacity(this.fourth.title)
    }, 500)

    // If on mobile trigger first box & start observing scrolling
    if (this.clientW < 500) {
      let [ label, text, img ] = fourth.boxes[0].children
      setTimeout(() => {
        // Toggle Label
        this.toggleElementOpacity(label)
      }, 500)

      setTimeout(() => {
        // Toggle Text
        this.toggleElementOpacity(text)
      }, 1500)

      setTimeout(() => {
        // Toggle Image
        this.toggleElementOpacity(img)
      }, 2500)

      setTimeout(() => {
        this.toggleElementOpacity(fourth.spacers[0])
      }, 3500)

      this.observeFourth()
    } else {
      // If on desktop trigger each box evry 1.5s
      let delta = 0
      console.log(fourth.boxes)
      fourth.boxes.forEach(box => {
        let [ label, text, img ] = box.children
        setTimeout(() => {
          // Toggle Label
          this.toggleElementOpacity(label)
        }, delta + 500)

        setTimeout(() => {
          // Toggle Text
          this.toggleElementOpacity(text)
        }, delta + 1000)

        setTimeout(() => {
          // Toggle Image
          this.toggleElementOpacity(img)
        }, delta + 1500)

        delta = delta + 1500
      })

      // Then trigger vertical spacers (border-right)
      setTimeout(() => {
        // Toggle Spacer
        fourth.boxes[0].node.style.borderRight = '1px solid #fff'
      }, 1500)

      // Then toggle scrollHelper after 5 additional seconds
      setTimeout(() => {
        this.toggleScrollHelper()
        this.scrollHelper.addEventListener('click', this.hideFourth)
        console.log('should prepare part 2')
      }, 8500)
    }
  }

  hideFourth () {
    let { title, boxes } = this.fourth

    // remove evt listener from scrollHelper
    this.scrollHelper.removeEventListener('click', this.hidefourth)
    // stop observer (if running)
    if (this.fourthObserver) {
      boxes.forEach(box => this.fourthObserver.unobserve(box.children[0].node))
    }
    // fadeout title
    this.toggleElementOpacity(title)
    // fadeout content
    boxes.forEach(box => {
      this.toggleElementOpacity(box)
      this.toggleElementOpacity(box.children[0])
      this.toggleElementOpacity(box.children[1])
      this.toggleElementOpacity(box.children[2])
    })

    // display none slide
    setTimeout(() => {
      this.scenes[3].style.display = 'none'
    }, 1100)
    // call next
    // setTimeout(this.next, 1200)
    console.log('Go to Part 2')
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
