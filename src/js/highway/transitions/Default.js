import Highway from '@dogstudio/highway'

import { Events } from '@/events'

export default class extends Highway.Transition {
  in({ done }) {
    Events.emit('transition:in', { done })
  }

  out({ from, done }) {
    Events.emit('transition:out', { done, from })
  }
}
