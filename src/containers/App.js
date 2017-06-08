import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import NavBar from 'components/NavBar'
import About from 'components/About'
import Explore from 'components/Explore'
import EditProfile from 'containers/EditProfileWrapper'
import Dashboard from 'containers/DashboardWrapper'
import NoMatch from 'components/NoMatch'

import * as profileActions from '../actions/profile'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import './App.css'

class App extends Component {
  componentDidMount() {
    this.props.getAddresses()
  }

  render() {
    return (
      <Router>
        <div className="App">
          <NavBar />
          <Switch>
            <Route exact path="/" component={Explore} />
            <Route path="/explore" component={Explore} />
            <Route path="/about" component={About} />
            <Route path="/editprofile" component={EditProfile} />
            <Route path="/dashboard" component={Dashboard} />
            <Route component={NoMatch} />
          </Switch>
        </div>
      </Router>
    )
  }
}

function mapStateToProps(state) {
  return state
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...profileActions }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
