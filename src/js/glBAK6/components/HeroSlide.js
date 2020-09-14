import {
  Mesh,
  Plane,
  Program,
  Texture,
} from '@/lib/ogl'

import store from '@/store'

import { Core, Elem, Pool } from '@/gl'
import vertex from '@/gl/shaders/slide/vert.vert'
import fragment from '@/gl/shaders/slide/frag.frag'

import { GlobalRaf } from '@/events'
import { Events } from '@/events'

const { bounds, flags } = store
const { gl } = Core
const geometry = new Plane(gl, { widthSegments: 15 })

export default class extends Elem {
  init(args) {
    super.init(args)

    this.geometry = geometry

    this.texture = new Texture(gl, { 
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      format: gl.RGB
    })

    if (flags.isDesktop) {
      this.vid = document.createElement('video')
      this.vid.src = location.origin + this.el.dataset.vid
      this.vid.muted = true
      this.vid.loop = true
      this.vid.currentTime = 1
      this.vid.lastFrame = false
      this.vid.preload = true
      this.vid.play()
    } else {
      const img = new Image()
      img.src = this.el.dataset.img
      img.decode().then(() => this.texture.image = img)
    }

    this.program = new Program(gl, { 
      vertex, 
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.texture },
        uVelo: { value: 0 },
        uStrength: { value: 0 },
        uProgress: { value: 0 },
        uAlpha: { value: 1 },
        uOffset: { value: 0 },
      },
      transparent: true
    })

    this.slide = true
    this.initial = true

    this.setUnis()

    this.mesh = new Mesh(gl, { 
      geometry: this.geometry, 
      program: this.program,
      renderOrder: 3 
    })

    this.addChild(this.mesh)

    Pool.slides.addChild(this)
    Pool.planes[this.name] = this

    this.onAdd()
  }

  onAdd() {
    Events.on('intro:in', this.play)
    Events.on('intro:out', this.pause)
  }

  setUnis() {
    const { uStrength, uOffset } = this.program.uniforms
    uStrength.value = bounds.ww / 100
    uOffset.value = this.camUnit.width
  }

  updateX(y) {
    if (!this.visible) return
    super.updateX(y)
    if (this.program) {
      const { uVelo } = this.program.uniforms
      uVelo.value = GlobalRaf.velo.diff
      this.vid && this.updateVid()
    }
  }

  updateVid() {
		if (this.vid.readyState >= 4) {
      if (!this.vid.lastFrame) {
        this.vid.lastFrame = true
        this.initial && (this.initial = false, this.texture.image = this.vid)
        this.texture.needsUpdate = true
      } else {
        this.vid.lastFrame = false
      }
		}
  }

  play = () => {
    this.visible = true
    this.vid && this.vid.play()
  }

  pause = () => {
    this.vid && this.vid.pause()
    this.visible = false
  }

  resize() {
    super.resize()
    this.setUnis()
  }

  destroy() {
    super.destroy()
    Events.off('intro:in', this.play)
    Events.off('intro:out', this.pause)
  }
}