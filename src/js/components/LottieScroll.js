import lottie from 'lottie-web'

import store from '@/store'
import { qs, qsa } from '@/utils'
import { O } from '@/events'

const { isDesktop } = store.flags

export default class {
  constructor() {
    this.elems = isDesktop ? [...qsa('.js-bm'), ...qsa('.js-bm-d')] : [...qsa('.js-bm'), ...qsa('.js-bm-m')]
    this.slides = qs('.js-hiw-slides')
    this.last = null
    this.init()
  }

  init() {
    this.elems.forEach(el => this.set(el))
  }

  set(el) {
    const ani = lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path: `/static/lottie/${el.dataset.name}/data.json`,
    })
    ani.setSubframe(false)

    const enter = (c) => {
      isDesktop && (c.el.style.visibility = 'visible')
      c.ani.play()
    }
    const leave = (c) => {
      c.ani.stop()
      isDesktop && (c.el.style.visibility = 'hidden')
    }

    O.cache.push({
      el, ani,
      enter, leave,
      intersecting: false
    })
    O.inst.observe(el)
  }
}
