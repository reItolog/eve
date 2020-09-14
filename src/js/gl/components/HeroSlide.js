import {
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  LinearFilter,
  Texture,
  RGBFormat,
} from '@/lib/three'

import store from '@/store'
import { Elem, Pool } from '@/gl'
import { GlobalRaf } from '@/events'
import { Events } from '@/events'
import vertexShader from '@/gl/shaders/slide/vert.vert'
import fragmentShader from '@/gl/shaders/slide/frag.frag'

const geometry = new PlaneBufferGeometry(1, 1, 15, 1)
const material = new ShaderMaterial({
  vertexShader, fragmentShader
})

const { bounds, flags } = store

export default class extends Elem {
  init(args) {
    super.init(args)

    this.geometry = geometry
    this.material = material.clone()

    this.texture = new Texture()
    this.texture.generateMipMaps = false
    this.texture.minFilter = LinearFilter
    this.texture.magFilter = LinearFilter
    this.texture.format = RGBFormat

    this.slide = true
    this.initial = true

    this.material.uniforms = {
      uTime: { value: 0 },
      uTexture: { value: this.texture },
      uVelo: { value: 0 },
      uStrength: { value: 0 },
      uProgress: { value: 0 },
      uAlpha: { value: 1 },
      uOffset: { value: 0 },
    }

    this.setUnis()

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
      img.decode().then(() => {
        this.texture.image = img
        this.texture.needsUpdate = true
      })
    }

    this.mesh = new Mesh(this.geometry, this.material)
    this.add(this.mesh)

    Pool.slides.add(this)
    Pool.planes[this.name] = this

    this.onAdd()
  }

  onAdd() {
    this.vid && this.vid.play()
    Events.on('intro:in', this.play)
    Events.on('intro:out', this.pause)
  }

  setUnis() {
    const { uStrength, uOffset } = this.material.uniforms
    uStrength.value = bounds.ww / 100
    uOffset.value = this.camUnit.width
  }

  updateX(y) {
    if (!this.visible || !this.material) return
    
    super.updateX(y)

    const { uVelo } = this.material.uniforms
    uVelo.value = GlobalRaf.velo.diff

    this.vid && this.updateVid()
  }

  updateVid() {
		if (this.vid.readyState >= this.vid.HAVE_CURRENT_DATA) {
      if (!this.vid.lastFrame) {
        this.vid.lastFrame = true

        if (this.initial) {
          this.initial = false
          this.texture.image = this.vid
          Pool.loaded.push(true)
          Pool.loaded.length === 10 && (flags.loaded = true, Events.emit('gl:loaded'))
        }

        this.texture.needsUpdate = true
      } else {
        this.vid.lastFrame = false
      }
		}
  }

  play = () => {
    this.visible = true
  }

  pause = () => {
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
    this.vid && this.vid.pause()
  }
}