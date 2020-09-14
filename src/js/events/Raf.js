import gsap from 'gsap'
import store from '@/store'
import Events from './Events'
import { lerp } from '@/utils'
import Pool from '@/gl/Pool'

const { dom, flags } = store
const { isDevice, isDesktop } = flags

export default new (class {
  constructor() {
    this.target = 0
    this.current = 0
    this.rounded = 0
    this.velo = {
      current: 0,
      diff: 0,
      ease: 0.075,
    }
    this.ease = 0.115
    this.init()
  }

  tick = () => {
    if (isDevice) { // Mobile devices
      this.target = dom.scroll.scrollTop
      Events.emit('tick', {
        target: this.target,
        current: this.target,
        diff: 0
      })
    } else { // Desktop devices
      this.last = this.current
      this.current = lerp(this.current, this.target, this.ease)
      this.rounded = Math.round(this.current * 100) / 100
      this.diff = (this.target - this.current) * 0.0005

      if (!Pool.sv) {
        this.velo.current = lerp(this.velo.current, this.rounded, this.velo.ease)
        this.velo.diff = gsap.utils.clamp(
          0, 0.75, (this.rounded - this.velo.current) * 0.0005,
        )
      }

      Events.emit('tick', {
        target: this.target,
        current: this.rounded,
        diff: this.diff,
        still: Math.abs(this.current - this.last) <= 0.001
      })
    }
  }

  clamp() {
    this.target = gsap.utils.clamp(0, store.bounds.scroll, this.target)
  }

  onScroll = ({ y }) => {
    if (flags.locked) return
    this.target += y
    this.clamp()
  }

  reset = () => {
    this.target = this.current = this.rounded = 0
  }

  resize = () => {
    this.clamp()
    this.rounded = this.current = this.target
  }

  init() {
    gsap.ticker.fps(-1)
    gsap.ticker.add(this.tick)
    
    if (isDesktop) {
      Events.on('scroll', this.onScroll)
      Events.on('resize:on-reset', this.resize)
      Events.on('scroll:on-reset', this.reset)
    }
  }
})()
