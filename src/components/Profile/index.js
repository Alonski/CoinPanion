import React, { Component } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { firebase } from 'react-redux-firebase'
import { Card, CardActions, CardHeader, CardTitle, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import Snackbar from 'material-ui/Snackbar'
import VaultContract from '../../../build/contracts/Vault.json'
import Web3 from 'web3'
import Conf from '../../../truffle.js'

const Main = styled.div`
  display: flex;
  flexWrap: wrap;
  justify-content: space-around;
`

const Container = styled.div`
  flex-direction: column;
  max-width: 80%;
`

class UserProfile extends Component {
  state = {
    open: false,
    coinAmount: 0.0,
    imSubscribed: '',
    snackbarOpen: false
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  handleCoinAmountChange = (e, newValue) => {
    this.setState({ coinAmount: newValue })
  }

  validateCoining() {
    const amount = parseFloat(this.state.coinAmount)
    if (isNaN(amount) || amount < 0) {
      return false
    } else {
      return true
    }
  }

  handleCoining = () => {
    const amount = parseFloat(this.state.coinAmount)
    if (amount <= 0 || !this.props.myProfile.eth_address || !this.props.userProfile.eth_address) {
      console.error(
        `Invalid inputs: this.props.myProfile.eth_address=${this.props.myProfile
          .eth_address}, this.props.userProfile.eth_address=${this.props.userProfile.eth_address}`
      )
      return false
    }

    if (this.props.myProfile.vault_address) {
      const { myProfile, userProfile } = this.props

      var { host, port } = Conf.networks[process.env.NODE_ENV]
      const provider = new Web3.providers.HttpProvider('http://' + host + ':' + port)
      const vaultAddress = myProfile.vault_address
      const contract = require('truffle-contract')
      const vault = contract(VaultContract)
      vault.setProvider(provider)
      const vaultInstance = vault.at(vaultAddress)
      const subscriptionDelay = 60 * 60 * 24 * 30 // fix to every 30 days payment for now

      if (this.state.imSubscribed) {
        // figure out how to update authorizedPayment
        // update coining
        // this.props.firebase.update(`coinings/${this.state.imSubscribed}`, { eth_amount: amount })
        console.error('Cannot update coining amount for already subscribed.')
      } else {
        console.log(
          `${myProfile.first_name} ${myProfile.last_name} paid ${userProfile.first_name} ${userProfile.last_name}`,
          null,
          userProfile.eth_address,
          Number(amount),
          Number(subscriptionDelay),
          { from: myProfile.eth_address, gas: 500000 }
        )
        const paymentId = vaultInstance
          .authorizePayment(
            `${myProfile.first_name} ${myProfile.last_name} paid ${userProfile.first_name} ${userProfile.last_name}`,
            null,
            userProfile.eth_address,
            Number(amount),
            Number(subscriptionDelay),
            { from: myProfile.eth_address, gas: 500000 }
          )
          .then(result => {
            // add new coining
            this.props.firebase.push('coinings', {
              payment_id: paymentId,
              coiner_vault_address: vaultAddress,
              coiner: myProfile.id,
              coinee: userProfile.id,
              eth_amount: amount,
              payout_timestamp_ms: Date.now() + subscriptionDelay * 1000 // convert seconds to ms
            })

            // find event in logs
            for (var i = 0; i < result.logs.length; i++) {
              var log = result.logs[i]
              if (log.event === 'PaymentAuthorized') {
                // We found the event!
                console.log(log)
                break
              }
            }
          })
          .catch(function(err) {
            console.error(err)
            this.setState({
              snackbarOpen: true,
              snackbarMessage: 'Error Coining user'
            })
          })
      }
      this.setState({ open: false })
    } else {
      this.setState({
        snackbarOpen: true,
        snackbarMessage: 'Could not find vault, please visit Dashboard'
      })
    }
  }

  handleUnsubscribe = () => {
    if (this.state.imSubscribed) {
      this.props.firebase.remove(`coinings/${this.state.imSubscribed}`)
    }
  }

  calculateCoiners() {
    const coinings = this.props.coinings || {}
    let totalCoinedAmount = Object.values(coinings).reduce((ethSum, coining) => ethSum + coining.eth_amount, 0)
    totalCoinedAmount = Math.round(totalCoinedAmount * 10000) / 10000
    const totalCoiners = Object.keys(coinings).length
    return `Coined by ${totalCoiners} for ${totalCoinedAmount} Eth/Month`
  }

  componentWillMount() {
    const myCoiningKey = Object.keys(this.props.coinings).find(
      coiningKey => this.props.coinings[coiningKey].coiner === this.props.myProfile.id
    )
    if (myCoiningKey) {
      this.setState({ imSubscribed: myCoiningKey, coinAmount: this.props.coinings[myCoiningKey].eth_amount })
    }
  }

  handleRequestClose = () => {
    this.setState({
      snackbarOpen: false
    })
  }

  render() {
    const { userProfile } = this.props
    const actions = [
      <FlatButton label="Cancel" onTouchTap={this.handleClose} />,
      <FlatButton
        label={this.state.imSubscribed ? 'Update Coining' : 'Coin!'}
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleCoining}
      />
    ]
    if (this.state.imSubscribed) {
      actions.splice(1, 0, <FlatButton label="Unsubscribe" onTouchTap={this.handleUnsubscribe} />)
    }
    return (
      <Card>
        <CardHeader
          avatar={userProfile.photo_url}
          title={`${userProfile.first_name} ${userProfile.last_name}`}
          subtitle={userProfile.category}
        />
        <CardTitle
          title={`About ${userProfile.first_name}`}
          subtitle={userProfile.content ? `${userProfile.first_name} is creating ${userProfile.content}` : ''}
        />
        <CardText>
          {userProfile.biography}
        </CardText>
        <CardTitle title={this.calculateCoiners()} />
        <CardActions>
          <FlatButton
            label={this.state.imSubscribed ? `Update Coining` : `Coin ${userProfile.first_name}`}
            primary={true}
            onTouchTap={this.handleOpen}
          />
        </CardActions>
        <Dialog
          title={`Coin ${userProfile.first_name}`}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          {this.state.imSubscribed
            ? `Thanks for supporting ${userProfile.first_name}!`
            : `Show your support and subscribe to ${userProfile.first_name}!`}
          <br />
          <TextField
            defaultValue={this.state.coinAmount}
            floatingLabelText="Eth per Month"
            errorText={this.validateCoining() ? null : 'Value must be a positive number'}
            onChange={this.handleCoinAmountChange}
          />
        </Dialog>
        <Snackbar
          open={this.state.snackbarOpen}
          message={this.state.snackbarMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleRequestClose}
        />
      </Card>
    )
  }
}

class Profile extends Component {
  state = {
    userExists: false,
    userProfile: {},
    coinings: {},
    myProfile: {},
    myAddress: ''
  }

  componentWillReceiveProps(nextProps) {
    const { addresses } = nextProps
    this.getUser(nextProps.match.params.id)
    if (addresses && addresses[0]) {
      this.setState({ myAddress: addresses[0] })
      this.props.firebase
        .database()
        .ref()
        .child('users')
        .orderByChild('eth_address')
        .equalTo(addresses[0])
        .once('value', snap => {
          if (snap.val()) {
            const myProfile = Object.values(snap.val())[0] // only 1 value should exist for an eth address
            this.setState({
              myProfile: myProfile
            })
          }
        })
    }
  }

  componentWillMount() {
    this.getUser(this.props.match.params.id)
  }

  getUser = id => {
    this.props.firebase.database().ref().child('users').orderByChild('id').equalTo(id).once('value', snap => {
      if (snap.val()) {
        const userProfile = Object.values(snap.val())[0] // only 1 value should exist for an id
        this.setState({
          userExists: true,
          userProfile: userProfile
        })
        // find associated coinings
        this.props.firebase
          .database()
          .ref()
          .child('coinings')
          .orderByChild('coinee')
          .equalTo(userProfile.id)
          .on('value', snap => {
            let coinings
            if (snap.val()) {
              coinings = snap.val()
            }
            this.setState({
              coinings: coinings
            })
          })
      }
    })
  }

  render() {
    return (
      <Main>
        {this.state.userExists
          ? <Container>
              <UserProfile
                userProfile={this.state.userProfile}
                coinings={this.state.coinings}
                firebase={this.props.firebase}
                myProfile={this.state.myProfile}
              />
            </Container>
          : <h1>User not found</h1>}
      </Main>
    )
  }
}

const fbWrappedComponent = firebase()(Profile)
export default connect()(fbWrappedComponent)
