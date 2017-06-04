import React, { Component } from 'react'
import styled from 'styled-components'
import { GridList, GridTile } from 'material-ui/GridList'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

const Main = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`

const Container = styled.div`
  width: 500px;
`

const StyledGridList = styled(GridList)`
  width: 100%;
`

const mockUsers = [
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  },
  {
    name: 'Joe Smith',
    tag: 'Artist'
  }
]

class DropDown extends Component {
  constructor(props) {
    super(props)
    this.state = { value: 1 }
  }

  handleChange = (event, index, value) => this.setState({ value })

  render() {
    return (
      <DropDownMenu value={this.state.value} onChange={this.handleChange}>
        <MenuItem value={1} primaryText="Newest" />
        <MenuItem value={2} primaryText="Trending" />
        <MenuItem value={3} primaryText="Top" />
        <MenuItem value={4} primaryText="Search by Interest" />
      </DropDownMenu>
    )
  }
}

class Explore extends Component {
  render() {
    return (
      <Main>
        <Container>
          <DropDown />
          <StyledGridList>
            {mockUsers.map((user, index) => (
              <GridTile key={index} title={user.name} subtitle={user.tag}>
                <img src="avatar.jpeg" alt="user" />
              </GridTile>
            ))}
          </StyledGridList>
        </Container>
      </Main>
    )
  }
}

export default Explore
