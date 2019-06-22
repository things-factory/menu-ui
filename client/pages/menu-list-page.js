import { html, css } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import gql from 'graphql-tag'

import { store, client, PageView, ScrollbarStyles } from '@things-factory/shell'
import { updateMenu } from '@things-factory/menu-base'

import '../components/menu-bar'
import '../components/menu-tile-list'

class MenuListPage extends connect(store)(PageView) {
  static get styles() {
    return [
      ScrollbarStyles,
      css`
        :host {
          display: flex;
          flex-direction: column;

          overflow: hidden;
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
      <menu-bar .menus=${this.menus} .menuId=${this.menuId} @refresh=${this.refreshMenus.bind(this)}></menu-bar>

      <menu-tile-list
        .menus="${this.menus}"
        .routingTypes="${this.routingTypes}"
        .menuId="${this.menuId}"
      ></menu-tile-list>
    `
  }

  firstUpdated() {
    this.refreshMenus()
  }

  async refreshMenus() {
    const response = await client.query({
      query: gql`
        query {
          menus: userMenus {
            id
            name
            children {
              id
              name
              routingType
              idField
              resourceName
              template
            }
          }
        }
      `
    })

    store.dispatch(updateMenu(response.data.menus))
  }

  stateChanged(state) {
    this.menus = state.menu.menus
    this.routingTypes = state.menu.routingTypes
    this.menuId = state.route.resourceId
  }
}

window.customElements.define('menu-list-page', MenuListPage)
