import { ADD_FAVORITE, REMOVE_FAVORITE } from '@things-factory/fav-base'
import { updateMenu } from '@things-factory/menu-base'
import { client, PageView, ScrollbarStyles, store } from '@things-factory/shell'
import gql from 'graphql-tag'
import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import '../components/menu-bar'
import '../components/menu-tile-list'

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

  firstUpdated() {
    this.refreshMenus()
    this._getFavorites()
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
    this._email = state.auth.user.email
    this.menus = state.menu.menus
    this.routingTypes = state.menu.routingTypes
    this.menuId = state.route.resourceId
  }
}

window.customElements.define('menu-list-page', MenuListPage)
