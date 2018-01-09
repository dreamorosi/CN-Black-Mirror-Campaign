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

class Three {
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
    this.currentQ = 0
    // An animation is running, discard this scroll evt ? 1 : 0
    this.isTransitioning = 1
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

    this.questions = {}
    this.prepareStatusBar()
    this.prepareQuestions()
    // this.prepareNormal()
    // this.prepareFinal()

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

  prepareStatusBar () {
    this.statusBar = {
      node: this.root.querySelector('.status-bar'),
      state: {
        isVisible: 0
      },
      title: {
        node: this.root.querySelector('.status-bar h2'),
        state: {
          isVisible: 0
        }
      },
      subtitle: {
        node: this.root.querySelector('.status-bar p'),
        state: {
          isVisible: 0
        }
      },
      progress: {
        node: this.root.querySelector('.status-bar .right-side'),
        state: {
          isVisible: 0
        },
        children: []
      }
    }

    // Select container blocks
    let tmp = Array.from(this.statusBar.progress.node.querySelectorAll('span'))
    this.statusBar.progress.children = tmp.map(node => ({
      node: node,
      state: {
        isFull: 0
      }
    }))
  }

  prepareQuestions () {
    let tmp = Array.from(this.root.querySelectorAll('.slide'))
    this.questions = tmp.map(node => ({
      node: node,
      state: {
        isVisible: 0
      }
    }))

    this.questions = this.questions.map(quest => {
      let node = quest.node.querySelector('.option-box')
      // IDEA: try parseInt(window.getComputedStyle(node).getPropertyValue('opacity'))
      let imgObj = {
        node: node,
        state: {
          isVisible: 0
        }
      }

      quest = {
        node: quest.node,
        state: quest.state,
        children: {
          // options
        }
      }

      return quest
    })

    console.log(this.questions)
  }

  toggleStatusBar () {
    let { title, subtitle, progress } = this.statusBar
    if (title.state.isVisible) {
      // hide
      this.statusBar.node.style.display = 'none'
      this.statusBar.state.isVisible = 0
      title.node.style.opacity = '0'
      title.state.isVisible = 0
      subtitle.node.style.opacity = '0'
      subtitle.state.isVisible = 0
      progress.node.style.opacity = '0'
      progress.state.isVisible = 0
    } else {
      // show
      this.statusBar.node.style.display = 'flex'
      this.statusBar.state.isVisible = 1
      setTimeout(() => {
        title.node.style.opacity = '1'
        title.state.isVisible = 1
      }, 500)

      setTimeout(() => {
        subtitle.node.style.opacity = '1'
        subtitle.state.isVisible = 1
      }, 1000)

      setTimeout(() => {
        progress.node.style.opacity = '1'
        progress.state.isVisible = 1
      }, 1500)
    }
  }

  showQuestion () {
    console.log('show question slide')
    let { statusBar, questions, currentQ } = this
    if (!statusBar.title.state.isVisible) {
      this.toggleStatusBar()
    }
    let prog = 0
    while (prog <= currentQ) {
      statusBar.progress.children[prog].node.style.opacity = '1'
      statusBar.progress.children[prog].state.isFull = 1
      prog++
    }
  }

  showNormal () {
    console.log('show normal slide')
  }

  showCurrent () {
    if (this.currentScene < 6) {
      this.showQuestion()
    } else {
      this.showNormal()
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

export default Three
