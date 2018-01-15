class TextScramble {
  constructor (el) {
    this.el = el
    this.chars = '!~-_\\/[]{}—=+*^?#________'
    this.update = this.update.bind(this)
  }
  setText (newText, speed = 10) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise((resolve) => (this.resolve = resolve))
    this.queue = []
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = i + Math.floor(Math.random() * speed)
      const end = i + start + Math.floor(Math.random() * speed)
      this.queue.push({ from, to, start, end })
    }
    window.cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()
    return promise
  }
  update () {
    let output = ''
    let complete = 0
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar()
          this.queue[i].char = char
        }
        output += `<span class='scrambling'>${char}</span>`
      } else {
        output += from
      }
    }
    this.el.innerHTML = output
    if (complete === this.queue.length && !this.multiLine) {
      this.resolve()
    } else if (complete === this.queue.length && this.multiLine) {
      this.currentLine++
      if (this.currentLine < this.lines.length) {
        this.addLineBreak()
        this.setText(this.lines[this.currentLine])
      }
    } else {
      this.frameRequest = window.requestAnimationFrame(this.update)
      this.frame++
    }
  }
  newElement (el) {
    this.el = el
  }
  setMultiLineText (newText, separator) {
    this.lines = newText.split(separator).map(line => line.trim())
    this.multiLine = this.lines.length > 1

    this.setText(this.lines[this.currentLine])
  }
  randomChar () {
    return this.chars[Math.floor(Math.random() * this.chars.length)]
  }
}

export default TextScramble
