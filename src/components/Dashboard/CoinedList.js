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

export default class CoinedList extends React.Component {
  state = {
    open: false
  }

  handleToggle = () => {
    this.setState({
      open: !this.state.open
    })
  }

  handleNestedListToggle = item => {
    this.setState({
      open: item.state.open
    })
  }

  render() {
    return (
      <div>
        <List style={{ minWidth: 250 }}>
          <ListItem
            primaryText="Coined Me"
            initiallyOpen={false}
            primaryTogglesNestedList={true}
            nestedItems={this.props.coinedBy.map((coining, index) =>
              <ListItem key={`div1${index}`} disabled={true} style={{ marginLeft: -18, padding: -16 }}>
                <ListItem
                  key={`${coining.coiner.id}-1`}
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
                />
                <Divider key={`Divider1${index}`} inset={true} />
              </ListItem>
            )}
          />
          <ListItem
            primaryText="I've Coined"
            initiallyOpen={false}
            primaryTogglesNestedList={true}
            nestedItems={this.props.coinedByMe.map((coining, index) =>
              <ListItem key={`div2${index}`} disabled={true} style={{ marginLeft: -18, padding: -16 }}>
                <ListItem
                  key={`${coining.coinee.id}-2`}
                  leftAvatar={<Avatar src={coining.coinee.photo_url} />}
                  rightIconButton={rightIconMenu}
                  primaryText={`${coining.coinee.first_name} ${coining.coinee.last_name}`}
                  secondaryText={
                    <p>
                      <span style={{ color: darkBlack }}>{coining.coinee.email}</span><br />
                      You are supporting for {coining.eth_amount} WEI per month.
                    </p>
                  }
                  secondaryTextLines={2}
                />
                <Divider key={`Divider2${index}`} inset={true} />
              </ListItem>
            )}
          />
        </List>
      </div>
    )
  }
}
