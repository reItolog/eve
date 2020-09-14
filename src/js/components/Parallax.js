import gsap from 'gsap'

import { Events } from '@/events'
import { qs, qsa } from '@/utils'
import store from '@/store'

export default class {
  constructor(elems = qsa('[data-from]')) {
    this.elems = [...elems]

    this.current = 0
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
    !this.resizing && this.playTimelines()
  }

  playTimelines() {
    const { wh } = store.bounds
    this.cache.forEach((c) => {
      const visible = this.visible(c)

      if (visible || this.resizing) {
        const {
          rect: { top, height },
          tl,
        } = c

        const progress = gsap.utils.clamp(
          0,
          1,
          1 - (-this.current + top + height) / (height + wh),
        )
        tl.progress(progress)
      }
    })
  }

  getCache() {
    this.cache = this.elems.map((el) => {
      const from = JSON.parse(el.dataset.from)
      const to = JSON.parse(el.dataset.to)

      const tl = gsap
        .timeline({ paused: true })
        .fromTo(el, 1, from, { ...to, ...{ ease: 'linear' } })

      tl.progress(1)
      const rect = el.getBoundingClientRect()
      tl.progress(0)

      return {
        tl,
        rect,
        start: rect.top - store.bounds.wh,
        end: rect.bottom,
      }
    })
  }

  visible({ start, end }) {
    return this.current > start && this.current < end
  }

  resize = () => {
    this.resizing = true
    this.cache = null
    this.getCache()
    this.playTimelines()
    this.resizing = false
  }

  removeEvents() {
    Events.off('tick', this.run)
    Events.off('resize:on-reset', this.resize)
  }

  destroy() {
    this.removeEvents()
    this.cache = this.elems = null
  }
}
