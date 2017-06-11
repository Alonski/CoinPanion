import * as actionTypes from './actionTypes'
import firebase from 'firebase'
import * as querybase from 'querybase'

export function getUser(user) {
  return async dispatch => {
    const databaseRefCoinings = firebase.database().ref().child('coinings')
    const coiningsRef = querybase.ref(databaseRefCoinings, [])
    const databaseRefUsers = firebase.database().ref().child('users')
    const usersRef = querybase.ref(databaseRefUsers, [])
    const coineeIsMeSnap = await coiningsRef.where({ coinee: user.eth_address }).once('value')
    const coinerIsMeSnap = await coiningsRef.where({ coiner: user.eth_address }).once('value')
    const coineeIsMePromise = Object.values(coineeIsMeSnap.val() || {}).map(coining => {
      return usersRef.where({ eth_address: coining.coiner.toLowerCase() }).once('value')
    })
    const responseCoineeIsMe = await Promise.all(coineeIsMePromise)
    user.coinedBy = responseCoineeIsMe.map(res => {
      const [user] = Object.values(res.val())
      return user
    })
    const coinerIsMePromise = Object.values(coinerIsMeSnap.val() || {}).map(coining => {
      console.log(coining.coinee, usersRef.where({ eth_address: coining.coinee.toLowerCase() }).once('value'))
      return usersRef.where({ eth_address: coining.coinee.toLowerCase() }).once('value')
    })
    const responseCoinerIsMe = await Promise.all(coinerIsMePromise)
    user.coinedByMe = responseCoinerIsMe.map(res => {
      const [user] = Object.values(res.val())
      return user
    })
    dispatch({ type: actionTypes.GET_USER, payload: user })
  }
}
