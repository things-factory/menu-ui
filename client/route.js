export default function route(page) {
  switch (page) {
    case 'menu-list':
      import('./pages/menu-list-page')
      return page

    case 'menu-management':
      import('./pages/menu-management')
      return page
  }
}
