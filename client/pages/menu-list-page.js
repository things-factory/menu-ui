import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import gql from 'graphql-tag'

import PullToRefresh from 'pulltorefreshjs'

import { store, client, PageView, ScrollbarStyles, PullToRefreshStyles } from '@things-factory/shell'

import '../components/menu-bar'
import '../components/menu-tile-list'

class MenuListPage extends connect(store)(PageView) {
  static get styles() {
    return [
      ScrollbarStyles,
      PullToRefreshStyles,
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
      favorites: Array
    }
  }

  render() {
    return html`
      <menu-bar
        .menus=${this.menus}
        .menuId=${this.menuId}
        @refresh=${async () => {
          this.menus = this.getMenus()
        }}
      ></menu-bar>

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
              resourceName
              template
            }
          }
        }
      `
    })

    return response.data.menus
  }

  stateChanged(state) {
    this._email = state.auth.user ? state.auth.user.email : ''
    this.routingTypes = state.menu.routingTypes
    this.menuId = state.route.resourceId
    this.favorites = state.favorite.favorites
    this.getMenus =
      state.menu.provider && typeof state.menu.provider === 'function' ? state.menu.provider.bind(this) : this.getMenus
  }

  async activated(active) {
    if (active) {
      this.menus = await this.getMenus()
    }

    if (active) {
      await this.updateComplete
      /*
       * 첫번째 active 시에는 element가 생성되어있지 않으므로,
       * 꼭 updateComplete를 기다린 후에 mainElement설정을 해야한다.
       */
      this._ptr = PullToRefresh.init({
        mainElement: this.shadowRoot.querySelector('menu-tile-list'),
        distIgnore: 30,
        instructionsPullToRefresh: 'Pull down to refresh',
        instructionsRefreshing: 'Refreshing',
        instructionsReleaseToRefresh: 'Release to refresh',
        onRefresh: async () => {
          this.menus = await this.getMenus()
        }
      })
    } else {
      this._ptr && this._ptr.destroy()
      delete this._ptr
    }
  }
}

window.customElements.define('menu-list-page', MenuListPage)
