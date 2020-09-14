import store from '../store'
import Events from './Events'

const { flags } = store
const { isDevice } = flags

export default new (class {
  constructor() {
    this.on = 0
    this.off = 0
    this.events = {
      move: isDevice ? 'touchmove' : 'mousemove',
      down: isDevice ? 'touchstart' : 'mousedown',
      up: isDevice ? 'touchend' : 'mouseup',
    }
    this.addEvents()
  }

  addEvents() {
    const { move, down, up } = this.events
    window.addEventListener(move, this.onMove, { passive: false })
    window.addEventListener(down, this.onDown, { passive: false })
    window.addEventListener(up, this.onUp, { passive: false })
    Events.on('click', window, (e) =>  Events.emit('click', e))
  }

  getPos(e) {
    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    const y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY
    const target = e.target

    return {
      x, y, target,
    }
  }

  onMove = (e) => {
    if (!flags.dragging) return
    const { x, y, target } = this.getPos(e)
    Events.emit('mousemove', {
      x, y, target, e,
    })
  }

  onDown = (e) => {
    if (e.which === 3) return
    const { x, y, target } = this.getPos(e)
    this.on = x
    Events.emit('mousedown', {
      x, y, target,
    })
  }

  onUp = (e) => {
    const { x, target } = this.getPos(e)
    this.off = x
    const click = Math.abs(this.off - this.on) < 10
    Events.emit('mouseup', {
      x, target, click,
    })
  }
})()
