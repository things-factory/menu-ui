import { html } from 'lit-html'

import { isMobileDevice } from '@things-factory/shell'
import { appendViewpart, VIEWPART_POSITION } from '@things-factory/layout-base'

export default function bootstrap() {
  if (!isMobileDevice()) {
    import('./layout/menu-tree-bar')

    appendViewpart({
      name: 'menu-tree-bar',
      viewpart: {
        show: true,
        template: html`
          <menu-tree-bar></menu-tree-bar>
        `
      },
      position: VIEWPART_POSITION.NAVBAR
    })
  }
}
