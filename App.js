import React from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet
} from 'react-native';

const firebase = require('firebase');
require('firebase/firestore');

class App extends React.Component {

  constructor() {
    super();
    if (!firebase.apps.length) {
      // Web app's Firebase configuration
      firebase.initializeApp({
        apiKey: "AIzaSyC-r20-ZHQ5nH6bs7uOqt0aon7mxBc3Cmg",
        authDomain: "test-f2749.firebaseapp.com",
        databaseURL: "https://test-f2749.firebaseio.com",
        projectId: "test-f2749",
        storageBucket: "test-f2749.appspot.com",
        messagingSenderId: "857042503952",
        appId: "1:857042503952:web:ca67e2dfdc7ed7ee53fd95",
        measurementId: "G-V5FXDWVEFG"
      });
    }

    this.referenceShoppinglistUser = null;

    this.referenceShoppingLists = firebase.firestore().collection('shoppinglists');
    this.state = {
      lists: [],
      uid: 0,
      loggedInText: 'Processing authentication, please wait!',
    };
  }

  componentDidMount() {
    // Listen to authentication events
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((async, user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      // Update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: 'Hello there',
      });

      // Create a reference to the active user's shopping lists
      this.referenceShoppinglistUser = firebase.firestore().collection('shoppinglists').where("uid", "==", this.state.uid);
      // Listen to collection changes for current user 
      this.unsubscribeListUser = this.referenceShoppinglistUser.onSnapshot(this.onCollectionUpdate);
    });
  }

  onCollectionUpdate = (querySnapshot) => {
    const lists = [];
    // Go through each document
    querySnapshot.forEach((doc) => {
      // Get querySnapshot's data
      var data = doc.data();
      lists.push({
        name: data.name,
        items: data.items.toString(),
      });
    });
    this.setState({
      lists,
    });
  }

  addList() {
    // Add new list to collection
    this.referenceShoppingLists.add({
      name: 'TestList',
      items: ['cashews', 'brazilnuts', 'cocunut'],
      uid: this.state.uid,
    });
  }

  componentWillUnmount() {
    // Stop listening to authentication
    this.authUnsubscribe();
    // Stop listening for changes
    this.unsubscribeListUser();
  }

  render() {

    return (
      <View style={styles.container}>
        <Text>{this.state.loggedInText}</Text>
        <Text style={styles.text}>All Shopping lists</Text>
        <FlatList
          data={this.state.lists}
          renderItem={({ item }) =>
            <Text style={styles.item}>{item.name}: {item.items}</Text>}
        />
        <Button
          onPress={() => {
            this.addList();
          }}
          title="Add something new"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    fontSize: 20,
    color: '#000',
  },
  text: {
    fontSize: 30,
  }
});

export default App;
