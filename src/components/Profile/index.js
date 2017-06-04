import React, { Component } from 'react'
import styled from 'styled-components'

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

export default Profile
