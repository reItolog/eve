import { qsa } from '@/utils'
import { O } from '@/events'

import store from '@/store'

const { isDevice } = store.flags

export default class {
  constructor(elems = qsa('[data-lazy-src]')) {
    this.elems = elems
    isDevice && (this.elems = [...this.elems, ...qsa('[data-lazy-src-m]')])
    this.elems.forEach(el => this.set(el))
    this.load()
  }

  load() {
    const elems = qsa('[data-lazy-load]')
    elems && elems.forEach(el => (el.src = el.dataset.lazyLoad))
  }

  set() {
    this.elems.forEach(el => {
      const enter = ({ e = el }, target) => {
        const isMedia = el.nodeName === 'IMG'
        const url = e.dataset.lazySrc || e.dataset.lazySrcM
        const img = new Image()

        img.src = url
        img.decode().then(() => {
          !isMedia ? e.appendChild(img) : (e.src = url)
          e.classList.add('is-animated')
        })   
        O.inst.unobserve(target)    
      }
      O.cache.push({ el, enter })
      O.inst.observe(el)
    })
  }
}