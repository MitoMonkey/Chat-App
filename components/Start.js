import React, { Component } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';

export default class Start extends Component {
    constructor(props) {
        super(props);
        this.state = { name: '' };
    }
    render() {
        return (
            <View style={styles.container}>
                <Text>Welcome to the Chat App</Text>
                <TextInput
                    style={{ height: 40, width: 300, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={(name) => this.setState({ name })}
                    value={this.state.name}
                    placeholder='Enter your name to begin'
                />
                <Button
                    title="Start chatting"
                    onPress={() => this.props.navigation.navigate('Chat', { name: this.state.name })}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});