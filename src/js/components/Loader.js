import gsap from 'gsap'
import lottie from 'lottie-web'

import store from '@/store'
import { qs, rect } from '@/utils'
import { Events } from '@/events'
import DrawSVGPlugin from '@/lib/DrawSVGPlugin'

gsap.registerPlugin(DrawSVGPlugin)

const { flags } = store

export default class {

  constructor() {
    this.el = qs('.js-mask')
    this.ui = {
      bg: qs('.js-mask-bg'),
      circle: qs('.js-mask-circle'),
      outline: qs('.js-mask-outline'),
      clock: qs('.js-mask-clock')
    }
    this.home = qs('.js-h-circle')
    this.init()
  }

  init() {
    this.createClock()
    this.prepare()
    this.addEvents()
  }

  addEvents() {
    Events.on('loaded', this.run)
  }

  createClock() {
    const { clock } = this.ui
    this.clock = lottie.loadAnimation({
      container: clock,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path: `/static/lottie/preloader/data.json`,
    })
    this.clock.setSubframe(false)
    this.clock.setSpeed(1.25)
  }

  prepare() {
    let bottom
    this.home && (bottom = rect(this.home).bottom)
    
    const { circle, bg, outline } = this.ui

    this.tl = gsap.timeline({ 
      paused: true,
      immediateRender: true,
      onStart: () => {
        this.clock.play()
      },
      onComplete: () => {
        this.destroy()
        this.el.innerHTML = ''
        store.flags.locked = false
      }
    })
    .addLabel('start')

    if (this.home) {
      this.tl.set([outline, '.js-h-progress'], {
        alpha: gsap.utils.wrap([1, 0])
      })
    } else {
      this.tl.set(outline, {
        alpha: 1
      })      
    }

    this.tl.from(outline, {
      drawSVG: 0,
      duration: 1.75,
      ease: 'power2.inOut',
    })
    .addLabel('loaded')

    if (this.home) {
      this.tl.to(circle, {
        y: bottom - rect(circle).bottom,
        scale: 0.75,
        duration: 2,
        ease: 'power2.inOut'
      })
      .to(bg, {
        alpha: 0,
        duration: 0.95,
        ease: 'power1.inOut'
      }, "-=0.95")
      .to([circle, '.js-h-progress'], {
        alpha: gsap.utils.wrap([0, 1]),
        duration: 0.15,
        ease: 'linear'
      })
    } else {
      this.tl.to(this.el, {
        alpha: 0,
        duration: 0.85,
        ease: 'power1.inOut'
      })
    }

    this.tl.addLabel('end')

    setTimeout(() => {
      this.tl.tweenTo('loaded')
    }, 1000)
  }

  run = () => {
    const { isDevice, loaded } = flags

    if (!this.home || isDevice || loaded) {
      this.go()
    } else {
      Events.on('gl:loaded', this.go)
    }
  }

  go = () => {
    this.tl.pause()
    this.tl.tweenTo('end')
    this.clock.loop = false    
  }

  removeEvents() {
    Events.off('loaded', this.run)
  }

  destroy() {
    this.removeEvents()
    this.clock.destroy()
    this.tl.kill()
    this.ui = null
  }
}