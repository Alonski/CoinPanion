import React from 'react'
import { connect } from 'react-redux'
import Dashboard from 'components/Dashboard'

const DashboardWrapper = props => <Dashboard {...props} />

function mapStateToProps({ profile: { addresses } }) {
  return { addresses }
}

export default connect(mapStateToProps)(DashboardWrapper)
