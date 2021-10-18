import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, KeyboardAvoidingView, Alert  } from 'react-native';
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
        };

        /* // Initialize Firebase (if it hasn't already)
        if (!firebase.apps.length) {
            // const app = initializeApp(firebaseConfig);
            firebase.initializeApp(firebaseConfig);
            // const analytics = getAnalytics(app);
        } */

        // create a reference to the messages collection        
        this.referenceChatMessages = firebase.firestore().collection("messages");
    }

    alertMyText(input = []) {
        Alert.alert(input.text);
    }
    
    componentDidMount() {
        // initialize with a mock message and a system message
        /* this.setState({
            messages: [
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
                    _id: 2,
                    text: `Welcome to the chat ${this.props.route.params.name}.`,
                    createdAt: new Date(),
                    system: true,
                },
            ],
            user: this.props.route.params.name,
            background: this.props.route.params.color,
        }); */
        
        // load the state of "name" and "color" from App.js as a prop into Chat component
        // let { name, color } = this.props.route.params;
        // adjust the navigation bar (moved to App.js)
        // this.props.navigation.setOptions({ title: name, headerStyle: { backgroundColor: color } });

        //if (this.referenceChatMessages.length != 0) {
            // “listen” for updates in the Firestore collection
            //this.unsubscribe = this.referenceChatMessages.onSnapshot(this.onCollectionUpdate);
            this.unsubscribe = this.referenceChatMessages
                .orderBy("createdAt", "desc")
                .onSnapshot(this.onCollectionUpdate);
        // }
        // else { this.alertMyText('No messages found in database'); }

        // Anonymous user login
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            // onAuthStateChanged() is an observer that’s called whenever the user's sign-in state changes and returns an unsubscribe() function
            
            // check whether the user is signed in.If not, create a new user
            if (!user) {
                await firebase.auth().signInAnonymously();
            }

            //update user state with currently active user data
            this.setState({
                uid: user.uid,
                loggedInText: 'Hello ' + user.name + user.uid,
                messages: [],
            });
            alertMyText(loggedInText);

            // send a welcome message to the user after login
                // this.onSend(this.state.loggedInText);
            /* this.referenceChatMessages.add({
                _id: 0,
                text: 'Welcome to the chat.', // `Welcome to the chat ${user.name}.`
                createdAt: new Date(),
                system: true,
            }); */
        });
    }

    componentWillUnmount() {
        // unsubscribe from Firstore updates
        this.unsubscribe();

        // logout user
        this.authUnsubscribe();
    }

    /* // Add new messages to Firestore
    addMessage() {
        const message = this.state.messages[0];
        this.referenceChatMessages.add({
            _id: message._id,
            uid: this.state.uid,
            createdAt: message.createdAt,
            text: message.text || '',
            user: message.user,
        });
    } */
    onSend(messages = []) {
        // add the user id to the new message
        messages = messages.append(`_id: ${this.state.uid}`);

        // append the new message(s) to the state
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }));
        // add the message to Firestore
        this.referenceChatMessages.add({ messages });
    }

    onCollectionUpdate = (querySnapshot) => {
        // querySnapshot = all the data currently in the collection
        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
            var data = doc.data();
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
            // messages.push({data});
        });
        this.setState({
            messages,
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
                    /* user={{
                        _id: 1,
                    }} */
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