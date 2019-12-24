import '@things-factory/form-ui'
import '@things-factory/grist-ui'
import { i18next, localize } from '@things-factory/i18n-base'
import { client, CustomAlert, gqlBuilder, isMobileDevice, ScrollbarStyles } from '@things-factory/shell'
import gql from 'graphql-tag'
import { css, html, LitElement } from 'lit-element'

class MenuManagementDetail extends localize(i18next)(LitElement) {
  static get styles() {
    return [
      ScrollbarStyles,
      css`
        :host {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: white;
        }
        search-form {
          overflow: visible;
        }
        .grist {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow-y: auto;
        }
        data-grist {
          overflow-y: hidden;
          flex: 1;
        }
        .button-container {
          padding: 10px 0 12px 0;
          text-align: center;
        }
        .button-container > button {
          background-color: var(--button-background-color);
          border: var(--button-border);
          border-radius: var(--button-border-radius);
          margin: var(--button-margin);
          padding: var(--button-padding);
          color: var(--button-color);
          font: var(--button-font);
          text-transform: var(--button-text-transform);
        }
        .button-container > button:hover,
        .button-container > button:active {
          background-color: var(--button-background-focus-color);
        }
      `
    ]
  }

  static get properties() {
    return {
      menuId: String,
      searchFields: Object,
      config: Object
    }
  }

  render() {
    return html`
      <search-form .fields=${this.searchFields} @submit=${e => this.dataGrist.fetch()}></search-form>

      <div class="grist">
        <data-grist
          .mode=${isMobileDevice() ? 'LIST' : 'GRID'}
          .config=${this.config}
          .fetchHandler=${this.fetchHandler.bind(this)}
        ></data-grist>
      </div>

      <div class="button-container">
        <button @click=${this.save}>${i18next.t('button.save')}</button>
        <button @click=${this.delete}>${i18next.t('button.delete')}</button>
      </div>
    `
  }

  get searchForm() {
    return this.shadowRoot.querySelector('search-form')
  }

  get dataGrist() {
    return this.shadowRoot.querySelector('data-grist')
  }

  firstUpdated() {
    this.searchFields = [
      {
        name: 'name',
        label: i18next.t('field.name'),
        type: 'text',
        props: { searchOper: 'i_like' }
      },
      {
        name: 'description',
        label: i18next.t('field.description'),
        type: 'text',
        props: { searchOper: 'i_like' }
      },
      {
        name: 'template',
        label: i18next.t('field.template'),
        type: 'text',
        props: { searchOper: 'i_like' }
      },
      {
        name: 'category',
        label: i18next.t('field.category'),
        type: 'text',
        props: { searchOper: 'i_like' }
      },
      {
        name: 'resourceUrl',
        label: i18next.t('field.resource_url'),
        type: 'text',
        props: { searchOper: 'i_like' }
      },
      {
        name: 'hiddenFlag',
        label: i18next.t('field.hidden_flag'),
        type: 'checkbox',
        props: { searchOper: 'eq' },
        attrs: ['indeterminate']
      }
    ]

    this.config = {
      rows: { selectable: { multiple: true } },
      pagination: { infinite: true },
      columns: [
        { type: 'gutter', gutterName: 'dirty' },
        { type: 'gutter', gutterName: 'sequence' },
        { type: 'gutter', gutterName: 'row-selector', multiple: true },
        {
          type: 'string',
          name: 'name',
          header: i18next.t('field.name'),
          record: { editable: true, align: 'left' },
          sortable: true,
          width: 150
        },
        {
          type: 'integer',
          name: 'rank',
          header: i18next.t('field.rank'),
          record: { editable: true, align: 'center' },
          sortable: true,
          width: 80
        },
        {
          type: 'string',
          name: 'description',
          header: i18next.t('field.description'),
          record: { editable: true, align: 'left' },
          sortable: true,
          width: 200
        },
        {
          type: 'object',
          name: 'role',
          header: i18next.t('field.role'),
          record: {
            editable: true,
            align: 'center',
            options: {
              queryName: 'roles'
            }
          },
          sortable: true,
          width: 250
        },
        {
          type: 'string',
          name: 'template',
          header: i18next.t('field.template'),
          record: { editable: true, align: 'left' },
          sortable: true,
          width: 160
        },
        {
          type: 'string',
          name: 'resourceUrl',
          header: i18next.t('field.resource_url'),
          record: { editable: true, align: 'left' },
          sortable: true,
          width: 160
        },
        {
          type: 'boolean',
          name: 'hiddenFlag',
          header: i18next.t('field.hidden_flag'),
          record: { editable: true, align: 'center' },
          sortable: true,
          width: 80
        },
        {
          type: 'datetime',
          name: 'updatedAt',
          header: i18next.t('field.updated_at'),
          record: { editable: false, align: 'center' },
          sortable: true,
          width: 150
        },
        {
          type: 'object',
          name: 'updater',
          header: i18next.t('field.updater'),
          record: { editable: false, align: 'center' },
          sortable: true,
          width: 150
        }
      ]
    }
  }

