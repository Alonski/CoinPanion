import React, { Component } from 'react'
import styled from 'styled-components'

import SimpleStorageContract from '../../../build/contracts/SimpleStorage.json'
import VaultContract from '../../../build/contracts/Vault.json'
import Conf from '../../../truffle.js'
import Web3 from 'web3'

const Main = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`

class Dasboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      storageValue: 0
    }
  }

  componentDidMount() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    // So we can update state later.

    var self = this

    // Get the RPC provider and setup our SimpleStorage contract.
    var { host, port } = Conf.networks[process.env.NODE_ENV]

    const provider = new Web3.providers.HttpProvider('http://' + host + ':' + port)
    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(provider)
    const vault = contract(VaultContract)
    vault.setProvider(provider)

    // Get Web3 so we can get our accounts.
    const web3RPC = new Web3(provider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance
    var vaultInstance

    // Get accounts.
    web3RPC.eth.getAccounts(function(error, accounts) {
      console.log(accounts)

      simpleStorage
        .deployed()
        .then(function(instance) {
          simpleStorageInstance = instance

          // Stores a value of 5.
          return simpleStorageInstance.set(5, { from: accounts[0] })
        })
        .then(function(result) {
          // Get the value from the contract to prove it worked.
          return simpleStorageInstance.get.call(accounts[0])
        })
        .then(function(result) {
          // Update state with the result.
          return self.setState({ storageValue: result.c[0] })
        })

      vault
        .deployed()
        .then(function(instance) {
          vaultInstance = instance
          return vaultInstance.numberOfAuthorizedPayments.call(accounts[0])
        })
        .then(function(result) {
          console.log(result.toString())
        })

      vault
        .deployed()
        .then(function(instance) {
          vaultInstance = instance
          return vaultInstance.receiveEther({ from: accounts[0], value: 5000 })
        })
        .then(function(result) {
          _waitForTxToBeMined(web3RPC, result.tx)
          console.log(result.tx)
        })
    })
  }

  render() {
    return (
      <div>
        <Main>
          <h1>Dashboard</h1>
        </Main>
        <div>The stored value is: {this.state.storageValue}</div>
      </div>
    )
  }
}

export default Dasboard

async function _waitForTxToBeMined(web3, txHash) {
  let txReceipt
  while (!txReceipt) {
    try {
      txReceipt = await web3.eth.getTransactionReceipt(txHash)
    } catch (err) {
      return console.log(err)
    }
  }
  console.log(txReceipt)
}
