import React from 'react'
import { connect } from 'react-redux'
import Dashboard from 'components/Dashboard'

const DashboardWrapper = props => <Dashboard {...props} />

function mapStateToProps({ profile: { addresses }, web3: { web3Provider } }) {
  return { addresses, web3: web3Provider }
}

export default connect(mapStateToProps)(DashboardWrapper)
