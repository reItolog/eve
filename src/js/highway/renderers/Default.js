import Highway from '@dogstudio/highway'

import store from '@/store'
import {qsa} from '@/utils'
import {Events} from '@/events'
import Transition from '@/gl/Transition'

import {
    SmoothScroll,
    Lazy,
    Vm,
    LottieScroll,
    Parallax,
    ScrollTo,
    ScrollToM,
    Loader,
    MailChimp,
    Stripe
} from '@/components'

const {flags, dom} = store
const {isDevice, isDesktop} = flags

export default class extends Highway.Renderer {
    initial() {
        new Loader()

        store.addClasses()
        this.onEnter()
        window.onload = () => this.loaded()
    }

    onEnter() {
        dom.scroll.scrollTop = 0
        this.el = this.wrap.lastElementChild
    }

    onLeave() {
        this.scrollTo && this.scrollTo.destroy()
        this.forms && this.forms.forEach(form => form.destroy())
    }

    onEnterCompleted() {
        this.handleVm()
        this.handleSmoothScroll()
        this.handleLazy()
        this.handleScrollTo()
        this.handleMC()

        this.lottieScroll = new LottieScroll()
        this.parallax = new Parallax()
    }

    onLeaveCompleted() {
        this.smoothScroll && this.smoothScroll.destroy()
        Events.emit('on-leave-completed')
    }

    handleSmoothScroll() {
        if (isDevice) return

        const elems = qsa('[data-smooth-item]')
        elems.length > 0 && (this.smoothScroll = new SmoothScroll(elems))
    }

    handleScrollTo() {
        if (isDesktop) {
            this.scrollTo = new ScrollTo()
        } else {
            const elems = qsa('[data-anchor]')
            elems.length && (this.scrollTo = new ScrollToM(elems))
        }
    }

    handleVm() {
        this.vm = new Vm()
    }

    handleLazy() {
        const elems = qsa('[data-lazy-src]')
        elems.length > 0 && (this.lazy = new Lazy(elems))
    }

    handleMC() {
        const elems = qsa('.js-mc-form', this.el)
        elems.length > 0 && (this.forms = [...elems].map(el => new MailChimp(el)))
    }

    loaded() {
        this.onEnterCompleted()
        new Stripe()
        new Transition()

        Events.emit('loaded')

        flags.initial = true
    }

    setup() {
        this.initial()
    }
}
