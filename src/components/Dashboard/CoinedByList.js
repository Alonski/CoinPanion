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
import { Link } from 'react-router-dom'

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
      {props.coinings.map((coining, index) =>
        <div key={`div${index}`}>
          <ListItem
            key={`List${index}`}
            leftAvatar={<Avatar src={coining.coiner.photo_url} />}
            rightIconButton={rightIconMenu}
            primaryText={`${coining.coiner.first_name} ${coining.coiner.last_name}`}
            secondaryText={
              <p>
                <span style={{ color: darkBlack }}>{coining.coiner.email}</span><br />
                Supports you for {coining.eth_amount} WEI per month.
              </p>
            }
            secondaryTextLines={2}
          >
            <Link to="/courses" />
          </ListItem>
          <Divider key={`Divider${index}`} inset={true} />
        </div>
      )}
    </List>
  </div>

export default CoinedByList
