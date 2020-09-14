import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'

import store from '@/store'
import { qsa } from '@/utils'
import { Events } from '@/events'

gsap.registerPlugin(ScrollToPlugin)

const { scroll } = store.dom

export default class {

  constructor(elems = qsa('[data-anchor]')) {
    this.elems = elems
    this.tl = gsap.timeline({ paused: true })

    Events.on('click', this.elems, this.animate)
  }

  animate = ({ currentTarget }) => {
    this.tl.clear()
    .to(scroll, {
      scrollTo: { 
        y: `${currentTarget.dataset.anchor}`, 
        offsetY: 200 
      },
      duration: 1.5,
      ease: 'power3.inOut'
    }).play()
  }

  destroy() {
    Events.off('click', this.elems, this.animate)
    this.tl.kill()
  }
}