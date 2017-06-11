import React from 'react'
import { connect } from 'react-redux'
import EditProfile from 'components/EditProfile'

const EditProfileWrapper = props => <EditProfile {...props} />

function mapStateToProps({ profile: { addresses }, web3: { web3Provider } }) {
  return { addresses, web3: web3Provider }
}

export default connect(mapStateToProps)(EditProfileWrapper)
