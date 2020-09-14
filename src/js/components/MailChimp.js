import { qs, qsa } from '@/utils'
import { Events } from '@/events'

export default class {
  constructor(el) {
    this.el = el
    this.form = qs('form', this.el)
    this.action = this.form.getAttribute('action')
    this.inputs = {
      email: qs('.js-mc-email', this.form),
      tel: qs('.js-mc-phone', this.form)
    }
    this.msg = qs('.js-mc-msg', this.form)
    this.addEvents()
  }

  addEvents() {
    Events.on('submit', this.el, this.submit)
  }

  appendScript() {
    const currentScript = qs('.js-mc-script')
    currentScript && currentScript.remove()

    const { email, tel } = this.inputs
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.classList.add('js-mc-script')
    script.src = `${this.action}&c=document.MC_callback&EMAIL=${email.value}&PHONE=${tel.value}`
    qs('head').appendChild(script) 
  }

  submit = (e) => {
    e && e.preventDefault()

    document.MC_callback = (response) => {
      if(response.result == "success") {
        this.msg.textContent = 'Subscribed to waitlist'
      } else {
        this.msg.textContent = 'Make sure your inputs are correct'
      }
    }
  
    this.appendScript()
  }

  destroy() {
    Events.off('submit', this.el, this.submit)
  }
}