import React, { Component } from 'react'
import styled from 'styled-components'
import TextField from 'material-ui/TextField'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import Avatar from 'material-ui/Avatar'
import RaisedButton from 'material-ui/RaisedButton'

const Main = styled.div`
  display: flex;
  flexWrap: wrap;
  justify-content: space-around;
`

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 80%;
`

const categories = [
  'None',
  'Video & Film',
  'Podcasts',
  'Comics',
  'Comedy',
  'Crafts & DIY',
  'Music',
  'Drawing & Painting',
  'Games',
  'Science',
  'Dance & Theater',
  'Writing',
  'Animation',
  'Photography',
  'Education',
  'Other'
]

class CategoryDropDown extends Component {
  constructor(props) {
    super(props)
    this.state = { value: 1 }
  }

  handleChange = (event, index, value) => this.setState({ value })

  render() {
    return (
      <div>
        <DropDownMenu value={this.state.value} onChange={this.handleChange}>
          {categories.map((category, index) => <MenuItem value={index + 1} primaryText={category} />)}
        </DropDownMenu>
      </div>
    )
  }
}

class EditProfile extends Component {
  render() {
    return (
      <Main>
        <FormContainer>
          <h1>Edit My Profile</h1>
          <Avatar src="avatar.jpeg" size={250} />
          <TextField floatingLabelText="Full Name" />
          <CategoryDropDown />
          <TextField floatingLabelText="Biography" />
          <TextField
            disabled={true}
            defaultValue="0x02840384058048504850490594904590"
            floatingLabelText="Ethereum Address"
          />
          <RaisedButton label="Save Profile" primary={true} />
        </FormContainer>
      </Main>
    )
  }
}

export default EditProfile
