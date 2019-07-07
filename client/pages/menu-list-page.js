import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import gql from 'graphql-tag'

import PullToRefresh from 'pulltorefreshjs'

import { store, client, PageView, ScrollbarStyles, PullToRefreshStyles } from '@things-factory/shell'
import { updateMenu } from '@things-factory/menu-base'

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
      myFavorites: Array
    }
  }

  render() {
    return html`
      <menu-bar .menus=${this.menus} .menuId=${this.menuId} @refresh=${this.refreshMenus.bind(this)}></menu-bar>

      <menu-tile-list
        .menus=${this.menus}
        .routingTypes=${this.routingTypes}
        .menuId=${this.menuId}
        .favorites="${this.myFavorites}"
        @favoriteClick="${this._onFavoriteClickHandler}"
      ></menu-tile-list>
    `
  }

  get context() {
    return {
      title: 'Menu'
    }
  }

  async refreshMenus() {
    const response = await client.query({
      query: gql`
        query {
          menus: userMenus {
            id
            name
            children {
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

    store.dispatch(updateMenu(response.data.menus))
  }

  async _getFavorites() {
    const response = await client.query({
      query: gql`
        query {
          myFavorites(userId: "${this._email}") {
            id
            userId
            routing
          }
        }
      `
    })

    this.myFavorites = response.data.myFavorites.map(favorite => favorite.routing)
  }

  _onFavoriteClickHandler(event) {
    const { currentState, routing } = event.detail
    if (currentState) {
      this._removeFavorite(routing)
    } else {
      this._addFavorite(routing)
    }
  }

  async _removeFavorite(routing) {
    await client.query({
      query: gql`
        mutation {
          deleteFavorite(userId: "${this._email}", routing: "${routing}") {
            id
            userId
            routing
          }
        }
      `
    })

    this._getFavorites()
  }

  async _addFavorite(routing) {
    await client.query({
      query: gql`
        mutation {
          createFavorite(favorite: {
            userId: "${this._email}"
            routing: "${routing}"
          }) {
            id
            userId
            routing
          }
        }
      `
    })

    this._getFavorites()
  }

  stateChanged(state) {
    this._email = state.auth.user ? state.auth.user.email : ''
    this.menus = state.menu.menus
    this.routingTypes = state.menu.routingTypes
    this.menuId = state.route.resourceId
  }

  async activated(active) {
    if (active) {
      this.refreshMenus()
      this._getFavorites()
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
          this.refreshMenus()
          this._getFavorites()
        }
      })
    } else {
      this._ptr && this._ptr.destroy()
      delete this._ptr
    }
  }
}

window.customElements.define('menu-list-page', MenuListPage)
