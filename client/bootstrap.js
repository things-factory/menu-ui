import { html } from 'lit-html'

import { store, isMobileDevice } from '@things-factory/shell'
import { appendViewpart, VIEWPART_POSITION, TOOL_POSITION } from '@things-factory/layout-base'
import { APPEND_APP_TOOL } from '@things-factory/apptool-base'

import './apptools/favorite-tool'
import './viewparts/menu-tree-bar'

export default function bootstrap() {
  if (!isMobileDevice()) {
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

  store.dispatch({
    type: APPEND_APP_TOOL,
    tool: {
      template: html`
        <favorite-tool></favorite-tool>
      `,
      position: TOOL_POSITION.REAR
    }
  })
}
