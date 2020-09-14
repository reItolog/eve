import { Renderer, Program, Texture, Triangle, Mesh } from '@/lib/ogl'
import gsap from 'gsap'

import store from '@/store'
import { Events } from '@/events'
import vertex from '@/gl/shaders/transition/vert.vert'
import fragment from '@/gl/shaders/transition/frag.frag'

const { bounds, dom } = store

export default class {

  constructor() {
    const { ww, wh } = bounds

    this.renderer = new Renderer({ 
      dpr: 1,
      alpha: true,
      webgl: 1
    })
    this.renderer.setSize(ww, wh)

    this.gl = this.renderer.gl
    this.gl.clearColor(1, 1, 1, 0)
    this.gl.canvas.classList.add('t')
    dom.body.appendChild(this.gl.canvas)
    
    this.texture = new Texture(this.gl, { 
      generateMipmaps: false,
      minFilter: this.gl.LINEAR,
      magFilter: this.gl.LINEAR,
      format: this.gl.RGB
    })

    const img = new Image()
    img.src = '/static/bg-gradient.png'
    img.decode().then(() => this.texture.image = img)

    this.program = new Program(this.gl, {
      vertex,
      fragment,
      uniforms: {
        uProgress: { value: 0 },
        uTexture: { value: this.texture },
        uOut: { value: true }
      },
    })

    this.geometry = new Triangle(this.gl)
    this.mesh = new Mesh(this.gl, { 
      geometry: this.geometry, 
      program: this.program 
    })

    this.tl = gsap.timeline({ paused: true })

    Events.on('transition:out', this.out)
    Events.on('transition:in', this.in)
    Events.on('resize:on-reset', this.resize)
  }

  render = () => {
    this.renderer.render({ scene: this.mesh })
  }

  out = ({ done, from }) => {
    const { uProgress } = this.program.uniforms

    this.tl.clear()
    .to(uProgress, {
      value: 1,
      duration: 1,
      ease: 'power2.inOut',
      onUpdate: () => this.render()
    }, 0)
    .add(() => {
      from.remove()
      done()
    })
    .play()
  }

  in = ({ done }) => {
    const { 
      uProgress, 
      uOut 
    } = this.program.uniforms

    this.tl.clear()
    .set(uOut, { value: false })
    .to(uProgress, {
      value: 0,
      duration: 0.85,
      ease: 'power3.inOut',
      onUpdate: () => this.render()
    }, 0)
    .set(uOut, { value: true })
    .add(() => done())
    .play()
  }

  resize = () => {
    const { 
      ww, 
      wh 
    } = bounds
    
    this.renderer.setSize(ww, wh)
  }
}