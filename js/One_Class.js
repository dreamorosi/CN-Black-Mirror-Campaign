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
    this.shutdownCallBack = settings.shutDownCall
    this.currentScene = 0
    // An animation is running, discard this scroll evt ? 1 : 0
    this.isTransitioning = 1

    this.isHelperVisible = 0
    this.scrollHelper = settings.scrollHelper

    if (!this.scrollHelper) {
      throw Error(`No scrollHelper element passed.`)
    }

    this.showCurrent = this.showCurrent.bind(this)
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
    this.shutdown = this.shutdown.bind(this)
    this.observeSecondHandler = this.observeSecondHandler.bind(this)
    this.observeThirdHandler = this.observeThirdHandler.bind(this)
    this.observeFourthHandler = this.observeFourthHandler.bind(this)
    this.toggleElementOpacity = this.toggleElementOpacity.bind(this)

    this.first = { form: { state: {} } }
    this.second = {}
    this.third = {}
    this.elements = {}
    this.fourth = {}
    this.prepareFirst()
    this.video = document.querySelector('video')
    this.vidSource = this.video.querySelector('source')
    this.video.style.height = this.clientH
    this.video.style.width = this.clientW
    // this.first.form.state.values = { daysPegado: 2500, yearsPegado: 7.5 }
    // this.prepareSecond()
    // this.prepareThird()
    // this.prepareFourth()

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

  prepareFirst () {
    let currentScene = this.scenes[0]
    this.first = {
      form: {
        node: currentScene.querySelector('form'),
        state: {
          isVisible: 1,
          isFilled: 0,
          values: {
            age: null,
            time: null
          }
        }
      },
      labels: [{
        node: currentScene.querySelector('label[for="age"]'),
        state: {
          isVisible: 0
        }
      }, {
        node: currentScene.querySelector('label[for="time"]'),
        state: {
          isVisible: 0
        }
      }],
      inputs: [{
        node: currentScene.querySelector('input[name="age"]'),
        state: {
          isVisible: 0
        }
      }, {
        node: currentScene.querySelector('input[name="time"]'),
        state: {
          isVisible: 0
        }
      }]
    }

    this.first.inputs[0].node.addEventListener('change', this.handleFormChange)
    this.first.inputs[1].node.addEventListener('change', this.handleFormChange)

    this.isTransitioning = 0
  }

  showFirst () {
    this.scenes[0].style.display = 'flex'
    let { first } = this
    setTimeout(() => {
      this.toggleElementOpacity(first.labels[0])
    }, 50)
    setTimeout(() => {
      this.toggleElementOpacity(first.inputs[0])
    }, 150)
    setTimeout(() => {
      this.toggleElementOpacity(first.labels[1])
    }, 250)
    setTimeout(() => {
      this.toggleElementOpacity(first.inputs[1])
    }, 400)
  }

  hideFirst () {
    this.toggleElementOpacity(this.first.form)
    this.toggleScrollHelper()
    setTimeout(() => {
      this.scenes[0].style.display = 'none'
    }, 500)
    setTimeout(this.next, 500)
  }

  handleFormChange (e) {
    let { form } = this.first
    form.state.values[e.target.name] = parseInt(e.target.value)
    let { age, time } = form.state.values
    if (age && time) {
      this.showResultButton()
      this.toggleScrollHelper()
      this.prepareSecond()
    }
  }

  showResultButton () {
    this.resultButton = document.createElement('P')
    let textnode = document.createTextNode('Ver Resultados')
    this.resultButton.appendChild(textnode)
    this.scrollHelper.parentNode.appendChild(this.resultButton)
    this.scrollHelper.addEventListener('click', this.submitForm)
    this.resultButton.addEventListener('click', this.submitForm)
    this.resultButton.style.opacity = '1'
  }

  removeResultButton () {
    this.resultButton.style.display = 'none'
  }

  submitForm () {
    let statAge = 82
    let { form } = this.first
    let { age, time } = form.state.values
    let days = (statAge - age) * 365
    let hours = time * days

    if (time > 5) {
      let vida = document.querySelector('.vida')
      this.toggleElementOpacity(this.first.form)
      this.toggleScrollHelper()
      setTimeout(() => {
        this.scenes[0].style.display = 'none'
      }, 500)
      vida.style.display = 'flex'
      let back = vida.querySelector('p')
      back.addEventListener('click', () => {
        window.location.reload()
      })
    } else {
      form.state.values.daysPegado = Math.floor(hours / 24)
      form.state.values.yearsPegado = (form.state.values.daysPegado / 365).toFixed(1)
      this.scrollHelper.removeEventListener('click', this.submitForm)
      this.hideFirst()
      this.setVideo(1)
    }
    this.resultButton.removeEventListener('click', this.submitForm)
    this.removeResultButton()
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

  observeSecond () {
    let options = {
      threshold: 0,
      rootMargin: '-10px'
    }
    this.secondObserver = new IntersectionObserver(this.observeSecondHandler, options)
    this.secondObserver.observe(this.second.graph.node)
  }

  observeSecondHandler (entry) {
    let { graph } = this.second
    if (entry[0].intersectionRatio > 0 && this.currentScene === 1 && graph.state.shouldToggle) {
      this.toggleElementOpacity(graph)
      this.showScrollHelper()
      this.scrollHelper.addEventListener('click', this.hideSecond)
      this.prepareThird()
    }
  }

  prepareSecond () {
    let currentScene = this.scenes[1]

    let ps = Array.from(currentScene.querySelectorAll('p'))
    this.second.paragraphs = ps.map(node => ({
      node: node,
      state: {
        isVisible: false
      }
    }))

    let bx = Array.from(currentScene.querySelectorAll('.blue-box'))
    this.second.boxes = bx.map(node => ({
      node: node,
      state: {
        isVisible: false
      }
    }))

    let nr = Array.from(currentScene.querySelectorAll('.blue-box h3'))
    this.second.numbers = nr.map(node => ({
      node: node,
      state: {
        isVisible: false
      }
    }))

    let hs = Array.from(currentScene.querySelectorAll('.blue-box h4'))
    this.second.headings = hs.map(node => ({
      node: node,
      state: {
        isVisible: false
      }
    }))

    this.second.graph = {
      node: currentScene.querySelector('.right-side img'),
      state: {
        isVisible: false,
        shouldToggle: false
      }
    }

    if (this.clientW < 500) {
      this.observeSecond()
      this.second.graph.state.shouldToggle = true
    }
  }

  showSecond () {
    this.scenes[1].style.display = 'flex'
    let { first, second } = this
    this.toggleElementOpacity(second.paragraphs[0])
    setTimeout(() => {
      this.toggleElementOpacity(second.boxes[0])
      second.numbers[0].node.innerHTML = first.form.state.values.daysPegado
    }, 50)
    setTimeout(() => {
      this.toggleElementOpacity(second.numbers[0])
    }, 100)
    setTimeout(() => {
      this.toggleElementOpacity(second.headings[0])
    }, 150)

    setTimeout(() => {
      this.toggleElementOpacity(second.paragraphs[1])
    }, 200)
    setTimeout(() => {
      this.toggleElementOpacity(second.boxes[1])
      second.numbers[1].node.innerHTML = first.form.state.values.yearsPegado
    }, 250)
    setTimeout(() => {
      this.toggleElementOpacity(second.numbers[1])
    }, 300)
    setTimeout(() => {
      this.toggleElementOpacity(second.headings[1])
    }, 350)

    if (this.clientW > 500) {
      setTimeout(() => {
        this.toggleElementOpacity(second.graph)
      }, 500)

      setTimeout(() => {
        this.showScrollHelper()
        this.scrollHelper.addEventListener('click', this.hideSecond)
        this.prepareThird()
      }, 500)
    }
  }

  hideSecond () {
    // remove evt listener from scrollHelper
    this.scrollHelper.removeEventListener('click', this.hideSecond)
    // stop observer (if running)
    if (this.secondObserver) {
      this.secondObserver.unobserve(this.second.graph.node)
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
    }, 50)

    // If on mobile trigger first box & start observing scrolling
    if (this.clientW < 500) {
      let [ img, text ] = third.boxes[0].children
      setTimeout(() => {
        // Toggle Image
        this.toggleElementOpacity(img)
      }, 50)

      setTimeout(() => {
        // Toggle Text
        this.toggleElementOpacity(text)
      }, 150)

      setTimeout(() => {
        this.toggleElementOpacity(third.spacers[0])
      }, 200)

      this.observeThird()
    } else {
      // If on desktop trigger each box evry 1.5s
      let delta = 0
      third.boxes.forEach(box => {
        let [ img, text ] = box.children
        setTimeout(() => {
          // Toggle Image
          this.toggleElementOpacity(img)
        }, delta + 50)

        setTimeout(() => {
          // Toggle Text
          this.toggleElementOpacity(text)
        }, delta + 100)

        delta = delta + 200
      })

      // Then trigger vertical spacers (border-right)
      setTimeout(() => {
        // Toggle Spacer
        third.boxes[0].node.style.borderRight = '1px solid #fff'
      }, 200)

      setTimeout(() => {
        // Toggle Spacer
        third.boxes[1].node.style.borderRight = '1px solid #fff'
      }, 350)

      // Then toggle scrollHelper after 5 additional seconds
      setTimeout(() => {
        this.toggleScrollHelper()
        this.scrollHelper.addEventListener('click', this.hideThird)
        this.prepareFourth()
      }, 1500)
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
          this.scrollHelper.addEventListener('click', this.shutdown)
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
    }, 50)

    // If on mobile trigger first box & start observing scrolling
    if (this.clientW < 500) {
      let [ label, text, img ] = fourth.boxes[0].children
      setTimeout(() => {
        // Toggle Label
        this.toggleElementOpacity(label)
      }, 50)

      setTimeout(() => {
        // Toggle Text
        this.toggleElementOpacity(text)
      }, 150)

      setTimeout(() => {
        // Toggle Image
        this.toggleElementOpacity(img)
      }, 200)

      setTimeout(() => {
        this.toggleElementOpacity(fourth.spacers[0])
      }, 250)

      this.observeFourth()
    } else {
      // If on desktop trigger each box evry 1.5s
      let delta = 0
      // console.log(fourth.boxes)
      fourth.boxes.forEach(box => {
        let [ label, text, img ] = box.children
        setTimeout(() => {
          // Toggle Label
          this.toggleElementOpacity(label)
        }, delta + 50)

        setTimeout(() => {
          // Toggle Text
          this.toggleElementOpacity(text)
        }, delta + 100)

        setTimeout(() => {
          // Toggle Image
          this.toggleElementOpacity(img)
        }, delta + 150)

        delta = delta + 150
      })

      // Then trigger vertical spacers (border-right)
      setTimeout(() => {
        // Toggle Spacer
        fourth.boxes[0].node.style.borderRight = '1px solid #fff'
      }, 150)

      // Then toggle scrollHelper after 5 additional seconds
      setTimeout(() => {
        this.toggleScrollHelper()
        this.scrollHelper.addEventListener('click', this.shutdown)
        console.log('should prepare part 2')
      }, 2500)
    }
  }

  shutdown () {
    let { title, boxes } = this.fourth

    // remove evt listener from scrollHelper
    this.scrollHelper.removeEventListener('click', this.shutdown)
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
    this.root.style.display = 'none'
    // call next
    this.shutdownCallBack()
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
