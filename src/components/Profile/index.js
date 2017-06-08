import React, { Component } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { firebase } from 'react-redux-firebase'
import { Card, CardActions, CardHeader, CardTitle, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'

const Main = styled.div`
  display: flex;
  flexWrap: wrap;
  justify-content: space-around;
`

class UserProfile extends Component {
  state = {
    open: false,
    coinAmount: 0.0
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
    // PLACEHOLDER FOR LINKING TO CONTRACT FUNCTION
    const amount = parseFloat(this.state.coinAmount)
    if (amount <= 0 || !this.props.myAddress || !this.props.userProfile.eth_address) {
      console.error('Invalid inputs.')
      return false
    }
    this.props.firebase.push('coinings', {
      coiner: this.props.myId,
      coinee: this.props.userProfile.id,
      eth_amount: amount
    })
    this.setState({ open: false })
  }

  calculateCoiners() {
    let totalCoinedAmount = this.props.coinings.reduce((ethSum, coining) => ethSum + coining.eth_amount, 0)
    totalCoinedAmount = Math.round(totalCoinedAmount * 10000) / 10000
    const totalCoiners = this.props.coinings.length
    return `Coined by ${totalCoiners} for ${totalCoinedAmount} Eth/Month`
  }

  render() {
    const { userProfile } = this.props
    const actions = [
      <FlatButton label="Cancel" onTouchTap={this.handleClose} />,
      <FlatButton label="Coin!" primary={true} keyboardFocused={true} onTouchTap={this.handleCoining} />
    ]
    return (
      <Card>
        <CardHeader
          avatar={userProfile.photo_url}
          title={`${userProfile.first_name} ${userProfile.last_name}`}
          subtitle={userProfile.category}
        />
        <CardTitle
          title={`About ${userProfile.first_name}`}
          subtitle={`${userProfile.first_name} is creating ${userProfile.content}`}
        />
        <CardText>
          {userProfile.biography}
        </CardText>
        <CardTitle title={this.calculateCoiners()} />
        <CardActions>
          <FlatButton label={`Coin ${userProfile.first_name}`} primary={true} onTouchTap={this.handleOpen} />
        </CardActions>
        <Dialog
          title={`Coin ${userProfile.first_name}`}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          Show your support and subscribe to {userProfile.first_name}!
          <br />
          <TextField
            defaultValue={this.state.coinAmount}
            floatingLabelText="Eth per Month"
            errorText={this.validateCoining() ? null : 'Value must be a positive number'}
            onChange={this.handleCoinAmountChange}
          />
        </Dialog>
      </Card>
    )
  }
}

class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userExists: false,
      userProfile: {},
      coinings: [],
      myAddress: ''
    }
  }

  componentWillReceiveProps({ addresses }) {
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
              myId: myProfile.id
            })
          }
        })
    }
  }

  componentWillMount() {
    const userId = this.props.match.params.id
    this.props.firebase.database().ref().child('users').orderByChild('id').equalTo(userId).once('value', snap => {
      if (snap.val()) {
        const userProfile = Object.values(snap.val())[0] // only 1 value should exist for an id
        this.props.firebase
          .database()
          .ref()
          .child('coinings')
          .orderByChild('coinee')
          .equalTo(userProfile.id)
          .on('value', snap => {
            let coinings
            if (snap.val()) {
              coinings = Object.values(snap.val())
            }
            this.setState({
              userExists: true,
              userProfile: userProfile,
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
          ? <UserProfile
              userProfile={this.state.userProfile}
              coinings={this.state.coinings}
              firebase={this.props.firebase}
              myAddress={this.state.myAddress}
              myId={this.state.myId}
            />
          : <h1>User not found</h1>}
      </Main>
    )
  }
}

const fbWrappedComponent = firebase()(Profile)
export default connect()(fbWrappedComponent)
