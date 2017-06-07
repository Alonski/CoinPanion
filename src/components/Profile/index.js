import React, { Component } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { firebase, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers
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
    if (isNaN(parseFloat(this.state.coinAmount))) {
      return false
    } else {
      return true
    }
  }

  handleCoining = () => {
    // PLACEHOLDER FOR LINKING TO CONTRACT FUNCTION
    this.setState({ open: false })
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
        <CardTitle title="Coined by 0 for 0.0 Eth/Month" />
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
            errorText={this.validateCoining() ? null : 'Value must be a number'}
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
      userProfile: {}
    }
  }

  componentDidMount() {
    console.log(this.props.users)
  }

  componentWillReceiveProps({ users }) {
    const userId = this.props.match.params.id
    if (users && users[userId]) {
      const userProfile = users[userId]
      this.setState({
        userExists: true,
        userProfile: userProfile
      })
    }
  }

  render() {
    return (
      <Main>
        {this.state.userExists ? <UserProfile userProfile={this.state.userProfile} /> : <h1>User not found</h1>}
      </Main>
    )
  }
}

const fbWrappedComponent = firebase([{ type: 'once', path: '/users' }])(Profile)
export default connect(({ firebase }) => ({
  users: dataToJS(firebase, 'users')
}))(fbWrappedComponent)
