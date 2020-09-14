import gsap from 'gsap'
import lottie from 'lottie-web'

import store from '@/store'
import { Events } from '@/events'
import { qs, qsa } from '@/utils'

const { flags } = store

export default class {
  ui = {}

  constructor() {
    this.ui.elems = [...qsa('[data-v-src]')]
    this.ui.vm = qs('.js-vm')
    this.ui.vid = qs('.js-vm-vid')

    this.tl = gsap.timeline({ paused: true })

    this.state = {
      open: false
    }

    this.init()
  }

  init() {
    this.setCache()
    this.addEvents()
  }

  addEvents() {
    Events.on('click', '.js-vm-close', this.close)
    Events.on('mouseup', this.click)
    flags.hover && Events.on('mouseenter', this.ui.elems, this.enter)
  }

  setCache() {
    this.cache = this.ui.elems.map(el => {
      const a = lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `/static/lottie/play/data.json`,
      })
      a.setSubframe(false)
      return {
        a
      }
    })
  }

  click = ({ target, click }) => {
    if (!click) return
    const el = target.closest('[data-v-src]')
    el && this.open(el.dataset.vSrc)
  }

  enter = ({ currentTarget }) => {
    const { a } = this.cache[this.ui.elems.indexOf(currentTarget)]
    a.goToAndPlay(1)
  }

  open(src) {
    const state = this.state
    if (state.open) return
    state.open = true
    const { vm, vid } = this.ui

    src !== vid.src && (vid.src = src)
    vid.play()

    this.tl.clear()
      .to(vm, {
        autoAlpha: 1,
        duration: 0.35,
        ease: 'power1'
      })
      .add(() => {
        flags.locked = true
      })
      .play()

    vm.classList.add('is-open')
  }

  close = () => {
    this.state.open = false
    const { vm, vid } = this.ui

    this.tl.clear()
      .to(vm, {
        autoAlpha: 0,
        duration: 0.35,
        ease: 'power1'
      })
      .add(() => vid.pause())
      .play()   
      
    flags.locked = false

    vm.classList.remove('is-open')
  }
}