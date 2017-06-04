import React, { Component } from 'react'
import NavBar from 'components/NavBar'
import { GridList, GridTile } from 'material-ui/GridList'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  container: {
    // need to figure out how to make this scale for mobile
    width: 500
  },
  gridList: {
    width: '100%'
  }
}

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
      <div style={styles.root}>
        <NavBar />
        <div style={styles.container}>
          <DropDown />
          <GridList style={styles.gridList}>
            {mockUsers.map((user, index) => (
              <GridTile key={index} title={user.name} subtitle={user.tag}>
                <img src="avatar.jpeg" alt="user" />
              </GridTile>
            ))}
          </GridList>
        </div>
      </div>
    )
  }
}

export default Explore
