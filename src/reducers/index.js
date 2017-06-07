import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import profile from './profile'
import search from './search'
import { firebaseStateReducer as firebase } from 'react-redux-firebase'

const rootReducer = combineReducers({
  form: formReducer,
  profile,
  firebase,
  search
})

export default rootReducer
