import React, { Component } from 'react'
import styled from 'styled-components'

const Main = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`

class Dasboard extends Component {
  render() {
    return (
      <Main>
        <h1>Dashboard</h1>
      </Main>
    )
  }
}

export default Dasboard
