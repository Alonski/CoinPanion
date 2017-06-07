import React, { Component } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { firebase, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers
import { Card, CardActions, CardHeader, CardTitle, CardText } from 'material-ui/Card'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'

const Main = styled.div`
  display: flex;
  flexWrap: wrap;
  justify-content: space-around;
`

class UserProfile extends Component {
  state = {
    open: false
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render() {
    const { userProfile } = this.props
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
          <FlatButton label={`Coin ${userProfile.first_name}`} primary={true} />
        </CardActions>
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
