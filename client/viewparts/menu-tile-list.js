import { css, html, LitElement } from 'lit-element'
import '@things-factory/shell' /* to use oops-note, oops-spinner */

import '@material/mwc-icon'

export default class MenuTileList extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          display: block;
          box-sizing: border-box;

          position: relative;
        }

        ul {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-auto-rows: 110px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        ul > li {
          margin: var(--menu-tile-list-item-margin);
          padding: 10px;

          position: relative;
        }

        mwc-icon {
          cursor: pointer;
          position: absolute;
          right: 8px;
          top: 8px;

          color: var(--menu-tile-list-favorite-color);
          font-size: 1em;
        }

        mwc-icon[selected] {
          color: white;
          text-shadow: 1px 1px 1px var(--menu-tile-list-favorite-color);
        }

        li.text a {
          color: #fff;
          text-decoration: none;

          font-size: 1.5em;
          word-wrap: break-word;
          word-break: keep-all;

          margin: 0px;
          display: block;
          width: 100%;
          height: 100%;
        }

        li.text:nth-child(7n + 1) {
          background-color: #4397de;
        }

        li.text:nth-child(7n + 2) {
          background-color: #33b8d0;
        }

        li.text:nth-child(7n + 3) {
          background-color: #4ab75f;
        }

        li.text:nth-child(7n + 4) {
          background-color: #93796f;
        }

        li.text:nth-child(7n + 5) {
          background-color: #f1ac42;
        }

        li.text:nth-child(7n + 6) {
          background-color: #ea6361;
        }

        li.text:nth-child(7n + 7) {
          background-color: #7386c3;
        }

        oops-note {
          display: block;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        oops-spinner {
          display: none;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        oops-spinner[show] {
          display: block;
        }

        @media (min-width: 600px) {
          ul {
            grid-template-columns: 1fr 1fr 1fr;
            grid-auto-rows: 120px;
          }
        }
        @media (min-width: 1200px) {
          ul {
            grid-template-columns: 1fr 1fr 1fr 1fr;
            grid-auto-rows: 130px;
          }
        }
        @media (min-width: 1800px) {
          ul {
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            grid-auto-rows: 140px;
          }
        }
        @media (min-width: 2400px) {
          ul {
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
            grid-auto-rows: 150px;
          }
        }
      `
    ]
  }

  static get properties() {
    return {
      menuId: String,
      menus: Array,
      routingTypes: Object,
      favorites: Array,
      showSpinner: Boolean
    }
  }

  render() {
    var topmenus = this.menus || []
    var menuId = this.menuId

    if (menuId !== 0 && !menuId) {
      /* favorite menus */
      var submenus = topmenus.reduce((allmenu, topmenu) => {
        let menus = (topmenu && topmenu.childrens) || []
        menus.forEach(menu => {
          if (this.favorites.includes(this._getFullRouting(menu))) {
            allmenu.push(menu)
          }
        })
        return allmenu
      }, [])
    } else {
      var menu = topmenus[menuId]
      var submenus = (menu && menu.childrens) || []
    }

    return html`
      <ul>
        ${submenus.map(subMenu => {
          const routing = this._getFullRouting(subMenu)

          return html`
            <li
              class="${subMenu.class} text"
              style="grid-row: span ${subMenu.routingType.toUpperCase() === 'STATIC' ? 1 : 2}"
            >
              <a href=${routing}>${subMenu.name}</a>

              <mwc-icon ?selected=${(this.favorites || []).includes(routing)}
                >${this.favorites || [].includes(routing) ? 'star' : 'star_border'}</mwc-icon
              >
            </li>
          `
        })}
      </ul>

      ${submenus.length == 0 && !this.showSpinner
        ? typeof menuId == 'number'
          ? html`
              <oops-note
                icon="apps"
                title="No Menu Found"
                description="Seems like you are not authorised to view this menu"
              ></oops-note>
            `
          : html`
              <oops-note
                icon="star_border"
                title="No Favourite Found"
                description="Click ☆ icon to add new favourite menu"
              ></oops-note>
            `
        : html``}

      <oops-spinner ?show=${this.showSpinner}></oops-spinner>
    `
  }

  _getFullRouting(menu) {
    var { routingType, titleField, name, resourceUrl } = menu
    if (routingType.toUpperCase() === 'STATIC') {
      return resourceUrl
    }

    var { page } = this.routingTypes[routingType]
    return titleField ? `${page}/${menu[titleField]}` : `${page}/${name}`
  }
}

window.customElements.define('menu-tile-list', MenuTileList)
