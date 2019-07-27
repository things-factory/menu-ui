import { LitElement, html, css } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import gql from 'graphql-tag'

import '@material/mwc-icon'

import { store, client } from '@things-factory/shell'
import { UPDATE_FAVORITES } from '../../../fav-base/client'

export class FavoriteTool extends connect(store)(LitElement) {
  static get properties() {
    return {
      favorites: Array,
      user: Object,
      routing: String,
      resourceId: String,
      favored: Boolean,
      routingTypes: Object
    }
  }

  static get styles() {
    return css`
      :host {
        display: inline-block;
        vertical-align: middle;
        line-height: 0;
      }
    `
  }

  render() {
    return html`
      <mwc-icon @click=${this.onclick.bind(this)}>${this.favored ? 'star' : 'star_border'}</mwc-icon>
    `
  }

  updated(changes) {
    if (changes.has('user')) {
      this.refreshFavorites()
    }

    this.favored = (this.favorites || []).includes(this.getFullRouting())
  }

  stateChanged(state) {
    this.favorites = state.favorite.favorites
    this.user = state.auth.user
    this.routing = state.route.page
    this.resourceId = state.route.resourceId
    this.routingTypes = state.menu.routingTypes
  }

  onclick(event) {
    if (this.favored) {
      this.removeFavorite(this.getFullRouting())
    } else {
      this.addFavorite(this.getFullRouting())
    }
  }

  async refreshFavorites() {
    if (!this.user || !this.user.email) {
      return
    }

    const response = await client.query({
      query: gql`
        query {
          myFavorites(userId: "${this.user.email}") {
            id
            userId
            routing
          }
        }
      `
    })

    store.dispatch({
      type: UPDATE_FAVORITES,
      favorites: response.data.myFavorites.map(favorite => favorite.routing)
    })
  }

  async removeFavorite(routing) {
    await client.query({
      query: gql`
        mutation {
          deleteFavorite(userId: "${this.user.email}", routing: "${routing}") {
            id
            userId
            routing
          }
        }
      `
    })

    this.refreshFavorites()
  }

  async addFavorite(routing) {
    await client.query({
      query: gql`
        mutation {
          createFavorite(favorite: {
            userId: "${this.user.email}"
            routing: "${routing}"
          }) {
            id
            userId
            routing
          }
        }
      `
    })

    this.refreshFavorites()
  }

  getFullRouting() {
    var routingType = Object.values(this.routingTypes).includes(this.routing) ? this.routing : ''

    return routingType ? `${routingType}/${this.resourceId}` : this.routing
  }
}

customElements.define('favorite-tool', FavoriteTool)
