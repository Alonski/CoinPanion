import React from 'react'
import { connect } from 'react-redux'
import Profile from 'components/Profile'

const ProfileWrapper = props => <Profile {...props} />

function mapStateToProps({ profile: { addresses } }) {
  return { addresses }
}

export default connect(mapStateToProps)(ProfileWrapper)
