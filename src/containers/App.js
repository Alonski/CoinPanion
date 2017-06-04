import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import * as firebase from 'firebase'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import NavBar from 'components/NavBar'
import About from 'components/About'
import Explore from 'components/Explore'
import Profile from 'containers/ProfileWrapper'
import Dashboard from 'components/Dashboard'
import NoMatch from 'components/NoMatch'

import { config } from '../../devConfig'

import * as profileActions from '../actions/profile'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    firebase.initializeApp(config)
  }

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
            <Route path="/profile" component={Profile} />
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
