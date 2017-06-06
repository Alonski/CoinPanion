import React, { Component } from 'react'
import styled from 'styled-components'
import TextField from 'material-ui/TextField'
import MenuItem from 'material-ui/MenuItem'
import Avatar from 'material-ui/Avatar'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import * as firebase from 'firebase'
import Snackbar from 'material-ui/Snackbar'

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
  render() {
    return (
      <div>
        <SelectField
          floatingLabelText="Category"
          value={this.props.value}
          onChange={this.props.onChange}
          maxHeight={200}
        >
          {categories.map((category, index) => <MenuItem key={index} value={category} primaryText={category} />)}
        </SelectField>
      </div>
    )
  }
}

class EditProfile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fullNameError: false,
      category: 'None',
      fullName: '',
      biography: '',
      openSnackbar: false,
      snackbarMessage: ''
    }
  }

  handleSave = event => {
    const myAddress = this.props.addresses[0]
    const userProfile = {
      fullName: this.state.fullName,
      category: this.state.category,
      biography: this.state.biography,
      address: myAddress // get address from app state so there is no danger of being manipulated from front-end
    }
    console.log(userProfile)
    if (this.state.fullName) {
      firebase.database().ref('users/' + myAddress).set(userProfile).then((success, error) => {
        if (error) {
          console.error(error)
          this.setState({ openSnackbar: true, snackbarMessage: 'Error: Profile not saved' })
        } else {
          this.setState({ openSnackbar: true, snackbarMessage: 'Profile saved' })
        }
      })
    } else {
      this.setState({ fullNameError: 'Full name is required' })
    }
  }

  handleCategoryChange = (event, index, value) => {
    this.setState({ category: value })
  }

  handleFullNameChange = (event, newValue) => {
    if (!newValue) {
      this.setState({ fullNameError: 'Full name is required' })
    } else {
      this.setState({ fullNameError: false })
      this.setState({ fullName: newValue })
    }
  }

  handleBiographyChange = (event, newValue) => {
    this.setState({ biography: newValue })
  }

  render() {
    return (
      <Main>
        <FormContainer>
          <h1>Edit My Profile</h1>
          <Avatar src="avatar.jpeg" size={250} />
          <TextField
            floatingLabelText="Full Name"
            onChange={this.handleFullNameChange}
            errorText={this.state.fullNameError}
          />
          <CategoryDropDown onChange={this.handleCategoryChange} value={this.state.category} />
          <TextField floatingLabelText="Biography" onChange={this.handleBiographyChange} />
          <span>Ethereum Address</span>
          <span>{this.props.addresses[0]}</span>
          <RaisedButton label="Save Profile" primary={true} onTouchTap={this.handleSave} />
          <Snackbar
            open={this.state.openSnackbar}
            message={this.state.snackbarMessage}
            autoHideDuration={4000}
            onRequestClose={this.handleRequestClose}
          />
        </FormContainer>
      </Main>
    )
  }
}

export default EditProfile
