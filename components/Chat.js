import React from 'react';
import { View, Text, ScrollView, StyleSheet  } from 'react-native';

export default class Chat extends React.Component {

    render() {
        // load the state of "name" in App.js as a prop into Chat component
        let { name, color } = this.props.route.params;

        // Show the name in the navigation bar
        this.props.navigation.setOptions({ title: name });

        return (
            <View style={{backgroundcolor: color }}>
                {/* Rest of the UI */}
                <ScrollView>
                    <Text></Text>
                </ScrollView>
            </View>
        );
    };
}

/* const styles = StyleSheet.create({
    background: {
        backgroundcolor: color
    }
}) */