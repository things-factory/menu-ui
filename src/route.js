export default function route(page) {
  switch (page) {
    case 'menu-list':
      import('./pages/menu-list-page')
      return true
  }
}
