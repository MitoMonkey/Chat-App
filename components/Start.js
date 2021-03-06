import React, { Component } from 'react';
import { View, Text, Button, TextInput, StyleSheet, ImageBackground, Pressable } from 'react-native';

const colors = ['gray', 'teal', 'orange', 'blue'];

export default class Start extends Component {
    constructor(props) {
        super(props);
        this.state = { name: '', color: '' };
    }

    render() {
        return (
            <View style={styles.main}>
                <ImageBackground source={require('./background.png')} resizeMode="cover" style={styles.background}>
                    <View style={styles.heading}>
                        <Text style={styles.heading_text}>CHATzam</Text>
                    </View>
                    <View style={styles.container}>
                            <TextInput
                                style={styles.textInput}
                                onChangeText={(name) => this.setState({ name })}
                                value={this.state.name}
                                placeholder='Enter your name'
                            />
                            <View style={styles.colorContainer}>
                                <Text style={styles.text}>Choose your background color</Text>
                                <View style={styles.colorPicker}>
                                    {colors.map((col) => <Pressable 
                                        style={[styles.color, {backgroundColor: col }, this.state.color === col ? styles.border : styles.noBorder]}
                                        key={col}
                                        onPress={() => { this.setState({ color: col }) }}
                                        accessible={true}
                                        accessibilityLabel={col}
                                        accessibilityHint="Choose your background color."
                                        accessibilityRole="button">
                                        </Pressable>
                                    ) }                                
                                </View>
                            </View>
                            <Button
                                title="Start chatting"
                                style={styles.button}
                                accessible={true}
                                accessibilityLabel="Start chatting"
                                accessibilityHint="Navigate to the Chat screen."
                                accessibilityRole="button"
                                onPress={() => this.props.navigation.navigate('Chat', { name: this.state.name, color: this.state.color })}
                            />
                    </View>                    
                </ImageBackground>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: "space-between",
        alignItems: 'center',
    },
    heading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading_text: {
        fontSize: 40,
        color: 'white',
        textAlign: 'center'
    },
    container: {
        width: '88%',
        height: '44%',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: 'white',
        margin: 30,
        maxWidth: 400,
        minHeight: 200
    },
    textInput: {
        height: 45, 
        width: '80%', 
        borderColor: 'gray', 
        borderWidth: 1,
        color: "black",
        padding: 1,
        paddingHorizontal: 2,
    },
    colorContainer: {
        flexDirection: 'column',
        width: '85%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorPicker: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
    },
    color: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 5,
        marginLeft: 5,
        borderColor: 'red',
    },
    border: {
        borderWidth: 4
    },
    noBorder: {
        borderWidth: 0
    },
});