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

const fbWrappedUploader = firebase([filesPath])(Uploader)
const FbUploader = connect(({ firebase }) => ({
  uploadedFiles: dataToJS(firebase, filesPath)
}))(fbWrappedUploader)

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
      firstName: '',
      lastName: '',
      emailAddress: '',
      category: 'None',
      content: '',
      biography: '',
      ethereumAddress: '',
      openSnackbar: false,
      snackbarMessage: ''
    }
  }

  handleSave = event => {
    const myAddress = this.props.addresses[0]
    const userProfile = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      emailAddress: this.state.emailAddress,
      category: this.state.category,
      content: this.state.content,
      biography: this.state.biography,
      photoURL: this.state.photoURL,
      ethereumAddress: myAddress // get address from app state so there is no danger of being manipulated from front-end
    }
    if (this.state.firstName && this.state.lastName && this.state.emailAddress && myAddress) {
      this.props.firebase.set(`/users/${myAddress}`, userProfile).then((success, error) => {
        if (error) {
          console.error(error)
          this.setState({ openSnackbar: true, snackbarMessage: 'Error: Profile not saved' })
        } else {
          this.setState({ openSnackbar: true, snackbarMessage: 'Profile saved' })
        }
      })
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

  onFilesDrop = files => {
    // Uploads files and push's objects containing metadata to database at dbPath
    // uploadFiles(storagePath, files, dbPath)
    this.props.firebase.uploadFiles(filesPath, files, filesPath).then((resolve, reject) => {
      console.log(resolve)
      const photoURL = resolve[0].File.downloadURL
      this.setState({ photoURL: photoURL })
    })
  }

  componentWillReceiveProps() {
    const myAddress = this.props.addresses[0]
    console.log(this.props.users ? this.props.users[myAddress] : this.props.users)
    if (this.props.users && this.props.users[myAddress]) {
      const myProfile = this.props.users[myAddress]
      this.setState({
        firstName: myProfile.firstName,
        lastName: myProfile.lastName,
        emailAddress: myProfile.emailAddress,
        category: myProfile.category,
        content: myProfile.content,
        biography: myProfile.biography,
        photoURL: myProfile.photoURL
      })
    }
  }

  render() {
    return (
      <Main>
        <Paper>
          <FormContainer>
            <Avatar src={this.state.photoURL} size={150} />
            <Uploader onDrop={this.onFilesDrop} />
            <TextField
              floatingLabelText="First Name"
              onChange={(event, newValue) => this.handleFieldChange('firstName', event, newValue)}
              errorText={!this.state.firstName ? 'First Name is Required' : null}
              value={this.state.firstName}
            />
            <TextField
              floatingLabelText="Last Name"
              onChange={(event, newValue) => this.handleFieldChange('lastName', event, newValue)}
              errorText={!this.state.lastName ? 'Last Name is Required' : null}
              value={this.state.lastName}
            />
            <TextField
              floatingLabelText="Email Address"
              onChange={(event, newValue) => this.handleFieldChange('emailAddress', event, newValue)}
              errorText={!this.state.emailAddress ? 'Email Address is Required' : null}
              value={this.state.emailAddress}
            />
            <CategoryDropDown onChange={this.handleCategoryChange} value={this.state.category} />
            <TextField
              floatingLabelText="Biography"
              onChange={(event, newValue) => this.handleFieldChange('biography', event, newValue)}
              value={this.state.biography}
            />
            <TextField
              floatingLabelText="Content I'm Creating"
              onChange={(event, newValue) => this.handleFieldChange('content', event, newValue)}
              value={this.state.content}
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

const fbWrappedComponent = firebase([{ type: 'once', path: '/users' }, 'uploadedFiles'])(EditProfile)
export default connect(({ firebase }) => ({
  users: dataToJS(firebase, 'users'),
  uploadedFiles: dataToJS(firebase, 'uploadedFiles')
}))(fbWrappedComponent)
