import * as actionTypes from '../actions/actionTypes'

const defaultState = {
  addresses: []
}

export default function profile(state = defaultState, action) {
  switch (action.type) {
    case actionTypes.GET_ADDRESSES:
      return { ...state, addresses: action.payload }
    default:
      return state
  }
}
