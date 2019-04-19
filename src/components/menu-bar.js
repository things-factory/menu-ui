import { LitElement, html, css } from 'lit-element'

import '@material/mwc-icon/mwc-icon'

export default class MenuBar extends LitElement {
  static get styles() {
    return [
      css`
        ul {
          padding: 5px 10px 5px 10px;
          margin: 0px;
          background-color: #242d30;

          list-style: none;
        }

        li {
          display: inline;
        }

        li a {
          text-decoration: none;
          color: white;
        }

        li a[active] {
          color: red;
        }
      `
    ]
  }

  static get properties() {
    return {
      menus: Array
    }
  }

  render() {
    var topmenus = this.menus || []
    var activeIndex = 1

    return html`
      <ul>
        <li><a><mwc-icon>home</mwc-icon></a></li>
        <li><a><mwc-icon>star</mwc-icon></a></li>
        ${topmenus.map(
          (menu, idx) => html`
            <li><a href=${`/${menu.routing || 'menu-list'}/${idx}`} ?active=${idx == activeIndex}>${menu.name}</a></li>
          `
        )}
      </ul>
    `
  }
}

window.customElements.define('menu-bar', MenuBar)
