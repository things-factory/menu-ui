import route from './client/route'
import bootstrap from './client/bootstrap'

export default {
  route,
  routes: [
    {
      tagname: 'menu-list-page',
      page: 'menu-list'
    },
    {
      tagname: 'menu-management',
      page: 'menus'
    }
  ],
  bootstrap
}
