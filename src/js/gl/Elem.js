import { Object3D } from '@/lib/three'
import gsap from 'gsap'

import store from '@/store'
import Core from './Core'
import { qs, rect } from '@/utils'

const { dom, bounds } = store

export default class extends Object3D {

  init(args = {}) {
    this.args = args
    this.el = this.args.el
    this.name = this.args.name

    this.progress = {
      x: 0,
      y: 0,
    }

    this.static = false
    this.out = true

    this.setBounds()
  }

  update(parent = dom.body) {
    this.removed = false
    this.el = qs(`[data-gl-id="${this.name}"]`, parent)
    this.resize()
  }

  setBounds() {
    const { ww, wh, hero } = bounds
    const { left, top, bottom, width, height } = rect(this.el)

    this.bounds = {
      left, width, height, top,
      start: top - wh - 100,
      end: bottom + 100,
      min: left < ww ? -ww : 0,
      max: left > ww ? hero.w + ww : hero.w
    }

    this.updateSize()
    this.updateY()
    this.updateX()
  }

  resize() {
    !this.removed && this.setBounds()
  }

  calculateUnitSize(distance = this.position.z) {
    const vFov = (Core.camera.fov * Math.PI) / 180
    const height = 2 * Math.tan(vFov / 2) * distance
    const width = height * Core.camera.aspect

    return { width, height }
  }

  updateSize() {
    this.camUnit = this.calculateUnitSize(
      Core.camera.position.z - this.position.z,
    )

    const { ww, wh } = bounds
    const { width, height } = this.bounds
    const x = width / ww
    const y = height / wh

    if (!x || !y) return

    this.scale.x = this.camUnit.width * x
    this.scale.y = this.camUnit.height * y
  }

  updateY(y = 0) {
    const { wh } = bounds
    const { top } = this.bounds
    const { height } = this.camUnit

    this.position.y = height / 2 - this.scale.y / 2
    this.position.y -= ((top - y) / wh) * height
  }

  updateX(x = 0) {
    const { ww } = bounds
    const { left, min, max } = this.bounds
    const { width } = this.camUnit

    this.position.x = -(width / 2) + this.scale.x / 2

    if (this.slide) {
      const pos = x + Core.state.x
      const translate = gsap.utils.wrap(min, max, pos)

      this.position.x += ((left - translate) / ww) * width
    } else {
      this.position.x += ((left + x) / ww) * width
    }
  }

  onRaf(y = 0) {
    !this.static 
      && (this.slide ? this.updateX(y) : this.updateY(y))
  }

  destroy() {
    this.parent && this.parent.remove(this)
    this.removed = true
    this.visible = this.static = false
  }
}