import { UPDATE_MENU_UI } from '../actions/main'

const INITIAL_STATE = {
  state_main: 'ABC'
}

const main = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_MENU_UI:
      return { ...state }

    default:
      return state
  }
}

export default main
