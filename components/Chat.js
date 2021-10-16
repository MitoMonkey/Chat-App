import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, KeyboardAvoidingView  } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'

export default class Chat extends React.Component {
    constructor() {
        super();
        this.state = {
            messages: [],
            user: '',
            background: ''
        }
    }
    
    componentDidMount() {
        // initialize with a mock message
        this.setState({
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
            /* user: this.props.route.params.name,
            background: this.props.route.params.color, */
        });
        
        // load the state of "name" in App.js as a prop into Chat component
        let { name, color } = this.props.route.params;
        // adjust the navigation bar
        this.props.navigation.setOptions({ title: name, headerStyle: { backgroundColor: color } });
    }

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }

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
                        _id: 1,
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