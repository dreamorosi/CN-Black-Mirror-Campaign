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

class Three {
  constructor (settings) {
    if (!settings.root) {
      throw Error(`No root element passed.`)
    }
    this.root = settings.root
    this.scenes = Array.from(this.root.querySelectorAll('.slide'))
    if (!this.scenes.length) {
      throw Error(`No scenes found.`)
    }

    this.clientW = viewport().width
    this.clientH = viewport().height
    this.currentScene = 0
    this.currentQ = 0
    // An animation is running, discard this scroll evt ? 1 : 0
    this.isTransitioning = 1
    this.isHelperVisible = 0
    this.scrollHelper = settings.scrollHelper
    this.removeAllEventListenersFromElement(this.scrollHelper)
    this.scrollHelper = document.querySelector('.scrollHelper img')
    if (!this.scrollHelper) {
      throw Error(`No scrollHelper element passed.`)
    }

    this.showCurrent = this.showCurrent.bind(this)
    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)
    this.transitionFinished = this.transitionFinished.bind(this)
    this.toggleScrollHelper = this.toggleScrollHelper.bind(this)
    this.showScrollHelper = this.showScrollHelper.bind(this)
    this.hideScrollHelper = this.hideScrollHelper.bind(this)
    this.toggleElementOpacity = this.toggleElementOpacity.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.advance = this.advance.bind(this)

    this.questions = {}
    this.prepareStatusBar()
    this.prepareQuestions()
    this.root.style.display = 'block'
    this.normalS = 0
    this.video = document.querySelector('body > video')
    this.vidSource = this.video.querySelector('source')
    this.video.style.height = this.clientH
    this.video.style.width = this.clientW
    this.solutions = [[
      0, 55, 45
    ], [
      1, 22, 80
    ], [
      1, 22, 80
    ], [
      1, 45, 55
    ], [
      0, 55, 45
    ], [
      1, 30, 70
    ]]
    // this.prepareNormal()
    // this.prepareFinal()

    setTimeout(() => {
      this.showCurrent()
    }, 150)
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

  setVideo (n) {
    this.vidSource.src = this.clientW < 500 ? `./videos/fondo_0${n}_m.mp4` : `./videos/fondo_0${n}.mp4`
    this.video.load()
    this.video.play().then(() => {
      console.log('ok')
    }).catch((error) => {
      console.log(error)
    })
  }

  stopVideo () {
    this.video.stop()
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

    let i = 1
    this.questions = this.questions.map(quest => {
      let boxesE = Array.from(quest.node.querySelectorAll('.option-box'))
      let boxes = boxesE.map(box => {
        let obj = {
          node: box,
          state: {
            isVisible: 0
          }
        }

        let imgObjs = Array.from(box.querySelectorAll('img'))
        if (i < 10) {
          imgObjs[0].src = `./images/3-${i + 14}.png`
          imgObjs[1].src = `./images/3-0${i}.png`
        } else {
          imgObjs[0].src = `./images/3-${i + 14}.png`
          imgObjs[1].src = `./images/3-${i}.png`
        }
        i++

        let optionsE = Array.from(box.querySelectorAll('.option'))
        let options = optionsE.map(option => ({
          node: option,
          state: {
            isVisible: 0
          },
          children: [{
            node: option.querySelector('h3'),
            state: {
              isVisible: 0
            }
          }, {
            node: option.querySelector('h4'),
            state: {
              isVisible: 0
            }
          }, {
            node: option.querySelector('h5'),
            state: {
              isVisible: 0
            }
          }]
        }))
        obj.children = options
        return obj
      })

      quest = {
        node: quest.node,
        state: quest.state,
        children: boxes
      }

      return quest
    })
    this.scrollHelper.style.bottom = '35px'
  }

  removeAllEventListenersFromElement (el) {
    let clone = el.cloneNode()
    // move all child elements from the original to the clone
    while (el.firstChild) {
      clone.appendChild(el.lastChild)
    }

    el.parentNode.replaceChild(clone, el)
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

    questions.forEach(q => (q.node.style.display = 'none'))
    this.currQuestion = questions[currentQ]
    this.currQuestion.node.style.display = 'flex'
    this.currQuestion.children[0].node.classList.remove('solution')
    this.currQuestion.children[1].node.classList.remove('solution')
    this.currQuestion.children[0].node.classList.remove('correct')
    this.currQuestion.children[1].node.classList.remove('correct')
    this.currQuestion.children[0].node.addEventListener('click', this.handleClick, false)
    this.currQuestion.children[1].node.addEventListener('click', this.handleClick, false)
  }

