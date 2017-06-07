import React from 'react'
import { connect } from 'react-redux'
import EditProfile from 'components/EditProfile'

const EditProfileWrapper = props => <EditProfile {...props} />

function mapStateToProps({ profile: { addresses } }) {
  return { addresses }
}

export default connect(mapStateToProps)(EditProfileWrapper)
