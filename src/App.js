import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Web3 from 'web3'
import * as firebase from 'firebase'

import NavBar from 'components/NavBar'
import About from 'components/About'
import Explore from 'components/Explore'
import Profile from 'components/Profile'
import Dashboard from 'components/Dashboard'
import NoMatch from 'components/NoMatch'

import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import Config from '../truffle.js'
import { config } from '../devConfig'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    firebase.initializeApp(config)
    this.state = {
      storageValue: 0
    }
  }

  componentWillMount() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    // So we can update state later.
    var self = this

    // Get the RPC provider and setup our SimpleStorage contract.
    const { host, port } = Config.networks[process.env.NODE_ENV]

    const provider = new Web3.providers.HttpProvider('http://' + host + ':' + port)
    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(provider)

    // Get Web3 so we can get our accounts.
    const web3RPC = new Web3(provider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    // Get accounts.
    web3RPC.eth.getAccounts(function(error, accounts) {
      console.log(accounts)

      simpleStorage
        .deployed()
        .then(function(instance) {
          simpleStorageInstance = instance

          // Stores a value of 5.
          return simpleStorageInstance.set(5, { from: accounts[0] })
        })
        .then(function(result) {
          // Get the value from the contract to prove it worked.
          return simpleStorageInstance.get.call(accounts[0])
        })
        .then(function(result) {
          // Update state with the result.
          return self.setState({ storageValue: result.c[0] })
        })
    })
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

export default App
