import React, { Component } from 'react'
import styled from 'styled-components'
import TextField from 'material-ui/TextField'
import MenuItem from 'material-ui/MenuItem'
import Avatar from 'material-ui/Avatar'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import SelectField from 'material-ui/SelectField'
import Snackbar from 'material-ui/Snackbar'
import { connect } from 'react-redux'
import { firebase, helpers } from 'react-redux-firebase'
import Paper from 'material-ui/Paper'
const { dataToJS } = helpers
import Dropzone from 'react-dropzone'

// Path within Database for metadata (also used for file Storage path)
const filesPath = 'uploadedFiles'

const Main = styled.div`
  display: flex;
  flexWrap: wrap;
  justify-content: space-around;
`

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 10px 10px 10px 10px;
`

const categories = [
  'None',
  'Developer',
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

class Uploader extends Component {
  render() {
    let dropzoneRef
    return (
      <div>
        <Dropzone
          ref={node => {
            dropzoneRef = node
          }}
          onDrop={this.props.onDrop}
          style={{ display: 'hidden' }}
        />
        <FlatButton
          label="Change Profile Picture"
          onTouchTap={() => {
            dropzoneRef.open()
          }}
        />
      </div>
    )
  }
}

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
      first_name: '',
      last_name: '',
      email: '',
      category: 'None',
      content: '',
      biography: '',
      eth_address: '',
      photo_url: '',
      id: '',
      openSnackbar: false,
      snackbarMessage: ''
    }
  }

  handleSave = event => {
    const myAddress = this.props.addresses[0]
    const userProfile = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email,
      category: this.state.category,
      eth_address: myAddress // get address from app state so there is no danger of being manipulated from front-end
    }
    if (this.state.id) {
      userProfile.id = this.state.id
    }
    if (this.state.photo_url) {
      userProfile.photo_url = this.state.photo_url
    }
    if (this.state.biography) {
      userProfile.biography = this.state.biography
    }
    if (this.state.content) {
      userProfile.content = this.state.content
    }
    // required fields
    if (this.state.first_name && this.state.last_name && this.state.email && myAddress) {
      if (this.state.id) {
        // update profile
        this.props.firebase.set(`/users/${this.state.id}`, userProfile).then((success, error) => {
          if (error) {
            console.error(error)
            this.setState({ openSnackbar: true, snackbarMessage: 'Error: Profile not created' })
          } else {
            this.setState({ openSnackbar: true, snackbarMessage: 'Profile created' })
          }
        })
      } else {
        // create new profile
        this.props.firebase
          .push('users', userProfile)
          .then((snap, error) => {
            console.log(snap)
            // add id as key
            this.props.firebase.update(`users/${snap.key}`, { id: snap.key })
          })
          .then((success, error) => {
            if (error) {
              console.error(error)
              this.setState({ openSnackbar: true, snackbarMessage: 'Error: Profile not updated' })
            } else {
              this.setState({ openSnackbar: true, snackbarMessage: 'Profile updated' })
            }
          })
      }
    }
  }

  handleCategoryChange = (event, index, value) => {
    this.setState({ category: value })
  }

  handleFieldChange = (stateKey, event, newValue) => {
    const obj = {}
    obj[stateKey] = newValue // so key can be programatically assigned
    this.setState(obj)
  }

  onFilesDrop = files => {
    // Uploads files and push's objects containing metadata to database at dbPath
    // uploadFiles(storagePath, files, dbPath)
    this.props.firebase.uploadFiles(filesPath, files, filesPath).then((resolve, reject) => {
      if (reject) {
        console.error(reject)
        this.setState({ openSnackbar: true, snackbarMessage: 'Error: Photo not uploaded' })
      } else {
        console.log(resolve)
        const photoURL = resolve[0].File.downloadURL
        this.setState({ photo_url: photoURL })
        console.log(this.state)
      }
    })
  }

  componentWillReceiveProps() {
    const myAddress = this.props.addresses[0]
    if (myAddress) {
      this.props.firebase
        .database()
        .ref()
        .child('users')
        .orderByChild('eth_address')
        .equalTo(myAddress)
        .once('value', snap => {
          if (snap.val()) {
            console.log(snap)
            console.log(snap.val())
            const myProfile = Object.values(snap.val())[0] // only 1 value should exist for an eth address
            this.setState({
              first_name: myProfile.first_name,
              last_name: myProfile.last_name,
              email: myProfile.email,
              category: myProfile.category || this.state.category,
              content: myProfile.content,
              biography: myProfile.biography,
              photo_url: this.state.photo_url || myProfile.photo_url,
              id: myProfile.id
            })
          }
        })
    }
  }

  render() {
    return (
      <Main>
        <Paper>
          <FormContainer>
            <Avatar src={this.state.photo_url} size={150} />
            <Uploader onDrop={this.onFilesDrop} />
            <TextField
              floatingLabelText="First Name"
              onChange={(event, newValue) => this.handleFieldChange('first_name', event, newValue)}
              errorText={!this.state.first_name ? 'First Name is Required' : null}
              value={this.state.first_name || ''}
            />
            <TextField
              floatingLabelText="Last Name"
              onChange={(event, newValue) => this.handleFieldChange('last_name', event, newValue)}
              errorText={!this.state.last_name ? 'Last Name is Required' : null}
              value={this.state.last_name || ''}
            />
            <TextField
              floatingLabelText="Email Address"
              onChange={(event, newValue) => this.handleFieldChange('email', event, newValue)}
              errorText={!this.state.email ? 'Email Address is Required' : null}
              value={this.state.email || ''}
            />
            <CategoryDropDown onChange={this.handleCategoryChange} value={this.state.category} />
            <TextField
              floatingLabelText="Biography"
              onChange={(event, newValue) => this.handleFieldChange('biography', event, newValue)}
              value={this.state.biography || ''}
            />
            <TextField
              floatingLabelText="Content I'm Creating"
              onChange={(event, newValue) => this.handleFieldChange('content', event, newValue)}
              value={this.state.content || ''}
            />
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
        </Paper>
      </Main>
    )
  }
}

EditProfile.defaultProps = {
  userProfile: {}
}

const fbWrappedComponent = firebase(['uploadedFiles'])(EditProfile)
export default connect(({ firebase }) => ({
  uploadedFiles: dataToJS(firebase, 'uploadedFiles')
}))(fbWrappedComponent)
