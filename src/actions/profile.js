import Web3 from 'web3'
import Config from '../../truffle.js'
import * as actionTypes from './actionTypes'

export function getAddresses() {
  return async dispatch => {
    const { host, port } = Config.networks[process.env.NODE_ENV]
    const provider = new Web3.providers.HttpProvider('http://' + host + ':' + port)
    const web3RPC = new Web3(provider)
    web3RPC.eth.getAccounts((error, success) => dispatch({ type: actionTypes.GET_ADDRESSES, payload: success }))
  }
}
