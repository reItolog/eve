import store from '@/store'
import { Events } from '@/events'
import { qsa, rect } from '@/utils'

const { flags } = store

export default class {
  constructor(elems = qsa('[data-smooth-item]')) {
    this.elems = elems
    this.current = 0
    this.last = null
    this.resizing = false
    this.sections = null
    this.init()
  }

  init() {
    this.getSections()
    this.addEvents()
  }

  addEvents() {
    Events.on('tick', this.run)
    Events.on('resize', this.resize)
  }

  update(elems) {
    this.elems = elems
    this.getSections()
  }

  getSections() {
    if (!this.elems) return
    const { bounds } = store
    const last = this.elems.length - 1

    this.sections = [...this.elems].map((el, i) => {
      el.style.transform = 'translate3d(0, 0, 0)'
      const { top, bottom } = rect(el)

      i === last && (bounds.scroll = bottom - bounds.wh)

      return {
        el,
        start: top - bounds.wh,
        end: bottom,
        out: true,
      }
    })
  }

  run = ({ current }) => {
    this.current = current
    !this.resizing && this.transformSections()
  }

  transformSections() {
    if (flags.locked) return
    this.sections.length > 0 &&
      this.sections.forEach((s) => {
        const visible = this.visible(s)

        if (visible || this.resizing) {
          s.out && (s.out = false)
          this.transform(s.el)
        } else if (!s.out) {
          s.out = true
          this.transform(s.el)
        }
      })
  }

  transform(el) {
    el.style.transform = `translate3d(0, ${-this.current}px, 0)`
  }

  visible({ start, end }) {
    return this.current > start && this.current < end
  }

  resize = () => {
    this.resizing = true
    this.getSections()
    Events.emit('resize:on-reset')
    this.transformSections()
    this.resizing = false
  }

  removeEvents() {
    Events.off('tick', this.run)
    Events.off('resize', this.resize)
  }

  destroy() {
    this.removeEvents()
    this.sections = this.elems = null
    Events.emit('scroll:on-reset')
  }
}
