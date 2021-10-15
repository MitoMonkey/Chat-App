import React from 'react';
import { View, Text, ScrollView, StyleSheet  } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'

export default class Chat extends React.Component {
    constructor() {
        super();
        this.state = {
            messages: [],
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
            ],
        })
    }

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
    }

    render() {
        // load the state of "name" in App.js as a prop into Chat component
        let { name, color } = this.props.route.params;

        // Show the name in the navigation bar
        this.props.navigation.setOptions({ title: name });
        /* React.useLayoutEffect(() => { // for a functional component
            navigation.setOptions({ title: name });
        }); */

        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={messages => this.onSend(messages)}
                user={{
                    _id: 1,
                }}
            />
        );
    };
}

/* const styles = StyleSheet.create({
    background: {
        backgroundColor: color,
    }
}) */