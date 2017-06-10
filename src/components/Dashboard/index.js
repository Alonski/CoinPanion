import React, { Component } from 'react'
import styled from 'styled-components'

import { List, ListItem } from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Snackbar from 'material-ui/Snackbar'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import AccountIcon from 'material-ui/svg-icons/action/account-balance'
import WalletIcon from 'material-ui/svg-icons/action/account-balance-wallet'

import CoinedByList from './CoinedByList'

import VaultContract from '../../../build/contracts/Vault.json'
import Conf from '../../../truffle.js'
import Web3 from 'web3'
import firebase from 'firebase'
import * as querybase from 'querybase'

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

const StyledPaper = styled(Paper)`
  margin-bottom: 20px;
  padding-bottom: 10px;
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
      photo_url: null,
      web3: '',
      vault: '',
      openSnackbar: false,
      snackbarMessage: '',
      pristine: true,
      first_name: '',
      last_name: '',
      coinedBy: [],
      coinedByMe: []
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
    const vault = contract(VaultContract)
    vault.setProvider(provider)

    // Get Web3 so we can get our accounts.
    const web3RPC = new Web3(provider)

    self.setState({ web3: web3RPC, vault: vault })

    // Declaring this for later so we can chain functions on SimpleStorage.
    // var simpleStorageInstance
    var vaultInstance

    // Get accounts.
    const databaseRefUsers = firebase.database().ref().child('users')
    const usersRef = querybase.ref(databaseRefUsers, [])
    web3RPC.eth.getAccounts(function(error, accounts) {
      console.log(accounts)
      self.setState({ userAddress: accounts[0], userBalance: web3RPC.eth.getBalance(accounts[0]).toString() })
      usersRef.where({ eth_address: accounts[0] }).once('value').then(function(userSnap) {
        if (userSnap && userSnap.val()) {
          const [myProfile] = Object.values(userSnap.val())
          const { id, vault_address } = myProfile
          if (!vault_address) {
            // initialize vault
            vault.deployed().then(function(instance) {
              vaultInstance = instance
              self.setState({
                vaultBalance: web3RPC.eth.getBalance(vaultInstance.address).toString(),
                vaultBalanceEther: web3RPC.fromWei(web3RPC.eth.getBalance(vaultInstance.address).toString(), 'ether'),
                vaultAddress: vaultInstance.address
              })
              firebase.database().ref(`users/${id}`).update({ vault_address: self.state.vaultAddress })
              // return vaultInstance.numberOfAuthorizedPayments.call(accounts[0])
            })
          } else {
            self.setState({
              vaultBalance: web3RPC.eth.getBalance(vault_address).toString(),
              vaultBalanceEther: web3RPC.fromWei(web3RPC.eth.getBalance(vault_address).toString(), 'ether'),
              vaultAddress: vault_address
            })
          }
        }
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

  componentWillReceiveProps(nextProps) {
    const myAddress = nextProps.addresses[0]
    if (myAddress) {
      const databaseRefUsers = firebase.database().ref().child('users')
      const usersRef = querybase.ref(databaseRefUsers, [])
      const databaseRefCoinings = firebase.database().ref().child('coinings')
      const coiningsRef = querybase.ref(databaseRefCoinings, [])
      const coineeIsMe = {}
      const coinerIsMe = {}
      // find all user's coinings and join with coiners
      // coining = { coiner: <User object> }
      usersRef
        .where({ eth_address: myAddress })
        .once('value')
        .then(userSnap => {
          if (userSnap && userSnap.val()) {
            const myProfile = Object.values(userSnap.val())[0] // only 1 value should exist for an eth address
            this.setState({
              first_name: myProfile.first_name,
              last_name: myProfile.last_name,
              email: myProfile.email,
              category: myProfile.category || this.state.category,
              content: myProfile.content,
              biography: myProfile.biography,
              photo_url: myProfile.photo_url,
              id: myProfile.id
            })
            const coineeIsMe = coiningsRef.where({ coinee: myProfile.id }).once('value')
            const coinerIsMe = coiningsRef.where({ coiner: myProfile.id }).once('value')
            return Promise.all([coineeIsMe, coinerIsMe])
          }
        })
        .then(([coineeIsMeSnap, coinerIsMeSnap]) => {
          if (coineeIsMeSnap && coineeIsMeSnap.val()) {
            const usersPromises = Object.values(coineeIsMeSnap.val()).map(coining => {
              // key by coiner to allow join
              coineeIsMe[coining.coiner] = coining
              return usersRef.where({ id: coining.coiner }).once('value')
            })
            Promise.all(usersPromises).then(usersSnaps => {
              if (usersSnaps) {
                usersSnaps.forEach(snap => {
                  const [user] = Object.values(snap.val())
                  if (coineeIsMe[user.id]) {
                    coineeIsMe[user.id].coiner = user
                  }
                })
                this.setState({
                  coinedBy: Object.values(coineeIsMe)
                })
              }
            })
          }

          if (coinerIsMeSnap && coinerIsMeSnap.val()) {
            const usersPromises = Object.values(coinerIsMeSnap.val()).map(coining => {
              // key by coinee to allow join
              coinerIsMe[coining.coinee] = coining
              return usersRef.where({ id: coining.coinee }).once('value')
            })
            Promise.all(usersPromises).then(usersSnaps => {
              if (usersSnaps) {
                usersSnaps.forEach(snap => {
                  const [user] = Object.values(snap.val())
                  if (coinerIsMe[user.id]) {
                    coinerIsMe[user.id].coinee = user
                  }
                })
                this.setState({
                  coinedByMe: Object.values(coinerIsMe)
                })
              }
            })
          }
        })
    }
  }

  componentWillMount() {}

  handleFieldChange = (stateKey, event, newValue) => {
    const obj = {}
    obj[stateKey] = newValue // so key can be programatically assigned
    obj.pristine = false
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
    const {
      photo_url,
      userAddress,
      userBalance,
      vaultAddress,
      vaultBalanceEther,
      loadVaultValue,
      openSnackbar,
      snackbarMessage,
      pristine,
      first_name
    } = this.state
    return (
      <div>
        <Main>
          <h1>Dashboard</h1>
        </Main>
        <Main>
          <StyledPaper>
            <InnerContainer>
              {photo_url
                ? <Avatar src={photo_url} size={150} />
                : <Avatar size={150}>{first_name.split('')[0]}</Avatar>}
              <List>
                <ListItem
                  onClick={() => document.execCommand('copy')}
                  secondaryText="Your address"
                  primaryText={userAddress}
                  leftIcon={<AccountIcon />}
                />
                <ListItem secondaryText="Your balance" primaryText={userBalance} leftIcon={<WalletIcon />} />
              </List>
              <Divider inset={true} />
              <List>
                <ListItem secondaryText="Vault address" primaryText={vaultAddress} leftIcon={<AccountIcon />} />
                <ListItem secondaryText="Vault balance" primaryText={vaultBalanceEther} leftIcon={<WalletIcon />} />
              </List>
            </InnerContainer>
            <InnerContainer>
              <i>Load Vault</i>
              <TextField
                floatingLabelText="Amount to Load in WEI"
                type="number"
                onChange={(event, newValue) => this.handleFieldChange('loadVaultValue', event, newValue)}
                errorText={!loadVaultValue && !pristine ? 'Value is Required' : null}
                value={loadVaultValue || ''}
              />
              <br />
              <RaisedButton label="Load Vault" primary={true} onTouchTap={this.handleLoadVault} />
              <Snackbar
                open={openSnackbar}
                message={snackbarMessage}
                autoHideDuration={4000}
                onRequestClose={this.handleRequestClose}
              />
            </InnerContainer>
          </StyledPaper>
        </Main>
        <br />
        <Main>
          <StyledPaper>
            <InnerContainer>
              <CoinedByList coinedBy={this.state.coinedBy} coinedByMe={this.state.coinedByMe} />
            </InnerContainer>
          </StyledPaper>
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
