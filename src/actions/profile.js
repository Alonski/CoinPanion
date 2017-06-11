import * as actionTypes from './actionTypes'
import firebase from 'firebase'
import * as querybase from 'querybase'

export function getUser(user) {
  return async dispatch => {
    // const databaseRefCoinings = firebase.database().ref().child('coinings')
    // const coiningsRef = querybase.ref(databaseRefCoinings, [])
    // const coineeIsMeSnap = await coiningsRef.where({ coinee: myProfile.id }).once('value')
    // const coinerIsMeSnap = await coiningsRef.where({ coiner: myProfile.id }).once('value')
    // if (coineeIsMeSnap && coineeIsMeSnap.val()) {
    //   const usersPromises = Object.values(coineeIsMeSnap.val()).map(coining => {
    //     // key by coiner to allow join
    //     coineeIsMe[coining.coiner] = coining
    //     return usersRef.where({ id: coining.coiner }).once('value')
    //   })
    //   Promise.all(usersPromises).then(usersSnaps => {
    //     if (usersSnaps) {
    //       usersSnaps.forEach(snap => {
    //         const [user] = Object.values(snap.val())
    //         if (coineeIsMe[user.id]) {
    //           coineeIsMe[user.id].coiner = user
    //         }
    //       })
    //       this.setState({
    //         coinedBy: Object.values(coineeIsMe)
    //       })
    //     }
    //   })
    // }

    // if (coinerIsMeSnap && coinerIsMeSnap.val()) {
    //   const usersPromises = Object.values(coinerIsMeSnap.val()).map(coining => {
    //     // key by coinee to allow join
    //     coinerIsMe[coining.coinee] = coining
    //     return usersRef.where({ id: coining.coinee }).once('value')
    //   })
    //   Promise.all(usersPromises).then(usersSnaps => {
    //     if (usersSnaps) {
    //       usersSnaps.forEach(snap => {
    //         const [user] = Object.values(snap.val())
    //         if (coinerIsMe[user.id]) {
    //           coinerIsMe[user.id].coinee = user
    //         }
    //       })
    //       this.setState({
    //         coinedByMe: Object.values(coinerIsMe)
    //       })
    //     }
    //   })
    // }
    dispatch({ type: actionTypes.GET_USER, payload: user })
  }
}
