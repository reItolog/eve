import {
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  LinearFilter,
  Texture,
  RGBFormat,
} from '@/lib/three'

import { Elem, Pool } from '@/gl'
import vertexShader from '@/gl/shaders/video/vert.vert'
import fragmentShader from '@/gl/shaders/video/frag.frag'

const geometry = new PlaneBufferGeometry(1, 1, 15, 1)
const material = new ShaderMaterial({
  vertexShader, fragmentShader
})

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

    this.st = true
    this.animated = false
    this.initial = true

    this.material.uniforms = {
      uTime: { value: 0 },
      uTexture: { value: this.texture },
      uVelo: { value: 0 },
      uProgress: { value: 0 },
      uAlpha: { value: 1 },
      uOffset: { value: this.camUnit.width },
    }

    this.vid = document.createElement('video')
    this.vid.src = location.origin + this.el.dataset.src
    this.vid.muted = true
    this.vid.loop = true
    this.vid.currentTime = 1
    this.vid.lastFrame = false
    this.vid.preload = true

    this.mesh = new Mesh(this.geometry, this.material)
    this.mesh.renderOrder = 10
    this.add(this.mesh)

    Pool.group.add(this)
    Pool.planes[this.name] = this
  }

  onRaf(y = 0, diff = 0, visible = false) {
    if (this.static || !this.material) return

    this.updateY(y)
    this.material.uniforms.uVelo.value = diff

    this.updateVid()
    visible ? this.vid.play() : this.vid.pause()
  }

  updateVid() {
		if (this.vid.readyState >= this.vid.HAVE_ENOUGH_DATA) {
      if (!this.vid.lastFrame) {
        this.vid.lastFrame = true
        this.initial && (this.initial = false, this.texture.image = this.vid)
        this.texture.needsUpdate = true
      } else {
        this.vid.lastFrame = false
      }
		}
  }

  destroy() {
    super.destroy()
  }
}