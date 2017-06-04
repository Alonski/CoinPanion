import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import rootReducer from '../reducers'

const middleware = [thunk].filter(Boolean)

function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, compose(applyMiddleware(...middleware)))

  return store
}

export default configureStore
