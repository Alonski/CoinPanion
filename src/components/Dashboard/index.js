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

// import VaultContract from '../../../build/contracts/Vault.json'
// import Conf from '../../../truffle.js'
// import Web3 from 'web3'
import firebase from 'firebase'
// import * as querybase from 'querybase'

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

// const period = ['Days', 'Weeks', 'Months']

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
    const { user: { id } } = this.props
    const userAddress = this.props.userAddress
    // initialize vault
    this.props.initVault(userAddress, id)
  }

  handleFieldChange = (stateKey, event, newValue) => {
    const obj = {}
    obj[stateKey] = newValue // so key can be programatically assigned
    obj.pristine = false
    this.setState(obj)
  }

  handleLoadVault = event => {
    const { web3, userBalance } = this.props
    const { loadVaultValue } = this.state
    console.log('Loading', web3.fromWei(loadVaultValue, 'ether'))
    if (Number(web3.fromWei(loadVaultValue, 'ether')) > Number(userBalance)) {
      console.log('Not enough Ether!')
      this.setState({ openSnackbar: true, snackbarMessage: 'Error: Not enough Ether!', loadVaultValue: 0 })
      return
    }
    this.props.loadVault(loadVaultValue)
    this.setState({ openSnackbar: true, snackbarMessage: `Vault loaded with ${loadVaultValue} WEI` })
  }

  handleRequestClose = event => {
    this.setState({ openSnackbar: false })
  }

  render() {
    const { loadVaultValue, openSnackbar, snackbarMessage, pristine } = this.state
    const { photo_url, first_name = '' } = this.props.user
    const { userAddress, userBalance, contract: { address: vaultAddress }, contractBalance } = this.props
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
              {vaultAddress && vaultAddress !== '0x0'
                ? <List>
                    <ListItem secondaryText="Vault address" primaryText={vaultAddress} leftIcon={<AccountIcon />} />
                    <ListItem secondaryText="Vault balance" primaryText={contractBalance} leftIcon={<WalletIcon />} />
                  </List>
                : <RaisedButton label="Initialize Vault" primary={true} onTouchTap={this.handleInitVault} />}
              <Divider inset={true} />
            </InnerContainer>
            {vaultAddress && vaultAddress !== '0x0'
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
