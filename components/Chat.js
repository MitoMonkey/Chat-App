import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, KeyboardAvoidingView  } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'

// package to store data locally (for offline use of the app)
import AsyncStorage from '@react-native-async-storage/async-storage';

/* import firebase from 'firebase';
import firestore from 'firebase'; */
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
const firebase = require('firebase');
require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyD8XhCZkN1jev-tS9vVy8BoJYialaYz9tQ",
    authDomain: "chatzam-aa2dd.firebaseapp.com",
    projectId: "chatzam-aa2dd",
    storageBucket: "chatzam-aa2dd.appspot.com",
    messagingSenderId: "629796788049",
    appId: "1:629796788049:web:1ed1ada6a801fbc02e6570",
    measurementId: "G-E1QKHKWQC9"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default class Chat extends React.Component {
    constructor() {
        super();
        this.state = {
            messages: [],
            uid: 0,
            loggedInText: "Please wait, you are getting logged in",
            userName: ''
        };

        /* // Initialize Firebase (if it hasn't already) > DID NOT WORK HERE > MOVED TO BEFORE THE CLASS DEFINITION
        if (!firebase.apps.length) {
            // const app = initializeApp(firebaseConfig);
            firebase.initializeApp(firebaseConfig);
            // const analytics = getAnalytics(app);
        } */

        // create a reference to the messages collection        
        this.referenceChatMessages = firebase.firestore().collection("messages");
    }
    
    componentDidMount() {
        this.setState({
            // initialize with a mock message and a system message
            /* messages: [
                {
                    _id: 1,
                    text: 'Hello developer',
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any',
                    },
                },
                {
                    _id: 0,
                    text: `Welcome to the chat ${this.state.userName}.`,
                    createdAt: new Date(),
                    system: true,
                },
            ], */
            // load name and color from props into the state
            userName: this.props.route.params.name,
            background: this.props.route.params.color,
        });
        
        // load the state of "name" and "color" from App.js as a prop into Chat component
        // let { name, color } = this.props.route.params;
        // adjust the navigation bar (moved to App.js)
        // this.props.navigation.setOptions({ title: name, headerStyle: { backgroundColor: color } });

        // Anonymous user login
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            // onAuthStateChanged() is an observer that’s called whenever the user's sign-in state changes and returns an unsubscribe() function
            
            // check whether the user is signed in. If not, create a new user
            if (!user) {
                await firebase.auth().signInAnonymously();
            }

            //update user state with currently active user data
            this.setState({
                uid: user.uid,
                loggedInText: 'Welcome to the chat', //+ user.uid
                // messages: [],
            });

            //if (this.referenceChatMessages.length != 0) {
            // “listen” for updates in the Firestore collection
            this.unsubscribe = this.referenceChatMessages
                .orderBy("createdAt", "desc")
                .onSnapshot(this.onCollectionUpdate);
            // }
            // else { onSend('No messages found in database'); }

            // load messages from (local) asyncStorage
            this.getMessages();

            // send a welcome message to the user after login
            const welcomeMessage = {
                text: "Welcome to the chat " + this.state.userName,
                createdAt: new Date(),
                system: true,
                _id: 0
            }
            // this.onSend(welcomeMessage);
            // this.referenceChatMessages.add(welcomeMessage);
            /* this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages, welcomeMessage),
            })); */
        });

        // Create reference to the active users messages
        // this.referenceUserMessages = firebase.firestore().collection('messages').where('uid', '==', this.state.uid);
    }

    componentWillUnmount() {
        // unsubscribe from Firstore updates
        this.unsubscribe();

        // logout user
        this.authUnsubscribe();
    }

    // load messages from (local) asyncStorage
    async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({
                messages: JSON.parse(messages)
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    // safe messages to (local) asyncStorage for offline usage
    async saveMessages() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (error) {
            console.log(error.message);
        }
    }

    // delete messages from (local) asyncStorage
    async deleteMessages() {
        try {
            await AsyncStorage.removeItem('messages');
            this.setState({
                messages: []
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    // Add new message to Firestore > NOT NECESSARY AS IT CAN BE DONE IN ONE LINE; SEE onSend
    /* addMessage() {
        const message = this.state.messages[0];
        this.referenceChatMessages.add({
            _id: message._id,
            uid: this.state.uid,
            createdAt: message.createdAt,
            text: message.text, // || ''
            // user: message.user,
            user: {
                _id: data.user._id,
                name: data.user.name,
            },
        });
    } */
    onSend(messages = []) {
        // add the new message(s) to the state
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => {
            // callback that saves the current state into asyncStorage
            this.saveMessages();
        });
                    
        // add the message to Firestore
        this.referenceChatMessages.add(messages[0]);
    }

    onCollectionUpdate = (querySnapshot) => {
        // querySnapshot = all the data currently in the collection

        // conditional to avoid refreshes if the only new message was sent from the user himself
        // if (querySnapshot.length != this.state.messages.length) { 

        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
            var data = doc.data();
            // messages.push({data}); // throws an error because creates two children with same key 'undefined'
            messages.push({
                _id: data._id,
                text: data.text, // || ''
                createdAt: data.createdAt.toDate(),
                user: data.user,
                /* user: {
                    _id: data.user._id,
                    name: data.user.name,
                }, */
            });            
        });
        this.setState({
            messages
        });
    };

    //set the background color of the text bubbles
    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: { // modify the speach bubbles on the right side
                        backgroundColor: this.props.route.params.color
                    }
                }}
            />
        )
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: this.state.uid,
                        name: this.state.userName,
                    }}
                />
                {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
                // prevent the keyboard hiding the text input on older android devices
                }
            </View>
        );
    };
}

const styles = StyleSheet.create({
    /* background: {
        backgroundColor: color,
    } */
    mainContainer: {
        flex: 1,
    }
})