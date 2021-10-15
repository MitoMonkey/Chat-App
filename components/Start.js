import React, { Component } from 'react';
import { View, Text, Button, TextInput, StyleSheet, ImageBackground, Pressable } from 'react-native';

const colors = ['gray', 'teal', 'orange', 'cyan'];

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
                        <Text style={styles.heading_text}>CHATastic</Text>
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
                                    style={[styles.color, {backgroundColor: {col}}, styles[col], this.state.color === col ? styles.border : styles.noBorder]}
                                    key={col}
                                    onPress={() => { this.setState({ color: col }) }}>
                                    </Pressable>
                                ) }                                
                            </View>
                        </View>
                        <Button
                            title="Start chatting"
                            style={styles.button}
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
        maxWidth: 400
    },
    textInput: {
        height: 45, 
        width: '80%', 
        borderColor: 'gray', 
        borderWidth: 1,
        color: "black",
        padding: 1,
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
        borderColor: 'black',
    },
    border: {
        borderWidth: 2
    },
    noBorder: {
        borderWidth: 0
    },
    gray: {
        backgroundColor: 'gray'
    },
    teal: {
        backgroundColor: 'teal'
    },
    orange: {
        backgroundColor: 'orange'
    },
    cyan: {
        backgroundColor: 'cyan',
        borderColor: 'black',
        borderWidth: 1,
    },
    button: {
        flex: 1,
        width: '80%',
    }
});