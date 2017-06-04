import React, { Component } from 'react'
import * as firebase from 'firebase'
import PropTypes from 'prop-types'

import AppBar from 'material-ui/AppBar'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import { white } from 'material-ui/styles/colors'

const Menu = (props, context) => (
  <IconMenu
    iconButtonElement={<IconButton><NavigationMenu color={white} /></IconButton>}
    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
    onItemTouchTap={(e, c) => context.router.history.push(c.props.data)}
  >
    <MenuItem data="/explore" primaryText="Explore" />
    <MenuItem data="/dashboard" primaryText="Dashboard" />
    <MenuItem data="/profile" primaryText="Profile" />
    <MenuItem data="/about" primaryText="About" />
  </IconMenu>
)

Menu.muiName = 'IconMenu'
Menu.contextTypes = {
  router: PropTypes.any
}

class NavBar extends Component {
  render() {
    let counter = 0
    return (
      <AppBar
        title="CoinPanion"
        iconClassNameRight="muidocs-icon-navigation-expand-more"
        iconElementLeft={<Menu />}
        onTitleTouchTap={() => {
          firebase.database().ref('hello/').set({
            count: counter
          })
          counter++
        }}
      />
    )
  }
}

export default NavBar
