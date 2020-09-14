import gsap from 'gsap'

import store from '@/store'
import { Events, GlobalRaf } from '@/events'
import { qs, qsa, rect } from '@/utils'

const { bounds, flags } = store

export default class {
  ui = {}

  constructor() {
    this.ui.elems = [...qsa('[data-anchor]')]
    this.ui.menuElems = this.ui.elems.filter(el => el.classList.contains('js-sm-link'))
    this.ui.hiwElems = this.ui.elems.filter(el => el.classList.contains('js-hiw-link'))
    this.ui.arrows = [...qsa('.js-s-arrow')]
    this.ui.line = qs('.js-sh-line')

    this.state = {
      last: null,
      target: {
        scale: 0,
        x: 0
      },
      current: {
        scale: 0,
        x: 0
      },
      hiw: {
        last: 0
      },
      i: 0
    }

    this.cache = {
      elems: null,
      arrows: null,
      menu: null,
      hiw: null
    }

    this.o = new IntersectionObserver(this.handle, {
      root: null,
      rootMargin: '-25% 0px -25% 0px',
      threshold: [0, 0],
    })

    this.init()
  }

  init() {
    this.setElemCache()
    this.setArrowCache()   
    this.setMenuCache()
    this.setHiwCache()
    this.addEvents()
  }

  addEvents() {
    const { elems, arrows } = this.ui
    Events.on('tick', this.run)
    Events.on('resize:on-reset', this.resize)
    elems.length && Events.on('click', elems, this.anchorScroll)
    arrows.length && Events.on('click', arrows, this.arrowScroll)
  }

  setElemCache() {
    const { ww } = bounds
    this.cache.elems = this.ui.elems.map(el => {
      const target = qs(`${el.dataset.anchor}`)
      const offset = ww * (target.dataset.offset || 0.1)
      return rect(target).top - offset
    })
  }

  setArrowCache() {
    const { ww } = bounds
    const { arrows } = this.ui
    arrows.length && (this.cache.arrows = arrows.map((el, i) => {
      return i >= arrows.length - 2
        ? 0 : rect(arrows[i + 1]).top - (ww * 0.1)
    }))
  }

  setMenuCache() {
    const { menuElems, line } = this.ui
    if (!menuElems.length) return
    const w = rect(line).width
    this.cache.menu = menuElems.map((el, i) => {
      const elem = qs(`${el.dataset.anchor}`)
      const x = el.offsetLeft
      const scaleX = el.offsetWidth / w

      if (i === 0) {
        if (flags.initial) {
          gsap.timeline()
          .set(line, { alpha: 1 })
          .fromTo(line, { 
            scaleX: 0,
            x: 0,
          }, {
            scaleX, x,
            duration: 0.75,
            ease: 'power3.inOut'
          })
        } else {
          gsap.set(line, { alpha: 1, scaleX, x })
        }
      }

      this.o.observe(elem)

      return {
        el, elem, i,
        x, scaleX
      }
    })
  }

  setHiwCache() {
    const { hiwElems } = this.ui
    hiwElems.length && (this.cache.hiw = hiwElems.map(el => {
      const elem = qs(`${el.dataset.anchor}`)
      this.o.observe(elem)
      return { el, elem }
    }))
  }

  updateMenuCache() {
    const { menu } = this.cache
    if (!menu) return
    this.transformLine(0, 1)
    const w = rect(this.ui.line).width
    menu.forEach(c => {
      c.x = c.el.offsetLeft
      c.scaleX = c.el.offsetWidth / w
    })
    this.line()
    this.transformLine()
  }

  run = () => {
    const { target: { x, scale }, current, resize } = this.state
    const diff = x - current.x
    if (Math.abs(diff) <= 0.001) return
    current.x += diff * 0.1
    current.scale += (scale - current.scale) * 0.1
    !resize && this.transformLine(current.x, current.scale)
  }

  transformLine(x = this.state.current.x, scale = this.state.current.scale) {
    const { line } = this.ui
    line && (line.style.transform = `translate3d(${x}px, 0, 0) scaleX(${scale})`)
  }

  line(
    x = this.cache.menu[this.state.i].x, 
    scale = this.cache.menu[this.state.i].scaleX
  ) {
    const { target } = this.state
    target.scale = scale
    target.x = x
  }

  handle = (entries) => {
    entries.forEach(e => {
      const menu = this.cache && this.cache.menu.find(c => c.elem === e.target)
      if (menu) {
        const { el, i, x, scaleX } = menu
        if (e.isIntersecting) {
          const state = this.state
          state.last && state.last.classList.remove('is-active')
          state.i = i
          this.line(x, scaleX)
          el.classList.add('is-active')
          state.last = el
        }
      } else {
        const { el } = this.cache.hiw.find(c => c.elem === e.target)
        if (e.isIntersecting) {
          const { hiw } = this.state
          hiw.last && hiw.last.classList.remove('is-active')
          el.classList.add('is-active')
          hiw.last = el
        }
      }
    })
  }

  anchorScroll = (e = null) => {
    e && e.preventDefault()
    const offset = this.cache.elems[this.ui.elems.indexOf(e.currentTarget)]
    gsap.to(GlobalRaf, {
      target: offset,
      duration: 1.5,
      ease: 'power3.inOut'
    })
  }

  arrowScroll = ({ currentTarget }) => {
    const i = this.ui.arrows.indexOf(currentTarget)
    const offset = gsap.utils.clamp(0, bounds.scroll, this.cache.arrows[i])
    gsap.to(GlobalRaf, {
      target: offset,
      duration: 1,
      ease: 'power3.inOut'
    })
  }

  resize = () => {
    const state = this.state
    state.resize = true
    this.setElemCache()
    this.setArrowCache()
    this.updateMenuCache()
    state.resize = false
  }

  removeEvents() {
    const { elems, arrows } = this.ui
    elems.length && Events.off('click', elems, this.anchorScroll)
    arrows.length && Events.off('click', arrows, this.arrowScroll)
    Events.off('resize:on-reset', this.resize)
  }

  destroy() {
    this.removeEvents()
    this.cache = null
    this.ui = null
  }
}