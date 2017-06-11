import React, { Component } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

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

const period = ['Days', 'Weeks', 'Months']

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
      coinedByMe: [],
      selectedPeriod: 'Days',
      coinSomeoneAddress: '0x0',
      subscriptionDelay: 0,
      coinSomeoneValue: 0,
      testAccount: 0
    }
  }

  handleInitVault = () => {
    const { vault, id } = this.state
    const web3 = this.state.web3
    const userAddress = this.state.userAddress
    const self = this
    // initialize vault
    var vaultInstance
    vault
      .new(userAddress, userAddress, 0, 0, userAddress, 0, { from: userAddress })
      .then(function(instance) {
        vaultInstance = instance
        firebase.database().ref(`users/${id}`).update({ vault_address: vaultInstance.address })
        vaultInstance.authorizeSpender(userAddress, true, { from: userAddress })
      })
      .then(function(result) {
        return web3.eth.getBalance(vaultInstance.address, web3.eth.defaultBlock, (error, result) => {
          self.setState({
            vaultBalance: result.toNumber(),
            vaultBalanceEther: web3.fromWei(result, 'ether').toString(),
            vaultAddress: vaultInstance.address
          })
        })
        // return vaultInstance.numberOfAuthorizedPayments.call(accounts[0])
      })
  }

  componentWillReceiveProps(nextProps) {
    const { web3 } = nextProps
    if (this.props.web3.currentProvider !== web3.currentProvider) {
      this.initDapp(web3)
    }
  }

  initDapp = web3 => {
    const provider = web3.currentProvider
    web3.version.getNetwork((err, netId) => {
      switch (netId) {
        case '1':
          console.log('This is mainnet')
          break
        case '2':
          console.log('This is the deprecated Morden test network.')
          break
        case '3':
          console.log('This is the ropsten test network.')
          break
        default:
          console.log('This is an unknown network.')
      }
    })
    console.log(web3.eth.accounts)
    const myAddress = web3.eth.accounts[0]
    const databaseRefUsers = firebase.database().ref().child('users')
    const usersRef = querybase.ref(databaseRefUsers, [])
    if (myAddress) {
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

    const contract = require('truffle-contract')
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    // So we can update state later.
    var self = this

    const vault = contract(VaultContract)
    vault.setProvider(provider)

    window.vaulty = vault

    self.setState({ web3: web3, vault: vault })

    // Declaring this for later so we can chain functions on vaultInstance.
    var vaultInstance
    let userAddress
    // Get accounts.
    web3.eth.getAccounts(function(error, accounts) {
      // console.log(accounts)
      userAddress = accounts[self.state.testAccount]
      web3.eth.getBalance(userAddress, web3.eth.defaultBlock, (error, result) => {
        self.setState({
          userAddress: userAddress,
          userBalance: result.toString(),
          userBalanceEther: web3.fromWei(result, 'ether').toString()
        })
      })
      usersRef.where({ eth_address: accounts[0] }).once('value').then(function(userSnap) {
        if (userSnap && userSnap.val()) {
          const [myProfile] = Object.values(userSnap.val())
          const { vault_address } = myProfile
          if (vault_address) {
            web3.eth.getBalance(vault_address, web3.eth.defaultBlock, (error, result) => {
              self.setState({
                vaultBalance: result.toNumber(),
                vaultBalanceEther: web3.fromWei(result, 'ether').toString(),
                vaultAddress: vault_address
              })
            })

            vault
              .at(vault_address)
              // .new(userAddress, userAddress, 0, 0, userAddress, 0)
              .then(function(instance) {
                console.log(vaultInstance)
                console.log(
                  `Need to save vaultInstance Address ${instance.address} to DB connected with ${userAddress}`
                )
                vaultInstance = instance
                window.vaultInstancey = vaultInstance
                vaultInstance.authorizeSpender(userAddress, true, { from: userAddress })
                console.log('After AuthorizeSpender')
              })
              .then(function(result) {
                console.log('After AuthorizeSpenderResult')
                return web3.eth.getBalance(vaultInstance.address, web3.eth.defaultBlock, (error, result) => {
                  self.setState({
                    vaultBalance: result.toNumber(),
                    vaultBalanceEther: web3.fromWei(result, 'ether').toString(),
                    vaultAddress: vaultInstance.address
                  })
                })
                // return vaultInstance.numberOfAuthorizedPayments.call(accounts[0])
              })
          }
        } else {
          self.context.router.history.push('/editprofile')
        }
      })
    })
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
      loadVaultValue = this.state.loadVaultValue,
      vaultAddress = this.state.vaultAddress
    let vaultInstance,
      self = this
    if (Number(loadVaultValue) > Number(userBalance)) {
      console.log('Not enough Ether!')
      self.setState({ openSnackbar: true, snackbarMessage: 'Error: Not enough Ether!', loadVaultValue: 0 })
      return
    }
    vault
      .at(vaultAddress)
      .then(function(instance) {
        vaultInstance = instance
        return vaultInstance.receiveEther({ from: userAddress, value: loadVaultValue })
      })
      .then(function(result) {
        _waitForTxToBeMined(web3, result.tx)
        console.log('Mined TX:', result.tx)

        web3.eth.getBalance(vaultInstance.address, web3.eth.defaultBlock, (error, result) => {
          console.log('Contract Balance:', result.toNumber())

          self.setState({
            vaultBalance: result.toNumber(),
            vaultBalanceEther: web3.fromWei(result, 'ether').toString()
          })
        })

        web3.eth.getBalance(userAddress, web3.eth.defaultBlock, (error, result) => {
          console.log('Address Balance:', result.toString())

          self.setState({
            userBalance: result.toString().toString()
          })
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
              {vaultAddress !== '0x0'
                ? <List>
                    <ListItem secondaryText="Vault address" primaryText={vaultAddress} leftIcon={<AccountIcon />} />
                    <ListItem secondaryText="Vault balance" primaryText={vaultBalanceEther} leftIcon={<WalletIcon />} />
                  </List>
                : <RaisedButton label="Initialize Vault" primary={true} onTouchTap={this.handleInitVault} />}
              <Divider inset={true} />
            </InnerContainer>
            {vaultAddress !== '0x0'
              ? <InnerContainer>
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
              : <div />}
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

Dasboard.contextTypes = {
  router: PropTypes.any
}

export default Dasboard

async function _waitForTxToBeMined(web3, txHash) {
  let txReceipt
  while (!txReceipt) {
    try {
      txReceipt = await web3.eth.getTransactionReceipt(txHash, web3.eth.defaultBlock, result => {
        console.log(result)
      })
    } catch (err) {
      return console.log(err)
    }
  }
  console.log(txReceipt)
}
