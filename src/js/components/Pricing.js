import gsap from 'gsap'

import { Events } from '@/events'
import { qs, qsa, rect } from '@/utils'
import store from '@/store'

const { flags } = store

export default class {
  ui = {}

  constructor() {
    this.el = qs('.js-pricing')
    this.ui.container = qs('.js-pricing-slides')
    this.ui.slides = [...qsa('.js-pricing-slide')]
    this.ui.bullets = [...qsa('.js-pricing-bullet')]
    this.ui.handle = qs('.js-pricing-handle')

    this.state = {
      target: 0,
      current: 0,
      rounded: 0,
      scale: 0,
      on: 0,
      max: 0,
      cancel: {
        x: 0,
        y: 0
      },
      dragging: false,
      resizing: false,
      snap: null
    }

    this.opts = {
      speed: 2,
      ease: 0.085,
    }

    this.init()
  }

  init() {
    this.setBounds()
    this.addEvents()
  }

  addEvents() {
    Events.on('tick', this.run)
    Events.on('mousedown', this.down)
    Events.on('mouseup', this.up)
    Events.on('mousemove', this.move)
    Events.on('click', this.click)
    Events.on('resize', this.resize)
  }

  setBounds() {
    const { slides, container } = this.ui
    const { ww } = store.bounds
    container.style.transform = 'translate3d(0, 0, 0)'
    const diff = ww - rect(container).right
    this.state.max = rect(slides[slides.length - 1]).right + diff - ww
    this.state.snap = slides.map((el, i) => (this.state.max / (slides.length - 1)) * i)
    this.setScale()
  }

  setScale() {
    const { bullets } = this.ui
    const state = this.state
    const max = rect(bullets[2]).left - rect(bullets[0]).left
    state.scale = state.max / max
  }

  run = () => {
    const state = this.state
    const diff = state.target - state.current
    if (!state.dragging && (Math.abs(diff) <= 0.001)) return
    state.current += diff * this.opts.ease
    state.rounded = Math.round(state.current * 100) / 100
    state.progress = state.rounded / state.max
    !state.resizing && this.transform()
  }

  transform() {
    const { container, handle } = this.ui
    const { rounded, scale } = this.state
    container.style.transform = `translate3d(${-rounded}px, 0, 0)`
    handle.style.transform = `translate3d(${rounded / scale}px, 0, 0)`
  }

  down = ({ x, y, target }) => {
    if (!target.closest('.js-pricing-draggable')) return
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

  click = ({ target }) => {
    const el = target.closest('.js-pricing-bullet')
    if (el) {
      const state = this.state
      state.target = state.snap[this.ui.bullets.indexOf(el)]
    }
  }

  clamp() {
    const state = this.state
    state.target = gsap.utils.clamp(0, state.max, state.target)
  }

  resize = () => {
    const state = this.state
    state.resizing = true
    this.setBounds()
    this.setScale()
    this.clamp()
    state.rounded = state.current = state.target
    this.transform()
    state.resizing = false
  }

  removeEvents() {
    Events.off('tick', this.run)
    Events.off('mousedown', this.down)
    Events.off('mouseup', this.up)
    Events.off('mousemove', this.move)
    Events.off('resize', this.resize)
    Events.off('click', this.click)
  }
  
  destroy() {
    this.removeEvents()
    this.state = null
    this.opts = null
    this.ui = null
  }
}
