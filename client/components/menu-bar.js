import { css, html, LitElement } from 'lit-element'

import '@material/mwc-icon'

import ScrollBooster from 'scrollbooster'

import { i18next } from '@things-factory/i18n-base'

export default class MenuBar extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          background-color: var(--secondary-dark-color);

          overflow-x: hidden;
        }

        ul {
          display: flex;
          list-style: none;
          margin: 5px 5px 0px 5px;
          padding: 5px 5px 0px 5px;
          white-space: nowrap;
        }

        li {
          display: inline-block;
          padding: 0 7px 5px 7px;

          border-bottom: solid 3px #242d30;
        }

        li[active] {
          border-color: red;
        }

        li a {
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
        }

        li[active] a {
          color: rgba(255, 255, 255, 1);
          font-weight: bold;
        }

        li[padding] {
          flex: 1;
        }

        li[refresh] * {
          color: rgba(255, 255, 255, 0.5);
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
              <a href=${`/${menu.routing || 'menu-list'}/${idx}`}>${i18next.t(`menu.${menu.name}`)}</a>
            </li>
          `
        )}

        <li padding></li>

        <li refresh>
          <mwc-icon @click=${this._onClickRefresh.bind(this)}>refresh</mwc-icon>
        </li>
      </ul>
    `
  }

  _onWheelEvent(e) {
    var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
    this.scrollLeft -= delta * 40

    e.preventDefault()
  }

  _onClickRefresh(e) {
    this.dispatchEvent(new CustomEvent('refresh'))
  }

  updated(change) {
    if (change.has('menus')) {
      /* menus가 바뀔 때마다, contents의 폭이 달라지므로, 다시 폭을 계산해준다. */
      this.__sb && this.__sb.updateMetrics()
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
