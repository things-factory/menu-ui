import { LitElement, html, css } from 'lit-element'

import '@material/mwc-icon/mwc-icon'

export default class MenuBar extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          background-color: var(--secondary-dark-color);
        }

        ul {
          display: block;
          list-style: none;
          margin: 5px 5px 0px 5px;
          padding: 5px 5px 0px 5px;
        }

        li {
          display: inline-block;
          margin: 0 3px 0 3px;
          padding: 0px 0 5px 0;

          border-width: 0px 0px 3px 0px;
          border-style: solid;
          border-color: #242d30;
        }

        li[active] {
          border-color: red;
        }

        li a {
          text-decoration: none;
          color: white;
        }

        mwc-icon {
          vertical-align: middle;
        }
      `
    ]
  }

  static get properties() {
    return {
      menus: Array,
      menuId: String
    }
  }

  render() {
    var topmenus = this.menus || []

    return html`
      <ul>
        <li ?active=${this.menuId !== 0 && !this.menuId}>
          <a href="/menu-list"><mwc-icon>home</mwc-icon></a>
        </li>

        <li ?active=${this.menuId === 'favor'}>
          <a href="/menu-list/favor"><mwc-icon>star</mwc-icon></a>
        </li>
        
        ${topmenus.map(
          (menu, idx) => html`
            <li ?active=${this.menuId === String(idx)}>
              <a href=${`/${menu.routing || 'menu-list'}/${idx}`}>${menu.name}</a>
            </li>
          `
        )}
      </ul>
    `
  }
}

window.customElements.define('menu-bar', MenuBar)
