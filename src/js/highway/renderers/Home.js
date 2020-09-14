import Default from './Default'

import store from '@/store'

import { 
  Pricing, 
  Proof, 
  Stickies, 
  Intro,
  Hiw
} from '@/components'

import { qs, qsa, rect } from '@/utils'
import { Events } from '@/events'
import { Core, Pool } from '@/gl'

const { bounds, flags } = store
const { isDevice } = flags
const { hero } = bounds

export default class extends Default {
  initial() {
    super.initial()
    Events.on('resize', this.setHeroBounds)
  }

  onEnter() {
    super.onEnter()
    this.setHeroBounds()
    this.initGl()
    this.intro = new Intro()
  }

  onLeave() {
    super.onLeave()
    this.stickies && this.stickies.destroy()
    this.hiw && this.hiw.destroy()
    this.pricing && this.pricing.destroy()
    this.proof && this.proof.destroy()
  }

  onEnterCompleted() {
    super.onEnterCompleted()
    !isDevice && (
      this.stickies = new Stickies(),
      this.hiw = new Hiw()
    )
    this.pricing = new Pricing()
    this.proof = new Proof()
  }

  onLeaveCompleted() {
    super.onLeaveCompleted()
    this.intro && this.intro.destroy()
    Core.destroy()
  }

  initGl() {
    Core.init(this.el)
    Pool.addPlanes({ el: this.el })
  }

  setHeroBounds = () => {
    const { ww } = bounds
    const hSlides = qsa('.js-hero-slide', this.el)
    const h = qs('.js-hero', this.el)

    hSlides &&
      (hero.w = rect(hSlides[hSlides.length - 1]).right - ww)
    h && (hero.h = rect(h).height)
  }
}