  async fetchHandler({ page, limit, sorters = [{ name: 'rank' }, { name: 'name' }] }) {
    const response = await client.query({
      query: gql`
        query {
          menus(${gqlBuilder.buildArgs({
            filters: [...this.searchForm.queryFilters, { name: 'parent', operator: 'eq', value: this.menuId }],
            pagination: { page, limit },
            sortings: sorters
          })}) {
            items {
              id
              name
              rank
              description
              category
              template
              resourceUrl
              hiddenFlag
              updatedAt
              updater{
                id
                name
                description
              }
            }
            total
          }
        }
      `
    })

    return {
      total: response.data.menus.total || 0,
      records: response.data.menus.items || []
    }
  }

  async save() {
    const patches = this.getPatches()
    if (patches && patches.length) {
      const response = await client.query({
        query: gql`
          mutation {
            updateMultipleMenu(${gqlBuilder.buildArgs({
              patches
            })}) {
              name
            }
          }
        `
      })

      if (!response.errors) this.dataGrist.fetch()
    } else {
      CustomAlert({
        title: i18next.t('text.nothing_changed'),
        text: i18next.t('text.there_is_nothing_to_save')
      })
    }
  }

  async delete() {
    const ids = this.dataGrist.selected.map(record => record.id)
    if (ids && ids.length > 0) {
      const anwer = await CustomAlert({
        type: 'warning',
        title: i18next.t('button.delete'),
        text: i18next.t('text.are_you_sure'),
        confirmButton: { text: i18next.t('button.delete') },
        cancelButton: { text: i18next.t('button.cancel') }
      })

      if (!anwer.value) return

      const response = await client.query({
        query: gql`
          mutation {
            deleteMenus(${gqlBuilder.buildArgs({ ids })})
          }
        `
      })

      if (!response.errors) this.dataGrist.fetch()
    } else {
      CustomAlert({
        title: i18next.t('text.nothing_selected'),
        text: i18next.t('text.there_is_nothing_to_delete')
      })
    }
  }

  getPatches() {
    let patches = this.dataGrist.dirtyRecords
    if (patches && patches.length) {
      patches = patches.map(menu => {
        let patchField = menu.id ? { id: menu.id } : {}
        const dirtyFields = menu.__dirtyfields__
        for (let key in dirtyFields) {
          patchField[key] = dirtyFields[key].after
        }
        patchField.parent = { id: this.menuId }
        patchField.role = { id: patchField.role.id }
        patchField.routingType = patchField.routingType || 'STATIC'
        patchField.menuType = patchField.menuType || 'SCREEN'
        patchField.cuFlag = menu.__dirty__

        return patchField
      })
    }

    return patches
  }
}

customElements.define('menu-management-detail', MenuManagementDetail)
