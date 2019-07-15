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
          display: block;
          min-width: 180px;
        }
        ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        li {
          border-bottom: var(--menu-tree-toplevel-border-bottom);
        }
        [grouplevel] li {
          border-bottom: var(--menu-tree-grouplevel-border-bottom);
        }
        span,
        a {
          display: block;
          text-decoration: none;
        }
        span {
          padding: 9px 9px 7px 10px;
          font: var(--menu-tree-toplevel-font);
          color: var(--menu-tree-toplevel-color);
        }
        a {
          background-color: rgba(0, 0, 0, 0.4);
          padding: 7px 7px 6px 15px;
          font: var(--menu-tree-grouplevel-font);
          color: var(--menu-tree-grouplevel-color);
        }
        span::before {
          content: '';
          display: inline-block;
          width: var(--menu-tree-toplevel-icon-size);
          height: var(--menu-tree-toplevel-icon-size);
          border: var(--menu-tree-toplevel-icon-border);
          border-radius: 50%;
          margin-right: 5px;
        }
        a::before {
          content: '-';
          margin-right: 4px;
        }
        [expanded] > span {
          font-weight: bold;
          color: var(--menu-tree-focus-color);
        }

        [grouplevel] {
          display: none;
        }

        [expanded] > [grouplevel] {
          display: block;
        }

        li[active] a {
          color: var(--menu-tree-focus-color);
          font-weight: bold;
          border-left: var(--menu-tree-grouplevel-active-border-left);
          background-color: rgba(0, 0, 0, 0.6);
          padding-left: 12px;
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
