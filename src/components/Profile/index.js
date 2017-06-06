import React, { Component } from 'react'
import styled from 'styled-components'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const Main = styled.div`
  display: flex;
  flexWrap: wrap;
  justify-content: space-around;
`

class Profile extends Component {
  render() {
    return (
      <Main>
        <h1>Profile</h1>
        <ul>
          {this.props.addresses.map(address => <li key={address}>{address}</li>)}
        </ul>
      </Main>
    )
  }
}

Profile.defaultProps = {
  addresses: []
}

export default Profile
