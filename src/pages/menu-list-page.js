import { html, css } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import { store, PageView } from '@things-factory/shell'

import '../components/menu-bar'
import '../components/menu-tile-list'

class MenuListPage extends connect(store)(PageView) {
  static get styles() {
    return [
      css`
        :host {
          display: flex;
          flex-direction: column;
        }

        menu-tile-list {
          flex: 1;

          overflow-y: auto;
        }
      `
    ]
  }

  static get properties() {
    return {
      menuId: String,
      menus: Array,
      routingTypes: Object
    }
  }

  render() {
    return html`
      <page-toolbar></page-toolbar>
      
      <menu-bar .menus=${this.menus}></menu-bar>

      <menu-tile-list
        .menus="${this.menus}"
        .routingTypes="${this.routingTypes}"
        .menuId="${this.menuId}"
      ></menu-tile-list>
    `
  }

  stateChanged(state) {
    this.menus = state.menu.menus
    this.routingTypes = state.menu.routingTypes
    this.menuId = state.app.resourceId
  }
}

window.customElements.define('menu-list-page', MenuListPage)
