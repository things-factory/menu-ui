import { html } from 'lit-html'

import { store, isMobileDevice } from '@things-factory/shell'
import { APPEND_NAVBAR } from '@things-factory/layout-base'

export default function bootstrap() {
  if (!isMobileDevice()) {
    import('./layout/menu-tree-bar')

    store.dispatch({
      type: APPEND_NAVBAR,
      name: 'menu-tree-bar',
      navbar: {
        show: true,
        template: html`
          <menu-tree-bar></menu-tree-bar>
        `
      }
    })
  }
}
