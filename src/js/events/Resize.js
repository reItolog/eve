import debounce from 'lodash.debounce'

import store from '@/store'
import Events from './Events'

const { dom, bounds, flags } = store
const { isDevice } = flags

export default new (class {
  constructor() {
    this.setOrientation(dom, bounds)
    this.setVh()

    Events.on('resize', window, debounce(this.resize, 200))
    Events.on('orientationchange', window, this.resize)
  }

  resize = () => {
    const ww = window.innerWidth
    if (isDevice && ww === bounds.ww) return
    bounds.ww = ww
    bounds.wh = window.innerHeight

    this.setOrientation(dom, bounds)
    this.setVh()
    
    Events.emit('resize')
    isDevice && Events.emit('resize:on-reset')
  }

  setOrientation({ body }, { wh, ww }) {
    ww < wh
      ? body.classList.add('is-portrait')
      : body.classList.remove('is-portrait')
  }

  setVh() {
    dom.body.style.setProperty('--vh', `${bounds.wh * 0.01}px`);
  }
})()
