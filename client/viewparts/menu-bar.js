import { css, html, LitElement } from 'lit-element'

import '@material/mwc-icon'

import ScrollBooster from 'scrollbooster'

export default class MenuBar extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          background-color: var(--menu-bar-background-color, #242d30);

          overflow-x: hidden;
        }

        ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          white-space: nowrap;
        }

        li {
          display: inline-block;
          padding: 0px 3px;

          border-bottom: var(--menu-bar-line);
        }

        li[active] {
          border-color: var(--menu-bar-active-line-color, red);
        }

        li a {
          display: block;
          padding: 5px 4px 1px 4px;
          text-decoration: none;
          font: var(--menu-bar-textbutton);
          color: rgba(255, 255, 255, 0.8);
        }

        li[active] a {
          font: var(--menu-bar-textbutton-active);
          color: rgba(255, 255, 255, 1);
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
          <a href="/menu-list"><mwc-icon>star</mwc-icon></a>
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

  _onWheelEvent(e) {
    var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
    this.scrollLeft -= delta * 40

    e.preventDefault()
  }

  updated(change) {
    if (change.has('menus')) {
      /* menus가 바뀔 때마다, contents의 폭이 달라지므로, 다시 폭을 계산해준다. */
      this.__sb && this.__sb.updateMetrics()
    }

    if (change.has('menuId')) {
      var active = this.shadowRoot.querySelector('li[active]')
      active && active.scrollIntoView()
    }
  }

  firstUpdated() {
    var scrollTarget = this.shadowRoot.querySelector('ul')

    scrollTarget.addEventListener('mousewheel', this._onWheelEvent.bind(this), false)

    this.__sb = new ScrollBooster({
      viewport: this,
      content: scrollTarget,
      mode: 'x',
      onUpdate: data => {
        this.scrollLeft = data.position.x
      }
    })
  }
}

window.customElements.define('menu-bar', MenuBar)
