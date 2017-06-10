import Web3 from 'web3'
import truffleConfig from './../../truffle-config.js'
import * as actionTypes from './actionTypes'

const web3Location = `http://${truffleConfig.networks.development.host}:${truffleConfig.networks.development.port}`

function web3Init(web3) {
  return {
    type: actionTypes.WEB_3_INITIALIZE,
    payload: web3
  }
}

export function web3Initialize() {
  return function(dispatch) {
    let web3Provided
    if (typeof web3 !== 'undefined') {
      console.log('Using Injected Web3')
      // eslint-disable-next-line
      // eslint-disable-next-line
      web3Provided = new Web3(web3.currentProvider)
    } else {
      console.log('Using Local Web3')
      // DEVELOPER NOTE: What happens in the wild if the
      // user does not have a browser based wallet? What happens
      // if the Web3 object cannot be initialized with the httpProvider
      // given from the loction in the truffle-config file?
      web3Provided = new Web3(new Web3.providers.HttpProvider(web3Location))
    }
    dispatch(web3Init(web3Provided))
  }
}
