import gsap from 'gsap'

import { Events } from '@/events'
import { qs, qsa, rect } from '@/utils'
import store from '@/store'

const { flags, bounds } = store

export default class {
  ui = {}

  constructor() {
    this.el = qs('.js-proof')
    this.ui.container = qs('.js-proof-slides')
    this.ui.slides = [...qsa('.js-proof-slide')]

    this.state = {
      target: 0,
      current: 0,
      rounded: 0,
      on: 0,
      max: 0,
      cancel: {
        x: 0,
        y: 0
      },
      dragging: false,
      resizing: false,
    }

    this.opts = {
      speed: 2,
      ease: 0.085,
    }

    this.init()
  }

  init() {
    this.setCache()
    this.addEvents()
  }

  addEvents() {
    Events.on('tick', this.run)
    Events.on('mousedown', this.down)
    Events.on('mouseup', this.up)
    Events.on('mousemove', this.move)
    Events.on('resize', this.resize)
  }

  setCache() {
    const { slides, container } = this.ui
    const { ww } = bounds
    const l = slides.length - 1

    this.cache = slides.map((el, i) => {
      el.style.transform = 'translate3d(0, 0, 0)'
      const { left, right } = rect(el)

      i === l 
        && (this.state.max = right + (ww - rect(container).right) - ww)

      return {
        el,
        start: left - ww - 50,
        end: right + 50,
        out: true
      }
    })
  }

  run = () => {
    const state = this.state
    const diff = state.target - state.current

    if (!state.dragging && (Math.abs(diff) <= 0.001)) return

    state.current += diff * this.opts.ease
    state.rounded = Math.round(state.current * 100) / 100
    state.progress = state.rounded / state.max

    !state.resizing && this.transformSlides()
  }

  transform(el, current) {
    el.style.transform = `translate3d(${-current}px, 0, 0)`
  }

  transformSlides(current = this.state.rounded) {
    this.cache.forEach(c => {
      const visible = this.visible(c, current)

      if (visible || this.state.resizing) {
        c.out && (c.out = false, c.el.style.visibility = 'visible')
        this.transform(c.el, current)
      } else if (!c.out) {
        c.out = true
        this.transform(c.el, current)
        c.el.style.visibility = 'hidden'
      }
    })
  }

  visible({ start, end }, current) {
    return current > start && current < end
  }

  down = ({ x, y, target }) => {
    if (!target.closest('.js-proof-draggable')) return
    const state = this.state
    flags.dragging = true
    state.dragging = true
    state.cancel.x = x
    state.cancel.y = y
    state.on = state.target + x * this.opts.speed
    !this.initial && this.removeCTA()
  }

  removeCTA() {
    this.initial = true
    const el = qs('.js-btn-next', this.el)
    gsap.to(el, { 
      alpha: 0,
      duration: 0.35,
      ease: 'power1',
      onComplete: () => el.remove()
    })
  }

  move = ({ x, y, e }) => {
    const state = this.state
    if (!state.dragging) return
    const { cancel } = state

    if ((Math.abs(x - cancel.x) > Math.abs(y - cancel.y)) && e.cancelable) {
      e.preventDefault()
      e.stopPropagation()
    }

    state.target = state.on - x * this.opts.speed
    this.clamp()
  }

  up = () => {
    flags.dragging = false
    this.state.dragging = false
  }

  clamp() {
    const state = this.state
    state.target = gsap.utils.clamp(0, state.max, state.target)
  }

  resize = () => {
    const state = this.state
    state.resizing = true
    this.setCache()
    this.clamp()
    state.rounded = state.current = state.target
    this.transformSlides()
    state.resizing = false
  }

  removeEvents() {
    Events.off('tick', this.run)
    Events.off('mousedown', this.down)
    Events.off('mouseup', this.up)
    Events.off('mousemove', this.move)
    Events.off('resize', this.resize)
  }

  destroy() {
    this.removeEvents()
    this.state = null
    this.opts = null
    this.ui = null
  }
}
