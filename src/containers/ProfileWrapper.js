import React from 'react'
import { connect } from 'react-redux'
import Profile from 'components/Profile'

const ProfileWrapper = props => <Profile {...props} />

function mapStateToProps({ profile: { addresses }, web3: { web3Provider } }) {
  return { addresses, web3: web3Provider }
}

export default connect(mapStateToProps)(ProfileWrapper)
