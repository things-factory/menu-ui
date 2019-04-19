import { html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import { store, PageView } from '@things-factory/shell'

import '../components/menu-tile-list'

class MenuListPage extends connect(store)(PageView) {
  static get properties() {
    return {
      menuId: String,
      menus: Array,
      routingTypes: Object
    }
  }
  render() {
    return html`
      <section>
        <menu-tile-list
          .menus="${this.menus}"
          .routingTypes="${this.routingTypes}"
          .menuId="${this.menuId}"
        ></menu-tile-list>
      </section>
    `
  }

  stateChanged(state) {
    this.menus = state.menu.menus
    this.routingTypes = state.menu.routingTypes
    this.menuId = state.app.resourceId
  }
}

window.customElements.define('menu-list-page', MenuListPage)
