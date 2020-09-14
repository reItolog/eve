import { Events } from '@/events'
import store from '@/store'

const { dom, flags } = store

export default new class {
  constructor() {
    this.inst = new IntersectionObserver(this.handle, {
      root: flags.isDesktop ? null : dom.scroll
    })
    Events.on('on-leave-completed', this.destroy)
    this.cache = []
  }

  handle = (entries) => {
    entries.forEach((e) => {
      const c = this.cache.find(({ el }) => e.target === el)
      if (!c) return

      if (e.isIntersecting) {
        c.enter && c.enter(c, e.target)
        c.intersecting = true
      } else {
        c.leave && c.leave(c, e.target)
        c.intersecting = false
      }
    })
  }

  destroy = () => {
    this.cache.forEach((c, i) => {
      this.inst.unobserve(c.el)
      c.ani && c.ani.destroy()
      this.cache.splice(0, i)
    })
  }
}