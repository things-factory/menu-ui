import { html } from 'lit-html'

import { store, isMobileDevice } from '@things-factory/shell'
import { TOOL_POSITION, APPEND_NAVBAR } from '@things-factory/layout-base'

export default function bootstrap() {
  if (!isMobileDevice()) {
    import('./layout/menu-tree-bar')

    store.dispatch({
      type: APPEND_NAVBAR,
      navbar: {
        position: TOOL_POSITION.CENTER,
        template: html`
          <menu-tree-bar></menu-tree-bar>
        `
      }
    })
  }
}
