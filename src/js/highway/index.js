import Highway from '@dogstudio/highway'

Highway.initial = false

import * as R from './renderers'
import * as T from './transitions'
import store from '../store'

export default new (class extends Highway.Core {
  constructor() {
    super({
      renderers: {
        home: R.Home,
        default: R.Default,
      },
      transitions: {
        default: T.Default,
      },
    })

		this.on('NAVIGATE_END', ({ to, location }) => {
			if (typeof gtag !== 'undefined') {
				// eslint-disable-next-line
				gtag('config', 'UA-71854614-3', {
					page_path: location.pathname,
					page_title: to.page.title,
					page_location: location.href
				})
			}
		})
  }

  navigate(e) {
    store.dom.lastClicked = e.currentTarget
    super.navigate(e)
  }
})()