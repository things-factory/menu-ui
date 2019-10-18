import { css, html } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import gql from 'graphql-tag'

import { store, client, PageView, ScrollbarStyles, pulltorefresh, navigate, swipe } from '@things-factory/shell'

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
          position: relative;

          overflow: hidden;
        }

        menu-bar {
          z-index: 1;
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
      user: Object,
      showSpinner: Boolean
    }
  }

  render() {
    return html`
      <menu-bar .menus=${this.menus} .menuId=${this.menuId}></menu-bar>

      <menu-tile-list
        .menus=${this.menus}
        .routingTypes=${this.routingTypes}
        .menuId=${this.menuId}
        .favorites=${this.favorites}
        .showSpinner=${this.showSpinner}
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
        this.refresh()
      }
    }
  }

  stateChanged(state) {
    this.page = state.route.page
    this.routingTypes = state.menu.routingTypes
    this.menuId = state.route.resourceId
    this.favorites = state.favorite.favorites
    this.user = state.auth.user

    var provider = state.menu.provider
    this.getMenus = typeof provider === 'function' ? provider.bind(this) : this.fetchMenus
  }

  async refresh() {
    this.showSpinner = true
    this.menus = await this.getMenus()
    this.showSpinner = false
  }

  async firstUpdated() {
    pulltorefresh({
      container: this.shadowRoot,
      scrollable: this.shadowRoot,
      refresh: () => {
        return this.refresh()
      }
    })

    var list = this.shadowRoot.querySelector('menu-tile-list')
    var callback

    list.addEventListener('transitionend', () => {
      list.style.transition = ''

      callback && callback()
      callback = null
    })

    swipe({
      container: this.shadowRoot.querySelector('menu-tile-list'),
      animates: {
        dragging: async (d, opts) => {
          var currentIndex = Number(this.menuId)
          var isHome = this.menuId === '' || this.menuId === undefined

          if ((d > 0 && isHome) || (d < 0 && currentIndex >= this.menus.length - 1)) {
            /* TODO blocked gesture */
            return false
          }

          list.style.transform = `translate3d(${d}px, 0, 0)`
        },
        aborting: async opts => {
          list.style.transition = 'transform 0.3s'
          list.style.transform = `translate3d(0, 0, 0)`
        },
        swiping: async (d, opts) => {
          var currentIndex = Number(this.menuId)
          var isHome = this.menuId === '' || this.menuId === undefined

          if ((d > 0 && isHome) || (d < 0 && currentIndex >= this.menus.length - 1)) {
            list.style.transform = `translate3d(0, 0, 0)`

            return
          }

          callback = () => {
            if (isHome) {
              navigate(`${this.page}/0`)
            } else if (d > 0 && currentIndex == 0) {
              navigate(`${this.page}`)
            } else {
              navigate(`${this.page}/${currentIndex + (d < 0 ? 1 : -1)}`)
            }

            list.style.transition = ''
            list.style.transform = `translate3d(0, -100%, 0)`

            requestAnimationFrame(() => {
              list.style.transition = 'transform 0.3s'
              list.style.transform = `translate3d(0, 0, 0)`
            })
          }

          list.style.transition = 'transform 0.3s'
          list.style.transform = `translate3d(${d < 0 ? '-100%' : '100%'}, 0, 0)`
        }
      }
    })

    await this.updateComplete

    this.refresh()
  }
}

window.customElements.define('menu-list-page', MenuListPage)
