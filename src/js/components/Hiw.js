import gsap from 'gsap'
import lottie from 'lottie-web'

import store from '@/store'
import { Events } from '@/events'
import { qs, qsa, rect } from '@/utils'

const { bounds } = store

export default class {

  constructor() {
    this.container = qs('.js-hiw-slides')
    this.slides = [...qsa('.js-hiw-slide')]
    this.current = 0
    this.total = this.slides.length - 1
    this.z = this.total + 1
    this.i = {
      last: 0,
      curent: 0,
    }
    this.initial = false
    this.init()
  }

  init() {
    this.setCache()
    this.addEvents()
  }

  addEvents() {
    Events.on('tick', this.run)
    Events.on('resize:on-reset', this.resize)
  }

  run = ({ current, still }) => {
    if (still) return

    const i = this.i
    const visible = this.visible(current)

    if (visible) {
      !this.initial && this.setInitial()

      i.last = i.current
      i.current = Math.round(gsap.utils.clamp(0, 1, (current - this.min) / this.max) * this.total)
      i.last !== i.current && this.check()      
    } else if (!visible && !this.out && (i.current === this.total)) {
      this.out = true
      this.cache[this.total].ani.stop()
    }
  }

  check() {
    const last = this.cache[this.i.last]
    const { inner, ani } = this.cache[this.i.current]

    last && last.ani.stop()

    this.z += 1
    this.container.appendChild(inner)
    this.tl(inner, last), ani.play()
  }

  setInitial() {
    this.initial = true
    const { ani, inner } = this.cache[0]
    ani.play(), gsap.set(inner, { alpha: 1 })    
  }

  tl(el, last) {
    return gsap.timeline({
      onComplete: () => (last && last.inner.remove())
    })
    .set(el, { zIndex: this.z })
    .fromTo(el, { alpha: 0 }, {
      alpha: 1,
      duration: 0.25,
      ease: 'power1'
    })
  }

  visible(current = this.current) {
    return current > this.start && current < this.end
  }

  setCache() {
    this.cache = this.slides.map((el, i) => {
      const inner = qs('[data-name]', el)
      const ani = lottie.loadAnimation({
        container: inner,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: `/static/lottie/${inner.dataset.name}/data.json`,
      })
      ani.setSubframe(false)
      this.setBounds(i, el)

      inner.remove()
      this.container.appendChild(inner)
      gsap.set(inner, { alpha: 0 })

      return {
        inner, el, ani,
      }
    })
  }

  setBounds(i, el) {
    if (i === 0 || i === this.total) {
      const { wh } = bounds
      const diff = wh * 0.25
      const { top, bottom } = rect(el)
  
      i === 0 && (this.start = top - wh, this.min = top - diff)
      i === this.total && (this.end = bottom, this.max = top - diff - this.min)     
    }
  }

  resize = () => {
    this.cache.forEach((c, i) => this.setBounds(i, c.el))
  }

  removeEvents() {
    Events.off('tick', this.run)
    Events.off('resize:on-reset', this.resize)    
  }

  destroy() {
    this.removeEvents()
    this.cache.forEach(({ ani }) => ani.destroy())
    this.cache = this.i = null
  }
}