import { css, html, LitElement } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import gql from 'graphql-tag'

import '@material/mwc-icon'

import { store, client, navigate } from '@things-factory/shell'

export default class MenuTreeBar extends connect(store)(LitElement) {
  static get styles() {
    return [
      css`
        :host {
          display: block;
          min-width: 200px;
        }
        [domain] {
          background: var(--menu-domain-background-color);
          background: linear-gradient(180deg, var(--secondary-color) 0%, rgba(var(--primary-color-rgb), 0.5) 120%);
          padding: var(--menu-domain-padding);
          border-bottom: 1px solid rgba(var(--primary-color-rgb), 0.5);
        }
        [domain] mwc-icon {
          margin-right: -8px;
          font-size: 12px;
          color: var(--menu-domain-icon-color);
        }
        [domain] * {
          vertical-align: middle;
        }
        [domain] span {
          padding-left: 7px;
          font: var(--menu-domain-font);
          color: var(--menu-domain-color);
        }
        [domain] select {
          background-color: transparent;
          width: -webkit-fill-available;
          max-width: 175px;
          border: none;

          font: var(--menu-domain-font);
          color: var(--menu-domain-color);
        }
        select:focus {
          outline: 0;
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

        li span,
        li a {
          display: block;
          text-decoration: none;
          position: relative;
        }

        [menutype] {
          position: absolute;
          font-size: 1.2em;
          right: 0;
          bottom: 50%;
          transform: translate(-5px, 50%);
        }

        [favorite] {
          color: var(--menu-tree-favorite-color, tomato);
        }

        [groupmenu] > span {
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

        [groupmenu] > span::before {
          content: '';
          display: inline-block;
          width: var(--menu-tree-toplevel-icon-size);
          height: var(--menu-tree-toplevel-icon-size);
          border: var(--menu-tree-toplevel-icon-border);
          border-radius: 50%;
          margin-right: 5px;
        }

        a span::before {
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
      favorites: Array,
      routingTypes: Object,
      page: Object,
      user: Object,
      contextPath: String,
      domains: Array,
      subdomain: String
    }
  }

  render() {
    var domains = this.domains || []
    var domain = this.domains.find(domain => domain.subdomain == this.subdomain) || {}

    return html`
      <div domain>
        <mwc-icon>beenhere</mwc-icon>
        ${domains.length <= 1
          ? html`
              <span>${domain.name}</span>
            `
          : html`
              <select
                .value=${domain.subdomain}
                @change=${e => (window.location.pathname = `/checkin/${e.target.value}`)}
              >
                ${domains.map(
                  domain => html`
                    <option .value=${domain.subdomain} ?selected=${domain.subdomain == this.subdomain}
                      >${domain.name}</option
                    >
                  `
                )}
              </select>
            `}
      </div>

      <ul toplevel>
        ${(this.menus || []).map(
          menu => html`
            <li groupmenu>
              <span @click=${e => e.target.parentElement.toggleAttribute('expanded')}>${menu.name}</span>

              <ul grouplevel>
                ${menu.childrens.map(subMenu => {
                  const routing = this._getFullRouting(subMenu)
                  const favorite = this.favorites.includes(routing)
                  const { icon } = this.routingTypes[subMenu.routingType] || {}
                  const typeIcon = icon ? icon : favorite ? 'star' : null

                  return html`
                    <li ?active=${routing === decodeURIComponent(location.pathname.substr(1))}>
                      <a href=${routing}>
                        <span>${subMenu.name}</span>
                        ${typeIcon
                          ? html`
                              <mwc-icon menutype ?favorite=${favorite}>${typeIcon}</mwc-icon>
                            `
                          : html``}</a
                      >
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

  async updated(changes) {
    if (changes.has('user') || changes.has('contextPath')) {
      this.menus = await this.getMenus()
    }

    await this.updateComplete

    var active = this.shadowRoot.querySelector('[active]')
    if (active) {
      active.parentElement.parentElement.setAttribute('expanded', '')
    }
  }

  async firstUpdated() {
    await this.updateComplete

    this.menus = await this.getMenus()
  }

  stateChanged(state) {
    this.contextPath = state.app.contextPath
    this.routingTypes = state.menu.routingTypes
    this.menuId = state.route.resourceId
    this.page = state.route.page
    this.user = state.auth.user
    this.domains = state.app.domains
    this.subdomain = this.contextPath.split('/')[2]
    this.getMenus =
      state.menu.provider && typeof state.menu.provider === 'function' ? state.menu.provider : this.getMenus
    this.favorites = state.favorite.favorites
  }

  _getFullRouting(menu) {
    var { routingType, resourceUrl, titleField, name } = menu
    if (routingType.toUpperCase() === 'STATIC') {
      return resourceUrl
    }

    var { page } = this.routingTypes[routingType]
    return titleField ? `${page}/${menu[titleField]}` : `${page}/${name}`
  }

  _onClickRefresh(e) {
    this.dispatchEvent(new CustomEvent('refresh'))
  }

  async getMenus() {
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
              titleField
              resourceName
              resourceUrl
              template
            }
          }
        }
      `
    })

    return response.data.menus
  }
}

window.customElements.define('menu-tree-bar', MenuTreeBar)
