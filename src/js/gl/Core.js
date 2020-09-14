import { WebGLRenderer, PerspectiveCamera, Scene } from '@/lib/three'

import gsap from 'gsap'

import store from '@/store'
import { Events } from '@/events'
import Pool from './Pool'

const { bounds } = store

export default new (class {
  constructor() {
    this.scene = new Scene()
    this.camera = null
    this.renderer = null

    this.state = {
      current: 0,
      x: 0,
    }
  }

  run = ({ current, diff }) => {
    const state = this.state
    const planes = [...Pool.group.children, ...Pool.slides.children]

    state.current = current
    state.x += 0.5

    planes &&
      planes.forEach((p) => {
        if (!p.material) return
        if (p.st) {
          p.onRaf(state.current, diff, this.visible(p.bounds, current))
        } else {
          p.onRaf(state.current)
        }
      })

    Pool.toggleSlides(state.current)
    this.renderer.render(this.scene, this.camera)
  }

  init(el) {
    if (!this.initial) {
      this.initial = true

      const { ww, wh } = bounds

      this.camera = new PerspectiveCamera(45, ww / wh, 0.1, 100)
      this.camera.position.z = 50
  
      this.renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
      })
      
      this.renderer.setPixelRatio(1)
      this.renderer.setSize(ww, wh)
      this.renderer.setClearColor(0xffffff, 0)
      this.renderer.domElement.classList.add('gl')

      this.scene.add(Pool.group)
      this.scene.add(Pool.slides)
    }

    this.el = el
    this.el.appendChild(this.renderer.domElement)
    this.addEvents()
  }

  addEvents() {
    Events.on('tick', this.run)
    Events.on('resize:on-reset', this.resize)
  }

  visible({ start, end }, current = this.state.current) {
    return current > start && current < end
  }

  resize = () => {
    const { ww, wh } = bounds
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(ww, wh)
    Pool.resize()
  }

  removeEvents() {
    Events.off('tick', this.run)
    Events.off('resize:on-reset', this.resize)    
  }

  destroy() {
    this.removeEvents()
    this.renderer.domElement.remove()
    Pool.removePlanes()
  }
})()
