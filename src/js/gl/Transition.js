import {
  WebGLRenderer,
  OrthographicCamera,
  BufferGeometry,
  BufferAttribute,
  Mesh,
  Scene,
  ShaderMaterial,
  Texture,
  LinearFilter,
  RGBFormat
} from '@/lib/three'

import gsap from 'gsap'

import store from '@/store'
import { Events } from '@/events'
import vert from '@/gl/shaders/transition/vert.vert'
import frag from '@/gl/shaders/transition/frag.frag'

const { bounds, dom } = store

export default class {
  constructor() {
    const { ww, wh } = bounds

    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
    })
    
    this.renderer.setPixelRatio(1)
    this.renderer.setSize(ww, wh)
    this.renderer.setClearColor(0xffffff, 0)
    this.scene = new Scene()

    this.camera = new OrthographicCamera(ww / - 2, ww / 2, wh / 2, wh / - 2, 1, 100)
    this.camera.lookAt(this.scene.position)
    this.camera.position.z = 1

    this.renderer.domElement.classList.add('t')
    dom.body.appendChild(this.renderer.domElement)

    this.geo = new BufferGeometry()

    const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0])
    const uvs = new Float32Array([0, 0, 2, 0, 0, 2])

    this.geo.setAttribute('uv', new BufferAttribute(uvs, 2))
    this.geo.setAttribute('position', new BufferAttribute(vertices, 3))

    this.texture = new Texture()
    this.texture.generateMipMaps = false
    this.texture.minFilter = LinearFilter
    this.texture.magFilter = LinearFilter
    this.texture.format = RGBFormat  

    const img = new Image()
    img.src = '/static/bg-gradient.png'
    img.decode().then(() => {
      this.texture.image = img
      this.texture.needsUpdate = true
    })

    this.mat = new ShaderMaterial({
      fragmentShader: frag,
      vertexShader: vert,
      uniforms: {
        uProgress: { value: 0 },
        uTexture: { value: this.texture },
        uOut: { value: true }
      },
    })

    this.triangle = new Mesh(this.geo, this.mat)
    this.triangle.scale.set(ww / 2, wh / 2, 1)
    this.triangle.frustumCulled = false
    this.scene.add(this.triangle)

    this.tl = gsap.timeline({ paused: true })

    Events.on('transition:out', this.out)
    Events.on('transition:in', this.in)
    Events.on('resize:on-reset', this.resize)
  }

  render = () => {
    this.renderer.render(this.scene, this.camera)
  }

  out = ({ done, from }) => {
    const { uProgress } = this.mat.uniforms

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
    } = this.mat.uniforms

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
    const { ww, wh } = bounds
    this.camera.left = ww / - 2
    this.camera.right =  ww / 2
    this.camera.top =  wh / 2
    this.camera.bottom = wh / - 2
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(ww, wh)       
    this.triangle.scale.set(ww / 2, wh / 2, 1)
  }
}