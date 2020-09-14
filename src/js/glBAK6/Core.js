import { Renderer, Camera, Transform } from '@/lib/ogl'

import store from '@/store'
import { Events } from '@/events'
import Pool from './Pool'

const { bounds } = store

export default new (class {
  
  constructor() {
    const { ww, wh } = bounds

    this.renderer = new Renderer({
      dpr: 1,
      alpha: true,
      antialias: true,
      stencil: true,
      webgl: 1
    })
    this.renderer.setSize(ww, wh)
    
    this.gl = this.renderer.gl
    this.gl.clearColor(1, 1, 1, 0);
    this.gl.canvas.classList.add('gl')

    this.gl.blendFuncSeparate(
      this.gl.ONE, 
      this.gl.ONE_MINUS_SRC_ALPHA, 
      this.gl.ONE, 
      this.gl.ONE_MINUS_SRC_ALPHA
    )

    this.camera = new Camera(this.gl, { 
      fov: 45, 
      aspect: ww / wh, 
      near: 0.1, 
      far: 100 
    })
    this.camera.position.z = 50

    this.scene = new Transform()

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
        if (!p.program) return
        if (p.st) {
          p.onRaf(state.current, diff, this.visible(p.bounds, current))
        } else {
          p.onRaf(state.current)
        }
      })

    Pool.toggleSlides(state.current)
    this.renderer.render({ scene: this.scene, camera: this.camera })
  }

  init(el) {
    if (!this.initial) {
      this.scene.addChild(Pool.group)
      this.scene.addChild(Pool.slides)
    }

    this.el = el
    this.el.appendChild(this.gl.canvas)
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
    this.camera.updateMatrixWorld()
    this.renderer.setSize(ww, wh)
    Pool.resize()
  }

  removeEvents() {
    Events.off('tick', this.run)
    Events.off('resize:on-reset', this.resize)    
  }

  destroy() {
    this.removeEvents()
    this.gl.canvas.remove()
    Pool.removePlanes()
  }
})()
