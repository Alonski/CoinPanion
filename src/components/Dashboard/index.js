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
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import CoinedList from './CoinedList'

import VaultContract from '../../../build/contracts/Vault.json'
import Conf from '../../../truffle.js'
import Web3 from 'web3'
import firebase from 'firebase'

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

const showChangeTestAccount = false

// This needs to be saved into the DB for each user.
// If a user does not have a VaultAddress then it needs to be created by the user
// Should this be a button to create Vault or just Create Vault when the page loads?
// Creating a vault like this: Vault.deployed(userAddress, userAddress, 0, 0, userAddress, 0)
const testVaultAddress = '0x55553c198d65fbff3b5cad1b71ada0b291eaf7af'

class Dasboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      vaultBalance: 0,
      vaultBalanceEther: 0,
      loadVaultValue: 0,
      vaultAddress: '0x0',
      userBalance: 0,
      userBalanceEther: 0,
      userAddress: '0x0',
      photo_url: null,
      web3: '',
      vault: '',
      openSnackbar: false,
      snackbarMessage: '',
      pristine: true,
      first_name: '',
      last_name: '',
      selectedPeriod: 'Days',
      coinSomeoneAddress: '0x0',
      subscriptionDelay: 0,
      coinSomeoneValue: 0,
      testAccount: 0
    }
  }

  // componentDidMount() {
  //   const { web3 } = this.props
  //   this.initDapp(web3)
  // }

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
    if (myAddress) {
      firebase.database().ref().child('users').orderByChild('eth_address').equalTo(myAddress).on('value', snap => {
        if (snap.val()) {
          const myProfile = Object.values(snap.val())[0] // only 1 value should exist for an eth address
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
      console.log(`Need to use saved vaultInstance Address here instead of testVaultAddress`)
      if (!vault.isDeployed()) {
        vault
          .at(testVaultAddress)
          // .deployed(userAddress, userAddress, 0, 0, userAddress, 0)
          .then(function(instance) {
            // console.log(vaultInstance)
            console.log(`Need to save vaultInstance Address ${instance.address} to DB connected with ${userAddress}`)
            vaultInstance = instance
            window.vaultInstancey = vaultInstance
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
      } else {
        vault
          .at(testVaultAddress)
          .then(function(instance) {
            vaultInstance = instance
            return web3.eth.getBalance(vaultInstance.address)
            // return vaultInstance.numberOfAuthorizedPayments.call(accounts[0])
          })
          .then(function(result) {
            console.log(`User: ${userAddress} - UserVault: ${result.toString()}`)
            self.setState({
              vaultBalance: result.toString(),
              vaultBalanceEther: web3.fromWei(result, 'ether').toString(),
              vaultAddress: vaultInstance.address
            })
            console.log(result.toString())
          })
      }
    })
  }

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
    if (Number(loadVaultValue) > Number(userBalance)) {
      console.log('Not enough Ether!')
      self.setState({ openSnackbar: true, snackbarMessage: 'Error: Not enough Ether!', loadVaultValue: 0 })
      return
    }
    vault
      .at(testVaultAddress)
      .then(function(instance) {
        vaultInstance = instance
        return vaultInstance.receiveEther({ from: userAddress, value: loadVaultValue, gasPrice: 5000000000 })
      })
      .then(function(result) {
        _waitForTxToBeMined(web3, result.tx)
        console.log('Mined TX:', result.tx)
        console.log(`User: ${userAddress} - UserVault: ${vaultInstance.address}`)

        console.log('Full Vault Balance:', web3.eth.getBalance(vaultInstance.address).toString())
        console.log('Address Balance:', web3.eth.getBalance(userAddress).toString())
        self.setState({
          vaultBalance: web3.eth.getBalance(vaultInstance.address).toString(),
          vaultBalanceEther: web3.fromWei(web3.eth.getBalance(vaultInstance.address).toString(), 'ether').toString(),
          userBalance: web3.eth.getBalance(userAddress).toString(),
          userBalanceEther: web3.fromWei(web3.eth.getBalance(userAddress), 'ether').toString()
        })
        self.setState({ openSnackbar: true, snackbarMessage: `Vault loaded with ${loadVaultValue} WEI` })
      })
  }

  handleRequestClose = event => {
    this.setState({ openSnackbar: false })
  }

  handlePeriodChange = (event, index, value) => {
    this.setState({ selectedPeriod: value })
  }

  handleCoinSomeone = event => {
    const vault = this.state.vault,
      web3 = this.state.web3,
      userAddress = this.state.userAddress,
      // userBalance = this.state.userBalance,
      coinSomeoneValue = this.state.coinSomeoneValue,
      coinSomeoneAddress = this.state.coinSomeoneAddress,
      vaultBalance = this.state.vaultBalance,
      // vaultAddress = this.state.vaultAddress,
      subscriptionDelay = this.state.subscriptionDelay
    let vaultInstance,
      self = this,
      idPayment
    if (Number(coinSomeoneValue) > Number(vaultBalance)) {
      console.log('Not enough Ether!')
      self.setState({ openSnackbar: true, snackbarMessage: 'Error: Not enough Ether!', loadVaultValue: 0 })
      return
    }
    vault
      .at(testVaultAddress)
      .then(function(instance) {
        vaultInstance = instance
        return vaultInstance.authorizePayment(
          'alon',
          coinSomeoneAddress,
          Number(coinSomeoneValue),
          Number(subscriptionDelay),
          {
            from: userAddress,
            gas: 500000
          }
        )
        //   return vaultInstance.sendPayment(coinSomeoneAddress, Number(coinSomeoneValue), {
        //     from: userAddress
        //   })
      })
      .then(function(result) {
        _waitForTxToBeMined(web3, result.tx)
        console.log('Mined TX:', result.tx)
        console.log(('Result', result))
        idPayment = result.logs[0].args.idPayment.toString() // Could save
        self.setState({
          openSnackbar: true,
          snackbarMessage: `ID: ${idPayment} Coined ${coinSomeoneAddress} with ${coinSomeoneValue} WEI`
        })
        return web3.eth.getBalance(vaultInstance.address)
      })
      .then(function(result) {
        console.log(`User: ${userAddress} - UserVault: ${result.toString()}`)

        console.log('Full Vault Balance:', web3.eth.getBalance(vaultInstance.address).toString())
        console.log('Vault Balance:', result.toString())
        console.log('Address Balance:', web3.eth.getBalance(userAddress).toString())
        self.setState({
          vaultBalance: result.toString(),
          vaultBalanceEther: web3.fromWei(result, 'ether').toString(),
          userBalance: web3.eth.getBalance(userAddress).toString(),
          userBalanceEther: web3.fromWei(web3.eth.getBalance(userAddress), 'ether').toString()
        })
      })
  }

  handleTestAccountChanged = value => {
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
    const web3 = new Web3(provider)

    self.setState({ web3: web3, vault: vault })

    let vaultInstance, userAddress, userBalance

    this.setState({ testAccount: value })

    web3.eth.getAccounts(function(error, accounts) {
      userAddress = accounts[self.state.testAccount]
      userBalance = web3.eth.getBalance(userAddress).toString()
      console.log(userAddress)
      self.setState({ userAddress: userAddress, userBalance: userBalance })
      vault
        .at(testVaultAddress)
        .then(function(instance) {
          vaultInstance = instance
          return web3.eth.getBalance(vaultInstance.address)
        })
        .then(function(result) {
          console.log(`User: ${userAddress} - UserVault: ${result.toString()}`)

          console.log('Full Vault Balance:', web3.eth.getBalance(vaultInstance.address).toString())
          console.log('Vault Balance:', result.toString())
          console.log('Address Balance:', web3.eth.getBalance(userAddress).toString())
          self.setState({
            vaultBalance: result.toString(),
            vaultBalanceEther: web3.fromWei(result, 'ether').toString(),
            userBalance: web3.eth.getBalance(userAddress).toString()
          })
          self.setState({ openSnackbar: true, snackbarMessage: `Test Account Changed to: ${value}` })
        })
    })
  }

  render() {
    const {
      photo_url,
      userAddress,
      userBalanceEther,
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
        {showChangeTestAccount
          ? <Paper>
              <InnerContainer>
                <span>Change Test Account</span>
                <TextField
                  floatingLabelText="Account Number"
                  type="number"
                  onChange={(event, newValue) => this.handleTestAccountChanged(newValue)}
                  errorText={
                    this.state.testAccount < 0 || this.state.testAccount > 10 ? 'Incorrect Test Account' : null
                  }
                  value={this.state.testAccount || 0}
                />
              </InnerContainer>
            </Paper>
          : <span />}
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
                <ListItem secondaryText="Your balance" primaryText={userBalanceEther} leftIcon={<WalletIcon />} />
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
              <span>Coin Someone</span>
              <TextField
                floatingLabelText="Amount to Send in WEI"
                type="number"
                onChange={(event, newValue) => this.handleFieldChange('coinSomeoneValue', event, newValue)}
                errorText={!this.state.coinSomeoneValue ? 'Value is Required' : null}
                value={this.state.coinSomeoneValue || ''}
              />
              <TextField
                floatingLabelText="Address to Subscribe to"
                type="text"
                onChange={(event, newValue) => this.handleFieldChange('coinSomeoneAddress', event, newValue)}
                errorText={
                  !this.state.coinSomeoneAddress || this.state.coinSomeoneAddress === '0x0'
                    ? 'Address is Required'
                    : null
                }
                value={this.state.coinSomeoneAddress || ''}
              />
              <TextField
                floatingLabelText={`Send every ${this.state.subscriptionDelay} ${this.state.selectedPeriod}`}
                type="number"
                onChange={(event, newValue) => this.handleFieldChange('subscriptionDelay', event, newValue)}
                errorText={!this.state.subscriptionDelay ? 'Value is Required' : null}
                value={this.state.subscriptionDelay || ''}
              />
              <SelectField
                floatingLabelText="Period"
                value={this.state.selectedPeriod}
                onChange={this.handlePeriodChange}
                maxHeight={200}
              >
                {period.map((period, index) => <MenuItem key={index} value={period} primaryText={period} />)}
              </SelectField>
              <RaisedButton label="Coin Someone" primary={true} onTouchTap={this.handleCoinSomeone} />
              <Snackbar
                open={this.state.openSnackbar}
                message={this.state.snackbarMessage}
                autoHideDuration={4000}
                onRequestClose={this.handleRequestClose}
              />
            </InnerContainer>
          </StyledPaper>
        </Main>

        <Main>
          <StyledPaper>
            <InnerContainer>
              <CoinedList title="Coined By: 4 CoinPanions" photo_url="http://lorempixel.com/400/200/" />
            </InnerContainer>
          </StyledPaper>
          <StyledPaper>
            <InnerContainer>
              <CoinedList title="You Coined: 4 CoinPanions" photo_url="http://lorempixel.com/400/200/" />
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
