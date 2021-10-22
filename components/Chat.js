import React from 'react';
import { View, Text, StyleSheet, Platform, KeyboardAvoidingView, LogBox  } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, SystemMessage } from 'react-native-gifted-chat'
import MapView, {Marker} from 'react-native-maps';

// package to store data locally (for offline use of the app)
import AsyncStorage from '@react-native-async-storage/async-storage';

// NetInfo to find out if user is online or not
import NetInfo from '@react-native-community/netinfo';

// module to share pictures, audio and location
import CustomActions from './CustomActions';

// Disable timer alert in Expo console
LogBox.ignoreLogs(['Setting a timer']);

import firebase from 'firebase';
import firestore from 'firebase';
import { initializeApp } from "firebase/app";

export default class Chat extends React.Component {
    constructor() {
        super();
        this.state = {
            messages: [],
            uid: 0,
            userName: 'John Doe',
            background: '',
            isConnected: ''
            
        };

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
    }
    
    componentDidMount() {
        // load name and color from props into the state
        if (this.props.route.params.name) {
            this.setState({ userName: this.props.route.params.name })
        } else { 
            this.setState({ userName: 'anonymous' })
        }
        if (this.props.route.params.color) {
            this.setState({ background: this.props.route.params.color })
        } else {
            this.setState({ background: 'orange' })
        }

        // adjust the color of the navigation bar
        this.props.navigation.setOptions({ headerStyle: { backgroundColor: this.props.route.params.color } });

        // create a listener to network connection state
        this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
            if (!state.isConnected) {
                this.setState({
                    isConnected: false
                });
            } else if (state.isConnected) {
                this.setState({
                    isConnected: true
                });
            }
        });

        // check if user is online, then log in to Firebase, else load messages from local storage
        NetInfo.fetch().then(connection => {
            if (connection.isConnected) {
                
                this.setState({
                    isConnected: true
                });

                // Anonymous user login
                this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
                    // onAuthStateChanged() is an observer that’s called whenever the user's sign-in state changes and returns an unsubscribe() function
                    
                    // check whether the user is signed in. If not, create a new user
                    if (!user) {
                        await firebase.auth().signInAnonymously();
                    }

                    //update user state with currently active user data
                    this.setState({
                        uid: user.uid                        
                    });

                    // save user data to local storage for offline user
                    this.saveUserID();

                    // create a reference to the messages collection        
                    this.referenceChatMessages = firebase.firestore().collection("messages");

                    // “listen” for updates in the Firestore collection
                    this.unsubscribe = this.referenceChatMessages
                        .orderBy("createdAt", "desc")
                        .onSnapshot(this.onCollectionUpdate);

                    // Create reference to the active users messages
                    // this.referenceUserMessages = firebase.firestore().collection('messages').where('uid', '==', this.state.uid);

                    // send a welcome message to the user after login > IS NOT DISPLAYED AS A SYSTEM MESSAGE
                    const welcomeMessage = {
                        text: "Welcome to the chat " + this.state.userName,
                        createdAt: new Date(),
                        _id: new Date(),
                        system: true,
                        user: {
                            name: 'bot',
                            // _id: Math.floor(Math.random() * 1000)
                        }                        
                    }
                    this.onSend([welcomeMessage]);
                });
            } else {
                this.setState({
                    isConnected: false
                });

                // load user ID from local storage, so own messages are displayed on the right side
                this.getUserID();

                // load messages from (local) asyncStorage
                this.getMessages();
            }
        })  
    }

    componentWillUnmount() {
        if (this.state.isConnected == true) {
            // unsubscribe from Firstore updates
            this.unsubscribe();

            // logout user from Firebase
            this.authUnsubscribe();
            
            // stop listening to network status changes
            this.unsubscribeNetInfo();
        }
    }

    // safe user data to (local) asyncStorage for offline usage
    async saveUserID() {
        let user = { _id: this.state.uid }
        try {
            await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.log(error.message);
        }
    }
    // load user from (local) asyncStorage
    async getUserID() {
        let user = {};
        try {
            user = await AsyncStorage.getItem('user') || {};
            this.setState({
                uid: JSON.parse(user)._id
            });
        } catch (error) {
            console.log(error.message);
        }
    };
    // delete user from (local) asyncStorage
    async deleteUserID() {
        try {
            await AsyncStorage.removeItem('user');
            this.setState({
                //userName: '',
                uid: ''
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    // load messages from (local) asyncStorage
    async getMessages() {
        let messages = [];
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

    onSend(messages = []) {
        // add the new message(s) to the state
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => { // callback
            // save the current state into asyncStorage
            this.saveMessages();
            // add the message to Firestore
            this.referenceChatMessages.add(messages[0]);
        });
    }

    onCollectionUpdate = (querySnapshot) => {
        // querySnapshot = all the data currently in the collection

        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text || '',
                createdAt: data.createdAt.toDate(),
                user: data.user,
                image: data.image || null,
                location: data.location || null,
            });            
        });
        this.setState({
            messages
        });
        // save all messages into local storage as well
        this.saveMessages();
    };

    //set the background color of the text bubbles
    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: { // modify only the speach bubbles on the right side
                        backgroundColor: this.state.background
                    }
                }}
            />
        )
    }

    // avoid new messages when user is offline
    renderInputToolbar(props) {
        if (this.state.isConnected == false) { // render a text instead of the InputToolbar > NOT WORKING YET
            // <View style={styles.offlineInputWrapper}>
                <Text style={styles.offlineInput}>You are currently offline.</Text>
            // </View>
        } else {
            return (
                <InputToolbar
                    {...props}
                />
            );
        }
    }

    // add a "button" into the InputBar to enable uploading a picture, audio or share location
    renderCustomActions = (props) => {
        return <CustomActions {...props} />;
    };

    // custom view to render a map into a message bubble if the message contains a location
    renderCustomView(props) {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <MapView
                    style={{
                        width: 250,
                        height: 200,
                        borderRadius: 13,
                        borderWidth: 5,
                        padding: 5,
                        margin: 4
                    }}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: currentMessage.location.latitude,
                            longitude: currentMessage.location.longitude,
                        }}
                    />
                </MapView>
            );
        }
        return null;
    }

    render() {
        return (
            <View style={styles.mainContainer}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    renderUsernameOnMessage={true}
                    scrollToBottom
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: this.state.uid,
                        name: this.props.route.params.name,
                    }}
                    renderActions={this.renderCustomActions}
                    renderCustomView={this.renderCustomView}
                />
                {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
                // prevent the keyboard hiding the text input on older android devices
                }                
            </View>
        );
    };
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    /* offlineInputWrapper: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'red',
    }, */
    offlineInput: {
        color: 'black',
        textAlign: 'center',
    },
})