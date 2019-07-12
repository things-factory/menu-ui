import { css, html, LitElement } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import gql from 'graphql-tag'

import '@material/mwc-icon'

import { store, client } from '@things-factory/shell'

export default class MenuTreeBar extends connect(store)(LitElement) {
  static get styles() {
    return [
      css`
        :host {
          background-color: var(--secondary-dark-color);
        }

        [expanded] > span {
          font-weight: bold;
        }

        [grouplevel] {
          display: none;
        }

        [expanded] > [grouplevel] {
          display: block;
        }

        li[active] {
          background-color: tomato;
        }
      `
    ]
  }

  static get properties() {
    return {
      menuId: String,
      menus: Array,
      routingTypes: Object,
      page: Object
    }
  }

  render() {
    return html`
      <ul toplevel>
        ${(this.menus || []).map(
          menu => html`
            <li>
              <span @click=${e => e.target.parentElement.toggleAttribute('expanded')}>${menu.name}</span>

              <ul grouplevel>
                ${menu.childrens.map(subMenu => {
                  const routing = this._getFullRouting(subMenu)

                  return html`
                    <li ?active=${routing === decodeURIComponent(location.pathname.substr(1))}>
                      <a href=${routing}>${subMenu.name}</a>
                    </li>
                  `
                })}
              </ul>
            </li>
          `
        )}
      </ul>
    `
  }

  firstUpdated() {
    this.refreshMenus()
  }

  async updated() {
    await this.updateComplete

    var active = this.shadowRoot.querySelector('[active]')
    if (active) {
      active.parentElement.parentElement.setAttribute('expanded', '')
    }
  }

  stateChanged(state) {
    this.routingTypes = state.menu.routingTypes
    this.menuId = state.route.resourceId
    this.page = state.route.page
  }

  _getFullRouting(menu) {
    return menu.routingType.toUpperCase() === 'STATIC'
      ? menu.template
      : menu.titleField
      ? `${this.routingTypes[menu.routingType]}/${menu[menu.titleField]}`
      : `${this.routingTypes[menu.routingType]}/${menu.name}`
  }

  _onClickRefresh(e) {
    this.dispatchEvent(new CustomEvent('refresh'))
  }

  async refreshMenus() {
    const response = await client.query({
      query: gql`
        query {
          menus: userMenus {
            id
            name
            childrens {
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

    this.menus = response.data.menus
  }
}

window.customElements.define('menu-tree-bar', MenuTreeBar)
