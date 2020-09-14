import sniffer from 'sniffer'

export default {
  dom: {
    doc: document.documentElement,
    body: document.body,
    scroll: document.querySelector('[data-router-wrapper]'),
    gl: document.querySelector('.js-gl'),
    lastClicked: null
  },
  bounds: {
    ww: window.innerWidth,
    wh: window.innerHeight,
    vh: 0,
    scroll: 0,
    hero: {
      w: 0,
      h: 0
    }
  },
  flags: {
    locked: true,
    resize: false,
    dragging: false,
    loaded: false,
    small: window.matchMedia('(max-width: 639px)').matches,
    hover: window.matchMedia('(hover: hover)').matches,
    windows: (["Win32", "Win64", "Windows", "WinCE"].indexOf(window.navigator.platform) !== -1),
    ...sniffer.getInfos()
  },

  addClasses: function() {
    sniffer.addClasses(this.dom.body)
    this.flags.windows && (this.dom.body.classList.add('is-windows'))
  }
}