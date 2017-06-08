import React from 'react'
import { List, ListItem } from 'material-ui/List'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import Avatar from 'material-ui/Avatar'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import IconButton from 'material-ui/IconButton'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import { grey400, darkBlack } from 'material-ui/styles/colors'

const iconButtonElement = (
  <IconButton touch={true}>
    <MoreVertIcon color={grey400} />
  </IconButton>
)

const rightIconMenu = (
  <IconMenu iconButtonElement={iconButtonElement}>
    <MenuItem>Send Mail</MenuItem>
    <MenuItem>Tweet</MenuItem>
    <MenuItem>Remove Coiner</MenuItem>
  </IconMenu>
)

const CoinedByList = props =>
  <div>
    <List>
      <Subheader>Coined By</Subheader>
      <ListItem
        leftAvatar={<Avatar src={props.photo_url} />}
        rightIconButton={rightIconMenu}
        primaryText="Alon Bukai"
        secondaryText={
          <p>
            <span style={{ color: darkBlack }}>email@email.com</span><br />
            Love the work you are doing! Keep it up!
          </p>
        }
        secondaryTextLines={2}
      />
      <Divider inset={true} />
      <ListItem
        leftAvatar={<Avatar src={props.photo_url} />}
        rightIconButton={rightIconMenu}
        primaryText="Tim Reznich"
        secondaryText={
          <p>
            <span style={{ color: darkBlack }}>email@email.com</span><br />
            Sample Message Sent With Subscription
          </p>
        }
        secondaryTextLines={2}
      />
      <Divider inset={true} />
      <ListItem
        leftAvatar={<Avatar src={props.photo_url} />}
        rightIconButton={rightIconMenu}
        primaryText="Rahul Sethuram"
        secondaryText={
          <p>
            <span style={{ color: darkBlack }}>email@email.com</span><br />
            Sample Message Sent With Subscription
          </p>
        }
        secondaryTextLines={2}
      />
      <Divider inset={true} />
      <ListItem
        leftAvatar={<Avatar src={props.photo_url} />}
        rightIconButton={rightIconMenu}
        primaryText="Joseph P"
        secondaryText={
          <p>
            <span style={{ color: darkBlack }}>email@email.com</span><br />
            Sample Message Sent With Subscription
          </p>
        }
        secondaryTextLines={2}
      />

    </List>
  </div>

export default CoinedByList
