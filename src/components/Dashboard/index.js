import React, { Component } from 'react'
import styled from 'styled-components'

import Avatar from 'material-ui/Avatar'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Snackbar from 'material-ui/Snackbar'
import Paper from 'material-ui/Paper'

// import SimpleStorageContract from '../../../build/contracts/SimpleStorage.json'
import VaultContract from '../../../build/contracts/Vault.json'
import Conf from '../../../truffle.js'
import Web3 from 'web3'

const Main = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 10px 10px 10px 10px;
`

class Dasboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      vaultBalance: 0,
      vaultBalanceEther: 0,
      loadVaultValue: 0,
      vaultAddress: '0x0',
      userBalance: 0,
      userAddress: '0x0',
      photo_url: 'http://lorempixel.com/400/200/',
      web3: '',
      vault: '',
      openSnackbar: false,
      snackbarMessage: ''
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
    // const simpleStorage = contract(SimpleStorageContract)
    // simpleStorage.setProvider(provider)
    const vault = contract(VaultContract)
    vault.setProvider(provider)

    // Get Web3 so we can get our accounts.
    const web3RPC = new Web3(provider)

    self.setState({ web3: web3RPC, vault: vault })

    // Declaring this for later so we can chain functions on SimpleStorage.
    // var simpleStorageInstance
    var vaultInstance

    // Get accounts.
    web3RPC.eth.getAccounts(function(error, accounts) {
      console.log(accounts)
      self.setState({ userAddress: accounts[0], userBalance: web3RPC.eth.getBalance(accounts[0]).toString() })
      // simpleStorage
      //   .deployed()
      //   .then(function(instance) {
      //     simpleStorageInstance = instance

      //     // Stores a value of 5.
      //     return simpleStorageInstance.set(5, { from: accounts[0] })
      //   })
      //   .then(function(result) {
      //     // Get the value from the contract to prove it worked.
      //     return simpleStorageInstance.get.call(accounts[0])
      //   })
      //   .then(function(result) {
      //     // Update state with the result.
      //     return self.setState({ storageValue: result.c[0] })
      //   })

      vault.deployed().then(function(instance) {
        vaultInstance = instance
        self.setState({
          vaultBalance: web3RPC.eth.getBalance(vaultInstance.address).toString(),
          vaultBalanceEther: web3RPC.fromWei(web3RPC.eth.getBalance(vaultInstance.address).toString(), 'ether'),
          vaultAddress: vaultInstance.address
        })
        // return vaultInstance.numberOfAuthorizedPayments.call(accounts[0])
      })
      // .then(function(result) {
      //   console.log(result.toString())
      // })

      // vault
      //   .deployed()
      //   .then(function(instance) {
      //     console.log(instance)
      //     vaultInstance = instance
      //     return vaultInstance.receiveEther({ from: accounts[0], value: 5000 })
      //   })
      //   .then(function(result) {
      //     _waitForTxToBeMined(web3RPC, result.tx)
      //     console.log('Mined TX:', result.tx)
      //     console.log('Contract Balance:', web3RPC.eth.getBalance(vaultInstance.address).toString())
      //     console.log('Address Balance:', web3RPC.eth.getBalance(accounts[0]).toString())
      //   })
    })
  }

  handleFieldChange = (stateKey, event, newValue) => {
    const obj = {}
    obj[stateKey] = newValue // so key can be programatically assigned
    this.setState(obj)
  }

  handleLoadVault = event => {
    const vault = this.state.vault,
      web3 = this.state.web3,
      userAddress = this.state.userAddress,
      userBalance = this.state.userBalance,
      loadVaultValue = this.state.loadVaultValue
    let vaultInstance,
      self = this
    if (loadVaultValue > userBalance) {
      console.log('Not enough Ether!')
      self.setState({ openSnackbar: true, snackbarMessage: 'Error: Not enough Ether!', loadVaultValue: 0 })
      return
    }
    vault
      .deployed()
      .then(function(instance) {
        vaultInstance = instance
        return vaultInstance.receiveEther({ from: userAddress, value: loadVaultValue })
      })
      .then(function(result) {
        _waitForTxToBeMined(web3, result.tx)
        console.log('Mined TX:', result.tx)
        console.log('Contract Balance:', web3.eth.getBalance(vaultInstance.address).toString())
        console.log('Address Balance:', web3.eth.getBalance(userAddress).toString())
        self.setState({
          vaultBalance: web3.eth.getBalance(vaultInstance.address).toString(),
          vaultBalanceEther: web3.fromWei(web3.eth.getBalance(vaultInstance.address).toString(), 'ether'),
          userBalance: web3.eth.getBalance(userAddress).toString()
        })
        self.setState({ openSnackbar: true, snackbarMessage: `Vault loaded with ${loadVaultValue} WEI` })
      })
  }

  handleRequestClose = event => {
    this.setState({ openSnackbar: false })
  }

  render() {
    return (
      <div>
        <Main>
          <h1>Dashboard</h1>
        </Main>
        <Main>
          <Paper>
            <InnerContainer>
              <span>Load Vault</span>
              <TextField
                floatingLabelText="Amount to Load in WEI"
                type="number"
                onChange={(event, newValue) => this.handleFieldChange('loadVaultValue', event, newValue)}
                errorText={!this.state.loadVaultValue ? 'Value is Required' : null}
                value={this.state.loadVaultValue || ''}
              />
              <br />
              <div>Vault Address: {this.state.vaultAddress}</div>
              <div>The Current Vault Balance is: {this.state.vaultBalanceEther} ETH</div>
              <RaisedButton label="Load Vault" primary={true} onTouchTap={this.handleLoadVault} />
              {/*<TextField
                floatingLabelText="Last Name"
                onChange={(event, newValue) => this.handleFieldChange('last_name', event, newValue)}
                errorText={!this.state.last_name ? 'Last Name is Required' : null}
                value={this.state.last_name || ''}
              />
              <TextField
                floatingLabelText="Email Address"
                onChange={(event, newValue) => this.handleFieldChange('email', event, newValue)}
                errorText={!this.state.email ? 'Email Address is Required' : null}
                value={this.state.email || ''}
              />
              <TextField
                floatingLabelText="Biography"
                onChange={(event, newValue) => this.handleFieldChange('biography', event, newValue)}
                value={this.state.biography}
              />
              <TextField
                floatingLabelText="Content I'm Creating"
                onChange={(event, newValue) => this.handleFieldChange('content', event, newValue)}
                value={this.state.content}
              />
              <span>Ethereum Address</span>
              <span>{this.props.addresses[0]}</span>
              <RaisedButton label="Save Profile" primary={true} onTouchTap={this.handleSave} />*/}
              <Snackbar
                open={this.state.openSnackbar}
                message={this.state.snackbarMessage}
                autoHideDuration={4000}
                onRequestClose={this.handleRequestClose}
              />
            </InnerContainer>
          </Paper>
          <Paper>
            <InnerContainer>
              <Avatar src="http://lorempixel.com/400/200/" size={150} />
              <div>The Current Address is: {this.state.userAddress}</div>
              <div>The Current User Balance is: {this.state.userBalance}</div>
            </InnerContainer>
          </Paper>
        </Main>
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
