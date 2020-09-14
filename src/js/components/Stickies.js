import gsap from 'gsap'

import { qs, qsa, rect } from '@/utils'
import { Events } from '@/events'
import store from '@/store'

const { bounds } = store

export default class {
  constructor(elems = qsa('[data-stick]')) {
    this.elems = [...elems]
    this.cache = null
    this.resizing = false
    this.init()
  }

  init() {
    this.getCache()
    this.addEvents()
  }

  addEvents() {
    Events.on('tick', this.run)
    Events.on('resize:on-reset', this.resize)
  }

  run = ({ current }) => {
    this.current = current
    !this.resizing && this.transformElems(current)
  }

  transformElems(current = this.current) {
    this.cache &&
      this.cache.forEach((c) => {
        const { visible, progress } = this.visible(c, current)
        if (visible || this.resizing) {
          c.out && (c.out = false)
          this.transform(c, current, progress)
        } else if (!c.out) {
          c.out = true
          this.transform(c, current, progress)
        }
      })
  }

  transform(
    { els: { node }, bounds: { start, max, min }, tl },
    current,
    progress,
  ) {
    const translate = current - start
    const transform = gsap.utils.clamp(min, max, translate)
    tl && progress && tl.progress(progress)
    node.style.transform = `translate3d(0, ${transform}px, 0)`
  }

  visible({ duration: { start, end }, tl }, current) {
    const visible = current > start && current < end
    let progress
    if (tl && visible) {
      progress = gsap.utils.clamp(0, 1, (current - start) / (end - start))
    }
    return { visible, progress }
  }

  getCache() {
    const { wh } = bounds
    this.cache = this.elems.map((el) => this.base({ el }, wh))
    this.addTalentText()
    this.addHiw()
  }

  base(opts = {}, wh = bounds.wh) {
    const el = opts.el
    const els = {}

    els.node = opts.el
    els.node.style.transform = 'translate3d(0, 0, 0)'

    els.start =
      opts.start ||
      qs('[data-stick-start]', el) ||
      el.closest('[data-stick-start]')
    els.end =
      opts.end ||
      qs('[data-stick-end]', els.start) ||
      el.closest('[data-stick-end]')

    const rects = {
      node: rect(el),
      start: rect(els.start),
      end: rect(els.end),
    }

    const duration = {
      start: rects.start.top - wh,
      end: rects.end.bottom,
      height: rects.node.height,
      progress: 0,
    }

    const offset = (rects.node.top - rects.start.top) * 2
    const diff = wh - rects.node.height

    const bounds = {
      start: rects.start.top,
      max: rects.start.bottom - rects.start.top - wh - offset + diff,
      min: 0,
    }

    return {
      els,
      rects,
      duration,
      bounds,
      tl: null,
    }
  }

  addTalentText() {
    const b = this.base({
      el: qs('.js-stick-talent'),
      end: qs('.js-stick-talent-end'),
    })
    const { bounds, rects } = b
    const { wh } = store.bounds
    const diff = (wh - rects.node.height) * 0.5

    bounds.start = rects.start.top - diff
    bounds.max =
      rects.end.bottom - bounds.start - wh + (wh - rects.end.height) / 2

    b.tl = gsap
      .timeline({ paused: true, defaults: { ease: 'linear', duration: 1 } })
      .fromTo('.js-tal-r', { xPercent: 0, alpha: 0 }, { xPercent: -37.5, alpha: 1 })
    this.cache.push(b)
  }

  addHiw() {
    const b = this.base({
      el: qs('.js-stick-hiw'),
      end: qs('.js-stick-hiw-end'),
    })
    const { bounds, rects } = b
    const { wh } = store.bounds
    const diff = (wh - rects.node.height) * 0.5

    bounds.start = rects.start.top - diff
    this.cache.push(b)
  }

  resize = () => {
    this.resizing = true
    this.cache = null
    this.getCache()
    this.transformElems()
    this.resizing = false
  }

  removeEvents() {
    Events.off('tick', this.run)
    Events.off('resize:on-reset', this.resize)
  }

  destroy() {
    this.removeEvents()
    this.cache = null
  }
}
