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
      page: String,
      resourceId: String,
      favored: Boolean,
      routingTypes: Object,
      blackList: Array
    }
  }

  static get styles() {
    return css`
      :host {
        display: inline-block;
        vertical-align: middle;
        line-height: 0;
      }

      [favorable] {
        opacity: 0.5;
      }
    `
  }

  render() {
    var renderable = (this.blackList || []).indexOf(this.page) == -1

    return renderable
      ? html`
          <mwc-icon @click=${this.onclick.bind(this)} ?favorable=${!this.favored}
            >${this.favored ? 'star' : 'star_border'}</mwc-icon
          >
        `
      : html``
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
    this.page = state.route.page
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
    var routingType = Object.values(this.routingTypes).find(type => type.page == this.page)
    return routingType ? `${this.page}/${this.resourceId}` : this.page
  }
}

customElements.define('favorite-tool', FavoriteTool)
