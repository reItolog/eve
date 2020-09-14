import store from '@/store'
import { Events, VS, Pointer } from '@/events'

const { flags } = store

export default new (class {
  constructor() {
    if (flags.isDesktop) {
      new VS()
      Events.on('vs', this.onVS)
    }
  }

  onVS = ({ deltaY }) => {
    if (flags.locked) return
    Pointer.run()
    Events.emit('scroll', { y: deltaY * -1 })
  }
})()
