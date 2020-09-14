import gsap from 'gsap'
import store from '@/store'
import SplitText from '@/lib/SplitText'
import { qsa } from '@/utils'

export default new (class {
  constructor() {
    this.el = store.dom.body
    this.cache = null
    this.observer = new IntersectionObserver(this.handle, {
      root: null,
      rootMargin: '0px 0px 10% 0px',
      threshold: [0, 0],
    })
  }

  update(to) {
    this.getElems(to)
    this.observe()
  }

  getElems(to) {
    this.cache = null
    this.cache = []
    const elems = qsa('[data-scroll]', to)
    if (!elems) return
    elems.forEach((el) => {
      if (el.getBoundingClientRect().top < store.bounds.wh) return
      this.cache.push({
        el,
        intersecting: false,
        tl: this.getTimelines(el, el.dataset.scroll),
      })
    })
  }

  getTimelines(el, ani) {
    const tl = gsap.timeline({
      paused: true,
      immediateRender: true,
    })

    if (ani === 'words') {
      const split = new SplitText(el, {
        type: 'lines, words',
      })
      tl.set(split.lines, {
        overflow: 'hidden',
      }).from(
        split.words,
        {
          yPercent: 100,
          duration: 1.75,
          stagger: 0.1,
          ease: 'expo',
        },
        0,
      )
    }

    tl.progress(1).progress(0)

    return tl
  }

  handle = (entries) => {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]
      if (e.isIntersecting) {
        const c = this.cache.find((o) => o.el === e.target)
        c.intersecting = true
        c.tl.play()
        this.observer.unobserve(e.target)
      }
    }
  }

  observe() {
    this.cache.forEach((c) => this.observer.observe(c.el))
  }

  clean() {
    this.cache.forEach((c) => this.observer.unobserve(c.el))
  }

  destroy() {
    this.observer.disconnect()
    this.observer = null
    this.cache = null
  }
})()
