import { Group } from '@/lib/three'
import gsap from 'gsap'

import * as Component from './components'
import store from '@/store'
import { qs, qsa } from '@/utils'
import { Events } from '@/events'

const { bounds, flags } = store

export default new (class {
  constructor() {
    this.planes = {}

    this.slides = new Group()
    this.group = new Group()

    this.hero = qs('.js-hero-inner')
    this.heroVids = qsa('.js-hero-vid')
    this.heroContent = qs('.js-hero-content')

    this.sv = false
    this.loaded = []
  }

  fromDom(el, parent) {
    const name = el.dataset.glId
    const component = el.dataset.glComponent
    const plane = this.planes[name]
    if (plane && !plane.keep) {
      this.add(plane, parent)
    } else if (!plane) {
      if (flags.isDevice && component === 'PlaneVideo') return
      new Component[component]().init({ el, name })
    }
  }

  addPlanes({ el }) {
    const elems = qsa('[data-gl-id]', el)
    elems && elems.forEach(elem => this.fromDom(elem, el))
  }

  add(p, parent) {
    if (p.visible) return

    p.name.includes('slide') ? this.slides.add(p) : this.group.add(p)
    p.visible = true
    p.material.uniforms.uAlpha.value = 1
    p.update(parent)
    p.onAdd && p.onAdd()
  }

  resize(el = null) {
    for (const name in this.planes) this.planes[name].resize(el)
  }

  setStatic() {
    ;[...this.group.children, ...this.slides.children].forEach(
      (p) => (p.static = true),
    )
  }

  removePlanes() {
    for (const name in this.planes) this.remove(this.planes[name])
  }

  remove(plane) {
    plane.destroy()
  }

  toggleSlides(current) {
    const { h } = bounds.hero
    if (current > h && !this.sv) {
      Events.emit('intro:out')
      gsap.set(this.heroContent, { autoAlpha: 0 })
      this.sv = true
    } else if (current <= h && this.sv) {
      this.sv = false
      gsap.set(this.heroContent, { autoAlpha: 1 })
      Events.emit('intro:in')
    }
  }
})()
