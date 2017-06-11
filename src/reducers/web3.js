import Web3 from 'web3'
import * as actionTypes from '../actions/actionTypes'
const provider = new Web3.providers.HttpProvider('http://localhost:8546')
const web3 = new Web3(provider)

const initialState = {
  web3Provider: web3
}

const web3Reducer = (state = initialState, action) => {
  if (action.type === actionTypes.WEB_3_INITIALIZE) {
    return { ...state, ...{ web3Provider: action.payload } }
  }
  return state
}

export default web3Reducer
