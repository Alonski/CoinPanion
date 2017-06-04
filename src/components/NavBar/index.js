import React, { Component } from 'react'

import AppBar from 'material-ui/AppBar'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import { white } from 'material-ui/styles/colors'

import * as firebase from 'firebase'

const Menu = () => (
  <IconMenu
    iconButtonElement={<IconButton><NavigationMenu color={white} /></IconButton>}
    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
  >
    <MenuItem primaryText="Dashboard" />
    <MenuItem primaryText="Explore" />
    <MenuItem primaryText="Edit Profile" />
    <MenuItem primaryText="About" />
  </IconMenu>
)
Menu.muiName = 'IconMenu'

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
