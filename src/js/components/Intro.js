import gsap from 'gsap'
import lottie from 'lottie-web'

import DrawSVGPlugin from '@/lib/DrawSVGPlugin'
import store from '@/store'
import { Events, GlobalRaf } from '@/events'
import { qs, qsa, rect } from '@/utils'
import Pool from '@/gl/Pool'

gsap.registerPlugin(DrawSVGPlugin)

const { bounds, flags } = store
const { isDevice } = flags

export default class {
  ui = {}

  constructor() {
    this.ui.texts = [...qsa('.js-h-txt')]
    this.ui.intro = qs('.js-intro')
    this.ui.introContent = qs('.js-intro-content')
    this.state = {
      progress: {
        a: 0,
        b: 0
      },
      resizing: false
    }
    this.tl = {
      a: null,
      b: null
    }
    this.init()
  }

  init() {
    this.cacheTexts()
    this.setBounds()
    this.setLottie()
    this.setTlA()
    this.setTlB()
    this.addEvents()
  }

  addEvents = () => {
    Events.on('tick', this.run)
    Events.on('resize:on-reset', this.resize)
  }

  setBounds() {
    const { intro, introContent } = this.ui
    const offset = isDevice ? GlobalRaf.target : 0
    const top = rect(introContent).top + offset
    const start = rect(intro).top + offset
    const end = (top - (bounds.wh * 0.5)) - start
    const max = top

    this.bounds = {
      start, end, max
    }
  }

  cacheTexts() {
    this.texts = this.ui.texts.map((el, i) => {
      const lines = qsa('.js-h-txt__l', el)
      const tl = gsap.timeline({ paused: true })
      const p1 = i * 0.25
      const p2 = (i + 1) * 0.25
      const uline = [qs('.js-h-uline', el), qs('.js-h-uline span', el)]

      i !== 0 && gsap.set(lines, { yPercent: 100 })

      if (i === 1) {
        return {
          i, el, lines, uline, tl, p1, p2,
          p1T: false,
          p2T: false
        }
      } else if (i === 2) {
        return {
          i, el, lines, uline, tl, p1,
          p1T: false
        }   
      } else {
        return {
          i, el, lines, uline, tl, p2,
          p2T: false
        }        
      }
    })
  }

  setLottie() {
    this.icon = lottie.loadAnimation({
      container: qs('.js-h-progress'),
      loop: false,
      autoplay: false,
      path: `/static/lottie/progress/data.json`,
    })
  }

  setTlA() {
    const o = {
      progress: 0
    }
    
    this.tl.a && this.tl.a.kill()
    this.tl.a = gsap.timeline({ 
      paused: true,
      defaults: {
        ease: 'linear'
      }
    })
    .fromTo('.js-h-circle path', {
      drawSVG: 0
    }, {
      drawSVG: `100%`,
      duration: 0.8,
      ease: 'power1.inOut'
    }, 0)
    .to(o, {
      progress: 1,
      duration: 1,
      onUpdate: () => {
        this.icon.goToAndStop(o.progress * this.icon.getDuration(false) * 1000, false)
      }
    }, 0)
  }

  setTlB() {
    const o = {
      progress: 1
    }

    !this.state.resizing && 
      (this.planes = Pool.slides.children.filter(p => p.name.includes('slide')))

    this.tl.b && this.tl.b.kill()
    this.tl.b = gsap.timeline({ 
      paused: true,
      defaults: {
        ease: 'linear'
      }
    })
    .fromTo('.js-intro__bg', {
      alpha: 0
    }, {
      alpha: 1,
      duration: 0.25,
      ease: 'linear'
    }, 0)
    .fromTo(['.js-h-logo, .js-h-play-icon'], {
      alpha: 1
    }, {
      alpha: 0,
      duration: 0.25,
      ease: 'linear'        
    }, 0)
    .to(o, {
      progress: 0,
      duration: 1,
      onUpdate: () => {
        this.togglePlanes(o.progress)
      }
    }, 0)
    .fromTo('.js-h-txt--last', {
      alpha: 1
    }, {
      alpha: 0,
      duration: 0.9,
    }, 0)
  }

  run = ({ current }) => {
    (!this.state.resizing || (current > this.bounds.max)) && this.animate(current)
  }

  animate(current = GlobalRaf.target) {
    const { progress } = this.state
    const { start, end } = this.bounds

    progress.a = gsap.utils.clamp(0, 1, current / start)
    progress.b = gsap.utils.clamp(0, 1, (current - start) / end)

    this.texts.forEach(t => this.toggleTexts(t, progress.a))

    this.tl.a.progress(progress.a)
    this.tl.b.progress(progress.b)    
  }

  togglePlanes(progress) {
    this.planes.forEach(p => (p.material.uniforms.uAlpha.value = progress))
  }

  toggleTexts(t, p) {
    t.p1 && this.toggleP1(t, p)
    this.toggleP2(t, p)
  }

  toggleP1(t, p) {
    if (p > t.p1 && !t.p1T) {
      t.p1T = true
      t.tl.clear()
        .set(t.uline, { alpha: 1 })
        .fromTo(t.lines, {
          yPercent: 100
        }, {
          yPercent: 0,
          duration: 1.1,
          stagger: 0.075,
          ease: 'expo'
        }, 0.35)
        .fromTo(t.uline, {
          xPercent: gsap.utils.wrap([-100, 100])
        }, {
          xPercent: 0,
          duration: 1,
          ease: 'expo.inOut'
        }, 0.45)        
        .play()
    } else if (p <= t.p1 && t.p1T) {
      t.p1T = false
      t.tl.clear()
        .to(t.lines, {
          yPercent: -100,
          duration: 0.5,
          stagger: 0.075,
          ease: 'power2.inOut'
        })    
        .to(t.uline, {
          xPercent: gsap.utils.wrap([100, -100]),
          duration: 0.5,
          ease: 'expo.inOut'
        }, 0)        
        .play()
    }
  }

  toggleP2(t, p) {
    if (p > t.p2 && !t.p2T) {
      t.p2T = true
      t.tl.clear()
        .to(t.lines, {
          yPercent: -100,
          duration: 0.5,
          stagger: 0.075,
          ease: 'power2.inOut'
        })
        .to(t.uline, {
          xPercent: gsap.utils.wrap([100, -100]),
          duration: 0.5,
          ease: 'expo.inOut'
        }, 0)        
        .play()
    } else if (p <= t.p2 && t.p2T) {
      t.p2T = false
      t.tl.clear()
        .set(t.uline, { alpha: 1 })
        .fromTo(t.lines, {
          yPercent: 100
        }, {
          yPercent: 0,
          duration: 1.1,
          stagger: 0.075,
          ease: 'expo'
        }, 0.35)
        .fromTo(t.uline, {
          xPercent: gsap.utils.wrap([-100, 100])
        }, {
          xPercent: 0,
          duration: 1,
          ease: 'expo.inOut'
        }, 0.45)
        .play()
    }
  }

  resize = () => {
    const state = this.state
    state.resizing = true
    this.setBounds()
    this.setTlA()
    this.setTlB()
    this.animate()
    state.resizing = false
  }

  removeEvents = () => {
    Events.off('tick', this.run)
    Events.off('resize:on-reset', this.resize)
  }

  destroy() {
    this.removeEvents()
    this.planes = null
    this.tl.a.kill()
    this.tl.b.kill()
    this.state = null
    this.texts = null
  }
}