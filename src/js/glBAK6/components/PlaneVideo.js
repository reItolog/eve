import {
  Mesh,
  Plane,
  Program,
  Texture,
} from '@/lib/ogl'

import { Core, Elem, Pool } from '@/gl'
import vertex from '@/gl/shaders/video/vert.vert'
import fragment from '@/gl/shaders/video/frag.frag'

const { gl } = Core
const geometry = new Plane(gl, { widthSegments: 15 })

export default class extends Elem {
  init(args) {
    super.init(args)

    this.geometry = geometry

    this.vid = document.createElement('video')
    this.vid.src = location.origin + this.el.dataset.src
    this.vid.muted = true
    this.vid.loop = true
    this.vid.currentTime = 1
    this.vid.lastFrame = false
    this.vid.preload = true

    this.texture = new Texture(gl, { 
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      format: gl.RGB,
    })

    this.program = new Program(gl, { 
      vertex, 
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.texture },
        uVelo: { value: 0 },
        uProgress: { value: 0 },
        uAlpha: { value: 1 },
        uOffset: { value: this.camUnit.width },
      },
      cullFace: null,
    })

    this.st = true
    this.animated = false
    this.initial = true

    this.mesh = new Mesh(gl, { 
      geometry: this.geometry, 
      program: this.program,
      renderOrder: 10
    })

    this.addChild(this.mesh)

    Pool.group.addChild(this)
    Pool.planes[this.name] = this
  }

  onRaf(y = 0, diff = 0, visible = false) {
    if (this.static) return
    this.updateY(y)
    this.updateVid()
    this.program.uniforms.uVelo.value = diff
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