  handleClick (e) {
    this.currQuestion.children[0].node.removeEventListener('click', this.handleClick, false)
    this.currQuestion.children[1].node.removeEventListener('click', this.handleClick, false)

    let { currentQ } = this
    let results = this.solutions[currentQ]
    this.currQuestion.children[0].node.classList.add('solution')
    this.currQuestion.children[1].node.classList.add('solution')
    this.currQuestion.children[results[0]].node.classList.add('correct')

    if (this.clientW > 500) {
      setTimeout(() => {
        this.currQuestion.children[0].node.style.width = results[currentQ][1] + '%'
        this.currQuestion.children[1].node.style.width = results[currentQ][2] + '%'
      }, 150)
    }

    this.showScrollHelper()
    this.scrollHelper.addEventListener('click', this.advance, false)
  }

  showFirstBlack () {
    this.scrollHelper.style.bottom = '15px'
    let black = document.querySelector('.slide.black')
    black.style.display = 'flex'
    let lastP = document.querySelector('#lastText')
    this.scrollHelper.addEventListener('click', this.next)
    let fx = new TextScramble(lastP)
    fx.setText('> Una persona toca su móvil, de media, unas 2.617 veces al día. /')
    this.setVideo(5)
    this.normalS++
  }

  showSecondBlack () {
    let blackOld = document.querySelector('.slide.black')
    blackOld.style.display = 'none'
    let black = document.querySelector('.slide.black2')
    black.style.display = 'flex'
    let lastP = document.querySelector('#lastText2')
    let lastP2 = document.querySelector('#lastText3')
    let fx = new TextScramble(lastP)
    fx.setText('> Ahora pregúntate. /')
    fx = new TextScramble(lastP2)
    fx.setText('> ¿Cuanto tiempo inviertes en acariciar a otras personas? /')
    this.normalS++
  }

  showThirdBlack () {
    let blackOld = document.querySelector('.slide.black2')
    blackOld.style.display = 'none'
    let black = document.querySelector('.slide.black3')
    black.style.display = 'flex'
    let lastP = document.querySelector('#lastText4')
    let lastP2 = document.querySelector('#lastText5')
    let lastP3 = document.querySelector('#lastText6')
    let fx = new TextScramble(lastP)
    fx.setText('> El día de mañana, cuando ya no estés, dejarás un rastro de basura digital acumulada en la carpeta de algún disco duro. /')
    fx = new TextScramble(lastP2)
    fx.setText('> Resistirá algunos meses. Puede que algunos años.<br /> pero después te borrarán y desparecerá tu rastro para siempre. o tal vez todos tus recuerdos vayan a parar a algún museo en el que haya gente que quiera pagar por ellos. /')
    fx = new TextScramble(lastP3)
    fx.setText('> o que valgan tan poco, que nadie los quiera. /')
  }

  showLast () {
    let black = document.querySelector('.slide.black3')
    black.style.display = 'none'
    let final = document.querySelector('.slide.final')
    final.style.display = 'flex'
    this.video.pause()
    this.video.style.display = 'none'
    let lastV = final.querySelector('video')
    let lastVsrc = lastV.querySelector('source')
    if (this.clientW > 500) {
      lastVsrc.src = './videos/trailer_wide.mp4'
    } else {
      lastVsrc.src = './videos/trailer_mobile.mp4'
    }
    lastV.load()
    let url = window.location.href
    let shareP = final.querySelector('.likes p')
    let fb = final.querySelector('.social a:nth-child(1)')
    let appId = document.querySelector('meta[property="fb:app_id"]').content
    let tw = final.querySelector('.social a:nth-child(2)')
    let wh = final.querySelector('.social a:nth-child(3)')
    let tl = final.querySelector('.social a:nth-child(4)')
    let fx = new TextScramble(shareP)
    fx.setText('> Gánate un par de likes /')
    fb.href = `https://www.facebook.com/dialog/share?&display=popup&href=${encodeURI(url)}&app_id=${appId}`
    tw.href = `https://twitter.com/intent/tweet?url=${encodeURI(url)}`
    if (this.clientW > 500) {
      wh.href = `https://web.whatsapp.com/send?text=${encodeURI(url)}`
      this.scrollHelper.parentNode.style.display = 'none'
      let overlay = document.querySelector('.overlay')
      overlay.style.display = 'none'
    } else {
      wh.href = `whatsapp://send?text=${encodeURI(url)}`
    }
    tl.href = `https://t.me/share/url?url=${encodeURI(url)}`
    this.hideScrollHelper()
  }

  showCurrent () {
    if (this.currentScene < 6) {
      this.showQuestion()
    } else {
      if (this.currentScene === 6) {
        this.showFirstBlack()
      } else if (this.currentScene === 7) {
        this.showSecondBlack()
      } else if (this.currentScene === 8) {
        this.showThirdBlack()
      } else if (this.currentScene === 9) {
        this.showLast()
      }
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

  advance () {
    if (this.currentQ < 5) {
      this.transitionStarted()
      this.currentQ++
      this.showQuestion()
    } else {
      this.questions.forEach(q => (q.node.style.display = 'none'))
      this.statusBar.node.style.display = 'none'
      this.scrollHelper.removeEventListener('click', this.advance, false)
      this.currentScene = 6
      this.showCurrent()
      console.log('show black')
    }
  }
}

export default Three
