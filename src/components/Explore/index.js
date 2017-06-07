import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { GridList } from 'material-ui/GridList'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import { Card, CardActions, CardHeader, CardTitle, CardText } from 'material-ui/Card'
import Chip from 'material-ui/Chip'
import Measure from 'react-measure'
import { firebase, helpers } from 'react-redux-firebase'
const { dataToJS } = helpers
import FlatButton from 'material-ui/FlatButton'
import { blue300 } from 'material-ui/styles/colors'

const Main = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`

const Container = styled.div`
`

const StyledGridList = styled(GridList)`
`

const StyledCard = styled(Card)`
  margin: 20px;
  height: 300px;
`

const StyledCardText = styled(CardText)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`

const StyledCardActions = styled(CardActions)`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  padding-top: 15px;
`

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
  state = {
    dimensions: {
      width: -1,
      height: -1
    }
  }

  getColumnsNum = () => {
    const { width } = this.state.dimensions
    if (width <= 600) return 1
    if (width > 600 && width <= 900) return 2
    if (width > 900 && width <= 1300) return 3
    return 4
  }

  render() {
    return (
      <Main>
        <Container>
          <DropDown />
          <Measure
            margin
            bounds
            onResize={contentRect => {
              this.setState({ dimensions: contentRect.bounds })
            }}
          >
            {({ measureRef }) => (
              <div ref={measureRef}>
                <StyledGridList cellHeight="auto" cols={this.getColumnsNum()}>
                  {this.props.users.map(user => (
                    <StyledCard key={user.id}>
                      <CardHeader
                        title={<Chip backgroundColor={blue300}>{user.eth_address.slice(0, 15)}</Chip>}
                        avatar={user.photo_url || 'https://api.adorable.io/avatars/285/abott@adorable.png'}
                      />
                      <CardTitle
                        title={`${user.first_name} ${user.last_name}`}
                        subtitle={`is creating ${user.content || user.category}`}
                      />
                      <StyledCardText>{user.biography}</StyledCardText>
                      <StyledCardActions>
                        <FlatButton primary={true} label="View more" />
                        <Chip>{user.category}</Chip>
                      </StyledCardActions>
                    </StyledCard>
                  ))}
                </StyledGridList>
              </div>
            )}
          </Measure>
        </Container>
      </Main>
    )
  }
}

Explore.defaultProps = {
  users: []
}

const fbWrappedComponent = firebase(['/users'])(Explore)
export default connect(({ firebase }) => ({
  users: dataToJS(firebase, 'users')
}))(fbWrappedComponent)
