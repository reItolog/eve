import { Events } from '@/events'
import store from '@/store'

const keyCodes = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  SPACE: 32
}

const hasTouch = ('ontouchstart' in window) || window.TouchEvent || window.DocumentTouch && document instanceof DocumentTouch
const hasKeyDown = 'onkeydown' in document

const { flags, bounds } = store
const { windows, isFirefox } = flags

export default class {

  constructor(opts = {}) {
    this.el = window
    this.opts = Object.assign({
      mm: windows ? 1.1 : 0.45,
      tm: 2.75,
      fm: windows ? 40 : 90,
      ks: 120,
    }, opts)

    this.evt = {
      y: 0,
      deltaY: 0
    }

    this.touchStartY = null

    this.init()
  }

  init() {
    this.notify()
    this.addEvents()
  }

  addEvents() {
    Events.on('wheel', this.el, this.wheel, { passive: true })

    if (hasTouch) {
      Events.on('touchstart', this.el, this.touchStart, { passive: true })
      Events.on('touchmove', this.el, this.touchMove, { passive: true })   
    }

    hasKeyDown
      && Events.on('keydown', document, this.keyDown)
  }

  notify(e = null) {
    const evt = this.evt
    evt.y += evt.deltaY

    Events.emit('vs', {
      y: evt.y,
      deltaY: evt.deltaY,
      originalEvent: e
    })   
  }

  wheel = (e) => {
    const { mm, fm } = this.opts
    const evt = this.evt

    evt.deltaY = e.wheelDeltaY || e.deltaY * -1

    isFirefox && e.deltaMode == 1
        && (evt.deltaY *= fm)

    evt.deltaY *= mm

    this.notify(e)
  }

  touchStart = (e) => {
    const t = (e.targetTouches) ? e.targetTouches[0] : e
    this.touchStartY = t.pageY
  }

  touchMove = (e) => {
    const { tm } = this.opts
    const evt = this.evt

    const t = (e.targetTouches) ? e.targetTouches[0] : e
    evt.deltaY = (t.pageY - this.touchStartY) * tm

    this.touchStartY = t.pageY

    this.notify(e)
  }

  keyDown = (e) => {
    if (document.activeElement.nodeName === 'INPUT') return
    
    const evt = this.evt
    const { ks } = this.opts
    const wh = bounds.wh - 40

    evt.deltaY = 0

    switch (e.keyCode) {
      case keyCodes.LEFT:
      case keyCodes.UP:
        evt.deltaY = ks
        break

      case keyCodes.RIGHT:
      case keyCodes.DOWN:
        evt.deltaY = -ks
        break
      case keyCodes.SPACE && e.shiftKey:
        evt.deltaY = wh
        break
      case keyCodes.SPACE:
        evt.deltaY = - wh
        break
      default:
        return
    }

    this.notify(e)
  }
}