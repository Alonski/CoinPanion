import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import profile from './profile'

const rootReducer = combineReducers({
  form: formReducer,
  profile
})

export default rootReducer
