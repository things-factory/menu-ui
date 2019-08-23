import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import gql from 'graphql-tag'
import SwipeListener from 'swipe-listener'

import { store, client, PageView, ScrollbarStyles, pulltorefresh, navigate } from '@things-factory/shell'

import '../viewparts/menu-bar'
import '../viewparts/menu-tile-list'

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
      routingTypes: Object,
      favorites: Array,
      user: Object
    }
  }

  render() {
    return html`
      <menu-bar .menus=${this.menus} .menuId=${this.menuId}></menu-bar>

      <menu-tile-list
        .menus=${this.menus}
        .routingTypes=${this.routingTypes}
        .menuId=${this.menuId}
        .favorites="${this.favorites}"
      ></menu-tile-list>
    `
  }

  get context() {
    return {
      title: 'Menu'
    }
  }

  async fetchMenus() {
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

  async updated(changes) {
    if (changes.has('user')) {
      if (this.user && this.user.email) {
        this.menus = await this.getMenus()
      }
    }
  }

  stateChanged(state) {
    this.page = state.route.page
    this._email = state.auth.user ? state.auth.user.email : ''
    this.routingTypes = state.menu.routingTypes
    this.menuId = state.route.resourceId
    this.favorites = state.favorite.favorites
    this.user = state.auth.user

    var provider = state.menu.provider
    this.getMenus = typeof provider === 'function' ? provider.bind(this) : this.fetchMenus
  }

  async refresh() {
    this.menus = await this.getMenus()
  }

  async activated(active) {
    if (active) {
      this.refresh()
    }
  }

  firstUpdated() {
    var uxTargetEl = this.shadowRoot.querySelector('menu-tile-list')

    pulltorefresh({
      container: this.shadowRoot,
      scrollable: uxTargetEl,
      refresh: () => {
        return this.refresh()
      }
    })

    SwipeListener(uxTargetEl)

    uxTargetEl.addEventListener('swipe', e => {
      var directions = e.detail.directions
      var currentIndex = Number(this.menuId)
      var isHome = this.menuId === '' || this.menuId === undefined

      if (directions.left) {
        var lastIndex = this.menus.length - 1

        if (isHome) {
          navigate(`${this.page}/0`)
        } else if (currentIndex < lastIndex) {
          navigate(`${this.page}/${currentIndex + 1}`)
        }
      } else if (directions.right && !isHome) {
        navigate(`${this.page}/${currentIndex == 0 ? '' : currentIndex - 1}`)
      }
    })
  }
}

window.customElements.define('menu-list-page', MenuListPage)
