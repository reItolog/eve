import { qs } from '@/utils'

export default new (class {
  constructor() {
    this.isRunning = false
    this.el = qs('.js-pe')
  }

  run() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.isRunning = false
      this.togglePointers('none')
    }, 300)
    if (!this.isRunning) {
      this.isRunning = true
      this.togglePointers('all')
    }
  }

  togglePointers(state) {
    this.el.style.pointerEvents = state
  }
})()
