import { createStore, compose, applyMiddleware } from 'redux'
import { persistState } from 'redux-devtools'
import thunk from 'redux-thunk'
import rootReducer from '../reducers'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

function configureStore(initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)), applyMiddleware(thunk))
  )

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default
      store.replaceReducer(nextReducer)
    })
  }

  return store
}

export default configureStore
